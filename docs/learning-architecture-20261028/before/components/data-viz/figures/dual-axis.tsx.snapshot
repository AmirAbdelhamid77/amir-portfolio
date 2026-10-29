"use client";

import { useMemo, useState } from "react";
import { DATASETS } from "@/lib/data-viz/datasets";
import { extent, formatNumber, pearson, scaleLinear } from "@/lib/data-viz/chart-math";
import { DataTable, Insight, KeyNumbers, RangeControl, ToggleChip } from "@/components/data-viz/lab-ui";
import { Plot, Controls, ResetButton, LiveReadout, PLOT } from "./kit";

const ROWS = DATASETS["dual-metric"].rows;
const LABELS = ROWS.map((row) => row.month);
const SPEND = ROWS.map((row) => row.spend);
const REVENUE = ROWS.map((row) => row.revenue);

function paddedScale(values: number[], pad: number) {
  const range = extent(values);
  const span = range.max - range.min || 1;
  return scaleLinear(
    { min: range.min - span * pad, max: range.max + span * pad },
    { min: PLOT.height - PLOT.bottom, max: PLOT.top },
  );
}

function Line({
  values,
  x,
  y,
  color,
  dashed,
}: {
  values: number[];
  x: (index: number) => number;
  y: (value: number) => number;
  color: string;
  dashed?: boolean;
}) {
  const path = values
    .map((value, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(value).toFixed(1)}`)
    .join(" ");
  return (
    <path
      d={path}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeDasharray={dashed ? "5 4" : undefined}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
}

export function DualAxisFigure() {
  const [mode, setMode] = useState<"dual" | "panels">("dual");
  const [stretch, setStretch] = useState(0.1);

  const model = useMemo(() => {
    const innerWidth = PLOT.width - PLOT.left - PLOT.right;
    const x = scaleLinear({ min: 0, max: ROWS.length - 1 }, { min: PLOT.left, max: PLOT.width - PLOT.right });
    const spendScale = paddedScale(SPEND, 0.1);
    const revenueScale = paddedScale(REVENUE, mode === "dual" ? stretch : 0.1);
    const r = pearson(SPEND, REVENUE);
    const spendChange = ((SPEND[SPEND.length - 1] - SPEND[0]) / SPEND[0]) * 100;
    const revenueChange = ((REVENUE[REVENUE.length - 1] - REVENUE[0]) / REVENUE[0]) * 100;
    return { x, spendScale, revenueScale, innerWidth, r, spendChange, revenueChange };
  }, [mode, stretch]);

  const panelTop = PLOT.top;
  const panelHeight = 88;
  const panelGap = 34;
  const revenueTop = panelTop + panelHeight + panelGap;

  return (
    <div className="space-y-3">
      <Controls>
        <div role="group" aria-label="Chart layout" className="flex flex-wrap gap-1">
          <ToggleChip pressed={mode === "dual"} onClick={() => setMode("dual")}>
            Dual axis
          </ToggleChip>
          <ToggleChip pressed={mode === "panels"} onClick={() => setMode("panels")}>
            Shared-X panels
          </ToggleChip>
        </div>
        <div className="min-w-[220px] flex-1">
          <RangeControl
            label="Right-axis padding (dual mode only)"
            value={stretch}
            min={0}
            max={0.6}
            step={0.05}
            onChange={setStretch}
            display={`${Math.round(stretch * 100)}%`}
          />
        </div>
        <ResetButton
          onClick={() => {
            setMode("dual");
            setStretch(0.1);
          }}
          disabled={mode === "dual" && stretch === 0.1}
        />
      </Controls>

      <Plot
        label={`${mode === "dual" ? "One chart with two Y axes" : "Two stacked panels sharing the month axis"} for ad spend and revenue over 24 months. Pearson r is ${model.r.toFixed(2)}.`}
        caption={
          mode === "dual"
            ? `Dual axis: spend uses the left scale and revenue the right. Changing the right-axis padding changes how the lines move together on screen; r stays ${model.r.toFixed(2)}.`
            : `Panels: each series keeps its own axis, so the two slopes are no longer read as one relationship. r is still ${model.r.toFixed(2)}.`
        }
      >
        <svg viewBox={`0 0 ${PLOT.width} ${mode === "dual" ? PLOT.height : PLOT.height + 46}`} className="h-auto w-full">
          {mode === "dual" ? (
            <>
              {[0, 0.5, 1].map((fraction) => {
                const y = PLOT.top + fraction * (PLOT.height - PLOT.top - PLOT.bottom);
                return (
                  <line
                    key={fraction}
                    x1={PLOT.left}
                    x2={PLOT.width - PLOT.right}
                    y1={y}
                    y2={y}
                    stroke="var(--border)"
                  />
                );
              })}
              <Line values={SPEND} x={model.x} y={model.spendScale} color="var(--chart-1)" />
              <Line values={REVENUE} x={model.x} y={model.revenueScale} color="var(--chart-2)" dashed />

              <text x={PLOT.left - 8} y={PLOT.top - 8} textAnchor="end" fontSize={10} fill="var(--chart-1)">
                spend
              </text>
              <text x={PLOT.width - PLOT.right + 8} y={PLOT.top - 8} textAnchor="start" fontSize={10} fill="var(--chart-2)">
                revenue
              </text>
              <text x={PLOT.left - 8} y={PLOT.height - PLOT.bottom} textAnchor="end" fontSize={10} fill="var(--chart-1)">
                {formatNumber(extent(SPEND).min)}k
              </text>
              <text x={PLOT.width - PLOT.right + 8} y={PLOT.height - PLOT.bottom} textAnchor="start" fontSize={10} fill="var(--chart-2)">
                {formatNumber(extent(REVENUE).min)}k
              </text>
            </>
          ) : (
            <>
              <text x={PLOT.left} y={panelTop - 8} fontSize={10} fill="var(--chart-1)">
                Ad spend · thousand USD
              </text>
              <Line
                values={SPEND}
                x={model.x}
                y={(value) =>
                  scaleLinear(extent(SPEND), { min: panelTop + panelHeight, max: panelTop })(value)
                }
                color="var(--chart-1)"
              />
              <text x={PLOT.left} y={revenueTop - 8} fontSize={10} fill="var(--chart-2)">
                Revenue · thousand USD
              </text>
              <Line
                values={REVENUE}
                x={model.x}
                y={(value) =>
                  scaleLinear(extent(REVENUE), { min: revenueTop + panelHeight, max: revenueTop })(value)
                }
                color="var(--chart-2)"
              />
              <line
                x1={PLOT.left}
                x2={PLOT.width - PLOT.right}
                y1={revenueTop - 14}
                y2={revenueTop - 14}
                stroke="var(--border)"
                strokeDasharray="3 4"
              />
            </>
          )}

          {LABELS.map((label, index) =>
            index % 4 === 0 ? (
              <text
                key={label}
                x={model.x(index)}
                y={mode === "dual" ? PLOT.height - 10 : revenueTop + panelHeight + 26}
                textAnchor="middle"
                fontSize={10}
                fill="var(--muted-foreground)"
              >
                {label}
              </text>
            ) : null,
          )}
        </svg>
      </Plot>

      <LiveReadout>
        <KeyNumbers
          items={[
            { label: "Pearson r", value: model.r.toFixed(3), note: "fixed" },
            { label: "Spend", value: `${model.spendChange.toFixed(0)}%`, note: "first → last" },
            { label: "Revenue", value: `${model.revenueChange.toFixed(1)}%`, note: "first → last" },
            {
              label: "Axis padding",
              value: mode === "dual" ? `${Math.round(stretch * 100)}%` : "per panel",
              note: "visual only",
            },
          ]}
        />
      </LiveReadout>

      <Insight>
        {mode === "dual" ? (
          <>
            Move the padding slider. The two lines can look tightly coupled or almost
            independent while <strong className="font-medium text-foreground">r stays {model.r.toFixed(2)}</strong>.
            A dual axis lets the author choose the apparent relationship; that is why
            incompatible units belong in separate panels.
          </>
        ) : (
          <>
            Panels keep each series on its own honest scale and share the time axis, so
            the reader compares shapes without being invited to read a correlation from
            two arbitrary axes. The correlation is still {model.r.toFixed(2)} — the
            layout changes the claim, not the statistic.
          </>
        )}
      </Insight>

      <DataTable
        title="Read the numbers · all 24 months"
        caption="Synthetic ad spend and revenue used by the dual-axis figure."
        columns={["Month", "Spend (k)", "Revenue (k)"]}
        rows={ROWS.map((row) => [row.month, row.spend, row.revenue])}
      />
    </div>
  );
}
