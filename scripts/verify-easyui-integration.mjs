// Successor integrity only; no installation, publication, scoring or deployment.
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { loadPreservationHistory, loadRepairReceipt } from "./preservation-history.mjs";
import { implementationReceipt } from "./atlas-implementation-receipt.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const implementation = implementationReceipt(root);
const local = "docs/design-system/easyui-v2/";
const read = path => readFileSync(resolve(root, path));
const json = path => JSON.parse(read(path).toString("utf8"));
const hash = path => createHash("sha256").update(read(path)).digest("hex");
const manifest = json(local + "INTEGRATION_MANIFEST.json");
loadPreservationHistory(root);
const repair = loadRepairReceipt(root);
assert.equal(manifest.scope, "easyui-v2-native-ingestion-comparison");
assert.equal(new Set(manifest.files.map(file => file.path)).size, manifest.files.length);
for (const file of manifest.files) {
  assert.ok(resolve(root, file.path).startsWith(root + sep));
  assert.equal(hash(file.path), implementation.expected(file.path, file.sha256), "Owned drift: " + file.path);
}
const before = json(local + "PRESERVATION_BASELINE.json");
const atlasBefore = json("docs/knowledge-atlas/PRESERVATION_BASELINE.json");
for (const alias of manifest.legacyAtlasPathAliases) {
  assert.equal(atlasBefore.files[alias.path], alias.sha256, "Unbound legacy alias");
  assert.ok(resolve(root, alias.currentPath).startsWith(root + sep));
  assert.equal(hash(alias.currentPath), alias.sha256, "Relocated original drift: " + alias.path);
}
for (const [path, sha256] of Object.entries(before.files)) {
  if (manifest.modifiedExisting.includes(path) || repair.covers(path, sha256)) continue;
  assert.equal(hash(path), implementation.expected(path, sha256), "Unrelated pre-existing drift: " + path);
}
for (const path of ["package.json", "package-lock.json", "next.config.ts", "wrangler.jsonc", "lib/academy/ingestion.ts", "components/academy/ingestion-lab.tsx"]) {
  assert.equal(hash(path), before.files[path], "Protected contract: " + path);
}
const registry = json(local + "CONTEXTUAL_COMPONENT_REGISTRY.json");
assert.equal(registry.items.length, 22);
assert.equal(new Set(registry.items.map(item => item.id)).size, 22);
assert.equal(registry.items.filter(item => item.implementation === "original-native-pattern").length, 1);
for (const item of registry.items) {
  for (const path of item.localPaths) assert.ok(existsSync(resolve(root, path)), "Broken reuse path: " + path);
  assert.equal(item.registryTarget, null, "Unverified EasyUI install endpoint");
}
const walk = dir => readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(dir + "/" + entry.name) : [dir + "/" + entry.name]);
for (const dir of ["app", "lib", "components", "content", "public", "tests"]) {
  for (const path of walk(dir)) {
    if (Object.hasOwn(before.files, path)) continue;
    const change = manifest.runtimeChanges.find(change => change.path === path);
    assert.ok((change && change.beforeSha256 === null && implementation.expected(path,change.sha256) === hash(path)) || implementation.covers(path,null), "Unowned runtime addition: " + path);
  }
}
const provenance = json(local + "PACKAGE_PROVENANCE.json");
assert.equal(hash("docs/agent-handoffs/easyui-v2-2026-10-25/Hansa_EasyUI_Validated_Integration_Pack_V2_2026-10-25.zip"), provenance.zipSha256);
assert.equal(provenance.entries.length, 5);
for (const entry of provenance.entries.filter(entry => /COMPONENT_MATRIX/.test(entry.path))) assert.equal(hash(entry.path), entry.sha256);
console.log(`PASS: ${manifest.files.length} owned hashes; ${Object.keys(before.files).length - manifest.modifiedExisting.length} prior-file contracts verified (explicit repair receipts where applicable); 22 candidate decisions; five-entry archive; protected package/hosting/content/progress contracts.`);
