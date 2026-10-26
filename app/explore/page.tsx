import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Compass,
  Gauge,
  ShieldCheck,
  Sigma,
  Sparkles,
} from "lucide-react";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Explore the labs",
  description:
    "Interactive data-visualization labs: six chart types, a deterministic chart decision assistant, an integrity lab, dashboard anatomy, and specialty charts.",
  alternates: { canonical: "/explore" },
};

const LABS = [
  {
    href: "/explore/charts",
    icon: BarChart3,
    title: "Six chart labs",
    body: "Histogram, box, scatter, line, bar, and dot. Change the decision that matters for each one and watch the story move.",
    tag: "Charts",
  },
  {
    href: "/explore/choose",
    icon: Compass,
    title: "Chart decision assistant",
    body: "Two questions about the task and the data shape produce a primary chart, defensible alternatives, and the options that fail.",
    tag: "Decision",
  },
  {
    href: "/explore/integrity",
    icon: ShieldCheck,
    title: "Integrity lab",
    body: "Seven side-by-side demonstrations on identical data: honest on one side, misleading on the other.",
    tag: "Integrity",
  },
  {
    href: "/explore/dashboards",
    icon: Gauge,
    title: "Dashboard anatomy",
    body: "An executive view and an analyst view of the same synthetic business, annotated by scan path: context, KPI, explanation, detail, action.",
    tag: "Composition",
  },
  {
    href: "/explore/specialty",
    icon: Sparkles,
    title: "Specialty charts",
    body: "Two BeUI components, a funnel and a treemap, audited against the lesson they support — with data tables and keyboard support.",
    tag: "BeUI",
  },
  {
    href: "/practice",
    icon: Sigma,
    title: "Practice bank",
    body: "Scenario questions with model answers that reward trade-offs, not definitions.",
    tag: "Practice",
  },
];

export default function ExplorePage() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-10 pt-20 md:pb-12 md:pt-24">
          <Eyebrow dot>Data Visualization · labs</Eyebrow>
          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-medium tracking-tight md:text-5xl">
            Change one decision. Watch the chart change its mind.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            Every lab uses one disclosed synthetic dataset, a real data table, and a
            control that isolates a single design choice. No lab needs a server, an
            account, or a network request.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link
              href="/explore/choose"
              className="press inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
            >
              I need to choose a chart
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/learn"
              className="press inline-flex h-10 items-center gap-2 rounded-full border border-border-strong bg-background px-5 text-sm hover:bg-card"
            >
              Back to the learning path
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-3 md:grid-cols-2">
            {LABS.map((lab) => (
              <Link
                key={lab.href}
                href={lab.href}
                className="group flex flex-col rounded-3xl border border-border bg-card/40 p-5 transition-colors hover:border-border-strong hover:bg-card/70 sm:p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <lab.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {lab.tag}
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-medium tracking-tight">{lab.title}</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{lab.body}</p>
                <span className="mt-auto flex items-center gap-1.5 pt-5 text-xs font-medium text-foreground">
                  Open
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-8 rounded-2xl border border-border bg-card/30 p-4 text-xs leading-6 text-muted-foreground">
            The labs are teaching instruments, not chart-component demos. Each one keeps
            data processing, arithmetic, and rendering separate, and every derived number
            is printed in a table so it can be checked by hand.
          </p>
        </Container>
      </section>
    </>
  );
}
