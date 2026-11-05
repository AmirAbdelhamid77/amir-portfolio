// FC07 — PARITY GATE (handover 03 §Search; review disposition "Search parity
// accepted": "Prove token union and intersection against whole-index reference
// results").
//
// Reference: every Wave-2 article, concatenated, brute-force scored with the
// same pure functions the sharded path uses.
// Sharded:  manifest → routing → routeQuery(tokens) → candidate shards only →
// scoreShards.
//
// Proven per query:
//   1. INTERSECTION — the full multi-token (AND) query produces the identical
//      ranked result list (ids, scores, order) in both paths.
//   2. UNION — per-token single-token results (OR of matches) produce the
//      identical merged result set in both paths.
//   3. Routing never under-selects: every article the reference ranks appears
//      inside the shards the router selected (over-approximation only).
//
// Queries (≥20, derived deterministically from the corpus itself):
//   exact terms (title tokens), two-token pairs, body-only tokens, and
//   heading-token queries. Multilingual (non-ASCII) tokens do not occur in the
//   Wave-2 corpus (measured: zero non-ASCII token types), so a synthetic
//   Turkish fixture shard proves the same parity for non-ASCII tokenisation.
//
//   node --experimental-strip-types --test tests/fabric-corpus/search/
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadPublicManifest, loadPublicShards, stubFetchFromPublic, deriveQueries, allArticles } from "./helpers.mjs";
import { rankFabricArticles, scoreShards } from "../../../lib/search/fabric-scorer.ts";
import { FabricSearch } from "../../../lib/search/fabric-shards.ts";
import { tokenize } from "../../../lib/search/query.ts";

const manifest = loadPublicManifest();

/** Rank id+score fingerprints, robust to float formatting. */
function fingerprint(hits) {
  return hits.map((hit) => `${hit.articleId}@${hit.score}`);
}

/** Union (OR) semantics: per-token matches merged, best score per article. */
function unionReference(articles, tokens) {
  const byId = new Map();
  for (const token of tokens) {
    for (const hit of rankFabricArticles(articles, token, { limit: 0 })) {
      const existing = byId.get(hit.articleId);
      if (!existing || hit.score > existing.score) byId.set(hit.articleId, { ...hit });
    }
  }
  return [...byId.values()].sort(
    (a, b) => b.score - a.score || (a.logicalPath < b.logicalPath ? -1 : a.logicalPath > b.logicalPath ? 1 : 0),
  );
}

function unionSharded(shards, tokens) {
  const byId = new Map();
  for (const token of tokens) {
    for (const hit of scoreShards(shards, token, 0)) {
      const existing = byId.get(hit.articleId);
      if (!existing || hit.score > existing.score) byId.set(hit.articleId, { ...hit });
    }
  }
  return [...byId.values()].sort(
    (a, b) => b.score - a.score || (a.logicalPath < b.logicalPath ? -1 : a.logicalPath > b.logicalPath ? 1 : 0),
  );
}

test("parity gate: sharded scoring equals whole-index reference (union + intersection)", { skip: !manifest && "public fabric-search tree not built — run build-shards.mjs + copy-shards.mjs" }, async (t) => {
  const shards = loadPublicShards(manifest);
  const articles = allArticles(shards);
  assert.ok(articles.length > 500, `expected the Wave-2 corpus (got ${articles.length} articles)`);

  const { exact, pairs, headingOnly, singleBody } = deriveQueries(shards, { exact: 10, pairs: 6, body: 6, heading: 2 });
  const queries = [...exact, ...pairs, ...singleBody, ...headingOnly];
  assert.ok(queries.length >= 20, `parity needs ≥20 queries (got ${queries.length})`);

  // One client per query set: the stub serves the real public tree.
  const stub = stubFetchFromPublic();
  const client = new FabricSearch({ fetchImpl: stub.fetch, maxCacheBytes: 64 * 1024 * 1024, maxCacheEntries: 512 });
  const controller = new AbortController();

  await t.test("intersection (AND) parity", async () => {
    let checked = 0;
    for (const query of queries) {
      const tokens = tokenize(query);
      if (tokens.length === 0) continue;
      const reference = rankFabricArticles(articles, query, { limit: 0 });
      const outcome = await client.search(query, controller.signal, 0);
      assert.equal(outcome.status, "ok", `${query}: sharded status ok`);
      assert.deepEqual(
        fingerprint(outcome.hits),
        fingerprint(reference),
        `${query}: sharded AND-results must equal whole-index reference`,
      );
      // Routing completeness: every reference hit must live in a loaded shard.
      const loadedIds = new Set(outcome.hits.map((hit) => hit.articleId));
      for (const hit of reference) assert.ok(loadedIds.has(hit.articleId), `${query}: router missed ${hit.articleId}`);
      checked += 1;
    }
    assert.ok(checked >= 20);
  });

  await t.test("union (per-token OR) parity", async () => {
    for (const query of queries.slice(0, 16)) {
      const tokens = tokenize(query);
      if (tokens.length < 2) continue;
      const reference = unionReference(articles, tokens);
      await client.ensureLoaded(controller.signal);
      const shardIdx = new Set();
      for (const token of tokens) {
        for (const index of client.routeQuery([token])) shardIdx.add(index);
      }
      const files = client.getManifest().files.filter((file) => file.role === "shard");
      const shardsSubset = [];
      for (const index of [...shardIdx].sort((a, b) => a - b)) {
        shardsSubset.push(await client.loadShardByName(files[index].name, controller.signal));
      }
      const sharded = unionSharded(shardsSubset, tokens);
      assert.deepEqual(
        fingerprint(sharded),
        fingerprint(reference),
        `${query}: union-of-tokens over routed shards must equal whole-index union`,
      );
    }
  });

  await t.test("routing is over-approximating (never drops a matching shard)", async () => {
    for (const query of queries) {
      const tokens = tokenize(query);
      if (tokens.length === 0) continue;
      const reference = rankFabricArticles(articles, query, { limit: 0 });
      const routed = client.routeQuery(tokens);
      const routedArticles = new Set();
      for (const index of routed) {
        for (const article of shards[index].articles) routedArticles.add(article.articleId);
      }
      for (const hit of reference) {
        assert.ok(routedArticles.has(hit.articleId), `${query}: routing missed ${hit.articleId}`);
      }
    }
  });
});

// The Wave-2 corpus contains zero non-ASCII token types (measured at build
// time and asserted in the report), so multilingual parity is proven on a
// synthetic Turkish fixture shard scored through the same functions.
test("parity gate: non-ASCII (Turkish) tokens on a synthetic fixture shard", () => {
  const fixture = {
    schema: "hansa.fabric-search-shard/1",
    version: "vfixture",
    shardId: "shard-fixture",
    articles: [
      {
        articleId: "art:fixture/veritabani-rehberi",
        logicalPath: "/learn/fabric/docs/fixture/veritabani-rehberi/",
        title: "Veritabanı rehberi",
        family: "fixture",
        terms: "veritabanı rehberi kopya oluşturma",
        sections: [
          { heading: "Veritabanı oluşturma", anchor: "veritabani-olusturma", text: "Yeni bir veritabanı oluşturmak için kopya seçeneğini kullanın.", kind: "section" },
          { heading: "Kopya seçenekleri", anchor: "kopya-secenekleri", text: "Veritabanı kopyası anlık görüntü üzerinden alınabilir.", kind: "section" },
        ],
      },
      {
        articleId: "art:fixture/mirror-provisioning",
        logicalPath: "/learn/fabric/docs/fixture/mirror-provisioning/",
        title: "Mirroring provisioning",
        family: "fixture",
        terms: "mirroring database provisioning",
        sections: [
          { heading: "Provision a mirrored database", anchor: "provision", text: "Select the mirror option and the Azure SQL database to replicate.", kind: "section" },
        ],
      },
    ],
  };
  const tokens = tokenize("veritabanı oluşturma");
  // The shared normaliser strips combining marks (ş→s, ü→u) but keeps the
  // standalone letter ı (U+0131, a letter of its own, not a mark) — applied
  // IDENTICALLY to content and query, so non-ASCII matching is symmetric.
  assert.deepEqual(tokens, ["veritabanı", "olusturma"], "non-ASCII tokens survive folding symmetrically");
  const hits = scoreShards([fixture], "veritabanı oluşturma", 0);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].articleId, "art:fixture/veritabani-rehberi");
  assert.ok(hits[0].score > 0);
  // The fold must not accidentally match the ASCII-only article.
  assert.ok(!hits.some((hit) => hit.articleId === "art:fixture/mirror-provisioning"));
  // Reference (whole-index) scoring of the same corpus gives the same list.
  const reference = rankFabricArticles(fixture.articles, "veritabanı oluşturma", { limit: 0 });
  assert.deepEqual(
    fingerprint(hits),
    fingerprint(reference),
    "fixture shard scoring equals whole-index reference (parity holds for non-ASCII)",
  );
});
