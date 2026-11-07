// R4 review-build probe: what the cinematic dealer costs when it is opened.
//
//   NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r4-review-perf.mjs
//
// Requires the FLAG-ON static export (all four HANSA_* variables set) served by
// `node scripts/serve-out.mjs 4395`. Read-only: writes evidence/r4-review-perf.json.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { statSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://127.0.0.1:4395";
const HOME = `${BASE}/?insight=hansa-insight-shortcut-reference-v1#today`;
const OUT = path.resolve("docs/design-direction-recovery-20261104/evidence");
const CHUNKS = path.resolve("out/_next/static/chunks");

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
const publicReport = JSON.parse(
  await readFile(path.join(OUT, "r4-perf.json"), "utf8").catch(() => "null"),
);

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
  window.__r4 = { lcp: 0, cls: 0, longTasks: [], interaction: null };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r4.lcp = entry.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r4.cls += entry.value;
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r4.longTasks.push(entry.duration);
  }).observe({ type: "longtask", buffered: true });
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!window.__r4.interaction) window.__r4.interaction = Math.round(entry.duration);
      }
    }).observe({ type: "event", buffered: true, durationThreshold: 16 });
  } catch {
    /* the event timing API is optional */
  }
});

const requests = [];
page.on("request", (request) => requests.push(request.url()));

const html = await (await page.request.get(HOME)).text();
const initial = new Set();
for (const match of html.matchAll(/<script[^>]+src="([^"]+)"/g)) initial.add(match[1]);
for (const match of html.matchAll(/href="([^"]+\.css)"/g)) initial.add(match[1]);

await page.goto(HOME, { waitUntil: "networkidle", timeout: 90_000 });
await page.waitForSelector(".stage-fan .stage-fan-card", { timeout: 45_000 });
await page.evaluate(() => document.fonts?.ready);
await page.locator("#today").scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);

const before = await page.evaluate((initialList) => {
  const initialSet = new Set(initialList);
  const resources = performance.getEntriesByType("resource");
  const scripts = resources.filter((entry) => entry.initiatorType === "script");
  const styles = resources.filter(
    (entry) => entry.initiatorType === "link" || entry.initiatorType === "css",
  );
  const sum = (items) => items.reduce((total, entry) => total + (entry.encodedBodySize || 0), 0);
  return {
    htmlBytes: new TextEncoder().encode(document.documentElement.outerHTML).length,
    lcp: Math.round(window.__r4.lcp),
    cls: Number(window.__r4.cls.toFixed(4)),
    longTasks: {
      count: window.__r4.longTasks.length,
      totalMs: Math.round(window.__r4.longTasks.reduce((a, b) => a + b, 0)),
      maxMs: Math.round(Math.max(0, ...window.__r4.longTasks)),
    },
    resourceCount: resources.length,
    encodedBytes: sum(resources),
    scriptBytes: sum(scripts),
    styleBytes: sum(styles),
    dialogPresent: Boolean(document.querySelector("#dealer-cinematic")),
    initialRequests: [...initialSet].length,
    mark: performance.now(),
  };
}, [...initial]);

await page.locator("#today .stage-primary-action").first().click();
await page.waitForSelector("#dealer-cinematic", { state: "attached", timeout: 30_000 });
await page.evaluate(() => document.fonts?.ready);
await page.waitForTimeout(700);

const after = await page.evaluate((beforeMark) => {
  const resources = performance.getEntriesByType("resource");
  const scripts = resources.filter((entry) => entry.initiatorType === "script");
  const styles = resources.filter(
    (entry) => entry.initiatorType === "link" || entry.initiatorType === "css",
  );
  const sum = (items) => items.reduce((total, entry) => total + (entry.encodedBodySize || 0), 0);
  const dialog = document.getElementById("dealer-cinematic");
  const late = resources.filter((entry) => entry.startTime >= beforeMark);
  return {
    lcp: Math.round(window.__r4.lcp),
    cls: Number(window.__r4.cls.toFixed(4)),
    longTasks: {
      count: window.__r4.longTasks.length,
      totalMs: Math.round(window.__r4.longTasks.reduce((a, b) => a + b, 0)),
      maxMs: Math.round(Math.max(0, ...window.__r4.longTasks)),
    },
    firstInteraction: window.__r4.interaction,
    resourceCount: resources.length,
    encodedBytes: sum(resources),
    scriptBytes: sum(scripts),
    styleBytes: sum(styles),
    lateResources: late.map((entry) => ({
      name: entry.name.split("/").pop(),
      type: entry.initiatorType,
      bytes: entry.encodedBodySize || 0,
    })),
    dialog: dialog
      ? {
          present: true,
          role: dialog.getAttribute("role"),
          ariaModal: dialog.getAttribute("aria-modal"),
          cards: dialog.querySelectorAll(".dc-card").length,
          railDays: dialog.querySelectorAll(".dc-day").length,
          width: Math.round(dialog.getBoundingClientRect().width),
          height: Math.round(dialog.getBoundingClientRect().height),
          fontLoaded: document.fonts?.status ?? "unknown",
          cardAnimation: getComputedStyle(dialog.querySelector(".dc-card")).animationName,
          backgroundInert: document.querySelectorAll("body > *[inert]").length,
        }
      : { present: false },
  };
}, before.mark);

const requested = new Set(requests.map((url) => path.basename(new URL(url).pathname)));
const dealerRequests = [...requested].filter(
  (name) => dealerJsNames.has(name) || dealerCssNames.has(name),
);
const dealerChunkBytes = {
  js: [...dealerJsNames].map((name) => statSync(path.join(CHUNKS, name)).size),
  css: [...dealerCssNames].map((name) => statSync(path.join(CHUNKS, name)).size),
};

const report = {
  generatedAt: new Date().toISOString(),
  url: HOME,
  viewport: "1280x900",
  theme: "dark",
  reducedMotion: true,
  beforeOpen: before,
  afterOpen: after,
  emittedDealerChunks: { js: [...dealerJsNames], css: [...dealerCssNames] },
  dealerChunkBytes,
  dealerRequests,
  comparedWithPublic: publicReport
    ? {
        scriptBytes: before.scriptBytes - publicReport.home.scriptBytes,
        styleBytes: before.styleBytes - publicReport.home.styleBytes,
        resourceCount: before.resourceCount - publicReport.home.resourceCount,
      }
    : null,
  note:
    "Single local run of the review export (all four flags) in Edge headless with reduced motion. The dealer is a dynamic chunk: the initial page does not request it, opening the edition does. Chunk bytes are on-disk sizes; lateResources is what the open actually fetched.",
};
await writeFile(path.join(OUT, "r4-review-perf.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
await browser.close();
