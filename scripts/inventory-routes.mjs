// Builds a machine-readable inventory of the static export: routes, titles,
// headings, deep-link anchors and internal links.
//
// Run it after `npm run build` (it reads `out/`):
//   node scripts/inventory-routes.mjs [output.json]
//
// The point is regression evidence, not reporting: keep one snapshot from
// before a migration and compare it afterwards with compare-inventory.mjs so a
// moved route or dropped anchor fails loudly instead of being noticed by a
// reader. Same script, same shape, both sides of the comparison.
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { parse } from "node-html-parser";

const OUT = path.resolve("out");
const outputPath = process.argv[2] ? path.resolve(process.argv[2]) : null;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

function routeFor(file) {
  const relative = path.relative(OUT, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return "/404.html";
  if (relative.endsWith("/index.html")) {
    return `/${relative.slice(0, -"/index.html".length)}/`;
  }
  return `/${relative}`;
}

/** Anchors a reader could plausibly link to: sections plus headings. */
function anchorsOf(root) {
  const anchors = new Set();
  for (const node of root.querySelectorAll("[id]")) {
    const id = node.getAttribute("id");
    if (!id) continue;
    const tag = node.rawTagName?.toLowerCase() ?? "";
    const isHeading = /^h[1-6]$/.test(tag);
    const isSection = tag === "section" || tag === "article" || tag === "details";
    if (isHeading || isSection || /^s\d+/.test(id)) anchors.add(id);
  }
  return [...anchors].sort();
}

const files = [];
for await (const file of walk(OUT)) {
  if (file.endsWith(".html")) files.push(file);
}

const routes = [];
const seen = new Set();

for (const file of files.sort()) {
  const route = routeFor(file);
  // Segment payload aliases are copies, not routes.
  if (route.includes("__next.") || route.startsWith("/_next/")) continue;
  if (seen.has(route)) continue;
  seen.add(route);

  const html = await readFile(file, "utf8");
  const root = parse(html);
  const title = root.querySelector("title")?.text.trim() ?? "";
  const h1 = root.querySelector("h1")?.text.replace(/\s+/g, " ").trim() ?? "";
  const description =
    root.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
  const canonical =
    root.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "";
  const headings = root
    .querySelectorAll("h2, h3")
    .map((node) => node.text.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const internalLinks = [
    ...new Set(
      root
        .querySelectorAll("a[href]")
        .map((node) => node.getAttribute("href") ?? "")
        .filter((href) => href.startsWith("/") && !href.startsWith("//")),
    ),
  ].sort();

  routes.push({
    route,
    title,
    h1,
    descriptionPresent: Boolean(description),
    canonical,
    anchors: anchorsOf(root),
    headingCount: headings.length,
    // Titles of level-2/3 headings make heading-hierarchy regressions visible
    // without storing every paragraph of a 500 KB page.
    headings: headings.slice(0, 400),
    internalLinks,
    bytes: html.length,
    sha256: createHash("sha256").update(html).digest("hex"),
  });
}

const inventory = {
  generatedAt: new Date().toISOString(),
  source: "out/ (next build static export)",
  routeCount: routes.length,
  routes,
};

const text = JSON.stringify(inventory, null, 2);
if (outputPath) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, text);
  console.log(`Route inventory: ${routes.length} routes → ${outputPath}`);
} else {
  console.log(`Route inventory: ${routes.length} routes`);
  console.log(text.slice(0, 2000));
}
