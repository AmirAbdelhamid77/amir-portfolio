// Shared shapes for the two 2026-10-27 intake packages staged for review:
// the Notion creative-patterns lessons and the Fabric RTI authentic-source
// labs. Built by scripts/build-intake-content.mjs, which is allowlist-based,
// so no record here can carry a proposed key or option reasoning.

export type IntakeLesson = {
  id: string;
  slug: string;
  title: string;
  explanation: string;
  objectives: string[];
  walkthrough: string[];
  misconceptions_and_tradeoffs?: string[];
  practice?: string;
  model_feedback?: string;
  prerequisite_slugs?: string[];
  prerequisite_lesson_ids?: string[];
  code_ids?: string[];
  concept_ids?: string[];
  source_unit_ids?: string[];
  claim_ids?: string[];
  evidence_level?: string;
  native_execution?: string;
  source_authorship_preserved?: boolean;
  status?: string;
};

export type IntakeModule = { id: string; title: string; lesson_ids: string[]; status?: string };
export type IntakePath = { id: string; title: string; lesson_ids: string[] };

export type IntakeCode = {
  id: string;
  filename: string;
  language: string;
  authorship: string;
  native_execution: string;
  requirements?: string;
  sha256: string;
};

export type IntakeLessonSet = {
  kind: string;
  package: string;
  packageSha256: string;
  status: string;
  statusLabel: string;
  gradingEnabled: false;
  counts: { lessons: number; modules: number; paths: number };
  lessons: IntakeLesson[];
  modules: IntakeModule[];
  paths: IntakePath[];
  code: IntakeCode[];
};

export type IntakeLabEvidence = {
  artifact_id: string;
  canonical_url: string;
  source_path: string;
  sha256: string;
  line?: number;
  locator_term?: string;
};

export type IntakeLab = {
  lab_id: string;
  title: string;
  frames?: string[];
  data_origin: string;
  task: string;
  source_based_expected_evidence?: string;
  prerequisites?: string;
  validation_status?: string;
  grading_enabled: false;
  deployment_allowed: false;
  source_evidence: IntakeLabEvidence[];
};

export type IntakeLabSet = {
  kind: string;
  package: string;
  status: string;
  runtimeStatus?: string;
  statusLabel: string;
  gradingEnabled: false;
  counts: { proposed: number; shipped: number };
  holds: { lab_id: string; reason: string }[];
  labs: IntakeLab[];
};

export type IntakeSource = {
  source_id: string;
  repo: string;
  canonical_url: string;
  commit: string;
  commit_date?: string;
  license: string;
  frames?: string[];
  downloaded_artifacts: number;
  included_artifacts: number;
  reference_only_artifacts: number;
};

export type IntakeDataset = {
  dataset_id: string;
  name: string;
  origin_class: string;
  canonical_url?: string;
  license?: string;
  doi?: string;
  description?: string;
  limitations?: string;
  row_grain?: string;
  timezone?: string;
  changes?: string;
};

export type IntakeSourceRegistry = {
  kind: string;
  status: string;
  statusLabel: string;
  counts: {
    repositoriesCleared: number;
    repositoriesHeldReferenceOnly: number;
    datasetsCleared: number;
    datasetsHeld: number;
  };
  holds: { id: string; count: number; reason: string }[];
  repositories: IntakeSource[];
  datasets: IntakeDataset[];
};

export function filterByWords<T>(rows: T[], query: string, text: (row: T) => string): T[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return rows;
  return rows.filter((row) => {
    const haystack = text(row).toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}
