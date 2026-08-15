import {
  buildJerseyDescription,
  categoryLabel,
  extractSeason,
  inferCompetition,
  inferProductIdentity,
  productLandingUrl,
  slugifySeo
} from "../catalog/_products.js";
import { sha256, shopifyGraphql } from "./_shared.js";

export const SHOPIFY_SIZE_ORDER = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const SIZE_LABELS = {
  S: "Small",
  M: "Medium",
  L: "Large",
  XL: "Extra Large",
  "2XL": "2XL",
  "3XL": "3XL",
  "4XL": "4XL"
};
const SIZE_WORDS = [
  ["4XL", /4\s*x\s*l/i], ["3XL", /3\s*x\s*l/i], ["2XL", /2\s*x\s*l|xxl/i],
  ["XL", /\bxl\b|extra\s+large/i], ["L", /\bl\b|\blarge\b/i],
  ["M", /\bm\b|\bmedium\b/i], ["S", /\bs\b|\bsmall\b/i]
];

// Keep Shopify's remote media URL changing when a photo is replaced in-place.
// The inventory row remains the D1 source of truth, while the version query
// forces Shopify to fetch the refreshed binary instead of reusing its cached
// copy of the old URL.
const PHOTO_REFRESH_PRODUCTS = new Set([
  "retro-ronaldo-united-short-0708",
  "club-dortmund-away-2425"
]);

function parseJson(value, fallback) {
  try { return JSON.parse(value || ""); } catch { return fallback; }
}

function price(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function cleanTag(value = "") {
  return String(value || "").replace(/[,]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

function normalizeSize(value = "") {
  const compact = String(value || "").toUpperCase().replace(/\s+/g, "");
  if (SHOPIFY_SIZE_ORDER.includes(compact)) return compact;
  return SIZE_WORDS.find(([, pattern]) => pattern.test(String(value)))?.[0] || "";
}

export function normalizeShopifySizes(raw, fallbackSize = "", fallbackQuantity = 0) {
  const parsed = typeof raw === "string" ? parseJson(raw, {}) : (raw || {});
  const sizes = {};
  for (const size of SHOPIFY_SIZE_ORDER) {
    const quantity = Math.max(0, Math.floor(Number(parsed[size] || 0)));
    if (Object.prototype.hasOwnProperty.call(parsed, size) || quantity > 0) sizes[size] = quantity;
  }
  const fallbackMatches = SIZE_WORDS.filter(([, pattern]) => pattern.test(String(fallbackSize))).map(([size]) => size);
  for (const size of fallbackMatches) {
    if (!Object.prototype.hasOwnProperty.call(sizes, size)) sizes[size] = 0;
  }
  if (!Object.keys(sizes).length && Number(fallbackQuantity) > 0) {
    const fallback = normalizeSize(fallbackSize);
    if (fallback) sizes[fallback] = Math.max(0, Math.floor(Number(fallbackQuantity)));
  }
  return sizes;
}

export function shopifySku(productId, size) {
  const product = String(productId || "").trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  const normalizedSize = normalizeSize(size);
  return product && normalizedSize ? `JFB-${product}-${normalizedSize}`.slice(0, 180) : "";
}

function classification(row, title) {
  if (row.category !== "retro") return "fan";
  return /long\s*sleeve|longsleeve/i.test(title) ? "retro_long" : "retro_short";
}

function kitType(title = "") {
  return String(title).match(/\b(home|away|third|3rd|goalkeeper|training|special edition)\b/i)?.[1] || "";
}

function absoluteHttps(value, siteOrigin) {
  try {
    const url = new URL(String(value || ""), `${siteOrigin}/`);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function refreshPhotoUrl(productId, source) {
  const normalized = String(source || "").replace(/^\/+/, "");
  if (!PHOTO_REFRESH_PRODUCTS.has(String(productId || "").trim())) return source;
  if (!/^assets\/inventory\/(?:retro-ronaldo-short|club-dortmund)-(?:front|back)\.jpg$/i.test(normalized)) return source;
  return `${source}${String(source).includes("?") ? "&" : "?"}v=20260814`;
}

export function buildShopifyProduct(row = {}, options = {}) {
  const siteOrigin = String(options.siteOrigin || "https://jerseysfrmjb.com").replace(/\/$/, "");
  const id = String(row.id || "").trim();
  const title = String(row.name || "").replace(/\s+/g, " ").trim();
  const websitePrice = price(row.website_price) ?? price(row.base_price ?? row.price);
  const sizes = normalizeShopifySizes(row.sizes_json ?? row.sizes, row.size, row.quantity);
  const mappedVariants = parseJson(row.shopify_variant_mappings_json, []);
  const mappedBySize = new Map((Array.isArray(mappedVariants) ? mappedVariants : []).map(mapping => [
    normalizeSize(mapping?.size),
    mapping
  ]));
  const identity = inferProductIdentity(title);
  const season = extractSeason(title);
  const competition = inferCompetition(title, row.category);
  const edition = kitType(title);
  const jerseyClass = classification(row, title);
  const photos = (Array.isArray(row.photos) ? row.photos : parseJson(row.photos, []))
    .map(photo => ({
      url: absoluteHttps(refreshPhotoUrl(id, photo?.src), siteOrigin),
      alt: String(photo?.alt || `${title} jersey`).trim().slice(0, 250)
    }))
    .filter(photo => photo.url);
  const sortedPhotos = photos.sort((a, b) => Number(/back/i.test(a.url)) - Number(/back/i.test(b.url)));
  const variants = SHOPIFY_SIZE_ORDER
    .filter(size => Object.prototype.hasOwnProperty.call(sizes, size))
    .map(size => ({
      size,
      sizeLabel: SIZE_LABELS[size] || size,
      sku: shopifySku(id, size),
      quantity: Math.max(0, Math.floor(Number(sizes[size] || 0))),
      price: websitePrice,
      shopifyVariantId: String(mappedBySize.get(size)?.shopify_variant_id || ""),
      shopifyInventoryItemId: String(mappedBySize.get(size)?.shopify_inventory_item_id || "")
    }));
  const missing = [];
  if (!id) missing.push("D1 product ID");
  if (!title) missing.push("title");
  if (websitePrice === null) missing.push("Website/base price");
  if (!variants.length) missing.push("size information");
  if (!sortedPhotos.length) missing.push("front image");
  const tags = [
    "JerseysFrmJB",
    categoryLabel(row.category),
    identity.player,
    identity.team_country,
    season,
    competition,
    edition,
    jerseyClass === "fan" ? "Fan Version" : jerseyClass === "retro_long" ? "Retro Long Sleeve" : "Retro Short Sleeve"
  ].map(cleanTag).filter(Boolean);
  const description = buildJerseyDescription(row, {
    identity,
    availableSizes: variants.map(variant => variant.size)
  });
  const productUrl = productLandingUrl(id, siteOrigin);
  return {
    id,
    title,
    description,
    descriptionHtml: `<p>${description.replace(/[&<>]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character]).replace(/\n/g, "<br>")}</p>`,
    websitePrice,
    productUrl,
    identity,
    season,
    competition,
    edition,
    jerseyClass,
    category: String(row.category || ""),
    productType: categoryLabel(row.category),
    tags: [...new Set(tags)],
    photos: sortedPhotos,
    variants,
    missing,
    pilotEnabled: Boolean(row.pilot_enabled),
    shopifyProductId: String(row.shopify_product_id || ""),
    shopifyHandle: String(row.shopify_handle || ""),
    lastPayloadHash: String(row.last_payload_hash || "")
  };
}

export function productSetInput(product, options = {}) {
  const locationId = String(options.locationId || "").trim();
  const checkoutEligible = product.variants.some(variant => Number(variant.quantity || 0) > 0);
  return {
    title: product.title,
    descriptionHtml: product.descriptionHtml,
    vendor: "JerseysFrmJB",
    productType: product.productType,
    status: checkoutEligible ? "ACTIVE" : "DRAFT",
    tags: product.tags,
    productOptions: [{
      name: "Size",
      position: 1,
      values: product.variants.map(variant => ({ name: variant.size }))
    }],
    variants: product.variants.map(variant => ({
      ...(variant.shopifyVariantId ? { id: variant.shopifyVariantId } : {}),
      price: Number(variant.price || 0).toFixed(2),
      sku: variant.sku,
      optionValues: [{ optionName: "Size", name: variant.size }],
      ...(locationId ? {
        inventoryQuantities: [{ locationId, name: "available", quantity: variant.quantity }]
      } : {})
    })),
    files: product.photos.map(photo => ({
      originalSource: photo.url,
      alt: photo.alt,
      contentType: "IMAGE"
    })),
    seo: {
      title: `${product.title} | JerseysFrmJB`.slice(0, 70),
      description: product.description.slice(0, 320)
    },
    metafields: [
      { namespace: "custom", key: "d1_product_id", type: "single_line_text_field", value: product.id },
      { namespace: "custom", key: "jerseysfrmjb_url", type: "url", value: product.productUrl },
      { namespace: "custom", key: "player", type: "single_line_text_field", value: product.identity.player || "Not specified" },
      { namespace: "custom", key: "team_country", type: "single_line_text_field", value: product.identity.team_country || "Not specified" }
    ]
  };
}

export async function shopifyPayloadHash(product, options = {}) {
  const checkoutEligible = product.variants.some(variant => Number(variant.quantity || 0) > 0);
  return sha256(JSON.stringify({
    id: product.id,
    title: product.title,
    descriptionHtml: product.descriptionHtml,
    websitePrice: product.websitePrice,
    productUrl: product.productUrl,
    productType: product.productType,
    tags: product.tags,
    photos: product.photos,
    checkoutEligible,
    variants: product.variants.map(variant => ({
      size: variant.size,
      sku: variant.sku,
      quantity: variant.quantity,
      price: variant.price
    }))
  }));
}

export async function loadShopifySyncRows(env, productIds = []) {
  const ids = [...new Set(productIds.map(String).map(value => value.trim()).filter(Boolean))];
  const where = ids.length ? `WHERE inventory.id IN (${ids.map(() => "?").join(",")})` : "";
  const result = await env.DB.prepare(`
    SELECT inventory.*, inventory.price AS base_price,
      website_prices.price AS website_price,
      mappings.shopify_product_id, mappings.shopify_handle,
      mappings.pilot_enabled, mappings.sync_status, mappings.last_payload_hash,
      mappings.last_error, mappings.last_synced_at,
      COALESCE((
        SELECT json_group_array(json_object(
          'size', variant_mappings.size,
          'shopify_variant_id', variant_mappings.shopify_variant_id,
          'shopify_inventory_item_id', variant_mappings.shopify_inventory_item_id
        ))
        FROM shopify_variant_mappings AS variant_mappings
        WHERE variant_mappings.product_id = inventory.id
      ), '[]') AS shopify_variant_mappings_json
    FROM inventory
    LEFT JOIN product_platform_prices AS website_prices
      ON website_prices.product_id = inventory.id AND website_prices.platform = 'Website'
    LEFT JOIN shopify_product_mappings AS mappings ON mappings.product_id = inventory.id
    ${where}
    ORDER BY CASE WHEN inventory.quantity > 0 THEN 0 ELSE 1 END, inventory.sort_order, inventory.name
  `).bind(...ids).all();
  return result.results || [];
}

export async function discoverShopifyLocation(env, options = {}) {
  if (String(env.SHOPIFY_LOCATION_ID || "").trim()) return String(env.SHOPIFY_LOCATION_ID).trim();
  const data = await shopifyGraphql(env, "admin", `query ShopifyLocations { locations(first: 10) { nodes { id name isActive } } }`, {}, options);
  return data.locations?.nodes?.find(location => location.isActive)?.id || "";
}

export async function discoverShopifyPublication(env, options = {}) {
  const configured = String(options.publicationId || env.SHOPIFY_PUBLICATION_ID || "").trim();
  if (configured) return configured;
  const data = await shopifyGraphql(env, "admin", `
    query JerseysFrmJBPublications {
      publications(first: 25) { nodes { id name autoPublish supportsFuturePublishing } }
    }
  `, {}, options);
  const publications = data.publications?.nodes || [];
  const preferred = publications.filter(publication => /headless|online store/i.test(String(publication.name || "")));
  if (preferred.length === 1) return preferred[0].id;
  if (publications.length === 1) return publications[0].id;
  return "";
}

const PUBLISH_PRODUCT_MUTATION = `
  mutation PublishJerseysFrmJBProduct($id: ID!, $input: [PublicationInput!]!, $publicationId: ID!) {
    publishablePublish(id: $id, input: $input) {
      publishable { publishedOnPublication(publicationId: $publicationId) }
      userErrors { field message }
    }
  }
`;

export async function publishShopifyProduct(env, productId, publicationId, options = {}) {
  const data = await shopifyGraphql(env, "admin", PUBLISH_PRODUCT_MUTATION, {
    id: productId,
    input: [{ publicationId }],
    publicationId
  }, options);
  const payload = data.publishablePublish || {};
  if (payload.userErrors?.length) throw new Error(payload.userErrors.map(error => error.message).join("; "));
  return Boolean(payload.publishable?.publishedOnPublication);
}

const PRODUCT_SET_MUTATION = `
  mutation SyncJerseysFrmJBProduct($input: ProductSetInput!, $identifier: ProductSetIdentifiers) {
    productSet(synchronous: true, input: $input, identifier: $identifier) {
      product {
        id handle title
        variants(first: 100) { nodes { id sku inventoryQuantity inventoryItem { id } selectedOptions { name value } } }
      }
      userErrors { field message code }
    }
  }
`;

const PRODUCT_BY_SKU_QUERY = `
  query ExistingJerseysFrmJBVariant($query: String!) {
    productVariants(first: 3, query: $query) {
      nodes { id sku product { id handle } inventoryItem { id } }
    }
  }
`;

export async function findShopifyProductBySku(env, sku, options = {}) {
  const normalizedSku = String(sku || "").trim();
  if (!normalizedSku) return null;
  const data = await shopifyGraphql(env, "admin", PRODUCT_BY_SKU_QUERY, { query: `sku:${normalizedSku}` }, options);
  const exact = (data.productVariants?.nodes || []).filter(variant => variant.sku === normalizedSku);
  const productIds = [...new Set(exact.map(variant => variant.product?.id).filter(Boolean))];
  if (productIds.length > 1 || exact.length > 1) {
    throw new Error(`Duplicate Shopify variants already use SKU ${normalizedSku}. Resolve them in Shopify before syncing.`);
  }
  return exact[0] || null;
}

export async function applyShopifyProduct(env, product, options = {}) {
  if (product.missing.length) throw new Error(`Missing ${product.missing.join(", ")}.`);
  const locationId = options.locationId || await discoverShopifyLocation(env, options);
  if (!locationId) throw new Error("No active Shopify inventory location was found.");
  let identifierId = product.shopifyProductId;
  if (!identifierId && product.variants[0]?.sku) {
    const existing = await findShopifyProductBySku(env, product.variants[0].sku, options);
    if (existing?.product?.id) identifierId = existing.product.id;
  }
  const input = productSetInput(product, { locationId });
  const variables = {
    input,
    identifier: identifierId ? { id: identifierId } : null
  };
  const data = await shopifyGraphql(env, "admin", PRODUCT_SET_MUTATION, variables, options);
  const payload = data.productSet || {};
  if (payload.userErrors?.length) {
    throw new Error(payload.userErrors.map(error => error.message).join("; "));
  }
  if (!payload.product?.id) throw new Error("Shopify did not return a product ID.");
  let publicationId = "";
  const checkoutEligible = product.variants.some(variant => Number(variant.quantity || 0) > 0);
  if (checkoutEligible) {
    publicationId = await discoverShopifyPublication(env, options);
    if (!publicationId) {
      throw new Error("No unambiguous Shopify Storefront publication was found. Set SHOPIFY_PUBLICATION_ID before enabling website checkout.");
    }
    await publishShopifyProduct(env, payload.product.id, publicationId, options);
  }
  return {
    product: payload.product,
    locationId,
    publicationId,
    payloadHash: await shopifyPayloadHash(product)
  };
}

export function previewAction(product, payloadHash) {
  if (product.missing.length) return { action: "review", status: "missing_information" };
  if (!product.shopifyProductId) return { action: "create", status: "ready" };
  if (product.lastPayloadHash && product.lastPayloadHash === payloadHash) return { action: "skip", status: "unchanged" };
  return { action: "update", status: "ready" };
}

export function safeProductSummary(product, action, status, options = {}) {
  const locationId = String(options.locationId || "").trim();
  const publicationId = String(options.publicationId || "").trim();
  const checkoutEligible = product.variants.some(variant => Number(variant.quantity || 0) > 0);
  return {
    product_id: product.id,
    title: product.title,
    action,
    status,
    pilot_enabled: product.pilotEnabled,
    website_price: product.websitePrice,
    variants: product.variants.map(variant => ({
      size: variant.size,
      sku: variant.sku,
      quantity: variant.quantity
    })),
    images: product.photos.map(photo => photo.url),
    missing: product.missing,
    shopify_product_id: product.shopifyProductId,
    shopify_request_preview: {
      operation: "productSet",
      variables: {
        input: productSetInput(product, { locationId }),
        identifier: product.shopifyProductId ? { id: product.shopifyProductId } : null
      },
      publication: checkoutEligible ? {
        operation: "publishablePublish",
        variables: {
          id: product.shopifyProductId || "<Shopify product ID returned by productSet>",
          input: [{ publicationId: publicationId || "<SHOPIFY_PUBLICATION_ID required>" }],
          publicationId: publicationId || "<SHOPIFY_PUBLICATION_ID required>"
        }
      } : null
    },
    inventory_location_id: locationId,
    inventory_location_pending: !locationId,
    publication: checkoutEligible ? {
      operation: "publishablePublish",
      publication_id: publicationId,
      publication_pending: !publicationId
    } : null
  };
}

export function suggestedPilotProducts(products = []) {
  const ready = products.filter(product => !product.missing.length && product.variants.some(variant => variant.quantity > 0));
  const oneSize = ready.find(product => product.variants.filter(variant => variant.quantity > 0).length === 1);
  const multiSize = ready.find(product => product.id !== oneSize?.id && product.variants.filter(variant => variant.quantity > 0).length > 1);
  const lowInventory = ready
    .filter(product => ![oneSize?.id, multiSize?.id].includes(product.id))
    .sort((a, b) => a.variants.reduce((sum, item) => sum + item.quantity, 0) - b.variants.reduce((sum, item) => sum + item.quantity, 0))[0];
  return [oneSize, multiSize, lowInventory].filter(Boolean).map(product => product.id);
}

export { normalizeSize };
