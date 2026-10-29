// Pure statistical helpers used by the interactive labs. No React, no DOM, no
// charting library — this module is what the tests exercise, so the numbers on
// screen can be trusted independently of the drawing code.

export interface Extent {
  min: number;
  max: number;
}

export interface TickScale extends Extent {
  step: number;
  ticks: number[];
}

export function extent(values: readonly number[]): Extent {
  if (!values.length) return { min: 0, max: 0 };
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (!Number.isFinite(value)) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (min === Infinity) return { min: 0, max: 0 };
  return { min, max };
}

export function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function mean(values: readonly number[]): number {
  return values.length ? sum(values) / values.length : 0;
}

export function roundTo(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function niceNum(range: number, round: boolean): number {
  if (range <= 0 || !Number.isFinite(range)) return 1;
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / 10 ** exponent;
  let nice: number;
  if (round) {
    nice = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  } else {
    nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  }
  return nice * 10 ** exponent;
}

/** Axis ticks on human round numbers, including negative ranges. */
export function niceScale(min: number, max: number, count = 5): TickScale {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: 0, max: 1, step: 1, ticks: [0, 1] };
  }
  if (min === max) {
    const pad = min === 0 ? 1 : Math.abs(min) * 0.1;
    min -= pad;
    max += pad;
  }
  const safeCount = Math.max(2, Math.round(count));
  const range = niceNum(max - min, false);
  const step = niceNum(range / (safeCount - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = niceMin; value <= niceMax + step * 1e-9; value += step) {
    ticks.push(roundTo(value, 6));
  }
  return { min: roundTo(niceMin, 6), max: roundTo(niceMax, 6), step: roundTo(step, 6), ticks };
}

export interface Bin {
  x0: number;
  x1: number;
  count: number;
}

export interface Histogram {
  bins: Bin[];
  binWidth: number;
  min: number;
  max: number;
  counts: number[];
}

/** Fixed bin width makes the bin-width lesson measurable rather than decorative. */
export function histogram(
  values: readonly number[],
  options: { binWidth?: number; binCount?: number } = {},
): Histogram {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return { bins: [], binWidth: 0, min: 0, max: 0, counts: [] };
  const { min, max } = extent(clean);
  const binCount = Math.max(1, Math.round(options.binCount ?? 10));
  const width =
    options.binWidth && options.binWidth > 0
      ? options.binWidth
      : Math.max((max - min) / binCount, Number.EPSILON);
  const start = Math.floor(min / width) * width;
  const stop = max === start ? start + width : max;
  const total = Math.max(1, Math.ceil((stop - start) / width));
  const bins: Bin[] = Array.from({ length: total }, (_, index) => ({
    x0: roundTo(start + index * width, 6),
    x1: roundTo(start + (index + 1) * width, 6),
    count: 0,
  }));
  for (const value of clean) {
    let index = Math.floor((value - start) / width);
    if (index < 0) index = 0;
    if (index >= bins.length) index = bins.length - 1;
    bins[index].count += 1;
  }
  return {
    bins,
    binWidth: roundTo(width, 6),
    min: roundTo(start, 6),
    max: roundTo(start + bins.length * width, 6),
    counts: bins.map((bin) => bin.count),
  };
}

/** Linear-interpolation quantile (the same definition Excel's PERCENTILE.INC uses). */
export function quantile(values: readonly number[], p: number): number {
  const clean = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!clean.length) return NaN;
  if (clean.length === 1) return clean[0];
  const position = (clean.length - 1) * Math.min(1, Math.max(0, p));
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return clean[lower];
  return clean[lower] + (clean[upper] - clean[lower]) * (position - lower);
}

export interface BoxStats {
  min: number;
  max: number;
  q1: number;
  median: number;
  q3: number;
  iqr: number;
  lowerFence: number;
  upperFence: number;
  whiskerLow: number;
  whiskerHigh: number;
  outliers: number[];
  mean: number;
  n: number;
}

export function boxStats(values: readonly number[]): BoxStats {
  const clean = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!clean.length) {
    return {
      min: 0, max: 0, q1: 0, median: 0, q3: 0, iqr: 0,
      lowerFence: 0, upperFence: 0, whiskerLow: 0, whiskerHigh: 0,
      outliers: [], mean: 0, n: 0,
    };
  }
  const q1 = quantile(clean, 0.25);
  const median = quantile(clean, 0.5);
  const q3 = quantile(clean, 0.75);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const inside = clean.filter((value) => value >= lowerFence && value <= upperFence);
  return {
    min: clean[0],
    max: clean[clean.length - 1],
    q1,
    median,
    q3,
    iqr,
    lowerFence,
    upperFence,
    whiskerLow: inside.length ? inside[0] : median,
    whiskerHigh: inside.length ? inside[inside.length - 1] : median,
    outliers: clean.filter((value) => value < lowerFence || value > upperFence),
    mean: mean(clean),
    n: clean.length,
  };
}

export function pearson(xs: readonly number[], ys: readonly number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return NaN;
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let cov = 0;
  let vx = 0;
  let vy = 0;
  for (let index = 0; index < n; index += 1) {
    const dx = xs[index] - mx;
    const dy = ys[index] - my;
    cov += dx * dy;
    vx += dx * dx;
    vy += dy * dy;
  }
  if (vx === 0 || vy === 0) return NaN;
  return cov / Math.sqrt(vx * vy);
}

export interface Regression {
  slope: number;
  intercept: number;
  r2: number;
  predict: (x: number) => number;
}

export function linearRegression(xs: readonly number[], ys: readonly number[]): Regression {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) {
    return { slope: 0, intercept: ys[0] ?? 0, r2: 0, predict: () => ys[0] ?? 0 };
  }
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let cov = 0;
  let vx = 0;
  for (let index = 0; index < n; index += 1) {
    cov += (xs[index] - mx) * (ys[index] - my);
    vx += (xs[index] - mx) ** 2;
  }
  const slope = vx === 0 ? 0 : cov / vx;
  const intercept = my - slope * mx;
  const r = pearson(xs, ys);
  return {
    slope,
    intercept,
    r2: Number.isFinite(r) ? r * r : 0,
    predict: (x: number) => intercept + slope * x,
  };
}

export interface LinearScale {
  (value: number): number;
  invert: (pixel: number) => number;
}

export function scaleLinear(domain: Extent, range: Extent): LinearScale {
  const span = domain.max - domain.min || 1;
  const travel = range.max - range.min;
  const fn = ((value: number) =>
    range.min + ((value - domain.min) / span) * travel) as LinearScale;
  fn.invert = (pixel: number) => domain.min + ((pixel - range.min) / (travel || 1)) * span;
  return fn;
}

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function percent(part: number, whole: number, digits = 1): string {
  if (!whole) return "—";
  return `${((part / whole) * 100).toFixed(digits)}%`;
}

/** The last `window` points, used by the cherry-picking demo. */
export function tail<T>(values: readonly T[], size: number): T[] {
  return values.slice(Math.max(0, values.length - size));
}
