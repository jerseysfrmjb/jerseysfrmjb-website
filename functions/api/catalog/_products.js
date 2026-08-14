const DEFAULT_SITE_ORIGIN = "https://jerseysfrmjb.com";
const CURRENCY = "USD";
const CACHE_CONTROL = "public, max-age=300, s-maxage=300, stale-while-revalidate=60";
const SIZE_ORDER = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const SIZE_WORDS = [
  ["4XL", /4\s*x\s*l/i],
  ["3XL", /3\s*x\s*l/i],
  ["2XL", /2\s*x\s*l|xxl/i],
  ["XL", /\bxl\b|extra\s+large/i],
  ["L", /\bl\b|\blarge\b/i],
  ["M", /\bm\b|\bmedium\b/i],
  ["S", /\bs\b|\bsmall\b/i]
];

export const CSV_COLUMNS = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "facebook_price",
  "currency",
  "link",
  "image_link",
  "additional_image_link",
  "brand",
  "identifier_exists",
  "shipping_weight",
  "team_country",
  "player",
  "category",
  "product_type",
  "size",
  "available_sizes",
  "google_product_category",
  "age_group",
  "gender",
  "canonical_link"
];

const KNOWN_TEAMS = [
  "Manchester United",
  "Manchester City",
  "Real Madrid",
  "Borussia Dortmund",
  "AC Milan",
  "Barcelona",
  "Liverpool",
  "Argentina",
  "Portugal",
  "England",
  "Spain",
  "United States",
  "USA",
  "Germany",
  "Brazil",
  "France",
  "Norway",
  "Morocco",
  "Mexico",
  "Colombia",
  "Japan"
];

const PLAYER_FALLBACKS = new Map([
  ["messi", { player: "Lionel Messi", team: "Argentina" }],
  ["lionel messi", { player: "Lionel Messi", team: "Argentina" }],
  ["cristiano ronaldo", { player: "Cristiano Ronaldo", team: "Portugal" }],
  ["ronaldo", { player: "Cristiano Ronaldo", team: "Portugal" }]
]);

function parseJson(value, fallback) {
  try {
    return JSON.parse(value || "");
  } catch {
    return fallback;
  }
}

function normalizeSiteOrigin(value = "") {
  try {
    const url = new URL(value || DEFAULT_SITE_ORIGIN);
    return url.protocol === "https:" ? url.origin : DEFAULT_SITE_ORIGIN;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

function normalizeSizes(raw = {}, fallbackSize = "", fallbackQuantity = 0) {
  const sizes = {};
  for (const size of SIZE_ORDER) {
    const quantity = Math.max(0, Math.floor(Number(raw?.[size] || 0)));
    if (quantity > 0) sizes[size] = quantity;
  }

  if (!Object.keys(sizes).length && Number(fallbackQuantity) > 0) {
    const matches = SIZE_WORDS
      .filter(([, pattern]) => pattern.test(String(fallbackSize)))
      .map(([size]) => size);
    if (matches.length) {
      const baseQuantity = Math.max(1, Math.floor(Number(fallbackQuantity) / matches.length));
      for (const size of matches) sizes[size] = baseQuantity;
    }
  }

  return sizes;
}

function totalQuantity(sizes = {}, fallbackQuantity = 0) {
  const sizeTotal = SIZE_ORDER.reduce(
    (sum, size) => sum + Math.max(0, Math.floor(Number(sizes[size] || 0))),
    0
  );
  return sizeTotal || Math.max(0, Math.floor(Number(fallbackQuantity || 0)));
}

function cleanPlayer(value = "") {
  const player = String(value)
    .replace(/\s+#\d+\b.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  return /^no name(?:\s*\/\s*no number)?$/i.test(player) ? "" : player;
}

function canonicalPlayer(value = "") {
  const player = cleanPlayer(value);
  return PLAYER_FALLBACKS.get(player.toLowerCase())?.player || player;
}

function cleanTeamCountry(value = "") {
  return String(value)
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(?:\d{2}|\d{4})\/(?:\d{2}|\d{4})\b/g, " ")
    .replace(/\b(?:19|20)\d{2}\b/g, " ")
    .replace(/\b(?:world cup|home|away|third|3rd|off[- ]white|white|black|goalkeeper|long sleeve|longsleeve|short sleeve|player version|fan version|jersey|shirt|kit|set)\b/gi, " ")
    .replace(/[|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchKnownTeam(title = "") {
  const normalized = String(title).replace(/\s+/g, " ").trim();
  const match = KNOWN_TEAMS
    .slice()
    .sort((a, b) => b.length - a.length)
    .find(team => new RegExp(`\\b${team.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(normalized));
  return match === "USA" ? "USA" : match || "";
}

export function inferProductIdentity(value = "") {
  const title = String(value || "").trim();
  if (!title) return { player: "", team_country: "" };

  if (title.includes("|")) {
    const [playerPart, ...teamParts] = title.split("|");
    return {
      player: canonicalPlayer(playerPart),
      team_country: cleanTeamCountry(teamParts.join(" "))
    };
  }

  const numbered = title.match(/^(.+?)\s+#\d+\b\s*(.*)$/);
  if (numbered) {
    const team = matchKnownTeam(numbered[2]);
    return {
      player: canonicalPlayer(numbered[1]),
      team_country: team || cleanTeamCountry(numbered[2])
    };
  }

  const team = matchKnownTeam(title);
  if (team) {
    const teamIndex = title.toLowerCase().indexOf(team.toLowerCase());
    const player = canonicalPlayer(title.slice(0, teamIndex));
    return {
      player: player && !/^(no name|no number)/i.test(player) ? player : "",
      team_country: team
    };
  }

  const playerCandidate = canonicalPlayer(
    title
      .replace(/\b(?:19|20)\d{2}(?:\/\d{2,4})?\b.*$/i, "")
      .replace(/\bworld cup\b.*$/i, "")
  );
  const fallback = PLAYER_FALLBACKS.get(playerCandidate.toLowerCase()) || null;
  return {
    player: fallback?.player || "",
    team_country: fallback?.team || cleanTeamCountry(title)
  };
}

export function categoryLabel(category = "") {
  if (category === "world") return "International Team Jerseys";
  if (category === "club") return "Club Jerseys";
  if (category === "retro") return "Retro Jerseys";
  return "Football Jerseys";
}

export function slugifySeo(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractSeason(value = "") {
  const title = String(value);
  const season = title.match(/\b((?:19|20)\d{2})\/(\d{2,4})\b/);
  if (season) {
    const end = season[2].length === 2 ? `${season[1].slice(0, 2)}${season[2]}` : season[2];
    return `${season[1]}/${end}`;
  }
  const shortSeason = title.match(/\b(\d{2})\/(\d{2})\b/);
  if (shortSeason) {
    const startCentury = Number(shortSeason[1]) >= 70 ? "19" : "20";
    const endCentury = Number(shortSeason[2]) < Number(shortSeason[1]) ? "20" : startCentury;
    return `${startCentury}${shortSeason[1]}/${endCentury}${shortSeason[2]}`;
  }
  const year = title.match(/\b((?:19|20)\d{2})\b/);
  return year?.[1] || "";
}

export function inferCompetition(value = "", category = "") {
  const title = String(value);
  if (/\bclub world cup\b/i.test(title)) return "FIFA Club World Cup";
  if (/\bworld cup\b/i.test(title) || category === "world") return "World Cup";
  if (/\bchampions league\b/i.test(title)) return "UEFA Champions League";
  if (/\bcopa am[eé]rica\b/i.test(title)) return "Copa América";
  if (/\b(?:uefa )?euros?\b/i.test(title)) return "UEFA European Championship";
  return "";
}

function numericPrice(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function selectedPrice(row = {}) {
  const candidates = [
    ["facebook", numericPrice(row.facebook_price)],
    ["website", numericPrice(row.website_price)],
    ["base", numericPrice(row.base_price)]
  ];
  const selected = candidates.find(([, amount]) => amount !== null);
  return selected ? { source: selected[0], amount: selected[1] } : null;
}

function imageRevision(value = "") {
  const revision = String(value || "").replace(/\D/g, "");
  return revision || "catalog1";
}

function absoluteImageUrl(value, siteOrigin, revision) {
  if (!value || typeof value !== "string") return "";
  try {
    const url = new URL(value.trim(), siteOrigin);
    if (url.protocol !== "https:") return "";
    if (url.origin === siteOrigin) url.searchParams.set("v", revision);
    return url.toString();
  } catch {
    return "";
  }
}

function selectProductImages(photos, siteOrigin, revision) {
  const valid = (Array.isArray(photos) ? photos : [])
    .map(photo => ({
      src: absoluteImageUrl(photo?.src, siteOrigin, revision),
      label: `${photo?.src || ""} ${photo?.alt || ""}`.toLowerCase()
    }))
    .filter(photo => photo.src);

  const front = valid.find(photo => /\bfront\b/.test(photo.label)) || valid[0];
  const back = valid.find(photo => photo.src !== front?.src && /\bback\b/.test(photo.label));
  return {
    image_link: front?.src || "",
    additional_image_link: back?.src || ""
  };
}

export function productLandingUrl(productId, siteOrigin = DEFAULT_SITE_ORIGIN) {
  const origin = normalizeSiteOrigin(siteOrigin);
  const id = String(productId || "").trim();
  if (!id) return "";
  return `${origin}/products/${encodeURIComponent(id)}`;
}

function productDescription(row, identity, availableSizes) {
  const details = [
    row.name,
    categoryLabel(row.category),
    identity.team_country,
    identity.player ? `Player: ${identity.player}` : "",
    availableSizes.length ? `Available sizes: ${availableSizes.join(", ")}` : "Currently sold out"
  ].filter(Boolean);
  return details.join(". ") + ".";
}

export function buildCatalogProducts(rows = [], options = {}) {
  const siteOrigin = normalizeSiteOrigin(options.siteOrigin);

  return rows.flatMap(row => {
    const id = String(row?.id || "").trim();
    const title = String(row?.name || "").trim();
    const price = selectedPrice(row);
    if (!id || !title || !price) return [];

    const sizes = normalizeSizes(
      parseJson(row.sizes_json, row.sizes || {}),
      row.size,
      row.quantity
    );
    const quantity = totalQuantity(sizes, row.quantity);
    const availableSizes = SIZE_ORDER.filter(size => Number(sizes[size]) > 0);
    const identity = inferProductIdentity(title);
    const images = selectProductImages(
      parseJson(row.photos, row.photos || []),
      siteOrigin,
      imageRevision(row.updated_at)
    );
    if (!images.image_link) return [];

    return [{
      id,
      title,
      description: productDescription(row, identity, availableSizes),
      availability: quantity > 0 ? "in stock" : "out of stock",
      condition: "new",
      price: `${price.amount.toFixed(2)} ${CURRENCY}`,
      facebook_price: price.amount.toFixed(2),
      price_source: price.source,
      currency: CURRENCY,
      link: productLandingUrl(id, siteOrigin),
      image_link: images.image_link,
      additional_image_link: images.additional_image_link,
      brand: "JerseysFrmJB",
      identifier_exists: "no",
      shipping_weight: /long\s*sleeve/i.test(title) ? "14 oz" : "12 oz",
      team_country: identity.team_country,
      player: identity.player,
      category: String(row.category || "").trim(),
      product_type: categoryLabel(row.category),
      size: availableSizes.join(", "),
      available_sizes: availableSizes.join(", "),
      google_product_category: "Apparel & Accessories > Clothing > Shirts & Tops",
      age_group: "adult",
      gender: "unisex",
      canonical_link: productLandingUrl(id, siteOrigin)
    }];
  });
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export function productsToCsv(products = []) {
  const rows = [
    CSV_COLUMNS.map(csvCell).join(","),
    ...products.map(product => CSV_COLUMNS.map(column => csvCell(product[column])).join(","))
  ];
  return "\uFEFF" + rows.join("\r\n") + "\r\n";
}

export async function loadCatalogRows(env) {
  const result = await env.DB.prepare(`
    SELECT
      inventory.id,
      inventory.category,
      inventory.name,
      inventory.size,
      inventory.sizes_json,
      inventory.price AS base_price,
      inventory.quantity,
      inventory.photos,
      inventory.updated_at,
      facebook_prices.price AS facebook_price,
      website_prices.price AS website_price
    FROM inventory
    LEFT JOIN product_platform_prices AS facebook_prices
      ON facebook_prices.product_id = inventory.id
      AND facebook_prices.platform = 'Facebook'
    LEFT JOIN product_platform_prices AS website_prices
      ON website_prices.product_id = inventory.id
      AND website_prices.platform = 'Website'
    ORDER BY
      CASE WHEN inventory.quantity > 0 THEN 0 ELSE 1 END,
      inventory.category,
      inventory.sort_order,
      inventory.name
  `).all();
  return result.results || [];
}

function responseHeaders(contentType) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": CACHE_CONTROL,
    "Content-Type": contentType,
    "Vary": "Accept-Encoding",
    "X-Content-Type-Options": "nosniff"
  };
}

function errorResponse(message, status) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: {
      ...responseHeaders("application/json; charset=utf-8"),
      "Cache-Control": "no-store"
    }
  });
}

export async function catalogResponse(context, format) {
  if (!context?.env?.DB) {
    return errorResponse("Catalog database is unavailable.", 503);
  }

  try {
    const rows = await loadCatalogRows(context.env);
    const products = buildCatalogProducts(rows, {
      siteOrigin: context.env.CATALOG_SITE_ORIGIN || DEFAULT_SITE_ORIGIN
    });

    if (format === "csv") {
      return new Response(productsToCsv(products), {
        status: 200,
        headers: {
          ...responseHeaders("text/csv; charset=utf-8"),
          "Content-Disposition": 'inline; filename="jerseysfrmjb-products.csv"'
        }
      });
    }

    return new Response(JSON.stringify({
      catalog: "JerseysFrmJB",
      currency: CURRENCY,
      product_count: products.length,
      products
    }), {
      status: 200,
      headers: responseHeaders("application/json; charset=utf-8")
    });
  } catch {
    return errorResponse("Catalog feed is temporarily unavailable.", 500);
  }
}
