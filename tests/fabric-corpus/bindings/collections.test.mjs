// FC06 — reading collections integrity.
//
//   node --experimental-strip-types --test tests/fabric-corpus/bindings/
//
// (d) collections cover every topic that has bound articles; each topic's
//     collections PARTITION that topic's bound articles; every collection
//     articleId resolves to a primary binding of the same topic; counts are
//     consistent and articleIds are sorted.

import assert from "node:assert/strict";
import { test } from "node:test";

import { bindings, collections, primary } from "./helpers.mjs";

function boundByTopic() {
  const map = new Map();
  for (const row of primary.rows) {
    if (!map.has(row.topic)) map.set(row.topic, new Set());
    map.get(row.topic).add(row.articleId);
  }
  return map;
}

test("every topic with bound articles has at least one collection", () => {
  const bound = boundByTopic();
  const collectionTopics = new Set(collections.collections.map((collection) => collection.topic));
  for (const topic of bound.keys()) {
    assert.ok(collectionTopics.has(topic), `topic ${topic} has bound articles but no collections`);
    assert.ok(
      (collections.counts.byTopic[topic] ?? 0) > 0,
      `collections.counts.byTopic missing topic ${topic}`,
    );
  }
  for (const topic of collectionTopics) {
    assert.ok(bound.has(topic), `collection topic ${topic} has no bound articles`);
  }
  assert.equal(collections.counts.collections, collections.collections.length);
  assert.equal(collections.schema, "hansa.fabric-reading-collections/1");
});

test("each topic's collections partition its bound articles with no duplicates", () => {
  const bound = boundByTopic();
  for (const [topic, expectedIds] of bound) {
    const topicCollections = collections.collections.filter((collection) => collection.topic === topic);
    const seen = new Set();
    for (const collection of topicCollections) {
      for (const articleId of collection.articleIds) {
        assert.ok(!seen.has(articleId), `${articleId} appears twice across ${topic} collections`);
        seen.add(articleId);
      }
    }
    assert.deepEqual(
      [...seen].sort(),
      [...expectedIds].sort(),
      `collections for ${topic} do not exactly cover its ${expectedIds.size} bound articles`,
    );
  }
});

test("collection articleIds resolve to primary bindings of the same topic", () => {
  const primaryByArticle = new Map(primary.rows.map((row) => [row.articleId, row]));
  for (const collection of collections.collections) {
    for (const articleId of collection.articleIds) {
      const row = primaryByArticle.get(articleId);
      assert.ok(row, `collection ${collection.id} references unbound article ${articleId}`);
      assert.equal(
        row.topic,
        collection.topic,
        `collection ${collection.id} holds ${articleId} bound to ${row.topic}`,
      );
    }
  }
});

test("collection counts and ordering are consistent", () => {
  const primaryByArticle = new Map(primary.rows.map((row) => [row.articleId, row]));
  const ids = new Set();
  for (const collection of collections.collections) {
    assert.ok(!ids.has(collection.id), `duplicate collection id ${collection.id}`);
    ids.add(collection.id);
    assert.equal(collection.counts.articles, collection.articleIds.length, `counts.articles drift in ${collection.id}`);
    const sorted = [...collection.articleIds].sort();
    assert.deepEqual(collection.articleIds, sorted, `articleIds in ${collection.id} are not sorted`);
    const kindTotal = Object.values(collection.counts.byKind).reduce((sum, n) => sum + n, 0);
    assert.equal(kindTotal, collection.articleIds.length, `byKind does not sum to articles in ${collection.id}`);
    for (const articleId of collection.articleIds) {
      const row = primaryByArticle.get(articleId);
      assert.equal(collection.counts.byKind[row.kind] > 0, true, `byKind missing kind '${row.kind}' in ${collection.id}`);
    }
    assert.ok(collection.title.length > 0 && collection.description.length > 0, `title/description in ${collection.id}`);
    // Deterministic id scheme: col:<topic>:<directory with / -> ->:<class>
    assert.match(collection.id, /^col:[a-z0-9-]+:[a-z0-9-]+:(concepts|procedures|reference)$/);
  }
  assert.equal(
    Object.values(collections.counts.byClass).reduce((sum, n) => sum + n, 0),
    collections.collections.length,
    "counts.byClass must cover every collection",
  );
});

test("loader returns the same collections as the artifact", () => {
  const byTopic = new Map();
  for (const collection of collections.collections) {
    byTopic.set(collection.topic, [...(byTopic.get(collection.topic) ?? []), collection]);
  }
  for (const [topic, expected] of byTopic) {
    const actual = bindings.getCollectionsForTopic(topic);
    assert.equal(actual.length, expected.length, `collection count mismatch for ${topic}`);
    assert.deepEqual(
      actual.map((collection) => collection.id),
      expected.map((collection) => collection.id),
    );
  }
  const overview = bindings.getFabricTopicReadingOverview();
  assert.equal(overview.length, byTopic.size, "overview must cover exactly the bound topics");
  for (const entry of overview) {
    assert.equal(entry.collections, byTopic.get(entry.topic).length);
    assert.equal(entry.primary, primary.counts.byTopic[entry.topic]);
    assert.equal(entry.held, primary.counts.heldByTopic[entry.topic] ?? 0);
  }
});
