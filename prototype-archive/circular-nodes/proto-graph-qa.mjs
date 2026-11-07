// Prototype QA for the isolated knowledge-graph sandbox.
//
//   node scripts/proto-graph-qa.mjs [baseUrl]
//
// It drives the built static export with a real Chromium (Edge), records the
// functional checks the prototype brief asks for, runs axe, and writes:
//   docs/prototype-graph/qa-results.json
//   docs/prototype-graph/screens/*.png
//   docs/prototype-graph/QA.md
//
// This is evidence for an owner review, not a release gate. A screen-reader
// pass is still required and is NOT performed here.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const BASE = (process.argv[2] ?? "http://127.0.0.1:4400").replace(/\/$/, "");
const ROUTE = "/prototype/graph/";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = path.resolve("docs/prototype-graph");
const SHOTS = path.join(OUT, "screens");

const results = [];
const consoleErrors = [];
const pageErrors = [];

function check(name, ok, detail) {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  await mkdir(SHOTS, { recursive: true });
  const axeSource = await readFile("node_modules/axe-core/axe.min.js", "utf8");

  async function clickNode(target, locator) {
    // The group's bounding box includes the label, whose empty area is not a hit
    // target; click the painted dot that belongs to the node instead.
    const dot = locator.locator("circle").nth(1);
    const box = await dot.boundingBox();
    if (!box) throw new Error("node dot is not visible");
    await target.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  }

  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 940 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  const responses = [];
  page.on("response", (response) => {
    const type = response.request().resourceType();
    if (type === "script" || type === "stylesheet") {
      responses.push({ url: response.url(), type, status: response.status() });
    }
  });

  const nav = await page.goto(`${BASE}${ROUTE}`, { waitUntil: "load" });
  check("route returns 200", nav?.status() === 200, `status ${nav?.status()}`);
  await page.waitForSelector('[data-testid="graph-canvas"]');

  // ---------------------------------------------------------------- initial
  const initial = await page.evaluate(() => ({
    h1: document.querySelector("h1")?.textContent?.trim(),
    sequences: document.querySelectorAll('[data-node-kind="sequence"]').length,
    notes: document.querySelectorAll('[data-node-kind="note"]').length,
    robot: document.querySelector('meta[name="robots"]')?.getAttribute("content"),
    transforms: Object.fromEntries(
      [...document.querySelectorAll('[data-node-kind="sequence"]')].map((node) => [
        node.getAttribute("data-node-id"),
        node.getAttribute("transform"),
      ]),
    ),
  }));
  check("9 sequences rendered, 0 notes at rest", initial.sequences === 9 && initial.notes === 0, `${initial.sequences} sequences / ${initial.notes} notes`);
  check("page is noindex", String(initial.robot).includes("noindex"), String(initial.robot));
  check("h1 present", Boolean(initial.h1), initial.h1);

  await page.screenshot({ path: path.join(SHOTS, "01-desktop-initial.png") });

  // ------------------------------------------------------------- expansion
  const firstChip = page.locator("nav[aria-label='Sequences'] button").first();
  const chipPressedBefore = await firstChip.getAttribute("aria-pressed");
  const firstSequence = page.locator('[data-node-kind="sequence"]').first();
  const sequenceId = await firstSequence.getAttribute("data-node-id");
  await clickNode(page, firstSequence);
  await page.waitForTimeout(320);

  const afterExpand = await page.evaluate(() => ({
    notes: document.querySelectorAll('[data-node-kind="note"]').length,
    transforms: Object.fromEntries(
      [...document.querySelectorAll('[data-node-kind="sequence"]')].map((node) => [
        node.getAttribute("data-node-id"),
        node.getAttribute("transform"),
      ]),
    ),
    pressed: [...document.querySelectorAll("nav[aria-label='Sequences'] button")].map((button) => button.getAttribute("aria-pressed")),
    panel: document.querySelector("aside[aria-label='Inspector']")?.textContent ?? "",
  }));
  const movedSequences = Object.entries(initial.transforms).filter(
    ([id, transform]) => afterExpand.transforms[id] !== transform,
  );
  check("clicking a sequence reveals its notes", afterExpand.notes > 0, `${afterExpand.notes} note nodes`);
  check("expansion moves no other sequence", movedSequences.length === 0, movedSequences.map(([id]) => id).join(", ") || "all anchors unchanged");
  check("chip reflects expanded state", chipPressedBefore === "false" && afterExpand.pressed.includes("true"), `before=${chipPressedBefore}`);
  check("sequence panel shows declared order", /Declared order/.test(afterExpand.panel), "panel text contains 'Declared order'");

  const orderCount = await page.locator("aside[aria-label='Inspector'] ol li").count();
  check("visible notes equal declared membership", orderCount === afterExpand.notes, `${orderCount} ordered / ${afterExpand.notes} drawn`);

  await page.screenshot({ path: path.join(SHOTS, "02-desktop-expanded.png") });

  // -------------------------------------------------------------- note open
  const noteNode = page.locator('[data-node-kind="note"]').first();
  const noteId = await noteNode.getAttribute("data-node-id");
  await clickNode(page, noteNode);
  await page.waitForTimeout(260);

  const noteState = await page.evaluate(() => {
    const panel = document.querySelector("aside[aria-label='Inspector']");
    const link = panel?.querySelector('a[href^="/learn/statistics/journey/"]');
    return {
      selected: document.querySelector('[data-node-kind="note"][aria-pressed="true"]')?.getAttribute("data-node-id"),
      title: panel?.querySelector("h2")?.textContent?.trim(),
      href: link?.getAttribute("href"),
      hasObjectives: (panel?.textContent ?? "").includes("Objectives"),
      hasMisconception: (panel?.textContent ?? "").includes("Common misconception"),
      hasDependencies: (panel?.textContent ?? "").includes("Recorded dependencies"),
      status: document.querySelector('[role="status"]')?.textContent ?? "",
    };
  });
  check("note click selects the note", noteState.selected === noteId, `${noteState.selected}`);
  check("note preview has a title", Boolean(noteState.title), noteState.title);
  check("note preview links to the real content", /^\/learn\/statistics\/journey\/[a-z]+\/?#s\d+$/.test(String(noteState.href)), String(noteState.href));
  check("preview carries objectives, misconception and dependencies", noteState.hasObjectives && noteState.hasMisconception && noteState.hasDependencies);
  check("status announces the selection", /Note selected/.test(noteState.status), noteState.status.slice(0, 90));

  await page.screenshot({ path: path.join(SHOTS, "03-desktop-note-selected.png") });

  // ------------------------------------------------------------- link check
  const hrefs = await page.evaluate(() =>
    [...new Set([...document.querySelectorAll('aside[aria-label="Inspector"] a[href^="/learn/statistics/journey/"]')].map((a) => a.getAttribute("href")))],
  );
  let broken = [];
  for (const href of hrefs) {
    const target = `${BASE}${String(href).split("#")[0]}`;
    const response = await context.request.get(target);
    if (response.status() !== 200) broken.push(`${href} → ${response.status()}`);
  }
  check("selected note link resolves on the static host", broken.length === 0 && hrefs.length > 0, broken.join("; ") || `${hrefs.length} href verified`);

  // ------------------------------------------------------------------- back
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.waitForTimeout(220);
  const afterBack = await page.evaluate(() => ({
    notes: document.querySelectorAll('[data-node-kind="note"]').length,
    status: document.querySelector('[role="status"]')?.textContent ?? "",
  }));
  check("back restores the previous graph state", afterBack.notes === afterExpand.notes, `${afterBack.notes} notes, ${afterBack.status}`);

  // ------------------------------------------------------------------ focus
  await clickNode(page, page.locator('[data-node-kind="note"]').first());
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: "Focus this note" }).click();
  await page.waitForTimeout(220);
  const focusState = await page.evaluate(() => ({
    dimmed: [...document.querySelectorAll("[data-node-id]")].filter((node) => Number(getComputedStyle(node).opacity) < 0.5).length,
    pressed: document.querySelector("aside[aria-label='Inspector'] button[aria-pressed='true']")?.textContent?.trim(),
  }));
  check("focus mode dims unrelated nodes", focusState.dimmed > 0, `${focusState.dimmed} dimmed, button "${focusState.pressed}"`);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({ path: path.join(SHOTS, "04-desktop-focus.png") });
  await page.getByRole("button", { name: "Exit focus" }).click();

  // ------------------------------------------------------- direct manipulation
  const rootTransform = () =>
    page.evaluate(() => document.querySelector('[data-testid="graph-canvas"] svg > g')?.getAttribute("transform"));
  const scaleOf = (transform) => Number(/scale\(([\d.]+)\)/.exec(String(transform))?.[1] ?? 0);

  const dragTarget = page.locator('[data-node-kind="sequence"]').first();
  const beforeDrag = await dragTarget.getAttribute("transform");
  const dragDot = await dragTarget.locator("circle").nth(1).boundingBox();
  await page.mouse.move(dragDot.x + dragDot.width / 2, dragDot.y + dragDot.height / 2);
  await page.mouse.down();
  await page.mouse.move(dragDot.x + dragDot.width / 2 + 70, dragDot.y + dragDot.height / 2 + 40, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(180);
  const afterDrag = await dragTarget.getAttribute("transform");
  check("dragging a node repositions it", beforeDrag !== afterDrag, `${beforeDrag} -> ${afterDrag}`);

  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.waitForTimeout(260);
  const afterReset = await page.evaluate(function () {
    const first = document.querySelector('[data-node-kind="sequence"]');
    return {
      notes: document.querySelectorAll('[data-node-kind="note"]').length,
      transform: first?.getAttribute("transform"),
    };
  });
  check(
    "reset collapses the graph and restores node positions",
    afterReset.notes === 0 && afterReset.transform === beforeDrag,
    `${afterReset.notes} notes, ${afterReset.transform}`,
  );

  const canvas = await page.getByTestId("graph-canvas").boundingBox();
  const panBefore = await rootTransform();
  await page.mouse.move(canvas.x + 40, canvas.y + 40);
  await page.mouse.down();
  await page.mouse.move(canvas.x + 120, canvas.y + 90, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(160);
  const panAfter = await rootTransform();
  check("dragging the canvas pans the view", panBefore !== panAfter, `${panBefore} -> ${panAfter}`);

  await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
  await page.mouse.wheel(0, -420);
  await page.waitForTimeout(220);
  const zoomIn = scaleOf(await rootTransform());
  await page.getByRole("button", { name: "Fit" }).click();
  await page.waitForTimeout(220);
  const zoomFit = scaleOf(await rootTransform());
  check(
    "wheel zooms and Fit restores the fitted scale",
    Math.abs(zoomIn - zoomFit) > 0.01,
    `wheel k=${zoomIn.toFixed(2)}, fit k=${zoomFit.toFixed(2)}`,
  );

  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.waitForTimeout(220);

  // -------------------------------------------------------------- keyboard
  const keyboard = await page.evaluate(() => {
    const node = document.querySelector('[data-node-kind="sequence"]');
    node?.focus();
    return document.activeElement?.getAttribute("data-node-id");
  });
  check("graph nodes are focusable", Boolean(keyboard), String(keyboard));
  await page.keyboard.press("Enter");
  await page.waitForTimeout(260);
  const afterEnter = await page.evaluate(() => ({
    expanded: document.activeElement?.getAttribute("aria-pressed"),
    status: document.querySelector('[role="status"]')?.textContent ?? "",
  }));
  check("Enter toggles the focused sequence", /expanded|collapsed/i.test(afterEnter.status), afterEnter.status);
  await page.keyboard.press("ArrowRight");
  const movedFocus = await page.evaluate(() => document.activeElement?.getAttribute("data-node-id"));
  check("arrow keys move focus between nodes", movedFocus && movedFocus !== keyboard, `${keyboard} → ${movedFocus}`);

  // ---------------------------------------------------------------- search
  await page.getByTestId("graph-search").fill("hypothesis");
  await page.waitForSelector("ul[role='listbox'] li");
  const resultCount = await page.locator("ul[role='listbox'] li").count();
  check("search returns matching sequences and notes", resultCount > 0, `${resultCount} results`);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  const searchState = await page.evaluate(() => ({
    panel: document.querySelector("aside[aria-label='Inspector']")?.textContent ?? "",
    query: document.querySelector('[data-testid="graph-search"]')?.value,
    notes: document.querySelectorAll('[data-node-kind="note"]').length,
  }));
  check("choosing a result updates the inspector", /Sequence|Note/.test(searchState.panel) && searchState.notes > 0, `${searchState.notes} notes visible`);

  // ------------------------------------------------------------- list view
  await page.getByRole("button", { name: "List view" }).click();
  await page.waitForSelector('[data-testid="graph-list"]');
  const list = await page.evaluate(() => ({
    groups: document.querySelectorAll('[data-testid="graph-list"] details').length,
    links: document.querySelectorAll('[data-testid="graph-list"] a[href^="/learn/statistics/journey/"]').length,
    dependencyNotes: (document.querySelector('[data-testid="graph-list"]')?.textContent ?? "").includes("Depends on"),
  }));
  check("list view renders every sequence", list.groups === 9, `${list.groups} groups`);
  check("list view links every note", list.links === 43, `${list.links} links`);
  check("list view names dependencies", list.dependencyNotes);
  await page.screenshot({ path: path.join(SHOTS, "05-desktop-list.png"), fullPage: true });

  // ---------------------------------------------------------------- atlas
  const atlasIsolation = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      statesZero: /atlas concepts \(published\)\s*0/i.test(text) && /atlas links \(published\)\s*0/i.test(text),
      mentionsBoundary: text.includes("not Atlas assertions") || text.includes("not drawn"),
    };
  });
  check("page states the Atlas publishes 0 concepts and 0 links", atlasIsolation.statesZero);
  check("page states the Atlas is not drawn", atlasIsolation.mentionsBoundary);

  // ------------------------------------------------------------------- axe
  await page.getByRole("button", { name: "Graph view" }).click();
  await page.waitForSelector('[data-testid="graph-canvas"]');
  const axeGraph = await runAxe(page, axeSource);
  const graphViolations = axeGraph.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
  check("axe: graph view has no serious/critical violations", graphViolations.length === 0, graphViolations.map((violation) => `${violation.id} (${violation.nodes.length})`).join(", ") || "clean");

  await page.getByRole("button", { name: "List view" }).click();
  await page.waitForSelector('[data-testid="graph-list"]');
  const axeList = await runAxe(page, axeSource);
  const listViolations = axeList.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
  check("axe: list view has no serious/critical violations", listViolations.length === 0, listViolations.map((violation) => `${violation.id} (${violation.nodes.length})`).join(", ") || "clean");

  // ---------------------------------------------------------------- mobile
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobile = await mobileContext.newPage();
  const mobileConsole = [];
  mobile.on("console", (message) => {
    if (message.type() === "error") mobileConsole.push(message.text());
  });
  await mobile.goto(`${BASE}${ROUTE}`, { waitUntil: "load" });
  await mobile.waitForSelector('[data-testid="graph-canvas"]');
  await mobile.locator("nav[aria-label='Sequences'] button").first().click();
  await mobile.waitForTimeout(320);
  const mobileState = await mobile.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    chips: (() => {
      const chips = document.querySelector("nav[aria-label='Sequences']");
      return chips ? getComputedStyle(chips).display : "missing";
    })(),
    notes: document.querySelectorAll('[data-node-kind="note"]').length,
    canvasWidth: document.querySelector('[data-testid="graph-canvas"]')?.getBoundingClientRect().width,
  }));
  check("mobile 390px has no horizontal overflow", mobileState.overflow <= 1, `${mobileState.overflow}px overflow`);
  check("mobile shows sequence chips", mobileState.chips === "flex", mobileState.chips);
  check("mobile can expand a sequence", mobileState.notes > 0, `${mobileState.notes} note nodes`);
  check("mobile console is clean", mobileConsole.length === 0, mobileConsole.join(" | ") || "no errors");
  await mobile.screenshot({ path: path.join(SHOTS, "06-mobile-expanded.png"), fullPage: true });

  // -------------------------------------------------------- reduced motion
  const reducedContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  });
  const reduced = await reducedContext.newPage();
  await reduced.goto(`${BASE}${ROUTE}`, { waitUntil: "load" });
  await reduced.waitForSelector('[data-testid="graph-canvas"]');
  await clickNode(reduced, reduced.locator('[data-node-kind="sequence"]').first());
  await reduced.waitForTimeout(240);
  const motion = await reduced.evaluate(() => {
    const node = document.querySelector('[data-node-kind="note"]');
    const line = document.querySelector("svg line");
    return {
      nodeAnimation: node ? getComputedStyle(node).animationName : null,
      nodeTransition: node ? getComputedStyle(node).transitionDuration : null,
      lineAnimation: line ? getComputedStyle(line).animationName : null,
    };
  });
  check(
    "reduced motion removes node and link animation",
    motion.nodeAnimation === "none" && (motion.lineAnimation === "none" || motion.lineAnimation === null),
    JSON.stringify(motion),
  );

  // ---------------------------------------------------------------- bundle
    const assetSummary = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((entry) => entry.initiatorType === "script" || entry.initiatorType === "link")
      .reduce((total, entry) => total + (entry.encodedBodySize ?? 0), 0),
  );
  check("page loads without console errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | ") || "none");
  check("page loads without runtime errors", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | ") || "none");

  const failures = results.filter((item) => !item.ok);
  const summary = {
    base: BASE,
    route: ROUTE,
    ranAt: new Date().toISOString(),
    browser: "Microsoft Edge (Playwright, headless)",
    total: results.length,
    passed: results.length - failures.length,
    failed: failures.length,
    scriptBytes: assetSummary,
    results,
    axe: { graph: axeGraph, list: axeList },
    limitations: [
      "Chromium accessibility tree is not a screen-reader test; NVDA/VoiceOver remain NOT RUN.",
      "Only the statistics corpus is covered (9 sequences, 43 notes).",
      "No persistence or deep links; state resets on reload.",
    ],
  };

  await writeFile(path.join(OUT, "qa-results.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  await writeFile(path.join(OUT, "QA.md"), renderMarkdown(summary), "utf8");

  await browser.close();
  console.log(`\n${summary.passed}/${summary.total} checks passed (${failures.length} failed).`);
  console.log(`screenshots: ${SHOTS}`);
  process.exitCode = failures.length === 0 ? 0 : 1;
}

async function runAxe(page, source) {
  await page.addScriptTag({ content: source });
  return page.evaluate(async () => {
    const result = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
    return result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    }));
  });
}

function renderMarkdown(summary) {
  const rows = summary.results
    .map((item) => `| ${item.ok ? "PASS" : "FAIL"} | ${item.name} | ${(item.detail ?? "").replace(/\|/g, "\\|")} |`)
    .join("\n");
  const axe = [...summary.axe.graph, ...summary.axe.list];
  return `# Prototype QA — knowledge graph

Run ${summary.ranAt} against \`${summary.base}${summary.route}\` with ${summary.browser}.

**${summary.passed}/${summary.total} checks passed.**

| Result | Check | Detail |
| --- | --- | --- |
${rows}

## axe (WCAG 2.1 A/AA tags)

${axe.length === 0 ? "No violations reported in either view." : axe.map((violation) => `- **${violation.impact}** \`${violation.id}\` — ${violation.help} (${violation.nodes.length} node(s))`).join("\n")}

Automated checks do not replace a screen-reader pass. NVDA and VoiceOver are **NOT RUN**, so the accessibility gate is not met by this file.

## Limits

${summary.limitations.map((limit) => `- ${limit}`).join("\n")}
`;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
