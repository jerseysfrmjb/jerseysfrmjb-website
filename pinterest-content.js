(function attachPinterestContentTools(globalScope) {
  const SITE_ORIGIN = "https://jerseysfrmjb.com";
  const TEAM_RULES = [
    ["Manchester United", "Premier League Jerseys"],
    ["Manchester City", "Premier League Jerseys"],
    ["Real Madrid", "La Liga Jerseys"],
    ["Barcelona", "La Liga Jerseys"],
    ["Liverpool", "Premier League Jerseys"],
    ["Arsenal", "Premier League Jerseys"],
    ["Chelsea", "Premier League Jerseys"],
    ["Tottenham", "Premier League Jerseys"],
    ["Atletico Madrid", "La Liga Jerseys"],
    ["Argentina", "International Team Jerseys"],
    ["Portugal", "International Team Jerseys"],
    ["England", "International Team Jerseys"],
    ["Spain", "International Team Jerseys"],
    ["France", "International Team Jerseys"],
    ["Germany", "International Team Jerseys"],
    ["Brazil", "International Team Jerseys"],
    ["USA", "International Team Jerseys"],
    ["Mexico", "International Team Jerseys"],
    ["Morocco", "International Team Jerseys"],
    ["Colombia", "International Team Jerseys"],
    ["Norway", "International Team Jerseys"],
    ["Japan", "International Team Jerseys"]
  ];
  const SIZE_LABELS = {
    S: "Small",
    M: "Medium",
    L: "Large",
    XL: "Extra Large",
    "2XL": "2XL",
    "3XL": "3XL",
    "4XL": "4XL"
  };

  function clean(value = "") {
    return String(value).replace(/\s+/g, " ").trim();
  }

  function unique(values = []) {
    const seen = new Set();
    return values.filter(value => {
      const key = clean(value).toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function metadata(product = {}) {
    const name = clean(product.name || "Jersey");
    const category = clean(product.category).toLowerCase();
    const [left = "", right = ""] = name.split("|").map(clean);
    const fullText = `${left} ${right}`.trim();
    const teamRule = TEAM_RULES.find(([team]) => new RegExp(`\\b${team.replace(/\s+/g, "\\s+")}\\b`, "i").test(fullText));
    const team = teamRule?.[0] || "";
    const leagueBoard = teamRule?.[1] || "";
    const season = fullText.match(/\b(?:\d{2,4}\/\d{2,4}|20\d{2})\b/)?.[0] || "";
    const side = fullText.match(/\b(Home|Away|Third|Goalkeeper)\b/i)?.[1] || "";
    const sleeve = /long\s*sleeve/i.test(fullText) ? "Long Sleeve" : /short\s*sleeve/i.test(fullText) ? "Short Sleeve" : "";
    const isWorldCup = category === "world" || /world\s*cup/i.test(fullText);
    const isRetro = category === "retro";
    let player = left || fullText;
    player = clean(player
      .replace(/no name\s*\/\s*no number/gi, "")
      .replace(/#\d+/g, "")
      .replace(/\b(?:\d{2,4}\/\d{2,4}|20\d{2})\b.*$/i, "")
      .replace(new RegExp(team ? `\\b${team.replace(/\s+/g, "\\s+")}\\b.*$` : "$a", "i"), ""));
    const type = isRetro
      ? `${sleeve ? `${sleeve} ` : ""}Retro Jersey`
      : isWorldCup
        ? "World Cup Jersey"
        : `${side ? `${side} ` : ""}Club Jersey`;
    return { name, category, player, team, leagueBoard, season, side, sleeve, isWorldCup, isRetro, type };
  }

  function availableSizes(product = {}) {
    const fromQuantities = Object.entries(product.sizes || {})
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([size]) => SIZE_LABELS[size] || size);
    if (fromQuantities.length) return unique(fromQuantities);
    return unique(clean(product.size).split(/\s*(?:,|&|and)\s*/i).map(size => SIZE_LABELS[size] || size));
  }

  function permanentProductUrl(product = {}, siteOrigin = SITE_ORIGIN) {
    return new URL(`/products/${encodeURIComponent(clean(product.id))}`, siteOrigin).toString();
  }

  function pinTitle(product = {}, variation = 0) {
    const info = metadata(product);
    const identity = unique([info.player, info.team, info.season, info.side, info.sleeve]).join(" ");
    const endings = info.isRetro
      ? ["Retro Football Jersey", "Classic Soccer Jersey", "Retro Jersey"]
      : info.isWorldCup
        ? ["World Cup Soccer Jersey", "International Football Jersey", "World Cup Jersey"]
        : ["Soccer Jersey", "Club Football Jersey", "Football Shirt"];
    const ending = endings[Math.max(0, Number(variation) || 0) % endings.length];
    return `${identity || info.name} | ${ending}`.slice(0, 100);
  }

  function pinDescription(product = {}, variation = 0) {
    const info = metadata(product);
    const sizes = availableSizes(product);
    const subject = unique([info.player, info.team, info.season, info.side, info.sleeve, "jersey"]).join(" ");
    const sizeSentence = sizes.length
      ? `Available sizes include ${sizes.join(", ")}.`
      : "Check the product page for current available sizes.";
    const searchPhrase = info.isRetro
      ? "retro football jersey and classic soccer shirt"
      : info.isWorldCup
        ? "World Cup jersey and international team soccer shirt"
        : `${info.leagueBoard ? info.leagueBoard.replace(/ Jerseys$/i, "") + " " : ""}club football jersey and soccer shirt`;
    const variants = [
      `${subject} available from JerseysFrmJB. ${sizeSentence} View this ${searchPhrase} through the permanent product page.`,
      `Discover the ${subject} at JerseysFrmJB. ${sizeSentence} A strong choice for anyone searching for a ${searchPhrase}. View full jersey details through JerseysFrmJB.`,
      `Add the look of the ${subject} to your football shirt rotation. ${sizeSentence} Browse photos and current marketplace options through JerseysFrmJB.`,
      `JerseysFrmJB features this ${subject} for fans of standout football shirts. ${sizeSentence} View the ${searchPhrase} and its full details through JerseysFrmJB.`
    ];
    return variants[Math.max(0, Number(variation) || 0) % variants.length].slice(0, 800);
  }

  function suggestedBoardNames(product = {}) {
    const info = metadata(product);
    const suggestions = [];
    if (product.new_arrival) suggestions.push("New Arrivals");
    if (/\bbarcelona\b/i.test(info.team)) suggestions.push("Barcelona Jerseys");
    if (/\breal madrid\b/i.test(info.team)) suggestions.push("Real Madrid Jerseys");
    if (info.isWorldCup && /2026/.test(info.season || info.name)) suggestions.push("World Cup 2026 Jerseys");
    if (info.isRetro) suggestions.push("Retro Jerseys");
    if (info.category === "world") suggestions.push("International Team Jerseys");
    if (info.leagueBoard) suggestions.push(info.leagueBoard);
    if (info.category === "club" && !suggestions.length) suggestions.push("New Arrivals");
    return unique(suggestions);
  }

  function generatePinContent(product = {}, variation = 0, siteOrigin = SITE_ORIGIN) {
    return {
      title: pinTitle(product, variation),
      description: pinDescription(product, variation),
      link: permanentProductUrl(product, siteOrigin),
      boardSuggestions: suggestedBoardNames(product),
      variation: Math.max(0, Number(variation) || 0) % 4
    };
  }

  const tools = {
    availableSizes,
    generatePinContent,
    metadata,
    permanentProductUrl,
    pinDescription,
    pinTitle,
    suggestedBoardNames
  };
  globalScope.JBPinterestContent = tools;
  if (typeof module !== "undefined" && module.exports) module.exports = tools;
}(typeof globalThis !== "undefined" ? globalThis : this));
