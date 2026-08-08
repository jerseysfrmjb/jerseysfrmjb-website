import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  applyShopifyProduct,
  buildShopifyProduct,
  findShopifyProductBySku,
  normalizeShopifySizes,
  previewAction,
  productSetInput,
  safeProductSummary,
  shopifyPayloadHash,
  shopifySku,
  suggestedPilotProducts
} from "../functions/api/shopify/_products.js";
import {
  sanitizeWebhookPayload,
  shopifyAdminAccessToken,
  shopifyConfiguration,
  shopifyFlags,
  shopifyGraphql,
  shopifyWebhookSecret,
  verifyShopifyWebhook
} from "../functions/api/shopify/_shared.js";
import {
  inspectShopifySetup,
  recommendShopifyLocation,
  recommendShopifyPublication,
  registerShopifyWebhooks,
  REQUIRED_SHOPIFY_WEBHOOK_TOPICS,
  SHOPIFY_WEBHOOK_URI
} from "../functions/api/shopify/_setup.js";
import {
  addCartLine,
  createCart,
  getCart,
  publicCart,
  removeCartLine,
  updateCartLine
} from "../functions/api/shopify/_cart.js";
import { onRequestPost as cartEndpoint } from "../functions/api/shopify/cart.js";
import { onRequestPost as webhookEndpoint } from "../functions/api/shopify/webhooks.js";
import { processSanitizedWebhook } from "../functions/api/shopify/_webhooks.js";
import { buildProductPageModel, renderProductPage } from "../functions/products/_page.js";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function row(overrides = {}) {
  return {
    id: "club-barcelona-yamal-home-2627",
    category: "club",
    name: "Lamine Yamal #10 | Barcelona 26/27 Home Kit",
    size: "M",
    sizes_json: JSON.stringify({ M: 2 }),
    quantity: 2,
    base_price: 45,
    website_price: 50,
    photos: JSON.stringify([
      { src: "/assets/inventory/example-front.jpg", alt: "Yamal Barcelona front" },
      { src: "/assets/inventory/example-back.jpg", alt: "Yamal Barcelona back" }
    ]),
    pilot_enabled: 1,
    shopify_product_id: "",
    shopify_handle: "",
    shopify_variant_mappings_json: "[]",
    ...overrides
  };
}

function jsonFetch(data, status = 200, capture = null) {
  return async (url, options) => {
    capture?.push({ url, options, body: JSON.parse(options.body) });
    return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
  };
}

const env = {
  SHOPIFY_STORE_DOMAIN: "jerseysfrmjb.myshopify.com",
  SHOPIFY_ADMIN_ACCESS_TOKEN: "admin-test-token",
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: "storefront-test-token",
  SHOPIFY_WEBHOOK_SECRET: "webhook-test-secret"
};

assert.deepEqual(shopifyFlags({}), { checkout: false, sync: false }, "feature flags default off");
const safeConfig = shopifyConfiguration(env);
assert.equal(safeConfig.checkout, false);
assert.equal(safeConfig.sync, false);
assert.equal(safeConfig.adminConfigured, true);
assert.equal(safeConfig.storefrontConfigured, true);
assert.equal(safeConfig.publicationConfigured, false);
assert.equal(JSON.stringify(safeConfig).includes("admin-test-token"), false, "configuration never exposes tokens");
assert.equal(shopifyConfiguration({ SHOPIFY_STORE_DOMAIN: "https://example.com" }).storeDomain, "");
assert.equal(shopifyWebhookSecret({ SHOPIFY_CLIENT_SECRET: "client-secret" }), "client-secret");
const privateStorefrontRequests = [];
await shopifyGraphql({
  SHOPIFY_STORE_DOMAIN: env.SHOPIFY_STORE_DOMAIN,
  SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN: "shpat_private-test-token"
}, "storefront", "query PrivateStorefrontHealth { shop { name } }", {}, {
  fetchImpl: jsonFetch({ data: { shop: { name: "JerseysFrmJB" } } }, 200, privateStorefrontRequests)
});
assert.equal(privateStorefrontRequests[0].options.headers["Shopify-Storefront-Private-Token"], "shpat_private-test-token");
assert.equal(privateStorefrontRequests[0].options.headers["X-Shopify-Storefront-Access-Token"], undefined);
const credentialRequests = [];
const clientCredentialToken = await shopifyAdminAccessToken({
  SHOPIFY_STORE_DOMAIN: "jerseysfrmjb.myshopify.com",
  SHOPIFY_CLIENT_ID: "client-id",
  SHOPIFY_CLIENT_SECRET: "client-secret"
}, {
  now: 1_000,
  fetchImpl: async (url, options) => {
    credentialRequests.push({ url, options });
    return new Response(JSON.stringify({ access_token: "short-lived-admin-token", expires_in: 86_399 }));
  }
});
assert.equal(clientCredentialToken, "short-lived-admin-token");
assert.equal(credentialRequests[0].url, "https://jerseysfrmjb.myshopify.com/admin/oauth/access_token");
assert.match(credentialRequests[0].options.body, /grant_type=client_credentials/);
assert.equal(JSON.stringify(shopifyConfiguration({
  SHOPIFY_STORE_DOMAIN: "jerseysfrmjb.myshopify.com",
  SHOPIFY_CLIENT_ID: "client-id",
  SHOPIFY_CLIENT_SECRET: "client-secret"
})).includes("client-secret"), false);

assert.deepEqual(normalizeShopifySizes('{"M":2,"L":0}', "", 0), { M: 2, L: 0 });
assert.equal(shopifySku("club-barcelona-yamal-home-2627", "M"), "JFB-CLUB-BARCELONA-YAMAL-HOME-2627-M");

const singleSize = buildShopifyProduct(row());
assert.equal(singleSize.websitePrice, 50, "Website price wins");
assert.equal(singleSize.variants.length, 1);
assert.equal(singleSize.variants[0].quantity, 2);
assert.equal(singleSize.variants[0].sku, "JFB-CLUB-BARCELONA-YAMAL-HOME-2627-M");
assert.match(singleSize.productUrl, /\/products\/club-barcelona-yamal-home-2627$/);
assert.equal(singleSize.photos.length, 2);

const baseFallback = buildShopifyProduct(row({ website_price: null, base_price: 44 }));
assert.equal(baseFallback.websitePrice, 44, "base price is the checkout fallback");
const multiSize = buildShopifyProduct(row({
  id: "world-argentina-messi-home-2026",
  name: "Lionel Messi #10 | Argentina 2026 World Cup Home",
  sizes_json: JSON.stringify({ S: 1, M: 2, L: 1 }),
  quantity: 4,
  shopify_variant_mappings_json: JSON.stringify([{ size: "M", shopify_variant_id: "gid://shopify/ProductVariant/22" }])
}));
assert.deepEqual(multiSize.variants.map(variant => variant.size), ["S", "M", "L"]);
assert.equal(multiSize.variants.find(variant => variant.size === "M").shopifyVariantId, "gid://shopify/ProductVariant/22");
const soldOut = buildShopifyProduct(row({ id: "retro-sold-out", category: "retro", sizes_json: '{"M":0}', quantity: 0 }));
assert.equal(soldOut.variants[0].quantity, 0);
const nonPilotInStock = buildShopifyProduct(row({ pilot_enabled: 0 }));

const syncInput = productSetInput(multiSize, { locationId: "gid://shopify/Location/1" });
assert.equal(syncInput.vendor, "JerseysFrmJB");
assert.equal(syncInput.status, "ACTIVE");
assert.deepEqual(syncInput.productOptions[0].values.map(item => item.name), ["S", "M", "L"]);
assert.equal(syncInput.variants.find(variant => variant.sku.endsWith("-M")).id, "gid://shopify/ProductVariant/22");
assert.equal(syncInput.variants[0].inventoryQuantities[0].quantity, 1);
assert.equal(syncInput.files.length, 2);
assert.ok(syncInput.tags.includes("World Cup"));
assert.equal(syncInput.metafields.find(field => field.key === "d1_product_id").value, multiSize.id);
assert.equal(productSetInput(nonPilotInStock).status, "ACTIVE", "all in-stock products are checkout eligible");
assert.equal(productSetInput(soldOut).status, "DRAFT", "sold-out products remain unavailable");
assert.equal((await shopifyPayloadHash(multiSize, { locationId: "gid://shopify/Location/1" })).length, 64);
assert.notEqual(
  await shopifyPayloadHash(multiSize),
  await shopifyPayloadHash(buildShopifyProduct(row({
    id: multiSize.id,
    name: multiSize.title,
    sizes_json: JSON.stringify({ S: 1, M: 1, L: 1 }),
    quantity: 3
  }))),
  "inventory-only changes alter the sync fingerprint"
);
assert.deepEqual(previewAction(singleSize, "new-hash"), { action: "create", status: "ready" });
const exactPreview = safeProductSummary(singleSize, "create", "ready", {
  locationId: "gid://shopify/Location/1",
  publicationId: "gid://shopify/Publication/5"
});
assert.equal(exactPreview.shopify_request_preview.operation, "productSet");
assert.equal(exactPreview.shopify_request_preview.variables.input.variants[0].inventoryQuantities[0].locationId, "gid://shopify/Location/1");
assert.equal(exactPreview.shopify_request_preview.publication.variables.publicationId, "gid://shopify/Publication/5");

const setupLocations = [
  { id: "inactive", isActive: false, fulfillsOnlineOrders: false },
  { id: "active", isActive: true, fulfillsOnlineOrders: false },
  { id: "online", isActive: true, fulfillsOnlineOrders: true }
];
assert.equal(recommendShopifyLocation(setupLocations).id, "online");
assert.equal(recommendShopifyPublication([{ id: "online", name: "Online Store" }, { id: "headless", name: "Headless" }]).id, "headless");

const setupFetch = async (url, options) => {
  const request = JSON.parse(options.body);
  if (request.query.includes("JerseysFrmJBShopifyConnection")) return new Response(JSON.stringify({ data: {
    shop: { name: "JerseysFrmJB", myshopifyDomain: "jerseysfrmjb.myshopify.com", currencyCode: "USD" },
    currentAppInstallation: { accessScopes: ["read_products", "write_products", "read_inventory", "write_inventory", "read_locations", "read_publications", "write_publications", "read_orders", "read_fulfillments"].map(handle => ({ handle })) }
  } }));
  if (request.query.includes("JerseysFrmJBLocations")) return new Response(JSON.stringify({ data: { locations: { nodes: [{ id: "gid://shopify/Location/1", name: "Main", isActive: true, fulfillsOnlineOrders: true }] } } }));
  if (request.query.includes("JerseysFrmJBPublications")) return new Response(JSON.stringify({ data: { publications: { nodes: [{ id: "gid://shopify/Publication/5", name: "Headless", autoPublish: false, supportsFuturePublishing: true }] } } }));
  if (request.query.includes("JerseysFrmJBWebhookSubscriptions")) return new Response(JSON.stringify({ data: { webhookSubscriptions: { nodes: [] } } }));
  return new Response(JSON.stringify({ data: { webhookSubscriptionCreate: { webhookSubscription: { id: "gid://shopify/WebhookSubscription/1", topic: request.variables.topic, uri: SHOPIFY_WEBHOOK_URI }, userErrors: [] } } }));
};
const setupAudit = await inspectShopifySetup(env, { fetchImpl: setupFetch });
assert.equal(setupAudit.connected, true);
assert.equal(setupAudit.missing_scopes.length, 0);
assert.equal(setupAudit.recommended_location_id, "gid://shopify/Location/1");
assert.equal(setupAudit.recommended_publication_id, "gid://shopify/Publication/5");
assert.deepEqual(setupAudit.missing_webhook_topics, REQUIRED_SHOPIFY_WEBHOOK_TOPICS);
const webhookRegistrations = await registerShopifyWebhooks(env, { fetchImpl: setupFetch });
assert.equal(webhookRegistrations.length, REQUIRED_SHOPIFY_WEBHOOK_TOPICS.length);
assert.equal(webhookRegistrations.every(item => item.status === "created"), true);
const existingWebhookFetch = async (url, options) => {
  const request = JSON.parse(options.body);
  assert.match(request.query, /JerseysFrmJBWebhookSubscriptions/);
  return new Response(JSON.stringify({ data: { webhookSubscriptions: { nodes: REQUIRED_SHOPIFY_WEBHOOK_TOPICS.map((topic, index) => ({
    id: `gid://shopify/WebhookSubscription/${index + 1}`,
    topic,
    uri: SHOPIFY_WEBHOOK_URI
  })) } } }));
};
const idempotentRegistrations = await registerShopifyWebhooks(env, { fetchImpl: existingWebhookFetch });
assert.equal(idempotentRegistrations.every(item => item.status === "existing"), true);

const pilots = suggestedPilotProducts([
  singleSize,
  multiSize,
  buildShopifyProduct(row({ id: "low-stock", sizes_json: '{"M":1}', quantity: 1 }))
]);
assert.equal(pilots.length, 3);
assert.equal(new Set(pilots).size, 3, "pilot suggestions contain three unique products");

const skuCapture = [];
const existing = await findShopifyProductBySku(env, singleSize.variants[0].sku, {
  fetchImpl: jsonFetch({ data: { productVariants: { nodes: [{
    id: "gid://shopify/ProductVariant/9",
    sku: singleSize.variants[0].sku,
    product: { id: "gid://shopify/Product/7", handle: "yamal-home" },
    inventoryItem: { id: "gid://shopify/InventoryItem/8" }
  }] } } }, 200, skuCapture)
});
assert.equal(existing.product.id, "gid://shopify/Product/7");
assert.match(skuCapture[0].body.variables.query, /^sku:JFB-/);

await assert.rejects(() => findShopifyProductBySku(env, singleSize.variants[0].sku, {
  fetchImpl: jsonFetch({ data: { productVariants: { nodes: [
    { id: "a", sku: singleSize.variants[0].sku, product: { id: "product-a" } },
    { id: "b", sku: singleSize.variants[0].sku, product: { id: "product-b" } }
  ] } } })
}), /Duplicate Shopify variants/);

const applyCapture = [];
const applied = await applyShopifyProduct(env, singleSize, {
  locationId: "gid://shopify/Location/1",
  publicationId: "gid://shopify/Publication/5",
  fetchImpl: async (url, options) => {
    const request = JSON.parse(options.body);
    applyCapture.push(request);
    if (request.query.includes("ExistingJerseysFrmJBVariant")) {
      return new Response(JSON.stringify({ data: { productVariants: { nodes: [] } } }));
    }
    if (request.query.includes("PublishJerseysFrmJBProduct")) {
      return new Response(JSON.stringify({ data: { publishablePublish: {
        publishable: { publishedOnPublication: true }, userErrors: []
      } } }));
    }
    return new Response(JSON.stringify({ data: { productSet: {
      product: { id: "gid://shopify/Product/100", handle: "yamal", title: singleSize.title, variants: { nodes: [] } },
      userErrors: []
    } } }));
  }
});
assert.equal(applied.product.id, "gid://shopify/Product/100");
assert.equal(applied.publicationId, "gid://shopify/Publication/5");
assert.equal(applyCapture.find(request => request.query.includes("SyncJerseysFrmJBProduct")).variables.input.variants[0].sku, singleSize.variants[0].sku);
assert.equal(applyCapture.at(-1).variables.publicationId, "gid://shopify/Publication/5");

const nonPilotApplyCapture = [];
await applyShopifyProduct(env, nonPilotInStock, {
  locationId: "gid://shopify/Location/1",
  publicationId: "gid://shopify/Publication/5",
  fetchImpl: async (url, options) => {
    const request = JSON.parse(options.body);
    nonPilotApplyCapture.push(request);
    if (request.query.includes("ExistingJerseysFrmJBVariant")) {
      return new Response(JSON.stringify({ data: { productVariants: { nodes: [] } } }));
    }
    if (request.query.includes("PublishJerseysFrmJBProduct")) {
      return new Response(JSON.stringify({ data: { publishablePublish: {
        publishable: { publishedOnPublication: true }, userErrors: []
      } } }));
    }
    return new Response(JSON.stringify({ data: { productSet: {
      product: { id: "gid://shopify/Product/101", handle: "non-pilot", title: nonPilotInStock.title, variants: { nodes: [] } },
      userErrors: []
    } } }));
  }
});
assert.equal(
  nonPilotApplyCapture.some(request => request.query.includes("PublishJerseysFrmJBProduct")),
  true,
  "non-pilot in-stock products publish to the Storefront channel"
);

await assert.rejects(() => shopifyGraphql(env, "admin", "query Test { shop { name } }", {}, {
  fetchImpl: jsonFetch({ errors: [{ message: "API unavailable" }] }, 500)
}), /returned 500/);

const rawCart = {
  id: "gid://shopify/Cart/opaque",
  checkoutUrl: "https://jerseysfrmjb.myshopify.com/checkouts/opaque",
  totalQuantity: 1,
  cost: { subtotalAmount: { amount: "50.00", currencyCode: "USD" }, totalAmount: { amount: "50.00", currencyCode: "USD" } },
  lines: { nodes: [{
    id: "gid://shopify/CartLine/1",
    quantity: 1,
    cost: { totalAmount: { amount: "50.00" } },
    merchandise: { id: "gid://shopify/ProductVariant/9", title: "M", sku: singleSize.variants[0].sku, product: { title: singleSize.title }, image: { url: "https://cdn.shopify.com/image.jpg", altText: "front" } }
  }] }
};
assert.equal(publicCart(rawCart).lines[0].size, "M");
assert.equal(publicCart(rawCart).checkout_url.includes("opaque"), true);

for (const operation of [
  [getCart, [env, rawCart.id], "query JerseysFrmJBCart", { data: { cart: rawCart } }],
  [createCart, [env, { merchandiseId: "variant", quantity: 1 }], "mutation JerseysFrmJBCartCreate", { data: { cartCreate: { cart: rawCart, userErrors: [] } } }],
  [addCartLine, [env, rawCart.id, { merchandiseId: "variant", quantity: 1 }], "mutation JerseysFrmJBCartAdd", { data: { cartLinesAdd: { cart: rawCart, userErrors: [] } } }],
  [updateCartLine, [env, rawCart.id, rawCart.lines.nodes[0].id, 2], "mutation JerseysFrmJBCartUpdate", { data: { cartLinesUpdate: { cart: rawCart, userErrors: [] } } }],
  [removeCartLine, [env, rawCart.id, rawCart.lines.nodes[0].id], "mutation JerseysFrmJBCartRemove", { data: { cartLinesRemove: { cart: rawCart, userErrors: [] } } }]
]) {
  const [fn, args, expectedQuery, response] = operation;
  const capture = [];
  const cart = await fn(...args, { fetchImpl: jsonFetch(response, 200, capture) });
  assert.equal(cart.id, rawCart.id);
  assert.match(capture[0].body.query, new RegExp(expectedQuery));
  assert.equal(capture[0].options.headers["X-Shopify-Storefront-Access-Token"], "storefront-test-token");
}

const disabledCart = await cartEndpoint({
  request: new Request("https://jerseysfrmjb.com/api/shopify/cart", { method: "POST", body: "{}" }),
  env: { DB: {} }
});
assert.equal(disabledCart.status, 409, "checkout stays unavailable when the flag is omitted");

const cartDatabaseCalls = [];
const cartDatabase = {
  prepare(sql) {
    cartDatabaseCalls.push(sql);
    return {
      bind() { return this; },
      async first() {
        return {
          id: singleSize.id,
          name: singleSize.title,
          sizes_json: JSON.stringify({ M: 2 }),
          shopify_product_id: "gid://shopify/Product/100",
          shopify_variant_id: "gid://shopify/ProductVariant/9",
          size: "M"
        };
      }
    };
  }
};
const originalFetch = globalThis.fetch;
const repairedCartRequests = [];
let storefrontAttempts = 0;
globalThis.fetch = async (url, options) => {
  const request = JSON.parse(options.body);
  repairedCartRequests.push(request);
  if (request.query.includes("JerseysFrmJBCartCreate")) {
    storefrontAttempts += 1;
    if (storefrontAttempts === 1) {
      return new Response(JSON.stringify({ data: { cartCreate: {
        cart: null,
        userErrors: [{ field: ["input", "lines", "0", "merchandiseId"], message: "The merchandise with this ID does not exist." }]
      } } }));
    }
    return new Response(JSON.stringify({ data: { cartCreate: { cart: rawCart, userErrors: [] } } }));
  }
  if (request.query.includes("ActivateJerseysFrmJBCheckoutProduct")) {
    return new Response(JSON.stringify({ data: { productUpdate: {
      product: { id: "gid://shopify/Product/100", status: "ACTIVE" }, userErrors: []
    } } }));
  }
  if (request.query.includes("PublishJerseysFrmJBProduct")) {
    return new Response(JSON.stringify({ data: { publishablePublish: {
      publishable: { publishedOnPublication: true }, userErrors: []
    } } }));
  }
  throw new Error(`Unexpected Shopify operation: ${request.query}`);
};
try {
  const repairedCartResponse = await cartEndpoint({
    request: new Request("https://jerseysfrmjb.com/api/shopify/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", product_id: singleSize.id, size: "M", quantity: 1 })
    }),
    env: {
      ...env,
      DB: cartDatabase,
      SHOPIFY_CHECKOUT_ENABLED: "true",
      SHOPIFY_PUBLICATION_ID: "gid://shopify/Publication/5"
    }
  });
  assert.equal(repairedCartResponse.status, 200);
  assert.equal((await repairedCartResponse.json()).cart.id, rawCart.id);
} finally {
  globalThis.fetch = originalFetch;
}
assert.equal(storefrontAttempts, 2, "cart creation retries once after repairing publication");
assert.equal(repairedCartRequests.some(request => request.query.includes("ActivateJerseysFrmJBCheckoutProduct")), true);
assert.equal(repairedCartRequests.some(request => request.query.includes("PublishJerseysFrmJBProduct")), true);
assert.equal(cartDatabaseCalls.length, 1, "publication repair performs no D1 inventory writes");

let staleCartAddAttempts = 0;
let staleCartCreateAttempts = 0;
globalThis.fetch = async (url, options) => {
  const request = JSON.parse(options.body);
  if (request.query.includes("JerseysFrmJBCartAdd")) {
    staleCartAddAttempts += 1;
    return new Response(JSON.stringify({ data: { cartLinesAdd: {
      cart: null,
      userErrors: [{ field: ["cartId"], message: "The cart specified does not exist." }]
    } } }));
  }
  if (request.query.includes("JerseysFrmJBCartCreate")) {
    staleCartCreateAttempts += 1;
    return new Response(JSON.stringify({ data: { cartCreate: { cart: rawCart, userErrors: [] } } }));
  }
  throw new Error(`Unexpected Shopify operation: ${request.query}`);
};
try {
  const recoveredCartResponse = await cartEndpoint({
    request: new Request("https://jerseysfrmjb.com/api/shopify/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add",
        cart_id: "gid://shopify/Cart/expired",
        product_id: singleSize.id,
        size: "M",
        quantity: 1
      })
    }),
    env: {
      ...env,
      DB: cartDatabase,
      SHOPIFY_CHECKOUT_ENABLED: "true"
    }
  });
  assert.equal(recoveredCartResponse.status, 200, "an expired saved cart is replaced in the same request");
  assert.equal((await recoveredCartResponse.json()).cart.id, rawCart.id);
} finally {
  globalThis.fetch = originalFetch;
}
assert.equal(staleCartAddAttempts, 1);
assert.equal(staleCartCreateAttempts, 1, "the selected jersey is retained in a newly created cart");

let unavailableAttempts = 0;
globalThis.fetch = async (url, options) => {
  const request = JSON.parse(options.body);
  if (request.query.includes("JerseysFrmJBCartAdd")) {
    unavailableAttempts += 1;
    return new Response(JSON.stringify({ data: { cartLinesAdd: {
      cart: null,
      userErrors: [{ field: ["lines", "0", "merchandiseId"], message: "The merchandise with this ID does not exist." }]
    } } }));
  }
  if (request.query.includes("ActivateJerseysFrmJBCheckoutProduct")) {
    return new Response(JSON.stringify({ data: { productUpdate: {
      product: { id: "gid://shopify/Product/100", status: "ACTIVE" }, userErrors: []
    } } }));
  }
  if (request.query.includes("PublishJerseysFrmJBProduct")) {
    return new Response(JSON.stringify({ data: { publishablePublish: {
      publishable: { publishedOnPublication: true }, userErrors: []
    } } }));
  }
  throw new Error(`Unexpected Shopify operation: ${request.query}`);
};
try {
  const unavailableResponse = await cartEndpoint({
    request: new Request("https://jerseysfrmjb.com/api/shopify/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add",
        cart_id: rawCart.id,
        product_id: singleSize.id,
        size: "M",
        quantity: 1
      })
    }),
    env: {
      ...env,
      DB: cartDatabase,
      SHOPIFY_CHECKOUT_ENABLED: "true",
      SHOPIFY_PUBLICATION_ID: "gid://shopify/Publication/5"
    }
  });
  const unavailableBody = await unavailableResponse.json();
  assert.equal(unavailableResponse.status, 502);
  assert.equal(unavailableBody.clear_cart, false, "a merchandise error never clears a valid cart");
  assert.match(unavailableBody.error, /merchandise/i);
} finally {
  globalThis.fetch = originalFetch;
}
assert.equal(unavailableAttempts, 5, "publication repair allows Shopify time to finish publishing");

let delayedPublicationAttempts = 0;
globalThis.fetch = async (url, options) => {
  const request = JSON.parse(options.body);
  if (request.query.includes("JerseysFrmJBCartAdd")) {
    delayedPublicationAttempts += 1;
    if (delayedPublicationAttempts < 4) {
      return new Response(JSON.stringify({ data: { cartLinesAdd: {
        cart: null,
        userErrors: [{ field: ["lines", "0", "merchandiseId"], message: "The merchandise with this ID does not exist." }]
      } } }));
    }
    return new Response(JSON.stringify({ data: { cartLinesAdd: { cart: rawCart, userErrors: [] } } }));
  }
  if (request.query.includes("ActivateJerseysFrmJBCheckoutProduct")) {
    return new Response(JSON.stringify({ data: { productUpdate: {
      product: { id: "gid://shopify/Product/100", status: "ACTIVE" }, userErrors: []
    } } }));
  }
  if (request.query.includes("PublishJerseysFrmJBProduct")) {
    return new Response(JSON.stringify({ data: { publishablePublish: {
      publishable: { publishedOnPublication: true }, userErrors: []
    } } }));
  }
  throw new Error(`Unexpected Shopify operation: ${request.query}`);
};
try {
  const delayedPublicationResponse = await cartEndpoint({
    request: new Request("https://jerseysfrmjb.com/api/shopify/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add",
        cart_id: rawCart.id,
        product_id: singleSize.id,
        size: "M",
        quantity: 1
      })
    }),
    env: {
      ...env,
      DB: cartDatabase,
      SHOPIFY_CHECKOUT_ENABLED: "true",
      SHOPIFY_PUBLICATION_ID: "gid://shopify/Publication/5"
    }
  });
  assert.equal(delayedPublicationResponse.status, 200, "the first click waits for Storefront publication");
  assert.equal((await delayedPublicationResponse.json()).cart.id, rawCart.id);
} finally {
  globalThis.fetch = originalFetch;
}
assert.equal(delayedPublicationAttempts, 4, "the existing cart receives the jersey after publication propagation");

const webhookBody = new TextEncoder().encode('{"id":1}');
const hmacKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.SHOPIFY_WEBHOOK_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
const signatureBytes = new Uint8Array(await crypto.subtle.sign("HMAC", hmacKey, webhookBody));
const signature = Buffer.from(signatureBytes).toString("base64");
assert.equal(await verifyShopifyWebhook(webhookBody, signature, env.SHOPIFY_WEBHOOK_SECRET), true);
assert.equal(await verifyShopifyWebhook(webhookBody, `${signature}x`, env.SHOPIFY_WEBHOOK_SECRET), false);

const invalidWebhook = await webhookEndpoint({
  request: new Request("https://jerseysfrmjb.com/api/shopify/webhooks", {
    method: "POST",
    headers: { "X-Shopify-Hmac-Sha256": "invalid" },
    body: webhookBody
  }),
  env: { DB: {}, SHOPIFY_WEBHOOK_SECRET: env.SHOPIFY_WEBHOOK_SECRET }
});
assert.equal(invalidWebhook.status, 401);

function passiveDatabase(options = {}) {
  const statements = [];
  let batchCalls = 0;
  return {
    statements,
    get batchCalls() { return batchCalls; },
    prepare(sql) {
      let bindings = [];
      return {
        bind(...values) { bindings = values; return this; },
        async run() { statements.push({ sql, bindings }); return { success: true }; },
        async first() {
          statements.push({ sql, bindings });
          return options.processedWebhook && /SELECT status FROM shopify_webhook_events/.test(sql)
            ? { status: "processed" }
            : null;
        },
        async all() { statements.push({ sql, bindings }); return { results: [] }; }
      };
    },
    async batch(items) { batchCalls += 1; return items.map(() => ({ success: true })); }
  };
}

for (const [topic, payload] of [
  ["orders/create", sanitizeWebhookPayload({ id: 200, financial_status: "pending", line_items: [{ id: 1, variant_id: 9, quantity: 1 }] })],
  ["orders/cancelled", sanitizeWebhookPayload({ id: 201, financial_status: "voided", cancelled_at: "2026-08-06T12:00:00Z" })]
]) {
  const DB = passiveDatabase();
  const result = await processSanitizedWebhook({ DB }, topic, payload);
  assert.equal(result.inventory_changed, false);
  assert.equal(DB.batchCalls, 0, `${topic} never changes inventory or creates a sale`);
  assert.equal(DB.statements.some(statement => /INSERT INTO sales/.test(statement.sql)), false);
}

for (const [refundId, amount] of [[301, "10.00"], [302, "50.00"]]) {
  const DB = passiveDatabase();
  const payload = sanitizeWebhookPayload({
    id: refundId,
    order_id: 200,
    transactions: [{ kind: "refund", amount }]
  });
  const result = await processSanitizedWebhook({ DB }, "refunds/create", payload);
  assert.equal(result.inventory_changed, false);
  assert.equal(DB.batchCalls, 0);
  assert.ok(DB.statements.some(statement => /INSERT INTO shopify_refunds/.test(statement.sql)));
  assert.ok(DB.statements.some(statement => /SELECT SUM\(amount\) FROM shopify_refunds/.test(statement.sql)));
}

const duplicateDb = passiveDatabase({ processedWebhook: true });
const duplicateBodyText = JSON.stringify({ id: 999, financial_status: "paid" });
const duplicateBody = new TextEncoder().encode(duplicateBodyText);
const duplicateSignatureBytes = new Uint8Array(await crypto.subtle.sign("HMAC", hmacKey, duplicateBody));
const duplicateResponse = await webhookEndpoint({
  request: new Request("https://jerseysfrmjb.com/api/shopify/webhooks", {
    method: "POST",
    headers: {
      "X-Shopify-Hmac-Sha256": Buffer.from(duplicateSignatureBytes).toString("base64"),
      "X-Shopify-Webhook-Id": "already-processed",
      "X-Shopify-Topic": "orders/paid"
    },
    body: duplicateBodyText
  }),
  env: { DB: duplicateDb, SHOPIFY_WEBHOOK_SECRET: env.SHOPIFY_WEBHOOK_SECRET }
});
assert.equal(duplicateResponse.status, 200);
assert.equal((await duplicateResponse.json()).duplicate, true);
assert.equal(duplicateDb.batchCalls, 0, "duplicate paid webhook cannot decrement inventory twice");

const sanitized = sanitizeWebhookPayload({
  id: 100,
  order_number: 44,
  email: "private@example.com",
  customer: { first_name: "Private" },
  shipping_address: { address1: "Private" },
  financial_status: "paid",
  subtotal_price: "50.00",
  line_items: [{ id: 2, variant_id: 9, sku: singleSize.variants[0].sku, title: singleSize.title, variant_title: "M", quantity: 1, price: "50.00" }],
  refunds: [{ id: 3, transactions: [{ kind: "refund", amount: "10.00" }] }]
});
assert.equal(sanitized.line_items[0].quantity, 1);
assert.equal(sanitized.refunds[0].amount, 10);
const sanitizedText = JSON.stringify(sanitized);
assert.doesNotMatch(sanitizedText, /private@example|first_name|shipping_address|address1/i);

const pageRow = row({
  price: 45,
  photos: JSON.stringify([{ src: "/assets/inventory/example-front.jpg", alt: "front" }]),
  links: JSON.stringify({ depop: "https://www.depop.com/products/test" }),
  depop_price: 50,
  ebay_price: null,
  facebook_price: null,
  shopify_pilot_enabled: 0,
  shopify_product_id: "gid://shopify/Product/100",
  shopify_variants_json: JSON.stringify([{ size: "M", variant_id: "gid://shopify/ProductVariant/9" }])
});
const pageModel = buildProductPageModel(pageRow, { siteOrigin: "https://jerseysfrmjb.com", shopifyCheckoutEnabled: true });
assert.equal(pageModel.shopify.enabled, true);
const pageHtml = renderProductPage(pageModel);
assert.match(pageHtml, /data-shopify-add/);
assert.match(pageHtml, /Continue to Secure Checkout/);
assert.match(pageHtml, /"name":"Website checkout"/);
assert.doesNotMatch(pageHtml, /2 remaining|quantity[^a-z]/i, "exact D1 quantities stay out of product HTML");

const migration = await readFile(path.join(workspace, "migrations", "0016_shopify_checkout.sql"), "utf8");
const webhookSource = await readFile(path.join(workspace, "functions", "api", "shopify", "_webhooks.js"), "utf8");
const cartSource = await readFile(path.join(workspace, "functions", "api", "shopify", "cart.js"), "utf8");
const clientSource = await readFile(path.join(workspace, "shopify-cart.js"), "utf8");
const storefrontSource = await readFile(path.join(workspace, "storefront.js"), "utf8");
const productPageSource = await readFile(path.join(workspace, "functions", "products", "[slug].js"), "utf8");
assert.match(migration, /shopify_refunds/);
assert.match(migration, /'pending', 'ready', 'processed', 'failed', 'needs_review'/);
assert.match(webhookSource, /processing_status = 'ready'/);
assert.match(webhookSource, /processing_status = 'processed'/);
assert.match(webhookSource, /INSERT INTO sales/);
assert.match(webhookSource, /INSERT OR IGNORE INTO shopify_commerce_events/);
assert.match(cartSource, /validateCartLineQuantity/);
assert.doesNotMatch(cartSource, /pilot_enabled/, "mapped Shopify products no longer require the retired pilot flag");
assert.match(clientSource, /AddToCart/);
assert.match(clientSource, /InitiateCheckout/);
assert.match(clientSource, /localStorage/);
assert.match(clientSource, /Shop directly on JerseysFrmJB/);
assert.doesNotMatch(clientSource, /SHOPIFY_(ADMIN|STOREFRONT|WEBHOOK)/);
assert.match(storefrontSource, /Choose Size &amp; Add to Cart/);
assert.match(storefrontSource, /Secure website checkout/);
assert.match(productPageSource, /if \(shopify\.checkout\) await ensureShopifySchema/);

console.log("Shopify checkout integration tests passed:");
console.log("- disabled-by-default flags and credential privacy");
console.log("- Website/base pricing, stable SKUs, sizes, images, tags, and payloads");
console.log("- one-size, multi-size, sold-out, low-stock, and three-product pilot cases");
console.log("- duplicate prevention, sync adoption, and API failure handling");
console.log("- Storefront cart create/get/add/update/remove operations");
console.log("- webhook HMAC, sanitized storage, refund dedupe schema, and paid-order safeguards");
console.log("- server-rendered checkout, Product offer, analytics events, and no public quantities");
