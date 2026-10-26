# Visualization specification — Comprehensive Statistics Reference

This document specifies each drawing surface: why that representation, where its numbers come from,
what the axes mean, which controls exist, what error state it has, and how a non-visual reader gets
the same conclusion. The chart engine is custom SVG; the computation is `lib/statistics/math.ts`.

## 1. Global rules

| Rule | Implementation |
|---|---|
| The chart is never the source of truth | Every mark is computed from a pure function; readouts and tables use the same values. |
| Units are explicit | Axes say “individual value”, “sample mean”, “probability”, “density”, “count”, “percentage points”; no unlabelled axis. |
| Discrete ≠ continuous | `PmfChart` draws bars with gaps; `DensityChart` draws a curve with area. Neither morphs into the other. |
| Stable comparisons | Before/after states reuse one domain unless a rescale is necessary; the domain change is visible in the axis labels. |
| No chart-only conclusions | Each figure has a summary, and a table/readout gives exact values. |
| Colour is not the only encoding | Covered/missed intervals use solid vs dashed and labels; p-area and α-gate use fill vs hatch; groups have text labels. |
| Motion reinforces cause | Sampling animates means accumulating; the reduced-motion path jumps to the result. No decorative looping. |
| Honest empty/error states | Invalid n/σ/p values are clamped or show a warning; no NaN is printed (verified in the export). |
| Static export safe | No runtime API calls; all randomness is seeded locally; SVG is server-renderable. |

## 2. Shared chart primitives

### 2.1 `ChartFrame` (`components/statistics/chart-kit.tsx`)

- **Why:** one coordinate system, one set of ticks, one accessible title for all statistical plots.
- **Inputs:** x/y domains, optional ticks, axis labels, tick format functions, grid mode.
- **Geometry:** 480×300 viewBox, margins 52/16/20/44; responsive `w-full` scaling.
- **Accessibility:** `<svg role="img" aria-label>`, `<title>`, `<desc>`; no interaction inside the SVG.
- **Limitations:** SVG text scales with the drawing; very dense categorical axes use a reduced tick
  set or the exact-value table.

### 2.2 `DensityChart`

- **Why:** normal density, z areas, CI model, empirical-rule bands.
- **Data:** μ, σ>0, x domain; optional shade `left/right/between/two`; markers.
- **Math:** `normalPdf`, `normalCdf`; area computed from Φ, not by counting pixels.
- **Axes:** x = value; y = density (not probability); the total area is 1.
- **Legend:** curve, shaded probability, mean line, empirical bands.
- **Annotation:** μ line; marker labels; empirical 68/95/99.7 bands labelled approximate.
- **Errors:** σ≤0 returns NaN from math; labs clamp σ>0 and show a labelled minimum.
- **Fallback:** CDF table at μ±kσ; summary states the probability.
- **Tests:** normal integral, empirical-rule areas, z round-trip; normal lab e2e smoke.

### 2.3 `PmfChart`

- **Why:** binomial and Poisson masses; integer support.
- **Data:** array of `{k,p}`; highlight predicate; mean line; optional value label.
- **Math:** closed-form PMF; bars are probabilities; sum to 1 over the plotted support.
- **Axes:** x = k (integer), y = probability.
- **Legend:** highlighted event, faded non-event, mean line.
- **Annotation:** selected k label; mean need not be an integer.
- **Dense case:** >24 bars hide per-bar labels except the selected k; the exact table remains.
- **Fallback:** PMF/CDF table.
- **Tests:** normalisation, boundaries, Poisson exact values; binomial/Poisson e2e smoke.

### 2.4 `DotStripChart`

- **Why:** show every observation, the mean/median, SD band and box plot on one scale.
- **Data:** user values, computed summary, sample/population SD choice.
- **Math:** mean, median, modes, SD, quartiles (R type 7), Tukey fences.
- **Axes:** x = observed value; no y scale (dots are stacked for duplicates).
- **Legend:** mean solid, median dashed, outlier ring, box plot.
- **Fallback:** table with each value and deviation from the mean.
- **Tests:** sample/population variance, quartiles, outlier detection; e2e toggle/reset.

### 2.5 `HistogramChart`

- **Why:** population, one sample and sampling distribution panels; empirical vs theoretical overlay.
- **Data:** values, bin count, domain, optional PDF overlay.
- **Math:** counts and density; overlay scaled by `n × binWidth`.
- **Axes:** x = value/sample mean; y = count.
- **Annotation:** mean line; panel captions distinguish units.
- **Fallback:** panel comparison table; chart summary.
- **Tests:** histogram density area, bin counts; sampling e2e skip.

### 2.6 `IntervalChart`

- **Why:** repeated-sample CI coverage; a single gauge would hide misses.
- **Data:** intervals with `{estimate, lower, upper, covered}`; fixed true mean.
- **Math:** each interval is computed by `meanConfidenceInterval`; coverage counted, never forced.
- **Axes:** x = estimate/value; y = trial order (unlabelled by design).
- **Legend:** solid covered, dashed red missed, vertical fixed μ.
- **Fallback:** first-20 interval table; summary states covered/N.
- **Tests:** coverage test; browser dark-mode screenshot; no overflow.

### 2.7 `ScatterChart`

- **Why:** show linear, curved, clustered and outlier structures that r alone cannot.
- **Data:** points, optional group, optional regression.
- **Math:** Pearson r, least-squares fit.
- **Axes:** x and y with units (X unit conversion changes slope, not r).
- **Annotation:** r label; group labels when revealed.
- **Fallback:** point table with group.
- **Tests:** perfect ±1, U-shape near 0, slope/r invariance.

### 2.8 `PValueChart`

- **Why:** separate the p-value tail from the α decision gate.
- **Data:** observed z, alternative, α, p.
- **Math:** normal null density; p tail computed by `zTestPValue`; critical from Φ⁻¹.
- **Axes:** x = test statistic under H₀; y = null density.
- **Legend:** null curve, p area, α hatch, observed line.
- **Annotation:** p, α, critical, decision text.
- **Fallback:** table of p for all three alternatives; summary.
- **Tests:** tails/decision rules; e2e z=0.5 vs 2.4.

### 2.9 `NullAlternativeChart`

- **Why:** α, β and power need two correctly parameterised distributions.
- **Data:** non-centrality `ncp`, α, sidedness, optional observed.
- **Math:** H₀ N(0,1), H₁ N(ncp,1); power formula; β=1−power.
- **Axes:** x = test statistic in SE units; y = density.
- **Legend:** H₀, H₁, rejection hatch, β, power.
- **Fallback:** error-rate table; 2×2 truth table in the lab.
- **Tests:** power monotonicity, power+β=1; browser smoke.

### 2.10 `RateBarsChart` and `DifferenceIntervalChart`

- **Why:** A/B rates with denominators and a separate interval for the difference.
- **Data:** per-arm counts, Wilson intervals; difference, unpooled CI, threshold.
- **Math:** two-proportion pooled z test; Wilson per arm; unpooled difference CI.
- **Axes:** rates on 0–upper; difference in proportion (×100 = pp).
- **Legend:** arm colours, error bars, zero line, threshold line.
- **Fallback:** arm table, exact values, warnings.
- **Tests:** source counts p=.0263165, CI; e2e preset and denominators.

## 3. Lab compositions

| Lab | Primary charts | Controls → derived values | Fallback |
|---|---|---|---|
| Center–spread | DotStrip | dataset/outlier/SD mode → mean, median, modes, SD, IQR | value table |
| Binomial | PmfChart | n,p,k,event → PMF/CDF, E/Var | PMF/CDF table |
| Normal | DensityChart | μ,σ,x/interval → area, z | CDF table |
| Poisson | PmfChart + arrival strip | λ,k,event,window → PMF/CDF, simulated windows | PMF/CDF table |
| Sampling | PopulationCurve + 2 Histograms | shape,n,draws,seed → SE, means | panel table |
| Confidence | DensityChart / IntervalChart | n, confidence, mean/s, σ mode → CI, coverage | interval table |
| p-value | PValueChart | z/input, sidedness, α → p, decision | sidedness table |
| Correlation | ScatterChart | dataset, units, groups → r, slope, within r | point table |
| Errors | NullAlternativeChart | α,effect,σ,n,sidedness → β,power | error table + 2×2 |
| Business | RateBars + DifferenceInterval | counts, confidence, MME, cost → rates, p, CI, decision | arm table |
| Practical | DifferenceInterval | effect,n,σ,threshold → p,CI, relevance | readouts |
| Probability | sample-space grid + probability bars | scenario,A,B → P, conditional, independence | outcome table |
| Distributions | PmfChart / DensityChart | family, params, query → mass/area | computation table |
| Experiments | group panels + balance histogram | assignment,seed → imbalance, distribution | assignment table |
| Dot to decision | DotStrip, Histogram, Density, PValue | stage, n, confidence, μ₀, threshold → full chain | 40-row table |

## 4. Error, empty and boundary states

| State | Behaviour |
|---|---|
| Dataset with <2 values | Chart withheld; visible “Not enough data” message; no NaN. |
| σ or s ≤ 0 | Lab clamps to a positive minimum; formula readouts never divide by zero silently. |
| Binomial k outside 0…n | Slider clamps; PMF returns 0 for impossible k; no negative probability. |
| Poisson λ=0 | PMF is 1 at k=0, 0 elsewhere; handled without log-gamma overflow. |
| p=0 / p=1 in binomial | Collapses to a point mass; PMF boundary tested. |
| A/B zero conversions or tiny arms | `twoProportionTest` returns explicit warnings; the UI shows them. |
| Coverage with <2 means | Empirical SE displays “—”; no fabricated value. |
| Chart with no data | Summary says “no data” and table empty; no axis-only mystery. |

## 5. Test map

| Test | Covers |
|---|---|
| `tests/statistics/math.test.mjs` | PMF/PDF normalisation, Poisson exact values, normal area, t critical, CI, A/B, power, correlation, sampling, coverage, formatting |
| `scripts/verify-statistics.mjs` | 43 sections, anchors, visuals registered, formulas render, numeric benchmarks, internal links, docs |
| `tests/statistics/e2e.mjs` | lab interactions, responsive widths, dark mode, reduced motion, accessible names, all primary routes |
| Visual screenshots | `docs/statistics/screenshots/` (desktop hub, Poisson section, all labs sampled, mobile, dark, cheatsheet) |

## 6. Known visual limitations

- SVG text scales with the viewBox; at 390 px, dense tick labels are reduced/hidden and the exact
  table is the authoritative fallback.
- The atlas desktop graph is hidden below `md`; the list/search is the mobile representation.
- No pixel-diff baseline exists; screenshots are evidence, not a regression suite.
- The arrival strip is illustrative and `aria-hidden`; the probability values never depend on it.
- KaTeX fonts are local; the page does not render math from a remote service.
