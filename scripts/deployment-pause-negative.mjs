// Focused receipt tests use tiny disposable copies, never the live checkout.
import assert from "node:assert/strict";
import { test } from "node:test";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { DEPLOYMENT_PAUSE, deploymentPauseReceipt } from "./deployment-pause-receipt.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = [DEPLOYMENT_PAUSE, ".github/workflows/deploy-cloudflare.yml", ".github/workflows/deploy.yml",
  "docs/knowledge-atlas/PRESERVATION_BASELINE.json", "docs/design-system/easyui-v2/PRESERVATION_BASELINE.json"];
function fixture(run) {
  const scratch = mkdtempSync(resolve(process.platform === "win32"
    ? resolve(process.env.LOCALAPPDATA, "Temp/opencode") : tmpdir(), "hansa-pause-negative-"));
  try {
    for (const p of paths) { mkdirSync(dirname(resolve(scratch, p)), { recursive: true }); copyFileSync(resolve(root, p), resolve(scratch, p)); }
    run(scratch);
  } finally { rmSync(scratch, { recursive: true, force: true }); }
}
function editManifest(root, update) {
  const p = resolve(root, DEPLOYMENT_PAUSE), m = JSON.parse(readFileSync(p, "utf8"));
  update(m); writeFileSync(p, JSON.stringify(m));
}
function editAndRehash(root, update) {
  const file = paths[1], p = resolve(root, file);
  writeFileSync(p, update(readFileSync(p, "utf8")));
  editManifest(root, m => { m.files.find(e => e.path === file).sha256 = createHash("sha256").update(readFileSync(p)).digest("hex"); });
}
test("exact historical before hashes advance; unrelated paths and hashes do not", () => fixture(root => {
  const m = JSON.parse(readFileSync(resolve(root, DEPLOYMENT_PAUSE), "utf8")), r = deploymentPauseReceipt(root);
  for (const e of m.files) { assert.equal(r.expected(e.path, e.beforeSha256), e.sha256); assert.equal(r.expected(e.path, "other"), "other"); }
  assert.equal(r.expected("app/page.tsx", "other"), "other");
}));
test("unrecorded workflow drift is rejected", () => fixture(root => {
  const p = resolve(root, paths[1]); writeFileSync(p, readFileSync(p, "utf8") + "# drift\n");
  assert.throws(() => deploymentPauseReceipt(root), /Paused workflow drift/);
}));
test("rehashing unrelated workflow changes cannot waive them", () => fixture(root => {
  editAndRehash(root, text => text.replace("contents: read", "contents: write"));
  assert.throws(() => deploymentPauseReceipt(root), /permits no other workflow change/);
}));
test("rehashing a restored automatic trigger is rejected", () => fixture(root => {
  editAndRehash(root, text => text.replace("on:\n  workflow_dispatch:", "on:\n  push:\n    branches: [main]\n  workflow_dispatch:"));
  assert.throws(() => deploymentPauseReceipt(root), /Exact manual-only pause block/);
}));
test("forged predecessors are rejected", () => fixture(root => {
  editManifest(root, m => { m.files[0].beforeSha256 = "0".repeat(64); });
  assert.throws(() => deploymentPauseReceipt(root), /predecessor must match/);
}));
test("unknown paths and duplicated entries are rejected", () => fixture(root => {
  editManifest(root, m => { m.files.push({ ...m.files[0], path: "../outside" }); });
  assert.throws(() => deploymentPauseReceipt(root), /only the two deployment workflows/);
  editManifest(root, m => { m.files[2] = { ...m.files[0] }; });
  assert.throws(() => deploymentPauseReceipt(root), /only the two deployment workflows/);
}));
test("omitting the receipt gives no waiver", () => fixture(root => {
  rmSync(resolve(root, DEPLOYMENT_PAUSE));
  assert.equal(deploymentPauseReceipt(root).expected(paths[1], "old"), "old");
}));
