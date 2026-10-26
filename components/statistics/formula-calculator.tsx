"use client";

import { useMemo, useState } from "react";
import {
  binomialPmf,
  formatNumber,
  meanConfidenceInterval,
  normalCdf,
  poissonPmf,
} from "@/lib/statistics/math";
import { DensityChart } from "@/components/statistics/charts/density";
import { PmfChart } from "@/components/statistics/charts/pmf";
import { LabNumber, Panel } from "@/components/statistics/lab-kit";
import { FORMULAS } from "@/lib/statistics/content";

interface CalcInput {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
}

interface CalcResult {
  result: number;
  substitution: string;
  note: string;
  extra?: string;
}

const CALCULATORS: Record<
  string,
  { inputs: CalcInput[]; compute: (values: Record<string, number>) => CalcResult }
> = {
  mean: {
    inputs: [
      { key: "sum", label: "Sum of values Σxᵢ", min: -100000, max: 100000, step: 0.1, value: 120 },
      { key: "n", label: "n (count)", min: 1, max: 100000, step: 1, value: 15 },
    ],
    compute: ({ sum, n }) => ({
      result: sum / n,
      substitution: `x̄ = ${formatNumber(sum, 2)} / ${formatNumber(n, 0)} = ${formatNumber(sum / n, 4)}`,
      note: "The mean uses every value; one extreme value can move it.",
    }),
  },
  "sample-variance": {
    inputs: [
      { key: "ss", label: "Σ(xᵢ − x̄)²", min: 0, max: 1000000, step: 0.1, value: 32 },
      { key: "n", label: "n (count)", min: 2, max: 100000, step: 1, value: 8 },
    ],
    compute: ({ ss, n }) => ({
      result: ss / (n - 1),
      substitution: `s² = ${formatNumber(ss, 2)} / (${formatNumber(n, 0)} − 1) = ${formatNumber(ss / (n - 1), 4)}`,
      note: "Sample variance divides by n−1; its units are squared. Take the square root for the SD.",
    }),
  },
  "binomial-pmf": {
    inputs: [
      { key: "n", label: "n trials", min: 1, max: 60, step: 1, value: 20 },
      { key: "k", label: "k successes", min: 0, max: 60, step: 1, value: 6 },
      { key: "p", label: "p success probability", min: 0, max: 1, step: 0.01, value: 0.3 },
    ],
    compute: ({ n, k, p }) => ({
      result: binomialPmf(n, k, p),
      substitution: `P(X=${formatNumber(k, 0)}) = C(${formatNumber(n, 0)}, ${formatNumber(k, 0)}) · ${formatNumber(p, 2)}^${formatNumber(k, 0)} · ${formatNumber(1 - p, 2)}^${formatNumber(n - k, 0)} = ${formatNumber(binomialPmf(n, k, p), 6)}`,
      note: "Requires fixed n, independent trials, constant p, and binary outcomes.",
    }),
  },
  "poisson-pmf": {
    inputs: [
      { key: "lambda", label: "λ (mean count per interval)", min: 0.01, max: 100, step: 0.01, value: 20 },
      { key: "k", label: "k events", min: 0, max: 150, step: 1, value: 13 },
    ],
    compute: ({ lambda, k }) => ({
      result: poissonPmf(lambda, k),
      substitution: `P(X=${formatNumber(k, 0)}) = e^(−${formatNumber(lambda, 2)}) · ${formatNumber(lambda, 2)}^${formatNumber(k, 0)} / ${formatNumber(k, 0)}! = ${formatNumber(poissonPmf(lambda, k), 6)}`,
      note: "λ is a mean count per stated interval; k is a non-negative integer.",
    }),
  },
  "z-score": {
    inputs: [
      { key: "x", label: "x", min: -1000, max: 1000, step: 0.1, value: 115 },
      { key: "mu", label: "μ", min: -1000, max: 1000, step: 0.1, value: 100 },
      { key: "sigma", label: "σ (> 0)", min: 0.1, max: 500, step: 0.1, value: 15 },
    ],
    compute: ({ x, mu, sigma }) => ({
      result: (x - mu) / sigma,
      substitution: `z = (${formatNumber(x, 2)} − ${formatNumber(mu, 2)}) / ${formatNumber(sigma, 2)} = ${formatNumber((x - mu) / sigma, 4)}`,
      note: "z is a signed distance in standard deviations; the area is read from the standard normal CDF.",
      extra: `P(X ≤ x) = ${formatNumber(normalCdf(x, mu, sigma), 4)}`,
    }),
  },
  "se-mean": {
    inputs: [
      { key: "sigma", label: "σ (population SD)", min: 0.1, max: 500, step: 0.1, value: 15 },
      { key: "n", label: "n", min: 1, max: 100000, step: 1, value: 25 },
    ],
    compute: ({ sigma, n }) => ({
      result: sigma / Math.sqrt(n),
      substitution: `SE = ${formatNumber(sigma, 2)} / √${formatNumber(n, 0)} = ${formatNumber(sigma / Math.sqrt(n), 4)}`,
      note: "Quadrupling n halves the standard error. This is the SE of the mean, not the SD of the values.",
    }),
  },
  ci: {
    inputs: [
      { key: "estimate", label: "Estimate (x̄)", min: -1000, max: 1000, step: 0.1, value: 80 },
      { key: "sd", label: "s (sample SD)", min: 0.1, max: 500, step: 0.1, value: 10 },
      { key: "n", label: "n", min: 2, max: 100000, step: 1, value: 25 },
      { key: "confidence", label: "Confidence (0–1)", min: 0.5, max: 0.999, step: 0.001, value: 0.95 },
    ],
    compute: ({ estimate, sd, n, confidence }) => {
      const interval = meanConfidenceInterval({ mean: estimate, sd, n, confidence });
      return {
        result: interval.margin,
        substitution: `CI = ${formatNumber(estimate, 2)} ± ${formatNumber(interval.critical, 3)} × ${formatNumber(interval.se, 3)} = [${formatNumber(interval.lower, 3)}, ${formatNumber(interval.upper, 3)}]`,
        note: `A ${formatNumber(confidence * 100, 0)}% confidence interval using a t critical value with df=${formatNumber(interval.df ?? 0, 0)}. The readout shows the margin of error.`,
      };
    },
  },
};

const ORDER = ["z-score", "se-mean", "ci", "binomial-pmf", "poisson-pmf", "mean", "sample-variance"];

export function FormulaCalculator() {
  const [selected, setSelected] = useState("z-score");
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries((CALCULATORS[selected]?.inputs ?? []).map((input) => [input.key, input.value])),
  );
  const config = CALCULATORS[selected];
  const formula = FORMULAS.find((item) => item.id === selected);
  const result = config.compute(values);

  const bars = useMemo(() => {
    if (selected === "binomial-pmf") {
      const n = Math.max(1, Math.min(60, Math.round(values.n)));
      return Array.from({ length: n + 1 }, (_, index) => ({ k: index, p: binomialPmf(n, index, values.p) }));
    }
    if (selected === "poisson-pmf") {
      const lambda = Math.max(0.01, values.lambda);
      const max = Math.min(150, Math.ceil(lambda + 5 * Math.sqrt(lambda) + 3));
      return Array.from({ length: max + 1 }, (_, index) => ({ k: index, p: poissonPmf(lambda, index) }));
    }
    return [];
  }, [selected, values]);

  function switchFormula(id: string) {
    setSelected(id);
    setValues(Object.fromEntries(CALCULATORS[id].inputs.map((input) => [input.key, input.value])));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {ORDER.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={selected === id}
            onClick={() => switchFormula(id)}
            className={
              selected === id
                ? "rounded-full border border-foreground bg-foreground px-3 py-1.5 text-[11px] font-medium text-background"
                : "rounded-full border border-border bg-background px-3 py-1.5 text-[11px] text-muted-foreground hover:border-border-strong hover:text-foreground"
            }
          >
            {CALCULATORS[id].inputs[0] ? FORMULAS.find((item) => item.id === id)?.title : id}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Panel title="Parameters">
          <div className="space-y-2.5">
            {config.inputs.map((input) => (
              <LabNumber
                key={input.key}
                label={input.label}
                value={values[input.key] ?? input.value}
                min={input.min}
                max={input.max}
                step={input.step}
                onChange={(value) => setValues((current) => ({ ...current, [input.key]: value }))}
              />
            ))}
          </div>
        </Panel>

        <Panel title="Substitution and result">
          {formula ? (
            <div className="space-y-2">
              <p className="font-mono text-[11px] leading-5 text-muted-foreground" dir="ltr">
                {formula.plain}
              </p>
              <div className="rounded-lg border border-border bg-background px-3 py-2">
                <p className="break-words font-mono text-[11px] leading-6 text-foreground" dir="ltr">
                  {result.substitution}
                </p>
              </div>
              <p className="text-xs leading-6 text-muted-foreground">{result.note}</p>
              {result.extra ? <p className="font-mono text-[11px] text-foreground" dir="ltr">{result.extra}</p> : null}
              <p className="text-[10px] leading-5 text-muted-foreground">
                Section §{formula.section} · {formula.origin === "source" ? "Source formula" : "Extension"}
              </p>
            </div>
          ) : null}

          {selected === "z-score" ? (
            <div className="mt-3">
              <DensityChart
                mu={0}
                sigma={1}
                xDomain={[-4, 4]}
                markers={[{ x: Math.max(-4, Math.min(4, result.result)), label: `z = ${formatNumber(result.result, 2)}`, color: "var(--chart-5)" }]}
                xLabel="Standard normal z"
                summary={`Standard normal curve with the computed z of ${formatNumber(result.result, 3)} marked.`}
                caption="The marker locates the z on the standard normal axis; the numeric CDF readout above is authoritative."
              />
            </div>
          ) : null}

          {bars.length ? (
            <div className="mt-3">
              <PmfChart
                bars={bars}
                highlight={(index) => index === Math.round(values.k)}
                meanLine={selected === "binomial-pmf" ? (bars.length - 1) * values.p : values.lambda}
                xLabel="k"
                summary={`Probability mass for the selected ${selected === "binomial-pmf" ? "binomial" : "Poisson"} model, with k highlighted.`}
                caption="Bars are probabilities; the highlighted bar is the exact count in the substitution."
              />
            </div>
          ) : null}
        </Panel>
      </div>
      <p className="text-[10px] leading-5 text-muted-foreground">
        This calculator is a reference aid, not a validation service. It does not check whether your design satisfies the
        formula&apos;s assumptions.
      </p>
    </div>
  );
}
