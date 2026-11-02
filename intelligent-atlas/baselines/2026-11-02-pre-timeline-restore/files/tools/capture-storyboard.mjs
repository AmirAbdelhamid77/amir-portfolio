// Capture the recovered stage evidence and the before/after motion record.
//
//   node intelligent-atlas/tools/capture-storyboard.mjs
//
// Produces:
//   evidence/recovery/before/            rejected V3.1 rail and handoff
//   evidence/recovery/storyboard/        nine interaction frames
//   evidence/recovery/checkpoints/       0/25/50/75/100% stills + receipt
//   evidence/recovery/motion/            forward/reverse/interaction GIFs + raw frames
//   analysis/storyboard-recovery.json
//
// The GIFs are assembled with the already-installed sharp/libvips encoder from
// CDP screencast PNG frames. No ffmpeg, no new dependency, no deployment.
import { copyFile, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  ANALYSIS,
  EVIDENCE,
  Results,
  api,
  attachErrors,
  ensureDir,
  frameStats,
  gifFromPngs,
  launchBrowser,
  newContext,
  openPrototype,
  recordScreencast,
  sceneOpacity,
  screenshot,
  setProgress,
  settle,
  state,
  writeJson,
} from "./qa-lib.mjs";

const results = new Results("storyboard-recovery");
const errors = [];
const beforeDir = path.join(EVIDENCE, "before");
const storyDir = path.join(EVIDENCE, "storyboard");
const checkpointDir = path.join(EVIDENCE, "checkpoints");
const motionDir = path.join(EVIDENCE, "motion");
const responsiveDir = path.join(EVIDENCE, "responsive");
const browser = await launchBrowser();
const checkpoints = [];
const recordings = {};

const scrollForward = async (page) => {
  await page.evaluate(async () => {
    const track = document.getElementById("journey-track");
    const stage = document.getElementById("stage");
    const start = track.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(1, track.offsetHeight - stage.offsetHeight);
    const duration = 3400;
    const started = performance.now();
    await new Promise((resolve) => {
      const step = (now) => {
        const progress = Math.min(1, (now - started) / duration);
        window.scrollTo(0, start + progress * travel);
        if (progress < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  });
};

const scrollReverse = async (page) => {
  await page.evaluate(async () => {
    const track = document.getElementById("journey-track");
    const stage = document.getElementById("stage");
    const start = track.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(1, track.offsetHeight - stage.offsetHeight);
    const duration = 3400;
    const started = performance.now();
    await new Promise((resolve) => {
      const step = (now) => {
        const progress = Math.min(1, (now - started) / duration);
        window.scrollTo(0, start + travel - progress * travel);
        if (progress < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  });
};

try {
  // 1. Before: the rejected V3.1 rail and its separate handoff interlude.
  const baseline = path.join(EVIDENCE, "..", "..", "baselines", "2026-11-02-pre-recovery", "files", "prototype");
  const beforeRuntime = path.join(os.tmpdir(), "hansa-atlas-before");
  await ensureDir(beforeRuntime);
  await ensureDir(beforeDir);
  for (const file of await readdir(baseline)) {
    await copyFile(path.join(baseline, file), path.join(beforeRuntime, file));
  }
  await copyFile(path.join(EVIDENCE, "..", "..", "prototype", "data.js"), path.join(beforeRuntime, "data.js"));
  const beforeContext = await newContext(browser, { viewport: { width: 1440, height: 960 } });
  const beforePage = await beforeContext.newPage();
  attachErrors(beforePage, errors, "before: ");
  await beforePage.goto(`${pathToFileURL(path.join(beforeRuntime, "index.html")).href}?theme=light`, { waitUntil: "load" });
  await beforePage.waitForTimeout(700);
  await screenshot(beforePage, beforeDir, "before-timeline-1440-light.png");
  const handoffTop = await beforePage.evaluate(() => {
    const element = document.getElementById("handoff");
    return element ? element.getBoundingClientRect().top + window.scrollY : null;
  });
  if (handoffTop != null) {
    await beforePage.evaluate((top) => window.scrollTo(0, top + 120), handoffTop);
    await beforePage.waitForTimeout(420);
    await screenshot(beforePage, beforeDir, "before-handoff-1440-light.png");
  }
  results.add("before:timeline-captured", true, "before-timeline-1440-light.png");
  results.add("before:handoff-captured", handoffTop != null, "before-handoff-1440-light.png");
  await beforeContext.close();

  // 2. Recovered stills, checkpoints and interaction frames.
  const context = await newContext(browser, { viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  attachErrors(page, errors);
  await openPrototype(page, "?theme=light");
  await api(page, "selectDate", "2026-10-26", { tween: false });
  await settle(page, 220);
  await screenshot(page, storyDir, "01-timeline.png");
  results.add("storyboard:timeline", true, "01-timeline.png");

  for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
    await setProgress(page, progress);
    await settle(page, 200);
    const sample = await sceneOpacity(page);
    const name = `stage-${String(Math.round(progress * 100)).padStart(3, "0")}-1440-light.png`;
    await screenshot(page, checkpointDir, name);
    checkpoints.push({ requested: progress, ...sample, file: name });
  }
  results.add("checkpoints:five", checkpoints.length === 5, checkpoints.map((entry) => entry.file).join(", "));
  results.add("checkpoints:no-blank", checkpoints.every((entry) => Math.max(entry.timeline, entry.knowledge, entry.closing) >= 0.2), checkpoints.map((entry) => Math.max(entry.timeline, entry.knowledge, entry.closing).toFixed(2)).join(" "));

  await setProgress(page, 0);
  await settle(page, 180);
  await page.click("#open-edition");
  await page.waitForSelector("#dealer-backdrop:not([hidden])");
  await settle(page, 220);
  await screenshot(page, storyDir, "02-dealer.png");
  await page.click("#dealer-locate");
  await page.waitForTimeout(520);
  await settle(page, 180);
  await screenshot(page, storyDir, "03-located.png");
  results.add("storyboard:located", (await state(page)).conceptId === "concept:fabric:shortcut", String((await state(page)).conceptId));

  await page.locator(".nb-node").first().hover();
  await settle(page, 180);
  await screenshot(page, storyDir, "04-preview.png");
  await page.click('.preview-actions button[data-act="deal-concept"]');
  await page.waitForSelector("#dealer-backdrop:not([hidden])");
  await settle(page, 220);
  await screenshot(page, storyDir, "05-open-content.png");
  results.add("storyboard:open-content-deck", (await state(page)).dealer?.startsWith("concept:"), (await state(page)).dealer);
  await page.click("#dealer-close");
  await settle(page, 180);
  await page.locator(".nb-node").first().hover();
  await page.click('.preview-actions button[data-act="explore-concept"]');
  await settle(page, 260);
  await screenshot(page, storyDir, "06-explored.png");
  await page.click("#field-back");
  await settle(page, 200);
  await page.fill("#field-search", "confidence");
  await settle(page, 220);
  await screenshot(page, storyDir, "07-search.png");
  await page.keyboard.press("Escape");
  await page.locator("#field-fallback summary").click();
  await settle(page, 220);
  await screenshot(page, storyDir, "08-table.png");
  await page.locator("#field-fallback summary").click();
  await settle(page, 180);
  await page.click('[data-scene-link="timeline"]');
  await settle(page, 360);
  await screenshot(page, storyDir, "09-return.png");
  results.add("storyboard:return", (await state(page)).scene === "timeline", (await state(page)).scene);

  // 3. Forward and reverse scroll recordings.
  await setProgress(page, 0);
  await settle(page, 260);
  const forward = await recordScreencast(page, () => scrollForward(page), motionDir, "forward", { maxWidth: 960, maxHeight: 640 });
  const forwardGif = await gifFromPngs(forward.files, path.join(motionDir, "forward.gif"), {
    width: 720,
    height: 480,
    delays: forward.delays,
  });
  const forwardStats = await frameStats(forward.files);
  const forwardMin = Math.min(...forwardStats.map((entry) => entry.stdev));
  recordings.forward = {
    frames: forward.files.length,
    ...forwardGif,
    minStdev: forwardMin,
    blankFrames: forwardStats.filter((entry) => entry.stdev < 5).map((entry) => entry.file),
    progress: await page.evaluate(() => window.__ATLAS_STAGE__.getProgress()),
  };
  results.add("motion:forward-frames", forward.files.length > 10, String(forward.files.length));
  results.add("motion:forward-no-blank", forwardMin >= 5, `min stdev ${forwardMin}`);
  results.add("motion:forward-reaches-close", (await state(page)).scene === "closing", (await state(page)).scene);

  await setProgress(page, 1);
  await settle(page, 300);
  const reverse = await recordScreencast(page, () => scrollReverse(page), motionDir, "reverse", { maxWidth: 960, maxHeight: 640 });
  const reverseGif = await gifFromPngs(reverse.files, path.join(motionDir, "reverse.gif"), {
    width: 720,
    height: 480,
    delays: reverse.delays,
  });
  const reverseStats = await frameStats(reverse.files);
  const reverseMin = Math.min(...reverseStats.map((entry) => entry.stdev));
  recordings.reverse = {
    frames: reverse.files.length,
    ...reverseGif,
    minStdev: reverseMin,
    blankFrames: reverseStats.filter((entry) => entry.stdev < 5).map((entry) => entry.file),
    progress: await page.evaluate(() => window.__ATLAS_STAGE__.getProgress()),
  };
  results.add("motion:reverse-frames", reverse.files.length > 10, String(reverse.files.length));
  results.add("motion:reverse-no-blank", reverseMin >= 5, `min stdev ${reverseMin}`);
  results.add("motion:reverse-returns-timeline", (await state(page)).scene === "timeline", (await state(page)).scene);

  // 4. One complete interaction recording: date -> deck -> idea -> branch -> return.
  await setProgress(page, 0);
  await settle(page, 260);
  const interaction = await recordScreencast(
    page,
    async () => {
      await page.click("#open-edition");
      await page.waitForSelector("#dealer-backdrop:not([hidden])");
      await page.waitForTimeout(850);
      await page.click("#dealer-locate");
      await page.waitForTimeout(1100);
      await page.locator(".nb-node").first().hover();
      await page.waitForTimeout(850);
      await page.click('.preview-actions button[data-act="deal-concept"]');
      await page.waitForSelector("#dealer-backdrop:not([hidden])");
      await page.waitForTimeout(800);
      await page.click("#dealer-close");
      await page.waitForTimeout(450);
      await page.locator(".nb-node").first().hover();
      await page.click('.preview-actions button[data-act="explore-concept"]');
      await page.waitForTimeout(900);
      await page.click("#field-back");
      await page.waitForTimeout(650);
      await page.fill("#field-search", "confidence");
      await page.waitForTimeout(750);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(350);
      await page.locator("#field-fallback summary").click();
      await page.waitForTimeout(750);
      await page.locator("#field-fallback summary").click();
      await page.waitForTimeout(450);
      await page.click('[data-scene-link="timeline"]');
      await page.waitForTimeout(900);
    },
    motionDir,
    "interaction",
    { maxWidth: 960, maxHeight: 640 },
  );
  const interactionGif = await gifFromPngs(interaction.files, path.join(motionDir, "interaction.gif"), {
    width: 720,
    height: 480,
    delays: interaction.delays,
  });
  const interactionStats = await frameStats(interaction.files);
  const interactionMin = Math.min(...interactionStats.map((entry) => entry.stdev));
  recordings.interaction = {
    frames: interaction.files.length,
    ...interactionGif,
    minStdev: interactionMin,
    blankFrames: interactionStats.filter((entry) => entry.stdev < 5).map((entry) => entry.file),
  };
  results.add("motion:interaction-frames", interaction.files.length > 20, String(interaction.files.length));
  results.add("motion:interaction-no-blank", interactionMin >= 5, `min stdev ${interactionMin}`);
  results.add("motion:interaction-ends-timeline", (await state(page)).scene === "timeline", (await state(page)).scene);

  // 5. Dark and mobile stills for the visual record.
  await page.evaluate(() => document.getElementById("theme-toggle").click());
  await settle(page, 240);
  await api(page, "goToScene", "knowledge", { instant: true });
  await settle(page, 240);
  await screenshot(page, storyDir, "10-dark-knowledge.png");
  await context.close();

  const mobileContext = await newContext(browser, { viewport: { width: 390, height: 844 }, hasTouch: true });
  const mobilePage = await mobileContext.newPage();
  attachErrors(mobilePage, errors, "mobile: ");
  await openPrototype(mobilePage, "?theme=light");
  await screenshot(mobilePage, responsiveDir, "390-story-timeline.png");
  await mobilePage.evaluate(() => {
    window.scrollTo(0, document.getElementById("scene-knowledge").getBoundingClientRect().top + window.scrollY);
  });
  await settle(mobilePage, 220);
  await screenshot(mobilePage, responsiveDir, "390-story-entrances.png");
  await api(mobilePage, "selectConcept", "concept:fabric:shortcut", { scroll: false, limit: 3 });
  await settle(mobilePage, 280);
  await screenshot(mobilePage, responsiveDir, "390-story-neighbourhood.png");
  results.add("storyboard:mobile-list", await mobilePage.evaluate(() => document.getElementById("field").classList.contains("is-list-layout")));
  await mobileContext.close();
} finally {
  await browser.close();
}

await writeJson(path.join(ANALYSIS, "storyboard-recovery.json"), {
  suite: "storyboard-recovery",
  at: new Date().toISOString(),
  checkpoints,
  recordings,
  counts: results.counts,
  checks: results.checks,
  errors,
});
console.log(JSON.stringify({ counts: results.counts, failures: results.failures, recordings, errors }, null, 1));
if (results.failures.length || errors.length) process.exitCode = 1;
