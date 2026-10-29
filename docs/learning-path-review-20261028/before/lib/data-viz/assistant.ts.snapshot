// Deterministic natural-language front end for the chart-decision workspace.
//
// There is no model, no network call and no hidden state. The parser maps words
// to the same `DecisionInput` the structured form uses, then calls the tested
// rule table. Ambiguous prompts produce a clarification question rather than a
// confident guess.

import {
  CHART_META,
  SHAPE_LABELS,
  TASK_LABELS,
  decide,
  type DecisionResult,
  type Shape,
  type Task,
} from "./decision.ts";

export interface AssistantCitation {
  id: string;
  title: string;
  domain: string;
  url: string;
}

export interface AssistantStep {
  id: string;
  label: string;
  detail: string;
}

export interface AssistantAnswer {
  status: "answer";
  input: { task: Task; shape: Shape; categories: number; exactValues: boolean };
  decision: DecisionResult;
  confidence: "high" | "medium" | "low";
  paragraphs: string[];
  assumptions: string[];
  citations: AssistantCitation[];
  activity: AssistantStep[];
}

export interface AssistantQuestion {
  status: "clarify";
  question: string;
  reason: string;
  options: { label: string; value: string }[];
  citations: AssistantCitation[];
  activity: AssistantStep[];
}

export type AssistantResponse = AssistantAnswer | AssistantQuestion;

export interface Interpretation {
  task: Task | null;
  shape: Shape | null;
  categories: number | null;
  exactValues: boolean;
  taskHits: Record<string, string[]>;
  shapeHits: Record<string, string[]>;
  confidence: "high" | "medium" | "low";
}

const TASK_KEYWORDS: Record<Task, RegExp> = {
  distribution: /\b(distribution|distributions|spread|variance|variability|skew|skewed|outlier|outliers|histogram|shape of|typical value|percentile)\b/gi,
  comparison: /\b(compare|comparison|rank|ranking|which is (bigger|larger|higher|lower|best|worst)|difference|differences|versus|vs\.?|top \d+)\b/gi,
  trend: /\b(trend|trends|over time|time series|month|months|week|weeks|quarter|quarters|year|years|growth|grow|grew|decline|declined|forecast|seasonal|seasonality)\b/gi,
  relationship: /\b(relationship|correlate|correlation|correlated|driver|drivers|predict|predictor|association|linked to|depends on|scatter)\b/gi,
  composition: /\b(share|shares|mix|percent of total|percentage of total|part of|parts of|composition|breakdown|proportion|proportions|split)\b/gi,
  stages: /\b(funnel|pipeline|stages|stage|conversion|convert|drop-?off|steps|journey|apply|applied|hired|checkout)\b/gi,
};

const SHAPE_KEYWORDS: Record<Shape, RegExp> = {
  "one-continuous": /\b(one variable|single variable|values|scores|order value|delivery time|amounts|measurements|distribution)\b/gi,
  "continuous-by-category": /\b(by (region|team|department|group|segment|clinic|channel|category|cohort|depot|carrier|warehouse|store)|across (?:the )?(?:\w+ )?(regions|teams|groups|segments|clinics|channels|depots|carriers|stores)|per (region|team|group|segment|clinic|depot|carrier))\b/gi,
  "two-continuous": /\b(two (numeric|continuous)|x and y|spend and|price and|height and|age and|correlation|scatter)\b/gi,
  "category-value": /\b(by (product|category|region|channel|country|store|month|team|group)|sales by|revenue by|count by|per (product|category|region|channel|country|store)|across (?:the )?(?:\w+ )?(regions|channels|products|categories|countries|stores|teams)|top \d+)\b/gi,
  "time-series": /\b(over time|monthly|weekly|quarterly|yearly|by month|by week|by quarter|by year|trend line|timeline)\b/gi,
  hierarchy: /\b(hierarchy|hierarchical|nested|subcategory|sub-category|category and subcategory|parent and child|drill-?down)\b/gi,
  "stage-counts": /\b(funnel|pipeline|stages|stage|applied|screened|interviewed|offered|hired|checkout|drop-?off)\b/gi,
};

const SHAPE_FOR_TASK: Record<Task, Shape> = {
  distribution: "one-continuous",
  comparison: "category-value",
  trend: "time-series",
  relationship: "two-continuous",
  composition: "category-value",
  stages: "stage-counts",
};

const SHAPE_OPTIONS: Record<Task, Shape[]> = {
  distribution: ["one-continuous", "continuous-by-category"],
  comparison: ["category-value", "continuous-by-category"],
  trend: ["time-series", "category-value"],
  relationship: ["two-continuous", "category-value"],
  composition: ["category-value", "hierarchy"],
  stages: ["stage-counts"],
};

const WORD_NUMBERS: Record<string, number> = {
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

function hits(text: string, pattern: RegExp): string[] {
  return [...text.matchAll(pattern)].map((match) => match[0].toLowerCase());
}

function pickTask(text: string): { task: Task | null; hits: Record<string, string[]> } {
  const scores = (Object.keys(TASK_KEYWORDS) as Task[])
    .map((task) => ({ task, matches: hits(text, TASK_KEYWORDS[task]) }))
    .filter((entry) => entry.matches.length > 0)
    .sort((a, b) => b.matches.length - a.matches.length);
  const taskHits = Object.fromEntries(scores.map((entry) => [entry.task, entry.matches]));
  // "Spend vs sign-ups" reads as a comparison until the word "scatter" or
  // "correlation" appears; then the relationship is the stated task.
  if (/\b(scatter|correlat\w*|associated with|relationship)\b/.test(text)) {
    return { task: "relationship", hits: taskHits };
  }
  return { task: scores[0]?.task ?? null, hits: taskHits };
}

function pickShape(
  text: string,
  task: Task | null,
): { shape: Shape | null; hits: Record<string, string[]> } {
  const scores = (Object.keys(SHAPE_KEYWORDS) as Shape[])
    .map((shape) => ({ shape, matches: hits(text, SHAPE_KEYWORDS[shape]) }))
    .filter((entry) => entry.matches.length > 0)
    .sort((a, b) => b.matches.length - a.matches.length);
  const shapeHits = Object.fromEntries(scores.map((entry) => [entry.shape, entry.matches]));
  let shape = scores[0]?.shape ?? null;

  // "Revenue by month" mentions both a category and time; time wins because
  // the observations are ordered. "Revenue by region" stays categorical.
  if (task === "trend" && shape && shape !== "time-series") shape = "time-series";
  if (task === "stages") shape = "stage-counts";
  if (task === "composition" && shapeHits.hierarchy?.length) shape = "hierarchy";
  if (task === "composition" && shape !== "hierarchy") shape = "category-value";
  if (task === "relationship" && shape !== "two-continuous") shape = "two-continuous";
  if (task === "distribution" && shapeHits["continuous-by-category"]?.length) {
    shape = "continuous-by-category";
  }
  if (
    task === "comparison" &&
    shape === "continuous-by-category" &&
    !/\b(distribution|spread|variance|variability|outliers?|box ?plot|quartiles?|median)\b/.test(text)
  ) {
    // Comparing one summarised value per category (total revenue by region) is
    // a bar, not a box plot. Keep the box recommendation when the prompt asks
    // about spread, outliers or the shape of the values.
    shape = "category-value";
  }
  if (
    task === "comparison" &&
    shapeHits["category-value"]?.length &&
    !/\b(distribution|spread|times|scores|measurements)\b/.test(text)
  ) {
    shape = "category-value";
  }
  return { shape, hits: shapeHits };
}

function pickCategories(text: string): number | null {
  const numeric = text.match(
    /(\d{1,3})\s*(categories|regions|products|segments|slices|series|months|weeks|years|channels|stores|countries|teams|groups)/i,
  );
  if (numeric) return Math.max(1, Math.min(50, Number(numeric[1])));
  for (const [word, value] of Object.entries(WORD_NUMBERS)) {
    // Word numbers apply to countable groups only. "The last two years" is a
    // window, not two categories on an axis, so time units are excluded here.
    if (
      new RegExp(
        `\\b${word}\\s+(categories|regions|products|segments|slices|series|channels|stores|countries|teams|groups)`,
        "i",
      ).test(text)
    ) {
      return value;
    }
  }
  return null;
}

export function interpret(raw: string): Interpretation {
  const text = raw.toLowerCase().replace(/\s+/g, " ").trim();
  const { task, hits: taskHits } = pickTask(text);
  const { shape, hits: shapeHits } = pickShape(text, task);
  const categories = pickCategories(text);
  const exactValues = /\b(exact|precise|precision|read the numbers|table|individual values|values must be readable)\b/.test(text);
  const explicitTask = Boolean(task);
  const explicitShape = Boolean(shape);
  const confidence: Interpretation["confidence"] =
    explicitTask && explicitShape ? "high" : explicitTask || explicitShape ? "medium" : "low";
  return { task, shape, categories, exactValues, taskHits, shapeHits, confidence };
}

const CITATIONS: Record<string, AssistantCitation> = {
  rules: {
    id: "decision-rules",
    title: "Chart decision rules (unit-tested)",
    domain: "hansa.local",
    url: "/explore/choose#rules",
  },
  charts: {
    id: "core-grammar",
    title: "Core visual grammar: six labs",
    domain: "hansa.local",
    url: "/explore/charts",
  },
  integrity: {
    id: "integrity-lab",
    title: "Integrity lab: seven failure modes",
    domain: "hansa.local",
    url: "/explore/integrity",
  },
  atlas: {
    id: "visual-atlas",
    title: "Visual atlas: the source figure pack",
    domain: "hansa.local",
    url: "/learn/visual-atlas",
  },
  method: {
    id: "method",
    title: "How this library was built and verified",
    domain: "hansa.local",
    url: "/learn/method",
  },
};

function citationsFor(decision: DecisionResult): AssistantCitation[] {
  const list: AssistantCitation[] = [CITATIONS.rules];
  if (decision.primary.lab) {
    list.push({
      id: `lab-${decision.primary.chart}`,
      title: `${decision.primary.title} lab`,
      domain: "hansa.local",
      url: decision.primary.lab,
    });
  }
  list.push(decision.primary.chart === "pie" ? CITATIONS.integrity : CITATIONS.charts);
  return list;
}

function activityFor(
  interpretation: Interpretation,
  decision?: DecisionResult,
  categories?: number,
): AssistantStep[] {
  const steps: AssistantStep[] = [
    { id: "read", label: "Read the prompt", detail: "Local keyword rules; no model call, no network request." },
  ];
  if (interpretation.task) {
    steps.push({
      id: "task",
      label: "Classified the task",
      detail: `${TASK_LABELS[interpretation.task]}${interpretation.taskHits[interpretation.task]?.length ? ` · matched “${interpretation.taskHits[interpretation.task].slice(0, 2).join("”, “")}”` : ""}`,
    });
  }
  if (interpretation.shape) {
    steps.push({
      id: "shape",
      label: "Inferred the data shape",
      detail: SHAPE_LABELS[interpretation.shape],
    });
  }
  if (decision) {
    steps.push({ id: "rule", label: "Applied the rule table", detail: `Rule “${decision.rule}” (${decision.matched} match).` });
    steps.push({
      id: "limits",
      label: "Checked category limits",
      detail: `${categories ?? 6} categories; pie advice changes above 5, bar advice above 12.`,
    });
  }
  return steps;
}

export function suggestions(): string[] {
  return [
    "Compare total revenue across eight regions",
    "Show the distribution of order values by channel",
    "Is ad spend correlated with sign-ups?",
    "Track the hiring funnel from applied to hired",
    "Show the share of sessions by channel",
    "Has weekly retention changed over the last two years?",
  ];
}

export interface AssistantOverrides {
  task?: Task;
  shape?: Shape;
  categories?: number;
  exactValues?: boolean;
}

export function respond(
  raw: string,
  overrides: AssistantOverrides = {},
): AssistantResponse {
  const parsed = interpret(raw);
  const interpretation: Interpretation = {
    ...parsed,
    task: overrides.task ?? parsed.task,
    shape: overrides.shape ?? parsed.shape,
    categories: overrides.categories ?? parsed.categories,
    exactValues: overrides.exactValues ?? parsed.exactValues,
  };

  // The reader answered the "which task?" question. Asking a second question
  // about the data shape is honest but slow; instead adopt the canonical shape
  // for that task, mark the confidence medium, and list the inference in the
  // assumptions so it stays visible and reversible.
  if (overrides.task && !overrides.shape && !parsed.shape) {
    interpretation.shape = SHAPE_FOR_TASK[overrides.task];
    interpretation.confidence = "medium";
  }

  if (!interpretation.task) {
    return {
      status: "clarify",
      question: "What is the reader trying to do?",
      reason:
        "The prompt does not contain a task the rule table recognises. Choosing a chart before the task is the failure this workspace is meant to prevent.",
      options: (Object.keys(TASK_LABELS) as Task[]).map((task) => ({
        label: TASK_LABELS[task],
        value: task,
      })),
      citations: [CITATIONS.rules],
      activity: activityFor(interpretation),
    };
  }

  if (!interpretation.shape) {
    const options = SHAPE_OPTIONS[interpretation.task];
    return {
      status: "clarify",
      question: `What shape is the data for “${TASK_LABELS[interpretation.task].toLowerCase()}”?`,
      reason:
        "The task is clear, but several data shapes could serve it. The shape decides the encoding, so guessing here would hide the most important assumption.",
      options: options.map((shape) => ({ label: SHAPE_LABELS[shape], value: shape })),
      citations: [CITATIONS.rules],
      activity: activityFor(interpretation),
    };
  }

  const categories = interpretation.categories ?? 6;
  const input = {
    task: interpretation.task,
    shape: interpretation.shape,
    categories,
    exactValues: interpretation.exactValues,
  };
  const decision = decide(input);

  const assumptions: string[] = [];
  if (interpretation.categories === null) {
    assumptions.push("No category count was given, so the rules assumed 6 — change it if the real count crosses the pie (>5) or bar (>12) limit.");
  }
  if (!interpretation.shapeHits[interpretation.shape]?.length) {
    assumptions.push(`The ${SHAPE_LABELS[interpretation.shape].toLowerCase()} shape was inferred from the task, not stated directly.`);
  }
  if (interpretation.confidence !== "high") {
    assumptions.push("One part of the prompt was inferred. Refine it if the recommendation feels off.");
  }

  const paragraphs: string[] = [
    `You asked to ${TASK_LABELS[interpretation.task].toLowerCase()}. The data shape reads as ${SHAPE_LABELS[interpretation.shape].toLowerCase()}${interpretation.categories === null ? " (category count assumed)" : ""}.`,
    `Primary: **${decision.primary.title}**. ${decision.primary.reason}`,
  ];

  const firstAvoid = decision.avoid[0];
  if (firstAvoid) {
    paragraphs.push(`Why not ${firstAvoid.title.toLowerCase()}: ${firstAvoid.reason}`);
  }
  if (decision.matched !== "exact") {
    paragraphs.push(
      `No rule pairs this task and shape exactly, so the closest rule by ${decision.matched === "shape" ? "data shape" : "task"} was used. That mismatch is a signal to clarify the question before building.`,
    );
  }
  if (decision.primary.lab) {
    paragraphs.push(`Next step: open the ${decision.primary.title} lab and test the encoding with the real grain.`);
  } else {
    paragraphs.push(
      "Next step: clarify the task before building. This chart has no dedicated lab because it is rarely the primary choice.",
    );
  }

  return {
    status: "answer",
    input,
    decision,
    confidence: interpretation.confidence,
    paragraphs,
    assumptions,
    citations: citationsFor(decision),
    activity: activityFor(interpretation, decision, categories),
  };
}

/** Turn a clarification answer into the explicit override the workspace keeps. */
export function overrideFor(
  question: AssistantResponse,
  value: string,
): AssistantOverrides {
  if (question.status !== "clarify") return {};
  if (question.question.includes("reader trying to do")) return { task: value as Task };
  return { shape: value as Shape };
}

/** Number of text blocks a response reveals while it streams. */
export function blockCount(response: AssistantResponse): number {
  return response.status === "answer" ? response.paragraphs.length : 1;
}

export function primaryChartTitle(response: AssistantResponse): string | null {
  return response.status === "answer" ? CHART_META[response.decision.primary.chart].title : null;
}
