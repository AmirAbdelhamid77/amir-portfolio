import type { ReactNode } from "react";
import { Info, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-3xl border border-border bg-card/40 p-4 sm:p-5", className)}>
      {title ? (
        <div className="mb-4">
          <h2 className="text-sm font-medium tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs leading-6 text-muted-foreground">{description}</p>
          ) : null}
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
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
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
            onClick={() => onChange(option.value)}
            className={cn(
              "press rounded-full border px-3 py-1.5 text-xs transition-colors",
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

export function ToggleChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "press inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
        pressed
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-foreground hover:border-border-strong hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function RangeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  display?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{display ?? value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuetext={display ?? String(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-foreground"
      />
    </label>
  );
}

export function ChartCard({
  children,
  caption,
  summary,
}: {
  children: ReactNode;
  caption?: ReactNode;
  summary: string;
}) {
  return (
    <figure className="rounded-2xl border border-border bg-background p-3 sm:p-4">
      <div role="img" aria-label={summary} className="w-full">
        {children}
      </div>
      {caption ? (
        <figcaption className="mt-3 border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function DataTable({
  title = "Read the numbers",
  caption,
  columns,
  rows,
  align,
}: {
  title?: string;
  caption: string;
  columns: string[];
  rows: ReactNode[][];
  align?: ("start" | "end" | "center")[];
}) {
  return (
    <details className="group rounded-2xl border border-border bg-background">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
          {title}
        </span>
        <span aria-hidden="true" className="transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="overflow-x-auto border-t border-border" tabIndex={0}>
        <table className="w-full border-collapse text-xs">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border bg-card/60">
              {columns.map((column, index) => (
                <th
                  key={column}
                  scope="col"
                  className={cn(
                    "px-3 py-2 font-medium text-foreground",
                    index === 0 ? "text-start" : align?.[index] === "start" ? "text-start" : "text-end",
                  )}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border last:border-0">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={cn(
                      "px-3 py-1.5 align-top text-muted-foreground",
                      cellIndex === 0
                        ? "text-start text-foreground"
                        : align?.[cellIndex] === "start"
                          ? "text-start"
                          : "text-end font-mono tabular-nums",
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export function KeyNumbers({
  items,
  className,
}: {
  items: { label: string; value: string; note?: string }[];
  className?: string;
}) {
  return (
    <dl className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", className)}>
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border bg-background/60 p-3">
          <dt className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-1 font-mono text-sm text-foreground">{item.value}</dd>
          {item.note ? (
            <dd className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{item.note}</dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

export function Insight({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warning" }) {
  return (
    <p
      className={cn(
        "flex gap-2 rounded-xl border p-3 text-xs leading-6",
        tone === "warning"
          ? "border-amber-500/30 bg-amber-500/[0.07] text-muted-foreground"
          : "border-border bg-card/40 text-muted-foreground",
      )}
    >
      <Info className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function SyntheticNote() {
  return (
    <p className="text-[11px] leading-5 text-muted-foreground">
      Synthetic teaching data, generated locally with a fixed seed. It is not real
      customer, patient, employee, or employer data. The same file drives the chart,
      the table, and the tests.
    </p>
  );
}

export function Legend({
  items,
}: {
  items: { label: string; color: string; dashed?: boolean }[];
}) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn("inline-block h-0.5 w-4 rounded-full", item.dashed && "opacity-70")}
            style={{
              backgroundColor: item.color,
              backgroundImage: item.dashed
                ? `repeating-linear-gradient(to right, ${item.color} 0 3px, transparent 3px 6px)`
                : undefined,
            }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
