// Canonical types for the imported Microsoft Fabric / DP-600 practice bank.
//
// Raw content is generated verbatim from the supplied package by
// `scripts/import-fabric-bank.mjs`; nothing here rewrites an author's words.
// Derived state (classification, coverage, mastery) is computed separately and
// never merged back into the raw records.

export type FabricQuestionType = "single" | "multi" | "sequence";

/**
 * How the DP-600 objective label was obtained. Kept in the type so the coverage
 * report can distinguish "the source said so" from "a topic rule inferred it".
 */
export type ObjectiveBasis = "declared" | "derived" | "domain-only" | "none";

/** Official DP-600 domain / sub-objective ids. `null` = not confidently mapped. */
export type ObjectiveId =
  | "1.1"
  | "1.2"
  | "2.1"
  | "2.2"
  | "2.3"
  | "3.1"
  | "3.2";

/** Browsable Fabric technology area. Independent of the source video. */
export type SubjectId =
  | "onelake"
  | "lakehouse"
  | "optimization"
  | "warehouse"
  | "sql-endpoint"
  | "pipelines"
  | "ingestion"
  | "eventhouse"
  | "modeling"
  | "semantic-models"
  | "security"
  | "governance"
  | "lifecycle"
  | "monitoring";

/**
 * How far a question can be trusted as DP-600 revision material.
 * - `core`     — the source declares a DP-600 objective with no adjacent qualifier
 * - `support`  — DP-600 supporting/enrichment, or topic-derived without a declared objective
 * - `adjacent` — the source declares DP-700 as primary/core
 * - `review`   — no defensible mapping
 */
export type Scope = "core" | "support" | "adjacent" | "review";
export type Confidence = "high" | "medium" | "low";

export interface FabricOption {
  id: string;
  text: string;
  why: string;
}

export interface FabricQuestion {
  /** Namespaced internal id, e.g. `fb-v6-sec-001`. Never the source id. */
  id: string;
  /** Original id from the package, e.g. `V6-SEC-001`. */
  sourceId: string;
  pack: string;
  topic: string;
  title: string;
  prompt: string;
  type: FabricQuestionType;
  options: FabricOption[];
  /** Option ids in required order. For `sequence` this array *is* the order. */
  correct: string[];
  explanation: string;
  /** Offset into the source video, in seconds. `null` when no video anchor exists. */
  videoSeconds: number | null;
  refs: string[];
  code: string;
  origin: string;
  difficulty: number | null;
  caseStudyId: string | null;
  /** `importMetadata.exam_objective`, verbatim. `null` when the source had none. */
  sourceObjective: string | null;
  provenance: string | null;
  validation: string | null;
  sourceVideoUrl: string | null;
}

export interface FabricIndexEntry {
  id: string;
  sourceId: string;
  pack: string;
  topic: string;
  title: string;
  prompt: string;
  type: FabricQuestionType;
  difficulty: number | null;
  optionCount: number;
  answerCount: number;
  caseStudyId: string | null;
  refs: string[];
  hasCode: boolean;
  videoSeconds: number | null;
  subject: SubjectId;
  subjects: SubjectId[];
  /** Official domain (`"1"`–`"3"`); independent of whether a sub-objective resolved. */
  domain: "1" | "2" | "3" | null;
  objectiveId: ObjectiveId | null;
  /** Provenance of the label: source-declared, topic-derived, domain-only or none. */
  objectiveBasis: ObjectiveBasis;
  scope: Scope;
  confidence: Confidence;
  /** Lowercased haystack for the explorer search box. */
  search: string;
}

export interface FabricCaseStudy {
  id: string;
  title: string;
  text: string;
  questionIds: string[];
}

export interface FabricSourceRef {
  id: string;
  title: string;
  url: string;
}

export interface FabricPackVideo {
  id: string;
  title: string;
  creator: string;
  duration: string;
  published: string;
}

export interface FabricPack {
  key: string;
  label: string;
  title: string;
  description: string;
  video: FabricPackVideo | null;
  questionCount: number;
  chapterCount: number;
  /** Dominant subjects across the pack, most common first. */
  subjects: SubjectId[];
}

/** A study-note chapter from the pack catalog's `map`, not a transcript. */
export interface FabricChapter {
  id: string;
  title: string;
  startSeconds: number;
  end: string;
  questionIds: string[];
  points: string[];
  refs: string[];
  caveat: string | null;
  videoSeconds: number | null;
}

export interface FabricPackNotes {
  pack: string;
  chapters: FabricChapter[];
}

export interface CoverageBucket {
  key: string;
  label: string;
  total: number;
  core: number;
  support: number;
  adjacent: number;
  review: number;
}

export interface FabricCoverage {
  byObjective: CoverageBucket[];
  bySubject: CoverageBucket[];
  byScope: { scope: Scope; total: number }[];
  byType: { type: FabricQuestionType; total: number }[];
  byPack: { pack: string; label: string; total: number; core: number }[];
  byDifficulty: { difficulty: number | null; total: number }[];
  /** How many questions rest on a declared, derived, domain-only or absent mapping. */
  byBasis: { basis: ObjectiveBasis; total: number; core: number }[];
  /**
   * Share of `core` questions per official domain, against the published weight
   * band. `coreQuestions` is the sum of that domain's sub-objective buckets plus
   * its domain-only bucket, so it always reconciles with `byObjective`.
   */
  domainShares: {
    domain: string;
    label: string;
    officialWeight: string;
    coreQuestions: number;
    coreShare: number;
    /** Focused questions with a named sub-objective in this domain. */
    coreSubObjective: number;
    /** Focused questions kept at domain level because no in-domain sub-objective applied. */
    coreDomainOnly: number;
  }[];
  totals: {
    questions: number;
    core: number;
    support: number;
    adjacent: number;
    review: number;
    packs: number;
    objectivesCovered: number;
    objectivesMissing: number;
    fiveOption: number;
    withCaseStudy: number;
    withCode: number;
    multiSelect: number;
    singleSelect: number;
    sequence: number;
    sources: number;
  };
}

export interface FabricIntegrityFailure {
  code: string;
  questionId: string;
  detail: string;
}

export interface FabricMeta {
  generatedAt: string;
  packageName: string;
  packageHash: string | null;
  sourceFiles: Record<string, string>;
  counts: FabricCoverage["totals"];
  coverage: FabricCoverage;
  /** Number of distinct case studies; kept here so the hub need not load them. */
  caseCount: number;
  /** Exact `importMetadata.validation` wording, counted. */
  validationNotes: { label: string; count: number }[];
  provenanceNotes: { label: string; count: number }[];
  origins: { label: string; count: number }[];
  videos: (FabricPackVideo & { pack: string })[];
  packageQa: {
    status: string;
    runtimeChecksPassed: number;
    exactDuplicatePromptGroups: number;
    similarityCandidates: number;
    adaptations: { id: string; change: string }[];
    declaredCounts: {
      websiteQuestions: number;
      addedQuestions: number;
      totalQuestions: number;
      packs: number;
      fiveOptionQuestions: number;
    };
  };
  integrity: {
    checksRun: number;
    failures: FabricIntegrityFailure[];
    warnings: FabricIntegrityFailure[];
  };
}
