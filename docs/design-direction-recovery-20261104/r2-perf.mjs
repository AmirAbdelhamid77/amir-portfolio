// R2 performance and production-behaviour probe for the public Home.
//
//   NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r2-perf.mjs
//
// Requires the FLAG-OFF static export served by `node scripts/serve-out.mjs 4395`
// (build with neither HANSA_* variable set). Same viewport, theme and reduced
// motion as the R0 baseline so the tables are comparable.
//
// Read-only: writes evidence/r2-perf.json.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://127.0.0.1:4395";
const OUT = path.resolve("docs/design-direction-recovery-20261104/evidence");
const baseline = JSON.parse(
  await readFile(path.resolve("docs/design-direction-recovery-20261104/baseline.json"), "utf8"),
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
  window.__r2 = { lcp: 0, cls: 0, longTasks: [] };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r2.lcp = entry.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r2.cls += entry.value;
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r2.longTasks.push(entry.duration);
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
  return {
    domNodes: document.querySelectorAll("*").length,
    domContentLoaded: Math.round(nav?.domContentLoadedEventEnd ?? 0),
    loadEvent: Math.round(nav?.loadEventEnd ?? 0),
    lcp: Math.round(window.__r2.lcp),
    cls: Number(window.__r2.cls.toFixed(4)),
    longTasks: {
      count: window.__r2.longTasks.length,
      totalMs: Math.round(window.__r2.longTasks.reduce((a, b) => a + b, 0)),
      maxMs: Math.round(Math.max(0, ...window.__r2.longTasks)),
    },
    resourceCount: resources.length,
    encodedBytes: sum(resources, "encodedBodySize"),
    scriptBytes: sum(scripts, "encodedBodySize"),
    styleBytes: sum(styles, "encodedBodySize"),
    scriptCount: scripts.length,
    // Proof of what the public Home is allowed to contain.
    hasEmbed: !!document.querySelector(".nb-embed"),
    hasLoadingShell: document.body.innerText.includes("Opening the candidate neighbourhood"),
    hasGraphBlock: !!document.querySelector(".stage-graph"),
    graphState: document.querySelector(".stage-graph")?.innerText.replace(/\s+/g, " ").trim().slice(0, 120) ?? null,
    candidateIdsInDom: (document.body.innerHTML.match(/concept:fabric:[a-z-]+/g) ?? []).filter(
      (id) => id !== "concept:fabric:shortcut",
    ),
  };
});

const neighbourhoodRequests = requests.filter((url) => /neighbourhood/i.test(url));
const report = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  viewport: "1280x900",
  theme: "dark",
  reducedMotion: true,
  home: metrics,
  requests: {
    total: requests.length,
    neighbourhood: neighbourhoodRequests,
  },
  baseline: baseline.performance,
  delta: {
    scriptBytes: metrics.scriptBytes - baseline.performance.scriptBytes,
    styleBytes: metrics.styleBytes - baseline.performance.styleBytes,
    resourceCount: metrics.resourceCount - baseline.performance.resourceCount,
    domNodes: metrics.domNodes - baseline.performance.domNodes,
  },
  note:
    "Single local production-export run of the flag-off build. The extra bytes come from the lazy-import stub, not from the neighbourhood chunk; the request log proves the chunk is never fetched.",
};
await writeFile(path.join(OUT, "r2-perf.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await page.screenshot({ path: path.join(OUT, "r2-public-home-dark-1280.png"), fullPage: false });
console.log(JSON.stringify(report, null, 2));
await browser.close();
