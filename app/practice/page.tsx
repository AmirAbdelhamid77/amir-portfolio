import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FlaskConical } from "lucide-react";
import { PracticeBank } from "@/components/data-viz/practice-bank";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Practice — select the chart, defend the trade-off",
  description:
    "Twelve scenario questions on chart selection, distributions, colour, accessibility, integrity, Power BI modelling, and interview reasoning — each with a model answer.",
  alternates: { canonical: "/practice" },
};

export default function PracticePage() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/learn" className="hover:text-foreground">
              Data Visualization
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/70">Practice</span>
          </nav>
          <Eyebrow className="mt-6">Practice · twelve scenarios</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-tight md:text-4xl">
            The chart is easy. The defence is the skill.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            Each question is a small decision with a defensible answer and three
            plausible ones. Pick, check, then read why the alternatives answer a
            different question. Nothing is scored against a clock.
          </p>
        </Container>
      </section>

      <section className="py-8 md:py-12">
        <Container>
          <PracticeBank />
        </Container>
      </section>

      <section className="border-t border-border py-10 md:py-14">
        <Container>
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/learn/chapter/10"
              className="group flex flex-col rounded-3xl border border-border bg-card/40 p-5 transition-colors hover:border-border-strong"
            >
              <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <h2 className="mt-3 text-sm font-medium">Interview question bank</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                The chapter behind these scenarios, including the questions that test
                whether you can explain a trade-off out loud.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-foreground">
                Open chapter 10
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
            <Link
              href="/explore/integrity"
              className="group flex flex-col rounded-3xl border border-border bg-card/40 p-5 transition-colors hover:border-border-strong"
            >
              <FlaskConical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <h2 className="mt-3 text-sm font-medium">Integrity lab</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                See the failure modes from these questions side by side on identical
                data: truncated axes, pooled rates, cherry-picked windows.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-foreground">
                Run the lab
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
