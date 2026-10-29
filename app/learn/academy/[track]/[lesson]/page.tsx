import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Scale, ShieldAlert } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui";
import { LessonBlocks } from "@/components/academy/lesson-blocks";
import {
  ACADEMY_ATTRIBUTION,
  ACADEMY_TRACKS,
  academyLessonHref,
  getAcademyLesson,
  getAcademyTrack,
} from "@/lib/academy/corpus";

type Params = { params: Promise<{ track: string; lesson: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return ACADEMY_TRACKS.flatMap((track) =>
    track.lessons.map((lesson) => ({ track: track.track, lesson: lesson.slug })),
  );
}

function getLesson(track: string, lesson: string) {
  const found = getAcademyLesson(track, lesson);
  // Guard against a lesson slug requested under the wrong track.
  return found && getAcademyTrack(track)?.lessons.includes(found) ? found : undefined;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { track, lesson } = await params;
  const found = getLesson(track, lesson);
  if (!found) return { title: "Lesson not found" };
  return {
    title: `${found.title} — Corpus Academy`,
    description: (found.description ?? found.title).slice(0, 180),
    alternates: { canonical: academyLessonHref(found) },
  };
}

export default async function AcademyLessonPage({ params }: Params) {
  const { track: trackId, lesson: lessonSlug } = await params;
  const lesson = getLesson(trackId, lessonSlug);
  if (!lesson) notFound();
  const track = getAcademyTrack(trackId)!;

  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/learn" className="hover:text-foreground">Learn</Link>
            <span aria-hidden="true">/</span>
            <Link href="/learn/academy/" className="hover:text-foreground">Corpus Academy</Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/70">{lesson.sourcePath}</span>
          </nav>

          <Eyebrow className="mt-6">
            {lesson.kind} · {track.title} · {lesson.duration ?? "duration at source"}
          </Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-tight md:text-4xl">
            {lesson.title}
          </h1>
          {lesson.description ? (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
              {lesson.description}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground">
              <Scale className="h-3 w-3" aria-hidden="true" />
              Mirrored · MIT
            </span>
            <a
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground underline-offset-4 hover:underline"
              href={lesson.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              Source: {lesson.sourcePath}
            </a>
          </div>
        </Container>
      </section>

      <section className="py-8 md:py-12">
        <Container className="space-y-6">
          <div className="flex gap-3 rounded-2xl border border-warning/40 bg-warning/5 p-4">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            <p className="text-sm leading-7 text-muted-foreground">
              {ACADEMY_ATTRIBUTION} Microsoft authors and maintains this content; the source repository page is the
              authoritative, current version. Screenshots stay at the source and appear as links. Review labels,
              UI details and capacity specifics may have moved on since this snapshot — when this page and the
              source disagree, trust the source.
            </p>
          </div>

          <LessonBlocks blocks={lesson.blocks} />

          <div className="flex flex-wrap gap-3">
            <a
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border-strong px-5 text-sm"
              href={lesson.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Open at source (MIT)
            </a>
            <Link
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border-strong px-5 text-sm"
              href="/learn/academy/"
            >
              All Corpus Academy lessons
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
