// Responsive, touch and reduced-motion QA for the recovered Knowledge Stage.
//
//   node intelligent-atlas/tools/qa-responsive.mjs
//
// Checks 390, 768, 1024 and 1440 widths, the small-screen list layout, dark
// theme, touch selection and reduced-motion flow. Screenshots go to
// evidence/recovery/responsive/; the receipt to analysis/qa-responsive-recovery.json.
import path from "node:path";
import {
  ANALYSIS,
  EVIDENCE,
  Results,
  api,
  attachErrors,
  launchBrowser,
  layoutSnapshot,
  newContext,
  openPrototype,
  overflow,
  screenshot,
  settle,
  state,
  writeJson,
} from "./qa-lib.mjs";

const results = new Results("qa-responsive-recovery");
const errors = [];
const shots = path.join(EVIDENCE, "responsive");
const browser = await launchBrowser();
const viewports = [
  { id: "390", width: 390, height: 844, static: true },
  { id: "768", width: 768, height: 1024, static: true },
  { id: "1024", width: 1024, height: 800, static: false },
  { id: "1440", width: 1440, height: 960, static: false },
];

try {
  for (const viewport of viewports) {
    const context = await newContext(browser, { viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    attachErrors(page, errors, `${viewport.id}: `);
    await openPrototype(page, "?theme=light");

    const initial = await state(page);
    const initialOverflow = await overflow(page);
    results.add(`responsive:${viewport.id}:scene`, initial.scene === "timeline", initial.scene);
    results.add(`responsive:${viewport.id}:cards`, (await page.locator(".tl-card").count()) === 15, String(await page.locator(".tl-card").count()));
    results.add(`responsive:${viewport.id}:static-layout`, initial.staticLayout === viewport.static, `${initial.staticLayout}/${viewport.static}`);
    results.add(`responsive:${viewport.id}:no-initial-overflow`, initialOverflow.overflowX === false, JSON.stringify(initialOverflow));
    await screenshot(page, shots, `${viewport.id}-timeline-light.png`);

    await page.evaluate(() => {
      window.scrollTo(0, document.getElementById("scene-knowledge").getBoundingClientRect().top + window.scrollY);
    });
    await page.waitForTimeout(220);
    results.add(`responsive:${viewport.id}:entrances`, (await page.locator(".nb-domain").count()) === 5, String(await page.locator(".nb-domain").count()));

    await api(page, "selectConcept", "concept:fabric:shortcut", { scroll: false, limit: 3 });
    await page.waitForTimeout(320);
    const layout = await layoutSnapshot(page);
    const layoutOverflow = await overflow(page);
    results.add(`responsive:${viewport.id}:three-labels`, layout.nodes.length === 3 && layout.nodes.every((node) => node.label), JSON.stringify(layout.nodes.map((node) => node.label)));
    results.add(`responsive:${viewport.id}:no-node-overlap`, layout.overlaps.length === 0, layout.overlaps.join(", "));
    results.add(`responsive:${viewport.id}:nodes-inside`, layout.clipped.length === 0, layout.clipped.join(", "));
    results.add(`responsive:${viewport.id}:no-layout-overflow`, layoutOverflow.overflowX === false, JSON.stringify(layoutOverflow));
    if (viewport.width <= 1024) {
      results.add(`responsive:${viewport.id}:list-mode`, layout.listMode === true, String(layout.listMode));
      results.add(`responsive:${viewport.id}:full-width-labels`, layout.nodes.every((node) => node.w > 200), JSON.stringify(layout.nodes.map((node) => Math.round(node.w))));
    } else {
      results.add(`responsive:${viewport.id}:radial-mode`, layout.listMode === false, String(layout.listMode));
    }
    const panel = await page.evaluate(() => {
      const rect = document.getElementById("context-panel").getBoundingClientRect();
      return { left: rect.left, right: rect.right, width: rect.width, viewport: window.innerWidth };
    });
    results.add(`responsive:${viewport.id}:panel-inside`, panel.left >= -1 && panel.right <= panel.viewport + 1, JSON.stringify(panel));
    await screenshot(page, shots, `${viewport.id}-neighbourhood-light.png`);

    await page.evaluate(() => document.getElementById("theme-toggle").click());
    await settle(page, 240);
    const dark = await state(page);
    const darkOverflow = await overflow(page);
    const darkColors = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const node = getComputedStyle(document.querySelector(".nb-node"));
      return { bodyBg: body.backgroundColor, bodyColor: body.color, nodeBg: node.backgroundColor, nodeColor: node.color };
    });
    results.add(`responsive:${viewport.id}:dark-theme`, dark.theme === "dark", dark.theme);
    results.add(`responsive:${viewport.id}:dark-no-overflow`, darkOverflow.overflowX === false, JSON.stringify(darkOverflow));
    results.add(
      `responsive:${viewport.id}:dark-contrast`,
      darkColors.bodyBg !== darkColors.bodyColor && darkColors.nodeBg !== darkColors.nodeColor,
      JSON.stringify(darkColors),
    );
    await screenshot(page, shots, `${viewport.id}-neighbourhood-dark.png`);
    await context.close();
  }

  const touchContext = await newContext(browser, { viewport: { width: 390, height: 844 }, hasTouch: true });
  const touchPage = await touchContext.newPage();
  attachErrors(touchPage, errors, "touch: ");
  await openPrototype(touchPage, "?theme=light");
  await touchPage.evaluate(() => {
    window.scrollTo(0, document.getElementById("scene-knowledge").getBoundingClientRect().top + window.scrollY);
  });
  await touchPage.waitForTimeout(220);
  await touchPage.locator(".nb-starter").first().tap();
  await touchPage.waitForTimeout(320);
  const touchState = await state(touchPage);
  results.add("touch:starter-opens-concept", Boolean(touchState.conceptId), String(touchState.conceptId));
  const touchLayout = await layoutSnapshot(touchPage);
  results.add("touch:list-layout", touchLayout.listMode === true, String(touchLayout.listMode));
  results.add("touch:no-overflow", (await overflow(touchPage)).overflowX === false, JSON.stringify(await overflow(touchPage)));
  await screenshot(touchPage, shots, "390-touch-neighbourhood.png");
  if (await touchPage.locator(".nb-node").count()) {
    const before = await touchPage.locator(".nb-center-title").innerText();
    await touchPage.locator(".nb-node").first().tap();
    await touchPage.waitForTimeout(300);
    results.add("touch:branch-opens", (await touchPage.locator(".nb-center-title").innerText()) !== before, `${before} -> ${await touchPage.locator(".nb-center-title").innerText()}`);
  } else {
    results.add("touch:branch-opens", true, "selected concept has no recorded branch");
  }
  await touchPage.locator("#field-back").tap();
  await touchPage.waitForTimeout(220);
  results.add("touch:back-to-entrances", (await touchPage.locator(".nb-domain").count()) === 5, String(await touchPage.locator(".nb-domain").count()));
  await touchContext.close();

  for (const viewport of [
    { id: "1440-reduced", width: 1440, height: 960 },
    { id: "390-reduced", width: 390, height: 844 },
  ]) {
    const context = await newContext(browser, {
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    attachErrors(page, errors, `${viewport.id}: `);
    await openPrototype(page, "?theme=light");
    const reduced = await state(page);
    results.add(`reduced:${viewport.id}:static`, reduced.staticLayout === true, String(reduced.staticLayout));
    const flow = await page.evaluate(() => ({
      scenes: [...document.querySelectorAll(".stage-scene")].map((scene) => ({
        id: scene.id,
        position: getComputedStyle(scene).position,
        opacity: getComputedStyle(scene).opacity,
        inert: scene.inert,
      })),
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    }));
    results.add(
      `reduced:${viewport.id}:normal-flow`,
      flow.scenes.every((scene) => scene.position !== "absolute" && scene.opacity === "1" && !scene.inert),
      JSON.stringify(flow.scenes),
    );
    results.add(`reduced:${viewport.id}:no-overflow`, flow.overflow === false, String(flow.overflow));
    await page.evaluate(() => {
      window.scrollTo(0, document.getElementById("scene-knowledge").getBoundingClientRect().top + window.scrollY);
    });
    await page.waitForTimeout(220);
    results.add(
      `reduced:${viewport.id}:entrances`,
      (await page.locator(".nb-domain").count()) === 5,
      String(await page.locator(".nb-domain").count()),
    );
    await screenshot(page, shots, `${viewport.id}-knowledge.png`);
    await context.close();
  }
} finally {
  await browser.close();
}

results.add("runtime:no-errors", errors.length === 0, errors.join(" | "));
await writeJson(path.join(ANALYSIS, "qa-responsive-recovery.json"), results.receipt({ errors }));
console.log(JSON.stringify({ counts: results.counts, failures: results.failures, errors }, null, 1));
if (results.failures.length || errors.length) process.exitCode = 1;
