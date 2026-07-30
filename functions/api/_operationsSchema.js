const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS admin_activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    area TEXT NOT NULL,
    entity_id TEXT NOT NULL DEFAULT '',
    summary TEXT NOT NULL DEFAULT '',
    status_code INTEGER NOT NULL DEFAULT 200,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS api_error_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id TEXT NOT NULL,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    fingerprint TEXT NOT NULL DEFAULT '',
    alerted_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  "CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created ON admin_activity_log(created_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_admin_activity_log_area_created ON admin_activity_log(area, created_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_api_error_log_created ON api_error_log(created_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_api_error_log_fingerprint ON api_error_log(fingerprint, created_at DESC)"
];

let schemaReady = false;

export async function ensureOperationsSchema(env) {
  if (!env.DB) throw new Error("D1 binding missing");
  if (schemaReady) return;
  for (const statement of STATEMENTS) await env.DB.prepare(statement).run();
  schemaReady = true;
}

export function operationArea(pathname = "") {
  return pathname
    .replace(/^\/api\/admin\/?/, "")
    .split("/")[0]
    .replace(/[^a-z0-9_-]/gi, "")
    .slice(0, 60) || "admin";
}
