// R6 performance probe. Run it twice: once against the polish export, once
// against the shipped flag-off export.
//
//   $env:NODE_PATH="$PWD\node_modules"; node docs/design-direction-recovery-20261104/r6-perf.mjs polish
//   $env:NODE_PATH="$PWD\node_modules"; node docs/design-direction-recovery-20261104/r6-perf.mjs public
//
// Same entry URL (`/`), viewport, theme and reduced motion as the R0/R4/R5
// probes so the byte tables compare. Read-only: writes evidence/r6-perf-<mode>.json.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://127.0.0.1:4395";
const OUT = path.resolve("docs/design-direction-recovery-20261104/evidence");
const mode = process.argv[2] === "polish" ? "polish" : "public";
const baseline = JSON.parse(
  await readFile(path.resolve("docs/design-direction-recovery-20261104/baseline.json"), "utf8"),
);
const r5 = JSON.parse(await readFile(path.join(OUT, "r5-perf.json"), "utf8"));

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
  window.__r6 = { lcp: 0, cls: 0, longTasks: [] };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r6.lcp = entry.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r6.cls += entry.value;
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r6.longTasks.push(entry.duration);
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
  const styles = resources.filter(
    (item) => item.initiatorType === "link" || item.initiatorType === "css",
  );
  const sizes = new Set();
  const stage = document.querySelector(".hansa-stage");
  for (const node of stage.querySelectorAll("*")) {
    if (![...node.childNodes].some((child) => child.nodeType === 3 && child.textContent.trim())) {
      continue;
    }
    if (node.closest("svg")) continue;
    sizes.add(Math.round(parseFloat(getComputedStyle(node).fontSize) * 10) / 10);
  }
  return {
    polishOn: stage.getAttribute("data-stage-polish") === "true",
    domNodes: document.querySelectorAll("*").length,
    domContentLoaded: Math.round(nav?.domContentLoadedEventEnd ?? 0),
    loadEvent: Math.round(nav?.loadEventEnd ?? 0),
    lcp: Math.round(window.__r6.lcp),
    cls: Number(window.__r6.cls.toFixed(4)),
    longTasks: {
      count: window.__r6.longTasks.length,
      totalMs: Math.round(window.__r6.longTasks.reduce((a, b) => a + b, 0)),
      maxMs: Math.round(Math.max(0, ...window.__r6.longTasks)),
    },
    resourceCount: resources.length,
    encodedBytes: sum(resources, "encodedBodySize"),
    scriptBytes: sum(scripts, "encodedBodySize"),
    styleBytes: sum(styles, "encodedBodySize"),
    scriptCount: scripts.length,
    sizes: [...sizes].sort((a, b) => b - a),
    headings: [...document.querySelectorAll(".hansa-stage h1, .hansa-stage h2, .hansa-stage h3")].map(
      (node) => `${node.tagName}: ${node.textContent.replace(/\s+/g, " ").trim()}`,
    ),
    reviewCloseNodes: document.querySelectorAll(
      ".stage-close-layout, .stage-close-ledger, .stage-close-quote, .stage-close-claims",
    ).length,
  };
});

// The polish rules are dead bytes when the flag is off; the selector attribute is
// what keeps them inert, so measure the rules themselves.
const cssFiles = [...new Set(requests.filter((url) => url.endsWith(".css")))];
let polishCss = { bytes: 0, rules: 0 };
for (const url of cssFiles) {
  const text = await page.evaluate(async (href) => (await fetch(href)).text(), url);
  let depth = 0;
  let start = 0;
  let selector = "";
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === "{") {
      if (depth === 0) selector = text.slice(start, index).trim();
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        if (selector.includes("[data-stage-polish")) {
          polishCss.bytes += Buffer.byteLength(text.slice(start, index + 1), "utf8");
          polishCss.rules += 1;
        }
        start = index + 1;
      }
    }
  }
}

// The stage at rest, measured for LCP relevance.
await page.waitForTimeout(200);

const report = {
  generatedAt: new Date().toISOString(),
  mode,
  base: BASE,
  entry: "/",
  viewport: "1280x900",
  theme: "dark",
  reducedMotion: true,
  home: metrics,
  polishCss,
  requestCount: requests.length,
  baseline: baseline.performance,
  r5: {
    domNodes: r5.home.domNodes,
    resourceCount: r5.home.resourceCount,
    scriptBytes: r5.home.scriptBytes,
    styleBytes: r5.home.styleBytes,
    lcp: r5.home.lcp,
  },
  deltaSinceR5: {
    domNodes: metrics.domNodes - r5.home.domNodes,
    resourceCount: metrics.resourceCount - r5.home.resourceCount,
    scriptBytes: metrics.scriptBytes - r5.home.scriptBytes,
    styleBytes: metrics.styleBytes - r5.home.styleBytes,
  },
  note:
    "Single local production-export run, entered at `/` like the R0/R4/R5 probes. The polish layer is one attribute plus inert rules: with the flag off the public Home renders the accepted M6 type and the rules are dead bytes in the stage stylesheet, measured above.",
};
await writeFile(
  path.join(OUT, `r6-perf-${mode}.json`),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);
console.log(JSON.stringify(report, null, 2));
await browser.close();
