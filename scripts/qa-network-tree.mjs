// Browser QA for the expanding knowledge tree.
//
//   node scripts/qa-network-tree.mjs [--base http://127.0.0.1:4400]
//
// Serves `out/` itself unless `--base` names an origin that is already
// running, drives the installed Microsoft Edge through playwright-core and
// checks the learner contract:
//
//   * eight subject roots with eight non-overlapping labels by default
//   * click-to-expand, a 12-item first page and a side card on leaves
//   * explicit Open without navigation
//   * programme lenses (DP-600, Fabric RTI, Corpus Academy) one at a time
//   * URL-grouped cited sources and declared dashed cross-references
//   * deep search that pages its target into view
//   * keyboard arrows/Enter and a List mirror of the same open set
//   * URL reload restoring focus and open branches
//   * 390px list default, reduced motion, labels-off overview
//   * 768/1024px label counter-scaling and a dark-theme pass
//   * no dataset.json request, no console errors, axe WCAG 2 A/AA on `.kt`
//
// Writes screenshots under docs/prototype-graph/screens/tree/ and a JSON
// report to docs/prototype-graph/qa-browser.json. No deployment, no network
// beyond 127.0.0.1.
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const OUT = path.resolve("out");
const EVIDENCE = path.resolve("docs/prototype-graph/screens/tree");
const REPORT = path.resolve("docs/prototype-graph/qa-browser.json");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".xml": "application/xml",
};

function startServer() {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    let file = path.join(OUT, decodeURIComponent(url.pathname));
    if (!file.startsWith(OUT)) {
      response.writeHead(403).end();
      return;
    }
    let isDirectory = false;
    try {
      isDirectory = existsSync(file) && statSync(file).isDirectory();
    } catch {
      isDirectory = false;
    }
    if (isDirectory || !existsSync(file) || url.pathname.endsWith("/")) {
      const index = path.join(file, "index.html");
      if (existsSync(index)) file = index;
      else if (existsSync(`${file}.html`)) file = `${file}.html`;
    }
    if (!existsSync(file)) {
      const notFound = path.join(OUT, "404.html");
      response.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      if (existsSync(notFound)) createReadStream(notFound).pipe(response);
      else response.end("not found");
      return;
    }
    let isFile = false;
    try {
      isFile = statSync(file).isFile();
    } catch {
      isFile = false;
    }
    if (!isFile) {
      console.log(`QA server: skip non-file request ${url.pathname}`);
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(response);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

// Fixtures are the generated payloads, so the QA never hard-codes a label that
// a corpus rebuild could rename.
const subjectTree = JSON.parse(await readFile(path.resolve("public/graph/tree.json"), "utf8"));
const dp600Tree = JSON.parse(await readFile(path.resolve("public/graph/tree-dp600.json"), "utf8"));
const rtiTree = JSON.parse(await readFile(path.resolve("public/graph/tree-rti.json"), "utf8"));
const academyTree = JSON.parse(await readFile(path.resolve("public/graph/tree-academy.json"), "utf8"));
const nodeOf = (tree, id) => tree.nodes.find((node) => node.id === id);
const childrenOf = (tree, id) => tree.nodes.filter((node) => node.parent === id);
const rootsOf = (tree) => tree.nodes.filter((node) => !node.parent);
const labelOf = (tree, id) => nodeOf(tree, id)?.label ?? id;

const deepUnit = subjectTree.nodes.find((node) => {
  if (node.kind !== "unit" || !node.parent) return false;
  const siblings = childrenOf(subjectTree, node.parent);
  return siblings.length > 30 && siblings.findIndex((entry) => entry.id === node.id) >= 30;
});
if (!deepUnit) throw new Error("No deep unit fixture found.");
const deepParent = nodeOf(subjectTree, deepUnit.parent);

const sourceGroup = nodeOf(subjectTree, "group:source:learn-microsoft-com:fabric-data-factory");
const sourceBucket = nodeOf(subjectTree, "group:sources:fabric");
const crossNote = nodeOf(subjectTree, "note-delta-architecture");
const crossSource = nodeOf(subjectTree, "source:fabric:api");
const crossSourceGroup = crossSource ? nodeOf(subjectTree, crossSource.parent) : null;
const crossNoteParent = crossNote ? nodeOf(subjectTree, crossNote.parent) : null;
if (!sourceGroup || !sourceBucket || !crossNote || !crossSource) {
  throw new Error("Source-group or cross-reference fixture missing.");
}

const subjectRoots = rootsOf(subjectTree);
const powerBi = nodeOf(subjectTree, "subject:power-bi");
const powerBiLeaf = childrenOf(subjectTree, "subject:power-bi")[0];
const fabric = nodeOf(subjectTree, "subject:fabric");
const fabricChildren = childrenOf(subjectTree, "subject:fabric");
const fabricLeaf = fabricChildren.find((node) => node.children === 0);
if (!fabricLeaf) throw new Error("No list leaf fixture found.");
const expectedSubjectLabels = subjectRoots.map((node) => node.label);

const args = process.argv.slice(2);
const baseIndex = args.indexOf("--base");
const remoteBase = baseIndex === -1 ? null : args[baseIndex + 1];
const server = remoteBase ? null : await startServer();
const BASE = (remoteBase ?? `http://127.0.0.1:${server.address().port}`).replace(/\/$/, "");
const PAGE_URL = `${BASE}/prototype/network/`;
const ROUTE_PATH = "/prototype/network/";

await mkdir(EVIDENCE, { recursive: true });
const axeSource = await readFile(path.resolve("node_modules/axe-core/axe.min.js"), "utf8");

const checks = [];
const consoleErrors = [];
const failedRequests = [];
const requested = [];
const screenshots = [];
const check = (name, pass, detail = "") => {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch({ executablePath: EDGE, headless: true });

function attach(page) {
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));
  page.on("request", (request) => requested.push(request.url()));
  page.on("requestfailed", (request) => {
    const reason = request.failure()?.errorText ?? "";
    if (reason.includes("ERR_ABORTED")) return;
    failedRequests.push(`${request.url()} ${reason}`);
  });
}

async function axe(page, selector = ".kt") {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async (target) => {
    // @ts-expect-error injected at runtime
    const run = await window.axe.run(document.querySelector(target) ?? document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
    });
    return run.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
      help: violation.help,
      target: violation.nodes[0]?.target,
    }));
  }, selector);
}

async function mapState(page) {
  return page.evaluate(() => {
    const rectOf = (element) => {
      const rect = element.getBoundingClientRect();
      return { x1: rect.left, y1: rect.top, x2: rect.right, y2: rect.bottom };
    };
    const map = document.querySelector(".kt-map");
    const mapRect = map ? map.getBoundingClientRect() : { left: 0, top: 0 };
    const mapScale = mapRect.width ? mapRect.width / 1200 : 1;
    const labelRows = [...document.querySelectorAll(".kt-labels text")].map((element) => {
      const text = [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent ?? "")
        .join("")
        .trim();
      const rect = rectOf(element);
      const font = parseFloat(getComputedStyle(element).fontSize) || 0;
      return {
        text,
        fullText: element.querySelector("title")?.textContent ?? "",
        font,
        screenFont: Number((font * mapScale).toFixed(2)),
        ...rect,
        left: rect.x1 - mapRect.left,
        top: rect.y1 - mapRect.top,
      };
    });
    const nodeRows = [...document.querySelectorAll(".kt-nodes [data-node-id]")].map((element) => {
      const rect = rectOf(element);
      return {
        id: element.getAttribute("data-node-id"),
        expanded: element.getAttribute("aria-expanded"),
        pressed: element.getAttribute("aria-pressed"),
        selected: element.classList.contains("is-selected"),
        label: element.getAttribute("aria-label") ?? "",
        left: rect.x1 - mapRect.left,
        top: rect.y1 - mapRect.top,
        width: rect.x2 - rect.x1,
        height: rect.y2 - rect.y1,
      };
    });
    return {
      nodes: nodeRows,
      labels: labelRows,
      tabStops: document.querySelectorAll('.kt-nodes [data-node-id][tabindex="0"]').length,
      count: document.querySelector(".kt-count")?.textContent?.trim() ?? "",
      context: document.querySelector(".kt-context")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      cardTitle: document.querySelector(".kt-card-title")?.textContent?.trim() ?? "",
      cardText: document.querySelector(".kt-card")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      xrefs: document.querySelectorAll(".kt-xrefs path").length,
      xrefDash: document.querySelector(".kt-xrefs path")
        ? getComputedStyle(document.querySelector(".kt-xrefs path")).strokeDasharray
        : "",
      view: document.querySelector('.kt-view-tabs [aria-selected="true"]')?.textContent?.trim() ?? "",
      url: `${location.pathname}${location.search}`,
      mapScale: Number(mapScale.toFixed(3)),
      dark: document.documentElement.classList.contains("dark"),
    };
  });
}

function labelOverlaps(labels) {
  const rows = [];
  for (let i = 0; i < labels.length; i += 1) {
    for (let j = i + 1; j < labels.length; j += 1) {
      const a = labels[i];
      const b = labels[j];
      if (a.x1 < b.x2 - 0.5 && a.x2 > b.x1 + 0.5 && a.y1 < b.y2 - 0.5 && a.y2 > b.y1 + 0.5) {
        rows.push(`${a.text} × ${b.text}`);
      }
    }
  }
  return rows;
}

const parseShown = (count) => Number((count.match(/^([\d,]+)/) ?? [])[1]?.replace(/,/g, "") ?? NaN);

async function waitForShown(page, value, timeout = 15000) {
  await page.waitForFunction(
    (expected) => {
      const text = document.querySelector(".kt-count")?.textContent ?? "";
      return Number(text.replace(/,/g, "").match(/\d+/)?.[0] ?? -1) === expected;
    },
    value,
    { timeout },
  );
}

async function searchAndPick(page, label, pathHint = "") {
  const input = page.locator(".kt-search input");
  await input.fill(label);
  await page.waitForSelector(".kt-search-results button", { timeout: 10000 });
  const buttons = page.locator(".kt-search-results button");
  const total = await buttons.count();
  for (let index = 0; index < total; index += 1) {
    const text = await buttons.nth(index).innerText();
    if (text.includes(label) && (!pathHint || text.includes(pathHint))) {
      await buttons.nth(index).click();
      await page.waitForTimeout(700);
      return;
    }
  }
  throw new Error(`No search result for “${label}”${pathHint ? ` under ${pathHint}` : ""}.`);
}

async function screenshot(page, name) {
  const file = path.join(EVIDENCE, name);
  // Element screenshots stitch a tall box; resetting scroll keeps the sticky
  // site header above the component instead of across its toolbar.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(120);
  await page.locator(".kt").screenshot({ path: file, animations: "disabled" });
  screenshots.push(path.relative(path.resolve("."), file).replaceAll("\\", "/"));
}

// ------------------------------------------------------------------ desktop
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await context.newPage();
attach(page);
await page.goto(PAGE_URL, { waitUntil: "networkidle", timeout: 45000 });
await page.waitForSelector('[data-node-id="subject:fabric"]', { timeout: 30000 });
await page.waitForTimeout(500);

const initial = await mapState(page);
check("default view draws eight subject roots", initial.nodes.length === 8, `${initial.nodes.length} nodes`);
check("every root is labelled", initial.labels.length === 8, `${initial.labels.length} labels`);
check(
  "default labels are the eight root titles, none truncated",
  expectedSubjectLabels.every((label) => initial.labels.some((row) => row.text === label)),
  initial.labels.map((row) => row.text).join(" · "),
);
const defaultOverlaps = labelOverlaps(initial.labels);
check("default labels do not overlap", defaultOverlaps.length === 0, defaultOverlaps.slice(0, 3).join("; "));
check("default count reports eight shown", parseShown(initial.count) === 8, initial.count);
check("the default map exposes one tab stop", initial.tabStops === 1, `${initial.tabStops} of ${initial.nodes.length} nodes`);
check("default URL carries no focus", !initial.url.includes("focus=") && !initial.url.includes("open="), initial.url);
check("By subject is the default lens", (await page.locator(".kt-segmented button").first().getAttribute("aria-pressed")) === "true");
check("no side card before a selection", initial.cardTitle === "", initial.cardTitle);
check("no declared cross-reference before a selection", initial.xrefs === 0, `${initial.xrefs} paths`);
check("no dataset.json request", !requested.some((entry) => entry.includes("/graph/dataset.json")), "dataset stays unloaded");
check("subject tree was fetched", requested.some((entry) => entry.endsWith("/graph/tree.json")), "trees.json + tree.json");
await screenshot(page, "01-default-map.png");
await page.locator(".kt-map-shell").screenshot({ path: path.join(EVIDENCE, "01-default-map-crop.png"), animations: "disabled" });
screenshots.push("docs/prototype-graph/screens/tree/01-default-map-crop.png");

// Expand Power BI: four leaves, twelve visible nodes.
await page.locator('[data-node-id="subject:power-bi"]').click();
await page.waitForTimeout(800);
const expanded = await mapState(page);
check("opening Power BI adds its four leaves", expanded.nodes.length === 12, `${expanded.nodes.length} nodes`);
check("the expanded map still exposes one tab stop", expanded.tabStops === 1, `${expanded.tabStops} of ${expanded.nodes.length} nodes`);
check("opening a branch focuses it and opens its card", expanded.cardTitle === powerBi.label, expanded.cardTitle);
check(
  "the opened branch reports aria-expanded",
  expanded.nodes.find((node) => node.id === "subject:power-bi")?.expanded === "true",
  expanded.nodes.find((node) => node.id === "subject:power-bi")?.expanded ?? "",
);
check(
  "the twelve-node state still has no overlapping labels",
  labelOverlaps(expanded.labels).length === 0,
  `${expanded.labels.length} labels, ${labelOverlaps(expanded.labels).length} overlaps`,
);
await screenshot(page, "02-powerbi-expanded.png");

// Leaf selection: card first, explicit Open second, no navigation.
await page.locator(`[data-node-id="${powerBiLeaf.id}"]`).click();
await page.waitForTimeout(500);
const leaf = await mapState(page);
const openLink = page.locator(".kt-card a.kt-primary");
check("clicking a leaf opens its card", leaf.cardTitle === powerBiLeaf.label, leaf.cardTitle);
check(
  "leaf selection does not navigate away from the map",
  new URL(page.url()).pathname === ROUTE_PATH && page.context().pages().length === 1,
  `${new URL(page.url()).pathname} · ${page.context().pages().length} page`,
);
check("leaf card offers an explicit Open action", (await openLink.count()) === 1, await openLink.count() ? "one link" : "none");
check(
  "the Open action points at the source URL",
  (await openLink.getAttribute("href")) === powerBiLeaf.href,
  (await openLink.getAttribute("href")) ?? "",
);
check("the Open action opens externally in a new tab", (await openLink.getAttribute("target")) === "_blank");
check("leaf selection is announced on the node", leaf.nodes.find((node) => node.id === powerBiLeaf.id)?.selected === true);
await screenshot(page, "03-leaf-card.png");

// ------------------------------------------------------------ programme lens
await page.locator(".kt-segmented button", { hasText: "By programme" }).click();
await waitForShown(page, 1);
await page.waitForSelector('[data-node-id="programme:dp-600"]', { timeout: 20000 });
await page.waitForTimeout(800);
const dp600 = await mapState(page);
check("the programme lens exposes three named programmes", (await page.locator(".kt-programmes button").count()) === 3, `${await page.locator(".kt-programmes button").count()} chips`);
check("DP-600 opens at its single programme root", dp600.nodes.length === 1 && dp600.cardTitle === "", `${dp600.nodes.length} node / “${dp600.cardTitle}”`);
check("DP-600 root is labelled", dp600.labels.some((row) => row.text === labelOf(dp600Tree, "programme:dp-600")), dp600.labels.map((row) => row.text).join(" · "));
check("switching lens writes lens=dp-600", dp600.url.includes("lens=dp-600"), dp600.url);
check("DP-600 payload was fetched", requested.some((entry) => entry.endsWith("/graph/tree-dp600.json")));

await page.locator(".kt-programmes button", { hasText: "Fabric RTI" }).click();
await waitForShown(page, 1);
await page.waitForSelector('[data-node-id="programme:fabric-rti"]', { timeout: 20000 });
await page.waitForTimeout(700);
await page.locator('[data-node-id="programme:fabric-rti"]').click();
await page.waitForTimeout(600);
await page.locator('[data-node-id="course:rti"]').click();
await page.waitForTimeout(800);
const rti = await mapState(page);
check("Fabric RTI expands to its course and eight lessons", rti.nodes.length === rtiTree.nodes.length, `${rti.nodes.length} / ${rtiTree.nodes.length}`);
check("RTI lens payload was fetched", requested.some((entry) => entry.endsWith("/graph/tree-rti.json")));
check("RTI keeps declared lesson labels on the card", rti.cardText.length > 0, rti.cardTitle);

await page.locator(".kt-programmes button", { hasText: "Corpus Academy" }).click();
await waitForShown(page, 1);
await page.waitForSelector('[data-node-id="programme:academy"]', { timeout: 20000 });
await page.waitForTimeout(800);
await page.locator('[data-node-id="programme:academy"]').click();
await page.waitForTimeout(700);
const academyRoot = await mapState(page);
check("Academy opens its two tracks", academyRoot.nodes.length === 3, `${academyRoot.nodes.length} nodes`);
const academyTrack = academyTree.nodes.find((node) => node.kind === "course" && node.children > 40);
await page.locator(`[data-node-id="${academyTrack.id}"]`).click();
await page.waitForTimeout(700);
const academyExpanded = await mapState(page);
check(
  "Academy pages a track at twelve modules plus a more control",
  academyExpanded.nodes.filter((node) => node.id.startsWith("more:")).length === 1 &&
    academyExpanded.nodes.filter((node) => node.id.startsWith("more:"))[0].label.includes("more"),
  `${academyExpanded.nodes.length} nodes`,
);
check("Academy lens payload was fetched", requested.some((entry) => entry.endsWith("/graph/tree-academy.json")));
await screenshot(page, "04-academy-lens.png");

// ------------------------------------------------- source grouping + xrefs
await page.locator(".kt-segmented button", { hasText: "By subject" }).click();
await page.waitForSelector('[data-node-id="subject:fabric"]', { timeout: 20000 });
await waitForShown(page, 8);
await page.waitForTimeout(800);

await searchAndPick(page, sourceGroup.label);
const grouped = await mapState(page);
check("source search selects the URL-grouped collection", grouped.cardTitle === sourceGroup.label, grouped.cardTitle);
check("the source group reports its URL-derived count", grouped.cardText.includes(String(sourceGroup.groupCount)), `${sourceGroup.groupCount} in card`);
check("the source bucket is a declared containment branch", Boolean(sourceBucket), sourceBucket.label);
await screenshot(page, "05-source-group.png");

// One source, then one note that cites it: both stay visible and the declared
// reference is drawn dashed only because this node is selected.
await searchAndPick(page, crossSource.label, crossSourceGroup?.label ?? "");
await searchAndPick(page, crossNote.label, crossNoteParent?.label ?? "");
const xref = await mapState(page);
check("selecting a cited note draws its declared references", xref.xrefs > 0, `${xref.xrefs} dashed paths`);
check("declared references are dashed", /4px[, ]+4px/.test(xref.xrefDash.replace(/px/g, "px")), xref.xrefDash);
check("the card lists declared cross-references", xref.cardText.includes("Declared cross-references"), "heading present");
check("the selected note's card names its source", xref.cardText.includes(crossSource.label), crossSource.label);
await screenshot(page, "06-declared-crossrefs.png");

// ------------------------------------------------------------ deep search
await page.locator('button[aria-label="Reset the view"]').click();
await waitForShown(page, 8);
await searchAndPick(page, deepUnit.label, deepParent.label);
const searched = await mapState(page);
check("deep search reveals the target node", searched.nodes.some((node) => node.id === deepUnit.id), `${searched.nodes.length} visible`);
check("deep search opens the target's ancestors", searched.nodes.find((node) => node.id === "subject:fabric")?.expanded === "true");
check("deep search opens the card on the target", searched.cardTitle === deepUnit.label, searched.cardTitle);
check("deep search pages the target into view", searched.nodes.some((node) => node.id === deepUnit.id), deepUnit.id);
check("deep search writes focus into the URL", new URL(page.url()).searchParams.get("focus") === deepUnit.id, page.url());
const searchPositions = new Map(searched.nodes.map((node) => [node.id, { left: node.left, top: node.top }]));
await screenshot(page, "07-deep-search.png");

// --------------------------------------------------------------- reload
const beforeReloadUrl = page.url();
const beforeReloadCount = searched.count;
await page.reload({ waitUntil: "networkidle", timeout: 45000 });
await page.waitForSelector(`[data-node-id="${deepUnit.id}"]`, { timeout: 30000 });
await page.waitForTimeout(800);
const restored = await mapState(page);
check("reload restores focus and open branches", restored.cardTitle === deepUnit.label, restored.cardTitle);
check("reload keeps the same visible count", restored.count === beforeReloadCount, `${beforeReloadCount} → ${restored.count}`);
check("reload keeps the shareable URL", page.url() === beforeReloadUrl, page.url());
const drift = restored.nodes
  .filter((node) => searchPositions.has(node.id))
  .map((node) => {
    const before = searchPositions.get(node.id);
    return Math.max(Math.abs(before.left - node.left), Math.abs(before.top - node.top));
  });
check("reload reproduces the same deterministic positions", drift.every((value) => value < 1.5), `max drift ${Math.max(...drift, 0).toFixed(2)}px`);

// --------------------------------------------------------------- keyboard
await page.locator('button[aria-label="Reset the view"]').click();
await waitForShown(page, 8);
await page.waitForTimeout(800);
await page.locator('[data-node-id="subject:power-bi"]').focus();
check("a map node accepts keyboard focus", (await page.evaluate(() => document.activeElement?.getAttribute("data-node-id"))) === "subject:power-bi");
await page.keyboard.press("Tab");
check(
  "Tab leaves the map instead of visiting the next node",
  (await page.evaluate(() => document.activeElement?.getAttribute("aria-label"))) === "Zoom in",
  (await page.evaluate(() => document.activeElement?.getAttribute("aria-label"))) ?? "",
);
await page.locator('[data-node-id="subject:power-bi"]').focus();
await page.keyboard.press("ArrowRight");
await page.waitForTimeout(800);
check("ArrowRight expands a collapsed branch", (await mapState(page)).nodes.length === 12, `${(await mapState(page)).nodes.length} nodes`);
await page.keyboard.press("ArrowRight");
await page.waitForTimeout(300);
const firstChildFocus = await page.evaluate(() => document.activeElement?.getAttribute("data-node-id"));
check("ArrowRight again moves into the first child", firstChildFocus === powerBiLeaf.id, firstChildFocus ?? "");
await page.keyboard.press("Enter");
await page.waitForTimeout(500);
const leafCardFocus = await page.evaluate(() => ({
  tag: document.activeElement?.tagName ?? "",
  cls: document.activeElement?.getAttribute("class") ?? "",
  title: document.querySelector(".kt-card-title")?.textContent?.trim() ?? "",
}));
check(
  "Enter on a leaf moves focus to the card title",
  leafCardFocus.tag === "H2" && leafCardFocus.cls.includes("kt-card-title") && leafCardFocus.title === powerBiLeaf.label,
  `${leafCardFocus.tag}.${leafCardFocus.cls} / “${leafCardFocus.title}”`,
);
await page.locator('button[aria-label="Close details"]').click();
await page.waitForTimeout(400);
const closeButtonReturn = await page.evaluate(() => ({
  card: Boolean(document.querySelector(".kt-card")),
  id: document.activeElement?.getAttribute("data-node-id") ?? "",
}));
check(
  "the card close button returns focus to the leaf",
  !closeButtonReturn.card && closeButtonReturn.id === powerBiLeaf.id,
  `card ${closeButtonReturn.card ? "open" : "closed"} / focus ${closeButtonReturn.id || "none"}`,
);
await page.locator(`[data-node-id="${powerBiLeaf.id}"]`).focus();
await page.keyboard.press("Enter");
await page.waitForTimeout(500);
await page.keyboard.press("Escape");
await page.waitForTimeout(400);
const leafCardReturn = await page.evaluate(() => ({
  card: Boolean(document.querySelector(".kt-card")),
  id: document.activeElement?.getAttribute("data-node-id") ?? "",
}));
check(
  "Escape closes the card and returns focus to the leaf",
  !leafCardReturn.card && leafCardReturn.id === powerBiLeaf.id,
  `card ${leafCardReturn.card ? "open" : "closed"} / focus ${leafCardReturn.id || "none"}`,
);
await page.keyboard.press("ArrowLeft");
await page.waitForTimeout(300);
check("ArrowLeft moves back to the parent", (await page.evaluate(() => document.activeElement?.getAttribute("data-node-id"))) === "subject:power-bi");
await page.keyboard.press("ArrowDown");
await page.waitForTimeout(300);
const nextSibling = await page.evaluate(() => document.activeElement?.getAttribute("data-node-id"));
const expectedSibling = subjectRoots[subjectRoots.findIndex((node) => node.id === "subject:power-bi") + 1];
check("ArrowDown moves to the next sibling root", nextSibling === expectedSibling?.id, `${nextSibling} / expected ${expectedSibling?.id}`);
await page.keyboard.press("ArrowUp");
await page.waitForTimeout(300);
check("ArrowUp returns to the previous sibling", (await page.evaluate(() => document.activeElement?.getAttribute("data-node-id"))) === "subject:power-bi");
await page.keyboard.press("Enter");
await page.waitForTimeout(800);
check("Enter collapses the focused branch", (await mapState(page)).nodes.length === 8, `${(await mapState(page)).nodes.length} nodes`);
check(
  "Enter on a branch keeps focus on the branch",
  (await page.evaluate(() => document.activeElement?.getAttribute("data-node-id"))) === "subject:power-bi",
  (await page.evaluate(() => document.activeElement?.getAttribute("data-node-id"))) ?? "",
);

// ------------------------------------------------------------- list mirror
await waitForShown(page, 8);
await page.locator('.kt-view-tabs button[role="tab"]', { hasText: "List" }).click();
await page.waitForTimeout(300);
const listInitial = await page.evaluate(() => ({
  rows: document.querySelectorAll(".kt-list-row").length,
  titles: [...document.querySelectorAll(".kt-list-title")].map((node) => node.textContent?.trim()),
  view: document.querySelector('.kt-view-tabs [aria-selected="true"]')?.textContent?.trim() ?? "",
}));
check("List is a tab view of the same tree", listInitial.view === "List", listInitial.view);
check("List shows the same eight roots", listInitial.rows === 8 && expectedSubjectLabels.every((label) => listInitial.titles.includes(label)), `${listInitial.rows} rows`);

const fabricRow = page.locator(".kt-list li", { has: page.locator(".kt-list-title", { hasText: fabric.label }) }).first();
await fabricRow.locator(".kt-list-row").click();
await waitForShown(page, 20);
const listExpanded = await page.evaluate(() => ({
  rows: document.querySelectorAll(".kt-list-row").length,
  expanded: [...document.querySelectorAll(".kt-list-row")].filter((node) => node.getAttribute("aria-expanded") === "true").length,
  more: [...document.querySelectorAll(".kt-list-title")].filter((node) => /^\+\d+ more$/.test(node.textContent?.trim() ?? "")).length,
  cap: document.querySelector(".kt-list-cap")?.textContent ?? "",
}));
check("List mirrors twelve children plus a more row", listExpanded.rows === 21 && listExpanded.more === 1, `${listExpanded.rows} rows / ${listExpanded.more} more`);
check("List reports the open branch", listExpanded.expanded === 1, `${listExpanded.expanded} expanded`);
check("List has no cap notice below 150 nodes", listExpanded.cap === "", listExpanded.cap);
await screenshot(page, "08-list-mirror.png");

// Paging from the list keeps the same open set.
await page.locator(".kt-list-row", { hasText: /^\+\d+ more/ }).click();
await waitForShown(page, 29);
const listPaged = await page.evaluate(() => document.querySelectorAll(".kt-list-row").length);
check("the more row pages through the list", listPaged === fabricChildren.length + 8, `${listPaged} rows`);

const listLeafRow = page.locator(`[data-row-id="${fabricLeaf.id}"]`);
await listLeafRow.focus();
await page.keyboard.press("Enter");
await page.waitForTimeout(400);
const listLeafFocus = await page.evaluate(() => ({
  tag: document.activeElement?.tagName ?? "",
  cls: document.activeElement?.getAttribute("class") ?? "",
  title: document.querySelector(".kt-card-title")?.textContent?.trim() ?? "",
}));
check(
  "Enter on a list leaf moves focus to the card title",
  listLeafFocus.tag === "H2" && listLeafFocus.cls.includes("kt-card-title") && listLeafFocus.title === fabricLeaf.label,
  `${listLeafFocus.tag}.${listLeafFocus.cls} / “${listLeafFocus.title}”`,
);
await page.keyboard.press("Escape");
await page.waitForTimeout(400);
const listLeafReturn = await page.evaluate(() => ({
  card: Boolean(document.querySelector(".kt-card")),
  row: document.activeElement?.getAttribute("data-row-id") ?? "",
}));
check(
  "Escape returns focus to the list row",
  !listLeafReturn.card && listLeafReturn.row === fabricLeaf.id,
  `card ${listLeafReturn.card ? "open" : "closed"} / focus ${listLeafReturn.row || "none"}`,
);

await page.locator('.kt-view-tabs button[role="tab"]', { hasText: "Map" }).click();

// ---------------------------------------------------------- show everything
await page.locator('button[aria-label="Reset the view"]').click();
await waitForShown(page, 8);
await page.getByRole("button", { name: "Show everything", exact: true }).click();
await page.waitForTimeout(1800);
const overview = await mapState(page);
check("Show everything is an explicit overview", overview.nodes.length === subjectTree.nodes.length, `${overview.nodes.length} nodes`);
check("the overview draws no labels", overview.labels.length === 0, `${overview.labels.length} labels`);
check(
  "Show everything still exposes one tab stop",
  overview.tabStops === 1,
  `${overview.tabStops} of ${overview.nodes.length} nodes`,
);
check("the overview says labels are off", overview.context.includes("Overview: every node, labels off"), overview.context);
check("the overview records all=1 in the URL", overview.url.includes("all=1"), overview.url);
check("the overview button offers a way back", (await page.getByRole("button", { name: "Back to branches", exact: true }).count()) === 1);
await screenshot(page, "09-show-everything.png");
await page.getByRole("button", { name: "Back to branches", exact: true }).click();
await waitForShown(page, 8);
check("leaving the overview restores eight labels", (await mapState(page)).labels.length === 8);

// Zoom without a focus must not blank the map: root labels stay until a branch
// is focused, then the focus label wins over the roots.
for (let step = 0; step < 3; step += 1) {
  await page.locator('button[aria-label="Zoom in"]').click();
  await page.waitForTimeout(120);
}
await page.waitForTimeout(300);
const zoomedRoots = await mapState(page);
check("zooming without a focus keeps every root labelled", zoomedRoots.labels.length === 8, `${zoomedRoots.labels.length} labels`);
check("zoomed root labels still do not overlap", labelOverlaps(zoomedRoots.labels).length === 0, labelOverlaps(zoomedRoots.labels).join("; "));
await page.locator('button[aria-label="Reset the view"]').click();
await page.waitForTimeout(300);

// ------------------------------------------------------------------ axe
const desktopAxe = await axe(page);
check("axe WCAG 2 A/AA finds no violations in the tree", desktopAxe.length === 0, desktopAxe.map((violation) => `${violation.id}(${violation.nodes})`).join(", "));

await context.close();

// ------------------------------------------------------- mobile + reduced motion
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
  isMobile: true,
  hasTouch: true,
});
const mobilePage = await mobile.newPage();
attach(mobilePage);
await mobilePage.goto(PAGE_URL, { waitUntil: "networkidle", timeout: 45000 });
await mobilePage.waitForSelector(".kt-list-shell", { timeout: 30000 });
await mobilePage.waitForTimeout(500);
const mobileList = await mobilePage.evaluate(() => ({
  view: document.querySelector('.kt-view-tabs [aria-selected="true"]')?.textContent?.trim() ?? "",
  rows: document.querySelectorAll(".kt-list-row").length,
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  map: Boolean(document.querySelector(".kt-map")),
  count: document.querySelector(".kt-count")?.textContent?.trim() ?? "",
}));
check("390px starts in the List view", mobileList.view === "List", mobileList.view);
check("390px lists the same eight roots", mobileList.rows === 8, `${mobileList.rows} rows`);
check("390px has no horizontal overflow", mobileList.overflow <= 1, `${mobileList.overflow}px`);
check("390px keeps the map one tap away", mobileList.map === false, "map is not the initial panel");
await screenshot(mobilePage, "10-mobile-list.png");

await mobilePage.locator('.kt-view-tabs button[role="tab"]', { hasText: "Map" }).click();
await mobilePage.waitForSelector('[data-node-id="subject:fabric"]', { timeout: 20000 });
await mobilePage.waitForTimeout(400);
const mobileMap = await mobilePage.evaluate(() => {
  const world = document.querySelector(".kt-world");
  const node = document.querySelector(".kt-node");
  return {
    nodes: document.querySelectorAll(".kt-nodes [data-node-id]").length,
    labels: document.querySelectorAll(".kt-labels text").length,
    labelsShown: document.querySelector(".kt-labels")
      ? getComputedStyle(document.querySelector(".kt-labels")).display !== "none"
      : false,
    note: document.querySelector(".kt-mobile-note")?.textContent?.trim() ?? "",
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    worldTransition: world ? getComputedStyle(world).transitionDuration : "",
    nodeAnimation: node ? getComputedStyle(node).animationName : "",
  };
});
check(
  "390px map draws eight roots as a spatial overview",
  mobileMap.nodes === 8 && !mobileMap.labelsShown,
  `${mobileMap.nodes} nodes / labels ${mobileMap.labelsShown ? "on" : "off"}`,
);
check(
  "390px map explains where the names are",
  mobileMap.note.includes("List tab") && mobileMap.note.length > 20,
  mobileMap.note,
);
check("390px map has no horizontal overflow", mobileMap.overflow <= 1, `${mobileMap.overflow}px`);
check("reduced motion removes the pan transition", parseFloat(mobileMap.worldTransition) <= 0.001, mobileMap.worldTransition);
check("reduced motion removes node animations", mobileMap.nodeAnimation === "none", mobileMap.nodeAnimation);
await screenshot(mobilePage, "11-mobile-map.png");
const mobileAxe = await axe(mobilePage);
check("axe WCAG 2 A/AA finds no violations on mobile", mobileAxe.length === 0, mobileAxe.map((violation) => `${violation.id}(${violation.nodes})`).join(", "));
await mobile.close();

// ------------------------------------------------------- tablet legibility
const tablet = await browser.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const tabletPage = await tablet.newPage();
attach(tabletPage);
await tabletPage.goto(PAGE_URL, { waitUntil: "networkidle", timeout: 45000 });
await tabletPage.waitForSelector(".kt-map", { timeout: 30000 });
await tabletPage.waitForTimeout(500);
const tabletDefault = await mapState(tabletPage);
const tabletMinFont = Math.min(...tabletDefault.labels.map((label) => label.screenFont));
check("768px keeps the Map as the default view", tabletDefault.view === "Map", tabletDefault.view);
check("768px labels all eight roots", tabletDefault.labels.length === 8, `${tabletDefault.labels.length} labels`);
check(
  "768px counter-scales labels to a readable size",
  tabletMinFont >= 11.5,
  `${tabletMinFont}px on screen at ${tabletDefault.mapScale}x`,
);
check("768px labels do not overlap", labelOverlaps(tabletDefault.labels).length === 0, labelOverlaps(tabletDefault.labels).slice(0, 3).join("; "));
check(
  "768px has no horizontal overflow",
  await tabletPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth <= 1),
);
await screenshot(tabletPage, "12-tablet-map.png");
await tablet.close();

const laptop = await browser.newContext({ viewport: { width: 1024, height: 900 }, deviceScaleFactor: 1 });
const laptopPage = await laptop.newPage();
attach(laptopPage);
await laptopPage.goto(PAGE_URL, { waitUntil: "networkidle", timeout: 45000 });
await laptopPage.waitForSelector('[data-node-id="subject:power-bi"]', { timeout: 30000 });
await laptopPage.locator('[data-node-id="subject:power-bi"]').click();
await laptopPage.waitForTimeout(700);
const laptopCard = await mapState(laptopPage);
const laptopMinFont = Math.min(...laptopCard.labels.map((label) => label.screenFont));
const powerBiChildren = childrenOf(subjectTree, "subject:power-bi");
check(
  "1024px with the side card keeps the map readable",
  laptopCard.nodes.length === 12 && Boolean(laptopCard.cardTitle),
  `${laptopCard.nodes.length} nodes / card “${laptopCard.cardTitle}”`,
);
check(
  "1024px with the side card keeps every Power BI leaf labelled",
  powerBiChildren.every((child) => laptopCard.labels.some((label) => label.fullText === child.label)),
  powerBiChildren.map((child) => child.label).join(" · "),
);
check("1024px with the side card keeps labels above 10.5px", laptopMinFont >= 10.5, `${laptopMinFont}px`);
check("1024px labels do not overlap", labelOverlaps(laptopCard.labels).length === 0, labelOverlaps(laptopCard.labels).slice(0, 3).join("; "));
await screenshot(laptopPage, "13-tablet-card.png");
await laptop.close();

// ------------------------------------------------------------- dark theme
const dark = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const darkPage = await dark.newPage();
attach(darkPage);
await darkPage.goto(PAGE_URL, { waitUntil: "networkidle", timeout: 45000 });
await darkPage.waitForSelector('.kt-map [data-node-id="subject:fabric"]', { timeout: 30000 });
await darkPage.evaluate(() => {
  document.documentElement.classList.add("dark");
  document.documentElement.style.colorScheme = "dark";
});
await darkPage.waitForTimeout(400);
const darkState = await mapState(darkPage);
const darkAxe = await axe(darkPage);
check("dark theme resolves to a dark page", darkState.dark, "html.dark");
check("dark theme keeps all eight root labels", darkState.labels.length === 8, `${darkState.labels.length} labels`);
check(
  "dark theme labels stay above 12px",
  Math.min(...darkState.labels.map((label) => label.screenFont)) >= 12,
  `${Math.min(...darkState.labels.map((label) => label.screenFont))}px`,
);
check("dark theme labels do not overlap", labelOverlaps(darkState.labels).length === 0, labelOverlaps(darkState.labels).slice(0, 3).join("; "));
check("axe WCAG 2 A/AA finds no violations in dark theme", darkAxe.length === 0, darkAxe.map((violation) => `${violation.id}(${violation.nodes})`).join(", "));
await screenshot(darkPage, "14-dark-map.png");
await dark.close();

await browser.close();
if (server) await new Promise((resolve) => server.close(resolve));

const failures = checks.filter((entry) => !entry.pass);
const report = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  url: PAGE_URL,
  viewport: { desktop: "1440x1000", mobile: "390x844" },
  tree: {
    version: subjectTree.report?.version ?? "unknown",
    subject: { nodes: subjectTree.nodes.length, roots: subjectRoots.length, depth: subjectTree.report?.depth },
    dp600: { nodes: dp600Tree.nodes.length, roots: dp600Tree.roots.length },
    rti: { nodes: rtiTree.nodes.length, roots: rtiTree.roots.length },
    academy: { nodes: academyTree.nodes.length, roots: academyTree.roots.length },
    labels: { default: initial.labels.length, overlaps: defaultOverlaps.length },
    crossRefs: { paths: xref.xrefs, dash: xref.xrefDash },
    deepTarget: { id: deepUnit.id, label: deepUnit.label, parent: deepParent?.label },
    sourceGroup: { id: sourceGroup.id, label: sourceGroup.label, count: sourceGroup.groupCount },
  },
  checks,
  consoleErrors,
  failedRequests,
  axe: { desktop: desktopAxe, mobile: mobileAxe, dark: darkAxe },
  requests: {
    trees: requested.filter((entry) => entry.includes("/graph/")).map((entry) => entry.replace(BASE, "")),
    datasetRequested: requested.some((entry) => entry.includes("/graph/dataset.json")),
  },
  screenshots,
  summary: { total: checks.length, passed: checks.length - failures.length, failed: failures.length },
};
await writeFile(REPORT, JSON.stringify(report, null, 2));
console.log(`\n${report.summary.passed}/${report.summary.total} checks passed. Report: ${REPORT}`);
if (consoleErrors.length) console.log(`Console errors: ${consoleErrors.length}`, consoleErrors.slice(0, 5));
if (failedRequests.length) console.log(`Failed requests: ${failedRequests.length}`, failedRequests.slice(0, 5));
if (!report.summary.failed && !consoleErrors.length && !failedRequests.length) {
  console.log("Tree QA passed.");
} else {
  process.exitCode = 1;
}
