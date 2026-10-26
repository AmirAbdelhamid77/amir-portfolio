# BeUI integration QA — fourteen registry items

Audit of the BeUI registry components that were actually installed and shipped, against the
requirements that matter for this curriculum: numbers that reconcile, keyboard reach, screen-reader
data, reduced motion, contrast, bundle isolation and static export.

**Audited:** 2026-10-25, against the local static export (`out/`) served on 127.0.0.1, then
re-checked on the deployed origin (`https://hansa.amir-portfolio.workers.dev/`, Worker version
`2e8528b1-8fed-4be7-9ebd-728c17c7f5ce`), driven in Chromium/Edge with `prefers-reduced-motion: reduce`.
**Method:** source read of every vendored file, DOM inspection, axe-core (WCAG 2.0/2.1/2.2 A+AA),
reduced-motion emulation, and comparison of rendered values against `content/data-viz/datasets.json`
and `lib/data-viz/figure-data.ts`.

Axe results are in `qa-report.md`. This document covers integration and per-component decisions.

---

## 1. Install provenance

| Field | Value |
|---|---|
| Registry | https://beui.dev (read 2026-10-23, re-read 2026-10-25) |
| Items installed | **14** |
| License | MIT for every item |
| Installer | `scripts/install-beui.mjs` (not `shadcn add`) |
| Machine record | `docs/data-visualization/beui-install-log.json` |
| Local helper preserved | `lib/utils.ts` (skipped — the project's `cn` differs) |
| Vendored files modified | **0** byte changes |

| # | Item | Slug / hash prefix | Files | Decision |
|---|---|---|---:|---|
| 1 | Funnel chart | `funnel-chart` / `95147b01` | 13 | ADOPT |
| 2 | Treemap | `treemap` / `3a31634a` | 20 | ADAPT |
| 3 | Composition chart | `composition-chart` / `b9fd4a69` | 18 | ADOPT |
| 4 | Sankey chart | `sankey-chart` / `0cf396c2` | 18 | ADOPT |
| 5 | Donut chart | `donut-chart` / `d190fda4` | 9 | ADAPT (counterexample) |
| 6 | Animated number | `animated-number` / `b2d0e0df` | 2 | ADOPT |
| 7 | Adaptive stepper | `adaptive-stepper` / `6ffab76a` | 3 | ADOPT |
| 8 | Sortable stack | `sortable-stack` / `f7f62d6c` | 3 | ADOPT |
| 9 | Prompt input | `prompt-input` / `883b637c` | 16 | ADOPT |
| 10 | Message | `message` / `2a230780` | 10 | ADOPT |
| 11 | Streaming response | `streaming-response` / `676a102a` | 6 | ADOPT |
| 12 | Reasoning text | `reasoning-text` / `0826c61e` | 5 | ADOPT |
| 13 | Agent activity | `agent-activity` / `99db6c37` | 8 | ADOPT |
| 14 | Approval card | `approval-card` / `98510ce3` | 16 | ADOPT |

`citations` is not a separate install: it ships inside `streaming-response`.

Dependencies added once and shared:

| Package | Version | Why |
|---|---|---|
| `motion` | ^14.6.0 | Layout springs, number ticker, tooltip positioning, reduced-motion hook |
| `@floating-ui/dom` | ^1.8.0 | Tooltip and popover placement |
| `clsx`, `tailwind-merge` | existing | Already present for `cn` |

The installer writes only the files the registry item lists, refuses to overwrite a file whose
content differs, and records the source hash. That is why the installed files can be re-audited
later: `node scripts/install-beui.mjs --dry-run` re-fetches and compares hashes.

---

## 2. Funnel chart — ADOPT

**Lesson it serves:** ordered stages where each stage is a subset of the previous one (chapter 03,
hiring-funnel dataset). Mounted at `/explore/specialty` (Demo 01).

### Numeric fidelity — PASS

Rendered stage values match `datasets.json` exactly:

| Stage | Value | Overall | Step | Dropped |
|---|---:|---:|---:|---:|
| Applications | 12,400 | 100.0% | — | — |
| Screened | 5,400 | 43.5% | 43.5% | 7,000 |
| Interviewed | 2,100 | 16.9% | 38.9% | 3,300 |
| Offered | 640 | 5.2% | 30.5% | 1,460 |
| Hired | 512 | 4.1% | 80.0% | 128 |

The visible table is computed from the same `FUNNEL_STEPS` array that draws the chart, so the picture
and the numbers cannot drift. The page's headline numbers (overall 4.1%, tightest gate 30.5%, largest
loss 7,000) were recomputed by hand from the dataset and match.

### Accessibility — PASS (with one path NOT_TESTED)

| Check | Result | Evidence |
|---|---|---|
| Chart is not hidden from AT | PASS | `section[aria-label="Hiring funnel: applications to hires"]` |
| Every stage is a real button | PASS | 5 `<button>` elements inside `ol > li` |
| Accessible name per stage | PASS | e.g. “Offered: 640 people, 5.2% of starting total” |
| Keyboard focus opens the tooltip | PASS by code review | `focusin` + `focusFromKeyboard()` modality check in `components/motion/tooltip.tsx`; programmatic focus deliberately does not open it |
| Escape dismisses the tooltip | PASS by code review | `useDismiss(open, close, …)` adds a window `keydown` listener for Escape |
| Tab traversal | **NOT_TESTED** | The automation harness does not deliver Tab; buttons are native and `tabIndex=0`, verified in the DOM |
| Table available | PASS | Visible table “Funnel table — added by this site”, 5 rows, Stage / Count / Step / Overall / Dropped |

### Motion — PASS

`useReducedMotion()` sets the animation duration to `0`, so the stage entry and the `NumberTicker`
counts collapse. Verified by source read and by the reduced-motion sweep (**NOT_TESTED** by
OS-level toggle outside the browser emulation).

### Contrast — PASS (axe)

Stage colours come from `--chart-1…5` (Okabe–Ito subset). Labels sit on a `bg-background/85` chip,
not directly on the stage fill, so the value text keeps normal text/background contrast in both
themes. axe reports 0 contrast violations on the route.

### Responsiveness — PASS

The plot is inside `overflow-x-auto`; at 320 px the funnel scrolls rather than clipping. axe and the
overflow check pass at 320/390/1280.

### Changes to the vendored source — none

The adapter (`components/data-viz/specialty-charts.tsx`) only maps stages to
`{ id, label, value, color }`, supplies the colour sequence and `formatValue`, and fixes
`unit="people"` and the label.

---

## 3. Treemap — ADAPT

**Lesson it serves:** nested parts of a whole where tile area carries magnitude (chapter 03
composition; revenue-mix dataset). Mounted at `/explore/specialty` (Demo 02).

### Numeric fidelity — PASS

Seven leaves across three groups, total **1,960**:

| Path | Value | Share |
|---|---:|---:|
| Subscriptions / Growth | 610 | 31.1% |
| Subscriptions / Starter | 420 | 21.4% |
| Subscriptions / Enterprise | 380 | 19.4% |
| Services / Implementation | 240 | 12.2% |
| Services / Support | 110 | 5.6% |
| Marketplace / Partner | 140 | 7.1% |
| Marketplace / Direct | 60 | 3.1% |

Shares are computed from leaf/total and sum to 99.9% with rounding; the page states that shares are
rounded and reconciles the total. Tile `aria-label` values read from the DOM match, e.g.
“Subscriptions / Starter. $420k. 21.4% of total”.

### Accessibility — PASS with one minor upstream defect

| Check | Result | Evidence |
|---|---|---|
| Chart group named | PASS | `role="group" aria-label="Treemap tiles"` |
| Tiles are real buttons | PASS | 7 `<button data-treemap-tile>` elements |
| Accessible name per tile | PASS | Path + value + share |
| Arrow keys move focus | PASS | Live dispatch: `starter → growth → enterprise → implementation` |
| Roving `tabIndex` follows focus | **FAIL (minor, upstream)** | After arrow navigation the tab stop remains on the first tile; Tab-out/Tab-back returns to tile 1 |
| Escape closes the tooltip | PASS by code review | `onKeyDown` sets `setTooltipOpen(false)` for Escape |
| Data available without hover | PASS | Visible table added: Path / Value / Share, 7 rows |
| Registry's own table | PASS but insufficient | `sr-only` table with Item / Value / Share of total / Details, 7 rows |

**Impact of the roving-tabIndex defect:** low. It changes which tile is the tab stop, not whether the
chart is usable: every tile is reachable with arrows once the group is entered, every tile has a
spoken label, and the full data is in a visible table. Reported rather than patched, because patching
`components/charts/treemap/plot.tsx` would fork the registry item and invalidate the recorded hash.

### Contrast — PASS only after a site-level override

This is the one finding that changed a decision. The registry tile renders its value label at
`opacity-80`; white-on-teal at 10–12 px measured **4.47:1**, just under the 4.5:1 AA floor. axe
flagged `button[data-treemap-tile="implementation"]`'s `$260k` label at all three viewports.

Fix, without touching the registry file:

```css
/* app/globals.css */
[data-treemap-tile] .opacity-80 { opacity: 1; }
```

Re-run result: 0 contrast violations. The earlier note in this document (“the default palette is
kept because white labels clear contrast”) was wrong for the dimmed value line and is corrected here.

### Motion — PASS

`AnimatePresence` + `motion` are wrapped by the component's `MotionConfig`; `useReducedMotion` is
honoured in the tile transition. Verified by source read and by the reduced-motion sweep.

### Changes to the vendored source — none

`toTreemapNode()` converts the generated `HierarchyNode` (optional `value`, optional `children`) into
the component's discriminated leaf/group union, so a missing value cannot silently become `NaN` area.
The visible table, total and share column live on the page.

---

## 4. Composition chart — ADOPT

`/explore/dashboards`, `components/data-viz/composition-demo.tsx`.

| Check | Result | Evidence |
|---|---|---|
| Normalizes per period | PASS | Three series × eight quarters; `compositionShares(index)` sums to 100% ± 1e-9 (tested) |
| Numeric readout reconciles | PASS | `QuarterReadout` prints selected quarter, total, largest line and share range; recomputed by hand for Q4 25 |
| Keyboard | PASS | Period buttons in the plot are focusable; legend rows are `<button>` with `aria-pressed` |
| Reduced motion | PASS | Springs are guarded by the component's reduced-motion branch |
| Visible table | **Added by us** | 24 rows (quarter × line) with absolute values and computed shares; the component ships none |
| Legend | **Replaced locally** | See §8 — the vendored legend's label fails WCAG 2.5.3 |
| Theme | PASS | Series colours are `--chart-1…5`; no hex in the demo |

Measures 18 files; the plot re-lays out on resize and only springs when data changes.

---

## 5. Sankey chart — ADOPT

`/explore/specialty` (Demo 03), `components/data-viz/funnel-flow.tsx`.

| Check | Result | Evidence |
|---|---|---|
| Flows reconcile | PASS | `funnelLinks()` sends each gate's difference to its own rejection node; every node's outgoing links equal its stage count (tested) |
| Balance is visible | PASS | On-screen “All balanced / N unbalanced” recomputes at render time from the drawn links |
| Keyboard | PASS by code review | Nodes and links are focusable; `aria-label` per node/link |
| Screen-reader data | PASS + added | Component ships an `sr-only` flow table; a visible table repeats every band with share-of-source |
| Reduced motion | PASS | Layout spring honours the reduced-motion branch |
| Mobile | WEAK, mitigated | Nine nodes at 320 px is dense; the funnel view is one toggle away and the table carries every number |
| Colour semantics | Constrained | Rejection nodes are neutral grey on purpose — a categorical hue would read as a sixth stage |

No source change. The drop-node labels name the *gate*, not a cause; the dataset has no reason field
and the page says so.

---

## 6. Donut chart — ADAPT (counterexample)

`/explore/specialty` (Demo 04), `components/data-viz/angle-lab.tsx`.

| Check | Result | Evidence |
|---|---|---|
| Angles exact | PASS | Shares are the dataset's; the arc column prints share × 360° to one decimal |
| Never recommended | PASS | Page copy says three times that the ring is the foil, not the advice; bars are the recommendation |
| Keyboard | PASS | Ring and legend share focus; arrow keys move between legend rows; Escape clears |
| Values not angle-only | PASS | Legend rows carry name, value and a share bar; a five-row table carries value/share/arc |
| Reduced motion | PASS | Pop and digit roll are replaced by a fade |
| Mobile | PASS | 200-unit viewBox; no overflow at 320 px |

The teaching value is the comparison, not the ring: the closest pair (41 vs 24 → … see the page's
computed pair) is printed in points and degrees so the difficulty is measured rather than asserted.

---

## 7. Motion primitives — animated-number, adaptive-stepper, sortable-stack

| Item | Where | Check | Result |
|---|---|---|---|
| `animated-number` | KPI figure (`fig-kpi`) | Value rolls only when the value changes; reduced motion prints it | PASS |
| `adaptive-stepper` | Pipeline figure stage control | Native button contract, `aria-current`, keyboard | PASS (Tab traversal NOT_TESTED) |
| `sortable-stack` | Encoding-rank figure | Drag plus keyboard reorder; `Check my ranking` compares to source order | PASS |

`animated-number` is used **only** where the lesson is a changing value (a KPI card). It is never
applied to a sourced statistic, because animating a citation makes it look like a live metric.

---

## 8. Agent-interface primitives — `/explore/choose`

Six primitives compose the workspace (`components/data-viz/choose-assistant.tsx`). There is **no
model, no API key and no network request**: `lib/data-viz/assistant.ts` is a keyword rule table that
calls the same `decide()` used by the labs, and its output is a pure function of the prompt and the
assumption state.

| Item | Role | Check | Result |
|---|---|---|---|
| `prompt-input` | Labelled textarea, submit, stop | Enter submits, Shift+Enter newlines, submit disabled when empty | PASS |
| `message` | User/assistant rows | Header, avatar, content composed; `animateIn` disabled by reduced motion | PASS |
| `streaming-response` | Block-by-block reveal with stop | Stop halts the timer and keeps revealed text; `announce={false}` because the surrounding `role="log"` already announces | PASS |
| `citations` (inside streaming) | Links every claim to a page on this site | 0 external citations | PASS |
| `reasoning-text` | Shown only while the rules run | Names rule steps, does not claim to think | PASS |
| `agent-activity` | Lists the exact steps that ran | Task match, shape match, rule applied, output | PASS |
| `approval-card` | Build / ask for exact values / reject | Each choice appends a real turn and updates the status | PASS |

### The two site-level fixes on this route

1. **Composition legend replaced.** The vendored `CompositionChartLegend` renders
   `aria-label="Highlight {name}"` on a button whose visible text is `{name}` plus `{share}%`. axe
   flagged WCAG 2.5.3 `label-content-name-mismatch` for all three series at all three viewports:
   a voice-control user cannot say the share. The demo now composes its own legend from the
   component's public `useCompositionChart()` hook, with
   `aria-label="{name} {share} - select to highlight"`. The vendored file is untouched.
2. **Live-figure caption contrast.** `text-muted-foreground/80` at 11 px measured under 4.5:1 in the
   light theme on `/learn/foundations`. Changed to full `text-muted-foreground`.

Both are recorded in `qa-report.md` with the before/after axe output.

---

## 9. Cross-cutting checks

| Check | Result | Evidence |
|---|---|---|
| Client components behind server pages | PASS | Every chart/demo adapter carries `"use client"`; pages keep `metadata` |
| No function props cross the boundary | PASS | Formatters are defined inside the client adapters |
| Vendored files excluded from ESLint, still type-checked | PASS | `eslint.config.mjs` ignores `components/charts/**`, `components/motion/**`, `components/agents/**`; `tsc --noEmit` passes |
| Whole-repo lint | PASS | `npx eslint .` → 0 errors, 0 warnings |
| Bundle isolated per figure | PASS | `next/dynamic` chunk per figure in `live-figure.tsx`; a lesson downloads only what it shows |
| Chart runtime limited to two routes | PASS | `motion` + `@floating-ui/dom` reachable from `/explore/specialty` and `/explore/dashboards` |
| Pages render statically | PASS | `next build` + `postbuild`, 113 segment aliases; no `ssr:false` |
| No browser API at module scope | PASS | No `window`/`matchMedia` read during evaluation; state initialises from constants |
| No console errors | PASS | 72-page sweep: 0 console errors, 0 failed requests |
| One H1 per page | PASS | Validator checks all 116 built HTML files |
| axe (WCAG 2.0/2.1/2.2 A+AA) | PASS | 24 routes × 3 viewports = 72 pages, 0 violations |
| Horizontal overflow | PASS | 0 pages overflow at 320/390/1280 |
| Dark mode | PASS (axe, dark sweep) | `npm run qa:browser:dark` available; tile and chart labels inspected |
| Reduced motion | PASS (emulated) | The sweep runs with `reducedMotion: "reduce"` |

---

## 10. Findings summary

| ID | Severity | Finding | Status |
|---|---|---|---|
| BQ-01 | Info | Funnel ships no table at all | **Fixed on our side** — visible table added |
| BQ-02 | Info | Treemap ships only an `sr-only` table | **Fixed on our side** — visible table added |
| BQ-03 | Minor | Treemap roving `tabIndex` does not follow arrow-key focus | **Open (upstream)** — documented, not patched |
| BQ-04 | Info | Funnel tooltip is hover/keyboard-focus only, not tap | **Accepted** — the table carries the same values |
| BQ-05 | **Serious (fixed)** | Treemap value label at `opacity-80` measured 4.47:1 | **Fixed at site level** — scoped CSS override; registry untouched |
| BQ-06 | **Serious (fixed)** | Composition legend `Highlight {name}` failed WCAG 2.5.3 | **Fixed at site level** — local legend via the public hook |
| BQ-07 | Info | `/explore/specialty` pays `motion` + `@floating-ui/dom` | **Accepted** — isolated to two routes, and each demo earns it |
| BQ-08 | Info | Sankey is dense at 320 px | **Mitigated** — funnel toggle + visible flow table |

No critical or blocking defects. Two accessibility defects were found in third-party markup and
both were fixed without forking: one scoped CSS rule, one composed legend. That is the intended
pattern — fix at the site level, keep the hash re-auditable.

---

## 11. Reproduce this audit

```powershell
node scripts/install-beui.mjs --dry-run   # confirms hashes still match the registry
npm run build
node scripts/validate-data-viz.mjs --check
node scripts/qa-browser.mjs               # 24 routes × 3 viewports, axe + overflow + console
node scripts/qa-browser.mjs --only /explore/specialty/,/explore/dashboards/,/explore/choose/,/learn/foundations/
node scripts/qa-browser.mjs --base https://hansa.amir-portfolio.workers.dev --only /,/explore/specialty/,/explore/dashboards/,/explore/choose/,/learn/foundations/
```

Manual checks on `/explore/specialty/`:

- Tab into the funnel; read the accessible names.
- Tab into the treemap; use Arrow keys, then Escape.
- Toggle the Sankey's rejection flows and confirm the balance readout stays “All balanced”.
- Compare the donut's closest pair against the bar gap, then open the arc table.
- Open both tables and reconcile the totals (1,960 for revenue mix).

The machine-readable install record is `beui-install-log.json`; adoption reasoning is
`beui-component-decision-matrix.md`; the chart-to-component map is `beui-chart-mapping.md`;
figure-level specifications are `visualization-specs.md`.
