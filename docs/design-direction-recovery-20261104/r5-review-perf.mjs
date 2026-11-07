// R5 review-build probe: what the closing scene costs when the flags are on.
//
//   NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r5-review-perf.mjs
//
// Requires the FIVE-FLAG review export served by `node scripts/serve-out.mjs 4395`
// (`HANSA_ATLAS_REVIEW_PREVIEW=1 HANSA_NEIGHBOURHOOD_REVIEW=1
// HANSA_TIMELINE_REVIEW=1 HANSA_DEALER_REVIEW=1 HANSA_CLOSING_REVIEW=1`).
//
// Entered at `/` like the other probes, so the byte table compares with
// r4-review-perf.json. The closing scene is server-rendered content with no
// dynamic chunk and no entrance animation, so the only cost to measure is the
// initial page plus the DOM the scene adds.
//
// Read-only: writes evidence/r5-review-perf.json.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://127.0.0.1:4395";
const OUT = path.resolve("docs/design-direction-recovery-20261104/evidence");
// The public run enters the same URL with the same settings, so the difference
// between the two files is what the review build costs. R4's review probe used
// an insight URL (`/?insight=…#today`), so its numbers are quoted as context
// and never subtracted.
const publicRun = JSON.parse(
  await readFile(path.resolve("docs/design-direction-recovery-20261104/evidence/r5-perf.json"), "utf8"),
);
const r4Review = JSON.parse(
  await readFile(path.resolve("docs/design-direction-recovery-20261104/evidence/r4-review-perf.json"), "utf8"),
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
  window.__r5r = { lcp: 0, cls: 0, longTasks: [] };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r5r.lcp = entry.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r5r.cls += entry.value;
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r5r.longTasks.push(entry.duration);
  }).observe({ type: "longtask", buffered: true });
});

await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(1500);

const metrics = await page.evaluate(() => {
  const nav = performance.getEntriesByType("navigation")[0];
  const resources = performance.getEntriesByType("resource");
  const sum = (items, key) => items.reduce((total, item) => total + (item[key] || 0), 0);
  const scripts = resources.filter((item) => item.initiatorType === "script");
  const styles = resources.filter((item) => item.initiatorType === "link" || item.initiatorType === "css");
  const text = (selector) =>
    document.querySelector(selector)?.textContent?.replace(/\s+/g, " ").trim() ?? "";
  const closing = document.getElementById("closing");
  return {
    domNodes: document.querySelectorAll("*").length,
    domContentLoaded: Math.round(nav?.domContentLoadedEventEnd ?? 0),
    loadEvent: Math.round(nav?.loadEventEnd ?? 0),
    lcp: Math.round(window.__r5r.lcp),
    cls: Number(window.__r5r.cls.toFixed(4)),
    longTasks: {
      count: window.__r5r.longTasks.length,
      totalMs: Math.round(window.__r5r.longTasks.reduce((a, b) => a + b, 0)),
      maxMs: Math.round(Math.max(0, ...window.__r5r.longTasks)),
    },
    resourceCount: resources.length,
    encodedBytes: sum(resources, "encodedBodySize"),
    scriptBytes: sum(scripts, "encodedBodySize"),
    styleBytes: sum(styles, "encodedBodySize"),
    scriptCount: scripts.length,
    closingNodes: closing?.querySelectorAll("*").length ?? 0,
    closingHeight: Math.round(closing?.getBoundingClientRect().height ?? 0),
    reviewClose: {
      layout: document.querySelectorAll(".stage-close-layout").length,
      ledgerRows: document.querySelectorAll(".stage-close-ledger-list > div").length,
      claims: document.querySelectorAll(".stage-close-claims li").length,
      destinations: document.querySelectorAll(".stage-close-destinations .stage-destination").length,
      keptList: Boolean(document.querySelector(".stage-close-kept")),
      details: Boolean(document.querySelector(".stage-close-details")),
      reopen: text(".stage-close-actions .stage-primary-action"),
      quote: text(".stage-close-quote").slice(0, 60),
      minimum: (() => {
        const targets = [...document.querySelectorAll("#closing a, #closing button")];
        return Math.min(...targets.map((node) => Math.round(node.getBoundingClientRect().height)));
      })(),
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    },
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  entry: "/",
  viewport: "1280x900",
  theme: "dark",
  reducedMotion: true,
  flags: [
    "HANSA_ATLAS_REVIEW_PREVIEW=1",
    "HANSA_NEIGHBOURHOOD_REVIEW=1",
    "HANSA_TIMELINE_REVIEW=1",
    "HANSA_DEALER_REVIEW=1",
    "HANSA_CLOSING_REVIEW=1",
  ],
  home: metrics,
  publicRun: {
    domNodes: publicRun.home.domNodes,
    resourceCount: publicRun.home.resourceCount,
    scriptBytes: publicRun.home.scriptBytes,
    styleBytes: publicRun.home.styleBytes,
    lcp: publicRun.home.lcp,
  },
  r4ReviewBeforeOpen: {
    url: r4Review.url,
    resourceCount: r4Review.beforeOpen.resourceCount,
    scriptBytes: r4Review.beforeOpen.scriptBytes,
    styleBytes: r4Review.beforeOpen.styleBytes,
    lcp: r4Review.beforeOpen.lcp,
    cls: r4Review.beforeOpen.cls,
  },
  delta: {
    domNodes: metrics.domNodes - publicRun.home.domNodes,
    resourceCount: metrics.resourceCount - publicRun.home.resourceCount,
    scriptBytes: metrics.scriptBytes - publicRun.home.scriptBytes,
    styleBytes: metrics.styleBytes - publicRun.home.styleBytes,
  },
  note:
    "Single local production-export run of the five-flag review build, entered at `/`. The review close is server-rendered: no dynamic chunk is fetched, nothing animates on entry, and no interaction is needed to read it. The cost is the markup the scene adds (seven ledger rows, four kept-card slots, four claims, the destinations) and the CSS already counted in r5-perf.json.",
};
await writeFile(path.join(OUT, "r5-review-perf.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
await browser.close();
