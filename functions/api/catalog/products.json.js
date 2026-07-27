import { catalogResponse } from "./_products.js";

export function onRequestGet(context) {
  return catalogResponse(context, "json");
}
