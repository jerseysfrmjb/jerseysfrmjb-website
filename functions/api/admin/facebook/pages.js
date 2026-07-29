import { json } from "../_auth.js";
import {
  availableFacebookPages,
  requireFacebookAdmin,
  selectFacebookPage
} from "./_shared.js";

export async function onRequestGet(context) {
  try {
    const authError = await requireFacebookAdmin(context);
    if (authError) return authError;
    return json({ pages: await availableFacebookPages(context.env) });
  } catch (error) {
    return json({ error: `Facebook Pages error: ${error?.message || "Unknown error"}` }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const authError = await requireFacebookAdmin(context);
    if (authError) return authError;
    const body = await context.request.json().catch(() => ({}));
    const pageId = String(body.page_id || "").trim();
    if (!pageId) return json({ error: "Choose a Facebook Page." }, 400);
    return json({ ok: true, page: await selectFacebookPage(context.env, pageId) });
  } catch (error) {
    return json({ error: `Facebook Page selection error: ${error?.message || "Unknown error"}` }, 500);
  }
}
