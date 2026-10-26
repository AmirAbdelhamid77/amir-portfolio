// Builds the site-wide search index from typed content metadata.
//
// Server-side only: it imports the content modules so the client never has to.
// Every document points at a canonical URL that already exists; the index adds
// navigation, not new pages. Question documents carry the stem and topic, never
// an answer key.

import { CASE_STUDIES } from "@/lib/case-studies";
import { SERVICES } from "@/lib/services";
import {
  CHAPTERS,
  ArabicLessons,
  EnglishLessons,
  chapterHref,
  lessonHref,
} from "@/lib/data-viz/content";
import { CHART_LABS } from "@/lib/data-viz/labs";
import { PRACTICE_QUESTIONS } from "@/lib/data-viz/practice";
import {
  JOURNEYS,
  LABS,
  SECTIONS,
  buildSearchIndex,
  journeyHref,
  labHref,
  sectionHref,
} from "@/lib/statistics/content";
import { EXAMS } from "@/lib/exams";
import R11_SEARCH from "@/content/fabric/r11/search.json";
import type { SearchDocument } from "./query";

const MANUAL: SearchDocument[] = [
  { id: "page-fabric-atlas", title: "Knowledge Atlas — Fabric decisions", url: "/learn/dp-600/atlas/", kind: "tool", summary: "Explore documented concept relationships, conditions and sources. Human publication review remains separate.", topic: ["Fabric", "Atlas"], language: "en", keywords: ["knowledge", "graph", "shortcuts", "mirroring", "أطلس"] },
  { id: "page-fabric-journey", title: "Guided journey — Reference to replica", url: "/learn/dp-600/atlas/journey/", kind: "lesson", summary: "Learn, explore, practise and reflect on Fabric ingestion decisions.", topic: ["Fabric", "ingestion"], language: "en" },
  {
    id: "page-learn-catalogue",
    title: "Learning catalogue",
    url: "/learn/catalogue/",
    kind: "course",
    summary:
      "Every course, reference and lab in one place, labelled Read, Experiment or Test.",
    topic: ["catalogue", "learn"],
    language: "en",
    keywords: ["courses", "index", "study"],
  },
  {
    id: "page-practice-catalogue",
    title: "Practice catalogue",
    url: "/practice/catalogue/",
    kind: "tool",
    summary:
      "The three question banks: 60 analyst questions, 834 Fabric questions and 12 visualization scenarios.",
    topic: ["catalogue", "practice"],
    language: "en",
    keywords: ["exams", "questions", "quiz"],
  },
  {
    id: "page-search",
    title: "Search the site",
    url: "/search/",
    kind: "tool",
    summary: "One index across courses, lessons, sections, labs, tools, questions and case studies.",
    topic: ["search"],
    language: "en",
  },
  {
    id: "page-contact",
    title: "Contact",
    url: "/contact/",
    kind: "tool",
    summary: "Email address, copy-to-clipboard and a message composer that opens your mail app.",
    topic: ["contact", "hire"],
    language: "en",
    keywords: ["email", "work together"],
  },
];

export function buildSiteSearchIndex(): SearchDocument[] {
  const documents: SearchDocument[] = [...MANUAL, ...(R11_SEARCH as SearchDocument[])];

  for (const study of CASE_STUDIES) {
    documents.push({
      id: `case-${study.slug}`,
      title: study.title,
      url: `/work/${study.slug}/`,
      kind: "case-study",
      summary: `${study.subtitle} ${study.summary}`.slice(0, 240),
      topic: [study.status, ...study.tools.slice(0, 4)],
      language: "en",
      level: "advanced",
      keywords: [study.role, study.timeframe, ...study.outcome.slice(0, 3)],
    });
  }

  for (const service of SERVICES) {
    documents.push({
      id: `service-${service.slug}`,
      title: service.name,
      url: `/services/#${service.slug}`,
      kind: "tool",
      summary: `${service.tagline} ${service.description}`.slice(0, 200),
      topic: ["services", service.slug],
      language: "en",
      keywords: [service.bestFor, service.turnaround],
    });
  }

  for (const chapter of CHAPTERS) {
    documents.push({
      id: `chapter-${chapter.number}`,
      title: `${chapter.number}. ${chapter.title}`,
      url: chapterHref(chapter),
      kind: "course",
      summary: `${chapter.question} ${chapter.summary}`.slice(0, 240),
      topic: ["data visualization", "chapter"],
      language: "en",
      level: "beginner",
      course: "Data Visualization",
      keywords: [chapter.question, chapter.lab.label],
    });
  }

  for (const lesson of [...EnglishLessons, ...ArabicLessons]) {
    const isArabic = lesson.section === "ar";
    documents.push({
      id: `lesson-${lesson.section}-${lesson.slug}`,
      title: lesson.title,
      url: lessonHref(lesson),
      kind: "lesson",
      summary: (lesson.intro ?? lesson.takeaways.join(" · ")).slice(0, 240),
      topic: isArabic ? ["data visualization", "العربية"] : ["data visualization"],
      language: isArabic ? "ar" : "en",
      level: "beginner",
      course: "Data Visualization",
      keywords: lesson.takeaways,
    });
  }

  documents.push({
    id: "tool-chart-labs",
    title: "Six chart labs",
    url: "/explore/charts/",
    kind: "lab",
    summary: "Histogram, box, scatter, line, bar and dot — each with the one control that changes the story.",
    topic: ["data visualization", "labs"],
    language: "en",
    keywords: ["interactive", "bins", "baseline"],
  });

  for (const lab of CHART_LABS) {
    documents.push({
      id: `chartlab-${lab.type}`,
      title: `${lab.title} lab`,
      url: `/explore/charts/${lab.type}/`,
      kind: "lab",
      summary: `${lab.question} ${lab.summary}`.slice(0, 220),
      topic: ["data visualization", "chart", lab.type],
      language: "en",
      course: "Data Visualization",
      keywords: [lab.type, ...lab.teaches, ...lab.mistakes],
    });
  }

  for (const [path, title, summary] of [
    ["/explore/choose/", "Chart decision assistant", "Answer two questions about the task and the data shape; get a defensible chart and its failure modes."],
    ["/explore/integrity/", "Integrity lab", "The same numbers drawn honestly and dishonestly, side by side."],
    ["/explore/dashboards/", "Dashboard composition", "Compose a page from the decision backwards."],
    ["/explore/specialty/", "Specialty charts", "Sankey, treemap and funnel — what each one actually encodes."],
    ["/learn/ar/", "المسار العربي", "Arabic companion path for the visualisation course."],
    ["/learn/statistics/formulas/", "Formula workbench", "Every formula with its meaning, units, assumptions and a worked example."],
    ["/learn/statistics/glossary/", "Bilingual glossary", "Statistics terms in English and Arabic."],
    ["/learn/statistics/atlas/", "Concept atlas", "Map of the statistics reference: what to look up, and where it sits."],
    ["/learn/statistics/decision/", "Decision navigator", "Choose a method from the question you are actually asking."],
    ["/lab/dp-600/resources/", "Fabric sources and coverage", "Source credits, study-guide mapping and the coverage reconciliation."],
  ] as const) {
    documents.push({
      id: `tool-${path.replace(/\W+/g, "-")}`,
      title,
      url: path,
      kind: "tool",
      summary,
      topic: ["tool"],
      language: title.includes("ع") ? "ar" : "en",
    });
  }

  for (const journey of JOURNEYS) {
    documents.push({
      id: `journey-${journey.slug}`,
      title: `Journey ${journey.number}: ${journey.title}`,
      url: journeyHref(journey.slug),
      kind: "course",
      summary: journey.summary,
      topic: ["statistics", "journey", journey.arabic],
      language: "en",
      level: "intermediate",
      course: "Comprehensive Statistics Reference",
      keywords: [journey.question, ...journey.outcomes],
    });
  }

  for (const section of SECTIONS) {
    documents.push({
      id: `stats-section-${section.id}`,
      title: `${section.number}. ${section.titleEn}`,
      url: sectionHref(section),
      kind: "section",
      summary: section.misconception || section.objectives.join(" · "),
      topic: ["statistics", section.journey, section.titleAr ?? ""],
      language: section.titleAr ? "mixed" : "en",
      level: "intermediate",
      course: "Comprehensive Statistics Reference",
      keywords: [section.titleAr ?? "", ...section.objectives],
    });
  }

  for (const lab of LABS) {
    documents.push({
      id: `stats-lab-${lab.slug}`,
      title: lab.title,
      url: labHref(lab.slug),
      kind: "lab",
      summary: `${lab.question} ${lab.description}`.slice(0, 220),
      topic: ["statistics", "lab", lab.journey],
      language: "en",
      level: "intermediate",
      course: "Comprehensive Statistics Reference",
      keywords: lab.controls,
    });
  }

  for (const item of buildSearchIndex()) {
    // The statistics module already builds a keyword-rich index; keep its
    // groups as kinds so the filters stay meaningful.
    const kind: SearchDocument["kind"] =
      item.group === "Journeys"
        ? "course"
        : item.group === "Interactive labs"
          ? "lab"
          : item.group.toLowerCase().includes("formula")
            ? "formula"
            : item.group.toLowerCase().includes("glossary")
              ? "glossary"
              : "section";
    if (documents.some((document) => document.url === item.href && document.title === item.label)) {
      continue;
    }
    documents.push({
      id: `stats-${item.id}`,
      title: item.label,
      url: item.href,
      kind,
      summary: item.group,
      topic: ["statistics", item.group],
      language: /[\u0600-\u06FF]/.test(item.keywords.join(" ")) ? "mixed" : "en",
      course: "Comprehensive Statistics Reference",
      keywords: item.keywords.filter(Boolean),
    });
  }

  for (const exam of EXAMS) {
    documents.push({
      id: `exam-${exam.slug}`,
      title: `${exam.title} question set`,
      url: `/lab/${exam.slug}/`,
      kind: "question",
      summary: `${exam.questions.length} questions · ${exam.durationMinutes} minutes · ${exam.passMark}% pass mark. ${exam.description}`.slice(0, 240),
      topic: ["practice", exam.topic, exam.level],
      language: "en",
      level: exam.level,
      keywords: ["exam", "quiz", exam.topic.toLowerCase()],
    });
    for (const question of exam.questions) {
      documents.push({
        id: `q-${exam.slug}-${question.id}`,
        title: question.prompt.slice(0, 120),
        url: `/lab/${exam.slug}/`,
        kind: "question",
        summary: `${exam.topic} · ${exam.title}`,
        topic: ["practice", exam.topic],
        language: "en",
        level: exam.level,
        sourceId: question.id,
        keywords: [question.explanation.slice(0, 120)],
      });
    }
  }

  for (const scenario of PRACTICE_QUESTIONS) {
    documents.push({
      id: `scenario-${scenario.id}`,
      title: scenario.prompt.slice(0, 120),
      url: `/practice/#${scenario.id}`,
      kind: "question",
      summary: `Visualization scenario · chapter ${scenario.chapter}`,
      topic: ["practice", "data visualization"],
      language: "en",
      sourceId: scenario.id,
      keywords: [scenario.explanation.slice(0, 160), ...scenario.options],
    });
  }

  return documents;
}
