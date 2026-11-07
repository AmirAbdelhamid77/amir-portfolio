// FC09/W3-C — mutation-manifest integrity and simulator determinism.
//
//   node --experimental-strip-types --test tests/fabric-corpus/sync/
//
// Unit tier: a mini corpus in a temp directory run through the real simulator
// twice (determinism) with every mutation's before/after sha verified against
// the actual bytes of the base corpus and the successor copy.
// Integration tier: the real sim-wave3c artifacts in the build workspace,
// verified against the read-only corpus (skipped when the scratch artifacts
// are absent).

import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { runSimulation } from "../../../tools/fabric-corpus/sync/simulate-upstream.mjs";
import { sha256Buffer } from "../../../tools/fabric-corpus/sync/lib.mjs";
import { buildMiniCorpus } from "./helpers.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..", "..");
const buildDir =
  process.env.FABRIC_CORPUS_BUILD_DIR ?? path.join(repoRoot, "..", "fabric-corpus-build");
const corpusDocsRoot = path.join(buildDir, "..", "fabric-docs-light", "docs");

const REAL_SIM_DIR = path.join(buildDir, "sync", "upstream-sim", "sim-wave3c");
const REAL_SIM_AVAILABLE = existsSync(path.join(REAL_SIM_DIR, "mutation-manifest.json"));

const SIX_KINDS = [
  "add-article",
  "modify-article-body",
  "modify-shared-include",
  "rename-article",
  "remove-article",
  "flip-front-matter-title",
];

test("mini corpus: simulator runs twice with byte-identical manifests (determinism)", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-sim-a-"));
  try {
    const fixture = buildMiniCorpus(root);
    const outA = path.join(root, "sim-a");
    const outB = path.join(root, "sim-b");
    const a = runSimulation({
      corpusRoot: fixture.baseDocsRoot,
      outDir: outA,
      label: "mini",
      families: fixture.families,
      receiptsRoot: fixture.receiptsRoot,
    });
    const b = runSimulation({
      corpusRoot: fixture.baseDocsRoot,
      outDir: outB,
      label: "mini",
      families: fixture.families,
      receiptsRoot: fixture.receiptsRoot,
    });
    const bytesA = readFileSync(path.join(outA, "mutation-manifest.json"));
    const bytesB = readFileSync(path.join(outB, "mutation-manifest.json"));
    assert.ok(bytesA.equals(bytesB), "two simulator runs must produce byte-identical manifests");
    assert.equal(a.manifest.mutationRevision, b.manifest.mutationRevision);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("mini corpus: manifest carries all six mutation kinds with intact shas", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-sim-b-"));
  try {
    const fixture = buildMiniCorpus(root);
    const outDir = path.join(root, "sim");
    const { manifest, docsRoot } = runSimulation({
      corpusRoot: fixture.baseDocsRoot,
      outDir,
      label: "mini",
      families: fixture.families,
      receiptsRoot: fixture.receiptsRoot,
    });

    assert.equal(manifest.schema, "hansa.fabric-sync/mutation-manifest/1");
    assert.equal(manifest.baseCorpusRevision, "774592ea3f2d4558f763d6e5b74abf4785948fb5");
    assert.equal(manifest.mutations.length, 6);
    assert.deepEqual(
      manifest.mutations.map((m) => m.kind).sort(),
      [...SIX_KINDS].sort(),
      "every diff class must be exercised exactly once",
    );

    const shaOfBase = (rel) => sha256Buffer(readFileSync(path.join(fixture.baseDocsRoot, ...rel.split("/"))));
    const shaOfSim = (rel) => sha256Buffer(readFileSync(path.join(docsRoot, ...rel.split("/"))));

    const byId = new Map(manifest.mutations.map((m) => [m.id, m]));

    // add: no before sha; after sha matches the successor bytes.
    const added = byId.get("m1-add-article");
    assert.equal(added.beforeSha256, null);
    assert.equal(added.afterSha256, shaOfSim(added.path));
    assert.ok(!existsSync(path.join(fixture.baseDocsRoot, ...added.path.split("/"))), "added article must not exist in the base");

    // modify body: before == base bytes, after == successor bytes.
    const body = byId.get("m2-modify-article-body");
    assert.equal(body.beforeSha256, shaOfBase(body.path));
    assert.equal(body.afterSha256, shaOfSim(body.path));
    assert.notEqual(body.beforeSha256, body.afterSha256);

    // shared include: same integrity contract.
    const shared = byId.get("m3-modify-shared-include");
    assert.equal(shared.beforeSha256, shaOfBase(shared.path));
    assert.equal(shared.afterSha256, shaOfSim(shared.path));
    assert.equal(shared.path, "includes/product-name.md");

    // rename: identical blob at a new path.
    const renamed = byId.get("m4-rename-article");
    assert.equal(renamed.beforeSha256, renamed.afterSha256);
    assert.equal(renamed.beforeSha256, shaOfSim(renamed.pathAfter));
    assert.ok(!existsSync(path.join(docsRoot, ...renamed.path.split("/"))), "old path must be gone from the successor");
    assert.ok(existsSync(path.join(docsRoot, ...renamed.pathAfter.split("/"))));

    // remove: after sha null; base bytes were captured.
    const removed = byId.get("m5-remove-article");
    assert.equal(removed.afterSha256, null);
    assert.equal(removed.beforeSha256, shaOfBase(removed.path));
    assert.ok(!existsSync(path.join(docsRoot, ...removed.path.split("/"))));

    // title flip: both shas present and different.
    const flip = byId.get("m6-flip-front-matter-title");
    assert.equal(flip.beforeSha256, shaOfBase(flip.path));
    assert.equal(flip.afterSha256, shaOfSim(flip.path));
    assert.notEqual(flip.beforeSha256, flip.afterSha256);
    assert.ok(flip.afterTitle.endsWith("(synthetic successor title)"), "title flip must be deterministic and additive");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("real sim-wave3c: mutation manifest integrity against the read-only corpus", (t) => {
  if (!REAL_SIM_AVAILABLE) t.skip("sim-wave3c scratch artifacts not built yet");
  const manifest = JSON.parse(readFileSync(path.join(REAL_SIM_DIR, "mutation-manifest.json"), "utf8"));
  assert.equal(manifest.label, "sim-wave3c");
  assert.deepEqual(manifest.families, ["fundamentals", "onelake"]);
  assert.equal(manifest.mutations.length, 6);
  assert.match(manifest.mutationRevision, /^[0-9a-f]{64}$/);

  const shaOfBase = (rel) => sha256Buffer(readFileSync(path.join(corpusDocsRoot, ...rel.split("/"))));
  const shaOfSim = (rel) => sha256Buffer(readFileSync(path.join(REAL_SIM_DIR, "docs", ...rel.split("/"))));

  for (const mutation of manifest.mutations) {
    if (mutation.beforeSha256 !== null) {
      assert.equal(mutation.beforeSha256, shaOfBase(mutation.path), `before sha drift: ${mutation.id}`);
    }
    if (mutation.afterSha256 !== null) {
      const afterPath = mutation.pathAfter ?? mutation.path;
      assert.equal(mutation.afterSha256, shaOfSim(afterPath), `after sha drift: ${mutation.id}`);
    }
  }

  // The shared include mutation is the one the reverse dependency closure
  // exists for: it must target the top-level includes directory.
  const shared = manifest.mutations.find((m) => m.id === "m3-modify-shared-include");
  assert.equal(shared.path, "includes/product-name.md");
  assert.match(shared.detail, /reverse dependency closure/);
});
