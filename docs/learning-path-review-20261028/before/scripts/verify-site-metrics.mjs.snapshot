// Verifies `lib/site-metrics.ts` against the content it claims to describe.
//
// The homepage and both catalogues print these numbers without importing the
// heavy curriculum/statistics modules, so this script is what keeps the literals
// honest. It reads the same source files the modules read, and the same export
// arrays the modules build.
//
//   node scripts/verify-site-metrics.mjs
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const read = (relative) => readFile(path.join(ROOT, relative), "utf8");
const readJson = async (relative) => JSON.parse(await read(relative));

/** Body of `export const NAME = [ … ]`, brace-aware so nested arrays are safe. */
function arrayBody(source, name) {
  const start = source.indexOf(`export const ${name}`);
  if (start === -1) throw new Error(`export const ${name} not found`);
  const open = source.indexOf("= [", start) + 2;
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "[") depth += 1;
    else if (source[index] === "]") {
      depth -= 1;
      if (depth === 0) return source.slice(open, index);
    }
  }
  throw new Error(`unterminated array for ${name}`);
}

const count = (body, pattern) => (body.match(new RegExp(pattern, "g")) ?? []).length;

const metricsSource = await read("lib/site-metrics.ts");
const metrics = {};
for (const [, key, value] of metricsSource.matchAll(/^\s{4}(\w+): (\d+),$/gm)) {
  metrics[key] = Number(value);
}

const curriculum = await readJson("content/data-viz/curriculum.json");
const pages = await readJson("content/data-viz/pages.json");
const dataVizLabs = await read("lib/data-viz/labs.ts");
const practice = await read("lib/data-viz/practice.ts");
const statistics = await read("lib/statistics/content.ts");
const fabricMeta = await readJson("content/fabric/meta.json");
const fabricSources = await readJson("content/fabric/sources.json");

const examFiles = (await readdir(path.join(ROOT, "content/exams"))).filter((file) => file.endsWith(".json"));
const exams = await Promise.all(examFiles.map((file) => readJson(`content/exams/${file}`)));

const actual = {
  chapters: curriculum.chapters.length,
  sourcePages: pages.length,
  englishLessons: curriculum.lessons.filter((lesson) => lesson.section === "en").length,
  arabicLessons: curriculum.lessons.filter((lesson) => lesson.section === "ar").length,
  chartLabs: count(arrayBody(dataVizLabs, "CHART_LABS"), 'type: "'),
  scenarios: count(arrayBody(practice, "PRACTICE_QUESTIONS"), 'id: "'),
  sections: count(arrayBody(statistics, "SECTIONS"), "number: \\d+"),
  journeys: count(arrayBody(statistics, "JOURNEYS"), 'slug: "'),
  labs: count(arrayBody(statistics, "LABS"), 'slug: "'),
  generalBanks: exams.length,
  generalQuestions: exams.reduce((sum, exam) => sum + exam.questions.length, 0),
  fabricQuestions: fabricMeta.counts.questions,
  fabricPacks: fabricMeta.counts.packs,
  fabricSources: fabricSources.length,
  fabricCases: fabricMeta.caseCount,
};

const problems = [];
for (const [key, value] of Object.entries(actual)) {
  if (metrics[key] === undefined) problems.push(`${key}: present in content (${value}) but missing from lib/site-metrics.ts`);
  else if (metrics[key] !== value) problems.push(`${key}: lib/site-metrics.ts says ${metrics[key]}, content says ${value}`);
}
for (const key of Object.keys(metrics)) {
  if (actual[key] === undefined) problems.push(`${key}: published but not verifiable — remove it or teach this script how to check it`);
}

console.log(`Site metrics: ${Object.keys(actual).length} values checked`);
for (const [key, value] of Object.entries(actual)) console.log(`  ${key.padEnd(16)} ${value}`);

if (problems.length) {
  console.log("RESULT: FAIL");
  for (const problem of problems) console.log(`  - ${problem}`);
  process.exitCode = 1;
} else {
  console.log("RESULT: PASS — every published count matches the content");
}
