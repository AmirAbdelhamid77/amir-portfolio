// Browser-level verification for the statistics reference.
//
//   npm run build
//   node scripts/serve-out.mjs 4174
//   node tests/statistics/e2e.mjs
//
// Uses the system Edge installation through playwright-core; no browser bundle
// is downloaded. Screenshots are written to docs/statistics/screenshots/.
import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { JOURNEYS, LABS, journeyHref, labHref } from "../../lib/statistics/content.ts";

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SHOTS = path.join(ROOT, "docs/statistics/screenshots");
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:4174";
const EDGE = process.env.EDGE_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const results = [];
const failures = [];
const consoleErrors = [];

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, status: "PASS" });
  } catch (error) {
    failures.push({ name, error: error instanceof Error ? error.message : String(error) });
    results.push({ name, status: "FAIL" });
  }
}

async function open(viewport = { width: 1440, height: 1000 }) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(`${page.url()} :: ${message.text()}`);
  });
  page.on("pageerror", (error) => consoleErrors.push(`${page.url()} :: PAGEERROR ${error.message}`));
  return { context, page };
}

async function setRange(page, label, value) {
  const locator = page.locator(`input[type="range"][aria-label="${label}"]`);
  await locator.evaluate((element, next) => {
    // React installs its own value tracker on controlled inputs; assigning
    // `element.value` directly is ignored. Use the prototype setter so the
    // dispatched input event is seen as a real change.
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(element, String(next));
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
  await page.waitForTimeout(160);
}

const { context: desktopContext, page: desktop } = await open();

await check("hub renders the visual-first entry point and command palette", async () => {
  await desktop.goto(`${BASE}/learn/statistics/`, { waitUntil: "networkidle" });
  assert.match(await desktop.locator("h1").first().innerText(), /See the statistics/);
  assert.match(await desktop.locator("body").innerText(), /From dot to decision/);
  assert.match(await desktop.locator("body").innerText(), /43 source sections|43 sections/);
  await desktop.keyboard.press("Control+k");
  const palette = desktop.getByRole("dialog", { name: "Command palette" });
  await palette.waitFor({ state: "visible" });
  await palette.getByPlaceholder("Search concepts, sections, labs, formulas…").fill("Poisson");
  await desktop.waitForTimeout(250);
  const dialogText = await palette.innerText();
  assert.match(dialogText, /Poisson/);
  await desktop.keyboard.press("Escape");
  await desktop.waitForTimeout(200);
  assert.equal(await desktop.getByRole("dialog", { name: "Command palette" }).count(), 0);
  await desktop.screenshot({ path: path.join(SHOTS, "desktop-hub.png"), fullPage: false });
});

await check("evidence journey is interactive and exposes each stage", async () => {
  await desktop.goto(`${BASE}/learn/statistics/`, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: /Sampling/ }).first().click();
  await desktop.waitForTimeout(100);
  assert.match(await desktop.locator("body").innerText(), /How would the statistic vary/);
});

await check("source section §10 renders, corrects the Poisson tail, and embeds the lab", async () => {
  await desktop.goto(`${BASE}/learn/statistics/journey/distributions/#s10`, { waitUntil: "networkidle" });
  assert.match(await desktop.locator("h2#s10-title").innerText(), /Poisson/);
  const text = await desktop.locator("body").innerText();
  assert.match(text, /15\.68/);
  assert.match(text, /Verification note/);
  assert.ok((await desktop.locator(".katex").count()) > 10, "KaTeX formulas are rendered");
  await desktop.screenshot({ path: path.join(SHOTS, "desktop-poisson-section.png") });
});

await check("mean–median lab reacts and resets", async () => {
  await desktop.goto(`${BASE}/learn/statistics/labs/center-spread/`, { waitUntil: "networkidle" });
  const before = await desktop.locator("body").innerText();
  assert.match(before, /16\.20/);
  await desktop.getByRole("checkbox", { name: /Add one extreme value/ }).check();
  await desktop.waitForTimeout(150);
  const after = await desktop.locator("body").innerText();
  assert.notEqual(before, after);
  await desktop.getByRole("button", { name: /^Reset$/ }).first().click();
  await desktop.waitForTimeout(150);
  assert.match(await desktop.locator("body").innerText(), /16\.20/);
  await desktop.screenshot({ path: path.join(SHOTS, "desktop-center-spread.png") });
});

await check("p-value lab updates p, decision and sidedness", async () => {
  await desktop.goto(`${BASE}/learn/statistics/labs/p-value/`, { waitUntil: "networkidle" });
  await setRange(desktop, "Observed z", 0.5);
  const text = await desktop.locator("body").innerText();
  assert.match(text, /Fail to reject H₀/);
  assert.match(text, /0\.61/);
  await desktop.getByRole("button", { name: "Hₐ: μ > μ₀" }).click();
  await desktop.waitForTimeout(150);
  assert.match(await desktop.locator("body").innerText(), /Right-tailed|0\.3085/);
  await desktop.screenshot({ path: path.join(SHOTS, "desktop-pvalue.png") });
});

await check("sampling lab skip-to-result reaches the full sampling distribution", async () => {
  await desktop.goto(`${BASE}/learn/statistics/labs/sampling/`, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "Skip to result" }).click();
  await desktop.waitForTimeout(300);
  assert.match(await desktop.locator("body").innerText(), /1200 \/ 1200/);
  assert.match(await desktop.locator("body").innerText(), /Means shown/i);
  await desktop.screenshot({ path: path.join(SHOTS, "desktop-sampling.png") });
});

await check("business lab switches presets, flags small samples and keeps denominators", async () => {
  await desktop.goto(`${BASE}/learn/statistics/labs/business-decision/`, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "Small sample" }).click();
  await desktop.waitForTimeout(150);
  assert.match(await desktop.locator("body").innerText(), /fewer than 30|expected cell count/i);
  await desktop.getByRole("button", { name: "Source-like" }).click();
  await desktop.waitForTimeout(150);
  const text = await desktop.locator("body").innerText();
  assert.match(text, /17\.5%/);
  assert.match(text, /320\/4000/);
  assert.match(text, /376\/4000/);
  await desktop.screenshot({ path: path.join(SHOTS, "desktop-business.png") });
});

await check("correlation lab reveals same-r and confounder structures", async () => {
  await desktop.goto(`${BASE}/learn/statistics/labs/correlation/`, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "U-shape" }).click();
  await desktop.waitForTimeout(200);
  assert.match(await desktop.locator("body").innerText(), /Strong dependence, weak linearity/);
  await desktop.getByRole("button", { name: "Third variable" }).click();
  await desktop.waitForTimeout(200);
  const text = await desktop.locator("body").innerText();
  assert.match(text, /Pooled and within-group disagree|r Group A|0\.9/);
  await desktop.screenshot({ path: path.join(SHOTS, "desktop-correlation.png") });
});

await check("concept atlas selection and formula substitution work", async () => {
  await desktop.goto(`${BASE}/learn/statistics/atlas/`, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "Confounding" }).first().click();
  await desktop.waitForTimeout(150);
  assert.match(await desktop.locator("body").innerText(), /third variable/);
  await desktop.screenshot({ path: path.join(SHOTS, "desktop-atlas.png") });

  await desktop.goto(`${BASE}/learn/statistics/formulas/`, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "Standard error of the mean" }).click();
  await desktop.waitForTimeout(150);
  const labels = await desktop.locator("input[type=number]").evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("id") ?? ""),
  );
  assert.ok(labels.length >= 2);
  await desktop.getByRole("button", { name: "z-score" }).click();
  await desktop.waitForTimeout(150);
  assert.match(await desktop.locator("body").innerText(), /1\.0000/);
});

await check("cheatsheet is printable and carries the formulas and traps", async () => {
  await desktop.goto(`${BASE}/learn/statistics/cheatsheet/`, { waitUntil: "networkidle" });
  const text = await desktop.locator("body").innerText();
  assert.match(text, /field guide/);
  assert.match(text, /p ≤ α/);
  assert.match(text, /15\.68/);
  assert.ok((await desktop.locator(".katex").count()) > 8);
  await desktop.screenshot({ path: path.join(SHOTS, "desktop-cheatsheet.png") });
});

await check("all 15 lab routes load and hydrate without a visible failure", async () => {
  for (const lab of LABS) {
    await desktop.goto(`${BASE}${labHref(lab.slug)}`, { waitUntil: "networkidle" });
    assert.ok((await desktop.locator("h1").count()) >= 1, `${lab.slug} has no h1`);
    const text = await desktop.locator("body").innerText();
    assert.ok(!text.includes("not registered"), `${lab.slug} has an unregistered visual`);
    assert.ok(!text.includes("NaN"), `${lab.slug} shows NaN`);
    assert.ok(text.includes("Reset"), `${lab.slug} has no reset control`);
  }
});

await check("all 9 journey routes expose every source anchor and no missing visual", async () => {
  for (const journey of JOURNEYS) {
    await desktop.goto(`${BASE}${journeyHref(journey.slug)}`, { waitUntil: "networkidle" });
    const text = await desktop.locator("body").innerText();
    assert.ok(!text.includes("is not registered"), `${journey.slug} has an unregistered visual`);
    assert.ok(!text.includes("NaN"), `${journey.slug} shows NaN`);
    for (const number of journey.sections) {
      assert.equal(await desktop.locator(`#s${number}`).count(), 1, `${journey.slug} missing s${number}`);
    }
  }
});

await check("inline exhibits are interactive: sorter, blinding, workflow, switchboard, myths, capstone", async () => {
  await desktop.goto(`${BASE}/learn/statistics/journey/foundations#s2`, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "Discrete", exact: true }).first().click();
  await desktop.waitForTimeout(120);
  assert.match(await desktop.locator("body").innerText(), /Correct\./);

  await desktop.goto(`${BASE}/learn/statistics/journey/experiments#s27`, { waitUntil: "networkidle" });
  const assessor = desktop.getByRole("checkbox", { name: /Experimenter \/ assessor/ });
  await assessor.uncheck();
  await desktop.waitForTimeout(120);
  assert.match(await desktop.locator("body").innerText(), /Protection score/);

  await desktop.goto(`${BASE}/learn/statistics/journey/hypothesis#s16`, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: /Compare with α/ }).click();
  await desktop.waitForTimeout(120);
  assert.match(await desktop.locator("body").innerText(), /Apply the pre-declared threshold/);

  await desktop.goto(`${BASE}/learn/statistics/journey/experiments#s29`, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "Ad spend" }).click();
  await desktop.waitForTimeout(120);
  assert.match(await desktop.locator("body").innerText(), /Observational unless spend is randomized/);

  await desktop.goto(`${BASE}/learn/statistics/journey/synthesis#s39`, { waitUntil: "networkidle" });
  const myth = desktop.locator("details", { hasText: "A p-value is the probability that H₀ is true" }).first();
  await myth.locator("summary").click();
  await desktop.waitForTimeout(120);
  assert.match(await myth.innerText(), /computed \*assuming\* H₀|P\(H₀ \| data\)/);

  await desktop.goto(`${BASE}/learn/statistics/journey/synthesis#s43`, { waitUntil: "networkidle" });
  await desktop.getByRole("checkbox").first().check();
  await desktop.waitForTimeout(120);
  assert.match(await desktop.locator("body").innerText(), /1 \/ 5 checked/);
});

const a11yPages = [
  "/learn/statistics/",
  "/learn/statistics/journey/distributions/",
  "/learn/statistics/labs/sampling/",
  "/learn/statistics/labs/p-value/",
  "/learn/statistics/atlas/",
  "/learn/statistics/formulas/",
  "/learn/statistics/glossary/",
  "/learn/statistics/decision/",
];

await check("interactive controls have accessible names and charts have text alternatives", async () => {
  const issues = [];
  for (const route of a11yPages) {
    await desktop.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    const report = await desktop.evaluate(() => {
      const name = (element) =>
        (element.getAttribute("aria-label") ??
          element.getAttribute("title") ??
          element.textContent ??
          "").trim();
      const buttons = [...document.querySelectorAll("button")].filter((element) => !name(element));
      const inputs = [...document.querySelectorAll("input,select,textarea")].filter(
        (element) =>
          !element.getAttribute("aria-label") &&
          !element.getAttribute("aria-labelledby") &&
          (element.labels?.length ?? 0) === 0,
      );
      const images = [...document.querySelectorAll("img")].filter((element) => !element.getAttribute("alt"));
      const charts = [...document.querySelectorAll("svg")].filter(
        (element) =>
          (element.getAttribute("role") === "img" || element.querySelector("title")) &&
          !element.getAttribute("aria-label") &&
          !element.querySelector("title"),
      );
      return {
        buttons: buttons.length,
        inputs: inputs.length,
        images: images.length,
        charts: charts.length,
        examples: buttons.slice(0, 3).map((element) => element.outerHTML.slice(0, 120)),
      };
    });
    if (report.buttons || report.inputs || report.images || report.charts) {
      issues.push({ route, ...report });
    }
  }
  assert.deepEqual(issues, []);
});

await check("tool navigator routes a test question to the binomial model", async () => {
  await desktop.goto(`${BASE}/learn/statistics/decision/`, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "Test a claim about a population" }).click();
  await desktop.waitForTimeout(120);
  await desktop.getByRole("button", { name: "Successes out of fixed trials" }).click();
  await desktop.waitForTimeout(150);
  assert.match(await desktop.locator("body").innerText(), /Binomial model/);
});

await check("axe-core finds no serious WCAG A/AA violations on representative pages", async () => {
  const routes = [
    "/learn/statistics/",
    "/learn/statistics/journey/distributions/",
    "/learn/statistics/labs/p-value/",
    "/learn/statistics/labs/business-decision/",
    "/learn/statistics/atlas/",
    "/learn/statistics/formulas/",
    "/learn/statistics/glossary/",
    "/learn/statistics/cheatsheet/",
    "/learn/statistics/source/",
  ];
  const failures = [];
  for (const route of routes) {
    await desktop.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await desktop.addScriptTag({ content: AXE });
    const violations = await desktop.evaluate(async () => {
      const main = document.querySelector("main") ?? document.body;
      const result = await window.axe.run(main, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      });
      return result.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.length,
      }));
    });
    if (violations.length) failures.push({ route, violations });
  }
  assert.deepEqual(failures, []);
});

await check("no horizontal page overflow at desktop, tablet and mobile widths", async () => {
  const pages = [
    "/learn/statistics/",
    "/learn/statistics/journey/hypothesis/",
    "/learn/statistics/labs/sampling/",
    "/learn/statistics/labs/correlation/",
    "/learn/statistics/atlas/",
    "/learn/statistics/formulas/",
    "/learn/statistics/glossary/",
    "/learn/statistics/cheatsheet/",
  ];
  for (const width of [1440, 1024, 768, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    for (const route of pages) {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(overflow <= 1, `${route} overflows by ${overflow}px at ${width}px`);
    }
    await context.close();
  }
});

await check("mobile layouts keep the statistics nav and labs usable", async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(`${BASE}/learn/statistics/`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(SHOTS, "mobile-hub.png") });
  await page.goto(`${BASE}/learn/statistics/labs/p-value/`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(SHOTS, "mobile-pvalue.png") });
  assert.match(await page.locator("h1").first().innerText(), /p-value/);
  await page.goto(`${BASE}/learn/statistics/atlas/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Confounding/ }).first().click();
  assert.match(await page.locator("body").innerText(), /third variable/);
  await context.close();
});

await check("reduced motion makes the sampling playback instant", async () => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/learn/statistics/labs/sampling/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Play" }).click();
  await page.waitForTimeout(250);
  assert.match(await page.locator("body").innerText(), /1200 \/ 1200/);
  await context.close();
});

await check("dark theme renders with visible text and no errors", async () => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme: "dark",
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/learn/statistics/labs/confidence/`, { waitUntil: "networkidle" });
  const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert.notEqual(background, "rgb(255, 255, 255)");
  await page.screenshot({ path: path.join(SHOTS, "dark-confidence.png") });
  await context.close();
});

await desktopContext.close();
await browser.close();

const passed = results.filter((result) => result.status === "PASS").length;
console.log(`\nStatistics browser verification: ${passed}/${results.length} checks passed.`);
for (const result of results) console.log(`${result.status === "PASS" ? "PASS" : "FAIL"}  ${result.name}`);
if (consoleErrors.length) {
  console.error("\nConsole/page errors:");
  for (const error of [...new Set(consoleErrors)].slice(0, 20)) console.error(`- ${error}`);
}
if (failures.length || consoleErrors.length) {
  console.error("\nFailures:");
  for (const failure of failures) console.error(`- ${failure.name}: ${failure.error}`);
  process.exit(1);
}
