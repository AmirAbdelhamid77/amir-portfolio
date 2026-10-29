// Third, additive layer in the preservation chain: the 2026-10-26 continuation of the
// DP-600 Atlas expansion. It never rewrites the expansion baseline or its manifest; it
// records only the files this continuation owns and binds each before-hash to the exact
// state the previous layer recorded.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, sep } from "node:path";
import { circleReceipt } from "./atlas-circle-receipt.mjs";
export const CONTINUATION = "docs/knowledge-atlas/dp600-continuation/INTEGRATION_MANIFEST.json";
export const EXPANSION_MANIFEST = "docs/knowledge-atlas/dp600-expansion/INTEGRATION_MANIFEST.json";
export const CONTINUATION_SCOPE = "dp600-atlas-sql-kql-and-model-objectives-2026-10-26";
export function continuationReceipt(root) {
  const successor = circleReceipt(root);
  const path = resolve(root, CONTINUATION);
  if (!existsSync(path)) return { expected: (_path, before) => before };
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  assert.equal(manifest.scope, CONTINUATION_SCOPE);
  assert.equal(manifest.continuationOf, "dp600-question-intake-and-atlas-expansion-2026-10-26");
  const previousRaw = readFileSync(resolve(root, EXPANSION_MANIFEST));
  assert.equal(createHash("sha256").update(previousRaw).digest("hex"), manifest.previousManifestSha256, "The continuation must not rewrite the expansion manifest");
  const previous = JSON.parse(previousRaw.toString("utf8"));
  const previousHashes = new Map(previous.files.map(entry => [entry.path, entry.sha256]));
  assert.equal(new Set(manifest.files.map(entry => entry.path)).size, manifest.files.length, "Duplicate continuation path");
  for (const entry of manifest.files) {
    const absolute = resolve(root, entry.path);
    assert.ok(absolute.startsWith(root + sep), "Continuation path outside the repository");
    if (entry.chainBasis) {
      // Ignored build output whose previous bytes are recorded by another sealed layer
      // (for example PRESERVATION_BASELINE.json). The before-hash must match that record.
      const table = JSON.parse(readFileSync(resolve(root, entry.chainBasis), "utf8")).files;
      const recorded = Array.isArray(table) ? table.find(item => item.path === entry.path)?.sha256 : table[entry.path];
      assert.equal(recorded, entry.beforeSha256, "Unbound generated-artifact before-hash: " + entry.path);
    } else if (entry.beforeSha256 !== null) assert.equal(previousHashes.get(entry.path), entry.beforeSha256, "Unbound continuation before-hash: " + entry.path);
    else assert.ok(!previousHashes.has(entry.path), "New continuation file already existed in the previous layer: " + entry.path);
    assert.equal(createHash("sha256").update(readFileSync(absolute)).digest("hex"), successor.expected(entry.path, entry.sha256), "DP600 continuation drift: " + entry.path);
  }
  return {
    expected(path, before) {
      return successor.expected(path, manifest.files.find(entry => entry.path === path && entry.beforeSha256 === before)?.sha256 ?? before);
    },
  };
}
