// Verifies a deployed site against a frozen route inventory.
//
//   node scripts/verify-production.mjs --base https://hansa.amir-portfolio.workers.dev --inventory docs/upgrade/baseline-2026-10-24/route-inventory.json --out docs/upgrade/qa/production-before.json
//
// For every route in the inventory it records the status, the <title>, the byte
// size and a cache-busted content hash. Run it before a deploy and again after:
// the diff is the "no public deep link broke" evidence, measured against the live
// host rather than the build directory.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};

const BASE = (arg("base", "https://hansa.amir-portfolio.workers.dev")).replace(/\/+$/, "");
const inventoryPath = arg("inventory", "docs/upgrade/baseline-2026-10-24/route-inventory.json");
const outPath = arg("out", null);
const CONCURRENCY = Number(arg("concurrency", "6"));

const inventory = JSON.parse(await readFile(path.resolve(inventoryPath), "utf8"));
const routes = inventory.routes.map((entry) => entry.route);
// Framework files that are not reader-facing pages.
const SKIP = new Set(["/404.html", "/_not-found/"]);

async function fetchRoute(route) {
  const url = `${BASE}${route}${route.includes("?") ? "&" : "?"}__probe=${Date.now()}`;
  try {
    const response = await fetch(url, { redirect: "follow", headers: { "cache-control": "no-cache" } });
    const text = await response.text();
    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(text)?.[1]?.trim() ?? "";
    return {
      route,
      status: response.status,
      title: title.slice(0, 120),
      bytes: Buffer.byteLength(text),
      hash: createHash("sha256").update(text).digest("hex").slice(0, 16),
    };
  } catch (error) {
    return { route, status: 0, error: String(error?.message ?? error) };
  }
}

const queue = routes.filter((route) => !SKIP.has(route));
const results = [];
async function worker() {
  while (queue.length) {
    const route = queue.shift();
    if (route === undefined) return;
    results.push(await fetchRoute(route));
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
results.sort((a, b) => a.route.localeCompare(b.route));

const summary = {
  base: BASE,
  generatedAt: new Date().toISOString(),
  checked: results.length,
  ok: results.filter((row) => row.status === 200).length,
  redirected: results.filter((row) => row.status >= 300 && row.status < 400).length,
  notFound: results.filter((row) => row.status === 404).length,
  errors: results.filter((row) => row.status === 0).length,
  other: results.filter((row) => row.status !== 200 && row.status !== 404 && row.status !== 0 && !(row.status >= 300 && row.status < 400)).length,
  routes: results,
};

console.log(`Base: ${BASE}`);
console.log(`Checked ${summary.checked} routes — 200: ${summary.ok}, 404: ${summary.notFound}, errors: ${summary.errors}, other: ${summary.other}`);
for (const row of results.filter((item) => item.status !== 200)) {
  console.log(`  ${row.status} ${row.route}${row.error ? ` (${row.error})` : ""}`);
}

if (outPath) {
  await mkdir(path.dirname(path.resolve(outPath)), { recursive: true });
  await writeFile(path.resolve(outPath), JSON.stringify(summary, null, 2));
  console.log(`Written → ${outPath}`);
}
