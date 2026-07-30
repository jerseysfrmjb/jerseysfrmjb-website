import { ensureInventory } from "../_inventorySeed.js";
import { ensureAnalyticsSchema } from "../_analyticsSchema.js";
import { inferCompetition, inferProductIdentity } from "../catalog/_products.js";
import { adminConfigError, isAuthorized, json, unauthorized } from "./_auth.js";

const RANGE_DAYS = { today: 0, "7d": 7, "30d": 30, all: null };
const SUMMARY_SQL = `
  SELECT
    COUNT(DISTINCT visitor_id) AS visitors,
    COUNT(DISTINCT session_id) AS sessions,
    SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS page_views,
    SUM(CASE WHEN event_type = 'product_view' THEN 1 ELSE 0 END) AS product_views,
    SUM(CASE WHEN event_type = 'marketplace_click' THEN 1 ELSE 0 END) AS marketplace_clicks
  FROM analytics_events
  WHERE occurred_at >= ?`;
const SESSION_SQL = `
  SELECT
    COALESCE(AVG(page_views), 0) AS pages_per_visit,
    COALESCE(AVG(duration_seconds), 0) AS average_session_duration,
    COALESCE(AVG(CASE WHEN page_views <= 1 AND duration_seconds < 10 THEN 100.0 ELSE 0 END), 0) AS bounce_rate
  FROM (
    SELECT
      session_id,
      SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS page_views,
      SUM(CASE WHEN event_type = 'engagement' THEN duration_seconds ELSE 0 END) AS duration_seconds
    FROM analytics_events
    WHERE occurred_at >= ?
    GROUP BY session_id
  )`;

function number(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function round(value, places = 1) {
  const factor = 10 ** places;
  return Math.round(number(value) * factor) / factor;
}

function easternParts(date = new Date()) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date)
      .filter(part => part.type !== "literal")
      .map(part => [part.type, part.value])
  );
}

function easternWallTimeToDate(year, month, day, hour = 0) {
  const target = Date.UTC(year, month - 1, day, hour);
  let guess = target;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = easternParts(new Date(guess));
    const represented = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
    guess += target - represented;
  }
  return new Date(guess);
}

function sqlTimestamp(date) {
  return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");
}

function cutoffForRange(range, now = new Date()) {
  if (range === "all") return "1970-01-01 00:00:00";
  if (range === "today") {
    const parts = easternParts(now);
    return sqlTimestamp(easternWallTimeToDate(Number(parts.year), Number(parts.month), Number(parts.day)));
  }
  return sqlTimestamp(new Date(now.getTime() - RANGE_DAYS[range] * 86400000));
}

function normalizedSummary(summary = {}, sessions = {}) {
  return {
    visitors: number(summary.visitors),
    unique_visitors: number(summary.visitors),
    sessions: number(summary.sessions),
    page_views: number(summary.page_views),
    product_views: number(summary.product_views),
    marketplace_clicks: number(summary.marketplace_clicks),
    pages_per_visit: round(sessions.pages_per_visit, 2),
    average_session_duration: round(sessions.average_session_duration, 0),
    bounce_rate: round(sessions.bounce_rate, 1)
  };
}

function aggregateEntities(products) {
  const groups = {
    teams: new Map(),
    players: new Map(),
    competitions: new Map()
  };
  for (const product of products) {
    const identity = inferProductIdentity(product.name);
    const competition = inferCompetition(product.name, product.category);
    for (const [group, value] of [
      ["teams", identity.team_country],
      ["players", identity.player],
      ["competitions", competition]
    ]) {
      if (!value) continue;
      const current = groups[group].get(value) || { name: value, views: 0, clicks: 0 };
      current.views += number(product.views);
      current.clicks += number(product.clicks);
      groups[group].set(value, current);
    }
  }
  return Object.fromEntries(
    Object.entries(groups).map(([key, values]) => [
      key,
      [...values.values()].sort((a, b) => b.views - a.views || b.clicks - a.clicks || a.name.localeCompare(b.name)).slice(0, 12)
    ])
  );
}

function aggregateSearchEntities(searches, products) {
  const candidates = {
    players: new Map(),
    clubs: new Map(),
    countries: new Map(),
    competitions: new Map()
  };
  for (const product of products) {
    const identity = inferProductIdentity(product.name);
    const competition = inferCompetition(product.name, product.category);
    if (identity.player) candidates.players.set(identity.player.toLowerCase(), identity.player);
    if (identity.team_country) {
      const group = product.category === "world" ? "countries" : "clubs";
      candidates[group].set(identity.team_country.toLowerCase(), identity.team_country);
    }
    if (competition) candidates.competitions.set(competition.toLowerCase(), competition);
  }

  const totals = Object.fromEntries(Object.keys(candidates).map(key => [key, new Map()]));
  for (const search of searches) {
    const query = String(search.query || "").toLowerCase();
    if (!query) continue;
    for (const [group, values] of Object.entries(candidates)) {
      for (const [normalized, label] of values) {
        if (query.includes(normalized) || (query.length >= 3 && normalized.includes(query))) {
          totals[group].set(label, number(totals[group].get(label)) + number(search.searches));
        }
      }
    }
  }
  return Object.fromEntries(
    Object.entries(totals).map(([group, values]) => [
      group,
      [...values].map(([name, searches]) => ({ name, searches }))
        .sort((a, b) => b.searches - a.searches || a.name.localeCompare(b.name))
        .slice(0, 10)
    ])
  );
}

function productRows(rows = []) {
  return rows.map(row => {
    const views = number(row.views);
    const clicks = number(row.clicks);
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      quantity: number(row.quantity),
      views,
      clicks,
      ebay_clicks: number(row.ebay_clicks),
      depop_clicks: number(row.depop_clicks),
      ctr: views ? round((clicks / views) * 100, 1) : 0,
      views_30d: number(row.views_30d),
      last_viewed_at: row.last_viewed_at || ""
    };
  });
}

function generateInsights({ products, entities, sources, sourceComparison }) {
  const insights = [];
  const totalViews = products.reduce((sum, item) => sum + item.views, 0);
  const topTeam = entities.teams[0];
  if (topTeam?.views && totalViews) {
    insights.push(`${topTeam.name} jerseys received ${round((topTeam.views / totalViews) * 100, 0)}% of product views in this period.`);
  }

  const pinterestCurrent = number(sourceComparison.find(row => row.traffic_source === "Pinterest")?.current_visitors);
  const pinterestPrevious = number(sourceComparison.find(row => row.traffic_source === "Pinterest")?.previous_visitors);
  if (pinterestCurrent || pinterestPrevious) {
    const change = pinterestPrevious
      ? round(((pinterestCurrent - pinterestPrevious) / pinterestPrevious) * 100, 0)
      : 100;
    insights.push(`Pinterest traffic ${change >= 0 ? "increased" : "decreased"} ${Math.abs(change)}% compared with the previous 7 days.`);
  }

  const lowCtr = products
    .filter(item => item.views >= 3)
    .sort((a, b) => a.ctr - b.ctr || b.views - a.views)[0];
  if (lowCtr) insights.push(`${lowCtr.name} has ${lowCtr.views} views but a ${lowCtr.ctr}% marketplace click-through rate.`);

  const inactive = products.filter(item => item.views_30d === 0).length;
  if (inactive) insights.push(`${inactive} ${inactive === 1 ? "product has" : "products have"} not been viewed in the last 30 days.`);

  const restock = products
    .filter(item => item.quantity <= 1 && item.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks)[0];
  if (restock) insights.push(`Consider restocking ${restock.name}; it has marketplace interest and ${restock.quantity ? "low inventory" : "is sold out"}.`);

  if (!insights.length) insights.push("Analytics are collecting now. Recommendations will appear as visitors view products, search, and open marketplace listings.");
  return insights;
}

async function requireAdmin(request, env) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();
  await ensureInventory(env);
  await ensureAnalyticsSchema(env);
  return null;
}

export async function onRequestGet({ request, env }) {
  try {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;

    const url = new URL(request.url);
    const range = Object.hasOwn(RANGE_DAYS, url.searchParams.get("range")) ? url.searchParams.get("range") : "30d";
    const now = new Date();
    const cutoffs = {
      today: cutoffForRange("today", now),
      "7d": cutoffForRange("7d", now),
      "30d": cutoffForRange("30d", now),
      all: cutoffForRange("all", now)
    };
    const selectedCutoff = cutoffs[range];
    const chartCutoff = range === "all"
      ? sqlTimestamp(new Date(now.getTime() - 90 * 86400000))
      : selectedCutoff;
    const previousWeekStart = sqlTimestamp(new Date(now.getTime() - 14 * 86400000));
    const currentWeekStart = cutoffs["7d"];

    const windowStatements = Object.values(cutoffs).flatMap(cutoff => [
      env.DB.prepare(SUMMARY_SQL).bind(cutoff),
      env.DB.prepare(SESSION_SQL).bind(cutoff)
    ]);
    const windowResults = await env.DB.batch(windowStatements);
    const windows = {};
    Object.keys(cutoffs).forEach((key, index) => {
      windows[key] = normalizedSummary(
        windowResults[index * 2]?.results?.[0],
        windowResults[index * 2 + 1]?.results?.[0]
      );
    });

    const detailResults = await env.DB.batch([
      env.DB.prepare(`
        SELECT
          COALESCE(NULLIF(local_day, ''), date(occurred_at, '-4 hours')) AS day,
          SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS page_views,
          COUNT(DISTINCT visitor_id) AS visitors,
          SUM(CASE WHEN event_type = 'marketplace_click' THEN 1 ELSE 0 END) AS marketplace_clicks,
          SUM(CASE WHEN event_type = 'search' THEN 1 ELSE 0 END) AS searches
        FROM analytics_events
        WHERE occurred_at >= ?
        GROUP BY COALESCE(NULLIF(local_day, ''), date(occurred_at, '-4 hours'))
        ORDER BY day`).bind(chartCutoff),
      env.DB.prepare(`
        SELECT
          inventory.id,
          inventory.name,
          inventory.category,
          inventory.quantity,
          COALESCE(events.views, 0) AS views,
          COALESCE(events.clicks, 0) AS clicks,
          COALESCE(events.ebay_clicks, 0) AS ebay_clicks,
          COALESCE(events.depop_clicks, 0) AS depop_clicks,
          COALESCE(events.views_30d, 0) AS views_30d,
          events.last_viewed_at
        FROM inventory
        LEFT JOIN (
          SELECT
            product_id,
            SUM(CASE WHEN event_type = 'product_view' AND occurred_at >= ? THEN 1 ELSE 0 END) AS views,
            SUM(CASE WHEN event_type = 'marketplace_click' AND occurred_at >= ? THEN 1 ELSE 0 END) AS clicks,
            SUM(CASE WHEN event_type = 'marketplace_click' AND marketplace = 'eBay' AND occurred_at >= ? THEN 1 ELSE 0 END) AS ebay_clicks,
            SUM(CASE WHEN event_type = 'marketplace_click' AND marketplace = 'Depop' AND occurred_at >= ? THEN 1 ELSE 0 END) AS depop_clicks,
            SUM(CASE WHEN event_type = 'product_view' AND occurred_at >= ? THEN 1 ELSE 0 END) AS views_30d,
            MAX(CASE WHEN event_type = 'product_view' THEN occurred_at END) AS last_viewed_at
          FROM analytics_events
          WHERE product_id <> ''
          GROUP BY product_id
        ) AS events ON events.product_id = inventory.id
        ORDER BY views DESC, clicks DESC, inventory.name
      `).bind(selectedCutoff, selectedCutoff, selectedCutoff, selectedCutoff, cutoffs["30d"]),
      env.DB.prepare(`
        SELECT
          traffic_source,
          COUNT(DISTINCT visitor_id) AS visitors,
          SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS page_views
        FROM analytics_events
        WHERE occurred_at >= ?
        GROUP BY traffic_source
        ORDER BY visitors DESC, page_views DESC`).bind(selectedCutoff),
      env.DB.prepare(`
        SELECT
          COALESCE(NULLIF(local_day, ''), date(occurred_at, '-4 hours')) AS day,
          traffic_source,
          COUNT(DISTINCT visitor_id) AS visitors
        FROM analytics_events
        WHERE occurred_at >= ?
        GROUP BY COALESCE(NULLIF(local_day, ''), date(occurred_at, '-4 hours')), traffic_source
        ORDER BY day, visitors DESC`).bind(chartCutoff),
      env.DB.prepare(`
        SELECT country, region, COUNT(DISTINCT visitor_id) AS visitors
        FROM analytics_events
        WHERE occurred_at >= ? AND country <> ''
        GROUP BY country, region
        ORDER BY visitors DESC
        LIMIT 100`).bind(selectedCutoff),
      env.DB.prepare(`
        SELECT device_type, COUNT(DISTINCT visitor_id) AS visitors
        FROM analytics_events
        WHERE occurred_at >= ?
        GROUP BY device_type
        ORDER BY visitors DESC`).bind(selectedCutoff),
      env.DB.prepare(`
        SELECT browser, COUNT(DISTINCT visitor_id) AS visitors
        FROM analytics_events
        WHERE occurred_at >= ?
        GROUP BY browser
        ORDER BY visitors DESC`).bind(selectedCutoff),
      env.DB.prepare(`
        SELECT
          search_query,
          COUNT(*) AS searches,
          SUM(CASE WHEN search_results = 0 THEN 1 ELSE 0 END) AS zero_result_searches,
          ROUND(AVG(COALESCE(search_results, 0)), 1) AS average_results,
          MAX(occurred_at) AS last_searched_at
        FROM analytics_events
        WHERE event_type = 'search' AND occurred_at >= ? AND search_query <> ''
        GROUP BY lower(search_query)
        ORDER BY searches DESC, last_searched_at DESC
        LIMIT 100`).bind(selectedCutoff),
      env.DB.prepare(`
        SELECT marketplace, COUNT(*) AS clicks
        FROM analytics_events
        WHERE event_type = 'marketplace_click' AND occurred_at >= ?
        GROUP BY marketplace
        ORDER BY clicks DESC`).bind(selectedCutoff),
      env.DB.prepare(`
        SELECT COALESCE(NULLIF(local_day, ''), date(occurred_at, '-4 hours')) AS day, marketplace, COUNT(*) AS clicks
        FROM analytics_events
        WHERE event_type = 'marketplace_click' AND occurred_at >= ?
        GROUP BY COALESCE(NULLIF(local_day, ''), date(occurred_at, '-4 hours')), marketplace
        ORDER BY day, clicks DESC`).bind(chartCutoff),
      env.DB.prepare(`
        SELECT
          traffic_source,
          COUNT(DISTINCT CASE WHEN occurred_at >= ? THEN visitor_id END) AS current_visitors,
          COUNT(DISTINCT CASE WHEN occurred_at >= ? AND occurred_at < ? THEN visitor_id END) AS previous_visitors
        FROM analytics_events
        WHERE occurred_at >= ?
        GROUP BY traffic_source`).bind(currentWeekStart, previousWeekStart, currentWeekStart, previousWeekStart),
      env.DB.prepare(`
        SELECT
          clicks.occurred_at,
          clicks.marketplace,
          clicks.page_path,
          clicks.product_id,
          inventory.name AS product_name
        FROM (
          SELECT occurred_at, marketplace, page_path, product_id
          FROM analytics_events
          WHERE event_type = 'marketplace_click' AND occurred_at >= ?
          ORDER BY occurred_at DESC
          LIMIT 50
        ) AS clicks
        LEFT JOIN inventory
          ON CAST(inventory.id AS TEXT) = clicks.product_id
        ORDER BY clicks.occurred_at DESC`).bind(selectedCutoff),
      env.DB.prepare(`
        SELECT
          utm_campaign,
          utm_content,
          COUNT(DISTINCT visitor_id) AS visitors,
          SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS page_views,
          SUM(CASE WHEN event_type = 'marketplace_click' THEN 1 ELSE 0 END) AS marketplace_clicks,
          inventory.name AS product_name
        FROM analytics_events
        LEFT JOIN inventory ON CAST(inventory.id AS TEXT) = analytics_events.utm_content
        WHERE occurred_at >= ? AND utm_source = 'facebook' AND utm_campaign <> ''
        GROUP BY utm_campaign, utm_content, inventory.name
        ORDER BY visitors DESC, page_views DESC, marketplace_clicks DESC
        LIMIT 100`).bind(selectedCutoff)
    ]);

    const products = productRows(detailResults[1]?.results || []);
    const entities = aggregateEntities(products);
    const sources = (detailResults[2]?.results || []).map(row => ({
      source: row.traffic_source || "Other",
      visitors: number(row.visitors),
      page_views: number(row.page_views)
    }));
    const sourceTotal = sources.reduce((sum, item) => sum + item.visitors, 0);
    sources.forEach(item => {
      item.percentage = sourceTotal ? round((item.visitors / sourceTotal) * 100, 1) : 0;
    });
    const searches = (detailResults[7]?.results || []).map(row => ({
      query: row.search_query,
      searches: number(row.searches),
      zero_result_searches: number(row.zero_result_searches),
      average_results: number(row.average_results),
      last_searched_at: row.last_searched_at
    }));
    const searchEntities = aggregateSearchEntities(searches, products);
    const marketplaceTotals = Object.fromEntries(
      (detailResults[8]?.results || []).map(row => [row.marketplace || "Other", number(row.clicks)])
    );
    const selectedSummary = windows[range];
    const marketplaceCtr = selectedSummary.product_views
      ? round((selectedSummary.marketplace_clicks / selectedSummary.product_views) * 100, 1)
      : 0;
    const attributedMarketplaceClicks = products.reduce((sum, product) => sum + product.clicks, 0);

    return json({
      generated_at: now.toISOString(),
      range,
      windows,
      current: { ...selectedSummary, marketplace_ctr: marketplaceCtr },
      daily: (detailResults[0]?.results || []).map(row => ({
        day: row.day,
        visitors: number(row.visitors),
        page_views: number(row.page_views),
        marketplace_clicks: number(row.marketplace_clicks),
        searches: number(row.searches)
      })),
      products,
      product_lists: {
        most_viewed: products.filter(item => item.views > 0).slice(0, 10),
        least_viewed: products.filter(item => item.views > 0).slice().sort((a, b) => a.views - b.views || a.name.localeCompare(b.name)).slice(0, 10),
        zero_views: products.filter(item => item.views === 0),
        viewed_no_clicks: products.filter(item => item.views > 0 && item.clicks === 0).sort((a, b) => b.views - a.views),
        highest_ctr: products.filter(item => item.views > 0 && item.clicks > 0).slice().sort((a, b) => b.ctr - a.ctr || b.clicks - a.clicks).slice(0, 10),
        lowest_ctr: products.filter(item => item.views > 0).slice().sort((a, b) => a.ctr - b.ctr || b.views - a.views).slice(0, 10),
        recently_viewed: products.filter(item => item.last_viewed_at).slice().sort((a, b) => b.last_viewed_at.localeCompare(a.last_viewed_at)).slice(0, 10),
        high_views_no_clicks: products.filter(item => item.views > 0 && item.clicks === 0).sort((a, b) => b.views - a.views).slice(0, 10),
        high_clicks_low_inventory: products.filter(item => item.quantity <= 1 && item.clicks > 0).sort((a, b) => b.clicks - a.clicks).slice(0, 10),
        sold_out: products.filter(item => item.quantity <= 0),
        not_viewed_30d: products.filter(item => item.views_30d === 0)
      },
      marketplace: {
        totals: marketplaceTotals,
        ctr: marketplaceCtr,
        attributed_clicks: attributedMarketplaceClicks,
        general_clicks: Math.max(0, selectedSummary.marketplace_clicks - attributedMarketplaceClicks),
        daily: (detailResults[9]?.results || []).map(row => ({
          day: row.day,
          marketplace: row.marketplace || "Other",
          clicks: number(row.clicks)
        })),
        recent_clicks: (detailResults[11]?.results || []).map(row => ({
          occurred_at: row.occurred_at || "",
          marketplace: row.marketplace || "Other",
          page_path: row.page_path || "/",
          product_id: row.product_id || "",
          product_name: row.product_name || ""
        }))
      },
      searches: {
        terms: searches,
        zero_results: searches.filter(item => item.zero_result_searches > 0),
        possible_misspellings: searches.filter(item => item.zero_result_searches > 0).slice(0, 20),
        entities: searchEntities
      },
      sources,
      source_daily: (detailResults[3]?.results || []).map(row => ({
        day: row.day,
        source: row.traffic_source || "Other",
        visitors: number(row.visitors)
      })),
      campaigns: {
        facebook: (detailResults[12]?.results || []).map(row => ({
          campaign: row.utm_campaign || "facebook",
          content: row.utm_content || "",
          product_name: row.product_name || row.utm_content || "Facebook post",
          visitors: number(row.visitors),
          page_views: number(row.page_views),
          marketplace_clicks: number(row.marketplace_clicks)
        }))
      },
      geography: (detailResults[4]?.results || []).map(row => ({
        country: row.country,
        region: row.region,
        visitors: number(row.visitors)
      })),
      devices: (detailResults[5]?.results || []).map(row => ({
        name: row.device_type || "Unknown",
        visitors: number(row.visitors)
      })),
      browsers: (detailResults[6]?.results || []).map(row => ({
        name: row.browser || "Other",
        visitors: number(row.visitors)
      })),
      entities,
      recommendations: generateInsights({
        products,
        entities,
        sources,
        sourceComparison: detailResults[10]?.results || []
      }),
      integrations: {
        ga4_configured: /^G-[A-Z0-9]{6,20}$/.test(String(env.GA4_MEASUREMENT_ID || "G-P42JD6TLP3").trim().toUpperCase()),
        meta_pixel_preserved: true
      },
      privacy: {
        stores_ip_addresses: false,
        visitor_identifiers: "Anonymous browser-generated IDs",
        geography_precision: "Country and US state only when supplied by Cloudflare"
      }
    });
  } catch (error) {
    return json({ error: `Analytics server error: ${error?.message || "Unknown error"}` }, 500);
  }
}
