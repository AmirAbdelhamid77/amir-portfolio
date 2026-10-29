// Inventories the content that a reorganization must not lose: assessment
// question IDs, answer-key digests, source references and browser persistence
// keys.
//
//   node scripts/inventory-content.mjs [output.json]
//   node scripts/inventory-content.mjs --compare <baseline.json>
//
// Answer keys are summarised by digest, never copied into the report, so the
// artifact is safe to commit and still detects a changed correct answer.
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const compareIndex = args.indexOf("--compare");
const comparePath = compareIndex === -1 ? null : path.resolve(args[compareIndex + 1]);
const outputPath = comparePath ? null : args.find((value) => !value.startsWith("--"));

function digest(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
}

async function readJson(relative) {
  return JSON.parse(await readFile(path.join(ROOT, relative), "utf8"));
}

// --- general analyst exams -------------------------------------------------
const EXAM_FILES = [
  "sql",
  "power-bi",
  "excel",
  "python",
  "statistics",
  "fundamentals",
];

const exams = [];
for (const slug of EXAM_FILES) {
  const bank = await readJson(`content/exams/${slug}.json`);
  exams.push({
    bank: slug,
    file: `content/exams/${slug}.json`,
    declaredSlug: bank.slug,
    questionCount: bank.questions.length,
    questionIds: bank.questions.map((question) => question.id),
    answerKeyDigest: digest(
      bank.questions.map((question) => [question.id, question.type, question.answer, question.tolerance ?? null]),
    ),
    optionCountDigest: digest(bank.questions.map((question) => [question.id, question.options?.length ?? 0])),
  });
}

// --- Fabric DP-600 bank ----------------------------------------------------
const fabricDir = path.join(ROOT, "content/fabric/questions");
const fabricFiles = (await readdir(fabricDir)).filter((name) => name.endsWith(".json")).sort();
const fabricPacks = [];
for (const name of fabricFiles) {
  const pack = JSON.parse(await readFile(path.join(fabricDir, name), "utf8"));
  const questions = Array.isArray(pack) ? pack : pack.questions;
  fabricPacks.push({
    pack: name.replace(/\.json$/, ""),
    questionCount: questions.length,
    questionIds: questions.map((question) => question.id),
    answerKeyDigest: digest(
      questions.map((question) => [question.id, question.type, question.correct ?? null]),
    ),
  });
}

const fabricIndex = await readJson("content/fabric/index.json");
const fabricMeta = await readJson("content/fabric/meta.json");
const fabricSources = await readJson("content/fabric/sources.json");

// --- Data-visualization + statistics content -------------------------------
const dataVizContent = await readFile(path.join(ROOT, "lib/data-viz/content.ts"), "utf8");
const statisticsContent = await readFile(path.join(ROOT, "lib/statistics/content.ts"), "utf8");
const dataVizPractice = await readFile(path.join(ROOT, "lib/data-viz/practice.ts"), "utf8");
const statisticsSource = await readFile(path.join(ROOT, "lib/statistics/source.ts"), "utf8");

function slugsFrom(source, pattern) {
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

// --- Browser persistence ---------------------------------------------------
const storageKeys = {
  lab: "amir-lab-v1",
  fabric: "amir-fabric-v1",
  theme: "amir-theme",
  accent: "amir-accent",
  fabricDerivedPrefixes: ["amir-fabric-v1-", "amir-fabric-v1"],
};

const inventory = {
  generatedAt: new Date().toISOString(),
  exams: {
    bankCount: exams.length,
    questionTotal: exams.reduce((sum, exam) => sum + exam.questionCount, 0),
    banks: exams,
  },
  fabric: {
    packCount: fabricPacks.length,
    questionTotal: fabricPacks.reduce((sum, pack) => sum + pack.questionCount, 0),
    packs: fabricPacks,
    indexCount: fabricIndex.length,
    indexDigest: digest(fabricIndex),
    metaTotals: fabricMeta.counts,
    coverageTotals: fabricMeta.coverage?.totals ?? null,
    domainShares: fabricMeta.coverage?.domainShares ?? null,
    sourceCount: fabricSources.length,
    sourceIds: fabricSources.map((source) => source.id),
    validationLabels: (fabricMeta.validationNotes ?? []).length,
  },
  dataViz: {
    chapterSlugs: slugsFrom(dataVizContent, /slug:\s*"([^"]+)"/g).slice(0, 200),
    practiceQuestionIds: slugsFrom(dataVizPractice, /id:\s*"([^"]+)"/g),
  },
  statistics: {
    sectionCount: (statisticsContent.match(/id:\s*"s\d+"/g) ?? []).length,
  },
  sourceFiles: {
    "lib/data-viz/content.ts": digest(dataVizContent.length),
    "lib/statistics/content.ts": digest(statisticsContent.length),
    "lib/statistics/source.ts": digest(statisticsSource.length),
  },
  storageKeys,
  queryParameters: {
    "/lab/dp-600/explore/": ["q", "search", "pack", "subject", "objective", "scope", "type", "status", "difficulty", "question"],
    "/lab/dp-600/{study,practice,mock,cases,review}/": ["session"],
    "/contact/": ["service"],
  },
};

const summary = {
  examBanks: inventory.exams.bankCount,
  generalQuestions: inventory.exams.questionTotal,
  fabricPacks: inventory.fabric.packCount,
  fabricQuestions: inventory.fabric.questionTotal,
  fabricSources: inventory.fabric.sourceCount,
  statisticsSections: inventory.statistics.sectionCount,
};

if (comparePath) {
  const baseline = JSON.parse(await readFile(comparePath, "utf8"));
  const problems = [];

  for (const bank of baseline.exams.banks) {
    const current = inventory.exams.banks.find((entry) => entry.bank === bank.bank);
    if (!current) {
      problems.push(`exam bank missing: ${bank.bank}`);
      continue;
    }
    const missing = bank.questionIds.filter((id) => !current.questionIds.includes(id));
    if (missing.length) problems.push(`exam ${bank.bank}: ${missing.length} question id(s) missing (${missing.slice(0, 5).join(", ")})`);
    if (current.answerKeyDigest !== bank.answerKeyDigest) problems.push(`exam ${bank.bank}: answer key digest changed`);
  }

  for (const pack of baseline.fabric.packs) {
    const current = inventory.fabric.packs.find((entry) => entry.pack === pack.pack);
    if (!current) {
      problems.push(`fabric pack missing: ${pack.pack}`);
      continue;
    }
    const missing = pack.questionIds.filter((id) => !current.questionIds.includes(id));
    if (missing.length) problems.push(`fabric ${pack.pack}: ${missing.length} question id(s) missing (${missing.slice(0, 5).join(", ")})`);
    if (current.answerKeyDigest !== pack.answerKeyDigest) problems.push(`fabric ${pack.pack}: answer key digest changed`);
  }

  const missingSources = baseline.fabric.sourceIds.filter((id) => !inventory.fabric.sourceIds.includes(id));
  if (missingSources.length) problems.push(`source references missing: ${missingSources.length}`);

  console.log(`Content parity: ${problems.length === 0 ? "PASS" : "FAIL"}`);
  for (const problem of problems) console.log(`  - ${problem}`);
  if (problems.length) process.exitCode = 1;
} else {
  const text = JSON.stringify(inventory, null, 2);
  if (outputPath) {
    await mkdir(path.dirname(path.resolve(outputPath)), { recursive: true });
    await writeFile(path.resolve(outputPath), text);
    console.log(`Content inventory written → ${outputPath}`);
  }
  console.log(JSON.stringify(summary, null, 2));
}
