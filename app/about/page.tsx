import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Compass, FileCheck2, Layers, MessageSquare } from "lucide-react";
import { FACTS } from "@/lib/experience";
import { SITE } from "@/lib/site";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "Amir Abdelhamid is a data analyst with an electronics engineering background, building BI products and teaching the reasoning behind them.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    icon: Layers,
    title: "Model before the visual",
    body: "A chart is the last decision. Grain, keys, and definitions come first; otherwise the dashboard is just a confident guess.",
  },
  {
    icon: FileCheck2,
    title: "Write down the assumption",
    body: "Every rate has a numerator and a denominator. Every cleaning step has a reason. If it is not written, it will be forgotten.",
  },
  {
    icon: MessageSquare,
    title: "Make the limits visible",
    body: "Synthetic data, missing fields, and unverified claims belong on the page — not buried in a README nobody opens.",
  },
  {
    icon: Compass,
    title: "Design for the meeting",
    body: "A KPI earns its place if someone can act when it moves. Everything else is decoration with a legend.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative border-b border-border">
        <div aria-hidden="true" className="grid-noise mask-b-fade absolute inset-0 opacity-50" />
        <Container className="relative py-16 md:py-20">
          <Eyebrow>About</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight md:text-5xl">
            I build the boring parts first.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            The model, the definitions, the cleaning log. The part that decides
            whether the chart is true.
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-sky-100 via-background to-violet-100 dark:from-sky-950/50 dark:via-background dark:to-violet-950/40">
              <div className="grid-noise absolute inset-0 opacity-60" aria-hidden="true" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <span className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/50 bg-background/70 font-mono text-3xl font-medium tracking-tight shadow-sm backdrop-blur">
                  AA
                </span>
                <p className="max-w-[200px] text-center font-mono text-[10px] uppercase leading-5 tracking-[0.18em] text-foreground/60">
                  Portrait pending — the gradient is honest, the face would be better
                </p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border text-xs">
              {FACTS.map((fact) => (
                <div key={fact.label} className="bg-card/70 p-3">
                  <dt className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-foreground">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            <p>
              I studied electronics and communication engineering at Sohag
              University. The graduation project was an advanced driver-assistance
              prototype, where a sensor reading was never just a number: it had a
              timestamp, a noise profile, and a decision attached to it. That was
              my first lesson in data quality.
            </p>
            <p>
              After graduating, I moved deliberately into analytics. The IBM Data
              Analyst Professional Certificate gave me the structure — SQL,
              Python, Pandas, Excel, visualisation — and the capstone made me use
              it end to end. Then I built the{" "}
              <Link href="/work/hse-analytics" className="font-medium text-foreground underline decoration-border-strong underline-offset-4">
                HSE Analytics dashboard
              </Link>{" "}
              to prove I could design a model, not just query one.
            </p>
            <p>
              That project is synthetic by design. It represents two years of
              safety, environmental, and operational data across 24 anonymised
              sites, with 50+ tables and 229+ DAX measures. I wrote the data
              generator, the schema, the measure library, the report, and the
              documentation. The numbers are a test fixture; the method is the
              portfolio.
            </p>
            <p>
              I am now looking for a data analyst or BI role where the work
              matters beyond the dashboard — operations, safety, finance, or
              anywhere the definition of a metric is contested. I am available
              immediately, based in Egypt, and comfortable working remotely with
              teams in other time zones.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <ButtonLink href="/contact" size="sm" icon>
                Get in touch
              </ButtonLink>
              <ButtonLink href="/experience" size="sm" variant="secondary">
                Experience & skills
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-border bg-card/30 py-12 md:py-16">
        <Container>
          <Eyebrow>Principles</Eyebrow>
          <h2 className="mt-3 max-w-2xl text-2xl font-medium tracking-tight md:text-3xl">
            Four habits that show up in every project.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-background/70 p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-sm font-medium">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-6 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card/40 p-6 md:p-8">
            <Eyebrow>Currently</Eyebrow>
            <h2 className="mt-3 text-xl font-medium tracking-tight">What I am looking for</h2>
            <ul className="mt-4 grid gap-2.5 text-sm leading-6 text-muted-foreground">
              <li className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-hidden="true" />
                A junior or mid-level data analyst / BI role with real stakeholders.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-hidden="true" />
                A team that argues about definitions and documents decisions.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-hidden="true" />
                Remote or hybrid, with overlap in EMEA hours.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-hidden="true" />
                Occasional freelance dashboards or analysis projects.
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card/40 p-6 md:p-8">
            <Eyebrow>Toolkit</Eyebrow>
            <h2 className="mt-3 text-xl font-medium tracking-tight">What I work with</h2>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {[
                "Power BI",
                "DAX",
                "Power Query",
                "SQL",
                "Python",
                "Pandas",
                "NumPy",
                "Matplotlib",
                "Seaborn",
                "Excel",
                "Tableau",
                "Git",
                "Next.js",
              ].map((tool) => (
                <span
                  key={tool}
                  className="rounded-lg border border-border bg-background/60 px-2 py-1 font-mono text-[10px] text-muted-foreground"
                >
                  {tool}
                </span>
              ))}
            </div>
            <p className="mt-5 border-t border-border pt-4 text-xs leading-6 text-muted-foreground">
              I use AI tools to move faster on boilerplate, but every measure,
              cleaning decision, and claim on this site is one I can defend in a
              conversation.
            </p>
            <a
              href={SITE.socials.github}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-foreground"
            >
              GitHub
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
