// Manual browser acceptance for the one search query state (R2).
//
//   node tests/fabric-corpus/search/search-state-browser.mjs http://127.0.0.1:4173/
//
// Run against a built static candidate after R1: the Fabric band must load for
// the "both bands" assertions to mean anything. Covers Clear (field, URL and
// both result bands) and Back/Forward restoring the matching state.
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

const READ = () => {
  const band = document.querySelector("section[aria-label='Fabric documentation results']");
  const metadataStatus = [...document.querySelectorAll("p[role='status']")]
    .map((node) => (node.textContent || "").trim())
    .find((text) => /result/.test(text));
  return {
    input: document.querySelector("input[type=search]")?.value ?? null,
    q: new URL(location.href).searchParams.get("q"),
    path: location.pathname,
    metadataStatus: metadataStatus ?? null,
    band: Boolean(band),
    bandStatus: band?.querySelector("[role='status']")?.textContent?.trim() ?? null,
    bandRows: band?.querySelectorAll("li").length ?? 0,
    startHere: [...document.querySelectorAll("section h2")].some((h) => /Start here/.test(h.textContent || "")),
  };
};

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const page = await context.newPage();
  const failures = [];
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(message.text());
  });
  page.on("pageerror", (error) => failures.push(String(error)));

  await page.goto(new URL("search/?q=OneLake", base).toString(), { waitUntil: "networkidle" });
  await page.waitForFunction(
    () => {
      const band = document.querySelector("section[aria-label='Fabric documentation results'] [role='status']");
      return Boolean(band && /match/.test(band.textContent || ""));
    },
    null,
    { timeout: 30000 },
  );
  const before = await page.evaluate(READ);
  assert.equal(before.q, "OneLake");
  assert.equal(before.input, "OneLake");
  assert.match(before.metadataStatus ?? "", /result/);
  assert.ok(before.bandRows > 0, "the Fabric band has rows before Clear");

  await page.getByRole("button", { name: /Clear search and filters/i }).click();
  await page.waitForFunction(
    () => !document.querySelector("section[aria-label='Fabric documentation results']"),
    null,
    { timeout: 15000 },
  );
  const cleared = await page.evaluate(READ);
  assert.equal(cleared.input, "", "Clear empties the field");
  assert.equal(cleared.q, null, "Clear removes q from the URL");
  assert.equal(cleared.band, false, "Clear removes the Fabric band");
  assert.equal(cleared.bandRows, 0);
  assert.equal(cleared.metadataStatus, null, "Clear removes the metadata result count");
  assert.ok(cleared.startHere, "the start-here section is back");

  await page.goBack({ waitUntil: "networkidle" });
  await page.waitForFunction(
    () => {
      const band = document.querySelector("section[aria-label='Fabric documentation results'] [role='status']");
      return Boolean(band && /match/.test(band.textContent || ""));
    },
    null,
    { timeout: 30000 },
  );
  const back = await page.evaluate(READ);
  assert.equal(back.q, "OneLake", "Back restores the query in the URL");
  assert.equal(back.input, "OneLake", "Back restores the field");
  assert.ok(back.bandRows > 0, "Back restores the Fabric band");
  assert.match(back.metadataStatus ?? "", /result/, "Back restores the metadata results");

  await page.goForward({ waitUntil: "networkidle" });
  await page.waitForFunction(
    () => !document.querySelector("section[aria-label='Fabric documentation results']"),
    null,
    { timeout: 15000 },
  );
  const forward = await page.evaluate(READ);
  assert.equal(forward.q, null, "Forward clears the query again");
  assert.equal(forward.band, false, "Forward removes the Fabric band");
  assert.equal(forward.startHere, true);

  assert.deepEqual(failures, [], "the page logs no console or runtime errors");
  console.log(JSON.stringify({ before, cleared, back, forward }, null, 1));
  await context.close();
} finally {
  await browser.close();
}
