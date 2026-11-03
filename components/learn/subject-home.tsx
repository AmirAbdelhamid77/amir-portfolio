import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container, Eyebrow, Stat } from "@/components/ui";
import {
  curriculum,
  unitsByStage,
  type CurriculumSubject,
  type CurriculumUnit,
} from "@/lib/curriculum/model";
import type { Stage } from "@/lib/study/topic-review";
import { StageBar } from "./stage-bar";

const STAGE_NOTE: Record<Stage, string> = {
  Foundation: "The vocabulary and the first decisions.",
  Applied: "Use it on a real task.",
  Advanced: "Handle the hard case.",
  Reference: "Return when you need it.",
};

const KIND_LABEL: Record<CurriculumUnit["kind"], string> = {
  lesson: "Lesson",
  "study-note": "Study note",
  "external-foundation": "Reading",
};

function UnitRow({ unit }: { unit: CurriculumUnit }) {
  const external = unit.kind === "external-foundation";
  const body = (
    <>
      <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-sm font-medium">{unit.title}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {KIND_LABEL[unit.kind]}
        </span>
      </span>
      <span className="mt-1 block max-w-2xl text-xs leading-6 text-muted-foreground">
        {unit.objective}
      </span>
    </>
  );

  if (external) {
    return (
      <li>
        <a
          href={unit.href}
          target="_blank"
          rel="noreferrer noopener"
          className="group flex items-start justify-between gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-card/60"
        >
          <span className="min-w-0">{body}</span>
          <ArrowUpRight
            className="mt-1 h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={unit.href}
        className="group flex items-start justify-between gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-card/60"
      >
        <span className="min-w-0">{body}</span>
        <ArrowRight
          className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

/**
 * One subject home. It reads the shared curriculum model, so the order, stage
 * and destination of every unit come from the same place as the learning home.
 */
export function SubjectHome({ subject }: { subject: CurriculumSubject }) {
  const taught = subject.units.filter((unit) => unit.kind !== "study-note");
  const notes = subject.units.filter((unit) => unit.kind === "study-note");
  const groups = unitsByStage({ ...subject, units: taught });
  const stageCount = Object.values(subject.stageCounts).filter((count) => count > 0).length;
  const noteCount = (topicId: string) =>
    notes.filter((note) => note.topics.includes(topicId)).length;
  const programmes = curriculum().programmes.filter((programme) =>
    programme.subjects.includes(subject.id),
  );

  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-10 pt-20 md:pb-12 md:pt-24">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Link href="/learn" className="hover:text-foreground">
              Learn
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/70">{subject.title}</span>
          </nav>

          <Eyebrow className="mt-6">Subject</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-medium tracking-tight md:text-5xl">
            {subject.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            {subject.goal}
          </p>

          {subject.entry ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {subject.entry.kind === "external-foundation" ? (
                <a
                  href={subject.entry.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="press inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Open the reading
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <Link
                  href={subject.entry.href}
                  className="press inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Start the path
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
              <span className="text-xs text-muted-foreground">
                First up: {subject.entry.title}
              </span>
            </div>
          ) : null}

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={String(taught.length)} label="Taught units" note="Lessons and readings" />
            <Stat value={String(notes.length)} label="Source notes" note="Original wording, original links" />
            <Stat value={String(subject.topics.length)} label="Topics" note="Each has a page" />
            <Stat
              value={String(stageCount)}
              label={stageCount === 1 ? "Stage in use" : "Stages in use"}
              note="Foundation first"
            />
          </div>

          <StageBar counts={subject.stageCounts} className="mt-6 max-w-md" />
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <h2 className="text-2xl font-medium tracking-tight">Teaching path</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            Read in this order. Each unit says what it teaches and opens the page
            that teaches it.
          </p>

          <div className="mt-8 space-y-10">
            {groups.map((group) => (
              <section key={group.stage} aria-labelledby={`stage-${subject.id}-${group.stage}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
                  <h3
                    id={`stage-${subject.id}-${group.stage}`}
                    className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground"
                  >
                    {group.stage}
                  </h3>
                  <p className="text-xs text-muted-foreground">{STAGE_NOTE[group.stage]}</p>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {group.units.length}
                  </span>
                </div>
                <ol className="mt-2 divide-y divide-border/60">
                  {group.units.map((unit) => (
                    <UnitRow key={unit.id} unit={unit} />
                  ))}
                </ol>
              </section>
            ))}
          </div>

          {programmes.length > 0 ? (
            <section className="mt-12" aria-labelledby={`programmes-${subject.id}`}>
              <h2 id={`programmes-${subject.id}`} className="text-2xl font-medium tracking-tight">
                Guided programmes
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Longer sequences that pair the material above with practice you can
                save and resume.
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {programmes.map((programme) => (
                  <li key={programme.id}>
                    <Link
                      href={programme.href}
                      className="group flex h-full flex-col rounded-xl border border-border p-4 transition-colors hover:border-border-strong hover:bg-card/60"
                    >
                      <span className="text-sm font-medium">{programme.title}</span>
                      <span className="mt-1 text-xs leading-6 text-muted-foreground">
                        {programme.summary}
                      </span>
                      <span className="mt-auto flex items-center gap-1 pt-3 text-xs">
                        Open
                        <ArrowRight
                          className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {subject.topics.length > 0 ? (
            <section className="mt-12" aria-labelledby={`topics-${subject.id}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
                <h2 id={`topics-${subject.id}`} className="text-2xl font-medium tracking-tight">
                  Topics
                </h2>
                <p className="text-xs text-muted-foreground">
                  {subject.topics.length} {subject.topics.length === 1 ? "topic" : "topics"}
                </p>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                {notes.length > 0
                  ? "Each topic holds its shorter notes in their original words, with the practice that sits beside them."
                  : "Each topic holds the shorter explanations, experiments and practice for that part of the subject."}
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {subject.topics.map((topic) => (
                  <li key={topic.id}>
                    <Link
                      href={topic.href}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:border-border-strong hover:bg-card/60"
                    >
                      <span>{topic.title}</span>
                      <span className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                        {noteCount(topic.id) > 0
                          ? `${noteCount(topic.id)} ${noteCount(topic.id) === 1 ? "note" : "notes"}`
                          : null}
                        <ArrowRight
                          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="mt-12 flex flex-wrap gap-4 border-t border-border pt-6 text-sm">
            <Link href="/learn" className="inline-flex min-h-11 items-center underline underline-offset-4">
              All subjects
            </Link>
            <Link
              href="/practice/catalogue"
              className="inline-flex min-h-11 items-center text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Practise
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
