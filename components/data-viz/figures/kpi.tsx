"use client";

import { useMemo, useState } from "react";
import { EyeOff } from "lucide-react";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { KPI } from "@/lib/data-viz/figure-data";
import { extent, scaleLinear } from "@/lib/data-viz/chart-math";
import { RangeControl, ToggleChip } from "@/components/data-viz/lab-ui";
import { Controls, LiveReadout, ResetButton, VerdictPill } from "./kit";
import { cn } from "@/lib/utils";

type Part = "window" | "target" | "direction" | "exception";

const PARTS: { id: Part; label: string; missing: string }[] = [
  { id: "window", label: "Window", missing: "Without a window, 94.2% could be today or the decade." },
  { id: "target", label: "Target", missing: "Without a target, the reader cannot know whether 94.2% is good." },
  { id: "direction", label: "Direction", missing: "Without a prior period, improvement and decline look identical." },
  { id: "exception", label: "Exception", missing: "Without the exception, the average hides Cairo at 81%." },
];

export function KpiFigure() {
  const [value, setValue] = useState(KPI.value);
  const [hidden, setHidden] = useState<Part[]>([]);

  const model = useMemo(() => {
    const deltaTarget = value - KPI.target;
    const deltaPrior = value - KPI.prior;
    const spark = [...KPI.spark.slice(0, -1), value];
    const domain = extent([...spark, KPI.target]);
    const y = scaleLinear(
      { min: domain.min - 1, max: domain.max + 1 },
      { min: 74, max: 12 },
    );
    const x = scaleLinear({ min: 0, max: spark.length - 1 }, { min: 8, max: 312 });
    const path = spark
      .map((point, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(point).toFixed(1)}`)
      .join(" ");
    return { deltaTarget, deltaPrior, spark, path, y };
  }, [value]);

  const onTarget = value >= KPI.target;
  const improving = model.deltaPrior >= 0;
  const visible = (part: Part) => !hidden.includes(part);

  const toggle = (part: Part) =>
    setHidden((current) =>
      current.includes(part) ? current.filter((item) => item !== part) : [...current, part],
    );

  return (
    <div className="space-y-3">
      <Controls>
        <div role="group" aria-label="KPI card parts" className="flex flex-wrap gap-1">
          {PARTS.map((part) => (
            <ToggleChip key={part.id} pressed={visible(part.id)} onClick={() => toggle(part.id)}>
              {part.label}
            </ToggleChip>
          ))}
        </div>
        <div className="min-w-[220px] flex-1">
          <RangeControl
            label="Latest value"
            value={value}
            min={91}
            max={99}
            step={0.1}
            onChange={setValue}
            display={`${value.toFixed(1)}%`}
          />
        </div>
        <ResetButton
          onClick={() => {
            setValue(KPI.value);
            setHidden([]);
          }}
          disabled={value === KPI.value && hidden.length === 0}
        />
      </Controls>

      <div className="grid gap-3 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-foreground">{KPI.metric}</p>
              {visible("window") ? (
                <p className="text-[10px] text-muted-foreground">{KPI.window}</p>
              ) : (
                <p className="text-[10px] italic text-rose-600 dark:text-rose-400">no window</p>
              )}
            </div>
            {visible("target") ? (
              <VerdictPill tone={onTarget ? "good" : "bad"}>
                {onTarget ? "on target" : "below target"}
              </VerdictPill>
            ) : (
              <VerdictPill tone="warn">no target</VerdictPill>
            )}
          </div>

          <p className="mt-3 font-mono text-4xl font-medium tracking-tight text-foreground">
            <AnimatedNumber
              value={value}
              startOnView={false}
              format={(next) => `${next.toFixed(1)}%`}
            />
          </p>

          <div className="mt-1 space-y-0.5 text-[11px] leading-5">
            {visible("target") ? (
              <p className={cn("font-medium", onTarget ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400")}>
                {model.deltaTarget >= 0 ? "+" : ""}
                {model.deltaTarget.toFixed(1)} pp vs target {KPI.target}%
              </p>
            ) : null}
            {visible("direction") ? (
              <p className="text-muted-foreground">
                {improving ? "▲" : "▼"} {Math.abs(model.deltaPrior).toFixed(1)} pp vs prior
                window ({KPI.prior}%)
              </p>
            ) : null}
            {visible("exception") ? (
              <p className="text-amber-700 dark:text-amber-400">Exception: {KPI.exception}</p>
            ) : null}
          </div>

          <svg viewBox="0 0 320 90" className="mt-3 h-auto w-full" role="img" aria-label={`Trend of ${KPI.metric} over eight periods, ending at ${value.toFixed(1)}%.`}>
            <line
              x1={8}
              x2={312}
              y1={model.y(KPI.target)}
              y2={model.y(KPI.target)}
              stroke="var(--chart-3)"
              strokeDasharray="4 4"
            />
            <path d={model.path} fill="none" stroke="var(--chart-1)" strokeWidth={2.5} strokeLinejoin="round" />
            <circle cx={304} cy={model.y(value)} r={4} fill="var(--chart-1)" />
            <text x={8} y={86} fontSize={9} fill="var(--muted-foreground)">
              8 periods
            </text>
            <text x={312} y={86} textAnchor="end" fontSize={9} fill="var(--muted-foreground)">
              target {KPI.target}%
            </text>
          </svg>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">The card as a sentence</p>
          <p aria-live="polite" className="rounded-xl border border-border bg-card/50 p-3 text-xs leading-6 text-foreground/85">
            {KPI.metric}
            {visible("window") ? ` for the ${KPI.window}` : ""} is{" "}
            <span className="font-mono">{value.toFixed(1)}%</span>
            {visible("target") ? ` against a ${KPI.target}% target` : ""}
            {visible("direction") ? `, ${improving ? "up" : "down"} ${Math.abs(model.deltaPrior).toFixed(1)} pp on the prior window` : ""}
            {visible("exception") ? `, with ${KPI.exception.toLowerCase()} as the exception` : ""}.
          </p>

          {hidden.length ? (
            <ul className="space-y-1.5">
              {PARTS.filter((part) => hidden.includes(part.id)).map((part) => (
                <li key={part.id} className="flex gap-2 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] px-2.5 py-2 text-[11px] leading-5 text-muted-foreground">
                  <EyeOff className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                  {part.missing}
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-emerald-500/25 bg-emerald-500/[0.05] px-2.5 py-2 text-[11px] leading-5 text-muted-foreground">
              All five parts are present. Remove one and the sentence stops being
              actionable — that is the test for a KPI card.
            </p>
          )}
        </div>
      </div>

      <LiveReadout>
        <p className="text-[11px] leading-5 text-muted-foreground">
          Value, window, target, direction and exception are five separate fields, not
          decoration. The animated number shows the change; it does not smooth or
          forecast the series.
        </p>
      </LiveReadout>
    </div>
  );
}
