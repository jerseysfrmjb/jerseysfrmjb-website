import { ensureInventory } from "./_inventorySeed.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return json({ error: "D1 binding missing" }, 503);
  }
  await ensureInventory(env);
  const result = await env.DB.prepare("SELECT key, value FROM site_settings").all();
  return json({ settings: Object.fromEntries((result.results || []).map(row => [row.key, row.value])) });
}
