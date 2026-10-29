import type { Metadata } from "next";
import Link from "next/link";
import { FORMULAS, MYTHS, SECTIONS } from "@/lib/statistics/content";
import { MathBlock } from "@/components/statistics/math";
import { PrintButton } from "@/components/statistics/print-button";
import { StatisticsPageHeader } from "@/components/statistics/page-header";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "One-page statistics field guide",
  description:
    "A printable visual field guide: centres and spread, discrete and continuous distributions, standard error, intervals, p-values, decisions, correlation and the traps that travel with each.",
  alternates: { canonical: "/learn/statistics/cheatsheet" },
};

const CORE = ["mean", "sample-variance", "binomial-pmf", "normal-pdf", "z-score", "poisson-pmf", "se-mean", "ci", "test-statistic", "p-value", "decision", "regression"];

const DISTRIBUTIONS = [
  { name: "Binomial", support: "0…n successes", parameters: "n fixed, p constant, independent binary trials", mean: "np", variance: "np(1−p)" },
  { name: "Poisson", support: "0, 1, 2, … events", parameters: "λ per fixed interval, independent events", mean: "λ", variance: "λ" },
  { name: "Normal", support: "all real x", parameters: "μ, σ > 0, continuous symmetric", mean: "μ", variance: "σ²" },
];

const RULES = [
  { question: "Typical value", tool: "Mean (symmetric) or median (skewed / outliers)" },
  { question: "Spread", tool: "SD with the mean; IQR with the median" },
  { question: "Successes in n trials", tool: "Binomial" },
  { question: "Events in an interval", tool: "Poisson" },
  { question: "Bell curve / z", tool: "Normal" },
  { question: "Distribution of sample means", tool: "Sampling distribution / CLT" },
  { question: "How much a statistic varies", tool: "Standard error" },
  { question: "Range for a parameter", tool: "Confidence interval" },
  { question: "Evidence against H₀", tool: "Hypothesis test + p-value" },
  { question: "Linear association", tool: "Pearson r + scatterplot" },
  { question: "Causal effect", tool: "Randomized experiment; otherwise explicitly limited" },
];

export default function CheatSheetPage() {
  return (
    <>
      <div className="no-print">
        <StatisticsPageHeader
          eyebrow="Field guide"
          current="cheatsheet"
          title="One page, for the desk"
          description="A compact reference that keeps the condition next to the formula. Print it, or read it on screen; every row links back to the full explanation."
          actions={<PrintButton />}
        />
      </div>

      <Container className="py-8 md:py-10 print:py-0">
        <article className="print-sheet mx-auto max-w-4xl rounded-3xl border border-border bg-background p-5 md:p-8 print:max-w-none print:rounded-none print:border-0 print:p-0">
          <header className="border-b border-border pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Hansa · Comprehensive Statistics Reference</p>
            {/* The page header above already owns the page's single h1. This is a
                repeated title on the printed sheet, so it is an h2 that keeps the
                same visual weight instead of a second h1. */}
            <h2 className="mt-1 text-2xl font-medium tracking-tight">Statistical reasoning — field guide</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              One dataset → question → design → method → evidence → uncertainty → decision. A formula without its
              conditions is not an analysis.
            </p>
          </header>

          <section className="mt-5 print:break-inside-avoid">
            <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">1 · Describe first</h2>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-3 text-xs leading-6">
                <p><strong className="font-medium text-foreground">Centre:</strong> mean uses every value; median resists tails; mode is the most frequent.</p>
                <p className="mt-1"><strong className="font-medium text-foreground">Spread:</strong> SD is in the data units; variance is squared; IQR is the middle 50%.</p>
              </div>
              <div className="rounded-xl border border-border p-3 text-xs leading-6">
                <p><strong className="font-medium text-foreground">Outliers:</strong> flag with 1.5×IQR fences; a flag is not proof of error.</p>
                <p className="mt-1"><strong className="font-medium text-foreground">Sample vs population:</strong> s² divides by n−1; σ² divides by N.</p>
              </div>
            </div>
          </section>

          <section className="mt-5 print:break-inside-avoid">
            <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">2 · Distributions</h2>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="px-2 py-1.5 text-start font-medium">Family</th>
                    <th scope="col" className="px-2 py-1.5 text-start font-medium">Support</th>
                    <th scope="col" className="px-2 py-1.5 text-start font-medium">Assumptions</th>
                    <th scope="col" className="px-2 py-1.5 text-end font-medium">Mean</th>
                    <th scope="col" className="px-2 py-1.5 text-end font-medium">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {DISTRIBUTIONS.map((row) => (
                    <tr key={row.name} className="border-b border-border last:border-0">
                      <td className="px-2 py-1.5 font-medium text-foreground">{row.name}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{row.support}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{row.parameters}</td>
                      <td className="px-2 py-1.5 text-end font-mono">{row.mean}</td>
                      <td className="px-2 py-1.5 text-end font-mono">{row.variance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">Discrete: masses sum to 1. Continuous: area integrates to 1; P(X = x) = 0.</p>
          </section>

          <section className="mt-5 print:break-inside-avoid">
            <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">3 · Core formulas</h2>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {CORE.map((id) => {
                const formula = FORMULAS.find((item) => item.id === id);
                if (!formula) return null;
                return (
                  <div key={id} className="rounded-lg border border-border p-2 print:break-inside-avoid">
                    <p className="text-[10px] text-muted-foreground">{formula.title}</p>
                    <div className="mt-1 overflow-x-auto">
                      <MathBlock tex={formula.tex} />
                    </div>
                    <p className="mt-1 text-[9px] leading-4 text-muted-foreground">{formula.note}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-5 print:break-inside-avoid">
            <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">4 · Decision rules</h2>
            <div className="mt-2 grid gap-1 sm:grid-cols-2">
              {RULES.map((row) => (
                <div key={row.question} className="flex items-baseline justify-between gap-2 rounded-lg border border-border px-2 py-1 text-[10px]">
                  <span className="text-muted-foreground">{row.question}</span>
                  <span className="text-right text-foreground">{row.tool}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 rounded-lg border border-border bg-card/30 p-2 font-mono text-[11px] text-foreground">
              p ≤ α → reject H₀ · p &gt; α → fail to reject H₀ · never “accept H₀”
            </p>
          </section>

          <section className="mt-5 print:break-inside-avoid">
            <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">5 · Traps that travel with the formula</h2>
            <div className="mt-2 grid gap-1 sm:grid-cols-2">
              {MYTHS.slice(0, 10).map((myth) => (
                <div key={myth.id} className="rounded-lg border border-border p-2">
                  <p className="text-[10px] font-medium text-foreground">{myth.claim}</p>
                  <p className="mt-0.5 text-[9px] leading-4 text-muted-foreground">{myth.correction}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-5 border-t border-border pt-3 print:break-inside-avoid">
            <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">6 · Continue</h2>
            <div className="mt-2 grid gap-1 text-[11px] sm:grid-cols-2">
              {SECTIONS.filter((section) => [1, 4, 8, 11, 14, 19, 22, 30, 33, 40].includes(section.number)).map((section) => (
                <Link key={section.id} href={`/learn/statistics/journey/${section.journey}#${section.id}`} className="inline-flex min-h-6 items-center text-muted-foreground underline decoration-border-strong underline-offset-2 hover:text-foreground print:no-underline">
                  §{section.number} · {section.titleEn}
                </Link>
              ))}
            </div>
            <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
              Source: the owner&apos;s local Notion export (43 sections, one HTML file, no figures). This field guide is
              this site&apos;s teaching layer; formulas marked Extension are supplemental. The Poisson λ=20 tail is
              corrected to 15.68% in §10.
            </p>
          </section>
        </article>
      </Container>
    </>
  );
}
