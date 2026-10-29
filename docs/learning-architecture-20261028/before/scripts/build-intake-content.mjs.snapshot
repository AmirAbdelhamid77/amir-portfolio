// Builds content/intake/*.json — the reviewed learner projections of two
// external intake packages:
//
//   * Hansa_Notion_Creative_Patterns_Knowledge_Package_2026-10-27  (REVIEW_REQUIRED)
//   * Hansa_Fabric_RTI_Authentic_Source_Milestone                  (COMPLETE_WITH_DOCUMENTED_HOLDS)
//
//   node scripts/build-intake-content.mjs
//   INTAKE_NOTION_DIR=... INTAKE_RTI_DIR=...   override the package roots
//
// Rules encoded here, straight from the two read-only handoffs:
//   1. Every file read is verified against its package MANIFEST sha256 first, so
//      a tampered or partial extraction can never feed a projection.
//   2. Allowlist projection: a field survives only if it is named below, so an
//      answer-bearing field added by a future package version is dropped rather
//      than forwarded. The Notion package keeps its proposed keys in
//      ASSESSMENTS/PRIVATE_PROPOSED_KEYS_AND_OPTION_REASONS.json, which is
//      never read by this script at all.
//   3. Fail-closed: grading_enabled stays false everywhere; lab L11 references
//      the Scania UCI-421 archive whose public integration is held pending GPL
//      reconciliation, so it is withheld from the shipped list and recorded as
//      a hold; the two no-root-license repositories stay reference-only.
//   4. Statuses are inherited, never upgraded: REVIEW_REQUIRED and
//      COMPLETE_WITH_DOCUMENTED_HOLDS travel with the data.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "content", "intake");

const NOTION_DIR = path.resolve(
  process.env.INTAKE_NOTION_DIR ?? "D:/BeUI/Hansa_Notion_Creative_Patterns_Knowledge_Package_2026-10-27",
);
const RTI_DIR = path.resolve(
  process.env.INTAKE_RTI_DIR ?? "D:/BeUI/Hansa_Fabric_RTI_Authentic_Source_Milestone",
);

const NOTION_ARCHIVE = {
  file: "Hansa_Notion_Creative_Patterns_Knowledge_Package_2026-10-27.zip",
  sha256: "906a9402d45ef1dc00f85267b3e438b7d014fed92e5187e41cea31ba74d63009",
};
const RTI_ARCHIVE = {
  file: "Hansa_Fabric_RTI_Authentic_Source_Milestone.zip",
  sha256: "0113ff0a660661b7e09682b14fee7db0f36b247ed30c9b569d69284084bb389b",
};

/** Answer-bearing keys that must never reach a shipped projection. */
const BANNED = /^(proposed_correct|correct|answers?|expected|why|reasoning|answer_key.*|historical.*key|draftExpectedByID|independent_sme_approval)$/i;

function pick(source, allowed) {
  const out = {};
  for (const key of allowed) if (source[key] !== undefined) out[key] = source[key];
  return out;
}

function assertClean(value, banned, where) {
  if (Array.isArray(value)) return value.forEach((entry, index) => assertClean(entry, banned, `${where}[${index}]`));
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (key === "gradingEnabled" || key === "grading_enabled") {
      if (child !== false) throw new Error(`grading must be off at ${where}`);
      continue;
    }
    if (banned.test(key)) throw new Error(`banned field "${key}" reached the projection at ${where}`);
    assertClean(child, banned, `${where}.${key}`);
  }
}

/** Read a package file only after its bytes match the package manifest. */
function readVerified(baseDir, relative) {
  const manifestPath = path.join(baseDir, "MANIFEST.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const record = (manifest.files ?? []).find((entry) => entry.path === relative);
  if (!record) throw new Error(`${relative} is not listed in ${manifestPath}`);
  const bytes = readFileSync(path.join(baseDir, relative));
  const actual = createHash("sha256").update(bytes).digest("hex");
  if (actual !== record.sha256) {
    throw new Error(`${relative} hash mismatch: manifest ${record.sha256}, got ${actual}`);
  }
  if (bytes.length !== record.bytes) throw new Error(`${relative} size mismatch`);
  return JSON.parse(bytes.toString("utf8"));
}

function writeJson(file, data) {
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  const bytes = readFileSync(file);
  return {
    file: path.relative(ROOT, file).split(path.sep).join("/"),
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}

// ---------------------------------------------------------------- Notion ----
const lessonsSource = readVerified(NOTION_DIR, "LEARNING/lessons.json");
const modulesSource = readVerified(NOTION_DIR, "LEARNING/modules.json");
const pathsSource = readVerified(NOTION_DIR, "LEARNING/paths.json");
const codeRegister = readVerified(NOTION_DIR, "LEARNING/CODE/REGISTER.json");
const candidatesSource = readVerified(NOTION_DIR, "ASSESSMENTS/candidates_UNGRADED.json");

const LESSON_FIELDS = [
  "id", "slug", "title", "explanation", "objectives", "walkthrough",
  "misconceptions_and_tradeoffs", "practice", "model_feedback",
  "prerequisite_slugs", "prerequisite_lesson_ids", "code_ids", "doc_patterns",
  "page_ids", "concept_ids", "source_unit_ids", "source_page_ids",
  "external_source_ids", "claim_ids", "evidence_level",
  "source_authorship_preserved", "native_execution", "status", "provisional_id",
];

const lessons = {
  kind: "intake-lesson-set",
  version: 1,
  package: NOTION_ARCHIVE.file,
  packageSha256: NOTION_ARCHIVE.sha256,
  status: "REVIEW_REQUIRED",
  statusLabel: "Creative patterns lessons — derived educational content, review required, no native execution claimed",
  gradingEnabled: false,
  counts: { lessons: lessonsSource.length, modules: modulesSource.length, paths: pathsSource.length },
  lessons: lessonsSource.map((lesson) => {
    const projected = pick(lesson, LESSON_FIELDS);
    for (const key of Object.keys(projected)) if (projected[key] === undefined) delete projected[key];
    return projected;
  }),
  modules: modulesSource.map((module) => pick(module, ["id", "title", "lesson_ids", "status"])),
  paths: pathsSource.map((entry) => pick(entry, ["id", "title", "lesson_ids"])),
  code: codeRegister.map((entry) =>
    pick(entry, ["id", "filename", "language", "evidence_source_patterns", "authorship", "native_execution", "requirements", "sha256"]),
  ),
};

const assessments = {
  kind: "intake-assessment-candidates",
  version: 1,
  package: NOTION_ARCHIVE.file,
  packageSha256: NOTION_ARCHIVE.sha256,
  status: "REVIEW_REQUIRED",
  statusLabel: "Ungraded assessment candidates — registered outside the approved DP-600 and PL-300 banks",
  gradingEnabled: false,
  answersShipped: false,
  keySource: "ASSESSMENTS/PRIVATE_PROPOSED_KEYS_AND_OPTION_REASONS.json stays inside the package and is never read here",
  counts: { total: candidatesSource.length, tracks: tally(candidatesSource, "track") },
  questions: candidatesSource.map((candidate) => {
    const projected = {
      draftId: `draft-notion-28-${candidate.id.replace(/^assessment:creative:/, "")}`,
      ...pick(candidate, [
        "id", "lesson_slug", "type", "stem", "difficulty", "track",
        "objective_candidate", "grading_enabled", "scientifically_verified",
        "validation_status", "authorship", "lesson_id", "concept_ids",
        "source_unit_ids", "claim_ids", "runtime_validation",
        "integration_eligibility", "existing_bank_overlap_status",
      ]),
      options: (candidate.options ?? []).map((option) => pick(option, ["id", "text"])),
    };
    return projected;
  }),
};

// ------------------------------------------------------------------ RTI -----
const labsSource = readVerified(RTI_DIR, "LAB_BLUEPRINTS.json");
const sourcesSource = readVerified(RTI_DIR, "catalogues/SOURCES.json");
const datasetsSource = readVerified(RTI_DIR, "catalogues/OBSERVED_AND_PUBLISHED_DATASETS.json");
const deliveryStatus = readVerified(RTI_DIR, "DELIVERY_STATUS.json");

const HELD_LABS = { L11: "References the Scania UCI-421 archive; public integration is held pending GPL reconciliation (see LICENSE_REPORT.md)." };

const labs = {
  kind: "intake-lab-blueprints",
  version: 1,
  package: RTI_ARCHIVE.file,
  packageSha256: RTI_ARCHIVE.sha256,
  status: deliveryStatus.milestone_status,
  runtimeStatus: deliveryStatus.runtime_status,
  statusLabel: "Authentic-source lab blueprints — editorial proposals with grading and deployment disabled",
  gradingEnabled: false,
  counts: { proposed: labsSource.length, shipped: labsSource.filter((lab) => !HELD_LABS[lab.lab_id]).length },
  holds: Object.entries(HELD_LABS).map(([lab_id, reason]) => ({ lab_id, reason })),
  labs: labsSource
    .filter((lab) => !HELD_LABS[lab.lab_id])
    .map((lab) => {
      const projected = {
        ...pick(lab, [
          "lab_id", "title", "frames", "data_origin", "task",
          "source_based_expected_evidence", "prerequisites", "validation_status",
          "grading_enabled", "deployment_allowed",
        ]),
        source_evidence: (lab.source_evidence ?? []).map((item) =>
          pick(item, ["artifact_id", "canonical_url", "source_path", "sha256", "line", "locator_term"]),
        ),
      };
      return projected;
    }),
};

const clearedSources = sourcesSource.filter((source) => !/^NOASSERTION/.test(source.license ?? ""));
const heldSources = sourcesSource.filter((source) => /^NOASSERTION/.test(source.license ?? ""));
const datasets = Array.isArray(datasetsSource) ? datasetsSource : datasetsSource.datasets;
const CLEARED_DATASET = (dataset) => dataset.dataset_id !== "UCI-421";

const sourceRegistry = {
  kind: "intake-source-registry",
  version: 1,
  package: RTI_ARCHIVE.file,
  packageSha256: RTI_ARCHIVE.sha256,
  status: deliveryStatus.milestone_status,
  statusLabel: "Authentic source provenance — links and metadata only, no source bodies are shipped",
  counts: {
    repositoriesCleared: clearedSources.length,
    repositoriesHeldReferenceOnly: heldSources.length,
    datasetsCleared: datasets.filter(CLEARED_DATASET).length,
    datasetsHeld: datasets.filter((dataset) => !CLEARED_DATASET(dataset)).length,
  },
  holds: [
    {
      id: "no-root-license",
      count: heldSources.length,
      reason:
        "Two repositories have no license in their pinned trees; their bodies are absent from the deliverable and remain reference-only. Source identities stay inside the package's LICENSE_REPORT.md.",
    },
    {
      id: "UCI-421",
      count: 1,
      reason:
        "Scania air-pressure archive: landing page says CC BY 4.0 but the CSV headers state GPL-3.0-or-later, so public integration is held pending reconciliation.",
    },
    {
      id: "USAID-shipment",
      count: 1,
      reason: "Original endpoint unreachable and no mirror imported; the blocked dataset is absent from the catalogue entirely.",
    },
  ],
  repositories: clearedSources.map((source) =>
    pick(source, [
      "source_id", "repo", "canonical_url", "commit", "commit_date",
      "retrieved_utc", "requested_ref", "frames", "license",
      "downloaded_artifacts", "included_artifacts", "reference_only_artifacts",
      "tree_truncated",
    ]),
  ),
  datasets: datasets.filter(CLEARED_DATASET).map((dataset) =>
    pick(dataset, [
      "dataset_id", "name", "origin_class", "authors", "doi", "canonical_url",
      "version", "sha256", "bytes", "license", "license_url", "changes",
      "description", "limitations", "row_grain", "timezone", "refresh",
    ]),
  ),
};

// -------------------------------------------------------------- validate ----
const LESSON_BANNED = BANNED; // lessons keep their authored `explanation` body
assertClean(lessons.lessons, LESSON_BANNED, "lessons");
assertClean(lessons.modules, LESSON_BANNED, "modules");
assertClean(lessons.code, LESSON_BANNED, "code");
assertClean(assessments.questions, /^(proposed_correct|correct|answers?|expected|why|reasoning|explanation|answer_key.*|historical.*key)$/i, "assessments");
assertClean(labs.labs, LESSON_BANNED, "labs");
assertClean(sourceRegistry.repositories, LESSON_BANNED, "repositories");
assertClean(sourceRegistry.datasets, LESSON_BANNED, "datasets");

// Shipped lessons, assessments, labs and sources must be internally unique.
for (const [label, ids] of [
  ["lesson", lessons.lessons.map((lesson) => lesson.id)],
  ["module", lessons.modules.map((module) => module.id)],
  ["path", lessons.paths.map((entry) => entry.id)],
  ["code", lessons.code.map((entry) => entry.id)],
  ["assessment", assessments.questions.map((question) => question.id)],
  ["draft assessment", assessments.questions.map((question) => question.draftId)],
  ["lab", labs.labs.map((lab) => lab.lab_id)],
  ["repository", sourceRegistry.repositories.map((source) => source.source_id)],
  ["dataset", sourceRegistry.datasets.map((dataset) => dataset.dataset_id)],
]) {
  if (new Set(ids).size !== ids.length) throw new Error(`duplicate ${label} id in projection`);
}

if (lessons.counts.lessons !== 20 || lessons.counts.modules !== 6 || lessons.counts.paths !== 3) {
  throw new Error(`unexpected Notion counts: ${JSON.stringify(lessons.counts)}`);
}
if (assessments.counts.total !== 28) throw new Error(`expected 28 assessment candidates, got ${assessments.counts.total}`);
if (labs.counts.proposed !== 18 || labs.counts.shipped !== 17) throw new Error(`expected 18 proposed / 17 shipped labs`);
if (sourceRegistry.counts.repositoriesCleared !== 22 || sourceRegistry.counts.repositoriesHeldReferenceOnly !== 2) {
  throw new Error(`unexpected source counts: ${JSON.stringify(sourceRegistry.counts)}`);
}

mkdirSync(OUT, { recursive: true });
const outputs = [
  writeJson(path.join(OUT, "notion-lessons.json"), lessons),
  writeJson(path.join(OUT, "notion-assessments.json"), assessments),
  writeJson(path.join(OUT, "rti-labs.json"), labs),
  writeJson(path.join(OUT, "rti-sources.json"), sourceRegistry),
];

const manifest = {
  kind: "hansa-intake-projections",
  version: 1,
  generatedBy: "scripts/build-intake-content.mjs",
  policy:
    "Reviewed learner projections of two external packages, staged additively behind isolated review routes. Grading stays off, no proposed key or option reasoning is shipped, no approved bank, lesson route or progress key is modified, held and blocked sources stay out of the shipped lists, and both package statuses (REVIEW_REQUIRED, COMPLETE_WITH_DOCUMENTED_HOLDS) travel with the data.",
  packages: [
    {
      name: NOTION_ARCHIVE.file,
      sha256: NOTION_ARCHIVE.sha256,
      receipt: "Hansa_Notion_Creative_Patterns_DELIVERY_RECEIPT.json",
      verifier: "PASS_ARTIFACT_INTEGRITY_AND_CONTENT_REFERENCES_ONLY",
      status: "REVIEW_REQUIRED",
      publicationApproved: false,
      nativeProductTests: "NOT_RUN",
      scientificallyFinalAssessments: 0,
      canonicalSchemaCompatibility: "NOT_VERIFIED",
    },
    {
      name: RTI_ARCHIVE.file,
      sha256: RTI_ARCHIVE.sha256,
      receipt: "Hansa_Fabric_RTI_Package_Receipt.json",
      verifier: "PASS",
      status: deliveryStatus.milestone_status,
      runtimeStatus: deliveryStatus.runtime_status,
      sourceSemanticCertification: deliveryStatus.source_semantic_certification,
      holds: deliveryStatus.license_holds,
      dataFabrication: deliveryStatus.data_fabrication,
    },
  ],
  integration: {
    questionBank: "28 ungraded candidates registered outside the approved DP-600/PL-300 banks, surfaced for review only",
    dataLessons: "20 lessons + 6 modules + 3 paths + 9 code templates and 17 lab blueprints staged for review; the 27 approved data-viz lessons and their routes are untouched",
    collisionNote: "Notion lesson slug `visual-integrity` duplicates an existing data-viz lesson slug; the draft set keeps its own `lesson:creative:*` ids and never registers with /learn/[slug], which is exactly why it cannot be merged into the approved lane without a rename decision",
    holds: "Lab L11 withheld (Scania GPL), 2 no-license repositories reference-only, USAID dataset blocked, UCI-421 dataset withheld",
    progressKeys: "no localStorage key is read or written by either review surface",
    deployed: false,
    gradingEnabled: false,
    localPathsShipped: false,
  },
  outputs,
};

const manifestOutput = writeJson(path.join(OUT, "manifest.json"), manifest);
console.log(JSON.stringify({ outputs: [...outputs, manifestOutput], counts: {
  lessons: lessons.counts, assessments: assessments.counts, labs: labs.counts, sources: sourceRegistry.counts,
} }, null, 2));

function tally(rows, key) {
  const out = {};
  for (const row of rows) out[row[key]] = (out[row[key]] ?? 0) + 1;
  return out;
}
