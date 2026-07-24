import { ensureEbayFeedback } from "../_ebayFeedback.js";
import { adminConfigError, isAuthorized, json, unauthorized } from "./_auth.js";

const MODERATION_STATUSES = new Set(["pending", "approved", "rejected"]);
const VISIBILITY_STATUSES = new Set(["active", "hidden"]);
const DEVELOPMENT_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const SAMPLE_FEEDBACK_ID = "dev-sample-ebay-feedback";

function normalizeFeedback(row) {
  return {
    feedback_id: row.feedback_id,
    comment: row.comment,
    rating_type: row.rating_type,
    listing_title: row.listing_title,
    item_id: row.item_id,
    feedback_date: row.feedback_date,
    buyer_display_name: row.buyer_display_name || null,
    moderation_status: row.moderation_status,
    visibility_status: row.visibility_status,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function requireAdmin(request, env) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();
  await ensureEbayFeedback(env);
  return null;
}

async function loadFeedback(env) {
  const result = await env.DB.prepare(`
    SELECT *
    FROM ebay_feedback
    ORDER BY feedback_date DESC, created_at DESC
    LIMIT 250
  `).all();
  const feedback = (result.results || []).map(normalizeFeedback);
  return {
    feedback,
    counts: {
      pending: feedback.filter(item => item.moderation_status === "pending").length,
      approved: feedback.filter(item => item.moderation_status === "approved").length,
      rejected: feedback.filter(item => item.moderation_status === "rejected").length,
      hidden: feedback.filter(item => item.visibility_status === "hidden").length
    }
  };
}

function isDevelopmentRequest(request) {
  return DEVELOPMENT_HOSTS.has(new URL(request.url).hostname);
}

export async function onRequestGet({ request, env }) {
  try {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;
    return json(await loadFeedback(env));
  } catch (error) {
    return json({ error: `eBay feedback server error: ${error?.message || "Unknown error"}` }, 500);
  }
}

export async function onRequestPatch({ request, env }) {
  try {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;

    const body = await request.json().catch(() => ({}));
    const feedbackId = String(body.feedback_id || "").trim();
    const moderationStatus = body.moderation_status === undefined ? null : String(body.moderation_status);
    const visibilityStatus = body.visibility_status === undefined ? null : String(body.visibility_status);

    if (!feedbackId) return json({ error: "Missing feedback ID." }, 400);
    if (moderationStatus === null && visibilityStatus === null) {
      return json({ error: "Choose a moderation or visibility update." }, 400);
    }
    if (moderationStatus !== null && !MODERATION_STATUSES.has(moderationStatus)) {
      return json({ error: "Invalid moderation status." }, 400);
    }
    if (visibilityStatus !== null && !VISIBILITY_STATUSES.has(visibilityStatus)) {
      return json({ error: "Invalid visibility status." }, 400);
    }

    const existing = await env.DB.prepare("SELECT feedback_id FROM ebay_feedback WHERE feedback_id = ?")
      .bind(feedbackId)
      .first();
    if (!existing) return json({ error: "Feedback record not found." }, 404);

    await env.DB.prepare(`
      UPDATE ebay_feedback
      SET moderation_status = COALESCE(?, moderation_status),
          visibility_status = COALESCE(?, visibility_status),
          updated_at = CURRENT_TIMESTAMP
      WHERE feedback_id = ?
    `).bind(moderationStatus, visibilityStatus, feedbackId).run();

    return json(await loadFeedback(env));
  } catch (error) {
    return json({ error: `eBay feedback update error: ${error?.message || "Unknown error"}` }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;
    if (!isDevelopmentRequest(request)) {
      return json({ error: "Sample feedback can only be added from a local development site." }, 403);
    }

    const existing = await env.DB.prepare("SELECT feedback_id FROM ebay_feedback WHERE feedback_id = ?")
      .bind(SAMPLE_FEEDBACK_ID)
      .first();
    if (existing) {
      return json({ ...(await loadFeedback(env)), sample_created: false });
    }

    await env.DB.prepare(`
      INSERT INTO ebay_feedback (
        feedback_id,
        comment,
        rating_type,
        listing_title,
        item_id,
        feedback_date,
        buyer_display_name
      ) VALUES (?, ?, 'POSITIVE', ?, ?, CURRENT_TIMESTAMP, ?)
    `).bind(
      SAMPLE_FEEDBACK_ID,
      "Great jersey, fast shipping, and exactly as described.",
      "Development Sample Jersey",
      "dev-sample-item",
      "sample_buyer"
    ).run();

    return json({ ...(await loadFeedback(env)), sample_created: true }, 201);
  } catch (error) {
    return json({ error: `Sample feedback error: ${error?.message || "Unknown error"}` }, 500);
  }
}
