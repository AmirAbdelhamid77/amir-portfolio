import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  ANSCOMBE_LABELS,
  QUARTET_SUMMARIES,
  armRate,
  compositionShares,
  countModes,
  funnelLinks,
  histogramSample,
  mixtureSample,
  pooledRate,
  quartetMaxDifference,
  quartetSummary,
  simpsonAtMix,
  standardizedRate,
  uncertaintyVerdict,
} from "../../lib/data-viz/figure-data.ts";
import { histogram } from "../../lib/data-viz/chart-math.ts";
import { FIGURES, figureForSrc } from "../../lib/data-viz/figures.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/* -------------------------------------------------------------------------- */
/* Figure registry                                                            */
/* -------------------------------------------------------------------------- */

test("the registry describes twelve unique figures with unique source paths", () => {
  assert.equal(FIGURES.length, 12);
  assert.equal(new Set(FIGURES.map((figure) => figure.id)).size, 12);
  assert.equal(new Set(FIGURES.map((figure) => figure.src)).size, 12);
  for (const figure of FIGURES) {
    assert.match(figure.src, /^\/data-viz\/figures\/[\w-]+\.svg$/);
    assert.ok(figure.objective.length > 20, `${figure.id} has an objective`);
    assert.ok(figure.dataNote.length > 20, `${figure.id} documents its data`);
    assert.match(figure.spec, /^fig-[a-z-]+$/);
    assert.equal(figureForSrc(figure.src)?.id, figure.id);
  }
});

test("every registered figure exists in the static export folder", () => {
  for (const figure of FIGURES) {
    const file = path.join(ROOT, "public", figure.src);
    assert.ok(existsSync(file), `${figure.src} should exist`);
  }
});

test("unknown source paths do not resolve to a live module", () => {
  assert.equal(figureForSrc("/data-viz/figures/missing.svg"), undefined);
});

/* -------------------------------------------------------------------------- */
/* Anscombe's quartet                                                         */
/* -------------------------------------------------------------------------- */

test("Anscombe's quartet reproduces the published summary statistics", () => {
  assert.equal(ANSCOMBE_LABELS.length, 4);
  for (const set of QUARTET_SUMMARIES) {
    assert.equal(set.points.length, 11);
    assert.ok(Math.abs(set.summary.meanX - 9) < 1e-9, `${set.label} mean x`);
    assert.ok(Math.abs(set.summary.meanY - 7.5009) < 1e-3, `${set.label} mean y`);
    assert.ok(Math.abs(set.summary.varianceX - 11) < 1e-9, `${set.label} variance x`);
    assert.ok(Math.abs(set.summary.varianceY - 4.1273) < 5e-3, `${set.label} variance y`);
    assert.ok(Math.abs(set.summary.correlation - 0.8164) < 1e-3, `${set.label} r`);
  }
});

test("the four sets differ only by rounding in their summary table", () => {
  const max = quartetMaxDifference();
  assert.ok(max.meanX < 1e-9);
  assert.ok(max.meanY < 1e-3);
  assert.ok(max.varianceY < 5e-3);
  assert.ok(max.correlation < 1e-3);
  assert.ok(max.slope < 1e-3);
});

test("a constant series produces no correlation rather than NaN", () => {
  const summary = quartetSummary([
    { x: 1, y: 2 },
    { x: 1, y: 4 },
  ]);
  assert.equal(summary.correlation, 0);
  assert.equal(summary.slope, 0);
  assert.equal(quartetSummary([]).correlation, 0);
});

/* -------------------------------------------------------------------------- */
/* Seeded samples                                                             */
/* -------------------------------------------------------------------------- */

test("histogram samples are deterministic and correctly sized", () => {
  const first = histogramSample("bimodal", 160);
  const second = histogramSample("bimodal", 160);
  assert.deepEqual(first, second);
  assert.equal(first.length, 160);
  assert.ok(first.every((value) => Number.isFinite(value)));
  assert.notDeepEqual(histogramSample("unimodal", 160), first);
});

test("the drawn bins recover one peak for unimodal and two for bimodal", () => {
  const bins = (shape) => histogram(histogramSample(shape, 160), { binCount: 10 }).counts;
  assert.equal(countModes(bins("unimodal")), 1);
  assert.ok(countModes(bins("bimodal")) >= 2);
  assert.equal(countModes([]), 0);
});

test("the mixture keeps Team B's mean at 70 while its spread grows", () => {
  for (const share of [0, 0.25, 0.5, 0.75, 1]) {
    const sample = mixtureSample(share);
    assert.ok(Math.abs(sample.meanB - 70) <= 1, `share ${share} mean ${sample.meanB}`);
    assert.equal(sample.teamB.length, 40);
    assert.equal(sample.teamA.length, 40);
  }
  const tight = mixtureSample(0);
  const split = mixtureSample(0.5);
  assert.ok(split.sdB > tight.sdB * 2);
  assert.ok(split.shareHigh > 0);
  assert.equal(mixtureSample(-1).shareHigh, 0);
  assert.equal(mixtureSample(2).shareHigh, 1);
});

/* -------------------------------------------------------------------------- */
/* Simpson and funnel arithmetic                                              */
/* -------------------------------------------------------------------------- */

const SEGMENTS = [
  {
    id: "new",
    label: "New",
    control: { converted: 20, total: 100 },
    treatment: { converted: 260, total: 1000 },
  },
  {
    id: "returning",
    label: "Returning",
    control: { converted: 800, total: 900 },
    treatment: { converted: 180, total: 200 },
  },
];

test("the Simpson dataset reverses only in the pooled comparison", () => {
  assert.ok(armRate(SEGMENTS[0].treatment) > armRate(SEGMENTS[0].control));
  assert.ok(armRate(SEGMENTS[1].treatment) > armRate(SEGMENTS[1].control));

  const control = pooledRate(SEGMENTS, "control");
  const treatment = pooledRate(SEGMENTS, "treatment");
  assert.ok(Math.abs(control.rate - 0.82) < 1e-9);
  assert.ok(treatment.rate < control.rate);

  // Standardising on the control mix restores the within-segment direction.
  assert.ok(standardizedRate(SEGMENTS, "treatment", "control") > control.rate);
});

test("the mix slider moves the pooled rate without touching segment rates", () => {
  const atZero = simpsonAtMix(SEGMENTS, 0);
  const atOne = simpsonAtMix(SEGMENTS, 1);
  assert.ok(Math.abs(atZero.pooledTreatment - 0.26) < 1e-9);
  assert.ok(Math.abs(atOne.pooledTreatment - 0.9) < 1e-9);
  assert.ok(Math.abs(atZero.standardizedTreatment - atOne.standardizedTreatment) < 1e-9);
  assert.ok(Math.abs(atZero.control - 0.82) < 1e-9);
});

test("every funnel node's outgoing links balance its stage count", () => {
  const stages = [
    { id: "applied", label: "Applied", value: 1000 },
    { id: "screen", label: "Screened", value: 600 },
    { id: "offer", label: "Offered", value: 150 },
    { id: "hired", label: "Hired", value: 90 },
  ];
  const links = funnelLinks(stages);
  for (const stage of stages.slice(0, -1)) {
    const outgoing = links
      .filter((link) => link.source === stage.id)
      .reduce((total, link) => total + link.value, 0);
    assert.equal(outgoing, stage.value, `${stage.id} balances`);
  }
  assert.equal(
    links.filter((link) => link.target.startsWith("drop-")).length,
    stages.length - 1,
  );
});

test("composition shares always sum to one hundred percent", () => {
  for (let index = 0; index < 8; index += 1) {
    const total = compositionShares(index).reduce((sum, row) => sum + row.share, 0);
    assert.ok(Math.abs(total - 100) < 1e-9, `period ${index}`);
  }
});

/* -------------------------------------------------------------------------- */
/* Uncertainty verdicts                                                       */
/* -------------------------------------------------------------------------- */

test("uncertainty verdicts distinguish decision-sized from detectable", () => {
  const wide = { id: "a", label: "A", effect: 6.2, low: -1.4, high: 13.8, note: "" };
  const narrow = { id: "b", label: "B", effect: 2.1, low: 0.6, high: 3.6, note: "" };
  const clear = { id: "c", label: "C", effect: 8, low: 6, high: 10, note: "" };
  assert.equal(uncertaintyVerdict(wide, 5), "inconclusive");
  assert.equal(uncertaintyVerdict(narrow, 5), "detectable-only");
  assert.equal(uncertaintyVerdict(clear, 5), "decision-sized");
  assert.equal(uncertaintyVerdict(clear, 0), "decision-sized");
});
