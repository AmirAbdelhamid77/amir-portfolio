// Scenario questions for the practice bank. Each answer is defensible or not
// because of the task and the data shape, never because of a chart's reputation.
// The correct index is asserted by `npm run validate:data-viz`.

export interface PracticeQuestion {
  id: string;
  chapter: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  chapterHref: string;
  lab?: { href: string; label: string };
}

export const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: "q-histogram",
    chapter: "03",
    prompt:
      "You have 140 order values in USD and no category column. The question is whether customers cluster around a few price points. Which view do you draw first?",
    options: [
      "A bar chart of the ten most frequent values",
      "A histogram with an explicitly stated bin width",
      "A line chart of orders in the order they arrived",
      "A pie chart of value bands",
    ],
    answer: 1,
    explanation:
      "Clustering is a question about the shape of one continuous variable, which is exactly what a histogram encodes. The bin width is part of the finding: too wide hides a second mode, too narrow invents spikes. State it and show it changing.",
    chapterHref: "/learn/chapter/03",
    lab: { href: "/explore/charts/histogram", label: "Histogram lab" },
  },
  {
    id: "q-box",
    chapter: "03",
    prompt:
      "Four depots, 28 delivery times each. The reader needs the typical time and the spread, compared on one shared scale. What do you show?",
    options: [
      "A grouped bar chart of the four means",
      "A box plot per depot with the fences explained",
      "A stacked bar of total minutes per depot",
      "A scatter plot of depot against delivery time",
    ],
    answer: 1,
    explanation:
      "The box carries median and interquartile range on a common scale, and the whiskers expose the tail. Four bars of means would discard the spread entirely — the difference between a reliable depot and an erratic one is the whole point.",
    chapterHref: "/learn/chapter/03",
    lab: { href: "/explore/charts/box", label: "Box plot lab" },
  },
  {
    id: "q-scatter",
    chapter: "03",
    prompt:
      "You have 48 campaigns with spend and sign-ups, split across Search and Social. You want to know whether more spend is associated with more sign-ups, and whether the channels differ.",
    options: [
      "A dual-axis line chart over campaign number",
      "A scatter plot with the channels distinguished and a fit per group",
      "A stacked bar of sign-ups by channel",
      "A histogram of sign-ups",
    ],
    answer: 1,
    explanation:
      "Two continuous variables and a relationship question call for position on both axes. Splitting the groups matters: a single pooled fit can describe neither channel, which is the lesson the scatter lab makes visible.",
    chapterHref: "/learn/chapter/03",
    lab: { href: "/explore/charts/scatter", label: "Scatter lab" },
  },
  {
    id: "q-line",
    chapter: "03",
    prompt:
      "Twenty-six weeks of sessions for three channels. Leadership wants the trend and a fair comparison of growth rates. Which choice holds up?",
    options: [
      "A pie chart of the latest week's sessions",
      "A line chart on one linear axis, with the option to switch to a log scale",
      "A bar chart with 26 bars per channel",
      "A scatter plot of week number against sessions",
    ],
    answer: 1,
    explanation:
      "Weeks are ordered and connected, so a line is licensed. A single axis keeps the comparison honest; the log option answers a different question (proportional growth) and must be labelled when used. Twenty-six grouped bars turn the gaps into the story.",
    chapterHref: "/learn/chapter/03",
    lab: { href: "/explore/charts/line", label: "Line lab" },
  },
  {
    id: "q-topn",
    chapter: "08",
    prompt:
      "Revenue for 40 regions. Leadership wants the top performers and a sense of the long tail, without forty labels crammed onto one axis. What is the most defensible view?",
    options: [
      "A pie chart with 40 slices",
      "A sorted bar chart of the top ten plus an “Other” bar, with a searchable table for the rest",
      "A line chart with regions on the x-axis",
      "A treemap with 40 unlabelled tiles",
    ],
    answer: 1,
    explanation:
      "Ranking needs length from a common zero baseline. Top-N plus Other keeps the chart readable and the table keeps every region available. Forty-slice pies and 40 unlabelled tiles hide the very comparison the reader came for.",
    chapterHref: "/learn/chapter/08",
    lab: { href: "/explore/charts/bar", label: "Bar lab" },
  },
  {
    id: "q-same-mean",
    chapter: "07",
    prompt:
      "Four groups all average exactly 50. A committee concludes they are interchangeable and wants to pick the cheapest. What do you put in front of them?",
    options: [
      "Four bars at 50 on an axis from 0 to 60",
      "The distributions themselves — strip plots or boxes with spread and shape",
      "A pie chart of group sizes",
      "A single line at 50 labelled “no difference”",
    ],
    answer: 1,
    explanation:
      "The mean is a summary, not a distribution. One group can be bimodal with a hole in the middle and another tightly clustered; choosing between them is a risk decision, so the shape has to be visible. Bars of means are technically true and practically useless.",
    chapterHref: "/learn/chapter/07",
    lab: { href: "/explore/integrity", label: "Integrity lab, demo 04" },
  },
  {
    id: "q-dual-axis",
    chapter: "07",
    prompt:
      "Ad spend and revenue are measured in different units, and you want to compare their growth over 24 months. A colleague proposes two y-axes. What is the better answer?",
    options: [
      "Two y-axes, with each series in its own colour",
      "Index both series to 100 at month one and plot them on one axis, or use two stacked panels",
      "Two pie charts, one per metric",
      "A scatter plot of spend against revenue with no labels",
    ],
    answer: 1,
    explanation:
      "Two y-axes let the author choose the apparent relationship by choosing the scales; reversing one axis can turn a match into a scissors. Indexing or small multiples keep the comparison tied to the data rather than to the axis settings.",
    chapterHref: "/learn/chapter/07",
    lab: { href: "/explore/integrity", label: "Integrity lab, demo 02" },
  },
  {
    id: "q-colour",
    chapter: "05",
    prompt:
      "Five ordered funnel stages, from application to hire. Which colour strategy is right?",
    options: [
      "Five unrelated qualitative hues",
      "One hue, stepped light to dark in stage order",
      "Alternating red and green",
      "A rainbow across the five stages",
    ],
    answer: 1,
    explanation:
      "The stages have an order, so the colour should have an order too. A sequential ramp encodes progression and survives greyscale printing. Five qualitative hues imply five unrelated categories; red/green adds a value judgement and fails for colour-vision deficiency.",
    chapterHref: "/learn/chapter/05",
  },
  {
    id: "q-a11y",
    chapter: "06",
    prompt:
      "A heatmap uses colour as its only encoding. What must accompany it to be accessible?",
    options: [
      "A colour legend, and nothing else",
      "Direct labels or patterns plus a data table, so value is available without colour",
      "A tooltip on every cell",
      "Nothing, as long as the palette is perceptually uniform",
    ],
    answer: 1,
    explanation:
      "A perceptually uniform palette improves discrimination but does not remove the colour dependency. Provide a non-colour channel (labels, patterns, position) and a table so the content survives colour-vision deficiency, greyscale, and screen readers.",
    chapterHref: "/learn/chapter/06",
  },
  {
    id: "q-star",
    chapter: "09",
    prompt:
      "In Power BI you have order lines, a product dimension, and a date table. Which model shape should you build?",
    options: [
      "Many-to-many relationships between every table",
      "A star schema: dimensions filter the fact table through single-direction relationships",
      "Bidirectional filters on every relationship to be safe",
      "One flat table with every product attribute repeated on each row",
    ],
    answer: 1,
    explanation:
      "A star schema keeps the fact at one declared grain and lets conformed dimensions filter it predictably. Bidirectional and many-to-many relationships multiply ambiguity and are hard to reason about; a flat table duplicates attributes and hides the grain.",
    chapterHref: "/learn/chapter/09",
  },
  {
    id: "q-audience",
    chapter: "02",
    prompt:
      "An executive asks for “everything” on one page before a budget meeting. What is the strongest response?",
    options: [
      "Add every chart and filter, and shrink the fonts until it fits",
      "Agree, then build two pages so they can choose in the meeting",
      "Ask what decision the meeting has to make, then lead with one headline, the supporting evidence, and the exception",
      "Send the raw data export instead",
    ],
    answer: 2,
    explanation:
      "“Everything” is a request for reassurance, not a specification. Naming the decision turns it into a page with a headline, one chart of evidence, and the exception that could reverse it. Two pages still dodge the question of which one is the message.",
    chapterHref: "/learn/audience-story",
  },
  {
    id: "q-interview",
    chapter: "10",
    prompt:
      "In an interview: “Which chart is best?” What actually earns the mark?",
    options: [
      "Saying “it depends” and stopping there",
      "Naming one chart confidently and defending it",
      "Asking about the task, the data shape, and the audience — then justifying a choice and its trade-offs",
      "Listing every chart type you know",
    ],
    answer: 2,
    explanation:
      "The interviewer is testing whether you choose under constraints. “It depends” is only the opening: follow it with the questions that resolve the dependency, a recommendation, and the failure mode you are accepting.",
    chapterHref: "/learn/chapter/10",
  },
];
