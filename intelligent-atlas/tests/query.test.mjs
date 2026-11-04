// M2: shared query layer regressions.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  createIndex,
  neighborhood,
  searchConcepts,
  resourcesForConcept,
  recommendNext,
  routeFor,
  publicPayload,
  normalizeTerm,
} from "../lib/query.mjs";
import { planGoal } from "../lib/route-planner.mjs";

const read = (path) => JSON.parse(readFileSync(join(process.cwd(), path), "utf8"));
const graph = read("intelligent-atlas/analysis/graph-build.json");
const mappings = read("intelligent-atlas/analysis/mappings.json");
const projection = read("intelligent-atlas/analysis/public-projection-v2.json");
const index = createIndex(graph, mappings, projection);

const concept = (id, extra = {}) => ({ id, label: id, domain: "test", ...extra });
const edge = (id, from, to, relationType = "requires_understanding_of", extra = {}) => ({
  id,
  from,
  to,
  relationType,
  direction: "directed",
  claim: `claim for ${id}`,
  conditions: "",
  supportKind: "direct",
  evidence: [{ unitId: `u-${id}` }],
  reviewState: "candidate",
  ...extra,
});
const mapping = (unitId, conceptId, extra = {}) => ({
  id: `map-${unitId}-${conceptId}`,
  unitId,
  conceptId,
  role: "explains",
  canonicalHref: `/${unitId}`,
  language: "en",
  reviewState: "candidate",
  ...extra,
});

test("index: real corpus builds with the documented shape", () => {
  assert.equal(index.concepts.size, 132);
  assert.equal(index.edges.size, 86);
  assert.equal(mappings.mappings.length, 7309);
  assert.equal(index.goals.size, 3);
});

test("index: refuses duplicate concept ids", () => {
  assert.throws(
    () => createIndex({ nodes: [concept("a"), concept("a")], edges: [] }, { mappings: [] }),
    /duplicate concept id/,
  );
});

test("index: refuses duplicate edge ids and dangling endpoints", () => {
  assert.throws(
    () => createIndex({ nodes: [concept("a")], edges: [edge("e1", "a", "a")] }, { mappings: [] }),
    /points at itself/,
  );
  assert.throws(
    () =>
      createIndex(
        { nodes: [concept("a"), concept("b")], edges: [edge("e1", "a", "b"), edge("e1", "a", "b")] },
        { mappings: [] },
      ),
    /duplicate edge id/,
  );
  assert.throws(
    () => createIndex({ nodes: [concept("a")], edges: [edge("e1", "a", "missing")] }, { mappings: [] }),
    /dangling to/,
  );
});

test("index: refuses an edge reviewState outside the known set", () => {
  assert.throws(
    () =>
      createIndex(
        { nodes: [concept("a"), concept("b")], edges: [edge("e1", "a", "b", "requires_understanding_of", { reviewState: "published-by-vibes" })] },
        { mappings: [] },
      ),
    /unknown reviewState/,
  );
});

test("index: refuses a mapping to an unknown concept or a non-local href", () => {
  assert.throws(
    () => createIndex({ nodes: [concept("a")], edges: [] }, { mappings: [mapping("u1", "nope")] }),
    /unknown concept/,
  );
  assert.throws(
    () => createIndex({ nodes: [concept("a")], edges: [] }, { mappings: [mapping("u1", "a", { canonicalHref: "https://example.com" })] }),
    /no local canonicalHref/,
  );
});

test("index: refuses a projection built for a different graph", () => {
  assert.throws(
    () =>
      createIndex(
        { graphBuildId: "build-a", nodes: [concept("a")], edges: [] },
        { mappings: [] },
        { graphBuildId: "build-b", publishedConcepts: [], publishedAssertions: [] },
      ),
    /projection was built for build-b/,
  );
});

test("neighborhood: one hop around a join returns both directions", () => {
  const result = neighborhood(index, "concept:sql:join");
  assert.equal(result.center, "concept:sql:join");
  assert.deepEqual(
    result.nodes.map((node) => node.id),
    ["concept:sql:join", "concept:fabric:star-schema", "concept:sql:grain", "concept:sql:set-operations"],
  );
  assert.deepEqual(
    result.edges.map((edge) => edge.id),
    ["assert:ia:sql-set-join-contrast", "assert:ia:fabric-star-join", "assert:ia:sql-join-grain"],
  );
  assert.deepEqual(result.nodes.map((node) => node.depth), [0, 1, 1, 1]);
});

test("neighborhood: outgoing only, and includeIncoming=false, both drop the incoming edges", () => {
  const outgoing = neighborhood(index, "concept:sql:join", { direction: "out" });
  assert.deepEqual(outgoing.edges.map((edge) => edge.id), ["assert:ia:sql-join-grain"]);
  assert.deepEqual(outgoing.nodes.map((node) => node.id), ["concept:sql:join", "concept:sql:grain"]);

  const noIncoming = neighborhood(index, "concept:sql:join", { includeIncoming: false });
  assert.deepEqual(noIncoming.edges.map((edge) => edge.id), ["assert:ia:sql-join-grain"]);
});

test("neighborhood: relation filter applies on both hops", () => {
  const twoHops = neighborhood(index, "concept:stats:confidence-interval", {
    maxHops: 2,
    relations: ["requires_understanding_of"],
  });
  const depthOf = new Map(twoHops.nodes.map((node) => [node.id, node.depth]));
  assert.equal(depthOf.get("concept:stats:standard-error"), 1);
  assert.equal(depthOf.get("concept:stats:sampling-distribution"), 2);
  assert.ok(twoHops.edges.every((edge) => edge.relationType === "requires_understanding_of"));
  assert.ok(twoHops.edges.some((edge) => edge.depth === 2));
});

test("neighborhood: an unknown concept throws rather than guessing", () => {
  assert.throws(() => neighborhood(index, "concept:nope"), /unknown concept/);
});

test("neighborhood: repeated calls return equal, fresh objects", () => {
  const first = neighborhood(index, "concept:fabric:shortcut");
  const second = neighborhood(index, "concept:fabric:shortcut");
  assert.deepEqual(first, second);
  assert.notEqual(first.nodes, second.nodes);
});

test("search: blank queries return nothing", () => {
  assert.deepEqual(searchConcepts(index, ""), []);
  assert.deepEqual(searchConcepts(index, "   "), []);
});

test("search: grain ranks both grain concepts first", () => {
  const results = searchConcepts(index, "grain");
  const ids = results.slice(0, 2).map((item) => item.id).sort();
  assert.deepEqual(ids, ["concept:fabric:grain", "concept:sql:grain"]);
  assert.ok(results.slice(0, 2).every((item) => ["label", "alias"].includes(item.matchedOn)));
  assert.ok(results.every((item, position) => position === 0 || results[position - 1].score >= item.score));
});

test("search: aliases and diacritics are matched", () => {
  const aliasHit = searchConcepts(index, "null count");
  assert.ok(aliasHit.some((item) => item.id === "concept:analysis:data-quality" && item.matchedOn === "alias"));

  assert.equal(normalizeTerm("  Résumé   Schéma "), "resume schema");
  const synthetic = createIndex(
    { nodes: [concept("concept:test:resume", { label: "Résumé", aliases: { en: ["CV"] }, definition: "Summary of work" })], edges: [] },
    { mappings: [] },
  );
  assert.deepEqual(searchConcepts(synthetic, "resume").map((item) => item.id), ["concept:test:resume"]);
  assert.deepEqual(searchConcepts(synthetic, "cv").map((item) => item.matchedOn), ["alias"]);
});

test("search: limit is honoured and deterministic", () => {
  const first = searchConcepts(index, "data", { limit: 3 });
  const second = searchConcepts(index, "data", { limit: 3 });
  assert.equal(first.length, 3);
  assert.deepEqual(first, second);
});

test("resources: deduplicated by href, best role first", () => {
  const all = resourcesForConcept(index, "concept:sql:join", { limit: 200 });
  assert.equal(all.length, 67);
  assert.equal(new Set(all.map((item) => item.href)).size, 67);
  assert.equal(all[0].role, "explains");
  const roles = all.map((item) => item.role);
  assert.equal(roles[roles.length - 1], "practices");
});

test("resources: role and language filters", () => {
  const practices = resourcesForConcept(index, "concept:sql:join", { roles: ["practices"], limit: 5 });
  assert.equal(practices.length, 5);
  assert.ok(practices.every((item) => item.role === "practices"));
  const arabic = resourcesForConcept(index, "concept:fabric:onelake", { language: "ar", limit: 50 });
  assert.ok(arabic.every((item) => item.language === "ar"));
});

test("recommend: understand returns the stored prerequisite with a traceable reason", () => {
  const items = recommendNext(index, "concept:sql:join", { intent: "understand" });
  assert.equal(items.length, 1);
  const [item] = items;
  assert.equal(item.conceptId, "concept:sql:grain");
  assert.equal(item.relationType, "requires_understanding_of");
  assert.match(item.reason, /^prerequisite: .+/);
  assert.ok(item.reason.includes("join can multiply or preserve rows"));
  assert.equal(item.eligible, false);
  assert.equal(item.reviewState, "candidate");
});

test("recommend: compare and reach use different edge directions", () => {
  const compare = recommendNext(index, "concept:sql:join", { intent: "compare" });
  assert.deepEqual(compare.map((item) => item.conceptId), ["concept:sql:set-operations"]);
  assert.match(compare[0].reason, /^contrasts with: /);

  const reach = recommendNext(index, "concept:sql:grain", { intent: "reach" });
  assert.deepEqual(
    reach.map((item) => item.conceptId),
    ["concept:viz:analytical-task", "concept:sql:keys", "concept:sql:join"],
  );
  assert.ok(reach.every((item) => item.relationType === "requires_understanding_of"));
  assert.ok(reach.every((item) => item.eligible === false));
});

test("recommend: an intent with no stored relation returns nothing", () => {
  assert.deepEqual(recommendNext(index, "concept:stats:p-value", { intent: "compare" }), []);
  assert.throws(() => recommendNext(index, "concept:sql:join", { intent: "vibes" }), /unknown intent/);
});

test("recommend: only approved edges are eligible", () => {
  const synthetic = createIndex(
    {
      nodes: [concept("a"), concept("b"), concept("c")],
      edges: [
        edge("e1", "a", "b", "requires_understanding_of", { reviewState: "candidate" }),
        edge("e2", "a", "c", "requires_understanding_of", { reviewState: "approved" }),
      ],
    },
    { mappings: [] },
  );
  const items = recommendNext(synthetic, "a", { intent: "understand" });
  assert.deepEqual(items.map((item) => [item.conceptId, item.eligible]), [["c", true], ["b", false]]);
});

test("route: the three real goals match the app planner exactly", () => {
  const resources = new Map();
  for (const [conceptId, list] of index.resources.entries()) {
    resources.set(conceptId, list.map((item) => ({ ...item, href: item.canonicalHref })));
  }
  for (const goal of graph.goals) {
    const expected = planGoal(goal, {
      assertions: graph.edges.filter((item) => item.relationType === "requires_understanding_of"),
      concepts: index.concepts,
      resources,
      basis: "candidate-review",
      graphBuildId: graph.graphBuildId,
    });
    const actual = routeFor(index, goal.goalId);
    assert.equal(actual.supported, expected.supported, goal.goalId);
    assert.equal(actual.status, expected.status, goal.goalId);
    assert.deepEqual(actual.order, expected.steps.map((step) => step.conceptId), goal.goalId);
    assert.equal(actual.cycles, expected.cycleDetected, goal.goalId);
    assert.deepEqual(actual.gaps.conceptsWithoutResource, expected.coverage.gapConceptIds, goal.goalId);
  }
});

test("route: startConceptId trims the order without reordering it", () => {
  const goal = graph.goals[0];
  const full = routeFor(index, goal.goalId);
  const start = full.order[Math.min(1, full.order.length - 1)];
  const trimmed = routeFor(index, goal.goalId, { startConceptId: start });
  assert.equal(trimmed.trimmed, true);
  assert.deepEqual(trimmed.order, full.order.slice(full.order.indexOf(start)));
  assert.deepEqual(trimmed.order, [...trimmed.order].sort((a, b) => full.order.indexOf(a) - full.order.indexOf(b)));
});

test("route: a cycle is reported, not thrown", () => {
  const synthetic = createIndex(
    {
      graphBuildId: "synthetic",
      nodes: [concept("A"), concept("B")],
      edges: [edge("e1", "A", "B"), edge("e2", "B", "A")],
      goals: [{ goalId: "goal:cycle", title: "cycle", targetConcepts: ["A"] }],
    },
    { mappings: [mapping("u-a", "A"), mapping("u-b", "B")] },
  );
  const route = routeFor(synthetic, "goal:cycle");
  assert.equal(route.cycles, true);
  assert.equal(route.supported, false);
  assert.ok(Array.isArray(route.order));
});

test("route: an unknown goal throws", () => {
  assert.throws(() => routeFor(index, "goal:nope"), /unknown goal/);
});

test("public payload: publishes nothing today and says so", () => {
  const payload = publicPayload(index);
  assert.equal(payload.schemaVersion, "intelligent-atlas-query/1.0");
  assert.deepEqual(payload.concepts, []);
  assert.deepEqual(payload.assertions, []);
  assert.equal(payload.isPubliclyEmpty, true);
  assert.equal(payload.withheldCount, 132 + 86);
  assert.match(payload.note, /not published yet|publication review/i);
});

test("public payload: releases only what the projection names", () => {
  const synthetic = createIndex(
    { graphBuildId: "b1", nodes: [concept("a"), concept("b")], edges: [edge("e1", "a", "b")] },
    { mappings: [mapping("u-a", "a")] },
    { graphBuildId: "b1", publishedConcepts: [{ id: "a" }, { id: "missing" }], publishedAssertions: [{ id: "e1" }] },
  );
  const payload = publicPayload(synthetic);
  assert.deepEqual(payload.concepts.map((item) => item.id), ["a"]);
  assert.deepEqual(payload.assertions.map((item) => item.id), ["e1"]);
  assert.equal(payload.isPubliclyEmpty, false);
});
