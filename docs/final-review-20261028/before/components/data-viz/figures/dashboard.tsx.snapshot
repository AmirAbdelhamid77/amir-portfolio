"use client";

import { useState } from "react";
import {
  AdaptiveStepper,
  AdaptiveStepperDecrement,
  AdaptiveStepperIncrement,
  AdaptiveStepperValue,
} from "@/components/motion/adaptive-stepper";
import { DASHBOARD_SCENARIOS, DASHBOARD_TIERS } from "@/lib/data-viz/figure-data";
import { Insight, ToggleChip } from "@/components/data-viz/lab-ui";
import { Controls, LiveReadout, VerdictPill } from "./kit";
import { cn } from "@/lib/utils";

const BAND_HEIGHT = [26, 54, 40, 54, 26];

export function DashboardFigure() {
  const [scenarioId, setScenarioId] = useState(DASHBOARD_SCENARIOS[0].id);
  const [tier, setTier] = useState(2);

  const scenario =
    DASHBOARD_SCENARIOS.find((item) => item.id === scenarioId) ?? DASHBOARD_SCENARIOS[0];
  const index = Math.min(DASHBOARD_TIERS.length, Math.max(1, tier)) - 1;

  return (
    <div className="space-y-4">
      <Controls>
        <div role="group" aria-label="Dashboard scenario" className="flex flex-wrap gap-1">
          {DASHBOARD_SCENARIOS.map((item) => (
            <ToggleChip
              key={item.id}
              pressed={item.id === scenario.id}
              onClick={() => {
                setScenarioId(item.id);
                setTier(2);
              }}
            >
              {item.label}
            </ToggleChip>
          ))}
        </div>
        <AdaptiveStepper
          value={tier}
          onValueChange={setTier}
          min={1}
          max={DASHBOARD_TIERS.length}
          aria-label="Dashboard tier"
          formatValueText={(value) => `Tier ${value} of ${DASHBOARD_TIERS.length}`}
        >
          <AdaptiveStepperDecrement />
          <AdaptiveStepperValue>{(value) => `Tier ${value}`}</AdaptiveStepperValue>
          <AdaptiveStepperIncrement />
        </AdaptiveStepper>
      </Controls>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-1.5 rounded-2xl border border-border bg-muted/20 p-3">
          {DASHBOARD_TIERS.map((item, itemIndex) => {
            const active = itemIndex === index;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? "true" : undefined}
                onClick={() => setTier(itemIndex + 1)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg border px-3 text-start text-[11px] transition-colors",
                  active
                    ? "border-foreground/30 bg-background text-foreground shadow-sm"
                    : "border-border bg-background/60 text-muted-foreground hover:border-border-strong hover:text-foreground",
                )}
                style={{ height: BAND_HEIGHT[itemIndex] }}
              >
                <span>
                  {itemIndex + 1}. {item.label}
                </span>
                <span className="truncate text-[10px]">{item.question}</span>
              </button>
            );
          })}
          <p className="pt-1 text-[10px] leading-5 text-muted-foreground">
            The scan path is top to bottom. A detail table above the KPI makes the
            reader do the summary in their head.
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-border bg-card/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {scenario.label}
            </p>
            <VerdictPill tone="neutral">{DASHBOARD_TIERS[index].label}</VerdictPill>
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">
            {DASHBOARD_TIERS[index].question}
          </p>
          <LiveReadout className="mt-2">
            <p className="rounded-xl border border-border bg-background p-3 text-sm leading-7 text-foreground/85">
              {scenario.tiers[index]}
            </p>
          </LiveReadout>

          {index === 1 ? (
            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
              A status without a target and a window is not a KPI. The red/green state
              belongs here; the explanation is the next tier down.
            </p>
          ) : null}
          {index === 4 ? (
            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
              The action is the sentence that makes the dashboard worth opening. If
              tier 5 is empty, the page is a gallery.
            </p>
          ) : null}
        </div>
      </div>

      <Insight>
        Progressive disclosure is the layout: a reader who only reads tiers 1–2 still
        leaves with the right status; a reader who needs the cause can go to tier 3,
        then the segment grain in tier 4, without a second dashboard.
      </Insight>
    </div>
  );
}
