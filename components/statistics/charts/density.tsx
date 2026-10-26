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

const CHART_TOP = CHART.top;
const PLOT_HEIGHT = PLOT.height;

export interface ShadeRange {
  kind: "left" | "right" | "between" | "two";
  from?: number;
  to?: number;
  label?: string;
}

function areaPath(
  x0: number,
  x1: number,
  pdf: (x: number) => number,
  xDomain: [number, number],
  yDomain: [number, number],
  samples = 160,
): string {
  const start = Math.max(x0, xDomain[0]);
  const end = Math.min(x1, xDomain[1]);
  if (!(end > start)) return "";
  const points: string[] = [`M${xScale(start, xDomain).toFixed(2)},${yScale(0, yDomain).toFixed(2)}`];
  for (let index = 0; index <= samples; index += 1) {
    const x = start + ((end - start) * index) / samples;
    points.push(`L${xScale(x, xDomain).toFixed(2)},${yScale(pdf(x), yDomain).toFixed(2)}`);
  }
  points.push(`L${xScale(end, xDomain).toFixed(2)},${yScale(0, yDomain).toFixed(2)}`);
  points.push("Z");
  return points.join(" ");
}

export function DensityChart({
  mu,
  sigma,
  xDomain,
  shades = [],
  markers = [],
  empirical = false,
  xLabel = "Value",
  yLabel = "Density (not probability)",
  summary,
  caption,
  table,
  legend,
}: {
  mu: number;
  sigma: number;
  xDomain?: [number, number];
  shades?: ShadeRange[];
  markers?: { x: number; label: string; color?: string; dashed?: boolean }[];
  empirical?: boolean;
  xLabel?: string;
  yLabel?: string;
  summary: string;
  caption?: string;
  table?: ReactNode;
  legend?: ReactNode;
}) {
  const domain: [number, number] = xDomain ?? [mu - 4 * sigma, mu + 4 * sigma];
  const pdf = (x: number) => Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
  const peak = pdf(mu);
  const yDomain: [number, number] = [0, peak * 1.22];
  const curve: string[] = [];
  for (let index = 0; index <= 220; index += 1) {
    const x = domain[0] + ((domain[1] - domain[0]) * index) / 220;
    curve.push(`${index ? "L" : "M"}${xScale(x, domain).toFixed(2)},${yScale(pdf(x), yDomain).toFixed(2)}`);
  }
  const sdLines = [-3, -2, -1, 0, 1, 2, 3].map((z) => ({ z, x: mu + z * sigma }));
  const shadeColors = [COLORS.pvalue, COLORS.uncertainty, COLORS.sample, COLORS.alternative];

  return (
    <ChartFigure summary={summary} caption={caption} table={table} legend={legend}>
      <ChartFrame
        summary={summary}
        xDomain={domain}
        yDomain={yDomain}
        xLabel={xLabel}
        yLabel={yLabel}
        xFormat={(value) => formatNumber(value, 1)}
        yFormat={(value) => formatNumber(value, 3)}
      >
        {empirical ? (
          <>
            {[
              { z: 1, width: 0.68, label: "68%" },
              { z: 2, width: 0.95, label: "95%" },
              { z: 3, width: 0.997, label: "99.7%" },
            ].map((band, index) => (
              <g key={band.label}>
                <rect
                  x={xScale(mu - band.z * sigma, domain)}
                  y={yScale(peak * 1.1, yDomain)}
                  width={xScale(mu + band.z * sigma, domain) - xScale(mu - band.z * sigma, domain)}
                  height={6}
                  rx={2}
                  fill={COLORS.population}
                  opacity={0.22 + index * 0.08}
                />
                <text
                  x={xScale(mu + band.z * sigma, domain) + 4}
                  y={yScale(peak * 1.1, yDomain) + 5}
                  fontSize={9}
                  fill="var(--muted-foreground)"
                >
                  {band.label}
                </text>
              </g>
            ))}
          </>
        ) : null}

        {shades.map((shade, index) => {
          const color = shadeColors[index % shadeColors.length];
          let path = "";
          if (shade.kind === "left" && shade.to !== undefined) {
            path = areaPath(domain[0], shade.to, pdf, domain, yDomain);
          } else if (shade.kind === "right" && shade.from !== undefined) {
            path = areaPath(shade.from, domain[1], pdf, domain, yDomain);
          } else if (shade.kind === "between" && shade.from !== undefined && shade.to !== undefined) {
            path = areaPath(shade.from, shade.to, pdf, domain, yDomain);
          } else if (shade.kind === "two" && shade.from !== undefined) {
            const left = areaPath(domain[0], mu - (shade.from - mu), pdf, domain, yDomain);
            const right = areaPath(shade.from, domain[1], pdf, domain, yDomain);
            return (
              <g key={`shade-${index}`}>
                {left ? <path d={left} fill={color} opacity={0.28} /> : null}
                {right ? <path d={right} fill={color} opacity={0.28} /> : null}
              </g>
            );
          }
          if (!path) return null;
          return <path key={`shade-${index}`} d={path} fill={color} opacity={0.28} />;
        })}

        <path d={curve.join(" ")} fill="none" stroke={COLORS.population} strokeWidth={2} />

        {sdLines.map(({ z, x }) => (
          <line
            key={`sd-${z}`}
            x1={xScale(x, domain)}
            x2={xScale(x, domain)}
            y1={CHART_TOP + PLOT_HEIGHT}
            y2={CHART_TOP + PLOT_HEIGHT - (z === 0 ? 10 : 5)}
            stroke={COLORS.population}
            strokeWidth={1}
            opacity={z === 0 ? 0.8 : 0.5}
          />
        ))}

        <line
          x1={xScale(mu, domain)}
          x2={xScale(mu, domain)}
          y1={CHART_TOP}
          y2={CHART_TOP + PLOT_HEIGHT}
          stroke={COLORS.observed}
          strokeDasharray="4 4"
          opacity={0.55}
        />
        <text x={xScale(mu, domain) + 4} y={CHART_TOP + 11} fontSize={10} fill={COLORS.observed}>
          μ = {formatNumber(mu, 1)}
        </text>

        {markers.map((marker) => (
          <g key={marker.label}>
            <line
              x1={xScale(marker.x, domain)}
              x2={xScale(marker.x, domain)}
              y1={CHART_TOP}
              y2={CHART_TOP + PLOT_HEIGHT}
              stroke={marker.color ?? COLORS.observed}
              strokeWidth={1.5}
              strokeDasharray={marker.dashed ? "3 3" : undefined}
            />
            <circle
              cx={xScale(marker.x, domain)}
              cy={yScale(pdf(marker.x), yDomain)}
              r={3.5}
              fill={marker.color ?? COLORS.observed}
            />
            <text
              x={xScale(marker.x, domain) + 5}
              y={yScale(pdf(marker.x), yDomain) + 4}
              fontSize={10}
              fill={marker.color ?? COLORS.observed}
            >
              {marker.label}
            </text>
          </g>
        ))}
      </ChartFrame>
    </ChartFigure>
  );
}
