// FC05 — route-registry reconciliation and fail-closed publication rules.
//
//   node --experimental-strip-types --test tests/fabric-corpus/routes/
//
// Reads the ledger (in repo) and the registry (build workspace) with fs —
// no JSON imports, no @/ aliases (repo test constraint).
//
// Contract sources:
//   docs/fabric-corpus/contracts/RELEASE_AND_STORAGE.md §"Build-dir contract"
//   docs/fabric-corpus/contracts/ROUTE_NAMESPACE.md (slug registry rule)
//   tools/fabric-corpus/route-registry/build-registry.mjs (fail-closed rules)

import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..", "..");
const buildDir =
  process.env.FABRIC_CORPUS_BUILD_DIR ?? path.join(repoRoot, "..", "fabric-corpus-build");
const registryPath = path.join(buildDir, "route-registry", "route-registry.json");
const compilerOutput = path.join(buildDir, "compiler-output");

const REGISTRY_AVAILABLE = existsSync(registryPath);

const ledger = JSON.parse(
  readFileSync(path.join(repoRoot, "tools", "fabric-corpus", "registry", "identity.json"), "utf8"),
);

test("route registry exists in the build workspace (compile + build-registry ran first)", () => {
  if (!REGISTRY_AVAILABLE) {
    assert.fail(
      `route registry missing at ${registryPath} — run tools/fabric-corpus/route-registry/compile-all-families.mjs ` +
        "and build-registry.mjs first (fail-closed contract)",
    );
  }
  assert.equal(statSync(registryPath).isFile(), true);
});

const registry = REGISTRY_AVAILABLE
  ? JSON.parse(readFileSync(registryPath, "utf8"))
  : null;

test("registry schema, revision and namespace", (t) => {
  if (!registry) t.skip("registry not built yet");
  assert.equal(registry.schema, "hansa.fabric-route-registry/1");
  assert.equal(registry.corpusRevision, "774592ea3f2d4558f763d6e5b74abf4785948fb5");
  assert.equal(registry.routeNamespace, "/learn/fabric/docs/");
  assert.match(registry.registryRevision, /^[0-9a-f]{64}$/);
});

test("zero silent drops: published + excluded reconciles to the ledger article rows", (t) => {
  if (!registry) t.skip("registry not built yet");
  const articleRows = ledger.rows.filter((r) => r.kind === "article-candidate");
  assert.equal(registry.counts.ledgerArticleRows, articleRows.length);
  assert.equal(
    registry.counts.publishedArticles + registry.counts.excludedArticles,
    registry.counts.ledgerArticleRows,
    "registry counts must reconcile with the identity ledger",
  );
  // Row-level accounting: no ledger article row appears twice or vanishes.
  const publishedIds = registry.families.flatMap((f) => f.articles.map((a) => a.articleId));
  const excludedIds = registry.excluded.map((r) => r.articleId);
  const union = new Set([...publishedIds, ...excludedIds]);
  assert.equal(union.size, articleRows.length);
  assert.equal(publishedIds.length + excludedIds.length, articleRows.length);
});

test("fail-closed: no hold-disposition article is published", (t) => {
  if (!registry) t.skip("registry not built yet");
  const holds = new Set(
    ledger.rows
      .filter((r) => r.kind === "article-candidate" && r.disposition !== "eligible-article")
      .map((r) => r.id),
  );
  assert.equal(holds.size, 3, "ledger drift: expected the 3 known hold rows");
  for (const family of registry.families) {
    for (const article of family.articles) {
      assert.equal(
        holds.has(article.articleId),
        false,
        `held article ${article.articleId} must never be published`,
      );
    }
  }
});

test("fail-closed: quarantined and held articles are excluded WITH reasons", (t) => {
  if (!registry) t.skip("registry not built yet");
  const publishedIds = new Set(
    registry.families.flatMap((f) => f.articles.map((a) => a.articleId)),
  );
  const ledgerById = new Map(ledger.rows.map((r) => [r.id, r]));
  for (const row of registry.excluded) {
    assert.ok(row.reason && row.reason.length > 0, `${row.articleId} excluded without a reason`);
    assert.equal(publishedIds.has(row.articleId), false, `${row.articleId} both published and excluded`);
    const ledgerRow = ledgerById.get(row.articleId);
    assert.ok(ledgerRow, `excluded row ${row.articleId} not in the ledger`);
    assert.equal(row.sourcePath, ledgerRow.path);
  }
  // Every ledger hold is present in `excluded` with its disposition as reason.
  for (const row of ledger.rows) {
    if (row.kind !== "article-candidate" || row.disposition === "eligible-article") continue;
    const excluded = registry.excluded.find((r) => r.articleId === row.id);
    assert.ok(excluded, `hold row ${row.id} missing from excluded`);
    assert.equal(excluded.reason, row.disposition);
  }
});

test("fail-closed: every published row has its compiled node on disk", (t) => {
  if (!registry) t.skip("registry not built yet");
  for (const family of registry.families) {
    for (const article of family.articles) {
      const nodeAbs = path.join(compilerOutput, ...article.nodeFile.split("/"));
      assert.equal(existsSync(nodeAbs), true, `missing compiled node for ${article.articleId}: ${nodeAbs}`);
    }
  }
});

test("every published row carries the mandatory registry fields", (t) => {
  if (!registry) t.skip("registry not built yet");
  for (const family of registry.families) {
    for (const article of family.articles) {
      assert.match(article.articleId, /^art:[a-z0-9-]+(\/[a-z0-9-]+)+$/);
      assert.match(article.sourcePath, /^docs\//);
      assert.match(article.sha256, /^[0-9a-f]{64}$/);
      assert.equal(article.published, true);
      assert.match(
        article.logicalPath,
        /^\/learn\/fabric\/docs\/[a-z0-9-]+(\/[a-z0-9-]+)+\/$/,
        `logicalPath shape for ${article.articleId}`,
      );
      assert.ok(article.title && article.title.length > 0);
      assert.ok(
        article.rightsState === "cc-by-4.0-docs" || article.rightsState === "rights-exception",
        `unexpected rightsState ${article.rightsState} for ${article.articleId}`,
      );
      // Ledger is the authority for the logical route.
      const ledgerRow = ledger.rows.find((r) => r.id === article.articleId);
      assert.equal(article.logicalPath, ledgerRow.plannedDestination);
    }
  }
});

test("aliases reconcile: wired + suppressed equals the redirect ledger rows", (t) => {
  if (!registry) t.skip("registry not built yet");
  const aliases = JSON.parse(
    readFileSync(path.join(repoRoot, "tools", "fabric-corpus", "registry", "aliases.json"), "utf8"),
  );
  const rowsTotal = aliases.summary?.rowsTotal ?? aliases.redirections.length;
  assert.equal(
    registry.counts.aliases.wired + registry.counts.aliases.suppressed,
    rowsTotal,
    "every redirect row must be either wired or suppressed with a reason",
  );
  for (const suppressed of registry.aliasesSuppressed) {
    assert.ok(suppressed.reason && suppressed.reason.length > 0, "suppressed alias without reason");
  }
});

test("every wired alias target resolves to a published local article", (t) => {
  if (!registry) t.skip("registry not built yet");
  const publishedPaths = new Set(
    registry.families.flatMap((f) => f.articles.map((a) => a.logicalPath)),
  );
  for (const alias of registry.aliases) {
    // Strip a fragment before the lookup (fragment-bearing aliases point at
    // the article page with an anchor).
    const target = alias.to.split("#")[0];
    assert.ok(
      publishedPaths.has(target),
      `wired alias ${alias.from} targets unpublished ${target}`,
    );
  }
});
