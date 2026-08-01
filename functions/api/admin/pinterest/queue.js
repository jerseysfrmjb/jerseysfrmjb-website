import { json } from "../_auth.js";
import { requirePinterestAdmin } from "./_shared.js";
import {
  createQueueRecord,
  ensurePinterestQueueSchema,
  listQueue,
  queueRecord
} from "./_queue.js";

export async function onRequestGet(context) {
  try {
    const authError = await requirePinterestAdmin(context);
    if (authError) return authError;
    await ensurePinterestQueueSchema(context.env);
    return json({ ok: true, queue: await listQueue(context.env) });
  } catch (error) {
    return json({ error: `Pinterest queue error: ${error?.message || "Unknown error"}` }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const authError = await requirePinterestAdmin(context);
    if (authError) return authError;
    const body = await context.request.json().catch(() => ({}));
    return json({ ok: true, pin: await createQueueRecord(context.env, body) }, 201);
  } catch (error) {
    return json({
      error: error?.message || "Pinterest queue error",
      duplicate: error?.duplicate || null
    }, Number(error?.status) || 500);
  }
}

export async function onRequestDelete(context) {
  try {
    const authError = await requirePinterestAdmin(context);
    if (authError) return authError;
    const id = Math.floor(Number(new URL(context.request.url).searchParams.get("id")));
    const existing = await queueRecord(context.env, id);
    if (!existing) return json({ error: "Pinterest queue item not found." }, 404);
    if (existing.status === "published") {
      return json({ error: "Published Pin history is retained for duplicate protection." }, 409);
    }
    await context.env.DB.prepare("DELETE FROM pinterest_pin_queue WHERE id = ? AND status != 'published'")
      .bind(id)
      .run();
    return json({ ok: true });
  } catch (error) {
    return json({ error: `Pinterest queue error: ${error?.message || "Unknown error"}` }, 500);
  }
}
