// Measures the initial JavaScript a real browser pulls for a route, from the
// static export, so payload claims are observed rather than estimated.
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 4181;
const server = spawn(process.execPath, [path.join(ROOT, "scripts/serve-out.mjs"), String(PORT)], {
  cwd: ROOT,
  stdio: "ignore",
});
await new Promise((r) => setTimeout(r, 1200));
const browser = await chromium.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});

const ROUTES = [
  "/",
  "/lab/",
  "/lab/dp-600/",
  "/lab/dp-600/explore/",
  "/lab/dp-600/study/",
  "/lab/dp-600/progress/",
  "/lab/dp-600/resources/",
];

console.log("route | js requests | js KB (decoded) | html KB | dom nodes");
for (const route of ROUTES) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  let jsBytes = 0;
  let jsCount = 0;
  page.on("response", async (response) => {
    const url = response.url();
    if (!/\.js(\?|$)/.test(url)) return;
    jsCount += 1;
    try {
      const body = await response.body();
      jsBytes += body.length;
    } catch {
      // Response body can be unavailable for cached entries.
    }
  });
  await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const htmlBytes = (await page.content()).length;
  const nodes = await page.evaluate(() => document.querySelectorAll("*").length);
  console.log(
    `${route} | ${jsCount} | ${(jsBytes / 1024).toFixed(0)} | ${(htmlBytes / 1024).toFixed(0)} | ${nodes}`,
  );
  await context.close();
}

await browser.close();
server.kill();
