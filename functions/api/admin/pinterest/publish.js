import { json } from "../_auth.js";
import { productLandingUrl } from "../../catalog/_products.js";
import {
  pinterestApi,
  requirePinterestAdmin,
  siteOrigin
} from "./_shared.js";

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
  try {
    const authError = await requirePinterestAdmin(context);
    if (authError) return authError;

    const body = await context.request.json().catch(() => ({}));
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
    const status = /not connected|connect again|authorization expired/i.test(error?.message || "") ? 409 : 500;
    return json({ error: `Pinterest publish error: ${error?.message || "Unknown error"}` }, status);
  }
}
