// Deterministic 2D layout for the prototype graph.
//
// There is no force simulation on purpose. A force layout re-solves every node
// when one sequence expands, which is exactly the "unnecessary layout
// disruption" the brief forbids. Instead each sequence owns a fixed anchor on a
// ring, and its notes occupy a fixed ring around that anchor, so expanding or
// collapsing one sequence never moves another node.
//
// Notes are placed toward the middle of the canvas, which keeps an expanded
// sequence inside the view at the fitted zoom instead of pushing its children
// off the edge. Geometry carries no meaning beyond grouping: sequence order is
// shown in the panel, not implied by position or distance.
export type Point = { x: number; y: number };

export const SEQUENCE_RING = () => ({ x: 300, y: 195 });

export function sequenceAnchor(index: number, count: number): Point {
  const radius = SEQUENCE_RING();
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / Math.max(count, 1);
  return { x: Math.cos(angle) * radius.x, y: Math.sin(angle) * radius.y };
}

/**
 * Notes sit on an arc around their sequence, facing the middle of the canvas so
 * an expanded sequence stays inside the fitted view. The arc is wide enough that
 * dots stay apart; labels are shown one at a time.
 */
export function noteAnchors(anchor: Point, count: number, toward: Point): Point[] {
  const radius = 104 + 8 * Math.sqrt(count);
  const facing = Math.atan2(toward.y - anchor.y, toward.x - anchor.x);
  const arc = Math.min(Math.PI * 1.5, Math.PI * 0.55 + count * 0.14);
  const step = count > 1 ? arc / (count - 1) : 0;
  return Array.from({ length: count }, (_, index) => {
    const angle = facing + (index - (count - 1) / 2) * step;
    return { x: anchor.x + Math.cos(angle) * radius, y: anchor.y + Math.sin(angle) * radius };
  });
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function boundsOf(points: readonly Point[], padding = 26) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  if (!Number.isFinite(minX)) return null;
  return {
    minX: minX - padding,
    minY: minY - padding,
    maxX: maxX + padding,
    maxY: maxY + padding,
  };
}

/** Returns the transform that fits every point in a container of width x height. */
export function fitView(points: readonly Point[], width: number, height: number, padding = 170) {
  const bounds = boundsOf(points);
  if (!bounds || width <= 0 || height <= 0) return { x: 0, y: 0, k: 1 };
  const spanX = Math.max(bounds.maxX - bounds.minX, 1);
  const spanY = Math.max(bounds.maxY - bounds.minY, 1);
  const k = clamp(
    Math.min((width - padding) / spanX, (height - padding) / spanY),
    0.32,
    1.35,
  );
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  return { x: -cx * k, y: -cy * k, k };
}
