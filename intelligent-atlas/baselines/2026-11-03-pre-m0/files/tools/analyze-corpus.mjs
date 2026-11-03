// Semantic analysis pass over the extracted corpus ledger.
//
// Deterministic: same ledger + same registry => same output bytes (except the
// generation timestamp, which is derived from the ledger fingerprint instead
// of the wall clock so reruns stay comparable).
//
// Every assertion must resolve at least one verbatim passage. A selector that
// matches nothing fails the build. Quotes are sliced from unit text; they are
// never authored in the registry.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  AMBIGUITIES,
  ASSERTIONS,
  CHECKED_AT,
  CONCEPTS,
  CONTRADICTIONS,
  DOMAINS,
  GOALS,
  REGISTRY_VERSION,
  RELATION_TYPES,
  RESOURCE_ROLES,
  SCHEMA_VERSION,
  SYMMETRIC_RELATIONS,
} from "./semantic-model.mjs";
import { planGoal } from "../lib/route-planner.mjs";

const ROOT = process.cwd();
const OUT = join(ROOT, "intelligent-atlas", "analysis");
const UNITS_PATH = join(OUT, "units.jsonl");
const MANIFEST_PATH = join(OUT, "corpus-manifest.json");

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const writeJson = (name, value) => {
  mkdirSync(dirname(join(OUT, name)), { recursive: true });
  writeFileSync(join(OUT, name), JSON.stringify(value, null, 2) + "\n", "utf8");
};
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const normalize = (value) => value.replace(/\s+/g, " ").trim();

const units = readFileSync(UNITS_PATH, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
const manifest = readJson(MANIFEST_PATH);
const ledgerFingerprint = sha256(readFileSync(UNITS_PATH));
const graphBuildId = `ia-graph-${ledgerFingerprint.slice(0, 12)}`;

// ------------------------------------------------------------------ matching
const compiled = CONCEPTS.map((concept) => ({
  concept,
  patterns: concept.patterns.map((source) => ({ source, re: new RegExp(source, "i") })),
  exclude: concept.exclude.map((source) => new RegExp(source, "i")),
}));

function weightOf(source) {
  // Multi-word or long patterns are more specific than a single token.
  const stripped = source.replace(/\\b|\(\?:|\)|\?|\||\\/g, "");
  return /\s/.test(stripped) || stripped.length > 8 ? 2 : 1;
}

const packTagsOf = (unit) => (unit.limitations ?? [])
  .map((line) => line.match(/Pack ([a-z0-9-]+)/i)?.[1])
  .filter(Boolean);

function matchConcept(unit) {
  const haystack = `${unit.title}\n${unit.text}`;
  const title = unit.title ?? "";
  const tags = packTagsOf(unit);
  const out = [];
  for (const entry of compiled) {
    if (entry.concept.matchFamilies.length && !entry.concept.matchFamilies.includes(unit.sourceFamily)) continue;
    if (entry.exclude.some((re) => re.test(haystack))) continue;
    let score = 0;
    const hits = [];
    const tagHits = [];
    for (const pattern of entry.patterns) {
      const inTitle = pattern.re.test(title);
      const inText = pattern.re.test(haystack);
      if (!inText) continue;
      score += weightOf(pattern.source) + (inTitle ? 2 : 0);
      hits.push(pattern.source);
    }
    for (const tag of tags) {
      if (!entry.concept.packTags.includes(tag)) continue;
      score += 2;
      tagHits.push(tag);
    }
    if ((!hits.length && !tagHits.length) || score < 2) continue;
    out.push({ conceptId: entry.concept.id, score, hits, tagHits });
  }
  return out.sort((a, b) => b.score - a.score || a.conceptId.localeCompare(b.conceptId)).slice(0, 5);
}

// Why a unit stayed unmapped. This is a disposition, not a claim that the unit
// has no meaning: it records the specific reason the lexical matcher declined
// to force a concept identity.
function classifyUnmapped(unit) {
  const text = normalize(unit.text ?? "");
  const title = normalize(unit.title ?? "");
  const head = `${title} ${text.slice(0, 220)}`;
  if (unit.sourceKind === "formula" || (/\\[a-zA-Z]+/.test(text) && text.length < 220)) {
    return { code: "formula-fragment", detail: "Notation or formula fragment without a proposition that can carry a concept mapping." };
  }
  if (/^(opening|how to use( this atlas)?|table of contents|index|reading paths?|cheat sheet|ownership rule|see also|references?|next steps|summary)$/i.test(title)
    || /navigation only|library hub|this page is a (list|reference)|pick one job/i.test(head)) {
    return { code: "navigation-index", detail: "Opening, index, reading-path or ownership text; navigation rather than a teachable proposition." };
  }
  if (unit.contentForms?.includes("lab-steps")
    || /^(clean up|delete the workspace|prerequisites?|set up|create (a|the) workspace|reset|restart)\b/i.test(title)
    || /\b(clean up resources|delete the workspace|exercise setup|before you begin|next steps)\b/i.test(head)) {
    return { code: "procedural-step", detail: "Setup, cleanup or exercise instruction; procedural rather than conceptual." };
  }
  if (unit.sourceKind === "question" || unit.sourceKind === "question-revision-overlay") {
    return { code: "question-paraphrase", detail: "Paraphrased question stem with no registry term above threshold; held answers and options are excluded, so no inference from an answer is allowed." };
  }
  if (/\b(analyze cross-feature security behavior|select architecture\/governance controls|defend an architectural choice|maintain a data analytics solution|identified from the repository|library hub\.?\s*navigation only)\b/i.test(head)) {
    return { code: "template-boilerplate", detail: "Repeated study-prompt or repository scaffolding, not a source-specific teachable proposition." };
  }
  if (/\b(python|pyspark|spark|scala|pandas|dataframe|matplotlib|seaborn|excel|adls|nosql|cosmos db|kql|databricks|synapse)\b/i.test(head)) {
    return { code: "domain-not-modelled", detail: "Python/Spark/Excel/NoSQL or another execution domain that the five-domain registry does not model as a canonical concept." };
  }
  const remainder = text.startsWith(title) ? text.slice(title.length).trim() : text;
  const hasProposition = /\b(?:is|are|was|were|must|should|can|cannot|does|do|requires?|supports?|use|treat|keep|separate|preserve|test|choose|apply|measure|review|combine|avoid|depends?|means?|establishes?|produces?|allows?|prevents?|reports?|indicates?|includes?|remains?|governs?|reduces?|creates?|protects?)\b/i.test(remainder);
  if (remainder.split(/\s+/).filter(Boolean).length < 6 || !hasProposition) {
    return { code: "thin-fragment", detail: "Heading or fragment without a complete proposition; too little context to identify a concept without guessing." };
  }
  return { code: "no-lexical-signal", detail: "Substantive text, but no registry term reached the confidence threshold; retained for review rather than forced." };
}

function roleFor(unit) {
  if (unit.sourceKind === "question" || unit.sourceKind === "question-revision-overlay") return "practices";
  if (unit.sourceKind === "reference") return "references";
  if (unit.sourceKind === "case-study") return "applies";
  if (unit.sourceKind === "experiment") return "applies";
  if (unit.sourceKind === "formula") return "demonstrates";
  if (unit.sourceKind === "note") return /^demo\b/i.test(unit.title) ? "applies" : "explains";
  if (unit.contentForms.includes("figure")) return "demonstrates";
  if (unit.contentForms.includes("lab-steps")) return "applies";
  return "explains";
}

// A mapping is only proposed when the unit is actually about the concept.
// Link-only references stay metadata-only and are never semantically mapped.
const EXCLUDED_FAMILIES = new Set(["curated-references"]);
const NONLEARNING_KINDS = new Set(["public-page"]);

const analyzed = [];
const mappings = [];
const conceptStats = new Map(CONCEPTS.map((concept) => [concept.id, { unitCount: 0, byFamily: {}, byLanguage: {}, primary: 0, roles: {} }]));

for (const unit of units) {
  const base = {
    ...unit,
    semanticAnalysisState: "pending",
    conceptCandidates: [],
    relationCandidates: [],
    resourceMappings: [],
    analysisNotes: [],
  };
  if (EXCLUDED_FAMILIES.has(unit.sourceFamily)) {
    base.semanticAnalysisState = "excluded-metadata-only";
    base.exclusionReason = "LINK_ONLY reference: bibliographic metadata only; full text is not republished and was not semantically analyzed.";
    analyzed.push(base);
    continue;
  }
  if (NONLEARNING_KINDS.has(unit.sourceKind)) {
    base.semanticAnalysisState = "excluded-nonlearning";
    base.exclusionReason = "Professional/utility page retained for discoverability only; not forced into a scientific concept.";
    analyzed.push(base);
    continue;
  }
  if (!normalize(unit.text)) {
    base.semanticAnalysisState = "unresolved-empty";
    base.exclusionReason = "Extracted unit has no readable text.";
    analyzed.push(base);
    continue;
  }

  const matches = matchConcept(unit);
  if (!matches.length) {
    base.semanticAnalysisState = "analyzed-unmapped";
    const reason = classifyUnmapped(unit);
    base.unmappedReason = reason.code;
    base.unmappedDetail = reason.detail;
    base.analysisNotes.push(`No registry concept reached the confidence threshold (${reason.code}); retained as unmapped rather than forced.`);
    analyzed.push(base);
    continue;
  }

  base.semanticAnalysisState = "analyzed-mapped";
  base.conceptCandidates = matches.map((match, index) => ({
    conceptId: match.conceptId,
    confidence: match.score >= 4 ? "primary" : "secondary",
    rank: index + 1,
    score: match.score,
    matchedPatterns: match.hits.length,
    tagHints: match.tagHits,
    reviewState: "candidate",
  }));
  const role = roleFor(unit);
  base.resourceMappings = matches.map((match) => ({
    conceptId: match.conceptId,
    role,
    evidenceLocator: unit.locator,
    reviewState: "candidate",
  }));
  for (const match of matches) {
    const stats = conceptStats.get(match.conceptId);
    stats.unitCount += 1;
    stats.byFamily[unit.sourceFamily] = (stats.byFamily[unit.sourceFamily] ?? 0) + 1;
    stats.byLanguage[unit.language] = (stats.byLanguage[unit.language] ?? 0) + 1;
    if (match.score >= 4) stats.primary += 1;
    stats.roles[role] = (stats.roles[role] ?? 0) + 1;
    mappings.push({
      id: `map:${unit.unitId}:${match.conceptId.replace("concept:", "")}`,
      unitId: unit.unitId,
      conceptId: match.conceptId,
      role,
      sourcePath: unit.sourcePath,
      locator: unit.locator,
      canonicalHref: unit.canonicalHref,
      language: unit.language,
      reviewState: "candidate",
      confidence: match.score >= 4 ? "primary" : "secondary",
      limitations: unit.limitations ?? [],
    });
  }
  analyzed.push(base);
}

// ------------------------------------------------------------- evidence pass
function sentences(text) {
  return text
    .split(/(?<=[.!?؟])\s+|\n+/)
    .map(normalize)
    .filter(Boolean);
}

function resolveEvidence(selector, ownerId) {
  const families = selector.families ? new Set(selector.families) : null;
  const re = new RegExp(selector.pattern, "i");
  const max = selector.max ?? 2;
  const found = [];
  for (const unit of units) {
    if (families && !families.has(unit.sourceFamily)) continue;
    if (unit.sourceFamily === "curated-references") continue;
    const match = unit.text.match(re);
    if (!match) continue;
    const all = sentences(unit.text);
    const containing = all.find((sentence) => re.test(sentence)) ?? normalize(unit.text.slice(Math.max(0, match.index - 80), match.index + 240));
    const quote = containing.length > 420 ? `${containing.slice(0, 417)}…` : containing;
    if (!unit.text.includes(quote.replace(/…$/, ""))) {
      throw new Error(`Quote extraction failed for ${ownerId} in ${unit.unitId}`);
    }
    found.push({
      unitId: unit.unitId,
      sourcePath: unit.sourcePath,
      locator: unit.locator,
      canonicalHref: unit.canonicalHref,
      language: unit.language,
      quote,
      quoteFingerprint: sha256(quote).slice(0, 16),
    });
    if (found.length >= max) break;
  }
  if (!found.length) throw new Error(`No evidence for ${ownerId}: ${selector.pattern} in ${selector.families ?? "any family"}`);
  return found;
}

const conceptIds = new Set(CONCEPTS.map((concept) => concept.id));
const assertionIds = new Set();
const assertions = ASSERTIONS.map((assertion) => {
  if (assertionIds.has(assertion.id)) throw new Error(`Duplicate assertion id ${assertion.id}`);
  assertionIds.add(assertion.id);
  if (!conceptIds.has(assertion.from) || !conceptIds.has(assertion.to)) throw new Error(`Unknown endpoint in ${assertion.id}`);
  if (assertion.from === assertion.to) throw new Error(`Self edge ${assertion.id}`);
  if (!RELATION_TYPES.includes(assertion.relationType)) throw new Error(`Unknown relation type ${assertion.relationType}`);
  const symmetric = SYMMETRIC_RELATIONS.has(assertion.relationType);
  if (symmetric !== (assertion.direction === "symmetric")) throw new Error(`Direction mismatch in ${assertion.id}`);
  const evidence = assertion.evidence.flatMap((selector) => resolveEvidence(selector, assertion.id));
  const deduped = [...new Map(evidence.map((item) => [item.unitId, item])).values()];
  if (!deduped.length) throw new Error(`Assertion ${assertion.id} has no evidence`);
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
    evidence: deduped,
    crosswalk: assertion.crosswalk ?? null,
    reviewState: "candidate",
    reviewer: "agent:corpus-analysis; human pending",
    checkedAt: CHECKED_AT,
    registryVersion: REGISTRY_VERSION,
    graphBuildId,
  };
});

// ---------------------------------------------------------- ambiguity checks
const aliasIndex = new Map();
for (const concept of CONCEPTS) {
  for (const alias of [concept.prefLabel, ...concept.aliases.en, ...concept.aliases.ar]) {
    const key = alias.trim().toLowerCase();
    if (!key) continue;
    if (!aliasIndex.has(key)) aliasIndex.set(key, []);
    aliasIndex.get(key).push(concept.id);
  }
}
const ambiguousTerms = new Set(AMBIGUITIES.flatMap((entry) => [entry.term, ...(entry.terms ?? [])]).map((term) => term.toLowerCase()));
const collisions = [...aliasIndex.entries()]
  .filter(([, ids]) => new Set(ids).size > 1)
  .map(([term, ids]) => ({ term, conceptIds: [...new Set(ids)] }));
const undocumentedCollisions = collisions.filter((collision) => !ambiguousTerms.has(collision.term));
if (undocumentedCollisions.length) {
  throw new Error(`Undocumented alias collisions: ${undocumentedCollisions.map((c) => c.term).join(", ")}`);
}

const ambiguities = AMBIGUITIES.map((entry) => ({
  ...entry,
  reviewState: "candidate",
  evidence: entry.evidence.flatMap((selector) => resolveEvidence({ ...selector, max: 1 }, entry.id)),
  collisionRegistered: collisions.some((collision) => [entry.term, ...(entry.terms ?? [])].map((term) => term.toLowerCase()).includes(collision.term)),
}));

const contradictions = CONTRADICTIONS.map((entry) => ({
  ...entry,
  reviewState: "candidate",
  evidence: entry.evidence.flatMap((selector) => resolveEvidence({ ...selector, max: 1 }, entry.id)),
}));

// ------------------------------------------------------------ graph assembly
const conceptById = new Map(CONCEPTS.map((concept) => [concept.id, concept]));
const domainById = new Map(DOMAINS.map((domain) => [domain.id, domain]));

const edges = assertions.map((assertion) => ({
  ...assertion,
  fromLabel: conceptById.get(assertion.from).prefLabel,
  toLabel: conceptById.get(assertion.to).prefLabel,
  fromDomain: conceptById.get(assertion.from).domain,
  toDomain: conceptById.get(assertion.to).domain,
  crossDomain: conceptById.get(assertion.from).domain !== conceptById.get(assertion.to).domain,
}));

const nodes = CONCEPTS.map((concept) => {
  const stats = conceptStats.get(concept.id);
  const related = edges.filter((edge) => edge.from === concept.id || edge.to === concept.id);
  return {
    id: concept.id,
    label: concept.prefLabel,
    domain: concept.domain,
    domainLabel: domainById.get(concept.domain).label,
    kind: concept.kind,
    definition: concept.definition,
    scope: concept.scope,
    discriminatingContext: concept.discriminatingContext,
    aliases: concept.aliases,
    existingAtlasId: concept.existingAtlasId,
    reviewState: "candidate",
    unitCount: stats.unitCount,
    primaryUnitCount: stats.primary,
    roleCounts: stats.roles,
    byFamily: stats.byFamily,
    byLanguage: stats.byLanguage,
    assertionCount: related.length,
    crossDomainAssertionCount: related.filter((edge) => edge.crossDomain).length,
  };
}).sort((a, b) => a.id.localeCompare(b.id));

// ------------------------------------------------------------- cycle testing
function findCycles(list, typeSet) {
  const adjacency = new Map();
  for (const edge of list) {
    if (!typeSet.has(edge.relationType)) continue;
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from).push(edge.to);
  }
  const state = new Map();
  const stack = [];
  const cycles = [];
  const visit = (node) => {
    state.set(node, 1);
    stack.push(node);
    for (const next of adjacency.get(node) ?? []) {
      if (state.get(next) === 1) {
        const start = stack.indexOf(next);
        cycles.push([...stack.slice(start), next]);
      } else if (!state.get(next)) {
        visit(next);
      }
    }
    stack.pop();
    state.set(node, 2);
  };
  for (const node of adjacency.keys()) if (!state.get(node)) visit(node);
  return cycles;
}

const prerequisiteCycles = findCycles(edges, new Set(["requires_understanding_of"]));
const enablingCycles = findCycles(edges, new Set(["enables"]));
const comparisonCycles = findCycles(edges, new Set(["contrasts_with", "tradeoff_with", "complements"]));

// ------------------------------------------------------------- route planning
// V3.1: dependency-correct topological order over the eligible prerequisite
// closure. The stored scientific direction A -> B means "A requires B"; the
// planner reverses traversal explicitly (B -> A) and never sorts by depth.
const routeConcepts = new Map(
  [...conceptById].map(([id, concept]) => [
    id,
    { id, label: concept.prefLabel, domain: concept.domain },
  ]),
);
const routeResources = new Map();
for (const mapping of mappings) {
  if (!mapping.canonicalHref?.startsWith("/")) continue;
  const list = routeResources.get(mapping.conceptId) ?? [];
  list.push({
    unitId: mapping.unitId,
    href: mapping.canonicalHref,
    role: mapping.role,
    locator: mapping.locator,
    sourcePath: mapping.sourcePath,
    language: mapping.language,
    reviewState: mapping.reviewState,
  });
  routeResources.set(mapping.conceptId, list);
}

const routes = GOALS.map((goal) =>
  planGoal(
    {
      goalId: goal.id,
      title: goal.title,
      audience: goal.audience,
      basis: goal.basis,
      limitations: goal.limitations,
      targetConcepts: goal.targetConcepts,
    },
    {
      assertions: edges,
      concepts: routeConcepts,
      resources: routeResources,
      basis: "candidate-review",
      graphBuildId,
    },
  ),
);

// -------------------------------------------------------------- review queue
const riskFor = (edge) => {
  let score = 0;
  const reasons = [];
  if (edge.crossDomain) { score += 3; reasons.push("cross-domain bridge"); }
  if (edge.supportKind === "inference") { score += 2; reasons.push("inferred support"); }
  if (edge.relationType === "requires_understanding_of") { score += 2; reasons.push("prerequisite direction"); }
  if (edge.evidence.length < 2) { score += 1; reasons.push("single evidence passage"); }
  if (edge.crosswalk?.existingAssertionId) { score += 1; reasons.push("duplicates an existing technical_review edge; merge decision needed"); }
  return { score, reasons };
};

const reviewQueue = {
  schemaVersion: SCHEMA_VERSION,
  graphBuildId,
  notice: "Editorial review queue. Nothing here is approved or published. Ordering is a review-triage heuristic, not a truth probability.",
  counts: {
    concepts: nodes.length,
    assertions: edges.length,
    mappings: mappings.length,
    ambiguities: ambiguities.length,
    contradictions: contradictions.length,
  },
  concepts: nodes
    .filter((node) => node.unitCount < 3 || !node.assertionCount)
    .map((node) => ({
      conceptId: node.id,
      label: node.label,
      reason: node.unitCount < 3 ? "low corpus support (fewer than three mapped units)" : "registry-only concept with no candidate assertion",
      unitCount: node.unitCount,
      assertionCount: node.assertionCount,
      reviewState: "candidate",
    })),
  assertions: edges
    .map((edge) => ({ edge, ...riskFor(edge) }))
    .sort((a, b) => b.score - a.score || a.edge.id.localeCompare(b.edge.id))
    .map(({ edge, score, reasons }) => ({
      assertionId: edge.id,
      from: edge.from,
      to: edge.to,
      relationType: edge.relationType,
      claim: edge.claim,
      supportKind: edge.supportKind,
      evidenceCount: edge.evidence.length,
      riskScore: score,
      riskReasons: reasons,
      reviewState: "candidate",
    })),
  ambiguities: ambiguities.map((entry) => ({ id: entry.id, term: entry.term, resolution: entry.resolution, decision: entry.decision })),
  contradictions: contradictions.map((entry) => ({ id: entry.id, topic: entry.topic, classification: entry.classification, status: entry.status })),
};

// --------------------------------------------------------- public projection
const publicProjection = {
  schemaVersion: SCHEMA_VERSION,
  graphBuildId,
  mode: "public",
  generatedAt: CHECKED_AT,
  notice: "The reviewed public semantic graph is not yet published. This projection intentionally contains zero concepts and zero semantic assertions.",
  publishedConcepts: [],
  publishedMappings: [],
  publishedAssertions: [],
  withheld: {
    conceptCount: nodes.length,
    mappingCount: mappings.length,
    assertionCount: edges.length,
    reason: "No concept, mapping or assertion has human publication approval. Candidate and technical_review records are excluded by the fail-closed projection.",
  },
  structural: {
    domainCount: DOMAINS.length,
    routeCount: manifest.routeCount,
    sourceCount: manifest.sourceCount,
    unitCount: manifest.unitCount,
    note: "Structural discovery counts are not published concepts and must not be used as semantic coverage.",
  },
  gates: {
    humanPublicationReview: "blocked",
    scientificReview: "pending",
    rightsReview: "pending",
    assessmentReview: "not-applicable",
  },
};

// ----------------------------------------------------------- public/private
const graphBuild = {
  schemaVersion: SCHEMA_VERSION,
  registryVersion: REGISTRY_VERSION,
  graphBuildId,
  mode: "editorial-review",
  publicEligible: false,
  generatedAt: CHECKED_AT,
  notice: "ISOLATED EDITORIAL REVIEW DATA. Candidate concepts and assertions only. Not approved, not published, not for the public projection.",
  ledgerFingerprint,
  sourceFingerprint: manifest.sources.map((source) => ({ id: source.id, fingerprint: source.fingerprint })),
  domains: DOMAINS,
  roles: RESOURCE_ROLES,
  nodes,
  edges,
  goals: routes,
  counts: {
    concepts: nodes.length,
    assertions: edges.length,
    crossDomainAssertions: edges.filter((edge) => edge.crossDomain).length,
    mappedUnits: analyzed.filter((unit) => unit.semanticAnalysisState === "analyzed-mapped").length,
    mappedResources: new Set(mappings.filter((mapping) => mapping.canonicalHref.startsWith("/")).map((mapping) => mapping.canonicalHref)).size,
  },
  integrity: {
    prerequisiteCycles,
    enablingCycles,
    comparisonCycles,
    comparisonCycleNote: "Cycles among contrasts/trade-offs/complements are expected and are not prerequisite failures.",
    danglingEndpoints: edges.filter((edge) => !conceptIds.has(edge.from) || !conceptIds.has(edge.to)).map((edge) => edge.id),
    duplicateExistingAssertions: edges.filter((edge) => edge.crosswalk?.existingAssertionId).map((edge) => ({ assertionId: edge.id, existingAssertionId: edge.crosswalk.existingAssertionId })),
  },
};

// ------------------------------------------------------------- state summary
const stateCounts = {};
for (const unit of analyzed) stateCounts[unit.semanticAnalysisState] = (stateCounts[unit.semanticAnalysisState] ?? 0) + 1;
const familyCoverage = {};
for (const unit of analyzed) {
  const family = (familyCoverage[unit.sourceFamily] ??= { total: 0, mapped: 0, unmapped: 0, excluded: 0 });
  family.total += 1;
  if (unit.semanticAnalysisState === "analyzed-mapped") family.mapped += 1;
  else if (unit.semanticAnalysisState === "analyzed-unmapped") family.unmapped += 1;
  else family.excluded += 1;
}

const unmappedReasons = {};
for (const unit of analyzed) {
  if (unit.semanticAnalysisState !== "analyzed-unmapped") continue;
  const code = unit.unmappedReason ?? "unclassified";
  const row = (unmappedReasons[code] ??= { code, count: 0, byFamily: {}, detail: unit.unmappedDetail ?? "" });
  row.count += 1;
  row.byFamily[unit.sourceFamily] = (row.byFamily[unit.sourceFamily] ?? 0) + 1;
}

const analyzedManifest = {
  ...manifest,
  schemaVersion: "corpus-manifest/1.1-analyzed",
  derivedFrom: { unitsFingerprint: ledgerFingerprint, registryVersion: REGISTRY_VERSION, graphBuildId },
  semanticAnalysis: {
    state: "whole-eligible-corpus-analyzed",
    analyzedAt: CHECKED_AT,
    registryVersion: REGISTRY_VERSION,
    states: stateCounts,
    familyCoverage,
    unmappedReasons,
    conceptCount: nodes.length,
    mappedConceptCount: nodes.filter((node) => node.unitCount > 0).length,
    mappingCount: mappings.length,
    assertionCount: edges.length,
    ambiguityCount: ambiguities.length,
    contradictionCount: contradictions.length,
  },
  denominators: {
    ...manifest.denominators,
    unitsExtracted: units.length,
    unitsPendingSemanticAnalysis: stateCounts["pending"] ?? 0,
    unitsAnalyzedMapped: stateCounts["analyzed-mapped"] ?? 0,
    unitsAnalyzedUnmapped: stateCounts["analyzed-unmapped"] ?? 0,
    unitsExcludedMetadataOnly: stateCounts["excluded-metadata-only"] ?? 0,
    unitsExcludedNonlearning: stateCounts["excluded-nonlearning"] ?? 0,
    unitsUnresolved: stateCounts["unresolved-empty"] ?? 0,
    mediaReferences: manifest.mediaCount,
    mediaNotIndependentlyReviewed: manifest.mediaCount,
  },
};

const summary = {
  schemaVersion: SCHEMA_VERSION,
  graphBuildId,
  ledgerFingerprint,
  registryVersion: REGISTRY_VERSION,
  checkedAt: CHECKED_AT,
  counts: {
    units: units.length,
    states: stateCounts,
    unmappedReasons,
    concepts: nodes.length,
    conceptsWithCorpusSupport: nodes.filter((node) => node.unitCount > 0).length,
    registryOnlyConcepts: nodes.filter((node) => node.unitCount === 0).map((node) => node.id),
    mappings: mappings.length,
    assertions: edges.length,
    crossDomainAssertions: edges.filter((edge) => edge.crossDomain).length,
    directSupport: edges.filter((edge) => edge.supportKind === "direct").length,
    inferredSupport: edges.filter((edge) => edge.supportKind === "inference").length,
    ambiguities: ambiguities.length,
    contradictions: contradictions.length,
    publishedConcepts: 0,
    publishedAssertions: 0,
  },
  relationTypes: RELATION_TYPES.map((type) => ({ type, count: edges.filter((edge) => edge.relationType === type).length })),
  domainEdges: DOMAINS.map((domain) => ({
    domain: domain.id,
    concepts: nodes.filter((node) => node.domain === domain.id).length,
    internal: edges.filter((edge) => edge.fromDomain === domain.id && edge.toDomain === domain.id).length,
    outgoingCrossDomain: edges.filter((edge) => edge.fromDomain === domain.id && edge.toDomain !== domain.id).length,
  })),
  routes: routes.map((route) => ({ goalId: route.goalId, supported: route.supported, steps: route.steps.length, gaps: route.coverage.gapConceptIds })),
};

// ------------------------------------------------------------------- outputs
writeJson("concepts.json", {
  schemaVersion: SCHEMA_VERSION,
  registryVersion: REGISTRY_VERSION,
  graphBuildId,
  notice: "Candidate canonical concepts. No concept is approved or published.",
  domains: DOMAINS,
  concepts: CONCEPTS.map((concept) => ({
    ...concept,
    stats: conceptStats.get(concept.id),
    reviewState: "candidate",
    crosswalk: concept.existingAtlasId ? { existingAtlasId: concept.existingAtlasId, relation: "reused-identity" } : null,
  })),
  aliasCollisions: collisions,
});

writeJson("mappings.json", {
  schemaVersion: SCHEMA_VERSION,
  graphBuildId,
  notice: "Candidate resource-to-concept mappings with pedagogical role and locator. Review status is candidate.",
  roles: RESOURCE_ROLES,
  counts: { mappings: mappings.length, units: new Set(mappings.map((mapping) => mapping.unitId)).size, resources: new Set(mappings.map((mapping) => mapping.canonicalHref)).size },
  mappings,
});

writeJson("assertions.json", {
  schemaVersion: SCHEMA_VERSION,
  graphBuildId,
  registryVersion: REGISTRY_VERSION,
  notice: "Candidate typed semantic assertions. No assertion is approved or published. Every quote is sliced from the unit ledger.",
  relationVocabulary: RELATION_TYPES,
  assertions: edges,
});

writeJson("ambiguities.json", {
  schemaVersion: SCHEMA_VERSION,
  graphBuildId,
  notice: "Ambiguity and entity-resolution register.",
  ambiguities,
});

writeJson("contradictions.json", {
  schemaVersion: SCHEMA_VERSION,
  graphBuildId,
  notice: "Contradiction and stale-source register. Classification separates genuine contradictions from version and scope differences.",
  contradictions,
});

writeJson("review-queue.json", reviewQueue);
writeJson("public-projection.json", publicProjection);
writeJson("graph-build.json", graphBuild);
writeJson("manifest-analyzed.json", analyzedManifest);
writeJson("analysis-summary.json", summary);

// The unit-level ledger with analysis fields, in the same order as the input.
const ledgerOut = analyzed.map((unit) => JSON.stringify(unit)).join("\n") + "\n";
writeFileSync(join(OUT, "units-analyzed.jsonl"), ledgerOut, "utf8");

// ------------------------------------------------------------ coverage report
const pct = (value, total) => total ? `${((value / total) * 100).toFixed(1)}%` : "0.0%";
const stateLabel = {
  "analyzed-mapped": "Semantically analyzed and mapped",
  "analyzed-unmapped": "Semantically analyzed, unmapped (reason-coded)",
  "excluded-metadata-only": "Excluded: LINK_ONLY metadata",
  "excluded-nonlearning": "Excluded: non-learning public page",
  "unresolved-empty": "Unresolved: empty extraction",
  pending: "Pending",
};
const rows = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]);
const eligible = (stateCounts["analyzed-mapped"] ?? 0) + (stateCounts["analyzed-unmapped"] ?? 0);
const report = `# Intelligent Atlas — corpus analysis coverage

Generated ${CHECKED_AT} from ledger \`${ledgerFingerprint.slice(0, 16)}…\` with registry \`${REGISTRY_VERSION}\`.

## What this report proves — and what it does not

It proves that **every extracted unit has an explicit analysis disposition**, that the eligible units were run through the concept matcher, and that every candidate assertion resolves to a verbatim corpus passage. It does **not** prove scientific correctness, human approval, or that a rendered figure was visually reviewed. Media remains caption/alt-only.

## Unit dispositions

| Disposition | Units | Share |
|---|---:|---:|
${rows.map(([state, count]) => `| ${stateLabel[state] ?? state} | ${count} | ${pct(count, units.length)} |`).join("\n")}
| **Total extracted** | **${units.length}** | **100.0%** |

Eligible learning units: **${eligible}**. Pending eligible units: **${stateCounts["pending"] ?? 0}**. Excluded with reason: **${(stateCounts["excluded-metadata-only"] ?? 0) + (stateCounts["excluded-nonlearning"] ?? 0)}** (LINK_ONLY references and professional/utility pages).

Of the **${eligible}** eligible learning units, **${stateCounts["analyzed-mapped"] ?? 0}** (${pct(stateCounts["analyzed-mapped"] ?? 0, eligible)}) reached at least one concept above threshold and **${stateCounts["analyzed-unmapped"] ?? 0}** (${pct(stateCounts["analyzed-unmapped"] ?? 0, eligible)}) are explicitly unmapped with a reason code. Unmapped is not a pending state.

## Per-family coverage

| Family | Total | Mapped | Unmapped | Excluded |
|---|---:|---:|---:|---:|
${Object.entries(familyCoverage).sort((a, b) => b[1].total - a[1].total).map(([family, row]) => `| ${family} | ${row.total} | ${row.mapped} | ${row.unmapped} | ${row.excluded} |`).join("\n")}

## Why units stayed unmapped

Unmapped is an explicit disposition, not a silent drop. Each unit carries one reason code in \`units-analyzed.jsonl\`.

| Reason | Units | Share of unmapped | Main families |
|---|---:|---:|---|
${Object.values(unmappedReasons).sort((a, b) => b.count - a.count).map((row) => `| \`${row.code}\` | ${row.count} | ${pct(row.count, stateCounts["analyzed-unmapped"] ?? 0)} | ${Object.entries(row.byFamily).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([family, count]) => `${family} (${count})`).join(", ")} |`).join("\n")}

Paraphrased question stems are the largest single reason. They are intentionally not forced onto a concept from a held answer; the answer and option text remain excluded. Domain-not-modelled units are mostly Python/Spark/Excel material outside the five canonical domains, and formula fragments are notation rather than propositions.

## Concept registry

- Canonical concepts: **${nodes.length}** across ${DOMAINS.length} domains.
- Concepts with at least one corpus mapping: **${nodes.filter((node) => node.unitCount > 0).length}**.
- Registry-only concepts (no unit reached threshold): **${nodes.filter((node) => node.unitCount === 0).length}**.
- Candidate mappings: **${mappings.length}** across **${new Set(mappings.map((mapping) => mapping.canonicalHref)).size}** distinct resources.
- Reused existing Atlas identities: **${nodes.filter((node) => node.existingAtlasId).length}**. New identities are scoped and do not replace existing ones.

Registry-only concepts are listed in \`analysis-summary.json\`; they remain candidates for review, not silent deletions.

## Assertions

| Relation | Count |
|---|---:|
${RELATION_TYPES.map((type) => `| \`${type}\` | ${edges.filter((edge) => edge.relationType === type).length} |`).join("\n")}
| **Total** | **${edges.length}** |

- Direct support: **${edges.filter((edge) => edge.supportKind === "direct").length}**.
- Inferred support: **${edges.filter((edge) => edge.supportKind === "inference").length}** — explicitly labelled, not presented as direct quotation.
- Cross-domain assertions: **${edges.filter((edge) => edge.crossDomain).length}**.
- Evidence passages resolved: **${edges.reduce((sum, edge) => sum + edge.evidence.length, 0)}**. Every passage is a verbatim slice of a ledger unit.

## Graph integrity

- Prerequisite cycles (\`requires_understanding_of\`): **${prerequisiteCycles.length}**.
- Enabling cycles (\`enables\`): **${enablingCycles.length}**.
- Comparison/trade-off cycles: **${comparisonCycles.length}** — allowed by policy; not treated as prerequisite failure.
- Dangling assertion endpoints: **${graphBuild.integrity.danglingEndpoints.length}**.
- Assertions crosswalked to an existing Atlas edge: **${graphBuild.integrity.duplicateExistingAssertions.length}**.

## Review and publication state

| State | Concepts | Assertions |
|---|---:|---:|
| candidate | ${nodes.length} | ${edges.length} |
| technical_review | 0 (reused existing identities keep their own state) | 0 |
| approved | 0 | 0 |
| published | 0 | 0 |

The public projection contains **zero published concepts and zero published assertions**. Withheld candidates: ${publicProjection.withheld.conceptCount} concepts, ${publicProjection.withheld.mappingCount} mappings, ${publicProjection.withheld.assertionCount} assertions. This is the truthful public semantic coverage, not an error to hide.

## Goals and routes

${routes.map((route) => `- **${route.title}** — ${route.supported ? "route supported by candidate prerequisites" : "incomplete route"}; ${route.steps.length} steps; gaps: ${route.coverage.gapConceptIds.length ? route.coverage.gapConceptIds.join(", ") : "none"}. ${route.limitationsApplied.join(" ")}`).join("\n")}

Routes are proposals over **candidate** prerequisites. They are not published curricula and do not imply exam readiness.

## Known limits

- ${manifest.mediaCount} media references were not independently visually reviewed; captions and alt text only.
- LINK_ONLY references are metadata-only and were not semantically analyzed.
- Held answers, options and explanations remain excluded; question stems are mapped as \`practices\`, and no answer was used as evidence.
- Contradiction classification is a first-pass editorial register; ${contradictions.filter((entry) => entry.status === "open-for-editorial-review").length} item(s) remain open for editorial review.
- The concept matcher is deterministic lexical matching with a confidence threshold. It is reproducible and inspectable, not a semantic embedding model; ambiguous units are retained in the ambiguity register rather than forced.
- No rendered-page accessibility, performance or visual QA is claimed by this report.
`;

writeFileSync(join(OUT, "coverage-report.md"), report, "utf8");

console.log(JSON.stringify({
  graphBuildId,
  units: units.length,
  states: stateCounts,
  concepts: nodes.length,
  conceptsWithSupport: nodes.filter((node) => node.unitCount > 0).length,
  mappings: mappings.length,
  assertions: edges.length,
  crossDomain: edges.filter((edge) => edge.crossDomain).length,
  prerequisiteCycles: prerequisiteCycles.length,
  published: 0,
}, null, 2));
