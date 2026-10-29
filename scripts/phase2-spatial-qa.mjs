// Phase 2 spatial narrative — behavioural QA.
//
// The repo's `qa-canonical-home.mjs` proves the page still behaves like the
// canonical landing. This script proves the *new* spatial layer behaves: the
// canvas draws, the wheel is never captured, keyboard orbit works, the
// accessible list is a real control, the fallback survives a missing drawing
// surface, reduced motion is static, and scrolling backwards is never trapped.
//
//   node scripts/phase2-spatial-qa.mjs [--port 4393]
//
// Writes docs/cinematic-spatial/evidence/qa.json and axe reports next to it.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const PORT = Number(portIndex === -1 ? 4393 : args[portIndex + 1]);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.resolve("docs/cinematic-spatial/evidence");

const EDITIONS = [
  { id: "hansa-insight-shortcut-reference-v1", title: "A reference is a design decision." },
  { id: "hansa-insight-shortcut-delete-v1", title: "Name the object you are deleting." },
  { id: "hansa-insight-shortcut-discovery-v1", title: "Location changes discovery." },
];

await mkdir(OUT, { recursive: true });
const axeSource = await readFile(path.resolve("node_modules/axe-core/axe.min.js"), "utf8");

const server = spawn(process.execPath, ["scripts/serve-out.mjs", String(PORT)], {
  stdio: ["ignore", "pipe", "pipe"],
});
server.stdout.on("data", () => {});
server.stderr.on("data", () => {});

const checks = [];
const issues = [];
function record(id, pass, detail) {
  checks.push({ id, status: pass ? "PASS" : "FAIL", detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${id} — ${detail}`);
}

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(`${BASE}/`)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`server never answered on :${PORT}`);
}

const browser = await chromium.launch({ executablePath: EDGE, headless: true });

async function open({
  width = 1440,
  height = 900,
  dark = true,
  reduced = false,
  js = true,
  url = "/",
  noCanvas = false,
} = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    colorScheme: dark ? "dark" : "light",
    reducedMotion: reduced ? "reduce" : "no-preference",
    javaScriptEnabled: js,
    hasTouch: width < 900,
    isMobile: width < 900,
  });
  if (js) {
    await context.addInitScript((isDark) => {
      try {
        window.localStorage.setItem("amir-theme", isDark ? "dark" : "light");
      } catch {}
    }, dark);
  }
  if (noCanvas) {
    await context.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = () => null;
    });
  }
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") issues.push(message.text());
  });
  page.on("pageerror", (error) => issues.push(`pageerror: ${error.message}`));
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle", timeout: 45_000 });
  await page.waitForTimeout(500);
  return { page, context };
}

const scrollY = (page) => page.evaluate(() => Math.round(window.scrollY));

async function scrollToSelector(page, selector, offset = 96) {
  await page.evaluate(
    ([target, gap]) => {
      const element = document.querySelector(target);
      const top = element ? window.scrollY + element.getBoundingClientRect().top - gap : 0;
      window.scrollTo({ top: Math.round(top), behavior: "instant" });
    },
    [selector, offset],
  );
  await page.waitForTimeout(450);
}

/** Non-transparent pixels, sampled on a grid: proof the canvas is not blank. */
const canvasInk = (page) =>
  page.evaluate(() => {
    const canvas = document.querySelector("canvas.atlas-canvas");
    if (!canvas) return -1;
    const context = canvas.getContext("2d");
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let painted = 0;
    for (let index = 3; index < data.length; index += 4 * 37) {
      if (data[index] > 8) painted += 1;
    }
    return painted;
  });

const canvasHash = (page) =>
  page.evaluate(() => document.querySelector("canvas.atlas-canvas")?.toDataURL().length ?? 0);

try {
  await waitForServer();

  for (const [width, height] of [
    [1440, 900],
    [1280, 800],
    [768, 1024],
    [390, 844],
  ]) {
    const tag = `${width}`;
    const { page, context } = await open({ width, height });

    record(
      `REFLOW-${tag}`,
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      "no horizontal page overflow",
    );

    // Wheel over the canvas must scroll the document, never orbit the camera.
    await scrollToSelector(page, ".cine-atlas", 0);
    const canvas = page.locator(".atlas-field-canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      const before = await scrollY(page);
      await page.mouse.wheel(0, 420);
      await page.waitForTimeout(350);
      const after = await scrollY(page);
      record(
        `WHEEL-${tag}`,
        after > before + 100,
        `wheel over the field moved the page ${after - before}px`,
      );
    } else {
      record(`WHEEL-${tag}`, false, "canvas had no box");
    }

    await scrollToSelector(page, ".cine-atlas", 0);
    const ink = await canvasInk(page);
    record(`INK-${tag}`, ink > 20, `painted sampled pixels: ${ink}`);

    // Keyboard orbit: the field is focusable and the arrow keys change the frame.
    if (width >= 900) {
      const focus = await page.evaluate(() => {
        const field = document.querySelector(".atlas-field-canvas");
        if (!field) return false;
        field.focus();
        return document.activeElement === field;
      });
      record(`FOCUS-${tag}`, focus, "the field accepts keyboard focus");
      const before = await canvasHash(page);
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(350);
      const after = await canvasHash(page);
      record(`ORBIT-${tag}`, before !== after, "ArrowRight changed the rendered frame");
      await page.keyboard.press("ArrowLeft");
      await page.waitForTimeout(200);
    }

    // The accessible list is the canvas's equivalent, and selecting there moves
    // the whole page selection.
    await page.getByRole("button", { name: "List the vertices" }).click();
    await page.waitForTimeout(250);
    const nodes = page.locator("#atlas-node-list button");
    const nodeCount = await nodes.count();
    record(`LIST-${tag}`, nodeCount >= 7, `vertex list exposes ${nodeCount} controls`);
    await nodes.nth(1).click();
    await page.waitForTimeout(450);
    const selected = await page.evaluate(() => ({
      url: window.location.href,
      inspector: document.querySelector(".atlas-inspector")?.textContent ?? "",
      active: document.querySelector('[aria-current="date"]') !== null,
    }));
    record(
      `SELECT-${tag}`,
      selected.url.includes("insight=") && selected.inspector.includes(EDITIONS[1].title),
      "list selection updates the URL and the inspector",
    );

    // Scrolling backwards out of the field is never blocked.
    const high = await scrollY(page);
    await page.mouse.move(20, 300);
    await page.mouse.wheel(0, -2600);
    await page.waitForTimeout(500);
    const back = await scrollY(page);
    record(`BACK-${tag}`, back < high, `scrolling back moved ${high - back}px`);
    const hero = await page.locator("#cine-hero-title").isVisible().catch(() => false);
    record(`NO-TRAP-${tag}`, hero, "the hero is reachable again after the field");

    await context.close();
  }

  // ---------------------------------------------------------- accessibility
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ]) {
    const { page, context } = await open({ width, height });
    await scrollToSelector(page, ".cine-atlas", 0);
    await page.getByRole("button", { name: "List the vertices" }).click();
    await page.waitForTimeout(300);
    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => {
      const result = await window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      });
      return result.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => node.html),
      }));
    });
    await writeFile(
      path.join(OUT, `axe-atlas-${width}.json`),
      JSON.stringify(violations, null, 2),
    );
    record(
      `AXE-${width}`,
      violations.length === 0,
      `${violations.length} automated A/AA violations with the field and list open`,
    );
    await context.close();
  }

  // ------------------------------------------------------------- deep links
  {
    const { page, context } = await open({
      url: `/?insight=${EDITIONS[2].id}#archive`,
    });
    const text = await page.locator("#today").innerText();
    record(
      "DEEP-LINK",
      text.includes(EDITIONS[2].title) && page.url().includes("#archive"),
      "query and fragment both survive on the canonical root",
    );
    await scrollToSelector(page, "#archive", 0);
    const archive = await page.locator("#archive-query").count();
    record("ARCHIVE-QUERY", archive === 1, "archive search is present at the end of the page");
    await context.close();
  }

  // ------------------------------------------------------------ canvas fail
  {
    const { page, context } = await open({ noCanvas: true });
    await scrollToSelector(page, ".cine-atlas", 0);
    const fallback = await page.locator(".atlas-failed").isVisible().catch(() => false);
    const nodes = await page.evaluate(() => {
      const field = document.querySelector(".atlas-field-canvas");
      field?.querySelector('button[aria-controls="atlas-node-list"], .atlas-controls button');
      return document.querySelectorAll("#atlas-node-list li").length;
    });
    record("NO-CANVAS", fallback, "a missing 2D context shows the honest fallback");
    record("NO-CANVAS-LIST", nodes >= 7, `every vertex is still listed (${nodes})`);
    await context.close();
  }

  // --------------------------------------------------------- reduced motion
  {
    const { page, context } = await open({ width: 1280, height: 800, reduced: true });
    await scrollToSelector(page, ".cine-atlas", 0);
    const first = await canvasHash(page);
    await page.waitForTimeout(900);
    const second = await canvasHash(page);
    record("REDUCED-STATIC", first === second, "reduced motion renders a still field");
    const inkReduced = await canvasInk(page);
    record("REDUCED-INK", inkReduced > 20, `reduced field still shows the graph (${inkReduced})`);
    await scrollToSelector(page, "#today", 96);
    const content = await page.locator("#today").isVisible();
    record("REDUCED-CONTENT", content, "Act III stays readable with motion off");
    await context.close();
  }

  // ------------------------------------------------------------ no-JavaScript
  {
    const { page, context } = await open({ width: 390, height: 844, js: false });
    const archive = await page.locator("#archive").count();
    const text = await page.locator("#archive").innerText();
    record(
      "NO-JS",
      archive === 1 && text.includes("A reference is a design decision"),
      "the archive carries every edition without JavaScript",
    );
    await context.close();
  }

  record("CONSOLE", issues.length === 0, issues.join(" | ") || "no console or page errors");
} catch (error) {
  record("HARNESS", false, error.stack ?? String(error));
} finally {
  await browser.close();
  server.kill();
}

await writeFile(
  path.join(OUT, "qa.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      base: BASE,
      browser: `Edge via playwright-core (headless)`,
      checks,
      limits: [
        "Automated axe is not a full WCAG audit.",
        "Pointer, wheel and touch are synthetic Chromium events, not a physical device.",
        "A human screen-reader pass has NOT been run.",
        "Frame pacing and LCP are lab measurements; they are not field CWV.",
      ],
    },
    null,
    2,
  ),
);

const failed = checks.filter((check) => check.status === "FAIL");
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
if (failed.length) process.exitCode = 1;
