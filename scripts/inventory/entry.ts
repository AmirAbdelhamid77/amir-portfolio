import { learningUnits, resolveEvidence } from "@/lib/study/learning-path";
import { curriculum } from "@/lib/curriculum/model";
import { PACKS, SOURCES as FABRIC_SOURCES, CASE_STUDIES, COVERAGE, COUNTS } from "@/lib/fabric/data";
import { SQL_CANONICAL, SQL_TOPICS, sqlUnits } from "@/lib/sql/registry";
import { CHAPTERS as VIZ_CHAPTERS, LESSONS as VIZ_LESSONS, SOURCE_PAGES } from "@/lib/data-viz/content";
import { RTI_LESSONS } from "@/lib/rti/lessons";
import editorial from "@/content/atlas/editorial.json";
import extension from "@/content/atlas/dp600-extension.json";
import continuation from "@/content/atlas/dp600-continuation.json";
import insights from "@/content/knowledge/insights.json";
import fabricNotes from "@/content/fabric/notes.json";

const units = learningUnits();
const model = curriculum();

const count = (items: readonly any[], key: (item: any) => string) => {
  const map: Record<string, number> = {};
  for (const item of items) map[key(item)] = (map[key(item)] ?? 0) + 1;
  return map;
};

const prereqEdges = units.flatMap((unit) =>
  (unit.lessonPrerequisites ?? []).map((target) => ({ from: unit.id, to: target })),
);
const missingPrereqs = prereqEdges.filter((edge) => !units.some((unit) => unit.id === edge.to));

const linkBasis = (() => {
  const map: Record<string, number> = {};
  for (const unit of units) {
    for (const link of [...unit.questions, ...unit.applications]) {
      map[link.basis] = (map[link.basis] ?? 0) + 1;
    }
  }
  return map;
})();

const atlas = {
  concepts: [...editorial.concepts, ...extension.concepts, ...continuation.concepts],
  edges: [...editorial.semanticEdges, ...extension.semanticEdges, ...continuation.semanticEdges],
  sources: [...editorial.sources, ...extension.sources, ...continuation.sources],
  catalog: [...editorial.catalog, ...extension.catalog, ...continuation.catalog],
};

const fabricChapters = fabricNotes.flatMap((pack: any) =>
  pack.chapters.map((chapter: any) => ({ pack: pack.pack, ...chapter })),
);
const chapterIdCount = count(fabricChapters, (chapter) => chapter.id);
const duplicateChapterIds = Object.entries(chapterIdCount).filter(([, n]) => n > 1);
const refUses = fabricChapters.flatMap((chapter) =>
  (chapter.refs ?? []).map((ref: string) => ({ from: `${chapter.pack}/${chapter.id}`, ref })),
);
const unknownRefs = refUses.filter(
  (use) => !FABRIC_SOURCES.some((source: any) => source.id === use.ref),
);

const report = {
  generatedAt: new Date().toISOString(),
  units: {
    total: units.length,
    bySubject: count(units, (unit) => unit.subject),
    byKind: count(units, (unit) => unit.kind),
    byStage: count(units, (unit) => unit.stage),
    uniqueIds: new Set(units.map((unit) => unit.id)).size,
    duplicateIds: Object.entries(count(units, (unit) => unit.id)).filter(([, n]) => n > 1),
    uniqueHrefs: new Set(units.map((unit) => unit.href)).size,
    withPrereqs: units.filter((unit) => (unit.lessonPrerequisites ?? []).length).length,
    prereqEdges: prereqEdges.length,
    missingPrereqs,
    linkBasis,
    unitsWithQuestions: units.filter((unit) => unit.questions.length).length,
    unitsWithApplications: units.filter((unit) => unit.applications.length).length,
    totalQuestionLinks: units.reduce((total, unit) => total + unit.questions.length, 0),
    totalApplicationLinks: units.reduce((total, unit) => total + unit.applications.length, 0),
    topics: new Set(units.flatMap((unit) => unit.topics)).size,
    prepareTopics: count(units.flatMap((unit) => unit.prepare), (topic) => topic),
    unresolvedEvidence: units
      .flatMap((unit) => [...unit.questions, ...unit.applications].map((link) => link.id))
      .filter((id) => {
        try {
          resolveEvidence(id);
          return false;
        } catch {
          return true;
        }
      }),
  },
  curriculum: {
    subjects: model.subjects.length,
    subjectIds: model.subjects.map((subject: any) => `${subject.id}(${subject.units.length})`),
    units: model.units.length,
    programmes: model.programmes.map((programme: any) => ({
      id: programme.id,
      subjects: programme.subjects,
    })),
    byIdSize: model.byId.size,
  },
  fabric: {
    packs: PACKS.length,
    packKeys: PACKS.map((pack: any) => pack.key),
    chapters: fabricChapters.length,
    duplicateChapterIds,
    sources: FABRIC_SOURCES.length,
    sourceIds: FABRIC_SOURCES.slice(0, 6).map((source: any) => source.id),
    refUses: refUses.length,
    distinctRefs: new Set(refUses.map((use) => use.ref)).size,
    unknownRefs,
    chaptersWithoutRefs: fabricChapters.filter((chapter) => !(chapter.refs ?? []).length).length,
    questionIds: fabricChapters.reduce((total, chapter) => total + (chapter.questionIds?.length ?? 0), 0),
    distinctQuestionIds: new Set(fabricChapters.flatMap((chapter) => chapter.questionIds ?? [])).size,
    caseStudies: CASE_STUDIES.length,
    coverage: COVERAGE,
    counts: COUNTS,
    packsWithChapters: fabricNotes.length,
  },
  sql: {
    canonicalPages: SQL_CANONICAL.length,
    modules: new Set(SQL_CANONICAL.map((page: any) => page.module)).size,
    topics: SQL_TOPICS.length,
    units: sqlUnits().length,
    unitSample: sqlUnits().slice(0, 3).map((unit) => ({ id: unit.id, href: unit.href })),
  },
  visualization: {
    chapters: VIZ_CHAPTERS.length,
    lessons: VIZ_LESSONS.length,
    byKind: count(VIZ_LESSONS, (lesson) => lesson.kind),
    bySection: count(VIZ_LESSONS, (lesson) => lesson.section),
    sourcePages: SOURCE_PAGES.length,
  },
  rti: {
    lessons: RTI_LESSONS.length,
    sample: RTI_LESSONS.slice(0, 3).map((lesson: any) => Object.keys(lesson)),
  },
  insights: {
    items: insights.items.length,
    reviewStatus: count(insights.items, (item) => item.reviewStatus),
    ids: insights.items.map((item) => item.id),
  },
  atlas: {
    concepts: atlas.concepts.length,
    conceptStates: count(atlas.concepts, (concept) => concept.editorialState),
    conceptKinds: count(atlas.concepts, (concept) => concept.kind),
    edges: atlas.edges.length,
    edgeStates: count(atlas.edges, (edge) => edge.editorialState),
    relationTypes: count(atlas.edges, (edge) => edge.relationType),
    supportKinds: count(atlas.edges, (edge) => edge.supportKind),
    direction: count(atlas.edges, (edge) => edge.direction),
    sources: atlas.sources.length,
    sourceVisibility: count(atlas.sources, (source) => source.visibility),
    catalog: atlas.catalog.length,
    catalogKinds: count(atlas.catalog, (entry) => entry.kind),
    catalogConceptLinks: atlas.catalog.reduce((total, entry) => total + entry.conceptIds.length, 0),
    catalogWithConcepts: atlas.catalog.filter((entry) => entry.conceptIds.length).length,
    duplicateConceptIds: atlas.concepts.length - new Set(atlas.concepts.map((concept) => concept.id)).size,
    danglingEdgeEnds: atlas.edges.filter(
      (edge) =>
        !atlas.concepts.some((concept) => concept.id === edge.from) ||
        !atlas.concepts.some((concept) => concept.id === edge.to),
    ).length,
    sourceIdsMissing: Array.from(
      new Set(
        atlas.concepts
          .flatMap((concept) => concept.sourceIds)
          .filter((id) => !atlas.sources.some((source) => source.id === id)),
      ),
    ),
  },
};

console.log(JSON.stringify(report, null, 2));
