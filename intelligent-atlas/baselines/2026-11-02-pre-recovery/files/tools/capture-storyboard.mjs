// Captures the V3.1 nine-frame storyboard and motion evidence.
//
//   node intelligent-atlas/tools/capture-storyboard.mjs
//
// Uses the locally installed Microsoft Edge through playwright-core against
// the file:// review prototype and the file:// public projection. No network,
// no build, no deployment. Screenshots go to storyboard/v31/ and
// evidence/v31/motion/. The JSON receipt records the state at every capture so
// a still frame cannot be mistaken for a claim about unrecorded animation.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ROOT = path.resolve("intelligent-atlas");
const PROTOTYPE = pathToFileURL(path.join(ROOT, "prototype", "index.html")).href;
const PUBLIC = pathToFileURL(path.join(ROOT, "public", "index.html")).href;
const STORY = path.join(ROOT, "storyboard", "v31");
const EVIDENCE = path.join(ROOT, "evidence", "v31");
const MOTION = path.join(EVIDENCE, "motion");

const checks = [];
const frames = [];
const motion = [];
const consoleErrors = [];
const pageErrors = [];

const check = (id, pass, detail) => checks.push({ id, status: pass ? "PASS" : "FAIL", detail });
const record = (list, entry) => list.push({ ...entry, at: new Date().toISOString() });

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: "no-preference" });
const page = await context.newPage();
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => pageErrors.push(error.message));

const settle = async (ms = 320) => {
  await page.evaluate(() => document.getElementById("toast")?.classList.remove("is-visible"));
  await page.waitForTimeout(ms);
};
const jumpTo = (id) =>
  page.evaluate((sectionId) => document.getElementById(sectionId)?.scrollIntoView({ behavior: "instant", block: "start" }), id);
const shot = async (directory, name) => {
  await mkdir(directory, { recursive: true });
  await page.screenshot({ path: path.join(directory, name), fullPage: false });
  return name;
};
const state = () => page.evaluate(() => window.__ATLAS_STAGE__.getState());
const setHandoff = async (progress) => {
  await page.evaluate((value) => {
    const section = document.getElementById("handoff");
    const top = section.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(1, section.offsetHeight - window.innerHeight);
    window.scrollTo({ top: top + travel * value, behavior: "instant" });
  }, progress);
  await page.waitForTimeout(380);
};
const handoffSnapshot = () =>
  page.evaluate(() => {
    const section = document.getElementById("handoff");
    const token = document.getElementById("handoff-token");
    const style = getComputedStyle(section);
    const tokenStyle = getComputedStyle(token);
    return {
      cssProgress: Number(style.getPropertyValue("--handoff")) || 0,
      sectionHeight: section.offsetHeight,
      viewportHeight: window.innerHeight,
      tokenTransform: tokenStyle.transform,
      tokenRadius: tokenStyle.borderRadius,
      tokenKindOpacity: getComputedStyle(token.querySelector(".token-kind")).opacity,
      tokenTitleOpacity: getComputedStyle(token.querySelector(".token-title")).opacity,
      tokenMetaOpacity: getComputedStyle(token.querySelector(".token-meta")).opacity,
      scrollY: Math.round(window.scrollY),
    };
  });
const panelScrollTo = (selector) =>
  page.evaluate((query) => {
    const panel = document.getElementById("context-panel");
    const target = panel.querySelector(query);
    if (!target) return null;
    const offset = target.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop;
    panel.scrollTop = Math.max(0, offset - 18);
    return panel.scrollTop;
  }, selector);

const captureFrame = async (number, slug, title, note, data = "candidate review") => {
  const file = await shot(STORY, `frame-${String(number).padStart(2, "0")}-${slug}.png`);
  record(frames, { number, title, file, note, data, state: await state() });
};

try {
  await page.goto(`${PROTOTYPE}?theme=light`, { waitUntil: "load" });
  await page.waitForFunction(() => Boolean(window.__ATLAS_STAGE__), { timeout: 15000 });
  await page.waitForTimeout(700);

  /* ------------------------------------------------------- 1. timeline entry */
  await jumpTo("scene-timeline");
  await settle(500);
  const timeline = await page.evaluate(() => ({
    date: document.querySelector('.rail-day[aria-selected="true"]')?.dataset.date,
    title: document.querySelector("#edition-band .band-title")?.textContent,
    today: document.querySelector('.rail-day[data-is-today="true"]')?.dataset.date,
    editions: document.querySelectorAll('.rail-day[data-has-edition="true"]').length,
    cards: document.querySelector("#edition-band .band-cards")?.textContent,
  }));
  check("frame-01:selected-edition", timeline.date === "2026-10-26" && Boolean(timeline.title), JSON.stringify(timeline));
  check("frame-01:today-visible", timeline.today === "2026-11-01", `today=${timeline.today}`);
  await captureFrame(1, "timeline", "Timeline entry", "Latest recorded edition selected; today is visibly present with no edition.", "candidate review");
  await shot(EVIDENCE, "keyframe-01-timeline-light.png");

  /* ---------------------------------------------------------- 2. dealer open */
  await page.click("#open-edition");
  await settle(450);
  const dealer = await page.evaluate(() => ({
    hidden: document.getElementById("dealer-backdrop").hidden,
    cards: document.querySelectorAll("#dealer-hand .card").length,
    title: document.getElementById("dealer-title").textContent,
    cardTitle: document.querySelector("#dealer-reader .reader-title")?.textContent,
    handCount: document.getElementById("hand-count").textContent,
  }));
  check("frame-02:dealer-real-card", dealer.hidden === false && dealer.cards === 1, JSON.stringify(dealer));
  await captureFrame(2, "dealer", "Dealer open", "One real edition card; the hand count is the resolved card count, not a facet estimate.", "candidate review");
  await shot(EVIDENCE, "keyframe-02-dealer-light.png");

  /* --------------------------------------------------- keyframe dealer dark */
  await page.evaluate(() => window.__ATLAS_STAGE__.closeDealer());
  await settle(250);
  await page.click("#theme-toggle");
  await settle(250);
  await page.evaluate(() => window.__ATLAS_STAGE__.openDealer("daily:2026-10-26"));
  await settle(450);
  await shot(EVIDENCE, "keyframe-05-dealer-dark.png");
  const darkDealer = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    cards: document.querySelectorAll("#dealer-hand .card").length,
  }));
  check("keyframe-05:dealer-dark", darkDealer.theme === "dark" && darkDealer.cards === 1, JSON.stringify(darkDealer));
  await page.evaluate(() => window.__ATLAS_STAGE__.closeDealer());
  await settle(250);
  await page.click("#theme-toggle");
  await settle(250);

  /* ------------------------------------------------- 3. handoff 0 / 50 / 100 */
  await setHandoff(0);
  const handoff0 = await handoffSnapshot();
  const f0 = await shot(MOTION, "handoff-000.png");
  await setHandoff(0.5);
  const handoff50 = await handoffSnapshot();
  const f50 = await shot(MOTION, "handoff-050.png");
  await setHandoff(1);
  const handoff100 = await handoffSnapshot();
  const f100 = await shot(MOTION, "handoff-100.png");
  check("handoff:progress-0", Math.abs(handoff0.cssProgress - 0) < 0.03, JSON.stringify(handoff0));
  check("handoff:progress-50", Math.abs(handoff50.cssProgress - 0.5) < 0.05, JSON.stringify(handoff50));
  check("handoff:progress-100", Math.abs(handoff100.cssProgress - 1) < 0.03, JSON.stringify(handoff100));
  await setHandoff(0.5);
  await captureFrame(3, "handoff", "Scroll handoff at midpoint", "The edition token is halfway into the field; the left copy keeps the active information readable.", "candidate review");
  record(motion, {
    id: "handoff-progress",
    kind: "frame-sequence",
    frames: [f0, f50, f100],
    snapshots: [handoff0, handoff50, handoff100],
    note: "The handoff is scroll-linked. Stills show 0%, 50% and 100%; they do not prove the interpolation between them.",
  });

  /* --------------------------------------------- 4. understand focus + branches */
  await page.evaluate(() => window.__ATLAS_STAGE__.selectConcept("concept:stats:confidence-interval"));
  await jumpTo("scene-knowledge");
  await settle(750);
  const understand = await page.evaluate(() => ({
    title: document.querySelector("#context-content .panel-title")?.textContent,
    branches: document.querySelectorAll("#context-content .branch-chip").length,
    activeNodes: document.querySelectorAll(".node.is-active").length,
    neighbourNodes: document.querySelectorAll(".node:not(.is-dim):not(.is-active)").length,
    dense: window.__ATLAS_STAGE__.getView().dense,
  }));
  check("frame-04:understand-neighbourhood", understand.branches >= 1 && understand.neighbourNodes >= 1, JSON.stringify(understand));
  await captureFrame(4, "understand", "Understand focus", "Selected concept, readable neighbourhood and explicit prior/next branch claims.", "candidate review");
  await shot(EVIDENCE, "keyframe-03-field-light.png");

  /* ------------------------------------------- 5. why connected + conditions */
  const panelOffset = await panelScrollTo("#context-content .panel-section");
  await settle(350);
  const why = await page.evaluate(() => ({
    why: document.querySelector("#context-content .why blockquote")?.textContent,
    unit: document.querySelector("#context-content .why dl dd")?.textContent,
    requires: document.querySelector("#context-content .branch-list")?.textContent?.trim().slice(0, 120),
    offset: document.getElementById("context-panel").scrollTop,
  }));
  check("frame-05:why-and-evidence", Boolean(why.why) && Boolean(why.unit), JSON.stringify({ ...why, offset: why.offset }));
  await captureFrame(5, "why-connected", "Why connected", "Evidence quote, unit, decision and the prerequisite claim behind the connection.", "candidate review");
  check("frame-05:panel-scrolled", panelOffset !== null && why.offset > 0, `scrollTop=${why.offset}`);

  /* ---------------------------------------------------------- 6. comparison */
  await page.evaluate(() => window.__ATLAS_STAGE__.selectConcept("concept:fabric:shortcut"));
  await settle(500);
  await page.evaluate(() => window.__ATLAS_STAGE__.setIntent("compare"));
  await settle(450);
  const compare = await page.evaluate(() => ({
    board: Boolean(document.querySelector("#context-content .board")),
    title: document.querySelector("#context-content .panel-title")?.textContent,
    condition: document.querySelector("#context-content .board-condition, #context-content .board-note")?.textContent?.slice(0, 160),
    select: document.getElementById("comparison-select")?.value,
    involvesSelected: document.getElementById("context-content")?.textContent?.includes("No board includes it") === false,
  }));
  check("frame-06:comparison-board", compare.board && Boolean(compare.title) && compare.involvesSelected, JSON.stringify(compare));
  await page.evaluate(() => {
    document.getElementById("context-panel").scrollTop = 0;
  });
  await settle(300);
  await captureFrame(6, "comparison", "Comparison Desk", "Two candidate concepts, their changed condition and the reason the contrast is claimed.", "candidate review");
  await page.evaluate(() => {
    const panel = document.getElementById("context-panel");
    panel.scrollTop = panel.scrollHeight;
  });
  await settle(300);
  await shot(STORY, "detail-comparison-conditions.png");

  /* --------------------------------------------------------------- 7. goal */
  await page.evaluate(() => window.__ATLAS_STAGE__.setIntent("goal"));
  await settle(350);
  await page.click('[data-act="select-goal"][data-goal="goal:ia:is-the-difference-real"]');
  await settle(350);
  await page.click('[data-act="start-route"][data-goal="goal:ia:is-the-difference-real"]');
  await settle(700);
  await page.evaluate(() => {
    document.getElementById("context-panel").scrollTop = 0;
  });
  await settle(350);
  const goal = await page.evaluate(() => ({
    steps: document.querySelectorAll("#context-content .route-step").length,
    gaps: document.querySelectorAll("#context-content .route-step.is-gap").length,
    reasons: document.querySelectorAll("#context-content .route-reason").length,
    alternatives: document.querySelectorAll("#context-content .goal-option").length,
    active: document.querySelector("#context-content .route-step.is-active-step")?.textContent?.trim().slice(0, 80),
    title: document.querySelector("#context-content .panel-title")?.textContent,
  }));
  check("frame-07:goal-route", goal.steps >= 5 && goal.reasons >= 5 && goal.alternatives === 3, JSON.stringify(goal));
  await captureFrame(7, "goal-route", "Goal route", "Topological route with step reasons, three alternative goals and the recorded gap count.", "candidate review");
  await panelScrollTo("#context-content .route-list");
  await settle(300);
  await shot(STORY, "detail-goal-route.png");

  /* ------------------------------------------------------ 8. pocket + thread */
  await page.evaluate(() => window.__ATLAS_STAGE__.setIntent("understand"));
  await page.evaluate(() => window.__ATLAS_STAGE__.selectConcept("concept:stats:confidence-interval"));
  await settle(500);
  await page.click('[data-act="toggle-pocket-concept"]');
  await settle(250);
  await page.evaluate(() => window.__ATLAS_STAGE__.selectConcept("concept:stats:standard-error"));
  await settle(500);
  await page.click("#pocket-toggle");
  await settle(450);
  await page.evaluate(() => document.getElementById("thread-bar")?.scrollIntoView({ behavior: "instant", block: "end" }));
  await settle(300);
  const pocket = await page.evaluate(() => ({
    open: !document.getElementById("pocket-panel").hidden,
    items: document.querySelectorAll(".pocket-item").length,
    thread: document.querySelectorAll(".thread-chip").length,
    threadCount: document.getElementById("thread-count").textContent,
  }));
  check("frame-08:pocket-and-thread", pocket.open && pocket.items >= 1 && pocket.thread >= 2, JSON.stringify(pocket));
  await captureFrame(8, "pocket-thread", "Pocket and thread", "A saved concept, the visited-concept thread and the current context behind the drawer.", "local browser state");

  await page.click("#pocket-close");
  await settle(250);
  await page.click("#context-content .resource-open");
  await settle(250);
  const restored = await page.evaluate(() => ({
    toast: document.getElementById("toast").textContent,
    title: document.querySelector("#context-content .panel-title")?.textContent,
    concept: window.__ATLAS_STAGE__.getState().conceptId,
  }));
  check("frame-08:resource-return", Boolean(restored.toast) && Boolean(restored.title), JSON.stringify(restored));
  await captureFrame("08b", "resource-return", "Return from a resource route", "The isolated prototype reports the route instead of faking navigation; the selected context is restored.", "candidate review");

  /* -------------------------------------------------------------- 9. closing */
  await page.evaluate(() => window.__ATLAS_STAGE__.setIntent("understand"));
  await page.evaluate(() => window.__ATLAS_STAGE__.selectConcept("concept:fabric:shortcut"));
  await jumpTo("scene-closing");
  await settle(500);
  const closing = await page.evaluate(() => ({
    idea: document.getElementById("closing-idea").textContent.trim().slice(0, 100),
    ledger: document.querySelectorAll("#closing-ledger > div").length,
    action: document.getElementById("closing-action").textContent.trim(),
  }));
  check("frame-09:closing-ledger", closing.ledger >= 8 && Boolean(closing.idea), JSON.stringify(closing));
  await captureFrame(9, "closing", "Closing ledger", "One remembered idea, the coverage ledger and a concrete way back to the edition.", "candidate review");
  await shot(EVIDENCE, "detail-closing-light.png");

  /* ------------------------------------------------ 9b. public sparse state */
  const publicPage = await context.newPage();
  await publicPage.goto(`${PUBLIC}?theme=light`, { waitUntil: "load" });
  await publicPage.waitForFunction(() => Boolean(window.__ATLAS_PUBLIC_STATE__), { timeout: 15000 });
  await publicPage.waitForTimeout(450);
  await mkdir(STORY, { recursive: true });
  await publicPage.screenshot({ path: path.join(STORY, "frame-09b-public-sparse.png"), fullPage: false });
  const publicState = await publicPage.evaluate(() => ({
    counts: window.__ATLAS_PUBLIC_STATE__.published,
    gateCards: document.querySelectorAll(".gate-card").length,
    hasReviewData: "ATLAS_DATA" in window,
  }));
  check(
    "frame-09b:public-sparse",
    publicState.counts.concepts === 0 && publicState.gateCards === 4 && !publicState.hasReviewData,
    JSON.stringify(publicState),
  );
  record(frames, {
    number: "09b",
    title: "Public sparse-state alternative",
    file: "frame-09b-public-sparse.png",
    note: "Same editorial language, zero published semantics, four unmet gate conditions.",
    data: "public projection",
    state: publicState,
    at: new Date().toISOString(),
  });
  await publicPage.screenshot({ path: path.join(EVIDENCE, "detail-public-light.png"), fullPage: false });
  await publicPage.click("#theme-toggle");
  await publicPage.waitForTimeout(300);
  await publicPage.screenshot({ path: path.join(EVIDENCE, "detail-public-dark.png"), fullPage: false });
  await publicPage.close();

  /* --------------------------------------------------------- reduced motion */
  const reducedContext = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: "reduce" });
  const reduced = await reducedContext.newPage();
  reduced.on("pageerror", (error) => pageErrors.push(`reduced: ${error.message}`));
  await reduced.goto(`${PROTOTYPE}?theme=light`, { waitUntil: "load" });
  await reduced.waitForFunction(() => Boolean(window.__ATLAS_STAGE__), { timeout: 15000 });
  await reduced.waitForTimeout(600);
  await reduced.evaluate(() => document.getElementById("handoff").scrollIntoView({ behavior: "instant", block: "start" }));
  await reduced.waitForTimeout(350);
  const reducedSnapshot = await reduced.evaluate(() => {
    const section = document.getElementById("handoff");
    const token = document.getElementById("handoff-token");
    return {
      handoffHeight: section.offsetHeight,
      viewportHeight: window.innerHeight,
      tokenTransform: getComputedStyle(token).transform,
      tokenKindOpacity: getComputedStyle(token.querySelector(".token-kind")).opacity,
      tokenTitleOpacity: getComputedStyle(token.querySelector(".token-title")).opacity,
      tokenMetaOpacity: getComputedStyle(token.querySelector(".token-meta")).opacity,
      tokenRadius: getComputedStyle(token).borderRadius,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    };
  });
  await reduced.screenshot({ path: path.join(MOTION, "reduced-motion-handoff.png"), fullPage: false });
  check(
    "reduced-motion:static-equivalent",
    reducedSnapshot.tokenTransform === "none" &&
      reducedSnapshot.tokenKindOpacity === "1" &&
      reducedSnapshot.tokenTitleOpacity === "1" &&
      reducedSnapshot.tokenMetaOpacity === "1" &&
      reducedSnapshot.handoffHeight < reducedSnapshot.viewportHeight * 1.4,
    JSON.stringify(reducedSnapshot),
  );
  record(motion, {
    id: "reduced-motion",
    kind: "static-equivalent",
    frames: ["reduced-motion-handoff.png"],
    snapshots: [reducedSnapshot],
    note: "Reduced motion removes the sticky scroll scrub and the orbit, and shows the token text immediately.",
  });
  await reducedContext.close();

  /* ------------------------------------------- transition evidence sequences */
  const seqContext = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: "no-preference" });
  const seq = await seqContext.newPage();
  seq.on("pageerror", (error) => pageErrors.push(`sequence: ${error.message}`));
  await seq.goto(`${PROTOTYPE}?theme=light`, { waitUntil: "load" });
  await seq.waitForFunction(() => Boolean(window.__ATLAS_STAGE__), { timeout: 15000 });
  await seq.waitForTimeout(600);
  const seqShot = async (name) => {
    await mkdir(MOTION, { recursive: true });
    await seq.screenshot({ path: path.join(MOTION, name), fullPage: false });
    return name;
  };
  const seqState = () => seq.evaluate(() => window.__ATLAS_STAGE__.getState());

  // Timeline -> Dealer -> graph -> resource -> return.
  await seq.evaluate(() => document.getElementById("scene-timeline").scrollIntoView({ behavior: "instant" }));
  await seq.waitForTimeout(300);
  const s1 = await seqShot("seq-01-timeline.png");
  await seq.click("#open-edition");
  await seq.waitForTimeout(400);
  const s2 = await seqShot("seq-02-dealer.png");
  await seq.evaluate(() => window.__ATLAS_STAGE__.closeDealer());
  await seq.waitForTimeout(250);
  await seq.evaluate(() => window.__ATLAS_STAGE__.selectConcept("concept:fabric:shortcut"));
  await seq.evaluate(() => document.getElementById("scene-knowledge").scrollIntoView({ behavior: "instant" }));
  await seq.waitForTimeout(700);
  const s3 = await seqShot("seq-03-graph.png");
  await seq.click("#context-content .resource-open");
  await seq.waitForTimeout(250);
  const s4 = await seqShot("seq-04-resource.png");
  await seq.evaluate(() => document.getElementById("scene-timeline").scrollIntoView({ behavior: "instant" }));
  await seq.waitForTimeout(350);
  const s5 = await seqShot("seq-05-return.png");
  record(motion, {
    id: "timeline-dealer-graph-resource-return",
    kind: "frame-sequence",
    frames: [s1, s2, s3, s4, s5],
    snapshots: await seqState(),
    note: "Dealer locate opens the graph; a resource route reports itself instead of navigating; the timeline remains one scroll away.",
  });

  // Understand -> Compare -> cancel.
  await seq.evaluate(() => window.__ATLAS_STAGE__.selectConcept("concept:stats:confidence-interval"));
  await seq.waitForTimeout(600);
  await seq.evaluate(() => document.getElementById("scene-knowledge").scrollIntoView({ behavior: "instant" }));
  await seq.waitForTimeout(350);
  const c1 = await seqShot("seq-06-understand.png");
  await seq.evaluate(() => window.__ATLAS_STAGE__.setIntent("compare"));
  await seq.waitForTimeout(400);
  const c2 = await seqShot("seq-07-compare.png");
  await seq.click('[data-intent="understand"]');
  await seq.waitForTimeout(400);
  const c3 = await seqShot("seq-08-compare-cancelled.png");
  const cancelState = await seqState();
  check("sequence:compare-cancel", cancelState.intent === "understand", JSON.stringify(cancelState));
  record(motion, {
    id: "understand-compare-cancel",
    kind: "frame-sequence",
    frames: [c1, c2, c3],
    snapshots: cancelState,
    note: "Compare is reversible: Return to Understand restores the prior intention without losing the selected concept.",
  });

  // Rapid interrupted expansion.
  await seq.evaluate(() => {
    const stage = window.__ATLAS_STAGE__;
    stage.selectConcept("concept:fabric:semantic-model");
    stage.selectConcept("concept:sql:join");
    stage.selectConcept("concept:stats:confidence-interval");
  });
  await seq.waitForTimeout(120);
  const r1 = await seqShot("seq-09-rapid-interrupt.png");
  await seq.waitForTimeout(900);
  const r2 = await seqShot("seq-10-rapid-settled.png");
  const rapidState = await seqState();
  check("sequence:rapid-interrupt-settles", rapidState.conceptId === "concept:stats:confidence-interval", JSON.stringify(rapidState));
  record(motion, {
    id: "rapid-interrupted-expansion",
    kind: "frame-sequence",
    frames: [r1, r2],
    snapshots: rapidState,
    note: "Three selections in one task settle on the last requested concept; no stale panel or console error remains.",
  });

  // Keyboard modal escape and focus return.
  await seq.evaluate(() => window.__ATLAS_STAGE__.openDealer("daily:2026-10-26"));
  await seq.waitForTimeout(350);
  const k1 = await seqShot("seq-11-dealer-keyboard.png");
  await seq.keyboard.press("Escape");
  await seq.waitForTimeout(300);
  const escape = await seq.evaluate(() => ({
    hidden: document.getElementById("dealer-backdrop").hidden,
    focus: document.activeElement?.id || document.activeElement?.className,
    dialogOpen: document.body.classList.contains("is-dialog-open"),
  }));
  const k2 = await seqShot("seq-12-dealer-escaped.png");
  check("sequence:keyboard-escape", escape.hidden && !escape.dialogOpen, JSON.stringify(escape));
  record(motion, {
    id: "keyboard-modal-escape",
    kind: "frame-sequence",
    frames: [k1, k2],
    snapshots: escape,
    note: "Escape closes the Dealer, releases the scroll lock and returns focus to the opener.",
  });

  await seqContext.close();

  check("runtime:no-console-errors", consoleErrors.length === 0, consoleErrors.join(" | ") || "none");
  check("runtime:no-page-errors", pageErrors.length === 0, pageErrors.join(" | ") || "none");
} catch (error) {
  check("harness:completed", false, error.stack ?? String(error));
} finally {
  await browser.close();
}

const failed = checks.filter((entry) => entry.status === "FAIL");
const report = {
  schemaVersion: "intelligent-atlas-storyboard-capture/3.1",
  generatedAt: new Date().toISOString(),
  viewport: "1440x960",
  edge: "156.0.4314.58",
  summary: { total: checks.length, passed: checks.length - failed.length, failed: failed.length, frames: frames.length, motionRecords: motion.length },
  consoleErrors,
  pageErrors,
  checks,
  frames,
  motion,
};
await mkdir(EVIDENCE, { recursive: true });
await mkdir(STORY, { recursive: true });
await writeFile(path.join(EVIDENCE, "storyboard-capture-v31.json"), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(path.join(STORY, "frames.json"), `${JSON.stringify(frames, null, 2)}\n`);
console.log(JSON.stringify(report.summary));
for (const entry of checks) console.log(`${entry.status} ${entry.id} — ${entry.detail}`);
process.exitCode = failed.length ? 1 : 0;
