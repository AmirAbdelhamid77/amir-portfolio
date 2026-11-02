// Dependency-correct prerequisite route planning for the Knowledge Stage.
//
// Stored scientific direction is A --requires_understanding_of--> B, meaning
// "A requires B". The traversal graph reverses that to B -> A so a stable
// topological order is prerequisite-before-dependent. This conversion is
// explicit and is the only place the direction is reversed.
//
// No shortest-path heuristic is used for order. Hop count is diagnostic only
// and is never reported as learning quality.

export const ROUTE_SCHEMA_VERSION = "intelligent-atlas-goal-route/2.0";
export const PREREQUISITE_RELATION = "requires_understanding_of";
export const ROUTE_BASES = new Set(["published-semantic", "editorial-sequence", "candidate-review"]);
export const EXECUTABLE_CONDITION_OPS = new Set([
  "equals",
  "not-equals",
  "includes-any",
  "includes-all",
  "at-least",
]);

function stableSortIds(ids) {
  return [...ids].sort((a, b) => a.localeCompare(b));
}

function uniqueEdges(assertions) {
  const seen = new Set();
  const out = [];
  for (const assertion of assertions) {
    if (assertion.relationType !== PREREQUISITE_RELATION) continue;
    if (!assertion.from || !assertion.to || assertion.from === assertion.to) continue;
    const key = `${assertion.from}\u0000${assertion.to}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(assertion);
  }
  return out;
}

function conditionRecord(assertion) {
  const rule = assertion.conditionRule;
  if (!rule) {
    return {
      assertionId: assertion.id,
      from: assertion.from,
      to: assertion.to,
      text: assertion.conditions || "",
      state: assertion.conditions ? "explanatory" : "none",
      executable: false,
    };
  }
  if (!EXECUTABLE_CONDITION_OPS.has(rule.op)) {
    return {
      assertionId: assertion.id,
      from: assertion.from,
      to: assertion.to,
      text: assertion.conditions || rule.op,
      state: "unsupported",
      executable: false,
      unsupportedOp: rule.op,
    };
  }
  return {
    assertionId: assertion.id,
    from: assertion.from,
    to: assertion.to,
    text: assertion.conditions || "",
    state: "executable",
    executable: true,
    rule,
  };
}

function detectCycle(nodes, adjacency) {
  const color = new Map([...nodes].map((id) => [id, 0]));
  const stack = [];
  const visit = (id) => {
    color.set(id, 1);
    stack.push(id);
    for (const next of stableSortIds(adjacency.get(id) ?? [])) {
      if (!nodes.has(next)) continue;
      if (color.get(next) === 1) {
        const start = stack.indexOf(next);
        return [...stack.slice(start), next];
      }
      if (color.get(next) === 0) {
        const found = visit(next);
        if (found) return found;
      }
    }
    stack.pop();
    color.set(id, 2);
    return null;
  };
  for (const id of stableSortIds(nodes)) {
    if (color.get(id) === 0) {
      const found = visit(id);
      if (found) return found;
    }
  }
  return null;
}

function topoOrder(nodes, orderEdges) {
  const indegree = new Map([...nodes].map((id) => [id, 0]));
  const outgoing = new Map([...nodes].map((id) => [id, new Set()]));
  for (const { prerequisite, dependent } of orderEdges) {
    if (!nodes.has(prerequisite) || !nodes.has(dependent)) continue;
    if (outgoing.get(prerequisite).has(dependent)) continue;
    outgoing.get(prerequisite).add(dependent);
    indegree.set(dependent, indegree.get(dependent) + 1);
  }
  const ready = stableSortIds([...nodes].filter((id) => indegree.get(id) === 0));
  const order = [];
  while (ready.length) {
    const id = ready.shift();
    order.push(id);
    for (const next of stableSortIds(outgoing.get(id))) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) {
        ready.push(next);
        ready.sort((a, b) => a.localeCompare(b));
      }
    }
  }
  return { order, complete: order.length === nodes.size };
}

function resourceFor(conceptId, resources) {
  const list = (resources?.get?.(conceptId) ?? resources?.[conceptId] ?? []).filter(
    (item) => typeof item.href === "string" && item.href.startsWith("/"),
  );
  const roleRank = { explains: 0, demonstrates: 1, applies: 2, practices: 3, references: 4 };
  const sorted = [...list].sort(
    (a, b) => (roleRank[a.role] ?? 9) - (roleRank[b.role] ?? 9) || String(a.unitId).localeCompare(String(b.unitId)),
  );
  const best = sorted[0];
  if (!best) return null;
  return {
    unitId: best.unitId,
    href: best.href,
    role: best.role,
    locator: best.locator,
    sourcePath: best.sourcePath,
    language: best.language,
    reviewState: best.reviewState ?? "candidate",
  };
}

function conceptLabel(conceptId, concepts) {
  const concept = concepts?.get?.(conceptId) ?? concepts?.[conceptId];
  return concept?.label ?? concept?.prefLabel ?? conceptId;
}

function conceptDomain(conceptId, concepts) {
  const concept = concepts?.get?.(conceptId) ?? concepts?.[conceptId];
  return concept?.domain ?? "unknown";
}

/**
 * Plan one goal.
 * @param {object} goal {goalId|id, title, audience, basis, limitations, targetConcepts}
 * @param {object} context {assertions, concepts, resources, graphBuildId, basis, targetMode}
 */
export function planGoal(goal, context = {}) {
  const goalId = goal.goalId ?? goal.id;
  const assertions = Array.isArray(context.assertions) ? context.assertions : [];
  const concepts = context.concepts;
  const resources = context.resources;
  const basis = ROUTE_BASES.has(context.basis) ? context.basis : "candidate-review";
  const targetMode = context.targetMode === "any" ? "any" : "all";
  const targets = [...new Set((goal.targetConcepts ?? []).filter(Boolean))];
  const base = {
    schemaVersion: ROUTE_SCHEMA_VERSION,
    graphBuildId: context.graphBuildId ?? null,
    goalId,
    title: goal.title ?? goalId,
    audience: goal.audience ?? "",
    basis: goal.basis ?? "",
    limitations: goal.limitations ?? "",
    basisKind: basis,
    orderingPolicy:
      "Prerequisite-before-dependent topological order over requires_understanding_of assertions; stable concept-ID tie-break; hop count is not a learning-quality score.",
  };

  if (!targets.length) {
    return {
      ...base,
      status: "unsupported",
      supported: false,
      reasonCode: "goal-without-targets",
      explanation: "This goal has no declared target concept, so no prerequisite route can be resolved.",
      steps: [],
      coverage: emptyCoverage(0),
      limitationsApplied: ["No target concept is declared."],
      cycleDetected: false,
    };
  }

  if (targetMode === "any") {
    const alternatives = targets.map((target) =>
      planGoal({ ...goal, targetConcepts: [target] }, { ...context, targetMode: "all" }),
    );
    const ready = alternatives.filter((item) => item.status === "complete");
    return {
      ...base,
      status: ready.length ? "complete" : alternatives.some((item) => item.status === "incomplete") ? "incomplete" : "unsupported",
      supported: ready.length > 0,
      reasonCode: "target-mode-any",
      explanation:
        "The goal declares alternative targets. Each alternative is planned independently; this is not an inferred OR from multiple incoming edges.",
      alternatives,
      steps: ready[0]?.steps ?? alternatives[0]?.steps ?? [],
      coverage: ready[0]?.coverage ?? alternatives[0]?.coverage ?? emptyCoverage(targets.length),
      limitationsApplied: ["Alternative targets are explicit goal data, not inferred from graph shape."],
      cycleDetected: alternatives.some((item) => item.cycleDetected),
    };
  }

  const missingTargets = targets.filter((id) => !(concepts?.has?.(id) ?? concepts?.[id]));
  const prerequisites = uniqueEdges(assertions);
  const prereqOf = new Map(); // dependent -> Set(prerequisites)
  const dependentsOf = new Map(); // prerequisite -> Set(dependents)
  for (const assertion of prerequisites) {
    if (!prereqOf.has(assertion.from)) prereqOf.set(assertion.from, new Set());
    prereqOf.get(assertion.from).add(assertion.to);
    if (!dependentsOf.has(assertion.to)) dependentsOf.set(assertion.to, new Set());
    dependentsOf.get(assertion.to).add(assertion.from);
  }

  // Closure: every prerequisite reachable from every target.
  const closure = new Set();
  const queue = [...targets];
  while (queue.length) {
    const id = queue.shift();
    if (closure.has(id)) continue;
    closure.add(id);
    for (const prerequisite of stableSortIds(prereqOf.get(id) ?? [])) {
      if (!closure.has(prerequisite)) queue.push(prerequisite);
    }
  }

  const missingPrerequisites = [...closure].filter((id) => !(concepts?.has?.(id) ?? concepts?.[id]));
  const nodes = new Set([...closure].filter((id) => concepts?.has?.(id) ?? concepts?.[id]));

  const orderEdges = [];
  const usedAssertions = [];
  for (const assertion of prerequisites) {
    if (!nodes.has(assertion.from) || !nodes.has(assertion.to)) continue;
    orderEdges.push({ prerequisite: assertion.to, dependent: assertion.from, assertionId: assertion.id });
    usedAssertions.push(assertion);
  }

  const cycle = detectCycle(nodes, prereqOf);
  const { order, complete: topological } = topoOrder(nodes, orderEdges);
  const conditionRecords = usedAssertions.map(conditionRecord);
  const unsupportedConditions = conditionRecords.filter((item) => item.state === "unsupported");
  const missingResources = order.filter((id) => !resourceFor(id, resources));
  const unknownTargets = missingTargets.length > 0;

  // Longest prerequisite depth inside the closure. Diagnostic only.
  const depth = new Map([...nodes].map((id) => [id, 0]));
  for (const id of order) {
    for (const dependent of stableSortIds(dependentsOf.get(id) ?? [])) {
      if (!nodes.has(dependent)) continue;
      depth.set(dependent, Math.max(depth.get(dependent) ?? 0, (depth.get(id) ?? 0) + 1));
    }
  }

  const startingPoint = new Set(context.startingPoint ?? []);
  const steps = order.map((conceptId, index) => {
    const resource = resourceFor(conceptId, resources);
    const isTarget = targets.includes(conceptId);
    const dependents = stableSortIds(dependentsOf.get(conceptId) ?? []).filter((id) => nodes.has(id));
    const reason = isTarget
      ? {
          code: "goal-target",
          text: `Named target of the selected goal: ${base.title}.`,
        }
      : dependents.length
        ? {
            code: `prerequisite-of:${dependents[0]}`,
            text:
              dependents.length === 1
                ? `Required before ${conceptLabel(dependents[0], concepts)} through a requires_understanding_of assertion.`
                : `Required before ${conceptLabel(dependents[0], concepts)} and ${dependents.length - 1} other step${dependents.length > 2 ? "s" : ""} through requires_understanding_of assertions.`,
          }
        : { code: "supporting-step", text: "Included by the declared goal closure." };
    const assertionsInto = usedAssertions.filter((assertion) => assertion.to === conceptId);
    return {
      step: index + 1,
      conceptId,
      conceptLabel: conceptLabel(conceptId, concepts),
      domain: conceptDomain(conceptId, concepts),
      isTarget,
      depth: depth.get(conceptId) ?? 0,
      reason,
      resource,
      gap: resource
        ? null
        : "No mapped local resource for this concept; the step is a concept gap, not a reading link.",
      conditions: assertionsInto.map((assertion) => conditionRecord(assertion)),
      selfReported: startingPoint.has(conceptId),
    };
  });

  const limitationsApplied = [];
  if (cycle) limitationsApplied.push("A prerequisite cycle intersects this goal; the route is not presented as a complete order.");
  if (missingPrerequisites.length) limitationsApplied.push("At least one prerequisite concept is missing from the eligible concept set.");
  if (missingResources.length) limitationsApplied.push("Some prerequisite concepts have no mapped local resource; the route has reading gaps.");
  if (unknownTargets) limitationsApplied.push("At least one goal target is missing from the eligible concept set.");
  if (unsupportedConditions.length) limitationsApplied.push("At least one prerequisite condition uses an unsupported executable rule.");
  if (startingPoint.size) limitationsApplied.push("Self-reported starting knowledge is labelled and does not update mastery or assessment records.");
  limitationsApplied.push("Prerequisite conditions are explanatory unless a versioned executable rule is present.");

  let status = "complete";
  let reasonCode = "route-complete";
  let explanation = "All declared targets and their prerequisites resolve in a stable prerequisite-before-dependent order.";
  if (unknownTargets || unsupportedConditions.length) {
    status = "unsupported";
    reasonCode = unknownTargets ? "missing-goal-target" : "unsupported-condition";
    explanation = unknownTargets
      ? "A declared goal target is not present in the eligible concept set."
      : "A prerequisite condition requires an executable rule that this resolver does not support.";
  } else if (cycle || !topological || missingPrerequisites.length) {
    status = "incomplete";
    reasonCode = cycle ? "prerequisite-cycle" : missingPrerequisites.length ? "missing-prerequisite" : "topology-incomplete";
    explanation = cycle
      ? "A prerequisite cycle prevents a complete order. The cycle is reported instead of being silently broken."
      : "The prerequisite closure is incomplete; the remaining steps are shown with their gaps.";
  } else if (missingResources.length) {
    status = "incomplete";
    reasonCode = "missing-resources";
    explanation = "The order is valid, but one or more steps have no mapped local resource.";
  }

  return {
    ...base,
    status,
    supported: status === "complete",
    reasonCode,
    explanation,
    steps,
    targetConcepts: targets,
    coverage: {
      stepCount: steps.length,
      targetCount: targets.length,
      targetsWithResource: targets.filter((id) => resourceFor(id, resources)).length,
      gapConceptIds: missingResources,
      targetConceptIdsWithoutResource: targets.filter((id) => !resourceFor(id, resources)),
      prerequisiteCount: Math.max(0, steps.length - targets.length),
      missingPrerequisiteIds: missingPrerequisites,
    },
    limitationsApplied,
    conditions: conditionRecords,
    cycleDetected: Boolean(cycle),
    cycle,
    diagnostics: {
      closureSize: closure.size,
      eligibleNodeCount: nodes.size,
      assertionCount: usedAssertions.length,
      orderEdges: orderEdges.length,
      topological,
      targetMode,
    },
  };
}

function emptyCoverage(targetCount) {
  return {
    stepCount: 0,
    targetCount,
    targetsWithResource: 0,
    gapConceptIds: [],
    targetConceptIdsWithoutResource: [],
    prerequisiteCount: 0,
    missingPrerequisiteIds: [],
  };
}

/** Deterministic A/B/C regression used by tests and the delivery evidence. */
export function regressionFixture() {
  const concepts = new Map([
    ["A", { id: "A", label: "A", domain: "test" }],
    ["B", { id: "B", label: "B", domain: "test" }],
    ["C", { id: "C", label: "C", domain: "test" }],
  ]);
  const resources = new Map([
    ["A", [{ unitId: "u-a", href: "/a", role: "explains" }]],
    ["B", [{ unitId: "u-b", href: "/b", role: "explains" }]],
    ["C", [{ unitId: "u-c", href: "/c", role: "explains" }]],
  ]);
  const assertions = [
    { id: "a-requires-b", from: "A", to: "B", relationType: PREREQUISITE_RELATION, conditions: "" },
    { id: "a-requires-c", from: "A", to: "C", relationType: PREREQUISITE_RELATION, conditions: "" },
    { id: "b-requires-c", from: "B", to: "C", relationType: PREREQUISITE_RELATION, conditions: "" },
  ];
  return planGoal(
    { goalId: "goal:test:abc", title: "ABC regression", targetConcepts: ["A"] },
    { assertions, concepts, resources, basis: "candidate-review", graphBuildId: "fixture" },
  );
}
