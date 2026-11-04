// Guards for the public stage model (M6 boundary).
//
// These tests use the real reviewed feed and the real Atlas projection, and they
// assert the boundary itself: which audience sees which edition, that the clock
// never borrows another day's card, and that the public model carries counts and
// destinations instead of candidate claims.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import feed from "../../content/knowledge/insights.json" with { type: "json" };
import {
  buildStageModel,
  dayKey,
  dayLabel,
  stageDestinations,
  TIMELINE_SPAN_DAYS,
} from "../../lib/knowledge/stage-model.ts";

const items = feed.items;
const REVIEW_TODAY = "2026-10-26";
const AFTER_EDITIONS = "2026-11-04";

// The public projection as `lib/atlas/server.ts` builds it: fail-closed, so no
// technical-review concept or edge is present.
function graph(state, conceptCount, edgeCount) {
  return {
    notice: "The reviewed public graph is not yet published. Normal lessons and practice remain available.",
    concepts: Array.from({ length: conceptCount }, () => ({ editorialState: state })),
    semanticEdges: Array.from({ length: edgeCount }, () => ({ editorialState: state })),
  };
}

const publicGraph = graph("published", 0, 0);
const reviewGraph = graph("technical_review", 132, 86);

const publicModel = buildStageModel({
  items,
  graph: publicGraph,
  audience: "public",
  today: REVIEW_TODAY,
});

const reviewModel = buildStageModel({
  items,
  graph: reviewGraph,
  audience: "review",
  today: REVIEW_TODAY,
});

test("public: only published editions reach the stage, and the count says why it is empty", () => {
  assert.equal(publicModel.timeline.editions.length, 0);
  assert.equal(publicModel.timeline.withheldEditions, 3);
  assert.equal(publicModel.review.status, "none");
  assert.match(publicModel.timeline.emptyNotice, /No edition is available yet/);
  assert.match(publicModel.review.notice, /Nothing on this page claims otherwise/);
});

test("review: the three technical-review editions appear, labelled as review", () => {
  assert.equal(reviewModel.timeline.editions.length, 3);
  assert.equal(reviewModel.timeline.withheldEditions, 0);
  assert.equal(reviewModel.review.status, "technical_review");
  assert.match(reviewModel.review.notice, /Technical review is not publication/);
  for (const edition of reviewModel.timeline.editions) {
    assert.equal(edition.reviewStatus, "technical_review");
  }
});

test("timeline: exactly fifteen consecutive days, newest first, one entry per date", () => {
  assert.equal(reviewModel.timeline.days.length, TIMELINE_SPAN_DAYS);
  const dates = reviewModel.timeline.days.map((day) => day.date);
  assert.equal(new Set(dates).size, dates.length, "a date appears twice");
  assert.deepEqual([...dates].sort().reverse(), dates, "days are not newest first");
  assert.equal(dates[0], REVIEW_TODAY);
  for (let index = 1; index < dates.length; index += 1) {
    const previous = new Date(`${dates[index - 1]}T00:00:00Z`);
    const current = new Date(`${dates[index]}T00:00:00Z`);
    assert.equal(previous.getTime() - current.getTime(), 86_400_000, "days are not consecutive");
  }
});

test("timeline: a day carries an edition only when that edition is dated that day", () => {
  for (const day of reviewModel.timeline.days) {
    if (!day.editionId) {
      assert.equal(day.editionTitle, null);
      assert.equal(day.reviewStatus, null);
      continue;
    }
    const edition = reviewModel.timeline.editions.find((item) => item.id === day.editionId);
    assert.ok(edition, `day ${day.date} names an edition that is not in the model`);
    assert.equal(edition.date, day.date, `day ${day.date} borrowed the ${edition.date} edition`);
  }
  // 26 Oct has the newest edition; 25 Oct the next; the rest are quiet.
  assert.equal(reviewModel.timeline.days[0].editionId, "hansa-insight-shortcut-reference-v1");
  assert.equal(reviewModel.timeline.todayHasEdition, true);
  assert.equal(reviewModel.timeline.emptyNotice, "");
});

test("timeline: an empty today names the latest available edition instead of borrowing it", () => {
  const later = buildStageModel({
    items,
    graph: reviewGraph,
    audience: "review",
    today: AFTER_EDITIONS,
  });
  assert.equal(later.timeline.todayHasEdition, false);
  assert.equal(later.timeline.days[0].editionId, null);
  assert.equal(later.timeline.latestEditionId, "hansa-insight-shortcut-reference-v1");
  assert.match(later.timeline.emptyNotice, /No edition for WED 04 NOV/);
  assert.match(later.timeline.emptyNotice, /latest available edition is MON 26 OCT/);
});

test("graph: public shows zero edges and offers real discovery destinations", () => {
  assert.equal(publicModel.graph.state, "empty");
  assert.equal(publicModel.graph.publishedEdges, 0);
  assert.match(publicModel.graph.notice, /not published yet/);
  const hrefs = publicModel.graph.discovery.map((destination) => destination.href);
  assert.deepEqual(hrefs, ["/learn", "/practice/catalogue", "/search", "/learn/dp-600/atlas/"]);
  for (const destination of publicModel.graph.discovery) {
    assert.match(destination.href, /^\//, "a destination must stay site-relative");
    assert.ok(destination.label && destination.description);
  }
  assert.deepEqual(stageDestinations(), publicModel.graph.discovery);
});

test("graph: review counts candidate edges without publishing them", () => {
  assert.equal(reviewModel.graph.state, "empty");
  assert.equal(reviewModel.graph.publishedEdges, 0);
  assert.equal(reviewModel.graph.withheldEdges, 86);
  assert.equal(reviewModel.graph.withheldConcepts, 132);
  assert.match(reviewModel.graph.notice, /86 candidate connections are under technical review/);
});

test("boundary: the public model carries no claims, rationales or edge objects", () => {
  const serialized = JSON.stringify(publicModel);
  // Key-level assertions, not a substring sweep: the honest empty-state copy
  // legitimately says "Nothing on this page claims otherwise", so banning the
  // word "claim" would test the copy rather than the boundary.
  for (const bannedKey of ["claim", "rationale", "conditions", "semanticEdges", "editorialState", "candidate", "relationType"]) {
    assert.equal(
      serialized.includes(`"${bannedKey}"`),
      false,
      `the public model leaked the key "${bannedKey}"`,
    );
  }
  // The only edge vocabulary allowed to surface publicly is a count.
  assert.equal(/\bcandidate\b/i.test(serialized), false, "the public model mentioned candidates");
  assert.deepEqual(Object.keys(publicModel.graph).sort(), [
    "discovery",
    "notice",
    "publishedConcepts",
    "publishedEdges",
    "state",
    "withheldConcepts",
    "withheldEdges",
  ]);
});

test("boundary: an unknown audience throws instead of widening publication", () => {
  assert.throws(
    () => buildStageModel({ items, graph: publicGraph, audience: "preview", today: REVIEW_TODAY }),
    /unknown audience/,
  );
});

test("determinism: the same inputs produce the same model", () => {
  const again = buildStageModel({
    items,
    graph: reviewGraph,
    audience: "review",
    today: REVIEW_TODAY,
  });
  assert.deepEqual(again, reviewModel);
});

test("dates: dayKey and dayLabel agree with the reviewed editions", () => {
  assert.equal(dayKey("2026-10-26"), "2026-10-26");
  assert.equal(dayKey(new Date("2026-10-26T23:30:00Z")), "2026-10-26");
  assert.equal(dayLabel("2026-10-26"), "MON 26 OCT");
  assert.equal(dayLabel("2026-10-24"), "SAT 24 OCT");
});

test("the feed's real statuses are the ones the boundary depends on", () => {
  assert.equal(items.length, 3);
  assert.equal(items.filter((item) => item.reviewStatus === "published").length, 0);
  assert.equal(items.filter((item) => item.reviewStatus === "technical_review").length, 3);
  // The source files themselves are the evidence that this test is real.
  assert.ok(fs.existsSync("content/knowledge/insights.json"));
});
