// FC13 — comparator determinism: two independent renders of the same inputs
// are byte-identical (repo contract: "deterministic outputs (no clock in
// artifacts)").
//
//   node --experimental-strip-types --test tests/fabric-corpus/comparator/
//
// Writes two small comparator sites under the build workspace (never the
// repo), byte-compares every file, and leaves no artifacts behind on success.
// The full-corpus two-run proof lives in the FC13 report (site-manifest
// sha256 equality across independent full renders, both profiles).

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..", "..");
const buildDir =
  process.env.FABRIC_CORPUS_BUILD_DIR ?? path.join(repoRoot, "..", "fabric-corpus-build");
const registryPath = path.join(buildDir, "route-registry", "route-registry.json");

const renderer = path.join(repoRoot, "tools", "fabric-corpus", "bench-comparator", "render-static-html.mjs");
const LIMIT = 80; // deterministic subset (first 80 published rows) — bounded test cost

function walk(root) {
  const out = [];
  const rec = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) rec(full);
      else out.push({ rel: path.relative(root, full).split(path.sep).join("/"), file: full });
    }
  };
  rec(root);
  return out;
}

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function render(profile, outDir) {
  execFileSync(
    process.execPath,
    [
      "--experimental-strip-types",
      renderer,
      "--profile",
      profile,
      "--limit",
      String(LIMIT),
      "--out",
      outDir,
      "--quiet",
    ],
    { cwd: repoRoot, stdio: ["ignore", "pipe", "pipe"] },
  );
}

function scratch(profile, suffix) {
  return path.join(buildDir, "comparator", `_test-det-${profile}-${suffix}`);
}

for (const profile of ["root", "subpath"]) {
  test(`comparator determinism [${profile}]: two renders byte-identical + manifest has no clock`, (t) => {
    if (!existsSync(registryPath)) {
      t.skip("route registry missing — run route-registry/build-registry.mjs first");
    }
    const dirA = scratch(profile, "a");
    const dirB = scratch(profile, "b");
    t.after(() => {
      rmSync(dirA, { recursive: true, force: true });
      rmSync(dirB, { recursive: true, force: true });
    });
    rmSync(dirA, { recursive: true, force: true });
    rmSync(dirB, { recursive: true, force: true });

    render(profile, path.join(dirA, "site"));
    render(profile, path.join(dirB, "site"));

    // 1. Byte identity of every emitted file across the two independent runs.
    const filesA = walk(path.join(dirA, "site"));
    assert.ok(filesA.length > LIMIT, `expected a populated site, got ${filesA.length} files`);
    const mapB = new Map(walk(path.join(dirB, "site")).map((f) => [f.rel, f.file]));
    assert.equal(filesA.length, mapB.size, "same file count across runs");
    const differing = [];
    for (const f of filesA) {
      const other = mapB.get(f.rel);
      if (!other) differing.push(`missing in run B: ${f.rel}`);
      else if (sha256(f.file) !== sha256(other)) differing.push(f.rel);
    }
    assert.deepEqual(differing, [], "every emitted file must be byte-identical across independent renders");

    // 2. The site manifest is deterministic and clock-free: its recorded
    //    hash is exactly the hash of its own (sorted) file list.
    const manifest = JSON.parse(readFileSync(path.join(dirA, "site-manifest.json"), "utf8"));
    assert.equal(manifest.schema, "hansa.fabric-comparator-site-manifest/1");
    assert.equal(manifest.profile, profile);
    const h = createHash("sha256");
    for (const f of manifest.files) h.update(`${f.rel} ${f.bytes}\n`);
    assert.equal(h.digest("hex"), manifest.contentSha256, "manifest hash reproducible from its file list");
    const manifestText = readFileSync(path.join(dirA, "site-manifest.json"), "utf8");
    assert.equal(manifestText.includes("timestamp"), false, "no clock fields in the manifest");
    assert.equal(manifestText.includes("renderMs"), false, "no timing fields in the manifest");
    // The render report carries the same site hash (it is the one place
    // timing is allowed, as bench evidence).
    const report = JSON.parse(readFileSync(path.join(dirA, "render-report.json"), "utf8"));
    assert.equal(report.determinism.siteManifestSha256, manifest.contentSha256);
  });
}
