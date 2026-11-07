// W3-B — Persistent approval mechanism for the Fabric Atlas mapping ledger
// (FC08 succession; fc08-report.md §7 "Builder/rebuild interplay with
// approvals").
//
// What this file guards:
//   1. Sidecar validation (fail closed): every approval requires reviewedBy +
//      evidence + registryRevision (+ approvedAt, disposition exactly
//      "approved", unique fabric- prefixed conceptIds); articleIds must exist
//      in the route registry; history entries use the same strictness.
//   2. apply/preserve semantics: a rebuild of the generated ledger + records
//      with the sidecar preserves approved decisions (stamped with the sidecar
//      evidence + approvalSource provenance), NEVER applies stale approvals
//      (surface as conflicts, require re-review) and fails closed on
//      unknown/malformed approvals.
//   3. The NO-AUTO-APPROVE guard: any approved row without an identical
//      sidecar backing is a runtime error (and applyApprovals is the only
//      sanctioned producer of approved rows).
//   4. Builder integration: empty sidecar => byte-identical pre-W3-B output;
//      populated sidecar => approved rows preserved across rebuilds,
//      deterministic reconciliation block; --verify-only detects drift
//      (regressed approvals, tampered evidence) and missing sidecars fail
//      closed.
//   5. Loader gate (getFabricExtension): approved datasets require a
//      sidecar-backed approval state; forged approvals, stale backing and
//      regressed rebuilds throw.
//   6. End-to-end projection contract: empty sidecar => empty public
//      projection; a current approval => projects with the allowlisted fields
//      sourced from the registry; a stale approval => NOT projected, surfaced
//      as stale.
//   7. The shipped committed sidecar is EMPTY (0 approvals) and the shipped
//      generated dataset carries zero approved rows.
//
// Conventions follow tests/atlas/fabric-targets.test.mjs: node:test +
// assert/strict, no @/ aliases, no JSON imports (fs + JSON.parse), .ts
// imports with explicit extension, synthetic 5-article fixture registry
// (never the real 2,705-row registry). The approvals module and the builder
// are imported dynamically AFTER the legacy baseline snapshot so the
// projectAtlas byte-identity check below is a real before/after.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { projectAtlas, validateDataset } from "../../lib/atlas/model.ts";

const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const editorial = json("content/atlas/editorial.json");
const dp600Extension = json("content/atlas/dp600-extension.json");
const continuation = json("content/atlas/dp600-continuation.json");

// Same assembly as lib/atlas/server.ts DATA.
const SERVER_DATA = {
  ...editorial,
  buildVersion: "atlas-dp600-2026-10-26.2",
  concepts: [...editorial.concepts, ...dp600Extension.concepts, ...continuation.concepts],
  semanticEdges: [...editorial.semanticEdges, ...dp600Extension.semanticEdges, ...continuation.semanticEdges],
  sources: [...editorial.sources, ...dp600Extension.sources, ...continuation.sources],
  catalog: [...editorial.catalog, ...dp600Extension.catalog, ...continuation.catalog],
};
validateDataset(SERVER_DATA);

// Baseline legacy projection, captured BEFORE the approvals module / gate /
// builder are loaded in this process.
const PUBLIC_BEFORE = JSON.stringify(projectAtlas(SERVER_DATA, false));

const FAB = await import("../../lib/atlas/fabric-targets.ts");
const APPROVALS = await import("../../lib/atlas/fabric-approvals.ts");
const BUILDER = await import("../../tools/fabric-corpus/atlas/build-fabric-extension.mjs");

const REPO_ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

// ---------------------------------------------------------------------------
// Synthetic 5-article fixture registry (never the real 2,705-row registry):
// representative families (onelake, admin) + non-representative cicd, with
// one UNPUBLISHED article left inside a family to prove the ledger-universe
// rule for approvals.
// ---------------------------------------------------------------------------

const fixtureArticle = (family, segments, title, sha, extra = {}) => ({
  articleId: "art:" + family + "/" + segments.join("/"),
  family,
  slug: segments[segments.length - 1],
  articleSegments: segments,
  sourcePath: "docs/" + family + "/" + segments.join("/") + ".md",
  sha256: sha,
  title,
  description: "Fixture description for " + title,
  logicalPath: "/learn/fabric/docs/" + family + "/" + segments.join("/") + "/",
  nodeFile: family + "/nodes/" + family + "/" + segments.join("/") + ".json",
  rightsState: "cc-by-4.0-docs",
  published: true,
  ...extra,
});

const FIXTURE_ARTICLES = [
  fixtureArticle("onelake", ["overview"], "OneLake overview", "w3bf0onelakeoverview0000000000000000000000000000000000000000000000a1"),
  fixtureArticle("onelake", ["access-shortcuts"], "Access OneLake shortcuts", "w3bf1onelakeaccessshortcuts0000000000000000000000000000000000b2"),
  fixtureArticle("admin", ["admin-overview"], "Fabric administration overview", "w3bf2adminadminoverview00000000000000000000000000000000000000c3"),
  fixtureArticle("cicd", ["git-integration"], "Git integration", "w3bf3cicdgitintegration000000000000000000000000000000000000000d4"),
  fixtureArticle("cicd", ["deployment-pipeline"], "Deployment pipelines", "w3bf4cicddeploymentpipeline00000000000000000000000000000000000e5", { published: false }),
];

const FIXTURE_REGISTRY = {
  schema: "hansa.fabric-route-registry/1",
  corpusRevision: "w3b-fixture-corpus-revision",
  routeNamespace: "/learn/fabric/docs/",
  families: [
    { family: "onelake", articles: FIXTURE_ARTICLES.slice(0, 2) },
    { family: "admin", articles: FIXTURE_ARTICLES.slice(2, 3) },
    { family: "cicd", articles: FIXTURE_ARTICLES.slice(3, 5) },
  ],
  excluded: [],
  aliases: [],
  aliasesSuppressed: [],
  counts: { publishedArticles: 4 },
  registryRevision: "w3b-fixture-registry-revision",
};

const CURRENT_REV = FIXTURE_REGISTRY.registryRevision;
const FIXTURE_INDEX = FAB.indexFabricRegistry(FIXTURE_REGISTRY);
const article = (articleId) => {
  const found = FIXTURE_INDEX.byArticleId.get(articleId);
  assert.ok(found, "fixture registry must contain " + articleId);
  return found;
};

const SUBSERVICE_BY_ARTICLE_ID = {
  "art:admin/admin-overview": "governance",
};

const subserviceForArticle = (art) => SUBSERVICE_BY_ARTICLE_ID[art.articleId] ?? null;

// The freshly generated (all awaiting-review) state — the pre-approval build.
const BUILT_BASE = BUILDER.buildFabricExtension({ registry: FIXTURE_REGISTRY, subserviceForArticle });

// ---------------------------------------------------------------------------
// Approval sidecars used across the suite
// ---------------------------------------------------------------------------

const approval = (articleId, overrides = {}) => ({
  approvedAt: "2026-11-05T10:00:00Z",
  reviewedBy: "Human Reviewer",
  evidence: "Reviewed the mapping for " + articleId + " against the compiled registry row and candidate concept hints",
  disposition: "approved",
  registryRevision: CURRENT_REV,
  conceptIds: [],
  ...overrides,
});

// Representative article => has a typed resource record.
const APPROVAL_REPRESENTATIVE = approval("art:onelake/access-shortcuts");
// Non-representative family => ledger row only, no typed record.
const APPROVAL_NON_REPRESENTATIVE = approval("art:cicd/git-integration");
// Reviewed against an older registry => STALE, must never apply.
const APPROVAL_STALE = approval("art:admin/admin-overview", { registryRevision: "w3b-older-registry-revision" });

const SIDECAR_POPULATED = {
  schema: "hansa.fabric-approvals/1",
  approvals: {
    "art:onelake/access-shortcuts": APPROVAL_REPRESENTATIVE,
    "art:cicd/git-integration": APPROVAL_NON_REPRESENTATIVE,
    "art:admin/admin-overview": APPROVAL_STALE,
  },
  approvalsHistory: [],
};

const serialize = (value) => JSON.stringify(value, null, 2) + "\n";

// ---------------------------------------------------------------------------
// 1. Sidecar validation (fail closed)
// ---------------------------------------------------------------------------

test("emptyFabricApprovals + serializeFabricApprovals reproduce the committed empty sidecar exactly", () => {
  const empty = APPROVALS.emptyFabricApprovals();
  assert.deepEqual(empty, { schema: "hansa.fabric-approvals/1", approvals: {}, approvalsHistory: [] });
  const committedPath = join(REPO_ROOT, "content", "atlas", "fabric-approvals.json");
  assert.equal(APPROVALS.serializeFabricApprovals(empty), readFileSync(committedPath, "utf8"));
  // Fresh objects each call (no shared mutable state).
  empty.approvals["art:x"] = approval("art:x");
  assert.equal(Object.keys(APPROVALS.emptyFabricApprovals().approvals).length, 0);
});

test("validateFabricApprovals accepts the empty sidecar and a populated sidecar whose articleIds exist in the registry", () => {
  assert.deepEqual(APPROVALS.validateFabricApprovals(APPROVALS.emptyFabricApprovals()), []);
  assert.deepEqual(APPROVALS.validateFabricApprovals(APPROVALS.emptyFabricApprovals(), FIXTURE_INDEX), []);
  assert.deepEqual(APPROVALS.validateFabricApprovals(SIDECAR_POPULATED, FIXTURE_INDEX), []);
  assert.deepEqual(APPROVALS.validateFabricApprovals(SIDECAR_POPULATED), []); // shape-only without a registry
});

test("validateFabricApprovals rejects approvals missing reviewedBy, evidence, registryRevision, approvedAt, disposition or conceptIds", () => {
  const mutations = {
    "no reviewedBy": { reviewedBy: "" },
    "no evidence": { evidence: "   " },
    "no registryRevision": { registryRevision: "" },
    "no approvedAt": { approvedAt: "" },
    "bad approvedAt": { approvedAt: "November 5th" },
    "wrong disposition awaiting-review": { disposition: "awaiting-review" },
    "wrong disposition case": { disposition: "Approved" },
    "missing disposition": { disposition: undefined },
    "conceptIds not array": { conceptIds: "fabric-onelake" },
    "duplicate conceptIds": { conceptIds: ["fabric-a", "fabric-a"] },
    "non-fabric conceptId": { conceptIds: ["concept:fabric:shortcut"] },
    "numeric reviewedBy": { reviewedBy: 42 },
  };
  for (const [name, override] of Object.entries(mutations)) {
    const bad = {
      schema: "hansa.fabric-approvals/1",
      approvals: { "art:onelake/access-shortcuts": approval("art:onelake/access-shortcuts", override) },
      approvalsHistory: [],
    };
    const errors = APPROVALS.validateFabricApprovals(bad);
    assert.ok(errors.length >= 1, "mutation must be rejected: " + name);
    assert.ok(errors.join("\n").includes("art:onelake/access-shortcuts"), name);
  }
});

test("validateFabricApprovals rejects wrong schema, malformed approvals/history shapes and registry-unknown articleIds", () => {
  assert.ok(APPROVALS.validateFabricApprovals({}).some((e) => /schema/.test(e)));
  assert.ok(APPROVALS.validateFabricApprovals({ ...APPROVALS.emptyFabricApprovals(), schema: "hansa.fabric-approvals/2" }).some((e) => /schema/.test(e)));
  assert.ok(APPROVALS.validateFabricApprovals({ ...APPROVALS.emptyFabricApprovals(), approvals: [] }).some((e) => /approvals must be an object/.test(e)));
  assert.ok(APPROVALS.validateFabricApprovals({ ...APPROVALS.emptyFabricApprovals(), approvalsHistory: {} }).some((e) => /approvalsHistory must be an array/.test(e)));
  assert.ok(APPROVALS.validateFabricApprovals({ ...APPROVALS.emptyFabricApprovals(), approvalsHistory: [{ reviewedBy: "x" }] }).some((e) => /articleId/.test(e)));
  // A complete history entry validates cleanly; an incomplete one does not.
  assert.deepEqual(APPROVALS.validateFabricApprovals({
    ...APPROVALS.emptyFabricApprovals(),
    approvalsHistory: [{ articleId: "art:onelake/overview", ...approval("art:onelake/overview") }],
  }), []);
  assert.ok(APPROVALS.validateFabricApprovals({ ...APPROVALS.emptyFabricApprovals(), approvalsHistory: [{ articleId: "art:onelake/overview", ...approval("art:onelake/overview"), evidence: "" }] }).some((e) => /approvalsHistory\[0\]/.test(e)));

  // Registry-unknown articleIds (live map and history).
  const unknown = {
    schema: "hansa.fabric-approvals/1",
    approvals: { "art:made-up/article": approval("art:made-up/article") },
    approvalsHistory: [],
  };
  assert.ok(APPROVALS.validateFabricApprovals(unknown, FIXTURE_INDEX).some((e) => /does not exist in the route registry/.test(e)));
  assert.deepEqual(APPROVALS.validateFabricApprovals(unknown), []); // shape-only passes without a registry

  // A corrupt registry input fails closed (surfaced in the error list).
  assert.ok(APPROVALS.validateFabricApprovals(APPROVALS.emptyFabricApprovals(), { families: "nope" }).some((e) => /families missing/.test(e)));
});

test("parseFabricApprovals throws aggregated and loadFabricApprovals fails closed on missing, unparsable or malformed files", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "w3b-approvals-"));
  assert.throws(() => APPROVALS.parseFabricApprovals({ schema: "hansa.fabric-approvals/1", approvals: { "art:a": { reviewedBy: "" } }, approvalsHistory: [] }), /reviewedBy/);
  assert.throws(() => APPROVALS.parseFabricApprovals(null), /not an object/);

  assert.throws(() => APPROVALS.loadFabricApprovals(join(dir, "missing.json")), /missing or unreadable.*fail closed/s);
  const badJsonPath = join(dir, "bad.json");
  writeFileSync(badJsonPath, "{not json", "utf8");
  assert.throws(() => APPROVALS.loadFabricApprovals(badJsonPath), /not valid JSON/);
  const badShapePath = join(dir, "bad-shape.json");
  writeFileSync(badShapePath, JSON.stringify({ schema: "hansa.fabric-approvals/1", approvals: { "art:onelake/access-shortcuts": approval("art:onelake/access-shortcuts", { registryRevision: undefined }) }, approvalsHistory: [] }), "utf8");
  assert.throws(() => APPROVALS.loadFabricApprovals(badShapePath), /registryRevision/);
  // A valid sidecar loads.
  const goodPath = join(dir, "good.json");
  writeFileSync(goodPath, JSON.stringify(SIDECAR_POPULATED), "utf8");
  assert.deepEqual(APPROVALS.loadFabricApprovals(goodPath), SIDECAR_POPULATED);
});

// ---------------------------------------------------------------------------
// 2. apply/preserve semantics — rebuilds preserve approvals, never silently
// ---------------------------------------------------------------------------

const APPLICATION = APPROVALS.applyApprovals(BUILT_BASE.ledger, SIDECAR_POPULATED, { registry: FIXTURE_INDEX, records: BUILT_BASE.resourceRecords });

test("applyApprovals stamps approved rows with the sidecar evidence, preserves base fields and is the only sanctioned producer", () => {
  // Ledger row: base fields preserved, disposition + reviewed fields stamped.
  const row = APPLICATION.ledger.find((r) => r.articleId === "art:onelake/access-shortcuts");
  const base = BUILT_BASE.ledger.find((r) => r.articleId === "art:onelake/access-shortcuts");
  assert.deepEqual(row, {
    articleId: base.articleId,
    logicalPath: base.logicalPath,
    disposition: "approved",
    candidateConceptHints: base.candidateConceptHints,
    sourceSha256: base.sourceSha256,
    approvedAt: APPROVAL_REPRESENTATIVE.approvedAt,
    reviewedBy: APPROVAL_REPRESENTATIVE.reviewedBy,
    evidence: APPROVAL_REPRESENTATIVE.evidence,
    registryRevision: APPROVAL_REPRESENTATIVE.registryRevision,
    conceptIds: [],
    approvalSource: "hansa.fabric-approvals/1",
  });

  // Resource record: disposition + reviewed fields stamped, concept set from
  // the approval (empty here).
  const record = APPLICATION.records.find((r) => r.articleId === "art:onelake/access-shortcuts");
  assert.equal(record.mappingDisposition, "approved");
  assert.equal(record.approvalSource, "hansa.fabric-approvals/1");
  assert.equal(record.reviewedBy, APPROVAL_REPRESENTATIVE.reviewedBy);
  assert.deepEqual(record.conceptIds, []);
  assert.deepEqual(record.declaredConceptIds, []);

  // Non-representative approval: applied to the ledger, reported withoutRecord.
  assert.ok(APPLICATION.ledger.find((r) => r.articleId === "art:cicd/git-integration").disposition === "approved");
  assert.deepEqual(APPLICATION.withoutRecord, ["art:cicd/git-integration"]);
  assert.deepEqual(APPLICATION.applied, ["art:cicd/git-integration", "art:onelake/access-shortcuts"]);
  assert.equal(APPLICATION.approvalsCount, 3);
});

test("applyApprovals NEVER applies stale approvals: rows stay awaiting-review and conflicts are surfaced for re-review", () => {
  const row = APPLICATION.ledger.find((r) => r.articleId === "art:admin/admin-overview");
  assert.equal(row.disposition, "awaiting-review");
  assert.ok(!("reviewedBy" in row), "stale approval must not stamp anything");
  const record = APPLICATION.records.find((r) => r.articleId === "art:admin/admin-overview");
  assert.equal(record.mappingDisposition, "awaiting-review");
  assert.deepEqual(APPLICATION.stale, [{
    articleId: "art:admin/admin-overview",
    approvalRegistryRevision: "w3b-older-registry-revision",
    currentRegistryRevision: "w3b-fixture-registry-revision",
  }]);

  // detectConflicts works on the sidecar and on a bare approvals map, and is
  // empty when every approval is current.
  assert.deepEqual(APPROVALS.detectConflicts(SIDECAR_POPULATED, FIXTURE_INDEX), APPLICATION.stale);
  assert.deepEqual(APPROVALS.detectConflicts(SIDECAR_POPULATED.approvals, FIXTURE_REGISTRY), APPLICATION.stale);
  assert.deepEqual(APPROVALS.detectConflicts({ "art:onelake/overview": approval("art:onelake/overview") }, FIXTURE_INDEX), []);
  // Mixed staleness keeps the current approval applied and only lists stale ones.
  const mixed = APPROVALS.applyApprovals(BUILT_BASE.ledger, {
    schema: "hansa.fabric-approvals/1",
    approvals: { "art:onelake/overview": approval("art:onelake/overview"), "art:admin/admin-overview": APPROVAL_STALE },
    approvalsHistory: [],
  }, { registry: FIXTURE_INDEX });
  assert.deepEqual(mixed.applied, ["art:onelake/overview"]);
  assert.deepEqual(mixed.stale.map((c) => c.articleId), ["art:admin/admin-overview"]);
});

test("applyApprovals is idempotent and deterministic (re-applying the merged state reproduces it exactly)", () => {
  const again = APPROVALS.applyApprovals(APPLICATION.ledger, SIDECAR_POPULATED, { registry: FIXTURE_INDEX, records: APPLICATION.records });
  assert.deepEqual(serialize(again.ledger), serialize(APPLICATION.ledger));
  assert.deepEqual(serialize(again.records), serialize(APPLICATION.records));
  assert.deepEqual(again.applied, APPLICATION.applied);
  assert.deepEqual(again.stale, APPLICATION.stale);
});

test("applyApprovals fails closed on approvals for articles missing from the ledger (unpublished or unknown) and on malformed input", () => {
  // Unpublished-but-registered article: exists in the registry, not in the ledger.
  assert.throws(() => APPROVALS.applyApprovals(BUILT_BASE.ledger, {
    schema: "hansa.fabric-approvals/1",
    approvals: { "art:cicd/deployment-pipeline": approval("art:cicd/deployment-pipeline") },
    approvalsHistory: [],
  }, { registry: FIXTURE_INDEX }), /missing from the mapping ledger[\s\S]*art:cicd\/deployment-pipeline/);
  // Unknown article entirely.
  assert.throws(() => APPROVALS.applyApprovals(BUILT_BASE.ledger, {
    schema: "hansa.fabric-approvals/1",
    approvals: { "art:made-up/article": approval("art:made-up/article") },
    approvalsHistory: [],
  }, { registry: FIXTURE_INDEX }), /art:made-up\/article/);
  // Malformed approval entry.
  assert.throws(() => APPROVALS.applyApprovals(BUILT_BASE.ledger, {
    schema: "hansa.fabric-approvals/1",
    approvals: { "art:onelake/overview": approval("art:onelake/overview", { evidence: "" }) },
    approvalsHistory: [],
  }, { registry: FIXTURE_INDEX }), /evidence/);
  // Malformed ledger input.
  assert.throws(() => APPROVALS.applyApprovals([{}], APPROVALS.emptyFabricApprovals(), { registry: FIXTURE_INDEX }), /articleId/);
  // A forged already-approved input row cannot survive the merge (self-guard).
  const forged = BUILT_BASE.ledger.map((row) => (
    row.articleId === "art:onelake/overview" ? { ...row, disposition: "approved" } : row
  ));
  assert.throws(() => APPROVALS.applyApprovals(forged, APPROVALS.emptyFabricApprovals(), { registry: FIXTURE_INDEX }), /no-auto-approve guard/);
});

// ---------------------------------------------------------------------------
// 3. The NO-AUTO-APPROVE guard
// ---------------------------------------------------------------------------

test("guardNoAutoApprove throws on approved rows without sidecar backing, with mismatched evidence, or missing the approvalSource stamp", () => {
  const backed = APPLICATION.ledger.find((r) => r.articleId === "art:onelake/access-shortcuts");
  // A fully backed approved row passes.
  APPROVALS.guardNoAutoApprove([backed], SIDECAR_POPULATED.approvals);
  APPROVALS.guardNoAutoApprove(APPLICATION.records, SIDECAR_POPULATED.approvals, { dispositionField: "mappingDisposition" });

  // Approved without ANY sidecar entry.
  const orphan = { ...backed, articleId: "art:onelake/overview" };
  assert.throws(() => APPROVALS.guardNoAutoApprove([orphan], SIDECAR_POPULATED.approvals), /art:onelake\/overview.*without a backing approvals-sidecar record/s);
  assert.throws(() => APPROVALS.guardNoAutoApprove([orphan], APPROVALS.emptyFabricApprovals()), /no-auto-approve guard/);

  // Backed but with tampered evidence.
  const tampered = { ...backed, evidence: "TAMPERED EVIDENCE" };
  assert.throws(() => APPROVALS.guardNoAutoApprove([tampered], SIDECAR_POPULATED.approvals), /evidence does not match the sidecar record/);

  // Backed but without the provenance stamp.
  const unstamped = { ...backed };
  delete unstamped.approvalSource;
  assert.throws(() => APPROVALS.guardNoAutoApprove([unstamped], SIDECAR_POPULATED.approvals), /approvalSource stamp/);

  // Records form: an approved record without backing throws too.
  const approvedRecord = APPLICATION.records.find((r) => r.articleId === "art:onelake/access-shortcuts");
  const forgedRecord = { ...approvedRecord, articleId: "art:made-up/article", id: "content:fabric-docs:made-up" };
  assert.throws(() => APPROVALS.guardNoAutoApprove([forgedRecord], SIDECAR_POPULATED.approvals, { dispositionField: "mappingDisposition" }), /no-auto-approve guard/);

  // Awaiting-review rows never trigger the guard.
  APPROVALS.guardNoAutoApprove(BUILT_BASE.ledger, APPROVALS.emptyFabricApprovals());
});

// ---------------------------------------------------------------------------
// 4. Builder integration — empty sidecar byte-identity, preservation,
//    determinism, reconciliation, --verify-only
// ---------------------------------------------------------------------------

test("builder with an empty sidecar is byte-identical to the pre-W3-B build and attaches no reconciliation block", () => {
  const withEmpty = BUILDER.buildFabricExtension({
    registry: FIXTURE_REGISTRY,
    subserviceForArticle,
    approvals: APPROVALS.emptyFabricApprovals(),
  });
  assert.equal(BUILDER.serializeFabricExtension(withEmpty), BUILDER.serializeFabricExtension(BUILT_BASE));
  assert.ok(!Object.hasOwn(withEmpty, "reconciliation"));
  assert.ok(BUILT_BASE.resourceRecords.every((record) => record.mappingDisposition === "awaiting-review"));
  // A garbage approvals input fails closed (the builder never approves on
  // its own authority, whatever it is handed).
  assert.throws(
    () => BUILDER.buildFabricExtension({
      registry: FIXTURE_REGISTRY,
      subserviceForArticle,
      approvals: { "not-even-a-sidecar": true },
    }),
    /not an object|fail closed/,
  );
});

test("builder rebuild PRESERVES approvals: sidecar decisions land in ledger + records with counts, reconciliation and a clean self-validation", () => {
  const rebuilt = BUILDER.buildFabricExtension({
    registry: FIXTURE_REGISTRY,
    subserviceForArticle,
    approvals: SIDECAR_POPULATED,
  });

  const row = rebuilt.ledger.find((r) => r.articleId === "art:onelake/access-shortcuts");
  assert.equal(row.disposition, "approved");
  assert.equal(row.reviewedBy, APPROVAL_REPRESENTATIVE.reviewedBy);
  assert.equal(row.approvalSource, "hansa.fabric-approvals/1");
  // The stale approval stays awaiting-review in the rebuild output.
  assert.equal(rebuilt.ledger.find((r) => r.articleId === "art:admin/admin-overview").disposition, "awaiting-review");

  assert.deepEqual(rebuilt.counts, {
    ledgerRows: 4,
    publishedArticles: 4,
    resourceRecords: 3,
    approvedRecords: 1,
    awaitingReviewRecords: 2,
    approvedLedgerRows: 2,
    concepts: 0,
  });
  assert.deepEqual(rebuilt.reconciliation, {
    sidecarSchema: "hansa.fabric-approvals/1",
    approvalsInSidecar: 3,
    applied: ["art:cicd/git-integration", "art:onelake/access-shortcuts"],
    appliedCount: 2,
    stale: [{
      articleId: "art:admin/admin-overview",
      approvalRegistryRevision: "w3b-older-registry-revision",
      currentRegistryRevision: "w3b-fixture-registry-revision",
    }],
    staleCount: 1,
    withoutRecord: ["art:cicd/git-integration"],
    recordsApproved: 1,
    noAutoApproveGuard: "verified — STALE APPROVALS NOT APPLIED, RE-REVIEW REQUIRED",
  });
  // The generated dataset self-validates with the approvals applied.
  assert.deepEqual(FAB.validateFabricExtension(rebuilt, FIXTURE_INDEX), []);
});

test("builder output with approvals is deterministic: repeated builds and reversed family order serialize identically, no clock", () => {
  const first = BUILDER.serializeFabricExtension(BUILDER.buildFabricExtension({ registry: FIXTURE_REGISTRY, subserviceForArticle, approvals: SIDECAR_POPULATED }));
  const second = BUILDER.serializeFabricExtension(BUILDER.buildFabricExtension({ registry: FIXTURE_REGISTRY, subserviceForArticle, approvals: SIDECAR_POPULATED }));
  assert.equal(first, second);
  const reversed = BUILDER.serializeFabricExtension(BUILDER.buildFabricExtension({
    registry: { ...FIXTURE_REGISTRY, families: [...FIXTURE_REGISTRY.families].reverse() },
    subserviceForArticle,
    approvals: SIDECAR_POPULATED,
  }));
  assert.equal(reversed, first);
  assert.ok(!/"generatedAt"|"builtAt"|"timestamp"/.test(first));
});

test("builder CLI is deterministic on the fixture with a populated sidecar and matches the in-process build", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "w3b-builder-"));
  const registryPath = join(dir, "route-registry.json");
  const nodesDir = join(dir, "compiler-output");
  const sidecarPath = join(dir, "fabric-approvals.json");
  const outPath = join(dir, "fabric-extension.json");
  writeFileSync(registryPath, JSON.stringify(FIXTURE_REGISTRY), "utf8");
  writeFileSync(sidecarPath, JSON.stringify(SIDECAR_POPULATED), "utf8");
  for (const art of FIXTURE_ARTICLES) {
    const nodePath = join(nodesDir, ...art.nodeFile.split("/"));
    mkdirSync(dirname(nodePath), { recursive: true });
    writeFileSync(nodePath, JSON.stringify({
      compiler: { name: "w3b-fixture-compiler" },
      frontMatter: { present: true, data: { title: art.title, "ms.subservice": SUBSERVICE_BY_ARTICLE_ID[art.articleId] ?? undefined } },
    }), "utf8");
  }

  const run = (extraArgs) => spawnSync(
    process.execPath,
    ["--experimental-strip-types", join(REPO_ROOT, "tools", "fabric-corpus", "atlas", "build-fabric-extension.mjs"),
      "--registry", registryPath, "--compiler-output", nodesDir, "--approvals", sidecarPath, ...extraArgs],
    { encoding: "utf8", timeout: 120000 },
  );

  const out2 = join(dir, "fabric-extension-2.json");
  const run1 = run(["--out", outPath]);
  assert.equal(run1.status, 0, "builder CLI failed: " + (run1.stderr || run1.stdout));
  const run2 = run(["--out", out2]);
  assert.equal(run2.status, 0, "builder CLI failed: " + (run2.stderr || run2.stdout));
  const bytes1 = readFileSync(outPath, "utf8");
  assert.equal(bytes1, readFileSync(out2, "utf8"), "two CLI builds must be byte-identical");
  const inProcess = BUILDER.buildFabricExtension({ registry: FIXTURE_REGISTRY, subserviceForArticle, approvals: SIDECAR_POPULATED });
  assert.equal(bytes1, BUILDER.serializeFabricExtension(inProcess), "CLI build must match the in-process build");
  assert.ok(run1.stdout.includes("applied 2 / stale 1"), "CLI prints the reconciliation section: " + run1.stdout);
  assert.deepEqual(FAB.validateFabricExtension(JSON.parse(bytes1), FIXTURE_REGISTRY), []);

  // --verify-only on the fresh output passes byte-for-byte.
  const verify1 = run(["--out", outPath, "--verify-only"]);
  assert.equal(verify1.status, 0, "verify-only on a fresh build must pass: " + (verify1.stderr || verify1.stdout));
  assert.ok(verify1.stdout.includes("--verify-only OK"));

  // Drift 1: a regressed approval (approved row flipped back to
  // awaiting-review — exactly the silent-unpublish rebuild bug W3-B closes).
  const regressed = JSON.parse(bytes1);
  for (const row of regressed.ledger) {
    if (row.articleId === "art:onelake/access-shortcuts") {
      row.disposition = "awaiting-review";
      delete row.reviewedBy;
      delete row.evidence;
      delete row.approvedAt;
      delete row.registryRevision;
      delete row.conceptIds;
      delete row.approvalSource;
    }
  }
  for (const record of regressed.resourceRecords) {
    if (record.articleId === "art:onelake/access-shortcuts") record.mappingDisposition = "awaiting-review";
  }
  const regressedPath = join(dir, "regressed.json");
  writeFileSync(regressedPath, serialize(regressed), "utf8");
  const verify2 = run(["--out", regressedPath, "--verify-only"]);
  assert.equal(verify2.status, 1, "verify-only must fail on a regressed approval");
  assert.ok(/ledger disposition drift|resource records missing/.test(verify2.stderr), "drift summary names the regression: " + verify2.stderr);

  // Drift 2: tampered approval evidence on an otherwise-approved row.
  const tampered = JSON.parse(bytes1);
  for (const row of tampered.ledger) {
    if (row.articleId === "art:onelake/access-shortcuts") row.evidence = "TAMPERED EVIDENCE";
  }
  const tamperedPath = join(dir, "tampered.json");
  writeFileSync(tamperedPath, serialize(tampered), "utf8");
  const verify3 = run(["--out", tamperedPath, "--verify-only"]);
  assert.equal(verify3.status, 1, "verify-only must fail on tampered evidence");
  assert.ok(/ledger row content drift/.test(verify3.stderr), verify3.stderr);

  // A missing sidecar fails closed.
  const noSidecar = spawnSync(
    process.execPath,
    ["--experimental-strip-types", join(REPO_ROOT, "tools", "fabric-corpus", "atlas", "build-fabric-extension.mjs"),
      "--registry", registryPath, "--compiler-output", nodesDir, "--approvals", join(dir, "missing-sidecar.json"), "--out", join(dir, "never.json")],
    { encoding: "utf8", timeout: 120000 },
  );
  assert.equal(noSidecar.status, 1, "missing sidecar must fail the build");
  assert.ok(/missing or unreadable/.test(noSidecar.stderr), noSidecar.stderr);
});

// ---------------------------------------------------------------------------
// 5. Loader gate — getFabricExtension enforces the sidecar-backed state
// ---------------------------------------------------------------------------

const writeFixturePair = (dir, extension) => {
  const registryPath = join(dir, "route-registry.json");
  const extensionPath = join(dir, "fabric-extension.json");
  writeFileSync(registryPath, JSON.stringify(FIXTURE_REGISTRY), "utf8");
  writeFileSync(extensionPath, typeof extension === "string" ? extension : BUILDER.serializeFabricExtension(extension), "utf8");
  return { registryPath, extensionPath };
};

test("loader gate: a zero-approved fixture dataset loads unchanged (with an empty sidecar on the explicit path)", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "w3b-gate-"));
  const sidecarPath = join(dir, "fabric-approvals.json");
  writeFileSync(sidecarPath, JSON.stringify(APPROVALS.emptyFabricApprovals()), "utf8");
  const { registryPath, extensionPath } = writeFixturePair(dir, BUILT_BASE);
  const loaded = FAB.getFabricExtension({ extensionPath, registryPath, approvalsPath: sidecarPath });
  assert.equal(loaded.extension.ledger.length, 4);
  // A sidecar with a current-revision approval is REQUIRED to be reflected:
  // injecting the populated sidecar against the zero-approved dataset is
  // exactly the regressed-rebuild state, so it throws.
  assert.throws(
    () => FAB.getFabricExtension({ extensionPath, registryPath, approvalsSidecar: SIDECAR_POPULATED }),
    /does not reflect/,
  );
});

test("loader gate: an approved dataset loads ONLY with a matching sidecar; missing or mismatched sidecars throw", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "w3b-gate-approved-"));
  const { registryPath, extensionPath } = writeFixturePair(dir, BUILDER.buildFabricExtension({ registry: FIXTURE_REGISTRY, subserviceForArticle, approvals: SIDECAR_POPULATED }));

  // Matching injected sidecar: loads.
  const loaded = FAB.getFabricExtension({ extensionPath, registryPath, approvalsSidecar: SIDECAR_POPULATED });
  assert.equal(loaded.extension.counts.approvedLedgerRows, 2);
  // Matching sidecar read from a file: loads.
  const sidecarPath = join(dir, "fabric-approvals.json");
  writeFileSync(sidecarPath, JSON.stringify(SIDECAR_POPULATED), "utf8");
  const loadedFromFile = FAB.getFabricExtension({ extensionPath, registryPath, approvalsPath: sidecarPath });
  assert.equal(loadedFromFile.extension.counts.approvedRecords, 1);

  // Sidecar file missing while approved rows exist: fail closed.
  assert.throws(() => FAB.getFabricExtension({ extensionPath, registryPath, approvalsPath: join(dir, "missing.json") }), /approvals sidecar is missing or unreadable/);
  // No sidecar option at all while approved rows exist: fail closed. The
  // loader defaults the path to the committed sidecar (empty), so the
  // no-auto-approve guard is what rejects the approved rows here.
  assert.throws(() => FAB.getFabricExtension({ extensionPath, registryPath }), /without a backing approvals-sidecar record/);
  // Tampered sidecar evidence: fail closed.
  const tamperedSidecar = JSON.parse(JSON.stringify(SIDECAR_POPULATED));
  tamperedSidecar.approvals["art:onelake/access-shortcuts"].evidence = "TAMPERED";
  assert.throws(() => FAB.getFabricExtension({ extensionPath, registryPath, approvalsSidecar: tamperedSidecar }), /does not match the sidecar record/);
  // Malformed sidecar: fail closed.
  assert.throws(() => FAB.getFabricExtension({ extensionPath, registryPath, approvalsSidecar: { schema: "other/1" } }), /schema/);
});

test("loader gate: a regressed rebuild (current sidecar approval not reflected in the dataset) throws — the silent-unpublish regression is caught at load", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "w3b-gate-regressed-"));
  const { registryPath, extensionPath } = writeFixturePair(dir, BUILT_BASE);
  assert.throws(
    () => FAB.getFabricExtension({ extensionPath, registryPath, approvalsSidecar: SIDECAR_POPULATED }),
    /does not reflect[\s\S]*rebuild with build-fabric-extension\.mjs/,
  );
});

test("loader gate: a hand-forged approved row backed by a STALE sidecar record throws (stale approvals must never publish)", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "w3b-gate-stale-"));
  // Hand-forge what applyApprovals refuses to produce: an approved row+record
  // carrying the STALE sidecar record verbatim.
  const forged = JSON.parse(BUILDER.serializeFabricExtension(BUILT_BASE));
  for (const row of forged.ledger) {
    if (row.articleId === "art:admin/admin-overview") {
      Object.assign(row, {
        disposition: "approved",
        approvedAt: APPROVAL_STALE.approvedAt,
        reviewedBy: APPROVAL_STALE.reviewedBy,
        evidence: APPROVAL_STALE.evidence,
        registryRevision: APPROVAL_STALE.registryRevision,
        conceptIds: APPROVAL_STALE.conceptIds,
        approvalSource: "hansa.fabric-approvals/1",
      });
    }
  }
  for (const record of forged.resourceRecords) {
    if (record.articleId === "art:admin/admin-overview") {
      Object.assign(record, {
        mappingDisposition: "approved",
        approvedAt: APPROVAL_STALE.approvedAt,
        reviewedBy: APPROVAL_STALE.reviewedBy,
        evidence: APPROVAL_STALE.evidence,
        registryRevision: APPROVAL_STALE.registryRevision,
        approvalSource: "hansa.fabric-approvals/1",
      });
    }
  }
  forged.counts.approvedLedgerRows = 1;
  forged.counts.approvedRecords = 1;
  forged.counts.awaitingReviewRecords = 2;
  const { registryPath, extensionPath } = writeFixturePair(dir, serialize(forged));
  // The forged dataset is structurally valid — only the gate catches it.
  assert.deepEqual(FAB.validateFabricExtension(JSON.parse(serialize(forged)), FIXTURE_INDEX), []);
  assert.throws(
    () => FAB.getFabricExtension({ extensionPath, registryPath, approvalsSidecar: SIDECAR_POPULATED }),
    /STALE sidecar record[\s\S]*re-review required/,
  );
});

test("loader gate: a hand-forged approved row with NO sidecar backing throws via the no-auto-approve guard", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "w3b-gate-forged-"));
  const forged = JSON.parse(BUILDER.serializeFabricExtension(BUILT_BASE));
  // Forge ledger row AND record together (a half-flip would be rejected by
  // the dataset validator before the gate even runs) with counts to match.
  for (const row of forged.ledger) {
    if (row.articleId === "art:onelake/overview") {
      Object.assign(row, {
        disposition: "approved",
        approvedAt: "2026-11-05T10:00:00Z",
        reviewedBy: "Nobody",
        evidence: "No human review happened",
        registryRevision: CURRENT_REV,
        conceptIds: [],
        approvalSource: "hansa.fabric-approvals/1",
      });
    }
  }
  for (const record of forged.resourceRecords) {
    if (record.articleId === "art:onelake/overview") {
      Object.assign(record, {
        mappingDisposition: "approved",
        approvedAt: "2026-11-05T10:00:00Z",
        reviewedBy: "Nobody",
        evidence: "No human review happened",
        registryRevision: CURRENT_REV,
        approvalSource: "hansa.fabric-approvals/1",
      });
    }
  }
  forged.counts.approvedLedgerRows = 1;
  forged.counts.approvedRecords = 1;
  forged.counts.awaitingReviewRecords = 2;
  const { registryPath, extensionPath } = writeFixturePair(dir, serialize(forged));
  // Injected empty sidecar: the guard reports the unbacked approval.
  assert.throws(
    () => FAB.getFabricExtension({ extensionPath, registryPath, approvalsSidecar: APPROVALS.emptyFabricApprovals() }),
    /without a backing approvals-sidecar record/,
  );
  // A BACKED approved row missing the approvalSource stamp trips the stamp
  // clause (without backing, the guard short-circuits on the primary
  // violation above).
  const fields = approval("art:onelake/overview");
  const stamped = JSON.parse(BUILDER.serializeFabricExtension(BUILT_BASE));
  for (const row of stamped.ledger) {
    if (row.articleId === "art:onelake/overview") {
      Object.assign(row, {
        disposition: "approved",
        approvedAt: fields.approvedAt,
        reviewedBy: fields.reviewedBy,
        evidence: fields.evidence,
        registryRevision: fields.registryRevision,
        conceptIds: fields.conceptIds,
        // approvalSource deliberately omitted
      });
    }
  }
  for (const record of stamped.resourceRecords) {
    if (record.articleId === "art:onelake/overview") {
      Object.assign(record, {
        mappingDisposition: "approved",
        approvedAt: fields.approvedAt,
        reviewedBy: fields.reviewedBy,
        evidence: fields.evidence,
        registryRevision: fields.registryRevision,
        approvalSource: "hansa.fabric-approvals/1",
      });
    }
  }
  stamped.counts.approvedLedgerRows = 1;
  stamped.counts.approvedRecords = 1;
  stamped.counts.awaitingReviewRecords = 2;
  const { extensionPath: noStampPath } = writeFixturePair(dir, serialize(stamped));
  const backingSidecar = {
    schema: "hansa.fabric-approvals/1",
    approvals: { "art:onelake/overview": fields },
    approvalsHistory: [],
  };
  assert.throws(
    () => FAB.getFabricExtension({ extensionPath: noStampPath, registryPath, approvalsSidecar: backingSidecar }),
    /approvalSource stamp/,
  );
});

// ---------------------------------------------------------------------------
// 6. End-to-end projection contract
// ---------------------------------------------------------------------------

test("end-to-end: EMPTY sidecar -> EMPTY public projection (the human gate is closed by default)", () => {
  assert.deepEqual(FAB.projectFabricCatalog(BUILT_BASE.resourceRecords, FIXTURE_INDEX), []);
  const withEmpty = BUILDER.buildFabricExtension({ registry: FIXTURE_REGISTRY, subserviceForArticle, approvals: APPROVALS.emptyFabricApprovals() });
  assert.deepEqual(FAB.projectFabricCatalog(withEmpty.resourceRecords, FIXTURE_INDEX, { requireRevision: CURRENT_REV }), []);
});

test("end-to-end: a current approval projects with the allowlisted fields sourced from the registry; stale and record-less approvals never project", () => {
  const rows = FAB.projectFabricCatalog(APPLICATION.records, FIXTURE_INDEX, { requireRevision: CURRENT_REV });
  assert.equal(rows.length, 1);
  const row = rows[0];
  assert.deepEqual(Object.keys(row).sort(), ["conceptIds", "id", "kind", "logicalPath", "title"]);
  assert.equal(row.id, "content:fabric-docs:onelake/access-shortcuts");
  assert.equal(row.title, article("art:onelake/access-shortcuts").title);
  assert.equal(row.logicalPath, article("art:onelake/access-shortcuts").logicalPath);
  assert.equal(row.kind, "fabric-docs");
  assert.deepEqual(row.conceptIds, []);

  // The STALE approval (admin-overview) is NOT projected...
  assert.ok(!rows.some((r) => r.id === "content:fabric-docs:admin/admin-overview"));
  // ...and is surfaced as stale by the conflict detector at the same time.
  assert.deepEqual(APPROVALS.detectConflicts(SIDECAR_POPULATED, FIXTURE_INDEX).map((c) => c.articleId), ["art:admin/admin-overview"]);
  // The record-less (non-representative) approval projects nothing either:
  // no typed record exists for it.
  assert.ok(!rows.some((r) => r.id.includes("cicd")));
});

// ---------------------------------------------------------------------------
// 7. Shipped committed artifacts (real files, no real registry needed)
// ---------------------------------------------------------------------------

test("shipped content/atlas/fabric-approvals.json is the committed EMPTY sidecar (0 approvals, empty history)", () => {
  const committed = json(join(REPO_ROOT, "content", "atlas", "fabric-approvals.json"));
  assert.equal(committed.schema, "hansa.fabric-approvals/1");
  assert.deepEqual(committed.approvals, {});
  assert.deepEqual(committed.approvalsHistory, []);
  assert.deepEqual(APPROVALS.validateFabricApprovals(committed), []);
  assert.equal(APPROVALS.serializeFabricApprovals(committed), readFileSync(join(REPO_ROOT, "content", "atlas", "fabric-approvals.json"), "utf8"));
});

test("shipped content/atlas/fabric-extension.json carries zero approved rows and no reconciliation block (empty-sidecar state)", () => {
  const shipped = json(join(REPO_ROOT, "content", "atlas", "fabric-extension.json"));
  // Ledger size tracks the live registry's published count (it grows when the
  // compiler recovers articles), so it is asserted against the registry itself
  // rather than a frozen number. The zero-approval fail-closed state is exact.
  const registry = json(
    join(REPO_ROOT, "..", "fabric-corpus-build", "route-registry", "route-registry.json"),
  );
  const published = registry.families.reduce(
    (sum, family) => sum + family.articles.filter((article) => article.published === true).length,
    0,
  );
  assert.equal(shipped.counts.ledgerRows, published);
  assert.equal(shipped.counts.publishedArticles, published);
  assert.equal(shipped.counts.approvedLedgerRows, 0);
  assert.equal(shipped.counts.approvedRecords, 0);
  assert.equal(shipped.counts.awaitingReviewRecords, shipped.counts.resourceRecords);
  assert.ok(!Object.hasOwn(shipped, "reconciliation"), "an empty sidecar must not attach a reconciliation block");
  for (const row of shipped.ledger) assert.equal(row.disposition, "awaiting-review");
  for (const record of shipped.resourceRecords) assert.equal(record.mappingDisposition, "awaiting-review");
});

// ---------------------------------------------------------------------------
// 8. Registry-index agreement and legacy isolation
// ---------------------------------------------------------------------------

test("toApprovalRegistryIndex agrees with indexFabricRegistry on the fixture (existence, duplicates) and accepts index or raw registry", () => {
  const local = APPROVALS.toApprovalRegistryIndex(FIXTURE_REGISTRY);
  const reference = FAB.indexFabricRegistry(FIXTURE_REGISTRY);
  assert.equal(local.byArticleId.size, reference.byArticleId.size);
  for (const [articleId, ref] of reference.byArticleId) {
    assert.equal(local.byArticleId.get(articleId), ref);
  }
  // Accepts a prebuilt index.
  const fromIndex = APPROVALS.toApprovalRegistryIndex(reference);
  assert.equal(fromIndex.byArticleId, reference.byArticleId);
  // Duplicate identity fails closed, matching the reference behavior.
  const duplicated = {
    ...FIXTURE_REGISTRY,
    families: [FIXTURE_REGISTRY.families[0], { family: "onelake", articles: [FIXTURE_ARTICLES[0]] }],
  };
  assert.throws(() => APPROVALS.toApprovalRegistryIndex(duplicated), /duplicate registry articleId/);
  assert.throws(() => FAB.indexFabricRegistry(duplicated), /duplicate identity/);
});

test("projectAtlas output is byte-identical after the approvals module, the loader gate and the builder are imported", () => {
  assert.equal(JSON.stringify(projectAtlas(SERVER_DATA, false)), PUBLIC_BEFORE);
  const publicData = projectAtlas(SERVER_DATA, false);
  assert.ok(!JSON.stringify(publicData).includes("fabric-docs"));
});
