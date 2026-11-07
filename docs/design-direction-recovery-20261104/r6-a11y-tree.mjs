// R6 accessibility-tree probe: what a screen reader is handed for the outline.
// Not an AT test - it records the computed accessible names and heading levels
// from Chromium, so the h1 space and the duplicate-h2 fix are evidenced.
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = path.resolve("docs/design-direction-recovery-20261104/evidence");
const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const page = await context.newPage();
await page.goto("http://127.0.0.1:4395/", { waitUntil: "networkidle", timeout: 90_000 });
await page.waitForTimeout(600);

const cdp = await context.newCDPSession(page);
const { nodes } = await cdp.send("Accessibility.getFullAXTree");
const headings = nodes
  .filter((node) => node.role?.value === "heading")
  .map((node) => ({
    level: node.properties?.find((property) => property.name === "level")?.value?.value ?? null,
    name: node.name?.value ?? "",
  }));

const live = nodes
  .filter((node) => node.properties?.some((property) => property.name === "live"))
  .map((node) => ({
    role: node.role?.value ?? null,
    live: node.properties.find((property) => property.name === "live")?.value?.value ?? null,
    name: node.name?.value ?? "",
  }));

const firstTab = await page.evaluate(() => {
  const focusables = [...document.querySelectorAll(".hansa-stage a, .hansa-stage button")].filter(
    (node) => node.offsetParent !== null,
  );
  return focusables.slice(0, 6).map((node) => ({
    tag: node.tagName.toLowerCase(),
    text: node.textContent.replace(/\s+/g, " ").trim().slice(0, 40),
    height: Math.round(node.getBoundingClientRect().height),
  }));
});

const report = {
  url: "http://127.0.0.1:4395/",
  build: "HANSA_POLISH_REVIEW=1",
  headings,
  live,
  firstFocusables: firstTab,
  note: "Chromium accessibility tree, not a screen-reader run. NVDA/VoiceOver remain NOT RUN; this only proves the names and levels the browser exposes.",
};
await writeFile(path.join(OUT, "r6-a11y-tree.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 1));
await browser.close();
