import {
  getPinterestConnection,
  pinterestScopes,
  requirePinterestAdmin
} from "./_shared.js";

import { json } from "../_auth.js";

export async function onRequestGet(context) {
  try {
    const authError = await requirePinterestAdmin(context);
    if (authError) return authError;

    const connection = await getPinterestConnection(context.env);
    return json({
      ok: true,
      configured: true,
      connected: Boolean(connection),
      scope: connection?.scope || pinterestScopes().join(" "),
      access_expires_at: connection?.access_expires_at
        ? new Date(Number(connection.access_expires_at) * 1000).toISOString()
        : null,
      connected_at: connection?.connected_at || null
    });
  } catch (error) {
    return json({ error: `Pinterest status error: ${error?.message || "Unknown error"}` }, 500);
  }
}
