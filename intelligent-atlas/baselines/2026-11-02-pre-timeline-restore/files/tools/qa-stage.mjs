// Desktop stage QA for the recovered Knowledge Stage review prototype.
//
//   node intelligent-atlas/tools/qa-stage.mjs
//
// Covers the card Timeline, the single-viewport Timeline -> Knowledge -> Close
// transition, the Dealer lock, reduced motion and dark theme. Screenshots go to
// evidence/recovery/stage/ and the receipt to analysis/qa-stage-recovery.json.
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
  sceneOpacity,
  screenshot,
  setProgress,
  settle,
  state,
  writeJson,
} from "./qa-lib.mjs";

const results = new Results("qa-stage-recovery");
const errors = [];
const opacities = [];
const shots = path.join(EVIDENCE, "stage");
const browser = await launchBrowser();

try {
  const context = await newContext(browser, { viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  attachErrors(page, errors);
  await openPrototype(page, "?theme=light");
  results.add("runtime:no-errors", errors.length === 0, errors.join(" | "));

  const initial = await state(page);
  results.add("timeline:latest-edition", initial.date === "2026-10-26", initial.date);
  results.add("timeline:no-concept-selected", initial.conceptId === null, String(initial.conceptId));
  results.add("timeline:scene", initial.scene === "timeline", initial.scene);
  results.add("timeline:15-cards", (await page.locator(".tl-card").count()) === 15, String(await page.locator(".tl-card").count()));
  const selectedTitle = await page.locator('.tl-card[aria-current="true"] .tl-card-title').innerText();
  results.add("timeline:focused-card", selectedTitle.includes("Reference"), selectedTitle);
  const todayCard = page.locator('.tl-card[data-date="2026-11-01"]');
  const todayText = await todayCard.innerText();
  results.add("timeline:today-empty", todayText.toLowerCase().includes("no edition today"), todayText.replace(/\n/g, " | "));
  results.add("timeline:today-zero-cards", todayText.toLowerCase().includes("0 cards"), todayText.replace(/\n/g, " | "));
  results.add("timeline:edition-peek", (await page.locator("#edition-peek").innerText()).toLowerCase().includes("edition 03"), await page.locator("#edition-peek").innerText());
  results.add("layout:no-horizontal-overflow", (await overflow(page)).overflowX === false, JSON.stringify(await overflow(page)));
  await screenshot(page, shots, "timeline-1440-light.png");

  await page.locator('.tl-card[aria-current="true"]').focus();
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(520);
  results.add("timeline:arrow-left", (await state(page)).date === "2026-10-25", (await state(page)).date);
  await page.keyboard.press("End");
  await page.waitForTimeout(520);
  results.add("timeline:end-today", (await state(page)).date === "2026-11-01", (await state(page)).date);
  results.add(
    "timeline:today-action-label",
    (await page.locator("#open-edition").innerText()).toLowerCase().includes("empty hand"),
    await page.locator("#open-edition").innerText(),
  );
  await page.keyboard.press("Home");
  await page.waitForTimeout(520);
  results.add("timeline:home-first", (await state(page)).date === "2026-10-18", (await state(page)).date);

  await api(page, "selectDate", "2026-11-01", { tween: false });
  await page.click("#open-edition");
  await page.waitForSelector("#dealer-backdrop:not([hidden])");
  results.add("dealer:today-empty-hand", (await page.locator("#hand-count").innerText()).toLowerCase() === "0 cards", await page.locator("#hand-count").innerText());
  results.add("dealer:today-label", (await page.locator("#hand-label").innerText()) === "The empty hand", await page.locator("#hand-label").innerText());
  results.add(
    "dealer:today-locate-copy",
    (await page.locator("#dealer-locate").innerText()).toLowerCase().includes("subject entrances"),
    await page.locator("#dealer-locate").innerText(),
  );
  results.add("dealer:lock", await page.evaluate(() => document.documentElement.classList.contains("is-stage-locked")));
  await page.click("#dealer-locate");
  await page.waitForTimeout(480);
  const empty = await state(page);
  results.add("empty:no-unrelated-concept", empty.conceptId === null, String(empty.conceptId));
  results.add("empty:scene-knowledge", empty.scene === "knowledge", empty.scene);
  results.add("empty:origin-empty", empty.origin.source === "empty", empty.origin.source);
  results.add("empty:entrances", (await page.locator(".nb-domain").count()) === 5, String(await page.locator(".nb-domain").count()));
  results.add("dealer:unlock", !(await page.evaluate(() => document.documentElement.classList.contains("is-stage-locked"))));

  await api(page, "goToScene", "timeline", { instant: true });
  await api(page, "selectDate", "2026-10-26", { tween: false });
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await page.click("#open-edition");
  await page.waitForSelector("#dealer-backdrop:not([hidden])");
  results.add("dealer:one-card", (await page.locator("#hand-count").innerText()).toLowerCase() === "1 card", await page.locator("#hand-count").innerText());
  results.add("dealer:card-title", (await page.locator(".card-title").innerText()) === "Reference ≠ retained result", await page.locator(".card-title").innerText());
  await page.click("#dealer-close");
  await page.waitForTimeout(160);
  results.add("dealer:restore-scroll", (await page.evaluate(() => window.scrollY)) === scrollBefore, `${scrollBefore}/${await page.evaluate(() => window.scrollY)}`);

  await page.click("#open-edition");
  await page.waitForSelector("#dealer-backdrop:not([hidden])");
  await page.click("#dealer-locate");
  await page.waitForTimeout(520);
  const card = await state(page);
  results.add("card:concept", card.conceptId === "concept:fabric:shortcut", String(card.conceptId));
  results.add("card:origin", card.origin.source === "card", card.origin.source);
  results.add(
    "card:transition-from",
    (await page.locator("#transition-from").innerText()).toLowerCase().includes("26 oct edition"),
    await page.locator("#transition-from").innerText(),
  );
  results.add(
    "card:transition-current",
    (await page.locator("#transition-current").innerText()).toLowerCase().includes("onelake shortcut"),
    await page.locator("#transition-current").innerText(),
  );
  results.add("card:center", (await page.locator(".nb-center-title").innerText()) === "OneLake shortcut", await page.locator(".nb-center-title").innerText());
  const cardLayout = await layoutSnapshot(page);
  results.add("card:three-labels", cardLayout.nodes.length === 3 && cardLayout.nodes.every((node) => node.label), JSON.stringify(cardLayout.nodes.map((node) => node.label)));
  results.add("card:no-overlap", cardLayout.overlaps.length === 0, cardLayout.overlaps.join(", "));
  results.add("card:inside-canvas", cardLayout.clipped.length === 0, cardLayout.clipped.join(", "));
  await screenshot(page, shots, "neighbourhood-shortcut-1440-light.png");

  const samples = [0, 0.1, 0.15, 0.2, 0.22, 0.25, 0.3, 0.4, 0.5, 0.6, 0.68, 0.7, 0.72, 0.74, 0.75, 0.8, 0.9, 1];
  for (const progress of samples) {
    await setProgress(page, progress);
    opacities.push(await sceneOpacity(page));
  }
  const maxContent = opacities.map((sample) => Math.max(sample.timeline, sample.knowledge, sample.closing));
  results.add(
    "motion:no-blank-frame",
    maxContent.every((value) => value >= 0.2),
    opacities.map((sample, index) => `${sample.progress.toFixed(3)}:${maxContent[index].toFixed(2)}`).join(" "),
  );
  results.add("motion:timeline-start", opacities[0].timeline > 0.99, String(opacities[0].timeline));
  results.add("motion:closing-end", opacities.at(-1).closing > 0.99, String(opacities.at(-1).closing));
  const at25 = opacities.find((sample) => Math.abs(sample.progress - 0.25) < 0.01);
  const at75 = opacities.find((sample) => Math.abs(sample.progress - 0.75) < 0.01);
  results.add("motion:timeline-cleared-at-25", at25.timeline < 0.2, String(at25.timeline));
  results.add("motion:knowledge-emerging-at-25", at25.knowledge > 0.2, String(at25.knowledge));
  results.add("motion:knowledge-cleared-at-75", at75.knowledge < 0.2, String(at75.knowledge));
  results.add("motion:closing-emerging-at-75", at75.closing > 0.2, String(at75.closing));
  results.add("motion:zone-knowledge", opacities.find((sample) => Math.abs(sample.progress - 0.5) < 0.01).scene === "knowledge", opacities.find((sample) => Math.abs(sample.progress - 0.5) < 0.01).scene);
  results.add("motion:zone-closing", opacities.at(-1).scene === "closing", opacities.at(-1).scene);

  for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
    await setProgress(page, progress);
    await settle(page, 180);
    await screenshot(page, shots, `stage-${String(Math.round(progress * 100)).padStart(3, "0")}-1440-light.png`);
  }

  for (const progress of [1, 0.75, 0.5, 0.25, 0]) {
    await setProgress(page, progress);
    await settle(page, 120);
  }
  results.add("motion:reverse-returns-timeline", (await state(page)).scene === "timeline", (await state(page)).scene);

  await setProgress(page, 0.5);
  const lockedAt = await page.evaluate(() => window.scrollY);
  await api(page, "openDealer", "daily:2026-10-26");
  await page.waitForTimeout(160);
  const locked = await page.evaluate(() => ({
    y: window.scrollY,
    locked: document.documentElement.classList.contains("is-stage-locked"),
  }));
  results.add("dealer:locks-exact-progress", locked.locked && locked.y === lockedAt, `${lockedAt}/${locked.y}`);
  const lockGeometry = await page.evaluate(() => {
    const stage = document.getElementById("stage").getBoundingClientRect();
    const topbar = document.getElementById("topbar").getBoundingClientRect();
    return {
      stageTop: Math.round(stage.top),
      stageBottom: Math.round(stage.bottom),
      topbarBottom: Math.round(topbar.bottom),
    };
  });
  results.add(
    "dealer:stage-stays-on-screen",
    Math.abs(lockGeometry.stageTop - lockGeometry.topbarBottom) <= 1 && lockGeometry.stageBottom > 800,
    JSON.stringify(lockGeometry),
  );
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(180);
  results.add(
    "dealer:wheel-does-not-scroll",
    (await page.evaluate(() => window.scrollY)) === lockedAt,
    `${lockedAt}/${await page.evaluate(() => window.scrollY)}`,
  );
  await api(page, "closeDealer");
  await page.waitForTimeout(160);
  results.add("dealer:restores-exact-progress", (await page.evaluate(() => window.scrollY)) === lockedAt, `${lockedAt}/${await page.evaluate(() => window.scrollY)}`);

  await page.evaluate(() => document.getElementById("theme-toggle").click());
  await settle(page, 260);
  const dark = await state(page);
  results.add("theme:dark", dark.theme === "dark", dark.theme);
  const darkPocket = await page.evaluate(() => {
    const style = getComputedStyle(document.getElementById("closing-pocket"));
    return { bg: style.backgroundColor, color: style.color };
  });
  results.add("theme:dark-secondary-readable", darkPocket.bg !== "rgb(255, 255, 255)" && darkPocket.color !== darkPocket.bg, JSON.stringify(darkPocket));
  await api(page, "goToScene", "knowledge", { instant: true });
  await settle(page, 260);
  await screenshot(page, shots, "knowledge-1440-dark.png");

  await context.close();

  const reducedContext = await newContext(browser, { viewport: { width: 1440, height: 960 }, reducedMotion: "reduce" });
  const reducedPage = await reducedContext.newPage();
  attachErrors(reducedPage, errors, "reduced: ");
  await openPrototype(reducedPage, "?theme=light");
  const reduced = await state(reducedPage);
  results.add("reduced:static-layout", reduced.staticLayout === true, String(reduced.staticLayout));
  const flow = await reducedPage.evaluate(() => ({
    scenes: [...document.querySelectorAll(".stage-scene")].map((scene) => ({
      id: scene.id,
      position: getComputedStyle(scene).position,
      opacity: getComputedStyle(scene).opacity,
      inert: scene.inert,
    })),
    stage: getComputedStyle(document.getElementById("stage")).position,
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  }));
  results.add(
    "reduced:normal-flow",
    flow.scenes.every((scene) => scene.position === "relative" && scene.opacity === "1" && !scene.inert),
    JSON.stringify(flow.scenes),
  );
  results.add("reduced:no-overflow", flow.overflow === false, String(flow.overflow));
  await reducedPage.evaluate(() => {
    window.scrollTo(0, document.getElementById("scene-knowledge").getBoundingClientRect().top + window.scrollY);
  });
  await reducedPage.waitForTimeout(220);
  results.add(
    "reduced:nav-knowledge",
    await reducedPage.evaluate(() => document.querySelector('[data-scene-link="knowledge"]')?.getAttribute("aria-current") === "true"),
  );
  await screenshot(reducedPage, shots, "reduced-knowledge-1440-light.png");
  await reducedContext.close();
} finally {
  await browser.close();
}

results.add("runtime:no-errors-after-all", errors.length === 0, errors.join(" | "));
await writeJson(path.join(ANALYSIS, "qa-stage-recovery.json"), results.receipt({ errors, opacities }));
console.log(JSON.stringify({ counts: results.counts, failures: results.failures, errors }, null, 1));
if (results.failures.length || errors.length) process.exitCode = 1;
