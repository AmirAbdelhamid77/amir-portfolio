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
import { formatNumber, formatPercent } from "@/lib/statistics/math";

export function RateBarsChart({
  arms,
  xLabel = "Experiment arm",
  yLabel = "Conversion rate",
  summary,
  caption,
  table,
  legend,
  intervalLabel = "95% Wilson intervals",
}: {
  arms: { label: string; rate: number; lower: number; upper: number; color?: string }[];
  xLabel?: string;
  yLabel?: string;
  summary: string;
  caption?: string;
  table?: ReactNode;
  legend?: ReactNode;
  intervalLabel?: string;
}) {
  const upper = Math.max(...arms.map((arm) => arm.upper), 0.001);
  const yDomain: [number, number] = [0, upper * 1.3];
  const xDomain: [number, number] = [0.4, arms.length + 0.6];
  const slot = PLOT.width / Math.max(1, arms.length);
  const barWidth = Math.min(110, slot * 0.55);

  return (
    <ChartFigure summary={summary} caption={caption} table={table} legend={legend}>
      <ChartFrame
        summary={summary}
        xDomain={xDomain}
        yDomain={yDomain}
        xLabel={xLabel}
        yLabel={yLabel}
        xTicks={arms.map((_, index) => index + 1)}
        xFormat={(value) => arms[value - 1]?.label ?? ""}
        yFormat={(value) => formatPercent(value, 1)}
        grid="y"
      >
        {arms.map((arm, index) => {
          const centre = index + 1;
          const x = xScale(centre, xDomain);
          const top = yScale(arm.rate, yDomain);
          const base = yScale(0, yDomain);
          const color = arm.color ?? (index === 0 ? COLORS.null : COLORS.sample);
          return (
            <g key={arm.label}>
              <rect x={x - barWidth / 2} y={top} width={barWidth} height={base - top} rx={3} fill={color} opacity={index === 0 ? 0.35 : 0.65} />
              <line x1={x} x2={x} y1={yScale(arm.lower, yDomain)} y2={yScale(arm.upper, yDomain)} stroke={COLORS.observed} strokeWidth={1.5} />
              <line x1={x - 7} x2={x + 7} y1={yScale(arm.lower, yDomain)} y2={yScale(arm.lower, yDomain)} stroke={COLORS.observed} strokeWidth={1.5} />
              <line x1={x - 7} x2={x + 7} y1={yScale(arm.upper, yDomain)} y2={yScale(arm.upper, yDomain)} stroke={COLORS.observed} strokeWidth={1.5} />
              <text x={x} y={yScale(arm.upper, yDomain) - 7} textAnchor="middle" fontSize={11} fill={COLORS.observed} fontWeight={600}>
                {formatPercent(arm.rate, 2)}
              </text>
            </g>
          );
        })}
        <text x={CHART.left} y={CHART.top + 10} fontSize={9} fill="var(--muted-foreground)">
          bars show rates; whiskers show {intervalLabel}
        </text>
      </ChartFrame>
    </ChartFigure>
  );
}

export function DifferenceIntervalChart({
  difference,
  lower,
  upper,
  threshold,
  zero = 0,
  unit = "percentage points",
  summary,
  caption,
  table,
  legend,
}: {
  difference: number;
  lower: number;
  upper: number;
  threshold?: number;
  zero?: number;
  unit?: string;
  summary: string;
  caption?: string;
  table?: ReactNode;
  legend?: ReactNode;
}) {
  const values = [lower, upper, difference, zero, threshold ?? lower];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max(0.0005, (max - min) * 0.25);
  const domain: [number, number] = [min - pad, max + pad];
  const yDomain: [number, number] = [0, 1];
  const yMid = CHART.top + PLOT.height / 2;

  return (
    <ChartFigure summary={summary} caption={caption} table={table} legend={legend}>
      <ChartFrame
        summary={summary}
        xDomain={domain}
        yDomain={yDomain}
        xLabel={`Difference (${unit})`}
        yTicks={[0]}
        yFormat={() => ""}
        grid="none"
        xFormat={(value) => formatNumber(value, 3)}
      >
        <line x1={xScale(zero, domain)} x2={xScale(zero, domain)} y1={CHART.top} y2={CHART.top + PLOT.height} stroke={COLORS.null} strokeDasharray="3 3" />
        <text x={xScale(zero, domain) + 3} y={CHART.top + 12} fontSize={9} fill="var(--muted-foreground)">
          no difference
        </text>

        <line x1={xScale(lower, domain)} x2={xScale(upper, domain)} y1={yMid} y2={yMid} stroke={COLORS.sample} strokeWidth={4} strokeLinecap="round" opacity={0.55} />
        <line x1={xScale(lower, domain)} x2={xScale(lower, domain)} y1={yMid - 10} y2={yMid + 10} stroke={COLORS.sample} strokeWidth={1.5} />
        <line x1={xScale(upper, domain)} x2={xScale(upper, domain)} y1={yMid - 10} y2={yMid + 10} stroke={COLORS.sample} strokeWidth={1.5} />
        <circle cx={xScale(difference, domain)} cy={yMid} r={4.5} fill={COLORS.observed} />
        <text x={xScale(difference, domain)} y={yMid - 16} textAnchor="middle" fontSize={10} fill={COLORS.observed} fontWeight={600}>
          {formatNumber(difference, 3)}
        </text>

        {threshold !== undefined ? (
          <g>
            <line x1={xScale(threshold, domain)} x2={xScale(threshold, domain)} y1={CHART.top} y2={CHART.top + PLOT.height} stroke={COLORS.danger} strokeDasharray="5 3" />
            <text x={Math.min(xScale(threshold, domain) + 4, CHART.left + PLOT.width - 96)} y={CHART.top + 26} fontSize={9} fill={COLORS.danger}>
              decision threshold {formatNumber(threshold, 3)}
            </text>
          </g>
        ) : null}
      </ChartFrame>
    </ChartFigure>
  );
}
