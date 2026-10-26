"use client";

import { useState, type ReactNode } from "react";
import { CheckCircle2, CircleAlert, FlaskConical, Info, RotateCcw, Sparkles } from "lucide-react";
import { NumberTicker } from "@/components/motion/number-ticker";
import { DataTableView } from "@/components/statistics/chart-kit";
import { cn } from "@/lib/utils";

export function LabShell({
  title,
  question,
  description,
  children,
  aside,
  tier,
}: {
  title: string;
  question: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
  tier?: string;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card/30 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <p className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
            Interactive lab
            {tier ? (
              <span className="rounded-full border border-border px-1.5 py-0.5 text-[9px]">{tier}</span>
            ) : null}
          </p>
          <h2 className="mt-2 text-xl font-medium tracking-tight text-foreground sm:text-2xl">{title}</h2>
          <p className="mt-1.5 text-sm font-medium text-foreground/80">{question}</p>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">{description}</p>
        </div>
        {aside}
      </header>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Panel({
  title,
  description,
  children,
  className,
  action,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-background/70 p-4", className)}>
      {title || action ? (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            {title ? <h3 className="text-sm font-medium text-foreground">{title}</h3> : null}
            {description ? (
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  size = "md",
}: {
  label: string;
  value: T;
  options: { value: T; label: string; hint?: string }[];
  onChange: (value: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            title={option.hint}
            onClick={() => onChange(option.value)}
            className={cn(
              "press inline-flex min-h-6 items-center rounded-full border transition-colors",
              size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:border-border-strong hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function LabSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  hint,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  display?: string;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label className={cn("block", disabled && "opacity-60")}>
      <span className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums text-foreground">{display ?? value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={label}
        aria-valuetext={display ?? String(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-foreground disabled:cursor-not-allowed"
      />
      <span className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>{min}</span>
        {hint ? <span className="px-2 text-center">{hint}</span> : null}
        <span>{max}</span>
      </span>
    </label>
  );
}

export function LabNumber({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  const id = `num-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  return (
    <label htmlFor={id} className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        id={id}
        type="number"
        value={Number.isFinite(value) ? value : ""}
        min={min}
        max={max}
        step={step}
        inputMode="decimal"
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onChange(Math.min(max, Math.max(min, next)));
        }}
        className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2.5 font-mono text-xs text-foreground outline-none focus-visible:border-border-strong"
      />
      {hint ? (
        <span id={`${id}-hint`} className="mt-1 block text-[10px] leading-4 text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function LabSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <select
        value={value}
        aria-label={label}
        onChange={(event) => onChange(event.target.value as T)}
        className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:border-border-strong"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function LabToggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-background px-3 py-2 text-xs">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-foreground"
      />
      <span>
        <span className="text-foreground">{label}</span>
        {hint ? <span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">{hint}</span> : null}
      </span>
    </label>
  );
}

export function PresetButtons<T extends string>({
  presets,
  onSelect,
  label = "Presets",
}: {
  presets: { id: T; label: string; hint?: string }[];
  onSelect: (id: T) => void;
  label?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            title={preset.hint}
            onClick={() => onSelect(preset.id)}
            className="press inline-flex min-h-6 items-center rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ResetButton({ onClick, label = "Reset" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-[11px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
    >
      <RotateCcw className="h-3 w-3" aria-hidden="true" />
      {label}
    </button>
  );
}

export function LiveNumber({
  value,
  decimals = 2,
  prefix,
  suffix,
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  if (!Number.isFinite(value)) return <span className={className}>—</span>;
  return (
    <NumberTicker
      value={value}
      decimals={decimals}
      prefix={prefix}
      suffix={suffix}
      startOnView={false}
      duration={0.45}
      stagger={0.02}
      locale
      className={className}
    />
  );
}

export function ReadoutGrid({
  items,
  columns = 4,
}: {
  items: { label: string; value: ReactNode; note?: string; tone?: "default" | "accent" | "danger" }[];
  columns?: 2 | 3 | 4;
}) {
  return (
    <dl
      className={cn(
        "grid gap-2",
        columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4",
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border bg-background/70 p-2.5">
          <dt className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{item.label}</dt>
          <dd
            className={cn(
              "mt-1 font-mono text-sm tabular-nums",
              item.tone === "danger" ? "text-red-700 dark:text-red-300" : item.tone === "accent" ? "text-foreground" : "text-foreground",
            )}
          >
            {item.value}
          </dd>
          {item.note ? <dd className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{item.note}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

export function Interpretation({
  children,
  tone = "neutral",
  title,
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
  title?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex gap-2 rounded-xl border p-3 text-xs leading-6",
        tone === "success" && "border-emerald-500/30 bg-emerald-500/[0.07] text-muted-foreground",
        tone === "warning" && "border-amber-500/30 bg-amber-500/[0.07] text-muted-foreground",
        tone === "danger" && "border-red-500/30 bg-red-500/[0.07] text-muted-foreground",
        tone === "neutral" && "border-border bg-card/40 text-muted-foreground",
      )}
    >
      {tone === "success" ? (
        <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
      ) : tone === "warning" || tone === "danger" ? (
        <CircleAlert className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
      ) : (
        <Info className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      )}
      <span dir="auto">
        {title ? <strong className="font-medium text-foreground">{title} </strong> : null}
        {children}
      </span>
    </div>
  );
}

export function Assumptions({
  items,
  note,
  title = "Assumptions & limits",
}: {
  items: string[];
  note?: string;
  title?: string;
}) {
  return (
    <details className="group rounded-xl border border-border bg-background/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{title}</span>
        <span aria-hidden="true" className="transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="border-t border-border px-3 py-3">
        <ul className="space-y-1.5 text-[11px] leading-5 text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-border-strong" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {note ? <p className="mt-2 border-t border-border pt-2 text-[10px] leading-5 text-muted-foreground">{note}</p> : null}
      </div>
    </details>
  );
}

export function FormulaStrip({ tex, plain }: { tex: string; plain: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
      <code className="font-mono text-[11px] text-foreground" dir="ltr">
        {tex}
      </code>
      <span className="font-mono text-[10px] text-muted-foreground" dir="ltr">
        {plain}
      </span>
    </div>
  );
}

export function PredictionPrompt({
  question,
  options,
  correct,
  explanation,
  storageKey,
}: {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  storageKey?: string;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const answered = choice !== null;
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-3 sm:p-4" data-prediction={storageKey}>
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Sparkles className="h-3 w-3" aria-hidden="true" />
        Predict first
      </p>
      <p className="mt-2 text-xs font-medium leading-6 text-foreground">{question}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((option, index) => {
          const isCorrect = index === correct;
          const isChosen = choice === index;
          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              aria-pressed={isChosen}
              onClick={() => setChoice(index)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                !answered && "border-border bg-background text-muted-foreground hover:border-border-strong hover:text-foreground",
                answered && isCorrect && "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
                answered && isChosen && !isCorrect && "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
                answered && !isChosen && !isCorrect && "border-border bg-background text-muted-foreground opacity-60",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {answered ? (
          <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
            <strong className={choice === correct ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}>
              {choice === correct ? "Correct. " : "Not quite. "}
            </strong>
            {explanation}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function LabDataTable({
  caption,
  columns,
  rows,
  title,
}: {
  caption: string;
  columns: string[];
  rows: ReactNode[][];
  title?: string;
}) {
  return <DataTableView caption={caption} columns={columns} rows={rows} title={title} />;
}

export function SyntheticNote({ children }: { children: ReactNode }) {
  return <p className="text-[10px] leading-5 text-muted-foreground">{children}</p>;
}
