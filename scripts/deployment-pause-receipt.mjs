// A narrow successor for the committed deployment pause, not a hash waiver.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

export const DEPLOYMENT_PAUSE = "docs/cleanup-20261108/DEPLOYMENT_PAUSE_RECEIPT.json";
const workflows = [".github/workflows/deploy-cloudflare.yml", ".github/workflows/deploy.yml"];
const baselines = ["docs/knowledge-atlas/PRESERVATION_BASELINE.json", "docs/design-system/easyui-v2/PRESERVATION_BASELINE.json"];
const pause = "# DEPLOYMENT PAUSED (2026-11-09): automatic deployment is intentionally\n" +
  "# disabled for the Release 1.1.0 GitHub publication. This workflow only runs\n" +
  "# on a manual dispatch; restore the `push: branches: [main]` trigger (see the\n" +
  "# repository history of this file) when live hosting is decided.\n" +
  "on:\n  workflow_dispatch:\n";
const original = "on:\n  push:\n    branches: [main]\n  workflow_dispatch:\n";
const hash = bytes => createHash("sha256").update(bytes).digest("hex");

export function deploymentPauseReceipt(root) {
  if (!existsSync(resolve(root, DEPLOYMENT_PAUSE))) return { expected: (_p, h) => h, paths: () => [] };
  const read = p => readFileSync(resolve(root, p), "utf8");
  const manifest = JSON.parse(read(DEPLOYMENT_PAUSE));
  assert.equal(manifest.scope, "committed-manual-deployment-pause-only");
  assert.equal(manifest.evidenceCommit, "901eb2db9e4b93a2bc426649d72c9786acaae96b");
  assert.deepEqual(manifest.files.map(e => e.path).sort(), [...workflows].sort(), "Pause receipt can cover only the two deployment workflows");
  const tables = baselines.map(p => JSON.parse(read(p)).files);
  for (const entry of manifest.files) {
    for (const table of tables) assert.equal(entry.beforeSha256, table[entry.path], "Pause predecessor must match preserved baseline");
    const current = read(entry.path);
    assert.equal(hash(current), entry.sha256, "Paused workflow drift: " + entry.path);
    assert.equal(current.split(pause).length, 2, "Exact manual-only pause block required");
    assert.equal(hash(current.replace(pause, original)), entry.beforeSha256,
      "Pause receipt permits no other workflow change: " + entry.path);
  }
  return {
    expected: (p, h) => manifest.files.find(e => e.path === p && e.beforeSha256 === h)?.sha256 ?? h,
    paths: () => [DEPLOYMENT_PAUSE, ...workflows, ...baselines],
  };
}
