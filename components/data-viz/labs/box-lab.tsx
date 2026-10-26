"use client";

import { useMemo, useState } from "react";
import { DATASETS } from "@/lib/data-viz/datasets";
import { boxStats, formatNumber, niceScale, scaleLinear } from "@/lib/data-viz/chart-math";
import {
  ChartCard,
  DataTable,
  Insight,
  KeyNumbers,
  Legend,
  ToggleChip,
} from "@/components/data-viz/lab-ui";

const DATA = DATASETS["delivery-times"];
const W = 720;
const H = 340;
const M = { top: 24, right: 24, bottom: 46, left: 118 };
const IW = W - M.left - M.right;
const IH = H - M.top - M.bottom;

export function BoxLab() {
  const [showPoints, setShowPoints] = useState(false);
  const [sortByMedian, setSortByMedian] = useState(false);

  const stats = useMemo(() => {
    const computed = DATA.groups.map((group) => ({ group, box: boxStats(group.values) }));
    if (sortByMedian) computed.sort((a, b) => a.box.median - b.box.median);
    const allValues = DATA.groups.flatMap((group) => group.values);
    const ticks = niceScale(Math.min(...allValues) * 0.92, Math.max(...allValues) * 1.03, 6);
    const x = scaleLinear({ min: ticks.min, max: ticks.max }, { min: M.left, max: M.left + IW });
    return { computed, ticks, x, allValues };
  }, [sortByMedian]);

  const { computed, ticks, x } = stats;
  const band = IH / computed.length;
  const sortedByMedian = [...computed].sort((a, b) => a.box.median - b.box.median);
  const fastest = sortedByMedian[0];
  const slowest = sortedByMedian[sortedByMedian.length - 1];
  const gap = slowest.box.median - fastest.box.median;
  const outliers = computed.reduce((total, item) => total + item.box.outliers.length, 0);

  const summary = `Box plot of delivery minutes for ${computed.length} depots. ${fastest.group.label} has the lowest median at ${formatNumber(fastest.box.median, 1)} minutes; ${slowest.group.label} the highest at ${formatNumber(slowest.box.median, 1)} minutes — a gap of ${formatNumber(gap, 1)} minutes. ${outliers} values fall outside the 1.5 IQR fences.`;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
      <div className="min-w-0 space-y-4">
        <ChartCard
          summary={summary}
          caption="The box is the interquartile range, the line inside is the median, and the diamond is the mean. Whiskers stop at the last value inside 1.5 × IQR."
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden="true">
            {ticks.ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={x(tick)}
                  x2={x(tick)}
                  y1={M.top}
                  y2={M.top + IH}
                  stroke="var(--border-strong)"
                  strokeWidth={1}
                />
                <text
                  x={x(tick)}
                  y={M.top + IH + 20}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--muted-foreground)"
                >
                  {formatNumber(tick)}
                </text>
              </g>
            ))}

            {computed.map(({ group, box }, index) => {
              const cy = M.top + band * (index + 0.5);
              const boxHeight = Math.min(30, band * 0.34);
              const boxTop = cy - boxHeight / 2;
              return (
                <g key={group.id}>
                  <line
                    x1={M.left}
                    x2={M.left + IW}
                    y1={cy}
                    y2={cy}
                    stroke="var(--border)"
                    strokeWidth={1}
                  />
                  <line
                    x1={x(box.whiskerLow)}
                    x2={x(box.whiskerHigh)}
                    y1={cy}
                    y2={cy}
                    stroke="var(--muted-foreground)"
                    strokeWidth={1.5}
                  />
                  <line
                    x1={x(box.whiskerLow)}
                    x2={x(box.whiskerLow)}
                    y1={cy - boxHeight / 3}
                    y2={cy + boxHeight / 3}
                    stroke="var(--muted-foreground)"
                    strokeWidth={1.5}
                  />
                  <line
                    x1={x(box.whiskerHigh)}
                    x2={x(box.whiskerHigh)}
                    y1={cy - boxHeight / 3}
                    y2={cy + boxHeight / 3}
                    stroke="var(--muted-foreground)"
                    strokeWidth={1.5}
                  />
                  <rect
                    x={x(box.q1)}
                    y={boxTop}
                    width={Math.max(1, x(box.q3) - x(box.q1))}
                    height={boxHeight}
                    rx={3}
                    fill="var(--chart-1)"
                    opacity={0.22}
                    stroke="var(--chart-1)"
                    strokeWidth={1.5}
                  >
                    <title>
                      {`${group.label}: Q1 ${formatNumber(box.q1, 1)}, median ${formatNumber(box.median, 1)}, Q3 ${formatNumber(box.q3, 1)}`}
                    </title>
                  </rect>
                  <line
                    x1={x(box.median)}
                    x2={x(box.median)}
                    y1={boxTop}
                    y2={boxTop + boxHeight}
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                  />
                  <path
                    d={`M${x(box.mean)} ${cy - 4} L${x(box.mean) + 4} ${cy} L${x(box.mean)} ${cy + 4} L${x(box.mean) - 4} ${cy} Z`}
                    fill="var(--chart-5)"
                  >
                    <title>{`${group.label} mean: ${formatNumber(box.mean, 1)} minutes`}</title>
                  </path>

                  {showPoints
                    ? group.values.map((value, pointIndex) => {
                        const jitter = (((pointIndex * 37) % 11) - 5) * 0.9;
                        return (
                          <circle
                            key={pointIndex}
                            cx={x(value)}
                            cy={cy + jitter}
                            r={2}
                            fill="var(--foreground)"
                            opacity={0.28}
                          />
                        );
                      })
                    : null}

                  {box.outliers.map((value, outlierIndex) => (
                    <circle
                      key={`outlier-${outlierIndex}`}
                      cx={x(value)}
                      cy={cy}
                      r={2.6}
                      fill="var(--chart-5)"
                    >
                      <title>{`${group.label} outlier: ${formatNumber(value, 1)} minutes`}</title>
                    </circle>
                  ))}

                  <text
                    x={M.left - 10}
                    y={cy + 4}
                    textAnchor="end"
                    fontSize={11}
                    fill="var(--foreground)"
                  >
                    {group.label}
                  </text>
                </g>
              );
            })}

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
              Delivery time (minutes)
            </text>
          </svg>
        </ChartCard>

        <Legend
          items={[
            { label: "Interquartile range", color: "var(--chart-1)" },
            { label: "Median", color: "var(--chart-1)" },
            { label: "Mean", color: "var(--chart-5)" },
            { label: "Outlier (1.5 × IQR fence)", color: "var(--chart-5)" },
          ]}
        />

        <DataTable
          caption="Five-number summary and outlier count for each synthetic depot."
          columns={["Depot", "n", "Min", "Q1", "Median", "Q3", "Max", "Outliers"]}
          rows={computed.map(({ group, box }) => [
            group.label,
            formatNumber(box.n),
            formatNumber(box.min, 1),
            formatNumber(box.q1, 1),
            formatNumber(box.median, 1),
            formatNumber(box.q3, 1),
            formatNumber(box.max, 1),
            formatNumber(box.outliers.length),
          ])}
        />
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card/40 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Display
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ToggleChip pressed={showPoints} onClick={() => setShowPoints((value) => !value)}>
              All observations
            </ToggleChip>
            <ToggleChip pressed={sortByMedian} onClick={() => setSortByMedian((value) => !value)}>
              Sort by median
            </ToggleChip>
          </div>
        </div>

        <KeyNumbers
          items={[
            { label: "Fastest median", value: `${formatNumber(fastest.box.median, 1)} min`, note: fastest.group.label },
            { label: "Slowest median", value: `${formatNumber(slowest.box.median, 1)} min`, note: slowest.group.label },
            { label: "Gap", value: `${formatNumber(gap, 1)} min` },
            { label: "Outliers", value: formatNumber(outliers) },
          ]}
        />

        <Insight>
          The gap between the fastest and slowest median is {formatNumber(gap, 1)} minutes.
          That is a question about routes, volume and staffing — the box plot cannot
          answer it.
        </Insight>

        <Insight tone="warning">
          Box plots encode position, not length, so a non-zero origin is defensible
          here. The same choice on a bar chart would exaggerate every difference.
        </Insight>
      </div>
    </div>
  );
}
