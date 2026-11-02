// Build the semantic ledger v2.
//
// Every eligible unit carries four independent states:
//   extraction        - was the source text captured?
//   candidateMatch    - did the lexical matcher propose concepts?
//   semanticReading   - did an agent actually read the unit in context?
//   decision          - what was concluded, and was it accepted?
//
// A matcher hit never advances semanticReading or decision. Publication is a
// fifth, separate gate that this build cannot satisfy: no human approval exists.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const ATLAS = join(ROOT, "intelligent-atlas");
const ANALYSIS = join(ATLAS, "analysis");
const DECISIONS_PATH = join(ATLAS, "semantic", "review-decisions.json");

const units = readFileSync(join(ANALYSIS, "units-analyzed.jsonl"), "utf8")
  .trim()
  .split(/\r?\n/)
  .map((line) => JSON.parse(line));
const decisionsDoc = JSON.parse(readFileSync(DECISIONS_PATH, "utf8"));
const graph = JSON.parse(readFileSync(join(ANALYSIS, "graph-build.json"), "utf8"));
const summary = JSON.parse(readFileSync(join(ANALYSIS, "analysis-summary.json"), "utf8"));
const sampleSelection = existsSync(join(ANALYSIS, "quality-sample-selection.json"))
  ? JSON.parse(readFileSync(join(ANALYSIS, "quality-sample-selection.json"), "utf8"))
  : { sample: [] };

const ELIGIBLE = new Set(["analyzed-mapped", "analyzed-unmapped"]);
const normalize = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

const errors = [];
const decisions = new Map();
for (const decision of decisionsDoc.decisions) {
  if (decisions.has(decision.unitId)) errors.push(`Duplicate decision for ${decision.unitId}`);
  decisions.set(decision.unitId, decision);
}

const unitById = new Map(units.map((unit) => [unit.unitId, unit]));

// --- integrity: every decision must resolve, and every quote must be verbatim.
for (const decision of decisionsDoc.decisions) {
  const unit = unitById.get(decision.unitId);
  if (!unit) {
    errors.push(`Decision references unknown unit ${decision.unitId}`);
    continue;
  }
  if (!ELIGIBLE.has(unit.semanticAnalysisState)) {
    errors.push(`Decision references ineligible unit ${decision.unitId}`);
  }
  if (!decision.evidenceQuote) {
    errors.push(`Decision ${decision.unitId} has no evidence quote`);
    continue;
  }
  if (!normalize(unit.text).includes(normalize(decision.evidenceQuote))) {
    errors.push(`Evidence quote for ${decision.unitId} is not a verbatim substring of the unit text`);
  }
  for (const hint of decision.relationHints ?? []) {
    for (const key of ["from", "to"]) {
      if (!graph.nodes.some((node) => node.id === hint[key])) {
        errors.push(`Relation hint for ${decision.unitId} references unknown concept ${hint[key]}`);
      }
    }
  }
}

// --- quality sample coverage: every sampled unit must have a real decision.
const sampleIds = new Set((sampleSelection.sample ?? []).map((entry) => entry.unitId));
const sampleMissing = [...sampleIds].filter((unitId) => !decisions.has(unitId));
if (sampleMissing.length) errors.push(`Quality sample units without a decision: ${sampleMissing.join(", ")}`);

if (errors.length) {
  console.error("Semantic ledger build failed:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

// --- ledger rows
const rows = [];
for (const unit of units) {
  const decision = decisions.get(unit.unitId);
  const eligible = ELIGIBLE.has(unit.semanticAnalysisState);
  const metadataOnly = unit.semanticAnalysisState === "excluded-metadata-only";
  const nonLearning = unit.semanticAnalysisState === "excluded-nonlearning";
  const candidates = (unit.conceptCandidates ?? []).map((candidate) => ({
    conceptId: candidate.conceptId,
    confidence: candidate.confidence,
    rank: candidate.rank,
    score: candidate.score,
  }));

  const candidateMatchState = metadataOnly || nonLearning
    ? "not-applicable"
    : candidates.length
      ? "matched"
      : "unmatched";

  const extractionState = metadataOnly ? "metadata-only" : nonLearning ? "non-learning" : "extracted";

  const semanticReading = decision
    ? {
        state: "read",
        scope: decision.scope,
        readBy: decisionsDoc.reviewer,
        readAt: decisionsDoc.generatedAt,
        parentContext: decision.parentContext,
        reading: decision.reading,
        essentialMeaning: decision.essentialMeaning,
        evidenceQuote: decision.evidenceQuote,
        evidenceVerified: true,
      }
    : {
        state: eligible ? "not-read" : "not-applicable",
        scope: null,
        readBy: null,
        readAt: null,
        reason: eligible
          ? "Not included in the documented vertical slice or the deterministic quality sample. Candidate matching is not semantic reading."
          : metadataOnly
            ? "Metadata-only record: bibliographic fields, no teachable body text."
            : "Excluded non-learning record.",
      };

  const decisionRecord = decision
    ? {
        state: decision.decision,
        code: decision.decisionCode,
        candidateVerdict: decision.candidateVerdict,
        concepts: decision.concepts,
        relationHints: decision.relationHints,
        rationale: decision.rationale,
        unresolved: decision.unresolved,
      }
    : {
        state: eligible ? "unreviewed" : "out-of-scope",
        code: eligible ? "awaiting-contextual-review" : metadataOnly ? "metadata-only" : "non-learning",
        candidateVerdict: eligible ? (candidates.length ? "unverified" : "unverified-unmatched") : "not-applicable",
        concepts: [],
        relationHints: [],
        rationale: eligible
          ? "No contextual decision has been recorded. The matcher's candidates remain unverified."
          : "Outside the semantic reading population.",
        unresolved: eligible
          ? ["Semantic reading not performed for this unit in this phase."]
          : [],
      };

  rows.push({
    schemaVersion: "intelligent-atlas-semantic-ledger/2.0",
    unitId: unit.unitId,
    sourceKind: unit.sourceKind,
    sourceFamily: unit.sourceFamily,
    sourcePath: unit.sourcePath,
    locator: unit.locator,
    canonicalHref: unit.canonicalHref,
    language: unit.language,
    revisionOrFingerprint: unit.revisionOrFingerprint,
    contentForms: unit.contentForms ?? [],
    extraction: {
      state: extractionState,
      textLength: (unit.text ?? "").length,
      title: unit.title ?? "",
    },
    candidateMatch: {
      state: candidateMatchState,
      candidateCount: candidates.length,
      candidates,
      unmappedReason: unit.unmappedReason ?? null,
    },
    semanticReading,
    decision: decisionRecord,
    publication: {
      state: "withheld",
      reason: "No human publication, scientific or rights review has approved this unit.",
    },
  });
}

writeFileSync(
  join(ANALYSIS, "semantic-ledger-v2.jsonl"),
  rows.map((row) => JSON.stringify(row)).join("\n") + "\n",
);

// --- summary
const count = (predicate) => rows.filter(predicate).length;
const eligibleRows = rows.filter((row) => ELIGIBLE.has(row.extraction.state === "extracted" ? "analyzed-mapped" : ""));
const eligibleCount = rows.filter((row) =>
  ["matched", "unmatched"].includes(row.candidateMatch.state),
).length;

const families = {};
for (const row of rows) {
  const family = row.sourceFamily;
  families[family] ??= {
    units: 0,
    eligible: 0,
    metadataOnly: 0,
    nonLearning: 0,
    matched: 0,
    unmatched: 0,
    read: 0,
    accepted: 0,
    revised: 0,
    held: 0,
    unresolvedGap: 0,
  };
  const entry = families[family];
  entry.units += 1;
  if (["matched", "unmatched"].includes(row.candidateMatch.state)) entry.eligible += 1;
  if (row.extraction.state === "metadata-only") entry.metadataOnly += 1;
  if (row.extraction.state === "non-learning") entry.nonLearning += 1;
  if (row.candidateMatch.state === "matched") entry.matched += 1;
  if (row.candidateMatch.state === "unmatched") entry.unmatched += 1;
  if (row.semanticReading.state === "read") entry.read += 1;
  if (row.decision.state === "accepted") entry.accepted += 1;
  if (row.decision.state === "revised") entry.revised += 1;
  if (row.decision.state === "held") entry.held += 1;
  if (row.decision.state === "unresolved-gap") entry.unresolvedGap += 1;
}

const readCount = count((row) => row.semanticReading.state === "read");
const report = {
  schemaVersion: "intelligent-atlas-semantic-ledger-summary/2.0",
  generatedAt: "2026-11-01",
  graphBuildId: graph.graphBuildId,
  ledgerFingerprint: createHash("sha256")
    .update(rows.map((row) => row.unitId).join("\u0000"))
    .digest("hex"),
  reviewer: decisionsDoc.reviewer,
  method: decisionsDoc.method,
  denominators: {
    units: rows.length,
    eligible: eligibleCount,
    metadataOnly: count((row) => row.extraction.state === "metadata-only"),
    nonLearning: count((row) => row.extraction.state === "non-learning"),
    uniqueCanonicalResources: new Set(rows.map((row) => row.canonicalHref).filter(Boolean)).size,
  },
  candidateMatch: {
    matched: count((row) => row.candidateMatch.state === "matched"),
    unmatched: count((row) => row.candidateMatch.state === "unmatched"),
    note: "Candidate matching is a lexical proposal state. It is not semantic reading and it is not a publication state.",
  },
  semanticReading: {
    read: readCount,
    notRead: eligibleCount - readCount,
    readShareOfEligible: Number((readCount / eligibleCount).toFixed(4)),
    readShareOfCorpus: Number((readCount / rows.length).toFixed(4)),
  },
  decisions: {
    accepted: count((row) => row.decision.state === "accepted"),
    revised: count((row) => row.decision.state === "revised"),
    held: count((row) => row.decision.state === "held"),
    unresolvedGap: count((row) => row.decision.state === "unresolved-gap"),
    unreviewed: count((row) => row.decision.state === "unreviewed"),
    outOfScope: count((row) => row.decision.state === "out-of-scope"),
  },
  candidateVerdicts: rows.reduce((counts, row) => {
    const verdict = row.decision.candidateVerdict;
    counts[verdict] = (counts[verdict] ?? 0) + 1;
    return counts;
  }, {}),
  publication: {
    published: 0,
    withheld: rows.length,
    note: "Zero units are published. Technical review by an agent is not human publication approval.",
  },
  qualitySample: {
    selected: sampleIds.size,
    decided: sampleIds.size - sampleMissing.length,
    method: sampleSelection.method ?? "not selected",
  },
  families,
  coverageClaims: [
    `Semantic reading was performed for ${readCount} of ${eligibleCount} eligible units (${(100 * readCount / eligibleCount).toFixed(2)}%).`,
    "This is a documented subset, not full semantic reading of the corpus.",
    "The 728 unmatched units were not excluded from review: the sample deliberately includes unmatched units and four prioritised unmatched decisions.",
    "No sampled slice is reported as full semantic reading.",
  ],
  limits: [
    "Agent technical review is not human publication, scientific or rights review.",
    "Candidate matching remains lexical; false positives are documented rather than silently repaired.",
    "Media, figures and rendered pages were not visually reviewed.",
    "Extraction defects found during review are recorded as unresolved gaps, not repaired by inference.",
  ],
};

writeFileSync(
  join(ANALYSIS, "semantic-ledger-summary.json"),
  JSON.stringify(report, null, 2) + "\n",
);

// --- markdown evidence
const decisionRows = decisionsDoc.decisions
  .map((decision) => {
    const unit = unitById.get(decision.unitId);
    const conceptLabels = decision.concepts
      .map((entry) => {
        const node = graph.nodes.find((candidate) => candidate.id === entry.conceptId);
        return `${node?.label ?? entry.conceptId} (${entry.role})`;
      })
      .join("; ");
    return `| \`${decision.unitId}\` | ${unit?.sourceFamily ?? "?"} | ${decision.decision} | ${decision.candidateVerdict} | ${conceptLabels || "—"} | ${decision.decisionCode} |`;
  })
  .join("\n");

const gapRows = decisionsDoc.decisions
  .filter((decision) => decision.unresolved.length)
  .flatMap((decision) =>
    decision.unresolved.map((gap) => `| \`${decision.unitId}\` | ${gap} |`),
  )
  .join("\n");

const familyRows = Object.entries(families)
  .sort((a, b) => b[1].units - a[1].units)
  .map(
    ([family, entry]) =>
      `| ${family} | ${entry.units} | ${entry.eligible} | ${entry.matched} | ${entry.unmatched} | ${entry.read} | ${entry.accepted} | ${entry.revised} | ${entry.held} | ${entry.unresolvedGap} |`,
  )
  .join("\n");

const md = `# Semantic ledger v2 — 2026-11-01

Reviewer: ${decisionsDoc.reviewer}

${decisionsDoc.method}

## Separate states

| State | Count |
|---|---:|
| Units extracted | ${report.denominators.units} |
| Eligible for semantic reading | ${report.denominators.eligible} |
| Metadata-only | ${report.denominators.metadataOnly} |
| Non-learning | ${report.denominators.nonLearning} |
| Candidate matched | ${report.candidateMatch.matched} |
| Candidate unmatched | ${report.candidateMatch.unmatched} |
| **Semantically read** | **${report.semanticReading.read}** |
| Not read | ${report.semanticReading.notRead} |
| Published | ${report.publication.published} |

Semantic reading covers **${(100 * report.semanticReading.readShareOfEligible).toFixed(2)}%** of eligible units. That is a documented subset, not full corpus reading. Candidate matching never advances the reading or decision state.

## Decisions

| Decision | Count |
|---|---:|
| Accepted | ${report.decisions.accepted} |
| Revised | ${report.decisions.revised} |
| Held | ${report.decisions.held} |
| Unresolved gap | ${report.decisions.unresolvedGap} |
| Unreviewed | ${report.decisions.unreviewed} |
| Out of scope | ${report.decisions.outOfScope} |

## Family ledger

| Family | Units | Eligible | Matched | Unmatched | Read | Accepted | Revised | Held | Gap |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${familyRows}

## Unit decisions

| Unit | Family | Decision | Candidate verdict | Concepts | Code |
|---|---|---|---|---|---|
${decisionRows}

## Recorded gaps

| Unit | Gap |
|---|---|
${gapRows}

## Limits

${report.limits.map((limit) => `- ${limit}`).join("\n")}
`;
writeFileSync(join(ANALYSIS, "semantic-ledger-v2.md"), md);

console.log(
  JSON.stringify(
    {
      ledger: "intelligent-atlas/analysis/semantic-ledger-v2.jsonl",
      rows: rows.length,
      eligible: report.denominators.eligible,
      read: report.semanticReading.read,
      readShareOfEligible: report.semanticReading.readShareOfEligible,
      decisions: report.decisions,
      published: report.publication.published,
      qualitySample: report.qualitySample,
    },
    null,
    2,
  ),
);
