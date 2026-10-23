/* eslint-disable @next/next/no-img-element -- screenshots are pre-optimised
   WebP files with hand-written srcset; the Next image optimiser needs a server
   and this site is a static export. */
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Database,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { CASE_STUDIES } from "@/lib/case-studies";
import { EXAM_SUMMARIES, TOPIC_META } from "@/lib/exams";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";
import { CaseStudyCard } from "@/components/case-study-card";
import { ButtonLink, Container, Eyebrow, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const ICONS = {
  chart: BarChart3,
  database: Database,
  graduation: GraduationCap,
} as const;

const LAB_PREVIEW = ["sql", "power-bi", "statistics"];

export default function HomePage() {
  const featured = CASE_STUDIES[0];
  const others = CASE_STUDIES.slice(1);
  const labExams = EXAM_SUMMARIES.filter((exam) => LAB_PREVIEW.includes(exam.slug));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    url: SITE.url,
    email: `mailto:${SITE.email}`,
    jobTitle: SITE.role,
    description: SITE.description,
    sameAs: [SITE.socials.github, SITE.socials.linkedin],
    knowsAbout: [
      "Power BI",
      "DAX",
      "SQL",
      "Python",
      "Pandas",
      "Excel",
      "Data visualisation",
      "Statistics",
    ],
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Sohag University",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="grid-noise mask-radial-fade absolute inset-0 opacity-70"
        />
        <div
          aria-hidden="true"
          className="absolute -top-56 left-1/2 h-[560px] w-[min(1100px,120vw)] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklch, var(--accent) 22%, transparent), transparent 70%)",
          }}
        />

        <Container className="relative pb-10 pt-20 text-center md:pt-28">
          <Eyebrow dot>
            <span className="sm:hidden">Open to roles &amp; freelance</span>
            <span className="hidden sm:inline">{SITE.availability}</span>
          </Eyebrow>

          <h1 className="mx-auto mt-6 max-w-4xl text-balance text-[2.6rem] font-medium leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Data that makes
            <br />
            decisions{" "}
            <mark className="mark mark-hero">visible.</mark>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            I&apos;m Amir Abdelhamid, a data analyst building decision-ready
            dashboards with <strong className="font-medium text-foreground">Power BI, SQL, Python, and Excel</strong> — and
            teaching the craft through a free practice lab.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/work" size="lg" icon>
              See the work
            </ButtonLink>
            <ButtonLink href="/lab" size="lg" variant="secondary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Try the Data Lab
            </ButtonLink>
          </div>

          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Power BI · DAX · SQL · Python · Excel
          </p>

          {/* Evidence panel */}
          <div className="mx-auto mt-12 max-w-5xl text-left md:mt-16">
            <div className="overflow-hidden rounded-3xl border border-border bg-card/70 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.35)] backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex gap-1" aria-hidden="true">
                    <span className="h-2 w-2 rounded-full bg-foreground/15" />
                    <span className="h-2 w-2 rounded-full bg-foreground/15" />
                    <span className="h-2 w-2 rounded-full bg-foreground/15" />
                  </span>
                  <p className="ml-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    HSE Analytics / Executive overview
                  </p>
                </div>
                <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                  <span className="sm:hidden">Synthetic</span>
                  <span className="hidden sm:inline">Synthetic data</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-px border-b border-border bg-border sm:grid-cols-4">
                {featured.metrics.map((metric) => (
                  <div key={metric.label} className="bg-background/80 px-4 py-3">
                    <p className="font-mono text-lg font-medium tracking-tight sm:text-xl">
                      {metric.value}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-foreground/75">
                      {metric.label}
                    </p>
                    <p className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">
                      {metric.note}
                    </p>
                  </div>
                ))}
              </div>

              <Link href="/work/hse-analytics" className="group block">
                <img
                  src="/images/hse/executive-overview-1200.webp"
                  srcSet="/images/hse/executive-overview-1200.webp 1200w, /images/hse/executive-overview-2000.webp 2000w"
                  sizes="(min-width: 1024px) 1000px, 100vw"
                  alt="Executive overview of the HSE dashboard showing safety rate KPIs and status cards"
                  width={1200}
                  height={681}
                  className="h-auto w-full transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.01]"
                />
              </Link>

              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  24 sites · 50+ tables · 229+ measures
                </p>
                <Link
                  href="/work/hse-analytics"
                  className="inline-flex items-center gap-1 text-xs font-medium text-foreground"
                >
                  Read the case study
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Proof strip */}
      <section className="border-y border-border bg-card/30">
        <Container className="grid grid-cols-2 gap-px py-0 sm:grid-cols-4">
          {[
            { value: "229+", label: "DAX measures", note: "documented logic" },
            { value: "50+", label: "modelled tables", note: "constellation schema" },
            { value: "24", label: "operating sites", note: "synthetic HSE data" },
            { value: "60", label: "practice questions", note: "six data topics" },
          ].map((stat) => (
            <div key={stat.label} className="px-1 py-6 sm:px-4">
              <p className="font-mono text-2xl font-medium tracking-tight">{stat.value}</p>
              <p className="mt-1 text-xs font-medium">{stat.label}</p>
              <p className="text-[11px] text-muted-foreground">{stat.note}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* Selected work */}
      <section className="py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="01 — Selected work"
            title="Proof, not a tool list."
            description="Three projects, each showing a different part of the analyst job: model the operation, run the analysis, validate the data."
            action={{ href: "/work", label: "All case studies" }}
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <CaseStudyCard study={featured} variant="feature" />
            {others.map((study) => (
              <CaseStudyCard key={study.slug} study={study} />
            ))}
          </div>
        </Container>
      </section>

      {/* Services */}
      <section className="border-t border-border bg-card/30 py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="02 — What I do"
            title="From raw tables to a room that agrees."
            description="The deliverable is a decision. The model, measures, and visuals exist to make that decision defensible."
            action={{ href: "/services", label: "Services & process" }}
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {SERVICES.map((service) => {
              const Icon = ICONS[service.icon];
              return (
                <Link
                  key={service.slug}
                  href="/services"
                  className="group flex flex-col rounded-3xl border border-border bg-background/70 p-6 transition-colors hover:border-border-strong"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-medium">{service.name}</h3>
                  <p className="mt-1 text-sm font-medium text-foreground/70">{service.tagline}</p>
                  <p className="mt-3 flex-1 text-xs leading-6 text-muted-foreground">
                    {service.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs text-foreground">
                    Details
                    <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Data Lab */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card/50 p-6 sm:p-8 md:p-10">
            <div
              aria-hidden="true"
              className="grid-noise absolute inset-0 opacity-50"
            />
            <div className="relative">
              <SectionHeading
                eyebrow="03 — Data Lab"
                title="Practise the reasoning, not just the syntax."
                description="Sixty questions across SQL, Power BI, Excel, Pandas, statistics, and fundamentals. Practice mode explains every answer; mock mode runs the clock."
                action={{ href: "/lab", label: "Browse all exams" }}
              />

              <div className="mt-8 grid gap-3 md:grid-cols-3">
                {labExams.map((exam) => (
                  <Link
                    key={exam.slug}
                    href={`/lab/${exam.slug}`}
                    className="group rounded-2xl border border-border bg-background/80 p-4 transition-colors hover:border-border-strong"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
                          TOPIC_META[exam.topic]?.ring ?? "bg-card",
                        )}
                      >
                        {exam.topic}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {exam.questionCount} Q
                      </span>
                    </div>
                    <h3 className="mt-3 text-sm font-medium">{exam.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {exam.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs text-foreground">
                      Start
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* About strip */}
      <section className="border-t border-border bg-card/30 py-16 md:py-20">
        <Container className="grid items-center gap-8 md:grid-cols-[0.8fr_1.2fr]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-sky-100 via-background to-violet-100 dark:from-sky-950/50 dark:via-background dark:to-violet-950/40">
            <div className="grid-noise absolute inset-0 opacity-60" aria-hidden="true" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <span className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/40 bg-background/70 font-mono text-2xl font-medium tracking-tight shadow-sm backdrop-blur">
                AA
              </span>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/60">
                Analyst · Builder · Teacher
              </p>
            </div>
            <span className="absolute bottom-3 left-3 rounded-full bg-background/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground backdrop-blur">
              Portrait coming soon
            </span>
          </div>

          <div>
            <Eyebrow>04 — About</Eyebrow>
            <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
              An engineer&apos;s habit of asking &ldquo;how do we know?&rdquo;
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
              I started in electronics, where a sensor reading is only useful if
              you can defend how it was captured. That instinct carried into
              analytics: define the grain, validate at the boundary, document the
              assumption, then build the chart.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
              Today I build BI products end to end — from synthetic data
              generation and dimensional modelling to DAX, visual design, and the
              handover document nobody reads until something breaks.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <ButtonLink href="/about" variant="secondary" size="sm">
                More about me
              </ButtonLink>
              <ButtonLink href="/experience" variant="ghost" size="sm" icon>
                Experience & skills
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-border p-8 text-center md:p-14">
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 20%, var(--background) 10%, transparent 62%), radial-gradient(ellipse at 78% 118%, #f6d9bf 0%, transparent 52%), radial-gradient(ellipse at 12% 108%, #b8dbea 0%, transparent 56%), radial-gradient(ellipse at 100% 30%, #e0e9f3 0%, transparent 50%)",
              }}
            />
            <div className="grid-noise absolute inset-0 opacity-40" aria-hidden="true" />
            <div className="relative">
              <Eyebrow>Next step</Eyebrow>
              <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-medium tracking-tight md:text-4xl">
                Have a decision that needs evidence?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                Tell me the question, the data you have, and the decision it
                feeds. I&apos;ll tell you honestly whether a dashboard is the
                right answer.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <ButtonLink href="/contact" size="lg" icon>
                  Start a conversation
                </ButtonLink>
                <ButtonLink
                  href={`mailto:${SITE.email}`}
                  size="lg"
                  variant="secondary"
                  external={false}
                >
                  {SITE.email}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
