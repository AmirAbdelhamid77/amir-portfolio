// Narrow, reversible successor for committed runtime transitions. This is not a
// waiver: every entry must start from a hash a preservation baseline recorded,
// must still match the bytes on disk, and must either reverse line-by-line to
// that predecessor or be a generated lockfile pinned by exact hash.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, sep } from "node:path";

export const RUNTIME_TRANSITIONS = "docs/preservation-history/2026-11-08/RUNTIME_TRANSITIONS.json";
export const RUNTIME_TRANSITION_SCOPE = "committed-runtime-transitions-after-preservation-baselines";
export const RUNTIME_BASELINES = [
  "docs/knowledge-atlas/PRESERVATION_BASELINE.json",
  "docs/design-system/easyui-v2/PRESERVATION_BASELINE.json",
];
// A generated lock cannot be reversed line-by-line; only those files may use a
// hash pin, so the receipt can never become a general hash waiver.
export const LOCKFILE_PATHS = new Set([
  "package-lock.json",
  "npm-shrinkwrap.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lockb",
  "bun.lock",
]);
const HASH = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const inside = (root, path) => {
  const absolute = resolve(root, path);
  assert.ok(absolute.startsWith(root + sep), "Runtime transition path leaves the repository: " + path);
  return absolute;
};

export function loadRuntimeTransitions(root, receiptPath = RUNTIME_TRANSITIONS) {
  const receiptFile = inside(root, receiptPath);
  assert.ok(existsSync(receiptFile), "Missing runtime transition receipt: " + receiptPath);
  const receipt = JSON.parse(readFileSync(receiptFile, "utf8").replace(/^\uFEFF/, ""));
  assert.equal(receipt.scope, RUNTIME_TRANSITION_SCOPE, "Unexpected runtime transition scope");
  assert.equal(receipt.date, "2026-11-08", "Unexpected runtime transition date");
  assert.ok(typeof receipt.reason === "string" && receipt.reason.length >= 40, "Runtime transitions need a stated reason");
  assert.ok(Array.isArray(receipt.baselines), "Runtime transitions must name their baselines");
  assert.deepEqual([...receipt.baselines].sort(), [...RUNTIME_BASELINES].sort(), "Runtime transitions may only succeed the frozen baselines");

  // The predecessor is not taken on trust: it must be one of the hashes already
  // frozen in a baseline, so a receipt can only advance a recorded transition.
  const frozen = new Map();
  for (const baselinePath of RUNTIME_BASELINES) {
    const baseline = JSON.parse(readFileSync(inside(root, baselinePath), "utf8").replace(/^\uFEFF/, ""));
    for (const [path, sha256] of Object.entries(baseline.files)) {
      if (!frozen.has(path)) frozen.set(path, new Set());
      frozen.get(path).add(sha256);
    }
  }

  const entries = new Map();
  for (const entry of receipt.files) {
    const path = entry.path;
    assert.ok(typeof path === "string" && path.length > 0, "Runtime transition without a path");
    assert.ok(!entries.has(path), "Duplicate runtime transition: " + path);
    assert.match(entry.beforeSha256, HASH, "Invalid predecessor hash: " + path);
    assert.match(entry.sha256, HASH, "Invalid successor hash: " + path);
    assert.notEqual(entry.sha256, entry.beforeSha256, "A transition must change bytes: " + path);
    assert.ok(frozen.get(path)?.has(entry.beforeSha256), "Predecessor was never recorded in a preservation baseline: " + path);
    assert.match(entry.commit, COMMIT, "Runtime transition needs a full commit id: " + path);
    assert.ok(typeof entry.layer === "string" && entry.layer.length >= 8, "Runtime transition needs a provenance layer: " + path);
    assert.ok(typeof entry.note === "string" && entry.note.length >= 40, "Runtime transition needs a review note: " + path);

    const current = readFileSync(inside(root, path));
    assert.equal(current.length, entry.bytes, "Runtime transition byte drift: " + path);
    assert.equal(digest(current), entry.sha256, "Unrecorded drift after the transition receipt: " + path);

    if (entry.proof?.kind === "insert-block") {
      const block = entry.proof.block;
      assert.ok(typeof block === "string" && block.length > 0, "Insert proof needs the inserted block: " + path);
      const text = current.toString("utf8");
      const first = text.indexOf(block);
      assert.ok(first >= 0, "Inserted block is absent from current bytes: " + path);
      assert.equal(text.indexOf(block, first + 1), -1, "Inserted block is ambiguous: " + path);
      // Removing the block must reproduce the preserved predecessor exactly.
      assert.equal(digest(Buffer.from(text.slice(0, first) + text.slice(first + block.length), "utf8")), entry.beforeSha256, "Inserted block does not reverse to the preserved predecessor: " + path);
    } else if (entry.proof?.kind === "hash-pin") {
      assert.ok(LOCKFILE_PATHS.has(path), "Hash pins are only allowed for generated lockfiles: " + path);
      assert.ok(typeof entry.proof.reason === "string" && entry.proof.reason.length >= 40, "Hash pin needs its reason: " + path);
    } else {
      assert.fail("Unknown runtime transition proof for " + path);
    }
    entries.set(path, Object.freeze({ ...entry, proof: Object.freeze({ ...entry.proof }) }));
  }
  assert.ok(entries.size > 0, "Runtime transition receipt is empty");

  return {
    path: receiptPath,
    files: [...entries.values()],
    entry: path => entries.get(path) ?? null,
    covers(path, before) {
      const entry = entries.get(path);
      return !!entry && entry.beforeSha256 === before;
    },
    sha256: path => entries.get(path)?.sha256 ?? null,
  };
}
