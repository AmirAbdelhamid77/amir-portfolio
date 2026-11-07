// R3 public-build probe: the flag-off Home must not pay for the fan.
//
//   NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r3-perf.mjs
//
// Requires the FLAG-OFF static export served by `node scripts/serve-out.mjs 4395`
// (build with none of the HANSA_* variables set). Same viewport, theme and
// reduced motion as the R0 baseline and the R2 probe so the tables compare.
//
// Read-only: writes evidence/r3-perf.json.
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

// Hashed chunk names are not stable, so the fan's emitted files are found by
// their own markers. This proves whether the Home requested them.
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
    lcp: Math.round(window.__r3.lcp),
    cls: Number(window.__r3.cls.toFixed(4)),
    longTasks: {
      count: window.__r3.longTasks.length,
      totalMs: Math.round(window.__r3.longTasks.reduce((a, b) => a + b, 0)),
      maxMs: Math.round(Math.max(0, ...window.__r3.longTasks)),
    },
    resourceCount: resources.length,
    encodedBytes: sum(resources, "encodedBodySize"),
    scriptBytes: sum(scripts, "encodedBodySize"),
    styleBytes: sum(styles, "encodedBodySize"),
    scriptCount: scripts.length,
    // Proof of what the public Home is allowed to contain.
    hasFan: document.querySelectorAll(".stage-fan").length,
    hasFanStatus: document.body.innerText.includes("days in the review clock"),
    hasStrip: Boolean(strip),
    stripDays: strip?.querySelectorAll("ol li").length ?? 0,
    editionTicks: strip?.querySelectorAll('ol li[data-has-edition="true"] button').length ?? 0,
    quietDays: strip?.querySelectorAll('ol li[data-has-edition="false"]').length ?? 0,
    ariaCurrent: strip?.querySelectorAll('[aria-current="date"]').length ?? 0,
    sectionNote: document.querySelector(".stage-section-note")?.innerText.replace(/\s+/g, " ").trim() ?? null,
    hasFanLink: [...document.querySelectorAll("link[rel=stylesheet]")].some((link) =>
      /stage-fan/.test(link.getAttribute("href") ?? ""),
    ),
  };
});

const requested = new Set(requests.map((url) => path.basename(new URL(url).pathname)));
const fanRequests = [...requested].filter((name) => fanJsNames.has(name) || fanCssNames.has(name));
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
  emittedFanChunks: { js: [...fanJsNames], css: [...fanCssNames] },
  requests: { total: requests.length, fan: fanRequests },
  baseline: baseline.performance,
  delta,
  note:
    "Single local production-export run of the flag-off build. The fan chunk and its CSS exist on disk (like the R2 slice) but the Home never requests them; the DOM and stylesheet bytes stay at the pre-R3 values.",
};
await writeFile(path.join(OUT, "r3-perf.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await page.screenshot({ path: path.join(OUT, "r3-public-home-dark-1280.png"), fullPage: false });
console.log(JSON.stringify(report, null, 2));
await browser.close();
