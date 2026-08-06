import { ensureInventory } from "../_inventorySeed.js";
import { adminConfigError, isAuthorized, json, unauthorized } from "./_auth.js";

function normalizeMessage(row) {
  return {
    id: row.id,
    instagram_username: row.instagram_username || "",
    email: row.email || "",
    contact_preference: row.contact_preference || "instagram",
    request_type: row.request_type || "jersey_request",
    jersey_request: row.jersey_request,
    size: row.size || "",
    marketplace_preference: row.marketplace_preference || "",
    product_id: row.product_id || "",
    product_name: row.product_name || "",
    message: row.message,
    status: row.status,
    admin_notes: row.admin_notes || "",
    contacted_at: row.contacted_at || "",
    resolved_at: row.resolved_at || "",
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function requireAdmin(request, env) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();
  await ensureInventory(env);
  return null;
}

async function loadMessages(env) {
  const result = await env.DB.prepare("SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT 250").all();
  const messages = (result.results || []).map(normalizeMessage);
  const productResult = await env.DB.prepare(`
    SELECT message_id, product_id, product_name, requested_size
    FROM contact_message_products
    WHERE message_id IN (SELECT id FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT 250)
    ORDER BY created_at, product_name
  `).all();
  const productsByMessage = new Map();
  for (const product of productResult.results || []) {
    if (!productsByMessage.has(product.message_id)) productsByMessage.set(product.message_id, []);
    productsByMessage.get(product.message_id).push({
      product_id: product.product_id || "",
      product_name: product.product_name || "",
      requested_size: product.requested_size || ""
    });
  }
  for (const message of messages) {
    message.requested_products = productsByMessage.get(message.id) || (message.product_id || message.product_name ? [{
      product_id: message.product_id,
      product_name: message.product_name,
      requested_size: message.size
    }] : []);
  }
  const unread = messages.filter(message => ["new", "unread"].includes(message.status)).length;
  const summaryMap = new Map();
  for (const message of messages.filter(item => ["jersey_request", "restock_request"].includes(item.request_type))) {
    const products = message.requested_products.length ? message.requested_products : [{
      product_id: message.product_id,
      product_name: message.product_name || message.jersey_request,
      requested_size: message.size
    }];
    for (const product of products) {
      const key = product.product_id || product.product_name.toLowerCase();
      if (!key) continue;
      const entry = summaryMap.get(key) || {
        product_id: product.product_id,
        product_name: product.product_name || message.jersey_request,
        request_count: 0,
        sizes: {},
        usernames: new Set(),
        contacted: 0,
        pending: 0
      };
      entry.request_count += 1;
      const requestedSize = product.requested_size || message.size || "Any size";
      entry.sizes[requestedSize] = (entry.sizes[requestedSize] || 0) + 1;
      if (message.instagram_username) entry.usernames.add(message.instagram_username);
      if (message.contacted_at) entry.contacted += 1;
      else entry.pending += 1;
      summaryMap.set(key, entry);
    }
  }
  const request_summary = [...summaryMap.values()]
    .map(entry => ({ ...entry, usernames: [...entry.usernames] }))
    .sort((a, b) => b.request_count - a.request_count || a.product_name.localeCompare(b.product_name));
  return { messages, unread, request_summary };
}

export async function onRequestGet({ request, env }) {
  try {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;
    return json(await loadMessages(env));
  } catch (error) {
    return json({ error: `Messages server error: ${error?.message || "Unknown error"}` }, 500);
  }
}

export async function onRequestPatch({ request, env }) {
  try {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;
    const body = await request.json().catch(() => ({}));
    const id = Math.floor(Number(body.id));
    if (!id) return json({ error: "Missing message id" }, 400);
    const allowedStatuses = new Set(["new", "in_progress", "waiting", "resolved"]);
    const requestedStatus = body.status === "read"
      ? "in_progress"
      : body.status === "unread"
        ? "new"
        : body.status;
    const status = allowedStatuses.has(requestedStatus) ? requestedStatus : "new";
    const adminNotes = String(body.admin_notes || "").replace(/\s+/g, " ").trim().slice(0, 1000);
    const contacted = body.contacted === true || body.contacted === "true";
    await env.DB.prepare(`
      UPDATE contact_messages
      SET status = ?,
        admin_notes = ?,
        contacted_at = CASE WHEN ? THEN COALESCE(contacted_at, CURRENT_TIMESTAMP) ELSE NULL END,
        resolved_at = CASE WHEN ? = 'resolved' THEN COALESCE(resolved_at, CURRENT_TIMESTAMP) ELSE NULL END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, adminNotes, contacted, status, id).run();
    return json(await loadMessages(env));
  } catch (error) {
    return json({ error: `Message update error: ${error?.message || "Unknown error"}` }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  try {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;
    const url = new URL(request.url);
    const id = Math.floor(Number(url.searchParams.get("id")));
    if (!id) return json({ error: "Missing message id" }, 400);
    await env.DB.batch([
      env.DB.prepare("DELETE FROM contact_message_products WHERE message_id = ?").bind(id),
      env.DB.prepare("DELETE FROM contact_messages WHERE id = ?").bind(id)
    ]);
    return json(await loadMessages(env));
  } catch (error) {
    return json({ error: `Message delete error: ${error?.message || "Unknown error"}` }, 500);
  }
}
