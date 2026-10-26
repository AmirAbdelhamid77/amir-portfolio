import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ChooseAssistant } from "@/components/data-viz/choose-assistant";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Chart decision assistant",
  description:
    "A deterministic, local chart-selection workspace: describe the decision in your own words, answer one clarifying question if needed, and get a primary chart, defensible alternatives, the encodings that fail, and the assumptions you can correct.",
  alternates: { canonical: "/explore/choose" },
};

export default function ChoosePage() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/explore" className="hover:text-foreground">
              Labs
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/70">Chart decision assistant</span>
          </nav>
          <Eyebrow className="mt-6">Chapter 08 · Chart selection</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-tight md:text-4xl">
            Choose the chart after the question
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            The chart is the last decision, not the first. This workspace has an
            assistant-shaped surface — a prompt, a visible reasoning trace, a streamed
            answer — wrapped around a rule table that runs in your browser. No model, no
            API key, no network request: type the decision, and it applies the same
            unit-tested rules as the six chart labs.
          </p>
        </Container>
      </section>

      <section className="py-8 md:py-12">
        <Container>
          <ChooseAssistant />

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <h2 className="text-sm font-medium">It asks instead of guessing</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                A prompt with no task, or a task with no data shape, gets one
                clarifying question. Answering it adds an explicit assumption rather
                than silently rewriting what you typed.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <h2 className="text-sm font-medium">Assumptions stay correctable</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                Task, shape, category count and exact-value needs are shown above the
                recommendation. Change one and the same rule table re-runs — you can
                watch the advice cross the pie limit at six slices.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <h2 className="text-sm font-medium">Hazards are part of the answer</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                Every recommendation carries the encoding it replaces. A chart choice
                is only defensible if you can say what it would mislead the reader
                about — and the approval block asks you to say it.
              </p>
            </div>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Check the recommendation against{" "}
            <Link
              href="/explore/integrity"
              className="text-foreground underline decoration-border-strong underline-offset-4"
            >
              the integrity lab
            </Link>{" "}
            or read{" "}
            <Link
              href="/learn/chart-selection"
              className="text-foreground underline decoration-border-strong underline-offset-4"
            >
              the selection chapter
            </Link>
            .
          </p>
        </Container>
      </section>

      <section className="border-t border-border py-10 md:py-14">
        <Container>
          <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card/40 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-medium tracking-tight">Two charts are usually enough</h2>
              <p className="mt-1 max-w-xl text-xs leading-6 text-muted-foreground">
                If the recommendation and one alternative both work, choose the one the
                audience already reads fluently — then spend the remaining effort on the
                title, the scale, and the caveat.
              </p>
            </div>
            <Link
              href="/explore/charts"
              className="press inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border-strong px-4 text-xs hover:bg-background"
            >
              Browse the labs
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
