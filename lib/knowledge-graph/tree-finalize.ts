import type { Hierarchy, TreeReport, TreeNode } from "./hierarchy";

/**
 * Recompute the structural fields after a lens projection or after the Academy
 * tree is assembled. The subject forest is already finalised in `hierarchy.ts`;
 * programme lenses re-root a subtree, so children, depth and descendant counts
 * must be derived again rather than copied from the subject forest.
 */
export function finalizeTree(input: {
  version: string;
  roots: string[];
  nodes: TreeNode[];
  crossRefs: Hierarchy["crossRefs"];
  extras?: Partial<TreeReport>;
}): Hierarchy {
  const nodes = input.nodes.map((node) => ({ ...node }));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const childrenOf = new Map<string, TreeNode[]>();
  for (const node of nodes) {
    if (!node.parent) continue;
    const parent = byId.get(node.parent);
    if (!parent) continue;
    const list = childrenOf.get(parent.id) ?? [];
    list.push(node);
    childrenOf.set(parent.id, list);
  }
  for (const node of nodes) {
    node.children = (childrenOf.get(node.id) ?? []).length;
    node.descendants = 0;
    node.contentDescendants = 0;
  }

  const depthOf = new Map<string, number>();
  const queue: string[] = [];
  for (const root of input.roots) {
    if (!byId.has(root)) continue;
    depthOf.set(root, 0);
    queue.push(root);
  }
  while (queue.length) {
    const id = queue.shift()!;
    for (const child of childrenOf.get(id) ?? []) {
      depthOf.set(child.id, (depthOf.get(id) ?? 0) + 1);
      queue.push(child.id);
    }
  }

  const ordered = [...nodes].sort((a, b) => (depthOf.get(b.id) ?? 0) - (depthOf.get(a.id) ?? 0));
  for (const node of ordered) {
    for (const child of childrenOf.get(node.id) ?? []) {
      node.descendants += child.descendants + 1;
      node.contentDescendants +=
        child.contentDescendants + (child.kind === "unit" || child.kind === "source" || child.kind === "page" ? 1 : 0);
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

  const roots = input.roots
    .map((id) => byId.get(id))
    .filter((node): node is TreeNode => Boolean(node))
    .map((node) => ({ id: node.id, label: node.label, children: node.children, descendants: node.descendants }));

  const report: TreeReport = {
    roots,
    nodeCount: nodes.length,
    edgeCount: nodes.length - roots.length,
    depth: depthOf.size ? Math.max(...depthOf.values()) : 0,
    depthHistogram,
    branching: {
      max: childCounts.length ? Math.max(...childCounts) : 0,
      median: childCounts.length ? childCounts[Math.floor(childCounts.length / 2)] : 0,
      nodesOver12: childCounts.filter((count) => count > 12).length,
      buckets,
    },
    orphans: input.extras?.orphans ?? { unitsWithoutParent: 0, unfiled: [] },
    multiParent: input.extras?.multiParent ?? [],
    excludedProgrammes: input.extras?.excludedProgrammes ?? [],
    reattached: input.extras?.reattached ?? [],
    emptyContainers: input.extras?.emptyContainers ?? [],
    hiddenEmptyPacks: input.extras?.hiddenEmptyPacks ?? [],
    duplicateChapterIds: input.extras?.duplicateChapterIds ?? [],
    sourceGroups: input.extras?.sourceGroups ?? [],
    sourceBuckets: input.extras?.sourceBuckets ?? [],
    ungroupedSources: input.extras?.ungroupedSources ?? [],
    chapterGroups: input.extras?.chapterGroups ?? [],
    directUnits: input.extras?.directUnits ?? [],
  };

  return {
    version: input.version,
    roots: roots.map((root) => root.id),
    nodes,
    crossRefs: input.crossRefs,
    report,
  };
}
