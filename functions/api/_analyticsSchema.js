export const ANALYTICS_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS analytics_events (
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
  )`,
  "CREATE INDEX IF NOT EXISTS idx_analytics_events_time ON analytics_events(occurred_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_analytics_events_type_time ON analytics_events(event_type, occurred_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_analytics_events_product_time ON analytics_events(product_id, occurred_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id, occurred_at)",
  "CREATE INDEX IF NOT EXISTS idx_analytics_events_source_time ON analytics_events(traffic_source, occurred_at DESC)"
];

let analyticsSchemaReady = false;

export async function ensureAnalyticsSchema(env) {
  if (!env.DB) throw new Error("D1 binding missing");
  if (analyticsSchemaReady) return;
  for (const statement of ANALYTICS_SCHEMA_STATEMENTS) {
    await env.DB.prepare(statement).run();
  }
  analyticsSchemaReady = true;
}
