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

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  indexFabricRegistry,
  validateFabricExtension,
  FABRIC_REGISTRY_SCHEMA,
  FABRIC_EXTENSION_SCHEMA,
} from "../../../lib/atlas/fabric-targets.ts";

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
 */
export function buildFabricExtension({ registry, subserviceForArticle }) {
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
  const ledger = published
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
  const records = published
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
      approvedRecords: 0,
      awaitingReviewRecords: records.length,
      approvedLedgerRows: 0,
      concepts: 0,
    },
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
  const args = { registry: null, compilerOutput: null, out: null };
  const withValue = new Set(["--registry", "--compiler-output", "--out"]);
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === "--help" || flag === "-h") {
      console.log("Usage: node --experimental-strip-types tools/fabric-corpus/atlas/build-fabric-extension.mjs [--registry <path>] [--compiler-output <dir>] [--out <path>]");
      process.exit(0);
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
    i += 1; // consume the flag's value
  }
  return args;
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

  let registry;
  try {
    registry = JSON.parse(readFileSync(registryPath, "utf8"));
  } catch (error) {
    throw new Error(`build-fabric-extension: route registry is missing or unreadable at ${registryPath} (fail closed): ${error.message}`);
  }
  if (!registry || registry.schema !== FABRIC_REGISTRY_SCHEMA) {
    throw new Error(`build-fabric-extension: unexpected registry schema at ${registryPath}: ${String(registry && registry.schema)}`);
  }

  const extension = buildFabricExtension({
    registry,
    subserviceForArticle: readSubserviceFromNodes(compilerOutputDir, registry),
  });

  const serialized = serializeFabricExtension(extension);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, serialized, "utf8");

  console.log(`build-fabric-extension: wrote ${outPath}`);
  console.log(`  corpusRevision     ${extension.corpusRevision}`);
  console.log(`  registryRevision   ${extension.registryRevision}`);
  console.log(`  ledger rows        ${extension.counts.ledgerRows} (published articles: ${extension.counts.publishedArticles})`);
  console.log(`  resource records   ${extension.counts.resourceRecords} across families: ${REPRESENTATIVE_FAMILIES.join(", ")}`);
  console.log(`  approved mappings  ${extension.counts.approvedRecords} (public projection of fabric resources is empty until the human gate approves)`);
  console.log(`  new concepts       ${extension.counts.concepts}`);
  return { extension, outPath, bytes: Buffer.byteLength(serialized, "utf8") };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main();
}
