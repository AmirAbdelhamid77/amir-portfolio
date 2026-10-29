"use client";

import { useMemo, useState } from "react";
import {
  formatNumber,
  formatPercent,
  mulberry32,
  poissonCdf,
  poissonMoments,
  poissonPmf,
  poissonRandom,
  poissonTailAtLeast,
} from "@/lib/statistics/math";
import { DataTableView } from "@/components/statistics/chart-kit";
import { PmfChart } from "@/components/statistics/charts/pmf";
import {
  Assumptions,
  Interpretation,
  LabNumber,
  LabShell,
  LabSlider,
  Panel,
  PredictionPrompt,
  PresetButtons,
  ReadoutGrid,
  ResetButton,
  Segmented,
  SyntheticNote,
} from "@/components/statistics/lab-kit";

type Mode = "exact" | "atMost" | "atLeast";

export function PoissonLab({ compact = false }: { compact?: boolean }) {
  const [lambda, setLambda] = useState(20);
  const [k, setK] = useState(25);
  const [mode, setMode] = useState<Mode>("atLeast");
  const [windowLength, setWindowLength] = useState(1);
  const [seed, setSeed] = useState(7);

  const baseLambda = Math.max(0.1, Math.min(60, lambda));
  const effectiveLambda = baseLambda * windowLength;
  const safeK = Math.max(0, Math.round(k));
  const maxK = Math.min(160, Math.ceil(effectiveLambda + 5 * Math.sqrt(effectiveLambda) + 4));
  const clampedK = Math.min(maxK, safeK);
  const bars = useMemo(
    () =>
      Array.from({ length: maxK + 1 }, (_, index) => ({
        k: index,
        p: poissonPmf(effectiveLambda, index),
      })),
    [effectiveLambda, maxK],
  );
  const moments = poissonMoments(effectiveLambda);
  const probability =
    mode === "exact"
      ? poissonPmf(effectiveLambda, clampedK)
      : mode === "atMost"
        ? poissonCdf(effectiveLambda, clampedK)
        : poissonTailAtLeast(effectiveLambda, clampedK);

  const arrivals = useMemo(() => {
    const random = mulberry32(seed);
    return Array.from({ length: 14 }, () => poissonRandom(random, effectiveLambda));
  }, [seed, effectiveLambda]);

  const summary = `Poisson PMF with mean ${formatNumber(effectiveLambda, 2)} arrivals per interval. Highlighted ${mode === "exact" ? `exactly ${clampedK}` : mode === "atMost" ? `at most ${clampedK}` : `at least ${clampedK}`} arrivals: ${formatPercent(probability, 2)}.`;


  function reset() {
    setLambda(20);
    setK(25);
    setMode("atLeast");
    setWindowLength(1);
    setSeed(7);
  }

  const content = (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="Counts in a fixed interval, not a waiting time"
          description="λ is a mean count per stated interval. Doubling the window doubles λ; it does not double the probability of one particular count."
          action={<ResetButton onClick={() => reset()} />}
        >
          <PmfChart
            bars={bars}
            highlight={(index) =>
              mode === "exact" ? index === clampedK : mode === "atMost" ? index <= clampedK : index >= clampedK
            }
            meanLine={effectiveLambda}
            valueLabel={(index) => index === clampedK}
            xLabel={`k = arrivals per ${windowLength === 1 ? "interval" : `${windowLength} intervals`}`}
            summary={summary}
            caption={`The dashed line is λ=${formatNumber(effectiveLambda, 1)}. Counts are integers; there is no bar at 12.5 arrivals.`}
            table={
              <DataTableView
                caption="Poisson PMF and CDF for every k in the plotted range."
                title="Exact PMF and CDF"
                columns={["k", "P(X = k)", "P(X ≤ k)"]}
                rows={bars.map((bar) => [
                  String(bar.k),
                  formatNumber(bar.p, 6),
                  formatNumber(poissonCdf(effectiveLambda, bar.k), 6),
                ])}
              />
            }
          />

          <div className="mt-3 rounded-xl border border-border bg-background p-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Simulated arrivals · 14 equal windows · seed {seed}
            </p>
            <div className="mt-2 flex items-end gap-1 overflow-x-auto pb-1" aria-hidden="true">
              {arrivals.map((count, index) => (
                <div key={index} className="flex min-w-6 flex-col items-center gap-1">
                  <div className="flex h-14 flex-col-reverse gap-0.5">
                    {Array.from({ length: Math.min(count, 12) }, (_, dot) => (
                      <span key={dot} className="h-1.5 w-1.5 rounded-full bg-[var(--chart-3)]" />
                    ))}
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
            <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
              This strip is a seeded simulation, not observations. It is here to make “counts per window” concrete;
              the exact probabilities above come from the formula, not from these 14 windows.
            </p>
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel title="Controls">
            <div className="space-y-3">
              <LabSlider
                label="λ — mean arrivals per base interval"
                value={baseLambda}
                min={0.1}
                max={60}
                step={0.1}
                onChange={setLambda}
                display={formatNumber(baseLambda, 1)}
              />
              <Segmented
                label="Interval length"
                value={String(windowLength)}
                onChange={(value) => setWindowLength(Number(value))}
                options={[
                  { value: "0.5", label: "×0.5" },
                  { value: "1", label: "×1" },
                  { value: "2", label: "×2" },
                ]}
                size="sm"
              />
              <LabSlider
                label="k — arrivals in the interval"
                value={clampedK}
                min={0}
                max={maxK}
                step={1}
                onChange={setK}
                display={String(clampedK)}
              />
              <Segmented
                label="Event"
                value={mode}
                onChange={setMode}
                options={[
                  { value: "exact", label: "P(X=k)" },
                  { value: "atMost", label: "P(X≤k)" },
                  { value: "atLeast", label: "P(X≥k)" },
                ]}
                size="sm"
              />
              <LabNumber
                label="Simulation seed"
                value={seed}
                min={1}
                max={9999}
                step={1}
                onChange={setSeed}
                hint="same seed → same arrival strip"
              />
              <button
                type="button"
                onClick={() => setSeed((current) => (current >= 9999 ? 1 : current + 1))}
                className="press inline-flex h-8 items-center rounded-full border border-border px-3 text-[11px] text-muted-foreground hover:text-foreground"
              >
                Replay arrivals
              </button>
              <PresetButtons
                presets={[
                  { id: "source", label: "Source λ=20, k≥25" },
                  { id: "restaurant", label: "Restaurant λ=12" },
                  { id: "website", label: "Website λ=4" },
                  { id: "integer", label: "Integer λ=5" },
                ]}
                onSelect={(id) => {
                  setWindowLength(1);
                  if (id === "source") {
                    setLambda(20);
                    setK(25);
                    setMode("atLeast");
                  } else if (id === "restaurant") {
                    setLambda(12);
                    setK(15);
                    setMode("atLeast");
                  } else if (id === "website") {
                    setLambda(4);
                    setK(6);
                    setMode("atMost");
                  } else {
                    setLambda(5);
                    setK(5);
                    setMode("exact");
                  }
                }}
              />
            </div>
          </Panel>

          <Panel title="Read the numbers">
            <ReadoutGrid
              columns={2}
              items={[
                { label: "Effective λ", value: formatNumber(effectiveLambda, 2), note: "per stated window" },
                { label: "Selected event", value: formatNumber(probability, 5), note: formatPercent(probability, 2) },
                { label: "P(X = k)", value: formatNumber(poissonPmf(effectiveLambda, clampedK), 5) },
                { label: "P(X ≤ k)", value: formatNumber(poissonCdf(effectiveLambda, clampedK), 5) },
                { label: "E(X) = λ", value: formatNumber(moments.mean, 2) },
                { label: "Var(X) = λ", value: formatNumber(moments.variance, 2) },
                { label: "SD = √λ", value: formatNumber(moments.sd, 2) },
                {
                  label: "Mode",
                  value: moments.mode.map((value) => formatNumber(value, 0)).join(" & "),
                  note: Number.isInteger(effectiveLambda) && effectiveLambda > 0 ? "integer λ → two adjacent modes" : "floor(λ)",
                },
              ]}
            />
          </Panel>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <PredictionPrompt
          question="For λ=20, the source said P(X≥25) is “a little over 11%”. Is that correct?"
          options={["Yes, about 11%", "No, about 15.7%", "No, about 5%"]}
          correct={1}
          explanation="P(X≥25) for λ=20 is 0.15677, i.e. 15.68%. The exact P(X=13) of 2.71% in the source is correct; the tail statement was not. The corrected value is checked in the math tests."
        />
        <Interpretation tone="warning" title="Correction, not a rewrite:">
          Source §10.3 says the chance of 25 or more arrivals is “a little over 11%”. Independent computation gives
          15.68%. The prose now shows the corrected figure alongside the source claim; the rest of the Poisson
          section is preserved.
        </Interpretation>
      </div>

      <Assumptions
        items={[
          "A fixed exposure interval: λ must be tied to a stated window (per hour, per day, per 100 m²).",
          "Events occur independently in non-overlapping intervals.",
          "The rate λ is constant within the interval; clustering or seasonality breaks the model.",
          "Counts are non-negative integers. λ is a mean, so it can be non-integer.",
          "At integer λ both λ−1 and λ are modes; “the peak is always λ” is not a safe rule.",
        ]}
        note="Poisson models counts, not the waiting time between events. A waiting-time question needs an exponential model instead."
      />
      <SyntheticNote>
        Arrival dots are generated from the stated Poisson rate with a fixed seed. They are a teaching simulation, not
        observed traffic, patients or customers.
      </SyntheticNote>
    </div>
  );

  if (compact) return content;

  return (
    <LabShell
      title="Poisson event-arrival theatre"
      question="How unusual is 25 arrivals when the rate is 20 per hour?"
      description="Set λ and k, switch event type, and compare the exact PMF with seeded arrival windows."
      tier="P0"
    >
      {content}
    </LabShell>
  );

}
