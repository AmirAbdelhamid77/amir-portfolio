"use client";

import { useState } from "react";
import {
  formatNumber,
  formatPValue,
  normalQuantile,
  zTestPValue,
} from "@/lib/statistics/math";
import { DifferenceIntervalChart } from "@/components/statistics/charts/bars";
import {
  Assumptions,
  Interpretation,
  LabShell,
  LabSlider,
  Panel,
  PredictionPrompt,
  ReadoutGrid,
  ResetButton,
  SyntheticNote,
} from "@/components/statistics/lab-kit";

export function PracticalLab({ compact = false }: { compact?: boolean }) {
  const [effect, setEffect] = useState(0.4);
  const [n, setN] = useState(4000);
  const [sigma, setSigma] = useState(8);
  const [threshold, setThreshold] = useState(0.5);
  const [valuePerPoint, setValuePerPoint] = useState(12000);

  const safeN = Math.max(2, Math.round(n));
  const safeSigma = Math.max(0.1, sigma);
  const se = safeSigma / Math.sqrt(safeN);
  const z = effect / se;
  const p = zTestPValue(z, "two-sided");
  const critical = normalQuantile(0.975);
  const lower = effect - critical * se;
  const upper = effect + critical * se;
  const significant = p <= 0.05;
  const aboveThreshold = effect >= threshold;
  const confidentlyAbove = lower >= threshold;
  const monthlyValue = effect * valuePerPoint;

  const summary = `Evidence and impact for a ${formatNumber(effect, 2)} percentage-point effect with standard error ${formatNumber(se, 3)}. The 95% interval runs from ${formatNumber(lower, 3)} to ${formatNumber(upper, 3)}; p=${formatPValue(p)}; the meaningful threshold is ${formatNumber(threshold, 2)} points.`;


  function reset() {
    setEffect(0.4);
    setN(4000);
    setSigma(8);
    setThreshold(0.5);
    setValuePerPoint(12000);
  }

  const content = (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="Evidence is not impact"
          description="The interval describes uncertainty about the effect. The threshold describes what the business would need. They answer different questions."
          action={<ResetButton onClick={() => reset()} />}
        >
          <DifferenceIntervalChart
            difference={effect}
            lower={lower}
            upper={upper}
            threshold={threshold}
            unit="percentage points"
            summary={summary}
            caption="A tiny effect can have a narrow interval when n is huge — precise, statistically detectable, and still below the threshold that matters."
          />
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className={`rounded-xl border p-2.5 text-[11px] ${significant ? "border-emerald-500/30 bg-emerald-500/[0.07]" : "border-border bg-card/30"}`}>
              <p className="font-medium text-foreground">Statistically detectable?</p>
              <p className="mt-1 text-muted-foreground">{significant ? `Yes: p=${formatPValue(p)} ≤ 0.05` : `No: p=${formatPValue(p)} > 0.05`}</p>
            </div>
            <div className={`rounded-xl border p-2.5 text-[11px] ${aboveThreshold ? "border-emerald-500/30 bg-emerald-500/[0.07]" : "border-amber-500/30 bg-amber-500/[0.07]"}`}>
              <p className="font-medium text-foreground">Point estimate above threshold?</p>
              <p className="mt-1 text-muted-foreground">{aboveThreshold ? `Yes: ${formatNumber(effect, 2)} ≥ ${formatNumber(threshold, 2)}` : `No: ${formatNumber(effect, 2)} < ${formatNumber(threshold, 2)}`}</p>
            </div>
            <div className={`rounded-xl border p-2.5 text-[11px] ${confidentlyAbove ? "border-emerald-500/30 bg-emerald-500/[0.07]" : "border-border bg-card/30"}`}>
              <p className="font-medium text-foreground">Confidently above threshold?</p>
              <p className="mt-1 text-muted-foreground">{confidentlyAbove ? `Yes: lower bound ${formatNumber(lower, 2)} ≥ ${formatNumber(threshold, 2)}` : `No: lower bound ${formatNumber(lower, 2)} < ${formatNumber(threshold, 2)}`}</p>
            </div>
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel title="Controls">
            <div className="space-y-3">
              <LabSlider label="Observed effect (percentage points)" value={effect} min={-2} max={4} step={0.05} onChange={setEffect} display={formatNumber(effect, 2)} />
              <LabSlider label="Sample size n" value={safeN} min={10} max={20000} step={10} onChange={setN} display={String(safeN)} />
              <LabSlider label="σ of the outcome (pp)" value={safeSigma} min={1} max={20} step={0.5} onChange={setSigma} display={formatNumber(safeSigma, 1)} />
              <LabSlider label="Meaningful threshold (pp)" value={threshold} min={0} max={3} step={0.05} onChange={setThreshold} display={formatNumber(threshold, 2)} />
              <LabSlider label="Value per pp ($/month)" value={valuePerPoint} min={0} max={50000} step={1000} onChange={setValuePerPoint} display={`$${formatNumber(valuePerPoint, 0)}`} />
            </div>
          </Panel>

          <Panel title="Read the numbers">
            <ReadoutGrid
              columns={2}
              items={[
                { label: "SE", value: formatNumber(se, 3) },
                { label: "p-value", value: formatPValue(p), tone: significant ? "danger" : "default" },
                { label: "95% CI", value: `${formatNumber(lower, 2)} … ${formatNumber(upper, 2)}` },
                { label: "Threshold", value: formatNumber(threshold, 2) },
                { label: "Monthly value at point estimate", value: `$${formatNumber(monthlyValue, 0)}` },
                { label: "n", value: String(safeN) },
              ]}
            />
          </Panel>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <PredictionPrompt
          question="Keep the effect tiny and multiply n by 100. What can happen to significance and relevance?"
          options={["Both improve equally", "Significance can improve while relevance stays below threshold", "Relevance improves while significance falls"]}
          correct={1}
          explanation="A larger n shrinks the standard error, so even a tiny effect can become statistically detectable. The effect itself does not grow, so its distance from the meaningful threshold stays the same."
        />
        <Interpretation tone={significant && !aboveThreshold ? "warning" : "neutral"} title="The sentence a decision-maker needs:">
          {significant && !aboveThreshold
            ? "The effect is statistically detectable, but it is smaller than the threshold we said would matter. Shipping is not justified by significance alone."
            : significant && confidentlyAbove
              ? "The effect is detectable and the interval stays above the meaningful threshold. The business case is supported under these assumptions."
              : "The evidence is not yet strong enough at this confidence level. Report the interval and the threshold; consider more data only if the decision is worth the cost of waiting."}
        </Interpretation>
      </div>

      <Assumptions
        items={[
          "The effect is measured in percentage points and σ is its standard deviation in the same units.",
          "SE = σ/√n assumes independent observations; clustering or repeated measures change it.",
          "The p-value uses a two-sided z approximation with α=0.05 fixed here.",
          "The monthly value is a linear illustration: effect × value per point. It is not a forecast.",
        ]}
        note="Statistical significance and practical significance are different criteria. Choosing the threshold is a business decision, not a statistical one."
      />
      <SyntheticNote>Illustrative inputs only; no real revenue, traffic or experiment is represented.</SyntheticNote>
    </div>
  );

  if (compact) return content;

  return (
    <LabShell
      title="Impact vs evidence"
      question="How can a result be precise and still not matter?"
      description="Separate the statistical question (is the effect distinguishable from zero?) from the decision question (is it above the threshold we care about?)."
      tier="P1"
    >
      {content}
    </LabShell>
  );

}
