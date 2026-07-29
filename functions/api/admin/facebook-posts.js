import { ensureInventory } from "../_inventorySeed.js";
import { adminConfigError, isAuthorized, json, unauthorized } from "./_auth.js";

const MAX_PRODUCTS = 5;
const MAX_CAPTION_LENGTH = 6000;

function parseJson(value, fallback) {
  try {
    return JSON.parse(value || "");
  } catch {
    return fallback;
  }
}

function normalizePost(row) {
  return {
    id: row.id,
    product_ids: parseJson(row.product_ids, []),
    product_names: parseJson(row.product_names, []),
    caption: row.caption || "",
    photo_urls: parseJson(row.photo_urls, []),
    status: row.status || "draft",
    created_at: row.created_at,
    updated_at: row.updated_at,
    posted_at: row.posted_at || ""
  };
}

async function ensureFacebookPostHistorySchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS facebook_post_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_ids TEXT NOT NULL,
      product_names TEXT NOT NULL,
      caption TEXT NOT NULL,
      photo_urls TEXT NOT NULL DEFAULT '[]',
      content_hash TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'posted')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      posted_at TEXT
    )
  `).run();
  await env.DB.prepare(`
    CREATE INDEX IF NOT EXISTS idx_facebook_post_history_status_created
      ON facebook_post_history(status, created_at DESC)
  `).run();
}

async function contentHash(productIds, caption) {
  const normalizedCaption = String(caption)
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ");
  const input = `${[...productIds].sort().join("|")}\n${normalizedCaption}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function historyRecord(env, id) {
  const row = await env.DB.prepare(`
    SELECT id, product_ids, product_names, caption, photo_urls, status,
      created_at, updated_at, posted_at
    FROM facebook_post_history
    WHERE id = ?
  `).bind(id).first();
  return row ? normalizePost(row) : null;
}

async function listHistory(env) {
  const result = await env.DB.prepare(`
    SELECT id, product_ids, product_names, caption, photo_urls, status,
      created_at, updated_at, posted_at
    FROM facebook_post_history
    ORDER BY created_at DESC, id DESC
    LIMIT 100
  `).all();
  return (result.results || []).map(normalizePost);
}

function normalizeProductIds(value) {
  const ids = [...new Set(
    (Array.isArray(value) ? value : [])
      .map(id => String(id || "").trim())
      .filter(Boolean)
  )];
  return ids.length >= 1 && ids.length <= MAX_PRODUCTS ? ids : [];
}

async function selectedProducts(env, productIds) {
  const placeholders = productIds.map(() => "?").join(", ");
  const result = await env.DB.prepare(`
    SELECT id, name, photos
    FROM inventory
    WHERE id IN (${placeholders})
  `).bind(...productIds).all();
  const rows = result.results || [];
  const byId = new Map(rows.map(row => [String(row.id), row]));
  return productIds.map(id => byId.get(id)).filter(Boolean);
}

function productPhotos(products) {
  return products.flatMap(product => {
    const photos = parseJson(product.photos, []);
    return photos
      .filter(photo => photo && typeof photo.src === "string" && photo.src.trim())
      .slice(0, 2)
      .map(photo => ({
        product_id: product.id,
        product_name: product.name,
        src: photo.src.trim(),
        alt: String(photo.alt || product.name).trim()
      }));
  });
}

export async function onRequestGet({ request, env }) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();

  await ensureFacebookPostHistorySchema(env);
  return json({ posts: await listHistory(env) });
}

export async function onRequestPost({ request, env }) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();

  await ensureFacebookPostHistorySchema(env);
  await ensureInventory(env);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const productIds = normalizeProductIds(body.product_ids);
  if (!productIds.length) {
    return json({ error: `Choose between 1 and ${MAX_PRODUCTS} jerseys.` }, 400);
  }

  const caption = String(body.caption || "").trim();
  if (caption.length < 20) {
    return json({ error: "Add a complete Facebook caption before saving." }, 400);
  }
  if (caption.length > MAX_CAPTION_LENGTH) {
    return json({ error: `Facebook caption must be ${MAX_CAPTION_LENGTH.toLocaleString()} characters or fewer.` }, 400);
  }

  const products = await selectedProducts(env, productIds);
  if (products.length !== productIds.length) {
    return json({ error: "One or more selected jerseys no longer exist in inventory. Refresh and try again." }, 409);
  }

  const hash = await contentHash(productIds, caption);
  const duplicate = await env.DB.prepare(`
    SELECT id, product_ids, product_names, caption, photo_urls, status,
      created_at, updated_at, posted_at
    FROM facebook_post_history
    WHERE content_hash = ?
  `).bind(hash).first();
  if (duplicate) {
    return json({
      error: "This exact Facebook post is already saved. Open it from Post History instead of creating a duplicate.",
      duplicate: normalizePost(duplicate)
    }, 409);
  }

  const productNames = products.map(product => product.name);
  const photos = productPhotos(products);
  const result = await env.DB.prepare(`
    INSERT INTO facebook_post_history (
      product_ids, product_names, caption, photo_urls, content_hash, status
    )
    VALUES (?, ?, ?, ?, ?, 'draft')
  `).bind(
    JSON.stringify(productIds),
    JSON.stringify(productNames),
    caption,
    JSON.stringify(photos),
    hash
  ).run();

  const id = Number(result.meta?.last_row_id || 0);
  return json({ post: await historyRecord(env, id) }, 201);
}

export async function onRequestPatch({ request, env }) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();

  await ensureFacebookPostHistorySchema(env);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const id = Math.floor(Number(body.id));
  if (!Number.isFinite(id) || id <= 0) return json({ error: "A valid post ID is required." }, 400);
  if (body.status !== "posted") return json({ error: "The only supported update is marking a draft as posted." }, 400);

  const existing = await historyRecord(env, id);
  if (!existing) return json({ error: "Facebook post history record not found." }, 404);
  if (existing.status === "posted") return json({ post: existing });

  await env.DB.prepare(`
    UPDATE facebook_post_history
    SET status = 'posted', posted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(id).run();
  return json({ post: await historyRecord(env, id) });
}

export async function onRequestDelete({ request, env }) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();

  await ensureFacebookPostHistorySchema(env);
  const url = new URL(request.url);
  const id = Math.floor(Number(url.searchParams.get("id")));
  if (!Number.isFinite(id) || id <= 0) return json({ error: "A valid draft ID is required." }, 400);

  const existing = await historyRecord(env, id);
  if (!existing) return json({ error: "Facebook post history record not found." }, 404);
  if (existing.status !== "draft") {
    return json({ error: "Posted history is retained to prevent accidental duplicate Facebook posts." }, 409);
  }

  await env.DB.prepare("DELETE FROM facebook_post_history WHERE id = ? AND status = 'draft'")
    .bind(id)
    .run();
  return json({ ok: true });
}
