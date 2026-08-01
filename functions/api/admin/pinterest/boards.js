import { json } from "../_auth.js";
import { pinterestApi, requirePinterestAdmin } from "./_shared.js";

const TRIAL_BOARDS = [
  {
    name: "JerseysFrmJB Trial - New Arrivals",
    description: "The newest football jersey arrivals available to view through JerseysFrmJB."
  },
  {
    name: "JerseysFrmJB Trial - Barcelona Jerseys",
    description: "Barcelona football jerseys, player shirts, and current club finds from JerseysFrmJB."
  },
  {
    name: "JerseysFrmJB Trial - Real Madrid Jerseys",
    description: "Real Madrid football jerseys, player shirts, and current club finds from JerseysFrmJB."
  },
  {
    name: "JerseysFrmJB Trial - Premier League Jerseys",
    description: "Premier League club football jerseys available to view through JerseysFrmJB."
  },
  {
    name: "JerseysFrmJB Trial - La Liga Jerseys",
    description: "La Liga club football jerseys available to view through JerseysFrmJB."
  },
  {
    name: "JerseysFrmJB Trial - Retro Jerseys",
    description: "Classic football shirts, iconic players, and retro jersey finds from JerseysFrmJB."
  },
  {
    name: "JerseysFrmJB Trial - International Team Jerseys",
    description: "International team and country football jerseys available through JerseysFrmJB."
  },
  {
    name: "JerseysFrmJB Trial - World Cup 2026 Jerseys",
    description: "World Cup 2026 national team jerseys and player shirts from JerseysFrmJB."
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

async function createBoard(env, board) {
  try {
    return await pinterestApi(env, "/boards", {
      method: "POST",
      body: JSON.stringify({ ...board, privacy: "PUBLIC" })
    });
  } catch (error) {
    if (!/different name|already (?:have|has) a board|board with this name/i.test(error?.message || "")) throw error;
    const suffix = `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
    return pinterestApi(env, "/boards", {
      method: "POST",
      body: JSON.stringify({ ...board, name: `${board.name} ${suffix}`, privacy: "PUBLIC" })
    });
  }
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
      const result = await createBoard(context.env, board);
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
