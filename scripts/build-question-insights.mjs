// Build the question-derived insight release (PRODUCT.md §6a).
//
//   node --experimental-strip-types scripts/build-question-insights.mjs
//
// Reads the validated practice banks, derives one insight per eligible
// question with lib/knowledge/question-insights.ts, picks a balanced release
// and writes:
//   content/knowledge/question-insights.json         the shipped release
//   content/knowledge/question-insights.report.json  every rejection and why
// The banks themselves are only read. Output is deterministic: running it
// twice on the same inputs produces byte-identical files.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  balancedSelection,
  deriveExamInsight,
  deriveFabricInsight,
  EXAM_SUBJECT,
  explanationRejectsKey,
  keyContradictsExplanation,
  UNVALIDATED_PACKS,
} from "../lib/knowledge/question-insights.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = (p) => JSON.parse(readFileSync(path.join(ROOT, p), "utf8"));

// Release identity. A new release gets a new version and a later start date;
// dates before `startsOn` keep showing whatever they showed before.
const RELEASE = {
  version: "hansa-question-insights-2026-11-18",
  startsOn: "2026-11-18",
  checkedAt: "2026-11-17",
  primaryLimit: 90, // two Fabric insights a day → 45 days before the deck repeats
  secondaryLimit: 45, // one analyst-subject insight a day
};

const sources = new Map(read("content/fabric/sources.json").map((s) => [s.id, s]));
const packDir = "content/fabric/questions";
const fabricQuestions = readdirSync(path.join(ROOT, packDir))
  .filter((f) => f.endsWith(".json"))
  .sort()
  .flatMap((f) => {
    const raw = read(`${packDir}/${f}`);
    return Array.isArray(raw) ? raw : Object.values(raw);
  });

const rejected = [];
const primaryPool = [];
for (const q of fabricQuestions) {
  const d = deriveFabricInsight(q, sources, RELEASE.checkedAt);
  if (d.ok) primaryPool.push({ id: d.insight.id, insight: d.insight, pack: q.pack });
  else rejected.push({ id: d.id, pool: "fabric", reason: d.reason });
}

const secondaryPool = [];
for (const slug of Object.keys(EXAM_SUBJECT).sort()) {
  const bank = read(`content/exams/${slug}.json`);
  for (const q of bank.questions) {
    const d = deriveExamInsight(bank, q, RELEASE.checkedAt);
    if (d.ok) secondaryPool.push({ id: d.insight.id, insight: d.insight, subject: d.subject });
    else rejected.push({ id: d.id, pool: "analyst", reason: d.reason });
  }
}

// Answer-key/explanation contradictions are reported across *every* pack,
// including the community packs that are excluded anyway, because they are
// defects in the practice bank itself.
const describe = (q, certainty) => ({
  id: q.id,
  pack: q.pack,
  certainty,
  keyed: q.correct.map((k) => `${k}: ${q.options.find((o) => o.id === k)?.text ?? "(missing)"}`),
  explanation: q.explanation,
  communityPack: UNVALIDATED_PACKS.includes(q.pack),
});
// "certain": the explanation names the keyed letter as wrong.
// "suspected": word-overlap screen only; many are false positives.
const contradictions = [
  ...fabricQuestions.filter((q) => q.correct?.length && explanationRejectsKey(q)).map((q) => describe(q, "certain")),
  ...fabricQuestions
    .filter((q) => q.type === "single" && q.correct?.length === 1 && !explanationRejectsKey(q) && keyContradictsExplanation(q))
    .map((q) => describe(q, "suspected")),
];

const primary = balancedSelection(primaryPool, (x) => `${x.insight.topic}|${x.pack}`, RELEASE.primaryLimit).map((x) => x.insight);
const secondary = balancedSelection(secondaryPool, (x) => x.subject, RELEASE.secondaryLimit).map((x) => x.insight);

if (primary.length < 6 || secondary.length < 3) {
  throw new Error(`Release too small: ${primary.length} Fabric / ${secondary.length} analyst insights.`);
}

const countBy = (items, key) =>
  Object.fromEntries(
    Object.entries(items.reduce((acc, item) => ((acc[key(item)] = (acc[key(item)] ?? 0) + 1), acc), {})).sort(),
  );

writeFileSync(
  path.join(ROOT, "content/knowledge/question-insights.json"),
  JSON.stringify({ ...RELEASE, primary, secondary }, null, 1) + "\n",
);

writeFileSync(
  path.join(ROOT, "content/knowledge/question-insights.report.json"),
  JSON.stringify(
    {
      version: RELEASE.version,
      inputs: { fabricQuestions: fabricQuestions.length, analystQuestions: rejected.filter((r) => r.pool === "analyst").length + secondaryPool.length },
      eligible: {
        fabric: primaryPool.length,
        fabricByTopic: countBy(primaryPool, (x) => x.insight.topic),
        analyst: secondaryPool.length,
        analystBySubject: countBy(secondaryPool, (x) => x.subject),
      },
      released: {
        fabric: primary.length,
        fabricByTopic: countBy(primary, (i) => i.topic),
        analyst: secondary.length,
        analystBySubject: countBy(secondary, (i) => i.topic),
      },
      rejectedByReason: countBy(rejected, (r) => `${r.pool}: ${r.reason}`),
      answerKeyContradictions: contradictions,
      rejected,
    },
    null,
    1,
  ) + "\n",
);

console.log(
  `Fabric: ${primaryPool.length} eligible of ${fabricQuestions.length}, ${primary.length} released. ` +
    `Analyst: ${secondaryPool.length} eligible, ${secondary.length} released. ` +
    `${contradictions.filter((c) => c.certainty === "certain").length} certain and ${contradictions.filter((c) => c.certainty === "suspected").length} suspected answer-key defects reported.`,
);
