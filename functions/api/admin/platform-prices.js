import { adminConfigError, isAuthorized, json, unauthorized } from "./_auth.js";
import { ensureProductPlatformPrices } from "../_inventorySeed.js";

const PLATFORMS = ["Depop", "eBay", "Facebook", "Website", "Local", "Other"];
const PLATFORM_SET = new Set(PLATFORMS);

function configError(env) {
  return adminConfigError(env) || (!env.DB ? "Missing D1 binding: DB" : "");
}

function normalizePrice(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;

  const raw = String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) {
    throw new Error("Prices must be non-negative dollar amounts with no more than two decimal places.");
  }

  const price = Number(raw);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Prices cannot be negative.");
  }
  return price;
}

async function requireAdmin(context) {
  const error = configError(context.env);
  if (error) return json({ ok: false, error }, 500);
  if (!(await isAuthorized(context.request, context.env))) return unauthorized();
  await ensureProductPlatformPrices(context.env);
  return null;
}

async function productExists(env, productId) {
  return Boolean(
    await env.DB.prepare("SELECT 1 FROM inventory WHERE id = ? LIMIT 1")
      .bind(productId)
      .first()
  );
}

async function getPlatformPrices(context) {
  const authResponse = await requireAdmin(context);
  if (authResponse) return authResponse;

  const productId = new URL(context.request.url).searchParams.get("product_id")?.trim();
  if (!productId) return json({ ok: false, error: "product_id is required." }, 400);
  if (!(await productExists(context.env, productId))) {
    return json({ ok: false, error: "Product not found." }, 404);
  }

  const result = await context.env.DB.prepare(`
    SELECT platform, price, updated_at
    FROM product_platform_prices
    WHERE product_id = ?
    ORDER BY CASE platform
      WHEN 'Depop' THEN 1
      WHEN 'eBay' THEN 2
      WHEN 'Facebook' THEN 3
      WHEN 'Website' THEN 4
      WHEN 'Local' THEN 5
      WHEN 'Other' THEN 6
      ELSE 7
    END
  `).bind(productId).all();

  const saved = new Map((result.results || []).map(row => [row.platform, row]));
  return json({
    ok: true,
    product_id: productId,
    prices: PLATFORMS.map(platform => ({
      platform,
      price: saved.get(platform)?.price ?? null,
      updated_at: saved.get(platform)?.updated_at ?? null
    }))
  });
}

async function savePlatformPrices(context) {
  const authResponse = await requireAdmin(context);
  if (authResponse) return authResponse;

  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, error: "Request body must be valid JSON." }, 400);
  }

  const productId = String(body?.product_id || "").trim();
  if (!productId) return json({ ok: false, error: "product_id is required." }, 400);
  if (!(await productExists(context.env, productId))) {
    return json({ ok: false, error: "Product not found." }, 404);
  }

  const entries = Array.isArray(body?.prices)
    ? body.prices
    : Object.entries(body?.prices || {}).map(([platform, price]) => ({ platform, price }));

  if (!entries.length) return json({ ok: false, error: "At least one platform price is required." }, 400);

  const statements = [];
  const seen = new Set();
  try {
    for (const entry of entries) {
      const platform = String(entry?.platform || "").trim();
      if (!PLATFORM_SET.has(platform)) {
        return json({ ok: false, error: `Unsupported platform: ${platform || "(blank)"}.` }, 400);
      }
      if (seen.has(platform)) {
        return json({ ok: false, error: `Duplicate platform: ${platform}.` }, 400);
      }
      seen.add(platform);

      statements.push(
        context.env.DB.prepare(`
          INSERT INTO product_platform_prices (product_id, platform, price, updated_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(product_id, platform) DO UPDATE SET
            price = excluded.price,
            updated_at = CURRENT_TIMESTAMP
        `).bind(productId, platform, normalizePrice(entry?.price))
      );
    }
  } catch (error) {
    return json({ ok: false, error: error.message }, 400);
  }

  await context.env.DB.batch(statements);
  return json({ ok: true, product_id: productId, saved: entries.length });
}

export async function onRequestGet(context) {
  try {
    return await getPlatformPrices(context);
  } catch (error) {
    return json({ ok: false, error: `Platform prices server error: ${error?.message || "Unknown error"}` }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    return await savePlatformPrices(context);
  } catch (error) {
    return json({ ok: false, error: `Platform prices save error: ${error?.message || "Unknown error"}` }, 500);
  }
}

export const onRequestPut = onRequestPost;
