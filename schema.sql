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
A small World Cup drop is available now. A bigger drop is coming soon. DM @jerseysfrmjb for quick questions, or use Message or Request for a detailed jersey request.');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('homepage_ticker_message', '🔥 SMALL DROP AVAILABLE NOW • BIG DROP COMING SOON • DM @JERSEYSFRMJB OR TAP MESSAGE OR REQUEST ❤️');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('homepage_stat_message', 'Small Drop Almost Sold Out');


CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  instagram_username TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  contact_preference TEXT NOT NULL DEFAULT 'instagram',
  request_type TEXT NOT NULL DEFAULT 'jersey_request',
  jersey_request TEXT NOT NULL,
  size TEXT NOT NULL DEFAULT '',
  marketplace_preference TEXT NOT NULL DEFAULT '',
  product_id TEXT NOT NULL DEFAULT '',
  product_name TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT NOT NULL DEFAULT '',
  contacted_at TEXT,
  resolved_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status, created_at DESC);

CREATE TABLE IF NOT EXISTS contact_message_products (
  message_id INTEGER NOT NULL,
  product_id TEXT NOT NULL DEFAULT '',
  product_name TEXT NOT NULL DEFAULT '',
  requested_size TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id, product_id, product_name),
  FOREIGN KEY (message_id) REFERENCES contact_messages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_contact_message_products_product ON contact_message_products(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_message_products_message ON contact_message_products(message_id);

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
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  local_day TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  utm_content TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_time ON analytics_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_time ON analytics_events(event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product_time ON analytics_events(product_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_source_time ON analytics_events(traffic_source, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_local_day ON analytics_events(local_day, event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_campaign ON analytics_events(utm_campaign, utm_content, occurred_at DESC);

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
  posted_at TEXT,
  facebook_post_id TEXT NOT NULL DEFAULT '',
  facebook_post_url TEXT NOT NULL DEFAULT '',
  publish_method TEXT NOT NULL DEFAULT '',
  publish_error TEXT NOT NULL DEFAULT '',
  campaign TEXT NOT NULL DEFAULT 'new_arrivals'
);

CREATE INDEX IF NOT EXISTS idx_facebook_post_history_status_created
  ON facebook_post_history(status, created_at DESC);

CREATE TABLE IF NOT EXISTS facebook_connections (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  user_access_token_encrypted TEXT NOT NULL,
  page_access_token_encrypted TEXT NOT NULL DEFAULT '',
  page_id TEXT NOT NULL DEFAULT '',
  page_name TEXT NOT NULL DEFAULT '',
  scope TEXT NOT NULL DEFAULT '',
  user_expires_at INTEGER,
  connected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  area TEXT NOT NULL,
  entity_id TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  status_code INTEGER NOT NULL DEFAULT 200,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created
  ON admin_activity_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_area_created
  ON admin_activity_log(area, created_at DESC);

CREATE TABLE IF NOT EXISTS api_error_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT NOT NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  fingerprint TEXT NOT NULL DEFAULT '',
  alerted_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_error_log_created
  ON api_error_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_error_log_fingerprint
  ON api_error_log(fingerprint, created_at DESC);

CREATE TABLE IF NOT EXISTS inventory_suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS supplier_price_rules (
  supplier_id TEXT NOT NULL,
  jersey_type TEXT NOT NULL
    CHECK (jersey_type IN ('fan', 'retro_short', 'retro_long')),
  customization TEXT NOT NULL
    CHECK (customization IN ('base', 'nameset_patches')),
  cost REAL
    CHECK (cost IS NULL OR cost >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (supplier_id, jersey_type, customization),
  FOREIGN KEY (supplier_id) REFERENCES inventory_suppliers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_planner_overrides (
  product_id TEXT PRIMARY KEY,
  jersey_type TEXT NOT NULL
    CHECK (jersey_type IN ('fan', 'retro_short', 'retro_long')),
  customization TEXT NOT NULL
    CHECK (customization IN ('base', 'nameset_patches')),
  preferred_supplier_id TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES inventory(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO inventory_suppliers (id, name, enabled, sort_order)
VALUES
  ('kevin', 'Kevin', 1, 10),
  ('supplier-2', 'Supplier 2', 0, 20),
  ('supplier-3', 'Supplier 3', 0, 30);

INSERT OR IGNORE INTO supplier_price_rules (supplier_id, jersey_type, customization, cost)
VALUES
  ('kevin', 'fan', 'base', 12),
  ('kevin', 'fan', 'nameset_patches', 15),
  ('kevin', 'retro_short', 'base', 15),
  ('kevin', 'retro_short', 'nameset_patches', 18),
  ('kevin', 'retro_long', 'base', 17),
  ('kevin', 'retro_long', 'nameset_patches', 20);

CREATE TABLE IF NOT EXISTS shopify_product_mappings (
  product_id TEXT PRIMARY KEY,
  shopify_product_id TEXT NOT NULL DEFAULT '',
  shopify_handle TEXT NOT NULL DEFAULT '',
  pilot_enabled INTEGER NOT NULL DEFAULT 0 CHECK (pilot_enabled IN (0, 1)),
  sync_status TEXT NOT NULL DEFAULT 'unmapped'
    CHECK (sync_status IN ('unmapped', 'ready', 'created', 'updated', 'unchanged', 'missing_information', 'failed', 'needs_review')),
  last_payload_hash TEXT NOT NULL DEFAULT '',
  last_error TEXT NOT NULL DEFAULT '',
  last_synced_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES inventory(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_shopify_product_mappings_status
  ON shopify_product_mappings(sync_status, updated_at DESC);

CREATE TABLE IF NOT EXISTS shopify_variant_mappings (
  product_id TEXT NOT NULL,
  size TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  shopify_variant_id TEXT NOT NULL DEFAULT '',
  shopify_inventory_item_id TEXT NOT NULL DEFAULT '',
  shopify_inventory_quantity INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'unmapped'
    CHECK (sync_status IN ('unmapped', 'ready', 'created', 'updated', 'unchanged', 'failed', 'needs_review')),
  last_error TEXT NOT NULL DEFAULT '',
  last_synced_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id, size),
  FOREIGN KEY (product_id) REFERENCES inventory(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_shopify_variant_mappings_variant
  ON shopify_variant_mappings(shopify_variant_id);

CREATE TABLE IF NOT EXISTS shopify_sync_runs (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode IN ('preview', 'apply')),
  scope TEXT NOT NULL DEFAULT 'selected' CHECK (scope IN ('selected', 'all', 'retry')),
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'partial', 'failed')),
  product_count INTEGER NOT NULL DEFAULT 0,
  created_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  unchanged_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  summary_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_shopify_sync_runs_started
  ON shopify_sync_runs(started_at DESC);

CREATE TABLE IF NOT EXISTS shopify_sync_items (
  run_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'skip', 'review', 'failed')),
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'created', 'updated', 'unchanged', 'missing_information', 'failed', 'needs_review')),
  details_json TEXT NOT NULL DEFAULT '{}',
  error TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (run_id, product_id),
  FOREIGN KEY (run_id) REFERENCES shopify_sync_runs(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES inventory(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shopify_webhook_events (
  event_id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  shop_domain TEXT NOT NULL DEFAULT '',
  shopify_order_id TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'processed', 'failed', 'ignored')),
  attempts INTEGER NOT NULL DEFAULT 0,
  payload_json TEXT NOT NULL DEFAULT '{}',
  error TEXT NOT NULL DEFAULT '',
  received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shopify_webhook_events_status
  ON shopify_webhook_events(status, received_at DESC);

CREATE TABLE IF NOT EXISTS shopify_orders (
  shopify_order_id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL DEFAULT '',
  payment_status TEXT NOT NULL DEFAULT '',
  fulfillment_status TEXT NOT NULL DEFAULT '',
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal REAL NOT NULL DEFAULT 0,
  discounts REAL NOT NULL DEFAULT 0,
  shipping REAL NOT NULL DEFAULT 0,
  tax REAL NOT NULL DEFAULT 0,
  refund_total REAL NOT NULL DEFAULT 0,
  refund_status TEXT NOT NULL DEFAULT '',
  cancelled_at TEXT,
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shopify_orders_created
  ON shopify_orders(created_at DESC);

CREATE TABLE IF NOT EXISTS shopify_refunds (
  shopify_refund_id TEXT PRIMARY KEY,
  shopify_order_id TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  created_at TEXT,
  recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shopify_order_id) REFERENCES shopify_orders(shopify_order_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_shopify_refunds_order
  ON shopify_refunds(shopify_order_id);

CREATE TABLE IF NOT EXISTS shopify_order_lines (
  shopify_order_id TEXT NOT NULL,
  shopify_line_item_id TEXT NOT NULL,
  shopify_variant_id TEXT NOT NULL DEFAULT '',
  product_id TEXT,
  size TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price REAL NOT NULL DEFAULT 0,
  processing_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (processing_status IN ('pending', 'ready', 'processed', 'failed', 'needs_review')),
  sale_id INTEGER,
  error TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (shopify_order_id, shopify_line_item_id),
  FOREIGN KEY (shopify_order_id) REFERENCES shopify_orders(shopify_order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES inventory(id),
  FOREIGN KEY (sale_id) REFERENCES sales(id)
);

CREATE TABLE IF NOT EXISTS shopify_commerce_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL CHECK (event_type IN ('AddToCart', 'ViewCart', 'InitiateCheckout', 'Purchase')),
  visitor_id TEXT NOT NULL DEFAULT '',
  session_id TEXT NOT NULL DEFAULT '',
  product_id TEXT NOT NULL DEFAULT '',
  cart_id_hash TEXT NOT NULL DEFAULT '',
  shopify_order_id TEXT NOT NULL DEFAULT '',
  value REAL,
  currency TEXT NOT NULL DEFAULT 'USD',
  dedupe_key TEXT NOT NULL DEFAULT '',
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shopify_commerce_events_dedupe
  ON shopify_commerce_events(dedupe_key)
  WHERE dedupe_key <> '';

CREATE INDEX IF NOT EXISTS idx_shopify_commerce_events_type_time
  ON shopify_commerce_events(event_type, occurred_at DESC);
