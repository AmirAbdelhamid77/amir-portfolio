"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { PRACTICE_QUESTIONS } from "@/lib/data-viz/practice";
import { ToggleChip } from "@/components/data-viz/lab-ui";
import { cn } from "@/lib/utils";

const CHAPTERS = Array.from(new Set(PRACTICE_QUESTIONS.map((question) => question.chapter))).sort();

export function PracticeBank() {
  const [chapter, setChapter] = useState<string>("all");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const visible = useMemo(
    () =>
      chapter === "all"
        ? PRACTICE_QUESTIONS
        : PRACTICE_QUESTIONS.filter((question) => question.chapter === chapter),
    [chapter],
  );

  const checkedQuestions = PRACTICE_QUESTIONS.filter((question) => checked[question.id]);
  const correct = checkedQuestions.filter(
    (question) => answers[question.id] === question.answer,
  ).length;

  const choose = (id: string, index: number) => {
    setAnswers((current) => ({ ...current, [id]: index }));
    setChecked((current) => {
      if (!current[id]) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const reset = () => {
    setAnswers({});
    setChecked({});
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/40 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="me-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Chapter
          </span>
          <ToggleChip pressed={chapter === "all"} onClick={() => setChapter("all")}>
            All
          </ToggleChip>
          {CHAPTERS.map((number) => (
            <ToggleChip key={number} pressed={chapter === number} onClick={() => setChapter(number)}>
              {number}
            </ToggleChip>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground" aria-live="polite">
            {checkedQuestions.length === 0
              ? `${PRACTICE_QUESTIONS.length} questions`
              : `${correct} / ${checkedQuestions.length} correct`}
          </span>
          <button
            type="button"
            onClick={reset}
            disabled={!Object.keys(answers).length}
            className="press inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[11px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      <ol className="space-y-4">
        {visible.map((question, index) => {
          const selected = answers[question.id];
          const isChecked = Boolean(checked[question.id]);
          const isCorrect = selected === question.answer;
          const number = String(PRACTICE_QUESTIONS.indexOf(question) + 1).padStart(2, "0");

          return (
            <li
              key={question.id}
              id={question.id}
              className="scroll-mt-24 rounded-3xl border border-border bg-card/30 p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Question {number} · Chapter {question.chapter}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {index + 1} of {visible.length}
                </span>
              </div>

              <fieldset className="mt-3">
                <legend className="text-sm font-medium leading-7 text-foreground">
                  {question.prompt}
                </legend>

                <div className="mt-3 grid gap-2">
                  {question.options.map((option, optionIndex) => {
                    const chosen = selected === optionIndex;
                    const revealCorrect = isChecked && optionIndex === question.answer;
                    const revealWrong = isChecked && chosen && optionIndex !== question.answer;
                    return (
                      <label
                        key={optionIndex}
                        className={cn(
                          "flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 text-xs leading-6 transition-colors",
                          revealCorrect
                            ? "border-emerald-500/40 bg-emerald-500/[0.07]"
                            : revealWrong
                              ? "border-rose-500/40 bg-rose-500/[0.07]"
                              : chosen
                                ? "border-foreground/40 bg-background"
                                : "border-border bg-background/60 hover:border-border-strong",
                        )}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={optionIndex}
                          checked={chosen}
                          onChange={() => choose(question.id, optionIndex)}
                          className="mt-1 h-3.5 w-3.5 accent-foreground"
                        />
                        <span className="flex-1 text-muted-foreground">
                          <span className={cn("font-mono text-[10px]", chosen && "text-foreground")}>
                            {String.fromCharCode(65 + optionIndex)}
                          </span>{" "}
                          <span className={cn(chosen && "text-foreground")}>{option}</span>
                        </span>
                        {revealCorrect ? (
                          <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        ) : null}
                        {revealWrong ? (
                          <X className="mt-1 h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                        ) : null}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setChecked((current) => ({ ...current, [question.id]: true }))}
                  disabled={selected === undefined || isChecked}
                  className="press inline-flex h-8 items-center gap-1.5 rounded-full bg-foreground px-3.5 text-[11px] font-medium text-background disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Check answer
                </button>
                {isChecked ? (
                  <span
                    aria-live="polite"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
                      isCorrect
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300",
                    )}
                  >
                    {isCorrect ? (
                      <Check className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <X className="h-3 w-3" aria-hidden="true" />
                    )}
                    {isCorrect ? "Correct" : "Not yet"}
                  </span>
                ) : null}
              </div>

              {isChecked ? (
                <div className="mt-3 rounded-xl border border-border bg-background/70 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Why
                  </p>
                  <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                    {question.explanation}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link
                      href={question.chapterHref}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground hover:underline hover:decoration-border-strong hover:underline-offset-4"
                    >
                      Read the chapter
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                    {question.lab ? (
                      <Link
                        href={question.lab.href}
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground hover:underline hover:decoration-border-strong hover:underline-offset-4"
                      >
                        {question.lab.label}
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="rounded-2xl border border-border bg-card/30 p-4 text-xs leading-6 text-muted-foreground">
        The questions reward a trade-off, not a definition. If two answers look
        defensible, the difference is usually in what the chart cannot show — read the
        explanation for the failure mode being accepted.
      </p>
    </div>
  );
}
