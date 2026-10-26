import test from "node:test";
import assert from "node:assert/strict";

import {
  PEEK_CENTER,
  PEEK_VIEWBOX,
  edgeControl,
  placeAround,
} from "../../lib/atlas/peek-layout.ts";

test("node slots are deterministic", () => {
  assert.deepEqual(placeAround(3), placeAround(3));
  assert.notDeepEqual(placeAround(3), placeAround(4));
});

test("the first slot sits above the core, the rest go clockwise", () => {
  const [top, right, bottom, left] = placeAround(4);
  assert.equal(top.x, PEEK_CENTER.x);
  assert.ok(top.y < PEEK_CENTER.y);
  assert.ok(right.x > PEEK_CENTER.x);
  assert.ok(bottom.y > PEEK_CENTER.y);
  assert.ok(left.x < PEEK_CENTER.x);
});

test("every slot stays inside the drawing box with room for a label", () => {
  for (const count of [1, 2, 3, 4]) {
    for (const point of placeAround(count)) {
      assert.ok(point.x > 40 && point.x < PEEK_VIEWBOX.width - 40, JSON.stringify(point));
      // 54px below the slot is reserved for a two-line node label.
      assert.ok(point.y > 20 && point.y < PEEK_VIEWBOX.height - 40, JSON.stringify(point));
    }
  }
});

test("more than four relations cannot crowd the stage", () => {
  assert.equal(placeAround(9).length, 4);
  assert.equal(placeAround(0).length, 0);
});

test("the edge control point bows above the straight midpoint", () => {
  const a = { x: 100, y: 100 };
  const b = { x: 300, y: 100 };
  const control = edgeControl(a, b);
  assert.equal(control.x, 200);
  assert.ok(control.y < 100);
});
