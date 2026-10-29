export type TimelineItem = {
  period: string;
  title: string;
  org: string;
  kind: "work" | "education" | "certification";
  summary: string;
  bullets: string[];
};

export const TIMELINE: TimelineItem[] = [
  {
    period: "2025 — present",
    title: "Independent data analyst & BI builder",
    org: "Self-directed portfolio",
    kind: "work",
    summary:
      "Building decision-ready analytics: modelled Power BI products, SQL analysis, and a public exam lab for people learning the same tools.",
    bullets: [
      "Designed and shipped the HSE Analytics dashboard: 50+ table constellation schema, 229+ DAX measures, five report views.",
      "Wrote the Data Lab: 60 validated practice questions across SQL, Power BI, Excel, Python, statistics, and analytics fundamentals.",
      "Own the full path — data generation, modelling, measure design, visual design, documentation, and static deployment.",
    ],
  },
  {
    period: "2025",
    title: "IBM Data Analyst Professional Certificate",
    org: "Coursera · IBM",
    kind: "certification",
    summary:
      "A nine-course professional certificate covering the analyst workflow end to end, finished with a capstone project.",
    bullets: [
      "Excel, SQL, Python, Pandas, and data visualisation with Matplotlib and Seaborn.",
      "Capstone: extract, clean, analyse, visualise, and present a survey dataset.",
      "Databases and SQL for data science, including joins, subqueries, and aggregation.",
    ],
  },
  {
    period: "2023",
    title: "IMT AVR Diploma",
    org: "IMT School",
    kind: "certification",
    summary:
      "Embedded systems diploma with a focus on AVR microcontrollers, low-level programming, and hardware-software integration.",
    bullets: [
      "C programming for microcontrollers, peripherals, and interrupt-driven design.",
      "Hardware debugging and instrumentation — the origin of my interest in sensor data quality.",
    ],
  },
  {
    period: "Graduation project",
    title: "B.Sc. Electronics & Communication Engineering",
    org: "Sohag University",
    kind: "education",
    summary:
      "Engineering degree with a graduation project in advanced driver-assistance systems (ADAS), built by a team of four.",
    bullets: [
      "Collected and validated real-time sensor data for an automotive safety prototype.",
      "Applied range, timing, and consistency checks before the decision layer.",
      "Owned technical documentation and the English project defence.",
    ],
  },
];

export type SkillGroup = {
  title: string;
  blurb: string;
  skills: { name: string; level: "working" | "strong" | "familiar" }[];
  evidence: { href: string; label: string };
};

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: "Business intelligence",
    blurb:
      "Dimensional modelling, DAX, and report design — the part that decides whether a dashboard survives contact with a real meeting.",
    skills: [
      { name: "Power BI Desktop", level: "strong" },
      { name: "DAX (time intelligence, context transition)", level: "strong" },
      { name: "Star & constellation schemas", level: "strong" },
      { name: "Power Query / M", level: "working" },
      { name: "Tableau", level: "familiar" },
      { name: "Report & KPI design", level: "strong" },
    ],
    evidence: { href: "/work/hse-analytics", label: "HSE case study" },
  },
  {
    title: "Data handling",
    blurb:
      "Getting from a messy source to a trustworthy table, with the cleaning decisions written down.",
    skills: [
      { name: "SQL (joins, CTEs, subqueries, window functions)", level: "strong" },
      { name: "Power Query ETL", level: "working" },
      { name: "Excel (INDEX/MATCH, pivots, Power Pivot)", level: "strong" },
      { name: "Data quality rules & validation", level: "strong" },
      { name: "Data modelling for analysis", level: "strong" },
    ],
    evidence: { href: "/lab?topic=sql", label: "SQL practice set" },
  },
  {
    title: "Analysis & scripting",
    blurb:
      "Exploration and repeatable analysis in Python, plus the statistical literacy to know when a difference is noise.",
    skills: [
      { name: "Python", level: "working" },
      { name: "Pandas", level: "working" },
      { name: "NumPy", level: "working" },
      { name: "Matplotlib / Seaborn", level: "working" },
      { name: "Descriptive statistics", level: "strong" },
      { name: "Hypothesis testing", level: "working" },
    ],
    evidence: { href: "/work/ibm-capstone", label: "IBM capstone" },
  },
  {
    title: "Communication",
    blurb:
      "The deliverable is a decision, not a chart. That means structure, plain language, and an honest limitations section.",
    skills: [
      { name: "Technical documentation", level: "strong" },
      { name: "Stakeholder-facing presentation", level: "strong" },
      { name: "Dashboard storytelling", level: "strong" },
      { name: "English (professional)", level: "strong" },
      { name: "Arabic (native)", level: "strong" },
    ],
    evidence: { href: "/about", label: "About & approach" },
  },
];

export const FACTS = [
  { label: "Based in", value: "Egypt · remote-friendly" },
  { label: "Availability", value: "Immediate" },
  { label: "Languages", value: "English · Arabic" },
  { label: "Focus", value: "BI, analytics, enablement" },
] as const;
