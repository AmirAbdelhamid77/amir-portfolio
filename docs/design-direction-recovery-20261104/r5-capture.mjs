// R5 evidence capture and engineering checks: the closing scene.
//
//   $env:NODE_PATH="$PWD\node_modules"; node docs/design-direction-recovery-20261104/r5-capture.mjs
//
// Needs the review export served (all five flags on):
//   $env:HANSA_ATLAS_REVIEW_PREVIEW="1"; $env:HANSA_NEIGHBOURHOOD_REVIEW="1";
//   $env:HANSA_TIMELINE_REVIEW="1"; $env:HANSA_DEALER_REVIEW="1";
//   $env:HANSA_CLOSING_REVIEW="1"; npm run build
//   node scripts/serve-out.mjs 4395
//
// Read-only: writes r5-*.png and r5-report.json into evidence/.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = path.resolve("docs/design-direction-recovery-20261104/evidence");
const BASE = "http://localhost:4395";
const HOME_URL = `${BASE}/#closing`;
const AXE = path.resolve("node_modules/axe-core/axe.min.js");
const feed = JSON.parse(
  await readFile(path.resolve("content/knowledge/insights.json"), "utf8"),
);
const selected = feed.items.find(
  (item) => item.id === "hansa-insight-shortcut-reference-v1",
);

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const shots = [];
const report = {
  url: HOME_URL,
  expectedQuote: selected.takeaway,
  viewports: {},
  interactions: {},
  axe: null,
  console: [],
  notes: [],
};

async function open({ width = 1280, height = 900, dark = true, url = HOME_URL } = {}) {
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
  await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForSelector("#closing .stage-close-ledger", { timeout: 45_000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.addStyleTag({ content: "header.fixed{position:absolute !important}" });
  await page.locator("#closing").scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  return { page, context, errors };
}

async function shot(page, name, label, fullPage = false) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage });
  shots.push({ name, label });
}

async function shotClosing(page, name, label) {
  await page.locator("#closing").screenshot({ path: path.join(OUT, `${name}.png`) });
  shots.push({ name, label });
}

async function measure(page) {
  return page.evaluate(() => {
    const box = (element) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    };
    const text = (selector) =>
      document.querySelector(selector)?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const closing = document.getElementById("closing");
    const details = document.querySelector(".stage-close-details");
    const ledgerRows = [...document.querySelectorAll(".stage-close-ledger-list > div")].map(
      (row) => ({
        label: row.querySelector("dt")?.textContent?.trim() ?? "",
        value: row.querySelector("dd")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      }),
    );
    return {
      viewport: { width: innerWidth, height: innerHeight },
      horizontalOverflow:
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
      closingBox: box(closing),
      title: text("#stage-closing-title"),
      quote: text(".stage-close-quote"),
      credit: text(".stage-close-credit"),
      condition: text(".stage-close-condition"),
      action: text(".stage-close-actions .stage-primary-action"),
      archive: text(".stage-close-actions a"),
      posture: text(".stage-close-posture"),
      ledgerRows,
      ledgerNote: text(".stage-close-ledger-note"),
      ledgerKicker: text(".stage-close-ledger-kicker"),
      details: {
        present: Boolean(details),
        open: details?.hasAttribute("open") ?? false,
        summary: text(".stage-close-details summary"),
        denominators: document.querySelectorAll(
          ".stage-close-details-body dl:nth-of-type(1) > div",
        ).length,
        decisions: document.querySelectorAll(
          ".stage-close-details-body dl:nth-of-type(2) > div",
        ).length,
        limits: document.querySelectorAll(".stage-close-details-body ul li").length,
        source: text(".stage-close-source-line"),
      },
      atlasLink:
        document.querySelector(".stage-close-atlas")?.getAttribute("href") ?? null,
      kept: {
        count: text(".stage-close-count"),
        items: [...document.querySelectorAll(".stage-close-saved-button")].map((button) =>
          button.textContent.replace(/\s+/g, " ").trim(),
        ),
        empty: text(".stage-close-empty"),
        label:
          document.querySelector(".stage-close-saved-button")?.getAttribute("aria-label") ??
          null,
      },
      claims: {
        heading: text("#stage-claims-title"),
        items: [...document.querySelectorAll(".stage-close-claims li")].map((li) =>
          li.textContent.replace(/\s+/g, " ").trim(),
        ),
      },
      destinations: document.querySelectorAll(
        ".stage-close-destinations .stage-destination",
      ).length,
      destinationsHeading: text(".stage-close-destinations h3"),
      publicClose: {
        /* The accepted M6 closing markers must be gone in the review branch. */
        publicKicker: [...document.querySelectorAll("#closing .stage-kicker")].some(
          (node) => node.textContent.includes("The way onward"),
        ),
        publicTitle: [...document.querySelectorAll("#closing h2")].some((node) =>
          node.textContent.includes("Nothing here is a dead end"),
        ),
      },
      page: {
        title: document.title,
        url: location.href,
      },
      focus: {
        tag: document.activeElement?.tagName ?? null,
        className: document.activeElement?.className ?? null,
        text: document.activeElement?.textContent?.replace(/\s+/g, " ").trim().slice(0, 60),
      },
      dealer: (() => {
        const dialog = document.getElementById("dealer-cinematic");
        return dialog
          ? {
              present: true,
              title:
                dialog.querySelector(".dc-title")?.textContent?.replace(/\s+/g, " ").trim() ??
                "",
              kicker:
                dialog.querySelector(".dc-kicker")?.textContent?.replace(/\s+/g, " ").trim() ??
                "",
              cards: dialog.querySelectorAll(".dc-card").length,
              readerTitle:
                dialog
                  .querySelector(".dc-reader-title")
                  ?.textContent?.replace(/\s+/g, " ").trim() ?? "",
            }
          : { present: false };
      })(),
      savedStorage: (() => {
        try {
          return window.localStorage.getItem("hansa.dealer.saved.v1");
        } catch {
          return null;
        }
      })(),
    };
  });
}

function record(name, value) {
  report.viewports[name] = value;
}

async function axe(page, selector) {
  await page.addScriptTag({ path: AXE });
  return page.evaluate(async (target) => {
    const result = await window.axe.run(document.querySelector(target), {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
    return result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
      targets: violation.nodes.slice(0, 3).map((node) => node.target.join(" ")),
    }));
  }, selector);
}

try {
  // ------------------------------------------------------------- 1280 dark
  {
    const { page, context, errors } = await open();
    const closed = await measure(page);
    record("1280-dark", closed);
    await shot(page, "r5-closing-dark-1280", "R5 review close, dark, 1280");
    await shotClosing(page, "r5-closing-section-dark-1280", "R5 closing scene, dark, 1280");
    report.axe = await axe(page, "#closing");

    // The coverage note is a native disclosure, not a modal.
    await page.locator(".stage-close-details summary").click();
    await page.waitForTimeout(180);
    const details = await measure(page);
    report.interactions.details = {
      open: details.details.open,
      denominators: details.details.denominators,
      decisions: details.details.decisions,
      limits: details.details.limits,
      source: details.details.source,
    };
    await shot(page, "r5-coverage-dark-1280", "R5 full coverage note expanded, dark, 1280");
    await page.locator(".stage-close-details summary").click();
    await page.waitForTimeout(120);

    // The one action reopens the edition: the dealer is mounted in this build.
    await page.locator(".stage-close-actions .stage-primary-action").click();
    await page.waitForSelector("#dealer-cinematic", { state: "attached", timeout: 20_000 });
    await page.waitForTimeout(450);
    const reopened = await measure(page);
    report.interactions.reopen = {
      action: closed.action,
      dialog: reopened.dealer,
      url: reopened.page.url,
    };
    await shot(page, "r5-reopen-dealer-dark-1280", "R5 reopen action opens the 26 Oct dealer");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(320);
    const back = await measure(page);
    report.interactions.reopen.focusAfterEscape = back.focus;
    report.interactions.reopen.overflowAfterEscape = back.horizontalOverflow;

    // Save a card in the dealer, then check the closing list is in step.
    await page.locator("#today .stage-primary-action").first().click();
    await page.waitForSelector("#dealer-cinematic", { state: "attached", timeout: 20_000 });
    await page.waitForTimeout(380);
    await page.getByRole("button", { name: "Save for later" }).click();
    await page.waitForTimeout(180);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(320);
    await page.locator("#closing").scrollIntoViewIfNeeded();
    await page.waitForTimeout(280);
    const kept = await measure(page);
    report.interactions.kept = {
      count: kept.kept.count,
      items: kept.kept.items,
      label: kept.kept.label,
      storage: kept.savedStorage,
      empty: kept.kept.empty,
    };
    await shot(page, "r5-kept-dark-1280", "R5 closing lists the card kept in this browser");

    // A kept card opens its edition at that card.
    await page.locator(".stage-close-saved-button").first().click();
    await page.waitForSelector("#dealer-cinematic", { state: "attached", timeout: 20_000 });
    await page.waitForTimeout(420);
    const opened = await measure(page);
    report.interactions.openSaved = {
      dialog: opened.dealer,
      url: opened.page.url,
    };
    await shot(page, "r5-saved-open-dark-1280", "R5 kept card reopens the dealer at that card");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(260);

    report.console.push(...errors);
    await context.close();
  }

  // ------------------------------------------------------------ 1280 light
  {
    const { page, context, errors } = await open({ dark: false });
    record("1280-light", await measure(page));
    await shot(page, "r5-closing-light-1280", "R5 review close, light, 1280");
    await shotClosing(page, "r5-closing-section-light-1280", "R5 closing scene, light, 1280");
    await page.locator(".stage-close-details summary").click();
    await page.waitForTimeout(160);
    await shot(page, "r5-coverage-light-1280", "R5 coverage note, light, 1280");
    report.console.push(...errors);
    await context.close();
  }

  // ------------------------------------------------------------ 1024 light
  {
    const { page, context, errors } = await open({ width: 1024, height: 900, dark: false });
    record("1024-light", await measure(page));
    await shot(page, "r5-closing-light-1024", "R5 review close, light, 1024");
    report.console.push(...errors);
    await context.close();
  }

  // ------------------------------------------------------------- 390 light
  {
    const { page, context, errors } = await open({ width: 390, height: 844, dark: false });
    record("390-light", await measure(page));
    await shot(page, "r5-closing-light-390", "R5 review close, light, 390");
    await shotClosing(page, "r5-closing-section-light-390", "R5 closing scene, light, 390");
    report.console.push(...errors);
    await context.close();
  }

  // ------------------------------------------------------------- 320 light
  {
    const { page, context, errors } = await open({ width: 320, height: 720, dark: false });
    record("320-light", await measure(page));
    await shot(page, "r5-closing-light-320", "R5 review close, light, 320");
    report.console.push(...errors);
    await context.close();
  }

  report.shots = shots;
  report.note =
    "Single local run against the R5 review export (ATLAS+NEIGHBOURHOOD+TIMELINE+DEALER+CLOSING flags on) in Edge headless with reduced motion. The closing scene has no entrance animation; the axe pass is not a screen-reader pass and a headless run is not touch hardware.";
  await writeFile(
    path.join(OUT, "r5-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
