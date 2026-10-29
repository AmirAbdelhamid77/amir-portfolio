// Pure statistical computation for the Comprehensive Statistics Reference.
//
// No React, no DOM, no charting library. Every number a chart draws or a lab
// prints comes from these functions, and `tests/statistics/math.test.mjs`
// checks them against independently known values. Display rounding happens in
// the components; the internal precision here is never rounded.
//
// Conventions that matter for the teaching:
// - sample variance divides by n−1; population variance divides by N.
// - quantiles use linear interpolation between order statistics (R type 7),
//   stated next to the IQR lesson because other textbooks differ.
// - quartiles are the 25th/75th percentiles of that definition, not Tukey's
//   hinges; the box plot uses 1.5×IQR fences on those quartiles.
// - p-values are always conditional on the stated null model.

export const Z95 = 1.959963984540054;
export const Z99 = 2.5758293035489004;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function sum(values: readonly number[]): number {
  let total = 0;
  for (const value of values) if (Number.isFinite(value)) total += value;
  return total;
}

export function mean(values: readonly number[]): number {
  const clean = values.filter((value) => Number.isFinite(value));
  return clean.length ? sum(clean) / clean.length : Number.NaN;
}

/** Sorted copy; callers never get their input mutated. */
export function sorted(values: readonly number[]): number[] {
  return values.filter((value) => Number.isFinite(value)).slice().sort((a, b) => a - b);
}

export function median(values: readonly number[]): number {
  return quantile(values, 0.5);
}

/**
 * Linear-interpolation quantile (R type 7). p is clamped to [0, 1].
 * Returns NaN for an empty or non-finite input.
 */
export function quantile(values: readonly number[], p: number): number {
  const data = sorted(values);
  if (!data.length) return Number.NaN;
  const q = clamp(p, 0, 1);
  if (data.length === 1) return data[0];
  const position = q * (data.length - 1);
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return data[lower];
  const fraction = position - lower;
  return data[lower] + (data[upper] - data[lower]) * fraction;
}

/** Every value that shares the highest frequency; [] when all values are unique. */
export function modes(values: readonly number[]): number[] {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return [];
  const counts = new Map<number, number>();
  for (const value of clean) counts.set(value, (counts.get(value) ?? 0) + 1);
  const highest = Math.max(...counts.values());
  if (highest < 2) return [];
  return [...counts.entries()]
    .filter(([, count]) => count === highest)
    .map(([value]) => value)
    .sort((a, b) => a - b);
}

export function range(values: readonly number[]): number {
  const data = sorted(values);
  return data.length ? data[data.length - 1] - data[0] : Number.NaN;
}

/** Sample variance (n−1) by default; population variance when sample=false. */
export function variance(values: readonly number[], options: { sample?: boolean } = {}): number {
  const data = values.filter((value) => Number.isFinite(value));
  const sample = options.sample ?? true;
  const denominator = sample ? data.length - 1 : data.length;
  if (denominator <= 0) return Number.NaN;
  const centre = mean(data);
  let total = 0;
  for (const value of data) total += (value - centre) ** 2;
  return total / denominator;
}

export function standardDeviation(
  values: readonly number[],
  options: { sample?: boolean } = {},
): number {
  return Math.sqrt(variance(values, options));
}

export interface FiveNumber {
  n: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  iqr: number;
  lowerFence: number;
  upperFence: number;
  /** Whiskers end at the most extreme observations inside the fences. */
  whiskerLow: number;
  whiskerHigh: number;
  outliers: number[];
}

export function fiveNumber(values: readonly number[]): FiveNumber {
  const data = sorted(values);
  if (!data.length) {
    return {
      n: 0,
      min: Number.NaN,
      q1: Number.NaN,
      median: Number.NaN,
      q3: Number.NaN,
      max: Number.NaN,
      iqr: Number.NaN,
      lowerFence: Number.NaN,
      upperFence: Number.NaN,
      whiskerLow: Number.NaN,
      whiskerHigh: Number.NaN,
      outliers: [],
    };
  }
  const q1 = quantile(data, 0.25);
  const q3 = quantile(data, 0.75);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const inside = data.filter((value) => value >= lowerFence && value <= upperFence);
  return {
    n: data.length,
    min: data[0],
    q1,
    median: quantile(data, 0.5),
    q3,
    max: data[data.length - 1],
    iqr,
    lowerFence,
    upperFence,
    whiskerLow: inside.length ? inside[0] : data[0],
    whiskerHigh: inside.length ? inside[inside.length - 1] : data[data.length - 1],
    outliers: data.filter((value) => value < lowerFence || value > upperFence),
  };
}

export interface Summary extends FiveNumber {
  mean: number;
  modes: number[];
  range: number;
  sampleVariance: number;
  sampleSd: number;
  populationVariance: number;
  populationSd: number;
}

export function summarize(values: readonly number[]): Summary {
  const five = fiveNumber(values);
  return {
    ...five,
    mean: mean(values),
    modes: modes(values),
    range: range(values),
    sampleVariance: variance(values, { sample: true }),
    sampleSd: standardDeviation(values, { sample: true }),
    populationVariance: variance(values, { sample: false }),
    populationSd: standardDeviation(values, { sample: false }),
  };
}

/** Deterministic PRNG. `Math.random` is never used by a lab. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller; consumes two uniforms. */
export function normalRandom(random: () => number, meanValue = 0, sd = 1): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = random();
  while (v === 0) v = random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return meanValue + sd * z;
}

export function uniformRandom(random: () => number, low = 0, high = 1): number {
  return low + (high - low) * random();
}

export function exponentialRandom(random: () => number, rate = 1): number {
  let u = 0;
  while (u === 0) u = random();
  return -Math.log(u) / rate;
}

export function sampleMean(random: () => number, n: number, draw: () => number): number {
  let total = 0;
  for (let index = 0; index < n; index += 1) total += draw();
  return total / n;
}

// ---------------------------------------------------------------------------
// Special functions
// ---------------------------------------------------------------------------

const LANCZOS = [
  676.5203681218851,
  -1259.1392167224028,
  771.32342877765313,
  -176.61502916214059,
  12.507343278686905,
  -0.13857109526572012,
  9.9843695780195716e-6,
  1.5056327351493116e-7,
];

/** log Γ(x) for x > 0 (Lanczos, g=7, n=9). */
export function logGamma(x: number): number {
  if (!(x > 0)) return Number.NaN;
  if (x < 0.5) {
    // Reflection keeps the approximation in its stable range.
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  }
  const z = x - 1;
  let a = 0.99999999999980993;
  for (let index = 0; index < LANCZOS.length; index += 1) {
    a += LANCZOS[index] / (z + index + 1);
  }
  const t = z + LANCZOS.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a);
}

export function logFactorial(k: number): number {
  return logGamma(k + 1);
}

/**
 * Complementary error function (Numerical Recipes `erfc`, fractional error
 * < 1.2e-7 over the whole range, and far better than that near the centre).
 * Using erfc directly avoids the cancellation that `1 - erf(x)` suffers for
 * large positive x.
 */
export function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 2 / (2 + z);
  const ty = 4 * t - 2;
  const cof = [
    -1.3026537197817094, 6.4196979235649026e-1, 1.9476473204185836e-2,
    -9.561514786808631e-3, -9.46595344482036e-4, 3.66839497852761e-4,
    4.2523324806907e-5, -2.0278578112534e-5, -1.624290004647e-6,
    1.30365583558e-6, 1.5626441722e-8, -8.5238095915e-8, 6.529054439e-9,
    5.059343495e-9, -9.91364156e-10, -2.27365122e-10, 9.6467911e-11,
    2.394038e-12, -6.886027e-12, 8.94487e-13, 3.13092e-13, -1.12708e-13,
    3.81e-16, 7.106e-15,
  ];
  let d = 0;
  let dd = 0;
  for (let index = cof.length - 1; index > 0; index -= 1) {
    const temporary = d;
    d = ty * d - dd + cof[index];
    dd = temporary;
  }
  const answer = t * Math.exp(-z * z + 0.5 * (cof[0] + ty * d) - dd);
  return x >= 0 ? answer : 2 - answer;
}

export function erf(x: number): number {
  return 1 - erfc(x);
}

export function normalPdf(x: number, mu = 0, sigma = 1): number {
  if (!(sigma > 0)) return Number.NaN;
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

/** Standard normal CDF, accurate to ~1e-15. */
export function normalCdf(x: number, mu = 0, sigma = 1): number {
  if (!(sigma > 0)) return Number.NaN;
  return 0.5 * erfc(-(x - mu) / (sigma * Math.SQRT2));
}

/** Acklam's inverse normal CDF; refined with one Halley step. */
export function normalQuantile(p: number): number {
  if (!(p > 0 && p < 1)) return p === 0 ? -Infinity : p === 1 ? Infinity : Number.NaN;
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const plow = 0.02425;
  const phigh = 1 - plow;
  let q: number;
  let r: number;
  let x: number;
  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p));
    x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= phigh) {
    q = p - 0.5;
    r = q * q;
    x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  // One Halley refinement.
  const e = normalCdf(x) - p;
  const u = e * Math.sqrt(2 * Math.PI) * Math.exp((x * x) / 2);
  return x - u / (1 + (x * u) / 2);
}

/** Continued fraction for the regularized incomplete beta (Numerical Recipes). */
function betaContinuedFraction(a: number, b: number, x: number): number {
  const maxIterations = 300;
  const epsilon = 3e-14;
  const tiny = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < tiny) d = tiny;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= maxIterations; m += 1) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < epsilon) break;
  }
  return h;
}

/** Regularized incomplete beta I_x(a,b). */
export function incompleteBeta(a: number, b: number, x: number): number {
  if (!(a > 0) || !(b > 0) || x < 0 || x > 1) return Number.NaN;
  if (x === 0) return 0;
  if (x === 1) return 1;
  const logBeta = logGamma(a) + logGamma(b) - logGamma(a + b);
  const front = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - logBeta);
  if (x < (a + 1) / (a + b + 2)) {
    return (front * betaContinuedFraction(a, b, x)) / a;
  }
  return 1 - (front * betaContinuedFraction(b, a, 1 - x)) / b;
}

/** Student t CDF via the incomplete beta function. */
export function studentTCdf(t: number, df: number): number {
  if (!(df > 0)) return Number.NaN;
  if (!Number.isFinite(t)) return t > 0 ? 1 : 0;
  const x = df / (df + t * t);
  const tail = 0.5 * incompleteBeta(df / 2, 0.5, x);
  return t >= 0 ? 1 - tail : tail;
}

/** Student t quantile by bisection on the CDF; accurate to ~1e-10. */
export function studentTQuantile(p: number, df: number): number {
  if (!(p > 0 && p < 1) || !(df > 0)) return Number.NaN;
  let low = -80;
  let high = 80;
  for (let iteration = 0; iteration < 200; iteration += 1) {
    const mid = (low + high) / 2;
    if (studentTCdf(mid, df) < p) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

export function studentTPdf(t: number, df: number): number {
  if (!(df > 0)) return Number.NaN;
  return (
    Math.exp(logGamma((df + 1) / 2) - logGamma(df / 2)) /
    Math.sqrt(df * Math.PI) *
    Math.pow(1 + (t * t) / df, -(df + 1) / 2)
  );
}

// ---------------------------------------------------------------------------
// Discrete distributions
// ---------------------------------------------------------------------------

export function binomialPmf(n: number, k: number, p: number): number {
  if (!Number.isInteger(n) || n < 0) return Number.NaN;
  if (!Number.isInteger(k) || k < 0 || k > n) return 0;
  if (p < 0 || p > 1) return Number.NaN;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  const logProbability =
    logGamma(n + 1) -
    logGamma(k + 1) -
    logGamma(n - k + 1) +
    k * Math.log(p) +
    (n - k) * Math.log(1 - p);
  return Math.exp(logProbability);
}

export function binomialCdf(n: number, k: number, p: number): number {
  if (!Number.isInteger(n) || n < 0 || p < 0 || p > 1) return Number.NaN;
  if (k < 0) return 0;
  if (k >= n) return 1;
  const upper = Math.floor(k);
  let total = 0;
  for (let index = 0; index <= upper; index += 1) total += binomialPmf(n, index, p);
  return clamp(total, 0, 1);
}

export function binomialTailAtLeast(n: number, k: number, p: number): number {
  if (!Number.isInteger(n) || n < 0 || p < 0 || p > 1) return Number.NaN;
  if (k <= 0) return 1;
  if (k > n) return 0;
  let total = 0;
  for (let index = Math.ceil(k); index <= n; index += 1) total += binomialPmf(n, index, p);
  return clamp(total, 0, 1);
}

export function binomialMoments(n: number, p: number) {
  return {
    mean: n * p,
    variance: n * p * (1 - p),
    sd: Math.sqrt(n * p * (1 - p)),
    mode: Math.floor((n + 1) * p),
  };
}

export function poissonPmf(lambda: number, k: number): number {
  if (!(lambda >= 0) || !Number.isInteger(k) || k < 0) return Number.NaN;
  if (lambda === 0) return k === 0 ? 1 : 0;
  return Math.exp(k * Math.log(lambda) - lambda - logGamma(k + 1));
}

export function poissonCdf(lambda: number, k: number): number {
  if (!(lambda >= 0) || k < 0) return Number.NaN;
  const upper = Math.floor(k);
  let term = Math.exp(-lambda);
  let total = term;
  for (let index = 1; index <= upper; index += 1) {
    term *= lambda / index;
    total += term;
  }
  return clamp(total, 0, 1);
}

export function poissonTailAtLeast(lambda: number, k: number): number {
  if (!(lambda >= 0)) return Number.NaN;
  if (k <= 0) return 1;
  if (k <= lambda) return clamp(1 - poissonCdf(lambda, k - 1), 0, 1);
  // Sum the tail directly when it is the smaller side; avoids 1 − CDF
  // cancellation for extreme counts.
  let term = poissonPmf(lambda, k);
  let total = term;
  for (let index = k + 1; index <= k + 400; index += 1) {
    term *= lambda / index;
    total += term;
    if (term < total * 1e-17) break;
  }
  return clamp(total, 0, 1);
}

export function poissonMoments(lambda: number) {
  return {
    mean: lambda,
    variance: lambda,
    sd: Math.sqrt(lambda),
    // The mode is floor(λ) for non-integer λ; for integer λ both λ−1 and λ
    // are modes. The record keeps that nuance rather than a false "always λ".
    mode: Number.isInteger(lambda) && lambda > 0 ? [lambda - 1, lambda] : [Math.floor(lambda)],
  };
}

/** Seeded Poisson draw. Knuth for small λ, normal approximation for large λ. */
export function poissonRandom(random: () => number, lambda: number): number {
  if (!(lambda > 0)) return 0;
  if (lambda < 30) {
    const limit = Math.exp(-lambda);
    let product = 1;
    let count = 0;
    do {
      count += 1;
      product *= random();
    } while (product > limit);
    return count - 1;
  }
  return Math.max(0, Math.round(normalRandom(random, lambda, Math.sqrt(lambda))));
}

// ---------------------------------------------------------------------------
// Estimation and inference
// ---------------------------------------------------------------------------

export interface MeanInterval {
  estimate: number;
  se: number;
  critical: number;
  margin: number;
  lower: number;
  upper: number;
  confidence: number;
  df: number | null;
  method: "z" | "t";
}

export function meanConfidenceInterval(options: {
  mean: number;
  sd: number;
  n: number;
  confidence: number;
  sigmaKnown?: boolean;
}): MeanInterval {
  const { mean: estimate, sd, n, confidence } = options;
  const sigmaKnown = options.sigmaKnown ?? false;
  const alpha = 1 - confidence;
  const se = sd / Math.sqrt(n);
  const critical = sigmaKnown ? normalQuantile(1 - alpha / 2) : studentTQuantile(1 - alpha / 2, n - 1);
  const margin = critical * se;
  return {
    estimate,
    se,
    critical,
    margin,
    lower: estimate - margin,
    upper: estimate + margin,
    confidence,
    df: sigmaKnown ? null : n - 1,
    method: sigmaKnown ? "z" : "t",
  };
}

/** Wilson score interval for a binomial proportion; defined at 0 and 1. */
export function wilsonInterval(successes: number, n: number, confidence = 0.95) {
  const p = successes / n;
  const z = normalQuantile(1 - (1 - confidence) / 2);
  const denominator = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / denominator;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denominator;
  return { p, lower: clamp(centre - half, 0, 1), upper: clamp(centre + half, 0, 1), centre, method: "wilson" as const };
}

export interface ProportionTest {
  pA: number;
  pB: number;
  nA: number;
  nB: number;
  successesA: number;
  successesB: number;
  difference: number;
  relativeLift: number;
  pooled: number;
  sePooled: number;
  seUnpooled: number;
  z: number;
  pValue: number;
  confidence: number;
  critical: number;
  interval: { lower: number; upper: number };
  warnings: string[];
}

export type Alternative = "two-sided" | "greater" | "less";

export function zTestPValue(z: number, alternative: Alternative): number {
  if (!Number.isFinite(z)) return Number.NaN;
  if (alternative === "greater") return 1 - normalCdf(z);
  if (alternative === "less") return normalCdf(z);
  return 2 * (1 - normalCdf(Math.abs(z)));
}

/**
 * Two independent proportions. The test uses the pooled null standard error
 * (valid under H₀: pA = pB); the confidence interval uses the unpooled SE.
 * Rates are proportions, so this is a proportions test, not a means test.
 */
export function twoProportionTest(options: {
  successesA: number;
  nA: number;
  successesB: number;
  nB: number;
  confidence?: number;
  alternative?: Alternative;
}): ProportionTest {
  const { successesA, nA, successesB, nB } = options;
  const confidence = options.confidence ?? 0.95;
  const alternative = options.alternative ?? "two-sided";
  const pA = successesA / nA;
  const pB = successesB / nB;
  const difference = pB - pA;
  const pooled = (successesA + successesB) / (nA + nB);
  const sePooled = Math.sqrt(pooled * (1 - pooled) * (1 / nA + 1 / nB));
  const seUnpooled = Math.sqrt((pA * (1 - pA)) / nA + (pB * (1 - pB)) / nB);
  const z = sePooled > 0 ? difference / sePooled : Number.NaN;
  const critical = normalQuantile(1 - (1 - confidence) / 2);
  const margin = critical * seUnpooled;
  const warnings: string[] = [];
  const expectedA = nA * pooled;
  const expectedB = nB * pooled;
  if (Math.min(expectedA, expectedB, nA - expectedA, nB - expectedB) < 5) {
    warnings.push(
      "At least one expected cell count is below 5; the normal approximation for a proportions test is weak. Read the interval as approximate and consider an exact method.",
    );
  }
  if (nA < 30 || nB < 30) {
    warnings.push("One arm has fewer than 30 observations; sampling noise will dominate the readout.");
  }
  if (Math.min(successesA, successesB, nA - successesA, nB - successesB) === 0) {
    warnings.push("A zero count is present; the Wald interval is unreliable. The reported interval uses the unpooled normal approximation.");
  }
  return {
    pA,
    pB,
    nA,
    nB,
    successesA,
    successesB,
    difference,
    relativeLift: pA > 0 ? difference / pA : Number.NaN,
    pooled,
    sePooled,
    seUnpooled,
    z,
    pValue: zTestPValue(z, alternative),
    confidence,
    critical,
    interval: { lower: difference - margin, upper: difference + margin },
    warnings,
  };
}

/** Two-sided power of a z-test for a mean with known σ, expressed in raw units. */
export function zTestPower(options: {
  effect: number;
  sigma: number;
  n: number;
  alpha: number;
}): { power: number; beta: number; ncp: number; critical: number } {
  const { effect, sigma, n, alpha } = options;
  const ncp = (Math.abs(effect) / sigma) * Math.sqrt(n);
  const critical = normalQuantile(1 - alpha / 2);
  const power = normalCdf(ncp - critical) + normalCdf(-ncp - critical);
  return { power: clamp(power, 0, 1), beta: 1 - clamp(power, 0, 1), ncp, critical };
}

// ---------------------------------------------------------------------------
// Association
// ---------------------------------------------------------------------------

export interface Regression {
  slope: number;
  intercept: number;
  r: number;
  r2: number;
  n: number;
  predict: (x: number) => number;
}

export function pearson(xs: readonly number[], ys: readonly number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return Number.NaN;
  let meanX = 0;
  let meanY = 0;
  for (let index = 0; index < n; index += 1) {
    meanX += xs[index];
    meanY += ys[index];
  }
  meanX /= n;
  meanY /= n;
  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;
  for (let index = 0; index < n; index += 1) {
    const dx = xs[index] - meanX;
    const dy = ys[index] - meanY;
    covariance += dx * dy;
    varianceX += dx * dx;
    varianceY += dy * dy;
  }
  if (varianceX === 0 || varianceY === 0) return Number.NaN;
  return clamp(covariance / Math.sqrt(varianceX * varianceY), -1, 1);
}

export function linearRegression(xs: readonly number[], ys: readonly number[]): Regression {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) {
    return { slope: Number.NaN, intercept: Number.NaN, r: Number.NaN, r2: Number.NaN, n, predict: () => Number.NaN };
  }
  const meanX = mean(xs.slice(0, n));
  const meanY = mean(ys.slice(0, n));
  let sxy = 0;
  let sxx = 0;
  for (let index = 0; index < n; index += 1) {
    sxy += (xs[index] - meanX) * (ys[index] - meanY);
    sxx += (xs[index] - meanX) ** 2;
  }
  const slope = sxx === 0 ? Number.NaN : sxy / sxx;
  const intercept = meanY - slope * meanX;
  const r = pearson(xs, ys);
  return {
    slope,
    intercept,
    r,
    r2: Number.isFinite(r) ? r * r : Number.NaN,
    n,
    predict: (x: number) => intercept + slope * x,
  };
}

// ---------------------------------------------------------------------------
// Sampling simulations
// ---------------------------------------------------------------------------

export type PopulationShape = "normal" | "uniform" | "skewed";

export interface PopulationSpec {
  shape: PopulationShape;
  label: string;
  mean: number;
  sd: number;
  draw: (random: () => number) => number;
}

export function populationSpec(shape: PopulationShape): PopulationSpec {
  if (shape === "normal") {
    return {
      shape,
      label: "Normal (μ = 50, σ = 15)",
      mean: 50,
      sd: 15,
      draw: (random) => normalRandom(random, 50, 15),
    };
  }
  if (shape === "uniform") {
    return {
      shape,
      label: "Uniform (0–100)",
      mean: 50,
      sd: 100 / Math.sqrt(12),
      draw: (random) => uniformRandom(random, 0, 100),
    };
  }
  return {
    shape,
    label: "Right-skewed (exponential, mean = 15)",
    mean: 15,
    sd: 15,
    draw: (random) => exponentialRandom(random, 1 / 15),
  };
}

export interface SamplingResult {
  means: number[];
  draws: number;
  n: number;
  populationMean: number;
  populationSd: number;
  empiricalMean: number;
  empiricalSe: number;
  theoreticalSe: number;
  seed: number;
  shape: PopulationShape;
}

export function simulateSampleMeans(options: {
  shape: PopulationShape;
  n: number;
  draws: number;
  seed: number;
}): SamplingResult {
  const spec = populationSpec(options.shape);
  const random = mulberry32(options.seed);
  const means: number[] = [];
  for (let index = 0; index < options.draws; index += 1) {
    means.push(sampleMean(random, options.n, () => spec.draw(random)));
  }
  return {
    means,
    draws: options.draws,
    n: options.n,
    populationMean: spec.mean,
    populationSd: spec.sd,
    empiricalMean: mean(means),
    empiricalSe: standardDeviation(means, { sample: true }),
    theoreticalSe: spec.sd / Math.sqrt(options.n),
    seed: options.seed,
    shape: options.shape,
  };
}

export interface CoverageTrial {
  estimate: number;
  lower: number;
  upper: number;
  covered: boolean;
  method: "z" | "t";
}

export interface CoverageResult {
  trueMean: number;
  sigma: number;
  n: number;
  confidence: number;
  trials: number;
  covered: number;
  coverage: number;
  meanWidth: number;
  intervals: CoverageTrial[];
  seed: number;
  sigmaKnown: boolean;
}

/**
 * Repeated-sample coverage. Each trial is a fresh sample, so the observed
 * coverage is honestly random around the nominal level; it is never forced to
 * equal 95%.
 */
export function simulateCoverage(options: {
  trueMean?: number;
  sigma?: number;
  n: number;
  confidence: number;
  trials: number;
  seed: number;
  sigmaKnown?: boolean;
}): CoverageResult {
  const trueMean = options.trueMean ?? 100;
  const sigma = options.sigma ?? 15;
  const sigmaKnown = options.sigmaKnown ?? true;
  const random = mulberry32(options.seed);
  const intervals: CoverageTrial[] = [];
  for (let trial = 0; trial < options.trials; trial += 1) {
    const values = Array.from({ length: options.n }, () => normalRandom(random, trueMean, sigma));
    const estimate = mean(values);
    const sd = sigmaKnown ? sigma : standardDeviation(values, { sample: true });
    const interval = meanConfidenceInterval({
      mean: estimate,
      sd,
      n: options.n,
      confidence: options.confidence,
      sigmaKnown,
    });
    intervals.push({
      estimate,
      lower: interval.lower,
      upper: interval.upper,
      covered: interval.lower <= trueMean && trueMean <= interval.upper,
      method: interval.method,
    });
  }
  const covered = intervals.filter((interval) => interval.covered).length;
  return {
    trueMean,
    sigma,
    n: options.n,
    confidence: options.confidence,
    trials: options.trials,
    covered,
    coverage: covered / options.trials,
    meanWidth: mean(intervals.map((interval) => interval.upper - interval.lower)),
    intervals,
    seed: options.seed,
    sigmaKnown,
  };
}

// ---------------------------------------------------------------------------
// Histograms and formatting
// ---------------------------------------------------------------------------

export interface HistogramBin {
  x0: number;
  x1: number;
  count: number;
  density: number;
}

export function histogram(values: readonly number[], binCount = 20): { bins: HistogramBin[]; max: number; total: number } {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return { bins: [], max: 0, total: 0 };
  const low = Math.min(...clean);
  const high = Math.max(...clean);
  const width = high === low ? 1 : (high - low) / binCount;
  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, index) => ({
    x0: low + index * width,
    x1: low + (index + 1) * width,
    count: 0,
    density: 0,
  }));
  for (const value of clean) {
    let index = Math.floor((value - low) / width);
    if (index >= binCount) index = binCount - 1;
    if (index < 0) index = 0;
    bins[index].count += 1;
  }
  for (const bin of bins) bin.density = bin.count / (clean.length * width);
  return { bins, max: Math.max(...bins.map((bin) => bin.count)), total: clean.length };
}

export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatPercent(fraction: number, digits = 2): string {
  if (!Number.isFinite(fraction)) return "—";
  return `${formatNumber(fraction * 100, digits)}%`;
}

export function formatPValue(p: number): string {
  if (!Number.isFinite(p)) return "—";
  if (p < 0.0001) return "< 0.0001";
  return formatNumber(p, p < 0.01 ? 5 : 4);
}

export function formatSigned(value: number, digits = 2, unit = ""): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatNumber(Math.abs(value), digits)}${unit}`;
}
