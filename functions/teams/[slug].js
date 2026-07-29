import { seoCollectionResponse } from "../_seoRoute.js";

export async function onRequestGet(context) {
  return seoCollectionResponse(context, "teams");
}
