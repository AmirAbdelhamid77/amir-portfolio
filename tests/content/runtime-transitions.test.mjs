import assert from "node:assert/strict";
import test from "node:test";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  RUNTIME_BASELINES,
  RUNTIME_TRANSITIONS,
  loadRuntimeTransitions,
} from "../../scripts/runtime-transition-receipt.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const current = loadRuntimeTransitions(root);
const sandboxFiles = [
  RUNTIME_TRANSITIONS,
  ...RUNTIME_BASELINES,
  ...current.files.map(entry => entry.path),
];

function sandbox(mutate) {
  const dir = mkdtempSync(join(tmpdir(), "hansa-runtime-transition-"));
  for (const path of sandboxFiles) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    copyFileSync(join(root, path), join(dir, path));
  }
  const receiptPath = join(dir, RUNTIME_TRANSITIONS);
  const receipt = JSON.parse(readFileSync(receiptPath, "utf8"));
  mutate?.(receipt, dir);
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
  return dir;
}

function rejects(mutate, pattern) {
  const dir = sandbox(mutate);
  try {
    assert.throws(() => loadRuntimeTransitions(dir), pattern);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("the receipt covers exactly the four committed transitions with matching bytes", () => {
  assert.deepEqual(current.files.map(entry => entry.path).sort(), [
    "app/practice/page.tsx",
    "app/work/page.tsx",
    "next.config.ts",
    "package-lock.json",
  ]);
  for (const entry of current.files) {
    assert.equal(hash(readFileSync(join(root, entry.path))), entry.sha256, entry.path);
    assert.equal(current.entry(entry.path).beforeSha256, entry.beforeSha256);
    assert.equal(current.covers(entry.path, entry.beforeSha256), true);
    assert.equal(current.covers(entry.path, "0".repeat(64)), false);
    assert.equal(current.covers("app/layout.tsx", entry.beforeSha256), false);
  }
});

test("the receipt refuses paths outside the repository", () => {
  assert.throws(() => loadRuntimeTransitions(root, "../RUNTIME_TRANSITIONS.json"), /leaves the repository/);
});

test("the receipt refuses an unknown scope or baseline set", () => {
  rejects(receipt => { receipt.scope = "runtime-waiver"; }, /Unexpected runtime transition scope/);
  rejects(receipt => { receipt.baselines = [RUNTIME_BASELINES[0]]; }, /may only succeed the frozen baselines/);
});

test("the receipt only starts from a predecessor frozen in a baseline", () => {
  rejects(receipt => { receipt.files[0].beforeSha256 = "f".repeat(64); }, /Predecessor was never recorded/);
  rejects(receipt => { receipt.files[0].path = "app/layout.tsx"; }, /Predecessor was never recorded/);
});

test("the receipt fails when the working tree drifts after it was recorded", () => {
  rejects((receipt, dir) => {
    writeFileSync(join(dir, receipt.files[0].path), readFileSync(join(dir, receipt.files[0].path), "utf8") + " ");
  }, /byte drift/);
  rejects(receipt => { receipt.files[0].sha256 = "e".repeat(64); }, /Unrecorded drift/);
});

test("insert proofs must occur once and reverse to the preserved predecessor", () => {
  rejects(receipt => { receipt.files[0].proof.block = receipt.files[0].proof.block + "not in the file"; }, /Inserted block is absent/);
  rejects((receipt, dir) => {
    const text = readFileSync(join(dir, receipt.files[0].path), "utf8");
    receipt.files[0].proof.block = text.slice(0, 200);
  }, /does not reverse to the preserved predecessor/);
  rejects(receipt => { delete receipt.files[0].proof; }, /Unknown runtime transition proof/);
});

test("hash pins are limited to generated lockfiles and need a reason", () => {
  rejects(receipt => { receipt.files[0].proof = { kind: "hash-pin", reason: "A lock cannot be reversed line-by-line here." }; }, /only allowed for generated lockfiles/);
  rejects(receipt => { receipt.files[3].proof = { kind: "hash-pin" }; }, /Hash pin needs its reason/);
});

test("duplicate and no-op entries are rejected", () => {
  rejects(receipt => { receipt.files.push({ ...receipt.files[0] }); }, /Duplicate runtime transition/);
  rejects(receipt => { receipt.files[0].sha256 = receipt.files[0].beforeSha256; }, /must change bytes/);
  rejects(receipt => { receipt.files[0].commit = "a8e1d9b"; }, /full commit id/);
});
