import { catalogResponse } from "./_products.js";

export function onRequestGet(context) {
  const format = String(context.params?.format || "").toLowerCase();
  if (format === "products.csv") return catalogResponse(context, "csv");
  if (format === "products.json") return catalogResponse(context, "json");

  return new Response(JSON.stringify({ ok: false, error: "Catalog format not found." }), {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
