// R6 evidence capture: the polish layer.
//
//   $env:NODE_PATH="$PWD\node_modules"; node docs/design-direction-recovery-20261104/r6-capture.mjs
//
// Needs the polish export served:
//   $env:HANSA_POLISH_REVIEW="1"; npm run build
//   node scripts/serve-out.mjs 4395
//
// Read-only: writes r6-*.png and r6-report.json into evidence/.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = path.resolve("docs/design-direction-recovery-20261104/evidence");
const BASE = "http://127.0.0.1:4395";
const AXE = path.resolve("node_modules/axe-core/axe.min.js");

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const shots = [];
const report = {
  url: `${BASE}/`,
  flag: "HANSA_POLISH_REVIEW=1",
  viewports: {},
  axe: {},
  console: [],
  shots: [],
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
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForSelector("#today .stage-timeline", { timeout: 45_000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.addStyleTag({ content: "header.fixed{position:absolute !important}" });
  await page.waitForTimeout(500);
  return { page, context, errors };
}

async function shot(page, name, label, options = {}) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), ...options });
  shots.push({ name, label });
}

async function shotOf(page, selector, name, label) {
  await page.locator(selector).screenshot({ path: path.join(OUT, `${name}.png`) });
  shots.push({ name, label });
}

function measure() {
  const stage = document.querySelector(".hansa-stage");
  const textElements = [...stage.querySelectorAll("*")].filter((node) => {
    if (!node.textContent?.trim()) return false;
    if (node.closest("script, style, svg, noscript")) return false;
    return [...node.childNodes].some(
      (child) => child.nodeType === 3 && child.textContent.trim(),
    );
  });
  const round = (value) => Math.round(value * 10) / 10;
  const sizes = new Set();
  let monoLabels = 0;
  const monoLabelSamples = [];
  const smallText = [];
  for (const node of textElements) {
    const style = getComputedStyle(node);
    const size = round(parseFloat(style.fontSize));
    sizes.add(size);
    const mono = /mono/i.test(style.fontFamily);
    const uppercase = style.textTransform === "uppercase";
    const tracked = parseFloat(style.letterSpacing) > 0.5;
    if (mono && (uppercase || tracked)) {
      monoLabels += 1;
      if (monoLabelSamples.length < 12) {
        monoLabelSamples.push(node.textContent.replace(/\s+/g, " ").trim().slice(0, 44));
      }
    }
    if (size < 13 && node.textContent.trim().length > 24) {
      smallText.push({ size, text: node.textContent.replace(/\s+/g, " ").trim().slice(0, 60) });
    }
  }
  const measure = [...stage.querySelectorAll("p, li")]
    .filter((node) => node.textContent.trim().length > 80)
    .slice(0, 24)
    .map((node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      const rects = [...range.getClientRects()].filter((rect) => rect.width > 1);
      const style = getComputedStyle(node);
      const chars = node.textContent.replace(/\s+/g, " ").trim().length;
      return {
        chars,
        lines: rects.length || 1,
        charsPerLine: Math.round(chars / (rects.length || 1)),
        size: round(parseFloat(style.fontSize)),
        selector: node.className?.toString().slice(0, 40) || node.tagName.toLowerCase(),
      };
    });
  const sections = [...document.querySelectorAll("#today, #edition, #closing")].map((node) => {
    const box = node.getBoundingClientRect();
    const children = [...node.querySelectorAll(".stage-scene-inner > *")];
    const contentHeight = children.reduce(
      (total, child) => total + child.getBoundingClientRect().height,
      0,
    );
    return {
      id: node.id,
      height: Math.round(box.height),
      contentHeight: Math.round(contentHeight),
      fill: Math.round((contentHeight / box.height) * 100),
      viewportShare: Math.round((box.height / innerHeight) * 100),
    };
  });
  const targets = [...stage.querySelectorAll("a, button, summary")]
    .map((node) => ({
      height: Math.round(node.getBoundingClientRect().height),
      text: node.textContent.replace(/\s+/g, " ").trim().slice(0, 34),
    }))
    .filter((node) => node.height > 0);
  const headings = [...stage.querySelectorAll("h1, h2, h3, h4")].map((node) => ({
    level: Number(node.tagName[1]),
    text: node.textContent.replace(/\s+/g, " ").trim(),
  }));
  const chrome = {
    header: Math.round(document.querySelector("header")?.getBoundingClientRect().height ?? 0),
    firstSceneTop: Math.round(document.querySelector("#today")?.getBoundingClientRect().top ?? 0),
  };
  return {
    viewport: { width: innerWidth, height: innerHeight },
    polish: document.querySelector(".hansa-stage")?.getAttribute("data-stage-polish") ?? null,
    horizontalOverflow:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    textElements: textElements.length,
    sizes: [...sizes].sort((a, b) => b - a),
    monoLabel: {
      count: monoLabels,
      ratio: Number((monoLabels / textElements.length).toFixed(3)),
      samples: monoLabelSamples,
    },
    smallText: smallText.slice(0, 10),
    measure,
    sections,
    chrome,
    targets: {
      count: targets.length,
      minHeight: Math.min(...targets.map((node) => node.height)),
      under44: targets.filter((node) => node.height < 44),
    },
    headings,
  };
}

async function axeRun(page) {
  await page.addScriptTag({ path: AXE });
  return page.evaluate(async () => {
    const result = await window.axe.run(document.querySelector(".hansa-stage"), {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
    return result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
      help: violation.help,
    }));
  });
}

for (const run of [
  { name: "1280-dark", width: 1280, height: 900, dark: true },
  { name: "1280-light", width: 1280, height: 900, dark: false },
  { name: "1024-light", width: 1024, height: 900, dark: false },
  { name: "390-light", width: 390, height: 844, dark: false },
  { name: "320-light", width: 320, height: 720, dark: false },
]) {
  const { page, context, errors } = await open(run);
  report.viewports[run.name] = await page.evaluate(measure);
  report.axe[run.name] = await axeRun(page);
  report.console.push(...errors.map((error) => `${run.name}: ${error}`));
  await shot(page, `r6-${run.name}-full`, `R6 polish, ${run.name}, full page`, {
    fullPage: true,
  });
  if (run.name === "1280-dark") {
    await shotOf(page, "#today", "r6-today-1280-dark", "Scene 1 after the scale");
    await shotOf(page, ".insight-reading", "r6-reading-1280-dark", "The reading card after the scale");
    await shotOf(page, "#edition .observatory-instrument", "r6-instrument-1280-dark", "The instrument and its label discipline");
    await shotOf(page, "#closing", "r6-close-1280-dark", "The public close after the scale");
    await shotOf(page, "#today .stage-peek", "r6-peek-1280-dark", "The selected edition peek");
  }
  if (run.name === "1280-light") {
    await shotOf(page, "#today", "r6-today-1280-light", "Scene 1, light");
    await shotOf(page, "#closing", "r6-close-1280-light", "The public close, light");
    await shotOf(page, ".insight-reading", "r6-reading-1280-light", "The reading card, light");
  }
  if (run.name === "390-light") {
    await shotOf(page, "#today", "r6-today-390-light", "Scene 1 at 390");
    await shotOf(page, "#closing", "r6-close-390-light", "The close at 390");
    await shotOf(page, ".insight-reading", "r6-reading-390-light", "The reading card at 390");
  }
  await context.close();
}

// Overflow is checked after the last paint, not from the initial measure.
report.shots = shots;
report.note =
  "Single local production-export run of the polish build (HANSA_POLISH_REVIEW=1) with reduced motion, entered at `/`. The other five flags are off, so the stage renders the accepted public shapes with the R6 layer applied. Not field data; a reduced-motion run cannot describe the full-motion budget.";
await writeFile(path.join(OUT, "r6-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(
  JSON.stringify(
    {
      viewports: Object.fromEntries(
        Object.entries(report.viewports).map(([name, value]) => [
          name,
          {
            sizes: value.sizes,
            mono: value.monoLabel,
            overflow: value.horizontalOverflow,
            targets: value.targets,
            headings: value.headings,
            smallText: value.smallText.length,
            sections: value.sections,
          },
        ]),
      ),
      axe: report.axe,
      console: report.console,
      shots: shots.length,
    },
    null,
    2,
  ),
);
await browser.close();
