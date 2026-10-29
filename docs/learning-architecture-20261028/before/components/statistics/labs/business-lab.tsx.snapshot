"use client";

import { useState } from "react";
import {
  formatNumber,
  formatPValue,
  formatPercent,
  twoProportionTest,
  wilsonInterval,
} from "@/lib/statistics/math";
import { DataTableView } from "@/components/statistics/chart-kit";
import { DifferenceIntervalChart, RateBarsChart } from "@/components/statistics/charts/bars";
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
  SyntheticNote,
} from "@/components/statistics/lab-kit";

const PRESETS = {
  source: { nA: 4000, cA: 320, nB: 4000, cB: 376 },
  null: { nA: 4000, cA: 320, nB: 4000, cB: 324 },
  small: { nA: 25, cA: 1, nB: 25, cB: 4 },
};

export function BusinessLab({ compact = false }: { compact?: boolean }) {
  const [nA, setNA] = useState(4000);
  const [cA, setCA] = useState(320);
  const [nB, setNB] = useState(4000);
  const [cB, setCB] = useState(376);
  const [confidence, setConfidence] = useState(0.95);
  const [mme, setMme] = useState(0.5);
  const [monthlyTraffic, setMonthlyTraffic] = useState(50000);
  const [valuePerConversion, setValuePerConversion] = useState(40);
  const [implementationCost, setImplementationCost] = useState(5000);

  const safeNA = Math.max(1, Math.round(nA));
  const safeNB = Math.max(1, Math.round(nB));
  const safeCA = Math.min(safeNA, Math.max(0, Math.round(cA)));
  const safeCB = Math.min(safeNB, Math.max(0, Math.round(cB)));
  const test = twoProportionTest({
    successesA: safeCA,
    nA: safeNA,
    successesB: safeCB,
    nB: safeNB,
    confidence,
  });
  const alpha = 1 - confidence;
  const significant = test.pValue <= alpha;
  const threshold = mme / 100;
  const practicallyRelevant = test.difference >= threshold;
  const confidentlyRelevant = test.interval.lower >= threshold;
  const armA = wilsonInterval(safeCA, safeNA, confidence);
  const armB = wilsonInterval(safeCB, safeNB, confidence);

  const incremental = test.difference * monthlyTraffic;
  const monthlyValue = incremental * valuePerConversion;
  const net = monthlyValue - implementationCost;
  const payback = monthlyValue > 0 ? implementationCost / monthlyValue : Number.NaN;

  const decision = !significant
    ? "Inconclusive at this confidence level: do not treat the observed lift as established."
    : practicallyRelevant && confidentlyRelevant
      ? "Statistically detectable and confidently above the meaningful threshold: shipping is defensible if the operational cost is acceptable."
      : practicallyRelevant
        ? "Statistically detectable, but the interval is not entirely above the meaningful threshold: the practical case is suggestive, not settled."
        : "Statistically detectable but below the pre-specified meaningful threshold: significance alone is not a reason to ship.";

  const summary = `Checkout A/B test. A conversion ${formatPercent(test.pA, 2)} (${safeCA}/${safeNA}); B ${formatPercent(test.pB, 2)} (${safeCB}/${safeNB}); absolute lift ${formatNumber(test.difference * 100, 2)} percentage points; relative lift ${formatPercent(test.relativeLift, 1)}; p=${formatPValue(test.pValue)}.`;


  function reset() {
    setNA(4000);
    setCA(320);
    setNB(4000);
    setCB(376);
    setConfidence(0.95);
    setMme(0.5);
    setMonthlyTraffic(50000);
    setValuePerConversion(40);
    setImplementationCost(5000);
  }

  const content = (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel
          title="Denominators first, then the difference"
          description="Both arms are independent proportions. The whiskers are per-arm Wilson intervals; the comparison interval below is for B−A, not for either arm alone."
          action={<ResetButton onClick={() => reset()} />}
        >
          <RateBarsChart
            arms={[
              { label: "A · control", rate: test.pA, lower: armA.lower, upper: armA.upper },
              { label: "B · treatment", rate: test.pB, lower: armB.lower, upper: armB.upper },
            ]}
            intervalLabel={`${formatPercent(confidence, 0)} Wilson intervals`}
            summary={summary}
            caption={`Counts are explicit: ${safeCA}/${safeNA} versus ${safeCB}/${safeNB}. A bar without its denominator would be unauditable.`}
            table={
              <DataTableView
                caption="Conversion counts and rates by arm, with Wilson intervals."
                title="Arm-level results"
                columns={["Arm", "Converted", "Visitors", "Rate", "Interval"]}
                rows={[
                  ["A · control", String(safeCA), String(safeNA), formatPercent(test.pA, 2), `${formatPercent(armA.lower, 2)} – ${formatPercent(armA.upper, 2)}`],
                  ["B · treatment", String(safeCB), String(safeNB), formatPercent(test.pB, 2), `${formatPercent(armB.lower, 2)} – ${formatPercent(armB.upper, 2)}`],
                ]}
                align={["start", "end", "end", "end", "end"]}
              />
            }
          />

          <div className="mt-4">
            <p className="mb-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Difference B − A with {formatPercent(confidence, 0)} interval and the pre-specified meaningful threshold
            </p>
            <DifferenceIntervalChart
              difference={test.difference}
              lower={test.interval.lower}
              upper={test.interval.upper}
              threshold={threshold}
              unit="proportion (×100 = percentage points)"
              summary={`The estimated difference is ${formatNumber(test.difference * 100, 2)} percentage points, with a ${formatPercent(confidence, 0)} interval from ${formatNumber(test.interval.lower * 100, 2)} to ${formatNumber(test.interval.upper * 100, 2)} percentage points.`}
              caption="The threshold is a decision input, not a statistical quantity. Moving it changes the recommendation, not the data."
            />
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel title="Experiment inputs">
            <div className="grid grid-cols-2 gap-2">
              <LabNumber label="A visitors" value={safeNA} min={1} max={1000000} step={1} onChange={setNA} />
              <LabNumber label="A conversions" value={safeCA} min={0} max={safeNA} step={1} onChange={setCA} />
              <LabNumber label="B visitors" value={safeNB} min={1} max={1000000} step={1} onChange={setNB} />
              <LabNumber label="B conversions" value={safeCB} min={0} max={safeNB} step={1} onChange={setCB} />
            </div>
            <div className="mt-3">
              <LabSlider
                label="Confidence level"
                value={confidence}
                min={0.8}
                max={0.99}
                step={0.01}
                onChange={setConfidence}
                display={formatPercent(confidence, 0)}
              />
            </div>
            <div className="mt-2">
              <PresetButtons
                presets={[
                  { id: "source", label: "Source-like" },
                  { id: "null", label: "Near-null" },
                  { id: "small", label: "Small sample" },
                ]}
                onSelect={(id) => {
                  const preset = PRESETS[id as keyof typeof PRESETS];
                  setNA(preset.nA);
                  setCA(preset.cA);
                  setNB(preset.nB);
                  setCB(preset.cB);
                }}
              />
            </div>
          </Panel>

          <Panel title="Business inputs">
            <div className="grid grid-cols-2 gap-2">
              <LabNumber label="MME (percentage points)" value={mme} min={0} max={20} step={0.1} onChange={setMme} hint="minimum meaningful effect" />
              <LabNumber label="Visitors per arm / month" value={monthlyTraffic} min={0} max={10000000} step={1000} onChange={setMonthlyTraffic} />
              <LabNumber label="Value per conversion ($)" value={valuePerConversion} min={0} max={100000} step={1} onChange={setValuePerConversion} />
              <LabNumber label="Implementation cost ($)" value={implementationCost} min={0} max={10000000} step={100} onChange={setImplementationCost} />
            </div>
            <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
              The business arithmetic is illustrative and uses your inputs. It is not a forecast or a claim about a
              real store.
            </p>
          </Panel>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="What the experiment says">
          <ReadoutGrid
            columns={4}
            items={[
              { label: "Rate A", value: formatPercent(test.pA, 2) },
              { label: "Rate B", value: formatPercent(test.pB, 2) },
              { label: "Absolute lift", value: `${formatNumber(test.difference * 100, 2)} pp` },
              { label: "Relative lift", value: formatPercent(test.relativeLift, 1) },
              { label: "p-value", value: formatPValue(test.pValue), tone: significant ? "danger" : "default" },
              { label: `${formatPercent(confidence, 0)} CI (pp)`, value: `${formatNumber(test.interval.lower * 100, 2)} … ${formatNumber(test.interval.upper * 100, 2)}` },
              { label: "Test z", value: formatNumber(test.z, 2) },
              { label: "Decision", value: significant ? "Reject H₀" : "Fail to reject H₀" },
            ]}
          />
          <div className="mt-3">
            <Interpretation tone={significant && practicallyRelevant && confidentlyRelevant ? "success" : significant ? "warning" : "neutral"} title="Combined decision:">
              {decision}
            </Interpretation>
          </div>
          {test.warnings.length ? (
            <ul className="mt-2 space-y-1 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3 text-[11px] leading-5 text-muted-foreground">
              {test.warnings.map((warning) => (
                <li key={warning}>• {warning}</li>
              ))}
            </ul>
          ) : null}
        </Panel>

        <Panel title="Business arithmetic" description="Incremental value is an illustration, not a guarantee.">
          <ReadoutGrid
            columns={2}
            items={[
              { label: "Incremental conversions / month", value: formatNumber(incremental, 0) },
              { label: "Monthly value", value: `$${formatNumber(monthlyValue, 0)}` },
              { label: "Implementation cost", value: `$${formatNumber(implementationCost, 0)}` },
              { label: "Net first month", value: `${net >= 0 ? "+" : "−"}$${formatNumber(Math.abs(net), 0)}`, tone: net >= 0 ? "accent" : "danger" },
              { label: "Payback (months)", value: Number.isFinite(payback) && payback > 0 ? formatNumber(payback, 1) : "—" },
              { label: "Threshold", value: `${formatNumber(mme, 2)} pp` },
            ]}
          />
          <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
            Incremental conversions = absolute lift × visitors per arm per month. The calculation assumes the observed
            lift persists and that traffic and value per conversion are stable — assumptions, not facts.
          </p>
        </Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <PredictionPrompt
          question="A lift from 8.0% to 9.4% is 1.4 percentage points. Is the relative lift larger or smaller than 1.4%?"
          options={["Larger (about 17.5%)", "Smaller (about 0.175%)", "Exactly 1.4%"]}
          correct={0}
          explanation="Relative lift is the absolute difference divided by the baseline rate: 1.4/8.0 = 0.175 = 17.5%. Always report both; “17.5% lift” and “1.4 percentage points” describe the same change in different units."
        />
        <Interpretation tone="warning" title="Statistical vs practical:">
          A p-value below α says the difference is hard to explain by sampling noise under H₀. It does not say the
          effect is large enough to matter. The meaningful threshold, the cost and the interval&apos;s position relative to
          that threshold are separate decision inputs.
        </Interpretation>
      </div>

      <Assumptions
        items={[
          "Visitors are independent and each contributes one binary conversion outcome.",
          "Assignment is randomized; otherwise the comparison is observational and confounding is possible.",
          "The two-proportion z test uses a pooled SE under H₀; the difference interval uses an unpooled SE.",
          "Adequate expected counts are needed for the normal approximation; small samples trigger a warning.",
          "No peeking-and-stopping, multiple testing or novelty effects are modelled here.",
        ]}
        note="This is the source's checkout scenario, made interactive with explicit synthetic counts. It is not a report of a real experiment or a financial forecast."
      />
      <SyntheticNote>
        Counts, traffic and money are inputs. Nothing is fetched, and no live conversion data are implied.
      </SyntheticNote>
    </div>
  );

  if (compact) return content;

  return (
    <LabShell
      title="The business decision room"
      question="Is the lift statistically detectable, and is it worth shipping?"
      description="Carry a checkout A/B test from counts to rates, lift, interval, test and a decision that distinguishes evidence from relevance."
      tier="P1"
    >
      {content}
    </LabShell>
  );

}
