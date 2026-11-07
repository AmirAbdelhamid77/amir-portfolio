// R2 evidence capture and engineering checks: the edition's neighbourhood,
// wired into the Home's knowledge scene.
//
//   NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r2-capture.mjs
//
// Needs the review export already served (both flags on):
//   $env:HANSA_ATLAS_REVIEW_PREVIEW="1"; $env:HANSA_NEIGHBOURHOOD_REVIEW="1"; npm run build
//   node scripts/serve-out.mjs 4395
//
// Read-only: writes screenshots and r2-report.json into evidence/. It does not
// start a server, change app files or touch publication state.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = path.resolve("docs/design-direction-recovery-20261104/evidence");
const BASE = "http://localhost:4395";
const EDITION = "hansa-insight-shortcut-reference-v1";
const HOME_URL = `${BASE}/?insight=${EDITION}#edition`;
const AXE = path.resolve("node_modules/axe-core/axe.min.js");

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const shots = [];
const report = {
  url: HOME_URL,
  viewports: {},
  keyboard: {},
  handoff: {},
  axe: null,
  axeExpanded: null,
  console: [],
  notes: [],
};

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
  await page.goto(HOME_URL, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForSelector(".nb-embed .nb-field", { timeout: 45_000 });
  // The site header is `position: fixed`; for element captures it would paint
  // over the top of the embed. Absolute keeps it in the document so scrolling
  // the embed into view leaves the captured region clean.
  await page.addStyleTag({ content: "header.fixed{position:absolute !important}" });
  await page.locator("#edition").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  return { page, context, errors };
}

async function shot(page, name, label, fullPage = false) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage });
  shots.push({ name, label });
}

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
    const branches = [...document.querySelectorAll(".nb-embed .nb-branch")].map((element) => ({
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
    const centre = document.querySelector(".nb-embed .nb-centre");
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
    const embed = document.querySelector(".nb-embed");
    const stage = document.querySelector("#edition");
    const field = document.querySelector(".nb-embed .nb-field");
    return {
      breadcrumb: [...document.querySelectorAll(".nb-breadcrumb li")].map((item) =>
        item.textContent.replace(/\s+/g, " ").trim(),
      ),
      groups: [...document.querySelectorAll(".nb-embed .nb-legend li")].map((item) =>
        item.textContent.replace(/\s+/g, " ").trim(),
      ),
      branchTags: [...new Set(branches.map((branch) => branch.group.replace("nb-branch ", "")))],
      branches: branches.length,
      overlaps,
      centreOverlaps,
      centreTitle: document.querySelector(".nb-embed .nb-centre-title")?.textContent?.trim() ?? null,
      embedWidth: embed ? Math.round(embed.getBoundingClientRect().width) : 0,
      stageWidth: stage ? Math.round(stage.getBoundingClientRect().width) : 0,
      fieldHeight: field ? Math.round(field.getBoundingClientRect().height) : 0,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      panelVisible: !!document.querySelector(".nb-embed .nb-panel"),
      coverage: document.querySelector(".nb-embed .nb-coverage")?.textContent?.replace(/\s+/g, " ").trim() ?? null,
      deskHref: document.querySelector(".nb-breadcrumb a")?.getAttribute("href") ?? null,
      editionReading: [...document.querySelectorAll(".nb-embed .nb-edition-reading a")].map((a) => ({
        text: a.textContent.trim(),
        href: a.getAttribute("href"),
      })),
      graphBlock: !!document.querySelector(".stage-graph"),
      emptyState: document.body.innerText.includes("Opening the candidate neighbourhood"),
      headingLevel: document.querySelector(".nb-embed .nb-centre-title")?.tagName ?? null,
    };
  });
}

// ------------------------------------------------------------ 1280 dark
{
  const { page, context, errors } = await open({ width: 1280, height: 900, dark: true });
  report.viewports["1280-dark"] = await measure(page);
  await shotElement(page, ".nb-embed", "r2-embed-dark-1280", "R2 · edition neighbourhood in the Home, dark, 1280");
  await shot(page, "r2-edition-dark-1280", "R2 · knowledge scene with the embed, dark, 1280");

  const first = page.locator(".nb-embed .nb-branch").first();
  await first.hover();
  await page.waitForTimeout(250);
  await shotElement(page, ".nb-embed .nb-fieldcard", "r2-preview-dark-1280", "R2 · branch preview and strip, dark, 1280");
  report.viewports["1280-dark-preview"] = await measure(page);

  // The edition's own concept has four relations and the whole field fits by
  // default, so the expand control must not be offered here.
  report.viewports["1280-dark"]["expandControl"] = await page.locator(".nb-embed .nb-expand").count();
  report.viewports["1280-dark"]["placeControl"] = await page.locator(".nb-embed .nb-text-action").count();

  await page.locator(".nb-embed .nb-fallback summary").click();
  await page.waitForTimeout(200);
  await shotElement(page, ".nb-embed .nb-fallback", "r2-fallback-dark-1280", "R2 · table fallback, dark, 1280");

  // Search inside the Home: focus, type, Enter moves the centre.
  await page.locator(".nb-embed .nb-search input").focus();
  await page.keyboard.type("mirroring");
  await page.waitForTimeout(300);
  await shotElement(page, ".nb-embed", "r2-search-dark-1280", "R2 · concept search in the Home, dark, 1280");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  const searched = page.locator(".nb-embed .nb-centre-title");
  report.keyboard.search = {
    query: "mirroring",
    centre: (await searched.textContent())?.trim(),
    breadcrumb: (await page.locator(".nb-breadcrumb li:nth-child(2)").textContent())?.trim(),
  };
  await shotElement(page, ".nb-embed .nb-fieldcard", "r2-search-result-dark-1280", "R2 · searched centre, dark, 1280");

  // A concept with more relations than the default field holds (Direct Lake,
  // eight): the expand control appears, places them all, and offers "fewer".
  await page.locator(".nb-embed .nb-search input").focus();
  await page.keyboard.type("direct lake");
  await page.waitForTimeout(250);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  const before = await measure(page);
  const place = page.locator(".nb-embed .nb-text-action");
  report.expand = {
    beforeBranches: before.branches,
    controlVisible: await place.isVisible().catch(() => false),
    label: ((await place.textContent().catch(() => "")) ?? "").trim(),
  };
  if (report.expand.controlVisible) {
    await place.click();
    await page.waitForTimeout(400);
    const after = await measure(page);
    report.expand.afterBranches = after.branches;
    report.expand.afterLabel = ((await place.textContent().catch(() => "")) ?? "").trim();
    report.expand.overlaps = after.overlaps;
    await shotElement(page, ".nb-embed .nb-fieldcard", "r2-expanded-dark-1280", "R2 · expanded field (Direct Lake, 8 relations), dark, 1280");
  }

  // Axe on a fresh load of the embed.
  await page.goto(HOME_URL, { waitUntil: "networkidle" });
  await page.waitForSelector(".nb-embed .nb-field");
  await page.addScriptTag({ path: AXE });
  report.axe = await page.evaluate(async () => {
    const results = await window.axe.run(".nb-embed", {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
    return results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    }));
  });
  await page.locator(".nb-embed .nb-search input").focus();
  await page.keyboard.type("direct lake");
  await page.waitForTimeout(250);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  await page.locator(".nb-embed .nb-text-action").click();
  await page.waitForTimeout(400);
  report.axeExpanded = await page.evaluate(async () => {
    const results = await window.axe.run(".nb-embed", {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
    return results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    }));
  });

  // Hand-off: breadcrumb -> Atlas desk -> back to the edition.
  await page.locator(".nb-breadcrumb a").click();
  await page.waitForLoadState("networkidle");
  const deskUrl = page.url();
  const deskParams = new URL(deskUrl).searchParams;
  const back = page.getByRole("link", { name: /back to the edition/i });
  report.handoff = {
    deskUrl,
    backVisible: await back.isVisible().catch(() => false),
    backHref: (await back.getAttribute("href").catch(() => null)) ?? null,
    deskConcept: deskParams.get("concept"),
    deskReturn: deskParams.get("return"),
  };
  await shot(page, "r2-atlas-desk-dark-1280", "R2 · Atlas desk with the return path, dark, 1280");
  if (report.handoff.backVisible) {
    await back.click();
    await page.waitForLoadState("networkidle");
    await page.waitForSelector(".nb-embed .nb-field", { timeout: 45_000 });
    report.handoff.returnedTo = page.url();
    report.handoff.returnedToEdition = page.url().includes(`insight=${EDITION}`) && page.url().endsWith("#edition");
    await shot(page, "r2-return-dark-1280", "R2 · returned to the edition, dark, 1280");
  }

  report.console.push(...errors);
  await context.close();
}

// ------------------------------------------------------------ 1280 light
{
  const { page, context, errors } = await open({ width: 1280, height: 900, dark: false });
  report.viewports["1280-light"] = await measure(page);
  await shotElement(page, ".nb-embed", "r2-embed-light-1280", "R2 · edition neighbourhood in the Home, light, 1280");
  await shot(page, "r2-edition-light-1280", "R2 · knowledge scene with the embed, light, 1280");
  report.console.push(...errors);
  await context.close();
}

// ------------------------------------------------------------- 1024 light
{
  const { page, context, errors } = await open({ width: 1024, height: 900, dark: false });
  report.viewports["1024-light"] = await measure(page);
  await shotElement(page, ".nb-embed", "r2-embed-light-1024", "R2 · edition neighbourhood, light, 1024");
  report.console.push(...errors);
  await context.close();
}

// ------------------------------------------------------------- 390 light
{
  const { page, context, errors } = await open({ width: 390, height: 844, dark: false });
  report.viewports["390-light"] = await measure(page);
  await shotElement(page, ".nb-embed", "r2-embed-light-390", "R2 · edition neighbourhood, light, 390");
  await shot(page, "r2-edition-light-390", "R2 · knowledge scene with the embed, light, 390");
  report.console.push(...errors);
  await context.close();
}

// -------------------------------------------------------------- 390 dark
{
  const { page, context, errors } = await open({ width: 390, height: 844, dark: true });
  report.viewports["390-dark"] = await measure(page);
  await shotElement(page, ".nb-embed", "r2-embed-dark-390", "R2 · edition neighbourhood, dark, 390");
  report.console.push(...errors);
  await context.close();
}

// ------------------------------------------------- 320 px overflow probe
{
  const { page, context, errors } = await open({ width: 320, height: 720, dark: false });
  report.viewports["320-light"] = await measure(page);
  report.console.push(...errors);
  await context.close();
}

await browser.close();
report.shots = shots;
report.note =
  "Single local run in Edge headless with reduced motion against the review export; a passing axe scan is not a screen-reader pass.";
await writeFile(path.join(OUT, "r2-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
