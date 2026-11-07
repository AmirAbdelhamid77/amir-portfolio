import type { Hierarchy, TreeNode, TreeReport } from "./hierarchy";
import { buildHierarchy } from "./hierarchy";
import { ACADEMY_ROOT, buildAcademyTree } from "./academy-tree";
import { finalizeTree } from "./tree-finalize";

export type LensId = "subject" | "dp-600" | "fabric-rti" | "academy";
export type LensMode = "subject" | "programme";

export interface LensDefinition {
  id: LensId;
  mode: LensMode;
  label: string;
  shortLabel: string;
  file: string;
  description: string;
}

export interface LensTree {
  lens: LensDefinition;
  tree: Hierarchy;
}

export const LENSES: readonly LensDefinition[] = [
  {
    id: "subject",
    mode: "subject",
    label: "By subject",
    shortLabel: "Subjects",
    file: "tree.json",
    description: "Eight disjoint subject roots. Containment only; programmes are separate lenses.",
  },
  {
    id: "dp-600",
    mode: "programme",
    label: "By programme",
    shortLabel: "DP-600",
    file: "tree-dp600.json",
    description:
      "The declared Fabric subject projected under the DP-600 programme. RTI, Academy and the nine empty packs are excluded. Not an exam blueprint.",
  },
  {
    id: "fabric-rti",
    mode: "programme",
    label: "By programme",
    shortLabel: "Fabric RTI",
    file: "tree-rti.json",
    description: "The RTI course and its eight lessons, under the Fabric RTI programme.",
  },
  {
    id: "academy",
    mode: "programme",
    label: "By programme",
    shortLabel: "Corpus Academy",
    file: "tree-academy.json",
    description: "Two MIT-licensed academy tracks, grouped by declared module and lesson.",
  },
];

const VERSION = "knowledge-tree-2026-11-07.1";

function subtreeIds(tree: Hierarchy, rootId: string): Set<string> {
  const children = new Map<string, string[]>();
  for (const node of tree.nodes) {
    if (!node.parent) continue;
    const list = children.get(node.parent) ?? [];
    list.push(node.id);
    children.set(node.parent, list);
  }
  const ids = new Set<string>();
  const queue = [rootId];
  while (queue.length) {
    const id = queue.shift()!;
    if (ids.has(id)) continue;
    ids.add(id);
    for (const child of children.get(id) ?? []) queue.push(child);
  }
  return ids;
}

function filterExtras(base: Hierarchy, keep: Set<string>): Partial<TreeReport> {
  return {
    orphans: { unitsWithoutParent: 0, unfiled: [] },
    multiParent: base.report.multiParent.filter((entry) => keep.has(entry.id)),
    excludedProgrammes: [],
    reattached: base.report.reattached.filter((entry) => keep.has(entry.id)),
    emptyContainers: base.report.emptyContainers,
    hiddenEmptyPacks: base.report.hiddenEmptyPacks,
    duplicateChapterIds: base.report.duplicateChapterIds,
    sourceGroups: base.report.sourceGroups.filter((entry) => keep.has(entry.id)),
    sourceBuckets: base.report.sourceBuckets.filter((entry) => keep.has(entry.id)),
    ungroupedSources: base.report.ungroupedSources.filter((entry) => keep.has(entry.id)),
    chapterGroups: base.report.chapterGroups.filter((entry) => keep.has(entry.id)),
    directUnits: base.report.directUnits.filter((entry) => keep.has(entry.id)),
  };
}

function projectFabricAsDp600(base: Hierarchy): Hierarchy {
  const fabric = base.nodes.find((node) => node.id === "subject:fabric");
  if (!fabric) throw new Error("subject:fabric missing from the subject tree");
  const rti = base.nodes.find((node) => node.id === "course:rti");
  if (!rti) throw new Error("course:rti missing from the subject tree");

  const fabricIds = subtreeIds(base, fabric.id);
  const rtiIds = subtreeIds(base, rti.id);
  const keep = new Set([...fabricIds].filter((id) => id !== fabric.id && !rtiIds.has(id)));

  const nodes: TreeNode[] = [
    {
      ...fabric,
      id: "programme:dp-600",
      parent: null,
      label: "DP-600",
      kind: "programme",
      subject: "fabric",
      order: 0,
      href: "/learn/dp-600/",
      description:
        "Programme lens over the declared Fabric subject. It is not a claim that every Fabric pack is DP-600-specific. RTI and Corpus Academy have their own lenses; the nine packs without notes are hidden.",
    },
  ];
  for (const node of base.nodes) {
    if (!keep.has(node.id)) continue;
    nodes.push({
      ...node,
      parent: node.parent === fabric.id ? "programme:dp-600" : node.parent,
    });
  }

  return finalizeTree({
    version: `${VERSION}-dp600`,
    roots: ["programme:dp-600"],
    nodes,
    crossRefs: base.crossRefs.filter((edge) => keep.has(edge.from) && keep.has(edge.to)),
    extras: filterExtras(base, keep),
  });
}

function projectRti(base: Hierarchy): Hierarchy {
  const course = base.nodes.find((node) => node.id === "course:rti");
  if (!course) throw new Error("course:rti missing from the subject tree");
  const keep = subtreeIds(base, course.id);
  const root: TreeNode = {
    ...course,
    id: "programme:fabric-rti",
    parent: null,
    label: "Fabric RTI",
    kind: "programme",
    subject: "fabric",
    order: 0,
    href: "/learn/fabric-rti/",
    description:
      "The RTI programme and its course. Lessons stay attached to the course; the programme is a lens, not a second parent in the subject forest.",
  };
  const nodes: TreeNode[] = [root];
  for (const node of base.nodes) {
    if (!keep.has(node.id)) continue;
    nodes.push({ ...node, parent: node.id === course.id ? root.id : node.parent });
  }
  return finalizeTree({
    version: `${VERSION}-rti`,
    roots: [root.id],
    nodes,
    crossRefs: base.crossRefs.filter((edge) => keep.has(edge.from) && keep.has(edge.to)),
    extras: {
      ...filterExtras(base, keep),
      excludedProgrammes: [],
      reattached: base.report.reattached.filter((entry) => entry.id === course.id),
      emptyContainers: [],
      hiddenEmptyPacks: [],
      sourceGroups: [],
      sourceBuckets: [],
      ungroupedSources: [],
      chapterGroups: [],
      duplicateChapterIds: base.report.duplicateChapterIds,
    },
  });
}

export function buildLenses(): LensTree[] {
  const subject = buildHierarchy();
  const academy = buildAcademyTree();
  return [
    { lens: LENSES[0], tree: subject },
    { lens: LENSES[1], tree: projectFabricAsDp600(subject) },
    { lens: LENSES[2], tree: projectRti(subject) },
    { lens: LENSES[3], tree: academy },
  ];
}

export function buildLens(id: LensId): LensTree {
  return buildLenses().find((entry) => entry.lens.id === id)!;
}

export { ACADEMY_ROOT };
