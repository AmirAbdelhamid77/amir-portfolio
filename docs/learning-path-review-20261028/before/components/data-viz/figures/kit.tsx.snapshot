"use client";

import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared visual grammar for the twelve live figures. */
export const PLOT = {
  width: 640,
  height: 300,
  top: 26,
  right: 20,
  bottom: 38,
  left: 48,
};

export function Plot({
  label,
  caption,
  children,
  className,
}: {
  label: string;
  caption?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("rounded-2xl border border-border bg-background p-3", className)}>
      <div role="img" aria-label={label} className="w-full">
        {children}
      </div>
      {caption ? (
        <figcaption className="mt-2 border-t border-border pt-2 text-[11px] leading-5 text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-x-4 gap-y-2">{children}</div>;
}

export function ResetButton({
  onClick,
  children = "Reset",
  disabled,
}: {
  onClick: () => void;
  children?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="press inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground disabled:opacity-40"
    >
      <RotateCcw className="h-3 w-3" aria-hidden="true" />
      {children}
    </button>
  );
}

export function LiveReadout({
  label,
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div aria-live="polite" className={cn("min-w-0", className)}>
      {label ? (
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function VerdictPill({
  tone,
  children,
}: {
  tone: "good" | "warn" | "bad" | "neutral";
  children: ReactNode;
}) {
  const tones = {
    good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    warn: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
    bad: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    neutral: "border-border bg-card/50 text-muted-foreground",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

/** Axis labels are SVG text so they scale with the viewBox on mobile. */
export function AxisLabel({
  x,
  y,
  children,
  anchor = "middle",
  className,
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
  className?: string;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      className={cn("fill-[var(--muted-foreground)] text-[10px]", className)}
    >
      {children}
    </text>
  );
}

/** Horizontal grid lines with values; used by the native-SVG figures. */
export function ValueGrid({
  ticks,
  scale,
  x0,
  x1,
  format = (value: number) => String(value),
}: {
  ticks: number[];
  scale: (value: number) => number;
  x0: number;
  x1: number;
  format?: (value: number) => string;
}) {
  return (
    <g>
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={x0}
            x2={x1}
            y1={scale(tick)}
            y2={scale(tick)}
            stroke="var(--border)"
            strokeWidth={1}
          />
          <text
            x={x0 - 8}
            y={scale(tick) + 3}
            textAnchor="end"
            className="fill-[var(--muted-foreground)] text-[10px]"
          >
            {format(tick)}
          </text>
        </g>
      ))}
    </g>
  );
}
