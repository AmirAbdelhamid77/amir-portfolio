import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CHART_LABS } from "@/lib/data-viz/labs";
import { DATASETS } from "@/lib/data-viz/datasets";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Six chart labs",
  description:
    "Interactive histogram, box plot, scatter plot, line chart, bar chart, and dot plot labs — each isolating the design decision that changes the conclusion.",
  alternates: { canonical: "/explore/charts" },
};

export default function ChartLabsPage() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-10 pt-20 md:pb-12 md:pt-24">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/explore" className="hover:text-foreground">
              Labs
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/70">Chart labs</span>
          </nav>
          <Eyebrow className="mt-6">Chapter 03 · Core visual grammar</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-medium tracking-tight md:text-5xl">
            Six charts, six questions
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            A chart type is not a style. It is an answer to a specific analytical
            question. Each lab states the question first, then lets you break the chart
            on purpose.
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-3 md:grid-cols-2">
            {CHART_LABS.map((lab, index) => {
              const dataset = DATASETS[lab.dataset as keyof typeof DATASETS];
              return (
                <Link
                  key={lab.type}
                  href={`/explore/charts/${lab.type}`}
                  className="group flex flex-col rounded-3xl border border-border bg-card/40 p-5 transition-colors hover:border-border-strong hover:bg-card/70 sm:p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {dataset?.kind ?? lab.dataset}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-medium tracking-tight">{lab.title}</h2>
                  <p className="mt-1 text-xs font-medium text-foreground/70">{lab.question}</p>
                  <p className="mt-2.5 text-sm leading-7 text-muted-foreground">{lab.summary}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <span className="text-[11px] text-muted-foreground">
                      {dataset?.label ?? lab.dataset}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      Open lab
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background p-4">
              <h2 className="text-sm font-medium">Every chart has a table</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                The numbers behind the drawing are always available. A chart that cannot
                be checked against a table is not evidence.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <h2 className="text-sm font-medium">No animation dependency</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                Core labs render a meaningful static first frame. Controls are native
                inputs and buttons, so they work with a keyboard and without motion.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <h2 className="text-sm font-medium">One disclosed dataset each</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                The data is generated locally with a fixed seed. It is not real customer,
                employee, patient, or employer data.
              </p>
            </div>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Not sure which chart applies?{" "}
            <Link
              href="/explore/choose"
              className="text-foreground underline decoration-border-strong underline-offset-4"
            >
              Start with the decision assistant
            </Link>{" "}
            or{" "}
            <Link
              href="/explore/integrity"
              className="text-foreground underline decoration-border-strong underline-offset-4"
            >
              run the integrity lab
            </Link>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
