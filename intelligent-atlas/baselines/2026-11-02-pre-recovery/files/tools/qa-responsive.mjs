// Responsive QA for the V3.1 review prototype and the public projection.
//
//   node intelligent-atlas/tools/qa-responsive.mjs
//
// Checks 390, 768 and 1280 widths for horizontal overflow, key scene
// visibility, dialog/drawer bounds and console errors. Screenshots are written
// under evidence/v31/responsive/ and the receipt under analysis/.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ROOT = path.resolve("intelligent-atlas");
const PROTOTYPE = pathToFileURL(path.join(ROOT, "prototype", "index.html")).href;
const PUBLIC = pathToFileURL(path.join(ROOT, "public", "index.html")).href;
const SHOTS = path.join(ROOT, "evidence", "v31", "responsive");
const REPORT = path.join(ROOT, "analysis", "responsive-qa-v31.json");
const VIEWPORTS = [
  { id: "390", width: 390, height: 844 },
  { id: "768", width: 768, height: 1024 },
  { id: "1280", width: 1280, height: 900 },
];

const results = [];
const consoleErrors = [];
const check = (id, pass, detail) => results.push({ id, status: pass ? "PASS" : "FAIL", detail });

const browser = await chromium.launch({ executablePath: EDGE, headless: true });

const overflow = (page) =>
  page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    return {
      docScrollWidth: doc.scrollWidth,
      bodyScrollWidth: body.scrollWidth,
      innerWidth: window.innerWidth,
      overflowX: doc.scrollWidth > window.innerWidth + 1 || body.scrollWidth > window.innerWidth + 1,
    };
  });

const box = (page, selector) =>
  page.evaluate((query) => {
    const node = document.querySelector(query);
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    return { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width), top: Math.round(rect.top), bottom: Math.round(rect.bottom), height: Math.round(rect.height) };
  }, selector);

const shot = async (page, name) => {
  await mkdir(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, name), fullPage: false });
};

const settle = async (page, ms = 320) => {
  await page.evaluate(() => document.getElementById("toast")?.classList.remove("is-visible"));
  await page.waitForTimeout(ms);
};

const jump = (page, id) =>
  page.evaluate((sectionId) => document.getElementById(sectionId)?.scrollIntoView({ behavior: "instant", block: "start" }), id);

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: "no-preference" });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(`${viewport.id}: ${message.text()}`);
  });
  page.on("pageerror", (error) => consoleErrors.push(`${viewport.id}: ${error.message}`));

  try {
    await page.goto(`${PROTOTYPE}?theme=light`, { waitUntil: "load" });
    await page.waitForFunction(() => Boolean(window.__ATLAS_STAGE__), { timeout: 15000 });
    await settle(page, 600);

    await jump(page, "scene-timeline");
    await settle(page, 350);
    let flow = await overflow(page);
    check(`prototype:${viewport.id}:timeline-overflow`, !flow.overflowX, JSON.stringify(flow));
    const timeline = await page.evaluate(() => ({
      rail: Boolean(document.querySelector(".rail-days")),
      open: Boolean(document.getElementById("open-edition")),
      railWidth: Math.round(document.querySelector(".rail-days")?.getBoundingClientRect().width ?? 0),
    }));
    check(`prototype:${viewport.id}:timeline-visible`, timeline.rail && timeline.open && timeline.railWidth > 100, JSON.stringify(timeline));
    await shot(page, `${viewport.id}-prototype-timeline.png`);

    await page.evaluate(() => window.__ATLAS_STAGE__.openDealer("daily:2026-10-26"));
    await settle(page, 400);
    flow = await overflow(page);
    const dealer = await box(page, ".dealer");
    check(`prototype:${viewport.id}:dealer-overflow`, !flow.overflowX, JSON.stringify(flow));
    check(
      `prototype:${viewport.id}:dealer-in-viewport`,
      dealer && dealer.left >= -1 && dealer.right <= viewport.width + 1 && dealer.width <= viewport.width,
      JSON.stringify(dealer),
    );
    const dealerCards = await page.evaluate(() => document.querySelectorAll("#dealer-hand .card").length);
    check(`prototype:${viewport.id}:dealer-card`, dealerCards === 1, `cards=${dealerCards}`);
    await shot(page, `${viewport.id}-prototype-dealer.png`);
    await page.evaluate(() => window.__ATLAS_STAGE__.closeDealer());
    await settle(page, 250);

    await page.evaluate(() => {
      const section = document.getElementById("handoff");
      const top = section.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      window.scrollTo({ top: top + travel * 0.5, behavior: "instant" });
    });
    await settle(page, 400);
    flow = await overflow(page);
    const handoff = await box(page, "#handoff-token");
    const handoffCopy = await box(page, ".handoff-copy");
    check(`prototype:${viewport.id}:handoff-overflow`, !flow.overflowX, JSON.stringify(flow));
    check(
      `prototype:${viewport.id}:handoff-readable`,
      handoff &&
        handoffCopy &&
        handoff.left >= -1 &&
        handoff.right <= viewport.width + 1 &&
        handoffCopy.left >= -1 &&
        handoffCopy.right <= viewport.width + 1,
      JSON.stringify({ token: handoff, copy: handoffCopy }),
    );
    await shot(page, `${viewport.id}-prototype-handoff.png`);

    await page.evaluate(() => window.__ATLAS_STAGE__.selectConcept("concept:stats:confidence-interval"));
    await jump(page, "scene-knowledge");
    await settle(page, 700);
    flow = await overflow(page);
    const contextBox = await box(page, "#context-panel");
    const field = await box(page, ".field");
    check(`prototype:${viewport.id}:knowledge-overflow`, !flow.overflowX, JSON.stringify(flow));
    check(
      `prototype:${viewport.id}:knowledge-in-viewport`,
      contextBox && field && contextBox.right <= viewport.width + 1 && field.right <= viewport.width + 1,
      JSON.stringify({ context: contextBox, field }),
    );
    const knowledge = await page.evaluate(() => ({
      title: document.querySelector("#context-content .panel-title")?.textContent,
      nodes: document.querySelectorAll(".node").length,
      intent: window.__ATLAS_STAGE__.getState().intent,
    }));
    check(`prototype:${viewport.id}:knowledge-visible`, Boolean(knowledge.title) && knowledge.nodes === 132, JSON.stringify(knowledge));
    await shot(page, `${viewport.id}-prototype-knowledge.png`);

    await page.evaluate(() => window.__ATLAS_STAGE__.setIntent("compare"));
    await settle(page, 450);
    flow = await overflow(page);
    const board = await box(page, "#context-content .board");
    check(`prototype:${viewport.id}:compare-overflow`, !flow.overflowX, JSON.stringify(flow));
    check(`prototype:${viewport.id}:compare-board`, Boolean(board), JSON.stringify(board));
    await shot(page, `${viewport.id}-prototype-compare.png`);

    await page.evaluate(() => window.__ATLAS_STAGE__.openPocket());
    await settle(page, 350);
    flow = await overflow(page);
    const pocket = await box(page, "#pocket-panel");
    check(`prototype:${viewport.id}:pocket-overflow`, !flow.overflowX, JSON.stringify(flow));
    check(`prototype:${viewport.id}:pocket-in-viewport`, pocket && pocket.width <= viewport.width && pocket.right <= viewport.width + 1, JSON.stringify(pocket));
    await shot(page, `${viewport.id}-prototype-pocket.png`);
    await page.evaluate(() => window.__ATLAS_STAGE__.closePocket());
    await settle(page, 200);

    await page.evaluate(() => window.__ATLAS_STAGE__.setIntent("understand"));
    await jump(page, "scene-closing");
    await settle(page, 400);
    flow = await overflow(page);
    check(`prototype:${viewport.id}:closing-overflow`, !flow.overflowX, JSON.stringify(flow));
    const closing = await page.evaluate(() => ({
      ledger: document.querySelectorAll("#closing-ledger > div").length,
      action: Boolean(document.getElementById("closing-action")),
    }));
    check(`prototype:${viewport.id}:closing-visible`, closing.ledger >= 8 && closing.action, JSON.stringify(closing));
    await shot(page, `${viewport.id}-prototype-closing.png`);

    await page.goto(`${PUBLIC}?theme=light`, { waitUntil: "load" });
    await page.waitForFunction(() => Boolean(window.__ATLAS_PUBLIC_STATE__), { timeout: 15000 });
    await settle(page, 400);
    flow = await overflow(page);
    check(`public:${viewport.id}:hero-overflow`, !flow.overflowX, JSON.stringify(flow));
    const hero = await page.evaluate(() => ({
      title: document.getElementById("public-title")?.textContent,
      counts: [...document.querySelectorAll(".status-row dd")].map((node) => node.textContent),
      gate: document.querySelectorAll(".gate-card").length,
    }));
    check(`public:${viewport.id}:hero-visible`, Boolean(hero.title) && hero.counts.join(",") === "0,0,0", JSON.stringify(hero));
    await shot(page, `${viewport.id}-public-hero.png`);

    await page.evaluate(() => document.getElementById("structure").scrollIntoView({ behavior: "instant", block: "start" }));
    await settle(page, 300);
    flow = await overflow(page);
    check(`public:${viewport.id}:structure-overflow`, !flow.overflowX, JSON.stringify(flow));
    await shot(page, `${viewport.id}-public-structure.png`);

    await page.evaluate(() => document.getElementById("limits").scrollIntoView({ behavior: "instant", block: "start" }));
    await settle(page, 300);
    flow = await overflow(page);
    check(`public:${viewport.id}:limits-overflow`, !flow.overflowX, JSON.stringify(flow));
    await shot(page, `${viewport.id}-public-limits.png`);
  } catch (error) {
    check(`viewport:${viewport.id}:completed`, false, error.stack ?? String(error));
  } finally {
    await context.close();
  }
}

await browser.close();

const failed = results.filter((entry) => entry.status === "FAIL");
const report = {
  schemaVersion: "intelligent-atlas-responsive-qa/3.1",
  generatedAt: new Date().toISOString(),
  edge: "156.0.4314.58",
  viewports: VIEWPORTS.map((viewport) => `${viewport.width}x${viewport.height}`),
  summary: { total: results.length, passed: results.length - failed.length, failed: failed.length },
  consoleErrors,
  results,
};
await mkdir(path.dirname(REPORT), { recursive: true });
await writeFile(REPORT, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary));
for (const result of results) console.log(`${result.status} ${result.id} — ${result.detail}`);
process.exitCode = failed.length ? 1 : 0;
