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
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    local_day TEXT NOT NULL DEFAULT '',
    utm_source TEXT NOT NULL DEFAULT '',
    utm_medium TEXT NOT NULL DEFAULT '',
    utm_campaign TEXT NOT NULL DEFAULT '',
    utm_content TEXT NOT NULL DEFAULT ''
  )`,
  "CREATE INDEX IF NOT EXISTS idx_analytics_events_time ON analytics_events(occurred_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_analytics_events_type_time ON analytics_events(event_type, occurred_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_analytics_events_product_time ON analytics_events(product_id, occurred_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id, occurred_at)",
  "CREATE INDEX IF NOT EXISTS idx_analytics_events_source_time ON analytics_events(traffic_source, occurred_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_analytics_events_local_day ON analytics_events(local_day, event_type)",
  "CREATE INDEX IF NOT EXISTS idx_analytics_events_campaign ON analytics_events(utm_campaign, utm_content, occurred_at DESC)"
];

let analyticsSchemaReady = false;

const ANALYTICS_COLUMN_STATEMENTS = [
  "ALTER TABLE analytics_events ADD COLUMN local_day TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE analytics_events ADD COLUMN utm_source TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE analytics_events ADD COLUMN utm_medium TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE analytics_events ADD COLUMN utm_campaign TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE analytics_events ADD COLUMN utm_content TEXT NOT NULL DEFAULT ''"
];

export async function ensureAnalyticsSchema(env) {
  if (!env.DB) throw new Error("D1 binding missing");
  if (analyticsSchemaReady) return;
  await env.DB.prepare(ANALYTICS_SCHEMA_STATEMENTS[0]).run();
  for (const statement of ANALYTICS_COLUMN_STATEMENTS) {
    try {
      await env.DB.prepare(statement).run();
    } catch (error) {
      if (!/duplicate column/i.test(String(error?.message || ""))) throw error;
    }
  }
  await env.DB.prepare(`
    UPDATE analytics_events
    SET local_day = date(occurred_at, '-4 hours')
    WHERE local_day = ''
  `).run();
  for (const statement of ANALYTICS_SCHEMA_STATEMENTS.slice(1)) {
    await env.DB.prepare(statement).run();
  }
  analyticsSchemaReady = true;
}
