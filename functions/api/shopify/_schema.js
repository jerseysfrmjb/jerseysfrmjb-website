export const SHOPIFY_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS shopify_product_mappings (
    product_id TEXT PRIMARY KEY,
    shopify_product_id TEXT NOT NULL DEFAULT '',
    shopify_handle TEXT NOT NULL DEFAULT '',
    pilot_enabled INTEGER NOT NULL DEFAULT 0 CHECK (pilot_enabled IN (0, 1)),
    sync_status TEXT NOT NULL DEFAULT 'unmapped',
    last_payload_hash TEXT NOT NULL DEFAULT '',
    last_error TEXT NOT NULL DEFAULT '',
    last_synced_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES inventory(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS shopify_variant_mappings (
    product_id TEXT NOT NULL,
    size TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    shopify_variant_id TEXT NOT NULL DEFAULT '',
    shopify_inventory_item_id TEXT NOT NULL DEFAULT '',
    shopify_inventory_quantity INTEGER NOT NULL DEFAULT 0,
    sync_status TEXT NOT NULL DEFAULT 'unmapped',
    last_error TEXT NOT NULL DEFAULT '',
    last_synced_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, size),
    FOREIGN KEY (product_id) REFERENCES inventory(id) ON DELETE CASCADE
  )`,
  "CREATE INDEX IF NOT EXISTS idx_shopify_variant_mappings_variant ON shopify_variant_mappings(shopify_variant_id)",
  `CREATE TABLE IF NOT EXISTS shopify_sync_runs (
    id TEXT PRIMARY KEY, mode TEXT NOT NULL, scope TEXT NOT NULL DEFAULT 'selected',
    status TEXT NOT NULL DEFAULT 'running', product_count INTEGER NOT NULL DEFAULT 0,
    created_count INTEGER NOT NULL DEFAULT 0, updated_count INTEGER NOT NULL DEFAULT 0,
    unchanged_count INTEGER NOT NULL DEFAULT 0, failed_count INTEGER NOT NULL DEFAULT 0,
    summary_json TEXT NOT NULL DEFAULT '{}', started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS shopify_sync_items (
    run_id TEXT NOT NULL, product_id TEXT NOT NULL, action TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ready', details_json TEXT NOT NULL DEFAULT '{}',
    error TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (run_id, product_id)
  )`,
  `CREATE TABLE IF NOT EXISTS shopify_webhook_events (
    event_id TEXT PRIMARY KEY, topic TEXT NOT NULL, shop_domain TEXT NOT NULL DEFAULT '',
    shopify_order_id TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'received',
    attempts INTEGER NOT NULL DEFAULT 0, payload_json TEXT NOT NULL DEFAULT '{}',
    error TEXT NOT NULL DEFAULT '', received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS shopify_orders (
    shopify_order_id TEXT PRIMARY KEY, order_number TEXT NOT NULL DEFAULT '',
    payment_status TEXT NOT NULL DEFAULT '', fulfillment_status TEXT NOT NULL DEFAULT '',
    currency TEXT NOT NULL DEFAULT 'USD', subtotal REAL NOT NULL DEFAULT 0,
    discounts REAL NOT NULL DEFAULT 0, shipping REAL NOT NULL DEFAULT 0,
    tax REAL NOT NULL DEFAULT 0, refund_total REAL NOT NULL DEFAULT 0,
    refund_status TEXT NOT NULL DEFAULT '', cancelled_at TEXT, paid_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS shopify_refunds (
    shopify_refund_id TEXT PRIMARY KEY, shopify_order_id TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0, created_at TEXT,
    recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shopify_order_id) REFERENCES shopify_orders(shopify_order_id) ON DELETE CASCADE
  )`,
  "CREATE INDEX IF NOT EXISTS idx_shopify_refunds_order ON shopify_refunds(shopify_order_id)",
  `CREATE TABLE IF NOT EXISTS shopify_order_lines (
    shopify_order_id TEXT NOT NULL, shopify_line_item_id TEXT NOT NULL,
    shopify_variant_id TEXT NOT NULL DEFAULT '', product_id TEXT,
    size TEXT NOT NULL DEFAULT '', quantity INTEGER NOT NULL DEFAULT 0,
    unit_price REAL NOT NULL DEFAULT 0, processing_status TEXT NOT NULL DEFAULT 'pending'
      CHECK (processing_status IN ('pending', 'ready', 'processed', 'failed', 'needs_review')),
    sale_id INTEGER, error TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (shopify_order_id, shopify_line_item_id)
  )`,
  `CREATE TABLE IF NOT EXISTS shopify_commerce_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL CHECK (event_type IN ('AddToCart', 'ViewCart', 'InitiateCheckout', 'Purchase')),
    visitor_id TEXT NOT NULL DEFAULT '', session_id TEXT NOT NULL DEFAULT '',
    session_id_hash TEXT NOT NULL DEFAULT '',
    product_id TEXT NOT NULL DEFAULT '', cart_id_hash TEXT NOT NULL DEFAULT '',
    product_ids_json TEXT NOT NULL DEFAULT '[]', traffic_source TEXT NOT NULL DEFAULT 'Other',
    shopify_order_id TEXT NOT NULL DEFAULT '', value REAL, currency TEXT NOT NULL DEFAULT 'USD',
    dedupe_key TEXT NOT NULL DEFAULT '', occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_shopify_commerce_events_dedupe ON shopify_commerce_events(dedupe_key) WHERE dedupe_key <> ''",
  "CREATE INDEX IF NOT EXISTS idx_shopify_commerce_events_type_time ON shopify_commerce_events(event_type, occurred_at DESC)"
];

const SHOPIFY_COLUMN_STATEMENTS = [
  "ALTER TABLE shopify_commerce_events ADD COLUMN session_id_hash TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE shopify_commerce_events ADD COLUMN product_ids_json TEXT NOT NULL DEFAULT '[]'",
  "ALTER TABLE shopify_commerce_events ADD COLUMN traffic_source TEXT NOT NULL DEFAULT 'Other'"
];

const SHOPIFY_POST_SCHEMA_STATEMENTS = [
  "CREATE INDEX IF NOT EXISTS idx_shopify_commerce_events_source_time ON shopify_commerce_events(traffic_source, occurred_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_shopify_commerce_events_product_time ON shopify_commerce_events(product_id, occurred_at DESC)"
];

export async function ensureShopifySchema(env) {
  if (!env?.DB) throw new Error("Missing DB D1 binding");
  for (const statement of SHOPIFY_SCHEMA_STATEMENTS) {
    await env.DB.prepare(statement).run();
  }
  for (const statement of SHOPIFY_COLUMN_STATEMENTS) {
    try {
      await env.DB.prepare(statement).run();
    } catch (error) {
      if (!/duplicate column/i.test(String(error?.message || ""))) throw error;
    }
  }
  for (const statement of SHOPIFY_POST_SCHEMA_STATEMENTS) {
    await env.DB.prepare(statement).run();
  }
}
