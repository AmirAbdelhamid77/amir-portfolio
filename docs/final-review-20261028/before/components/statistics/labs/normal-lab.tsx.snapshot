"use client";

import { useMemo, useState } from "react";
import {
  formatNumber,
  formatPercent,
  normalCdf,
  normalPdf,
} from "@/lib/statistics/math";
import { DataTableView } from "@/components/statistics/chart-kit";
import { DensityChart } from "@/components/statistics/charts/density";
import {
  Assumptions,
  Interpretation,
  LabShell,
  LabSlider,
  LabToggle,
  Panel,
  PredictionPrompt,
  PresetButtons,
  ReadoutGrid,
  ResetButton,
  Segmented,
  SyntheticNote,
} from "@/components/statistics/lab-kit";

type Mode = "left" | "right" | "between" | "two";

const PRESETS = {
  iq: { mu: 100, sigma: 15, x1: 115, x2: 130, mode: "between" as Mode },
  standard: { mu: 0, sigma: 1, x1: 1.96, x2: -1.96, mode: "right" as Mode },
  exam: { mu: 70, sigma: 8, x1: 60, x2: 80, mode: "between" as Mode },
};

export function NormalLab({ compact = false }: { compact?: boolean }) {
  const [mu, setMu] = useState(100);
  const [sigma, setSigma] = useState(15);
  const [mode, setMode] = useState<Mode>("between");
  const [x1, setX1] = useState(85);
  const [x2, setX2] = useState(115);
  const [empirical, setEmpirical] = useState(true);

  const safeSigma = Math.max(0.5, Math.min(80, sigma));
  const domain: [number, number] = [mu - 4 * safeSigma, mu + 4 * safeSigma];
  const clamp = (value: number) => Math.max(domain[0], Math.min(domain[1], value));
  const x = clamp(x1);
  const a = clamp(Math.min(x1, x2));
  const b = clamp(Math.max(x1, x2));
  const z1 = (x - mu) / safeSigma;
  const z2 = (clamp(x2) - mu) / safeSigma;

  const probability = useMemo(() => {
    if (mode === "left") return normalCdf(x, mu, safeSigma);
    if (mode === "right") return 1 - normalCdf(x, mu, safeSigma);
    if (mode === "two") {
      const q = Math.abs(x - mu) / safeSigma;
      return 2 * (1 - normalCdf(q));
    }
    return normalCdf(b, mu, safeSigma) - normalCdf(a, mu, safeSigma);
  }, [mode, x, a, b, mu, safeSigma]);

  const shades =
    mode === "left"
      ? [{ kind: "left" as const, to: x }]
      : mode === "right"
        ? [{ kind: "right" as const, from: x }]
        : mode === "two"
          ? [{ kind: "two" as const, from: Math.abs(x - mu) + mu }]
          : [{ kind: "between" as const, from: a, to: b }];

  const marker =
    mode === "between"
      ? [
          { x: a, label: `x₁ = ${formatNumber(a, 1)}`, color: "var(--chart-5)" },
          { x: b, label: `x₂ = ${formatNumber(b, 1)}`, color: "var(--chart-5)" },
        ]
      : [{ x, label: `x = ${formatNumber(x, 1)}`, color: "var(--chart-5)" }];

  const summary = `Normal curve with mean ${formatNumber(mu, 1)} and standard deviation ${formatNumber(safeSigma, 1)}. The shaded ${mode === "between" ? "interval" : mode === "two" ? "two-sided region" : "tail"} has probability ${formatPercent(probability, 2)}.`;
  const tableRows = [
    ["μ − 3σ", formatNumber(mu - 3 * safeSigma, 1), formatNumber(normalCdf(mu - 3 * safeSigma, mu, safeSigma), 4)],
    ["μ − 2σ", formatNumber(mu - 2 * safeSigma, 1), formatNumber(normalCdf(mu - 2 * safeSigma, mu, safeSigma), 4)],
    ["μ − 1σ", formatNumber(mu - safeSigma, 1), formatNumber(normalCdf(mu - safeSigma, mu, safeSigma), 4)],
    ["μ", formatNumber(mu, 1), "0.5"],
    ["μ + 1σ", formatNumber(mu + safeSigma, 1), formatNumber(normalCdf(mu + safeSigma, mu, safeSigma), 4)],
    ["μ + 2σ", formatNumber(mu + 2 * safeSigma, 1), formatNumber(normalCdf(mu + 2 * safeSigma, mu, safeSigma), 4)],
    ["μ + 3σ", formatNumber(mu + 3 * safeSigma, 1), formatNumber(normalCdf(mu + 3 * safeSigma, mu, safeSigma), 4)],
  ];

  function reset() {
    setMu(100);
    setSigma(15);
    setMode("between");
    setX1(85);
    setX2(115);
    setEmpirical(true);
  }

  const content = (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="Probability is area, not height"
          description="The curve is a density. The shaded region, not the height at x, is the probability."
          action={<ResetButton onClick={() => reset()} />}
        >
          <DensityChart
            mu={mu}
            sigma={safeSigma}
            xDomain={domain}
            shades={shades}
            markers={marker}
            empirical={empirical}
            xLabel="Value (same units as the data)"
            summary={summary}
            caption="The two axes carry different units: x is the measured value, y is density per unit. The area under the whole curve is 1."
            legend={
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <li>— curve: normal density</li>
                <li>shaded: selected probability</li>
                <li>- - μ: mean</li>
                {empirical ? <li>bars: 68 / 95 / 99.7% bands (approximately)</li> : null}
              </ul>
            }
            table={
              <DataTableView
                caption="Standard normal probabilities at one, two and three standard deviations from the mean."
                title="Cumulative values at μ ± σ"
                columns={["Point", "x", "P(X ≤ x)"]}
                rows={tableRows}
                align={["start", "end", "end"]}
              />
            }
          />
        </Panel>

        <div className="space-y-3">
          <Panel title="Controls">
            <div className="space-y-3">
              <LabSlider label="Mean μ" value={mu} min={-200} max={300} step={1} onChange={setMu} />
              <LabSlider
                label="Standard deviation σ"
                value={sigma}
                min={0.5}
                max={60}
                step={0.5}
                onChange={setSigma}
                display={formatNumber(safeSigma, 1)}
                hint="σ > 0 always"
              />
              <Segmented
                label="Which area?"
                value={mode}
                onChange={setMode}
                options={[
                  { value: "left", label: "Left tail" },
                  { value: "right", label: "Right tail" },
                  { value: "between", label: "Between" },
                  { value: "two", label: "Two tails" },
                ]}
                size="sm"
              />
              <LabSlider
                label={mode === "between" ? "Lower bound x₁" : "x"}
                value={x1}
                min={domain[0]}
                max={domain[1]}
                step={0.5}
                onChange={setX1}
                display={formatNumber(x1, 1)}
              />
              {mode === "between" ? (
                <LabSlider
                  label="Upper bound x₂"
                  value={x2}
                  min={domain[0]}
                  max={domain[1]}
                  step={0.5}
                  onChange={setX2}
                  display={formatNumber(x2, 1)}
                />
              ) : null}
              <LabToggle
                label="Show the empirical-rule bands"
                checked={empirical}
                onChange={setEmpirical}
                hint="68 / 95 / 99.7% are approximations for a normal shape, not universal facts."
              />
              <PresetButtons
                presets={[
                  { id: "iq", label: "IQ" },
                  { id: "standard", label: "Standard normal" },
                  { id: "exam", label: "Exam scores" },
                ]}
                onSelect={(id) => {
                  const preset = PRESETS[id as keyof typeof PRESETS];
                  setMu(preset.mu);
                  setSigma(preset.sigma);
                  setX1(preset.x1);
                  setX2(preset.x2);
                  setMode(preset.mode);
                }}
              />
            </div>
          </Panel>

          <Panel title="Read the numbers">
            <ReadoutGrid
              columns={2}
              items={[
                { label: "Area", value: formatNumber(probability, 4), note: formatPercent(probability, 2) },
                { label: "z at x₁", value: formatNumber(z1, 3) },
                { label: "z at x₂", value: mode === "between" ? formatNumber(z2, 3) : "—" },
                { label: "Density at μ", value: formatNumber(normalPdf(mu, mu, safeSigma), 5) },
                { label: "σ", value: formatNumber(safeSigma, 2) },
                { label: "Total area", value: "1.0000", note: "by definition of a PDF" },
              ]}
            />
          </Panel>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <PredictionPrompt
          question="If σ doubles while μ stays fixed, what happens to the total area under the curve?"
          options={["It halves", "It stays 1", "It doubles"]}
          correct={1}
          explanation="A density can be taller or flatter, but its total area must remain 1. Doubling σ spreads the same total probability over a wider range, so the peak is lower."
        />
        <Interpretation tone="neutral" title="What the number means:">
          {mode === "between"
            ? `About ${formatPercent(probability, 2)} of values from this normal model fall between ${formatNumber(a, 1)} and ${formatNumber(b, 1)}. The probability at one exact point (for example exactly 100.000…) is zero; only intervals have positive probability.`
            : `About ${formatPercent(probability, 2)} of values fall in the shaded ${mode === "two" ? "two-sided region" : "tail"}. The height of the curve at that x is a density, not this probability.`}
        </Interpretation>
      </div>

      <Assumptions
        items={[
          "The normal model is continuous and symmetric; real data may be skewed, bounded or multimodal.",
          "σ must be positive. A zero or negative σ makes the density undefined.",
          "68–95–99.7 is an approximation that holds for a normal distribution, not a rule for every dataset.",
          "The area is computed from Φ, the standard normal CDF, not read off the drawing.",
        ]}
        note="The chart is an illustration of the model. The numeric readout and the accessible table are the authoritative values."
      />
      <SyntheticNote>
        This is a probability model, not observed data. Parameters you set are not measurements of any population.
      </SyntheticNote>
    </div>
  );

  if (compact) return content;

  return (
    <LabShell
      title="Bell curve & z-score lab"
      question="Where does probability live under a normal curve?"
      description="Move μ and σ, place a value or an interval, and shade the area. The z readout standardizes the same x-axis."
      tier="P0"
    >
      {content}
    </LabShell>
  );
}
