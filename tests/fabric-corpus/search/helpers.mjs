// Shared helpers for the FC07 fabric-corpus search tests.
// Test-imported module: no @/ aliases, no JSON imports, plain ESM with
// explicit .ts extensions (repo test convention).
//
// The deployed artifact under test is the PUBLIC tree the site actually
// serves: public/fabric-search/manifest.json → <version>/shard-*.json. The
// build-dir copy (FABRIC_CORPUS_BUILD_DIR/search-shards/<version>) is the
// builder's output; determinism tests rebuild small families into temp dirs.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const PUBLIC_SEARCH_DIR = path.join(REPO_ROOT, "public", "fabric-search");
export const DEFAULT_BUILD_DIR = process.env.FABRIC_CORPUS_BUILD_DIR
  ? path.resolve(process.env.FABRIC_CORPUS_BUILD_DIR)
  : path.resolve(REPO_ROOT, "..", "fabric-corpus-build");
export const REGISTRY_PATH = path.join(DEFAULT_BUILD_DIR, "route-registry", "route-registry.json");

/** The deployed public tree: manifest.json pointer + versioned files. */
export function loadPublicManifest() {
  const manifestPath = path.join(PUBLIC_SEARCH_DIR, "manifest.json");
  if (!existsSync(manifestPath)) return null;
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

export function publicVersionDir(manifest) {
  return path.join(PUBLIC_SEARCH_DIR, manifest.version);
}

export function loadPublicShards(manifest) {
  const dir = publicVersionDir(manifest);
  const shards = [];
  for (const file of manifest.files) {
    if (file.role !== "shard") continue;
    shards.push(JSON.parse(readFileSync(path.join(dir, file.name), "utf8")));
  }
  return shards;
}

/** A fetch stub that serves the real public tree through the client pipeline
 *  (manifest URL → fabricAssetUrl-derived shard URLs). Keeps the tests
 *  network-free while exercising the exact production code path. */
export function stubFetchFromPublic() {
  const calls = [];
  return {
    calls,
    async fetch(url, init) {
      calls.push({ url, init });
      const clean = String(url).split("?")[0];
      if (clean.endsWith("/manifest.json")) {
        return new Response(readFileSync(path.join(PUBLIC_SEARCH_DIR, "manifest.json")), { status: 200 });
      }
      // Asset URLs look like /fabric-search/<version>/<file> under the root
      // profile (no NEXT_PUBLIC_BASE_PATH in tests): map the tail onto the
      // public tree.
      const marker = "/fabric-search/";
      const tail = clean.slice(clean.indexOf(marker) + marker.length);
      const filePath = path.join(PUBLIC_SEARCH_DIR, tail);
      if (!existsSync(filePath)) {
        return new Response("not found", { status: 404 });
      }
      return new Response(readFileSync(filePath), { status: 200 });
    },
  };
}

/** Deterministic query derivation from the real corpus (no hand-picking):
 *  exact title tokens, cross-title two-token pairs, and heading tokens. */
export function deriveQueries(shards, counts = {}) {
  const titleTokens = [];
  const headingTokens = [];
  const bodyTokenSeen = new Set();
  for (const shard of shards) {
    for (const article of shard.articles) {
      for (const token of article.title.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 5)) {
        titleTokens.push(token);
      }
      for (const section of article.sections) {
        for (const token of section.heading.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 6)) {
          headingTokens.push({ token, articleId: article.articleId });
        }
        for (const token of section.text.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 6)) {
          bodyTokenSeen.add(token);
        }
      }
    }
    if (titleTokens.length > 4000) break;
  }
  const unique = [...new Set(titleTokens)].sort();
  const exact = unique.slice(0, counts.exact ?? 8);
  const pairs = [];
  for (let index = 0; index + 1 < Math.min(unique.length, counts.pairs ?? 6); index += 2) {
    pairs.push(`${unique[index]} ${unique[index + 1]}`);
  }
  // Heading-only candidates: heading tokens never appearing in body/title text.
  const headingOnly = [...new Map(headingTokens.map((h) => [h.token, h])).values()]
    .filter((h) => !bodyTokenSeen.has(h.token) && !titleTokens.includes(h.token))
    .sort((a, b) => (a.token < b.token ? -1 : 1))
    .slice(0, counts.heading ?? 2)
    .map((h) => h.token);
  const singleBody = [...bodyTokenSeen].sort().filter((token) => token.length >= 7).slice(0, counts.body ?? 4);
  return { exact, pairs, headingOnly, singleBody };
}

export function allArticles(shards) {
  const articles = [];
  for (const shard of shards) articles.push(...shard.articles);
  return articles;
}

export function tempBuildOut(name) {
  // Outside the repo: build-shards output for determinism comparison only.
  return path.join(tmpdir(), `fc07-${name}-${process.pid}`);
}

export function fileTreeBytes(dir) {
  const out = {};
  for (const name of readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (statSync(abs).isFile()) out[name] = readFileSync(abs);
    else Object.assign(out, Object.fromEntries(Object.entries(fileTreeBytes(abs)).map(([k, v]) => [`${name}/${k}`, v])));
  }
  return out;
}
