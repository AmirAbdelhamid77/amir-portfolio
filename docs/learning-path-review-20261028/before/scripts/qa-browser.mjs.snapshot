// Browser QA for the static export: screenshots, layout overflow, console/runtime
// errors and axe-core accessibility checks.
//
//   node scripts/qa-browser.mjs [--base http://127.0.0.1:4321] [--only /,/learn/catalogue/]
//
// Defaults: serves `out/` itself on a random port, drives the locally installed
// Microsoft Edge through playwright-core, writes PNGs and a JSON report under
// `docs/upgrade/qa/`. No network access beyond 127.0.0.1, no deployment.
import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const OUT = path.resolve("out");
const REPORT_DIR = path.resolve("docs/upgrade/qa");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const args = process.argv.slice(2);
const onlyIndex = args.indexOf("--only");
const only = onlyIndex === -1 ? null : args[onlyIndex + 1].split(",").map((value) => value.trim());
const dark = args.includes("--dark");
// `--base <url>` audits a deployed origin instead of the local `out/` folder.
const baseIndex = args.indexOf("--base");
const remoteBase = baseIndex === -1 ? null : args[baseIndex + 1];
const suffix = `${dark ? "-dark" : ""}${remoteBase ? "-prod" : ""}`;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".xml": "application/xml",
};

function startServer() {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    let file = path.join(OUT, decodeURIComponent(url.pathname));
    if (!file.startsWith(OUT)) {
      response.writeHead(403).end();
      return;
    }
    if (!existsSync(file) || url.pathname.endsWith("/")) {
      const index = path.join(file, "index.html");
      if (existsSync(index)) file = index;
      else if (existsSync(`${file}.html`)) file = `${file}.html`;
    }
    if (!existsSync(file)) {
      const notFound = path.join(OUT, "404.html");
      response.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      if (existsSync(notFound)) createReadStream(notFound).pipe(response);
      else response.end("not found");
      return;
    }
    response.writeHead(200, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(response);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

const ROUTES = [
  "/",
  "/learn/catalogue/",
  "/practice/catalogue/",
  "/search/",
  "/learn/",
  "/learn/statistics/",
  "/learn/ar/",
  "/explore/charts/",
  "/explore/integrity/",
  // Routes that carry the rebuilt live figures and the AI-shaped workspace.
  // They are in the default sweep because a chart module can pass the build and
  // still throw on hydration, overflow at 320px or fail axe inside the <details>.
  "/explore/choose/",
  "/explore/specialty/",
  "/explore/dashboards/",
  "/learn/foundations/",
  "/practice/",
  "/lab/",
  "/lab/dp-600/",
  "/lab/dp-600/study/",
  "/lab/sql/",
  "/work/",
  "/work/hse-analytics/",
  "/services/",
  "/about/",
  "/experience/",
  "/contact/",
];

const VIEWPORTS = [
  { name: "320", width: 320, height: 800, mobile: true },
  { name: "390", width: 390, height: 844, mobile: true },
  { name: "1280", width: 1280, height: 900, mobile: false },
];

const server = remoteBase ? null : await startServer();
const base = remoteBase ?? `http://127.0.0.1:${server.address().port}`;
await mkdir(REPORT_DIR, { recursive: true });

const axeSource = await readFile(path.resolve("node_modules/axe-core/axe.min.js"), "utf8");

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const report = { generatedAt: new Date().toISOString(), base, results: [] };
const routes = only ? ROUTES.filter((route) => only.includes(route)) : ROUTES;

for (const route of routes) {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    if (dark) {
      await page.addInitScript(() => {
        try {
          window.localStorage.setItem("amir-theme", "dark");
        } catch {
          /* ignore */
        }
      });
    }
    const consoleErrors = [];
    const failedRequests = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));
    page.on("requestfailed", (request) => {
      // Next.js aborts in-flight prefetches on navigation; those are not
      // user-facing failures and would drown the real ones.
      const reason = request.failure()?.errorText ?? "";
      if (reason.includes("ERR_ABORTED")) return;
      failedRequests.push(`${request.url()} ${reason}`);
    });

    const url = `${base}${route}`;
    let status = 0;
    try {
      const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      status = response?.status() ?? 0;
      await page.waitForTimeout(250);

      const layout = await page.evaluate(() => {
        const doc = document.documentElement;
        const overflowing = [...document.querySelectorAll("body *")]
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && rect.right > window.innerWidth + 1.5;
          })
          .slice(0, 6)
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              tag: element.tagName.toLowerCase(),
              className: String(element.className).slice(0, 90),
              right: Math.round(rect.right),
              text: (element.textContent ?? "").trim().slice(0, 40),
            };
          });
        return {
          title: document.title,
          h1: [...document.querySelectorAll("h1")].map((node) => node.textContent?.trim() ?? ""),
          h1Count: document.querySelectorAll("h1").length,
          lang: document.documentElement.lang,
          dir: document.documentElement.dir || "ltr",
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          horizontalOverflow: doc.scrollWidth > doc.clientWidth + 1,
          overflowing,
          mainLandmark: document.querySelectorAll("main").length,
          navLabels: [...document.querySelectorAll("nav")].map((nav) => nav.getAttribute("aria-label") ?? "(none)"),
          currentPage: [...document.querySelectorAll('[aria-current="page"]')].map(
            (node) => node.textContent?.trim().slice(0, 40) ?? "",
          ),
          imagesWithoutAlt: [...document.querySelectorAll("img:not([alt])")].length,
          emptyLinks: [...document.querySelectorAll("a")].filter(
            (anchor) => (anchor.textContent ?? "").trim().length === 0 && !anchor.querySelector("img,svg"),
          ).length,
        };
      });

      await page.addScriptTag({ content: axeSource });
      const axe = await page.evaluate(async () => {
        // @ts-expect-error injected global
        const result = await window.axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
        });
        return result.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          nodes: violation.nodes.length,
          targets: violation.nodes.slice(0, 3).map((node) => node.target.join(" ")),
          detail: violation.nodes.slice(0, 3).map((node) => ({
            target: node.target.join(" "),
            html: node.html.slice(0, 200),
            data: node.any.map((check) => check.data).filter(Boolean),
          })),
        }));
      });

      const shot = path.join(REPORT_DIR, `${route === "/" ? "home" : route.replaceAll("/", "_").replace(/^_|_$/g, "")}-${viewport.name}${suffix}.png`);
      await page.screenshot({ path: shot, fullPage: false });

      // Mobile menu mechanics: open by keyboard, Escape closes, focus returns to
      // the trigger, and the closed menu is not in the accessibility tree.
      let menu = null;
      if (viewport.width === 320 && route === "/") {
        menu = await page.evaluate(async () => {
          const trigger = document.querySelector('button[aria-controls="mobile-nav"]');
          if (!trigger) return { present: false };
          trigger.focus();
          trigger.click();
          await new Promise((resolve) => setTimeout(resolve, 120));
          const panel = document.getElementById("mobile-nav");
          const opened = { expanded: trigger.getAttribute("aria-expanded"), hidden: panel?.hasAttribute("hidden") };
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          await new Promise((resolve) => setTimeout(resolve, 120));
          return {
            present: true,
            opened,
            closed: {
              expanded: trigger.getAttribute("aria-expanded"),
              hidden: document.getElementById("mobile-nav")?.hasAttribute("hidden"),
              focusReturned: document.activeElement === trigger,
            },
            links: document.querySelectorAll("#mobile-nav a").length,
          };
        });
      }

      report.results.push({
        route,
        viewport: viewport.name,
        status,
        theme: dark ? "dark" : "light",
        ...layout,
        menu,
        axe,
        consoleErrors,
        failedRequests,
        screenshot: path.relative(process.cwd(), shot),
      });
    } catch (error) {
      report.results.push({
        route,
        viewport: viewport.name,
        status,
        error: String(error),
        consoleErrors,
        failedRequests,
      });
    }
    await context.close();
  }
}

await browser.close();
server?.close();

await writeFile(path.join(REPORT_DIR, "report.json"), JSON.stringify(report, null, 2));

const failures = report.results.filter((row) => row.error || row.status !== 200);
const overflow = report.results.filter((row) => row.horizontalOverflow);
const axeRows = report.results.flatMap((row) =>
  (row.axe ?? []).map((violation) => ({ route: row.route, viewport: row.viewport, ...violation })),
);
const consoleRows = report.results.filter((row) => (row.consoleErrors ?? []).length);
const requests = report.results.filter((row) => (row.failedRequests ?? []).length);

console.log(`Pages checked: ${report.results.length} (${routes.length} routes × ${VIEWPORTS.length} viewports)`);
console.log(`Non-200 or crashed: ${failures.length}`);
for (const row of failures.slice(0, 10)) console.log(`  ${row.route} @${row.viewport}: ${row.error ?? row.status}`);
console.log(`Horizontal overflow: ${overflow.length}`);
for (const row of overflow.slice(0, 10)) {
  console.log(`  ${row.route} @${row.viewport}: scrollWidth ${row.scrollWidth} > ${row.clientWidth}`);
  for (const item of row.overflowing ?? []) console.log(`     ${item.tag}.${item.className} right=${item.right} “${item.text}”`);
}
console.log(`Axe violations: ${axeRows.length}`);
const byRule = new Map();
for (const row of axeRows) {
  const entry = byRule.get(row.id) ?? { impact: row.impact, help: row.help, routes: new Set(), nodes: 0 };
  entry.routes.add(`${row.route}@${row.viewport}`);
  entry.nodes += row.nodes;
  byRule.set(row.id, entry);
}
for (const [id, entry] of byRule) {
  console.log(`  [${entry.impact}] ${id}: ${entry.help} — ${entry.nodes} node(s) on ${entry.routes.size} page(s)`);
  console.log(`     e.g. ${[...entry.routes].slice(0, 4).join(", ")}`);
}
console.log(`Console errors: ${consoleRows.length}`);
for (const row of consoleRows.slice(0, 8)) console.log(`  ${row.route} @${row.viewport}: ${row.consoleErrors[0]}`);
console.log(`Failed requests: ${requests.length}`);
for (const row of requests.slice(0, 8)) console.log(`  ${row.route} @${row.viewport}: ${row.failedRequests[0]}`);

const totalProblems =
  failures.length + overflow.length + axeRows.length + consoleRows.length + requests.length;
console.log(totalProblems === 0 ? "RESULT: PASS" : `RESULT: ${totalProblems} finding(s) — see docs/upgrade/qa/report.json`);
