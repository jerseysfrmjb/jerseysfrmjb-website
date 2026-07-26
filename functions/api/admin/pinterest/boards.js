import { json } from "../_auth.js";
import { pinterestApi, requirePinterestAdmin } from "./_shared.js";

export async function onRequestGet(context) {
  try {
    const authError = await requirePinterestAdmin(context);
    if (authError) return authError;

    const data = await pinterestApi(context.env, "/boards?page_size=100");
    const boards = (data.items || []).map(board => ({
      id: String(board.id || ""),
      name: String(board.name || "Untitled board"),
      privacy: String(board.privacy || "PUBLIC")
    })).filter(board => board.id);

    return json({ ok: true, boards });
  } catch (error) {
    const status = /not connected|connect again|authorization expired/i.test(error?.message || "") ? 409 : 500;
    return json({ error: `Pinterest boards error: ${error?.message || "Unknown error"}` }, status);
  }
}
