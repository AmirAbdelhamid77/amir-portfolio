import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, FileWarning, FlaskConical } from "lucide-react";
import {
  CHAPTERS,
  adjacentChapters,
  chapterHref,
  getChapter,
  lessonHref,
  lessonsForChapter,
} from "@/lib/data-viz/content";
import { Container, Eyebrow } from "@/components/ui";

type Params = { params: Promise<{ number: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return CHAPTERS.map((chapter) => ({ number: chapter.number }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { number } = await params;
  const chapter = getChapter(number);
  if (!chapter) return { title: "Chapter not found" };

  return {
    title: `Chapter ${chapter.number} — ${chapter.title}`,
    description: `${chapter.question} ${chapter.summary}`.slice(0, 180),
    alternates: { canonical: chapterHref(chapter) },
    openGraph: {
      title: `Chapter ${chapter.number} — ${chapter.title}`,
      description: chapter.summary,
      url: chapterHref(chapter),
      images: [{ url: "/og.png", width: 1200, height: 630, alt: chapter.title }],
    },
  };
}

export default async function ChapterPage({ params }: Params) {
  const { number } = await params;
  const chapter = getChapter(number);
  if (!chapter) notFound();

  const lessons = lessonsForChapter(chapter);
  const english = lessons.filter((lesson) => lesson.section === "en");
  const arabic = lessons.filter((lesson) => lesson.section === "ar");
  const { previous, next } = adjacentChapters(chapter);
  const editorialOnly = lessons.length > 0 && lessons.every((lesson) => lesson.kind === "editorial");

  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-10 pt-20 md:pb-12 md:pt-24">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/learn" className="hover:text-foreground">
              Data Visualization
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/70">Chapter {chapter.number}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Eyebrow>
              Chapter {chapter.number} of {CHAPTERS.length}
            </Eyebrow>
            {editorialOnly ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-800 dark:text-amber-300">
                <FileWarning className="h-3 w-3" aria-hidden="true" />
                Editorial chapter
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-tight md:text-4xl">
            {chapter.title}
          </h1>
          <p className="mt-3 text-base font-medium text-foreground/80">{chapter.question}</p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            {chapter.summary}
          </p>

          {editorialOnly ? (
            <p className="mt-5 max-w-2xl rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-4 text-xs leading-6 text-muted-foreground">
              The canonical source page for this chapter was not part of the export.
              This is clearly labelled editorial material written for this site — it is
              not a transcription, and it is excluded from the 25-page coverage count.
            </p>
          ) : null}
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
            <div className="min-w-0">
              <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Lessons in this chapter
              </h2>

              <ol className="mt-4 space-y-2">
                {lessons.map((lesson, index) => (
                  <li key={`${lesson.section}-${lesson.slug}`}>
                    <Link
                      href={lessonHref(lesson)}
                      className="group flex gap-4 rounded-2xl border border-border bg-card/30 p-4 transition-colors hover:border-border-strong hover:bg-card/60 sm:p-5"
                    >
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span
                            dir={lesson.section === "ar" ? "rtl" : undefined}
                            className="text-sm font-medium text-foreground group-hover:underline group-hover:decoration-border-strong group-hover:underline-offset-4"
                          >
                            {lesson.title}
                          </span>
                          {lesson.section === "ar" ? (
                            <span className="rounded-full border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                              AR
                            </span>
                          ) : null}
                          {lesson.kind === "editorial" ? (
                            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-800 dark:text-amber-300">
                              Editorial
                            </span>
                          ) : null}
                        </span>
                        {lesson.takeaways.length ? (
                          <span
                            dir={lesson.section === "ar" ? "rtl" : undefined}
                            className="mt-1.5 block text-xs leading-6 text-muted-foreground"
                          >
                            {lesson.takeaways[0]}
                          </span>
                        ) : null}
                      </span>
                      <ArrowRight
                        className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
                {chapter.lab ? (
                  <Link
                    href={chapter.lab.href}
                    className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-background px-4 py-2 text-xs font-medium hover:bg-card"
                  >
                    <FlaskConical className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    {chapter.lab.label}
                  </Link>
                ) : null}
                {arabic.length ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground">
                    {arabic.length} دروس عربية في هذا الفصل
                  </span>
                ) : null}
              </div>
            </div>

            <aside className="space-y-3">
              <div className="rounded-2xl border border-border bg-card/30 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Chapter facts
                </p>
                <dl className="mt-3 space-y-2 text-xs">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted-foreground">Lessons</dt>
                    <dd className="font-mono">{lessons.length}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted-foreground">English</dt>
                    <dd className="font-mono">{english.length}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted-foreground">Arabic</dt>
                    <dd className="font-mono">{arabic.length}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted-foreground">Editorial</dt>
                    <dd className="font-mono">
                      {lessons.filter((lesson) => lesson.kind === "editorial").length}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-border p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Chapter navigation
                </p>
                <div className="mt-3 grid gap-2 text-xs">
                  {previous ? (
                    <Link
                      href={chapterHref(previous)}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                      {previous.number} · {previous.title}
                    </Link>
                  ) : null}
                  {next ? (
                    <Link
                      href={chapterHref(next)}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      {next.number} · {next.title}
                    </Link>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
