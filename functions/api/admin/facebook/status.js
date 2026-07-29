import { json } from "../_auth.js";
import {
  facebookScopes,
  getFacebookConnection,
  requireFacebookAdmin
} from "./_shared.js";

export async function onRequestGet(context) {
  try {
    const authError = await requireFacebookAdmin(context);
    if (authError) return authError;
    const connection = await getFacebookConnection(context.env);
    const expiresAt = Number(connection?.user_expires_at || 0);
    const expired = Boolean(expiresAt && expiresAt <= Math.floor(Date.now() / 1000));
    return json({
      ok: true,
      configured: true,
      connected: Boolean(connection?.page_id && connection?.page_access_token_encrypted && !expired),
      has_authorization: Boolean(connection && !expired),
      needs_page_selection: Boolean(connection && !connection.page_id && !expired),
      expired,
      page: connection?.page_id ? {
        id: String(connection.page_id),
        name: String(connection.page_name || "Facebook Page")
      } : null,
      scope: connection?.scope || facebookScopes().join(","),
      access_expires_at: expiresAt ? new Date(expiresAt * 1000).toISOString() : null,
      connected_at: connection?.connected_at || null
    });
  } catch (error) {
    return json({ error: `Facebook status error: ${error?.message || "Unknown error"}` }, 500);
  }
}
