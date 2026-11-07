// Capture the release-candidate evidence set.
//
//   node docs/release-readiness-20261106/capture-evidence.mjs
//
// Prerequisites: `out-rc/` served on 4396 (scripts/serve-rc.mjs) and the
// original prototype served on 4392. Screenshots are element or viewport crops,
// never full-page: the comparison page shows what a reader actually sees.
//
// The fixed site header is made absolute for element crops so it cannot paint
// over the stage it belongs to.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const RC = process.env.RC_BASE ?? "http://127.0.0.1:4396";
const PROTOTYPE = process.env.PROTOTYPE_BASE ?? "http://127.0.0.1:4392";
const OUT = "docs/release-readiness-20261106/evidence";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: EDGE, headless: true });

async function shot(name, { width = 1280, height = 900, theme = "light", path: url = "/", clip, scrollTo, before, reducedMotion = "no-preference" } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    colorScheme: theme,
    deviceScaleFactor: 1,
    reducedMotion,
  });
  const page = await context.newPage();
  await page.goto(RC + url, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "header{position:absolute !important}" });
  if (scrollTo) {
    await page.locator(scrollTo).scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
  }
  if (before) await before(page);
  await page.waitForTimeout(400);
  if (clip) await page.locator(clip).screenshot({ path: `${OUT}/${name}.png` });
  else await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log("captured", name);
  await context.close();
}

await shot("rc-home-desktop-light", {});
await shot("rc-home-desktop-dark", { theme: "dark" });
await shot("rc-fan", { scrollTo: ".stage-fan", clip: ".stage-fan" });
await shot("rc-fan-focus", {
  scrollTo: ".stage-fan",
  before: async (page) => {
    await page.locator('.stage-fan-item[data-has-edition="true"] button').first().focus();
    await page.waitForTimeout(200);
  },
  clip: ".stage-fan",
});
await shot("rc-dealer", {
  scrollTo: ".stage-peek",
  before: async (page) => {
    await page.getByRole("button", { name: "Open the edition" }).click();
    await page.locator("#dealer-cinematic").waitFor({ state: "visible" });
    // Long enough for the 320 ms entry animation, the dialog's own reflow and
    // the late web-font swap: a 900 ms capture once caught it mid-layout.
    await page.waitForTimeout(1500);
  },
});
await shot("rc-dealer-saved", {
  scrollTo: ".stage-peek",
  before: async (page) => {
    await page.getByRole("button", { name: "Open the edition" }).click();
    await page.locator("#dealer-cinematic").waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Save for later" }).click();
    await page.waitForTimeout(1200);
  },
});
await shot("rc-closing", { scrollTo: "#closing", clip: "#closing" });
await shot("rc-closing-coverage", {
  scrollTo: "#closing",
  before: async (page) => {
    await page.locator("details.stage-close-details summary").click();
    await page.waitForTimeout(300);
  },
  clip: "#closing",
});
await shot("rc-archive", { scrollTo: "#archive", clip: "#archive" });
await shot("rc-home-390", { width: 390, height: 844, scrollTo: "#today" });
await shot("rc-home-390-dark", { width: 390, height: 844, theme: "dark", scrollTo: "#today" });
await shot("rc-home-320", { width: 320, height: 700, scrollTo: "#today" });
await shot("rc-knowledge-scene", { scrollTo: "#edition", clip: "#edition" });

// The original prototype, for the side-by-side.
for (const [name, viewport] of [
  ["prototype-desktop-light", { width: 1280, height: 900, theme: "light" }],
  ["prototype-desktop-dark", { width: 1280, height: 900, theme: "dark" }],
]) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, colorScheme: viewport.theme });
  const page = await context.newPage();
  await page.goto(PROTOTYPE + "/index.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log("captured", name);
  await context.close();
}

await browser.close();
console.log("evidence captured in", OUT);
