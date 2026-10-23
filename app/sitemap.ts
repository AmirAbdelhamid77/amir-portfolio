import type { MetadataRoute } from "next";
import { CASE_STUDIES } from "@/lib/case-studies";
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
    { path: "lab", priority: 0.9 },
    { path: "about", priority: 0.7 },
    { path: "contact", priority: 0.7 },
  ];

  return [
    ...pages.map((page) => ({
      url: `${SITE.url}/${page.path}${page.path ? "/" : ""}`,
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
