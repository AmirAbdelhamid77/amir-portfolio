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
import { formatNumber, normalCdf, normalPdf, normalQuantile } from "@/lib/statistics/math";

function area(
  from: number,
  to: number,
  mean: number,
  domain: [number, number],
  yDomain: [number, number],
  samples = 120,
): string {
  const start = Math.max(from, domain[0]);
  const end = Math.min(to, domain[1]);
  if (!(end > start)) return "";
  const points = [`M${xScale(start, domain).toFixed(2)},${yScale(0, yDomain).toFixed(2)}`];
  for (let index = 0; index <= samples; index += 1) {
    const x = start + ((end - start) * index) / samples;
    points.push(`L${xScale(x, domain).toFixed(2)},${yScale(normalPdf(x, mean, 1), yDomain).toFixed(2)}`);
  }
  points.push(`L${xScale(end, domain).toFixed(2)},${yScale(0, yDomain).toFixed(2)}`);
  points.push("Z");
  return points.join(" ");
}

export function NullAlternativeChart({
  ncp,
  alpha,
  twoSided = true,
  observed,
  summary,
  caption,
  table,
  legend,
}: {
  ncp: number;
  alpha: number;
  twoSided?: boolean;
  observed?: number;
  summary: string;
  caption?: string;
  table?: ReactNode;
  legend?: ReactNode;
}) {
  const critical = normalQuantile(1 - (twoSided ? alpha / 2 : alpha));
  const domain: [number, number] = [-4.6, Math.max(4.6, ncp + 4)];
  const peak = Math.max(normalPdf(0), normalPdf(ncp, ncp, 1));
  const yDomain: [number, number] = [0, peak * 1.3];
  const nullPath = Array.from({ length: 220 }, (_, index) => {
    const x = domain[0] + ((domain[1] - domain[0]) * index) / 219;
    return `${index ? "L" : "M"}${xScale(x, domain).toFixed(2)},${yScale(normalPdf(x), yDomain).toFixed(2)}`;
  }).join(" ");
  const altPath = Array.from({ length: 220 }, (_, index) => {
    const x = domain[0] + ((domain[1] - domain[0]) * index) / 219;
    return `${index ? "L" : "M"}${xScale(x, domain).toFixed(2)},${yScale(normalPdf(x, ncp, 1), yDomain).toFixed(2)}`;
  }).join(" ");
  const beta = twoSided
    ? normalCdf(critical, ncp, 1) - normalCdf(-critical, ncp, 1)
    : normalCdf(critical, ncp, 1);
  const power = 1 - beta;

  return (
    <ChartFigure summary={summary} caption={caption} table={table} legend={legend}>
      <ChartFrame
        summary={summary}
        xDomain={domain}
        yDomain={yDomain}
        xLabel="Test statistic (standard errors from H₀)"
        yLabel="Density under the model"
        xFormat={(value) => formatNumber(value, 1)}
        yFormat={(value) => formatNumber(value, 3)}
      >
        <defs>
          <pattern id="critical-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="5" stroke={COLORS.observed} strokeWidth="1" opacity="0.22" />
          </pattern>
        </defs>

        {twoSided ? (
          <>
            <path d={area(domain[0], -critical, 0, domain, yDomain)} fill="url(#critical-hatch)" />
            <path d={area(critical, domain[1], 0, domain, yDomain)} fill="url(#critical-hatch)" />
            <path d={area(-critical, critical, ncp, domain, yDomain)} fill={COLORS.danger} opacity={0.18} />
            <path d={area(domain[0], -critical, ncp, domain, yDomain)} fill={COLORS.sample} opacity={0.24} />
            <path d={area(critical, domain[1], ncp, domain, yDomain)} fill={COLORS.sample} opacity={0.24} />
          </>
        ) : (
          <>
            <path d={area(critical, domain[1], 0, domain, yDomain)} fill="url(#critical-hatch)" />
            <path d={area(domain[0], critical, ncp, domain, yDomain)} fill={COLORS.danger} opacity={0.18} />
            <path d={area(critical, domain[1], ncp, domain, yDomain)} fill={COLORS.sample} opacity={0.24} />
          </>
        )}

        <path d={nullPath} fill="none" stroke={COLORS.null} strokeWidth={2} />
        <path d={altPath} fill="none" stroke={COLORS.alternative} strokeWidth={2} strokeDasharray="6 4" />

        {twoSided ? (
          <>
            <line x1={xScale(-critical, domain)} x2={xScale(-critical, domain)} y1={CHART.top} y2={CHART.top + PLOT.height} stroke={COLORS.observed} strokeDasharray="3 3" />
            <line x1={xScale(critical, domain)} x2={xScale(critical, domain)} y1={CHART.top} y2={CHART.top + PLOT.height} stroke={COLORS.observed} strokeDasharray="3 3" />
            <text x={xScale(critical, domain) + 4} y={CHART.top + 12} fontSize={9} fill="var(--muted-foreground)">
              critical ±{formatNumber(critical, 2)}
            </text>
          </>
        ) : (
          <>
            <line x1={xScale(critical, domain)} x2={xScale(critical, domain)} y1={CHART.top} y2={CHART.top + PLOT.height} stroke={COLORS.observed} strokeDasharray="3 3" />
            <text x={xScale(critical, domain) + 4} y={CHART.top + 12} fontSize={9} fill="var(--muted-foreground)">
              critical {formatNumber(critical, 2)}
            </text>
          </>
        )}

        <text x={CHART.left + 8} y={CHART.top + 12} fontSize={9} fill={COLORS.null} fontWeight={600}>
          H₀ model
        </text>
        <text
          x={Math.min(xScale(ncp, domain) + 6, CHART.left + PLOT.width - 84)}
          y={CHART.top + 26}
          fontSize={9}
          fill={COLORS.alternative}
          fontWeight={600}
        >
          H₁ model (δ={formatNumber(ncp, 2)})
        </text>

        <text x={CHART.left + 8} y={CHART.top + 44} fontSize={10} fill={COLORS.danger}>
          β = {formatNumber(beta, 3)}
        </text>
        <text x={CHART.left + 8} y={CHART.top + 58} fontSize={10} fill={COLORS.sample}>
          power = {formatNumber(power, 3)}
        </text>
        <text x={CHART.left + 8} y={CHART.top + 72} fontSize={10} fill="var(--muted-foreground)">
          α = {formatNumber(alpha, 3)}
        </text>

        {observed !== undefined ? (
          <g>
            <line x1={xScale(observed, domain)} x2={xScale(observed, domain)} y1={CHART.top} y2={CHART.top + PLOT.height} stroke={COLORS.observed} strokeWidth={2} />
            <text x={xScale(observed, domain) + 5} y={CHART.top + PLOT.height - 6} fontSize={10} fill={COLORS.observed}>
              observed {formatNumber(observed, 2)}
            </text>
          </g>
        ) : null}
      </ChartFrame>
    </ChartFigure>
  );
}

export function PValueChart({
  z,
  alternative,
  alpha,
  p,
  summary,
  caption,
  table,
  legend,
}: {
  z: number;
  alternative: "two-sided" | "greater" | "less";
  alpha: number;
  p: number;
  summary: string;
  caption?: string;
  table?: ReactNode;
  legend?: ReactNode;
}) {
  const domain: [number, number] = [-4.4, 4.4];
  const yDomain: [number, number] = [0, normalPdf(0) * 1.35];
  const curve = Array.from({ length: 220 }, (_, index) => {
    const x = domain[0] + ((domain[1] - domain[0]) * index) / 219;
    return `${index ? "L" : "M"}${xScale(x, domain).toFixed(2)},${yScale(normalPdf(x), yDomain).toFixed(2)}`;
  }).join(" ");
  const twoSided = alternative === "two-sided";
  const critical = normalQuantile(1 - (twoSided ? alpha / 2 : alpha));
  const observed = Math.max(-4.3, Math.min(4.3, z));

  const pPaths: string[] = [];
  if (twoSided) {
    pPaths.push(area(domain[0], -Math.abs(observed), 0, domain, yDomain));
    pPaths.push(area(Math.abs(observed), domain[1], 0, domain, yDomain));
  } else if (alternative === "greater") {
    pPaths.push(area(observed, domain[1], 0, domain, yDomain));
  } else {
    pPaths.push(area(domain[0], observed, 0, domain, yDomain));
  }

  const criticalPaths: string[] = [];
  if (twoSided) {
    criticalPaths.push(area(domain[0], -critical, 0, domain, yDomain));
    criticalPaths.push(area(critical, domain[1], 0, domain, yDomain));
  } else if (alternative === "greater") {
    criticalPaths.push(area(critical, domain[1], 0, domain, yDomain));
  } else {
    criticalPaths.push(area(domain[0], -critical, 0, domain, yDomain));
  }

  return (
    <ChartFigure summary={summary} caption={caption} table={table} legend={legend}>
      <ChartFrame
        summary={summary}
        xDomain={domain}
        yDomain={yDomain}
        xLabel="Test statistic under H₀"
        yLabel="Null density"
        xFormat={(value) => formatNumber(value, 1)}
        yFormat={(value) => formatNumber(value, 3)}
      >
        <defs>
          <pattern id="alpha-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="5" stroke={COLORS.observed} strokeWidth="1" opacity="0.2" />
          </pattern>
        </defs>

        {criticalPaths.map((path, index) =>
          path ? <path key={`critical-${index}`} d={path} fill="url(#alpha-hatch)" /> : null,
        )}
        {pPaths.map((path, index) =>
          path ? <path key={`p-${index}`} d={path} fill={COLORS.pvalue} opacity={0.32} /> : null,
        )}

        <path d={curve} fill="none" stroke={COLORS.null} strokeWidth={2} />

        {twoSided ? (
          <>
            <line x1={xScale(-critical, domain)} x2={xScale(-critical, domain)} y1={CHART.top} y2={CHART.top + PLOT.height} stroke={COLORS.observed} strokeDasharray="3 3" />
            <line x1={xScale(critical, domain)} x2={xScale(critical, domain)} y1={CHART.top} y2={CHART.top + PLOT.height} stroke={COLORS.observed} strokeDasharray="3 3" />
          </>
        ) : (
          <line
            x1={xScale(alternative === "greater" ? critical : -critical, domain)}
            x2={xScale(alternative === "greater" ? critical : -critical, domain)}
            y1={CHART.top}
            y2={CHART.top + PLOT.height}
            stroke={COLORS.observed}
            strokeDasharray="3 3"
          />
        )}

        <line x1={xScale(observed, domain)} x2={xScale(observed, domain)} y1={CHART.top} y2={CHART.top + PLOT.height} stroke={COLORS.observed} strokeWidth={2} />
        <text x={xScale(observed, domain) + 5} y={CHART.top + PLOT.height - 8} fontSize={10} fill={COLORS.observed}>
          observed z = {formatNumber(observed, 2)}
        </text>

        <text x={CHART.left + 8} y={CHART.top + 12} fontSize={10} fill={COLORS.pvalue} fontWeight={600}>
          p = {p < 0.0001 ? "< 0.0001" : formatNumber(p, 4)}
        </text>
        <text x={CHART.left + 8} y={CHART.top + 26} fontSize={10} fill="var(--muted-foreground)">
          α = {formatNumber(alpha, 3)} · critical {formatNumber(critical, 2)}
        </text>
        <text x={CHART.left + 8} y={CHART.top + 40} fontSize={9} fill="var(--muted-foreground)">
          Shaded p-tail is conditional on H₀; hatching is the α gate.
        </text>
        <text x={CHART.left + 8} y={CHART.top + 54} fontSize={9} fill={COLORS.observed}>
          {p <= alpha ? "p ≤ α → reject H₀" : "p > α → fail to reject H₀"}
        </text>
      </ChartFrame>
    </ChartFigure>
  );
}
