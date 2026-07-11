import { adminConfigError, sessionToken } from "./_auth.js";

export async function onRequestPost({ request, env }) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;

  const body = await request.json().catch(() => ({}));
  if (!body.password || body.password !== env.ADMIN_PASSWORD) {
    return Response.json({ error: "Incorrect password" }, { status: 401 });
  }

  try {
    const token = await sessionToken(env);
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `jb_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
      }
    });
  } catch (error) {
    return Response.json({ error: "Admin session setup failed" }, { status: 500 });
  }
}
