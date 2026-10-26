"use client";

// The one runner behind guided study, topic practice, mock exams, case-study
// practice and mistake review. Mode changes the feedback timing and the timer,
// never the scoring: one `grade()` implementation for all of them.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  ListChecks,
  Loader2,
  Play,
  RotateCcw,
  Send,
  Timer,
} from "lucide-react";
import { QuestionView } from "@/components/fabric/question-view";
import { SessionResults } from "@/components/fabric/session-results";
import { SessionSetup, type SetupField } from "@/components/fabric/session-setup";
import { Callout } from "@/components/fabric/ui";
import {
  buildManifest,
  formatClock,
  gradeSession,
  optionOrderFor,
  secondsRemaining,
  selectQuestionIds,
  type FabricMode,
  type SessionConfig,
  type StatusFilter,
} from "@/lib/fabric/engine";
import {
  getSession,
  learnerFromStore,
  recordResult,
  saveSession,
  useFabricStore,
  toggleBookmark as persistBookmark,
  toggleFlag as persistFlag,
  type StoredSession,
} from "@/lib/fabric/storage";
import {
  CASE_BY_ID,
  PACK_BY_KEY,
  SOURCE_BY_ID,
  loadIndex,
  loadQuestions,
  objectiveLabel,
  packLabel,
  subjectLabel,
  videoUrl,
} from "@/lib/fabric/data";
import type {
  FabricCaseStudy,
  FabricIndexEntry,
  FabricQuestion,
  Scope,
} from "@/lib/fabric/types";
import { cn } from "@/lib/utils";

type Phase = "setup" | "loading" | "running" | "results";

export interface SessionRunnerProps {
  mode: FabricMode;
  title: string;
  intro: string;
  fields: SetupField[];
  startLabel: string;
  defaultCount?: number;
  countOptions?: number[];
  defaultScopes?: Scope[];
  defaultStatus?: StatusFilter;
  caseStudies?: FabricCaseStudy[];
  footnote?: string;
}

export function SessionRunner({
  mode,
  title,
  intro,
  fields,
  startLabel,
  defaultCount = 10,
  countOptions,
  defaultScopes = ["core"],
  defaultStatus = "all",
  caseStudies,
  footnote,
}: SessionRunnerProps) {
  const store = useFabricStore();
  const learner = useMemo(() => learnerFromStore(store.store), [store.store]);

  const [entries, setEntries] = useState<FabricIndexEntry[] | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [session, setSession] = useState<StoredSession | null>(null);
  const [questions, setQuestions] = useState<FabricQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const latest = useRef<StoredSession | null>(null);
  const submitted = useRef(false);
  const hydrated = useRef<string | null>(null);

  const entryById = useMemo(() => new Map((entries ?? []).map((entry) => [entry.id, entry])), [entries]);
  const packsByQuestion = useMemo(
    () => new Map((entries ?? []).map((entry) => [entry.id, entry.pack])),
    [entries],
  );

  // ---- data -----------------------------------------------------------------
  useEffect(() => {
    let alive = true;
    loadIndex()
      .then((list) => {
        if (alive) setEntries(list);
      })
      .catch(() => {
        if (alive) setError("The question index failed to load. Reload the page to try again.");
      });
    return () => {
      alive = false;
    };
  }, []);

  const caseCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of entries ?? []) {
      if (!entry.caseStudyId) continue;
      map.set(entry.caseStudyId, (map.get(entry.caseStudyId) ?? 0) + 1);
    }
    return map;
  }, [entries]);

  // ---- persistence ----------------------------------------------------------
  // Written immediately rather than debounced: a refresh a few hundred
  // milliseconds after answering must not lose the answer, and the payload is a
  // few kilobytes.
  const persist = useCallback((next: StoredSession) => {
    latest.current = next;
    setSession(next);
    saveSession({ ...next, updatedAt: new Date().toISOString() });
  }, []);

  useEffect(() => {
    const flush = () => {
      if (latest.current) saveSession({ ...latest.current, updatedAt: new Date().toISOString() });
    };
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, []);

  // ---- hydrate a stored session (refresh, back/forward, shared link) --------
  const hydrate = useCallback(
    async (stored: StoredSession) => {
      setBusy(true);
      setError(null);
      try {
        const loaded = await loadQuestions(stored.manifest.questionIds, packsByQuestion);
        if (loaded.length === 0) throw new Error("no questions");
        // Older sessions may predate sequence seeding; fill without touching answers.
        const answers = { ...stored.answers };
        for (const question of loaded) {
          if (question.type === "sequence" && !answers[question.id]) {
            answers[question.id] = stored.manifest.optionOrder[question.id] ?? question.options.map((option) => option.id);
          }
        }
        const next = { ...stored, answers };
        latest.current = next;
        submitted.current = next.status === "completed";
        setSession(next);
        setQuestions(loaded);
        setPhase(next.status === "completed" && next.result ? "results" : "running");
      } catch {
        setError("That saved session could not be restored. Starting a new one keeps your progress intact.");
        setPhase("setup");
      } finally {
        setBusy(false);
      }
    },
    [packsByQuestion],
  );

  useEffect(() => {
    if (!entries) return;
    const requested = new URLSearchParams(window.location.search).get("session");
    if (!requested || hydrated.current === requested) return;
    hydrated.current = requested;
    const stored = getSession(requested);
    // Restoring state from an external system (the saved session) is exactly what
    // this effect is for; it runs once per requested id.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored && stored.manifest.questionIds.length > 0) void hydrate(stored);
  }, [entries, hydrate]);

  // ---- start ----------------------------------------------------------------
  const start = useCallback(
    async (config: SessionConfig, explicitIds?: string[]) => {
      if (!entries) return;
      setBusy(true);
      setError(null);
      setPhase("loading");
      try {
        const ids = explicitIds ?? selectQuestionIds(config, entries, learner);
        if (ids.length === 0) {
          setError("No questions matched those filters.");
          setPhase("setup");
          return;
        }
        const manifest = buildManifest(config, ids);
        const loaded = await loadQuestions(ids, packsByQuestion);
        if (loaded.length !== ids.length) throw new Error("Some questions failed to load.");
        manifest.optionOrder = optionOrderFor(loaded, config.seed, config.shuffleOptions);

        const answers: Record<string, string[]> = {};
        for (const question of loaded) {
          if (question.type === "sequence") {
            answers[question.id] = manifest.optionOrder[question.id];
          }
        }

        const stored: StoredSession = {
          id: manifest.id,
          mode,
          status: "active",
          createdAt: manifest.createdAt,
          updatedAt: new Date().toISOString(),
          manifest,
          answers,
          flags: [],
          revealed: [],
          index: 0,
          deadlineAt: config.minutes ? Date.now() + config.minutes * 60_000 : null,
          remainingSeconds: config.minutes ? config.minutes * 60 : null,
          elapsedSeconds: 0,
        };
        latest.current = stored;
        submitted.current = false;
        saveSession(stored);
        setSession(stored);
        setQuestions(loaded);
        setPhase("running");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        setError("The questions could not be loaded. Check your connection and try again.");
        setPhase("setup");
      } finally {
        setBusy(false);
      }
    },
    [entries, learner, mode, packsByQuestion],
  );

  // A retry of the missed questions keeps its own explicit list rather than
  // re-deriving a filter that might not reproduce the same set.
  const startFromIds = useCallback(
    (ids: string[], label: string) => {
      void start(
        {
          mode,
          filter: {},
          count: ids.length,
          minutes: null,
          shuffleQuestions: false,
          shuffleOptions: true,
          seed: Math.floor(Math.random() * 2 ** 31),
          label,
        },
        ids,
      );
    },
    [mode, start],
  );

  // ---- timer ----------------------------------------------------------------
  const remaining = secondsRemaining(session?.deadlineAt ?? null, now);

  useEffect(() => {
    if (phase !== "running" || !session?.deadlineAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [phase, session?.deadlineAt]);

  // ---- submit ---------------------------------------------------------------
  const submit = useCallback(
    (autoSubmitted: boolean) => {
      const current = latest.current;
      if (!current || submitted.current || questions.length === 0) return;
      submitted.current = true;

      const startedAt = Date.parse(current.createdAt) || Date.now();
      const durationSeconds = current.deadlineAt
        ? Math.max(
            0,
            (current.manifest.minutes ?? 0) * 60 - (secondsRemaining(current.deadlineAt, Date.now()) ?? 0),
          )
        : Math.max(1, Math.round((Date.now() - startedAt) / 1000));

      // Sequence questions are always answerable: the order on screen is the answer.
      const answers: Record<string, string[]> = { ...current.answers };
      for (const question of questions) {
        if (question.type === "sequence" && !answers[question.id]) {
          answers[question.id] = current.manifest.optionOrder[question.id] ?? question.options.map((option) => option.id);
        }
      }

      const result = gradeSession({
        sessionId: current.id,
        mode: current.mode,
        label: current.manifest.label,
        questions,
        entries: entryById,
        answers,
        durationSeconds,
        autoSubmitted,
        objectiveLabels: objectiveLabel,
        subjectLabels: subjectLabel,
      });

      recordResult(result, current.manifest.questionIds);
      const completed: StoredSession = {
        ...current,
        answers,
        status: "completed",
        result,
        updatedAt: new Date().toISOString(),
        deadlineAt: null,
      };
      latest.current = completed;
      saveSession(completed);
      setSession(completed);
      setConfirmSubmit(false);
      setPhase("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [entryById, questions],
  );

  useEffect(() => {
    if (phase === "running" && session?.deadlineAt && remaining === 0) submit(true);
  }, [phase, remaining, session?.deadlineAt, submit]);

  // ---- interaction ----------------------------------------------------------
  const question = session ? questionAt(session, questions) : null;
  const total = questions.length;

  const answeredCount = useMemo(() => {
    if (!session) return 0;
    return questions.filter((item) => (session.answers[item.id]?.length ?? 0) > 0).length;
  }, [questions, session]);

  const update = useCallback(
    (patch: Partial<StoredSession>) => {
      const current = latest.current;
      if (!current) return;
      persist({ ...current, ...patch, updatedAt: new Date().toISOString() });
    },
    [persist],
  );

  const go = useCallback(
    (nextIndex: number) => {
      if (!session) return;
      const clamped = Math.max(0, Math.min(total - 1, nextIndex));
      update({ index: clamped });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [session, total, update],
  );

  const withFeedback = mode !== "mock";
  const isRevealed = Boolean(question && session?.revealed.includes(question.id));

  if (phase === "setup" || phase === "loading") {
    const resumeCandidate = store.store.sessions
      ? Object.values(store.store.sessions)
          .filter((item) => item.status === "active" && item.mode === mode)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
      : undefined;

    return (
      <div className="grid gap-4">
        {title || intro ? (
          <div>
            {title ? <h2 className="text-xl font-medium tracking-tight sm:text-2xl">{title}</h2> : null}
            {intro ? (
              <p className="mt-1.5 max-w-2xl text-sm leading-7 text-muted-foreground">{intro}</p>
            ) : null}
          </div>
        ) : null}

        {resumeCandidate ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-primary/30 bg-primary/[0.05] p-4">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium">
                <RotateCcw className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                You have a session in progress
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {resumeCandidate.manifest.label} · started{" "}
                {new Date(resumeCandidate.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}{" "}
                · {Object.keys(resumeCandidate.answers).length}/{resumeCandidate.manifest.questionIds.length} answered
              </p>
            </div>
            <button
              type="button"
              onClick={() => void hydrate(resumeCandidate)}
              className="press inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-xs font-medium text-background"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              Resume session
            </button>
          </div>
        ) : null}

        {phase === "loading" || busy ? (
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/40 p-4 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading the questions for this session…
          </div>
        ) : null}

        <SessionSetup
          mode={mode}
          entries={entries}
          learner={learner}
          fields={fields}
          countOptions={countOptions}
          defaultCount={defaultCount}
          defaultScopes={defaultScopes}
          defaultStatus={defaultStatus}
          caseStudies={caseStudies}
          caseCounts={caseCounts}
          startLabel={startLabel}
          onStart={(config) => void start(config)}
          busy={busy}
          error={error}
          footnote={footnote}
        />

        <div className="rounded-2xl border border-border bg-card/30 p-4 text-[11px] leading-6 text-muted-foreground">
          <p className="font-medium text-foreground">Before you start</p>
          <p className="mt-1">
            These are independently authored practice questions, not official Microsoft exam
            content. An active session is saved in this browser, so a refresh resumes it. Clearing
            site data removes it.
          </p>
        </div>
      </div>
    );
  }

  if (phase === "results" && session?.result) {
    return (
      <SessionResults
        session={session}
        questions={questions}
        onRetryIncorrect={(ids) => startFromIds(ids, "Retry missed questions")}
        onRestart={() => {
          submitted.current = false;
          setSession(null);
          latest.current = null;
          setPhase("setup");
        }}
      />
    );
  }

  if (!session || !question) {
    return (
      <div className="rounded-3xl border border-border bg-card/40 p-6">
        <Callout tone="warning" title="This session has no questions">
          The saved session could not be matched to the current question bank. Start a new session
          — your history is unaffected.
        </Callout>
      </div>
    );
  }

  const deadlineLabel = remaining !== null ? formatClock(remaining) : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => {
              if (latest.current) saveSession({ ...latest.current, updatedAt: new Date().toISOString() });
              setPhase("setup");
            }}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" aria-hidden="true" />
            Pause &amp; exit
          </button>
          <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]">
            {session.manifest.label}
          </span>
          <span className="font-mono text-[11px]">
            {Object.keys(session.answers).length}/{total} answered
          </span>
        </div>

        <div className="flex items-center gap-2">
          {deadlineLabel ? (
            <span
              role="timer"
              aria-label="Time remaining"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs tabular-nums",
                (remaining ?? 0) <= 60
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-border bg-card",
              )}
            >
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {deadlineLabel}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <Timer className="h-3 w-3" aria-hidden="true" />
              Untimed
            </span>
          )}
          <button
            type="button"
            onClick={() => setConfirmSubmit(true)}
            className="press inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-xs font-medium text-background hover:bg-foreground/90"
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            {mode === "mock" ? "Submit exam" : "Finish"}
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {question ? `Question ${session.index + 1} of ${total}` : ""}
      </p>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-violet transition-[width] duration-300"
          style={{ width: `${((session.index + 1) / total) * 100}%` }}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_240px]">
        <div>
          <QuestionView
            question={question}
            order={session.manifest.optionOrder[question.id] ?? question.options.map((option) => option.id)}
            value={
              question.type === "sequence"
                ? (session.answers[question.id] ?? session.manifest.optionOrder[question.id] ?? [])
                : (session.answers[question.id] ?? [])
            }
            onChange={(ids) => update({ answers: { ...session.answers, [question.id]: ids } })}
            revealed={withFeedback && isRevealed}
            locked={withFeedback && isRevealed}
            index={session.index}
            total={total}
            sources={SOURCE_BY_ID}
            caseStudy={question.caseStudyId ? CASE_BY_ID.get(question.caseStudyId) ?? null : null}
            bookmarked={store.store.bookmarks.includes(question.id)}
            flagged={session.flags.includes(question.id)}
            onToggleBookmark={() => persistBookmark(question.id)}
            onToggleFlag={() => {
              persistFlag(question.id);
              update({
                flags: session.flags.includes(question.id)
                  ? session.flags.filter((id) => id !== question.id)
                  : [...session.flags, question.id],
              });
            }}
            packTitle={packLabel(question.pack)}
            videoHref={
              question.sourceVideoUrl ??
              (PACK_BY_KEY.get(question.pack)?.video?.id
                ? videoUrl(PACK_BY_KEY.get(question.pack)!.video!.id, question.videoSeconds)
                : null)
            }
          />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => go(session.index - 1)}
              disabled={session.index === 0}
              className="press inline-flex h-10 items-center gap-1.5 rounded-full border border-border-strong px-4 text-sm disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </button>

            {withFeedback && !isRevealed ? (
              <button
                type="button"
                onClick={() =>
                  update({ revealed: [...session.revealed, question.id] })
                }
                disabled={(session.answers[question.id]?.length ?? 0) === 0}
                className="press inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-40"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Check answer
              </button>
            ) : (
              <button
                type="button"
                onClick={() => (session.index === total - 1 ? setConfirmSubmit(true) : go(session.index + 1))}
                className="press inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background hover:bg-foreground/90"
              >
                {session.index === total - 1 ? "Finish" : "Next"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}

            <span className="text-[11px] text-muted-foreground">
              {session.flags.length > 0 ? `${session.flags.length} flagged` : ""}
            </span>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-card/40 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Navigator
            </p>
            <div className="mt-3 grid grid-cols-8 gap-1.5 lg:grid-cols-5">
              {questions.map((item, itemIndex) => {
                const answered = (session.answers[item.id]?.length ?? 0) > 0;
                const flagged = session.flags.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(itemIndex)}
                    aria-label={`Question ${itemIndex + 1}${answered ? ", answered" : ", unanswered"}${
                      flagged ? ", flagged" : ""
                    }`}
                    aria-current={itemIndex === session.index ? "step" : undefined}
                    className={cn(
                      "relative flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-[11px] transition-colors",
                      itemIndex === session.index
                        ? "border-foreground bg-foreground text-background"
                        : answered
                          ? "border-border bg-card text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-border-strong",
                    )}
                  >
                    {itemIndex + 1}
                    {flagged ? (
                      <span
                        aria-hidden="true"
                        className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-warning"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" /> Current
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary/30" aria-hidden="true" /> Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" /> Flagged
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/40 p-4 text-xs text-muted-foreground">
            <p className="flex justify-between">
              <span>Answered</span>
              <span className="font-mono text-foreground">
                {answeredCount}/{total}
              </span>
            </p>
            <p className="mt-1 flex justify-between">
              <span>Flagged</span>
              <span className="font-mono text-foreground">{session.flags.length}</span>
            </p>
            <p className="mt-1 flex justify-between">
              <span>Saved</span>
              <span className="font-mono text-foreground">
                {store.available ? "this browser" : "session only"}
              </span>
            </p>
          </div>

          {confirmSubmit ? (
            <div
              role="alertdialog"
              aria-label="Confirm submission"
              className="rounded-3xl border border-border bg-card/60 p-4"
            >
              <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden="true" />
                {total - answeredCount > 0
                  ? `${total - answeredCount} question${total - answeredCount === 1 ? " is" : "s are"} unanswered. Submit anyway?`
                  : "Submit this session?"}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => submit(false)}
                  className="press inline-flex h-9 flex-1 items-center justify-center rounded-full bg-foreground text-xs font-medium text-background"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmSubmit(false)}
                  className="press inline-flex h-9 flex-1 items-center justify-center rounded-full border border-border-strong text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          <p className="px-1 text-[11px] leading-5 text-muted-foreground">
            {mode === "mock"
              ? "Feedback stays hidden until you submit. The timer keeps running if you leave the page; refresh resumes from the same deadline."
              : "Explanations appear after you check an answer. Save or flag a question to find it again in Mistakes & bookmarks."}
          </p>

          {withFeedback ? (
            <Link
              href="/lab/dp-600/explore/"
              className="inline-flex items-center gap-1 px-1 text-[11px] text-muted-foreground underline decoration-border-strong underline-offset-4 hover:text-foreground"
            >
              <ListChecks className="h-3 w-3" aria-hidden="true" />
              Browse the whole bank
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function questionAt(session: StoredSession, questions: FabricQuestion[]) {
  const id = session.manifest.questionIds[session.index];
  return questions.find((question) => question.id === id) ?? questions[0] ?? null;
}
