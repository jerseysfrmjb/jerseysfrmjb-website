import { adminConfigError, isAuthorized, json, unauthorized } from "../_auth.js";

const PINTEREST_API = "https://api.pinterest.com/v5";
const PINTEREST_TOKEN_URL = `${PINTEREST_API}/oauth/token`;
const DEFAULT_REDIRECT_URI = "https://jerseysfrmjb.com/api/admin/pinterest/callback";
const PINTEREST_SCOPES = ["boards:read", "boards:write", "pins:read", "pins:write"];
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function appId(env) {
  return String(env.PINTEREST_APP_ID || "").trim();
}

export function redirectUri(env) {
  return String(env.PINTEREST_REDIRECT_URI || DEFAULT_REDIRECT_URI).trim();
}

export function siteOrigin(env) {
  try {
    return new URL(redirectUri(env)).origin;
  } catch {
    return "https://jerseysfrmjb.com";
  }
}

export function pinterestConfigError(env) {
  const baseError = adminConfigError(env, { requireDb: true });
  if (baseError) return baseError;
  if (!appId(env)) return json({ error: "Missing PINTEREST_APP_ID variable." }, 503);
  if (!env.PINTEREST_APP_SECRET) return json({ error: "Missing PINTEREST_APP_SECRET secret." }, 503);
  try {
    new URL(redirectUri(env));
  } catch {
    return json({ error: "PINTEREST_REDIRECT_URI must be a complete URL." }, 503);
  }
  return null;
}

export async function requirePinterestAdmin(context) {
  const configError = pinterestConfigError(context.env);
  if (configError) return configError;
  if (!(await isAuthorized(context.request, context.env))) return unauthorized();
  await ensurePinterestConnectionTable(context.env);
  return null;
}

export async function ensurePinterestConnectionTable(env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS pinterest_connections (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT NOT NULL DEFAULT '',
    token_type TEXT NOT NULL DEFAULT 'bearer',
    scope TEXT NOT NULL DEFAULT '',
    access_expires_at INTEGER NOT NULL,
    refresh_expires_at INTEGER,
    connected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

function bytesToBase64(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function tokenEncryptionKey(env) {
  const keyMaterial = String(
    env.PINTEREST_TOKEN_ENCRYPTION_KEY
      || `${env.PINTEREST_APP_SECRET}:${env.ADMIN_SESSION_SECRET}`
  );
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(keyMaterial));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptToken(env, value) {
  if (!value) return "";
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await tokenEncryptionKey(env),
    textEncoder.encode(String(value))
  );
  return `v1.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(encrypted))}`;
}

async function decryptToken(env, value) {
  if (!value) return "";
  const [version, ivValue, encryptedValue] = String(value).split(".");
  if (version !== "v1" || !ivValue || !encryptedValue) {
    throw new Error("Stored Pinterest credentials are invalid. Reconnect Pinterest.");
  }
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(ivValue) },
      await tokenEncryptionKey(env),
      base64ToBytes(encryptedValue)
    );
    return textDecoder.decode(decrypted);
  } catch {
    throw new Error("Stored Pinterest credentials could not be opened. Reconnect Pinterest.");
  }
}

function basicAuthorization(env) {
  return `Basic ${btoa(`${appId(env)}:${String(env.PINTEREST_APP_SECRET)}`)}`;
}

async function readPinterestResponse(response) {
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!response.ok) {
    const message = data.message || data.error_description || data.error || `Pinterest request failed (${response.status}).`;
    const error = new Error(String(message));
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

async function requestToken(env, parameters) {
  const response = await fetch(PINTEREST_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthorization(env),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(parameters)
  });
  return readPinterestResponse(response);
}

function futureEpoch(seconds, fallbackSeconds) {
  const duration = Math.max(60, Number(seconds) || fallbackSeconds);
  return Math.floor(Date.now() / 1000) + duration;
}

export async function savePinterestTokens(env, data, previous = null) {
  const accessToken = String(data.access_token || "").trim();
  const refreshToken = String(data.refresh_token || "").trim()
    || (previous ? await decryptToken(env, previous.refresh_token_encrypted) : "");
  if (!accessToken) throw new Error("Pinterest did not return an access token.");

  const accessExpiresAt = futureEpoch(data.expires_in, 30 * 24 * 60 * 60);
  const refreshExpiresAt = refreshToken
    ? futureEpoch(
      data.refresh_token_expires_in,
      Math.max(60, Number(previous?.refresh_expires_at || 0) - Math.floor(Date.now() / 1000)) || 60 * 24 * 60 * 60
    )
    : null;

  await env.DB.prepare(`INSERT INTO pinterest_connections (
      id,
      access_token_encrypted,
      refresh_token_encrypted,
      token_type,
      scope,
      access_expires_at,
      refresh_expires_at,
      connected_at,
      updated_at
    ) VALUES (1, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      access_token_encrypted = excluded.access_token_encrypted,
      refresh_token_encrypted = excluded.refresh_token_encrypted,
      token_type = excluded.token_type,
      scope = excluded.scope,
      access_expires_at = excluded.access_expires_at,
      refresh_expires_at = excluded.refresh_expires_at,
      updated_at = CURRENT_TIMESTAMP`)
    .bind(
      await encryptToken(env, accessToken),
      await encryptToken(env, refreshToken),
      String(data.token_type || previous?.token_type || "bearer"),
      String(data.scope || previous?.scope || PINTEREST_SCOPES.join(" ")),
      accessExpiresAt,
      refreshExpiresAt
    )
    .run();
}

export async function exchangePinterestCode(env, code) {
  const data = await requestToken(env, {
    grant_type: "authorization_code",
    code: String(code),
    redirect_uri: redirectUri(env),
    continuous_refresh: "true"
  });
  await savePinterestTokens(env, data);
  return data;
}

export async function getPinterestConnection(env) {
  await ensurePinterestConnectionTable(env);
  return env.DB.prepare("SELECT * FROM pinterest_connections WHERE id = 1").first();
}

async function refreshPinterestTokens(env, connection) {
  const refreshToken = await decryptToken(env, connection.refresh_token_encrypted);
  if (!refreshToken) throw new Error("Pinterest needs to be connected again.");
  if (connection.refresh_expires_at && Number(connection.refresh_expires_at) <= Math.floor(Date.now() / 1000)) {
    throw new Error("Pinterest authorization expired. Reconnect Pinterest.");
  }
  const data = await requestToken(env, {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: String(connection.scope || PINTEREST_SCOPES.join(" "))
  });
  await savePinterestTokens(env, data, connection);
  return getPinterestConnection(env);
}

async function pinterestAccessToken(env, forceRefresh = false) {
  let connection = await getPinterestConnection(env);
  if (!connection) throw new Error("Pinterest is not connected.");
  const now = Math.floor(Date.now() / 1000);
  if (forceRefresh || Number(connection.access_expires_at || 0) <= now + 300) {
    connection = await refreshPinterestTokens(env, connection);
  }
  return decryptToken(env, connection.access_token_encrypted);
}

export async function pinterestApi(env, path, options = {}) {
  const execute = async forceRefresh => {
    const response = await fetch(`${PINTEREST_API}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${await pinterestAccessToken(env, forceRefresh)}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      }
    });
    return response;
  };

  let response = await execute(false);
  if (response.status === 401) response = await execute(true);
  return readPinterestResponse(response);
}

export async function disconnectPinterest(env) {
  await ensurePinterestConnectionTable(env);
  await env.DB.prepare("DELETE FROM pinterest_connections WHERE id = 1").run();
}

export function pinterestOauthUrl(env, state) {
  const url = new URL("https://www.pinterest.com/oauth/");
  url.searchParams.set("client_id", appId(env));
  url.searchParams.set("redirect_uri", redirectUri(env));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", PINTEREST_SCOPES.join(","));
  url.searchParams.set("state", state);
  return url.toString();
}

export function pinterestScopes() {
  return [...PINTEREST_SCOPES];
}
