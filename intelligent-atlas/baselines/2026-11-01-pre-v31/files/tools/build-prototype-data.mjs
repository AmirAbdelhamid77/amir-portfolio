// Build the bounded prototype payload from the real analysis outputs.
//
// This does not re-analyze anything. It selects three evidence-backed
// constellations, keeps every assertion whose two endpoints are present, and
// embeds the result as a plain script so the prototype works from file://
// without fetch, a server or a bundler.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AMBIGUITIES, CONTRADICTIONS } from "./semantic-model.mjs";

const ROOT = process.cwd();
const ANALYSIS = join(ROOT, "intelligent-atlas", "analysis");
const OUT = join(ROOT, "intelligent-atlas", "prototype");

const readJson = (name) => JSON.parse(readFileSync(join(ANALYSIS, name), "utf8"));
const graph = readJson("graph-build.json");
const summary = readJson("analysis-summary.json");
const publicProjection = readJson("public-projection.json");
const mappings = readJson("mappings.json");
const insights = JSON.parse(readFileSync(join(ROOT, "content", "knowledge", "insights.json"), "utf8"));

// Three real constellations. A is the Daily Insight's OneLake/shortcut
// territory; B is the chart-integrity goal; C is the inference goal. Every
// extra node below is a first-degree neighbour that already has a typed edge
// in graph-build.json, so the prototype never invents a connection.
const CONSTELLATIONS = {
  A: {
    id: "A",
    label: "Reference without a copy",
    short: "OneLake",
    goalId: "goal:ia:reference-without-copy",
    seedConceptId: "concept:fabric:shortcut",
    conceptIds: [
      "concept:fabric:shortcut",
      "concept:fabric:onelake",
      "concept:fabric:copy-job",
      "concept:fabric:database-mirroring",
      "concept:fabric:delta",
      "concept:fabric:lakehouse",
      "concept:fabric:sql-endpoint",
      "concept:fabric:permissions",
      "concept:fabric:security-model",
      "concept:fabric:onelake-security-role",
      "concept:fabric:pipeline",
      "concept:fabric:dataflow-gen2",
      "concept:fabric:direct-lake",
      "concept:fabric:t-sql",
      "concept:fabric:rls",
      "concept:fabric:partitioning",
      "concept:fabric:clone",
      "concept:fabric:delta-history",
      "concept:fabric:ols",
      "concept:fabric:cls",
      "concept:fabric:sensitivity-label",
      "concept:fabric:control-flow",
      "concept:fabric:materialized-lake-view",
      "concept:fabric:metadata-sync",
    ],
  },
  B: {
    id: "B",
    label: "A chart that survives review",
    short: "Visualization",
    goalId: "goal:ia:chart-that-survives-review",
    seedConceptId: "concept:viz:chart-selection",
    conceptIds: [
      "concept:viz:chart-selection",
      "concept:viz:analytical-task",
      "concept:viz:visual-encoding",
      "concept:viz:variable-type",
      "concept:viz:accessibility-contrast",
      "concept:viz:visual-integrity",
      "concept:viz:axis-baseline",
      "concept:viz:color-palette",
      "concept:viz:dashboard-design",
      "concept:viz:scale",
      "concept:viz:part-to-whole",
      "concept:viz:distribution-plot",
      "concept:viz:time-series-plot",
      "concept:viz:annotation-context",
      "concept:viz:uncertainty-display",
      "concept:analysis:decision-frame",
      "concept:sql:grain",
      "concept:stats:distribution",
    ],
  },
  C: {
    id: "C",
    label: "Is the difference real?",
    short: "Inference",
    goalId: "goal:ia:is-the-difference-real",
    seedConceptId: "concept:stats:hypothesis-test",
    conceptIds: [
      "concept:stats:population-sample",
      "concept:stats:descriptive-inferential",
      "concept:stats:sampling-method",
      "concept:stats:sampling-bias",
      "concept:stats:sampling-distribution",
      "concept:stats:standard-error",
      "concept:stats:clt",
      "concept:stats:confidence-interval",
      "concept:stats:hypothesis-test",
      "concept:stats:p-value",
      "concept:stats:significance-level",
      "concept:stats:error-types",
      "concept:stats:practical-significance",
      "concept:stats:correlation",
      "concept:stats:causation",
      "concept:stats:confounding",
      "concept:stats:experiment-design",
    ],
  },
};

const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
const selectedIds = new Set(Object.values(CONSTELLATIONS).flatMap((c) => c.conceptIds));
const selectedNodes = [...selectedIds].filter((id) => nodeById.has(id)).map((id) => nodeById.get(id));
const selectedEdges = graph.edges.filter((edge) => selectedIds.has(edge.from) && selectedIds.has(edge.to));

const roleRank = { explains: 0, demonstrates: 1, applies: 2, practices: 3, references: 4 };
const resourcesByConcept = new Map();
for (const mapping of mappings.mappings) {
  if (!selectedIds.has(mapping.conceptId)) continue;
  if (!mapping.canonicalHref?.startsWith("/")) continue;
  const list = resourcesByConcept.get(mapping.conceptId) ?? [];
  list.push({
    unitId: mapping.unitId,
    href: mapping.canonicalHref,
    role: mapping.role,
    locator: mapping.locator,
    sourcePath: mapping.sourcePath,
    language: mapping.language,
    reviewState: mapping.reviewState,
  });
  resourcesByConcept.set(mapping.conceptId, list);
}
for (const [conceptId, list] of resourcesByConcept) {
  const deduped = [...new Map(list.map((item) => [item.href, item])).values()];
  deduped.sort((a, b) => (roleRank[a.role] ?? 9) - (roleRank[b.role] ?? 9) || a.unitId.localeCompare(b.unitId));
  resourcesByConcept.set(conceptId, deduped.slice(0, 3));
}

const constellationOf = new Map();
for (const constellation of Object.values(CONSTELLATIONS)) {
  for (const id of constellation.conceptIds) constellationOf.set(id, constellation.id);
}

const concepts = selectedNodes.map((node) => ({
  id: node.id,
  label: node.label,
  domain: node.domain,
  domainLabel: node.domainLabel,
  kind: node.kind,
  definition: node.definition,
  scope: node.scope,
  discriminatingContext: node.discriminatingContext,
  aliases: node.aliases,
  existingAtlasId: node.existingAtlasId,
  unitCount: node.unitCount,
  primaryUnitCount: node.primaryUnitCount,
  assertionCount: node.assertionCount,
  crossDomainAssertionCount: node.crossDomainAssertionCount,
  constellation: constellationOf.get(node.id) ?? null,
  resources: resourcesByConcept.get(node.id) ?? [],
  reviewState: "candidate",
}));

const edges = selectedEdges.map((edge) => ({
  id: edge.id,
  from: edge.from,
  to: edge.to,
  fromLabel: edge.fromLabel,
  toLabel: edge.toLabel,
  relationType: edge.relationType,
  direction: edge.direction,
  claim: edge.claim,
  conditions: edge.conditions,
  rationale: edge.rationale,
  supportKind: edge.supportKind,
  crossDomain: edge.crossDomain,
  reviewState: "candidate",
  evidence: edge.evidence.map((item) => ({
    unitId: item.unitId,
    sourcePath: item.sourcePath,
    locator: item.locator,
    canonicalHref: item.canonicalHref,
    language: item.language,
    quote: item.quote,
    quoteFingerprint: item.quoteFingerprint,
  })),
}));

const goals = graph.goals.map((goal) => ({
  goalId: goal.goalId,
  title: goal.title,
  audience: goal.audience,
  basis: goal.basis,
  limitations: goal.limitations,
  supported: goal.supported,
  coverage: goal.coverage,
  limitationsApplied: goal.limitationsApplied,
  orderingPolicy: goal.orderingPolicy,
  steps: goal.steps.map((step) => ({
    step: step.step,
    conceptId: step.conceptId,
    conceptLabel: step.conceptLabel,
    domain: step.domain,
    isTarget: step.isTarget,
    depth: step.depth,
    reason: step.reason,
    resource: step.resource,
    gap: step.gap,
  })),
}));

const insightCards = insights.items.map((item) => ({
  id: item.id,
  date: item.date,
  topic: item.topic,
  title: item.title,
  cardTitle: item.cardTitle,
  scenario: item.scenario,
  prediction: item.prediction,
  takeaway: item.takeaway,
  caveat: item.caveat,
  conceptId: item.conceptId,
  lessonHref: item.lessonHref,
  practiceHref: item.practiceHref,
  sourceId: item.sourceId,
  sourceUrl: item.sourceUrl,
  sourceLocator: item.sourceLocator,
  checkedAt: item.checkedAt,
  reviewStatus: item.reviewStatus,
  reviewer: item.reviewer,
  questionIds: item.questionIds ?? [],
}));

const payload = {
  schemaVersion: "intelligent-atlas-prototype/1.0",
  generatedAt: summary.checkedAt,
  graphBuildId: graph.graphBuildId,
  registryVersion: graph.registryVersion,
  ledgerFingerprint: graph.ledgerFingerprint,
  notice: "Bounded editorial-review prototype payload. Candidate concepts, mappings and assertions only; nothing here is approved or published.",
  reviewState: "candidate",
  publicEligible: false,
  constellations: Object.values(CONSTELLATIONS).map(({ id, label, short, goalId, seedConceptId, conceptIds }) => ({
    id,
    label,
    short,
    goalId,
    seedConceptId,
    conceptCount: conceptIds.filter((conceptId) => nodeById.has(conceptId)).length,
  })),
  insights: insightCards,
  concepts,
  edges,
  goals,
  reviewRegister: {
    notice:
      "Corpus-level review notes. These are not additional graph edges and they do not approve any candidate.",
    ambiguities: AMBIGUITIES,
    contradictions: CONTRADICTIONS,
  },
  coverage: {
    units: summary.counts.units,
    states: summary.counts.states,
    unmappedReasons: summary.counts.unmappedReasons,
    concepts: summary.counts.concepts,
    conceptsWithCorpusSupport: summary.counts.conceptsWithCorpusSupport,
    registryOnlyConcepts: summary.counts.registryOnlyConcepts,
    mappings: summary.counts.mappings,
    assertions: summary.counts.assertions,
    crossDomainAssertions: summary.counts.crossDomainAssertions,
    directSupport: summary.counts.directSupport,
    inferredSupport: summary.counts.inferredSupport,
    ambiguities: summary.counts.ambiguities,
    contradictions: summary.counts.contradictions,
    publishedConcepts: summary.counts.publishedConcepts,
    publishedAssertions: summary.counts.publishedAssertions,
    eligibleUnits:
      (summary.counts.states["analyzed-mapped"] ?? 0) + (summary.counts.states["analyzed-unmapped"] ?? 0),
    prototypeConcepts: concepts.length,
    prototypeEdges: edges.length,
    prototypeResources: concepts.reduce((sum, concept) => sum + concept.resources.length, 0),
    note: "The prototype renders a bounded subset. The analysis ledger covers every extracted unit; this payload is a rendering choice, not the analysis denominator.",
  },
  publicProjection,
  sourceFiles: [
    "intelligent-atlas/analysis/graph-build.json",
    "intelligent-atlas/analysis/analysis-summary.json",
    "intelligent-atlas/analysis/public-projection.json",
    "intelligent-atlas/analysis/mappings.json",
    "intelligent-atlas/tools/semantic-model.mjs",
    "content/knowledge/insights.json",
  ],
};

const json = JSON.stringify(payload, null, 2);
const fingerprint = createHash("sha256").update(json).digest("hex");

const script = `// Generated by intelligent-atlas/tools/build-prototype-data.mjs.
// Bounded editorial-review payload. Do not hand-edit.
window.ATLAS_DATA = ${json};
window.ATLAS_DATA_META = ${JSON.stringify(
  {
    payloadFingerprint: fingerprint,
    graphBuildId: payload.graphBuildId,
    generatedAt: payload.generatedAt,
    sourceFiles: payload.sourceFiles,
  },
  null,
  2,
)};
`;

const publicJson = JSON.stringify(
  {
    schemaVersion: "intelligent-atlas-public-prototype/1.0",
    generatedAt: summary.checkedAt,
    graphBuildId: graph.graphBuildId,
    notice:
      "Public projection only. Candidate concepts, mappings, assertions and evidence are not present in this payload.",
    publicProjection,
    coverage: {
      units: summary.counts.units,
      publishedConcepts: summary.counts.publishedConcepts,
      publishedAssertions: summary.counts.publishedAssertions,
      withheld: publicProjection.withheld,
      structural: publicProjection.structural,
      gates: publicProjection.gates,
    },
  },
  null,
  2,
);
const publicFingerprint = createHash("sha256").update(publicJson).digest("hex");

writeFileSync(join(OUT, "data.js"), script, "utf8");
writeFileSync(
  join(OUT, "public-data.js"),
  `// Generated by intelligent-atlas/tools/build-prototype-data.mjs.
// Public projection only. Do not hand-edit.
window.ATLAS_PUBLIC = ${publicJson};
`,
  "utf8",
);
writeFileSync(
  join(OUT, "data-provenance.json"),
  JSON.stringify(
    {
      schemaVersion: "intelligent-atlas-prototype-provenance/1.0",
      payloadFingerprint: fingerprint,
      publicPayloadFingerprint: publicFingerprint,
      graphBuildId: payload.graphBuildId,
      generatedAt: payload.generatedAt,
      sourceFiles: payload.sourceFiles,
      selection: Object.fromEntries(
        Object.entries(CONSTELLATIONS).map(([id, constellation]) => [
          id,
          {
            label: constellation.label,
            goalId: constellation.goalId,
            seedConceptId: constellation.seedConceptId,
            requestedConcepts: constellation.conceptIds.length,
            presentConcepts: constellation.conceptIds.filter((conceptId) => nodeById.has(conceptId)).length,
          },
        ]),
      ),
      counts: {
        concepts: concepts.length,
        edges: edges.length,
        resources: concepts.reduce((sum, concept) => sum + concept.resources.length, 0),
        insights: insightCards.length,
        goals: goals.length,
        ambiguities: AMBIGUITIES.length,
        contradictions: CONTRADICTIONS.length,
      },
      limits: [
        "The prototype renders a bounded subset; it is not the corpus analysis denominator.",
        "No candidate concept, mapping or assertion is approved or published.",
        "Media is not embedded; the prototype links to local routes only.",
        "The public projection is simulated locally and contains zero published concepts and assertions.",
        "The review register is corpus-level and pattern-based; it is not a set of approved semantic assertions.",
      ],
    },
    null,
    2,
  ),
  "utf8",
);

console.log(
  JSON.stringify(
    {
      out: "intelligent-atlas/prototype/data.js",
      fingerprint,
      publicFingerprint,
      concepts: concepts.length,
      edges: edges.length,
      resources: concepts.reduce((sum, concept) => sum + concept.resources.length, 0),
      insights: insightCards.length,
      goals: goals.length,
    },
    null,
    2,
  ),
);
