import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CircleAlert,
  ExternalLink,
  FlaskConical,
  ListChecks,
  Scale,
  ShieldAlert,
} from "lucide-react";
import { Container, Eyebrow } from "@/components/ui";
import { Panel } from "@/components/fabric/ui";
import {
  HANDS_ON_LABS,
  handsOnLabHref,
  type HandsOnLab,
} from "@/lib/study/curated";
import { SUBJECTS, subjectById, topicHref } from "@/lib/study/taxonomy";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return HANDS_ON_LABS.map((lab) => ({ slug: lab.slug }));
}

function getLab(slug: string): HandsOnLab | undefined {
  return HANDS_ON_LABS.find((lab) => lab.slug === slug);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const lab = getLab(slug);
  if (!lab) return { title: "Hands-on lab not found" };
  const description = `${lab.environment}. Hands-on lab scaffold from an open-source repository — license ${lab.license}; the source stays authoritative.`;
  return {
    title: `${lab.title} — Hands-on labs`,
    description: description.slice(0, 180),
    alternates: { canonical: handsOnLabHref(lab) },
    openGraph: {
      title: lab.title,
      description: description.slice(0, 180),
      url: handsOnLabHref(lab),
      images: [{ url: "/og.png", width: 1200, height: 630, alt: `${lab.title} — Hands-on labs` }],
    },
  };
}

function LabList({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  if (!items.length) return null;
  const List = ordered ? "ol" : "ul";
  return (
    <List className={`mt-3 space-y-2 ${ordered ? "list-decimal" : "list-disc"} ps-5`}>
      {items.map((item, index) => (
        <li key={`${index}-${item.slice(0, 24)}`} className="text-sm leading-7 text-muted-foreground">
          {item}
        </li>
      ))}
    </List>
  );
}

export default async function HandsOnLabPage({ params }: Params) {
  const { slug } = await params;
  const lab = getLab(slug);
  if (!lab) notFound();

  const subject = subjectById(lab.subject)!;
  const topicTitle = subject.topics.find(([id]) => id === lab.topic)?.[1] ?? lab.topic;
  const siblings = HANDS_ON_LABS.filter((item) => item.subject === lab.subject && item.slug !== lab.slug);
  const repo = lab.sourceUrl.match(/github\.com\/([^/]+\/[^/]+)/)?.[1] ?? lab.sourceUrl;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lab.title,
    description: lab.summary || `Hands-on lab scaffold from ${repo}.`,
    learningResourceType: "Hands-on lab",
    educationalLevel: "Intermediate",
    isAccessibleForFree: true,
    license: lab.license,
    url: `/lab/hands-on/${lab.slug}/`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-border">
        <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Link href="/lab/" className="hover:text-foreground">
              Data Lab
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/lab/hands-on/" className="hover:text-foreground">
              Hands-on labs
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/70">{lab.corpusLabId ?? lab.slug}</span>
          </nav>

          <Eyebrow className="mt-6">
            Hands-on lab · {subject.title} · {topicTitle}
          </Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-tight md:text-4xl">
            {lab.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            {lab.summary ||
              `Hands-on lab scaffold from the ${repo} repository. Follow it in ${lab.environment}; the source stays authoritative.`}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground">
              <Scale className="h-3 w-3" aria-hidden="true" />
              {lab.rightsClass} · {lab.license}
            </span>
            <span className="rounded-full bg-warning/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground">
              Authoring scaffold — not a verified walkthrough
            </span>
            <a
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground underline-offset-4 hover:underline"
              href={lab.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              {repo}
            </a>
          </div>
        </Container>
      </section>

      <section className="py-8 md:py-12">
        <Container className="space-y-6">
          <div className="flex gap-3 rounded-2xl border border-warning/40 bg-warning/5 p-4">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            <p className="text-sm leading-7 text-muted-foreground">
              {lab.originNote} Titles, steps and assets below are outlines from the source
              repository (lab folder structure and its markdown), attributed and licensed{" "}
              {lab.license}. Nothing here was executed against Fabric or any tenant; review the
              source before running anything. Environment: {lab.environment}.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Environment & prerequisites" description="Where this lab runs, and what to prepare first.">
              <p className="text-sm leading-7">{lab.environment}</p>
              <LabList items={lab.prerequisites} />
              {!lab.prerequisites.length ? (
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  The source records no explicit prerequisites — the repository README is the
                  authority.
                </p>
              ) : null}
            </Panel>

            <Panel title="Validation checks" description="How to tell the lab worked.">
              {lab.validationChecks.length ? (
                <ul className="space-y-2">
                  {lab.validationChecks.map((item, index) => (
                    <li key={index} className="flex gap-3 text-sm leading-7 text-muted-foreground">
                      <ListChecks className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="flex gap-3 text-sm leading-7 text-muted-foreground">
                  <CircleAlert className="mt-1 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                  No validation checks were recorded in the source markdown. Decide your own
                  expected result from the lab&apos;s goal before starting.
                </p>
              )}
              {lab.expectedOutputs.length ? (
                <>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Expected outputs
                  </p>
                  <LabList items={lab.expectedOutputs} />
                </>
              ) : null}
            </Panel>
          </div>

          <Panel title="Step skeleton" description="Outline reconstructed from the source repository — not a substitute for its instructions.">
            {lab.steps.length ? (
              <LabList items={lab.steps} ordered />
            ) : (
              <p className="flex gap-3 text-sm leading-7 text-muted-foreground">
                <CircleAlert className="mt-1 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                The corpus harvested this lab from its folder structure only — open the source
                repository for the actual instructions.
              </p>
            )}
          </Panel>

          <Panel title="Provenance" description="Where this lab came from, and what stays with the source.">
            <dl className="grid gap-3 text-sm leading-7 sm:grid-cols-2">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Source repository</dt>
                <dd>
                  <a className="underline underline-offset-4" href={lab.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {repo} <ExternalLink className="inline h-3 w-3" aria-hidden="true" />
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Corpus identity</dt>
                <dd className="text-muted-foreground">
                  lab {lab.corpusLabId ?? "—"} · module {lab.corpusModuleId ?? "—"} · title from{" "}
                  {lab.titleSource}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Rights</dt>
                <dd className="text-muted-foreground">
                  {lab.rightsClass} · license {lab.license} — mirrored with attribution; the
                  source repository stays authoritative.
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Assets in the source folder</dt>
                <dd className="text-muted-foreground">
                  {lab.assetCount} files{lab.assets.length ? `, e.g. ${lab.assets.slice(0, 3).join(", ")}` : ""}
                </dd>
              </div>
            </dl>
          </Panel>

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 text-sm text-primary-foreground"
              href={topicHref(lab.subject, lab.topic)}
            >
              <FlaskConical className="h-4 w-4" aria-hidden="true" />
              Open the {topicTitle} topic desk
            </Link>
            <Link
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border-strong px-5 text-sm"
              href={`/study/${lab.subject}/`}
            >
              All {subject.title} topics
            </Link>
          </div>

          {siblings.length ? (
            <Panel title="More hands-on labs in this subject" tone="muted">
              <ul className="grid gap-2 sm:grid-cols-2">
                {siblings.map((item) => (
                  <li key={item.slug}>
                    <Link
                      className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-border px-4 text-sm hover:bg-card"
                      href={handsOnLabHref(item)}
                    >
                      <span className="min-w-0 truncate">{item.title}</span>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {item.corpusLabId}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </Container>
      </section>
    </>
  );
}
