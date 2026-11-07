// FC09/W3-C — sync diff correctness: every class detected, rename detection,
// withdrawal sidecar honored, plan determinism.
//
// Unit tier runs the real planner over a mini corpus; the integration tier
// verifies the real sim-wave3c plan in the build workspace.

import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { runSimulation } from "../../../tools/fabric-corpus/sync/simulate-upstream.mjs";
import { computeSyncPlan } from "../../../tools/fabric-corpus/sync/sync-diff.mjs";
import { canonicalJson } from "../../../tools/fabric-corpus/sync/lib.mjs";
import { buildMiniCorpus, writeMiniWithdrawalSidecar } from "./helpers.mjs";
import { compileFamily, writeOutputs } from "../../../tools/fabric-corpus/compiler/compile.mjs";
import { PINNED_CORPUS_REVISION } from "../../../tools/fabric-corpus/sync/lib.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..", "..");
const buildDir =
  process.env.FABRIC_CORPUS_BUILD_DIR ?? path.join(repoRoot, "..", "fabric-corpus-build");
const corpusDocsRoot = path.join(buildDir, "..", "fabric-docs-light", "docs");
const receiptsRoot = path.join(buildDir, "compiler-output");

const REAL_PLAN = path.join(buildDir, "sync", "plans", "sim-wave3c", "sync-plan.json");
const REAL_SIM_DOCS = path.join(buildDir, "sync", "upstream-sim", "sim-wave3c", "docs");
const REAL_WITHDRAWALS = path.join(buildDir, "sync", "withdrawals", "sim-wave3c.json");
const REAL_MUTATION_MANIFEST = path.join(buildDir, "sync", "upstream-sim", "sim-wave3c", "mutation-manifest.json");
const REAL_AVAILABLE =
  existsSync(REAL_PLAN) && existsSync(REAL_SIM_DOCS) && existsSync(REAL_WITHDRAWALS);

let miniPlanRun = 0;
function miniPlan(root, { withWithdrawals = true } = {}) {
  const fixture = buildMiniCorpus(root);
  // Each call gets its own successor directory: runSimulation fails closed on an
  // existing output directory, and the determinism test plans twice per root.
  const run = (miniPlanRun += 1);
  const sim = runSimulation({
    corpusRoot: fixture.baseDocsRoot,
    outDir: path.join(root, `sim-${run}`),
    label: "mini",
    families: fixture.families,
    receiptsRoot: fixture.receiptsRoot,
  });
  const withdrawals = withWithdrawals ? writeMiniWithdrawalSidecar(root) : null;
  const plan = computeSyncPlan({
    baseRoot: fixture.baseDocsRoot,
    successorRoot: sim.docsRoot,
    label: "mini",
    families: fixture.families,
    receiptsRoot: fixture.receiptsRoot,
    withdrawals,
    mutationManifest: { mutationRevision: sim.manifest.mutationRevision },
  });
  return { fixture, sim, plan };
}

test("sync invalidates only the inbound links whose fragment existence changed", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-anchor-"));
  try {
    const baseRoot = path.join(root, "base");
    const successorRoot = path.join(root, "successor");
    const receiptsRoot = path.join(root, "compiled");
    const family = "anchor-test";
    const article = (title, body) => `---\ntitle: ${title}\n---\n\n# ${title}\n\n${body}\n`;
    mkdirSync(path.join(baseRoot, family), { recursive: true });
    const write = (base, name, body) => writeFileSync(path.join(base, family, name + ".md"), body);
    write(baseRoot, "target", article("Target", "## Old heading\n\n## Stable heading"));
    write(baseRoot, "lost", article("Lost", "[Lost](target.md#old-heading)"));
    write(baseRoot, "found", article("Found", "[Found](target.md#new-heading)"));
    write(baseRoot, "stable", article("Stable", "[Stable](target.md#stable-heading)"));
    cpSync(baseRoot, successorRoot, { recursive: true });
    write(successorRoot, "target", article("Target", "## New heading\n\n## Stable heading"));
    const result = compileFamily({ corpusRootAbs: baseRoot, family, corpusRevision: PINNED_CORPUS_REVISION });
    writeOutputs({ result, outDirAbs: receiptsRoot, family });
    const plan = computeSyncPlan({ baseRoot, successorRoot, label: "anchor", families: [family], receiptsRoot });
    const row = (name) => plan.articles.find((r) => r.sourcePath === `${family}/${name}.md`);
    assert.deepEqual(row("lost").closureKinds, ["anchor-closure"]);
    assert.equal(row("lost").dependencyEdges[0].anchorAfter, false);
    assert.equal(row("found").dependencyEdges[0].anchorAfter, true);
    assert.equal(row("stable").action, "keep");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("sync rejects an exact-blob rename of a withdrawn article", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-withdrawn-rename-"));
  try {
    const { fixture, sim } = miniPlan(root, { withWithdrawals: false });
    renameSync(
      path.join(sim.docsRoot, "fundamentals", "apply-sensitivity-labels.md"),
      path.join(sim.docsRoot, "fundamentals", "moved-withdrawal.md"),
    );
    assert.throws(() => computeSyncPlan({
      baseRoot: fixture.baseDocsRoot,
      successorRoot: sim.docsRoot,
      label: "mini",
      families: fixture.families,
      receiptsRoot: fixture.receiptsRoot,
      withdrawals: writeMiniWithdrawalSidecar(root),
    }), /reuses a withdrawn source blob/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("mini corpus: every diff class is detected exactly once", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-diff-a-"));
  try {
    const { plan } = miniPlan(root);
    assert.equal(plan.schema, "hansa.fabric-sync/sync-plan/1");

    const addedPaths = plan.diffs.added.map((e) => e.path);
    const modifiedPaths = plan.diffs.modified.map((e) => e.path);
    const removedPaths = plan.diffs.removed.map((e) => e.path);
    const renamedPairs = plan.diffs.renamed.map((r) => `${r.from}=>${r.to}`);

    assert.deepEqual(addedPaths, ["onelake/sync-probe-added-article.md"]);
    assert.deepEqual(modifiedPaths.sort(), [
      "fundamentals/fabric-trial.md",
      "includes/product-name.md",
      "onelake/onelake-capacity-consumption.md",
    ]);
    assert.deepEqual(removedPaths, ["fundamentals/canadian-time-zone-changes.md"]);
    assert.deepEqual(renamedPairs, [
      "fundamentals/building-reports.md=>fundamentals/reports/building-reports.md",
    ]);
    assert.deepEqual(
      plan.diffs.rightsChanged.map((w) => w.sourcePath),
      ["fundamentals/apply-sensitivity-labels.md"],
    );

    // Rename detection: identical blob sha, and the old path is NOT a removal.
    assert.equal(plan.diffs.renamed[0].sha256, plan.diffs.renamed[0].sha256);
    const removedSet = new Set(removedPaths);
    assert.ok(!removedSet.has("fundamentals/building-reports.md"), "renamed old path must not be double-counted as removed");
    const addedSet = new Set(addedPaths);
    assert.ok(!addedSet.has("fundamentals/reports/building-reports.md"), "renamed new path must not be double-counted as added");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("mini corpus: withdrawal sidecar marks the article tombstone (rights-withdrawn)", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-diff-b-"));
  try {
    const { plan } = miniPlan(root);
    const row = plan.articles.find((r) => r.sourcePath === "fundamentals/apply-sensitivity-labels.md");
    assert.ok(row, "withdrawn article must appear in the plan (as a tombstone row)");
    assert.equal(row.action, "tombstone");
    assert.equal(row.reason, "rights-withdrawn");
    assert.equal(row.logicalPath, "/learn/fabric/docs/fundamentals/apply-sensitivity-labels/");
    assert.equal(plan.counts.withdrawn, 1);
    assert.ok(!plan.diffs.added.some((e) => e.path === row.sourcePath));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("mini corpus: plan determinism — two runs produce byte-identical JSON", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-diff-c-"));
  try {
    const { plan: planA } = miniPlan(root);
    const { plan: planB } = miniPlan(root);
    assert.equal(canonicalJson(planA), canonicalJson(planB), "plans must be byte-identical across runs");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("mini corpus: repeated planning on one root never reuses a successor directory", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-diff-e-"));
  try {
    const first = miniPlan(root);
    const second = miniPlan(root);
    assert.notEqual(first.sim.docsRoot, second.sim.docsRoot, "each run needs its own successor tree");
    assert.ok(existsSync(first.sim.docsRoot) && existsSync(second.sim.docsRoot), "both successor trees survive");
    assert.equal(canonicalJson(first.plan), canonicalJson(second.plan), "isolation must not change the plan");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("mini corpus: planner rejects out-of-scope withdrawal entries (fail-closed)", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-diff-d-"));
  try {
    const fixture = buildMiniCorpus(root);
    const sim = runSimulation({
      corpusRoot: fixture.baseDocsRoot,
      outDir: path.join(root, "sim"),
      label: "mini",
      families: fixture.families,
      receiptsRoot: fixture.receiptsRoot,
    });
    const sidecar = path.join(root, "bad-withdrawals.json");
    writeFileSync(
      sidecar,
      JSON.stringify({
        schema: "hansa.fabric-sync/withdrawal-sidecar/1",
        entries: [{ sourcePath: "governance/not-in-scope.md", rightsState: "withdrawn" }],
      }),
      "utf8",
    );
    assert.throws(
      () =>
        computeSyncPlan({
          baseRoot: fixture.baseDocsRoot,
          successorRoot: sim.docsRoot,
          label: "mini",
          families: fixture.families,
          receiptsRoot: fixture.receiptsRoot,
          withdrawals: sidecar,
        }),
      /out-of-scope/,
      "withdrawal entries outside the diff scope must fail the planner",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("mini corpus: drift between receipt shas and base bytes fails the planner", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "hansa-sync-diff-e-"));
  try {
    const fixture = buildMiniCorpus(root);
    // Corrupt one receipt sha.
    const receiptPath = path.join(fixture.receiptsRoot, "fundamentals", "receipt.json");
    const receipt = JSON.parse(readFileSync(receiptPath, "utf8"));
    receipt.files[0].sha256 = "0".repeat(64);
    writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n", "utf8");

    const sim = runSimulation({
      corpusRoot: fixture.baseDocsRoot,
      outDir: path.join(root, "sim"),
      label: "mini",
      families: fixture.families,
      receiptsRoot: fixture.receiptsRoot,
    });
    assert.throws(
      () =>
        computeSyncPlan({
          baseRoot: fixture.baseDocsRoot,
          successorRoot: sim.docsRoot,
          label: "mini",
          families: fixture.families,
          receiptsRoot: fixture.receiptsRoot,
        }),
      /base drift/,
      "receipt/base drift must fail closed before planning",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("real sim-wave3c: plan classes, closure membership and efficiency", (t) => {
  if (!REAL_AVAILABLE) t.skip("sim-wave3c scratch artifacts not built yet");
  const plan = JSON.parse(readFileSync(REAL_PLAN, "utf8"));

  assert.deepEqual(plan.diffs.added.map((e) => e.path), ["onelake/sync-probe-added-article.md"]);
  const modified = plan.diffs.modified.map((e) => e.path).sort();
  assert.ok(modified.includes("fundamentals/fabric-trial.md"));
  assert.ok(modified.includes("includes/product-name.md"), "the shared include mutation must appear in the modified set");
  assert.ok(modified.includes("onelake/onelake-capacity-consumption.md"));
  assert.deepEqual(plan.diffs.removed.map((e) => e.path), ["fundamentals/canadian-time-zone-changes.md"]);
  assert.deepEqual(plan.diffs.renamed.map((r) => r.from), ["fundamentals/building-reports.md"]);
  assert.equal(plan.diffs.renamed[0].from, "fundamentals/building-reports.md");
  assert.equal(plan.diffs.renamed[0].to, "fundamentals/reports/building-reports.md");
  assert.equal(plan.diffs.renamed[0].sha256, plan.diffs.renamed[0].sha256);

  // Direct + transitive include closure over the mutated shared fragment.
  const includeClosure = plan.articles.filter((r) => r.reason === "includes-changed-fragment").map((r) => r.sourcePath);
  for (const expected of [
    "fundamentals/create-items-in-workspaces.md",
    "fundamentals/create-workspaces.md",
    "fundamentals/give-access-workspaces.md",
    "fundamentals/roles-workspaces.md",
    "fundamentals/workspaces-folders.md",
    "fundamentals/workspaces.md",
    "fundamentals/copilot-data-warehouse-privacy-security.md",
    "fundamentals/copilot-database-privacy-security.md",
    "fundamentals/decision-guide-lakehouse-warehouse.md",
  ]) {
    assert.ok(includeClosure.includes(expected), `${expected} must be in the include closure`);
  }
  // Unchanged unrelated articles must NOT be invalidated.
  const recompiled = new Set(plan.articles.filter((r) => r.action === "recompile").map((r) => r.sourcePath));
  for (const unrelated of ["fundamentals/analyze-train-data.md", "onelake/onelake-overview.md", "onelake/onelake-shared-access-signature-overview.md"]) {
    assert.ok(!recompiled.has(unrelated), `${unrelated} must stay in the keep set`);
  }
  // Link closure catches the rename/removal referencers.
  assert.ok(recompiled.has("fundamentals/direct-lake-power-bi-desktop.md"));
  assert.ok(recompiled.has("fundamentals/job-scheduler.md"));

  assert.equal(plan.efficiency.fullSet, 160);
  assert.equal(plan.efficiency.recompileSet, 15);
  assert.ok(plan.efficiency.invalidationRatio < 0.5, "invalidation ratio must be far below full recompile");
});

test("real sim-wave3c: plan determinism — recomputing the plan is byte-identical", (t) => {
  if (!REAL_AVAILABLE) t.skip("sim-wave3c scratch artifacts not built yet");
  const recomputed = computeSyncPlan({
    baseRoot: corpusDocsRoot,
    successorRoot: REAL_SIM_DOCS,
    label: "sim-wave3c",
    families: ["fundamentals", "onelake"],
    receiptsRoot,
    withdrawals: REAL_WITHDRAWALS,
    mutationManifest: JSON.parse(readFileSync(REAL_MUTATION_MANIFEST, "utf8")),
  });
  const onDisk = readFileSync(REAL_PLAN, "utf8");
  assert.equal(canonicalJson(recomputed), onDisk, "recomputed plan must match the on-disk plan byte-for-byte");
});

test("real sim-wave3c: withdrawal sidecar fixture present and honored by the plan", (t) => {
  if (!REAL_AVAILABLE) t.skip("sim-wave3c scratch artifacts not built yet");
  const sidecar = JSON.parse(readFileSync(REAL_WITHDRAWALS, "utf8"));
  assert.equal(sidecar.schema, "hansa.fabric-sync/withdrawal-sidecar/1");
  assert.equal(sidecar.entries.length, 1);
  assert.equal(sidecar.entries[0].rightsState, "withdrawn");
  const plan = JSON.parse(readFileSync(REAL_PLAN, "utf8"));
  const row = plan.articles.find((r) => r.sourcePath === sidecar.entries[0].sourcePath);
  assert.ok(row);
  assert.equal(row.action, "tombstone");
  assert.equal(row.reason, "rights-withdrawn");
});
