"use client";

import { useMemo, useState } from "react";
import { DATASETS } from "@/lib/data-viz/datasets";
import { armRate, simpsonAtMix } from "@/lib/data-viz/figure-data";
import { scaleLinear } from "@/lib/data-viz/chart-math";
import { DataTable, Insight, RangeControl, ToggleChip } from "@/components/data-viz/lab-ui";
import { Plot, Controls, ResetButton, LiveReadout, PLOT, VerdictPill } from "./kit";

const SEGMENTS = DATASETS.simpson.segments.map((segment) => ({
  ...segment,
  control: { ...segment.control },
  treatment: { ...segment.treatment },
}));

const DEFAULT_MIX = 200 / 1200;

export function SimpsonFigure() {
  const [returningShare, setReturningShare] = useState(DEFAULT_MIX);
  const [standardize, setStandardize] = useState(true);

  const model = useMemo(() => {
    const result = simpsonAtMix(SEGMENTS, returningShare);
    const x = scaleLinear({ min: 0, max: 100 }, { min: PLOT.left, max: PLOT.width - PLOT.right });
    const rows = [
      { id: "control", label: "Control (fixed mix)", value: result.control * 100, color: "var(--chart-1)" },
      { id: "pooled", label: "Treatment (chosen mix)", value: result.pooledTreatment * 100, color: "var(--chart-2)" },
      {
        id: "standardized",
        label: "Treatment (control mix)",
        value: result.standardizedTreatment * 100,
        color: "var(--chart-4)",
      },
    ];
    return { ...result, x, rows };
  }, [returningShare]);

  const pooledWins = model.pooledTreatment > model.control;

  return (
    <div className="space-y-3">
      <Controls>
        <div className="min-w-[240px] flex-1">
          <RangeControl
            label="Treatment mix · share of returning customers"
            value={returningShare}
            min={0}
            max={1}
            step={0.01}
            onChange={setReturningShare}
            display={`${Math.round(returningShare * 100)}%`}
          />
        </div>
        <ToggleChip pressed={standardize} onClick={() => setStandardize(!standardize)}>
          Show mix-standardized rate
        </ToggleChip>
        <ResetButton
          onClick={() => {
            setReturningShare(DEFAULT_MIX);
            setStandardize(true);
          }}
          disabled={Math.abs(returningShare - DEFAULT_MIX) < 0.005 && standardize}
        />
      </Controls>

      <Plot
        label={`Pooled conversion. Control ${(model.control * 100).toFixed(1)}%, treatment ${(model.pooledTreatment * 100).toFixed(1)}%, standardized treatment ${(model.standardizedTreatment * 100).toFixed(1)}%.`}
        caption={
          <>
            Every within-segment rate is fixed. Only the treatment group&apos;s mix of
            new and returning customers changes. The control mix is fixed at{" "}
            {Math.round((SEGMENTS[1].control.total / (SEGMENTS[0].control.total + SEGMENTS[1].control.total)) * 100)}%
            returning.
          </>
        }
      >
        <svg viewBox={`0 0 ${PLOT.width} 260`} className="h-auto w-full">
          {[0, 25, 50, 75, 100].map((tick) => (
            <g key={tick}>
              <line
                x1={model.x(tick)}
                x2={model.x(tick)}
                y1={PLOT.top}
                y2={220}
                stroke="var(--border)"
              />
              <text
                x={model.x(tick)}
                y={240}
                textAnchor="middle"
                fontSize={10}
                fill="var(--muted-foreground)"
              >
                {tick}%
              </text>
            </g>
          ))}

          {model.rows.map((row, index) => {
            if (row.id === "standardized" && !standardize) return null;
            const y = PLOT.top + 14 + index * 62;
            const width = Math.max(1, model.x(row.value) - PLOT.left);
            return (
              <g key={row.id}>
                <rect x={PLOT.left} y={y} width={width} height={40} rx={5} fill={row.color} opacity={0.9} />
                <text x={PLOT.left - 8} y={y + 25} textAnchor="end" fontSize={10} fill="var(--muted-foreground)">
                  {row.label}
                </text>
                <text x={PLOT.left + width + 6} y={y + 25} fontSize={11} fontWeight={600} fill="var(--foreground)">
                  {row.value.toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
      </Plot>

      <LiveReadout>
        <div className="flex flex-wrap items-center gap-2">
          <VerdictPill tone={pooledWins ? "good" : "bad"}>
            {pooledWins ? "treatment wins pooled" : "control wins pooled"}
          </VerdictPill>
          <VerdictPill tone="good">treatment wins every segment</VerdictPill>
          <span className="text-[11px] text-muted-foreground">
            Pooled gap: {((model.pooledTreatment - model.control) * 100).toFixed(1)} pp ·
            standardized gap: {((model.standardizedTreatment - model.control) * 100).toFixed(1)} pp
          </span>
        </div>
      </LiveReadout>

      <div className="overflow-x-auto rounded-xl border border-border" tabIndex={0}>
        <table className="w-full border-collapse text-[11px]">
          <caption className="sr-only">
            Within-segment conversion rates for the Simpson demonstration.
          </caption>
          <thead>
            <tr className="border-b border-border bg-card/60 text-muted-foreground">
              <th scope="col" className="px-2 py-1.5 text-start font-medium">Segment</th>
              <th scope="col" className="px-2 py-1.5 text-end font-medium">Control</th>
              <th scope="col" className="px-2 py-1.5 text-end font-medium">Treatment</th>
              <th scope="col" className="px-2 py-1.5 text-end font-medium">Treatment n</th>
            </tr>
          </thead>
          <tbody>
            {SEGMENTS.map((segment, index) => (
              <tr key={segment.id} className="border-b border-border last:border-0">
                <th scope="row" className="px-2 py-1.5 text-start font-medium text-foreground">
                  {segment.label}
                </th>
                <td className="px-2 py-1.5 text-end font-mono">
                  {(armRate(segment.control) * 100).toFixed(1)}%
                </td>
                <td className="px-2 py-1.5 text-end font-mono">
                  {(armRate(segment.treatment) * 100).toFixed(1)}%
                </td>
                <td className="px-2 py-1.5 text-end font-mono">
                  {Math.round(model.treatment[index].size)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Insight tone="warning">
        Treatment wins inside both segments. It can still lose the pooled comparison
        because the arms contain different mixes of those segments. The{" "}
        <strong className="font-medium text-foreground">standardized</strong> rate asks
        the fair question: what would treatment do on the control group&apos;s mix? If
        that number also wins, the pooled reversal is composition, not effect.
        Simpson&apos;s paradox is a warning about denominators, not a trick of arithmetic.
      </Insight>

      <DataTable
        title="Read the numbers · exact counts"
        caption="Synthetic counts behind the Simpson figure. The panel sizes change with the mix slider; the rates do not."
        columns={["Arm", "Segment", "Converted", "Total"]}
        rows={SEGMENTS.flatMap((segment) => [
          ["Control", segment.label, segment.control.converted, segment.control.total],
          ["Treatment", segment.label, segment.treatment.converted, segment.treatment.total],
        ])}
      />
    </div>
  );
}
