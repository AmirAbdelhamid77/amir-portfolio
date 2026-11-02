// Pure Timeline adapter tests. These prove the recovered card timeline maps the
// current review payload without inventing an edition or a card.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const root = path.resolve("intelligent-atlas");
const timeline = require(path.join(root, "prototype", "timeline-model.js"));

function loadData() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(readFileSync(path.join(root, "prototype", "data.js"), "utf8"), context);
  return context.window.ATLAS_DATA;
}

const data = loadData();
const model = timeline.buildTimelineModel(data);
const byDate = new Map(model.map((entry) => [entry.date, entry]));

test("timeline: maps every day exactly once", () => {
  assert.equal(model.length, data.timeline.days.length);
  assert.equal(new Set(model.map((entry) => entry.date)).size, model.length);
});

test("timeline: latest edition is the real 26 Oct edition", () => {
  const latest = byDate.get("2026-10-26");
  assert.equal(latest.isLatest, true);
  assert.equal(latest.hasEdition, true);
  assert.equal(latest.cardCount, 1);
  assert.equal(latest.deckStatus, "ready");
  assert.equal(latest.title, "Reference ≠ retained result");
  assert.equal(latest.editionConceptId, "concept:fabric:shortcut");
  assert.equal(latest.editionIndex, 3);
});

test("timeline: today is empty and is not replaced by the latest edition", () => {
  const today = byDate.get("2026-11-01");
  assert.equal(today.isToday, true);
  assert.equal(today.hasEdition, false);
  assert.equal(today.cardCount, 0);
  assert.equal(today.title, "No edition");
  assert.match(today.status, /today · no edition/);
  assert.equal(today.editionConceptId, null);
});

test("timeline: a quiet day is empty even when an edition exists nearby", () => {
  const quiet = byDate.get("2026-10-27");
  assert.equal(quiet.hasEdition, false);
  assert.equal(quiet.cardCount, 0);
  assert.equal(quiet.title, "No edition");
  assert.equal(quiet.deckKey, "daily:2026-10-27");
});

test("timeline: no card fabricates an edition", () => {
  for (const entry of model) {
    const day = data.timeline.days.find((candidate) => candidate.date === entry.date);
    assert.equal(entry.hasEdition, day.hasEdition, entry.date);
    if (!day.hasEdition) assert.equal(entry.cardCount, 0, entry.date);
  }
});

test("timeline: multi-card decks use the edition title and an honest count", () => {
  const clone = structuredClone(data);
  clone.decks["daily:2026-10-26"].deck.cards = [
    { cardId: "a" },
    { cardId: "b" },
    { cardId: "c" },
  ];
  const multi = timeline.buildTimelineModel(clone).find((entry) => entry.date === "2026-10-26");
  assert.equal(multi.cardCount, 3);
  assert.match(multi.status, /3 cards · technical review/);
  assert.equal(multi.title, data.editions.find((edition) => edition.date === "2026-10-26").title);
});

test("timeline: a missing deck is labelled, not silently counted", () => {
  const clone = structuredClone(data);
  delete clone.decks["daily:2026-10-26"];
  const missing = timeline.buildTimelineModel(clone).find((entry) => entry.date === "2026-10-26");
  assert.equal(missing.deckStatus, "missing");
  assert.match(missing.status, /deck missing/);
  assert.equal(missing.cardCount, 1);
});

test("timeline: geometry keeps the recognizable card scale", () => {
  const wide = timeline.geometry(1280);
  assert.equal(wide.cardWidth, 190);
  assert.equal(wide.cardHeight, 212);
  assert.equal(wide.sideScale, 0.72);
  const phone = timeline.geometry(390);
  assert.equal(phone.cardWidth, 190);
  assert.equal(phone.cardHeight, 196);
});

test("timeline: card positions recede on both sides", () => {
  const g = timeline.geometry(1280);
  const center = timeline.positionAt(0, 0, g);
  const right = timeline.positionAt(1, 0, g);
  const far = timeline.positionAt(2, 0, g);
  assert.equal(center.x, 0);
  assert.equal(center.scale, 1);
  assert.equal(center.opacity, 1);
  assert.ok(right.x > 0);
  assert.equal(right.scale, 0.72);
  assert.ok(right.opacity < 1);
  assert.ok(far.x > right.x);
  assert.ok(far.opacity <= right.opacity);
});

test("timeline: drag position interpolates and commits to the nearest day", () => {
  const g = timeline.geometry(1280);
  const between = timeline.positionAt(1, 0.4, g);
  assert.ok(between.x > 0 && between.x < g.near);
  assert.ok(between.scale < 1 && between.scale > 0.72);
  assert.equal(Math.round(0.4), 0);
  assert.equal(Math.round(0.6), 1);
});
