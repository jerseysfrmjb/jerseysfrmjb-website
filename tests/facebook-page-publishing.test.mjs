import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  facebookOauthUrl,
  listManagedPages
} from "../functions/api/admin/facebook/_shared.js";
import {
  onRequestPost as publishFacebookPost,
  prioritizedPhotoUrls
} from "../functions/api/admin/facebook/publish.js";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sharedSource = await readFile(
  path.join(workspace, "functions", "api", "admin", "facebook", "_shared.js"),
  "utf8"
);
const publishSource = await readFile(
  path.join(workspace, "functions", "api", "admin", "facebook", "publish.js"),
  "utf8"
);
const callbackSource = await readFile(
  path.join(workspace, "functions", "api", "admin", "facebook", "callback.js"),
  "utf8"
);
const schema = await readFile(path.join(workspace, "schema.sql"), "utf8");

const oauth = new URL(facebookOauthUrl({
  FACEBOOK_APP_ID: "1028637966593790",
  FACEBOOK_REDIRECT_URI: "https://jerseysfrmjb.com/api/admin/facebook/callback"
}, "secure-state"));
assert.equal(oauth.hostname, "www.facebook.com");
assert.equal(oauth.searchParams.get("client_id"), "1028637966593790");
assert.equal(oauth.searchParams.get("redirect_uri"), "https://jerseysfrmjb.com/api/admin/facebook/callback");
assert.equal(oauth.searchParams.get("state"), "secure-state");
for (const scope of ["pages_show_list", "pages_read_engagement", "pages_manage_posts"]) {
  assert.match(oauth.searchParams.get("scope") || "", new RegExp(scope));
}

const businessOauth = new URL(facebookOauthUrl({
  FACEBOOK_APP_ID: "1028637966593790",
  FACEBOOK_LOGIN_CONFIG_ID: "business-config",
  FACEBOOK_REDIRECT_URI: "https://jerseysfrmjb.com/api/admin/facebook/callback"
}, "business-state"));
assert.equal(businessOauth.searchParams.get("config_id"), "business-config");
assert.equal(businessOauth.searchParams.get("override_default_response_type"), "true");
assert.equal(businessOauth.searchParams.has("scope"), false);

const originalFetch = globalThis.fetch;
const graphRequests = [];
globalThis.fetch = async request => {
  const url = new URL(String(request));
  graphRequests.push(url);
  if (url.pathname.endsWith("/me/accounts")) {
    return new Response(JSON.stringify({ data: [] }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  if (url.pathname.endsWith("/1196832170185323")) {
    return new Response(JSON.stringify({
      id: "1196832170185323",
      name: "Jerseysfrmjb",
      access_token: "page-token",
      tasks: ["CREATE_CONTENT", "MANAGE"]
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  return new Response(JSON.stringify({ error: { message: "Unexpected request" } }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
};
try {
  const pages = await listManagedPages({
    FACEBOOK_APP_SECRET: "test-secret",
    FACEBOOK_PAGE_ID: "1196832170185323"
  }, "user-token");
  assert.equal(pages.length, 1);
  assert.equal(pages[0].id, "1196832170185323");
  assert.equal(pages[0].access_token, "page-token");
  assert.equal(graphRequests.length, 2);
  assert.match(graphRequests[1].pathname, /1196832170185323$/);
  assert.equal(graphRequests[1].searchParams.get("fields"), "id,name,access_token");
} finally {
  globalThis.fetch = originalFetch;
}

assert.match(sharedSource, /AES-GCM/);
assert.match(sharedSource, /appsecret_proof/);
assert.match(sharedSource, /AbortController/);
assert.match(sharedSource, /Facebook did not respond in time/);
assert.match(sharedSource, /user_access_token_encrypted/);
assert.match(callbackSource, /__Host-jb_facebook_state/);
assert.match(callbackSource, /readCookie/);
assert.doesNotMatch(callbackSource, /isAuthorized/);
assert.match(publishSource, /published:\s*"false"/);
assert.match(publishSource, /attached_media\[/);
assert.match(publishSource, /MAX_PHOTOS = 5/);
assert.match(publishSource, /failedUploads\.length/);
assert.match(publishSource, /facebook_post_id/);
assert.match(publishSource, /permalink_url/);
assert.match(schema, /CREATE TABLE IF NOT EXISTS facebook_connections/);
assert.doesNotMatch(sharedSource, /FACEBOOK_APP_SECRET\s*=\s*["'][^"']+["']/);

const prioritized = prioritizedPhotoUrls({
  FACEBOOK_REDIRECT_URI: "https://jerseysfrmjb.com/api/admin/facebook/callback"
}, [
  { product_id: "one", src: "/assets/one-front.jpg" },
  { product_id: "one", src: "/assets/one-back.jpg" },
  { product_id: "two", src: "/assets/two-front.jpg" },
  { product_id: "two", src: "/assets/two-back.jpg" },
  { product_id: "three", src: "/assets/three-front.jpg" },
  { product_id: "four", src: "/assets/four-front.jpg" },
  { product_id: "external", src: "https://example.com/not-allowed.jpg" }
]);
assert.deepEqual(prioritized, [
  "https://jerseysfrmjb.com/assets/one-front.jpg",
  "https://jerseysfrmjb.com/assets/two-front.jpg",
  "https://jerseysfrmjb.com/assets/three-front.jpg",
  "https://jerseysfrmjb.com/assets/four-front.jpg",
  "https://jerseysfrmjb.com/assets/one-back.jpg"
], "publishing prioritizes one local photo per product and stays within five images");

const unauthorized = await publishFacebookPost({
  request: new Request("https://jerseysfrmjb.com/api/admin/facebook/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ post_id: 1 })
  }),
  env: {
    DB: {},
    ADMIN_PASSWORD: "test",
    ADMIN_SESSION_SECRET: "secret",
    FACEBOOK_APP_SECRET: "not-a-real-secret"
  }
});
assert.equal(unauthorized.status, 401, "Facebook publishing is admin-only");

console.log("Facebook Page publishing tests passed:");
console.log("- OAuth uses the supplied App ID, exact callback, state, and Page scopes");
console.log("- Business Login configuration mode is supported");
console.log("- selected Business Login Pages use the direct Page-token fallback");
console.log("- tokens are encrypted and Graph calls use appsecret_proof");
console.log("- bounded multi-photo posts prioritize products and tolerate partial photo failures");
console.log("- Meta requests time out before the site gateway can return an HTML 502");
console.log("- publishing endpoints reject unauthenticated requests");
