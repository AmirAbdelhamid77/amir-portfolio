import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Award, Briefcase, GraduationCap } from "lucide-react";
import { FACTS, SKILL_GROUPS, TIMELINE } from "@/lib/experience";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Amir Abdelhamid's experience, skills, education, and certifications — Power BI, SQL, Python, Excel, and the projects that demonstrate each.",
  alternates: { canonical: "/experience" },
};

const LEVEL_LABEL = {
  strong: "Strong",
  working: "Working",
  familiar: "Familiar",
} as const;

const LEVEL_DOTS = {
  strong: 3,
  working: 2,
  familiar: 1,
} as const;

const KIND_ICON = {
  work: Briefcase,
  education: GraduationCap,
  certification: Award,
} as const;

export default function ExperiencePage() {
  return (
    <>
      <section className="relative border-b border-border">
        <div aria-hidden="true" className="grid-noise mask-b-fade absolute inset-0 opacity-50" />
        <Container className="relative py-16 md:py-20">
          <Eyebrow>Experience</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight md:text-5xl">
            A short history of learning to be useful with data.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Engineering first, analytics second. The order matters: I learned to
            treat a reading as a claim that needs evidence before I ever opened
            Power BI.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
            {FACTS.map((fact) => (
              <div key={fact.label} className="bg-card/70 p-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container className="grid gap-10 lg:grid-cols-[0.55fr_1.45fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Eyebrow>Timeline</Eyebrow>
            <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">
              Work, study, and the projects between.
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              I am at the start of a deliberate career, not pretending to have a
              decade of titles. What I can show is the work and how it was made.
            </p>
          </div>

          <ol className="relative space-y-8 border-l border-border pl-6">
            {TIMELINE.map((item) => {
              const Icon = KIND_ICON[item.kind];
              return (
                <li key={item.title} className="relative">
                  <span className="absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background">
                    <Icon className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                  </span>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {item.period}
                  </p>
                  <h3 className="mt-1.5 text-lg font-medium tracking-tight">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.org}</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.summary}</p>
                  <ul className="mt-3 grid gap-1.5">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2 text-xs leading-6 text-muted-foreground">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      <section className="border-y border-border bg-card/30 py-12 md:py-16">
        <Container>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Skills</Eyebrow>
              <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">
                Grouped by what I can show.
              </h2>
            </div>
            <p className="max-w-sm text-xs leading-6 text-muted-foreground">
              &ldquo;Working&rdquo; means I have used it on a real deliverable.
              &ldquo;Familiar&rdquo; means I know the concepts and can ramp up.
              No logo wall.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {SKILL_GROUPS.map((group) => (
              <div key={group.title} className="rounded-3xl border border-border bg-background/70 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-medium">{group.title}</h3>
                    <p className="mt-1.5 text-xs leading-6 text-muted-foreground">{group.blurb}</p>
                  </div>
                  <Link
                    href={group.evidence.href}
                    className="group inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    {group.evidence.label}
                    <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </div>

                <ul className="mt-4 grid gap-1.5">
                  {group.skills.map((skill) => (
                    <li
                      key={skill.name}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-2.5 py-1.5"
                    >
                      <span className="text-xs text-foreground/85">{skill.name}</span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <span className="flex gap-0.5" aria-hidden="true">
                          {[0, 1, 2].map((dot) => (
                            <span
                              key={dot}
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                dot < LEVEL_DOTS[skill.level] ? "bg-primary" : "bg-foreground/10",
                              )}
                            />
                          ))}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          {LEVEL_LABEL[skill.level]}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card/40 p-6">
            <Eyebrow>Education</Eyebrow>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium">B.Sc. Electronics & Communication Engineering</p>
                <p className="text-xs text-muted-foreground">Sohag University · graduation project in ADAS</p>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  Signals, instrumentation, and embedded systems — the foundation
                  for sensor data validation and technical documentation.
                </p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium">IMT AVR Diploma</p>
                <p className="text-xs text-muted-foreground">IMT School · 2023</p>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  Microcontroller programming, peripherals, and hardware
                  debugging.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/40 p-6">
            <Eyebrow>Certification</Eyebrow>
            <div className="mt-4">
              <p className="text-sm font-medium">IBM Data Analyst Professional Certificate</p>
              <p className="text-xs text-muted-foreground">Coursera · IBM · 2025</p>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                Nine courses covering Excel, SQL, Python, Pandas, visualisation,
                and a capstone. The certificate is the structure; the capstone is
                the evidence.
              </p>
              <Link
                href="/work/ibm-capstone"
                className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-foreground"
              >
                Read the capstone case study
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs leading-6 text-muted-foreground">
                Certificate images and a downloadable CV will be added when the
                source files are available. Ask for either by email.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-16 md:pb-20">
        <Container>
          <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-border bg-card/40 p-6 sm:flex-row sm:items-center md:p-8">
            <div>
              <h2 className="text-xl font-medium tracking-tight">Hiring for a data role?</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                I am available immediately and comfortable with remote teams.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/contact" icon>
                Get in touch
              </ButtonLink>
              <ButtonLink href="/work" variant="secondary">
                See the work
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
