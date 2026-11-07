// R1 performance and production-behaviour probe for the review route.
//
//   NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r1-perf.mjs
//
// Requires a static export served by `node scripts/serve-out.mjs 4380` and a
// build made with HANSA_ATLAS_REVIEW_PREVIEW=1, otherwise the route is a 404.
// Read-only: writes evidence/r1-perf.json. Same viewport, theme and reduced
// motion as the R0 baseline so the two tables are comparable.
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://127.0.0.1:4380";
const OUT = path.resolve("docs/design-direction-recovery-20261104/evidence");

const browser = await chromium.launch({ executablePath: EDGE, headless: true });

async function measure(url, after) {
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
    window.__r1 = { lcp: 0, cls: 0, longTasks: [] };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__r1.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__r1.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__r1.longTasks.push(entry.duration);
    }).observe({ type: "longtask", buffered: true });
  });
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(1500);
  if (after) await after(page);
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
      lcp: Math.round(window.__r1.lcp),
      cls: Number(window.__r1.cls.toFixed(4)),
      longTasks: {
        count: window.__r1.longTasks.length,
        totalMs: Math.round(window.__r1.longTasks.reduce((a, b) => a + b, 0)),
        maxMs: Math.round(Math.max(0, ...window.__r1.longTasks)),
      },
      resourceCount: resources.length,
      encodedBytes: sum(resources, "encodedBodySize"),
      scriptBytes: sum(scripts, "encodedBodySize"),
      styleBytes: sum(styles, "encodedBodySize"),
      scriptCount: scripts.length,
    };
  });
  await context.close();
  return metrics;
}

const extra = {};
const review = await measure(`${BASE}/review/neighbourhood/`, async (page) => {
  // Prove the production bundle hydrates: expand and read the branch count.
  const before = await page.locator(".nb-branch").count();
  await page.locator(".nb-text-action").click();
  await page.waitForTimeout(400);
  extra.expandedBranches = { before, after: await page.locator(".nb-branch").count() };
  extra.hydrated = extra.expandedBranches.after > before;
  await page.evaluate(() => window.scrollTo(0, 0));

  await page.screenshot({
    path: path.join(OUT, "r1-production-dark-1280.png"),
    fullPage: false,
  });
});
const home = await measure(`${BASE}/`);

const report = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  viewport: "1280x900",
  theme: "dark",
  reducedMotion: true,
  review: {
    ...review,
    ...extra,
    fieldBranches: 6,
    fieldEdges: 8,
    concepts: 42,
  },
  home,
  note:
    "Single local production-export run for regression comparison against BASELINE.md, not field data. The review route is a design-review surface, not a public page.",
};
await writeFile(path.join(OUT, "r1-perf.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
await browser.close();
