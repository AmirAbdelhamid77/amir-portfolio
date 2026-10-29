"use client";

import { useMemo, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { ToggleChip, KeyNumbers, Insight } from "@/components/data-viz/lab-ui";
import { Plot, Controls, ResetButton, LiveReadout, PLOT } from "./kit";

const VALUES = [
  { id: "a", label: "A", value: 22.5 },
  { id: "b", label: "B", value: 21.0 },
];

const TRUNCATED_MIN = 20.5;

export function BaselineFigure() {
  const [zero, setZero] = useState(true);

  const model = useMemo(() => {
    const domainMin = zero ? 0 : TRUNCATED_MIN;
    const domainMax = zero ? 25 : 23;
    const innerWidth = PLOT.width - PLOT.left - PLOT.right;
    const x = (value: number) =>
      PLOT.left + ((value - domainMin) / (domainMax - domainMin)) * innerWidth;
    const longest = Math.max(...VALUES.map((row) => row.value - domainMin));
    const ratio = (VALUES[0].value - domainMin) / (VALUES[1].value - domainMin);
    const share = (VALUES[0].value - domainMin) / longest;
    return { domainMin, domainMax, x, ratio, share };
  }, [zero]);

  const ticks = zero
    ? [0, 5, 10, 15, 20, 25]
    : [TRUNCATED_MIN, 21, 21.5, 22, 22.5, 23];

  const labels = "A is " + (model.ratio >= 1.5 ? `${model.ratio.toFixed(1)}×` : `${Math.round((model.ratio - 1) * 100)}%`) + " longer than B";

  return (
    <div className="space-y-3">
      <Controls>
        <div role="group" aria-label="Axis baseline" className="flex flex-wrap gap-1">
          <ToggleChip pressed={zero} onClick={() => setZero(true)}>
            Zero baseline
          </ToggleChip>
          <ToggleChip pressed={!zero} onClick={() => setZero(false)}>
            Truncated axis
          </ToggleChip>
        </div>
        <ResetButton onClick={() => setZero(true)} disabled={zero} />
      </Controls>

      <Plot
        label={`Bar chart of A ${VALUES[0].value}% and B ${VALUES[1].value}% on a ${zero ? "zero" : "truncated, teaching-counterexample"} baseline. ${labels}.`}
        caption={
          zero
            ? "Zero baseline. The 1.5-point difference is drawn to scale."
            : "Teaching counterexample: the axis starts at 20.5%, so bar length no longer encodes the value."
        }
      >
        <svg viewBox={`0 0 ${PLOT.width} 240`} className="h-auto w-full">
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PLOT.left}
                x2={PLOT.width - PLOT.right}
                y1={PLOT.top + (1 - (tick - model.domainMin) / (model.domainMax - model.domainMin)) * 150}
                y2={PLOT.top + (1 - (tick - model.domainMin) / (model.domainMax - model.domainMin)) * 150}
                stroke="var(--border)"
              />
              <text
                x={PLOT.left - 8}
                y={PLOT.top + (1 - (tick - model.domainMin) / (model.domainMax - model.domainMin)) * 150 + 3}
                textAnchor="end"
                fontSize={10}
                fill="var(--muted-foreground)"
              >
                {tick}%
              </text>
            </g>
          ))}

          {VALUES.map((row, index) => {
            const barHeight = 48;
            const y = PLOT.top + 24 + index * 86;
            const end = model.x(row.value);
            return (
              <g key={row.id}>
                <rect
                  x={PLOT.left}
                  y={y}
                  width={Math.max(1, end - PLOT.left)}
                  height={barHeight}
                  rx={6}
                  fill={index === 0 ? "var(--chart-1)" : "var(--chart-2)"}
                />
                <text
                  x={PLOT.left + 10}
                  y={y + barHeight / 2 + 5}
                  fontSize={13}
                  fontWeight={600}
                  fill="#ffffff"
                >
                  {row.label}
                </text>
                <text
                  x={end + 8}
                  y={y + barHeight / 2 + 5}
                  fontSize={13}
                  fontWeight={600}
                  fill="var(--foreground)"
                >
                  {row.value.toFixed(1)}%
                </text>
              </g>
            );
          })}

          <text
            x={PLOT.width - PLOT.right}
            y={232}
            textAnchor="end"
            fontSize={10}
            fill={zero ? "var(--muted-foreground)" : "var(--chart-5)"}
          >
            {zero ? "zero" : "axis starts at 20.5%"}
          </text>
        </svg>
      </Plot>

      <LiveReadout>
        <KeyNumbers
          items={[
            { label: "A", value: "22.5%", note: "index value" },
            { label: "B", value: "21.0%", note: "index value" },
            { label: "Delta", value: "1.5 pp", note: "unchanged" },
            {
              label: "Visual ratio",
              value: model.ratio >= 1.5 ? `${model.ratio.toFixed(1)}×` : `${Math.round((model.ratio - 1) * 100)}%`,
              note: zero ? "A vs B length" : "counterexample",
            },
          ]}
        />
      </LiveReadout>

      {zero ? (
        <Insight>
          On a common zero baseline, A is about 7% longer — which is what a 1.5-point
          difference looks like. The axis is part of the encoding.
        </Insight>
      ) : (
        <p className="flex gap-2 rounded-xl border border-rose-500/25 bg-rose-500/[0.06] p-3 text-xs leading-6 text-muted-foreground">
          <TriangleAlert className="mt-1 h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
          <span>
            <strong className="font-medium text-foreground">Deliberately misleading.</strong>{" "}
            The same two values now look {model.ratio.toFixed(1)}× apart. No number
            changed; only the axis did. This panel exists to make the trick visible,
            never to present the comparison.
          </span>
        </p>
      )}
    </div>
  );
}
