import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ExternalLink, Scale } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui";
import { ACADEMY_ATTRIBUTION, ACADEMY_TRACKS, academyLessonHref } from "@/lib/academy/corpus";

export const metadata: Metadata = {
  title: "Corpus Academy — mirrored Microsoft Learning courseware",
  description:
    "The open MicrosoftLearning courseware labs (mslearn-fabric, PL-300), mirrored from their MIT-licensed repositories with attribution and source links: step-by-step labs and demos for Fabric and Power BI.",
  alternates: { canonical: "/learn/academy/" },
};

export default function AcademyIndexPage() {
  const total = ACADEMY_TRACKS.reduce((sum, track) => sum + track.lessons.length, 0);

  return (
    <section className="border-b border-border">
      <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/learn" className="hover:text-foreground">
            Learn
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-foreground/70">Corpus Academy</span>
        </nav>

        <Eyebrow className="mt-6">{total} lessons · mirrored with attribution · MIT</Eyebrow>
        <h1 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-tight md:text-4xl">Corpus Academy</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
          The step-by-step labs and demos from the open MicrosoftLearning courseware repositories, mirrored from
          their MIT-licensed sources with attribution. Microsoft authors this content; this site republishes it
          under the license, unmodified except for formatting. Every lesson links back to its source file.
        </p>
        <p className="mt-4 max-w-2xl rounded-2xl border border-warning/40 bg-warning/5 p-3 text-xs leading-6 text-muted-foreground">
          <Scale className="me-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
          {ACADEMY_ATTRIBUTION}
        </p>
      </Container>

      <Container className="space-y-10 pb-16">
        {ACADEMY_TRACKS.map((track) => (
          <section key={track.track} aria-labelledby={`academy-${track.track}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id={`academy-${track.track}`} className="text-xl font-medium tracking-tight">
                {track.title}
              </h2>
              <a
                className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground underline-offset-4 hover:underline"
                href={track.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                {track.repo} · MIT
              </a>
            </div>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {track.lessons.map((lesson) => (
                <li key={lesson.slug}>
                  <Link
                    className="group flex min-h-[72px] flex-col justify-between gap-2 rounded-2xl border border-border bg-card/40 p-4 transition-colors hover:bg-card"
                    href={academyLessonHref(lesson)}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-medium leading-6">{lesson.title}</span>
                      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    </span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      <span>{lesson.kind}</span>
                      {lesson.duration ? <span>{lesson.duration}</span> : null}
                      <span>{lesson.slug}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Container>
    </section>
  );
}
