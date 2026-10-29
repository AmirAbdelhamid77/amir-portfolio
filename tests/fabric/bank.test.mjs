// Integrity tests for the imported Microsoft Fabric bank.
//
// These read the generated content layer (`content/fabric/`) the way the site
// does, and compare it against the declared package figures. They are the
// automated form of the "834 imported once, and only once" requirement.
//
//   npm run test:fabric

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { buildCoverage, classify } from "../../lib/fabric/classify.ts";
import { OBJECTIVES, SUBJECTS } from "../../lib/fabric/taxonomy.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CONTENT = path.join(ROOT, "content/fabric");

const readJson = (name) => JSON.parse(readFileSync(path.join(CONTENT, name), "utf8"));

const packs = readJson("packs.json");
const index = readJson("index.json");
const cases = readJson("cases.json");
const sources = readJson("sources.json");
const meta = readJson("meta.json");
const questions = readdirSync(path.join(CONTENT, "questions"))
  .filter((file) => file.endsWith(".json"))
  .flatMap((file) => JSON.parse(readFileSync(path.join(CONTENT, "questions", file), "utf8")));

const byId = new Map(questions.map((question) => [question.id, question]));

// The corpus wave (hansa-integration phase C) added the authored
// semantic-models-dax pack on top of the 834-question deployment package, so
// the baseline assertions run against the original 18 packs and the merged
// totals are asserted beside them.
const CORPUS_PACKS = ["semantic-models-dax", "eventstream-windowing", "dataflow-gen2", "mirroring", "activator", "notebooks-pyspark", "incremental-copy"];
const isCorpus = (question) => CORPUS_PACKS.includes(question.pack);
const baseline = questions.filter((question) => !isCorpus(question));

test("the declared baseline counts are reproduced exactly", () => {
  assert.equal(baseline.length, 834, "834 baseline questions");
  const baselineTypes = baseline.reduce((map, question) => {
    map[question.type] = (map[question.type] ?? 0) + 1;
    return map;
  }, {});
  assert.equal(baselineTypes.single, 658);
  assert.equal(baselineTypes.multi, 168);
  assert.equal(baselineTypes.sequence, 8);

  const five = baseline.filter((question) => question.options.length === 5).length;
  assert.equal(five, 52, "52 baseline questions with five options");

  const withCase = baseline.filter((question) => question.caseStudyId).length;
  assert.equal(withCase, 343, "343 baseline questions carrying case context");

  const withCode = baseline.filter((question) => question.code.trim().length > 0).length;
  assert.equal(withCode, 11, "11 baseline questions with a code snippet");
});

test("the merged bank carries the corpus waves on top of the baseline", () => {
  assert.equal(questions.length, 1114, "1114 merged questions");
  assert.equal(packs.length, 25, "25 packs");
  assert.equal(index.length, 1114, "1114 index entries");
  assert.equal(sources.length, 378, "378 registry entries");
  assert.equal(cases.length, 78, "78 case studies");
  const corpus = questions.filter((question) => isCorpus(question));
  assert.equal(corpus.length, 280, "280 corpus questions (7 authored packs × 40)");
  for (const packKey of CORPUS_PACKS) {
    assert.ok(meta.corpusWaves?.some((wave) => wave.pack === packKey && wave.integrity?.failures?.length === 0),
      `${packKey} records a clean import`);
  }
});

test("every question is imported once, under a unique namespaced id", () => {
  const ids = new Set();
  for (const question of questions) {
    assert.ok(!ids.has(question.id), `duplicate ${question.id}`);
    ids.add(question.id);
    assert.match(question.id, /^fb-[a-z0-9-]+$/, `${question.id} is namespaced`);
    assert.equal(question.id, `fb-${question.sourceId.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
  }
  assert.equal(ids.size, 1114);

  // The namespace must not collide with the existing Data Lab ids.
  const examIds = readdirSync(path.join(ROOT, "content/exams"))
    .filter((file) => file.endsWith(".json"))
    .flatMap((file) => JSON.parse(readFileSync(path.join(ROOT, "content/exams", file), "utf8")).questions.map((q) => q.id));
  for (const id of examIds) assert.ok(!ids.has(id), `collision with Data Lab id ${id}`);
});

test("each question keeps a valid answer key, rationales and explanation", () => {
  for (const question of questions) {
    assert.ok(question.prompt.trim().length > 0, `${question.id} prompt`);
    assert.ok(question.title.trim().length > 0, `${question.id} title`);
    assert.ok(question.explanation.trim().length > 0, `${question.id} explanation`);
    assert.ok(question.options.length >= 4, `${question.id} has at least four options`);

    const optionIds = question.options.map((option) => option.id);
    assert.equal(new Set(optionIds).size, optionIds.length, `${question.id} option ids are unique`);
    for (const option of question.options) {
      assert.ok(option.text.trim().length > 0, `${question.id}/${option.id} text`);
      assert.ok(option.why.trim().length > 0, `${question.id}/${option.id} rationale`);
    }

    assert.ok(question.correct.length > 0, `${question.id} has an answer key`);
    assert.equal(new Set(question.correct).size, question.correct.length, `${question.id} key has no repeats`);
    for (const key of question.correct) {
      assert.ok(optionIds.includes(key), `${question.id} key ${key} is an option`);
    }

    if (question.type === "single") assert.equal(question.correct.length, 1, `${question.id} single cardinality`);
    if (question.type === "multi") assert.ok(question.correct.length >= 2, `${question.id} multi cardinality`);
    if (question.type === "sequence") {
      assert.equal(question.correct.length, optionIds.length, `${question.id} sequence covers every option`);
      assert.deepEqual(
        [...question.correct].sort(),
        [...optionIds].sort(),
        `${question.id} sequence key is a permutation`,
      );
    }
  }
});

test("source references resolve to the registry", () => {
  const registryIds = new Set(sources.map((source) => source.id));
  assert.equal(registryIds.size, 378);
  for (const question of questions) {
    assert.ok(Array.isArray(question.refs));
    for (const ref of question.refs) {
      assert.ok(registryIds.has(ref), `${question.id} cites missing reference ${ref}`);
    }
  }
  for (const source of sources) {
    assert.match(source.url, /^https:\/\//, `${source.id} is an https link`);
    assert.ok(source.title.trim().length > 0);
  }
});

test("case studies keep their text and link every question they own", () => {
  for (const study of cases) {
    assert.ok(study.title.trim().length > 0);
    assert.ok(study.text.trim().length > 0);
    assert.ok(study.questionIds.length > 0, `${study.id} owns at least one question`);
    for (const id of study.questionIds) {
      const question = byId.get(id);
      assert.ok(question, `${study.id} points at ${id}`);
      assert.equal(question.caseStudyId, study.id, `${id} back-references ${study.id}`);
    }
  }
  const shared = cases.filter((study) => study.questionIds.length > 1);
  assert.ok(shared.length > 0, "some scenarios are shared");
  const largest = Math.max(...cases.map((study) => study.questionIds.length));
  assert.equal(largest, 24, "the largest shared scenario keeps all 24 questions");
});

test("the index is a faithful projection of the raw records", () => {
  assert.equal(index.length, questions.length);
  for (const entry of index) {
    const question = byId.get(entry.id);
    assert.ok(question, `${entry.id} exists in a pack`);
    assert.equal(entry.sourceId, question.sourceId);
    assert.equal(entry.pack, question.pack);
    assert.equal(entry.type, question.type);
    assert.equal(entry.optionCount, question.options.length);
    assert.equal(entry.answerCount, question.correct.length);
    assert.equal(entry.caseStudyId, question.caseStudyId);
    assert.equal(entry.videoSeconds, question.videoSeconds);
    assert.ok(entry.prompt.length > 0);
    assert.ok(SUBJECTS.some((subject) => subject.id === entry.subject), `${entry.id} primary subject`);
    for (const subject of entry.subjects) {
      assert.ok(SUBJECTS.some((item) => item.id === subject));
    }
  }
});

test("classification is deterministic and reproducible from the raw record", () => {
  for (const entry of index) {
    const question = byId.get(entry.id);
    const again = classify({
      topic: question.topic,
      title: question.title,
      prompt: question.prompt,
      pack: question.pack,
      refs: question.refs,
      sourceObjective: question.sourceObjective,
    });
    assert.equal(again.subject, entry.subject, `${entry.id} subject is stable`);
    assert.equal(again.objectiveId, entry.objectiveId, `${entry.id} objective is stable`);
    assert.equal(again.domain, entry.domain, `${entry.id} domain is stable`);
    assert.equal(again.objectiveBasis, entry.objectiveBasis, `${entry.id} basis is stable`);
    assert.equal(again.scope, entry.scope, `${entry.id} scope is stable`);
    assert.equal(again.confidence, entry.confidence, `${entry.id} confidence is stable`);
  }
});

test("the shipped coverage report equals a fresh aggregation", () => {
  const fresh = buildCoverage(index, {
    packs: packs.map((pack) => ({ key: pack.key, label: pack.title })),
    sources: sources.length,
  });
  assert.deepEqual(fresh, meta.coverage, "content/fabric/meta.json is in sync with the index");

  const scopeTotal = fresh.byScope.reduce((sum, row) => sum + row.total, 0);
  assert.equal(scopeTotal, 1114, "every question has exactly one scope");

  const objectiveTotal = fresh.byObjective.reduce((sum, row) => sum + row.total, 0);
  assert.equal(objectiveTotal, 1114, "every question lands in exactly one objective bucket");

  const subjectTotal = fresh.bySubject.reduce((sum, row) => sum + row.total, 0);
  assert.equal(subjectTotal, 1114, "every question has exactly one primary subject");

  assert.equal(fresh.totals.objectivesCovered, OBJECTIVES.length);
  assert.equal(fresh.totals.core + fresh.totals.support + fresh.totals.adjacent + fresh.totals.review, 1114);
});

// F01 regression: the domain split and the sub-objective split must be two views
// of one partition. They previously disagreed (297/170/13 vs 347/125/8) because a
// topic-derived sub-objective could belong to a different domain than the one the
// source declared.
test("domain shares reconcile with the sub-objective table under one rule", () => {
  const domainOfObjective = new Map(OBJECTIVES.map((objective) => [objective.id, objective.domain]));

  for (const entry of index) {
    if (!entry.objectiveId) continue;
    assert.ok(entry.domain, `${entry.id} has an objective but no domain`);
    assert.equal(
      domainOfObjective.get(entry.objectiveId),
      entry.domain,
      `${entry.id} objective ${entry.objectiveId} belongs to the domain the record claims`,
    );
  }

  const { domainShares, byObjective, byBasis, totals } = meta.coverage;
  for (const domain of domainShares) {
    const subObjective = byObjective
      .filter((row) => row.key.startsWith(`${domain.domain}.`))
      .reduce((sum, row) => sum + row.core, 0);
    const domainOnly = byObjective.find((row) => row.key === domain.domain)?.core ?? 0;
    assert.equal(subObjective, domain.coreSubObjective, `domain ${domain.domain} sub-objective core`);
    assert.equal(domainOnly, domain.coreDomainOnly, `domain ${domain.domain} domain-only core`);
    assert.equal(domain.coreQuestions, subObjective + domainOnly, `domain ${domain.domain} total core`);
  }

  const coreByDomain = domainShares.reduce((sum, domain) => sum + domain.coreQuestions, 0);
  assert.equal(coreByDomain, totals.core, "domain core shares add up to the focused total");

  const basisTotal = byBasis.reduce((sum, row) => sum + row.total, 0);
  assert.equal(basisTotal, totals.questions, "objective-basis buckets cover every question");
  const basisCore = byBasis.reduce((sum, row) => sum + row.core, 0);
  assert.equal(basisCore, totals.core, "objective-basis core adds up to the focused total");
  const declared = byBasis.find((row) => row.basis === "declared")?.core ?? 0;
  assert.ok(declared < totals.core, "some focused questions rest on a derived or domain-only label");
});

test("difficulty metadata is only what the source supplied", () => {
  const baselineDifficulties = new Set(baseline.map((question) => question.difficulty));
  for (const value of baselineDifficulties) {
    assert.ok(value === null || value === 4 || value === 5, `unexpected baseline difficulty ${value}`);
  }
  const missing = baseline.filter((question) => question.difficulty === null).length;
  assert.equal(missing, 192, "the five original packs and foundation set carry no difficulty");
  for (const question of questions.filter((item) => isCorpus(item))) {
    assert.ok(question.difficulty >= 1 && question.difficulty <= 5, `${question.id} states a 1–5 difficulty`);
  }
});

test("questions without a video timestamp are the documented foundation set", () => {
  const withoutTime = questions.filter((question) => question.videoSeconds === null);
  assert.equal(withoutTime.length, 288, "8 baseline foundation questions + the 280 documentation-grounded corpus questions");
  for (const question of withoutTime) assert.equal(question.origin, "foundation");
  assert.ok(meta.integrity.warnings.every((warning) => warning.code === "no-video-timestamp"));
});

test("the import audit records no silent repair", () => {
  assert.deepEqual(meta.integrity.failures, []);
  assert.equal(meta.integrity.checksRun > 20000, true, "the audit ran thousands of checks");
  assert.equal(meta.packageQa.declaredCounts.totalQuestions, 834);
  assert.equal(meta.packageQa.declaredCounts.websiteQuestions, 192);
  assert.equal(meta.packageQa.declaredCounts.addedQuestions, 642);
  assert.equal(meta.packageQa.similarityCandidates, 1);
  assert.equal(meta.packageQa.adaptations.length, 1);
  assert.equal(meta.packageQa.adaptations[0].id, "V6-SEC-002");
});

test("classification labels stay inside their documented meaning", () => {
  for (const entry of index) {
    if (entry.scope === "core") {
      assert.ok(entry.confidence === "high" || entry.confidence === "medium");
    }
    if (entry.scope === "adjacent") {
      assert.equal(entry.confidence, "high", `${entry.id} adjacent questions are explicitly declared`);
    }
    if (entry.scope === "review") {
      assert.equal(entry.confidence, "low");
      assert.equal(entry.objectiveId, null, `${entry.id} review questions are not force-mapped`);
    }
  }

  // The semantic-model domain was the bank's thinnest (13 of 834 baseline
  // questions — the documented DP-600 gap). The corpus wave's authored pack
  // closes most of that gap; the guard keeps both facts true.
  const semantic = index.filter((entry) => entry.domain === "3");
  const semanticBaseline = baseline.filter((entry) => entry.domain === "3");
  assert.ok(semanticBaseline.length < 40, `baseline semantic-model coverage is genuinely thin (${semanticBaseline.length})`);
  assert.ok(semantic.length >= 36, `the corpus pack closes the semantic-model gap (${semantic.length} domain-3 questions)`);
});

test("pack metadata preserves the source video identity", () => {
  for (const pack of packs) {
    assert.ok(pack.questionCount > 0, `${pack.key} has questions`);
    if (CORPUS_PACKS.includes(pack.key)) {
      // The corpus packs are documentation-grounded, not video-derived.
      assert.equal(pack.video, null, `${pack.key} intentionally has no source video`);
      assert.equal(pack.chapterCount, 0, `${pack.key} has no video chapters`);
      continue;
    }
    assert.ok(pack.video?.id, `${pack.key} keeps a video id`);
    assert.ok(pack.video?.title, `${pack.key} keeps a video title`);
    assert.ok(pack.subjects.length > 0);
  }
  const total = packs.reduce((sum, pack) => sum + pack.questionCount, 0);
  assert.equal(total, 1114, "packs account for every question");
  const videoPacks = packs.filter((pack) => pack.video);
  assert.equal(new Set(videoPacks.map((pack) => pack.video.id)).size, 18, "18 distinct source videos");
});
