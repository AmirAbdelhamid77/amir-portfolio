"use client";

import { useMemo, useState } from "react";
import {
  formatNumber,
  linearRegression,
  pearson,
  type Regression,
} from "@/lib/statistics/math";
import { DataTableView } from "@/components/statistics/chart-kit";
import { ScatterChart, type ScatterPoint } from "@/components/statistics/charts/scatter";
import {
  Assumptions,
  Interpretation,
  LabSelect,
  LabShell,
  Panel,
  PredictionPrompt,
  PresetButtons,
  ReadoutGrid,
  ResetButton,
  Segmented,
  SyntheticNote,
} from "@/components/statistics/lab-kit";

type Preset = "linear" | "negative" | "zero" | "ushape" | "outlier" | "confounder";

const BASE: Record<Exclude<Preset, "confounder">, ScatterPoint[]> = {
  linear: [
    { x: 1, y: 5.2 }, { x: 2, y: 6.9 }, { x: 3, y: 9.1 }, { x: 4, y: 10.8 },
    { x: 5, y: 13.2 }, { x: 6, y: 14.7 }, { x: 7, y: 17.1 }, { x: 8, y: 18.8 },
    { x: 9, y: 21.2 }, { x: 10, y: 22.9 },
  ],
  negative: [
    { x: 1, y: 19.1 }, { x: 2, y: 17.2 }, { x: 3, y: 14.9 }, { x: 4, y: 13.2 },
    { x: 5, y: 10.8 }, { x: 6, y: 9.3 }, { x: 7, y: 6.8 }, { x: 8, y: 5.1 },
    { x: 9, y: 2.9 }, { x: 10, y: 1.2 },
  ],
  zero: [
    { x: 1, y: 5.0 }, { x: 2, y: 8.1 }, { x: 3, y: 4.9 }, { x: 4, y: 1.2 },
    { x: 5, y: 4.8 }, { x: 6, y: 8.2 }, { x: 7, y: 5.1 }, { x: 8, y: 1.1 },
    { x: 9, y: 4.9 }, { x: 10, y: 8.0 }, { x: 11, y: 5.0 }, { x: 12, y: 1.3 },
  ],
  ushape: [
    { x: -5, y: 25 }, { x: -4, y: 16 }, { x: -3, y: 9 }, { x: -2, y: 4 },
    { x: -1, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 4 },
    { x: 3, y: 9 }, { x: 4, y: 16 }, { x: 5, y: 25 },
  ],
  outlier: [
    { x: 1, y: 5.1 }, { x: 2, y: 6.8 }, { x: 3, y: 9.2 }, { x: 4, y: 10.7 },
    { x: 5, y: 13.1 }, { x: 6, y: 14.9 }, { x: 7, y: 17.2 }, { x: 8, y: 18.8 },
    { x: 9, y: 21.1 }, { x: 10, y: 22.9 }, { x: 11, y: 2.0 },
  ],
};

const CONFOUNDER: ScatterPoint[] = [
  ...Array.from({ length: 6 }, (_, index) => ({
    x: index + 1,
    y: 9 - index,
    group: "Group A",
  })),
  ...Array.from({ length: 6 }, (_, index) => ({
    x: index + 10,
    y: 19 - index,
    group: "Group B",
  })),
];

export function CorrelationLab({ compact = false }: { compact?: boolean }) {
  const [preset, setPreset] = useState<Preset>("linear");
  const [showGroups, setShowGroups] = useState(false);
  const [showRegression, setShowRegression] = useState(true);
  const [xUnit, setXUnit] = useState("1");

  const unit = Number(xUnit);
  const points = useMemo(() => {
    const source = preset === "confounder" ? CONFOUNDER : BASE[preset];
    return source.map((point) => ({ ...point, x: point.x * unit }));
  }, [preset, unit]);
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const r = pearson(xs, ys);
  const fit: Regression = linearRegression(xs, ys);
  const withoutOutlier = preset === "outlier" ? points.slice(0, -1) : null;
  const rWithout = withoutOutlier
    ? pearson(withoutOutlier.map((point) => point.x), withoutOutlier.map((point) => point.y))
    : Number.NaN;
  const groups = preset === "confounder" && showGroups;
  const groupA = points.filter((point) => point.group === "Group A");
  const groupB = points.filter((point) => point.group === "Group B");
  const rA = groupA.length ? pearson(groupA.map((p) => p.x), groupA.map((p) => p.y)) : Number.NaN;
  const rB = groupB.length ? pearson(groupB.map((p) => p.x), groupB.map((p) => p.y)) : Number.NaN;

  const unitLabel = unit === 1 ? "metres" : unit === 100 ? "centimetres" : "millimetres";
  const summary =
    `Scatterplot of ${points.length} points. Pearson r = ${formatNumber(r, 3)}. ` +
    `The fitted slope is ${formatNumber(fit.slope, 3)} y-units per x-unit (${unitLabel}).` +
    (preset === "ushape" ? " The U-shape is strong dependence with r near zero." : "") +
    (preset === "outlier" ? ` Excluding the last point gives r = ${formatNumber(rWithout, 3)}.` : "") +
    (preset === "confounder"
      ? ` Pooled r = ${formatNumber(r, 3)}; within Group A r = ${formatNumber(rA, 3)}, within Group B r = ${formatNumber(rB, 3)}.`
      : "");


  function reset() {
    setPreset("linear");
    setShowGroups(false);
    setShowRegression(true);
    setXUnit("1");
  }

  const content = (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="Look at the shape before you trust r"
          description="The dotted line is the least-squares fit. r measures linear association only; the picture shows what the coefficient cannot."
          action={<ResetButton onClick={() => reset()} />}
        >
          <ScatterChart
            points={points}
            regression={showRegression ? fit : null}
            rLabel={`r = ${formatNumber(r, 3)}`}
            xLabel={`X (${unitLabel})`}
            yLabel="Y (outcome units)"
            summary={summary}
            groupLabels={groups ? ["Group A (lower level)", "Group B (higher level)"] : undefined}
            caption={
              preset === "ushape"
                ? "A perfect U-shape: r is approximately zero, yet Y is completely determined by X. Linear association is not the same thing as dependence."
                : preset === "outlier"
                  ? "One point can change r substantially without changing the bulk of the relationship."
                  : preset === "confounder"
                    ? "The pooled cloud slopes upward because the groups sit at different levels; within each group the slope is negative. This is the confounder warning."
                    : "r and the slope are different quantities: r is unitless, the slope carries y-units per x-unit."
            }
            legend={
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <li>dots: observations</li>
                <li>dashed: least-squares line</li>
                {groups ? <li>colour: group</li> : null}
              </ul>
            }
            table={
              <DataTableView
                caption="Every plotted observation and its group, if any."
                title="Exact points"
                columns={["X", "Y", "Group"]}
                rows={points.map((point) => [
                  formatNumber(point.x, 2),
                  formatNumber(point.y, 2),
                  point.group ?? "—",
                ])}
                align={["end", "end", "start"]}
              />
            }
          />
        </Panel>

        <div className="space-y-3">
          <Panel title="Controls">
            <div className="space-y-3">
              <PresetButtons
                label="Dataset"
                presets={[
                  { id: "linear", label: "Strong positive" },
                  { id: "negative", label: "Strong negative" },
                  { id: "zero", label: "No linear pattern" },
                  { id: "ushape", label: "U-shape" },
                  { id: "outlier", label: "Outlier" },
                  { id: "confounder", label: "Third variable" },
                ]}
                onSelect={(id) => {
                  const next = id as Preset;
                  setPreset(next);
                  setShowGroups(next === "confounder");
                  setShowRegression(next !== "ushape");
                  setXUnit("1");
                }}
              />
              <Segmented
                label="X units"
                value={xUnit}
                onChange={setXUnit}
                options={[
                  { value: "1", label: "metres" },
                  { value: "100", label: "centimetres" },
                  { value: "1000", label: "millimetres" },
                ]}
                size="sm"
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={showRegression}
                  onChange={(event) => setShowRegression(event.target.checked)}
                  className="h-4 w-4 accent-foreground"
                />
                Show least-squares line
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={showGroups}
                  disabled={preset !== "confounder"}
                  onChange={(event) => setShowGroups(event.target.checked)}
                  className="h-4 w-4 accent-foreground disabled:opacity-40"
                />
                Colour by group (third-variable preset)
              </label>
              <LabSelect
                label="Preset note"
                value={preset}
                options={[
                  { value: "linear", label: "Linear association" },
                  { value: "negative", label: "Negative direction" },
                  { value: "zero", label: "Near-zero r" },
                  { value: "ushape", label: "Strong non-linearity" },
                  { value: "outlier", label: "Influence of one point" },
                  { value: "confounder", label: "Pooled vs within-group" },
                ]}
                onChange={(value) => {
                  setPreset(value);
                  setShowGroups(value === "confounder");
                  setShowRegression(value !== "ushape");
                  setXUnit("1");
                }}
              />
            </div>
          </Panel>

          <Panel title="Read the numbers">
            <ReadoutGrid
              columns={2}
              items={[
                { label: "Pearson r", value: formatNumber(r, 3) },
                { label: "r²", value: formatNumber(fit.r2, 3), note: "share of linear variance" },
                { label: "Slope", value: formatNumber(fit.slope, 3), note: "Y per X" },
                { label: "Intercept", value: formatNumber(fit.intercept, 2) },
                { label: "n", value: String(points.length) },
                { label: "r without outlier", value: Number.isFinite(rWithout) ? formatNumber(rWithout, 3) : "—" },
                { label: "r Group A", value: groups ? formatNumber(rA, 3) : "—" },
                { label: "r Group B", value: groups ? formatNumber(rB, 3) : "—" },
              ]}
            />
          </Panel>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <PredictionPrompt
          question="If you convert X from metres to centimetres, what happens to Pearson r?"
          options={["It multiplies by 100", "It stays the same", "It divides by 100"]}
          correct={1}
          explanation="r standardizes the covariance by both standard deviations, so positive affine rescaling of X leaves it unchanged. The regression slope does change: it divides by 100 because a one-unit increase in centimetres is a smaller step."
        />
        <Interpretation
          tone={preset === "ushape" || preset === "confounder" ? "warning" : "neutral"}
          title={
            preset === "ushape"
              ? "Strong dependence, weak linearity:"
              : preset === "confounder"
                ? "Pooled and within-group disagree:"
                : preset === "outlier"
                  ? "One point moved r:"
                  : "What r does and does not say:"
          }
        >
          {preset === "ushape"
            ? "The U-shape has r ≈ 0 because positive and negative linear contributions cancel. A near-zero r is not evidence of independence — always inspect the scatterplot."
            : preset === "confounder"
              ? `The pooled r (${formatNumber(r, 2)}) is positive, but within each group the association is negative (${formatNumber(rA, 2)} and ${formatNumber(rB, 2)}). A third variable — group membership — explains the pooled pattern.`
              : preset === "outlier"
                ? `Removing the last point changes r from ${formatNumber(r, 2)} to ${formatNumber(rWithout, 2)}. Influence diagnostics belong next to any correlation claim, not in a footnote.`
                : "r is unitless and bounded in [−1, 1]. It measures linear association only; it is not the slope, not a share of variance (that is r²), and not a causal effect."}
        </Interpretation>
      </div>

      <Assumptions
        items={[
          "Both variables are numerical and the association is meaningfully linear for Pearson r.",
          "The sample is not a mixture of unexamined subgroups; colouring by group can reveal a reversal.",
          "An outlier can dominate r; report it and test sensitivity.",
          "Observational association does not identify a causal direction or eliminate confounding.",
          "Regression slope depends on the units of X and Y; r does not.",
        ]}
        note="The datasets here are fixed teaching shapes. The values of r and the slope are computed from the points, not typed into the chart."
      />
      <SyntheticNote>All six datasets are authored synthetic examples. They are not observed research data.</SyntheticNote>
    </div>
  );

  if (compact) return content;

  return (
    <LabShell
      title="Correlation detective"
      question="What is r hiding?"
      description="Switch between linear, curved, outlier-driven and confounded datasets. Reveal the group structure and compare the pooled r with the within-group r."
      tier="P0"
    >
      {content}
    </LabShell>
  );

}
