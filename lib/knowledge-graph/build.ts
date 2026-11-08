import { learningUnits } from "@/lib/study/learning-path";
import { curriculum } from "@/lib/curriculum/model";
import { PACKS, SOURCES as FABRIC_SOURCES } from "@/lib/fabric/data";
import { JOURNEYS, SECTIONS, journeyHref, sectionHref } from "@/lib/statistics/content";
import { CHAPTERS as VIZ_CHAPTERS, LESSONS as VIZ_LESSONS, SOURCE_PAGES } from "@/lib/data-viz/content";
import { RTI_COURSE, RTI_LESSONS } from "@/lib/rti/lessons";
import fabricNotes from "@/content/fabric/notes.json";
import type { EdgeKind, GraphDiagnostic, GraphEdge, GraphLayer, GraphNode } from "./types";

type FabricNotes = { pack: string; chapters: { id: string; title: string; refs?: string[]; points?: string[]; questionIds?: string[] }[] }[];

const notes = fabricNotes as unknown as FabricNotes;

export interface UnitSeed {
  id: string;
  label: string;
  subject: string;
  unitKind: GraphNode["unitKind"];
  href?: string;
  text: string;
  container?: string;
  coverage?: string;
  stage?: string;
}

export interface BuildResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  diagnostics: GraphDiagnostic[];
  units: UnitSeed[];
}

const SUBJECT_TITLES: Record<string, string> = Object.fromEntries(
  curriculum().subjects.map((subject) => [subject.id, subject.title]),
);

const PROGRAMME_TITLES = new Map(curriculum().programmes.map((p) => [p.id as string, p.title as string]));
const PACK_LABEL = new Map(PACKS.map((pack) => [pack.key as string, (pack.title ?? pack.label) as string]));
const FABRIC_SOURCE_IDS = new Set(FABRIC_SOURCES.map((source) => source.id as string));
const VIZ_PAGE_BY_SLUG = new Map(SOURCE_PAGES.map((page) => [page.slug as string, page]));

const NODE_PREFIX = {
  programme: "programme:",
  subject: "subject:",
  pack: "pack:",
  journey: "journey:",
  chapter: "chapter:",
  course: "course:",
  unit: "unit:",
  source: "source:fabric:",
  page: "page:viz:",
} as const;

/** Deterministic, dependency-free sorting so the dataset is reproducible. */
const byId = (a: { id: string }, b: { id: string }) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

export function buildGraphSource(): BuildResult {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const diagnostics: GraphDiagnostic[] = [];
  const units: UnitSeed[] = [];
  const unitById = new Map<string, UnitSeed>();

  const addNode = (node: GraphNode) => {
    if (nodes.some((existing) => existing.id === node.id)) {
      diagnostics.push({ level: "error", code: "duplicate-node", message: `Duplicate node id ${node.id}` });
      return;
    }
    nodes.push(node);
  };

  const addEdge = (
    from: string,
    to: string,
    kind: EdgeKind,
    layer: GraphLayer,
    evidence: string,
    extra: Partial<GraphEdge> = {},
  ) => {
    const id = `${kind}:${from}->${to}${extra.via ? ":" + extra.via.join(",") : ""}`;
    edges.push({ id, from, to, kind, layer, evidence, ...extra });
  };

  const addUnit = (seed: UnitSeed) => {
    if (unitById.has(seed.id)) {
      diagnostics.push({ level: "error", code: "duplicate-unit", message: `Duplicate unit ${seed.id}` });
      return;
    }
    unitById.set(seed.id, seed);
    units.push(seed);
    addNode({
      id: seed.id,
      kind: "unit",
      label: seed.label,
      subject: seed.subject,
      unitKind: seed.unitKind,
      href: seed.href,
      text: seed.text,
      container: seed.container,
      coverage: seed.coverage,
      stage: seed.stage,
    });
  };

  // ------------------------------------------------------------------ subjects
  for (const subject of curriculum().subjects) {
    addNode({
      id: NODE_PREFIX.subject + subject.id,
      kind: "subject",
      label: SUBJECT_TITLES[subject.id] ?? subject.title,
      subject: subject.id,
      href: subject.href,
    });
  }

  // ---------------------------------------------------------------- programmes
  for (const programme of curriculum().programmes) {
    addNode({
      id: NODE_PREFIX.programme + programme.id,
      kind: "programme",
      label: PROGRAMME_TITLES.get(programme.id) ?? programme.title,
      href: programme.href,
    });
    for (const subjectId of programme.subjects) {
      addEdge(
        NODE_PREFIX.programme + programme.id,
        NODE_PREFIX.subject + subjectId,
        "contains",
        "structure",
        `Programme “${programme.title}” declares subject ${subjectId}.`,
        { pointer: "lib/curriculum/model.ts#programmes" },
      );
    }
  }

  // All canonical learning units, keyed by the id the site itself uses. This is
  // the authority for titles, objectives, coverage and declared prerequisites.
  const canonical = new Map(learningUnits().map((unit) => [unit.id, unit]));

  const requireUnit = (id: string) => {
    const unit = canonical.get(id);
    if (!unit) {
      diagnostics.push({ level: "error", code: "unit-missing", message: `Registry unit ${id} not found` });
    }
    return unit;
  };

  const unitText = (unit: ReturnType<typeof requireUnit>) => {
    if (!unit) return "";
    return [unit.title, unit.objective, ...unit.reviewPoints, ...unit.topics].join(". ");
  };

  // -------------------------------------------------------------- fabric packs
  for (const pack of PACKS) {
    addNode({
      id: NODE_PREFIX.pack + pack.key,
      kind: "pack",
      label: PACK_LABEL.get(pack.key) ?? pack.title ?? pack.label,
      subject: "fabric",
    });
    addEdge(
      NODE_PREFIX.subject + "fabric",
      NODE_PREFIX.pack + pack.key,
      "contains",
      "structure",
      `${pack.chapterCount} chapters are declared in this pack.`,
      { pointer: "content/fabric/packs.json" },
    );
  }

  const fabricPackSeen = new Set<string>();
  for (const pack of notes) {
    if (!PACK_LABEL.has(pack.pack)) {
      diagnostics.push({ level: "error", code: "unknown-pack", message: `Notes file names pack ${pack.pack} which packs.json does not declare` });
    }
    fabricPackSeen.add(pack.pack);
    pack.chapters.forEach((chapter, index) => {
      const unitId = `note-${pack.pack}-${chapter.id}`;
      const unit = requireUnit(unitId);
      if (!unit) return;
      addUnit({
        id: unitId,
        label: chapter.title,
        subject: "fabric",
        unitKind: "study-note",
        href: unit.href,
        text: unitText(unit),
        container: NODE_PREFIX.pack + pack.pack,
        coverage: unit.coverage,
        stage: unit.stage,
      });
      addEdge(
        NODE_PREFIX.pack + pack.pack,
        unitId,
        "contains",
        "structure",
        `Chapter ${index + 1} of ${pack.chapters.length} in pack “${pack.pack}”, in the order the corpus declares.`,
        { pointer: `content/fabric/notes.json#${pack.pack}`, weight: index + 1 },
      );

      // Declared citations: the chapter's own `refs` array, resolved against the
      // global source registry. Unresolved refs are a build error, never dropped.
      const refs = Array.from(new Set(chapter.refs ?? []));
      for (const ref of refs) {
        if (!FABRIC_SOURCE_IDS.has(ref)) {
          diagnostics.push({
            level: "error",
            code: "unknown-source",
            message: `${unitId} cites unknown source ${ref}`,
          });
          continue;
        }
        const sourceId = NODE_PREFIX.source + ref;
        if (!nodes.some((node) => node.id === sourceId)) {
          const source = FABRIC_SOURCES.find((item) => item.id === ref);
          addNode({
            id: sourceId,
            kind: "source",
            label: source?.title ?? ref,
            href: source?.url,
            subject: "fabric",
            text: source?.title,
          });
        }
        addEdge(
          unitId,
          sourceId,
          "cites",
          "declared",
          `The chapter's own refs list names “${ref}”.`,
          { pointer: `content/fabric/notes.json#${pack.pack}.${chapter.id}.refs` },
        );
      }
    });
  }
  for (const pack of PACKS) {
    if (!fabricPackSeen.has(pack.key)) {
      diagnostics.push({ level: "warning", code: "pack-without-notes", message: `Pack ${pack.key} declares no chapter notes` });
    }
  }

  // ---------------------------------------------------------- statistics units
  for (const journey of JOURNEYS) {
    addNode({
      id: NODE_PREFIX.journey + journey.slug,
      kind: "journey",
      label: journey.title,
      subject: "statistics",
      href: journeyHref(journey.slug),
    });
    addEdge(
      NODE_PREFIX.subject + "statistics",
      NODE_PREFIX.journey + journey.slug,
      "contains",
      "structure",
      `Journey ${journey.number} of ${JOURNEYS.length} in the statistics curriculum.`,
      { pointer: "lib/statistics/content.ts#JOURNEYS" },
    );
    journey.sections.forEach((sectionNumber, index) => {
      const section = SECTIONS.find((item) => item.number === sectionNumber);
      if (!section) {
        diagnostics.push({ level: "error", code: "journey-section", message: `Journey ${journey.slug} names unknown section ${sectionNumber}` });
        return;
      }
      const unitId = `stats-section-${section.id}`;
      const unit = requireUnit(unitId);
      if (!unit) return;
      addUnit({
        id: unitId,
        label: section.titleEn,
        subject: "statistics",
        unitKind: "lesson",
        href: sectionHref(section),
        text: unitText(unit),
        container: NODE_PREFIX.journey + journey.slug,
        coverage: section.coverage,
        stage: unit.stage,
      });
      addEdge(
        NODE_PREFIX.journey + journey.slug,
        unitId,
        "contains",
        "structure",
        `Declared position ${index + 1} of ${journey.sections.length} in this journey.`,
        { pointer: "lib/statistics/content.ts#JOURNEYS.sections", weight: index + 1 },
      );
    });
  }

  // --------------------------------------------------------- visualization units
  // Content-recovery fix (2026-11-09): the chapter nodes pointed at
  // /explore/charts/<chapter>/ routes that never existed (the earlier
  // /explore/charts/ pages are chart-type sandboxes, not lessons). A chapter
  // is opened through its first declared lesson's real route; a chapter with
  // no lesson route gets no href and its card says so honestly.
  const vizChapterHref = new Map<string, string>();
  for (const lesson of VIZ_LESSONS) {
    if (!lesson.chapter || vizChapterHref.has(String(lesson.chapter))) continue;
    const unit = requireUnit(`lesson-${lesson.section}-${lesson.slug}`);
    if (unit?.href) vizChapterHref.set(String(lesson.chapter), unit.href);
  }
  for (const chapter of VIZ_CHAPTERS) {
    addNode({
      id: NODE_PREFIX.chapter + chapter.number,
      kind: "chapter",
      label: `${chapter.number} · ${chapter.title}`,
      subject: "visualization",
      href: vizChapterHref.get(String(chapter.number)),
    });
    addEdge(
      NODE_PREFIX.subject + "visualization",
      NODE_PREFIX.chapter + chapter.number,
      "contains",
      "structure",
      `Chapter ${chapter.number} of the visualization curriculum.`,
      { pointer: "content/data-viz/curriculum.json#chapters" },
    );
  }

  for (const page of SOURCE_PAGES) {
    addNode({
      id: NODE_PREFIX.page + page.slug,
      kind: "page",
      label: page.title,
      href: page.canonicalUrl ?? undefined,
      subject: "visualization",
      text: page.title,
    });
  }

  for (const lesson of VIZ_LESSONS) {
    const unit = requireUnit(`lesson-${lesson.section}-${lesson.slug}`);
    if (!unit) continue;
    const chapterNumber = lesson.chapter;
    addUnit({
      id: unit.id,
      label: lesson.title,
      subject: "visualization",
      unitKind: "lesson",
      href: unit.href,
      text: unitText(unit),
      container: chapterNumber ? NODE_PREFIX.chapter + chapterNumber : undefined,
      coverage: lesson.coverage,
      stage: unit.stage,
    });
    if (chapterNumber) {
      const chapter = VIZ_CHAPTERS.find((item) => item.number === chapterNumber);
      const position = chapter ? chapter.lessons.indexOf(lesson.slug) : -1;
      if (!chapter) {
        diagnostics.push({ level: "error", code: "viz-chapter", message: `Lesson ${lesson.slug} names unknown chapter ${chapterNumber}` });
      } else if (position < 0) {
        diagnostics.push({ level: "error", code: "viz-membership", message: `Chapter ${chapterNumber} does not list lesson ${lesson.slug}` });
      } else {
        addEdge(
          NODE_PREFIX.chapter + chapterNumber,
          unit.id,
          "contains",
          "structure",
          `Chapter ${chapterNumber} lists this lesson at position ${position + 1}.`,
          { pointer: "content/data-viz/curriculum.json#chapters.lessons", weight: position + 1 },
        );
      }
    } else {
      addEdge(
        NODE_PREFIX.subject + "visualization",
        unit.id,
        "contains",
        "structure",
        "The lesson declares no chapter; it is held directly by the subject.",
        { pointer: "content/data-viz/curriculum.json#lessons" },
      );
    }

    // A lesson that declares a source page is a rendering of that page.
    const sourceSlug = lesson.source;
    if (sourceSlug) {
      if (!VIZ_PAGE_BY_SLUG.has(sourceSlug)) {
        diagnostics.push({ level: "error", code: "viz-source", message: `Lesson ${lesson.slug} names unknown source page ${sourceSlug}` });
      } else {
        addEdge(
          unit.id,
          NODE_PREFIX.page + sourceSlug,
          "derived-from",
          "declared",
          `The lesson's own source field names page “${sourceSlug}”.`,
          { pointer: `content/data-viz/curriculum.json#lessons.${lesson.slug}.source` },
        );
      }
    }
  }

  // ------------------------------------------------ sql, external and foundations
  const containedUnits = new Set(units.map((unit) => unit.id));
  for (const unit of canonical.values()) {
    if (containedUnits.has(unit.id)) continue;
    addUnit({
      id: unit.id,
      label: unit.title,
      subject: unit.subject,
      unitKind: unit.kind,
      href: unit.href,
      text: unitText(unit),
      coverage: unit.coverage,
      stage: unit.stage,
    });
    addEdge(
      NODE_PREFIX.subject + unit.subject,
      unit.id,
      "contains",
      "structure",
      "Held directly by the subject; the registry declares no further container.",
      { pointer: "lib/study/learning-path.ts" },
    );
  }

  // ------------------------------------------------------------ RTI course units
  addNode({
    id: "course:rti",
    kind: "course",
    label: RTI_COURSE.title,
    subject: "fabric",
  });
  addEdge("programme:fabric-rti", "course:rti", "contains", "structure", "The fabric-rti programme holds this course.", {
    pointer: "lib/rti/lessons.ts#RTI_COURSE",
  });
  for (const lesson of RTI_LESSONS) {
    const unitId = `unit:rti-${lesson.id}`;
    addUnit({
      id: unitId,
      label: lesson.title,
      subject: "fabric",
      unitKind: "rti-lesson",
      href: `/lab/rti/${lesson.slug}/`,
      text: [lesson.title, lesson.summary, lesson.objective, ...lesson.objectives, lesson.domain].join(". "),
      container: "course:rti",
      coverage: "Source-anchored workshop lesson",
      stage: lesson.order <= 2 ? "Foundation" : "Applied",
    });
    addEdge("course:rti", unitId, "contains", "structure", `Lesson ${lesson.order} of ${RTI_LESSONS.length} in the RTI course.`, {
      pointer: "lib/rti/lessons.ts#RTI_LESSONS",
      weight: lesson.order,
    });
  }

  // --------------------------------------------------------------- prerequisites
  for (const unit of canonical.values()) {
    for (const prerequisite of unit.lessonPrerequisites ?? []) {
      if (!canonical.has(prerequisite)) {
        diagnostics.push({
          level: "error",
          code: "unknown-prerequisite",
          message: `${unit.id} declares prerequisite ${prerequisite}, which is not a registry unit`,
        });
        continue;
      }
      addEdge(prerequisite, unit.id, "prerequisite", "declared", `${unit.title} declares “${canonical.get(prerequisite)!.title}” as a prerequisite.`, {
        pointer: `lib/study/learning-path.ts#${unit.id}.lessonPrerequisites`,
      });
    }
  }

  // ------------------------------------------------- co-citation (derived edges)
  const citationBySource = new Map<string, string[]>();
  for (const edge of edges) {
    if (edge.kind !== "cites") continue;
    const list = citationBySource.get(edge.to) ?? [];
    list.push(edge.from);
    citationBySource.set(edge.to, list);
  }
  const pairWeights = new Map<string, { a: string; b: string; via: string[] }>();
  for (const [sourceId, citing] of citationBySource) {
    const unique = Array.from(new Set(citing)).sort();
    for (let i = 0; i < unique.length; i += 1) {
      for (let j = i + 1; j < unique.length; j += 1) {
        const key = `${unique[i]}|${unique[j]}`;
        const existing = pairWeights.get(key);
        if (existing) existing.via.push(sourceId);
        else pairWeights.set(key, { a: unique[i], b: unique[j], via: [sourceId] });
      }
    }
  }
  // Keep the strongest few partners per unit so the graph stays readable. The
  // full co-citation list is still exposed in the inspector for the selected node.
  const partnersPerUnit = new Map<string, { other: string; via: string[] }[]>();
  for (const pair of pairWeights.values()) {
    const listA = partnersPerUnit.get(pair.a) ?? [];
    listA.push({ other: pair.b, via: pair.via });
    partnersPerUnit.set(pair.a, listA);
    const listB = partnersPerUnit.get(pair.b) ?? [];
    listB.push({ other: pair.a, via: pair.via });
    partnersPerUnit.set(pair.b, listB);
  }
  const keepPair = new Set<string>();
  for (const [unitId, partners] of partnersPerUnit) {
    partners
      .sort((x, y) => y.via.length - x.via.length || (x.other < y.other ? -1 : 1))
      .slice(0, 4)
      .forEach((partner) => keepPair.add([unitId, partner.other].sort().join("|")));
  }
  for (const pair of pairWeights.values()) {
    if (!keepPair.has(`${pair.a}|${pair.b}`)) continue;
    const weight = pair.via.length;
    const sourceLabels = pair.via
      .slice(0, 3)
      .map((id) => nodes.find((node) => node.id === id)?.label ?? id)
      .join("; ");
    addEdge(pair.a, pair.b, "co-citation", "derived", `Both notes cite ${weight} shared source${weight > 1 ? "s" : ""}: ${sourceLabels}.`, {
      weight,
      via: pair.via,
    });
  }

  // ------------------------------------------------------------------ validation
  const nodeIds = new Set(nodes.map((node) => node.id));
  for (const edge of edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      diagnostics.push({ level: "error", code: "dangling-edge", message: `${edge.id} has a missing endpoint` });
    }
    if (edge.from === edge.to) {
      diagnostics.push({ level: "error", code: "self-edge", message: `${edge.id} points at itself` });
    }
  }
  const duplicateEdges = new Map<string, number>();
  for (const edge of edges) duplicateEdges.set(edge.id, (duplicateEdges.get(edge.id) ?? 0) + 1);
  for (const [id, count] of duplicateEdges) {
    if (count > 1) diagnostics.push({ level: "error", code: "duplicate-edge", message: `${id} appears ${count} times` });
  }
  for (const subject of curriculum().subjects) {
    const held = units.filter((unit) => unit.subject === subject.id);
    if (!held.length) diagnostics.push({ level: "warning", code: "empty-subject", message: `Subject ${subject.id} has no units` });
  }
  const covered = new Set(edges.filter((edge) => edge.kind === "contains").map((edge) => edge.to));
  for (const unit of units) {
    if (!covered.has(unit.id)) diagnostics.push({ level: "warning", code: "unit-uncontained", message: `${unit.id} is not contained by any node` });
  }

  return { nodes: nodes.sort(byId), edges: edges.sort(byId), diagnostics, units };
}
