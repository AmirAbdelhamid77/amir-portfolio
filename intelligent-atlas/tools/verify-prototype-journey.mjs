// Acceptance harness for the review prototype journey (milestones M4/M5).
//
// Serves `intelligent-atlas/prototype/` on a random loopback port, drives the
// locally installed Microsoft Edge through playwright-core, and records a
// PASS/FAIL/NOT RUN result per acceptance item. Screenshots are written to
// `intelligent-atlas/design/keyframes/`.
//
//   node intelligent-atlas/tools/verify-prototype-journey.mjs
//   node intelligent-atlas/tools/verify-prototype-journey.mjs --no-shots
//
// Every check starts from a fresh navigation so one failure cannot cascade into
// the next. Pointer activation is dispatched on the element itself (the
// prototype lays its timeline out with CSS transforms, so Playwright's
// actionability heuristics do not apply); keyboard paths use real key events.
//
// This is a review-artifact harness: it never touches the built site, the public
// projection or the network beyond 127.0.0.1. It cannot certify visual
// acceptance, publication or scientific review.
import { createServer } from "node:http";
import { createReadStream, existsSync, readdirSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const ROOT = process.cwd();
const PROTOTYPE = path.join(ROOT, "intelligent-atlas", "prototype");
const SHOTS = path.join(ROOT, "intelligent-atlas", "design", "keyframes");
const REPORT = path.join(ROOT, "intelligent-atlas", "design", "qa-journey-report.json");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const shots = !process.argv.includes("--no-shots");
const SEED_CONCEPT = "concept:fabric:shortcut";
const LATEST_DATE = "2026-10-26";
const TODAY = "2026-11-01";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function startServer() {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const file = path.join(PROTOTYPE, decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname));
    if (!file.startsWith(PROTOTYPE)) {
      response.writeHead(403).end();
      return;
    }
    if (!existsSync(file)) {
      response.writeHead(404).end("not found");
      return;
    }
    response.writeHead(200, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(response);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

const results = [];
function record(name, status, detail = "") {
  results.push({ name, status, detail });
  const mark = status === "PASS" ? "PASS" : status === "FAIL" ? "FAIL" : "NOT RUN";
  console.log(`${mark.padEnd(7)} ${name}${detail ? ` - ${detail}` : ""}`);
}
async function check(name, fn) {
  try {
    const detail = await fn();
    record(name, "PASS", typeof detail === "string" ? detail : "");
  } catch (error) {
    record(name, "FAIL", String(error?.message ?? error).split("\n")[0].slice(0, 220));
  }
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

/** Pointer activation on the element itself, without actionability heuristics. */
async function click(page, selector, index = 0) {
  const found = await page.evaluate(
    ({ selector, index }) => {
      const node = [...document.querySelectorAll(selector)][index];
      if (!node) return false;
      node.click();
      return true;
    },
    { selector, index },
  );
  if (!found) throw new Error(`no element matches ${selector} at index ${index}`);
}

const text = (page, selector) =>
  page.evaluate(
    (selector) => (document.querySelector(selector)?.innerText ?? "").replace(/\s+/g, " ").trim(),
    selector,
  );

/**
 * Wait for finite CSS animations to finish so a capture never catches a dialog
 * mid-fade and reports a translucency defect that only exists for 240ms.
 */
async function settle(page) {
  await page.evaluate(async () => {
    const running = (document.getAnimations?.() ?? []).filter(
      (animation) => animation.effect?.getTiming?.().iterations !== Infinity,
    );
    await Promise.race([
      Promise.all(running.map((animation) => animation.finished.catch(() => {}))),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  });
}

/** Wait until the smooth scene scroll has stopped, or 3s have passed. */
async function settleScroll(page) {
  await page.evaluate(async () => {
    const start = performance.now();
    let last = window.scrollY;
    let stable = 0;
    while (performance.now() - start < 3000) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (Math.abs(window.scrollY - last) < 1) stable += 1;
      else stable = 0;
      last = window.scrollY;
      if (stable > 10) return;
    }
  });
}

const graph = JSON.parse(readFileSync(path.join(ROOT, "intelligent-atlas", "analysis", "graph-build.json"), "utf8"));
const projection = JSON.parse(
  readFileSync(path.join(ROOT, "intelligent-atlas", "analysis", "public-projection-v2.json"), "utf8"),
);

const server = await startServer();
const base = `http://127.0.0.1:${server.address().port}`;
if (shots) await mkdir(SHOTS, { recursive: true });

const browser = await chromium.launch({ executablePath: EDGE });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(String(error)));

/** Fresh timeline view; the prototype reads date/theme from the query string. */
async function openTimeline(query = "") {
  await page.goto(`${base}/index.html${query}`, { waitUntil: "load" });
  await page.waitForFunction(() => document.querySelectorAll("#timeline-track li").length === 15);
  await page.waitForFunction(() => Boolean(document.getElementById("open-edition")?.dataset.date));
}

/** Fresh knowledge view anchored on the review constellation's concept. */
async function openKnowledge(query = "") {
  await page.goto(`${base}/index.html?date=${LATEST_DATE}&concept=${encodeURIComponent(SEED_CONCEPT)}${query}#scene-knowledge`, {
    waitUntil: "load",
  });
  await page.waitForFunction(() => !document.getElementById("scene-knowledge")?.hasAttribute("hidden"));
  await page.waitForFunction(() => document.querySelectorAll('#field-nodes [data-act="open-concept"]').length > 0);
  await settleScroll(page);
}

try {
  /* ---------------------------------------------------------------- timeline */
  await openTimeline();

  await check("timeline: fifteen days in the review clock", async () => {
    const count = await page.locator("#timeline-track li").count();
    assert(count === 15, `expected 15 day cards, found ${count}`);
    return "15 day cards";
  });

  await check("timeline: three real editions, quiet days labelled", async () => {
    const editions = await page.locator(".tl-card.has-edition").count();
    const quiet = await page.locator(".tl-card.is-empty").count();
    assert(editions === 3, `expected 3 editions, found ${editions}`);
    assert(quiet === 12, `expected 12 quiet days, found ${quiet}`);
    const joined = (await page.locator(".tl-card.has-edition").allInnerTexts()).join(" ").replace(/\s+/g, " ");
    for (const expected of ["Files versus Tables", "Object versus target", "Reference \u2260 retained result"]) {
      assert(joined.includes(expected), `edition title missing: ${expected}`);
    }
    return "24, 25, 26 Oct";
  });

  await check("timeline: today is honestly empty and never borrows an older card", async () => {
    await openTimeline(`?date=${TODAY}`);
    const peek = await text(page, "#edition-peek");
    assert(/no edition today|no edition on this date/i.test(peek), `quiet-day peek is not honest: ${peek.slice(0, 80)}`);
    assert(/0 cards/i.test(peek), "quiet-day peek does not state the card count");
    assert((await text(page, "#open-edition")) === "Open empty hand", "quiet day offers a non-empty action");
    await click(page, "#open-edition");
    await page.waitForFunction(() => !document.getElementById("dealer-backdrop")?.hasAttribute("hidden"));
    const dealt = await page.locator('#dealer-hand [data-act="dealer-card"]').count();
    const emptyMarked = await page.locator("#dealer-hand li.hand-empty").count();
    assert(dealt === 0, `empty day dealt ${dealt} real cards`);
    assert(emptyMarked === 1, "the empty hand is not marked as empty");
    assert(/no cards to deal/i.test(await text(page, "#dealer-hand")), "the empty hand does not say no cards can be dealt");
    return "peek and hand both state there is no edition, 0 cards dealt";
  });

  await check("timeline: the empty hand offers the latest real edition", async () => {
    // Continues the previous state: the Dealer is open on the empty day.
    const before = await page.locator('#dealer [data-act="dealer-jump-latest"]').count();
    assert(before > 0, "empty hand has no route to a real edition");
    await click(page, '#dealer [data-act="dealer-jump-latest"]');
    await page.waitForFunction(() => document.querySelectorAll('#dealer-hand [data-act="dealer-card"]').length > 0);
    const date = await text(page, "#dealer-kicker-date");
    const cards = await page.locator('#dealer-hand [data-act="dealer-card"]').count();
    assert(/26 Oct/i.test(date), `latest edition is ${date}`);
    assert(cards > 0, "latest edition dealt no cards");
    return `${date}, ${cards} real card(s)`;
  });

  await check("timeline: keyboard moves selection and Enter opens the edition", async () => {
    await openTimeline();
    // Start from a different day so the first click only selects; clicking the
    // already-selected edition would open the Dealer and make the stage inert.
    await click(page, '.tl-card[data-date="2026-10-25"]');
    await page.waitForFunction(() => window.__ATLAS_STAGE__.getTimelineState().selected === "2026-10-25");
    await page.evaluate(() => document.querySelector('.tl-card[data-date="2026-10-25"]').focus());
    await page.keyboard.press("ArrowRight");
    await page.waitForFunction(() => window.__ATLAS_STAGE__.getTimelineState().selected === "2026-10-26");
    await page.waitForFunction(() => document.activeElement?.dataset?.date === "2026-10-26", null, { timeout: 3000 });
    const focused = await page.evaluate(() => document.activeElement?.dataset?.date ?? null);
    assert(focused === "2026-10-26", `focus did not follow the selection (${focused})`);
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => !document.getElementById("dealer-backdrop")?.hasAttribute("hidden"));
    const inside = await page.evaluate(() => !!document.activeElement?.closest("#dealer"));
    assert(inside, "focus did not move into the Dealer");
    const cards = await page.locator('#dealer-hand [data-act="dealer-card"]').count();
    assert(cards > 0, "keyboard activation opened an empty dealer on an edition day");
    return `25 Oct -> 26 Oct by ArrowRight, Enter opened ${cards} card(s)`;
  });

  await check("dealer: real card fields, review badge, no publication claim", async () => {
    await openTimeline();
    await click(page, '.tl-card[data-date="2026-10-26"]');
    await click(page, "#open-edition");
    await page.waitForFunction(() => !document.getElementById("dealer-backdrop")?.hasAttribute("hidden"));
    await click(page, '#dealer-hand [data-act="dealer-card"]');
    const reader = await text(page, "#dealer-reader");
    for (const field of ["SCENARIO", "PREDICTION", "TAKEAWAY", "CAVEAT"]) {
      assert(reader.includes(field), `reader is missing the ${field} block`);
    }
    const badge = await text(page, "#dealer-review-badge");
    assert(/technical review/i.test(badge), "review badge missing");
    assert(/human pending/i.test(badge), "review badge does not state that human review is pending");
    assert(!/published|verified|approved/i.test(badge), "review badge claims publication or approval");
    return "scenario, prediction, takeaway, caveat";
  });

  if (shots) {
    await settle(page);
    await page.screenshot({ path: path.join(SHOTS, "k3-dealer-light.png") });
  }

  await check("dealer: Escape closes and returns focus to the opening date", async () => {
    await openTimeline();
    await click(page, '.tl-card[data-date="2026-10-25"]');
    await page.waitForFunction(() => window.__ATLAS_STAGE__.getTimelineState().selected === "2026-10-25");
    await page.evaluate(() => document.querySelector('.tl-card[data-date="2026-10-25"]').focus());
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => !document.getElementById("dealer-backdrop")?.hasAttribute("hidden"));
    const scrollBefore = await page.evaluate(() => Math.round(window.scrollY));
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => document.getElementById("dealer-backdrop")?.hasAttribute("hidden"));
    const focused = await page.evaluate(() => ({
      cls: document.activeElement?.className ?? "",
      date: document.activeElement?.dataset?.date ?? null,
      scrollY: Math.round(window.scrollY),
    }));
    assert(focused.cls.includes("tl-card"), `focus returned to ${focused.cls || "nothing"}`);
    assert(focused.date === "2026-10-25", `focus returned to ${focused.date} instead of 25 Oct`);
    assert(focused.scrollY === scrollBefore, `scroll moved from ${scrollBefore} to ${focused.scrollY}`);
    return `focus and scroll returned to 25 Oct (${focused.scrollY}px)`;
  });

  /* -------------------------------------------------------- knowledge stage */
  await check("journey: locate in knowledge keeps the card concept as the anchor", async () => {
    await openTimeline();
    await click(page, ".tl-card.has-edition", 2);
    await page.waitForFunction(() => window.__ATLAS_STAGE__.getTimelineState().selected === "2026-10-26");
    await click(page, "#open-edition");
    await page.waitForFunction(() => !document.getElementById("dealer-backdrop")?.hasAttribute("hidden"));
    await click(page, "#dealer-hand li");
    await click(page, '#dealer [data-act="dealer-locate"]');
    await page.waitForFunction(() => !document.getElementById("scene-knowledge")?.hasAttribute("hidden"));
    const state = await page.evaluate(() => window.__ATLAS_STAGE__.getState());
    assert(state.conceptId === SEED_CONCEPT, `anchor is ${state.conceptId}`);
    const anchor = await text(page, "#context-content");
    assert(/OneLake shortcut/.test(anchor), "context panel does not show the anchor concept");
    return `anchor ${SEED_CONCEPT}`;
  });

  await check("knowledge: neighbours match the stored edges and stay labelled candidate", async () => {
    const expected = graph.edges.filter((edge) => edge.from === SEED_CONCEPT || edge.to === SEED_CONCEPT).length;
    const rendered = await page.evaluate(() =>
      [...document.querySelectorAll('#field-nodes [data-act="open-concept"]')].map((node) => ({
        concept: node.dataset.concept,
        label: node.innerText.replace(/\s+/g, " ").trim(),
      })),
    );
    const summary = await text(page, "#field-summary");
    assert(rendered.length >= expected, `expected at least ${expected} relation nodes, found ${rendered.length}`);
    assert(/recorded candidate relations/i.test(summary), `live summary does not label relations as candidate: ${summary}`);
    assert(/0 published/i.test(summary), "live summary does not state the published count");
    assert(rendered.every((item) => /candidate/i.test(item.label)), "a neighbour is rendered without the candidate label");
    return `${expected} stored edges, ${rendered.length} rendered, all labelled candidate`;
  });

  await check("knowledge: all four intent modes render distinct real content", async () => {
    const seen = {};
    for (const [key, expected] of [
      ["c", "compare"],
      ["a", "apply"],
      ["g", "reach a goal"],
      ["u", "neighbourhood"],
    ]) {
      await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
      await page.keyboard.press(key);
      await page.waitForFunction(
        (expected) => (document.getElementById("field-mode-label")?.textContent ?? "").toLowerCase().includes(expected),
        expected,
      );
      const content = await text(page, "#context-content");
      assert(content.length > 40, `${expected} mode rendered no content`);
      seen[expected] = content.slice(0, 80);
    }
    assert(new Set(Object.values(seen)).size === 4, "two intent modes rendered identical content");
    return "compare, apply, reach a goal, neighbourhood";
  });

  await check("knowledge: compare names a real documented pair", async () => {
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    await page.keyboard.press("c");
    await page.waitForFunction(() => (document.getElementById("field-mode-label")?.textContent ?? "").includes("compare"));
    const content = await text(page, "#context-content");
    const board = graph.edges.find((edge) => edge.relationType === "contrasts_with" && edge.from === SEED_CONCEPT);
    assert(Boolean(board), "no contrasts_with edge for the anchor in the graph");
    assert(content.includes(board.toLabel), `compare panel does not name ${board.toLabel}`);
    assert(!/verified|proven/i.test(content), "compare panel uses verification language for a candidate edge");
    return `${board.fromLabel} \u2194 ${board.toLabel}`;
  });

  if (shots) {
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    await page.keyboard.press("u");
    await page.waitForFunction(() => (document.getElementById("field-mode-label")?.textContent ?? "").includes("neighbourhood"));
    await settle(page);
    await page.screenshot({ path: path.join(SHOTS, "k5-knowledge-light.png") });
  }

  await check("pocket: a saved concept survives reload and records no mastery", async () => {
    await openKnowledge();
    const save = page.locator('#context-content [data-act="toggle-pocket-concept"]').first();
    assert((await save.count()) > 0, "no save control in the context panel");
    if (!/saved/i.test((await save.innerText()).trim())) await click(page, '#context-content [data-act="toggle-pocket-concept"]');
    await page.waitForFunction(() => document.getElementById("pocket-count")?.textContent === "1");
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => document.getElementById("pocket-count")?.textContent === "1");
    const stored = await page.evaluate(() => {
      const raw = JSON.parse(localStorage.getItem("hansa.knowledge-stage.v31") || "{}");
      return {
        pocket: raw.pocket?.length ?? 0,
        hasMastery: "mastery" in raw,
        theme: raw.theme ?? null,
        intent: raw.intent ?? null,
      };
    });
    assert(stored.pocket === 1, "pocket entry was not restored");
    assert(stored.hasMastery === false, "local state records a mastery field");
    return "1 saved concept, no mastery field";
  });

  await check("pocket: P opens it and Escape returns focus to the toggle", async () => {
    await openKnowledge();
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    await page.keyboard.press("p");
    await page.waitForFunction(() => !document.getElementById("pocket-panel")?.hasAttribute("hidden"));
    const items = await page.locator("#pocket-list li").count();
    assert(items > 0, "pocket is open but empty after a saved concept");
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => document.getElementById("pocket-panel")?.hasAttribute("hidden"));
    const active = await page.evaluate(() => document.activeElement?.id);
    assert(active === "pocket-toggle", `focus returned to ${active}`);
    return `${items} saved item, focus on the toggle`;
  });

  await check("state: URL restores scene, concept and intent after reload", async () => {
    await page.goto(`${base}/index.html?date=${LATEST_DATE}&intent=compare&concept=${encodeURIComponent(SEED_CONCEPT)}#scene-knowledge`, {
      waitUntil: "load",
    });
    await page.waitForFunction(() => !document.getElementById("scene-knowledge")?.hasAttribute("hidden"));
    const state = await page.evaluate(() => window.__ATLAS_STAGE__.getState());
    assert(state.conceptId === SEED_CONCEPT, "concept not restored from the URL");
    assert(state.intent === "compare", `intent not restored (${state.intent})`);
    const mode = (await page.locator("#field-mode-label").innerText()).toLowerCase();
    assert(mode.includes("compare"), `mode label is ${mode}`);
    return "concept + intent + mode restored";
  });

  await check("review/public separation: the review artifact is not reachable from the app", async () => {
    assert(projection.publishedConcepts.length === 0, "projection publishes concepts");
    assert(projection.publishedAssertions.length === 0, "projection publishes assertions");
    assert(projection.withheld.conceptCount === 132, "withheld concept count changed");
    const { execFileSync } = await import("node:child_process");
    let hits = "";
    try {
      hits = execFileSync(
        "C:\\Program Files\\Git\\bin\\grep.exe",
        ["-rl", "-e", "prototype/data.js", "-e", "ATLAS_DATA", "app", "components", "lib", "public"],
        { cwd: ROOT, encoding: "utf8" },
      );
    } catch (error) {
      // grep exits 1 when nothing matches, which is the expected result.
      hits = String(error.stdout ?? "");
    }
    assert(hits.trim() === "", `review artifact referenced by: ${hits.trim().split("\n").join(", ")}`);
    return "0 published items, no reference to the prototype payload";
  });

  await check("console: no runtime errors during the journey", async () => {
    assert(consoleErrors.length === 0, consoleErrors.join(" | ").slice(0, 220));
    return "0 console errors";
  });

  /* ------------------------------------------------------------- dark theme */
  await page.goto(`${base}/index.html?date=${LATEST_DATE}&intent=understand&theme=dark&concept=${encodeURIComponent(SEED_CONCEPT)}#scene-knowledge`, {
    waitUntil: "load",
  });
  await page.waitForFunction(() => !document.getElementById("scene-knowledge")?.hasAttribute("hidden"));

  await check("theme: dark mode applies the dark token set", async () => {
    const theme = await page.evaluate(() => ({
      attr: document.documentElement.dataset.theme,
      background: getComputedStyle(document.body).backgroundColor,
    }));
    assert(theme.attr === "dark", `data-theme is ${theme.attr}`);
    const light = await page.evaluate(() => {
      const saved = document.documentElement.dataset.theme;
      document.documentElement.dataset.theme = "light";
      const value = getComputedStyle(document.body).backgroundColor;
      document.documentElement.dataset.theme = saved;
      return value;
    });
    assert(theme.background !== light, `dark and light backgrounds are identical (${light})`);
    return `${theme.background} dark vs ${light} light`;
  });

  if (shots) {
    await settleScroll(page);
    await settle(page);
    await page.screenshot({ path: path.join(SHOTS, "k6-knowledge-dark.png") });
  }

  /* --------------------------------------------------------- reduced motion */
  const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(
    `${base}/index.html?date=${LATEST_DATE}&concept=${encodeURIComponent(SEED_CONCEPT)}#scene-knowledge`,
    { waitUntil: "load" },
  );
  await reducedPage.waitForFunction(() => !document.getElementById("scene-knowledge")?.hasAttribute("hidden"));

  await check("reduced motion: transitions and animations are neutralised", async () => {
    const toSeconds = (value) => Math.max(...String(value).split(",").map((part) => parseFloat(part) || 0));
    const durations = await reducedPage.evaluate(() => {
      const nodes = [...document.querySelectorAll("#scene-knowledge, #context-panel, .tl-card, .nb-node")].slice(0, 20);
      return nodes.map((node) => {
        const style = getComputedStyle(node);
        return `${style.transitionDuration}|${style.animationDuration}`;
      });
    });
    const slow = durations.filter((value) => {
      const [transition, animation] = value.split("|");
      return toSeconds(transition) > 0.01 || toSeconds(animation) > 0.01;
    });
    assert(slow.length === 0, `elements still animating: ${slow.slice(0, 3).join(", ")}`);
    return `${durations.length} sampled elements at or below 0.01s`;
  });
  await reduced.close();

  /* ----------------------------------------------------------------- mobile */
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(`${base}/index.html?date=${LATEST_DATE}&concept=${encodeURIComponent(SEED_CONCEPT)}#scene-knowledge`, {
    waitUntil: "load",
  });
  await mobilePage.waitForFunction(() => !document.getElementById("scene-knowledge")?.hasAttribute("hidden"));

  await check("mobile 390px: no horizontal overflow", async () => {
    const overflow = await mobilePage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    assert(
      overflow.scrollWidth <= overflow.clientWidth + 1,
      `page scrolls horizontally (${overflow.scrollWidth} > ${overflow.clientWidth})`,
    );
    return `${overflow.scrollWidth}px content in ${overflow.clientWidth}px viewport`;
  });

  await check("mobile 390px: primary controls keep a 44px target", async () => {
    const small = await mobilePage.evaluate(() => {
      const ids = ["pocket-toggle", "theme-toggle", "open-edition", "day-prev", "day-next", "field-search"];
      return ids
        .map((id) => document.getElementById(id))
        .filter(Boolean)
        .map((node) => {
          const box = node.getBoundingClientRect();
          return { id: node.id, h: Math.round(box.height) };
        })
        .filter((item) => item.h < 44);
    });
    assert(small.length === 0, `targets under 44px: ${small.map((item) => `${item.id}:${item.h}`).join(", ")}`);
    return "all sampled controls >=44px high";
  });

  if (shots) {
    await settleScroll(mobilePage);
    await settle(mobilePage);
    await mobilePage.screenshot({ path: path.join(SHOTS, "k7-knowledge-390.png"), fullPage: false });
  }
  await mobile.close();

  /* --------------------------------------------------------------- keyframes */
  if (shots) {
    const shotContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const shotPage = await shotContext.newPage();
    await shotPage.goto(`${base}/index.html?date=${LATEST_DATE}`, { waitUntil: "load" });
    await shotPage.waitForFunction(() => document.querySelectorAll("#timeline-track li").length === 15);
    await shotPage.waitForTimeout(700);
    await settle(shotPage);
    await shotPage.screenshot({ path: path.join(SHOTS, "k1-timeline-light.png") });
    await shotPage.goto(`${base}/index.html?date=2026-10-25&theme=dark`, { waitUntil: "load" });
    await shotPage.waitForFunction(() => document.querySelectorAll("#timeline-track li").length === 15);
    await shotPage.waitForTimeout(700);
    await settle(shotPage);
    await shotPage.screenshot({ path: path.join(SHOTS, "k2-timeline-dark.png") });
    await shotPage.goto(`${base}/index.html?date=${LATEST_DATE}&theme=dark&dealer=daily%3A2026-10-26`, { waitUntil: "load" });
    await shotPage.waitForFunction(() => !document.getElementById("dealer-backdrop")?.hasAttribute("hidden"));
    await shotPage.waitForTimeout(500);
    await settle(shotPage);
    await shotPage.screenshot({ path: path.join(SHOTS, "k4-dealer-dark.png") });
    await shotContext.close();

    await check("keyframes: seven review-state captures written", async () => {
      const expected = [
        "k1-timeline-light.png",
        "k2-timeline-dark.png",
        "k3-dealer-light.png",
        "k4-dealer-dark.png",
        "k5-knowledge-light.png",
        "k6-knowledge-dark.png",
        "k7-knowledge-390.png",
      ];
      const written = readdirSync(SHOTS);
      const missing = expected.filter((name) => !written.includes(name));
      assert(missing.length === 0, `missing keyframes: ${missing.join(", ")}`);
      const sizes = expected.map((name) => {
        const bytes = readFileSync(path.join(SHOTS, name)).length;
        assert(bytes > 10_000, `${name} is only ${bytes} bytes`);
        return `${name.replace(".png", "")}:${Math.round(bytes / 1024)}KB`;
      });
      return sizes.join(", ");
    });
  }
} finally {
  await browser.close();
  server.close();
}

record(
  "owner visual acceptance against the keyframes",
  "NOT RUN",
  "an owner judgement, not a test outcome; the harness cannot certify it",
);

const pass = results.filter((item) => item.status === "PASS").length;
const fail = results.filter((item) => item.status === "FAIL").length;
const notRun = results.filter((item) => item.status === "NOT RUN").length;
const report = {
  schemaVersion: "intelligent-atlas-prototype-journey/1.0",
  generatedAt: new Date().toISOString(),
  command: "node intelligent-atlas/tools/verify-prototype-journey.mjs",
  browser: "Microsoft Edge via playwright-core",
  pass,
  fail,
  notRun,
  results,
  externalChecks: [
    {
      name: "lighthouse (in-app browser)",
      status: "RUN SEPARATELY",
      detail:
        "accessibility 1.0, best-practices 1.0, SEO 1.0 on the knowledge view; one notable audit result, label-content-name-mismatch, not repaired.",
    },
    {
      name: "deployment",
      status: "BLOCKED",
      detail: "Cloudflare credentials and Pages enablement are owner-only; no deployment was attempted.",
    },
  ],
  note:
    "This harness proves behaviour of the isolated review prototype. It does not prove publication, scientific review, deployment or owner visual acceptance.",
};
await writeFile(REPORT, JSON.stringify(report, null, 2) + "\n");
console.log(`\n${pass} PASS, ${fail} FAIL, ${notRun} NOT RUN. Report: ${path.relative(ROOT, REPORT)}`);
process.exit(fail === 0 ? 0 : 1);
