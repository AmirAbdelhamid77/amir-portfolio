# beUI component decisions — Comprehensive Statistics Reference

**Registry snapshot:** <https://beui.dev/registry.json> — 145 items, fetched **2026-10-24**.
**Item-detail endpoint:** <https://beui.dev/r/{install-slug}.json>.
**Licence of every item considered:** MIT (as published in the registry metadata at fetch time).
**Paid tier:** none used. No beUI Pro component, paid API or hosted service is required.

The statistic pages need two different things:

1. **Interaction architecture** — search, disclosure, inputs, feedback, focus. beUI is a good fit.
2. **Mathematical graphics** — densities, PMFs, tail areas, interval plots, scatterplots. beUI’s
   special-purpose charts are not a statistical rendering engine, so these are hand-built SVG with
   the computation in `lib/statistics/math.ts`.

This document records both decisions separately. A component is not marked “working” because it is
listed in the registry; the status column reflects the real build/lint/browser checks in this repo.

## 1. Adopted components

### 1.1 Command Palette — `react-web:command-palette`

| Field | Record |
|---|---|
| Install slug | `command-palette` |
| Registry item | `https://beui.dev/r/command-palette.json` |
| Source directory | `components/motion/command-palette.tsx` |
| Helpers | `lib/command-search.ts`, `lib/hooks/use-on-open.ts`, `lib/hooks/use-touch-capable.ts`, `lib/presence-gate.tsx` |
| Existing helpers reused | `lib/hooks/use-row-cursor.ts`, `lib/ease.ts`, `lib/utils.ts` |
| Dependencies | `clsx`, `lucide-react`, `motion`, `tailwind-merge` (all already in the project) |
| Licence | MIT |
| Purpose | Concept search across 43 sections, 15 labs, formulas, glossary and tools |
| Adoption | Vendored source; a thin adapter (`components/statistics/concept-search.tsx`) supplies items and routing. The palette source is not restyled; `components/motion/**` remains excluded from ESLint so the registry file is not forked. TypeScript still checks it. |
| Non-default work | The adapter adds a visible trigger (the shortcut is not the only way in), restores focus to the trigger on close, and supplies Arabic synonyms in the search keywords. |
| Source hashes (SHA-256, 2026-10-24) | command-palette `FDC4F20C…1D9C63`; command-search `EA60EAD0…45A2D5`; use-on-open `40FE63A5…C0083`; use-touch-capable `7B9AD864…4D720`; presence-gate `F3C39119…A9C74` |
| Runtime status | **PASS** — `Ctrl+K` opens one dialog, search returns Poisson, Escape closes, focus returns; verified in Edge by `tests/statistics/e2e.mjs`. |
| Accessibility caveat | The palette traps the page while open and uses `role=dialog`, `role=listbox`/`option`, arrow keys and Enter. A second instance would open two dialogs; the hub therefore has exactly one search trigger. |

**Why this component and not a plain search box:** the reference has 43 sections and 15 labs spread
across nine journeys. A command surface gives keyboard users a single, predictable route to any
concept, with searchable Arabic/English synonyms, without adding a second navigation system.

### 1.2 Tooltip — `react-web:tooltip` (already installed)

| Field | Record |
|---|---|
| Source | `components/motion/tooltip.tsx` and helpers, installed from the free beUI registry in the Data Visualization work |
| Licence | MIT |
| Use here | `InfoTip` beside supplementary lab parameter help |
| Rule | No definition required to answer the lesson’s main question is hidden in a tooltip. All essential assumptions and caveats are visible prose. |
| Status | **PASS** — the statistics a11y scan finds no unnamed buttons/inputs; tooltip content is mirrored in nearby text. |

### 1.3 Number Ticker — `react-web:number-ticker` (already installed)

| Field | Record |
|---|---|
| Source | `components/motion/number-ticker.tsx` |
| Licence | MIT |
| Use here | `LiveNumber` in lab readouts (p-values, coverage, rates) |
| Behaviour | `startOnView={false}` for live values; reduced-motion sets transitions to 0; an `sr-only` span always carries the readable value, so the animated digits are not the only representation. |
| Status | **PASS** — browser e2e interacts with the labs; the exact-value tables remain independent of the animation. |

## 2. Considered and rejected (with reasons)

| Candidate | Registry item | Decision | Why |
|---|---|---|---|
| Adaptive Stepper | `adaptive-stepper` (12.7 KB + liquid) | **REJECT** | It is a beautiful liquid quantity control, but it fixes a 13.5rem fieldset width and adds a decorative transition to parameters that are better read as plain numeric inputs. The lab needs precise values, min/max/step semantics and no interference with a dense control column. |
| Range Slider | `range-slider` | **REJECT** | The native `input[type=range]` is already labelled, keyboard-operable, RTL-tolerant and styled by the site. Vendoring a second slider system would duplicate behaviour and add touch CSS for no pedagogical gain. |
| Tabs | `tabs` (25.5 KB) | **REJECT** | Lab modes are two or three short choices. The existing accessible segmented buttons are smaller, print-friendly and do not add a 25 KB component plus animation choreography. |
| Morphing Search | `morphing-search` | **REJECT** | One search surface is enough. The command palette already covers the concept index with a stronger keyboard model; a second morphing field would compete with it. |
| Bouncy Accordion / Collapsible | `bouncy-accordion`, `collapsible` | **REJECT** | The source has 14 native `<details>` decision rules and the formula/assumption drawers need print expansion. Native `<details>` works without JavaScript, prints, and is screen-reader predictable. |
| Donut | `donut-chart` | **REJECT** | It cannot represent a density or a tail area. It would be decorative on a p-value page. The A/B arm rates are better as bars with denominators. |
| Funnel | `funnel-chart` | **REJECT** | The source checkout case is a binary conversion comparison, not a multi-stage funnel. Inventing intermediate stages would fabricate data. |
| Treemap | `treemap` | **REJECT** | A lesson taxonomy is not a parts-of-whole value; tile area would encode nothing. The journey index is an ordered list, which is the honest structure. |
| Sankey | `sankey-chart` | **REJECT** | No weighted flow dataset exists. The concept atlas edges are prerequisite links with no quantitative weight; a Sankey would be a false flow. |
| Bump / Heat Calendar / finance charts | `bump-chart`, `heat-calendar`, `candlestick`, … | **REJECT** | No ranking-over-time or trading data belongs in this reference. Adopting them would invent a topic to justify a component. |
| Data Table | `table` | **REJECT as a dependency** | The statistics charts need compact exact-value tables inside `<details>` with aria labels; the existing `DataTableView` is smaller and tailored to this content. |

## 3. Chart-engine decision

**Selected: hand-built SVG primitives + pure TypeScript math + KaTeX for notation.** No charting
library was added.

| Requirement | Why the custom engine fits |
|---|---|
| Exact tail areas and null distributions | `PValueChart` shades the region under the null CDF; a general chart library would require fighting its scales and stacking model. |
| PMF vs PDF semantics | Discrete bars and continuous areas are different components (`PmfChart`, `DensityChart`); the library cannot accidentally morph one into the other. |
| Interval plots | `IntervalChart` draws one row per repeated sample with covered/missed patterns, not a gauge or bar. |
| Stable axes and unit labels | The chart kit owns `CHART` margins, ticks and axis labels; labs pass one domain and every mark shares it. |
| Bundle and static export | No client chart runtime is needed for simple plots; only the lab islands hydrate. |
| Accessibility | Each chart is SVG `role="img"` with a summary and an adjacent exact-value table. A canvas-based library would need a separate accessibility layer. |

KaTeX (MIT, `0.16.47`) renders the repaired LaTeX at build time with `trust:false`,
`throwOnError:true` in verification; the CSS and fonts are served locally from `_next/static`.

## 4. Verification status

| Check | Result |
|---|---|
| Registry items fetched and read | PASS (5 item JSONs + registry index) |
| Files vendored without clobbering local utilities | PASS |
| TypeScript build | PASS |
| ESLint (statistics source) | PASS |
| Browser: one palette, search, Escape, focus return | PASS (`tests/statistics/e2e.mjs`) |
| Browser: no unnamed controls / charts without alternatives in 8 representative pages | PASS |
| Paid services or Pro components | None |

**Not claimed:** the registry is a moving target. This document records the 2026-10-24 snapshot. A
future reinstall must re-fetch the item JSON, compare hashes and rerun the e2e suite. The vendored
files are intentionally excluded from ESLint so they remain auditable against the registry; they are
still type-checked and rendered.
