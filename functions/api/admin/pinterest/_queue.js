import { productLandingUrl } from "../../catalog/_products.js";
import { pinterestEnvironment, siteOrigin } from "./_shared.js";

function parseJson(value, fallback) {
  try {
    return JSON.parse(value || "");
  } catch {
    return fallback;
  }
}

export function cleanPinText(value, maxLength) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function containsExactStockCount(value = "") {
  return /\b(?:quantity\s*:?\s*\d+|\d+\s+(?:units?\s+)?(?:left|remaining|in\s+stock))\b/i.test(String(value));
}

function normalizeRow(row) {
  return {
    id: Number(row.id),
    product_id: row.product_id,
    product_name: row.product_name,
    board_id: row.board_id,
    board_name: row.board_name || "Pinterest board",
    photo_index: Number(row.photo_index || 0),
    image_url: row.image_url,
    title: row.title,
    description: row.description,
    product_url: row.product_url,
    allow_duplicate: Boolean(row.allow_duplicate),
    status: row.status || "pending",
    environment: row.environment || "trial",
    pinterest_pin_id: row.pinterest_pin_id || "",
    pinterest_url: row.pinterest_url || "",
    publish_error: row.publish_error || "",
    attempts: Number(row.attempts || 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
    published_at: row.published_at || ""
  };
}

export async function ensurePinterestQueueSchema(env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS pinterest_pin_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    board_id TEXT NOT NULL,
    board_name TEXT NOT NULL DEFAULT '',
    photo_index INTEGER NOT NULL DEFAULT 0,
    image_url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    product_url TEXT NOT NULL,
    dedupe_key TEXT NOT NULL,
    allow_duplicate INTEGER NOT NULL DEFAULT 0 CHECK (allow_duplicate IN (0, 1)),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed')),
    environment TEXT NOT NULL DEFAULT 'trial' CHECK (environment IN ('trial', 'standard')),
    pinterest_pin_id TEXT NOT NULL DEFAULT '',
    pinterest_url TEXT NOT NULL DEFAULT '',
    publish_error TEXT NOT NULL DEFAULT '',
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TEXT,
    FOREIGN KEY (product_id) REFERENCES inventory(id) ON DELETE CASCADE
  )`).run();
  await env.DB.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_pinterest_pin_queue_dedupe
    ON pinterest_pin_queue(dedupe_key) WHERE allow_duplicate = 0`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_pinterest_pin_queue_status_created
    ON pinterest_pin_queue(status, created_at DESC)`).run();
}

export async function pinterestDedupeKey(productId, imageUrl, boardId) {
  const bytes = new TextEncoder().encode(`${productId}\n${imageUrl}\n${boardId}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function inventoryImage(env, photo) {
  const source = String(photo?.src || "").trim();
  if (!source) return "";
  try {
    const origin = siteOrigin(env);
    const url = new URL(source, `${origin}/`);
    return url.protocol === "https:" && url.origin === origin ? url.toString() : "";
  } catch {
    return "";
  }
}

export async function queueRecord(env, id) {
  await ensurePinterestQueueSchema(env);
  const row = await env.DB.prepare("SELECT * FROM pinterest_pin_queue WHERE id = ?")
    .bind(id)
    .first();
  return row ? normalizeRow(row) : null;
}

export async function listQueue(env) {
  await ensurePinterestQueueSchema(env);
  const result = await env.DB.prepare(`SELECT * FROM pinterest_pin_queue
    ORDER BY CASE status WHEN 'failed' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END,
      created_at DESC, id DESC
    LIMIT 150`).all();
  return (result.results || []).map(normalizeRow);
}

export async function createQueueRecord(env, body = {}) {
  await ensurePinterestQueueSchema(env);
  const productId = cleanPinText(body.product_id, 180);
  const boardId = cleanPinText(body.board_id, 180);
  const boardName = cleanPinText(body.board_name, 180) || "Pinterest board";
  const photoIndex = Math.max(0, Math.floor(Number(body.photo_index || 0)));
  const title = cleanPinText(body.title, 100);
  const description = cleanPinText(body.description, 800);
  const allowDuplicate = body.allow_duplicate === true ? 1 : 0;
  if (!productId || !boardId || !title || !description) {
    const error = new Error("Choose a product, board, title, and description before adding the Pin.");
    error.status = 400;
    throw error;
  }
  if (containsExactStockCount(description)) {
    const error = new Error("Pin descriptions may list available sizes, but cannot expose exact inventory counts.");
    error.status = 400;
    throw error;
  }

  const product = await env.DB.prepare(`SELECT id, category, name, size, sizes_json, quantity, photos
    FROM inventory WHERE id = ? LIMIT 1`).bind(productId).first();
  if (!product) {
    const error = new Error("Inventory product not found.");
    error.status = 404;
    throw error;
  }
  if (Number(product.quantity || 0) <= 0) {
    const error = new Error("Sold-out products cannot be added to the Pinterest queue.");
    error.status = 400;
    throw error;
  }
  const photos = parseJson(product.photos, []);
  const photo = photos[photoIndex] || photos[0];
  const imageUrl = inventoryImage(env, photo);
  if (!imageUrl) {
    const error = new Error("This product does not have a publishable inventory image.");
    error.status = 400;
    throw error;
  }
  const productUrl = productLandingUrl(productId, siteOrigin(env));
  const key = await pinterestDedupeKey(productId, imageUrl, boardId);
  if (!allowDuplicate) {
    const duplicate = await env.DB.prepare(`SELECT * FROM pinterest_pin_queue
      WHERE dedupe_key = ? AND allow_duplicate = 0 LIMIT 1`).bind(key).first();
    if (duplicate) {
      const error = new Error("This product image is already queued for that board. Open the existing queue item or allow a duplicate manually.");
      error.status = 409;
      error.duplicate = normalizeRow(duplicate);
      throw error;
    }
  }
  const result = await env.DB.prepare(`INSERT INTO pinterest_pin_queue (
      product_id, product_name, board_id, board_name, photo_index, image_url,
      title, description, product_url, dedupe_key, allow_duplicate, status, environment
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`)
    .bind(
      productId,
      product.name,
      boardId,
      boardName,
      photoIndex,
      imageUrl,
      title,
      description,
      productUrl,
      key,
      allowDuplicate,
      pinterestEnvironment(env) === "sandbox" ? "trial" : "standard"
    ).run();
  return queueRecord(env, Number(result.meta?.last_row_id || 0));
}

export async function markQueueAttempt(env, id) {
  await env.DB.prepare(`UPDATE pinterest_pin_queue
    SET attempts = attempts + 1, publish_error = '', updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status != 'published'`).bind(id).run();
}

export async function markQueuePublished(env, id, pinId, pinterestUrl) {
  await env.DB.prepare(`UPDATE pinterest_pin_queue SET status = 'published',
    pinterest_pin_id = ?, pinterest_url = ?, publish_error = '',
    published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`).bind(pinId, pinterestUrl, id).run();
  return queueRecord(env, id);
}

export async function markQueueFailed(env, id, message) {
  await env.DB.prepare(`UPDATE pinterest_pin_queue SET status = 'failed',
    publish_error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status != 'published'`)
    .bind(cleanPinText(message, 500), id)
    .run();
  return queueRecord(env, id);
}
