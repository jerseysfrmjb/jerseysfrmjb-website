import { pinterestOauthUrl, requirePinterestAdmin } from "./_shared.js";

function randomState() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function onRequestGet(context) {
  try {
    const authError = await requirePinterestAdmin(context);
    if (authError) return authError;

    const state = randomState();
    return new Response(null, {
      status: 302,
      headers: {
        Location: pinterestOauthUrl(context.env, state),
        "Cache-Control": "no-store",
        "Set-Cookie": `__Host-jb_pinterest_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
      }
    });
  } catch (error) {
    return new Response(`Pinterest connection error: ${error?.message || "Unknown error"}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}
