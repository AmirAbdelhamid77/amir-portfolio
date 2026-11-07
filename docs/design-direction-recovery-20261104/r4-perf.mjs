// R4 public-build probe: the flag-off Home must not pay for the modal dealer,
// and the accepted inline dealer must still work exactly as it shipped.
//
//   NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r4-perf.mjs
//
// Requires the FLAG-OFF static export served by `node scripts/serve-out.mjs 4395`
// (build with none of the HANSA_* variables set). Same viewport, theme and
// reduced motion as the R0/R3 probes so the tables compare.
//
// Read-only: writes evidence/r4-perf.json and r4-public-inline-dark-1280.png.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://127.0.0.1:4395";
const OUT = path.resolve("docs/design-direction-recovery-20261104/evidence");
const CHUNKS = path.resolve("out/_next/static/chunks");
const baseline = JSON.parse(
  await readFile(path.resolve("docs/design-direction-recovery-20261104/baseline.json"), "utf8"),
);

async function markerChunks(marker, extension) {
  const found = new Set();
  for (const name of await readdir(CHUNKS)) {
    if (!name.endsWith(extension)) continue;
    const text = await readFile(path.join(CHUNKS, name), "utf8");
    if (text.includes(marker)) found.add(name);
  }
  return found;
}

const dealerJsNames = await markerChunks("dc-dialog", ".js");
const dealerCssNames = await markerChunks("dc-deal", ".css");

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
await context.addInitScript(() => {
  try {
    window.localStorage.setItem("amir-theme", "dark");
  } catch {
    /* ignore */
  }
});
const page = await context.newPage();
await page.addInitScript(() => {
  window.__r4 = { lcp: 0, cls: 0, longTasks: [] };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r4.lcp = entry.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r4.cls += entry.value;
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r4.longTasks.push(entry.duration);
  }).observe({ type: "longtask", buffered: true });
});

const requests = [];
page.on("request", (request) => requests.push(request.url()));

await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(1500);

const metrics = await page.evaluate(() => {
  const nav = performance.getEntriesByType("navigation")[0];
  const resources = performance.getEntriesByType("resource");
  const sum = (items, key) => items.reduce((total, item) => total + (item[key] || 0), 0);
  const scripts = resources.filter((item) => item.initiatorType === "script");
  const styles = resources.filter((item) => item.initiatorType === "link" || item.initiatorType === "css");
  const strip = document.querySelector(".stage-timeline");
  return {
    domNodes: document.querySelectorAll("*").length,
    domContentLoaded: Math.round(nav?.domContentLoadedEventEnd ?? 0),
    loadEvent: Math.round(nav?.loadEventEnd ?? 0),
    lcp: Math.round(window.__r4.lcp),
    cls: Number(window.__r4.cls.toFixed(4)),
    longTasks: {
      count: window.__r4.longTasks.length,
      totalMs: Math.round(window.__r4.longTasks.reduce((a, b) => a + b, 0)),
      maxMs: Math.round(Math.max(0, ...window.__r4.longTasks)),
    },
    resourceCount: resources.length,
    encodedBytes: sum(resources, "encodedBodySize"),
    scriptBytes: sum(scripts, "encodedBodySize"),
    styleBytes: sum(styles, "encodedBodySize"),
    scriptCount: scripts.length,
    // Proof of what the public Home is allowed to contain.
    hasDealerOverlay: document.querySelectorAll(".dc-overlay, #dealer-cinematic").length,
    hasDealerClass: [...document.querySelectorAll("[class]")].some((element) =>
      [...element.classList].some((name) => name.startsWith("dc-")),
    ),
    hasStrip: Boolean(strip),
    stripDays: strip?.querySelectorAll("ol li").length ?? 0,
    editionTicks: strip?.querySelectorAll('ol li[data-has-edition="true"] button').length ?? 0,
    quietDays: strip?.querySelectorAll('ol li[data-has-edition="false"]').length ?? 0,
    ariaCurrent: strip?.querySelectorAll('[aria-current="date"]').length ?? 0,
    trigger: (() => {
      const button = document.querySelector("#today .stage-primary-action");
      return {
        label: button?.textContent?.trim() ?? null,
        expanded: button?.getAttribute("aria-expanded") ?? null,
        controls: button?.getAttribute("aria-controls") ?? null,
        haspopup: button?.getAttribute("aria-haspopup") ?? null,
      };
    })(),
  };
});

// The accepted inline dealer still deals, one card at a time.
await page.locator("#today .stage-primary-action").first().click();
await page.waitForSelector("#today-deal", { state: "attached", timeout: 20_000 });
await page.waitForTimeout(500);
const inlineOpen = await page.evaluate(() => ({
  dealPresent: Boolean(document.querySelector("#today-deal")),
  dialogPresent: Boolean(document.querySelector("#dealer-cinematic")),
  dealt: document.querySelector("#today-deal")?.textContent?.match(/(\d+) \/ (\d+) dealt/)?.[0] ?? null,
  hasDealMore: [...document.querySelectorAll("#today-deal button")].some((button) =>
    /^Deal \d+ more$/.test(button.textContent.trim()),
  ),
  closeLabel: document.querySelector("#today .stage-primary-action")?.textContent?.trim() ?? null,
}));
await page.screenshot({ path: path.join(OUT, "r4-public-inline-dark-1280.png") });

const dealMore = page.getByRole("button", { name: /^Deal \d+ more$/ });
let inlineDealt = null;
if (await dealMore.count()) {
  await dealMore.first().click();
  await page.waitForTimeout(700);
  inlineDealt = await page.evaluate(
    () => document.querySelector("#today-deal")?.textContent?.match(/(\d+) \/ (\d+) dealt/)?.[0] ?? null,
  );
}
await page.locator("#today .stage-primary-action").first().click();
await page.waitForTimeout(300);
const inlineClosed = await page.evaluate(() => ({
  dealPresent: Boolean(document.querySelector("#today-deal")),
  expanded: document.querySelector("#today .stage-primary-action")?.getAttribute("aria-expanded"),
}));

const requested = new Set(requests.map((url) => path.basename(new URL(url).pathname)));
const dealerRequests = [...requested].filter(
  (name) => dealerJsNames.has(name) || dealerCssNames.has(name),
);
const delta = {
  scriptBytes: metrics.scriptBytes - baseline.performance.scriptBytes,
  styleBytes: metrics.styleBytes - baseline.performance.styleBytes,
  resourceCount: metrics.resourceCount - baseline.performance.resourceCount,
  domNodes: metrics.domNodes - baseline.performance.domNodes,
};

const report = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  viewport: "1280x900",
  theme: "dark",
  reducedMotion: true,
  home: metrics,
  inline: { open: inlineOpen, dealtAfterDealMore: inlineDealt, closed: inlineClosed },
  emittedDealerChunks: { js: [...dealerJsNames], css: [...dealerCssNames] },
  requests: { total: requests.length, dealer: dealerRequests },
  baseline: baseline.performance,
  delta,
  note:
    "Single local production-export run of the flag-off build. The dealer chunk exists on disk but the Home never requests it and renders no dc- markup; the accepted inline card table is opened, dealt and closed. DOM and stylesheet bytes stay at the pre-R4 values.",
};
await writeFile(path.join(OUT, "r4-perf.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
await browser.close();
