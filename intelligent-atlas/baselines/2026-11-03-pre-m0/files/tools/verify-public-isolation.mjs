// Public-artifact isolation verifier for the V3.1 Knowledge Stage.
//
//   node intelligent-atlas/tools/verify-public-isolation.mjs
//
// The public artifact is physically separate from the review prototype. This
// verifier proves that separation instead of trusting a hidden button or a
// runtime flag:
//
//   1. the public directory contains only its own four files;
//   2. no public file contains a candidate identifier, edition date, deck key,
//      review API name or reference to the review prototype;
//   3. the rendered public text contains no candidate concept label;
//   4. the public runtime exposes zero published records and no candidate data;
//   5. tampered URLs and storage cannot unlock review records;
//   6. a missing projection fails closed.
//
// It writes analysis/public-isolation-v31.json and exits non-zero on failure.
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import vm from "node:vm";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ROOT = path.resolve("intelligent-atlas");
const PUBLIC_DIR = path.join(ROOT, "public");
const PUBLIC_URL = pathToFileURL(path.join(PUBLIC_DIR, "index.html")).href;
const EVIDENCE = path.join(ROOT, "analysis", "public-isolation-v31.json");
const ALLOWED_FILES = ["app.js", "index.html", "public-data.js", "styles.css"];

const results = [];
const check = (id, pass, detail) => results.push({ id, status: pass ? "PASS" : "FAIL", detail });

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(await readFile(path.join(ROOT, "prototype", "data.js"), "utf8"), ctx);
const review = ctx.window.ATLAS_DATA;
const publicData = JSON.parse(
  (await readFile(path.join(PUBLIC_DIR, "public-data.js"), "utf8"))
    .replace(/^[\s\S]*?window\.ATLAS_PUBLIC\s*=\s*/, "")
    .replace(/;\s*$/, ""),
);

/* ---------------------------------------------------------- file inventory */
const entries = await readdir(PUBLIC_DIR, { withFileTypes: true });
const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
check(
  "files:allowlist",
  files.length === ALLOWED_FILES.length && ALLOWED_FILES.every((name) => files.includes(name)),
  `public files: ${files.join(", ")}`,
);
check(
  "files:no-review-artifact",
  !files.some((name) => name === "data.js" || name.includes("review") || name.includes("candidate")),
  "no review payload file is present",
);

const source = new Map();
for (const name of files) source.set(name, await readFile(path.join(PUBLIC_DIR, name), "utf8"));
const allSource = [...source.entries()].map(([name, text]) => `\n/* ${name} */\n${text}`).join("\n");

/* ------------------------------------------------------ identifier absence */
const forbidden = [
  { id: "ids:concept", pattern: /concept:[a-z0-9-]+/gi, why: "candidate concept id" },
  { id: "ids:assertion", pattern: /assert:[a-z0-9:-]+/gi, why: "candidate assertion id" },
  { id: "ids:insight", pattern: /insight:[a-z0-9:-]+/gi, why: "candidate insight id" },
  { id: "ids:goal", pattern: /goal:[a-z0-9:-]+/gi, why: "candidate goal id" },
  { id: "ids:comparison", pattern: /comparison:[a-z0-9:-]+/gi, why: "candidate comparison id" },
  { id: "ids:daily-deck", pattern: /daily:\d{4}-\d{2}-\d{2}/gi, why: "daily deck key" },
  { id: "ids:card", pattern: /card:[a-z0-9:-]+/gi, why: "card key" },
  { id: "api:review-data", pattern: /ATLAS_DATA|__ATLAS_STAGE__|review-decisions|semantic-ledger|deck-resolver/gi, why: "review API or review artifact name" },
  { id: "path:review-prototype", pattern: /(?:\.\.\/)+prototype|intelligent-atlas\/prototype|prototype\/index\.html/gi, why: "reference to the review prototype" },
];
for (const rule of forbidden) {
  const matches = [...new Set((allSource.match(rule.pattern) || []).map((match) => match.trim()))];
  check(`source:no-${rule.id}`, matches.length === 0, matches.length ? `${rule.why}: ${matches.slice(0, 8).join(", ")}` : `no ${rule.why}`);
}

const editionDates = review.editions.map((edition) => edition.date);
const editionHits = editionDates.filter((date) => allSource.includes(date));
check("source:no-edition-dates", editionHits.length === 0, editionHits.length ? `found ${editionHits.join(", ")}` : `checked ${editionDates.length} edition dates`);

const deckKeys = Object.keys(review.decks);
const deckHits = deckKeys.filter((key) => allSource.includes(key));
check("source:no-deck-keys", deckHits.length === 0, deckHits.length ? `found ${deckHits.slice(0, 6).join(", ")}` : `checked ${deckKeys.length} deck keys`);

const conceptIds = review.concepts.map((concept) => concept.id);
const conceptIdHits = conceptIds.filter((id) => allSource.toLowerCase().includes(id.toLowerCase()));
check("source:no-concept-ids", conceptIdHits.length === 0, conceptIdHits.length ? conceptIdHits.slice(0, 6).join(", ") : `checked ${conceptIds.length} concept ids`);

/* Concept labels are checked against the rendered text, not CSS or code
 * identifiers. A generic label such as "Scale" legitimately appears inside a
 * CSS transform and is not a semantic leak. */
const labels = [...new Set(review.concepts.map((concept) => concept.label))];
const labelInSource = labels.filter((label) => label.length >= 4 && allSource.toLowerCase().includes(label.toLowerCase()));
check(
  "source:labels-only-in-render-check",
  labelInSource.every((label) => label.toLowerCase() === "scale"),
  labelInSource.length ? `source label hits: ${labelInSource.join(", ")}` : "no concept label in public source",
);

/* ------------------------------------------------------------- data shape */
const publicKeys = Object.keys(publicData).sort();
const allowedKeys = [
  "emptyState",
  "generatedAt",
  "graphBuildId",
  "mode",
  "publicationGate",
  "publishedAssertions",
  "publishedConcepts",
  "publishedInsights",
  "schemaVersion",
  "structural",
  "withheld",
].sort();
check(
  "data:keys-allowlist",
  publicKeys.length === allowedKeys.length && allowedKeys.every((key) => publicKeys.includes(key)),
  `keys: ${publicKeys.join(", ")}`,
);
check("data:mode-public", publicData.mode === "public", `mode=${publicData.mode}`);
check(
  "data:zero-published",
  publicData.publishedConcepts.length === 0 &&
    publicData.publishedAssertions.length === 0 &&
    publicData.publishedInsights.length === 0,
  `published ${publicData.publishedConcepts.length}/${publicData.publishedAssertions.length}/${publicData.publishedInsights.length}`,
);
check(
  "data:no-candidate-arrays",
  !("concepts" in publicData) && !("edges" in publicData) && !("decks" in publicData) && !("editions" in publicData),
  "no candidate concepts, edges, decks or editions",
);

const html = source.get("index.html");
const scriptSources = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map((match) => match[1]);
check(
  "html:scripts-are-local-public",
  scriptSources.length === 2 && scriptSources.includes("public-data.js") && scriptSources.includes("app.js"),
  `scripts: ${scriptSources.join(", ")}`,
);
check("html:no-review-path", !/\.\.\//.test(html), "no parent-directory reference");

/* --------------------------------------------------------- runtime probes */
const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const consoleErrors = [];
const page = await context.newPage();
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(error.message));

try {
  await page.goto(PUBLIC_URL, { waitUntil: "load" });
  await page.waitForFunction(() => Boolean(window.__ATLAS_PUBLIC_STATE__), { timeout: 15000 });
  await page.waitForTimeout(300);

  const runtime = await page.evaluate(() => ({
    state: window.__ATLAS_PUBLIC_STATE__,
    hasReviewData: "ATLAS_DATA" in window,
    hasReviewApi: "__ATLAS_STAGE__" in window,
    text: document.body.innerText,
    counts: {
      concepts: document.getElementById("published-concepts").textContent,
      assertions: document.getElementById("published-assertions").textContent,
      insights: document.getElementById("published-insights").textContent,
    },
    gateCards: document.querySelectorAll(".gate-card").length,
    gateStates: [...document.querySelectorAll(".gate-state")].map((node) => node.textContent),
    stats: [...document.querySelectorAll(".stats-grid dd")].map((node) => node.textContent),
    dataState: document.body.dataset.publicState,
  }));

  check("runtime:no-console-errors", consoleErrors.length === 0, consoleErrors.join(" | ") || "none");
  check("runtime:no-review-data", !runtime.hasReviewData && !runtime.hasReviewApi, `ATLAS_DATA=${runtime.hasReviewData} __ATLAS_STAGE__=${runtime.hasReviewApi}`);
  check("runtime:zero-counts", runtime.counts.concepts === "0" && runtime.counts.assertions === "0" && runtime.counts.insights === "0", JSON.stringify(runtime.counts));
  check("runtime:gate-cards", runtime.gateCards === 4 && runtime.gateStates.every((state) => state === "not met"), `${runtime.gateCards} cards; ${[...new Set(runtime.gateStates)].join("/")}`);
  check("runtime:structural-stats", runtime.stats.length === 4 && runtime.stats.every((value) => value !== "—"), runtime.stats.join(" · "));
  check("runtime:empty-state", runtime.dataState === "empty-semantic-layer", `state=${runtime.dataState}`);

  const textLower = runtime.text.toLowerCase();
  const renderedLabelHits = labels.filter((label) => textLower.includes(label.toLowerCase()));
  check("render:no-concept-labels", renderedLabelHits.length === 0, renderedLabelHits.length ? renderedLabelHits.join(", ") : `checked ${labels.length} labels`);
  const renderedEditionHits = editionDates.filter((date) => runtime.text.includes(date));
  check("render:no-edition-dates", renderedEditionHits.length === 0, renderedEditionHits.join(", ") || `checked ${editionDates.length} dates`);
  const claims = [
    ...review.edges.map((edge) => edge.claim),
    ...review.concepts.map((concept) => concept.reading?.reading).filter(Boolean),
  ].filter((claim) => typeof claim === "string" && claim.length >= 40);
  const renderedClaimHits = claims.filter((claim) => textLower.includes(claim.toLowerCase()));
  check(
    "render:no-candidate-claims",
    renderedClaimHits.length === 0,
    renderedClaimHits.length ? `${renderedClaimHits.length} candidate claims rendered` : `checked ${claims.length} candidate claims and readings`,
  );
  const renderedIdHits = [...runtime.text.matchAll(/\b(?:concept|assert|insight|goal|comparison):[a-z0-9:-]+/gi)].map((match) => match[0]);
  check("render:no-record-identifiers", renderedIdHits.length === 0, renderedIdHits.slice(0, 6).join(", ") || "no record identifier rendered");

  // Tampered URL and storage must not unlock anything.
  await page.goto(
    `${PUBLIC_URL}?dealer=daily:2026-10-26&concept=concept:fabric:shortcut&intent=goal&goal=goal:ia:reference-without-copy&theme=dark`,
    { waitUntil: "load" },
  );
  await page.evaluate(() => {
    localStorage.setItem("hansa.knowledge-stage.public.v31", JSON.stringify({ theme: "dark", dealer: "daily:2026-10-26" }));
    localStorage.setItem("hansa.knowledge-stage.v31", JSON.stringify({ conceptId: "concept:fabric:shortcut" }));
  });
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => Boolean(window.__ATLAS_PUBLIC_STATE__), { timeout: 15000 });
  await page.waitForTimeout(250);
  const tampered = await page.evaluate(() => ({
    hasReviewData: "ATLAS_DATA" in window,
    hasReviewApi: "__ATLAS_STAGE__" in window,
    counts: window.__ATLAS_PUBLIC_STATE__.published,
    text: document.body.innerText,
    state: document.body.dataset.publicState,
  }));
  const tamperedLabelHits = labels.filter((label) => tampered.text.toLowerCase().includes(label.toLowerCase()));
  check(
    "tamper:url-and-storage-inert",
    !tampered.hasReviewData && !tampered.hasReviewApi && tampered.counts.concepts === 0 && tamperedLabelHits.length === 0,
    `reviewData=${tampered.hasReviewData} reviewApi=${tampered.hasReviewApi} labels=${tamperedLabelHits.join(",") || "none"}`,
  );

  // Missing projection must fail closed.
  const failDir = await mkdtemp(path.join(tmpdir(), "hansa-public-fail-"));
  try {
    for (const name of ["index.html", "styles.css", "app.js"]) {
      await copyFile(path.join(PUBLIC_DIR, name), path.join(failDir, name));
    }
    const failPage = await context.newPage();
    await failPage.goto(pathToFileURL(path.join(failDir, "index.html")).href, { waitUntil: "load" });
    await failPage.waitForTimeout(500);
    const failed = await failPage.evaluate(() => ({
      state: document.body.dataset.publicState,
      text: document.getElementById("main").innerText,
      foot: document.getElementById("foot-build").textContent,
    }));
    check(
      "fail-closed:missing-projection",
      failed.state === "failed-closed" && /verified projection/i.test(failed.text) && failed.foot === "projection unavailable",
      JSON.stringify(failed),
    );
    await failPage.close();
  } finally {
    await rm(failDir, { recursive: true, force: true });
  }
} catch (error) {
  check("harness:completed", false, error.stack ?? String(error));
} finally {
  await browser.close();
}

const failed = results.filter((result) => result.status === "FAIL");
const report = {
  schemaVersion: "intelligent-atlas-public-isolation/1.0",
  generatedAt: new Date().toISOString(),
  target: PUBLIC_URL,
  summary: { total: results.length, passed: results.length - failed.length, failed: failed.length },
  files: files.map((name) => ({ name, bytes: source.get(name).length })),
  checked: {
    conceptIds: conceptIds.length,
    conceptLabels: labels.length,
    editionDates: editionDates.length,
    deckKeys: deckKeys.length,
  },
  consoleErrors,
  results,
};
await mkdir(path.dirname(EVIDENCE), { recursive: true });
await writeFile(EVIDENCE, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary));
for (const result of results) console.log(`${result.status} ${result.id} — ${result.detail}`);
process.exitCode = failed.length ? 1 : 0;
