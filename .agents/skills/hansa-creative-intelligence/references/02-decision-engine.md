# Decision engine: semantics → visual grammar → interaction → technology

## A. Mandatory diagnostic

Capture: user task; content form; source evidence; data types/units; transformation rules; available viewport; interaction purpose; prerequisite; misconception; output/assessment; accessibility equivalent. Then consider whether a static or interactive visualization improves learning.

| Meaning or question | Preferred visual semantics | Powerful contextual interaction | Do not do |
|---|---|---|---|
| Compare discrete values | aligned bars, dots, small multiples | filter, isolate, reorder, compare | skewed baselines or gratuitous 3D bars |
| Trend over time | lines/areas, annotated change points | time-range brush, hover/focus, story steps | imply observations between sparse points without caveat |
| Distribution/outliers | histogram, box/violin, dotplot | bin width, outlier toggles, sample size | substitute average-only KPI |
| Association | scatter, residuals, slope | subgroup toggle, trend line, outlier test | imply causal relationship |
| Structure/hierarchy | expandable tree, grouped clusters | expand, focus, navigate | unlabeled ornamental nesting |
| Concepts/lineage | node-edge network | zoom, select, highlight grounded links, search | invented relationships, anonymous particles |
| Procedure/dataflow | staged flow, trace and table | step playback, inspect intermediates | moving tokens without exact state |
| Part-to-whole | 100% stacked bars, treemap | group/period select, denominator reveal | unclear aggregation or misleading pies |
| Real weighted flow | Sankey, alluvial | inspect source-target and flow filters | Sankey for unweighted concept links |
| Tradeoffs | matrix, decision surface | change constraints, reveal why | decorative radar plot without justified axes |
| SQL/DAX evaluation | code trace, filter-context state, row transformations | step, run conceptual *simulation*, compare outputs | imply execution against live engine when not |
| Mathematical relation | formula + function plot | exact parameter sliders, reset | animated numerical results not recomputed |
| Story/evidence | annotated scenes, focused quantitative graphics | scrollytelling with manual accessible steps | hijacked scroll/parallax overlong |
| Glossary/reference | readable text, search, structured table | filter/copy/reveal | chart merely to avoid text |
| Exam practice | scenario + structured representation | answer/retry/rationale, evidence gates | reveal blocked answer as certified |

## B. Decision score for choosing *level of expression*

A quick qualitative score (low/medium/high), not a mechanical formula:
- **Learning gain** from interaction.
- **Evidence integrity** and representation accuracy.
- **Novelty fit** relative to neighboring Hansa pages.
- **A11y and mobile clarity**.
- **Performance and maintenance cost**.

If interaction gain is **low**, use a strong graphic editorial composition, not an empty chart. If it is **high**, invest in meaningful state, animation and visual richness. Avoid premature "simplest = default rectangle" assumptions; typography, composition, SVG and negative space can be highly designed without an interaction library.

## C. Tool decision

1. Existing local component/visualization or public/free beUI if it meets requirements.
2. CSS + semantic HTML + authored SVG for lightweight custom visuals.
3. Motion or existing animation stack for declarative React state transitions, gesture/layout transitions and controlled orchestration.
4. **D3** (`d3-scale`, `d3-shape`, `d3-force`, `d3-hierarchy`, `d3-zoom`, etc. as needed) for bespoke layouts/geometry/interaction; integrate with React carefully.
5. Existing Recharts/ECharts/React Flow if already installed and correct for a chart/graph; do not replace them reflexively.
6. 3D/WebGL only if an actual three-dimensional concept or a justified high-value immersive learning experience is better represented that way. Avoid heavy dep for vanity.

Inspect actual package.json and licensing before choosing. Do **not** assume beUI Pro is available; don't install all candidates.

## D. Data fidelity

- Visible claims require canonical data; include units, denominators, filters, time windows, missing values, legend and accessible tabular alternative where appropriate.
- Preserve stable concept/question/source IDs; edges must have recorded semantic support.
- Demos may use **clearly labeled illustrative/synthetic** data when educational (e.g., normal distribution simulator), with consistent recomputation from controls.
- Do not fabricate experimental results or site progress for animation polish.
- For scientific assessments: keep original and proposed keys distinct and preserve grade-eligibility gates; unapproved answers remain ungraded.

## E. Choosing D3 (explicit gate)

Use D3 when **some D3 capability is core**: nonstandard visual layout; force simulation; custom hierarchical geometry; precise custom scales and axes; zoom/brush; relationship-driven transitions; intentionally bespoke chart composition.

Do not use D3 if the only reason is "more animated" or if a current chart component already gives the required interaction at lower cost. D3 can supply data transformations/scales while React renders SVG elements; there is no requirement to let D3 own DOM nodes.
