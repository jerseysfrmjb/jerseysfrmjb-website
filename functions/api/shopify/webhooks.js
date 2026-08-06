import { ensureShopifySchema } from "./_schema.js";
import { json, sanitizeWebhookPayload, verifyShopifyWebhook } from "./_shared.js";
import { processSanitizedWebhook, webhookEventId } from "./_webhooks.js";

export async function onRequestPost({ request, env }) {
  if (!env?.DB || !env.SHOPIFY_WEBHOOK_SECRET) return json({ error: "Webhook receiver is not configured." }, 503);
  const rawBody = await request.arrayBuffer();
  const hmac = request.headers.get("X-Shopify-Hmac-Sha256") || "";
  if (!(await verifyShopifyWebhook(rawBody, hmac, env.SHOPIFY_WEBHOOK_SECRET))) {
    return json({ error: "Invalid Shopify signature." }, 401);
  }
  await ensureShopifySchema(env);
  const topic = String(request.headers.get("X-Shopify-Topic") || "").toLowerCase();
  const shop = String(request.headers.get("X-Shopify-Shop-Domain") || "").toLowerCase();
  const eventId = await webhookEventId(rawBody, request.headers.get("X-Shopify-Webhook-Id"), topic);
  const existing = await env.DB.prepare("SELECT status FROM shopify_webhook_events WHERE event_id = ?").bind(eventId).first();
  if (existing?.status === "processed") return json({ accepted: true, duplicate: true });
  let payload;
  try {
    payload = sanitizeWebhookPayload(JSON.parse(new TextDecoder().decode(rawBody)));
  } catch {
    return json({ error: "Invalid webhook JSON." }, 400);
  }
  await env.DB.prepare(`
    INSERT INTO shopify_webhook_events (event_id, topic, shop_domain, shopify_order_id, status, attempts, payload_json)
    VALUES (?, ?, ?, ?, 'received', 0, ?)
    ON CONFLICT(event_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
  `).bind(eventId, topic, shop, payload.order_id || payload.id, JSON.stringify(payload)).run();
  try {
    const result = await processSanitizedWebhook(env, topic, payload);
    await env.DB.prepare(`
      UPDATE shopify_webhook_events SET status = 'processed', attempts = attempts + 1,
        error = '', processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE event_id = ?
    `).bind(eventId).run();
    return json({ accepted: true, ...result });
  } catch (error) {
    await env.DB.prepare(`
      UPDATE shopify_webhook_events SET status = 'failed', attempts = attempts + 1,
        error = ?, updated_at = CURRENT_TIMESTAMP WHERE event_id = ?
    `).bind(String(error?.message || "Webhook processing failed").slice(0, 800), eventId).run();
    return json({ error: "Webhook accepted but requires admin review." }, 500);
  }
}
