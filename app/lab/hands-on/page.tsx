import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, FlaskConical } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui";
import { HANDS_ON_LABS, handsOnLabHref } from "@/lib/study/curated";
import { SUBJECTS } from "@/lib/study/taxonomy";

export const metadata: Metadata = {
  title: "Hands-on labs — Data Lab",
  description:
    "Rights-cleared hands-on lab scaffolds mirrored from open-source repositories (Microsoft Learning, PL-300 and DAX practice labs), with environment, steps, validation checks, license and provenance for every lab.",
  alternates: { canonical: "/lab/hands-on/" },
};

export default function HandsOnIndexPage() {
  const subjects = SUBJECTS.filter((subject) => HANDS_ON_LABS.some((lab) => lab.subject === subject.id));

  return (
    <section className="border-b border-border">
      <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/lab/" className="hover:text-foreground">
            Data Lab
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-foreground/70">Hands-on labs</span>
        </nav>

        <Eyebrow className="mt-6">
          {HANDS_ON_LABS.length} labs · mirrored with attribution · nothing auto-executed
        </Eyebrow>
        <h1 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-tight md:text-4xl">
          Hands-on labs
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
          Every lab here is a scaffold from an open-source repository (license and source on each
          page): the environment to prepare, a step skeleton, validation checks and the provenance
          chain. The source repository stays authoritative — these pages add structure, licensing
          and navigation, not verified walkthroughs.
        </p>
      </Container>

      <Container className="space-y-10 pb-16">
        {subjects.map((subject) => (
          <section key={subject.id} aria-labelledby={`hands-on-${subject.id}`}>
            <h2 id={`hands-on-${subject.id}`} className="text-xl font-medium tracking-tight">
              {subject.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{subject.goal}</p>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {HANDS_ON_LABS.filter((lab) => lab.subject === subject.id).map((lab) => {
                const topicTitle = subject.topics.find(([id]) => id === lab.topic)?.[1] ?? lab.topic;
                return (
                  <li key={lab.slug}>
                    <Link
                      className="group flex min-h-[88px] flex-col justify-between gap-2 rounded-2xl border border-border bg-card/40 p-4 transition-colors hover:bg-card"
                      href={handsOnLabHref(lab)}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="font-medium leading-6">{lab.title}</span>
                        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      </span>
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        <span>{topicTitle}</span>
                        <span>{lab.license}</span>
                        <span>{lab.corpusLabId}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Labs link out to their source repositories; study desks count them as Experiment records.
          Curated by <code className="font-mono text-xs">scripts/build-study-catalogue.mjs</code> from
          the Hansa Deep Research Corpus distillation.
        </p>
      </Container>
    </section>
  );
}
