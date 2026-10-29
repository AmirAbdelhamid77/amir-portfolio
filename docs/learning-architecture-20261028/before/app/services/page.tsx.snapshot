import type { Metadata } from "next";
import {
  ArrowRight,
  BarChart3,
  Check,
  Database,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import { PROCESS, SERVICES } from "@/lib/services";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Power BI dashboards, SQL and Python analysis, and data-analyst training — scoped around a decision, documented, and handed over.",
  alternates: { canonical: "/services" },
};

const ICONS = {
  chart: BarChart3,
  database: Database,
  graduation: GraduationCap,
} as const;

const FAQ = [
  {
    q: "Do you work with messy spreadsheets?",
    a: "Yes — that is usually the job. I profile the source first, agree definitions, and document every cleaning decision so the result can be reviewed.",
  },
  {
    q: "Can you fix an existing report instead of starting over?",
    a: "Often. I will audit the model and measures first. If the schema is sound, we keep it and rebuild the slow or misleading parts. If it is not, I will say so before quoting.",
  },
  {
    q: "What do you need from me to start?",
    a: "A sample of the data, the decision the report should support, and one person who can confirm definitions. Access to the eventual audience is a bonus.",
  },
  {
    q: "Do you offer ongoing support?",
    a: "Yes, on a small monthly retainer for measure changes, refresh issues, and new views. It is optional — the handover is designed to work without it.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="relative border-b border-border">
        <div aria-hidden="true" className="grid-noise mask-b-fade absolute inset-0 opacity-50" />
        <Container className="relative py-16 md:py-20">
          <Eyebrow>Services</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight md:text-5xl">
            Analytics that ends in a decision, not a folder of charts.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            I take on focused engagements: one dashboard, one analysis, or one
            person learning the craft. Small enough to stay honest, deep enough
            to be useful.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/contact" icon>
              Discuss a project
            </ButtonLink>
            <ButtonLink href="/work" variant="secondary">
              See the evidence
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container className="space-y-4">
          {SERVICES.map((service, index) => {
            const Icon = ICONS[service.icon];
            return (
              <article
                key={service.slug}
                id={service.slug}
                className="scroll-mt-24 grid gap-6 rounded-3xl border border-border bg-card/40 p-6 md:grid-cols-[1fr_1fr] md:p-8"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Service {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 className="mt-4 text-2xl font-medium tracking-tight">{service.name}</h2>
                  <p className="mt-1 text-sm font-medium text-foreground/70">{service.tagline}</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{service.description}</p>
                  <dl className="mt-5 grid gap-2 text-xs">
                    <div className="flex gap-2">
                      <dt className="w-20 shrink-0 text-muted-foreground">Best for</dt>
                      <dd className="text-foreground/80">{service.bestFor}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-20 shrink-0 text-muted-foreground">Timeline</dt>
                      <dd className="text-foreground/80">{service.turnaround}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl border border-border bg-background/60 p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    What you get
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {service.deliverables.map((item) => (
                      <li key={item} className="flex gap-2 text-xs leading-6 text-muted-foreground">
                        <Check className="mt-1 h-3 w-3 shrink-0 text-success" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <ButtonLink
                    href={`/contact?service=${service.slug}`}
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    icon
                  >
                    Start here
                  </ButtonLink>
                </div>
              </article>
            );
          })}
        </Container>
      </section>

      <section className="border-y border-border bg-card/30 py-12 md:py-16">
        <Container>
          <Eyebrow>Process</Eyebrow>
          <h2 className="mt-3 max-w-2xl text-2xl font-medium tracking-tight md:text-3xl">
            Four steps, no big reveal.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((step) => (
              <div key={step.step} className="relative rounded-2xl border border-border bg-background/70 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {step.step}
                </p>
                <h3 className="mt-2 text-sm font-medium">{step.title}</h3>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{step.body}</p>
                <ArrowRight
                  className="absolute right-4 top-4 h-3.5 w-3.5 text-border-strong"
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>Questions</Eyebrow>
            <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">
              The things worth asking before we start.
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              If your question is not here, ask it directly. A short call is
              usually faster than a scoping document.
            </p>
            <ButtonLink href="/contact" variant="secondary" size="sm" className="mt-5">
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              Ask a question
            </ButtonLink>
          </div>

          <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card/40">
            {FAQ.map((item) => (
              <details key={item.q} className="group p-5 open:bg-card/60">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
                  {item.q}
                  <span className="font-mono text-lg text-muted-foreground group-open:rotate-45 transition-transform" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
