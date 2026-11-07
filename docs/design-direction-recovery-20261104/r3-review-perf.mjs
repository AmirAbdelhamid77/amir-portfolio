// R3 review-build probe: what the desktop fan costs when the flag is on.
//
//   NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r3-review-perf.mjs
//
// Requires the FLAG-ON static export (all three HANSA_* variables set) served by
// `node scripts/serve-out.mjs 4395`. Read-only: writes evidence/r3-review-perf.json.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { statSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://127.0.0.1:4395";
const HOME = `${BASE}/?insight=hansa-insight-shortcut-reference-v1#edition`;
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

const fanJsNames = await markerChunks("stage-fan-cables", ".js");
const fanCssNames = await markerChunks("stage-fan-card", ".css");
const publicReport = JSON.parse(
  await readFile(path.join(OUT, "r3-perf.json"), "utf8").catch(() => "null"),
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
  window.__r3 = { lcp: 0, cls: 0, longTasks: [] };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r3.lcp = entry.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r3.cls += entry.value;
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r3.longTasks.push(entry.duration);
  }).observe({ type: "longtask", buffered: true });
});

const requests = [];
page.on("request", (request) => requests.push(request.url()));

// The server-rendered HTML is the honest initial set.
const html = await (await page.request.get(HOME)).text();
const initial = new Set();
for (const match of html.matchAll(/<script[^>]+src="([^"]+)"/g)) initial.add(match[1]);
for (const match of html.matchAll(/href="([^"]+\.css)"/g)) initial.add(match[1]);

await page.goto(HOME, { waitUntil: "networkidle", timeout: 90_000 });
await page.waitForSelector(".stage-fan .stage-fan-card", { timeout: 45_000 });
await page.evaluate(() => document.fonts?.ready);
await page.locator("#today").scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);

const result = await page.evaluate((initialList) => {
  const initialSet = new Set(initialList);
  const resources = performance.getEntriesByType("resource");
  const scripts = resources.filter((entry) => entry.initiatorType === "script");
  const styles = resources.filter(
    (entry) => entry.initiatorType === "link" || entry.initiatorType === "css",
  );
  const sum = (items) => items.reduce((total, entry) => total + (entry.encodedBodySize || 0), 0);
  return {
    htmlBytes: new TextEncoder().encode(document.documentElement.outerHTML).length,
    lcp: Math.round(window.__r3.lcp),
    cls: Number(window.__r3.cls.toFixed(4)),
    longTasks: {
      count: window.__r3.longTasks.length,
      totalMs: Math.round(window.__r3.longTasks.reduce((a, b) => a + b, 0)),
      maxMs: Math.round(Math.max(0, ...window.__r3.longTasks)),
    },
    resourceCount: resources.length,
    encodedBytes: sum(resources),
    scriptBytes: sum(scripts),
    styleBytes: sum(styles),
    fanCards: document.querySelectorAll(".stage-fan-card").length,
    fanEditionCards: document.querySelectorAll("button.stage-fan-card").length,
    fanVisible: (() => {
      const fan = document.querySelector(".stage-fan");
      return Boolean(fan && getComputedStyle(fan).display !== "none");
    })(),
    stripVisible: (() => {
      const strip = document.querySelector(".stage-timeline");
      return Boolean(strip && getComputedStyle(strip).display !== "none");
    })(),
    cables: document.querySelectorAll(".stage-fan-cable").length,
    activeCables: document.querySelectorAll(".stage-fan-cable.is-active").length,
    rulerTicks: document.querySelectorAll(".stage-fan-tick").length,
    focusLabel: document.querySelector(".stage-fan-focus span")?.textContent?.trim() ?? "",
    status: document.querySelector(".stage-fan-status")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
    fanStyled: (() => {
      const fan = document.querySelector(".stage-fan");
      return Boolean(fan && getComputedStyle(fan).position === "relative");
    })(),
    cardStyled: (() => {
      const card = document.querySelector(".stage-fan-card");
      return Boolean(card && getComputedStyle(card).position === "absolute");
    })(),
  };
}, [...initial]);

const requested = new Set(requests.map((url) => path.basename(new URL(url).pathname)));
const fanRequests = [...requested].filter(
  (name) => fanJsNames.has(name) || fanCssNames.has(name),
);
const fanChunkBytes = {
  js: [...fanJsNames].map((name) => statSync(path.join(CHUNKS, name)).size),
  css: [...fanCssNames].map((name) => statSync(path.join(CHUNKS, name)).size),
};

const report = {
  generatedAt: new Date().toISOString(),
  url: HOME,
  viewport: "1280x900",
  theme: "dark",
  reducedMotion: true,
  ...result,
  emittedFanChunks: { js: [...fanJsNames], css: [...fanCssNames] },
  fanChunkBytes,
  fanRequests,
  comparedWithPublic: publicReport
    ? {
        scriptBytes: result.scriptBytes - publicReport.home.scriptBytes,
        styleBytes: result.styleBytes - publicReport.home.styleBytes,
        resourceCount: result.resourceCount - publicReport.home.resourceCount,
      }
    : null,
  note:
    "Single local run of the review export (HANSA_ATLAS_REVIEW_PREVIEW=1, HANSA_NEIGHBOURHOOD_REVIEW=1, HANSA_TIMELINE_REVIEW=1) in Edge headless with reduced motion. The fan is SSR-rendered and its hashed CSS/JS chunks load with the page; the flag-off Home never requests them. Axe and keyboard behaviour are recorded in r3-report.json.",
};
await writeFile(path.join(OUT, "r3-review-perf.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
await browser.close();
