# Content provenance — Notion “Data Visualization” export → Hansa

This document records exactly where every published word in the Data Visualization section
came from, what was changed on the way in, and what is new. It is the human-readable companion
to `html-export-inventory.json` (machine inventory) and `local-source-audit.md` (source audit).

Last reviewed 2026-10-25 for the figure rework, and deployed the same day to
`https://hansa.amir-portfolio.workers.dev/` (Worker version `2e8528b1-8fed-4be7-9ebd-728c17c7f5ce`).

---

## 1. Source of record

| Field | Value |
|---|---|
| Source root | `D:\BeUI\amir-portfolio\Data Visualization` (local Notion HTML export) |
| HTML pages | 25 |
| SVG figures | 12 |
| Other sibling assets | 0 |
| Source plain text | 69,888 characters |
| Source bytes | 694,765 |
| Export observed range | 2026-10-23T20:27:51.486Z → 2026-10-23T20:27:52.917Z |
| Network use during import | none |
| Duplicate files | none (byte-identical or title-identical) |
| Unresolved relative links / assets | none |

All 25 pages and 12 figures are hash-pinned in
`docs/data-visualization/html-export-inventory.json`. The importer refuses to run a partial
import: if a referenced figure is missing it fails rather than writing a page with a broken
image.

---

## 2. Complete mapping (25 pages, 1:1)

Every exported page is used exactly once. “Coverage” is machine-checked by
`npm run validate:data-viz`; the validator fails if a page is unmapped, mapped twice, or if a
lesson claims a source page that does not exist.

| # | Source page (slug) | Source title | Lang | Chars | Destination route | Chapter | Coverage |
|---|---|---|---|---:|---|---|---|
| 1 | `ar-comprehensive` | 📊 Data Visualization — Comprehensive & Deep Reference | EN | 4,023 | `/learn/overview/` | — | COVERED |
| 2 | `foundations` | Foundations & Decision Framework | EN | 3,198 | `/learn/foundations/` | 01 | COVERED |
| 3 | `core-chart-types` | Core Chart Types & Scales | EN | 10,997 | `/learn/core-chart-types/` | 03 | COVERED |
| 4 | `advanced-multivariate` | Advanced & Multivariate Techniques | EN | 6,617 | `/learn/advanced-multivariate/` | 04 | COVERED |
| 5 | `color-perception` | Color Theory for Data Visualization | EN | 2,145 | `/learn/color-perception/` | 05 | COVERED |
| 6 | `accessibility-color-qa` | Accessibility, Contrast & Color QA | AR | 932 | `/learn/accessibility-color-qa/` | 06 | COVERED |
| 7 | `visual-integrity` | Visual Integrity, Pitfalls & Ethics | EN | 5,715 | `/learn/visual-integrity/` | 07 | COVERED |
| 8 | `statistical-traps` | Statistical Interpretation Traps for Visualization | AR | 1,998 | `/learn/statistical-traps/` | 07 | COVERED |
| 9 | `visual-atlas` | Visual Atlas — Teaching Charts & Figure Pack | EN | 4,773 | `/learn/visual-atlas/` | 07 | COVERED |
| 10 | `chart-selection` | Chart Selection Matrix & Anti-Patterns | AR | 2,024 | `/learn/chart-selection/` | 08 | COVERED |
| 11 | `dashboard-design` | Dashboard Design, Composition & Cognitive Load | AR | 1,494 | `/learn/dashboard-design/` | 08 | COVERED |
| 12 | `power-bi-playbook` | Power BI Visualization Playbook | AR | 2,811 | `/learn/power-bi-playbook/` | 09 | COVERED |
| 13 | `interview-bank` | Data Visualization Interview Master Bank | AR | 1,962 | `/learn/interview-bank/` | 10 | COVERED |
| 14 | `quick-reference` | Quick Reference & Exam Prep | EN | 4,765 | `/learn/quick-reference/` | 10 | COVERED |
| 15 | `ar-histogram` | 📊 Histogram — المدرج التكراري | AR | 1,687 | `/learn/ar/histogram/` | 03 | COVERED |
| 16 | `ar-box-plot` | 📊 Box Plot — مخطط الصندوق | AR | 1,097 | `/learn/ar/box-plot/` | 03 | COVERED |
| 17 | `ar-scatter-plot` | 📊 Scatter Plot — مخطط التشتت | AR | 1,109 | `/learn/ar/scatter-plot/` | 03 | COVERED |
| 18 | `ar-line-plot` | 📊 Line Plot — الرسم الخطي | AR | 1,025 | `/learn/ar/line-plot/` | 03 | COVERED |
| 19 | `ar-bar-plot` | 📊 Bar Plot — مخطط الأعمدة | AR | 1,119 | `/learn/ar/bar-plot/` | 03 | COVERED |
| 20 | `ar-dot-plot` | 📊 Dot Plot — مخطط النقاط | AR | 932 | `/learn/ar/dot-plot/` | 03 | COVERED |
| 21 | `ar-core-charts` | 📊 الجزء 3: الرسوم الأساسية (Univariate & Bivariate Charts) | AR | 450 | `/learn/ar/core-charts/` | 03 | COVERED |
| 22 | `ar-color` | 🎨 الجزء 6: الألوان في Data Visualization | AR | 1,147 | `/learn/ar/color/` | 05 | COVERED |
| 23 | `ar-tips-interview` | 🎯 نصائح وTricks عملية + بنك أسئلة المقابلات (BI / Power BI) | AR | 5,759 | `/learn/ar/tips/` | 10 | COVERED |
| 24 | `ar-reading-paths` | مسارات قراءة مقترحة (Beginner → Advanced) | AR | 994 | `/learn/ar/reading-paths/` | 10 | COVERED |
| 25 | `ar-references` | أفضل المراجع العالمية (Curated References) | AR | 1,115 | `/learn/ar/references/` | 10 | COVERED |

Totals: 25 / 25 pages, 69,888 / 69,888 source characters.

### Notes on two mapping decisions

- **`ar-comprehensive` is English content despite its filename prefix.** The file is titled
  “📊 Data Visualization — Comprehensive & Deep Reference” and is written in English. It is
  published at `/learn/overview/` as the library map. The slug prefix comes from the export's
  file naming, not from the language of the page.
- **`accessibility-color-qa`, `statistical-traps`, `chart-selection`, `dashboard-design`,
  `power-bi-playbook` and `interview-bank` are labelled `AR` in the inventory because Arabic is
  the majority language of the page.** Several are mixed-language documents (English headings,
  Arabic explanations, English tables). Each page ships a `direction` value, and the renderer
  applies `dir` per block, so an English paragraph on an Arabic page is still LTR. The site
  never renders an English page RTL.

---

## 3. Content that is new (not from the export)

Two canonical pages referenced by the curriculum are **absent from the export**: the Notion hub
page and the “Audience, Big Idea & Action” and “Applied Use Cases” pages. Rather than invent
Notion prose and pass it off as transcription, both are authored lessons, labelled in the UI:

| Route | Chapter | Status | How it is labelled |
|---|---|---|---|
| `/learn/audience-story/` | 02 | `MISSING` source | Page opens with an “Editorial lesson” callout; chapter card shows the coverage badge |
| `/learn/applied-cases/` | 10 | `MISSING` source | Same; all scenarios are synthetic and marked |

Everything else that is new is instrumentation, not prose:

| Added artefact | Where | Provenance |
|---|---|---|
| Six interactive chart labs | `/explore/charts/*` | New; synthetic data generated by `scripts/build-datasets.mjs` |
| Twelve live figure modules | `/learn/*`, `/learn/ar/*` | New interaction and derived statistics over the source figures' own claims; the original SVG is still rendered, unchanged, in a `<details>` under each module |
| Chart decision workspace | `/explore/choose` | New; deterministic rule table in `lib/data-viz/decision.ts` + `assistant.ts`, unit-tested; no model or network call |
| Integrity Lab (7 demos) | `/explore/integrity` | New demonstrations of traps taught by `visual-integrity` / `statistical-traps` |
| Dashboard anatomy (2 audiences) | `/explore/dashboards` | New; teaches `dashboard-design` with synthetic numbers |
| Quarterly composition module | `/explore/dashboards` | New; BeUI `composition-chart` over `COMPOSITION_SERIES` in `lib/data-viz/figure-data.ts` |
| Specialty chart audit (4 demos) | `/explore/specialty` | New; evaluates four BeUI components against the curriculum — funnel, treemap, Sankey of funnel losses, donut-as-counterexample |
| Practice bank (12 scenarios) | `/practice` | New |
| Chapter framing copy | `/learn`, `/learn/chapter/*` | New connective text; no source claims |
| Import method page | `/learn/method` | New; describes this pipeline |

No text from the export was rewritten to fit the new UI. Where the site needed a transition
sentence, it lives in `curriculum.json` / editorial JSON as new copy and is visually separated
from the transcribed blocks.

---

## 4. Transformations applied to source text

The importer converts Notion HTML into sanitized typed JSON (`content/data-viz/pages.json`).
Nothing in that file is rendered as raw HTML.

| Source construct | Transformation | Loss? |
|---|---|---|
| Headings | `heading` block with level + slug anchor | none |
| Paragraphs / quotes | `paragraph` / `quote` block with inline marks | none |
| Bold / italic / code / links | inline mark spans; links classified as internal / external / notion / mailto | none |
| Bulleted + numbered lists | `list` block with nested items | nesting preserved |
| Tables | `table` block: headers + rows, cells keep inline marks | none |
| Callouts | `callout` block with tone + nested blocks | none |
| Toggles | `toggle` block with summary + nested blocks | none |
| Equations | `equation` block (TeX source preserved) | none |
| Code / Mermaid | `code` block with language | none |
| Images | `figure` block with local `src`, intrinsic size, SHA-256, alt text | Notion CDN URL replaced by local path |
| Emoji / icons | preserved as text | none |
| Inline `style` attributes | dropped | purely visual; themes come from the site |
| Notion wrapper divs / classes | dropped | structural only |

### Figure alt text

The export's SVGs have no `<title>` or `<desc>`. Alt text is derived deterministically, in this
order:

1. an authored `alt` attribute, if the export had one (none did);
2. the SVG's own first `<text>`/`<title>` headline (e.g. “Simpson - the aggregate can reverse
   the subgroups”);
3. the visible `<figcaption>`;
4. a humanised filename.

Result: 29 figure instances across 12 unique files, all with non-empty alt text; the validator
requires at least 12 characters and fails on an empty string. Each figure also carries intrinsic
`width`/`height` (prevents layout shift).

### Live figures added above the originals (2026-10-25)

Each of the twelve unique source SVGs is now preceded by an interactive module
(`components/data-viz/figures/*`, registry in `lib/data-viz/figures.ts`). The rules that keep
provenance intact:

- The original `<img>` is **not replaced**. It renders unchanged inside a `<details>` labelled as
  the source figure, under the live module.
- Every module names the source figure, states its objective, and separates two different claims:
  `provenance` (where the *figure* came from) and `dataNote` (where the *numbers* come from —
  published, derived, or synthetic).
- Where the source figure makes a qualitative claim (the encoding ranking, the pipeline stages, the
  dashboard tiers), the module reproduces that claim and adds no invented measurement. Where the
  module computes something (Anscombe's four summaries, the Simpson reversal, the spread of a
  mixture), the number is computed from a labelled dataset and unit-tested.
- No lesson page claims the live numbers are source data. Synthetic and derived figures are
  labelled in the module caption, in `figures.ts`, and in `visualization-specs.md`.

The three new demos on `/explore/specialty` and `/explore/dashboards` are additive: they cite the
lesson they serve and do not edit any source block.

### Mixed-direction pages

`page.lang` is a coarse majority label. `page.direction` is authoritative. The renderer sets
`dir` on the article and on each block, so:
- an Arabic lesson is fully RTL (`<article lang="ar" dir="rtl">`);
- an English lesson containing Arabic quotations keeps RTL only on those blocks.

---

## 5. What was deliberately not changed

- **Educational claims, cautions, and citations** are reproduced as written. No recommendation
  in the source was softened, and no “best practice” was invented.
- **Arabic wording** is untouched, including mixed English terms (e.g. “bin”, “outlier”),
  because that is how the author wrote it for that audience.
- **Source tables** are reproduced cell-for-cell, including their original units.
- **Figure pixels** are copied byte-for-byte. The importer only *rejects* unsafe SVGs; it does
  not edit them. File hashes in the inventory prove the bytes are unchanged.
- **Source page order** is preserved inside each lesson; only the site's chapter order wraps
  around it.

---

## 6. Synthetic data disclosure

Every number in the interactive labs, dashboards, integrity demos, and practice scenarios is
synthetic. It is generated deterministically from seed `20261023` by
`scripts/build-datasets.mjs`, and each lab renders a `SyntheticNote` plus a caption that says so.
No employer data, applicant data, revenue figure, or client metric appears anywhere in this
section.

The datasets are crafted to teach specific lessons, and those properties are asserted in tests:

| Dataset | Property the tests assert |
|---|---|
| `hiring-funnel` | Monotonically decreasing stages; 12,400 → 512 |
| `channel-mix` | Shares sum to exactly 100 |
| `revenue-mix` | Leaf values sum to 1,960 |
| `same-mean` | Four groups with mean 50 but visibly different spread |
| `simpson` | Treatment wins in both segments, loses when pooled |

### Live-figure data provenance

The twelve figure modules draw on three kinds of data, and each module states which one it uses:

| Provenance | Figures | Source of the numbers |
|---|---|---|
| **sourced** | `fig-encoding`, `fig-quartet` | The source figure's own claim / Anscombe's published quartet (1973). Statistics are recomputed from the points, not typed |
| **derived** | `fig-pipeline`, `fig-dual-axis`, `fig-palette`, `fig-dashboard`, `fig-kpi` | The source figure's stage or category list, plus editorial examples and `DATASETS` series |
| **synthetic** | `fig-histogram`, `fig-same-mean`, `fig-simpson`, `fig-uncertainty`, `fig-baseline` | Seeded teaching samples in `lib/data-viz/figure-data.ts`; every property the lesson relies on is asserted in `tests/data-viz/figures.test.mjs` |

The three added demos use `COMPOSITION_SERIES` (eight synthetic quarters),
`DATASETS["hiring-funnel"]` (the published synthetic funnel, with rejection flows derived by
`funnelLinks()`), and `CHANNEL_MIX` (five synthetic shares). None of them introduces a new business
or person.

---

## 7. Coverage accounting

| Bucket | Count |
|---|---:|
| Source pages published (COVERED) | 25 |
| Editorial lessons with no source (MISSING) | 2 |
| Source pages excluded or left unplaced | 0 |
| Source figures published | 12 |
| Figure instances in lessons | 29 |
| Source pages with at least one figure | 10 |
| Source figures with a live module above them | 12 / 12 |
| Registry components installed (all MIT) | 14 |

The validator (`npm run validate:data-viz`) enforces that the 25 source slugs in
`curriculum.json` equal the 25 slugs in `pages.json` as sets, and that each appears once.
