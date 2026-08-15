import assert from "node:assert/strict";
import { onRequestGet as checkoutEndpoint } from "../functions/checkout.js";

const rawCart = {
  id: "gid://shopify/Cart/meta-test",
  checkoutUrl: "https://jerseysfrmjb.myshopify.com/checkouts/meta-test",
  totalQuantity: 1,
  cost: { subtotalAmount: { amount: "55.00", currencyCode: "USD" }, totalAmount: { amount: "55.00", currencyCode: "USD" } },
  lines: { nodes: [] }
};

const env = {
  DB: {
    prepare(sql) {
      return {
        bind() { return this; },
        async first() {
          if (/JOIN shopify_product_mappings/.test(sql)) return { product_id: "retro-test", shopify_product_id: "gid://shopify/Product/1", shopify_variant_id: "gid://shopify/ProductVariant/1", size: "M", sizes_json: JSON.stringify({ M: 1 }) };
          if (/FROM inventory/.test(sql)) return { id: "retro-test", size: "M", quantity: 1, sizes_json: JSON.stringify({ M: 1 }) };
          return { product_id: "retro-test", shopify_product_id: "gid://shopify/Product/1", shopify_variant_id: "gid://shopify/ProductVariant/1", size: "M", sizes_json: JSON.stringify({ M: 1 }) };
        },
        async all() { return { results: [{ product_id: "retro-test", shopify_variant_id: "gid://shopify/ProductVariant/1" }] }; }
      };
    }
  },
  SHOPIFY_CHECKOUT_ENABLED: "true",
  SHOPIFY_STORE_DOMAIN: "jerseysfrmjb.myshopify.com",
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: "storefront-test-token"
};

const originalFetch = globalThis.fetch;
const requests = [];
globalThis.fetch = async (url, options) => {
  const body = JSON.parse(options.body);
  requests.push(body);
  if (body.query.includes("JerseysFrmJBCartCreate")) {
    return new Response(JSON.stringify({ data: { cartCreate: { cart: rawCart, userErrors: [] } } }));
  }
  if (body.query.includes("JerseysFrmJBCartAdd")) {
    return new Response(JSON.stringify({ data: { cartLinesAdd: { cart: { ...rawCart, totalQuantity: 2 }, userErrors: [] } } }));
  }
  throw new Error(`Unexpected Shopify operation: ${body.query}`);
};

try {
  const response = await checkoutEndpoint({
    request: new Request("https://jerseysfrmjb.com/checkout?products=retro-test:1&fbclid=test-click"),
    env
  });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("Location"), rawCart.checkoutUrl);
  assert.equal(requests.filter(request => request.query.includes("JerseysFrmJBCartCreate")).length, 1);
  assert.equal(requests.some(request => request.variables.input.lines[0].merchandiseId === "gid://shopify/ProductVariant/1"), true);
} finally {
  globalThis.fetch = originalFetch;
}

const missingProducts = await checkoutEndpoint({
  request: new Request("https://jerseysfrmjb.com/checkout"),
  env
});
assert.equal(missingProducts.status, 400);
assert.match(await missingProducts.text(), /No products were included/);
