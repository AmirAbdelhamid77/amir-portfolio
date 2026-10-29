// Interaction test for the HSE rate-basis explainer on /work/hse-analytics/.
// Verifies the controls drive the derived table, the subset rule surfaces as a
// text error, and reset restores the illustrative counts.
//
//   node scripts/qa-hse-explainer.mjs
import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const OUT = path.resolve("out");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

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
  response.writeHead(200, {
    "content-type": file.endsWith(".html")
      ? "text/html; charset=utf-8"
      : file.endsWith(".js")
        ? "text/javascript; charset=utf-8"
        : file.endsWith(".css")
          ? "text/css; charset=utf-8"
          : file.endsWith(".json")
            ? "application/json; charset=utf-8"
            : file.endsWith(".webp")
              ? "image/webp"
              : file.endsWith(".woff2")
                ? "font/woff2"
                : "application/octet-stream",
  });
  createReadStream(file).pipe(response);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const consoleErrors = [];
page.on("pageerror", (error) => consoleErrors.push(error.message));

const results = [];
const record = (name, ok, detail) => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

await page.goto(`${base}/work/hse-analytics/`, { waitUntil: "networkidle" });
await page.waitForTimeout(300);

const panel = page.locator("#rate-basis");
record("the explainer is present on the case page", (await panel.count()) === 1);

const trirCell = panel.locator("tbody tr").nth(0).locator("td").nth(0);
const ltifrMillion = panel.locator("tbody tr").nth(1).locator("td").nth(1);

const initialTrir = (await trirCell.textContent())?.trim();
const initialLtifr = (await ltifrMillion.textContent())?.trim();
record("defaults show 0.19 and 0.28", initialTrir === "0.19" && initialLtifr === "0.28", `${initialTrir} / ${initialLtifr}`);

// Doubling the hours halves both rates.
const hours = panel.getByLabel("Hours worked");
await hours.fill("50000000");
await page.waitForTimeout(200);
const halfTrir = (await trirCell.textContent())?.trim();
const halfLtifr = (await ltifrMillion.textContent())?.trim();
record("doubling hours halves the rates", halfTrir === "0.10" && halfLtifr === "0.14", `${halfTrir} / ${halfLtifr}`);

// The subset rule is a text error, not a colour.
await panel.getByLabel("Lost-time injuries").fill("40");
await page.waitForTimeout(200);
const alert = panel.getByRole("alert");
record(
  "lost-time above recordable is rejected with text",
  (await alert.count()) === 1 && (await alert.textContent())?.includes("cannot exceed"),
  (await alert.textContent())?.slice(0, 80) ?? "",
);

// Reset restores the fixture and the base.
await panel.getByRole("button", { name: /Reset to the illustrative counts/ }).click();
await page.waitForTimeout(200);
const resetTrir = (await trirCell.textContent())?.trim();
record("reset restores the illustrative counts", resetTrir === "0.19", resetTrir ?? "");

// The selected base changes the primary readout.
await panel.getByLabel("Reading base").selectOption("osha");
await page.waitForTimeout(200);
const panelText = (await panel.textContent()) ?? "";
record(
  "switching base re-labels the readout",
  panelText.includes("per 200,000 hours (OSHA)"),
  "",
);

await panel.screenshot({ path: path.resolve("docs/upgrade/qa/hse-rate-basis-1280.png") });
record("no page errors", consoleErrors.length === 0, consoleErrors[0] ?? "");

await browser.close();
server.close();
const failed = results.filter((row) => !row.ok);
console.log(failed.length === 0 ? "RESULT: PASS" : `RESULT: ${failed.length} failing check(s)`);
process.exitCode = failed.length === 0 ? 0 : 1;
