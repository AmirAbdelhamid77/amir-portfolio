// R3 evidence capture and engineering checks: the desktop timeline fan.
//
//   NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r3-capture.mjs
//
// Needs the review export served (all three flags on):
//   $env:HANSA_ATLAS_REVIEW_PREVIEW="1"; $env:HANSA_NEIGHBOURHOOD_REVIEW="1";
//   $env:HANSA_TIMELINE_REVIEW="1"; npm run build
//   node scripts/serve-out.mjs 4395
//
// Read-only: writes r3-*.png and r3-report.json into evidence/.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = path.resolve("docs/design-direction-recovery-20261104/evidence");
const BASE = "http://localhost:4395";
const HOME_URL = `${BASE}/?insight=hansa-insight-shortcut-reference-v1#edition`;
const AXE = path.resolve("node_modules/axe-core/axe.min.js");

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const shots = [];
const report = {
  url: HOME_URL,
  viewports: {},
  interactions: {},
  axe: null,
  console: [],
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
  await page.goto(HOME_URL, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForSelector(".stage-fan", { state: "attached", timeout: 45_000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.addStyleTag({ content: "header.fixed{position:absolute !important}" });
  await page.locator("#today").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  return { page, context, errors };
}

async function shot(page, name, label, fullPage = false) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage });
  shots.push({ name, label });
}

async function shotElement(page, selector, name, label) {
  await page.locator(selector).first().screenshot({ path: path.join(OUT, `${name}.png`) });
  shots.push({ name, label });
}

async function measure(page) {
  return page.evaluate(() => {
    const box = (element) => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    };
    const fan = document.querySelector(".stage-fan");
    const strip = document.querySelector(".stage-timeline");
    const visible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden";
    };
    const cards = [...document.querySelectorAll(".stage-fan-card")].map((card) => {
      const style = getComputedStyle(card);
      return {
        text: card.textContent.replace(/\s+/g, " ").trim().slice(0, 90),
        current: card.getAttribute("data-current") === "true" || card.getAttribute("aria-current") === "date",
        quiet: card.classList.contains("is-quiet"),
        latest: card.getAttribute("data-latest") === "true",
        opacity: Number(style.opacity),
        scale: Number(style.transform.match(/matrix\(([-\d.]+)/)?.[1] ?? 1),
        ...box(card),
      };
    });
    const front = cards.filter((card) => card.opacity > 0.55);
    const overlaps = [];
    for (let a = 0; a < front.length; a += 1) {
      for (let b = a + 1; b < front.length; b += 1) {
        const left = Math.max(front[a].x, front[b].x);
        const right = Math.min(front[a].x + front[a].width, front[b].x + front[b].width);
        const top = Math.max(front[a].y, front[b].y);
        const bottom = Math.min(front[a].y + front[a].height, front[b].y + front[b].height);
        if (right - left > 2 && bottom - top > 2) overlaps.push([a, b]);
      }
    }
    const current = cards.find((card) => card.current);
    return {
      fanVisible: visible(fan),
      stripVisible: visible(strip),
      cards: cards.length,
      quiet: cards.filter((card) => card.quiet).length,
      editions: cards.filter((card) => !card.quiet).length,
      latest: cards.filter((card) => card.latest).length,
      frontCards: front.length,
      overlaps,
      current,
      currentCount: document.querySelectorAll('.stage-fan [aria-current="date"]').length,
      focusLabel: document.querySelector(".stage-fan-focus span")?.textContent?.trim() ?? "",
      ghost: document.querySelector(".stage-fan-ghost")?.textContent?.trim() ?? "",
      rulerTicks: document.querySelectorAll(".stage-fan-tick").length,
      cables: document.querySelectorAll(".stage-fan-cable").length,
      status: document.querySelector(".stage-fan-status")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      steppers: [...document.querySelectorAll(".stage-fan-steppers button")].map((button) => ({
        label: button.getAttribute("aria-label"),
        disabled: button.disabled,
      })),
      sectionNote:
        document
          .querySelector(".stage-section-note")
          ?.innerText?.replace(/\s+/g, " ")
          .trim() ?? "",
      fanBox: fan ? box(fan) : null,
      stageWidth: document.documentElement.clientWidth,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      peekTitle: document.querySelector(".stage-peek-title")?.textContent?.trim() ?? "",
      pageTitle: document.title,
    };
  });
}

function record(name, value) {
  report.viewports[name] = value;
}

try {
  // ------------------------------------------------------------- 1280 dark
  {
    const { page, context, errors } = await open();
    record("1280-dark", await measure(page));
    await shot(page, "r3-fan-dark-1280", "R3 timeline fan, dark, 1280");
    await shotElement(page, ".stage-fan", "r3-fan-element-dark-1280", "R3 fan element with cables, ghost year and ruler");

    // Axe on the timeline scene.
    await page.addScriptTag({ path: AXE });
    report.axe = (
      await page.evaluate(async () => {
        const result = await window.axe.run(document.querySelector("#today"), {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
        });
        return result.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.length,
        }));
      })
    );

    // Select the middle edition by clicking its card.
    const cards = page.locator(".stage-fan button.stage-fan-card");
    const before = await measure(page);
    await cards.nth(1).click();
    await page.waitForTimeout(700);
    const afterClick = await measure(page);
    report.interactions.click = {
      before: before.current?.text ?? null,
      after: afterClick.current?.text ?? null,
      focusLabel: afterClick.focusLabel,
      peekTitle: afterClick.peekTitle,
      url: page.url(),
    };
    await shot(page, "r3-fan-selected-dark-1280", "R3 fan after selecting the second edition");

    // Keyboard: focus the selected card, ArrowRight to the next edition.
    await page.locator('.stage-fan [aria-current="date"]').focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(650);
    const afterKey = await measure(page);
    report.interactions.keyboard = {
      after: afterKey.current?.text ?? null,
      focusStays: await page.evaluate(
        () => document.activeElement?.getAttribute("aria-current") === "date",
      ),
      url: page.url(),
    };
    await shot(page, "r3-fan-keyboard-dark-1280", "R3 fan after ArrowRight (focus stays in the fan)");

    // Drag from the oldest edition towards the right: the fan should settle on a
    // newer edition. (Dragging further left from the oldest has nowhere to go,
    // which is why the previous run reported no change.)
    const box = await page.locator(".stage-fan").boundingBox();
    const startX = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    const beforeDrag = (await measure(page)).current?.text ?? null;
    await page.mouse.move(startX, y);
    await page.mouse.down();
    for (let step = 1; step <= 8; step += 1) {
      await page.mouse.move(startX + (400 * step) / 8, y, { steps: 1 });
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
    await page.waitForTimeout(750);
    const afterDrag = await measure(page);
    report.interactions.drag = {
      before: beforeDrag,
      after: afterDrag.current?.text ?? null,
      focusLabel: afterDrag.focusLabel,
      url: page.url(),
      overlaps: afterDrag.overlaps.length,
    };
    await shot(page, "r3-fan-drag-dark-1280", "R3 fan after a drag settles on the nearest edition");

    // Horizontal wheel from the newest edition: +300 px moves to an older
    // edition and settles there.
    const beforeWheel = (await measure(page)).current?.text ?? null;
    await page.mouse.move(startX, y);
    await page.mouse.wheel(300, 0);
    await page.waitForTimeout(800);
    const afterWheel = await measure(page);
    report.interactions.wheel = {
      before: beforeWheel,
      after: afterWheel.current?.text ?? null,
      focusLabel: afterWheel.focusLabel,
      url: page.url(),
    };
    await shot(page, "r3-fan-wheel-dark-1280", "R3 fan after a horizontal wheel settles on the nearest edition");

    // Steppers: Previous moves to the newer edition (left), Next to the older
    // edition (right). The wheel left the oldest edition selected, so both
    // directions are exercisable without hitting a disabled end.
    const beforeStepper = (await measure(page)).current?.text ?? null;
    await page.getByRole("button", { name: "Previous edition" }).click();
    await page.waitForTimeout(650);
    const afterPrev = await measure(page);
    await page.getByRole("button", { name: "Next edition" }).click();
    await page.waitForTimeout(650);
    const afterNext = await measure(page);
    report.interactions.steppers = {
      before: beforeStepper,
      previous: afterPrev.current?.text ?? null,
      next: afterNext.current?.text ?? null,
      focusLabel: afterNext.focusLabel,
      url: page.url(),
    };
    await shot(page, "r3-fan-steppers-dark-1280", "R3 fan after the prev/next steppers");

    // Full-motion pass (the rest of the session is reduced motion).
    await context.close();

    const motion = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 1,
    });
    await motion.addInitScript(() => {
      try {
        window.localStorage.setItem("amir-theme", "dark");
      } catch {
        /* ignore */
      }
    });
    const motionPage = await motion.newPage();
    await motionPage.goto(HOME_URL, { waitUntil: "networkidle", timeout: 90_000 });
    await motionPage.waitForSelector(".stage-fan", { state: "attached", timeout: 45_000 });
    await motionPage.evaluate(() => document.fonts?.ready);
    await motionPage.locator("#today").scrollIntoViewIfNeeded();
    await motionPage.waitForTimeout(600);
    await shot(motionPage, "r3-fan-motion-dark-1280", "R3 fan with full motion at rest");
    await motion.close();
    report.console.push(...errors);
  }

  // ------------------------------------------------------------ 1280 light
  {
    const { page, context, errors } = await open({ dark: false });
    record("1280-light", await measure(page));
    await shot(page, "r3-fan-light-1280", "R3 timeline fan, light, 1280");
    await shotElement(page, ".stage-fan", "r3-fan-element-light-1280", "R3 fan element, light");
    report.console.push(...errors);
    await context.close();
  }

  // ------------------------------------------------------------ 1024 light
  {
    const { page, context, errors } = await open({ width: 1024, height: 900, dark: false });
    record("1024-light", await measure(page));
    await shot(page, "r3-fan-light-1024", "R3 timeline fan, light, 1024");
    report.console.push(...errors);
    await context.close();
  }

  // ------------------------------------------------------------- 390 light
  {
    const { page, context, errors } = await open({ width: 390, height: 844, dark: false });
    record("390-light", await measure(page));
    await shot(page, "r3-strip-light-390", "R3 compact strip, light, 390");
    report.console.push(...errors);
    await context.close();
  }

  // ------------------------------------------------------------- 320 light
  {
    const { page, context, errors } = await open({ width: 320, height: 720, dark: false });
    record("320-light", await measure(page));
    report.console.push(...errors);
    await shot(page, "r3-strip-light-320", "R3 compact strip, light, 320");
    await context.close();
  }

  report.shots = shots;
  report.note =
    "Single local run against the review export (HANSA_ATLAS_REVIEW_PREVIEW=1, HANSA_NEIGHBOURHOOD_REVIEW=1, HANSA_TIMELINE_REVIEW=1) in Edge headless. Reduced motion except the one full-motion shot. An axe pass is not a screen-reader pass.";
  await writeFile(
    path.join(OUT, "r3-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
