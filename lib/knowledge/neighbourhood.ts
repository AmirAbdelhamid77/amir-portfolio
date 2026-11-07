// The knowledge neighbourhood: a pure, typed local graph selection over the
// Atlas projection.
//
// Ported from `intelligent-atlas/prototype/neighborhood-model.js` with four
// deliberate differences, each one an improvement recorded in the R1 proposal:
//
//   1. Every occupied group gets at least one branch before a group is allowed
//      a second one, so a concept with many prerequisites cannot hide its
//      contrasts behind a global slice.
//   2. Direction is spoken, not inferred: an edge stored A -> B with
//      `requires_understanding_of` reads "A requires B", and the entry that
//      points *at* the centre says so.
//   3. Membership is same-kind, because the candidate Atlas has one subject and
//      no domain field. It is never presented as a semantic relation.
//   4. Layout is deterministic percentages over the active groups, so the field
//      can be server-rendered, needs no measurement pass, and is testable.
//
// The model never invents an edge, never treats membership as a relation and
// never widens publication: it reads exactly the Atlas it is given.

import { RELATIONS, type Atlas, type Concept, type Edge, type Relation, type Resource, type Source } from "../atlas/model.ts";

export type GroupKey = "requires" | "unlocks" | "contrasts" | "related";
export type Tone = "primary" | "teal" | "magenta" | "amber";

export type GroupDefinition = {
  key: GroupKey;
  label: string;
  /** One line that explains what the group means, not what it looks like. */
  note: string;
  tone: Tone;
};

export const GROUPS: readonly GroupDefinition[] = [
  {
    key: "requires",
    label: "Requires first",
    note: "The concept is readable only after these are understood.",
    tone: "primary",
  },
  {
    key: "unlocks",
    label: "Unlocks",
    note: "These become readable once this concept is understood.",
    tone: "teal",
  },
  {
    key: "contrasts",
    label: "Contrasts",
    note: "Recorded differences that change the decision.",
    tone: "magenta",
  },
  {
    key: "related",
    label: "Related",
    note: "Recorded neighbours: enables, complements, part of a mechanism, or used in the same decision.",
    tone: "amber",
  },
] as const;

const GROUP_BY_KEY = new Map(GROUPS.map((group) => [group.key, group]));

export const KINDS: Record<string, string> = {
  technology_mechanism: "Technology mechanism",
  method: "Method",
  decision_principle: "Decision principle",
  fundamental_concept: "Fundamental concept",
};

export type Neighbour = {
  concept: Concept;
  edge: Edge;
  group: GroupKey;
  groupLabel: string;
  relation: Relation;
  relationLabel: string;
  direction: "out" | "in" | "symmetric";
  /** Short label for a tag or an accessible name. */
  directionLabel: string;
  /** A sentence that states the stored direction in words. */
  directionSentence: string;
  shown: boolean;
};

export type NeighbourhoodGroup = GroupDefinition & {
  count: number;
  entries: Neighbour[];
};

export type Membership = {
  kind: string;
  label: string;
  count: number;
  starters: Concept[];
};

export type Neighbourhood = {
  centre: Concept;
  groups: NeighbourhoodGroup[];
  shown: Neighbour[];
  hidden: Neighbour[];
  total: number;
  hiddenCount: number;
  limit: number;
  membership: Membership;
  evidence: Source[];
  reading: Resource[];
  published: { concepts: number; edges: number };
};

export type Entrance = {
  total: Concept[];
  edges: number;
  starters: Concept[];
  kinds: { key: string; label: string; count: number; starter: Concept | null }[];
  published: { concepts: number; edges: number };
};

export const DEFAULT_LIMIT = 6;

const DIRECTION_SENTENCES: Record<GroupKey, (title: string) => string> = {
  requires: (title) => `This concept requires understanding of ${title} first.`,
  unlocks: (title) => `${title} requires understanding of this concept first.`,
  contrasts: (title) => `${title} is recorded as a contrast with this concept.`,
  related: (title) => `${title} is recorded as a neighbour of this concept.`,
};

const DIRECTION_LABELS: Record<GroupKey, string> = {
  requires: "Requires first",
  unlocks: "Unlocks",
  contrasts: "Contrast",
  related: "Related",
};

function groupFor(edge: Edge, centreId: string): { group: GroupKey; direction: Neighbour["direction"] } | null {
  if (edge.relationType === "requires_understanding_of") {
    return edge.from === centreId
      ? { group: "requires", direction: "out" }
      : { group: "unlocks", direction: "in" };
  }
  if (edge.relationType === "contrasts_with" || edge.relationType === "tradeoff_with") {
    return { group: "contrasts", direction: "symmetric" };
  }
  return {
    group: "related",
    direction: edge.from === centreId ? "out" : "in",
  };
}

/** The concept on the other end of an edge, or null when it is not projected. */
function otherEnd(edge: Edge, centreId: string, byId: Map<string, Concept>): Concept | null {
  const otherId = edge.from === centreId ? edge.to : edge.from;
  return byId.get(otherId) ?? null;
}

export function degreeMap(atlas: Atlas): Map<string, number> {
  const degree = new Map<string, number>(atlas.concepts.map((concept) => [concept.id, 0]));
  for (const edge of atlas.semanticEdges) {
    if (degree.has(edge.from)) degree.set(edge.from, (degree.get(edge.from) ?? 0) + 1);
    if (degree.has(edge.to)) degree.set(edge.to, (degree.get(edge.to) ?? 0) + 1);
  }
  return degree;
}

export function kindLabel(kind: string): string {
  return KINDS[kind] ?? "Concept";
}

/** Cap the visible branches, but never starve an occupied group of its first. */
function selectShown(entries: Neighbour[], limit: number): Set<string> {
  const shown = new Set<string>();
  if (limit <= 0) return shown;
  for (const group of GROUPS) {
    const first = entries.find((entry) => entry.group === group.key);
    if (first && shown.size < limit) shown.add(first.edge.id);
  }
  for (const entry of entries) {
    if (shown.size >= limit) break;
    shown.add(entry.edge.id);
  }
  return shown;
}

export function buildNeighbourhood(
  atlas: Atlas,
  conceptId: string,
  options: { limit?: number; expand?: boolean } = {},
): Neighbourhood | null {
  const byId = new Map(atlas.concepts.map((concept) => [concept.id, concept]));
  const centre = byId.get(conceptId);
  if (!centre) return null;

  const entries: Neighbour[] = [];
  for (const edge of atlas.semanticEdges) {
    if (edge.from !== conceptId && edge.to !== conceptId) continue;
    const concept = otherEnd(edge, conceptId, byId);
    if (!concept) continue;
    const slot = groupFor(edge, conceptId);
    if (!slot) continue;
    const group = GROUP_BY_KEY.get(slot.group)!;
    entries.push({
      concept,
      edge,
      group: slot.group,
      groupLabel: group.label,
      relation: edge.relationType,
      relationLabel: RELATIONS[edge.relationType],
      direction: slot.direction,
      directionLabel: DIRECTION_LABELS[slot.group],
      directionSentence: DIRECTION_SENTENCES[slot.group](concept.title),
      shown: false,
    });
  }

  // One edge id can appear once, even if both endpoints are the centre's
  // neighbours through a symmetric relation.
  const seen = new Set<string>();
  const unique = entries.filter((entry) => {
    if (seen.has(entry.edge.id)) return false;
    seen.add(entry.edge.id);
    return true;
  });

  const ordered: Neighbour[] = [];
  for (const group of GROUPS) {
    const inGroup = unique
      .filter((entry) => entry.group === group.key)
      .sort((a, b) => a.concept.title.localeCompare(b.concept.title));
    ordered.push(...inGroup);
  }

  const requested = options.expand ? ordered.length : (options.limit ?? DEFAULT_LIMIT);
  const limit = Math.max(1, requested);
  const shownIds = selectShown(ordered, limit);
  for (const entry of ordered) entry.shown = shownIds.has(entry.edge.id);

  const groups: NeighbourhoodGroup[] = GROUPS.map((group) => {
    const inGroup = ordered.filter((entry) => entry.group === group.key);
    return { ...group, count: inGroup.length, entries: inGroup };
  });

  const shown = ordered.filter((entry) => entry.shown);
  const hidden = ordered.filter((entry) => !entry.shown);
  const neighbourIds = new Set(ordered.map((entry) => entry.concept.id));
  const degree = degreeMap(atlas);
  const members = atlas.concepts
    .filter((candidate) => candidate.kind === centre.kind && candidate.id !== centre.id && !neighbourIds.has(candidate.id))
    .sort((a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0) || a.title.localeCompare(b.title));

  const sourceIds = new Set<string>([...centre.sourceIds, ...ordered.flatMap((entry) => entry.edge.sourceIds)]);
  const evidence = atlas.sources.filter((source) => sourceIds.has(source.id));

  return {
    centre,
    groups,
    shown,
    hidden,
    total: ordered.length,
    hiddenCount: hidden.length,
    limit,
    membership: {
      kind: centre.kind,
      label: kindLabel(centre.kind),
      count: members.length,
      starters: members.slice(0, 3),
    },
    evidence,
    reading: atlas.catalog.filter((resource) => resource.conceptIds.includes(centre.id)),
    published: {
      concepts: atlas.concepts.filter((concept) => concept.editorialState === "published").length,
      edges: atlas.semanticEdges.filter((edge) => edge.editorialState === "published").length,
    },
  };
}

/** Entrances: the honest one-subject index plus the densest real starters. */
export function buildEntrances(atlas: Atlas, options: { limit?: number } = {}): Entrance {
  const limit = Math.max(1, options.limit ?? 4);
  const degree = degreeMap(atlas);
  const ranked = [...atlas.concepts].sort(
    (a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0) || a.title.localeCompare(b.title),
  );
  const kinds = Object.keys(KINDS).map((key) => {
    const inKind = ranked.filter((concept) => concept.kind === key);
    return { key, label: kindLabel(key), count: inKind.length, starter: inKind[0] ?? null };
  });
  return {
    total: atlas.concepts,
    edges: atlas.semanticEdges.length,
    starters: ranked.slice(0, limit),
    kinds: kinds.filter((kind) => kind.count > 0),
    published: {
      concepts: atlas.concepts.filter((concept) => concept.editorialState === "published").length,
      edges: atlas.semanticEdges.filter((edge) => edge.editorialState === "published").length,
    },
  };
}

/**
 * Search over title, aliases and definition, ranked so a title match comes
 * first. Mirrors `searchConcepts` in the Atlas model but returns concepts with
 * their degree so the result can say how much neighbourhood it opens.
 */
export function searchNeighbourhood(atlas: Atlas, query: string, limit = 6): Concept[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const degree = degreeMap(atlas);
  return atlas.concepts
    .filter((concept) =>
      words.every((word) =>
        [concept.title, ...concept.aliases, concept.definition].join(" ").toLowerCase().includes(word),
      ),
    )
    .sort((a, b) => {
      const aTitle = words.every((word) => a.title.toLowerCase().includes(word)) ? 0 : 1;
      const bTitle = words.every((word) => b.title.toLowerCase().includes(word)) ? 0 : 1;
      return aTitle - bTitle || (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0) || a.title.localeCompare(b.title);
    })
    .slice(0, limit);
}

/* ------------------------------------------------------------------ layout */

export type Placement = { id: string; x: number; y: number; angle: number };

// Radii are percentages of the field. They are deliberately generous: the
// branch card is ~166x66 px at 1280, so a group of four must use most of the
// field's height to keep 66 px between cards. `tests/knowledge` asserts the
// resulting card boxes at both field sizes the CSS produces.
const RADIUS_X = 40;
const RADIUS_Y = 38;

/**
 * Place the active groups around the centre, spreading each group along its
 * own arc. Returns percentages, so the field can render on the server and the
 * same geometry can be asserted in tests.
 *
 * The first active group sits on the left (180 degrees) and the rest follow
 * clockwise in canonical order: left, top, right, bottom for four groups.
 */
export function layoutNeighbourhood(groups: readonly { key: GroupKey; entries: readonly { edge: { id: string }; shown?: boolean }[] }[]): Placement[] {
  const active = GROUPS.map((definition) => ({
    key: definition.key,
    entries: (groups.find((group) => group.key === definition.key)?.entries ?? []).filter(
      (entry) => entry.shown !== false,
    ),
  })).filter((group) => group.entries.length > 0);

  if (!active.length) return [];

  const step = 360 / active.length;
  const placements: Placement[] = [];

  active.forEach((group, groupIndex) => {
    const base = 180 + groupIndex * step;
    const count = group.entries.length;
    // Leave at least 30 degrees between neighbouring groups, so a busy group
    // can never walk into the next group's arc.
    const cap = Math.min(88, step - 30);
    const totalSpread = count === 1 ? 0 : Math.min(cap, 30 + 20 * (count - 1));
    group.entries.forEach((entry, index) => {
      const angle = base + (count === 1 ? 0 : (index - (count - 1) / 2) * (totalSpread / (count - 1)));
      const radians = (angle * Math.PI) / 180;
      placements.push({
        id: entry.edge.id,
        x: Number((50 + Math.cos(radians) * RADIUS_X).toFixed(2)),
        y: Number((50 + Math.sin(radians) * RADIUS_Y).toFixed(2)),
        angle: Number(angle.toFixed(2)),
      });
    });
  });

  return placements;
}

/** The two control points of a gentle bow between the centre and a branch. */
export function edgePath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  // Bow perpendicular to the segment, always toward the top of the field.
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const bow = 4;
  const controlX = midX + (dy / length) * bow;
  const controlY = midY - (dx / length) * bow;
  return `M ${from.x} ${from.y} Q ${controlX.toFixed(2)} ${controlY.toFixed(2)} ${to.x} ${to.y}`;
}

export function groupNote(key: GroupKey): string {
  return GROUP_BY_KEY.get(key)?.note ?? "";
}
