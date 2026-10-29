"use client";

import { useMemo, useState } from "react";
import { DATASETS } from "@/lib/data-viz/datasets";
import { formatCompact, formatNumber, niceScale, scaleLinear } from "@/lib/data-viz/chart-math";
import {
  ChartCard,
  DataTable,
  Insight,
  KeyNumbers,
  Legend,
  ToggleChip,
} from "@/components/data-viz/lab-ui";

const DATA = DATASETS["weekly-sessions"];
const W = 720;
const H = 360;
const M = { top: 24, right: 24, bottom: 46, left: 62 };
const IW = W - M.left - M.right;
const IH = H - M.top - M.bottom;
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

function logTicks(min: number, max: number) {
  const ticks: number[] = [];
  const start = Math.floor(Math.log10(Math.max(1, min)));
  const end = Math.ceil(Math.log10(Math.max(10, max)));
  for (let power = start; power <= end; power += 1) {
    for (const multiplier of [1, 2, 5]) {
      const value = multiplier * 10 ** power;
      if (value >= min * 0.9 && value <= max * 1.1) ticks.push(value);
    }
  }
  return ticks;
}

export function LineLab() {
  const [visible, setVisible] = useState<string[]>(DATA.series.map((series) => series.id));
  const [logY, setLogY] = useState(false);
  const [showPoints, setShowPoints] = useState(true);

  const series = DATA.series.filter((item) => visible.includes(item.id));

  const view = useMemo(() => {
    const weeks = DATA.series[0]?.points.length ?? 0;
    const values = series.flatMap((item) => item.points);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const yTicks = logY
      ? { min: Math.max(1, min * 0.75), max: max * 1.25, ticks: logTicks(min * 0.75, max * 1.25) }
      : niceScale(0, max * 1.08, 5);
    const x = scaleLinear({ min: 0, max: Math.max(1, weeks - 1) }, { min: M.left, max: M.left + IW });
    const y = scaleLinear({ min: logY ? Math.log10(yTicks.min) : yTicks.min, max: logY ? Math.log10(yTicks.max) : yTicks.max }, { min: M.top + IH, max: M.top });
    const py = (value: number) => y(logY ? Math.log10(Math.max(1, value)) : value);
    return { weeks, yTicks, x, py };
  }, [series, logY]);

  const { weeks, yTicks, x, py } = view;
  const firstTotal = DATA.series.reduce((total, item) => total + (item.points[0] ?? 0), 0);
  const lastTotal = DATA.series.reduce((total, item) => total + (item.points[item.points.length - 1] ?? 0), 0);
  const growth = ((lastTotal - firstTotal) / firstTotal) * 100;

  const summary = `Line chart of ${series.length} channels over ${weeks} weeks. Total sessions moved from ${formatNumber(firstTotal)} in week one to ${formatNumber(lastTotal)} in week ${weeks}, a change of ${growth.toFixed(1)} percent.${logY ? " The vertical axis is logarithmic." : ""}`;

  const toggle = (id: string) => {
    setVisible((current) => {
      if (current.includes(id)) {
        if (current.length === 1) return current;
        return current.filter((item) => item !== id);
      }
      return [...current, id];
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
      <div className="min-w-0 space-y-4">
        <ChartCard
          summary={summary}
          caption="Weeks are equally spaced and conceptually connected, which is what licenses the line. A categorical axis would not."
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden="true">
            {yTicks.ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={M.left}
                  x2={M.left + IW}
                  y1={py(tick)}
                  y2={py(tick)}
                  stroke="var(--border-strong)"
                  strokeWidth={1}
                />
                <text
                  x={M.left - 8}
                  y={py(tick) + 4}
                  textAnchor="end"
                  fontSize={11}
                  fill="var(--muted-foreground)"
                >
                  {formatCompact(tick)}
                </text>
              </g>
            ))}

            {Array.from({ length: Math.ceil(weeks / 4) }, (_, index) => index * 4)
              .filter((week) => week < weeks)
              .map((week) => (
                <text
                  key={`x-${week}`}
                  x={x(week)}
                  y={M.top + IH + 20}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--muted-foreground)"
                >
                  {week + 1}
                </text>
              ))}

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
              Week
            </text>
            <text
              transform={`translate(16 ${M.top + IH / 2}) rotate(-90)`}
              textAnchor="middle"
              fontSize={11}
              fill="var(--muted-foreground)"
            >
              Sessions{logY ? " (log)" : ""}
            </text>

            {series.map((item) => {
              const index = DATA.series.findIndex((entry) => entry.id === item.id);
              const color = COLORS[index % COLORS.length];
              const path = item.points
                .map((value, week) => `${week === 0 ? "M" : "L"}${x(week)} ${py(value)}`)
                .join(" ");
              return (
                <g key={item.id}>
                  <path d={path} fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" />
                  {showPoints
                    ? item.points.map((value, week) => (
                        <circle key={week} cx={x(week)} cy={py(value)} r={2.4} fill={color}>
                          <title>{`${item.label}, week ${week + 1}: ${formatNumber(value)} sessions`}</title>
                        </circle>
                      ))
                    : null}
                </g>
              );
            })}
          </svg>
        </ChartCard>

        <Legend
          items={DATA.series.map((item, index) => ({
            label: item.label,
            color: COLORS[index % COLORS.length],
          }))}
        />

        <DataTable
          caption="Weekly synthetic sessions by channel, with the weekly total."
          columns={["Week", ...DATA.series.map((item) => item.label), "Total"]}
          rows={Array.from({ length: weeks }, (_, week) => {
            const values = DATA.series.map((item) => item.points[week] ?? 0);
            return [
              formatNumber(week + 1),
              ...values.map((value) => formatNumber(value)),
              formatNumber(values.reduce((total, value) => total + value, 0)),
            ];
          })}
        />
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card/40 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Series
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DATA.series.map((item) => (
              <ToggleChip
                key={item.id}
                pressed={visible.includes(item.id)}
                onClick={() => toggle(item.id)}
              >
                {item.label}
              </ToggleChip>
            ))}
          </div>
          <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
            One series always stays visible.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Scale
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ToggleChip pressed={logY} onClick={() => setLogY((value) => !value)}>
              Log y-axis
            </ToggleChip>
            <ToggleChip pressed={showPoints} onClick={() => setShowPoints((value) => !value)}>
              Observation points
            </ToggleChip>
          </div>
        </div>

        <KeyNumbers
          items={[
            { label: "Weeks", value: formatNumber(weeks) },
            { label: "Week 1 total", value: formatCompact(firstTotal) },
            { label: "Latest total", value: formatCompact(lastTotal) },
            { label: "Change", value: `${growth.toFixed(1)}%` },
          ]}
        />

        <Insight>
          {logY
            ? "On a log axis, equal vertical distances are equal percentage changes. Exponential growth looks like a straight line; read the axis label before calling it linear."
            : "On a linear axis, absolute change dominates. The same series can look flat or explosive depending on the scale you choose."}
        </Insight>

        <Insight tone="warning">
          The lines connect weeks because weeks are ordered. Do not reuse this chart for
          channels, segments, or any category without a continuous sequence.
        </Insight>
      </div>
    </div>
  );
}
