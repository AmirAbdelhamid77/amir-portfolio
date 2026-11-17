import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

// T1.2 / PRODUCT.md §5: the pinned Microsoft Fabric documentation mirror is
// readable, attributed and searchable, but it is a mirror — not this site's
// original material — so every page stays out of the search index while the
// links still work. The assertion runs over the built export, not the source.

const root = resolve(import.meta.dirname, "../../..");
const out = join(root, "out");
const docs = join(out, "learn", "fabric", "docs");

function htmlPages(dir) {
  if (!existsSync(dir)) return [];
  const pages = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) pages.push(...htmlPages(path));
    else if (entry.name === "index.html") pages.push(path);
  }
  return pages;
}

const pages = htmlPages(docs);

test("the docs mirror is a complete static export", () => {
  assert.ok(existsSync(join(out, "index.html")), "run `npm run build` before `npm run test:all`");
  assert.ok(pages.length > 2700, `expected the 2,716-article mirror, found ${pages.length} pages`);
});

test("every docs page is noindex, follow and keeps its own canonical and attribution", () => {
  let articles = 0;
  for (const path of pages) {
    const rel = relative(out, path).split(sep).join("/");
    const html = readFileSync(path, "utf8");

    const robots = [...html.matchAll(/<meta\b[^>]*\bname="robots"[^>]*>/g)].map(match => match[0]);
    assert.equal(robots.length, 1, `${rel}: ${robots.length} robots tags`);
    assert.match(robots[0], /content="noindex, follow"/, rel);

    const canonical = [...html.matchAll(/<link\b[^>]*\brel="canonical"[^>]*>/g)].map(match => match[0]);
    assert.equal(canonical.length, 1, `${rel}: ${canonical.length} canonical links`);
    assert.match(canonical[0], /href="https:\/\/[^"]+\/learn\/fabric\/docs\//, rel);

    if (rel === "learn/fabric/docs/index.html") continue;
    articles += 1;
    assert.ok(html.includes("Content available under"), `${rel}: missing rights note`);
    assert.ok(html.includes("CC BY 4.0"), `${rel}: missing license`);
    assert.ok(html.includes("https://learn.microsoft.com/en-us/fabric/"), `${rel}: missing upstream link`);
  }
  assert.equal(articles, 2716, `expected 2,716 articles, found ${articles}`);
});

test("the sitemap lists no docs page", () => {
  const sitemap = readFileSync(join(out, "sitemap.xml"), "utf8");
  assert.ok(!sitemap.includes("/learn/fabric/docs/"), "docs mirror leaked into the sitemap");
  assert.ok(sitemap.includes("/learn/fabric-rti/"), "the curated Fabric lessons stay indexed");
});

test("the pinned corpus stays in the in-site Fabric search", () => {
  const manifest = JSON.parse(readFileSync(join(out, "fabric-search", "manifest.json"), "utf8"));
  assert.equal(manifest.schema, "hansa.fabric-search-manifest/1");
  assert.equal(manifest.articleCount, 2716);
  assert.equal(manifest.shardCount, 104);
  assert.equal(manifest.families.length, 22);

  const shardFile = manifest.files.find(entry => entry.role === "shard").name;
  const shard = JSON.parse(
    readFileSync(join(out, "fabric-search", manifest.version, shardFile), "utf8"),
  );
  assert.equal(shard.schema, "hansa.fabric-search-shard/1");
  assert.ok(
    shard.articles.some(article => article.logicalPath.startsWith("/learn/fabric/docs/")),
    "a shard must carry docs routes",
  );
});
