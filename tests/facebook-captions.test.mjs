import assert from "node:assert/strict";
import captionTools from "../facebook-caption.js";

const {
  facebookPostHashtags,
  generateFacebookCaption,
  productPageLink
} = captionTools;

const yamal = {
  id: "club-barcelona-yamal-home-2526",
  name: "Lamine Yamal #10 | Barcelona 26/27 Home Kit",
  category: "club",
  sizes: { M: 2 },
  links: {
    ebay: "https://www.ebay.com/itm/yamal",
    depop: "https://www.depop.com/products/yamal"
  }
};
const unitedRetro = {
  id: "retro-united-ronaldo-away-0708",
  name: "Cristiano Ronaldo #7 | 2007/08 Manchester United Away Short Sleeve",
  category: "retro",
  sizes: { L: 1 },
  links: { ebay: "https://www.ebay.com/itm/ronaldo" }
};
const argentina = {
  id: "world-argentina-messi-home",
  name: "Lionel Messi #10 | Argentina 2026 World Cup Home",
  category: "world",
  sizes: { S: 1, M: 1 },
  links: { depop: "https://www.depop.com/products/messi" }
};

function hashtagsFrom(caption) {
  return caption.match(/#[A-Za-z0-9]+/g) || [];
}

const newArrival = generateFacebookCaption([yamal], {
  campaign: "new_arrivals",
  variation: 0
});
assert.match(newArrival, /^(?:New arrival 🔥|Just added 👀|Fresh into the drop ⚽)/);
assert.match(newArrival, /Lamine Yamal #10 Barcelona 26\/27 Home Kit is now available in Medium\./);
assert.match(newArrival, /which|what do you think|favorite/i);
assert.match(newArrival, /Available through eBay and Depop\./);
assert.doesNotMatch(newArrival, /eBay:\s*https|Depop:\s*https/);
assert.match(newArrival, /DM @jerseysfrmjb with questions or jersey requests\./);

const expectedYamalLink = "https://jerseysfrmjb.com/products/club-barcelona-yamal-home-2526?utm_source=facebook&utm_medium=organic_social&utm_campaign=new_arrivals&utm_content=club-barcelona-yamal-home-2526";
assert.equal(productPageLink(yamal, "new_arrivals"), expectedYamalLink);
assert.match(newArrival, new RegExp(expectedYamalLink.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

const newTags = hashtagsFrom(newArrival);
assert.ok(newTags.length >= 8 && newTags.length <= 14, "single post uses 8–14 relevant hashtags");
for (const required of ["#JerseysFrmJB", "#FootballJerseys", "#SoccerJerseys", "#Futbol", "#NewArrival"]) {
  assert.ok(newTags.includes(required), `new-arrival caption includes ${required}`);
}
for (const relevant of ["#LamineYamal", "#FCBarcelona", "#BarcelonaJersey", "#LaLiga", "#ChampionsLeague", "#UCL"]) {
  assert.ok(newTags.includes(relevant), `Barcelona caption includes ${relevant}`);
}
assert.ok(!newTags.includes("#PremierLeague"), "Barcelona caption excludes irrelevant Premier League tag");
assert.equal(new Set(newTags.map(tag => tag.toLowerCase())).size, newTags.length, "hashtags are unique");

const restock = generateFacebookCaption([unitedRetro], {
  campaign: "restock",
  variation: 1
});
assert.match(restock, /^(?:Back in stock 🔁|Restock alert 🚨|You asked—we restocked it 🔥)/);
assert.match(restock, /#Restock/);
assert.match(restock, /#PremierLeague/);
assert.match(restock, /#RetroJerseys/);
assert.doesNotMatch(restock, /#LaLiga|#Ligue1|#WorldCup2026/);
assert.doesNotMatch(restock, /#NewArrival/);

const multiPost = generateFacebookCaption([yamal, argentina, unitedRetro], {
  campaign: "featured_jerseys",
  variation: 2
});
assert.match(multiPost, /^(?:Featured picks for the week ⭐|A few standout shirts available now 👀|Current favorites from the shop 🔥)/);
assert.match(multiPost, /1\. Lamine Yamal/);
assert.match(multiPost, /2\. Lionel Messi/);
assert.match(multiPost, /3\. Cristiano Ronaldo/);
assert.match(multiPost, /Which|What is|which one/i);
assert.match(multiPost, /https:\/\/jerseysfrmjb\.com\/shop-all\?utm_source=facebook/);
for (const product of [yamal, argentina, unitedRetro]) {
  assert.ok(multiPost.includes(productPageLink(product, "featured_jerseys")), `multi-product caption includes tracked link for ${product.id}`);
}
assert.ok(multiPost.length < 2000, "multi-product caption remains readable");

const worldTags = facebookPostHashtags([argentina], "general_inventory");
assert.ok(worldTags.includes("#WorldCup2026"));
assert.ok(!worldTags.includes("#LaLiga"));
assert.ok(!worldTags.includes("#PremierLeague"));
assert.equal(new Set(worldTags.map(tag => tag.toLowerCase())).size, worldTags.length);
assert.ok(worldTags.length <= 14);

const rotated = [0, 1, 2].map(variation => generateFacebookCaption([yamal], {
  campaign: "new_arrivals",
  variation
}));
assert.equal(new Set(rotated).size, 3, "campaign templates rotate without changing tracking");
for (const caption of rotated) assert.ok(caption.includes(expectedYamalLink));

console.log("Facebook caption tests passed:");
console.log("- single new-arrival and restock captions sound natural and retain exact tracked links");
console.log("- multi-product posts stay readable and include one tracked drop link plus product links");
console.log("- campaign, player, team, league, competition, season, and retro tags are relevant and deduplicated");
console.log("- rotating campaign templates preserve marketplace and publishing-ready content");
