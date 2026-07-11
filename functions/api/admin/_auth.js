export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers
    }
  });
}

export function adminConfigError(env, options = {}) {
  if (!env.ADMIN_PASSWORD) {
    return json({ error: "Missing ADMIN_PASSWORD secret" }, 503);
  }

  if (!env.ADMIN_SESSION_SECRET) {
    return json({ error: "Missing ADMIN_SESSION_SECRET secret" }, 503);
  }

  if (options.requireDb && !env.DB) {
    return json({ error: "Missing DB D1 binding" }, 503);
  }

  return null;
}

async function sha256(value) {
  if (!globalThis.crypto?.subtle) throw new Error("Web Crypto is unavailable");
  const hash = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
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
  return json({ error: "Not authorized" }, 401);
}
