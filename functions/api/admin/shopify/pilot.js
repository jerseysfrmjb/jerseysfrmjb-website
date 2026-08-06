import { adminConfigError, isAuthorized, unauthorized } from "../_auth.js";
import { ensureShopifySchema } from "../../shopify/_schema.js";
import { json } from "../../shopify/_shared.js";

export async function onRequestPatch({ request, env }) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();
  try {
    await ensureShopifySchema(env);
    const body = await request.json().catch(() => ({}));
    const productId = String(body.product_id || "").trim();
    if (!productId) return json({ error: "Product ID is required." }, 400);
    const product = await env.DB.prepare("SELECT id FROM inventory WHERE id = ?").bind(productId).first();
    if (!product) return json({ error: "Product not found." }, 404);
    const enabled = body.enabled === true ? 1 : 0;
    await env.DB.prepare(`
      INSERT INTO shopify_product_mappings (product_id, pilot_enabled, sync_status)
      VALUES (?, ?, 'unmapped')
      ON CONFLICT(product_id) DO UPDATE SET
        pilot_enabled = excluded.pilot_enabled,
        updated_at = CURRENT_TIMESTAMP
    `).bind(productId, enabled).run();
    return json({ success: true, product_id: productId, pilot_enabled: Boolean(enabled) });
  } catch (error) {
    return json({ error: `Shopify pilot update error: ${error?.message || "Unknown error"}` }, 500);
  }
}
