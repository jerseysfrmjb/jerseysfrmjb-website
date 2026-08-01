(function attachFacebookCaptionTools(globalScope) {
  const SITE_ORIGIN = "https://jerseysfrmjb.com";
  const MAX_HASHTAGS = 14;
  const REQUIRED_HASHTAGS = ["#JerseysFrmJB", "#FootballJerseys", "#SoccerJerseys", "#Futbol"];
  const CAMPAIGNS = {
    new_arrivals: {
      tag: "#NewArrival",
      singleHooks: ["New arrival 🔥", "Just added 👀", "Fresh into the drop ⚽"],
      multiHooks: ["New jerseys just landed 🔥", "Fresh drop now available 👀", "A few new shirts just hit the shop ⚽"],
      opinions: [
        "One of the sharpest shirts from the latest drop—which player would you want to see next?",
        "The details on this one are even better up close—what do you think?",
        "This one stands out right away—which new-season kit is your favorite?"
      ],
      multiQuestions: [
        "Which jersey are you choosing from this drop?",
        "If you could pick one, which shirt would it be?",
        "Who has the best kit in this group?"
      ]
    },
    restock: {
      tag: "#Restock",
      singleHooks: ["Back in stock 🔁", "Restock alert 🚨", "You asked—we restocked it 🔥"],
      multiHooks: ["Restock just landed 🔁", "A few favorites are back 🚨", "You asked, so these jerseys are back 🔥"],
      opinions: [
        "This one moved quickly last time—who was waiting for it to return?",
        "A fan favorite is available again—would you add it to your rotation?",
        "It did not stay around long before—who is grabbing it this time?"
      ],
      multiQuestions: [
        "Which restock were you waiting for?",
        "Which one should we make sure stays in rotation?",
        "Who is claiming one before these go again?"
      ]
    },
    featured_jerseys: {
      tag: "#FeaturedJersey",
      singleHooks: ["Featured jersey ⭐", "One of the cleanest kits available right now.", "Today’s standout pick 👀"],
      multiHooks: ["Featured picks for the week ⭐", "A few standout shirts available now 👀", "Current favorites from the shop 🔥"],
      opinions: [
        "The details on this one stand out—would you wear it?",
        "This is the kind of shirt that looks even better in person—rate it out of 10.",
        "An easy standout for any collection—which player comes to mind when you see it?"
      ],
      multiQuestions: [
        "Which featured jersey gets your vote?",
        "What is the strongest shirt in this lineup?",
        "Which one would you wear first?"
      ]
    },
    general_inventory: {
      tag: "#JerseyDrop",
      singleHooks: ["Available now ⚽", "Current shop pick 👀", "Jersey spotlight 🔥"],
      multiHooks: ["A few jerseys available now ⚽", "Current shop lineup 👀", "Jersey selection of the day 🔥"],
      opinions: [
        "An easy shirt to build a match-day fit around—what do you think?",
        "A solid pickup for any football-shirt rotation—would you wear it?",
        "This one deserves a closer look—which kit should we feature next?"
      ],
      multiQuestions: [
        "Which jersey would you choose?",
        "What is your first pick from this lineup?",
        "Which team or player should be in the next post?"
      ]
    }
  };
  const TEAM_RULES = [
    { pattern: /\b(?:fc\s*)?barcelona\b/i, tag: "#FCBarcelona", jerseyTag: "#BarcelonaJersey", league: "#LaLiga", ucl: true },
    { pattern: /\breal madrid\b/i, tag: "#RealMadrid", jerseyTag: "#RealMadridJersey", league: "#LaLiga", ucl: true },
    { pattern: /\batletico madrid\b/i, tag: "#AtleticoMadrid", jerseyTag: "#AtleticoMadridJersey", league: "#LaLiga", ucl: true },
    { pattern: /\bmanchester united\b/i, tag: "#ManchesterUnited", jerseyTag: "#ManchesterUnitedJersey", league: "#PremierLeague" },
    { pattern: /\bmanchester city\b/i, tag: "#ManchesterCity", jerseyTag: "#ManchesterCityJersey", league: "#PremierLeague", ucl: true },
    { pattern: /\bliverpool\b/i, tag: "#LiverpoolFC", jerseyTag: "#LiverpoolJersey", league: "#PremierLeague", ucl: true },
    { pattern: /\barsenal\b/i, tag: "#Arsenal", jerseyTag: "#ArsenalJersey", league: "#PremierLeague", ucl: true },
    { pattern: /\bchelsea\b/i, tag: "#ChelseaFC", jerseyTag: "#ChelseaJersey", league: "#PremierLeague" },
    { pattern: /\btottenham\b/i, tag: "#Tottenham", jerseyTag: "#TottenhamJersey", league: "#PremierLeague" },
    { pattern: /\b(?:ac\s*)?milan\b/i, tag: "#ACMilan", jerseyTag: "#ACMilanJersey", league: "#SerieA" },
    { pattern: /\binter(?: milan)?\b/i, tag: "#InterMilan", jerseyTag: "#InterMilanJersey", league: "#SerieA", ucl: true },
    { pattern: /\bjuventus\b/i, tag: "#Juventus", jerseyTag: "#JuventusJersey", league: "#SerieA" },
    { pattern: /\bnapoli\b/i, tag: "#Napoli", jerseyTag: "#NapoliJersey", league: "#SerieA" },
    { pattern: /\b(?:paris saint[- ]germain|psg)\b/i, tag: "#PSG", jerseyTag: "#PSGJersey", league: "#Ligue1", ucl: true },
    { pattern: /\bmarseille\b/i, tag: "#Marseille", jerseyTag: "#MarseilleJersey", league: "#Ligue1" },
    { pattern: /\b(?:fc\s*)?bayern munich\b/i, tag: "#BayernMunich", jerseyTag: "#BayernJersey", league: "#Bundesliga", ucl: true },
    { pattern: /\bborussia dortmund\b/i, tag: "#BVB", jerseyTag: "#DortmundJersey", league: "#Bundesliga", ucl: true },
    { pattern: /\bbayer leverkusen\b/i, tag: "#BayerLeverkusen", jerseyTag: "#LeverkusenJersey", league: "#Bundesliga" }
  ];

  function normalizeCampaign(value = "") {
    return Object.prototype.hasOwnProperty.call(CAMPAIGNS, value) ? value : "general_inventory";
  }

  function hashSeed(value = "") {
    return [...String(value)].reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 7);
  }

  function choose(items, seed, variation = 0, offset = 0) {
    return items[(seed + Math.max(0, Number(variation) || 0) + offset) % items.length];
  }

  function hashtag(value = "") {
    const token = String(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/gi, "");
    return token ? `#${token}` : "";
  }

  function uniqueHashtags(values = []) {
    const seen = new Set();
    const tags = [];
    for (const value of values) {
      const tag = String(value || "").trim();
      const key = tag.toLowerCase();
      if (!tag || seen.has(key) || tags.length >= MAX_HASHTAGS) continue;
      seen.add(key);
      tags.push(tag);
    }
    return tags;
  }

  function productMetadata(product = {}) {
    const name = String(product.name || "Jersey").trim();
    const [playerSide = "", descriptorSide = ""] = name.split("|").map(part => part.trim());
    const player = playerSide.replace(/\s*#\d+.*$/i, "").trim();
    const season = descriptorSide.match(/\b(?:(?:19|20)?\d{2})(?:\/\d{2,4})?\b/i)?.[0] || "";
    const teamRule = TEAM_RULES.find(rule => rule.pattern.test(descriptorSide));
    const category = String(product.category || "").toLowerCase();
    const isWorldCup = /world cup/i.test(name) || category === "world";
    const isRetro = category === "retro" || /\bretro\b/i.test(name) || /\b(?:19|20)\d{2}\/\d{2,4}\b/.test(name);
    const explicitUcl = /champions league|\bucl\b/i.test(name);
    const currentClubUcl = category === "club" && teamRule?.ucl && /\b(?:25\/26|26\/27|2025|2026)\b/.test(name);
    return {
      name,
      displayName: name.replace(/\s*\|\s*/, " "),
      player,
      season,
      category,
      teamRule,
      isWorldCup,
      isRetro,
      includeUcl: explicitUcl || currentClubUcl
    };
  }

  function facebookAvailableSizes(product = {}) {
    const sizeNames = { S: "Small", M: "Medium", L: "Large", XL: "Extra Large", "2XL": "2XL", "3XL": "3XL", "4XL": "4XL" };
    const sizes = Object.entries(product.sizes || {})
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([size]) => sizeNames[size] || size);
    if (sizes.length) return sizes;
    return String(product.size || "")
      .split(/\s*(?:,|&|and)\s*/i)
      .map(size => size.trim())
      .filter(Boolean);
  }

  function productPageLink(product = {}, campaign = "general_inventory", siteOrigin = SITE_ORIGIN) {
    const url = new URL(`/products/${encodeURIComponent(String(product.id || ""))}`, siteOrigin);
    url.searchParams.set("utm_source", "facebook");
    url.searchParams.set("utm_medium", "organic_social");
    url.searchParams.set("utm_campaign", normalizeCampaign(campaign));
    url.searchParams.set("utm_content", String(product.id || ""));
    return url.toString();
  }

  function mainShopLink(products = [], campaign = "general_inventory", siteOrigin = SITE_ORIGIN) {
    const url = new URL("/shop-all", siteOrigin);
    url.searchParams.set("utm_source", "facebook");
    url.searchParams.set("utm_medium", "organic_social");
    url.searchParams.set("utm_campaign", normalizeCampaign(campaign));
    url.searchParams.set("utm_content", `drop_${products.map(product => product.id).join("_")}`.slice(0, 120));
    return url.toString();
  }

  function marketplaceNames(product = {}) {
    const links = product.links && typeof product.links === "object" ? product.links : {};
    const available = [];
    for (const [label, value] of [["eBay", links.ebay], ["Depop", links.depop]]) {
      try {
        if (new URL(String(value || "")).protocol === "https:") available.push(label);
      } catch {
        // Missing marketplace listings are simply omitted from the caption.
      }
    }
    return available;
  }

  function marketplaceSentence(products = []) {
    const marketplaces = [...new Set(products.flatMap(marketplaceNames))];
    if (marketplaces.length === 2) return "Available through eBay and Depop.";
    if (marketplaces.length === 1) return `Available through ${marketplaces[0]}.`;
    return "Open the product page for current availability.";
  }

  function facebookPostHashtags(products = [], campaign = "general_inventory") {
    const normalizedCampaign = normalizeCampaign(campaign);
    const optional = [];
    for (const product of products) {
      const metadata = productMetadata(product);
      optional.push(hashtag(metadata.player));
      if (metadata.teamRule) {
        optional.push(metadata.teamRule.tag, metadata.teamRule.jerseyTag, metadata.teamRule.league);
      } else {
        const teamText = String(metadata.name.split("|")[1] || "")
          .replace(/\b(?:(?:19|20)?\d{2})(?:\/\d{2,4})?\b/g, " ")
          .replace(/\b(?:World Cup|Home|Away|Third|Goalkeeper|Long Sleeve|Short Sleeve|Player Version|Fan Version|Jersey|Kit)\b/gi, " ")
          .replace(/\s+/g, " ")
          .trim();
        optional.push(hashtag(teamText), hashtag(teamText ? `${teamText} Jersey` : ""));
      }
      if (metadata.isWorldCup) optional.push(metadata.season.includes("2026") ? "#WorldCup2026" : "#WorldCup");
      if (metadata.isRetro) optional.push("#RetroJerseys");
      if (metadata.includeUcl) optional.push("#ChampionsLeague", "#UCL");
      if (metadata.season) optional.push(hashtag(`Season ${metadata.season}`));
    }
    return uniqueHashtags([
      ...REQUIRED_HASHTAGS,
      CAMPAIGNS[normalizedCampaign].tag,
      ...optional
    ]);
  }

  function singleProductCaption(product, campaign, variation, siteOrigin) {
    const config = CAMPAIGNS[campaign];
    const metadata = productMetadata(product);
    const seed = hashSeed(`${campaign}:${product.id}:${metadata.name}`);
    const sizes = facebookAvailableSizes(product);
    const sizeText = sizes.length ? sizes.join(", ") : "currently listed sizes";
    return [
      choose(config.singleHooks, seed, variation),
      "",
      `${metadata.displayName} is now available in ${sizeText}.`,
      "",
      choose(config.opinions, seed, variation, 1),
      "",
      "View it here:",
      productPageLink(product, campaign, siteOrigin),
      "",
      marketplaceSentence([product]),
      "DM @jerseysfrmjb with questions or jersey requests.",
      "",
      facebookPostHashtags([product], campaign).join(" ")
    ].join("\n");
  }

  function multiProductCaption(products, campaign, variation, siteOrigin) {
    const config = CAMPAIGNS[campaign];
    const seed = hashSeed(`${campaign}:${products.map(product => product.id).join(":")}`);
    const productLines = products.map((product, index) => {
      const sizes = facebookAvailableSizes(product);
      return `${index + 1}. ${productMetadata(product).displayName} — ${sizes.length ? sizes.join(", ") : "See available sizes"}`;
    });
    const baseLines = [
      choose(config.multiHooks, seed, variation),
      "",
      ...productLines,
      "",
      choose(config.multiQuestions, seed, variation, 1),
      "",
      "Browse the drop:",
      mainShopLink(products, campaign, siteOrigin)
    ];
    const exactLinks = [
      "",
      "Exact jersey links:",
      ...products.map((product, index) => `${index + 1}. ${productPageLink(product, campaign, siteOrigin)}`)
    ];
    const ending = [
      "",
      marketplaceSentence(products),
      "DM @jerseysfrmjb with questions or jersey requests.",
      "",
      facebookPostHashtags(products, campaign).join(" ")
    ];
    const withExactLinks = [...baseLines, ...exactLinks, ...ending].join("\n");
    return withExactLinks.length <= 1900
      ? withExactLinks
      : [...baseLines, ...ending].join("\n");
  }

  function generateFacebookCaption(products = [], options = {}) {
    const selected = Array.isArray(products) ? products.filter(Boolean).slice(0, 5) : [];
    if (!selected.length) return "";
    const campaign = normalizeCampaign(options.campaign);
    const variation = Math.max(0, Number(options.variation) || 0);
    const siteOrigin = options.siteOrigin || SITE_ORIGIN;
    return selected.length === 1
      ? singleProductCaption(selected[0], campaign, variation, siteOrigin)
      : multiProductCaption(selected, campaign, variation, siteOrigin);
  }

  const tools = {
    facebookPostHashtags,
    generateFacebookCaption,
    mainShopLink,
    normalizeCampaign,
    productMetadata,
    productPageLink
  };

  globalScope.JBFacebookCaptions = tools;
  if (typeof module !== "undefined" && module.exports) module.exports = tools;
}(typeof globalThis !== "undefined" ? globalThis : this));
