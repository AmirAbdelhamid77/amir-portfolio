import { curriculum } from "@/lib/curriculum/model";
import fabricNotes from "@/content/fabric/notes.json";
import { buildGraphSource } from "./build";
import { sourceGroupFor } from "./source-groups";
import type { GraphNode, NodeKind } from "./types";

/**
 * The expanding tree is built from the corpus's own containment edges
 * (`structure` layer). It is deliberately separate from the citation graph:
 * this view answers "what belongs under what", never "what is like what".
 *
 * The corpus hierarchy is *almost* a tree. Two facts break it at the top:
 *
 * 1. the `fabric` subject is declared by three programmes (dp-600,
 *    fabric-rti, academy), so programme → subject is many-to-many;
 * 2. the RTI course hangs off the `fabric-rti` programme, not off a subject.
 *
 * Using programmes as tree levels would therefore either duplicate Fabric
 * units under three roots or invent an owner. Roots are the eight disjoint
 * subjects instead, and the RTI course is re-attached to the subject its own
 * lessons declare. Both decisions are reported, not hidden. Programme lenses
 * are projections built in `lenses.ts`, not extra roots in this forest.
 *
 * Two navigational layers are synthetic and marked as such:
 *
 * - repeated chapter titles inside a pack become one chapter container;
 * - cited sources are grouped by URL host and documentation area.
 *
 * Neither adds a knowledge claim. Both exist so a learner does not page
 * seventeen times through one bucket.
 */

export type TreeKind = NodeKind | "group" | "more";

export interface TreeNode {
  id: string;
  parent: string | null;
  label: string;
  kind: TreeKind;
  subject: string;
  /** Position inside the parent, from the corpus declaration when it has one. */
  order: number;
  /** Number of all descendants, including synthetic grouping nodes. */
  descendants: number;
  /** Number of descendants that are content (unit/source/page). Used for size. */
  contentDescendants: number;
  /** Number of direct children before the 12-per-page limit. */
  children: number;
  href?: string;
  unitKind?: string;
  stage?: string;
  /** True for URL, chapter and lens grouping nodes. */
  synthetic?: boolean;
  groupHost?: string;
  groupArea?: string;
  groupCount?: number;
  description?: string;
}

export interface SourceGroupReport {
  id: string;
  label: string;
  count: number;
  parent: string;
  host: string;
  area: string;
}

export interface TreeReport {
  roots: { id: string; label: string; children: number; descendants: number }[];
  nodeCount: number;
  edgeCount: number;
  depth: number;
  depthHistogram: Record<string, number>;
  branching: {
    max: number;
    median: number;
    nodesOver12: number;
    buckets: Record<string, number>;
  };
  orphans: { unitsWithoutParent: number; unfiled: string[] };
  multiParent: { id: string; label: string; parents: string[] }[];
  excludedProgrammes: { id: string; label: string; subjects: string[] }[];
  reattached: { id: string; label: string; from: string; to: string; reason: string }[];
  /** Packs declared by the corpus with no chapter notes. Hidden from learners. */
  emptyContainers: { id: string; label: string }[];
  hiddenEmptyPacks: { id: string; label: string; reason: string }[];
  duplicateChapterIds: { id: string; count: number }[];
  sourceGroups: SourceGroupReport[];
  sourceBuckets: { id: string; label: string; count: number }[];
  ungroupedSources: { id: string; label: string; href?: string }[];
  chapterGroups: { id: string; label: string; parent: string; count: number }[];
  directUnits: { id: string; label: string; subject: string }[];
}

export interface Hierarchy {
  version: string;
  roots: string[];
  nodes: TreeNode[];
  crossRefs: { from: string; to: string; kind: "cites" | "derived-from" | "prerequisite" }[];
  report: TreeReport;
}

const SOURCE_BUCKET: Record<string, { id: string; label: string }> = {
  fabric: { id: "group:sources:fabric", label: "Cited sources" },
  visualization: { id: "group:sources:visualization", label: "Source pages" },
};

const CONTAINER_KINDS = new Set<NodeKind>(["pack", "journey", "chapter", "course"]);

type NoteChapter = { id: string; title: string; refs?: string[]; points?: string[]; questionIds?: string[] };
type NotePack = { pack: string; chapters: NoteChapter[] };

function slug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "group";
}

export function buildHierarchy(): Hierarchy {
  const source = buildGraphSource();
  const nodeById = new Map(source.nodes.map((node) => [node.id, node]));
  const subjectTitle = new Map(curriculum().subjects.map((subject) => [subject.id as string, subject.title as string]));

  // Parent edges as they are declared, minus programmes (see note above).
  const declaredParents = new Map<string, string[]>();
  const declaredOrder = new Map<string, number>();
  for (const edge of source.edges) {
    if (edge.kind !== "contains") continue;
    const parents = declaredParents.get(edge.to) ?? [];
    parents.push(edge.from);
    declaredParents.set(edge.to, parents);
    // Units carry their 1-based position in the container; sections likewise.
    if (edge.weight !== undefined) declaredOrder.set(edge.to, edge.weight);
  }

  const programmeIds = new Set(source.nodes.filter((node) => node.kind === "programme").map((node) => node.id));
  const excludedProgrammes = source.nodes
    .filter((node) => node.kind === "programme")
    .map((node) => ({
      id: node.id,
      label: node.label,
      subjects: (source.nodes.filter((item) => item.kind === "subject" && declaredParents.get(item.id)?.includes(node.id)) ?? []).map(
        (item) => item.subject ?? item.id,
      ),
    }));

  const multiParent = [...declaredParents.entries()]
    .filter(([, parents]) => parents.filter((parent) => !programmeIds.has(parent)).length > 1)
    .map(([id, parents]) => ({ id, label: nodeById.get(id)?.label ?? id, parents }));

  // The RTI lessons all declare `fabric`; the course sits under a programme.
  // Re-attach the course to that subject once, and report it.
  const reattached: TreeReport["reattached"] = [];
  const courseParent = new Map<string, string>();
  for (const node of source.nodes) {
    if (node.kind !== "course") continue;
    const declared = (declaredParents.get(node.id) ?? []).find((parent) => !programmeIds.has(parent));
    if (declared) {
      courseParent.set(node.id, declared);
      continue;
    }
    const lessons = (source.edges.filter((edge) => edge.kind === "contains" && edge.from === node.id) ?? []).map(
      (edge) => nodeById.get(edge.to),
    );
    const subjects = [...new Set(lessons.map((lesson) => lesson?.subject).filter((value): value is string => Boolean(value)))];
    if (subjects.length === 1) {
      courseParent.set(node.id, `subject:${subjects[0]}`);
      reattached.push({
        id: node.id,
        label: node.label,
        from: (declaredParents.get(node.id) ?? []).join(", "),
        to: `subject:${subjects[0]}`,
        reason: "The course's own lessons declare one subject; the programme that holds the course is a track, not a parent.",
      });
    }
  }

  // ------------------------------------------------------- empty pack detection
  const notes = fabricNotes as unknown as NotePack[];
  const notesByPack = new Map(notes.map((entry) => [entry.pack, entry]));
  const declaredPacks = source.nodes.filter((node) => node.kind === "pack");
  const emptyPackIds = new Set(
    declaredPacks
      .filter((node) => {
        const entry = notesByPack.get(node.id.replace(/^pack:/, ""));
        return !entry || entry.chapters.length === 0;
      })
      .map((node) => node.id),
  );
  const emptyContainers = declaredPacks
    .filter((node) => emptyPackIds.has(node.id))
    .map((node) => ({ id: node.id, label: node.label }));
  const hiddenEmptyPacks = emptyContainers.map((entry) => ({
    ...entry,
    reason: "Declared by the corpus, but no chapter notes exist yet. Hidden from learners to avoid a dead end.",
  }));

  // ---------------------------------------------- repeated chapter-title groups
  // A pack can declare many notes with the same chapter title. Those are one
  // lecture/topic split into notes, not 96 unrelated children. Grouping by the
  // declared title is a display layer; it does not create a new topic or edge.
  interface ChapterGroupDef {
    id: string;
    parent: string;
    label: string;
    order: number;
    unitIds: string[];
  }
  const chapterGroupByUnit = new Map<string, string>();
  const chapterGroupDefs: ChapterGroupDef[] = [];
  const usedChapterGroupIds = new Set<string>();
  for (const pack of notes) {
    const parent = `pack:${pack.pack}`;
    if (emptyPackIds.has(parent)) continue;
    const byTitle = new Map<string, { title: string; chapters: NoteChapter[]; first: number }>();
    pack.chapters.forEach((chapter, index) => {
      const title = chapter.title.trim();
      const entry = byTitle.get(title) ?? { title, chapters: [], first: index };
      entry.chapters.push(chapter);
      byTitle.set(title, entry);
    });
    for (const entry of byTitle.values()) {
      if (entry.chapters.length < 2) continue;
      let id = `group:chapter:${pack.pack}:${slug(entry.title)}`;
      let suffix = 2;
      while (usedChapterGroupIds.has(id)) id = `group:chapter:${pack.pack}:${slug(entry.title)}-${suffix++}`;
      usedChapterGroupIds.add(id);
      const unitIds = entry.chapters.map((chapter) => `note-${pack.pack}-${chapter.id}`);
      for (const unitId of unitIds) chapterGroupByUnit.set(unitId, id);
      chapterGroupDefs.push({ id, parent, label: entry.title, order: entry.first, unitIds });
    }
  }
  const chapterGroups = chapterGroupDefs
    .map((entry) => ({ id: entry.id, label: entry.label, parent: entry.parent, count: entry.unitIds.length }))
    .sort((a, b) => (a.parent < b.parent ? -1 : a.parent > b.parent ? 1 : a.label < b.label ? -1 : 1));

  // ----------------------------------------------------------------- tree nodes
  const nodes: TreeNode[] = [];
  const parentOf = new Map<string, string | null>();
  const orderOf = new Map<string, number>();

  const add = (node: GraphNode, parent: string | null, order: number, extra: Partial<TreeNode> = {}) => {
    nodes.push({
      id: node.id,
      parent,
      label: node.label,
      kind: node.kind,
      subject: node.subject ?? "unfiled",
      order,
      descendants: 0,
      contentDescendants: 0,
      children: 0,
      href: node.href,
      unitKind: node.unitKind,
      stage: node.stage,
      ...extra,
    });
    parentOf.set(node.id, parent);
    orderOf.set(node.id, order);
  };

  const subjects = source.nodes.filter((node) => node.kind === "subject").sort((a, b) => (a.id < b.id ? -1 : 1));
  for (const subject of subjects) add(subject, null, 0);

  // Containers, sorted by kind then declared position/label, under their subject.
  const containers = source.nodes
    .filter((node) => CONTAINER_KINDS.has(node.kind))
    .map((node) => {
      const parent = node.kind === "course" ? courseParent.get(node.id) ?? null : declaredParents.get(node.id)?.[0] ?? null;
      return { node, parent };
    })
    .filter((entry) => entry.parent !== null && !programmeIds.has(entry.parent) && !emptyPackIds.has(entry.node.id));

  containers.sort((a, b) => {
    const rank = (kind: NodeKind) => (kind === "course" ? 0 : kind === "pack" ? 1 : kind === "journey" ? 1 : kind === "chapter" ? 1 : 2);
    return (
      rank(a.node.kind) - rank(b.node.kind) ||
      (declaredOrder.get(a.node.id) ?? 0) - (declaredOrder.get(b.node.id) ?? 0) ||
      (a.node.label < b.node.label ? -1 : 1)
    );
  });

  const containerIds = new Set(containers.map((entry) => entry.node.id));
  const childIndex = new Map<string, number>();
  for (const entry of containers) {
    if (!entry.parent || !nodeById.has(entry.parent)) continue;
    const index = childIndex.get(entry.parent) ?? 0;
    childIndex.set(entry.parent, index + 1);
    add(entry.node, entry.parent, declaredOrder.get(entry.node.id) ?? index);
  }

  // Synthetic chapter containers sit between a pack and its repeated notes.
  for (const entry of chapterGroupDefs.sort((a, b) =>
    a.parent < b.parent ? -1 : a.parent > b.parent ? 1 : a.order - b.order,
  )) {
    const index = childIndex.get(entry.parent) ?? 0;
    childIndex.set(entry.parent, index + 1);
    add(
      {
        id: entry.id,
        kind: "chapter",
        label: entry.label,
        subject: "fabric",
      },
      entry.parent,
      entry.order,
      {
        synthetic: true,
        description: `Grouped from ${entry.unitIds.length} notes that declare the same chapter title.`,
      },
    );
  }

  // Units: their chapter group, their declared container, or their subject.
  const units = source.nodes.filter((node) => node.kind === "unit");
  const orphans: string[] = [];
  const directUnits: TreeReport["directUnits"] = [];
  const sortedUnits = [...units].sort((a, b) => {
    const pa = chapterGroupByUnit.get(a.id) ?? declaredParents.get(a.id)?.find((parent) => containerIds.has(parent));
    const pb = chapterGroupByUnit.get(b.id) ?? declaredParents.get(b.id)?.find((parent) => containerIds.has(parent));
    if (pa !== pb) return (pa ?? "") < (pb ?? "") ? -1 : 1;
    return (declaredOrder.get(a.id) ?? 0) - (declaredOrder.get(b.id) ?? 0) || (a.id < b.id ? -1 : 1);
  });
  for (const unit of sortedUnits) {
    const container = chapterGroupByUnit.get(unit.id) ?? declaredParents.get(unit.id)?.find((parent) => containerIds.has(parent));
    let parent = container ?? null;
    if (!parent) {
      const subjectId = unit.subject ? `subject:${unit.subject}` : null;
      if (subjectId && nodeById.has(subjectId)) {
        parent = subjectId;
        directUnits.push({ id: unit.id, label: unit.label, subject: unit.subject ?? "" });
      } else {
        orphans.push(unit.id);
      }
    }
    if (!parent) continue;
    const index = childIndex.get(parent) ?? 0;
    childIndex.set(parent, index + 1);
    add(unit, parent, declaredOrder.get(unit.id) ?? index);
  }

  // Declared sources: one visible bucket per subject, because a source is cited
  // by many units and repeating it under each would not be a tree. Fabric's 198
  // sources get one factual URL-derived layer so the bucket is browsable.
  const sourceGroups: TreeReport["sourceGroups"] = [];
  const sourceBuckets: TreeReport["sourceBuckets"] = [];
  const ungroupedSources: TreeReport["ungroupedSources"] = [];
  const sourceDocs = source.nodes.filter((node) => node.kind === "source" || node.kind === "page");
  for (const subject of subjects) {
    const docs = sourceDocs.filter((doc) => doc.subject === subject.subject).sort((a, b) => (a.label < b.label ? -1 : 1));
    if (!docs.length) continue;
    const bucket = SOURCE_BUCKET[subject.subject ?? ""] ?? {
      id: `group:sources:${subject.subject ?? "unfiled"}`,
      label: "Sources",
    };
    const bucketNode: GraphNode = {
      id: bucket.id,
      kind: "unit",
      label: bucket.label,
      subject: subject.subject,
    };
    const index = childIndex.get(subject.id) ?? 0;
    childIndex.set(subject.id, index + 1);
    add(bucketNode, subject.id, 1000 + index, {
      kind: "group",
      description:
        subject.subject === "fabric"
          ? "All cited documents for this subject. A source can be cited by many notes, so it is collected once here."
          : "Source pages linked from the subject's own lessons.",
    });
    sourceBuckets.push({ id: bucket.id, label: bucket.label, count: docs.length });

    if (subject.subject !== "fabric") {
      for (const doc of docs) add(doc, bucket.id, 0);
      continue;
    }

    const grouped = new Map<string, { id: string; label: string; host: string; area: string; sortKey: string; docs: GraphNode[] }>();
    for (const doc of docs) {
      const group = sourceGroupFor(doc.href);
      if (!group) {
        ungroupedSources.push({ id: doc.id, label: doc.label, href: doc.href });
        add(doc, bucket.id, 0);
        continue;
      }
      const entry = grouped.get(group.key) ?? {
        id: group.id,
        label: group.label,
        host: group.host,
        area: group.area,
        sortKey: group.sortKey,
        docs: [],
      };
      entry.docs.push(doc);
      grouped.set(group.key, entry);
    }

    const orderedGroups = [...grouped.values()].sort(
      (a, b) => b.docs.length - a.docs.length || (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0),
    );
    for (const group of orderedGroups) {
      const groupNode: GraphNode = {
        id: group.id,
        kind: "unit",
        label: group.label,
        subject: "fabric",
      };
      add(groupNode, bucket.id, 0, {
        kind: "group",
        synthetic: true,
        groupHost: group.host,
        groupArea: group.area,
        groupCount: group.docs.length,
        description: "Grouped from the source URL (host + documentation area). Not a declared corpus taxonomy.",
      });
      sourceGroups.push({
        id: group.id,
        label: group.label,
        count: group.docs.length,
        parent: bucket.id,
        host: group.host,
        area: group.area,
      });
      group.docs.sort((a, b) => (a.label < b.label ? -1 : 1));
      for (const doc of group.docs) add(doc, group.id, 0);
    }
  }

  // Unfiled root, only if something genuinely has no home.
  if (orphans.length) {
    const unfiled: GraphNode = { id: "root:unfiled", kind: "subject", label: "Unfiled", subject: "unfiled" } as GraphNode;
    add(unfiled, null, 0);
    for (const id of orphans) {
      const node = nodeById.get(id);
      if (node) add(node, "root:unfiled", orderOf.get(id) ?? 0);
    }
  }

  // --------------------------------------------------------------- descendants
  const childrenOf = new Map<string, TreeNode[]>();
  for (const node of nodes) {
    if (!node.parent) continue;
    const list = childrenOf.get(node.parent) ?? [];
    list.push(node);
    childrenOf.set(node.parent, list);
  }
  for (const node of nodes) node.children = (childrenOf.get(node.id) ?? []).length;

  // Post-order traversal without recursion depth concerns.
  const depthOf = new Map<string, number>();
  for (const root of nodes.filter((node) => !node.parent)) depthOf.set(root.id, 0);
  const queue = nodes.filter((node) => !node.parent).map((node) => node.id);
  while (queue.length) {
    const id = queue.shift()!;
    for (const child of childrenOf.get(id) ?? []) {
      depthOf.set(child.id, (depthOf.get(id) ?? 0) + 1);
      queue.push(child.id);
    }
  }
  for (const node of [...nodes].sort((a, b) => (depthOf.get(b.id) ?? 0) - (depthOf.get(a.id) ?? 0))) {
    for (const child of childrenOf.get(node.id) ?? []) {
      node.descendants += child.descendants + 1;
      node.contentDescendants += child.contentDescendants + (child.kind === "unit" || child.kind === "source" || child.kind === "page" ? 1 : 0);
    }
  }

  const depthHistogram: Record<string, number> = {};
  for (const value of depthOf.values()) depthHistogram[String(value)] = (depthHistogram[String(value)] ?? 0) + 1;

  const childCounts = nodes.filter((node) => node.children > 0).map((node) => node.children).sort((a, b) => a - b);
  const buckets: Record<string, number> = {};
  for (const count of childCounts) {
    const key = count <= 12 ? String(count) : count <= 24 ? "13–24" : count <= 48 ? "25–48" : "49+";
    buckets[key] = (buckets[key] ?? 0) + 1;
  }

  const chapterCounts = new Map<string, number>();
  for (const entry of notes) for (const chapter of entry.chapters) chapterCounts.set(chapter.id, (chapterCounts.get(chapter.id) ?? 0) + 1);
  const duplicateChapterIds = [...chapterCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count || (a.id < b.id ? -1 : 1));

  const crossRefs = source.edges
    .filter(
      (edge) =>
        (edge.kind === "cites" || edge.kind === "derived-from" || edge.kind === "prerequisite") && edge.layer === "declared",
    )
    .map((edge) => ({ from: edge.from, to: edge.to, kind: edge.kind as "cites" | "derived-from" | "prerequisite" }));

  const roots = nodes.filter((node) => !node.parent);
  const report: TreeReport = {
    roots: roots.map((node) => ({ id: node.id, label: node.label, children: node.children, descendants: node.descendants })),
    nodeCount: nodes.length,
    edgeCount: nodes.length - roots.length,
    depth: Math.max(...depthOf.values()),
    depthHistogram,
    branching: {
      max: childCounts.length ? Math.max(...childCounts) : 0,
      median: childCounts.length ? childCounts[Math.floor(childCounts.length / 2)] : 0,
      nodesOver12: childCounts.filter((count) => count > 12).length,
      buckets,
    },
    orphans: { unitsWithoutParent: units.length - sortedUnits.filter((unit) => parentOf.has(unit.id)).length, unfiled: orphans },
    multiParent,
    excludedProgrammes,
    reattached,
    emptyContainers,
    hiddenEmptyPacks,
    duplicateChapterIds,
    sourceGroups,
    sourceBuckets,
    ungroupedSources,
    chapterGroups,
    directUnits,
  };

  return {
    version: "knowledge-tree-2026-11-07.1",
    roots: roots.map((node) => node.id),
    nodes,
    crossRefs,
    report,
  };
}
