import { ensureInventory } from "../_inventorySeed.js";
import { adminConfigError, isAuthorized, json, unauthorized } from "./_auth.js";

function normalizeMessage(row) {
  return {
    id: row.id,
    instagram_username: row.instagram_username,
    jersey_request: row.jersey_request,
    size: row.size,
    message: row.message,
    status: row.status,
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
  const unread = messages.filter(message => message.status !== "read").length;
  return { messages, unread };
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
    const status = body.status === "read" ? "read" : "unread";
    await env.DB.prepare("UPDATE contact_messages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(status, id).run();
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
    await env.DB.prepare("DELETE FROM contact_messages WHERE id = ?").bind(id).run();
    return json(await loadMessages(env));
  } catch (error) {
    return json({ error: `Message delete error: ${error?.message || "Unknown error"}` }, 500);
  }
}
