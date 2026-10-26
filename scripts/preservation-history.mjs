// Evidence-backed evolution of old preservation snapshots. No wildcard waivers.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, sep } from "node:path";
import { implementationReceipt } from "./atlas-implementation-receipt.mjs";

export const HISTORY = "docs/preservation-history/2026-10-25/";
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const allowedSources = ["package.json", "scripts/import-notion-data-viz.mjs", "scripts/import-notion-statistics.mjs"];
export function loadPreservationHistory(root) {
  const implementation = implementationReceipt(root);
  const safe = path => { const absolute = resolve(root, path); assert.ok(absolute.startsWith(root + sep), "Outside repository"); return absolute; };
  const raw = path => readFileSync(safe(path));
  const json = path => JSON.parse(raw(path).toString("utf8"));
  const hash = path => digest(raw(path));
  const data = json(HISTORY + "RECONCILIATION.json");
  const repairStart = json(HISTORY + "START_BASELINE.json");
  assert.deepEqual(data.testFiles, Object.fromEntries(Object.entries(repairStart.files).filter(([path]) => path.startsWith("tests/"))), "Test evidence differs from the immutable repair starting inventory");
  assert.equal(data.version, "1.0");
  for (const entry of Object.values(data.originalBaselines)) assert.equal(hash(entry.path), entry.sha256, "Original snapshot drift");
  const atlas = json(data.originalBaselines.atlas.path);
  assert.equal(hash("docs/knowledge-atlas/PRESERVATION_BASELINE.json"), data.originalBaselines.atlas.sha256, "Atlas historical baseline must stay immutable");
  assert.deepEqual(data.sourceTransitions.map(entry => entry.path).sort(), [...allowedSources].sort());
  for (const entry of data.sourceTransitions) {
    assert.equal(atlas.files[entry.path], entry.beforeSha256);
    assert.equal(hash(entry.originalPath), entry.beforeSha256, "Original source drift");
    assert.equal(hash(entry.path), entry.afterSha256, "Current source differs from audited transition");
    const before = raw(entry.originalPath).toString("utf8").replaceAll("\r\n", "\n");
    const after = raw(entry.path).toString("utf8").replaceAll("\r\n", "\n");
    if (entry.path === "package.json") {
      const expected = JSON.parse(before);
      assert.equal(expected.scripts["import:data-viz"], 'node scripts/import-notion-data-viz.mjs --source "Data Visualization"');
      expected.scripts["import:data-viz"] = 'node scripts/import-notion-data-viz.mjs --source "intake/source-exports/data-visualization"';
      assert.deepEqual(JSON.parse(after), expected, "Package migration may only change the source path");
    } else if (entry.path === "scripts/import-notion-data-viz.mjs") {
      let expected = before
        .replace('--source "Data Visualization"', '--source "intake/source-exports/data-visualization"')
        .replace('$DATA_VIZ_EXPORT or "Data Visualization"', '$DATA_VIZ_EXPORT or "intake/source-exports/data-visualization"')
        .replace('process.env.DATA_VIZ_EXPORT ?? "Data Visualization"', 'process.env.DATA_VIZ_EXPORT ?? "intake/source-exports/data-visualization"');
      const oldLine = 'const SOURCE = path.resolve(ROOT, option("--source", process.env.DATA_VIZ_EXPORT ?? "intake/source-exports/data-visualization"));';
      assert.ok(expected.includes(oldLine));
      expected = expected.replace(oldLine, 'const SOURCE = path.resolve(\n  ROOT,\n  option("--source", process.env.DATA_VIZ_EXPORT ?? "intake/source-exports/data-visualization"),\n);');
      assert.equal(after, expected, "Data Visualization importer migration contains another edit");
    } else {
      assert.equal(after, before.replace('process.env.STATISTICS_EXPORT ?? "Comprehensive Statistics Reference"', 'process.env.STATISTICS_EXPORT ?? "intake/source-exports/statistics"'), "Statistics importer migration contains another edit");
    }
  }
  const originalAcademy = json(data.originalBaselines.academy.path);
  const expectedAcademy = structuredClone(originalAcademy);
  const config = expectedAcademy.config.find(entry => entry.path === "package.json");
  const packageTransition = data.sourceTransitions.find(entry => entry.path === "package.json");
  assert.equal(config.sha256, packageTransition.beforeSha256);
  config.sha256 = packageTransition.afterSha256;
  assert.deepEqual(json(data.academyBaselineTransition.path), expectedAcademy, "Baseline changed beyond the proven package source-path migration");
  assert.equal(hash(data.academyBaselineTransition.path), data.academyBaselineTransition.afterSha256);
  assert.equal(data.academyBaselineTransition.beforeSha256, data.originalBaselines.academy.sha256);
  assert.equal(data.legacyAliases.length, 90);
  assert.equal(new Set(data.legacyAliases.map(entry => entry.path)).size, 90);
  for (const entry of data.legacyAliases) {
    assert.equal(atlas.files[entry.path], entry.sha256, "Unbound relocation");
    assert.equal(hash(entry.currentPath), entry.sha256, "Relocated source drift");
    if (entry.path.startsWith("Data Visualization/")) assert.equal(hash("intake/source-exports/data-visualization/" + entry.path.slice("Data Visualization/".length)), entry.sha256, "Active importer source differs from the original export");
    if (entry.path.startsWith("Comprehensive Statistics Reference/")) assert.equal(hash("intake/source-exports/statistics/" + entry.path.slice("Comprehensive Statistics Reference/".length)), entry.sha256, "Active statistics source differs from the original export");
  }
  for (const [path, sha256] of Object.entries(data.testFiles)) assert.equal(hash(path), implementation.expected(path, sha256), "Existing test was changed outside a bound successor: " + path);
  assert.equal(hash(data.registrySnapshotLicense.path), data.registrySnapshotLicense.sha256);
  return {
    data,
    relocatedPath(path, before) { return data.legacyAliases.find(entry => entry.path === path && entry.sha256 === before)?.currentPath; },
    expectedCurrentHash(path, before) {
      return [...data.sourceTransitions, data.academyBaselineTransition].find(entry => entry.path === path && entry.beforeSha256 === before)?.afterSha256 ?? before;
    },
  };
}

export function loadRepairReceipt(root) {
  const implementation = implementationReceipt(root);
  const path = resolve(root, HISTORY + "REPAIR_MANIFEST.json");
  assert.ok(existsSync(path), "Missing repair receipt");
  const receipt = JSON.parse(readFileSync(path, "utf8"));
  assert.equal(receipt.scope, "source-backed-preservation-repair");
  const baseline = JSON.parse(readFileSync(resolve(root, HISTORY + "START_BASELINE.json"), "utf8"));
  const allowed = ["docs/dp600-academy/PHASE_0_PRESERVATION_BASELINE.json", "scripts/verify-knowledge-atlas.mjs", "scripts/verify-easyui-integration.mjs", "docs/knowledge-atlas/INTEGRATION_MANIFEST.json", "docs/design-system/easyui-v2/INTEGRATION_MANIFEST.json", "docs/design-system/easyui-v2/INTEGRATION_REPORT.md"];
  assert.deepEqual([...receipt.modifiedExisting].sort(), allowed.sort());
  for (const entry of receipt.files) {
    const absolute = resolve(root, entry.path);
    assert.ok(absolute.startsWith(root + sep));
    assert.equal(digest(readFileSync(absolute)), implementation.expected(entry.path, entry.sha256), "Repair-owned drift " + entry.path);
    if (receipt.modifiedExisting.includes(entry.path)) assert.equal(baseline.files[entry.path], entry.beforeSha256, "Unbound repair before-hash");
  }
  return {
    covers(path, before) { return receipt.files.some(entry => entry.path === path && entry.beforeSha256 === before && receipt.modifiedExisting.includes(path)); },
  };
}
