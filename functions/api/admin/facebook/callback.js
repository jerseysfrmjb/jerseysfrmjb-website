import { isAuthorized, readCookie } from "../_auth.js";
import {
  exchangeFacebookCode,
  facebookConfigError,
  siteOrigin
} from "./_shared.js";

function adminRedirect(env, result, message = "") {
  const url = new URL("/admin.html", siteOrigin(env));
  url.searchParams.set("facebook", result);
  if (message) url.searchParams.set("message", String(message).slice(0, 240));
  url.hash = "facebook";
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      "Cache-Control": "no-store",
      "Set-Cookie": "__Host-jb_facebook_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
    }
  });
}

export async function onRequestGet(context) {
  try {
    const configError = facebookConfigError(context.env);
    if (configError) return adminRedirect(context.env, "error", "Facebook configuration is incomplete.");
    if (!(await isAuthorized(context.request, context.env))) {
      return adminRedirect(context.env, "error", "Your admin session expired. Sign in and connect Facebook again.");
    }

    const url = new URL(context.request.url);
    const providerError = url.searchParams.get("error_message")
      || url.searchParams.get("error_description")
      || url.searchParams.get("error");
    if (providerError) return adminRedirect(context.env, "error", providerError);

    const code = url.searchParams.get("code") || "";
    const state = url.searchParams.get("state") || "";
    const expectedState = readCookie(context.request, "__Host-jb_facebook_state");
    if (!code) return adminRedirect(context.env, "error", "Facebook did not return an authorization code.");
    if (!state || !expectedState || state !== expectedState) {
      return adminRedirect(context.env, "error", "Facebook connection expired. Start the connection again.");
    }

    const result = await exchangeFacebookCode(context.env, code);
    return adminRedirect(
      context.env,
      result.selected_page ? "connected" : "select-page",
      result.selected_page ? `Connected to ${result.selected_page.name}.` : "Choose the Facebook Page to publish to."
    );
  } catch (error) {
    return adminRedirect(context.env, "error", error?.message || "Facebook could not be connected.");
  }
}
