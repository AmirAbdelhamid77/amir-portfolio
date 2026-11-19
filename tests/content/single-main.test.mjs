// R5: one <main> landmark per page.
//
// `app/layout.tsx` renders the site's single <main id="main">. Eight page
// templates rendered a second <main id="main"> inside it, so those pages had
// two landmarks and a duplicate id. The layout owns the landmark; a page uses
// <div> or <section>. This test keeps that contract in the source and in the
// built export, including the pages whose route is not in the sitemap.
//
//   npm run test:content   (after `npm run build`)
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const out = join(root, "out");

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, files);
    else if (name.endsWith(".tsx")) files.push(path);
  }
  return files;
}

function withoutComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "");
}

const count = (text, pattern) => (text.match(pattern) ?? []).length;

test("the shared layout owns the single main landmark", () => {
  const layout = withoutComments(readFileSync(join(root, "app/layout.tsx"), "utf8"));
  assert.equal(count(layout, /<main\b/g), 1, "the layout must render exactly one <main>");
  assert.match(layout, /<main id="main"/, "the layout's main must carry id=main");
});

test("no page or component renders its own main landmark", () => {
  const files = [
    ...walk(join(root, "app")),
    ...walk(join(root, "components")),
  ];
  const offenders = [];
  for (const path of files) {
    if (relative(root, path).replaceAll("\\", "/") === "app/layout.tsx") continue;
    const source = withoutComments(readFileSync(path, "utf8"));
    if (count(source, /<main\b/g) > 0 || count(source, /<\/main>/g) > 0) {
      offenders.push(relative(root, path).replaceAll("\\", "/"));
    }
  }
  assert.deepEqual(offenders, [], "these files render a second <main>; use <div> or <section>");
});

function hasOneMain(html, label) {
  assert.equal(count(html, /<main\b/g), 1, `${label}: expected one <main>, found ${count(html, /<main\b/g)}`);
  assert.equal(count(html, /<\/main>/g), 1, `${label}: expected one </main>`);
  assert.equal(count(html, /id="main"/g), 1, `${label}: expected one id="main"`);
}

function readBuilt(rel, label) {
  const path = join(out, ...rel.split("/"));
  assert.ok(existsSync(path), `${label}: missing ${rel}; run \`npm run build\``);
  hasOneMain(readFileSync(path, "utf8"), label);
}

test("the built pages that used to add a second main render exactly one", () => {
  const routes = [
    "/work/storytelling/",
    "/content-index/",
    "/atlas-records/",
    "/held-articles/",
    "/insight-records/",
    "/patterns/",
    "/practice/draft-banks/",
  ];
  for (const route of routes) {
    readBuilt(`${route.slice(1)}index.html`, route);
  }

  const labs = readdirSync(join(out, "lab/rti")).filter(name =>
    statSync(join(out, "lab/rti", name)).isDirectory(),
  );
  assert.ok(labs.length >= 1, "expected the RTI lab pages in the export");
  for (const lab of labs) readBuilt(`lab/rti/${lab}/index.html`, `/lab/rti/${lab}/`);
});

test("every sampled built page keeps one main and one id=main", () => {
  // `review` is a local, fail-closed design-review route: without its flag it
  // exports Next's not-found shell, which has no page landmark by design.
  // `storytelling` holds copied standalone case documents, not layout pages;
  // the route under `work/storytelling` is checked above.
  const skip = new Set(["_next", "fabric-aliases", "fabric-additions", "fabric-docs-assets", "fabric-search", "learn", "review", "storytelling", "content", "images", "media", "graph", "data-viz"]);
  const pages = [];
  function collect(dir) {
    for (const name of readdirSync(dir)) {
      if (skip.has(name)) continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) collect(path);
      // Route pages export as `index.html`; standalone copied documents in the
      // same tree are not layout pages and are out of this contract.
      else if (name === "index.html") pages.push(path);
    }
  }
  collect(out);
  assert.ok(pages.length > 150, `expected the route export, found ${pages.length} pages`);
  for (const page of pages) {
    hasOneMain(readFileSync(page, "utf8"), relative(out, page).replaceAll("\\", "/"));
  }
  readBuilt("404.html", "/404.html");

  // The Learn tree is the largest (imported corpus articles). Check its subject
  // and lesson homes plus a sample spread across the deeper articles.
  const learn = join(out, "learn");
  const learnPages = [join(learn, "index.html")];
  for (const name of readdirSync(learn)) {
    const path = join(learn, name);
    if (statSync(path).isDirectory()) {
      const index = join(path, "index.html");
      if (existsSync(index)) learnPages.push(index);
    }
  }
  const deep = [];
  function collectDeep(dir) {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) collectDeep(path);
      else if (name.endsWith(".html")) deep.push(path);
    }
  }
  collectDeep(learn);
  const step = Math.max(1, Math.floor(deep.length / 12));
  for (let index = 0; index < deep.length; index += step) learnPages.push(deep[index]);

  for (const page of learnPages) {
    hasOneMain(readFileSync(page, "utf8"), relative(out, page).replaceAll("\\", "/"));
  }
});
