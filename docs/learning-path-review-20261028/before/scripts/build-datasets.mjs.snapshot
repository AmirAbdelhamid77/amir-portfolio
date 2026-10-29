// Generates the local, synthetic teaching datasets used by the interactive
// labs. Nothing here is real customer or employer data. The generator is
// deterministic: the same seed always produces byte-identical output, so the
// charts, the numbers in the tables and the tests cannot drift apart.
//
//   node scripts/build-datasets.mjs
//   node scripts/build-datasets.mjs --check   # fail if out of date
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "content", "data-viz", "datasets.json");
const CHECK = process.argv.includes("--check");
const SEED = 20261023;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function normal(random) {
  // Box–Muller, one value per call.
  const u = Math.max(random(), 1e-9);
  const v = Math.max(random(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function series(seed, length, fn) {
  const random = mulberry32(seed);
  return Array.from({ length }, (_, index) => round(fn(index, random), 3));
}

function dataset(id, label, unit, kind, extra) {
  return {
    id,
    label,
    unit,
    kind,
    synthetic: true,
    ...extra,
  };
}

// ---------------------------------------------------------------------------
// 1. Histogram — right-skewed order values
// ---------------------------------------------------------------------------
const orderValues = series(SEED + 1, 140, (_, random) => {
  const value = 24 + Math.exp(normal(random) * 0.55) * 38 + random() * 30;
  return Math.min(420, value);
});

// ---------------------------------------------------------------------------
// 2. Box — delivery minutes by courier
// ---------------------------------------------------------------------------
const couriers = [
  { id: "north", label: "North depot", mean: 27, sd: 5.5 },
  { id: "east", label: "East depot", mean: 33, sd: 8.5 },
  { id: "south", label: "South depot", mean: 39, sd: 6.5 },
  { id: "west", label: "West depot", mean: 25, sd: 4.2 },
];
const delivery = couriers.map((courier, index) => ({
  id: courier.id,
  label: courier.label,
  values: series(SEED + 10 + index, 28, (_, random) =>
    Math.max(12, courier.mean + normal(random) * courier.sd),
  ),
}));

// ---------------------------------------------------------------------------
// 3. Scatter — campaign spend vs sign-ups, two channels
// ---------------------------------------------------------------------------
const campaigns = series(SEED + 20, 48, () => 0).map((_, index) => {
  const random = mulberry32(SEED + 200 + index);
  const channel = index % 2 === 0 ? "Search" : "Social";
  const spend = round(1.5 + random() * 38, 1);
  const efficiency = channel === "Search" ? 0.42 : 0.22;
  const signups = Math.max(4, Math.round(6 + spend * efficiency + normal(random) * 4));
  return { channel, spend, signups };
});

// ---------------------------------------------------------------------------
// 4. Line — weekly sessions by channel
// ---------------------------------------------------------------------------
const channels = [
  { id: "organic", label: "Organic", base: 5200, slope: 26, season: 420 },
  { id: "paid", label: "Paid", base: 3100, slope: 14, season: 260 },
  { id: "email", label: "Email", base: 1800, slope: 4, season: 150 },
];
const weeklySessions = channels.map((channel, index) => ({
  id: channel.id,
  label: channel.label,
  points: series(SEED + 300 + index, 26, (week, random) =>
    channel.base +
    channel.slope * week +
    Math.sin((week / 26) * Math.PI * 2 + index) * channel.season +
    normal(random) * 180,
  ).map((value) => Math.round(value)),
}));

// ---------------------------------------------------------------------------
// 5. Bar — revenue by region
// ---------------------------------------------------------------------------
const regionalRevenue = [
  { id: "north", label: "North", value: 184 },
  { id: "east", label: "East", value: 152 },
  { id: "south", label: "South", value: 138 },
  { id: "west", label: "West", value: 121 },
  { id: "central", label: "Central", value: 96 },
  { id: "coastal", label: "Coastal", value: 74 },
  { id: "inland", label: "Inland", value: 52 },
  { id: "islands", label: "Islands", value: 31 },
];

// ---------------------------------------------------------------------------
// 6. Dot — median wait by department and clinic
// ---------------------------------------------------------------------------
const clinics = ["Central", "Riverside", "Hilltop", "Northgate", "Eastfield", "Southbank", "Westmere", "Oakdale", "Harbour", "Meadow"];
const dotRows = clinics.map((clinic, index) => {
  const random = mulberry32(SEED + 400 + index);
  return {
    clinic,
    emergency: Math.round(18 + random() * 24),
    urgent: Math.round(34 + random() * 30),
    routine: Math.round(58 + random() * 52),
  };
});

// ---------------------------------------------------------------------------
// 7. Funnel — hiring pipeline
// ---------------------------------------------------------------------------
const hiringFunnel = [
  { id: "applied", label: "Applications", value: 12400 },
  { id: "screened", label: "Screened", value: 5400 },
  { id: "interviewed", label: "Interviewed", value: 2100 },
  { id: "offered", label: "Offered", value: 640 },
  { id: "hired", label: "Hired", value: 512 },
];

// ---------------------------------------------------------------------------
// 8. Treemap — revenue mix hierarchy
// ---------------------------------------------------------------------------
const revenueMix = [
  { id: "subscriptions", label: "Subscriptions", children: [
    { id: "starter", label: "Starter", value: 420 },
    { id: "growth", label: "Growth", value: 610 },
    { id: "enterprise", label: "Enterprise", value: 380 },
  ] },
  { id: "services", label: "Services", children: [
    { id: "implementation", label: "Implementation", value: 260 },
    { id: "training", label: "Training", value: 90 },
  ] },
  { id: "marketplace", label: "Marketplace", children: [
    { id: "addons", label: "Add-ons", value: 140 },
    { id: "templates", label: "Templates", value: 60 },
  ] },
];

// ---------------------------------------------------------------------------
// 9. Baseline demo — small differences, four regions
// ---------------------------------------------------------------------------
const baselineBars = [
  { id: "north", label: "North", value: 102 },
  { id: "east", label: "East", value: 104 },
  { id: "south", label: "South", value: 101 },
  { id: "west", label: "West", value: 106 },
];

// ---------------------------------------------------------------------------
// 10. Dual-axis demo — ad spend vs revenue index, 24 months
// ---------------------------------------------------------------------------
const dualMetric = series(SEED + 500, 24, () => 0).map((_, month) => {
  const random = mulberry32(SEED + 500 + month);
  return {
    month: `M${String(month + 1).padStart(2, "0")}`,
    spend: Math.round(24 + month * 1.2 + normal(random) * 3),
    revenue: Math.round(186 + month * 2.4 + normal(random) * 9),
  };
});

// ---------------------------------------------------------------------------
// 11. Composition demo — channel mix
// ---------------------------------------------------------------------------
const channelMix = [
  { id: "organic", label: "Organic search", value: 41 },
  { id: "paid", label: "Paid search", value: 24 },
  { id: "direct", label: "Direct", value: 16 },
  { id: "email", label: "Email", value: 11 },
  { id: "referral", label: "Referral", value: 8 },
];

// ---------------------------------------------------------------------------
// 12. Same mean, different shape — four groups
// ---------------------------------------------------------------------------
function trimToMean(values, target) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.map((value) => round(value + (target - mean), 1));
}
const shapeRandom = mulberry32(SEED + 600);
const sameMean = {
  uniform: trimToMean(Array.from({ length: 40 }, () => 50 + (shapeRandom() - 0.5) * 44), 50),
  normal: trimToMean(Array.from({ length: 40 }, () => 50 + normal(shapeRandom) * 9), 50),
  bimodal: trimToMean(
    Array.from({ length: 40 }, (_, index) => (index % 2 === 0 ? 34 + normal(shapeRandom) * 4 : 68 + normal(shapeRandom) * 4)),
    50,
  ),
  skewed: trimToMean(Array.from({ length: 40 }, () => 26 + Math.exp(normal(shapeRandom) * 0.5) * 18), 50),
};

// ---------------------------------------------------------------------------
// 13. Cherry-picked window — 52 weeks of sessions
// ---------------------------------------------------------------------------
const longSeries = series(SEED + 700, 52, (week, random) => {
  if (week < 40) return 8200 + week * 90 + Math.sin(week / 5) * 140 + normal(random) * 90;
  return 11800 - (week - 39) * 240 + Math.sin(week / 3) * 120 + normal(random) * 90;
}).map((value) => Math.round(value));

// ---------------------------------------------------------------------------
// 14. Simpson's paradox — treatment better in both segments, worse overall
// ---------------------------------------------------------------------------
const simpson = {
  segments: [
    { id: "new", label: "New customers", control: { converted: 20, total: 100 }, treatment: { converted: 260, total: 1000 } },
    { id: "returning", label: "Returning customers", control: { converted: 800, total: 900 }, treatment: { converted: 180, total: 200 } },
  ],
};

const now = "2026-10-23";

const output = {
  meta: {
    synthetic: true,
    generatedBy: "scripts/build-datasets.mjs",
    seed: SEED,
    generatedFor: "Hansa Data Visualization learning path",
    note: "Every value is generated locally for teaching. These are not real customers, employees, patients or employers. Charts, tables and tests all read this file, so the numbers stay consistent.",
    updated: now,
  },
  datasets: {
    "order-values": dataset("order-values", "Order value", "USD", "continuous", {
      note: "Right-skewed so the histogram bin width visibly changes the story.",
      values: orderValues,
    }),
    "delivery-times": dataset("delivery-times", "Delivery time", "minutes", "continuous-by-category", {
      note: "Four depots with different medians and spreads.",
      groups: delivery,
    }),
    "campaign-spend": dataset("campaign-spend", "Campaign spend and sign-ups", "USD / sign-ups", "two-continuous", {
      note: "Search and Social have different efficiency, so the pooled trend hides a group effect.",
      points: campaigns,
    }),
    "weekly-sessions": dataset("weekly-sessions", "Weekly sessions", "sessions", "time-series", {
      note: "Three channels over 26 weeks.",
      series: weeklySessions,
    }),
    "regional-revenue": dataset("regional-revenue", "Revenue by region", "thousand USD", "category-value", {
      note: "Eight regions, sorted descending in the default view.",
      rows: regionalRevenue,
    }),
    "clinic-wait": dataset("clinic-wait", "Median wait by clinic", "minutes", "category-multi-value", {
      note: "Three departments per clinic, so a dot plot carries all three without stacking.",
      rows: dotRows,
      series: [
        { id: "emergency", label: "Emergency" },
        { id: "urgent", label: "Urgent" },
        { id: "routine", label: "Routine" },
      ],
    }),
    "hiring-funnel": dataset("hiring-funnel", "Hiring funnel", "people", "funnel", {
      note: "Ordered stages; each step is a subset of the one above.",
      stages: hiringFunnel,
    }),
    "revenue-mix": dataset("revenue-mix", "Revenue mix", "thousand USD", "hierarchy", {
      note: "Two-level hierarchy; tile area maps to revenue.",
      nodes: revenueMix,
    }),
    "baseline-bars": dataset("baseline-bars", "Revenue by region (indexed)", "index", "category-value", {
      note: "Differences are small; a truncated axis manufactures drama.",
      rows: baselineBars,
    }),
    "dual-metric": dataset("dual-metric", "Ad spend and revenue", "thousand USD", "time-series", {
      note: "Two series with different scales, used to demonstrate why dual axes are dangerous.",
      rows: dualMetric,
    }),
    "channel-mix": dataset("channel-mix", "Sessions by channel", "% of total", "composition", {
      note: "Five parts of a whole; both pie and sorted bar are defensible here.",
      rows: channelMix,
    }),
    "same-mean": dataset("same-mean", "Four groups with the same mean", "score", "distribution-groups", {
      note: "All four groups average 50 but have very different shapes.",
      groups: [
        { id: "uniform", label: "Uniform", values: sameMean.uniform },
        { id: "normal", label: "Normal", values: sameMean.normal },
        { id: "bimodal", label: "Bimodal", values: sameMean.bimodal },
        { id: "skewed", label: "Skewed", values: sameMean.skewed },
      ],
    }),
    "long-series": dataset("long-series", "Weekly sessions, 52 weeks", "sessions", "time-series", {
      note: "The last eight weeks fall while the full year rises — a window choice changes the conclusion.",
      values: longSeries,
    }),
    simpson: dataset("simpson", "Conversion by customer segment", "%", "aggregate-groups", {
      note: "Treatment wins inside both segments and loses in the pooled total because the mix differs.",
      ...simpson,
    }),
  },
};

const content = `${JSON.stringify(output, null, 2)}\n`;
if (CHECK) {
  const existing = existsSync(OUT) ? await readFile(OUT, "utf8") : null;
  if (existing !== content) {
    console.error("content/data-viz/datasets.json is out of date. Run: node scripts/build-datasets.mjs");
    process.exit(1);
  }
  console.log("datasets.json is up to date.");
} else {
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, content, "utf8");
  console.log(`Wrote ${path.relative(ROOT, OUT)} (${Object.keys(output.datasets).length} datasets).`);
}
