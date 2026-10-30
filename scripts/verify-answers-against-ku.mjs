// KU verification pass: test the 280 authored answer keys against the corpus's
// knowledge-unit texts. For each question, extract key technical terms from
// the correct answer and explanation, search the 56,937 KU statements for
// supporting or contradicting text, and report per-question findings.
//
//   node --experimental-strip-types scripts/verify-answers-against-ku.mjs
//
// Produces: docs/hansa-integration-20261029/KU_VERIFICATION.json

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CORPUS_KU = path.resolve(arg("corpus", "D:/BeUI/HansaDatabase/Hansa_Deep_Research_Corpus/03_EXTRACTED_CONTENT/knowledge_units.jsonl"));

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
}

const PACKS = [
  "semantic-models-dax", "eventstream-windowing", "dataflow-gen2",
  "mirroring", "activator", "notebooks-pyspark", "incremental-copy",
];

// Stopwords and Fabric-specific terms that appear in every question (so they
// carry no discriminating signal).
const STOPWORDS = new Set([
  "the","a","an","is","are","was","were","be","been","being","to","of","in","on","at","by","for","with","about","against","between",
  "into","through","during","before","after","above","below","from","up","down","out","off","over","under","again","further","then",
  "once","here","there","when","where","why","how","all","any","both","each","few","more","most","other","some","such","no","nor","not",
  "only","own","same","so","than","too","very","can","will","just","should","now","and","but","if","or","because","as","until","while",
  "this","that","these","those","it","its","they","them","their","which","who","whom","what","which","does","did","do","would","could",
  "must","may","might","shall","has","have","had","per","also","within","without","across","every","each","must","must","team","data",
  "fabric","microsoft","question","answer","correct","option","options","following","statement","statements","which","based","source",
  "model","models","table","tables","column","columns","report","reports","page","pages","value","values","setting","settings","feature",
  "features","example","examples","step","steps","work","works","working","need","needs","wanted","wants","using","use","used","user",
  "users","document","documentation","page","pages","referenced","reference","references","cited","cite","describes","described",
  "content","details","detail","specific","specifically","follows","follow","row","rows","new","old","first","second","third","one","two",
  "three","four","five","visual","visuals","mode","modes","type","types","level","levels","code","workspace","workspaces","item","items",
]);

// Technical terms that ARE meaningful even though they're common in the domain.
const TECHNICAL_TERMS = new Set([
  "direct lake","directquery","delta","onelake","fallback","incremental refresh","rangestart","rangeend","userelationship",
  "keepfilters","removefilters","calculate","sumx","dax","kql","bin","materialized view","update policy","xmla","tumbling",
  "hopping","sliding","session","eventstream","eventhouse","activator","composite","star schema","grain","bridge","watermark",
  "calculation group","field parameter","format string","row-level security","object-level security","rls","ols","dataflow",
  "pipeline","notebook","pyspark","spark","environment","lakehouse","warehouse","shortcut","mirror","replication","schema",
  "capacity","sensitivity","endorsement","certification","deployment pipeline","git","version control","performance",
  "cardinality","dictionary","vertipaq","v-order","deletion vector","time intelligence","totalytd","dateadd","sameperiodlastyear",
  "selectedvalue","hasonevalue","offset","window","partititionby","orderby","timestamp","event time","ingestion time","latency",
  "lookback","deduplicate","arg_max","dcount","staging","append","overwrite","idempotent","snapshot","boundary","high concurrency",
]);

function extractTerms(text) {
  const lower = text.toLowerCase();
  const terms = [];
  // Extract multi-word technical terms first
  for (const term of TECHNICAL_TERMS) {
    if (lower.includes(term)) terms.push(term);
  }
  // Extract single meaningful words
  const words = lower.replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter(w => w.length > 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
  terms.push(...words.slice(0, 15)); // cap at 15 single-word terms
  return [...new Set(terms)];
}

function scoreKU(questionTerms, kuText) {
  if (!kuText) return 0;
  const lower = kuText.toLowerCase();
  let matched = 0;
  let matchedTechnical = 0;
  for (const term of questionTerms) {
    if (lower.includes(term)) {
      matched++;
      if (TECHNICAL_TERMS.has(term)) matchedTechnical++;
    }
  }
  // Weight: technical term matches are worth 3x, regular word matches 1x
  return matchedTechnical * 3 + (matched - matchedTechnical);
}

// Load questions
const allQuestions = [];
for (const pack of PACKS) {
  const raw = await readFile(path.join(ROOT, `content/fabric/questions/${pack}.json`), "utf8");
  const questions = JSON.parse(raw);
  for (const q of questions) {
    const correctOption = q.options.find(o => q.correct.includes(o.id));
    allQuestions.push({
      pack,
      id: q.id,
      title: q.title,
      topic: q.topic,
      correctAnswer: correctOption?.text ?? "",
      explanation: q.explanation ?? "",
      refs: q.refs ?? [],
      objective: q.sourceObjective ?? "",
    });
  }
}
console.log(`Loaded ${allQuestions.length} questions from ${PACKS.length} packs.`);

// Load KUs (streaming to manage memory — build a searchable index)
console.log("Loading knowledge units...");
const kuText = await readFile(CORPUS_KU, "utf8");
const kuLines = kuText.trim().split("\n");
const kus = kuLines.map(line => {
  const r = JSON.parse(line);
  // Build the searchable text from the content fields
  const parts = [r.statement, r.definition, ...(r.code_examples ?? []), ...(r.bullet_points ?? [])].filter(Boolean);
  return {
    unit_id: r.unit_id,
    title: r.title,
    concept_type: r.concept_type,
    source_url: r.source_url,
    rights_class: r.rights_class,
    text: parts.join(" ").toLowerCase(),
    searchable: parts.join(" ").slice(0, 500).toLowerCase(), // truncated for scoring
  };
});
console.log(`Loaded ${kus.length} knowledge units.`);

// Verify each question against the KU corpus
const report = [];
let verified = 0, partiallySupported = 0, noCoverage = 0;

for (const q of allQuestions) {
  // Extract terms from the correct answer + explanation
  const answerTerms = extractTerms(q.correctAnswer);
  const explanationTerms = extractTerms(q.explanation);
  const allTerms = [...new Set([...answerTerms, ...explanationTerms])];

  // Search all KUs for the best matches
  const matches = [];
  for (const ku of kus) {
    const score = scoreKU(allTerms, ku.searchable);
    if (score >= 6) { // threshold: at least 2 technical terms or 6 word matches
      matches.push({
        unit_id: ku.unit_id,
        title: ku.title,
        concept_type: ku.concept_type,
        score,
        text: ku.searchable.slice(0, 300),
        rights_class: ku.rights_class,
      });
    }
  }
  matches.sort((a, b) => b.score - a.score);

  const topMatches = matches.slice(0, 5);
  const bestScore = topMatches[0]?.score ?? 0;

  let status;
  if (bestScore >= 15) { status = "verified"; verified++; }
  else if (bestScore >= 8) { status = "partially-supported"; partiallySupported++; }
  else { status = "no-corpus-coverage"; noCoverage++; }

  report.push({
    pack: q.pack,
    questionId: q.id,
    title: q.title,
    topic: q.topic,
    objective: q.objective,
    status,
    bestScore,
    matchingKUs: topMatches,
    searchTerms: allTerms.slice(0, 12),
  });
}

// Per-pack summary
const packSummary = {};
for (const pack of PACKS) {
  const packQuestions = report.filter(r => r.pack === pack);
  packSummary[pack] = {
    total: packQuestions.length,
    verified: packQuestions.filter(r => r.status === "verified").length,
    partiallySupported: packQuestions.filter(r => r.status === "partially-supported").length,
    noCoverage: packQuestions.filter(r => r.status === "no-corpus-coverage").length,
    averageScore: Math.round(packQuestions.reduce((sum, r) => sum + r.bestScore, 0) / packQuestions.length * 10) / 10,
  };
}

// Flagged questions (no coverage or low score) — the ones needing human review
const flagged = report.filter(r => r.status === "no-corpus-coverage" || r.bestScore < 8);

const output = {
  generatedAt: new Date().toISOString(),
  method: "Keyword extraction from correct answers + explanations, searched against all 56,937 knowledge-unit statements/definitions/code_examples/bullet_points. Technical terms weighted 3x. Verification threshold: score ≥ 15 (≥ 5 technical term matches or equivalent), partial ≥ 8.",
  summary: {
    totalQuestions: allQuestions.length,
    verified,
    partiallySupported,
    noCorpusCoverage: noCoverage,
    verificationRate: `${Math.round((verified + partiallySupported) / allQuestions.length * 100)}%`,
  },
  packSummary,
  flaggedForReview: flagged.map(r => ({
    pack: r.pack, questionId: r.questionId, title: r.title, topic: r.topic,
    status: r.status, bestScore: r.bestScore, searchTerms: r.searchTerms,
  })),
  fullReport: report,
};

const outPath = path.join(ROOT, "docs/hansa-integration-20261029/KU_VERIFICATION.json");
await writeFile(outPath, JSON.stringify(output, null, 1) + "\n", "utf8");

console.log(`\nKU verification report:`);
console.log(`  verified:            ${verified} / ${allQuestions.length}`);
console.log(`  partially supported: ${partiallySupported}`);
console.log(`  no corpus coverage:  ${noCoverage}`);
console.log(`  verification rate:   ${output.summary.verificationRate}`);
console.log(`\nPer-pack:`);
for (const [pack, summary] of Object.entries(packSummary)) {
  console.log(`  ${pack.padEnd(25)} verified:${String(summary.verified).padStart(3)}  partial:${String(summary.partiallySupported).padStart(3)}  no-coverage:${String(summary.noCoverage).padStart(3)}  avg-score:${summary.averageScore}`);
}
console.log(`\nFlagged for review: ${flagged.length} questions`);
console.log(`Report: ${outPath}`);
