"use client";

import { useMemo, useState } from "react";
import { DATASETS } from "@/lib/data-viz/datasets";
import { formatNumber, histogram, mean, niceScale, quantile, scaleLinear } from "@/lib/data-viz/chart-math";
import {
  ChartCard,
  DataTable,
  Insight,
  KeyNumbers,
  Legend,
  RangeControl,
  Segmented,
  ToggleChip,
} from "@/components/data-viz/lab-ui";

const DATA = DATASETS["order-values"];
const W = 720;
const H = 340;
const M = { top: 22, right: 18, bottom: 46, left: 54 };
const IW = W - M.left - M.right;
const IH = H - M.top - M.bottom;

export function HistogramLab() {
  const [binWidth, setBinWidth] = useState(20);
  const [showStats, setShowStats] = useState(true);
  const [metric, setMetric] = useState<"count" | "percent">("count");

  const stats = useMemo(() => {
    const values = DATA.values;
    const hist = histogram(values, { binWidth });
    const x = scaleLinear({ min: hist.min, max: hist.max }, { min: M.left, max: M.left + IW });
    const maxCount = Math.max(1, ...hist.counts);
    const maxPercent = Math.max(...hist.counts.map((count) => (count / values.length) * 100), 1);
    const domainMax = metric === "count" ? maxCount : maxPercent;
    const yScale = niceScale(0, domainMax, 4);
    const y = scaleLinear({ min: 0, max: yScale.max }, { min: M.top + IH, max: M.top });
    const meanValue = mean(values);
    const medianValue = quantile(values, 0.5);
    return { hist, x, y, yScale, maxCount, meanValue, medianValue };
  }, [binWidth, metric]);

  const { hist, x, y, yScale, meanValue, medianValue } = stats;
  const tallest = hist.bins.reduce((best, bin) => (bin.count > best.count ? bin : best), hist.bins[0]);
  const total = DATA.values.length;
  const xScale = niceScale(hist.min, hist.max, 6);
  const barValue = (count: number) => (metric === "count" ? count : (count / total) * 100);

  const summary = `Histogram of ${total} order values with bins ${binWidth} dollars wide. Mean ${formatNumber(meanValue, 1)}, median ${formatNumber(medianValue, 1)} dollars. The tallest bin (${formatNumber(tallest.x0)} to ${formatNumber(tallest.x1)}) contains ${tallest.count} orders.`;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
      <div className="min-w-0 space-y-4">
        <ChartCard summary={summary} caption="Hover a bar to read the bin range; the table below lists every bin, so touch and keyboard users get the same numbers.">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden="true">
            {yScale.ticks.map((tick) => {
              const py = y(tick);
              return (
                <g key={tick}>
                  <line x1={M.left} x2={M.left + IW} y1={py} y2={py} stroke="var(--border-strong)" strokeWidth={1} />
                  <text x={M.left - 8} y={py + 4} textAnchor="end" fontSize={11} fill="var(--muted-foreground)">
                    {metric === "count" ? formatNumber(tick) : `${formatNumber(tick)}%`}
                  </text>
                </g>
              );
            })}

            {hist.bins.map((bin) => {
              const px = x(bin.x0);
              const pw = Math.max(1, x(bin.x1) - x(bin.x0) - 1);
              const value = barValue(bin.count);
              const py = y(value);
              const ph = M.top + IH - py;
              return (
                <g key={`${bin.x0}-${bin.x1}`}>
                  <rect
                    x={px}
                    y={py}
                    width={pw}
                    height={Math.max(0, ph)}
                    fill="var(--chart-1)"
                    opacity={0.85}
                    rx={1.5}
                  >
                    <title>
                      {`$${formatNumber(bin.x0)}–$${formatNumber(bin.x1)}: ${bin.count} orders`}
                    </title>
                  </rect>
                </g>
              );
            })}

            {xScale.ticks
              .filter((tick) => tick >= hist.min && tick <= hist.max)
              .map((tick) => (
                <text
                  key={`x-${tick}`}
                  x={x(tick)}
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
            <text x={M.left + IW / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--muted-foreground)">
              Order value (USD)
            </text>
            <text
              transform={`translate(14 ${M.top + IH / 2}) rotate(-90)`}
              textAnchor="middle"
              fontSize={11}
              fill="var(--muted-foreground)"
            >
              {metric === "count" ? "Orders" : "Share of orders (%)"}
            </text>

            {showStats ? (
              <>
                <line
                  x1={x(meanValue)}
                  x2={x(meanValue)}
                  y1={M.top}
                  y2={M.top + IH}
                  stroke="var(--chart-5)"
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                />
                <text x={x(meanValue) + 4} y={M.top + 10} fontSize={10} fill="var(--chart-5)">
                  mean {formatNumber(meanValue, 1)}
                </text>
                <line
                  x1={x(medianValue)}
                  x2={x(medianValue)}
                  y1={M.top}
                  y2={M.top + IH}
                  stroke="var(--chart-2)"
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                />
                <text x={x(medianValue) + 4} y={M.top + 24} fontSize={10} fill="var(--chart-2)">
                  median {formatNumber(medianValue, 1)}
                </text>
              </>
            ) : null}
          </svg>
        </ChartCard>

        <div className="flex flex-wrap items-center gap-3">
          <Legend
            items={[
              { label: "Orders per bin", color: "var(--chart-1)" },
              { label: "Mean", color: "var(--chart-5)", dashed: true },
              { label: "Median", color: "var(--chart-2)", dashed: true },
            ]}
          />
          <div className="ms-auto">
            <Segmented
              label="Vertical axis"
              value={metric}
              onChange={setMetric}
              options={[
                { value: "count", label: "Count" },
                { value: "percent", label: "Percent" },
              ]}
            />
          </div>
        </div>

        <DataTable
          caption={`Bin counts for ${total} synthetic order values, bin width ${binWidth} dollars.`}
          columns={["Bin (USD)", "Count", "Share", "Cumulative"]}
          rows={(() => {
            // Running total computed before the table body is mapped.
            const cumulative = hist.bins.reduce<number[]>((totals, bin) => {
              totals.push((totals.length ? totals[totals.length - 1] : 0) + bin.count);
              return totals;
            }, []);
            return hist.bins.map((bin, index) => [
              `$${formatNumber(bin.x0)} – $${formatNumber(bin.x1)}`,
              formatNumber(bin.count),
              `${((bin.count / total) * 100).toFixed(1)}%`,
              `${((cumulative[index] / total) * 100).toFixed(1)}%`,
            ]);
          })()}
        />
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card/40 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Bin width
          </p>
          <div className="mt-3">
            <RangeControl
              label="Width (USD)"
              value={binWidth}
              min={10}
              max={80}
              step={5}
              onChange={setBinWidth}
              display={`$${binWidth}`}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <ToggleChip pressed={showStats} onClick={() => setShowStats((value) => !value)}>
              Mean &amp; median
            </ToggleChip>
          </div>
        </div>

        <KeyNumbers
          items={[
            { label: "Orders", value: formatNumber(total) },
            { label: "Bins", value: formatNumber(hist.bins.length) },
            { label: "Mean", value: `$${formatNumber(meanValue, 1)}` },
            { label: "Median", value: `$${formatNumber(medianValue, 1)}` },
          ]}
        />

        <Insight>
          A wider bin hides detail; a narrower bin invents spikes. At ${binWidth} the
          tallest bin holds {((tallest.count / total) * 100).toFixed(0)}% of orders.
          Change the width and watch the shape change before you write the sentence.
        </Insight>

        <Insight tone="warning">
          This distribution is right-skewed: the mean (${formatNumber(meanValue, 1)}) sits
          above the median (${formatNumber(medianValue, 1)}). A single average would
          miss the long tail of large orders.
        </Insight>
      </div>
    </div>
  );
}
