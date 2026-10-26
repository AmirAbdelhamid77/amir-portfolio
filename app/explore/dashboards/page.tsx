import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CompositionDemo } from "@/components/data-viz/composition-demo";
import { DashboardAnatomy } from "@/components/data-viz/dashboard-anatomy";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Dashboard anatomy — executive and analyst views",
  description:
    "One synthetic business, two dashboard views: an executive scan path and an analyst detail view, annotated as context, headline, evidence, exception, and action.",
  alternates: { canonical: "/explore/dashboards" },
};

export default function DashboardsPage() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/explore" className="hover:text-foreground">
              Labs
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/70">Dashboard anatomy</span>
          </nav>
          <Eyebrow className="mt-6">Chapter 08 · Dashboard design</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-tight md:text-4xl">
            Two audiences, one dataset, two different pages
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            The executive view answers “should I act?” in one scan. The analyst view
            answers “can I trust this?” in one scroll. Switching between them shows
            that density is an audience decision, not a taste decision.
          </p>
        </Container>
      </section>

      <section className="py-8 md:py-12">
        <Container>
          <DashboardAnatomy />
        </Container>
      </section>

      <section className="border-t border-border py-10 md:py-14">
        <Container className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Eyebrow>Live module</Eyebrow>
              <h2 className="mt-2 text-xl font-medium tracking-tight">
                Composition over time, normalized
              </h2>
            </div>
            <Link
              href="/learn/dashboard-design"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Chapter: dashboard design
              <ArrowRight className="ml-1 inline h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <CompositionDemo />
        </Container>
      </section>

      <section className="border-t border-border py-10 md:py-14">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <h2 className="text-sm font-medium">One message per chart</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                If a chart needs a paragraph to explain what to look at, it is two
                charts or a table. The title should carry the message.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <h2 className="text-sm font-medium">Exceptions earn space</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                A summary that hides the exception is a filter, not a dashboard. Put the
                one thing that would change the decision beside the headline.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <h2 className="text-sm font-medium">Detail on demand</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                The analyst view is not a longer executive view. It is the evidence
                layer: definitions, grain, and the table behind every mark.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/learn/dashboard-design"
              className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-background px-4 py-2 text-xs hover:bg-card"
            >
              Read the dashboard chapter
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
            <Link
              href="/explore/specialty"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:border-border-strong hover:text-foreground"
            >
              Specialty chart audit
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
