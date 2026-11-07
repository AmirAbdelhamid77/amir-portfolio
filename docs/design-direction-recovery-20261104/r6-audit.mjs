// R6 audit probe: measure the public stage's typography, label noise, composition,
// motion and target sizes before any polish is designed.
//
//   NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r6-audit.mjs
//
// Requires the FLAG-OFF static export served by `node scripts/serve-out.mjs 4395`
// (build with none of the HANSA_* variables set), because R6 must start from what
// the public build actually renders, not from a review variant.
//
// Read-only: writes evidence/r6-audit.json and one full-page capture per viewport.
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://127.0.0.1:4395";
const OUT = path.resolve("docs/design-direction-recovery-20261104/evidence");

function audit() {
  const stage = document.querySelector(".hansa-stage");
  const textElements = [...stage.querySelectorAll("*")].filter((node) => {
    if (!node.textContent?.trim()) return false;
    if (node.closest("script, style, svg, noscript")) return false;
    // Only elements that own text, not containers repeating it.
    return [...node.childNodes].some((child) => child.nodeType === 3 && child.textContent.trim());
  });
  const bucket = (value) => {
    if (/mono/i.test(value)) return "mono";
    if (/serif|georgia|times|songti|noto serif/i.test(value)) return "serif";
    return "sans";
  };
  const round = (value) => Math.round(value * 10) / 10;
  const sizes = new Map();
  const families = new Map();
  let monoLabels = 0;
  let monoLabelSamples = [];
  const smallText = [];
  for (const node of textElements) {
    const style = getComputedStyle(node);
    const size = round(parseFloat(style.fontSize));
    const family = bucket(style.fontFamily);
    const key = `${size}/${family}/${style.fontWeight}`;
    const entry = sizes.get(key) ?? { size, family, weight: style.fontWeight, count: 0, samples: [] };
    entry.count += 1;
    if (entry.samples.length < 4) {
      entry.samples.push(node.textContent.replace(/\s+/g, " ").trim().slice(0, 48));
    }
    sizes.set(key, entry);
    families.set(family, (families.get(family) ?? 0) + 1);

    const uppercase = style.textTransform === "uppercase";
    const tracked = parseFloat(style.letterSpacing) > 0.5;
    if (family === "mono" && (uppercase || tracked)) {
      monoLabels += 1;
      if (monoLabelSamples.length < 12) {
        monoLabelSamples.push(node.textContent.replace(/\s+/g, " ").trim().slice(0, 44));
      }
    }
    if (size < 12 && node.textContent.trim().length > 24) {
      smallText.push({ size, text: node.textContent.replace(/\s+/g, " ").trim().slice(0, 60) });
    }
  }

  // Reading measure: chars per rendered line for the longest paragraphs.
  const measure = [...stage.querySelectorAll("p, li")]
    .filter((node) => node.textContent.trim().length > 80)
    .slice(0, 24)
    .map((node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      const rects = [...range.getClientRects()].filter((rect) => rect.width > 1);
      const width = Math.max(...rects.map((rect) => rect.width), 0);
      const style = getComputedStyle(node);
      const chars = node.textContent.replace(/\s+/g, " ").trim().length;
      const lines = rects.length || 1;
      return {
        chars,
        lines,
        charsPerLine: Math.round(chars / lines),
        width: Math.round(width),
        size: round(parseFloat(style.fontSize)),
        selector: node.className?.toString().slice(0, 40) || node.tagName.toLowerCase(),
      };
    });

  // Topbar geometry: does the fixed header cover the first content at rest?
  const header = document.querySelector("header");
  const headerBox = header?.getBoundingClientRect();
  const stageBox = stage.getBoundingClientRect();
  const firstScene = document.querySelector("#today");
  const firstSceneBox = firstScene?.getBoundingClientRect();
  const masthead = document.querySelector(".hansa-stage .font-mono");
  const mastheadBox = masthead?.getBoundingClientRect();

  // Section composition: how much of each scene is content vs air.
  const sections = [...document.querySelectorAll("#today, #edition, #closing")].map((node) => {
    const box = node.getBoundingClientRect();
    const children = [...node.querySelectorAll(".stage-scene-inner > *")];
    const contentHeight = children.reduce((total, child) => {
      const childBox = child.getBoundingClientRect();
      return total + childBox.height;
    }, 0);
    return {
      id: node.id,
      height: Math.round(box.height),
      contentHeight: Math.round(contentHeight),
      fill: Math.round((contentHeight / box.height) * 100),
      viewportShare: Math.round((box.height / innerHeight) * 100),
    };
  });

  // Motion inventory under the current preference.
  const animated = [];
  const transitions = [];
  for (const node of stage.querySelectorAll("*")) {
    const style = getComputedStyle(node);
    if (style.animationName && style.animationName !== "none") {
      animated.push({
        name: style.animationName,
        duration: style.animationDuration,
        className: node.className?.toString().slice(0, 36) || node.tagName.toLowerCase(),
      });
    }
    const property = style.transitionProperty;
    if (property && property !== "none" && property !== "all") {
      const duration = Math.max(
        ...style.transitionDuration.split(",").map((value) => parseFloat(value) || 0),
      );
      if (duration > 0) {
        transitions.push({
          property: property.slice(0, 40),
          duration,
          className: node.className?.toString().slice(0, 30) || node.tagName.toLowerCase(),
        });
      }
    }
  }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Targets and headings.
  const targets = [...stage.querySelectorAll("a, button, summary")]
    .map((node) => ({
      tag: node.tagName.toLowerCase(),
      height: Math.round(node.getBoundingClientRect().height),
      text: node.textContent.replace(/\s+/g, " ").trim().slice(0, 34),
    }))
    .filter((node) => node.height > 0);
  const smallTargets = targets.filter((node) => node.height < 44);
  const headings = [...stage.querySelectorAll("h1, h2, h3, h4")].map((node) => ({
    level: Number(node.tagName[1]),
    text: node.textContent.replace(/\s+/g, " ").trim().slice(0, 44),
  }));

  return {
    viewport: { width: innerWidth, height: innerHeight },
    reducedMotion: reduced,
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    textElements: textElements.length,
    families: Object.fromEntries(families),
    sizes: [...sizes.values()].sort((a, b) => b.size - a.size),
    monoLabel: { count: monoLabels, ratio: Number((monoLabels / textElements.length).toFixed(3)), samples: monoLabelSamples },
    smallText: smallText.slice(0, 10),
    measure,
    chrome: {
      header: headerBox && { height: Math.round(headerBox.height), bottom: Math.round(headerBox.bottom) },
      stageTop: Math.round(stageBox.top),
      firstScene: firstSceneBox && { top: Math.round(firstSceneBox.top), height: Math.round(firstSceneBox.height) },
      masthead: mastheadBox && { top: Math.round(mastheadBox.top), height: Math.round(mastheadBox.height) },
      headerCoversFirstScene: Boolean(headerBox && firstSceneBox && headerBox.bottom > firstSceneBox.top),
    },
    sections,
    motion: {
      animated,
      animationCount: animated.length,
      transitions,
      transitionCount: transitions.length,
      longest: Math.max(0, ...animated.map((item) => parseFloat(item.duration) || 0)),
      longAnimations: animated.filter((item) => (parseFloat(item.duration) || 0) > 0.4),
    },
    targets: {
      count: targets.length,
      minHeight: Math.min(...targets.map((node) => node.height)),
      under44: smallTargets.slice(0, 12),
      under44Count: smallTargets.length,
    },
    headings,
  };
}

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const report = { base: BASE, entry: "/", runs: {} };

for (const run of [
  { name: "1280-dark", width: 1280, height: 900, dark: true },
  { name: "390-light", width: 390, height: 844, dark: false },
]) {
  const context = await browser.newContext({
    viewport: { width: run.width, height: run.height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await context.addInitScript((isDark) => {
    try {
      window.localStorage.setItem("amir-theme", isDark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, run.dark);
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(1200);
  report.runs[run.name] = await page.evaluate(audit);
  await page.screenshot({
    path: path.join(OUT, `r6-audit-${run.name}.png`),
    fullPage: true,
  });
  // Section crops at the same scroll positions as r6-capture so the owner
  // compares like with like, not a full page against a fragment.
  await page.addStyleTag({ content: "header.fixed{position:absolute !important}" });
  for (const [label, selector] of [
    ["today", "#today"],
    ["reading", ".insight-reading"],
    ["close", "#closing"],
  ]) {
    await page.locator(selector).screenshot({
      path: path.join(OUT, `r6-audit-${run.name}-${label}.png`),
    });
  }
  await context.close();
}

report.note =
  "Single local production-export run of the flag-off build with reduced motion, entered at `/`. These numbers describe the public stage only; no review flag is set. A reduced-motion run cannot describe the full-motion budget, so entrance animations are listed as they resolve under that preference.";
await writeFile(path.join(OUT, "r6-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
await browser.close();
