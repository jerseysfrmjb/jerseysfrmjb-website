import { adminConfigError, json, sessionToken } from "./_auth.js";

export async function onRequestPost({ request, env }) {
  try {
    const configError = adminConfigError(env, { requireDb: true });
    if (configError) return configError;

    const body = await request.json().catch(() => ({}));
    if (!body.password || body.password !== env.ADMIN_PASSWORD) {
      return json({ error: "Incorrect password" }, 401);
    }

    const token = await sessionToken(env);
    return json({ ok: true }, 200, {
      "Set-Cookie": `jb_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
    });
  } catch (error) {
    return json({ error: `Login server error: ${error?.message || "Unknown error"}` }, 500);
  }
}
