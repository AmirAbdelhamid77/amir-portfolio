"use client";

// One question, all three supported types, with the feedback contract Hansa
// already uses (check → explanation → why each option is right or wrong) plus
// the option-level rationales and source links the imported bank provides.

import { useCallback, useId, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Flag,
  GripVertical,
  Lightbulb,
  ListOrdered,
  MinusCircle,
  XCircle,
} from "lucide-react";
import type { FabricCaseStudy, FabricQuestion, FabricSourceRef } from "@/lib/fabric/types";
import { grade } from "@/lib/fabric/engine";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<FabricQuestion["type"], string> = {
  single: "Single answer",
  multi: "Select all that apply",
  sequence: "Put in order",
};

export interface QuestionViewProps {
  question: FabricQuestion;
  order: string[];
  value: string[];
  onChange: (ids: string[]) => void;
  revealed: boolean;
  locked?: boolean;
  index: number;
  total: number;
  sources: Map<string, FabricSourceRef>;
  caseStudy: FabricCaseStudy | null;
  bookmarked: boolean;
  flagged: boolean;
  onToggleBookmark: () => void;
  onToggleFlag: () => void;
  packTitle: string;
  videoHref: string | null;
}

export function QuestionView({
  question,
  order,
  value,
  onChange,
  revealed,
  locked = false,
  index,
  total,
  sources,
  caseStudy,
  bookmarked,
  flagged,
  onToggleBookmark,
  onToggleFlag,
  packTitle,
  videoHref,
}: QuestionViewProps) {
  const groupId = useId();
  const optionById = useMemo(
    () => new Map(question.options.map((option) => [option.id, option])),
    [question.options],
  );
  const displayOptions = order
    .map((id) => optionById.get(id))
    .filter((option): option is NonNullable<typeof option> => Boolean(option));

  const result = grade(question, value);
  const showResult = revealed;

  function toggle(optionId: string) {
    if (locked) return;
    if (question.type === "single") {
      onChange([optionId]);
      return;
    }
    if (value.includes(optionId)) onChange(value.filter((id) => id !== optionId));
    else onChange([...value, optionId]);
  }

  function move(from: number, to: number) {
    if (locked) return;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <article className="rounded-3xl border border-border bg-card/60 p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono uppercase tracking-[0.14em] text-foreground">
            {question.sourceId}
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 font-mono uppercase tracking-[0.14em] text-muted-foreground">
            {packTitle}
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 font-mono uppercase tracking-[0.14em] text-muted-foreground">
            {question.topic}
          </span>
          {question.difficulty ? (
            <span className="rounded-full border border-border px-2.5 py-1 font-mono uppercase tracking-[0.14em] text-muted-foreground">
              Difficulty {question.difficulty}/5
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs text-muted-foreground">
            <span className="text-foreground">{index + 1}</span> / {total}
          </span>
          <button
            type="button"
            onClick={onToggleBookmark}
            aria-pressed={bookmarked}
            className={cn(
              "press inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] transition-colors",
              bookmarked
                ? "border-foreground/30 bg-foreground/5 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {bookmarked ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={onToggleFlag}
            aria-pressed={flagged}
            className={cn(
              "press inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] transition-colors",
              flagged
                ? "border-warning/40 bg-warning/10 text-warning"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <Flag className={cn("h-3.5 w-3.5", flagged && "fill-current")} aria-hidden="true" />
            {flagged ? "Flagged" : "Flag"}
          </button>
        </div>
      </div>

      {caseStudy ? <CaseStudyPanel caseStudy={caseStudy} /> : null}

      <h2 className="mt-5 text-base font-medium leading-7 text-foreground sm:text-lg sm:leading-8">
        {question.title}
      </h2>
      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-foreground">
        {question.prompt}
      </p>

      {question.code?.trim() ? <CodeBlock code={question.code} /> : null}

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {question.type === "multi"
          ? "Select every correct option"
          : question.type === "sequence"
            ? "Arrange into the required order"
            : "Select one answer"}
      </p>

      {question.type === "sequence" ? (
        <SequenceAnswer
          options={displayOptions}
          value={value.length ? value : order}
          order={order}
          locked={locked}
          revealed={showResult}
          correct={question.correct}
          onMove={move}
        />
      ) : (
        <div
          className="mt-3 grid gap-2"
          role={question.type === "multi" ? "group" : "radiogroup"}
          aria-labelledby={`${groupId}-legend`}
        >
          <span id={`${groupId}-legend`} className="sr-only">
            {TYPE_LABEL[question.type]}
          </span>
          {displayOptions.map((option, position) => {
            const selected = value.includes(option.id);
            const isKey = question.correct.includes(option.id);
            const showCorrect = showResult && isKey;
            const showWrong = showResult && selected && !isKey;
            const letter = String.fromCharCode(65 + position);
            return (
              <label
                key={option.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 text-sm transition-colors sm:p-4",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-border-strong",
                  showCorrect && "border-success bg-success/5",
                  showWrong && "border-destructive bg-destructive/5",
                  locked && "cursor-default",
                  "has-[:focus-visible]:border-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/25",
                )}
              >
                <input
                  type={question.type === "multi" ? "checkbox" : "radio"}
                  name={groupId}
                  checked={selected}
                  disabled={locked}
                  onChange={() => toggle(option.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border text-[10px] font-medium",
                    question.type === "multi" ? "rounded-md" : "rounded-full",
                    selected
                      ? "border-foreground bg-foreground text-background"
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
                    letter
                  )}
                </span>
                <span className="leading-6">{option.text}</span>
              </label>
            );
          })}
        </div>
      )}

      {showResult ? (
        <AnswerReview
          question={question}
          result={result}
          selected={value}
          sources={sources}
          videoHref={videoHref}
          packTitle={packTitle}
        />
      ) : null}
    </article>
  );
}

function CaseStudyPanel({ caseStudy }: { caseStudy: FabricCaseStudy }) {
  return (
    <details
      open
      className="group mt-5 rounded-2xl border border-border bg-background/70 p-4 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Case study · {caseStudy.title.replace(/^Case study\s*·\s*/i, "")}
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <p className="mt-3 whitespace-pre-line text-xs leading-6 text-muted-foreground">
        {caseStudy.text}
      </p>
    </details>
  );
}

/**
 * Code is rendered as pre-formatted text. No HTML is ever interpreted, and the
 * only colour applied is to comment lines, so a snippet cannot be mis-tokenised
 * into a misleading highlight.
 */
function CodeBlock({ code }: { code: string }) {
  const lines = code.replace(/\s+$/, "").split("\n");
  return (
    <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-background p-4 font-mono text-xs leading-6 text-foreground">
      <code>
        {lines.map((line, index) => {
          const isComment = /^\s*(--|\/\/|#)/.test(line);
          return (
            <span key={index} className={cn("block", isComment && "text-muted-foreground")}>
              {line.length ? line : " "}
            </span>
          );
        })}
      </code>
    </pre>
  );
}

function SequenceAnswer({
  options,
  value,
  order,
  locked,
  revealed,
  correct,
  onMove,
}: {
  options: { id: string; text: string }[];
  value: string[];
  order: string[];
  locked: boolean;
  revealed: boolean;
  correct: string[];
  onMove: (from: number, to: number) => void;
}) {
  const [dragging, setDragging] = useState<number | null>(null);
  const byId = useMemo(() => new Map(options.map((option) => [option.id, option])), [options]);
  const current = value.length ? value : order;

  const move = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= current.length) return;
      onMove(from, to);
    },
    [current.length, onMove],
  );

  return (
    <div className="mt-3">
      <ol className="grid gap-2" aria-label="Answer order">
        {current.map((id, position) => {
          const option = byId.get(id);
          if (!option) return null;
          const inPlace = revealed && correct[position] === id;
          return (
            <li
              key={id}
              draggable={!locked}
              onDragStart={() => setDragging(position)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragging === null || dragging === position) return;
                move(dragging, position);
                setDragging(null);
              }}
              onDragEnd={() => setDragging(null)}
              className={cn(
                "flex items-start gap-3 rounded-2xl border border-border bg-background p-3 text-sm sm:p-3.5",
                dragging === position && "opacity-60",
                revealed && (inPlace ? "border-success bg-success/5" : "border-destructive bg-destructive/5"),
              )}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-card font-mono text-[11px] text-muted-foreground">
                {position + 1}
              </span>
              <span className="min-w-0 flex-1 leading-6">{option.text}</span>
              <span className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => move(position, position - 1)}
                  disabled={locked || position === 0}
                  aria-label={`Move “${option.text.slice(0, 60)}” up`}
                  className="press flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ArrowUp className="h-3 w-3" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(position, position + 1)}
                  disabled={locked || position === current.length - 1}
                  aria-label={`Move “${option.text.slice(0, 60)}” down`}
                  className="press flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ArrowDown className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
              <GripVertical
                className="mt-0.5 hidden h-4 w-4 shrink-0 text-muted-foreground sm:block"
                aria-hidden="true"
              />
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
        Use the arrow buttons or drag the rows. The order you leave here is the
        order that gets scored.
      </p>
      {revealed ? (
        <div className="mt-3 rounded-2xl border border-border bg-card/60 p-3">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <ListOrdered className="h-3 w-3" aria-hidden="true" />
            Required order
          </p>
          <ol className="mt-2 grid gap-1 text-xs leading-6">
            {correct.map((id, position) => (
              <li key={id} className="flex gap-2">
                <span className="font-mono text-muted-foreground">{position + 1}.</span>
                <span>{byId.get(id)?.text ?? id}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

export function AnswerReview({
  question,
  result,
  selected,
  sources,
  videoHref,
  packTitle,
}: {
  question: FabricQuestion;
  result: ReturnType<typeof grade>;
  selected: string[];
  sources: Map<string, FabricSourceRef>;
  videoHref: string | null;
  packTitle: string;
}) {
  const refs = question.refs
    .map((id) => sources.get(id))
    .filter((source): source is FabricSourceRef => Boolean(source));

  return (
    <div
      aria-live="polite"
      className={cn(
        "mt-5 rounded-2xl border p-4",
        result.correct ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5",
      )}
    >
      <p className="flex items-center gap-2 text-sm font-medium">
        {result.correct ? (
          <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
        ) : (
          <XCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
        )}
        {result.correct ? "Correct" : "Not quite"}
      </p>

      {!result.correct ? (
        <div className="mt-2 grid gap-1 text-xs leading-6 text-muted-foreground">
          {question.type === "multi" && result.missing.length > 0 ? (
            <p>
              Missing from your answer:{" "}
              <span className="text-foreground">
                {result.missing.map((id) => labelFor(question, id)).join(" · ")}
              </span>
            </p>
          ) : null}
          {question.type === "multi" && result.extra.length > 0 ? (
            <p>
              Not part of the answer:{" "}
              <span className="text-foreground">
                {result.extra.map((id) => labelFor(question, id)).join(" · ")}
              </span>
            </p>
          ) : null}
          {question.type === "sequence" && result.wrongPositions.length > 0 ? (
            <p>
              Positions out of order:{" "}
              <span className="text-foreground">
                {result.wrongPositions.map((position) => position + 1).join(", ")}
              </span>
            </p>
          ) : null}
          {question.type !== "sequence" ? (
            <p>
              Correct answer:{" "}
              <span className="text-foreground">
                {question.correct.map((id) => labelFor(question, id)).join(" · ")}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="mt-3 text-xs leading-6 text-muted-foreground">{question.explanation}</p>

      <div className="mt-4">
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <Lightbulb className="h-3 w-3" aria-hidden="true" />
          Why each option does or does not fit
        </p>
        <ul className="mt-2 grid gap-2">
          {question.options.map((option) => {
            const isKey = question.correct.includes(option.id);
            const picked = selected.includes(option.id);
            const verdict = isKey && picked
              ? "Correct, and you selected it."
              : isKey
                ? "Correct, but your answer missed it."
                : picked
                  ? "Not part of the answer, but you selected it."
                  : "Not part of the answer.";
            return (
              <li
                key={option.id}
                className={cn(
                  "flex gap-2 rounded-xl border border-transparent px-2 py-1.5 text-xs leading-6",
                  isKey ? "bg-success/5" : picked ? "bg-destructive/5" : "bg-background/40",
                )}
              >
                <span className="mt-0.5 shrink-0" aria-hidden="true">
                  {isKey ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : picked ? (
                    <XCircle className="h-3.5 w-3.5 text-destructive" />
                  ) : (
                    <MinusCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </span>
                <span className="text-muted-foreground">
                  <span className="font-mono text-[10px] text-foreground">{option.id}</span>{" "}
                  <span className="text-foreground">{option.text}</span>{" "}
                  <span className="sr-only">{verdict}</span>
                  {option.why}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {refs.length > 0 || videoHref ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border pt-3 text-[11px]">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Source
          </span>
          {videoHref ? (
            <a
              href={videoHref}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-foreground underline decoration-border-strong underline-offset-4"
            >
              Video at this point
              <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
            </a>
          ) : null}
          {refs.map((ref) => (
            <a
              key={ref.id}
              href={ref.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-muted-foreground underline decoration-border-strong underline-offset-4 hover:text-foreground"
            >
              {ref.title}
              <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
            </a>
          ))}
          <span className="text-muted-foreground">
            · {packTitle}
            {question.difficulty ? ` · difficulty ${question.difficulty}/5` : ""}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function labelFor(question: FabricQuestion, optionId: string) {
  const option = question.options.find((item) => item.id === optionId);
  return option ? `${option.id} — ${option.text}` : optionId;
}

export { TYPE_LABEL };
