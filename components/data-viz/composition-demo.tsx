"use client";

// Quarterly revenue mix: the composition question a dashboard usually answers
// badly with a stack of pies. `CompositionChart` normalizes each period to 100%,
// so the reader compares shape across quarters instead of comparing totals that
// belong on a different axis.
//
// The interesting lesson is not "revenue went up". It is that every line can
// grow while one line's share falls — which is exactly why a normalized stack
// needs the absolute table beside it.

import { useState } from "react";
import {
  CompositionChart,
  CompositionChartPlot,
  useCompositionChart,
} from "@/components/charts/composition-chart";
import {
  COMPOSITION_PERIODS,
  COMPOSITION_SERIES,
} from "@/lib/data-viz/figure-data";
import { DataTable, Insight, KeyNumbers, Segmented } from "@/components/data-viz/lab-ui";

const TOTAL_FIRST = COMPOSITION_SERIES.reduce((sum, series) => sum + series.values[0], 0);
const TOTAL_LAST = COMPOSITION_SERIES.reduce(
  (sum, series) => sum + series.values[series.values.length - 1],
  0,
);

/**
 * Our own legend instead of the registry's.
 *
 * The vendored legend labels each row `Highlight {name}` while the visible row
 * reads `{name}` and `{share}%`. Voice control users cannot say "68.9%", and
 * axe flags the WCAG 2.5.3 label-in-name mismatch. The chart's public hook
 * exposes the same pin/hover/focus state, so the legend is composed locally
 * with an accessible name that starts with the visible text, and the vendored
 * file stays untouched.
 */
function MixLegend() {
  const { column, pinned, setPinned, setHovered, setFocused, canHover } =
    useCompositionChart();
  if (!column) return null;
  return (
    <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
      {column.segments.map((row) => {
        const share = column.valid ? `${row.share.toFixed(1)}%` : "no value";
        return (
          <button
            key={row.id}
            type="button"
            aria-label={`${row.name} ${share} — select to highlight`}
            aria-pressed={pinned === row.id}
            onClick={() => setPinned(pinned === row.id ? null : row.id)}
            onPointerEnter={() => {
              if (canHover) setHovered(row.id);
            }}
            onPointerLeave={() => setHovered(null)}
            onFocus={() => setFocused(row.id)}
            onBlur={() => setFocused(null)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setPinned(null);
                setHovered(null);
                setFocused(null);
              }
            }}
            className="press flex min-h-12 min-w-0 items-center gap-2.5 rounded-md px-2 py-1.5 text-start text-xs transition-opacity duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-pressed:bg-muted/60"
          >
            <span
              aria-hidden="true"
              className="h-6 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: row.color }}
            />
            <span className="grid min-w-0 gap-0.5">
              <span className="truncate text-muted-foreground">{row.name}</span>{" "}
              <span className="shrink-0 font-mono tabular-nums">{share}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Reads the selected quarter from the chart context so text and chart agree. */
function QuarterReadout() {
  const { column, formatValue } = useCompositionChart();
  if (!column) return null;
  const total = column.segments.reduce((sum, segment) => sum + (segment.value ?? 0), 0);
  const largest = [...column.segments].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0];
  return (
    <div aria-live="polite">
      <KeyNumbers
        items={[
          { label: "Quarter", value: column.id, note: "selected" },
          { label: "Total", value: `$${formatValue(total)}k`, note: "recognised revenue" },
          {
            label: "Largest line",
            value: largest?.name ?? "—",
            note: largest ? `${largest.share.toFixed(1)}% of the mix` : undefined,
          },
          {
            label: "Share range",
            value: `${Math.min(...column.segments.map((segment) => segment.share)).toFixed(1)}–${Math.max(
              ...column.segments.map((segment) => segment.share),
            ).toFixed(1)}%`,
            note: "smallest to largest",
          },
        ]}
      />
    </div>
  );
}

export function CompositionDemo() {
  const [view, setView] = useState<"bar" | "area">("bar");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Composition over time · 8 quarters
          </p>
          <h3 className="mt-1 text-base font-medium tracking-tight">
            Total revenue grew 36%; the mix still moved
          </h3>
        </div>
        <Segmented
          label="Composition view"
          value={view}
          options={[
            { value: "bar", label: "Bars" },
            { value: "area", label: "Area" },
          ]}
          onChange={setView}
        />
      </div>

      <div className="rounded-2xl border border-border bg-background p-3 sm:p-4">
        <CompositionChart
          series={COMPOSITION_SERIES}
          periods={COMPOSITION_PERIODS}
          view={view}
          defaultPeriod={COMPOSITION_PERIODS[COMPOSITION_PERIODS.length - 1]}
          formatValue={(value) => value.toFixed(1)}
          label="Quarterly revenue mix, normalized to 100 percent per quarter"
        >
          <CompositionChartPlot />
          <MixLegend />
          <QuarterReadout />
        </CompositionChart>
      </div>

      <p className="text-[11px] leading-5 text-muted-foreground">
        Click a quarter in the plot to read its exact shares. Each bar is normalized to
        100%, so bar height is share, not revenue — the totals are in the table below.
        {view === "area"
          ? " The area view is shape-first: good for a long series, weaker at reading one quarter precisely."
          : " The bar view keeps each quarter separately readable, which is why it is the default here."}
      </p>

      <Insight>
        Services revenue rose from ${COMPOSITION_SERIES[1].values[0]}k to $
        {COMPOSITION_SERIES[1].values[COMPOSITION_SERIES[1].values.length - 1]}k — up{" "}
        {(
          ((COMPOSITION_SERIES[1].values[COMPOSITION_SERIES[1].values.length - 1] -
            COMPOSITION_SERIES[1].values[0]) /
            COMPOSITION_SERIES[1].values[0]) *
          100
        ).toFixed(0)}
        % — while its share of the mix fell. A normalized chart answers “what is the
        mix?”, never “is this line growing?”. Put the absolute line beside the stack, or
        label the change directly.
      </Insight>

      <DataTable
        title="Read the numbers · every quarter, every line"
        caption="Synthetic revenue in thousands. Shares are computed from the values in the same row."
        columns={["Quarter", "Line", "Value", "Share"]}
        rows={COMPOSITION_PERIODS.flatMap((period, index) => {
          const total = COMPOSITION_SERIES.reduce(
            (sum, series) => sum + series.values[index],
            0,
          );
          return COMPOSITION_SERIES.map((series) => [
            period,
            series.name,
            `$${series.values[index]}k`,
            `${((series.values[index] / total) * 100).toFixed(1)}%`,
          ]);
        })}
      />

      <p className="text-[10px] leading-5 text-muted-foreground">
        Synthetic teaching data. Totals: ${TOTAL_FIRST}k (Q1 24) → ${TOTAL_LAST}k (Q4
        25). The chart library normalizes internally; the table prints the absolute
        values so the picture and the numbers cannot drift apart.
      </p>
    </div>
  );
}
