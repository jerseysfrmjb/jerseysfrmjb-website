function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300"
    }
  });
}

export function onRequestGet({ env }) {
  const measurementId = String(env.GA4_MEASUREMENT_ID || "G-P42JD6TLP3").trim().toUpperCase();
  return json({
    measurement_id: /^G-[A-Z0-9]{6,20}$/.test(measurementId) ? measurementId : ""
  });
}
