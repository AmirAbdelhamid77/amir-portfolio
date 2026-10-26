# BeUI chart mapping — curriculum chart → what the site actually renders

The question this document answers: for every chart the curriculum teaches, is there a live
chart on the site, and is it a BeUI registry component or a hand-built SVG?

The short answer:

- **Six core charts** → hand-built SVG labs. No BeUI component.
- **Twelve source SVG figures** → rebuilt as interactive modules (`lib/data-viz/figures.ts`), each keeping
  its original SVG in a disclosure underneath. No BeUI chart component fits their shapes.
- **Four specialty charts** → BeUI registry components on `/explore/specialty`
  (`funnel-chart` ADOPT, `treemap` ADAPT, `sankey-chart` ADOPT as of 2026-10-25, `donut-chart` ADAPT
  as a counterexample).
- **One composition chart** → BeUI `composition-chart` on `/explore/dashboards`.
- **Three named charts with no lab** (pie as a recommendation, heatmap, parallel coordinates) →
  explained in lessons and referenced by the decision assistant, deliberately not demoed.

Full specifications, controls and fallbacks: `visualization-specs.md`.

---

## 1. Mapping table

| Chart (assistant ID) | Taught in | Live demo | Implementation | BeUI? | Decision |
|---|---|---|---|---|---|
| Histogram | Ch. 03 · `/learn/core-chart-types`, `/learn/ar/histogram` | `/explore/charts/histogram` + `fig-histogram` | Hand-built SVG + `lib/data-viz/chart-math.ts` | No | **REJECT** — the bin-width control *is* the lesson |
| Box plot | Ch. 03 · `/learn/ar/box-plot` | `/explore/charts/box` | Hand-built SVG, Tukey fences in `boxStats` | No | **REJECT** — outlier fencing must be inspectable |
| Scatter plot | Ch. 03 · `/learn/ar/scatter-plot` | `/explore/charts/scatter` + `fig-quartet` | Hand-built SVG + least-squares regression | No | **REJECT** — overplotting and r must be shown honestly |
| Line chart | Ch. 03 · `/learn/ar/line-plot` | `/explore/charts/line` + `fig-dual-axis` | Hand-built SVG, shared-scale panels | No | **REJECT** — the dual-axis lesson needs two panels, not one library chart |
| Bar chart | Ch. 03 · `/learn/ar/bar-plot` | `/explore/charts/bar` + `fig-baseline` | Hand-built SVG + zero-baseline toggle | No | **REJECT** — truncating the axis on purpose is the demonstration |
| Dot plot | Ch. 03 · `/learn/ar/dot-plot` | `/explore/charts/dot` | Hand-built SVG | No | **REJECT** — position-vs-length is the subject |
| Pie | Ch. 06 · `/learn/accessibility-color-qa`, `/explore/integrity` | Integrity demo (deliberately exploded) + `donut-chart` counterexample | Hand-built SVG arcs; BeUI donut used only as the angle-vs-length foil | Partly (counterexample) | **REJECT as advice** — a correct pie would erase the anti-pattern being taught |
| Correlation heatmap | Ch. 03/04 prose; named by the assistant | — | Not rendered | No | **DEFER** — no dataset needs it; the scatter lab covers relationship |
| Treemap | Ch. 03 composition · `/learn/core-chart-types` | `/explore/specialty` | **BeUI `treemap`** + adapter + visible table | **Yes (ADAPT)** | **ADAPT** — ships an sr-only table; added a visible one |
| Funnel | Ch. 03 stages · `/explore/dashboards` (concept) | `/explore/specialty` | **BeUI `funnel-chart`** + adapter + visible table | **Yes (ADOPT)** | **ADOPT** — honest geometry, focusable stages |
| Sankey / flow | Ch. 03 stages, "where does the loss go" | `/explore/specialty` (Demo 03) | **BeUI `sankey-chart`**, flows derived from the funnel counts | **Yes (ADOPT 2026-10-25)** | **ADOPT** — additive flows are the only shape that shows the loss as area |
| Stacked composition | Ch. 07 · `/learn/dashboard-design` | `/explore/dashboards` | **BeUI `composition-chart`** + local legend + 24-row table | **Yes (ADOPT 2026-10-25)** | **ADOPT** — normalized stack with a shared period readout |
| Parallel coordinates | Ch. 04 · `/learn/advanced-multivariate` | — | Not rendered | No | **DEFER** — described, not demoed; a live version needs a dense multivariate dataset the export does not supply |


---

## 2. Why the six core charts are not BeUI components

This is the decision most likely to be questioned, so it is spelled out.

**1. The labs teach encoding decisions, not chart output.**
The histogram lab's control is bin width; the bar lab's is the zero baseline. A chart library
owns those choices. Handing them to a library would either hide the control or require fighting
the library's defaults to re-expose them.

**2. Every core chart needs the same accessible pairing.**
`aria-hidden` SVG + `role="img"` summary + a real `<table>` of the underlying values. Building
that pairing six times around hand-drawn geometry is less code than wrapping six library APIs
that each expose data differently.

**3. Lessons must not download a chart runtime.**
`motion` and `@floating-ui/dom` are reachable from `/explore/specialty` and, via `next/dynamic`, only
from the specific figure chunk a lesson shows. A reader who opens `/learn/foundations` downloads the
Anscombe chunk, not the other eleven figures, and never the Sankey.

**4. The math is the deliverable.**
`chart-math.ts` and `figure-data.ts` are pure and unit-tested (129 tests across the four suites). The
numbers on screen can be verified independently of the drawing code. A library would move that logic
into a dependency the tests cannot see.

**5. Static export and hydration safety.**
No canvas, no measurement-on-mount, no animation frame on first paint. The figures are deterministic
SVG, so server and client markup agree.

---

## 3. Why funnel, treemap, Sankey and donut *are* BeUI components

They pass the gate in `beui-component-decision-matrix.md` for the specialty and dashboard pages:

| Requirement | Funnel | Treemap | Sankey | Donut |
|---|---|---|---|---|
| Taught by the curriculum | Yes — ordered stage subsets | Yes — nested parts of a whole | Yes — where the loss goes | Yes — as the angle counterexample |
| Honest encoding | Stage widths ∝ counts; step and total % labelled | Tile area ∝ value; total reconciled to 1,960 | Band width ∝ people; every node balances | Angles exact; ranking explicitly not claimed |
| Keyboard reachable | Stage buttons are real `<button>`s | Roving tabindex + arrow keys | Node/link focus + keyboard | Ring/legend share focus; arrows move |
| Screen-reader data | **No table shipped** → visible table added | **sr-only table only** → visible table added | **sr-only table shipped** → visible table repeats it | Values in the legend; visible table added |
| Reduced motion | `useReducedMotion` → duration 0 | `useReducedMotion` honoured | Layout spring honours it | Pop/roll replaced by fade |
| Dark-mode contrast | Stage colours from site chart tokens | Keeps dark tiles; one label opacity overridden locally for AA | Chart tokens | Chart tokens |
| Bundle isolated | Only `/explore/specialty` | Same chunk | `/explore/specialty` | `/explore/specialty` |
| No duplicate teaching | Only funnel in the section | Only treemap in the section | Answers a question the funnel cannot | Present only as the foil to sorted bars |


---

## 4. What each lab actually renders

| Lab | Controls | Chart | Table |
|---|---|---|---|
| Histogram | Bin width 10–80 USD; count/percent; mean & median overlay | Bars with bin ranges in `<title>` | Every bin: range, count, share, cumulative |
| Box | Toggle outliers; four groups | Five-number summary + Tukey whiskers | Depot, n, min, Q1, median, Q3, max, outliers |
| Scatter | Two channels; regression line | Points + least-squares line, r shown | #, channel, spend, sign-ups, per-unit spend |
| Line | Series toggles; 26 weeks | One panel per series (no dual axis) | Week × series + total |
| Bar | Zero-baseline toggle; sort | Horizontal bars | Region, revenue, share, rank |
| Dot | Sort; range toggle | Three series per clinic | Clinic, emergency, urgent, routine, spread |

Each table sits inside a closed `<details>`, so it is available to anyone who opens it but does
not push the chart off the first screen. This is documented as progressive disclosure, not as
“hidden data”: the summary row is always visible and the chart's `aria-label` carries the
headline numbers.

---

## 5. Chart types the Decision Assistant can name but the site does not draw

| Type | Why it is named | Why it is not drawn |
|---|---|---|
| Pie | The assistant must be able to say “avoid this” | Drawing a good one would contradict the advice; the only pies are the deliberately exploded integrity demo and the donut used as a counterexample beside sorted bars |
| Correlation heatmap | Named as an acceptable alternative for dense category × category relationships | No dataset in the section has that shape; the scatter lab covers relationship |
| Parallel coordinates | Named as the multivariate option in chapter 04 | Requires a dense multivariate dataset; the source chapter describes it in prose |

Naming a chart without demoing it is honest as long as the text does not promise a demo. The
assistant's output for these lists no “Open the lab” link.

---

## 6. Component inventory actually shipped

```
components/charts/funnel-chart.tsx        ← BeUI, MIT, verbatim
components/charts/funnel-chart/model.ts   ← BeUI, MIT, verbatim
components/charts/treemap.tsx             ← BeUI, MIT, verbatim
components/charts/treemap/*.tsx|ts        ← BeUI, MIT, verbatim
components/charts/sankey-chart.tsx        ← BeUI, MIT, verbatim
components/charts/sankey-chart/*.tsx|ts   ← BeUI, MIT, verbatim
components/charts/donut-chart.tsx         ← BeUI, MIT, verbatim
components/charts/donut-chart/*.tsx|ts    ← BeUI, MIT, verbatim
components/charts/composition-chart.tsx   ← BeUI, MIT, verbatim
components/charts/composition-chart/*     ← BeUI, MIT, verbatim
components/agents/**                      ← BeUI AI-interface primitives, verbatim
components/motion/*                       ← BeUI transitive deps, verbatim
lib/ease.ts, lib/touch.ts, lib/hooks/*    ← BeUI transitive deps, verbatim
lib/data-viz/figures.ts                   ← ours: figure registry + metadata
lib/data-viz/figure-data.ts               ← ours: numbers, samples, derived statistics
lib/data-viz/assistant.ts                 ← ours: deterministic prompt → decision rules
components/data-viz/live-figure.tsx       ← ours: per-figure dynamic dispatch + provenance
components/data-viz/figures/*.tsx         ← ours: twelve live figures + shared kit
components/data-viz/composition-demo.tsx  ← ours: dashboard composition module
components/data-viz/funnel-flow.tsx       ← ours: Sankey flow module
components/data-viz/angle-lab.tsx         ← ours: donut-vs-bars counterexample
components/data-viz/choose-assistant.tsx  ← ours: AI-shaped workspace around the rule table
components/data-viz/specialty-charts.tsx  ← ours: client adapters + colours + formatters
components/data-viz/labs/*.tsx            ← ours: six hand-built charts
components/data-viz/lab-ui.tsx            ← ours: controls, table, chart card
```

Vendored files are excluded from ESLint (`components/charts/**`, `components/motion/**`,
`components/agents/**`) because the React Compiler rules flag upstream patterns; rewriting them
would fork the registry item. `tsc` still type-checks them because real pages import them.

One site-level style override exists for a vendored chart: the treemap dims its value label to 80%,
which drops white-on-teal to ~4.1:1 at 10–12px. `app/globals.css` restores full opacity for
`[data-treemap-tile] .opacity-80` instead of editing the registry file. Recorded in `qa-report.md`.
