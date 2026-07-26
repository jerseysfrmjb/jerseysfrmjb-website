import { json } from "../_auth.js";
import { disconnectPinterest, requirePinterestAdmin } from "./_shared.js";

export async function onRequestDelete(context) {
  try {
    const authError = await requirePinterestAdmin(context);
    if (authError) return authError;
    await disconnectPinterest(context.env);
    return json({ ok: true, connected: false });
  } catch (error) {
    return json({ error: `Pinterest disconnect error: ${error?.message || "Unknown error"}` }, 500);
  }
}
