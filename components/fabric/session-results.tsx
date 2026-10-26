"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Printer,
  RotateCcw,
  Timer,
  XCircle,
} from "lucide-react";
import { QuestionView } from "@/components/fabric/question-view";
import { DataTable, Meter } from "@/components/fabric/ui";
import { CASE_BY_ID, PACK_BY_KEY, SOURCE_BY_ID, videoUrl } from "@/lib/fabric/data";
import { formatClock } from "@/lib/fabric/engine";
import type { FabricQuestion } from "@/lib/fabric/types";
import type { StoredSession } from "@/lib/fabric/storage";
import { cn } from "@/lib/utils";

export function SessionResults({
  session,
  questions,
  onRetryIncorrect,
  onRestart,
}: {
  session: StoredSession;
  questions: FabricQuestion[];
  onRetryIncorrect: (ids: string[]) => void;
  onRestart: () => void;
}) {
  const result = session.result;
  const [index, setIndex] = useState(0);
  const [onlyIncorrect, setOnlyIncorrect] = useState(true);

  const incorrect = useMemo(
    () => questions.filter((question) => result?.perQuestion[question.id] !== true),
    [questions, result],
  );
  const reviewSet = onlyIncorrect ? incorrect : questions;
  const safeIndex = Math.min(index, Math.max(0, reviewSet.length - 1));
  const question = reviewSet[safeIndex];

  if (!result) return null;

  const isMock = result.mode === "mock";

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-border bg-card/60 p-6 sm:col-span-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {result.autoSubmitted ? "Time expired · auto-submitted" : isMock ? "Practice simulation result" : "Session result"}
          </p>
          <div className="mt-2 flex items-end gap-3">
            <p className="text-5xl font-medium tracking-tight">{result.percent}%</p>
            <p className="mb-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
              {result.score} of {result.total} correct
            </p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-foreground/5">
            <div
              className={cn(
                "h-full rounded-full",
                result.percent >= 70 ? "bg-gradient-to-r from-success to-accent" : "bg-warning",
              )}
              style={{ width: `${result.percent}%` }}
            />
          </div>
          <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
            {isMock
              ? "Custom practice simulation. It is not a blueprint-weighted replica of DP-600 and this percentage is not a predicted exam score."
              : "Practice result. Questions answered once, with the explanation shown immediately."}
          </p>
        </div>

        <div className="min-w-0 rounded-3xl border border-border bg-card/60 p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Time</p>
          <p className="mt-2 flex items-center gap-2 font-mono text-3xl tracking-tight">
            <Timer className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            {formatClock(result.durationSeconds)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {session.manifest.minutes ? `limit ${session.manifest.minutes} min` : "untimed session"}
          </p>
        </div>

        <div className="min-w-0 rounded-3xl border border-border bg-card/60 p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Questions to revisit
          </p>
          <p className="mt-2 font-mono text-3xl tracking-tight">{incorrect.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {questions.length - incorrect.length} correct first time in this session
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 rounded-3xl border border-border bg-card/40 p-5">
          <h2 className="text-sm font-medium">By official objective</h2>
          <div className="mt-4 grid gap-3">
            {result.byObjective.map((bucket) => (
              <Meter
                key={bucket.key}
                label={bucket.label}
                value={bucket.correct}
                total={bucket.total}
                tone={bucket.correct / bucket.total >= 0.7 ? "success" : "warning"}
              />
            ))}
          </div>
        </div>
        <div className="min-w-0 rounded-3xl border border-border bg-card/40 p-5">
          <h2 className="text-sm font-medium">By Fabric topic</h2>
          <div className="mt-4 grid gap-3">
            {result.bySubject.slice(0, 6).map((bucket) => (
              <Meter
                key={bucket.key}
                label={bucket.label}
                value={bucket.correct}
                total={bucket.total}
                tone={bucket.correct / bucket.total >= 0.7 ? "success" : "warning"}
              />
            ))}
          </div>
        </div>
        <div className="min-w-0 rounded-3xl border border-border bg-card/40 p-5">
          <h2 className="text-sm font-medium">By question type</h2>
          <div className="mt-4 grid gap-3">
            {result.byType.map((bucket) => (
              <Meter
                key={bucket.key}
                label={bucket.label}
                value={bucket.correct}
                total={bucket.total}
                tone={bucket.correct / bucket.total >= 0.7 ? "success" : "warning"}
              />
            ))}
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-[11px] text-muted-foreground">Table view</summary>
            <div className="mt-2">
              <DataTable
                caption="Correct answers by question type"
                head={["Type", "Correct", "Total"]}
                rows={result.byType.map((bucket) => [bucket.label, bucket.correct, bucket.total])}
              />
            </div>
          </details>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 no-print">
        {incorrect.length > 0 ? (
          <button
            type="button"
            onClick={() => onRetryIncorrect(incorrect.map((item) => item.id))}
            className="press inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background hover:bg-foreground/90"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Retry {incorrect.length} missed
          </button>
        ) : null}
        <button
          type="button"
          onClick={onRestart}
          className="press inline-flex h-10 items-center gap-2 rounded-full border border-border-strong px-5 text-sm hover:bg-card"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          New session
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="press inline-flex h-10 items-center gap-2 rounded-full border border-border-strong px-5 text-sm hover:bg-card"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print review
        </button>
        <Link
          href="/lab/dp-600/review/"
          className="press inline-flex h-10 items-center gap-2 rounded-full border border-border-strong px-5 text-sm hover:bg-card"
        >
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Mistakes & bookmarks
        </Link>
      </div>

      {reviewSet.length > 0 ? (
        <div className="mt-8 print-sheet">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium">Review</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOnlyIncorrect(false)}
                aria-pressed={!onlyIncorrect}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[11px]",
                  !onlyIncorrect ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground",
                )}
              >
                All {questions.length}
              </button>
              <button
                type="button"
                onClick={() => setOnlyIncorrect(true)}
                aria-pressed={onlyIncorrect}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[11px]",
                  onlyIncorrect ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground",
                )}
              >
                Missed {incorrect.length}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIndex(Math.max(0, safeIndex - 1))}
              disabled={safeIndex === 0}
              className="press inline-flex h-9 items-center gap-1.5 rounded-full border border-border-strong px-4 text-xs disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setIndex(Math.min(reviewSet.length - 1, safeIndex + 1))}
              disabled={safeIndex >= reviewSet.length - 1}
              className="press inline-flex h-9 items-center gap-1.5 rounded-full border border-border-strong px-4 text-xs disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="font-mono text-[11px] text-muted-foreground" aria-live="polite">
              {safeIndex + 1} / {reviewSet.length}
            </span>
            <span className="ms-auto flex items-center gap-3 text-[11px] text-foreground">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-success" aria-hidden="true" />
                {questions.length - incorrect.length} correct
              </span>
              <span className="inline-flex items-center gap-1">
                <XCircle className="h-3 w-3 text-destructive" aria-hidden="true" />
                {incorrect.length} to revisit
              </span>
            </span>
          </div>

          {question ? (
            <div className="mt-4">
              <QuestionView
                question={question}
                order={session.manifest.optionOrder[question.id] ?? question.options.map((option) => option.id)}
                value={session.answers[question.id] ?? []}
                onChange={() => undefined}
                revealed
                locked
                index={safeIndex}
                total={reviewSet.length}
                sources={SOURCE_BY_ID}
                caseStudy={question.caseStudyId ? CASE_BY_ID.get(question.caseStudyId) ?? null : null}
                bookmarked={false}
                flagged={false}
                onToggleBookmark={() => undefined}
                onToggleFlag={() => undefined}
                packTitle={PACK_BY_KEY.get(question.pack)?.title ?? question.pack}
                videoHref={
                  question.sourceVideoUrl ??
                  (PACK_BY_KEY.get(question.pack)?.video?.id
                    ? videoUrl(PACK_BY_KEY.get(question.pack)!.video!.id, question.videoSeconds)
                    : null)
                }
              />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-border bg-card/40 p-6 text-center">
          <p className="text-sm font-medium">Every question in this session was correct.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Widen the scope on the next session, or revisit the objective coverage on the hub.
          </p>
          <Link
            href="/lab/dp-600/"
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-full border border-border-strong px-4 text-xs hover:bg-card"
          >
            <ArrowLeft className="h-3 w-3" aria-hidden="true" />
            Back to the hub
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-card/30 p-4 text-[11px] leading-6 text-muted-foreground">
        <p className="font-medium text-foreground">What this score does and does not mean</p>
        <p className="mt-1">
          It measures how you answered <em>these</em> questions in this session. It is not a
          predicted DP-600 score, and the question mix is not weighted to the published exam
          domains — the bank itself is not balanced that way. Progress is stored in this browser
          only; nothing is uploaded.
        </p>
      </div>
    </div>
  );
}
