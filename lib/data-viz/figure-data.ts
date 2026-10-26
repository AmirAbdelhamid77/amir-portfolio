// Pure data and statistics for the live teaching figures. No React, no DOM,
// no randomness at render time: every sample comes from a fixed seed so the
// chart, the printed table and the unit tests agree.

/* -------------------------------------------------------------------------- */
/* Anscombe's quartet (published data, not synthetic)                         */
/* -------------------------------------------------------------------------- */

export interface XY {
  x: number;
  y: number;
}

export const ANSCOMBE_LABELS = ["Cloud", "Ring", "X shape", "Two clusters"] as const;

export const ANSCOMBE: Record<(typeof ANSCOMBE_LABELS)[number], XY[]> = {
  Cloud: [
    { x: 10, y: 8.04 },
    { x: 8, y: 6.95 },
    { x: 13, y: 7.58 },
    { x: 9, y: 8.81 },
    { x: 11, y: 8.33 },
    { x: 14, y: 9.96 },
    { x: 6, y: 7.24 },
    { x: 4, y: 4.26 },
    { x: 12, y: 10.84 },
    { x: 7, y: 4.82 },
    { x: 5, y: 5.68 },
  ],
  Ring: [
    { x: 10, y: 9.14 },
    { x: 8, y: 8.14 },
    { x: 13, y: 8.74 },
    { x: 9, y: 8.77 },
    { x: 11, y: 9.26 },
    { x: 14, y: 8.1 },
    { x: 6, y: 6.13 },
    { x: 4, y: 3.1 },
    { x: 12, y: 9.13 },
    { x: 7, y: 7.26 },
    { x: 5, y: 4.74 },
  ],
  "X shape": [
    { x: 10, y: 7.46 },
    { x: 8, y: 6.77 },
    { x: 13, y: 12.74 },
    { x: 9, y: 7.11 },
    { x: 11, y: 7.81 },
    { x: 14, y: 8.84 },
    { x: 6, y: 6.08 },
    { x: 4, y: 5.39 },
    { x: 12, y: 8.15 },
    { x: 7, y: 6.42 },
    { x: 5, y: 5.73 },
  ],
  "Two clusters": [
    { x: 8, y: 6.58 },
    { x: 8, y: 5.76 },
    { x: 8, y: 7.71 },
    { x: 8, y: 8.84 },
    { x: 8, y: 8.47 },
    { x: 8, y: 7.04 },
    { x: 8, y: 5.25 },
    { x: 19, y: 12.5 },
    { x: 8, y: 5.56 },
    { x: 8, y: 7.91 },
    { x: 8, y: 6.89 },
  ],
};

export interface QuartetSummary {
  meanX: number;
  meanY: number;
  varianceX: number;
  varianceY: number;
  correlation: number;
  slope: number;
  intercept: number;
}

/** Sample variance (n − 1) and Pearson r, computed from the points. */
export function quartetSummary(points: readonly XY[]): QuartetSummary {
  const n = points.length;
  if (!n) {
    return { meanX: 0, meanY: 0, varianceX: 0, varianceY: 0, correlation: 0, slope: 0, intercept: 0 };
  }
  const meanX = points.reduce((total, point) => total + point.x, 0) / n;
  const meanY = points.reduce((total, point) => total + point.y, 0) / n;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const point of points) {
    const dx = point.x - meanX;
    const dy = point.y - meanY;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  const denominator = Math.sqrt(sxx * syy);
  const correlation = denominator ? sxy / denominator : 0;
  const slope = sxx ? sxy / sxx : 0;
  return {
    meanX,
    meanY,
    varianceX: n > 1 ? sxx / (n - 1) : 0,
    varianceY: n > 1 ? syy / (n - 1) : 0,
    correlation,
    slope,
    intercept: meanY - slope * meanX,
  };
}

export const QUARTET_SUMMARIES = ANSCOMBE_LABELS.map((label) => ({
  label,
  points: ANSCOMBE[label],
  summary: quartetSummary(ANSCOMBE[label]),
}));

/** Largest absolute difference between any set and the first set, per statistic. */
export function quartetMaxDifference() {
  const base = QUARTET_SUMMARIES[0].summary;
  const keys: (keyof QuartetSummary)[] = [
    "meanX",
    "meanY",
    "varianceX",
    "varianceY",
    "correlation",
    "slope",
    "intercept",
  ];
  return Object.fromEntries(
    keys.map((key) => [
      key,
      Math.max(...QUARTET_SUMMARIES.map((set) => Math.abs(set.summary[key] - base[key]))),
    ]),
  ) as Record<keyof QuartetSummary, number>;
}

/* -------------------------------------------------------------------------- */
/* Seeded samples for the histogram and mixture figures                       */
/* -------------------------------------------------------------------------- */

/** Small deterministic PRNG; the same seed always produces the same sample. */
export function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(random: () => number) {
  const u = Math.max(random(), Number.EPSILON);
  const v = Math.max(random(), Number.EPSILON);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export type HistogramShape = "unimodal" | "bimodal" | "skewed";

export const HISTOGRAM_SHAPES: { id: HistogramShape; label: string; note: string }[] = [
  { id: "unimodal", label: "Unimodal", note: "One process, roughly symmetric." },
  { id: "bimodal", label: "Bimodal", note: "Two processes, one chart." },
  { id: "skewed", label: "Right-skewed", note: "A long tail points right." },
];

const HISTOGRAM_COPY: Record<HistogramShape, string> = {
  unimodal: "One process",
  bimodal: "Two processes",
  skewed: "A long right tail",
};

export function histogramSample(shape: HistogramShape, n = 160): number[] {
  const random = mulberry32(shape === "unimodal" ? 11 : shape === "bimodal" ? 29 : 47);
  const values: number[] = [];
  for (let index = 0; index < n; index += 1) {
    if (shape === "unimodal") {
      values.push(70 + normal(random) * 11);
    } else if (shape === "bimodal") {
      const high = index % 2 === 0;
      values.push((high ? 84 : 56) + normal(random) * 5.5);
    } else {
      // Exponential with mean 24, shifted to start near 40.
      values.push(40 + -Math.log(Math.max(random(), Number.EPSILON)) * 24);
    }
  }
  return values.map((value) => Math.round(value * 10) / 10);
}

export function histogramCopy(shape: HistogramShape) {
  return HISTOGRAM_COPY[shape];
}

/**
 * Local maxima in the drawn bin counts, after a three-bin moving average.
 *
 * The smoothing matters: raw counts on a seeded sample produce tiny one-count
 * wobbles that would be reported as "peaks". A real second process survives the
 * smoothing; sampling noise does not. The 50%-of-tallest floor keeps a long tail
 * from counting as a mode of its own.
 */
export function countModes(counts: readonly number[]): number {
  if (!counts.length) return 0;
  const smooth = counts.map((value, index) => {
    const before = counts[index - 1] ?? value;
    const after = counts[index + 1] ?? value;
    return (before + value + after) / 3;
  });
  const peak = Math.max(...smooth);
  if (peak <= 0) return 0;
  const threshold = peak * 0.5;
  let modes = 0;
  for (let index = 0; index < smooth.length; index += 1) {
    const value = smooth[index];
    const before = smooth[index - 1] ?? -Infinity;
    const after = smooth[index + 1] ?? -Infinity;
    if (value >= threshold && value > before && value >= after) modes += 1;
  }
  return Math.max(1, modes);
}

/* -------------------------------------------------------------------------- */
/* Same-mean mixture                                                          */
/* -------------------------------------------------------------------------- */

export interface MixtureSample {
  teamA: number[];
  teamB: number[];
  meanA: number;
  meanB: number;
  sdA: number;
  sdB: number;
  medianB: number;
  shareHigh: number;
}

/** Deterministic noise pattern so the sample does not jump between renders. */
const NOISE = Array.from({ length: 40 }, (_, index) => {
  const random = mulberry32(1000 + index);
  return normal(random);
});

/**
 * Team B is a two-point mixture whose mean stays at 70 for every share.
 * With high share s, the low centre is 70 − 12s and the high centre is
 * 70 + 12(1 − s), so (1 − s)·low + s·high = 70 exactly.
 */
export function mixtureSample(shareHigh: number): MixtureSample {
  const s = Math.min(1, Math.max(0, shareHigh));
  const low = 70 - 12 * s;
  const high = 70 + 12 * (1 - s);
  const countHigh = Math.round(s * 40);
  const teamB = NOISE.map((noise, index) =>
    Math.round((index < countHigh ? high : low) + noise * 1.6),
  );
  const teamA = NOISE.map((noise) => Math.round(70 + noise * 3.4));
  const mean = (values: number[]) => values.reduce((total, value) => total + value, 0) / values.length;
  const sd = (values: number[]) => {
    const average = mean(values);
    return Math.sqrt(
      values.reduce((total, value) => total + (value - average) ** 2, 0) / Math.max(1, values.length - 1),
    );
  };
  const sorted = [...teamB].sort((a, b) => a - b);
  const medianB =
    sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  return {
    teamA,
    teamB,
    meanA: mean(teamA),
    meanB: mean(teamB),
    sdA: sd(teamA),
    sdB: sd(teamB),
    medianB,
    shareHigh: s,
  };
}

/* -------------------------------------------------------------------------- */
/* Simpson and funnel arithmetic                                              */
/* -------------------------------------------------------------------------- */

export interface SegmentArm {
  converted: number;
  total: number;
}

export interface Segment {
  id: string;
  label: string;
  control: SegmentArm;
  treatment: SegmentArm;
}

export function armRate(arm: SegmentArm): number {
  return arm.total ? arm.converted / arm.total : 0;
}

export function pooledRate(segments: readonly Segment[], arm: "control" | "treatment"): {
  converted: number;
  total: number;
  rate: number;
} {
  const converted = segments.reduce((total, segment) => total + segment[arm].converted, 0);
  const total = segments.reduce((sum, segment) => sum + segment[arm].total, 0);
  return { converted, total, rate: total ? converted / total : 0 };
}

/** Apply one arm's segment mix to the other arm's within-segment rates. */
export function standardizedRate(
  segments: readonly Segment[],
  arm: "control" | "treatment",
  mix: "control" | "treatment",
): number {
  const mixTotal = segments.reduce((total, segment) => total + segment[mix].total, 0);
  if (!mixTotal) return 0;
  return segments.reduce(
    (total, segment) => total + (segment[mix].total / mixTotal) * armRate(segment[arm]),
    0,
  );
}

/** Rebuild Simpson's pooled comparison under a chosen treatment mix. */
export function simpsonAtMix(segments: readonly Segment[], treatmentReturningShare: number) {
  const control = pooledRate(segments, "control");
  const rates = segments.map((segment) => armRate(segment.treatment));
  const total = segments.reduce((sum, segment) => sum + segment.treatment.total, 0);
  const returning = Math.min(1, Math.max(0, treatmentReturningShare));
  const sizes = [1 - returning, returning];
  const treatment = segments.map((segment, index) => {
    const rate = rates[index];
    const armTotal = total * sizes[index];
    return { segment, size: armTotal, converted: armTotal * rate, rate };
  });
  const pooled = treatment.reduce((sum, row) => sum + row.converted, 0);
  const standardized = segments.reduce(
    (sum, segment, index) => sum + (segment.control.total / control.total) * treatment[index].rate,
    0,
  );
  return {
    control: control.rate,
    pooledTreatment: total ? pooled / total : 0,
    standardizedTreatment: standardized,
    treatment,
  };
}

export interface FunnelStage {
  id: string;
  label: string;
  value: number;
}

export interface FunnelLink {
  id: string;
  source: string;
  target: string;
  value: number;
}

/**
 * Convert ordered stage counts into additive flows. The drop at each stage is
 * sent to its own rejection node, so every node's links balance exactly.
 */
export function funnelLinks(stages: readonly FunnelStage[]): FunnelLink[] {
  const links: FunnelLink[] = [];
  for (let index = 0; index < stages.length - 1; index += 1) {
    const from = stages[index];
    const to = stages[index + 1];
    const drop = from.value - to.value;
    links.push({ id: `${from.id}-to-${to.id}`, source: from.id, target: to.id, value: to.value });
    if (drop > 0) {
      links.push({
        id: `${from.id}-drop`,
        source: from.id,
        target: `drop-${from.id}`,
        value: drop,
      });
    }
  }
  return links;
}

/* -------------------------------------------------------------------------- */
/* Composition over time                                                      */
/* -------------------------------------------------------------------------- */

export interface CompositionSeriesData {
  id: string;
  name: string;
  color: string;
  values: number[];
}

export const COMPOSITION_PERIODS = [
  "Q1 24",
  "Q2 24",
  "Q3 24",
  "Q4 24",
  "Q1 25",
  "Q2 25",
  "Q3 25",
  "Q4 25",
];

export const COMPOSITION_SERIES: CompositionSeriesData[] = [
  {
    id: "subscriptions",
    name: "Subscriptions",
    color: "var(--chart-1)",
    values: [420, 448, 471, 503, 526, 548, 575, 601],
  },
  {
    id: "services",
    name: "Services",
    color: "var(--chart-2)",
    values: [180, 176, 190, 188, 201, 196, 208, 214],
  },
  {
    id: "support",
    name: "Support",
    color: "var(--chart-3)",
    values: [64, 70, 66, 74, 78, 82, 80, 88],
  },
];

export function compositionShares(index: number): { id: string; share: number }[] {
  const total = COMPOSITION_SERIES.reduce(
    (sum, series) => sum + (series.values[index] ?? 0),
    0,
  );
  return COMPOSITION_SERIES.map((series) => ({
    id: series.id,
    share: total ? ((series.values[index] ?? 0) / total) * 100 : 0,
  }));
}

/* -------------------------------------------------------------------------- */
/* Channel mix for the angle/length comparison                                */
/* -------------------------------------------------------------------------- */

export const CHANNEL_MIX = [
  { id: "organic", name: "Organic search", value: 41, color: "var(--chart-1)" },
  { id: "paid", name: "Paid search", value: 24, color: "var(--chart-2)" },
  { id: "direct", name: "Direct", value: 16, color: "var(--chart-3)" },
  { id: "email", name: "Email", value: 11, color: "var(--chart-4)" },
  { id: "referral", name: "Referral", value: 8, color: "var(--chart-5)" },
];

/* -------------------------------------------------------------------------- */
/* Encoding channels                                                          */
/* -------------------------------------------------------------------------- */

export const ENCODING_CHANNELS = [
  {
    id: "position",
    label: "Position on a common scale",
    rank: 1,
    why: "A shared axis makes differences readable to a few pixels. Bars, dots and scatter plots start here.",
  },
  {
    id: "unaligned",
    label: "Position on unaligned scales",
    rank: 2,
    why: "Small multiples keep position but move the axis; still strong for shape, weaker for exact values.",
  },
  {
    id: "length",
    label: "Length",
    rank: 3,
    why: "Bars compare well from a common zero baseline. Chop the baseline and the encoding stops being length.",
  },
  {
    id: "angle",
    label: "Angle / area",
    rank: 4,
    why: "Pies and bubbles degrade quickly; adjacent slices and similar areas are hard to rank.",
  },
  {
    id: "colour",
    label: "Colour / size / opacity",
    rank: 5,
    why: "Useful as a secondary channel for groups, not for precise comparisons.",
  },
];

/* -------------------------------------------------------------------------- */
/* Pipeline and dashboard scenarios                                           */
/* -------------------------------------------------------------------------- */

export const PIPELINE_STAGES = [
  { id: "question", label: "Question", prompt: "What decision changes if this is answered?" },
  { id: "decision", label: "Decision", prompt: "What action follows, and who takes it?" },
  { id: "grain", label: "Grain", prompt: "One row of the data represents what, exactly?" },
  { id: "variables", label: "Variables", prompt: "Which fields carry the claim, and what type are they?" },
  { id: "task", label: "Task", prompt: "Compare, trend, distribute, relate, compose or track stages?" },
  { id: "encoding", label: "Encoding", prompt: "Which channel carries the value and which confirms it?" },
  { id: "scale", label: "Scale", prompt: "Where is zero, and does the axis earn its range?" },
  { id: "context", label: "Context", prompt: "Window, denominator, target and unit — all visible?" },
  { id: "integrity", label: "Integrity", prompt: "What would make this chart lie, and is it ruled out?" },
  { id: "action", label: "Action", prompt: "What should the reader do next, in one sentence?" },
];

export interface PipelineScenario {
  id: string;
  label: string;
  stageCopy: string[];
  skip: string;
}

export const PIPELINE_SCENARIOS: PipelineScenario[] = [
  {
    id: "churn",
    label: "Why did churn rise?",
    skip:
      "Skip Grain and you compare accounts with users; the churn rate doubles before anyone notices.",
    stageCopy: [
      "Should we change onboarding this quarter?",
      "Refresh the welcome sequence for the at-risk segment.",
      "One paying account per month, not one user per event.",
      "Plan, tenure, seats, support tickets, onboarding completion.",
      "Compare at-risk and retained cohorts; then trend the gap.",
      "Position for the cohort gap; a small table for ticket counts.",
      "Zero-baseline bars for rates; no truncated axis on a 3-point difference.",
      "28-day window, active accounts denominator, prior-quarter target.",
      "Small counts in the at-risk cohort: show n and interval, not just a percentage.",
      "Review onboarding step 2 for the at-risk segment this sprint.",
    ],
  },
  {
    id: "revenue",
    label: "Report quarterly revenue",
    skip:
      "Skip Scale and a 4% quarter-over-quarter gain looks like a spike on a chopped axis.",
    stageCopy: [
      "Is the quarter on plan, and where is the gap?",
      "Adjust the forecast and the hiring plan.",
      "One invoice line per month; recognised revenue, not bookings.",
      "Segment, region, month, recognised amount, target.",
      "Trend the total; compare segments; explain the variance.",
      "Position for the trend; length for the segment contribution.",
      "Zero baseline for contribution; indexed axis only for growth rates.",
      "Fiscal quarter, recognised revenue, plan vs actual, currency.",
      "Mix shift can raise the total while every segment falls; show both.",
      "Close the gap in enterprise renewals before adding spend.",
    ],
  },
  {
    id: "outliers",
    label: "Are these outliers real?",
    skip:
      "Skip Integrity and a logging bug becomes an “insight” with a confident caption.",
    stageCopy: [
      "Do we exclude these records from the model?",
      "Fix the ingestion rule or keep the extreme values.",
      "One order per row, with a timestamp and a source system.",
      "Order value, channel, timestamp, ingestion latency.",
      "See the distribution, then compare channels.",
      "Position on a dot strip; retain the raw points.",
      "Log scale only if the ratio matters; label it clearly.",
      "Sample window, n, known promotions, ingestion cut-off.",
      "Check duplicates and decimal shifts before calling anything an outlier.",
      "Quarantine the batch, then re-run the check with the fixed rule.",
    ],
  },
];

export const DASHBOARD_TIERS = [
  { id: "context", label: "Context", question: "Who, when, scope" },
  { id: "kpi", label: "KPI / status", question: "Are we on track?" },
  { id: "explanation", label: "Explanation", question: "Why did it move?" },
  { id: "detail", label: "Detail", question: "Which segment, which grain?" },
  { id: "action", label: "Action", question: "What happens next?" },
];

export const DASHBOARD_SCENARIOS = [
  {
    id: "ops",
    label: "Weekly operations review",
    tiers: [
      "EU fulfilment · week 42 · all carriers",
      "On-time delivery 94.2% vs 96% target (red)",
      "Late hand-offs at the Cairo hub explain 0.9 of the 1.8-point gap",
      "Cairo by carrier and day; 81% on-time on the express lane",
      "Move the express cut-off 30 minutes earlier for two weeks",
    ],
  },
  {
    id: "exec",
    label: "Monthly executive summary",
    tiers: [
      "Company · September · recognised revenue",
      "Revenue 102% of plan, gross margin 61% (green)",
      "Enterprise renewals offset a self-serve decline",
      "Segment × region contribution, with the plan variance",
      "Approve two enterprise hires; investigate self-serve onboarding",
    ],
  },
  {
    id: "support",
    label: "Support queue triage",
    tiers: [
      "Tier-1 queue · today · all channels",
      "Median first response 18 min vs 15 min target",
      "Email backlog grew after the release; chat is stable",
      "Backlog by hour and topic; 62% is one billing question",
      "Publish the billing FAQ and reassign two agents to email",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* KPI and uncertainty teaching values                                        */
/* -------------------------------------------------------------------------- */

export const KPI = {
  metric: "On-time delivery",
  window: "last 28 days",
  value: 94.2,
  target: 96,
  prior: 94.8,
  exception: "Cairo hub, express lane: 81%",
  spark: [95.4, 95.1, 94.9, 95.0, 94.6, 94.4, 94.8, 94.2],
};

export interface Estimate {
  id: string;
  label: string;
  effect: number;
  low: number;
  high: number;
  note: string;
  flag?: "implausible" | "wide";
}

export const UNCERTAINTY_ESTIMATES: Estimate[] = [
  {
    id: "onboarding",
    label: "Onboarding change",
    effect: 2.1,
    low: 0.6,
    high: 3.6,
    note: "Detectable, but smaller than the 5-point bar the team agreed to act on.",
  },
  {
    id: "too-precise",
    label: "Vendor claim",
    effect: 2.1,
    low: 2.0,
    high: 2.2,
    note: "A 0.2-point interval on a 2-point effect is a assumptions warning, not precision.",
    flag: "implausible",
  },
  {
    id: "small",
    label: "Small pilot",
    effect: 6.2,
    low: -1.4,
    high: 13.8,
    note: "The point estimate clears the bar; the interval does not.",
    flag: "wide",
  },
];

export function uncertaintyVerdict(
  estimate: Estimate,
  threshold: number,
): "decision-sized" | "detectable-only" | "inconclusive" {
  if (estimate.low > threshold) return "decision-sized";
  if (estimate.low > 0) return "detectable-only";
  return "inconclusive";
}
