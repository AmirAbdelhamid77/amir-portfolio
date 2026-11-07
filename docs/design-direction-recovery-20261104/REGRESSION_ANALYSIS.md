# Design direction recovery — regression analysis and restoration plan

**Status:** proposal for owner approval. No application UI has been changed for this document.
**Date:** 2026-11-04
**Repository:** `D:\BeUI\amir-portfolio`, branch `main`, HEAD `3d94030`
**Baseline for comparison:** `intelligent-atlas/prototype/` (the original Knowledge Stage prototype, v3.2.0-recovery)
**Current implementation:** the M6 three-scene Home (`33536fe`) and the atlas pages as built at `3d94030`

This is a correction of direction, not a new design experiment. The prototype is the
source of truth for visual language, composition, hierarchy and interaction. The job is
to recover it and continue improving it — while keeping the M1–M6 engineering that is
worth keeping.

---

## 0. What went wrong

Short version, stated plainly because it is the reason for this document:

1. The prototype was treated as a review artifact and a data source, not as the product's
   design direction.
2. The publication guard was allowed to stand in for a design. A panel that says
   `0 published concepts · 0 published connections` was shipped as "the semantic layer",
   and an empty state was presented as the knowledge scene.
3. The composition decision was made unilaterally. The Home was replaced wholesale
   instead of evolving the prototype, and the Knowledge Neighbourhood was dropped without
   it being listed as a removed experience.
4. Technical gates were treated as evidence of success. 257 passing tests, 34/34 and
   49/49 browser checks are real, but they measure correctness, not whether the product
   is worth looking at.
5. No stable visual reference or side-by-side acceptance step existed, so a regression of
   this size could land while every gate stayed green.

The correction is not "add the graph back". It is "restore the experience that was
already working, then improve its execution".

---

## 1. Method and evidence

### 1.1 Sources read

| Source | What it establishes |
| --- | --- |
| `intelligent-atlas/prototype/index.html` | Scene structure, chrome, dealer, pocket, about, skip link, theme boot |
| `intelligent-atlas/prototype/app.js` (2,737 lines) | Timeline geometry and input, scene routing, search, neighbourhood rendering, compare/apply/route panels, dealer, thread, pocket, closing, about, URL/localStorage state, keyboard grammar |
| `intelligent-atlas/prototype/styles.css` (5,512 lines) | Tokens, type scale, colour system, scene layout, field, branches, dealer, motion |
| `intelligent-atlas/prototype/neighborhood-model.js` | Pure selection model: Requires / Unlocks / Contrasts / Related, entrances, same-subject membership, direction labels |
| `intelligent-atlas/prototype/timeline-model.js` | Fan geometry and scale/opacity falloff |
| `components/knowledge/*` | Shipped timeline, knowledge scene, insight scene, instrument, dealer, archive |
| `components/atlas/*`, `lib/atlas/*` | Real explorer, projection, publication rules, circle layout |
| `lib/knowledge/stage-model.ts` | Public/review audience boundary and the graph summary |
| `docs/knowledge-stage-m6-20261104/COMPOSITION_AUDIT.md` | What M6 changed and why |
| `intelligent-atlas/DELIVERY_REPORT.md` §16 | M6 step 2 record, gates, open items |

### 1.2 Evidence captured for this review

All screenshots are in `docs/design-direction-recovery-20261104/evidence/` and were
captured by `capture.mjs` at 1280×900 and 390×844, light and dark, reduced motion.

| File | Content |
| --- | --- |
| `proto-timeline-dark-1280.png` | Prototype timeline, selected edition 03 |
| `proto-entrances-dark-1280.png` | Prototype subject entrances (no concept selected) |
| `proto-knowledge-dark-1280.png` | Prototype neighbourhood, `Layered security model`, 3 branches |
| `proto-knowledge-expanded-dark-1280.png` | Same concept, expanded to 8 relations |
| `proto-dealer-dark-1280.png` | Prototype dealer with edition rail, hand and reader |
| `proto-compare-dark-1280.png` | Prototype compare board |
| `proto-closing-dark-1280.png` | Prototype closing ledger |
| `proto-timeline-light-390.png`, `proto-knowledge-light-390.png` | Prototype mobile |
| `shipped-home-dark-1280.png` | Shipped Home first viewport |
| `shipped-knowledge-dark-1280.png` | Shipped knowledge scene hero |
| `shipped-graph-dark-1280.png` | Shipped semantic layer empty state |
| `shipped-dealer-dark-1280.png` | Shipped dealer, inline, one card dealt |
| `shipped-closing-dark-1280.png` | Shipped closing destinations |
| `shipped-home-light-390.png`, `shipped-knowledge-light-390.png` | Shipped mobile |
| `shipped-atlas-desk-dark-1280.png` | Public atlas bibliography |
| `preview-atlas-explorer-dark-1280.png`, `preview-atlas-map-dark-1280.png` | Review-preview explorer with 42 concepts / 49 connections |

The human-readable side-by-side is `compare.html` in this folder.

### 1.3 What this review did not do

- No UI, publication rule, data or configuration was changed.
- No deployment was attempted.
- Performance was not measured against `2026-11-04-pre-m6`.
- No screen-reader pass. axe covers automated rules only.
- The prototype's data payload (2.7 MB inlined) was read for behaviour, not adopted as the
  content source. The restoration must use `content/atlas/` and the reviewed insight feed.

---

## 2. The design direction we actually had

This section reconstructs the prototype as a design system, not as a feature list, because
the regression is mostly at the level of composition and reading rhythm.

### 2.1 Design principles visible in the artifact

1. **Editorial, not dashboard.** A serif display line sits against mono metadata and a
   sans body. The page reads like a printed edition with instruments, not a admin panel.
2. **One idea at a time, with a visible neighbourhood.** The unit of learning is a concept
   in context, not a list item. The graph is local, labelled, and readable.
3. **Direction is part of the meaning.** `A → B` means "A requires B". Requires / Unlocks /
   Contrasts / Related are separate groups with separate colours and labels. Membership is
   explicitly *not* a relation.
4. **The stage is a place.** Scenes are entered and left (`Timeline`, `Knowledge`, `Close`),
   with a topbar that changes state, not a long page of stacked cards.
5. **Material honesty.** Warm paper in light, near-black in dark, hairline rules, layered
   surfaces, restrained shadows. No glassmorphism, no gradient chrome.
6. **Nothing is invented.** Empty decks are shown empty; missing readings are stated;
   candidate status is labelled on the same line as the content.

### 2.2 Visual system

| Token | Light | Dark |
| --- | --- | --- |
| Background | `#f4f1e9` | `#090c11` |
| Deep background | `#eae5d9` | `#06080c` |
| Surface / raised | `#fffdf8` / `#f2eee4` | `#121822` / `#19212d` |
| Ink / secondary | `#15171b` / `#363b44` | `#f1f4f9` / `#c6cedb` |
| Muted / faint | `#63645f` / `#8b887f` | `#98a2b3` / `#6d7789` |
| Primary | `#1d5cff` | `#6d9bff` |
| Teal / amber / magenta | `#0c7f73` / `#9a5a06` / `#9c2bbd` | `#3fd0bd` / `#f0b35a` / `#d98bf0` |
| Field background | `#eeeade` | `#0c1119` |
| Domain colours | fabric `#2f6bff`, sql `#0f8f80`, statistics `#7b4bd6`, visualization `#b8690a`, analysis `#b3345a` | lightened equivalents |

Type: `ui-serif` display (italic second line), `ui-sans-serif` body, `ui-monospace`
kickers and metadata. Radii 4 / 9 / 16 / 24 / 34. Easing `cubic-bezier(.16,1,.3,1)` and
`cubic-bezier(.4,0,.2,1)`; durations 140 / 240 / 420 / 680 ms. Max width 1440 px.
Scene padding `clamp(20px, 4.2vw, 64px)`.

The identity comes from the combination: oversized serif headline + mono kicker + warm
paper + hairline rules + domain colour + instrument-like diagrams. Removing any one of
those changes the product's character.

### 2.3 Scene 1 — the timeline as a place

- Topbar: orb brand mark, `Hansa / KNOWLEDGE STAGE`, segmented scene nav
  (`Timeline`, `Knowledge`, `Close`), Pocket with count, theme, About.
- Kicker `EDITION TIMELINE / SUNDAY, 1 NOVEMBER 2026 · PROTOTYPE CLOCK`.
- Headline in two registers: `Choose a moment.` then italic serif `Follow the thread.`
- Lede paragraph plus a review badge, `TECHNICAL REVIEW · HUMAN PENDING`.
- **Every day is a card.** Weekday, date, edition tag (`ED 03` / `QUIET` / `TODAY`), title,
  summary lines, card count and review state. Quiet days are dim, not absent.
- Fan geometry: cards scale and fade with distance from the selected position; giant ghost
  date numerals sit behind the track; four-line cables connect each card's near corners to
  the ruler; five ticks per gap with a taller middle tick.
- Input: pointer drag with velocity/settle, horizontal wheel, click to select,
  second click or `Enter` to open, arrows/Home/End when focused.
- Selected peek: edition number, long date, card title, takeaway, topic/card/review meta,
  previous/next steppers, primary `Open edition`.
- Status footer: editions, quiet days, days in the clock, published edges.
- Scroll cue into the next scene.

### 2.4 Scene 2 — the knowledge neighbourhood

Structure, top to bottom:

1. Kicker `KNOWLEDGE / NEIGHBOURHOOD · FABRIC`, headline `One idea,` + italic
   `its neighbourhood.`
2. Origin line (`From the candidate neighbourhood`, `From card…`, `empty hand`) and
   `YOUR CURRENT SELECTION · …`.
3. Toolbar: concept search (label, alias, definition; `/` shortcut; `Enter` opens first
   match; `Escape` clears), a five-item legend for relation groups, Back.
4. **The field.** A centre concept card (domain, read-in-context state, title, definition,
   recorded-relation count, `N more concepts in <domain>`) surrounded by labelled branch
   cards on an ellipse (Requires at 180°, Unlocks at 0°, Contrasts at 90°, Related at 270°),
   with collision resolution, curved dashed edges and direction labels.
5. **Branch behaviour.** Hover or focus previews a branch in the panel below the field with
   the relation label, claim and two actions: `Explore connections` (move the
   neighbourhood) and `Open content` (open the reading deck). The 3–4 default limit keeps
   the field readable; `Show N more connections` expands it.
6. **Text and table alternative** in a `<details>` element, so the graph is never the only
   route to the content.
7. **Membership, not a relation.** `ALSO IN MICROSOFT FABRIC` chips show same-subject
   concepts and their read state, explicitly separated from relations.
8. **Context panel.** Concept title, definition, scope, `Open content`, `Save`, connection
   count with `N of M shown`, expand control, same-subject list, `Evidence and reading`
   (parent context, reading, evidence quote, unit/decision/meaning, unresolved questions,
   resources), `More ways to use this` (Compare / Apply / Route), coverage grid (mapped
   units, primary units, assertions, cross-subject, routes, reading), and the direction
   note.
9. **Intent switch**: `Understand` / `Compare` / `Apply` / `Reach a goal`, keyboard
   `u` / `c` / `a` / `g`.
10. **Learning thread**: up to 12 numbered concept chips, clearable, so a session leaves a
    trail.

The three intent panels are full experiences, not links:

- **Compare**: comparison board selector, field/left/right table, claim, conditions,
  evidence quote with unit, support kind, shared/left-only/right-only prerequisite pills,
  rationale, open either concept, save board.
- **Apply**: destinations grouped into practice questions, labs, exercises; routes that
  use the concept with step position; an honest coverage-gap state with fallback actions.
- **Reach a goal**: goal picker, route summary, topologically ordered steps with domain,
  target, gap and self-reported badges, per-step conditions and reasons, `I already know
  this` (explicitly not mastery), start route, route deck, save route.

### 2.5 Dealer, pocket, closing, about

- **Dealer** is a full-screen modal: edition day rail, deck head (kind, date, title,
  summary, review badge), the whole hand as selectable cards with capability row
  (`discover`, `read`, `assess`, `relate`), and a reader panel with inline fields
  (scenario, prediction, takeaway, caveat), evidence quotes, `Why this card`, save,
  `Locate in knowledge`, next. An empty hand is a real, explained result.
- **Pocket** is a slide-over of saved concepts, comparison boards, routes and cards, with
  open and remove.
- **Closing** is `Leave with one idea and one honest action.`: a quote from the selected
  reading, one action to reopen the latest edition, pocket access, a coverage ledger
  (editions, concepts, assertions, boards, units read, published, media, source files) and
  a note that the denominators are not interchangeable.
- **About** is a coverage/honesty modal: what the artifact is, reading coverage,
  denominators, known extraction defects, matcher false positives, review register, what
  has not been done, explicit gaps, build ids.

### 2.6 State and access

- URL: `date`, `intent`, `concept`, `goal`, `comparison`, `theme`, `dealer`.
- `localStorage` key `hansa.knowledge-stage.v31`: theme, date, intent, pocket, thread,
  self-reported steps.
- Keyboard: arrows/Home/End/Enter on the timeline; `/` search; `u/c/a/g` intents; `p`
  pocket; `Escape` closes the top layer in order (dealer → about → pocket → search →
  selection); focus trapping in dialogs; `aria-live` announcements.
- Reduced motion: instant scene changes and static layout; the field becomes a list below
  720 px.

---

## 3. What shipped in M6

### 3.1 Home (`/`, `/prototype-c/`)

- Global Hansa header (`Today`, `Learn`, `Practice`, `Atlas`, `About`), not the stage topbar.
- Scene rule `HANSA / KNOWLEDGE STAGE` and `EDITIONS UNDER EDITORIAL REVIEW · TECHNICAL
  REVIEW`.
- Timeline: kicker, Grotesk headline (second line muted, not serif), explanatory note,
  "no edition today" notice, fifteen equal ticks with status bars, one tab stop,
  arrows/Home/End/Enter, selected peek with title, scenario, `Open edition`,
  `Read the full edition`, `Permalink`.
- Dealer: inline `#today-deal` section, `The hand behind the claim`, one card at a time,
  `Deal 2 more` / `Collect all`.
- Knowledge scene: heading, edition hero, `InsightScene` (situation, reasoning model,
  decision experiment, reveal, evidence), `KnowledgeInstrument`, then the semantic layer:
  `0 published concepts · 0 published connections`, withholding count, four destination
  cards.
- Closing: `Nothing here is a dead end.`, destination cards, archive.
- Archive: searchable list of every edition with permalinks (a genuine addition).

### 3.2 Atlas

- `/learn/dp-600/atlas/`: public build renders a 32-source bibliography ("reading room")
  with publication-pending notice.
- With `HANSA_ATLAS_REVIEW_PREVIEW=1`: renders `AtlasExplorer` — 42 concepts, 49 candidate
  connections, evidence lens, relation filter, incoming toggle, 1–2 hop focus, pan/zoom,
  circle map, labelled connection list, relation inspector, concept inspector, guide
  navigator, no-JS linear atlas.
- `/learn/dp-600/atlas/journey/`: guided journey.
- `/learn/statistics/atlas/`: a separate statistics prerequisite graph, already public.

### 3.3 The publication boundary, as implemented

- `lib/atlas/model.ts` publishes only `editorialState === "published"`; the preview flag
  also admits `technical_review`.
- All 42 concepts and 49 edges are `technical_review`, so the default projection is empty.
- `lib/knowledge/stage-model.ts`'s `buildGraph` marks the scene ready only when a
  *published* edge exists. Its `audience` only changes the notice; it never admits a
  review edge.
- The Home calls `buildStageModel({ audience: "review" })` for editions, but the Atlas is
  the default public projection. The result is the inconsistency the owner noticed:
  editions are shown and labelled `IN REVIEW`, while their own concepts are refused.

---

## 4. Side-by-side comparison

Legend: **●** present and equivalent · **◐** partial · **○** absent.

### 4.1 Chrome and composition

| Surface | Prototype | Shipped M6 | |
| --- | --- | --- | --- |
| Stage identity in the header | Orb + `Hansa / Knowledge Stage` + scene nav | Global observatory header | ◐ |
| Scene model | Timeline / Knowledge / Close, entered as places | Long page: timeline → edition → closing | ○ |
| Scene transition | Scroll + scene nav, progress and focus management | Anchor links / scroll | ◐ |
| Display typography | Serif italic second line | Grotesk, muted second line | ○ |
| Domain colour system | Five domain colours used across nodes, chips, cards | Not used in the Home | ○ |
| Material system | Warm paper / near-black, hairlines, layered shadows | Near-black, card grid, thin borders | ◐ |
| Density | Editorial: large headline, dense instruments, generous field | Even card grid, repeated kickers | ○ |
| Global destinations | About + closing + archive | Global nav + closing + archive | ● |

### 4.2 Timeline

| Feature | Prototype | Shipped M6 | |
| --- | --- | --- | --- |
| Per-day card with title and meta | Yes, every day | Ticks only; title is screen-reader-only | ○ |
| Fan geometry, scale/opacity falloff | Yes | No | ○ |
| Ghost date numerals | Yes | No | ○ |
| Cables to a ruler | Yes | No | ○ |
| Ruler ticks (five per gap) | Yes | Small status bars | ○ |
| Drag with inertia / wheel | Yes | No | ○ |
| Click select, second click/Enter open | Yes | Select; Enter opens | ◐ |
| Arrow/Home/End | Yes | Yes | ● |
| Single tab stop | No (roving per card) | Yes | ● |
| Prev/next steppers | Yes | No | ○ |
| Latest pin | Yes | `aria-current` only | ○ |
| Selected peek | Title, takeaway, meta, actions | Title, scenario, actions | ◐ |
| Status footer | Editions / quiet / days / published | Notice line only | ○ |
| Quiet days honest | Yes | Yes | ● |

### 4.3 Knowledge scene

| Feature | Prototype | Shipped M6 | |
| --- | --- | --- | --- |
| Edition reasoning | Through the dealer / panel | `InsightScene`: situation, model, decision, reveal, evidence | ● (improved) |
| Conceptual instrument | No | `KnowledgeInstrument` (FIG. 01) | ● (added) |
| Subject entrances | Five domains, three starters each | No | ○ |
| Concept search (label/alias/definition) | Yes, `/` shortcut | No | ○ |
| Neighbourhood field | Yes | No | ○ |
| Relation groups + direction labels | Requires / Unlocks / Contrasts / Related | Counts only | ○ |
| Branch preview + two actions | Explore / Open content | No | ○ |
| Expand hidden connections | Yes | No | ○ |
| Text/table fallback | Yes | No (Home); yes (atlas explorer) | ◐ |
| Context panel | Definition, scope, evidence, coverage, save | Concept inspector on atlas page only | ◐ |
| Membership vs relation | Explicit section | No | ○ |
| Compare boards | 15 boards, full table | No | ○ |
| Apply destinations | Practice / labs / exercises + routes | Generic `Read the lesson` / `Practise` links | ◐ |
| Goal routes | 3 routes, steps, gaps, self-report | No | ○ |
| Learning thread | 12 chips | No | ○ |
| Semantic layer | Local graph always visible | `0 / 0` empty state + four links | ○ |
| Duplicate headline | One scene title | Same edition title appears 3× | ○ |

### 4.4 Dealer, pocket, closing

| Feature | Prototype | Shipped M6 | |
| --- | --- | --- | --- |
| Dealer surface | Full-screen modal with focus trap | Inline section in the page | ○ |
| Edition day rail | Yes | Minimal deck rail | ◐ |
| Whole hand visible | Yes | One card, then `Deal 2 more` | ○ |
| Reader panel | Yes, alongside the hand | Card content + caveat/source copy | ◐ |
| Capability row | discover / read / assess / relate | Not shown | ○ |
| Save card | Yes | No | ○ |
| Locate in knowledge | Yes | No | ○ |
| Empty hand | Explained | Explained | ● |
| Pocket | Slide-over, concepts/boards/routes/cards | No | ○ |
| Closing quote + action | Yes | No | ○ |
| Coverage ledger | 8 rows + denominator note | No | ○ |
| About / coverage modal | Yes | Bibliography desk only | ◐ |
| Archive | No (prototype) | Yes, searchable | ● (added) |

### 4.5 Atlas

| Feature | Prototype | Shipped public | Shipped review preview | |
| --- | --- | --- | --- | --- |
| Concept/relation data | 132 concepts, 86 assertions | 0 / 0 | 42 / 49 | ◐ |
| Entry from an edition | Edition → dealer → locate | None | Direct URL only | ○ |
| Search | Yes | Bibliography search | Yes | ◐ |
| Local neighbourhood | Yes | No | 1-hop circle map | ◐ |
| Relation direction | Labels | Pending notice | Arrow + dashed + inspector | ● |
| Evidence lens | Evidence block per concept | Sources list | Yes | ● |
| Filters | Relation groups | No | Source, relation, incoming, hops | ● |
| Text fallback | Complete table | Bibliography | Connection list + no-JS atlas | ● |
| Continuity to lessons/practice | Routes (isolated prototype) | Links only | Catalogue links | ◐ |
| Visual integration with the Home | Same stage language | Different page language | Different page language | ○ |

### 4.6 State and access

| Feature | Prototype | Shipped M6 | |
| --- | --- | --- | --- |
| Deep link to a concept | `?concept=` | No | ○ |
| Deep link to an intent | `?intent=` | No | ○ |
| Deep link to a goal/comparison | `?goal=`, `?comparison=` | No | ○ |
| Deep link to a dealer deck | `?dealer=` | No | ○ |
| Selected edition deep link | `?date=` | `?insight=` | ● |
| Theme persistence | `localStorage` | `amir-theme` | ● |
| Pocket/thread persistence | Yes | No | ○ |
| Keyboard grammar | `/`, `u/c/a/g`, `p`, layered `Esc` | Strip keys only | ○ |
| Focus management | Dialogs, scene focus, announcements | Some (`aria-live`, focusable inspector) | ◐ |
| Reduced motion | Static layout toggle | `prefers-reduced-motion` in places | ◐ |
| No-JS content | Prototype requires JS | Atlas no-JS linear; Home mostly SSR | ◐ |

---

## 5. Prioritized regression list

Priority is about **direction**, not effort. P0 items define whether this is still the
same product.

### P0 — direction-defining regressions

**REG-01 · The Knowledge Neighbourhood was removed.**
The centre concept, labelled branches, relation groups, direction, preview, expand,
membership section and text fallback are all absent from the Home. The only graph a
visitor can reach is the atlas page, and only when publication allows it.
*Why it matters:* this was the experience that made the prototype compelling. Without it,
the product is a timeline plus an article.
*Restore:* the whole field and its panel, using real atlas data.

**REG-02 · Concept exploration was removed.**
No subject entrances, no search over labels/aliases/definitions, no `Explore connections`
vs `Open content`, no same-subject membership, no coverage details.
*Why it matters:* a reader cannot start from an idea or move through the corpus.
*Restore:* entrances, search, panel, fallback, membership.

**REG-03 · Learning paths and intents were removed.**
Compare boards, Apply destinations, goal routes, step conditions, gaps and self-report are
gone. The shipped scene offers generic lesson/practice links.
*Why it matters:* the prototype answered "what does this mean, how does it compare, where
do I use it, what do I need first". The product now answers only the first.
*Restore:* the three intent panels, scoped to available real data.

**REG-04 · The Atlas was demoted to an empty state, and the boundary is inconsistent.**
The Home renders `0 published concepts · 0 published connections` while its editions are
shown and labelled `IN REVIEW`. The real explorer exists but is only reachable in a local
review build; the public atlas is a bibliography. Nothing connects an edition to its
concept, or a concept to the atlas.
*Why it matters:* the Atlas is supposed to be a core product experience; right now the
product's own front page says it has nothing to show.
*Restore:* one explicit audience model for editions *and* relations, a labelled review
surface for design evaluation, and continuity from edition → concept → neighbourhood →
atlas desk. Publication rules stay closed until the owner decides.

**REG-05 · The visual identity was flattened.**
Serif display and italic, warm paper, domain colours, ghost numerals, fan and ruler,
layered surfaces and instrument diagrams were replaced by a Grotesk headline, equal cards
and repeated mono kickers.
*Why it matters:* the prototype's identity is the reason it felt designed. This is not a
polish issue; it is the visual language.
*Restore:* the token set in §2.2 and the composition grammar in §2.3–2.4, then improve.

**REG-06 · The timeline was demoted from a place to a control.**
Fifteen equal ticks, no cards, no fan, no ruler, no steppers, no per-day content, no drag.
*Why it matters:* "Choose a moment" is now a form control, not an edition you enter.
*Restore:* the card fan and ruler on desktop, keep the tick strip as the compact/mobile and
keyboard alternative.

**REG-07 · The dealer's reading model was inverted.**
One card at a time, `Deal 2 more`, no simultaneous hand or reader, no rail, no save, no
locate-in-knowledge.
*Why it matters:* the hand is how you compare what an edition claims; hiding it turns
reading into a sequence of reveals.
*Restore:* modal dealer with rail + hand + reader, keeping the cinematic deal as the
entrance animation.

### P1 — experience regressions

**REG-08 · Pocket removed.** No way to keep a concept, board, route or card across a
session. Restore the slide-over and persistence.

**REG-09 · Learning thread removed.** No visible trail through concepts; `localStorage`
thread state and the numbered chips are gone. Restore.

**REG-10 · Closing scene lost its argument.** The quote, the single action, the pocket and
the coverage ledger are replaced by four destination cards. Keep the destinations, restore
the ledger and the "one idea, one action" close.

**REG-11 · Deep-link and state model reduced.** Only `?insight=` survives. `concept`,
`intent`, `goal`, `comparison`, `dealer`, `date` are gone, so a neighbourhood, board or
route cannot be shared or resumed. Restore URL state and `localStorage`.

**REG-12 · Interaction grammar reduced.** `/`, `u/c/a/g`, `p`, layered `Escape`, branch
arrow navigation, focus trapping and scene focus are missing. Restore, with the shipped
single-tab-stop strip kept where it helps.

**REG-13 · Coverage honesty left the product.** The About modal (coverage, denominators,
defects, false positives, what was not done) is replaced by a bibliography desk on one
route. Restore a coverage surface reachable from the stage.

**REG-14 · Hierarchy repeats instead of building.** In the shipped knowledge scene the
edition title appears as the peek title, the scene title and the insight title, with the
same weight. The prototype used one title per level. Fix during restoration.

### P2 — polish and prototype defects not to copy

**REG-15 · Mobile loses the concept layer entirely.** The prototype degrades the field to
a labelled list; the shipped scene has nothing to degrade. Covered by REG-01, but the
mobile list is a first-class acceptance case.

**REG-16 · Prototype defects to fix, not reproduce.**
- At 1280, the scene kicker sits under the fixed topbar when scrolled to a scene
  (`KNOWLEDGE / NEIGHBOURHOOD` is clipped in the capture). Add scroll margin or a sticky
  offset.
- A concept with few relations leaves a large empty field. Improve with a calmer default
  composition (cluster the branches closer, add subject context) rather than filling with
  decoration.
- The prototype's field labels are small at 1280; the restored version needs a measured
  type scale, not a copy.

**REG-17 · Density drift.** Mono uppercase labels are used on nearly every block in the
shipped page, so none of them read as metadata. The prototype reserved mono for kickers,
counts and instrument labels. Restore that discipline.

### 5.1 What is *not* a regression — keep it

These are real improvements and must survive the restoration:

- The edition's `InsightScene` (situation → reasoning model → decision → reveal →
  evidence) and `KnowledgeInstrument`. The prototype did not have this depth.
- The fail-closed publication projection, audience typing, receipt layer and the
  `technical_review`/`published` distinction.
- Honest empty and withheld states, including the empty hand.
- The single-tab-stop tick strip and the archive with permalinks.
- The explorer's evidence lens, relation inspector, direction handling, keyboard map
  controls and no-JS linear atlas.
- Static export, 434 aliases, five verifiers, 257 tests, axe checks and reduced-motion
  handling.
- The review-preview flag (`HANSA_ATLAS_REVIEW_PREVIEW`) as the mechanism for evaluating
  candidate data locally.

---

## 6. Restoration and enhancement plan

Principles: restore before enhancing; one scene at a time; every slice behind a flag and a
side-by-side review; never replace a working surface without listing what is removed.

### R0 · Baseline and harness (no UI change)

- Freeze the prototype: record SHA-256 of `index.html`, `app.js`, `styles.css`,
  `neighborhood-model.js`, `timeline-model.js`; keep the directory read-only by convention.
- Keep `capture.mjs` and the 18 evidence images as the reference set.
- Add a design-fidelity checklist and an owner sign-off template (see §8).
- Measure the current Home (LCP, JS bytes, long tasks, layout shift) as the baseline.
- Re-run the shipped gates so the starting point is recorded.

**Exit:** baseline report committed; no visual change.

### R1 · Knowledge neighbourhood core (the first real slice)

- Subject entrances (five domains, three starters, ranked by read state/degree).
- Concept search over title, aliases and definition, with `/` and `Enter`/`Escape`.
- The field: centre card, four labelled groups, curved dashed edges, collision layout,
  domain colours, hover/focus preview, `Explore connections` / `Open content`.
- Hidden-connection count and expand.
- Context panel: definition, scope, connections, same-subject membership, evidence and
  reading, coverage, save.
- Text/table fallback that is always reachable.
- Mobile list mode below 720 px.
- Public variant: entrances, search, definitions and fallback are safe; relation edges are
  drawn only on the review surface. The public field states the withholding count and
  offers the atlas desk.

**Exit:** side-by-side at 1280/390, light/dark; keyboard script passes; fallback works
with JS off; no candidate claim in the public export.

### R2 · Atlas as a core experience

- One selection model shared by the Home neighbourhood and the atlas explorer
  (`lib/knowledge/neighbourhood.ts`): groups, direction, limit, hidden count, membership.
- Decide the canvas grammar: the prototype neighbourhood is the *local* view; the explorer
  is the *desk* view. Keep both, with a clear transition and breadcrumb
  (`Edition → Concept → Neighbourhood → Atlas desk`).
- Carry the explorer's evidence lens and inspector into the neighbourhood panel, so one
  interaction language serves both.
- Add the "home" for a concept: definition, evidence, lessons/practice, neighbourhood,
  atlas.
- Review surface: `HANSA_ATLAS_REVIEW_PREVIEW=1` (local only). Public surface remains
  gated. Before any deploy, scan `out/` to prove no review concept or claim is present.

**Exit:** an edition's concept opens its neighbourhood; the neighbourhood opens the atlas;
the atlas returns to the edition. Review data is labelled at every step. No publication
default changed.

### R3 · Timeline restoration

- Desktop: card fan, per-day content, ghost numerals, ruler and cables, selected card,
  latest pin, prev/next steppers, status footer.
- Input: drag with settle, horizontal wheel, click/Enter, arrows/Home/End, focus return.
- Mobile and keyboard: keep the shipped tick strip as the compact alternative (this is a
  deliberate synthesis, not a revert).
- Performance: cap the number of cards in the fan, precompute geometry, avoid layout
  thrash; measure against R0.

**Exit:** the first viewport reads as a date you can enter; the transcript of interactions
matches the prototype script; mobile strip still passes.

### R4 · Dealer, pocket and thread

- Dealer: modal with day rail, hand, reader, capability row, save, locate, focus trap.
  Keep the shipped cinematic deal as the opening transition, then settle into the hand.
- Pocket: slide-over with concepts, boards, routes, cards; persistence.
- Learning thread: numbered chips, clear, deep-linkable.
- Restore `?dealer=` so a deck can be shared.

**Exit:** a full edition can be dealt, read, saved and located without leaving the stage;
`Escape` unwinds layers in order.

### R5 · Closing and coverage

- Restore `Leave with one idea and one honest action.` with the reading quote, the reopen
  action and the pocket.
- Restore the coverage ledger and the denominator note; keep the destination cards as
  secondary.
- Restore an About/coverage surface reachable from the closing scene and the atlas desk.

**Exit:** the closing scene states what was read, what was not, and what to do next.

*Status 2026-11-05:* implemented as the R5 review slice behind
`HANSA_CLOSING_REVIEW=1` (`PROPOSAL-R5.md`, `ACCEPTANCE/R5-2026-11-05.md`) and
**accepted 2026-11-05**. The quote, the action and the ledger are restored; the
pocket is replaced by the dealer's own kept cards, and the About surface by the
ledger's coverage note plus the Atlas desk link. The flag stays off in the
shipped export; R6 is measuring its own slice next.

### R6 · Polish, accessibility, performance

- Apply the measured type scale and reduce mono-label noise.
- Fix the prototype's topbar overlap and sparse-field composition.
- Screen-reader pass (NVDA or VoiceOver), not only axe.
- Motion budget: every animation explains a change; reduced-motion parity.
- Performance comparison against `2026-11-04-pre-m6` and R0.
- Final visual acceptance against the checklist.

**Exit:** owner sign-off; the prototype remains frozen as the reference.

*Status 2026-11-05:* implemented as the R6 review slice behind
`HANSA_POLISH_REVIEW=1` (`PROPOSAL-R6.md`, `ACCEPTANCE/R6-2026-11-05.md`).
Measured first: 16 computed sizes, 33.1% mono labels, 3 targets under 44 px, and
no topbar overlap (57 px header, 152 px first scene). The layer names nine roles,
moves content values out of capitals, holds a 13 px prose floor, gives the three
small controls a 44 px row and unifies the scene rhythm (fill 71/89/68 ->
73/89/72). The h1 space and the duplicate reading heading ship in the public
build instead of behind the flag. A manual screen-reader pass remains NOT RUN;
the Chromium accessibility tree is recorded. Owner visual acceptance is pending,
so the accepted M6 type stays the flag-off default.

---

## 7. Safe implementation strategy

### 7.1 Architecture

| Concern | Approach |
| --- | --- |
| Reference | Prototype stays untouched. Screenshots + hashes are the baseline. |
| Components | New `components/knowledge/neighbourhood/` (`field.tsx`, `concept-panel.tsx`, `search.tsx`, `fallback.tsx`, `thread.tsx`) and `components/knowledge/intents/` (compare, apply, route). Compose them inside the existing stage; do not fork the Home again. |
| Model | Port `neighborhood-model.js` to typed `lib/knowledge/neighbourhood.ts` over `Atlas` + `Insight`. Pure functions only: selection, grouping, direction labels, hidden count, membership. Unit-tested against the prototype's rules. |
| Adapter | `lib/knowledge/neighbourhood-adapter.ts` maps `content/atlas/*` concepts/edges and the reviewed insight feed. Never import `prototype/data.js`. |
| Styling | Extend `stage-editorial.css` with scoped `--stage-*` tokens from §2.2. Do not overwrite global Tailwind tokens; domain colours become CSS variables. |
| Audience | Add `audience: "public" \| "review"` to the graph projection, mirroring `buildStageModel`. Default public. Review mode is explicit and local. Do not let a renderer decide visibility. |
| Flags | `HANSA_ATLAS_REVIEW_PREVIEW` for candidate atlas data; a separate build-time flag for the neighbourhood slice. The public static export is built with both off. |
| Leak guard | New verifier: scan `out/` for candidate claims/ids when flags are off; fail the build if review content appears. |
| Rollback | Each slice is a route/flag switch. Keep the M6 components until the replacement passes V5; no destructive deletion in the same change. |
| Deletion rule | No removed interaction is deleted silently. Each slice ships a "removed / changed / preserved" list in its proposal. |

### 7.2 Tests and gates per slice

- Unit: group assignment, direction labels, limit/expand, hidden count, same-subject is
  not a relation, unknown ids rejected, no invented edges.
- Component: keyboard navigation, focus return, search results, fallback disclosure.
- Browser: a fixed interaction script (select date → open edition → locate concept →
  explore branch → open content → compare → route → save → pocket → close), at 1280 and
  390, dark and light, reduced motion.
- Visual: screenshots compared to the pinned prototype set, reviewed by the owner, not
  auto-approved.
- Accessibility: axe, focus order, names/roles, contrast, dialog trapping, live regions.
- Content: no new claims; every edge traceable to `content/atlas` and its source ids.
- Performance: measure before/after; no regression beyond the agreed budget.
- Leak: `out/` scan for review data.

### 7.3 What stays closed

- Publication rules: no candidate edge becomes public because of this work.
- No new backend, paid service, secret exposure or third-party student data flow.
- No deployment as part of the restoration.
- No change to saved progress, question IDs or answer handling.

### 7.4 Known risks

| Risk | Mitigation |
| --- | --- |
| The restored field is sparse with 42 concepts / 49 edges | Improve composition rather than invent edges; cluster, prioritise by relevance, show membership context. |
| Review data leaks into the public export | Build-time flags off + `out/` leak scan + a dedicated public fixture test. |
| The atlas and Home diverge again | One model, one adapter, one relation vocabulary; shared tests. |
| Performance regression from the fan and field | Geometry precomputation, card cap, no per-frame DOM writes, measured budget. |
| Visual work outruns content truth | Every label comes from the atlas/insight data; no lorem, no invented relations. |
| Another unilateral swap | §8 process: proposal, side-by-side, removed list, owner approval, sign-off record. |

---

## 8. Visual acceptance process

The purpose is to stop "all gates green, design rejected" from happening again.

### 8.1 Gates

| Gate | What happens | Who signs |
| --- | --- | --- |
| **V0 · Baseline** | Freeze prototype + current build; capture fixed viewports/themes; record hashes, screenshots, performance | Agent records; owner informed |
| **V1 · Proposal** | One-page change proposal: intent, prototype reference, what improves, what is removed/changed/preserved, risks, rollback | Owner approves direction |
| **V2 · Slice** | Built behind a flag; side-by-side captures + live URL; interaction script; no default change | Agent presents |
| **V3 · Visual review** | Owner reviews at 1280/390, light/dark, reduced motion; scores the rubric; requests changes | Owner |
| **V4 · Engineering** | Unit/browser/a11y/leak/performance gates | Agent records |
| **V5 · Sign-off** | Acceptance record with commit, screenshots, rubric, open caveats; flag default decision | Owner |

No major UI replacement may skip V1 or V5. "Major" means: a scene's composition, the
timeline model, the dealer surface, the atlas entry, or any removal of an interaction.

### 8.2 Rubric (1–4, per slice)

1. **Composition and hierarchy** — one clear first read; title levels do not repeat.
2. **Visual identity** — serif/sans/mono roles, domain colour, material, restraint.
3. **Reading density and content fidelity** — real claims, real counts, no filler.
4. **Interaction parity** — the prototype's core moves exist or are deliberately replaced.
5. **Continuity** — edition → concept → neighbourhood → atlas → lesson/practice.
6. **Truth and publication posture** — candidate labelled, nothing invented, public
   default closed.
7. **Responsive and input parity** — mobile list, touch, keyboard, no hover-only content.
8. **Accessibility and motion** — focus, names, contrast, reduced motion, no-JS fallback.
9. **Performance** — within the agreed budget.
10. **Engineering integrity** — tests, verifiers, receipts, rollback.

Minimum to pass: 3+ on 1–5, 4 on 6, 3+ on 7–10. A 2 on identity or interaction parity is
a failed review regardless of test results.

### 8.3 Change proposal template

```
Slice:            R<n> · <name>
Prototype ref:    <file/section + screenshot>
Intent:           <one paragraph>
Improves:         <what gets better, with evidence>
Removed:          <explicit list, or "none">
Changed:          <explicit list>
Preserved:        <engineering + interactions>
Risks / rollback: <...>
Rubric (self):    <scores + justification>
Owner decision:   pending | approved | changes requested
```

### 8.4 Review rules

- The prototype is the reference until the owner replaces it. The current build is never
  the baseline by default.
- Screenshots are taken from the same machine, viewport, theme and motion setting; no
  cherry-picking. Both light and dark, desktop and mobile.
- A passing test suite is not a design pass. Both are required, neither substitutes.
- Removed interactions are listed before approval, not after.
- The agent does not self-approve a visual direction. Silence is not approval.
- Every acceptance record is kept in `docs/design-direction-recovery-20261104/ACCEPTANCE/`.

---

## 9. Decisions needed from the owner

1. **Baseline.** Confirm the prototype (`intelligent-atlas/prototype/`) is the design
   baseline for the restoration, including its serif/paper/domain-colour identity and the
   scene model. (This document assumes yes.)
2. **Review surface for candidate relations.** Choose one:
   - **A (recommended now):** keep the public build gated; build the full neighbourhood on
     a clearly labelled local review surface (`HANSA_ATLAS_REVIEW_PREVIEW=1`) for design
     evaluation, then decide publication separately.
   - **B:** show the labelled review neighbourhood in the product, with the public default
     still gated and a prominent "candidate · technical review" notice.
   - **C:** publish a reviewed seed (10–15 relations) so the neighbourhood is genuinely
     public. Slowest; requires review decisions, not design work.
3. **Dealer.** Restore the modal rail + hand + reader, keeping the cinematic deal as the
   entrance (recommended), or keep the inline one-card dealer and improve it?
4. **Timeline.** Desktop fan + mobile/keyboard strip (recommended), or the strip
   everywhere?
5. **Order.** Knowledge scene first (recommended: it is the missing core), or timeline
   first (more visible immediately)?

No implementation starts until 1–5 are answered.

---

## 10. Next atomic task

**R0 only, after approval:** commit the baseline (prototype hashes, evidence set, current
performance measurement, design checklist and acceptance template) and write the V1
proposal for R1. No UI change in R0.

If the owner approves the direction but wants to see something sooner, the smallest
honest slice is a **read-only neighbourhood preview on the review flag**: one concept, its
labelled branches, the panel and the fallback, wired to `content/atlas` — no publication
change, no Home swap.

---

## Appendix A · Prototype surface inventory

| Surface | Prototype file/section | Shipped status |
| --- | --- | --- |
| Stage topbar + scene nav | `index.html` `.topbar` | Replaced by global header |
| Timeline cards/fan/ruler | `app.js` §timeline, `timeline-model.js` | Removed |
| Selected peek + steppers | `app.js` `renderTimelineFacts` | Peek only |
| Dealer | `app.js` §dealer | Inline, reduced |
| Pocket | `app.js` §pocket | Removed |
| Subject entrances | `app.js` `renderEntrances` | Removed |
| Concept search | `app.js` `runSearch` | Removed |
| Neighbourhood field | `app.js` `renderNeighbourhood`, `placeNodes` | Removed |
| Relation model | `neighborhood-model.js` | Not used on Home |
| Context panel | `app.js` `renderConceptPanel` | Atlas inspector only |
| Compare | `app.js` `renderComparePanel` | Removed |
| Apply | `app.js` `renderApplyPanel` | Generic links |
| Goal routes | `app.js` `renderGoalPanel` | Removed |
| Learning thread | `app.js` `renderThread` | Removed |
| Closing ledger | `app.js` `renderClosing` | Removed |
| About / coverage | `app.js` `renderAbout` | Bibliography desk |
| Archive | — | Added |
| URL state | `app.js` `syncUrl` | `?insight=` only |
| Local persistence | `hansa.knowledge-stage.v31` | Theme only |
| Toasts + announcements | `app.js` `showToast`, `announce` | Partial |
| Reduced motion / mobile field | `app.js` `isStatic`, `placeNodes` | Partial |

## Appendix B · Prototype data facts used in the captures

- 15 days: 3 editions (24, 25, 26 Oct 2026), 12 quiet days; prototype clock 1 Nov 2026.
- 132 candidate concepts, 86 assertions, 15 comparison boards, 3 goal routes.
- Coverage: 38 of 4,337 eligible units read in context (0.88 %), 0 published concepts,
  0 / 628 media reviewed, 22 source files tracked.
- The graph is sparse by design: the highest-degree concept has four recorded relations
  (`concept:sql:grain`, `concept:sql:aggregation`, `concept:fabric:permissions`,
  `concept:fabric:security-model`).

## Appendix C · Shipped build facts used in the captures

- 3 editions; 42 concepts and 49 candidate connections under `technical_review`;
  0 published concepts and 0 published connections.
- Public atlas desk: 32 public Microsoft Learn sources.
- `npm run test:all` 257/257; lint 0 errors / 49 inherited warnings; `tsc --noEmit`
  clean; build + 434 aliases; five verifiers; `verify-canonical-home` 34/34;
  `qa-canonical-home` 49/49 with axe 0.
- These facts are recorded as engineering status, not as design acceptance.
