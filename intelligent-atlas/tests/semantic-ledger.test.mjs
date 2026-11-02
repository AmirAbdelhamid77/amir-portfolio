// D02-D05: separate ledger states and honest coverage.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ledger = readFileSync("intelligent-atlas/analysis/semantic-ledger-v2.jsonl", "utf8")
  .trim()
  .split(/\r?\n/)
  .map((line) => JSON.parse(line));
const summary = JSON.parse(readFileSync("intelligent-atlas/analysis/semantic-ledger-summary.json", "utf8"));
const sample = JSON.parse(readFileSync("intelligent-atlas/analysis/quality-sample-selection.json", "utf8"));
const units = new Map(
  readFileSync("intelligent-atlas/analysis/units-analyzed.jsonl", "utf8")
    .trim()
    .split(/\r?\n/)
    .map((line) => JSON.parse(line))
    .map((unit) => [unit.unitId, unit]),
);

test("D02: every ledger row carries four independent states", () => {
  for (const row of ledger) {
    assert.ok(row.extraction?.state, `${row.unitId} missing extraction state`);
    assert.ok(row.candidateMatch?.state, `${row.unitId} missing candidateMatch state`);
    assert.ok(row.semanticReading?.state, `${row.unitId} missing semanticReading state`);
    assert.ok(row.decision?.state, `${row.unitId} missing decision state`);
    assert.equal(row.publication.state, "withheld");
  }
});

test("D02: a matcher hit never promotes reading or decision", () => {
  const matchedNotRead = ledger.filter(
    (row) => row.candidateMatch.state === "matched" && row.semanticReading.state === "not-read",
  );
  assert.ok(matchedNotRead.length > 0, "expected matched-but-unread units to exist");
  for (const row of matchedNotRead) {
    assert.equal(row.decision.state, "unreviewed");
    assert.equal(row.decision.candidateVerdict, "unverified");
  }
});

test("D02: the SQL 'select all that apply' false positive is recorded, not repaired silently", () => {
  const row = ledger.find((entry) => entry.unitId === "exam:sql:sql-09");
  assert.ok(row);
  assert.equal(row.decision.candidateVerdict, "false-positive");
  assert.equal(row.decision.state, "held");
  assert.deepEqual(row.decision.concepts, []);
});

test("D02: a misconception prompt is not converted into a claim", () => {
  const row = ledger.find((entry) => entry.unitId === "exam:fundamentals:fun-06");
  assert.equal(row.decision.code, "misconception-prompt-not-claim");
  assert.deepEqual(row.decision.concepts, []);
});

test("D03: formula fragments without parent context stay unresolved", () => {
  for (const unitId of ["stats-formula:21", "stats-formula:98"]) {
    const row = ledger.find((entry) => entry.unitId === unitId);
    assert.equal(row.semanticReading.state, "read");
    assert.equal(row.decision.state, "unresolved-gap");
    assert.equal(row.decision.concepts.length, 0);
  }
});

test("D03: procedural labs with missing steps are a recorded gap", () => {
  const row = ledger.find(
    (entry) => entry.unitId === "lab:hands-on-exp-0028-create-reusable-power-bi-assets",
  );
  assert.equal(row.decision.code, "procedural-steps-not-extracted");
});

test("D04: unmatched units received contextual decisions", () => {
  const unmatchedRead = ledger.filter(
    (row) => row.candidateMatch.state === "unmatched" && row.semanticReading.state === "read",
  );
  assert.ok(unmatchedRead.length >= 4, `expected at least 4 unmatched read units, got ${unmatchedRead.length}`);
  for (const row of unmatchedRead) {
    assert.notEqual(row.decision.state, "unreviewed");
  }
});

test("D04: every selected sample unit has a real decision", () => {
  const byId = new Map(ledger.map((row) => [row.unitId, row]));
  for (const entry of sample.sample) {
    const row = byId.get(entry.unitId);
    assert.ok(row, `sample unit ${entry.unitId} missing from ledger`);
    assert.equal(row.semanticReading.state, "read", `sample unit ${entry.unitId} was not read`);
    assert.notEqual(row.decision.state, "unreviewed");
  }
  assert.equal(sample.sample.length, summary.qualitySample.decided);
});

test("D05: essential-meaning-in-media units are held, not asserted", () => {
  const row = ledger.find((entry) => entry.unitId === "dv:visual-atlas#i-dual-axis-vs-small-multiples");
  assert.equal(row.semanticReading.essentialMeaning, "figure");
  assert.equal(row.decision.state, "held");
  assert.match(row.decision.rationale, /figure|media|image/i);
});

test("evidence quotes are verbatim substrings of the unit text", () => {
  const normalize = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
  for (const row of ledger) {
    if (row.semanticReading.state !== "read") continue;
    const unit = units.get(row.unitId);
    assert.ok(unit, `unit ${row.unitId} missing`);
    assert.ok(
      normalize(unit.text).includes(normalize(row.semanticReading.evidenceQuote)),
      `quote not verbatim for ${row.unitId}`,
    );
  }
});

test("no unit is published", () => {
  assert.equal(summary.publication.published, 0);
  assert.equal(ledger.filter((row) => row.publication.state === "published").length, 0);
});

test("coverage is reported as a subset, never as full corpus reading", () => {
  assert.ok(summary.semanticReading.read < summary.denominators.eligible);
  assert.ok(summary.semanticReading.readShareOfEligible < 1);
  assert.match(summary.coverageClaims.join(" "), /documented subset/i);
  assert.match(summary.coverageClaims.join(" "), /not full semantic reading/i);
});

test("revision overlays are not counted as new eligible questions", () => {
  const overlays = ledger.filter((row) => (row.contentForms ?? []).includes("revision-overlay"));
  assert.ok(overlays.length > 0);
  for (const row of overlays) {
    assert.ok(row.extraction.state === "extracted");
  }
  const family = summary.families["fabric-r11"];
  assert.equal(family.units, overlays.length);
});
