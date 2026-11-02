import test from "node:test";
import assert from "node:assert/strict";

import {
  buildDeckRequest,
  contractSemanticErrors,
  loadPayloads,
  runAdapterProof,
  simulateDealer,
  validateAgainstSchema,
  validateDeckRequest,
} from "./adapter-proof.mjs";

test("adapter proof passes end to end", () => {
  const result = runAdapterProof();
  assert.equal(result.ok, true);
  assert.equal(result.checks.length, 26);
  assert.equal(result.requestErrors.length, 0);
  assert.equal(result.request.publicEligible, false);
  assert.equal(result.request.adapter.developmentOnly, true);
  assert.equal(result.request.editions.length, 3);
  assert.deepEqual(
    result.request.editions.map((edition) => edition.cards.length),
    [1, 1, 1],
  );
});

test("DeckRequest validates against the contract schema", () => {
  const { payload, schema } = loadPayloads();
  const request = buildDeckRequest(payload, { date: "2026-10-26" });
  assert.deepEqual(validateDeckRequest(request, schema), []);
  assert.equal(request.requestId, "deck:onelake:2026-10-26");
  assert.deepEqual(request.editionDates, [
    "2026-10-24",
    "2026-10-25",
    "2026-10-26",
  ]);
  assert.equal(request.returnContext.origin, "adapter-proof");
  assert.equal(request.returnContext.view, "card");
});

test("every edition is single-card and every card keeps its locator", () => {
  const { payload } = loadPayloads();
  const request = buildDeckRequest(payload, { date: "2026-10-26" });
  for (const edition of request.editions) {
    assert.equal(edition.cardCount, 1);
    assert.equal(edition.cards.length, 1);
    const [card] = edition.cards;
    assert.equal(card.editionDate, edition.date);
    assert.equal(card.conceptId, "concept:fabric:shortcut");
    assert.ok(card.evidence.locator.length > 0);
    assert.deepEqual(card.questionIds, []);
  }
});

test("invalid requests are rejected by schema and semantics", () => {
  const { payload, schema } = loadPayloads();
  const request = buildDeckRequest(payload, { date: "2026-10-26" });

  const twoCards = structuredClone(request);
  twoCards.editions[0].cards.push(structuredClone(twoCards.editions[0].cards[0]));
  twoCards.editions[0].cardCount = 2;
  assert.ok(validateDeckRequest(twoCards, schema).length > 0);

  const publicCandidate = structuredClone(request);
  publicCandidate.publicEligible = true;
  assert.ok(contractSemanticErrors(publicCandidate).length > 0);

  const badGate = structuredClone(request);
  badGate.gates.scientificReview = "unknown";
  assert.ok(validateDeckRequest(badGate, schema).length > 0);

  const extraField = structuredClone(request);
  extraField.published = true;
  assert.ok(validateDeckRequest(extraField, schema).length > 0);

  const badReturn = structuredClone(request);
  badReturn.returnContext = null;
  assert.deepEqual(validateDeckRequest(badReturn, schema), []);
});

test("Dealer state machine preserves per-edition reader state", () => {
  const { payload } = loadPayloads();
  const request = buildDeckRequest(payload, { date: "2026-10-26" });
  const { states, events } = simulateDealer(request);

  assert.equal(states.length, 10);
  assert.deepEqual(
    events.map((event) => event.type),
    [
      "dealer.opened",
      "evidence.opened",
      "edition.changed",
      "edition.changed",
      "view.changed",
      "view.changed",
      "dealer.closed",
      "return.requested",
      "dealer.opened",
      "dealer.closed",
    ],
  );

  const reopened = states[4];
  assert.equal(reopened.editionDate, "2026-10-26");
  assert.equal(reopened.view, "evidence");

  const returned = states[8];
  assert.equal(returned.open, true);
  assert.equal(returned.editionDate, "2026-10-26");
  assert.equal(returned.view, "card");
});

test("public projection is fail-closed", () => {
  const { publicPayload, payload } = loadPayloads();
  const projection = publicPayload.publicProjection;
  assert.deepEqual(projection.publishedConcepts, []);
  assert.deepEqual(projection.publishedMappings, []);
  assert.deepEqual(projection.publishedAssertions, []);
  assert.equal(projection.withheld.conceptCount, 132);
  assert.equal(projection.withheld.assertionCount, 86);
  assert.equal(payload.publicEligible, false);
  assert.ok(payload.concepts.every((concept) => concept.reviewState !== "published"));
  assert.ok(payload.edges.every((edge) => edge.reviewState !== "published"));
});

test("schema validator handles oneOf, pattern, const and additional properties", () => {
  const { schema } = loadPayloads();

  assert.deepEqual(
    validateAgainstSchema(null, schema.$defs.ReturnContext, schema),
    ["$: expected object"],
  );
  assert.deepEqual(
    validateAgainstSchema(
      null,
      { oneOf: [{ $ref: "#/$defs/ReturnContext" }, { type: "null" }] },
      schema,
    ),
    [],
  );
  assert.deepEqual(
    validateAgainstSchema(
      42,
      { oneOf: [{ $ref: "#/$defs/ReturnContext" }, { type: "null" }] },
      schema,
    ),
    ["$: oneOf matched 0 branches"],
  );
  assert.deepEqual(
    validateAgainstSchema(
      { date: "26-10-2026" },
      schema.$defs.ReturnContext,
      schema,
    ).length > 0,
    true,
  );
  assert.deepEqual(
    validateAgainstSchema(
      { date: "2026-10-26", cards: [], cardCount: 2 },
      schema.$defs.Edition,
      schema,
    ).length > 0,
    true,
  );
});
