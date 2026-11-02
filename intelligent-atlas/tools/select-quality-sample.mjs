// Deterministic stratified sample selection for contextual review.
// Prints a compact packet; decisions are recorded separately by the agent.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const units = readFileSync("intelligent-atlas/analysis/units-analyzed.jsonl", "utf8")
  .trim()
  .split(/\r?\n/)
  .map((line) => JSON.parse(line))
  .filter((unit) => ["analyzed-mapped", "analyzed-unmapped"].includes(unit.semanticAnalysisState));

const hash = (value) => createHash("sha256").update(value).digest("hex");
const ordered = [...units].sort((a, b) => hash(a.unitId).localeCompare(hash(b.unitId)));
const picked = new Set();
const sample = [];
function pick(stratum, predicate, count = 1) {
  for (const unit of ordered) {
    if (sample.filter((entry) => entry.stratum === stratum).length >= count) break;
    if (picked.has(unit.unitId) || !predicate(unit)) continue;
    picked.add(unit.unitId);
    sample.push({
      stratum,
      unitId: unit.unitId,
      family: unit.sourceFamily,
      state: unit.semanticAnalysisState,
      reason: unit.unmappedReason ?? "",
      language: unit.language,
      forms: unit.contentForms,
      title: unit.title,
      text: (unit.text ?? "").replace(/\s+/g, " ").slice(0, 900),
      candidates: (unit.conceptCandidates ?? []).map((candidate) => ({
        conceptId: candidate.conceptId,
        confidence: candidate.confidence,
      })),
    });
  }
}

for (const domain of ["fabric", "sql", "statistics", "visualization", "analysis"]) {
  pick(`domain:${domain}`, (unit) => (unit.subjectPlacements ?? []).includes(domain));
}
for (const language of ["en", "ar", "mixed"]) {
  pick(`language:${language}`, (unit) => unit.language === language);
}
for (const form of ["question-stem", "lesson-section", "formula", "lab-steps", "note", "figure"]) {
  pick(`form:${form}`, (unit) => (unit.contentForms ?? []).includes(form));
}
pick("matched", (unit) => unit.semanticAnalysisState === "analyzed-mapped");
pick("unmatched", (unit) => unit.semanticAnalysisState === "analyzed-unmapped");
pick("unmatched-prioritized", (unit) => unit.semanticAnalysisState === "analyzed-unmapped", 4);
pick("high-risk-prerequisite", (unit) => (unit.relationCandidates ?? []).some((relation) => relation.relationType === "requires_understanding_of"));
pick("cross-domain", (unit) => (unit.subjectPlacements ?? []).length > 1);
pick("link-only", (unit) => unit.semanticAnalysisState === "excluded-metadata-only");

writeFileSync("intelligent-atlas/analysis/quality-sample-selection.json", JSON.stringify({
  schemaVersion: "intelligent-atlas-quality-sample-selection/1.0",
  generatedAt: "2026-11-01",
  method: "Deterministic SHA-256 ordering of eligible unit IDs, stratified by domain, language, content form, matched/unmatched state, prerequisite risk and cross-domain placement.",
  population: units.length,
  sampleSize: sample.length,
  sample,
}, null, 2) + "\n");

for (const entry of sample) {
  console.log(`===== ${entry.stratum} | ${entry.unitId} | ${entry.family} | ${entry.state} | ${entry.reason} | ${entry.language} | ${entry.forms.join(",")}`);
  console.log(`title: ${entry.title}`);
  console.log(`text: ${entry.text.slice(0, 500)}`);
  console.log(`candidates: ${entry.candidates.map((candidate) => `${candidate.conceptId}:${candidate.confidence}`).join(", ")}`);
}
console.log(`\n${sample.length} units selected; wrote intelligent-atlas/analysis/quality-sample-selection.json`);
