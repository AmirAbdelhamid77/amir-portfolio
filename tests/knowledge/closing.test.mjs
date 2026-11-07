// Guards for the review closing scene (R5).
//
// The close is allowed to make four claims: the selected edition's reviewed
// takeaway verbatim, one action that reopens it, the cards this browser kept,
// and a coverage ledger whose numbers are pinned to the semantic ledger. These
// tests hold those claims still, including the day the ledger drifts.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  CORPUS_COVERAGE,
  COVERAGE_LIMITS,
  closingAction,
  closingClaims,
  closingIdea,
  closingNotice,
  coverageDecisions,
  coverageDenominators,
  coverageLedger,
  coverageNote,
} from "../../lib/knowledge/closing.ts";
import { buildStageModel } from "../../lib/knowledge/stage-model.ts";

const root = new URL("../../", import.meta.url);
const feed = JSON.parse(readFileSync(new URL("content/knowledge/insights.json", root), "utf8"));
const ledger = JSON.parse(
  readFileSync(new URL("intelligent-atlas/analysis/semantic-ledger-summary.json", root), "utf8"),
);
const items = feed.items;
const selected = items.find((item) => item.id === "hansa-insight-shortcut-reference-v1");

const graph = {
  notice: "reviewed public graph is not published",
  concepts: [
    { editorialState: "technical_review" },
    { editorialState: "technical_review" },
  ],
  semanticEdges: [{ editorialState: "technical_review" }],
};

const model = buildStageModel({
  items,
  graph,
  audience: "review",
  today: "2026-10-26",
});

test("the pinned corpus coverage is still the ledger on disk", () => {
  assert.equal(CORPUS_COVERAGE.generatedAt, ledger.generatedAt);
  assert.equal(CORPUS_COVERAGE.units, ledger.denominators.units);
  assert.equal(CORPUS_COVERAGE.eligible, ledger.denominators.eligible);
  assert.equal(CORPUS_COVERAGE.metadataOnly, ledger.denominators.metadataOnly);
  assert.equal(CORPUS_COVERAGE.nonLearning, ledger.denominators.nonLearning);
  assert.equal(CORPUS_COVERAGE.uniqueResources, ledger.denominators.uniqueCanonicalResources);
  assert.equal(CORPUS_COVERAGE.read, ledger.semanticReading.read);
  assert.equal(CORPUS_COVERAGE.notRead, ledger.semanticReading.notRead);
  assert.equal(CORPUS_COVERAGE.readShareOfEligible, ledger.semanticReading.readShareOfEligible);
  assert.equal(CORPUS_COVERAGE.published, ledger.publication.published);
  assert.equal(CORPUS_COVERAGE.withheld, ledger.publication.withheld);
  assert.deepEqual(CORPUS_COVERAGE.decisions, ledger.decisions);
  assert.equal(CORPUS_COVERAGE.fingerprint, ledger.ledgerFingerprint);
});

test("the one idea is the edition's reviewed takeaway, quoted verbatim", () => {
  const idea = closingIdea(selected);
  assert.ok(idea);
  assert.equal(idea.quote, selected.takeaway);
  assert.equal(idea.cardTitle, selected.cardTitle);
  assert.equal(idea.topic, selected.topic);
  assert.equal(idea.day, "MON 26 OCT");
  assert.equal(idea.caveat, selected.caveat);
  assert.equal(idea.sourceId, selected.sourceId);
  assert.equal(closingIdea(null), null);
});

test("the one action reopens the selected edition by day, with a real fallback", () => {
  assert.deepEqual(closingAction(selected, model), {
    editionId: selected.id,
    label: "Reopen the 26 Oct edition",
  });
  const older = items.find((item) => item.id === "hansa-insight-shortcut-delete-v1");
  assert.equal(closingAction(older, model).label, "Reopen the 25 Oct edition");

  const empty = buildStageModel({
    items: [],
    graph: { notice: "", concepts: [], semanticEdges: [] },
    audience: "review",
    today: "2026-10-26",
  });
  assert.deepEqual(closingAction(null, empty), {
    editionId: null,
    label: "Browse the timeline",
  });
});

test("the ledger reports the stage's own numbers, not a copy", () => {
  const rows = coverageLedger(model);
  const byId = Object.fromEntries(rows.map((row) => [row.id, row]));
  assert.equal(byId.editions.value, String(model.timeline.editions.length));
  assert.equal(byId["published-editions"].value, "0");
  assert.equal(byId["published-concepts"].value, String(model.graph.publishedConcepts));
  assert.equal(byId["published-connections"].value, String(model.graph.publishedEdges));

  const published = {
    ...model,
    timeline: {
      ...model.timeline,
      editions: model.timeline.editions.map((edition, index) => ({
        ...edition,
        reviewStatus: index === 0 ? "published" : edition.reviewStatus,
      })),
    },
    graph: { ...model.graph, publishedConcepts: 2, publishedEdges: 3 },
  };
  const publishedRows = Object.fromEntries(
    coverageLedger(published).map((row) => [row.id, row]),
  );
  assert.equal(publishedRows["published-editions"].value, "1");
  assert.equal(publishedRows["published-concepts"].value, "2");
  assert.equal(publishedRows["published-connections"].value, "3");
});

test("the corpus rows are the pinned read/eligible counts and never negative", () => {
  const rows = coverageLedger(model);
  const byId = Object.fromEntries(rows.map((row) => [row.id, row]));
  assert.equal(byId["units-read"].value, "109 / 4,337");
  assert.equal(byId["units-read"].note, "2.51%");
  assert.equal(byId["units-unreviewed"].value, "4,228");
  assert.equal(byId["unique-resources"].value, "4,925");
  for (const row of rows) {
    assert.ok(row.label.length > 0 && row.value.length > 0, `empty ledger row ${row.id}`);
    assert.doesNotMatch(row.value, /^-/);
  }
});

test("the ledger note names the subset and warns about denominators", () => {
  const note = coverageNote();
  assert.match(note, /109 of 4,337 eligible units/);
  assert.match(note, /2\.51%/);
  assert.match(note, /4,228 remain unreviewed/);
  assert.match(note, /Denominators are not interchangeable/);
  assert.match(note, /a unit is not a resource/);
});

test("the full coverage note repeats the ledger's denominators and decisions", () => {
  assert.deepEqual(
    coverageDenominators().map((row) => row.value),
    ["6,201", "4,337", "1,859", "5", "4,925"],
  );
  assert.deepEqual(
    coverageDecisions().map((row) => row.value),
    ["10", "64", "24", "11", "4,228", "1,864"],
  );
  assert.deepEqual(
    ledger.decisions,
    CORPUS_COVERAGE.decisions,
    "the pinned decisions drifted from the ledger",
  );
});

test("the limits are the ledger's own four limits, not a paraphrase", () => {
  assert.equal(COVERAGE_LIMITS.length, 4);
  assert.deepEqual([...COVERAGE_LIMITS], ledger.limits);
});

test("the four claims keep publication, coverage and review separate", () => {
  const claims = closingClaims();
  assert.equal(claims.length, 4);
  assert.match(claims[0], /No concept, connection or edition .* is published/);
  assert.match(claims[1], /2\.51% of eligible units, not the whole corpus/);
  assert.match(claims[2], /not visually reviewed/);
  assert.match(claims[3], /technical review is not human/);
});

test("the posture states publication honestly for each review state", () => {
  assert.match(closingNotice(model), /Nothing on this stage is published/);
  const published = {
    ...model,
    review: { ...model.review, status: "published" },
  };
  assert.match(closingNotice(published), /are published, with their sources/);
});
