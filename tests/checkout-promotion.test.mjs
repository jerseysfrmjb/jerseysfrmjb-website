import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => readFile(path.join(workspace, file), "utf8");

const [
  homepage,
  shopAll,
  club,
  retro,
  world,
  storefront,
  cartClient,
  productPage,
  styles,
  analytics
] = await Promise.all([
  read("index.html"),
  read("shop-all.html"),
  read("club-jerseys.html"),
  read("retro-jerseys.html"),
  read("worldcup-jerseys.html"),
  read("storefront.js"),
  read("shopify-cart.js"),
  read("functions/products/_page.js"),
  read("styles.css"),
  read("analytics.js")
]);

assert.match(homepage, /href="\/shop-all\?stock=available#inventory">Shop Available Jerseys/);
assert.match(homepage, /Secure Website Checkout/);
assert.match(homepage, /Secure Shopify Checkout/);
assert.doesNotMatch(homepage, /Simple Marketplace Checkout/);

for (const page of [shopAll, club, retro, world]) {
  assert.match(page, /class="inventory-page" id="inventory"/);
  assert.match(page, /class="where-to-buy website-checkout-promo"/);
  assert.match(page, /Show Available Jerseys/);
  assert.match(page, /Shopify checkout/i);
  assert.match(page, /Depop/);
  assert.match(page, /eBay/);
}

assert.match(storefront, /new URLSearchParams\(window\.location\.search\)\.get\("stock"\)/);
assert.match(storefront, /item\.featured && isAvailable\(item\)/);
assert.match(storefront, /Choose Size &amp; Buy/);
assert.match(cartClient, /Secure Shopify checkout is live/);
assert.match(productPage, /aria-label="Website checkout options"/);
assert.match(productPage, /data-shopify-cart-open>Cart/);
assert.match(productPage, /href="#website-checkout">Choose Size/);
assert.match(styles, /\.product-mobile-shopify-bar nav/);
assert.match(styles, /\.website-checkout-promo>p/);

assert.match(analytics, /utm_source/);
assert.match(analytics, /utm_medium/);
assert.match(analytics, /utm_campaign/);
assert.match(analytics, /utm_content/);
assert.match(analytics, /pinterest/);
assert.match(analytics, /instagram/);
assert.match(analytics, /tiktok/);

console.log("Website checkout promotion tests passed.");
