/**
 * Deterministic radial layout for the expanding knowledge tree.
 *
 * Two passes:
 *
 * 1. A radial wedge layout: ring = depth, angle = a share of the parent's
 *    wedge weighted by descendant count. Roots share the circle equally so a
 *    small subject is never squeezed out by Fabric's 1,000 descendants.
 * 2. A short, seeded-by-position `d3-force` pass: collide, a weak link and a
 *    weak radial pull. It removes node overlaps without turning the view into
 *    an open-ended simulation. Positions are a pure function of the visible
 *    set, so the same open branches always produce the same map.
 *
 * Labels are placed separately in `tree-labels.ts`; this module never needs the
 * DOM and is covered by the node tests.
 */
import { forceCollide, forceLink, forceRadial, forceSimulation } from "d3-force";
import type { TreeNode } from "./hierarchy";
import type { VisibleNode } from "./tree-model";

export const VIEW_WIDTH = 1200;
export const VIEW_HEIGHT = 920;
export const VIEW_HALF_W = VIEW_WIDTH / 2;
export const VIEW_HALF_H = VIEW_HEIGHT / 2;

/** Node rings by visible depth. Shallower trees get wider rings so eight roots
 *  use the canvas instead of clustering in the middle; deeper trees tighten the
 *  inner rings to make room for another level. */
const MULTI_RING_SETS: Record<number, number[]> = {
  0: [320],
  1: [180, 360],
  2: [160, 300, 420],
  3: [140, 260, 360, 430],
};
const SINGLE_RING_SETS: Record<number, number[]> = {
  0: [0],
  1: [0, 280],
  2: [0, 240, 380],
  3: [0, 220, 335, 420],
};

export function ringsFor(maxDepth: number, singleRoot: boolean): number[] {
  const sets = singleRoot ? SINGLE_RING_SETS : MULTI_RING_SETS;
  return sets[Math.min(3, Math.max(0, maxDepth))];
}

export interface PlacedNode {
  id: string;
  x: number;
  y: number;
  depth: number;
  ring: number;
  radius: number;
  angle: number;
  rootId: string;
}

export interface RadialLayout {
  positions: Map<string, PlacedNode>;
  roots: string[];
  maxDepth: number;
  /** Ring radius per visible depth, for the guide circles. */
  rings: number[];
  overview: boolean;
}

export interface LayoutOptions {
  /** Overview draws every node and skips the force pass for speed. */
  overview?: boolean;
  /** Force iterations. 0 keeps the pure wedge layout. */
  ticks?: number;
}

interface SimNode {
  id: string;
  x: number;
  y: number;
  r: number;
  ring: number;
  depth: number;
}

function ringFor(depth: number, rings: number[]): number {
  if (depth < rings.length) return rings[depth];
  return rings[rings.length - 1] + (depth - rings.length + 1) * 70;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Node area is a square-root function of the content below it. */
export function nodeRadiusFor(node: TreeNode, depth: number): number {
  if (depth === 0) return 18;
  if (node.kind === "more") return 8;
  if (node.kind === "unit") return 6.5;
  if (node.kind === "source" || node.kind === "page") return 5.5;
  const content = Math.max(0, node.contentDescendants);
  return clamp(8 + Math.sqrt(content + 1) * 0.95, 9, 16);
}

export function renderRadiusFor(node: TreeNode, depth: number, overview: boolean): number {
  const radius = nodeRadiusFor(node, depth);
  return overview ? Math.min(4.2, 1.8 + radius * 0.16) : radius;
}

/**
 * Allocate a parent's angular wedge to its visible children. The child's
 * share is proportional to sqrt(content descendants + 1), not raw count: a
 * 50-note pack should get more room than a single note, but not 50 times more.
 */
function allocate(
  start: number,
  end: number,
  children: VisibleNode[],
): Map<string, { start: number; end: number }> {
  const result = new Map<string, { start: number; end: number }>();
  if (!children.length) return result;
  const span = Math.max(0.0001, end - start);
  const gap = children.length > 1 ? Math.min(0.014, span / (children.length * 10)) : 0;
  const usable = Math.max(0.0001, span - gap * (children.length - 1));
  const weightFor = (child: VisibleNode) => Math.sqrt(Math.max(0, child.node.contentDescendants) + 1);
  const total = children.reduce((sum, child) => sum + weightFor(child), 0) || 1;
  let cursor = start;
  for (const child of children) {
    const share = (usable * weightFor(child)) / total;
    result.set(child.id, { start: cursor, end: cursor + share });
    cursor += share + gap;
  }
  // Absorb floating-point drift into the last child so wedges stay contiguous.
  const last = children[children.length - 1];
  const lastWedge = result.get(last.id);
  if (lastWedge) lastWedge.end = end;
  return result;
}

export function layoutRadial(visible: VisibleNode[], options: LayoutOptions = {}): RadialLayout {
  const overview = Boolean(options.overview);
  const nodes = visible;
  const byId = new Map(nodes.map((entry) => [entry.id, entry]));
  const roots = nodes.filter((entry) => !entry.parentId).map((entry) => entry.id);
  const singleRoot = roots.length === 1;
  const maxDepth = nodes.reduce((max, entry) => Math.max(max, entry.depth), 0);
  const rings = ringsFor(maxDepth, singleRoot);

  const childrenOf = new Map<string, VisibleNode[]>();
  for (const entry of nodes) {
    if (!entry.parentId) continue;
    const list = childrenOf.get(entry.parentId) ?? [];
    list.push(entry);
    childrenOf.set(entry.parentId, list);
  }

  const positions = new Map<string, PlacedNode>();
  const angles = new Map<string, number>();
  const wedges = new Map<string, { start: number; end: number }>();

  // Roots share the circle equally. With one root its wedge is the whole circle
  // and the root itself sits at the centre.
  const rootCount = Math.max(1, roots.length);
  roots.forEach((id, index) => {
    const centre = roots.length === 1 ? -Math.PI / 2 : -Math.PI / 2 + (index * Math.PI * 2) / rootCount;
    const start = roots.length === 1 ? -Math.PI : centre - Math.PI;
    const end = roots.length === 1 ? Math.PI : centre + Math.PI / rootCount;
    angles.set(id, centre);
    wedges.set(id, { start, end });
  });

  const queue = roots.map((id) => id);
  const rootOf = new Map<string, string>();
  for (const root of roots) rootOf.set(root, root);

  while (queue.length) {
    const id = queue.shift()!;
    const entry = byId.get(id);
    if (!entry) continue;
    const rootId = rootOf.get(id) ?? id;
    const ring = ringFor(entry.depth, rings);
    let angle = angles.get(id) ?? -Math.PI / 2;
    if (singleRoot && entry.depth === 0) angle = -Math.PI / 2;

    const radius = renderRadiusFor(entry.node, entry.depth, overview);
    const x = entry.depth === 0 && singleRoot ? 0 : Math.cos(angle) * ring;
    const y = entry.depth === 0 && singleRoot ? 0 : Math.sin(angle) * ring;
    positions.set(id, {
      id,
      x,
      y,
      depth: entry.depth,
      ring,
      radius,
      angle,
      rootId,
    });

    const wedge = wedges.get(id) ?? { start: angle - Math.PI, end: angle + Math.PI };
    const children = (childrenOf.get(id) ?? []).slice();
    children.sort((a, b) => a.node.order - b.node.order || a.id.localeCompare(b.id));
    const shares = allocate(wedge.start, wedge.end, children);
    for (const child of children) {
      const share = shares.get(child.id) ?? { start: wedge.start, end: wedge.end };
      angles.set(child.id, (share.start + share.end) / 2);
      wedges.set(child.id, share);
      rootOf.set(child.id, rootId);
      queue.push(child.id);
    }
  }

  // Overview is an explicit silhouette: skip the force pass and keep the map
  // responsive when all 1,100+ nodes are requested.
  const ticks = options.ticks ?? (overview ? 0 : 170);
  if (ticks > 0) {
    const simNodes: SimNode[] = nodes.map((entry) => {
      const placed = positions.get(entry.id)!;
      return { id: entry.id, x: placed.x, y: placed.y, r: placed.radius, ring: placed.ring, depth: placed.depth };
    });
    const links = nodes
      .filter((entry) => entry.parentId)
      .map((entry) => ({ source: entry.parentId!, target: entry.id }));
    const simulation = forceSimulation<SimNode>(simNodes)
      .force(
        "link",
        forceLink<SimNode, { source: string; target: string }>(links)
          .id((node) => node.id)
          .distance(34)
          .strength(0.055),
      )
      .force("radial", forceRadial<SimNode>((node) => node.ring, 0, 0).strength(0.24))
      .force(
        "collide",
        forceCollide<SimNode>((node) => node.r + 7)
          .strength(0.9)
          .iterations(2),
      )
      .stop();

    simulation.tick(ticks);

    for (const node of simNodes) {
      const placed = positions.get(node.id)!;
      const distance = Math.hypot(node.x, node.y);
      const limit = placed.depth === 0 && singleRoot ? 0 : 30;
      const low = Math.max(0, placed.ring - limit);
      const high = placed.ring + limit;
      const clamped = clamp(distance || 0, low, high || low);
      const angle = distance < 0.001 ? placed.angle : Math.atan2(node.y, node.x);
      placed.x = Math.cos(angle) * clamped;
      placed.y = Math.sin(angle) * clamped;
      placed.angle = angle;
      // Keep every node inside the canvas even if collide pushed it far out.
      placed.x = clamp(placed.x, -VIEW_HALF_W + 26, VIEW_HALF_W - 26);
      placed.y = clamp(placed.y, -VIEW_HALF_H + 26, VIEW_HALF_H - 26);
    }
  }

  return { positions, roots, maxDepth, rings, overview };
}
