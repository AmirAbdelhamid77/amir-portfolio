// FC05 — namespace collision gate (ROUTE_NAMESPACE.md §"Collision evidence"
// + §"Slug registry rule"): the docs namespace must be free in every slug
// registry, and the emitted registry must not collide with existing app
// routes.

import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..", "..");
const buildDir =
  process.env.FABRIC_CORPUS_BUILD_DIR ?? path.join(repoRoot, "..", "fabric-corpus-build");
const registryPath = path.join(buildDir, "route-registry", "route-registry.json");
const REGISTRY_AVAILABLE = existsSync(registryPath);
const registry = REGISTRY_AVAILABLE ? JSON.parse(readFileSync(registryPath, "utf8")) : null;

/**
 * Static list of first-level route names under app/learn/, derived from the
 * working tree at the start of this branch (feat/fabric-corpus-20261105,
 * HEAD 0762eb5) with `ls app/learn`. Dynamic-route names ([subject]) are
 * excluded; static names are the collision surface. When the directory
 * changes, regenerate this list — the test fails loudly on drift by
 * re-reading the real directory when it exists.
 */
const APP_LEARN_STATIC_NAMES = [
  "academy", "analysis", "ar", "catalogue", "chapter", "dp-600", "drafts",
  "excel", "fabric", "fabric-rti", "method", "power-bi", "python", "sql",
  "statistics", "visualization",
];

function actualAppLearnNames() {
  const dir = path.join(repoRoot, "app", "learn");
  if (!existsSync(dir)) return null;
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("["))
    .map((e) => e.name)
    .sort();
}

test("the docs slug is reserved: no family or article slug may be 'docs'", (t) => {
  if (!registry) t.skip("registry not built yet");
  assert.equal(registry.routeNamespace.startsWith("/learn/fabric/docs/"), true);
  for (const family of registry.families) {
    assert.notEqual(family.family, "docs", "a family may not claim the reserved 'docs' slug");
    for (const article of family.articles) {
      for (const segment of article.articleSegments) {
        assert.notEqual(segment, "docs", `${article.articleId} uses the reserved 'docs' slug`);
      }
    }
  }
});

test("family slugs never collide with existing /learn first-level routes", (t) => {
  if (!registry) t.skip("registry not built yet");
  const actual = actualAppLearnNames() ?? APP_LEARN_STATIC_NAMES;
  // Drift guard: the static list must match the working tree when present.
  if (actualAppLearnNames()) {
    assert.deepEqual(
      actual,
      APP_LEARN_STATIC_NAMES,
      "app/learn first-level names drifted — update APP_LEARN_STATIC_NAMES",
    );
  }
  for (const family of registry.families) {
    assert.equal(
      APP_LEARN_STATIC_NAMES.includes(family.family),
      false,
      `family ${family.family} collides with an existing /learn route`,
    );
  }
});

test("no (family, article path) is registered twice", (t) => {
  if (!registry) t.skip("registry not built yet");
  const seen = new Set();
  for (const family of registry.families) {
    for (const article of family.articles) {
      const key = article.logicalPath;
      assert.equal(seen.has(key), false, `duplicate logical route ${key}`);
      seen.add(key);
    }
  }
});

test("route segments stay in the slug charset (ASCII lowercase, hyphen, <=100 chars)", (t) => {
  if (!registry) t.skip("registry not built yet");
  const slugPattern = /^[a-z0-9-]+$/;
  for (const family of registry.families) {
    assert.match(family.family, slugPattern);
    assert.ok(family.family.length <= 100);
    for (const article of family.articles) {
      for (const segment of article.articleSegments) {
        assert.match(segment, slugPattern, `${article.articleId} segment ${segment}`);
        assert.ok(segment.length <= 100, `${article.articleId} segment too long: ${segment}`);
      }
    }
  }
});

test("exported out/ route inventory never collides with the docs namespace", (t) => {
  // Post-build gate: once a build containing the docs namespace exists, the
  // export must contain it and must never contain a stray /learn/docs tree
  // (the data-viz lesson route has dynamicParams=false, so it cannot appear).
  const outDir = path.join(repoRoot, "out", "learn");
  if (!existsSync(outDir)) return t.skip("no out/ export yet (run npm run build first)");
  const docsDir = path.join(outDir, "fabric", "docs");
  if (!existsSync(docsDir)) {
    return t.skip("out/ predates the FC05 build — rerun after npm run build");
  }
  assert.equal(existsSync(path.join(outDir, "docs")), false, "stray /learn/docs export");
});
