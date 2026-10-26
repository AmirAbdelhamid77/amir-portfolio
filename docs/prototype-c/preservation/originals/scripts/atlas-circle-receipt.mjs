import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, sep } from "node:path";
export const CIRCLES = "docs/knowledge-atlas/circular-nodes/INTEGRATION_MANIFEST.json";
export function circleReceipt(root) {
  if (!existsSync(resolve(root, CIRCLES))) return { expected: (_path, old) => old };
  const manifest = JSON.parse(readFileSync(resolve(root, CIRCLES), "utf8"));
  const hash = path => createHash("sha256").update(readFileSync(resolve(root, path))).digest("hex");
  assert.equal(manifest.scope, "atlas-circular-concept-nodes-2026-10-26");
  assert.equal(hash(manifest.previousManifest), manifest.previousManifestSha256, "Prior continuation receipt must stay immutable");
  const previous = JSON.parse(readFileSync(resolve(root, manifest.previousManifest), "utf8"));
  assert.equal(new Set(manifest.files.map(entry => entry.path)).size, manifest.files.length);
  for (const entry of manifest.files) {
    assert.ok(resolve(root, entry.path).startsWith(root + sep));
    if (entry.beforeSha256 !== null) {
      assert.equal(previous.files.find(item => item.path === entry.path)?.sha256, entry.beforeSha256, "Unbound circular-node predecessor: " + entry.path);
      assert.equal(hash("docs/knowledge-atlas/circular-nodes/before/" + entry.path), entry.beforeSha256, "Rollback bytes changed");
    } else assert.ok(!previous.files.some(item => item.path === entry.path), "New path already sealed by prior layer");
    assert.equal(hash(entry.path), entry.sha256, "Circular-node drift: " + entry.path);
  }
  return { expected(path, before) { return manifest.files.find(entry => entry.path === path && entry.beforeSha256 === before)?.sha256 ?? before; } };
}
