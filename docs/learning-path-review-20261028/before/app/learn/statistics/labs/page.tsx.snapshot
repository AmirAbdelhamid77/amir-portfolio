import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FlaskConical, ShieldCheck, Sparkles } from "lucide-react";
import { JOURNEY_BY_SLUG, LABS, labHref } from "@/lib/statistics/content";
import { StatisticsPageHeader } from "@/components/statistics/page-header";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Interactive statistics labs",
  description:
    "Fifteen interactive labs: mean–median–outlier, binomial, normal, Poisson, sampling and CLT, confidence intervals, p-values, correlation, power, A/B decisions, probability and experimental design.",
  alternates: { canonical: "/learn/statistics/labs" },
  openGraph: {
    title: "Interactive statistics labs",
    description: "Manipulate the mathematics: distributions, sampling, intervals, p-values, correlation and A/B decisions.",
    url: "/learn/statistics/labs",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Interactive statistics labs" }],
  },
};

const TIERS = [
  { id: "P0", title: "Tier P0 — essential", description: "The eight labs that carry the core visual reasoning of the reference." },
  { id: "P1", title: "Tier P1 — applied", description: "Power, two-proportion decisions, probability spaces and experimental assignment." },
  { id: "SIGNATURE", title: "Signature machines", description: "Longer guided experiences that trace one idea end to end." },
] as const;

export default function LabsPage() {
  return (
    <>
      <StatisticsPageHeader
        eyebrow="Labs"
        current="labs"
        title="Manipulate the mathematics"
        description="Every lab is a client component with a pure computational core. Inputs update the chart, the numeric readout, the substitution line and the plain-language interpretation from the same state. Each has a reset, presets and a table of exact values."
        actions={
          <>
            <ButtonLink href="/learn/statistics/labs/dot-to-decision" variant="contrast" icon>
              Start with the flagship
            </ButtonLink>
            <ButtonLink href="/learn/statistics/decision" variant="secondary">
              I need help choosing
            </ButtonLink>
          </>
        }
        aside={
          <div className="w-full rounded-2xl border border-border bg-card/40 p-4 md:w-64">
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Honesty rules
            </p>
            <ul className="mt-2 space-y-1.5 text-[10px] leading-5 text-muted-foreground">
              <li>Seeded demos, labelled synthetic</li>
              <li>No live data or external calls</li>
              <li>Coverage never forced to 95%</li>
              <li>p-value and α drawn separately</li>
              <li>Every number tested in CI</li>
            </ul>
          </div>
        }
      />

      <section className="py-10 md:py-14">
        <Container>
          <div className="rounded-2xl border border-border bg-card/30 p-4 text-xs leading-6 text-muted-foreground">
            <strong className="font-medium text-foreground">Computational provenance.</strong> The probability, interval,
            test and correlation functions live in <code className="font-mono">lib/statistics/math.ts</code>. Tests in{" "}
            <code className="font-mono">tests/statistics/math.test.mjs</code> verify the Poisson λ=20 values, PMF
            normalisation, normal area, t critical values, interval arithmetic, two-proportion tests, power, seeded
            sampling and coverage. Charts draw those results; they do not compute their own truth.
          </div>

          {TIERS.map((tier) => {
            const labs = LABS.filter((lab) => lab.tier === tier.id);
            if (!labs.length) return null;
            return (
              <div key={tier.id} className="mt-10">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <Eyebrow>{tier.title}</Eyebrow>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{tier.description}</p>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">{labs.length} labs</span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {labs.map((lab) => (
                    <Link
                      key={lab.slug}
                      href={labHref(lab.slug)}
                      className="group flex flex-col rounded-2xl border border-border bg-background/70 p-4 transition-colors hover:border-border-strong hover:bg-card/60"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          {lab.tier}
                        </span>
                        <FlaskConical className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      </div>
                      <h2 className="mt-2 text-sm font-medium text-foreground group-hover:underline group-hover:decoration-border-strong group-hover:underline-offset-4">
                        {lab.title}
                      </h2>
                      <p className="mt-1 flex-1 text-[11px] leading-5 text-muted-foreground">{lab.question}</p>
                      <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[10px] text-muted-foreground">
                        <span>{JOURNEY_BY_SLUG.get(lab.journey)?.title ?? lab.journey}</span>
                        <span className="font-mono">{lab.duration}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="mt-10 rounded-3xl border border-border bg-card/30 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Looking for reference, not a lab?
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  The formula workbench, glossary, tool navigator and printable field guide cover the reference needs.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/learn/statistics/formulas" className="rounded-full border border-border px-3 py-1.5 text-[11px] text-foreground hover:border-border-strong">
                  Formulas
                </Link>
                <Link href="/learn/statistics/glossary" className="rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground">
                  Glossary
                </Link>
                <Link href="/learn/statistics/cheatsheet" className="rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground">
                  Field guide <ArrowRight className="inline h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
          <p className="mt-4 text-[10px] leading-5 text-muted-foreground">
            {SITE.name} · Labs are free and run entirely in your browser. No account, database or remote model is
            required.
          </p>
        </Container>
      </section>
    </>
  );
}
