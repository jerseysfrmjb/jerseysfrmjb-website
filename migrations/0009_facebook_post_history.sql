CREATE TABLE IF NOT EXISTS facebook_post_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_ids TEXT NOT NULL,
  product_names TEXT NOT NULL,
  caption TEXT NOT NULL,
  photo_urls TEXT NOT NULL DEFAULT '[]',
  content_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'posted')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  posted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_facebook_post_history_status_created
  ON facebook_post_history(status, created_at DESC);
