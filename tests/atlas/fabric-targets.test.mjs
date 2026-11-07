// FC08 — Typed Fabric article targets for the Atlas extension.
//
// What this file guards:
//   1. resolveFabricTarget admits only exact route-registry rows (rt: ID form
//      and the bare logical-path spelling), carries optional anchors, and
//      rejects everything else: made-up ids, traversal, case variants,
//      query strings, percent-encoding, backslashes, empty anchors.
//   2. validateFabricResourceRecord: typed target required for fabric kind,
//      legacy href forbidden (with or without a target), anchors must be
//      members of the article's compiled heading set, conceptIds must live
//      in the fabric- prefixed concept set the record declares.
//   3. projectFabricCatalog is fail closed: with every mapping
//      awaiting-review (the Wave 2 state) the public projection of fabric
//      resources is EMPTY; a synthetic approved record projects with the
//      five allowlisted fields only, values sourced from the registry.
//   4. The existing legacy projection is untouched: projectAtlas output is
//      byte-identical before and after the fabric module is imported
//      (no global state).
//   5. Mapping ledger completeness and builder determinism on a 12-article
//      fixture registry — the real 2,705-row registry is never read in
//      tests (per the work-package brief).
//
// Conventions follow tests/atlas/isolation.test.mjs: node:test +
// assert/strict, no @/ aliases, no JSON imports (fs + JSON.parse), .ts
// imports with explicit extension. The fabric module and the builder are
// imported dynamically AFTER the legacy baseline snapshot is taken so the
// no-global-state comparison below is a real before/after in this process.

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

// Baseline legacy projections, captured BEFORE the fabric module (and the
// builder, which imports it) are loaded in this process.
const PUBLIC_BEFORE = JSON.stringify(projectAtlas(SERVER_DATA, false));
const REVIEW_BEFORE = JSON.stringify(projectAtlas(SERVER_DATA, true));

// Now load the FC08 module and the builder. Everything below uses FAB/BUILDER.
const FAB = await import("../../lib/atlas/fabric-targets.ts");
const BUILDER = await import("../../tools/fabric-corpus/atlas/build-fabric-extension.mjs");

const REPO_ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url)))); // tests/atlas -> tests -> repo

// ---------------------------------------------------------------------------
// Synthetic 12-article registry fixture (never the real 2,705-row registry).
// Five representative families plus one non-representative family (cicd) to
// prove the record filter; three articles share the slug "overview" to prove
// resource ids derive from the unique articleId, not the last slug segment.
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
  fixtureArticle("fundamentals", ["analyze-train-data"], "Analyze and train data in Microsoft Fabric", "fc08f0fundamentalsanalyzetraindata0000000000000000000000000000"),
  fixtureArticle("fundamentals", ["get-started"], "Get started with Fabric fundamentals", "fc08f1fundamentalsgetstarted0000000000000000000000000000000000"),
  fixtureArticle("fundamentals", ["nested", "overview"], "Nested fundamentals overview", "fc08f2fundamentalsnestedoverview00000000000000000000000000000"),
  fixtureArticle("onelake", ["overview"], "OneLake overview", "fc08f3onelakeoverview0000000000000000000000000000000000000000"),
  fixtureArticle("onelake", ["access-shortcuts"], "Access OneLake shortcuts", "fc08f4onelakeaccessshortcuts000000000000000000000000000000000"),
  fixtureArticle("data-factory", ["overview"], "Data Factory overview", "fc08f5datafactoryoverview000000000000000000000000000000000000"),
  fixtureArticle("data-factory", ["pipeline-overview"], "Pipelines overview", "fc08f6datafactorypipelineoverview0000000000000000000000000000"),
  fixtureArticle("data-factory", ["copy-job"], "Copy job", "fc08f7datafactorycopyjob0000000000000000000000000000000000000"),
  fixtureArticle("admin", ["about-tenant-settings"], "About tenant settings", "fc08f8adminabouttenantsettings0000000000000000000000000000000"),
  fixtureArticle("admin", ["admin-overview"], "Fabric administration overview", "fc08f9adminadminoverview0000000000000000000000000000000000000"),
  fixtureArticle("cicd", ["git-integration"], "Git integration", "fc08facicdgitintegration0000000000000000000000000000000000000"),
  fixtureArticle("cicd", ["deployment-pipeline"], "Deployment pipelines", "fc08fbcicddeploymentpipeline00000000000000000000000000000000"),
];

const FIXTURE_REGISTRY = {
  schema: "hansa.fabric-route-registry/1",
  corpusRevision: "fc08-fixture-corpus-revision",
  routeNamespace: "/learn/fabric/docs/",
  families: [
    { family: "fundamentals", articles: FIXTURE_ARTICLES.slice(0, 3) },
    { family: "onelake", articles: FIXTURE_ARTICLES.slice(3, 5) },
    { family: "data-factory", articles: FIXTURE_ARTICLES.slice(5, 8) },
    { family: "admin", articles: FIXTURE_ARTICLES.slice(8, 10) },
    { family: "cicd", articles: FIXTURE_ARTICLES.slice(10, 12) },
  ],
  excluded: [
    { articleId: "art:cicd/deployment-plan/deployment-plan-actions", sourcePath: "docs/cicd/deployment-plan/deployment-plan-actions.md", logicalPath: "/learn/fabric/docs/cicd/deployment-plan/deployment-plan-actions/", reason: "compiler-quarantine:fixture" },
    { articleId: "art:fundamentals/held-article", sourcePath: "docs/fundamentals/held-article.md", logicalPath: "/learn/fabric/docs/fundamentals/held-article/", reason: "article-hold-rights-notice:fixture" },
  ],
  aliases: [],
  aliasesSuppressed: [],
  counts: { publishedArticles: 12 },
  registryRevision: "fc08-fixture-registry-revision",
};

const FIXTURE_INDEX = FAB.indexFabricRegistry(FIXTURE_REGISTRY);
const article = (articleId) => {
  const found = FIXTURE_INDEX.byArticleId.get(articleId);
  assert.ok(found, "fixture registry must contain " + articleId);
  return found;
};

// Compiled heading anchor sets (stand-in for compiler node output).
const NODE_ANCHORS = {
  "/learn/fabric/docs/fundamentals/analyze-train-data/": ["introduction", "method"],
  "/learn/fabric/docs/fundamentals/get-started/": ["introduction", "prerequisites"],
  "/learn/fabric/docs/fundamentals/nested/overview/": ["overview"],
  "/learn/fabric/docs/onelake/overview/": ["overview"],
  "/learn/fabric/docs/onelake/access-shortcuts/": ["access", "security"],
  "/learn/fabric/docs/data-factory/overview/": ["overview"],
  "/learn/fabric/docs/data-factory/pipeline-overview/": ["overview", "authoring"],
  "/learn/fabric/docs/data-factory/copy-job/": ["copy-job"],
  "/learn/fabric/docs/admin/about-tenant-settings/": ["tenant-settings"],
  "/learn/fabric/docs/admin/admin-overview/": ["overview"],
  "/learn/fabric/docs/cicd/git-integration/": ["git"],
  "/learn/fabric/docs/cicd/deployment-pipeline/": ["deployment"],
};
const COMPILED_NODE_INDEX = new Map(
  Object.entries(NODE_ANCHORS).map(([key, anchors]) => [key, new Set(anchors)]),
);

// ms.subservice front-matter values used by the builder fixtures.
const SUBSERVICE_BY_ARTICLE_ID = {
  "art:admin/about-tenant-settings": "governance",
  "art:data-factory/overview": "data-factory",
  "art:cicd/git-integration": "DevOps Governance",
};

const makeRecord = (art, overrides = {}) => ({
  id: "content:fabric-docs:" + art.articleId.slice("art:".length),
  articleId: art.articleId,
  title: art.title,
  kind: "fabric-docs",
  target: { kind: "fabric-article", routeTargetId: "rt:" + art.logicalPath },
  logicalPath: art.logicalPath,
  conceptIds: [],
  declaredConceptIds: [],
  mappingDisposition: "awaiting-review",
  sourceSha256: art.sha256,
  ...overrides,
});

// ---------------------------------------------------------------------------
// 1. Typed-target resolution
// ---------------------------------------------------------------------------

test("resolveFabricTarget admits exact registry targets in both ID spellings and carries anchors", () => {
  const rt = FAB.resolveFabricTarget("rt:/learn/fabric/docs/fundamentals/get-started/", FIXTURE_INDEX);
  assert.ok(rt);
  assert.deepEqual(rt, { logicalPath: "/learn/fabric/docs/fundamentals/get-started/", title: "Get started with Fabric fundamentals" });
  assert.ok(!("anchor" in rt));

  const bare = FAB.resolveFabricTarget("/learn/fabric/docs/fundamentals/get-started/", FIXTURE_INDEX);
  assert.deepEqual(bare, rt);

  const anchored = FAB.resolveFabricTarget("rt:/learn/fabric/docs/fundamentals/get-started/#prerequisites", FIXTURE_INDEX);
  assert.deepEqual(anchored, { logicalPath: "/learn/fabric/docs/fundamentals/get-started/", title: "Get started with Fabric fundamentals", anchor: "prerequisites" });

  const bareAnchored = FAB.resolveFabricTarget("/learn/fabric/docs/onelake/access-shortcuts/#security", FIXTURE_INDEX);
  assert.equal(bareAnchored.anchor, "security");

  // Multi-segment articles resolve by their full logical path.
  const nested = FAB.resolveFabricTarget("rt:/learn/fabric/docs/fundamentals/nested/overview/", FIXTURE_INDEX);
  assert.equal(nested.logicalPath, "/learn/fabric/docs/fundamentals/nested/overview/");

  // Works against a raw registry too (index is built internally).
  const fromRaw = FAB.resolveFabricTarget("rt:/learn/fabric/docs/admin/admin-overview/", FIXTURE_REGISTRY);
  assert.equal(fromRaw.title, "Fabric administration overview");
});

test("resolveFabricTarget rejects made-up ids, traversal, wrong families, case/query/encoding variants and empty anchors", () => {
  const rejects = [
    // Made-up and wrong-family ids (not in the fixture registry).
    "rt:/learn/fabric/docs/fundamentals/unknown-article/",
    "rt:/learn/fabric/docs/warehouse/get-started/",
    "/learn/fabric/docs/mirroring/overview/",
    // Traversal can never match because resolution is exact string equality.
    "rt:/learn/fabric/docs/fundamentals/../admin/admin-overview/",
    "rt:/learn/fabric/docs/../learn/fabric/docs/onelake/overview/",
    "rt:/learn/fabric/docs/./get-started/",
    "../../etc/passwd",
    "rt:/learn/fabric/docs/fundamentals/get-started/../../onelake/overview/",
    // Case variants, query strings, percent-encoding, whitespace, backslash.
    "rt:/learn/fabric/docs/FUNDAMENTALS/get-started/",
    "rt:/learn/fabric/docs/fundamentals/Get-Started/",
    "rt:/learn/fabric/docs/fundamentals/get-started/?x=1",
    "rt:/learn/fabric/docs/fundamentals/analyze%2Dtrain%2Ddata/",
    " rt:/learn/fabric/docs/fundamentals/get-started/",
    "rt:/learn/fabric/docs/fundamentals\\get-started/",
    // Empty or delimiter-only anchors are not registry identities.
    "rt:/learn/fabric/docs/fundamentals/get-started/#",
    "rt:/learn/fabric/docs/fundamentals/get-started/#/",
    // Structural garbage.
    "", "rt:", "rt:/", "#anchor", "javascript:alert(1)", "//evil.example/learn/fabric/docs/onelake/overview/",
    "rt:/learn/fabric/docs/onelake/overview/#", null,
  ];
  for (const id of rejects) {
    assert.equal(FAB.resolveFabricTarget(id, FIXTURE_INDEX), null, JSON.stringify(id));
  }
});

test("indexFabricRegistry fails closed on corrupted registries", () => {
  assert.throws(() => FAB.indexFabricRegistry({ ...FIXTURE_REGISTRY, schema: "other/1" }), /schema/);
  const duplicated = {
    ...FIXTURE_REGISTRY,
    families: [
      FIXTURE_REGISTRY.families[0],
      { family: "onelake", articles: [FIXTURE_ARTICLES[0]] },
    ],
  };
  assert.throws(() => FAB.indexFabricRegistry(duplicated), /duplicate identity/);
  assert.throws(() => FAB.indexFabricRegistry({
    ...FIXTURE_REGISTRY,
    families: [{
      family: "x",
      articles: [FIXTURE_ARTICLES[0], { ...FIXTURE_ARTICLES[0], articleId: "art:x/y" }],
    }],
  }), /duplicate identity/); // same logicalPath under a different articleId
});

// ---------------------------------------------------------------------------
// 2. Record validation
// ---------------------------------------------------------------------------

test("validateFabricResourceRecord passes a typed-target-only fabric record and rejects legacy hrefs", () => {
  const art = article("art:onelake/access-shortcuts");
  const valid = makeRecord(art);
  assert.deepEqual(FAB.validateFabricResourceRecord(valid, FIXTURE_INDEX, COMPILED_NODE_INDEX), []);

  // Legacy href on a fabric record is forbidden, even a href that the legacy
  // validator admits.
  for (const href of ["/learn/fabric/docs/onelake/access-shortcuts/", "/learn/dp-600/ingestion/", ""]) {
    const withHref = makeRecord(art, { href });
    const errors = FAB.validateFabricResourceRecord(withHref, FIXTURE_INDEX, COMPILED_NODE_INDEX);
    assert.ok(errors.some((e) => /href/.test(e)), "href must be flagged: " + href);
  }

  // href + typed target together is invalid (one admission mechanism).
  const both = makeRecord(art, { href: "/learn/dp-600/ingestion/" });
  const bothErrors = FAB.validateFabricResourceRecord(both, FIXTURE_INDEX, COMPILED_NODE_INDEX);
  assert.ok(bothErrors.some((e) => /href/.test(e)));

  // href without any target: both the missing typed target and the forbidden
  // href are flagged.
  const hrefOnly = makeRecord(art, { href: "/learn/dp-600/ingestion/", target: undefined });
  const hrefOnlyErrors = FAB.validateFabricResourceRecord(hrefOnly, FIXTURE_INDEX, COMPILED_NODE_INDEX);
  assert.ok(hrefOnlyErrors.some((e) => /typed target missing/.test(e)));
  assert.ok(hrefOnlyErrors.some((e) => /href/.test(e)));

  // Non-fabric kinds and bad target kinds fail.
  assert.ok(FAB.validateFabricResourceRecord(makeRecord(art, { kind: "lesson" }), FIXTURE_INDEX).some((e) => /kind must be/.test(e)));
  assert.ok(FAB.validateFabricResourceRecord(
    makeRecord(art, { target: { kind: "legacy-href", routeTargetId: "rt:" + art.logicalPath } }),
    FIXTURE_INDEX,
  ).some((e) => /target\.kind must be/.test(e)));
  assert.ok(FAB.validateFabricResourceRecord(makeRecord(art, { mappingDisposition: "candidate" }), FIXTURE_INDEX).some((e) => /mappingDisposition/.test(e)));

  // Identity drift against the registry fails.
  assert.ok(FAB.validateFabricResourceRecord(makeRecord(art, { articleId: "art:onelake/other" }), FIXTURE_INDEX).some((e) => /articleId/.test(e)));
  assert.ok(FAB.validateFabricResourceRecord(makeRecord(art, { logicalPath: "/learn/fabric/docs/onelake/wrong/" }), FIXTURE_INDEX).some((e) => /logicalPath/.test(e)));
  assert.ok(FAB.validateFabricResourceRecord(makeRecord(art, { sourceSha256: "stale" }), FIXTURE_INDEX).some((e) => /sourceSha256/.test(e)));

  // Unknown routeTargetId fails closed.
  assert.ok(FAB.validateFabricResourceRecord(
    makeRecord(art, { target: { kind: "fabric-article", routeTargetId: "rt:/learn/fabric/docs/onelake/invented/" } }),
    FIXTURE_INDEX,
  ).some((e) => /does not resolve/.test(e)));
});

test("validateFabricResourceRecord resolves anchors only against the compiled heading set", () => {
  const art = article("art:fundamentals/get-started");
  const ok = makeRecord(art, { target: { kind: "fabric-article", routeTargetId: "rt:" + art.logicalPath + "#prerequisites" } });
  assert.deepEqual(FAB.validateFabricResourceRecord(ok, FIXTURE_INDEX, COMPILED_NODE_INDEX), []);

  const bareForm = makeRecord(art, { target: { kind: "fabric-article", routeTargetId: art.logicalPath + "#introduction" } });
  assert.deepEqual(FAB.validateFabricResourceRecord(bareForm, FIXTURE_INDEX, COMPILED_NODE_INDEX), []);

  const unknownAnchor = makeRecord(art, { target: { kind: "fabric-article", routeTargetId: "rt:" + art.logicalPath + "#does-not-exist" } });
  assert.ok(FAB.validateFabricResourceRecord(unknownAnchor, FIXTURE_INDEX, COMPILED_NODE_INDEX).some((e) => /not a heading anchor/.test(e)));

  // An anchor on an article with no compiled node entry cannot be verified.
  const noNode = makeRecord(art, {
    target: { kind: "fabric-article", routeTargetId: "rt:" + art.logicalPath + "#prerequisites" },
  });
  assert.ok(FAB.validateFabricResourceRecord(noNode, FIXTURE_INDEX, new Map()).some((e) => /anchor set missing/.test(e)));

  // No anchor and no compiled node index at all: still valid.
  assert.deepEqual(FAB.validateFabricResourceRecord(makeRecord(art), FIXTURE_INDEX), []);
});

test("validateFabricResourceRecord confines conceptIds to the fabric- prefixed set the record declares", () => {
  const art = article("art:onelake/overview");
  const declared = ["fabric-onelake", "fabric-shortcut"];
  const consistent = makeRecord(art, { conceptIds: ["fabric-onelake"], declaredConceptIds: declared });
  assert.deepEqual(FAB.validateFabricResourceRecord(consistent, FIXTURE_INDEX), []);

  const undeclared = makeRecord(art, { conceptIds: ["fabric-undeclared"], declaredConceptIds: declared });
  assert.ok(FAB.validateFabricResourceRecord(undeclared, FIXTURE_INDEX).some((e) => /not in the concept set the record declares/.test(e)));

  // Legacy (non-fabric-prefixed) concept ids are not admissible declarations.
  const legacyPrefix = makeRecord(art, { declaredConceptIds: ["concept:fabric:shortcut"], conceptIds: ["concept:fabric:shortcut"] });
  assert.ok(FAB.validateFabricResourceRecord(legacyPrefix, FIXTURE_INDEX).some((e) => /fabric-originated/.test(e)));

  const duplicate = makeRecord(art, { conceptIds: ["fabric-onelake", "fabric-onelake"], declaredConceptIds: declared });
  assert.ok(FAB.validateFabricResourceRecord(duplicate, FIXTURE_INDEX).some((e) => /conceptIds/.test(e)));
});

// ---------------------------------------------------------------------------
// 3. Public projection: fail-closed default, allowlisted approved rows
// ---------------------------------------------------------------------------

const BUILT = BUILDER.buildFabricExtension({
  registry: FIXTURE_REGISTRY,
  subserviceForArticle: (art) => SUBSERVICE_BY_ARTICLE_ID[art.articleId] ?? null,
});

test("projectFabricCatalog returns EMPTY while every mapping is awaiting-review, and no fabric row reaches any legacy projection", () => {
  assert.equal(BUILT.resourceRecords.length, 10);
  assert.ok(BUILT.resourceRecords.every((record) => record.mappingDisposition === "awaiting-review"));
  assert.deepEqual(FAB.projectFabricCatalog(BUILT.resourceRecords, FIXTURE_INDEX), []);
  // Approved records with no allowed concept set cannot dangle: conceptIds
  // must be empty when no public concept set is supplied.
  const approvedWithConcepts = BUILT.resourceRecords.map((record, i) => (
    i === 0 ? { ...record, mappingDisposition: "approved", conceptIds: ["fabric-onelake"], declaredConceptIds: ["fabric-onelake"] } : record
  ));
  assert.deepEqual(FAB.projectFabricCatalog(approvedWithConcepts, FIXTURE_INDEX), []);

  // No fabric row appears in any projected legacy output (public or review).
  for (const preview of [false, true]) {
    const serialized = JSON.stringify(projectAtlas(SERVER_DATA, preview));
    for (const token of ["fabric-docs", "fabric-article", "rt:/learn/fabric"]) {
      assert.ok(!serialized.includes(token), `legacy projection (preview=${preview}) leaked ${token}`);
    }
  }
});

test("projectFabricCatalog projects a synthetic approved record with the five allowlisted fields only, sourced from the registry", () => {
  const art = article("art:onelake/access-shortcuts");
  const approved = makeRecord(art, {
    title: "STALE REVIEW TITLE — must never project",
    logicalPath: "/garbage/must/never/project/",
    mappingDisposition: "approved",
  });
  const rows = FAB.projectFabricCatalog([approved], FIXTURE_INDEX);
  assert.equal(rows.length, 1);
  const row = rows[0];
  assert.deepEqual(Object.keys(row).sort(), ["conceptIds", "id", "kind", "logicalPath", "title"]);
  assert.equal(row.id, "content:fabric-docs:onelake/access-shortcuts");
  assert.equal(row.title, art.title); // registry title, not the record's stale one
  assert.equal(row.logicalPath, art.logicalPath); // registry logical path, not the record's
  assert.equal(row.kind, "fabric-docs");
  assert.deepEqual(row.conceptIds, []);

  // Serialized row contains none of the stale record strings.
  assert.ok(!JSON.stringify(rows).includes("STALE REVIEW TITLE"));
  assert.ok(!JSON.stringify(rows).includes("/garbage/"));

  // Multiple approved rows come out sorted by id.
  const other = makeRecord(article("art:admin/admin-overview"), { mappingDisposition: "approved" });
  const sorted = FAB.projectFabricCatalog([approved, other], FIXTURE_INDEX);
  assert.deepEqual(sorted.map((r) => r.id), ["content:fabric-docs:admin/admin-overview", "content:fabric-docs:onelake/access-shortcuts"]);

  // An approved record with an unresolvable target is dropped, never degraded.
  const dangling = makeRecord(art, { mappingDisposition: "approved", target: { kind: "fabric-article", routeTargetId: "rt:/learn/fabric/docs/onelake/gone/" } });
  assert.deepEqual(FAB.projectFabricCatalog([approved, dangling], FIXTURE_INDEX).map((r) => r.id), ["content:fabric-docs:onelake/access-shortcuts"]);
});

test("projectFabricCatalog gates concepts against the public set and enforces the registry revision guard", () => {
  const art = article("art:onelake/access-shortcuts");
  const approved = makeRecord(art, {
    mappingDisposition: "approved",
    conceptIds: ["fabric-shortcut"],
    declaredConceptIds: ["fabric-shortcut"],
  });

  // Without a public concept set, a record with concepts cannot project.
  assert.deepEqual(FAB.projectFabricCatalog([approved], FIXTURE_INDEX), []);
  // With a public set containing the concept, it projects.
  const rows = FAB.projectFabricCatalog([approved], FIXTURE_INDEX, { publicConceptIds: ["fabric-shortcut"] });
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0].conceptIds, ["fabric-shortcut"]);
  // With a public set missing the concept, it is dropped (no dangling refs).
  assert.deepEqual(FAB.projectFabricCatalog([approved], FIXTURE_INDEX, { publicConceptIds: ["fabric-other"] }), []);

  // requireRevision guard: projecting against a stale registry throws.
  assert.throws(() => FAB.projectFabricCatalog([approved], FIXTURE_INDEX, { requireRevision: "not-the-fixture-revision" }), /registry revision/);
  assert.deepEqual(
    FAB.projectFabricCatalog([approved], FIXTURE_INDEX, { requireRevision: "fc08-fixture-registry-revision", publicConceptIds: ["fabric-shortcut"] }),
    rows,
  );
});

// ---------------------------------------------------------------------------
// 4. Existing projection untouched (no global state)
// ---------------------------------------------------------------------------

test("projectAtlas output is byte-identical after the fabric module and builder are imported", () => {
  // The baseline snapshots PUBLIC_BEFORE / REVIEW_BEFORE were captured before
  // either dynamic import ran; the fabric module must not have changed them.
  assert.equal(JSON.stringify(projectAtlas(SERVER_DATA, false)), PUBLIC_BEFORE);
  assert.equal(JSON.stringify(projectAtlas(SERVER_DATA, true)), REVIEW_BEFORE);

  // Repeated projection is stable, and review mode still admits
  // technical_review records (legacy behavior unchanged).
  assert.equal(JSON.stringify(projectAtlas(SERVER_DATA, true)), REVIEW_BEFORE);
  const publicData = projectAtlas(SERVER_DATA, false);
  assert.equal(publicData.concepts.length, 0);
  assert.equal(publicData.notice, "The reviewed public graph is not yet published. Normal lessons and practice remain available.");
});

// ---------------------------------------------------------------------------
// 5. Mapping ledger completeness and builder behavior on the fixture
// ---------------------------------------------------------------------------

test("builder ledger covers exactly the published fixture articles with awaiting-review dispositions and fabric- hints", () => {
  const ledger = BUILT.ledger;
  const publishedIds = FIXTURE_ARTICLES.map((a) => a.articleId).sort();
  assert.equal(ledger.length, publishedIds.length);
  assert.deepEqual(ledger.map((r) => r.articleId).sort(), publishedIds);

  // Excluded articles never enter the ledger.
  for (const excluded of FIXTURE_REGISTRY.excluded) {
    assert.ok(!ledger.some((r) => r.articleId === excluded.articleId), excluded.articleId);
  }

  for (const row of ledger) {
    assert.equal(row.disposition, "awaiting-review");
    assert.ok(Array.isArray(row.candidateConceptHints) && row.candidateConceptHints.length <= 3);
    for (const hint of row.candidateConceptHints) assert.ok(hint.startsWith("fabric-"), hint);
    const art = article(row.articleId);
    assert.equal(row.logicalPath, art.logicalPath);
    assert.equal(row.sourceSha256, art.sha256);
  }

  // Deterministic hint derivation: family hint, deduplicated subservice hint,
  // normalized casing/spaces, capped at 3.
  assert.deepEqual(
    BUILT.ledger.find((r) => r.articleId === "art:admin/about-tenant-settings").candidateConceptHints,
    ["fabric-admin", "fabric-governance"],
  );
  assert.deepEqual(
    BUILT.ledger.find((r) => r.articleId === "art:data-factory/overview").candidateConceptHints,
    ["fabric-data-factory"], // subservice duplicates the family hint
  );
  assert.deepEqual(
    BUILT.ledger.find((r) => r.articleId === "art:cicd/git-integration").candidateConceptHints,
    ["fabric-cicd", "fabric-devops-governance"], // "DevOps Governance" normalized
  );
  assert.deepEqual(
    BUILT.ledger.find((r) => r.articleId === "art:onelake/overview").candidateConceptHints,
    ["fabric-onelake"],
  );
});

test("builder resource records cover only the representative families and resolve against the registry", () => {
  const records = BUILT.resourceRecords;
  assert.equal(records.length, 10); // 12 published minus the 2 cicd articles
  for (const record of records) {
    assert.ok(!record.articleId.startsWith("art:cicd/"), record.articleId);
    assert.equal(record.kind, "fabric-docs");
    assert.deepEqual(record.target, { kind: "fabric-article", routeTargetId: "rt:" + article(record.articleId).logicalPath });
    assert.deepEqual(record.conceptIds, []);
    assert.deepEqual(record.declaredConceptIds, []);
    assert.equal(record.mappingDisposition, "awaiting-review");
    assert.ok(!Object.hasOwn(record, "href"));
    // Resource ids derive from the unique articleId, so the three "overview"
    // slugs stay distinct.
    assert.equal(record.id, "content:fabric-docs:" + record.articleId.slice("art:".length));
    const resolved = FAB.resolveFabricTarget(record.target.routeTargetId, FIXTURE_INDEX);
    assert.ok(resolved && resolved.logicalPath === record.logicalPath);
    assert.deepEqual(FAB.validateFabricResourceRecord(record, FIXTURE_INDEX), []);
  }
  // The three shared-slug articles produce distinct ids.
  const overviewIds = records.filter((r) => r.id.endsWith("/overview")).map((r) => r.id);
  assert.equal(new Set(overviewIds).size, 3, overviewIds.join(", "));

  // The built dataset self-validates cleanly, including its counts block.
  assert.deepEqual(FAB.validateFabricExtension(BUILT, FIXTURE_INDEX), []);
  assert.deepEqual(BUILT.concepts, []);
  assert.deepEqual(BUILT.counts, {
    ledgerRows: 12,
    publishedArticles: 12,
    resourceRecords: 10,
    approvedRecords: 0,
    awaitingReviewRecords: 10,
    approvedLedgerRows: 0,
    concepts: 0,
  });
});

test("builder output is deterministic: repeated builds and reversed registry family order serialize identically", () => {
  const first = BUILDER.serializeFabricExtension(BUILT);
  const second = BUILDER.serializeFabricExtension(BUILDER.buildFabricExtension({
    registry: FIXTURE_REGISTRY,
    subserviceForArticle: (art) => SUBSERVICE_BY_ARTICLE_ID[art.articleId] ?? null,
  }));
  assert.equal(first, second);

  // Input-order independence: reversing the families array must not change
  // a single byte (rows are sorted by articleId / resource id).
  const reversed = BUILDER.serializeFabricExtension(BUILDER.buildFabricExtension({
    registry: { ...FIXTURE_REGISTRY, families: [...FIXTURE_REGISTRY.families].reverse() },
    subserviceForArticle: (art) => SUBSERVICE_BY_ARTICLE_ID[art.articleId] ?? null,
  }));
  assert.equal(reversed, first);

  // No clock, no randomness: the serialization carries no timestamps.
  assert.ok(!/"generatedAt"|"builtAt"|"timestamp"/.test(first));
});

test("build-fabric-extension.mjs CLI is deterministic on the fixture and matches the in-process build", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "fc08-fabric-extension-"));
  const registryPath = join(dir, "route-registry.json");
  const nodesDir = join(dir, "compiler-output");
  writeFileSync(registryPath, JSON.stringify(FIXTURE_REGISTRY), "utf8");
  for (const art of FIXTURE_ARTICLES) {
    const nodePath = join(nodesDir, ...art.nodeFile.split("/"));
    mkdirSync(dirname(nodePath), { recursive: true });
    writeFileSync(nodePath, JSON.stringify({
      compiler: { name: "fc08-fixture-compiler" },
      frontMatter: { present: true, data: { title: art.title, "ms.subservice": SUBSERVICE_BY_ARTICLE_ID[art.articleId] ?? undefined } },
    }), "utf8");
  }

  const run = (outPath) => {
    const result = spawnSync(
      process.execPath,
      ["--experimental-strip-types", join(REPO_ROOT, "tools", "fabric-corpus", "atlas", "build-fabric-extension.mjs"),
        "--registry", registryPath, "--compiler-output", nodesDir, "--out", outPath],
      { encoding: "utf8", timeout: 120000 },
    );
    assert.equal(result.status, 0, "builder CLI failed: " + (result.stderr || result.stdout));
    return readFileSync(outPath, "utf8");
  };

  const out1 = join(dir, "fabric-extension-1.json");
  const out2 = join(dir, "fabric-extension-2.json");
  const bytes1 = run(out1);
  const bytes2 = run(out2);
  assert.equal(bytes1, bytes2, "two CLI builds must be byte-identical");
  assert.equal(bytes1, BUILDER.serializeFabricExtension(BUILT), "CLI build must match the in-process build");

  // The CLI output self-validates and the ledger completeness matches the
  // fixture published count.
  const cliExtension = JSON.parse(bytes1);
  assert.deepEqual(FAB.validateFabricExtension(cliExtension, FIXTURE_REGISTRY), []);
  assert.equal(cliExtension.ledger.length, 12);
  assert.equal(cliExtension.counts.publishedArticles, 12);
});

// ---------------------------------------------------------------------------
// 6. Build-time loader: fail-closed on absence, injectable for tests
// ---------------------------------------------------------------------------

test("getFabricExtension fails closed on missing or invalid inputs and validates a good fixture pair", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "fc08-loader-"));
  const registryPath = join(dir, "route-registry.json");
  const extensionPath = join(dir, "fabric-extension.json");
  writeFileSync(registryPath, JSON.stringify(FIXTURE_REGISTRY), "utf8");
  writeFileSync(extensionPath, BUILDER.serializeFabricExtension(BUILT), "utf8");

  const loaded = FAB.getFabricExtension({ extensionPath, registryPath });
  assert.equal(loaded.extension.ledger.length, 12);
  assert.equal(loaded.registry.registryRevision, "fc08-fixture-registry-revision");
  assert.equal(loaded.registryIndex.byArticleId.size, 12);

  // Missing files.
  assert.throws(() => FAB.getFabricExtension({ extensionPath: join(dir, "missing.json"), registryPath }), /fail closed/);
  assert.throws(() => FAB.getFabricExtension({ extensionPath, registryPath: join(dir, "missing-registry.json") }), /fail closed/);

  // Unparsable JSON.
  const badJsonPath = join(dir, "bad.json");
  writeFileSync(badJsonPath, "{not json", "utf8");
  assert.throws(() => FAB.getFabricExtension({ extensionPath: badJsonPath, registryPath }), /not valid JSON/);

  // A tampered ledger row (stale sourceSha256) must be rejected.
  const tampered = JSON.parse(BUILDER.serializeFabricExtension(BUILT));
  tampered.ledger[0].sourceSha256 = "fc08-tampered-sha";
  const tamperedPath = join(dir, "tampered.json");
  writeFileSync(tamperedPath, JSON.stringify(tampered), "utf8");
  assert.throws(() => FAB.getFabricExtension({ extensionPath: tamperedPath, registryPath }), /failed validation/);

  // A tampered counts block must be rejected.
  const badCounts = JSON.parse(BUILDER.serializeFabricExtension(BUILT));
  badCounts.counts.ledgerRows = 11;
  const badCountsPath = join(dir, "bad-counts.json");
  writeFileSync(badCountsPath, JSON.stringify(badCounts), "utf8");
  assert.throws(() => FAB.getFabricExtension({ extensionPath: badCountsPath, registryPath }), /counts\.ledgerRows/);

  // A registry/extension revision mismatch must be rejected.
  const staleRegistry = { ...FIXTURE_REGISTRY, registryRevision: "fc08-stale-revision" };
  const staleRegistryPath = join(dir, "stale-registry.json");
  writeFileSync(staleRegistryPath, JSON.stringify(staleRegistry), "utf8");
  assert.throws(() => FAB.getFabricExtension({ extensionPath, registryPath: staleRegistryPath }), /registryRevision/);
});

// ---------------------------------------------------------------------------
// 7. Shipped dataset guard (content/atlas/fabric-extension.json, no registry)
// ---------------------------------------------------------------------------

test("shipped content/atlas/fabric-extension.json carries only awaiting-review mappings, zero concepts and no hrefs", () => {
  const shipped = json(join(REPO_ROOT, "content", "atlas", "fabric-extension.json"));
  assert.equal(shipped.schema, "hansa.atlas.fabric-extension/1");
  assert.deepEqual(shipped.concepts, []);
  assert.equal(shipped.counts.approvedRecords, 0);
  assert.equal(shipped.counts.approvedLedgerRows, 0);
  assert.equal(shipped.counts.concepts, 0);
  assert.equal(shipped.counts.ledgerRows, shipped.counts.publishedArticles);

  const recordIds = new Set();
  const recordArticles = new Set();
  for (const record of shipped.resourceRecords) {
    assert.equal(record.kind, "fabric-docs");
    assert.equal(record.mappingDisposition, "awaiting-review");
    assert.deepEqual(record.conceptIds, []);
    assert.deepEqual(record.declaredConceptIds, []);
    assert.equal(record.target.kind, "fabric-article");
    assert.ok(record.target.routeTargetId.startsWith("rt:/learn/fabric/docs/"), record.target.routeTargetId);
    assert.ok(!Object.hasOwn(record, "href"), record.id);
    assert.ok(!recordIds.has(record.id));
    assert.ok(!recordArticles.has(record.articleId));
    recordIds.add(record.id);
    recordArticles.add(record.articleId);
  }
  assert.equal(recordIds.size, shipped.counts.resourceRecords);

  for (const row of shipped.ledger) {
    assert.equal(row.disposition, "awaiting-review");
    assert.ok(row.candidateConceptHints.length <= 3);
    for (const hint of row.candidateConceptHints) assert.ok(hint.startsWith("fabric-"), hint);
  }
  assert.equal(shipped.ledger.length, shipped.counts.ledgerRows);
});
