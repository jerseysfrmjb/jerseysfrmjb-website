import { json } from "../_auth.js";
import { pinterestApi, requirePinterestAdmin } from "./_shared.js";

const TRIAL_BOARDS = [
  {
    name: "World Cup Jerseys",
    description: "International football jerseys and World Cup-inspired finds from JerseysFrmJB."
  },
  {
    name: "Retro Football Jerseys",
    description: "Classic football shirts, iconic players, and retro jersey finds from JerseysFrmJB."
  },
  {
    name: "Club Football Jerseys",
    description: "Current club football jerseys and player shirts from JerseysFrmJB."
  }
];

function normalizeBoard(board) {
  return {
    id: String(board.id || ""),
    name: String(board.name || "Untitled board"),
    privacy: String(board.privacy || "PUBLIC")
  };
}

async function listBoards(env) {
  const data = await pinterestApi(env, "/boards?page_size=100");
  return (data.items || []).map(normalizeBoard).filter(board => board.id);
}

export async function onRequestGet(context) {
  try {
    const authError = await requirePinterestAdmin(context);
    if (authError) return authError;

    return json({ ok: true, boards: await listBoards(context.env) });
  } catch (error) {
    const status = /not connected|connect again|authorization expired/i.test(error?.message || "") ? 409 : 500;
    return json({ error: `Pinterest boards error: ${error?.message || "Unknown error"}` }, status);
  }
}

export async function onRequestPost(context) {
  try {
    const authError = await requirePinterestAdmin(context);
    if (authError) return authError;

    const existing = await listBoards(context.env);
    const existingNames = new Set(existing.map(board => board.name.trim().toLowerCase()));
    const created = [];
    for (const board of TRIAL_BOARDS) {
      if (existingNames.has(board.name.toLowerCase())) continue;
      const result = await pinterestApi(context.env, "/boards", {
        method: "POST",
        body: JSON.stringify(board)
      });
      const normalized = normalizeBoard(result);
      if (normalized.id) created.push(normalized);
    }

    return json({
      ok: true,
      created: created.length,
      boards: [...existing, ...created]
    });
  } catch (error) {
    const status = /not connected|connect again|authorization expired/i.test(error?.message || "") ? 409 : 500;
    return json({ error: `Pinterest board creation error: ${error?.message || "Unknown error"}` }, status);
  }
}
