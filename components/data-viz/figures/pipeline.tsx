"use client";

import { useState } from "react";
import { SkipForward } from "lucide-react";
import {
  AdaptiveStepper,
  AdaptiveStepperDecrement,
  AdaptiveStepperIncrement,
  AdaptiveStepperValue,
} from "@/components/motion/adaptive-stepper";
import {
  PIPELINE_SCENARIOS,
  PIPELINE_STAGES,
} from "@/lib/data-viz/figure-data";
import { Insight, ToggleChip } from "@/components/data-viz/lab-ui";
import { Controls, LiveReadout, VerdictPill } from "./kit";
import { cn } from "@/lib/utils";

export function PipelineFigure() {
  const [scenarioId, setScenarioId] = useState(PIPELINE_SCENARIOS[0].id);
  const [stage, setStage] = useState(1);
  const [showSkip, setShowSkip] = useState(false);

  const scenario =
    PIPELINE_SCENARIOS.find((item) => item.id === scenarioId) ?? PIPELINE_SCENARIOS[0];
  const index = Math.min(PIPELINE_STAGES.length, Math.max(1, stage)) - 1;
  const current = PIPELINE_STAGES[index];

  return (
    <div className="space-y-4">
      <Controls>
        <div role="group" aria-label="Worked scenario" className="flex flex-wrap gap-1">
          {PIPELINE_SCENARIOS.map((item) => (
            <ToggleChip
              key={item.id}
              pressed={item.id === scenario.id}
              onClick={() => {
                setScenarioId(item.id);
                setStage(1);
              }}
            >
              {item.label}
            </ToggleChip>
          ))}
        </div>
        <AdaptiveStepper
          value={stage}
          onValueChange={setStage}
          min={1}
          max={PIPELINE_STAGES.length}
          aria-label="Pipeline stage"
          formatValueText={(value) => `Stage ${value} of ${PIPELINE_STAGES.length}`}
        >
          <AdaptiveStepperDecrement />
          <AdaptiveStepperValue>{(value) => `Stage ${value}`}</AdaptiveStepperValue>
          <AdaptiveStepperIncrement />
        </AdaptiveStepper>
        <ToggleChip pressed={showSkip} onClick={() => setShowSkip(!showSkip)}>
          <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
          What if this step is skipped?
        </ToggleChip>
      </Controls>

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <ol className="space-y-1" aria-label="Ten-stage pipeline">
          {PIPELINE_STAGES.map((item, itemIndex) => {
            const active = itemIndex === index;
            const passed = itemIndex < index;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={active ? "step" : undefined}
                  onClick={() => setStage(itemIndex + 1)}
                  className={cn(
                    "press flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-start text-xs transition-colors",
                    active
                      ? "border-foreground/30 bg-foreground text-background"
                      : passed
                        ? "border-border bg-card/50 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-border-strong hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-5 w-5 shrink-0 place-items-center rounded-full font-mono text-[10px]",
                      active ? "bg-background/20" : "bg-card",
                    )}
                  >
                    {itemIndex + 1}
                  </span>
                  {item.label}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="min-w-0 rounded-2xl border border-border bg-card/40 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {scenario.label} · stage {index + 1} of {PIPELINE_STAGES.length}
            </p>
            <VerdictPill tone="neutral">{current.label}</VerdictPill>
          </div>

          <p className="mt-3 text-sm font-medium text-foreground">{current.prompt}</p>

          <LiveReadout className="mt-3">
            <p className="rounded-xl border border-border bg-background p-3 text-sm leading-7 text-foreground/85">
              {scenario.stageCopy[index]}
            </p>
          </LiveReadout>

          {showSkip ? (
            <p className="mt-3 flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.07] p-3 text-xs leading-6 text-muted-foreground">
              <span aria-hidden="true">⚠</span>
              <span>{scenario.skip}</span>
            </p>
          ) : (
            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
              The pipeline is a decision order, not a menu. Stage 1 is not
              &ldquo;pick a chart&rdquo;; it is the decision that makes a chart worth
              drawing. Use the arrows or pick a stage.
            </p>
          )}

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {["Evidence layer", "Storytelling layer", "Action"].map((label, itemIndex) => (
              <div
                key={label}
                className={cn(
                  "rounded-xl border p-2.5 text-[11px] leading-5",
                  (itemIndex === 0 && index < 7) || (itemIndex === 1 && index === 7) || (itemIndex === 2 && index > 7)
                    ? "border-foreground/25 bg-background text-foreground"
                    : "border-border bg-background/50 text-muted-foreground",
                )}
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.12em]">{label}</p>
                <p className="mt-1">
                  {itemIndex === 0
                    ? "Question → scale → context → integrity"
                    : itemIndex === 1
                      ? "The Big Idea and the audience"
                      : "The sentence the reader can act on"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Insight>
        The source separates the <strong className="font-medium text-foreground">evidence
        layer</strong> (a truthful chart) from the <strong className="font-medium text-foreground">storytelling
        layer</strong> (what the audience should notice). A skip in the evidence columns
        cannot be repaired by better narration later.
      </Insight>
    </div>
  );
}
