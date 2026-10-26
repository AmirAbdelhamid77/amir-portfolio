# Visualization specifications

Twelve source SVG figures from the owner's export, three new demonstration modules, and one
AI-shaped workspace were rebuilt as interactive teaching figures. This document is the
specification of record for each of them: what it teaches, where its numbers come from, why it is
interactive at all, what every control changes, and what a reader gets when JavaScript, motion or
vision is not available.

Method order is fixed by `docs/agent-reference/HANSA_ADAPTIVE_VISUALIZATION_AGENT_POLICY.md`:
**meaning → objective → data semantics → encoding → interaction → library.** Every decision below
follows that order. Library questions are answered last, in
[§17](#17-library-comparisons-with-the-weighted-rubric).

Nothing here is a permanent ban. Two entries in the specialty decision register were reversed on
2026-10-25 when the reason for deferring stopped being true; both reversals keep the earlier reason
so they can be audited.

---

## 1. Shared architecture

| Concern | Where it lives | Note |
|---|---|---|
| Figure metadata (source path, objective, data note, lesson slugs, spec anchor) | `lib/data-viz/figures.ts` | One record per source SVG. `figureForSrc()` is the only lookup. |
| Numbers, statistics, seeded samples | `lib/data-viz/figure-data.ts` | Pure functions, no React, no DOM. Imported directly by the tests. |
| Shared visual grammar | `components/data-viz/figures/kit.tsx` | `Plot`, `Controls`, `ResetButton`, `LiveReadout`, `VerdictPill`, `ValueGrid`. |
| Chunk dispatch | `components/data-viz/live-figure.tsx` | One `next/dynamic` import per figure. Server-rendered, never `ssr: false`. |
| Injection into lessons | `components/data-viz/source-blocks.tsx` | A figure block renders `LiveFigure` when its `src` matches the registry; otherwise the original `<img>`. |
| Original artwork | `public/data-viz/figures/*.svg` | Untouched. Rendered inside a `<details>` under the live module. |

Three properties follow from that split and are worth stating because they are load-bearing:

1. **Provenance cannot be lost by accident.** The original SVG is not deleted or edited; the live
   module is added above it. `tests/data-viz/figures.test.mjs` asserts all twelve files still exist
   and that every registry `src` resolves.
2. **A lesson only downloads the modules it shows.** `dynamic()` gives each figure its own chunk;
   `/learn/foundations` does not pull the doughnut or the Sankey.
3. **Prerender stays safe.** No figure touches `window`, `matchMedia` or layout measurement during
   module evaluation. State initialises from constants, so server and first client render agree.

**Reduced motion** is handled per module: either the figure reads `useReducedMotion()` and skips its
transition, or it uses no transition at all (a discrete state swap). Static export keeps the
readable markup, so a reader with JavaScript disabled sees the default state of every figure plus
its table.

**Theme** comes from CSS custom properties (`--chart-1`…`--chart-5`, `--border`, `--foreground`), so
every figure follows light/dark without a second palette. No figure hardcodes a hex value.

**RTL** — the Arabic lessons (`/learn/ar/*`) keep the figure geometry in LTR reading order, because
a number line, a time axis and a scatter's x-axis are conventions, not prose direction. What does
flip is chrome: labels use `text-start`, the wrapper uses logical padding, and no figure relies on
`left`/`right` for meaning. Charts are embedded as `dir="ltr"` islands inside RTL prose.

---

## 2. `fig-pipeline` — the ten-step visual pipeline

- **Source ID** — `os_pipeline_full.svg`; lessons `overview`, `visual-atlas`.
- **Objective** — walk one real question from decision to action and see what breaks when a step is
  skipped.
- **Provenance** — *derived*. The ten stages are the source figure's; the three worked scenarios are
  editorial examples written for this site.
- **Data semantics** — no dataset. Each scenario is an ordered list of artefacts; the stage index is
  the only quantity.
- **Encoding** — position along an ordered list. No magnitude is encoded, so no scale is needed.
- **Why interactive** — the source is a labelled strip. Interaction is justified only because the
  reader can move the stage pointer and read the artefact for that stage instead of parsing ten
  captions at once.
- **Controls → derived** — `Worked scenario` (3 options) swaps the artefact set. `Pipeline stage`
  (1–10) selects the current artefact. "Show what skipping costs" reveals the consequence of
  dropping the *previous* stage for the current scenario.
- **Fallback** — the ten-stage ordered list stays printed below the figure with the same artefact
  text for the selected scenario; the skip consequence is a sentence, not a colour.
- **Motion** — a stage change cross-fades the readout only; reduced motion makes it an instant swap.
- **Reset / error** — `Reset` returns to scenario 1, stage 1, skip hidden. No error state is
  reachable: every control value maps to a defined record.
- **Validation** — `tests/data-viz/figures.test.mjs` checks registry integrity; the stage/scenario
  text is content-validated by `scripts/validate-data-viz.mjs` as part of the source pages.
- **Alternatives** — (a) keep the static SVG: simplest, but ten captions at once; (b) a
  scrolling stepper in prose: no diagram, loses the "pipeline" gestalt. Live module chosen; the
  static original remains one disclosure away.

---

## 3. `fig-encoding` — rank the encoding channels

- **Source ID** — `encoding_strength.svg`; lessons `overview`, `chart-selection`, `visual-atlas`.
- **Objective** — order position, length, angle, area and colour by how accurately they carry a
  value.
- **Provenance** — *sourced*. The ranking is the source figure's claim, attributed to
  Cleveland & McGill's accuracy experiments. No measurements are invented; the exercise contains no
  numbers at all.
- **Data semantics** — a rank order over five named channels. Ordinal, not interval.
- **Encoding** — an ordered list with drag handles and an "expected rank" column.
- **Why interactive** — the misconception is that angle and area are as readable as position. A
  reader who *commits* to an order and then sees the expected order has to reconcile the two; a
  printed list lets them nod and move on.
- **Controls → derived** — drag (pointer) or press the handle's arrow keys (keyboard) to reorder.
  "Check my ranking" compares the current order with the source order and marks each row
  correct/incorrect. `Reset` restores the source order.
- **Fallback** — the static ordered list with rationale is always visible under the exercise, so the
  answer is never gated behind the interaction.
- **Motion** — the reorder animation is the library's layout spring (motion `Reorder`); with reduced
  motion it resolves instantly.
- **Reset / error** — reset returns the unranked state. A tie or a partial order is not possible:
  the list is a permutation.
- **Validation** — `scripts/validate-data-viz.mjs` checks the figure file and hash; the ranking text
  is reproduced in `docs/data-visualization/content-provenance.md`.
- **Alternatives** — (a) static list: honest, no commitment; (b) five mini bar charts showing the
  same five values in the "wrong" encoding: teaches the same point with fabricated measurements,
  which would imply data that does not exist. The sortable list won.

---

## 4. `fig-dual-axis` — dual axis vs shared-X panels

- **Source ID** — `dual_vs_panels.svg`; lessons `chart-selection`, `dashboard-design`,
  `visual-atlas`.
- **Objective** — see that rescaling a second Y axis changes the visual story while the correlation
  stays fixed.
- **Provenance** — *derived* from `DATASETS.dual-metric` (synthetic ad spend and revenue, 24
  months, fixed seed).
- **Data semantics** — two continuous series on a shared time index. Units differ (currency vs
  currency spend), so a single axis is defensible; the lesson is about *arbitrary* rescaling, not
  about unit mismatch.
- **Encoding** — mode A: two lines on two independent Y axes. Mode B: two stacked panels sharing one
  time axis.
- **Why interactive** — the failure is a *parameter*, not a picture. Stretching the right axis from
  0.00 to 0.60 padding moves the second line from "flat" to "diverging" while `r` is unchanged. Only
  a control can show that the story was a slider position.
- **Controls → derived** — `Chart layout` (Dual axis / Shared-X panels). `Right-axis padding`
  (0–0.6, step 0.05, dual mode only) changes the plotted amplitude of the right series and the
  crossing point; the printed Pearson `r` and the regression summary do **not** change.
- **Fallback** — both series and `r` are printed in a 24-row table; the readout states the visual
  crossing point and the unchanged correlation in words.
- **Motion** — axis stretch is a `motion` spring on path data; reduced motion commits the new path
  without animating the stretch.
- **Reset / error** — reset returns to dual axis with 0.1 padding. The control clamps to its range,
  so an invalid padding cannot be entered.
- **Validation** — `r` is computed from the dataset in `figure-data.ts`; `tests/data-viz` asserts the
  correlation is unchanged across padding values (the stat does not read the layout).
- **Alternatives** — (a) static side-by-side panels: the point about rescaling is invisible; (b) a
  hand-built single chart with a note: no second axis to stretch. The toggle+slider pair is the
  minimum that demonstrates the failure.

---

## 5. `fig-palette` — match the palette family to the variable

- **Source ID** — `color_families.svg`; lessons `color-perception`, `visual-atlas`.
- **Objective** — choose qualitative, sequential or diverging from the *meaning* of the variable,
  not from taste.
- **Provenance** — *derived*. Sample categories and a grayscale preview demonstrate the source rule.
- **Data semantics** — no numeric dataset; three variable *types* (unordered categories, ordered
  magnitude, signed deviation around a midpoint).
- **Encoding** — three swatch families, each labelled with the variable type it serves.
- **Why interactive** — the misconception is aesthetic ("this palette looks better"). Switching the
  variable semantics and seeing the *same* palette become wrong is a semantic lesson, not a visual
  one; grayscale makes the red/green failure visible without relying on colour vision.
- **Controls → derived** — `Variable semantics` (qualitative / sequential / diverging) selects the
  matching family and marks the other two as mismatched. "Preview the wrong family" applies the
  mismatch on purpose. Grayscale toggle removes hue, leaving lightness only.
- **Fallback** — all three families are listed with their intended variable type and the reason in
  text; the mismatch warning is a sentence.
- **Motion** — swatch changes are CSS transitions; reduced motion removes them.
- **Reset / error** — reset returns to qualitative + colour + correct family.
- **Validation** — the palette tokens are the site's OKabe–Ito-based chart tokens; the grayscale
  preview is a CSS filter, not a second palette, so no second source of truth exists.
- **Alternatives** — (a) static three-row table: no "wrong" state to feel; (b) a contrast checker:
  answers a different question (legibility, not semantics). The semantic toggle won.

---

## 6. `fig-histogram` — histogram shape and bin width

- **Source ID** — `hist_shapes.svg`; lessons `core-chart-types`, `visual-atlas`; links to
  `/explore/charts/histogram`.
- **Objective** — tell unimodal, bimodal and right-skewed shapes apart, and see how bin width
  changes the picture.
- **Provenance** — *synthetic*. Three seeded samples, n = 160, generated by
  `figure-data.ts` (`mulberry32`-style deterministic PRNG).
- **Data semantics** — one continuous variable, 160 observations, three generating processes.
- **Encoding** — bar height = count, shared bin index; mean and median rules overlaid.
- **Why interactive** — bin width is the canonical "the picture is a choice" lesson, and modality is
  the canonical "the summary is not the shape" lesson. Both need the reader to move a control and
  watch the *classification* change.
- **Controls → derived** — `Distribution shape` (unimodal / bimodal / right-skewed) swaps the
  seeded sample. `Bins` (4–16, step 1) re-bins the same 160 values. Derived readouts: mean, median,
  SD, and the modality count.
- **Modality heuristic** — `countModes()` smooths the drawn counts with a 3-bin moving average and
  counts local maxima at or above 50% of the tallest smoothed bin. Raw counts on a seeded sample
  produce one-count wobbles that would otherwise be reported as "peaks"; the smoothing keeps a real
  second process and drops sampling noise. The heuristic is a heuristic and is labelled as such.
- **Fallback** — mean, median, SD and the full bin table (range, count, share, cumulative) are
  available under the chart; the modality sentence states the count in words.
- **Motion** — bar heights animate with a layout spring when bins change; reduced motion swaps
  immediately. The *classification* text updates with the bars in the same commit.
- **Reset / error** — reset returns to unimodal + 10 bins. A bin count outside 4–16 is unreachable
  through the slider; the function clamps non-finite input.
- **Validation** — `tests/data-viz/figures.test.mjs` asserts determinism (same sample twice), size,
  one recovered peak for unimodal and ≥2 for bimodal, and `countModes([]) === 0`. The histogram
  itself is checked by `tests/data-viz/chart-math.test.mjs` (every observation counted once).
- **Alternatives** — (a) BeUI has no histogram family; (b) a KDE/smooth curve would hide the bin
  decision that is the lesson; (c) box-only: the existing box lab covers summary, not shape. Native
  SVG won.

---

## 7. `fig-dashboard` — one scan path, five tiers

- **Source ID** — `dashboard_hierarchy.svg`; lessons `dashboard-design`, `power-bi-playbook`,
  `visual-atlas`.
- **Objective** — build a dashboard outline in the order a reader actually scans it: context, KPI,
  explanation, detail, action.
- **Provenance** — *derived*. Three editorial dashboard scenarios; no dataset.
- **Data semantics** — an ordered five-tier outline per scenario; no quantities.
- **Encoding** — vertical stack with the current tier expanded; a missing-tier warning.
- **Why interactive** — the misconception is that a dashboard is a grid of charts. Stepping the
  tiers makes the *outline* the object; the warning when a tier is missing is the teaching moment.
- **Controls → derived** — `Dashboard scenario` (3 options) swaps the outline text. `Dashboard tier`
  (1–5) expands that tier; the remaining tiers stay listed as headings. The warning names the first
  missing tier for the selected scenario.
- **Fallback** — all five tiers and their example copy are printed as text.
- **Motion** — the expanded panel uses a height transition; reduced motion expands instantly.
- **Reset / error** — reset returns to scenario 1, tier 2 (the KPI line).
- **Validation** — the copy is editorial and labelled as such in
  `docs/data-visualization/content-provenance.md`; no numeric claim is made.
- **Alternatives** — (a) static annotated wireframe: the tier order is visible but the "missing tier"
  failure is not; (b) a real dashboard mock with charts: would require inventing a business and
  duplicates `/explore/dashboards`. The outline stepper won.

---

## 8. `fig-kpi` — a KPI card is a sentence

- **Source ID** — `kpi_card_anatomy.svg`; lessons `dashboard-design`, `power-bi-playbook`,
  `visual-atlas`.
- **Objective** — compose value, window, target, direction and exception; notice what a bare number
  hides.
- **Provenance** — *synthetic*. On-time delivery series for teaching; the exception hub is
  illustrative.
- **Data semantics** — one percentage series over eight periods, plus a target and a comparison
  window.
- **Encoding** — a rendered KPI card with its sentence parts; a small sparkline; a verdict pill.
- **Why interactive** — a KPI is a *sentence with omissions*. Removing parts one at a time is the
  only way to show that "94.2%" alone is not a claim about anything.
- **Controls → derived** — `KPI card parts` toggles window / target / direction / exception.
  `Latest value` (91–99, step 0.1) moves the terminal value. Derived: delta vs previous period,
  distance to target, and a verdict (on target / at risk / missed) that depends on which parts are
  visible — deliberately, because a card without a target cannot be "on target".
- **Fallback** — the current sentence and the list of hidden facts are text, not colour. The verdict
  is a word.
- **Motion** — the value rolls via `AnimatedNumber`; reduced motion prints the target value without
  the roll.
- **Reset / error** — reset restores all parts and the source value. Removing every part leaves a
  labelled empty state, not a crash.
- **Validation** — the verdict thresholds are printed in the readout, so the reader can recompute the
  classification by hand; `figure-data.ts` owns the arithmetic.
- **Alternatives** — (a) a static anatomy diagram: shows the parts, not the consequence of dropping
  them; (b) a live chart-only header: no sentence to compose. The toggle set won.

---

## 9. `fig-quartet` — Anscombe's quartet

- **Source ID** — `summary_stats_trap.svg`; lessons `foundations`, `visual-atlas`.
- **Objective** — see four datasets with the same mean, variance and correlation that describe
  completely different processes.
- **Provenance** — *sourced*. Anscombe's quartet (F. J. Anscombe, 1973), 11 points per set. The
  summary statistics are **computed**, not typed.
- **Data semantics** — four bivariate samples, 11 points each, x and y continuous.
- **Encoding** — four small multiples with the selected set emphasised, plus a shared summary table.
- **Why interactive** — selecting a set is the comparison. The table is static because the point is
  that *it does not change*.
- **Controls → derived** — `Highlight dataset` (Cloud / Ring / X shape / Two clusters) changes which
  panel is emphasised and which row is highlighted. The summary numbers never change; the
  readout prints the maximum difference across the four sets as the proof.
- **Fallback** — a full point table plus the four computed summaries.
- **Motion** — emphasis is an opacity/stroke transition; reduced motion swaps it.
- **Reset / error** — reset selects the Cloud set. A constant series returns `r = 0` rather than
  `NaN`, and the test asserts it.
- **Validation** — the published statistics are asserted within rounding tolerance: mean x = 9,
  variance x = 11, mean y ≈ 7.5009, variance y ≈ 4.1273, r ≈ 0.8164, and the maximum spread across
  sets is < 5e-3 for variance y and < 1e-3 for r.
- **Alternatives** — (a) the original static four-panel figure: already excellent, kept one
  disclosure away; (b) a single overlaid scatter: destroys the point (four processes are invisible
  when superimposed). Small multiples + emphasis won.

---

## 10. `fig-same-mean` — same mean, different process

- **Source ID** — `mean_hides_dist.svg`; lessons `statistical-traps`, `visual-atlas`,
  `visual-integrity`; links to `/explore/integrity`.
- **Objective** — keep the mean at 70 while a second process appears, and watch spread and tail risk
  move instead.
- **Provenance** — *synthetic*. Two seeded 40-point samples; the mixture is constructed so Team B's
  mean stays at 70 exactly.
- **Data semantics** — two groups, 40 observations each; Team B is a mixture of a "normal" process
  around 70 and a "high" process, with weights chosen so the mean is unchanged.
- **Encoding** — dot strip per group with mean/median rules; a spread panel; a share-above-76 bar.
- **Why interactive** — "the mean is the same, so the groups are the same" is the misconception.
  Moving the mixture share keeps the mean printed at 70 while SD and tail share move — a claim that
  can only be demonstrated by moving one number.
- **Controls → derived** — `Share of Team B in the high process` (0–1, step 0.05). Derived: mean B
  (invariant), SD B, IQR B, share above 76, and the gap between SD A and SD B. "Mean only" hides the
  points and leaves the two identical means — the trap, shown rather than described.
- **Fallback** — mean, median, SD, IQR and share above 76 printed as numbers for both groups.
- **Motion** — points re-settle with a spring; reduced motion repositions without animation.
- **Reset / error** — reset returns to a 0.5 mixture. The share clamps to [0, 1]; the test asserts
  -1 → 0 and 2 → 1.
- **Validation** — the test asserts |mean B − 70| ≤ 1 for shares 0, 0.25, 0.5, 0.75, 1 and that SD B
  more than doubles between share 0 and 0.5.
- **Alternatives** — (a) two static dot strips: the invariance is a claim; (b) a box-plot comparison:
  shows spread but not the mechanism, and the existing box lab covers it. Mixture slider won.

---

## 11. `fig-simpson` — Simpson's reversal, by mix

- **Source ID** — `simpson_paradox.svg`; lessons `statistical-traps`, `visual-atlas`; links to
  `/explore/integrity`.
- **Objective** — change the treatment group mix and watch the pooled comparison reverse while every
  segment rate holds.
- **Provenance** — *synthetic* from `DATASETS.simpson`: new and returning segments with fixed
  within-segment rates (new 20/100 → 260/1000; returning 800/900 → 180/200).
- **Data semantics** — two segments × two arms, counts of converted/total. Pooled rates are weighted
  averages whose weights are the segment mix.
- **Encoding** — segment bars (invariant), pooled bars (move), and a standardized-rate marker.
- **Why interactive** — the paradox is a property of the *mix*, not of either segment. Only moving
  the mix shows that the treatment is better in both segments and worse overall.
- **Controls → derived** — `Treatment mix` (0–1, step 0.01, share of returning customers). Derived:
  pooled control rate (0.82, invariant), pooled treatment rate, the reversal flag, and the
  control-mix-standardized treatment rate. "Standardize on the control mix" toggles whether the
  standardized marker is drawn.
- **Fallback** — counts, pooled rates and the standardized rate in a table; the reversal is stated
  as a sentence with both numbers.
- **Motion** — bars spring to the new pooled height; reduced motion swaps.
- **Reset / error** — reset restores the default mix. Clamping keeps the share in [0, 1].
- **Validation** — asserted: both segment rates favour treatment; pooled control = 0.82; pooled
  treatment < control at the default mix; standardized treatment > pooled control; standardized rate
  is invariant across mixes (±1e-9).
- **Alternatives** — (a) the classic two-table exposition: correct, and it is what the source figure
  does; (b) a static pooled-vs-segment bar trio: shows the answer, not the mechanism. The mix slider
  is the added value; the source figure stays underneath.

---

## 12. `fig-uncertainty` — detectable is not decision-sized

- **Source ID** — `uncertainty_bars.svg`; lessons `statistical-traps`, `visual-atlas`.
- **Objective** — compare an effect and its interval with the threshold that would actually change a
  decision.
- **Provenance** — *synthetic*. Three estimates with stated intervals; the wide interval is labelled
  implausible on purpose so the reader sees an interval that cannot support a decision.
- **Data semantics** — three point estimates with 95% intervals on a percentage-point scale, plus a
  reader-chosen decision threshold.
- **Encoding** — point + interval bar per estimate against a shared scale and a threshold rule.
- **Why interactive** — significance ("the interval excludes zero") and relevance ("the interval
  clears the threshold") are different tests. Moving the threshold separates them.
- **Controls → derived** — `Decision threshold` (0–10 pp, step 0.5). `Show intervals` toggles the
  bars. Derived per estimate: verdict ∈ {decision-sized, detectable-only, inconclusive}, distance
  from the estimate to the threshold, and whether the interval crosses zero.
- **Fallback** — estimate, interval, distance to threshold and verdict are text rows; the verdicts
  are words, not colours.
- **Motion** — the threshold rule slides; verdict pills cross-fade. Reduced motion swaps.
- **Reset / error** — reset returns to 5 pp with intervals shown. At threshold 0 the verdict is
  `decision-sized` for an estimate that clears zero, and the test asserts that edge.
- **Validation** — `uncertaintyVerdict` is unit-tested for all three outcomes plus the threshold-0
  edge.
- **Alternatives** — (a) a static forest plot: shows intervals, not the decision line; (b) a
  significance-only readout: the exact failure being taught. Threshold slider won.

---

## 13. `fig-baseline` — the baseline changes the story

- **Source ID** — `bar_baseline.svg`; lessons `visual-atlas`, `visual-integrity`; links to
  `/explore/integrity`.
- **Objective** — toggle a truncated axis and see a 1.5-point difference become a ~4× visual ratio.
- **Provenance** — *synthetic*. Two index values (22.5% and 21.0%) chosen so the arithmetic is exact.
  The truncated panel is labelled a teaching counterexample.
- **Data semantics** — two values on a percentage scale, difference 1.5 pp.
- **Encoding** — two bars; the axis domain is the only thing that changes.
- **Why interactive** — the distortion is entirely in the axis. A static pair of panels can show it;
  a toggle makes the *same bars* jump, which is the visceral version.
- **Controls → derived** — `Axis baseline` (Zero / Truncated at 20%). Derived: bar heights in
  pixels, the visual ratio between them, and the unchanged 1.5-point delta printed beside both.
- **Fallback** — both values, the delta and the visual ratio are printed in text; the truncated
  panel carries a "teaching counterexample" label, not just a colour.
- **Motion** — bar heights transition; reduced motion swaps.
- **Reset / error** — reset returns to the zero baseline. The truncated mode never claims to be
  correct: the label and the readout both say otherwise.
- **Validation** — the ratio is computed from the rendered scale, and the delta is computed from the
  values, so the two numbers cannot drift.
- **Alternatives** — (a) the original two-panel static figure: kept; (b) a "spot the truncated axis"
  quiz: adds a scoring mechanism the lesson does not need. Toggle won.

---

## 14. `/explore/dashboards` — composition over time

`components/data-viz/composition-demo.tsx`, BeUI `composition-chart`.

- **Source ID** — no source SVG; this is an added module for chapter 07 (dashboard design). Editorial
  objective: a normalized stack answers "what is the mix?" and never "is this line growing?".
- **Data semantics** — `COMPOSITION_SERIES`: three revenue lines × eight quarters, values in
  thousands (subscriptions 420→601, services 180→214, support …). Normalized per quarter.
- **Encoding** — 100% stacked bars by default, optional area view; a legend; a quarter readout.
- **Why interactive** — the shared period is the mechanism: selecting a quarter prints its exact
  shares and total, so the normalized height can be reconciled with absolute revenue. Without that,
  a stack is a shape with no numbers.
- **Controls → derived** — `Composition view` (Bars / Area). Clicking a quarter in the plot (or
  focusing its segment) updates the readout: selected quarter, total revenue, largest line and its
  share, and the share range.
- **Fallback** — a 24-row visible table (quarter × line) with absolute values and computed shares.
- **Motion** — segment heights spring on view change; reduced motion commits instantly.
- **Reset / error** — the readout is derived from the chart context; clearing the selection returns
  the default quarter (Q4 25). Gaps in a period are rendered as gaps by the model, not as zero.
- **Validation** — `compositionShares(index)` sums to 100% ± 1e-9 across all eight periods (tested).
- **RTL/theme** — colours are chart tokens; the legend uses logical alignment.
- **Alternatives** — see §17.1.

---

## 15. `/explore/specialty` — flow accounting

`components/data-viz/funnel-flow.tsx`, BeUI `sankey-chart`.

- **Source ID** — `DATASETS["hiring-funnel"]` (12,400 → 5,400 → 2,100 → 640 → 512) plus the derived
  rejection flows. This is the dataset the earlier DEFER said did not exist.
- **Objective** — a funnel hides the loss; an additive flow accounts for it.
- **Data semantics** — ordered stage counts; each gate's difference is sent to its own rejection
  node so every node balances. Counts, not reasons.
- **Encoding** — Sankey columns = stages; band width = people; grey rejection nodes.
- **Why interactive** — the toggle is the comparison: with rejection bands the loss has area; without
  them the diagram is a chain and the loss is invisible again. Hiding and restoring is the lesson.
- **Controls → derived** — `Chart type` (Flow / Funnel only). `Show where the drop goes` toggles the
  rejection nodes. `Reset`. Derived: flows table, per-stage balance check, overall conversion,
  largest single loss.
- **Fallback** — the component ships a screen-reader-only flow table; a visible table repeats every
  band with share-of-source.
- **Motion** — layout spring on band changes; reduced motion instant.
- **Reset / error** — reset restores flow + drops. The balance check surfaces any arithmetic drift as
  "N unbalanced" instead of hiding it.
- **Validation** — `funnelLinks` is tested: every node's outgoing flows equal its stage count and one
  rejection link exists per gate. The visible balance readout recomputes it at render time.
- **Alternatives** — see §17.2.

---

## 16. `/explore/specialty` — angle versus length

`components/data-viz/angle-lab.tsx`, BeUI `donut-chart`.

- **Source ID** — `CHANNEL_MIX` (organic 41, paid 24, direct 16, email 11, referral 8) — the same
  five channels as `DATASETS["channel-mix"]`.
- **Objective** — the donut is accurate and hard to rank; a zero-baseline sorted bar ranks instantly.
- **Data semantics** — five parts of one total (100%).
- **Encoding** — donut (angle) and bars (length on a shared zero baseline) on the same values.
- **Why interactive** — reordering is the task. The ring cannot be reordered; the bars can, and the
  difference in effort is the argument. The closest-pair readout converts the 3-point gap into 10.8°
  of arc so the difficulty is quantified rather than asserted.
- **Controls → derived** — `Lead with` (Angle first / Length first) changes panel order and the
  commentary. `Bar order` (Ranked / Source order). `Reset`. Derived: largest/smallest, closest pair
  in points and degrees.
- **Fallback** — a five-row table with value, share and arc; the ring's legend carries names, values
  and share bars, so no value is angle-only.
- **Motion** — the ring's segments pop on focus; the center rolls digits. Reduced motion fades
  instead.
- **Reset / error** — reset returns to Angle first + ranked.
- **Validation** — shares sum to 100; arc = share × 360 printed to one decimal.
- **Alternatives** — see §17.3. The donut is displayed as a counterexample, not recommended.

---

## 17. Library comparisons with the weighted rubric

Rubric (from the adaptive visualization policy): correctness **30%**, teaching **25%**,
interaction **15%**, performance/mobile **15%**, accessibility & reduced motion **10%**,
maintenance **5%**. Each criterion is scored 1–5; the weighted score is the percentage of the
maximum, so 5.00 = 100%.

### 17.1 Composition over time — BeUI `composition-chart` vs hand-built stack

| Criterion (weight) | BeUI composition-chart | Hand-built stacked SVG |
|---|---|---|
| Correctness (30%) | 5 — normalizes per period, gaps for incomplete periods | 5 — we would write the same normalization |
| Teaching (25%) | 4 — view toggle + shared period readout | 4 — same readout, more code |
| Interaction (15%) | 5 — hover/focus/click period, keyboard, legend | 3 — every affordance is ours to build |
| Performance/mobile (15%) | 4 — springs on data change, re-layout on resize | 5 — static paths, zero runtime |
| A11y & reduced motion (10%) | 4 — focusable segments, `useReducedMotion`; no visible table | 4 — same, plus a table either way |
| Maintenance (5%) | 4 — vendored, hash-tracked | 3 — our code, our bugs |
| **Weighted** | **4.45 / 5 (89%)** | **4.25 / 5 (85%)** |

Adopted the component: it wins on interaction and maintenance, and its correctness is verified by the
same share test the hand-built version would need. The visible 24-row table is added locally, because
neither option ships one. Hard blockers checked: no paid dependency, no network call, no
`ssr:false`, layout measured only after mount.

### 17.2 Funnel losses — `sankey-chart` vs funnel + drop table

| Criterion (weight) | BeUI sankey-chart | Funnel chart + drop table |
|---|---|---|
| Correctness (30%) | 5 — balanced flows, tested | 5 — counts are counts |
| Teaching (25%) | 5 — the loss has area | 3 — the loss is a number in a column |
| Interaction (15%) | 5 — node/link focus, keyboard, tooltips | 4 — stage focus only |
| Performance/mobile (15%) | 3 — wide diagram, 9 nodes at full width | 5 — one compact column |
| A11y & reduced motion (10%) | 4 — sr-only table, reduced motion | 4 — sr-only table, reduced motion |
| Maintenance (5%) | 4 — vendored item | 5 — already wrapped on this page |
| **Weighted** | **4.55 / 5 (91%)** | **4.50 / 5 (90%)** |

Both are viable and both stay: the funnel answers "what share survives?", the Sankey answers "where
does it go?". The table fallback is required either way; the Sankey's mobile weakness (3) is why the
funnel view remains one toggle away rather than being replaced.

### 17.3 Angle vs length — donut as counterexample vs bars only

| Criterion (weight) | Donut kept as counterexample | Bars only, no ring |
|---|---|---|
| Correctness (30%) | 3 — angles are exact, comparisons are not | 5 |
| Teaching (25%) | 4 — the failure is visible and measurable | 3 — the claim is asserted |
| Interaction (15%) | 4 — shared ring/legend focus | 5 |
| Performance/mobile (15%) | 5 — 200-unit viewBox, cheap | 5 |
| A11y & reduced motion (10%) | 4 — legend carries every value | 5 |
| Maintenance (5%) | 4 — vendored | 4 |
| **Weighted** | **3.85 / 5 (77%)** | **4.65 / 5 (93%)** |

Bars win as the *recommendation*, and they are the recommendation. The donut is kept at 77% because
its role is to be judged, not recommended: a reader who only reads "angles are worse" has to take it
on trust. Hard blocker check: the donut is never the primary encoding for a ranking task, and the
page says so in three places.

### 17.4 Assistant surface — BeUI agent primitives vs a plain form

| Criterion (weight) | BeUI prompt/message/stream/activity/approval | Structured form only |
|---|---|---|
| Correctness (30%) | 5 — same `decide()` call underneath | 5 |
| Teaching (25%) | 5 — assumptions, rule name and trace are visible | 4 — the rule is visible, the reasoning process is not |
| Interaction (15%) | 5 — prompt, clarification, correction, approval | 4 |
| Performance/mobile (15%) | 4 — motion runtime on one route | 5 |
| A11y & reduced motion (10%) | 4 — labels, live regions opt-out, reduced motion | 5 |
| Maintenance (5%) | 3 — six vendored primitives to track | 5 |
| **Weighted** | **4.45 / 5 (89%)** | **4.75 / 5 (95%)** |

The structured form scores higher and **still exists** at `/explore/charts` and inside each lab. The
workspace was built because the chapter's own claim — that chart choice follows a stated task — is
easier to *demonstrate* when the reader can type a task in their own words and watch an assumption
appear, be corrected, and change the answer. The form is the cheaper path; the conversational surface
is the teaching path, and it is explicitly labelled as a local rule table with no model.

---

## 18. Known limits

- The AI workspace is a keyword rule table. It reads words, not intent. Prompts it cannot classify
  get a clarifying question rather than a guess; prompts it misclassifies can be corrected through
  the assumption controls, and the correction re-runs the same rules.
- Modality in the histogram is a smoothed local-maxima heuristic, not a statistical test.
- Anscombe statistics are reproduced to published rounding, not to arbitrary precision.
- The Sankey's rejection nodes name *gates*, not causes; the dataset has no reason field.
- No screen reader (NVDA/JAWS/VoiceOver), Firefox, Safari or real touch device was available, and no
  Lighthouse run was made. Automated axe-core checks did run: 24 routes × 3 viewports with reduced
  motion, 0 violations at WCAG 2.0/2.1/2.2 A+AA, recorded in `qa-report.md`. That is not equivalent
  to a screen-reader audit, and the QA harness cannot deliver Tab traversal.
- Motion QA is limited to `prefers-reduced-motion` emulation in Chromium and reading each component's
  reduced-motion branch. No iOS or Android device was tested.
