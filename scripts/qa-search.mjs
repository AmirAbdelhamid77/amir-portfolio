// Interaction test for /search/: typing, filters, the lazy Fabric shard, the
// shareable URL and the empty state. Runs against the built `out/` with Edge.
//
//   node scripts/qa-search.mjs
import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const OUT = path.resolve("out");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
// `--base <url>` runs the same interaction checks against a deployed origin.
const baseIndex = process.argv.indexOf("--base");
const remoteBase = baseIndex === -1 ? null : process.argv[baseIndex + 1];

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  let file = path.join(OUT, decodeURIComponent(url.pathname));
  if (!existsSync(file) || url.pathname.endsWith("/")) {
    const index = path.join(file, "index.html");
    if (existsSync(index)) file = index;
  }
  if (!existsSync(file)) {
    response.writeHead(404).end("not found");
    return;
  }
  const type = file.endsWith(".html")
    ? "text/html; charset=utf-8"
    : file.endsWith(".js")
      ? "text/javascript; charset=utf-8"
      : file.endsWith(".json")
        ? "application/json; charset=utf-8"
        : file.endsWith(".css")
          ? "text/css; charset=utf-8"
          : "application/octet-stream";
  response.writeHead(200, { "content-type": type });
  createReadStream(file).pipe(response);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = remoteBase ?? `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));

const results = [];
const record = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const countText = async () => (await page.locator('[aria-live="polite"]').first().textContent()) ?? "";

await page.goto(`${base}/search/`, { waitUntil: "networkidle" });
await page.waitForTimeout(300);

const initial = await countText();
record("search page renders a result count", /\d+ results?/.test(initial), initial.trim());

const input = page.getByLabel(/Search courses, lessons/);
await input.fill("p-value");
await page.waitForTimeout(300);
const afterQuery = await countText();
const firstHref = await page.locator("main ul li a").first().getAttribute("href");
record("typing filters the list", afterQuery !== initial, `${afterQuery.trim()} first=${firstHref}`);
record(
  "the p-value query reaches a statistics destination",
  (firstHref ?? "").includes("/learn/statistics"),
  firstHref ?? "none",
);
record("the URL is shareable", page.url().includes("q=p-value"), page.url());

await page.getByRole("button", { name: "Lab", exact: true }).click();
await page.waitForTimeout(250);
const labHrefs = await page.locator("main ul li a").evaluateAll((nodes) =>
  nodes.map((node) => node.getAttribute("href") ?? ""),
);
record(
  "the kind filter narrows to labs",
  labHrefs.length > 0 && labHrefs.every((href) => href.includes("/labs/") || href.includes("/lab/") || href.includes("/explore/charts/")),
  `${labHrefs.length} link(s)`,
);

await page.getByRole("button", { name: "Clear search and filters" }).click();
await page.waitForTimeout(250);
record("clear resets the query", (await countText()) === initial, (await countText()).trim());

const fabric = page.getByLabel(/Include 834 Fabric questions/);
await fabric.check();
await page.waitForTimeout(1500);
record(
  "the Fabric shard loads without a page error",
  (await page.getByText(/Loading the Fabric question index/).count()) === 0,
  "after toggle",
);

await input.fill("Direct Lake");
await page.waitForTimeout(400);
const fabricHrefs = await page.locator("main ul li a").evaluateAll((nodes) =>
  nodes.map((node) => node.getAttribute("href") ?? ""),
);
record(
  "a Fabric query deep-links into the explorer",
  fabricHrefs.some((href) => href.includes("/lab/dp-600/explore/?question=")),
  fabricHrefs.find((href) => href.includes("explore")) ?? "no explorer link",
);

await input.fill("zzzqqq");
await page.waitForTimeout(300);
const emptyText = await page.locator("main").textContent();
record("the empty state offers a way out", (emptyText ?? "").includes("Nothing matched"), "");

await input.fill("المدرج التكراري");
await page.waitForTimeout(300);
const arabicHrefs = await page.locator("main ul li a").evaluateAll((nodes) =>
  nodes.map((node) => node.getAttribute("href") ?? ""),
);
record(
  "an Arabic query reaches the Arabic lane",
  arabicHrefs.some((href) => href.includes("/learn/ar/")),
  arabicHrefs[0] ?? "none",
);

record("no console errors during the run", consoleErrors.length === 0, consoleErrors[0] ?? "");

await browser.close();
server.close();

const failed = results.filter((row) => !row.ok);
console.log(failed.length === 0 ? "RESULT: PASS" : `RESULT: ${failed.length} failing check(s)`);
process.exitCode = failed.length === 0 ? 0 : 1;
