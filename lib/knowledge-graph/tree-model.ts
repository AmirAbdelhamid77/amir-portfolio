import type { Hierarchy, TreeNode } from "./hierarchy";
import type { LensId } from "./lenses";

export const PAGE_SIZE = 12;
export const VISIBLE_CAP = 150;

export interface TreeState {
  lens: LensId;
  open: Set<string>;
  focus: string | null;
  selected: string | null;
  pages: Record<string, number>;
  keepBranches: boolean;
  overview: boolean;
}

export interface MoreNode {
  parentId: string;
  nextPage: number;
  remaining: number;
  total: number;
}

export interface VisibleNode {
  id: string;
  node: TreeNode;
  parentId: string | null;
  depth: number;
  /** Synthetic paging control; not a content node and not counted by the cap. */
  more?: MoreNode;
}

export interface VisibleResult {
  nodes: VisibleNode[];
  capReached: boolean;
  dataCount: number;
}

export interface TreeIndex {
  tree: Hierarchy;
  byId: Map<string, TreeNode>;
  childrenOf: Map<string, TreeNode[]>;
  roots: string[];
  order: Map<string, number>;
}

export function buildTreeIndex(tree: Hierarchy): TreeIndex {
  const byId = new Map(tree.nodes.map((node) => [node.id, node]));
  const childrenOf = new Map<string, TreeNode[]>();
  for (const node of tree.nodes) {
    if (!node.parent) continue;
    const list = childrenOf.get(node.parent) ?? [];
    list.push(node);
    childrenOf.set(node.parent, list);
  }
  for (const list of childrenOf.values()) {
    list.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label) || a.id.localeCompare(b.id));
  }
  const order = new Map<string, number>();
  tree.nodes.forEach((node, index) => order.set(node.id, index));
  return { tree, byId, childrenOf, roots: tree.roots, order };
}

export function emptyState(lens: LensId): TreeState {
  return {
    lens,
    open: new Set(),
    focus: null,
    selected: null,
    pages: {},
    keepBranches: false,
    overview: false,
  };
}

function cloneState(state: TreeState): TreeState {
  return {
    ...state,
    open: new Set(state.open),
    pages: { ...state.pages },
  };
}

export function childrenOf(index: TreeIndex, id: string): TreeNode[] {
  return index.childrenOf.get(id) ?? [];
}

export function siblingsOf(index: TreeIndex, id: string): string[] {
  const node = index.byId.get(id);
  if (!node) return [];
  const parent = node.parent;
  const list = parent ? childrenOf(index, parent) : index.roots.map((root) => index.byId.get(root)!).filter(Boolean);
  return list.map((item) => item.id);
}

export function ancestorPath(index: TreeIndex, id: string): string[] {
  const path: string[] = [];
  let node = index.byId.get(id);
  const seen = new Set<string>();
  while (node?.parent && !seen.has(node.parent)) {
    seen.add(node.parent);
    path.unshift(node.parent);
    node = index.byId.get(node.parent);
  }
  return path;
}

export function descendantIds(index: TreeIndex, id: string): string[] {
  const ids: string[] = [];
  const queue = [id];
  const seen = new Set<string>();
  while (queue.length) {
    const next = queue.shift()!;
    if (seen.has(next)) continue;
    seen.add(next);
    ids.push(next);
    for (const child of childrenOf(index, next)) queue.push(child.id);
  }
  return ids;
}

function removeSubtreeFromOpen(state: TreeState, index: TreeIndex, id: string) {
  for (const descendant of descendantIds(index, id)) {
    state.open.delete(descendant);
    delete state.pages[descendant];
  }
}

export function visibleNodes(index: TreeIndex, state: TreeState, cap = VISIBLE_CAP): VisibleResult {
  if (state.overview) {
    const nodes = [...index.tree.nodes]
      .map((node) => ({
        id: node.id,
        node,
        parentId: node.parent,
        depth: depthOf(index, node.id),
      }))
      .sort((a, b) => a.depth - b.depth || index.order.get(a.id)! - index.order.get(b.id)!);
    return { nodes, capReached: false, dataCount: nodes.length };
  }

  const out: VisibleNode[] = [];
  const queue: { id: string; depth: number }[] = index.roots.map((id) => ({ id, depth: 0 }));
  let dataCount = 0;
  let capReached = false;
  const emitted = new Set<string>();

  // Emission and expansion are separate. A child is emitted once, when its
  // parent is processed, and queued for expansion; when it is dequeued later
  // it must still be allowed to open even though it is already in `emitted`.
  // Conflating the two checks made every branch below depth 1 collapse.
  while (queue.length) {
    const current = queue.shift()!;
    const node = index.byId.get(current.id);
    if (!node) continue;

    if (!emitted.has(node.id)) {
      if (dataCount >= cap) {
        capReached = true;
        break;
      }
      emitted.add(node.id);
      out.push({ id: node.id, node, parentId: node.parent, depth: current.depth });
      dataCount += 1;
    }

    if (!state.open.has(node.id)) continue;
    const children = childrenOf(index, node.id);
    if (!children.length) continue;

    const page = Math.max(0, state.pages[node.id] ?? 0);
    const limit = (page + 1) * PAGE_SIZE;
    const visibleChildren = children.slice(0, limit);
    for (const child of visibleChildren) {
      if (dataCount >= cap) {
        capReached = true;
        break;
      }
      if (!emitted.has(child.id)) {
        emitted.add(child.id);
        out.push({ id: child.id, node: child, parentId: node.id, depth: current.depth + 1 });
        dataCount += 1;
      }
      queue.push({ id: child.id, depth: current.depth + 1 });
    }
    if (capReached) break;
    if (visibleChildren.length < children.length) {
      const remaining = children.length - visibleChildren.length;
      out.push({
        id: `more:${node.id}:${page + 1}`,
        node: {
          id: `more:${node.id}:${page + 1}`,
          parent: node.id,
          label: `+${remaining} more`,
          kind: "more",
          subject: node.subject,
          order: limit,
          descendants: remaining,
          contentDescendants: remaining,
          children: 0,
          synthetic: true,
        },
        parentId: node.id,
        depth: current.depth + 1,
        more: { parentId: node.id, nextPage: page + 1, remaining, total: children.length },
      });
    }
  }

  return { nodes: out, capReached, dataCount };
}

export function depthOf(index: TreeIndex, id: string): number {
  let depth = 0;
  let node = index.byId.get(id);
  const seen = new Set<string>();
  while (node?.parent && !seen.has(node.parent)) {
    seen.add(node.parent);
    depth += 1;
    node = index.byId.get(node.parent);
  }
  return depth;
}

export function countData(nodes: VisibleNode[]): number {
  return nodes.filter((node) => !node.more).length;
}

function wouldExceedCap(index: TreeIndex, state: TreeState): boolean {
  return countData(visibleNodes(index, state, VISIBLE_CAP * 2).nodes) > VISIBLE_CAP;
}

/**
 * Click a container. Opening closes its open siblings (and their descendants)
 * unless “Keep branches open” is on. Closing always removes the subtree.
 */
export function toggleNode(
  index: TreeIndex,
  state: TreeState,
  id: string,
): { state: TreeState; blocked: boolean; reason?: string } {
  const node = index.byId.get(id);
  if (!node || node.children === 0) return { state, blocked: false };

  const next = cloneState(state);
  next.focus = id;
  next.selected = id;

  if (next.open.has(id)) {
    removeSubtreeFromOpen(next, index, id);
    return { state: next, blocked: false };
  }

  if (!next.keepBranches) {
    for (const sibling of siblingsOf(index, id)) {
      if (sibling !== id) removeSubtreeFromOpen(next, index, sibling);
    }
  }
  next.open.add(id);

  if (wouldExceedCap(index, next)) {
    return {
      state,
      blocked: true,
      reason: "The 150-node view limit would be exceeded. Collapse a branch before opening this one.",
    };
  }
  return { state: next, blocked: false };
}

export function showMore(
  index: TreeIndex,
  state: TreeState,
  parentId: string,
): { state: TreeState; blocked: boolean; reason?: string } {
  const node = index.byId.get(parentId);
  if (!node) return { state, blocked: false };
  const next = cloneState(state);
  next.pages[parentId] = Math.max(0, next.pages[parentId] ?? 0) + 1;
  if (wouldExceedCap(index, next)) {
    return {
      state,
      blocked: true,
      reason: "The 150-node view limit would be exceeded. Collapse a branch before revealing more children.",
    };
  }
  return { state: next, blocked: false };
}

export function collapseChildren(index: TreeIndex, state: TreeState, parentId: string): TreeState {
  const next = cloneState(state);
  delete next.pages[parentId];
  for (const child of childrenOf(index, parentId)) removeSubtreeFromOpen(next, index, child.id);
  return next;
}

/**
 * Open every ancestor needed to show `id`, and set each parent's page so the
 * target is included. Used by search and by `?focus=`.
 */
export function revealNode(
  index: TreeIndex,
  state: TreeState,
  id: string,
): { state: TreeState; blocked: boolean; reason?: string } {
  if (!index.byId.has(id)) return { state, blocked: false };
  const next = cloneState(state);
  const path = ancestorPath(index, id);
  for (const ancestor of path) next.open.add(ancestor);

  // The target itself must also be inside its parent's current page, not only
  // its ancestors inside theirs. Without this a search hit at position 30 of a
  // container stayed invisible even though every ancestor was open.
  for (const item of [...path, id]) {
    const node = index.byId.get(item);
    if (!node?.parent) continue;
    const siblings = childrenOf(index, node.parent);
    const position = siblings.findIndex((entry) => entry.id === item);
    if (position < 0) continue;
    next.pages[node.parent] = Math.max(next.pages[node.parent] ?? 0, Math.floor(position / PAGE_SIZE));
  }

  next.focus = id;
  next.selected = id;
  if (wouldExceedCap(index, next)) {
    return {
      state,
      blocked: true,
      reason: "The target is outside the 150-node view limit. Collapse a branch or search for a closer parent.",
    };
  }
  return { state: next, blocked: false };
}

/** Focus and select a node without changing which branches are open. */
export function selectNode(state: TreeState, id: string | null): TreeState {
  return { ...state, focus: id, selected: id };
}

/** Close the side card but keep the label focus context. */
export function deselectNode(state: TreeState): TreeState {
  return { ...state, selected: null };
}

export function toggleKeepBranches(state: TreeState): TreeState {
  return { ...state, keepBranches: !state.keepBranches };
}

export function toggleOverview(state: TreeState): TreeState {
  return { ...state, overview: !state.overview };
}

export function resetState(lens: LensId): TreeState {
  return emptyState(lens);
}

function isValidId(index: TreeIndex, id: string | null): boolean {
  return Boolean(id && index.byId.has(id));
}

export interface ParseResult {
  state: TreeState;
  warning: string;
}

export function parseTreeUrl(index: TreeIndex, search: string, lens: LensId): ParseResult {
  const params = new URLSearchParams(search);
  const state = emptyState(lens);
  const warnings: string[] = [];
  const focus = params.get("focus");
  if (focus) {
    if (isValidId(index, focus)) {
      const revealed = revealNode(index, state, focus);
      if (revealed.blocked) warnings.push(revealed.reason ?? "Focus is outside the view limit.");
      else Object.assign(state, revealed.state);
    } else {
      warnings.push(`Focus “${focus.slice(0, 80)}” is not in this lens.`);
    }
  }
  const open = params.get("open");
  if (open) {
    for (const id of open.split(",").filter(Boolean)) {
      if (isValidId(index, id) && index.byId.get(id)?.children) {
        state.open.add(id);
      } else {
        warnings.push(`Open node “${id.slice(0, 80)}” is not in this lens.`);
      }
    }
  }
  state.keepBranches = params.get("keep") === "1";
  state.overview = params.get("all") === "1";
  return { state, warning: warnings.slice(0, 2).join(" ") };
}

export function serializeTreeUrl(index: TreeIndex, state: TreeState): string {
  const params = new URLSearchParams();
  if (state.lens !== "subject") params.set("lens", state.lens);
  if (state.focus && index.byId.has(state.focus)) params.set("focus", state.focus);
  const open = [...state.open]
    .filter((id) => index.byId.has(id))
    .sort((a, b) => (index.order.get(a) ?? 0) - (index.order.get(b) ?? 0));
  if (open.length) params.set("open", open.join(","));
  if (state.keepBranches) params.set("keep", "1");
  if (state.overview) params.set("all", "1");
  const query = params.toString();
  return query ? `?${query}` : "";
}

export interface SearchResult {
  node: TreeNode;
  path: string[];
  score: number;
}

export function searchTree(index: TreeIndex, query: string, limit = 10): SearchResult[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const rows: SearchResult[] = [];
  for (const node of index.tree.nodes) {
    const label = node.label.toLowerCase();
    let score = 99;
    if (label === needle) score = 0;
    else if (label.startsWith(needle)) score = 1;
    else if (label.split(/\s+/).some((word) => word.startsWith(needle))) score = 2;
    else if (label.includes(needle)) score = 3;
    else {
      const path = ancestorPath(index, node.id)
        .map((id) => index.byId.get(id)?.label.toLowerCase() ?? "")
        .join(" ");
      if (path.includes(needle)) score = 4;
      else continue;
    }
    rows.push({
      node,
      path: ancestorPath(index, node.id)
        .map((id) => index.byId.get(id)?.label ?? id)
        .slice(-3),
      score,
    });
  }
  rows.sort((a, b) => a.score - b.score || a.node.label.length - b.node.label.length || a.node.label.localeCompare(b.node.label));
  return rows.slice(0, limit);
}
