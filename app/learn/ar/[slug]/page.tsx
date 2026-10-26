import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArabicLessons, getLesson } from "@/lib/data-viz/content";
import { LessonView } from "@/components/data-viz/lesson-view";
import { SITE } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return ArabicLessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug, "ar");
  if (!lesson) return { title: "الدرس غير موجود" };

  return {
    title: lesson.title,
    description:
      lesson.intro ??
      `${lesson.title} — درس في مسار تصور البيانات العربي، مع أمثلة وتوصيات عملية.`,
    alternates: { canonical: `/learn/ar/${lesson.slug}`, languages: { en: "/learn" } },
    openGraph: {
      title: `${lesson.title} — تصور البيانات`,
      description: lesson.intro ?? "درس عربي في تصور البيانات.",
      url: `/learn/ar/${lesson.slug}`,
      locale: "ar_EG",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: lesson.title }],
    },
  };
}

export default async function ArabicLessonPage({ params }: Params) {
  const { slug } = await params;
  const lesson = getLesson(slug, "ar");
  if (!lesson) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lesson.title,
    description: lesson.intro ?? undefined,
    learningResourceType: "Lesson",
    isAccessibleForFree: true,
    inLanguage: "ar",
    author: { "@type": "Person", name: SITE.name, url: SITE.url },
    isPartOf: {
      "@type": "Course",
      name: "Data Visualization — المسار العربي",
      url: `${SITE.url}/learn/ar/`,
    },
    url: `${SITE.url}/learn/ar/${lesson.slug}/`,
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
