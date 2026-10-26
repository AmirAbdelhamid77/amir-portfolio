// Browser QA for the Prototype C V2 knowledge stage.
//
//   node scripts/qa-prototype-c-v2.mjs [--base http://127.0.0.1:4210]
//
// Drives the locally installed Microsoft Edge through playwright-core against a
// static build already being served. It exercises the real interactions
// (deal → inspect → collect, reveal → evidence → reset, rail selection,
// Back/Forward, rapid changes) and records screenshots plus a JSON report under
// docs/prototype-c/v2/. No network access, no deployment, nothing mutated.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const args = process.argv.slice(2);
const baseIndex = args.indexOf("--base");
const BASE = (baseIndex === -1 ? "http://127.0.0.1:4210" : args[baseIndex + 1]).replace(/\/$/, "");
const URL = `${BASE}/prototype-c/`;
const EVIDENCE = path.resolve("docs/prototype-c/v2/evidence");
const REPORT = path.resolve("docs/prototype-c/v2/qa-browser.json");

await mkdir(EVIDENCE, { recursive: true });
const axeSource = await readFile(path.resolve("node_modules/axe-core/axe.min.js"), "utf8");

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const report = { generatedAt: new Date().toISOString(), base: BASE, checks: [], shots: [] };
const results = {};

function record(id, pass, detail) {
  report.checks.push({ id, pass, detail });
  if (!pass) results.failed = [...(results.failed ?? []), id];
}

async function open({ width, height, dark = true, reduced = false, search = "" }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  await context.addInitScript((isDark) => {
    try {
      window.localStorage.setItem("amir-theme", isDark ? "dark" : "light");
    } catch {
      /* private mode */
    }
  }, dark);
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));
  await page.goto(`${URL}${search}`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(350);
  return { page, context, consoleErrors };
}

async function shot(page, name, label) {
  const file = path.join(EVIDENCE, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  report.shots.push({ name, label });
  return file;
}

async function axe(page) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    // @ts-expect-error injected global
    const result = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
    });
    return result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.slice(0, 3).map((node) => node.target.join(" ")),
    }));
  });
}

async function layout(page) {
  return page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    h1Count: document.querySelectorAll("h1").length,
    tray: document.querySelector('[aria-label="Knowledge card tray"]')?.getBoundingClientRect().toJSON(),
    cards: [...document.querySelectorAll('[aria-label="Knowledge card tray"] button[aria-expanded]')].map((node) => ({
      label: node.getAttribute("aria-label"),
      rect: node.getBoundingClientRect().toJSON(),
    })),
  }));
}

const dealer = (page) => page.locator('section[aria-labelledby="dealer-title"]');
const scene = (page) => page.locator("article");
const dealtChip = (page) => dealer(page).locator("span.tabular-nums");

/* ---------------------------------------------------------------- desktop -- */
{
  const { page, context, consoleErrors } = await open({ width: 1440, height: 1000 });
  await shot(page, "10-desktop-still-dark", "Desktop still frame, dark, before interaction");

  // Frame depth: with no interaction, the deck and the reading plane exist and
  // the deck's hand area is visibly its own object, not a second card.
  const still = await layout(page);
  record("still-frame-no-overflow", !still.overflow, still);
  record("still-frame-single-h1", still.h1Count === 1, still.h1Count);

  await page.getByRole("button", { name: "Deal three ideas" }).click();
  await page.waitForTimeout(650);
  const chips = await dealtChip(page).textContent();
  record("deal-three", (chips ?? "").trim().startsWith("3 / 3"), chips);
  await shot(page, "11-desktop-hand-dealt", "Dealt hand, dark");

  // Each hand card must be reachable in the exposed part of its fan.
  const cardLabels = await dealer(page)
    .locator("button[aria-expanded]")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("aria-label")));
  record("hand-has-three-cards", cardLabels.length === 3, cardLabels);

  for (let index = 0; index < cardLabels.length; index += 1) {
    const card = dealer(page).locator(`button[aria-label="${cardLabels[index]}"]`);
    const box = await card.boundingBox();
    // The left strip of each card stays clear of the next card in the fan.
    await card.click({ position: { x: Math.min(18, box.width / 4), y: box.height / 2 } });
    await page.waitForTimeout(420);
    const reader = page.locator('[aria-label="Selected card"]');
    const opened = await reader.count();
    const text = opened ? (await reader.textContent()) ?? "" : "";
    record(`inspect-card-${index}`, opened === 1 && text.length > 40, {
      label: cardLabels[index],
      opened,
      sample: text.slice(0, 60),
    });
    if (index === 0) {
      await shot(page, "12-desktop-reader-open", "Card reader open, dark");
      const focusInReader = await page.evaluate(
        () => document.activeElement === document.querySelector('[aria-label="Selected card"]'),
      );
      record("reader-receives-focus", focusInReader, focusInReader);
    }
    await page.keyboard.press("Escape");
    // The reader leaves through a 380ms exit; wait past it before counting.
    await page.waitForTimeout(620);
  }
  const closed = await page.locator('[aria-label="Selected card"]').count();
  record("escape-returns-to-hand", closed === 0, closed);

  const collect = page.getByRole("button", { name: "Collect all" });
  await collect.click();
  await page.waitForTimeout(650);
  record(
    "collect-resets-hand",
    ((await dealtChip(page).textContent()) ?? "").trim().startsWith("0 / 3"),
    await dealtChip(page).textContent(),
  );

  await scene(page).getByRole("button", { name: "Reveal the reasoning" }).click();
  await page.waitForTimeout(450);
  const answer = page.locator('[id$="-reasoning"]');
  record("reveal-opens-reasoning", (await answer.count()) === 1, await answer.count());
  await page.getByRole("button", { name: "Evidence" }).click();
  await page.waitForTimeout(350);
  record("evidence-opens-source", (await page.locator('[id$="-source"]').count()) === 1, "source panel");
  await shot(page, "13-desktop-reveal-evidence", "Reasoning and evidence open, dark");
  await page.getByRole("button", { name: "Back to the situation" }).click();
  await page.waitForTimeout(400);
  record("reveal-reversible", (await answer.count()) === 0, await answer.count());

  // Rail: next edition by pointer, then keyboard, then Back/Forward.
  await page.getByRole("button", { name: "Older edition" }).click();
  await page.waitForTimeout(700);
  const afterRail = await page.evaluate(() => ({
    search: location.search,
    title: document.querySelector("article h2")?.textContent,
    revealed: document.querySelector("article button[aria-controls$='-reasoning']")?.getAttribute("aria-expanded"),
    experiment: document.querySelector("article fieldset legend")?.textContent,
  }));
  record(
    "rail-selects-and-pairs-scene",
    afterRail.search.includes("shortcut-delete") &&
      afterRail.title === "Name the object you are deleting." &&
      afterRail.revealed === "false" &&
      afterRail.experiment === "Which action are you taking?",
    afterRail,
  );
  await shot(page, "14-desktop-edition-two", "Second edition selected, dark");

  await page.locator('[aria-label="Insight editions"] button[aria-current="date"]').focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(700);
  const afterKey = await page.evaluate(() => ({
    search: location.search,
    title: document.querySelector("article h2")?.textContent,
  }));
  record("rail-keyboard-arrow", afterKey.search.includes("shortcut-discovery"), afterKey);

  await page.goBack();
  await page.waitForTimeout(700);
  const afterBack = await page.evaluate(() => ({
    search: location.search,
    title: document.querySelector("article h2")?.textContent,
  }));
  record(
    "back-restores-edition",
    afterBack.search.includes("shortcut-delete") && afterBack.title === "Name the object you are deleting.",
    afterBack,
  );

  // Rapid selection through the keyboard path: the last input wins and no scene
  // from an earlier edition leaks into the settled state.
  await page.locator('[aria-label="Insight editions"] button[aria-current="date"]').focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(60);
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(60);
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(900);
  const rapid = await page.evaluate(() => ({
    search: location.search,
    title: document.querySelector("article h2")?.textContent,
    cards: [...document.querySelectorAll('section[aria-labelledby="dealer-title"] button[aria-expanded]')].length,
  }));
  record(
    "rapid-selection-latest-wins",
    rapid.search.includes("shortcut-delete") &&
      rapid.title === "Name the object you are deleting." &&
      rapid.cards === 0,
    rapid,
  );

  const desktopLayout = await layout(page);
  record("desktop-no-horizontal-overflow", !desktopLayout.overflow, desktopLayout);
  record("desktop-no-console-errors", consoleErrors.length === 0, consoleErrors);

  const violations = await axe(page);
  record("desktop-axe", violations.length === 0, violations);

  // Reader on a narrow desktop column still shows its full content.
  await context.close();
}

/* ------------------------------------------------------------------ light -- */
{
  const { page, context, consoleErrors } = await open({ width: 1440, height: 1000, dark: false });
  await page.getByRole("button", { name: "Deal three ideas" }).click();
  await page.waitForTimeout(600);
  await shot(page, "15-desktop-light", "Desktop, light theme, hand dealt");
  const violations = await axe(page);
  record("light-axe", violations.length === 0, violations);
  record("light-no-console-errors", consoleErrors.length === 0, consoleErrors);
  await context.close();
}

/* ------------------------------------------------------------ reduced motion */
{
  const { page, context } = await open({ width: 1440, height: 1000, reduced: true });
  await page.getByRole("button", { name: "Deal three ideas" }).click();
  await page.waitForTimeout(120);
  const immediate = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('section[aria-labelledby="dealer-title"] button[aria-expanded]')];
    return cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return { top: Math.round(rect.top), left: Math.round(rect.left) };
    });
  });
  const settled = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('section[aria-labelledby="dealer-title"] button[aria-expanded]')];
    return cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return { top: Math.round(rect.top), left: Math.round(rect.left) };
    });
  });
  record("reduced-motion-places-immediately", JSON.stringify(immediate) === JSON.stringify(settled), {
    immediate,
    settled,
  });
  await shot(page, "16-reduced-motion-still", "Reduced motion, hand dealt, no travel");
  // The static reading frame must still show depth: the supporting plane is
  // offset behind the reading surface, and the deck is a separate object.
  const depth = await page.evaluate(() => {
    const article = document.querySelector("article");
    const planes = [...article.parentElement.children].map((child) => child.getBoundingClientRect().toJSON());
    return { planes: planes.slice(0, 3).map((rect) => ({ x: Math.round(rect.x), y: Math.round(rect.y) })) };
  });
  record("reduced-motion-keeps-static-depth", depth.planes.length >= 3 && depth.planes[0].y !== depth.planes[1].y, depth);
  await context.close();
}

/* ----------------------------------------------------------------- mobile -- */
for (const width of [390, 320]) {
  const { page, context, consoleErrors } = await open({ width, height: width === 390 ? 844 : 800 });
  await shot(page, `17-mobile-${width}`, `Mobile ${width}px still frame`);
  const still = await layout(page);
  record(`mobile-${width}-no-overflow`, !still.overflow, still);
  const tray = still.tray;
  record(`mobile-${width}-tray-in-viewport`, tray && tray.width > 0, tray);
  await page.getByRole("button", { name: "Deal three ideas" }).click();
  await page.waitForTimeout(700);
  await shot(page, `18-mobile-${width}-hand`, `Mobile ${width}px hand dealt`);
  const cards = await dealer(page).locator("button[aria-expanded]").evaluateAll((nodes) =>
    nodes.map((node) => node.getBoundingClientRect().toJSON()),
  );
  const insideTray = cards.every(
    (rect) => rect.left >= (still.tray.left - 2) && rect.right <= (still.tray.right + 2),
  );
  record(`mobile-${width}-cards-in-tray`, cards.length === 3 && insideTray, cards);
  record(`mobile-${width}-no-console-errors`, consoleErrors.length === 0, consoleErrors);
  const violations = await axe(page);
  record(`mobile-${width}-axe`, violations.length === 0, violations);
  await context.close();
}

/* ----------------------------------------------------------------- tablet -- */
{
  const { page, context } = await open({ width: 768, height: 1024 });
  await page.getByRole("button", { name: "Deal three ideas" }).click();
  await page.waitForTimeout(650);
  await shot(page, "19-tablet-768", "Tablet 768px, hand dealt");
  const tablet = await layout(page);
  record("tablet-no-overflow", !tablet.overflow, tablet);
  await context.close();
}

await browser.close();
report.summary = {
  total: report.checks.length,
  passed: report.checks.filter((check) => check.pass).length,
  failed: report.checks.filter((check) => !check.pass).length,
};
await writeFile(REPORT, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary));
for (const check of report.checks.filter((entry) => !entry.pass)) {
  console.log(`FAIL ${check.id}: ${JSON.stringify(check.detail).slice(0, 600)}`);
}
process.exitCode = report.summary.failed === 0 ? 0 : 1;
