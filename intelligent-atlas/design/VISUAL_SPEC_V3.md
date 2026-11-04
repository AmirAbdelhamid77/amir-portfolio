# Knowledge Stage — executable visual specification (V3)

Status: design specification for milestone M3 of
[`NEXT_PHASE_PLAN_EN.md`](../../docs/knowledge-stage-next-phase-v3-20261101/NEXT_PHASE_PLAN_EN.md).
Written 4 November 2026.

This document selects one visual direction and makes it buildable. It does not
authorize the integration into the canonical Home (M6–M7), it is not a
publication decision, and it cannot certify visual acceptance: that is an owner
judgement against the keyframes below.

---

## 1. Scope and status

| Question | Answer |
|---|---|
| What this covers | The three scenes of the review delivery: Timeline, Dealer, Knowledge Stage. |
| Where it runs | The isolated review prototype (`intelligent-atlas/prototype/`) and any later integration that reuses this spec. |
| What it may show | Candidate concepts, edges, editions and evidence, labelled as technical review. |
| What it may not show | Anything described as published, verified, mastered or scientifically approved. |
| What it does not decide | Human publication, rights, assessment eligibility, deployment. |
| What it cannot claim | That the corpus is fully read. 63 of 4,337 eligible units have a decision (§2). |
| Predecessor | The working prototype already implements the three scenes, the Dealer dialog, four intent modes and the pocket. This spec formalizes and corrects it; it does not start from zero. |

Two states must never be confused in any frame: **review mode** (candidate
labels, review badge, withheld counts) and **public mode** (zero published
concepts, honest discovery fallback). Every keyframe below is review mode.

---

## 2. Content truth table

Measured from `intelligent-atlas/analysis/` on 4 November 2026.

| Quantity | Value | Source |
|---|---:|---|
| Extracted units | 6,201 | `units-analyzed.jsonl` |
| Eligible for semantic reading | 4,337 | same |
| Metadata-only / non-learning | 1,859 / 5 | same |
| Candidate matched | 3,609 | same |
| Unmatched (review queue) | 728 | same |
| Unmatched still open | 695 | `review-workbench.mjs coverage` |
| Units with a written decision | 63 | `review-decisions.json` |
| Concepts in the registry | 132 | `graph-build.json` |
| Assertions (edges) | 86 | same |
| Domains | 5 | fabric, sql, statistics, visualization, analysis |
| Goals with a resolved route | 3 | same |
| Unique canonical resources | 4,925 | `semantic-ledger-summary.json` |
| **Published concepts / assertions / insights** | **0 / 0 / 0** | `public-projection-v2.json` |

Consequences the design must survive:

1. **The public graph is empty.** No edge may be drawn as supported. The
   integrated Home must render discovery, real routes and search, not a blank
   canvas and not a candidate edge passed off as fact.
2. **Review mode is rich and must say so.** 86 candidate assertions, 132
   concepts, 3 editions. Each carries a review badge, not a verified tick.
3. **The reading frontier is small.** One in 72 eligible units has been read.
   Any coverage sentence in the UI is generated from §2, never written by hand.
4. **Editions are three, not a continuous daily series.** 24, 25 and 26 October
   2026. The timeline must show gaps honestly.

---

## 3. Three representations, scored against the rubric

Weights are the repository policy weights (correctness 30%, teaching 25%,
interaction 15%, performance/mobile 15%, accessibility 10%, maintenance 5%),
each scored 0–5, weighted score out of 5.

| Criterion (weight) | A. List + stepper | B. Stable 2D task field | C. Immersive spatial scene | D. Simple table (no chart) |
|---|---:|---:|---:|---:|
| Correctness (30%) | 5 | 5 | 3 | 5 |
| Teaching clarity (25%) | 4 | 5 | 3 | 4 |
| Essential interaction (15%) | 2 | 4 | 5 | 1 |
| Performance / mobile (15%) | 5 | 4 | 2 | 5 |
| Accessibility / reduced motion (10%) | 5 | 4 | 2 | 5 |
| Maintenance / reuse (5%) | 5 | 3 | 2 | 5 |
| **Weighted score** | **4.30** | **4.50** | **3.00** | **4.15** |

### Why C is rejected

An immersive spatial scene fails three hard blockers, not merely the scores:

- **Motion must explain a change.** In a spatial scene the camera moves for
  orientation, not because the learner's question changed. That is decorative
  motion at the largest available scale.
- **Evidence cannot be hidden behind navigation.** Reading a claim requires
  opening a node; the evidence is two interactions deep and off-screen.
- **Performance and focus ownership.** 132 nodes with depth, occlusion and
  parallax exceed the mobile budget, and focus order in a projected 3D space has
  no defensible reading order for a screen reader.

### Why B wins, with A retained

B keeps the anchor concept in one stable position while the surrounding
composition answers a different question (Understand, Compare, Apply, Reach).
That is the product signature. A is not the loser: **A is the mandatory
equivalence view** — the same content as an ordered list, available at every
width and as the reduced-motion rendering. B cannot ship without A.

D is retained as the fallback inside B: when a concept has no local resource or
no eligible neighbour, the field degrades to a small labelled table rather than
an empty canvas.

---

## 4. The four intent modes

One selected concept stays the anchor. The mode changes what surrounds it. All
four read from the same index (`intelligent-atlas/lib/query.mjs`).

| Mode | Objects on screen | Canonical query | Empty / unavailable state | Deliberately not shown |
|---|---|---|---|---|
| **Understand** | Anchor + prerequisites (`requires_understanding_of`, outgoing) + mechanism parts | `neighborhood(index, id, {maxHops:1})`, then `recommendNext(id,{intent:"understand"})` | "No recorded prerequisite. This concept is a starting point in the current registry." | Dependents, comparisons, practice links |
| **Compare** | Anchor + `contrasts_with` / `tradeoff_with` / `complements` neighbours + sourced criteria | `recommendNext(id,{intent:"compare"})` | "No documented comparison partner. Asking for one would invent a relationship." | Practice items, routes |
| **Apply** | Anchor + `enables` neighbours + the best-scoped resource by role (`applies` then `practices`) | `resourcesForConcept(id,{roles:["applies","practices"]})` | "No eligible practice resource for this concept. Open the lesson instead." | Aggregate scores, invented labs |
| **Reach a goal** | The goal route as an ordered strip, prerequisites before dependents, gaps marked | `routeFor(index, goalId)` | "This goal's route is incomplete: N prerequisites have no resource." | Hop counts as quality, percentages of readiness |

Rules that apply to all four:

- Selecting a neighbour previews it; **Explore** expands it into the anchor
  position; **Open resource** navigates and leaves the field.
- A candidate edge is rendered with the review badge and the sentence "technical
  review; human pending". It is never rendered as verified.
- A missing relation produces an explicit unavailable state. The renderer never
  fills the gap.

---

## 5. Timeline scene

The timeline is the only first-viewport content. It answers "what is available
to read", not "what should I learn".

- **Three real editions**: 26 Oct 2026 "A reference is a design decision."
  (OneLake), 25 Oct "Name the object you are deleting." (OneLake), 24 Oct
  "Location changes discovery." (Lakehouse).
- **Selection is not activation.** Hovering, focusing or arrowing a date moves
  the peek; only `Enter`, `Space` or **Open edition** opens the Dealer.
- **Honest availability.** Dates inside the review clock without an edition show
  "no edition for this date" in the peek, with the two nearest available dates
  as buttons. No grey placeholder card implying content.
- **Focus ownership.** Opening the Dealer moves focus to the Dealer heading.
  Closing returns focus to the exact date control that opened it, and to the
  same scroll offset.
- **Reduced motion.** The track does not slide; the peek appears as a static
  block and the selected date gets a 2px focus ring plus a text label.

---

## 6. Knowledge Stage composition

### ≥1024px — three columns

```
┌──────────────────────────────────────────────────────────────────────┐
│ kicker: Knowledge / <mode>            search 132 candidate concepts   │
├───────────────┬──────────────────────────────────┬───────────────────┤
│ anchor card   │ field (stable 2D)                │ context panel     │
│ 320px         │ flex, min 480px                  │ 360px             │
│ concept       │ anchor at fixed optical centre   │ why this          │
│ definition    │ neighbours on two rings          │ evidence quote    │
│ domain chip   │ edge labels on demand            │ branch preview    │
│ pocket toggle │                                  │ Open resource     │
├───────────────┴──────────────────────────────────┴───────────────────┤
│ mode strip: Understand · Compare · Apply · Reach a goal              │
└──────────────────────────────────────────────────────────────────────┘
```

Type, using the values already in `components/knowledge/stage-editorial.css`:
scene title `clamp(30px, 4.4vw, 64px)`, display line
`clamp(40px, 8vw, 122px)` (Timeline only), lede `clamp(15px, 1.5vw, 19px)`,
kicker 11px with 0.14em tracking, body 15px/1.6, evidence 14px/1.55 in
`--font-mono`, meta 12px. Body measure capped at 68ch.

Spacing: 8px base. Scene padding 48px 64px. Column gutter 24px. Card padding
24px. Ring radius 132px and 236px from the anchor centre.

### 768–1023px — two columns

Anchor card moves above the field as a 72px summary row; the context panel
becomes a bottom sheet 46vh tall that covers the field when open and returns
focus to the anchor on close. Mode strip stays a single row of four chips.

### ≤390–767px — single column

Order: title → timeline/field → mode strip → context. The field becomes a
vertical stack: anchor card, then neighbour rows with relation label and
evidence count. Edge lines are not drawn below 768px; the relation label carries
the meaning instead. Context opens as a full-height sheet with a 44px close
target, and `Escape` closes it.

### Reduced motion variant (any width)

No ring expansion, no edge draw-on, no cross-fade longer than 0ms. Mode change
swaps content in place with a 1px divider change. The list view is the default
and the field is opt-in.

---

## 7. Six keyframes

Each frame is a state a screenshot can be compared against. Review mode in all
six; the review badge is visible in all six.

| # | Scene | Theme | On screen | Selected | Dimmed / absent | What moved to get here |
|---|---|---|---|---|---|---|
| K1 | Timeline | light | Title "Choose a moment. / Follow the thread.", 15-day track with 3 edition ticks, peek showing 26 Oct card title and "latest edition" label | 26 Oct | Future dates after 26 Oct at 40% opacity; no Dealer | Page load only: track draws once, 320ms |
| K2 | Timeline | dark | Same geometry, `--background #151515`, tick on `--chart-1` light value `#56b4e9`, peek surface `--glass-bg` | 25 Oct (moved by arrow key) | 26 Oct de-emphasised to 55%, peek readable | Peek slid 180ms; no full-track slide |
| K3 | Dealer | light | Dialog 720px, kicker "daily edition / 26 Oct 2026", title, 3-card hand, reader showing the OneLake shortcut card with Takeaway and Caveat blocks, foot note with source and checked date | Card 1 | Timeline behind at 18% scrim | Dealer scaled 0.985→1 over 240ms; backdrop 180ms |
| K4 | Dealer | dark | Same, `--card #1c1c1c`, reader text `oklch(96%)`, caveat border `--border-strong` | Card 3 (Lakehouse) | Other cards at 60% | Card swap 160ms cross-fade; no horizontal carousel motion |
| K5 | Knowledge Stage | light | Anchor "OneLake shortcut" centre, 4 neighbours on ring 1 (OneLake, Delta table, SQL analytics endpoint, Identity and permissions), context panel with "Why this" claim text and an evidence quote, branch preview collapsed | Anchor | Unrelated 128 concepts absent; candidate badge on each edge | Anchored 240ms from the Dealer card; ring radius 0→132px |
| K6 | Knowledge Stage | dark | Same anchor, Compare mode: two neighbours (`DirectQuery`, `Import mode`) with criteria rows, condition sentence visible, mode chip "Compare" pressed | Compare chip | Understand/Apply/Reach content removed | Content swap 200ms; anchor stayed still — this is the signature |

The 390px reinterpretation is a seventh capture, taken from K5: anchor card,
then three neighbour rows, no edge lines, context sheet closed.

---

## 8. Token role crosswalk

No second theme system. Every role maps to a token that already exists in
`app/globals.css`.

| Role in this stage | Token | Notes |
|---|---|---|
| Page surface | `--background` | `oklch(99% 0 0)` light, `#151515` dark |
| Card / panel surface | `--card` | not a new elevation token |
| Floating panel (Dealer, pocket, context sheet) | `--glass-bg` + `--glass-border` | existing glass pair; blur ≤ 12px |
| Body text | `--foreground` | 19.18:1 light, 16.31:1 dark |
| Secondary text, meta | `--muted-foreground` | 5.86:1 light, 6.82:1 dark |
| Anchor concept emphasis | `--primary` | `#0b62b5` light, `oklch(74% 0.12 250)` dark |
| Primary button label | `--primary-foreground` | 6.13:1 light, 8.59:1 dark |
| Mode chip active | `--accent` + `--accent-foreground` | follows the active preset |
| Hairlines, card borders | `--border` / `--border-strong` | never a colour role |
| Relation classes | `--chart-1` prerequisite, `--chart-2` mechanism, `--chart-3` comparison, `--chart-4` application, `--chart-5` goal | semantic, fixed across presets |
| Review / withheld state | `--warning` | badge only, never body text |
| Destructive / unavailable | `--danger` | gap markers, never a filled block |
| Focus ring | `--ring` | 2px, offset 2px |
| Motion | `--ease-out` (enter), `--ease-in-out` (move) | see §9 |

Presets: `violet`, `blue`, `teal`, `green`, `rose`, `amber` already exist and
only move `--primary`, `--accent`, `--primary-foreground`, `--accent-foreground`
and `--ring`. The stage inherits them unchanged; it defines no preset of its own.

### Per-state contrast, measured

Computed with the WCAG relative-luminance formula against the real token values
(OKLCH converted to sRGB). Text target 4.5:1, non-text marks 3:1.

| Pair | Ratio | Target | Result |
|---|---:|---:|---|
| Light body on background | 19.18:1 | 4.5 | PASS |
| Light muted on background | 5.86:1 | 4.5 | PASS |
| Light primary text on background | 5.97:1 | 4.5 | PASS |
| Light primary button label | 6.13:1 | 4.5 | PASS |
| Light `--chart-1` mark | 5.05:1 | 3 | PASS |
| Light `--chart-2` mark | 3.33:1 | 3 | PASS |
| Light `--chart-3` mark | 3.30:1 | 3 | PASS (was 2.20:1) |
| Light `--chart-4` mark | 4.11:1 | 3 | PASS (was 2.98:1) |
| Light `--chart-5` mark | 3.77:1 | 3 | PASS |
| Dark body on background | 16.31:1 | 4.5 | PASS |
| Dark muted on background | 6.82:1 | 4.5 | PASS |
| Dark primary text | 7.97:1 | 4.5 | PASS |
| Dark primary button label | 8.59:1 | 4.5 | PASS |
| Dark `--chart-1..5` marks | 7.91 / 9.50 / 10.94 / 9.58 / 8.07 | 3 | PASS |

Correction (2026-11-04, M6 step 2): the two failures were token defects, not a
composition constraint. `--chart-3` moved within the same amber family from
`#e69f00` to `#c07d00` (3.30:1) and `--chart-4` within the same pink family from
`#cc79a7` to `#b85c8f` (4.11:1), measured against `oklch(99% 0 0)` = `#FCFCFC`.
Both now clear the 3:1 non-text floor without changing hue, so the light theme
no longer needs a special-case stroke or dash workaround. The general rule still
stands for every mode: a relation class is never carried by colour alone — the
edge keeps its stroke and its text label, and the label names the relation.
Dark mode is unchanged and had no failure.

---

## 9. Motion table

Durations are total, including easing. Nothing is decorative.

| Transition | Trigger | Duration | Easing | What changes | Reduced motion | What it explains |
|---|---:|---|---|---|---|---|
| Timeline peek | arrow / hover / focus | 180ms | `--ease-out` | Peek content and the tick emphasis | Instant swap, no slide | Which date is being inspected |
| Date activation | Enter / Space | 240ms | `--ease-out` | Dealer scales 0.985→1, backdrop to 18% | Instant, no scale | The edition is now the active object |
| Dealer card swap | card select | 160ms | `--ease-in-out` | Reader content cross-fades | Instant | One card replaced another, not the whole edition |
| Dealer close → date | Escape / close | 200ms | `--ease-out` | Dialog out, focus ring returns to the date | Instant | Context returns to where it came from |
| Stage anchor | select in Dealer | 240ms | `--ease-out` | Anchor card takes the centre position | Instant | The selected idea is now the reference point |
| Ring expansion | anchor set | 260ms | `--ease-out` | Neighbours move from radius 0 to 132px | Instant, no travel | Each neighbour is one relation away |
| Edge draw | ring expansion | 260ms, same start | `--ease-out` | Stroke dash offset to 0 | Edges appear fully drawn | The relation exists before the label is read |
| Mode change | chip / keyboard | 200ms | `--ease-in-out` | Surrounding content swaps; anchor does not move | Instant | The question changed, the idea did not |
| Context panel | preview | 220ms | `--ease-out` | Panel slides 12px and fades in | Instant | Evidence is adjacent, optional |
| Pocket open | toggle | 200ms | `--ease-out` | Side sheet in | Instant | Saved items are separate from the graph |
| Press feedback | pointer / key | 120ms | linear | 1px translate + background shift | Same (opacity only) | The control received input |

Budget: no transition exceeds 320ms; no more than two properties animate at
once per element; nothing animates on scroll except the timeline track (and only
when `prefers-reduced-motion` is not set).

---

## 10. Accessibility contract

- **Focus order (Knowledge Stage):** skip link → search → anchor card → mode
  strip → neighbours in ring order (clockwise from 12 o'clock, then ring 2) →
  context panel → pocket → footer. The field is one composite widget with
  roving tabindex: `Tab` enters at the anchor, arrows move between neighbours.
- **Focus return:** Dealer close → opening date control. Explore → new anchor.
  Context sheet close → the previewed neighbour. Pocket close → its toggle.
- **Skip link:** "Skip to the knowledge field" is the first focusable element in
  the scene, visible on focus.
- **Live regions:** one polite region announces the selected concept, its
  relation and its evidence count (`"OneLake shortcut, prerequisite of OneLake,
  2 evidence passages"`). A second polite region announces mode changes. No
  assertive regions: nothing here is an emergency.
- **Keyboard map:** `←/→` previous/next date or neighbour; `↑/↓` ring change;
  `Enter` activate; `Space` preview; `Escape` close/return; `/` focus search;
  `P` pocket; `U / C / A / G` switch intent mode.
- **Contrast:** §8 table. Body copy and evidence always meet 4.5:1; relation
  marks meet 3:1 except the two documented light-mode cases, which add a label.
- **Forced colours:** all meaning survives with `forced-colors: active`; edges
  use `CanvasText`, the active chip uses `Highlight`, the review badge keeps its
  text, and no meaning depends on `--chart-*`.
- **RTL / Arabic:** `dir="rtl"` mirrors the ring order (counter-clockwise), the
  anchor stays centred, the context panel moves to the left. Arabic aliases are
  rendered with `--font-sans` and `letter-spacing: 0`, never the mono face. Mixed
  English terms inside Arabic sentences keep their own direction with `bdi`.
- **Targets:** 44×44px minimum for every control, including the 390px close
  button and the timeline ticks (which use an invisible 44px hit area).

---

## 11. Performance budget

Measured baseline, this checkout:

| Item | Measured | Budget for this stage |
|---|---:|---|
| Static export total | 156.1 MB / 2,858 files | unchanged; the stage adds no corpus copy |
| Current Home HTML | 105,263 B uncompressed | ≤ 120,000 B uncompressed |
| Review artifact `prototype/data.js` | 2.75 MB | **never** in `out/` or any public chunk |
| First interaction (timeline) | not yet instrumented | ≤ 2.5 s on a mid-range phone, 4× CPU throttle |
| Mode switch | not yet instrumented | ≤ 100 ms to first paint of new content |
| Timeline scrub | not yet instrumented | ≤ 16 ms per frame (rAF-bounded) |
| New client JS for the stage | 0 today | ≤ 60 KB gzip, lazy-loaded per scene |

Rules: no corpus embedding in the Home; the index is built at build time into
small per-concept JSON; the review artifact and all candidate-only fields are
excluded from public chunks, source maps and search indexes. "Not yet
instrumented" is recorded as such, not as a pass.

---

## 12. Open owner questions

1. **Light-mode relation colour.** Resolved 2026-11-04 (M6 step 2): option (b)
   was implemented at token level. `--chart-3` is now `#c07d00` (3.30:1) and
   `--chart-4` `#b85c8f` (4.11:1) against `#FCFCFC`, same hue families, both
   above the 3:1 mark target. No mark-specific variant was needed. Option (a)
   remains the rule for all modes anyway: a relation always carries a label.
2. **Edition cadence.** Three editions exist (24–26 Oct 2026) and the review
   clock spans 15 days. (a) Show the empty days explicitly. (b) Show only days
   with an edition, and state the gap in text.
3. **Review badge prominence.** (a) Persistent small badge on every candidate
   edge. (b) One banner per scene stating that all content is under technical
   review. The first is safer; the second is quieter.
4. **Timeline as first viewport in the integrated Home.** Resolved 2026-11-04
   (M6 step 2): option (a). The timeline is the first scene and the first
   viewport; the selected edition is a peek beneath it, and the Dealer opens
   only on request. Empty days stay visible as quiet ticks.
5. **Mobile field.** (a) No edge lines below 768px, labels carry the relation.
   (b) A single-column list is the only mobile representation, with the field
   desktop-only.
