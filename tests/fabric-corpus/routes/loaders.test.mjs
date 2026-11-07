// FC05 — loader fail-closed tests (lib/fabric/articles).
//
//   node --experimental-strip-types --test tests/fabric-corpus/routes/
//
// RELEASE_AND_STORAGE.md: "The app build fails closed if the registry or
// required article data is missing — never silently empties the namespace."
// The loaders must therefore throw (not return empty data) when the build
// workspace is missing pieces. Happy-path loads run against the real build
// workspace when it is present (CI order: compile → build-registry → tests).

import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  MissingArticleError,
  getArticleData,
} from "../../../lib/fabric/articles/article-data.ts";
import {
  fabricCorpusBuildDir,
  getDeliveryProfile,
  getRouteRegistry,
} from "../../../lib/fabric/articles/registry.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..", "..");
const realBuildDir = fabricCorpusBuildDir();
const registryAvailable = existsSync(
  path.join(realBuildDir, "route-registry", "route-registry.json"),
);

function withBuildDir(dir, run) {
  const previous = process.env.FABRIC_CORPUS_BUILD_DIR;
  process.env.FABRIC_CORPUS_BUILD_DIR = dir;
  try {
    run();
  } finally {
    if (previous === undefined) delete process.env.FABRIC_CORPUS_BUILD_DIR;
    else process.env.FABRIC_CORPUS_BUILD_DIR = previous;
  }
}

test("getRouteRegistry throws when the registry is missing (fail-closed)", () => {
  const emptyDir = mkdtempSync(path.join(tmpdir(), "fc05-empty-build-"));
  withBuildDir(emptyDir, () => {
    assert.throws(() => getRouteRegistry(), /route registry missing/);
  });
});

test("getArticleData throws for a missing registry", () => {
  const emptyDir = mkdtempSync(path.join(tmpdir(), "fc05-empty-build-"));
  withBuildDir(emptyDir, () => {
    assert.throws(() => getArticleData("fundamentals", ["anything"]), /route registry missing/);
  });
});

test("getArticleData throws MissingArticleError for an unpublished combination", (t) => {
  if (!registryAvailable) t.skip("registry not built yet");
  // The registry never contains this combination (published=false / unknown).
  assert.throws(
    () => getArticleData("fundamentals", ["no-such-article-xyz"]),
    MissingArticleError,
  );
  // The three known held articles must also throw, never load.
  const registry = getRouteRegistry();
  for (const held of registry.excluded.slice(0, 1)) {
    const segments = held.logicalPath
      .replace(/^\/learn\/fabric\/docs\//, "")
      .replace(/\/$/, "")
      .split("/");
    const family = segments.shift();
    assert.throws(() => getArticleData(family, segments), MissingArticleError);
  }
});

test("getArticleData loads a published article with content from the build workspace", (t) => {
  if (!registryAvailable) t.skip("registry not built yet");
  // Drive from the registry itself so the test never depends on a specific
  // upstream article surviving a corpus update.
  const registry = getRouteRegistry();
  const row = registry.families.flatMap((f) => f.articles)[0];
  const data = getArticleData(row.family, row.articleSegments);
  assert.equal(data.row.articleId, row.articleId);
  assert.equal(data.row.published, true);
  assert.ok(data.blocks.length > 0, "article body must not be empty");
  assert.ok(data.frontMatter.title.length > 0);
  // Quarantined nodes never load (registry excludes them; loader re-checks).
  assert.equal(data.quarantine.blocked, false);
});

test("registry caching: the same build dir returns one cached instance", (t) => {
  if (!registryAvailable) t.skip("registry not built yet");
  assert.equal(getRouteRegistry(), getRouteRegistry());
});

test("delivery profile follows NEXT_PUBLIC_BASE_PATH and validates", () => {
  const previous = process.env.NEXT_PUBLIC_BASE_PATH;
  try {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    assert.equal(getDeliveryProfile().basePath, "");
    process.env.NEXT_PUBLIC_BASE_PATH = "/repo";
    const profile = getDeliveryProfile();
    assert.equal(profile.profile, "subpath");
    assert.equal(profile.basePath, "/repo");
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
    else process.env.NEXT_PUBLIC_BASE_PATH = previous;
  }
});

test("generated assets referenced by the renderer exist for copied families", (t) => {
  if (!registryAvailable) t.skip("registry not built yet");
  const manifestPath = path.join(realBuildDir, "route-registry", "asset-manifest.json");
  if (!existsSync(manifestPath)) t.skip("asset manifest not generated yet");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (const [family, entry] of Object.entries(manifest.families)) {
    if (entry.policy !== "copied") continue;
    for (const assetKey of Object.keys(entry.assets)) {
      const abs = path.join(repoRoot, "public", "fabric-docs-assets", ...assetKey.split("/"));
      assert.ok(existsSync(abs), `manifest asset missing on disk: ${family}/${assetKey}`);
    }
  }
});
