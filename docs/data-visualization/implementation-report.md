# Implementation report — Data Visualization learning experience

**Project:** Hansa portfolio (`D:\BeUI\amir-portfolio`)
**Scope:** Turn the owner's local Notion “Data Visualization” HTML export into an interactive,
BeUI-styled learning section, without changing the existing site's content, branding, routes,
or static-export/Cloudflare architecture.
**Status:** Implemented, validated, built, **deployed 2026-10-25** (Worker version
`2e8528b1-8fed-4be7-9ebd-728c17c7f5ce`), then verified against the live origin.
**Live:** https://hansa.amir-portfolio.workers.dev/
**Build:** Next.js 16.4.3, static export (`output: "export"`), Cloudflare Worker `hansa`.

---

## 0. Revision 2026-10-25 — live figures, three new modules, AI workspace

Read this section first: it supersedes the counts and the BeUI summary in §1, §4 and §6.

**What changed**

- All 12 source SVG figures are now interactive modules (`lib/data-viz/figure-data.ts` +
  `components/data-viz/figures/*`), dispatched per figure by `components/data-viz/live-figure.tsx`.
  The original SVG stays unchanged inside a disclosure under each one, so provenance survives.
- Three new modules: quarterly composition on `/explore/dashboards`, Sankey flow accounting and an
  angle-vs-length counterexample on `/explore/specialty`.
- `/explore/choose` is now an AI-shaped workspace (prompt → clarification → streamed answer →
  assumption editor → approval) over the same deterministic `decide()` rule table. There is no
  model, no API key and no network request; `lib/data-viz/assistant.ts` is a keyword rule table with
  an explicit "no task → ask" path.
- 14 registry items installed (5 charts, 2 motion primitives, 6 agent primitives, 1 sortable stack),
  all MIT, all byte-identical to the registry, all hash-recorded in `beui-install-log.json`.
- New test suites: `tests/data-viz/figures.test.mjs` (14) and `tests/data-viz/assistant.test.mjs`
  (12). Data-viz suite is now 62 tests; all four suites total **129**.

**Current measurements** (`out/`, build of 2026-10-25)

| Measure | Value |
|---|---|
| `out/` total | 997 files, 43.0 MB |
| HTML | 116 files, 14.7 MB, average 130 KB |
| JS | 93 chunks, 4.75 MB |
| CSS | 2 files, 160 KB |
| Source figure SVGs | 12 files, 23.5 KB |
| Segment payload aliases | 113 |

The file count grew because the statistics and fabric sections were added in parallel and because
each live figure is its own chunk. Average HTML is heavier than the previous report (87.9 KB → 130 KB)
because lesson pages now inline the figure markup plus the RSC flight payload.

**Gates actually run for this revision** — see `qa-report.md` for the evidence table.

| Gate | Result |
|---|---|
| `npx eslint .` | PASS (0 errors, 0 warnings) |
| `npx tsc --noEmit` | PASS |
| `npm run test:all` | PASS 129/129 |
| `npm run build` + `postbuild` | PASS, 113 aliases |
| `node scripts/validate-data-viz.mjs --check` | PASS, 3337 assertions |
| `node scripts/qa-browser.mjs` (full sweep, Chromium/Edge, 24 routes × 3 viewports, reduced motion) | PASS: 72 pages, 0 axe violations, 0 overflow, 0 console errors |
| `node scripts/verify-agent-reference.mjs` | PASS — 13 active hashes, entry paths, router v1.1, rubric weights, 6 intake hashes |
| `npm run deploy` | PASS — Worker `hansa` version `2e8528b1-8fed-4be7-9ebd-728c17c7f5ce`, 533 assets uploaded |
| Post-deploy verification (`qa-browser.mjs --base`) | PASS — 5 routes × 3 viewports on the live origin, 0 axe violations, 0 overflow, 0 console errors |

**Two cross-area fixes made while running the gates**

1. `app/learn/statistics/cheatsheet/page.tsx` rendered two `<h1>` elements (page header + print
   sheet). The print sheet's duplicate title is now an `<h2>` with the same styling. This was
   pre-existing and unrelated to the figures, but the site-wide validator fails on it.
2. `app/globals.css` gained a scoped rule raising the BeUI treemap's value-label opacity, which
   measured 4.47:1 against the 4.5:1 AA floor.

---

## 1. What exists now

### Routes

| Route | Kind | Purpose |
|---|---|---|
| `/learn/` | Hub | Ten chapters, source stats, paths into the labs and practice |
| `/learn/[slug]/` | 16 SSG pages | English lessons transcribed from the export |
| `/learn/ar/` | Hub | Arabic companion path |
| `/learn/ar/[slug]/` | 11 SSG pages | Arabic lessons, RTL |
| `/learn/chapter/[number]/` | 10 SSG pages | Chapter framing + ordered lesson list |
| `/learn/method/` | Static | How the import works, what is synthetic, how to re-run |
| `/explore/` | Hub | Labs directory |
| `/explore/charts/` | Hub | Six core chart labs |
| `/explore/charts/{histogram,box,scatter,line,bar,dot}/` | 6 pages | Interactive labs |
| `/explore/choose/` | Static + client | Chart Decision Assistant |
| `/explore/integrity/` | Static + client | Seven visual-integrity demos |
| `/explore/dashboards/` | Static + client | Dashboard anatomy, executive ↔ analyst |
| `/explore/specialty/` | Static + client | BeUI funnel + treemap audit |
| `/practice/` | Static + client | Twelve-scenario practice bank |

Total built pages: **75** (72 HTML files on disk, including `_not-found` and route aliases).
Sitemap: **69 URLs**, no duplicates, every new section present.

### Curriculum structure

- 10 chapters.
- 27 lessons: **16 English**, **11 Arabic**.
- **25 source lessons** (one per exported page) + **2 editorial lessons** marked `MISSING`.
- Arabic routes drop the export's `ar-` prefix (`ar-histogram` → `/learn/ar/histogram/`).

---

## 2. Architecture

### 2.1 Content pipeline (offline, repeatable)

```
Data Visualization/*.html + *.svg
        │
        ▼
scripts/import-notion-data-viz.mjs  ── parses, sanitizes, hashes, classifies links,
        │                              copies figures, writes inventory + audit
        ├── content/data-viz/pages.json        (typed block model, 951 blocks)
        ├── content/data-viz/manifest.json     (per-page counts + hashes)
        ├── docs/data-visualization/html-export-inventory.json
        ├── docs/data-visualization/local-source-audit.md
        └── public/data-viz/figures/*.svg      (12 files, byte-identical)
```

- **No network access.** The importer reads the local folder only.
- **Idempotent.** Identical input bytes produce identical output; `--check` fails if the
  generated files are stale.
- **Partial imports are refused.** A missing figure or unparsed page fails the run rather than
  publishing a hole.
- **Sanitization is structural.** `<script>`, inline event handlers, and external `xlink:href`
  SVGs are rejected; content is stored as data, never as HTML strings.

### 2.2 Rendering

- `components/data-viz/source-blocks.tsx` renders the block model to React elements:
  headings, paragraphs, quotes, lists, tables, callouts, toggles (`<details>`), code, Mermaid
  source, equations, and figures (`next/image`).
- Links are pre-classified (`page` / `external` / `notion` / `mailto`); internal links use
  `next/link`, external links get `rel="noopener noreferrer"`, and `javascript:` is impossible
  by construction.
- Each block gets a `dir` when it differs from the page default, and each block gets a stable
  `id` when it is a heading, so the “On this page” table of contents works.

### 2.3 Data and math

- `scripts/build-datasets.mjs` → `content/data-viz/datasets.json`: **14 synthetic datasets**,
  seed `20261023`, deterministic. `--check` verifies the file is byte-identical to a fresh run.
- `lib/data-viz/chart-math.ts`: pure functions (`extent`, `niceScale`, `histogram`, `quantile`,
  `boxStats`, `pearson`, `linearRegression`, `scaleLinear`, formatters). No React, no DOM —
  unit-tested directly.
- `lib/data-viz/decision.ts`: the Chart Decision Assistant is a rule table, not a model. It
  returns `matched: exact | shape | task | default`, a primary recommendation, alternatives,
  and charts to avoid, each with a reason.

### 2.4 Core chart labs are hand-built SVG

The six core charts (histogram, box, scatter, line, bar, dot) are drawn with plain SVG and the
pure math above. Reasons:

1. **The chart is the lesson.** A library that silently picks bin widths or axis domains would
   fight the teaching point (bin width, zero baseline, log scale, overplotting).
2. **Accessibility is explicit.** Each chart is decorative to assistive tech (`aria-hidden`) and
   paired with a real `<table>`; the `ChartCard` carries a one-sentence summary in
   `role="img" aria-label`.
3. **No runtime dependency for the core path.** No chart bundle is downloaded to read a lesson
   or move a slider.
4. **Static export friendly.** No canvas, no `window` measurement on first paint, no hydration
   surprises.

### 2.5 Interaction primitives

`components/data-viz/lab-ui.tsx` provides: `Panel`, `Segmented` (`role="group"` +
`aria-pressed`), `ToggleChip`, `RangeControl` (native range with `aria-label` and
`aria-valuetext`), `ChartCard`, `DataTable`, `KeyNumbers`, `Insight`, `SyntheticNote`, `Legend`.

Every control is a native element (`<button>`, `<input type="range">`, `<input type="checkbox">`,
`<select>`, `<details>`). Keyboard and touch therefore work without custom key handling, and
`prefers-reduced-motion` is honoured globally in `app/globals.css`.

### 2.6 Colour

`--chart-1 … --chart-5` were added to `app/globals.css` as an Okabe–Ito subset with dark-mode
variants. They are intentionally **independent of the brand accent themes**: changing the site
accent must not change what a series colour means.

---

## 3. Page-by-page implementation notes

| Page | What it teaches | Notable implementation detail |
|---|---|---|
| `/learn` | The ten-chapter path, English + Arabic | Coverage badges distinguish `COVERED` from `MISSING` |
| `/learn/[slug]` | Source lessons | One H1, per-block RTL, TOC from headings, prev/next within section |
| `/learn/chapter/[number]` | Chapter framing | `generateStaticParams` returns `{ number }` |
| `/explore/charts/histogram` | Bin width is a decision | Native range 10–80; count/percent toggle; mean & median overlay; table of every bin |
| `/explore/charts/box` | Five-number summary, Tukey fences | Toggle outliers; four groups with different spread |
| `/explore/charts/scatter` | Correlation, overplotting, regression | Two channels; least-squares line; r shown numerically |
| `/explore/charts/line` | Trend vs noise, dual axis | Series toggles; shared-scale panels instead of a dual axis |
| `/explore/charts/bar` | Zero baseline, sorting | Toggle zero baseline and sort; truncated axis is visibly wrong |
| `/explore/charts/dot` | Position vs length | Three series per clinic; range toggle |
| `/explore/choose` | Task → shape → chart | AI-shaped workspace over the deterministic rule table: prompt, one clarification, staged local stream with stop, visible reasoning steps, correctable assumptions, approval, citations. No model, no key, no request |
| `/explore/integrity` | Seven traps | Filter by demo; dual-axis flip; pie explosion; all charts `aria-hidden` with tables |
| `/explore/dashboards` | Two audiences, one dataset | Executive view (4 KPI cards + one chart + one request) vs analyst view; evidence tables behind `<details>`; quarterly composition module with 24-row table and local legend |
| `/explore/specialty` | Component evaluation | Four demos: BeUI funnel, treemap, Sankey of funnel losses, donut-vs-bars counterexample — each with a visible table, plus a dated decision register |
| `/learn/[slug]`, `/learn/ar/[slug]` | Source lessons | Twelve source SVGs replaced in place by live modules; the untouched original stays in a `<details>` under each one |
| `/practice` | Defend a choice | 12 scenarios, chapter filter, check/score/reset, explanations link back to lessons |

---

## 4. BeUI integration (summary)

Fourteen registry items are installed after a live audit. Every one is MIT and byte-identical to the
registry; the exact file list and source hash is in `beui-install-log.json`.

| Component | Decision | Why |
|---|---|---|
| `funnel-chart` | **ADOPT** | Ordinal stages are a real curriculum topic; geometry is honest; stages are focusable |
| `treemap` | **ADAPT** | Nested composition is taught; ships only a screen-reader table, so a visible table was added |
| `sankey-chart` | **ADOPT 2026-10-25** | Additive flows show the funnel's loss as area; balances against the same counts |
| `donut-chart` | **ADAPT 2026-10-25** | Kept only as the angle-vs-length counterexample beside sorted bars |
| `composition-chart` | **ADOPT 2026-10-25** | Normalized quarterly mix on `/explore/dashboards`; local legend + visible table added |
| `animated-number`, `adaptive-stepper`, `sortable-stack` | **ADOPT** | Motion primitives used inside the rebuilt figures (KPI value, figure stepper, encoding rank) |
| `prompt-input`, `message`, `streaming-response`, `reasoning-text`, `agent-activity`, `approval-card` | **ADOPT** | The AI-shaped workspace on `/explore/choose` |

The page that owns the copy stays a server component (`metadata` export); formatting callbacks
live in `components/data-viz/specialty-charts.tsx` because functions cannot cross the
server→client boundary. That boundary is the reason the file exists.

Eleven further candidates were considered and deferred or rejected (bump-chart, heat-calendar,
scroll-reveal, tabs, switch, select, range-slider, todo-list, agent-progress, thinking-shimmer,
message-scroller). Details: `beui-component-decision-matrix.md`.

---

## 5. Preserved site behaviour

- Existing routes (`/`, `/work/*`, `/experience`, `/services`, `/lab/*`, `/about`, `/contact`)
  are unchanged.
- NAV gained **Learn** and **Labs**, and the footer gained the section; nothing was removed.
- The homepage gained a “04 — Data Visualization” section; About is now “05”.
- `next.config.ts` still exports statically and keeps the Turbopack CSS rule.
- `wrangler.jsonc` still deploys the `hansa` worker from `./out`.
- `scripts/export-segment-aliases.mjs` still runs after build (113 aliases as of 2026-10-25, now
  including the statistics, fabric and data-visualization dynamic segments).
- The existing `lib/utils.ts` (`cn`) was **not** overwritten by the BeUI installer; the installer
  was written to skip files that already exist unless they are byte-identical.

---

## 6. Performance

The table below is the **2026-10-24 baseline**, kept for trend comparison. Current measurements are
in §0 and supersede it: the site has since gained the statistics and fabric sections, and each of the
twelve figures is its own chunk.

| Measure (2026-10-24 baseline, superseded) | Value |
|---|---|
| `out/` total | 496 files, 16.40 MB |
| HTML | 72 files, 6.16 MB |
| JS | 30 chunks, 1.24 MB |
| CSS | 1 file, 91 KB |
| Figures | 12 SVGs, ~20 KB total |
| Average HTML page | 87.9 KB (median 82.3 KB) |
| Largest HTML page | `/learn/` at 194 KB |
| Client JS on a typical page | ~600 KB uncompressed across 8–9 chunks (shared framework + page chunk) |
| Extra JS on `/explore/specialty` only | +194 KB chunk (`motion` + `@floating-ui/dom` + both charts) |

Current: **997 files / 43.0 MB**, HTML 116 files / 14.7 MB / 130 KB average, JS 93 chunks /
4.75 MB, CSS 2 files / 160 KB. The file count grew because two unrelated sections shipped in
parallel and because `next/dynamic` gives each figure a separate chunk.

The 8 MB of `.txt` flight payloads are Next.js RSC output; they are not requested by a browser
navigating normally. They are retained because the static export needs them for client-side
navigation.

**Bundle isolation:** each figure is a separate `next/dynamic` chunk selected by
`components/data-viz/live-figure.tsx`, so `/learn/foundations` downloads the Anscombe module and not
the other eleven. The BeUI charts are reachable only from `specialty-charts.tsx`,
`composition-demo.tsx`, `funnel-flow.tsx` and `angle-lab.tsx`, which are imported only by
`/explore/specialty` and `/explore/dashboards`. Lessons and the six core labs do not load `motion`
or `@floating-ui/dom` for their own sake.

---

## 7. Reproduce / operate

```powershell
# 1. Import the local export (offline, idempotent)
npm run import:data-viz -- --dry-run     # report only
npm run import:data-viz                  # write pages.json, manifest, figures, inventory

# 2. Regenerate synthetic datasets
npm run build:data-viz

# 3. Validate content, coverage, figures, datasets, built HTML
npm run validate:data-viz                # content only
npm run validate:data-viz -- --check     # + dataset freshness + built HTML checks

# 4. Unit tests
npm test

# 5. Quality gates
npm run lint
npx tsc --noEmit
npm run build

# 6. Deploy
npm run deploy                           # build + segment aliases + wrangler deploy
```

The source folder is overridable with `$env:DATA_VIZ_EXPORT` or `--source "<path>"`.

---

## 8. Deviations, limitations, and honest gaps

| Item | Status | Detail |
|---|---|---|
| Canonical hub page | **Missing from export** | Represented by `/learn` and `/learn/overview`, labelled editorial |
| Audience & Story lesson | **Missing from export** | `MISSING`; authored lesson, labelled |
| Applied Use Cases lesson | **Missing from export** | `MISSING`; authored synthetic scenarios, labelled |
| Six core charts as BeUI components | **Not adopted** | Hand-built to teach the decisions the library hides; documented in `beui-chart-mapping.md` |
| Automated screen-reader test (NVDA/JAWS/VoiceOver) | **NOT_TESTED** | No screen reader available in this environment; DOM semantics and handler code were inspected instead. Not equivalent to a screen-reader audit |
| axe automated a11y score | **PASS (Chromium/Edge, reduced motion)** | Full sweep 2026-10-25: 24 routes × 3 viewports, 0 violations at WCAG 2.0/2.1/2.2 A+AA. Two findings were fixed on the way (treemap label contrast, composition legend label-in-name). See `qa-report.md` |
| Lighthouse performance score | **NOT_TESTED** | No Lighthouse run in this pass; only file-size measurements from `out/` |
| Cross-browser (Firefox/Safari) | **NOT_TESTED** | Verification was Chromium/Edge only |
| Real device touch testing | **NOT_TESTED** | Touch addressed structurally (native controls and buttons, visible tables); no phone or tablet was used |
| Custom domain | **Blocked** | No Cloudflare zone; `workers.dev` only |
| GitHub remote / CI | **Blocked** | No remote or credentials; workflow prepared but inactive |
| Deployment of this revision | **PASS (2026-10-25)** | Worker `hansa` version `2e8528b1-8fed-4be7-9ebd-728c17c7f5ce`; live origin re-audited after deploy (5 routes × 3 viewports, 0 violations) |
| Page weight | **CHECK** | Average HTML is now 130 KB (was 87.9 KB) because lesson pages inline figure markup plus the RSC flight payload; acceptable but worth watching |

Nothing above is claimed as passing. The QA report (`qa-report.md`) records the exact evidence
for every PASS.
