import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { onRequestGet as getFacebookHistory } from "../functions/api/admin/facebook-posts.js";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const adminHtml = await readFile(path.join(workspace, "admin.html"), "utf8");
const adminSource = await readFile(path.join(workspace, "admin.js"), "utf8");
const captionSource = await readFile(path.join(workspace, "facebook-caption.js"), "utf8");
const apiSource = await readFile(path.join(workspace, "functions", "api", "admin", "facebook-posts.js"), "utf8");
const schema = await readFile(path.join(workspace, "schema.sql"), "utf8");
const migration = await readFile(path.join(workspace, "migrations", "0009_facebook_post_history.sql"), "utf8");
const publishingMigration = await readFile(path.join(workspace, "migrations", "0010_facebook_page_publishing.sql"), "utf8");
const styles = await readFile(path.join(workspace, "styles.css"), "utf8");

assert.match(adminHtml, /data-admin-tab="facebook"/);
assert.match(adminHtml, /data-admin-section="facebook"/);
assert.match(adminHtml, /data-facebook-products/);
assert.match(adminHtml, /data-facebook-history/);
assert.match(adminHtml, /business\.facebook\.com\/latest\/home/);
assert.match(adminHtml, /This never posts to Marketplace/);
assert.match(adminHtml, /data-facebook-connect/);
assert.match(adminHtml, /data-publish-facebook-post/);
assert.match(adminHtml, /facebook-caption\.js/);

assert.match(adminSource, /FACEBOOK_MAX_PRODUCTS = 5/);
assert.match(adminSource, /window\.JBFacebookCaptions\.generateFacebookCaption/);
assert.match(captionSource, /\/products\/\$\{encodeURIComponent/);
assert.match(captionSource, /utm_source", "facebook"/);
assert.match(captionSource, /utm_campaign", normalizeCampaign\(campaign\)/);
assert.match(captionSource, /utm_content", String\(product\.id/);
assert.match(adminHtml, /data-facebook-campaign/);
assert.match(captionSource, /Available through eBay and Depop/);
assert.doesNotMatch(captionSource, /eBay:\s*https|Depop:\s*https/);
assert.match(captionSource, /new_arrivals/);
assert.match(captionSource, /restock/);
assert.match(captionSource, /featured_jerseys/);
assert.match(captionSource, /general_inventory/);
assert.match(adminSource, /saveFacebookDraft/);
assert.match(adminSource, /markFacebookPostAsPosted/);
assert.match(adminSource, /publishFacebookPost/);
assert.match(adminSource, /\/api\/admin\/facebook\/publish/);
assert.match(adminSource, /facebookEditor\?\.scrollIntoView/);
assert.match(adminSource, /facebook-editor-highlight/);
assert.doesNotMatch(adminSource, /instagram_content_publish|graph\.instagram\.com/);

for (const sql of [schema, migration]) {
  assert.match(sql, /CREATE TABLE IF NOT EXISTS facebook_post_history/);
  assert.match(sql, /content_hash TEXT NOT NULL UNIQUE/);
  assert.match(sql, /CHECK \(status IN \('draft', 'posted'\)\)/);
}

assert.match(apiSource, /isAuthorized\(request, env\)/);
assert.match(apiSource, /This exact Facebook post is already saved/);
assert.match(apiSource, /Posted history is retained to prevent accidental duplicate Facebook posts/);
assert.match(styles, /\.facebook-publisher-grid/);
assert.match(styles, /\.facebook-connection-card/);
assert.match(styles, /@media \(max-width: 560px\)/);
assert.match(publishingMigration, /CREATE TABLE IF NOT EXISTS facebook_connections/);
assert.match(publishingMigration, /facebook_post_id/);

const unauthorized = await getFacebookHistory({
  request: new Request("https://jerseysfrmjb.com/api/admin/facebook-posts"),
  env: {
    DB: {},
    ADMIN_PASSWORD: "test",
    ADMIN_SESSION_SECRET: "secret"
  }
});
assert.equal(unauthorized.status, 401, "Facebook post history follows admin authentication");

console.log("Facebook publisher tests passed:");
console.log("- admin-only Facebook Page generator is present");
console.log("- campaign-aware captions use exact product links and tracked Facebook URLs");
console.log("- saved history and unique hashes prevent duplicate posts");
console.log("- direct Page connection and publishing controls are present");
console.log("- no Instagram or Marketplace publishing automation was added");
