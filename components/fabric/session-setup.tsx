"use client";

import { useId, useMemo, useState } from "react";
import { Clock, ListChecks, Play, Shuffle, SlidersHorizontal, Timer } from "lucide-react";
import type {
  FabricCaseStudy,
  FabricIndexEntry,
  Scope,
  SubjectId,
} from "@/lib/fabric/types";
import type {
  SessionConfig,
  SessionFilter,
  LearnerSnapshot,
  StatusFilter,
} from "@/lib/fabric/engine";
import { EMPTY_SNAPSHOT, filterEntries, suggestedMinutes, type FabricMode } from "@/lib/fabric/engine";
import { OBJECTIVES, SUBJECTS } from "@/lib/fabric/taxonomy";
import { PACKS } from "@/lib/fabric/data";
import { Callout, Chip } from "@/components/fabric/ui";

export type SetupField =
  | "pack"
  | "subject"
  | "objective"
  | "status"
  | "difficulty"
  | "scope"
  | "count"
  | "time"
  | "shuffle";

export interface SessionSetupProps {
  mode: FabricMode;
  entries: FabricIndexEntry[] | null;
  fields: SetupField[];
  countOptions?: number[];
  defaultCount?: number;
  defaultScopes?: Scope[];
  defaultStatus?: StatusFilter;
  caseStudies?: FabricCaseStudy[];
  caseCounts?: Map<string, number>;
  /** Per-question history, so status filters can count honestly. */
  learner?: LearnerSnapshot;
  startLabel: string;
  onStart: (config: SessionConfig) => void;
  busy?: boolean;
  error?: string | null;
  footnote?: string;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string; needs?: "learner" }[] = [
  { value: "all", label: "All eligible" },
  { value: "unattempted", label: "Never attempted" },
  { value: "incorrect", label: "Last answer wrong" },
  { value: "bookmarked", label: "Bookmarked" },
  { value: "flagged", label: "Flagged" },
];

export function SessionSetup({
  mode,
  entries,
  fields,
  countOptions = [5, 10, 15, 20, 30, 40, 60],
  defaultCount = 10,
  defaultScopes = ["core"],
  defaultStatus = "all",
  caseStudies,
  caseCounts,
  learner = EMPTY_SNAPSHOT,
  startLabel,
  onStart,
  busy = false,
  error,
  footnote,
}: SessionSetupProps) {
  const uid = useId();
  const has = (field: SetupField) => fields.includes(field);

  // Local, uncontrolled-ish state: the form is only read when the learner presses
  // start, so there is nothing to synchronise while they tweak it.
  const state = useSetupState({
    pack: "all",
    subject: "all",
    objective: "all",
    status: defaultStatus,
    difficulty: "all",
    scope: defaultScopes.includes("core") && defaultScopes.length === 1 ? "focused" : "extended",
    count: defaultCount,
    minutes: suggestedMinutes(defaultCount),
    caseStudy: caseStudies?.[0]?.id ?? "all",
    shuffleQuestions: true,
    shuffleOptions: true,
  });

  // 834 entries is small enough to filter on every render, and doing so keeps
  // the count honest while the controls move — no stale memo, no effect.
  const available = entries
    ? filterEntries(entries, filterFrom(state, mode, has("scope") ? null : defaultScopes), learner)
        .length
    : 0;

  const packCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of entries ?? []) map.set(entry.pack, (map.get(entry.pack) ?? 0) + 1);
    return map;
  }, [entries]);

  const max = Math.max(1, available);
  const requested = Math.min(state.count, max);

  return (
    <div className="rounded-3xl border border-border bg-card/60 p-5 sm:p-7">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-medium">Set up your session</h2>
        <span className="ms-auto font-mono text-[11px] text-muted-foreground" aria-live="polite">
          {entries ? `${available} question${available === 1 ? "" : "s"} match` : "Loading question bank…"}
        </span>
      </div>

      <div className="mt-5 grid gap-5">
        {caseStudies && caseStudies.length > 0 ? (
          <Field label="Case study" htmlFor={`${uid}-case`}>
            <select
              id={`${uid}-case`}
              value={state.caseStudy}
              onChange={(event) => state.setCaseStudy(event.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              {caseStudies.map((study) => (
                <option key={study.id} value={study.id}>
                  {study.title.replace(/^Case study\s*·\s*/i, "")} ({caseCounts?.get(study.id) ?? 0} questions)
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        {has("pack") ? (
          <Field label="Source pack" htmlFor={`${uid}-pack`}>
            <select
              id={`${uid}-pack`}
              value={state.pack}
              onChange={(event) => state.setPack(event.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="all">All 18 packs</option>
              {PACKS.map((pack) => (
                <option key={pack.key} value={pack.key}>
                  {pack.title} ({packCounts.get(pack.key) ?? 0})
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        {has("subject") ? (
          <Field label="Fabric topic" htmlFor={`${uid}-subject`}>
            <select
              id={`${uid}-subject`}
              value={state.subject}
              onChange={(event) => state.setSubject(event.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="all">Any topic</option>
              {SUBJECTS.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        {has("objective") ? (
          <Field label="Official DP-600 objective" htmlFor={`${uid}-objective`}>
            <select
              id={`${uid}-objective`}
              value={state.objective}
              onChange={(event) => state.setObjective(event.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="all">Any objective</option>
              {OBJECTIVES.map((objective) => (
                <option key={objective.id} value={objective.id}>
                  {objective.id} · {objective.label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        {has("status") ? (
          <Field label="Question status">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Question status">
              {STATUS_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  active={state.status === option.value}
                  onClick={() => state.setStatus(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </Field>
        ) : null}

        {has("difficulty") ? (
          <Field label="Difficulty">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Difficulty">
              <Chip active={state.difficulty === "all"} onClick={() => state.setDifficulty("all")}>
                Any
              </Chip>
              {[4, 5].map((level) => (
                <Chip
                  key={level}
                  active={state.difficulty === String(level)}
                  onClick={() => state.setDifficulty(String(level))}
                >
                  {level}/5
                </Chip>
              ))}
            </div>
          </Field>
        ) : null}

        {has("scope") ? (
          <Field label="Question scope">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Question scope">
              <Chip active={state.scope === "focused"} onClick={() => state.setScope("focused")}>
                DP-600 focused
              </Chip>
              <Chip active={state.scope === "extended"} onClick={() => state.setScope("extended")}>
                Fabric extended
              </Chip>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
              {state.scope === "focused"
                ? "Only questions whose source declares a DP-600 objective. The narrower, more exam-aligned set."
                : "All 834 questions, including DP-700-adjacent engineering depth."}
            </p>
          </Field>
        ) : null}

        {has("count") ? (
          <Field label="Questions" htmlFor={`${uid}-count`}>
            <div className="flex flex-wrap items-center gap-2">
              {countOptions.map((value) => (
                <Chip
                  key={value}
                  active={requested === Math.min(value, max) && state.count === value}
                  onClick={() => state.setCount(value)}
                >
                  {value}
                </Chip>
              ))}
              <label className="ms-auto flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="sr-only">Exact question count</span>
                <input
                  id={`${uid}-count`}
                  type="range"
                  min={Math.min(5, max)}
                  max={max}
                  step={1}
                  value={requested}
                  onChange={(event) => state.setCount(Number(event.target.value))}
                  className="h-1.5 w-32 cursor-pointer appearance-none rounded-full bg-foreground/10 accent-[var(--primary)]"
                />
                <span className="w-14 text-right font-mono text-foreground" aria-live="polite">
                  {requested}
                </span>
              </label>
            </div>
          </Field>
        ) : null}

        {has("time") ? (
          <Field label="Time limit">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Time limit">
              {[10, 15, 30, 45, 60, 100].map((value) => (
                <Chip key={value} active={state.minutes === value} onClick={() => state.setMinutes(value)}>
                  {value} min
                </Chip>
              ))}
              <Chip active={state.minutes === -1} onClick={() => state.setMinutes(-1)}>
                No timer
              </Chip>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
              Microsoft lists 100 minutes for DP-600. That is context for pacing, not a claim that
              this custom simulation reproduces the real assessment.
            </p>
          </Field>
        ) : null}

        {has("shuffle") ? (
          <Field label="Randomisation">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-xs">
                <input
                  type="checkbox"
                  checked={state.shuffleQuestions}
                  onChange={(event) => state.setShuffleQuestions(event.target.checked)}
                />
                Shuffle question order
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-xs">
                <input
                  type="checkbox"
                  checked={state.shuffleOptions}
                  onChange={(event) => state.setShuffleOptions(event.target.checked)}
                />
                Shuffle answer options
              </label>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
              Sequence questions never shuffle: their list order is the task. Both choices are
              recorded in the session, so a refresh rebuilds the same paper.
            </p>
          </Field>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          type="button"
          onClick={() =>
            onStart({
              mode,
              filter: filterFrom(state, mode, has("scope") ? null : defaultScopes),
              count: requested,
              minutes: has("time") ? (state.minutes === -1 ? null : state.minutes) : null,
              shuffleQuestions: state.shuffleQuestions,
              shuffleOptions: state.shuffleOptions,
              seed: Math.floor(Math.random() * 2 ** 31),
            })
          }
          disabled={busy || available === 0}
          className="press inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-40"
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          {busy ? "Preparing…" : startLabel}
        </button>
        <span className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ListChecks className="h-3 w-3" aria-hidden="true" />
            {requested} questions
          </span>
          {has("time") && state.minutes !== -1 ? (
            <span className="inline-flex items-center gap-1">
              <Timer className="h-3 w-3" aria-hidden="true" />
              {state.minutes} min
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              untimed
            </span>
          )}
          {has("shuffle") ? (
            <span className="inline-flex items-center gap-1">
              <Shuffle className="h-3 w-3" aria-hidden="true" />
              seeded
            </span>
          ) : null}
        </span>
      </div>

      {footnote ? <p className="mt-3 text-[11px] leading-5 text-muted-foreground">{footnote}</p> : null}
      {available === 0 && entries ? (
        <div className="mt-4">
          <Callout tone="warning" title="Nothing matches these filters">
            Widen the scope or clear a filter. Filters combine, so “bookmarked” plus one pack plus
            5/5 difficulty can legitimately match nothing.
          </Callout>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {htmlFor ? (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
        >
          {label}
        </label>
      ) : (
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

interface SetupValues {
  pack: string;
  subject: string;
  objective: string;
  status: StatusFilter;
  difficulty: string;
  scope: "focused" | "extended";
  count: number;
  minutes: number;
  caseStudy: string;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

/** Eleven independent controls backed by one object, so "Start" reads a snapshot. */
function useSetupState(initial: SetupValues) {
  const [values, setValues] = useState<SetupValues>(initial);
  const update = <K extends keyof SetupValues>(key: K, value: SetupValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));
  return {
    ...values,
    setPack: (value: string) => update("pack", value),
    setSubject: (value: string) => update("subject", value),
    setObjective: (value: string) => update("objective", value),
    setStatus: (value: StatusFilter) => update("status", value),
    setDifficulty: (value: string) => update("difficulty", value),
    setScope: (value: "focused" | "extended") => update("scope", value),
    setCount: (value: number) => update("count", value),
    setMinutes: (value: number) => update("minutes", value),
    setCaseStudy: (value: string) => update("caseStudy", value),
    setShuffleQuestions: (value: boolean) => update("shuffleQuestions", value),
    setShuffleOptions: (value: boolean) => update("shuffleOptions", value),
  };
}

function filterFrom(
  state: Pick<SetupValues, "pack" | "subject" | "objective" | "status" | "difficulty" | "scope" | "caseStudy">,
  mode: FabricMode,
  /** Used when the scope control is not offered on this page. */
  fixedScopes: Scope[] | null,
): SessionFilter {
  const filter: SessionFilter = { status: state.status };
  if (state.pack !== "all") filter.packs = [state.pack];
  if (state.subject !== "all") filter.subjects = [state.subject as SubjectId];
  if (state.objective !== "all") filter.objectives = [state.objective];
  if (state.difficulty !== "all") filter.difficulties = [Number(state.difficulty)];
  if (fixedScopes) filter.scopes = fixedScopes;
  else if (state.scope === "focused") filter.scopes = ["core"];
  if (mode === "case" && state.caseStudy !== "all") filter.caseStudyId = state.caseStudy;
  return filter;
}
