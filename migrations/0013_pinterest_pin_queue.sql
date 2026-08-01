CREATE TABLE IF NOT EXISTS pinterest_pin_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  board_id TEXT NOT NULL,
  board_name TEXT NOT NULL DEFAULT '',
  photo_index INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  product_url TEXT NOT NULL,
  dedupe_key TEXT NOT NULL,
  allow_duplicate INTEGER NOT NULL DEFAULT 0 CHECK (allow_duplicate IN (0, 1)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed')),
  environment TEXT NOT NULL DEFAULT 'trial' CHECK (environment IN ('trial', 'standard')),
  pinterest_pin_id TEXT NOT NULL DEFAULT '',
  pinterest_url TEXT NOT NULL DEFAULT '',
  publish_error TEXT NOT NULL DEFAULT '',
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT,
  FOREIGN KEY (product_id) REFERENCES inventory(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pinterest_pin_queue_dedupe
  ON pinterest_pin_queue(dedupe_key)
  WHERE allow_duplicate = 0;

CREATE INDEX IF NOT EXISTS idx_pinterest_pin_queue_status_created
  ON pinterest_pin_queue(status, created_at DESC);
