CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  sizes_json TEXT NOT NULL DEFAULT '{}',
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  featured_order INTEGER NOT NULL DEFAULT 0,
  new_arrival INTEGER NOT NULL DEFAULT 0,
  date_added TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  photos TEXT NOT NULL DEFAULT '[]',
  links TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_category_stock ON inventory(category, quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_featured ON inventory(featured, quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_featured_order ON inventory(featured, featured_order);

CREATE TABLE IF NOT EXISTS product_platform_prices (
  product_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('Depop', 'eBay', 'Facebook', 'Website', 'Local', 'Other')),
  price REAL CHECK (price IS NULL OR price >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id, platform),
  FOREIGN KEY (product_id) REFERENCES inventory(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_platform_prices_product
  ON product_platform_prices(product_id);

CREATE TABLE IF NOT EXISTS ebay_feedback (
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
);

CREATE INDEX IF NOT EXISTS idx_ebay_feedback_public
  ON ebay_feedback(moderation_status, visibility_status, rating_type, feedback_date DESC);

CREATE INDEX IF NOT EXISTS idx_ebay_feedback_moderation
  ON ebay_feedback(moderation_status, feedback_date DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_feedback_public
  ON ebay_feedback(marketplace, moderation_status, visibility_status, feedback_date DESC);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('hide_sold_out_featured', 'false');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('inventory_updated_at', CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('homepage_banner_message', 'Small Drop, Big Drop Coming Soon
A small World Cup drop is available now. A bigger drop is coming soon. Fill out the contact form to request a jersey or DM @jerseysfrmjb with questions.');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('homepage_ticker_message', '🔥 SMALL DROP AVAILABLE NOW • BIG DROP COMING SOON • TAP NEED HELP TO REQUEST ❤️');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('homepage_stat_message', 'Small Drop Almost Sold Out');


CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  instagram_username TEXT NOT NULL,
  jersey_request TEXT NOT NULL,
  size TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status, created_at DESC);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT,
  product_name TEXT NOT NULL,
  player TEXT DEFAULT '',
  team_country TEXT DEFAULT '',
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  sale_price REAL,
  platform TEXT NOT NULL DEFAULT 'Other',
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  undone_at TEXT,
  inventory_restored INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES inventory(id)
);

CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_platform ON sales(platform, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_size ON sales(size, created_at DESC);

CREATE TABLE IF NOT EXISTS restock_presets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lines TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bulk_restock_runs (
  id TEXT PRIMARY KEY,
  changes_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  undone_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_bulk_restock_runs_created ON bulk_restock_runs(created_at DESC);

CREATE TABLE IF NOT EXISTS pinterest_connections (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL DEFAULT '',
  token_type TEXT NOT NULL DEFAULT 'bearer',
  scope TEXT NOT NULL DEFAULT '',
  access_expires_at INTEGER NOT NULL,
  refresh_expires_at INTEGER,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  connected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'product_view', 'marketplace_click', 'search', 'engagement')),
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  page_path TEXT NOT NULL DEFAULT '/',
  page_title TEXT NOT NULL DEFAULT '',
  product_id TEXT NOT NULL DEFAULT '',
  marketplace TEXT NOT NULL DEFAULT '',
  search_query TEXT NOT NULL DEFAULT '',
  search_results INTEGER,
  traffic_source TEXT NOT NULL DEFAULT 'Direct',
  country TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  device_type TEXT NOT NULL DEFAULT 'Unknown',
  browser TEXT NOT NULL DEFAULT 'Other',
  duration_seconds INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_time ON analytics_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_time ON analytics_events(event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product_time ON analytics_events(product_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_source_time ON analytics_events(traffic_source, occurred_at DESC);

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
