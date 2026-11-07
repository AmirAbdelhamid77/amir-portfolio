// Guards for the R4 dealer hand.
//
// The dealer is a reading surface, so these tests pin the things that would
// quietly change what it says: which cards exist, what each card claims it can
// do, which edition fields the reader repeats, that a technical-review edition
// is never labelled published, that a shared `?dealer=` link cannot open an
// edition the stage withheld, and that local bookmarks fail closed.
import test from "node:test";
import assert from "node:assert/strict";

import {
  DEALER_CAPABILITIES,
  SAVED_LIMIT,
  capabilityRow,
  checkedLabel,
  closedDealerQuery,
  dealPlan,
  dealerHand,
  dealerQuery,
  dealerRail,
  nextCardId,
  parseDealerEdition,
  parseSavedCards,
  savedCardsForEdition,
  savedGroups,
  toggleSavedCard,
} from "../../lib/knowledge/dealer-hand.ts";

const insight = {
  id: "hansa-insight-shortcut-reference-v1",
  date: "2026-10-26",
  topic: "OneLake",
  title: "A reference is a design decision.",
  scenario: "Two teams need to read the same existing Delta table.",
  prediction: "Think about the source of truth and whether a second copy is required.",
  takeaway: "Investigate an internal OneLake shortcut instead of a second copy pipeline.",
  caveat: "A shortcut alone is not a retained, transformed snapshot.",
  cardTitle: "Reference ≠ retained result",
  conceptId: "concept:fabric:shortcut",
  lessonHref: "/learn/dp-600/ingestion/",
  practiceHref: "/lab/dp-600/explore/",
  sourceId: "ms-onelake-shortcuts",
  sourceUrl: "https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts",
  sourceLocator: "What are shortcuts?; Internal OneLake shortcuts; Caching",
  checkedAt: "2026-10-26",
  reviewStatus: "technical_review",
  reviewer: "agent-source-check; human pending",
  questionIds: [],
};

const editions = [
  {
    id: insight.id,
    date: "2026-10-26",
    dayLabel: "MON 26 OCT",
    topic: "OneLake",
    title: insight.title,
    reviewStatus: "technical_review",
    conceptId: insight.conceptId,
    lessonHref: insight.lessonHref,
    practiceHref: insight.practiceHref,
  },
  {
    id: "hansa-insight-shortcut-delete-v1",
    date: "2026-10-25",
    dayLabel: "SUN 25 OCT",
    topic: "OneLake",
    title: "Name the object you are deleting.",
    reviewStatus: "technical_review",
    conceptId: "concept:fabric:shortcut",
    lessonHref: "/learn/dp-600/ingestion/",
    practiceHref: "/lab/dp-600/explore/",
  },
];

const days = Array.from({ length: 15 }, (_, offset) => {
  const edition = editions.find((entry) => entry.date === dayKey(offset));
  return {
    date: dayKey(offset),
    dayLabel: `DAY ${String(26 - offset).padStart(2, "0")} OCT`,
    isToday: offset === 0,
    editionId: edition?.id ?? null,
    editionTitle: edition?.title ?? null,
    reviewStatus: edition?.reviewStatus ?? null,
  };
});

function dayKey(offset) {
  const date = new Date(Date.UTC(2026, 9, 26 - offset));
  return date.toISOString().slice(0, 10);
}

test("the hand is the whole edition: principle, caveat and evidence in identity order", () => {
  const hand = dealerHand(insight);
  assert.deepEqual(
    hand.map((card) => card.kind),
    ["principle", "caveat", "evidence"],
  );
  assert.equal(hand[0].title, insight.cardTitle);
  assert.equal(hand[1].title, "What this does not mean");
  assert.equal(hand[2].title, "Source check");
});

test("each card states only the capabilities its kind can honour", () => {
  const hand = dealerHand(insight);
  const read = (kind) => hand.find((card) => card.kind === kind).capabilities;
  assert.deepEqual(read("principle"), {
    discover: false,
    read: true,
    assess: false,
    relate: true,
  });
  assert.deepEqual(read("caveat"), {
    discover: false,
    read: true,
    assess: true,
    relate: false,
  });
  assert.deepEqual(read("evidence"), {
    discover: true,
    read: true,
    assess: false,
    relate: false,
  });
  // The hand as a whole offers all four, which is what the header claims.
  assert.deepEqual(
    capabilityRow(hand).filter((entry) => entry.on).map((entry) => entry.id),
    [...DEALER_CAPABILITIES],
  );
});

test("the reader repeats the edition's own fields and adds no claim", () => {
  const hand = dealerHand(insight);
  const principle = hand[0].fields.map((field) => field.value);
  assert.deepEqual(principle, [insight.takeaway, insight.prediction]);

  const caveat = hand[1].fields.map((field) => field.value);
  assert.equal(caveat[0], insight.caveat);
  assert.match(caveat[1], /simplified version is the one that misleads/);

  const evidence = hand[2];
  assert.equal(evidence.evidence.quote, insight.sourceLocator);
  assert.equal(evidence.fields[0].value, checkedLabel(insight.checkedAt));
  assert.equal(evidence.fields[1].value, insight.reviewer);
  assert.equal(evidence.fields[2].value, insight.sourceId);
});

test("technical review is never labelled as published", () => {
  const hand = dealerHand(insight);
  for (const card of hand) {
    assert.equal(card.reviewLabel, "Technical review");
    assert.equal(card.reviewState, "technical_review");
    assert.doesNotMatch(card.reviewLabel, /published/i);
  }
  assert.equal(
    dealerHand({ ...insight, reviewStatus: "published" })[0].reviewLabel,
    "Published",
  );
});

test("the rail is the fifteen-day clock with quiet days as placeholders", () => {
  const rail = dealerRail(days, editions[0].id);
  assert.equal(rail.length, 15);
  assert.equal(rail.filter((day) => day.selectable).length, 2);
  assert.deepEqual(
    rail.filter((day) => day.isCurrent).map((day) => day.editionId),
    [editions[0].id],
  );
  assert.ok(rail.every((day) => day.selectable === Boolean(day.editionId)));
  assert.equal(rail[0].dayNumber, "26");
  assert.equal(rail[0].isToday, true);
  assert.equal(rail[1].selectable, true);
  assert.equal(rail[2].selectable, false);
});

test("a shared deck link resolves only editions the stage may show", () => {
  assert.equal(parseDealerEdition(editions[0].id, editions), editions[0].id);
  assert.equal(
    parseDealerEdition("daily:2026-10-25", editions),
    "hansa-insight-shortcut-delete-v1",
  );
  assert.equal(parseDealerEdition("daily:2026-10-01", editions), null);
  assert.equal(parseDealerEdition("hansa-insight-unknown-v1", editions), null);
  assert.equal(parseDealerEdition("../admin", editions), null);
  assert.equal(parseDealerEdition("", editions), null);
  assert.equal(parseDealerEdition(null, editions), null);
});

test("dealer URLs keep unrelated state and close without losing the edition", () => {
  const opened = dealerQuery("?insight=a&theme=dark", editions[0].id);
  assert.equal(opened, `?insight=${editions[0].id}&theme=dark&dealer=${editions[0].id}`);
  assert.equal(closedDealerQuery(opened), `?insight=${editions[0].id}&theme=dark`);
  assert.equal(closedDealerQuery("?dealer=x"), "");
});

test("local bookmarks fail closed, dedupe and cap", () => {
  const valid = `${insight.id}::principle`;
  assert.deepEqual(parseSavedCards(null), []);
  assert.deepEqual(parseSavedCards("{not json"), []);
  assert.deepEqual(parseSavedCards(JSON.stringify({ a: 1 })), []);
  assert.deepEqual(
    parseSavedCards(JSON.stringify([valid, valid, "javascript:alert(1)", `${insight.id}::unknown`])),
    [valid],
  );
  const many = Array.from({ length: 40 }, (_, index) => `hansa-insight-x${index}-v1::principle`);
  assert.equal(parseSavedCards(JSON.stringify(many)).length, SAVED_LIMIT);
});

test("saving is a toggle and a saved card belongs to its edition", () => {
  const principle = `${insight.id}::principle`;
  const caveat = `${insight.id}::caveat`;
  const saved = toggleSavedCard([], principle);
  assert.deepEqual(saved, [principle]);
  assert.deepEqual(toggleSavedCard(saved, principle), []);
  assert.deepEqual(toggleSavedCard([principle], caveat), [caveat, principle]);
  assert.deepEqual(toggleSavedCard([], "not-a-card"), []);
  assert.deepEqual(savedCardsForEdition([caveat, principle], insight.id), [caveat, principle]);
  assert.deepEqual(savedCardsForEdition([principle], "hansa-insight-other-v1"), []);
});

test("saved entries resolve against the visible editions and drop stale ids", () => {
  const principle = `${insight.id}::principle`;
  const groups = savedGroups(
    [principle, "hansa-insight-missing-v1::caveat", `${insight.id}::nonsense`],
    [insight],
  );
  assert.equal(groups.length, 1);
  assert.equal(groups[0].title, insight.cardTitle);
  assert.equal(groups[0].editionId, insight.id);
  assert.equal(groups[0].day, "MON 26 OCT");
});

test("the deal entrance is deterministic, tilted and capped", () => {
  const plan = dealPlan(3);
  assert.deepEqual(plan.map((step) => step.index), [0, 1, 2]);
  assert.deepEqual(plan.map((step) => step.delayMs), [0, 70, 140]);
  assert.ok(plan[0].rotate < 0 && plan[1].rotate > 0);
  assert.ok(plan[2].lift > plan[0].lift);
  assert.equal(dealPlan(20).length, 8);
  assert.equal(dealPlan(20).at(-1).delayMs, 280);
  assert.deepEqual(dealPlan(0), []);
});

test("next card cycles through the hand and never returns null for a non-empty hand", () => {
  const hand = dealerHand(insight);
  assert.equal(nextCardId(hand, hand[0].id), hand[1].id);
  assert.equal(nextCardId(hand, hand[2].id), hand[0].id);
  assert.equal(nextCardId(hand, null), hand[0].id);
  assert.equal(nextCardId([], null), null);
});
