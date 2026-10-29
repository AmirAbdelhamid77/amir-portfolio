// Pure session logic for the Fabric practice hub: deterministic selection,
// option ordering, grading and result aggregation.
//
// Everything here is side-effect free so it can be unit-tested against the real
// imported bank (`tests/fabric/scoring.test.mjs`) and reused by the UI without a
// second scoring implementation.

import type {
  FabricIndexEntry,
  FabricQuestion,
  FabricQuestionType,
  ObjectiveId,
  Scope,
  SubjectId,
} from "./types";

export type FabricMode = "guided" | "topic" | "mock" | "case" | "review";

export type StatusFilter =
  | "all"
  | "unattempted"
  | "incorrect"
  | "bookmarked"
  | "flagged"
  | "repeated";

export interface SessionFilter {
  packs?: string[];
  subjects?: SubjectId[];
  /** Leaf (`"3.2"`), domain (`"3"`) or `"unmapped"`. */
  objectives?: string[];
  scopes?: Scope[];
  types?: FabricQuestionType[];
  difficulties?: number[];
  status?: StatusFilter;
  caseStudyId?: string;
}

export interface SessionConfig {
  mode: FabricMode;
  filter: SessionFilter;
  count: number;
  /** `null` for the untimed modes. */
  minutes: number | null;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  seed: number;
  label?: string;
}

export interface SessionManifest {
  v: 1;
  id: string;
  mode: FabricMode;
  createdAt: string;
  seed: number;
  label: string;
  questionIds: string[];
  /** Display order of option ids, per question. Sequence questions keep source order. */
  optionOrder: Record<string, string[]>;
  minutes: number | null;
  filter: SessionFilter;
}

export interface LearnerSnapshot {
  attempted: ReadonlySet<string>;
  incorrect: ReadonlySet<string>;
  bookmarked: ReadonlySet<string>;
  flagged: ReadonlySet<string>;
  attempts: Readonly<Record<string, number>>;
}

export const EMPTY_SNAPSHOT: LearnerSnapshot = {
  attempted: new Set(),
  incorrect: new Set(),
  bookmarked: new Set(),
  flagged: new Set(),
  attempts: {},
};

/** Small, fast, deterministic PRNG. Same seed → same session, on every device. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const random = mulberry32(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function filterEntries(
  entries: FabricIndexEntry[],
  filter: SessionFilter,
  learner: LearnerSnapshot,
): FabricIndexEntry[] {
  const status = filter.status ?? "all";
  return entries.filter((entry) => {
    if (filter.packs?.length && !filter.packs.includes(entry.pack)) return false;
    if (filter.subjects?.length && !filter.subjects.includes(entry.subject)) return false;
    if (filter.objectives?.length) {
      const keys = [entry.objectiveId, entry.domain, entry.objectiveId ? null : "unmapped"];
      if (!filter.objectives.some((value) => keys.includes(value as string | null))) return false;
    }
    if (filter.scopes?.length && !filter.scopes.includes(entry.scope)) return false;
    if (filter.types?.length && !filter.types.includes(entry.type)) return false;
    if (filter.difficulties?.length && !filter.difficulties.includes(entry.difficulty ?? -1)) return false;
    if (filter.caseStudyId && entry.caseStudyId !== filter.caseStudyId) return false;

    switch (status) {
      case "unattempted":
        return !learner.attempted.has(entry.id);
      case "incorrect":
        return learner.incorrect.has(entry.id);
      case "bookmarked":
        return learner.bookmarked.has(entry.id);
      case "flagged":
        return learner.flagged.has(entry.id);
      case "repeated":
        return (learner.attempts[entry.id] ?? 0) >= 2 && learner.incorrect.has(entry.id);
      default:
        return true;
    }
  });
}

/** Pick the question ids for a session. Pure, seeded and reproducible. */
export function selectQuestionIds(
  config: SessionConfig,
  entries: FabricIndexEntry[],
  learner: LearnerSnapshot = EMPTY_SNAPSHOT,
): string[] {
  const eligible = filterEntries(entries, config.filter, learner);
  // Sort by internal id first so the seeded shuffle is stable regardless of the
  // order the client happened to receive the index in.
  const ordered = [...eligible].sort((a, b) => a.id.localeCompare(b.id));
  const pool = config.shuffleQuestions ? seededShuffle(ordered, config.seed) : ordered;
  return pool.slice(0, Math.max(0, Math.min(config.count, pool.length))).map((entry) => entry.id);
}

/**
 * Build a reproducible session. The manifest stores the seed, the selected ids
 * and (once the packs are loaded) the option order, so a refresh — or a shared
 * session id — rebuilds exactly the same paper.
 */
export function buildManifest(
  config: SessionConfig,
  questionIds: string[],
): SessionManifest {
  const label =
    config.label ??
    (config.mode === "mock"
      ? "Custom practice simulation"
      : config.mode === "guided"
        ? "Guided study"
        : config.mode === "case"
          ? "Case-study practice"
          : config.mode === "review"
            ? "Review session"
            : "Topic practice");

  return {
    v: 1,
    id: `fs-${config.seed.toString(36)}-${config.mode}-${questionIds.length}`,
    mode: config.mode,
    createdAt: new Date().toISOString(),
    seed: config.seed,
    label,
    questionIds,
    optionOrder: {},
    minutes: config.minutes,
    filter: config.filter,
  };
}

/**
 * Compute the display order for every option. Sequence questions keep their
 * source order: their interaction is the ordering, so shuffling the list would
 * only make the task harder to read.
 */
export function optionOrderFor(
  questions: FabricQuestion[],
  seed: number,
  shuffleOptions: boolean,
): Record<string, string[]> {
  const order: Record<string, string[]> = {};
  questions.forEach((question, position) => {
    const ids = question.options.map((option) => option.id);
    order[question.id] =
      shuffleOptions && question.type !== "sequence"
        ? seededShuffle(ids, seed + position + 1)
        : ids;
  });
  return order;
}

export interface GradeResult {
  correct: boolean;
  /** Correct option ids the learner did not select. */
  missing: string[];
  /** Selected option ids that are not part of the key. */
  extra: string[];
  /** For sequences: display positions that differ from the key. */
  wrongPositions: number[];
}

/**
 * Exact-match grading. A partly correct multi-select is **incorrect**, which is
 * the behaviour the existing Data Lab already uses and the one the source bank
 * was authored against.
 */
export function grade(question: FabricQuestion, response: readonly string[] | undefined): GradeResult {
  if (!response || response.length === 0) {
    return { correct: false, missing: [...question.correct], extra: [], wrongPositions: [] };
  }
  const key = question.correct;

  if (question.type === "sequence") {
    const wrongPositions: number[] = [];
    for (let index = 0; index < Math.max(key.length, response.length); index += 1) {
      if (key[index] !== response[index]) wrongPositions.push(index);
    }
    return {
      correct: wrongPositions.length === 0 && response.length === key.length,
      missing: key.filter((id) => !response.includes(id)),
      extra: response.filter((id) => !key.includes(id)),
      wrongPositions,
    };
  }

  const selected = new Set(response);
  const expected = new Set(key);
  const missing = key.filter((id) => !selected.has(id));
  const extra = response.filter((id) => !expected.has(id));
  return {
    correct: missing.length === 0 && extra.length === 0 && selected.size === expected.size,
    missing,
    extra,
    wrongPositions: [],
  };
}

export interface ResultBucket {
  key: string;
  label: string;
  correct: number;
  total: number;
}

export interface SessionResult {
  sessionId: string;
  mode: FabricMode;
  label: string;
  completedAt: string;
  durationSeconds: number;
  autoSubmitted: boolean;
  score: number;
  total: number;
  percent: number;
  answers: Record<string, string[]>;
  perQuestion: Record<string, boolean>;
  byObjective: ResultBucket[];
  bySubject: ResultBucket[];
  byType: ResultBucket[];
}

function bucketise(
  items: { key: string; label: string; correct: boolean }[],
): ResultBucket[] {
  const map = new Map<string, ResultBucket>();
  for (const item of items) {
    const bucket = map.get(item.key) ?? { key: item.key, label: item.label, correct: 0, total: 0 };
    bucket.total += 1;
    if (item.correct) bucket.correct += 1;
    map.set(item.key, bucket);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function gradeSession(options: {
  sessionId: string;
  mode: FabricMode;
  label: string;
  questions: FabricQuestion[];
  entries: Map<string, FabricIndexEntry>;
  answers: Record<string, string[]>;
  durationSeconds: number;
  autoSubmitted: boolean;
  objectiveLabels: (id: ObjectiveId | null, domain: string | null) => string;
  subjectLabels: (id: SubjectId) => string;
}): SessionResult {
  const perQuestion: Record<string, boolean> = {};
  const objectiveItems: { key: string; label: string; correct: boolean }[] = [];
  const subjectItems: { key: string; label: string; correct: boolean }[] = [];
  const typeItems: { key: string; label: string; correct: boolean }[] = [];
  let score = 0;

  for (const question of options.questions) {
    const result = grade(question, options.answers[question.id]);
    perQuestion[question.id] = result.correct;
    if (result.correct) score += 1;

    const entry = options.entries.get(question.id);
    const objectiveKey = entry?.objectiveId ?? entry?.domain ?? "unmapped";
    objectiveItems.push({
      key: objectiveKey,
      label: options.objectiveLabels(entry?.objectiveId ?? null, entry?.domain ?? null),
      correct: result.correct,
    });
    subjectItems.push({
      key: entry?.subject ?? "unknown",
      label: options.subjectLabels(entry?.subject ?? "onelake"),
      correct: result.correct,
    });
    typeItems.push({
      key: question.type,
      label: question.type === "multi" ? "Multi-select" : question.type === "sequence" ? "Ordered sequence" : "Single answer",
      correct: result.correct,
    });
  }

  const total = options.questions.length;
  return {
    sessionId: options.sessionId,
    mode: options.mode,
    label: options.label,
    completedAt: new Date().toISOString(),
    durationSeconds: options.durationSeconds,
    autoSubmitted: options.autoSubmitted,
    score,
    total,
    percent: total ? Math.round((score / total) * 100) : 0,
    answers: options.answers,
    perQuestion,
    byObjective: bucketise(objectiveItems),
    bySubject: bucketise(subjectItems),
    byType: bucketise(typeItems),
  };
}

/** Countdown helpers; the timer is derived from an absolute deadline. */
export function secondsRemaining(deadlineAt: number | null, now: number): number | null {
  if (deadlineAt === null) return null;
  return Math.max(0, Math.round((deadlineAt - now) / 1000));
}

export function formatClock(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const rest = safe % 60;
  const body = `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  return hours > 0 ? `${hours}:${body}` : body;
}

/** Suggested pace: three minutes per question, matching the source package. */
export function suggestedMinutes(count: number) {
  return Math.max(5, Math.round(count * 1.5));
}
