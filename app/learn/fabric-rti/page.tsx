import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ExternalLink, ShieldAlert } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui";
import { Panel } from "@/components/fabric/ui";
import {
  RTI_COURSE,
  RTI_LESSONS,
  RTI_UNCOVERED_LABS,
  rtiLessonHref,
} from "@/lib/rti/lessons";

// The authentic-source milestone's first approved lane. Its 17 lab blueprints
// and provenance registry stay staged behind /learn/drafts as review evidence;
// this course is the teaching layer over them, so a reader lands on lessons
// rather than on a package status. Statuses are inherited, never upgraded:
// COMPLETE_SOURCE_PACKAGE_WITH_EXPLICIT_HOLDS and runtime NOT_RUN travel here.
export const metadata: Metadata = {
  title: "Fabric Real-Time Intelligence — authentic-source lessons",
  description:
    "Eight lessons built over 17 pinned Microsoft Fabric real-time lab blueprints and eight measured datasets: typed ingestion, Activator rules, digital twins, KQL anomalies, industrial data grain and streaming internals — with every hold and NOT_RUN status kept visible.",
  alternates: { canonical: RTI_COURSE.href },
  openGraph: {
    title: "Fabric Real-Time Intelligence — authentic-source lessons",
    description: RTI_COURSE.purpose,
    url: RTI_COURSE.href,
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: `${RTI_COURSE.title} — lessons` },
    ],
  },
};

const ORIGIN_TONE: Record<string, string> = {
  "Published workshop sample": "bg-accent/15 text-foreground",
  "Published simulated telemetry": "bg-warning/15 text-foreground",
  "Published synthetic web events": "bg-warning/15 text-foreground",
  "Observed factory energy": "bg-success/15 text-foreground",
  "Observed controlled test rig": "bg-success/15 text-foreground",
  "Observed manufacturing": "bg-success/15 text-foreground",
  "Observed manual factory records": "bg-success/15 text-foreground",
  "Published aggregate — not a shipment trace": "bg-violet/15 text-foreground",
  "Published sample implementation": "bg-primary/10 text-primary",
  "Published code examples": "bg-primary/10 text-primary",
  "Published lab sample": "bg-primary/10 text-primary",
  "Published instructional fixtures": "bg-primary/10 text-primary",
  "Publisher fictional game": "bg-rose-500/10 text-rose-500",
};

export default function FabricRtiCoursePage() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Link href="/learn" className="hover:text-foreground">
              Learn
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/70">Fabric Real-Time Intelligence</span>
          </nav>

          <Eyebrow className="mt-6">Course · Microsoft Fabric · source-pinned</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-tight md:text-4xl">
            {RTI_COURSE.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            {RTI_COURSE.purpose}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
            {[
              { value: String(RTI_LESSONS.length), label: "lessons" },
              { value: String(RTI_COURSE.counts.blueprintsShipped), label: "lab blueprints" },
              { value: String(RTI_COURSE.counts.repositoriesCleared), label: "source repos" },
              { value: "NOT_RUN", label: "runtime status" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card/70 p-4">
                <p className="font-mono text-2xl font-medium tracking-tight">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-8 md:py-12">
        <Container className="space-y-6">
          <Panel
            tone="muted"
            title="How this course relates to the source package"
            description="Lessons teach; the package stays the provenance record."
          >
            <p className="text-sm leading-7 text-muted-foreground">
              Every lesson wraps one or more of the package&apos;s lab blueprints and keeps that
              blueprint&apos;s id, status and verification result. Nothing here upgrades a status:
              the package arrived as{" "}
              <strong className="font-medium text-foreground">{RTI_COURSE.status}</strong> with
              runtime <strong className="font-medium text-foreground">{RTI_COURSE.runtimeStatus}</strong>,
              and both travel with the content. The blueprints and the provenance registry remain
              available as an isolated review surface — they are evidence, not lessons.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{RTI_COURSE.lens}</p>
            <div className="mt-4 flex flex-wrap gap-4">
              <Link
                href="/learn/drafts/"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm underline underline-offset-4"
              >
                Open the intake review surface
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link
                href={RTI_COURSE.examHref}
                className="inline-flex min-h-11 items-center gap-1.5 text-sm underline underline-offset-4"
              >
                Practise with the companion question set
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </Panel>

          <Panel
            title="Lessons"
            description="Each lesson is source-anchored: it names the blueprint it wraps, the origin class of the data and what was never run."
          >
            <ol className="mt-5 grid gap-4 md:grid-cols-2">
              {RTI_LESSONS.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={rtiLessonHref(lesson)}
                    className="group flex h-full flex-col rounded-3xl border border-border bg-card/50 p-5 transition-colors hover:border-border-strong hover:bg-card"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <BookOpen className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {lesson.frame}
                      </span>
                    </div>
                    <p className="mt-4 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Lesson {lesson.order} · {lesson.domain}
                    </p>
                    <h3 className="mt-1.5 text-base font-medium tracking-tight">{lesson.title}</h3>
                    <p className="mt-2 flex-1 text-xs leading-6 text-muted-foreground">
                      {lesson.summary.slice(0, 190)}…
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3">
                      {Array.from(new Set(lesson.origins)).map((origin) => (
                        <span
                          key={origin}
                          className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                            ORIGIN_TONE[origin] ?? "bg-card text-foreground"
                          }`}
                        >
                          {origin}
                        </span>
                      ))}
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs text-foreground">
                      Open lesson
                      <ArrowRight
                        className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel tone="accent" title="Holds kept in place" description="What this course deliberately does not contain.">
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              {RTI_COURSE.holds.map((hold) => (
                <li key={hold.lab_id} className="flex gap-3">
                  <ShieldAlert className="mt-1 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                  <span>
                    <strong className="font-mono text-xs text-foreground">{hold.lab_id}</strong> —{" "}
                    {hold.reason}
                  </span>
                </li>
              ))}
              {RTI_COURSE.registryHolds.map((hold) => (
                <li key={hold.id} className="flex gap-3">
                  <ShieldAlert className="mt-1 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                  <span>
                    <strong className="font-mono text-xs text-foreground">{hold.id}</strong> —{" "}
                    {hold.reason}
                  </span>
                </li>
              ))}
            </ul>
            {RTI_UNCOVERED_LABS.length === 0 ? (
              <p className="mt-4 text-xs leading-6 text-muted-foreground">
                Every shipped blueprint is wrapped by a lesson, except the withheld L11 — which is
                withheld on purpose.
              </p>
            ) : (
              <p className="mt-4 text-xs leading-6 text-warning">
                Shipped blueprints without a lesson: {RTI_UNCOVERED_LABS.join(", ")}
              </p>
            )}
          </Panel>

          <Panel
            title="Where the sources live"
            description="Pinned repositories, unchanged archives and the licences attached to them."
          >
            <p className="text-sm leading-7 text-muted-foreground">
              {RTI_COURSE.counts.repositoriesCleared} repositories were cleared for reference and{" "}
              {RTI_COURSE.counts.datasetsCleared} datasets were cleared with their original licences
              intact; two repositories with no root licence stay reference-only, the Scania archive
              is held pending licence reconciliation, and one shipment-level dataset is blocked
              outright because its original endpoint was unreachable. Content objects in the
              package are stored by hash, so a path in the archive is not a folder layout here.
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <a
                href="https://archive.ics.uci.edu/"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm underline underline-offset-4"
              >
                UCI Machine Learning Repository
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <a
                href="https://data.worldbank.org/indicator/IS.SHP.GOOD.TU"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm underline underline-offset-4"
              >
                World Bank container port traffic
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </Panel>
        </Container>
      </section>
    </>
  );
}
