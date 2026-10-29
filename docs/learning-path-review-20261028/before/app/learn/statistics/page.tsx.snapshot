import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  BookOpen,
  Compass,
  FlaskConical,
  GitBranch,
  Layers,
  LineChart,
  Percent,
  Sparkles,
  Target,
} from "lucide-react";
import {
  JOURNEYS,
  LABS,
  SECTIONS,
  buildSearchIndex,
  journeyHref,
  labHref,
  sectionHref,
  type JourneySlug,
} from "@/lib/statistics/content";
import { SOURCE_STATS } from "@/lib/statistics/source";
import { FLAGSHIP } from "@/lib/statistics/flagship";
import { formatNumber, formatPValue } from "@/lib/statistics/math";
import { ConceptSearch } from "@/components/statistics/concept-search";
import { EvidenceJourney } from "@/components/statistics/exhibits/interactive";
import { FormulaSpotlight } from "@/components/statistics/exhibits/static";
import { StatisticsPageHeader } from "@/components/statistics/page-header";
import { ButtonLink, Container, Eyebrow, SectionHeading, Stat } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Comprehensive Statistics Reference — visual-first",
  description:
    "A visual-first statistics reference: 43 source sections from population and sample through hypothesis testing, experiments and correlation, with 15 interactive labs, a concept atlas, formula workbench and a bilingual glossary.",
  alternates: { canonical: "/learn/statistics" },
  openGraph: {
    title: "Comprehensive Statistics Reference — visual-first",
    description:
      "See, manipulate and verify statistical ideas: sampling, confidence intervals, p-values, correlation, confounding and the checkout A/B case.",
    url: "/learn/statistics",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Comprehensive Statistics Reference" }],
  },
};

const JOURNEY_ICONS: Record<JourneySlug, typeof BookOpen> = {
  foundations: BookOpen,
  describe: BarChart3,
  probability: Percent,
  distributions: Bell,
  sampling: Layers,
  hypothesis: FlaskConical,
  experiments: Target,
  relationships: LineChart,
  synthesis: Compass,
};

const FEATURED = [
  "dot-to-decision",
  "sampling",
  "p-value",
  "confidence",
  "correlation",
  "business-decision",
];

export default function StatisticsHubPage() {
  const searchItems = buildSearchIndex();
  const labCountByJourney = (slug: JourneySlug) => LABS.filter((lab) => lab.journey === slug).length;
  const visualCount = new Set([
    ...SECTIONS.map((section) => section.visual?.id),
    ...LABS.map((lab) => lab.slug),
  ].filter(Boolean)).size;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Comprehensive Statistics Reference",
    description:
      "A visual-first statistics reference reconstructed from the owner's Notion export, with interactive labs and verified computations.",
    provider: { "@type": "Person", name: SITE.name, url: SITE.url },
    isAccessibleForFree: true,
    inLanguage: ["en", "ar"],
    hasPart: JOURNEYS.map((journey) => ({
      "@type": "Chapter",
      name: journey.title,
      url: `${SITE.url}${journeyHref(journey.slug)}/`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StatisticsPageHeader
        eyebrow="Comprehensive Statistics Reference"
        current="overview"
        title="See the statistics. Then defend the decision."
        description="The original reference was strong on definitions and thin on visual reasoning. This version keeps every one of its 43 sections and adds the missing layer: manipulable distributions, honest uncertainty, tail areas you can see, and correlation examples that hide their third variable."
        actions={
          <>
            <ButtonLink href="/learn/statistics/journey/foundations" variant="contrast" icon>
              Start with foundations
            </ButtonLink>
            <ButtonLink href="/learn/statistics/labs/dot-to-decision" variant="secondary">
              From dot to decision
            </ButtonLink>
            <ButtonLink href="/learn/statistics/source" variant="ghost">
              Source &amp; verification
            </ButtonLink>
          </>
        }
        aside={
          <div className="w-full rounded-2xl border border-border bg-card/40 p-4 md:w-72">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Source snapshot</p>
            <dl className="mt-2 space-y-1.5 text-[11px] leading-5 text-muted-foreground">
              <div className="flex justify-between gap-2">
                <dt>Export shape</dt>
                <dd className="text-foreground">1 HTML page</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Numbered sections</dt>
                <dd className="font-mono text-foreground">43</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Original figures</dt>
                <dd className="font-mono text-foreground">0</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Source formulas</dt>
                <dd className="font-mono text-foreground">{SOURCE_STATS.formulas}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Export SHA-256</dt>
                <dd className="font-mono text-[9px] text-foreground">{SOURCE_STATS.sha256.slice(0, 12)}…</dd>
              </div>
            </dl>
            <p className="mt-2 border-t border-border pt-2 text-[10px] leading-4 text-muted-foreground">
              Subpages and figures were not present as separate files; the 43 sections live inside this one export.
              Nothing from a sibling Notion hub was merged in.
            </p>
          </div>
        }
      />

      <Container className="pb-2 pt-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/30 p-3 sm:flex-row sm:items-center sm:justify-between">
          <ConceptSearch items={searchItems} />
          <div className="grid grid-cols-2 gap-2 sm:w-auto sm:grid-cols-4">
            <Stat value={String(SECTIONS.length)} label="Sections" />
            <Stat value={String(LABS.length)} label="Labs" />
            <Stat value={String(visualCount)} label="Visual engines" />
            <Stat value={String(JOURNEYS.length)} label="Journeys" />
          </div>
        </div>
      </Container>

      <section className="py-10 md:py-14">
        <Container>
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
            <div className="rounded-3xl border border-border bg-card/30 p-5 md:p-6">
              <Eyebrow>Flagship</Eyebrow>
              <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">From dot to decision</h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
                The same 40 synthetic session durations travel through every method. The point is not one chart; it is
                that description, sampling variability, estimation, testing and a business decision are one chain.
              </p>

              <div className="mt-5 grid gap-2">
                {[
                  {
                    step: "01",
                    label: "Describe",
                    value: `mean ${formatNumber(FLAGSHIP.mean, 2)} min · median ${formatNumber(FLAGSHIP.median, 2)}`,
                    note: "Right-skewed: the mean is pulled toward longer sessions.",
                  },
                  {
                    step: "02",
                    label: "Sample",
                    value: `SE = ${formatNumber(FLAGSHIP.se, 3)} min`,
                    note: "The standard error describes the mean across repeated samples.",
                  },
                  {
                    step: "03",
                    label: "Estimate",
                    value: `${formatNumber(FLAGSHIP.interval.lower, 2)}–${formatNumber(FLAGSHIP.interval.upper, 2)} min (95%)`,
                    note: "A procedure with long-run coverage, not a probability about a fixed μ.",
                  },
                  {
                    step: "04",
                    label: "Test H₀: μ=7.5",
                    value: `z = ${formatNumber(FLAGSHIP.z, 2)} · p = ${formatPValue(FLAGSHIP.p)}`,
                    note: "Statistically detectable at α=0.05, under the stated model.",
                  },
                  {
                    step: "05",
                    label: "Decide",
                    value: `${formatNumber(FLAGSHIP.effect, 2)} min vs ${formatNumber(FLAGSHIP.threshold, 1)} min threshold`,
                    note: "Significant but below the meaningful threshold — do not ship on this evidence.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3 rounded-xl border border-border bg-background p-2.5">
                    <span className="font-mono text-[10px] text-muted-foreground">{item.step}</span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{item.label}</span>
                        <span className="font-mono text-[11px] text-foreground">{item.value}</span>
                      </p>
                      <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <ButtonLink href="/learn/statistics/labs/dot-to-decision" variant="contrast" icon>
                  Walk the six stages
                </ButtonLink>
                <span className="inline-flex items-center rounded-full border border-amber-500/25 bg-amber-500/[0.06] px-2.5 py-1 text-[10px] text-muted-foreground">
                  40 authored observations · reproducible
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background p-5">
              <Eyebrow>The mental model</Eyebrow>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Select a stage to see the question it answers and what it produces. The model is a dependency chain,
                not a poster: each stage supplies the input to the next.
              </p>
              <div className="mt-4">
                <EvidenceJourney />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-border bg-card/20 py-12 md:py-16">
        <Container>
          <SectionHeading
            eyebrow="The spine"
            title="Nine journeys, 43 source sections"
            description="Grouped for learning, not re-numbered out of existence. Every section keeps its original number, wording and deep link."
          />
          <div className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {JOURNEYS.map((journey) => {
              const Icon = JOURNEY_ICONS[journey.slug];
              const sections = SECTIONS.filter((section) => section.journey === journey.slug);
              return (
                <Link
                  key={journey.slug}
                  href={journeyHref(journey.slug)}
                  className="group flex flex-col rounded-2xl border border-border bg-background/70 p-4 transition-colors hover:border-border-strong hover:bg-card/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card/60">
                      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Journey {journey.number}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-foreground group-hover:underline group-hover:decoration-border-strong group-hover:underline-offset-4">
                    {journey.title}
                  </h3>
                  <p dir="rtl" lang="ar" className="mt-0.5 text-xs text-muted-foreground">
                    {journey.arabic}
                  </p>
                  <p className="mt-2 flex-1 text-[11px] leading-5 text-muted-foreground">{journey.question}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[10px] text-muted-foreground">
                    <span>
                      {journey.sourceRange} · {sections.length} sections
                    </span>
                    <span>{labCountByJourney(journey.slug)} labs</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <SectionHeading
            eyebrow="Featured labs"
            title="Six places to start manipulating"
            description="Each lab exposes one decision. The mathematics is computed independently of the drawing, and every chart has an exact-value table."
            action={{ href: "/learn/statistics/labs", label: "All labs" }}
          />
          <div className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {FEATURED.map((slug) => {
              const lab = LABS.find((item) => item.slug === slug);
              if (!lab) return null;
              return (
                <Link
                  key={lab.slug}
                  href={labHref(lab.slug)}
                  className="group flex flex-col rounded-2xl border border-border bg-background/70 p-4 transition-colors hover:border-border-strong hover:bg-card/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      {lab.tier}
                    </span>
                    <FlaskConical className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-foreground group-hover:underline group-hover:decoration-border-strong group-hover:underline-offset-4">
                    {lab.title}
                  </h3>
                  <p className="mt-1 flex-1 text-[11px] leading-5 text-muted-foreground">{lab.question}</p>
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">{lab.duration}</p>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-y border-border bg-card/20 py-12 md:py-16">
        <Container>
          <SectionHeading
            eyebrow="Concept index"
            title="Find the idea, then the section"
            description="Search 43 sections, 15 labs, formulas and the glossary with Ctrl/Cmd+K. Or browse the source numbering below; it has not been renumbered."
          />
          <div className="mt-6 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {JOURNEYS.map((journey) => (
              <details key={journey.slug} className="group rounded-xl border border-border bg-background">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2">
                  <span className="text-xs font-medium text-foreground">{journey.title}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{journey.sourceRange}</span>
                </summary>
                <ul className="border-t border-border p-2">
                  {SECTIONS.filter((section) => section.journey === journey.slug).map((section) => (
                    <li key={section.id}>
                      <Link
                        href={sectionHref(section)}
                        className="flex items-baseline gap-2 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-card hover:text-foreground"
                      >
                        <span className="font-mono text-[9px] text-muted-foreground">§{section.number}</span>
                        <span className="flex-1">{section.titleEn}</span>
                        {section.visual?.kind === "lab" ? (
                          <FlaskConical className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-border bg-card/30 p-5 md:p-6">
              <SectionHeading
                eyebrow="Quick tools"
                title="When the question changes, the tool should too"
                description="The decision navigator routes a new question to a starting method and names the assumptions it needs. The distribution studio separates discrete masses from continuous density."
              />
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Link href="/learn/statistics/decision" className="group rounded-xl border border-border bg-background p-3 hover:border-border-strong">
                  <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <GitBranch className="h-3.5 w-3.5" aria-hidden="true" /> Which statistical tool?
                  </span>
                  <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">Interactive decision tree with anti-patterns and section links.</span>
                </Link>
                <Link href="/learn/statistics/labs/distributions" className="group rounded-xl border border-border bg-background p-3 hover:border-border-strong">
                  <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <Bell className="h-3.5 w-3.5" aria-hidden="true" /> PMF vs PDF studio
                  </span>
                  <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">The same interface changes its probability semantics with the support.</span>
                </Link>
                <Link href="/learn/statistics/labs/p-value" className="group rounded-xl border border-border bg-background p-3 hover:border-border-strong">
                  <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> p-value observatory
                  </span>
                  <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">Separate the p-tail from the α gate and never call it an overlap.</span>
                </Link>
                <Link href="/learn/statistics/labs/business-decision" className="group rounded-xl border border-border bg-background p-3 hover:border-border-strong">
                  <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <Target className="h-3.5 w-3.5" aria-hidden="true" /> Checkout decision room
                  </span>
                  <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">Denominators, absolute and relative lift, interval, evidence and cost.</span>
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-background p-5">
              <Eyebrow>Formula shortcut</Eyebrow>
              <div className="mt-3">
                <FormulaSpotlight />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-10 md:py-12">
        <Container>
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <Eyebrow>Provenance, not decoration</Eyebrow>
              <h2 className="mt-2 text-2xl font-medium tracking-tight">Every section is accounted for.</h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
                The export had 43 numbered sections, 102 formula occurrences and no figures. All 43 sections render with
                their original wording and source anchor; the visual layer is new and labelled as this site&apos;s
                teaching work. The Poisson tail error in the source is corrected and documented rather than quietly
                repeated.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <ButtonLink href="/learn/statistics/source" variant="secondary">
                  Read the source audit
                </ButtonLink>
                <ButtonLink href="/learn" variant="ghost">
                  Data Visualization hub
                </ButtonLink>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Stat value={String(SOURCE_STATS.headings)} label="Source headings" note="H1–H4" />
              <Stat value={String(SOURCE_STATS.formulas)} label="Formula occurrences" note={`${SOURCE_STATS.uniqueFormulas} unique`} />
              <Stat value={String(SOURCE_STATS.textCharacters)} label="Source characters" note="wording preserved" />
              <Stat value={String(SOURCE_STATS.tables)} label="Source tables" note="rendered accessibly" />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
