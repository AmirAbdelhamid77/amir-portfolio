// Browser QA for the staged DP-600 R18 / PL-300 V88 review drafts.
//
//   node scripts/qa-drafts.mjs
//
// Serves the static export from out/ on a random loopback port, drives the
// locally installed Microsoft Edge through playwright-core, and writes a JSON
// report plus one screenshot under docs/intake-merge/dp600-r18-pl300-v88-draft-2026-10-27/.
//
// It proves the three conditions of the merge in a real browser:
//   * user progress saving  — sentinel values in the existing progress keys
//     survive draft review untouched, and draft review writes nothing itself;
//   * no question duplication — approved surfaces carry no draft ids or links;
//   * no answer leaks — every network response on the draft route is scanned
//     for the private package markers, and expanded questions show no answer.
// Localhost only, no network access beyond 127.0.0.1, no deployment.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const OUT = path.resolve("out");
const REPORT_DIR = path.resolve("docs/intake-merge/dp600-r18-pl300-v88-draft-2026-10-27");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

// Strings that exist only in the private intake mirror. Any of these in a
// browser response is a leak.
const PRIVATE_MARKERS = [
  "PRIVATE QA ONLY",
  "draftExpectedByID",
  "historical_original_key",
  "answer_key_version",
  "human_sme_approval",
  "R18_15_PRIVATE_EXPECTED_ANSWERS",
  "SOURCE_KEY_RECOVERY_LEDGER",
  "ACCEPTANCE_GATE_LEDGER",
  "scientific_qa_v88",
  "revisionKind",
  "Reuse audited upstream cleansing",
  "intake-private",
];

const FABRIC_KEY = "amir-fabric-v1";
const LAB_KEY = "amir-lab-v1";
const FABRIC_SENTINEL = {
  version: 1,
  updatedAt: "2026-10-27T00:00:00.000Z",
  bookmarks: ["fb-v01"],
  flags: ["sentinel-flag"],
  questions: { "fb-v01": { attempts: 4, correct: 3, lastCorrect: true, lastAt: "2026-10-27T00:00:00.000Z", lastResponse: ["optA"] } },
  sessions: {},
  history: [{ id: "sentinel", mode: "guided", label: "Sentinel", completedAt: "2026-10-27T00:00:00.000Z", score: 3, total: 4, percent: 75, durationSeconds: 60, autoSubmitted: false }],
  settings: { shuffleQuestions: true, shuffleOptions: true },
};
const LAB_SENTINEL = { version: 1, best: { "set-1": 9 }, history: [{ at: "2026-10-27T00:00:00.000Z", score: 9 }] };

function serve(directory) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
      const candidates = [path.join(directory, urlPath), path.join(directory, urlPath, "index.html"), path.join(directory, urlPath + ".html")];
      const file = candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
      if (!file) {
        res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
        res.end("<!doctype html><title>404</title>");
        return;
      }
      res.writeHead(200, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream" });
      createReadStream(file).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => resolve({ server, base: `http://127.0.0.1:${server.address().port}` }));
  });
}

const checks = [];
function record(id, pass, detail) {
  checks.push({ id, pass, detail: String(detail ?? "") });
}

const { server, base } = await serve(OUT);
await mkdir(REPORT_DIR, { recursive: true });
const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await context.newPage();

const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));

// Seed the existing progress keys before the drafts route is ever opened.
await page.goto(`${base}/practice/`, { waitUntil: "domcontentloaded" });
await page.evaluate(
  ([fabric, lab, fabricKey, labKey]) => {
    window.localStorage.setItem(fabricKey, JSON.stringify(fabric));
    window.localStorage.setItem(labKey, JSON.stringify(lab));
  },
  [FABRIC_SENTINEL, LAB_SENTINEL, FABRIC_KEY, LAB_KEY],
);
const beforeSnapshot = await page.evaluate(() => {
  const snapshot = {};
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    snapshot[key] = window.localStorage.getItem(key);
  }
  return snapshot;
});

// --- every response on the draft route is scanned for private material ------
const scanned = { responses: 0, withPrivateMarker: [] };
page.on("response", async (response) => {
  const url = response.url();
  if (!url.includes("/practice/drafts") && !/_next\/static\/chunks\//.test(url)) return;
  try {
    const type = (await response.headerValue("content-type")) ?? "";
    if (!/javascript|json|html|text/.test(type)) return;
    const body = await response.text();
    scanned.responses += 1;
    for (const marker of PRIVATE_MARKERS) {
      if (body.includes(marker)) scanned.withPrivateMarker.push({ url, marker });
    }
  } catch {
    /* body already consumed or navigation raced; the static scan covers it */
  }
});

// --- 1. the draft route renders ---------------------------------------------
await page.goto(`${base}/practice/drafts/`, { waitUntil: "networkidle", timeout: 45000 });
await page.waitForSelector('[data-testid="draft-review"]', { timeout: 20000 });
const heading = await page.locator("h1").innerText();
const pageText = await page.evaluate(() => document.body.innerText);
record("drafts-page-renders", heading.includes("Two packages"), heading);
record("drafts-show-both-statuses", pageText.includes("NO_GO") && pageText.includes("NONFINAL"), "NO_GO + NONFINAL visible");
record("drafts-show-counts", pageText.includes("222") && pageText.includes("1285"), "222 and 1285 visible");
record(
  "drafts-noindex",
  await page.evaluate(() => document.querySelector('meta[name="robots"]')?.content.includes("noindex") ?? false),
  "meta robots noindex",
);

// --- 2. DP-600 list, search and expansion -----------------------------------
await page.waitForSelector('[data-testid="draft-review"] details summary', { timeout: 20000 });
const dpRows = await page.locator('[data-testid="draft-review"] details').count();
record("dp600-first-page-rows", dpRows >= 40, `${dpRows} rows on the first page`);

const firstId = await page.locator('[data-testid="draft-review"] details summary').first().innerText();
record("dp600-source-ids-shown", /T1Q\d+/.test(firstId), firstId.replace(/\s+/g, " ").trim());

await page.locator('input[type="search"]').fill("litware");
await page.waitForTimeout(300);
const filteredText = await page.evaluate(() => document.body.innerText);
const filteredRows = await page.locator('[data-testid="draft-review"] details').count();
record("dp600-search-filters", filteredRows > 0 && filteredRows < dpRows, `${filteredRows} matches for "litware"`);
record("dp600-search-count-updated", /match(es)?\s*·/i.test(filteredText), "match counter visible");

await page.locator('input[type="search"]').fill("");
await page.waitForTimeout(200);

// --- 3. an expanded question shows options but never an answer --------------
const firstRow = page.locator('[data-testid="draft-review"] details').first();
await firstRow.locator("summary").click();
await page.waitForTimeout(200);
const rowText = await firstRow.innerText();
record("draft-row-states-graded-off", /grading disabled\s*·\s*no answer shipped/i.test(rowText), "footer label present");
record(
  "draft-row-has-no-answer",
  !/correct answer|the answer is|explanation:|answer key/i.test(rowText),
  rowText.replace(/\s+/g, " ").slice(0, 120),
);
record("draft-row-has-options", /^[A-D]/m.test(rowText), "lettered options listed");

// --- 4. switching to the PL-300 bank ----------------------------------------
await page.getByRole("button", { name: /PL-300 · V88 checkpoint/ }).click();
await page.waitForSelector('[data-testid="draft-review"] details summary', { timeout: 20000 });
await page.waitForTimeout(400);
const plText = await page.evaluate(() => document.body.innerText);
record("pl300-bank-switches", /1285\s*draft questions/i.test(plText), "1285 draft questions header");
const plFirst = await page.locator('[data-testid="draft-review"] details summary').first().innerText();
record("pl300-ids-namespaced", plFirst.includes("PL300-"), plFirst.replace(/\s+/g, " ").trim());

await page.locator('input[type="search"]').fill("power query");
await page.waitForTimeout(300);
const plMatches = await page.locator('[data-testid="draft-review"] details').count();
record("pl300-search-filters", plMatches > 0, `${plMatches} matches for "power query"`);
await page.locator('input[type="search"]').fill("");
await page.waitForTimeout(200);

await page.screenshot({ path: path.join(REPORT_DIR, "draft-review-1440.png"), fullPage: false });

// --- 5. no answer leaked over the network -----------------------------------
record(
  "no-private-material-in-any-response",
  scanned.withPrivateMarker.length === 0,
  `${scanned.responses} responses scanned, ${scanned.withPrivateMarker.length} hits: ${JSON.stringify(scanned.withPrivateMarker.slice(0, 3))}`,
);

// --- 6. user progress survives draft review ---------------------------------
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector('[data-testid="draft-review"]', { timeout: 20000 });
await page.waitForTimeout(500);
const afterSnapshot = await page.evaluate(() => {
  const snapshot = {};
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    snapshot[key] = window.localStorage.getItem(key);
  }
  return snapshot;
});
const fabricBefore = beforeSnapshot[FABRIC_KEY] ?? null;
const fabricAfter = afterSnapshot[FABRIC_KEY] ?? null;
const labBefore = beforeSnapshot[LAB_KEY] ?? null;
const labAfter = afterSnapshot[LAB_KEY] ?? null;
record("fabric-progress-preserved", fabricBefore === fabricAfter && fabricBefore !== null, "amir-fabric-v1 byte-identical");
record("lab-progress-preserved", labBefore === labAfter && labBefore !== null, "amir-lab-v1 byte-identical");
const addedKeys = Object.keys(afterSnapshot).filter((key) => !(key in beforeSnapshot));
record("draft-review-writes-nothing", addedKeys.length === 0, `new storage keys: ${JSON.stringify(addedKeys)}`);

// --- 7. approved surfaces carry no drafts -----------------------------------
const catalogue = await (await fetch(`${base}/practice/catalogue/`)).text();
const hub = await (await fetch(`${base}/lab/dp-600/`)).text();
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
record("catalogue-has-no-drafts", !catalogue.includes("draft-dp600") && !catalogue.includes("Draft review"), "catalogue clean");
record("hub-has-no-drafts", !hub.includes("draft-pl300") && !hub.includes("practice/drafts"), "DP-600 hub clean");
record("sitemap-has-no-drafts", !sitemap.includes("practice/drafts"), "sitemap clean");
record("console-no-errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | ") || "0 console errors");

await browser.close();
server.close();

const failed = checks.filter((check) => !check.pass);
const report = {
  generatedAt: new Date().toISOString(),
  base: "(loopback static export)",
  checks,
  summary: { total: checks.length, passed: checks.length - failed.length, failed: failed.length },
  scannedResponses: scanned.responses,
  evidence: ["draft-review-1440.png"],
};
await writeFile(path.join(REPORT_DIR, "qa-drafts.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary));
if (failed.length) {
  console.error(failed.map((check) => `${check.id}: ${check.detail}`).join("\n"));
  process.exit(1);
}
