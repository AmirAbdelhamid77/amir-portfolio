import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const context = await browser.newContext({
  javaScriptEnabled: false,
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
await page.goto("http://127.0.0.1:4210/prototype-c/", { waitUntil: "load", timeout: 30000 });
const text = await page.evaluate(() => document.body.innerText);
const has = (s) => text.includes(s);
const anchors = await page.$$eval("a", (nodes) => nodes.length);
const permanent = await page.$$eval('a[href*="insight="]', (nodes) => nodes.map((n) => n.getAttribute("href")));
console.log(
  JSON.stringify(
    {
      scenario: has("Two teams need to read the same existing Delta table"),
      takeaway: has("Investigate an internal OneLake shortcut"),
      archive: has("The insight archive"),
      railDate: has("26 OCT 2026"),
      dealButton: has("Deal three ideas"),
      anchors,
      permanent,
      chars: text.length,
    },
    null,
    2,
  ),
);
await page.screenshot({ path: "docs/prototype-c/v2/evidence/21-no-js-1440.png" });
await browser.close();
