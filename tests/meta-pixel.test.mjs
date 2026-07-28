import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pixelSource = await readFile(path.join(workspace, "meta-pixel.js"), "utf8");
const storefrontSource = await readFile(path.join(workspace, "storefront.js"), "utf8");
const headers = await readFile(path.join(workspace, "_headers"), "utf8");
const publicPages = [
  "index.html",
  "shop-all.html",
  "club-jerseys.html",
  "worldcup-jerseys.html",
  "retro-jerseys.html",
  "size-guide.html",
  "privacy.html"
];

for (const page of publicPages) {
  const html = await readFile(path.join(workspace, page), "utf8");
  assert.equal(
    (html.match(/meta-pixel\.js/g) || []).length,
    1,
    `${page} loads the Meta Pixel once`
  );
  assert.match(html, /meta-pixel\.js[^>]*defer/);
}

const adminHtml = await readFile(path.join(workspace, "admin.html"), "utf8");
const adminJs = await readFile(path.join(workspace, "admin.js"), "utf8");
assert.doesNotMatch(adminHtml, /meta-pixel|1059066979981582|fbq\(/);
assert.doesNotMatch(adminJs, /meta-pixel|1059066979981582|fbq\(/);

assert.match(pixelSource, /1059066979981582/);
assert.match(pixelSource, /connect\.facebook\.net\/en_US\/fbevents\.js/);
assert.match(pixelSource, /window\.fbq\("track", "PageView"\)/);
assert.match(pixelSource, /window\.fbq\("track", "ViewContent"/);
assert.match(pixelSource, /window\.fbq\("trackCustom", "MarketplaceOutboundClick"/);
assert.match(pixelSource, /__jerseysMetaPixelInitialized/);
assert.match(storefrontSource, /data-meta-product="true"/);
assert.match(storefrontSource, /JerseysMetaPixel\?\.observeProducts\(grid\)/);
assert.match(storefrontSource, /JerseysMetaPixel\?\.trackProductView\(card\)/);
assert.match(headers, /\/meta-pixel\.js\s+Cache-Control: no-store/);

const csp = headers.match(/Content-Security-Policy:\s*([^\r\n]+)/i)?.[1] || "";
if (csp) {
  assert.match(csp, /connect\.facebook\.net/);
  assert.match(csp, /facebook\.com/);
}

const insertedScripts = [];
const clickListeners = [];
const document = {
  createElement(tagName) {
    return { tagName, async: false, src: "" };
  },
  getElementsByTagName() {
    return [{
      parentNode: {
        insertBefore(node) {
          insertedScripts.push(node);
        }
      }
    }];
  },
  addEventListener(type, listener) {
    if (type === "click") clickListeners.push(listener);
  },
  querySelectorAll() {
    return [];
  }
};
const window = {
  location: { href: "https://jerseysfrmjb.com/shop-all.html" },
  IntersectionObserver: class {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
  }
};
const context = vm.createContext({
  document,
  window,
  URL,
  Set,
  Object,
  Number,
  String
});

new vm.Script(pixelSource).runInContext(context);
assert.equal(insertedScripts.length, 1, "official Meta library is loaded once");
assert.equal(insertedScripts[0].async, true, "official Meta library loads asynchronously");
assert.equal(insertedScripts[0].src, "https://connect.facebook.net/en_US/fbevents.js");
assert.deepEqual(
  Array.from(window.fbq.queue, args => Array.from(args).slice(0, 2)),
  [["init", "1059066979981582"], ["track", "PageView"]]
);
assert.equal(clickListeners.length, 1, "one delegated marketplace click listener is installed");

new vm.Script(pixelSource).runInContext(context);
assert.equal(insertedScripts.length, 1, "dynamic re-execution does not duplicate the Pixel");
assert.equal(window.fbq.queue.length, 2, "dynamic re-execution does not duplicate PageView");

const productCard = {
  dataset: {
    productId: "club-test-product",
    productName: "Test Jersey",
    productValue: "55.00",
    productCategory: "Club",
    productAvailability: "in stock"
  }
};
window.JerseysMetaPixel.trackProductView(productCard);
window.JerseysMetaPixel.trackProductView(productCard);
const viewContentEvents = window.fbq.queue.filter(args => args[0] === "track" && args[1] === "ViewContent");
assert.equal(viewContentEvents.length, 1, "each jersey ViewContent is tracked once per page");
assert.deepEqual(JSON.parse(JSON.stringify(viewContentEvents[0][2].content_ids)), ["club-test-product"]);
assert.equal(viewContentEvents[0][2].value, 55);
assert.equal(viewContentEvents[0][2].currency, "USD");

const depopLink = {
  href: "https://www.depop.com/products/example?utm_source=site",
  textContent: "Buy on Depop",
  matches() {
    return true;
  },
  closest(selector) {
    return selector === "[data-meta-product]" ? productCard : null;
  }
};
clickListeners[0]({
  target: {
    closest(selector) {
      return selector === "a[href]" ? depopLink : null;
    }
  }
});
const clickEvent = window.fbq.queue.find(args => args[0] === "trackCustom");
assert.ok(clickEvent, "marketplace custom event is queued");
assert.equal(clickEvent[1], "MarketplaceOutboundClick");
assert.equal(clickEvent[2].marketplace, "Depop");
assert.equal(clickEvent[2].destination_url, "https://www.depop.com/products/example");
assert.deepEqual(JSON.parse(JSON.stringify(clickEvent[2].content_ids)), ["club-test-product"]);

console.log("Meta Pixel tests passed:");
console.log("- every public page loads one shared Pixel; admin loads none");
console.log("- official asynchronous loader initializes Pixel 1059066979981582");
console.log("- PageView and ViewContent queue correctly without duplicates");
console.log("- marketplace outbound clicks include product context");
console.log("- current _headers configuration does not block Meta");
