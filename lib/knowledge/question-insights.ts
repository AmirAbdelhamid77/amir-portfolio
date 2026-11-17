// Question-derived insights (PRODUCT.md §6a, owner decision 2026-11-17).
//
// An insight here is a *reading* of one existing practice question. It is
// assembled from the question's own bytes: its prompt, its strongest
// distractor and that distractor's rationale, its explanation and its answer
// key. Nothing is paraphrased, summarised or written fresh. The only words
// added are fixed UI labels ("Consider this answer:", "Answer key:"), which
// state no fact. Formatting is normalised: markdown emphasis and the
// "(Select one answer.)" instruction are removed, and "Correct:"/"Incorrect:"
// prefixes are dropped from rationales.
//
// A question becomes an insight only if every gate below passes. Every
// rejection is recorded with its reason so the owner can audit the pool.
// The source questions, their IDs and answer keys are never modified.
//
// Pure module: no file system, no browser APIs. The generator script and the
// tests both import it.

import { classify, FABRIC_PACK_TOPIC, topicHref, type SubjectId } from "../study/taxonomy.ts";
import { scopeFromSource } from "../fabric/classify.ts";
import type { Insight } from "./insights.ts";

export const QUESTION_INSIGHT_STATUS = "technical_review";
export const QUESTION_INSIGHT_ID = /^hansa-q-[a-z0-9-]+$/;

/** Packs whose own provenance says Hansa did not validate their answer keys. */
export const UNVALIDATED_PACKS: readonly string[] = ["howard-dp600", "patrick-dp600"];

export type FabricOption = { id: string; text: string; why?: string };
export type FabricQuestion = {
  id: string;
  sourceId: string;
  pack: string;
  topic: string;
  title: string;
  prompt: string;
  type: string;
  options: FabricOption[];
  correct: string[];
  explanation: string;
  refs: string[];
  code?: string;
  caseStudyId?: string | null;
  sourceObjective?: string | null;
  validation?: string;
};
export type SourceRef = { id: string; title: string; url: string };

export type ExamQuestion =
  | { id: string; type: "single"; topic: string; prompt: string; options: string[]; answer: number; explanation: string }
  | { id: string; type: "boolean"; topic: string; prompt: string; answer: boolean; explanation: string }
  | { id: string; type: "multi" | "numeric"; topic: string; prompt: string; explanation: string; [k: string]: unknown };
export type ExamBank = { slug: string; title: string; questions: ExamQuestion[] };

export type Derivation =
  | { ok: true; insight: Insight; subject: SubjectId }
  | { ok: false; id: string; reason: string };

/** Explanations that lean on material the card cannot show. */
const NEEDS_SOURCE_CONTEXT = /\b(the|this|that) (video|instructor|lecture|recording|transcript)\b/i;
const GENERIC_WHY = /^(not the source answer key|matches the source answer key|see the question-level explanation)/i;
const NEEDS_CONTEXT =
  /\b(exhibit|shown below|shown above|following (code|query|script|table|image|diagram|output|statement|expression)|refer to the|in the image|screenshot)\b/i;
const OPTION_REFERS_TO_OPTIONS = /\b(all|none|both|either|neither) of the (above|options|following)\b|^[A-F](,? (and|or) [A-F])+\.?$/i;
const STOPWORDS = new Set(
  "about above after again against also because been before being between both does doing down during each from further have having here into itself just more most only other over same should some such than that their them then there these they this those through under until very were what when where which while will with would your only must need needs each every data fabric microsoft".split(" "),
);

/** Remove markdown emphasis, collapse whitespace, drop answer-format instructions. */
export function cleanText(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|\s)\*([^*\s][^*]*)\*/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s*\((select|choose) (one|two|three|all)[^)]*\)\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** End a fragment with exactly one full stop (keeps ? and !). */
export function sentence(text: string): string {
  const t = text.trim().replace(/[.\s]+$/, "");
  return /[?!]$/.test(t) ? t : `${t}.`;
}

/** Drop a leading "Scenario:" label from a title. */
export function cleanTitle(text: string): string {
  return cleanText(text).replace(/^scenario:\s*/i, "").replace(/[?.]$/, "");
}

/** Drop the "Correct:"/"Incorrect:" verdict prefix; the reasoning after it stays verbatim. */
export function cleanWhy(text: string): string {
  return cleanText(text).replace(/^(in)?correct\s*[:.—-]\s*/i, "");
}

function words(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOPWORDS.has(w)),
  );
}

/**
 * Does the explanation argue for the keyed option, or for a different one?
 * Distinctive words are words of an option that no other option shares. The
 * check fires only when the explanation shares *none* of the keyed option's
 * distinctive words but at least two of a wrong option's. A looser rule
 * (wrong option merely scoring higher) flagged many consistent questions.
 * This is a screen, not proof: flagged questions are listed for human review.
 */
export function keyContradictsExplanation(q: FabricQuestion): boolean {
  const explanation = words(q.explanation);
  const sets = q.options.map((o) => ({ id: o.id, w: words(o.text) }));
  const score = (id: string) => {
    const own = sets.find((s) => s.id === id)!.w;
    const others = sets.filter((s) => s.id !== id);
    let n = 0;
    for (const w of own) if (explanation.has(w) && !others.some((o) => o.w.has(w))) n++;
    return n;
  };
  const keyed = Math.max(...q.correct.map(score));
  const bestWrong = Math.max(0, ...sets.filter((s) => !q.correct.includes(s.id)).map((s) => score(s.id)));
  return keyed === 0 && bestWrong >= 2;
}

/** The explanation names the keyed letter as wrong ("A is wrong because…"). A certain defect. */
export function explanationRejectsKey(q: FabricQuestion): boolean {
  const text = (q.explanation ?? "").replace(/\s+/g, " ");
  return q.correct.some((k) => text.includes(`${k} is wrong`) || text.includes(`${k} is incorrect`));
}

/** The distractor with the most substantial rationale. Ties break on option id. */
export function strongestDistractor(q: FabricQuestion): FabricOption | undefined {
  return q.options
    .filter((o) => !q.correct.includes(o.id) && o.why && !GENERIC_WHY.test(o.why.trim()) && cleanWhy(o.why).length >= 30)
    .sort((a, b) => cleanWhy(b.why!).length - cleanWhy(a.why!).length || a.id.localeCompare(b.id))[0];
}

function slug(id: string) {
  return id.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function deriveFabricInsight(
  q: FabricQuestion,
  sources: ReadonlyMap<string, SourceRef>,
  checkedAt: string,
): Derivation {
  const reject = (reason: string): Derivation => ({ ok: false, id: q.id, reason });
  if (UNVALIDATED_PACKS.includes(q.pack)) return reject("community pack: answer keys not validated by Hansa");
  if (q.type !== "single" || q.correct.length !== 1) return reject("not a single-answer question");
  if (q.code && q.code.trim()) return reject("depends on a code block");
  if (q.caseStudyId) return reject("depends on a case study");
  if (scopeFromSource(q.sourceObjective ?? null) === "adjacent") return reject("adjacent exam scope (DP-700 primary)");
  if (NEEDS_CONTEXT.test(q.prompt)) return reject("prompt refers to an exhibit or listing");
  if (q.options.some((o) => OPTION_REFERS_TO_OPTIONS.test(o.text.trim()))) return reject("an option refers to other options");
  const correct = q.options.find((o) => o.id === q.correct[0]);
  if (!correct) return reject("answer key names a missing option");
  if (correct.why && /^\s*(incorrect|not correct|wrong)\b/i.test(correct.why)) return reject("keyed option's rationale says it is incorrect");
  if (q.options.some((o) => o.id !== correct.id && o.why && /^\s*correct\b/i.test(o.why))) return reject("a non-keyed option's rationale says it is correct");
  if (explanationRejectsKey(q)) return reject("explanation calls the keyed option wrong");
  if (keyContradictsExplanation(q)) return reject("explanation argues for a non-keyed option");
  const explanation = cleanText(q.explanation ?? "");
  if (explanation.length < 50) return reject("explanation too short to stand alone");
  if (NEEDS_SOURCE_CONTEXT.test(explanation) || NEEDS_SOURCE_CONTEXT.test(q.prompt)) return reject("refers to the source video or lecture");
  const trap = strongestDistractor(q);
  if (!trap) return reject("no distractor with a specific rationale");
  const ref = q.refs.map((r) => sources.get(r)).find((s) => s && s.id !== "exam" && s.url.startsWith("https://learn.microsoft.com/"))
    ?? q.refs.map((r) => sources.get(r)).find((s) => s && s.url.startsWith("https://learn.microsoft.com/"));
  if (!ref) return reject("no Microsoft Learn reference");

  const placement = classify("fabric", [q.topic, q.title, q.prompt].join(" "));
  const topic = placement.topic === "overview" && FABRIC_PACK_TOPIC[q.pack] ? FABRIC_PACK_TOPIC[q.pack] : placement.topic;
  const title = cleanTitle(q.title);
  const practiceHref = `/lab/dp-600/explore/?question=${encodeURIComponent(q.id)}`;
  return {
    ok: true,
    subject: "fabric",
    insight: {
      id: `hansa-q-${slug(q.id)}`,
      date: "",
      topic,
      title,
      cardTitle: title,
      scenario: cleanText(q.prompt),
      prediction: `Consider this answer: ${cleanText(trap.text)}`,
      takeaway: explanation,
      caveat: `Answer key: ${sentence(cleanText(correct.text))} Why not “${cleanText(trap.text).replace(/[.\s]+$/, "")}”: ${sentence(cleanWhy(trap.why!))}`,
      conceptId: "",
      lessonHref: topicHref("fabric", topic),
      practiceHref,
      sourceId: `${q.pack} / ${q.sourceId}`,
      sourceUrl: ref.url,
      sourceLocator: `${ref.title}. Practice question ${q.id}${q.validation ? ` — ${cleanText(q.validation)}` : ""}`,
      checkedAt,
      reviewStatus: QUESTION_INSIGHT_STATUS,
      reviewer: "derived verbatim from a practice question; the insight itself is not independently reviewed",
      questionIds: [q.id],
      language: "en",
      sourceKind: "external",
    },
  };
}

/** Analyst exam slug → the curriculum subject it belongs to. */
export const EXAM_SUBJECT: Record<string, SubjectId> = {
  sql: "sql",
  statistics: "statistics",
  "power-bi": "power-bi",
  python: "python",
  excel: "excel",
  fundamentals: "analysis",
};

export function deriveExamInsight(bank: ExamBank, q: ExamQuestion, checkedAt: string): Derivation {
  const reject = (reason: string): Derivation => ({ ok: false, id: `${bank.slug}/${q.id}`, reason });
  const subject = EXAM_SUBJECT[bank.slug];
  if (!subject) return reject("bank is outside the analyst subjects");
  if (q.type !== "single" && q.type !== "boolean") return reject(`${q.type} question`);
  if (NEEDS_CONTEXT.test(q.prompt)) return reject("prompt refers to an exhibit or listing");
  const explanation = cleanText(q.explanation);
  if (explanation.length < 50) return reject("explanation too short to stand alone");

  let prediction: string;
  let key: string;
  if (q.type === "single") {
    if (q.options.some((o) => OPTION_REFERS_TO_OPTIONS.test(o.trim()))) return reject("an option refers to other options");
    if (!q.options[q.answer]) return reject("answer key names a missing option");
    const listed = q.options.map(cleanText).join(" · ");
    if (listed.length > 220) return reject("options too long to list on a card");
    prediction = `Options: ${listed}`;
    key = cleanText(q.options[q.answer]);
  } else {
    prediction = "True or false?";
    key = q.answer ? "True" : "False";
  }
  const placement = classify(subject, [q.topic, q.prompt].join(" "));
  const prompt = cleanText(q.prompt);
  return {
    ok: true,
    subject,
    insight: {
      id: `hansa-q-${slug(`${bank.slug}-${q.id}`)}`,
      date: "",
      topic: subject,
      title: prompt,
      cardTitle: prompt,
      scenario: `From the ${bank.title} practice set.`,
      prediction,
      takeaway: explanation,
      caveat: `Answer key: ${sentence(key)}`,
      conceptId: "",
      lessonHref: topicHref(subject, placement.topic),
      practiceHref: `/lab/${bank.slug}/`,
      sourceId: `${bank.slug} / ${q.id}`,
      sourceUrl: topicHref(subject, placement.topic),
      sourceLocator: `${bank.title} practice set, question ${q.id}`,
      checkedAt,
      reviewStatus: QUESTION_INSIGHT_STATUS,
      reviewer: "derived verbatim from a practice question; the insight itself is not independently reviewed",
      questionIds: [q.id],
      language: "en",
      sourceKind: "local",
    },
  };
}

/**
 * Pick a balanced release from an eligible pool: round-robin across groups
 * (topic, then pack) so no single topic dominates a run of days. Deterministic:
 * groups and members are ordered by id.
 */
export function balancedSelection<T extends { id: string }>(
  items: readonly T[],
  groupOf: (item: T) => string,
  limit: number,
): T[] {
  const groups = new Map<string, T[]>();
  for (const item of [...items].sort((a, b) => a.id.localeCompare(b.id))) {
    const key = groupOf(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const queues = [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, list]) => list);
  const picked: T[] = [];
  while (picked.length < limit && queues.some((q) => q.length)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next) picked.push(next);
      if (picked.length >= limit) break;
    }
  }
  return picked;
}
