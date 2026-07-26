import { readCookie } from "../_auth.js";
import {
  ensurePinterestConnectionTable,
  exchangePinterestCode,
  pinterestConfigError,
  siteOrigin
} from "./_shared.js";

function adminRedirect(env, result, message = "") {
  const url = new URL("/admin.html", siteOrigin(env));
  url.searchParams.set("pinterest", result);
  if (message) url.searchParams.set("message", message.slice(0, 240));
  url.hash = "pinterest";
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      "Cache-Control": "no-store",
      "Set-Cookie": "__Host-jb_pinterest_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
    }
  });
}

export async function onRequestGet(context) {
  try {
    const configError = pinterestConfigError(context.env);
    if (configError) return adminRedirect(context.env, "error", "Pinterest configuration is incomplete.");
    await ensurePinterestConnectionTable(context.env);

    const url = new URL(context.request.url);
    const providerError = url.searchParams.get("error_description") || url.searchParams.get("error");
    if (providerError) return adminRedirect(context.env, "error", providerError);

    const code = url.searchParams.get("code") || "";
    const state = url.searchParams.get("state") || "";
    const expectedState = readCookie(context.request, "__Host-jb_pinterest_state");
    if (!code) return adminRedirect(context.env, "error", "Pinterest did not return an authorization code.");
    if (!state || !expectedState || state !== expectedState) {
      return adminRedirect(context.env, "error", "Pinterest connection expired. Start the connection again.");
    }

    await exchangePinterestCode(context.env, code);
    return adminRedirect(context.env, "connected");
  } catch (error) {
    return adminRedirect(context.env, "error", error?.message || "Pinterest could not be connected.");
  }
}
