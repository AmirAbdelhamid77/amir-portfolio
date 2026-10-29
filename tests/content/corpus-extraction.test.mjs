// Integrity tests for the corpus extraction wave: the mirrored Academy
// courseware and the two disabled review banks. These guard the rights and
// review discipline: MIT attribution on every lesson, and no answer key ever
// shipped in a grading-disabled draft.
//
//   npm run test:content
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "node:module";
import { test } from "node:test";
register("../../scripts/study-loader.mjs", import.meta.url);
import { ACADEMY_LESSONS, ACADEMY_TRACKS } from "../../lib/academy/corpus.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (p) => JSON.parse(readFileSync(path.join(ROOT, p), "utf8"));
const kengio = readJson("content/drafts/kengio-dp700.json");
const candidates = readJson("content/drafts/corpus-candidates.json");

test("the Academy mirrors the MIT courseware with attribution on every lesson", () => {
  assert.ok(ACADEMY_TRACKS.length === 2, "two tracks (mslearn-fabric, PL-300)");
  assert.ok(ACADEMY_LESSONS.length >= 70, "the courseware extraction stays substantial");
  for (const lesson of ACADEMY_LESSONS) {
    assert.match(lesson.sourcePath, /^Instructions\//, `${lesson.slug} names its source path`);
    assert.match(lesson.githubUrl, /^https:\/\/github\.com\/MicrosoftLearning\//, `${lesson.slug} links its source`);
    assert.ok(lesson.blocks.length > 0, `${lesson.slug} has content`);
    for (const block of lesson.blocks) {
      assert.ok(["p", "note", "h2", "h3", "h4", "code", "ol", "ul", "table", "image"].includes(block.type),
        `${lesson.slug} block type ${block.type} is known`);
      if (block.type === "image") assert.match(block.href, /^https:\/\/github\.com\//, `${lesson.slug} figures link to source`);
    }
  }
  const slugs = new Set(ACADEMY_LESSONS.map((lesson) => `${lesson.track}/${lesson.slug}`));
  assert.equal(slugs.size, ACADEMY_LESSONS.length, "lesson slugs are unique per track");
});

test("draft banks ship no answer keys and keep grading disabled", () => {
  for (const [name, bank] of [["kengio", kengio], ["candidates", candidates]]) {
    assert.equal(bank.gradingEnabled, false, `${name} grading disabled`);
    assert.equal(bank.answersShipped, false, `${name} ships no answers`);
    for (const question of bank.questions) {
      for (const key of Object.keys(question)) {
        assert.ok(!/^(correctAnswer|correct|explanation|shortAnswer)$/i.test(key),
          `${name}/${question.draftId} carries no answer field "${key}"`);
      }
      assert.ok(question.stem?.trim(), `${name}/${question.draftId} has a stem`);
      assert.ok(question.options.length >= 2, `${name}/${question.draftId} has options`);
      for (const option of question.options) assert.ok(option.text?.trim(), `${name}/${question.draftId} option text`);
    }
  }
  assert.equal(kengio.questions.length, 150, "150 kengio questions");
  assert.equal(candidates.questions.length, 37, "37 corpus candidates (deduplicated)");
});

test("kengio attribution and candidate provenance name their sources", () => {
  assert.match(kengio.note, /MIT/);
  assert.match(kengio.source.archive, /kengio\/dp-700-study-guide/);
  assert.match(kengio.statusLabel, /keys stay at the source/);
  assert.match(candidates.note, /no answer keys/);
});

test("both banks appear once in the review inventory with disabled grading", async () => {
  const { reviewRecords } = await import("../../lib/study/review.ts");
  const records = reviewRecords();
  const kengioRecords = records.filter((r) => r.source?.startsWith?.("kengio-dp700"));
  const candidateRecords = records.filter((r) => r.source?.startsWith?.("corpus-candidates"));
  assert.equal(kengioRecords.length, 150, "kengio in the review inventory");
  assert.equal(candidateRecords.length, 37, "candidates in the review inventory");
});
