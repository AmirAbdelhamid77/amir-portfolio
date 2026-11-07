/**
 * Deterministic force-directed layout (Fruchterman–Reingold forces with
 * Barnes–Hut repulsion). It is the same family of simulation Obsidian's graph
 * uses (link spring, many-body repulsion, centre gravity, cooling), implemented
 * here so the build has no runtime dependency and the result is reproducible.
 *
 * The layout runs once at build time and again at runtime for a local
 * neighbourhood. No position is hand-placed.
 */

export interface LayoutNode {
  id: string;
  /** Structural cluster used only to spread the initial positions. */
  community?: number;
  /** Visual weight, normally degree. */
  weight?: number;
  x?: number;
  y?: number;
  pinned?: boolean;
}

export interface LayoutEdge {
  a: string;
  b: string;
  weight?: number;
}

export interface LayoutOptions {
  iterations?: number;
  linkDistance?: number;
  charge?: number;
  gravity?: number;
  seed?: number;
  width?: number;
  height?: number;
}

interface Point {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  weight: number;
  pinned: boolean;
}

interface Quad {
  x: number;
  y: number;
  size: number;
  mass: number;
  cx: number;
  cy: number;
  body: Point | null;
  children: (Quad | null)[] | null;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildQuad(points: Point[], x: number, y: number, size: number, depth = 0): Quad {
  const quad: Quad = { x, y, size, mass: 0, cx: 0, cy: 0, body: null, children: null };
  for (const point of points) {
    if (point.x < x || point.x >= x + size || point.y < y || point.y >= y + size) continue;
    quad.mass += 1;
    quad.cx += point.x;
    quad.cy += point.y;
  }
  if (quad.mass === 0) return quad;
  quad.cx /= quad.mass;
  quad.cy /= quad.mass;
  if (points.length === 1 || depth >= 18 || size < 1) {
    quad.body = points[0] ?? null;
    return quad;
  }
  const half = size / 2;
  quad.children = [
    buildQuad(points.filter((p) => p.x < x + half && p.y < y + half), x, y, half, depth + 1),
    buildQuad(points.filter((p) => p.x >= x + half && p.y < y + half), x + half, y, half, depth + 1),
    buildQuad(points.filter((p) => p.x < x + half && p.y >= y + half), x, y + half, half, depth + 1),
    buildQuad(points.filter((p) => p.x >= x + half && p.y >= y + half), x + half, y + half, half, depth + 1),
  ];
  return quad;
}

function repulsion(point: Point, quad: Quad, charge: number, theta: number, out: { fx: number; fy: number }) {
  if (quad.mass === 0) return;
  if (quad.body && quad.body.id === point.id) return;
  const dx = point.x - quad.cx;
  const dy = point.y - quad.cy;
  const distance = Math.sqrt(dx * dx + dy * dy) + 0.01;
  if (quad.body || quad.size / distance < theta) {
    const force = (charge * quad.mass) / (distance * distance);
    out.fx += (dx / distance) * force;
    out.fy += (dy / distance) * force;
    return;
  }
  for (const child of quad.children ?? []) if (child) repulsion(point, child, charge, theta, out);
}

export function forceLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  options: LayoutOptions = {},
): Map<string, { x: number; y: number }> {
  const iterations = options.iterations ?? 260;
  const linkDistance = options.linkDistance ?? 34;
  const charge = options.charge ?? 120;
  const gravity = options.gravity ?? 0.035;
  const seed = options.seed ?? 0x5eed;
  const width = options.width ?? 2000;
  const height = options.height ?? 2000;
  const random = mulberry32(seed);

  const groups = [...new Set(nodes.map((node) => node.community ?? 0))].sort((a, b) => a - b);
  const groupIndex = new Map(groups.map((group, index) => [group, index]));
  const radius = Math.max(240, Math.sqrt(nodes.length) * 42);

  const points: Point[] = nodes.map((node, index) => {
    if (node.x !== undefined && node.y !== undefined) {
      return { id: node.id, x: node.x, y: node.y, vx: 0, vy: 0, weight: node.weight ?? 1, pinned: Boolean(node.pinned) };
    }
    const group = groupIndex.get(node.community ?? 0) ?? 0;
    const angle = (group / Math.max(1, groups.length)) * Math.PI * 2 + random() * 0.9;
    const ring = radius * (0.35 + 0.75 * Math.sqrt((index + 1) / Math.max(1, nodes.length)));
    return {
      id: node.id,
      x: Math.cos(angle) * ring + (random() - 0.5) * 30,
      y: Math.sin(angle) * ring + (random() - 0.5) * 30,
      vx: 0,
      vy: 0,
      weight: node.weight ?? 1,
      pinned: Boolean(node.pinned),
    };
  });
  const byId = new Map(points.map((point) => [point.id, point]));
  const links = edges
    .map((edge) => ({ a: byId.get(edge.a), b: byId.get(edge.b), weight: edge.weight ?? 1 }))
    .filter((link): link is { a: Point; b: Point; weight: number } => Boolean(link.a && link.b && link.a !== link.b));

  const forces = new Map<string, { fx: number; fy: number }>(points.map((point) => [point.id, { fx: 0, fy: 0 }]));
  let alpha = 1;

  for (let step = 0; step < iterations; step += 1) {
    const repulsionForce = charge * (0.35 + alpha * 0.65);
    const halfW = width / 2;
    const halfH = height / 2;
    const tree = buildQuad(points, -halfW * 2, -halfH * 2, width * 2);

    for (const point of points) {
      const force = forces.get(point.id)!;
      force.fx = 0;
      force.fy = 0;
      repulsion(point, tree, repulsionForce, 0.9, force);
    }

    // Link springs. Stronger for declared links (higher weight); each end takes
    // half the correction so the centre of mass does not drift.
    for (const link of links) {
      const dx = link.b.x - link.a.x;
      const dy = link.b.y - link.a.y;
      const distance = Math.sqrt(dx * dx + dy * dy) + 0.01;
      const target = linkDistance + Math.min(26, link.weight * 4);
      const strength = 0.08 * Math.min(2.5, 0.6 + link.weight * 0.35);
      const correction = ((distance - target) / distance) * strength;
      const fx = dx * correction;
      const fy = dy * correction;
      forces.get(link.a.id)!.fx += fx;
      forces.get(link.a.id)!.fy += fy;
      forces.get(link.b.id)!.fx -= fx;
      forces.get(link.b.id)!.fy -= fy;
    }

    for (const point of points) {
      if (point.pinned) continue;
      const force = forces.get(point.id)!;
      force.fx += (0 - point.x) * gravity * (1 + Math.sqrt(point.weight));
      force.fy += (0 - point.y) * gravity * (1 + Math.sqrt(point.weight));
      point.vx = (point.vx + force.fx * 0.9) * 0.72;
      point.vy = (point.vy + force.fy * 0.9) * 0.72;
      const speed = Math.sqrt(point.vx * point.vx + point.vy * point.vy);
      if (speed > 40) {
        point.vx = (point.vx / speed) * 40;
        point.vy = (point.vy / speed) * 40;
      }
      point.x += point.vx;
      point.y += point.vy;
    }
    alpha *= 0.985;
  }

  return new Map(points.map((point) => [point.id, { x: point.x, y: point.y }]));
}
