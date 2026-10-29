import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, FlaskConical } from "lucide-react";
import {
  JOURNEY_BY_SLUG,
  JOURNEYS,
  SECTIONS,
  sectionsForJourney,
  journeyHref,
  type JourneySlug,
} from "@/lib/statistics/content";
import { SOURCE_STATS, sourceSection } from "@/lib/statistics/source";
import { SourceSectionView } from "@/components/statistics/source-blocks";
import { ReadingProgress } from "@/components/statistics/reading-progress";
import { StatisticsPageHeader } from "@/components/statistics/page-header";
import { ButtonLink, Container } from "@/components/ui";
import { SITE } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return JOURNEYS.map((journey) => ({ slug: journey.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const journey = JOURNEY_BY_SLUG.get(slug as JourneySlug);
  if (!journey) return { title: "Journey not found" };
  return {
    title: `Journey ${journey.number} — ${journey.title}`,
    description: `${journey.question} ${journey.summary}`.slice(0, 190),
    alternates: { canonical: journeyHref(journey.slug) },
    openGraph: {
      title: `${journey.title} — Statistics`,
      description: journey.summary,
      url: journeyHref(journey.slug),
      images: [{ url: "/og.png", width: 1200, height: 630, alt: journey.title }],
    },
  };
}

export default async function JourneyPage({ params }: Params) {
  const { slug } = await params;
  const journey = JOURNEY_BY_SLUG.get(slug as JourneySlug);
  if (!journey) notFound();

  const index = JOURNEYS.findIndex((item) => item.slug === journey.slug);
  const previous = index > 0 ? JOURNEYS[index - 1] : null;
  const next = index >= 0 && index < JOURNEYS.length - 1 ? JOURNEYS[index + 1] : null;
  const sections = sectionsForJourney(journey.slug);
  const sourceSections = sections.map((section) => sourceSection(section.number));
  const labs = SECTIONS.filter((section) => section.journey === journey.slug && section.visual?.kind === "lab");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: journey.title,
    description: journey.summary,
    learningResourceType: "Chapter",
    educationalLevel: "Intermediate",
    isAccessibleForFree: true,
    inLanguage: "en",
    author: { "@type": "Person", name: SITE.name, url: SITE.url },
    isPartOf: {
      "@type": "Course",
      name: "Comprehensive Statistics Reference",
      url: `${SITE.url}/learn/statistics/`,
    },
    url: `${SITE.url}${journeyHref(journey.slug)}/`,
    citation: SOURCE_STATS.notionUrl ?? undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress />
      <StatisticsPageHeader
        eyebrow={`Journey ${journey.number} · ${journey.sourceRange}`}
        breadcrumb={`Journey ${journey.number}`}
        current="journeys"
        title={journey.title}
        description={journey.summary}
        actions={
          <>
            <ButtonLink href={next ? journeyHref(next.slug) : "/learn/statistics"} variant="contrast" icon>
              {next ? "Next journey" : "Back to the hub"}
            </ButtonLink>
            <ButtonLink href="/learn/statistics/labs" variant="secondary">
              Open the labs
            </ButtonLink>
            <ButtonLink href="/learn/statistics/source" variant="ghost">
              Source audit
            </ButtonLink>
          </>
        }
        aside={
          <div className="w-full rounded-2xl border border-border bg-card/40 p-4 md:w-64">
            <p dir="rtl" lang="ar" className="text-sm text-foreground">
              {journey.arabic}
            </p>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{journey.question}</p>
            <dl className="mt-3 space-y-1 text-[11px] text-muted-foreground">
              <div className="flex justify-between gap-2">
                <dt>Sections</dt>
                <dd className="font-mono text-foreground">{sections.length}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Lab links</dt>
                <dd className="font-mono text-foreground">{labs.length}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Source range</dt>
                <dd className="font-mono text-foreground">{journey.sourceRange}</dd>
              </div>
            </dl>
          </div>
        }
      />

      <Container className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14 lg:py-14">
        <aside className="lg:col-start-2 lg:row-start-1">
          <div className="space-y-3 lg:sticky lg:top-24">
            <nav aria-label="On this journey" className="rounded-2xl border border-border bg-card/40 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">On this journey</p>
              <ol className="mt-3 space-y-1.5 border-s border-border ps-3 text-[11px] leading-5">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="flex items-baseline gap-1.5 py-0.5 text-muted-foreground transition-colors hover:text-foreground">
                      <span className="font-mono text-[9px]">§{section.number}</span>
                      <span className="flex-1">{section.titleEn}</span>
                      {section.visual?.kind === "lab" ? (
                        <FlaskConical className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                      ) : null}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="rounded-2xl border border-border bg-card/30 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Outcomes</p>
              <ul className="mt-3 space-y-1.5 text-[11px] leading-5 text-muted-foreground">
                {journey.outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-2">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-success" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Provenance</p>
              <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
                Source file <span className="break-all font-mono">{SOURCE_STATS.sourceFile}</span>. Exported{" "}
                {new Date(SOURCE_STATS.observedModified).toISOString().slice(0, 10)}. SHA-256{" "}
                <span className="break-all font-mono">{SOURCE_STATS.sha256.slice(0, 20)}…</span>. Wording preserved;
                headings, formulas and tables are rendered as typed blocks.
              </p>
              <Link href="/learn/statistics/source" className="mt-2 inline-flex text-[10px] text-foreground underline decoration-border-strong underline-offset-4">
                Read the full source audit
              </Link>
            </div>
          </div>
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="mb-8 rounded-2xl border border-border bg-card/40 p-4">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              How to read this journey
            </p>
            <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
              Each section opens with the source heading and a compact learning objective and trap, then renders the
              original text — Arabic explanation, English terms, repaired formulas, tables and toggles. Interactive
              exhibits sit beside the concept they explain, not in a gallery at the end. Deep-link any section with its{" "}
              <span className="font-mono">#sN</span> anchor.
            </p>
          </div>

          <div className="space-y-12">
            {sourceSections.map((section) => (
              <SourceSectionView key={section.id} section={section} />
            ))}
          </div>

          <nav aria-label="Journey navigation" className="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
            {previous ? (
              <Link href={journeyHref(previous.slug)} className="group rounded-2xl border border-border p-4 transition-colors hover:border-border-strong hover:bg-card/40">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <ArrowLeft className="h-3 w-3" aria-hidden="true" /> Previous journey
                </span>
                <span className="mt-1 block text-sm text-foreground group-hover:underline group-hover:decoration-border-strong group-hover:underline-offset-4">
                  {previous.number}. {previous.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={journeyHref(next.slug)} className="group rounded-2xl border border-border p-4 text-end transition-colors hover:border-border-strong hover:bg-card/40">
                <span className="flex items-center justify-end gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Next journey <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
                <span className="mt-1 block text-sm text-foreground group-hover:underline group-hover:decoration-border-strong group-hover:underline-offset-4">
                  {next.number}. {next.title}
                </span>
              </Link>
            ) : null}
          </nav>

          <p className="mt-6 text-[10px] leading-5 text-muted-foreground">
            Source wording is transcribed from the owner&apos;s local Notion export. New objectives, misconceptions,
            visual explanations and corrections are this site&apos;s work and are labelled as such.
          </p>
        </div>
      </Container>
    </>
  );
}
