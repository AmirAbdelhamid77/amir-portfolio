import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ADDITION_BASELINES,
  GENERATED_RUNTIME_ROOTS,
  RUNTIME_ADDITION_SCOPE,
  RUNTIME_ADDITIONS,
  isGeneratedRuntimePath,
  loadRuntimeAdditions,
} from "../../scripts/runtime-additions-receipt.mjs";
import { discoverAdditions } from "../../scripts/build-runtime-additions-receipt.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const current = loadRuntimeAdditions(root);
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const COMMIT = "a".repeat(40);
const OTHER_COMMIT = "b".repeat(40);

function sandbox(mutate = receipt => receipt) {
  const dir = mkdtempSync(join(tmpdir(), "hansa-runtime-additions-"));
  for (const baselinePath of ADDITION_BASELINES) {
    mkdirSync(dirname(join(dir, baselinePath)), { recursive: true });
    writeFileSync(
      join(dir, baselinePath),
      JSON.stringify({ files: { "app/frozen.ts": "f".repeat(64) } }),
    );
  }
  mkdirSync(join(dir, "app"), { recursive: true });
  writeFileSync(join(dir, "app/new.ts"), "new!");
  const receipt = mutate({
    scope: RUNTIME_ADDITION_SCOPE,
    date: "2026-11-08",
    reason: "Reviewed additions used only by the loader contract test.",
    baselines: [...ADDITION_BASELINES],
    waves: [
      {
        id: "wave-one",
        title: "Wave one",
        review: "A synthetic reviewed wave long enough for the loader contract.",
        commits: [COMMIT],
        files: [{ path: "app/new.ts", bytes: 4, sha256: hash("new!"), commit: COMMIT }],
      },
    ],
  });
  const receiptPath = join(dir, RUNTIME_ADDITIONS);
  mkdirSync(dirname(receiptPath), { recursive: true });
  writeFileSync(receiptPath, JSON.stringify(receipt));
  return dir;
}

function rejects(mutate, pattern) {
  const dir = sandbox(mutate);
  try {
    assert.throws(() => loadRuntimeAdditions(dir), pattern);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("the committed receipt covers every post-baseline runtime addition with provenance", () => {
  const discovered = discoverAdditions(root);
  assert.deepEqual(
    current.files.map(entry => entry.path).sort(),
    discovered,
    "the receipt must pin exactly the files the baselines do not cover",
  );
  assert.ok(current.waves.length >= 6);
  assert.equal(new Set(current.files.map(entry => entry.path)).size, current.files.length);
  assert.equal(
    current.waves.reduce((sum, wave) => sum + wave.files.length, 0),
    current.files.length,
  );

  const commits = new Set(current.files.map(entry => entry.commit));
  for (const commit of commits) {
    assert.match(commit, /^[a-f0-9]{40}$/);
    execFileSync("git", ["cat-file", "-e", `${commit}^{commit}`], { cwd: root, stdio: "ignore" });
  }
  for (const entry of current.files) {
    execFileSync("git", ["ls-files", "--error-unmatch", "--", entry.path], {
      cwd: root,
      stdio: "ignore",
    });
    assert.equal(
      hash(readFileSync(join(root, entry.path))),
      entry.sha256,
      `hash drift: ${entry.path}`,
    );
  }
});

test("every generated corpus root is excluded", () => {
  for (const prefix of GENERATED_RUNTIME_ROOTS) {
    assert.equal(isGeneratedRuntimePath(prefix + "example.png"), true);
  }
  assert.equal(isGeneratedRuntimePath("public/fabric-additions/litware/images/data_to_analyze.jpg"), false);
  assert.equal(isGeneratedRuntimePath("learn/fabric/index.html"), false);
});

test("the strict loader accepts a reviewed synthetic addition", () => {
  const dir = sandbox();
  try {
    const loaded = loadRuntimeAdditions(dir);
    assert.equal(loaded.files.length, 1);
    assert.equal(loaded.covers("app/new.ts"), true);
    assert.equal(loaded.entry("app/new.ts").wave, "wave-one");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a changed hash or byte count is rejected", () => {
  rejects(receipt => {
    receipt.waves[0].files[0].sha256 = "0".repeat(64);
  }, /hash drift/);
  rejects(receipt => {
    receipt.waves[0].files[0].bytes = 5;
  }, /byte drift/);
});

test("a baseline path, generated output or path escape cannot be pinned", () => {
  rejects(receipt => {
    receipt.waves[0].files[0].path = "app/frozen.ts";
  }, /frozen baseline/);
  rejects(receipt => {
    receipt.waves[0].files[0].path = "public/fabric-docs-assets/image.png";
  }, /Generated corpus output/);
  rejects(receipt => {
    receipt.waves[0].files[0].path = "../outside.ts";
  }, /escapes the repository/);
});

test("duplicate files, unknown commits and short reviews are rejected", () => {
  rejects(receipt => {
    receipt.waves[0].files.push({ ...receipt.waves[0].files[0] });
  }, /Duplicate runtime addition/);
  rejects(receipt => {
    receipt.waves[0].files[0].commit = OTHER_COMMIT;
  }, /not part of its wave/);
  rejects(receipt => {
    receipt.waves[0].review = "too short";
  }, /needs a review note/);
  rejects(receipt => {
    receipt.waves[0].files[0].commit = "not-a-commit";
  }, /needs its introducing commit/);
});

test("a receipt cannot overwrite its baselines or omit them", () => {
  rejects(receipt => {
    receipt.baselines = [ADDITION_BASELINES[0]];
  }, /may only succeed the frozen baselines/);
  rejects(receipt => {
    receipt.scope = "something-else";
  }, /Unexpected runtime addition scope/);
});
