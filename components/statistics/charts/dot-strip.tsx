import type { ReactNode } from "react";
import {
  CHART,
  ChartFigure,
  ChartFrame,
  COLORS,
  PLOT,
  xScale,
} from "@/components/statistics/chart-kit";
import { formatNumber, type Summary } from "@/lib/statistics/math";

export function DotStripChart({
  values,
  summary,
  showSdBand = true,
  showBox = true,
  xLabel = "Value",
  summaryText,
  caption,
  table,
  legend,
}: {
  values: readonly number[];
  summary: Summary;
  showSdBand?: boolean;
  showBox?: boolean;
  xLabel?: string;
  summaryText: string;
  caption?: string;
  table?: ReactNode;
  legend?: ReactNode;
}) {
  const clean = values.filter((value) => Number.isFinite(value));
  const min = Math.min(...clean, summary.mean, summary.median);
  const max = Math.max(...clean, summary.mean, summary.median);
  const pad = Math.max(1, (max - min) * 0.12);
  const xDomain: [number, number] = [min - pad, max + pad];
  const yDomain: [number, number] = [0, 1];

  const counts = new Map<number, number>();
  for (const value of clean) counts.set(value, (counts.get(value) ?? 0) + 1);
  const maxStack = Math.max(1, ...counts.values());
  const lowerLimit = CHART.top + 34;
  const upperLimit = CHART.top + PLOT.height - (showBox ? 86 : 26);
  const rowHeight = Math.min(14, Math.max(6, (upperLimit - lowerLimit) / Math.max(1, maxStack)));
  const dotY = (row: number) => upperLimit - row * rowHeight;
  const boxY = CHART.top + PLOT.height - 42;
  const bandTop = CHART.top + 30;

  return (
    <ChartFigure summary={summaryText} caption={caption} table={table} legend={legend}>
      <ChartFrame
        summary={summaryText}
        xDomain={xDomain}
        yDomain={yDomain}
        xLabel={xLabel}
        yTicks={[0]}
        yFormat={() => ""}
        grid="none"
        xFormat={(value) => formatNumber(value, value % 1 === 0 ? 0 : 1)}
      >
        {showSdBand && Number.isFinite(summary.sampleSd) ? (
          <g>
            <rect
              x={xScale(Math.max(xDomain[0], summary.mean - summary.sampleSd), xDomain)}
              y={bandTop}
              width={Math.max(
                0,
                xScale(Math.min(xDomain[1], summary.mean + summary.sampleSd), xDomain) -
                  xScale(Math.max(xDomain[0], summary.mean - summary.sampleSd), xDomain),
              )}
              height={boxY - bandTop - 8}
              fill={COLORS.population}
              opacity={0.08}
            />
            <text x={CHART.left + 4} y={bandTop + 10} fontSize={9} fill="var(--muted-foreground)">
              mean ± 1 SD (shaded)
            </text>
          </g>
        ) : null}

        {clean.map((value, index) => {
          const prior = clean.slice(0, index).filter((item) => item === value).length;
          return (
            <circle
              key={`${value}-${index}`}
              cx={xScale(value, xDomain)}
              cy={dotY(prior)}
              r={3.2}
              fill={COLORS.sample}
              opacity={0.85}
            />
          );
        })}

        <line
          x1={xScale(summary.mean, xDomain)}
          x2={xScale(summary.mean, xDomain)}
          y1={CHART.top}
          y2={boxY + 8}
          stroke={COLORS.observed}
          strokeWidth={1.5}
        />
        <text x={xScale(summary.mean, xDomain) + 4} y={CHART.top + 11} fontSize={10} fill={COLORS.observed}>
          mean {formatNumber(summary.mean, 2)}
        </text>

        <line
          x1={xScale(summary.median, xDomain)}
          x2={xScale(summary.median, xDomain)}
          y1={CHART.top + 18}
          y2={boxY + 8}
          stroke={COLORS.alternative}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        <text
          x={xScale(summary.median, xDomain) + 4}
          y={CHART.top + 29}
          fontSize={10}
          fill={COLORS.alternative}
        >
          median {formatNumber(summary.median, 2)}
        </text>

        {showBox ? (
          <g>
            <line
              x1={xScale(summary.whiskerLow, xDomain)}
              x2={xScale(summary.q1, xDomain)}
              y1={boxY}
              y2={boxY}
              stroke={COLORS.observed}
              strokeWidth={1.2}
            />
            <line
              x1={xScale(summary.q3, xDomain)}
              x2={xScale(summary.whiskerHigh, xDomain)}
              y1={boxY}
              y2={boxY}
              stroke={COLORS.observed}
              strokeWidth={1.2}
            />
            <line
              x1={xScale(summary.whiskerLow, xDomain)}
              x2={xScale(summary.whiskerLow, xDomain)}
              y1={boxY - 7}
              y2={boxY + 7}
              stroke={COLORS.observed}
            />
            <line
              x1={xScale(summary.whiskerHigh, xDomain)}
              x2={xScale(summary.whiskerHigh, xDomain)}
              y1={boxY - 7}
              y2={boxY + 7}
              stroke={COLORS.observed}
            />
            <rect
              x={xScale(summary.q1, xDomain)}
              y={boxY - 7}
              width={Math.max(1, xScale(summary.q3, xDomain) - xScale(summary.q1, xDomain))}
              height={14}
              rx={2}
              fill={COLORS.population}
              opacity={0.28}
              stroke={COLORS.population}
            />
            <line
              x1={xScale(summary.median, xDomain)}
              x2={xScale(summary.median, xDomain)}
              y1={boxY - 7}
              y2={boxY + 7}
              stroke={COLORS.alternative}
              strokeWidth={2}
            />
            {summary.outliers.map((outlier, index) => (
              <circle
                key={`outlier-${outlier}-${index}`}
                cx={xScale(outlier, xDomain)}
                cy={boxY}
                r={3.6}
                fill="none"
                stroke={COLORS.danger}
                strokeWidth={1.5}
              />
            ))}
            <text x={CHART.left} y={boxY + 24} fontSize={9} fill="var(--muted-foreground)">
              box plot · Q₁–Q₃, median, 1.5×IQR fences
            </text>
          </g>
        ) : null}
      </ChartFrame>
    </ChartFigure>
  );
}
