// Exact before/after chain for the owner's explicitly authorized Atlas feature.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, sep } from "node:path";
import { expansionReceipt } from "./dp600-expansion-receipt.mjs";
export const ATLAS_IMPLEMENTATION = "docs/knowledge-atlas/implementation/INTEGRATION_MANIFEST.json";
export function implementationReceipt(root) {
  const successor = expansionReceipt(root);
  const path = resolve(root, ATLAS_IMPLEMENTATION);
  if (!existsSync(path)) return { covers: () => false, expected: (_path, before) => before };
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  assert.equal(manifest.scope, "atlas-peek-explorer-journey-and-home-cleanup");
  const before = JSON.parse(readFileSync(resolve(root, "docs/knowledge-atlas/implementation/START_BASELINE.json"), "utf8"));
  assert.equal(new Set(manifest.files.map(entry => entry.path)).size, manifest.files.length);
  for (const entry of manifest.files) {
    const absolute = resolve(root, entry.path); assert.ok(absolute.startsWith(root + sep));
    assert.equal(createHash("sha256").update(readFileSync(absolute)).digest("hex"), successor.expected(entry.path,entry.sha256), "Atlas feature drift " + entry.path);
    assert.equal(entry.beforeSha256, before.files[entry.path] ?? null, "Unbound Atlas before-hash");
  }
  return {
    covers(path, old) { return manifest.files.some(entry => entry.path === path && entry.beforeSha256 === old) || successor.expected(path,old)!==old; },
    expected(path, old) { return successor.expected(path,manifest.files.find(entry => entry.path === path && entry.beforeSha256 === old)?.sha256 ?? old); },
  };
}
