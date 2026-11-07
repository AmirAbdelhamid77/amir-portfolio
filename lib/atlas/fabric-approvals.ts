/**
 * W3-B — Persistent approval mechanism for the Fabric Atlas mapping ledger
 * (FC08 succession; solves fc08-report.md §7 "Builder/rebuild interplay with
 * approvals").
 *
 * THE PROBLEM: content/atlas/fabric-extension.json is GENERATED. Its 2,705
 * mapping rows all start at disposition "awaiting-review". If a human approves
 * rows by editing the generated file and the builder then reruns (corpus
 * sync), the approvals regress to "awaiting-review" — fail-closed for
 * publication (nothing leaks) but a silent UNPUBLISH. Wave 3 must make the
 * approval persistent BEFORE any human review happens.
 *
 * THE MECHANISM: approvals live in a COMMITTED sidecar,
 * content/atlas/fabric-approvals.json (schema "hansa.fabric-approvals/1").
 * The sidecar is the single human gate and the only sanctioned source of
 * "approved" rows anywhere in the pipeline:
 *
 *   human edits sidecar  ->  builder rebuild applies the sidecar to the
 *   generated ledger + records  ->  --verify-only proves the committed
 *   dataset equals ledger+sidecar state  ->  projectFabricCatalog projects
 *   only the approved rows (allowlisted fields).
 *
 * Invariants enforced here (all fail closed):
 *   1. Every sidecar approval requires reviewedBy + evidence + registryRevision
 *      (+ approvedAt, disposition exactly "approved", conceptIds as unique
 *      fabric- prefixed strings), and its articleId must exist in the route
 *      registry. Malformed sidecars never load.
 *   2. applyApprovals() is the ONLY code path that stamps disposition
 *      "approved" on a ledger row or record, and it stamps every approved row
 *      with approvalSource = "hansa.fabric-approvals/1" plus the reviewed
 *      fields from its sidecar record. Stale approvals (registryRevision
 *      differs from the current registry) are NEVER applied — they are
 *      returned as conflicts for re-review. Approvals whose articleId is not
 *      in the mapping ledger throw (never silently dropped).
 *   3. guardNoAutoApprove() is the runtime no-auto-approve guard: any row
 *      carrying disposition "approved" that is not backed by an identical
 *      sidecar record is an error. It runs inside applyApprovals (self-check),
 *      inside the builder (post-merge), and inside the build-time loader gate
 *      (enforceFabricApprovalGate), so a hand-edited dataset or a code path
 *      that tries to approve without the sidecar fails closed. At the type
 *      level the sanctioned producer is applyApprovals alone: approved rows
 *      are typed FabricApprovedLedgerRow / FabricApprovedResourceRecord with
 *      the approvalSource brand, and no exported function produces them from
 *      anything but a sidecar record.
 *   4. enforceFabricApprovalGate() (wired into getFabricExtension via one
 *      minimal reviewed edit to lib/atlas/fabric-targets.ts) additionally
 *      fails closed when: approved rows exist but the sidecar is
 *      missing/unreadable; an approved row is backed by a STALE sidecar
 *      record; or a current-revision sidecar approval is NOT reflected in the
 *      dataset (the silent-unpublish rebuild regression — caught at load).
 *
 * Purity: the only runtime import is node:fs (build-time loaders). The
 * fabric-targets dependency is TYPE-ONLY (erased at runtime), so the runtime
 * dependency edge is one-directional: fabric-targets -> this module. Every
 * function is deterministic and injectable; tests never need the real
 * 2,705-row registry.
 */

import { readFileSync } from "node:fs";

import type {
  FabricMappingLedgerRow,
  FabricRegistryArticle,
  FabricRegistryIndex,
  FabricResourceRecord,
  FabricRouteRegistry,
} from "./fabric-targets.ts";

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------

/** The committed approvals sidecar schema. */
export const FABRIC_APPROVALS_SCHEMA = "hansa.fabric-approvals/1" as const;

/** The provenance stamp every sanctioned approved row carries. */
export const FABRIC_APPROVAL_SOURCE = FABRIC_APPROVALS_SCHEMA;

/**
 * One human approval decision. The sidecar can ONLY carry approvals
 * (disposition exactly "approved"); a decision to keep something
 * awaiting-review is expressed by NOT having an entry, never by a record.
 */
export type FabricApprovalRecord = {
  /** When the review happened. ISO-8601 date or date-time string. */
  approvedAt: string;
  /** Who reviewed it (human-readable reviewer identity; never empty). */
  reviewedBy: string;
  /** Non-empty human-review evidence: what was checked and against what. */
  evidence: string;
  /** Exactly "approved" — the sidecar is the human gate, nothing else. */
  disposition: "approved";
  /** The registry revision the review was made against (staleness key). */
  registryRevision: string;
  /** The approved article→concept mapping (may be empty). fabric- prefixed. */
  conceptIds: string[];
};

/** An approvalsHistory entry: a past approval decision, with its article. */
export type FabricApprovalHistoryEntry = FabricApprovalRecord & { articleId: string };

/** The committed sidecar: approvals map + append-only history log. */
export type FabricApprovalsSidecar = {
  schema: typeof FABRIC_APPROVALS_SCHEMA;
  approvals: Record<string, FabricApprovalRecord>;
  approvalsHistory: FabricApprovalHistoryEntry[];
};

/** A sanctioned approved mapping-ledger row (produced only by applyApprovals). */
export type FabricApprovedLedgerRow = FabricMappingLedgerRow & FabricApprovalRecord & {
  readonly approvalSource: typeof FABRIC_APPROVAL_SOURCE;
};

/** A sanctioned approved resource record (produced only by applyApprovals). */
export type FabricApprovedResourceRecord = FabricResourceRecord & FabricApprovalRecord & {
  readonly approvalSource: typeof FABRIC_APPROVAL_SOURCE;
};

/** One stale approval: reviewed against a registry revision that is not current. */
export type FabricApprovalConflict = {
  articleId: string;
  approvalRegistryRevision: string;
  currentRegistryRevision: string;
};

export type ApplyApprovalsOptions = {
  /**
   * The CURRENT route registry (raw registry or a prebuilt
   * indexFabricRegistry() index). Required: articleId existence and approval
   * staleness can only be judged against it, and this module refuses to
   * apply approvals it cannot staleness-check.
   */
  registry: FabricRouteRegistry | FabricRegistryIndex;
  /**
   * Optional typed resource records to merge alongside the ledger, so the
   * ledger and the records stay disposition-agreed by construction.
   */
  records?: readonly unknown[];
};

export type ApplyApprovalsResult = {
  /** The merged ledger (approved rows stamped; everything else untouched). */
  ledger: FabricMappingLedgerRow[];
  /** The merged records (only when opts.records was supplied). */
  records: FabricResourceRecord[] | null;
  /** articleIds whose approvals were applied (sorted). */
  applied: string[];
  /** Stale approvals, NOT applied — surfaced for re-review (sorted by articleId). */
  stale: FabricApprovalConflict[];
  /** Approvals applied to the ledger but with no typed record (non-representative families). */
  withoutRecord: string[];
  /** Number of entries in the approvals map. */
  approvalsCount: number;
};

export type FabricApprovalGateOptions = {
  /** Injected, already-parsed sidecar (takes precedence over approvalsPath). */
  approvalsSidecar?: unknown;
  /** Sidecar file path; read when no sidecar is injected. */
  approvalsPath?: string;
};

// ---------------------------------------------------------------------------
// Small pure helpers
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

/** Structural equality for the stamp-field values (strings and string arrays). */
const sameStampValue = (a: unknown, b: unknown): boolean =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Fields copied from a sidecar record onto a sanctioned approved row. */
const STAMP_FIELDS = ["approvedAt", "reviewedBy", "evidence", "registryRevision", "conceptIds"] as const;

/** ISO-8601 date or date-time (deterministic subset; no engine-specific parsing). */
const ISO_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}([Tt]\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?([Zz]|[+-]\d{2}:?\d{2})?)?$/;

// ---------------------------------------------------------------------------
// Registry indexing (local, minimal, kept in agreement with
// indexFabricRegistry in fabric-targets.ts — proven by a sync test)
// ---------------------------------------------------------------------------

/**
 * A minimal article index over the route registry, sufficient for approval
 * decisions (articleId existence + current revision). Accepts a raw registry
 * or a prebuilt FabricRegistryIndex (detected by its Maps) so callers can
 * pass either without importing fabric-targets at runtime from here.
 */
export type FabricApprovalRegistryIndex = {
  registry: FabricRouteRegistry;
  byArticleId: Map<string, FabricRegistryArticle>;
};

export function toApprovalRegistryIndex(
  registry: FabricRouteRegistry | FabricRegistryIndex | unknown,
): FabricApprovalRegistryIndex {
  if (isPlainObject(registry) && registry.byArticleId instanceof Map) {
    const index = registry as unknown as FabricRegistryIndex;
    if (!isPlainObject(index.registry)) throw new Error("fabric-approvals: registry index without a registry object");
    return { registry: index.registry, byArticleId: index.byArticleId };
  }
  if (!isPlainObject(registry)) throw new Error("fabric-approvals: registry is not an object");
  if (!Array.isArray(registry.families)) throw new Error("fabric-approvals: registry families missing");
  const byArticleId = new Map<string, FabricRegistryArticle>();
  for (const family of registry.families) {
    if (!isPlainObject(family) || !Array.isArray(family.articles)) {
      throw new Error("fabric-approvals: registry family malformed");
    }
    for (const article of family.articles) {
      if (!isPlainObject(article) || typeof article.articleId !== "string" || !article.articleId) {
        throw new Error("fabric-approvals: registry article without articleId");
      }
      if (byArticleId.has(article.articleId)) {
        throw new Error(`fabric-approvals: duplicate registry articleId ${article.articleId}`);
      }
      byArticleId.set(article.articleId, article as unknown as FabricRegistryArticle);
    }
  }
  return { registry: registry as unknown as FabricRouteRegistry, byArticleId };
}

// ---------------------------------------------------------------------------
// Validation — fail-closed, aggregated error lists
// ---------------------------------------------------------------------------

function validateApprovalRecord(entry: unknown, label: string): string[] {
  const errors: string[] = [];
  if (!isPlainObject(entry)) return [`${label}: not an object`];
  if (typeof entry.approvedAt !== "string" || entry.approvedAt === "" || !ISO_DATE_PATTERN.test(entry.approvedAt) || !Number.isFinite(Date.parse(entry.approvedAt))) {
    errors.push(`${label}: approvedAt must be an ISO-8601 date or date-time string`);
  }
  if (typeof entry.reviewedBy !== "string" || entry.reviewedBy.trim() === "") {
    errors.push(`${label}: reviewedBy is required (non-empty string)`);
  }
  if (typeof entry.evidence !== "string" || entry.evidence.trim() === "") {
    errors.push(`${label}: evidence is required (non-empty string describing the human review)`);
  }
  if (entry.disposition !== "approved") {
    errors.push(`${label}: disposition must be exactly "approved" (the sidecar only records approvals; anything not in the sidecar stays awaiting-review)`);
  }
  if (typeof entry.registryRevision !== "string" || entry.registryRevision === "") {
    errors.push(`${label}: registryRevision is required (the registry the review was made against)`);
  }
  const conceptIds = uniqueStrings(entry.conceptIds);
  if (!conceptIds) {
    errors.push(`${label}: conceptIds must be an array of unique strings`);
  } else {
    for (const id of conceptIds) {
      if (!id.startsWith("fabric-")) {
        errors.push(`${label}: conceptId ${JSON.stringify(id)} is not fabric-originated (missing "fabric-" prefix)`);
      }
    }
  }
  return errors;
}

/**
 * Validate a parsed sidecar (or any unknown value) against the schema.
 * When `registry` is given, every approval's articleId must exist in the
 * registry. Returns an error list; empty means valid. History entries are
 * validated with the same strictness as approvals (they are past approvals).
 */
export function validateFabricApprovals(
  value: unknown,
  registry?: FabricRouteRegistry | FabricRegistryIndex | unknown,
): string[] {
  const errors: string[] = [];
  if (!isPlainObject(value)) return ["fabric-approvals: sidecar is not an object"];
  if (value.schema !== FABRIC_APPROVALS_SCHEMA) {
    errors.push(`fabric-approvals: unexpected schema ${JSON.stringify(value.schema ?? null)}, expected ${FABRIC_APPROVALS_SCHEMA}`);
  }
  const approvals = value.approvals;
  if (!isPlainObject(approvals)) {
    errors.push("fabric-approvals: approvals must be an object mapping articleId -> approval record");
  } else {
    for (const [articleId, entry] of Object.entries(approvals)) {
      if (articleId === "") errors.push("fabric-approvals: approvals has an empty articleId key");
      for (const error of validateApprovalRecord(entry, `fabric-approvals: approval ${articleId}`)) {
        errors.push(error);
      }
    }
  }
  const history = value.approvalsHistory;
  if (!Array.isArray(history)) {
    errors.push("fabric-approvals: approvalsHistory must be an array (possibly empty)");
  } else {
    for (const [index, entry] of history.entries()) {
      const label = `fabric-approvals: approvalsHistory[${index}]`;
      if (!isPlainObject(entry) || typeof entry.articleId !== "string" || entry.articleId === "") {
        errors.push(`${label}: must be an approval record with a non-empty articleId`);
        continue;
      }
      for (const error of validateApprovalRecord(entry, `${label} (${entry.articleId})`)) {
        errors.push(error);
      }
    }
  }
  if (registry !== undefined && isPlainObject(approvals)) {
    let index: FabricApprovalRegistryIndex;
    try {
      index = toApprovalRegistryIndex(registry);
    } catch (error) {
      return [...errors, `fabric-approvals: ${(error as Error).message}`];
    }
    for (const articleId of Object.keys(approvals)) {
      if (!index.byArticleId.has(articleId)) {
        errors.push(`fabric-approvals: approval ${articleId} does not exist in the route registry`);
      }
    }
    for (const [historyIndex, entry] of (Array.isArray(history) ? history : []).entries()) {
      if (isPlainObject(entry) && typeof entry.articleId === "string" && entry.articleId !== "" && !index.byArticleId.has(entry.articleId)) {
        errors.push(`fabric-approvals: approvalsHistory[${historyIndex}] article ${entry.articleId} does not exist in the route registry`);
      }
    }
  }
  return errors;
}

/**
 * Parse + validate an unknown value into a typed sidecar. Throws with every
 * validation problem listed (fail closed, complete diagnostics).
 */
export function parseFabricApprovals(
  value: unknown,
  registry?: FabricRouteRegistry | FabricRegistryIndex | unknown,
): FabricApprovalsSidecar {
  const errors = validateFabricApprovals(value, registry);
  if (errors.length > 0) {
    throw new Error(`fabric-approvals: sidecar failed validation (fail closed):\n- ${errors.join("\n- ")}`);
  }
  return value as FabricApprovalsSidecar;
}

/** Build-time loader: read + parse + validate the sidecar file. Never partial. */
export function loadFabricApprovals(
  path: string,
  registry?: FabricRouteRegistry | FabricRegistryIndex | unknown,
): FabricApprovalsSidecar {
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch (error) {
    throw new Error(`fabric-approvals: approvals sidecar is missing or unreadable at ${path} (fail closed)`, { cause: error });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`fabric-approvals: approvals sidecar at ${path} is not valid JSON (fail closed)`, { cause: error });
  }
  return parseFabricApprovals(parsed, registry);
}

/** A fresh empty sidecar (0 approvals, empty history). */
export function emptyFabricApprovals(): FabricApprovalsSidecar {
  return { schema: FABRIC_APPROVALS_SCHEMA, approvals: {}, approvalsHistory: [] };
}

/** Stable serialization: 2-space JSON plus a trailing newline. */
export function serializeFabricApprovals(sidecar: FabricApprovalsSidecar): string {
  return JSON.stringify(sidecar, null, 2) + "\n";
}

/**
 * Normalize the approvals input: accepts the full sidecar (schema-checked)
 * or a bare Record<articleId, FabricApprovalRecord>. Shape-validates every
 * entry and throws on any problem. The approvalsHistory is not returned —
 * only the live decisions drive application.
 */
function normalizeApprovalsInput(approvals: unknown): Record<string, FabricApprovalRecord> {
  if (!isPlainObject(approvals)) {
    throw new Error("fabric-approvals: approvals input is not an object");
  }
  if (Object.hasOwn(approvals, "schema") || Object.hasOwn(approvals, "approvalsHistory")) {
    // Sidecar form: validate the whole sidecar (history included), then use
    // its approvals map.
    const sidecar = parseFabricApprovals(approvals);
    return sidecar.approvals;
  }
  // Bare map form: validate each entry shape.
  const errors: string[] = [];
  for (const [articleId, entry] of Object.entries(approvals)) {
    for (const error of validateApprovalRecord(entry, `fabric-approvals: approval ${articleId}`)) {
      errors.push(error);
    }
  }
  if (errors.length > 0) {
    throw new Error(`fabric-approvals: approvals input failed validation (fail closed):\n- ${errors.join("\n- ")}`);
  }
  return approvals as Record<string, FabricApprovalRecord>;
}

// ---------------------------------------------------------------------------
// Stale-approval detection
// ---------------------------------------------------------------------------

/**
 * Approvals whose registryRevision differs from the CURRENT registry
 * revision. A stale approval is a real decision that must not silently
 * apply: it is surfaced here and the re-review rule is — update the sidecar
 * entry (fresh registryRevision + fresh evidence, moving the old entry into
 * approvalsHistory) and rebuild. Sorted by articleId for stable reporting.
 */
export function detectConflicts(
  approvals: FabricApprovalsSidecar | Record<string, FabricApprovalRecord> | unknown,
  currentRegistry: FabricRouteRegistry | FabricRegistryIndex | unknown,
): FabricApprovalConflict[] {
  const map = normalizeApprovalsInput(approvals);
  const index = toApprovalRegistryIndex(currentRegistry);
  const current = index.registry.registryRevision;
  return Object.keys(map)
    .filter((articleId) => map[articleId].registryRevision !== current)
    .sort()
    .map((articleId) => ({
      articleId,
      approvalRegistryRevision: map[articleId].registryRevision,
      currentRegistryRevision: current,
    }));
}

// ---------------------------------------------------------------------------
// Stamping — the ONLY sanctioned path to disposition "approved"
// ---------------------------------------------------------------------------

function stampLedgerRow(
  row: Record<string, unknown>,
  entry: FabricApprovalRecord,
): FabricApprovedLedgerRow {
  return {
    articleId: row.articleId as string,
    logicalPath: row.logicalPath as string,
    disposition: "approved",
    candidateConceptHints: row.candidateConceptHints as string[],
    sourceSha256: row.sourceSha256 as string,
    approvedAt: entry.approvedAt,
    reviewedBy: entry.reviewedBy,
    evidence: entry.evidence,
    registryRevision: entry.registryRevision,
    conceptIds: entry.conceptIds,
    approvalSource: FABRIC_APPROVAL_SOURCE,
  } as FabricApprovedLedgerRow;
}

function stampResourceRecord(
  record: Record<string, unknown>,
  entry: FabricApprovalRecord,
): FabricApprovedResourceRecord {
  return {
    id: record.id as string,
    articleId: record.articleId as string,
    title: record.title as string,
    kind: record.kind as string,
    target: record.target,
    logicalPath: record.logicalPath as string,
    // The approved mapping is the reviewed concept set; the record may never
    // map outside what it declares, so both fields carry the approval's set.
    // (A non-empty set additionally requires the fabric- concepts to be
    // published in extension.concepts — the dataset validator enforces that,
    // so approving with concepts before concept publication fails the build
    // loudly instead of publishing a dangling reference.)
    conceptIds: entry.conceptIds,
    declaredConceptIds: entry.conceptIds,
    mappingDisposition: "approved",
    sourceSha256: record.sourceSha256 as string,
    approvedAt: entry.approvedAt,
    reviewedBy: entry.reviewedBy,
    evidence: entry.evidence,
    registryRevision: entry.registryRevision,
    approvalSource: FABRIC_APPROVAL_SOURCE,
  } as FabricApprovedResourceRecord;
}

// ---------------------------------------------------------------------------
// applyApprovals — merge the sidecar into the generated ledger (+ records)
// ---------------------------------------------------------------------------

/**
 * Merge the approvals sidecar into a freshly generated mapping ledger
 * (and, when given, the typed resource records), producing the REBUILD-
 * PRESERVING merged state:
 *
 *   - an approval whose registryRevision equals the current registry
 *     revision is applied: the row/record carries disposition "approved"
 *     plus the reviewed fields (approvedAt, reviewedBy, evidence,
 *     registryRevision, conceptIds) and the approvalSource provenance stamp;
 *   - a STALE approval (registryRevision differs) is NEVER applied — its row
 *     stays "awaiting-review" and the conflict is returned in `.stale` for
 *     the re-review workflow (never silently applied, never silently dropped);
 *   - an approval whose articleId is not in the ledger throws (the ledger is
 *     exactly the registry's published set, so an unknown or unpublished
 *     article means the sidecar is out of sync — loud failure, human cleanup);
 *   - rows/records without an approval pass through untouched.
 *
 * Deterministic: rows keep their input order, result lists are sorted, no
 * clock. The result is self-guarded: guardNoAutoApprove runs on the merged
 * output before it is returned, so this function can never emit an approved
 * row that is not backed by the sidecar record it was stamped from.
 */
export function applyApprovals(
  ledger: readonly FabricMappingLedgerRow[] | readonly unknown[],
  approvals: FabricApprovalsSidecar | Record<string, FabricApprovalRecord> | unknown,
  opts: ApplyApprovalsOptions,
): ApplyApprovalsResult {
  if (!Array.isArray(ledger)) throw new Error("fabric-approvals: applyApprovals ledger input must be an array");
  const map = normalizeApprovalsInput(approvals);
  const index = toApprovalRegistryIndex(opts.registry);
  const approvalsCount = Object.keys(map).length;

  // Every approval must target a ledger row (a published registry article).
  const ledgerArticleIds = new Set<string>();
  const validatedRows: Array<[string, Record<string, unknown>]> = [];
  for (const row of ledger) {
    if (!isPlainObject(row) || typeof row.articleId !== "string" || row.articleId === "") {
      throw new Error("fabric-approvals: ledger contains a row without an articleId (fail closed)");
    }
    const { articleId } = row;
    ledgerArticleIds.add(articleId);
    validatedRows.push([articleId, row]);
  }
  const unknownArticleIds = Object.keys(map).filter((articleId) => !ledgerArticleIds.has(articleId)).sort();
  if (unknownArticleIds.length > 0) {
    throw new Error(
      "fabric-approvals: approval(s) target article(s) missing from the mapping ledger — the sidecar is out of sync with the registry (unpublished, removed, or misspelled articleId); fix the sidecar (fail closed):\n- "
        + unknownArticleIds.join("\n- "),
    );
  }

  const staleList = detectConflicts(map, index);
  const staleById = new Map(staleList.map((conflict) => [conflict.articleId, conflict] as const));

  const mergedLedger: FabricMappingLedgerRow[] = [];
  const applied: string[] = [];
  for (const [articleId, row] of validatedRows) {
    const entry = map[articleId];
    if (entry && !staleById.has(articleId)) {
      mergedLedger.push(stampLedgerRow(row, entry));
      applied.push(articleId);
    } else {
      mergedLedger.push(row as FabricMappingLedgerRow);
    }
  }
  applied.sort();

  let mergedRecords: FabricResourceRecord[] | null = null;
  let withoutRecord: string[] = [];
  if (opts.records !== undefined) {
    if (!Array.isArray(opts.records)) throw new Error("fabric-approvals: applyApprovals records input must be an array");
    mergedRecords = [];
    const recordArticleIds = new Set<string>();
    for (const record of opts.records) {
      if (!isPlainObject(record) || typeof record.articleId !== "string" || record.articleId === "") {
        throw new Error("fabric-approvals: records contain an entry without an articleId (fail closed)");
      }
      recordArticleIds.add(record.articleId);
      const entry = map[record.articleId];
      if (entry && !staleById.has(record.articleId)) {
        mergedRecords.push(stampResourceRecord(record, entry));
      } else {
        mergedRecords.push(record as FabricResourceRecord);
      }
    }
    withoutRecord = applied.filter((articleId) => !recordArticleIds.has(articleId));
  }

  const result: ApplyApprovalsResult = {
    ledger: mergedLedger,
    records: mergedRecords,
    applied,
    stale: staleList,
    withoutRecord,
    approvalsCount,
  };

  // Self-check: the merged output may never contain an approved row that is
  // not backed by an identical sidecar record (no-auto-approve guard).
  guardNoAutoApprove(mergedLedger, map);
  if (mergedRecords) guardNoAutoApprove(mergedRecords, map, { dispositionField: "mappingDisposition" });
  return result;
}

// ---------------------------------------------------------------------------
// The no-auto-approve guard
// ---------------------------------------------------------------------------

/**
 * NO-AUTO-APPROVE GUARD. Any row carrying disposition "approved" must be
 * backed by an IDENTICAL sidecar record and carry the approvalSource
 * provenance stamp; anything else is a hard error. This is the runtime
 * enforcement of "the human gate is the ONLY path to approved": a code path
 * (or hand edit) that sets approved without a sidecar record fails here.
 *
 * Runs inside applyApprovals (self-check), in the builder after the merge,
 * and in the loader gate. `dispositionField` selects "disposition" (ledger
 * rows, default) or "mappingDisposition" (resource records).
 */
export function guardNoAutoApprove(
  rows: readonly unknown[],
  approvals: FabricApprovalsSidecar | Record<string, FabricApprovalRecord> | unknown,
  opts: { dispositionField?: "disposition" | "mappingDisposition" } = {},
): void {
  const field = opts.dispositionField ?? "disposition";
  const map = normalizeApprovalsInput(approvals);
  const violations: string[] = [];
  for (const row of rows) {
    if (!isPlainObject(row)) continue;
    if (row[field] !== "approved") continue;
    const articleId = typeof row.articleId === "string" && row.articleId !== "" ? row.articleId : "";
    if (articleId === "") {
      violations.push("approved row without an articleId (no-auto-approve guard)");
      continue;
    }
    const entry = map[articleId];
    if (!entry) {
      violations.push(`${articleId}: disposition "approved" without a backing approvals-sidecar record — the human gate is the only path to approved (no-auto-approve guard)`);
      continue;
    }
    if (row.approvalSource !== FABRIC_APPROVAL_SOURCE) {
      violations.push(`${articleId}: approved row is missing the approvalSource stamp ${FABRIC_APPROVAL_SOURCE} (no-auto-approve guard)`);
    }
    for (const stampField of STAMP_FIELDS) {
      if (!sameStampValue(row[stampField], entry[stampField])) {
        violations.push(`${articleId}: approved row field ${stampField} does not match the sidecar record (no-auto-approve guard)`);
      }
    }
  }
  if (violations.length > 0) {
    throw new Error(`guardNoAutoApprove: unbacked approved row(s) detected (fail closed):\n- ${violations.join("\n- ")}`);
  }
}

// ---------------------------------------------------------------------------
// Loader gate — wired into getFabricExtension (one minimal reviewed edit)
// ---------------------------------------------------------------------------

/**
 * The approval gate for the build-time loader. Called by
 * getFabricExtension() AFTER validateFabricExtension() succeeded. Fail-closed
 * rules (in order):
 *
 *   1. If the dataset carries ANY approved ledger row or record, the
 *      approvals sidecar MUST be resolvable (injected or readable at
 *      approvalsPath); otherwise throw.
 *   2. If a sidecar is resolvable, it must parse and validate (with the
 *      registry: every articleId must exist) — even when the dataset has no
 *      approved rows, so a corrupted committed sidecar is caught at load.
 *   3. Over-approval: guardNoAutoApprove over the ledger and the records —
 *      any approved row without an identical backing sidecar record throws.
 *   4. Stale backing: an approved row backed by a sidecar record whose
 *      registryRevision differs from the current registry throws (a stale
 *      approval must never publish; re-review required).
 *   5. Under-approval (the silent-unpublish rebuild regression): a
 *      current-revision sidecar approval whose articleId is NOT an approved
 *      ledger row throws — the dataset is stale, rebuild required.
 *
 * With an absent sidecar file and zero approved rows the gate is a no-op, so
 * pre-approval fixture datasets load exactly as before this mechanism.
 */
export function enforceFabricApprovalGate(
  extension: unknown,
  registry: FabricRouteRegistry | FabricRegistryIndex | unknown,
  opts: FabricApprovalGateOptions = {},
): void {
  if (!isPlainObject(extension)) return; // the extension validator reports shape problems
  const ledger = Array.isArray(extension.ledger) ? (extension.ledger as unknown[]) : null;
  const records = Array.isArray(extension.resourceRecords) ? (extension.resourceRecords as unknown[]) : null;
  if (ledger === null || records === null) return;

  const approvedLedger = ledger.filter((row) => isPlainObject(row) && row.disposition === "approved");
  const approvedRecords = records.filter((record) => isPlainObject(record) && record.mappingDisposition === "approved");
  const hasApproved = approvedLedger.length > 0 || approvedRecords.length > 0;

  // Resolve the sidecar.
  let raw = opts.approvalsSidecar;
  let source = "injected sidecar";
  if (raw === undefined) {
    if (opts.approvalsPath === undefined) {
      if (hasApproved) {
        throw new Error("fabric-approvals: the dataset carries approved rows but no approvals sidecar was provided (fail closed)");
      }
      return;
    }
    try {
      raw = readFileSync(opts.approvalsPath, "utf8");
      source = opts.approvalsPath;
    } catch {
      raw = null;
    }
  }
  if (raw === null || raw === undefined) {
    if (hasApproved) {
      throw new Error(`fabric-approvals: the dataset carries ${approvedLedger.length} approved ledger row(s) and ${approvedRecords.length} approved record(s) but the approvals sidecar is missing or unreadable at ${opts.approvalsPath} (fail closed)`);
    }
    return;
  }
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch (error) {
      throw new Error(`fabric-approvals: approvals sidecar at ${source} is not valid JSON (fail closed)`, { cause: error });
    }
  }

  const sidecar = parseFabricApprovals(raw, registry);
  const map = sidecar.approvals;
  const index = toApprovalRegistryIndex(registry);
  const current = index.registry.registryRevision;

  // (3) Over-approval.
  guardNoAutoApprove(ledger, map);
  guardNoAutoApprove(records, map, { dispositionField: "mappingDisposition" });

  const errors: string[] = [];
  // (4) Stale backing.
  const staleBackedSeen = new Set<string>();
  for (const row of approvedLedger as Record<string, unknown>[]) {
    const entry = map[row.articleId as string];
    if (!entry || staleBackedSeen.has(row.articleId as string)) continue;
    if (entry.registryRevision !== current) {
      staleBackedSeen.add(row.articleId as string);
      errors.push(`${row.articleId}: approved row is backed by a STALE sidecar record (approved against ${entry.registryRevision}, loaded registry is ${current}) — re-review required before it may publish`);
    }
  }
  // (5) Under-approval: current-revision sidecar approvals must be reflected.
  const approvedLedgerIds = new Set(
    (approvedLedger as Record<string, unknown>[]).map((row) => row.articleId as string),
  );
  for (const [articleId, entry] of Object.entries(map)) {
    if (entry.registryRevision === current && !approvedLedgerIds.has(articleId)) {
      errors.push(`${articleId}: the approvals sidecar carries a current-revision approval that the dataset does not reflect (ledger row is not approved) — the dataset is stale relative to the sidecar; rebuild with build-fabric-extension.mjs (fail closed)`);
    }
  }
  if (errors.length > 0) {
    throw new Error(`fabric-approvals: approval gate failed for the fabric extension dataset (fail closed):\n- ${errors.join("\n- ")}`);
  }
}
