// The closing scene's argument, stated as data.
//
// R5 restores the prototype's close: one idea taken from the edition the reader
// selected, one honest action that reopens it, the coverage ledger, and the
// limits of what the stage has actually read. This module keeps those pieces
// pure so the renderer stays a renderer and the tests can hold the claims still.
//
// The closing scene never invents a claim. The idea is the edition's reviewed
// `takeaway` verbatim; the ledger's stage rows come from `StageModel`; the corpus
// rows are the pinned 1 Nov 2026 semantic ledger (109 of 4,337 eligible units).
// Zero published stays zero: a candidate count is not a publication state.

import type { Insight } from "./insights.ts";
import type { StageModel } from "./stage-model.ts";
import { dayKey, dayLabel } from "./stage-model.ts";

/**
 * The corpus coverage this closing scene is allowed to report.
 *
 * Every value is pinned from `intelligent-atlas/analysis/semantic-ledger-summary.json`
 * (generated 2026-11-01). `tests/knowledge/closing.test.mjs` re-reads that file and
 * fails if any value drifts, so the scene cannot quietly keep an old number.
 */
export const CORPUS_COVERAGE = {
  generatedAt: "2026-11-01",
  units: 6201,
  eligible: 4337,
  metadataOnly: 1859,
  nonLearning: 5,
  uniqueResources: 4925,
  read: 109,
  notRead: 4228,
  readShareOfEligible: 0.0251,
  published: 0,
  withheld: 6201,
  decisions: {
    accepted: 10,
    revised: 64,
    held: 24,
    unresolvedGap: 11,
    unreviewed: 4228,
    outOfScope: 1864,
  },
  fingerprint: "20809d682d986e1b678e15896d52e2c25fdc68e60dae283f3a80ffa49112740d",
  source: "intelligent-atlas/analysis/semantic-ledger-summary.json",
} as const;

export type CorpusCoverage = typeof CORPUS_COVERAGE;

export const COVERAGE_LIMITS = [
  "Agent technical review is not human publication, scientific or rights review.",
  "Candidate matching remains lexical; false positives are documented rather than silently repaired.",
  "Media, figures and rendered pages were not visually reviewed.",
  "Extraction defects found during review are recorded as unresolved gaps, not repaired by inference.",
] as const;

export type ClosingIdea = {
  /** The edition's reviewed takeaway, verbatim. */
  quote: string;
  cardTitle: string;
  topic: string;
  day: string;
  caveat: string;
  sourceId: string;
  checkedAt: string;
};

/** One idea, taken from the selected edition — never written by this module. */
export function closingIdea(insight: Insight | null): ClosingIdea | null {
  if (!insight) return null;
  return {
    quote: insight.takeaway,
    cardTitle: insight.cardTitle,
    topic: insight.topic,
    day: dayLabel(insight.date),
    caveat: insight.caveat,
    sourceId: insight.sourceId,
    checkedAt: insight.checkedAt,
  };
}

/** `26 Oct` — the action names the edition by its day, not by an id. */
export function editionDayShort(iso: string) {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export type ClosingAction = {
  editionId: string | null;
  label: string;
};

/**
 * The one action: reopen the selected edition, or the latest one when nothing is
 * selected. With no edition at all it stays a timeline invitation, never a dead
 * control.
 */
export function closingAction(
  insight: Insight | null,
  model: StageModel,
): ClosingAction {
  const edition = insight ?? model.timeline.editions[0] ?? null;
  if (!edition) return { editionId: null, label: "Browse the timeline" };
  return {
    editionId: edition.id,
    label: `Reopen the ${editionDayShort(edition.date)} edition`,
  };
}

export type LedgerRow = {
  id: string;
  label: string;
  value: string;
  /** A short qualifier; never a second claim. */
  note?: string;
};

/**
 * What this stage itself can say: how many editions it may show, what is
 * published, and how much of the candidate corpus was read. Stage rows come from
 * the model so a review build and a public build cannot report the same counts.
 */
export function coverageLedger(
  model: StageModel,
  coverage: CorpusCoverage = CORPUS_COVERAGE,
): LedgerRow[] {
  const editions = model.timeline.editions;
  const publishedEditions = editions.filter(
    (edition) => edition.reviewStatus === "published",
  ).length;
  return [
    {
      id: "editions",
      label: "Editions on this clock",
      value: String(editions.length),
    },
    {
      id: "published-editions",
      label: "Published editions",
      value: String(publishedEditions),
    },
    {
      id: "published-concepts",
      label: "Published concepts",
      value: String(model.graph.publishedConcepts),
    },
    {
      id: "published-connections",
      label: "Published connections",
      value: String(model.graph.publishedEdges),
    },
    {
      id: "units-read",
      label: "Candidate units read in context",
      value: `${coverage.read.toLocaleString("en-GB")} / ${coverage.eligible.toLocaleString("en-GB")}`,
      note: `${(coverage.readShareOfEligible * 100).toFixed(2)}%`,
    },
    {
      id: "units-unreviewed",
      label: "Units still unreviewed",
      value: coverage.notRead.toLocaleString("en-GB"),
    },
    {
      id: "unique-resources",
      label: "Unique canonical resources",
      value: coverage.uniqueResources.toLocaleString("en-GB"),
    },
  ];
}

/** The sentence under the ledger; the denominators are the point. */
export function coverageNote(coverage: CorpusCoverage = CORPUS_COVERAGE) {
  return `${coverage.read.toLocaleString("en-GB")} of ${coverage.eligible.toLocaleString("en-GB")} eligible units were read in context (${(coverage.readShareOfEligible * 100).toFixed(2)}%). ${coverage.notRead.toLocaleString("en-GB")} remain unreviewed. Denominators are not interchangeable: a unit is not a resource, and a revision overlay is not a new question.`;
}

export function coverageDenominators(coverage: CorpusCoverage = CORPUS_COVERAGE) {
  return [
    { label: "Units", value: coverage.units.toLocaleString("en-GB") },
    { label: "Eligible for semantic reading", value: coverage.eligible.toLocaleString("en-GB") },
    { label: "Metadata only", value: coverage.metadataOnly.toLocaleString("en-GB") },
    { label: "Non-learning", value: coverage.nonLearning.toLocaleString("en-GB") },
    { label: "Unique canonical resources", value: coverage.uniqueResources.toLocaleString("en-GB") },
  ];
}

export function coverageDecisions(coverage: CorpusCoverage = CORPUS_COVERAGE) {
  const decisions = coverage.decisions;
  const fmt = (value: number) => value.toLocaleString("en-GB");
  return [
    { label: "Accepted", value: fmt(decisions.accepted) },
    { label: "Revised", value: fmt(decisions.revised) },
    { label: "Held", value: fmt(decisions.held) },
    { label: "Unresolved gaps", value: fmt(decisions.unresolvedGap) },
    { label: "Unreviewed", value: fmt(decisions.unreviewed) },
    { label: "Out of scope", value: fmt(decisions.outOfScope) },
  ];
}

/** Why the stage cannot call the selected edition published. */
export function closingNotice(model: StageModel) {
  return model.review.status === "published"
    ? "These editions are published, with their sources. Publication is a human decision, not a side effect of review."
    : "Nothing on this stage is published. Technical review is not publication approval, and the ledger below is the honest count.";
}

/** A day key is the only date identity the closing scene repeats. */
export function closingDay(value: string | Date) {
  return dayLabel(dayKey(value));
}

/** The four statements the review close is allowed to make about itself. */
export function closingClaims(coverage: CorpusCoverage = CORPUS_COVERAGE) {
  return [
    "No concept, connection or edition on this stage is published.",
    `Semantic reading covers ${(coverage.readShareOfEligible * 100).toFixed(2)}% of eligible units, not the whole corpus.`,
    "Media, figures and rendered pages were not visually reviewed.",
    "Agent technical review is not human scientific, rights or assessment review.",
  ];
}
