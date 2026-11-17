import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

// Head hygiene for the static export (audit P2-6):
//   - one `<meta name="robots">` per page, because `notFound()` writes its own;
//   - no page inherits the home canonical from the root layout.
// The docs mirror is excluded here; its noindex treatment is T1.2's own test.

const root = resolve(import.meta.dirname, "../..");
const out = join(root, "out");
const DOCS_PREFIX = "learn/fabric/docs/";

// The legacy landing address is a deliberate alias: noindexed, and canonical to
// the home page it duplicates. Nothing else may claim the root canonical.
const ROOT_CANONICAL_ALIASES = new Set(["prototype-c/index.html"]);

function htmlPages(dir) {
  if (!existsSync(dir)) return [];
  const pages = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "_next") continue;
      pages.push(...htmlPages(path));
    } else if (entry.name.endsWith(".html")) {
      pages.push(path);
    }
  }
  return pages;
}

function relOf(path) {
  return relative(out, path).split(sep).join("/");
}

function head(markup, kind) {
  const pattern =
    kind === "robots"
      ? /<meta\b[^>]*\bname="robots"[^>]*>/g
      : /<link\b[^>]*\brel="canonical"[^>]*>/g;
  return [...markup.matchAll(pattern)].map(match => match[0]);
}

function href(tag) {
  return tag?.match(/\bhref="([^"]+)"/)?.[1] ?? null;
}

// Several assertions walk the same hundreds of files; read each exactly once.
const contents = new Map();
function content(path) {
  if (!contents.has(path)) contents.set(path, readFileSync(path, "utf8"));
  return contents.get(path);
}

function origin() {
  const canonical = href(head(content(join(out, "index.html")), "canonical")[0]);
  assert.ok(canonical, "the home page must declare its canonical");
  return new URL(canonical).origin;
}

const pages = htmlPages(out).filter(path => !relOf(path).startsWith(DOCS_PREFIX));

test("the export exists and the docs mirror is excluded", () => {
  assert.ok(existsSync(join(out, "index.html")), "run `npm run build` before `npm run test:all`");
  assert.ok(pages.length > 100, `expected the public export, found ${pages.length} pages`);
  assert.equal(pages.some(path => relOf(path).startsWith(DOCS_PREFIX)), false);
});

test("every exported page has at most one robots meta and one canonical link", () => {
  for (const path of pages) {
    const markup = content(path);
    assert.ok(head(markup, "robots").length <= 1, `${relOf(path)}: duplicate robots meta`);
    assert.ok(head(markup, "canonical").length <= 1, `${relOf(path)}: duplicate canonical link`);
  }
});

test("the 404 routes keep Next's single noindex and nothing else", () => {
  for (const rel of ["404.html", "404/index.html", "_not-found/index.html"]) {
    const path = join(out, ...rel.split("/"));
    if (!existsSync(path)) continue;
    assert.deepEqual(
      head(content(path), "robots"),
      ['<meta name="robots" content="noindex"/>'],
      rel,
    );
  }
});

test("only the home page and its documented alias claim the root canonical", () => {
  const siteRoot = new URL("/", origin()).href;
  for (const path of pages) {
    const rel = relOf(path);
    const canonical = href(head(content(path), "canonical")[0]);
    if (canonical !== siteRoot) continue;
    assert.ok(
      rel === "index.html" || ROOT_CANONICAL_ALIASES.has(rel),
      `${rel}: inherited the root canonical instead of declaring its own`,
    );
  }
});

test("a noindexed page either declares its own canonical or none", () => {
  const siteRoot = new URL("/", origin()).href;
  for (const path of pages) {
    const rel = relOf(path);
    const markup = content(path);
    if (!head(markup, "robots").some(tag => /noindex/.test(tag))) continue;
    const canonical = href(head(markup, "canonical")[0]);
    if (canonical === null) continue;
    const self = new URL(rel.replace(/index\.html$/, ""), siteRoot).href;
    assert.ok(
      canonical === self || (canonical === siteRoot && ROOT_CANONICAL_ALIASES.has(rel)),
      `${rel}: noindex canonical points at ${canonical}`,
    );
  }
});
