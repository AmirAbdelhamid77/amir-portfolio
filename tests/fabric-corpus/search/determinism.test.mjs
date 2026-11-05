// FC07 — determinism: two builder runs over the same inputs are byte-identical,
// and the deployed public tree matches the manifest checksums (sha256) so QA
// can prove it tested the shards that shipped.
//
// The full Wave-2 rebuild is ~3 s; the determinism half rebuilds two small
// families twice into temp dirs (outside the repo) and byte-compares every
// file. The checksum half verifies the DEPLOYED public tree without rebuilding.
//
//   node --experimental-strip-types --test tests/fabric-corpus/search/
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  loadPublicManifest,
  publicVersionDir,
  REPO_ROOT,
  REGISTRY_PATH,
  tempBuildOut,
} from "./helpers.mjs";

const manifest = loadPublicManifest();

test("build-shards determinism: two runs are byte-identical", async () => {
  const { buildShards } = await import("../../../tools/fabric-corpus/search/build-shards.mjs");
  const outA = tempBuildOut("det-a");
  const outB = tempBuildOut("det-b");
  const runA = buildShards({ argv: ["--families=fundamentals,admin", `--out=${outA}`] });
  const runB = buildShards({ argv: ["--families=fundamentals,admin", `--out=${outB}`] });
  assert.equal(runA.version, runB.version, "content-derived version matches across runs");

  const { readdirSync } = await import("node:fs");
  const filesA = readdirSync(outA).sort();
  const filesB = readdirSync(outB).sort();
  assert.deepEqual(filesA, filesB);
  for (const name of filesA) {
    const bytesA = readFileSync(path.join(outA, name));
    const bytesB = readFileSync(path.join(outB, name));
    assert.ok(bytesA.equals(bytesB), `${name} differs between runs`);
    // No clock anywhere in the output: check JSON keys (a bare substring scan
    // would match ordinary content words like "timestamp" inside article text).
    const parsed = JSON.parse(bytesA.toString("utf8"));
    const keys = new Set();
    const collect = (node) => {
      if (Array.isArray(node)) node.forEach(collect);
      else if (node && typeof node === "object") {
        for (const [key, value] of Object.entries(node)) {
          keys.add(key);
          collect(value);
        }
      }
    };
    collect(parsed);
    for (const key of keys) {
      assert.ok(!/generatedAt|builtAt|generated_at/i.test(key), `${name} carries a clock key: ${key}`);
    }
  }
  assert.ok(runA.stats.shards > 0);
});

test("deployed public tree matches the manifest checksums", { skip: !manifest && "public fabric-search tree not built" }, () => {
  const versionDir = publicVersionDir(manifest);
  for (const file of manifest.files) {
    const abs = path.join(versionDir, file.name);
    assert.ok(existsSync(abs), `${file.name} present`);
    const bytes = readFileSync(abs);
    const digest = createHash("sha256").update(bytes).digest("hex");
    assert.equal(digest, file.sha256, `${file.name} sha256 matches the manifest`);
    assert.equal(bytes.byteLength, file.bytes, `${file.name} byte length matches the manifest`);
  }
  // The content-hashed filenames agree with the content they carry:
  //   shard-<sha8> names hash the article payload (the articles array, the
  //   version-independent content); routing-<sha8> hashes the routing payload
  //   without the version envelope. The manifest's sha256 covers whole files.
  for (const file of manifest.files) {
    const hashInName = /shard-([0-9a-f]{8})\.json|routing-([0-9a-f]{8})\.json/.exec(file.name);
    assert.ok(hashInName, `${file.name} is content-hashed`);
    const parsed = JSON.parse(readFileSync(path.join(versionDir, file.name), "utf8"));
    let digest;
    if (file.role === "shard") {
      digest = createHash("sha256").update(JSON.stringify(parsed.articles)).digest("hex").slice(0, 8);
    } else {
      // Routing payload: the object without its version key (same key order
      // the builder hashed).
      const payload = {
        schema: parsed.schema,
        wildcardThreshold: parsed.wildcardThreshold,
        wildcardTokens: parsed.wildcardTokens,
        tokens: parsed.tokens,
      };
      digest = createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 8);
    }
    assert.equal(digest, hashInName[1] ?? hashInName[2], `${file.name} name hash equals payload hash prefix`);
  }
  // The public pointer manifest equals the versioned manifest (manifest.json
  // ships once at public/fabric-search/, the version dir carries only the
  // content-hashed files listed in it).
  const pointer = readFileSync(path.join(REPO_ROOT, "public", "fabric-search", "manifest.json"), "utf8");
  const parsed = JSON.parse(pointer);
  assert.equal(parsed.version, manifest.version);
  assert.equal(parsed.shardCount, manifest.files.filter((file) => file.role === "shard").length);
  void REGISTRY_PATH;
});

test("manifest version is content-derived (revisions + shard set), no clock", { skip: (!manifest || !existsSync(REGISTRY_PATH)) && "public fabric-search tree or route registry not available" }, () => {
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
  assert.equal(manifest.corpusRevision, registry.corpusRevision);
  assert.equal(manifest.registryRevision, registry.registryRevision);
  assert.match(manifest.version, /^v[0-9a-f]{16}$/);
  const shardIds = manifest.files
    .filter((file) => file.role === "shard")
    .map((file) => /shard-[0-9a-f]{8}\.json/.exec(file.name)[0].replace(/\.json$/, ""));
  const versionSource = JSON.stringify({
    corpusRevision: registry.corpusRevision,
    registryRevision: registry.registryRevision,
    families: manifest.families.slice().sort(),
    shardIds: shardIds.slice().sort(),
  });
  const expected = `v${createHash("sha256").update(versionSource).digest("hex").slice(0, 16)}`;
  assert.equal(manifest.version, expected, "version reproduces from its documented inputs");
});
