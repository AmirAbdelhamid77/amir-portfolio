import type { ReactNode } from "react";
import {
  CHART,
  ChartFigure,
  ChartFrame,
  COLORS,
  xScale,
  yScale,
} from "@/components/statistics/chart-kit";
import { formatNumber, type Regression } from "@/lib/statistics/math";

export interface ScatterPoint {
  x: number;
  y: number;
  group?: string;
}

const GROUP_COLORS = [COLORS.population, COLORS.sample, COLORS.alternative, COLORS.uncertainty];

export function ScatterChart({
  points,
  xDomain,
  yDomain,
  regression,
  rLabel,
  xLabel,
  yLabel,
  summary,
  caption,
  table,
  legend,
  groupLabels,
}: {
  points: readonly ScatterPoint[];
  xDomain?: [number, number];
  yDomain?: [number, number];
  regression?: Regression | null;
  rLabel?: string;
  xLabel: string;
  yLabel: string;
  summary: string;
  caption?: string;
  table?: ReactNode;
  legend?: ReactNode;
  groupLabels?: string[];
}) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const xPad = Math.max(1, (Math.max(...xs) - Math.min(...xs)) * 0.08);
  const yPad = Math.max(1, (Math.max(...ys) - Math.min(...ys)) * 0.12);
  const xd: [number, number] =
    xDomain ?? [Math.min(...xs) - xPad, Math.max(...xs) + xPad];
  const yd: [number, number] =
    yDomain ?? [Math.min(...ys) - yPad, Math.max(...ys) + yPad];
  const groups = [...new Set(points.map((point) => point.group).filter(Boolean))] as string[];
  const colorFor = (point: ScatterPoint) => {
    if (!point.group) return COLORS.population;
    const index = groups.indexOf(point.group);
    return GROUP_COLORS[(index < 0 ? 0 : index) % GROUP_COLORS.length];
  };

  return (
    <ChartFigure summary={summary} caption={caption} table={table} legend={legend}>
      <ChartFrame
        summary={summary}
        xDomain={xd}
        yDomain={yd}
        xLabel={xLabel}
        yLabel={yLabel}
        grid="both"
        xFormat={(value) => formatNumber(value, Number.isInteger(value) ? 0 : 1)}
        yFormat={(value) => formatNumber(value, Number.isInteger(value) ? 0 : 1)}
      >
        {regression && Number.isFinite(regression.slope) ? (
          <line
            x1={xScale(xd[0], xd)}
            y1={yScale(regression.predict(xd[0]), yd)}
            x2={xScale(xd[1], xd)}
            y2={yScale(regression.predict(xd[1]), yd)}
            stroke={COLORS.observed}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            opacity={0.8}
          />
        ) : null}

        {points.map((point, index) => (
          <circle
            key={`${point.x}-${point.y}-${index}`}
            cx={xScale(point.x, xd)}
            cy={yScale(point.y, yd)}
            r={3.4}
            fill={colorFor(point)}
            opacity={0.85}
          />
        ))}

        {rLabel ? (
          <text x={CHART.left + 8} y={CHART.top + 14} fontSize={11} fill={COLORS.observed} fontWeight={600}>
            {rLabel}
          </text>
        ) : null}

        {groups.length > 1 && groupLabels
          ? groupLabels.map((label, index) => (
              <text
                key={label}
                x={CHART.left + 8}
                y={CHART.top + 30 + index * 13}
                fontSize={9}
                fill={GROUP_COLORS[index % GROUP_COLORS.length]}
              >
                ● {label}
              </text>
            ))
          : null}
      </ChartFrame>
    </ChartFigure>
  );
}
