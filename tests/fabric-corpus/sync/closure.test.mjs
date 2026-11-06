// FC09/W3-C — reverse dependency closure correctness and invalidation
// efficiency.
//
// Unit tier: the mini corpus carries a two-hop include chain
// (decision-guide-mini -> includes/prereq.md -> includes/product-name.md), so
// the transitive closure, the unchanged-parent rule and the efficiency ratio
// are all exercised without the real corpus. Integration tier: the real
// sim-wave3c plan.

import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { runSimulation } from "../../../tools/fabric-corpus/sync/simulate-upstream.mjs";
import { computeSyncPlan, transitiveIncludesOf } from "../../../tools/fabric-corpus/sync/sync-diff.mjs";
import { buildMiniCorpus } from "./helpers.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..", "..");
const buildDir =
  process.env.FABRIC_CORPUS_BUILD_DIR ?? path.join(repoRoot, "..", "fabric-corpus-build");

const REAL_PLAN = path.join(buildDir, "sync", "plans", "sim-wave3c", "sync-plan.json");
const REAL_SIM_DOCS = path.join(buildDir, "sync", "upstream-sim", "sim-wave3c", "docs");
const REAL_WITHDRAWALS = path.join(buildDir, "sync", "withdrawals", "sim-wave3c.json");
const REAL_AVAILABLE =
  existsSync(REAL_PLAN) && existsSync(REAL_SIM_DOCS) && existsSync(REAL_WITHDRAWALS);

function miniPlan(root) {
  const fixture = buildMiniCorpus(root);
  const sim = runSimulation({
    corpusRoot: fixture.baseDocsRoot,
    outDir: path.join(root, "sim"),
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
    withdrawals: null,
    mutationManifest: { mutationRevision: sim.manifest.mutationRevision },
  });
  return { fixture, sim, plan };
}

test("mini corpus: transitive include scan follows two-hop chains", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-closure-a-"));
  try {
    const { fixture } = miniPlan(root);
    // fabric-trial -> prereq -> product-name (two hops through fragments).
    const fromArticle = transitiveIncludesOf(fixture.baseDocsRoot, "fundamentals/fabric-trial.md");
    assert.ok(fromArticle.includes("fundamentals/includes/prereq.md"), "direct fragment must be in the closure");
    assert.ok(fromArticle.includes("includes/product-name.md"), "the two-hop fragment must be in the closure");

    // plain-article has no includes at all.
    const fromPlain = transitiveIncludesOf(fixture.baseDocsRoot, "fundamentals/plain-article.md");
    assert.deepEqual(fromPlain, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("mini corpus: article including a mutated fragment recompiles; unrelated stays keep", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-closure-b-"));
  try {
    const { plan } = miniPlan(root);
    const byPath = new Map(plan.articles.map((r) => [r.sourcePath, r]));

    // The direct include parent of the two-hop chain recompiles via the
    // transitive include closure (its receipt edge only names prereq.md).
    const decisionGuide = byPath.get("fundamentals/decision-guide-mini.md");
    assert.equal(decisionGuide.action, "recompile");
    assert.equal(decisionGuide.reason, "includes-changed-fragment");
    assert.ok(
      decisionGuide.dependencyEdges.some(
        (e) => e.kind === "include" && e.changedTargets.includes("includes/product-name.md"),
      ),
      "the dependency edge used must name the mutated fragment",
    );

    // The mutated article itself recompiles directly.
    const fabricTrial = byPath.get("fundamentals/fabric-trial.md");
    assert.equal(fabricTrial.action, "recompile");
    assert.equal(fabricTrial.reason, "changed-directly");

    // The renamed article's old path tombstones, its new path recompiles.
    assert.equal(byPath.get("fundamentals/building-reports.md").action, "tombstone");
    assert.equal(byPath.get("fundamentals/reports/building-reports.md").action, "recompile");

    // The removed article tombstones; its inbound linker recompiles via the
    // link closure.
    assert.equal(byPath.get("fundamentals/canadian-time-zone-changes.md").action, "tombstone");
    const linker = byPath.get("fundamentals/analyze-train-data.md");
    assert.equal(linker.action, "recompile");
    assert.equal(linker.reason, "link-target-path-changed");

    // The unchanged unrelated article must NOT be invalidated.
    const plain = byPath.get("fundamentals/plain-article.md");
    assert.equal(plain.action, "keep");
    assert.equal(plain.reason, "unchanged");
    assert.deepEqual(plain.closureKinds, []);
    assert.deepEqual(plain.dependencyEdges, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("mini corpus: invalidation efficiency — recompile set is a small fraction", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-closure-c-"));
  try {
    const { plan } = miniPlan(root);
    assert.equal(plan.efficiency.fullSet, plan.counts.articlesInScope);
    assert.equal(plan.efficiency.recompileSet, plan.counts.recompile);
    assert.ok(plan.counts.recompile < plan.counts.articlesInScope, "recompile set must be smaller than the full set");
    assert.ok(
      plan.efficiency.invalidationRatio !== null && plan.efficiency.invalidationRatio < 0.7,
      `invalidation ratio ${plan.efficiency.invalidationRatio} must stay well below 1.0 even on the tiny fixture ` +
        "(the 9-article fixture invalidates proportionally more because 6 of 11 articles are mutation targets)",
    );
    process.stdout.write(
      `[efficiency/mini] recompile ${plan.efficiency.recompileSet} of ${plan.efficiency.fullSet} articles ` +
        `(ratio ${plan.efficiency.invalidationRatio}, keep ${plan.efficiency.keptByteReuse})\n`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("real sim-wave3c: closure membership, edges used and efficiency", (t) => {
  if (!REAL_AVAILABLE) t.skip("sim-wave3c scratch artifacts not built yet");
  const plan = JSON.parse(readFileSync(REAL_PLAN, "utf8"));
  const byPath = new Map(plan.articles.map((r) => [r.sourcePath, r]));

  // Direct include parents of the mutated shared fragment.
  for (const p of [
    "fundamentals/create-items-in-workspaces.md",
    "fundamentals/create-workspaces.md",
    "fundamentals/give-access-workspaces.md",
    "fundamentals/roles-workspaces.md",
    "fundamentals/workspaces-folders.md",
    "fundamentals/workspaces.md",
  ]) {
    assert.equal(byPath.get(p).action, "recompile", `${p} includes the mutated fragment directly`);
    assert.equal(byPath.get(p).reason, "includes-changed-fragment");
    assert.ok(
      byPath.get(p).dependencyEdges.some((e) => e.resolved === "includes/product-name.md"),
      `${p} must record the dependency edge used`,
    );
  }

  // Transitive parents (two-hop chains via applies-to fragments and the
  // zone-nested marker the compiled AST carries but the receipt edge walk
  // does not descend into).
  for (const p of [
    "fundamentals/copilot-data-warehouse-privacy-security.md",
    "fundamentals/copilot-database-privacy-security.md",
    "fundamentals/decision-guide-lakehouse-warehouse.md",
  ]) {
    assert.equal(byPath.get(p).action, "recompile", `${p} reaches the mutated fragment transitively`);
    assert.equal(byPath.get(p).reason, "includes-changed-fragment");
  }

  // Unchanged unrelated articles stay keep.
  for (const p of ["fundamentals/analyze-train-data.md", "onelake/onelake-overview.md"]) {
    assert.equal(byPath.get(p).action, "keep");
    assert.deepEqual(byPath.get(p).dependencyEdges, []);
  }

  assert.equal(plan.efficiency.fullSet, 160);
  assert.equal(plan.efficiency.recompileSet, 15);
  assert.equal(plan.efficiency.keptByteReuse, 142);
  process.stdout.write(
    `[efficiency/sim-wave3c] recompile ${plan.efficiency.recompileSet} of ${plan.efficiency.fullSet} articles ` +
      `(ratio ${plan.efficiency.invalidationRatio}, keep ${plan.efficiency.keptByteReuse})\n`,
  );
});
