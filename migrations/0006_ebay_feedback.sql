CREATE TABLE IF NOT EXISTS ebay_feedback (
  feedback_id TEXT PRIMARY KEY,
  comment TEXT NOT NULL,
  rating_type TEXT NOT NULL CHECK (rating_type IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE')),
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
);

CREATE INDEX IF NOT EXISTS idx_ebay_feedback_public
  ON ebay_feedback(moderation_status, visibility_status, rating_type, feedback_date DESC);

CREATE INDEX IF NOT EXISTS idx_ebay_feedback_moderation
  ON ebay_feedback(moderation_status, feedback_date DESC);
