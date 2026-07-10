import { sessionToken } from "./_auth.js";

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));
  if (!env.ADMIN_PASSWORD || body.password !== env.ADMIN_PASSWORD) {
    return Response.json({ error: "Wrong password" }, { status: 401 });
  }

  const token = await sessionToken(env);
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `jb_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
    }
  });
}
