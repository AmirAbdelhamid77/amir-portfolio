// One typed view over the curricula the site already has.
//
// Four teaching registries grew separately — the visualization chapters, the
// statistics sections, the SQL modules, and the Fabric notes and lessons — and
// each already declares its own order and stage. This module does not restate
// their content. It reads `learningUnits()`, checks the graph, and exposes one
// subject → unit → prerequisite model that the learning home, the subject pages
// and the tests can share.
//
// Nothing here publishes a new relation. `learningUnits()` already carries the
// reviewed conceptual dependencies; this file verifies that they resolve, that
// ids are unique, and that a stage-aware teaching order exists. Topic desks and
// subject paths live under `/learn/<subject>/`; `topics[].href` points there.

import { learningUnits, type LearningUnit } from "@/lib/study/learning-path";
import { SUBJECTS, type SubjectId } from "@/lib/study/taxonomy";
import type { Stage } from "@/lib/study/topic-review";
import { RTI_COURSE } from "@/lib/rti/lessons";

/** Teaching stages, easiest first. Mirrors `Stage` in `topic-review.ts`. */
export const STAGE_ORDER: readonly Stage[] = [
  "Foundation",
  "Applied",
  "Advanced",
  "Reference",
];

/** The canonical home of each subject. Static route, one per subject. */
export const SUBJECT_HOME: Record<SubjectId, string> = {
  analysis: "/learn/analysis/",
  excel: "/learn/excel/",
  fabric: "/learn/fabric/",
  "power-bi": "/learn/power-bi/",
  python: "/learn/python/",
  sql: "/learn/sql/",
  statistics: "/learn/statistics/",
  visualization: "/learn/visualization/",
};

export interface CurriculumTopic {
  readonly id: string;
  readonly title: string;
  readonly href: string;
}

export interface CurriculumUnit {
  readonly id: string;
  readonly title: string;
  readonly subject: SubjectId;
  readonly topics: readonly string[];
  readonly stage: Stage;
  readonly kind: LearningUnit["kind"];
  readonly href: string;
  readonly objective: string;
  readonly prerequisites: readonly string[];
  /** 1-based position inside its subject, in teaching order. */
  readonly position: number;
}

export interface CurriculumSubject {
  readonly id: SubjectId;
  readonly title: string;
  readonly goal: string;
  readonly href: string;
  readonly topics: readonly CurriculumTopic[];
  readonly units: readonly CurriculumUnit[];
  readonly stageCounts: Readonly<Record<Stage, number>>;
  readonly entry: CurriculumUnit | null;
}

export interface CurriculumProgramme {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly href: string;
  readonly subjects: readonly SubjectId[];
}

export interface Curriculum {
  readonly subjects: readonly CurriculumSubject[];
  readonly units: readonly CurriculumUnit[];
  readonly byId: ReadonlyMap<string, CurriculumUnit>;
  readonly programmes: readonly CurriculumProgramme[];
}

/** Throws on a duplicate id or a prerequisite that names no unit. */
function assertGraph(units: readonly LearningUnit[]): void {
  const ids = new Set<string>();
  for (const unit of units) {
    if (ids.has(unit.id)) throw new Error(`Duplicate curriculum unit: ${unit.id}`);
    ids.add(unit.id);
  }
  for (const unit of units) {
    for (const prerequisite of unit.lessonPrerequisites ?? []) {
      if (!ids.has(prerequisite)) {
        throw new Error(`Curriculum unit ${unit.id} requires unknown unit ${prerequisite}`);
      }
    }
  }
}

/**
 * Stage-aware topological order. A ready unit with an earlier stage wins; ties
 * keep the order the registries produced. This preserves the prerequisite
 * guarantee `learningUnits()` already makes while pulling Foundation material
 * ahead of Reference material that happened to be registered first.
 */
function order(units: readonly LearningUnit[]): LearningUnit[] {
  const rank = new Map<Stage, number>(STAGE_ORDER.map((stage, index) => [stage, index]));
  const pending = units.map((unit, index) => ({ unit, index }));
  const done = new Set<string>();
  const ordered: LearningUnit[] = [];

  while (pending.length > 0) {
    const ready = pending.filter(({ unit }) =>
      (unit.lessonPrerequisites ?? []).every((id) => done.has(id)),
    );
    if (ready.length === 0) throw new Error("Curriculum prerequisites contain a cycle");
    ready.sort(
      (a, b) =>
        (rank.get(a.unit.stage) ?? STAGE_ORDER.length) -
          (rank.get(b.unit.stage) ?? STAGE_ORDER.length) || a.index - b.index,
    );
    const next = ready[0];
    pending.splice(pending.indexOf(next), 1);
    ordered.push(next.unit);
    done.add(next.unit.id);
  }

  return ordered;
}

const PROGRAMMES: readonly CurriculumProgramme[] = [
  {
    id: "dp-600",
    title: "DP-600 Learning Academy",
    summary:
      "The ingestion decision lab, its transfer cases and the Fabric question bank, with saved sessions kept.",
    href: "/learn/dp-600/",
    subjects: ["fabric"],
  },
  {
    id: "fabric-rti",
    title: RTI_COURSE.title,
    summary:
      "Streaming lessons built over pinned lab blueprints, with every hold and NOT_RUN status kept visible.",
    href: RTI_COURSE.href,
    subjects: ["fabric"],
  },
  {
    id: "academy",
    title: "Corpus Academy",
    summary:
      "Mirrored Microsoft Learning labs for Fabric and Power BI, attributed and linked to their sources.",
    href: "/learn/academy/",
    subjects: ["fabric", "power-bi"],
  },
];

let cached: Curriculum | null = null;

/** The whole curriculum, derived from the existing registries. */
export function curriculum(): Curriculum {
  if (cached) return cached;

  const raw = learningUnits();
  assertGraph(raw);
  const ordered = order(raw);

  const byId = new Map<string, CurriculumUnit>();
  const positions = new Map<SubjectId, number>();
  const units = ordered.map((unit) => {
    const position = (positions.get(unit.subject) ?? 0) + 1;
    positions.set(unit.subject, position);
    const view: CurriculumUnit = {
      id: unit.id,
      title: unit.title,
      subject: unit.subject,
      topics: unit.topics,
      stage: unit.stage,
      kind: unit.kind,
      href: unit.href,
      objective: unit.objective,
      prerequisites: unit.lessonPrerequisites ?? [],
      position,
    };
    byId.set(view.id, view);
    return view;
  });

  const subjects = SUBJECTS.map((subject): CurriculumSubject => {
    const subjectUnits = units.filter((unit) => unit.subject === subject.id);
    const stageCounts = { Foundation: 0, Applied: 0, Advanced: 0, Reference: 0 };
    for (const unit of subjectUnits) stageCounts[unit.stage] += 1;
    return {
      id: subject.id,
      title: subject.title,
      goal: subject.goal,
      href: SUBJECT_HOME[subject.id],
      topics: subject.topics.map(([id, title]) => ({
        id,
        title,
        href: `/learn/${subject.id}/${id}/`,
      })),
      units: subjectUnits,
      stageCounts,
      entry:
        subjectUnits.find((unit) => unit.kind !== "study-note") ?? subjectUnits[0] ?? null,
    };
  });

  cached = { subjects, units, byId, programmes: PROGRAMMES };
  return cached;
}

export function subjectHome(slug: string): CurriculumSubject | undefined {
  return curriculum().subjects.find((subject) => subject.id === slug);
}

/** Same as `subjectHome`, but for a static route that must exist. */
export function requireSubject(slug: string): CurriculumSubject {
  const subject = subjectHome(slug);
  if (!subject) throw new Error(`Unknown subject: ${slug}`);
  return subject;
}

/** Units grouped by stage, in teaching order. Used by the subject pages. */
export function unitsByStage(subject: CurriculumSubject): { stage: Stage; units: CurriculumUnit[] }[] {
  return STAGE_ORDER.map((stage) => ({
    stage,
    units: subject.units.filter((unit) => unit.stage === stage),
  })).filter((group) => group.units.length > 0);
}
