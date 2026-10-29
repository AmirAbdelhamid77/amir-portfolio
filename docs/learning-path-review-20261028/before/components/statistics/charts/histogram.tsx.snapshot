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
import { formatNumber, histogram } from "@/lib/statistics/math";

export function HistogramChart({
  values,
  binCount = 14,
  xDomain,
  color = COLORS.sample,
  meanLine,
  overlay,
  xLabel,
  yLabel = "Count",
  summary,
  caption,
  table,
  legend,
}: {
  values: readonly number[];
  binCount?: number;
  xDomain: [number, number];
  color?: string;
  meanLine?: number;
  overlay?: { pdf: (x: number) => number; color: string; label: string };
  xLabel: string;
  yLabel?: string;
  summary: string;
  caption?: string;
  table?: ReactNode;
  legend?: ReactNode;
}) {
  const result = histogram(values, binCount);
  const width = result.bins[0] ? result.bins[0].x1 - result.bins[0].x0 : 1;
  const overlayPeak = overlay
    ? Math.max(
        ...result.bins.map(
          (bin) => overlay.pdf((bin.x0 + bin.x1) / 2) * result.total * width,
        ),
      )
    : 0;
  const yMax = Math.max(result.max, overlayPeak, 1);
  const yDomain: [number, number] = [0, yMax * 1.2];
  const gap = Math.min(2, width * 0.1);

  const overlayPath = overlay
    ? Array.from({ length: 160 }, (_, index) => {
        const x = xDomain[0] + ((xDomain[1] - xDomain[0]) * index) / 159;
        return `${index ? "L" : "M"}${xScale(x, xDomain).toFixed(2)},${yScale(
          overlay.pdf(x) * result.total * width,
          yDomain,
        ).toFixed(2)}`;
      }).join(" ")
    : "";

  return (
    <ChartFigure summary={summary} caption={caption} table={table} legend={legend}>
      <ChartFrame
        summary={summary}
        xDomain={xDomain}
        yDomain={yDomain}
        xLabel={xLabel}
        yLabel={yLabel}
        xFormat={(value) => formatNumber(value, Number.isInteger(value) ? 0 : 1)}
        yFormat={(value) => formatNumber(value, 0)}
      >
        {result.bins.map((bin) => {
          const x = xScale(bin.x0, xDomain);
          const barWidth = Math.max(
            1,
            xScale(bin.x1, xDomain) - x - gap,
          );
          return (
            <rect
              key={`${bin.x0}`}
              x={x + gap / 2}
              y={yScale(bin.count, yDomain)}
              width={barWidth}
              height={CHART.top + PLOT.height - yScale(bin.count, yDomain)}
              fill={color}
              opacity={0.55}
              rx={1.5}
            />
          );
        })}

        {overlay && overlayPath ? (
          <path d={overlayPath} fill="none" stroke={overlay.color} strokeWidth={2} />
        ) : null}

        {meanLine !== undefined && Number.isFinite(meanLine) ? (
          <g>
            <line
              x1={xScale(meanLine, xDomain)}
              x2={xScale(meanLine, xDomain)}
              y1={CHART.top}
              y2={CHART.top + PLOT.height}
              stroke={COLORS.observed}
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <text
              x={Math.min(xScale(meanLine, xDomain) + 4, CHART.left + PLOT.width - 70)}
              y={CHART.top + 12}
              fontSize={10}
              fill={COLORS.observed}
            >
              mean {formatNumber(meanLine, 1)}
            </text>
          </g>
        ) : null}
      </ChartFrame>
    </ChartFigure>
  );
}
