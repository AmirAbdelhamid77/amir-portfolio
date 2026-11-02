// D09-D12: dependency-correct route planning regressions.
import test from "node:test";
import assert from "node:assert/strict";
import { planGoal, regressionFixture, PREREQUISITE_RELATION } from "../lib/route-planner.mjs";

const concept = (id, domain = "test") => ({ id, label: id, domain });
const resource = (id) => ({ unitId: `u-${id}`, href: `/${id}`, role: "explains" });
const requires = (id, from, to, extra = {}) => ({
  id,
  from,
  to,
  relationType: PREREQUISITE_RELATION,
  conditions: "",
  ...extra,
});

function baseContext(ids, assertions, extra = {}) {
  const concepts = new Map(ids.map((id) => [id, concept(id)]));
  const resources = new Map(ids.map((id) => [id, [resource(id)]]));
  return { assertions, concepts, resources, basis: "candidate-review", graphBuildId: "test-build", ...extra };
}

test("D09: A requires B, A requires C, B requires C orders C, B, A", () => {
  const route = regressionFixture();
  assert.equal(route.status, "complete");
  assert.deepEqual(route.steps.map((step) => step.conceptId), ["C", "B", "A"]);
  assert.deepEqual(route.steps.map((step) => step.depth), [0, 1, 2]);
});

test("D09: stable topology survives ID permutations that would fool depth sorting", () => {
  const variants = [
    ["A", "B", "C"],
    ["z-dependent", "m-middle", "a-prerequisite"],
  ];
  for (const [dependent, middle, prerequisite] of variants) {
    const context = baseContext(
      [dependent, middle, prerequisite],
      [
        requires("r1", dependent, middle),
        requires("r2", dependent, prerequisite),
        requires("r3", middle, prerequisite),
      ],
    );
    const route = planGoal(
      { goalId: "g", title: "g", targetConcepts: [dependent] },
      context,
    );
    assert.deepEqual(route.steps.map((step) => step.conceptId), [prerequisite, middle, dependent]);
  }
});

test("D10: diamond dependencies are deduplicated and ordered once", () => {
  const route = planGoal(
    { goalId: "g", title: "g", targetConcepts: ["D"] },
    baseContext(
      ["A", "B", "C", "D"],
      [
        requires("r1", "D", "B"),
        requires("r2", "D", "C"),
        requires("r3", "B", "A"),
        requires("r4", "C", "A"),
      ],
    ),
  );
  assert.equal(route.status, "complete");
  assert.deepEqual(route.steps.map((step) => step.conceptId), ["A", "B", "C", "D"]);
  assert.equal(route.steps.filter((step) => step.conceptId === "A").length, 1);
});

test("D10: multiple disconnected targets share one stable route", () => {
  const route = planGoal(
    { goalId: "g", title: "g", targetConcepts: ["X", "Y"] },
    baseContext(
      ["X", "P", "Y", "Q"],
      [requires("r1", "X", "P"), requires("r2", "Y", "Q")],
    ),
  );
  assert.equal(route.status, "complete");
  assert.deepEqual(route.steps.map((step) => step.conceptId), ["P", "Q", "X", "Y"]);
  assert.equal(route.coverage.targetCount, 2);
});

test("D10: prerequisite cycle is incomplete and reported, never silently broken", () => {
  const route = planGoal(
    { goalId: "g", title: "g", targetConcepts: ["A"] },
    baseContext(["A", "B", "C"], [
      requires("r1", "A", "B"),
      requires("r2", "B", "C"),
      requires("r3", "C", "A"),
    ]),
  );
  assert.equal(route.status, "incomplete");
  assert.equal(route.reasonCode, "prerequisite-cycle");
  assert.equal(route.cycleDetected, true);
  assert.ok(route.cycle.length >= 2);
  assert.equal(route.steps.length, 0);
});

test("D10: missing prerequisite yields incomplete, not a confident route", () => {
  const route = planGoal(
    { goalId: "g", title: "g", targetConcepts: ["A"] },
    baseContext(["A"], [requires("r1", "A", "MISSING")]),
  );
  assert.equal(route.status, "incomplete");
  assert.equal(route.reasonCode, "missing-prerequisite");
  assert.deepEqual(route.coverage.missingPrerequisiteIds, ["MISSING"]);
});

test("D10: missing goal target yields unsupported", () => {
  const route = planGoal(
    { goalId: "g", title: "g", targetConcepts: ["NOPE"] },
    baseContext(["A"], []),
  );
  assert.equal(route.status, "unsupported");
  assert.equal(route.reasonCode, "missing-goal-target");
});

test("D10: missing resource makes the order valid but the route incomplete", () => {
  const context = baseContext(["A", "B"], [requires("r1", "A", "B")]);
  context.resources.delete("B");
  const route = planGoal({ goalId: "g", title: "g", targetConcepts: ["A"] }, context);
  assert.equal(route.status, "incomplete");
  assert.equal(route.reasonCode, "missing-resources");
  assert.deepEqual(route.coverage.gapConceptIds, ["B"]);
});

test("D11: comparison and related-in-decision edges never become prerequisite order", () => {
  const route = planGoal(
    { goalId: "g", title: "g", targetConcepts: ["A"] },
    baseContext(["A", "B", "C"], [
      { id: "c1", from: "A", to: "B", relationType: "contrasts_with", conditions: "" },
      { id: "c2", from: "B", to: "C", relationType: "related_in_decision", conditions: "" },
      { id: "c3", from: "A", to: "C", relationType: "complements", conditions: "" },
    ]),
  );
  assert.equal(route.status, "complete");
  assert.deepEqual(route.steps.map((step) => step.conceptId), ["A"]);
});

test("D12: free-text conditions are explanatory and never executed", () => {
  const route = planGoal(
    { goalId: "g", title: "g", targetConcepts: ["A"] },
    baseContext(["A", "B"], [
      requires("r1", "A", "B", { conditions: "When the source supports direct query." }),
    ]),
  );
  assert.equal(route.status, "complete");
  assert.equal(route.conditions[0].state, "explanatory");
  assert.equal(route.conditions[0].executable, false);
  assert.match(route.limitationsApplied.join(" "), /explanatory/);
});

test("D12: unsupported executable condition returns unsupported", () => {
  const route = planGoal(
    { goalId: "g", title: "g", targetConcepts: ["A"] },
    baseContext(["A", "B"], [
      requires("r1", "A", "B", {
        conditions: "Only when a free-text script returns true.",
        conditionRule: { op: "eval-script", expression: "return true" },
      }),
    ]),
  );
  assert.equal(route.status, "unsupported");
  assert.equal(route.reasonCode, "unsupported-condition");
});

test("D12: self-reported starting point is labelled, reversible and not mastery", () => {
  const route = planGoal(
    { goalId: "g", title: "g", targetConcepts: ["A"] },
    baseContext(["A", "B"], [requires("r1", "A", "B")], { startingPoint: ["B"] }),
  );
  assert.equal(route.status, "complete");
  const b = route.steps.find((step) => step.conceptId === "B");
  assert.equal(b.selfReported, true);
  assert.match(route.limitationsApplied.join(" "), /Self-reported/);
  assert.ok(!("mastery" in route));
});

test("D12: explicit alternative goal targets are planned separately, not inferred from edges", () => {
  const route = planGoal(
    { goalId: "g", title: "g", targetConcepts: ["A", "B"] },
    baseContext(["A", "B", "C"], [requires("r1", "A", "C")], { targetMode: "any" }),
  );
  assert.equal(route.reasonCode, "target-mode-any");
  assert.equal(route.alternatives.length, 2);
  assert.deepEqual(route.alternatives[0].steps.map((step) => step.conceptId), ["C", "A"]);
  assert.deepEqual(route.alternatives[1].steps.map((step) => step.conceptId), ["B"]);
});

test("duplicate prerequisite assertions do not duplicate steps", () => {
  const route = planGoal(
    { goalId: "g", title: "g", targetConcepts: ["A"] },
    baseContext(["A", "B"], [requires("r1", "A", "B"), requires("r2", "A", "B")]),
  );
  assert.equal(route.steps.length, 2);
  assert.equal(route.diagnostics.assertionCount, 1);
});

test("route carries basis separately from status", () => {
  const route = planGoal(
    { goalId: "g", title: "g", targetConcepts: ["A"] },
    baseContext(["A"], [], { basis: "candidate-review" }),
  );
  assert.equal(route.status, "complete");
  assert.equal(route.basisKind, "candidate-review");
  assert.equal(route.supported, true);
});
