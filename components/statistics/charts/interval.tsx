import type { ReactNode } from "react";
import {
  CHART,
  ChartFigure,
  ChartFrame,
  COLORS,
  PLOT,
  xScale,
} from "@/components/statistics/chart-kit";
import { formatNumber, type CoverageTrial } from "@/lib/statistics/math";

export function IntervalChart({
  intervals,
  trueMean,
  maxRows = 60,
  xLabel = "Value",
  summary,
  caption,
  table,
  legend,
}: {
  intervals: readonly CoverageTrial[];
  trueMean: number;
  maxRows?: number;
  xLabel?: string;
  summary: string;
  caption?: string;
  table?: ReactNode;
  legend?: ReactNode;
}) {
  const shown = intervals.slice(-maxRows);
  const all = intervals.length ? intervals : [];
  const low = Math.min(trueMean, ...all.map((interval) => interval.lower));
  const high = Math.max(trueMean, ...all.map((interval) => interval.upper));
  const pad = Math.max(0.5, (high - low) * 0.06);
  const xDomain: [number, number] = [low - pad, high + pad];
  const rowHeight = PLOT.height / Math.max(1, shown.length);
  const yDomain: [number, number] = [0, 1];

  return (
    <ChartFigure summary={summary} caption={caption} table={table} legend={legend}>
      <ChartFrame
        summary={summary}
        xDomain={xDomain}
        yDomain={yDomain}
        xLabel={xLabel}
        yTicks={[0]}
        yFormat={() => ""}
        grid="none"
        xFormat={(value) => formatNumber(value, 1)}
        hiddenXTicks={[]}
      >
        {shown.map((interval, index) => {
          const y = CHART.top + (index + 0.5) * rowHeight;
          return (
            <g key={`${interval.lower}-${interval.upper}-${index}`}>
              <line
                x1={xScale(interval.lower, xDomain)}
                x2={xScale(interval.upper, xDomain)}
                y1={y}
                y2={y}
                stroke={interval.covered ? COLORS.sample : COLORS.danger}
                strokeWidth={Math.max(1.2, rowHeight * 0.45)}
                strokeDasharray={interval.covered ? undefined : "3 2"}
                opacity={interval.covered ? 0.8 : 1}
              />
              <circle
                cx={xScale(interval.estimate, xDomain)}
                cy={y}
                r={Math.max(1, rowHeight * 0.18)}
                fill={interval.covered ? COLORS.observed : COLORS.danger}
              />
            </g>
          );
        })}

        <line
          x1={xScale(trueMean, xDomain)}
          x2={xScale(trueMean, xDomain)}
          y1={CHART.top}
          y2={CHART.top + PLOT.height}
          stroke={COLORS.observed}
          strokeWidth={2}
        />
        <text
          x={Math.min(xScale(trueMean, xDomain) + 4, CHART.left + PLOT.width - 76)}
          y={CHART.top - 5}
          fontSize={10}
          fill={COLORS.observed}
          fontWeight={600}
        >
          true μ = {formatNumber(trueMean, 1)}
        </text>
        <text
          x={CHART.left}
          y={CHART.top + PLOT.height + 32}
          fontSize={9}
          fill="var(--muted-foreground)"
        >
          last {shown.length} of {all.length} intervals
        </text>
      </ChartFrame>
    </ChartFigure>
  );
}
