import { json } from "../_auth.js";
import {
  ensureFacebookPostHistorySchema,
  historyRecord
} from "../facebook-posts.js";
import {
  facebookPageApi,
  getFacebookConnection,
  requireFacebookAdmin,
  siteOrigin
} from "./_shared.js";

const MAX_PHOTOS = 10;

function absolutePhotoUrl(env, photo) {
  const source = String(photo?.src || photo || "").trim();
  if (!source) return "";
  try {
    const origin = siteOrigin(env);
    const url = new URL(source, `${origin}/`);
    if (url.protocol !== "https:" || url.origin !== origin) return "";
    return url.toString();
  } catch {
    return "";
  }
}

async function uploadPhoto(env, pageId, imageUrl) {
  const data = await facebookPageApi(env, `/${encodeURIComponent(pageId)}/photos`, {
    method: "POST",
    body: new URLSearchParams({
      url: imageUrl,
      published: "false"
    })
  });
  const id = String(data.id || "");
  if (!id) throw new Error("Facebook did not return an uploaded photo ID.");
  return id;
}

async function cleanupPhotos(env, photoIds) {
  await Promise.allSettled(photoIds.map(id =>
    facebookPageApi(env, `/${encodeURIComponent(id)}`, { method: "DELETE" })
  ));
}

export async function onRequestPost(context) {
  const { env } = context;
  let postId = 0;
  let uploadedPhotoIds = [];
  try {
    const authError = await requireFacebookAdmin(context);
    if (authError) return authError;
    await ensureFacebookPostHistorySchema(env);

    const body = await context.request.json().catch(() => ({}));
    postId = Math.floor(Number(body.post_id));
    if (!Number.isFinite(postId) || postId <= 0) {
      return json({ error: "Save the Facebook draft before publishing." }, 400);
    }

    const post = await historyRecord(env, postId);
    if (!post) return json({ error: "Facebook draft not found." }, 404);
    if (post.status === "posted") return json({ post });
    if (!String(post.caption || "").trim()) return json({ error: "Facebook caption is required." }, 400);

    const connection = await getFacebookConnection(env);
    if (!connection?.page_id) return json({ error: "Connect and choose a Facebook Page before publishing." }, 409);

    const photoUrls = (post.photo_urls || [])
      .map(photo => absolutePhotoUrl(env, photo))
      .filter(Boolean)
      .slice(0, MAX_PHOTOS);
    if (!photoUrls.length) {
      return json({ error: "This post does not have a valid website product photo." }, 400);
    }

    await env.DB.prepare(`UPDATE facebook_post_history
      SET publish_error = '', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'draft'`)
      .bind(postId)
      .run();

    const uploadResults = await Promise.allSettled(
      photoUrls.map(imageUrl => uploadPhoto(env, String(connection.page_id), imageUrl))
    );
    uploadedPhotoIds = uploadResults
      .filter(result => result.status === "fulfilled")
      .map(result => result.value);
    const failedUpload = uploadResults.find(result => result.status === "rejected");
    if (failedUpload) {
      throw failedUpload.reason instanceof Error
        ? failedUpload.reason
        : new Error("One or more Facebook photos could not be uploaded.");
    }

    const form = new URLSearchParams({ message: String(post.caption).trim() });
    uploadedPhotoIds.forEach((photoId, index) => {
      form.set(`attached_media[${index}]`, JSON.stringify({ media_fbid: photoId }));
    });
    const published = await facebookPageApi(env, `/${encodeURIComponent(connection.page_id)}/feed`, {
      method: "POST",
      body: form
    });
    const remotePostId = String(published.id || "");
    if (!remotePostId) throw new Error("Facebook did not return a published post ID.");

    let facebookPostUrl = "";
    try {
      const details = await facebookPageApi(
        env,
        `/${encodeURIComponent(remotePostId)}?fields=permalink_url`,
        { method: "GET" }
      );
      facebookPostUrl = String(details.permalink_url || "");
    } catch {
      facebookPostUrl = `https://www.facebook.com/${encodeURIComponent(remotePostId)}`;
    }

    await env.DB.prepare(`UPDATE facebook_post_history
      SET status = 'posted',
        facebook_post_id = ?,
        facebook_post_url = ?,
        publish_method = 'api',
        publish_error = '',
        posted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'draft'`)
      .bind(remotePostId, facebookPostUrl, postId)
      .run();

    return json({ ok: true, post: await historyRecord(env, postId) });
  } catch (error) {
    if (uploadedPhotoIds.length) await cleanupPhotos(env, uploadedPhotoIds);
    const message = String(error?.message || "Unknown Facebook publishing error").slice(0, 500);
    if (postId > 0 && env.DB) {
      try {
        await env.DB.prepare(`UPDATE facebook_post_history
          SET publish_error = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND status = 'draft'`)
          .bind(message, postId)
          .run();
      } catch {
        // Preserve the original Facebook error when history logging is unavailable.
      }
    }
    const reconnect = Number(error?.code) === 190
      || /expired|invalid.*token|reconnect|not connected/i.test(message);
    return json({
      error: `Facebook publish error: ${message}`,
      reconnect_required: reconnect
    }, reconnect ? 409 : 502);
  }
}
