// FC09/W3-C — release-candidate accounting: reproducibility, tombstones,
// withdrawal exclusion, source->output traceability, receipt determinism.
//
// Unit tier runs the real RC over the mini corpus; the integration tier
// verifies the real sim-wave3c candidate in the build workspace.

import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { runSimulation } from "../../../tools/fabric-corpus/sync/simulate-upstream.mjs";
import { computeSyncPlan } from "../../../tools/fabric-corpus/sync/sync-diff.mjs";
import { runReleaseCandidate } from "../../../tools/fabric-corpus/sync/release-candidate.mjs";
import { sha256Buffer } from "../../../tools/fabric-corpus/sync/lib.mjs";
import { buildMiniCorpus, writeMiniWithdrawalSidecar } from "./helpers.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..", "..");
const buildDir =
  process.env.FABRIC_CORPUS_BUILD_DIR ?? path.join(repoRoot, "..", "fabric-corpus-build");

const REAL_RC_DIR = path.join(buildDir, "sync", "rc-output", "sim-wave3c");
const REAL_SIM_DOCS = path.join(buildDir, "sync", "upstream-sim", "sim-wave3c", "docs");
const REAL_PLAN = path.join(buildDir, "sync", "plans", "sim-wave3c", "sync-plan.json");
const REAL_BASE_OUTPUT = path.join(buildDir, "sync", "base-output");
const REAL_AVAILABLE =
  existsSync(path.join(REAL_RC_DIR, "rc-receipt.json")) && existsSync(REAL_SIM_DOCS);

function miniRc(root, runLabel = "rc-run-1") {
  const fixture = buildMiniCorpus(root);
  const sim = runSimulation({
    corpusRoot: fixture.baseDocsRoot,
    outDir: path.join(root, `sim-${runLabel}`),
    label: "mini",
    families: fixture.families,
    receiptsRoot: fixture.receiptsRoot,
  });
  const plan = computeSyncPlan({
    baseRoot: fixture.baseDocsRoot,
    successorRoot: sim.docsRoot,
    label: "mini",
    families: fixture.families,
    receiptsRoot: fixture.receiptsRoot,
    withdrawals: writeMiniWithdrawalSidecar(root),
    mutationManifest: { mutationRevision: sim.manifest.mutationRevision },
  });
  const outDir = path.join(root, runLabel);
  const { receipt } = runReleaseCandidate({
    baseRoot: fixture.baseDocsRoot,
    successorRoot: sim.docsRoot,
    plan,
    baseOutputDir: path.join(root, "base-output"),
    outDir,
  });
  return { fixture, sim, plan, receipt, outDir };
}

test("mini corpus: reproducibility — keep articles reuse byte-identical base artifacts", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-rc-a-"));
  try {
    const { receipt } = miniRc(root);
    assert.equal(receipt.schema, "hansa.fabric-sync/rc-receipt/1");
    assert.equal(receipt.reproducibility.result, "pass");
    assert.equal(receipt.reproducibility.mismatches.length, 0);
    assert.equal(receipt.failures.length, 0);

    const keepRows = receipt.articles.filter((a) => a.action === "keep");
    assert.ok(keepRows.length >= 2, "the mini corpus keeps its edge-free unchanged articles");
    for (const row of keepRows) {
      assert.equal(row.reproducibilityChecked, true);
      assert.equal(row.byteIdenticalToBase, true, `${row.sourcePath} must reproduce byte-for-byte`);
      assert.equal(row.provenance, "reused-base-artifact");
    }
    assert.equal(receipt.reproducibility.checked, keepRows.length);
    assert.equal(receipt.reproducibility.byteIdenticalCount, receipt.articles.filter((a) => a.byteIdenticalToBase === true).length);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("mini corpus: source sha -> output sha mapping and traceability", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-rc-b-"));
  try {
    const { receipt, outDir } = miniRc(root);
    const recompiled = receipt.articles.filter((a) => a.action === "recompile");
    assert.ok(recompiled.length >= 5, "direct change, include closure, rename, addition must all recompile");
    for (const row of recompiled) {
      assert.equal(row.provenance, "recompiled-from-successor");
      assert.match(row.sourceSha256, /^[0-9a-f]{64}$/);
      assert.match(row.outputNodeSha256, /^[0-9a-f]{64}$/);
      // The emitted node names the exact successor source (traceability).
      const nodeAbs = path.join(outDir, ...row.nodeFile.split("/"));
      const node = JSON.parse(readFileSync(nodeAbs, "utf8"));
      assert.equal(node.source.sha256, row.sourceSha256, `${row.sourcePath} node must record its own source sha`);
      assert.equal(sha256Buffer(readFileSync(nodeAbs)), row.outputNodeSha256, "output sha must match the emitted bytes");
    }
    // The include-closure parents' outputs actually change (fragment body
    // inlined at compile time), except where the artifact is provably
    // byte-neutral — both cases are recorded either way.
    const fabricTrial = receipt.articles.find((a) => a.sourcePath === "fundamentals/fabric-trial.md");
    assert.equal(fabricTrial.byteIdenticalToBase, false);
    assert.notEqual(fabricTrial.outputNodeSha256, fabricTrial.baseNodeSha256);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("mini corpus: tombstones and withdrawal accounting", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-rc-c-"));
  try {
    const { receipt, outDir } = miniRc(root);
    // Tombstones: removed article, renamed old path, withdrawn article.
    assert.equal(receipt.tombstones.length, 3);
    const bySource = new Map(receipt.tombstones.map((t) => [t.sourcePath, t]));
    const removedT = bySource.get("fundamentals/canadian-time-zone-changes.md");
    assert.equal(removedT.reason, "removed-upstream");
    assert.equal(removedT.disposition, "retain-as-tombstone");
    assert.match(removedT.lastNodeSha256, /^[0-9a-f]{64}$/);
    assert.equal(removedT.lastRevision, "774592ea3f2d4558f763d6e5b74abf4785948fb5");
    assert.match(removedT.retentionPolicy, /placeholder/);
    assert.equal(bySource.get("fundamentals/building-reports.md").disposition, "retain-as-tombstone");
    assert.match(bySource.get("fundamentals/building-reports.md").reason, /^renamed-to:/);

    const withdrawnT = bySource.get("fundamentals/apply-sensitivity-labels.md");
    assert.equal(withdrawnT.disposition, "purge-on-publish");
    assert.equal(receipt.withdrawals.length, 1);
    const withdrawal = receipt.withdrawals[0];
    assert.equal(withdrawal.route, "/learn/fabric/docs/fundamentals/apply-sensitivity-labels/");
    assert.equal(withdrawal.action, "purge-on-publish");
    assert.equal(withdrawal.lastSourceSha256, withdrawnT.lastSourceSha256);
    assert.match(withdrawal.note, /deployment-time/);

    // Candidate exclusion: no article row, no node, tombstone file on disk.
    assert.ok(!receipt.articles.some((a) => a.sourcePath === "fundamentals/apply-sensitivity-labels.md"));
    assert.ok(
      !existsSync(path.join(outDir, "fundamentals", "nodes", "fundamentals", "apply-sensitivity-labels.json")),
      "withdrawn article must not ship in the candidate export",
    );
    const tombstonesOnDisk = JSON.parse(readFileSync(path.join(outDir, "tombstones.json"), "utf8"));
    assert.equal(tombstonesOnDisk.length, receipt.tombstones.length);
    const withdrawalsOnDisk = JSON.parse(readFileSync(path.join(outDir, "withdrawals.json"), "utf8"));
    assert.equal(withdrawalsOnDisk.length, 1);

    // Counts reconcile: candidate = recompile + keep; tombstones planned = emitted.
    assert.equal(receipt.articles.length, receipt.counts.recompiled + receipt.counts.keptReused);
    assert.equal(receipt.counts.plannedArticles, receipt.articles.length + receipt.counts.tombstoned);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("mini corpus: changed shared fragment gets its compiled node refreshed", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-rc-d-"));
  try {
    const { receipt, outDir } = miniRc(root);
    assert.deepEqual(receipt.fragmentFamilies, ["includes"]);
    const refresh = receipt.fragmentRefresh.find((f) => f.path === "includes/product-name.md");
    assert.ok(refresh, "the mutated shared fragment must be refreshed");
    assert.equal(refresh.changed, true);
    assert.notEqual(refresh.baseNodeSha256, refresh.freshNodeSha256);
    const fragAbs = path.join(outDir, ...refresh.nodeFile.split("/"));
    assert.ok(existsSync(fragAbs));
    assert.equal(sha256Buffer(readFileSync(fragAbs)), refresh.freshNodeSha256);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("mini corpus: rc receipt determinism — two runs byte-identical", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-rc-e-"));
  try {
    const first = miniRc(root, "rc-run-1");
    const second = miniRc(root, "rc-run-2");
    const a = readFileSync(path.join(first.outDir, "rc-receipt.json"));
    const b = readFileSync(path.join(second.outDir, "rc-receipt.json"));
    assert.ok(a.equals(b), "two RC runs over the same inputs must produce byte-identical receipts");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("mini corpus: release candidate refuses to overwrite an existing generation", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-rc-preserve-"));
  try {
    const { fixture, sim, plan, outDir } = miniRc(root);
    const receiptPath = path.join(outDir, "rc-receipt.json");
    const before = readFileSync(receiptPath);
    assert.throws(() => runReleaseCandidate({
      baseRoot: fixture.baseDocsRoot,
      successorRoot: sim.docsRoot,
      plan,
      baseOutputDir: path.join(root, "base-output"),
      outDir,
    }), /fresh directory/);
    assert.deepEqual(readFileSync(receiptPath), before);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("real sim-wave3c: candidate accounting, reproducibility and withdrawal exclusion", (t) => {
  if (!REAL_AVAILABLE) t.skip("sim-wave3c scratch artifacts not built yet");
  const receipt = JSON.parse(readFileSync(path.join(REAL_RC_DIR, "rc-receipt.json"), "utf8"));
  const plan = JSON.parse(readFileSync(REAL_PLAN, "utf8"));

  assert.equal(receipt.reproducibility.result, "pass");
  assert.equal(receipt.failures.length, 0);
  assert.equal(receipt.counts.plannedArticles, 160);
  assert.equal(receipt.counts.recompiled, 15);
  assert.equal(receipt.counts.keptReused, 142);
  assert.equal(receipt.counts.tombstoned, 3);
  assert.equal(receipt.counts.withdrawn, 1);
  assert.equal(receipt.articles.length, receipt.counts.recompiled + receipt.counts.keptReused);

  // Reproducibility: every keep row byte-identical; the conservative
  // closure's extra recompiles are proven byte-neutral by the same check.
  const keeps = receipt.articles.filter((a) => a.action === "keep");
  assert.equal(keeps.filter((a) => a.byteIdenticalToBase === true).length, keeps.length);
  const recompiles = receipt.articles.filter((a) => a.action === "recompile");
  assert.ok(recompiles.some((a) => a.byteIdenticalToBase === false), "direct changes must alter output bytes");
  const byteNeutral = recompiles.filter((a) => a.byteIdenticalToBase === true).map((a) => a.sourcePath);
  assert.deepEqual(
    byteNeutral.sort(),
    [
      "fundamentals/copilot-data-warehouse-privacy-security.md",
      "fundamentals/copilot-database-privacy-security.md",
      "fundamentals/decision-guide-lakehouse-warehouse.md",
    ],
    "only the conservative transitive parents should be byte-neutral recompiles",
  );

  // Withdrawal exclusion from the candidate registry.
  const withdrawnPath = "fundamentals/apply-sensitivity-labels.md";
  assert.ok(!receipt.articles.some((a) => a.sourcePath === withdrawnPath));
  assert.ok(!existsSync(path.join(REAL_RC_DIR, "fundamentals", "nodes", withdrawnPath.replace(/\.md$/i, ".json"))));
  assert.equal(receipt.withdrawals.length, 1);
  assert.equal(receipt.withdrawals[0].route, "/learn/fabric/docs/fundamentals/apply-sensitivity-labels/");
  assert.equal(receipt.withdrawals[0].action, "purge-on-publish");

  // Tombstone last-node shas match the base compile manifests.
  for (const tombstone of receipt.tombstones) {
    const family = tombstone.sourcePath.split("/")[0];
    const manifest = JSON.parse(readFileSync(path.join(REAL_BASE_OUTPUT, family, "manifest.json"), "utf8"));
    const nodeFile = tombstone.lastNodeFile.split("/").slice(1).join("/");
    assert.equal(tombstone.lastNodeSha256, manifest.checksums[nodeFile]);
    assert.equal(tombstone.lastRevision, plan.baseCorpusRevision);
  }

  // Fragment refresh evidence.
  const refresh = receipt.fragmentRefresh.find((f) => f.path === "includes/product-name.md");
  assert.ok(refresh && refresh.changed === true);
  assert.equal(
    sha256Buffer(readFileSync(path.join(REAL_RC_DIR, ...refresh.nodeFile.split("/")))),
    refresh.freshNodeSha256,
  );
});

test("real sim-wave3c: candidate export is coherent — every keep node equals the base compile bytes", (t) => {
  if (!REAL_AVAILABLE) t.skip("sim-wave3c scratch artifacts not built yet");
  const receipt = JSON.parse(readFileSync(path.join(REAL_RC_DIR, "rc-receipt.json"), "utf8"));
  for (const article of receipt.articles.filter((a) => a.action === "keep")) {
    const candidateBytes = readFileSync(path.join(REAL_RC_DIR, ...article.nodeFile.split("/")));
    const baseBytes = readFileSync(path.join(REAL_BASE_OUTPUT, ...article.nodeFile.split("/")));
    assert.ok(candidateBytes.equals(baseBytes), `${article.sourcePath} candidate node must be the reused base artifact`);
    assert.equal(sha256Buffer(candidateBytes), article.outputNodeSha256);
  }
});
