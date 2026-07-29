import { json } from "../_auth.js";
import { disconnectFacebook, requireFacebookAdmin } from "./_shared.js";

export async function onRequestPost(context) {
  try {
    const authError = await requireFacebookAdmin(context);
    if (authError) return authError;
    await disconnectFacebook(context.env);
    return json({ ok: true });
  } catch (error) {
    return json({ error: `Facebook disconnect error: ${error?.message || "Unknown error"}` }, 500);
  }
}
