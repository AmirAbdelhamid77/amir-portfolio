// Published counts, in one place.
//
// Why literals instead of importing `SECTIONS` and friends: those modules carry
// the whole curriculum and statistics dataset (hundreds of KB). Importing them to
// print six numbers would put that payload on the homepage and on both
// catalogues. The literals are guarded instead —
// `node scripts/verify-site-metrics.mjs` recomputes every value from the content
// files and fails if one drifts, and the batch gate runs it after each build.
//
// Rule: do not add a number here that the script cannot verify.

export const SITE_METRICS = {
  dataViz: {
    /** content/data-viz/curriculum.json → chapters.length */
    chapters: 10,
    /** content/data-viz/pages.json → length (source pages in the export) */
    sourcePages: 25,
    /** curriculum.json → lessons where section === "en" */
    englishLessons: 16,
    /** curriculum.json → lessons where section === "ar" */
    arabicLessons: 11,
    /** lib/data-viz/labs.ts → CHART_LABS entries */
    chartLabs: 6,
    /** lib/data-viz/practice.ts → PRACTICE_QUESTIONS entries */
    scenarios: 12,
  },
  statistics: {
    /** lib/statistics/content.ts → SECTIONS entries (number: …) */
    sections: 43,
    /** lib/statistics/content.ts → JOURNEYS entries */
    journeys: 9,
    /** lib/statistics/content.ts → LABS entries */
    labs: 15,
  },
  practice: {
    /** content/exams/*.json → number of banks */
    generalBanks: 6,
    /** content/exams/*.json → total questions */
    generalQuestions: 60,
    /** content/fabric/meta.json → counts.questions */
    fabricQuestions: 834,
    /** content/fabric/meta.json → counts.packs */
    fabricPacks: 18,
    /** content/fabric/sources.json → registry size */
    fabricSources: 227,
    /** content/fabric/meta.json → caseCount */
    fabricCases: 76,
  },
} as const;

export const PUBLISHED_QUESTION_TOTAL =
  SITE_METRICS.practice.generalQuestions +
  SITE_METRICS.practice.fabricQuestions +
  SITE_METRICS.dataViz.scenarios;
