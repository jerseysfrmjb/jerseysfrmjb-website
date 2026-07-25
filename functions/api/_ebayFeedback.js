export async function ensureEbayFeedback(env) {
  if (!env.DB) throw new Error("D1 binding missing");

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ebay_feedback (
    feedback_id TEXT PRIMARY KEY,
    marketplace TEXT NOT NULL DEFAULT 'ebay',
    comment TEXT NOT NULL,
    rating_type TEXT NOT NULL CHECK (rating_type IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE')),
    star_rating INTEGER NOT NULL DEFAULT 5,
    listing_title TEXT NOT NULL DEFAULT '',
    item_id TEXT NOT NULL DEFAULT '',
    feedback_date TEXT NOT NULL,
    buyer_display_name TEXT,
    moderation_status TEXT NOT NULL DEFAULT 'pending'
      CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    visibility_status TEXT NOT NULL DEFAULT 'active'
      CHECK (visibility_status IN ('active', 'hidden')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();

  const columns = await env.DB.prepare("PRAGMA table_info(ebay_feedback)").all();
  const columnNames = new Set((columns.results || []).map(column => column.name));
  if (!columnNames.has("marketplace")) {
    try {
      await env.DB.prepare("ALTER TABLE ebay_feedback ADD COLUMN marketplace TEXT NOT NULL DEFAULT 'ebay'").run();
    } catch (error) {
      if (!/duplicate column/i.test(String(error?.message || error))) throw error;
    }
  }
  if (!columnNames.has("star_rating")) {
    try {
      await env.DB.prepare("ALTER TABLE ebay_feedback ADD COLUMN star_rating INTEGER NOT NULL DEFAULT 5").run();
    } catch (error) {
      if (!/duplicate column/i.test(String(error?.message || error))) throw error;
    }
  }

  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_ebay_feedback_public
    ON ebay_feedback(moderation_status, visibility_status, rating_type, feedback_date DESC)`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_ebay_feedback_moderation
    ON ebay_feedback(moderation_status, feedback_date DESC)`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_marketplace_feedback_public
    ON ebay_feedback(marketplace, moderation_status, visibility_status, feedback_date DESC)`).run();
}
