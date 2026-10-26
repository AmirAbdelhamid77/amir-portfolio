import type { Metadata } from "next";
import { FORMULAS, JOURNEY_BY_SLUG, SECTIONS } from "@/lib/statistics/content";
import { FormulaCalculator } from "@/components/statistics/formula-calculator";
import { FormulaCard } from "@/components/statistics/math";
import { StatisticsPageHeader } from "@/components/statistics/page-header";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Formula workbench",
  description:
    "A source-linked formula index with plain-text alternatives, working numeric substitution, plots and condition drawers. Pearson r and the slope relation are labelled as extensions.",
  alternates: { canonical: "/learn/statistics/formulas" },
};

const GROUP_ORDER = ["Describing data", "Probability", "Distributions", "Sampling", "Estimation", "Inference", "Relationships"];

function journeyFor(sectionNumber: number) {
  const section = SECTIONS.find((item) => item.number === sectionNumber);
  const journey = section ? JOURNEY_BY_SLUG.get(section.journey) : undefined;
  return section && journey
    ? { href: `/learn/statistics/journey/${journey.slug}#s${section.number}`, label: `§${section.number} · ${section.titleEn}` }
    : null;
}

export default function FormulasPage() {
  return (
    <>
      <StatisticsPageHeader
        eyebrow="Formula workbench"
        current="formulas"
        title="A formula is not a method"
        description="Every formula here is tied to the section that explains it, the symbols it uses, and the conditions under which it is valid. The calculator substitutes your numbers; it does not certify the design."
        actions={
          <>
            <ButtonLink href="/learn/statistics/labs" variant="contrast" icon>
              See the formulas in a lab
            </ButtonLink>
            <ButtonLink href="/learn/statistics/cheatsheet" variant="secondary">
              Printable field guide
            </ButtonLink>
          </>
        }
      />

      <Container className="py-8 md:py-10">
        <section aria-labelledby="calculator-title">
          <Eyebrow>Working numeric substitution</Eyebrow>
          <h2 id="calculator-title" className="mt-2 text-2xl font-medium tracking-tight">
            Substitute, compute, then check the assumption
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-6 text-muted-foreground">
            The values update the formula line, the result and, where it helps, the plot. The result is only as
            meaningful as the design behind the inputs.
          </p>
          <div className="mt-4">
            <FormulaCalculator />
          </div>
        </section>

        <section className="mt-12" aria-labelledby="index-title">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <Eyebrow>The index</Eyebrow>
              <h2 id="index-title" className="mt-2 text-2xl font-medium tracking-tight">
                Every formula, with its conditions
              </h2>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">{FORMULAS.length} entries</p>
          </div>

          <div className="mt-5 space-y-8">
            {GROUP_ORDER.map((group) => {
              const formulas = FORMULAS.filter((formula) => formula.group === group);
              if (!formulas.length) return null;
              return (
                <div key={group}>
                  <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{group}</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {formulas.map((formula) => {
                      const source = journeyFor(formula.section);
                      return (
                        <FormulaCard
                          key={formula.id}
                          id={formula.id}
                          title={formula.title}
                          tex={formula.tex}
                          alt={formula.alt}
                          plain={formula.plain}
                          note={formula.note}
                          group={formula.group}
                          origin={formula.origin}
                          sourceHref={source?.href}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-border bg-card/30 p-4 text-xs leading-6 text-muted-foreground">
          <strong className="font-medium text-foreground">Source vs extension.</strong> Entries marked{" "}
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] text-emerald-800 dark:text-emerald-300">Source</span>{" "}
          exist in the exported reference. Entries marked{" "}
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] text-amber-800 dark:text-amber-300">Extension</span>{" "}
          are supplemental standard definitions, included because a visual explanation needs them; they are not
          presented as the owner&apos;s original text.
        </section>
      </Container>
    </>
  );
}
