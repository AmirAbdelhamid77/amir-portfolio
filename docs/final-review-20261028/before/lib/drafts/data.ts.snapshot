// Shared shape for the disabled review drafts under /practice/drafts.
//
// The two banks are deliberately modelled as independent documents: separate
// ids, separate statuses (DP-600 R18 is NO_GO, PL-300 V88 is NONFINAL) and
// separate source receipts, so nothing can quietly treat them as one approved
// bank. Neither record type has any field that could hold an expected answer —
// `scripts/build-draft-banks.mjs` enforces that at build time and
// `tests/content/drafts-integration.test.mjs` re-checks the shipped files.

export type DraftOption = { id?: string; letter?: string; text: string };

export type DraftQuestion = {
  draftId: string;
  /** The id the question carries in its source package. */
  sourceId: string;
  type: string;
  topic?: number | string;
  num?: number;
  caseStudy?: string;
  /** DP-600 uses `stem`, PL-300 uses `prompt`; both are plain prose. */
  stem?: string;
  prompt?: string;
  refs?: { t: string; u: string }[];
  options: DraftOption[];
  legacy_id?: string;
  video_title?: string;
  video_url?: string;
  video_timestamp_seconds?: number;
  scope?: string;
  exam_objective?: string;
  exam_subobjective?: string;
  /** Notion intake candidates carry a track instead of an exam objective. */
  track?: string;
  difficulty?: number | string;
  code?: string;
  gradingEnabled?: false;
};

export type DraftBank = {
  kind: string;
  version?: number;
  bank?: string;
  exam?: string;
  status: string;
  statusLabel: string;
  gradingEnabled?: false;
  answersShipped?: false;
  note?: string;
  source?: {
    archive: string;
    archiveSha256?: string;
    packageSha256?: string;
    verifier?: string;
    release?: string;
    finalReady?: boolean;
    note?: string;
  };
  caseStudies?: { id: string; name: string; text: string }[];
  questions: DraftQuestion[];
};

export function draftBody(question: DraftQuestion): string {
  return question.stem ?? question.prompt ?? "";
}

/** Lower-cased haystack used by the review search box. */
export function draftSearchText(question: DraftQuestion): string {
  return [
    question.sourceId,
    question.legacy_id ?? "",
    String(question.topic ?? ""),
    question.track ?? "",
    question.exam_objective ?? "",
    question.exam_subobjective ?? "",
    question.video_title ?? "",
    draftBody(question),
    ...question.options.map((option) => option.text),
  ]
    .join(" ")
    .toLowerCase();
}

export function filterDrafts(questions: DraftQuestion[], query: string): DraftQuestion[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return questions;
  return questions.filter((question) => {
    const haystack = draftSearchText(question);
    return words.every((word) => haystack.includes(word));
  });
}
