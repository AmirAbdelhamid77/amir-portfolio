// Side-by-side evidence capture for the design-direction recovery review.
//
//   NODE_PATH=node_modules node docs/design-direction-recovery-20261104/capture.mjs
//
// Captures the original prototype (`intelligent-atlas/prototype/`, opened from
// disk) and the shipped export (`127.0.0.1:4380`, `scripts/serve-out.mjs 4380`)
// at the same viewports and themes. The review-preview atlas is read from the
// already-running dev server on 4391; this script starts no server and changes
// no application file. Screenshots land next to this script in `evidence/`.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = path.resolve("docs/design-direction-recovery-20261104/evidence");
const PROTO = pathToFileURL(path.resolve("intelligent-atlas/prototype/index.html")).href;
const SHIPPED = "http://127.0.0.1:4380";
const PREVIEW = "http://127.0.0.1:4391";

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: EDGE, headless: true });

async function open(url, { width = 1280, height = 900, dark = true } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await context.addInitScript((isDark) => {
    try {
      window.localStorage.setItem("amir-theme", isDark ? "dark" : "light");
    } catch {
      /* file:// and private mode can refuse storage */
    }
  }, dark);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(700);
  return { page, context, errors };
}

const shots = [];
async function shot(page, name, label) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
  shots.push({ name, label });
}

async function withPage(url, options, work) {
  const { page, context, errors } = await open(url, options);
  await work(page);
  if (errors.length) console.log(`console errors on ${url}:`, errors.slice(0, 3));
  await context.close();
}

// ---------------------------------------------------------------- prototype
const protoArgs = "theme=dark&date=2026-10-26";

await withPage(`${PROTO}?${protoArgs}`, {}, async (page) => {
  await shot(page, "proto-timeline-dark-1280", "Prototype · timeline, dark, 1280");
  await page.evaluate(() => window.__ATLAS_STAGE__.goToScene("knowledge", { instant: true }));
  await page.waitForTimeout(500);
  await shot(page, "proto-entrances-dark-1280", "Prototype · subject entrances, dark, 1280");
  await page.evaluate(() => {
    window.__ATLAS_STAGE__.selectConcept("concept:fabric:security-model", { scroll: false });
  });
  await page.waitForTimeout(500);
  await shot(page, "proto-knowledge-dark-1280", "Prototype · knowledge neighbourhood, dark, 1280");
  await page.evaluate(() => {
    window.__ATLAS_STAGE__.selectConcept("concept:fabric:security-model", { scroll: false, limit: 8 });
  });
  await page.waitForTimeout(500);
  await shot(page, "proto-knowledge-expanded-dark-1280", "Prototype · neighbourhood expanded, dark, 1280");
  await page.evaluate(() => window.__ATLAS_STAGE__.openDealer("daily:2026-10-26"));
  await page.waitForTimeout(400);
  await shot(page, "proto-dealer-dark-1280", "Prototype · dealer, dark, 1280");
  await page.evaluate(() => {
    window.__ATLAS_STAGE__.closeDealer({ returnFocus: false });
    window.__ATLAS_STAGE__.setIntent("compare");
    window.__ATLAS_STAGE__.goToScene("knowledge", { instant: true });
  });
  await page.waitForTimeout(400);
  await shot(page, "proto-compare-dark-1280", "Prototype · compare board, dark, 1280");
  await page.evaluate(() => window.__ATLAS_STAGE__.goToScene("closing", { instant: true }));
  await page.waitForTimeout(400);
  await shot(page, "proto-closing-dark-1280", "Prototype · closing ledger, dark, 1280");
});

await withPage(`${PROTO}?theme=light&date=2026-10-26`, { width: 390, height: 844, dark: false }, async (page) => {
  await shot(page, "proto-timeline-light-390", "Prototype · timeline, light, 390");
  await page.evaluate(() => {
    window.__ATLAS_STAGE__.selectConcept("concept:fabric:security-model", { scroll: false });
    window.__ATLAS_STAGE__.goToScene("knowledge", { instant: true });
  });
  await page.waitForTimeout(500);
  await shot(page, "proto-knowledge-light-390", "Prototype · neighbourhood list, light, 390");
});

// ------------------------------------------------------------------- shipped
await withPage(`${SHIPPED}/`, {}, async (page) => {
  await shot(page, "shipped-home-dark-1280", "Shipped M6 · first viewport, dark, 1280");
  await page.locator("#stage-edition-title").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await shot(page, "shipped-knowledge-dark-1280", "Shipped M6 · knowledge scene, dark, 1280");
  await page.locator(".stage-graph").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await shot(page, "shipped-graph-dark-1280", "Shipped M6 · semantic layer empty state, dark, 1280");
  await page.locator("#stage-timeline-title").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const open = page.getByRole("button", { name: /Open the edition/i }).first();
  if (await open.count()) {
    await open.click();
    await page.waitForTimeout(500);
    await page.locator("#today-deal").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await shot(page, "shipped-dealer-dark-1280", "Shipped M6 · dealer, dark, 1280");
  }
  await page.locator("#closing").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await shot(page, "shipped-closing-dark-1280", "Shipped M6 · closing scene, dark, 1280");
});

await withPage(`${SHIPPED}/`, { width: 390, height: 844, dark: false }, async (page) => {
  await shot(page, "shipped-home-light-390", "Shipped M6 · first viewport, light, 390");
  await page.locator("#stage-edition-title").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await shot(page, "shipped-knowledge-light-390", "Shipped M6 · knowledge scene, light, 390");
});

await withPage(`${SHIPPED}/learn/dp-600/atlas/`, {}, async (page) => {
  await shot(page, "shipped-atlas-desk-dark-1280", "Shipped M6 · atlas pending desk, dark, 1280");
});

await withPage(`${PREVIEW}/learn/dp-600/atlas/`, {}, async (page) => {
  await page.waitForSelector('[data-testid="atlas-explorer"]', { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(600);
  await shot(page, "preview-atlas-explorer-dark-1280", "Review preview · atlas explorer, dark, 1280");
  await page.locator('[data-testid="atlas-map"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await shot(page, "preview-atlas-map-dark-1280", "Review preview · atlas circle map, dark, 1280");
});

await browser.close();
console.log(JSON.stringify({ out: OUT, shots }, null, 2));
