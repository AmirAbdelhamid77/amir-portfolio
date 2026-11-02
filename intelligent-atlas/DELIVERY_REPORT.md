# Intelligent Atlas — V3.1 Knowledge Stage delivery report

Date: 2026-11-01 (fixed prototype clock)  
Scope: **NEXT_PHASE_REVIEW, milestones M0–M5**  
Status: **delivered as an isolated review prototype and a separate public
projection.** No live-app integration, no deployment, no new dependency, no paid
service, no learner-data transfer.

> **Recovery pass, 2026-11-02.** The owner rejected the V3.1 visual outcome on
> three gates: the scene transition was lost, the card Timeline was replaced and
> the first graph view was incomprehensible. §12 records the recovery, its
> evidence, a newly found dialog-lock defect, the revised totals and the
> remaining limits. A second pass on the same date restores the earlier beUI
> card Timeline grammar — four cables per card, five gap ticks per gap, the year
> backdrop and 190 px cards — in place of the calendar date axis; §12.3 records
> that restoration and its own rollback baseline. Sections 1–11 are retained as
> the record of the V3.1 delivery; where they conflict with §12, §12 describes
> the current prototype.

Repository root for all paths: `D:/BeUI/amir-portfolio`. All new work is inside
`intelligent-atlas/`. HEAD is unchanged at
`45704b586237ae26a4c55be944d27147e84f491b`; 39 pre-existing dirty paths outside
`intelligent-atlas/` were not touched.

The pre-V3.1 report and payload are preserved byte-identically in
`intelligent-atlas/baselines/2026-11-01-pre-v31/` (18 files, SHA-256
fingerprints, `baseline.json`).

## 1. Outcome

V3.1 turns the earlier "date → one card → graph" prototype into an intent-led
Knowledge Stage:

1. **Timeline** — full-viewport, date-led entry. Latest recorded edition
   (26 Oct 2026) is selected; today (1 Nov 2026) stays visible and explicitly
   has no edition.
2. **Daily Dealer** — a real resolved deck, not a facet estimate. 150 deck keys:
   136 `ready`, 14 `empty`. The 26 Oct deck has one card; today's deck has zero
   cards and an honest empty-hand state.
3. **Scroll handoff** — the edition token shrinks into the field while the left
   copy keeps the active information readable. Progress-driven, not timed.
4. **Interactive Knowledge Graph** — four intents (Understand, Compare, Apply,
   Reach a goal) over 132 candidate concepts and 86 candidate assertions, with a
   semantic zoom starfield, explicit branch claims, Why-this evidence, contextual
   next actions, a Learning Thread, a Knowledge Pocket and honest cross-domain
   context.
5. **Closing** — one remembered idea, an eight-row coverage ledger and a way back
   to the edition.

The public artifact is a separate directory with its own renderer. It publishes
**zero** concepts, assertions and insights and shows only structure, provenance
and four unmet gate conditions.

## 2. The five named defects and their fixes

| Defect | Fix | Evidence |
| --- | --- | --- |
| Matcher output was treated as semantic reading | Reading, candidate verdict and publication are now separate ledger states. 38 units were read in context; the matcher's 3,609 matches never advance the reading state. | `analysis/semantic-ledger-v2.jsonl`, `analysis/semantic-ledger-v2.md`, `tests/semantic-ledger.test.mjs` 13/13 |
| Public and review payloads shipped together | Public and review are now physically separate directories with different data files and renderers. The public page fails closed if its projection is missing or malformed. | `public/` (4 files), `tools/verify-public-isolation.mjs` 33/33 |
| Routing sorted by shortest depth | Routes are built in dependency order. Stored `A → B` means "A requires B"; traversal reverses explicitly. A C→B→A fixture proves the order. | `lib/route-planner.mjs`, `tests/route-planner.test.mjs` 15/15 |
| Dealer schema allowed exactly one card | V2 deck contract supports empty, one and many cards, public withholding, LINK_ONLY, held questions, stale revisions and a card cap. The V1 single-card contract is retained as a compatibility adapter. | `contracts/deck-v2.schema.json`, `contracts/deck-resolver.mjs`, `contracts/deck-resolver.test.mjs` 24/24 |
| Timeline competed with the editorial inspector | Timeline is a full-viewport scene with no inspector; the inspector appears only in the Knowledge Stage, where the selected concept is the authored object and the field is context. | `prototype/index.html`, `prototype/styles.css`, keyframes 01–06 |

## 3. Artifacts

| Artifact | Path | Notes |
| --- | --- | --- |
| Review prototype | `intelligent-atlas/prototype/index.html` | Opens from `file://`; no build, no framework |
| Review payload | `intelligent-atlas/prototype/data.js` | ≈2.75 MB generated; 132 concepts, 86 edges, 150 decks |
| Public projection page | `intelligent-atlas/public/index.html` | Separate renderer, separate data, zero published records |
| Public projection data | `intelligent-atlas/public/public-data.js` | 1.4 KB; allowlisted keys only |
| Semantic ledger | `intelligent-atlas/analysis/semantic-ledger-v2.jsonl` | 6,201 rows, one per unit |
| Deck contract | `intelligent-atlas/contracts/deck-v2.schema.json` | Current contract |
| Route planner | `intelligent-atlas/lib/route-planner.mjs` | Topological ordering |
| Storyboard | `intelligent-atlas/storyboard/v31/` | 11 frames, contact sheet, `STORYBOARD.md` |
| Keyframes and motion | `intelligent-atlas/evidence/v31/` | Six keyframes, 12 motion frames, receipts |

Everything runs from the filesystem. There is no server, bundler, framework,
database or third-party request.

## 4. Data and contracts

| Measure | Value |
| --- | ---: |
| Extracted units | 6,201 |
| Eligible for semantic reading | 4,337 |
| Metadata-only | 1,859 |
| Non-learning | 5 |
| Candidate-matched | 3,609 |
| Reason-coded unmatched | 728 |
| Candidate concepts | 132 |
| Candidate assertions | 86 |
| Comparison boards | 15 |
| Editions | 3 |
| Timeline days | 15 |
| Goal routes | 3 (all `complete`, 0 gaps) |
| Resolved decks | 150 (136 `ready`, 14 `empty`) |
| Published records | 0 |

Graph build `ia-graph-bed4e12d0986`; source index `ia-source-e0f38b64d252`.
Domain split: fabric 64, sql 23, statistics 23, visualization 16, analysis 6.

Deck resolution happens at build time through `contracts/deck-resolver.mjs`, so
the browser renders contract-tested output instead of reimplementing the rules.
The reader has exactly two payload modes: `inline` (insight:
scenario/prediction/takeaway/caveat; route step: step/concept/reason/conditions/
gap) and `reference` (role/locator). Card kinds are `insight`, `resource` and
`route-step`.

## 5. Semantic coverage — the honest denominator

| State | Count |
| --- | ---: |
| Semantically read | **38** |
| Not read | 4,299 |
| Published | **0** |

38 of 4,337 eligible units is **0.88%**. Of the 38 readings: 10 accepted, 17
revised, 7 held, 4 unresolved gaps. The 21-unit stratified sample was selected by
deterministic SHA-256 ordering, not by convenience.

What the reading actually did: each unit was opened with its parent context, read
for its real claim, then compared with the matcher's candidates. Evidence quotes
are verbatim substrings verified by the ledger builder. The readings changed the
graph: 17 units revised the candidate meaning, 7 were held, and 6 matcher false
positives were recorded rather than silently repaired.

What it did not do: read the remaining 4,299 eligible units, review media or
rendered pages, or approve anything. **No unit is published.**

Known extraction defects, recorded as gaps rather than repaired by inference:

- formula bodies missing in `stats:s11`, `stats:s13`, `stats:s14`;
- code asterisks lost (`COUNT( )`);
- a heading-only academy lab;
- templated `fabric-notes` summaries;
- emphasis markers joining words (`alinearassociation`).

Documented matcher false positives:

- "select all that apply" → `concept:sql:select`;
- "pipeline" in a visualization workflow → `concept:fabric:pipeline`;
- "parameter" → `concept:fabric:pipeline-parameter`.

## 6. Verification

Every harness lives in the repository and rewrites its own receipt. Total:
**216 checks — 70 Node tests and 146 browser checks — 216 pass, 0 fail**, with
0 console errors and 0 page errors across the browser harnesses.

| Harness | Result | Receipt |
| --- | --- | --- |
| Route planner | 15/15 PASS | `tests/route-planner.test.mjs` |
| Deck resolver | 24/24 PASS | `contracts/deck-resolver.test.mjs` |
| Semantic ledger | 13/13 PASS | `tests/semantic-ledger.test.mjs` |
| Public projection | 11/11 PASS | `tests/public-projection.test.mjs` |
| Legacy adapter proof (archived V1) | 7/7 PASS | `contracts/adapter-proof.test.mjs` |
| Browser behaviour | 31/31 PASS | `evidence/v31/browser-qa-v31-core.json` |
| Storyboard and motion capture | 22/22 PASS | `evidence/v31/storyboard-capture-v31.json` |
| Responsive 390 / 768 / 1280 | 60/60 PASS | `analysis/responsive-qa-v31.json` |
| Public isolation | 33/33 PASS | `analysis/public-isolation-v31.json` |

Notable behaviours proved by the browser harness:

- default date is the latest edition (2026-10-26), not today;
- today resolves `no-edition-for-date` with 0 cards and an empty-hand state;
- 132 nodes and 86 edges render; default overview scale 0.361 is the dense
  starfield;
- search dims 130 of 132 nodes and Enter opens the first match;
- compare renders a board, and a concept with no board shows an honest
  "no board includes it" state;
- `concept:stats:standard-error` has no application resource and shows a
  coverage-gap message instead of an empty list;
- self-report is local only and survives a route re-render;
- URL state restores theme, intent, date, concept, comparison, goal and pocket;
- Escape closes the Dealer, releases scroll lock and returns focus to the opener.

The responsive harness previously failed at 390 px because the decorative
handoff orbit and the field fallback table overflowed the document. Both are
fixed: the orbit is clipped inside its own stage, and the fallback table now
scrolls inside a labelled, keyboard-focusable wrapper. All 60 checks pass,
including new handoff-readability checks at each width.

## 7. PASS / FAIL / NOT RUN / BLOCKED

These are separate claims. A pass in one row is not evidence for another.

### 7.1 Prototype behaviour — PASS

- **PASS** — 31/31 browser checks at 1440 × 960, 0 console errors, 0 page errors.
- **PASS** — 60/60 responsive checks at 390, 768 and 1280, no horizontal overflow
  in any scene, Dealer and Pocket inside the viewport.
- **PASS** — 22/22 storyboard and motion checks, including scroll progress
  0 / 0.5 / 1 and the reduced-motion static equivalent.
- **PASS** — keyboard: Escape closes the Dealer, restores focus and releases the
  scroll lock. Search (Enter opens the first match), rail selection and intent
  switching are exercised by the harness.
- **PASS** — 390 px handoff: token and copy both inside the viewport, no
  document overflow.

### 7.2 Integration — NOT RUN

- **NOT RUN** — no mount at `/` or `/prototype-c/`, no `app/` import, no route
  change. This was explicitly outside the selected scope (M0–M5).
- **NOT RUN** — the resource card reports its application route
  (`/learn/statistics/source/#s13`) but that route was not resolved against the
  running application. The prototype states this rather than faking navigation.
- **NOT RUN** — no production build, no bundle-size measurement, no deployment.

### 7.3 Scientific validity — FAIL for a full-corpus claim, partial for the read subset

- **FAIL** — the deliverable cannot claim that the 132-concept graph is a
  validated reading of the corpus. 38 of 4,337 eligible units were read (0.88%).
- **FAIL** — no human scientific review, no domain-expert sign-off, no
  contradiction adjudication beyond the recorded register.
- **PARTIAL** — the 38 read units have parent context, verbatim evidence, a
  decision and a stated gap. 17 of them revised the matcher's meaning.
- **PARTIAL** — extraction defects are recorded as unresolved gaps instead of
  being repaired by inference.
- **NOT RUN** — numeric or formula re-derivation for the statistics families;
  media and rendered pages were not visually reviewed.

### 7.4 Public coverage — FAIL, by design

- **FAIL** — 0 published concepts, 0 published assertions, 0 published insights.
  No record has passed the four-condition publication gate.
- **PASS** — the public artifact is physically isolated: only four files, no
  candidate ids, no edition dates, no deck keys, no review API, no reference to
  the review prototype. 33/33 isolation checks pass.
- **PASS** — tampered URL and storage cannot unlock review records.
- **PASS** — a missing or malformed projection fails closed with a visible
  explanation instead of falling back to candidate data.
- **NOT RUN** — public usefulness. There is nothing published to use yet, and
  this delivery does not create a publication process.

### 7.5 Owner visual acceptance — NOT RUN

- **NOT RUN** — no human has accepted the visual direction, the light/dark
  presets, the six keyframes or the nine-frame storyboard.
- **NOT RUN** — no accessibility conformance audit (screen reader, contrast
  conformance, zoom 200%, forced colours). Keyboard and reduced-motion paths are
  exercised, which is not the same thing.
- **PARTIAL** — the contact sheet and keyframes are captured and inspectable;
  `prefers-contrast: more` and `prefers-reduced-motion: reduce` have explicit
  styles.

### 7.6 Repository and reference integrity — BLOCKED on an inherited hash

- **BLOCKED** — `node scripts/verify-agent-reference.mjs`,
  `node scripts/verify-knowledge-atlas.mjs` and
  `node scripts/verify-easyui-integration.mjs` all stop at the same pre-existing
  assertion in `scripts/hansa-integration-receipt.mjs`:

  ```
  lib/atlas/field.ts
  actual   da571a671ce66a538f6050e6fe8d8ae3caf6b5e4a4befe6ea184e598a9d8af95
  expected 79f985b31e5010a8ad2c910c45bd934bc34841217881fdca9273e991790001ff
  ```

  This drift predates V3.1 and is outside `intelligent-atlas/`. The expected
  hash was **not** edited to make the check pass.
- **PASS** — the V3.1 package verifier reads all 7 documents and 753 source
  files with 0 broken local links and 0 placeholders. It reports `pass: false`
  only because it lists the intended source changes, which is expected for an
  implementation phase.
- **PASS** — the pre-V3.1 baseline is byte-identical (18 files) with recorded
  SHA-256 fingerprints.

## 8. Costs

| Item | Cost |
| --- | --- |
| New paid dependency | none |
| New runtime dependency | none |
| Backend or service | none |
| Deployment | none |
| Third-party data transfer | none |
| QA tooling | `playwright-core` 1.64.1 and Microsoft Edge 156.0.4314.58, already present locally |

The prototype is plain HTML, CSS and JavaScript. The public artifact adds 1.4 KB
of generated JSON plus one small renderer.

## 9. Preservation and rollback

Preserved unchanged:

- 39 pre-existing dirty paths outside `intelligent-atlas/`;
- every route, question id, answer, formula, code sample, media reference and
  saved-progress key in the source corpus;
- the inherited `lib/atlas/field.ts` hash drift (recorded, not "fixed");
- the V1 single-card contract, kept as a compatibility adapter and proved
  against the frozen baseline.

Rollback is file-level and does not require git:

1. copy `intelligent-atlas/baselines/2026-11-01-pre-v31/files/` over
   `intelligent-atlas/`;
2. delete every path inside `intelligent-atlas/` that the baseline does not
   contain (for example `public/`, `storyboard/`, `evidence/v31/`, `semantic/`,
   `tests/`, the `*-v2` and `*-v31` analysis files, `lib/route-planner.mjs`,
   `contracts/deck-*` and the V3.1 tools);
3. the repository outside `intelligent-atlas/` was never modified, so nothing
   else needs reverting.

## 10. Caveats

> These caveats describe V3.1. The recovered prototype no longer has a four-mode
> dashboard, a mandatory long inspector, a fit-all field or 156 px node-label
> truncation. §12.8 lists the current caveats.

- **The graph is a candidate graph.** It is safe to inspect and unsafe to quote
  as published knowledge.
- **The semantic layer is 0.88% read.** Coverage claims in the UI say so.
- **Comparison coverage is partial.** 27 of 132 concepts have a board (24 with
  one board, 3 with two). Concepts without a board show an explicit
  "no board includes it" state.
- **Apply coverage is partial.** 99 of 132 concepts have an application
  destination; `concept:stats:standard-error` deliberately shows a gap.
- **Node labels truncate at 156 px** in the field. The full label is in the
  inspector, the `title` attribute and the table fallback. This is a layout
  constraint of the fixed 1900 × 1450 world, not missing data.
- **Routes are dependency-correct, not shortest.** That is intentional: the
  shortest path is not the pedagogically correct one.
- **Pocket, thread and self-report are browser-local.** Clearing site data
  removes them.
- **Today has no edition on purpose.** It keeps the zero-card path reachable and
  testable; it is not a data bug.

## 11. Next atomic task

Publish nothing. The next honest step is **one domain-complete semantic pass**:
read every eligible `statistics` unit (145 units, 6 already read) with the same
parent-context method, record accept/revise/hold/gap per unit, and re-run
`build-semantic-ledger.mjs` so the ledger's read share moves from 0.88% to a
defensible per-domain claim. That is a bounded, checkable task that does not
require publication, integration or a new dependency.

## 12. Recovery pass — 2026-11-02

Scope is unchanged: **NEXT_PHASE_REVIEW, M0–M5**, isolated prototype only. No
`app/` integration, deployment, publication, paid service or learner-data
transfer. The five contract-level fixes in §2 are retained; the visual layer was
rebuilt on top of them. `prototype/data.js` was not regenerated or hand-edited.

### 12.1 The three rejected gates, recovered

| Gate | Recovered behaviour | Evidence |
| --- | --- | --- |
| **Lost scene transition** | One 300svh track and one sticky stage (100svh minus the 64 px topbar) share a single normalized progress value and one `requestAnimationFrame`. Timeline content leaves at 0.15–0.22, the knowledge veil rises at 0.15–0.25 and knowledge content rises at 0.17–0.36; knowledge exits at 0.68–0.74 and closing content rises at 0.69–0.82. Active scenes switch at 0.22 and 0.74. Reverse scroll reverses, pausing pauses, the Dealer stores and restores the exact `scrollY`, hidden scenes are `inert`, reduced motion and ≤900 px use normal flow. | `tools/qa-stage.mjs` 61/61; checkpoints 0/25/50/75/100; `evidence/recovery/motion/forward.gif`, `reverse.gif` |
| **Replaced Timeline** | The recognizable beUI card Timeline is back: a focused 26 Oct card at 190 px, receding neighbours at 0.72 scale, four cable lines per card fading out from the centre, five gap ticks per gap, the 2026 year ghost, a playhead, drag/release with velocity projection, horizontal wheel, Arrow/Home/End and visible focus. The calendar day axis, full-width footer inspector and competing editorial panel are gone. Today (1 Nov) stays empty with “No edition today” and “0 cards”; opening today's empty hand shows subject entrances and never locates an unrelated concept. | `tools/qa-stage.mjs` 61/61, `tools/qa-recovery.mjs` 70/70; `evidence/recovery/before/before-timeline-1440-light.png` and `stage/timeline-1440-light.png`; dark theme in `stage/timeline-1440-dark.png` and `responsive/390-timeline-dark.png`; `interaction/10-return-timeline.png` |
| **Incomprehensible graph** | The first view is five subject entrances plus search when no concept is selected. Entering from the 26 Oct card opens the OneLake shortcut with three labelled branches (OneLake, Copy job, Database mirroring). “Open content” opens the concept deck; “Explore connections” moves the neighbourhood. The remainder is explicit and expands to eight. Search and the complete 132-row table reach every concept. The neighbourhood membership rail appears only when a concept has 1–2 semantic neighbours and is labelled “membership, not a relation”. There is no pan/zoom/fit-all field on first view. | `tools/qa-recovery.mjs`, `tools/qa-responsive.mjs` 73/73; `evidence/recovery/storyboard/03-located.png`, `04-preview.png` |

The four-mode dashboard, Pocket and the long inspector are no longer mandatory
first-view tasks. They are contextual controls or disclosures; the compact
context panel appears only in the Knowledge scene.

### 12.2 The five named defects re-checked in the recovered layer

| Defect | Retained fix | Recovery check |
| --- | --- | --- |
| Matcher output treated as semantic reading | Reading, candidate verdict and publication remain separate states. The UI says 38 of 4,337 eligible units were read (0.88%) and marks candidate records. | `tests/semantic-ledger.test.mjs` 13/13; visible candidate badges |
| Public and review payloads shipped together | `prototype/` and `public/` remain physically separate with different data and renderers. | `tools/verify-public-isolation.mjs` 33/33; 0 published concepts/assertions/insights |
| Routing sorted by shortest depth | The dependency-order route planner is unchanged. | `tests/route-planner.test.mjs` 15/15 |
| Dealer schema allowed exactly one card | Deck V2 supports empty, one and many cards. 150 decks: 136 ready, 14 empty. 26 Oct has one card; today has zero cards and an empty hand. | `contracts/deck-resolver.test.mjs` 24/24; `qa-stage` empty-hand checks |
| Timeline competed with the editorial inspector | The Timeline has no inspector. The selected concept is the authored object in Knowledge; the graph is its context. The selected moment is a compact peek under the stage, not a second full-width panel. | `qa-stage` 61/61; `stage/timeline-1440-light.png` |

### 12.3 What changed

| File | Change |
| --- | --- |
| `prototype/index.html` | Stage/track structure, two-column Timeline heading, card markup, neighbourhood canvas, membership strip, branch preview, thread drawer, model script tags |
| `prototype/styles.css` | beUI Timeline grammar (asymmetric cards, four-line cable fan, five-tick gap ruler, 330 px year ghost, playhead, deck stacks), two-column header, compact moment peek, fade-through crossfade, neighbourhood radial and list layouts, compact panel, closing, responsive and reduced-motion rules, `overflow: clip` dialog lock |
| `prototype/app.js` | Rewritten against the new markup: one progress/rAF, scene activation and `inert`, beUI card Timeline rendering, cable/ruler geometry, pointer-capture drag with velocity projection and horizontal wheel, local neighbourhood, Dealer lock/restore, saved state |
| `prototype/timeline-model.js` | Pure adapter and 190 px/212 px/0.72-scale geometry for the card Timeline |
| `prototype/neighborhood-model.js` | Pure local graph, subject entrances and membership model |
| `tests/timeline-model.test.mjs` | 10 new tests |
| `tests/neighborhood-model.test.mjs` | 11 new tests |
| `tools/qa-lib.mjs` | Shared browser, layout, progress, GIF, screencast and flat-frame helpers |
| `tools/qa-stage.mjs` | Rewritten, 61 checks (was 31); includes six beUI-grammar checks |
| `tools/qa-recovery.mjs` | Interaction and preservation suite, 70 checks |
| `tools/qa-responsive.mjs` | Rewritten, 73 checks (was 60) |
| `tools/capture-storyboard.mjs` | Rewritten, 18 checks; before/checkpoint/storyboard/GIF capture |
| `evidence/recovery/`, `analysis/*-recovery.json` | Before/recovered images, five checkpoints, storyboard, motion recordings, receipts |
| `baselines/2026-11-02-pre-recovery/` | Seven-file rollback snapshot with SHA-256 hashes |
| `baselines/2026-11-02-pre-timeline-restore/` | Seven-file rollback snapshot taken before the beUI Timeline restoration, with SHA-256 hashes |

The Timeline restoration is a port of the pre-V3.1 beUI grammar, not a new
visual language. It restores the two-column heading, the 190 px card, the
four-cable fan, the five-tick gap ruler, the year ghost and the compact moment
peek, while keeping the recovered single-viewport transition and the current
review payload. Two deliberate differences from the pre-V3.1 file: the “latest”
badge moved to the card's top-left so it cannot collide with the `ED 03` tag,
and the horizontal mask moved from the stage to the card track, which also keeps
the `18 Oct` and `1 Nov` ruler captions fully legible at both ends. The calendar
day axis, the full-width footer inspector and the separate editorial panel are
absent. `prototype/data.js` was not regenerated or hand-edited.

### 12.4 Defects found by the recovery QA and fixed

1. The footer **“Locate in knowledge”** button had no `data-act`, so the
   delegated handler never fired. Added `data-act="dealer-locate"`.
2. Preview actions disappeared when the pointer moved from a node toward the
   preview card. `pointerout`/`focusout` now keep the preview alive when the
   related target is inside `#branch-preview`; the preview cleans up on its own
   `pointerleave`/`focusout`.
3. Two contrast nodes overlapped and one was clipped at the canvas edge. The
   fixed angle spread was replaced with a collision-aware radial placement
   (28 relaxation passes, clamping, centre treated as fixed) and a vertical list
   below 720 px canvas width.
4. The mobile list kept a fixed 480 px canvas height and left a large blank
   area. `.nb.is-list-layout` now auto-heights and lets the canvas grow.
5. **New, found in the motion evidence:** opening the Dealer at the Knowledge
   scene blanked the viewport for about four frames.
   `html.is-stage-locked { overflow: hidden }` kept `scrollY` but re-based the
   sticky stage at scroll 0, moving it 1,091 px above the viewport while the
   dialog faded in. Replaced with `overflow: clip`, which forbids scrolling and
   leaves the sticky stage in place. `qa-stage` now checks that the stage stays
   on screen and that wheel/PageDown cannot scroll behind the dialog; every
   recorded frame is also checked for flatness (`frameStats`).
6. In the restored card, the “latest” badge at the top-right sat on top of the
   `ED 03` tag. Moved to the top-left, where it clears both the tag and the
   weekday line.
7. The stage-level horizontal mask clipped the ruler captions to “OCT” and
   “1 N”. The mask now lives on the card track, so cards still fade at the
   stage edges while the `18 Oct` / `1 Nov` captions remain legible.
8. The first restoration pass had collapsed the heading to one column and lost
   the earlier balance. The two-column heading/lede grid is restored and
   collapses again at ≤900 px.

The flat-frame guard is direct evidence for the “no blank viewport” gate:
forward minimum stdev 10.2, reverse 9.2, interaction 10.1; zero frames below 5.

### 12.5 Verification

| Suite | Checks | Result | Receipt |
| --- | ---: | --- | --- |
| Node tests (`intelligent-atlas/tests/`) | 60 | 60/60 PASS | `tests/*.test.mjs` |
| Deck resolver | 24 | 24/24 PASS | `contracts/deck-resolver.test.mjs` |
| Legacy adapter proof | 7 | 7/7 PASS | `contracts/adapter-proof.test.mjs` |
| Desktop stage and motion | 61 | 61/61 PASS | `analysis/qa-stage-recovery.json` |
| Interaction and preservation | 70 | 70/70 PASS | `analysis/qa-recovery.json` |
| Responsive, touch and reduced motion | 73 | 73/73 PASS | `analysis/qa-responsive-recovery.json` |
| Storyboard and motion capture | 18 | 18/18 PASS | `analysis/storyboard-recovery.json` |
| Public isolation | 33 | 33/33 PASS | `analysis/public-isolation-v31.json` |
| **Total** | **346** | **346/346 PASS** | 0 FAIL, 0 BLOCKED, 0 NOT RUN |

All browser suites report zero console errors and zero page errors. Node tests
resolve `intelligent-atlas/` from the repository root, so run them from
`D:/BeUI/amir-portfolio`; the browser harnesses resolve their own paths.

**Recordings.** Forward: 184 raw frames → 98 GIF pages, 4.02 MB. Reverse: 177 →
90 pages, 3.73 MB. Interaction (date → deck → idea → concept → branch → search
→ table → return): 142 → 117 pages, 3.37 MB. All are 720 × 480, loop 0, delays
20–240 ms, with the complete raw PNG sequence retained. GIF page counts are
lower than raw frame counts because libvips merges identical consecutive frames;
no frame is missing from the raw sequence. The three recordings were regenerated
after the Timeline restoration; every frame was checked for flatness and none
fell below 5 stdev.

**Checkpoints.** 0/25/50/75/100 % stills and an 18-point progress sample. At every
sample the strongest visible scene content is at least 0.2 opacity, so the
viewport never empties; at 25 % the outgoing Timeline has cleared and the
incoming Knowledge content is visible; at 75 % Knowledge has cleared and Closing
is visible.

**Preservation.** Review payload fingerprint
`7e4aba62eee04d7908d6145c4ddbba54e6901c8a6b2cd8086d5dfacc4d18ee36` still
matches `data-provenance.json`. Counts are unchanged: 132 concepts, 86 candidate
edges, 150 decks (136 ready / 14 empty), 3 editions, 15 days. Public projection
publishes 0 concepts, 0 assertions and 0 insights and withholds 132/86/3.
Saved concept, date, pocket, thread and dark theme survive a reload under
`hansa.knowledge-stage.v31`. Both seven-file rollback baselines — pre-recovery
and pre-Timeline-restore — verify 7/7 SHA-256 hashes.

### 12.6 Costs

| Item | Cost |
| --- | --- |
| New paid dependency | none |
| New runtime dependency | none |
| Backend or service | none |
| Deployment | none |
| Third-party data transfer | none |
| Capture tooling | `playwright-core` 1.64.1, `sharp` 0.35.5 and Microsoft Edge, already present locally |
| MP4 encoding | blocked: no ffmpeg or other encoder; GIF plus raw frames is the fallback |

### 12.7 PASS / FAIL / NOT RUN / BLOCKED

Counts for this recovery: **PASS 346 checks**, **FAIL 3 claims**, **NOT RUN 4
areas**, **BLOCKED 3 items**. These are separate claims; a pass in one row is not
evidence for another.

**PASS**

- 346/346 checks: 91 Node, 222 browser, 33 public isolation; 0 console/page
  errors. The browser total is 61 stage + 70 interaction + 73 responsive + 18
  storyboard.
- The three rejected gates pass in the isolated prototype: one continuous
  viewport transition, the card Timeline, and a readable local neighbourhood.
- The five named defects remain fixed at the contract level.
- Data, identifiers, decks, public isolation and saved progress are preserved.
- Both seven-file rollback baselines are byte-identical (7/7 hashes each).

**FAIL**

- The graph is still a candidate graph, not a validated reading of the corpus.
  38 of 4,337 eligible units were read (0.88%).
- 0 concepts, 0 assertions and 0 insights are published. This is intentional.
- No human scientific, rights, accessibility, assessment or owner visual review
  has been performed. Owner acceptance is **NOT RUN**.

**NOT RUN**

- No `app/` integration, mount, production build or deployment.
- The prototype clock remains **2026-11-01**; the real 2 Nov 2026 data was not
  regenerated in this visual increment.
- No screen-reader, contrast-conformance, 200 % zoom or RTL audit. Keyboard,
  touch, dark theme and reduced motion are exercised, which is not the same.
- No publication process or reviewer sign-off.

**BLOCKED**

- The inherited reference verifiers still stop on the pre-existing
  `lib/atlas/field.ts` hash drift:
  `actual da571a671ce66a538f6050e6fe8d8ae3caf6b5e4a4befe6ea184e598a9d8af95`,
  `expected 79f985b31e5010a8ad2c910c45bd934bc34841217881fdca9273e991790001ff`.
  The expected hash was not edited.
- MP4: no encoder is installed.
- Human publication review.

### 12.8 Caveats

- The prototype clock is frozen at 2026-11-01. 1 Nov intentionally has no
  edition; it must not be redirected to 26 Oct or read as a data failure.
- Unreviewed relations remain visibly identified in review and excluded from
  public data. The prototype never claims the corpus is semantically read.
- Membership is not a semantic relation. The neighbourhood rail's three
  same-subject chips are labelled as membership; concepts with 3+ semantic
  neighbours do not get that rail. The context panel separately lists same-subject
  concepts under “Also in …”, outside the semantic connection count.
- 25 zero-edge concepts are reachable through their subject entrance, search and
  the complete table. That is discoverability without an approved edge, not a
  fabricated connection.
- The Timeline is a restoration of the pre-V3.1 beUI grammar, rebuilt against
  the current payload. It is not a restoration of the old `data.js`; the payload
  and its fingerprint are unchanged.
- The transition is a fade-through veil, not a literal double exposure: the
  outgoing text clears before the incoming content rises. That is intentional
  and prevents text collision.
- `overflow: clip` is required for the dialog lock. In a browser without it the
  page may scroll behind an open dialog, but it will not blank.
- GIFs are 720 × 480 and deduplicated; the raw frames are complete. MP4 remains
  unavailable.
- No human visual, scientific or accessibility acceptance exists yet.

### 12.9 Next atomic task

Review the three gates against the recorded evidence: the
before/recovered pair `evidence/recovery/before/before-timeline-1440-light.png`
and `stage/timeline-1440-light.png`, `motion/forward.gif`, `motion/reverse.gif`,
`motion/interaction.gif` and the 0/25/50/75/100 checkpoints. Record accept/reject
per gate. Rollback is `baselines/2026-11-02-pre-timeline-restore/` (7 files,
SHA-256) or `baselines/2026-11-02-pre-recovery/` for the pre-recovery layer. If
accepted, the next implementation task remains **one domain-complete semantic
pass** (statistics), not publication, integration or deployment.

### 12.10 Testable build (owner hand-off, 2026-11-02)

The review build is served read-only from the isolated folder and also packaged
for offline testing. Nothing is deployed.

- Live: `http://127.0.0.1:4173/prototype/index.html` (local static server rooted
  at `intelligent-atlas/`, PID 27880, read-only, no writes).
- Package: `evidence/recovery/hansa-timeline-prototype-2026-11-02.zip`,
  288,634 bytes, SHA-256
  `01729a8066e53d9408b6432ba60c8db94a6fc7f5509fd6335b88f714d76834fa`,
  holding `index.html`, `styles.css`, `app.js`, `data.js`,
  `timeline-model.js`, `neighborhood-model.js`.
- Deep links: `?theme=dark`, `?theme=light`, `?intent=goal`,
  `?dealer=daily:2026-10-26`, `?date=2026-11-01`,
  `?concept=concept:stats:standard-error`,
  `?comparison=assert:ia:fabric-shortcut-copy`.
- Verified after packaging: title `Hansa · Knowledge Stage — review prototype`,
  15 Timeline cards, focused card `Reference ≠ retained result`, **0 console and
  0 page errors**, `qa-stage` **61/61**. The inline SVG favicon added to
  `prototype/index.html` removes the earlier `/favicon.ico` 404; no styles,
  behaviour or payload changed.

