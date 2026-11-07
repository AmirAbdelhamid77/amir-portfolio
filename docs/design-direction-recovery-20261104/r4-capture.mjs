// R4 evidence capture and engineering checks: the cinematic dealer.
//
//   $env:NODE_PATH="$PWD\node_modules"; node docs/design-direction-recovery-20261104/r4-capture.mjs
//
// Needs the review export served (all four flags on):
//   $env:HANSA_ATLAS_REVIEW_PREVIEW="1"; $env:HANSA_NEIGHBOURHOOD_REVIEW="1";
//   $env:HANSA_TIMELINE_REVIEW="1"; $env:HANSA_DEALER_REVIEW="1"; npm run build
//   node scripts/serve-out.mjs 4395
//
// Read-only: writes r4-*.png and r4-report.json into evidence/.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = path.resolve("docs/design-direction-recovery-20261104/evidence");
const BASE = "http://localhost:4395";
const HOME_URL = `${BASE}/`;
const DEEP_LINK = `${BASE}/?dealer=daily:2026-10-25&theme=dark`;
const AXE = path.resolve("node_modules/axe-core/axe.min.js");

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const shots = [];
const report = {
  url: HOME_URL,
  deepLink: DEEP_LINK,
  viewports: {},
  interactions: {},
  axe: null,
  console: [],
  notes: [],
};

async function open({ width = 1280, height = 900, dark = true, motion = false, url = HOME_URL } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: motion ? "no-preference" : "reduce",
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
  await page.waitForSelector("#today", { state: "attached", timeout: 45_000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.addStyleTag({ content: "header.fixed{position:absolute !important}" });
  await page.locator("#today").scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  return { page, context, errors };
}

async function openDealer(page) {
  await page.locator("#today .stage-primary-action").first().click();
  await page.waitForSelector("#dealer-cinematic", { state: "attached", timeout: 20_000 });
  await page.waitForTimeout(420);
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
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        bottom: Math.round(rect.bottom),
        right: Math.round(rect.right),
      };
    };
    const text = (selector) =>
      document.querySelector(selector)?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const dialog = document.getElementById("dealer-cinematic");
    const overlay = document.querySelector(".dc-overlay");
    const rail = document.querySelector(".dc-rail");
    const hand = document.querySelector(".dc-hand");
    const cards = [...document.querySelectorAll(".dc-card")].map((card) => {
      const style = getComputedStyle(card);
      return {
        title: card.querySelector(".dc-card-title")?.textContent?.trim() ?? "",
        kind: card.getAttribute("data-kind"),
        active: card.getAttribute("data-active") === "true",
        current: card.getAttribute("aria-current") === "true",
        capsOn: card.querySelectorAll('.dc-card-caps > span[data-on="true"]').length,
        opacity: Number(style.opacity),
        animationName: style.animationName,
        animationDelay: style.animationDelay,
      };
    });
    const active = document.activeElement;
    const railDays = [...document.querySelectorAll(".dc-day")];
    return {
      viewport: { width: innerWidth, height: innerHeight },
      horizontalOverflow:
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
      overlayPresent: Boolean(overlay),
      overlayParentIsBody: overlay?.parentElement === document.body,
      dialogPresent: Boolean(dialog),
      dialogBox: box(dialog),
      role: dialog?.getAttribute("role") ?? null,
      ariaModal: dialog?.getAttribute("aria-modal") ?? null,
      labelledByResolves: Boolean(
        dialog?.getAttribute("aria-labelledby") &&
          document.getElementById(dialog.getAttribute("aria-labelledby")),
      ),
      describedByResolves: Boolean(
        dialog?.getAttribute("aria-describedby") &&
          document.getElementById(dialog.getAttribute("aria-describedby")),
      ),
      title: text(".dc-title"),
      kicker: text(".dc-kicker"),
      badge: text(".dc-badge"),
      rail: {
        days: railDays.length,
        editions: railDays.filter((day) => day.getAttribute("aria-disabled") !== "true").length,
        quiet: railDays.filter((day) => day.getAttribute("aria-disabled") === "true").length,
        current: railDays.filter((day) => day.getAttribute("aria-current") === "date").length,
        currentLabel:
          document.querySelector('.dc-day[aria-current="date"]')?.getAttribute("aria-label") ?? "",
        scrollWidth: rail?.scrollWidth ?? 0,
        clientWidth: rail?.clientWidth ?? 0,
      },
      hand: {
        cards: cards.length,
        cardsList: cards,
        capsTotal: document.querySelectorAll(".dc-hand-head .dc-caps > li").length,
        capsOn: document.querySelectorAll('.dc-hand-head .dc-caps > li[data-on="true"]').length,
        label: text(".dc-hand-label"),
        note: text(".dc-hand-note"),
        scrollHeight: hand?.scrollHeight ?? 0,
        clientHeight: hand?.clientHeight ?? 0,
      },
      reader: {
        title: text(".dc-reader-title"),
        lede: text(".dc-reader-lede"),
        kicker: text(".dc-reader-kicker"),
        fields: [...document.querySelectorAll(".dc-fields dt")].map((dt) =>
          dt.textContent.replace(/\s+/g, " ").trim(),
        ),
        values: [...document.querySelectorAll(".dc-fields dd")].map((dd) =>
          dd.textContent.replace(/\s+/g, " ").trim().slice(0, 120),
        ),
        evidence: text(".dc-evidence blockquote"),
        why: text(".dc-why"),
        actions: [...document.querySelectorAll(".dc-reader-actions button, .dc-reader-actions a")].map(
          (node) => node.textContent.replace(/\s+/g, " ").trim(),
        ),
        savedNote: text(".dc-saved-note"),
      },
      foot: {
        note: text(".dc-foot-note"),
        actions: [...document.querySelectorAll(".dc-foot-actions button, .dc-foot-actions summary")].map(
          (node) => node.textContent.replace(/\s+/g, " ").trim(),
        ),
      },
      layout: {
        bodyBox: box(document.querySelector(".dc-body")),
        readerBox: box(document.querySelector(".dc-reader")),
        bodyScrollTop: document.querySelector(".dc-body")?.scrollTop ?? 0,
        bodyScrollHeight: document.querySelector(".dc-body")?.scrollHeight ?? 0,
        readerVisible: (() => {
          const body = document.querySelector(".dc-body");
          const reader = document.querySelector(".dc-reader");
          if (!body || !reader) return false;
          const bodyBox = body.getBoundingClientRect();
          const readerBox = reader.getBoundingClientRect();
          return readerBox.top < bodyBox.bottom && readerBox.bottom > bodyBox.top;
        })(),
      },
      saved: {
        count: document.querySelectorAll(".dc-saved-panel li").length,
        open: document.querySelector(".dc-saved")?.hasAttribute("open") ?? false,
        items: [...document.querySelectorAll(".dc-saved-panel li")].map((li) =>
          li.textContent.replace(/\s+/g, " ").trim(),
        ),
        titleColor: (() => {
          const title = document.querySelector(".dc-saved-panel li button span");
          return title ? getComputedStyle(title).color : null;
        })(),
        stored: (() => {
          try {
            return window.localStorage.getItem("hansa.dealer.saved.v1");
          } catch {
            return null;
          }
        })(),
      },
      status: dialog?.querySelector('[role="status"]')?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      focus: {
        tag: active?.tagName ?? null,
        className: active?.className ?? null,
        id: active?.id ?? null,
        insideDialog: Boolean(dialog && active && dialog.contains(active)),
      },
      scrollLock: {
        documentOverflow: document.documentElement.style.overflow,
        bodyChildren: document.body.children.length,
        inertChildren: [...document.body.children].filter((child) => child.hasAttribute("inert"))
          .length,
      },
      page: {
        title: document.title,
        url: location.href,
        triggerLabel:
          document.querySelector("#today .stage-primary-action")?.textContent?.trim() ?? "",
        triggerExpanded:
          document.querySelector("#today .stage-primary-action")?.getAttribute("aria-expanded") ??
          null,
        triggerControls:
          document.querySelector("#today .stage-primary-action")?.getAttribute("aria-controls") ??
          null,
        triggerHaspopup:
          document.querySelector("#today .stage-primary-action")?.getAttribute("aria-haspopup") ??
          null,
      },
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
    record("closed-1280-dark", await measure(page));
    await shot(page, "r4-stage-closed-dark-1280", "R4 stage before the dealer opens, dark, 1280");

    await openDealer(page);
    const opened = await measure(page);
    record("1280-dark", opened);
    await shot(page, "r4-modal-dark-1280", "R4 cinematic dealer, dark, 1280");
    await shotElement(page, ".dc-dialog", "r4-dialog-dark-1280", "R4 dialog: rail, hand, reader");
    await shotElement(page, ".dc-hand-wrap", "r4-hand-dark-1280", "R4 full hand with capability row");

    report.axe = await axe(page, "#dealer-cinematic");

    // Select the caveat card.
    await page.locator(".dc-card").nth(1).click();
    await page.waitForTimeout(220);
    const caveat = await measure(page);
    report.interactions.cardSelect = {
      title: caveat.reader.title,
      cardActive: caveat.reader.kicker,
      fields: caveat.reader.fields,
      status: caveat.status,
      url: caveat.page.url,
    };
    await shot(page, "r4-reader-caveat-dark-1280", "R4 reader showing the caveat card");

    // Select the evidence card: the quote and provenance are the point.
    await page.locator(".dc-card").nth(2).click();
    await page.waitForTimeout(220);
    const evidence = await measure(page);
    report.interactions.evidenceSelect = {
      title: evidence.reader.title,
      quote: evidence.reader.evidence,
      fields: evidence.reader.fields,
      actions: evidence.reader.actions,
    };
    await shot(page, "r4-reader-evidence-dark-1280", "R4 reader showing the evidence card");

    // Rail: switch to the previous day's edition without leaving the dealer.
    const railBefore = evidence.title;
    await page.locator(".dc-day:not([aria-disabled])").nth(1).click();
    await page.waitForTimeout(500);
    const switched = await measure(page);
    report.interactions.railSwitch = {
      before: railBefore,
      after: switched.title,
      kicker: switched.kicker,
      cards: switched.hand.cards,
      firstCardActive: switched.hand.cardsList[0]?.active ?? null,
      currentLabel: switched.rail.currentLabel,
      url: switched.page.url,
      dialogStillOpen: switched.dialogPresent,
      status: switched.status,
    };
    await shot(page, "r4-rail-switch-dark-1280", "R4 rail switching to the previous edition");

    // Save the active card, then open the in-dealer saved list.
    await page.getByRole("button", { name: "Save for later" }).click();
    await page.waitForTimeout(150);
    const savedOnce = await measure(page);
    await page.locator(".dc-saved summary").click();
    await page.waitForTimeout(180);
    const savedOpen = await measure(page);
    report.interactions.save = {
      actionAfter: savedOnce.reader.actions,
      noteAfter: savedOnce.reader.savedNote,
      stored: savedOpen.saved.stored,
      panelOpen: savedOpen.saved.open,
      panelCount: savedOpen.saved.count,
      panelItems: savedOpen.saved.items,
      footSaved: savedOpen.foot.actions,
    };
    await shot(page, "r4-saved-dark-1280", "R4 saved card and the in-dealer saved list");

    // Open the saved card: it is the same edition here, so the reader must move.
    await page.locator(".dc-saved-panel li button").first().click();
    await page.waitForTimeout(300);
    const fromSaved = await measure(page);
    report.interactions.openSaved = {
      readerTitle: fromSaved.reader.title,
      status: fromSaved.status,
      url: fromSaved.page.url,
      dialogOpen: fromSaved.dialogPresent,
    };

    // Next card cycles the hand.
    await page.getByRole("button", { name: "Next card" }).click();
    await page.waitForTimeout(200);
    const afterNext = await measure(page);
    report.interactions.nextCard = {
      before: fromSaved.reader.title,
      after: afterNext.reader.title,
      status: afterNext.status,
    };

    // Focus trap: Tab from the last control wraps to the first, Shift+Tab from
    // the first wraps to the last, and neither escapes the dialog.
    const focusables = await page.evaluate(() => {
      const dialog = document.getElementById("dealer-cinematic");
      const nodes = [
        ...dialog.querySelectorAll(
          'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((node) => node.offsetParent !== null || node === document.activeElement);
      return {
        count: nodes.length,
        first: nodes[0]?.textContent?.replace(/\s+/g, " ").trim().slice(0, 40) ?? "",
        last: nodes.at(-1)?.textContent?.replace(/\s+/g, " ").trim().slice(0, 40) ?? "",
      };
    });
    await page.evaluate(() => {
      const dialog = document.getElementById("dealer-cinematic");
      const nodes = [
        ...dialog.querySelectorAll(
          'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((node) => node.offsetParent !== null || node === document.activeElement);
      nodes.at(-1).focus();
    });
    await page.keyboard.press("Tab");
    await page.waitForTimeout(80);
    const wrapForward = await page.evaluate(() => {
      const dialog = document.getElementById("dealer-cinematic");
      const nodes = [
        ...dialog.querySelectorAll(
          'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((node) => node.offsetParent !== null || node === document.activeElement);
      return {
        index: nodes.indexOf(document.activeElement),
        insideDialog: dialog.contains(document.activeElement),
        label: document.activeElement?.textContent?.replace(/\s+/g, " ").trim().slice(0, 40),
      };
    });
    await page.evaluate(() => {
      const dialog = document.getElementById("dealer-cinematic");
      const nodes = [
        ...dialog.querySelectorAll(
          'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((node) => node.offsetParent !== null || node === document.activeElement);
      nodes[0].focus();
    });
    await page.keyboard.press("Shift+Tab");
    await page.waitForTimeout(80);
    const wrapBack = await page.evaluate(() => {
      const dialog = document.getElementById("dealer-cinematic");
      const nodes = [
        ...dialog.querySelectorAll(
          'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((node) => node.offsetParent !== null || node === document.activeElement);
      return {
        index: nodes.indexOf(document.activeElement),
        insideDialog: dialog.contains(document.activeElement),
        isLast: document.activeElement === nodes.at(-1),
        label: document.activeElement?.textContent?.replace(/\s+/g, " ").trim().slice(0, 40),
      };
    });
    report.interactions.focusTrap = { focusables, wrapForward, wrapBack };

    // Escape closes, restores focus to the trigger, the URL and the page scroll.
    await page.keyboard.press("Escape");
    await page.waitForTimeout(320);
    const closed = await measure(page);
    report.interactions.escape = {
      dialogPresent: closed.dialogPresent,
      overlayPresent: closed.overlayPresent,
      focusBackOnTrigger:
        closed.focus.tag === "BUTTON" && closed.focus.className === "stage-primary-action",
      focus: closed.focus,
      url: closed.page.url,
      documentOverflow: closed.scrollLock.documentOverflow,
      inertChildren: closed.scrollLock.inertChildren,
      triggerExpanded: closed.page.triggerExpanded,
      triggerLabel: closed.page.triggerLabel,
      horizontalOverflow: closed.horizontalOverflow,
    };
    await shot(page, "r4-closed-after-escape-dark-1280", "R4 stage after Escape: focus returned to the trigger");

    // Locate: open again and follow "Locate in the edition".
    await openDealer(page);
    await page.getByRole("button", { name: "Locate in the edition" }).click();
    await page.waitForTimeout(420);
    const located = await page.evaluate(() => {
      const heading = document.getElementById("stage-edition-title");
      return {
        dialogPresent: Boolean(document.getElementById("dealer-cinematic")),
        focusId: document.activeElement?.id ?? null,
        headingText: heading?.textContent?.replace(/\s+/g, " ").trim().slice(0, 80) ?? null,
        headingTop: heading ? Math.round(heading.getBoundingClientRect().top) : null,
        url: location.href,
      };
    });
    report.interactions.locate = located;
    await shot(page, "r4-locate-dark-1280", "R4 locate in the edition: closed, scrolled, heading focused");

    report.console.push(...errors);
    await context.close();
  }

  // ------------------------------------------------------- deep link, dark
  {
    const { page, context, errors } = await open({ url: DEEP_LINK });
    await page.waitForSelector("#dealer-cinematic", { state: "attached", timeout: 20_000 });
    await page.waitForTimeout(420);
    const deep = await measure(page);
    record("deeplink-dark-1280", deep);
    report.interactions.deepLink = {
      open: deep.dialogPresent,
      title: deep.title,
      kicker: deep.kicker,
      currentLabel: deep.rail.currentLabel,
      url: deep.page.url,
      selectedEdition: deep.hand.cards,
    };
    await shot(page, "r4-deeplink-dark-1280", "R4 shared deck opened by ?dealer=daily:2026-10-25");
    report.console.push(...errors);
    await context.close();
  }

  // ------------------------------------------------------------ 1280 light
  {
    const { page, context, errors } = await open({ dark: false });
    await openDealer(page);
    record("1280-light", await measure(page));
    await shot(page, "r4-modal-light-1280", "R4 cinematic dealer, light, 1280");
    await shotElement(page, ".dc-dialog", "r4-dialog-light-1280", "R4 dialog, light");
    report.console.push(...errors);
    await context.close();
  }

  // ------------------------------------------------------------ 1024 light
  {
    const { page, context, errors } = await open({ width: 1024, height: 900, dark: false });
    await openDealer(page);
    record("1024-light", await measure(page));
    await shot(page, "r4-modal-light-1024", "R4 cinematic dealer, light, 1024");
    report.console.push(...errors);
    await context.close();
  }

  // ------------------------------------------------------------- 390 light
  {
    const { page, context, errors } = await open({ width: 390, height: 844, dark: false });
    await openDealer(page);
    record("390-light", await measure(page));
    await shot(page, "r4-modal-light-390", "R4 cinematic dealer, light, 390 (full-screen sheet)");

    // Tapping a card below the fold brings the reader into view.
    await page.locator(".dc-card").nth(1).click();
    await page.waitForTimeout(900);
    const revealed = await measure(page);
    report.interactions.mobileReveal = {
      readerVisible: revealed.layout.readerVisible,
      bodyScrollTop: revealed.layout.bodyScrollTop,
      readerTop: revealed.layout.readerBox?.y ?? null,
      readerTitle: revealed.reader.title,
      viewportHeight: revealed.viewport.height,
    };
    await shot(page, "r4-reader-light-390", "R4 tapping a card brings the reader into view at 390");
    report.console.push(...errors);
    await context.close();
  }

  // ------------------------------------------------------------- 320 light
  {
    const { page, context, errors } = await open({ width: 320, height: 720, dark: false });
    await openDealer(page);
    record("320-light", await measure(page));
    await shot(page, "r4-modal-light-320", "R4 cinematic dealer, light, 320");
    report.console.push(...errors);
    await context.close();
  }

  // ------------------------------------------------- full motion, mid-deal
  {
    const { page, context, errors } = await open({ motion: true });
    await page.locator("#today .stage-primary-action").first().click();
    await page.waitForSelector("#dealer-cinematic", { state: "attached", timeout: 20_000 });
    await page.waitForTimeout(90);
    const dealing = await measure(page);
    report.interactions.dealMotion = {
      cards: dealing.hand.cardsList.map((card) => ({
        animationName: card.animationName,
        animationDelay: card.animationDelay,
        opacity: card.opacity,
      })),
    };
    await shot(page, "r4-deal-motion-dark-1280", "R4 deal entrance mid-flight, full motion");
    await page.waitForTimeout(900);
    const settled = await measure(page);
    report.interactions.dealMotion.settledOpacity = settled.hand.cardsList.map((card) => card.opacity);
    await shot(page, "r4-deal-settled-dark-1280", "R4 hand settled after the deal, full motion");
    report.console.push(...errors);
    await context.close();
  }

  // --------------------------------------------------- reduced motion proof
  {
    const { page, context } = await open();
    await openDealer(page);
    report.interactions.reducedMotion = await page.evaluate(() =>
      [...document.querySelectorAll(".dc-card")].map((card) => ({
        animationName: getComputedStyle(card).animationName,
        transitionDuration: getComputedStyle(card).transitionDuration,
      })),
    );
    await context.close();
  }

  report.shots = shots;
  report.note =
    "Single local run against the R4 review export (HANSA_ATLAS_REVIEW_PREVIEW=1, HANSA_NEIGHBOURHOOD_REVIEW=1, HANSA_TIMELINE_REVIEW=1, HANSA_DEALER_REVIEW=1) in Edge headless. Reduced motion except the one mid-deal pass. An axe pass is not a screen-reader pass, and a headless run is not touch hardware.";
  await writeFile(
    path.join(OUT, "r4-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
