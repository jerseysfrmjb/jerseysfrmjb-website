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

const MAX_PHOTOS = 5;
const PHOTO_TIMEOUT_MS = 8000;
const PUBLISH_TIMEOUT_MS = 10000;
const LOOKUP_TIMEOUT_MS = 4000;
const CLEANUP_TIMEOUT_MS = 2500;

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
    timeoutMs: PHOTO_TIMEOUT_MS,
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
    facebookPageApi(env, `/${encodeURIComponent(id)}`, {
      method: "DELETE",
      timeoutMs: CLEANUP_TIMEOUT_MS
    })
  ));
}

export function prioritizedPhotoUrls(env, photos = []) {
  const firstByProduct = [];
  const extraPhotos = [];
  const seenProducts = new Set();
  for (const photo of photos) {
    const imageUrl = absolutePhotoUrl(env, photo);
    if (!imageUrl) continue;
    const productId = String(photo?.product_id || "");
    if (productId && !seenProducts.has(productId)) {
      seenProducts.add(productId);
      firstByProduct.push(imageUrl);
    } else {
      extraPhotos.push(imageUrl);
    }
  }
  return [...firstByProduct, ...extraPhotos].slice(0, MAX_PHOTOS);
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

    const photoUrls = prioritizedPhotoUrls(env, post.photo_urls || []);
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
    const failedUploads = uploadResults.filter(result => result.status === "rejected");
    if (!uploadedPhotoIds.length) {
      const failedUpload = failedUploads[0];
      throw failedUpload?.reason instanceof Error
        ? failedUpload.reason
        : new Error("Facebook could not upload the selected product photos.");
    }

    const form = new URLSearchParams({ message: String(post.caption).trim() });
    uploadedPhotoIds.forEach((photoId, index) => {
      form.set(`attached_media[${index}]`, JSON.stringify({ media_fbid: photoId }));
    });
    const published = await facebookPageApi(env, `/${encodeURIComponent(connection.page_id)}/feed`, {
      method: "POST",
      timeoutMs: PUBLISH_TIMEOUT_MS,
      body: form
    });
    const remotePostId = String(published.id || "");
    if (!remotePostId) throw new Error("Facebook did not return a published post ID.");

    let facebookPostUrl = "";
    try {
      const details = await facebookPageApi(
        env,
        `/${encodeURIComponent(remotePostId)}?fields=permalink_url`,
        { method: "GET", timeoutMs: LOOKUP_TIMEOUT_MS }
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

    return json({
      ok: true,
      post: await historyRecord(env, postId),
      warning: failedUploads.length
        ? `Published with ${uploadedPhotoIds.length} of ${photoUrls.length} selected photos because Facebook could not process every image in time.`
        : ""
    });
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
