// Pure search primitives: normalisation, scoring and filtering.
//
// Kept free of React and of `@/` imports so the same functions run in the
// browser, in the page that builds the index, and in `node --test`.

export type SearchKind =
  | "case-study"
  | "course"
  | "lesson"
  | "section"
  | "lab"
  | "question"
  | "glossary"
  | "formula"
  | "tool";

export type SearchLanguage = "en" | "ar" | "mixed";

export type SearchDocument = {
  id: string;
  title: string;
  url: string;
  kind: SearchKind;
  summary: string;
  topic: string[];
  language: SearchLanguage;
  level?: string;
  course?: string;
  sourceId?: string;
  keywords?: string[];
};

export const KIND_LABEL: Record<SearchKind, string> = {
  "case-study": "Case study",
  course: "Course",
  lesson: "Lesson",
  section: "Section",
  lab: "Lab",
  question: "Question",
  glossary: "Glossary",
  formula: "Formula",
  tool: "Tool",
};

/** Filter chips, in the order a reader is most likely to want them. */
export const KIND_ORDER: SearchKind[] = [
  "course",
  "lesson",
  "section",
  "lab",
  "tool",
  "question",
  "case-study",
  "formula",
  "glossary",
];

const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const TATWEEL = /\u0640/g;

/**
 * Folds the differences a reader does not type: Arabic diacritics, tatweel,
 * alef/ya/ta-marbuta variants, case, punctuation and repeated whitespace.
 * `المدرج التكراري` and `المدرج  التكراري` must match; so must `VACUUM` and
 * `vacuum`, and `p-value` and `p value`.
 */
export function normalizeSearchText(value: string): string {
  return value
    .replace(ARABIC_DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[ىئ]/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ة/g, "ه")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function fieldScore(token: string, field: string): number {
  if (!field) return 0;
  if (field === token) return 120;
  if (field.startsWith(token)) return 90;
  const words = field.split(" ");
  if (words.includes(token)) return 80;
  if (words.some((word) => word.startsWith(token))) return 65;
  if (token.length >= 3 && field.includes(token)) return 40;
  return 0;
}

export type ScoredDocument = { document: SearchDocument; score: number };

/**
 * Rank by where the query lands: title first, then keywords/topic, then summary.
 * Every token must match somewhere, so multi-word queries narrow instead of
 * drifting; a document with no match is dropped rather than ranked last.
 */
export function scoreDocument(document: SearchDocument, tokens: string[]): number {
  const title = normalizeSearchText(document.title);
  const keywords = normalizeSearchText(
    [document.course ?? "", ...(document.keywords ?? []), ...document.topic].join(" "),
  );
  const summary = normalizeSearchText(document.summary);
  const id = normalizeSearchText(`${document.id} ${document.sourceId ?? ""}`);

  let total = 0;
  for (const token of tokens) {
    const best = Math.max(
      fieldScore(token, title) * 4,
      fieldScore(token, keywords) * 2,
      fieldScore(token, summary),
      fieldScore(token, id),
    );
    if (best === 0) return 0;
    total += best;
  }
  // A whole-query title match beats any multi-token accumulation.
  if (normalizeSearchText(document.title) === tokens.join(" ")) total += 500;
  return total;
}

export function searchDocuments(
  documents: SearchDocument[],
  query: string,
  filters: { kinds?: SearchKind[]; language?: SearchLanguage | "all" } = {},
): ScoredDocument[] {
  const normalized = normalizeSearchText(query);
  const tokens = normalized ? normalized.split(/\s+/).slice(0, 6) : [];
  return documents
    .filter((document) => {
      if (filters.kinds && filters.kinds.length > 0 && !filters.kinds.includes(document.kind)) {
        return false;
      }
      if (filters.language && filters.language !== "all" && document.language !== filters.language) {
        return false;
      }
      return true;
    })
    .map((document) => ({ document, score: tokens.length ? scoreDocument(document, tokens) : 1 }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title));
}
