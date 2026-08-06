import { adminConfigError, isAuthorized, unauthorized } from "../_auth.js";
import { ensureShopifySchema } from "../../shopify/_schema.js";
import { json } from "../../shopify/_shared.js";
import { processSanitizedWebhook } from "../../shopify/_webhooks.js";

export async function onRequestPost({ request, env }) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();
  await ensureShopifySchema(env);
  const body = await request.json().catch(() => ({}));
  const eventId = String(body.event_id || "").trim();
  if (!eventId) return json({ error: "Webhook event ID is required." }, 400);
  const event = await env.DB.prepare("SELECT * FROM shopify_webhook_events WHERE event_id = ?").bind(eventId).first();
  if (!event) return json({ error: "Webhook event not found." }, 404);
  try {
    const result = await processSanitizedWebhook(env, event.topic, JSON.parse(event.payload_json || "{}"));
    await env.DB.prepare(`UPDATE shopify_webhook_events SET status = 'processed', attempts = attempts + 1, error = '', processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE event_id = ?`).bind(eventId).run();
    return json({ success: true, ...result });
  } catch (error) {
    await env.DB.prepare(`UPDATE shopify_webhook_events SET status = 'failed', attempts = attempts + 1, error = ?, updated_at = CURRENT_TIMESTAMP WHERE event_id = ?`).bind(String(error?.message || "Retry failed").slice(0, 800), eventId).run();
    return json({ error: String(error?.message || "Retry failed") }, 409);
  }
}
