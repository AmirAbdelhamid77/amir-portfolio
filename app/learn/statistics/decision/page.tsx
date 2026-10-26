import type { Metadata } from "next";
import Link from "next/link";
import { DECISION_RESULTS, SECTIONS } from "@/lib/statistics/content";
import { ToolNavigator } from "@/components/statistics/tool-navigator";
import { StatisticsPageHeader } from "@/components/statistics/page-header";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Which statistical tool?",
  description:
    "A guided statistical tool navigator: start from the question, then see the recommended method, its assumptions, the anti-patterns and the source section. Not an automatic validity guarantee.",
  alternates: { canonical: "/learn/statistics/decision" },
};

export default function DecisionPage() {
  return (
    <>
      <StatisticsPageHeader
        eyebrow="Tool finder"
        current="decision"
        title="Start from the question, not the test name"
        description="The same data can support different analyses depending on the design and the evidential target. This navigator asks what you are trying to do, then names a defensible starting point and the assumptions that must hold."
        actions={
          <>
            <ButtonLink href="/learn/statistics/labs" variant="contrast" icon>
              Try the recommended lab
            </ButtonLink>
            <ButtonLink href="/learn/statistics/cheatsheet" variant="secondary">
              Field guide
            </ButtonLink>
          </>
        }
      />

      <Container className="py-8 md:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <ToolNavigator />
          </div>
          <aside className="space-y-3">
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.05] p-4">
              <p className="text-[10px] uppercase tracking-[0.12em] text-amber-800 dark:text-amber-300">A warning about any navigator</p>
              <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                A decision tree cannot see your data collection process. It can route you to a starting method, but it
                cannot certify independence, rule out confounding or replace a statistician for a high-stakes design.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Direct index</p>
              <ul className="mt-2 space-y-1">
                {DECISION_RESULTS.map((result) => {
                  const section = SECTIONS.find((item) => item.number === result.section);
                  return (
                    <li key={result.id}>
                      <Link
                        href={`/learn/statistics/journey/${section?.journey ?? "synthesis"}#s${result.section}`}
                        className="flex items-baseline justify-between gap-2 rounded px-1 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        <span>{result.tool}</span>
                        <span className="font-mono text-[9px]">§{result.section}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>

        <section className="mt-10">
          <Eyebrow>Anti-patterns</Eyebrow>
          <h2 className="mt-2 text-2xl font-medium tracking-tight">The shortcut that most often fails</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Significance = importance", body: "A tiny effect can be significant with a large n. Compare the interval with a pre-specified meaningful threshold." },
              { title: "r = causation", body: "Observational co-movement can be produced by a third variable. Design, not sample size, licenses a causal claim." },
              { title: "p = P(H₀ true)", body: "The p-value is conditional on H₀. It is not a posterior probability, and it is not an overlap of two curves." },
              { title: "SE = SD", body: "SD describes individual values; SE describes a statistic across repeated samples. They answer different questions." },
              { title: "Non-significant = no effect", body: "Failure to reject is not proof of no effect. Report the interval and consider power." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-background p-3">
                <p className="text-xs font-medium text-foreground">{item.title}</p>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}
