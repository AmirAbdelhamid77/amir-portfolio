"use client";

import { useMemo, useState } from "react";
import {
  binomialCdf,
  binomialMoments,
  binomialPmf,
  binomialTailAtLeast,
  formatNumber,
  formatPercent,
} from "@/lib/statistics/math";
import { DataTableView } from "@/components/statistics/chart-kit";
import { PmfChart } from "@/components/statistics/charts/pmf";
import {
  Assumptions,
  Interpretation,
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

export function BinomialLab({ compact = false }: { compact?: boolean }) {
  const [n, setN] = useState(20);
  const [p, setP] = useState(0.3);
  const [k, setK] = useState(6);
  const [mode, setMode] = useState<Mode>("atMost");

  const safeN = Math.max(1, Math.min(60, Math.round(n)));
  const safeP = Math.max(0, Math.min(1, p));
  const safeK = Math.max(0, Math.min(safeN, Math.round(k)));
  const bars = useMemo(
    () =>
      Array.from({ length: safeN + 1 }, (_, index) => ({
        k: index,
        p: binomialPmf(safeN, index, safeP),
      })),
    [safeN, safeP],
  );
  const moments = binomialMoments(safeN, safeP);
  const probability =
    mode === "exact"
      ? binomialPmf(safeN, safeK, safeP)
      : mode === "atMost"
        ? binomialCdf(safeN, safeK, safeP)
        : binomialTailAtLeast(safeN, safeK, safeP);

  const atMost = binomialCdf(safeN, safeK, safeP);
  const atLeast = binomialTailAtLeast(safeN, safeK, safeP);
  const summary = `Binomial PMF for ${safeN} trials with success probability ${formatNumber(safeP, 2)}. Highlighted ${mode === "exact" ? `exactly ${safeK}` : mode === "atMost" ? `at most ${safeK}` : `at least ${safeK}`} success${mode === "exact" && safeK === 1 ? "" : "es"}: ${formatPercent(probability, 2)}.`;


  function reset() {
    setN(20);
    setP(0.3);
    setK(6);
    setMode("atMost");
  }

  const content = (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="The PMF has one bar per possible count"
          description="n is fixed by the design; k is the count you are asking about. Bars are probabilities and sum to 1 over all k."
          action={<ResetButton onClick={() => reset()} />}
        >
          <PmfChart
            bars={bars}
            highlight={(index) =>
              mode === "exact" ? index === safeK : mode === "atMost" ? index <= safeK : index >= safeK
            }
            meanLine={moments.mean}
            valueLabel={(index) => index === safeK}
            xLabel="k = number of successes"
            summary={summary}
            caption="The shaded bars are the event. The dashed line is E(X)=np, which need not be an integer."
            legend={
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <li>solid bar: event probability</li>
                <li>faded bar: not in the selected event</li>
                <li>- - np: expected count</li>
              </ul>
            }
            table={
              <DataTableView
                caption="Binomial probability mass and cumulative probability for every k."
                title="Exact PMF and CDF"
                columns={["k", "P(X = k)", "P(X ≤ k)"]}
                rows={bars.map((bar) => [
                  String(bar.k),
                  formatNumber(bar.p, 6),
                  formatNumber(binomialCdf(safeN, bar.k, safeP), 6),
                ])}
              />
            }
          />
        </Panel>

        <div className="space-y-3">
          <Panel title="Controls">
            <div className="space-y-3">
              <LabSlider
                label="n — fixed number of trials"
                value={safeN}
                min={1}
                max={60}
                step={1}
                onChange={(value) => {
                  setN(value);
                  setK((current) => Math.min(current, value));
                }}
                display={String(safeN)}
              />
              <LabSlider
                label="p — success probability per trial"
                value={safeP}
                min={0}
                max={1}
                step={0.01}
                onChange={setP}
                display={formatNumber(safeP, 2)}
                hint="constant across trials"
              />
              <LabSlider
                label="k — successes in the event"
                value={safeK}
                min={0}
                max={safeN}
                step={1}
                onChange={setK}
                display={String(safeK)}
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
              <PresetButtons
                presets={[
                  { id: "coin", label: "20 trials, p=0.5" },
                  { id: "quality", label: "20 trials, p=0.3" },
                  { id: "rare", label: "60 trials, p=0.1" },
                  { id: "edges", label: "p = 0" },
                ]}
                onSelect={(id) => {
                  if (id === "coin") {
                    setN(20);
                    setP(0.5);
                    setK(10);
                  } else if (id === "quality") {
                    setN(20);
                    setP(0.3);
                    setK(6);
                  } else if (id === "rare") {
                    setN(60);
                    setP(0.1);
                    setK(6);
                  } else {
                    setN(20);
                    setP(0);
                    setK(0);
                  }
                  setMode("atMost");
                }}
              />
            </div>
          </Panel>

          <Panel title="Read the numbers">
            <ReadoutGrid
              columns={2}
              items={[
                { label: "Selected event", value: formatNumber(probability, 5), note: formatPercent(probability, 2) },
                { label: "P(X = k)", value: formatNumber(binomialPmf(safeN, safeK, safeP), 5) },
                { label: "P(X ≤ k)", value: formatNumber(atMost, 5) },
                { label: "P(X ≥ k)", value: formatNumber(atLeast, 5) },
                { label: "E(X) = np", value: formatNumber(moments.mean, 2) },
                { label: "Var = np(1−p)", value: formatNumber(moments.variance, 3) },
                { label: "SD", value: formatNumber(moments.sd, 3) },
                { label: "Modal count", value: String(moments.mode) },
              ]}
            />
          </Panel>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <PredictionPrompt
          question="With n=20 and p=0.5, which is larger: P(X=6) or P(X≤6)?"
          options={["P(X=6)", "P(X≤6)", "They are equal"]}
          correct={1}
          explanation="P(X≤6) adds the probabilities of 0, 1, 2, 3, 4, 5 and 6. A cumulative probability includes the exact point plus everything below it, so it cannot be smaller."
        />
        <Interpretation tone="neutral" title="Cumulative or exact?">
          The exact PMF answers “exactly k”. The lower tail answers “k or fewer”; the upper tail answers “k or more”.
          For a discrete count, P(X≥k)=1−P(X≤k−1) — not 1−P(X≤k). At p=0 or p=1 the distribution collapses to a
          single point, and the bars show that directly.
        </Interpretation>
      </div>

      <Assumptions
        items={[
          "Fixed n: the number of trials is decided before observing the outcomes.",
          "Independent trials: one trial's result does not change the next trial's probability.",
          "Constant p: the success probability is the same on every trial.",
          "Binary outcome: each trial is success or failure, with no third category.",
          "The count is discrete and bounded between 0 and n; non-integer k is not a valid outcome.",
        ]}
        note="If trials are not independent or p changes between trials, the binomial model is the wrong tool even if the arithmetic still produces numbers."
      />
      <SyntheticNote>
        Parameters are yours; the bars are computed from the closed-form PMF. They are not a simulation and do not
        describe any real experiment unless you supply that design.
      </SyntheticNote>
    </div>
  );

  if (compact) return content;

  return (
    <LabShell
      title="Binomial distribution machine"
      question="What does “6 successes out of 20 trials” actually mean?"
      description="Set n, p and k, switch between exact, at-most and at-least, and read the probability off the bars."
      tier="P0"
    >
      {content}
    </LabShell>
  );

}
