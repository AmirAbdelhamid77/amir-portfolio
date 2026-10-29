"use client";

import { useMemo, useState } from "react";
import { DATASETS } from "@/lib/data-viz/datasets";
import { formatNumber, niceScale, scaleLinear } from "@/lib/data-viz/chart-math";
import {
  ChartCard,
  DataTable,
  Insight,
  KeyNumbers,
  Segmented,
  ToggleChip,
} from "@/components/data-viz/lab-ui";

const DATA = DATASETS["regional-revenue"];
const W = 720;
const H = 340;
const M = { top: 22, right: 54, bottom: 46, left: 92 };
const IW = W - M.left - M.right;
const IH = H - M.top - M.bottom;

export function BarLab() {
  const [zeroBaseline, setZeroBaseline] = useState(true);
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [showValues, setShowValues] = useState(true);

  const view = useMemo(() => {
    const rows = [...DATA.rows].sort((a, b) => (sort === "desc" ? b.value - a.value : a.value - b.value));
    const min = Math.min(...rows.map((row) => row.value));
    const max = Math.max(...rows.map((row) => row.value));
    const domainMin = zeroBaseline ? 0 : Math.max(0, Math.floor(min * 0.9));
    const ticks = niceScale(domainMin, max * 1.03, 5);
    const x = scaleLinear({ min: zeroBaseline ? 0 : domainMin, max: ticks.max }, { min: M.left, max: M.left + IW });
    return { rows, min, domainMin, ticks, x };
  }, [zeroBaseline, sort]);

  const { rows, min, domainMin, ticks, x } = view;
  const band = IH / rows.length;
  const barHeight = Math.min(26, band * 0.62);
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const largest = rows.reduce((best, row) => (row.value > best.value ? row : best), rows[0]);
  const smallest = rows.reduce((best, row) => (row.value < best.value ? row : best), rows[0]);
  const ratio = largest.value / smallest.value;
  const visualRatio = zeroBaseline ? ratio : (largest.value - domainMin) / Math.max(0.001, smallest.value - domainMin);

  const summary = `Bar chart of revenue for ${rows.length} regions, sorted ${sort === "desc" ? "descending" : "ascending"}. ${largest.label} is largest at ${formatNumber(largest.value)} thousand dollars; ${smallest.label} is smallest at ${formatNumber(smallest.value)}. The horizontal axis ${zeroBaseline ? "starts at zero" : `starts at ${formatNumber(domainMin)}, not zero`}.`;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
      <div className="min-w-0 space-y-4">
        <ChartCard
          summary={summary}
          caption={
            zeroBaseline
              ? "Bar length starts at zero, so the visual ratio matches the data ratio."
              : `This axis starts at ${formatNumber(domainMin)}. The bars still look like lengths, but they are now differences from an arbitrary origin.`
          }
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden="true">
            {ticks.ticks
              .filter((tick) => tick >= domainMin)
              .map((tick) => (
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

            {rows.map((row, index) => {
              const cy = M.top + band * (index + 0.5);
              const startX = x(domainMin);
              const endX = x(row.value);
              const width = Math.max(1, endX - startX);
              return (
                <g key={row.id}>
                  <rect
                    x={startX}
                    y={cy - barHeight / 2}
                    width={width}
                    height={barHeight}
                    rx={3}
                    fill="var(--chart-1)"
                    opacity={0.88}
                  >
                    <title>{`${row.label}: ${formatNumber(row.value)} thousand USD`}</title>
                  </rect>
                  <text x={M.left - 10} y={cy + 4} textAnchor="end" fontSize={11} fill="var(--foreground)">
                    {row.label}
                  </text>
                  {showValues ? (
                    <text
                      x={endX + 6}
                      y={cy + 4}
                      fontSize={10}
                      fill="var(--muted-foreground)"
                      fontFamily="var(--font-geist-mono)"
                    >
                      {formatNumber(row.value)}
                    </text>
                  ) : null}
                </g>
              );
            })}

            <line
              x1={M.left}
              x2={M.left}
              y1={M.top}
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
              Revenue (thousand USD)
            </text>
          </svg>
        </ChartCard>

        <DataTable
          caption="Synthetic revenue by region, with share of total and rank."
          columns={["Region", "Revenue", "Share", "Rank"]}
          rows={[...DATA.rows]
            .sort((a, b) => b.value - a.value)
            .map((row, index) => [
              row.label,
              formatNumber(row.value),
              `${((row.value / total) * 100).toFixed(1)}%`,
              String(index + 1),
            ])}
        />
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card/40 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Axis
          </p>
          <div className="mt-3">
            <ToggleChip pressed={zeroBaseline} onClick={() => setZeroBaseline((value) => !value)}>
              Zero baseline
            </ToggleChip>
          </div>
          <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
            Turning this off starts the axis at {formatNumber(Math.max(0, Math.floor(min * 0.9)))}.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Order
          </p>
          <div className="mt-3">
            <Segmented
              label="Sort order"
              value={sort}
              onChange={setSort}
              options={[
                { value: "desc", label: "Largest first" },
                { value: "asc", label: "Smallest first" },
              ]}
            />
          </div>
          <div className="mt-3">
            <ToggleChip pressed={showValues} onClick={() => setShowValues((value) => !value)}>
              Value labels
            </ToggleChip>
          </div>
        </div>

        <KeyNumbers
          items={[
            { label: "Total", value: formatNumber(total), note: "thousand USD" },
            { label: "Largest", value: formatNumber(largest.value), note: largest.label },
            { label: "Smallest", value: formatNumber(smallest.value), note: smallest.label },
            { label: "True ratio", value: `${ratio.toFixed(1)}×` },
          ]}
        />

        <Insight tone={zeroBaseline ? "neutral" : "warning"}>
          {zeroBaseline
            ? `${largest.label} is ${ratio.toFixed(1)}× ${smallest.label} — and the bar lengths show the same ratio.`
            : `The bars now look about ${visualRatio.toFixed(0)}× different, while the values differ by ${ratio.toFixed(1)}×. The chart has manufactured a comparison the data does not support.`}
        </Insight>

        <Insight>
          Sorting is not cosmetic: ordered bars turn a lookup into a ranking. Keep the
          order when the categories have a natural sequence (months, stages); sort by
          value when they do not.
        </Insight>
      </div>
    </div>
  );
}
