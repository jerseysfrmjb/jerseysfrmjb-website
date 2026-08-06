import { adminConfigError, isAuthorized, unauthorized } from "../_auth.js";
import { ensureShopifySchema } from "../../shopify/_schema.js";
import { json, shopifyConfiguration } from "../../shopify/_shared.js";
import {
  applyShopifyProduct,
  buildShopifyProduct,
  loadShopifySyncRows,
  previewAction,
  safeProductSummary,
  shopifyPayloadHash
} from "../../shopify/_products.js";

async function saveRun(env, runId, mode, scope, items, status = "completed") {
  const created = items.filter(item => item.status === "created").length;
  const updated = items.filter(item => item.status === "updated").length;
  const unchanged = items.filter(item => item.status === "unchanged").length;
  const failed = items.filter(item => ["failed", "missing_information", "needs_review"].includes(item.status)).length;
  await env.DB.prepare(`
    INSERT INTO shopify_sync_runs (
      id, mode, scope, status, product_count, created_count, updated_count,
      unchanged_count, failed_count, summary_json, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    runId, mode, scope, status, items.length, created, updated, unchanged, failed,
    JSON.stringify({ created, updated, unchanged, failed })
  ).run();
  for (const item of items) {
    await env.DB.prepare(`
      INSERT INTO shopify_sync_items (run_id, product_id, action, status, details_json, error)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(runId, item.product_id, item.action, item.status, JSON.stringify(item), item.error || "").run();
  }
}

async function persistMapping(env, product, result, status) {
  await env.DB.prepare(`
    INSERT INTO shopify_product_mappings (
      product_id, shopify_product_id, shopify_handle, sync_status,
      last_payload_hash, last_error, last_synced_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(product_id) DO UPDATE SET
      shopify_product_id = excluded.shopify_product_id,
      shopify_handle = excluded.shopify_handle,
      sync_status = excluded.sync_status,
      last_payload_hash = excluded.last_payload_hash,
      last_error = '',
      last_synced_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  `).bind(product.id, result.product.id, result.product.handle || "", status, result.payloadHash).run();

  const returnedVariants = result.product.variants?.nodes || [];
  for (const variant of product.variants) {
    const shopifyVariant = returnedVariants.find(item => String(item.sku || "") === variant.sku);
    if (!shopifyVariant?.id) throw new Error(`Shopify did not return variant ${variant.sku}.`);
    await env.DB.prepare(`
      INSERT INTO shopify_variant_mappings (
        product_id, size, sku, shopify_variant_id, shopify_inventory_item_id,
        shopify_inventory_quantity, sync_status, last_error, last_synced_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(product_id, size) DO UPDATE SET
        sku = excluded.sku,
        shopify_variant_id = excluded.shopify_variant_id,
        shopify_inventory_item_id = excluded.shopify_inventory_item_id,
        shopify_inventory_quantity = excluded.shopify_inventory_quantity,
        sync_status = excluded.sync_status,
        last_error = '',
        last_synced_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      product.id,
      variant.size,
      variant.sku,
      shopifyVariant.id,
      shopifyVariant.inventoryItem?.id || "",
      variant.quantity,
      status
    ).run();
  }
}

async function markFailure(env, productId, error) {
  await env.DB.prepare(`
    INSERT INTO shopify_product_mappings (product_id, sync_status, last_error)
    VALUES (?, 'failed', ?)
    ON CONFLICT(product_id) DO UPDATE SET
      sync_status = 'failed', last_error = excluded.last_error, updated_at = CURRENT_TIMESTAMP
  `).bind(productId, String(error || "Unknown Shopify error").slice(0, 600)).run();
}

export async function onRequestPost({ request, env }) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();
  try {
    await ensureShopifySchema(env);
    const body = await request.json().catch(() => ({}));
    const dryRun = body.dry_run !== false;
    const scope = body.scope === "all" ? "all" : body.scope === "retry" ? "retry" : "selected";
    const productIds = Array.isArray(body.product_ids) ? body.product_ids.map(String).filter(Boolean) : [];
    if (scope !== "all" && !productIds.length) return json({ error: "Select at least one product." }, 400);
    if (scope === "all" && body.confirm_all !== true) return json({ error: "Sync all requires explicit confirmation." }, 400);
    const configuration = shopifyConfiguration(env);
    if (!dryRun && !configuration.sync) return json({ error: "SHOPIFY_SYNC_ENABLED is off. Preview remains available." }, 409);
    if (!dryRun && !configuration.adminConfigured) return json({ error: "Shopify Admin API credentials are incomplete." }, 503);
    const rows = await loadShopifySyncRows(env, scope === "all" ? [] : productIds);
    const products = rows.map(row => buildShopifyProduct(row));
    const runId = crypto.randomUUID();
    const items = [];
    for (const product of products) {
      const payloadHash = await shopifyPayloadHash(product);
      const preview = previewAction(product, payloadHash);
      if (dryRun || preview.status === "missing_information" || preview.status === "unchanged") {
        items.push({ ...safeProductSummary(product, preview.action, preview.status), error: "" });
        continue;
      }
      try {
        const result = await applyShopifyProduct(env, product);
        const status = product.shopifyProductId ? "updated" : "created";
        await persistMapping(env, product, result, status);
        items.push({ ...safeProductSummary(product, status === "created" ? "create" : "update", status), error: "" });
      } catch (error) {
        await markFailure(env, product.id, error?.message);
        items.push({ ...safeProductSummary(product, "failed", "failed"), error: String(error?.message || "Unknown Shopify error") });
      }
    }
    const hasFailures = items.some(item => ["failed", "missing_information", "needs_review"].includes(item.status));
    await saveRun(env, runId, dryRun ? "preview" : "apply", scope, items, hasFailures ? "partial" : "completed");
    return json({
      run_id: runId,
      dry_run: dryRun,
      scope,
      items,
      summary: {
        created: items.filter(item => item.status === "created").length,
        updated: items.filter(item => item.status === "updated").length,
        unchanged: items.filter(item => item.status === "unchanged").length,
        needs_review: items.filter(item => ["missing_information", "needs_review"].includes(item.status)).length,
        failed: items.filter(item => item.status === "failed").length
      }
    });
  } catch (error) {
    return json({ error: `Shopify sync error: ${error?.message || "Unknown error"}` }, 500);
  }
}
