// Live smoke test for the split-Worker release.
//
//   node scripts/qa-live-split.mjs [--base https://hansa.amir-portfolio.workers.dev]
//     [--out docs/cleanup-20261108/qa/live-split-qa.json]
//
// Drives the deployed pair over the network: the docs article, the flat RSC
// alias the client router requests, client navigation inside the docs Worker,
// a navigation across the docs/main boundary, search typing and the legacy
// alias redirect. This complements qa-production-smoke.mjs, which checks the
// home page, canvas and 404 document.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};
const BASE = option("--base", "https://hansa.amir-portfolio.workers.dev");
const OUT = resolve(option("--out", "docs/cleanup-20261108/qa/live-split-qa.json"));
const ARTICLE = "/learn/fabric/docs/admin/admin-overview/";
const RSC_ALIAS =
  "/learn/fabric/docs/admin/admin-overview/__next.learn.fabric.docs.$d$family.$c$article.__PAGE__.txt";

const checks = [];
const record = (id, pass, detail) => {
  checks.push({ id, status: pass ? "PASS" : "FAIL", detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${id} — ${detail}`);
};

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const consoleErrors = [];
const badResponses = [];
const failedRequests = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));
page.on("response", (response) => {
  if (response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() });
});
page.on("requestfailed", (request) =>
  failedRequests.push(`${request.url()} ${request.failure()?.errorText ?? ""}`),
);

try {
  const articleResponse = await page.goto(`${BASE}${ARTICLE}`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await page.waitForTimeout(400);
  const articleTitle = await page.title();
  const articleH1 = (await page.locator("main h1").first().textContent()) ?? "";
  record(
    "ARTICLE",
    articleResponse?.status() === 200 && articleH1.includes("Microsoft Fabric administration"),
    `${articleResponse?.status()} title="${articleTitle}" h1="${articleH1.trim()}"`,
  );

  const aliasResponse = await page.request.get(`${BASE}${RSC_ALIAS}`);
  const aliasBody = await aliasResponse.text();
  record(
    "RSC-FLAT-ALIAS",
    aliasResponse.status() === 200 && aliasBody.length > 30_000,
    `${aliasResponse.status()} bytes=${aliasBody.length}`,
  );

  // The client router must navigate inside docs without a full reload.
  await page.evaluate(() => {
    window.__hansaClientNavMarker = "kept";
  });
  badResponses.length = 0;
  failedRequests.length = 0;
  const startPath = new URL(page.url()).pathname;
  const nextLink = page.locator('main article a[href^="/learn/fabric/docs/"]').first();
  const nextHref = await nextLink.getAttribute("href");
  await Promise.all([
    page.waitForURL((url) => url.pathname !== startPath, { timeout: 30_000 }),
    nextLink.click(),
  ]);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  const marker = await page.evaluate(() => window.__hansaClientNavMarker);
  const navH1 = (await page.locator("main h1").first().textContent()) ?? "";
  record(
    "DOCS-CLIENT-NAV",
    marker === "kept" && new URL(page.url()).pathname !== startPath && navH1.trim().length > 0,
    `href=${nextHref} final=${new URL(page.url()).pathname} marker=${marker} h1="${navH1.trim()}"`,
  );
  record(
    "DOCS-NAV-RESOURCES",
    badResponses.length === 0 && failedRequests.length === 0,
    `http>=400=${badResponses.length} failed=${failedRequests.length}${badResponses[0] ? ` first=${badResponses[0].status} ${badResponses[0].url}` : ""}`,
  );

  // Cross the docs/main Worker boundary: docs -> home.
  await page.goto(`${BASE}${ARTICLE}`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.evaluate(() => {
    window.__hansaBoundaryMarker = "kept";
  });
  badResponses.length = 0;
  failedRequests.length = 0;
  const homeLink = page.locator('header a[href="/"], nav a[href="/"]').first();
  if ((await homeLink.count()) === 0) {
    record("BOUNDARY-CLIENT-NAV", false, "no home link in header/nav");
  } else {
    await Promise.all([
      page.waitForURL((url) => url.pathname === "/", { timeout: 30_000 }),
      homeLink.click(),
    ]);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    const boundaryMarker = await page.evaluate(() => window.__hansaBoundaryMarker);
    record(
      "BOUNDARY-CLIENT-NAV",
      boundaryMarker === "kept" && new URL(page.url()).pathname === "/",
      `final=${new URL(page.url()).pathname} marker=${boundaryMarker}`,
    );
    record(
      "BOUNDARY-RESOURCES",
      badResponses.length === 0 && failedRequests.length === 0,
      `http>=400=${badResponses.length} failed=${failedRequests.length}${badResponses[0] ? ` first=${badResponses[0].status} ${badResponses[0].url}` : ""}`,
    );
  }

  // Search interaction on the deployed split release.
  await page.goto(`${BASE}/search/`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(400);
  const input = page.getByLabel("Search the curriculum");
  await input.fill("p-value");
  await page.waitForTimeout(500);
  const value = await input.inputValue();
  const count = (await page.locator('[aria-live="polite"]').first().textContent()) ?? "";
  const firstHref = await page.locator("main ul li a").first().getAttribute("href");
  record(
    "SEARCH",
    value === "p-value" &&
      page.url().includes("q=p-value") &&
      /9 results/.test(count) &&
      (firstHref ?? "").includes("/learn/statistics"),
    `value="${value}" url=${page.url()} count="${count.trim()}" first=${firstHref}`,
  );

  // The compatibility alias still redirects to the canonical article.
  const aliasPage = await context.newPage();
  const aliasPageResponse = await aliasPage.goto(
    `${BASE}/fabric-aliases/admin/admin-center.html`,
    { waitUntil: "networkidle", timeout: 60_000 },
  );
  const aliasFinal = new URL(aliasPage.url()).pathname;
  const aliasTitle = await aliasPage.title();
  record(
    "REDIRECT-ALIAS",
    aliasPageResponse?.status() === 200 && aliasFinal === ARTICLE,
    `${aliasPageResponse?.status()} final=${aliasFinal} title="${aliasTitle}"`,
  );
  await aliasPage.close();

  // Mobile reflow on the two routes the release touched.
  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(`${BASE}${ARTICLE}`, { waitUntil: "networkidle", timeout: 60_000 });
  const articleOverflow = await mobile.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  await mobile.goto(`${BASE}/search/`, { waitUntil: "networkidle", timeout: 60_000 });
  const searchOverflow = await mobile.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  record(
    "MOBILE-REFLOW",
    articleOverflow <= 1 && searchOverflow <= 1,
    `article=${articleOverflow}px search=${searchOverflow}px`,
  );
  await mobile.close();

  record("CONSOLE", consoleErrors.length === 0, consoleErrors[0] ?? "no console or page errors");
} catch (error) {
  record("HARNESS", false, error.stack ?? String(error));
} finally {
  await browser.close();
}

const failed = checks.filter((check) => check.status === "FAIL");
const report = {
  measuredAt: new Date().toISOString(),
  base: BASE,
  checks,
  consoleErrors,
  badResponses,
  failedRequests,
  summary: { total: checks.length, passed: checks.length - failed.length, failed: failed.length },
};
await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(report, null, 2) + "\n");
console.log(`\n${checks.length - failed.length}/${checks.length} live split checks passed`);
process.exitCode = failed.length === 0 ? 0 : 1;
