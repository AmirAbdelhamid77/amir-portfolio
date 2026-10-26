// Registry for the twelve source SVG figures. Each entry names the live module
// that replaces the static copy on a lesson page. The original SVG is still
// rendered, unchanged, inside a disclosure so provenance and the author's
// drawing survive the rebuild.
//
// `dataNote` is deliberately separate from `provenance`:
// - provenance describes where the *figure* came from (the owner's export);
// - dataNote describes the numbers the live module uses (published, derived,
//   or synthetic teaching data).

export type FigureId =
  | "pipeline"
  | "encoding"
  | "dual-axis"
  | "palette"
  | "histogram"
  | "dashboard"
  | "kpi"
  | "quartet"
  | "same-mean"
  | "simpson"
  | "uncertainty"
  | "baseline";

export interface FigureMeta {
  id: FigureId;
  src: string;
  title: string;
  /** One sentence the learner should be able to say afterwards. */
  objective: string;
  /** Source lesson slugs that carry this figure. */
  lessons: string[];
  provenance: "sourced" | "derived" | "synthetic";
  dataNote: string;
  interaction: string;
  fallback: string;
  /** Anchor in docs/data-visualization/visualization-specs.md */
  spec: string;
  lab?: { href: string; label: string };
}

export const FIGURES: FigureMeta[] = [
  {
    id: "pipeline",
    src: "/data-viz/figures/os_pipeline_full.svg",
    title: "The ten-step visual pipeline",
    objective:
      "Walk a real question from decision to action and see what breaks when a step is skipped.",
    lessons: ["overview", "visual-atlas"],
    provenance: "derived",
    dataNote:
      "No dataset. Three worked scenarios are editorial examples of the source pipeline.",
    interaction: "Step through ten stages; switch scenario; inspect the skipped-stage consequence.",
    fallback: "Numbered stage list with the same artifact text for every scenario.",
    spec: "fig-pipeline",
  },
  {
    id: "encoding",
    src: "/data-viz/figures/encoding_strength.svg",
    title: "Rank the encoding channels",
    objective:
      "Order position, length, angle, area and colour by how accurately they carry a value.",
    lessons: ["overview", "chart-selection", "visual-atlas"],
    provenance: "sourced",
    dataNote:
      "The ranking is the source figure's claim, attributed to Cleveland & McGill's accuracy experiments. The exercise contains no invented measurements.",
    interaction: "Drag or use the handle's arrow keys to rank; check the ranking; reset.",
    fallback: "Static ordered list with the same rationale, always visible under the exercise.",
    spec: "fig-encoding",
  },
  {
    id: "dual-axis",
    src: "/data-viz/figures/dual_vs_panels.svg",
    title: "Dual axis vs shared-X panels",
    objective:
      "See that rescaling a second Y axis changes the visual story while the correlation stays fixed.",
    lessons: ["chart-selection", "dashboard-design", "visual-atlas"],
    provenance: "derived",
    dataNote: "DATASETS.dual-metric — synthetic ad spend and revenue, 24 months, fixed seed.",
    interaction: "Toggle dual axis/panels; stretch the right axis; read the unchanged r.",
    fallback: "Both series and r are printed in a table beside the chart.",
    spec: "fig-dual-axis",
    lab: { href: "/explore/integrity", label: "Open the integrity lab" },
  },
  {
    id: "palette",
    src: "/data-viz/figures/color_families.svg",
    title: "Match the palette family to the variable",
    objective:
      "Choose qualitative, sequential or diverging from the meaning of the variable, not from taste.",
    lessons: ["color-perception", "visual-atlas"],
    provenance: "derived",
    dataNote:
      "No dataset. Sample categories and a grayscale preview demonstrate the source rule.",
    interaction: "Switch variable semantics; preview the wrong family; toggle grayscale.",
    fallback: "The three families are listed with their intended variable type in text.",
    spec: "fig-palette",
  },
  {
    id: "histogram",
    src: "/data-viz/figures/hist_shapes.svg",
    title: "Histogram shape and bin width",
    objective:
      "Tell unimodal, bimodal and right-skewed shapes apart — and see how bin width changes the picture.",
    lessons: ["core-chart-types", "visual-atlas"],
    provenance: "synthetic",
    dataNote:
      "Three seeded samples, n = 160, generated locally by lib/data-viz/figure-data.ts.",
    interaction: "Switch shape; change bin count; read mean, median and the modality heuristic.",
    fallback: "Mean, median, SD and the full bin table are available under the chart.",
    spec: "fig-histogram",
    lab: { href: "/explore/charts/histogram", label: "Open the histogram lab" },
  },
  {
    id: "dashboard",
    src: "/data-viz/figures/dashboard_hierarchy.svg",
    title: "One scan path, five tiers",
    objective:
      "Build a dashboard outline in the order a reader actually scans it: context, KPI, explanation, detail, action.",
    lessons: ["dashboard-design", "power-bi-playbook", "visual-atlas"],
    provenance: "derived",
    dataNote: "No dataset. Three editorial dashboard scenarios demonstrate the tiers.",
    interaction: "Step through the five tiers; switch scenario; see the missing-tier warning.",
    fallback: "All five tiers and their example copy are listed in text.",
    spec: "fig-dashboard",
  },
  {
    id: "kpi",
    src: "/data-viz/figures/kpi_card_anatomy.svg",
    title: "A KPI card is a sentence",
    objective:
      "Compose value, window, target, direction and exception — and notice what a bare number hides.",
    lessons: ["dashboard-design", "power-bi-playbook", "visual-atlas"],
    provenance: "synthetic",
    dataNote:
      "Synthetic on-time delivery series for teaching; the exception hub is illustrative.",
    interaction: "Toggle each sentence part; move the latest value; watch the verdict change.",
    fallback: "The card's current sentence and the list of hidden facts are text, not colour.",
    spec: "fig-kpi",
  },
  {
    id: "quartet",
    src: "/data-viz/figures/summary_stats_trap.svg",
    title: "Anscombe's quartet",
    objective:
      "See four datasets with the same mean, variance and correlation that describe completely different processes.",
    lessons: ["foundations", "visual-atlas"],
    provenance: "sourced",
    dataNote:
      "Anscombe's quartet (F. J. Anscombe, 1973), 11 points per set. Statistics are computed, not typed.",
    interaction: "Highlight one set; inspect all four summaries; compare the maximum difference.",
    fallback: "A full point table plus the four computed summaries.",
    spec: "fig-quartet",
  },
  {
    id: "same-mean",
    src: "/data-viz/figures/mean_hides_dist.svg",
    title: "Same mean, different process",
    objective:
      "Keep the mean at 70 while a second process appears, and watch spread and tail risk move instead.",
    lessons: ["statistical-traps", "visual-atlas", "visual-integrity"],
    provenance: "synthetic",
    dataNote:
      "Two seeded 40-point samples. The mixture is constructed so the mean stays exactly 70.",
    interaction: "Change the share in the high process; toggle the mean-only view.",
    fallback: "Mean, median, SD, IQR and share above 76 are printed as numbers.",
    spec: "fig-same-mean",
    lab: { href: "/explore/integrity", label: "Open the integrity lab" },
  },
  {
    id: "simpson",
    src: "/data-viz/figures/simpson_paradox.svg",
    title: "Simpson's reversal, by mix",
    objective:
      "Change the treatment group mix and watch the pooled comparison reverse while every segment rate holds.",
    lessons: ["statistical-traps", "visual-atlas"],
    provenance: "synthetic",
    dataNote:
      "DATASETS.simpson — synthetic new/returning segments with fixed within-segment rates.",
    interaction: "Move the treatment mix; compare pooled and mix-standardized rates.",
    fallback: "Counts, pooled rates and the standardized rate are shown in a table.",
    spec: "fig-simpson",
    lab: { href: "/explore/integrity", label: "Open the integrity lab" },
  },
  {
    id: "uncertainty",
    src: "/data-viz/figures/uncertainty_bars.svg",
    title: "Detectable is not decision-sized",
    objective:
      "Compare an effect and its interval with the threshold that would actually change a decision.",
    lessons: ["statistical-traps", "visual-atlas"],
    provenance: "synthetic",
    dataNote:
      "Three synthetic estimates with stated intervals; the wide interval is labelled as implausible on purpose.",
    interaction: "Move the decision threshold; toggle intervals; read each verdict.",
    fallback: "Estimate, interval, distance to threshold and verdict are text rows.",
    spec: "fig-uncertainty",
  },
  {
    id: "baseline",
    src: "/data-viz/figures/bar_baseline.svg",
    title: "The baseline changes the story",
    objective:
      "Toggle a truncated axis and see a 1.5-point difference become a 4× visual ratio.",
    lessons: ["visual-atlas", "visual-integrity"],
    provenance: "synthetic",
    dataNote:
      "Two synthetic index values (22.5% and 21.0%) chosen so the arithmetic is exact. The truncated panel is labelled a teaching counterexample.",
    interaction: "Toggle zero/truncated baseline; read the visual ratio and the unchanged delta.",
    fallback: "Both values, the delta and the visual ratio are printed in text.",
    spec: "fig-baseline",
    lab: { href: "/explore/integrity", label: "Open the integrity lab" },
  },
];

export const FIGURE_BY_SRC: Record<string, FigureMeta> = Object.fromEntries(
  FIGURES.map((figure) => [figure.src, figure]),
);

export function figureForSrc(src: string): FigureMeta | undefined {
  return FIGURE_BY_SRC[src];
}
