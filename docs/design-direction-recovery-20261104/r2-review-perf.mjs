// R2 review-build probe: what the neighbourhood slice costs when the flag is on.
//
//   NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r2-review-perf.mjs
//
// Requires the FLAG-ON static export (both HANSA_* variables set) served by
// `node scripts/serve-out.mjs 4395`. Read-only: writes evidence/r2-review-perf.json.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://127.0.0.1:4395";
const HOME = `${BASE}/?insight=hansa-insight-shortcut-reference-v1#edition`;
const OUT = path.resolve("docs/design-direction-recovery-20261104/evidence");
const CHUNKS = path.resolve("out/_next/static/chunks");

// Which emitted chunk actually carries the slice. Chunk names are hashed, so
// the marker in the CSS/JS text is the only stable way to identify it.
async function markerChunks() {
  const found = new Set();
  for (const name of await readdir(CHUNKS)) {
    if (!/\.(js|css)$/.test(name)) continue;
    const text = await readFile(path.join(CHUNKS, name), "utf8");
    if (text.includes("nb-embed")) found.add(name);
  }
  return found;
}


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

// The server-rendered HTML is the honest "initial" set: production builds put
// the slices in extra chunks that only appear after hydration.
const html = await (await page.request.get(HOME)).text();
const htmlInitial = new Set();
for (const match of html.matchAll(/<script[^>]+src="([^"]+)"/g)) htmlInitial.add(match[1]);
for (const match of html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)) htmlInitial.add(match[1]);

await page.goto(HOME, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForSelector(".nb-embed .nb-field", { timeout: 45_000 });
await page.waitForTimeout(1200);
await page.locator("#edition").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);

const result = await page.evaluate((initialList) => {
  const initial = new Set(initialList);
  const resources = performance.getEntriesByType("resource");
  const scripts = resources.filter((entry) => entry.initiatorType === "script");
  const styles = resources.filter((entry) => entry.initiatorType === "link" || entry.initiatorType === "css");
  const sum = (items) => items.reduce((total, entry) => total + (entry.encodedBodySize || 0), 0);
  const lazy = resources.filter(
    (entry) => /_next\/static\//.test(entry.name) && !initial.has(new URL(entry.name).pathname),
  );
  return {
    lazy: lazy.map((entry) => ({
      name: new URL(entry.name).pathname,
      type: entry.initiatorType,
      bytes: entry.encodedBodySize,
      transferBytes: entry.transferSize,
    })),
    lazyBytes: sum(lazy),
    allScriptBytes: sum(scripts),
    scriptCount: scripts.length,
    allStyleBytes: sum(styles),
    styleCount: styles.length,
    centre: document.querySelector(".nb-embed .nb-centre-title")?.textContent?.trim() ?? null,
    branches: document.querySelectorAll(".nb-embed .nb-branch").length,
    lcp: Math.round(window.__r2.lcp),
    cls: Number(window.__r2.cls.toFixed(4)),
    longTasks: {
      count: window.__r2.longTasks.length,
      totalMs: Math.round(window.__r2.longTasks.reduce((a, b) => a + b, 0)),
      maxMs: Math.round(Math.max(0, ...window.__r2.longTasks)),
    },
  };
}, [...htmlInitial]);

const sliceNames = await markerChunks();
const slice = result.lazy.filter((entry) => sliceNames.has(path.basename(entry.name)));
const sumSlice = (type) =>
  slice.filter((entry) => (type === "js" ? entry.type === "script" : entry.type !== "script"))
    .reduce((total, entry) => total + entry.bytes, 0);

const report = {
  generatedAt: new Date().toISOString(),
  url: HOME,
  viewport: "1280x900",
  theme: "dark",
  reducedMotion: true,
  ...result,
  slice: slice.map((entry) => ({ name: entry.name, type: entry.type, bytes: entry.bytes })),
  sliceBytes: sumSlice("js") + sumSlice("css"),
  sliceJsBytes: sumSlice("js"),
  sliceCssBytes: sumSlice("css"),
  sliceChunksRequested: slice.length,
  note:
    "Single local run of the review export (HANSA_ATLAS_REVIEW_PREVIEW=1, HANSA_NEIGHBOURHOOD_REVIEW=1). The slice is fetched only after hydration (its chunk names are hashed, so it is identified by the `nb-embed` marker on disk), so the public Home never pays for it.",
};
await writeFile(path.join(OUT, "r2-review-perf.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
await browser.close();
