// Manual browser acceptance for the /search Fabric documentation band.
//
//   node tests/fabric-corpus/search/search-band-browser.mjs http://127.0.0.1:4173/
//
// Run against a built static candidate. It uses a fresh browser profile, types
// nothing, and relies on the real global `fetch`: a Node test with an injected
// fetch cannot see the "Illegal invocation" receiver bug that made this band
// fail in Chromium while every test passed. Keep this script out of `test:all`
// because it needs a running server, like browser-worker.mjs.
import assert from "node:assert/strict";
import { chromium } from "playwright-core";

assert.ok(process.argv[2], "pass the local static candidate base URL (including any base path)");
const base = new URL(process.argv[2]);
assert.ok(["127.0.0.1", "localhost"].includes(base.hostname), "use a local static candidate");
assert.ok(base.pathname.endsWith("/"), "base URL must end in a slash");

const browser = await chromium.launch({
  executablePath: process.env.FABRIC_BROWSER_EXECUTABLE ??
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: true,
});
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const page = await context.newPage();
  const failures = [];
  const searchRequests = [];
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(message.text());
  });
  page.on("pageerror", (error) => failures.push(String(error)));
  page.on("request", (request) => {
    if (request.url().includes("fabric-search")) searchRequests.push(request.url());
  });

  await page.goto(new URL("search/?q=OneLake", base).toString(), { waitUntil: "networkidle" });
  const band = page.locator("section[aria-label='Fabric documentation results']");
  await band.waitFor({ state: "visible", timeout: 20000 });
  await page.waitForFunction(
    () => {
      const status = document.querySelector(
        "section[aria-label='Fabric documentation results'] [role='status']",
      );
      return Boolean(status && /match/.test(status.textContent || ""));
    },
    null,
    { timeout: 30000 },
  );
  const status = (await band.locator("[role='status']").innerText()).trim();
  assert.match(status, /match/, `the Fabric band reports matches, got: ${status}`);
  assert.ok(searchRequests.length > 0, "the browser requested the Fabric search manifest");

  const rows = band.locator("li a");
  assert.ok((await rows.count()) > 0, "the Fabric band lists at least one article");
  const href = await rows.first().getAttribute("href");
  assert.match(href, /^\/learn\/fabric\/docs\//, `first Fabric row is an article: ${href}`);
  assert.match(href, /#.+/, `first Fabric row opens a matching section: ${href}`);

  await rows.first().click();
  await page.waitForURL(/#.+/, { timeout: 15000 });
  const hash = new URL(page.url()).hash.slice(1);
  const target = await page.evaluate((id) => {
    const element = document.getElementById(id);
    return element ? `${element.tagName}:${(element.textContent || "").slice(0, 80)}` : null;
  }, hash);
  assert.ok(target, `the article resolves the matching section #${hash}`);
  assert.deepEqual(failures, [], "the page logs no console or runtime errors");
  console.log(JSON.stringify({ status, href, hash, target }, null, 1));
  await context.close();
} finally {
  await browser.close();
}
