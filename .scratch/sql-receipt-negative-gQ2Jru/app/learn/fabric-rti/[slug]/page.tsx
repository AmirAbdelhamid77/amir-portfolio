import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Database,
  ExternalLink,
  ListChecks,
  ShieldAlert,
} from "lucide-react";
import { Container, Eyebrow } from "@/components/ui";
import { Panel } from "@/components/fabric/ui";
import {
  RTI_COURSE,
  RTI_LESSONS,
  getRtiLesson,
  rtiDatasetsFor,
  rtiLabsFor,
  rtiLessonHref,
} from "@/lib/rti/lessons";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return RTI_LESSONS.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getRtiLesson(slug);
  if (!lesson) return { title: "Lesson not found" };
  return {
    title: `${lesson.title} — ${RTI_COURSE.title}`,
    description: lesson.summary.slice(0, 180),
    alternates: { canonical: rtiLessonHref(lesson) },
    openGraph: {
      title: lesson.title,
      description: lesson.summary.slice(0, 180),
      url: rtiLessonHref(lesson),
      images: [
        { url: "/og.png", width: 1200, height: 630, alt: `${lesson.title} — Fabric RTI` },
      ],
    },
  };
}

export default async function RtiLessonPage({ params }: Params) {
  const { slug } = await params;
  const lesson = getRtiLesson(slug);
  if (!lesson) notFound();

  const labs = rtiLabsFor(lesson);
  const datasets = rtiDatasetsFor(lesson);
  const index = RTI_LESSONS.findIndex((item) => item.id === lesson.id);
  const previous = index > 0 ? RTI_LESSONS[index - 1] : null;
  const next = index < RTI_LESSONS.length - 1 ? RTI_LESSONS[index + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lesson.title,
    description: lesson.summary,
    educationalLevel: RTI_COURSE.level,
    learningResourceType: "Lesson",
    teaches: lesson.objective,
    isAccessibleForFree: true,
    author: { "@type": "Person", name: "Amir Abdelhamid" },
    url: `${RTI_COURSE.href}${lesson.slug}/`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-border">
        <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Link href="/learn/catalogue" className="hover:text-foreground">
              Learn
            </Link>
            <span aria-hidden="true">/</span>
            <Link href={RTI_COURSE.href} className="hover:text-foreground">
              {RTI_COURSE.title}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/70">Lesson {lesson.order}</span>
          </nav>

          <Eyebrow className="mt-6">
            Lesson {lesson.order} · {lesson.frame} · {lesson.domain}
          </Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-tight md:text-4xl">
            {lesson.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            {lesson.summary}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {Array.from(new Set(lesson.origins)).map((origin) => (
              <span
                key={origin}
                className="rounded-full bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground"
              >
                {origin}
              </span>
            ))}
            <span className="rounded-full bg-warning/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground">
              {lesson.verification.split(";")[0]}
            </span>
          </div>
        </Container>
      </section>

      <section className="py-8 md:py-12">
        <Container className="space-y-6">
          {lesson.caveat ? (
            <div className="flex gap-3 rounded-2xl border border-warning/40 bg-warning/5 p-4">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              <p className="text-sm leading-7 text-muted-foreground">{lesson.caveat}</p>
            </div>
          ) : null}

          <Panel title="Objective" description="What you should be able to explain after this lesson.">
            <p className="text-sm leading-7">{lesson.objective}</p>
            <ul className="mt-4 space-y-2">
              {lesson.objectives.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-7 text-muted-foreground">
                  <ListChecks className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel tone="muted" title="Before you start" description="Prerequisites named by the source blueprints.">
              <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
                {lesson.prerequisites.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-border-strong" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel tone="muted" title="What this lesson cannot show" description="Limits, stated before you start.">
              <p className="text-sm leading-7 text-muted-foreground">{lesson.limitation}</p>
              <p className="mt-3 font-mono text-xs leading-6 text-foreground">
                Verification: {lesson.verification}
              </p>
            </Panel>
          </div>

          <Panel title="Walkthrough" description="Source-anchored steps. Do them in order; each one is the next one's dependency.">
            <ol className="mt-5 space-y-4">
              {lesson.walkthrough.map((step, stepIndex) => (
                <li key={step} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs text-primary">
                    {stepIndex + 1}
                  </span>
                  <p className="text-sm leading-7 text-muted-foreground">{step}</p>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel
            title="Source blueprints this lesson wraps"
            description="Task, expected evidence and execution status, exactly as the package recorded them."
          >
            <div className="mt-5 space-y-4">
              {labs.map((lab) => (
                <article key={lab.lab_id} className="rounded-2xl border border-border bg-card/40 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                      {lab.lab_id}
                    </span>
                    <h3 className="text-sm font-medium">{lab.title}</h3>
                    <span className="rounded-full bg-card px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      {lab.data_origin}
                    </span>
                  </div>
                  <dl className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
                    <div>
                      <dt className="sr-only">Task</dt>
                      <dd>{lab.task}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground/70">
                        Expected evidence
                      </dt>
                      <dd>{lab.source_based_expected_evidence}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground/70">
                        Prerequisites
                      </dt>
                      <dd>{lab.prerequisites}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 font-mono text-xs leading-6 text-foreground">
                    {lab.validation_status}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {lab.source_evidence.map((evidence: {canonical_url:string;sha256:string;line?:number;source_path?:string;locator_term?:string;artifact_id?:string}) => (
                      <li key={evidence.canonical_url + (evidence.line ?? 0)}>
                        <a
                          href={evidence.canonical_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 break-all text-xs underline underline-offset-4 hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                          {evidence.source_path ?? evidence.canonical_url}
                          {evidence.locator_term ? ` — “${evidence.locator_term}”` : ""}
                          {evidence.line ? `, line ${evidence.line}` : ""}
                        </a>
                        <span className="block break-all font-mono text-[10px] leading-5 text-muted-foreground">
                          sha256 {evidence.sha256.slice(0, 16)}…
                          {evidence.artifact_id ? ` · artifact ${evidence.artifact_id}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Panel>

          {datasets.length > 0 ? (
            <Panel
              title="Datasets this lesson reads"
              description="Origin class, grain and the limitations that come with the archive."
            >
              <div className="mt-5 space-y-4">
                {datasets.map((dataset) => (
                  <article
                    key={dataset.dataset_id}
                    className="rounded-2xl border border-border bg-card/40 p-5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Database className="h-4 w-4 text-primary" aria-hidden="true" />
                      <h3 className="text-sm font-medium">{dataset.name}</h3>
                      <span className="rounded-full bg-card px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        {dataset.dataset_id}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                      {dataset.origin_class}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {dataset.description}
                    </p>
                    <dl className="mt-3 grid gap-2 text-xs leading-6 text-muted-foreground sm:grid-cols-2">
                      {dataset.row_grain ? (
                        <div>
                          <dt className="text-muted-foreground/70">Grain</dt>
                          <dd>{dataset.row_grain}</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="text-muted-foreground/70">Timezone</dt>
                        <dd>{dataset.timezone ?? "None inferred"}</dd>
                      </div>
                      {dataset.changes ? (
                        <div className="sm:col-span-2">
                          <dt className="text-muted-foreground/70">Changes applied</dt>
                          <dd>{dataset.changes}</dd>
                        </div>
                      ) : null}
                      {dataset.limitations ? (
                        <div className="sm:col-span-2">
                          <dt className="text-muted-foreground/70">Limitations</dt>
                          <dd>{dataset.limitations}</dd>
                        </div>
                      ) : null}
                    </dl>
                    {dataset.canonical_url ? (
                      <a
                        href={dataset.canonical_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs underline underline-offset-4"
                      >
                        Original dataset
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    ) : null}
                    {dataset.license ? (
                      <p className="mt-2 break-all font-mono text-[10px] leading-5 text-muted-foreground">
                        Licence: {dataset.license}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </Panel>
          ) : null}

          <Panel tone="accent" title="Misconceptions and trade-offs" description="The traps the source package names explicitly.">
            <ul className="mt-4 space-y-3">
              {lesson.misconceptions.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-7 text-muted-foreground">
                  <CircleAlert className="mt-1 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <nav aria-label="Lesson navigation" className="grid gap-4 sm:grid-cols-2">
            {previous ? (
              <Link
                href={rtiLessonHref(previous)}
                className="group rounded-2xl border border-border bg-card/40 p-4 transition-colors hover:border-border-strong hover:bg-card"
              >
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
                  Previous · Lesson {previous.order}
                </span>
                <p className="mt-1.5 text-sm font-medium">{previous.title}</p>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            {next ? (
              <Link
                href={rtiLessonHref(next)}
                className="group rounded-2xl border border-border bg-card/40 p-4 text-right transition-colors hover:border-border-strong hover:bg-card sm:col-start-2"
              >
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  Next · Lesson {next.order}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <p className="mt-1.5 text-sm font-medium">{next.title}</p>
              </Link>
            ) : (
              <Link
                href={RTI_COURSE.examHref}
                className="group rounded-2xl border border-primary/30 bg-primary/5 p-4 text-right transition-colors hover:border-primary/50 sm:col-start-2"
              >
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  Practise what you read
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <p className="mt-1.5 text-sm font-medium">Fabric RTI question set</p>
              </Link>
            )}
          </nav>
        </Container>
      </section>
    </>
  );
}
