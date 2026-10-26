import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CircleAlert,
  Layers,
  Target,
} from "lucide-react";
import { CASE_STUDIES, getCaseStudy } from "@/lib/case-studies";
import { DashboardGallery } from "@/components/dashboard-gallery";
import { HseRateBasisExplainer } from "@/components/hse/rate-basis-explainer";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { SITE } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CASE_STUDIES.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return { title: "Case study not found" };

  return {
    title: study.title,
    description: study.summary.slice(0, 160),
    alternates: { canonical: `/work/${study.slug}` },
    openGraph: {
      // PNG rather than the WebP screenshots: some social crawlers still refuse
      // WebP for link previews.
      title: `${study.title} — ${SITE.name}`,
      description: study.subtitle,
      type: "article",
      url: `${SITE.url}/work/${study.slug}/`,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: study.title }],
    },
  };
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const currentIndex = CASE_STUDIES.findIndex((item) => item.slug === study.slug);
  const next = CASE_STUDIES[(currentIndex + 1) % CASE_STUDIES.length];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: study.title,
    description: study.summary,
    author: { "@type": "Person", name: SITE.name, url: SITE.url },
    about: study.tools,
    url: `${SITE.url}/work/${study.slug}/`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative border-b border-border">
        <div aria-hidden="true" className="grid-noise mask-b-fade absolute inset-0 opacity-40" />
        <Container className="relative py-10 md:py-14">
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            All work
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <Eyebrow>{study.status}</Eyebrow>
                {study.featured ? (
                  <span className="rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary-foreground">
                    Flagship
                  </span>
                ) : null}
              </div>
              <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight md:text-5xl">
                {study.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                {study.subtitle}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border text-xs">
              <div className="bg-card/80 p-3">
                <dt className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Role</dt>
                <dd className="mt-1 leading-5 text-foreground">{study.role}</dd>
              </div>
              <div className="bg-card/80 p-3">
                <dt className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Timeframe</dt>
                <dd className="mt-1 leading-5 text-foreground">{study.timeframe}</dd>
              </div>
              <div className="col-span-2 bg-card/80 p-3">
                <dt className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Toolkit</dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {study.tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                    >
                      {tool}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="text-base leading-8 text-foreground/85 sm:text-lg sm:leading-9">
              {study.summary}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                <Target className="h-3.5 w-3.5" aria-hidden="true" />
                Decision-led scope
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                Documented assumptions
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                Measured outcome
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 self-start">
            {study.metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-border bg-card/50 p-4">
                <p className="font-mono text-xl font-medium tracking-tight">{metric.value}</p>
                <p className="mt-1 text-xs font-medium">{metric.label}</p>
                {metric.note ? (
                  <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{metric.note}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Problem */}
      <section className="border-t border-border bg-card/30 py-12 md:py-16">
        <Container className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <Eyebrow>The problem</Eyebrow>
            <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">
              What was broken, and why it mattered.
            </h2>
          </div>
          <ul className="grid gap-3">
            {study.problem.map((item, index) => (
              <li key={item} className="flex gap-3 rounded-2xl border border-border bg-background/70 p-4">
                <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-7 text-muted-foreground">{item}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Approach */}
      <section className="py-12 md:py-16">
        <Container>
          <Eyebrow>The approach</Eyebrow>
          <h2 className="mt-3 max-w-2xl text-2xl font-medium tracking-tight md:text-3xl">
            How the work was actually done.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {study.approach.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-border bg-card/40 p-5 transition-colors hover:border-border-strong"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Step {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-sm font-medium">{step.title}</h3>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Architecture */}
      {study.architecture ? (
        <section className="border-y border-border bg-card/30 py-12 md:py-16">
          <Container>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <Eyebrow>The model</Eyebrow>
                <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">
                  A schema built for cross-domain questions.
                </h2>
              </div>
              <p className="max-w-sm text-xs leading-6 text-muted-foreground">
                Safety, environment, production, and workforce share the same
                date and site dimensions, so a single filter moves the whole
                report.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
              {study.architecture.map((item) => (
                <div key={item.detail} className="bg-background p-4">
                  <p className="font-mono text-lg font-medium tracking-tight">{item.label}</p>
                  <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* Gallery */}
      {study.gallery ? (
        <section className="py-12 md:py-16">
          <Container>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <Eyebrow>Inside the report</Eyebrow>
                <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">
                  Five views, one model.
                </h2>
              </div>
              <p className="max-w-sm text-xs leading-6 text-muted-foreground">
                Click any screenshot to open the viewer. Use the arrow keys to
                move between views.
              </p>
            </div>
            <div className="mt-6">
              <DashboardGallery shots={study.gallery} label={`${study.title} screenshots`} />
            </div>
          </Container>
        </section>
      ) : null}

      {/* Detail sections */}
      <section className="border-t border-border py-12 md:py-16">
        <Container className="grid gap-10 lg:grid-cols-[0.55fr_1.45fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Eyebrow>Detail</Eyebrow>
            <nav aria-label="On this page" className="mt-4 hidden border-l border-border lg:block">
              {study.sections.map((section, index) => (
                <a
                  key={section.heading}
                  href={`#section-${index}`}
                  className="block border-l-2 border-transparent py-1.5 pl-3 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                >
                  {section.heading}
                </a>
              ))}
            </nav>
          </div>

          <div className="space-y-10">
            {study.sections.map((section, index) => (
              <div key={section.heading} id={`section-${index}`} className="scroll-mt-24">
                <h2 className="text-xl font-medium tracking-tight md:text-2xl">
                  {section.heading}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="mt-4 grid gap-2">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-2.5 rounded-xl border border-border bg-card/30 px-3 py-2.5 text-xs leading-6 text-muted-foreground"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {/* The rate-basis explainer sits with the safety section it
                    clarifies: that is where a reader meets TRIR and LTIFR side by
                    side, not in a generic appendix. */}
                {study.slug === "hse-analytics" && section.heading === "Safety performance" ? (
                  <div className="mt-6">
                    <HseRateBasisExplainer />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Outcome + limitations */}
      <section className="border-t border-border bg-card/30 py-12 md:py-16">
        <Container className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-background/70 p-6">
            <Eyebrow>Outcome</Eyebrow>
            <h2 className="mt-3 text-xl font-medium tracking-tight">What the work changed</h2>
            <ul className="mt-4 grid gap-2.5">
              {study.outcome.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-6 text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-warning/30 bg-warning/5 p-6">
            <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
              Limits & honesty
            </p>
            <h2 className="mt-3 text-xl font-medium tracking-tight">What this is not</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{study.limitations}</p>
            <p className="mt-4 border-t border-border pt-4 text-xs leading-6 text-muted-foreground">
              If you need a reference call or a walkthrough of the model, ask.
              The .pbix structure and measure definitions can be discussed
              privately.
            </p>
          </div>
        </Container>
      </section>

      {/* Next */}
      <section className="py-12 md:py-16">
        <Container className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Next case study
            </p>
            <Link
              href={`/work/${next.slug}`}
              className="group mt-2 inline-flex items-center gap-2 text-2xl font-medium tracking-tight"
            >
              {next.title}
              <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/contact" size="md" icon>
              Discuss a project
            </ButtonLink>
            <ButtonLink href="/work" size="md" variant="secondary">
              All work
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
