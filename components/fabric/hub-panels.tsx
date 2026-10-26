"use client";

// The hub's personal panels. Everything here reads the browser-local store, so
// it renders only after mount and never blocks the static page.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  History,
  Play,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import { useFabricStore } from "@/lib/fabric/storage";
import { loadIndex, subjectLabel } from "@/lib/fabric/data";
import { MODE_LABEL, sessionHref } from "@/lib/fabric/nav";
import { formatClock } from "@/lib/fabric/engine";
import type { FabricIndexEntry } from "@/lib/fabric/types";
import { EmptyState, Meter } from "@/components/fabric/ui";

export function HubStatusPanel() {
  const { store, available, recovered } = useFabricStore();
  const [index, setIndex] = useState<FabricIndexEntry[] | null>(null);

  const sessions = useMemo(
    () =>
      Object.values(store.sessions)
        .filter((session) => session.status === "active")
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [store.sessions],
  );

  const attempted = Object.values(store.questions).filter((stats) => stats.attempts > 0).length;
  const missedIds = useMemo(
    () =>
      Object.entries(store.questions)
        .filter(([, stats]) => stats.attempts > 0 && !stats.lastCorrect)
        .map(([id]) => id),
    [store.questions],
  );
  const missedKey = missedIds.join(",");

  useEffect(() => {
    if (missedIds.length === 0 || index) return;
    let alive = true;
    loadIndex()
      .then((entries) => {
        if (alive) setIndex(entries);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [missedIds.length, index, missedKey]);

  const recentMisses = useMemo(() => {
    if (!index) return [];
    const byId = new Map(index.map((entry) => [entry.id, entry]));
    return missedIds
      .map((id) => byId.get(id))
      .filter((entry): entry is FabricIndexEntry => Boolean(entry))
      .slice(0, 5);
  }, [index, missedIds]);

  const attempts = store.history;
  const average = attempts.length
    ? Math.round(attempts.reduce((sum, entry) => sum + entry.percent, 0) / attempts.length)
    : null;

  const hasAny = attempted > 0 || sessions.length > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-border bg-card/40 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <History className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Your progress
          </h2>
          <Link href="/lab/dp-600/progress/" className="text-[11px] text-muted-foreground hover:text-foreground">
            Full report
          </Link>
        </div>

        {!available ? (
          <p className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-3 text-[11px] leading-5 text-foreground">
            This browser is blocking local storage, so progress cannot be saved. The questions still
            work for this visit.
          </p>
        ) : null}
        {recovered ? (
          <p className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-3 text-[11px] leading-5 text-foreground">
            A stored record from an older schema was preserved under a backup key and a fresh
            namespace was started. Nothing was deleted.
          </p>
        ) : null}

        {hasAny ? (
          <div className="mt-4 grid gap-4">
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border">
              {[
                { value: `${attempted}`, label: "questions seen", note: "of 834" },
                { value: attempts.length ? `${average}%` : "—", label: "average score", note: `${attempts.length} session${attempts.length === 1 ? "" : "s"}` },
                { value: `${Object.keys(store.questions).length ? missedIds.length : 0}`, label: "to revisit", note: "last answer wrong" },
              ].map((item) => (
                <div key={item.label} className="bg-card/80 p-3">
                  <p className="font-mono text-lg tracking-tight text-foreground">{item.value}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.note}</p>
                </div>
              ))}
            </div>

            {attempts.length > 0 ? (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Recent sessions
                </p>
                <ul className="mt-2 grid gap-1.5">
                  {attempts.slice(0, 4).map((entry) => (
                    <li key={entry.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="min-w-0 truncate text-muted-foreground">
                        {entry.label} · {MODE_LABEL[entry.mode] ?? entry.mode}
                      </span>
                      <span className="shrink-0 font-mono text-foreground">
                        {entry.score}/{entry.total} · {formatClock(entry.durationSeconds)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Link
                href="/lab/dp-600/review/"
                className="press inline-flex h-9 items-center gap-1.5 rounded-full border border-border-strong px-3.5 text-[11px] hover:bg-card"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                Retry {missedIds.length || "missed"}
              </Link>
              <Link
                href="/lab/dp-600/progress/"
                className="press inline-flex h-9 items-center gap-1.5 rounded-full border border-border-strong px-3.5 text-[11px] hover:bg-card"
              >
                <Bookmark className="h-3 w-3" aria-hidden="true" />
                {store.bookmarks.length} saved
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="No attempts recorded yet"
              description="This is a fresh start: nothing is uploaded, and no account is needed. Begin with guided study so every answer comes with its explanation."
              action={{ href: "/lab/dp-600/study/", label: "Start guided study" }}
            />
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-border bg-card/40 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <Play className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {sessions.length > 0 ? "Sessions in progress" : "Recently missed"}
        </h2>

        {sessions.length > 0 ? (
          <ul className="mt-4 grid gap-2">
            {sessions.slice(0, 3).map((session) => {
              const answered = Object.keys(session.answers).length;
              const total = session.manifest.questionIds.length;
              return (
                <li key={session.id}>
                  <Link
                    href={sessionHref(session.mode, session.id)}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/[0.04] p-3 text-xs transition-colors hover:border-primary/50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-foreground">
                        {session.manifest.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {MODE_LABEL[session.mode]} · {answered}/{total} answered
                        {session.deadlineAt
                          ? ` · ends ${new Date(session.deadlineAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`
                          : ""}
                      </span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-foreground">
                      Resume
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : recentMisses.length > 0 ? (
          <ul className="mt-4 grid gap-2">
            {recentMisses.map((entry) => (
              <li key={entry.id} className="flex items-start gap-2 text-xs">
                <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0 text-warning" aria-hidden="true" />
                <span className="min-w-0">
                  <Link
                    href={`/lab/dp-600/explore/?question=${encodeURIComponent(entry.id)}`}
                    className="block truncate text-foreground hover:underline"
                  >
                    {entry.title}
                  </Link>
                  <span className="text-[11px] text-muted-foreground">{subjectLabel(entry.subject)}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="Nothing waits for you"
              description="No half-finished session and no wrong answers recorded. Pick a mode below, or browse the bank by topic first."
              action={{ href: "/lab/dp-600/explore/", label: "Browse questions" }}
            />
          </div>
        )}

        {missedIds.length > recentMisses.length && recentMisses.length > 0 ? (
          <p className="mt-3 text-[11px] text-muted-foreground">
            +{missedIds.length - recentMisses.length} more in{" "}
            <Link href="/lab/dp-600/review/" className="underline decoration-border-strong underline-offset-4">
              Mistakes &amp; bookmarks
            </Link>
            .
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Attempted-vs-not, by objective, for the hub and the progress page. */
export function AttemptedPanel({ index }: { index: FabricIndexEntry[] }) {
  const { store } = useFabricStore();
  const rows = useMemo(() => {
    const byObjective = new Map<string, { label: string; total: number; attempted: number; correct: number }>();
    for (const entry of index) {
      const key = entry.objectiveId ?? entry.domain ?? "unmapped";
      const row = byObjective.get(key) ?? {
        label:
          entry.objectiveId
            ? `DP-600 ${entry.objectiveId}`
            : entry.domain
              ? `DP-600 ${entry.domain} (sub-objective not stated)`
              : "No mapping",
        total: 0,
        attempted: 0,
        correct: 0,
      };
      row.total += 1;
      const stats = store.questions[entry.id];
      if (stats && stats.attempts > 0) {
        row.attempted += 1;
        if (stats.lastCorrect) row.correct += 1;
      }
      byObjective.set(key, row);
    }
    return [...byObjective.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [index, store.questions]);

  return (
    <div className="grid gap-3">
      {rows.map(([key, row]) => (
        <Meter
          key={key}
          label={`${row.label} · ${row.total} questions`}
          value={row.attempted}
          total={row.total}
          note={`${row.attempted ? Math.round((row.correct / row.attempted) * 100) : 0}% of attempted answers correct on the last try`}
          tone={row.attempted === 0 ? "muted" : "primary"}
        />
      ))}
    </div>
  );
}
