import { adminConfigError, isAuthorized, json, unauthorized } from "../_auth.js";

const DEFAULT_APP_ID = "1028637966593790";
const DEFAULT_GRAPH_VERSION = "v25.0";
const DEFAULT_REDIRECT_URI = "https://jerseysfrmjb.com/api/admin/facebook/callback";
const FACEBOOK_SCOPES = ["pages_show_list", "pages_read_engagement", "pages_manage_posts"];
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function appId(env) {
  return String(env.FACEBOOK_APP_ID || DEFAULT_APP_ID).trim();
}

export function graphVersion(env) {
  const value = String(env.FACEBOOK_GRAPH_VERSION || DEFAULT_GRAPH_VERSION).trim();
  return /^v\d+\.\d+$/.test(value) ? value : DEFAULT_GRAPH_VERSION;
}

export function redirectUri(env) {
  return String(env.FACEBOOK_REDIRECT_URI || DEFAULT_REDIRECT_URI).trim();
}

export function siteOrigin(env) {
  try {
    return new URL(redirectUri(env)).origin;
  } catch {
    return "https://jerseysfrmjb.com";
  }
}

export function facebookConfigError(env) {
  const baseError = adminConfigError(env, { requireDb: true });
  if (baseError) return baseError;
  if (!appId(env)) return json({ error: "Missing FACEBOOK_APP_ID variable." }, 503);
  if (!env.FACEBOOK_APP_SECRET) return json({ error: "Missing FACEBOOK_APP_SECRET secret." }, 503);
  try {
    new URL(redirectUri(env));
  } catch {
    return json({ error: "FACEBOOK_REDIRECT_URI must be a complete URL." }, 503);
  }
  return null;
}

export async function requireFacebookAdmin(context) {
  const configError = facebookConfigError(context.env);
  if (configError) return configError;
  if (!(await isAuthorized(context.request, context.env))) return unauthorized();
  await ensureFacebookConnectionTable(context.env);
  return null;
}

export async function ensureFacebookConnectionTable(env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS facebook_connections (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    user_access_token_encrypted TEXT NOT NULL,
    page_access_token_encrypted TEXT NOT NULL DEFAULT '',
    page_id TEXT NOT NULL DEFAULT '',
    page_name TEXT NOT NULL DEFAULT '',
    scope TEXT NOT NULL DEFAULT '',
    user_expires_at INTEGER,
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
    env.FACEBOOK_TOKEN_ENCRYPTION_KEY
      || env.FACEBOOK_OAUTH_STATE_SECRET
      || `${env.FACEBOOK_APP_SECRET}:${env.ADMIN_SESSION_SECRET}`
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
    throw new Error("Stored Facebook credentials are invalid. Reconnect Facebook.");
  }
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(ivValue) },
      await tokenEncryptionKey(env),
      base64ToBytes(encryptedValue)
    );
    return textDecoder.decode(decrypted);
  } catch {
    throw new Error("Stored Facebook credentials could not be opened. Reconnect Facebook.");
  }
}

async function appSecretProof(env, accessToken) {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(String(env.FACEBOOK_APP_SECRET)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(accessToken));
  return [...new Uint8Array(signature)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function readFacebookResponse(response) {
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!response.ok || data.error) {
    const detail = data.error || {};
    const message = detail.error_user_msg
      || detail.message
      || data.error_description
      || `Facebook request failed (${response.status}).`;
    const error = new Error(String(message));
    error.status = response.status;
    error.code = detail.code;
    error.subcode = detail.error_subcode;
    error.details = data;
    throw error;
  }
  return data;
}

async function graphRequest(env, path, options = {}, accessToken = "") {
  const url = new URL(`https://graph.facebook.com/${graphVersion(env)}${path}`);
  if (accessToken) url.searchParams.set("appsecret_proof", await appSecretProof(env, accessToken));
  const headers = { Accept: "application/json", ...(options.headers || {}) };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  let body = options.body;
  if (body instanceof URLSearchParams) {
    headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";
    body = body.toString();
  }
  const response = await fetch(url, { ...options, headers, body });
  return readFacebookResponse(response);
}

async function exchangeAuthorizationCode(env, code) {
  const url = new URL(`https://graph.facebook.com/${graphVersion(env)}/oauth/access_token`);
  url.searchParams.set("client_id", appId(env));
  url.searchParams.set("client_secret", String(env.FACEBOOK_APP_SECRET));
  url.searchParams.set("redirect_uri", redirectUri(env));
  url.searchParams.set("code", String(code));
  const shortToken = await readFacebookResponse(await fetch(url, {
    headers: { Accept: "application/json" }
  }));

  const longUrl = new URL(`https://graph.facebook.com/${graphVersion(env)}/oauth/access_token`);
  longUrl.searchParams.set("grant_type", "fb_exchange_token");
  longUrl.searchParams.set("client_id", appId(env));
  longUrl.searchParams.set("client_secret", String(env.FACEBOOK_APP_SECRET));
  longUrl.searchParams.set("fb_exchange_token", String(shortToken.access_token || ""));
  return readFacebookResponse(await fetch(longUrl, {
    headers: { Accept: "application/json" }
  }));
}

export async function listManagedPages(env, userAccessToken) {
  const data = await graphRequest(
    env,
    "/me/accounts?fields=id,name,access_token,tasks&limit=100",
    {},
    userAccessToken
  );
  return (Array.isArray(data.data) ? data.data : [])
    .filter(page => page?.id && page?.name && page?.access_token)
    .map(page => ({
      id: String(page.id),
      name: String(page.name),
      access_token: String(page.access_token),
      tasks: Array.isArray(page.tasks) ? page.tasks.map(String) : []
    }));
}

export async function saveFacebookAuthorization(env, authorization) {
  const userAccessToken = String(authorization.access_token || "").trim();
  if (!userAccessToken) throw new Error("Facebook did not return an access token.");
  const pages = await listManagedPages(env, userAccessToken);
  if (!pages.length) {
    throw new Error("No manageable Facebook Pages were returned. Confirm your personal account has Page content access.");
  }

  const preferredPageId = String(env.FACEBOOK_PAGE_ID || "").trim();
  const selectedPage = pages.find(page => page.id === preferredPageId)
    || (pages.length === 1 ? pages[0] : null);
  const expiresIn = Math.max(60, Number(authorization.expires_in || 0));
  const expiresAt = expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : null;

  await env.DB.prepare(`INSERT INTO facebook_connections (
      id,
      user_access_token_encrypted,
      page_access_token_encrypted,
      page_id,
      page_name,
      scope,
      user_expires_at,
      connected_at,
      updated_at
    ) VALUES (1, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      user_access_token_encrypted = excluded.user_access_token_encrypted,
      page_access_token_encrypted = excluded.page_access_token_encrypted,
      page_id = excluded.page_id,
      page_name = excluded.page_name,
      scope = excluded.scope,
      user_expires_at = excluded.user_expires_at,
      connected_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP`)
    .bind(
      await encryptToken(env, userAccessToken),
      await encryptToken(env, selectedPage?.access_token || ""),
      selectedPage?.id || "",
      selectedPage?.name || "",
      String(authorization.scope || FACEBOOK_SCOPES.join(",")),
      expiresAt
    )
    .run();

  return {
    pages: pages.map(({ id, name, tasks }) => ({ id, name, tasks })),
    selected_page: selectedPage ? { id: selectedPage.id, name: selectedPage.name } : null
  };
}

export async function exchangeFacebookCode(env, code) {
  await ensureFacebookConnectionTable(env);
  return saveFacebookAuthorization(env, await exchangeAuthorizationCode(env, code));
}

export async function getFacebookConnection(env) {
  await ensureFacebookConnectionTable(env);
  return env.DB.prepare("SELECT * FROM facebook_connections WHERE id = 1").first();
}

async function userAccessToken(env, connection = null) {
  const stored = connection || await getFacebookConnection(env);
  if (!stored) throw new Error("Facebook is not connected.");
  if (stored.user_expires_at && Number(stored.user_expires_at) <= Math.floor(Date.now() / 1000) + 300) {
    throw new Error("Facebook authorization expired. Reconnect Facebook.");
  }
  return decryptToken(env, stored.user_access_token_encrypted);
}

export async function availableFacebookPages(env) {
  const connection = await getFacebookConnection(env);
  const pages = await listManagedPages(env, await userAccessToken(env, connection));
  return pages.map(({ id, name, tasks }) => ({ id, name, tasks }));
}

export async function selectFacebookPage(env, pageId) {
  const connection = await getFacebookConnection(env);
  if (!connection) throw new Error("Connect Facebook before choosing a Page.");
  const pages = await listManagedPages(env, await userAccessToken(env, connection));
  const page = pages.find(item => item.id === String(pageId));
  if (!page) throw new Error("That Facebook Page is not available to this connection.");
  await env.DB.prepare(`UPDATE facebook_connections
    SET page_access_token_encrypted = ?, page_id = ?, page_name = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1`)
    .bind(await encryptToken(env, page.access_token), page.id, page.name)
    .run();
  return { id: page.id, name: page.name, tasks: page.tasks };
}

async function pageAccessToken(env) {
  const connection = await getFacebookConnection(env);
  if (!connection?.page_id || !connection?.page_access_token_encrypted) {
    throw new Error("Choose a Facebook Page before publishing.");
  }
  return {
    connection,
    token: await decryptToken(env, connection.page_access_token_encrypted)
  };
}

export async function facebookPageApi(env, path, options = {}) {
  const { token } = await pageAccessToken(env);
  return graphRequest(env, path, options, token);
}

export async function disconnectFacebook(env) {
  await ensureFacebookConnectionTable(env);
  await env.DB.prepare("DELETE FROM facebook_connections WHERE id = 1").run();
}

export function facebookOauthUrl(env, state) {
  const url = new URL(`https://www.facebook.com/${graphVersion(env)}/dialog/oauth`);
  url.searchParams.set("client_id", appId(env));
  url.searchParams.set("redirect_uri", redirectUri(env));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  const configId = String(env.FACEBOOK_LOGIN_CONFIG_ID || "").trim();
  if (configId) {
    url.searchParams.set("config_id", configId);
    url.searchParams.set("override_default_response_type", "true");
  } else {
    url.searchParams.set("scope", FACEBOOK_SCOPES.join(","));
  }
  return url.toString();
}

export function facebookScopes() {
  return [...FACEBOOK_SCOPES];
}
