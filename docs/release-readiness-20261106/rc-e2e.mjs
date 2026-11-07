// End-to-end verification of the integrated release candidate.
//
//   node docs/release-readiness-20261106/rc-e2e.mjs
//
// Prerequisites: `node scripts/build-rc.mjs` has produced `out-rc/` and
// `node scripts/serve-rc.mjs 4396` is serving it. The script drives Microsoft
// Edge through playwright-core, records every check, and writes the raw result
// to `evidence/rc-e2e.json`. It fails (exit 1) if any assertion does not hold.
//
// Scope: routes, the three scenes, fan/strip, cinematic dealer, saved cards,
// closing coverage disclosure, archive search, themes, five viewports, reduced
// and full motion, axe WCAG A/AA, LCP/CLS and transferred bytes.
// Not scope: a manual screen-reader audit. Chromium's accessibility tree is not
// an assistive-technology test, and the report says so.
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const BASE = process.env.RC_BASE ?? "http://127.0.0.1:4396";
const EDGE =
  process.env.RC_BROWSER ??
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const EVIDENCE = "docs/release-readiness-20261106/evidence";
const AXE = readFileSync("node_modules/axe-core/axe.min.js", "utf8");

const results = [];
const errors = [];
function check(id, ok, detail = "") {
  results.push({ id, ok: Boolean(ok), detail: String(detail).slice(0, 400) });
  console.log(`${ok ? "PASS" : "FAIL"} ${id}${detail ? ` — ${detail}` : ""}`);
}

const PERF_INIT = () => {
  window.__perf = { lcp: 0, cls: 0, shifts: [] };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      window.__perf.lcp = Math.max(window.__perf.lcp, entry.startTime);
    }
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        window.__perf.cls += entry.value;
        window.__perf.shifts.push(Number(entry.value.toFixed(4)));
      }
    }
  }).observe({ type: "layout-shift", buffered: true });
};

const collect = (page) =>
  page.evaluate(() => {
    const visible = (node) => {
      const style = getComputedStyle(node);
      return (
        node.getClientRects().length > 0 &&
        style.visibility !== "hidden" &&
        style.display !== "none"
      );
    };
    const smallText = [...document.querySelectorAll("p, li, td, dd, dt, figcaption, blockquote")]
      .filter((node) => visible(node) && node.textContent.trim().length > 24)
      .map((node) => {
        const style = getComputedStyle(node);
        return {
          size: parseFloat(style.fontSize),
          mono: /mono/i.test(style.fontFamily),
          upper: style.textTransform === "uppercase",
          text: node.textContent.trim().replace(/\s+/g, " ").slice(0, 60),
        };
      });
    // The design reserves 11 px for mono labels and provenance and 10 px for
    // mono metadata. Prose below 11 px, or anything below 9 px, is a regression.
    const smallProse = smallText.filter((entry) => !entry.mono && !entry.upper && entry.size < 11);
    const microText = smallText.filter((entry) => entry.size < 9);
    const controls = [...document.querySelectorAll("button, a[href], summary, input, select")]
      .filter((node) => visible(node))
      .map((node) => {
        // A radio or checkbox is clicked through its label: the effective target
        // is the label box, not the 14 px control inside it.
        const target = node.closest("label") ?? node;
        const rect = target.getBoundingClientRect();
        return {
          tag: node.tagName.toLowerCase(),
          label: (node.getAttribute("aria-label") ?? node.textContent ?? "").trim().slice(0, 50),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
          inStage: Boolean(node.closest(".hansa-stage")),
        };
      });
    const stageControls = controls.filter((entry) => entry.inStage);
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      smallText: smallText.filter((entry) => entry.size < 12).slice(0, 8),
      smallProse,
      microText,
      stageSmallTargets: stageControls
        .filter((entry) => entry.h < 43 || entry.w < 20)
        .slice(0, 8),
      stageSmallTargetCount: stageControls.filter((entry) => entry.h < 43 || entry.w < 20).length,
      fanDisplay: (() => {
        const fan = document.querySelector(".stage-fan");
        return fan ? getComputedStyle(fan).display : "absent";
      })(),
      stripDisplay: (() => {
        const strip = document.querySelector(".stage-timeline");
        return strip ? getComputedStyle(strip).display : "absent";
      })(),
      animations: document.getAnimations().length,
      polish: document.querySelector("[data-stage-polish='true']") !== null,
    };
  });

async function axe(page, id) {
  await page.addScriptTag({ content: AXE });
  const run = await page.evaluate(async () => {
    const outcome = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
    return outcome.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
      target: violation.nodes[0]?.target?.join(" ") ?? "",
    }));
  });
  check(`axe ${id}`, run.length === 0, run.length ? JSON.stringify(run.slice(0, 4)) : "0 violations");
  return run;
}

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
mkdirSync(EVIDENCE, { recursive: true });

try {
  // ---------------------------------------------------------------- responsive
  const viewports = [
    { width: 1280, height: 900, theme: "light", axe: true },
    { width: 1280, height: 900, theme: "dark", axe: false },
    { width: 1024, height: 800, theme: "dark", axe: true },
    { width: 768, height: 900, theme: "light", axe: true },
    { width: 390, height: 844, theme: "dark", axe: true, touch: true },
    { width: 320, height: 700, theme: "light", axe: true, touch: true },
  ];
  for (const spec of viewports) {
    const context = await browser.newContext({
      viewport: { width: spec.width, height: spec.height },
      colorScheme: spec.theme,
      hasTouch: Boolean(spec.touch),
      isMobile: Boolean(spec.touch),
    });
    const page = await context.newPage();
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`${spec.width}: ${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`${spec.width}: ${error.message}`));
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const id = `${spec.width}-${spec.theme}`;
    const facts = await collect(page);
    check(
      `overflow ${id}`,
      facts.scrollWidth <= facts.innerWidth + 1,
      `${facts.scrollWidth} <= ${facts.innerWidth}`,
    );
    check(`polish attr ${id}`, facts.polish);
    const expectFan = spec.width >= 1024;
    check(
      `fan ${expectFan ? "shown" : "hidden"} ${id}`,
      expectFan ? facts.fanDisplay === "block" : facts.fanDisplay === "none",
      `fan=${facts.fanDisplay} strip=${facts.stripDisplay}`,
    );
    check(
      `strip ${expectFan ? "hidden" : "shown"} ${id}`,
      expectFan ? facts.stripDisplay === "none" : facts.stripDisplay !== "none",
      `strip=${facts.stripDisplay}`,
    );
    check(
      `no prose below 11px ${id}`,
      facts.smallProse.length === 0,
      JSON.stringify(facts.smallProse.slice(0, 4)),
    );
    check(`no text below 9px ${id}`, facts.microText.length === 0, JSON.stringify(facts.microText.slice(0, 4)));
    check(
      `44px stage targets ${id}`,
      facts.stageSmallTargetCount === 0,
      JSON.stringify(facts.stageSmallTargets),
    );
    if (spec.axe) await axe(page, id);
    await context.close();
  }

  // ------------------------------------------------------------------ routes
  const routes = ["/", "/learn", "/practice/catalogue", "/learn/dp-600/atlas/", "/about", "/prototype-c/"];
  const routeContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const routePage = await routeContext.newPage();
  const routeErrors = [];
  routePage.on("pageerror", (error) => routeErrors.push(error.message));
  routePage.on("console", (message) => {
    if (message.type() === "error") routeErrors.push(message.text());
  });
  for (const route of routes) {
    const response = await routePage.goto(BASE + route, { waitUntil: "networkidle" });
    const headings = await routePage.locator("h1").count();
    check(`route ${route}`, response?.status() === 200 && headings >= 1, `status=${response?.status()} h1=${headings}`);
  }
  await routePage.goto(`${BASE}/prototype-c/`, { waitUntil: "networkidle" });
  const canonical = await routePage.locator('link[rel="canonical"]').getAttribute("href");
  check("prototype-c canonical", (canonical ?? "").endsWith("/"), canonical ?? "missing");
  // Asked through the request API: navigating to a 404 would log the expected
  // browser console error and muddy the console gate.
  const review = await routeContext.request.get(`${BASE}/review/neighbourhood/`);
  check("review route absent", review.status() === 404, `status=${review.status()}`);
  check("no console errors on routes", routeErrors.length === 0, routeErrors.slice(0, 3).join(" | "));
  await routeContext.close();

  // ------------------------------------------------------------ interactions
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "light" });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(`interaction: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`interaction console: ${message.text()}`);
  });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.locator(".stage-fan").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  // 1. Fan selection.
  const fanCards = page.locator('.stage-fan-item[data-has-edition="true"] button');
  const fanCount = await fanCards.count();
  check("fan editions present", fanCount >= 2, `${fanCount} cards`);
  await fanCards.nth(1).click();
  await page.waitForTimeout(350);
  check("fan select updates URL", page.url().includes("?insight="), page.url());
  check("fan aria-pressed", (await fanCards.nth(1).getAttribute("aria-pressed")) === "true");

  // 2. Keyboard on the fan.
  await fanCards.nth(1).focus();
  const beforeKey = page.url();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(350);
  check("fan arrow key moves selection", page.url() !== beforeKey, page.url());

  // 3. Open the edition.
  const openButton = page.getByRole("button", { name: "Open the edition" });
  await openButton.scrollIntoViewIfNeeded();
  await openButton.click();
  const dialog = page.locator("#dealer-cinematic");
  await dialog.waitFor({ state: "visible" });
  check("dealer dialog opens", await dialog.isVisible());
  check("dealer is modal", (await dialog.getAttribute("aria-modal")) === "true");
  const focusInDialog = await page.evaluate(
    () => document.getElementById("dealer-cinematic")?.contains(document.activeElement) ?? false,
  );
  check("dealer takes focus", focusInDialog);

  // 4. Read a card, then save it.
  const activeCard = dialog.locator('.dc-card[data-active="true"]');
  const activeTitle = (await activeCard.innerText()).trim();
  await dialog.locator(".dc-card").nth(1).click();
  await page.waitForTimeout(300);
  const secondTitle = (await dialog.locator('.dc-card[data-active="true"]').innerText()).trim();
  check(
    "dealer card switch",
    secondTitle !== activeTitle,
    `${activeTitle.replace(/\s+/g, " ").slice(0, 48)} -> ${secondTitle.replace(/\s+/g, " ").slice(0, 48)}`,
  );
  await dialog.getByRole("button", { name: "Save for later" }).click();
  await page.waitForTimeout(200);
  const savedButtonLabel = await dialog.getByRole("button", { name: /Saved/ }).first().innerText();
  check("save confirms", /Saved/.test(savedButtonLabel), savedButtonLabel.trim());

  // The kept-card list lives in the closing scene: check it after the dialog is
  // closed so the assertion reads the page, not the modal.
  const stored = await page.evaluate(() => localStorage.getItem("hansa.dealer.saved.v1"));
  check("save persists locally", Boolean(stored && stored.includes("::")), stored?.slice(0, 80) ?? "empty");

  // 5. Escape closes the dialog and returns focus to the control that opened it.
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  check("escape closes dealer", !(await dialog.isVisible()));
  const focusBack = await page.evaluate(() => {
    const active = document.activeElement;
    return {
      tag: active?.tagName ?? "",
      text: (active?.textContent ?? "").trim().slice(0, 60),
      inDialog: Boolean(document.getElementById("dealer-cinematic")?.contains(active)),
      id: active?.id ?? "",
    };
  });
  check(
    "escape returns focus to the opener",
    !focusBack.inDialog && /Open the edition/.test(focusBack.text),
    JSON.stringify(focusBack),
  );

  // 6. Closing keeps the saved card and reopens it.
  const closing = page.locator("#closing");
  await closing.scrollIntoViewIfNeeded();
  const savedButton = closing.locator(".stage-close-saved-button").first();
  await savedButton.waitFor({ state: "visible" });
  const keptTitle = (await savedButton.innerText()).trim();
  check("closing lists the kept card", keptTitle.length > 0, keptTitle.replace(/\s+/g, " ").slice(0, 80));
  await savedButton.click();
  await dialog.waitFor({ state: "visible" });
  const reopened = (await dialog.locator('.dc-card[data-active="true"]').innerText()).trim();
  check("kept card reopens in the dealer", reopened.length > 0, reopened.replace(/\s+/g, " ").slice(0, 80));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);

  // 7. Coverage ledger disclosure.
  const details = closing.locator("details.stage-close-details");
  await details.locator("summary").click();
  await page.waitForTimeout(200);
  check("coverage disclosure opens", await details.evaluate((node) => node.open));
  const ledgerBody = await details.locator(".stage-close-details-body").innerText();
  check("coverage disclosure states limits", /Limits/.test(ledgerBody), ledgerBody.slice(0, 60).replace(/\s+/g, " "));

  // 8. Archive search + open.
  await page.locator("#archive").scrollIntoViewIfNeeded();
  await page.locator("#archive-query").fill("permissions");
  await page.waitForTimeout(300);
  const status = await page.locator('#archive [role="status"]').innerText();
  check("archive search filters", /edition/.test(status), status);
  await page.locator('#archive button:has-text("Open this edition")').first().click();
  await page.waitForTimeout(400);
  check("archive opens an edition", page.url().includes("?insight="), page.url());

  // 9. Theme + accent controls.
  const themeBefore = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  await page.getByRole("button", { name: "Toggle light and dark theme" }).click();
  await page.waitForTimeout(200);
  const themeAfter = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  check("theme toggle flips", themeBefore !== themeAfter, `${themeBefore} -> ${themeAfter}`);
  await page.getByRole("button", { name: "Choose accent colour" }).click();
  await page.waitForTimeout(150);
  const accentOptions = await page.locator("[data-accent-id]").count();
  check("accent menu opens", accentOptions >= 7, `${accentOptions} options`);
  check(
    "accent menu is a labelled dialog",
    (await page.locator('[role="dialog"][aria-label="Accent colour"]').count()) === 1,
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(150);
  check("accent menu closes on escape", (await page.locator("[data-accent-id]").count()) === 0);

  // 10. Deep link restores the dealer.
  await page.goto(`${BASE}/?dealer=hansa-insight-shortcut-reference-v1`, { waitUntil: "networkidle" });
  check("dealer deep link opens", await page.locator("#dealer-cinematic").isVisible());
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

  // 11. No review-only markup in the candidate home with R1/R2 off.
  const html = await page.content();
  check("no candidate edge ids rendered", !html.includes("edge:fabric:"));
  check("no review neighbourhood block", !html.includes("neighbourhood-review"));
  const stageText = await page.locator(".hansa-stage").innerText();
  check(
    "public stage states zero published",
    /0 published concepts/.test(stageText) && /0 published connections/.test(stageText),
    stageText.match(/0 published[^.]{0,40}/g)?.join(" | ") ?? "not found",
  );
  await context.close();

  // ---------------------------------------------------------------- motion
  for (const motion of ["reduce", "no-preference"]) {
    const motionContext = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      reducedMotion: motion,
      colorScheme: "light",
    });
    const motionPage = await motionContext.newPage();
    await motionPage.addInitScript(PERF_INIT);
    await motionPage.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await motionPage.waitForTimeout(1200);
    const facts = await collect(motionPage);
    if (motion === "reduce") {
      check("reduced motion: no web animations", facts.animations === 0, `${facts.animations} animations`);
      const durations = await motionPage.evaluate(() => {
        const nodes = [...document.querySelectorAll(".stage-fan-card, .stage-peek, .stage-scene, .dc-overlay")];
        return nodes.map((node) => getComputedStyle(node).transitionDuration).filter((value) => value && value !== "0s");
      });
      check("reduced motion: no transitions", durations.length === 0, durations.slice(0, 4).join(","));
    } else {
      const perf = await motionPage.evaluate(() => {
        const resources = performance.getEntriesByType("resource");
        const sum = (filter) =>
          resources.filter(filter).reduce((total, entry) => total + (entry.transferSize || 0), 0);
        return {
          lcp: Math.round(window.__perf.lcp),
          cls: Number(window.__perf.cls.toFixed(4)),
          shifts: window.__perf.shifts.length,
          requests: resources.length + 1,
          js: sum((entry) => entry.name.endsWith(".js")),
          css: sum((entry) => entry.name.endsWith(".css")),
          total: sum(() => true),
          domNodes: document.querySelectorAll("*").length,
        };
      });
      check("LCP under 1200 ms", perf.lcp > 0 && perf.lcp <= 1200, `${perf.lcp} ms`);
      check("CLS is zero", perf.cls === 0, `${perf.cls} across ${perf.shifts} shifts`);
      console.log("PERF", JSON.stringify(perf));
      writeFileSync(`${EVIDENCE}/rc-perf.json`, JSON.stringify(perf, null, 2));
    }
    await motionContext.close();
  }
} finally {
  await browser.close();
}

const failed = results.filter((entry) => !entry.ok);
const summary = {
  base: BASE,
  ranAt: new Date().toISOString(),
  checks: results.length,
  failed: failed.length,
  errors,
  results,
};
mkdirSync(EVIDENCE, { recursive: true });
writeFileSync(`${EVIDENCE}/rc-e2e.json`, JSON.stringify(summary, null, 2));
console.log(`\n${results.length} checks, ${failed.length} failed, ${errors.length} console errors`);
if (failed.length || errors.length) {
  console.error("FAILED:", failed.map((entry) => entry.id).join("; ") || "console errors");
  process.exit(1);
}
console.log("PASS: integrated release candidate verified.");
