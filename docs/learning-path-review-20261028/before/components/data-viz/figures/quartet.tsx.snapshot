"use client";

import { useMemo, useState } from "react";
import {
  ANSCOMBE_LABELS,
  QUARTET_SUMMARIES,
  quartetMaxDifference,
} from "@/lib/data-viz/figure-data";
import { DataTable, Insight, ToggleChip } from "@/components/data-viz/lab-ui";
import { Controls, LiveReadout } from "./kit";
import { cn } from "@/lib/utils";

const CELL = { width: 300, height: 186, left: 38, right: 10, top: 18, bottom: 30 };

export function QuartetFigure() {
  const [selected, setSelected] = useState<(typeof ANSCOMBE_LABELS)[number]>("Cloud");
  const maxDiff = useMemo(() => quartetMaxDifference(), []);
  const active = QUARTET_SUMMARIES.find((set) => set.label === selected) ?? QUARTET_SUMMARIES[0];

  return (
    <div className="space-y-3">
      <Controls>
        <div role="group" aria-label="Highlight dataset" className="flex flex-wrap gap-1">
          {ANSCOMBE_LABELS.map((label) => (
            <ToggleChip key={label} pressed={selected === label} onClick={() => setSelected(label)}>
              {label}
            </ToggleChip>
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground">
          Same summary statistics; different points.
        </span>
      </Controls>

      <div className="grid gap-2 sm:grid-cols-2">
        {QUARTET_SUMMARIES.map((set) => {
          const isActive = set.label === selected;
          return (
            <figure
              key={set.label}
              className={cn(
                "rounded-xl border bg-background p-2 transition-colors",
                isActive ? "border-foreground/35" : "border-border",
              )}
            >
              <button
                type="button"
                onClick={() => setSelected(set.label)}
                aria-pressed={isActive}
                className="mb-1 flex w-full items-center justify-between gap-2 px-1 text-[11px]"
              >
                <span className="font-medium text-foreground">{set.label}</span>
                <span className="font-mono text-muted-foreground">r {set.summary.correlation.toFixed(3)}</span>
              </button>
              <svg viewBox={`0 0 ${CELL.width} ${CELL.height}`} className="h-auto w-full" role="img" aria-label={`Scatter plot of the ${set.label} dataset with 11 points and its regression line.`}>
                <line
                  x1={CELL.left}
                  x2={CELL.width - CELL.right}
                  y1={CELL.height - CELL.bottom}
                  y2={CELL.height - CELL.bottom}
                  stroke="var(--border-strong)"
                />
                <line
                  x1={CELL.left}
                  x2={CELL.left}
                  y1={CELL.top}
                  y2={CELL.height - CELL.bottom}
                  stroke="var(--border-strong)"
                />
                {[4, 8, 12, 16, 20].map((tick) => (
                  <text
                    key={tick}
                    x={CELL.left + ((tick - 3) / 17) * (CELL.width - CELL.left - CELL.right)}
                    y={CELL.height - 12}
                    textAnchor="middle"
                    fontSize={8}
                    fill="var(--muted-foreground)"
                  >
                    {tick}
                  </text>
                ))}
                {[4, 6, 8, 10, 12].map((tick) => (
                  <text
                    key={tick}
                    x={CELL.left - 4}
                    y={CELL.top + (1 - (tick - 2.5) / 10.5) * (CELL.height - CELL.top - CELL.bottom) + 3}
                    textAnchor="end"
                    fontSize={8}
                    fill="var(--muted-foreground)"
                  >
                    {tick}
                  </text>
                ))}
                <line
                  x1={CELL.left}
                  x2={CELL.width - CELL.right}
                  y1={
                    CELL.top +
                    (1 - (set.summary.intercept + set.summary.slope * 3 - 2.5) / 10.5) *
                      (CELL.height - CELL.top - CELL.bottom)
                  }
                  y2={
                    CELL.top +
                    (1 - (set.summary.intercept + set.summary.slope * 20 - 2.5) / 10.5) *
                      (CELL.height - CELL.top - CELL.bottom)
                  }
                  stroke="var(--chart-2)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                {set.points.map((point, index) => {
                  const cx = CELL.left + ((point.x - 3) / 17) * (CELL.width - CELL.left - CELL.right);
                  const cy =
                    CELL.top + (1 - (point.y - 2.5) / 10.5) * (CELL.height - CELL.top - CELL.bottom);
                  return (
                    <circle
                      key={index}
                      cx={cx}
                      cy={cy}
                      r={isActive ? 4 : 3}
                      fill={isActive ? "var(--chart-1)" : "var(--muted-foreground)"}
                      opacity={isActive ? 1 : 0.55}
                    />
                  );
                })}
                <text x={CELL.width - CELL.right} y={12} textAnchor="end" fontSize={8} fill="var(--muted-foreground)">
                  y
                </text>
                <text x={CELL.width - CELL.right} y={CELL.height - 2} textAnchor="end" fontSize={8} fill="var(--muted-foreground)">
                  x
                </text>
              </svg>
            </figure>
          );
        })}
      </div>

      <LiveReadout>
        <div className="overflow-x-auto rounded-xl border border-border" tabIndex={0}>
          <table className="w-full border-collapse text-[11px]">
            <caption className="sr-only">
              Computed summary statistics for all four Anscombe datasets.
            </caption>
            <thead>
              <tr className="border-b border-border bg-card/60 text-muted-foreground">
                <th scope="col" className="px-2 py-1.5 text-start font-medium">Set</th>
                <th scope="col" className="px-2 py-1.5 text-end font-medium">mean x</th>
                <th scope="col" className="px-2 py-1.5 text-end font-medium">mean y</th>
                <th scope="col" className="px-2 py-1.5 text-end font-medium">var x</th>
                <th scope="col" className="px-2 py-1.5 text-end font-medium">var y</th>
                <th scope="col" className="px-2 py-1.5 text-end font-medium">r</th>
                <th scope="col" className="px-2 py-1.5 text-end font-medium">slope</th>
              </tr>
            </thead>
            <tbody>
              {QUARTET_SUMMARIES.map((set) => (
                <tr
                  key={set.label}
                  className={cn(
                    "border-b border-border last:border-0",
                    set.label === selected && "bg-card/60",
                  )}
                >
                  <th scope="row" className="px-2 py-1.5 text-start font-medium text-foreground">
                    {set.label}
                  </th>
                  <td className="px-2 py-1.5 text-end font-mono">{set.summary.meanX.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-end font-mono">{set.summary.meanY.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-end font-mono">{set.summary.varianceX.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-end font-mono">{set.summary.varianceY.toFixed(3)}</td>
                  <td className="px-2 py-1.5 text-end font-mono">{set.summary.correlation.toFixed(3)}</td>
                  <td className="px-2 py-1.5 text-end font-mono">{set.summary.slope.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
          Largest difference between any set and the first: mean x{" "}
          {maxDiff.meanX.toFixed(2)}, mean y {maxDiff.meanY.toFixed(2)}, var y{" "}
          {maxDiff.varianceY.toFixed(3)}, r {maxDiff.correlation.toFixed(3)}. Rounding,
          not structure.
        </p>
      </LiveReadout>

      <Insight tone="warning">
        The highlighted set is <strong className="font-medium text-foreground">{active.label}</strong>.
        Its summary is a fingerprint that four different processes share. A table of
        means and correlations is not a substitute for seeing the points — and a
        regression line is not evidence that a straight line is the right model.
      </Insight>

      <DataTable
        title="Read the numbers · all 44 points"
        caption="Anscombe's quartet, 1973. Four sets of eleven (x, y) pairs."
        columns={["Set", "x", "y"]}
        rows={QUARTET_SUMMARIES.flatMap((set) =>
          set.points.map((point) => [set.label, point.x, point.y]),
        )}
      />

      <p className="text-[10px] leading-5 text-muted-foreground">
        Source: F. J. Anscombe, “Graphs in Statistical Analysis”, <em>The American
        Statistician</em> 27(1), 1973. The data is reproduced, not simulated.
      </p>
    </div>
  );
}
