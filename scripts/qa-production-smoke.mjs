// Production smoke test for the deployed static export.
//
//   node scripts/qa-production-smoke.mjs [--url https://hansa.amir-portfolio.workers.dev]
//
// Unlike `qa-canonical-home.mjs` and `phase2-spatial-qa.mjs` this drives the real
// Cloudflare deployment over the network: real compression, real caching, real
// 404 handling. It is deliberately short — it proves the deployed bytes are the
// reviewed build and still behave, not that the site is fully audited.
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const args = process.argv.slice(2);
const urlIndex = args.indexOf("--url");
const BASE = urlIndex === -1 ? "https://hansa.amir-portfolio.workers.dev" : args[urlIndex + 1];

const checks = [];
function record(id, pass, detail) {
  checks.push({ id, status: pass ? "PASS" : "FAIL", detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${id} — ${detail}`);
}

const browser = await chromium.launch({ executablePath: EDGE, headless: true });

async function open({ width = 1440, height = 900, path = "/" } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    hasTouch: width < 900,
    isMobile: width < 900,
  });
  await context.addInitScript(() => {
    try {
      localStorage.setItem("amir-theme", "dark");
    } catch {}
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  const response = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(600);
  return { page, context, errors, response };
}

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

async function scrollTo(page, selector) {
  await page.evaluate((target) => {
    const element = document.querySelector(target);
    const top = element ? window.scrollY + element.getBoundingClientRect().top : 0;
    window.scrollTo({ top: Math.round(top), behavior: "instant" });
  }, selector);
  await page.waitForTimeout(450);
}

try {
  const { page, context, errors, response } = await open();
  const headers = response?.headers() ?? {};

  record("STATUS", response?.status() === 200, `document responded ${response?.status()}`);
  // Cloudflare negotiates br/zstd for modern clients; any of the three means the
  // HTML is compressed on the wire.
  record(
    "COMPRESSION",
    /gzip|br|zstd/.test(headers["content-encoding"] ?? ""),
    `document encoding: ${headers["content-encoding"] ?? "none"}`,
  );

  const text = await page.locator("main").innerText();
  record(
    "HERO",
    text.includes("One idea.") && text.includes("The hand behind the claim"),
    "the card dealer hero is the first act",
  );

  await scrollTo(page, ".cine-atlas");
  const ink = await canvasInk(page);
  record("CANVAS", ink > 20, `deployed canvas painted ${ink} sampled pixels`);
  // The Atlas paints "semantic relations · awaiting human publication review"
  // inside the canvas, so it cannot be read as DOM text. The honest contract is
  // checked in two places that are real text: the field's own `data-pending`
  // flag, and the coda that follows the travel.
  const pendingFlag = await page.locator(".atlas-field").getAttribute("data-pending");
  // `innerText` returns rendered text, so the mono eyebrow is upper-cased by CSS.
  const coda = (await page.locator(".cine-atlas-coda").innerText()).toLowerCase();
  record(
    "PENDING-LABEL",
    pendingFlag === "true" &&
      coda.includes("semantic layer · review status") &&
      (coda.includes("reviewed connections are not published yet") ||
        coda.includes("await review")),
    `data-pending=${pendingFlag}; coda states its review status as text`,
  );

  const box = await page.locator(".atlas-field-canvas").boundingBox();
  const before = await page.evaluate(() => Math.round(window.scrollY));
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 420);
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => Math.round(window.scrollY));
  record("WHEEL", after > before + 100, `wheel over the field scrolled the page ${after - before}px`);

  await page.getByRole("button", { name: "List the vertices" }).click();
  await page.waitForTimeout(200);
  const nodes = await page.locator("#atlas-node-list button").count();
  await page.locator("#atlas-node-list button").nth(1).click();
  await page.waitForTimeout(400);
  record(
    "LIST-SELECT",
    nodes === 7 && page.url().includes("insight="),
    `${nodes} vertices listed; selecting one wrote ${new URL(page.url()).search}`,
  );

  await scrollTo(page, "#archive");
  const archive = await page.locator("#archive").innerText();
  record(
    "ARCHIVE",
    archive.includes("A reference is a design decision."),
    "all three editions are still reachable at the end of the page",
  );
  record("CONSOLE", errors.length === 0, errors.join(" | ") || "no console or page errors");
  await context.close();

  // Mobile reflow on the real deployment.
  {
    const mobile = await open({ width: 390, height: 844 });
    const overflow = await mobile.page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    record("MOBILE", overflow <= 1, `390px overflow: ${overflow}px`);
    await scrollTo(mobile.page, ".cine-atlas");
    const mobileInk = await canvasInk(mobile.page);
    record("MOBILE-CANVAS", mobileInk > 20, `mobile canvas painted ${mobileInk} sampled pixels`);
    record("MOBILE-CONSOLE", mobile.errors.length === 0, mobile.errors.join(" | ") || "no errors");
    await mobile.context.close();
  }

  // The compatibility alias and the 404 document.
  {
    const alias = await open({ path: "/prototype-c/" });
    const aliasText = await alias.page.locator("main").innerText();
    record(
      "ALIAS",
      aliasText.includes("One idea.") && aliasText.includes("An idea becomes"),
      "/prototype-c/ serves the same three-act landing",
    );
    await alias.context.close();
  }
  {
    const missing = await open({ path: "/this-route-does-not-exist/" });
    record("404", missing.response?.status() === 404, "unknown routes return the exported 404 page");
    await missing.context.close();
  }
} catch (error) {
  record("HARNESS", false, error.stack ?? String(error));
} finally {
  await browser.close();
}

const failed = checks.filter((check) => check.status === "FAIL");
console.log(`\n${checks.length - failed.length}/${checks.length} production checks passed against ${BASE}`);
if (failed.length) process.exitCode = 1;
