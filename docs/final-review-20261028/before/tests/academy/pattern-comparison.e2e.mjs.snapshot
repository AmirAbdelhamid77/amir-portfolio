// Local static-export QA only. Starts a disposable preview and isolated browser.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { chromium } from "playwright-core";

const resultDir = "docs/design-system/easyui-v2";
mkdirSync(resultDir, { recursive: true });
const portProbe = createServer();
await new Promise(resolve => portProbe.listen(0, "127.0.0.1", resolve));
const port = portProbe.address().port;
await new Promise(resolve => portProbe.close(resolve));
const server = spawn(process.execPath, ["scripts/serve-out.mjs", String(port)], { stdio: "pipe", windowsHide: true });
const base = `http://127.0.0.1:${port}`;
let browser;
const checks = [];
const pass = name => checks.push({ name, status: "PASS" });
try {
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(base)).ok) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({ executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", headless: true });
  const errors = [];
  for (const [width, colorScheme, reducedMotion] of [[1280, "light", "no-preference"], [320, "light", "reduce"], [390, "dark", "reduce"]]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme, reducedMotion, hasTouch: width < 500 });
    const sentinels = { "amir-lab-v1": "preserve-existing-general", "amir-fabric-v1": "preserve-existing-fabric", "hansa-academy-ingestion-v1": JSON.stringify({ version: 1, revision: 1, answers: {}, checked: [], confidence: "medium", journal: [] }) };
    await context.addInitScript(values => { for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value); }, sentinels);
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(base + "/learn/dp-600/ingestion/", { waitUntil: "networkidle" });
    const panel = page.getByTestId("pattern-comparison");
    assert.ok((await page.getByLabel("Search comparison criteria", { exact: true }).boundingBox()).width >= 220, "Usable search width on narrow screens");
    await page.getByLabel("Search comparison criteria", { exact: true }).fill("NEAR zero lag");
    await page.getByRole("status").filter({ hasText: "1 of 4 criteria shown." }).waitFor();
    assert.equal(await panel.getByText("Continuous replication with latency; near real time is not zero lag.", { exact: true }).locator("visible=true").count(), 1);
    await page.getByRole("button", { name: "Reset comparison", exact: true }).click();
    const input = page.getByLabel("Search comparison criteria", { exact: true });
    await input.focus(); await page.keyboard.press("Tab");
    assert.equal(await page.getByLabel("Differences only", { exact: true }).evaluate(element => element === document.activeElement), true);
    await page.keyboard.press("Space");
    assert.equal(await page.getByLabel("Differences only", { exact: true }).isChecked(), true);
    await panel.getByRole("status").filter({ hasText: "3 of 4" }).waitFor();
    await input.fill("permissions");
    await panel.getByText("No matching criteria.", { exact: false }).waitFor();
    await page.getByRole("button", { name: "Reset comparison", exact: true }).click();
    await panel.getByRole("status").filter({ hasText: "4 of 4" }).waitFor();
    const after = await page.evaluate(keys => Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)])), Object.keys(sentinels));
    assert.deepEqual(after, sentinels);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert.equal(overflow, false, "Page horizontal overflow");
    await page.addScriptTag({ path: "node_modules/axe-core/axe.min.js" });
    const axe = await page.evaluate(async () => (await window.axe.run('[data-testid="pattern-comparison"]')).violations);
    assert.deepEqual(axe, [], "Scoped axe violations");
    await panel.screenshot({ path: `${resultDir}/comparison-${width}-${colorScheme}.png` });
    await page.getByRole("radio", { name: "Shortcut", exact: true }).first().check();
    await page.getByRole("button", { name: "Check prediction", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Correct. A shortcut" }).waitFor();
    await input.fill("no-such-term");
    await page.emulateMedia({ media: "print" });
    assert.equal(await panel.locator("tbody tr:visible").count(), 4);
    assert.equal(await panel.getByText("No matching criteria.", { exact: false }).isVisible(), false);
    pass(`${width}px ${colorScheme}, ${reducedMotion}: search/reset/keyboard/difference/empty state, unchanged storage, reflow, scoped axe, existing prediction, full print table`);
    await context.close();
  }
  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  const page = await nojs.newPage();
  await page.goto(base + "/learn/dp-600/ingestion/");
  assert.equal(await page.getByTestId("pattern-comparison").getByText("Access prerequisite", { exact: true }).locator("visible=true").count(), 1);
  assert.equal(await page.getByTestId("pattern-comparison").getByText("Reference existing accessible data instead of maintaining an ingestion replica.", { exact: true }).locator("visible=true").count(), 1);
  pass("No JavaScript: all comparison definitions and evidence remain in exported HTML at 320px");
  await nojs.close();
  assert.deepEqual(errors, []);
  pass("No browser runtime errors");
  writeFileSync(`${resultDir}/QA_RESULTS.json`, JSON.stringify({ date: "2026-10-25", environment: "Local exported out/; isolated headless Edge, emulated touch/viewports", checks, notRun: ["Human screen-reader", "Physical mobile/touch", "Upstream EasyUI runtime suite", "CWV/Lighthouse", "Live Cloudflare delivery"] }, null, 2));
  console.log(JSON.stringify(checks, null, 2));
} finally {
  if (browser) await browser.close();
  server.kill();
}
