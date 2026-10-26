# BeUI component decision matrix

This is the deliberate evaluation the brief asked for: for each page purpose, the chart
components that were genuinely candidates, and the decision taken. The default is **REJECT**;
a component has to earn its place by teaching something the page already promises.

**Registry:** https://beui.dev (live registry, first read 2026-10-23, re-read 2026-10-25)
**License of every item considered:** MIT
**Evidence of adoption:** `docs/data-visualization/beui-install-log.json` (source hashes, file
lists, resolved dependencies)
**Revision:** 2026-10-25. The section below was rewritten after the twelve source SVG figures were
rebuilt as live modules and the decision assistant became an AI-shaped workspace. Rows that changed
keep the earlier decision visible in `beui-chart-mapping.md` and on
`/explore/specialty#register`; nothing here is a permanent ban.

> **Scope note on provenance.** Fourteen items were fetched, read in full, installed and audited:
> `funnel-chart`, `treemap`, `composition-chart`, `sankey-chart`, `donut-chart`, `animated-number`,
> `adaptive-stepper`, `sortable-stack`, `prompt-input`, `message`, `streaming-response`,
> `reasoning-text`, `agent-activity`, `approval-card` (see `beui-integration-qa.md`). The remaining
> candidates were evaluated at the registry-catalog level and **not** installed, so this document
> does not claim anything about their internals beyond what their registry metadata states. They are
> marked “catalog-level review” below.
>
> Items considered and **not** installed after reading their metadata: `heat-calendar` (needs a daily
> series the export does not contain), `scroll-reveal` (decorative motion), `tabs`, `switch`,
> `select`, `range-slider`, `todo-list`, `agent-progress`, `thinking-shimmer`, `message-scroller`
> (duplicates primitives already installed), and a standalone `citations` install (shipped inside
> `streaming-response`).

---

## 1. The gate

A candidate is adopted only if it passes **all** of these:

| # | Gate | Why it matters here |
|---|---|---|
| G1 | The curriculum already teaches this chart's decision | Otherwise the component invents a topic |
| G2 | The encoding is honest for the data shape it would receive | A polished chart of the wrong encoding teaches the wrong thing |
| G3 | Every value is reachable by keyboard **and** by a table | The library default is often hover-only |
| G4 | It respects `prefers-reduced-motion` | Motion is decoration, not information |
| G5 | Contrast holds in both themes | Including dark tiles with white labels |
| G6 | Its runtime cost is isolated to the page that needs it | Lessons must stay dependency-free |
| G7 | No core lab already teaches the same decision better | Avoids duplicate teaching |

---

## 2. Decisions by page purpose

### 2.1 Lesson / article pages — `/learn/[slug]`, `/learn/ar/[slug]`

The job is reading. The source already supplies 29 figure placements over 12 unique SVGs. A *library*
chart here would compete with the prose and (worse) imply the lesson's static numbers are live
metrics. Twelve of those figures were rebuilt as hand-authored interactive modules instead, with the
original SVG kept underneath; that is a rewrite of the site's own drawing, not an adoption.

| Candidate | Decision | Justification |
|---|---|---|
| `treemap` | **REJECT** | A lesson embeds the source's own SVG at the exact place the author put it. Re-drawing it as a live component changes the artefact being cited. |
| `funnel-chart` | **REJECT** | The hiring-funnel discussion is prose + one source figure. A live funnel would also animate numbers the text quotes as fixed. |
| `number-ticker` (motion primitive) | **REJECT** | Animating a sourced statistic makes a citation look like a live metric and adds motion to a reading surface. (The `animated-number` motion primitive is used only inside the rebuilt figure that *teaches* a changing value, never on a sourced statistic.) |
| `bump-chart` | **REJECT** | Catalog-level review. No ranking-over-time lesson in the export, so it would be decoration. |
| `donut-chart` | **REJECT** | Chapter 06 explicitly argues against angle comparisons past a handful of slices. Embedding one in a lesson would contradict the page it sits on. |

**Adopted from the registry: none.** The rebuilt figures use local SVG and the shared kit, so a
lesson's dependency graph does not gain a chart library.

---

### 2.2 The six core chart labs — `/explore/charts/*`

Each lab exists to expose one decision: bin width, Tukey fences, overplotting, trend vs noise,
zero baseline, position vs length.

| Candidate | Decision | Justification |
|---|---|---|
| `treemap` | **REJECT** | Teaches hierarchy, not distribution. Wrong lesson. |
| `funnel-chart` | **REJECT** | Stage subsets, not a continuous distribution; would not respond to the lab's controls. |
| `composition-chart` | **REJECT** | Catalog-level review. Composition is a different task from the six labs; adding it would blur the lab's single lesson. |
| `bump-chart` | **REJECT** | Catalog-level review. Rank change is not what any of the six labs measures. |
| `donut-chart` | **REJECT** | The bar lab's whole point is that length beats angle; a donut in the same section undercuts it. |

**Adopted: none.** Hand-built SVG is the teaching instrument (G2, G7): a library that picks its
own bin width or axis domain would hide the exact knob the lab is about.

---

### 2.3 Chart Decision Assistant — `/explore/choose`

The page is a rule table. The output is a recommendation with a reason, an alternative list, and
a “why not” list. Since 2026-10-25 the surface is an AI-shaped workspace: a prompt, a visible
reasoning trace, a block-by-block reveal, an assumption editor and an approval step — all local.

| Candidate | Decision | Justification |
|---|---|---|
| `funnel-chart` | **REJECT** | Rendering the recommendation as a funnel would imply a sequence the rules do not have. |
| `treemap` | **REJECT** | A treemap of “recommended vs alternatives” would encode nothing; the content is categorical prose. |
| `bump-chart` | **DEFER** | Catalog-level review. Could later show how a recommendation changes as category count rises — but that is a new feature, not this page's job. |
| `donut-chart` | **REJECT** | Contradicts the assistant's own advice when it tells the reader to avoid angle comparisons. |
| `tooltip` (motion primitive) | **REJECT** | The reasons are already visible text. Hiding them behind hover would remove them from the reading order and from print. |
| `prompt-input` | **ADOPT** | The reader states the decision in their own words; the component supplies the labelled textarea, submit/stop states and the keyboard contract. |
| `message` + `streaming-response` | **ADOPT** | The conversation needs a consistent user/assistant row and a reveal that can be stopped. `announce={false}` is set because the surrounding `role="log"` already announces. |
| `reasoning-text` | **ADOPT** | Shown only while the local rule table runs, and it names the steps rather than pretending to think. |
| `agent-activity` | **ADOPT** | Lists the exact steps that ran (task match, shape match, rule applied) so the "reasoning" is auditable. |
| `approval-card` | **ADOPT** | Turns the recommendation into a human decision: build, ask for exact values, or reject because the task is unclear. |
| `citations` | **ADOPT** (ships inside `streaming-response`) | Every claim links to a page on this site; no third-party source is implied. |
| `thinking-shimmer`, `agent-progress`, `message-scroller` | **REJECT** | Duplicate capability already covered by the five installed primitives; more motion, no more teaching. |

**Adopted: the six agent primitives, no chart component.** The assistant's credibility comes from
determinism and visible reasoning, not from a picture — and the primitives make that reasoning
legible without a model provider.

---

### 2.4 Integrity Lab — `/explore/integrity`

Seven demos that must be **deliberately wrong**: a truncated axis, an inverted dual axis, a
Simpson reversal, four same-mean groups, a cherry-picked window, an exploded pie, and circles
scaled by radius instead of area.

| Candidate | Decision | Justification |
|---|---|---|
| `donut-chart` | **REJECT** | A well-built donut would sanitize the exact pie distortion being demonstrated. The demo must be authored, not imported. |
| `funnel-chart` | **REJECT** | The Simpson demo needs pooled vs segmented bars; a funnel would restate the data as a pipeline that does not exist. |
| `treemap` | **REJECT** | The circle-area demo is about radius vs area; a treemap would replace the error with a correct encoding and destroy the lesson. |
| `bump-chart` | **DEFER** | Catalog-level review. A rank-reversal demo is plausible future work, but the current seven already cover the source chapter. |
| `composition-chart` | **REJECT** | Catalog-level review. Composition is not one of the seven traps. |

**Adopted: none.** This is the one page where a library component would be actively harmful:
the teaching artefact must contain the mistake.

---

### 2.5 Dashboard anatomy — `/explore/dashboards`

The lesson is that two audiences need two different pages built from one dataset, and that “two
charts are usually enough”.

| Candidate | Decision | Justification |
|---|---|---|
| `treemap` | **DEFER** | The analyst view already carries a trend plus a composition table. A treemap would add a third visual and weaken the “two charts” argument the page is making. |
| `funnel-chart` | **REJECT** | The executive view is four KPI cards + one trend + one exception + one request. A funnel would be a fifth thing to read. |
| `composition-chart` | **ADOPT · 2026-10-25** | The earlier DEFER said “only if it ships a table (G3)”. It does not, so a visible 24-row table was added. G1: normalized composition over time is the dashboard chapter's own example. G2: shares are computed per period, gaps stay gaps. G4: springs honour `useReducedMotion`. G5: chart tokens. G7: mounted below the two views as a third module, not inside them. |
| `donut-chart` | **REJECT** | The page teaches hierarchy and scan path; the mix is already a sorted table, which is the stronger encoding. |
| `number-ticker` (motion primitive) | **REJECT** | The KPI cards carry direction, window, and target. Animating the number adds motion and delays the reading of a static figure. |

**Adopted: 1 (`composition-chart`).** The two dashboard views keep their evidence tables behind
`<details>`; the composition module ships its own visible table, its own readout and its own local
legend, because the vendored legend's `Highlight {name}` label fails WCAG 2.5.3 (see `qa-report.md`).

---

### 2.6 Specialty chart audit — `/explore/specialty`

This is the only page whose *purpose* is to evaluate components, so it is the only page allowed
to host them.

| Candidate | Decision | Justification |
|---|---|---|
| `funnel-chart` | **ADOPT** | G1: ordered subsets are taught in chapter 03 and the hiring-funnel dataset is a real funnel. G2: stage widths are proportional to counts; percentages are step and total, both labelled. G3: **shipped no table** — a visible table was added. G4: `useReducedMotion` collapses the entry animation. G5: stage colours come from the site chart palette. G6: isolated to this route. G7: no core lab draws a funnel. |
| `treemap` | **ADAPT** | G1: nested parts-of-whole is taught. G2: tile area is proportional to value; the layout is verified against a total of 1,960. G3: ships a **screen-reader-only** table, which is not enough for sighted keyboard users, so a visible table was added. G5: the dark tile palette is kept; one label opacity is overridden locally to clear 4.5:1 (the registry file is untouched). G6: same isolated chunk as the funnel. G7: it is the only composition chart in the section. |
| `sankey-chart` | **ADOPT · 2026-10-25** | The earlier DEFER was correct at the time: no flow dataset and no flow lesson. Both changed — `funnelLinks()` derives additive flows from the same counts and a balance test, and the page now asks a flow question the funnel cannot answer ("where does the loss go?"). G2: every node's outgoing links equal its stage count. G3: ships an sr-only table; a visible flow table was added. G4: honours reduced motion. G7: the funnel answers "what share survives?", the Sankey answers "where did it go?" — different questions, same route. |
| `donut-chart` | **ADAPT · 2026-10-25** | The earlier REJECT still governs the *recommendation*: this site does not propose angles for ranking. It is adopted only as the counterexample in Demo 04, beside a sorted zero-baseline bar panel, so the reader tests the chapter's claim instead of trusting it. The closest-pair readout quantifies the difficulty (3 points = 10.8° of arc). |
| `bump-chart` | **DEFER** | Catalog-level review. Legitimate specialty, but not in the ten-chapter spine; adopting it would require inventing a ranking lesson. |
| `composition-chart` | **ADOPT elsewhere** | Adopted on `/explore/dashboards`, not here. Mounting it twice would split one teaching idea across two routes; the decision register on the page says so. |

**Adopted: 4 (two ADOPT, two ADAPT).** Every one needed a table added; none was adopted on its
default output. The funnel and the Sankey share a dataset on purpose — the comparison between them
is the lesson.

---

### 2.7 Practice bank — `/practice`

Twelve scenarios, four options each, a score, and an explanation with links back to the lesson.

| Candidate | Decision | Justification |
|---|---|---|
| `treemap` | **REJECT** | The questions are text; a chart on the page would leak the answer for chart-identification items. |
| `funnel-chart` | **REJECT** | Same reason: the scenario describes the data, the reader must choose the encoding. |
| `bump-chart` | **REJECT** | Catalog-level review. No question depends on rank change. |
| `donut-chart` | **REJECT** | One question asks why a donut is the wrong choice; rendering one would be a hint. |

**Adopted: none.** Native radio groups, fieldsets, and an `aria-live` score are the whole
interface.

---

### 2.8 Section hubs and indexes — `/learn`, `/learn/ar`, `/explore`, `/explore/charts`

| Candidate | Decision | Justification |
|---|---|---|
| `treemap` | **REJECT** | Using a treemap as navigation would make the chapter list unreadable and unfindable; an ordered list is the honest structure for a curriculum. |
| `funnel-chart` | **REJECT** | A “funnel” of chapters would imply readers must pass through all ten in order and drop out. |
| `number-ticker` (motion primitive) | **REJECT** | The hub's stats (10 chapters, 25 source pages, 6 labs) are static facts, not live counters. |
| `bump-chart` | **REJECT** | Catalog-level review. Nothing on a hub changes rank over time. |

**Adopted: none.**

---

## 3. Summary

| Page purpose | Candidates considered | Adopted | Adapted | Deferred | Rejected |
|---|---:|---:|---:|---:|---:|
| Lesson pages | 5 | 0 | 0 | 0 | 5 |
| Six core labs | 5 | 0 | 0 | 0 | 5 |
| Decision assistant | 11 | 6 | 0 | 1 | 4 |
| Integrity lab | 5 | 0 | 0 | 1 | 4 |
| Dashboard anatomy | 5 | 1 | 0 | 1 | 3 |
| Specialty audit | 6 | 2 | 2 | 1 | 0¹ |
| Practice bank | 4 | 0 | 0 | 0 | 4 |
| Section hubs | 4 | 0 | 0 | 0 | 4 |

¹ `composition-chart` is counted on the dashboard row: it was adopted there, not on the specialty
page, and the register on `/explore/specialty` says so.

Eleven components adopted or adapted out of 45 candidate evaluations, plus twelve hand-authored
figure modules that are not registry items at all. That ratio is the point: the section is a
curriculum, not a component gallery.

---

## 4. What “ADAPT” changed in the treemap

The registry treemap is good geometry with an accessibility gap. Three changes were made, all in
the page/adapter, **none in the vendored source**:

1. **A visible table** of leaves with value and share of total, so a sighted keyboard user can
   read the numbers without hovering.
2. **An explicit total** (1,960) and a note that the shares sum to 100%, so the picture can be
   reconciled by hand.
3. **A typed leaf/group conversion** (`toTreemapNode`) instead of a cast, so a missing value
   cannot silently become `NaN` area.

The vendored files stay byte-identical to the registry; the installer records the hash. That is
why `components/charts/**`, `components/motion/**` and `components/agents/**` are excluded from
ESLint rather than rewritten — rewriting them would fork the registry item and lose the ability to
re-audit.

---

## 5. What “ADAPT” changed in the other three

**`sankey-chart`** — rejection nodes are injected by `funnelLinks()`, not by the component, and the
visible table + balance check are ours. The component is used as shipped.

**`donut-chart`** — the ring is used unchanged; the argument around it (sorted bar panel, closest-pair
readout, arc table) is ours. The donut is never the primary encoding for a ranking task.

**`composition-chart`** — two site-level changes, both documented in `qa-report.md`:
the vendored legend was replaced by a local one built on `useCompositionChart()` because
`aria-label="Highlight {name}"` omits the visible share value (WCAG 2.5.3), and a visible 24-row
table was added because the component ships none.

**`treemap`** — one site-level style override: `[data-treemap-tile] .opacity-80 { opacity: 1 }` in
`app/globals.css`. The registry dims its value label to 80%, which measures 4.47:1 at 10–12px
against the 4.5:1 AA floor. The registry file stays untouched; the override is scoped to the tile.
