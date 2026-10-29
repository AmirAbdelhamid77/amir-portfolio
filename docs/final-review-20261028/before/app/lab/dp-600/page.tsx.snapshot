import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Compass,
  FolderOpen,
  Gauge,
  ListChecks,
  Play,
  RotateCcw,
  ShieldCheck,
  Timer,
  TriangleAlert,
} from "lucide-react";
import { Container, Eyebrow } from "@/components/ui";
import { HubHeader, ModeCard, Panel, StatTile, DISCLAIMER, DataTable, Callout } from "@/components/fabric/ui";
import { HubStatusPanel } from "@/components/fabric/hub-panels";
import { COUNTS, META, PACKS } from "@/lib/fabric/data";
import { DOMAINS, OBJECTIVES, STUDY_GUIDE_URL, SUBJECTS } from "@/lib/fabric/taxonomy";
import { HUB_NAV } from "@/lib/fabric/nav";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Microsoft Fabric & DP-600 practice",
  description:
    "834 Microsoft Fabric practice questions across 18 source packs: guided study, topic practice, case studies and a custom timed simulation, with explanations, option-level rationales and DP-600 objective coverage.",
  alternates: { canonical: "/lab/dp-600" },
  openGraph: {
    title: "Microsoft Fabric & DP-600 practice hub",
    description:
      "834 questions, 18 packs, option-level rationales, case studies and an honest coverage report. Free, no account, saved in your browser.",
    url: "/lab/dp-600",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Microsoft Fabric & DP-600 practice — Hansa" }],
  },
};

// Modes are grouped by the job they do, not listed as nine peers. The group is
// what a first-time visitor needs; the flat `HUB_NAV` strip stays for people who
// already know where they are going.
const MODE_GROUPS = [
  {
    id: "study",
    title: "Study",
    blurb: "Untimed. The answer is explained as you go, including why the other options fail.",
  },
  {
    id: "assess",
    title: "Assess",
    blurb: "Feedback withheld until you submit, so the result means something.",
  },
  {
    id: "improve",
    title: "Improve",
    blurb: "Only the questions that went wrong, plus the pattern behind them.",
  },
  {
    id: "trust",
    title: "Trust the material",
    blurb: "Where each question came from and what the coverage report admits.",
  },
] as const;

const MODE_CARDS = [
  {
    href: "/lab/dp-600/study/",
    group: "study",
    title: "Guided study",
    description: "Untimed. Check each answer, read why every option is right or wrong, follow the source links.",
    meta: "no timer · immediate feedback",
    icon: BookOpen,
    primary: true,
  },
  {
    href: "/lab/dp-600/explore/",
    group: "study",
    title: "Explore the question bank",
    description: "Filter by objective, topic, pack, type or status and read any question with its rationales.",
    meta: "834 questions · search & filters",
    icon: Compass,
  },
  {
    href: "/lab/dp-600/mock/",
    group: "assess",
    title: "Mock exam",
    description: "A timed, feedback-free run with a navigator, flags and an answer review before you submit.",
    meta: "custom simulation · 100-min context",
    icon: Timer,
  },
  {
    href: "/lab/dp-600/cases/",
    group: "assess",
    title: "Case studies",
    description: "Work one scenario and all the questions that share it, so the constraints stay in view.",
    meta: `${COUNTS.withCaseStudy} questions · ${META.caseCount} scenarios`,
    icon: FolderOpen,
  },
  {
    href: "/lab/dp-600/practice/",
    group: "improve",
    title: "Topic practice",
    description: "Pick one pack, topic or objective. Choose how many questions, and whether to redo what you got wrong.",
    meta: "focused sessions · resume after refresh",
    icon: ListChecks,
  },
  {
    href: "/lab/dp-600/review/",
    group: "improve",
    title: "Mistakes & bookmarks",
    description: "Everything you got wrong, saved, flagged, or never tried — with focused retries.",
    meta: "review workflow",
    icon: RotateCcw,
  },
  {
    href: "/lab/dp-600/progress/",
    group: "improve",
    title: "Progress & backup",
    description: "Attempted versus correct by objective and topic, saved sessions, and JSON export/import.",
    meta: "stored in this browser only",
    icon: Gauge,
  },
  {
    href: "/lab/dp-600/resources/",
    group: "trust",
    title: "Sources & coverage",
    description: "Every reference link, its source pack, the validation note it carries, and the objective reconciliation.",
    meta: `${COUNTS.sources} references · ${META.validationNotes.length} validation wordings`,
    icon: ShieldCheck,
  },
];

export default function FabricHubPage() {
  const total = COUNTS.questions;
  const focused = COUNTS.core;
  const basis = (key: "declared" | "derived" | "domain-only" | "none") =>
    META.coverage.byBasis.find((row) => row.basis === key)?.core ?? 0;
  const domainRows = META.coverage.domainShares.map((domain) => {
    const band = domain.officialWeight.split("–").map((value) => Number(value.replace("%", "")));
    const midpoint = band.length === 2 ? (band[0] + band[1]) / 2 : band[0];
    const gap = Math.round((domain.coreShare - midpoint) * 10) / 10;
    return { ...domain, midpoint, gap };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: "Microsoft Fabric & DP-600 practice hub",
    description:
      "834 independently authored Microsoft Fabric practice questions with explanations, option rationales and case studies.",
    learningResourceType: "Practice questions",
    teaches: "Microsoft Fabric",
    numberOfQuestions: total,
    isAccessibleForFree: true,
    author: { "@type": "Person", name: SITE.name, url: SITE.url },
    url: `${SITE.url}/lab/dp-600/`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <HubHeader
        eyebrow="Data Lab · Microsoft Fabric"
        title="834 Fabric questions, organised the way you actually revise."
        description="Every question keeps its original wording, option-level rationale and source. Browse by official DP-600 objective or by Fabric technology — Direct Lake, deployment pipelines, Delta tables — without needing to know which video covered it."
      >
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
          <StatTile value={String(total)} label="practice questions" note="18 source packs" />
          <StatTile value={String(focused)} label="DP-600 focused" note="source declares a DP-600 objective" />
          <StatTile
            value={String(COUNTS.withCaseStudy)}
            label="with case context"
            note={`${META.caseCount} shared scenarios`}
          />
          <StatTile value={`${COUNTS.sources}`} label="source references" note="Microsoft Learn & docs" />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link
            href="/lab/dp-600/study/"
            className="press inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Start studying
          </Link>
          <Link
            href="/lab/dp-600/explore/"
            className="press inline-flex h-11 items-center gap-2 rounded-full border border-border-strong px-5 text-sm hover:bg-card"
          >
            <Compass className="h-4 w-4" aria-hidden="true" />
            Browse questions
          </Link>
          <span className="text-xs text-muted-foreground">
            Free · no account · progress saved in this browser
          </span>
        </div>
      </HubHeader>

      <div className="border-b border-border bg-background/60">
        <Container>
          <nav aria-label="DP-600 sections" className="scrollbar-hide -mx-1 flex gap-1 overflow-x-auto py-2.5">
            {HUB_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-card hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </Container>
      </div>

      <section className="py-10 md:py-14">
        <Container className="space-y-10">
          <HubStatusPanel />

          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <Eyebrow>Learning modes</Eyebrow>
                <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">
                  Study, assess, improve — then check the sources.
                </h2>
              </div>
              <p className="max-w-md text-xs leading-6 text-muted-foreground">
                Every mode grades with the same exact-match rules. What changes is when you see the
                explanation, and whether the clock is running.
              </p>
            </div>

            <div className="mt-6 grid gap-6">
              {MODE_GROUPS.map((group) => {
                const cards = MODE_CARDS.filter((card) => card.group === group.id);
                return (
                  <section key={group.id} aria-labelledby={`mode-${group.id}`}>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3
                        id={`mode-${group.id}`}
                        className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground"
                      >
                        {group.title}
                      </h3>
                      <p className="text-[11px] leading-5 text-muted-foreground">{group.blurb}</p>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {cards.map((card) => (
                        <ModeCard
                          key={card.href}
                          href={card.href}
                          title={card.title}
                          description={card.description}
                          meta={card.meta}
                          primary={card.primary}
                          icon={<card.icon className="h-4 w-4" aria-hidden="true" />}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>

          <Panel
            title="DP-600 objective coverage — content, not mastery"
            description="How the 480 focused questions distribute across the three official domains, against Microsoft's published weights. Each domain total is the sum of that domain's sub-objective buckets, so this panel and the table below can never disagree."
            action={{ href: "/lab/dp-600/progress/", label: "Your own performance" }}
          >
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div>
                <div className="grid gap-4">
                  {domainRows.map((domain) => (
                    <div key={domain.domain}>
                      <div className="flex items-baseline justify-between gap-3 text-xs">
                        <span className="flex min-w-0 items-baseline gap-2">
                          <span className="font-mono text-muted-foreground">{domain.domain}</span>
                          <span className="truncate text-foreground">{domain.label}</span>
                        </span>
                        <span className="shrink-0 font-mono text-muted-foreground">
                          {domain.coreQuestions} · {domain.coreShare}%
                        </span>
                      </div>
                      <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-foreground/5">
                        <div
                          className={
                            domain.gap < -5
                              ? "h-full rounded-full bg-warning"
                              : domain.gap > 15
                                ? "h-full rounded-full bg-primary/60"
                                : "h-full rounded-full bg-primary"
                          }
                          style={{ width: `${Math.min(100, domain.coreShare)}%` }}
                        />
                        <span
                          aria-hidden="true"
                          className="absolute top-0 h-full w-px bg-foreground/40"
                          style={{ left: `${domain.midpoint}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                        Official weight {domain.officialWeight} (midpoint {domain.midpoint}%). Bank share{" "}
                        {domain.coreShare}% —{" "}
                        {domain.gap > 2
                          ? `${domain.gap} points over-represented`
                          : domain.gap < -2
                            ? `${Math.abs(domain.gap)} points under-represented`
                            : "broadly in line"}
                        . The tick mark is the official midpoint. Sub-objective named by the source or its
                        topic: {domain.coreSubObjective}; kept at domain level: {domain.coreDomainOnly}.
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <Callout tone="warning" title="This bank cannot be blueprint-balanced, and is not presented as if it were">
                    Only 13 focused questions target “Implement and manage semantic models” (2.7%,
                    against an official 25–30%): 8 name a sub-objective (2 under 3.1, 6 under 3.2)
                    and 5 sit in the domain without one. To hit the official weight a mock would
                    have to invent or over-sample semantic-model questions. It does not. Timed
                    sessions here are labelled <strong>custom practice simulations</strong>, never
                    blueprint-authentic exams.
                  </Callout>
                </div>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Official sub-objectives
                </p>
                <div className="mt-3 grid gap-2">
                  {OBJECTIVES.map((objective) => {
                    const row = META.coverage.byObjective.find((item) => item.key === objective.id);
                    const domain = DOMAINS.find((item) => item.id === objective.domain);
                    return (
                      <div
                        key={objective.id}
                        className="rounded-xl border border-border bg-background/60 p-2.5"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-[11px] text-foreground">
                            <span className="font-mono text-muted-foreground">{objective.id}</span>{" "}
                            {objective.label}
                          </p>
                          <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                            {row?.total ?? 0}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          Domain {objective.domain} · {domain?.officialWeight} of the exam ·{" "}
                          {row?.core ?? 0} focused
                        </p>
                      </div>
                    );
                  })}
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-[11px] text-muted-foreground">
                    Table view of every objective bucket
                  </summary>
                  <div className="mt-2">
                    <DataTable
                      caption="Question counts by objective and alignment scope"
                      head={["Objective", "Total", "Focused", "Supporting", "DP-700"]}
                      rows={META.coverage.byObjective.map((row) => [
                        `${row.key} · ${row.label.replace(/^DP-600 [\d.]+ · /, "")}`,
                        row.total,
                        row.core,
                        row.support,
                        row.adjacent,
                      ])}
                    />
                  </div>
                </details>
              </div>
            </div>

            <p className="mt-4 text-[11px] leading-6 text-muted-foreground">
              Scope is taken from each question&apos;s own{" "}
              <code className="rounded bg-background px-1 py-0.5 font-mono text-[10px]">exam_objective</code>{" "}
              metadata: {COUNTS.core} name a DP-600 objective with no adjacent qualifier (focused),{" "}
              {COUNTS.support} are supporting or topic-derived, {COUNTS.adjacent} declare DP-700 as
              primary, {COUNTS.review} could not be mapped defensibly. Inside the focused{" "}
              {COUNTS.core}: {basis("declared")} name the sub-objective in the source, {basis("derived")}{" "}
              take a sub-objective from the question&apos;s topic inside the declared domain, and{" "}
              {basis("domain-only")} stay at domain level because no sub-objective is defensible. A
              question is counted once, in its own bucket — the counts are a partition, not an
              overlapping multi-map. The study guide is the authority —{" "}
              <a
                href={STUDY_GUIDE_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="text-foreground underline decoration-border-strong underline-offset-4"
              >
                Microsoft Learn, skills measured as of 19 October 2026
              </a>
              .
            </p>
          </Panel>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <Eyebrow>Topic explorer</Eyebrow>
                <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">
                  Find “Direct Lake” without knowing the video number.
                </h2>
              </div>
              <Link
                href="/lab/dp-600/explore/"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                Open with filters
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SUBJECTS.map((subject) => {
                const row = META.coverage.bySubject.find((item) => item.key === subject.id);
                const total = row?.total ?? 0;
                // An empty topic must not look like a destination: it used to link
                // to a filtered explorer that rendered "0 results" with no way out.
                if (total === 0) {
                  return (
                    <div
                      key={subject.id}
                      className="rounded-2xl border border-dashed border-border bg-background/40 p-4"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-sm font-medium text-foreground/80">{subject.label}</h3>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          no questions yet
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
                        {subject.description}
                      </p>
                      <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                        This area is named but not covered by the current bank. Closest covered
                        ground:{" "}
                        <Link
                          href="/lab/dp-600/explore/?subject=lakehouse"
                          className="text-foreground underline decoration-border-strong underline-offset-2"
                        >
                          Lakehouse &amp; Delta tables
                        </Link>
                        .
                      </p>
                    </div>
                  );
                }
                return (
                  <Link
                    key={subject.id}
                    href={`/lab/dp-600/explore/?subject=${subject.id}`}
                    className="group rounded-2xl border border-border bg-card/40 p-4 transition-colors hover:border-border-strong hover:bg-card/70"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-medium text-foreground">{subject.label}</h3>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {total}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
                      {subject.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          <Panel
            title="Source packs"
            description="18 packs: five original topic packs plus 13 video-derived packs. Each keeps its source video, timestamps and study-note chapters."
            action={{ href: "/lab/dp-600/resources/", label: "Sources & study notes" }}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {PACKS.map((pack) => (
                <Link
                  key={pack.key}
                  href={`/lab/dp-600/explore/?pack=${pack.key}`}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background/50 p-3 transition-colors hover:border-border-strong"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-medium text-foreground">
                      {pack.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                      {pack.video ? pack.video.title : "No single source video"}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                    {pack.questionCount}
                  </span>
                </Link>
              ))}
            </div>
          </Panel>

          <div className="rounded-3xl border border-border bg-card/30 p-5 text-xs leading-6 text-muted-foreground">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <TriangleAlert className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
              What this is, and what it is not
            </p>
            <p className="mt-2">{DISCLAIMER}</p>
            <p className="mt-2">
              Questions were authored from conference talks, Microsoft Learn documentation and
              independent reasoning. The source package records, per question, whether the claim is
              documentation-backed or only conceptual — that note is shown with each explanation. No
              question was executed against a live Fabric tenant for this import.
            </p>
            <p className="mt-2">
              Progress lives in <code className="rounded bg-background px-1 py-0.5 font-mono text-[10px]">localStorage</code>{" "}
              under a namespace separate from the existing Data Lab exams, so your {""}
              <Link href="/lab/" className="text-foreground underline decoration-border-strong underline-offset-4">
                six general exams
              </Link>{" "}
              and their history are untouched. There is no account and no cross-device sync.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
