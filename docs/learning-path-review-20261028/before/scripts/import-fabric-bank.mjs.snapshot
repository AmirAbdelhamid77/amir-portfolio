// Build-time import of the supplied Microsoft Fabric practice bank.
//
//   node --experimental-strip-types scripts/import-fabric-bank.mjs --source "<package dir>"
//
// Reads the package's merged catalog (`LAB_PACKS.merged.json`), reference
// registry (`SOURCES.merged.json`) and ID map, verifies them, and writes the
// site's content layer to `content/fabric/`.
//
// Rules this script follows:
// - The original package is read-only. Nothing is rewritten in place.
// - Author text (prompt, options, rationales, explanations, case studies) is
//   copied verbatim. Only the id and the derived labels are added.
// - A structural defect stops the import; a documented limitation is recorded
//   as a warning and in the audit report.
// - Pack-level metadata (label, video, study-note chapters) is preserved so a
//   question keeps its source identity.

import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
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
  arg("source", process.env.FABRIC_BANK_DIR ?? "../Amirs_Fabric_Lab_Merged_834_Deployment_Package"),
);

const sha256 = (text) => createHash("sha256").update(text).digest("hex");

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

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function internalId(sourceId) {
  return `fb-${slugify(sourceId)}`;
}

async function readJson(name) {
  const raw = await readFile(path.join(SOURCE_DIR, name), "utf8");
  return { raw, json: JSON.parse(raw) };
}

// ---------------------------------------------------------------------------
// Read the package
// ---------------------------------------------------------------------------

const packsFile = await readJson("LAB_PACKS.merged.json");
const sourcesFile = await readJson("SOURCES.merged.json");
const idMapFile = await readJson("ID_MAPPING.json");
const qaFile = await readJson("QA_REPORT.json");
const duplicateFile = await readJson("DUPLICATE_REVIEW.json");
const adaptationsFile = await readJson("ADAPTATIONS.json");

const packCatalog = packsFile.json;
const registry = sourcesFile.json;
const idMap = idMapFile.json;
const packKeys = Object.keys(packCatalog);

// ---------------------------------------------------------------------------
// Transform
// ---------------------------------------------------------------------------

const questions = [];
const seenInternalIds = new Map();
const caseStudies = new Map();
const packSummaries = [];
const packNotes = [];

for (const packKey of packKeys) {
  const pack = packCatalog[packKey];
  const packQuestions = Array.isArray(pack.questions) ? pack.questions : [];
  const subjectCounts = new Map();

  for (const source of packQuestions) {
    const id = internalId(source.id);

    check(!seenInternalIds.has(id), "duplicate-internal-id", source.id, `Both ${seenInternalIds.get(id)} and ${packKey} produce ${id}`);
    seenInternalIds.set(id, packKey);

    // --- structural validation (stops the import) ---
    check(typeof source.id === "string" && source.id.length > 0, "missing-id", String(source.id), "Question has no id");
    check(typeof source.prompt === "string" && source.prompt.trim().length > 0, "missing-prompt", source.id, "Question has no prompt");
    check(typeof source.title === "string" && source.title.trim().length > 0, "missing-title", source.id, "Question has no title");
    check(typeof source.explanation === "string" && source.explanation.trim().length > 0, "missing-explanation", source.id, "Question has no general explanation");
    check(Array.isArray(source.options) && source.options.length >= 2, "missing-options", source.id, "Question has fewer than two options");
    check(["single", "multi", "sequence"].includes(source.type), "unknown-type", source.id, `Unknown type "${source.type}"`);

    const options = (source.options ?? []).map((option) => ({
      id: option.id,
      text: typeof option.text === "string" ? option.text : "",
      why: typeof option.why === "string" ? option.why : "",
    }));
    const optionIds = options.map((option) => option.id);
    check(new Set(optionIds).size === optionIds.length, "duplicate-option-id", source.id, `Duplicate option ids in ${source.id}`);
    for (const option of options) {
      check(option.text.trim().length > 0, "empty-option-text", source.id, `Option ${option.id} has no text`);
      check(option.why.trim().length > 0, "missing-option-rationale", source.id, `Option ${option.id} has no rationale`);
    }

    const correct = Array.isArray(source.correct) ? source.correct : [];
    check(correct.length > 0, "missing-answer", source.id, "Question has no correct answer");
    for (const key of correct) {
      check(optionIds.includes(key), "invalid-answer-key", source.id, `Answer key "${key}" is not an option id`);
    }
    check(new Set(correct).size === correct.length, "duplicate-answer", source.id, "Answer key repeats an option");
    if (source.type === "single") {
      check(correct.length === 1, "single-answer-cardinality", source.id, `single question has ${correct.length} answers`);
    }
    if (source.type === "multi") {
      check(correct.length >= 2, "multi-answer-cardinality", source.id, `multi question has ${correct.length} answers`);
    }
    if (source.type === "sequence") {
      check(correct.length === options.length, "sequence-answer-cardinality", source.id, `sequence lists ${correct.length} of ${options.length} options`);
    }

    check(Array.isArray(source.refs), "missing-refs", source.id, "Question has no refs array");
    for (const ref of source.refs ?? []) {
      check(Boolean(registry[ref]), "broken-reference", source.id, `Reference "${ref}" is not in the registry`);
    }

    // --- documented limitations (recorded, not fatal) ---
    warn(
      typeof source.time === "number" && source.time >= 0,
      "no-video-timestamp",
      source.id,
      "Question has no video timestamp (foundation/synthesis question)",
    );
    if (source.caseStudy) {
      check(
        typeof source.caseStudy.title === "string" &&
          typeof source.caseStudy.text === "string" &&
          source.caseStudy.title.trim().length > 0 &&
          source.caseStudy.text.trim().length > 0,
        "malformed-case-study",
        source.id,
        "Case study is missing a title or text",
      );
    }
    warn(
      !source.pack || Boolean(packCatalog[source.pack]),
      "unknown-pack-reference",
      source.id,
      `Question points at unknown pack "${source.pack}"`,
    );

    // --- case study grouping (shared scenario, one record) ---
    let caseStudyId = null;
    if (source.caseStudy?.title) {
      const base = slugify(source.caseStudy.title);
      let candidate = base;
      let suffix = 2;
      while (caseStudies.has(candidate) && caseStudies.get(candidate).title !== source.caseStudy.title) {
        candidate = `${base}-${suffix}`;
        suffix += 1;
      }
      if (!caseStudies.has(candidate)) {
        caseStudies.set(candidate, { id: candidate, title: source.caseStudy.title, text: source.caseStudy.text, questionIds: [] });
      }
      caseStudies.get(candidate).questionIds.push(id);
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
      origin: source.origin ?? "unknown",
      difficulty: typeof source.difficulty === "number" ? source.difficulty : null,
      caseStudyId,
      sourceObjective: source.importMetadata?.exam_objective ?? null,
      provenance: source.importMetadata?.provenance ?? null,
      validation: source.importMetadata?.validation ?? null,
      sourceVideoUrl: source.importMetadata?.source_video_url ?? null,
    };
    questions.push(record);

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
  }

  const label = String(pack.label ?? packKey);
  const title = label.includes("·") ? label.split("·").slice(1).join("·").trim() : label;
  const chapters = (Array.isArray(pack.map) ? pack.map : []).map((chapter) => ({
    id: String(chapter.id ?? ""),
    title: String(chapter.title ?? ""),
    startSeconds: typeof chapter.time === "number" ? chapter.time : 0,
    end: String(chapter.end ?? chapter.until ?? ""),
    questionIds: (chapter.ids ?? []).map((raw) => internalId(raw)),
    points: Array.isArray(chapter.points) ? chapter.points : [],
    refs: Array.isArray(chapter.refs) ? chapter.refs : [],
    caveat: chapter.caveat ?? null,
    videoSeconds: typeof chapter.time === "number" ? chapter.time : null,
  }));

  packSummaries.push({
    key: packKey,
    label,
    title,
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
    questionCount: packQuestions.length,
    chapterCount: chapters.length,
    subjects: [...subjectCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([subject]) => subject)
      .slice(0, 4),
  });
  packNotes.push({ pack: packKey, chapters });
}

// ---------------------------------------------------------------------------
// Index, coverage, cross-checks
// ---------------------------------------------------------------------------

const caseById = new Map(caseStudies);

const index = questions.map((question) => {
  const label = question.classification;
  // The list preview keeps enough of the stem to be recognisable; the full
  // prompt lives in the pack chunk that the runner loads. Keeping both copies
  // out of the index roughly halves the explorer's payload.
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
});

const idMappingFile = idMap.map((row) => ({
  source: row.source,
  sourceId: row.source_id,
  websiteId: row.website_id,
  pack: row.pack,
}));

for (const row of idMappingFile) {
  check(
    seenInternalIds.has(internalId(row.sourceId)),
    "id-map-orphan",
    row.sourceId,
    "ID_MAPPING row does not resolve to an imported question",
  );
}

// Package-declared counts must match what was actually imported.
check(questions.length === qaFile.json.total_questions, "count-mismatch", "-", `Imported ${questions.length}, package declares ${qaFile.json.total_questions}`);
check(packKeys.length === qaFile.json.packs, "pack-count-mismatch", "-", `Imported ${packKeys.length} packs, package declares ${qaFile.json.packs}`);
check(new Set(questions.map((question) => question.id)).size === questions.length, "duplicate-question-id", "-", "Internal ids are not unique");

// The flat bank must describe the same 834 records, not a second set.
const flat = await readJson("QUESTION_BANK.merged.json");
const flatIds = new Map(flat.json.map((row) => [row.id, row]));
check(flatIds.size === questions.length, "flat-bank-size", "-", `Flat bank has ${flatIds.size} ids, catalog has ${questions.length}`);
for (const question of questions) {
  const twin = flatIds.get(question.sourceId);
  check(Boolean(twin), "flat-bank-missing", question.sourceId, "Question is absent from the flat bank");
  if (twin) {
    check(twin.prompt === question.prompt, "flat-bank-prompt-drift", question.sourceId, "Prompt differs between catalog and flat bank");
    check(
      JSON.stringify(twin.correct) === JSON.stringify(question.correct),
      "flat-bank-answer-drift",
      question.sourceId,
      "Answer key differs between catalog and flat bank",
    );
  }
}

const coverage = buildCoverage(index, {
  packs: packSummaries.map((pack) => ({ key: pack.key, label: pack.title })),
  sources: Object.keys(registry).length,
});

// Spot-check the aggregate against the package's own declared figures.
check(coverage.totals.multiSelect === 168, "type-count-multi", "-", `multi count is ${coverage.totals.multiSelect}`);
check(coverage.totals.singleSelect === 658, "type-count-single", "-", `single count is ${coverage.totals.singleSelect}`);
check(coverage.totals.sequence === 8, "type-count-sequence", "-", `sequence count is ${coverage.totals.sequence}`);
check(coverage.totals.fiveOption === qaFile.json.five_option_questions, "five-option-count", "-", `five-option count is ${coverage.totals.fiveOption}`);
check(coverage.totals.withCaseStudy === 343, "case-study-count", "-", `case-study count is ${coverage.totals.withCaseStudy}`);
check(coverage.totals.sources === 227, "source-count", "-", `source registry count is ${coverage.totals.sources}`);
check(packKeys.length === 18, "pack-count", "-", `pack count is ${packKeys.length}`);
for (const pack of packSummaries) {
  check(pack.questionCount > 0, "empty-pack", pack.key, `${pack.key} has no questions`);
  check(Boolean(pack.video?.id), "pack-video-missing", pack.key, `${pack.key} has no video id`);
}

// ---------------------------------------------------------------------------
// Count reconciliation (F01)
// ---------------------------------------------------------------------------
// Two numbers used to be published for the same thing: the domain shares were
// computed from `entry.domain`, while the sub-objective table was computed from
// `entry.objectiveId`. A question whose topic-derived objective sat in another
// domain was counted in both, so the domain split read 297/170/13 while the
// sub-objective split read 347/125/8. The fix is structural (classify.ts keeps a
// derived sub-objective inside the declared domain) and this block makes any
// future drift fail the import instead of reaching the page.
const domainOfObjective = new Map(OBJECTIVES.map((objective) => [objective.id, objective.domain]));
for (const entry of index) {
  if (!entry.objectiveId || !entry.domain) continue;
  check(
    domainOfObjective.get(entry.objectiveId) === entry.domain,
    "objective-domain-mismatch",
    entry.id,
    `objective ${entry.objectiveId} is in domain ${domainOfObjective.get(entry.objectiveId)}, but the record says ${entry.domain}`,
  );
}
for (const domain of coverage.domainShares) {
  const subObjective = coverage.byObjective
    .filter((row) => row.key.startsWith(`${domain.domain}.`))
    .reduce((sum, row) => sum + row.core, 0);
  const domainOnly = coverage.byObjective.find((row) => row.key === domain.domain)?.core ?? 0;
  check(
    subObjective + domainOnly === domain.coreQuestions,
    "domain-share-reconciliation",
    domain.domain,
    `domain ${domain.domain} shares ${domain.coreQuestions} but its buckets total ${subObjective + domainOnly}`,
  );
  check(
    subObjective === domain.coreSubObjective,
    "domain-subobjective-reconciliation",
    domain.domain,
    `domain ${domain.domain} sub-objective core ${domain.coreSubObjective} vs table ${subObjective}`,
  );
}
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

if (failures.length > 0) {
  console.error(`Import aborted: ${failures.length} integrity failure(s).`);
  for (const failure of failures.slice(0, 40)) {
    console.error(`  [${failure.code}] ${failure.questionId}: ${failure.detail}`);
  }
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Write the content layer
// ---------------------------------------------------------------------------

const generatedAt = new Date().toISOString();
const sourceRefs = Object.entries(registry).map(([id, [title, url]]) => ({ id, title, url }));
const cases = [...caseById.values()].sort((a, b) => a.title.localeCompare(b.title));

// Provenance vocabulary, counted rather than paraphrased: the exact wording the
// author used is what a reader needs in order to judge the claim.
const validationNotes = new Map();
const provenanceNotes = new Map();
const originCounts = new Map();
for (const question of questions) {
  if (question.validation) {
    validationNotes.set(question.validation, (validationNotes.get(question.validation) ?? 0) + 1);
  }
  if (question.provenance) {
    provenanceNotes.set(question.provenance, (provenanceNotes.get(question.provenance) ?? 0) + 1);
  }
  originCounts.set(question.origin, (originCounts.get(question.origin) ?? 0) + 1);
}
const countMap = (map) =>
  [...map.entries()].sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count }));

await rm(OUT, { recursive: true, force: true });
await mkdir(path.join(OUT, "questions"), { recursive: true });

async function writeJson(name, value) {
  await writeFile(path.join(OUT, name), `${JSON.stringify(value)}\n`, "utf8");
}

for (const pack of packSummaries) {
  const packQuestions = questions
    .filter((question) => question.pack === pack.key)
    .map((question) => {
      // The derived classification lives in the index, not in the raw record.
      const record = { ...question };
      delete record.classification;
      return record;
    });
  await writeJson(`questions/${pack.key}.json`, packQuestions);
}

await writeJson("packs.json", packSummaries);
await writeJson("index.json", index);
await writeJson("cases.json", cases);
await writeJson("sources.json", sourceRefs);
await writeJson("notes.json", packNotes);
await writeJson("id-map.json", idMappingFile);

const meta = {
  generatedAt,
  packageName: "Amirs_Fabric_Lab_Merged_834_Deployment_Package",
  packageHash: sha256(packsFile.raw).slice(0, 16),
  sourceFiles: {
    "LAB_PACKS.merged.json": sha256(packsFile.raw),
    "SOURCES.merged.json": sha256(sourcesFile.raw),
    "ID_MAPPING.json": sha256(idMapFile.raw),
    "QUESTION_BANK.merged.json": sha256(flat.raw),
  },
  counts: coverage.totals,
  coverage,
  caseCount: cases.length,
  validationNotes: countMap(validationNotes),
  provenanceNotes: countMap(provenanceNotes),
  origins: countMap(originCounts),
  videos: packSummaries.filter((pack) => pack.video).map((pack) => ({
    pack: pack.key,
    ...pack.video,
  })),
  packageQa: {
    status: qaFile.json.status,
    runtimeChecksPassed: qaFile.json.runtime_checks_passed,
    exactDuplicatePromptGroups: duplicateFile.json.exact_normalized_prompt_groups.length,
    similarityCandidates: duplicateFile.json.similarity_candidates.length,
    adaptations: adaptationsFile.json.map((row) => ({ id: row.id, change: row.change })),
    declaredCounts: {
      websiteQuestions: qaFile.json.website_questions,
      addedQuestions: qaFile.json.added_questions,
      totalQuestions: qaFile.json.total_questions,
      packs: qaFile.json.packs,
      fiveOptionQuestions: qaFile.json.five_option_questions,
    },
  },
  integrity: {
    checksRun,
    failures,
    warnings: warnings.map((warning) => ({
      ...warning,
      detail: `${warning.detail} (recorded, not fatal)`,
    })),
  },
};

await writeJson("meta.json", meta);

// A generated loader map keeps the pack list and the chunks in sync without a
// hand-maintained switch that can silently lose a pack.
const loaderLines = [
  "// GENERATED by scripts/import-fabric-bank.mjs — do not edit by hand.",
  "// One dynamic import per pack, so the hub never ships all 834 questions.",
  'import type { FabricQuestion } from "./types";',
  "",
  "export type FabricPackLoader = () => Promise<{ default: FabricQuestion[] }>;",
  "",
  "export const PACK_LOADERS: Record<string, FabricPackLoader> = {",
  ...packSummaries.map(
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

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const formatBytes = (value) => `${(value / 1024).toFixed(0)} KB`;
const indexBytes = Buffer.byteLength(JSON.stringify(index));
const packBytes = questions.reduce((sum, question) => sum + Buffer.byteLength(JSON.stringify(question)), 0);

console.log(`Imported ${questions.length} questions from ${packSummaries.length} packs.`);
console.log(`  types           single ${coverage.totals.singleSelect} · multi ${coverage.totals.multiSelect} · sequence ${coverage.totals.sequence}`);
console.log(`  scope           core ${coverage.totals.core} · support ${coverage.totals.support} · adjacent ${coverage.totals.adjacent} · review ${coverage.totals.review}`);
console.log(`  case studies    ${cases.length} records · ${coverage.totals.withCaseStudy} questions carry context`);
console.log(`  references      ${coverage.totals.sources} registry entries · ${coverage.totals.fiveOption} five-option questions`);
console.log(`  objectives      ${coverage.totals.objectivesCovered}/${coverage.totals.objectivesCovered + coverage.totals.objectivesMissing} official sub-objectives covered`);
console.log(`  payload         index ${formatBytes(indexBytes)} · question records ${formatBytes(packBytes)} in ${packSummaries.length} chunks`);
console.log(`  checks          ${checksRun} run · ${warnings.length} documented warning(s)`);
for (const domain of coverage.domainShares) {
  console.log(`  domain ${domain.domain} ${domain.label}: ${domain.coreQuestions} core (${domain.coreShare}% of core) vs official ${domain.officialWeight}`);
}
