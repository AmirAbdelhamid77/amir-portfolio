// Run against a served static candidate, once per delivery profile.
// node --experimental-strip-types tests/fabric-corpus/search/browser-worker.mjs http://127.0.0.1:4173/project/
import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { FABRIC_RESULT_LIMIT, rankFabricArticles } from "../../../lib/search/fabric-scorer.ts";
import { allArticles, deriveQueries } from "./helpers.mjs";

assert.ok(process.argv[2], "pass the local static candidate base URL (including its base path)");
const base = new URL(process.argv[2]);
assert.ok(["127.0.0.1", "localhost"].includes(base.hostname), "use a local static candidate");
assert.ok(base.pathname.endsWith("/"), "base URL must end in a slash");

async function readJson(relative) {
  const response = await fetch(new URL(relative, base));
  assert.ok(response.ok, `${relative}: HTTP ${response.status}`);
  return response.json();
}

const manifest = await readJson("fabric-search/manifest.json");
assert.equal(manifest.versionBasis, "ordered-shards-routing", "use the full candidate search generation");
const shards = [];
for (const file of manifest.files.filter(({ role }) => role === "shard")) {
  shards.push(await readJson(`fabric-search/${manifest.version}/${file.name}`));
}
const articles = allArticles(shards);
assert.equal(articles.length, manifest.articleCount);
const query = deriveQueries(shards).singleBody[0];
assert.ok(query, "candidate includes a body-only query fixture");
const expected = rankFabricArticles(articles, query, { limit: FABRIC_RESULT_LIMIT });
assert.ok(expected.length > 0);
const expectedLinks = expected.map(({ logicalPath, anchor }) =>
  `${base.pathname.slice(0, -1)}${logicalPath}${anchor ? `#${anchor}` : ""}`,
);

const browser = await chromium.launch({
  executablePath: process.env.FABRIC_BROWSER_EXECUTABLE ??
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: true,
});
try {
  const page = await browser.newPage();
  const worker = page.waitForEvent("worker");
  const url = new URL(`search/?q=${encodeURIComponent(query)}`, base);
  const links = page.getByRole("link").filter({ has: page.getByText("Fabric docs", { exact: true }) });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(url.href);
  const activeWorker = await worker;
  assert.ok(activeWorker.url().startsWith(new URL("_next/", base).href), `worker URL: ${activeWorker.url()}`);
  await links.last().waitFor();
  assert.deepEqual(await links.evaluateAll((rows) => rows.map((row) => row.getAttribute("href"))), expectedLinks);
  await page.reload();
  await links.last().waitFor();
  assert.deepEqual(await links.evaluateAll((rows) => rows.map((row) => row.getAttribute("href"))), expectedLinks);
  assert.deepEqual(pageErrors, []);
  console.log(`PASS ${base.pathname}: worker, body-only query "${query}", ${expected.length} exact ranked links and reload`);
} finally {
  await browser.close();
}
