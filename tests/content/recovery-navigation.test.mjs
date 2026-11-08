import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { register } from "node:module";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
register("../../scripts/study-loader.mjs", import.meta.url);
// Node ESM requires the package subpath extension; Next's bundler resolves it.
register("data:text/javascript," + encodeURIComponent('export async function resolve(s,c,next){return next(s === "next/link" ? "next/link.js" : s,c);}'), import.meta.url);
const { COLLECTION_CONTEXTS, COLLECTION_DESTINATIONS, collectionDestinations } = await import("../../lib/recovery/navigation.ts");
const { CollectionShelf } = await import("../../components/learn/collection-shelf.tsx");
const read = p => readFileSync(p, "utf8");

test("collection links have unique stable IDs and real existing destinations", () => {
  assert.equal(new Set(COLLECTION_DESTINATIONS.map(row => row.id)).size, COLLECTION_DESTINATIONS.length);
  for (const row of COLLECTION_DESTINATIONS) {
    assert.match(row.href, /^\/(?!\/)/);
    assert.ok(existsSync(`app${row.href}page.tsx`) || existsSync(`public${row.href}`), row.href);
    assert.ok(row.status && row.description && row.contexts.length);
    for (const context of row.contexts) assert.ok(Object.hasOwn(COLLECTION_CONTEXTS, context));
  }
});
test("every contextual shelf renders actual links and explicit review limitations without JS", () => {
  for (const context of Object.keys(COLLECTION_CONTEXTS)) {
    const html = renderToStaticMarkup(createElement(CollectionShelf, { context }));
    assert.ok(html.includes(`aria-labelledby="collections-${context}"`));
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1].replace(/\/$/, ""));
    for (const row of collectionDestinations(context)) {
      assert.ok(hrefs.includes(row.href.replace(/\/$/, "")), `${context}: ${row.href}`);
      assert.ok(html.includes(row.status), row.id);
    }
    assert.ok(!html.includes("<button"), "ordinary navigation needs no scripted controls");
  }
});
test("primary Practice catalogue renders the ungraded/restricted collections", () => {
  assert.match(read("app/practice/catalogue/page.tsx"), /StudyDirectory practice/);
  assert.match(read("components/study/directory.tsx"), /practice && !subject \? <CollectionShelf context="practice"/);
  const rows = collectionDestinations("practice");
  assert.ok(rows.some(row => row.href === "/practice/draft-banks/" && /ungraded.*metadata only/.test(row.status)));
  assert.ok(rows.every(row => !/PRIVATE_QA|intake-private/.test(row.href)));
});
test("Learn, Fabric and Atlas carry contextual discovery without changing semantic publication", () => {
  assert.match(read("components/learn/curriculum-home.tsx"), /CollectionShelf context="learn"/);
  assert.match(read("app/learn/fabric/page.tsx"), /CollectionShelf context="fabric"/);
  assert.match(read("app/learn/dp-600/atlas/page.tsx"), /CollectionShelf context="atlas"/);
  assert.ok(collectionDestinations("atlas").every(row => /review|hold/i.test(row.status)));
});
test("labs and original visualization navigation use their actual destinations", () => {
  const home = read("components/learn/curriculum-home.tsx");
  assert.match(home, /href: "\/explore\/"/);
  assert.match(home, /label: "Open visualization labs"/);
  assert.match(read("components/study/directory.tsx"), /href="\/learn\/visualization\/">Data visualization course/);
});
test("content index has real backlog and topic anchors and distinguishes curation from missing integration", () => {
  const index = read("app/content-index/page.tsx");
  assert.match(index, /id="backlog"/);
  assert.match(read("components/learn/curriculum-home.tsx"), /id="topics"/);
  assert.ok(!index.includes("Integrated (renderer gap tracked)"));
  assert.match(index, /references\.duplicates/);
  for (const [file, key] of [["references", "rejections"], ["experiments", "heldBack"]]) {
    const { meta } = JSON.parse(read(`content/study/${file}.json`));
    assert.equal(meta.curated + Object.values(meta[key]).reduce((sum, n) => sum + n, 0), meta.input);
  }
});
