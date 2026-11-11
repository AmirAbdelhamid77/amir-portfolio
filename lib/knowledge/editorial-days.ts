// Editorial day composition (2026-11-10): the three dated editions keep their
// real dates, and each one gains two records from the owner's daily-insight
// bank so every timeline day carries three insights. Nothing here invents a
// date: a placement that does not match an existing dated edition fails the
// build. Nothing here promotes a record: the bank's `reviewStatus` and its
// review flags travel unchanged, and the UI labels drafts as unverified.
//
// The bank is an authoring pool, not a publication approval. Its own contract
// (`docs/daily-insight-bank-20261106/README.md`) says all 400 records are
// staging-only. This module is the explicit, labelled exception requested by
// the owner; it does not touch the bank, the published feed or the review
// gates in `eligibleInsights`.
import type { DayLedgerDay } from "./day-ledger";
import type { Insight } from "./insights";
import { reviewStatusLabel } from "./review-status.ts";

export class EditorialDayError extends Error {}

export type EditorialPlacement = {
  /** An existing dated edition. Placements never create a new date. */
  date: string;
  /** Bank records appended after that day's dated edition. */
  bankIds: readonly string[];
};

export type EditorialBankRecord = {
  id: string;
  subject: string;
  topic: string;
  title: string;
  scenario: string;
  prediction: string;
  takeaway: string;
  caveat: string;
  language: string;
  reviewStatus: string;
  sourceReviewed?: boolean;
  scientificallyVerified?: boolean;
  publicationApproved?: boolean;
  source: {
    key: string;
    path: string;
    pointer: string;
    sha256?: string;
  };
  evidence?: {
    pointer: string;
    excerpt?: string;
    matching?: string;
  } | null;
  lessonHref?: string;
  sourceNavigation?: string | null;
};

// The selection is editorial, not algorithmic. Each pair extends the theme of
// the edition it joins, so a day reads as three angles on one decision:
//   24 Oct — where the object lives and what depends on that location;
//   25 Oct — what deletion and recovery actually change;
//   26 Oct — what a reference retains and what it never replaces.
// All six are source-reviewed Arabic drafts with a matching local excerpt and
// a navigation path into the same DP-600 resource pack. They come from
// `content/fabric/notes.json`, not from a question bank.
export const EDITORIAL_PLACEMENTS: readonly EditorialPlacement[] = [
  { date: "2026-10-24", bankIds: ["hansa-bank-295", "hansa-bank-304"] },
  { date: "2026-10-25", bankIds: ["hansa-bank-298", "hansa-bank-323"] },
  { date: "2026-10-26", bankIds: ["hansa-bank-296", "hansa-bank-297"] },
] as const;

/** The day the bank was frozen. It is the record's check date, not a claim
 * that the record was newly reviewed on that day. */
const BANK_CHECKED_AT = "2026-11-06";

function required(record: EditorialBankRecord, field: keyof EditorialBankRecord): string {
  const value = record[field];
  if (typeof value !== "string" || !value.trim()) {
    throw new EditorialDayError(`Bank record ${record.id || "(missing id)"} has no ${String(field)}.`);
  }
  return value;
}

function requiredSource(record: EditorialBankRecord, field: "key" | "path" | "pointer"): string {
  const value = record.source?.[field];
  if (typeof value !== "string" || !value.trim()) {
    throw new EditorialDayError(`Bank record ${record.id} has no source ${field}.`);
  }
  return value;
}

/**
 * Map one bank record onto the existing Insight shape. The mapping is
 * deliberately literal: the title, scenario, prediction, takeaway and caveat
 * are the bank's bytes; no card copy is written here.
 */
export function adaptBankRecord(record: EditorialBankRecord, date: string): Insight {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new EditorialDayError(`Placement date is not ISO: ${date}`);
  }
  const id = required(record, "id");
  if (!/^hansa-bank-\d{3}$/.test(id)) {
    throw new EditorialDayError(`Unexpected bank id: ${id}`);
  }
  if (record.sourceReviewed !== true) {
    throw new EditorialDayError(`Bank record ${id} has not been source-reviewed.`);
  }
  if (record.reviewStatus !== "draft" && record.reviewStatus !== "technical_review") {
    throw new EditorialDayError(`Bank record ${id} has unsupported status: ${record.reviewStatus}`);
  }
  if (record.reviewStatus === "draft" && record.publicationApproved === true) {
    throw new EditorialDayError(`Bank record ${id} is marked draft but publication-approved.`);
  }

  const lessonHref = required(record, "lessonHref");
  if (!lessonHref.startsWith("/")) {
    throw new EditorialDayError(`Bank record ${id} has a non-local lesson link: ${lessonHref}`);
  }

  const sourceKey = requiredSource(record, "key");
  const sourcePath = requiredSource(record, "path");
  const sourcePointer = requiredSource(record, "pointer");
  const evidencePointer = record.evidence?.pointer?.trim();
  const navigation = record.sourceNavigation?.trim();
  const locator = [
    navigation || "Local source",
    `${sourcePath} ${sourcePointer}`,
    evidencePointer ? `evidence ${evidencePointer}` : null,
  ]
    .filter(Boolean)
    .join(" — ");

  return {
    id,
    date,
    topic: required(record, "topic"),
    title: required(record, "title"),
    scenario: required(record, "scenario"),
    prediction: required(record, "prediction"),
    takeaway: required(record, "takeaway"),
    caveat: required(record, "caveat"),
    cardTitle: required(record, "title"),
    // The bank has no Atlas concept mapping. An empty value is honest; the
    // timeline and detail routes do not read this field.
    conceptId: "",
    lessonHref,
    practiceHref: lessonHref,
    sourceId: sourceKey,
    // A local record cannot claim a Microsoft Learn URL. The detail scene
    // switches its link label to "related lesson" for this source kind.
    sourceUrl: lessonHref,
    sourceLocator: locator,
    checkedAt: BANK_CHECKED_AT,
    reviewStatus: record.reviewStatus,
    reviewer: "authoring bank; independent review pending",
    questionIds: [],
    language: required(record, "language"),
    sourceKind: "local",
    statusLabel: reviewStatusLabel(record.reviewStatus),
  };
}

/**
 * Append the placed bank records to the dated editions and fail closed on any
 * structural drift. Every day must end with exactly three insights; a new
 * edition added to the feed without two companion placements stops the build
 * rather than silently rendering a one-insight day again.
 */
export function buildEditorialDays(
  baseDays: readonly DayLedgerDay[],
  bankItems: readonly EditorialBankRecord[],
  placements: readonly EditorialPlacement[] = EDITORIAL_PLACEMENTS,
): DayLedgerDay[] {
  const days = new Map<string, DayLedgerDay>();
  const seenIds = new Set<string>();
  for (const day of baseDays) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date)) {
      throw new EditorialDayError(`Dated edition has a non-ISO date: ${day.date}`);
    }
    if (days.has(day.date)) {
      throw new EditorialDayError(`Duplicate dated edition: ${day.date}`);
    }
    days.set(day.date, { date: day.date, insights: [...day.insights] });
    for (const insight of day.insights) {
      if (seenIds.has(insight.id)) {
        throw new EditorialDayError(`Duplicate insight id: ${insight.id}`);
      }
      seenIds.add(insight.id);
    }
  }

  const bankById = new Map(bankItems.map((item) => [item.id, item]));
  const placedIds = new Set<string>();
  const placedDates = new Set<string>();

  for (const placement of placements) {
    if (placedDates.has(placement.date)) {
      throw new EditorialDayError(`Date ${placement.date} has more than one placement.`);
    }
    placedDates.add(placement.date);
    const day = days.get(placement.date);
    if (!day) {
      throw new EditorialDayError(
        `No dated edition exists for ${placement.date}; the timeline never invents a date.`,
      );
    }
    for (const bankId of placement.bankIds) {
      if (placedIds.has(bankId)) {
        throw new EditorialDayError(`Bank record ${bankId} is placed more than once.`);
      }
      const record = bankById.get(bankId);
      if (!record) {
        throw new EditorialDayError(`Bank record ${bankId} was not found.`);
      }
      const insight = adaptBankRecord(record, placement.date);
      if (seenIds.has(insight.id)) {
        throw new EditorialDayError(`Bank record ${bankId} duplicates an existing insight id.`);
      }
      seenIds.add(insight.id);
      placedIds.add(bankId);
      day.insights.push(insight);
    }
  }

  for (const day of days.values()) {
    if (day.insights.length !== 3) {
      throw new EditorialDayError(
        `Date ${day.date} carries ${day.insights.length} insights; every editorial day requires exactly 3.`,
      );
    }
  }

  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
}
