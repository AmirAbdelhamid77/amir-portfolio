// Browser QA for the isolated V3.1 Knowledge Stage prototype.
//
//   node intelligent-atlas/tools/qa-stage.mjs [--capture]
//
// Drives the locally installed Microsoft Edge through playwright-core against
// the file:// prototype. No network, no build, no deployment. The report and
// screenshots are written under intelligent-atlas/evidence/v31/.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ROOT = path.resolve("intelligent-atlas");
const PROTOTYPE = pathToFileURL(path.join(ROOT, "prototype", "index.html")).href;
const EVIDENCE = path.join(ROOT, "evidence", "v31");
const CAPTURE = process.argv.includes("--capture");
const results = [];
const consoleErrors = [];
const pageErrors = [];

const check = (id, pass, detail, severity = "PASS") => {
  results.push({ id, status: pass ? severity : "FAIL", detail });
};

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: "no-preference" });
const page = await context.newPage();
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => pageErrors.push(error.message));

const state = () => page.evaluate(() => window.__ATLAS_STAGE__.getState());
const stage = (fn, arg) => page.evaluate(fn, arg);
const settle = async (ms = 260) => {
  await page.evaluate(() => document.getElementById("toast")?.classList.remove("is-visible"));
  await page.waitForTimeout(ms);
};
const jumpTo = (id) =>
  page.evaluate((sectionId) => document.getElementById(sectionId)?.scrollIntoView({ behavior: "instant", block: "start" }), id);

try {
  await page.goto(`${PROTOTYPE}?theme=light`, { waitUntil: "load" });
  await page.waitForFunction(() => Boolean(window.__ATLAS_STAGE__), { timeout: 15000 });
  await page.waitForTimeout(600);

  check("runtime:no-console-errors", consoleErrors.length === 0, consoleErrors.join(" | "));
  check("runtime:no-page-errors", pageErrors.length === 0, pageErrors.join(" | "));

  const initial = await state();
  check("timeline:default-date-is-latest", initial.date === "2026-10-26", `date=${initial.date}`);
  check("timeline:default-intent", initial.intent === "understand", `intent=${initial.intent}`);

  const counts = await page.evaluate(() => ({
    nodes: document.querySelectorAll(".node").length,
    edges: document.querySelectorAll(".edge").length,
    days: document.querySelectorAll(".rail-day").length,
    editions: window.__ATLAS_STAGE__.data.editions.length,
    cards: window.__ATLAS_STAGE__.data.decks["daily:2026-10-26"].deck.cards.length,
    emptyCards: window.__ATLAS_STAGE__.data.decks["daily:2026-11-01"].deck.cards.length,
  }));
  check("field:all-nodes", counts.nodes === 132, `nodes=${counts.nodes}`);
  check("field:all-edges", counts.edges === 86, `edges=${counts.edges}`);
  check("timeline:all-days", counts.days === 15, `days=${counts.days}`);
  check("dealer:latest-has-one-card", counts.cards === 1, `cards=${counts.cards}`);
  check("dealer:today-is-empty", counts.emptyCards === 0, `cards=${counts.emptyCards}`);

  const initialView = await stage(() => window.__ATLAS_STAGE__.getView());
  check("field:default-overview-dense", initialView.dense === true, `scale=${initialView.s.toFixed(3)} dense=${initialView.dense}`);

  if (CAPTURE) {
    await mkdir(EVIDENCE, { recursive: true });
    await jumpTo("scene-timeline");
    await settle();
    await page.screenshot({ path: path.join(EVIDENCE, "keyframe-01-timeline-light.png"), fullPage: false });
  }

  await page.click("#open-edition");
  await page.waitForTimeout(350);
  const dealerOpen = await page.evaluate(() => ({
    hidden: document.getElementById("dealer-backdrop").hidden,
    cards: document.querySelectorAll("#dealer-hand .card").length,
    title: document.getElementById("dealer-title").textContent,
    readerTitle: document.querySelector("#dealer-reader .reader-title")?.textContent,
    focus: document.activeElement?.className,
  }));
  check("dealer:opens-from-timeline", dealerOpen.hidden === false && dealerOpen.cards === 1, JSON.stringify(dealerOpen));
  check("dealer:reader-rendered", Boolean(dealerOpen.readerTitle), `reader=${dealerOpen.readerTitle}`);

  if (CAPTURE) {
    await settle();
    await page.screenshot({ path: path.join(EVIDENCE, "keyframe-02-dealer-light.png"), fullPage: false });
  }

  await page.click("#dealer-close");
  await page.waitForTimeout(250);

  // Today's empty hand through the real rail.
  await page.evaluate(() => window.__ATLAS_STAGE__.selectDate("2026-11-01"));
  await page.waitForTimeout(250);
  const todayBand = await page.evaluate(() => ({
    title: document.querySelector("#edition-band .band-title")?.textContent,
    button: document.getElementById("open-edition").textContent.trim(),
    selected: document.querySelector('.rail-day[aria-selected="true"]')?.dataset.date,
  }));
  check("timeline:today-selected-empty-band", todayBand.selected === "2026-11-01" && todayBand.title?.includes("Today has no edition"), JSON.stringify(todayBand));
  check("timeline:empty-hand-label", todayBand.button === "Open the empty hand", todayBand.button);

  await page.click("#open-edition");
  await page.waitForTimeout(300);
  const emptyDealer = await page.evaluate(() => ({
    hidden: document.getElementById("dealer-backdrop").hidden,
    cards: document.querySelectorAll("#dealer-hand .card").length,
    empty: Boolean(document.querySelector("#dealer-hand .hand-empty")),
    title: document.querySelector("#dealer-reader .reader-title")?.textContent,
  }));
  check("dealer:today-empty-hand", emptyDealer.hidden === false && emptyDealer.cards === 0 && emptyDealer.empty, JSON.stringify(emptyDealer));
  if (CAPTURE) {
    await settle();
    await page.screenshot({ path: path.join(EVIDENCE, "state-empty-hand-light.png"), fullPage: false });
  }
  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);

  // Search narrows the field and opens the first match.
  await page.fill("#field-search", "shortcut");
  await page.waitForTimeout(250);
  const search = await page.evaluate(() => ({
    matches: document.querySelectorAll(".node.is-match").length,
    dimmed: document.querySelectorAll(".node.is-dim").length,
    summary: document.getElementById("field-summary").textContent,
  }));
  check("search:matches-shortcut", search.matches > 0, JSON.stringify(search));
  check("search:field-dims-non-matches", search.dimmed > 0, `dimmed=${search.dimmed}`);
  await page.press("#field-search", "Enter");
  await page.waitForTimeout(400);
  const searched = await state();
  check("search:enter-opens-first", Boolean(searched.conceptId), `concept=${searched.conceptId}`);
  await page.fill("#field-search", "");
  await page.waitForTimeout(200);

  // Compare, including a concept with no board.
  await stage(() => window.__ATLAS_STAGE__.setIntent("compare"));
  await page.waitForTimeout(250);
  const compare = await page.evaluate(() => ({
    board: Boolean(document.querySelector(".board")),
    select: document.getElementById("comparison-select")?.value,
    panel: document.querySelector("#context-content .panel-title")?.textContent,
  }));
  check("compare:board-rendered", compare.board, JSON.stringify(compare));

  await stage(() => window.__ATLAS_STAGE__.selectConcept("concept:stats:standard-error"));
  await page.waitForTimeout(300);
  const compareGap = await page.evaluate(() => ({
    note: document.querySelector("#context-content .panel-note")?.textContent,
    board: Boolean(document.querySelector(".board")),
  }));
  check("compare:no-board-state-is-honest", Boolean(compareGap.note) && compareGap.note.includes("No board includes it"), JSON.stringify(compareGap));

  // Apply coverage gap.
  await stage(() => window.__ATLAS_STAGE__.setIntent("apply"));
  await page.waitForTimeout(250);
  const apply = await page.evaluate(() => ({
    title: document.querySelector("#context-content .panel-title")?.textContent,
    empty: document.querySelector("#context-content .empty-copy")?.textContent,
    open: document.querySelectorAll("#context-content .apply-item").length,
  }));
  check("apply:standard-error-coverage-gap", apply.open === 0 && apply.empty?.includes("coverage gap"), JSON.stringify(apply));

  // Goal route and self-report.
  await stage(() => window.__ATLAS_STAGE__.setIntent("goal"));
  await page.waitForTimeout(250);
  const goal = await page.evaluate(() => ({
    steps: document.querySelectorAll(".route-step").length,
    title: document.querySelector("#context-content .panel-title")?.textContent,
    first: document.querySelector(".route-title-button")?.textContent,
    badges: document.querySelectorAll(".route-badge").length,
  }));
  check("goal:route-rendered", goal.steps >= 2 && Boolean(goal.title), JSON.stringify(goal));
  await page.click(".route-self button");
  await page.waitForTimeout(200);
  const self = await state();
  check("goal:self-report-is-local", Object.values(self.selfReported).some(Boolean), JSON.stringify(self.selfReported));
  await page.click(".route-self button");
  await page.waitForTimeout(150);

  // Pocket and thread.
  await stage(() => window.__ATLAS_STAGE__.setIntent("understand"));
  await stage(() => window.__ATLAS_STAGE__.selectConcept("concept:fabric:shortcut"));
  await page.waitForTimeout(250);
  await page.click('[data-act="toggle-pocket-concept"]');
  await page.waitForTimeout(200);
  const pocket = await page.evaluate(() => ({
    count: document.getElementById("pocket-count").textContent,
    expanded: document.getElementById("pocket-toggle").getAttribute("aria-expanded"),
  }));
  check("pocket:saves-concept", pocket.count === "1", JSON.stringify(pocket));
  await page.click("#pocket-toggle");
  await page.waitForTimeout(200);
  const pocketOpen = await page.evaluate(() => ({
    hidden: document.getElementById("pocket-panel").hidden,
    items: document.querySelectorAll(".pocket-item").length,
  }));
  check("pocket:opens-drawer", pocketOpen.hidden === false && pocketOpen.items === 1, JSON.stringify(pocketOpen));
  await page.click("#pocket-close");
  await page.waitForTimeout(150);
  const thread = await page.evaluate(() => ({
    count: document.getElementById("thread-count").textContent,
    chips: document.querySelectorAll(".thread-chip").length,
  }));
  check("thread:tracks-visited", Number(thread.count) >= 1 && thread.chips >= 1, JSON.stringify(thread));

  if (CAPTURE) {
    await page.evaluate(() => window.__ATLAS_STAGE__.selectConcept("concept:fabric:shortcut"));
    await jumpTo("scene-knowledge");
    await settle(400);
    await page.screenshot({ path: path.join(EVIDENCE, "keyframe-03-field-light.png"), fullPage: false });
  }

  // Theme and closing.
  await page.click("#theme-toggle");
  await page.waitForTimeout(250);
  const dark = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    pressed: document.getElementById("theme-toggle").getAttribute("aria-pressed"),
    meta: document.querySelector('meta[name="theme-color"]').content,
  }));
  check("theme:dark-preset", dark.theme === "dark" && dark.pressed === "true", JSON.stringify(dark));
  if (CAPTURE) {
    // Capture the same edition as the light keyframe so the pair compares like
    // with like. The empty-today state is captured separately below.
    await page.evaluate(() => {
      window.__ATLAS_STAGE__.selectDate("2026-11-01", { open: false, scroll: false });
    });
    await jumpTo("scene-timeline");
    await settle(350);
    await page.screenshot({ path: path.join(EVIDENCE, "state-empty-hand-dark.png"), fullPage: false });
    await page.evaluate(() => {
      window.__ATLAS_STAGE__.selectDate("2026-10-26", { open: false, scroll: false });
    });
    await settle(300);
    await page.screenshot({ path: path.join(EVIDENCE, "keyframe-04-timeline-dark.png"), fullPage: false });
    await page.evaluate(() => window.__ATLAS_STAGE__.openDealer("daily:2026-10-26"));
    await settle(350);
    await page.screenshot({ path: path.join(EVIDENCE, "keyframe-05-dealer-dark.png"), fullPage: false });
    await page.evaluate(() => window.__ATLAS_STAGE__.closeDealer());
    await settle(250);
    await page.evaluate(() => window.__ATLAS_STAGE__.selectConcept("concept:fabric:shortcut"));
    await jumpTo("scene-knowledge");
    await settle(450);
    await page.screenshot({ path: path.join(EVIDENCE, "keyframe-06-field-dark.png"), fullPage: false });
  }

  await jumpTo("scene-closing");
  await settle(350);
  const closing = await page.evaluate(() => ({
    ledger: document.querySelectorAll("#closing-ledger > div").length,
    idea: document.getElementById("closing-idea").textContent.trim().slice(0, 80),
    action: document.getElementById("closing-action").textContent.trim(),
  }));
  check("closing:ledger-rendered", closing.ledger >= 8, JSON.stringify(closing));
  if (CAPTURE) {
    await settle();
    await page.screenshot({ path: path.join(EVIDENCE, "detail-closing-dark.png"), fullPage: false });
  }

  await page.click("#closing-about");
  await page.waitForTimeout(250);
  const about = await page.evaluate(() => ({
    hidden: document.getElementById("about-backdrop").hidden,
    headings: document.querySelectorAll("#about-body h3").length,
    text: document.getElementById("about-body").textContent,
  }));
  check("about:coverage-note", about.hidden === false && about.headings >= 6 && about.text.includes("4,337"), JSON.stringify({ hidden: about.hidden, headings: about.headings }));
  if (CAPTURE) await page.screenshot({ path: path.join(EVIDENCE, "detail-about-dark.png"), fullPage: false });
  await page.keyboard.press("Escape");

  // Reduced motion: the same states, no transitions.
  const reduced = await context.newPage();
  await reduced.emulateMedia({ reducedMotion: "reduce" });
  await reduced.goto(`${PROTOTYPE}?theme=light&intent=compare`, { waitUntil: "load" });
  await reduced.waitForFunction(() => Boolean(window.__ATLAS_STAGE__), { timeout: 15000 });
  await reduced.waitForTimeout(400);
  const reducedState = await reduced.evaluate(() => ({
    intent: window.__ATLAS_STAGE__.getState().intent,
    board: Boolean(document.querySelector(".board")),
    behavior: getComputedStyle(document.documentElement).scrollBehavior,
  }));
  check("reduced-motion:state-intact", reducedState.intent === "compare" && reducedState.board, JSON.stringify(reducedState));
  await reduced.close();

  // URL state round trip.
  const deep = await context.newPage();
  await deep.goto(`${PROTOTYPE}?theme=dark&intent=goal&date=2026-10-24&concept=concept:fabric:shortcut&goal=goal:ia:reference-without-copy`, { waitUntil: "load" });
  await deep.waitForFunction(() => Boolean(window.__ATLAS_STAGE__), { timeout: 15000 });
  await deep.waitForTimeout(400);
  const deepState = await deep.evaluate(() => window.__ATLAS_STAGE__.getState());
  check("url:state-restored", deepState.intent === "goal" && deepState.date === "2026-10-24" && deepState.conceptId === "concept:fabric:shortcut", JSON.stringify(deepState));
  await deep.close();
} catch (error) {
  check("harness:completed", false, error.stack ?? String(error));
} finally {
  await browser.close();
}

const failed = results.filter((result) => result.status === "FAIL");
const report = {
  schemaVersion: "intelligent-atlas-browser-qa/3.1",
  generatedAt: new Date().toISOString(),
  target: PROTOTYPE,
  edge: "156.0.4314.58",
  viewport: "1440x960",
  summary: { total: results.length, passed: results.length - failed.length, failed: failed.length },
  consoleErrors,
  pageErrors,
  results,
};
await mkdir(EVIDENCE, { recursive: true });
await writeFile(path.join(EVIDENCE, "browser-qa-v31-core.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary));
for (const result of results) console.log(`${result.status} ${result.id} — ${result.detail}`);
process.exitCode = failed.length ? 1 : 0;
