/**
 * FC08 — Typed Fabric article targets for the Atlas extension.
 *
 * This module is PURELY ADDITIVE. It never widens `validResourceHref()` in
 * `lib/atlas/model.ts` (the three legacy DP-600 families stay closed, guarded
 * by tests/atlas/isolation.test.mjs) and never mutates the legacy projection
 * pipeline. Fabric article resources enter through a separate, typed
 * admission mechanism only:
 *
 *   1. A Fabric resource record carries `target: { kind: "fabric-article",
 *      routeTargetId }`. `routeTargetId` is a `rt:<logical path>[#anchor]`
 *      RouteTarget ID from the frozen identity registry (the bare
 *      `<logical path>[#anchor]` spelling is also admitted as an exact-match
 *      convenience; both require exact string equality against a registry
 *      row). `href` is forbidden on Fabric records: one admission mechanism
 *      per record, no double admission.
 *   2. Resolution is exact-match only: no prefix rules, no regex over path
 *      strings, no normalization, no alias guessing, no URL decoding. An
 *      unknown `routeTargetId` fails closed (validation error; dropped at
 *      projection time).
 *   3. Anchors resolve only as members of the article's compiled heading set
 *      (compiler node output, injected as `compiledNodeIndex`). Unknown
 *      anchors are rejected, never trimmed.
 *   4. Mapping dispositions default to "awaiting-review". Only records whose
 *      mappingDisposition is "approved" are public-projectable, and then only
 *      with the allowlisted fields { id, title, logicalPath, kind,
 *      conceptIds }. In Wave 2 every mapping is "awaiting-review", so the
 *      public projection of Fabric resources is EMPTY by default (fail
 *      closed).
 *   5. Corpus-originated concepts use the `fabric-` prefix (identity
 *      registry). A record may only map to concepts it itself declares in
 *      `declaredConceptIds`; Wave 2 ships zero concepts, so Wave 2 records
 *      carry empty concept sets.
 *
 * The module imports only `node:fs` (for the build-time loaders). Every
 * exported function is pure and injectable: registries, compiled node
 * indexes and file paths are parameters, so tests never touch the real
 * 2,705-row registry unless explicitly loading it.
 */

import { readFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// Registry shapes (read-only projections of the compiler route registry)
// ---------------------------------------------------------------------------

export type FabricRegistryArticle = {
  articleId: string;
  family: string;
  slug: string;
  title: string;
  logicalPath: string;
  nodeFile: string;
  sha256: string;
  published: boolean;
};

export type FabricRouteRegistry = {
  schema: string;
  corpusRevision: string;
  routeNamespace: string;
  families: { family: string; articles: FabricRegistryArticle[] }[];
  registryRevision: string;
};

/** O(1) lookup index over a registry. Build once, reuse for bulk work. */
export type FabricRegistryIndex = {
  registry: FabricRouteRegistry;
  byLogicalPath: Map<string, FabricRegistryArticle>;
  byArticleId: Map<string, FabricRegistryArticle>;
};

export type FabricResolvedTarget = {
  logicalPath: string;
  anchor?: string;
  title: string;
};

/**
 * A compiled-node anchor index: logical path -> heading anchor slugs.
 * Accepts a Map (logicalPath -> Set of anchors) or a plain JSON-friendly
 * object (logicalPath -> array of anchors).
 */
export type FabricCompiledNodeIndex =
  | Map<string, ReadonlySet<string>>
  | Record<string, readonly string[]>;

// ---------------------------------------------------------------------------
// Fabric extension dataset shapes (content/atlas/fabric-extension.json)
// ---------------------------------------------------------------------------

export const FABRIC_TARGET_KIND = "fabric-article" as const;
export const FABRIC_RESOURCE_KIND = "fabric-docs" as const;
export const FABRIC_EXTENSION_SCHEMA = "hansa.atlas.fabric-extension/1" as const;
export const FABRIC_REGISTRY_SCHEMA = "hansa.fabric-route-registry/1" as const;

/** Editorial dispositions a Fabric mapping may carry. */
export const FABRIC_DISPOSITIONS = ["awaiting-review", "approved"] as const;
export type FabricMappingDisposition = (typeof FABRIC_DISPOSITIONS)[number];

export type FabricMappingLedgerRow = {
  articleId: string;
  logicalPath: string;
  disposition: FabricMappingDisposition;
  candidateConceptHints: string[];
  sourceSha256: string;
};

/**
 * A Fabric-originated concept declared by the extension. Wave 2 ships an
 * empty array (zero new public concepts); later waves carry full concept
 * definitions following the existing Atlas Concept shape, always with the
 * `fabric-` id prefix.
 */
export type FabricExtensionConcept = { id: string } & Record<string, unknown>;

export type FabricResourceRecord = {
  id: string;
  articleId: string;
  title: string;
  kind: typeof FABRIC_RESOURCE_KIND;
  target: { kind: typeof FABRIC_TARGET_KIND; routeTargetId: string };
  logicalPath: string;
  /** Concepts this record maps to. Must be a subset of declaredConceptIds. */
  conceptIds: string[];
  /**
   * The concept set this record declares for itself. Corpus-originated
   * concepts use the `fabric-` prefix. A record may never map outside the
   * set it declares.
   */
  declaredConceptIds: string[];
  mappingDisposition: FabricMappingDisposition;
  sourceSha256: string;
};

export type FabricExtensionDataset = {
  schema: typeof FABRIC_EXTENSION_SCHEMA;
  corpusRevision: string;
  registryRevision: string;
  routeNamespace: string;
  ledger: FabricMappingLedgerRow[];
  /** Fabric-originated concepts declared by this extension. Wave 2: empty. */
  concepts: FabricExtensionConcept[];
  resourceRecords: FabricResourceRecord[];
  counts: {
    ledgerRows: number;
    publishedArticles: number;
    resourceRecords: number;
    approvedRecords: number;
    awaitingReviewRecords: number;
    approvedLedgerRows: number;
    concepts: number;
  };
};

/** Allowlisted public-projectable fields for an approved Fabric resource. */
export type FabricCatalogRow = {
  id: string;
  title: string;
  logicalPath: string;
  kind: string;
  conceptIds: string[];
};

// ---------------------------------------------------------------------------
// Small pure helpers (no imports, no global state)
// ---------------------------------------------------------------------------

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const uniqueStrings = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;
  const items: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") return null;
    items.push(item);
  }
  return new Set(items).size === items.length ? items : null;
};

/** Normalize a registry index input; accepts a registry or a built index. */
function toIndex(registry: FabricRouteRegistry | FabricRegistryIndex): FabricRegistryIndex {
  // Cast before the property probe: the union member FabricRouteRegistry does
  // not declare byLogicalPath, so a direct access is TS2339. The runtime check
  // is unchanged — an index is recognized by its Map.
  if (isPlainObject(registry) && (registry as FabricRegistryIndex).byLogicalPath instanceof Map) {
    return registry as FabricRegistryIndex;
  }
  return indexFabricRegistry(registry as FabricRouteRegistry);
}

/** Registry articles that are published (the ledger's universe). */
export function publishedRegistryArticles(
  registry: FabricRouteRegistry | FabricRegistryIndex,
): FabricRegistryArticle[] {
  const index = toIndex(registry);
  const rows: FabricRegistryArticle[] = [];
  for (const family of index.registry.families) {
    for (const article of family.articles) {
      if (article.published === true) rows.push(article);
    }
  }
  return rows;
}

// ---------------------------------------------------------------------------
// (a) Typed-target resolution — exact match against the route registry only
// ---------------------------------------------------------------------------

/**
 * Build an O(1) index over the route registry. Rows must be internally
 * consistent (unique articleIds and unique logical paths); anything else
 * throws so a corrupted registry can never resolve anything.
 */
export function indexFabricRegistry(registry: FabricRouteRegistry): FabricRegistryIndex {
  if (!isPlainObject(registry)) throw new Error("Fabric registry: not an object");
  if (registry.schema !== FABRIC_REGISTRY_SCHEMA) {
    throw new Error(`Fabric registry: unexpected schema ${String(registry.schema)}`);
  }
  if (!Array.isArray(registry.families)) throw new Error("Fabric registry: families missing");
  if (typeof registry.routeNamespace !== "string" || !registry.routeNamespace) {
    throw new Error("Fabric registry: routeNamespace missing");
  }
  const byLogicalPath = new Map<string, FabricRegistryArticle>();
  const byArticleId = new Map<string, FabricRegistryArticle>();
  for (const family of registry.families) {
    if (!isPlainObject(family) || !Array.isArray(family.articles)) {
      throw new Error("Fabric registry: malformed family");
    }
    for (const article of family.articles) {
      if (!isPlainObject(article)) throw new Error("Fabric registry: malformed article");
      if (typeof article.articleId !== "string" || !article.articleId) {
        throw new Error("Fabric registry: article without articleId");
      }
      if (typeof article.logicalPath !== "string" || !article.logicalPath) {
        throw new Error("Fabric registry: article without logicalPath");
      }
      if (byLogicalPath.has(article.logicalPath) || byArticleId.has(article.articleId)) {
        throw new Error("Fabric registry: duplicate identity");
      }
      const typed = article as unknown as FabricRegistryArticle;
      byLogicalPath.set(article.logicalPath, typed);
      byArticleId.set(article.articleId, typed);
    }
  }
  return { registry, byLogicalPath, byArticleId };
}

/**
 * Split `rt:<logical path>[#anchor]` (or the bare logical-path spelling)
 * into the path candidate and the optional anchor. Splitting happens on the
 * first `#` only; there is no decoding, trimming or normalization of any
 * other kind, so a candidate can only match a registry row by exact string
 * equality.
 */
function splitRouteTargetId(routeTargetId: string): { pathCandidate: string; anchor?: string } {
  const hash = routeTargetId.indexOf("#");
  if (hash === -1) return { pathCandidate: routeTargetId };
  const anchor = routeTargetId.slice(hash + 1);
  // An empty or trailing-delimiter anchor is not a registry identity.
  if (anchor === "" || anchor === "/") return { pathCandidate: "\u0000invalid-anchor" };
  return { pathCandidate: routeTargetId.slice(0, hash), anchor };
}

function lookupLogicalPath(
  index: FabricRegistryIndex,
  pathCandidate: string,
): FabricRegistryArticle | null {
  if (index.byLogicalPath.has(pathCandidate)) return index.byLogicalPath.get(pathCandidate)!;
  if (pathCandidate.startsWith("rt:")) {
    const bare = pathCandidate.slice(3);
    if (index.byLogicalPath.has(bare)) return index.byLogicalPath.get(bare)!;
  }
  return null;
}

/**
 * Resolve a RouteTarget ID against the route registry by exact match.
 * Accepts `rt:<logical path>[#anchor]` (identity-registry canonical form)
 * or the bare `<logical path>[#anchor]` spelling. Returns null for anything
 * that is not an exact registry row: unknown paths, traversal (`..`),
 * case variants, query strings, encoded characters, wrong families — all
 * fail closed with no error thrown, because a non-match is a normal
 * negative answer, not a corruption.
 */
export function resolveFabricTarget(
  routeTargetId: string,
  registry: FabricRouteRegistry | FabricRegistryIndex,
): FabricResolvedTarget | null {
  if (typeof routeTargetId !== "string" || routeTargetId === "") return null;
  const index = toIndex(registry);
  const { pathCandidate, anchor } = splitRouteTargetId(routeTargetId);
  const article = lookupLogicalPath(index, pathCandidate);
  if (!article) return null;
  const resolved: FabricResolvedTarget = { logicalPath: article.logicalPath, title: article.title };
  if (anchor !== undefined) resolved.anchor = anchor;
  return resolved;
}

/** Normalize a compiled-node anchor index into Map<string, Set<string>>. */
function toAnchorIndex(
  compiledNodeIndex: FabricCompiledNodeIndex | undefined,
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  if (!compiledNodeIndex) return map;
  if (compiledNodeIndex instanceof Map) {
    for (const [key, value] of compiledNodeIndex) {
      map.set(key, new Set(Array.from(value as Iterable<string>)));
    }
    return map;
  }
  for (const key of Object.keys(compiledNodeIndex)) {
    map.set(key, new Set(Array.from(compiledNodeIndex[key])));
  }
  return map;
}

// ---------------------------------------------------------------------------
// (b) Record validation — fail-closed, returns a list of errors
// ---------------------------------------------------------------------------

/**
 * Validate one Fabric resource record against the route registry and the
 * compiled node anchor index. Returns an array of error strings; an empty
 * array means the record is valid. Checks:
 *
 *   - record shape and the fixed Fabric kinds;
 *   - a typed `target` is required (kind "fabric-article" + routeTargetId);
 *   - a legacy `href` is forbidden on a Fabric record (with or without a
 *     target — one admission mechanism per record);
 *   - the routeTargetId resolves by exact match against the registry;
 *   - record identity fields (articleId, logicalPath, sourceSha256) agree
 *     with the resolved registry row;
 *   - when the target carries an anchor, the anchor must be a member of the
 *     article's compiled heading set (unknown anchor or unknown compiled
 *     node => error, never trimmed);
 *   - conceptIds are unique strings, declaredConceptIds are unique
 *     `fabric-`-prefixed strings, and every conceptId exists in the concept
 *     set the record declares.
 */
export function validateFabricResourceRecord(
  record: unknown,
  registry: FabricRouteRegistry | FabricRegistryIndex,
  compiledNodeIndex?: FabricCompiledNodeIndex,
): string[] {
  const errors: string[] = [];
  const label = (field: string) =>
    `fabric resource ${isPlainObject(record) && typeof record.id === "string" ? record.id : "(unidentified)"}: ${field}`;

  if (!isPlainObject(record)) return ["fabric resource record: not an object"];
  if (typeof record.id !== "string" || !record.id) return ["fabric resource record: missing id"];

  if (record.kind !== FABRIC_RESOURCE_KIND) {
    errors.push(label(`kind must be "${FABRIC_RESOURCE_KIND}", got ${JSON.stringify(record.kind ?? null)}`));
  }

  // One admission mechanism per record: a typed target is required and a
  // legacy href is forbidden — the combination is invalid either way.
  if (Object.hasOwn(record, "href")) {
    errors.push(label("legacy href field is forbidden on a fabric resource record"));
  }
  const target = record.target;
  if (!isPlainObject(target)) {
    errors.push(label("typed target missing (expected { kind, routeTargetId })"));
  } else {
    if (target.kind !== FABRIC_TARGET_KIND) {
      errors.push(label(`target.kind must be "${FABRIC_TARGET_KIND}", got ${JSON.stringify(target.kind ?? null)}`));
    }
    if (typeof target.routeTargetId !== "string" || !target.routeTargetId) {
      errors.push(label("target.routeTargetId missing or not a string"));
    }
  }

  const index = toIndex(registry);
  if (isPlainObject(target) && typeof target.routeTargetId === "string" && target.routeTargetId) {
    const { pathCandidate, anchor } = splitRouteTargetId(target.routeTargetId);
    const article = lookupLogicalPath(index, pathCandidate);
    if (!article) {
      errors.push(label(`target.routeTargetId ${JSON.stringify(target.routeTargetId)} does not resolve to a registry route`));
    } else {
      if (record.articleId !== article.articleId) {
        errors.push(label(`articleId ${JSON.stringify(record.articleId ?? null)} does not match registry article ${article.articleId}`));
      }
      if (record.logicalPath !== article.logicalPath) {
        errors.push(label(`logicalPath ${JSON.stringify(record.logicalPath ?? null)} does not match registry logical path ${article.logicalPath}`));
      }
      if (record.sourceSha256 !== article.sha256) {
        errors.push(label(`sourceSha256 does not match the registry row for ${article.articleId}`));
      }
      if (anchor !== undefined) {
        const anchors = toAnchorIndex(compiledNodeIndex).get(article.logicalPath);
        if (!anchors) {
          errors.push(label(`compiled node anchor set missing for ${article.logicalPath}; anchor cannot be verified`));
        } else if (!anchors.has(anchor)) {
          errors.push(label(`anchor ${JSON.stringify(anchor)} is not a heading anchor of ${article.logicalPath}`));
        }
      }
    }
  }

  const conceptIds = uniqueStrings(record.conceptIds);
  if (!conceptIds) {
    errors.push(label("conceptIds must be an array of unique strings"));
  }
  const declaredConceptIds = uniqueStrings(record.declaredConceptIds);
  if (!declaredConceptIds) {
    errors.push(label("declaredConceptIds must be an array of unique strings"));
  }
  if (declaredConceptIds) {
    for (const id of declaredConceptIds) {
      if (!id.startsWith("fabric-")) {
        errors.push(label(`declared concept ${JSON.stringify(id)} is not fabric-originated (missing "fabric-" prefix)`));
      }
    }
  }
  if (conceptIds && declaredConceptIds) {
    const declared = new Set(declaredConceptIds);
    for (const id of conceptIds) {
      if (!declared.has(id)) {
        errors.push(label(`conceptId ${JSON.stringify(id)} is not in the concept set the record declares`));
      }
    }
  }

  if (
    typeof record.mappingDisposition !== "string"
    || !(FABRIC_DISPOSITIONS as readonly string[]).includes(record.mappingDisposition)
  ) {
    errors.push(label(`mappingDisposition must be one of ${FABRIC_DISPOSITIONS.join(" | ")}`));
  }

  return errors;
}

/**
 * Validate a whole Fabric extension dataset against its route registry.
 * Beyond per-record validation this checks the schema/version binding, the
 * mapping ledger (exactly the registry's published article set, each row's
 * logicalPath/sourceSha256 in agreement, dispositions in vocabulary, hints
 * capped at 3), ledger/record disposition agreement, record-id uniqueness,
 * and the counts block. Returns an error list; empty means valid.
 */
export function validateFabricExtension(
  extension: unknown,
  registry: FabricRouteRegistry | FabricRegistryIndex,
  compiledNodeIndex?: FabricCompiledNodeIndex,
): string[] {
  const errors: string[] = [];
  if (!isPlainObject(extension)) return ["fabric extension: not an object"];

  const index = toIndex(registry);
  const reg = index.registry;

  if (extension.schema !== FABRIC_EXTENSION_SCHEMA) {
    errors.push(`fabric extension: unexpected schema ${String(extension.schema)}`);
  }
  if (extension.corpusRevision !== reg.corpusRevision) {
    errors.push(`fabric extension: corpusRevision ${JSON.stringify(extension.corpusRevision ?? null)} does not match registry ${reg.corpusRevision}`);
  }
  if (extension.registryRevision !== reg.registryRevision) {
    errors.push(`fabric extension: registryRevision ${JSON.stringify(extension.registryRevision ?? null)} does not match registry ${reg.registryRevision}`);
  }
  if (extension.routeNamespace !== reg.routeNamespace) {
    errors.push(`fabric extension: routeNamespace ${JSON.stringify(extension.routeNamespace ?? null)} does not match registry ${reg.routeNamespace}`);
  }

  const published = publishedRegistryArticles(index);
  const publishedById = new Map(published.map((article) => [article.articleId, article] as const));

  const ledger = extension.ledger;
  if (!Array.isArray(ledger)) {
    errors.push("fabric extension: ledger missing or not an array");
  } else {
    const seen = new Set<string>();
    for (const row of ledger as unknown[]) {
      if (!isPlainObject(row)) { errors.push("fabric extension: malformed ledger row"); continue; }
      const id = typeof row.articleId === "string" ? row.articleId : "(unidentified)";
      if (typeof row.articleId !== "string" || !row.articleId) {
        errors.push(`fabric ledger row: missing articleId`);
        continue;
      }
      if (seen.has(row.articleId)) errors.push(`fabric ledger row: duplicate articleId ${row.articleId}`);
      seen.add(row.articleId);
      const article = publishedById.get(row.articleId);
      if (!article) {
        errors.push(`fabric ledger row ${row.articleId}: not a published registry article`);
        continue;
      }
      if (row.logicalPath !== article.logicalPath) {
        errors.push(`fabric ledger row ${row.articleId}: logicalPath does not match the registry`);
      }
      if (row.sourceSha256 !== article.sha256) {
        errors.push(`fabric ledger row ${row.articleId}: sourceSha256 does not match the registry`);
      }
      if (
        typeof row.disposition !== "string"
        || !(FABRIC_DISPOSITIONS as readonly string[]).includes(row.disposition)
      ) {
        errors.push(`fabric ledger row ${row.articleId}: disposition must be one of ${FABRIC_DISPOSITIONS.join(" | ")}`);
      }
      const hints = uniqueStrings(row.candidateConceptHints);
      if (!hints) {
        errors.push(`fabric ledger row ${row.articleId}: candidateConceptHints must be unique strings`);
      } else if (hints.length > 3) {
        errors.push(`fabric ledger row ${row.articleId}: candidateConceptHints capped at 3`);
      } else {
        for (const hint of hints) {
          if (!hint.startsWith("fabric-")) {
            errors.push(`fabric ledger row ${row.articleId}: hint ${JSON.stringify(hint)} is not fabric-originated (missing "fabric-" prefix)`);
          }
        }
      }
    }
    if (ledger.length !== published.length) {
      errors.push(`fabric extension: ledger has ${ledger.length} rows for ${published.length} published articles`);
    }
    for (const article of published) {
      if (!seen.has(article.articleId)) {
        errors.push(`fabric extension: ledger is missing published article ${article.articleId}`);
      }
    }
  }

  const ledgerDispositionById = new Map<string, string>();
  if (Array.isArray(ledger)) {
    for (const row of ledger as unknown[]) {
      if (isPlainObject(row) && typeof row.articleId === "string" && typeof row.disposition === "string") {
        ledgerDispositionById.set(row.articleId, row.disposition);
      }
    }
  }

  // The declared concept set: the extension's own fabric- concepts. Wave 2
  // ships none; records may never declare or map outside this set.
  const extensionConceptIds = new Set<string>();
  const concepts = extension.concepts;
  if (!Array.isArray(concepts)) {
    errors.push("fabric extension: concepts missing or not an array (Wave 2 ships an empty array)");
  } else {
    for (const concept of concepts as unknown[]) {
      if (!isPlainObject(concept) || typeof concept.id !== "string" || !concept.id) {
        errors.push("fabric extension: malformed concept entry (missing id)");
        continue;
      }
      if (!concept.id.startsWith("fabric-")) {
        errors.push(`fabric extension: concept ${concept.id} is not fabric-originated (missing "fabric-" prefix)`);
      }
      if (extensionConceptIds.has(concept.id)) {
        errors.push(`fabric extension: duplicate concept id ${concept.id}`);
      }
      extensionConceptIds.add(concept.id);
    }
  }

  const records = extension.resourceRecords;
  const seenRecordIds = new Set<string>();
  const seenRecordArticles = new Set<string>();
  const declaredAcrossRecords = new Set<string>();
  let awaitingReviewRecords = 0;
  let approvedRecords = 0;
  if (!Array.isArray(records)) {
    errors.push("fabric extension: resourceRecords missing or not an array");
  } else {
    for (const record of records as unknown[]) {
      for (const error of validateFabricResourceRecord(record, index, compiledNodeIndex)) {
        errors.push(error);
      }
      if (isPlainObject(record) && typeof record.id === "string") {
        if (seenRecordIds.has(record.id)) {
          errors.push(`fabric extension: duplicate resource record id ${record.id}`);
        }
        seenRecordIds.add(record.id);
      }
      if (isPlainObject(record) && typeof record.articleId === "string") {
        if (seenRecordArticles.has(record.articleId)) {
          errors.push(`fabric extension: duplicate resource record for article ${record.articleId}`);
        }
        seenRecordArticles.add(record.articleId);
        if (!ledgerDispositionById.has(record.articleId)) {
          errors.push(`fabric extension: resource record for ${record.articleId} has no mapping ledger row`);
        } else if (isPlainObject(record) && typeof record.mappingDisposition === "string") {
          const ledgerDisposition = ledgerDispositionById.get(record.articleId);
          if (ledgerDisposition !== record.mappingDisposition) {
            errors.push(`fabric extension: resource record for ${record.articleId} disposition ${record.mappingDisposition} disagrees with ledger disposition ${ledgerDisposition}`);
          }
        }
      }
      if (isPlainObject(record) && Array.isArray(record.declaredConceptIds)) {
        for (const id of record.declaredConceptIds as unknown[]) {
          if (typeof id === "string") {
            declaredAcrossRecords.add(id);
            if (!extensionConceptIds.has(id)) {
              errors.push(`fabric extension: record declares concept ${id} which the extension does not declare`);
            }
          }
        }
      }
      if (isPlainObject(record) && record.mappingDisposition === "approved") approvedRecords += 1;
      if (isPlainObject(record) && record.mappingDisposition === "awaiting-review") awaitingReviewRecords += 1;
    }
  }

  const counts = extension.counts;
  if (!isPlainObject(counts)) {
    errors.push("fabric extension: counts missing");
  } else {
    const expected = {
      ledgerRows: Array.isArray(ledger) ? ledger.length : -1,
      publishedArticles: published.length,
      resourceRecords: Array.isArray(records) ? records.length : -1,
      approvedRecords,
      awaitingReviewRecords,
      approvedLedgerRows: Array.isArray(ledger)
        ? (ledger as unknown[]).filter((row) => isPlainObject(row) && row.disposition === "approved").length
        : -1,
      concepts: Array.isArray(concepts) ? concepts.length : -1,
    };
    for (const key of Object.keys(expected) as (keyof typeof expected)[]) {
      if (counts[key] !== expected[key]) {
        errors.push(`fabric extension: counts.${key} is ${JSON.stringify(counts[key] ?? null)}, expected ${expected[key]}`);
      }
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// (c) Public projection — approved mappings only, allowlisted fields only
// ---------------------------------------------------------------------------

export type ProjectFabricCatalogOptions = {
  /**
   * Build guard: when set, the registry's registryRevision must equal this
   * value or projection throws (protects against projecting against a stale
   * registry).
   */
  requireRevision?: string;
  /**
   * The set of concept ids that exist in the public projection. Approved
   * records whose conceptIds are not a subset of it are dropped so the
   * projected row never dangles. When omitted, only approved records with
   * an empty conceptIds list can project (fail closed).
   */
  publicConceptIds?: Iterable<string>;
};

/**
 * Project the public Fabric catalog: only records whose mappingDisposition
 * is "approved", and only after their typed target resolves against the
 * registry. Every other record — in Wave 2, every record — is withheld, so
 * the default projection of Fabric resources is EMPTY (fail closed).
 * Output rows carry only the allowlisted fields { id, title, logicalPath,
 * kind, conceptIds }; title and logicalPath come from the resolved registry
 * row, never from the record's own fields. Rows are sorted by id so the
 * output is byte-stable. Approved records that fail to resolve or whose
 * conceptIds cannot be verified are dropped, never degraded.
 */
export function projectFabricCatalog(
  records: readonly FabricResourceRecord[] | readonly unknown[],
  registry: FabricRouteRegistry | FabricRegistryIndex,
  opts: ProjectFabricCatalogOptions = {},
): FabricCatalogRow[] {
  if (opts.requireRevision !== undefined) {
    const index = toIndex(registry);
    if (index.registry.registryRevision !== opts.requireRevision) {
      throw new Error(`projectFabricCatalog: registry revision ${index.registry.registryRevision} does not match required ${opts.requireRevision}`);
    }
  }
  const publicConceptIds = opts.publicConceptIds === undefined ? null : new Set(opts.publicConceptIds);
  const rows: FabricCatalogRow[] = [];
  for (const record of records as readonly unknown[]) {
    if (!isPlainObject(record)) continue;
    if (record.mappingDisposition !== "approved") continue;
    const target = record.target;
    if (!isPlainObject(target) || typeof target.routeTargetId !== "string") continue;
    const resolved = resolveFabricTarget(target.routeTargetId, registry);
    if (!resolved) continue;
    const conceptIds = uniqueStrings(record.conceptIds);
    if (!conceptIds) continue;
    if (publicConceptIds === null) {
      if (conceptIds.length !== 0) continue;
    } else if (!conceptIds.every((id) => publicConceptIds.has(id))) {
      continue;
    }
    rows.push({
      id: typeof record.id === "string" ? record.id : "",
      title: resolved.title,
      logicalPath: resolved.logicalPath,
      kind: typeof record.kind === "string" ? record.kind : "",
      conceptIds,
    });
  }
  rows.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return rows;
}

// ---------------------------------------------------------------------------
// (d) Build-time loaders — fail-closed on absence, injectable for tests
// ---------------------------------------------------------------------------

const joinPaths = (...parts: string[]) => parts.map((p) => p.replace(/\\/g, "/")).join("/").replace(/\/+/g, "/");

const defaultBuildDir = () => {
  const fromEnv = process.env.FABRIC_CORPUS_BUILD_DIR;
  if (fromEnv && fromEnv.trim() !== "") return fromEnv.trim();
  // Loaders are build-time only and run with the repo root as cwd.
  return joinPaths(process.cwd(), "..", "fabric-corpus-build");
};

export type GetFabricExtensionOptions = {
  extensionPath?: string;
  registryPath?: string;
  compiledNodeIndex?: FabricCompiledNodeIndex;
};

export type LoadedFabricExtension = {
  extension: FabricExtensionDataset;
  registry: FabricRouteRegistry;
  registryIndex: FabricRegistryIndex;
};

/**
 * Build-time loader for the Fabric Atlas extension. Reads
 * content/atlas/fabric-extension.json and the compiler route registry from
 * the build workspace (default `<repo>/../fabric-corpus-build`, override
 * with FABRIC_CORPUS_BUILD_DIR or explicit paths) and validates the pair
 * before returning. Any missing file, unparsable JSON or validation error
 * throws — the loader fails closed, it never returns a partial dataset.
 */
export function getFabricExtension(opts: GetFabricExtensionOptions = {}): LoadedFabricExtension {
  const extensionPath = opts.extensionPath ?? joinPaths(process.cwd(), "content", "atlas", "fabric-extension.json");
  const registryPath = opts.registryPath ?? joinPaths(defaultBuildDir(), "route-registry", "route-registry.json");

  let extensionRaw: string;
  let registryRaw: string;
  try {
    extensionRaw = readFileSync(extensionPath, "utf8");
  } catch (error) {
    throw new Error(`getFabricExtension: fabric extension dataset is missing or unreadable at ${extensionPath} (fail closed)`, { cause: error });
  }
  try {
    registryRaw = readFileSync(registryPath, "utf8");
  } catch (error) {
    throw new Error(`getFabricExtension: route registry is missing or unreadable at ${registryPath} (fail closed)`, { cause: error });
  }

  let extension: unknown;
  let registry: unknown;
  try {
    extension = JSON.parse(extensionRaw);
  } catch (error) {
    throw new Error(`getFabricExtension: fabric extension dataset at ${extensionPath} is not valid JSON (fail closed)`, { cause: error });
  }
  try {
    registry = JSON.parse(registryRaw);
  } catch (error) {
    throw new Error(`getFabricExtension: route registry at ${registryPath} is not valid JSON (fail closed)`, { cause: error });
  }

  const errors = validateFabricExtension(extension, registry as FabricRouteRegistry, opts.compiledNodeIndex);
  if (errors.length > 0) {
    throw new Error(`getFabricExtension: fabric extension dataset failed validation (fail closed):\n- ${errors.join("\n- ")}`);
  }

  const typedRegistry = registry as FabricRouteRegistry;
  const registryIndex = indexFabricRegistry(typedRegistry);
  return {
    extension: extension as FabricExtensionDataset,
    registry: typedRegistry,
    registryIndex,
  };
}
