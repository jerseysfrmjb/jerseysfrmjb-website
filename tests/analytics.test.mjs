import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { onRequestGet as getAnalyticsConfig } from "../functions/api/analytics/config.js";
import { onRequestPost as postAnalyticsEvent } from "../functions/api/analytics/events.js";
import { onRequestGet as getAdminAnalytics } from "../functions/api/admin/analytics.js";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const analyticsSource = await readFile(path.join(workspace, "analytics.js"), "utf8");
const adminHtml = await readFile(path.join(workspace, "admin.html"), "utf8");
const adminSource = await readFile(path.join(workspace, "admin.js"), "utf8");
const styles = await readFile(path.join(workspace, "styles.css"), "utf8");
const schema = await readFile(path.join(workspace, "schema.sql"), "utf8");
const migration = await readFile(path.join(workspace, "migrations", "0008_analytics_events.sql"), "utf8");
const privacy = await readFile(path.join(workspace, "privacy.html"), "utf8");
const publicPages = [
  "index.html",
  "shop-all.html",
  "club-jerseys.html",
  "worldcup-jerseys.html",
  "retro-jerseys.html",
  "size-guide.html",
  "privacy.html"
];

for (const page of publicPages) {
  const html = await readFile(path.join(workspace, page), "utf8");
  assert.equal((html.match(/analytics\.js/g) || []).length, 1, `${page} loads analytics once`);
  assert.match(html, /analytics\.js[^>]*defer/);
  assert.doesNotMatch(html, /https:\/\/jerseysfrmjb\.com\/\//, `${page} canonical and social URLs have no double slash`);
}

assert.doesNotMatch(adminHtml, /<script[^>]+analytics\.js/);
assert.match(adminHtml, /data-admin-tab="analytics"/);
assert.match(adminHtml, /data-admin-section="analytics"/);
assert.match(adminHtml, /data-analytics-dashboard/);
assert.match(adminSource, /\/api\/admin\/analytics\?range=/);
assert.match(adminSource, /exportAnalyticsCsv/);
assert.match(adminSource, /Highest views with no clicks/);
assert.match(adminSource, /Not viewed in 30 days/);
assert.match(styles, /@media\(max-width:560px\)/);
assert.match(styles, /\.analytics-table-wrap\{overflow:auto/);
assert.match(styles, /@media\(prefers-color-scheme:dark\)/);

for (const sql of [schema, migration]) {
  assert.match(sql, /CREATE TABLE IF NOT EXISTS analytics_events/);
  assert.match(sql, /idx_analytics_events_product_time/);
  assert.doesNotMatch(sql, /\bip_address\b/i);
}
assert.match(privacy, /random browser and session identifiers/);
assert.match(analyticsSource, /navigator\.globalPrivacyControl/);
assert.match(analyticsSource, /navigator\.doNotTrack/);
assert.match(analyticsSource, /event_type: eventType/);
assert.match(analyticsSource, /marketplace_click/);
assert.match(analyticsSource, /search_results/);
assert.match(analyticsSource, /gtag\/js\?id=/);
assert.match(analyticsSource, /anonymize_ip: true/);

const configured = await getAnalyticsConfig({ env: { GA4_MEASUREMENT_ID: "G-ABC1234567" } });
assert.equal(configured.status, 200);
assert.deepEqual(await configured.json(), { measurement_id: "G-ABC1234567" });
const unconfigured = await getAnalyticsConfig({ env: { GA4_MEASUREMENT_ID: "not-valid" } });
assert.deepEqual(await unconfigured.json(), { measurement_id: "" });
const defaultConfig = await getAnalyticsConfig({ env: {} });
assert.deepEqual(await defaultConfig.json(), { measurement_id: "G-P42JD6TLP3" });

const recorded = [];
function statement(sql) {
  const state = { sql, values: [] };
  return {
    sql,
    bind(...values) {
      state.values = values;
      return this;
    },
    async run() {
      if (/INSERT INTO analytics_events/i.test(sql)) recorded.push(state.values);
      return { success: true };
    },
    async first() {
      if (/SELECT value FROM site_settings/i.test(sql)) return { value: "applied" };
      return null;
    },
    async all() {
      return { results: [] };
    }
  };
}
const eventDb = {
  prepare: statement,
  async batch(statements) {
    return statements.map(() => ({ success: true, results: [] }));
  }
};
const eventRequest = new Request("https://jerseysfrmjb.com/api/analytics/events", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: "https://jerseysfrmjb.com",
    "User-Agent": "Mozilla/5.0 (iPhone) Version/18.0 Mobile Safari/604.1"
  },
  body: JSON.stringify({
    event_type: "marketplace_click",
    visitor_id: "v_1234567890",
    session_id: "s_1234567890",
    page_path: "/products/test?private=no",
    page_title: "Test Jersey",
    product_id: "club-test",
    marketplace: "Depop",
    traffic_source: "Pinterest"
  })
});
Object.defineProperty(eventRequest, "cf", {
  value: { country: "US", region: "Maryland" }
});
const eventResponse = await postAnalyticsEvent({ request: eventRequest, env: { DB: eventDb } });
assert.equal(eventResponse.status, 204);
assert.equal(recorded.length, 1);
assert.equal(recorded[0][3], "/products/test", "queries are stripped from stored page paths");
assert.equal(recorded[0][6], "Depop");
assert.equal(recorded[0][9], "Pinterest");
assert.equal(recorded[0][10], "US");
assert.equal(recorded[0][11], "Maryland");
assert.equal(recorded[0][12], "Mobile");
assert.equal(recorded[0][13], "Safari");

const crossSiteResponse = await postAnalyticsEvent({
  request: new Request("https://jerseysfrmjb.com/api/analytics/events", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://example.com" },
    body: "{}"
  }),
  env: { DB: eventDb }
});
assert.equal(crossSiteResponse.status, 403);

const unauthorizedResponse = await getAdminAnalytics({
  request: new Request("https://jerseysfrmjb.com/api/admin/analytics"),
  env: { DB: eventDb, ADMIN_PASSWORD: "test", ADMIN_SESSION_SECRET: "secret" }
});
assert.equal(unauthorizedResponse.status, 401, "analytics dashboard API follows admin authentication");

const token = createHash("sha256").update("test:secret").digest("hex");
const authorizedRequest = new Request("https://jerseysfrmjb.com/api/admin/analytics?range=30d", {
  headers: { Cookie: `jb_admin=${token}` }
});
const emptyDb = {
  prepare: statement,
  async batch(statements) {
    return statements.map(item => {
      if (/pages_per_visit/i.test(item.sql)) {
        return { results: [{ pages_per_visit: 0, average_session_duration: 0, bounce_rate: 0 }] };
      }
      if (/COUNT\(DISTINCT visitor_id\) AS visitors/i.test(item.sql) && !/GROUP BY/i.test(item.sql)) {
        return { results: [{ visitors: 0, sessions: 0, page_views: 0, product_views: 0, marketplace_clicks: 0 }] };
      }
      return { results: [] };
    });
  }
};
const authorizedResponse = await getAdminAnalytics({
  request: authorizedRequest,
  env: { DB: emptyDb, ADMIN_PASSWORD: "test", ADMIN_SESSION_SECRET: "secret" }
});
assert.equal(authorizedResponse.status, 200);
const dashboard = await authorizedResponse.json();
assert.equal(dashboard.range, "30d");
assert.equal(dashboard.current.page_views, 0);
assert.equal(dashboard.privacy.stores_ip_addresses, false);

console.log("Analytics tests passed:");
console.log("- every public page loads one privacy-aware analytics client; admin loads none");
console.log("- GA4 configuration validates the Measurement ID and enables anonymized loading");
console.log("- D1 event collection strips URL queries and stores no IP address");
console.log("- marketplace, product, search, source, geography, device, and browser fields are available");
console.log("- admin analytics API remains authenticated and returns empty-state data safely");
