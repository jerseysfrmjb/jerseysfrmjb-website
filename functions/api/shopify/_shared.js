const DEFAULT_API_VERSION = "2026-07";
const adminTokenCache = new Map();

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
  const hasLegacyAdminToken = Boolean(String(env.SHOPIFY_ADMIN_ACCESS_TOKEN || "").trim());
  const hasClientCredentials = Boolean(
    String(env.SHOPIFY_CLIENT_ID || "").trim()
    && String(env.SHOPIFY_CLIENT_SECRET || "").trim()
  );
  return {
    ...flags,
    storeDomain,
    apiVersion: shopifyApiVersion(env.SHOPIFY_API_VERSION),
    adminConfigured: Boolean(storeDomain && (hasLegacyAdminToken || hasClientCredentials)),
    adminAuthMode: hasClientCredentials ? "client_credentials" : hasLegacyAdminToken ? "legacy_token" : "missing",
    storefrontConfigured: Boolean(storeDomain && (
      String(env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN || "").trim()
      || String(env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "").trim()
    )),
    webhookConfigured: Boolean(shopifyWebhookSecret(env)),
    locationConfigured: Boolean(String(env.SHOPIFY_LOCATION_ID || "").trim()),
    publicationConfigured: Boolean(String(env.SHOPIFY_PUBLICATION_ID || "").trim())
  };
}

function shopifyStorefrontToken(env = {}) {
  return String(
    env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN
    || env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
    || ""
  ).trim();
}

function storefrontTokenHeader(token) {
  return /^shpat_/i.test(String(token || ""))
    ? "Shopify-Storefront-Private-Token"
    : "X-Shopify-Storefront-Access-Token";
}

export function shopifyWebhookSecret(env = {}) {
  return String(env.SHOPIFY_WEBHOOK_SECRET || env.SHOPIFY_CLIENT_SECRET || "").trim();
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

function adminTokenCacheKey(configuration, env) {
  return `${configuration.storeDomain}:${String(env.SHOPIFY_CLIENT_ID || "").trim()}`;
}

export function clearShopifyAdminTokenCache(env = {}) {
  const configuration = shopifyConfiguration(env);
  adminTokenCache.delete(adminTokenCacheKey(configuration, env));
}

export async function shopifyAdminAccessToken(env, options = {}) {
  const legacyToken = String(env.SHOPIFY_ADMIN_ACCESS_TOKEN || "").trim();
  if (legacyToken) return legacyToken;
  const configuration = shopifyConfiguration(env);
  const clientId = String(env.SHOPIFY_CLIENT_ID || "").trim();
  const clientSecret = String(env.SHOPIFY_CLIENT_SECRET || "").trim();
  if (!configuration.storeDomain || !clientId || !clientSecret) {
    throw new ShopifyApiError("Shopify Admin API is not configured.");
  }
  const cacheKey = adminTokenCacheKey(configuration, env);
  const now = Number(options.now || Date.now());
  const cached = adminTokenCache.get(cacheKey);
  if (cached?.token && cached.expiresAt > now + 60_000) return cached.token;
  const fetchImpl = options.fetchImpl || fetch;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret
  });
  const response = await fetchImpl(`https://${configuration.storeDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });
  const payload = await response.json().catch(() => ({}));
  const token = String(payload.access_token || "").trim();
  if (!response.ok || !token) {
    throw new ShopifyApiError(`Shopify authentication returned ${response.status}.`, { status: response.status });
  }
  const expiresIn = Math.max(300, Number(payload.expires_in || 86_399));
  adminTokenCache.set(cacheKey, {
    token,
    expiresAt: now + Math.max(60, expiresIn - 300) * 1000
  });
  return token;
}

export async function shopifyGraphql(env, kind, query, variables = {}, options = {}) {
  const configuration = shopifyConfiguration(env);
  const admin = kind === "admin";
  const token = admin
    ? await shopifyAdminAccessToken(env, options)
    : shopifyStorefrontToken(env);
  if (!configuration.storeDomain || !token) {
    throw new ShopifyApiError(`Shopify ${admin ? "Admin" : "Storefront"} API is not configured.`);
  }
  const path = admin ? "admin/api" : "api";
  const url = `https://${configuration.storeDomain}/${path}/${configuration.apiVersion}/graphql.json`;
  const fetchImpl = options.fetchImpl || fetch;
  const request = accessToken => fetchImpl(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [admin ? "X-Shopify-Access-Token" : storefrontTokenHeader(accessToken)]: accessToken
    },
    body: JSON.stringify({ query, variables })
  });
  const maxAttempts = Math.max(1, Math.min(4, Number(options.maxAttempts || 4)));
  let accessToken = token;
  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let response = await request(accessToken);
    if (admin && response.status === 401 && !String(env.SHOPIFY_ADMIN_ACCESS_TOKEN || "").trim() && attempt === 0) {
      clearShopifyAdminTokenCache(env);
      accessToken = await shopifyAdminAccessToken(env, options);
      response = await request(accessToken);
    }
    const body = await response.json().catch(() => ({}));
    const messages = Array.isArray(body.errors)
      ? body.errors.map(error => String(error?.message || "")).filter(Boolean)
      : [];
    const transient = response.status === 429
      || response.status >= 500
      || messages.some(message => /throttl|rate limit|try again|temporar/i.test(message));
    if (response.ok && !messages.length) return body.data || {};
    lastError = new ShopifyApiError(
      response.ok ? (messages.join("; ") || "Shopify API request failed.") : `Shopify API returned ${response.status}.`,
      { status: response.status, errors: body.errors || [] }
    );
    if (!transient || attempt >= maxAttempts - 1) throw lastError;
    const retryAfter = Number(response.headers?.get?.("Retry-After"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(4000, retryAfter * 1000)
      : Math.min(4000, 500 * (2 ** attempt));
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  throw lastError || new ShopifyApiError("Shopify API request failed.");
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
  const noteAttributes = Array.isArray(payload.note_attributes) ? payload.note_attributes : [];
  const attribute = key => String(noteAttributes.find(item => String(item?.name || item?.key || "") === key)?.value || "").trim();
  const sessionHash = attribute("_jfb_session");
  const allowedSources = new Set(["Google", "Bing", "TikTok", "Instagram", "Facebook", "Pinterest", "Direct", "Other"]);
  const attributedSource = attribute("_jfb_source");
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
    checkout_attribution: {
      session_hash: /^[a-f0-9]{64}$/i.test(sessionHash) ? sessionHash.toLowerCase() : "",
      traffic_source: allowedSources.has(attributedSource) ? attributedSource : "Other"
    },
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
