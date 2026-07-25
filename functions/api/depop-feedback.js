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
    star_rating: Number(row.star_rating || 5),
    listing_title: row.listing_title,
    feedback_date: row.feedback_date,
    buyer_display_name: "Verified Depop Buyer"
  };
}

export async function onRequestGet({ env }) {
  try {
    if (!env.DB) return json({ error: "Feedback database is not connected yet." }, 503);
    await ensureEbayFeedback(env);

    const result = await env.DB.prepare(`
      SELECT feedback_id, comment, rating_type, star_rating, listing_title, feedback_date
      FROM ebay_feedback
      WHERE marketplace = 'depop'
        AND moderation_status = 'approved'
        AND visibility_status = 'active'
        AND rating_type = 'POSITIVE'
      ORDER BY created_at DESC
      LIMIT 50
    `).all();

    return json({ feedback: (result.results || []).map(publicFeedback) });
  } catch (error) {
    return json({ error: `Feedback server error: ${error?.message || "Unknown error"}` }, 500);
  }
}
