// Public projection gate: prove it admits approved records and withholds everything else.
import test from "node:test";
import assert from "node:assert/strict";
import { projectPublic, serializePublicProjection } from "../tools/project-public.mjs";

const concept = (overrides = {}) => ({
  id: "concept:test:a",
  label: "A",
  domain: "test",
  domainLabel: "Test",
  kind: "reasoning",
  definition: "A definition.",
  scope: "A scope.",
  reviewState: "candidate",
  ...overrides,
});

const assertion = (overrides = {}) => ({
  id: "assert:test:a-b",
  from: "concept:test:a",
  to: "concept:test:b",
  relationType: "requires_understanding_of",
  direction: "directed",
  claim: "A requires B.",
  conditions: "",
  rationale: "Test fixture.",
  supportKind: "direct",
  reviewState: "candidate",
  ...overrides,
});

const insight = (overrides = {}) => ({
  id: "insight-test",
  date: "2026-11-01",
  title: "Test edition",
  takeaway: "A takeaway.",
  reviewStatus: "technical_review",
  ...overrides,
});

const graph = (nodes, edges) => ({
  graphBuildId: "graph-fixture",
  nodes,
  edges,
  domains: [{ id: "test" }],
});

test("empty graph produces an explicitly empty public projection", () => {
  const projection = projectPublic({ graph: graph([], []), insights: [] });
  assert.equal(projection.publishedConcepts.length, 0);
  assert.equal(projection.publishedAssertions.length, 0);
  assert.equal(projection.emptyState.isPubliclyEmpty, true);
  assert.match(projection.emptyState.learnerMessage, /not published yet/i);
});

test("a candidate concept is withheld even with strong evidence", () => {
  const projection = projectPublic({
    graph: graph([concept({ reviewState: "candidate", unitCount: 400 })], []),
    insights: [],
  });
  assert.equal(projection.publishedConcepts.length, 0);
  assert.equal(projection.withheld.conceptCount, 1);
});

test("technical_review is withheld", () => {
  const projection = projectPublic({
    graph: graph(
      [
        concept({
          publicationState: "technical_review",
          publicEligible: true,
          reviewedBy: "agent",
          reviewedAt: "2026-11-01",
        }),
      ],
      [],
    ),
    insights: [],
  });
  assert.equal(projection.publishedConcepts.length, 0);
});

test("published without a named reviewer is withheld", () => {
  const projection = projectPublic({
    graph: graph(
      [concept({ publicationState: "published", publicEligible: true, reviewedBy: "  ", reviewedAt: "2026-11-01" })],
      [],
    ),
    insights: [],
  });
  assert.equal(projection.publishedConcepts.length, 0);
});

test("published without publicEligible is withheld", () => {
  const projection = projectPublic({
    graph: graph(
      [concept({ publicationState: "published", reviewedBy: "human", reviewedAt: "2026-11-01" })],
      [],
    ),
    insights: [],
  });
  assert.equal(projection.publishedConcepts.length, 0);
});

test("a fully approved concept is admitted with reviewer provenance", () => {
  const projection = projectPublic({
    graph: graph(
      [
        concept({
          publicationState: "published",
          publicEligible: true,
          reviewedBy: "named human reviewer",
          reviewedAt: "2026-11-01",
        }),
      ],
      [],
    ),
    insights: [],
  });
  assert.equal(projection.publishedConcepts.length, 1);
  assert.equal(projection.publishedConcepts[0].reviewedBy, "named human reviewer");
  assert.equal(projection.emptyState.isPubliclyEmpty, false);
});

test("an assertion with an unpublished endpoint is dropped and counted", () => {
  const projection = projectPublic({
    graph: graph(
      [
        concept({
          id: "concept:test:a",
          publicationState: "published",
          publicEligible: true,
          reviewedBy: "human",
          reviewedAt: "2026-11-01",
        }),
        concept({ id: "concept:test:b" }),
      ],
      [
        assertion({
          publicationState: "published",
          publicEligible: true,
          reviewedBy: "human",
          reviewedAt: "2026-11-01",
        }),
      ],
    ),
    insights: [],
  });
  assert.equal(projection.publishedAssertions.length, 0);
  assert.equal(projection.withheld.assertionsDroppedForMissingEndpoint, 1);
});

test("a fully approved assertion between approved concepts is admitted", () => {
  const approved = {
    publicationState: "published",
    publicEligible: true,
    reviewedBy: "human",
    reviewedAt: "2026-11-01",
  };
  const projection = projectPublic({
    graph: graph(
      [concept({ id: "concept:test:a", ...approved }), concept({ id: "concept:test:b", ...approved })],
      [assertion(approved)],
    ),
    insights: [],
  });
  assert.equal(projection.publishedAssertions.length, 1);
});

test("a technical_review edition is withheld from the public projection", () => {
  const projection = projectPublic({ graph: graph([], []), insights: [insight()] });
  assert.equal(projection.publishedInsights.length, 0);
  assert.equal(projection.withheld.insightCount, 1);
});

test("a published edition with reviewer provenance is admitted", () => {
  const projection = projectPublic({
    graph: graph([], []),
    insights: [
      insight({
        reviewStatus: "published",
        publicationState: "published",
        publicEligible: true,
        reviewedBy: "human",
        reviewedAt: "2026-11-01",
      }),
    ],
  });
  assert.equal(projection.publishedInsights.length, 1);
});

test("the serialized public payload contains no candidate fields", () => {
  const projection = projectPublic({ graph: graph([concept()], [assertion()]), insights: [insight()] });
  const serialized = serializePublicProjection(projection);
  assert.match(serialized, /window\.ATLAS_PUBLIC/);
  assert.doesNotMatch(serialized, /"reviewState":\s*"candidate"/);
  assert.doesNotMatch(serialized, /"evidence":/);
  assert.doesNotMatch(serialized, /"conceptCandidates"/);
  assert.doesNotMatch(serialized, /"ledgerFingerprint"/);
});
