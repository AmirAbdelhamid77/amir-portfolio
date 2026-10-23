export type Service = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  deliverables: string[];
  bestFor: string;
  turnaround: string;
  startingAt?: string;
  icon: "chart" | "database" | "graduation";
};

export const SERVICES: Service[] = [
  {
    slug: "bi-dashboards",
    name: "Power BI dashboards",
    tagline: "From scattered files to one decision surface.",
    description:
      "A dimensional model, a documented DAX layer, and a report designed around the questions your team actually asks. Built to be maintained by someone other than me.",
    deliverables: [
      "Star-schema model with a dedicated date table",
      "Documented measure library (not one-off cards)",
      "Up to five purpose-built report views",
      "Data-quality checks and refresh notes",
      "Handover session and a written measure dictionary",
    ],
    bestFor: "Operations, HSE, finance, or service teams stuck in spreadsheet reporting.",
    turnaround: "2–4 weeks for a focused first release",
    icon: "chart",
  },
  {
    slug: "analysis",
    name: "Analysis & data cleanup",
    tagline: "A defensible answer, with the working shown.",
    description:
      "SQL and Python analysis for a specific question — churn, cost, utilisation, compliance — plus the unglamorous cleaning that makes the answer trustworthy.",
    deliverables: [
      "Reproducible SQL or Python workflow",
      "Cleaning log with every assumption stated",
      "Exploratory visuals and a short written finding",
      "A review call to walk through the method",
    ],
    bestFor: "Teams with data but no spare analyst, or a decision that needs evidence.",
    turnaround: "3–10 working days depending on scope",
    icon: "database",
  },
  {
    slug: "training",
    name: "Training & exam prep",
    tagline: "Learn the tool by defending an answer.",
    description:
      "Structured practice for SQL, Power BI/DAX, Excel, Python, and statistics — using the same Data Lab engine, with sessions focused on where your reasoning breaks down.",
    deliverables: [
      "Diagnostic practice exam with topic breakdown",
      "Two live walkthrough sessions (60–90 minutes)",
      "A personalised weak-topic plan",
      "Access to the Data Lab question bank",
    ],
    bestFor: "Career switchers, graduates, and juniors preparing for analyst interviews.",
    turnaround: "Sessions scheduled weekly",
    icon: "graduation",
  },
];

export const PROCESS = [
  {
    step: "01",
    title: "Frame",
    body: "A short call to define the decision, the audience, and what would make the work a failure. No dashboard before this.",
  },
  {
    step: "02",
    title: "Model",
    body: "Profile the data, agree definitions, and build the smallest model that can answer the question honestly.",
  },
  {
    step: "03",
    title: "Build",
    body: "Measures, views, and a review loop with the people who will use it. Weekly demo, not a big reveal.",
  },
  {
    step: "04",
    title: "Hand over",
    body: "Documentation, a measure dictionary, and a walkthrough so the report is not dependent on me.",
  },
];
