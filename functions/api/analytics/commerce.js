import { ensureShopifySchema } from "../shopify/_schema.js";
import { json, sha256 } from "../shopify/_shared.js";

const PUBLIC_EVENTS = new Set(["AddToCart", "ViewCart", "InitiateCheckout"]);

function clean(value, limit = 180) {
  return String(value || "").trim().slice(0, limit);
}
export async function onRequestPost({ request, env }) {
  if (!env?.DB) return json({ accepted: false }, 503);
  try {
    const body = await request.json().catch(() => ({}));
    const eventType = clean(body.event_type, 40);
    if (!PUBLIC_EVENTS.has(eventType)) return json({ error: "Unsupported commerce event." }, 400);
    await ensureShopifySchema(env);
    const cartIdHash = body.cart_id ? await sha256(clean(body.cart_id, 500)) : "";
    const value = Number(body.value);
    await env.DB.prepare(`
      INSERT INTO shopify_commerce_events (
        event_type, visitor_id, session_id, product_id, cart_id_hash, value, currency
      ) VALUES (?, ?, ?, ?, ?, ?, 'USD')
    `).bind(
      eventType,
      clean(body.visitor_id, 100),
      clean(body.session_id, 100),
      clean(body.product_id),
      cartIdHash,
      Number.isFinite(value) && value >= 0 ? value : null
    ).run();
    return json({ accepted: true }, 202);
  } catch {
    return json({ accepted: false }, 202);
  }
}
