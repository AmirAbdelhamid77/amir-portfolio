// FC07 — pure Fabric full-text scoring: weights, phrase boosts, tie-breaks.
//
// Kept free of React, of `@/` imports and of fetch/Worker/DOM so the same
// functions run inside the Web Worker, in the same-thread fallback, and in
// `node --test`. Imports only the existing pure search primitives
// (lib/search/query.ts) so Fabric scoring shares the exact normalisation and
// tokenisation rules the metadata index uses.
//
// Shard-independent ranking contract (handover 03 §Search, review disposition
// "Search parity accepted"): scores use only per-article statistics (term
// frequency saturation and field weights) — NEVER shard-local counts such as
// shard-local document frequency or corpus size. A query scored against one
// shard, against all loaded shards, or against a whole-index reference
// therefore produces identical per-article scores, which is what the parity
// gate proves.
//
// Documented weights (fc07-report.md §merge contract):
//   title 5 > headings 3 > body 1; doc-level terms 1.5.
//   Exact-phrase boosts: title +10, heading +6, body +4.
//   Term frequency saturates: tf / (tf + 2).
//   Every query token must match somewhere in the article (title ∪ headings ∪
//   body ∪ terms), mirroring the metadata index's "extra words narrow" rule.
//   Ties break by logicalPath ascending — deterministic ordering, proven in
//   tests/fabric-corpus/search/scorer.test.mjs.
import { normalizeSearchText, tokenize } from "./query.ts";

export type FabricSection = {
  /** Section heading as authored (markup-free). */
  heading: string;
  /** Compiler heading slug for the deep link (`#anchor`), "" for the intro. */
  anchor: string;
  /** Markup-free, entity-decoded, whitespace-normalised section text. */
  text: string;
  /** "intro" (before the first heading) | "section". */
  kind: string;
};

export type FabricArticle = {
  articleId: string;
  logicalPath: string;
  title: string;
  family: string;
  sections: FabricSection[];
  /** Doc-level alias signal: title/description/slug/heading words. */
  terms?: string;
};

export type FabricShard = {
  schema: string;
  version: string;
  shardId: string;
  articles: FabricArticle[];
};

/** One ranked fabric-docs row (rendered by the app/search fabric band). */
export type FabricHit = {
  kind: "fabric-docs";
  articleId: string;
  logicalPath: string;
  title: string;
  family: string;
  score: number;
  /** Heading of the best-matching section (snippet provenance). */
  heading: string;
  /** Anchor for the deep link into the article ("" → article top). */
  anchor: string;
  /** Snippet built from the matched section; query terms intact. */
  snippet: string;
};

export const FABRIC_WEIGHTS = {
  title: 5,
  headings: 3,
  body: 1,
  terms: 1.5,
} as const;

export const FABRIC_PHRASE_BOOSTS = {
  title: 10,
  heading: 6,
  body: 4,
} as const;

export const FABRIC_RESULT_LIMIT = 8;

/** Frequency saturation: diminishing returns after the second occurrence. */
function saturation(tf: number): number {
  if (tf <= 0) return 0;
  return tf / (tf + 2);
}

type FieldStats = {
  text: string;
  tokens: Map<string, number>;
};

function fieldStats(raw: string): FieldStats {
  const text = normalizeSearchText(raw ?? "");
  const tokens = new Map<string, number>();
  if (text) {
    for (const token of text.split(" ")) {
      if (!token) continue;
      tokens.set(token, (tokens.get(token) ?? 0) + 1);
    }
  }
  return { text, tokens };
}

function fieldScore(stats: FieldStats, token: string, weight: number): number {
  return weight * saturation(stats.tokens.get(token) ?? 0);
}

type PreparedArticle = {
  title: FieldStats;
  terms: FieldStats;
  sections: { heading: FieldStats; body: FieldStats; headingRaw: string; bodyRaw: string; anchor: string }[];
};

function prepareArticle(article: FabricArticle): PreparedArticle {
  const title = fieldStats(article.title);
  const terms = fieldStats(article.terms ?? "");
  const sections = article.sections.map((section) => ({
    heading: fieldStats(section.heading),
    body: fieldStats(section.text),
    headingRaw: section.heading,
    bodyRaw: section.text,
    anchor: section.anchor,
  }));
  return { title, terms, sections };
}

/**
 * Score one article against prepared query tokens.
 * Returns the score and the best section index (for the snippet), or null
 * when the article does not match every token.
 */
export function scoreFabricArticle(
  article: FabricArticle,
  tokens: string[],
  phrase: string,
  prepared?: PreparedArticle,
): { score: number; bestSection: number } | null {
  if (tokens.length === 0) return null;
  const state = prepared ?? prepareArticle(article);

  // Union gate: every token must appear in at least one field.
  const anyWhere = (token: string): boolean =>
    state.title.tokens.has(token) ||
    state.terms.tokens.has(token) ||
    state.sections.some((section) => section.heading.tokens.has(token) || section.body.tokens.has(token));
  for (const token of tokens) {
    if (!anyWhere(token)) return null;
  }

  // Doc-level signals: title and terms (aliases/description/headings).
  let docScore = 0;
  for (const token of tokens) {
    docScore += fieldScore(state.title, token, FABRIC_WEIGHTS.title);
    docScore += fieldScore(state.terms, token, FABRIC_WEIGHTS.terms);
  }

  // Body/headings signal: the best single section carries the section band.
  let bestSection = -1;
  let bestSectionScore = 0;
  for (let index = 0; index < state.sections.length; index += 1) {
    const section = state.sections[index];
    let sectionScore = 0;
    for (const token of tokens) {
      sectionScore += fieldScore(section.heading, token, FABRIC_WEIGHTS.headings);
      sectionScore += fieldScore(section.body, token, FABRIC_WEIGHTS.body);
    }
    if (sectionScore > bestSectionScore) {
      bestSectionScore = sectionScore;
      bestSection = index;
    }
  }

  let score = docScore + bestSectionScore;

  // Exact-phrase boosts: title once, and at most one per section (heading
  // takes precedence over body within the same section).
  if (phrase) {
    if (state.title.text.includes(phrase)) score += FABRIC_PHRASE_BOOSTS.title;
    for (const section of state.sections) {
      if (section.heading.text.includes(phrase)) score += FABRIC_PHRASE_BOOSTS.heading;
      else if (section.body.text.includes(phrase)) score += FABRIC_PHRASE_BOOSTS.body;
    }
  }

  if (score <= 0) return null;
  return { score, bestSection };
}

/**
 * Build the result snippet from the best section: a window around the first
 * token occurrence, on word boundaries, with the query terms intact (no
 * re-writing, no stemming — the matched words appear verbatim).
 *
 * Display-only (the parity gate covers ranking, not snippet offsets): the
 * first match is located by case-insensitive indexOf on the raw text, with a
 * proportional fallback through the folded text for tokens whose written form
 * differs (punctuation folding such as "p-value" → "p value").
 */
export function buildSnippet(sectionHeadingRaw: string, sectionBodyRaw: string, tokens: string[]): string {
  const body = sectionBodyRaw.replace(/\s+/g, " ").trim();
  if (!body) return sectionHeadingRaw.replace(/\s+/g, " ").trim();
  const lower = body.toLowerCase();
  const folded = normalizeSearchText(body);
  let cut = -1;
  for (const token of tokens) {
    if (!token) continue;
    cut = lower.indexOf(token);
    if (cut >= 0) break;
    const foldedAt = folded.indexOf(token);
    if (foldedAt >= 0 && folded.length > 0) {
      cut = Math.min(body.length - 1, Math.round((foldedAt / folded.length) * body.length));
      // Snap to a word start at or before the proportional point.
      while (cut > 0 && /\S/.test(body[cut - 1] ?? " ")) cut -= 1;
      break;
    }
  }
  if (cut < 0) return body.slice(0, 200);
  const start = Math.max(0, cut - 60);
  const end = Math.min(body.length, cut + 140);
  let window = body.slice(start, end).trim();
  if (start > 0) {
    const firstSpace = window.indexOf(" ");
    window = firstSpace > 0 ? `…${window.slice(firstSpace + 1)}` : `…${window}`;
  }
  if (end < body.length) {
    const lastSpace = window.lastIndexOf(" ");
    if (lastSpace > 0) window = window.slice(0, lastSpace);
    window = `${window}…`;
  }
  return window;
}

/** Round to 4 decimals so the ranking contract is byte-stable across engines. */
function stableScore(value: number): number {
  return Math.round(value * 10000) / 10000;
}

/**
 * Rank a set of fabric articles for a query.
 * Deterministic: score desc, then logicalPath asc. No cap applied here —
 * callers slice (the worker applies FABRIC_RESULT_LIMIT).
 */
export function rankFabricArticles(
  articles: FabricArticle[],
  query: string,
  options: { limit?: number } = {},
): FabricHit[] {
  const tokens = tokenize(query).slice(0, 8);
  if (tokens.length === 0) return [];
  // Phrase = all content tokens joined, the same string the metadata scorer
  // compares against field text.
  const phrase = tokens.join(" ");
  const hits: FabricHit[] = [];
  for (const article of articles) {
    const prepared = prepareArticle(article);
    const scored = scoreFabricArticle(article, tokens, phrase, prepared);
    if (!scored) continue;
    const section =
      scored.bestSection >= 0 && prepared.sections[scored.bestSection]
        ? prepared.sections[scored.bestSection]
        : null;
    hits.push({
      kind: "fabric-docs",
      articleId: article.articleId,
      logicalPath: article.logicalPath,
      title: article.title,
      family: article.family,
      score: stableScore(scored.score),
      heading: section ? section.headingRaw.replace(/\s+/g, " ").trim() : article.title,
      anchor: section ? section.anchor : "",
      snippet: section
        ? buildSnippet(section.headingRaw, section.bodyRaw, tokens)
        : (article.terms ?? "").slice(0, 200),
    });
  }
  hits.sort(
    (a, b) => b.score - a.score || (a.logicalPath < b.logicalPath ? -1 : a.logicalPath > b.logicalPath ? 1 : 0),
  );
  const limit = options.limit ?? hits.length;
  return limit > 0 ? hits.slice(0, limit) : hits;
}

/**
 * Whole-query scoring over an arbitrary collection of shards — the exact
 * function the worker and the same-thread fallback run. Sharded scoring equals
 * whole-index scoring because per-article scores never depend on the shard
 * set (shard-independent ranking contract).
 */
export function scoreShards(shards: FabricShard[], query: string, limit = FABRIC_RESULT_LIMIT): FabricHit[] {
  const articles: FabricArticle[] = [];
  for (const shard of shards) {
    if (!shard || !Array.isArray(shard.articles)) continue;
    articles.push(...shard.articles);
  }
  return rankFabricArticles(articles, query, { limit });
}
