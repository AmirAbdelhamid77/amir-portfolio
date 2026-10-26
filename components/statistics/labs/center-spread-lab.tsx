"use client";

import { useMemo, useState } from "react";
import { summarize, formatNumber, standardDeviation } from "@/lib/statistics/math";
import { DataTableView } from "@/components/statistics/chart-kit";
import { DotStripChart } from "@/components/statistics/charts/dot-strip";
import {
  Assumptions,
  Interpretation,
  LabSlider,
  LabShell,
  LabToggle,
  Panel,
  PredictionPrompt,
  PresetButtons,
  ReadoutGrid,
  ResetButton,
  Segmented,
  SyntheticNote,
} from "@/components/statistics/lab-kit";

const PRESETS = {
  symmetric: "12, 14, 14, 15, 16, 16, 17, 18, 19, 21",
  skewed: "8, 9, 10, 11, 12, 12, 13, 14, 15, 45",
  quiz: "55, 62, 68, 70, 72, 75, 78, 82, 88, 96",
} as const;

type Preset = keyof typeof PRESETS;

function parseDataset(text: string): number[] {
  return text
    .split(/[\s,;]+/)
    .map((part) => Number(part))
    .filter((value) => Number.isFinite(value));
}

export function CenterSpreadLab({ compact = false }: { compact?: boolean }) {
  const [datasetText, setDatasetText] = useState<string>(PRESETS.symmetric);
  const [addOutlier, setAddOutlier] = useState(false);
  const [outlier, setOutlier] = useState(100);
  const [sdMode, setSdMode] = useState<"sample" | "population">("sample");
  const [showBox, setShowBox] = useState(true);

  const baseValues = useMemo(() => parseDataset(datasetText), [datasetText]);
  const baseSummary = useMemo(() => summarize(baseValues), [baseValues]);
  const values = useMemo(
    () => (addOutlier ? [...baseValues, outlier] : baseValues),
    [baseValues, addOutlier, outlier],
  );
  const summary = useMemo(() => summarize(values), [values]);
  const valid = values.length >= 2 && Number.isFinite(summary.mean) && Number.isFinite(summary.median);
  const sd = sdMode === "sample" ? standardDeviation(values, { sample: true }) : standardDeviation(values, { sample: false });

  const meanShift = valid && Number.isFinite(baseSummary.mean) ? summary.mean - baseSummary.mean : 0;
  const medianShift = valid && Number.isFinite(baseSummary.median) ? summary.median - baseSummary.median : 0;

  const chartSummary = valid
    ? `Dot strip of ${values.length} values. Mean ${formatNumber(summary.mean, 2)}, median ${formatNumber(summary.median, 2)}, ${sdMode === "sample" ? "sample standard deviation s" : "population standard deviation σ"} ${formatNumber(sd, 2)}, IQR ${formatNumber(summary.iqr, 2)}.${specialOutliers(summary.outliers)}`
    : "Dataset needs at least two numbers to plot.";

  function reset() {
    setDatasetText(PRESETS.symmetric);
    setAddOutlier(false);
    setOutlier(100);
    setSdMode("sample");
    setShowBox(true);
  }

  const content = (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="The same points, three summaries"
          description="Every mark uses one shared x-axis. The dashed median line and the solid mean line are allowed to separate."
          action={<ResetButton onClick={() => reset()} />}
          >
            {valid ? (
              <DotStripChart
                values={values}
                summary={{ ...summary, sampleSd: sd }}
                showBox={showBox}
                summaryText={chartSummary}
                xLabel="Observed value"
                caption="Dot strip: each dot is one observation; the box plot summarises quartiles and 1.5×IQR fences."
                table={
                  <DataRows values={values} mean={summary.mean} />
                }
                legend={
                  <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <li>— solid: mean</li>
                    <li>- - dashed: median</li>
                    <li>◯ ring: Tukey outlier</li>
                  </ul>
                }
              />
            ) : (
              <Interpretation tone="danger" title="Not enough data.">
                Enter at least two finite numbers, separated by commas or spaces.
              </Interpretation>
            )}
          </Panel>

          <div className="space-y-3">
            <Panel title="Controls">
              <label className="block">
                <span className="text-xs text-muted-foreground">Dataset (comma or space separated)</span>
                <textarea
                  value={datasetText}
                  onChange={(event) => setDatasetText(event.target.value)}
                  rows={3}
                  spellCheck={false}
                  aria-label="Dataset values"
                  className="mt-1 w-full resize-y rounded-lg border border-border bg-background px-2.5 py-2 font-mono text-xs text-foreground outline-none focus-visible:border-border-strong"
                />
              </label>

              <div className="mt-3">
                <PresetButtons
                  presets={[
                    { id: "symmetric", label: "Symmetric" },
                    { id: "skewed", label: "Skewed" },
                    { id: "quiz", label: "Quiz scores" },
                  ]}
                  onSelect={(id) => {
                    setDatasetText(PRESETS[id as Preset]);
                    setAddOutlier(false);
                  }}
                />
              </div>

              <div className="mt-4 space-y-3">
                <LabToggle
                  label="Add one extreme value"
                  checked={addOutlier}
                  onChange={setAddOutlier}
                  hint="A single point can move the mean without moving the median much."
                />
                <LabSlider
                  label="Extreme value"
                  value={outlier}
                  min={25}
                  max={200}
                  step={1}
                  onChange={setOutlier}
                  display={String(outlier)}
                  hint="only used when the toggle is on"
                  disabled={!addOutlier}
                />
                <Segmented
                  label="Standard deviation denominator"
                  value={sdMode}
                  onChange={setSdMode}
                  options={[
                    { value: "sample", label: "s (n−1)" },
                    { value: "population", label: "σ (N)" },
                  ]}
                  size="sm"
                />
                <LabToggle label="Show box plot" checked={showBox} onChange={setShowBox} />
              </div>
            </Panel>

            <Panel title="Read the numbers">
              <ReadoutGrid
                columns={2}
                items={[
                  { label: "n", value: valid ? values.length : "—" },
                  { label: "Mean", value: valid ? formatNumber(summary.mean, 2) : "—" },
                  { label: "Median", value: valid ? formatNumber(summary.median, 2) : "—" },
                  { label: "Mode", value: valid ? (summary.modes.length ? summary.modes.join(", ") : "none") : "—" },
                  {
                    label: sdMode === "sample" ? "s (n−1)" : "σ (N)",
                    value: Number.isFinite(sd) ? formatNumber(sd, 2) : "—",
                  },
                  { label: "IQR", value: valid ? formatNumber(summary.iqr, 2) : "—" },
                  { label: "Range", value: valid ? formatNumber(summary.range, 2) : "—" },
                  {
                    label: "Outliers",
                    value: valid ? (summary.outliers.length ? summary.outliers.join(", ") : "none") : "—",
                    tone: valid && summary.outliers.length ? "danger" : "default",
                  },
                ]}
              />
            </Panel>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <PredictionPrompt
            question="Before switching the extreme value on: which will move further, the mean or the median?"
            options={["The mean", "The median", "They move equally"]}
            correct={0}
            explanation="The mean uses every value in the sum, so one extreme value pulls it. The median only depends on the middle position, so it resists the same point."
          />
          <Interpretation tone={valid && Math.abs(meanShift) > Math.abs(medianShift) ? "warning" : "neutral"} title="Observed here:">
            {valid
              ? `Adding ${formatNumber(outlier, 0)} shifts the mean by ${formatNumber(meanShift, 2)} and the median by ${formatNumber(medianShift, 2)}. The mean–median gap is ${formatNumber(summary.mean - summary.median, 2)}; a large gap is a clue that the tail is pulling the mean.`
              : "No valid dataset yet."}
          </Interpretation>
        </div>

        <Assumptions
          items={[
            "The mean is defined for numerical values on an interval or ratio scale; averaging ordinal labels is not meaningful.",
            "Sample SD divides by n−1; population SD divides by N. The toggle changes the estimand, not the data.",
            "Quartiles here use linear interpolation (R type 7). Other software may report slightly different Q₁/Q₃ on small n.",
            "The 1.5×IQR fence is a convention for flagging, not a test that a point is an error.",
          ]}
          note="This lab teaches the arithmetic of summaries. It does not choose a summary for you: that depends on the question, the shape and the cost of being misled by a tail."
        />
        <SyntheticNote>
          Presets are illustrative teaching values. If you type your own data, it stays in this browser component and
          is not sent anywhere.
        </SyntheticNote>
    </div>
  );

  if (compact) return content;

  return (
    <LabShell
      title="Mean, median & outlier explorer"
      question="Which summary is telling the truth about a typical value?"
      description="Edit the dataset, add an extreme value, and watch the mean, median, standard deviation and IQR react on the same scale."
      tier="P0"
    >
      {content}
    </LabShell>
  );
}

function specialOutliers(outliers: number[]): string {
  return outliers.length ? ` Tukey outliers: ${outliers.join(", ")}.` : " No Tukey outliers.";
}

function DataRows({ values, mean }: { values: readonly number[]; mean: number }) {
  return (
    <DataTableView
      caption="Every observation, its deviation from the mean, and its sorted position."
      title="Exact values and deviations"
      columns={["#", "Value", "Value − mean"]}
      rows={values.map((value, index) => [
        String(index + 1),
        formatNumber(value, 2),
        formatNumber(value - mean, 2),
      ])}
    />
  );
}
