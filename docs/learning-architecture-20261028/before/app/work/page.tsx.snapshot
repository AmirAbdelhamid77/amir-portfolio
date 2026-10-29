import type { Metadata } from "next";
import { CASE_STUDIES } from "@/lib/case-studies";
import { CaseStudyCard } from "@/components/case-study-card";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies in BI modelling, analysis, and data validation — including the HSE Analytics dashboard, IBM capstone, and an ADAS sensor prototype.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <section className="relative border-b border-border">
        <div aria-hidden="true" className="grid-noise mask-b-fade absolute inset-0 opacity-50" />
        <Container className="relative py-16 md:py-20">
          <Eyebrow>Work</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight md:text-5xl">
            Three projects, three kinds of evidence.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            A flagship BI build, an end-to-end analysis, and the engineering
            project where data quality stopped being theoretical. Every dataset
            is public or synthetic, and each case study states its limits.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Power BI", "SQL", "Python", "Excel", "Data modelling"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <h2 className="sr-only">All case studies</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {CASE_STUDIES.map((study, index) => (
              <CaseStudyCard
                key={study.slug}
                study={study}
                variant={index === 0 ? "feature" : "default"}
              />
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-border bg-card/40 p-6 sm:p-8">
            <h2 className="text-lg font-medium">What each case study includes</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "The decision",
                  body: "The question the work had to answer, and who was waiting on it.",
                },
                {
                  title: "The method",
                  body: "Model, measures, cleaning decisions, and the assumptions behind them.",
                },
                {
                  title: "The limits",
                  body: "What is synthetic, what is unverified, and what I would do next.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-border bg-background/60 p-4">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1.5 text-xs leading-6 text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
