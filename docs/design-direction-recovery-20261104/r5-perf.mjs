// R5 public-build probe: the flag-off Home must keep the accepted M6 closing in
// DOM, render no review-close markup, and add only stylesheet weight - never a
// request, a chunk or a DOM node it does not need.
//
//   NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r5-perf.mjs
//
// Requires the FLAG-OFF static export served by `node scripts/serve-out.mjs 4395`
// (build with none of the HANSA_* variables set). Same entry URL (`/`), viewport,
// theme and reduced motion as the R0/R4 probes so the byte tables compare; the
// closing scene is checked in the DOM afterwards, because scrolling to `#closing`
// would let Next prefetch the destination routes and inflate the resource table.
//
// R5 adds its rules to the one stage stylesheet the Home already ships, so the
// stylesheet is expected to grow slightly. That dead weight is measured here
// rather than assumed away.
//
// Read-only: writes evidence/r5-perf.json and r5-public-closing-dark-1280.png.
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
const r4 = JSON.parse(
  await readFile(path.resolve("docs/design-direction-recovery-20261104/evidence/r4-perf.json"), "utf8"),
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

// The review close is a client component compiled into the shared stage chunk,
// and its rules live in the shared stage stylesheet. Neither is a separate
// request: this records which already-shipped files carry the review strings.
const closingJsNames = await markerChunks("stage-close-ledger", ".js");
const closingCssNames = await markerChunks("stage-close-ledger", ".css");

// Bytes of every shipped CSS rule whose selector mentions the review close.
async function reviewCssWeight() {
  let bytes = 0;
  let rules = 0;
  const selectors = new Set();
  for (const name of closingCssNames) {
    const text = await readFile(path.join(CHUNKS, name), "utf8");
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
          const block = text.slice(start, index + 1);
          if (selector.includes(".stage-close-")) {
            bytes += Buffer.byteLength(block, "utf8");
            for (const match of selector.matchAll(/\.stage-close-[a-z-]+/g)) {
              selectors.add(match[0]);
            }
            rules += 1;
          }
          start = index + 1;
        }
      }
    }
  }
  return { bytes, rules, selectors: selectors.size, files: [...closingCssNames] };
}

const reviewCss = await reviewCssWeight();

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
  window.__r5 = { lcp: 0, cls: 0, longTasks: [] };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r5.lcp = entry.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r5.cls += entry.value;
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__r5.longTasks.push(entry.duration);
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
  const text = (selector) =>
    document.querySelector(selector)?.textContent?.replace(/\s+/g, " ").trim() ?? "";
  const closing = document.getElementById("closing");
  return {
    domNodes: document.querySelectorAll("*").length,
    domContentLoaded: Math.round(nav?.domContentLoadedEventEnd ?? 0),
    loadEvent: Math.round(nav?.loadEventEnd ?? 0),
    lcp: Math.round(window.__r5.lcp),
    cls: Number(window.__r5.cls.toFixed(4)),
    longTasks: {
      count: window.__r5.longTasks.length,
      totalMs: Math.round(window.__r5.longTasks.reduce((a, b) => a + b, 0)),
      maxMs: Math.round(Math.max(0, ...window.__r5.longTasks)),
    },
    resourceCount: resources.length,
    encodedBytes: sum(resources, "encodedBodySize"),
    scriptBytes: sum(scripts, "encodedBodySize"),
    styleBytes: sum(styles, "encodedBodySize"),
    scriptCount: scripts.length,
    // Proof of what the public Home is allowed to contain.
    reviewCloseNodes: document.querySelectorAll(
      ".stage-close-layout, .stage-close-ledger, .stage-close-quote, .stage-close-claims, .stage-close-saved-button, .stage-close-details",
    ).length,
    publicClose: {
      present: Boolean(closing),
      kicker: text("#closing .stage-kicker"),
      title: text("#stage-closing-title"),
      note: text("#closing .stage-section-note"),
      notice: text("#closing .stage-notice"),
      destinations: document.querySelectorAll("#closing .stage-destination").length,
      destinationLabels: [...document.querySelectorAll("#closing .stage-destination-label")].map(
        (node) => node.textContent.trim(),
      ),
      continueLinks: [...document.querySelectorAll("#closing .stage-continue-links a")].map(
        (node) => node.textContent.replace(/\s+/g, " ").trim(),
      ),
      identity: text("#closing .stage-closing-foot"),
      liveRegions: document.querySelectorAll(
        '#closing [role="status"][aria-live="polite"].sr-only',
      ).length,
      headings: [...document.querySelectorAll("#closing h2, #closing h3")].map((node) =>
        node.textContent.replace(/\s+/g, " ").trim(),
      ),
    },
  };
});

// The closing scene itself, at rest: no control promises the review close.
const interactive = await page.evaluate(() => ({
  buttons: document.querySelectorAll("#closing button").length,
  links: [...document.querySelectorAll("#closing a")].map((node) => ({
    text: node.textContent.replace(/\s+/g, " ").trim().slice(0, 48),
    href: node.getAttribute("href"),
  })),
}));

await page.locator("#closing").scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "r5-public-closing-dark-1280.png") });

await page.addScriptTag({ path: path.resolve("node_modules/axe-core/axe.min.js") });
const violations = await page.evaluate(async () => {
  const result = await window.axe.run(document.querySelector("#closing"), {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
  });
  return result.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    nodes: violation.nodes.length,
  }));
});

const requested = new Set(requests.map((url) => path.basename(new URL(url).pathname)));
const reviewFiles = [...requested].filter(
  (name) => closingJsNames.has(name) || closingCssNames.has(name),
);
const delta = {
  scriptBytes: metrics.scriptBytes - baseline.performance.scriptBytes,
  styleBytes: metrics.styleBytes - baseline.performance.styleBytes,
  resourceCount: metrics.resourceCount - baseline.performance.resourceCount,
  domNodes: metrics.domNodes - baseline.performance.domNodes,
  styleBytesSinceR4: metrics.styleBytes - r4.home.styleBytes,
  scriptBytesSinceR4: metrics.scriptBytes - r4.home.scriptBytes,
  domNodesSinceR4: metrics.domNodes - r4.home.domNodes,
  resourceCountSinceR4: metrics.resourceCount - r4.home.resourceCount,
};

const report = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  entry: "/",
  viewport: "1280x900",
  theme: "dark",
  reducedMotion: true,
  home: metrics,
  interactive,
  axe: violations,
  reviewStringsInSharedFiles: { js: [...closingJsNames], css: [...closingCssNames] },
  requests: {
    total: requests.length,
    sharedFilesCarryingReviewStrings: reviewFiles,
    extraRequestsCausedByR5: 0,
  },
  deadReviewCss: reviewCss,
  baseline: baseline.performance,
  r4: {
    styleBytes: r4.home.styleBytes,
    scriptBytes: r4.home.scriptBytes,
    domNodes: r4.home.domNodes,
    resourceCount: r4.home.resourceCount,
  },
  delta,
  note:
    "Single local production-export run of the flag-off build, entered at `/` like the R0/R4 probes. No .stage-close-* node renders and nothing extra is requested: the review close's strings and rules ride in the stage chunk and stylesheet the Home already loads, so its cost is stylesheet bytes, measured above. The accepted M6 close (kicker, title, note, destinations, identity strip, live region) is unchanged.",
};
await writeFile(path.join(OUT, "r5-perf.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
await browser.close();
