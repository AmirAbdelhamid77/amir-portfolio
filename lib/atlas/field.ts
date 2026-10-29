// Spacetime field — the geometry behind Act II of the canonical landing.
//
// Three rules govern this module, and they are the reason it is a pure module
// with no React and no canvas in it:
//
//   1. Every vertex is a real, public artefact. An edition is a record from
//      `content/knowledge/insights.json`; a concept/edge is a record from the
//      *already projected* Atlas (so the publication gate has run before this
//      code sees anything); a destination is a real `lessonHref`, `practiceHref`
//      or `sourceUrl` taken verbatim from the edition.
//   2. A link is drawn only when the field it comes from says so: an edition's
//      own concept/lesson/practice/source fields, a published semantic edge, or
//      a published catalogue membership. No decorative edges are generated.
//   3. Positions come from the data where the data has them (concept `position`)
//      and otherwise from a deterministic layout seeded by the record id, so the
//      first client render matches the static render.
//
// The renderer in `components/cinematic/spacetime-atlas.tsx` draws what this
// module computes; the camera and projection are plain world-space maths, which
// is what lets the unit tests check them in Node without a browser.

import type { Atlas } from "./model";

export type Vec3 = readonly [number, number, number];

export type FieldNodeKind =
  | "edition"
  | "concept"
  | "lesson"
  | "practice"
  | "source"
  | "semantic";

export type FieldLinkKind =
  | "concept"
  | "lesson"
  | "practice"
  | "source"
  | "semantic"
  | "structure";

export type FieldNode = {
  id: string;
  kind: FieldNodeKind;
  /** Full label shown in the inspector and the accessible list. */
  label: string;
  /** Two-or-three word label drawn next to the node. */
  short: string;
  detail: string;
  meta: string;
  href: string | null;
  external: boolean;
  /** The edition this node belongs to, when it belongs to one. */
  editionId: string | null;
  /** A short, real datum drawn inside the glyph when there is room (editions). */
  badge?: string;
  position: Vec3;
  /** Deterministic 0..1 ordering used for entrance stagger. */
  phase: number;
};

export type FieldLink = {
  id: string;
  from: string;
  to: string;
  kind: FieldLinkKind;
  label: string;
  claim: string | null;
  relation: string | null;
};

export type Field = {
  nodes: FieldNode[];
  links: FieldLink[];
  /** True when the public Atlas projection carries no semantic edge yet. */
  pending: boolean;
  editions: string[];
};

type EditionInput = {
  id: string;
  title: string;
  cardTitle: string;
  date: string;
  topic: string;
  conceptId: string;
  takeaway: string;
  lessonHref: string;
  practiceHref: string;
  sourceId: string;
  sourceUrl: string;
  sourceLocator: string;
  checkedAt: string;
  reviewStatus: string;
};

// ---------------------------------------------------------------------------
// Deterministic pseudo-randomness. Same id, same jitter, on server and client.
// ---------------------------------------------------------------------------

function hash(text: string) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return (value >>> 0) / 4294967295;
}

function jitter(seed: string, spread: number) {
  return (hash(seed) - 0.5) * 2 * spread;
}

const RING_EDITIONS = 32;
const RING_SATELLITES = 52;
const RING_SEMANTIC = 68;

function ring(angle: number, radius: number, height: number): Vec3 {
  return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
}

function shortLabel(text: string, words = 3) {
  const parts = text.split(/\s+/).filter(Boolean);
  const sliced = parts.slice(0, words).join(" ");
  return parts.length > words ? `${sliced}…` : sliced;
}

/** "…/learn/dp-600/ingestion/" → "ingestion lesson". Never invents a title. */
function routeLabel(href: string, kind: string) {
  const slug = href.replace(/\/+$/, "").split("/").filter(Boolean).pop();
  return slug ? `${slug} ${kind}` : kind;
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** "2026-10-26" → "26 OCT". The same ISO date the edition carries. */
function dateBadge(iso: string) {
  const [, month, day] = iso.split("-");
  const name = MONTHS[Number(month) - 1];
  return name ? `${day} ${name}` : iso;
}

/**
 * Build the field from public records only.
 *
 * `items` must already be `eligibleInsights(..., preview)` output, and `atlas`
 * must already be `getAtlas()` output — this function never turns a review
 * candidate into a vertex.
 */
export function buildField(atlas: Atlas, items: readonly EditionInput[]): Field {
  const nodes = new Map<string, FieldNode>();
  const links: FieldLink[] = [];
  const editions: string[] = [];

  const addNode = (node: FieldNode) => {
    const existing = nodes.get(node.id);
    if (!existing) nodes.set(node.id, node);
    return node.id;
  };

  const addLink = (link: FieldLink) => {
    if (link.from === link.to) return;
    if (!nodes.has(link.from) || !nodes.has(link.to)) return;
    if (links.some((entry) => entry.id === link.id)) return;
    links.push(link);
  };

  const total = Math.max(items.length, 1);

  items.forEach((item, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / total;
    const editionId = `edition:${item.id}`;
    // A vertical spread keeps the ring readable from a low camera: the editions
    // sit at different heights rather than three dots on one arc.
    const height = total > 1 ? -12 + (index / (total - 1)) * 24 : 0;
    editions.push(editionId);

    addNode({
      id: editionId,
      kind: "edition",
      label: item.cardTitle,
      short: shortLabel(item.cardTitle, 4),
      detail: item.title,
      meta: `${item.topic} · ${item.date} · ${item.reviewStatus.replace("_", " ")}`,
      href: `/?insight=${encodeURIComponent(item.id)}#today`,
      external: false,
      editionId,
      badge: dateBadge(item.date),
      position: ring(
        angle,
        RING_EDITIONS + jitter(item.id, 2),
        height + jitter(`${item.id}:y`, 2),
      ),
      phase: index / total,
    });

    // The concept this edition states — the same id the Atlas uses, so when the
    // public projection publishes it the two views share one vertex.
    if (item.conceptId) {
      const conceptId = item.conceptId;
      const published = atlas.concepts.find((concept) => concept.id === conceptId);
      const authored = published?.position;
      addNode({
        id: conceptId,
        kind: "concept",
        label: published?.title ?? item.topic,
        short: shortLabel(published?.title ?? item.topic, 2),
        detail: published?.definition ?? item.takeaway,
        meta: published
          ? `Published concept · ${published.kind}`
          : `Concept named by the edition · ${item.topic}`,
        href: null,
        external: false,
        editionId: null,
        position: authored
          ? [authored[0] * 0.34, 0, authored[1] * 0.34]
          : [jitter(`${conceptId}:x`, 2), 0, jitter(`${conceptId}:z`, 2)],
        phase: 0.5,
      });
      addLink({
        id: `link:stated-by:${item.id}`,
        from: editionId,
        to: conceptId,
        kind: "concept",
        label: "states the concept",
        claim: item.takeaway,
        relation: null,
      });
    }

    const satellites: {
      key: string;
      kind: "lesson" | "practice" | "source";
      href: string;
      label: string;
      detail: string;
      meta: string;
      external: boolean;
      linkLabel: string;
      offset: number;
      height: number;
    }[] = [
      {
        key: `lesson:${item.lessonHref}`,
        kind: "lesson",
        href: item.lessonHref,
        label: `Lesson — ${item.topic}`,
        detail: `The lesson this edition opens: ${item.lessonHref}`,
        meta: "Lesson · site route",
        external: false,
        linkLabel: "opens the lesson",
        offset: -0.58,
        height: 12,
      },
      {
        key: `practice:${item.practiceHref}`,
        kind: "practice",
        href: item.practiceHref,
        label: `Practice — ${item.topic}`,
        detail: `Practice for this edition: ${item.practiceHref}`,
        meta: "Practice · site route",
        external: false,
        linkLabel: "practises the idea",
        offset: 0.58,
        height: -13,
      },
      {
        key: `source:${item.sourceId}`,
        kind: "source",
        href: item.sourceUrl,
        label: item.sourceId,
        detail: item.sourceLocator,
        meta: `Microsoft Learn · checked ${item.checkedAt}`,
        external: true,
        linkLabel: "cites the source",
        offset: 0,
        height: 22,
      },
    ];

    for (const satellite of satellites) {
      if (!satellite.href) continue;
      addNode({
        id: satellite.key,
        kind: satellite.kind,
        label: satellite.label,
        short:
          satellite.kind === "source"
            ? satellite.label
            : routeLabel(satellite.href, satellite.kind),
        detail: satellite.detail,
        meta: satellite.meta,
        href: satellite.href,
        external: satellite.external,
        editionId: null,
        position: ring(
          angle + satellite.offset,
          RING_SATELLITES + jitter(satellite.key, 3),
          height * 0.6 + satellite.height + jitter(`${satellite.key}:y`, 2),
        ),
        phase: 0.66 + (index / total) * 0.24,
      });
      addLink({
        id: `link:${satellite.kind}:${item.id}`,
        from: editionId,
        to: satellite.key,
        kind: satellite.kind,
        label: satellite.linkLabel,
        claim: null,
        relation: null,
      });
    }
  });

  // Published semantic concepts that are not already named by an edition. The
  // projection has already removed everything that is not public.
  const orbitCount = atlas.concepts.length;
  atlas.concepts.forEach((concept, index) => {
    if (nodes.has(concept.id)) return;
    addNode({
      id: concept.id,
      kind: "semantic",
      label: concept.title,
      short: shortLabel(concept.title, 3),
      detail: concept.definition,
      meta: `Published concept · ${concept.kind}`,
      href: null,
      external: false,
      editionId: null,
      position: [concept.position[0] * 0.34, 0, concept.position[1] * 0.34],
      phase: 0.4 + (index / Math.max(orbitCount, 1)) * 0.3,
    });
  });

  for (const edge of atlas.semanticEdges) {
    if (!nodes.has(edge.from) || !nodes.has(edge.to)) continue;
    addLink({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      kind: "semantic",
      label: edge.relationType.replaceAll("_", " "),
      claim: edge.claim,
      relation: edge.relationType,
    });
  }

  // Published catalogue membership. This is structure, never a semantic claim.
  for (const resource of atlas.catalog) {
    if (!resource.href) continue;
    const id = `resource:${resource.id}`;
    addNode({
      id,
      kind: resource.href.startsWith("/lab/") ? "practice" : "lesson",
      label: resource.title,
      short: shortLabel(resource.title, 3),
      detail: resource.title,
      meta: `Published resource · ${resource.kind}`,
      href: resource.href,
      external: false,
      editionId: null,
      position: ring(
        hash(resource.id) * Math.PI * 2,
        RING_SEMANTIC + jitter(resource.id, 5),
        jitter(`${resource.id}:y`, 10),
      ),
      phase: 0.8,
    });
    for (const conceptId of resource.conceptIds) {
      if (!nodes.has(conceptId)) continue;
      addLink({
        id: `link:structure:${resource.id}:${conceptId}`,
        from: conceptId,
        to: id,
        kind: "structure",
        label: "listed with this concept",
        claim: null,
        relation: null,
      });
    }
  }

  // A concept with no visitor is drift, not content: drop it rather than leave
  // an orphan dot that means nothing.
  const connected = new Set(links.flatMap((link) => [link.from, link.to]));
  const finalNodes = [...nodes.values()].filter(
    (node) => connected.has(node.id) || node.kind === "edition",
  );
  const ids = new Set(finalNodes.map((node) => node.id));
  const finalLinks = links.filter((link) => ids.has(link.from) && ids.has(link.to));

  return {
    nodes: finalNodes.sort((a, b) => a.phase - b.phase || a.id.localeCompare(b.id)),
    links: finalLinks,
    pending: atlas.semanticEdges.length === 0,
    editions,
  };
}

// ---------------------------------------------------------------------------
// Camera. A single authored dolly from "one card" to "the whole field".
// ---------------------------------------------------------------------------

export type Camera = { eye: Vec3; target: Vec3; fov: number };

export type Orbit = { yaw: number; pitch: number; zoom: number };

export const DEFAULT_ORBIT: Orbit = { yaw: 0, pitch: 0.16, zoom: 1 };

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const length = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
const normalize = (a: Vec3): Vec3 => {
  const len = length(a) || 1;
  return [a[0] / len, a[1] / len, a[2] / len];
};

export const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value));

export const clamp01 = (value: number) => clamp(value, 0, 1);

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function smoothstep(t: number) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/**
 * The camera is a function of scroll and of the reader's orbit. Scroll is the
 * only thing that changes the dolly; orbit only ever changes the angle, so a
 * drag can never move the reader through the narrative by accident.
 */
export function cameraFor(progress: number, orbit: Orbit, focus: Vec3 | null = null): Camera {
  const t = smoothstep(progress);
  // The near end frames the chosen edition's own neighbourhood; the far end
  // holds the whole field edge to edge without shrinking it to a dot cluster.
  const distance = lerp(76, 124, t) / clamp(orbit.zoom, 0.55, 2.2);
  const yaw = orbit.yaw + lerp(-0.32, 0.5, t);
  const pitch = clamp(orbit.pitch + lerp(0.12, 0.36, t), -1.15, 1.15);
  const target: Vec3 = focus
    ? [
        focus[0] * lerp(0.55, 0.3, t),
        focus[1] * lerp(0.18, 0.3, t),
        focus[2] * lerp(0.55, 0.3, t),
      ]
    : [0, 0, 0];
  const eye = add(target, [
    Math.sin(yaw) * Math.cos(pitch) * distance,
    Math.sin(pitch) * distance,
    Math.cos(yaw) * Math.cos(pitch) * distance,
  ]);
  return { eye, target, fov: 42 };
}

export type Projected = { x: number; y: number; depth: number; scale: number; visible: boolean };

export type Viewport = { width: number; height: number };

export function project(point: Vec3, camera: Camera, viewport: Viewport): Projected {
  const forward = normalize(sub(camera.target, camera.eye));
  const worldUp: Vec3 = Math.abs(forward[1]) > 0.995 ? [0, 0, 1] : [0, 1, 0];
  const right = normalize(cross(forward, worldUp));
  const up = cross(right, forward);
  const relative = sub(point, camera.eye);
  const x = dot(relative, right);
  const y = dot(relative, up);
  const depth = dot(relative, forward);
  const focal = viewport.height / 2 / Math.tan((camera.fov * Math.PI) / 360);
  const safe = Math.max(depth, 0.001);
  return {
    x: viewport.width / 2 + (x / safe) * focal,
    y: viewport.height / 2 - (y / safe) * focal,
    depth,
    scale: focal / safe,
    visible: depth > 1.5,
  };
}

/** A gentle gravitational pull toward the pointer. Screen-space, cosmetic. */
export function lens(
  point: { x: number; y: number },
  focus: { x: number; y: number } | null,
  strength: number,
  radius: number,
) {
  if (!focus || strength <= 0) return point;
  const dx = focus.x - point.x;
  const dy = focus.y - point.y;
  const squared = dx * dx + dy * dy;
  const falloff = 1 / (1 + squared / (radius * radius));
  return {
    x: point.x + dx * falloff * strength,
    y: point.y + dy * falloff * strength,
  };
}

export type RenderNode = {
  node: FieldNode;
  x: number;
  y: number;
  depth: number;
  scale: number;
  alpha: number;
};

export type RenderLink = {
  link: FieldLink;
  points: { x: number; y: number; depth: number }[];
  depth: number;
  alpha: number;
};

export type RenderFrame = {
  nodes: RenderNode[];
  links: RenderLink[];
  near: number;
  far: number;
};

/** Draw order: far links first, then nodes from back to front. */
export function renderField(
  field: Field,
  camera: Camera,
  viewport: Viewport,
  options: { pointer?: { x: number; y: number } | null; lensStrength?: number } = {},
): RenderFrame {
  const byId = new Map(field.nodes.map((node) => [node.id, node]));
  const pointer = options.pointer ?? null;
  const strength = options.lensStrength ?? 0;
  // Fog is relative to the camera's own distance, so the field keeps the same
  // contrast from the opening close-up to the final wide shot. Absolute fog
  // values would either wash out the wide shot or flatten the close-up.
  const cameraDistance = length(sub(camera.eye, camera.target));
  const fogNear = cameraDistance * 0.58;
  const fogFar = cameraDistance * 1.72;
  const depthAlpha = (depth: number) =>
    clamp01(1 - (depth - fogNear) / Math.max(fogFar - fogNear, 1));

  const positions = new Map<string, Projected>();
  for (const node of field.nodes) {
    const raw = project(node.position, camera, viewport);
    positions.set(node.id, raw);
  }

  const links: RenderLink[] = [];
  for (const link of field.links) {
    const from = byId.get(link.from);
    const to = byId.get(link.to);
    if (!from || !to) continue;
    const fromPoint = positions.get(link.from);
    const toPoint = positions.get(link.to);
    if (!fromPoint?.visible || !toPoint?.visible) continue;
    // Curved paths: the midpoint is pushed away from the core, which reads as
    // orbital motion rather than straight wiring.
    const mid: Vec3 = [
      (from.position[0] + to.position[0]) / 2,
      (from.position[1] + to.position[1]) / 2 + length(sub(to.position, from.position)) * 0.08,
      (from.position[2] + to.position[2]) / 2,
    ];
    const points: { x: number; y: number; depth: number }[] = [];
    for (let step = 0; step <= 16; step += 1) {
      const t = step / 16;
      const point: Vec3 = [
        (1 - t) * (1 - t) * from.position[0] + 2 * (1 - t) * t * mid[0] + t * t * to.position[0],
        (1 - t) * (1 - t) * from.position[1] + 2 * (1 - t) * t * mid[1] + t * t * to.position[1],
        (1 - t) * (1 - t) * from.position[2] + 2 * (1 - t) * t * mid[2] + t * t * to.position[2],
      ];
      const projected = project(point, camera, viewport);
      if (!projected.visible) continue;
      const warped = lens(projected, pointer, strength, viewport.height * 0.55);
      points.push({ x: warped.x, y: warped.y, depth: projected.depth });
    }
    if (points.length < 2) continue;
    const depth = (fromPoint.depth + toPoint.depth) / 2;
    links.push({
      link,
      points,
      depth,
      alpha: depthAlpha(depth) * 0.9 + 0.1,
    });
  }

  const nodes: RenderNode[] = [];
  for (const node of field.nodes) {
    const projected = positions.get(node.id);
    if (!projected?.visible) continue;
    const warped = lens(projected, pointer, strength, viewport.height * 0.55);
    nodes.push({
      node,
      x: warped.x,
      y: warped.y,
      depth: projected.depth,
      scale: projected.scale,
      alpha: depthAlpha(projected.depth),
    });
  }

  links.sort((a, b) => b.depth - a.depth);
  nodes.sort((a, b) => b.depth - a.depth);
  return { nodes, links, near: fogNear, far: fogFar };
}

/**
 * A single node that is in front of the pointer, if any. Distances are
 * normalised by node size so a small far node is not easier to hit than a big
 * near one.
 */
export function pickNode(
  frame: RenderFrame,
  point: { x: number; y: number },
): RenderNode | null {
  let best: RenderNode | null = null;
  let bestDistance = Infinity;
  for (const node of frame.nodes) {
    if (node.alpha < 0.16) continue;
    const radius = Math.max(12, node.scale * 1.9);
    const distance = Math.hypot(node.x - point.x, node.y - point.y);
    if (distance > radius) continue;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = node;
    }
  }
  return best;
}

/** Deterministic dust. Not data — atmosphere, and it never carries a label. */
export function dust(count: number, seed = 7) {
  const points: { x: number; y: number; z: number; size: number }[] = [];
  let state = seed >>> 0;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let index = 0; index < count; index += 1) {
    points.push({
      x: (next() - 0.5) * 260,
      y: (next() - 0.5) * 150,
      z: (next() - 0.5) * 260,
      size: 0.35 + next() * 0.85,
    });
  }
  return points;
}
