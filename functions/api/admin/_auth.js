const encoder = new TextEncoder();

export function adminConfigError(env, options = {}) {
  if (!env.ADMIN_PASSWORD) {
    return Response.json({ error: "Missing ADMIN_PASSWORD secret" }, { status: 503 });
  }

  if (!env.ADMIN_SESSION_SECRET) {
    return Response.json({ error: "Missing ADMIN_SESSION_SECRET secret" }, { status: 503 });
  }

  if (options.requireDb && !env.DB) {
    return Response.json({ error: "Missing DB D1 binding" }, { status: 503 });
  }

  return null;
}

async function sha256(value) {
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function sessionToken(env) {
  const configError = adminConfigError(env);
  if (configError) throw new Error("Admin configuration missing");
  return sha256(`${env.ADMIN_PASSWORD}:${env.ADMIN_SESSION_SECRET}`);
}

export function readCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie.split(";").map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1) || "";
}

export async function isAuthorized(request, env) {
  if (adminConfigError(env)) return false;
  return readCookie(request, "jb_admin") === await sessionToken(env);
}

export function unauthorized() {
  return Response.json({ error: "Not authorized" }, { status: 401 });
}
