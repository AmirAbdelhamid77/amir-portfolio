"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Flag,
  ListChecks,
  Play,
  Printer,
  RotateCcw,
  Timer,
  Trophy,
  XCircle,
} from "lucide-react";
import type { Exam, Question } from "@/lib/exams";
import { TOPIC_META } from "@/lib/exams";
import { saveLabResult, useLabStore } from "@/lib/lab-storage";
import { cn } from "@/lib/utils";

type Mode = "practice" | "mock";
type Phase = "intro" | "run" | "results";
type Response = number | number[] | boolean | string | undefined;
type AnswerMap = Record<string, Response>;

function normalizeNumeric(value: Response) {
  const parsed = typeof value === "string" ? Number(value.trim()) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
}

function isCorrect(question: Question, response: Response) {
  if (response === undefined) return false;
  switch (question.type) {
    case "single":
      return response === question.answer;
    case "boolean":
      return response === question.answer;
    case "multi": {
      if (!Array.isArray(response)) return false;
      const given = [...response].sort((a, b) => a - b);
      const expected = [...question.answer].sort((a, b) => a - b);
      return (
        given.length === expected.length &&
        given.every((value, index) => value === expected[index])
      );
    }
    case "numeric": {
      const parsed = normalizeNumeric(response);
      if (parsed === null) return false;
      return Math.abs(parsed - question.answer) <= (question.tolerance ?? 0) + 1e-9;
    }
  }
}

function answerText(question: Question, response: Response) {
  switch (question.type) {
    case "single":
      return typeof response === "number"
        ? (question.options[response] ?? "No answer")
        : "No answer";
    case "boolean":
      return typeof response === "boolean" ? (response ? "True" : "False") : "No answer";
    case "multi":
      return Array.isArray(response) && response.length
        ? response.map((index) => question.options[index]).join(" · ")
        : "No answer";
    case "numeric":
      return response === undefined || response === ""
        ? "No answer"
        : `${response}${question.unit ? ` ${question.unit}` : ""}`;
  }
}

function correctText(question: Question) {
  switch (question.type) {
    case "single":
      return question.options[question.answer];
    case "boolean":
      return question.answer ? "True" : "False";
    case "multi":
      return question.answer.map((index) => question.options[index]).join(" · ");
    case "numeric":
      return `${question.answer}${question.unit ? ` ${question.unit}` : ""}`;
  }
}

function formatClock(seconds: number) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function ExamPlayer({ exam }: { exam: Exam }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [mode, setMode] = useState<Mode>("practice");
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(exam.questions);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [remaining, setRemaining] = useState(exam.durationMinutes * 60);
  const [elapsed, setElapsed] = useState(0);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [drill, setDrill] = useState(false);
  const store = useLabStore();
  const record = store[exam.slug];
  const best = record?.best ?? null;
  const attempts = record?.attempts ?? 0;
  const startedAt = useRef<number>(0);
  const topRef = useRef<HTMLDivElement>(null);

  const question = activeQuestions[index];
  const total = activeQuestions.length;
  const answeredCount = activeQuestions.filter(
    (item) => answers[item.id] !== undefined && answers[item.id] !== "",
  ).length;
  const isChecked = question ? Boolean(checked[question.id]) : false;

  const score = useMemo(
    () =>
      activeQuestions.reduce(
        (sum, item) => sum + (isCorrect(item, answers[item.id]) ? 1 : 0),
        0,
      ),
    [activeQuestions, answers],
  );
  const percent = total ? Math.round((score / total) * 100) : 0;
  const passed = percent >= exam.passMark;
  // "Retry incorrect" runs a subset of the bank, so its score is a drill, not a
  // comparable attempt. The results screen says so and nothing is saved.
  const isDrill = drill;

  const topicStats = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>();
    for (const item of activeQuestions) {
      const current = map.get(item.topic) ?? { correct: 0, total: 0 };
      current.total += 1;
      if (isCorrect(item, answers[item.id])) current.correct += 1;
      map.set(item.topic, current);
    }
    return [...map.entries()];
  }, [activeQuestions, answers]);

  useEffect(() => {
    if (phase !== "run" || mode !== "mock") return;
    const id = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, mode]);

  const finish = useCallback(
    (auto = false) => {
      setAutoSubmitted(auto);
      setElapsed(Math.round((Date.now() - startedAt.current) / 1000));
      setPhase("results");
      setConfirming(false);
      // A retry of only the missed questions is a drill, not a scored attempt,
      // so it must not overwrite the personal best.
      if (!drill) {
        saveLabResult(exam.slug, {
          best: Math.max(best ?? 0, percent),
          attempts: attempts + 1,
          lastAt: new Date().toISOString(),
        });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [attempts, best, drill, exam, percent],
  );

  useEffect(() => {
    // The timer is the external clock; submitting when it reaches zero is the
    // intended synchronisation, not a state mirror.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (phase === "run" && mode === "mock" && remaining === 0) finish(true);
  }, [phase, mode, remaining, finish]);

  function start(nextMode: Mode, questions?: Question[]) {
    setMode(nextMode);
    setActiveQuestions(questions ?? exam.questions);
    setDrill(Boolean(questions));
    setAnswers({});
    setChecked({});
    setFlags(new Set());
    setIndex(0);
    setConfirming(false);
    setAutoSubmitted(false);
    setRemaining(exam.durationMinutes * 60);
    setElapsed(0);
    startedAt.current = Date.now();
    setPhase("run");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function go(nextIndex: number) {
    setConfirming(false);
    setIndex(Math.max(0, Math.min(total - 1, nextIndex)));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function choose(value: Response) {
    if (!question) return;
    if (mode === "practice" && isChecked) return;
    setAnswers((current) => {
      if (question.type === "multi") {
        const existing = Array.isArray(current[question.id])
          ? (current[question.id] as number[])
          : [];
        const next = existing.includes(value as number)
          ? existing.filter((item) => item !== value)
          : [...existing, value as number];
        return { ...current, [question.id]: next.sort((a, b) => a - b) };
      }
      return { ...current, [question.id]: value };
    });
  }

  function toggleFlag() {
    if (!question) return;
    setFlags((current) => {
      const next = new Set(current);
      if (next.has(question.id)) next.delete(question.id);
      else next.add(question.id);
      return next;
    });
  }

  const incorrect = activeQuestions.filter(
    (item) => !isCorrect(item, answers[item.id]),
  );

  const announcement =
    phase === "run" && mode === "mock"
      ? remaining === 300
        ? "Five minutes remaining."
        : remaining === 120
          ? "Two minutes remaining."
          : remaining === 60
            ? "One minute remaining."
            : remaining === 30
              ? "Thirty seconds remaining."
              : ""
      : "";

  if (phase === "intro") {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl border border-border bg-card/60 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
              {exam.topic}
            </span>
            <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {exam.level}
            </span>
            <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {exam.questions.length} questions
            </span>
          </div>

          <h2 className="mt-5 text-2xl font-medium tracking-tight sm:text-3xl">
            Choose how you want to practise
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
            Practice gives you the explanation after every question. Mock exam
            hides feedback until you submit, and the clock is running.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Exam mode">
            <button
              type="button"
              role="radio"
              aria-checked={mode === "practice"}
              onClick={() => setMode("practice")}
              className={cn(
                "rounded-2xl border p-4 text-left transition-colors",
                mode === "practice"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-border-strong",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <ListChecks className="h-4 w-4 text-primary" aria-hidden="true" />
                Practice
              </span>
              <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                Untimed. Check each answer, read why, then move on.
              </span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={mode === "mock"}
              onClick={() => setMode("mock")}
              className={cn(
                "rounded-2xl border p-4 text-left transition-colors",
                mode === "mock"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-border-strong",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Timer className="h-4 w-4 text-primary" aria-hidden="true" />
                Mock exam
              </span>
              <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                {exam.durationMinutes} minutes. Flag questions, submit, then review everything.
              </span>
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => start(mode)}
              className="press inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Start {mode === "practice" ? "practice" : "mock exam"}
            </button>
            <span className="text-xs text-muted-foreground">
              Pass mark {exam.passMark}% · no account needed
            </span>
          </div>
        </div>

        <aside className="rounded-3xl border border-border bg-card/40 p-6">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Your record
          </h3>
          <div className="mt-4 flex items-end gap-3">
            <p className="font-mono text-4xl font-medium tracking-tight">
              {best === null ? "—" : `${best}%`}
            </p>
            <p className="pb-1 text-xs text-muted-foreground">
              {attempts === 0
                ? "No attempts yet"
                : `${attempts} attempt${attempts === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-foreground/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-violet"
              style={{ width: `${best ?? 0}%` }}
            />
          </div>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            Results are stored in this browser only. Clearing site data removes
            them.
          </p>
          <div className="mt-5 grid gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <p className="flex justify-between">
              <span>Questions</span>
              <span className="font-mono text-foreground">{exam.questions.length}</span>
            </p>
            <p className="flex justify-between">
              <span>Time limit</span>
              <span className="font-mono text-foreground">{exam.durationMinutes} min</span>
            </p>
            <p className="flex justify-between">
              <span>Pass mark</span>
              <span className="font-mono text-foreground">{exam.passMark}%</span>
            </p>
          </div>
        </aside>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-border bg-card/60 p-6 sm:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {autoSubmitted
                ? "Time expired — auto-submitted"
                : isDrill
                  ? "Drill result — not scored"
                  : "Result"}
            </p>
            <div className="mt-2 flex items-end gap-3">
              <p className="text-5xl font-medium tracking-tight">{percent}%</p>
              <p
                className={cn(
                  "mb-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                  isDrill
                    ? "border border-border text-muted-foreground"
                    : passed
                      ? "bg-success/15 text-success"
                      : "bg-destructive/10 text-destructive",
                )}
              >
                {isDrill ? "Drill · not saved" : passed ? "Pass" : "Below pass mark"}
              </p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {score} of {total} correct
              {isDrill
                ? " — retries of missed questions never replace your personal best"
                : ` · pass mark ${exam.passMark}%`}
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-foreground/5">
              <div
                className={cn(
                  "h-full rounded-full",
                  passed
                    ? "bg-gradient-to-r from-success to-accent"
                    : "bg-destructive",
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/60 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Time
            </p>
            <p className="mt-2 font-mono text-3xl tracking-tight">
              {formatClock(elapsed)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {mode === "mock" ? "of " + exam.durationMinutes + " minutes" : "practice mode"}
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card/60 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Personal best
            </p>
            <p className="mt-2 flex items-center gap-2 font-mono text-3xl tracking-tight">
              <Trophy className="h-5 w-5 text-warning" aria-hidden="true" />
              {best === null ? "—" : `${best}%`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {attempts} attempt{attempts === 1 ? "" : "s"} saved locally
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-card/40 p-6">
          <h2 className="text-lg font-medium">Topic breakdown</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topicStats.map(([topic, stat]) => {
              const ratio = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={topic} className="rounded-2xl border border-border bg-background/60 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{topic}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {stat.correct}/{stat.total}
                    </p>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/5">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        ratio >= 70 ? "bg-success" : "bg-warning",
                      )}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 no-print">
          {incorrect.length > 0 ? (
            <button
              type="button"
              onClick={() => start("practice", incorrect)}
              className="press inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Retry {incorrect.length} incorrect
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => start(mode)}
            className="press inline-flex h-10 items-center gap-2 rounded-full border border-border-strong px-5 text-sm hover:bg-card"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Retake
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
            href="/lab"
            className="press inline-flex h-10 items-center gap-2 rounded-full border border-border-strong px-5 text-sm hover:bg-card"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All exams
          </Link>
        </div>

        <div className="mt-8 space-y-3">
          <h2 className="text-lg font-medium">Review</h2>
          {activeQuestions.map((item, itemIndex) => {
            const response = answers[item.id];
            const correct = isCorrect(item, response);
            return (
              <details
                key={item.id}
                className="group rounded-2xl border border-border bg-card/40 open:bg-card/60"
                open={!correct}
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4 text-sm">
                  {correct ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
                  )}
                  <span className="font-mono text-xs text-muted-foreground">
                    Q{itemIndex + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.topic}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                      correct
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive",
                    )}
                  >
                    {correct ? "Correct" : "Review"}
                  </span>
                </summary>
                <div className="border-t border-border px-4 py-4 text-sm">
                  <p className="whitespace-pre-line font-medium leading-6 text-foreground">
                    {item.prompt}
                  </p>
                  <dl className="mt-3 grid gap-1.5 text-xs">
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-muted-foreground">Your answer</dt>
                      <dd className={correct ? "text-success" : "text-destructive"}>
                        {answerText(item, response)}
                      </dd>
                    </div>
                    {!correct ? (
                      <div className="flex gap-2">
                        <dt className="w-24 shrink-0 text-muted-foreground">Correct</dt>
                        <dd className="text-foreground">{correctText(item)}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <p className="mt-3 rounded-xl bg-background/70 p-3 text-xs leading-6 text-muted-foreground">
                    {item.explanation}
                  </p>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    );
  }

  if (!question) return null;

  const modeTopic = TOPIC_META[exam.topic];
  const options =
    question.type === "boolean"
      ? ["True", "False"]
      : question.type === "numeric"
        ? []
        : question.options;

  const selected = answers[question.id];
  const selectedArray = Array.isArray(selected) ? selected : [];

  return (
    <div ref={topRef} className="scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
              modeTopic?.ring ?? "bg-card text-foreground",
            )}
          >
            {exam.topic}
          </span>
          <span>
            Question <span className="font-mono text-foreground">{index + 1}</span> of{" "}
            {total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {mode === "mock" ? (
            <span
              role="timer"
              aria-label="Time remaining"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs tabular-nums",
                remaining <= 60
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-border bg-card text-foreground",
              )}
            >
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {formatClock(remaining)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Practice
            </span>
          )}
          <button
            type="button"
            onClick={toggleFlag}
            aria-pressed={flags.has(question.id)}
            className={cn(
              "press inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs",
              flags.has(question.id)
                ? "border-warning/40 bg-warning/10 text-warning"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            <Flag
              className={cn("h-3.5 w-3.5", flags.has(question.id) && "fill-current")}
              aria-hidden="true"
            />
            {flags.has(question.id) ? "Flagged" : "Flag"}
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-violet transition-[width] duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_240px]">
        <div className="rounded-3xl border border-border bg-card/60 p-5 sm:p-7">
          <h2
            className={cn(
              "text-lg font-medium leading-8 text-foreground sm:text-xl",
              question.prompt.includes("\n") && "whitespace-pre-line font-mono text-base leading-8",
            )}
          >
            {question.prompt}
          </h2>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {question.type === "multi"
              ? "Select all that apply"
              : question.type === "numeric"
                ? "Enter a number"
                : "Select one answer"}
          </p>

          {question.type === "numeric" ? (
            <div className="mt-5">
              <label
                htmlFor={`answer-${question.id}`}
                className="text-xs text-muted-foreground"
              >
                Answer
                {question.unit ? ` (${question.unit})` : ""}
              </label>
              <input
                id={`answer-${question.id}`}
                type="number"
                inputMode="decimal"
                step="any"
                value={typeof selected === "string" ? selected : ""}
                disabled={mode === "practice" && isChecked}
                onChange={(event) => choose(event.target.value)}
                className="mt-1.5 h-11 w-full max-w-xs rounded-xl border border-border-strong bg-background px-3 font-mono text-sm outline-none focus:border-primary disabled:opacity-60"
              />
            </div>
          ) : (
            <div
              className="mt-4 grid gap-2"
              role={question.type === "multi" ? "group" : "radiogroup"}
              aria-label="Answer options"
            >
              {options.map((option, optionIndex) => {
                const value = question.type === "boolean" ? optionIndex === 0 : optionIndex;
                const isSelected =
                  question.type === "multi"
                    ? selectedArray.includes(optionIndex)
                    : selected === value;
                const isCorrectOption =
                  question.type === "multi"
                    ? question.answer.includes(optionIndex)
                    : isCorrect(question, value);
                const showCorrect = mode === "practice" && isChecked && isCorrectOption;
                const showWrong =
                  mode === "practice" && isChecked && isSelected && !isCorrectOption;

                return (
                  <label
                    key={option}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 text-sm transition-colors sm:p-4",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-border-strong",
                      showCorrect && "border-success bg-success/5",
                      showWrong && "border-destructive bg-destructive/5",
                      mode === "practice" && isChecked && "cursor-default",
                      "has-[:focus-visible]:border-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/25",
                    )}
                  >
                    <input
                      type={question.type === "multi" ? "checkbox" : "radio"}
                      name={question.id}
                      checked={isSelected}
                      disabled={mode === "practice" && isChecked}
                      onChange={() => choose(value)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border text-[10px] font-medium",
                        question.type === "multi" ? "rounded-md" : "rounded-full",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border-strong text-muted-foreground",
                        showCorrect && "border-success bg-success text-white",
                        showWrong && "border-destructive bg-destructive text-white",
                      )}
                    >
                      {showCorrect ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : showWrong ? (
                        <XCircle className="h-3.5 w-3.5" />
                      ) : (
                        String.fromCharCode(65 + optionIndex)
                      )}
                    </span>
                    <span className="leading-6">{option}</span>
                  </label>
                );
              })}
            </div>
          )}

          {mode === "practice" && isChecked ? (
            <div
              aria-live="polite"
              className={cn(
                "mt-5 rounded-2xl border p-4 text-sm",
                isCorrect(question, selected)
                  ? "border-success/30 bg-success/5"
                  : "border-destructive/30 bg-destructive/5",
              )}
            >
              <p className="flex items-center gap-2 font-medium">
                {isCorrect(question, selected) ? (
                  <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                )}
                {isCorrect(question, selected) ? "Correct" : "Not quite"}
              </p>
              {!isCorrect(question, selected) ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Correct answer: <span className="text-foreground">{correctText(question)}</span>
                </p>
              ) : null}
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                {question.explanation}
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-5">
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              className="press inline-flex h-10 items-center gap-1.5 rounded-full border border-border-strong px-4 text-sm disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </button>

            {mode === "practice" && !isChecked ? (
              <button
                type="button"
                onClick={() => setChecked((current) => ({ ...current, [question.id]: true }))}
                disabled={
                  selected === undefined ||
                  selected === "" ||
                  (Array.isArray(selected) && selected.length === 0)
                }
                className="press inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-40"
              >
                Check answer
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  index === total - 1 ? finish() : go(index + 1)
                }
                className="press inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {index === total - 1 ? "See results" : "Next"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}

            {mode === "practice" && isChecked && index < total - 1 ? (
              <span className="ml-1 text-[11px] text-muted-foreground">
                {index + 1} of {total} checked
              </span>
            ) : null}

            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="ml-auto text-xs text-muted-foreground underline decoration-border-strong underline-offset-4 hover:text-foreground"
            >
              Finish now
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-card/40 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Navigator
            </p>
            <div className="mt-3 grid grid-cols-6 gap-1.5 lg:grid-cols-5">
              {activeQuestions.map((item, itemIndex) => {
                const answered =
                  answers[item.id] !== undefined && answers[item.id] !== "";
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(itemIndex)}
                    aria-label={`Question ${itemIndex + 1}${answered ? ", answered" : ""}${
                      flags.has(item.id) ? ", flagged" : ""
                    }`}
                    aria-current={itemIndex === index ? "step" : undefined}
                    className={cn(
                      "relative flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-[11px] transition-colors",
                      itemIndex === index
                        ? "border-primary bg-primary text-primary-foreground"
                        : answered
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-border-strong",
                    )}
                  >
                    {itemIndex + 1}
                    {flags.has(item.id) ? (
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
              <span className="font-mono text-foreground">{flags.size}</span>
            </p>
          </div>

          {mode === "mock" || confirming ? (
            <div className="rounded-3xl border border-border bg-card/40 p-4">
              {confirming ? (
                <div role="alertdialog" aria-label="Confirm submission">
                  <p className="text-xs leading-5 text-muted-foreground">
                    {total - answeredCount > 0
                      ? `${total - answeredCount} question${
                          total - answeredCount === 1 ? " is" : "s are"
                        } unanswered. ${mode === "mock" ? "Submit" : "Finish"} anyway?`
                      : mode === "mock"
                        ? "Submit your exam?"
                        : "Finish and see your results?"}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => finish()}
                      className="press inline-flex h-9 flex-1 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
                    >
                      {mode === "mock" ? "Submit" : "Finish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      className="press inline-flex h-9 flex-1 items-center justify-center rounded-full border border-border-strong text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="press inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-foreground text-xs font-medium text-background hover:bg-foreground/90"
                >
                  <ListChecks className="h-4 w-4" aria-hidden="true" />
                  Submit exam
                </button>
              )}
            </div>
          ) : null}

          <p className="px-1 text-[11px] leading-5 text-muted-foreground">
            Keyboard: use Tab to move between options. Explanations appear after
            you check an answer.
          </p>
        </aside>
      </div>
    </div>
  );
}
