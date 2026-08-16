import { onRequestPost as shopifyCartEndpoint } from "./api/shopify/cart.js";
import { normalizeSize } from "./api/shopify/_products.js";

const SIZE_PREFERENCE = ["M", "S", "L", "XL", "2XL", "3XL", "4XL"];
const MAX_LINES = 50;
const MAX_TOTAL_QUANTITY = 100;
const TRAFFIC_SOURCES = new Set(["Google", "Bing", "TikTok", "Instagram", "Facebook", "Pinterest", "Direct", "Other"]);

function responseHeaders(contentType = "text/html; charset=utf-8") {
  return {
    "Cache-Control": "no-store",
    "Content-Type": contentType,
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow"
  };
}

function errorResponse(status, message) {
  const safeMessage = String(message || "Secure checkout is temporarily unavailable.")
    .replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Secure checkout | JerseysFrmJB</title></head><body><main><h1>Secure checkout unavailable</h1><p>${safeMessage}</p><p><a href="/shop-all">Return to jerseys</a></p></main></body></html>`, {
    status,
    headers: responseHeaders()
  });
}

function cleanProductId(value) {
  const productId = String(value || "").trim();
  return /^[A-Za-z0-9_-]{1,180}$/.test(productId) ? productId : "";
}

function parseQuantity(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 25 ? parsed : 0;
}

function parseProducts(value) {
  const raw = String(value || "").trim();
  if (!raw) return { error: "No products were included in the checkout link." };

  const products = new Map();
  for (const entry of raw.split(",")) {
    const [rawId, rawQuantity] = entry.split(":");
    const productId = cleanProductId(rawId);
    const requestedQuantity = parseQuantity(rawQuantity);
    if (!productId || !requestedQuantity) return { error: "The checkout link contains an invalid product or quantity." };
    const quantity = (products.get(productId) || 0) + requestedQuantity;
    if (quantity > 25) return { error: "The requested quantity is too high." };
    products.set(productId, quantity);
  }
  const lines = [...products].map(([productId, quantity]) => ({ productId, quantity }));
  const totalQuantity = lines.reduce((total, line) => total + line.quantity, 0);
  if (!lines.length) return { error: "No products were included in the checkout link." };
  if (lines.length > MAX_LINES || totalQuantity > MAX_TOTAL_QUANTITY) return { error: "This checkout contains too many items." };
  return { lines };
}

function availableSizes(row) {
  let sizes = {};
  try { sizes = JSON.parse(row?.sizes_json || "{}"); } catch { sizes = {}; }
  const available = Object.entries(sizes)
    .filter(([, quantity]) => Math.floor(Number(quantity || 0)) > 0)
    .map(([size]) => String(size).trim().toUpperCase())
    .filter(Boolean);
  if (!available.length && row?.size && Number(row.quantity || 0) > 0) {
    const fallback = normalizeSize(row.size);
    if (fallback) available.push(fallback);
  }
  return available;
}

function chooseSize(row) {
  const available = availableSizes(row);
  return SIZE_PREFERENCE.find(size => available.includes(size)) || available[0] || "";
}

function trafficSource(url) {
  const raw = String(url.searchParams.get("utm_source") || url.searchParams.get("source") || "").trim().toLowerCase();
  const match = [...TRAFFIC_SOURCES].find(source => source.toLowerCase() === raw);
  if (match) return match;
  if (url.searchParams.has("fbclid")) return "Facebook";
  return "Other";
}

function shopifyCheckoutRedirect(url) {
  const checkoutUrl = String(url || "").trim();
  try {
    const parsed = new URL(checkoutUrl);
    const validPath = parsed.pathname.startsWith("/checkouts/") || parsed.pathname.startsWith("/cart/c/");
    if (parsed.protocol !== "https:" || !/\.myshopify\.com$/i.test(parsed.hostname) || !validPath) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

async function inventoryRow(env, productId) {
  return env.DB.prepare(`
    SELECT id, size, quantity, sizes_json
    FROM inventory
    WHERE id = ?
    LIMIT 1
  `).bind(productId).first();
}

async function createShopifyCart(env, request, lines, url) {
  let cartId = "";
  let cart = null;
  const sessionId = String(url.searchParams.get("session_id") || "").trim().slice(0, 160);
  const source = trafficSource(url);

  for (const [index, line] of lines.entries()) {
    const row = await inventoryRow(env, line.productId);
    const size = chooseSize(row);
    if (!row || !size) throw new Error("One of the selected jerseys is no longer available.");
    const body = {
      action: index === 0 ? "create" : "add",
      product_id: line.productId,
      size,
      quantity: line.quantity,
      traffic_source: source,
      ...(sessionId ? { session_id: sessionId } : {}),
      ...(cartId ? { cart_id: cartId } : {})
    };
    const response = await shopifyCartEndpoint({
      request: new Request(request.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body)
      }),
      env
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.cart?.id) throw new Error(payload.error || "Secure checkout is temporarily unavailable.");
    cart = payload.cart;
    cartId = String(cart.id || "");
  }
  return cart;
}

export async function onRequestGet({ request, env }) {
  if (!env?.DB) return errorResponse(503, "Inventory is temporarily unavailable.");
  const url = new URL(request.url);
  const parsed = parseProducts(url.searchParams.get("products"));
  if (parsed.error) return errorResponse(400, parsed.error);

  try {
    const cart = await createShopifyCart(env, request, parsed.lines, url);
    const checkoutUrl = shopifyCheckoutRedirect(cart?.checkout_url);
    if (!checkoutUrl) return errorResponse(502, "Secure checkout did not return a valid destination.");
    return new Response(null, {
      status: 302,
      headers: {
        ...responseHeaders("text/plain; charset=utf-8"),
        Location: checkoutUrl
      }
    });
  } catch (error) {
    const message = String(error?.message || "Secure checkout is temporarily unavailable.");
    return errorResponse(/sold out|available|quantity/i.test(message) ? 409 : 502, message);
  }
}
