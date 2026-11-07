import { ACADEMY_TRACKS, academyLessonHref, type CorpusLesson } from "@/lib/academy/corpus";
import type { Hierarchy, TreeNode } from "./hierarchy";
import { finalizeTree } from "./tree-finalize";

/**
 * Corpus Academy is a programme with its own declared track → module → lesson
 * structure in `content/academy/lessons.json`. It is not part of the subject
 * forest: attaching it to Fabric or Power BI would invent a subject→track edge
 * and duplicate the courseware across two lenses.
 *
 * The lesson title, module title, track title, order and href all come from the
 * corpus. This module only creates the tree nodes; it does not rewrite content.
 */
export const ACADEMY_ROOT = "programme:academy";

function slug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "module";
}

function cleanModule(value: string): string {
  return value.trim().replace(/^['"`]+|['"`]+$/g, "").trim();
}

export function buildAcademyTree(): Hierarchy {
  const nodes: TreeNode[] = [
    {
      id: ACADEMY_ROOT,
      parent: null,
      label: "Corpus Academy",
      kind: "programme",
      subject: "academy",
      order: 0,
      descendants: 0,
      contentDescendants: 0,
      children: 0,
      href: "/learn/academy/",
      description:
        "MIT-licensed Microsoft Learning courseware mirrored by the corpus. Two tracks, grouped by their declared module titles.",
    },
  ];

  ACADEMY_TRACKS.forEach((track, trackIndex) => {
    const trackId = `academy:track:${track.track}`;
    const subject = track.track === "power-bi" ? "power-bi" : "fabric";
    nodes.push({
      id: trackId,
      parent: ACADEMY_ROOT,
      label: track.title,
      kind: "course",
      subject,
      order: trackIndex,
      descendants: 0,
      contentDescendants: 0,
      children: 0,
      href: `/learn/academy/#academy-${track.track}`,
      description: `${track.lessons.length} lessons from ${track.repo}. MIT-licensed, attributed on each lesson page.`,
    });

    const byModule = new Map<string, { title: string; first: number; lessons: CorpusLesson[] }>();
    track.lessons.forEach((lesson, lessonIndex) => {
      const raw = lesson.module?.trim() || "Unfiled lessons";
      const key = cleanModule(raw);
      const entry = byModule.get(key) ?? { title: key, first: lessonIndex, lessons: [] };
      entry.lessons.push(lesson);
      byModule.set(key, entry);
    });

    let moduleIndex = 0;
    for (const entry of byModule.values()) {
      const moduleId = `academy:module:${track.track}:${slug(entry.title)}`;
      nodes.push({
        id: moduleId,
        parent: trackId,
        label: entry.title,
        kind: "chapter",
        subject,
        order: entry.first,
        descendants: 0,
        contentDescendants: 0,
        children: 0,
        description: `Declared module in ${track.title}; ${entry.lessons.length} lesson${entry.lessons.length === 1 ? "" : "s"}.`,
      });
      entry.lessons.forEach((lesson, lessonIndex) => {
        nodes.push({
          id: `academy:lesson:${track.track}:${lesson.slug}`,
          parent: moduleId,
          label: lesson.title,
          kind: "unit",
          unitKind: "lesson",
          subject,
          order: lessonIndex + moduleIndex * 1000,
          descendants: 0,
          contentDescendants: 0,
          children: 0,
          href: academyLessonHref(lesson),
          description: [
            lesson.kind === "lab" ? "Lab" : "Demo",
            lesson.level,
            lesson.duration,
            lesson.description?.slice(0, 180),
          ]
            .filter(Boolean)
            .join(" · "),
        });
      });
      moduleIndex += 1;
    }
  });

  return finalizeTree({
    version: "knowledge-tree-academy-2026-11-07.1",
    roots: [ACADEMY_ROOT],
    nodes,
    crossRefs: [],
    extras: {
      hiddenEmptyPacks: [],
      sourceGroups: [],
      sourceBuckets: [],
      chapterGroups: [],
    },
  });
}
