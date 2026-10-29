import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { chapterHref, lessonHref, lessonsForChapter } from "@/lib/data-viz/content";
import type { Chapter } from "@/lib/data-viz/types";
import { cn } from "@/lib/utils";

export function ChapterCard({
  chapter,
  featured = false,
}: {
  chapter: Chapter;
  featured?: boolean;
}) {
  const lessons = lessonsForChapter(chapter);
  const english = lessons.filter((lesson) => lesson.section === "en");
  const arabic = lessons.filter((lesson) => lesson.section === "ar");

  return (
    <article
      className={cn(
        "flex flex-col rounded-3xl border border-border bg-card/40 p-5 transition-colors hover:border-border-strong sm:p-6",
        featured && "bg-card/70",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Chapter {chapter.number}
        </span>
        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
        </span>
      </div>

      <h3 className="mt-2 text-lg font-medium tracking-tight">
        <Link href={chapterHref(chapter)} className="hover:underline hover:decoration-border-strong hover:underline-offset-4">
          {chapter.title}
        </Link>
      </h3>
      <p className="mt-1 text-xs font-medium text-foreground/70">{chapter.question}</p>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{chapter.summary}</p>

      <ul className="mt-4 grid gap-1.5">
        {english.map((lesson) => (
          <li key={`en-${lesson.slug}`}>
            <Link
              href={lessonHref(lesson)}
              className="group flex items-center justify-between gap-3 rounded-lg px-1 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-1 w-1 shrink-0 rounded-full bg-border-strong transition-colors group-hover:bg-foreground"
                />
                {lesson.title}
              </span>
              <ArrowRight
                className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
        {arabic.map((lesson) => (
          <li key={`ar-${lesson.slug}`}>
            <Link
              href={lessonHref(lesson)}
              dir="rtl"
              lang="ar"
              className="group flex items-center justify-between gap-3 rounded-lg px-1 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-1 w-1 shrink-0 rounded-full bg-border-strong transition-colors group-hover:bg-foreground"
                />
                {lesson.title}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                AR
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5">
        <Link
          href={chapterHref(chapter)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline hover:decoration-border-strong hover:underline-offset-4"
        >
          Chapter overview
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function LabLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full border border-border-strong bg-background px-4 py-2 text-xs font-medium transition-colors hover:bg-card"
    >
      <FlaskConical className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      {label}
      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}
