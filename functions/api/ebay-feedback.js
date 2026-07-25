import { ensureEbayFeedback } from "./_ebayFeedback.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate"
    }
  });
}

function publicFeedback(row) {
  return {
    feedback_id: row.feedback_id,
    comment: row.comment,
    rating_type: row.rating_type,
    listing_title: row.listing_title,
    item_id: row.item_id,
    feedback_date: row.feedback_date,
    buyer_display_name: "Verified eBay Buyer"
  };
}

export async function onRequestGet({ env }) {
  try {
    if (!env.DB) return json({ error: "Feedback database is not connected yet." }, 503);
    await ensureEbayFeedback(env);

    const result = await env.DB.prepare(`
      SELECT feedback_id, comment, rating_type, listing_title, item_id, feedback_date
      FROM ebay_feedback
      WHERE moderation_status = 'approved'
        AND visibility_status = 'active'
        AND rating_type = 'POSITIVE'
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
      LIMIT 24
    `).all();

    return json({ feedback: (result.results || []).map(publicFeedback) });
  } catch (error) {
    return json({ error: `Feedback server error: ${error?.message || "Unknown error"}` }, 500);
  }
}
