import { ensureInventory } from "./_inventorySeed.js";

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return Response.json({ error: "D1 binding missing" }, { status: 503 });
  }
  await ensureInventory(env);
  const result = await env.DB.prepare("SELECT key, value FROM site_settings").all();
  return Response.json({ settings: Object.fromEntries((result.results || []).map(row => [row.key, row.value])) });
}
