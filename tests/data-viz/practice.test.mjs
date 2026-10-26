import assert from "node:assert/strict";
import test from "node:test";
import { PRACTICE_QUESTIONS } from "../../lib/data-viz/practice.ts";

test("the practice bank has twelve questions with four options each", () => {
  assert.equal(PRACTICE_QUESTIONS.length, 12);
  for (const question of PRACTICE_QUESTIONS) {
    assert.equal(question.options.length, 4, `${question.id}: expected four options`);
    assert.ok(question.prompt.length > 40, `${question.id}: prompt is too thin`);
    assert.ok(question.explanation.length > 80, `${question.id}: explanation is too thin`);
  }
});

test("every correct index points at a real option", () => {
  for (const question of PRACTICE_QUESTIONS) {
    assert.ok(Number.isInteger(question.answer), `${question.id}: answer is not an integer`);
    assert.ok(question.answer >= 0 && question.answer < question.options.length, `${question.id}: answer index out of range`);
  }
});

test("ids and questions are unique", () => {
  assert.equal(new Set(PRACTICE_QUESTIONS.map((question) => question.id)).size, PRACTICE_QUESTIONS.length);
  assert.equal(new Set(PRACTICE_QUESTIONS.map((question) => question.prompt)).size, PRACTICE_QUESTIONS.length);
});

test("chapter links stay inside the curriculum and lab links resolve", () => {
  const chapters = new Set(["02", "03", "05", "06", "07", "08", "09", "10"]);
  for (const question of PRACTICE_QUESTIONS) {
    assert.ok(chapters.has(question.chapter), `${question.id}: unknown chapter ${question.chapter}`);
    assert.match(question.chapterHref, /^\/learn\//, `${question.id}: chapter link is not a learn route`);
    if (question.lab) {
      assert.match(question.lab.href, /^\/(explore|learn|practice)\//, `${question.id}: lab link is not internal`);
      assert.ok(question.lab.label.length > 0);
    }
  }
});

test("all ten chapters' topics are represented", () => {
  const covered = new Set(PRACTICE_QUESTIONS.map((question) => question.chapter));
  assert.deepEqual([...covered].sort(), ["02", "03", "05", "06", "07", "08", "09", "10"]);
});
