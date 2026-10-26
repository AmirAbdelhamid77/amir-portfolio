// Geometry for the contextual Atlas Peek. It is deliberately separate from the
// component: the stage draws a small semantic neighbourhood, and the placement
// must be deterministic so a screenshot, a keyboard focus order and a test all
// agree about where a concept sits.

export const PEEK_VIEWBOX = { width: 640, height: 300 } as const;
export const PEEK_CENTER = { x: 320, y: 142 } as const;
const RADIUS = { x: 236, y: 96 } as const;

/** One slot per related concept, starting at the top and going clockwise. */
export function placeAround(count: number) {
  if (!Number.isFinite(count) || count < 1) return [];
  const safe = Math.min(4, Math.floor(count));
  return Array.from({ length: safe }, (_, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / safe;
    return {
      x: Math.round(PEEK_CENTER.x + Math.cos(angle) * RADIUS.x),
      y: Math.round(PEEK_CENTER.y + Math.sin(angle) * RADIUS.y),
    };
  });
}

/** A quadratic control point that bows the edge away from the core. */
export function edgeControl(
  from: { x: number; y: number },
  to: { x: number; y: number },
  bow = 26,
) {
  return {
    x: Math.round((from.x + to.x) / 2),
    y: Math.round((from.y + to.y) / 2 - bow),
  };
}
