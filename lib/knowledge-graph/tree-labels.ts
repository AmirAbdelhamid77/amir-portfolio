/**
 * Label placement for the radial tree.
 *
 * Labels are deliberately selective: the focused node, its visible children,
 * and the path back to the root. Roots stay labelled only while the map is
 * near its default zoom. Everything else keeps its full title in the `<title>`
 * element and in the side card.
 *
 * Placement is a greedy, priority-ordered pass with estimated text boxes. A
 * label that would hit a placed label, a node or the canvas edge is skipped —
 * never drawn on top of another. The estimate is intentional: measuring real
 * text would require a DOM and make layout non-deterministic in tests.
 */
import type { TreeNode } from "./hierarchy";
import type { PlacedNode } from "./tree-layout";
import { VIEW_HALF_H, VIEW_HALF_W } from "./tree-layout.ts";
import type { VisibleNode } from "./tree-model";

export const LABEL_MAX_CHARS = 24;
export const LABEL_FONT_SIZE = 14;
export const LABEL_LINE_HEIGHT = 17;
const CHAR_WIDTH = 6.1;
const BOX_PAD = 3;

export interface TreeLabel {
  id: string;
  text: string;
  fullText: string;
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
  width: number;
  height: number;
  priority: number;
  depth: number;
}

export interface LabelResult {
  labels: TreeLabel[];
  skipped: number;
  rootsHiddenByZoom: boolean;
}

export interface LabelOptions {
  visible: VisibleNode[];
  positions: Map<string, PlacedNode>;
  focus: string | null;
  selected: string | null;
  zoom: number;
  overview: boolean;
  rootThreshold?: number;
  /** Counter-scale for narrow maps: keeps labels at a readable screen size. */
  fontScale?: number;
}

interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function overlaps(a: Box, b: Box): boolean {
  return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
}

function circleHitsBox(x: number, y: number, radius: number, box: Box): boolean {
  const nx = Math.min(box.x2, Math.max(box.x1, x));
  const ny = Math.min(box.y2, Math.max(box.y1, y));
  return (nx - x) ** 2 + (ny - y) ** 2 < (radius + 3) ** 2;
}

export function truncateLabel(label: string, max = LABEL_MAX_CHARS): string {
  const clean = label.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function estimateWidth(text: string, scale = 1): number {
  return Math.max(18 * scale, text.length * CHAR_WIDTH * scale + 6 * scale);
}

function candidateBox(
  placed: PlacedNode,
  text: string,
  scale = 1,
): { x: number; y: number; anchor: TreeLabel["anchor"]; box: Box } {
  const width = estimateWidth(text, scale);
  const height = LABEL_LINE_HEIGHT * scale;
  const cos = Math.cos(placed.angle);
  const sin = Math.sin(placed.angle);
  const offset = placed.radius + 8;

  if (Math.abs(cos) >= 0.28) {
    const anchor: TreeLabel["anchor"] = cos > 0 ? "start" : "end";
    const x = placed.x + cos * offset;
    const y = placed.y + sin * offset;
    const x1 = anchor === "start" ? x : x - width;
    return { x, y, anchor, box: { x1, x2: x1 + width, y1: y - height / 2, y2: y + height / 2 } };
  }

  const above = sin < 0;
  const x = placed.x;
  const y = placed.y + (above ? -1 : 1) * (placed.radius + 12 + height / 2);
  return {
    x,
    y,
    anchor: "middle",
    box: { x1: x - width / 2, x2: x + width / 2, y1: y - height / 2, y2: y + height / 2 },
  };
}

/**
 * Candidate selection. The order is the priority used by the collision pass,
 * so the focused label always wins and the roots give way first.
 */
function candidates(options: LabelOptions): { entry: VisibleNode; priority: number }[] {
  if (options.overview) return [];
  const byId = new Map(options.visible.map((entry) => [entry.id, entry]));
  const out = new Map<string, number>();
  const add = (id: string | null | undefined, priority: number) => {
    if (!id || !byId.has(id)) return;
    const current = out.get(id);
    if (current === undefined || priority < current) out.set(id, priority);
  };

  const focus = options.focus;
  const selected = options.selected;
  add(selected, 0);
  add(focus, 0);

  if (focus && byId.has(focus)) {
    for (const entry of options.visible) {
      if (entry.parentId === focus) add(entry.id, 1);
    }
  }

  // Path from the focus back to its root. Roots are demoted to priority 4 so
  // they vanish before a more specific label when space is tight.
  let cursor = focus ? byId.get(focus) : undefined;
  const seen = new Set<string>();
  while (cursor?.parentId && !seen.has(cursor.parentId)) {
    seen.add(cursor.parentId);
    const parent = byId.get(cursor.parentId);
    if (!parent) break;
    add(parent.id, parent.parentId ? 2 : 3);
    cursor = parent;
  }

  const rootsVisible = options.zoom <= (options.rootThreshold ?? 1.35);
  if (!focus || rootsVisible) {
    for (const entry of options.visible) {
      if (!entry.parentId) add(entry.id, 3);
    }
  }

  return [...out.entries()]
    .map(([id, priority]) => ({ entry: byId.get(id)!, priority }))
    .sort((a, b) => a.priority - b.priority || a.entry.depth - b.entry.depth || a.entry.id.localeCompare(b.entry.id));
}

export function placeLabels(options: LabelOptions): LabelResult {
  const scale = Math.max(1, options.fontScale ?? 1);
  const placed: TreeLabel[] = [];
  const boxes: Box[] = [];
  const nodes = options.visible
    .map((entry) => options.positions.get(entry.id))
    .filter((entry): entry is PlacedNode => Boolean(entry));
  let skipped = 0;
  let rootsHiddenByZoom = false;

  for (const candidate of candidates(options)) {
    const placedNode = options.positions.get(candidate.entry.id);
    if (!placedNode) continue;
    if (placedNode.depth === 0 && options.focus && options.zoom > (options.rootThreshold ?? 1.35)) {
      rootsHiddenByZoom = true;
      continue;
    }
    const text = truncateLabel(candidate.entry.node.label);
    const geometry = candidateBox(placedNode, text, scale);
    const box = geometry.box;

    if (
      box.x1 < -VIEW_HALF_W + 6 ||
      box.x2 > VIEW_HALF_W - 6 ||
      box.y1 < -VIEW_HALF_H + 6 ||
      box.y2 > VIEW_HALF_H - 6
    ) {
      skipped += 1;
      continue;
    }
    const padded: Box = {
      x1: box.x1 - BOX_PAD * scale,
      y1: box.y1 - BOX_PAD * scale,
      x2: box.x2 + BOX_PAD * scale,
      y2: box.y2 + BOX_PAD * scale,
    };
    if (boxes.some((other) => overlaps(padded, other))) {
      skipped += 1;
      continue;
    }
    const hitsNode = nodes.some(
      (node) => node.id !== placedNode.id && circleHitsBox(node.x, node.y, node.radius, padded),
    );
    if (hitsNode) {
      skipped += 1;
      continue;
    }

    placed.push({
      id: candidate.entry.id,
      text,
      fullText: candidate.entry.node.label,
      x: geometry.x,
      y: geometry.y,
      anchor: geometry.anchor,
      width: estimateWidth(text, scale),
      height: LABEL_LINE_HEIGHT * scale,
      priority: candidate.priority,
      depth: placedNode.depth,
    });
    boxes.push(padded);
  }

  return { labels: placed, skipped, rootsHiddenByZoom };
}

export function labelCandidatesForTest(
  node: TreeNode,
  placed: PlacedNode,
  priority: number,
): TreeLabel {
  const text = truncateLabel(node.label);
  const geometry = candidateBox(placed, text);
  return {
    id: node.id,
    text,
    fullText: node.label,
    x: geometry.x,
    y: geometry.y,
    anchor: geometry.anchor,
    width: estimateWidth(text),
    height: LABEL_LINE_HEIGHT,
    priority,
    depth: placed.depth,
  };
}
