// Pure search primitives: normalisation, scoring and ranking.
//
// Kept free of React and of `@/` imports so the same functions run in the
// browser, in the page that builds the index, and in `node --test`.
//
// Design rules (see docs/editorial/VOICE_AND_COPY.md and the search plan):
//   * a token matches a whole word, never a substring inside a word;
//   * a prefix match applies only while typing and only from three characters;
//   * every content token must match, so extra words narrow the set;
//   * question stems are not part of this index — they live in the bank;
//   * the first screen is a curated answer, not an inventory: one best match
//     plus a short group per type, with a cap the caller can rely on.

export type SearchKind =
  | "case-study"
  | "course"
  | "topic"
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
  topic: "Topic",
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
  "topic",
  "lesson",
  "section",
  "lab",
  "tool",
  "formula",
  "glossary",
  "case-study",
  "question",
];

/** Question stems are searched in their bank, never in the destination index. */
export const DESTINATION_KINDS: SearchKind[] = KIND_ORDER.filter(
  (kind) => kind !== "question",
);

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

/**
 * Words that carry no retrieval signal in a question-shaped query.
 * They are removed after normalisation, so the Arabic entries are written in
 * their folded form (`إلى` becomes `الي`, `هذه` stays `هذه`).
 */
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "can",
  "could", "did", "do", "does", "for", "from", "had", "has", "have", "how",
  "i", "if", "in", "into", "is", "it", "its", "may", "might", "must", "my",
  "no", "not", "of", "on", "or", "our", "should", "so", "than", "that",
  "the", "their", "them", "then", "there", "these", "they", "this", "those",
  "to", "was", "we", "were", "what", "when", "where", "which", "who", "why",
  "will", "with", "would", "you", "your",
  // Arabic function words, normalised.
  "في", "من", "على", "الي", "عن", "ما", "هو", "هي", "هذا", "هذه", "ذلك",
  "التي", "الذي", "و", "او", "ثم", "مع", "كل", "بعد", "قبل", "بين", "لا",
  "نعم", "كيف", "لماذا", "متي", "اين", "هل",
]);

/** Split a query into content tokens. Empty and stop words are dropped. */
export function tokenize(value: string): string[] {
  return normalizeSearchText(value)
    .split(" ")
    .filter((token) => token.length > 0 && !STOP_WORDS.has(token));
}

/**
 * A deliberately small synonym set for terms a learner actually types.
 * Each alternative is matched at a lower weight than the typed token.
 */
const SYNONYMS: Record<string, string[]> = {
  directlake: ["direct lake", "directquery"],
  "star schema": ["dimensional model", "fact table"],
  powerbi: ["power bi", "semantic model"],
};

function expandToken(token: string): string[] {
  const extra = SYNONYMS[token] ?? [];
  const single = extra.filter((value) => !value.includes(" "));
  return single.length ? [token, ...single] : [token];
}

type Prepared = {
  title: string;
  keywords: string;
  summary: string;
  id: string;
  titleWords: string[];
  keywordWords: string[];
  summaryWords: string[];
  idWords: string[];
};

const PREPARED = new WeakMap<SearchDocument, Prepared>();

function prepare(document: SearchDocument): Prepared {
  const cached = PREPARED.get(document);
  if (cached) return cached;
  const title = normalizeSearchText(document.title);
  const keywords = normalizeSearchText(
    [document.course ?? "", ...(document.keywords ?? []), ...document.topic].join(" "),
  );
  const summary = normalizeSearchText(document.summary);
  const id = normalizeSearchText(`${document.id} ${document.sourceId ?? ""}`);
  const prepared: Prepared = {
    title,
    keywords,
    summary,
    id,
    titleWords: title.split(" ").filter(Boolean),
    keywordWords: keywords.split(" ").filter(Boolean),
    summaryWords: summary.split(" ").filter(Boolean),
    idWords: id.split(" ").filter(Boolean),
  };
  PREPARED.set(document, prepared);
  return prepared;
}

/** Whole-word match, plus a prefix match only while typing a longer token. */
function fieldScore(
  token: string,
  field: string,
  words: string[],
  allowPrefix: boolean,
): number {
  if (!token) return 0;
  if (!field) return 0;
  if (words.includes(token)) return 100;
  if (allowPrefix && token.length >= 3 && words.some((word) => word.startsWith(token))) {
    return 72;
  }
  return 0;
}

/** True when `a` and `b` are at most one insertion, deletion or substitution apart. */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a === b) return true;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (a.length > b.length) i += 1;
    else if (a.length < b.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  return true;
}

function fuzzyMatch(token: string, words: string[]): boolean {
  if (token.length < 5) return false;
  return words.some(
    (word) => word.length >= 4 && Math.abs(word.length - token.length) <= 1 && withinOneEdit(token, word),
  );
}

export type ScoredDocument = { document: SearchDocument; score: number };

/**
 * Rank by where the query lands: title first, then keywords/topic, then
 * summary. Every token must match somewhere, so multi-word queries narrow
 * instead of drifting; a document with no match is dropped rather than ranked
 * last.
 */
export function scoreDocument(
  document: SearchDocument,
  tokens: string[],
  options: { allowPrefix?: boolean } = {},
): number {
  if (tokens.length === 0) return 0;
  const prepared = prepare(document);
  const allowPrefix = options.allowPrefix ?? true;
  const normalizedTitle = prepared.title;
  const query = tokens.join(" ");

  let total = 0;
  for (const token of tokens) {
    let best = 0;
    for (const alternative of expandToken(token)) {
      const weight = alternative === token ? 1 : 0.6;
      const candidate = Math.max(
        fieldScore(alternative, prepared.title, prepared.titleWords, allowPrefix) * 5,
        fieldScore(alternative, prepared.keywords, prepared.keywordWords, allowPrefix) * 2.5,
        fieldScore(alternative, prepared.summary, prepared.summaryWords, allowPrefix),
        fieldScore(alternative, prepared.id, prepared.idWords, false) * 2,
      );
      best = Math.max(best, Math.round(candidate * weight));
    }
    if (best === 0 && fuzzyMatch(token, prepared.titleWords)) best = 120;
    if (best === 0 && fuzzyMatch(token, prepared.keywordWords)) best = 60;
    if (best === 0) return 0;
    total += best;
  }

  // A whole-query title hit beats any token accumulation. Phrase matches are
  // how "star schema" outranks a page that merely says both words apart.
  if (normalizedTitle === query) total += 600;
  else if (normalizedTitle.startsWith(query)) total += 250;
  else if (normalizedTitle.includes(query)) total += 180;
  else if (prepared.keywords.includes(query)) total += 90;
  else if (prepared.summary.includes(query)) total += 40;

  return total;
}

/** The first screen never shows more than this many destinations. */
export const RESULT_LIMIT = 12;
/** A type filter may show this many; the hard ceiling for any view. */
export const TYPE_LIMIT = 50;

const GROUP_CAP: Record<SearchKind, number> = {
  course: 3,
  topic: 3,
  lesson: 5,
  section: 3,
  lab: 3,
  tool: 3,
  formula: 2,
  glossary: 2,
  "case-study": 2,
  question: 0,
};

const KIND_PRIORITY: Record<SearchKind, number> = {
  course: 0,
  topic: 1,
  section: 2,
  lesson: 3,
  lab: 4,
  "case-study": 5,
  tool: 6,
  formula: 7,
  glossary: 8,
  question: 9,
};

/**
 * A glossary headword that happens to be a common word ("Power", "Median")
 * should not outrank the course that teaches the subject. Reference entries
 * stay findable, one step below the page that explains them.
 */
const KIND_WEIGHT: Record<SearchKind, number> = {
  course: 1,
  topic: 1,
  lesson: 1,
  section: 1,
  lab: 1,
  "case-study": 0.95,
  tool: 0.9,
  formula: 0.85,
  glossary: 0.6,
  question: 1,
};

export type SearchFilters = {
  kinds?: SearchKind[];
  language?: SearchLanguage | "all";
};

/** Score and order every matching document. No cap: callers decide. */
export function searchDocuments(
  documents: SearchDocument[],
  query: string,
  filters: SearchFilters = {},
  options: { allowPrefix?: boolean } = {},
): ScoredDocument[] {
  const tokens = tokenize(query).slice(0, 8);
  if (tokens.length === 0) return [];
  const allowPrefix = options.allowPrefix ?? true;
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
    .map((document) => ({ document, score: scoreDocument(document, tokens, { allowPrefix }) }))
    .map((row) => ({ ...row, score: Math.round(row.score * KIND_WEIGHT[row.document.kind]) }))
    .filter((row) => row.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        KIND_PRIORITY[a.document.kind] - KIND_PRIORITY[b.document.kind] ||
        a.document.title.localeCompare(b.document.title),
    );
}

export type SearchGroup = {
  kind: SearchKind;
  label: string;
  items: ScoredDocument[];
  total: number;
};

export type SearchOutcome = {
  query: string;
  tokens: string[];
  /** Unique matches after de-duplication. */
  total: number;
  /** Destinations actually returned. */
  shown: number;
  /** True when the reader should narrow the query or pick a type. */
  refine: boolean;
  best: ScoredDocument | null;
  groups: SearchGroup[];
};

/**
 * De-duplicate by normalised title. Mirrored courseware and the same lesson
 * surfaced at two addresses are one destination, not two results. When two
 * documents share a title, the more structural kind wins unless the other
 * scores much higher.
 */
function dedupe(rows: ScoredDocument[]): ScoredDocument[] {
  const byTitle = new Map<string, ScoredDocument>();
  const seenUrls = new Set<string>();
  for (const row of rows) {
    const url = row.document.url.replace(/\/+$/, "");
    if (seenUrls.has(url)) continue;
    const key = normalizeSearchText(row.document.title).replace(/^['"]|['"]$/g, "");
    if (!key) continue;
    const existing = byTitle.get(key);
    if (!existing) {
      byTitle.set(key, row);
      seenUrls.add(url);
      continue;
    }
    const existingRank =
      existing.score + (9 - KIND_PRIORITY[existing.document.kind]) * 30;
    const candidateRank =
      row.score + (9 - KIND_PRIORITY[row.document.kind]) * 30;
    if (candidateRank > existingRank) {
      byTitle.set(key, row);
    }
    seenUrls.add(url);
  }
  return [...byTitle.values()].sort(
    (a, b) =>
      b.score - a.score ||
      KIND_PRIORITY[a.document.kind] - KIND_PRIORITY[b.document.kind] ||
      a.document.title.localeCompare(b.document.title),
  );
}

/**
 * The site search result: one best match, then a short group per type.
 * `refine` says there is more to see; the reader narrows with a type or a word
 * rather than clicking "show 30 more" ten times.
 */
export function searchSite(
  documents: SearchDocument[],
  query: string,
  filters: SearchFilters = {},
): SearchOutcome {
  const tokens = tokenize(query).slice(0, 8);
  if (tokens.length === 0) {
    return {
      query,
      tokens,
      total: 0,
      shown: 0,
      refine: false,
      best: null,
      groups: [],
    };
  }
  const rows = dedupe(searchDocuments(documents, query, filters));
  const typeFiltered = Boolean(filters.kinds && filters.kinds.length > 0);
  const limit = typeFiltered ? TYPE_LIMIT : RESULT_LIMIT;
  const best = rows[0] ?? null;
  const groups: SearchGroup[] = [];
  let budget = limit - (best ? 1 : 0);

  for (const kind of KIND_ORDER) {
    if (budget <= 0) break;
    const all = rows.filter((row) => row.document.kind === kind);
    if (all.length === 0) continue;
    const cap = Math.min(typeFiltered ? TYPE_LIMIT : GROUP_CAP[kind], budget);
    if (cap === 0) continue;
    // The best match already anchors the page; do not repeat it in its group.
    const items = all.filter((row) => row !== best).slice(0, cap);
    if (items.length === 0) continue;
    groups.push({ kind, label: KIND_LABEL[kind], items, total: all.length });
    budget -= items.length;
  }

  const total = rows.length;
  const shown = (best ? 1 : 0) + groups.reduce((sum, group) => sum + group.items.length, 0);
  return {
    query,
    tokens,
    total,
    shown,
    refine: total > shown,
    best,
    groups,
  };
}
