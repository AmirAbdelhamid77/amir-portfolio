import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnglishLessons, getLesson, getSourcePage } from "@/lib/data-viz/content";
import { LessonView } from "@/components/data-viz/lesson-view";
import { SITE } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return EnglishLessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug, "en");
  if (!lesson) return { title: "Lesson not found" };
  const page = getSourcePage(lesson);
  const description =
    lesson.intro ??
    page?.description ??
    `A data-visualization lesson on ${lesson.title.toLowerCase()} with takeaways and a practice path.`;

  return {
    title: lesson.title,
    description,
    alternates: { canonical: `/learn/${lesson.slug}`, languages: { ar: `/learn/ar` } },
    openGraph: {
      title: `${lesson.title} — Data Visualization`,
      description,
      url: `/learn/${lesson.slug}`,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: lesson.title }],
    },
  };
}

export default async function LessonPage({ params }: Params) {
  const { slug } = await params;
  const lesson = getLesson(slug, "en");
  if (!lesson) notFound();

  const page = getSourcePage(lesson);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lesson.title,
    description: lesson.intro ?? page?.description ?? undefined,
    learningResourceType: "Lesson",
    educationalLevel: "Intermediate",
    isAccessibleForFree: true,
    inLanguage: "en",
    author: { "@type": "Person", name: SITE.name, url: SITE.url },
    isPartOf: {
      "@type": "Course",
      name: "Data Visualization — from question to decision",
      url: `${SITE.url}/learn/`,
    },
    url: `${SITE.url}/learn/${lesson.slug}/`,
    ...(page
      ? {
          citation: page.canonicalUrl ?? undefined,
          wordCount: Math.round(page.textLength / 5),
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LessonView lesson={lesson} />
    </>
  );
}
