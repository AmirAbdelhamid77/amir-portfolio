import assert from "node:assert/strict";
import test from "node:test";
import {
  boxStats,
  extent,
  formatCompact,
  formatNumber,
  histogram,
  linearRegression,
  mean,
  niceScale,
  pearson,
  percent,
  quantile,
  scaleLinear,
  sum,
  tail,
} from "../../lib/data-viz/chart-math.ts";

test("extent ignores non-finite values and handles empty input", () => {
  assert.deepEqual(extent([]), { min: 0, max: 0 });
  assert.deepEqual(extent([4, Number.NaN, -2, Infinity, 9]), { min: -2, max: 9 });
});

test("sum and mean agree with a hand calculation", () => {
  const values = [2, 4, 4, 4, 5, 5, 7, 9];
  assert.equal(sum(values), 40);
  assert.equal(mean(values), 5);
  assert.equal(mean([]), 0);
});

test("niceScale produces round, evenly spaced ticks that contain the domain", () => {
  const scale = niceScale(0, 97, 5);
  assert.ok(scale.min <= 0, "scale must start at or below the domain minimum");
  assert.ok(scale.max >= 97, "scale must end at or above the domain maximum");
  assert.ok(scale.ticks.length >= 4 && scale.ticks.length <= 8);
  for (let index = 1; index < scale.ticks.length; index += 1) {
    const gap = scale.ticks[index] - scale.ticks[index - 1];
    assert.ok(Math.abs(gap - scale.step) < 1e-9, `tick gap ${gap} != step ${scale.step}`);
  }
  // A degenerate domain is padded rather than emitted as a zero-height axis.
  const flat = niceScale(5, 5);
  assert.ok(flat.min < 5 && flat.max > 5);
  assert.ok(flat.step > 0);
  assert.ok(flat.ticks.includes(5));
});

test("niceScale keeps negative ranges ordered", () => {
  const scale = niceScale(-40, -5, 4);
  assert.ok(scale.min <= -40 && scale.max >= -5);
  for (let index = 1; index < scale.ticks.length; index += 1) {
    assert.ok(scale.ticks[index] > scale.ticks[index - 1]);
  }
});

test("histogram counts every observation exactly once", () => {
  const values = Array.from({ length: 100 }, (_, index) => index);
  const result = histogram(values, { binWidth: 10 });
  assert.equal(result.binWidth, 10);
  assert.equal(sum(result.counts), values.length);
  for (const bin of result.bins) {
    assert.ok(bin.x1 > bin.x0, "bins must have positive width");
  }
});

test("histogram bin width changes the visible shape of the same data", () => {
  const bimodal = [...Array.from({ length: 20 }, (_, i) => 10 + i * 0.2), ...Array.from({ length: 20 }, (_, i) => 40 + i * 0.2)];
  const wide = histogram(bimodal, { binCount: 3 });
  const narrow = histogram(bimodal, { binCount: 20 });
  assert.equal(sum(wide.counts), bimodal.length);
  assert.equal(sum(narrow.counts), bimodal.length);
  assert.ok(Math.max(...wide.counts) > Math.max(...narrow.counts));
});

test("quantile matches the linear-interpolation definition", () => {
  const values = [1, 2, 3, 4];
  assert.equal(quantile(values, 0), 1);
  assert.equal(quantile(values, 1), 4);
  assert.equal(quantile(values, 0.5), 2.5);
  assert.equal(quantile(values, 0.25), 1.75);
  assert.ok(Number.isNaN(quantile([], 0.5)));
});

test("boxStats reports a five-number summary and Tukey outliers", () => {
  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 100];
  const stats = boxStats(values);
  assert.equal(stats.n, 10);
  assert.equal(stats.min, 1);
  assert.equal(stats.max, 100);
  assert.equal(stats.median, 5.5);
  assert.ok(stats.q1 < stats.median && stats.median < stats.q3);
  assert.deepEqual(stats.outliers, [100]);
  assert.equal(stats.whiskerHigh, 9);
  assert.ok(stats.upperFence < 100);
});

test("pearson returns a perfect correlation for a straight line and NaN for a constant", () => {
  assert.equal(pearson([1, 2, 3, 4], [2, 4, 6, 8]), 1);
  assert.equal(pearson([1, 2, 3, 4], [8, 6, 4, 2]), -1);
  assert.ok(Number.isNaN(pearson([1, 1, 1], [1, 2, 3])));
});

test("linearRegression recovers the generating line", () => {
  const xs = [0, 1, 2, 3, 4];
  const ys = xs.map((x) => 3 * x + 7);
  const fit = linearRegression(xs, ys);
  assert.ok(Math.abs(fit.slope - 3) < 1e-12);
  assert.ok(Math.abs(fit.intercept - 7) < 1e-12);
  assert.ok(Math.abs(fit.r2 - 1) < 1e-12);
  assert.ok(Math.abs(fit.predict(10) - 37) < 1e-12);
});

test("scaleLinear maps domain onto range and inverts back", () => {
  const scale = scaleLinear({ min: 10, max: 20 }, { min: 0, max: 100 });
  assert.equal(scale(10), 0);
  assert.equal(scale(20), 100);
  assert.equal(scale(15), 50);
  assert.ok(Math.abs(scale.invert(50) - 15) < 1e-12);

  const flipped = scaleLinear({ min: 0, max: 10 }, { min: 100, max: 0 });
  assert.equal(flipped(0), 100);
  assert.equal(flipped(10), 0);
});

test("formatters are locale-stable and never round silently in the wrong direction", () => {
  assert.equal(formatNumber(1234.567, 1), "1,234.6");
  assert.equal(formatNumber(1234, 0), "1,234");
  assert.equal(formatCompact(12400), "12.4K");
  assert.equal(percent(512, 12400), "4.1%");
  // A zero denominator is reported as unavailable, never as "0%" or "Infinity%".
  assert.equal(percent(1, 0), "—");
});

test("tail returns the last N items without mutating the input", () => {
  const values = [1, 2, 3, 4, 5];
  assert.deepEqual(tail(values, 2), [4, 5]);
  assert.deepEqual(values, [1, 2, 3, 4, 5]);
  assert.deepEqual(tail(values, 0), []);
});
