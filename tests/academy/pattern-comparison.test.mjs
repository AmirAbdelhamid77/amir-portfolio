import test from "node:test";
import assert from "node:assert/strict";
import { COMPARISON_ROWS, filterComparison } from "../../lib/academy/pattern-comparison.ts";
import { PATTERNS, REFERENCES } from "../../lib/academy/ingestion.ts";

test("comparison keeps every canonical mechanism, freshness caveat and limitation unchanged", () => {
  for (const [id, key] of [["mechanism", "mechanism"], ["freshness", "freshness"], ["limits", "limit"]]) {
    assert.deepEqual(COMPARISON_ROWS.find(row => row.id === id).values, PATTERNS.map(pattern => pattern[key]));
  }
  for (const row of COMPARISON_ROWS) {
    assert.equal(row.values.length, PATTERNS.length);
    assert.ok(row.sourceIds.length);
    assert.ok(row.sourceIds.every(id => REFERENCES.some(reference => reference.id === id)));
  }
});

test("search keeps all three alternatives and requires every word", () => {
  const result = filterComparison(COMPARISON_ROWS, "  NEAR   zero lag  ", false);
  assert.deepEqual(result.map(row => row.id), ["freshness"]);
  assert.equal(result[0].values.length, 3);
  assert.deepEqual(filterComparison(COMPARISON_ROWS, "latency unknownword", false), []);
});

test("differences hide the common access requirement without mutating source rows", () => {
  const before = JSON.stringify(COMPARISON_ROWS);
  assert.deepEqual(filterComparison(COMPARISON_ROWS, "", true).map(row => row.id), ["mechanism", "freshness", "limits"]);
  assert.deepEqual(filterComparison(COMPARISON_ROWS, "permissions", true), []);
  assert.equal(filterComparison(COMPARISON_ROWS, " ", false).length, 4);
  assert.equal(JSON.stringify(COMPARISON_ROWS), before);
});
