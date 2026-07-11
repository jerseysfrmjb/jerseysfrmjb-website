import { ensureInventory } from "./_inventorySeed.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function clean(value = "", max = 500) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanUsername(value = "") {
  return clean(value, 80).replace(/^@+/, "");
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) return json({ error: "Message database is not connected yet." }, 503);
    await ensureInventory(env);

    const body = await request.json().catch(() => ({}));
    if (body.website) return json({ ok: true });

    const instagram_username = cleanUsername(body.instagram_username);
    const jersey_request = clean(body.jersey_request, 160);
    const size = clean(body.size, 40);
    const message = clean(body.message, 1200);

    if (!instagram_username || !jersey_request || !size || !message) {
      return json({ error: "Please fill out every field before sending." }, 400);
    }

    const duplicate = await env.DB.prepare(`
      SELECT id FROM contact_messages
      WHERE lower(instagram_username) = lower(?)
        AND lower(jersey_request) = lower(?)
        AND lower(size) = lower(?)
        AND lower(message) = lower(?)
        AND created_at >= datetime('now', '-2 minutes')
      LIMIT 1
    `).bind(instagram_username, jersey_request, size, message).first();

    if (duplicate) {
      return json({ ok: true, duplicate: true });
    }

    await env.DB.prepare(`
      INSERT INTO contact_messages (instagram_username, jersey_request, size, message)
      VALUES (?, ?, ?, ?)
    `).bind(instagram_username, jersey_request, size, message).run();

    return json({ ok: true });
  } catch (error) {
    return json({ error: `Message server error: ${error?.message || "Unknown error"}` }, 500);
  }
}
