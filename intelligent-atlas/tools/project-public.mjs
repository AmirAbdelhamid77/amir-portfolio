// Fail-closed public projection.
//
// The public artifact may contain only units that have completed publication
// review. Nothing in this repository has, so the projection is intentionally
// empty. The function is exported so fixtures can prove the gate actually
// admits approved records instead of merely returning an empty constant.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const PUBLIC_PROJECTION_SCHEMA = "intelligent-atlas-public-projection/2.0";

const PUBLISHED = "published";

function isHumanApproved(record) {
  return (
    record?.publicationState === PUBLISHED &&
    record?.publicEligible === true &&
    typeof record?.reviewedBy === "string" &&
    record.reviewedBy.trim().length > 0 &&
    record?.reviewedAt
  );
}

function projectConcept(concept) {
  return {
    id: concept.id,
    label: concept.label,
    domain: concept.domain,
    domainLabel: concept.domainLabel,
    kind: concept.kind,
    definition: concept.definition,
    scope: concept.scope,
    reviewedBy: concept.reviewedBy,
    reviewedAt: concept.reviewedAt,
  };
}

function projectAssertion(assertion) {
  return {
    id: assertion.id,
    from: assertion.from,
    to: assertion.to,
    relationType: assertion.relationType,
    direction: assertion.direction,
    claim: assertion.claim,
    conditions: assertion.conditions,
    rationale: assertion.rationale,
    supportKind: assertion.supportKind,
    reviewedBy: assertion.reviewedBy,
    reviewedAt: assertion.reviewedAt,
  };
}

/**
 * @param {object} input {graph, insights, ledgerSummary}
 * @param {object} options {generatedAt, mode}
 */
export function projectPublic(input, options = {}) {
  const graph = input.graph ?? { nodes: [], edges: [], domains: [] };
  const insights = input.insights ?? [];
  const ledgerSummary = input.ledgerSummary ?? {};

  const publishedConcepts = (graph.nodes ?? []).filter(isHumanApproved).map(projectConcept);
  const publishedAssertions = (graph.edges ?? []).filter(isHumanApproved).map(projectAssertion);
  const publishedInsights = insights
    .filter(isHumanApproved)
    .map((insight) => ({
      id: insight.id,
      date: insight.date,
      title: insight.title,
      cardTitle: insight.cardTitle,
      takeaway: insight.takeaway,
      caveat: insight.caveat,
      conceptId: insight.conceptId,
      lessonHref: insight.lessonHref,
      practiceHref: insight.practiceHref,
      sourceId: insight.sourceId,
      sourceUrl: insight.sourceUrl,
      sourceLocator: insight.sourceLocator,
      reviewedBy: insight.reviewedBy,
      reviewedAt: insight.reviewedAt,
    }));

  const publishedIds = new Set(publishedConcepts.map((concept) => concept.id));
  const droppedAssertions = publishedAssertions.filter(
    (assertion) => !publishedIds.has(assertion.from) || !publishedIds.has(assertion.to),
  );

  return {
    schemaVersion: PUBLIC_PROJECTION_SCHEMA,
    generatedAt: options.generatedAt ?? "2026-11-01",
    graphBuildId: graph.graphBuildId ?? null,
    mode: options.mode === "review" ? "review" : "public",
    publicationGate: {
      requiresAll: [
        "publicationState = published",
        "publicEligible = true",
        "reviewedBy is a named reviewer",
        "reviewedAt is recorded",
      ],
      note: "A candidate or technical_review record is never projected, even when it has strong evidence.",
    },
    publishedConcepts,
    publishedAssertions: publishedAssertions.filter(
      (assertion) => publishedIds.has(assertion.from) && publishedIds.has(assertion.to),
    ),
    publishedInsights,
    withheld: {
      conceptCount: (graph.nodes ?? []).length - publishedConcepts.length,
      assertionCount: (graph.edges ?? []).length - publishedAssertions.length,
      insightCount: insights.length - publishedInsights.length,
      unitCount: ledgerSummary.denominators?.units ?? null,
      assertionsDroppedForMissingEndpoint: droppedAssertions.length,
      reason:
        publishedConcepts.length === 0
          ? "No concept, assertion or edition has completed human publication review."
          : "Only records with a named human reviewer and a publication date are projected.",
    },
    structural: {
      domainCount: (graph.domains ?? []).length,
      routeCount: ledgerSummary.denominators?.discoverableRoutes ?? null,
      sourceCount: ledgerSummary.denominators?.manifestSourceFiles ?? null,
      unitCount: ledgerSummary.denominators?.units ?? null,
      note: "Structural discovery is navigation metadata. It does not imply semantic publication.",
    },
    emptyState: {
      isPubliclyEmpty:
        publishedConcepts.length === 0 &&
        publishedAssertions.length === 0 &&
        publishedInsights.length === 0,
      learnerMessage:
        "The reviewed knowledge graph is not published yet. You can still browse the reading library and the study routes; the semantic layer will appear here once it passes publication review.",
    },
  };
}

export function serializePublicProjection(projection) {
  return `// Generated by intelligent-atlas/tools/project-public.mjs.
// Public projection only. Do not hand-edit. Contains no candidate records.
window.ATLAS_PUBLIC = ${JSON.stringify(projection, null, 2)};
`;
}

// ---------------------------------------------------------------------- CLI
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const ROOT = process.cwd();
  const ANALYSIS = join(ROOT, "intelligent-atlas", "analysis");
  const graph = JSON.parse(readFileSync(join(ANALYSIS, "graph-build.json"), "utf8"));
  const ledgerSummary = JSON.parse(readFileSync(join(ANALYSIS, "semantic-ledger-summary.json"), "utf8"));
  const reconciliation = JSON.parse(readFileSync(join(ANALYSIS, "source-reconciliation-v2.json"), "utf8"));
  const rawInsights = JSON.parse(readFileSync(join(ROOT, "content", "knowledge", "insights.json"), "utf8"));
  const insights = Array.isArray(rawInsights) ? rawInsights : rawInsights.items ?? [];

  const projection = projectPublic(
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
    { generatedAt: "2026-11-01" },
  );

  writeFileSync(
    join(ANALYSIS, "public-projection-v2.json"),
    JSON.stringify(projection, null, 2) + "\n",
  );

  console.log(
    JSON.stringify(
      {
        out: "intelligent-atlas/analysis/public-projection-v2.json",
        publishedConcepts: projection.publishedConcepts.length,
        publishedAssertions: projection.publishedAssertions.length,
        publishedInsights: projection.publishedInsights.length,
        withheld: projection.withheld,
        publiclyEmpty: projection.emptyState.isPubliclyEmpty,
      },
      null,
      2,
    ),
  );
}
