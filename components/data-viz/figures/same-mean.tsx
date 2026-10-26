"use client";

import { useMemo, useState } from "react";
import { mixtureSample } from "@/lib/data-viz/figure-data";
import { scaleLinear } from "@/lib/data-viz/chart-math";
import { Insight, KeyNumbers, RangeControl, ToggleChip } from "@/components/data-viz/lab-ui";
import { Plot, Controls, ResetButton, LiveReadout, PLOT, VerdictPill } from "./kit";

const MIN = 40;
const MAX = 100;

export function SameMeanFigure() {
  const [shareHigh, setShareHigh] = useState(0.5);
  const [showPoints, setShowPoints] = useState(true);

  const model = useMemo(() => {
    const sample = mixtureSample(shareHigh);
    const x = scaleLinear({ min: MIN, max: MAX }, { min: PLOT.left, max: PLOT.width - PLOT.right });
    const sortedB = [...sample.teamB].sort((a, b) => a - b);
    const q1 = sortedB[Math.floor(sortedB.length * 0.25)];
    const q3 = sortedB[Math.floor(sortedB.length * 0.75)];
    const shareAbove76 = sample.teamB.filter((value) => value >= 76).length / sample.teamB.length;
    return { ...sample, x, q1, q3, shareAbove76 };
  }, [shareHigh]);

  const meanLine = model.x(70);

  return (
    <div className="space-y-3">
      <Controls>
        <div className="min-w-[240px] flex-1">
          <RangeControl
            label="Share of Team B in the high process"
            value={shareHigh}
            min={0}
            max={1}
            step={0.05}
            onChange={setShareHigh}
            display={`${Math.round(shareHigh * 100)}%`}
          />
        </div>
        <ToggleChip pressed={showPoints} onClick={() => setShowPoints(!showPoints)}>
          {showPoints ? "Hide points" : "Show points"}
        </ToggleChip>
        <ResetButton
          onClick={() => {
            setShareHigh(0.5);
            setShowPoints(true);
          }}
          disabled={shareHigh === 0.5 && showPoints}
        />
      </Controls>

      <Plot
        label={`Dot strip for Team A and Team B. Both means are ${model.meanA.toFixed(1)} and ${model.meanB.toFixed(1)}. Team B standard deviation is ${model.sdB.toFixed(1)}.`}
        caption={
          showPoints
            ? "Team A stays one tight process. Team B is a mixture; the mean is held at 70 while the two centres separate."
            : "Mean-only view. This is the report a reader gets when the distribution is hidden: two identical-looking numbers."
        }
      >
        <svg viewBox={`0 0 ${PLOT.width} 260`} className="h-auto w-full">
          {[MIN, 55, 70, 85, MAX].map((tick) => (
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
                {tick}
              </text>
            </g>
          ))}

          {showPoints ? (
            <>
              {model.teamA.map((value, index) => (
                <circle
                  key={`a-${index}`}
                  cx={model.x(value)}
                  cy={72 + Math.sin(index * 2.4) * 18}
                  r={2.6}
                  fill="var(--chart-1)"
                  opacity={0.7}
                />
              ))}
              {model.teamB.map((value, index) => (
                <circle
                  key={`b-${index}`}
                  cx={model.x(value)}
                  cy={158 + Math.sin(index * 2.1) * 20}
                  r={2.6}
                  fill="var(--chart-4)"
                  opacity={0.75}
                />
              ))}
            </>
          ) : (
            <>
              <rect x={meanLine - 3} y={54} width={6} height={160} fill="var(--chart-1)" opacity={0.25} />
              <rect x={meanLine - 3} y={140} width={6} height={160} fill="var(--chart-4)" opacity={0.25} />
            </>
          )}

          <line
            x1={meanLine}
            x2={meanLine}
            y1={PLOT.top}
            y2={220}
            stroke="var(--chart-5)"
            strokeWidth={2}
            strokeDasharray="5 4"
          />
          <text x={meanLine + 6} y={PLOT.top + 10} fontSize={10} fill="var(--chart-5)">
            mean 70
          </text>

          <text x={PLOT.left} y={48} fontSize={11} fontWeight={600} fill="var(--chart-1)">
            Team A · SD {model.sdA.toFixed(1)}
          </text>
          <text x={PLOT.left} y={134} fontSize={11} fontWeight={600} fill="var(--chart-4)">
            Team B · SD {model.sdB.toFixed(1)}
          </text>
        </svg>
      </Plot>

      <LiveReadout>
        <KeyNumbers
          items={[
            { label: "Mean A", value: model.meanA.toFixed(1), note: "target 70" },
            { label: "Mean B", value: model.meanB.toFixed(1), note: "held at 70" },
            { label: "SD B", value: model.sdB.toFixed(1), note: `A: ${model.sdA.toFixed(1)}` },
            { label: "B ≥ 76", value: `${Math.round(model.shareAbove76 * 100)}%`, note: "tail risk" },
          ]}
        />
      </LiveReadout>

      <div className="flex flex-wrap items-center gap-2">
        <VerdictPill tone={model.sdB > model.sdA * 1.8 ? "warn" : "neutral"}>
          {model.sdB > model.sdA * 1.8 ? "B is not one process" : "B still looks tight"}
        </VerdictPill>
        <VerdictPill tone="neutral">
          median B {model.medianB.toFixed(0)} · IQR {model.q1.toFixed(0)}–{model.q3.toFixed(0)}
        </VerdictPill>
      </div>

      <Insight tone="warning">
        The mean is invariant <em>by construction</em> here: the two centres move apart
        while their weighted average stays 70. That is the trap. A dashboard that shows
        only the mean reports no change while the share above 76% moves from{" "}
        {Math.round(model.shareAbove76 * 100)}% — and the process behind the number
        changes from one team to two.
      </Insight>
    </div>
  );
}
