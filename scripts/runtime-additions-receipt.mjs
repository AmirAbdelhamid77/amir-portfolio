// Reviewed additions after the two frozen preservation baselines. This is not
// a waiver: every entry is a committed runtime file that did not exist in
// either baseline, pinned to the exact bytes on disk and to the commit that
// introduced it. Generated corpus outputs stay outside Git and are never
// pinned here; they are covered by the corpus build contract instead.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, sep } from "node:path";

export const RUNTIME_ADDITIONS = "docs/preservation-history/2026-11-08/RUNTIME_ADDITIONS.json";
export const RUNTIME_ADDITION_SCOPE = "reviewed-runtime-additions-after-preservation-baselines";
export const ADDITION_BASELINES = [
  "docs/knowledge-atlas/PRESERVATION_BASELINE.json",
  "docs/design-system/easyui-v2/PRESERVATION_BASELINE.json",
];
// Generated from the external corpus and gitignored by contract. They ship in
// the export but are not committed, so they cannot be preservation additions.
export const GENERATED_RUNTIME_ROOTS = [
  "public/fabric-docs-assets/",
  "public/fabric-aliases/",
  "public/fabric-search/",
];
const HASH = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;

export function isGeneratedRuntimePath(path) {
  const normal = path.split(sep).join("/");
  return GENERATED_RUNTIME_ROOTS.some((root) => normal.startsWith(root));
}

export function loadRuntimeAdditions(root, receiptPath = RUNTIME_ADDITIONS) {
  const checkout = resolve(root);
  const inside = (path) => {
    const absolute = resolve(checkout, path);
    assert.ok(absolute.startsWith(checkout + sep), "Runtime addition path leaves the repository: " + path);
    return absolute;
  };
  const receiptFile = inside(receiptPath);
  assert.ok(existsSync(receiptFile), "Missing runtime additions receipt: " + receiptPath);
  const receipt = JSON.parse(readFileSync(receiptFile, "utf8").replace(/^\uFEFF/, ""));
  assert.equal(receipt.scope, RUNTIME_ADDITION_SCOPE, "Unexpected runtime addition scope");
  assert.equal(receipt.date, "2026-11-08", "Unexpected runtime addition date");
  assert.ok(typeof receipt.reason === "string" && receipt.reason.length >= 40, "Runtime additions need a stated reason");
  assert.ok(Array.isArray(receipt.baselines), "Runtime additions must name their baselines");
  assert.deepEqual([...receipt.baselines].sort(), [...ADDITION_BASELINES].sort(), "Runtime additions may only succeed the frozen baselines");

  // Additions cannot rewrite a path the baselines already protect.
  const frozen = new Set();
  for (const baselinePath of ADDITION_BASELINES) {
    const baseline = JSON.parse(readFileSync(inside(baselinePath), "utf8").replace(/^\uFEFF/, ""));
    for (const path of Object.keys(baseline.files)) frozen.add(path);
  }

  const entries = new Map();
  const waves = [];
  assert.ok(Array.isArray(receipt.waves) && receipt.waves.length > 0, "Runtime additions need at least one reviewed wave");
  for (const wave of receipt.waves) {
    assert.ok(typeof wave.id === "string" && wave.id.length >= 3, "Runtime addition wave needs an id");
    assert.ok(typeof wave.title === "string" && wave.title.length >= 3, "Runtime addition wave needs a title");
    assert.ok(typeof wave.review === "string" && wave.review.length >= 40, "Runtime addition wave needs a review note");
    assert.ok(Array.isArray(wave.commits) && wave.commits.length > 0, "Runtime addition wave needs commits");
    for (const commit of wave.commits) assert.match(commit, COMMIT, "Runtime addition wave needs full commit ids");
    assert.ok(Array.isArray(wave.files) && wave.files.length > 0, "Runtime addition wave needs files");

    for (const entry of wave.files) {
      assert.ok(typeof entry.path === "string" && entry.path.length > 0, "Runtime addition without a path");
      assert.ok(!entry.path.split(/[\\/]/).includes(".."), "Runtime addition path escapes the repository: " + entry.path);
      assert.ok(!isGeneratedRuntimePath(entry.path), "Generated corpus output cannot be pinned as a runtime addition: " + entry.path);
      assert.ok(!entries.has(entry.path), "Duplicate runtime addition: " + entry.path);
      assert.ok(!frozen.has(entry.path), "A runtime addition cannot overwrite a frozen baseline path: " + entry.path);
      assert.match(entry.sha256, HASH, "Invalid runtime addition hash: " + entry.path);
      assert.match(entry.commit, COMMIT, "Runtime addition needs its introducing commit: " + entry.path);
      assert.ok(wave.commits.includes(entry.commit), "Runtime addition commit is not part of its wave: " + entry.path);
      const bytes = readFileSync(inside(entry.path));
      assert.equal(bytes.length, entry.bytes, "Runtime addition byte drift: " + entry.path);
      assert.equal(createHash("sha256").update(bytes).digest("hex"), entry.sha256, "Runtime addition hash drift: " + entry.path);
      entries.set(entry.path, Object.freeze({ ...entry, wave: wave.id }));
    }
    waves.push(Object.freeze({ id: wave.id, title: wave.title, review: wave.review, commits: [...wave.commits], files: wave.files.map((entry) => entry.path) }));
  }

  assert.ok(entries.size > 0, "Runtime additions receipt is empty");
  return {
    path: receiptPath,
    waves,
    files: [...entries.values()],
    covers: (path) => entries.has(path),
    entry: (path) => entries.get(path) ?? null,
    isGenerated: isGeneratedRuntimePath,
  };
}
