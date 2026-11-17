import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

// PRODUCT.md §3: one lockup — "Hansa" with the fixed sub-line "by Amir
// Abdelhamid" — and page titles `<Page> - Hansa`. The author stays in
// `authors`/`creator`/JSON-LD, not in every browser tab or route-dependent
// label. The island nav is deliberately out of scope for this guard.

const root = resolve(import.meta.dirname, "../..");
const out = join(root, "out");

const DOCS_PREFIX = "learn/fabric/docs/";

// `title.absolute`: the home names the product itself, and the legacy landing
// address is the documented alias that renders the same page.
const ABSOLUTE_TITLES = new Set(["index.html", "prototype-c/index.html"]);

function source(path) {
  return readFileSync(join(root, path), "utf8");
}

function relOf(path) {
  return relative(out, path).split(sep).join("/");
}

// Only Next-rendered routes: every route ends in `index.html` (plus the root
// 404). Recovered documents exported verbatim under `/work/storytelling/` and
// `/study-hub/` keep their own titles by design.
function routePages(dir) {
  if (!existsSync(dir)) return [];
  const pages = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "_next") continue;
      pages.push(...routePages(path));
    } else if (entry.name === "index.html") {
      pages.push(path);
    }
  }
  return pages;
}

function title(path) {
  return readFileSync(path, "utf8").match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
}

test("the layout owns one title template and keeps the author in metadata", () => {
  const layout = source("app/layout.tsx");
  assert.match(layout, /template:\s*`%s - \$\{SITE\.brand\}`/, "title template");
  assert.match(layout, /authors:\s*\[\{\s*name:\s*SITE\.name/, "authors");
  assert.match(layout, /creator:\s*SITE\.name/, "creator");
});

test("the header and footer render the fixed lockup, not route initials", () => {
  for (const path of ["components/site-header.tsx", "components/site-footer.tsx"]) {
    const file = source(path);
    assert.ok(file.includes("SITE.brand"), `${path}: brand`);
    assert.ok(file.includes("SITE.byline"), `${path}: byline`);
    assert.ok(!/>\s*AA\s*</.test(file), `${path}: still renders an AA mark`);
    assert.ok(!file.includes("Amir Abdelhamid"), `${path}: hard-coded author lockup`);
  }
});

test("every route title ends with the brand exactly once", () => {
  assert.ok(existsSync(join(out, "index.html")), "run `npm run build` before `npm run test:all`");

  const pages = routePages(out)
    .filter(path => !relOf(path).startsWith(DOCS_PREFIX))
    .concat(existsSync(join(out, "404.html")) ? [join(out, "404.html")] : []);
  assert.ok(pages.length > 100, `expected the route export, found ${pages.length} pages`);

  for (const path of pages) {
    const rel = relOf(path);
    const value = title(path);
    assert.ok(value, `${rel}: missing title`);
    assert.ok(!value.includes("Amir Abdelhamid"), `${rel}: author in ${value}`);
    assert.ok(!/Hansa\s*[-\u2014]\s*Hansa/.test(value), `${rel}: brand repeated in ${value}`);
    if (ABSOLUTE_TITLES.has(rel)) continue;
    assert.ok(value.endsWith(" - Hansa"), `${rel}: ${value}`);
    assert.equal(value.match(/Hansa/g)?.length, 1, `${rel}: brand repeated in ${value}`);
  }

  assert.equal(
    title(join(out, "index.html")),
    "Hansa \u2014 interactive data learning and knowledge",
  );
});
