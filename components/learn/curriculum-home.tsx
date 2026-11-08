import Link from "next/link";
import { ArrowRight, BookOpenCheck, Compass, Search } from "lucide-react";
import { ButtonLink, Container, Eyebrow, SectionHeading, Stat } from "@/components/ui";
import { curriculum } from "@/lib/curriculum/model";
import { StageBar } from "./stage-bar";

/**
 * Display order, not a claim about the taxonomy: the three subjects with a
 * complete local course come first, single-reading subjects last. `/study`
 * keeps the taxonomy order for its own listing.
 */
const ORDER = [
  "visualization",
  "statistics",
  "sql",
  "fabric",
  "power-bi",
  "analysis",
  "python",
  "excel",
] as const;

const NEXT_STEPS = [
  {
    icon: BookOpenCheck,
    title: "Practise what you just read",
    body: "Questions keep their original IDs and context. Your answers and saved sessions stay where they were.",
    href: "/practice/catalogue",
    label: "Open practice",
  },
  {
    icon: Compass,
    title: "Work through a lab",
    body: "Change the constraint, not the numbers. Every lab states what it does and does not model.",
    href: "/lab",
    label: "Open the labs",
  },
  {
    icon: Search,
    title: "Look something up",
    body: "One search box for lessons, questions, labs and references. It returns the best match first.",
    href: "/search",
    label: "Search the site",
  },
];

export function CurriculumHome() {
  const model = curriculum();
  const taught = model.units.filter((unit) => unit.kind !== "study-note").length;
  const notes = model.units.length - taught;
  const subjects = [...model.subjects].sort(
    (a, b) => ORDER.indexOf(a.id as (typeof ORDER)[number]) - ORDER.indexOf(b.id as (typeof ORDER)[number]),
  );

  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-12 pt-20 md:pb-16 md:pt-24">
          <Eyebrow dot>Learn · one curriculum</Eyebrow>
          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-medium tracking-tight md:text-5xl">
            One path through the subjects.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            Every subject follows the same order: understand the foundation, apply
            it to a real decision, then handle the advanced case. Pick the subject
            you need, or start at the beginning and keep going.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <ButtonLink href="/learn/visualization/" icon>
              Start with visualization
            </ButtonLink>
            <ButtonLink href="/learn/statistics/" variant="secondary">
              Statistics reference
            </ButtonLink>
            <ButtonLink href="/learn/sql/" variant="ghost">
              SQL path
            </ButtonLink>
            <ButtonLink href="/prototype/network/" variant="ghost">
              Knowledge map
            </ButtonLink>
            <ButtonLink href="/content-index/" variant="ghost">
              Content index
            </ButtonLink>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={String(model.subjects.length)} label="Subjects" note="One home each" />
            <Stat
              value={taught.toLocaleString("en-US")}
              label="Taught units"
              note="Lessons and primary readings"
            />
            <Stat
              value={notes.toLocaleString("en-US")}
              label="Source notes"
              note="Original wording, original links"
            />
            <Stat
              value={String(model.programmes.length)}
              label="Programmes"
              note="Longer guided sequences"
            />
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Subjects"
            title="Choose what you need next."
            description="The bar under each subject shows how it is built: foundation, applied, advanced, and reference material you return to."
          />

          <ol className="mt-9 divide-y divide-border border-y border-border">
            {subjects.map((subject, index) => {
              const unitCount = subject.units.length;
              const subjectTaught = subject.units.filter(
                (unit) => unit.kind !== "study-note",
              ).length;
              const subjectNotes = unitCount - subjectTaught;
              return (
                <li key={subject.id}>
                  <Link
                    href={subject.href}
                    className="group grid gap-4 py-6 transition-colors hover:bg-card/40 sm:grid-cols-[3rem_minmax(0,1fr)_14rem_auto] sm:items-center sm:gap-6 sm:px-2"
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-lg font-medium tracking-tight">
                        {subject.title}
                        <ArrowRight
                          className="h-4 w-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="mt-1 block max-w-xl text-sm leading-6 text-muted-foreground">
                        {subject.goal}
                      </span>
                    </span>
                    <StageBar counts={subject.stageCounts} />
                    <span className="font-mono text-[11px] text-muted-foreground sm:text-right">
                      <span className="block text-foreground">{subjectTaught} taught</span>
                      {subjectNotes > 0 ? <span className="block">{subjectNotes} notes</span> : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      <section className="border-t border-border py-14 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Topics"
            title="Every topic, in one place."
            description="Each subject keeps its topics in one place. They hold the shorter notes, experiments and practice that sit beside the main path."
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((subject) => (
              <section key={subject.id}>
                <h3 className="text-sm font-medium">
                  <Link href={subject.href} className="hover:underline underline-offset-4">
                    {subject.title}
                  </Link>
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {subject.topics.map((topic) => (
                    <li key={topic.id}>
                      <Link
                        href={topic.href}
                        className="text-xs leading-6 text-muted-foreground hover:text-foreground"
                      >
                        {topic.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-14 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Programmes"
            title="When one subject is not enough."
            description="Longer sequences that combine a course, its practice sets and the saved progress you already have."
          />
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {model.programmes.map((programme) => (
              <Link
                key={programme.id}
                href={programme.href}
                className="group flex flex-col rounded-2xl border border-border bg-card/40 p-5 transition-colors hover:border-border-strong hover:bg-card/70"
              >
                <h3 className="text-sm font-medium">{programme.title}</h3>
                <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                  {programme.summary}
                </p>
                <span className="mt-auto flex items-center gap-1 pt-4 text-xs text-foreground">
                  Open
                  <ArrowRight
                    className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-14 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Next"
            title="Reading is half of it."
            description="Every subject points at practice and labs that use the same material."
          />
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {NEXT_STEPS.map((step) => (
              <Link
                key={step.href}
                href={step.href}
                className="group flex flex-col rounded-2xl border border-border bg-card/40 p-5 transition-colors hover:border-border-strong hover:bg-card/70"
              >
                <step.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <h3 className="mt-4 text-sm font-medium">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-6 text-muted-foreground">{step.body}</p>
                <span className="mt-auto flex items-center gap-1 pt-4 text-xs text-foreground">
                  {step.label}
                  <ArrowRight
                    className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
