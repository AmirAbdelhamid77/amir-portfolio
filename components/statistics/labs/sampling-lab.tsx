"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  formatNumber,
  mulberry32,
  normalPdf,
  populationSpec,
  simulateSampleMeans,
  type PopulationShape,
} from "@/lib/statistics/math";
import {
  CHART,
  ChartFigure,
  ChartFrame,
  COLORS,
  PLOT,
  DataTableView,
  xScale,
  yScale,
} from "@/components/statistics/chart-kit";
import { HistogramChart } from "@/components/statistics/charts/histogram";
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

const SHAPES: { value: PopulationShape; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "uniform", label: "Uniform" },
  { value: "skewed", label: "Right-skewed" },
];

function populationPdf(shape: PopulationShape) {
  if (shape === "normal") return (x: number) => normalPdf(x, 50, 15);
  if (shape === "uniform") return (x: number) => (x >= 0 && x <= 100 ? 1 / 100 : 0);
  return (x: number) => (x >= 0 ? Math.exp(-x / 15) / 15 : 0);
}

export function SamplingLab({ compact = false }: { compact?: boolean }) {
  const [shape, setShape] = useState<PopulationShape>("skewed");
  const [n, setN] = useState(30);
  const [draws, setDraws] = useState(1200);
  const [seed, setSeed] = useState(42);
  const [revealed, setRevealed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const revealedRef = useRef(revealed);
  const reduce = useReducedMotion();

  useEffect(() => {
    revealedRef.current = revealed;
  }, [revealed]);

  const safeN = Math.max(2, Math.min(100, Math.round(n)));
  const safeDraws = Math.max(20, Math.min(2000, Math.round(draws)));
  const result = useMemo(
    () => simulateSampleMeans({ shape, n: safeN, draws: safeDraws, seed }),
    [shape, safeN, safeDraws, seed],
  );
  const spec = useMemo(() => populationSpec(shape), [shape]);
  const oneSample = useMemo(() => {
    const random = mulberry32(seed + 9973);
    return Array.from({ length: safeN }, () => spec.draw(random));
  }, [safeN, seed, spec]);

  const shownMeans = result.means.slice(0, Math.max(1, Math.min(revealed, safeDraws)));
  const empiricalSe = useMemo(() => {
    if (shownMeans.length < 2) return Number.NaN;
    const centre = shownMeans.reduce((total, value) => total + value, 0) / shownMeans.length;
    const squares = shownMeans.reduce((total, value) => total + (value - centre) ** 2, 0);
    return Math.sqrt(squares / (shownMeans.length - 1));
  }, [shownMeans]);

  const xDomainPopulation: [number, number] =
    shape === "normal" ? [0, 100] : shape === "uniform" ? [0, 100] : [0, 120];
  const samplingDomain: [number, number] = [
    result.populationMean - 4 * result.theoreticalSe,
    result.populationMean + 4 * result.theoreticalSe,
  ];

  const delay = speed === "slow" ? 260 : speed === "fast" ? 45 : 110;

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      const next = Math.min(safeDraws, revealedRef.current + Math.max(1, Math.round(safeDraws / 90)));
      setRevealed(next);
      if (next >= safeDraws) setPlaying(false);
    }, delay);
    return () => window.clearInterval(id);
  }, [playing, safeDraws, delay]);

  function resetReveal() {
    setPlaying(false);
    setRevealed(1);
  }

  function play() {
    if (reduce) {
      setRevealed(safeDraws);
      setPlaying(false);
      return;
    }
    if (revealed >= safeDraws) setRevealed(1);
    setPlaying((value) => !value);
  }

  const populationSummary = `Population distribution: ${spec.label}. Individual values have standard deviation ${formatNumber(spec.sd, 2)}.`;
  const sampleSummary = `One sample of ${safeN} observations drawn from the ${shape} population. Its mean is ${formatNumber(oneSample.reduce((a, b) => a + b, 0) / safeN, 2)}.`;
  const samplingSummary = `Sampling distribution of the mean after ${shownMeans.length} repeated samples of size ${safeN}. Empirical standard error ${formatNumber(empiricalSe, 3)}; theoretical σ/√n ${formatNumber(result.theoreticalSe, 3)}.`;


  function reset() {
    setShape("skewed");
    setN(30);
    setDraws(1200);
    setSeed(42);
    setSpeed("normal");
    resetReveal();
  }

  const content = (
    <div className="space-y-3">
      <div className="grid gap-3">
        <Panel title="1 · Population distribution" description="Individual values. The axis is the measured value; the curve is the data-generating density.">
          <PopulationCurve shape={shape} xDomain={xDomainPopulation} summary={populationSummary} />
        </Panel>
        <Panel title={`2 · One sample (n=${safeN})`} description="A single draw. Its shape can be lumpy, especially when n is small; that is not the sampling distribution.">
          <HistogramChart
            values={oneSample}
            binCount={Math.max(4, Math.min(14, Math.round(Math.sqrt(safeN))))}
            xDomain={xDomainPopulation}
            color={COLORS.sample}
            meanLine={oneSample.reduce((a, b) => a + b, 0) / safeN}
            xLabel="Observed value"
            yLabel="Count in sample"
            summary={sampleSummary}
            caption={`This panel changes with the seed. One sample is not evidence about the shape of the sampling distribution.`}
          />
        </Panel>
        <Panel title={`3 · Sampling distribution (${shownMeans.length} means)`} description="Each observation here is a sample mean. The dashed curve is the theoretical normal benchmark, not a fitted claim.">
          <HistogramChart
            values={shownMeans}
            binCount={20}
            xDomain={samplingDomain}
            color={COLORS.sampling}
            meanLine={result.populationMean}
            overlay={{
              pdf: (x) => normalPdf(x, result.populationMean, result.theoreticalSe),
              color: COLORS.observed,
              label: "Normal(μ, SE)",
            }}
            xLabel="Sample mean (not an individual value)"
            yLabel="Count of means"
            summary={samplingSummary}
            caption={`The dashed normal curve uses μ=${formatNumber(result.populationMean, 1)} and SE=${formatNumber(result.theoreticalSe, 2)} from the population parameters.`}
          />
        </Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Conveyor controls" description="The sequence is seeded. Skip to the result to inspect the final histogram without waiting.">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={play}
              className="press inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-xs font-medium text-background"
            >
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setRevealed((value) => Math.min(safeDraws, value + Math.max(1, Math.round(safeDraws / 90))));
              }}
              className="press inline-flex h-9 items-center rounded-full border border-border px-3 text-xs text-muted-foreground hover:text-foreground"
            >
              Step
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setRevealed(safeDraws);
              }}
              className="press inline-flex h-9 items-center rounded-full border border-border px-3 text-xs text-muted-foreground hover:text-foreground"
            >
              Skip to result
            </button>
            <ResetButton onClick={() => reset()} />
            <div className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="tabular-nums">
                {shownMeans.length} / {safeDraws}
              </span>
              <span className="h-1.5 w-24 overflow-hidden rounded-full bg-border">
                <span
                  className="block h-full rounded-full bg-[var(--chart-3)]"
                  style={{ width: `${(shownMeans.length / safeDraws) * 100}%` }}
                />
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <span className="text-xs text-muted-foreground">Population shape</span>
              <div className="mt-1">
                <Segmented label="Population shape" value={shape} onChange={(value) => { setShape(value); resetReveal(); }} options={SHAPES} size="sm" />
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Playback speed</span>
              <div className="mt-1">
                <Segmented
                  label="Playback speed"
                  value={speed}
                  onChange={setSpeed}
                  options={[
                    { value: "slow", label: "Slow" },
                    { value: "normal", label: "Normal" },
                    { value: "fast", label: "Fast" },
                  ]}
                  size="sm"
                />
              </div>
            </div>
            <LabSlider label="Sample size n" value={safeN} min={2} max={100} step={1} onChange={(value) => { setN(value); resetReveal(); }} display={String(safeN)} />
            <LabSlider label="Repeated samples" value={safeDraws} min={100} max={2000} step={50} onChange={(value) => { setDraws(value); resetReveal(); }} display={String(safeDraws)} />
            <LabNumber label="Seed" value={seed} min={1} max={9999} step={1} onChange={(value) => { setSeed(value); resetReveal(); }} hint="deterministic replay" />
          </div>

          <PresetButtons
            presets={[
              { id: "textbook", label: "Skewed, n=30" },
              { id: "small", label: "Skewed, n=5" },
              { id: "large", label: "Skewed, n=100" },
              { id: "normal", label: "Normal baseline" },
            ]}
            onSelect={(id) => {
              resetReveal();
              if (id === "textbook") {
                setShape("skewed");
                setN(30);
              } else if (id === "small") {
                setShape("skewed");
                setN(5);
              } else if (id === "large") {
                setShape("skewed");
                setN(100);
              } else {
                setShape("normal");
                setN(30);
              }
            }}
          />
        </Panel>

        <div className="space-y-3">
          <Panel title="Read the numbers">
            <ReadoutGrid
              columns={2}
              items={[
                { label: "Population μ", value: formatNumber(result.populationMean, 2) },
                { label: "Population σ", value: formatNumber(result.populationSd, 2) },
                { label: "Theoretical SE", value: formatNumber(result.theoreticalSe, 3), note: "σ/√n" },
                { label: "Empirical SE", value: Number.isFinite(empiricalSe) ? formatNumber(empiricalSe, 3) : "—", note: "from shown means" },
                { label: "Mean of means", value: formatNumber(shownMeans.reduce((a, b) => a + b, 0) / shownMeans.length, 2) },
                { label: "Sample n", value: String(safeN) },
                { label: "Means shown", value: String(shownMeans.length) },
                { label: "Seed", value: String(seed) },
              ]}
            />
          </Panel>
          <PredictionPrompt
            question="As n grows, does the population SD shrink or does the standard error of the mean shrink?"
            options={["Population SD", "Standard error", "Both shrink"]}
            correct={1}
            explanation="The population's individual-value spread is a property of the population. The standard error describes the sample mean across repeated samples and shrinks like 1/√n."
          />
        </div>
      </div>

      <Interpretation tone={shape === "skewed" && safeN < 15 ? "warning" : "neutral"} title="What this demonstrates:">
        {shape === "skewed" && safeN < 15
          ? "With a skewed population and a small n, the sampling distribution can still be visibly skewed. The CLT is a limit result, not a guarantee that n≥30 makes every population normal. Increase n and replay."
          : "The third panel is the distribution of sample means, not a distribution of observations. Its spread is the standard error, and it is centred near the population mean under the stated sampling model."}
      </Interpretation>

      <Assumptions
        items={[
          "Samples are independent draws from the stated population generator.",
          "The population has a finite mean and standard deviation.",
          "The CLT is an approximation whose adequacy depends on the population shape and n, not a universal n≥30 threshold.",
          "The theoretical SE assumes the population σ is known; the empirical SE is computed from the simulated means.",
        ]}
        note="The simulation is a teaching device. Real sampling can be clustered, stratified or biased; those designs change the standard error and may invalidate the independent-draw model."
      />
      <SyntheticNote>
        Population values come from the normal, uniform or exponential generator printed above, with a fixed seed. They
        are not real measurements.
      </SyntheticNote>

      <DataTableView
        caption="Summary of the three distributions shown."
        title="Panel comparison"
        columns={["Panel", "Unit", "Spread shown", "Axis"]}
        rows={[
          ["Population", "Individual value", `σ = ${formatNumber(result.populationSd, 2)}`, "Observed value"],
          ["One sample", "Individual value", `s = ${formatNumber(oneSampleLengthSd(oneSample), 2)}`, "Observed value"],
          ["Sampling distribution", "Sample mean", `SE ≈ ${formatNumber(result.theoreticalSe, 2)}`, "Sample mean"],
        ]}
        align={["start", "start", "end", "start"]}
      />
    </div>
  );

  if (compact) return content;

  return (
    <LabShell
      title="The sampling factory"
      question="Why does the distribution of sample means become normal?"
      description="Send sample after sample through the conveyor and watch the third panel accumulate means while the first two stay individual values."
      tier="P0"
    >
      {content}
    </LabShell>
  );

}

function oneSampleLengthSd(values: number[]): number {
  if (values.length < 2) return Number.NaN;
  const centre = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((a, b) => a + (b - centre) ** 2, 0) / (values.length - 1));
}

function PopulationCurve({
  shape,
  xDomain,
  summary,
}: {
  shape: PopulationShape;
  xDomain: [number, number];
  summary: string;
}) {
  const pdf = populationPdf(shape);
  const yMax = Math.max(
    ...Array.from({ length: 160 }, (_, index) => pdf(xDomain[0] + ((xDomain[1] - xDomain[0]) * index) / 159)),
    0.001,
  );
  const yDomain: [number, number] = [0, yMax * 1.2];
  const path = Array.from({ length: 160 }, (_, index) => {
    const x = xDomain[0] + ((xDomain[1] - xDomain[0]) * index) / 159;
    return `${index ? "L" : "M"}${xScale(x, xDomain).toFixed(2)},${yScale(pdf(x), yDomain).toFixed(2)}`;
  }).join(" ");

  return (
    <ChartFigure summary={summary} caption="The population curve is the generator's density; its horizontal axis is an individual value.">
      <ChartFrame
        summary={summary}
        xDomain={xDomain}
        yDomain={yDomain}
        xLabel="Individual value"
        yLabel="Density"
        xFormat={(value) => formatNumber(value, 0)}
        yFormat={(value) => formatNumber(value, 3)}
      >
        <path d={path} fill={COLORS.population} fillOpacity={0.16} stroke={COLORS.population} strokeWidth={2} />
        <rect x={CHART.left} y={CHART.top + PLOT.height - 4} width={PLOT.width} height={4} fill={COLORS.population} opacity={0.2} />
      </ChartFrame>
    </ChartFigure>
  );
}
