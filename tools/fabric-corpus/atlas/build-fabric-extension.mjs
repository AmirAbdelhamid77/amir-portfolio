// FC08 — Build content/atlas/fabric-extension.json from the frozen compiler
// route registry (FC03 output) and the compiled node files.
//
// Run (from the repository root; needs type stripping because it imports the
// pure lib/atlas/fabric-targets.ts functions):
//
//   node --experimental-strip-types tools/fabric-corpus/atlas/build-fabric-extension.mjs
//
// Flags:
//   --registry         path to route-registry.json
//                      (default: <repo>/../fabric-corpus-build/route-registry/route-registry.json,
//                       override the build dir with FABRIC_CORPUS_BUILD_DIR)
//   --compiler-output  path to the compiler output directory
//                      (default: <build-dir>/compiler-output)
//   --out              output path
//                      (default: <repo>/content/atlas/fabric-extension.json)
//
// What it produces (deterministic — no clock, no randomness, no network):
//   - mappingLedger "ledger": one row per PUBLISHED registry article with
//     disposition "awaiting-review" and deterministic family / ms.subservice
//     derived candidateConceptHints (fabric- prefixed, capped at 3).
//     "awaiting-review" is the explicit editorial disposition of the mapping
//     ledger — it is NOT a published assertion.
//   - "resourceRecords": typed-target Fabric resource records for the five
//     REPRESENTATIVE families only (fundamentals, onelake, data-factory,
//     real-time-intelligence, admin), each resolving to its registry
//     RouteTarget, mappingDisposition "awaiting-review", kind "fabric-docs",
//     no anchors, empty concept sets.
//   - "concepts": [] — Wave 2 ships zero new public concepts, zero approved
//     assertions and zero semantic edges. Human semantic publication is a
//     later, separate gate.
//
// Every build is self-validated with validateFabricExtension() and fails
// closed on any missing node file, missing field or validation error.
// Rebuilding from the same inputs is byte-identical (rows sorted, stable
// serialization).
//
// W3-B — PERSISTENT APPROVALS (fc08-report.md §7 succession):
//   - The builder ALWAYS loads the committed approvals sidecar
//     content/atlas/fabric-approvals.json (override with --approvals; the
//     file is part of the committed contract, so a missing sidecar fails
//     closed). After generating the mapping ledger it re-applies the
//     sidecar approvals through lib/atlas/fabric-approvals.ts, so REBUILDS
//     PRESERVE approved decisions: current-revision approvals stamp their
//     ledger row + resource record with disposition "approved" and the
//     reviewed evidence fields; STALE approvals (registryRevision differs
//     from the current registry) are NEVER applied and never silently
//     dropped — they are reported in the reconciliation section and require
//     re-review. Approvals for articles missing from the ledger fail the
//     build. The no-auto-approve guard runs on the merged output: an
//     "approved" row can only ever come from a sidecar record.
//   - When the sidecar carries at least one approval, the dataset gains a
//     deterministic "reconciliation" provenance block (applied/stale/
//     without-record counts and articleIds). With an empty sidecar the
//     output is byte-identical to the pre-W3-B builder.
//   - --verify-only mode: rebuild the expected dataset in memory (registry +
//     compiler output + sidecar) and compare it BYTES-INCLUSIVE against the
//     committed file (default --out). Match => exit 0; any drift (including
//     a regressed approval) => drift summary + failure. Never writes.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  indexFabricRegistry,
  validateFabricExtension,
  FABRIC_REGISTRY_SCHEMA,
  FABRIC_EXTENSION_SCHEMA,
} from "../../../lib/atlas/fabric-targets.ts";
import {
  applyApprovals,
  guardNoAutoApprove,
  loadFabricApprovals,
  FABRIC_APPROVALS_SCHEMA,
} from "../../../lib/atlas/fabric-approvals.ts";

/** The five representative families that ship typed resource records in Wave 2. */
export const REPRESENTATIVE_FAMILIES = Object.freeze([
  "fundamentals",
  "onelake",
  "data-factory",
  "real-time-intelligence",
  "admin",
]);

/** Maximum number of candidateConceptHints per ledger row. */
export const MAX_CONCEPT_HINTS = 3;

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/**
 * Normalize a front-matter value into a kebab-case concept-name fragment,
 * or null when nothing usable remains. Deterministic: lowercase, every run
 * of non [a-z0-9] characters becomes a single dash, edge dashes trimmed.
 */
export function normalizeConceptHint(value) {
  if (typeof value !== "string") return null;
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized === "" ? null : normalized;
}

/**
 * Deterministic candidateConceptHints for one registry article:
 *   1. "fabric-<family>"            (always present)
 *   2. "fabric-<ms.subservice>"     (when the compiled node front matter
 *                                    carries ms.subservice and it differs
 *                                    from the family hint)
 * Capped at MAX_CONCEPT_HINTS. Order is fixed by derivation, not input order.
 */
export function deriveConceptHints(article, msSubservice) {
  const hints = [];
  const familyHint = "fabric-" + normalizeConceptHint(article.family);
  if (familyHint !== "fabric-") hints.push(familyHint);
  const serviceHint = normalizeConceptHint(msSubservice);
  if (serviceHint) {
    const prefixed = "fabric-" + serviceHint;
    if (!hints.includes(prefixed)) hints.push(prefixed);
  }
  return hints.slice(0, MAX_CONCEPT_HINTS);
}

/**
 * Pure core: assemble the extension dataset object from a parsed route
 * registry plus a function resolving each article's ms.subservice front
 * matter value (null when absent). Throws on any registry inconsistency.
 * `subserviceForArticle(article)` must itself be deterministic; the CLI
 * wires it to compiled node files.
 *
 * W3-B: `approvals` (optional) is the parsed approvals sidecar. When given,
 * the freshly generated awaiting-review ledger and records are merged with
 * the sidecar through lib/atlas/fabric-approvals.ts applyApprovals(): the
 * builder itself NEVER sets "approved" — the sidecar record is the only
 * source, stale approvals are never applied, and the merged output passes
 * the no-auto-approve guard before self-validation. With an empty sidecar
 * the output is byte-identical to the pre-W3-B builder.
 */
export function buildFabricExtension({ registry, subserviceForArticle, approvals = null }) {
  const registryIndex = indexFabricRegistry(registry);

  const published = [];
  for (const family of registryIndex.registry.families) {
    for (const article of family.articles) {
      if (article.published === true) published.push(article);
    }
  }
  if (published.length === 0) throw new Error("build-fabric-extension: registry has no published articles");

  // Mapping ledger: every published article, sorted by articleId. The
  // disposition is the explicit editorial state "awaiting-review"; hints are
  // deterministic suggestions for a later human review, never assertions.
  let ledger = published
    .map((article) => {
      const hints = deriveConceptHints(article, subserviceForArticle(article));
      return {
        articleId: article.articleId,
        logicalPath: article.logicalPath,
        disposition: "awaiting-review",
        candidateConceptHints: hints,
        sourceSha256: article.sha256,
      };
    })
    .sort((a, b) => (a.articleId < b.articleId ? -1 : a.articleId > b.articleId ? 1 : 0));

  // Typed resource records: representative families only, one record per
  // published article in those families, sorted by resource id. The
  // resource id reuses the registry's unique article path (articleId minus
  // its "art:" prefix): the registry `slug` is only the last path segment
  // and collides across nested articles (e.g. three real-time-intelligence
  // "overview" pages).
  let records = published
    .filter((article) => REPRESENTATIVE_FAMILIES.includes(article.family))
    .map((article) => {
      if (!article.articleId.startsWith("art:")) {
        throw new Error(`build-fabric-extension: unexpected articleId form ${article.articleId}`);
      }
      return {
        id: "content:fabric-docs:" + article.articleId.slice("art:".length),
        articleId: article.articleId,
        title: article.title,
        kind: "fabric-docs",
        target: {
          kind: "fabric-article",
          routeTargetId: "rt:" + article.logicalPath,
        },
        logicalPath: article.logicalPath,
        conceptIds: [],
        declaredConceptIds: [],
        mappingDisposition: "awaiting-review",
        sourceSha256: article.sha256,
      };
    })
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  // W3-B persistent approvals: re-apply the committed sidecar so a rebuild
  // preserves approved decisions. The approvals module owns every rule:
  // staleness (never applied, surfaced), unknown articles (throw), stamping
  // (sidecar evidence only) and the no-auto-approve guard.
  let reconciliation = null;
  if (approvals !== null && approvals !== undefined) {
    const application = applyApprovals(ledger, approvals, { registry: registryIndex, records });
    ledger = application.ledger;
    records = application.records;
    // Deterministic provenance block — attached ONLY when the sidecar
    // carries at least one approval, so an empty sidecar yields output
    // byte-identical to the pre-W3-B builder.
    if (application.approvalsCount > 0) {
      const approvedRecordCount = records.filter((record) => record.mappingDisposition === "approved").length;
      const staleWarning = application.stale.length > 0
        ? " — STALE APPROVALS NOT APPLIED, RE-REVIEW REQUIRED"
        : "";
      reconciliation = {
        sidecarSchema: FABRIC_APPROVALS_SCHEMA,
        approvalsInSidecar: application.approvalsCount,
        applied: application.applied,
        appliedCount: application.applied.length,
        stale: application.stale,
        staleCount: application.stale.length,
        withoutRecord: application.withoutRecord,
        recordsApproved: approvedRecordCount,
        noAutoApproveGuard: "verified" + staleWarning,
      };
    }
    // Belt-and-braces on the exact objects that will be serialized: nothing
    // approved without a sidecar record may survive the merge.
    guardNoAutoApprove(ledger, approvals);
    guardNoAutoApprove(records, approvals, { dispositionField: "mappingDisposition" });
  }

  const approvedRecordsCount = records.filter((record) => record.mappingDisposition === "approved").length;
  const approvedLedgerRows = ledger.filter((row) => row.disposition === "approved").length;

  const extension = {
    schema: FABRIC_EXTENSION_SCHEMA,
    corpusRevision: registryIndex.registry.corpusRevision,
    registryRevision: registryIndex.registry.registryRevision,
    routeNamespace: registryIndex.registry.routeNamespace,
    ledger,
    concepts: [],
    resourceRecords: records,
    counts: {
      ledgerRows: ledger.length,
      publishedArticles: published.length,
      resourceRecords: records.length,
      approvedRecords: approvedRecordsCount,
      awaitingReviewRecords: records.length - approvedRecordsCount,
      approvedLedgerRows,
      concepts: 0,
    },
    ...(reconciliation !== null ? { reconciliation } : {}),
  };

  const errors = validateFabricExtension(extension, registryIndex);
  if (errors.length > 0) {
    throw new Error(
      "build-fabric-extension: assembled dataset failed self-validation:\n- " + errors.join("\n- "),
    );
  }
  return extension;
}

/** Stable serialization: 2-space JSON plus a trailing newline. */
export function serializeFabricExtension(extension) {
  return JSON.stringify(extension, null, 2) + "\n";
}

// ---------------------------------------------------------------------------
// CLI wiring
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { registry: null, compilerOutput: null, out: null, approvals: null, verifyOnly: false };
  const withValue = new Set(["--registry", "--compiler-output", "--out", "--approvals"]);
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === "--help" || flag === "-h") {
      console.log("Usage: node --experimental-strip-types tools/fabric-corpus/atlas/build-fabric-extension.mjs [--registry <path>] [--compiler-output <dir>] [--out <path>] [--approvals <path>] [--verify-only]");
      process.exit(0);
    }
    if (flag === "--verify-only") {
      args.verifyOnly = true;
      continue;
    }
    if (!withValue.has(flag)) {
      throw new Error(`build-fabric-extension: unknown flag ${flag}`);
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`build-fabric-extension: flag ${flag} requires a value`);
    }
    if (flag === "--registry") args.registry = value;
    else if (flag === "--compiler-output") args.compilerOutput = value;
    else if (flag === "--out") args.out = value;
    else if (flag === "--approvals") args.approvals = value;
    i += 1; // consume the flag's value
  }
  return args;
}

/**
 * Pure drift summarizer between the COMMITTED dataset and the EXPECTED
 * ledger+sidecar rebuild. Returns human-readable difference lines (articleId
 * lists capped at 20 entries each, with totals); an empty array means the
 * two are structurally identical (byte drift would then be formatting only).
 * Exported for tests and future drift tooling.
 */
export function diffFabricExtension(committed, expected) {
  if (!committed || typeof committed !== "object") return ["committed dataset is missing or not an object"];
  const diffs = [];
  const push = (line) => { if (diffs.length < 200) diffs.push(line); };
  const listLines = (label, items) => {
    push(`${label} ${items.length}`);
    for (const item of items.slice(0, 20)) push("  " + item);
    if (items.length > 20) push(`  ...(+${items.length - 20} more)`);
  };
  for (const key of ["schema", "corpusRevision", "registryRevision", "routeNamespace"]) {
    if (JSON.stringify(committed[key] ?? null) !== JSON.stringify(expected[key] ?? null)) {
      push(`${key}: committed=${JSON.stringify(committed[key] ?? null)} expected=${JSON.stringify(expected[key] ?? null)}`);
    }
  }
  const expectedCounts = expected.counts ?? {};
  const committedCounts = committed.counts ?? {};
  for (const key of Object.keys(expectedCounts)) {
    if (committedCounts[key] !== expectedCounts[key]) {
      push(`counts.${key}: committed=${JSON.stringify(committedCounts[key] ?? null)} expected=${expectedCounts[key]}`);
    }
  }

  const committedLedger = new Map(
    (Array.isArray(committed.ledger) ? committed.ledger : [])
      .filter((row) => row && typeof row.articleId === "string")
      .map((row) => [row.articleId, row]),
  );
  const expectedLedger = Array.isArray(expected.ledger) ? expected.ledger : [];
  const expectedLedgerIds = new Set(expectedLedger.map((row) => row.articleId));
  const ledgerMissing = [];
  const ledgerDisposition = [];
  const ledgerRow = [];
  const ledgerExtra = [];
  for (const row of expectedLedger) {
    const committedRow = committedLedger.get(row.articleId);
    if (!committedRow) { ledgerMissing.push(row.articleId); continue; }
    if (committedRow.disposition !== row.disposition) {
      ledgerDisposition.push(`${row.articleId}: committed=${committedRow.disposition} expected=${row.disposition}`);
    }
    if (JSON.stringify(committedRow) !== JSON.stringify(row)) ledgerRow.push(row.articleId);
  }
  for (const articleId of committedLedger.keys()) {
    if (!expectedLedgerIds.has(articleId)) ledgerExtra.push(articleId);
  }
  if (ledgerMissing.length) listLines("ledger rows missing from committed:", ledgerMissing);
  if (ledgerDisposition.length) listLines("ledger disposition drift:", ledgerDisposition);
  if (ledgerRow.length) listLines("ledger row content drift:", ledgerRow);
  if (ledgerExtra.length) listLines("ledger rows not in expected rebuild:", ledgerExtra);

  const committedRecords = new Map(
    (Array.isArray(committed.resourceRecords) ? committed.resourceRecords : [])
      .filter((record) => record && typeof record.id === "string")
      .map((record) => [record.id, record]),
  );
  const expectedRecords = Array.isArray(expected.resourceRecords) ? expected.resourceRecords : [];
  const expectedRecordIds = new Set(expectedRecords.map((record) => record.id));
  const recordsMissing = [];
  const recordsDisposition = [];
  const recordsRow = [];
  const recordsExtra = [];
  for (const record of expectedRecords) {
    const committedRecord = committedRecords.get(record.id);
    if (!committedRecord) { recordsMissing.push(record.id); continue; }
    if (committedRecord.mappingDisposition !== record.mappingDisposition) {
      recordsDisposition.push(`${record.id}: committed=${committedRecord.mappingDisposition} expected=${record.mappingDisposition}`);
    }
    if (JSON.stringify(committedRecord) !== JSON.stringify(record)) recordsRow.push(record.id);
  }
  for (const id of committedRecords.keys()) {
    if (!expectedRecordIds.has(id)) recordsExtra.push(id);
  }
  if (recordsMissing.length) listLines("resource records missing from committed:", recordsMissing);
  if (recordsDisposition.length) listLines("record disposition drift:", recordsDisposition);
  if (recordsRow.length) listLines("resource record content drift:", recordsRow);
  if (recordsExtra.length) listLines("resource records not in expected rebuild:", recordsExtra);

  return diffs;
}

function printReconciliation(reconciliation) {
  if (!reconciliation) {
    console.log("  approvals          sidecar empty — 0 applied / 0 stale (public projection of fabric resources stays empty until the human gate approves)");
    return;
  }
  console.log(`  approvals sidecar  ${reconciliation.approvalsInSidecar} approval(s)`);
  console.log(`  reconciliation     applied ${reconciliation.appliedCount} / stale ${reconciliation.staleCount} / without-record ${reconciliation.withoutRecord.length} (${reconciliation.noAutoApproveGuard})`);
  if (reconciliation.appliedCount > 0) {
    const items = reconciliation.applied.slice(0, 20);
    console.log(`    applied approvals: ${items.join(", ")}${reconciliation.applied.length > 20 ? ` ...(+${reconciliation.applied.length - 20} more)` : ""}`);
  }
  if (reconciliation.staleCount > 0) {
    console.log("    WARNING: stale approvals were NOT applied (approved against an older registry) — re-review required:");
    for (const conflict of reconciliation.stale.slice(0, 20)) {
      console.log(`      ${conflict.articleId} (approved against ${conflict.approvalRegistryRevision}, current ${conflict.currentRegistryRevision})`);
    }
    if (reconciliation.stale.length > 20) console.log(`      ...(+${reconciliation.stale.length - 20} more)`);
  }
  if (reconciliation.withoutRecord.length > 0) {
    const items = reconciliation.withoutRecord.slice(0, 20);
    console.log(`    applied to the ledger without a typed resource record (non-representative families): ${items.join(", ")}${reconciliation.withoutRecord.length > 20 ? ` ...(+${reconciliation.withoutRecord.length - 20} more)` : ""}`);
  }
}

function readSubserviceFromNodes(compilerOutputDir, registry) {
  // Fail-closed cache: every published article's node file must exist and
  // parse; its frontMatter.data must be an object when present.
  const cache = new Map();
  return (article) => {
    if (cache.has(article.articleId)) return cache.get(article.articleId);
    const nodePath = join(compilerOutputDir, ...article.nodeFile.split("/"));
    let node;
    try {
      node = JSON.parse(readFileSync(nodePath, "utf8"));
    } catch (error) {
      throw new Error(`build-fabric-extension: compiled node for ${article.articleId} is missing or unreadable at ${nodePath} (fail closed): ${error.message}`);
    }
    const data = node && typeof node === "object" && node.frontMatter && typeof node.frontMatter.data === "object" && node.frontMatter.data !== null
      ? node.frontMatter.data
      : null;
    if (!data) {
      throw new Error(`build-fabric-extension: compiled node for ${article.articleId} has no front matter data at ${nodePath} (fail closed)`);
    }
    const value = typeof data["ms.subservice"] === "string" ? data["ms.subservice"] : null;
    cache.set(article.articleId, value);
    return value;
  };
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const buildDir = process.env.FABRIC_CORPUS_BUILD_DIR && process.env.FABRIC_CORPUS_BUILD_DIR.trim() !== ""
    ? process.env.FABRIC_CORPUS_BUILD_DIR.trim()
    : join(repoRoot, "..", "fabric-corpus-build");
  const registryPath = args.registry ?? join(buildDir, "route-registry", "route-registry.json");
  const compilerOutputDir = args.compilerOutput ?? join(buildDir, "compiler-output");
  const outPath = args.out ?? join(repoRoot, "content", "atlas", "fabric-extension.json");
  const approvalsPath = args.approvals ?? join(repoRoot, "content", "atlas", "fabric-approvals.json");

  let registry;
  try {
    registry = JSON.parse(readFileSync(registryPath, "utf8"));
  } catch (error) {
    throw new Error(`build-fabric-extension: route registry is missing or unreadable at ${registryPath} (fail closed): ${error.message}`);
  }
  if (!registry || registry.schema !== FABRIC_REGISTRY_SCHEMA) {
    throw new Error(`build-fabric-extension: unexpected registry schema at ${registryPath}: ${String(registry && registry.schema)}`);
  }

  // W3-B: the approvals sidecar is part of the committed contract — always
  // loaded (fail closed) and merged into the generated ledger + records.
  const approvals = loadFabricApprovals(approvalsPath);

  const extension = buildFabricExtension({
    registry,
    subserviceForArticle: readSubserviceFromNodes(compilerOutputDir, registry),
    approvals,
  });

  if (args.verifyOnly) {
    let committedRaw;
    try {
      committedRaw = readFileSync(outPath, "utf8");
    } catch (error) {
      throw new Error(`build-fabric-extension: --verify-only cannot read the committed dataset at ${outPath} (fail closed): ${error.message}`);
    }
    const expected = serializeFabricExtension(extension);
    if (committedRaw === expected) {
      console.log(`build-fabric-extension: --verify-only OK — ${outPath} matches the ledger+sidecar rebuild byte-for-byte`);
      console.log(`  corpusRevision     ${extension.corpusRevision}`);
      console.log(`  registryRevision   ${extension.registryRevision}`);
      printReconciliation(extension.reconciliation ?? null);
      return { verified: true, outPath, extension };
    }
    const drift = diffFabricExtension(JSON.parse(committedRaw), extension);
    console.error(`build-fabric-extension: --verify-only DRIFT — committed dataset at ${outPath} does not match the ledger+sidecar rebuild (fail closed)`);
    for (const line of (drift.length > 0 ? drift : ["byte drift only: structure identical (whitespace or key order)"])) {
      console.error("  " + line);
    }
    throw new Error(`build-fabric-extension: --verify-only detected drift between the committed dataset and the ledger+sidecar state (${drift.length} structural difference(s)); rebuild and commit the dataset`);
  }

  const serialized = serializeFabricExtension(extension);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, serialized, "utf8");

  console.log(`build-fabric-extension: wrote ${outPath}`);
  console.log(`  approvals path     ${approvalsPath}`);
  console.log(`  corpusRevision     ${extension.corpusRevision}`);
  console.log(`  registryRevision   ${extension.registryRevision}`);
  console.log(`  ledger rows        ${extension.counts.ledgerRows} (published articles: ${extension.counts.publishedArticles})`);
  console.log(`  resource records   ${extension.counts.resourceRecords} across families: ${REPRESENTATIVE_FAMILIES.join(", ")}`);
  console.log(`  approved mappings  ${extension.counts.approvedRecords} (public projection of fabric resources is empty until the human gate approves)`);
  console.log(`  new concepts       ${extension.counts.concepts}`);
  printReconciliation(extension.reconciliation ?? null);
  return {
    extension,
    outPath,
    bytes: Buffer.byteLength(serialized, "utf8"),
    reconciliation: extension.reconciliation ?? null,
  };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main();
}
