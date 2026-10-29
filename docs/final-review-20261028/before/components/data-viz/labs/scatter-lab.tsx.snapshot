"use client";

import { useMemo, useState } from "react";
import { DATASETS } from "@/lib/data-viz/datasets";
import {
  formatNumber,
  linearRegression,
  niceScale,
  pearson,
  scaleLinear,
} from "@/lib/data-viz/chart-math";
import {
  ChartCard,
  DataTable,
  Insight,
  KeyNumbers,
  Legend,
  ToggleChip,
} from "@/components/data-viz/lab-ui";

const DATA = DATASETS["campaign-spend"];
const W = 720;
const H = 360;
const M = { top: 24, right: 24, bottom: 46, left: 56 };
const IW = W - M.left - M.right;
const IH = H - M.top - M.bottom;
const CHANNELS = ["Search", "Social"] as const;
const COLORS: Record<string, string> = {
  Search: "var(--chart-1)",
  Social: "var(--chart-3)",
  Pooled: "var(--chart-5)",
};

export function ScatterLab() {
  const [split, setSplit] = useState(true);
  const [showTrend, setShowTrend] = useState(true);
  const [logX, setLogX] = useState(false);

  const view = useMemo(() => {
    const points = DATA.points;
    const groups = split
      ? CHANNELS.map((channel) => ({
          id: channel,
          label: channel,
          points: points.filter((point) => point.channel === channel),
        }))
      : [{ id: "pooled", label: "All campaigns", points }];

    const maxSpend = Math.max(...points.map((point) => point.spend));
    const maxSignups = Math.max(...points.map((point) => point.signups));
    const xDomain = logX
      ? { min: Math.log10(1), max: Math.log10(maxSpend * 1.1) }
      : { min: 0, max: maxSpend * 1.05 };
    const yTicks = niceScale(0, maxSignups * 1.08, 5);
    const x = scaleLinear(xDomain, { min: M.left, max: M.left + IW });
    const y = scaleLinear({ min: 0, max: yTicks.max }, { min: M.top + IH, max: M.top });
    const px = (value: number) => x(logX ? Math.log10(Math.max(1, value)) : value);

    const fits = groups.map((group) => {
      const xs = group.points.map((point) => (logX ? Math.log10(Math.max(1, point.spend)) : point.spend));
      const ys = group.points.map((point) => point.signups);
      const regression = linearRegression(xs, ys);
      const xsRaw = group.points.map((point) => point.spend);
      return {
        ...group,
        regression,
        r: pearson(xsRaw, ys),
        sample: Array.from({ length: 40 }, (_, index) => {
          const raw = 1 + (maxSpend - 1) * (index / 39);
          const input = logX ? Math.log10(raw) : raw;
          return { x: raw, y: regression.predict(input) };
        }),
      };
    });

    const pooledR = pearson(
      points.map((point) => point.spend),
      points.map((point) => point.signups),
    );

    const xTicks = logX
      ? [2, 5, 10, 20, 40, 60].filter((tick) => tick <= maxSpend * 1.1)
      : niceScale(0, maxSpend * 1.05, 5).ticks;

    return { groups, fits, x, y, px, xTicks, yTicks, maxSpend, pooledR };
  }, [split, logX]);

  const { groups, fits, px, y, xTicks, yTicks, pooledR } = view;
  const totalPoints = DATA.points.length;
  const searchFit = fits.find((fit) => fit.id === "Search");
  const socialFit = fits.find((fit) => fit.id === "Social");

  const summary = split
    ? `Scatter plot of ${totalPoints} campaigns split by channel. Search: r = ${formatNumber(searchFit?.r ?? 0, 2)}. Social: r = ${formatNumber(socialFit?.r ?? 0, 2)}. Pooled r is ${formatNumber(pooledR, 2)}.`
    : `Scatter plot of ${totalPoints} campaigns pooled. Pearson r = ${formatNumber(pooledR, 2)}, r squared = ${formatNumber(pooledR * pooledR, 2)}.`;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
      <div className="min-w-0 space-y-4">
        <ChartCard
          summary={summary}
          caption="Each point is one synthetic campaign. The dashed lines are least-squares fits; they describe association, not causation."
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden="true">
            {yTicks.ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={M.left}
                  x2={M.left + IW}
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke="var(--border-strong)"
                  strokeWidth={1}
                />
                <text
                  x={M.left - 8}
                  y={y(tick) + 4}
                  textAnchor="end"
                  fontSize={11}
                  fill="var(--muted-foreground)"
                >
                  {formatNumber(tick)}
                </text>
              </g>
            ))}

            {xTicks.map((tick) => (
              <text
                key={`x-${tick}`}
                x={px(tick)}
                y={M.top + IH + 20}
                textAnchor="middle"
                fontSize={11}
                fill="var(--muted-foreground)"
              >
                {formatNumber(tick)}
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
              Campaign spend{logX ? " (log scale)" : ""} — index units
            </text>
            <text
              transform={`translate(14 ${M.top + IH / 2}) rotate(-90)`}
              textAnchor="middle"
              fontSize={11}
              fill="var(--muted-foreground)"
            >
              Sign-ups
            </text>

            {groups.map((group) => {
              const color = COLORS[group.id] ?? "var(--chart-1)";
              return (
                <g key={group.id}>
                  {group.points.map((point, index) => (
                    <circle
                      key={index}
                      cx={px(point.spend)}
                      cy={y(point.signups)}
                      r={3.4}
                      fill={split ? COLORS[point.channel] ?? color : color}
                      opacity={0.72}
                    >
                      <title>
                        {`${point.channel}: spend ${formatNumber(point.spend, 1)}, ${point.signups} sign-ups`}
                      </title>
                    </circle>
                  ))}
                </g>
              );
            })}

            {showTrend
              ? fits.map((fit) => {
                  const color = COLORS[fit.id] ?? "var(--chart-5)";
                  const path = fit.sample
                    .map((point, index) => `${index === 0 ? "M" : "L"}${px(point.x)} ${y(Math.max(0, point.y))}`)
                    .join(" ");
                  return (
                    <path
                      key={`fit-${fit.id}`}
                      d={path}
                      fill="none"
                      stroke={color}
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      opacity={0.95}
                    />
                  );
                })
              : null}
          </svg>
        </ChartCard>

        <Legend
          items={
            split
              ? [
                  { label: "Search campaigns", color: "var(--chart-1)" },
                  { label: "Social campaigns", color: "var(--chart-3)" },
                  { label: "Least-squares fit", color: "var(--muted-foreground)", dashed: true },
                ]
              : [
                  { label: "All campaigns", color: "var(--chart-5)" },
                  { label: "Least-squares fit", color: "var(--muted-foreground)", dashed: true },
                ]
          }
        />

        <DataTable
          caption="Synthetic campaign spend and sign-ups by channel."
          columns={["#", "Channel", "Spend", "Sign-ups", "Per unit spend"]}
          rows={DATA.points.map((point, index) => [
            formatNumber(index + 1),
            point.channel,
            formatNumber(point.spend, 1),
            formatNumber(point.signups),
            formatNumber(point.signups / point.spend, 2),
          ])}
        />
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card/40 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            View
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ToggleChip pressed={split} onClick={() => setSplit((value) => !value)}>
              Split by channel
            </ToggleChip>
            <ToggleChip pressed={showTrend} onClick={() => setShowTrend((value) => !value)}>
              Trend line
            </ToggleChip>
            <ToggleChip pressed={logX} onClick={() => setLogX((value) => !value)}>
              Log x
            </ToggleChip>
          </div>
        </div>

        <KeyNumbers
          items={[
            {
              label: split ? "Search r" : "Pooled r",
              value: formatNumber(split ? searchFit?.r ?? 0 : pooledR, 2),
            },
            {
              label: split ? "Social r" : "r²",
              value: formatNumber(split ? socialFit?.r ?? 0 : pooledR * pooledR, 2),
            },
            { label: "Campaigns", value: formatNumber(totalPoints) },
            { label: "Channels", value: formatNumber(split ? 2 : 1) },
          ]}
        />

        <Insight>
          {split
            ? `Pooled r is ${formatNumber(pooledR, 2)}, but within-channel relationships differ. A single fit through both colours would describe neither channel honestly.`
            : `Pooling the channels gives r = ${formatNumber(pooledR, 2)}. Turn the split back on: the pooled coefficient is being held up by a difference between channels, not by a uniform relationship.`}
        </Insight>

        <Insight tone="warning">
          Search has the steeper fit, but targeting, seasonality, attribution and
          saturation are all omitted. Treat the line as a screening device, then design
          a controlled test before moving budget.
        </Insight>
      </div>
    </div>
  );
}
