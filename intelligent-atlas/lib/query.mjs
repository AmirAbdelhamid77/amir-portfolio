// Shared, pure query layer for the Knowledge Stage (milestone M2).
//
// One index, one set of answers, used by the review prototype, the tests and any
// later route. No I/O, no DOM, no dependencies: the caller reads the JSON
// documents and hands them in. Every function is deterministic for the same
// input, returns fresh objects, and fails closed: a candidate edge is never
// treated as published, and the public payload publishes nothing that the
// projection has not explicitly released.
import { planGoal, PREREQUISITE_RELATION } from "./route-planner.mjs";

export const QUERY_SCHEMA_VERSION = "intelligent-atlas-query/1.0";
export const PUBLIC_PAYLOAD_SCHEMA_VERSION = "intelligent-atlas-query/1.0";

/** Edge review states this index is allowed to hold at all. */
export const INDEXABLE_EDGE_STATES = new Set(["candidate", "technical_review", "approved", "published"]);
/** States that a learner may act on. Everything else is shown as unverified. */
export const ELIGIBLE_STATES = new Set(["approved", "published"]);
/** Resource roles in the order a reader benefits from them. */
const ROLE_RANK = { explains: 0, demonstrates: 1, applies: 2, practices: 3, references: 4 };
/** Relation phrase used when a recommendation explains itself. */
const RELATION_PHRASE = {
  requires_understanding_of: "prerequisite",
  part_of_mechanism: "part of the mechanism",
  enables: "enables",
  contrasts_with: "contrasts with",
  tradeoff_with: "trades off against",
  complements: "complements",
  related_in_decision: "used together in a decision",
};
/** Which relations each intent mode may surface, and in which direction. */
const INTENT_RELATIONS = {
  understand: { out: ["requires_understanding_of", "part_of_mechanism"], in: ["part_of_mechanism"] },
  compare: { out: ["contrasts_with", "tradeoff_with", "complements"], in: ["contrasts_with", "tradeoff_with", "complements"] },
  apply: { out: ["enables", "part_of_mechanism"], in: [] },
  reach: { out: [], in: ["requires_understanding_of"] },
};

/**
 * Build the integrity-checked index. Throws on any structural defect instead of
 * answering from a broken graph.
 */
export function createIndex(graph, mappingsDoc, projection = null) {
  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    throw new Error("createIndex: graph must expose nodes[] and edges[]");
  }
  const mappingList = Array.isArray(mappingsDoc) ? mappingsDoc : mappingsDoc?.mappings;
  if (!Array.isArray(mappingList)) {
    throw new Error("createIndex: mappings document must expose mappings[]");
  }

  const concepts = new Map();
  for (const node of graph.nodes) {
    if (!node?.id) throw new Error("createIndex: concept without id");
    if (concepts.has(node.id)) throw new Error(`createIndex: duplicate concept id ${node.id}`);
    concepts.set(node.id, node);
  }

  const edges = new Map();
  const assertionsByConcept = new Map();
  for (const edge of graph.edges) {
    if (!edge?.id) throw new Error("createIndex: edge without id");
    if (edges.has(edge.id)) throw new Error(`createIndex: duplicate edge id ${edge.id}`);
    if (!concepts.has(edge.from)) throw new Error(`createIndex: edge ${edge.id} has dangling from (${edge.from})`);
    if (!concepts.has(edge.to)) throw new Error(`createIndex: edge ${edge.id} has dangling to (${edge.to})`);
    if (edge.from === edge.to) throw new Error(`createIndex: edge ${edge.id} points at itself`);
    if (!INDEXABLE_EDGE_STATES.has(edge.reviewState)) {
      throw new Error(`createIndex: edge ${edge.id} has unknown reviewState ${edge.reviewState}`);
    }
    edges.set(edge.id, edge);
    for (const conceptId of [edge.from, edge.to]) {
      if (!assertionsByConcept.has(conceptId)) assertionsByConcept.set(conceptId, []);
      assertionsByConcept.get(conceptId).push(edge.id);
    }
  }

  const resources = new Map();
  const units = new Map();
  for (const mapping of mappingList) {
    if (!mapping?.unitId) throw new Error("createIndex: mapping without unitId");
    if (!concepts.has(mapping.conceptId)) {
      throw new Error(`createIndex: mapping ${mapping.id ?? mapping.unitId} references unknown concept ${mapping.conceptId}`);
    }
    if (typeof mapping.canonicalHref !== "string" || !mapping.canonicalHref.startsWith("/")) {
      throw new Error(`createIndex: mapping ${mapping.unitId} has no local canonicalHref`);
    }
    if (!resources.has(mapping.conceptId)) resources.set(mapping.conceptId, []);
    resources.get(mapping.conceptId).push(mapping);
    units.set(mapping.unitId, mapping);
  }

  if (projection) {
    if (projection.graphBuildId && graph.graphBuildId && projection.graphBuildId !== graph.graphBuildId) {
      throw new Error(
        `createIndex: projection was built for ${projection.graphBuildId}, graph is ${graph.graphBuildId}`,
      );
    }
  }

  return {
    graphBuildId: graph.graphBuildId ?? null,
    concepts,
    edges,
    assertionsByConcept,
    resources,
    units,
    goals: new Map((graph.goals ?? []).map((goal) => [goal.goalId ?? goal.id, goal])),
    projection: projection ?? null,
  };
}

/** Edges touching a concept, optionally filtered by direction and relation. */
function incidentEdges(index, conceptId, { direction = "both", relations = null } = {}) {
  const allowed = relations ? new Set(relations) : null;
  const out = [];
  for (const edgeId of index.assertionsByConcept.get(conceptId) ?? []) {
    const edge = index.edges.get(edgeId);
    if (allowed && !allowed.has(edge.relationType)) continue;
    const outgoing = edge.from === conceptId;
    const incoming = edge.to === conceptId;
    if (direction === "out" && !outgoing) continue;
    if (direction === "in" && !incoming) continue;
    out.push(edge);
  }
  return out;
}

/**
 * Breadth-first neighbourhood around one anchor concept. Depth is the hop at
 * which a node or edge was first reached; `maxHops` 2 must still honour the
 * relation filter on the second hop.
 */
export function neighborhood(index, conceptId, options = {}) {
  const { direction = "both", relations = null, maxHops = 1, includeIncoming = true } = options;
  const center = index.concepts.get(conceptId);
  if (!center) throw new Error(`neighborhood: unknown concept ${conceptId}`);
  const hops = Math.max(1, Math.min(3, Number(maxHops) || 1));

  const nodes = [{ id: center.id, label: center.label ?? center.id, domain: center.domain ?? "unknown", depth: 0 }];
  const seen = new Set([center.id]);
  const collected = new Map(); // edgeId -> depth
  let frontier = [center.id];

  for (let depth = 1; depth <= hops; depth += 1) {
    const nextFrontier = [];
    for (const current of frontier) {
      // includeIncoming only narrows the first hop; deeper hops use `direction`.
      const hopDirection = depth === 1 && !includeIncoming ? "out" : direction;
      for (const edge of incidentEdges(index, current, { direction: hopDirection, relations })) {
        if (!collected.has(edge.id)) collected.set(edge.id, depth);
        const other = edge.from === current ? edge.to : edge.from;
        if (!seen.has(other)) {
          seen.add(other);
          const node = index.concepts.get(other);
          nodes.push({ id: node.id, label: node.label ?? node.id, domain: node.domain ?? "unknown", depth });
          nextFrontier.push(other);
        }
      }
    }
    frontier = nextFrontier;
    if (!frontier.length) break;
  }

  const edges = [...collected.entries()]
    .map(([edgeId, depth]) => {
      const edge = index.edges.get(edgeId);
      return {
        id: edge.id,
        from: edge.from,
        to: edge.to,
        relationType: edge.relationType,
        direction: edge.direction ?? "directed",
        claim: edge.claim ?? "",
        conditions: edge.conditions ?? "",
        supportKind: edge.supportKind ?? "unknown",
        evidenceCount: Array.isArray(edge.evidence) ? edge.evidence.length : 0,
        reviewState: edge.reviewState,
        depth,
      };
    })
    .sort((a, b) => a.depth - b.depth || a.relationType.localeCompare(b.relationType) || a.id.localeCompare(b.id));

  nodes.sort((a, b) => a.depth - b.depth || a.id.localeCompare(b.id));
  return { center: center.id, nodes, edges };
}

/** Lowercase, strip diacritics and tatweel, collapse whitespace. */
export function normalizeTerm(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Ranked concept search. Exact label beats alias, alias beats definition, and
 * a claim match is the weakest signal because the claim belongs to the edge.
 */
export function searchConcepts(index, query, options = {}) {
  const { limit = 8 } = options;
  const needle = normalizeTerm(query);
  if (!needle) return [];
  const claimsByConcept = new Map();
  for (const edge of index.edges.values()) {
    for (const conceptId of [edge.from, edge.to]) {
      if (!claimsByConcept.has(conceptId)) claimsByConcept.set(conceptId, []);
      claimsByConcept.get(conceptId).push(edge.claim ?? "");
    }
  }

  const results = [];
  for (const node of index.concepts.values()) {
    const label = normalizeTerm(node.label);
    const aliases = [node.aliases?.en ?? [], node.aliases?.ar ?? []].flat().map(normalizeTerm);
    const definition = normalizeTerm(node.definition);
    let score = 0;
    let matchedOn = null;
    const bump = (value, weight, field) => {
      if (!value) return;
      let hit = 0;
      if (value === needle) hit = weight + 40;
      else if (value.startsWith(needle)) hit = weight + 20;
      else if (value.includes(needle)) hit = weight + 10;
      if (hit > score) {
        score = hit;
        matchedOn = field;
      }
    };
    bump(label, 60, "label");
    for (const alias of aliases) bump(alias, 40, "alias");
    bump(definition, 10, "definition");
    for (const claim of claimsByConcept.get(node.id) ?? []) {
      if (normalizeTerm(claim).includes(needle) && score < 8) {
        score = 8;
        matchedOn = "claim";
      }
    }
    if (score > 0) {
      results.push({ id: node.id, label: node.label ?? node.id, score, matchedOn: matchedOn ?? "definition" });
    }
  }

  return results
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label) || a.id.localeCompare(b.id))
    .slice(0, Math.max(0, limit));
}

/** Local resources for one concept, best role first, deduplicated by href. */
export function resourcesForConcept(index, conceptId, options = {}) {
  const { roles = null, language = null, limit = 20 } = options;
  if (!index.concepts.has(conceptId)) throw new Error(`resourcesForConcept: unknown concept ${conceptId}`);
  const allowed = roles ? new Set(roles) : null;
  const best = new Map();
  for (const mapping of index.resources.get(conceptId) ?? []) {
    if (allowed && !allowed.has(mapping.role)) continue;
    if (language && mapping.language !== language) continue;
    const current = best.get(mapping.canonicalHref);
    if (!current || (ROLE_RANK[mapping.role] ?? 9) < (ROLE_RANK[current.role] ?? 9)) {
      best.set(mapping.canonicalHref, mapping);
    }
  }
  return [...best.values()]
    .sort(
      (a, b) =>
        (ROLE_RANK[a.role] ?? 9) - (ROLE_RANK[b.role] ?? 9) ||
        String(a.unitId).localeCompare(String(b.unitId)),
    )
    .slice(0, Math.max(0, limit))
    .map((mapping) => ({
      unitId: mapping.unitId,
      href: mapping.canonicalHref,
      role: mapping.role,
      language: mapping.language ?? null,
      sourcePath: mapping.sourcePath ?? null,
      reviewState: mapping.reviewState ?? "candidate",
    }));
}

/**
 * Next concepts for one intent mode. Every item comes from a stored edge: no
 * edge, no recommendation. `eligible` is false unless the edge is approved.
 */
export function recommendNext(index, conceptId, options = {}) {
  const { intent = "understand", limit = 5 } = options;
  if (!index.concepts.has(conceptId)) throw new Error(`recommendNext: unknown concept ${conceptId}`);
  const spec = INTENT_RELATIONS[intent];
  if (!spec) throw new Error(`recommendNext: unknown intent ${intent}`);

  const candidates = [];
  for (const edge of incidentEdges(index, conceptId, { direction: "out", relations: spec.out })) {
    candidates.push({ edge, nextId: edge.to, relationType: edge.relationType });
  }
  for (const edge of incidentEdges(index, conceptId, { direction: "in", relations: spec.in })) {
    candidates.push({ edge, nextId: edge.from, relationType: edge.relationType });
  }

  const seen = new Set();
  const items = [];
  for (const candidate of candidates) {
    if (candidate.nextId === conceptId || seen.has(candidate.nextId)) continue;
    seen.add(candidate.nextId);
    const node = index.concepts.get(candidate.nextId);
    const phrase = RELATION_PHRASE[candidate.relationType] ?? candidate.relationType;
    items.push({
      conceptId: candidate.nextId,
      label: node?.label ?? candidate.nextId,
      relationType: candidate.relationType,
      reason: `${phrase}: ${String(candidate.edge.claim ?? "").replace(/\s+/g, " ").trim()}`,
      evidenceCount: Array.isArray(candidate.edge.evidence) ? candidate.edge.evidence.length : 0,
      reviewState: candidate.edge.reviewState,
      eligible: ELIGIBLE_STATES.has(candidate.edge.reviewState),
    });
  }

  return items
    .sort(
      (a, b) =>
        Number(b.eligible) - Number(a.eligible) ||
        b.evidenceCount - a.evidenceCount ||
        a.label.localeCompare(b.label) ||
        a.conceptId.localeCompare(b.conceptId),
    )
    .slice(0, Math.max(0, limit));
}

/**
 * Route for one goal, delegated to the same planner the app uses so the ordering
 * rules cannot drift. A cycle is reported, not thrown.
 */
export function routeFor(index, goalId, options = {}) {
  const { startConceptId = null } = options;
  const goal = index.goals.get(goalId);
  if (!goal) throw new Error(`routeFor: unknown goal ${goalId}`);

  const resources = new Map();
  for (const [conceptId, list] of index.resources.entries()) {
    resources.set(
      conceptId,
      list.map((mapping) => ({
        unitId: mapping.unitId,
        href: mapping.canonicalHref,
        role: mapping.role,
        locator: mapping.locator,
        sourcePath: mapping.sourcePath,
        language: mapping.language,
        reviewState: mapping.reviewState,
      })),
    );
  }

  const plan = planGoal(goal, {
    assertions: [...index.edges.values()].filter((edge) => edge.relationType === PREREQUISITE_RELATION),
    concepts: index.concepts,
    resources,
    basis: "candidate-review",
    graphBuildId: index.graphBuildId,
  });

  let order = plan.steps.map((step) => step.conceptId);
  let steps = plan.steps;
  let trimmed = false;
  if (startConceptId) {
    const position = order.indexOf(startConceptId);
    if (position > 0) {
      order = order.slice(position);
      steps = steps.slice(position);
      trimmed = true;
    }
  }

  return {
    goalId,
    supported: plan.supported,
    status: plan.status,
    order,
    steps,
    gaps: {
      conceptsWithoutResource: plan.coverage.gapConceptIds,
      missingPrerequisites: plan.coverage.missingPrerequisiteIds,
    },
    cycles: Boolean(plan.cycleDetected),
    cycle: plan.cycle ?? null,
    trimmed,
    coverage: plan.coverage,
  };
}

/**
 * Public payload. Today the projection releases nothing, so this returns an
 * empty, honest payload. If items are released later, only those items appear.
 */
export function publicPayload(index) {
  const projection = index.projection;
  const publishedConcepts = projection?.publishedConcepts ?? [];
  const publishedAssertions = projection?.publishedAssertions ?? [];
  const withheldCount = (projection?.withheld?.conceptCount ?? 0) + (projection?.withheld?.assertionCount ?? 0);

  const concepts = publishedConcepts
    .filter((item) => index.concepts.has(item.id))
    .map((item) => {
      const node = index.concepts.get(item.id);
      return { id: node.id, label: node.label ?? node.id, domain: node.domain ?? "unknown" };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  const assertions = publishedAssertions
    .filter((item) => index.edges.has(item.id))
    .map((item) => {
      const edge = index.edges.get(item.id);
      return {
        id: edge.id,
        from: edge.from,
        to: edge.to,
        relationType: edge.relationType,
        claim: edge.claim ?? "",
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  return {
    schemaVersion: PUBLIC_PAYLOAD_SCHEMA_VERSION,
    graphBuildId: index.graphBuildId,
    concepts,
    assertions,
    isPubliclyEmpty: concepts.length === 0 && assertions.length === 0,
    withheldCount,
    note:
      concepts.length || assertions.length
        ? "Only items released by the publication projection are included."
        : projection?.emptyState?.learnerMessage ??
          "No concept or assertion has passed publication review, so this payload is intentionally empty.",
  };
}
