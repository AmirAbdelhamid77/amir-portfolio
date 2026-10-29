import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, FlaskConical, ListChecks, ShieldCheck } from "lucide-react";
import {
  JOURNEY_BY_SLUG,
  LABS,
  LAB_BY_SLUG,
  SECTIONS,
  journeyHref,
  labHref,
  sectionHref,
} from "@/lib/statistics/content";
import { getLabVisual, LabVisual } from "@/components/statistics/visual-registry";
import { StatisticsPageHeader } from "@/components/statistics/page-header";
import { Container } from "@/components/ui";
import { SITE } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return LABS.map((lab) => ({ slug: lab.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const lab = LAB_BY_SLUG.get(slug);
  if (!lab) return { title: "Lab not found" };
  return {
    title: lab.title,
    description: `${lab.question} ${lab.description}`.slice(0, 190),
    alternates: { canonical: labHref(lab.slug) },
    openGraph: {
      title: `${lab.title} — Statistics lab`,
      description: lab.question,
      url: labHref(lab.slug),
      images: [{ url: "/og.png", width: 1200, height: 630, alt: lab.title }],
    },
  };
}

export default async function LabPage({ params }: Params) {
  const { slug } = await params;
  const lab = LAB_BY_SLUG.get(slug);
  if (!lab) notFound();
  if (!getLabVisual(lab.slug)) notFound();
  const index = LABS.findIndex((item) => item.slug === lab.slug);
  const previous = index > 0 ? LABS[index - 1] : null;
  const next = index < LABS.length - 1 ? LABS[index + 1] : null;
  const journey = JOURNEY_BY_SLUG.get(lab.journey);
  const related = lab.sections
    .map((number) => SECTIONS.find((section) => section.number === number))
    .filter((section): section is (typeof SECTIONS)[number] => Boolean(section));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lab.title,
    description: lab.question,
    learningResourceType: "Interactive lab",
    educationalLevel: "Intermediate",
    isAccessibleForFree: true,
    inLanguage: "en",
    author: { "@type": "Person", name: SITE.name, url: SITE.url },
    isPartOf: {
      "@type": "Course",
      name: "Comprehensive Statistics Reference",
      url: `${SITE.url}/learn/statistics/`,
    },
    url: `${SITE.url}${labHref(lab.slug)}/`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StatisticsPageHeader
        eyebrow={`${lab.tier} lab · ${journey?.title ?? lab.journey}`}
        breadcrumb="Lab"
        current="labs"
        title={lab.title}
        description={lab.question}
        actions={
          <>
            <Link href="/learn/statistics/labs" className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs text-foreground hover:border-border-strong">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> All labs
            </Link>
            <Link href={journeyHref(lab.journey)} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground">
              Read the journey
            </Link>
            <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[10px] text-muted-foreground">
              {lab.duration}
            </span>
          </>
        }
        aside={
          <div className="w-full rounded-2xl border border-border bg-card/40 p-4 md:w-72">
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Computational core
            </p>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
              The chart is rendered from typed outputs of <code className="font-mono">lib/statistics/math.ts</code>.
              The numeric tests are part of the repository, not a screenshot claim.
            </p>
            <p className="mt-2 border-t border-border pt-2 text-[10px] leading-4 text-muted-foreground">
              {lab.provenance}
            </p>
          </div>
        }
      />

      <Container className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_290px] lg:gap-10 lg:py-10">
        <div className="min-w-0">
          <LabVisual slug={lab.slug} compact />
          <div className="mt-6 rounded-2xl border border-border bg-card/30 p-4">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <ListChecks className="h-3.5 w-3.5" aria-hidden="true" /> What to try, in order
            </p>
            <ol className="mt-2 space-y-1.5 text-xs leading-6 text-muted-foreground">
              <li>1. Read the default state and say what it shows before touching a control.</li>
              <li>2. Make one change. Predict the direction of the numeric readout, then check it.</li>
              <li>3. Use a preset that stresses the method; read the assumptions and the warning.</li>
              <li>4. Reset. Confirm the default is restored exactly.</li>
            </ol>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Controls</p>
            <ul className="mt-2 space-y-1.5 text-[11px] leading-5 text-muted-foreground">
              {lab.controls.map((control) => (
                <li key={control} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-border-strong" />
                  {control}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Mathematics</p>
            <p className="mt-2 font-mono text-[10px] leading-5 text-foreground" dir="ltr">
              {lab.math}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Where it appears</p>
            <ul className="mt-2 space-y-1">
              {related.map((section) => (
                <li key={section.id}>
                  <Link href={sectionHref(section)} className="flex items-baseline gap-2 rounded px-1 py-1 text-[11px] text-muted-foreground hover:text-foreground">
                    <span className="font-mono text-[9px]">§{section.number}</span>
                    {section.titleEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Lab navigation" className="rounded-2xl border border-border p-3 text-[11px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Labs</p>
            <div className="mt-2 grid gap-1.5">
              {previous ? (
                <Link href={labHref(previous.slug)} className="inline-flex min-h-6 items-center gap-1.5 py-1 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-3 w-3" aria-hidden="true" /> {previous.title}
                </Link>
              ) : null}
              {next ? (
                <Link href={labHref(next.slug)} className="inline-flex min-h-6 items-center gap-1.5 py-1 text-muted-foreground hover:text-foreground">
                  <ArrowRight className="h-3 w-3" aria-hidden="true" /> {next.title}
                </Link>
              ) : null}
            </div>
          </nav>

          <p className="flex items-start gap-1.5 text-[10px] leading-5 text-muted-foreground">
            <FlaskConical className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            No real customer, patient or employee data is used. Seeded outcomes are labelled in the lab.
          </p>
        </aside>
      </Container>
    </>
  );
}
