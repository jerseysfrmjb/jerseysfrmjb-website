import { ensureShopifySchema } from "../shopify/_schema.js";
import { json, sha256 } from "../shopify/_shared.js";

const PUBLIC_EVENTS = new Set(["AddToCart", "ViewCart", "InitiateCheckout"]);
const TRAFFIC_SOURCES = new Set(["Google", "Bing", "TikTok", "Instagram", "Facebook", "Pinterest", "Direct", "Other"]);

function clean(value, limit = 180) {
  return String(value || "").trim().slice(0, limit);
}

function validId(value) {
  const id = clean(value, 100);
  return /^[a-zA-Z0-9_-]{8,100}$/.test(id) ? id : "";
}

function sameSiteRequest(request) {
  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      return new URL(origin).hostname === new URL(request.url).hostname;
    } catch {
      return false;
    }
  }
  return ["same-origin", "same-site"].includes(request.headers.get("Sec-Fetch-Site") || "");
}

function productIds(body = {}) {
  return [...new Set([
    clean(body.product_id),
    ...(Array.isArray(body.product_ids) ? body.product_ids.map(value => clean(value)) : [])
  ].filter(Boolean))].slice(0, 100);
}

export async function onRequestPost({ request, env }) {
  if (!env?.DB) return json({ accepted: false }, 503);
  try {
    if (!sameSiteRequest(request)) return json({ error: "Cross-site commerce events are not allowed." }, 403);
    if (!request.headers.get("Content-Type")?.includes("application/json")) {
      return json({ error: "Expected JSON." }, 415);
    }
    if (/bot|crawler|spider|preview|headless|lighthouse/i.test(request.headers.get("User-Agent") || "")) {
      return json({ accepted: true }, 202);
    }
    const body = await request.json().catch(() => ({}));
    const eventType = clean(body.event_type, 40);
    if (!PUBLIC_EVENTS.has(eventType)) return json({ error: "Unsupported commerce event." }, 400);
    const visitorId = validId(body.visitor_id);
    const sessionId = validId(body.session_id);
    if (!visitorId || !sessionId) return json({ error: "Invalid commerce identifiers." }, 400);
    await ensureShopifySchema(env);
    const cartIdHash = body.cart_id ? await sha256(clean(body.cart_id, 500)) : "";
    const sessionIdHash = await sha256(sessionId);
    const products = productIds(body);
    const value = Number(body.value);
    await env.DB.prepare(`
      INSERT INTO shopify_commerce_events (
        event_type, visitor_id, session_id, session_id_hash, product_id, product_ids_json,
        cart_id_hash, traffic_source, value, currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'USD')
    `).bind(
      eventType,
      visitorId,
      sessionId,
      sessionIdHash,
      products[0] || "",
      JSON.stringify(products),
      cartIdHash,
      TRAFFIC_SOURCES.has(body.traffic_source) ? body.traffic_source : "Other",
      Number.isFinite(value) && value >= 0 ? value : null
    ).run();
    return json({ accepted: true }, 202);
  } catch {
    return json({ accepted: false }, 202);
  }
}
