import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, TriangleAlert } from "lucide-react";
import { CHART_LABS, type ChartLabMeta } from "@/lib/data-viz/labs";
import { SyntheticNote } from "@/components/data-viz/lab-ui";
import { Container, Eyebrow } from "@/components/ui";

export function ChartLabShell({ lab, children }: { lab: ChartLabMeta; children: ReactNode }) {
  const index = CHART_LABS.findIndex((item) => item.type === lab.type);
  const previous = index > 0 ? CHART_LABS[index - 1] : null;
  const next = index >= 0 && index < CHART_LABS.length - 1 ? CHART_LABS[index + 1] : null;

  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/learn" className="hover:text-foreground">
              Data Visualization
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/explore/charts" className="hover:text-foreground">
              Chart labs
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/70">{lab.title}</span>
          </nav>

          <div className="mt-6">
            <Eyebrow>Chart lab · Chapter {lab.chapter}</Eyebrow>
          </div>
          <h1 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">{lab.title}</h1>
          <p className="mt-2 text-base font-medium text-foreground/80">{lab.question}</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            {lab.summary}
          </p>
          <div className="mt-4 max-w-2xl">
            <SyntheticNote />
          </div>
        </Container>
      </section>

      <section className="py-8 md:py-10">
        <Container>{children}</Container>
      </section>

      <section className="border-t border-border py-10 md:py-14">
        <Container>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card/40 p-5">
              <h2 className="text-sm font-medium">What this lab is teaching</h2>
              <ul className="mt-3 space-y-2 text-xs leading-6 text-muted-foreground">
                {lab.teaches.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card/40 p-5">
              <h2 className="text-sm font-medium">Where it goes wrong</h2>
              <ul className="mt-3 space-y-2 text-xs leading-6 text-muted-foreground">
                {lab.mistakes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <TriangleAlert className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/learn/chapter/${lab.chapter}`}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline hover:decoration-border-strong hover:underline-offset-4"
              >
                Read the chapter
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <nav aria-label="Chart labs" className="mt-6 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
            {previous ? (
              <Link
                href={`/explore/charts/${previous.type}`}
                className="group flex flex-col rounded-2xl border border-border p-4 hover:border-border-strong"
              >
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                  Previous lab
                </span>
                <span className="mt-1 text-sm">{previous.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/explore/charts/${next.type}`}
                className="group flex flex-col rounded-2xl border border-border p-4 text-end hover:border-border-strong"
              >
                <span className="flex items-center justify-end gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Next lab
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
                <span className="mt-1 text-sm">{next.title}</span>
              </Link>
            ) : null}
          </nav>
        </Container>
      </section>
    </>
  );
}
