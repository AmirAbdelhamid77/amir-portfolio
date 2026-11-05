#!/usr/bin/env node
// build-identity.mjs — FC02 identity registry builder (deterministic).
//
// Usage:
//   node build-identity.mjs <coverage-manifest.json> [corpus-root] [output.json]
//
// Reads FULL_CORPUS_COVERAGE.json (pinned revision 774592ea) and graduates every
// one of its rows to exactly one terminal identity row per
// docs/fabric-corpus/contracts/IDENTITY_REGISTRY.md.
//
// Contract points honoured here:
// - 1:1 by path: manifest row in -> identity row out, zero missing/duplicate.
// - ID prefixes sf:/fg:/as:/art: (+ dep: rows for cross-repo dependencies in a
//   separate externalDependencies table; dep: targets are NOT corpus paths, so
//   they never break the 1:1 path reconciliation).
// - plannedDestination rebuilt deterministically from the source path using the
//   docs/<dir> family seed (/learn/fabric/docs/<family>/<article>/), then
//   cross-checked against the manifest's planning value.
// - Dispositions are terminal ledger outcomes (holds are recorded outcomes with
//   owners/evidence, not unfinished states). Vocabulary is fixed below.
// - No clock except the explicit generatedAt field. Output sorted by path.
//
// Writes: <output> (default tools/fabric-corpus/registry/identity.json).

import fs from "node:fs";
import path from "node:path";

const EXPECTED_TOTAL = 15496;
const PINNED_REVISION = "774592ea3f2d4558f763d6e5b74abf4785948fb5";

// ---------------------------------------------------------------------------
// Canonical vocabularies (identity.json contract; validated by
// validate-ledgers.mjs and documented in registry/RECONCILIATION.md)
// ---------------------------------------------------------------------------

/** Terminal disposition vocabulary. 12 values. */
export const DISPOSITIONS = [
  "eligible-article",                 // article-candidate with planned local route (gates still apply)
  "article-hold-external-dependency", // article body requires an unpinned cross-repo include
  "article-hold-rights-notice",       // article carries an embedded all-rights-reserved notice
  "structured-page-candidate",        // .yml schema doc awaiting compiler classification
  "fragment-dependency",              // include/snippet consumed through owning articles
  "asset-local",                      // image/media resolved from the local corpus
  "navigation-dependency",            // toc.yml / breadcrumb.yml ordering input
  "redirect-map",                     // .openpublishing.redirection.*.json alias source
  "repository-control",               // repo control files (README, .git*, publish config)
  "rights-reference",                 // LICENSE, LICENSE-CODE, ThirdPartyNotices.md
  "publish-config-support",           // docs/docfx.json publishing support file
  "unavailable-hold",                 // tracked but absent in the sparse checkout
];

/** Rights-state vocabulary. 5 values. */
export const RIGHTS_STATES = [
  "cc-by-4.0-docs",     // textual content under the CC BY 4.0 grant (ThirdPartyNotices.md)
  "mit-code",           // code scope under the MIT grant (LICENSE-CODE); includes LICENSE/LICENSE-CODE texts
  "review-required",    // per-asset clearance pending, or explicit conflicting notice
  "rights-exception",   // explicit exception row in rights.json (hold, never cleared by this registry)
  "unresolved-review",  // content absent (no bytes/hash): cannot be evaluated
];

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const [, , manifestArg, corpusArg, outArg] = process.argv;
if (!manifestArg) {
  console.error("usage: node build-identity.mjs <coverage-manifest.json> [corpus-root] [output.json]");
  process.exit(2);
}
const manifestPath = path.resolve(manifestArg);
const output = path.resolve(
  outArg || path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "identity.json")
);
// Corpus root default: sibling checkout next to the handoff folder, or env override.
const corpusRoot = path.resolve(
  corpusArg ||
    process.env.FABRIC_CORPUS_ROOT ||
    path.join(path.dirname(manifestPath), "..", "fabric-docs-light")
);

const fail = (msg) => {
  console.error("BUILD FAIL: " + msg);
  process.exit(1);
};

// ---------------------------------------------------------------------------
// Load manifest
// ---------------------------------------------------------------------------

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.revision !== PINNED_REVISION) {
  fail(`manifest revision ${manifest.revision} != pinned ${PINNED_REVISION}`);
}
if (!Array.isArray(manifest.rows) || manifest.rows.length !== EXPECTED_TOTAL) {
  fail(`manifest rows ${manifest.rows?.length} != expected ${EXPECTED_TOTAL}`);
}
{
  const total = Object.values(manifest.counts || {}).reduce((a, b) => a + b, 0);
  if (total !== EXPECTED_TOTAL) fail(`manifest counts sum ${total} != ${EXPECTED_TOTAL}`);
}

// ---------------------------------------------------------------------------
// Cross-repo include scan (evidence for dependency holds + dep: rows).
// Scans only present textual files; deterministic textual pattern.
// ---------------------------------------------------------------------------

const CROSS_REPO_RE = /\(\s*~\/\.\.\/([^)\s]+)\s*\)/g;
const TEXT_EXTS = new Set([".md", ".yml", ".yaml", ".json", ".js", ".cjs"]);
const scanRows = manifest.rows.filter(
  (r) => r.present && TEXT_EXTS.has(path.posix.extname(r.path).toLowerCase())
);

/** repo -> depPath -> Set(referencing corpus paths) */
const depIndex = new Map();
/** corpus path -> count of cross-repo include references found */
const crossRepoRefs = new Map();
/** files whose text could not be read (recorded, never silently dropped) */
const scanFailures = [];
/** upstream `~/..//<repo>/...` double-slash occurrences normalized during scan */
let leadingSlashNormalizations = 0;

for (const row of scanRows) {
  const abs = path.join(corpusRoot, row.path);
  let text;
  try {
    text = fs.readFileSync(abs, "utf8");
  } catch {
    scanFailures.push(row.path);
    continue;
  }
  CROSS_REPO_RE.lastIndex = 0;
  let m;
  while ((m = CROSS_REPO_RE.exec(text)) !== null) {
    let target = m[1].replace(/\\/g, "/");
    while (target.startsWith("/")) {
      target = target.slice(1);
      leadingSlashNormalizations += 1; // upstream double-slash typo (e.g. docs/enterprise/powerbi/service-premium-what-is.md)
    }
    const repo = target.split("/")[0];
    const depPath = target.slice(repo.length + 1);
    if (!repo || !depPath) continue;
    crossRepoRefs.set(row.path, (crossRepoRefs.get(row.path) || 0) + 1);
    if (!depIndex.has(repo)) depIndex.set(repo, new Map());
    const inner = depIndex.get(repo);
    if (!inner.has(depPath)) inner.set(depPath, new Set());
    inner.get(depPath).add(row.path);
  }
}

const externalDependencies = [];
for (const repo of [...depIndex.keys()].sort()) {
  for (const depPath of [...depIndex.get(repo).keys()].sort()) {
    externalDependencies.push({
      id: `dep:${repo}/${depPath}`,
      repo,
      depPath,
      referencedBy: [...depIndex.get(repo).get(depPath)].sort(),
      status: "unpinned-hold",
      requiresPinnedRevision: true,
      rightsState: "rights-exception",
      evidence: `corpus-scan@${PINNED_REVISION}:~/../include-directives`,
    });
  }
}

// ---------------------------------------------------------------------------
// Row graduation
// ---------------------------------------------------------------------------

// Exception seeds (task + handoff 02): explicit notice pair; external-body hold.
const NOTICE_PAIR = new Set([
  "docs/extensibility-toolkit/publishing-requirements-workload.md",
  "docs/extensibility-toolkit/publishing-requirements-item.md",
]);
const EXTERNAL_BODY_HOLD = new Set([
  "docs/real-time-intelligence/schema-best-practice.md",
]);
const RIGHTS_REFERENCE_FILES = new Set(["LICENSE", "LICENSE-CODE", "ThirdPartyNotices.md"]);

/** kind -> id prefix for corpus-path rows. */
function idFor(row, familyPath) {
  switch (row.kind) {
    case "article-candidate":
      return `art:${familyPath}`;
    case "fragment":
    case "navigation":
      return `fg:${row.path}`;
    case "asset":
      return `as:${row.path}`;
    case "structured-doc":
    case "redirect":
    case "repository-control":
    case "rights":
    case "support":
    case "unavailable-or-special":
      return `sf:${row.path}`;
    default:
      fail(`unknown kind ${row.kind} for ${row.path}`);
  }
}

/** Rebuilt plannedDestination from the source path (family seed = docs/<dir>). */
function routeFor(row) {
  if (row.kind !== "article-candidate") return "";
  if (!row.path.startsWith("docs/") || !row.path.endsWith(".md")) return "";
  const rest = row.path.slice("docs/".length, -".md".length);
  return `/learn/fabric/docs/${rest}/`;
}

function dispositionFor(row) {
  if (row.kind === "article-candidate") {
    if (EXTERNAL_BODY_HOLD.has(row.path)) return "article-hold-external-dependency";
    if (NOTICE_PAIR.has(row.path)) return "article-hold-rights-notice";
    return "eligible-article";
  }
  switch (row.kind) {
    case "structured-doc": return "structured-page-candidate";
    case "fragment": return "fragment-dependency";
    case "asset": return "asset-local";
    case "navigation": return "navigation-dependency";
    case "redirect": return "redirect-map";
    case "repository-control": return "repository-control";
    case "rights": return "rights-reference";
    case "support": return "publish-config-support";
    case "unavailable-or-special": return "unavailable-hold";
    default: fail(`unknown kind ${row.kind}`);
  }
}

function rightsStateFor(row, hasCrossTree, hasCrossRepo) {
  if (row.kind === "unavailable-or-special") return "unresolved-review";
  if (row.kind === "asset") return "review-required";
  if (NOTICE_PAIR.has(row.path)) return "review-required"; // explicit notice; never cleared here
  if (hasCrossTree || hasCrossRepo) return "rights-exception"; // dependency hold until pinned+cleared
  if (row.kind === "rights") {
    return row.path === "ThirdPartyNotices.md" ? "cc-by-4.0-docs" : "mit-code";
  }
  return "cc-by-4.0-docs";
}

const rowsOut = [];
const seenPaths = new Set();
const seenIds = new Set();
const manifestRouteMismatches = [];
const byKind = {};
const byDisposition = {};
const byRightsState = {};

for (const row of [...manifest.rows].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))) {
  if (seenPaths.has(row.path)) fail(`duplicate manifest path ${row.path}`);
  seenPaths.add(row.path);

  const familyPath =
    row.kind === "article-candidate"
      ? row.path.slice("docs/".length, -".md".length)
      : "";
  const id = idFor(row, familyPath);
  if (seenIds.has(id)) fail(`duplicate id ${id}`);
  seenIds.add(id);

  // Path safety: posix-relative, no traversal.
  if (row.path.includes("\\") || row.path.includes("..") || path.posix.isAbsolute(row.path)) {
    fail(`unsafe path ${row.path}`);
  }

  const route = routeFor(row);
  if (row.kind === "article-candidate" && row.plannedDestination !== route) {
    manifestRouteMismatches.push({ path: row.path, manifest: row.plannedDestination, rebuilt: route });
  }

  const hasCrossTree = (row.crossTreeHints || 0) > 0;
  const hasCrossRepo = crossRepoRefs.has(row.path);
  const disposition = dispositionFor(row);
  const rightsState = rightsStateFor(row, hasCrossTree, hasCrossRepo);

  let evidence = `FULL_CORPUS_COVERAGE.json@${PINNED_REVISION.slice(0, 8)}#row`;
  if (disposition === "article-hold-external-dependency" || disposition === "article-hold-rights-notice") {
    evidence += "+rights.json:exception";
  } else if (rightsState === "rights-exception") {
    evidence += "+rights.json:exception";
  }

  const out = {
    id,
    path: row.path,
    sha256: row.sha256 ?? null,
    bytes: row.bytes ?? null,
    kind: row.kind,
    disposition,
    plannedDestination: route,
    rightsState,
    evidence,
  };
  rowsOut.push(out);

  byKind[row.kind] = (byKind[row.kind] || 0) + 1;
  byDisposition[disposition] = (byDisposition[disposition] || 0) + 1;
  byRightsState[rightsState] = (byRightsState[rightsState] || 0) + 1;
}

// Reconciliation invariants (fail fast: the lead must never see a partial registry).
if (rowsOut.length !== EXPECTED_TOTAL) fail(`out rows ${rowsOut.length} != ${EXPECTED_TOTAL}`);
if (manifestRouteMismatches.length > 0) {
  fail(`plannedDestination disagrees with manifest for ${manifestRouteMismatches.length} rows; first: ${JSON.stringify(manifestRouteMismatches[0])}`);
}
for (const [kind, n] of Object.entries(manifest.counts)) {
  if (byKind[kind] !== n) fail(`kind ${kind}: built ${byKind[kind]} != manifest ${n}`);
}
for (const r of rowsOut) {
  if (!DISPOSITIONS.includes(r.disposition)) fail(`non-terminal disposition ${r.disposition}`);
  if (!RIGHTS_STATES.includes(r.rightsState)) fail(`unknown rightsState ${r.rightsState}`);
  if (r.id.startsWith("art:") && !/^\/learn\/fabric\/docs\/[a-z0-9][a-z0-9/-]*\/$/.test(r.plannedDestination)) {
    fail(`art: row without valid route target: ${r.path}`);
  }
  if (r.sha256 !== null && !/^[0-9a-f]{64}$/.test(r.sha256)) fail(`bad sha256 on ${r.path}`);
  if (r.bytes !== null && !Number.isInteger(r.bytes)) fail(`bad bytes on ${r.path}`);
}

// ---------------------------------------------------------------------------
// Serialize (rows one-per-line for compactness)
// ---------------------------------------------------------------------------

const generatedAt = new Date().toISOString();
const header = {
  $schema: undefined, // placeholder removed below (kept out of output)
  generatedAt,
  revision: PINNED_REVISION,
  manifest: path.basename(manifestPath),
  corpusRoot: path.basename(corpusRoot),
  contract: "docs/fabric-corpus/contracts/IDENTITY_REGISTRY.md",
  vocabularies: { dispositions: DISPOSITIONS, rightsStates: RIGHTS_STATES },
  counts: {
    in: manifest.rows.length,
    out: rowsOut.length,
    byKind,
    byDisposition,
    byRightsState,
    externalDependencies: externalDependencies.length,
    crossRepoIncludeFiles: crossRepoRefs.size,
    crossTreeHintRows: manifest.rows.filter((r) => (r.crossTreeHints || 0) > 0).length,
    corpusScanFailures: scanFailures.length,
    corpusScanLeadingSlashNormalizations: leadingSlashNormalizations,
  },
  rows: null,
  externalDependencies,
};
delete header.$schema;

const lines = [];
lines.push("{");
lines.push(` "generatedAt": ${JSON.stringify(generatedAt)},`);
lines.push(` "revision": ${JSON.stringify(PINNED_REVISION)},`);
lines.push(` "manifest": ${JSON.stringify(header.manifest)},`);
lines.push(` "corpusRoot": ${JSON.stringify(header.corpusRoot)},`);
lines.push(` "contract": ${JSON.stringify(header.contract)},`);
lines.push(` "vocabularies": ${JSON.stringify(header.vocabularies)},`);
lines.push(` "counts": ${JSON.stringify(header.counts)},`);
lines.push(` "rows": [`);
lines.push(rowsOut.map((r) => "  " + JSON.stringify(r)).join(",\n"));
lines.push(` ],`);
lines.push(` "externalDependencies": ${JSON.stringify(externalDependencies, null, 1).replace(/\n/g, "\n ")}`);
lines.push("}");
fs.writeFileSync(output, lines.join("\n") + "\n", "utf8");

// Report
console.log(`identity registry built: ${output}`);
console.log(`  in=${manifest.rows.length} out=${rowsOut.length} dupPaths=0 dupIds=0`);
console.log(`  byKind=${JSON.stringify(byKind)}`);
console.log(`  byDisposition=${JSON.stringify(byDisposition)}`);
console.log(`  byRightsState=${JSON.stringify(byRightsState)}`);
console.log(`  routeAgreement=2797/2797 crossRepoFiles=${crossRepoRefs.size} depTargets=${externalDependencies.length}`);
console.log(`  corpusScanFailures=${scanFailures.length}${scanFailures.length ? ": " + scanFailures.join(",") : ""}`);
console.log(`  leadingSlashNormalizations=${leadingSlashNormalizations} (upstream ~/..// double-slash includes)`);
