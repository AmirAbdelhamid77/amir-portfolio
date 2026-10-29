"use client";

import { useMemo, useState } from "react";
import { UNCERTAINTY_ESTIMATES, uncertaintyVerdict } from "@/lib/data-viz/figure-data";
import { scaleLinear } from "@/lib/data-viz/chart-math";
import { Insight, RangeControl, ToggleChip } from "@/components/data-viz/lab-ui";
import { Plot, Controls, ResetButton, LiveReadout, PLOT, VerdictPill } from "./kit";

const VERDICT_COLOR: Record<ReturnType<typeof uncertaintyVerdict>, string> = {
  "decision-sized": "var(--chart-2)",
  "detectable-only": "var(--chart-3)",
  inconclusive: "var(--chart-5)",
};

const VERDICT_LABEL: Record<ReturnType<typeof uncertaintyVerdict>, string> = {
  "decision-sized": "Decision-sized",
  "detectable-only": "Detectable only",
  inconclusive: "Inconclusive",
};

export function UncertaintyFigure() {
  const [threshold, setThreshold] = useState(5);
  const [showIntervals, setShowIntervals] = useState(true);

  const model = useMemo(() => {
    const x = scaleLinear({ min: -3, max: 16 }, { min: PLOT.left, max: PLOT.width - PLOT.right });
    return {
      x,
      rows: UNCERTAINTY_ESTIMATES.map((estimate) => ({
        estimate,
        verdict: uncertaintyVerdict(estimate, threshold),
      })),
    };
  }, [threshold]);

  return (
    <div className="space-y-3">
      <Controls>
        <div className="min-w-[230px] flex-1">
          <RangeControl
            label="Decision threshold (percentage points)"
            value={threshold}
            min={0}
            max={10}
            step={0.5}
            onChange={setThreshold}
            display={`${threshold.toFixed(1)} pp`}
          />
        </div>
        <ToggleChip pressed={showIntervals} onClick={() => setShowIntervals(!showIntervals)}>
          {showIntervals ? "Hide intervals" : "Show intervals"}
        </ToggleChip>
        <ResetButton
          onClick={() => {
            setThreshold(5);
            setShowIntervals(true);
          }}
          disabled={threshold === 5 && showIntervals}
        />
      </Controls>

      <Plot
        label={`Three effect estimates with confidence intervals against a decision threshold of ${threshold.toFixed(1)} points.`}
        caption={
          showIntervals
            ? "A bar is the interval; the dot is the point estimate. The dashed line is the smallest effect that would change the decision."
            : "Points only. Without the intervals, the three estimates look more different than the evidence supports."
        }
      >
        <svg viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} className="h-auto w-full">
          {[0, 5, 10, 15].map((tick) => (
            <g key={tick}>
              <line x1={model.x(tick)} x2={model.x(tick)} y1={PLOT.top} y2={PLOT.height - PLOT.bottom} stroke="var(--border)" />
              <text x={model.x(tick)} y={PLOT.height - 14} textAnchor="middle" fontSize={10} fill="var(--muted-foreground)">
                {tick} pp
              </text>
            </g>
          ))}

          <line
            x1={model.x(threshold)}
            x2={model.x(threshold)}
            y1={PLOT.top - 6}
            y2={PLOT.height - PLOT.bottom}
            stroke="var(--chart-5)"
            strokeDasharray="5 4"
            strokeWidth={2}
          />
          <text x={model.x(threshold) + 5} y={PLOT.top} fontSize={10} fill="var(--chart-5)">
            act at {threshold.toFixed(1)} pp
          </text>

          {model.rows.map((row, index) => {
            const y = PLOT.top + 34 + index * 66;
            const color = VERDICT_COLOR[row.verdict];
            return (
              <g key={row.estimate.id}>
                <text x={PLOT.left - 8} y={y + 4} textAnchor="end" fontSize={10} fill="var(--muted-foreground)">
                  {row.estimate.label}
                </text>
                {showIntervals ? (
                  <g>
                    <line x1={model.x(row.estimate.low)} x2={model.x(row.estimate.high)} y1={y} y2={y} stroke={color} strokeWidth={7} strokeLinecap="round" opacity={0.35} />
                    <line x1={model.x(row.estimate.low)} x2={model.x(row.estimate.low)} y1={y - 8} y2={y + 8} stroke={color} strokeWidth={2} />
                    <line x1={model.x(row.estimate.high)} x2={model.x(row.estimate.high)} y1={y - 8} y2={y + 8} stroke={color} strokeWidth={2} />
                  </g>
                ) : null}
                <circle cx={model.x(row.estimate.effect)} cy={y} r={showIntervals ? 5 : 7} fill={color} />
                <text x={model.x(row.estimate.effect)} y={y - 14} textAnchor="middle" fontSize={10} fill="var(--foreground)">
                  {row.estimate.effect.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>
      </Plot>

      <LiveReadout>
        <div className="space-y-2">
          {model.rows.map((row) => (
            <div key={row.estimate.id} className="rounded-xl border border-border bg-card/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-foreground">{row.estimate.label}</p>
                <VerdictPill
                  tone={
                    row.verdict === "decision-sized"
                      ? "good"
                      : row.verdict === "detectable-only"
                        ? "warn"
                        : "bad"
                  }
                >
                  {VERDICT_LABEL[row.verdict]}
                </VerdictPill>
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {row.estimate.effect.toFixed(1)} pp · 95% CI [{row.estimate.low.toFixed(1)},{" "}
                {row.estimate.high.toFixed(1)}]
                {row.estimate.flag === "implausible" ? " · interval implausibly narrow" : ""}
              </p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{row.estimate.note}</p>
            </div>
          ))}
        </div>
      </LiveReadout>

      <Insight tone="warning">
        &ldquo;Statistically detectable&rdquo; means the interval excludes zero.
        &ldquo;Decision-sized&rdquo; means the whole interval clears the bar the team
        agreed to act on. The second estimate is a deliberately implausible
        counterexample: a 0.2-point interval is usually a sign of a broken assumption, not
        extraordinary precision.
      </Insight>

      <p className="text-[10px] leading-5 text-muted-foreground">
        Synthetic teaching estimates. The intervals are illustrative, not the result of a
        real trial; the point is the decision rule, not the specific numbers.
      </p>
    </div>
  );
}
