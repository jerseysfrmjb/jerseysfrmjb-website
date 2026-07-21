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
  return clean(value, 80).replace(/^@+/, "").replace(/[^a-zA-Z0-9._]/g, "");
}

function instagramProfileUrl(username) {
  return `https://www.instagram.com/${encodeURIComponent(username)}/`;
}

function discordValue(value, fallback = "Not provided", max = 1000) {
  const text = clean(value, max);
  return text || fallback;
}

async function sendDiscordNotification(env, data) {
  if (!env.DISCORD_WEBHOOK_URL) return;

  const profileUrl = instagramProfileUrl(data.instagram_username);
  const payload = {
    content: `@everyone New JerseysFrmJB Need Help message from @${data.instagram_username}`,
    allowed_mentions: {
      parse: ["everyone"]
    },
    embeds: [
      {
        title: "New Need Help Message",
        color: 8130609,
        url: profileUrl,
        timestamp: data.submitted_at,
        fields: [
          {
            name: "Instagram username",
            value: `[@${data.instagram_username}](${profileUrl})`,
            inline: true
          },
          {
            name: "Jersey/request",
            value: discordValue(data.jersey_request, "Not provided", 240),
            inline: true
          },
          {
            name: "Size",
            value: discordValue(data.size, "Not provided", 80),
            inline: true
          },
          {
            name: "Message",
            value: discordValue(data.message, "Not provided", 1000)
          },
          {
            name: "Submission date and time",
            value: data.submitted_at
          },
          {
            name: "Open Instagram Profile",
            value: profileUrl
          }
        ]
      }
    ]
  };

  const response = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Discord webhook returned ${response.status}`);
  }
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

    const submitted_at = new Date().toISOString();

    await env.DB.prepare(`
      INSERT INTO contact_messages (instagram_username, jersey_request, size, message)
      VALUES (?, ?, ?, ?)
    `).bind(instagram_username, jersey_request, size, message).run();

    try {
      await sendDiscordNotification(env, {
        instagram_username,
        jersey_request,
        size,
        message,
        submitted_at
      });
    } catch (notificationError) {
      console.warn("Discord notification failed", notificationError);
    }

    return json({ ok: true });
  } catch (error) {
    return json({ error: `Message server error: ${error?.message || "Unknown error"}` }, 500);
  }
}
