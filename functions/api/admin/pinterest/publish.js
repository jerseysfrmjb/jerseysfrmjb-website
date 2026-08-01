import { json } from "../_auth.js";
import { productLandingUrl } from "../../catalog/_products.js";
import {
  pinterestApi,
  pinterestPublishingMode,
  requirePinterestAdmin,
  siteOrigin
} from "./_shared.js";
import {
  containsExactStockCount,
  markQueueAttempt,
  markQueueFailed,
  markQueuePublished,
  queueRecord
} from "./_queue.js";

function parseJson(value, fallback) {
  try {
    return JSON.parse(value || "");
  } catch {
    return fallback;
  }
}

function cleanText(value, maxLength) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function productLink(env, productId) {
  return productLandingUrl(productId, siteOrigin(env));
}

function productImage(env, photo) {
  const source = String(photo?.src || "").trim();
  if (!source) return "";
  const url = new URL(source, `${siteOrigin(env)}/`);
  if (url.origin !== siteOrigin(env)) return "";
  return url.toString();
}

export async function onRequestPost(context) {
  let queueId = 0;
  try {
    const authError = await requirePinterestAdmin(context);
    if (authError) return authError;

    const body = await context.request.json().catch(() => ({}));
    queueId = Math.max(0, Math.floor(Number(body.queue_id || 0)));
    const mode = pinterestPublishingMode(context.env);
    if (!mode.can_publish) {
      return json({
        error: "Production publishing is locked until Pinterest Standard access is approved. This Pin remains safely queued."
      }, 409);
    }

    if (queueId) {
      const queued = await queueRecord(context.env, queueId);
      if (!queued) return json({ error: "Pinterest queue item not found." }, 404);
      if (queued.status === "published") return json({ ok: true, pin: queued, queue_item: queued });
      if (queued.environment !== mode.access_mode) {
        return json({
          error: `This ${queued.environment} Pin belongs to a different Pinterest environment and cannot be mixed with ${mode.access_mode} publishing.`
        }, 409);
      }
      await markQueueAttempt(context.env, queueId);
      const data = await pinterestApi(context.env, "/pins", {
        method: "POST",
        body: JSON.stringify({
          board_id: queued.board_id,
          title: queued.title,
          description: queued.description,
          link: queued.product_url,
          alt_text: cleanText(`${queued.product_name} jersey product image`, 500),
          media_source: {
            source_type: "image_url",
            url: queued.image_url
          }
        })
      });
      const pinId = String(data.id || "");
      if (!pinId) throw new Error("Pinterest did not return a Pin ID. The queue item was not marked as published.");
      const pinterestUrl = `https://www.pinterest.com/pin/${encodeURIComponent(pinId)}/`;
      const publishedQueueItem = await markQueuePublished(context.env, queueId, pinId, pinterestUrl);
      return json({ ok: true, pin: publishedQueueItem, queue_item: publishedQueueItem });
    }

    const productId = cleanText(body.product_id, 180);
    const boardId = cleanText(body.board_id, 180);
    const photoIndex = Math.max(0, Math.floor(Number(body.photo_index || 0)));
    if (!productId || !boardId) {
      return json({ error: "Choose an inventory product and Pinterest board." }, 400);
    }

    const product = await context.env.DB.prepare(`
      SELECT id, category, name, size, sizes_json, quantity, photos
      FROM inventory
      WHERE id = ?
      LIMIT 1
    `).bind(productId).first();
    if (!product) return json({ error: "Inventory product not found." }, 404);
    if (Number(product.quantity || 0) <= 0) {
      return json({ error: "Sold-out products cannot be published to Pinterest." }, 400);
    }

    const photos = parseJson(product.photos, []);
    const photo = photos[photoIndex] || photos[0];
    const imageUrl = productImage(context.env, photo);
    if (!imageUrl) return json({ error: "This inventory product does not have a publishable website image." }, 400);

    const title = cleanText(body.title || product.name, 100);
    const description = cleanText(
      body.description || `${product.name}. Browse current jersey inventory from JerseysFrmJB.`,
      800
    );
    if (!title || !description) return json({ error: "Pin title and description are required." }, 400);
    if (containsExactStockCount(description)) {
      return json({ error: "Pin descriptions may list available sizes, but cannot expose exact inventory counts." }, 400);
    }

    const data = await pinterestApi(context.env, "/pins", {
      method: "POST",
      body: JSON.stringify({
        board_id: boardId,
        title,
        description,
        link: productLink(context.env, product.id),
        alt_text: cleanText(photo?.alt || `${product.name} jersey`, 500),
        media_source: {
          source_type: "image_url",
          url: imageUrl
        }
      })
    });

    const pinId = String(data.id || "");
    if (!pinId) throw new Error("Pinterest did not return a Pin ID. The Pin was not recorded as published.");
    return json({
      ok: true,
      pin: {
        id: pinId,
        title,
        image_url: imageUrl,
        link: productLink(context.env, product.id),
        pinterest_url: pinId ? `https://www.pinterest.com/pin/${encodeURIComponent(pinId)}/` : ""
      }
    });
  } catch (error) {
    if (queueId > 0 && context.env.DB) {
      try {
        await markQueueFailed(context.env, queueId, error?.message || "Unknown Pinterest publishing error");
      } catch {
        // Preserve the Pinterest error when queue status logging is unavailable.
      }
    }
    const status = /not connected|connect again|authorization expired/i.test(error?.message || "") ? 409 : 500;
    return json({ error: `Pinterest publish error: ${error?.message || "Unknown error"}` }, status);
  }
}
