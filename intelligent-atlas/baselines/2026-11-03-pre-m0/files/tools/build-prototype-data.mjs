// Build the V3.1 review payload from the real analysis outputs.
//
// This does not re-analyze anything. It:
//   - carries all 132 candidate concepts and all 86 candidate assertions,
//   - resolves every deck through the tested v2 contract resolver,
//   - derives comparison boards only from contrast/trade-off edges,
//   - keeps the public projection fail-closed and physically separate.
//
// Decks are resolved at build time so the prototype renders exactly what the
// contract tests cover, instead of reimplementing resolution in the browser.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AMBIGUITIES, CONTRADICTIONS } from "./semantic-model.mjs";
import { resolveDeck, MAX_CARDS } from "../contracts/deck-resolver.mjs";
import { projectPublic, serializePublicProjection } from "./project-public.mjs";

const ROOT = process.cwd();
const ATLAS = join(ROOT, "intelligent-atlas");
const ANALYSIS = join(ATLAS, "analysis");
const PROTOTYPE = join(ATLAS, "prototype");
const PUBLIC = join(ATLAS, "public");

const readJson = (name) => JSON.parse(readFileSync(join(ANALYSIS, name), "utf8"));
const graph = readJson("graph-build.json");
const summary = readJson("analysis-summary.json");
const mappings = readJson("mappings.json");
const ledgerSummary = readJson("semantic-ledger-summary.json");
const reconciliation = readJson("source-reconciliation-v2.json");
const sampleSelection = readJson("quality-sample-selection.json");
const rawInsights = JSON.parse(readFileSync(join(ROOT, "content", "knowledge", "insights.json"), "utf8"));
const insights = Array.isArray(rawInsights) ? rawInsights : rawInsights.items ?? [];

const ledgerRows = readFileSync(join(ANALYSIS, "semantic-ledger-v2.jsonl"), "utf8")
  .trim()
  .split(/\r?\n/)
  .map((line) => JSON.parse(line));
const ledgerByUnit = new Map(ledgerRows.map((row) => [row.unitId, row]));

const GRAPH_BUILD_ID = graph.graphBuildId;
const SOURCE_INDEX_BUILD_ID = `ia-source-${createHash("sha256")
  .update(JSON.stringify(reconciliation))
  .digest("hex")
  .slice(0, 12)}`;
const TODAY = "2026-11-01";
const TIMELINE_START = "2026-10-18";
const TIMELINE_END = "2026-11-01";

const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
const roleRank = { explains: 0, demonstrates: 1, applies: 2, practices: 3, references: 4 };

// ------------------------------------------------------------------ resources
const resourcesByConcept = new Map();
for (const mapping of mappings.mappings) {
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
    title: ledgerByUnit.get(mapping.unitId)?.extraction?.title ?? mapping.unitId,
  });
  resourcesByConcept.set(mapping.conceptId, list);
}
for (const [conceptId, list] of resourcesByConcept) {
  const deduped = [...new Map(list.map((item) => [item.href, item])).values()];
  deduped.sort(
    (a, b) => (roleRank[a.role] ?? 9) - (roleRank[b.role] ?? 9) || a.unitId.localeCompare(b.unitId),
  );
  resourcesByConcept.set(conceptId, deduped);
}

// -------------------------------------------------------------- reading state
function readingForConcept(conceptId) {
  const resources = resourcesByConcept.get(conceptId) ?? [];
  for (const resource of resources) {
    const row = ledgerByUnit.get(resource.unitId);
    if (row?.semanticReading?.state === "read") {
      return {
        unitId: resource.unitId,
        reading: row.semanticReading.reading,
        parentContext: row.semanticReading.parentContext,
        evidenceQuote: row.semanticReading.evidenceQuote,
        essentialMeaning: row.semanticReading.essentialMeaning,
        decision: row.decision.state,
        code: row.decision.code,
        unresolved: row.decision.unresolved,
      };
    }
  }
  return null;
}

// -------------------------------------------------------------------- concepts
const prerequisitesOf = new Map();
const dependentsOf = new Map();
const contrastsOf = new Map();
for (const edge of graph.edges) {
  if (edge.relationType === "requires_understanding_of") {
    (prerequisitesOf.get(edge.from) ?? prerequisitesOf.set(edge.from, []).get(edge.from)).push(edge);
    (dependentsOf.get(edge.to) ?? dependentsOf.set(edge.to, []).get(edge.to)).push(edge);
  }
  if (["contrasts_with", "tradeoff_with", "complements"].includes(edge.relationType)) {
    (contrastsOf.get(edge.from) ?? contrastsOf.set(edge.from, []).get(edge.from)).push(edge);
    (contrastsOf.get(edge.to) ?? contrastsOf.set(edge.to, []).get(edge.to)).push(edge);
  }
}

const concepts = graph.nodes.map((node) => {
  const resources = (resourcesByConcept.get(node.id) ?? []).slice(0, 8);
  return {
    id: node.id,
    label: node.label,
    domain: node.domain,
    domainLabel: node.domainLabel,
    kind: node.kind,
    definition: node.definition,
    scope: node.scope,
    discriminatingContext: node.discriminatingContext,
    aliases: node.aliases,
    unitCount: node.unitCount,
    primaryUnitCount: node.primaryUnitCount,
    assertionCount: node.assertionCount,
    crossDomainAssertionCount: node.crossDomainAssertionCount,
    reviewState: "candidate",
    resources,
    prerequisites: (prerequisitesOf.get(node.id) ?? []).map((edge) => ({
      id: edge.to,
      label: edge.toLabel,
      edgeId: edge.id,
      claim: edge.claim,
      conditions: edge.conditions,
      crossDomain: edge.crossDomain,
    })),
    dependents: (dependentsOf.get(node.id) ?? []).map((edge) => ({
      id: edge.from,
      label: edge.fromLabel,
      edgeId: edge.id,
      claim: edge.claim,
      conditions: edge.conditions,
      crossDomain: edge.crossDomain,
    })),
    contrasts: (contrastsOf.get(node.id) ?? []).map((edge) => {
      const otherId = edge.from === node.id ? edge.to : edge.from;
      return {
        id: otherId,
        label: edge.from === node.id ? edge.toLabel : edge.fromLabel,
        edgeId: edge.id,
        relationType: edge.relationType,
        claim: edge.claim,
        crossDomain: edge.crossDomain,
      };
    }),
    goals: graph.goals.filter((goal) => goal.steps.some((step) => step.conceptId === node.id)).map((goal) => goal.goalId),
    reading: readingForConcept(node.id),
  };
});
const conceptById = new Map(concepts.map((concept) => [concept.id, concept]));

// ----------------------------------------------------------------------- edges
const edges = graph.edges.map((edge) => ({
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
    reading: ledgerByUnit.get(item.unitId)?.semanticReading?.state === "read"
      ? ledgerByUnit.get(item.unitId).semanticReading.reading
      : null,
  })),
}));

// ----------------------------------------------------------------- comparisons
const RELATION_LABEL = {
  contrasts_with: "Contrast",
  tradeoff_with: "Trade-off",
  complements: "Complement",
  requires_understanding_of: "Prerequisite",
  related_in_decision: "Related in a decision",
  enables: "Enables",
  part_of_mechanism: "Part of a mechanism",
};

const comparisons = edges
  .filter((edge) => ["contrasts_with", "tradeoff_with", "complements"].includes(edge.relationType))
  .map((edge) => {
    const left = conceptById.get(edge.from);
    const right = conceptById.get(edge.to);
    if (!left || !right) return null;
    const leftPrereqs = new Set(left.prerequisites.map((entry) => entry.id));
    const rightPrereqs = new Set(right.prerequisites.map((entry) => entry.id));
    const shared = [...leftPrereqs].filter((id) => rightPrereqs.has(id));
    const label = (id) => conceptById.get(id)?.label ?? id;
    return {
      id: edge.id,
      relationType: edge.relationType,
      relationLabel: RELATION_LABEL[edge.relationType] ?? edge.relationType,
      leftId: left.id,
      rightId: right.id,
      leftLabel: left.label,
      rightLabel: right.label,
      leftDomain: left.domainLabel,
      rightDomain: right.domainLabel,
      crossDomain: edge.crossDomain,
      claim: edge.claim,
      conditions: edge.conditions,
      rationale: edge.rationale,
      supportKind: edge.supportKind,
      reviewState: edge.reviewState,
      evidence: edge.evidence,
      sharedPrerequisites: shared.map(label),
      leftOnlyPrerequisites: [...leftPrereqs].filter((id) => !rightPrereqs.has(id)).map(label),
      rightOnlyPrerequisites: [...rightPrereqs].filter((id) => !leftPrereqs.has(id)).map(label),
      rows: [
        { label: "Definition", left: left.definition, right: right.definition },
        { label: "Scope", left: left.scope, right: right.scope },
        {
          label: "Discriminating context",
          left: left.discriminatingContext || "Not recorded for this concept.",
          right: right.discriminatingContext || "Not recorded for this concept.",
        },
      ],
    };
  })
  .filter(Boolean);

// ----------------------------------------------------------------------- goals
const goals = graph.goals.map((goal) => ({
  goalId: goal.goalId,
  title: goal.title,
  audience: goal.audience,
  basis: goal.basis,
  limitations: goal.limitations,
  status: goal.status,
  supported: goal.supported,
  reasonCode: goal.reasonCode,
  explanation: goal.explanation,
  basisKind: goal.basisKind,
  orderingPolicy: goal.orderingPolicy,
  coverage: goal.coverage,
  limitationsApplied: goal.limitationsApplied,
  conditions: goal.conditions,
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
    conditions: step.conditions,
    selfReported: false,
  })),
}));

// ----------------------------------------------------------------------- apply
const applyByConcept = {};
for (const concept of concepts) {
  const resources = resourcesByConcept.get(concept.id) ?? [];
  const destinations = resources
    .filter((resource) => ["applies", "practices"].includes(resource.role) || resource.href.startsWith("/lab/"))
    .slice(0, 6)
    .map((resource) => ({
      unitId: resource.unitId,
      href: resource.href,
      role: resource.role,
      title: resource.title,
      locator: resource.locator,
      language: resource.language,
      kind: resource.href.includes("?question=")
        ? "practice-question"
        : resource.href.startsWith("/lab/")
          ? "lab"
          : "exercise",
    }));
  applyByConcept[concept.id] = destinations;
}

// -------------------------------------------------------------------- timeline
const WEEKDAY = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" });
const WEEKDAY_SHORT = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });
const MONTH_SHORT = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" });

function* dates(start, end) {
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor <= last) {
    yield cursor.toISOString().slice(0, 10);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
}

const editions = insights.map((item) => ({
  id: item.id,
  date: item.date,
  topic: item.topic,
  title: item.title,
  cardTitle: item.cardTitle,
  takeaway: item.takeaway,
  caveat: item.caveat,
  conceptId: item.conceptId,
  reviewStatus: item.reviewStatus,
  publicationState: item.publicationState ?? "technical_review",
  publicEligible: item.publicEligible === true,
  questionIds: item.questionIds ?? [],
  deckKey: `daily:${item.date}`,
}));
const editionByDate = new Map(editions.map((edition) => [edition.date, edition]));

const days = [...dates(TIMELINE_START, TIMELINE_END)].map((date) => {
  const edition = editionByDate.get(date);
  const value = new Date(`${date}T00:00:00Z`);
  return {
    date,
    day: value.getUTCDate(),
    month: MONTH_SHORT.format(value),
    weekday: WEEKDAY.format(value),
    weekdayShort: WEEKDAY_SHORT.format(value),
    isToday: date === TODAY,
    hasEdition: Boolean(edition),
    editionId: edition?.id ?? null,
    cardCount: edition ? 1 : 0,
    title: edition?.title ?? null,
    takeaway: edition?.takeaway ?? null,
    reviewStatus: edition?.reviewStatus ?? null,
  };
});

// ----------------------------------------------------------------------- decks
const deckData = { insights, concepts, goals };
const deckOptions = {
  data: deckData,
  graphBuildId: GRAPH_BUILD_ID,
  sourceIndexBuildId: SOURCE_INDEX_BUILD_ID,
};

const decks = {};
function addDeck(key, request) {
  decks[key] = resolveDeck(
    {
      schemaVersion: "intelligent-atlas-deck-request/2.0",
      requestId: `proto-${key}`,
      graphBuildId: GRAPH_BUILD_ID,
      sourceIndexBuildId: SOURCE_INDEX_BUILD_ID,
      mode: "review",
      ...request,
    },
    deckOptions,
  );
}

for (const day of days) {
  addDeck(`daily:${day.date}`, { origin: { type: "daily-edition", date: day.date } });
}
for (const concept of concepts) {
  addDeck(`concept:${concept.id}`, { origin: { type: "concept", conceptId: concept.id } });
}
for (const goal of goals) {
  addDeck(`goal:${goal.goalId}`, { origin: { type: "goal", goalId: goal.goalId } });
}

// A deck that exceeds the operational cap is labelled rather than silently cut.
for (const [key, resolution] of Object.entries(decks)) {
  if (resolution.status === "ready" && resolution.deck.cardCount === MAX_CARDS) {
    resolution.limitations = [
      ...new Set([
        ...resolution.limitations,
        `Showing the first ${MAX_CARDS} cards of a larger mapped set. The full mapping remains in the analysis ledger.`,
      ]),
    ];
  }
}

// --------------------------------------------------------------- public output
const publicProjection = projectPublic(
  {
    graph,
    insights,
    ledgerSummary: {
      denominators: {
        ...ledgerSummary.denominators,
        discoverableRoutes: reconciliation.routes?.total ?? null,
        manifestSourceFiles: reconciliation.denominators?.manifestSourceFiles ?? null,
      },
    },
  },
  { generatedAt: TODAY },
);

// --------------------------------------------------------------------- payload
const payload = {
  schemaVersion: "intelligent-atlas-review/2.0",
  generatedAt: TODAY,
  prototypeClock: TODAY,
  graphBuildId: GRAPH_BUILD_ID,
  sourceIndexBuildId: SOURCE_INDEX_BUILD_ID,
  registryVersion: graph.registryVersion,
  ledgerFingerprint: graph.ledgerFingerprint,
  notice:
    "Review artifact. Candidate concepts, mappings and assertions only. Nothing here is approved or published.",
  reviewState: "candidate",
  publicEligible: false,
  domains: graph.domains,
  timeline: {
    start: TIMELINE_START,
    end: TIMELINE_END,
    today: TODAY,
    latestEditionDate: editions.map((edition) => edition.date).sort().at(-1) ?? null,
    days,
  },
  editions,
  concepts,
  edges,
  comparisons,
  goals,
  apply: applyByConcept,
  decks,
  reviewRegister: {
    notice:
      "Corpus-level review notes. These are not additional graph edges and they do not approve any candidate.",
    ambiguities: AMBIGUITIES,
    contradictions: CONTRADICTIONS,
  },
  coverage: {
    units: ledgerSummary.denominators.units,
    eligibleUnits: ledgerSummary.denominators.eligible,
    metadataOnlyUnits: ledgerSummary.denominators.metadataOnly,
    nonLearningUnits: ledgerSummary.denominators.nonLearning,
    uniqueCanonicalResources: ledgerSummary.denominators.uniqueCanonicalResources,
    candidateMatched: ledgerSummary.candidateMatch.matched,
    candidateUnmatched: ledgerSummary.candidateMatch.unmatched,
    semanticallyRead: ledgerSummary.semanticReading.read,
    semanticallyReadShare: ledgerSummary.semanticReading.readShareOfEligible,
    decisions: ledgerSummary.decisions,
    publishedConcepts: 0,
    publishedAssertions: 0,
    publishedInsights: 0,
    concepts: concepts.length,
    assertions: edges.length,
    crossDomainAssertions: edges.filter((edge) => edge.crossDomain).length,
    comparisons: comparisons.length,
    resources: [...resourcesByConcept.values()].reduce((total, list) => total + list.length, 0),
    sourceFilesTracked: reconciliation.denominators.manifestSourceFiles,
    sourceFilesChanged: reconciliation.sourceFiles.trackedChanged,
    untrackedDispositions: reconciliation.lateAdditions.dispositions,
    explicitCoverageGaps: reconciliation.lateAdditions.needsDisposition.map((file) => file.path),
    mediaReferences: reconciliation.denominators.mediaReferences,
    mediaReviewed: 0,
    routes: reconciliation.routes.total,
    qualitySample: {
      selected: sampleSelection.sampleSize,
      decided: ledgerSummary.qualitySample.decided,
      method: sampleSelection.method,
    },
    note:
      "Denominators are not interchangeable. A unit is not a resource, and a revision overlay is not a new question. The prototype renders the full candidate graph; semantic reading remains a documented subset.",
  },
  publicProjection,
  sourceFiles: [
    "intelligent-atlas/analysis/graph-build.json",
    "intelligent-atlas/analysis/semantic-ledger-summary.json",
    "intelligent-atlas/analysis/semantic-ledger-v2.jsonl",
    "intelligent-atlas/analysis/source-reconciliation-v2.json",
    "intelligent-atlas/analysis/quality-sample-selection.json",
    "intelligent-atlas/contracts/deck-resolver.mjs",
    "intelligent-atlas/tools/project-public.mjs",
    "content/knowledge/insights.json",
  ],
};

const json = JSON.stringify(payload, null, 2);
const fingerprint = createHash("sha256").update(json).digest("hex");

const reviewScript = `// Generated by intelligent-atlas/tools/build-prototype-data.mjs.
// Review payload. Do not hand-edit. Contains candidate content by design.
window.ATLAS_DATA = ${json};
window.ATLAS_DATA_META = ${JSON.stringify(
  {
    payloadFingerprint: fingerprint,
    graphBuildId: payload.graphBuildId,
    sourceIndexBuildId: payload.sourceIndexBuildId,
    generatedAt: payload.generatedAt,
    sourceFiles: payload.sourceFiles,
  },
  null,
  2,
)};
`;

const publicScript = serializePublicProjection(publicProjection);
const publicFingerprint = createHash("sha256").update(publicScript).digest("hex");

writeFileSync(join(PROTOTYPE, "data.js"), reviewScript, "utf8");
writeFileSync(join(PUBLIC, "public-data.js"), publicScript, "utf8");
writeFileSync(
  join(ANALYSIS, "public-projection-v2.json"),
  JSON.stringify(publicProjection, null, 2) + "\n",
);
writeFileSync(
  join(PROTOTYPE, "data-provenance.json"),
  JSON.stringify(
    {
      schemaVersion: "intelligent-atlas-prototype-provenance/2.0",
      payloadFingerprint: fingerprint,
      publicPayloadFingerprint: publicFingerprint,
      graphBuildId: payload.graphBuildId,
      sourceIndexBuildId: payload.sourceIndexBuildId,
      generatedAt: payload.generatedAt,
      sourceFiles: payload.sourceFiles,
      counts: {
        concepts: concepts.length,
        edges: edges.length,
        comparisons: comparisons.length,
        resources: payload.coverage.resources,
        editions: editions.length,
        days: days.length,
        goals: goals.length,
        decks: Object.keys(decks).length,
        deckStatuses: Object.values(decks).reduce((counts, resolution) => {
          counts[resolution.status] = (counts[resolution.status] ?? 0) + 1;
          return counts;
        }, {}),
      },
      limits: [
        "The prototype renders the full candidate graph, not the corpus analysis denominator.",
        "No candidate concept, mapping or assertion is approved or published.",
        "Media is not embedded; the prototype links to local routes only.",
        "The public artifact contains zero candidate records and zero published records.",
        "Semantic reading covers a documented subset of eligible units.",
        "The review register is corpus-level and pattern-based; it is not a set of approved assertions.",
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
      review: "intelligent-atlas/prototype/data.js",
      public: "intelligent-atlas/public/public-data.js",
      fingerprint,
      publicFingerprint,
      bytes: reviewScript.length,
      concepts: concepts.length,
      edges: edges.length,
      comparisons: comparisons.length,
      editions: editions.length,
      days: days.length,
      goals: goals.length,
      decks: Object.keys(decks).length,
      deckStatuses: Object.values(decks).reduce((counts, resolution) => {
        counts[resolution.status] = (counts[resolution.status] ?? 0) + 1;
        return counts;
      }, {}),
      published: publicProjection.publishedConcepts.length,
    },
    null,
    2,
  ),
);
