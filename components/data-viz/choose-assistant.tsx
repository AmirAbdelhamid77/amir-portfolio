"use client";

// The chart-decision workspace, built from the BeUI AI-interface primitives.
//
// What it is: a deterministic rule table with a conversational surface. The
// reader types in their own words; `lib/data-viz/assistant.ts` maps the words to
// the same DecisionInput the structured form uses, asks a clarifying question
// when the mapping is ambiguous, and then prints the rule it applied. There is
// no model call, no network request and no stored transcript: everything below
// is local state that disappears on reload.
//
// What the AI patterns are for: `ReasoningText` shows that the answer is being
// computed, `AgentActivity` lists the exact steps that ran, `StreamingResponse`
// reveals the answer block by block so the reader is not handed a wall of text,
// and `ApprovalCard` turns the recommendation back into a human decision.

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Bot,
  Check,
  CornerDownRight,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import type { ApprovalCardStatus } from "@/components/agents/approval-card";
import { ApprovalCard } from "@/components/agents/approval-card";
import { AgentActivity } from "@/components/agents/agent-activity";
import { Citations } from "@/components/agents/citations";
import { ReasoningText } from "@/components/agents/loading-states/reasoning-text";
import { Message, MessageAvatar, MessageContent, MessageHeader } from "@/components/agents/message";
import { PromptInput } from "@/components/agents/prompt-input";
import { StreamingResponse } from "@/components/agents/streaming-response";
import { RangeControl, Segmented, ToggleChip } from "@/components/data-viz/lab-ui";
import {
  SHAPE_LABELS,
  TASK_LABELS,
  type Shape,
  type Task,
} from "@/lib/data-viz/decision";
import {
  blockCount,
  overrideFor,
  respond,
  suggestions,
  type AssistantOverrides,
  type AssistantResponse,
} from "@/lib/data-viz/assistant";
import { cn } from "@/lib/utils";

type TurnState = "thinking" | "streaming" | "complete";

interface Turn {
  id: number;
  prompt: string;
  overrides: AssistantOverrides;
  response: AssistantResponse;
  state: TurnState;
  /** Text blocks revealed so far; keeps the reveal honest on re-render. */
  shown: number;
  /** Clarification answers the reader has given, in order. */
  answers: string[];
  approval: { status: ApprovalCardStatus; result?: string };
}

const TASK_OPTIONS = (Object.keys(TASK_LABELS) as Task[]).map((task) => ({
  value: task,
  label: TASK_LABELS[task],
}));

const SHAPE_OPTIONS = (Object.keys(SHAPE_LABELS) as Shape[]).map((shape) => ({
  value: shape,
  label: SHAPE_LABELS[shape],
}));

const REASONING_PHRASES = [
  "Reading the prompt",
  "Matching the task words",
  "Checking the data shape",
  "Applying the rule table",
];

const CITATION_SOURCES = [
  {
    id: "rules",
    title: "Chart decision rules (unit-tested)",
    domain: "hansa.local",
    url: "/explore/choose#rules",
  },
  {
    id: "core-grammar",
    title: "Core visual grammar: six chart labs",
    domain: "hansa.local",
    url: "/explore/charts",
  },
  {
    id: "integrity",
    title: "Integrity lab: seven failure modes",
    domain: "hansa.local",
    url: "/explore/integrity",
  },
  {
    id: "method",
    title: "How this library was built and verified",
    domain: "hansa.local",
    url: "/learn/method",
  },
];

/** Renders the small amount of `**bold**` markup the assistant produces. */
function InlineText({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\*\*[^*]+\*\*)/g)
        .filter(Boolean)
        .map((part, index) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={index} className="font-medium text-foreground">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <span key={index}>{part}</span>
          ),
        )}
    </>
  );
}

function ConfidencePill({ confidence }: { confidence: "high" | "medium" | "low" }) {
  const tone = {
    high: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
    medium: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
    low: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
        tone[confidence],
      )}
    >
      {confidence} confidence
    </span>
  );
}

/** The recommendation, rendered as a decision card rather than prose alone. */
function Recommendation({ response }: { response: Extract<AssistantResponse, { status: "answer" }> }) {
  const { decision } = response;
  return (
    <div className="mt-3 space-y-3">
      <div className="rounded-2xl border border-border bg-background p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Primary · rule “{decision.rule}” · match {decision.matched}
          </p>
          <ConfidencePill confidence={response.confidence} />
        </div>
        <p className="mt-2 text-sm font-medium text-foreground">{decision.primary.title}</p>
        <p className="mt-1 text-xs leading-6 text-muted-foreground">{decision.primary.reason}</p>
        {decision.primary.lab ? (
          <a
            href={decision.primary.lab}
            className="press mt-2 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            Open the {decision.primary.title.toLowerCase()} lab
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </a>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card/40 p-3">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <Check className="h-3 w-3" aria-hidden="true" />
            Defensible alternatives
          </p>
          <ul className="mt-2 space-y-2">
            {decision.alternatives.length ? (
              decision.alternatives.map((item) => (
                <li key={item.chart} className="text-[11px] leading-5 text-muted-foreground">
                  <span className="font-medium text-foreground">{item.title}</span> — {item.reason}
                </li>
              ))
            ) : (
              <li className="text-[11px] leading-5 text-muted-foreground">
                None: this rule has one clear encoding for the stated task.
              </li>
            )}
          </ul>
        </div>
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/[0.04] p-3">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-rose-700 dark:text-rose-400">
            <TriangleAlert className="h-3 w-3" aria-hidden="true" />
            Answers a different question
          </p>
          <ul className="mt-2 space-y-2">
            {decision.avoid.length ? (
              decision.avoid.map((item) => (
                <li key={item.chart} className="text-[11px] leading-5 text-muted-foreground">
                  <span className="font-medium text-foreground">{item.title}</span> — {item.reason}
                </li>
              ))
            ) : (
              <li className="text-[11px] leading-5 text-muted-foreground">
                No hard avoid for this pair; the alternatives above are still safer.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Explicit correction of the assumptions the parser made. */
function AssumptionControls({
  response,
  onChange,
  onReset,
}: {
  response: Extract<AssistantResponse, { status: "answer" }>;
  onChange: (patch: AssistantOverrides) => void;
  onReset: () => void;
}) {
  const { input } = response;
  return (
    <details className="mt-3 rounded-2xl border border-border bg-card/30">
      <summary className="cursor-pointer list-none px-3 py-2 text-[11px] text-muted-foreground">
        Correct the assumptions (same rule table, same answer path)
      </summary>
      <div className="space-y-3 border-t border-border p-3">
        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Task
          </p>
          <Segmented
            label="Analytical task"
            value={input.task}
            options={TASK_OPTIONS}
            onChange={(task) => onChange({ task })}
          />
        </div>
        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Data shape
          </p>
          <Segmented
            label="Data shape"
            value={input.shape}
            options={SHAPE_OPTIONS}
            onChange={(shape) => onChange({ shape })}
          />
        </div>
        <RangeControl
          label="Categories in the view"
          value={input.categories}
          min={2}
          max={16}
          step={1}
          onChange={(categories) => onChange({ categories })}
          display={String(input.categories)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <ToggleChip
            pressed={input.exactValues}
            onClick={() => onChange({ exactValues: !input.exactValues })}
          >
            Readers need exact values
          </ToggleChip>
          <button
            type="button"
            onClick={onReset}
            className="press inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            Back to the prompt
          </button>
        </div>
        <p className="text-[10px] leading-5 text-muted-foreground">
          Changing these controls re-runs the same rule table. The recommendation
          changes only because the stated input changed — never because the wording
          was rewritten.
        </p>
      </div>
    </details>
  );
}

function AssistantTurn({
  turn,
  reveal,
  onAnswer,
  onCorrect,
  onResetAssumptions,
  onApproval,
  onRetry,
}: {
  turn: Turn;
  reveal: number;
  onAnswer: (value: string) => void;
  onCorrect: (patch: AssistantOverrides) => void;
  onResetAssumptions: () => void;
  onApproval: (status: ApprovalCardStatus, result?: string) => void;
  onRetry: () => void;
}) {
  const { response, state } = turn;
  const settled = state === "complete";
  const streaming = state === "streaming";

  const activityItems = response.activity.map((step) => ({
    id: step.id,
    type: "step" as const,
    label: step.label,
    status: "complete" as const,
    meta: step.detail,
  }));

  const blocks =
    response.status === "answer"
      ? response.paragraphs.slice(0, reveal).map((paragraph, index) => (
          <p key={index}>
            <InlineText text={paragraph} />
          </p>
        ))
      : [
          <p key="reason">
            <InlineText text={response.reason} />
          </p>,
        ];

  const copyText =
    response.status === "answer"
      ? response.paragraphs.join("\n\n")
      : `${response.question}\n\n${response.reason}`;

  return (
    <>
      <Message from="user" animateIn>
        <MessageContent>
          <MessageHeader>You</MessageHeader>
          <p className="max-w-[92%] rounded-2xl rounded-tr-md bg-foreground px-3 py-2 text-sm leading-6 text-background">
            {turn.prompt}
          </p>
          {turn.answers.length ? (
            <ul className="flex flex-wrap justify-end gap-1.5">
              {turn.answers.map((answer, index) => (
                <li
                  key={`${answer}-${index}`}
                  className="rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground"
                >
                  {answer}
                </li>
              ))}
            </ul>
          ) : null}
        </MessageContent>
      </Message>

      <Message from="assistant" animateIn>
        <MessageAvatar>
          <Bot aria-hidden="true" />
        </MessageAvatar>
        <MessageContent className="min-w-0">
          <MessageHeader>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              Local rule table · no model
            </span>
          </MessageHeader>

          <div className="w-full max-w-[62ch] space-y-2">
            <AgentActivity
              items={activityItems}
              status={settled ? "complete" : "working"}
              defaultOpen={false}
            />

            {state === "thinking" ? (
              <div className="rounded-xl border border-border bg-background px-3 py-2">
                <ReasoningText phrases={REASONING_PHRASES} variant="cascade" interval={1100} />
              </div>
            ) : (
              <StreamingResponse
                status={streaming ? "streaming" : "complete"}
                copyText={copyText}
                onRetry={settled ? onRetry : undefined}
                sources={response.citations}
                announce={false}
              >
                {blocks}
              </StreamingResponse>
            )}

            {response.status === "clarify" && settled ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-3">
                <p className="text-sm font-medium text-foreground">{response.question}</p>
                <div role="group" aria-label={response.question} className="mt-2 flex flex-wrap gap-1.5">
                  {response.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onAnswer(option.value)}
                      className="press inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                    >
                      <CornerDownRight className="h-3 w-3" aria-hidden="true" />
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
                  Answering adds one explicit assumption; it does not rewrite your prompt.
                </p>
              </div>
            ) : null}

            {response.status === "answer" && settled ? (
              <>
                <Recommendation response={response} />

                {response.assumptions.length ? (
                  <ul className="space-y-1.5">
                    {response.assumptions.map((assumption) => (
                      <li
                        key={assumption}
                        className="flex gap-2 rounded-lg border border-border bg-card/40 px-2.5 py-2 text-[11px] leading-5 text-muted-foreground"
                      >
                        <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                        {assumption}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <AssumptionControls
                  response={response}
                  onChange={onCorrect}
                  onReset={onResetAssumptions}
                />

                <ApprovalCard
                  title="Would you build this chart?"
                  description="The recommendation is only a proposal. Confirm it against the decision you actually have to make."
                  status={turn.approval.status}
                  result={turn.approval.result}
                  onSubmit={(answers) => {
                    const choice = answers.verdict?.selected?.[0] ?? "";
                    const message =
                      choice === "build"
                        ? "Accepted. Next: title, scale, denominator and the one caveat the reader needs."
                        : choice === "table"
                          ? "Noted: exact values first, chart second. Compare the bar or dot recommendation with a sorted table."
                          : "Rejected. That is the right instinct when the task is unclear — rewrite the prompt as a decision, not a chart type.";
                    onApproval("answered", message);
                  }}
                  questions={[
                    {
                      id: "verdict",
                      title: "Would you build this chart?",
                      description: "Your answer is not stored anywhere; it only closes this block.",
                      options: [
                        {
                          value: "build",
                          label: "Yes — the rule and the caveat fit the decision",
                        },
                        {
                          value: "table",
                          label: "Not yet — I need exact values in a table first",
                        },
                        {
                          value: "reject",
                          label: "No — I have not stated the real task",
                        },
                      ],
                    },
                  ]}
                />
              </>
            ) : null}
          </div>
        </MessageContent>
      </Message>
    </>
  );
}

export function ChooseAssistant() {
  const reduce = useReducedMotion() ?? false;
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const idRef = useRef(0);

  const last = turns[turns.length - 1];
  const busy = Boolean(last && last.state !== "complete");

  const patch = useCallback((id: number, next: Partial<Turn>) => {
    setTurns((current) =>
      current.map((turn) => (turn.id === id ? { ...turn, ...next } : turn)),
    );
  }, []);

  // The reveal is a chain of short local timers, not a fake API call. It stops
  // when the reader presses stop, and it is skipped entirely for reduced motion.
  useEffect(() => {
    if (!last) return;
    if (last.state === "thinking") {
      const timer = window.setTimeout(
        () => patch(last.id, { state: "streaming", shown: 1 }),
        520,
      );
      return () => window.clearTimeout(timer);
    }
    if (last.state === "streaming") {
      const total = blockCount(last.response);
      if (last.shown >= total) {
        const timer = window.setTimeout(() => patch(last.id, { state: "complete" }), 220);
        return () => window.clearTimeout(timer);
      }
      const timer = window.setTimeout(
        () => patch(last.id, { shown: last.shown + 1 }),
        300,
      );
      return () => window.clearTimeout(timer);
    }
    return;
  }, [last, patch]);

  const send = useCallback(
    (raw: string) => {
      const prompt = raw.trim();
      if (!prompt) return;
      const response = respond(prompt);
      const turn: Turn = {
        id: (idRef.current += 1),
        prompt,
        overrides: {},
        response,
        state: reduce ? "complete" : "thinking",
        shown: reduce ? blockCount(response) : 0,
        answers: [],
        approval: { status: "pending" },
      };
      setTurns((current) => [...current.slice(-2), turn]);
      setDraft("");
    },
    [reduce],
  );

  const finalize = useCallback(() => {
    if (!last || last.state === "complete") return;
    patch(last.id, { state: "complete", shown: blockCount(last.response) });
  }, [last, patch]);

  const answer = useCallback(
    (id: number, value: string) => {
      setTurns((current) =>
        current.map((turn) => {
          if (turn.id !== id) return turn;
          const question = turn.response;
          const overrides = { ...turn.overrides, ...overrideFor(question, value) };
          const response = respond(turn.prompt, overrides);
          const label =
            question.status === "clarify"
              ? (question.options.find((option) => option.value === value)?.label ?? value)
              : value;
          return {
            ...turn,
            overrides,
            response,
            state: reduce ? "complete" : "thinking",
            shown: reduce ? blockCount(response) : 0,
            answers: [...turn.answers, label],
          };
        }),
      );
    },
    [reduce],
  );

  const correct = useCallback((id: number, next: AssistantOverrides) => {
    setTurns((current) =>
      current.map((turn) => {
        if (turn.id !== id) return turn;
        const overrides = { ...turn.overrides, ...next };
        const response = respond(turn.prompt, overrides);
        return {
          ...turn,
          overrides,
          response,
          state: "complete",
          shown: blockCount(response),
        };
      }),
    );
  }, []);

  const resetAssumptions = useCallback((id: number) => {
    setTurns((current) =>
      current.map((turn) => {
        if (turn.id !== id) return turn;
        const response = respond(turn.prompt);
        return {
          ...turn,
          overrides: {},
          response,
          state: "complete",
          shown: blockCount(response),
        };
      }),
    );
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-card/40 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              Deterministic · runs in this tab
            </p>
            <p className="mt-2 max-w-2xl text-xs leading-6 text-muted-foreground">
              Type the decision in your own words. The workspace maps it to a task
              and a data shape, then applies the same unit-tested rule table as the
              structured form. It has no model, no API key and no network request.
            </p>
          </div>
          {turns.length ? (
            <button
              type="button"
              onClick={() => {
                setTurns([]);
                setDraft("");
              }}
              disabled={busy}
              className="press inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground disabled:opacity-40"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Clear conversation
            </button>
          ) : null}
        </div>

        <div
          className="mt-4 flex flex-col gap-5"
          aria-label="Chart decision conversation"
          role="log"
        >
          {turns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-background/60 p-4">
              <p className="text-sm font-medium text-foreground">
                Start with a decision, not a chart type.
              </p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                Try one of these, or write your own. The assistant will ask a
                question rather than guess when the task or the data shape is
                missing.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {suggestions().map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="press rounded-full border border-border bg-background px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            turns.map((turn, index) => (
              <AssistantTurn
                key={turn.id}
                turn={turn}
                reveal={index === turns.length - 1 ? turn.shown : blockCount(turn.response)}
                onAnswer={(value) => answer(turn.id, value)}
                onCorrect={(next) => correct(turn.id, next)}
                onResetAssumptions={() => resetAssumptions(turn.id)}
                onApproval={(status, result) =>
                  patch(turn.id, { approval: { status, result } })
                }
                onRetry={() => send(turn.prompt)}
              />
            ))
          )}
        </div>

        <div className="mt-4 border-t border-border pt-3">
          <PromptInput
            value={draft}
            onValueChange={setDraft}
            onSubmit={send}
            loading={busy}
            onStop={finalize}
            minRows={2}
            maxRows={6}
            placeholder="e.g. Compare revenue across eight regions, or: is ad spend correlated with sign-ups?"
            aria-label="Describe the chart decision"
          />
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] leading-5 text-muted-foreground">
            <span>Enter sends · Shift+Enter adds a line</span>
            <span aria-hidden="true">·</span>
            <span>The transcript is in memory only; nothing is saved or sent.</span>
            {busy ? (
              <>
                <span aria-hidden="true">·</span>
                <span>Stop keeps the answer above; it does not cancel a network call, because there is none.</span>
              </>
            ) : null}
          </p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <div id="rules" className="scroll-mt-24 rounded-2xl border border-border bg-card/40 p-4">
          <h2 className="text-sm font-medium">What the assistant actually does</h2>
          <ol className="mt-2 space-y-2 text-[11px] leading-6 text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">1. Reads words, not intent.</span>{" "}
              Keyword rules classify the task and the data shape. A prompt that names
              no task gets a question, not a guess.
            </li>
            <li>
              <span className="font-medium text-foreground">2. Applies one rule.</span>{" "}
              The same <code className="rounded bg-muted px-1 py-0.5 font-mono">decide()</code>{" "}
              function used by the six chart labs returns the primary chart, the
              alternatives and the avoid list.
            </li>
            <li>
              <span className="font-medium text-foreground">3. States its assumptions.</span>{" "}
              Category count, inferred shape and confidence are printed above the
              recommendation and can be corrected without rewriting the prompt.
            </li>
            <li>
              <span className="font-medium text-foreground">4. Hands the decision back.</span>{" "}
              The approval block is the human step: accept, ask for exact values, or
              reject because the task is still unclear.
            </li>
          </ol>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-4">
          <h2 className="text-sm font-medium">What it reads from this site</h2>
          <p className="mt-1 text-[11px] leading-6 text-muted-foreground">
            The assistant answers from the same pages a reader can open and check.
          </p>
          <Citations
            citations={CITATION_SOURCES}
            title="Sources behind the rules"
            className="mt-3"
          />
          <p className="mt-3 text-[10px] leading-5 text-muted-foreground">
            No model provider, no analytics call, no third-party request. Fetching
            one of these links opens the page you are already reading.
          </p>
        </div>
      </div>
    </div>
  );
}
