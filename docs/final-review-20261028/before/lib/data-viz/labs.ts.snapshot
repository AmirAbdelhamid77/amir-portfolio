export interface ChartLabMeta {
  type: "histogram" | "box" | "scatter" | "line" | "bar" | "dot";
  title: string;
  question: string;
  summary: string;
  teaches: string[];
  mistakes: string[];
  dataset: string;
  chapter: string;
}

export const CHART_LABS: ChartLabMeta[] = [
  {
    type: "histogram",
    title: "Histogram",
    question: "What shape does one continuous variable have?",
    summary:
      "Change the bin width and watch the distribution change its story. The mean and median move independently of the shape, which is exactly why a single average is not a distribution.",
    teaches: [
      "Bin width is a design decision, not a default.",
      "Skew moves the mean away from the median.",
      "The y-axis is a count (or share), never a category.",
    ],
    mistakes: [
      "Using a histogram for categories.",
      "Choosing bins that hide a second mode.",
    ],
    dataset: "order-values",
    chapter: "03",
  },
  {
    type: "box",
    title: "Box plot",
    question: "How do several groups differ in level and spread?",
    summary:
      "Compare four depots on one shared scale: median, interquartile range, whiskers, and outliers. Turn on every observation to see what the summary hides.",
    teaches: [
      "The box is the middle 50%, not the whole range.",
      "Outliers are flagged by a rule, not by a verdict.",
      "Position encodings tolerate a non-zero origin; bar lengths do not.",
    ],
    mistakes: [
      "Reading the box as the full distribution.",
      "Deleting outliers before understanding them.",
    ],
    dataset: "delivery-times",
    chapter: "03",
  },
  {
    type: "scatter",
    title: "Scatter plot",
    question: "Is there a relationship between two continuous variables?",
    summary:
      "Split two channels, fit a line, and compare the pooled correlation with the within-channel correlations. The gap between them is the lesson.",
    teaches: [
      "Plot the points before computing a coefficient.",
      "A pooled fit can describe neither group.",
      "Log axes change the shape of a relationship; read the label.",
    ],
    mistakes: [
      "Treating correlation as causation.",
      "Drawing a trend line through obvious clusters.",
    ],
    dataset: "campaign-spend",
    chapter: "03",
  },
  {
    type: "line",
    title: "Line chart",
    question: "How did connected observations change over time?",
    summary:
      "Three channels, twenty-six weeks, linear or log. The slope is the message, so the scale and the points both matter.",
    teaches: [
      "A line requires a conceptually ordered x-axis.",
      "Log scales turn equal percentage changes into equal distances.",
      "Show the observations when there are few of them.",
    ],
    mistakes: [
      "Connecting unordered categories.",
      "Hiding a scale change that reverses the impression.",
    ],
    dataset: "weekly-sessions",
    chapter: "03",
  },
  {
    type: "bar",
    title: "Bar chart",
    question: "How do categories compare on one measure?",
    summary:
      "Eight regions, two axis choices. Turn the zero baseline off and the bars keep their shape while the comparison stops being true.",
    teaches: [
      "Bar length must start at zero.",
      "Sorting turns a lookup into a ranking.",
      "A truncated axis inflates ratios, not just differences.",
    ],
    mistakes: [
      "Truncating the axis to make a point.",
      "Using bars for a continuous distribution.",
    ],
    dataset: "regional-revenue",
    chapter: "03",
  },
  {
    type: "dot",
    title: "Dot plot",
    question: "How do several series compare across the same categories?",
    summary:
      "Three departments, ten clinics, one shared scale. Dots carry position without the stacking problem that makes grouped bars hard to read.",
    teaches: [
      "A shared scale is the comparison.",
      "Dots show level; boxes show spread.",
      "Range lines make the within-category gap visible.",
    ],
    mistakes: [
      "Stacking series that do not sum to a meaningful total.",
      "Reading a median as the experience of every patient.",
    ],
    dataset: "clinic-wait",
    chapter: "03",
  },
];

export function getChartLab(type: string): ChartLabMeta | undefined {
  return CHART_LABS.find((lab) => lab.type === type);
}
