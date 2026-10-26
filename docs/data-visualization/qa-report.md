# QA report — Data Visualization rework (2026-10-25)

Evidence for every gate claimed in `implementation-report.md` and `visualization-specs.md`. Each row
is a command that was actually run against the current working tree, in this order, on
2026-10-25.

**Environment:** Windows, Node 22.23.3, Next.js 16.4.3, static export to `out/`, local Microsoft
Edge (Chromium) via `playwright-core`, and — for the post-deploy pass — the live origin
`https://hansa.amir-portfolio.workers.dev/`.

---

## 1. Gate summary

| # | Gate | Command | Result | Evidence |
|---|---|---|---|---|
| G1 | Lint | `npx eslint .` | **PASS** | exit 0, 0 errors, 0 warnings |
| G2 | Types | `npx tsc --noEmit` | **PASS** | exit 0 |
| G3 | Unit + integration tests | `npm run test:all` | **PASS** | 129/129 (62 data-viz, 18 statistics, 29 fabric, 20 content) |
| G4 | Content + built-HTML validator | `node scripts/validate-data-viz.mjs --check` | **PASS** | 3,337 assertions, 0 warnings |
| G5 | Static build | `npm run build` + `postbuild` | **PASS** | 116 HTML pages, 113 segment aliases |
| G6 | Browser sweep | `node scripts/qa-browser.mjs` | **PASS** | 72 pages, 0 axe violations, 0 overflow, 0 console errors, 0 failed requests |
| G7 | Reference integrity | `node scripts/verify-agent-reference.mjs` | **PASS** | 13 active hashes, entry paths, router v1.1, rubric weights, 6 intake hashes |
| G8 | Deploy | `npm run deploy` | **PASS** | Worker `hansa` version `2e8528b1-8fed-4be7-9ebd-728c17c7f5ce`; 533 assets uploaded |
| G9 | Live re-audit | `node scripts/qa-browser.mjs --base https://hansa.amir-portfolio.workers.dev --only …` | **PASS** | 5 routes × 3 viewports, 0 axe violations, 0 overflow, 0 console errors, 0 failed requests |

Test breakdown:

| Suite | Tests | Result |
|---|---:|---|
| `tests/data-viz` (chart math, decision, figures, assistant) | 62 | PASS |
| `tests/statistics` | 18 | PASS |
| `tests/fabric` | 29 | PASS |
| `tests/content` | 20 | PASS |
| **Total** | **129** | **PASS** |

Build measurements (`out/`):

| Measure | Value |
|---|---|
| Files | 997 |
| Total size | 43.0 MB |
| HTML | 116 files, 14.7 MB, 130 KB average |
| JS | 93 chunks, 4.75 MB |
| CSS | 2 files, 160 KB |
| Segment payload aliases | 113 |
| Source figure SVGs | 12 files, 23.5 KB (unchanged) |

---

## 2. Browser sweep — what was checked

`scripts/qa-browser.mjs` serves `out/` from a local port and, for each route × viewport, loads the
page in Edge with `reducedMotion: "reduce"`, then checks:

- HTTP status and render (no crash, no error page);
- horizontal overflow at 320/390/1280 px;
- `console.error` and page errors;
- failed network requests;
- axe-core with the WCAG 2.0/2.1/2.2 A+AA tag set.

Routes: 24, including the four added for this rework — `/explore/choose/`, `/explore/specialty/`,
`/explore/dashboards/`, `/learn/foundations/`. Viewports: 320, 390, 1280. Total 72 page loads.

**Final result:** 72 pages checked, 0 non-200/crashed, 0 overflow, **0 axe violations**, 0 console
errors, 0 failed requests.

Machine-readable output: `docs/upgrade/qa/report.json` (screenshots alongside it).

### Route-specific findings

| Route | What was exercised | Result |
|---|---|---|
| `/learn/foundations/` | Anscombe live figure + original SVG disclosure; caption contrast | PASS after the caption fix (§3.1) |
| `/explore/choose/` | Prompt input, clarification turn, streamed answer, stop, assumption controls, approval card, `#rules` anchor | PASS; no console errors on hydration |
| `/explore/specialty/` | Funnel, treemap, Sankey with drop toggle, donut + bars, four visible tables, decision register | PASS after two fixes (§3.2, §3.3) |
| `/explore/dashboards/` | Composition module: view toggle, period selection, 24-row table, local legend | PASS after the legend replacement (§3.2) |
| `/explore/integrity/`, `/explore/charts/` | Regression only (core labs unchanged) | PASS |
| `/learn/statistics/cheatsheet/` | Duplicate `<h1>` regression found by the validator, not axe | PASS after §3.4 (validator only; page not in the axe sweep) |

---

## 3. Defects found and fixed during this pass

Four defects were found by the gates while validating the rework. Two were in our own copy, two were
in third-party markup and were fixed at the site level rather than by forking the registry file.

### 3.1 Live-figure caption contrast — our copy

`components/data-viz/live-figure.tsx` rendered the caption at `text-muted-foreground/80` and 11 px.
On `/learn/foundations` axe reported `color-contrast` at all three viewports (3 nodes on 3 pages).
Changed to full `text-muted-foreground`. Re-run: 0 violations.

### 3.2 Composition legend label-in-name — vendored component, fixed locally

The vendored `CompositionChartLegend` renders:

```tsx
aria-label={`Highlight ${row.name}`}
```

while the visible row text is `{row.name}` plus `{share}%`. axe flagged WCAG 2.5.3
`label-content-name-mismatch` on all three series at all three viewports (9 nodes on 3 pages).
A voice-control user cannot say “68.9%”, so the visible text is not in the accessible name.

Fix: `components/data-viz/composition-demo.tsx` composes its own `MixLegend` from the component's
public `useCompositionChart()` hook, with `aria-label="{name} {share} - select to highlight"` and
the same pin/hover/focus behaviour. `components/charts/**` is unchanged. Re-run: 0 violations.

### 3.3 Treemap value-label contrast — vendored component, fixed locally

The registry tile dims its value line to `opacity-80`; white on the teal tile measured **4.47:1** at
10–12 px against a 4.5:1 floor. axe flagged
`button[data-treemap-tile="implementation"] .opacity-80` at all three viewports.

Fix, scoped and documented in `app/globals.css`:

```css
[data-treemap-tile] .opacity-80 { opacity: 1; }
```

The registry file stays byte-identical and hash-verifiable. Re-run: 0 violations.

### 3.4 Duplicate `<h1>` on `/learn/statistics/cheatsheet` — pre-existing, cross-area

Found by the site-wide validator, not by this rework: the page header and the printable sheet both
rendered an `<h1>`. The print sheet's repeated title is now an `<h2>` with the same styling. No
visual change. This is disclosed because it is outside the Data Visualization section and was
touched only to make the shared gate pass.

---

## 4. Test coverage added for this rework

| File | Tests | What it locks down |
|---|---:|---|
| `tests/data-viz/figures.test.mjs` | 14 | All 12 registry `src` files exist; every figure has an objective and data note; seeded samples are deterministic; Anscombe's published statistics hold within tolerance; `countModes` returns 1 peak for unimodal and ≥2 for bimodal; `0` for an empty series; constants clamp correctly |
| `tests/data-viz/assistant.test.mjs` | 12 | Task/shape classification; scatter forces `relationship`; comparison + continuous-by-category without distribution words → `category-value`; time-unit words are not counted as categories; clarification is asked once; `overrideFor()` re-runs the same rules; shape confidence and assumptions |
| `tests/data-viz/chart-math.test.mjs` + `decision.test.mjs` | 36 | Unchanged core math and decision table (pre-existing) |

`figure-data.ts` is imported directly by the Node test runner (no alias resolution), which is why it
has no `@/` imports and no React.

---

## 5. Accessibility evidence — and its limits

### What was verified

- **axe-core**, WCAG 2.0/2.1/2.2 A+AA, 24 routes × 3 viewports, reduced motion: **0 violations**.
- **DOM semantics**: one `<h1>` per built page (validator, 116 files); every chart has an accessible
  name; every control is a native `<button>`, `<input type="range">`, `<input type="checkbox">`,
  `<select>` or `<details>`; every figure has a visible table or an equivalent text readout.
- **Keyboard handler review**: roving tabindex in the treemap, arrow keys in the donut legend,
  Escape dismissal in the tooltips, focus-visible rings preserved.
- **Reduced motion**: the sweep runs with `prefers-reduced-motion: reduce`; no animation-dependent
  content is hidden and no chart depends on motion to be read. Library branches were read in source.
- **Theme**: chart colours come from `--chart-1…5`; no module hardcodes a hex value. The dark sweep
  (`npm run qa:browser:dark`) exists and is runnable.

### What was NOT verified — do not read the above as more than it is

| Item | Status | Why |
|---|---|---|
| Screen reader (NVDA / JAWS / VoiceOver) | **NOT RUN** | None available in this environment. Accessible names and table fallbacks were inspected in the DOM; that is not a screen-reader audit |
| Firefox / Safari | **NOT RUN** | Only Chromium (Edge) available |
| Real phone / tablet touch | **NOT RUN** | Touch is addressed structurally (native controls, visible tables), not tested on hardware |
| Tab traversal through the sweep | **NOT RUN (harness limit)** | The automation harness does not deliver Tab. Native elements and `tabIndex` were confirmed in the DOM; trap/order defects would not be caught |
| Live range-slider changes via `browser.press` | **NOT RUN (harness limit)** | `browser.press` no longer changes a live `<input type="range">` value in this harness. Slider → derived-result behaviour is covered by unit tests on the pure functions, not by simulated input |
| Lighthouse score | **NOT RUN** | Not installed in this pass; only file-size and bundle-isolation measurements exist |
| Colour-vision simulation | **NOT RUN** | Palette is the documented Okabe–Ito subset; no simulator was run |

The honest summary: **automated WCAG checks pass and the DOM is structurally sound; human assistive
technology testing has not happened.** Educational quality (does the interaction actually teach?) is
a separate question from accessibility and was not measured with learners.

---

## 6. Per-page visual/domain QA

| Route | Visual check (320/390/1280) | Domain check |
|---|---|---|
| `/learn/foundations` | Anscombe small multiples, emphasis, disclosure open/closed | Four computed summaries match published values to rounding; the invariant is asserted in tests |
| `/learn/statistical-traps` | Same-mean strip, Simpson bars, uncertainty intervals | Mean invariance, both segment rates, and the reversal are unit-tested |
| `/explore/dashboards` | Composition bars/area at all three widths; table overflow | Shares sum to 100% per quarter (±1e-9); Q4 25 readout recomputed by hand |
| `/explore/specialty` | Wide Sankey scrolls, does not clip; treemap labels legible; four tables | Funnel counts match the dataset; Sankey balances per node; channel shares sum to 100; arc = share × 360 |
| `/explore/choose` | Long prompt, long answer, stop mid-stream, 320 px conversation column | The assistant's recommendation equals `decide()` for the same task/shape; clarification path covered by tests |

Domain QA was done by recomputing the displayed numbers from the datasets by hand and by asserting
the same properties in tests. It is **not** a subject-matter review by a third party, and no learner
was observed using the modules.

---

## 7. Performance observations

No Lighthouse run. What is measured:

- Each of the twelve figures is a separate `next/dynamic` chunk; `/learn/foundations` does not load
  the Sankey, donut or composition modules.
- `motion` + `@floating-ui/dom` are reachable only from `/explore/specialty` and
  `/explore/dashboards`.
- Average HTML is 130 KB (from 87.9 KB before the rework) because lesson pages inline figure markup
  plus the RSC flight payload. Flagged as `CHECK` in `implementation-report.md` §8, not as a failure.
- 0 console errors and 0 failed requests across 72 loads.

---

## 8. Rollback

All work is uncommitted in `D:\BeUI\amir-portfolio` (the repository has no git remote). To roll back
to the 2026-10-24 state:

1. Restore the twelve lesson pages' `figure` blocks by removing the `LiveFigure` branch in
   `components/data-viz/source-blocks.tsx` (the original `<img>` path is still there).
2. Delete the added modules: `components/data-viz/live-figure.tsx`,
   `components/data-viz/figures/`, `components/data-viz/composition-demo.tsx`,
   `components/data-viz/funnel-flow.tsx`, `components/data-viz/angle-lab.tsx`.
3. Revert `/explore/specialty` and `/explore/dashboards` page sections, and `choose-assistant.tsx` to
   the form-based version.
4. Remove the three registry item groups from `components/charts/` and `components/agents/`, or keep
   them unreferenced (they are MIT and inert when unimported).
5. Keep `app/globals.css`'s `[data-treemap-tile]` rule only if the treemap stays mounted.

Nothing was deleted: every original SVG and every original lesson block is still in place, which is
what makes this rollback cheap.

---

## 9. Live verification after deploy

Deployment was authorized and run on 2026-10-25: `npm run deploy` → build, 113 segment aliases,
`wrangler deploy` to Worker `hansa` (version `2e8528b1-8fed-4be7-9ebd-728c17c7f5ce`, 533 assets).

Immediately afterwards the same harness was pointed at the live origin:

```
node scripts/qa-browser.mjs --base https://hansa.amir-portfolio.workers.dev \
  --only /,/explore/choose/,/explore/specialty/,/explore/dashboards/,/learn/foundations/
```

| Check | Result |
|---|---|
| Pages | 15 (5 routes × 320 / 390 / 1280) |
| Non-200 or crashed | 0 |
| Horizontal overflow | 0 |
| axe violations | 0 |
| Console errors | 0 |
| Failed requests | 0 |
| **Result** | **PASS** |

Content spot-checks on the live HTML (status 200 each):

| Route | Expected marker | Found |
|---|---|---|
| `/explore/specialty/` | “Decision register” | yes |
| `/explore/specialty/` | “Additive flow” (Sankey demo) | yes |
| `/explore/dashboards/` | “Composition over time, normalized” | yes |
| `/explore/choose/` | “What the assistant actually does” | yes |
| `/learn/foundations/` | “Original source figure (unchanged)” | yes |

Two of these markers could only come from the new build (the decision register and the Sankey
module), so the deploy is confirmed to be serving this revision rather than the previous one.

The deployed sweep's machine output is preserved as
`docs/upgrade/qa/report-deployed-2026-10-25.json`; the local 72-page report stays at
`docs/upgrade/qa/report.json`.

**What this does not prove:** the live pass covered 5 routes, not all 24 — the remaining 19 were
verified against the identical static export locally, not over the network. Edge/Chromium only, no
screen reader, no Firefox/Safari, no real device, no Lighthouse. CDN/propagation behaviour beyond a
single request per asset was not measured.

---

## 10. Next atomic task

The deploy is done and verified. The next task is not another gate:

**Extend the automated sweep to Tab-order and slider interaction.** Today the harness cannot deliver
Tab and cannot change a live range input, which is why focus order and slider→derived-result
behaviour rest on DOM inspection plus unit tests. A small harness extension (real
`keyboard.press("Tab")` sequence capturing `document.activeElement`, and slider values set through
`fill`/setting `.value` + dispatching `input`) would close the largest remaining verification gap
without touching the site.

Second, smaller: update `docs/agent-reference/START_HERE.md`, which still says
`components/charts/` contains "funnel and treemap source" — a reference-document revision that must
be done with the manifest/hash refresh, not ad hoc.
