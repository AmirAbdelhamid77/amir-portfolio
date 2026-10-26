// Shared, dependency-free SVG chart primitives. The mathematics lives in
// lib/statistics/math.ts; these components only map already-computed numbers to
// pixels. Nothing here reads the DOM, so the same primitives render on the
// server and inside a client lab island.
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const CHART = {
  width: 480,
  height: 300,
  left: 52,
  right: 16,
  top: 20,
  bottom: 44,
} as const;

export const PLOT = {
  width: CHART.width - CHART.left - CHART.right,
  height: CHART.height - CHART.top - CHART.bottom,
} as const;

export const COLORS = {
  population: "var(--chart-1)",
  sample: "var(--chart-2)",
  sampling: "var(--chart-3)",
  alternative: "var(--chart-4)",
  uncertainty: "var(--chart-5)",
  observed: "var(--foreground)",
  null: "var(--muted-foreground)",
  critical: "var(--muted-foreground)",
  pvalue: "var(--chart-4)",
  success: "var(--success)",
  danger: "var(--danger)",
} as const;

export function scale(value: number, domain: [number, number], range: [number, number]): number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  if (d1 === d0) return (r0 + r1) / 2;
  return r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
}

export function xScale(value: number, domain: [number, number]): number {
  return scale(value, domain, [CHART.left, CHART.left + PLOT.width]);
}

export function yScale(value: number, domain: [number, number]): number {
  return scale(value, domain, [CHART.top + PLOT.height, CHART.top]);
}

function niceStep(range: number, target: number): number {
  const rough = range / Math.max(1, target);
  const exponent = Math.floor(Math.log10(rough));
  const fraction = rough / 10 ** exponent;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * 10 ** exponent;
}

export function niceTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min === max) return [min];
  const step = niceStep(max - min, target);
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= max + step * 1e-9; value += step) {
    ticks.push(Number(value.toFixed(10)));
    if (ticks.length > 20) break;
  }
  return ticks;
}

export function formatTick(value: number): string {
  if (!Number.isFinite(value)) return "";
  const absolute = Math.abs(value);
  if (absolute !== 0 && (absolute >= 10000 || absolute < 0.001)) return value.toExponential(0);
  if (Number.isInteger(value)) return value.toLocaleString("en-US");
  const digits = absolute < 1 ? 3 : absolute < 10 ? 2 : 1;
  return value.toLocaleString("en-US", { maximumFractionDigits: digits });
}

export function linePath(points: readonly [number, number][]): string {
  if (!points.length) return "";
  return points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

export function ChartLegend({
  items,
  className,
}: {
  items: { label: string; color: string; dashed?: boolean; pattern?: "solid" | "hatch" | "band" }[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground", className)}>
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-4 rounded-sm border"
            style={
              item.pattern === "band"
                ? { backgroundColor: item.color, opacity: 0.35, borderColor: item.color }
                : item.dashed
                  ? {
                      backgroundImage: `repeating-linear-gradient(to right, ${item.color} 0 3px, transparent 3px 6px)`,
                      borderColor: "transparent",
                      height: 2,
                    }
                  : { backgroundColor: item.color, borderColor: item.color }
            }
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export function DataTableView({
  caption,
  columns,
  rows,
  title = "Exact values",
  align,
  className,
}: {
  caption: string;
  columns: string[];
  rows: ReactNode[][];
  title?: string;
  align?: ("start" | "end")[];
  className?: string;
}) {
  return (
    <details className={cn("group rounded-xl border border-border bg-background/60", className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-[11px] text-muted-foreground">
        <span>{title}</span>
        <span aria-hidden="true" className="transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="max-h-72 overflow-auto border-t border-border" tabIndex={0}>
        <table className="w-full border-collapse text-[11px]">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 bg-card">
            <tr className="border-b border-border">
              {columns.map((column, index) => (
                <th
                  key={column}
                  scope="col"
                  className={cn(
                    "px-3 py-2 font-medium text-foreground",
                    index === 0 || align?.[index] === "start" ? "text-start" : "text-end",
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
                      cellIndex === 0 || align?.[cellIndex] === "start"
                        ? "text-start text-foreground"
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

export function ChartFigure({
  summary,
  caption,
  children,
  table,
  legend,
  className,
  badge,
}: {
  summary: string;
  caption?: ReactNode;
  children: ReactNode;
  table?: ReactNode;
  legend?: ReactNode;
  className?: string;
  badge?: ReactNode;
}) {
  return (
    <figure aria-label={summary} className={cn("rounded-2xl border border-border bg-background p-3 sm:p-4", className)}>
      <div className="w-full">{children}</div>
      {legend ? <div className="mt-2">{legend}</div> : null}
      {caption || badge ? (
        <figcaption className="mt-3 flex flex-wrap items-start justify-between gap-2 border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
          <span className="max-w-prose">{caption}</span>
          {badge}
        </figcaption>
      ) : null}
      {table ? <div className="mt-2">{table}</div> : null}
    </figure>
  );
}

/**
 * Axis frame. Children receive the plot geometry implicitly through xScale and
 * yScale; the frame owns the ticks, labels and the accessible name.
 */
export function ChartFrame({
  summary,
  description,
  xDomain,
  yDomain,
  xTicks,
  yTicks,
  xLabel,
  yLabel,
  xFormat = formatTick,
  yFormat = formatTick,
  grid = "y",
  children,
  height,
  className,
  hiddenXTicks = [],
}: {
  summary: string;
  description?: string;
  xDomain: [number, number];
  yDomain: [number, number];
  xTicks?: number[];
  yTicks?: number[];
  xLabel?: string;
  yLabel?: string;
  xFormat?: (value: number) => string;
  yFormat?: (value: number) => string;
  grid?: "y" | "both" | "none";
  children: ReactNode;
  height?: number;
  className?: string;
  hiddenXTicks?: number[];
}) {
  const xs = xTicks ?? niceTicks(xDomain[0], xDomain[1], 5);
  const ys = yTicks ?? niceTicks(yDomain[0], yDomain[1], 5);
  const viewHeight = height ?? CHART.height;
  return (
    <svg
      viewBox={`0 0 ${CHART.width} ${viewHeight}`}
      className={cn("h-auto w-full touch-manipulation", className)}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={summary}
    >
      <title>{summary}</title>
      {description ? <desc>{description}</desc> : null}

      {grid !== "none"
        ? ys.map((tick) => {
            const y = yScale(tick, yDomain);
            return (
              <line
                key={`grid-y-${tick}`}
                x1={CHART.left}
                x2={CHART.left + PLOT.width}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeWidth={1}
              />
            );
          })
        : null}
      {grid === "both"
        ? xs.map((tick) => {
            const x = xScale(tick, xDomain);
            return (
              <line
                key={`grid-x-${tick}`}
                x1={x}
                x2={x}
                y1={CHART.top}
                y2={CHART.top + PLOT.height}
                stroke="var(--border)"
                strokeWidth={1}
              />
            );
          })
        : null}

      <line
        x1={CHART.left}
        x2={CHART.left + PLOT.width}
        y1={CHART.top + PLOT.height}
        y2={CHART.top + PLOT.height}
        stroke="var(--border-strong)"
      />
      <line
        x1={CHART.left}
        x2={CHART.left}
        y1={CHART.top}
        y2={CHART.top + PLOT.height}
        stroke="var(--border-strong)"
      />

      {ys.map((tick) => {
        const y = yScale(tick, yDomain);
        return (
          <text
            key={`y-${tick}`}
            x={CHART.left - 8}
            y={y + 4}
            textAnchor="end"
            fontSize={12}
            fill="var(--muted-foreground)"
          >
            {yFormat(tick)}
          </text>
        );
      })}

      {xs.map((tick) => {
        const x = xScale(tick, xDomain);
        const hidden = hiddenXTicks.includes(tick);
        return (
          <text
            key={`x-${tick}`}
            x={x}
            y={CHART.top + PLOT.height + 18}
            textAnchor="middle"
            fontSize={12}
            fill="var(--muted-foreground)"
            className={hidden ? "hidden sm:block" : undefined}
          >
            {xFormat(tick)}
          </text>
        );
      })}

      {xLabel ? (
        <text
          x={CHART.left + PLOT.width / 2}
          y={viewHeight - 8}
          textAnchor="middle"
          fontSize={12}
          fill="var(--muted-foreground)"
        >
          {xLabel}
        </text>
      ) : null}
      {yLabel ? (
        <text
          transform={`translate(13 ${CHART.top + PLOT.height / 2}) rotate(-90)`}
          textAnchor="middle"
          fontSize={12}
          fill="var(--muted-foreground)"
        >
          {yLabel}
        </text>
      ) : null}

      {children}
    </svg>
  );
}

export function ChartMark({
  x,
  y,
  label,
  color = COLORS.observed,
  anchor = "start",
  dy = -8,
}: {
  x: number;
  y: number;
  label: string;
  color?: string;
  anchor?: "start" | "middle" | "end";
  dy?: number;
}) {
  return (
    <text x={x} y={y + dy} textAnchor={anchor} fontSize={11} fill={color} fontWeight={500}>
      {label}
    </text>
  );
}
