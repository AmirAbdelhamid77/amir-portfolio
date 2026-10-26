"use client";

import { useState } from "react";
import { formatNumber, normalCdf, normalQuantile, zTestPower } from "@/lib/statistics/math";
import { DataTableView } from "@/components/statistics/chart-kit";
import { NullAlternativeChart } from "@/components/statistics/charts/two-dist";
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

export function ErrorsLab({ compact = false }: { compact?: boolean }) {
  const [alpha, setAlpha] = useState(0.05);
  const [effect, setEffect] = useState(3);
  const [sigma, setSigma] = useState(10);
  const [n, setN] = useState(64);
  const [twoSided, setTwoSided] = useState(true);

  const safeSigma = Math.max(0.5, sigma);
  const safeN = Math.max(2, Math.round(n));
  const twoSidedResult = zTestPower({ effect, sigma: safeSigma, n: safeN, alpha });
  const ncp = (Math.abs(effect) / safeSigma) * Math.sqrt(safeN);
  const critical = normalQuantile(1 - (twoSided ? alpha / 2 : alpha));
  // One-sided power is Φ(ncp − z_{1−α}); the two-sided result is already
  // computed by zTestPower (both tails under the alternative).
  const oneSidedPower = normalCdf(ncp - critical);
  const power = twoSided ? twoSidedResult.power : oneSidedPower;
  const effectiveBeta = 1 - power;

  const summary = `Null and alternative sampling distributions. Effect size ${formatNumber(effect, 2)} in raw units, standardised non-centrality ${formatNumber(ncp, 2)}. At α=${formatNumber(alpha, 3)}, Type II error β=${formatNumber(effectiveBeta, 3)} and power ${formatNumber(1 - effectiveBeta, 3)}.`;


  function reset() {
    setAlpha(0.05);
    setEffect(3);
    setSigma(10);
    setN(64);
    setTwoSided(true);
  }

  const content = (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="Two models, two kinds of error"
          description="The rejection region is under H₀; β is the chance the alternative lands outside it. Power is 1−β for this specified alternative."
          action={<ResetButton onClick={() => reset()} />}
        >
          <NullAlternativeChart
            ncp={ncp}
            alpha={alpha}
            twoSided={twoSided}
            summary={summary}
            caption="α is an area under H₀. β and power are areas under the specified H₁. They are conditional on different models, so α+β is not 1."
            legend={
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <li>solid grey: H₀ sampling distribution</li>
                <li>dashed: H₁ at the chosen effect</li>
                <li>hatched: rejection region</li>
                <li>red: β under H₁</li>
                <li>green: power</li>
              </ul>
            }
            table={
              <DataTableView
                caption="Type I error, Type II error and power under the specified design."
                title="Error rates"
                columns={["Quantity", "Value"]}
                rows={[
                  ["α (Type I, under H₀)", formatNumber(alpha, 3)],
                  ["β (Type II, under H₁)", formatNumber(effectiveBeta, 3)],
                  ["Power = 1 − β", formatNumber(1 - effectiveBeta, 3)],
                  ["Standardised effect (ncp)", formatNumber(ncp, 3)],
                  ["Critical value", formatNumber(critical, 3)],
                ]}
                align={["start", "end"]}
              />
            }
          />
        </Panel>

        <div className="space-y-3">
          <Panel title="Design controls">
            <div className="space-y-3">
              <LabSlider label="Significance level α" value={alpha} min={0.001} max={0.2} step={0.001} onChange={setAlpha} display={formatNumber(alpha, 3)} />
              <LabSlider label="True effect (raw units)" value={effect} min={0} max={12} step={0.1} onChange={setEffect} display={formatNumber(effect, 2)} />
              <LabSlider label="σ (noise)" value={safeSigma} min={1} max={40} step={0.5} onChange={setSigma} display={formatNumber(safeSigma, 1)} />
              <LabSlider label="Sample size n" value={safeN} min={2} max={500} step={1} onChange={setN} display={String(safeN)} />
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={twoSided} onChange={(event) => setTwoSided(event.target.checked)} className="h-4 w-4 accent-foreground" />
                Two-sided test
              </label>
            </div>
          </Panel>

          <Panel title="Read the numbers">
            <ReadoutGrid
              columns={2}
              items={[
                { label: "α", value: formatNumber(alpha, 3) },
                { label: "β", value: formatNumber(effectiveBeta, 3) },
                { label: "Power", value: formatNumber(1 - effectiveBeta, 3), tone: "accent" },
                { label: "ncp", value: formatNumber(ncp, 3), note: "(effect/σ)√n" },
                { label: "Critical", value: formatNumber(critical, 3) },
                { label: "n", value: String(safeN) },
              ]}
            />
          </Panel>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <PredictionPrompt
          question="If you raise α from 0.01 to 0.10 while everything else is fixed, what happens to β?"
          options={["It increases", "It decreases", "It stays the same"]}
          correct={1}
          explanation="A larger α widens the rejection region, so the alternative has a better chance of falling inside it. Power rises and Type II error β falls. The cost is a higher Type I error rate under H₀."
        />
        <Interpretation tone="neutral" title="Conditional, not symmetrical:">
          α is computed under H₀; β and power are computed under one particular H₁. Power is not a property of the test alone: it depends on the true effect, the noise, the sample size and the sidedness. A study with low power can fail to detect a real effect.
        </Interpretation>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border" tabIndex={0}>
        <table className="w-full border-collapse text-xs">
          <caption className="p-3 text-start text-[11px] text-muted-foreground">
            The four reality × decision states. Only the two off-diagonal cells are errors.
          </caption>
          <thead>
            <tr className="border-b border-border bg-card/60">
              <th scope="col" className="px-3 py-2 text-start font-medium">Reality</th>
              <th scope="col" className="px-3 py-2 text-start font-medium">Decision</th>
              <th scope="col" className="px-3 py-2 text-start font-medium">Result</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["H₀ true", "Reject H₀", "Type I error (false positive), rate α"],
              ["H₀ true", "Fail to reject H₀", "Correct decision"],
              ["H₀ false", "Reject H₀", "Correct decision (power)"],
              ["H₀ false", "Fail to reject H₀", "Type II error (false negative), rate β"],
            ].map((row) => (
              <tr key={row.join("-")} className="border-b border-border last:border-0">
                {row.map((cell, index) => (
                  <td key={index} className={index === 2 && cell.includes("error") ? "px-3 py-2 text-red-700 dark:text-red-300" : "px-3 py-2 text-muted-foreground"}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Assumptions
        items={[
          "The test is a two-sided (or stated one-sided) z-test for a mean with known σ; the null distribution is standard normal.",
          "The alternative is a single specified effect, not “any effect”.",
          "Power depends on α, effect size, σ, n and sidedness; it is not a universal property of a method.",
          "A high-power study can still be biased, confounded or measuring the wrong outcome.",
        ]}
        note="This is a model-based planning demonstration, not a promise about a real study. The sample size here is the number of independent observations under the stated model."
      />
      <SyntheticNote>No data are simulated; the curves are the normal sampling distributions implied by the inputs.</SyntheticNote>
    </div>
  );

  if (compact) return content;

  return (
    <LabShell
      title="Type I, Type II & power"
      question="What does α actually trade against?"
      description="Move α, the effect, σ and n. The null and alternative distributions, the rejection region, β and power stay separately labelled."
      tier="P1"
    >
      {content}
    </LabShell>
  );

}
