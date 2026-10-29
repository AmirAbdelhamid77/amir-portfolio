// Builds content/drafts/*.json — the browser-safe projections of the two
// intake packages staged as disabled review drafts.
//
//   node scripts/build-draft-banks.mjs
//
// Sources live in intake-private/ (gitignored, never served, never imported by
// app code) because both packages carry answer keys, historical keys, review
// logs and agent guides. This script is an *allowlist projection*: a record can
// only carry a field that is named here, so a new answer-bearing field added by
// a future package version is dropped rather than forwarded.
//
// Statuses are inherited, never upgraded: DP-600 R18 is NO_GO, PL-300 V88 is
// NONFINAL. Nothing here enables grading, and no output file contains an
// expected answer.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PRIVATE = path.join(ROOT, "intake-private");
const OUT = path.join(ROOT, "content", "drafts");

const DP_SRC = path.join(PRIVATE, "dp600-r18", "LEARNER_CANDIDATE", "R18_222_QUESTIONS_IMAGEFREE_UNGRADED.json");
const PL_SRC = path.join(PRIVATE, "pl300-v88", "DATA", "WORKING_BANK_1285_V88_NONFINAL.json");

const FORBIDDEN_KEY = /(answer|correct|explanation|\bwhy\b|expected|historical|answer_key|sme|gradingEnabledTrue)/i;

function sha256(file) {
  return crypto.createHash("sha256").update(readFileSync(file)).digest("hex");
}

function assertNoAnswerFields(value, where) {
  if (Array.isArray(value)) {
    value.forEach((entry, i) => assertNoAnswerFields(entry, `${where}[${i}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (key === "gradingEnabled") {
        if (child !== false) throw new Error(`gradingEnabled must be false at ${where}`);
        continue;
      }
      if (FORBIDDEN_KEY.test(key)) throw new Error(`answer-bearing field "${key}" reached the projection at ${where}`);
      assertNoAnswerFields(child, `${where}.${key}`);
    }
  }
}

function pick(source, allowed) {
  const out = {};
  for (const key of allowed) if (source[key] !== undefined) out[key] = source[key];
  return out;
}

// --- DP-600 R18: the package's own key-free learner projection ---------------
// The source record already carries no answer field (verified: 0/222), so the
// work here is namespacing the id, forcing grading off and dropping the
// per-question candidate/review metadata, which stays in the private mirror.
function projectDp600() {
  const doc = JSON.parse(readFileSync(DP_SRC, "utf8"));
  const questions = doc.questions.map((q) => {
    const projected = {
      draftId: `draft-dp600-r18-${q.id.toLowerCase()}`,
      sourceId: q.id,
      ...pick(q, ["topic", "num", "type", "caseStudy", "stem", "refs", "semanticVisuals", "visualResolution"]),
      options: (q.options ?? []).map((o) => pick(o, ["letter", "text"])),
      blanks: (q.blanks ?? []).map((b) => ({ label: b.label, options: [...(b.options ?? [])] })),
      statements: (q.statements ?? []).map((s) => ({ text: s.text })),
      drag: q.drag ? pick(q.drag, ["items", "reuse", "targets"]) : undefined,
      interactionDraft: q.interactionDraft ? pick(q.interactionDraft, ["type", "selectCount"]) : undefined,
      gradingEnabled: false,
    };
    for (const key of Object.keys(projected)) if (projected[key] === undefined) delete projected[key];
    return projected;
  });
  return {
    kind: "hansa-draft-bank",
    version: 1,
    bank: "dp600-r18",
    exam: "DP-600",
    status: "NO_GO",
    statusLabel: "R18 staging candidate — ungraded, no production authorization",
    gradingEnabled: false,
    answersShipped: false,
    source: {
      archive: "Hansa_DP600_R18_ISOLATED_VERIFIED_HANDOFF_NO_GO_2026-10-27.zip",
      archiveSha256: "80b390705506c2e3c3bdef75d7ab1e5fada04bf1b4dab39ba04ccf33d2eebf67",
      verifier: "PASS_PACKAGE_INTEGRITY_AND_PARENT_PARITY_ONLY",
      release: doc.release,
      note: "All 222 source ids already exist in the approved Hansa DP-600 bank; this is a parallel candidate revision, staged beside it and never merged into it.",
    },
    caseStudies: (doc.caseStudies ?? []).map((cs) => pick(cs, ["id", "name", "text"])),
    questions,
  };
}

// --- PL-300 V88: allowlist projection of the 1,285-question working bank -----
// The source carries `correct` on every record, per-option `why` rationales,
// explanations, historical keys and per-question review logs. None of it may
// reach the browser, so only question content and source mapping survive.
function projectPl300() {
  const rows = JSON.parse(readFileSync(PL_SRC, "utf8"));
  const questions = rows.map((q) => {
    const projected = {
      draftId: `draft-pl300-v88-${q.id}`,
      sourceId: q.id,
      ...pick(q, [
        "legacy_id",
        "video_id",
        "video_title",
        "video_timestamp_seconds",
        "video_url",
        "scope",
        "topic",
        "exam_objective",
        "exam_subobjective",
        "prompt",
        "type",
        "difficulty",
        "code",
      ]),
      options: (q.options ?? []).map((o) => pick(o, ["id", "text"])),
      gradingEnabled: false,
    };
    for (const key of Object.keys(projected)) if (projected[key] === undefined) delete projected[key];
    return projected;
  });
  return {
    kind: "hansa-draft-bank",
    version: 1,
    bank: "pl300-v88",
    exam: "PL-300",
    status: "NONFINAL",
    statusLabel: "V88 scoped progress checkpoint — nonfinal, no SME approval",
    gradingEnabled: false,
    answersShipped: false,
    source: {
      archive: "PL300_V88_CODEX_SOURCE_KEY_RECOVERY_AND_SCOPED_REPAIRS_NONFINAL_2026-10-27.zip",
      archiveSha256: "1a68a5ab8f489245ad1475036f518f8a8f982580ebd7b100634169919f330ce3",
      verifier: "PASS_STRUCTURAL_AND_PROVENANCE_ONLY",
      finalReady: false,
      note: "1,285 new ids with no overlap against the existing Hansa banks. Historical keys, explanations, per-option rationales and review logs stay in the private mirror.",
    },
    questions,
  };
}

function writeJson(file, data) {
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  return { file: path.relative(ROOT, file), bytes: readFileSync(file).length, sha256: sha256(file) };
}

const dp = projectDp600();
const pl = projectPl300();

assertNoAnswerFields(dp.questions, "dp600.questions");
assertNoAnswerFields(pl.questions, "pl300.questions");

const dpIds = new Set(dp.questions.map((q) => q.draftId));
const plIds = new Set(pl.questions.map((q) => q.draftId));
if (dpIds.size !== dp.questions.length) throw new Error("dp600 draft ids are not unique");
if (plIds.size !== pl.questions.length) throw new Error("pl300 draft ids are not unique");
const crossTalk = dp.questions.filter((q) => plIds.has(q.draftId));
if (crossTalk.length) throw new Error("draft ids collide across the two banks");

mkdirSync(OUT, { recursive: true });
const written = [
  writeJson(path.join(OUT, "dp600-r18.json"), dp),
  writeJson(path.join(OUT, "pl300-v88.json"), pl),
];

const manifest = {
  kind: "hansa-draft-banks",
  version: 1,
  generatedBy: "scripts/build-draft-banks.mjs",
  policy:
    "Disabled review drafts. Grading is off, no expected answer is shipped, and the two banks stay separate with their own ids, statuses and manifests. Neither bank is an approved Hansa question bank and neither replaces existing approved content. Answer keys, historical keys, per-option rationales, explanations and review logs stay in intake-private/ (gitignored, never imported by app code).",
  banks: [
    {
      id: "dp600-r18",
      exam: "DP-600",
      status: "NO_GO",
      questions: dp.questions.length,
      gradingEnabled: false,
      answersShipped: false,
      sourceIdsAlreadyInHansaBank: 222,
      relation: "parallel candidate revision — not merged, not replacing",
      source: dp.source,
    },
    {
      id: "pl300-v88",
      exam: "PL-300",
      status: "NONFINAL",
      questions: pl.questions.length,
      gradingEnabled: false,
      answersShipped: false,
      sourceIdsAlreadyInHansaBank: 0,
      relation: "new bank, staged beside the existing 80 PL-300 study-hub records",
      source: pl.source,
    },
  ],
  stripped: {
    "dp600-r18": ["r18CandidateMeta (per-question candidate/review log)"],
    "pl300-v88": [
      "correct (expected answer)",
      "explanation",
      "options[].why (per-option rationale)",
      "historical source-key fields",
      "evidence / claim traces",
      "review_status and every per-question review log",
      "human SME and native-runtime QA fields",
    ],
  },
  outputs: written,
};
writeJson(path.join(OUT, "manifest.json"), manifest);

console.log(
  JSON.stringify(
    {
      dp600: { questions: dp.questions.length, ids: dpIds.size },
      pl300: { questions: pl.questions.length, ids: plIds.size },
      outputs: written,
    },
    null,
    2,
  ),
);
