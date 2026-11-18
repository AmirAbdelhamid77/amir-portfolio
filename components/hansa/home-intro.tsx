"use client";

// T2.5 (PRODUCT.md §6 items 1–3): the opening above the timeline. Who and what
// in one line, two ways in, a smaller Practice link, a Continue card that only
// exists when this browser actually holds progress, and the three doors.
//
// The timeline below is untouched (T3.1 owns moving it); every date, day URL and
// insight record still comes from the same feed. The Continue card reads the two
// existing progress stores — `amir-lab-v1` and `amir-fabric-v1` — and renders
// nothing on the server or when both are empty, so the prerendered HTML never
// promises saved progress that is not there.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import type { FabricMode } from "@/lib/fabric/engine";
import {
  useFabricStore,
  type AttemptHistoryEntry,
  type StoredSession,
} from "@/lib/fabric/storage";
import { useLabStore, type StoredResult } from "@/lib/lab-storage";

export type HomeExam = { slug: string; title: string };

const DOORS = [
  {
    title: "Learn",
    href: "/learn",
    sentence: "Courses, references and the Atlas, from chart craft to statistics.",
    action: "Browse the catalogue",
  },
  {
    title: "Practice",
    href: "/practice/catalogue",
    sentence: "Question banks with explanations, and the DP-600 lab with saved sessions.",
    action: "Answer a question",
  },
  {
    title: "Work",
    href: "/work",
    sentence: "Case studies with the data, the decisions and what I would do next.",
    action: "Read the work",
  },
] as const;

const MODE_NOUN: Record<FabricMode, string> = {
  guided: "guided study",
  topic: "topic practice",
  mock: "mock exam",
  case: "case-study practice",
  review: "mistake review",
};

/** Sessions live under the route that owns their mode, not under its name. */
const MODE_ROUTE: Record<FabricMode, string> = {
  guided: "study",
  topic: "practice",
  mock: "mock",
  case: "cases",
  review: "review",
};

type ContinueTarget = {
  /** ISO timestamp used only to pick the most recent progress. */
  at: string;
  href: string;
  label: string;
  detail: string;
};

function pickTarget(
  exams: HomeExam[],
  sessions: Record<string, StoredSession>,
  history: AttemptHistoryEntry[],
  lab: Record<string, StoredResult>,
): ContinueTarget | null {
  const targets: ContinueTarget[] = [];

  const active = Object.values(sessions)
    .filter((session) => session.status === "active")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  if (active) {
    const total = active.manifest.questionIds.length;
    targets.push({
      at: active.updatedAt,
      href: `/lab/dp-600/${MODE_ROUTE[active.mode]}/?session=${encodeURIComponent(active.id)}`,
      label: `Resume ${active.manifest.label}`,
      detail: `Question ${Math.min(active.index + 1, total)} of ${total}`,
    });
  }

  const last = [...history].sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];
  if (last) {
    targets.push({
      at: last.completedAt,
      href: "/lab/dp-600/progress/",
      label: `Review your last DP-600 ${MODE_NOUN[last.mode]}`,
      detail: `${last.percent}% · ${last.score} of ${last.total}`,
    });
  }

  for (const [slug, result] of Object.entries(lab)) {
    const exam = exams.find((item) => item.slug === slug);
    if (!exam) continue;
    targets.push({
      at: result.lastAt,
      href: `/lab/${slug}`,
      label: `Continue ${exam.title}`,
      detail: `Best ${result.best}% · ${result.attempts} ${result.attempts === 1 ? "attempt" : "attempts"}`,
    });
  }

  return targets.sort((a, b) => b.at.localeCompare(a.at))[0] ?? null;
}

function ContinueCard({ target }: { target: ContinueTarget | null }) {
  // No stored progress means no card at all: no placeholder, no empty box.
  if (!target) return null;
  return (
    <aside aria-label="Continue learning" className="mt-8">
      <Link
        href={target.href}
        className="group flex max-w-xl items-center gap-4 rounded-2xl border border-border bg-card/50 px-4 py-3 transition-colors hover:border-border-strong hover:bg-card"
      >
        <span className="h-2 w-2 shrink-0 rounded-full bg-warning" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Continue where you left off
          </span>
          <span className="mt-0.5 block truncate text-sm font-medium">{target.label}</span>
          <span className="block truncate text-xs text-muted-foreground">{target.detail}</span>
        </span>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </aside>
  );
}

export function HomeIntro({ exams }: { exams: HomeExam[] }) {
  const lab = useLabStore();
  const fabric = useFabricStore();
  const target = pickTarget(exams, fabric.store.sessions, fabric.store.history, lab);

  return (
    <section
      aria-labelledby="home-title"
      className="relative border-b border-border/60 bg-background"
    >
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-[104px] md:px-6 md:pb-14 md:pt-[128px]">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Hansa · Data analyst · Power BI, SQL, Python, Excel
        </p>
        <h1
          id="home-title"
          className="mt-4 max-w-4xl text-balance text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
        >
          I&apos;m Amir Abdelhamid. I build decision-ready dashboards and teach the
          reasoning behind them.
        </h1>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <ButtonLink href="/learn" size="lg">
            Start learning
          </ButtonLink>
          <ButtonLink href="/work" variant="secondary" size="lg">
            See my work
          </ButtonLink>
          <Link
            href="/practice/catalogue"
            className="text-sm font-medium text-foreground/80 underline decoration-border-strong underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
          >
            Practice
          </Link>
        </div>

        <ContinueCard target={target} />

        <nav aria-label="Start here" className="mt-12">
          <ol className="grid border-t border-border sm:grid-cols-3">
            {DOORS.map((door, index) => (
              <li
                key={door.href}
                className="border-b border-border sm:border-b-0 sm:border-r sm:last:border-r-0"
              >
                <Link
                  href={door.href}
                  className="group flex h-full flex-col gap-3 py-5 transition-colors hover:bg-card/40 sm:px-6 sm:py-6 sm:first:pl-0 sm:last:pr-0"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    0{index + 1} · {door.title}
                  </span>
                  <span className="text-sm leading-6 text-muted-foreground">
                    {door.sentence}
                  </span>
                  <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium">
                    {door.action}
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}
