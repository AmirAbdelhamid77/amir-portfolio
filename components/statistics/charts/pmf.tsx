import type { ReactNode } from "react";
import {
  CHART,
  ChartFigure,
  ChartFrame,
  COLORS,
  PLOT,
  xScale,
  yScale,
} from "@/components/statistics/chart-kit";
import { formatNumber } from "@/lib/statistics/math";

export interface PmfBar {
  k: number;
  p: number;
}

export function PmfChart({
  bars,
  highlight,
  meanLine,
  xLabel,
  yLabel = "Probability",
  summary,
  caption,
  table,
  legend,
  mode = "pmf",
  valueLabel,
}: {
  bars: readonly PmfBar[];
  highlight: (k: number) => boolean;
  meanLine?: number;
  xLabel: string;
  yLabel?: string;
  summary: string;
  caption?: string;
  table?: ReactNode;
  legend?: ReactNode;
  mode?: "pmf" | "count";
  valueLabel?: (k: number) => boolean;
}) {
  const max = Math.max(...bars.map((bar) => bar.p), Number.EPSILON);
  const yDomain: [number, number] = [0, max * 1.18];
  const xDomain: [number, number] = [
    Math.min(...bars.map((bar) => bar.k)) - 0.6,
    Math.max(...bars.map((bar) => bar.k)) + 0.6,
  ];
  const slot = PLOT.width / Math.max(1, bars.length);
  const barWidth = Math.max(1.5, Math.min(26, slot * 0.68));
  const labelEvery = Math.max(1, Math.ceil(bars.length / 12));
  const maxTop = CHART.top + PLOT.height;

  return (
    <ChartFigure summary={summary} caption={caption} table={table} legend={legend}>
      <ChartFrame
        summary={summary}
        xDomain={xDomain}
        yDomain={yDomain}
        xLabel={xLabel}
        yLabel={yLabel}
        xFormat={(value) => formatNumber(value, 0)}
        yFormat={(value) => formatNumber(value, mode === "pmf" ? 2 : 0)}
        hiddenXTicks={bars.filter((bar) => bar.k % labelEvery !== 0).map((bar) => bar.k)}
      >
        {bars.map((bar) => {
          const active = highlight(bar.k);
          const height = Math.max(0, maxTop - yScale(bar.p, yDomain));
          return (
            <g key={bar.k}>
              <rect
                x={xScale(bar.k, xDomain) - barWidth / 2}
                y={yScale(bar.p, yDomain)}
                width={barWidth}
                height={height}
                rx={Math.min(3, barWidth / 3)}
                fill={active ? COLORS.observed : COLORS.population}
                opacity={active ? 0.95 : 0.42}
                stroke={active ? COLORS.observed : "transparent"}
                strokeWidth={1}
              />
              {bars.length <= 24 || valueLabel?.(bar.k) ? (
                <text
                  x={xScale(bar.k, xDomain)}
                  y={yScale(bar.p, yDomain) - 4}
                  textAnchor="middle"
                  fontSize={10}
                  fill={active ? COLORS.observed : "var(--muted-foreground)"}
                >
                  {mode === "pmf" ? `${formatNumber(bar.p * 100, 1)}%` : formatNumber(bar.p, 0)}
                </text>
              ) : null}
            </g>
          );
        })}

        {meanLine !== undefined && Number.isFinite(meanLine) ? (
          <g>
            <line
              x1={xScale(meanLine, xDomain)}
              x2={xScale(meanLine, xDomain)}
              y1={CHART.top}
              y2={maxTop}
              stroke={COLORS.alternative}
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <text
              x={Math.min(xScale(meanLine, xDomain) + 4, CHART.left + PLOT.width - 58)}
              y={CHART.top + 11}
              fontSize={10}
              fill={COLORS.alternative}
            >
              mean = {formatNumber(meanLine, 1)}
            </text>
          </g>
        ) : null}
      </ChartFrame>
    </ChartFigure>
  );
}
