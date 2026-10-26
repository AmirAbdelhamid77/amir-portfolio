// Deterministic chart-selection rules. The assistant is a rule table, not a
// model or a random suggestion: the same answers always produce the same
// recommendation, and every rule is unit-tested.

export type ChartId =
  | "histogram"
  | "box"
  | "scatter"
  | "line"
  | "bar"
  | "dot"
  | "pie"
  | "heatmap"
  | "treemap"
  | "funnel"
  | "parallel";

export type Task = "distribution" | "comparison" | "trend" | "relationship" | "composition" | "stages";

export type Shape =
  | "one-continuous"
  | "continuous-by-category"
  | "two-continuous"
  | "category-value"
  | "time-series"
  | "hierarchy"
  | "stage-counts";

export interface DecisionInput {
  task: Task;
  shape: Shape;
  /** Number of categories or series in the view. */
  categories: number;
  /** True when the reader needs to compare exact values, not just rank. */
  exactValues: boolean;
}

export type Verdict = "recommended" | "acceptable" | "avoid";

export interface Recommendation {
  chart: ChartId;
  title: string;
  verdict: Verdict;
  reason: string;
  lab?: string;
}

export interface DecisionResult {
  rule: string;
  matched: "exact" | "shape" | "task" | "default";
  primary: Recommendation;
  alternatives: Recommendation[];
  avoid: Recommendation[];
}

export const CHART_META: Record<ChartId, { title: string; lab?: string }> = {
  histogram: { title: "Histogram", lab: "/explore/charts/histogram" },
  box: { title: "Box plot", lab: "/explore/charts/box" },
  scatter: { title: "Scatter plot", lab: "/explore/charts/scatter" },
  line: { title: "Line chart", lab: "/explore/charts/line" },
  bar: { title: "Bar chart", lab: "/explore/charts/bar" },
  dot: { title: "Dot plot", lab: "/explore/charts/dot" },
  pie: { title: "Pie chart" },
  heatmap: { title: "Correlation heatmap" },
  treemap: { title: "Treemap", lab: "/explore/specialty" },
  funnel: { title: "Funnel", lab: "/explore/specialty" },
  parallel: { title: "Parallel coordinates" },
};

export const TASK_LABELS: Record<Task, string> = {
  distribution: "See the distribution",
  comparison: "Compare categories",
  trend: "Show change over time",
  relationship: "Test a relationship",
  composition: "Show parts of a whole",
  stages: "Track an ordered pipeline",
};

export const SHAPE_LABELS: Record<Shape, string> = {
  "one-continuous": "One continuous variable",
  "continuous-by-category": "Continuous variable by category",
  "two-continuous": "Two continuous variables",
  "category-value": "Category and a value",
  "time-series": "Values over time",
  hierarchy: "Nested categories",
  "stage-counts": "Ordered stage counts",
};

interface Rule {
  key: string;
  task: Task;
  shape: Shape;
  primary: ChartId;
  alternatives: ChartId[];
  avoid: ChartId[];
}

const RULES: Rule[] = [
  {
    key: "histogram",
    task: "distribution",
    shape: "one-continuous",
    primary: "histogram",
    alternatives: ["box"],
    avoid: ["pie", "line"],
  },
  {
    key: "box-by-category",
    task: "distribution",
    shape: "continuous-by-category",
    primary: "box",
    alternatives: ["dot", "histogram"],
    avoid: ["pie", "line"],
  },
  {
    key: "box-comparison",
    task: "comparison",
    shape: "continuous-by-category",
    primary: "box",
    alternatives: ["dot"],
    avoid: ["pie"],
  },
  {
    key: "scatter",
    task: "relationship",
    shape: "two-continuous",
    primary: "scatter",
    alternatives: ["heatmap"],
    avoid: ["line", "pie"],
  },
  {
    key: "line",
    task: "trend",
    shape: "time-series",
    primary: "line",
    alternatives: ["bar"],
    avoid: ["pie"],
  },
  {
    key: "bar",
    task: "comparison",
    shape: "category-value",
    primary: "bar",
    alternatives: ["dot"],
    avoid: ["line", "pie"],
  },
  {
    key: "treemap",
    task: "composition",
    shape: "hierarchy",
    primary: "treemap",
    alternatives: ["bar"],
    avoid: ["line", "scatter"],
  },
  {
    key: "pie",
    task: "composition",
    shape: "category-value",
    primary: "bar",
    alternatives: ["pie", "treemap"],
    avoid: ["line"],
  },
  {
    key: "funnel",
    task: "stages",
    shape: "stage-counts",
    primary: "funnel",
    alternatives: ["bar"],
    avoid: ["pie", "treemap"],
  },
  {
    key: "heatmap",
    task: "relationship",
    shape: "category-value",
    primary: "heatmap",
    alternatives: ["bar"],
    avoid: ["pie"],
  },
];

function recommend(chart: ChartId, verdict: Verdict, reason: string): Recommendation {
  return { chart, title: CHART_META[chart].title, verdict, reason, lab: CHART_META[chart].lab };
}

export function decide(input: DecisionInput): DecisionResult {
  const exact = RULES.find((item) => item.task === input.task && item.shape === input.shape);
  const byShape = RULES.find((item) => item.shape === input.shape);
  const byTask = RULES.find((item) => item.task === input.task);
  const rule = exact ?? byShape ?? byTask ?? RULES[0];
  const matched: DecisionResult["matched"] = exact
    ? "exact"
    : byShape
      ? "shape"
      : byTask
        ? "task"
        : "default";

  const tooManyCategories = input.categories > 12;
  const veryManyCategories = input.categories > 30;
  const alternatives = rule.alternatives.map((chart) => {
    if (chart === "pie" && input.categories > 5) {
      return recommend(
        chart,
        "avoid",
        `A pie with ${input.categories} slices fails the “can you rank these?” test. Use a sorted bar.`,
      );
    }
    if (chart === "bar" && input.shape === "time-series") {
      return recommend(
        chart,
        input.categories <= 12 ? "acceptable" : "avoid",
        input.categories <= 12
          ? "Bars are fine for a handful of discrete periods; keep a zero baseline."
          : "Too many periods for bars — the gaps become the story instead of the trend.",
      );
    }
    if (chart === "dot" && input.exactValues) {
      return recommend(
        chart,
        "acceptable",
        "A dot plot shows position precisely, but it carries less visual weight than a bar when exact values matter.",
      );
    }
    if (chart === "heatmap" && input.categories > 60) {
      return recommend(
        chart,
        "acceptable",
        "A heatmap can screen a dense field, but only if a sorted table or scatter drill-down exists alongside it.",
      );
    }
    return recommend(chart, "acceptable", ALTERNATIVE_REASONS[chart] ?? "A defensible alternative if the primary encoding fails.");
  });

  let primaryReason = PRIMARY_REASONS[rule.primary] ?? "The task and data shape match this encoding.";
  if (rule.primary === "bar" && tooManyCategories) {
    primaryReason =
      `Sorted bars still work, but with ${input.categories} categories show Top N plus “Other” (or a searchable table) instead of squeezing every label.`;
  }
  if (rule.primary === "bar" && veryManyCategories) {
    primaryReason =
      `With ${input.categories} categories, a dot plot or a Top-N bar is more legible than a long axis; the long tail belongs in a table.`;
  }
  if (rule.primary === "line" && input.categories <= 2) {
    primaryReason =
      "A line is appropriate for connected observations. With so few points, make the markers visible so the reader can see the observations, not just the interpolation.";
  }
  if (rule.primary === "box" && input.exactValues) {
    primaryReason =
      "The box summarises median, spread and outliers; add a dot strip or table when exact group values must be readable.";
  }

  const avoid = rule.avoid.map((chart) =>
    recommend(chart, "avoid", AVOID_REASONS[chart] ?? "It answers a different question than the one asked."),
  );

  // Never show the same chart as both acceptable and forbidden.
  const accepted = new Set<ChartId>([rule.primary, ...alternatives.filter((item) => item.verdict !== "avoid").map((item) => item.chart)]);
  const dedupedAvoid = avoid.filter((item) => !accepted.has(item.chart));

  return {
    rule: rule.key,
    matched,
    primary: recommend(rule.primary, "recommended", primaryReason),
    alternatives,
    avoid: dedupedAvoid,
  };
}

const PRIMARY_REASONS: Partial<Record<ChartId, string>> = {
  histogram: "One continuous variable, one question about shape: a histogram shows modality, skew and gaps that a mean hides.",
  box: "A continuous variable split by category is exactly what the five-number summary is for — and the box keeps the comparison on one shared scale.",
  scatter: "Two continuous variables and a relationship question: position on both axes is the strongest encoding available.",
  line: "Time-ordered observations should be connected; the slope is the message, so keep the intervals regular.",
  bar: "Length from a common zero baseline is the most accurate comparison encoding for categories.",
  treemap: "Nested parts of a whole: area carries magnitude and nesting carries hierarchy, provided labels stay readable.",
  funnel: "Ordered stages are subsets of one another; a funnel makes the drop-off between steps explicit.",
  heatmap: "A matrix of relationships is easier to scan as colour than as dozens of tiny charts — keep a table beside it.",
};

const ALTERNATIVE_REASONS: Partial<Record<ChartId, string>> = {
  histogram: "Useful as a secondary view when the group distribution matters as much as its summary.",
  box: "A compact summary when the reader needs spread and outliers, not every observation.",
  dot: "Good when several series share a category axis and bars would overlap or clutter.",
  bar: "Works when the categories are few and the values need an explicit zero baseline.",
  pie: "Only defensible for a small number of slices that genuinely sum to a meaningful whole.",
  treemap: "Adds hierarchy, but area comparisons are weaker than a shared bar scale.",
  heatmap: "Screens many pairs at once; it cannot replace a scatter for an individual relationship.",
  line: "Correct only when the x-axis observations are conceptually connected.",
};

const AVOID_REASONS: Partial<Record<ChartId, string>> = {
  pie: "Angle comparisons are weaker than length, and slices stop being readable past about five categories.",
  line: "Connecting unordered categories invents a trend that the data does not contain.",
  histogram: "A histogram is for one continuous variable; it is not a category comparison.",
  scatter: "Two unordered categories have no meaningful joint position.",
  treemap: "Nesting without hierarchy implies structure that is not in the data.",
  funnel: "A funnel implies ordered subsets; unrelated categories are not stages.",
};
