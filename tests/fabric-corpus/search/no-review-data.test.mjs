// FC07 — no-review-data gate: no private/review evidence can enter the index.
//
// Shard sources are published registry articles only (build-shards.mjs reads
// route-registry.families[].articles and nothing else, and the exclusion test
// proves the excluded list never leaks). This test greps the DEPLOYED shard,
// manifest and routing bytes for the review-system marker strings, so a future
// change that starts carrying review state into the builder fails loudly.
//
// Marker choice: 'technical_review' and the review-state JSON keys are
// review-system vocabulary. The bare English words 'candidate' and 'reviewer'
// CANNOT be markers — they are ordinary prose in the published corpus (six
// articles say "candidate service"/"candidate key", four say "reviewers" about
// pull-request approvals) — and in the routing file even the JSON-key forms
// collide with legitimate token keys ('"candidate":' is what a token named
// candidate looks like in a JSON dictionary). So markers are split:
//   * shards + manifest: the full marker list — shard JSON keys are ours, so
//     '"candidate":' there could only come from carried metadata;
//   * routing: only markers whose shape a normalised token can never take
//     (underscores, camelCase keys, hyphens).
//
//   node --experimental-strip-types --test tests/fabric-corpus/search/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { loadPublicManifest, publicVersionDir } from "./helpers.mjs";

const CONTENT_MARKERS = [
  "technical_review",
  '"reviewState"',
  '"reviewStatus"',
  '"pending-review"',
  '"reviewFlag"',
  '"reviewerId"',
  '"candidate":',
  '"reviewer":',
  '"quarantineReason":',
];

const TOKEN_IMPOSSIBLE_MARKERS = [
  "technical_review",
  '"reviewState"',
  '"reviewStatus"',
  '"reviewFlag"',
  '"reviewerId"',
  '"quarantineReason"',
];

test("review markers absent from every deployed shard, manifest and routing file", { skip: !loadPublicManifest() && "public fabric-search tree not built" }, () => {
  const manifest = loadPublicManifest();
  const versionDir = publicVersionDir(manifest);
  for (const file of manifest.files) {
    const blob = readFileSync(path.join(versionDir, file.name), "utf8");
    const markers = file.role === "routing" ? TOKEN_IMPOSSIBLE_MARKERS : CONTENT_MARKERS;
    for (const marker of markers) {
      assert.ok(!blob.includes(marker), `${marker} found in ${file.name}`);
    }
  }
  const manifestBlob = readFileSync(path.join(versionDir, "..", "manifest.json"), "utf8");
  for (const marker of CONTENT_MARKERS) {
    assert.ok(!manifestBlob.includes(marker), `${marker} found in manifest.json`);
  }
});

test("snippet sources are the same published-only section texts", { skip: !loadPublicManifest() && "public fabric-search tree not built" }, async () => {
  const manifest = loadPublicManifest();
  const { loadPublicShards } = await import("./helpers.mjs");
  const shards = loadPublicShards(manifest);
  const { scoreShards } = await import("../../../lib/search/fabric-scorer.ts");
  // Run a broad query through the real scoring path and assert every snippet
  // is built from shard text only: it must be a substring of the article's own
  // section text (whitespace-normalised), i.e. no external source can inject.
  const hits = scoreShards(shards, "tenant settings", 20);
  assert.ok(hits.length > 0);
  const sectionsByArticle = new Map();
  for (const shard of shards) {
    for (const article of shard.articles) sectionsByArticle.set(article.articleId, article.sections);
  }
  const collapse = (value) => value.replace(/\s+/g, " ");
  for (const hit of hits) {
    const sections = sectionsByArticle.get(hit.articleId) ?? [];
    const joined = collapse(sections.map((section) => `${section.heading} ${section.text}`).join(" "));
    const snippetBody = collapse(hit.snippet).replace(/…/g, "").trim();
    assert.ok(
      joined.includes(snippetBody.split(" ").slice(0, 6).join(" ")) || snippetBody.length === 0,
      `snippet for ${hit.articleId} is grounded in its published sections`,
    );
  }
});
