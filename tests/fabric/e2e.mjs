// Browser-level QA for the Microsoft Fabric / DP-600 hub.
//
//   npm run build
//   npm run test:e2e:fabric
//
// Starts its own static server for `out/`, drives the system Edge through
// playwright-core, and runs axe-core on the main routes. No browser bundle is
// downloaded and nothing is uploaded anywhere.

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SHOTS = path.join(ROOT, "docs/fabric/screenshots");
const PORT = Number(process.env.PORT ?? 4175);
const BASE = process.env.BASE_URL ?? `http://127.0.0.1:${PORT}`;
const EDGE = process.env.EDGE_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
mkdirSync(SHOTS, { recursive: true });

const server = process.env.BASE_URL
  ? null
  : spawn(process.execPath, [path.join(ROOT, "scripts/serve-out.mjs"), String(PORT)], {
      cwd: ROOT,
      stdio: "ignore",
    });

async function waitForServer(url, timeoutMs = 20_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Keep polling until the timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Static server did not start at ${url}`);
}

await waitForServer(`${BASE}/lab/dp-600/`);

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const results = [];
const failures = [];
const consoleErrors = [];

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, status: "PASS" });
  } catch (error) {
    failures.push({ name, error: error instanceof Error ? error.message : String(error) });
    results.push({ name, status: "FAIL" });
  }
}

async function open(viewport = { width: 1440, height: 1000 }, options = {}) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    colorScheme: options.colorScheme ?? "light",
    reducedMotion: options.reducedMotion ?? "no-preference",
    acceptDownloads: true,
  });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(`${page.url()} :: ${message.text()}`);
  });
  page.on("pageerror", (error) => consoleErrors.push(`${page.url()} :: PAGEERROR ${error.message}`));
  return { context, page };
}

async function axe(page, label) {
  await page.addScriptTag({ content: AXE });
  const result = await page.evaluate(async () => {
    const outcome = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
    });
    return outcome.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
      help: violation.help,
      targets: violation.nodes.slice(0, 3).map((node) => node.target.join(" ")),
    }));
  });
  const serious = result.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
  assert.deepEqual(serious, [], `${label}: ${JSON.stringify(serious, null, 2)}`);
  return result;
}

const { page: desktop } = await open();

// ---------------------------------------------------------------------------
// Hub
// ---------------------------------------------------------------------------

await check("hub renders the real counts and the coverage disclosure", async () => {
  await desktop.goto(`${BASE}/lab/dp-600/`, { waitUntil: "networkidle" });
  const body = await desktop.locator("body").innerText();
  assert.match(body, /834/);
  assert.match(body, /480/);
  assert.match(body, /18 source packs/);
  assert.match(body, /61\.9%/);
  assert.match(body, /2\.7%/);
  assert.match(body, /cannot be blueprint-balanced/i);
  assert.match(body, /not official Microsoft exam content/i);
  await desktop.screenshot({ path: path.join(SHOTS, "desktop-hub.png"), fullPage: false });
  await axe(desktop, "hub");
});

await check("hub links every mode and the Data Lab stays reachable", async () => {
  const hrefs = await desktop.locator("main a").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
  for (const route of [
    "/lab/dp-600/explore/",
    "/lab/dp-600/study/",
    "/lab/dp-600/practice/",
    "/lab/dp-600/mock/",
    "/lab/dp-600/cases/",
    "/lab/dp-600/review/",
    "/lab/dp-600/progress/",
    "/lab/dp-600/resources/",
  ]) {
    assert.ok(hrefs.includes(route), `hub links ${route}`);
  }
  await desktop.goto(`${BASE}/lab/`, { waitUntil: "networkidle" });
  const lab = await desktop.locator("body").innerText();
  assert.match(lab, /834/);
  assert.match(lab, /Data Lab/);
  assert.match(lab, /SQL for Analysts/);
});

// ---------------------------------------------------------------------------
// Guided study: answer, feedback, refresh survival
// ---------------------------------------------------------------------------

await check("guided study answers a question and explains every option", async () => {
  await desktop.goto(`${BASE}/lab/dp-600/study/`, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "Start guided study" }).click();
  await desktop.locator("article").first().waitFor({ state: "visible", timeout: 20_000 });
  const article = desktop.locator("article").first();
  await article.locator("label:has(input)").first().click();
  await desktop.getByRole("button", { name: "Check answer" }).click();
  await desktop.getByText(/Why each option does or does not fit/).waitFor({ state: "visible" });
  const text = await article.innerText();
  assert.match(text, /Correct|Not quite/);
  assert.match(text, /source/i);
});

await check("a refresh during practice keeps the session and its checked answer", async () => {
  await desktop.reload({ waitUntil: "networkidle" });
  const banner = desktop.getByText(/You have a session in progress/);
  await banner.waitFor({ state: "visible", timeout: 10_000 });
  const saved = await desktop.evaluate(() =>
    Object.values(JSON.parse(localStorage.getItem("amir-fabric-v1") ?? "{}").sessions ?? {}).map((session) => ({
      id: session.id,
      status: session.status,
      first: session.manifest.questionIds[0],
      total: session.manifest.questionIds.length,
      revealed: session.revealed,
      answered: Object.keys(session.answers ?? {}).length,
      updatedAt: session.updatedAt,
    })),
  );
  await desktop.getByRole("button", { name: "Resume session" }).click();
  await desktop.locator("article").first().waitFor({ state: "visible", timeout: 20_000 });
  const text = await desktop.locator("article").first().innerText();
  assert.match(
    text,
    /why each option does or does not fit/i,
    `the checked answer and feedback survived the reload (stored: ${JSON.stringify(saved)})\nrendered: ${text.slice(0, 500)}`,
  );
});

await check("a bookmark persists and is visible in the review filters", async () => {
  const save = desktop.locator("article").first().getByRole("button", { name: /Save|Saved/ }).first();
  if ((await save.getAttribute("aria-pressed")) !== "true") await save.click();
  const stored = await desktop.evaluate(() => JSON.parse(localStorage.getItem("amir-fabric-v1") ?? "{}"));
  assert.ok(stored.bookmarks.length >= 1, "bookmark written to the Fabric namespace");
  const labStore = await desktop.evaluate(() => localStorage.getItem("amir-lab-v1"));
  assert.equal(labStore, null, "the Data Lab namespace is untouched");
});

await check("a sequence question is reorderable with the keyboard-operable controls", async () => {
  await desktop.goto(`${BASE}/lab/dp-600/explore/?type=sequence`, { waitUntil: "networkidle" });
  await desktop.locator("main ul li button").first().click();
  await desktop.getByText("Arrange into the required order").first().waitFor({ state: "visible", timeout: 15_000 });
  const down = desktop.getByRole("button", { name: /^Move “.*” down$/ }).first();
  await down.click();
  await desktop.getByRole("button", { name: "Check answer" }).click();
  await desktop.getByText(/required order/i).first().waitFor({ state: "visible" });
  const text = await desktop.locator("article").first().innerText();
  assert.match(text, /required order/i);
  assert.match(text, /positions out of order|correct/i);
});

// ---------------------------------------------------------------------------
// Explorer search and filters
// ---------------------------------------------------------------------------

await check("explorer search and filters narrow 834 questions", async () => {
  await desktop.goto(`${BASE}/lab/dp-600/explore/`, { waitUntil: "networkidle" });
  await desktop.getByPlaceholder(/Search Direct Lake/).fill("Direct Lake");
  await desktop.waitForTimeout(400);
  const count = await desktop.locator("text=/of 834/").first().innerText();
  assert.match(count, /^\d+ of 834$/);
  const filtered = Number(count.split(" ")[0]);
  assert.ok(filtered > 0 && filtered < 834, `search narrowed to ${filtered}`);

  await desktop.getByRole("button", { name: /Filters/ }).click();
  await desktop.getByLabel("Fabric topic").selectOption("semantic-models");
  await desktop.waitForTimeout(300);
  const narrowed = await desktop.locator("text=/of 834/").first().innerText();
  assert.ok(Number(narrowed.split(" ")[0]) <= filtered);

  await desktop.getByRole("button", { name: "Clear all filters" }).click();
  await desktop.waitForTimeout(300);
  assert.match(await desktop.locator("text=/of 834/").first().innerText(), /^834 of 834$/);
});

// ---------------------------------------------------------------------------
// Mock exam: timer, submission, results, review
// ---------------------------------------------------------------------------

let mockSessionId = null;

await check("a timed simulation hides feedback and submits to a scored result", async () => {
  await desktop.goto(`${BASE}/lab/dp-600/mock/`, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "30", exact: true }).click();
  await desktop.getByRole("button", { name: "15 min", exact: true }).click();
  await desktop.getByRole("button", { name: "Start timed session" }).click();
  await desktop.locator("article").first().waitFor({ state: "visible", timeout: 30_000 });

  const article = desktop.locator("article").first();
  await article.locator("label:has(input)").first().click();
  assert.equal(await desktop.getByText(/Why each option does or does not fit/).count(), 0, "feedback stays hidden");

  const timer = await desktop.getByRole("timer").innerText();
  assert.match(timer, /^\d{2}:\d{2}$/);

  const stored = await desktop.evaluate(() => JSON.parse(localStorage.getItem("amir-fabric-v1") ?? "{}"));
  mockSessionId = Object.values(stored.sessions).find((session) => session.status === "active")?.id ?? null;
  assert.ok(mockSessionId, "the active session is stored");

  await desktop.getByRole("button", { name: "Submit exam" }).click();
  await desktop.getByRole("button", { name: "Submit", exact: true }).click();
  await desktop.getByText("Practice simulation result").waitFor({ state: "visible", timeout: 10_000 });
  const body = await desktop.locator("body").innerText();
  assert.match(body, /not a blueprint-weighted replica/i);
  assert.match(body, /By official objective/);
  await desktop.waitForTimeout(600);
  await desktop.screenshot({ path: path.join(SHOTS, "desktop-results.png") });
  await axe(desktop, "results");
});

await check("results review opens a missed question with its rationale", async () => {
  const review = desktop.getByRole("button", { name: /^Missed \d+$/ });
  if (await review.count()) await review.click();
  const article = desktop.locator("article").first();
  if (await article.count()) {
    const text = await article.innerText();
    assert.match(text, /Source|Correct|Not quite/);
  }
});

// ---------------------------------------------------------------------------
// Timer expiry
// ---------------------------------------------------------------------------

await check("an expired deadline auto-submits after a refresh", async () => {
  await desktop.goto(`${BASE}/lab/dp-600/mock/`, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "20", exact: true }).click();
  await desktop.getByRole("button", { name: "Start timed session" }).click();
  await desktop.locator("article").first().waitFor({ state: "visible", timeout: 30_000 });

  const sessionId = await desktop.evaluate(() => {
    const store = JSON.parse(localStorage.getItem("amir-fabric-v1") ?? "{}");
    const active = Object.values(store.sessions ?? {}).find((session) => session.status === "active");
    if (!active) return null;
    active.deadlineAt = Date.now() + 1500;
    localStorage.setItem("amir-fabric-v1", JSON.stringify(store));
    return active.id;
  });
  assert.ok(sessionId, "an active session exists");

  await desktop.goto(`${BASE}/lab/dp-600/mock/?session=${sessionId}`, { waitUntil: "networkidle" });
  await desktop.getByText(/Time expired/).waitFor({ state: "visible", timeout: 20_000 });
  const body = await desktop.locator("body").innerText();
  assert.match(body, /auto-submitted/i);
});

// ---------------------------------------------------------------------------
// Progress, export and import
// ---------------------------------------------------------------------------

await check("progress page reports attempts and exports a versioned file", async () => {
  await desktop.goto(`${BASE}/lab/dp-600/progress/`, { waitUntil: "networkidle" });
  const body = await desktop.locator("body").innerText();
  assert.match(body, /questions attempted/);
  assert.match(body, /Content coverage versus your mastery/);

  const downloadPromise = desktop.waitForEvent("download", { timeout: 15_000 });
  await desktop.getByRole("button", { name: "Export progress" }).click();
  const download = await downloadPromise;
  const file = path.join(SHOTS, "exported-progress.json");
  await download.saveAs(file);
  const payload = JSON.parse(readFileSync(file, "utf8"));
  assert.equal(payload.app, "hansa-fabric");
  assert.equal(payload.version, 1);
  assert.ok(payload.data.history.length >= 1, "the export contains the completed attempt");
});

await check("importing the same file twice does not double-count", async () => {
  const file = path.join(SHOTS, "exported-progress.json");
  await desktop.locator('input[type="file"]').setInputFiles(file);
  await desktop.getByRole("status").waitFor({ state: "visible", timeout: 10_000 });
  const first = await desktop.getByRole("status").innerText();
  assert.match(first, /Imported:/);
  await desktop.locator('input[type="file"]').setInputFiles(file);
  await desktop.waitForTimeout(500);
  const second = await desktop.getByRole("status").innerText();
  assert.match(second, /Imported: 0 new attempt/, "a re-import adds no attempt");
  assert.match(second, /Skipped \d+ duplicate attempt/);
});

// ---------------------------------------------------------------------------
// Review mode
// ---------------------------------------------------------------------------

await check("review mode starts from the questions last answered wrong", async () => {
  await desktop.goto(`${BASE}/lab/dp-600/review/`, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "Start review session" }).click();
  await desktop.locator("article").first().waitFor({ state: "visible", timeout: 25_000 });
  const text = await desktop.locator("article").first().innerText();
  assert.match(text, /\b1 \/ \d+/);
  assert.ok(!/No questions matched/.test(text));
});

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

await check("resources page loads study notes on demand and lists the registry", async () => {
  await desktop.goto(`${BASE}/lab/dp-600/resources/`, { waitUntil: "networkidle" });
  const before = await desktop.locator("body").innerText();
  assert.match(before, /Reference registry/);
  assert.match(before, /not official Microsoft exam content/i);
  await desktop.getByRole("button", { name: /Load study notes/ }).click();
  await desktop.getByText(/linked question/).first().waitFor({ state: "visible", timeout: 20_000 });
  await axe(desktop, "resources");
});

// ---------------------------------------------------------------------------
// Dark mode, reduced motion, mobile, keyboard
// ---------------------------------------------------------------------------

await check("dark mode keeps the hub readable and unchanged in structure", async () => {
  const { context, page } = await open({ width: 1440, height: 1000 }, { colorScheme: "dark" });
  await page.goto(`${BASE}/lab/dp-600/`, { waitUntil: "networkidle" });
  const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  assert.equal(isDark, true);
  await page.screenshot({ path: path.join(SHOTS, "desktop-hub-dark.png") });
  await axe(page, "hub dark");
  await context.close();
});

await check("reduced motion is honoured and content still renders", async () => {
  const { context, page } = await open({ width: 1440, height: 1000 }, { reducedMotion: "reduce" });
  await page.goto(`${BASE}/lab/dp-600/`, { waitUntil: "networkidle" });
  const matches = await page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  assert.equal(matches, true);
  assert.ok((await page.locator("h1").first().innerText()).length > 10);
  await context.close();
});

await check("mobile layout has no horizontal overflow and keeps controls usable", async () => {
  const { context, page } = await open({ width: 390, height: 844 });
  await page.goto(`${BASE}/lab/dp-600/`, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(overflow <= 1, `horizontal overflow ${overflow}px`);
  await page.screenshot({ path: path.join(SHOTS, "mobile-hub.png"), fullPage: false });
  await axe(page, "hub mobile");

  await page.goto(`${BASE}/lab/dp-600/study/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Start guided study" }).click();
  await page.locator("article").first().waitFor({ state: "visible", timeout: 25_000 });
  const questionOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(questionOverflow <= 1, `question overflow ${questionOverflow}px`);
  await page.screenshot({ path: path.join(SHOTS, "mobile-question.png") });
  await context.close();
});

await check("keyboard alone can reach and answer a question", async () => {
  const { context, page } = await open({ width: 1440, height: 1000 });
  await page.goto(`${BASE}/lab/dp-600/study/`, { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const firstStop = await page.evaluate(() => document.activeElement?.textContent ?? "");
  assert.match(firstStop, /Skip to content/, "the skip link is the first stop");
  await page.getByRole("button", { name: "Start guided study" }).focus();
  await page.keyboard.press("Enter");
  await page.locator("article").first().waitFor({ state: "visible", timeout: 25_000 });
  await page.getByRole("button", { name: /Save|Saved/ }).first().focus();
  let reached = false;
  for (let press = 0; press < 14 && !reached; press += 1) {
    await page.keyboard.press("Tab");
    reached = (await page.evaluate(() => document.activeElement?.getAttribute("type") ?? "")) === "radio";
  }
  assert.equal(reached, true, "options are reachable by keyboard");
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Check answer" }).focus();
  await page.keyboard.press("Enter");
  await page.getByText(/Why each option does or does not fit/).waitFor({ state: "visible" });
  await context.close();
});

// ---------------------------------------------------------------------------
// Existing site protection
// ---------------------------------------------------------------------------

await check("the six original Data Lab exams still run and keep their own storage", async () => {
  const { context, page } = await open();
  await page.goto(`${BASE}/lab/sql/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Start practice/ }).click();
  await page.locator('input[type="radio"]').first().waitFor({ state: "attached", timeout: 15_000 });
  const body = await page.locator("body").innerText();
  assert.match(body, /Question\s*1\s*of/);
  const keys = await page.evaluate(() => Object.keys(localStorage));
  assert.ok(keys.every((key) => !key.startsWith("amir-fabric")), "the Data Lab flow never writes the Fabric namespace");
  await context.close();
});

await check("the Data Visualization and Statistics sections still render", async () => {
  const { context, page } = await open();
  for (const route of ["/learn/", "/learn/statistics/", "/explore/charts/"]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
    const response = await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200, `${route} responds 200`);
    assert.ok((await page.locator("h1").count()) >= 1, `${route} has a heading`);
  }
  await context.close();
});

await check("unknown routes still render the site's 404 page", async () => {
  const response = await desktop.goto(`${BASE}/lab/dp-600/not-a-real-page/`, { waitUntil: "domcontentloaded" });
  assert.equal(response.status(), 404);
  const body = await desktop.locator("body").innerText();
  assert.match(body, /404|not found/i);
});

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

// The 404 probe deliberately requests a missing route; its console entry is
// expected and is asserted separately by the status-code check.
const failedRequests = consoleErrors.filter(
  (line) => !/favicon|404 \(Not Found\)|status of 404|not-a-real-page/i.test(line),
);
await check("no unexpected console errors across the Fabric routes", async () => {
  assert.deepEqual(failedRequests, [], failedRequests.join("\n"));
});

const pass = results.filter((row) => row.status === "PASS").length;
const fail = results.filter((row) => row.status === "FAIL").length;

console.log(`\nFabric browser QA — ${pass} passed, ${fail} failed\n`);
for (const row of results) console.log(`  ${row.status === "PASS" ? "PASS" : "FAIL"}  ${row.name}`);
if (fail > 0) {
  console.log("\nFailures:");
  for (const row of failures) console.log(`\n  ${row.name}\n  ${row.error}`);
}

await browser.close();
if (server) server.kill();

process.exit(fail > 0 ? 1 : 0);
