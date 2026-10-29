import type { MetadataRoute } from "next";
import { CASE_STUDIES } from "@/lib/case-studies";
import {
  ArabicLessons,
  CHAPTERS,
  EnglishLessons,
  chapterHref,
  lessonHref,
} from "@/lib/data-viz/content";
import { CHART_LABS } from "@/lib/data-viz/labs";
import { JOURNEYS, LABS, journeyHref, labHref } from "@/lib/statistics/content";
import { EXAMS } from "@/lib/exams";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date();
  const pages = [
    { path: "", priority: 1 },
    { path: "work", priority: 0.9 },
    { path: "experience", priority: 0.8 },
    { path: "services", priority: 0.8 },
    { path: "learn/catalogue", priority: 0.9 },
    { path: "practice/catalogue", priority: 0.9 },
    { path: "search", priority: 0.6 },
    { path: "lab", priority: 0.9 },
    { path: "learn", priority: 0.9 },
    { path: "explore", priority: 0.8 },
    { path: "practice", priority: 0.8 },
    { path: "about", priority: 0.7 },
    { path: "contact", priority: 0.7 },
  ];

  const curriculum = [
    { path: "/learn/dp-600", priority: 0.8 },
    { path: "/learn/dp-600/ingestion", priority: 0.8 },
    { path: "/learn/dp-600/atlas", priority: 0.8 },
    { path: "/learn/dp-600/atlas/journey", priority: 0.7 },
    { path: "/learn/method", priority: 0.6 },
    { path: "/learn/ar", priority: 0.7 },
    { path: "/explore/charts", priority: 0.8 },
    { path: "/explore/choose", priority: 0.8 },
    { path: "/explore/integrity", priority: 0.8 },
    { path: "/explore/dashboards", priority: 0.7 },
    { path: "/explore/specialty", priority: 0.7 },
    ...CHAPTERS.map((chapter) => ({ path: chapterHref(chapter), priority: 0.7 })),
    ...EnglishLessons.map((lesson) => ({ path: lessonHref(lesson), priority: 0.6 })),
    ...ArabicLessons.map((lesson) => ({ path: lessonHref(lesson), priority: 0.6 })),
    ...CHART_LABS.map((lab) => ({ path: `/explore/charts/${lab.type}`, priority: 0.7 })),
    ...JOURNEYS.map((journey) => ({ path: journeyHref(journey.slug), priority: 0.8 })),
    ...LABS.map((lab) => ({ path: labHref(lab.slug), priority: 0.7 })),
    { path: "/learn/statistics", priority: 0.9 },
    { path: "/learn/statistics/labs", priority: 0.8 },
    { path: "/learn/statistics/atlas", priority: 0.7 },
    { path: "/learn/statistics/formulas", priority: 0.7 },
    { path: "/learn/statistics/glossary", priority: 0.6 },
    { path: "/learn/statistics/decision", priority: 0.7 },
    { path: "/learn/statistics/cheatsheet", priority: 0.6 },
    { path: "/learn/statistics/source", priority: 0.6 },
    { path: "/lab/dp-600", priority: 0.9 },
    { path: "/lab/dp-600/explore", priority: 0.8 },
    { path: "/lab/dp-600/study", priority: 0.8 },
    { path: "/lab/dp-600/practice", priority: 0.8 },
    { path: "/lab/dp-600/mock", priority: 0.8 },
    { path: "/lab/dp-600/cases", priority: 0.7 },
    { path: "/lab/dp-600/review", priority: 0.6 },
    { path: "/lab/dp-600/progress", priority: 0.6 },
    { path: "/lab/dp-600/resources", priority: 0.7 },
  ];

  return [
    ...pages.map((page) => ({
      url: `${SITE.url}/${page.path}${page.path ? "/" : ""}`,
      lastModified: updated,
      changeFrequency: "monthly" as const,
      priority: page.priority,
    })),
    ...curriculum.map((page) => ({
      url: `${SITE.url}${page.path}/`,
      lastModified: updated,
      changeFrequency: "monthly" as const,
      priority: page.priority,
    })),
    ...CASE_STUDIES.map((study) => ({
      url: `${SITE.url}/work/${study.slug}/`,
      lastModified: updated,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
    ...EXAMS.map((exam) => ({
      url: `${SITE.url}/lab/${exam.slug}/`,
      lastModified: updated,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
