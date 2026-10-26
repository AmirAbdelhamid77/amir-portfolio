import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IntegrityLab } from "@/components/data-viz/integrity-lab";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Integrity lab — same data, honest and misleading",
  description:
    "Seven side-by-side demonstrations on identical synthetic data: truncated axes, dual axes, pooled rates, same-mean distributions, cherry-picked windows, pie charts, and bubble area.",
  alternates: { canonical: "/explore/integrity" },
};

export default function IntegrityPage() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/explore" className="hover:text-foreground">
              Labs
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/70">Integrity</span>
          </nav>
          <Eyebrow className="mt-6">Chapter 07 · Visual integrity</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-tight md:text-4xl">
            Nothing here is a lie. That is the problem.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            Every pair below uses one dataset. The numbers do not change between the
            left and right panels — only the encoding does. Read the honest version
            first, then the misleading one, then ask which choice you would have made
            under deadline pressure.
          </p>
          <p className="mt-4 max-w-2xl text-xs leading-6 text-muted-foreground">
            All data is synthetic and generated locally with a fixed seed. This is a
            teaching instrument, not an accusation: every misleading panel here is a
            real technique used in real dashboards.
          </p>
        </Container>
      </section>

      <section className="py-8 md:py-12">
        <Container>
          <IntegrityLab />
        </Container>
      </section>

      <section className="border-t border-border py-10 md:py-14">
        <Container>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card/40 p-5">
              <h2 className="text-sm font-medium">The four questions</h2>
              <ol className="mt-3 space-y-2 text-xs leading-6 text-muted-foreground">
                <li>
                  <span className="font-mono text-foreground">01</span> What comparison is
                  the chart asking me to make — and does the geometry support it?
                </li>
                <li>
                  <span className="font-mono text-foreground">02</span> What is the
                  denominator, the window, and the population behind each number?
                </li>
                <li>
                  <span className="font-mono text-foreground">03</span> Would a different
                  but equally defensible choice reverse the impression?
                </li>
                <li>
                  <span className="font-mono text-foreground">04</span> Can I rebuild this
                  chart from the table beside it?
                </li>
              </ol>
            </div>
            <div className="rounded-3xl border border-border bg-card/40 p-5">
              <h2 className="text-sm font-medium">Where to go next</h2>
              <div className="mt-3 grid gap-2 text-xs">
                <Link
                  href="/learn/visual-integrity"
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 hover:border-border-strong"
                >
                  Chapter 07 — Visual integrity
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <Link
                  href="/learn/statistical-traps"
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 hover:border-border-strong"
                >
                  Statistical traps
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <Link
                  href="/explore/choose"
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 hover:border-border-strong"
                >
                  Chart decision assistant
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
