// FC07 — exclusion gate: the 92 registry-excluded articles must NOT appear
// anywhere in the deployed shards, manifest or routing (work-package brief:
// "the 92 excluded must NOT appear anywhere in shards/manifest/dictionaries
// (hard test)").
//
// Strings checked per excluded article: its articleId and its logicalPath —
// both unique registry identifiers that can never legitimately occur inside a
// shard body, routing key or manifest field. Slugs are NOT checked as strings:
// a slug like "connector-overview" can legitimately occur as ordinary prose in
// another published article.
//
// Also proves the inverse: every articleId present in the shards is a
// published registry article — the shard universe is exactly the registry.
//
//   node --experimental-strip-types --test tests/fabric-corpus/search/
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  loadPublicManifest,
  publicVersionDir,
  PUBLIC_SEARCH_DIR,
  REGISTRY_PATH,
} from "./helpers.mjs";

const manifest = loadPublicManifest();

test("excluded articles are absent from shards, manifest and routing", { skip: (!manifest || !existsSync(REGISTRY_PATH)) && "public fabric-search tree or route registry not available" }, () => {
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
  const excluded = registry.excluded ?? [];
  assert.ok(excluded.length > 0, "registry carries an excluded list");
  assert.equal(manifest.registryRevision, registry.registryRevision);
  assert.equal(excluded.length, registry.counts.excludedArticles);

  const versionDir = publicVersionDir(manifest);
  const blobs = new Map();
  for (const file of manifest.files) {
    blobs.set(file.name, readFileSync(path.join(versionDir, file.name), "utf8"));
  }
  blobs.set("manifest.json", readFileSync(path.join(PUBLIC_SEARCH_DIR, "manifest.json"), "utf8"));

  // Exact JSON-quoted matches: identifiers always appear as JSON string values,
  // and quoted matching avoids prefix false positives (a published article's
  // id "…connector-access-database-overview" CONTAINS the excluded id
  // "…connector-access-database" as a substring).
  for (const article of excluded) {
    const idNeedle = JSON.stringify(article.articleId);
    const pathNeedle = JSON.stringify(article.logicalPath);
    for (const [name, blob] of blobs) {
      assert.ok(!blob.includes(idNeedle), `${article.articleId} leaked into ${name}`);
      assert.ok(!blob.includes(pathNeedle), `${article.logicalPath} leaked into ${name}`);
    }
  }

  // Inverse: every shard articleId is a published registry article.
  const families = registry.families.filter((family) => manifest.families.includes(family.family));
  const published = new Set(families.flatMap((family) => family.articles.map((a) => a.articleId)));
  const shardArticleIds = new Set();
  for (const file of manifest.files) {
    if (file.role !== "shard") continue;
    const shard = JSON.parse(blobs.get(file.name));
    assert.equal(shard.articles.length, file.articleCount);
    for (const shardArticle of shard.articles) {
      assert.ok(!shardArticleIds.has(shardArticle.articleId), `duplicate article ${shardArticle.articleId}`);
      shardArticleIds.add(shardArticle.articleId);
    }
  }
  assert.equal(shardArticleIds.size, manifest.articleCount);
  assert.deepEqual(shardArticleIds, published);
  assert.deepEqual([...manifest.families].sort(), families.map((family) => family.family).sort());
  if (process.env.FABRIC_SEARCH_PUBLIC_DIR) {
    assert.equal(published.size, registry.counts.publishedArticles);
    assert.equal(families.length, registry.families.length);
  }
  assert.equal(manifest.shardCount, manifest.files.filter((file) => file.role === "shard").length);
});

test("excluded articleIds cannot appear in the routing dictionaries via shard content", { skip: (!manifest || !existsSync(REGISTRY_PATH)) && "public fabric-search tree or route registry not available" }, () => {
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
  const versionDir = publicVersionDir(manifest);
  const routingFile = manifest.files.find((file) => file.role === "routing");
  const routing = JSON.parse(readFileSync(path.join(versionDir, routingFile.name), "utf8"));
  const tokens = Object.keys(routing.tokens).concat(routing.wildcardTokens);
  // Routing keys are normalised tokens, never identifiers — assert no key or
  // wildcard token embeds an article id or a logical path. (Ordinary English
  // content words such as "quarantine" are legitimate corpus vocabulary and
  // are not checked as strings.)
  for (const token of tokens) {
    assert.ok(!token.startsWith("art:"), `routing key ${token} embeds an article id`);
    assert.ok(!token.includes("learn/fabric/docs"), `routing key ${token} embeds a logical path`);
    assert.ok(!token.includes("/"), `routing key ${token} embeds a path segment`);
  }
  void registry;
});
