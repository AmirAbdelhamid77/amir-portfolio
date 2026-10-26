"use client";

import { useMemo, useState } from "react";
import {
  formatNumber,
  formatPValue,
  formatPercent,
  meanConfidenceInterval,
  mulberry32,
  summarize,
  zTestPValue,
} from "@/lib/statistics/math";
import {
  FLAGSHIP_DATA,
  FLAGSHIP_MU0,
  FLAGSHIP_SEED,
  FLAGSHIP_THRESHOLD,
} from "@/lib/statistics/flagship";
import { DataTableView } from "@/components/statistics/chart-kit";
import { DensityChart } from "@/components/statistics/charts/density";
import { DotStripChart } from "@/components/statistics/charts/dot-strip";
import { HistogramChart } from "@/components/statistics/charts/histogram";
import { PValueChart } from "@/components/statistics/charts/two-dist";
import {
  Assumptions,
  Interpretation,
  LabNumber,
  LabShell,
  LabSlider,
  Panel,
  PredictionPrompt,
  ReadoutGrid,
  ResetButton,
  SyntheticNote,
} from "@/components/statistics/lab-kit";

const DATA = [...FLAGSHIP_DATA];
const SEED = FLAGSHIP_SEED;
const STAGES = [
  { id: 0, label: "Question" },
  { id: 1, label: "Describe" },
  { id: 2, label: "Sample" },
  { id: 3, label: "Estimate" },
  { id: 4, label: "Test" },
  { id: 5, label: "Decide" },
] as const;

export function DotToDecision({ compact = false }: { compact?: boolean }) {
  const [stage, setStage] = useState(0);
  const [sampleSize, setSampleSize] = useState(10);
  const [confidence, setConfidence] = useState(0.95);
  const [mu0, setMu0] = useState(FLAGSHIP_MU0);
  const [threshold, setThreshold] = useState(FLAGSHIP_THRESHOLD);

  const summary = useMemo(() => summarize(DATA), []);
  const safeSample = Math.max(2, Math.min(40, Math.round(sampleSize)));
  const se = summary.sampleSd / Math.sqrt(DATA.length);
  const interval = meanConfidenceInterval({
    mean: summary.mean,
    sd: summary.sampleSd,
    n: DATA.length,
    confidence,
  });
  const effect = summary.mean - mu0;
  const z = effect / se;
  const p = zTestPValue(z, "two-sided");
  const significant = p <= 0.05;

  const sampling = useMemo(() => {
    const random = mulberry32(SEED + 41);
    const means: number[] = [];
    for (let draw = 0; draw < 400; draw += 1) {
      let total = 0;
      for (let index = 0; index < safeSample; index += 1) {
        total += DATA[Math.floor(random() * DATA.length)];
      }
      means.push(total / safeSample);
    }
    const centre = means.reduce((a, b) => a + b, 0) / means.length;
    const empiricalSe = Math.sqrt(means.reduce((a, b) => a + (b - centre) ** 2, 0) / (means.length - 1));
    return { means, empiricalSe };
  }, [safeSample]);

  const samplingSe = summary.sampleSd / Math.sqrt(safeSample);
  const samplingDomain: [number, number] = [summary.mean - 4 * samplingSe, summary.mean + 4 * samplingSe];

  function next() {
    setStage((current) => Math.min(5, current + 1));
  }
  function previous() {
    setStage((current) => Math.max(0, current - 1));
  }
  function reset() {
    setStage(0);
    setSampleSize(10);
    setConfidence(0.95);
    setMu0(FLAGSHIP_MU0);
    setThreshold(FLAGSHIP_THRESHOLD);
  }

  const content = (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-background p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            One dataset · 40 sessions · synthetic, seed {SEED}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">n = 40</p>
        </div>
        <DataRibbon values={DATA} />
        <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
          These are authored teaching values, not measured sessions. The same 40 points travel through every stage;
          each stage adds a layer rather than replacing the data.
        </p>
      </div>

      <nav aria-label="From dot to decision stages" className="flex flex-wrap gap-1.5">
        {STAGES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={stage === item.id ? "step" : undefined}
            onClick={() => setStage(item.id)}
            className={
              stage === item.id
                ? "rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background"
                : stage > item.id
                  ? "rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-800 dark:text-emerald-300"
                  : "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-border-strong hover:text-foreground"
            }
          >
            {item.id + 1}. {item.label}
          </button>
        ))}
      </nav>

      {stage === 0 ? (
        <div className="grid gap-3">
          <Panel title="The question" description="A product team asks whether a typical session is longer than 7.5 minutes.">
            <p className="text-sm leading-7 text-muted-foreground">
              The question is about a <strong className="font-medium text-foreground">population</strong> of sessions,
              but we only have 40 observed durations. Before any test, describe what was observed and what would count
              as a meaningful difference.
            </p>
            <div className="mt-3">
              <DotStripChart
                values={DATA}
                summary={summary}
                summaryText={`Forty session durations. Mean ${formatNumber(summary.mean, 2)} minutes, median ${formatNumber(summary.median, 2)}, SD ${formatNumber(summary.sampleSd, 2)}.`}
                xLabel="Session duration (minutes)"
                caption="The data are right-skewed: a few long sessions pull the mean above the median. The question is not answered by one glance at the mean."
              />
            </div>
          </Panel>
          <PredictionPrompt
            question="Will the mean be above or below the median for these right-skewed durations?"
            options={["Mean above median", "Mean below median", "Exactly equal"]}
            correct={0}
            explanation="A long right tail pulls the mean above the median. Here the mean is 8.29 and the median 7.95; the gap is a clue about shape, not a test result."
          />
        </div>
      ) : null}

      {stage === 1 ? (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
          <Panel title="Describe the observed data" description="Description stops at the 40 observations. No claim about all sessions yet.">
            <DotStripChart
              values={DATA}
              summary={summary}
              summaryText={`Session durations: mean ${formatNumber(summary.mean, 2)}, median ${formatNumber(summary.median, 2)}, SD ${formatNumber(summary.sampleSd, 2)}, IQR ${formatNumber(summary.iqr, 2)}.`}
              xLabel="Session duration (minutes)"
              caption="The box plot and dot strip use one scale. The mean is pulled toward the long sessions; the median is more resistant."
            />
          </Panel>
          <div className="space-y-3">
            <Panel title="Observed summaries">
              <ReadoutGrid
                columns={2}
                items={[
                  { label: "n", value: "40" },
                  { label: "Mean", value: formatNumber(summary.mean, 2) },
                  { label: "Median", value: formatNumber(summary.median, 2) },
                  { label: "SD", value: formatNumber(summary.sampleSd, 2) },
                  { label: "IQR", value: formatNumber(summary.iqr, 2) },
                  { label: "Max", value: formatNumber(summary.max, 2) },
                ]}
              />
            </Panel>
            <Interpretation tone="neutral" title="What we can say:">
              The 40 observed sessions average {formatNumber(summary.mean, 2)} minutes. This is a description of the
              sample. The next stage asks how much a sample mean would vary if we repeated the study.
            </Interpretation>
          </div>
        </div>
      ) : null}

      {stage === 2 ? (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Panel title="Sample: how much would the mean move?" description={`${400} bootstrap resamples of size ${safeSample}, drawn with replacement from the same 40 values.`}>
            <HistogramChart
              values={sampling.means}
              binCount={18}
              xDomain={samplingDomain}
              color="var(--chart-3)"
              meanLine={summary.mean}
              overlay={{
                pdf: (x) => (1 / (samplingSe * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - summary.mean) / samplingSe) ** 2),
                color: "var(--foreground)",
                label: "Normal(mean, SE)",
              }}
              xLabel={`Sample mean (n=${safeSample})`}
              yLabel="Count of resamples"
              summary={`Sampling distribution of the mean from 400 bootstrap resamples of size ${safeSample}. Centre ${formatNumber(summary.mean, 2)}; empirical SE ${formatNumber(sampling.empiricalSe, 3)}; benchmark s/√n ${formatNumber(samplingSe, 3)}.`}
              caption="Each bar is a resampled mean, not an individual session. The spread shrinks as the sample size grows."
            />
          </Panel>
          <div className="space-y-3">
            <Panel title="Resampling controls">
              <div className="space-y-3">
                <LabSlider label="Resample size n" value={safeSample} min={2} max={40} step={1} onChange={setSampleSize} display={String(safeSample)} />
                <ReadoutGrid
                  columns={2}
                  items={[
                    { label: "Empirical SE", value: formatNumber(sampling.empiricalSe, 3) },
                    { label: "s/√n benchmark", value: formatNumber(samplingSe, 3) },
                    { label: "Resamples", value: "400" },
                    { label: "Mean of means", value: formatNumber(summary.mean, 2) },
                  ]}
                />
              </div>
            </Panel>
            <PredictionPrompt
              question="As the resample size n grows, what happens to the spread of these sample means?"
              options={["It narrows", "It widens", "It stays the same"]}
              correct={0}
              explanation="The standard error is about s/√n, so larger samples produce a narrower distribution of sample means. The spread of individual session durations does not shrink."
            />
          </div>
        </div>
      ) : null}

      {stage === 3 ? (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Panel title="Estimate: a range, not a point" description="The interval uses the full sample (n=40). The curve is the model for the sample mean; the shaded band is the interval.">
            <DensityChart
              mu={summary.mean}
              sigma={se}
              xDomain={[summary.mean - 4 * se, summary.mean + 4 * se]}
              shades={[{ kind: "between", from: interval.lower, to: interval.upper }]}
              markers={[
                { x: interval.lower, label: `lower ${formatNumber(interval.lower, 2)}`, color: "var(--chart-5)" },
                { x: interval.upper, label: `upper ${formatNumber(interval.upper, 2)}`, color: "var(--chart-5)" },
              ]}
              xLabel="Mean session duration (minutes)"
              summary={`A ${formatPercent(confidence, 0)} confidence interval for the mean session duration runs from ${formatNumber(interval.lower, 2)} to ${formatNumber(interval.upper, 2)} minutes.`}
              caption="A 95% interval is a procedure with long-run coverage, not a 95% probability for this fixed parameter."
            />
          </Panel>
          <div className="space-y-3">
            <Panel title="Interval controls">
              <div className="space-y-3">
                <LabSlider label="Confidence level" value={confidence} min={0.8} max={0.99} step={0.01} onChange={setConfidence} display={formatPercent(confidence, 0)} />
                <ReadoutGrid
                  columns={2}
                  items={[
                    { label: "SE", value: formatNumber(interval.se, 3) },
                    { label: "Critical", value: formatNumber(interval.critical, 3) },
                    { label: "Margin", value: formatNumber(interval.margin, 3) },
                    { label: "CI", value: `${formatNumber(interval.lower, 2)}–${formatNumber(interval.upper, 2)}` },
                  ]}
                />
              </div>
            </Panel>
            <Interpretation tone="warning" title="The sentence to avoid:">
              “There is a 95% probability that the true mean is between {formatNumber(interval.lower, 2)} and{" "}
              {formatNumber(interval.upper, 2)}.” The parameter is fixed; the procedure covers it in about 95% of
              repeated samples.
            </Interpretation>
          </div>
        </div>
      ) : null}

      {stage === 4 ? (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Panel title="Test: is the observed mean unusual under H₀?" description={`H₀: μ = ${formatNumber(mu0, 2)} minutes. Two-sided test using the large-sample z approximation with s estimated from the data.`}>
            <PValueChart
              z={z}
              alternative="two-sided"
              alpha={0.05}
              p={p}
              summary={`Test of H₀: μ=${formatNumber(mu0, 2)} against a two-sided alternative. Observed mean ${formatNumber(summary.mean, 2)}, SE ${formatNumber(se, 3)}, z=${formatNumber(z, 2)}, p=${formatPValue(p)}.`}
              caption={`The null distribution is the model for the test statistic if H₀ were true. The p-value is a tail area, not the probability that H₀ is true.`}
            />
          </Panel>
          <div className="space-y-3">
            <Panel title="Test inputs">
              <div className="space-y-3">
                <LabNumber label="Null mean μ₀" value={mu0} min={0} max={20} step={0.1} onChange={setMu0} />
                <ReadoutGrid
                  columns={2}
                  items={[
                    { label: "Observed mean", value: formatNumber(summary.mean, 3) },
                    { label: "Effect", value: formatNumber(effect, 3), note: "minutes" },
                    { label: "SE", value: formatNumber(se, 3) },
                    { label: "z", value: formatNumber(z, 2) },
                    { label: "p-value", value: formatPValue(p), tone: significant ? "danger" : "default" },
                    { label: "Decision", value: significant ? "Reject H₀" : "Fail to reject H₀" },
                  ]}
                />
              </div>
            </Panel>
            <Interpretation tone={significant ? "warning" : "neutral"} title="Evidence, not proof:">
              The test says how compatible the observed mean is with the null model. It does not prove H₀ false, and
              it does not measure whether the effect is worth acting on.
            </Interpretation>
          </div>
        </div>
      ) : null}

      {stage === 5 ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={`rounded-2xl border p-4 ${significant ? "border-emerald-500/30 bg-emerald-500/[0.07]" : "border-border bg-card/30"}`}>
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Evidence</p>
              <p className="mt-2 font-mono text-lg text-foreground">{formatPValue(p)}</p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                p-value at α=0.05 → {significant ? "reject H₀" : "fail to reject H₀"}.
              </p>
            </div>
            <div className={`rounded-2xl border p-4 ${effect >= threshold ? "border-emerald-500/30 bg-emerald-500/[0.07]" : "border-amber-500/30 bg-amber-500/[0.07]"}`}>
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Effect vs threshold</p>
              <p className="mt-2 font-mono text-lg text-foreground">{formatNumber(effect, 2)} min</p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                Meaningful threshold: {formatNumber(threshold, 2)} min. {effect >= threshold ? "Point estimate clears it." : "Point estimate is below it."}
              </p>
            </div>
            <div className={`rounded-2xl border p-4 ${interval.lower - mu0 >= threshold ? "border-emerald-500/30 bg-emerald-500/[0.07]" : "border-border bg-card/30"}`}>
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Interval</p>
              <p className="mt-2 font-mono text-lg text-foreground">{formatNumber(interval.lower - mu0, 2)} … {formatNumber(interval.upper - mu0, 2)}</p>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                Effect interval (minutes above μ₀). {interval.lower - mu0 >= threshold ? "Confidently above the threshold." : "Not confidently above the threshold."}
              </p>
            </div>
          </div>

          <Panel title="The qualified decision" description="A decision is not the p-value. It combines evidence, uncertainty, effect size and a threshold.">
            <p className="text-sm leading-7 text-muted-foreground">
              {significant && effect >= threshold && interval.lower - mu0 >= threshold
                ? "The evidence is statistically detectable and the interval stays above the meaningful threshold. Shipping the change is defensible under these assumptions."
                : significant && effect < threshold
                  ? "The result is statistically detectable, but the estimated gain is smaller than the pre-specified meaningful threshold of " +
                    `${formatNumber(threshold, 2)} minutes. A statistically significant result is not automatically worth shipping. The recommendation is to not ship on this evidence alone, or to redesign for a larger effect.`
                  : significant
                    ? "The result is statistically detectable, but the interval still includes values below the meaningful threshold. The practical case is uncertain: gather more data or narrow the decision."
                    : "The data are compatible with the null at this α. That is not proof of no effect; the interval still contains effects that may matter. Consider power and a larger sample only if the decision is worth the cost."}
            </p>
            <div className="mt-3">
              <Interpretation tone={significant && effect >= threshold ? "success" : "warning"} title="Limitation:">
                This dataset is synthetic and the study is observational. No randomized intervention was run, so the
                result does not establish what would happen if the product changed. The arithmetic is correct; the
                causal claim is not available from this design.
              </Interpretation>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={reset} className="press rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background">
                Replay from the question
              </button>
              <button type="button" onClick={() => setStage(0)} className="press rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground">
                Back to the data
              </button>
            </div>
          </Panel>

          <DataTableView
            caption="The full synthetic dataset used in every stage."
            title="The same 40 observations"
            columns={["#", "Minutes"]}
            rows={DATA.map((value, index) => [String(index + 1), formatNumber(value, 1)])}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex gap-2">
          <button type="button" onClick={previous} disabled={stage === 0} className="press rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground disabled:opacity-40">
            Previous stage
          </button>
          <button type="button" onClick={next} disabled={stage === 5} className="press rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-40">
            Next stage
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">stage {stage + 1} / 6</span>
          <ResetButton onClick={reset} label="Reset story" />
        </div>
      </div>

      <details className="rounded-2xl border border-border bg-background p-3">
        <summary className="cursor-pointer text-xs font-medium text-foreground">Adjust the story (Explore)</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <LabSlider label="Resample size (stage 3)" value={safeSample} min={2} max={40} step={1} onChange={setSampleSize} display={String(safeSample)} />
          <LabSlider label="Confidence level" value={confidence} min={0.8} max={0.99} step={0.01} onChange={setConfidence} display={formatPercent(confidence, 0)} />
          <LabNumber label="Null mean μ₀" value={mu0} min={0} max={20} step={0.1} onChange={setMu0} />
          <LabNumber label="Meaningful threshold (minutes)" value={threshold} min={0} max={5} step={0.1} onChange={setThreshold} />
        </div>
      </details>

      <Assumptions
        items={[
          "The 40 values are a fixed synthetic dataset, not a probability sample from a real product.",
          "The bootstrap resamples with replacement from the observed values; it does not create new information.",
          "The interval uses a t critical value with n−1=39 degrees of freedom.",
          "The test is a two-sided z approximation with s estimated from the data; with n=40 it is a teaching approximation.",
          "The practical threshold is a decision input, not a statistical estimate.",
        ]}
        note="Tracing one dataset through several methods is the point: every stage uses the same observations, and the conclusion is qualified by the design."
      />
      <SyntheticNote>
        Synthetic sessions authored for this lesson. No real users, sessions or product analytics are represented.
      </SyntheticNote>
    </div>
  );

  if (compact) return content;

  return (
    <LabShell
      title="From dot to decision"
      question="Can one dataset carry the whole statistical story?"
      description="Follow the same 40 observations from description to resampling, uncertainty, test and a qualified decision."
      tier="Signature"
    >
      {content}
    </LabShell>
  );
}

function DataRibbon({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return (
    <div className="relative mt-2 h-10 rounded-lg border border-border bg-card/30" role="img" aria-label={`Forty session durations from ${min} to ${max} minutes.`}>
      {values.map((value, index) => {
        const left = 2 + ((value - min) / (max - min)) * 96;
        const top = 4 + (index % 5) * 6;
        return (
          <span
            key={`${value}-${index}`}
            aria-hidden="true"
            className="absolute h-1.5 w-1.5 rounded-full bg-[var(--chart-2)]"
            style={{ left: `${left}%`, top }}
          />
        );
      })}
      <span className="absolute bottom-0.5 left-2 font-mono text-[8px] text-muted-foreground">{min}</span>
      <span className="absolute bottom-0.5 right-2 font-mono text-[8px] text-muted-foreground">{max} min</span>
    </div>
  );
}
