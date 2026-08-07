import { adminConfigError, isAuthorized, unauthorized } from "../_auth.js";
import { ensureShopifySchema } from "../../shopify/_schema.js";
import { json, shopifyConfiguration, shopifyGraphql } from "../../shopify/_shared.js";
import {
  buildShopifyProduct,
  discoverShopifyPublication,
  loadShopifySyncRows,
  publishShopifyProduct,
  suggestedPilotProducts
} from "../../shopify/_products.js";

const ACTIVATE_PRODUCT_MUTATION = `
  mutation ActivateJerseysFrmJBProduct($input: ProductInput!) {
    productUpdate(input: $input) {
      product { id status }
      userErrors { field message }
    }
  }
`;

async function ensurePilotPublished(env, productId) {
  const mapping = await env.DB.prepare(`
    SELECT shopify_product_id FROM shopify_product_mappings
    WHERE product_id = ? AND pilot_enabled = 1 AND shopify_product_id <> ''
  `).bind(productId).first();
  if (!mapping?.shopify_product_id) return null;

  const data = await shopifyGraphql(env, "admin", ACTIVATE_PRODUCT_MUTATION, {
    input: { id: mapping.shopify_product_id, status: "ACTIVE" }
  });
  const errors = data.productUpdate?.userErrors || [];
  if (errors.length) throw new Error(errors.map(error => error.message).join("; "));

  const publicationId = await discoverShopifyPublication(env);
  if (!publicationId) throw new Error("No Shopify storefront publication is configured.");
  await publishShopifyProduct(env, mapping.shopify_product_id, publicationId);
  return { product_id: productId, shopify_product_id: mapping.shopify_product_id };
}

export async function onRequestGet({ request, env }) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();
  try {
    await ensureShopifySchema(env);
    const configuration = shopifyConfiguration(env);
    const rows = await loadShopifySyncRows(env);
    const publicationWarnings = [];
    if (configuration.sync && configuration.adminConfigured && configuration.publicationConfigured) {
      for (const row of rows.filter(item => Number(item.pilot_enabled) === 1 && item.shopify_product_id)) {
        try {
          await ensurePilotPublished(env, row.id);
        } catch (error) {
          publicationWarnings.push(`${row.id}: ${error?.message || "Pilot publication check failed"}`);
        }
      }
    }
    const products = rows.map(row => buildShopifyProduct(row));
    const totalVariants = products.reduce((total, product) => total + product.variants.length, 0);
    const mappedVariants = Number((await env.DB.prepare("SELECT COUNT(*) AS total FROM shopify_variant_mappings WHERE shopify_variant_id <> ''").first())?.total || 0);
    const counts = {
      total_products: products.length,
      mapped_products: products.filter(product => product.shopifyProductId).length,
      unmapped_products: products.filter(product => !product.shopifyProductId).length,
      total_variants: totalVariants,
      mapped_variants: mappedVariants,
      unmapped_variants: Math.max(0, totalVariants - mappedVariants),
      inventory_mismatches: Number((await env.DB.prepare(`
        SELECT COUNT(*) AS total
        FROM shopify_variant_mappings AS mappings
        JOIN inventory ON inventory.id = mappings.product_id
        WHERE mappings.sync_status = 'needs_review'
          OR mappings.last_error <> ''
          OR mappings.shopify_inventory_quantity <> CAST(COALESCE(json_extract(COALESCE(NULLIF(inventory.sizes_json, ''), '{}'), '$.' || mappings.size), 0) AS INTEGER)
      `).first())?.total || 0)
    };
    const lastRun = await env.DB.prepare(`
      SELECT * FROM shopify_sync_runs
      WHERE mode = 'apply' AND status = 'completed'
      ORDER BY COALESCE(completed_at, started_at) DESC
      LIMIT 1
    `).first();
    const recentOrders = await env.DB.prepare(`
      SELECT shopify_order_id, order_number, payment_status, fulfillment_status,
        currency, subtotal, discounts, shipping, tax, refund_total, refund_status,
        cancelled_at, paid_at, created_at, updated_at
      FROM shopify_orders ORDER BY updated_at DESC LIMIT 12
    `).all();
    const failedEvents = await env.DB.prepare(`
      SELECT event_id, topic, shop_domain, shopify_order_id, status, attempts, error, received_at, updated_at
      FROM shopify_webhook_events WHERE status = 'failed' ORDER BY updated_at DESC LIMIT 12
    `).all();
    return json({
      configuration: {
        store_domain: configuration.storeDomain,
        api_version: configuration.apiVersion,
        sync_enabled: configuration.sync,
        checkout_enabled: configuration.checkout,
        admin_configured: configuration.adminConfigured,
        admin_auth_mode: configuration.adminAuthMode,
        storefront_configured: configuration.storefrontConfigured,
        webhook_configured: configuration.webhookConfigured,
        location_configured: configuration.locationConfigured,
        publication_configured: configuration.publicationConfigured
      },
      counts,
      last_run: lastRun || null,
      suggested_pilot_products: suggestedPilotProducts(products),
      products: products.map(product => ({
        id: product.id,
        title: product.title,
        mapped: Boolean(product.shopifyProductId),
        pilot_enabled: product.pilotEnabled,
        sync_status: rows.find(row => row.id === product.id)?.sync_status || "unmapped",
        last_synced_at: rows.find(row => row.id === product.id)?.last_synced_at || null,
        missing: product.missing,
        variants: product.variants.map(variant => ({ size: variant.size, quantity: variant.quantity, sku: variant.sku })),
        website_price: product.websitePrice,
        shopify_admin_url: configuration.storeDomain && product.shopifyProductId
          ? `https://${configuration.storeDomain}/admin/products/${product.shopifyProductId.match(/(\d+)$/)?.[1] || ""}`
          : ""
      })),
      recent_orders: recentOrders.results || [],
      failed_events: failedEvents.results || [],
      pilot_publication_warnings: publicationWarnings
    });
  } catch (error) {
    return json({ error: `Shopify status error: ${error?.message || "Unknown error"}` }, 500);
  }
}
