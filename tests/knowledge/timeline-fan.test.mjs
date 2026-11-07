// Guards for the desktop timeline fan geometry (R3).
//
// The fan is a rendering of the prototype's timeline; these tests pin the
// numbers that make it a fan rather than a strip: the centre card is full size,
// neighbours shrink and fade symmetrically, the nearest edition is a valid
// settle target, and quiet days can never borrow an edition's identity.
import test from "node:test";
import assert from "node:assert/strict";

import {
  editionOrdinals,
  fanCardScale,
  fanCardX,
  fanDayParts,
  fanGeometry,
  fanPositionAt,
  nearestEditionIndex,
} from "../../lib/knowledge/timeline-fan.ts";

test("fan geometry keeps the prototype's card size and spacing at desktop width", () => {
  const geometry = fanGeometry(1280);
  assert.equal(geometry.cardWidth, 190);
  assert.equal(geometry.cardHeight, 212);
  assert.equal(geometry.sideScale, 0.72);
  assert.ok(Math.abs(geometry.gap - 41.8) < 0.001);
  assert.ok(Math.abs(geometry.near - 205.2) < 0.001);
  assert.ok(Math.abs(geometry.step - 178.6) < 0.001);
});

test("fan geometry clamps a narrow or unusable width instead of emitting NaN", () => {
  for (const width of [0, 200, Number.NaN, Number.POSITIVE_INFINITY]) {
    const geometry = fanGeometry(width);
    for (const value of Object.values(geometry)) {
      assert.ok(Number.isFinite(value), `width ${width} produced a non-finite geometry`);
    }
    assert.ok(geometry.cardWidth >= 180 && geometry.cardWidth <= 190);
  }
  assert.equal(fanGeometry(320).cardHeight, 196);
});

test("the centre card is still, full size and opaque", () => {
  const geometry = fanGeometry(1280);
  const centre = fanPositionAt(7, 7, geometry);
  assert.equal(centre.offset, 0);
  assert.equal(centre.x, 0);
  assert.equal(centre.scale, 1);
  assert.equal(centre.opacity, 1);
  assert.equal(centre.z, 100);
});

test("neighbours are closer, smaller and fainter in both directions", () => {
  const geometry = fanGeometry(1280);
  const right = fanPositionAt(8, 7, geometry);
  const left = fanPositionAt(6, 7, geometry);
  assert.equal(right.x, -left.x, "the fan is not symmetric");
  assert.equal(right.scale, left.scale);
  assert.equal(right.opacity, left.opacity);
  assert.equal(right.scale, 0.72);
  assert.ok(Math.abs(right.opacity - 0.58) < 0.001);
  assert.ok(right.x > 0 && left.x < 0);

  const farRight = fanPositionAt(10, 7, geometry);
  assert.ok(farRight.x > right.x, "distance does not increase the offset");
  assert.ok(farRight.opacity >= 0.58 - 1e-9, "far cards must not disappear below the floor");
  assert.ok(farRight.z < right.z);
});

test("card scale stays within the prototype's 0.72-1 range", () => {
  for (const offset of [-5, -1.5, -1, -0.4, 0, 0.4, 1, 1.5, 5]) {
    const scale = fanCardScale(offset);
    assert.ok(scale >= 0.72 - 1e-9 && scale <= 1);
  }
});

test("the fan settles on the nearest edition, never on a quiet day", () => {
  const indexes = [0, 3, 7, 12];
  assert.equal(nearestEditionIndex(indexes, 0.4), 0);
  assert.equal(nearestEditionIndex(indexes, 2.4), 3);
  assert.equal(nearestEditionIndex(indexes, 6.1), 7);
  assert.equal(nearestEditionIndex(indexes, 11.9), 12);
  assert.equal(nearestEditionIndex([], 4), null);
  // An exact tie goes to the older (higher-index) edition, matching the
  // prototype's "round to the next date" behaviour.
  assert.equal(nearestEditionIndex([2, 4], 3), 4);
});

test("day parts read the weekday, number and month without inventing them", () => {
  assert.deepEqual(fanDayParts("MON 26 OCT", "2026-10-26"), {
    weekday: "MON",
    day: "26",
    month: "OCT",
  });
  assert.deepEqual(fanDayParts("", "2026-01-02"), { weekday: "DATE", day: "02", month: "JAN" });
  assert.deepEqual(fanDayParts("WED", "2026-11-04"), { weekday: "WED", day: "04", month: "NOV" });
  assert.deepEqual(fanDayParts("", ""), { weekday: "", day: "", month: "" });
});

test("edition ordinals count oldest first and ignore input order", () => {
  const ordinals = editionOrdinals([
    { id: "b", date: "2026-10-25" },
    { id: "a", date: "2026-10-24" },
    { id: "c", date: "2026-10-26" },
  ]);
  assert.equal(ordinals.get("a"), 1);
  assert.equal(ordinals.get("b"), 2);
  assert.equal(ordinals.get("c"), 3);
});
