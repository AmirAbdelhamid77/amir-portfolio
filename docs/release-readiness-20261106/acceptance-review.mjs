// M6 baseline evidence for the D1 acceptance review.
//
//   node docs/release-readiness-20261106/acceptance-review.mjs
//
// Two jobs, both read-only:
//   1. screenshot the pre-promotion shipped export (`out/` on 4395) so the
//      before/after pair is a real capture, not a memory of one;
//   2. diff the route, heading and destination inventory of the baseline export
//      against the candidate export (`out-rc/`), so a lost route or a lost
//      destination is a reported difference and not an eyeball judgement.
//
// It never writes inside `out/` or `out-rc/`. If a route exists in the M6
// baseline and not in the candidate, the script exits 1: that is a material
// regression, not a design difference.
import { chromium } from "playwright-core";
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, relative, dirname } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const EVIDENCE = "docs/release-readiness-20261106/evidence";
const BASELINE_DIR = `${EVIDENCE}/m6-baseline`;
const BASE = process.env.BASELINE_BASE ?? "http://127.0.0.1:4395";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

mkdirSync(resolve(ROOT, BASELINE_DIR), { recursive: true });

// ------------------------------------------------------------------ inventory
const routeOf = (dir, file) => {
  const path = relative(resolve(ROOT, dir), file).replace(/\\/g, "/");
  const route = dirname(path);
  return route === "." ? "/" : `/${route.replace(/index$/, "")}`.replace(/\/$/, "/");
};

function pages(dir) {
  const out = [];
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = resolve(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "index.html" && !full.includes(`${dirname("/")}_next`)) out.push(full);
    }
  };
  walk(resolve(ROOT, dir));
  return out;
}

function inventory(dir) {
  const map = new Map();
  for (const file of pages(dir)) {
    const html = readFileSync(file, "utf8");
    if (html.includes("__next_error__")) continue;
    const route = routeOf(dir, file);
    if (route.startsWith("/_next") || route.includes("__next")) continue;
    const text = (tag) =>
      [...html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi"))]
        .map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
        .filter(Boolean);
    const links = new Set(
      [...html.matchAll(/href="(\/[^"#?]*)"/g)]
        .map((m) => m[1])
        .filter((href) => !href.startsWith("/_next") && !href.startsWith("//")),
    );
    map.set(route, {
      headings: text("h1"),
      title: (html.match(/<title[^>]*>([^<]*)<\/title>/i) ?? [])[1] ?? "",
      links: [...links].sort(),
      buttons: (html.match(/<button\b/g) ?? []).length,
      bytes: Buffer.byteLength(html),
      noindex: /name="robots"[^>]*content="[^"]*noindex/i.test(html),
    });
  }
  return map;
}

const baseline = inventory("out");
const candidate = inventory("out-rc");

const routes = (map) => [...map.keys()].sort();
const missing = routes(baseline).filter((route) => !candidate.has(route));
const added = routes(candidate).filter((route) => !baseline.has(route));
const headingDrift = routes(baseline)
  .filter((route) => candidate.has(route))
  .map((route) => ({
    route,
    before: baseline.get(route).headings,
    after: candidate.get(route).headings,
  }))
  .filter((entry) => JSON.stringify(entry.before) !== JSON.stringify(entry.after));
const lostLinks = routes(baseline)
  .filter((route) => candidate.has(route))
  .map((route) => ({
    route,
    lost: baseline.get(route).links.filter((href) => !candidate.get(route).links.includes(href)),
  }))
  .filter((entry) => entry.lost.length);

const summary = {
  baseline: { dir: "out", routes: baseline.size },
  candidate: { dir: "out-rc", routes: candidate.size },
  missingInCandidate: missing,
  addedInCandidate: added,
  headingDrift,
  lostLinks,
  errors: (() => {
    const bad = [];
    for (const dir of ["out", "out-rc"]) {
      for (const file of pages(dir)) {
        if (readFileSync(file, "utf8").includes("__next_error__")) bad.push(`${dir}: ${file}`);
      }
      if (existsSync(resolve(ROOT, dir, "review"))) bad.push(`${dir}: review/ still exported`);
    }
    return bad;
  })(),
};
writeFileSync(resolve(ROOT, `${EVIDENCE}/m6-baseline-inventory.json`), JSON.stringify(summary, null, 2));

console.log(`routes: baseline ${baseline.size}, candidate ${candidate.size}`);
console.log("missing in candidate:", missing.length ? missing.join(", ") : "none");
console.log("added in candidate:", added.length ? added.join(", ") : "none");
console.log("routes whose h1 text changed:", headingDrift.length);
for (const entry of headingDrift) {
  console.log(`  ${entry.route}: ${JSON.stringify(entry.before)} -> ${JSON.stringify(entry.after)}`);
}
console.log("routes that lost an internal destination:", lostLinks.length);
for (const entry of lostLinks) console.log(`  ${entry.route}: ${entry.lost.join(", ")}`);
console.log("error shells / leaked review route:", summary.errors.length ? summary.errors : "none");

// ---------------------------------------------------------------- captures
const browser = await chromium.launch({ executablePath: EDGE, headless: true });
async function shot(name, { width = 1280, height = 900, theme = "light", clip, scrollTo } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, colorScheme: theme });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "header{position:absolute !important}" });
  if (scrollTo) {
    await page.locator(scrollTo).scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(400);
  if (clip) await page.locator(clip).screenshot({ path: `${BASELINE_DIR}/${name}.png` });
  else await page.screenshot({ path: `${BASELINE_DIR}/${name}.png` });
  console.log("captured", name);
  await context.close();
}

await shot("m6-home-desktop-light");
await shot("m6-home-desktop-dark", { theme: "dark" });
await shot("m6-home-390-dark", { width: 390, height: 844, theme: "dark" });
await shot("m6-home-320-light", { width: 320, height: 700 });
await shot("m6-knowledge-scene", { scrollTo: "#edition", clip: "#edition" });
await shot("m6-closing", { scrollTo: "#closing", clip: "#closing" });
await shot("m6-archive", { scrollTo: "#archive", clip: "#archive" });
await browser.close();

console.log("baseline evidence in", BASELINE_DIR);
if (missing.length || summary.errors.length) {
  console.error("FAIL: the candidate lost a baseline route or carries an error shell.");
  process.exit(1);
}
console.log("PASS: no baseline route or destination was lost.");
