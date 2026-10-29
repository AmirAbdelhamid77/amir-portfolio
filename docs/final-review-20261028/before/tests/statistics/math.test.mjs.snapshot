import assert from "node:assert/strict";
import test from "node:test";
import {
  binomialCdf,
  binomialPmf,
  binomialTailAtLeast,
  fiveNumber,
  formatNumber,
  formatPercent,
  histogram,
  linearRegression,
  logGamma,
  mean,
  meanConfidenceInterval,
  median,
  modes,
  normalCdf,
  normalPdf,
  normalQuantile,
  pearson,
  poissonCdf,
  poissonPmf,
  poissonTailAtLeast,
  quantile,
  simulateCoverage,
  simulateSampleMeans,
  standardDeviation,
  studentTCdf,
  studentTQuantile,
  summarize,
  twoProportionTest,
  variance,
  wilsonInterval,
  zTestPValue,
  zTestPower,
} from "../../lib/statistics/math.ts";

const close = (actual, expected, tolerance, label) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected} ± ${tolerance}, got ${actual}`,
  );
};

test("Poisson reproduces the brief's verified λ=20 values", () => {
  // Independently verified: P(X=13) = e^-20 * 20^13 / 13!
  close(poissonPmf(20, 13), 0.027115648104173072, 1e-12, "P(X=13)");
  close(poissonTailAtLeast(20, 25), 0.156772621826238, 1e-10, "P(X≥25)");
  // The source's “a little over 11%” is wrong; the correct figure is 15.68%.
  assert.ok(poissonTailAtLeast(20, 25) > 0.15);
});

test("Poisson normalises and its tails complement its CDF", () => {
  for (const lambda of [0.5, 3, 20, 60]) {
    close(poissonCdf(lambda, 400), 1, 1e-12, `λ=${lambda} sums to 1`);
    for (const k of [0, 1, Math.floor(lambda), Math.ceil(lambda) + 3]) {
      const pmf = poissonPmf(lambda, k);
      assert.ok(pmf >= 0 && pmf <= 1, `pmf bounds λ=${lambda}, k=${k}`);
      const tail = poissonTailAtLeast(lambda, k);
      const complement = k === 0 ? 0 : poissonCdf(lambda, k - 1);
      close(tail + complement, 1, 1e-9, `tail complement λ=${lambda}, k=${k}`);
    }
  }
  assert.equal(poissonPmf(0, 0), 1);
  assert.equal(poissonPmf(0, 1), 0);
});

test("Binomial PMF normalises, respects boundaries, and matches its tail", () => {
  let total = 0;
  for (let k = 0; k <= 10; k += 1) total += binomialPmf(10, k, 0.3);
  close(total, 1, 1e-12, "binomial PMF sum");
  close(binomialCdf(20, 20, 0.4), 1, 1e-12, "CDF at n");
  close(
    binomialTailAtLeast(20, 7, 0.4) + binomialCdf(20, 6, 0.4),
    1,
    1e-12,
    "tail + CDF complement",
  );
  assert.equal(binomialPmf(10, -1, 0.3), 0);
  assert.equal(binomialPmf(10, 11, 0.3), 0);
  assert.equal(binomialPmf(10, 0, 0), 1);
  assert.equal(binomialPmf(10, 10, 1), 1);
  assert.ok(Number.isNaN(binomialPmf(10, 2, 1.2)));
  assert.ok(Math.abs(binomialPmf(10, 5, 0.5) - 252 / 1024) < 1e-12);
});

test("Normal density integrates to 1 and the empirical-rule areas hold", () => {
  const a = -8;
  const b = 8;
  const steps = 4000;
  const h = (b - a) / steps;
  let integral = 0;
  for (let index = 0; index <= steps; index += 1) {
    const x = a + index * h;
    integral += normalPdf(x) * (index === 0 || index === steps ? 1 : index % 2 ? 4 : 2);
  }
  integral = (integral * h) / 3;
  close(integral, 1, 1e-10, "normal density integral");

  const within = (z) => normalCdf(z) - normalCdf(-z);
  close(within(1), 0.682689492, 1e-6, "68% within 1σ");
  close(within(2), 0.954499736, 1e-6, "95% within 2σ");
  close(within(3), 0.997300204, 1e-6, "99.7% within 3σ");

  assert.equal(normalCdf(50, 50, 10), 0.5000000000000008);
  close(normalCdf(60, 50, 10), 0.841344746, 1e-8, "one σ above the mean");
  close(normalCdf(0), 0.5, 1e-12, "standard normal at zero");
  assert.ok(Number.isNaN(normalPdf(0, 0, 0)));
});

test("Normal quantile inverts the CDF across the working range", () => {
  for (const p of [0.001, 0.025, 0.05, 0.5, 0.95, 0.975, 0.999]) {
    close(normalCdf(normalQuantile(p)), p, 1e-9, `round trip p=${p}`);
  }
  close(normalQuantile(0.975), 1.959963984540054, 1e-10, "z 0.975");
  close(normalQuantile(0.995), 2.5758293035489004, 1e-9, "z 0.995");
  assert.equal(normalQuantile(0), -Infinity);
  assert.equal(normalQuantile(1), Infinity);
  assert.ok(Number.isNaN(normalQuantile(-0.1)));
});

test("Student t quantiles match published two-sided critical values", () => {
  // Values from the standard t table, 95% two-sided.
  close(studentTQuantile(0.975, 1), 12.706204736174703, 1e-8, "df=1");
  close(studentTQuantile(0.975, 10), 2.2281388519862744, 1e-8, "df=10");
  close(studentTQuantile(0.975, 30), 2.0422724563012373, 1e-8, "df=30");
  close(studentTQuantile(0.975, 100), 1.9839715184496334, 1e-7, "df=100");
  close(studentTCdf(0, 10), 0.5, 1e-12, "t CDF at 0");
  close(studentTCdf(2.2281388519862744, 10), 0.975, 1e-9, "t CDF at critical");
});

test("Descriptive statistics use n−1 for samples and resist one outlier", () => {
  const values = [2, 4, 4, 4, 5, 5, 7, 9];
  close(mean(values), 5, 1e-12, "mean");
  assert.equal(median(values), 4.5);
  assert.deepEqual(modes(values), [4]);
  assert.equal(quantile(values, 0.25), 4);
  assert.equal(quantile(values, 0.75), 5.5);
  close(variance(values, { sample: true }), 32 / 7, 1e-12, "sample variance");
  close(variance(values, { sample: false }), 4, 1e-12, "population variance");
  close(standardDeviation(values, { sample: true }), Math.sqrt(32 / 7), 1e-12, "sample SD");

  const withOutlier = [...values, 100];
  const summary = summarize(withOutlier);
  assert.ok(summary.mean > 15, "mean moves sharply");
  assert.equal(summary.median, 5, "median is resistant");
  assert.deepEqual(summary.outliers, [100]);
  assert.ok(summary.upperFence < 100);
  assert.ok(Number.isNaN(variance([5])), "sample variance needs n≥2");
  assert.deepEqual(modes([1, 2, 3]), [], "no repeated value means no mode");
});

test("Five-number summary uses Tukey fences and includes both whiskers", () => {
  const stats = fiveNumber([1, 2, 3, 4, 5, 6, 7, 8, 9, 100]);
  assert.equal(stats.n, 10);
  assert.equal(stats.min, 1);
  assert.equal(stats.max, 100);
  assert.equal(stats.median, 5.5);
  assert.equal(stats.whiskerHigh, 9);
  assert.deepEqual(stats.outliers, [100]);
});

test("Confidence interval: t critical value, margin, and bounds", () => {
  const interval = meanConfidenceInterval({ mean: 80, sd: 10, n: 25, confidence: 0.95 });
  assert.equal(interval.method, "t");
  assert.equal(interval.df, 24);
  close(interval.se, 2, 1e-12, "SE");
  close(interval.critical, 2.063898561628021, 1e-9, "t critical");
  close(interval.margin, 4.127797123256042, 1e-9, "margin");
  close(interval.lower, 75.87220287674396, 1e-9, "lower");
  close(interval.upper, 84.12779712325604, 1e-9, "upper");

  const zInterval = meanConfidenceInterval({
    mean: 80,
    sd: 10,
    n: 25,
    confidence: 0.95,
    sigmaKnown: true,
  });
  assert.equal(zInterval.method, "z");
  close(zInterval.critical, 1.959963984540054, 1e-10, "z critical");

  const wider = meanConfidenceInterval({ mean: 80, sd: 10, n: 25, confidence: 0.99 });
  assert.ok(wider.upper - wider.lower > interval.upper - interval.lower);
  const larger = meanConfidenceInterval({ mean: 80, sd: 10, n: 100, confidence: 0.95 });
  assert.ok(larger.upper - larger.lower < interval.upper - interval.lower);
});

test("Wilson interval stays inside [0,1] at the edges", () => {
  const none = wilsonInterval(0, 20);
  assert.ok(none.lower >= 0 && none.upper > 0 && none.upper < 1);
  const all = wilsonInterval(20, 20);
  assert.ok(all.lower > 0 && all.upper <= 1);
  const middle = wilsonInterval(5, 20);
  assert.ok(middle.lower < 0.25 && middle.upper > 0.25);
});

test("Two-proportion test: rates, pooled SE, p-value and unpooled CI", () => {
  const result = twoProportionTest({
    successesA: 320,
    nA: 4000,
    successesB: 376,
    nB: 4000,
  });
  close(result.pA, 0.08, 1e-12, "A rate");
  close(result.pB, 0.094, 1e-12, "B rate");
  close(result.difference, 0.014, 1e-12, "absolute lift");
  close(result.relativeLift, 0.175, 1e-12, "relative lift");
  close(result.z, 2.2215087002278766, 1e-9, "z");
  // Independent Simpson integration of the standard normal tail gives
  // 2 × 0.013158263047057 = 0.026316526094114.
  close(result.pValue, 0.026316526094114, 1e-9, "p");
  assert.ok(result.interval.lower > 0, "95% CI excludes zero");
  assert.equal(result.pValue, zTestPValue(result.z, "two-sided"));
  assert.ok(result.warnings.length === 0, "4000 per arm clears the warning threshold");

  const tiny = twoProportionTest({ successesA: 1, nA: 10, successesB: 0, nB: 10 });
  assert.ok(tiny.warnings.length > 0);
});

test("Power rises with sample size and effect, and never exceeds 1", () => {
  const small = zTestPower({ effect: 2, sigma: 15, n: 100, alpha: 0.05 });
  const large = zTestPower({ effect: 2, sigma: 15, n: 400, alpha: 0.05 });
  const stronger = zTestPower({ effect: 4, sigma: 15, n: 100, alpha: 0.05 });
  assert.ok(small.power > 0 && small.power < 1);
  assert.ok(large.power > small.power);
  assert.ok(stronger.power > small.power);
  close(small.power + small.beta, 1, 1e-12, "power + beta");
});

test("Pearson r is bounded, detects perfect lines, and regression is not r", () => {
  close(pearson([1, 2, 3, 4], [2, 4, 6, 8]), 1, 1e-12, "perfect positive");
  close(pearson([1, 2, 3, 4], [8, 6, 4, 2]), -1, 1e-12, "perfect negative");
  assert.ok(Number.isNaN(pearson([1, 1, 1], [1, 2, 3])), "constant X has no correlation");

  const fit = linearRegression([0, 1, 2, 3, 4], [7, 10, 13, 16, 19]);
  close(fit.slope, 3, 1e-12, "slope");
  close(fit.intercept, 7, 1e-12, "intercept");
  close(fit.r, 1, 1e-12, "r");
  close(fit.predict(10), 37, 1e-12, "prediction");

  // Doubling the units of X halves the slope but leaves r unchanged.
  const doubled = linearRegression([0, 2, 4, 6, 8], [7, 10, 13, 16, 19]);
  close(doubled.r, 1, 1e-12, "r invariant to affine rescaling");
  close(doubled.slope, 1.5, 1e-12, "slope changes with units");
});

test("Sampling simulation is seeded, and empirical SE tracks σ/√n", () => {
  const first = simulateSampleMeans({ shape: "skewed", n: 30, draws: 2000, seed: 42 });
  const second = simulateSampleMeans({ shape: "skewed", n: 30, draws: 2000, seed: 42 });
  assert.deepEqual(first.means, second.means, "same seed, same samples");
  assert.notDeepEqual(
    first.means,
    simulateSampleMeans({ shape: "skewed", n: 30, draws: 2000, seed: 43 }).means,
  );
  close(first.theoreticalSe, 15 / Math.sqrt(30), 1e-12, "theoretical SE");
  assert.ok(
    Math.abs(first.empiricalSe - first.theoreticalSe) / first.theoreticalSe < 0.05,
    `empirical SE ${first.empiricalSe} should be within 5% of ${first.theoreticalSe}`,
  );
  assert.ok(Math.abs(first.empiricalMean - 15) < 0.75, "sampling distribution centred on μ");
});

test("Coverage simulation is honest and does not force exactly 95%", () => {
  const result = simulateCoverage({ n: 25, confidence: 0.95, trials: 500, seed: 7 });
  assert.equal(result.intervals.length, 500);
  assert.equal(result.covered, result.intervals.filter((interval) => interval.covered).length);
  assert.ok(result.coverage > 0.92 && result.coverage < 0.98, `observed ${result.coverage}`);
  assert.ok(result.coverage !== 0.95, "finite-run coverage is allowed to differ from nominal");
  const narrower = simulateCoverage({ n: 100, confidence: 0.95, trials: 200, seed: 7 });
  assert.ok(narrower.meanWidth < result.meanWidth);
});

test("Histogram counts every observation and reports density that integrates to 1", () => {
  const values = Array.from({ length: 100 }, (_, index) => index / 10);
  const result = histogram(values, 10);
  assert.equal(result.total, 100);
  assert.equal(
    result.bins.reduce((total, bin) => total + bin.count, 0),
    100,
  );
  const area = result.bins.reduce((total, bin) => total + bin.density * (bin.x1 - bin.x0), 0);
  close(area, 1, 1e-12, "histogram density area");
});

test("log-gamma matches factorial identities used by the PMFs", () => {
  close(Math.exp(logGamma(6)), 120, 1e-9, "Γ(6)=5!");
  close(Math.exp(logGamma(11) - logGamma(6) - logGamma(6)), 252, 1e-9, "10 choose 5");
});

test("Formatters never print NaN or Infinity as a number", () => {
  assert.equal(formatNumber(1234.567, 2), "1,234.57");
  assert.equal(formatPercent(0.0842, 1), "8.4%");
  assert.equal(formatNumber(Number.NaN), "—");
  assert.equal(formatPercent(Number.POSITIVE_INFINITY), "—");
});
