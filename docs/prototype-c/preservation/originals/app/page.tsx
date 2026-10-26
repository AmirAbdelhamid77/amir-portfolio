import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  Compass,
  Database,
  GraduationCap,
  Sparkles,
  Target,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { SITE_METRICS } from "@/lib/site-metrics";
import { ButtonLink, Container, Eyebrow, SectionHeading, Stat } from "@/components/ui";

export const metadata: Metadata = {
  title: "Hansa — Learn connected ideas",
  description: "Source-backed data learning, documented concept connections and independent practice.",
  alternates: { canonical: "/" },
};

/**
 * Learning-first home: the owner removed prior experience and portfolio material.
 * Existing professional routes remain available outside this landing page.
 */
const DOORS = [
  {
    id: "atlas",
    href: "/learn/dp-600/atlas/",
    label: "Atlas",
    title: "Connect the concepts",
    body: "Follow the conditions and evidence that connect a reference, a replica and the query surface.",
    action: "Open the Knowledge Atlas",
    meta: "Fabric ingestion · documented relationships",
    icon: Compass,
  },
  {
    id: "learn",
    href: "/learn/catalogue",
    label: "Learn",
    title: "Learn the craft",
    body: "A ten-chapter visualization course, a 43-section statistics reference, and the labs that sit between reading and doing.",
    action: "Open the learning catalogue",
    meta: `${SITE_METRICS.dataViz.chapters} chapters · ${SITE_METRICS.statistics.sections} statistics sections`,
    icon: GraduationCap,
  },
  {
    id: "practice",
    href: "/practice/catalogue",
    label: "Practice",
    title: "Test the skill",
    body: "Question banks with answer keys and rationales, including the Fabric DP-600 hub and its coverage report.",
    action: "Open the practice catalogue",
    meta: `${SITE_METRICS.practice.generalQuestions + SITE_METRICS.practice.fabricQuestions + SITE_METRICS.dataViz.scenarios} questions · 3 banks`,
    icon: Target,
  },
] as const;

const LEARNING_ROUTES = [
  {
    kind: "Course",
    title: "Data Visualization",
    href: "/learn",
    body: "From the analytical question to the encoding, the scale, the dashboard and the sentence you say out loud in a review.",
    meta: `${SITE_METRICS.dataViz.chapters} chapters · ${SITE_METRICS.dataViz.sourcePages} source pages · ${SITE_METRICS.dataViz.arabicLessons} Arabic lessons`,
    action: "Start the course",
    icon: BookOpen,
  },
  {
    kind: "Reference",
    title: "Comprehensive Statistics",
    href: "/learn/statistics",
    body: "Sampling, intervals, p-values, correlation and the traps around them — with labs that recompute, not illustrate.",
    meta: `${SITE_METRICS.statistics.sections} sections · ${SITE_METRICS.statistics.journeys} journeys · ${SITE_METRICS.statistics.labs} labs`,
    action: "Open the reference",
    icon: BarChart3,
  },
  {
    kind: "Assessment",
    title: "Microsoft Fabric / DP-600",
    href: "/lab/dp-600",
    body: "Guided study, topic practice, cases and a timed simulation — plus an honest coverage report against the official objectives.",
    meta: `${SITE_METRICS.practice.fabricQuestions} questions · ${SITE_METRICS.practice.fabricPacks} source packs`,
    action: "Open the Fabric hub",
    icon: Boxes,
  },
] as const;

const QUICK_LINKS: {
  href: string;
  label: string;
  icon: typeof BarChart3;
  rtl?: boolean;
}[] = [
  { href: "/explore/charts", label: "Six chart labs", icon: BarChart3 },
  { href: "/explore/choose", label: "Chart decision assistant", icon: Compass },
  { href: "/explore/integrity", label: "Integrity lab", icon: Sparkles },
  { href: "/practice", label: "Visualization scenarios", icon: Target },
  { href: "/lab", label: "Analyst bank (60)", icon: Database },
  { href: "/learn/ar", label: "المسار العربي", icon: BookOpen, rtl: true },
];

export default function HomePage() {

  const jsonLd = {
    "@context": "https://schema.org", "@type": "WebSite", name: "Hansa Learning",
    url: SITE.url, description: "Source-backed learning, documented concept connections and independent data practice.",
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
            <span>Hansa · Learn connected ideas</span>
          </Eyebrow>

          <h1 className="mx-auto mt-6 max-w-4xl text-balance text-[2.6rem] font-medium leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Data that makes
            <br />
            decisions{" "}
            <mark className="mark mark-hero">visible.</mark>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            Learn the concepts behind data decisions. Read a worked lesson,
            follow a documented connection, and test the reasoning in a practical scenario.
          </p>

          {/* Two primary tasks and one quieter third, per the task-led home spec. */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/learn/dp-600/atlas/" size="lg" icon>
              Explore the Knowledge Atlas
            </ButtonLink>
            <ButtonLink href="/learn/catalogue" size="lg" variant="secondary">
              Start learning
            </ButtonLink>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Here to test yourself instead?{" "}
            <Link
              href="/practice/catalogue"
              className="font-medium text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground"
            >
              Practice questions
            </Link>
          </p>

          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Power BI · DAX · SQL · Python · Excel
          </p>

        </Container>
      </section>

      {/* Three doors */}
      <section className="py-14 md:py-16">
        <Container>
          <h2 className="text-sm font-medium text-muted-foreground">
            Three ways to use this site
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {DOORS.map((door) => (
              <Link
                key={door.id}
                href={door.href}
                className="group flex flex-col rounded-3xl border border-border bg-card/50 p-6 transition-colors hover:border-border-strong hover:bg-card/80"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <door.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {door.label}
                  </span>
                </span>
                <h3 className="mt-4 text-lg font-medium tracking-tight">{door.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{door.body}</p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {door.meta}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {door.action}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Learning routes, labelled by what they are */}
      <section className="border-y border-border bg-card/30 py-14 md:py-16">
        <Container>
          <SectionHeading
            eyebrow="02 — Learn & practise"
            title="A course, a reference, and an assessment bank."
            description="Each one is labelled, because reading a chapter and sitting a timed simulation are not the same activity. Everything is free, needs no account, and keeps its progress in this browser."
            action={{ href: "/learn/catalogue", label: "See everything to learn" }}
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {LEARNING_ROUTES.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="group flex flex-col rounded-3xl border border-border bg-background/70 p-5 transition-colors hover:border-border-strong"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {route.kind}
                  </span>
                  <route.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-medium">{route.title}</h3>
                <p className="mt-2 flex-1 text-xs leading-6 text-muted-foreground">{route.body}</p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {route.meta}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                  {route.action}
                  <ArrowRight
                    className="h-3 w-3 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </div>

          <ul className="mt-5 flex flex-wrap gap-2">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  dir={link.rtl ? "rtl" : undefined}
                  lang={link.rtl ? "ar" : undefined}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                >
                  <link.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-20">
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
                Choose a concept. Follow its evidence.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                Start with the ingestion journey: learn, explore, practise and reflect.
                Your existing lesson and question-bank progress stays in this browser.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <ButtonLink href="/learn/dp-600/atlas/journey/" size="lg" icon>
                  Start the guided journey
                </ButtonLink>
                <ButtonLink href="/learn/dp-600/" size="lg" variant="secondary">
                  Open the DP-600 Academy
                </ButtonLink>
              </div>
              <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-3 text-left">
                <Stat value={String(SITE_METRICS.practice.generalQuestions)} label="Analyst questions" />
                <Stat value={String(SITE_METRICS.practice.fabricQuestions)} label="Fabric questions" />
                <Stat value={String(SITE_METRICS.dataViz.scenarios)} label="Scenarios" />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
