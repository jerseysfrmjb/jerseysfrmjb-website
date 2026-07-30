import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => readFile(path.join(workspace, file), "utf8");

const [
  adminHtml,
  adminSource,
  storefront,
  middleware,
  operationsApi,
  catalogHealthApi,
  messagesApi,
  schema,
  migration,
  workflow,
  backupScript
] = await Promise.all([
  read("admin.html"),
  read("admin.js"),
  read("storefront.js"),
  read("functions/_middleware.js"),
  read("functions/api/admin/operations.js"),
  read("functions/api/admin/catalog-health.js"),
  read("functions/api/messages.js"),
  read("schema.sql"),
  read("migrations/0011_operations_requests_attribution.sql"),
  read(".github/workflows/weekly-d1-backup.yml"),
  read("scripts/export-d1-backup.mjs")
]);

assert.match(adminHtml, /data-admin-tab="operations"/);
assert.match(adminHtml, /data-admin-section="operations"/);
assert.match(adminHtml, /Admin Activity/);
assert.match(adminSource, /\/api\/admin\/operations/);
assert.match(operationsApi, /isAuthorized\(request, env\)/);
assert.match(operationsApi, /format.*inventory\.csv/);
assert.match(adminHtml, /data-run-catalog-health/);
assert.match(adminSource, /\/api\/admin\/catalog-health/);
assert.match(catalogHealthApi, /isAuthorized\(request, env\)/);
assert.match(catalogHealthApi, /method = "HEAD"/);
assert.match(catalogHealthApi, /MARKETPLACE_HOSTS/);

for (const sql of [schema, migration]) {
  assert.match(sql, /CREATE TABLE IF NOT EXISTS admin_activity_log/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS api_error_log/);
  assert.match(sql, /request_type TEXT NOT NULL/);
  assert.match(sql, /utm_campaign TEXT NOT NULL/);
}

assert.match(middleware, /response\.status >= 500/);
assert.match(middleware, /DISCORD_WEBHOOK_URL/);
assert.match(middleware, /datetime\('now', '-15 minutes'\)/);
assert.doesNotMatch(middleware, /request\.text|request\.json/, "middleware does not store private request bodies");

assert.match(workflow, /schedule:/);
assert.match(workflow, /upload-artifact@v4/);
assert.match(workflow, /CLOUDFLARE_D1_DATABASE_ID/);
assert.match(backupScript, /\/export/);
assert.match(backupScript, /result\?\.result\?\.signed_url/);
assert.match(backupScript, /inventory\.quantity/);

assert.match(storefront, /name="request_type"/);
assert.match(storefront, /name="contact_preference"/);
assert.match(storefront, /name="marketplace_preference"/);
assert.match(storefront, /name="contact_preference" value="instagram"/);
assert.doesNotMatch(storefront, /<option value="email">Email<\/option>/);
assert.doesNotMatch(storefront, /<option value="Facebook">Facebook<\/option>/);
assert.doesNotMatch(storefront, /<option value="Website">Website<\/option>/);
assert.match(storefront, /data-help-success-message/);
assert.match(messagesApi, /const contact_preference = "instagram"/);
assert.match(messagesApi, /new Set\(\["", "eBay", "Depop", "Other"\]\)/);
assert.match(messagesApi, /request_id/);
assert.match(messagesApi, /product_name/);
assert.match(messagesApi, /Too many requests were sent recently/);
assert.match(adminSource, /Jersey views to marketplace clicks/);

console.log("Operations and request workflow tests passed:");
console.log("- admin-only audit and inventory export are present");
console.log("- API errors are logged and deduplicated before Discord alerts");
console.log("- weekly D1 SQL and inventory CSV workflow is configured");
console.log("- Need Help uses Instagram replies, approved marketplace choices, product context, and rate limiting");
console.log("- authenticated catalog health checks and the conversion funnel are present");
