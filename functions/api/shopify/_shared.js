const DEFAULT_API_VERSION = "2026-07";

export function enabled(value) {
  return /^(1|true|yes|on)$/i.test(String(value || "").trim());
}

export function shopifyFlags(env = {}) {
  return {
    checkout: enabled(env.SHOPIFY_CHECKOUT_ENABLED),
    sync: enabled(env.SHOPIFY_SYNC_ENABLED)
  };
}

export function normalizeShopDomain(value = "") {
  const domain = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(domain) ? domain : "";
}

export function shopifyApiVersion(value = "") {
  const version = String(value || "").trim();
  return /^20\d{2}-(01|04|07|10)$/.test(version) ? version : DEFAULT_API_VERSION;
}

export function shopifyConfiguration(env = {}) {
  const flags = shopifyFlags(env);
  const storeDomain = normalizeShopDomain(env.SHOPIFY_STORE_DOMAIN);
  return {
    ...flags,
    storeDomain,
    apiVersion: shopifyApiVersion(env.SHOPIFY_API_VERSION),
    adminConfigured: Boolean(storeDomain && env.SHOPIFY_ADMIN_ACCESS_TOKEN),
    storefrontConfigured: Boolean(storeDomain && env.SHOPIFY_STOREFRONT_ACCESS_TOKEN),
    webhookConfigured: Boolean(env.SHOPIFY_WEBHOOK_SECRET),
    locationConfigured: Boolean(String(env.SHOPIFY_LOCATION_ID || "").trim()),
    publicationConfigured: Boolean(String(env.SHOPIFY_PUBLICATION_ID || "").trim())
  };
}

export class ShopifyApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ShopifyApiError";
    this.details = details;
  }
}

export async function sha256(value = "") {
  const bytes = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export async function verifyShopifyWebhook(rawBody, suppliedHmac, secret) {
  if (!rawBody || !suppliedHmac || !secret) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(String(secret)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, rawBody);
  const expected = bytesToBase64(new Uint8Array(signature));
  if (expected.length !== String(suppliedHmac).length) return false;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected.charCodeAt(index) ^ String(suppliedHmac).charCodeAt(index);
  }
  return mismatch === 0;
}

export async function shopifyGraphql(env, kind, query, variables = {}, options = {}) {
  const configuration = shopifyConfiguration(env);
  const admin = kind === "admin";
  const token = admin ? env.SHOPIFY_ADMIN_ACCESS_TOKEN : env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!configuration.storeDomain || !token) {
    throw new ShopifyApiError(`Shopify ${admin ? "Admin" : "Storefront"} API is not configured.`);
  }
  const path = admin ? "admin/api" : "api";
  const url = `https://${configuration.storeDomain}/${path}/${configuration.apiVersion}/graphql.json`;
  const fetchImpl = options.fetchImpl || fetch;
  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [admin ? "X-Shopify-Access-Token" : "X-Shopify-Storefront-Access-Token"]: token
    },
    body: JSON.stringify({ query, variables })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ShopifyApiError(`Shopify API returned ${response.status}.`, { status: response.status });
  }
  if (Array.isArray(body.errors) && body.errors.length) {
    throw new ShopifyApiError(body.errors.map(error => error.message).join("; "), { errors: body.errors });
  }
  return body.data || {};
}

export function shopifyNumericId(value = "") {
  return String(value || "").match(/(?:^|\/)(\d+)$/)?.[1] || String(value || "").trim();
}

function money(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

export function sanitizeWebhookPayload(payload = {}) {
  const lineItems = Array.isArray(payload.line_items) ? payload.line_items : [];
  const refunds = Array.isArray(payload.refunds) ? payload.refunds : [];
  return {
    id: String(payload.id || ""),
    order_id: String(payload.order_id || payload.id || ""),
    name: String(payload.name || payload.order_number || ""),
    order_number: String(payload.order_number || ""),
    financial_status: String(payload.financial_status || ""),
    fulfillment_status: String(payload.fulfillment_status || ""),
    currency: String(payload.currency || "USD").slice(0, 3),
    subtotal_price: money(payload.subtotal_price),
    total_discounts: money(payload.total_discounts),
    total_shipping_price_set: {
      shop_money: { amount: money(payload.total_shipping_price_set?.shop_money?.amount) }
    },
    total_tax: money(payload.total_tax),
    cancelled_at: payload.cancelled_at || null,
    processed_at: payload.processed_at || payload.created_at || null,
    line_items: lineItems.map((line, index) => ({
      id: String(line.id || `${payload.id || "order"}-${index}`),
      variant_id: String(line.variant_id || ""),
      sku: String(line.sku || "").slice(0, 180),
      title: String(line.title || line.name || "").slice(0, 300),
      variant_title: String(line.variant_title || "").slice(0, 80),
      quantity: Math.max(0, Math.floor(Number(line.quantity || 0))),
      price: money(line.price)
    })),
    refunds: refunds.map(refund => ({
      id: String(refund.id || ""),
      created_at: refund.created_at || null,
      amount: (Array.isArray(refund.transactions) ? refund.transactions : [])
        .filter(transaction => String(transaction.kind || "").toLowerCase() === "refund")
        .reduce((total, transaction) => total + money(transaction.amount), 0)
    })),
    refund_amount: (Array.isArray(payload.transactions) ? payload.transactions : [])
      .filter(transaction => ["refund", "void"].includes(String(transaction.kind || "").toLowerCase()))
      .reduce((total, transaction) => total + money(transaction.amount), 0)
  };
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers
    }
  });
}
