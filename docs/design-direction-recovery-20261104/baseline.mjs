// R0 baseline: hashes the design reference and measures the shipped Home.
//
//   NODE_PATH=node_modules node docs/design-direction-recovery-20261104/baseline.mjs
//
// Read-only: writes baseline.json next to this script. The shipped build must be
// served by `node scripts/serve-out.mjs 4380`.
import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ROOT = process.cwd();
const OUT = "docs/design-direction-recovery-20261104";
const PROTO = "intelligent-atlas/prototype";
const BASE = "http://127.0.0.1:4380";

async function sha256(file) {
  const bytes = await readFile(path.join(ROOT, file));
  return createHash("sha256").update(bytes).digest("hex");
}

async function hashTree(dir) {
  const entries = await readdir(path.join(ROOT, dir), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const file = `${dir}/${entry.name}`;
    files.push({ path: file, sha256: await sha256(file) });
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

const reference = {
  prototype: await hashTree(PROTO),
  app: await Promise.all(
    [
      "components/knowledge/stage-timeline.tsx",
      "components/knowledge/stage-knowledge.tsx",
      "components/knowledge/stage-closing.tsx",
      "components/knowledge/insight-stage.tsx",
      "components/knowledge/hansa-landing.tsx",
      "components/knowledge/stage-editorial.css",
      "lib/knowledge/stage-model.ts",
      "lib/atlas/model.ts",
      "components/atlas/explorer.tsx",
    ].map(async (file) => ({ path: file, sha256: await sha256(file) })),
  ),
  evidence: await hashTree(`${OUT}/evidence`),
};

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
await context.addInitScript(() => {
  try {
    window.localStorage.setItem("amir-theme", "dark");
  } catch {
    /* ignore */
  }
});
const page = await context.newPage();
await page.addInitScript(() => {
  window.__r0 = { lcp: 0, cls: 0, longTasks: [] };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r0.lcp = entry.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r0.cls += entry.value;
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r0.longTasks.push(entry.duration);
  }).observe({ type: "longtask", buffered: true });
});

await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(1500);

const performance = await page.evaluate(() => {
  const nav = performance.getEntriesByType("navigation")[0];
  const resources = performance.getEntriesByType("resource");
  const sum = (items, key) => items.reduce((total, item) => total + (item[key] || 0), 0);
  const scripts = resources.filter((item) => item.initiatorType === "script");
  const styles = resources.filter((item) => item.initiatorType === "link" || item.initiatorType === "css");
  return {
    domNodes: document.querySelectorAll("*").length,
    domContentLoaded: Math.round(nav?.domContentLoadedEventEnd ?? 0),
    loadEvent: Math.round(nav?.loadEventEnd ?? 0),
    lcp: Math.round(window.__r0.lcp),
    cls: Number(window.__r0.cls.toFixed(4)),
    longTasks: {
      count: window.__r0.longTasks.length,
      totalMs: Math.round(window.__r0.longTasks.reduce((a, b) => a + b, 0)),
      maxMs: Math.round(Math.max(0, ...window.__r0.longTasks)),
    },
    resourceCount: resources.length,
    encodedBytes: sum(resources, "encodedBodySize"),
    transferBytes: sum(resources, "transferSize"),
    scriptBytes: sum(scripts, "encodedBodySize"),
    styleBytes: sum(styles, "encodedBodySize"),
    images: resources.filter((item) => item.initiatorType === "img").length,
    views: {
      timelineDays: document.querySelectorAll("#today ol li").length,
      editionDays: document.querySelectorAll('#today ol li[data-has-edition="true"]').length,
      graphText: document.querySelector(".stage-graph")?.innerText.slice(0, 160) ?? null,
    },
  };
});

const baseline = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  viewport: "1280x900",
  theme: "dark",
  reducedMotion: true,
  reference,
  performance,
  note: "LCP/CLS/long tasks are single-run local measurements for regression comparison, not field data.",
};

await writeFile(path.join(ROOT, OUT, "baseline.json"), `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ performance, referenceCounts: { prototype: reference.prototype.length, app: reference.app.length, evidence: reference.evidence.length } }, null, 2));
await browser.close();
