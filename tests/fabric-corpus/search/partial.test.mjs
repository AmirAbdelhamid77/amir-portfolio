// FC07 — partial-status behaviour and client contracts on a simulated
// environment (stub fetch): failed shard → visible partial, version drift →
// one refetch then fail-visible, missing corpus → hidden band, LRU caps,
// cancellation.
//
//   node --experimental-strip-types --test tests/fabric-corpus/search/
import assert from "node:assert/strict";
import { test } from "node:test";

import { FabricSearch, FabricVersionDriftError } from "../../../lib/search/fabric-shards.ts";

const V1 = "v1111111111111111";
const V2 = "v2222222222222222";

function shard(name, version = V1, count = 2) {
  return {
    schema: "hansa.fabric-search-shard/1",
    version,
    shardId: name,
    articles: Array.from({ length: count }, (_, index) => ({
      articleId: `art:${name}/${index}`,
      logicalPath: `/learn/fabric/docs/${name}/${index}/`,
      title: `Mirror article ${name} ${index}`,
      family: "mirroring",
      terms: "mirror",
      sections: [{ heading: "Mirror", anchor: "m", text: `mirror mirror ${name} ${index}`, kind: "section" }],
    })),
  };
}

function manifestFor(files, version = V1) {
  return {
    schema: "hansa.fabric-search-manifest/1",
    version,
    corpusRevision: "corpus",
    registryRevision: "registry",
    shardCount: files.filter((f) => f.role === "shard").length,
    articleCount: files.reduce((sum, f) => sum + (f.articleCount ?? 0), 0),
    families: ["mirroring"],
    files,
  };
}

const FILES = [
  { name: "shard-a.json", role: "shard", sha256: "x", bytes: 10, articleCount: 2 },
  { name: "shard-b.json", role: "shard", sha256: "x", bytes: 10, articleCount: 2 },
  { name: "routing-test.json", role: "routing", sha256: "r", bytes: 10, articleCount: 4 },
];
const ROUTING = {
  schema: "hansa.fabric-search-routing/1",
  version: V1,
  wildcardThreshold: 0.7,
  wildcardTokens: ["the"],
  tokens: { mirror: [0, 1], lakehouse: [0], warehouse: [1] },
};

test("AND routing intersects postings and ignores inherited dictionary properties", async () => {
  const client = new FabricSearch({
    fetchImpl: async (url) => Response.json(String(url).endsWith("manifest.json") ? manifestFor(FILES) : ROUTING),
  });
  await client.ensureLoaded(new AbortController().signal);
  assert.deepEqual([...client.routeQuery(["mirror", "lakehouse", "the"])], [0]);
  assert.deepEqual([...client.routeQuery(["lakehouse", "warehouse"])], []);
  assert.deepEqual([...client.routeQuery(["constructor"])], []);
});

test("a missing routing file makes an existing corpus visibly unavailable", async () => {
  const client = new FabricSearch({
    fetchImpl: async (url) => String(url).endsWith("manifest.json")
      ? Response.json(manifestFor(FILES))
      : new Response(null, { status: 404 }),
  });
  assert.equal((await client.search("mirror", new AbortController().signal)).status, "unavailable");
});

function stubFetch(mapping, state) {
  return async (url, init) => {
    state.calls.push(String(url));
    state.signals.push(Boolean(init?.signal));
    const match = Object.keys(mapping).find((key) => String(url).endsWith(key));
    if (!match) return new Response("not found", { status: 404 });
    const entry = mapping[match];
    if (typeof entry === "number") return new Response("boom", { status: entry });
    if (entry instanceof Error) throw entry;
    return new Response(JSON.stringify(typeof entry === "function" ? entry() : entry), { status: 200 });
  };
}

test("failed shard → partial results, never silent", async () => {
  const state = { calls: [], signals: [] };
  const client = new FabricSearch({
    fetchImpl: stubFetch(
      {
        "fabric-search/manifest.json": manifestFor(FILES),
        "routing-test.json": ROUTING,
        "shard-a.json": () => shard("shard-a"),
        "shard-b.json": 503,
      },
      state,
    ),
    manifestUrl: "https://cdn.test/fabric-search/manifest.json",
  });
  const outcome = await client.search("mirror", new AbortController().signal);
  assert.equal(outcome.status, "ok");
  assert.equal(outcome.partial, true, "a failed candidate shard marks the outcome partial");
  assert.deepEqual(outcome.failedShards, ["shard-b.json"]);
  assert.equal(outcome.loadedShards, 1);
  assert.equal(outcome.candidateShards, 2);
  assert.ok(outcome.hits.every((hit) => hit.articleId.startsWith("art:shard-a/")), "matches come from the loaded shard only");
});

test("version drift on a shard → one manifest refetch, then fail-visible", async () => {
  const state = { calls: [] };
  let manifestFetches = 0;
  const client = new FabricSearch({
    fetchImpl: (url) => {
      state.calls.push(String(url));
      if (String(url).endsWith("/manifest.json")) {
        manifestFetches += 1;
        return new Response(JSON.stringify(manifestFor(FILES)), { status: 200 });
      }
      if (String(url).endsWith("routing-test.json")) {
        return new Response(JSON.stringify(ROUTING), { status: 200 });
      }
      // Every shard answers with the wrong version.
      return new Response(JSON.stringify(shard("shard-a", V2)), { status: 200 });
    },
    manifestUrl: "https://cdn.test/fabric-search/manifest.json",
  });
  const outcome = await client.search("mirror", new AbortController().signal);
  assert.equal(manifestFetches, 2, "manifest fetched exactly twice (initial + one drift refetch)");
  assert.equal(outcome.status, "version-drift", "persistent drift is a visible status, not a silent drop");
  assert.equal(outcome.hits.length, 0);
  // A second query must NOT refetch the manifest again (guard holds).
  await client.search("mirror", new AbortController().signal);
  assert.equal(manifestFetches, 2);
  void state;
});

test("version drift that resolves on refetch → clean results", async () => {
  let manifestFetches = 0;
  const client = new FabricSearch({
    fetchImpl: async (url) => {
      if (String(url).endsWith("/manifest.json")) {
        manifestFetches += 1;
        // First manifest points at shard files that report the old version;
        // after the refetch the store has caught up (torn deployment healed).
        const version = manifestFetches === 1 ? V1 : V1;
        return new Response(JSON.stringify(manifestFor(FILES, version)), { status: 200 });
      }
      if (String(url).endsWith("routing-test.json")) {
        return new Response(JSON.stringify({ ...ROUTING, version: V1 }), { status: 200 });
      }
      // First shard fetch reports drift; after refetch, shards are fresh.
      const drifted = manifestFetches <= 1;
      return new Response(JSON.stringify(shard(String(url).endsWith("shard-a.json") ? "shard-a" : "shard-b", drifted ? V2 : V1)), { status: 200 });
    },
    manifestUrl: "https://cdn.test/fabric-search/manifest.json",
  });
  const outcome = await client.search("mirror", new AbortController().signal);
  assert.equal(outcome.status, "ok");
  assert.equal(outcome.partial, false);
  assert.equal(outcome.hits.length, 4, "both shards load after the healed refetch");
  assert.equal(manifestFetches, 2);
});

test("missing corpus (manifest 404) → status 'missing', band hidden", async () => {
  const client = new FabricSearch({
    fetchImpl: async () => new Response("not found", { status: 404 }),
    manifestUrl: "https://cdn.test/fabric-search/manifest.json",
  });
  const outcome = await client.search("mirror", new AbortController().signal);
  assert.equal(outcome.status, "missing");
  const broken = new FabricSearch({
    fetchImpl: async () => new Response("boom", { status: 500 }),
    manifestUrl: "https://cdn.test/fabric-search/manifest.json",
  });
  const outcome500 = await broken.search("mirror", new AbortController().signal);
  assert.equal(outcome500.status, "unavailable", "non-404 manifest failures are fail-visible");
});

test("LRU caps: byte budget evicts least-recently-used whole shards", async () => {
  const bigArticle = (id) => ({
    articleId: id,
    logicalPath: `/learn/fabric/docs/${id}/`,
    title: id,
    family: "mirroring",
    terms: "mirror",
    sections: [{ heading: "Mirror", anchor: "m", text: "mirror ".repeat(2000), kind: "section" }],
  });
  const client = new FabricSearch({
    fetchImpl: async (url) => {
      if (String(url).endsWith("/manifest.json")) {
        return new Response(
          JSON.stringify(
            manifestFor([
              { name: "shard-a.json", role: "shard", sha256: "a", bytes: 30000, articleCount: 1 },
              { name: "shard-b.json", role: "shard", sha256: "b", bytes: 30000, articleCount: 1 },
              { name: "shard-c.json", role: "shard", sha256: "c", bytes: 30000, articleCount: 1 },
            ]),
          ),
          { status: 200 },
        );
      }
      if (String(url).endsWith("routing-test.json")) {
        return new Response(JSON.stringify({ ...ROUTING, tokens: { mirror: [0, 1, 2] } }), { status: 200 });
      }
      const name = String(url).endsWith("shard-a.json") ? "shard-a" : String(url).endsWith("shard-b.json") ? "shard-b" : "shard-c";
      return new Response(
        JSON.stringify({
          schema: "hansa.fabric-search-shard/1",
          version: V1,
          shardId: name,
          articles: [bigArticle(name)],
        }),
        { status: 200 },
      );
    },
    manifestUrl: "https://cdn.test/fabric-search/manifest.json",
    maxCacheBytes: 65000,
    maxCacheEntries: 10,
  });
  await client.search("mirror", new AbortController().signal);
  assert.ok(client.cacheBytes <= 65000, `byte cap respected (${client.cacheBytes})`);
  assert.ok(client.cacheSize <= 2, "entries evicted to stay under the byte cap");
});

test("superseded fetches abort through the caller's controller", async () => {
  const abortsSeen = [];
  const client = new FabricSearch({
    fetchImpl: (url, init) =>
      new Promise((resolve, reject) => {
        const signal = init?.signal;
        if (!signal) {
          reject(new Error("expected a signal"));
          return;
        }
        signal.addEventListener("abort", () => {
          abortsSeen.push(String(url));
          reject(new DOMException("aborted", "AbortError"));
        });
      }),
    manifestUrl: "https://cdn.test/fabric-search/manifest.json",
  });
  const controller = new AbortController();
  const pending = client.search("mirror", controller.signal);
  controller.abort();
  await assert.rejects(pending, (error) => error.name === "AbortError", "the whole query aborts, not a silent partial");
  assert.ok(abortsSeen.some((url) => url.includes("manifest.json")));
});

test("routing over-approximates: wildcard tokens select every shard", async () => {
  const client = new FabricSearch({
    fetchImpl: async () => new Response("not found", { status: 404 }),
    manifestUrl: "https://cdn.test/fabric-search/manifest.json",
  });
  // Route without network access by injecting state directly.
  client.manifest = manifestFor(FILES);
  client.routing = ROUTING;
  const candidates = client.routeQuery(["mirror"]);
  assert.deepEqual([...candidates].sort(), [0, 1]);
  const wildcard = client.routeQuery(["the"]);
  assert.deepEqual([...wildcard].sort(), [0, 1], "wildcard token loads every shard (recall-safe)");
  const unknown = client.routeQuery(["zzznotokens"]);
  assert.equal(unknown.size, 0, "a token in no shard selects none — correct empty result");
});

test("routing version must match the manifest (drift throws before load)", async () => {
  const client = new FabricSearch({
    fetchImpl: async (url) => {
      if (String(url).endsWith("/manifest.json")) {
        return new Response(JSON.stringify(manifestFor(FILES)), { status: 200 });
      }
      return new Response(JSON.stringify({ ...ROUTING, version: V2 }), { status: 200 });
    },
    manifestUrl: "https://cdn.test/fabric-search/manifest.json",
  });
  await assert.rejects(
    client.ensureLoaded(new AbortController().signal),
    FabricVersionDriftError,
    "a routing file from another version never loads against this manifest",
  );
});
