// Scoring and session-construction tests against the real 834-question bank.
//
// This is the "every question is graded against its own recorded key" check:
// each question in `content/fabric/questions/*.json` is graded with its correct
// answer and with a deliberately damaged one, and both outcomes are asserted.

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  buildManifest,
  EMPTY_SNAPSHOT,
  formatClock,
  grade,
  gradeSession,
  optionOrderFor,
  secondsRemaining,
  seededShuffle,
  selectQuestionIds,
  suggestedMinutes,
} from "../../lib/fabric/engine.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CONTENT = path.join(ROOT, "content/fabric");

const readJson = (name) => JSON.parse(readFileSync(path.join(CONTENT, name), "utf8"));

const questions = readdirSync(path.join(CONTENT, "questions"))
  .filter((file) => file.endsWith(".json"))
  .flatMap((file) => JSON.parse(readFileSync(path.join(CONTENT, "questions", file), "utf8")));
const index = readJson("index.json");
const indexById = new Map(index.map((entry) => [entry.id, entry]));

const single = questions.find((question) => question.type === "single");
const multi = questions.find((question) => question.type === "multi" && question.correct.length === 3);
const sequence = questions.find((question) => question.type === "sequence");
const fiveOption = questions.find((question) => question.options.length === 5);
const withCase = questions.find((question) => question.caseStudyId);

test("a single-answer question is correct only for its one key", () => {
  const right = grade(single, [single.correct[0]]);
  assert.equal(right.correct, true);
  assert.deepEqual(right.missing, []);
  assert.deepEqual(right.extra, []);

  const wrong = grade(single, [single.options.find((option) => option.id !== single.correct[0]).id]);
  assert.equal(wrong.correct, false);
  assert.deepEqual(wrong.missing, [single.correct[0]]);
  assert.equal(wrong.extra.length, 1);

  // Selecting two options cannot be correct for a single-answer question.
  assert.equal(grade(single, single.options.slice(0, 2).map((option) => option.id)).correct, false);
});

test("a multi-select question requires an exact set", () => {
  const exact = grade(multi, multi.correct);
  assert.equal(exact.correct, true);

  const missingOne = grade(multi, multi.correct.slice(0, -1));
  assert.equal(missingOne.correct, false, "a partial answer is not correct");
  assert.equal(missingOne.missing.length, 1);

  const extraWrong = grade(multi, [
    ...multi.correct,
    multi.options.find((option) => !multi.correct.includes(option.id)).id,
  ]);
  assert.equal(extraWrong.correct, false);
  assert.equal(extraWrong.extra.length, 1);

  // Order of selection must not matter.
  assert.equal(grade(multi, [...multi.correct].reverse()).correct, true);
});

test("a sequence question requires the exact order", () => {
  assert.equal(grade(sequence, sequence.correct).correct, true);

  const swapped = [...sequence.correct];
  [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
  const result = grade(sequence, swapped);
  assert.equal(result.correct, false);
  assert.equal(result.wrongPositions.length, 2, "both swapped positions are reported");

  assert.equal(grade(sequence, [...sequence.correct].reverse()).correct, false);
  assert.equal(grade(sequence, sequence.correct.slice(0, 2)).correct, false, "a truncated order is wrong");
});

test("an empty response is never correct", () => {
  for (const question of questions) {
    assert.equal(grade(question, []).correct, false, `${question.id} empty`);
    assert.equal(grade(question, undefined).correct, false, `${question.id} undefined`);
  }
});

test("every one of the 834 questions scores its own key as correct", () => {
  let checked = 0;
  for (const question of questions) {
    const result = grade(question, question.correct);
    assert.equal(result.correct, true, `${question.id} (${question.type}) failed its own key`);
    checked += 1;
  }
  assert.equal(checked, 834);
});

test("every question rejects a deliberately broken key", () => {
  for (const question of questions) {
    let broken;
    if (question.type === "single") {
      broken = [question.options.find((option) => option.id !== question.correct[0]).id];
    } else if (question.type === "multi") {
      broken = question.correct.slice(0, -1);
    } else {
      broken = [...question.correct];
      [broken[0], broken[1]] = [broken[1], broken[0]];
    }
    assert.equal(grade(question, broken).correct, false, `${question.id} accepted a broken answer`);
  }
});

test("a five-option question grades using its real option ids", () => {
  assert.ok(fiveOption, "the bank contains five-option questions");
  assert.equal(fiveOption.options.length, 5);
  assert.equal(grade(fiveOption, fiveOption.correct).correct, true);
  const last = fiveOption.options[4].id;
  const alternative = fiveOption.correct[0] === last
    ? fiveOption.options[0].id
    : last;
  if (fiveOption.type === "single") {
    assert.equal(grade(fiveOption, [alternative]).correct, false);
  }
});

test("shuffled display order cannot change the verdict", () => {
  const shuffled = seededShuffle(single.options.map((option) => option.id), 42);
  assert.deepEqual([...shuffled].sort(), single.options.map((option) => option.id).sort());
  // Grading consumes option ids, never positions.
  assert.equal(grade(single, [single.correct[0]]).correct, true);
  assert.equal(grade(single, [shuffled[0]]).correct, shuffled[0] === single.correct[0]);
});

test("session grading aggregates by objective, subject and type", () => {
  const subset = [single, multi, sequence];
  const entries = new Map(subset.map((question) => [question.id, indexById.get(question.id)]));
  const result = gradeSession({
    sessionId: "test-session",
    mode: "guided",
    label: "Test",
    questions: subset,
    entries,
    answers: {
      [single.id]: single.correct,
      [multi.id]: multi.correct.slice(0, -1),
      [sequence.id]: sequence.correct,
    },
    durationSeconds: 90,
    autoSubmitted: false,
    objectiveLabels: (id, domain) => id ?? domain ?? "unmapped",
    subjectLabels: (id) => id,
  });

  assert.equal(result.total, 3);
  assert.equal(result.score, 2);
  assert.equal(result.percent, 67);
  assert.equal(result.perQuestion[multi.id], false);
  assert.equal(result.perQuestion[sequence.id], true);
  assert.equal(result.byType.find((bucket) => bucket.key === "multi").correct, 0);
  assert.equal(
    result.byObjective.reduce((sum, bucket) => sum + bucket.total, 0),
    3,
  );
});

test("session selection is deterministic, bounded and filter-aware", () => {
  const config = {
    mode: "mock",
    filter: { scopes: ["core"] },
    count: 20,
    minutes: 30,
    shuffleQuestions: true,
    shuffleOptions: true,
    seed: 123456,
  };

  const first = selectQuestionIds(config, index, EMPTY_SNAPSHOT);
  const second = selectQuestionIds(config, index, EMPTY_SNAPSHOT);
  assert.deepEqual(first, second, "the same seed rebuilds the same paper");
  assert.equal(first.length, 20);
  assert.equal(new Set(first).size, 20);
  for (const id of first) assert.equal(indexById.get(id).scope, "core");

  const other = selectQuestionIds({ ...config, seed: 654321 }, index, EMPTY_SNAPSHOT);
  assert.notDeepEqual(other, first, "a different seed produces a different paper");
});

test("selection respects every filter dimension", () => {
  const pack = index[0].pack;
  const byPack = selectQuestionIds(
    { mode: "topic", filter: { packs: [pack] }, count: 500, minutes: null, shuffleQuestions: false, shuffleOptions: false, seed: 7 },
    index,
    EMPTY_SNAPSHOT,
  );
  assert.ok(byPack.length > 0);
  for (const id of byPack) assert.equal(indexById.get(id).pack, pack);

  const byType = selectQuestionIds(
    { mode: "topic", filter: { types: ["sequence"] }, count: 500, minutes: null, shuffleQuestions: false, shuffleOptions: false, seed: 7 },
    index,
    EMPTY_SNAPSHOT,
  );
  assert.equal(byType.length, 8);
  for (const id of byType) assert.equal(indexById.get(id).type, "sequence");

  const byObjective = selectQuestionIds(
    { mode: "topic", filter: { objectives: ["3.2"] }, count: 500, minutes: null, shuffleQuestions: false, shuffleOptions: false, seed: 7 },
    index,
    EMPTY_SNAPSHOT,
  );
  assert.ok(byObjective.length > 0);
  for (const id of byObjective) assert.equal(indexById.get(id).objectiveId, "3.2");

  const learner = {
    attempted: new Set([index[0].id]),
    incorrect: new Set([index[0].id]),
    bookmarked: new Set(),
    flagged: new Set(),
    attempts: { [index[0].id]: 3 },
  };
  const unattempted = selectQuestionIds(
    { mode: "review", filter: { status: "unattempted" }, count: 500, minutes: null, shuffleQuestions: false, shuffleOptions: false, seed: 7 },
    index,
    learner,
  );
  assert.ok(!unattempted.includes(index[0].id));
  const repeated = selectQuestionIds(
    { mode: "review", filter: { status: "repeated" }, count: 500, minutes: null, shuffleQuestions: false, shuffleOptions: false, seed: 7 },
    index,
    learner,
  );
  assert.deepEqual(repeated, [index[0].id]);
});

test("selection clamps the requested count instead of padding it", () => {
  const ids = selectQuestionIds(
    { mode: "case", filter: { caseStudyId: index.find((entry) => entry.caseStudyId).caseStudyId }, count: 999, minutes: null, shuffleQuestions: true, shuffleOptions: true, seed: 3 },
    index,
    EMPTY_SNAPSHOT,
  );
  assert.ok(ids.length > 0 && ids.length < 999);
  for (const id of ids) assert.equal(indexById.get(id).caseStudyId, indexById.get(ids[0]).caseStudyId);
});

test("option order is deterministic, permutation-safe and never shuffles a sequence", () => {
  const subset = [single, multi, sequence];
  const order = optionOrderFor(subset, 99, true);
  const again = optionOrderFor(subset, 99, true);
  assert.deepEqual(order, again);
  for (const question of subset) {
    assert.deepEqual(
      [...order[question.id]].sort(),
      question.options.map((option) => option.id).sort(),
      `${question.id} order is a permutation`,
    );
  }
  assert.deepEqual(
    order[sequence.id],
    sequence.options.map((option) => option.id),
    "sequence questions keep their source order",
  );
  const unshuffled = optionOrderFor(subset, 99, false);
  assert.deepEqual(unshuffled[single.id], single.options.map((option) => option.id));
});

test("manifest identity and timers are stable", () => {
  const config = {
    mode: "mock",
    filter: {},
    count: 5,
    minutes: 15,
    shuffleQuestions: true,
    shuffleOptions: true,
    seed: 98765,
  };
  const ids = selectQuestionIds(config, index, EMPTY_SNAPSHOT);
  const manifest = buildManifest(config, ids);
  assert.equal(manifest.id, `fs-${(98765).toString(36)}-mock-5`);
  assert.equal(manifest.minutes, 15);
  assert.equal(manifest.questionIds.length, 5);
  assert.match(manifest.label, /simulation/i);

  assert.equal(secondsRemaining(null, 1000), null);
  assert.equal(secondsRemaining(10_000, 4_000), 6);
  assert.equal(secondsRemaining(10_000, 99_000), 0, "an expired deadline is zero, not negative");
  assert.equal(formatClock(0), "00:00");
  assert.equal(formatClock(65), "01:05");
  assert.equal(formatClock(3725), "1:02:05");
  assert.equal(suggestedMinutes(20), 30);
});

test("a case scenario stays with its questions", () => {
  assert.ok(withCase);
  const sameScenario = questions.filter((question) => question.caseStudyId === withCase.caseStudyId);
  assert.ok(sameScenario.length > 1);
  for (const question of sameScenario) {
    assert.equal(question.caseStudyId, withCase.caseStudyId);
    assert.ok(indexById.get(question.id).caseStudyId === withCase.caseStudyId);
  }
});
