"use client";

import { useMemo, useState } from "react";
import {
  formatNumber,
  formatPercent,
  meanConfidenceInterval,
  simulateCoverage,
} from "@/lib/statistics/math";
import { DataTableView } from "@/components/statistics/chart-kit";
import { DensityChart } from "@/components/statistics/charts/density";
import { IntervalChart } from "@/components/statistics/charts/interval";
import {
  Assumptions,
  Interpretation,
  LabNumber,
  LabShell,
  LabSlider,
  LabToggle,
  Panel,
  PredictionPrompt,
  ReadoutGrid,
  ResetButton,
  Segmented,
  SyntheticNote,
} from "@/components/statistics/lab-kit";

type Mode = "single" | "coverage";
const TRUE_MEAN = 100;
const TRUE_SIGMA = 15;

export function ConfidenceLab({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<Mode>("single");
  const [n, setN] = useState(25);
  const [confidence, setConfidence] = useState(0.95);
  const [sampleMean, setSampleMean] = useState(104);
  const [sampleSd, setSampleSd] = useState(15);
  const [sigmaKnown, setSigmaKnown] = useState(false);
  const [trials, setTrials] = useState(100);
  const [seed, setSeed] = useState(7);

  const safeN = Math.max(2, Math.min(300, Math.round(n)));
  const safeSd = Math.max(0.1, sampleSd);
  const interval = meanConfidenceInterval({
    mean: sampleMean,
    sd: sigmaKnown ? TRUE_SIGMA : safeSd,
    n: safeN,
    confidence,
    sigmaKnown,
  });

  const coverage = useMemo(
    () =>
      simulateCoverage({
        trueMean: TRUE_MEAN,
        sigma: TRUE_SIGMA,
        n: safeN,
        confidence,
        trials,
        seed,
        sigmaKnown,
      }),
    [safeN, confidence, trials, seed, sigmaKnown],
  );

  const sdSeRatio = (sigmaKnown ? TRUE_SIGMA : safeSd) / interval.se;


  function reset() {
    setMode("single");
    setN(25);
    setConfidence(0.95);
    setSampleMean(104);
    setSampleSd(15);
    setSigmaKnown(false);
    setTrials(100);
    setSeed(7);
  }

  const content = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented
          label="View"
          value={mode}
          onChange={setMode}
          options={[
            { value: "single", label: "One interval" },
            { value: "coverage", label: "Repeated coverage" },
          ]}
        />
        <ResetButton onClick={() => reset()} />
      </div>

      {mode === "single" ? (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Panel
            title="One computed interval"
            description="The curve is the model for the sample mean: centred at the estimate, with spread equal to the standard error."
          >
            <DensityChart
              mu={sampleMean}
              sigma={interval.se}
              xDomain={[sampleMean - 4 * interval.se, sampleMean + 4 * interval.se]}
              shades={[{ kind: "between", from: interval.lower, to: interval.upper }]}
              markers={[
                { x: interval.lower, label: `lower ${formatNumber(interval.lower, 2)}`, color: "var(--chart-5)" },
                { x: interval.upper, label: `upper ${formatNumber(interval.upper, 2)}`, color: "var(--chart-5)" },
              ]}
              xLabel="Sample mean and interval bounds"
              summary={`A ${formatPercent(confidence, 0)} confidence interval for the mean runs from ${formatNumber(interval.lower, 2)} to ${formatNumber(interval.upper, 2)}, centred at ${formatNumber(sampleMean, 2)} with standard error ${formatNumber(interval.se, 3)}.`}
              caption="The curve is a normal approximation to the sampling distribution of the mean. When σ is estimated, the interval's critical value uses t with n−1 degrees of freedom."
            />
          </Panel>

          <div className="space-y-3">
            <Panel title="Controls">
              <div className="space-y-3">
                <LabSlider label="Sample size n" value={safeN} min={2} max={300} step={1} onChange={setN} display={String(safeN)} />
                <label className="block">
                  <span className="text-xs text-muted-foreground">Confidence level</span>
                  <select
                    value={String(confidence)}
                    onChange={(event) => setConfidence(Number(event.target.value))}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground"
                    aria-label="Confidence level"
                  >
                    {[0.8, 0.9, 0.95, 0.99].map((level) => (
                      <option key={level} value={level}>
                        {formatPercent(level, 0)}
                      </option>
                    ))}
                  </select>
                </label>
                <LabSlider label="Sample mean x̄" value={sampleMean} min={0} max={200} step={0.5} onChange={setSampleMean} display={formatNumber(sampleMean, 2)} />
                <LabSlider label="Sample SD s" value={safeSd} min={0.5} max={60} step={0.5} onChange={setSampleSd} display={formatNumber(safeSd, 2)} />
                <LabToggle
                  label="Population σ is known"
                  checked={sigmaKnown}
                  onChange={setSigmaKnown}
                  hint="Known σ uses z; estimated σ uses t with n−1 degrees of freedom."
                />
              </div>
            </Panel>

            <Panel title="Read the numbers">
              <ReadoutGrid
                columns={2}
                items={[
                  { label: "SE", value: formatNumber(interval.se, 3), note: "σ/√n" },
                  { label: "Critical", value: formatNumber(interval.critical, 3), note: interval.method === "z" ? "z" : `t, df=${interval.df}` },
                  { label: "Margin", value: formatNumber(interval.margin, 3) },
                  { label: "Lower", value: formatNumber(interval.lower, 3) },
                  { label: "Upper", value: formatNumber(interval.upper, 3) },
                  { label: "SD / SE", value: formatNumber(sdSeRatio, 2), note: "individual spread vs estimate spread" },
                ]}
              />
            </Panel>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Panel
            title="Repeated intervals against a fixed μ"
            description="Each line is one sample's interval. Solid means covered; dashed red means missed. The observed coverage is a finite-run count, not a guarantee."
          >
            <IntervalChart
              intervals={coverage.intervals}
              trueMean={TRUE_MEAN}
              maxRows={60}
              xLabel="Mean session minutes"
              summary={`${coverage.covered} of ${coverage.trials} intervals covered the fixed true mean ${TRUE_MEAN}. Observed coverage ${formatPercent(coverage.coverage, 1)}; nominal ${formatPercent(confidence, 0)}.`}
              caption="The true μ is fixed at 100; only the samples vary. A method with 95% coverage misses about 5% of intervals in a long run, and a finite run can deviate."
              legend={
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                  <li>solid: interval covers μ</li>
                  <li>dashed red: missed</li>
                  <li>vertical: fixed true μ</li>
                </ul>
              }
              table={
                <DataTableView
                  caption="The first twenty simulated intervals and whether each covered the true mean."
                  title="First 20 intervals"
                  columns={["#", "Estimate", "Lower", "Upper", "Covered"]}
                  rows={coverage.intervals.slice(0, 20).map((item, index) => [
                    String(index + 1),
                    formatNumber(item.estimate, 2),
                    formatNumber(item.lower, 2),
                    formatNumber(item.upper, 2),
                    item.covered ? "yes" : "no",
                  ])}
                  align={["start", "end", "end", "end", "end"]}
                />
              }
            />
          </Panel>

          <div className="space-y-3">
            <Panel title="Coverage controls">
              <div className="space-y-3">
                <LabSlider label="Sample size n" value={safeN} min={2} max={200} step={1} onChange={(value) => { setN(value); setSeed((current) => current + 1); }} display={String(safeN)} />
                <label className="block">
                  <span className="text-xs text-muted-foreground">Confidence level</span>
                  <select
                    value={String(confidence)}
                    onChange={(event) => { setConfidence(Number(event.target.value)); setSeed((current) => current + 1); }}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground"
                    aria-label="Confidence level for coverage"
                  >
                    {[0.8, 0.9, 0.95, 0.99].map((level) => (
                      <option key={level} value={level}>
                        {formatPercent(level, 0)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-muted-foreground">Trials</span>
                  <select
                    value={String(trials)}
                    onChange={(event) => { setTrials(Number(event.target.value)); setSeed((current) => current + 1); }}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground"
                    aria-label="Number of simulated intervals"
                  >
                    {[50, 100, 200, 400].map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </select>
                </label>
                <LabToggle label="Population σ is known" checked={sigmaKnown} onChange={(value) => { setSigmaKnown(value); setSeed((current) => current + 1); }} />
                <LabNumber label="Seed" value={seed} min={1} max={9999} step={1} onChange={setSeed} hint="change to re-run" />
                <button
                  type="button"
                  onClick={() => setSeed((current) => current + 1)}
                  className="press inline-flex h-9 w-full items-center justify-center rounded-full bg-foreground px-4 text-xs font-medium text-background"
                >
                  Redraw intervals
                </button>
              </div>
            </Panel>

            <Panel title="Observed here">
              <ReadoutGrid
                columns={2}
                items={[
                  { label: "Covered", value: `${coverage.covered} / ${coverage.trials}` },
                  { label: "Observed coverage", value: formatPercent(coverage.coverage, 1), tone: "accent" },
                  { label: "Nominal", value: formatPercent(confidence, 0) },
                  { label: "Mean width", value: formatNumber(coverage.meanWidth, 2) },
                  { label: "True μ", value: String(TRUE_MEAN) },
                  { label: "True σ", value: String(TRUE_SIGMA) },
                ]}
              />
            </Panel>
          </div>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        <PredictionPrompt
          question="If n is quadrupled while s and the confidence level stay fixed, what happens to the margin of error?"
          options={["It halves", "It quarters", "It stays the same"]}
          correct={0}
          explanation="SE = s/√n. Quadrupling n multiplies √n by 2, so the standard error — and therefore the margin — halves. The sample SD itself does not systematically shrink."
        />
        <Interpretation tone="warning" title="Careful with the sentence:">
          {mode === "single"
            ? "After it is computed, this interval either contains the fixed population mean or it does not. “95% confidence” describes the long-run coverage of the procedure, not a 95% probability for this particular interval."
            : `In this finite run, ${coverage.covered} of ${coverage.trials} intervals covered the fixed μ. That observed ${formatPercent(coverage.coverage, 1)} is allowed to differ from the nominal ${formatPercent(confidence, 0)}; the method's coverage is a long-run property.`}
        </Interpretation>
      </div>

      <Assumptions
        items={[
          "Observations are independent (or the standard error is adjusted for the design).",
          "The sample mean is approximately normally distributed, or n is large enough for the CLT under the population shape.",
          "σ is known only if it is genuinely known; otherwise the interval uses s and a t critical value.",
          "A 95% interval does not have a 95% probability of containing a fixed parameter after it is computed.",
        ]}
        note="Coverage simulations use normal samples with the stated σ. Real data with skew, clustering or dependence need a different interval."
      />
      <SyntheticNote>
        The single-interval inputs are yours. Coverage draws seeded normal samples from μ=100, σ=15; it is a simulation,
        not observed data.
      </SyntheticNote>
    </div>
  );

  if (compact) return content;

  return (
    <LabShell
      title="SD vs SE & confidence-interval rain"
      question="What exactly is 95% confident about?"
      description="Build one interval, then watch repeated intervals cover or miss a fixed parameter. The counter reports what actually happened."
      tier="P0"
    >
      {content}
    </LabShell>
  );

}
