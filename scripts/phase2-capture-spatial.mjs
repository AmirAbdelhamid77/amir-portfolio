// Phase 2 spatial narrative — visual capture and runtime probes.
//
// Drives the locally installed Microsoft Edge through playwright-core against
// the static export served by scripts/serve-out.mjs. Captures the three acts and
// their transitions at desktop, tablet and phone widths, in light and dark, and
// samples the page for console errors, layout overflow and animation/layout
// anomalies. Screenshots are evidence, not proof of performance.
//
//   node scripts/phase2-capture-spatial.mjs [--port 4391] [--quick]
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const PORT = Number(portIndex === -1 ? 4391 : args[portIndex + 1]);
const QUICK = args.includes("--quick");
const BASE = `http://127.0.0.1:${PORT}`;
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = path.resolve("docs/cinematic-spatial/evidence");

await mkdir(OUT, { recursive: true });

const server = spawn(process.execPath, ["scripts/serve-out.mjs", String(PORT)], {
  stdio: ["ignore", "pipe", "pipe"],
});
server.stdout.on("data", () => {});
server.stderr.on("data", () => {});

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE}/`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`static server never answered on :${PORT}`);
}

const report = { generatedAt: new Date().toISOString(), base: BASE, shots: [], probes: [] };
const browser = await chromium.launch({ executablePath: EDGE, headless: true });

async function open({ width, height, dark = true, reduced = false }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    colorScheme: dark ? "dark" : "light",
    reducedMotion: reduced ? "reduce" : "no-preference",
    hasTouch: width < 900,
    isMobile: width < 900,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 45_000 });
  await page.waitForTimeout(500);
  return { page, context, errors };
}

async function shot(page, name, note) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
  report.shots.push({ name, note });
}

// Scroll to a fraction of an element's *travel* (its scroll range). Acts are
// positioned by element, not by document percentage, so a page copy change does
// not silently point the camera at the wrong act.
async function travelTo(page, selector, fraction) {
  const ok = await page.evaluate(
    ([target, value]) => {
      const element = document.querySelector(target);
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      const travel = Math.max(0, rect.height - window.innerHeight);
      const top = window.scrollY + rect.top + travel * value;
      window.scrollTo({ top: Math.round(top), behavior: "instant" });
      return true;
    },
    [selector, fraction],
  );
  await page.waitForTimeout(460);
  return ok;
}

async function probe(page, label) {
  const data = await page.evaluate(() => {
    const canvas = document.querySelector("canvas.atlas-canvas");
    const sticky = document.querySelector(".cine-atlas-pin");
    return {
      scrollY: Math.round(window.scrollY),
      docHeight: document.documentElement.scrollHeight,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      hasCanvas: Boolean(canvas),
      canvasPixels: canvas ? `${canvas.width}x${canvas.height}` : null,
      stickyTop: sticky ? Math.round(sticky.getBoundingClientRect().top) : null,
      activeEdition: document.querySelector('[aria-current="date"]')?.textContent?.trim() ?? null,
      fieldNodes: document.querySelectorAll("#atlas-node-list li").length,
      headings: [...document.querySelectorAll("h1,h2")].slice(0, 8).map((node) => node.textContent.trim()),
    };
  });
  report.probes.push({ label, ...data });
  return data;
}

try {
  await waitForServer();

  const widths = QUICK
    ? [{ width: 1440, height: 900 }]
    : [
        { width: 1440, height: 900 },
        { width: 1280, height: 800 },
        { width: 768, height: 1024 },
        { width: 390, height: 844 },
      ];

  for (const { width, height } of widths) {
    const { page, context, errors } = await open({ width, height });
    const tag = `${width}`;

    await probe(page, `${tag} load`);
    await shot(page, `act1-hero-${tag}`, "Act I: hero card dealer at rest");

    // Deal the deck to show the supporting cards.
    const deal = page.getByRole("button", { name: /^Deal (\d+ more|three ideas)$/ }).first();
    if (await deal.count()) {
      await deal.click();
      await page.waitForTimeout(700);
      await shot(page, `act1-dealt-${tag}`, "Act I: deck dealt into the hand");
      const card = page.locator('[aria-label="Knowledge card tray"] button[aria-expanded]').first();
      if (await card.count()) {
        await card.click();
        await page.waitForTimeout(500);
        await shot(page, `act1-reader-${tag}`, "Act I: card reader open");
        const back = page.getByRole("button", { name: "Back to the hand" });
        if (await back.count()) await back.click();
      }
    }

    // Handoff band, middle of its travel.
    await travelTo(page, ".cine-handoff", 0.5);
    await shot(page, `handoff-${tag}`, "Handoff: the card becomes a field seed");

    // Atlas: opening camera, mid-dolly, final camera.
    await travelTo(page, ".cine-atlas", 0);
    await probe(page, `${tag} atlas opening`);
    await shot(page, `act2-atlas-open-${tag}`, "Act II: the field at the opening camera");
    await travelTo(page, ".cine-atlas", 0.38);
    await shot(page, `act2-atlas-mid-${tag}`, "Act II: camera pulled back through the field");
    await travelTo(page, ".cine-atlas", 0.92);
    await shot(page, `act2-atlas-far-${tag}`, "Act II: the whole field");

    // Node selection: pick from the list so the test is not pixel-dependent.
    const listToggle = page.getByRole("button", { name: "List the vertices" });
    if (await listToggle.count()) {
      await listToggle.click();
      const node = page.locator("#atlas-node-list button").nth(1);
      if (await node.count()) {
        await node.click();
        await page.waitForTimeout(300);
        await shot(page, `act2-select-${tag}`, "Act II: vertex selected through the accessible list");
      }
    }

    // The semantic coda, after the camera travel has finished.
    await page.evaluate(() => {
      const element = document.querySelector(".cine-atlas-coda");
      const top = element ? window.scrollY + element.getBoundingClientRect().top - 90 : 0;
      window.scrollTo({ top: Math.round(top), behavior: "instant" });
    });
    await page.waitForTimeout(600);
    await shot(page, `act2-coda-${tag}`, "Act II coda: semantic layer status, honestly empty");

    // Act III.
    await page.evaluate(() => {
      const element = document.querySelector("#today");
      const top = element ? window.scrollY + element.getBoundingClientRect().top - 96 : 0;
      window.scrollTo({ top: Math.round(top), behavior: "instant" });
    });
    await page.waitForTimeout(600);
    await probe(page, `${tag} act3`);
    await shot(page, `act3-content-${tag}`, "Act III: scenario and instrument");
    await page.evaluate(() => {
      const element = document.querySelector(".cine-time");
      const top = element ? window.scrollY + element.getBoundingClientRect().top - 120 : 0;
      window.scrollTo({ top: Math.round(top), behavior: "instant" });
    });
    await page.waitForTimeout(500);
    await shot(page, `act3-rail-${tag}`, "Act III: date rail");
    await page.evaluate(() => {
      const element = document.querySelector("#archive");
      const top = element ? window.scrollY + element.getBoundingClientRect().top : 0;
      window.scrollTo({ top: Math.round(top), behavior: "instant" });
    });
    await page.waitForTimeout(500);
    await shot(page, `act3-archive-${tag}`, "Act III: archive");

    report.probes.push({ label: `${tag} console`, errors });
    await context.close();
  }

  // Reduced motion pass.
  {
    const { page, context, errors } = await open({ width: 1280, height: 800, reduced: true });
    await shot(page, "reduced-hero-1280", "Reduced motion: Act I at rest");
    await travelTo(page, ".cine-atlas", 0.5);
    await shot(page, "reduced-atlas-1280", "Reduced motion: field is static but interactive");
    await page.evaluate(() => {
      const element = document.querySelector("#today");
      const top = element ? window.scrollY + element.getBoundingClientRect().top - 96 : 0;
      window.scrollTo({ top: Math.round(top), behavior: "instant" });
    });
    await page.waitForTimeout(500);
    await shot(page, "reduced-content-1280", "Reduced motion: Act III, all content visible");
    report.probes.push({ label: "reduced-motion console", errors });
    await context.close();
  }

  // Light theme sanity.
  {
    const { page, context, errors } = await open({ width: 1440, height: 900, dark: false });
    await shot(page, "light-hero-1440", "Light theme: Act I");
    await travelTo(page, ".cine-atlas", 0.5);
    await shot(page, "light-atlas-1440", "Light theme: Act II");
    report.probes.push({ label: "light console", errors });
    await context.close();
  }
} finally {
  await browser.close().catch(() => {});
  server.kill();
}

await writeFile(path.join(OUT, "capture.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ shots: report.shots.length, probes: report.probes }, null, 2));
