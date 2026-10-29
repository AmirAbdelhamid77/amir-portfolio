// Merge a corpus-authored practice pack into the existing content/fabric bank.
//
//   node --experimental-strip-types scripts/import-corpus-pack.mjs \
//     --source content/intake/hansa-integration/packs/<pack-key>
//
// The original import (scripts/import-fabric-bank.mjs) reads the read-only
// deployment package and REWRITES content/fabric from scratch, with
// package-specific reconciliation checks baked in. Corpus-authored packs join
// the bank through this script instead: it validates the pack with the same
// structural rules, re-computes classification and coverage over the merged
// bank, and rewrites only the shared artifacts (index, packs, cases, sources,
// notes, id-map, meta, pack loaders). The original pack question files are
// never rewritten, and the original import's audit trail in meta.json
// (packageQa, integrity) is preserved verbatim.
//
// A structural defect stops the merge with a non-zero exit, mirroring the
// import script's discipline.

import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCoverage, classify } from "../lib/fabric/classify.ts";
import { OBJECTIVES } from "../lib/fabric/taxonomy.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "content/fabric");

const args = process.argv.slice(2);
function arg(name, fallback) {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
}

const SOURCE_DIR = path.resolve(
  arg("source", "content/intake/hansa-integration/packs/semantic-models-dax"),
);

const sha256 = (text) => createHash("sha256").update(text).digest("hex");
const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
const internalId = (sourceId) => `fb-${slugify(sourceId)}`;

const failures = [];
const warnings = [];
let checksRun = 0;
function check(condition, code, questionId, detail) {
  checksRun += 1;
  if (!condition) failures.push({ code, questionId, detail });
  return condition;
}
function warn(condition, code, questionId, detail) {
  checksRun += 1;
  if (!condition) warnings.push({ code, questionId, detail });
  return condition;
}

async function readJson(file) {
  const raw = await readFile(file, "utf8");
  return { raw, json: JSON.parse(raw) };
}

// ---------------------------------------------------------------------------
// Existing bank
// ---------------------------------------------------------------------------

const existingQuestions = [];
const questionDir = path.join(OUT, "questions");
for (const file of (await readdir(questionDir)).filter((f) => f.endsWith(".json"))) {
  const packQuestions = JSON.parse(await readFile(path.join(questionDir, file), "utf8"));
  existingQuestions.push(...packQuestions);
}
const existingIndex = JSON.parse(await readFile(path.join(OUT, "index.json"), "utf8"));
const existingPacks = JSON.parse(await readFile(path.join(OUT, "packs.json"), "utf8"));
const existingCases = JSON.parse(await readFile(path.join(OUT, "cases.json"), "utf8"));
const existingSources = JSON.parse(await readFile(path.join(OUT, "sources.json"), "utf8"));
const existingNotes = JSON.parse(await readFile(path.join(OUT, "notes.json"), "utf8"));
const existingIdMap = JSON.parse(await readFile(path.join(OUT, "id-map.json"), "utf8"));
const existingMeta = JSON.parse(await readFile(path.join(OUT, "meta.json"), "utf8"));

const existingRegistry = new Map(existingSources.map((entry) => [entry.id, entry]));
const existingIds = new Set(existingQuestions.map((question) => question.id));
const existingCaseIds = new Set(existingCases.map((entry) => entry.id));

// The bank on disk must be internally consistent before anything merges.
check(
  existingQuestions.length === existingIndex.length,
  "existing-count-mismatch",
  "-",
  `disk bank has ${existingQuestions.length} questions but ${existingIndex.length} index entries`,
);
check(
  existingMeta.counts.questions === existingQuestions.length,
  "existing-meta-mismatch",
  "-",
  `meta says ${existingMeta.counts.questions} questions, disk has ${existingQuestions.length}`,
);
check(existingMeta.integrity?.failures?.length === 0, "existing-import-dirty", "-", "the original import recorded integrity failures");

// ---------------------------------------------------------------------------
// Read the pack source
// ---------------------------------------------------------------------------

const packsFile = await readJson(path.join(SOURCE_DIR, "LAB_PACKS.merged.json"));
const sourcesFile = await readJson(path.join(SOURCE_DIR, "SOURCES.merged.json"));
const idMapFile = await readJson(path.join(SOURCE_DIR, "ID_MAPPING.json"));
const qaFile = await readJson(path.join(SOURCE_DIR, "QA_REPORT.json"));
const flatFile = await readJson(path.join(SOURCE_DIR, "QUESTION_BANK.merged.json"));

const packCatalog = packsFile.json;
const packKeys = Object.keys(packCatalog);
check(packKeys.length === 1, "one-pack-per-source", "-", `a corpus pack source carries ${packKeys.length} packs`);
const packKey = packKeys[0];
check(!existingPacks.some((pack) => pack.key === packKey), "pack-already-merged", packKey, "this pack key already exists in the bank");

const pack = packCatalog[packKey];
const packQuestions = Array.isArray(pack.questions) ? pack.questions : [];
const registry = sourcesFile.json;
const flatById = new Map(flatFile.json.map((row) => [row.id, row]));

// ---------------------------------------------------------------------------
// Validate the new questions (same structural rules as the base import)
// ---------------------------------------------------------------------------

const newQuestions = [];
const newCaseStudies = new Map();
const seenNewIds = new Map();
const subjectCounts = new Map();

for (const source of packQuestions) {
  const id = internalId(source.id);
  check(!seenNewIds.has(id), "duplicate-internal-id", source.id, `duplicate id inside the pack`);
  check(!existingIds.has(id), "id-collision-with-bank", source.id, `collides with an existing bank id`);
  seenNewIds.set(id, packKey);

  check(typeof source.id === "string" && source.id.length > 0, "missing-id", String(source.id), "no id");
  check(typeof source.prompt === "string" && source.prompt.trim().length > 0, "missing-prompt", source.id, "no prompt");
  check(typeof source.title === "string" && source.title.trim().length > 0, "missing-title", source.id, "no title");
  check(typeof source.explanation === "string" && source.explanation.trim().length > 0, "missing-explanation", source.id, "no explanation");
  check(Array.isArray(source.options) && source.options.length >= 2, "missing-options", source.id, "fewer than two options");
  check(["single", "multi", "sequence"].includes(source.type), "unknown-type", source.id, `unknown type "${source.type}"`);

  const options = (source.options ?? []).map((option) => ({
    id: option.id,
    text: typeof option.text === "string" ? option.text : "",
    why: typeof option.why === "string" ? option.why : "",
  }));
  const optionIds = options.map((option) => option.id);
  check(new Set(optionIds).size === optionIds.length, "duplicate-option-id", source.id, "duplicate option ids");
  for (const option of options) {
    check(option.text.trim().length > 0, "empty-option-text", source.id, `option ${option.id} has no text`);
    check(option.why.trim().length > 0, "missing-option-rationale", source.id, `option ${option.id} has no rationale`);
  }

  const correct = Array.isArray(source.correct) ? source.correct : [];
  check(correct.length > 0, "missing-answer", source.id, "no correct answer");
  for (const key of correct) check(optionIds.includes(key), "invalid-answer-key", source.id, `answer key "${key}" is not an option`);
  check(new Set(correct).size === correct.length, "duplicate-answer", source.id, "answer key repeats an option");
  if (source.type === "single") check(correct.length === 1, "single-answer-cardinality", source.id, `single has ${correct.length} answers`);
  if (source.type === "multi") check(correct.length >= 2, "multi-answer-cardinality", source.id, `multi has ${correct.length} answers`);
  if (source.type === "sequence") check(correct.length === options.length, "sequence-answer-cardinality", source.id, "sequence does not cover every option");

  check(Array.isArray(source.refs), "missing-refs", source.id, "no refs array");
  for (const ref of source.refs ?? []) {
    check(Boolean(registry[ref]) || Boolean(existingRegistry.has(ref)), "broken-reference", source.id, `reference "${ref}" is in neither the pack registry nor the bank registry`);
  }

  if (typeof source.difficulty !== "number" || source.difficulty < 1 || source.difficulty > 5) {
    warn(false, "no-difficulty", source.id, "difficulty outside 1–5 (recorded, not fatal)");
  }

  check(
    typeof source.importMetadata?.provenance === "string" && source.importMetadata.provenance.trim().length > 0,
    "missing-provenance",
    source.id,
    "every corpus question carries a provenance string",
  );
  check(
    typeof source.importMetadata?.validation === "string" && source.importMetadata.validation.trim().length > 0,
    "missing-validation",
    source.id,
    "every corpus question carries a validation string",
  );

  let caseStudyId = null;
  if (source.caseStudy?.title) {
    check(
      typeof source.caseStudy.text === "string" && source.caseStudy.text.trim().length > 0,
      "malformed-case-study",
      source.id,
      "case study has no text",
    );
    const base = slugify(source.caseStudy.title);
    let candidate = base;
    let suffix = 2;
    while ((newCaseStudies.has(candidate) && newCaseStudies.get(candidate).title !== source.caseStudy.title) || existingCaseIds.has(candidate)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
    if (!newCaseStudies.has(candidate)) {
      newCaseStudies.set(candidate, { id: candidate, title: source.caseStudy.title, text: source.caseStudy.text, questionIds: [] });
    }
    newCaseStudies.get(candidate).questionIds.push(id);
    caseStudyId = candidate;
  }

  const record = {
    id,
    sourceId: source.id,
    pack: packKey,
    topic: source.topic ?? "Unspecified",
    title: source.title,
    prompt: source.prompt,
    type: source.type,
    options,
    correct,
    explanation: source.explanation,
    videoSeconds: typeof source.time === "number" ? source.time : null,
    refs: source.refs ?? [],
    code: source.code ?? "",
    origin: source.origin ?? "foundation",
    difficulty: typeof source.difficulty === "number" ? source.difficulty : null,
    caseStudyId,
    sourceObjective: source.importMetadata?.exam_objective ?? null,
    provenance: source.importMetadata?.provenance ?? null,
    validation: source.importMetadata?.validation ?? null,
    sourceVideoUrl: source.importMetadata?.source_video_url ?? null,
  };

  const label = classify({
    topic: record.topic,
    title: record.title,
    prompt: record.prompt,
    pack: packKey,
    refs: record.refs,
    sourceObjective: record.sourceObjective,
  });
  record.classification = label;
  subjectCounts.set(label.subject, (subjectCounts.get(label.subject) ?? 0) + 1);

  // The flat bank must describe the same records, not a second set.
  const twin = flatById.get(record.sourceId);
  check(Boolean(twin), "flat-bank-missing", record.sourceId, "absent from QUESTION_BANK.merged.json");
  if (twin) {
    check(twin.prompt === record.prompt, "flat-bank-prompt-drift", record.sourceId, "prompt differs between catalog and flat bank");
    check(
      JSON.stringify(twin.correct) === JSON.stringify(record.correct),
      "flat-bank-answer-drift",
      record.sourceId,
      "answer key differs between catalog and flat bank",
    );
  }

  newQuestions.push(record);
}

check(flatById.size === newQuestions.length, "flat-bank-size", "-", `flat bank has ${flatById.size} ids, catalog has ${newQuestions.length}`);

// Declared counts must match what was read.
check(newQuestions.length === qaFile.json.total_questions, "count-mismatch", "-", `imported ${newQuestions.length}, pack declares ${qaFile.json.total_questions}`);
check(qaFile.json.packs === 1, "pack-count-mismatch", "-", `pack declares ${qaFile.json.packs} packs`);

// Every ID_MAPPING row must resolve.
for (const row of idMapFile.json) {
  check(
    seenNewIds.has(internalId(row.source_id)),
    "id-map-orphan",
    row.source_id,
    "ID_MAPPING row does not resolve to an imported question",
  );
}

// Exact-normalized prompt duplicates across the WHOLE bank (original + new).
const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const promptGroups = new Map();
for (const question of [...existingQuestions, ...newQuestions]) {
  const key = normalize(question.prompt);
  promptGroups.set(key, (promptGroups.get(key) ?? 0) + 1);
}
const duplicatePrompts = [...promptGroups.entries()].filter(([, count]) => count > 1);
check(duplicatePrompts.length === 0, "duplicate-prompt", "-", `${duplicatePrompts.length} exact-normalized prompt group(s) already in the bank`);

// ---------------------------------------------------------------------------
// Merged artifacts
// ---------------------------------------------------------------------------

const caseStudies = [...newCaseStudies.values()].sort((a, b) => a.title.localeCompare(b.title));
const allQuestions = [...existingQuestions, ...newQuestions.map(({ classification, ...record }) => record)];

const newIndexEntry = (question) => {
  const label = question.classification;
  const promptPreview = question.prompt.length > 280
    ? `${question.prompt.slice(0, 277).trimEnd()}…`
    : question.prompt;
  return {
    id: question.id,
    sourceId: question.sourceId,
    pack: question.pack,
    topic: question.topic,
    title: question.title,
    prompt: promptPreview,
    promptTruncated: promptPreview.length !== question.prompt.length,
    type: question.type,
    difficulty: question.difficulty,
    optionCount: question.options.length,
    answerCount: question.correct.length,
    caseStudyId: question.caseStudyId,
    refs: question.refs,
    hasCode: Boolean(question.code && question.code.trim()),
    videoSeconds: question.videoSeconds,
    subject: label.subject,
    subjects: label.subjects,
    domain: label.domain,
    objectiveId: label.objectiveId,
    objectiveBasis: label.objectiveBasis,
    scope: label.scope,
    confidence: label.confidence,
  };
};
const mergedIndex = [...existingIndex, ...newQuestions.map(newIndexEntry)];

// F01 reconciliation for the merged bank: objective buckets must stay inside
// their declared domain, and the domain shares must equal the bucket sums.
const domainOfObjective = new Map(OBJECTIVES.map((objective) => [objective.id, objective.domain]));
for (const entry of mergedIndex) {
  if (!entry.objectiveId || !entry.domain) continue;
  check(
    domainOfObjective.get(entry.objectiveId) === entry.domain,
    "objective-domain-mismatch",
    entry.id,
    `objective ${entry.objectiveId} is in domain ${domainOfObjective.get(entry.objectiveId)}, but the record says ${entry.domain}`,
  );
}

const mergedSources = [
  ...existingSources,
  ...Object.entries(registry)
    .filter(([id]) => !existingRegistry.has(id))
    .map(([id, [title, url]]) => ({ id, title, url })),
];
for (const source of mergedSources) {
  check(/^https:\/\//.test(source.url), "non-https-source", source.id, "registry entries must be https");
}
check(new Set(mergedSources.map((source) => source.id)).size === mergedSources.length, "duplicate-source-id", "-", "registry ids collide");

const mergedPacks = [
  ...existingPacks,
  {
    key: packKey,
    label: String(pack.label ?? packKey),
    title: String(pack.label ?? packKey).includes("·")
      ? String(pack.label ?? packKey).split("·").slice(1).join("·").trim()
      : String(pack.label ?? packKey),
    description: String(pack.description ?? ""),
    video: pack.video
      ? {
          id: String(pack.video.id ?? ""),
          title: String(pack.video.title ?? ""),
          creator: String(pack.video.creator ?? ""),
          duration: String(pack.video.duration ?? ""),
          published: String(pack.video.published ?? ""),
        }
      : null,
    questionCount: newQuestions.length,
    chapterCount: 0,
    subjects: [...subjectCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([subject]) => subject)
      .slice(0, 4),
  },
];

const coverage = buildCoverage(mergedIndex, {
  packs: mergedPacks.map((pack) => ({ key: pack.key, label: pack.title })),
  sources: mergedSources.length,
});
check(
  coverage.domainShares.reduce((sum, domain) => sum + domain.coreQuestions, 0) === coverage.totals.core,
  "core-share-reconciliation",
  "-",
  "domain core shares do not add up to the focused total",
);
check(
  coverage.byBasis.reduce((sum, row) => sum + row.total, 0) === coverage.totals.questions,
  "basis-reconciliation",
  "-",
  "objective-basis counts do not add up to the bank size",
);
for (const domain of coverage.domainShares) {
  const subObjective = coverage.byObjective
    .filter((row) => row.key.startsWith(`${domain.domain}.`))
    .reduce((sum, row) => sum + row.core, 0);
  const domainOnly = coverage.byObjective.find((row) => row.key === domain.domain)?.core ?? 0;
  check(
    subObjective + domainOnly === domain.coreQuestions && subObjective === domain.coreSubObjective,
    "domain-share-reconciliation",
    domain.domain,
    `domain ${domain.domain} shares disagree with its buckets`,
  );
}

if (failures.length > 0) {
  console.error(`Merge aborted: ${failures.length} integrity failure(s).`);
  for (const failure of failures.slice(0, 40)) console.error(`  [${failure.code}] ${failure.questionId}: ${failure.detail}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Write the merged content layer
// ---------------------------------------------------------------------------

const generatedAt = new Date().toISOString();
const writeJson = async (name, value) => {
  await writeFile(path.join(OUT, name), `${JSON.stringify(value)}\n`, "utf8");
};
await mkdir(questionDir, { recursive: true });
await writeJson(`questions/${packKey}.json`, newQuestions.map(({ classification, ...record }) => record));
await writeJson("index.json", mergedIndex);
await writeJson("packs.json", mergedPacks);
await writeJson("cases.json", [...existingCases, ...caseStudies].sort((a, b) => a.title.localeCompare(b.title)));
await writeJson("sources.json", mergedSources);
await writeJson("notes.json", [...existingNotes, { pack: packKey, chapters: [] }]);
await writeJson("id-map.json", [
  ...existingIdMap,
  ...idMapFile.json.map((row) => ({ source: row.source, sourceId: row.source_id, websiteId: row.website_id, pack: row.pack })),
]);

const countMap = (map) => [...map.entries()].sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count }));
const validationNotes = new Map();
const provenanceNotes = new Map();
const originCounts = new Map();
for (const question of allQuestions) {
  if (question.validation) validationNotes.set(question.validation, (validationNotes.get(question.validation) ?? 0) + 1);
  if (question.provenance) provenanceNotes.set(question.provenance, (provenanceNotes.get(question.provenance) ?? 0) + 1);
  originCounts.set(question.origin, (originCounts.get(question.origin) ?? 0) + 1);
}

const meta = {
  ...existingMeta,
  generatedAt,
  counts: coverage.totals,
  coverage,
  caseCount: existingCases.length + caseStudies.length,
  validationNotes: countMap(validationNotes),
  provenanceNotes: countMap(provenanceNotes),
  origins: countMap(originCounts),
  corpusWaves: [
    ...(existingMeta.corpusWaves ?? []),
    {
      pack: packKey,
      importedAt: generatedAt,
      source: path.relative(ROOT, SOURCE_DIR),
      sourceFiles: {
        "LAB_PACKS.merged.json": sha256(packsFile.raw),
        "SOURCES.merged.json": sha256(sourcesFile.raw),
        "QUESTION_BANK.merged.json": sha256(flatFile.raw),
        "ID_MAPPING.json": sha256(idMapFile.raw),
        "QA_REPORT.json": sha256(qaFile.raw),
      },
      questionCount: newQuestions.length,
      declaredCounts: {
        totalQuestions: qaFile.json.total_questions,
        packs: qaFile.json.packs,
        fiveOptionQuestions: qaFile.json.five_option_questions,
      },
      packageQa: { status: qaFile.json.status, runtimeChecksPassed: qaFile.json.runtime_checks_passed },
      integrity: { checksRun, failures, warnings },
      subjects: [...subjectCounts.entries()].sort((a, b) => b[1] - a[1]).map(([subject, count]) => ({ subject, count })),
    },
  ],
};
await writeJson("meta.json", meta);

const loaderLines = [
  "// GENERATED by scripts/import-corpus-pack.mjs — do not edit by hand.",
  "// One dynamic import per pack, so the hub never ships the whole bank.",
  'import type { FabricQuestion } from "./types";',
  "",
  "export type FabricPackLoader = () => Promise<{ default: FabricQuestion[] }>;",
  "",
  "export const PACK_LOADERS: Record<string, FabricPackLoader> = {",
  ...mergedPacks.map(
    (pack) =>
      `  ${JSON.stringify(pack.key)}: () =>\n    import("@/content/fabric/questions/${pack.key}.json").then((module) => ({\n      default: module.default as unknown as FabricQuestion[],\n    })),`,
  ),
  "};",
  "",
  "export function loadPack(key: string): Promise<FabricQuestion[]> {",
  "  const loader = PACK_LOADERS[key];",
  "  if (!loader) return Promise.reject(new Error(`Unknown Fabric pack: ${key}`));",
  "  return loader().then((module) => module.default);",
  "}",
  "",
];
await writeFile(path.join(ROOT, "lib/fabric/pack-loaders.generated.ts"), loaderLines.join("\n"), "utf8");

const formatBytes = (value) => `${(value / 1024).toFixed(0)} KB`;
console.log(`Merged pack "${packKey}": +${newQuestions.length} questions -> bank ${allQuestions.length} from ${mergedPacks.length} packs.`);
console.log(`  subjects        ${[...subjectCounts.entries()].sort((a, b) => b[1] - a[1]).map(([s, n]) => `${s} ${n}`).join(" · ")}`);
console.log(`  references      +${mergedSources.length - existingSources.length} registry entries -> ${mergedSources.length}`);
console.log(`  case studies    +${caseStudies.length} -> ${existingCases.length + caseStudies.length}`);
console.log(`  payload         index ${formatBytes(Buffer.byteLength(JSON.stringify(mergedIndex)))}`);
console.log(`  checks          ${checksRun} run · ${warnings.length} documented warning(s)`);
