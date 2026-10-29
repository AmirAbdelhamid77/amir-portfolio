"use client";

import { useMemo, useState } from "react";
import {
  formatNumber,
  formatPValue,
  normalQuantile,
  zTestPValue,
} from "@/lib/statistics/math";
import { DataTableView } from "@/components/statistics/chart-kit";
import { PValueChart } from "@/components/statistics/charts/two-dist";
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

type Alternative = "two-sided" | "greater" | "less";
type Mode = "z" | "input";

export function PValueLab({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<Mode>("z");
  const [z, setZ] = useState(2.4);
  const [alternative, setAlternative] = useState<Alternative>("two-sided");
  const [alpha, setAlpha] = useState(0.05);

  const [xbar, setXbar] = useState(82);
  const [mu0, setMu0] = useState(79.3);
  const [s, setS] = useState(6);
  const [n, setN] = useState(25);

  const safeS = Math.max(0.1, s);
  const safeN = Math.max(2, Math.round(n));
  const computedZ = (xbar - mu0) / (safeS / Math.sqrt(safeN));
  const observedZ = mode === "z" ? z : computedZ;
  const p = zTestPValue(observedZ, alternative);
  const reject = p <= alpha;
  const critical = normalQuantile(1 - (alternative === "two-sided" ? alpha / 2 : alpha));

  const summary = `Null distribution of the test statistic. Observed z=${formatNumber(observedZ, 2)}. ${alternative === "two-sided" ? "Two-sided" : alternative === "greater" ? "Right-tailed" : "Left-tailed"} p-value ${formatPValue(p)} at α=${formatNumber(alpha, 2)}. The decision is ${reject ? "reject H₀" : "fail to reject H₀"}.`;

  const tableRows = useMemo(
    () => [
      ["Two-sided", formatNumber(zTestPValue(observedZ, "two-sided"), 5), zTestPValue(observedZ, "two-sided") <= alpha ? "reject" : "fail to reject"],
      ["Right-tailed", formatNumber(zTestPValue(observedZ, "greater"), 5), zTestPValue(observedZ, "greater") <= alpha ? "reject" : "fail to reject"],
      ["Left-tailed", formatNumber(zTestPValue(observedZ, "less"), 5), zTestPValue(observedZ, "less") <= alpha ? "reject" : "fail to reject"],
    ],
    [observedZ, alpha],
  );


  function reset() {
    setMode("z");
    setZ(2.4);
    setAlternative("two-sided");
    setAlpha(0.05);
    setXbar(82);
    setMu0(79.3);
    setS(6);
    setN(25);
  }

  const content = (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="The tail is conditional on H₀"
          description="The curve is the null sampling distribution. The p-value is the area of results at least as extreme as the observed statistic; the hatched area is the α gate."
          action={<ResetButton onClick={() => reset()} />}
        >
          <PValueChart
            z={observedZ}
            alternative={alternative}
            alpha={alpha}
            p={p}
            summary={summary}
            caption="The p-value shading and the α hatching are different objects. The p-value is not the overlap of two distributions."
            legend={
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <li>solid: null density</li>
                <li>purple: p-value area</li>
                <li>hatched: α rejection region</li>
                <li>vertical: observed statistic</li>
              </ul>
            }
            table={
              <DataTableView
                caption="p-values for the same observed statistic under three alternative definitions."
                title="Sidedness comparison"
                columns={["Alternative", "p-value", "Decision at α"]}
                rows={tableRows}
              />
            }
          />
        </Panel>

        <div className="space-y-3">
          <Panel title="Controls">
            <div className="space-y-3">
              <Segmented
                label="Input mode"
                value={mode}
                onChange={setMode}
                options={[
                  { value: "z", label: "Test statistic z" },
                  { value: "input", label: "Sample input" },
                ]}
                size="sm"
              />
              {mode === "z" ? (
                <LabSlider label="Observed z" value={z} min={-4} max={4} step={0.01} onChange={setZ} display={formatNumber(z, 2)} />
              ) : (
                <>
                  <LabNumber label="Sample mean x̄" value={xbar} min={0} max={500} step={0.1} onChange={setXbar} />
                  <LabNumber label="Null mean μ₀" value={mu0} min={0} max={500} step={0.1} onChange={setMu0} />
                  <LabNumber label="Sample SD s" value={s} min={0.1} max={200} step={0.1} onChange={setS} />
                  <LabNumber label="Sample size n" value={n} min={2} max={10000} step={1} onChange={setN} />
                </>
              )}
              <Segmented
                label="Alternative"
                value={alternative}
                onChange={setAlternative}
                options={[
                  { value: "two-sided", label: "Two-sided" },
                  { value: "greater", label: "Hₐ: μ > μ₀" },
                  { value: "less", label: "Hₐ: μ < μ₀" },
                ]}
                size="sm"
              />
              <LabSlider label="Significance level α" value={alpha} min={0.001} max={0.2} step={0.001} onChange={setAlpha} display={formatNumber(alpha, 3)} hint="declared before the data" />
              <PresetButtons
                presets={[
                  { id: "source", label: "3.6 SE (source)" },
                  { id: "border", label: "z ≈ 1.96" },
                  { id: "small", label: "z = 0.8" },
                  { id: "left", label: "z = −2.1" },
                ]}
                onSelect={(id) => {
                  setMode("z");
                  setAlternative("two-sided");
                  if (id === "source") setZ(3.6);
                  else if (id === "border") setZ(1.96);
                  else if (id === "small") setZ(0.8);
                  else {
                    setZ(-2.1);
                    setAlternative("less");
                  }
                }}
              />
            </div>
          </Panel>

          <Panel title="Read the numbers">
            <ReadoutGrid
              columns={2}
              items={[
                { label: "Observed z", value: formatNumber(observedZ, 3) },
                { label: "p-value", value: formatPValue(p), tone: p <= alpha ? "danger" : "default" },
                { label: "α", value: formatNumber(alpha, 3) },
                { label: "Decision", value: reject ? "Reject H₀" : "Fail to reject H₀", tone: reject ? "danger" : "default" },
                { label: "Critical", value: formatNumber(critical, 3), note: alternative === "two-sided" ? "±" : alternative === "greater" ? "+" : "−" },
                { label: "p/q", value: `${formatNumber(p, 4)} / ${formatNumber(alpha, 3)}` },
              ]}
            />
          </Panel>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <PredictionPrompt
          question="For the same positive z, is the two-sided p-value larger or smaller than the right-tailed p-value?"
          options={["Larger (about twice)", "Smaller", "Always equal"]}
          correct={0}
          explanation="A two-sided p-value counts equally extreme results in both directions, so for a symmetric null distribution it is twice the one-sided tail (up to boundary rounding). The definition must be chosen before seeing the data."
        />
        <Interpretation tone={reject ? "warning" : "neutral"} title={reject ? "Reject H₀ at this α:" : "Fail to reject H₀ at this α:"}>
          {reject
            ? `A result at least this extreme has probability ${formatPValue(p)} under H₀, which is at or below the pre-declared α=${formatNumber(alpha, 3)}. This is evidence against H₀ — not proof that H₀ is false, and not a business decision by itself.`
            : `The data are compatible with H₀ at α=${formatNumber(alpha, 3)}; p=${formatPValue(p)}. That does not prove H₀ is true. Report the effect, its interval and the study's limits.`}
        </Interpretation>
      </div>

      <Assumptions
        items={[
          "The null distribution is the sampling distribution of the test statistic under H₀; here it is standard normal.",
          "The alternative and sidedness are fixed before the data are analysed.",
          "For the sample-input mode, z=(x̄−μ₀)/(s/√n) assumes independent observations and an approximately normal mean (or adequate n).",
          "α is a long-run false-positive rate under H₀, not the probability that this conclusion is wrong.",
        ]}
        note="The sample-input mode computes a z statistic from your inputs. The source's §19.1 example states p=0.037 without the sample size or SE needed to check it, so it is not presented here as a verified calculation."
      />
      <SyntheticNote>
        No real sample is loaded. In sample-input mode, the numbers are yours; the p-value is computed from the normal
        null model, not from an external data source.
      </SyntheticNote>
    </div>
  );

  if (compact) return content;

  return (
    <LabShell
      title="The p-value observatory"
      question="If H₀ were true, how unusual is this result?"
      description="Move the observed statistic, change the sidedness, and separate the p-value tail from the α gate."
      tier="P0"
    >
      {content}
    </LabShell>
  );

}
