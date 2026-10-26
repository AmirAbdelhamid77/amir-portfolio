"use client";

import { useMemo, useState } from "react";
import { DATASETS } from "@/lib/data-viz/datasets";
import { formatNumber, niceScale, scaleLinear } from "@/lib/data-viz/chart-math";
import {
  ChartCard,
  DataTable,
  Insight,
  KeyNumbers,
  Legend,
  Segmented,
  ToggleChip,
} from "@/components/data-viz/lab-ui";

const DATA = DATASETS["clinic-wait"];
const W = 720;
const H = 360;
const M = { top: 24, right: 24, bottom: 46, left: 96 };
const IW = W - M.left - M.right;
const IH = H - M.top - M.bottom;
const SERIES = [
  { id: "emergency", label: "Emergency", color: "var(--chart-1)" },
  { id: "urgent", label: "Urgent", color: "var(--chart-2)" },
  { id: "routine", label: "Routine", color: "var(--chart-3)" },
] as const;

export function DotLab() {
  const [sort, setSort] = useState<"original" | "routine">("routine");
  const [showRange, setShowRange] = useState(true);

  const view = useMemo(() => {
    const rows = [...DATA.rows].sort((a, b) =>
      sort === "routine" ? a.routine - b.routine : DATA.rows.indexOf(a) - DATA.rows.indexOf(b),
    );
    const all = rows.flatMap((row) => SERIES.map((series) => row[series.id]));
    const ticks = niceScale(0, Math.max(...all) * 1.05, 5);
    const x = scaleLinear({ min: 0, max: ticks.max }, { min: M.left, max: M.left + IW });
    return { rows, ticks, x };
  }, [sort]);

  const { rows, ticks, x } = view;
  const band = IH / rows.length;
  const maxSpread = rows.reduce(
    (best, row) => Math.max(best, Math.max(...SERIES.map((series) => row[series.id])) - Math.min(...SERIES.map((series) => row[series.id]))),
    0,
  );
  const routineSorted = [...rows].sort((a, b) => a.routine - b.routine);
  const fastestRoutine = routineSorted[0];
  const slowestRoutine = routineSorted[routineSorted.length - 1];

  const summary = `Dot plot of median waiting time at ${rows.length} clinics for three departments. Routine waits range from ${fastestRoutine.routine} minutes at ${fastestRoutine.clinic} to ${slowestRoutine.routine} at ${slowestRoutine.clinic}. All three departments share one horizontal scale.`;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
      <div className="min-w-0 space-y-4">
        <ChartCard
          summary={summary}
          caption="Each dot is a median wait for one department. Dots share one scale, so the gaps between departments are directly comparable."
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden="true">
            {ticks.ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={x(tick)}
                  x2={x(tick)}
                  y1={M.top}
                  y2={M.top + IH}
                  stroke="var(--border-strong)"
                  strokeWidth={1}
                />
                <text
                  x={x(tick)}
                  y={M.top + IH + 20}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--muted-foreground)"
                >
                  {formatNumber(tick)}
                </text>
              </g>
            ))}

            {rows.map((row, index) => {
              const cy = M.top + band * (index + 0.5);
              const values = SERIES.map((series) => row[series.id]);
              const low = Math.min(...values);
              const high = Math.max(...values);
              return (
                <g key={row.clinic}>
                  {showRange ? (
                    <line
                      x1={x(low)}
                      x2={x(high)}
                      y1={cy}
                      y2={cy}
                      stroke="var(--border-strong)"
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                  ) : null}
                  {SERIES.map((series, seriesIndex) => {
                    const value = row[series.id];
                    const dy = (seriesIndex - 1) * 8;
                    return (
                      <circle
                        key={series.id}
                        cx={x(value)}
                        cy={cy + dy}
                        r={3.6}
                        fill={series.color}
                        stroke="var(--background)"
                        strokeWidth={1}
                      >
                        <title>{`${row.clinic}, ${series.label}: ${value} minutes`}</title>
                      </circle>
                    );
                  })}
                  <text x={M.left - 10} y={cy + 4} textAnchor="end" fontSize={11} fill="var(--foreground)">
                    {row.clinic}
                  </text>
                </g>
              );
            })}

            <line
              x1={M.left}
              x2={M.left + IW}
              y1={M.top + IH}
              y2={M.top + IH}
              stroke="var(--border-strong)"
              strokeWidth={1}
            />
            <text
              x={M.left + IW / 2}
              y={H - 8}
              textAnchor="middle"
              fontSize={11}
              fill="var(--muted-foreground)"
            >
              Median wait (minutes)
            </text>
          </svg>
        </ChartCard>

        <Legend items={SERIES.map((series) => ({ label: series.label, color: series.color }))} />

        <DataTable
          caption="Median waiting time by clinic and department."
          columns={["Clinic", "Emergency", "Urgent", "Routine", "Spread"]}
          rows={rows.map((row) => {
            const values = SERIES.map((series) => row[series.id]);
            return [
              row.clinic,
              formatNumber(row.emergency),
              formatNumber(row.urgent),
              formatNumber(row.routine),
              formatNumber(Math.max(...values) - Math.min(...values)),
            ];
          })}
        />
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card/40 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Order
          </p>
          <div className="mt-3">
            <Segmented
              label="Clinic order"
              value={sort}
              onChange={setSort}
              options={[
                { value: "routine", label: "By routine wait" },
                { value: "original", label: "Clinic order" },
              ]}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <ToggleChip pressed={showRange} onClick={() => setShowRange((value) => !value)}>
              Range line
            </ToggleChip>
          </div>
        </div>

        <KeyNumbers
          items={[
            { label: "Clinics", value: formatNumber(rows.length) },
            { label: "Fastest routine", value: `${fastestRoutine.routine} min`, note: fastestRoutine.clinic },
            { label: "Slowest routine", value: `${slowestRoutine.routine} min`, note: slowestRoutine.clinic },
            { label: "Widest spread", value: `${maxSpread} min` },
          ]}
        />

        <Insight>
          Three dots per clinic, one shared scale. A stacked bar would force the reader
          to subtract segment heights and would make the total look like the thing that
          matters — but the total wait is not what any one patient experiences.
        </Insight>

        <Insight tone="warning">
          These are medians, not full distributions. A dot plot shows the typical wait;
          a box plot would show the tail. Choose based on whether the reader needs a
          summary or the variation.
        </Insight>
      </div>
    </div>
  );
}
