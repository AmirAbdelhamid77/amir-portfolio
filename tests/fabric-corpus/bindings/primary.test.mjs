// FC06 — primary binding coverage and target validity.
//
//   node --experimental-strip-types --test tests/fabric-corpus/bindings/
//
// (a) every published registry articleId has exactly ONE primary binding, and
//     ONLY published articles are bound — the 92 fail-closed exclusions are
//     absent;
// (b) every binding target is a valid subject.topic pair per the live
//     taxonomy (lib/study/taxonomy.ts imported with strip-types).

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  bindings,
  collections,
  primary,
  secondary,
  registry,
  REGISTRY_AVAILABLE,
  publishedArticles,
  fabricTopicIds,
  validTargets,
} from "./helpers.mjs";

const published = REGISTRY_AVAILABLE ? publishedArticles() : new Map();
const boundIds = primary.rows.map((row) => row.articleId);

test("every published article has exactly one primary binding", (t) => {
  if (!REGISTRY_AVAILABLE) t.skip("registry not built yet");
  assert.equal(primary.schema, "hansa.fabric-bindings-primary/1");
  assert.equal(
    primary.rows.length,
    published.size,
    `primary rows (${primary.rows.length}) must equal published articles (${published.size})`,
  );
  assert.equal(new Set(boundIds).size, boundIds.length, "an articleId may appear in only one primary row");
  for (const articleId of published.keys()) {
    assert.ok(boundIds.includes(articleId), `published article ${articleId} is not bound`);
    const rows = primary.rows.filter((row) => row.articleId === articleId);
    assert.equal(rows.length, 1, `${articleId} must have exactly one primary binding`);
    const viaLoader = bindings.getPrimaryBinding(articleId);
    assert.ok(viaLoader, `loader must resolve ${articleId}`);
    assert.equal(viaLoader.topic, rows[0].topic, `loader/file disagreement for ${articleId}`);
  }
});

test("only published articles are bound: the 92 excluded articleIds are absent", (t) => {
  if (!REGISTRY_AVAILABLE) t.skip("registry not built yet");
  const boundSet = new Set(boundIds);
  assert.equal(
    primary.counts.heldTotal,
    registry.excluded.length,
    "held total in primary.json must match the registry's excluded list",
  );
  for (const row of registry.excluded) {
    assert.ok(!boundSet.has(row.articleId), `excluded article ${row.articleId} must not be bound`);
  }
  assert.deepEqual(
    [...primary.held.articleIds].sort(),
    registry.excluded.map((row) => row.articleId).sort(),
    "primary.json held.articleIds must mirror the registry exclusions",
  );
  const extra = [...boundSet].filter((id) => !published.has(id));
  assert.deepEqual(extra, [], "no bindings may exist for unpublished articles");
});

test("binding ids follow the LearningBinding scheme and match their rows", (t) => {
  for (const row of primary.rows) {
    assert.equal(
      row.bindingId,
      `lb:${row.articleId}@${row.subject}.${row.topic}`,
      `bindingId malformed for ${row.articleId}`,
    );
    assert.equal(row.subject, "fabric", "primary bindings target the fabric subject");
    assert.ok(["primary"].includes(row.role));
  }
});

test("primary rows carry faithful route-registry denormalizations", (t) => {
  if (!REGISTRY_AVAILABLE) t.skip("registry not built yet");
  for (const row of primary.rows) {
    const article = published.get(row.articleId);
    assert.ok(article, `row ${row.articleId} has no registry row`);
    assert.equal(row.title, article.title, `title drift for ${row.articleId}`);
    assert.equal(row.logicalPath, article.logicalPath, `logicalPath drift for ${row.articleId}`);
    assert.equal(row.sourcePath, article.sourcePath, `sourcePath drift for ${row.articleId}`);
    assert.equal(row.family, article.family, `family drift for ${row.articleId}`);
    assert.equal(row.slug, article.slug, `slug drift for ${row.articleId}`);
  }
});

test("all binding targets are valid subject.topic pairs per the taxonomy", () => {
  const targets = validTargets();
  const fabricTopics = fabricTopicIds();
  for (const row of primary.rows) {
    assert.ok(
      fabricTopics.has(row.topic),
      `primary row ${row.articleId} targets unknown fabric topic '${row.topic}'`,
    );
    assert.ok(targets.has(`${row.subject}.${row.topic}`), `invalid target ${row.subject}.${row.topic}`);
  }
  for (const row of secondary.rows) {
    assert.ok(
      targets.has(`${row.subject}.${row.topic}`),
      `secondary row ${row.articleId} targets unknown ${row.subject}.${row.topic}`,
    );
  }
  assert.equal(
    primary.counts.primary,
    primary.rows.length,
    "primary.json counts.primary must equal the row count",
  );
  // Per-topic counts must match the rows.
  const byTopic = {};
  for (const row of primary.rows) byTopic[row.topic] = (byTopic[row.topic] ?? 0) + 1;
  assert.deepEqual(primary.counts.byTopic, byTopic);
  // Every documented family→topic rule must name a valid topic.
  for (const entry of primary.familyTopicMap) {
    assert.ok(fabricTopics.has(entry.topic), `family map rule for ${entry.family} targets unknown topic`);
    assert.ok(entry.rationale && entry.rationale.length > 0, `family ${entry.family} needs a rationale`);
  }
  // Collections must reference only real fabric topics too.
  for (const collection of collections.collections) {
    assert.ok(fabricTopics.has(collection.topic), `collection ${collection.id} has an unknown topic`);
  }
});
