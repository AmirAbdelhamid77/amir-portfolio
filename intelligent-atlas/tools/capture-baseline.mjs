#!/usr/bin/env node
// M0: preserve a byte-identical dated baseline of the isolated deliverable
// before V3.1 changes. Writes copies + SHA-256 fingerprints + repository state.
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { execFileSync } from "node:child_process";

const root = join(import.meta.dirname, "..", "..");
const atlas = join(root, "intelligent-atlas");
const stamp = "2026-11-01-pre-v31";
const out = join(atlas, "baselines", stamp);
const owned = [
  "prototype/index.html",
  "prototype/app.js",
  "prototype/styles.css",
  "prototype/data.js",
  "prototype/public-data.js",
  "prototype/data-provenance.json",
  "tools/analyze-corpus.mjs",
  "tools/semantic-model.mjs",
  "tools/build-prototype-data.mjs",
  "contracts/contracts.schema.json",
  "contracts/knowledge-dealer.md",
  "contracts/adapter-proof.mjs",
  "contracts/adapter-proof.test.mjs",
  "analysis/routes.json",
  "analysis/graph-build.json",
  "analysis/public-projection.json",
  "analysis/coverage-report.md",
  "DELIVERY_REPORT.md",
];

function sha(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

mkdirSync(join(out, "files"), { recursive: true });
const records = [];
for (const rel of owned) {
  const src = join(atlas, rel);
  if (!existsSync(src)) continue;
  const dest = join(out, "files", rel);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  records.push({ path: `intelligent-atlas/${rel}`, bytes: readFileSync(src).length, sha256: sha(src) });
}

let head = "unknown";
let status = [];
try {
  head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  status = execFileSync("git", ["status", "--porcelain=v1"], { cwd: root, encoding: "utf8" })
    .split(/\r?\n/).filter(Boolean);
} catch { /* not a git checkout */ }

const record = {
  kind: "hansa-knowledge-stage-dated-baseline",
  baselineId: stamp,
  capturedAt: "2026-11-01",
  scope: "NEXT_PHASE_REVIEW M0-M5; no app/ integration",
  repository: { head, dirtyPaths: status.length, dirtyEntries: status },
  preservedFiles: records,
  notes: [
    "Copies are byte-identical snapshots for rollback and comparison; they are not deployable.",
    "Candidate review payload data.js is preserved here but must not enter the public artifact.",
    "Inherited reference-verifier drift in lib/atlas/field.ts is outside this deliverable and was not altered.",
  ],
};
writeFileSync(join(out, "baseline.json"), JSON.stringify(record, null, 2) + "\n");
console.log(`Baseline ${stamp}: ${records.length} files, ${status.length} dirty repository paths, HEAD ${head}`);
console.log(relative(root, join(out, "baseline.json")));
