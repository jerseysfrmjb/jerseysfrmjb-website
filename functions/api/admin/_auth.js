const encoder = new TextEncoder();

async function sha256(value) {
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function sessionToken(env) {
  const password = env.ADMIN_PASSWORD || "";
  const secret = env.ADMIN_SESSION_SECRET || password;
  return sha256(`${password}:${secret}`);
}

export function readCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie.split(";").map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1) || "";
}

export async function isAuthorized(request, env) {
  const password = env.ADMIN_PASSWORD || "";
  if (!password) return false;
  return readCookie(request, "jb_admin") === await sessionToken(env);
}

export function unauthorized() {
  return Response.json({ error: "Not authorized" }, { status: 401 });
}
