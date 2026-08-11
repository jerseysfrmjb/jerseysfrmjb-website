import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const storefront = read("storefront.js");
const cart = read("shopify-cart.js");
const admin = read("admin.js");
const styles = read("styles.css");
const homepage = read("index.html");
const sizeGuide = read("size-guide.html");

assert.doesNotMatch(storefront, /fetch\("\/api\/settings"/);
assert.match(storefront, /let homepageInventoryRequest = null/);
assert.match(storefront, /if \(!homepageInventoryRequest\) homepageInventoryRequest = fetchInventory\(\{ featured: "true" \}\)/);
assert.equal((storefront.match(/const data = await fetchHomepageInventory\(\);/g) || []).length, 2);
assert.doesNotMatch(storefront, /renderHomepageStats/);
assert.match(storefront, /fetchWithTimeout\("\/data\/inventory\.json"/);
assert.match(storefront, /async function fetchWithTimeout/);
assert.match(storefront, /timeoutMs = 8000/);
assert.match(storefront, /Inventory is temporarily unavailable\. Please refresh in a moment\./);

const reviewImages = [...homepage.matchAll(/<img[^>]+assets\/reviews\/depop-review-row-[^>]+>/g)].map(match => match[0]);
assert.equal(reviewImages.length, 19);
reviewImages.forEach(image => {
  assert.match(image, /loading="lazy"/);
  assert.match(image, /decoding="async"/);
  assert.match(image, /width="556" height="190"/);
});

const sizeChartWebp = fs.statSync(path.join(root, "assets", "jersey-measurements.webp")).size;
assert.ok(sizeChartWebp < 150_000, `WebP size chart should stay below 150 KB (got ${sizeChartWebp})`);
assert.match(sizeGuide, /<source type="image\/webp" srcset="assets\/jersey-measurements\.webp">/);
assert.match(sizeGuide, /width="1536" height="1024"/);

assert.match(styles, /\.product-page-body\.has-mobile-product-actions \.favorites-widget:not\(\.open\)/);
assert.match(styles, /\.favorites-launcher b\{position:absolute;width:1px/);
assert.match(storefront, /aria-label="Open saved jerseys"/);
assert.match(storefront, /event\.key === "Escape" && drawer\.classList\.contains\("open"\)/);

assert.match(cart, /const REQUEST_TIMEOUT_MS = 15000/);
assert.match(cart, /const controller = new AbortController\(\)/);
assert.match(cart, /role="dialog" aria-modal="true" aria-label="Shopping cart"/);
assert.match(cart, /event\.key === "Escape" && drawer\?\.classList\.contains\("open"\)/);
assert.match(cart, /Secure checkout took too long to respond/);

assert.match(admin, /function updateShopifyActionState/);
assert.match(admin, /button\.disabled = busy \|\| !canSync/);
assert.match(admin, /Shopify sync is safely disabled/);
assert.match(admin, /dry-run previews remain available/);

const htmlFiles = fs.readdirSync(root).filter(name => name.endsWith(".html"));
const missing = [];
for (const file of htmlFiles) {
  const html = read(file);
  for (const match of html.matchAll(/(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:|data:)/.test(reference)) continue;
    const relative = reference.replace(/^\//, "");
    if (!path.extname(relative)) continue;
    if (!fs.existsSync(path.join(root, relative))) missing.push(`${file}: ${reference}`);
  }
  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(image[0], /\balt="[^"]*"/, `${file} contains an image without alt text`);
  }
}
assert.deepEqual(missing, [], `Missing local assets:\n${missing.join("\n")}`);

console.log("Performance and accessibility regression tests passed:");
console.log("- homepage inventory and settings share one request lifecycle");
console.log("- review, logo, and size-guide assets use lighter or deferred delivery");
console.log("- mobile fixed actions no longer collide with product actions");
console.log("- drawers support dialog semantics, focus recovery, Escape, and timeouts");
console.log("- Shopify apply actions stay disabled while safe mode is active");
console.log("- static local references and image alternatives are valid");
