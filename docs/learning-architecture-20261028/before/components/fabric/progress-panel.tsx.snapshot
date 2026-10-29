"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Loader2, RotateCcw, Upload } from "lucide-react";
import { AttemptedPanel } from "@/components/fabric/hub-panels";
import { Callout, DataTable, EmptyState, Meter, Panel } from "@/components/fabric/ui";
import { loadIndex } from "@/lib/fabric/data";
import {
  clearFabricStore,
  exportStore,
  importStore,
  useFabricStore,
  type ImportSummary,
} from "@/lib/fabric/storage";
import { formatClock } from "@/lib/fabric/engine";
import { SUBJECTS } from "@/lib/fabric/taxonomy";
import type { FabricIndexEntry } from "@/lib/fabric/types";

export function ProgressPanel() {
  const { store, available, recovered } = useFabricStore();
  const [index, setIndex] = useState<FabricIndexEntry[] | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    let alive = true;
    loadIndex()
      .then((entries) => {
        if (alive) setIndex(entries);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const bySubject = useMemo(() => {
    if (!index) return [];
    const rows = new Map<string, { total: number; attempted: number; correct: number }>();
    for (const entry of index) {
      const row = rows.get(entry.subject) ?? { total: 0, attempted: 0, correct: 0 };
      row.total += 1;
      const stats = store.questions[entry.id];
      if (stats?.attempts) {
        row.attempted += 1;
        if (stats.lastCorrect) row.correct += 1;
      }
      rows.set(entry.subject, row);
    }
    return SUBJECTS.map((subject) => ({
      id: subject.id,
      label: subject.label,
      ...(rows.get(subject.id) ?? { total: 0, attempted: 0, correct: 0 }),
    })).filter((row) => row.total > 0);
  }, [index, store.questions]);

  const attempted = Object.values(store.questions).filter((stats) => stats.attempts > 0).length;
  const mastered = Object.values(store.questions).filter(
    (stats) => stats.attempts > 0 && stats.lastCorrect && stats.correct >= 2,
  ).length;
  const history = [...store.history].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  const trend = history.slice(-12);

  function download() {
    const payload = JSON.stringify(exportStore(), null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    anchor.href = url;
    anchor.download = `hansa-fabric-progress-${stamp}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function upload(file: File) {
    const text = await file.text();
    setImportSummary(importStore(text));
  }

  return (
    <div className="grid gap-6">
      {!available ? (
        <Callout tone="warning" title="Storage is blocked in this browser">
          Progress cannot be saved or read. Everything still works for this visit, but nothing will
          be here when you come back. Private windows and some privacy settings cause this.
        </Callout>
      ) : null}
      {recovered ? (
        <Callout tone="warning" title="An older record was preserved, not deleted">
          A stored value did not match the current schema. It was copied to a backup key and a fresh
          namespace was started, so no attempt was destroyed by the upgrade.
        </Callout>
      ) : null}

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
        {[
          { value: `${attempted}`, label: "questions attempted", note: "of 834" },
          { value: `${mastered}`, label: "answered right twice", note: "last two correct" },
          { value: `${store.bookmarks.length}`, label: "bookmarked", note: "saved for later" },
          { value: `${history.length}`, label: "sessions completed", note: "scored and stored" },
        ].map((item) => (
          <div key={item.label} className="bg-card/70 p-4">
            <p className="font-mono text-2xl font-medium tracking-tight">{item.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{item.note}</p>
          </div>
        ))}
      </div>

      <Panel
        title="Content coverage versus your mastery"
        description="The bar is how many questions you have attempted in each objective; the note is how many of those attempts ended correct. A large bank under one objective is not evidence that you know it."
      >
        {index ? (
          <AttemptedPanel index={index} />
        ) : (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Loading the question index…
          </p>
        )}
      </Panel>

      <Panel
        title="By Fabric topic"
        description="Attempted and last-answer-correct per subject. Denominator is the number of questions that exist, not the number you have seen."
      >
        {bySubject.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-3">
              {bySubject.slice(0, 8).map((row) => (
                <Meter
                  key={row.id}
                  label={row.label}
                  value={row.attempted}
                  total={row.total}
                  note={`${row.correct} of ${row.attempted || 0} attempted answered correctly last time`}
                  tone={row.attempted === 0 ? "muted" : row.correct / Math.max(1, row.attempted) >= 0.7 ? "success" : "warning"}
                />
              ))}
            </div>
            <details open>
              <summary className="cursor-pointer text-[11px] text-muted-foreground">Table view</summary>
              <div className="mt-2">
                <DataTable
                  caption="Attempts and correctness per Fabric topic"
                  head={["Topic", "Questions", "Attempted", "Correct last time"]}
                  rows={bySubject.map((row) => [row.label, row.total, row.attempted, row.correct])}
                />
              </div>
            </details>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No subject data yet.</p>
        )}
      </Panel>

      <Panel
        title="Session trend"
        description="Every completed session, oldest to newest. A single rising line would be misleading with this few points, so each bar is one session and the exact score is printed."
      >
        {trend.length > 0 ? (
          <div>
            <ol className="flex h-32 items-end gap-2" aria-label="Score per completed session, oldest first">
              {trend.map((entry) => (
                <li key={entry.id} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                  <span className="font-mono text-[10px] text-muted-foreground">{entry.percent}%</span>
                  <div
                    className="w-full rounded-t bg-primary/70"
                    style={{ height: `${Math.max(4, entry.percent)}%` }}
                    title={`${entry.label}: ${entry.score}/${entry.total}`}
                  />
                </li>
              ))}
            </ol>
            <ol className="mt-2 grid gap-1">
              {[...trend].reverse().slice(0, 6).map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {new Date(entry.completedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}{" "}
                    · {entry.label}
                  </span>
                  <span className="shrink-0 font-mono text-foreground">
                    {entry.score}/{entry.total} · {entry.percent}% · {formatClock(entry.durationSeconds)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <EmptyState
            title="No completed sessions yet"
            description="Finish a guided study or practice session and its score appears here. Nothing is inferred or back-filled."
            action={{ href: "/lab/dp-600/study/", label: "Start guided study" }}
          />
        )}
      </Panel>

      <Panel
        title="Export and import your progress"
        description="A single JSON file with your attempts, bookmarks, flags and unfinished sessions. Importing the same file twice does not double-count: attempts are matched by session id."
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={download}
            className="press inline-flex h-10 items-center gap-2 rounded-full border border-border-strong px-4 text-xs hover:bg-card"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export progress
          </button>
          <label className="press inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-border-strong px-4 text-xs hover:bg-card">
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            Import a file
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
                event.target.value = "";
              }}
            />
          </label>
          <span className="text-[11px] text-muted-foreground">
            {store.bookmarks.length} bookmarks · {history.length} attempts · schema v
            {store.version}
          </span>
        </div>

        {importSummary ? (
          <p
            role="status"
            className={
              importSummary.ok
                ? "mt-3 rounded-xl border border-success/30 bg-success/5 p-3 text-[11px] leading-5 text-foreground"
                : "mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-[11px] leading-5 text-destructive"
            }
          >
            {importSummary.ok
              ? `Imported: ${importSummary.attemptsAdded} new attempt(s), ${importSummary.bookmarksAdded} new bookmark(s), ${importSummary.sessionsAdded} session(s). Skipped ${importSummary.attemptsSkipped} duplicate attempt(s) and ${importSummary.sessionsSkipped} existing session(s).`
              : importSummary.error}
          </p>
        ) : null}

        <div className="mt-5 border-t border-border pt-4">
          <p className="text-[11px] leading-6 text-muted-foreground">
            This data lives only in this browser, under{" "}
            <code className="rounded bg-background px-1 py-0.5 font-mono text-[10px]">amir-fabric-v1</code>.
            It is not synced to another device or account. Clearing site data, using a private
            window, or switching browsers all lose it — export first if it matters. The six general
            Data Lab exams keep their own separate history and are unaffected either way.
          </p>
          {confirmClear ? (
            <div role="alertdialog" aria-label="Confirm clearing Fabric progress" className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-[11px] leading-5 text-foreground">
                Delete every Fabric attempt, bookmark and unfinished session from this browser? A
                copy of the current record is kept under a recovery key first. This cannot be undone
                from the interface — export if you might want it back.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clearFabricStore();
                    setConfirmClear(false);
                  }}
                  className="press inline-flex h-8 items-center rounded-full bg-destructive px-3 text-[11px] font-medium text-white"
                >
                  Clear Fabric progress
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="press inline-flex h-8 items-center rounded-full border border-border-strong px-3 text-[11px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full border border-destructive/30 px-3.5 text-[11px] text-destructive hover:bg-destructive/5"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Clear Fabric progress only
            </button>
          )}
        </div>
      </Panel>

      <p className="text-[11px] leading-6 text-muted-foreground">
        Looking for the original exams? They live at{" "}
        <Link href="/lab/" className="text-foreground underline decoration-border-strong underline-offset-4">
          Data Lab
        </Link>{" "}
        with their own history, and this page never reads or writes it. Topic labels here are
        derived from each question&apos;s own wording and references, not from the author&apos;s
        metadata: {SUBJECTS.length} subjects, one primary per question.
      </p>
    </div>
  );
}
