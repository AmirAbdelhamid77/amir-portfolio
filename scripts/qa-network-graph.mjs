// SUPERSEDED — do not run as current QA.
//
// The map at /prototype/network/ was replaced by the radial tree explorer on
// 2026-11-06. This script still targets the retired `.kng` component, so its
// selectors and expected counts no longer describe the learner route. Current
// QA is scripts/qa-network-tree.mjs (`npm run qa:network`).
//
// Kept only as evidence of the old implementation. The same file is archived
// under prototype-archive/global-hairball/ with the old component and report.
//
// Browser QA for the retired source-derived knowledge network prototype.
//
//   node scripts/qa-network-graph.mjs [--base http://127.0.0.1:4400]
//
// Drives the installed Microsoft Edge through playwright-core against a static
// build that is already being served. It checks the real dataset counts, the
// layer defaults, provenance, local graph, list fallback, Atlas gate, keyboard
// movement, reduced motion and a 390px viewport, then writes screenshots and a
// JSON report under docs/prototype-graph/. No network access, nothing mutated.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const args = process.argv.slice(2);
const baseIndex = args.indexOf("--base");
const BASE = (baseIndex === -1 ? "http://127.0.0.1:4400" : args[baseIndex + 1]).replace(/\/$/, "");
const URL = `${BASE}/prototype/network/`;
const EVIDENCE = path.resolve("docs/prototype-graph/screens");
const REPORT = path.resolve("docs/prototype-graph/qa-browser.json");

await mkdir(EVIDENCE, { recursive: true });
const axeSource = await readFile(path.resolve("node_modules/axe-core/axe.min.js"), "utf8");

const checks = [];
const consoleErrors = [];
const check = (name, pass, detail = "") => {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch({ executablePath: EDGE, headless: true });

async function attach(page) {
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));
}

async function axe(page) {
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async () => {
    // @ts-expect-error injected at runtime
    const run = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
    });
    return run.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
      help: violation.help,
      target: violation.nodes[0]?.target,
    }));
  });
  return result;
}

// ----------------------------------------------------------------- desktop pass
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await context.newPage();
await attach(page);
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForSelector(".kng-node", { timeout: 30000 });

const dataset = await page.evaluate(async () => (await fetch("/graph/dataset.json")).json());

// Dataset integrity: arithmetic and dangling ends, before trusting the drawing.
const ids = new Set(dataset.nodes.map((node) => node.id));
const dangling = dataset.edges.filter((edge) => !ids.has(edge.from) || !ids.has(edge.to));
const unitCount = Object.values(dataset.stats.subjectUnits).reduce((total, value) => total + value, 0);
check("dataset loads", dataset.nodes.length === 1105 && dataset.edges.length === 4746, `${dataset.nodes.length} nodes / ${dataset.edges.length} edges`);
check("no dangling edges", dangling.length === 0, `${dangling.length} dangling`);
check("no Atlas relation in the payload", dataset.edges.every((edge) => edge.layer !== "review"), "layer=review count 0");
check("Atlas public gate is 0/0", dataset.stats.atlas.publishedConcepts === 0 && dataset.stats.atlas.publishedEdges === 0, `${dataset.stats.atlas.publishedConcepts}/${dataset.stats.atlas.publishedEdges}`);
check("review totals are reported, not drawn", dataset.stats.atlas.reviewConcepts === 42 && dataset.stats.atlas.reviewEdges === 49, `${dataset.stats.atlas.reviewConcepts}/${dataset.stats.atlas.reviewEdges}`);
check("unit total", unitCount === 824, String(unitCount));

const drawn = await page.evaluate(() => ({
  nodes: document.querySelectorAll(".kng-node").length,
  edges: document.querySelectorAll(".kng-edge").length,
  candidateEdges: document.querySelectorAll(".kng-edge--lexical").length,
  labels: document.querySelectorAll(".kng-label").length,
  status: document.querySelector(".kng-status")?.textContent ?? "",
  size: document.querySelector('[data-testid="graph-canvas"]')?.getAttribute("data-size"),
}));
check("default view draws units + documents", drawn.nodes === 1047, `${drawn.nodes} nodes`);
check("default view draws declared edges only", drawn.edges === 1527 && drawn.candidateEdges === 0, `${drawn.edges} edges, ${drawn.candidateEdges} candidate`);
check("canvas is measured", drawn.size === "1440x680" || /^\d+x\d+$/.test(drawn.size ?? "") && !drawn.size.startsWith("0x"), drawn.size);
check("status states the corpus size", drawn.status.includes("824 content units") && drawn.status.includes("223 documents"), drawn.status);

// Declared layer is on, candidates/derived/structure are off by default.
const defaults = await page.evaluate(() =>
  [...document.querySelectorAll(".kng-check")].map((label) => ({
    text: label.querySelector("strong")?.textContent,
    checked: label.querySelector("input")?.checked,
  })),
);
const declared = defaults.find((entry) => entry.text === "Declared");
const candidate = defaults.find((entry) => entry.text === "Candidate");
const derived = defaults.find((entry) => entry.text === "Derived");
const structure = defaults.find((entry) => entry.text === "Structure");
check("declared on by default", declared?.checked === true);
check("candidate off by default", candidate?.checked === false);
check("derived off by default", derived?.checked === false);
check("containers off by default", structure?.checked === false);

await page.screenshot({ path: path.join(EVIDENCE, "01-global.png"), fullPage: true });

// Candidate layer: 187 inferred pairs appear, each tagged candidate.
await page.getByRole("checkbox", { name: /Candidate/ }).check();
await page.waitForTimeout(250);
const candidateView = await page.evaluate(() => ({
  candidate: document.querySelectorAll(".kng-edge--lexical").length,
  total: document.querySelectorAll(".kng-edge").length,
}));
check("candidate layer draws 187 inferred pairs", candidateView.candidate === 187, `${candidateView.candidate} / ${candidateView.total}`);
await page.getByRole("checkbox", { name: /Candidate/ }).uncheck();

// Search + selection: inspector must show provenance from the dataset.
await page.fill("#kng-query", "lakehouse");
await page.waitForTimeout(150);
const matchText = await page.textContent(".kng-count");
check("search reports matches", /match/.test(matchText ?? ""), matchText ?? "");
await page.press("#kng-query", "Enter");
await page.waitForTimeout(300);
const inspector = await page.evaluate(() => ({
  title: document.querySelector(".kng-inspect h2")?.textContent ?? "",
  layers: [...document.querySelectorAll(".kng-rel .kng-layer")].map((node) => node.textContent),
  pointers: [...document.querySelectorAll(".kng-rel code")].map((node) => node.textContent).slice(0, 4),
  href: document.querySelector("a.kng-open")?.getAttribute("href") ?? "",
  relations: document.querySelectorAll(".kng-rel li").length,
}));
check("selection opens the inspector", inspector.title.length > 0, inspector.title);
check("relationships carry a layer tag", inspector.layers.length > 0 && inspector.layers.every((layer) => ["Declared", "Derived", "Candidate", "Structure"].includes(layer ?? "")), inspector.layers.slice(0, 4).join(", "));
check("declared relations cite a pointer", inspector.pointers.some((pointer) => pointer && pointer.includes("#")), inspector.pointers[0] ?? "");
check("provenance href is offered", inspector.href.length > 0, inspector.href);
check("inspector lists relations", inspector.relations > 0, `${inspector.relations} shown`);
await page.screenshot({ path: path.join(EVIDENCE, "02-selection.png"), fullPage: true });

// A content unit must link back into the site, not out to the cited document.
await page.evaluate(() => {
  const unit = document.querySelector(".kng-node--unit");
  unit?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
});
await page.waitForTimeout(250);
const unitInspector = await page.evaluate(() => ({
  title: document.querySelector(".kng-inspect h2")?.textContent ?? "",
  href: document.querySelector("a.kng-open")?.getAttribute("href") ?? "",
  kinds: [...document.querySelectorAll(".kng-rel em")].map((node) => node.textContent),
}));
check("a content unit links back into Hansa", unitInspector.href.startsWith("/"), unitInspector.href);
check("unit relations include declared citations", unitInspector.kinds.some((kind) => /cites|derived from|prerequisite/.test(kind ?? "")), unitInspector.kinds.slice(0, 4).join(", "));

// Local graph: BFS from the selection, 1 and 2 hops.
await page.getByRole("button", { name: "Local", exact: true }).click();
await page.waitForTimeout(400);
const local1 = await page.evaluate(() => ({
  tag: document.querySelector(".kng-modeTag")?.textContent ?? "",
  nodes: document.querySelectorAll(".kng-node").length,
}));
check("local graph (1 hop) is anchored", local1.tag.includes("Local graph") && local1.nodes > 0 && local1.nodes < 100, `${local1.nodes} nodes`);
await page.selectOption(".kng-field select", "2");
await page.waitForTimeout(500);
const local2 = await page.evaluate(() => ({
  tag: document.querySelector(".kng-modeTag")?.textContent ?? "",
  nodes: document.querySelectorAll(".kng-node").length,
}));
check("2 hops reveal more than 1 hop", local2.nodes >= local1.nodes && local2.tag.includes("depth 2"), `${local1.nodes} → ${local2.nodes}`);
await page.screenshot({ path: path.join(EVIDENCE, "03-local-depth2.png"), fullPage: true });

// Back to global, enable containers, then source documents.
await page.getByRole("button", { name: "Global", exact: true }).first().click();
await page.getByRole("checkbox", { name: /Structure/ }).check();
await page.waitForTimeout(400);
const structureView = await page.evaluate(() => ({
  packs: document.querySelectorAll(".kng-node--pack").length,
  subjects: document.querySelectorAll(".kng-node--subject").length,
  journeys: document.querySelectorAll(".kng-node--journey").length,
  edges: document.querySelectorAll(".kng-edge--contains").length,
}));
check("containers appear from declared membership", structureView.packs === 27 && structureView.subjects === 8 && structureView.journeys === 9, `${structureView.packs} packs / ${structureView.subjects} subjects / ${structureView.journeys} journeys`);
check("containment edges are drawn", structureView.edges === 875, `${structureView.edges} contains edges`);
await page.screenshot({ path: path.join(EVIDENCE, "04-containers.png"), fullPage: true });
await page.getByRole("checkbox", { name: /Structure/ }).uncheck();

await page.getByRole("checkbox", { name: /Source documents/ }).uncheck();
await page.waitForTimeout(300);
const withoutDocs = await page.locator(".kng-node").count();
check("hiding documents leaves the units", withoutDocs === 824, `${withoutDocs} nodes`);
await page.getByRole("checkbox", { name: /Source documents/ }).check();

// List fallback: same corpus, text only.
await page.getByRole("tab", { name: "List" }).click();
await page.waitForTimeout(300);
const list = await page.evaluate(() => {
  const groups = [...document.querySelectorAll(".kng-listGroup h3 button")];
  return { groups: groups.length, first: groups[0]?.textContent ?? "", text: document.querySelector(".kng-list")?.textContent ?? "" };
});
check("list view groups the corpus", list.groups >= 8, `${list.groups} groups`);
check("list view states the Atlas gate", list.text.includes("0 published concepts / 0 links"), "0/0 present");
await page.screenshot({ path: path.join(EVIDENCE, "05-list.png"), fullPage: true });
await page.getByRole("tab", { name: "Graph" }).click();

// Keyboard: arrows move focus between drawn nodes.
await page.evaluate(() => document.querySelector(".kng-node")?.focus());
const keyboard = await page.evaluate(async () => {
  const before = document.activeElement?.getAttribute("aria-label");
  const event = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true });
  document.activeElement?.dispatchEvent(event);
  await new Promise((resolve) => setTimeout(resolve, 250));
  return { before, after: document.activeElement?.getAttribute("aria-label") };
});
check("arrow keys move between nodes", Boolean(keyboard.after) && keyboard.before !== keyboard.after, `${keyboard.before?.slice(0, 24)} → ${keyboard.after?.slice(0, 24)}`);

// Atlas gate text on the graph screen.
const atlasText = await page.textContent(".kng-atlas");
check("Atlas gate prints published 0/0", atlasText?.includes("Published: 0 concepts / 0 links"), atlasText?.replace(/\s+/g, " ").slice(0, 90));

const violations = await axe(page);
check("axe WCAG 2 A/AA has no violations", violations.length === 0, violations.map((violation) => `${violation.id}(${violation.nodes})`).join(", "));

await context.close();

// --------------------------------------------------------- mobile + reduced motion
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", isMobile: true, hasTouch: true });
const mobilePage = await mobile.newPage();
await attach(mobilePage);
await mobilePage.goto(URL, { waitUntil: "networkidle" });
await mobilePage.waitForSelector(".kng-node", { timeout: 30000 });
const mobileState = await mobilePage.evaluate(() => {
  const canvas = document.querySelector('[data-testid="graph-canvas"]');
  const svg = document.querySelector(".kng-svg");
  const rect = canvas?.getBoundingClientRect();
  return {
    size: canvas?.getAttribute("data-size"),
    viewBox: svg?.getAttribute("viewBox"),
    nodes: document.querySelectorAll(".kng-node").length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    canvasWidth: Math.round(rect?.width ?? 0),
    transition: getComputedStyle(document.querySelector(".kng-node")).transitionDuration,
  };
});
check("390px viewport renders the graph", mobileState.nodes > 1000 && mobileState.canvasWidth <= 390 && !(mobileState.size ?? "").startsWith("0x"), `${mobileState.nodes} nodes at ${mobileState.size}`);
check("no horizontal overflow at 390px", mobileState.overflow <= 0, `${mobileState.overflow}px`);
check("reduced motion removes node transitions", parseFloat(mobileState.transition) <= 0.01, mobileState.transition);
await mobilePage.screenshot({ path: path.join(EVIDENCE, "06-mobile.png"), fullPage: true });
const mobileViolations = await axe(mobilePage);
check("axe on mobile has no violations", mobileViolations.length === 0, mobileViolations.map((violation) => `${violation.id}(${violation.nodes})`).join(", "));
await mobile.close();

await browser.close();

const failed = checks.filter((entry) => !entry.pass);
const report = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  url: URL,
  viewport: { desktop: "1440x1000", mobile: "390x844" },
  dataset: {
    nodes: dataset.nodes.length,
    edges: dataset.edges.length,
    layers: dataset.stats.edgeLayers,
    islands: dataset.stats.islands.length,
    modularity: dataset.stats.modularity,
    atlas: dataset.stats.atlas,
  },
  checks,
  consoleErrors,
  screenshots: [
    "01-global.png",
    "02-selection.png",
    "03-local-depth2.png",
    "04-containers.png",
    "05-list.png",
    "06-mobile.png",
  ],
  axe: { desktop: violations, mobile: mobileViolations },
  summary: { total: checks.length, passed: checks.length - failed.length, failed: failed.length },
};
await writeFile(REPORT, JSON.stringify(report, null, 2));
console.log(`\n${report.summary.passed}/${report.summary.total} checks passed. Report: ${REPORT}`);
if (consoleErrors.length) console.log(`Console errors: ${consoleErrors.length}`, consoleErrors.slice(0, 5));
process.exit(failed.length || consoleErrors.length ? 1 : 0);
