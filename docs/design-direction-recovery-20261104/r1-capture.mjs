// R1 evidence capture and engineering checks for the neighbourhood review surface.
//
//   NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r1-capture.mjs
//
// The dev server must already be running with the review flag on:
//   $env:HANSA_ATLAS_REVIEW_PREVIEW="1"; npm run dev -- -p 4391
//
// Use `localhost`, not `127.0.0.1`: Next dev blocks its client chunks and HMR
// for another origin, so the page renders but never hydrates.
//
// Read-only: writes screenshots and r1-report.json into evidence/. It does not
// start a server, change app files or touch publication state.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = path.resolve("docs/design-direction-recovery-20261104/evidence");
const URL = "http://localhost:4391/review/neighbourhood/";
const AXE = path.resolve("node_modules/axe-core/axe.min.js");

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const shots = [];
const report = { url: URL, viewports: {}, keyboard: {}, axe: null, console: [], notes: [] };

async function open({ width = 1280, height = 900, dark = true } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await context.addInitScript((isDark) => {
    try {
      window.localStorage.setItem("amir-theme", isDark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, dark);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  await page.goto(URL, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForSelector(".nb-field", { timeout: 30_000 });
  await page.waitForTimeout(500);
  return { page, context, errors };
}

async function shot(page, name, label, fullPage = false) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage });
  shots.push({ name, label });
}

/** A single element, so a scrolled state is captured whole and not by accident. */
async function shotElement(page, selector, name, label) {
  await page.locator(selector).screenshot({ path: path.join(OUT, `${name}.png`) });
  shots.push({ name, label });
}

async function measure(page) {
  return page.evaluate(() => {
    const rect = (element) => {
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    };
    const branches = [...document.querySelectorAll(".nb-branch")].map((element) => ({
      title: element.querySelector(".nb-branch-title")?.textContent?.trim() ?? "",
      group: element.className,
      ...rect(element),
    }));
    const overlaps = [];
    for (let a = 0; a < branches.length; a += 1) {
      for (let b = a + 1; b < branches.length; b += 1) {
        const left = Math.max(branches[a].x, branches[b].x);
        const right = Math.min(branches[a].x + branches[a].width, branches[b].x + branches[b].width);
        const top = Math.max(branches[a].y, branches[b].y);
        const bottom = Math.min(branches[a].y + branches[a].height, branches[b].y + branches[b].height);
        if (right - left > 1 && bottom - top > 1) {
          overlaps.push([branches[a].title, branches[b].title, Math.round(right - left), Math.round(bottom - top)]);
        }
      }
    }
    const centre = document.querySelector(".nb-centre");
    const centreBox = centre ? rect(centre) : null;
    const centreOverlaps = centreBox
      ? branches
          .filter((branch) => {
            const left = Math.max(centreBox.x, branch.x);
            const right = Math.min(centreBox.x + centreBox.width, branch.x + branch.width);
            const top = Math.max(centreBox.y, branch.y);
            const bottom = Math.min(centreBox.y + centreBox.height, branch.y + branch.height);
            return right - left > 1 && bottom - top > 1;
          })
          .map((branch) => branch.title)
      : [];
    const field = document.querySelector(".nb-field");
    const header = document.querySelector("header");
    const kicker = document.querySelector(".nb-masthead .nb-kicker");
    return {
      branches: branches.length,
      overlaps,
      centreOverlaps,
      fieldHeight: field ? Math.round(field.getBoundingClientRect().height) : 0,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      centreTitle: document.querySelector(".nb-centre-title")?.textContent?.trim() ?? null,
      branchTags: [...new Set(branches.map((branch) => branch.group.replace("nb-branch ", "")))],
      headerGap:
        header && kicker
          ? Math.round(kicker.getBoundingClientRect().top - header.getBoundingClientRect().bottom)
          : null,
      cardSize: (() => {
        const card = document.querySelector(".nb-branch");
        if (!card) return null;
        const box = card.getBoundingClientRect();
        return { width: Math.round(box.width), height: Math.round(box.height) };
      })(),
    };
  });
}

// ------------------------------------------------------------ 1280 dark
{
  const { page, context, errors } = await open({ width: 1280, height: 900, dark: true });
  await shot(page, "r1-field-dark-1280", "R1 · neighbourhood field, dark, 1280");
  await shot(page, "r1-field-full-dark-1280", "R1 · field + panel, dark, 1280", true);
  report.viewports["1280-dark"] = await measure(page);

  const first = page.locator(".nb-branch").first();
  await first.hover();
  await page.waitForTimeout(250);
  await shotElement(page, ".nb-fieldcard", "r1-preview-dark-1280", "R1 · branch preview and preview strip, dark, 1280");

  await page.locator(".nb-text-action").click();
  await page.waitForTimeout(350);
  report.viewports["1280-dark-expanded"] = await measure(page);
  await shotElement(page, ".nb-fieldcard", "r1-expanded-dark-1280", "R1 · expanded neighbourhood, dark, 1280");

  await page.locator(".nb-fallback summary").click();
  await page.waitForTimeout(200);
  await shotElement(page, ".nb-fallback", "r1-fallback-dark-1280", "R1 · table fallback open, dark, 1280");

  await page.locator(".nb-back").click();
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await shot(page, "r1-entrances-dark-1280", "R1 · subject entrances, dark, 1280");
  await shotElement(page, ".nb-entrances", "r1-entrances-full-dark-1280", "R1 · entrances in full, dark, 1280");
  report.viewports["entrances-1280-dark"] = await measure(page);

  // Search: `/` then a query, then Enter opens the first result.
  await page.locator(".nb-back").count();
  await page.keyboard.press("/");
  await page.keyboard.type("mirroring");
  await page.waitForTimeout(300);
  await shot(page, "r1-search-dark-1280", "R1 · concept search, dark, 1280");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  const searched = await page.locator(".nb-centre-title").textContent();
  report.keyboard.search = {
    query: "mirroring",
    centre: searched?.trim(),
    matchedMirroring: /mirror/i.test(searched ?? ""),
  };
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  report.keyboard.escape = {
    entrancesVisible: await page.locator(".nb-entrances").isVisible(),
  };
  await shot(page, "r1-keyboard-escape-dark-1280", "R1 · Escape returns to entrances", false);

  // Axe on the field (fresh load so the expanded state does not skew it).
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForSelector(".nb-field");
  await page.addScriptTag({ path: AXE });
  report.axe = await page.evaluate(async () => {
    const results = await window.axe.run(".nb-review", {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
    return results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    }));
  });

  // The same scan with every branch placed: the busiest layout is the one most
  // likely to break contrast or name rules.
  await page.locator(".nb-text-action").click();
  await page.waitForTimeout(400);
  report.axeExpanded = await page.evaluate(async () => {
    const results = await window.axe.run(".nb-review", {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
    return results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    }));
  });

  report.console.push(...errors);
  await context.close();
}

// ------------------------------------------------------------ 1280 light
{
  const { page, context, errors } = await open({ width: 1280, height: 900, dark: false });
  await shot(page, "r1-field-light-1280", "R1 · neighbourhood field, light, 1280");
  await shot(page, "r1-field-full-light-1280", "R1 · field + panel, light, 1280", true);
  report.viewports["1280-light"] = await measure(page);
  await page.locator(".nb-back").click();
  await page.waitForTimeout(300);
  await shot(page, "r1-entrances-light-1280", "R1 · subject entrances, light, 1280");
  report.console.push(...errors);
  await context.close();
}

// ------------------------------------------------------------- 1024 light
// The smallest viewport that still draws the fan; below this the field is a list.
{
  const { page, context, errors } = await open({ width: 1024, height: 900, dark: false });
  await shot(page, "r1-field-light-1024", "R1 · neighbourhood field, light, 1024");
  report.viewports["1024-light"] = await measure(page);
  await page.locator(".nb-text-action").click();
  await page.waitForTimeout(350);
  report.viewports["1024-light-expanded"] = await measure(page);
  await shotElement(page, ".nb-fieldcard", "r1-expanded-light-1024", "R1 · expanded field, light, 1024");
  report.console.push(...errors);
  await context.close();
}

// ------------------------------------------------------------- 390 light
{
  const { page, context, errors } = await open({ width: 390, height: 844, dark: false });
  await shot(page, "r1-field-light-390", "R1 · neighbourhood list, light, 390");
  await shot(page, "r1-field-full-light-390", "R1 · field + panel, light, 390", true);
  report.viewports["390-light"] = await measure(page);
  await page.locator(".nb-back").click();
  await page.waitForTimeout(300);
  await shot(page, "r1-entrances-light-390", "R1 · subject entrances, light, 390");
  report.viewports["entrances-390-light"] = await measure(page);
  report.console.push(...errors);
  await context.close();
}

// -------------------------------------------------------------- 390 dark
{
  const { page, context, errors } = await open({ width: 390, height: 844, dark: true });
  await shot(page, "r1-field-dark-390", "R1 · neighbourhood list, dark, 390");
  await shot(page, "r1-field-full-dark-390", "R1 · field + panel, dark, 390", true);
  report.viewports["390-dark"] = await measure(page);
  report.console.push(...errors);
  await context.close();
}

// ------------------------------------------------- 320 px overflow probe
{
  const { page, context, errors } = await open({ width: 320, height: 720, dark: false });
  report.viewports["320-light"] = await measure(page);
  await shot(page, "r1-field-light-320", "R1 · narrow field, light, 320");
  report.console.push(...errors);
  await context.close();
}

await browser.close();
report.shots = shots;
report.note =
  "Single local run in Edge headless with reduced motion; a passing axe scan is not a screen-reader pass.";
await writeFile(path.join(OUT, "r1-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
