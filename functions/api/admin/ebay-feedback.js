import { ensureEbayFeedback } from "../_ebayFeedback.js";
import { adminConfigError, isAuthorized, json, unauthorized } from "./_auth.js";

const MODERATION_STATUSES = new Set(["pending", "approved", "rejected"]);
const VISIBILITY_STATUSES = new Set(["active", "hidden"]);
const DEVELOPMENT_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const SAMPLE_FEEDBACK_ID = "dev-sample-ebay-feedback";
const IMPORT_LIMIT = 100;

function normalizeFeedback(row) {
  return {
    feedback_id: row.feedback_id,
    marketplace: row.marketplace || "ebay",
    comment: row.comment,
    rating_type: row.rating_type,
    star_rating: Number(row.star_rating || 5),
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
    ORDER BY
      CASE feedback_date
        WHEN 'Past month' THEN 0
        WHEN 'Past 6 months' THEN 1
        WHEN 'Past year' THEN 2
        WHEN 'More than a year ago' THEN 3
        ELSE 0
      END,
      CASE WHEN feedback_date GLOB '????-??-??*' THEN feedback_date ELSE NULL END DESC,
      created_at DESC
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

function cleanImportedText(value, maxLength) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

async function importedFeedbackId(record) {
  const sourceParts = [
    cleanImportedText(record.item_id, 80),
    cleanImportedText(record.listing_title, 500),
    cleanImportedText(record.comment, 2000),
    cleanImportedText(record.source_reference, 160)
  ];
  if (cleanImportedText(record.marketplace, 20).toLowerCase() !== "ebay") {
    sourceParts.unshift(cleanImportedText(record.marketplace, 20));
  }
  const source = sourceParts.map(value => value.toLowerCase()).join("|");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
  const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
  return `manual-${hash.slice(0, 24)}`;
}

async function importFeedbackRecords(env, records) {
  if (!records.length) return { imported: 0, duplicates: 0 };
  if (records.length > IMPORT_LIMIT) throw new Error(`Paste no more than ${IMPORT_LIMIT} feedback entries at once.`);

  const normalized = [];
  for (const record of records) {
    const comment = cleanImportedText(record.comment, 2000);
    const marketplace = cleanImportedText(record.marketplace || "ebay", 20).toLowerCase();
    const listingTitle = cleanImportedText(record.listing_title, 500);
    const itemId = cleanImportedText(record.item_id, 80);
    const feedbackDate = cleanImportedText(record.feedback_date, 80);
    const sourceReference = cleanImportedText(record.source_reference, 160);
    const starRating = Math.min(5, Math.max(1, Math.floor(Number(record.star_rating || 5))));
    const ratingType = cleanImportedText(
      record.rating_type || (starRating >= 4 ? "POSITIVE" : starRating === 3 ? "NEUTRAL" : "NEGATIVE"),
      20
    ).toUpperCase();

    if (!comment || !listingTitle || !itemId || !feedbackDate) continue;
    if (!["ebay", "depop"].includes(marketplace)) continue;
    if (!["POSITIVE", "NEUTRAL", "NEGATIVE"].includes(ratingType)) continue;
    normalized.push({
      feedbackId: await importedFeedbackId({
        marketplace,
        comment,
        listing_title: listingTitle,
        item_id: itemId,
        source_reference: sourceReference
      }),
      marketplace,
      comment,
      listingTitle,
      itemId,
      feedbackDate,
      ratingType,
      starRating
    });
  }

  if (!normalized.length) throw new Error("No complete marketplace feedback entries were found.");
  const results = await env.DB.batch(normalized.map(record => env.DB.prepare(`
    INSERT OR IGNORE INTO ebay_feedback (
      feedback_id,
      marketplace,
      comment,
      rating_type,
      star_rating,
      listing_title,
      item_id,
      feedback_date,
      buyer_display_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
  `).bind(
    record.feedbackId,
    record.marketplace,
    record.comment,
    record.ratingType,
    record.starRating,
    record.listingTitle,
    record.itemId,
    record.feedbackDate
  )));
  const imported = results.reduce((sum, result) => sum + Number(result?.meta?.changes || 0), 0);
  return { imported, duplicates: normalized.length - imported };
}

export async function onRequestGet({ request, env }) {
  try {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;
    return json(await loadFeedback(env));
  } catch (error) {
    return json({ error: `Marketplace feedback server error: ${error?.message || "Unknown error"}` }, 500);
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
    return json({ error: `Marketplace feedback update error: ${error?.message || "Unknown error"}` }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;
    const body = await request.json().catch(() => ({}));
    if (Array.isArray(body.records)) {
      const result = await importFeedbackRecords(env, body.records);
      return json({ ...(await loadFeedback(env)), ...result }, result.imported ? 201 : 200);
    }

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
        marketplace,
        comment,
        rating_type,
        star_rating,
        listing_title,
        item_id,
        feedback_date,
        buyer_display_name
      ) VALUES (?, 'ebay', ?, 'POSITIVE', 5, ?, ?, CURRENT_TIMESTAMP, ?)
    `).bind(
      SAMPLE_FEEDBACK_ID,
      "Great jersey, fast shipping, and exactly as described.",
      "Development Sample Jersey",
      "dev-sample-item",
      "sample_buyer"
    ).run();

    return json({ ...(await loadFeedback(env)), sample_created: true }, 201);
  } catch (error) {
    return json({ error: `Marketplace feedback import error: ${error?.message || "Unknown error"}` }, 500);
  }
}
