import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  cleanText,
  cleanWhy,
  deriveExamInsight,
  deriveFabricInsight,
  explanationRejectsKey,
  QUESTION_INSIGHT_ID,
  sentence,
  UNVALIDATED_PACKS,
} from '../../lib/knowledge/question-insights.ts';
import { liveEdition, questionDailyGroup, shuffleDailyBank } from '../../lib/knowledge/daily-bank.ts';
import { SUBJECTS } from '../../lib/study/taxonomy.ts';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const release = read('content/knowledge/question-insights.json');
const sources = new Map(read('content/fabric/sources.json').map((s) => [s.id, s]));
const fabric = new Map(
  fs.readdirSync('content/fabric/questions').filter((f) => f.endsWith('.json'))
    .flatMap((f) => Object.values(read(path.join('content/fabric/questions', f))))
    .map((q) => [q.id, q]),
);
const banks = Object.fromEntries(['sql', 'statistics', 'power-bi', 'python', 'excel', 'fundamentals']
  .map((slug) => [slug, read(`content/exams/${slug}.json`)]));

test('every released Fabric insight re-derives byte-for-byte from its source question', () => {
  assert.equal(release.primary.length % 2, 0);
  for (const insight of release.primary) {
    const q = fabric.get(insight.questionIds[0]);
    assert.ok(q, insight.id);
    const d = deriveFabricInsight(q, sources, release.checkedAt);
    assert.ok(d.ok, `${insight.id}: ${d.reason}`);
    assert.deepEqual(d.insight, insight, `${insight.id} is stale; rerun scripts/build-question-insights.mjs`);
  }
});

test('Fabric insight text is the question’s own wording, and the stated key is the keyed option', () => {
  for (const insight of release.primary) {
    const q = fabric.get(insight.questionIds[0]);
    const keyed = q.options.find((o) => o.id === q.correct[0]);
    assert.equal(insight.scenario, cleanText(q.prompt));
    assert.equal(insight.takeaway, cleanText(q.explanation));
    assert.ok(insight.caveat.startsWith(`Answer key: ${sentence(cleanText(keyed.text))}`), insight.id);
    const trap = q.options.find((o) => insight.prediction === `Consider this answer: ${cleanText(o.text)}`);
    assert.ok(trap && !q.correct.includes(trap.id), `${insight.id}: distractor is not a wrong option`);
    assert.ok(insight.caveat.endsWith(sentence(cleanWhy(trap.why))), insight.id);
    assert.ok(insight.sourceUrl.startsWith('https://learn.microsoft.com/'), insight.id);
    assert.equal(insight.practiceHref, `/lab/dp-600/explore/?question=${encodeURIComponent(q.id)}`);
  }
});

test('analyst insights re-derive from their bank and state the bank’s key', () => {
  for (const insight of release.secondary) {
    const [slug, qid] = insight.sourceId.split(' / ');
    const bank = banks[slug];
    const q = bank.questions.find((x) => x.id === qid);
    const d = deriveExamInsight(bank, q, release.checkedAt);
    assert.ok(d.ok, insight.id);
    assert.deepEqual(d.insight, insight, `${insight.id} is stale`);
    const key = q.type === 'boolean' ? (q.answer ? 'True' : 'False') : cleanText(q.options[q.answer]);
    assert.equal(insight.caveat, `Answer key: ${sentence(key)}`);
    assert.equal(insight.takeaway, cleanText(q.explanation));
  }
});

test('release excludes unvalidated packs and keys their own explanation rejects', () => {
  for (const insight of release.primary) {
    const q = fabric.get(insight.questionIds[0]);
    assert.ok(!UNVALIDATED_PACKS.includes(q.pack), insight.id);
    assert.ok(!explanationRejectsKey(q), insight.id);
  }
  const broken = fabric.get('fb-patrick-024');
  assert.ok(explanationRejectsKey(broken));
  const d = deriveFabricInsight({ ...broken, pack: 'fixture' }, sources, '2026-11-17');
  assert.equal(d.ok, false);
  assert.equal(d.reason, 'explanation calls the keyed option wrong');
});

test('ids are unique, labelled and link to real topic desks', () => {
  const all = [...release.primary, ...release.secondary];
  assert.equal(new Set(all.map((i) => i.id)).size, all.length);
  const desks = new Set(SUBJECTS.flatMap((s) => s.topics.map(([t]) => `/learn/${s.id}/${t}/`)));
  for (const i of all) {
    assert.match(i.id, QUESTION_INSIGHT_ID);
    assert.equal(i.reviewStatus, 'technical_review');
    assert.ok(desks.has(i.lessonHref), `${i.id}: ${i.lessonHref}`);
    assert.doesNotMatch(`${i.title} ${i.scenario} ${i.takeaway} ${i.caveat}`, /\*\*|\.\.(?!\.)| {2}/, i.id);
  }
});

test('each day deals two primary and one secondary insight with no repeats on adjacent days', () => {
  const primary = shuffleDailyBank('fixture', Array.from({ length: 10 }, (_, i) => ({ id: `p${i}` })));
  const secondary = shuffleDailyBank('fixture/s', Array.from({ length: 4 }, (_, i) => ({ id: `s${i}` })));
  const day = (i) => new Date(Date.UTC(2026, 10, 18 + i)).toISOString().slice(0, 10);
  assert.deepEqual(questionDailyGroup(primary, secondary, '2026-11-18', '2026-11-17'), []);
  assert.deepEqual(questionDailyGroup(primary, secondary, '2026-11-18', '2026-02-30'), []);
  for (let i = 0; i < 40; i++) {
    const today = questionDailyGroup(primary, secondary, '2026-11-18', day(i));
    const next = questionDailyGroup(primary, secondary, '2026-11-18', day(i + 1));
    assert.equal(today.length, 3);
    assert.ok(today[0].id.startsWith('p') && today[1].id.startsWith('p') && today[2].id.startsWith('s'));
    assert.equal(new Set([...today, ...next].map((x) => x.id)).size, 6);
  }
});

test('dates before the release keep their frozen legacy editions', () => {
  const decks = {
    legacy: { '2026-11-17': [{ id: 'legacy-a' }, { id: 'legacy-b' }, { id: 'legacy-c' }] },
    primary: [{ id: 'p0' }, { id: 'p1' }],
    secondary: [{ id: 's0' }],
    startsOn: '2026-11-18',
  };
  assert.deepEqual(liveEdition(decks, '2026-11-17').map((x) => x.id), ['legacy-a', 'legacy-b', 'legacy-c']);
  assert.deepEqual(liveEdition(decks, '2026-11-18').map((x) => x.id), ['p0', 'p1', 's0']);
  assert.deepEqual(liveEdition(decks, '2026-11-01'), []);
});
