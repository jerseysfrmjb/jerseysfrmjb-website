import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const storefront = read("storefront.js");
const styles = read("styles.css");
const publicMessages = read("functions/api/messages.js");
const adminMessages = read("functions/api/admin/messages.js");
const planner = read("functions/api/admin/inventory-planner.js");
const productPage = read("functions/products/_page.js");

assert.match(storefront, /FAVORITES_KEY = "jerseysfrmjb_favorites_v1"/);
assert.match(storefront, /data-favorite-product/);
assert.match(storefront, /openCombined\(products/);
assert.match(storefront, /body\.products = combinedProducts/);
assert.doesNotMatch(storefront, /data-player-filter/);
assert.doesNotMatch(storefront, /data-team-filter/);
assert.doesNotMatch(storefront, /data-competition-filter/);
assert.match(storefront, /type="image\/webp"/);
assert.match(productPage, /responsive\/\$\{responsiveMatch\[2\]\}-480\.webp/);
assert.match(productPage, /data-product-sizes/);
assert.match(publicMessages, /contact_message_products/);
assert.match(adminMessages, /request_summary/);
assert.match(adminMessages, /contacted_at/);
assert.match(planner, /request_details/);
assert.match(styles, /\.favorites-panel/);
assert.match(styles, /\.advanced-inventory-filters/);

const sourceImages = fs.readdirSync(path.join(root, "assets", "inventory"))
  .filter(name => /\.(?:jpe?g|png)$/i.test(name));
const responsive = new Set(fs.readdirSync(path.join(root, "assets", "inventory", "responsive")));
for (const image of sourceImages) {
  const stem = image.replace(/\.(?:jpe?g|png)$/i, "");
  assert.ok(responsive.has(`${stem}-480.webp`), `Missing 480px WebP for ${image}`);
  assert.ok(responsive.has(`${stem}-900.webp`), `Missing 900px WebP for ${image}`);
}

console.log("Engagement tools tests passed:");
console.log("- device-only favorites and combined Instagram requests are wired");
console.log("- the intentionally simplified storefront filter interface remains in place");
console.log("- request details and contacted status feed the Inventory Planner");
console.log(`- ${sourceImages.length * 2} responsive WebP variants retain original-image fallbacks`);
