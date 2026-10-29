import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CatalogueCard } from "@/components/catalogue-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  LEARNING_ENTRIES,
  LEARNING_TOTALS,
  MODE_DESCRIPTION,
  MODE_LABEL,
  TASKS,
  type StudyMode,
} from "@/lib/catalogue";
import { ButtonLink, Container, Eyebrow, SectionHeading, Stat } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Learn — courses, references and labs",
  description:
    "The learning catalogue: a ten-chapter data-visualization course, a 43-section statistics reference, chart labs, a chart decision assistant, an integrity lab and an Arabic companion path. Read, experiment, then test.",
  alternates: { canonical: "/learn/catalogue" },
  openGraph: {
    title: "Learn — courses, references and labs",
    description:
      "Data visualization, statistics and the interactive labs that sit between them. Every route says whether you are reading, experimenting or testing.",
    url: "/learn/catalogue",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hansa learning catalogue" }],
  },
};

const MODES: StudyMode[] = ["read", "experiment", "test"];

export default function LearnCataloguePage() {
  const courses = LEARNING_ENTRIES.filter((entry) => entry.kind === "course");
  const references = LEARNING_ENTRIES.filter((entry) => entry.kind === "reference");
  const tools = LEARNING_ENTRIES.filter((entry) => entry.kind === "tool");

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Learn — Hansa learning catalogue",
      url: `${SITE.url}/learn/catalogue/`,
      description:
        "Courses, references and interactive labs for data visualization and statistics.",
      hasPart: LEARNING_ENTRIES.map((entry) => ({
        "@type": "LearningResource",
        name: entry.title,
        url: `${SITE.url}${entry.href}/`,
        learningResourceType: entry.kind,
        isAccessibleForFree: true,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/` },
        { "@type": "ListItem", position: 2, name: "Learn", item: `${SITE.url}/learn/catalogue/` },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-border">
        <Container className="pb-10 pt-20 md:pb-14 md:pt-24">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Learn" }]} />

          <Eyebrow className="mt-6" dot>
            Learn · catalogue
          </Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-medium tracking-tight md:text-5xl">
            Read it, move it, then explain it.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            Two courses, the reference material behind them, and the labs that sit in
            between. Every card says what you will be doing — reading, experimenting or
            testing — because those are different jobs and the site used to blur them.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <ButtonLink href="/learn" icon>
              Start the visualization course
            </ButtonLink>
            <ButtonLink href="/learn/statistics" variant="secondary">
              Open the statistics reference
            </ButtonLink>
            <ButtonLink href="/practice/catalogue" variant="ghost">
              Looking for questions instead?
            </ButtonLink>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              value={String(LEARNING_TOTALS.chapters)}
              label="Chapters"
              note="Data Visualization spine"
            />
            <Stat
              value={String(LEARNING_TOTALS.statisticSections)}
              label="Source sections"
              note="Statistics reference"
            />
            <Stat
              value={String(LEARNING_TOTALS.interactiveLabs)}
              label="Interactive labs"
              note="Charts + statistics"
            />
            <Stat
              value={String(LEARNING_TOTALS.arabicLessons)}
              label="Arabic lessons"
              note="Companion lane, RTL"
            />
          </div>
        </Container>
      </section>

      {/* Three modes */}
      <section className="border-b border-border bg-card/20 py-10 md:py-12">
        <Container>
          <h2 className="text-sm font-medium">Three kinds of work, and where each happens</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {MODES.map((mode) => (
              <li key={mode} className="rounded-2xl border border-border bg-background/60 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {MODE_LABEL[mode]}
                </p>
                <p className="mt-1.5 text-xs leading-6 text-foreground/80">
                  {MODE_DESCRIPTION[mode]}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Task entry points */}
      <section className="py-12 md:py-16">
        <Container>
          <SectionHeading
            eyebrow="I want to…"
            title="Start from the job, not the table of contents"
            description="Six routes into the same material. Each link names the destination, so it still makes sense out of context."
          />
          <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TASKS.map((task) => (
              <Link
                key={task.id}
                href={task.href}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-card/40 px-4 py-3.5 transition-colors hover:border-border-strong hover:bg-card/70"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{task.label}</span>
                  <span className="block text-[11px] leading-5 text-muted-foreground">
                    {task.detail}
                  </span>
                </span>
                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Courses */}
      <section className="border-t border-border py-12 md:py-16">
        <Container>
          <SectionHeading
            eyebrow="Courses"
            title="Structured paths with a beginning"
            description="Each course has a first lesson, an order, and a place to resume. Counts come from the content modules, not from a marketing sentence."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {courses.map((entry) => (
              <CatalogueCard key={entry.id} entry={entry} />
            ))}
          </div>
        </Container>
      </section>

      {/* References */}
      <section className="border-t border-border bg-card/20 py-12 md:py-16">
        <Container>
          <SectionHeading
            eyebrow="References"
            title="Look something up, precisely"
            description="Reference pages are for arriving with a question — a formula, a term, a source hash. They keep their own search and anchors."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {references.map((entry) => (
              <CatalogueCard key={entry.id} entry={entry} />
            ))}
          </div>
        </Container>
      </section>

      {/* Tools */}
      <section className="border-t border-border py-12 md:py-16">
        <Container>
          <SectionHeading
            eyebrow="Experiments"
            title="Move one thing and see what changes"
            description="Every lab has a reset, a stated synthetic or sourced dataset, and a numeric or table answer for anyone who cannot use the chart."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {tools.map((entry) => (
              <CatalogueCard key={entry.id} entry={entry} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-12 md:py-16">
        <Container>
          <div className="rounded-3xl border border-border bg-card/40 p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <Eyebrow>Next</Eyebrow>
                <h2 className="mt-3 text-2xl font-medium tracking-tight">
                  Reading is not the same as being able to do it.
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  The practice catalogue holds the question banks: 60 analyst questions, 834
                  Fabric questions and 12 visualization scenarios, with answer keys and
                  rationales.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <ButtonLink href="/practice/catalogue" icon>
                  Open the practice catalogue
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
