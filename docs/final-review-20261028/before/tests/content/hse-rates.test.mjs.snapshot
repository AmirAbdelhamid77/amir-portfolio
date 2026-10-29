// Domain tests for the HSE rate mathematics behind the rate-basis explainer.
//
// The explainer is a teaching tool, so the arithmetic has to be right and the
// invalid-input contract has to hold: a component that silently prints a rate from
// negative hours is worse than no component.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ILLUSTRATIVE_COUNTS,
  MILLION_HOURS,
  OSHA_BASE_HOURS,
  convertRate,
  formatRate,
  ltifr,
  modelFor,
  rateFor,
  trir,
  validateCounts,
} from "../../lib/hse/rates.ts";

test("TRIR uses the 200,000-hour base and LTIFR the 1,000,000-hour base", () => {
  // 24 recordables over 25M hours: 24 × 200,000 ÷ 25,000,000 = 0.192
  assert.equal(trir(24, 25_000_000), 0.192);
  // 7 lost-time injuries: 7 × 1,000,000 ÷ 25,000,000 = 0.28
  assert.equal(ltifr(7, 25_000_000), 0.28);
});

test("the illustrative counts reproduce the published display values after rounding", () => {
  const model = modelFor(ILLUSTRATIVE_COUNTS);
  assert.equal(formatRate(model.trirOsha), "0.19");
  assert.equal(formatRate(model.ltifrMillion), "0.28");
});

test("converting a rate between bases is exact and reversible", () => {
  const perMillion = convertRate(0.19, OSHA_BASE_HOURS, MILLION_HOURS);
  assert.equal(perMillion, 0.95);
  assert.equal(convertRate(perMillion, MILLION_HOURS, OSHA_BASE_HOURS), 0.19);
});

test("on a common base the recordable rate is at least the lost-time rate", () => {
  const model = modelFor(ILLUSTRATIVE_COUNTS);
  assert.equal(model.consistent, true);
  assert.ok(model.trirMillion > model.ltifrOnMillion);
  // The impossibility the audit found: LTIFR printed higher than TRIR while both
  // were labelled "per 1M hours".
  assert.ok(model.trirOnOsha < model.ltifrMillion, "the printed pair looks inverted on one base");
});

test("rates scale inversely with hours worked", () => {
  const base = modelFor({ recordables: 10, lostTime: 3, hours: 1_000_000 });
  const doubled = modelFor({ recordables: 10, lostTime: 3, hours: 2_000_000 });
  assert.equal(base.trirOsha, 2);
  assert.equal(doubled.trirOsha, 1);
  assert.equal(base.ltifrMillion, 3);
  assert.equal(doubled.ltifrMillion, 1.5);
});

test("invalid inputs produce no rate and an explicit reason", () => {
  assert.equal(rateFor(1, 0, OSHA_BASE_HOURS), null);
  assert.equal(rateFor(-1, 1_000_000, OSHA_BASE_HOURS), null);
  assert.equal(rateFor(1, -5, OSHA_BASE_HOURS), null);

  const zeroHours = validateCounts({ recordables: 1, lostTime: 1, hours: 0 });
  assert.equal(zeroHours.ok, false);
  assert.match(zeroHours.problems.join(" "), /Hours worked must be greater than zero/);

  const negative = validateCounts({ recordables: -2, lostTime: 1, hours: 1_000_000 });
  assert.equal(negative.ok, false);

  const fractional = validateCounts({ recordables: 1.5, lostTime: 1, hours: 1_000_000 });
  assert.equal(fractional.ok, false);
});

test("a lost-time count above the recordable count is rejected", () => {
  const validation = validateCounts({ recordables: 2, lostTime: 5, hours: 1_000_000 });
  assert.equal(validation.ok, false);
  assert.match(validation.problems.join(" "), /cannot exceed recordable/);
});

test("zero cases give a zero rate, and zero lost-time cases leave the ratio undefined", () => {
  const model = modelFor({ recordables: 0, lostTime: 0, hours: 1_000_000 });
  assert.equal(model.trirOsha, 0);
  assert.equal(model.ltifrMillion, 0);
  assert.equal(model.ratio, null);
  assert.equal(formatRate(model.trirOsha), "0.00");
});

test("formatRate never prints NaN or Infinity", () => {
  assert.equal(formatRate(null), "—");
  assert.equal(formatRate(Number.NaN), "—");
  assert.equal(formatRate(Number.POSITIVE_INFINITY), "—");
  assert.equal(formatRate(1.239), "1.24");
});
