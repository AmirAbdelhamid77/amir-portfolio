// Typed metadata for the two catalogue entry points (`/learn/catalogue/` and
// `/practice/catalogue/`).
//
// The catalogues are navigation, not new content: every card points at an
// existing canonical route. Counts come from `lib/site-metrics.ts`, which holds
// the published numbers as literals so this module stays small and is verified
// against the real content by `node scripts/verify-site-metrics.mjs`. This module
// is also the source for the site-wide search index.

import { SITE_METRICS } from "@/lib/site-metrics";

/** What the visitor does, not what the page is made of. */
export type StudyMode = "read" | "experiment" | "test";

export type CatalogueKind = "course" | "reference" | "tool" | "assessment";

export type CatalogueEntry = {
  id: string;
  kind: CatalogueKind;
  modes: StudyMode[];
  title: string;
  href: string;
  purpose: string;
  /** One line, concrete: length, format, what is inside. */
  inside: string;
  level: string;
  prerequisites: string;
  /** Where the same material can be practised; `null` when there is no bank. */
  practice: string | null;
  languages: string[];
  linkLabel: string;
  /** Optional honest caveat shown on the card. */
  caveat?: string;
};

export const MODE_LABEL: Record<StudyMode, string> = {
  read: "Read",
  experiment: "Experiment",
  test: "Test",
};

export const MODE_DESCRIPTION: Record<StudyMode, string> = {
  read: "Explanations, definitions and worked examples.",
  experiment: "Controls you can move, with the result and the reason shown.",
  test: "Questions with answer keys, rationales and retry.",
};

export const KIND_LABEL: Record<CatalogueKind, string> = {
  course: "Course",
  reference: "Reference",
  tool: "Tool",
  assessment: "Question bank",
};

const { dataViz, statistics, practice: practiceMetrics } = SITE_METRICS;

export const LEARNING_ENTRIES: CatalogueEntry[] = [
  {
    id: "dp600-academy", kind: "course", modes: ["read", "experiment", "test"],
    title: "DP-600 Learning Academy — ingestion decisions", href: "/learn/dp-600",
    purpose: "Choose between referencing, replicating and retaining data, and explain the constraints.",
    inside: "One complete lesson, a constraint explorer and three original transfer cases",
    level: "Foundation to applied", prerequisites: "OneLake and reference-versus-replica basics",
    practice: "Three lesson cases; related existing Fabric questions", languages: ["English"],
    linkLabel: "Start the DP-600 Ingestion Decision Lab",
    caveat: "First academy pilot; complete syllabus coverage is not claimed.",
  },
  {
    id: "data-visualization",
    kind: "course",
    modes: ["read", "experiment", "test"],
    title: "Data Visualization — from question to decision",
    href: "/learn",
    purpose:
      "Read a chart, choose the encoding that answers the question, and defend the decision out loud.",
    inside: `${dataViz.chapters} chapters · ${dataViz.sourcePages} source pages · ${dataViz.chartLabs} chart labs · ${dataViz.scenarios} scenario questions`,
    level: "Beginner to intermediate",
    prerequisites: "None. Arithmetic and a browser are enough.",
    practice: `${dataViz.scenarios} scenarios in the practice bank`,
    languages: ["English", "Arabic companion"],
    linkLabel: "Start the Data Visualization course",
  },
  {
    id: "statistics",
    kind: "reference",
    modes: ["read", "experiment"],
    title: "Comprehensive Statistics Reference",
    href: "/learn/statistics",
    purpose:
      "See uncertainty instead of memorising it: sampling, intervals, p-values, correlation and the traps around them.",
    inside: `${statistics.sections} source sections · ${statistics.journeys} journeys · ${statistics.labs} interactive labs · formula workbench and bilingual glossary`,
    level: "Beginner to intermediate",
    prerequisites: "No statistics assumed; the foundations journey starts at populations and samples.",
    practice: "Quick checks inside each lab, with computed answers",
    languages: ["English", "Arabic glossary terms"],
    linkLabel: "Open the statistics reference",
  },
  {
    id: "chart-labs",
    kind: "tool",
    modes: ["experiment"],
    title: "Six chart labs",
    href: "/explore/charts",
    purpose:
      "Move the one control that changes the story — bins, baselines, dot size, scale — and watch the same data say something different.",
    inside: `${dataViz.chartLabs} labs: histogram, box, scatter, line, bar, dot`,
    level: "Beginner",
    prerequisites: "None.",
    practice: null,
    languages: ["English"],
    linkLabel: "Open the six chart labs",
  },
  {
    id: "chart-picker",
    kind: "tool",
    modes: ["experiment"],
    title: "Chart decision assistant",
    href: "/explore/choose",
    purpose:
      "Answer two questions about the task and the data shape; get a defensible chart, the failure modes, and what the alternative would cost you.",
    inside: "Deterministic rules — the same answers always give the same recommendation",
    level: "Beginner to intermediate",
    prerequisites: "None.",
    practice: null,
    languages: ["English"],
    linkLabel: "Use the chart decision assistant",
  },
  {
    id: "integrity",
    kind: "tool",
    modes: ["experiment"],
    title: "Integrity lab",
    href: "/explore/integrity",
    purpose:
      "The same numbers drawn honestly and dishonestly, side by side, so you can name the trick instead of feeling it.",
    inside: "Seven paired demonstrations on identical data",
    level: "Intermediate",
    prerequisites: "The selection chapter helps; it is not required.",
    practice: null,
    languages: ["English"],
    linkLabel: "Run the integrity lab",
  },
  {
    id: "dashboards",
    kind: "tool",
    modes: ["experiment"],
    title: "Dashboard composition",
    href: "/explore/dashboards",
    purpose:
      "Compose a page from the decision backwards: what the reader must see first, and what is decoration.",
    inside: "Layout anatomy plus a composition exercise",
    level: "Intermediate",
    prerequisites: "Chapter 8 (dashboards) is the intended companion.",
    practice: null,
    languages: ["English"],
    linkLabel: "Open the dashboard lab",
  },
  {
    id: "arabic",
    kind: "course",
    modes: ["read"],
    title: "المسار العربي — Arabic companion path",
    href: "/learn/ar",
    purpose:
      "Core plots explained in Arabic with their own examples and takeaways, written as a companion lane rather than a translation.",
    inside: `${dataViz.arabicLessons} Arabic lessons · ${dataViz.englishLessons} English lessons in the main lane`,
    level: "Beginner",
    prerequisites: "None. Formulas and code stay left-to-right.",
    practice: null,
    languages: ["Arabic", "English terms"],
    linkLabel: "Open the Arabic learning path",
  },
  {
    id: "method",
    kind: "reference",
    modes: ["read"],
    title: "How the source material was imported",
    href: "/learn/method",
    purpose:
      "Hashes, counts and labelled gaps: what was transcribed from the export, what was written new, and what is missing.",
    inside: `${dataViz.sourcePages} source pages inventoried`,
    level: "For reviewers",
    prerequisites: "None.",
    practice: null,
    languages: ["English"],
    linkLabel: "Read the import method",
    caveat: "Provenance is evidence, not a claim of a complete content audit.",
  },
  {
    id: "fabric-reference",
    kind: "reference",
    modes: ["read"],
    title: "Microsoft Fabric — sources and coverage",
    href: "/lab/dp-600/resources",
    purpose:
      "Which video and which Microsoft Learn page stands behind each question pack, and how the bank maps to the official objectives.",
    inside: `${practiceMetrics.fabricPacks} packs · ${practiceMetrics.fabricSources} source references · coverage reconciliation`,
    level: "Intermediate",
    prerequisites: "None; the questions themselves live in Practice.",
    practice: `${practiceMetrics.fabricQuestions} questions in the Fabric practice hub`,
    languages: ["English"],
    linkLabel: "Open the Fabric source credits",
    caveat: "Original practice material — not official, leaked or recalled exam questions.",
  },
];

export const PRACTICE_ENTRIES: CatalogueEntry[] = [
  {
    id: "analyst-bank",
    kind: "assessment",
    modes: ["test"],
    title: "Data analyst question bank",
    href: "/lab",
    purpose:
      "Ten-question sets across SQL, Power BI/DAX, Excel, Python, statistics and fundamentals, each answer explaining why the plausible option is wrong.",
    inside: `${practiceMetrics.generalBanks} sets · ${practiceMetrics.generalQuestions} questions · 70% pass mark`,
    level: "Mixed",
    prerequisites: "None. Pick a topic you already use.",
    practice: "Practice mode explains immediately; mock mode holds feedback until you submit",
    languages: ["English"],
    linkLabel: "Open the analyst question bank",
  },
  {
    id: "fabric-dp600",
    kind: "assessment",
    modes: ["test"],
    title: "Microsoft Fabric / DP-600 hub",
    href: "/lab/dp-600",
    purpose:
      "Fabric questions with option-level rationales, source timestamps, case studies and a coverage report that admits what the bank cannot cover.",
    inside: `${practiceMetrics.fabricQuestions} questions · ${practiceMetrics.fabricPacks} source packs · guided, topic, mock, cases, review`,
    level: "Intermediate to advanced",
    prerequisites: "Fabric basics help; guided study assumes none.",
    practice: "Focused sets, mistake review and a persisted timed simulation",
    languages: ["English"],
    linkLabel: "Open the Fabric DP-600 practice hub",
    caveat: "Custom practice simulations — not a blueprint-authentic exam.",
  },
  {
    id: "visualization-scenarios",
    kind: "assessment",
    modes: ["test"],
    title: "Visualization scenario bank",
    href: "/practice",
    purpose:
      "Twelve small decisions with one defensible answer and three plausible ones. Choose, check, then read why the alternatives answer a different question.",
    inside: `${dataViz.scenarios} scenarios · model answer for each`,
    level: "Beginner to intermediate",
    prerequisites: "The selection and integrity chapters are the intended companions.",
    practice: "No clock and no score — the explanation is the point",
    languages: ["English"],
    linkLabel: "Answer the visualization scenarios",
  },
];

/** Counts shown in the catalogue headers; derived, never hand-typed. */
export const LEARNING_TOTALS = {
  courses: LEARNING_ENTRIES.filter((entry) => entry.kind === "course").length,
  references: LEARNING_ENTRIES.filter((entry) => entry.kind === "reference").length,
  tools: LEARNING_ENTRIES.filter((entry) => entry.kind === "tool").length,
  chapters: dataViz.chapters,
  statisticSections: statistics.sections,
  interactiveLabs: statistics.labs + dataViz.chartLabs,
  arabicLessons: dataViz.arabicLessons,
};

export const PRACTICE_TOTALS = {
  banks: PRACTICE_ENTRIES.length,
  questions:
    practiceMetrics.generalQuestions + practiceMetrics.fabricQuestions + dataViz.scenarios,
  general: practiceMetrics.generalQuestions,
  fabric: practiceMetrics.fabricQuestions,
  scenarios: dataViz.scenarios,
};

/** "I want to…" entry points. Every target is an existing canonical route. */
export const TASKS: { id: string; label: string; href: string; detail: string }[] = [
  {
    id: "choose-chart",
    label: "Choose a chart for this data",
    href: "/explore/choose",
    detail: "Two questions, one recommendation",
  },
  {
    id: "learn-statistics",
    label: "Learn statistics from the beginning",
    href: "/learn/statistics/journey/foundations",
    detail: "Populations, samples, notation",
  },
  {
    id: "build-dashboard",
    label: "Build a dashboard",
    href: "/learn/chapter/08",
    detail: "From decision to layout",
  },
  {
    id: "interview",
    label: "Prepare for a data interview",
    href: "/learn/interview-bank",
    detail: "Trade-offs, not definitions",
  },
  {
    id: "practice-fabric",
    label: "Practise Microsoft Fabric",
    href: "/lab/dp-600/study",
    detail: "Guided sessions with rationales",
  },
  {
    id: "arabic",
    label: "تعلّم بالعربية",
    href: "/learn/ar",
    detail: "المسار العربي",
  },
];
