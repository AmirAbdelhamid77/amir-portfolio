import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Languages } from "lucide-react";
import {
  ArabicLessons,
  CHAPTERS,
  chapterHref,
  lessonHref,
} from "@/lib/data-viz/content";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "المسار العربي — تصور البيانات",
  description:
    "مسار عربي مختصر في تصور البيانات: الرسوم الأساسية الستة، الألوان، والمدرج التكراري ومخطط الصندوق والتشتت والخط والأعمدة والنقاط، مع نصائح المقابلات.",
  alternates: { canonical: "/learn/ar", languages: { en: "/learn" } },
  openGraph: {
    title: "المسار العربي — تصور البيانات",
    description: "دروس عربية في الرسوم البيانية، الألوان، والقرار التصميمي.",
    url: "/learn/ar",
    locale: "ar_EG",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "المسار العربي لتصور البيانات" }],
  },
};

const CHAPTERS_WITH_ARABIC = CHAPTERS.filter((chapter) =>
  chapter.lessons.some((slug) => ArabicLessons.some((lesson) => lesson.slug === slug)),
);

export default function ArabicHubPage() {
  return (
    <div dir="rtl" lang="ar">
      <section className="border-b border-border">
        <Container className="pb-12 pt-20 md:pb-16 md:pt-24">
          <div className="flex flex-wrap items-center gap-2">
            <Eyebrow>تصور البيانات</Eyebrow>
            <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              {ArabicLessons.length} دروس
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-medium tracking-tight md:text-5xl">
            المسار العربي: من السؤال إلى الرسم
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-muted-foreground sm:text-base">
            هذه الصفحات ليست ترجمة آلية للفصول الإنجليزية. هي دروس عربية مستقلة
            وردت في تصدير Notion الأصلي، تغطي الرسوم الأساسية واللون وطريقة
            الاختيار، وتشترك مع المسار الإنجليزي في نفس المبدأ: ابدأ من السؤال
            والقرار، وليس من شكل الرسم.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <Link
              href="/learn/ar/histogram"
              className="press inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
            >
              ابدأ بالمدرج التكراري
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/learn"
              dir="ltr"
              className="press inline-flex h-10 items-center gap-2 rounded-full border border-border-strong bg-background px-5 text-sm hover:bg-card"
            >
              <Languages className="h-4 w-4" aria-hidden="true" />
              English path
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card/40 p-4 text-xs leading-6 text-muted-foreground">
            <p>
              <strong className="font-medium text-foreground">ملاحظة عن المصدر:</strong>{" "}
              النصوص العربية منقولة من صفحات التصدير كما هي، مع إعادة بناء التنسيق
              فقط. بعض الصفحات الإنجليزية المختلطة تحتوي فقرات عربية أيضاً، وتُعرض
              باتجاه النص الصحيح لكل فقرة.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="space-y-10">
            {CHAPTERS_WITH_ARABIC.map((chapter) => {
              const lessons = chapter.lessons
                .map((slug) => ArabicLessons.find((lesson) => lesson.slug === slug))
                .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));
              if (!lessons.length) return null;
              return (
                <section key={chapter.number} aria-labelledby={`ar-chapter-${chapter.number}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-3">
                    <h2 id={`ar-chapter-${chapter.number}`} className="text-lg font-medium tracking-tight">
                      <Link href={chapterHref(chapter)} className="hover:underline hover:decoration-border-strong hover:underline-offset-4">
                        الفصل {chapter.number} — {chapter.title}
                      </Link>
                    </h2>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {lessons.length} {lessons.length === 1 ? "درس" : "دروس"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {lessons.map((lesson) => (
                      <article
                        key={lesson.slug}
                        className="group flex flex-col rounded-2xl border border-border bg-card/40 p-5 transition-colors hover:border-border-strong"
                      >
                        <h3 className="text-sm font-medium">
                          <Link
                            href={lessonHref(lesson)}
                            className="group-hover:underline group-hover:decoration-border-strong group-hover:underline-offset-4"
                          >
                            {lesson.title}
                          </Link>
                        </h3>
                        {lesson.intro ? (
                          <p className="mt-2 text-xs leading-6 text-muted-foreground">{lesson.intro}</p>
                        ) : null}
                        {lesson.takeaways.length ? (
                          <ul className="mt-3 space-y-1 text-[11px] leading-5 text-muted-foreground">
                            {lesson.takeaways.slice(0, 2).map((item) => (
                              <li key={item} className="flex gap-2">
                                <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-border-strong" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        <Link
                          href={lessonHref(lesson)}
                          className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs text-foreground"
                        >
                          اقرأ الدرس
                          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
                        </Link>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="mt-12 rounded-2xl border border-border bg-card/40 p-5">
            <h2 className="text-sm font-medium">أين تكمل؟</h2>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              بعد الرسوم الستة، انتقل إلى مختبر القرار لاختيار الرسم المناسب، ثم إلى
              مختبر النزاهة لرؤية نفس البيانات وهي تُعرض بطريقتين: صادقة ومضللة.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/explore/choose"
                className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-background px-4 py-2 text-xs hover:bg-card"
              >
                مساعد اختيار الرسم
                <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              </Link>
              <Link
                href="/explore/integrity"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:border-border-strong hover:text-foreground"
              >
                مختبر النزاهة
                <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
