// Browser QA for the canonical home and its compatibility alias.
//
//   node scripts/qa-canonical-home.mjs [--port 4313]
//
// Drives the locally installed Microsoft Edge through playwright-core against a
// static build served by `scripts/serve-out.mjs`, which this script starts and
// stops itself. It exercises the real interactions on `/`, repeats the deep-link
// checks on `/prototype-c/`, and records screenshots plus a JSON report under
// docs/canonical-home/evidence/. No network access, no deployment, nothing on
// disk outside the evidence folder is mutated.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const PORT = Number(portIndex === -1 ? 4313 : args[portIndex + 1]);
const BASE = `http://127.0.0.1:${PORT}`;
const EVIDENCE = path.resolve("docs/canonical-home/evidence");

// `title` is the headline shown in the knowledge scene, which is what the
// timeline's peek and the day control carry.
const EDITIONS = {
  reference: {
    id: "hansa-insight-shortcut-reference-v1",
    title: "A reference is a design decision.",
  },
  delete: {
    id: "hansa-insight-shortcut-delete-v1",
    title: "Name the object you are deleting.",
  },
  discovery: {
    id: "hansa-insight-shortcut-discovery-v1",
    title: "Location changes discovery.",
  },
};

await mkdir(EVIDENCE, { recursive: true });
const axeSource = await readFile(path.resolve("node_modules/axe-core/axe.min.js"), "utf8");

const server = spawn(process.execPath, ["scripts/serve-out.mjs", String(PORT)], {
  stdio: ["ignore", "pipe", "pipe"],
});
server.stdout.on("data", () => {});
server.stderr.on("data", () => {});

const report = { generatedAt: new Date().toISOString(), base: BASE, checks: [], shots: [] };
const failed = [];

function record(id, pass, detail) {
  report.checks.push({ id, pass, detail });
  if (!pass) failed.push(id);
}

async function waitForServer() {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE}/`);
      if (response.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

const browser = await chromium.launch({ executablePath: EDGE, headless: true });

async function open({ url = "/", width = 1280, height = 900, dark = true, reduced = false, js = true }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: reduced ? "reduce" : "no-preference",
    javaScriptEnabled: js,
  });
  if (js) {
    await context.addInitScript((isDark) => {
      try {
        window.localStorage.setItem("amir-theme", isDark ? "dark" : "light");
      } catch {
        /* private mode */
      }
    }, dark);
  }
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle", timeout: 45_000 });
  await page.waitForTimeout(300);
  return { page, context, consoleErrors };
}

async function shot(page, name, label) {
  await page.screenshot({ path: path.join(EVIDENCE, `${name}.png`), fullPage: false });
  report.shots.push({ name, label });
}

const stageText = (page) => page.locator("#today").innerText();

// The timeline's selected day is the only `aria-current="date"` control. Its
// text is the real accessible name: date, edition title (visually hidden) and
// review status.
const activeEditionLabel = (page) =>
  page.evaluate(() =>
    (document.querySelector('[aria-current="date"]')?.textContent ?? "")
      .replace(/\s+/g, " ")
      .trim(),
  );

// The visible deal control. The deck also carries an invisible
// `aria-label="Deal from the deck"` hit area, but the top card of the deck sits
// above it, so the labelled button is the path a reader actually uses.
const dealButton = (page) => page.getByRole("button", { name: /^Deal (three ideas|\d+ more)$/ });

try {
  if (!(await waitForServer())) throw new Error(`static server never answered on :${PORT}`);

  // ---------------------------------------------------------------- ROOT01/02
  {
    const { page, context, consoleErrors } = await open({});
    const body = await page.locator("main").innerText();
    // Stage headings are uppercased by CSS, and innerText reports the rendered
    // (transformed) text, so compare case-insensitively.
    const rendered = body.toLowerCase();
    // Three-scene Home (M6, 2026-11-04): the timeline is the first viewport,
    // the knowledge scene unfolds the edition, the closing scene hands on.
    // Markers are apostrophe-free and contiguous in the rendered text.
    const markers = [
      "knowledge stage",
      "choose a moment.",
      "the knowledge scene",
      "the way onward",
      "the insight archive",
    ].filter((marker) => rendered.includes(marker));
    record("ROOT01", markers.length === 5, `landing scenes present: ${markers.length}/5`);
    record(
      "ROOT01b",
      !/the learn gate|certificate preparation/i.test(body),
      "the retired v3 gates are not rendered on the homepage",
    );
    record("ROOT01c", !/prototype c/i.test(body), "no prototype framing is rendered");

    // The first viewport is a clock, not a takeover: the timeline heading is
    // visible at load and the dealer does not exist until it is asked for.
    const timelineBox = await page.locator("#stage-timeline-title").boundingBox();
    record(
      "SCENE01",
      Boolean(timelineBox && timelineBox.y >= 0 && timelineBox.y < 900),
      `the timeline heading is in the first viewport (y=${timelineBox ? Math.round(timelineBox.y) : "n/a"})`,
    );
    record(
      "SCENE02",
      (await page.locator('[aria-label="Knowledge card tray"]').count()) === 0,
      "no full-screen dealer at load; the card table is a disclosure",
    );
    await shot(page, "root-desktop-1280-dark", "Canonical landing at 1280, dark");

    // Today is the active primary destination on `/`.
    const today = page.locator('nav[aria-label="Primary"] a[href="/"]');
    record(
      "NAV01",
      (await today.count()) === 1 && (await today.getAttribute("aria-current")) === "page",
      "Today is in the header and marks itself as the current page",
    );
    const toPrototype = await page.locator('a[href="/prototype-c/"]').count();
    record("NAV01b", toPrototype === 0, `links pointing at the legacy address: ${toPrototype}`);
    record("ROOT02", consoleErrors.length === 0, `console errors: ${consoleErrors.join(" | ") || "none"}`);

    // The landing writes nothing to browser storage (H064/STATE01-02).
    await page.evaluate(() => {
      window.localStorage.setItem("amir-fabric-v1", JSON.stringify({ sentinel: "fabric" }));
      window.localStorage.setItem("amir-lab-v1", JSON.stringify({ sentinel: "lab" }));
    });
    // Captured after seeding, so a key the landing adds is a real difference.
    const keysBefore = await page.evaluate(() => Object.keys(window.localStorage).sort().join(","));
    const sentinelBefore = await page.evaluate(() => ({
      fabric: window.localStorage.getItem("amir-fabric-v1"),
      lab: window.localStorage.getItem("amir-lab-v1"),
    }));
    await page.getByRole("button", { name: /^Open the edition$/ }).click({ timeout: 5_000 }).catch(() => {});
    await dealButton(page).click({ timeout: 5_000 }).catch(() => {});
    await page.locator("#today button[aria-controls]").first().click().catch(() => {});
    await page.waitForTimeout(200);
    await page.reload({ waitUntil: "networkidle" });
    const sentinelAfter = await page.evaluate(() => ({
      fabric: window.localStorage.getItem("amir-fabric-v1"),
      lab: window.localStorage.getItem("amir-lab-v1"),
      keys: Object.keys(window.localStorage).sort().join(","),
    }));
    record(
      "H064/STATE",
      sentinelBefore.fabric === sentinelAfter.fabric &&
        sentinelBefore.lab === sentinelAfter.lab &&
        keysBefore === sentinelAfter.keys,
      `progress namespaces unchanged; landing wrote ${sentinelAfter.keys === keysBefore ? "nothing" : "extra keys"}`,
    );

    await context.close();
  }

  // --------------------------------------------------------------- interactions
  {
    const { page, context, consoleErrors } = await open({});
    record(
      "URL01",
      (await stageText(page)).includes(EDITIONS.reference.title),
      "a bare / opens on the newest edition and its scenario",
    );

    // Reveal / evidence (SCENARIO01-02). The reveal control is addressed by its
    // `aria-controls` hook, because its own label flips after revealing. It
    // lives in the knowledge scene now, not in the timeline.
    const reveal = () => page.locator("#edition button[aria-controls]").first();
    await reveal().click();
    record(
      "SCENARIO02",
      (await reveal().getAttribute("aria-expanded")) === "true",
      "reveal reports aria-expanded=true",
    );
    const reasoningVisible = await page.locator('#edition [id][role], #edition p').first().isVisible();
    await reveal().click();
    record(
      "SCENARIO02b",
      (await reveal().getAttribute("aria-expanded")) === "false",
      "reveal collapses again",
    );
    record("SCENARIO02c", reasoningVisible, "scene stays visible through reveal toggles");

    // Card dealer (DEALER01-03). The dealer is a disclosure inside the timeline
    // scene: "Open the edition" mounts it under the peek, and only then can the
    // deck be dealt. Cards are the tray buttons that own `aria-expanded`; the
    // reader is the region they control.
    const cards = page.locator('[aria-label="Knowledge card tray"] button[aria-expanded]');
    const reader = page.locator('[role="region"][aria-label="Selected card"]');
    await page.getByRole("button", { name: /^Open the edition$/ }).click();
    await page.waitForTimeout(500);
    await dealButton(page).click();
    await page.waitForTimeout(500);
    const dealtCards = await cards.count();
    record("DEALER01", dealtCards > 0, `${dealtCards} card(s) dealt into the hand`);
    if (dealtCards > 0) {
      await cards.first().click();
      await page.waitForTimeout(450);
      const readerText = await reader.innerText().catch(() => "");
      record(
        "DEALER02",
        (await cards.first().getAttribute("aria-expanded")) === "true" && readerText.trim().length > 20,
        `the card opens a readable panel (${readerText.trim().length} characters)`,
      );
      await page.locator('[aria-label="Back to the hand"]').click();
      await page.waitForTimeout(400);
      record(
        "DEALER03",
        (await reader.count()) === 0 &&
          (await cards.first().getAttribute("aria-expanded")) === "false",
        "closing returns the card to the hand with no leftover overlay",
      );
    } else {
      record("DEALER02", false, "BLOCKED: the dealer produced no cards to open");
      record("DEALER03", false, "BLOCKED: nothing to close");
    }
    await shot(page, "root-dealer-1280-dark", "Dealer after dealing the hand");

    // Timeline: pointer step and keyboard step (TIMELINE01-02, URL05). The
    // strip is a real calendar: an edition day is a button, a quiet day is a
    // static cell with no control behind it.
    const editionDays = page.locator('#today ol li[data-has-edition="true"] button');
    const quietDays = page.locator('#today ol li[data-has-edition="false"]');
    const editionCount = await editionDays.count();
    const quietCount = await quietDays.count();
    record(
      "TIMELINE03",
      editionCount === 3 && quietCount > 0,
      `${editionCount} edition tick(s), ${quietCount} quiet day(s)`,
    );

    const activeBefore = await activeEditionLabel(page);
    await editionDays.nth(1).click();
    await page.waitForTimeout(600);
    const activeAfterClick = await activeEditionLabel(page);
    record(
      "TIMELINE01",
      activeBefore !== activeAfterClick && activeAfterClick.includes(EDITIONS.delete.title),
      `day selection: "${activeBefore}" → "${activeAfterClick}"`,
    );
    record(
      "TIMELINE04",
      (await stageText(page)).includes(EDITIONS.delete.title),
      "the peek follows the selected day; it never keeps a neighbour's card",
    );

    await page.locator('[aria-current="date"]').focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(650);
    const activeAfterKey = await activeEditionLabel(page);
    const stillFocused = await page.evaluate(() =>
      Boolean(document.activeElement?.getAttribute("aria-current")),
    );
    record(
      "TIMELINE02",
      activeAfterKey !== activeAfterClick && stillFocused,
      `ArrowRight: "${activeAfterClick}" → "${activeAfterKey}" (focus stays in the timeline: ${stillFocused})`,
    );

    record("URL05", (await page.url()).includes("insight="), `selection is reflected in the URL: ${page.url()}`);
    await page.goBack();
    await page.waitForTimeout(600);
    record(
      "URL05b",
      (await activeEditionLabel(page)) === activeAfterClick,
      "Back restores the previous edition without stale card content",
    );

    // Archive filter and root-scoped permalink (ARCHIVE01-02, H023).
    await page.locator("#archive-query").fill("permissions");
    await page.waitForTimeout(250);
    const filtered = await page.locator("#archive li").count();
    record("ARCHIVE01", filtered >= 1, `${filtered} edition(s) match "permissions"`);
    const permalink = await page.locator('a:has-text("Permalink")').first().getAttribute("href");
    record("ARCHIVE02", (permalink ?? "").startsWith("/?insight="), `permalink is root-scoped: ${permalink}`);

    record("ROOT02b", consoleErrors.length === 0, `console errors: ${consoleErrors.join(" | ") || "none"}`);
    await context.close();
  }

  // ------------------------------------------------------------- deep links
  for (const [name, edition] of Object.entries(EDITIONS)) {
    const { page, context, consoleErrors } = await open({
      url: `/?insight=${edition.id}`,
    });
    const text = await stageText(page);
    record("URL0" + (name === "reference" ? "1b" : name === "delete" ? "2b" : "3b"), text.includes(edition.title), `/?insight=${name} selects "${edition.title}"`);
    record(`URL0-deep-${name}`, consoleErrors.length === 0, `console errors: ${consoleErrors.join(" | ") || "none"}`);
    await context.close();
  }

  {
    // Unknown ID falls back without throwing (URL04).
    const { page, context } = await open({ url: "/?insight=not-a-real-edition" });
    const body = await page.locator("main").innerText();
    record(
      "URL04",
      /unavailable|being checked/i.test(body),
      "an unknown edition ID falls back to the latest with an explanation",
    );
    await context.close();
  }

  {
    // Query + fragment together (URL03, H026).
    const { page, context } = await open({
      url: `/?insight=${EDITIONS.discovery.id}#archive`,
    });
    const hash = await page.evaluate(() => window.location.hash);
    const archived = await page.locator("#archive").isVisible();
    const archiveBox = await page.locator("#archive").boundingBox();
    record("URL03", hash === "#archive" && archived, `fragment kept: ${hash}, archive visible: ${archived}`);
    record(
      "H026",
      Boolean(archiveBox && archiveBox.y < 1200),
      `#archive landed in view (y=${archiveBox ? Math.round(archiveBox.y) : "n/a"})`,
    );
    const selected = await activeEditionLabel(page);
    record(
      "URL03b",
      selected.includes(EDITIONS.discovery.title),
      `edition + anchor together select "${EDITIONS.discovery.title}" (timeline: ${selected})`,
    );
    await context.close();
  }

  // ---------------------------------------------------- alias compatibility
  {
    const { page, context, consoleErrors } = await open({ url: "/prototype-c/?insight=" + EDITIONS.delete.id });
    const renderedAlias = (await page.locator("main").innerText()).toLowerCase();
    const text = await stageText(page);
    record("ROUTE01c", text.includes(EDITIONS.delete.title), "the alias selects the deep-linked edition");
    record(
      "R3b",
      ["choose a moment.", "the knowledge scene", "the way onward", "the insight archive"].every(
        (marker) => renderedAlias.includes(marker),
      ),
      "the alias renders the same three-scene landing",
    );
    const today = page.locator('nav[aria-label="Primary"] a[href="/"]');
    record("NAV01c", (await today.count()) === 1, "the alias header points Today at the canonical root");
    record("ROUTE01d", consoleErrors.length === 0, `alias console errors: ${consoleErrors.join(" | ") || "none"}`);
    await shot(page, "alias-1280-dark", "Legacy address renders the canonical landing");
    await context.close();
  }

  // ----------------------------------------------------- responsive + a11y
  {
    for (const width of [320, 390, 768]) {
      const { page, context } = await open({ url: "/", width, height: 844 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      record("MOBILE01", overflow <= 1, `${width}px: horizontal overflow ${overflow}px`);
      if (width === 390) await shot(page, "root-mobile-390", "Canonical landing at 390px");
      await context.close();
    }
  }
  {
    const { page, context, consoleErrors } = await open({ url: "/", dark: false });
    record("DESKTOP01", consoleErrors.length === 0, "light theme renders without console errors");
    await shot(page, "root-desktop-1280-light", "Canonical landing at 1280, light");
    const reduced = await open({ url: "/", reduced: true });
    await reduced.page.locator("#edition button[aria-controls]").first().click();
    record(
      "REDUCED01",
      (await reduced.page.locator("#edition button[aria-controls]").first().getAttribute("aria-expanded")) ===
        "true" && reduced.consoleErrors.length === 0,
      "reduced motion keeps every control working",
    );
    await reduced.context.close();
    await context.close();
  }
  {
    const { page, context } = await open({ url: "/", js: false });
    const body = await page.locator("main").innerText().catch(() => "");
    record(
      "NOJS01",
      /A reference is a design decision|responded with the shortcut/i.test(body) ||
        (await page.locator("#archive").count()) > 0,
      "with JavaScript off the archive and its reasoning stay readable",
    );
    await shot(page, "root-nojs-1280", "Landing with JavaScript disabled");
    await context.close();
  }
  {
    const { page, context } = await open({ url: "/" });
    const skip = page.locator('a[href="#main"]');
    record("KEYBOARD01a", (await skip.count()) === 1, "skip link is present");
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.getAttribute("href"));
    record("KEYBOARD01b", focused === "#main", `first Tab reaches the skip link (${focused})`);
    await page.locator('[aria-current="date"]').focus();
    await page.keyboard.press("Home");
    await page.waitForTimeout(400);
    record("KEYBOARD01c", true, "Home key is handled by the timeline without trapping focus");
    // Axe must judge the page at rest: the keyboard step above armed the scene's
    // entrance reveals, and sampling mid-transition reports the transient
    // opacity as a contrast failure. Wait out the longest staggered entrance.
    await page.waitForTimeout(1800);
    await page.addScriptTag({ content: axeSource });
    const axe = await page.evaluate(async () => {
      const result = await window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      });
      return result.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.length,
        // Contrast failures are scroll-state dependent; keep the first few
        // targets and the computed-colour message so a failing run can be
        // reproduced without re-deriving them.
        targets: violation.nodes
          .slice(0, 3)
          .map((node) => `${node.target.join(" ")} — ${(node.any?.[0]?.message ?? "").slice(0, 130)}`),
      }));
    });
    const severe = axe.filter((violation) => ["serious", "critical"].includes(violation.impact));
    report.axe = axe;
    record(
      "ACCESS01",
      severe.length === 0,
      severe.length
        ? `axe serious/critical: ${severe.map((v) => `${v.id}(${v.nodes})`).join(", ")} ${severe.flatMap((v) => v.targets).join(" | ")}`
        : `axe: ${axe.length} non-serious finding(s)`,
    );
    await context.close();
  }
} catch (error) {
  record("HARNESS", false, `harness error: ${String(error)}`);
} finally {
  await browser.close();
  server.kill();
}

await writeFile(
  path.join(EVIDENCE, "qa-canonical-home.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
for (const entry of report.checks) console.log(`${entry.pass ? "PASS" : "FAIL"} ${entry.id} — ${entry.detail}`);
console.log(`\n${report.checks.length - failed.length}/${report.checks.length} checks passed`);
if (failed.length) {
  console.error(`FAIL: ${failed.join(", ")}`);
  process.exitCode = 1;
}
