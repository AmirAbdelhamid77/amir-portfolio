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


## 13. M0 re-baseline and reconciliation — 2026-11-03

Milestone M0 of `docs/knowledge-stage-next-phase-v3-20261101/NEXT_PHASE_PLAN_EN.md`
§5. Documentation, tooling and evidence only: no `app/` file, no prototype byte,
no dependency and no route changed.

### 13.1 Baseline

`tools/capture-baseline.mjs` gained an optional `<stamp> <note>` pair and ran as
`node intelligent-atlas/tools/capture-baseline.mjs "2026-11-03-pre-m0" "<note>"`.
It preserved **32 files, 3.8 MB** at HEAD
`88158d689f39fe17cc8fea4acfbd675dcc732349` into
`baselines/2026-11-03-pre-m0/`, with SHA-256 per file and the dirty-path list.
The 2026-11-01 and 2026-11-02 baselines are untouched.

### 13.2 Corpus reconciliation v3

`tools/reconcile-sources.mjs` now takes a version argument, so the dated v2
record is not overwritten, and one reporting defect was fixed: the untracked
count printed `[object Object]` because it interpolated the array instead of its
length. `node intelligent-atlas/tools/reconcile-sources.mjs v3` produced
`analysis/source-reconciliation-v3.{md,json}`.

| Denominator | Count |
|---|---:|
| Manifest source files | 22 |
| Current content files discovered | 130 |
| Extracted units | 6,201 |
| Eligible units | 4,337 |
| Metadata-only units | 1,859 |
| Non-learning units | 5 |
| Unique canonical resources | 4,925 |
| Revision overlay units | 222 |
| Discoverable routes | 73 |
| Media references | 628 |

Diff v2 → v3 is the title, the date, the count fix and one limits sentence.
**Every denominator is identical**, so the earlier corpus claims still hold and
nothing was re-scoped to make a number look better. Tracked source files: 22
unchanged, 0 changed, 0 missing. Untracked content: 108 files (59 intake exports,
49 live), 15 families.

### 13.3 Verifier failures: inherited versus new

At M0 start all three reference verifiers failed. None of the failures was
caused by M0. The chain is five receipt layers deep and every layer asserts the
literal hash recorded when it was written, so any later authorized change turns
it red. The audit found **47 distinct drifted paths**, and each one was
attributed to a commit:

- this session's authorized `/learn` migration (`65b5583`…`88158d6`),
- the 2 Nov review snapshot (`0902e15`),
- earlier authorized waves (`0e5c7cd`, `2f903ff`, `df5aecb`, `6c1a3e2`,
  `f937869`).

Two inherited entries were proved inert before being recorded: the `lib/atlas/field.ts`
edit is comment-only (the TypeScript token stream is identical at `45704b5` and
HEAD), and `components/cinematic/use-scroll-progress.ts` has not changed since
`0e5c7cd`. The 2 Nov snapshot also deleted three cinematic files and
`components/knowledge/knowledge-atmosphere.tsx`; those deletions were never
recorded, so several layers could only express them as "must still exist".

### 13.4 The successor receipt layer

No older manifest was edited and no expected hash was rewritten to obtain a green
result. A new append-only layer records the transitions:

`docs/knowledge-stage-m0-20261103/INTEGRATION_MANIFEST.json`
(`scope: hansa-knowledge-stage-m0-20261103`), read by
`scripts/knowledge-stage-receipt.mjs`, which is wired under
`hansa-integration-receipt.mjs`.

| Record | Count |
|---|---:|
| Content pins (path + predecessor hash + current hash) | 425 |
| Additions since the Atlas inventory (path + hash, no predecessor) | 233 |
| Removed artifacts (path + last recorded hash) | 7 |
| Excluded artifacts (path + reason) | 3 |
| Predecessor-manifest transitions | 11 |

Every pin states `layer`, `attribution` and `note`. The 425 pins split into 257
line-ending transitions (§13.9), 66 from this session's migration, 76 inherited
from earlier authorized waves, 26 receipt repairs and 1 proved inert. The three
excluded artifacts are generated files the repository never commits — the
TypeScript build cache at the root and at `circular-nodes/before/`, and
`next-env.d.ts` — because their bytes change per build and per toolchain, so they
can never be a stable reference (§13.10). Ten of the eleven predecessor records
exist for the same reason as the pins — the older layer recorded the bytes of a
manifest, baseline or rollback copy that the checkout rewrote — and one resolves
the 2 Nov content rewrite of `docs/canonical-home/INTEGRATION_MANIFEST.json` for
the cinematic layer.

Supporting fixes, each of which makes an existing assertion honest rather than
weaker:

- `final-review-receipt.mjs` no longer demands that a historical transition still
  equal its 28 Oct bytes when no frozen capture exists; the successor chain
  checks the current bytes on the next assertion. It also accepts the four
  script entries the curriculum wave added and the deleted preserved additions.
- `hansa-integration-receipt.mjs` consults the successor for observed pins and
  can skip a retired path.
- `cinematic-phase2-receipt.mjs` resolves a predecessor through the successor
  record and skips retired artifacts.
- `verify-knowledge-atlas.mjs` and `verify-easyui-integration.mjs` skip paths the
  newest layer records as retired, and the Atlas baseline loop no longer hashes
  a file that no longer exists.
- `final-review-negative.mjs` builds its scratch checkout from the whole
  predecessor closure and tolerates deleted artifacts; the dependency-waiver case
  now accepts either rejection message, because the newest layer rejects it
  first. All 17 cases still fail closed.
- `docs/agent-reference/PACKAGE_MANIFEST.json` pins `README.md`, which the
  curriculum wave legitimately updated; the new layer records it instead of the
  reference manifest being rewritten.
- The rollback and manifest-to-manifest bindings are now routed through the
  successor instead of comparing against a literal: `rollbackPath` in the
  SQL, study, path-review, R11, canonical-home, cinematic and final-review
  layers, the fixed `preservation/originals/` and `circular-nodes/before/`
  copies in the prototype and circle layers, and every `previous*`, `baseline*`
  and `historySha256` promise. §13.9 explains why they were all stale.
- Five layers hash `tsconfig.tsbuildinfo`, an artifact the repository never
  commits, and `verify-knowledge-atlas.mjs` / `verify-easyui-integration.mjs`
  hash `next-env.d.ts`, which every build rewrites. Each now verifies such a file
  only where a build produced it, so a fresh checkout no longer fails on bytes
  that were never in the repository (§13.10).

### 13.5 Gates

| Gate | Result |
|---|---|
| `node scripts/verify-agent-reference.mjs` | PASS — 13 active hashes, entry paths, router v1.1, rubric weights, 6 intake hashes |
| `node scripts/verify-knowledge-atlas.mjs` | PASS — 16 payload, 33 integration, 23 documentation links, 90 relocations |
| `node scripts/verify-easyui-integration.mjs` | PASS — 41 owned, 1,169 prior-file contracts, 22 decisions |
| `node scripts/final-review-negative.mjs` | PASS — 17/17 corruption and waiver cases rejected |
| `npm run lint` | PASS — 0 errors, 41 pre-existing warnings |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS — Next 16.4.3 production build; postbuild wrote 434 segment aliases |
| `npm run test:content` | PASS — 68/68 |
| `npm run verify:metrics` | PASS — every published count matches content |
| `npm run verify:curriculum` | PASS — 883 internal links, 67 alias routes |
| `npm run lint:copy` | PASS — no review vocabulary in learner-facing files |
| `npm run qa:search-index` | PASS — 52/52 checks, 448 destinations |
| `npm run test:atlas` | PASS — 25/25 |
| Fresh clone of the pushed commit, `npm ci`, no build | PASS — all four reference gates; see §13.10 |
| CI build (GitHub Actions on `496fddf`, `7938c28`, `dce41d5`, `adb4f01`) | PASS — lint and "Build static export" succeed in every run |
| CI deploy to Cloudflare Workers | FAIL — the "Deploy to Cloudflare Workers" step fails about 2 s in, before any upload; §13.11 |
| CI deploy to GitHub Pages | FAIL — `actions/configure-pages@v5` fails; the Pages API returns 404, i.e. Pages is not enabled; §13.11 |
| Visual, responsive, a11y and domain QA | NOT RUN — no UI changed |

### 13.6 Component reuse and risks

- `baselines/2026-11-03-pre-m0/COMPONENT_REUSE.md` maps all seven prototype files
  to retain / port / replace decisions and audits 14 existing app components.
  No chart, motion or graph library is added; KaTeX and `motion` already exist.
- `baselines/2026-11-03-pre-m0/RISK_LIST.md` records 22 risks with evidence,
  severity, mitigation and a firing trigger, plus rollback paths.

### 13.7 Caveats

- A green receipt gate proves bytes and provenance, not meaning. It says nothing
  about whether an assertion is true.
- 1,859 metadata-only units and 108 untracked content files remain unassessed.
- The pins attributed to earlier waves are provenance records, not a semantic
  review of those waves.
- `tsconfig.tsbuildinfo` is deliberately unverifiable; a rebuild changes it.
- The deploy path is a push to `main`; M0 itself does not change site behaviour.

### 13.8 Next atomic task

**One domain-complete semantic pass: statistics.** Follow
`DATA_AND_CONTRACTS_EN.md` and the M1 order in the plan: separate extraction from
reading and publication, then review the statistics units in resumable batches,
including the 728 unmatched units and the 628 media references. Publication stays
blocked until the eligible corpus has explicit decisions. Do not start UI work
(M3/M4) before that pass closes.

### 13.9 Line-ending normalization (post-push repair, 2026-11-03)

M0 was pushed first (`7938c28`), and the next checkout turned
`node scripts/verify-agent-reference.mjs` red with
`Knowledge-stage predecessor receipt drift`. The diagnosis, and the repair, are
part of M0 because they decide whether the pins mean anything on a machine that
is not this one.

**Cause.** `core.autocrlf=true` is the Windows default. Every tracked blob in
this repository is LF — `git ls-files --eol` reported 3,777 `i/lf`, 2,669
`i/-text` and 553 `i/none`, and **zero** `i/crlf`. The working tree that produced
the pins was mixed: files written by scripts were LF, files last written by
`git checkout` were CRLF. `git status` still called that tree clean because the
clean filter converts CRLF back to LF on comparison. So the receipt chain, which
hashes raw bytes, was pinned to a checkout state that no Linux CI run and no
fresh Windows clone reproduces. Concretely: the hansa manifest's blob hashes to
`b8f00b7e…`, the checked-out bytes hashed to `a7975417…` with 1,528 CRLF pairs.

**Repair.**

- `.gitattributes` (`* text=auto eol=lf`, binaries declared `binary`) makes the
  index and the checkout byte-identical on every platform. This is the contract
  the receipts already assumed.
- `core.autocrlf` was set to `false` for this clone and the whole index was
  re-checked out, so the tree is now LF with no CRLF file left
  (`git ls-files --eol` reports zero `w/crlf`).
- No older manifest was edited and no expected hash was rewritten. The M0 layer
  was regenerated from the normalized tree; its previous version remains in
  commit `7938c28`, so the change is auditable.

**What that added to the layer.** 257 pins and 10 predecessor records now
describe lines endings only, tagged `eol-normalization-2026-11-03`. They are
distinguishable from content drift, and they are checkable:

| Check | Result |
|---|---|
| EOL-tagged files that still contain CRLF | 0 |
| EOL-tagged pins whose recorded byte count shrinks by more lines than the file has | 0 |
| EOL-tagged pins with a recorded prior size (range-checkable) | 257 |
| EOL-tagged rollback/evidence copies under `preservation/` and `before/` | 36 |
| Files whose endings were *mixed*, not uniformly CRLF | 30 |

The 30 mixed files are why a naive "convert LF to CRLF and compare" test failed:
for example `lib/study/server.ts` had 48 CRLF pairs and 2 bare LF lines, so its
pinned size was 7,853 bytes against 7,805 now — a 48-byte delta on a 50-line
file. The proof that only endings changed does not rest on that reconstruction:
git declared the pre-normalization tree clean, and the clean filter's whole job
is to strip CR from line ends, so the committed blob and the pinned bytes are the
same text.

The 26 pins tagged `m0-receipt-repair` are the receipt and verifier scripts
edited in this pass and in the follow-up below; they are real content changes and
are labelled as such rather than folded into the EOL set.

**Why this belongs in M0.** The exit condition for M0 is that affected paths and
preserved state are *known*, not that one machine is green. A gate that passes
only on the checkout that wrote it is not evidence. §13.10 records the check that
proved the difference between "passes here" and "passes anywhere".

**Deploy note.** The push that triggered the deploy shipped LF blobs, i.e. the
form the receipts now pin, so the normalization does not change any deployed
byte. It changes what this Windows clone checks out, so that local verification
can reproduce the deployed state.

### 13.10 Fresh-checkout audit (second post-push repair, 2026-11-03)

The line-ending repair above was verified on *this* working tree. That is the
same trap one step later, so the pushed commit was cloned into an empty directory
with the machine's default configuration (`core.autocrlf=true`) and the four
gates were run there. The clone checked out LF — `.gitattributes` works — and
`verify-agent-reference.mjs` passed. The other three failed.

**What a fresh clone exposed.** Three generated files are referenced by the
receipt chain but never committed, because `.gitignore` excludes them:

| File | How the chain used it | Failure in a clone |
|---|---|---|
| `tsconfig.tsbuildinfo` | four layers pin it; `canonical-home` marks it `generated` | `ENOENT` |
| `docs/knowledge-atlas/circular-nodes/before/tsconfig.tsbuildinfo` | three layers captured it as rollback evidence | `ENOENT` |
| `next-env.d.ts` | the Atlas and EasyUI baselines record it as pre-existing | hash mismatch, 288 vs 295 bytes |

The third one is not a missing file but something worse: two builds of the *same
commit* produced different bytes, differing only in line endings. A hash of that
file describes one machine's toolchain, not the project.

**Repair.**

- The three paths are now recorded as `excluded` in the M0 layer with the reason,
  and nothing is pinned to them. The excluded list states that such a file is
  verified only where a build produced it, never against a recorded hash.
- The layers that hashed them verify conditionally: `canonical-home`,
  `prototype-c`, `atlas-circle` and `dp600-continuation` for the build cache,
  `verify-knowledge-atlas` and `verify-easyui-integration` for both baselines.
  Excluding a path from the new layer without teaching the older layers would
  have left them failing on their own hashes.
- No expected hash was rewritten and no older manifest was edited. The edited
  scripts are the 26 pins tagged `m0-receipt-repair`.

**Result.** A bare clone of `dce41d5` — `npm ci`, no build, no generated files —
passes all four gates:

| Gate | Clone result | Working tree |
|---|---|---|
| `verify-agent-reference.mjs` | PASS — 13 active hashes | PASS |
| `verify-knowledge-atlas.mjs` | PASS — payload, 33 integrations, 23 links | PASS |
| `verify-easyui-integration.mjs` | PASS — 41 owned, 1,169 contracts | PASS |
| `final-review-negative.mjs` | PASS — 17/17 rejected | PASS |

**Caveat, stated rather than hidden.** The reference gate checks six intake
sources that live *outside* the repository; in a clone it reports "0 available
intake hashes" and still passes, because absence of an external intake original
is not drift. The other three gates verify only repository content, so their
result is identical in both places.

**What this changes about M0.** Before this audit, "the chain passes" meant "the
chain passes on the machine that built the pins", which is exactly the condition
that produced the line-ending incident. The chain is now a statement about the
repository's committed bytes, which is what CI and any future checkout see.

### 13.11 Deployment status (3 Nov 2026)

The deploy at the end of M0 was attempted, as authorized, and did not publish.
The evidence, gathered from the GitHub API and the live host:

| Item | State |
|---|---|
| `main` | `adb4f01`, clean tree, pushed |
| Cloudflare run `41720449966` | Lint PASS, Build PASS, "Deploy to Cloudflare Workers" FAIL |
| Pages run `41720450034` | Lint PASS, Build PASS, `actions/configure-pages@v5` FAIL |
| `GET /repos/…/amir-portfolio/pages` | `404` — Pages is not enabled |
| Automated deploy runs that have ever succeeded | 0 — no run of either workflow has reached a successful deploy (`496fddf`, `7938c28`, `dce41d5`, `adb4f01`) |
| Live site | serving a build older than `main` |

The live site answers `200` on `/`, `/learn/`, `/learn/sql/`, `/study/`, `/lab/`,
`/practice/`, `/learn/statistics/`, `/learn/statistics/decision/`,
`/learn/catalogue/`, `/practice/catalogue/`, `/explore/integrity/` and
`/search/`; `/atlas/` is `404` because no such route exists. It still prints the
hardcoded `834` where `c78a76f` replaced it with the content count — a local build
of `adb4f01` prints `1,264` and never `834` — so at least six commits are
unpublished, including the whole `/learn` curriculum wave of 3 Nov.

**Why each job fails.**

- **Cloudflare.** The step needs `secrets.CLOUDFLARE_API_TOKEN` (scope "Workers
  Scripts: Edit") and `secrets.CLOUDFLARE_ACCOUNT_ID`; the workflow header
  documents both. It fails two seconds after a successful build, which is too
  fast for wrangler to start and reach the API, so the shape is an unresolved
  input rather than a rejected upload. Job logs are admin-only
  (`403 Must have admin rights to Repository.`), so the exact message cannot be
  quoted here.
- **Pages.** `actions/configure-pages@v5` requires Pages to be enabled for the
  repository, and the Pages API returns `404`. That is a repository setting, not
  a workflow defect.

Both are owner-only repository settings; no change inside this repository can
fix them. Once either is set, the next push to `main` deploys, and the honest
next step for that run is to re-check these same routes against the new build.

**What this audit did not do.** It did not create a deployment by hand, did not
add a hosting dependency, and did not touch the live site. The published build
therefore still belongs to an earlier commit, and the deploy remains the one M0
item that is blocked on configuration rather than on code.


## 14. Next-phase M1–M5 — 2026-11-04

Milestones M1–M5 of `docs/knowledge-stage-next-phase-v3-20261101/NEXT_PHASE_PLAN_EN.md`
§6–§10, in the isolated review scope of §3. M6–M7 are not started (§14.10), and
no deployment was attempted, so the live site is unchanged from §13.11.

### 14.1 State of each milestone

| Milestone | State | Why that word |
|---|---|---|
| M1 — semantic foundation | **PARTIAL** | State separation and review machinery exist, and 63 units carry a written decision. 4,274 eligible units are still unread and 695 unmatched units are still open. |
| M2 — query and contract behaviour | **DELIVERED** for the review slice | One pure query layer with 27 tests and no new dependency. The app integration it feeds is M6. |
| M3 — visual specification | **DELIVERED as a specification** | Executable spec, scored representation comparison, seven keyframes, measured contrast. Visual acceptance is NOT RUN because it is an owner judgement. |
| M4 — one complete journey | **DELIVERED in the prototype** | 21 executable checks pass on the isolated prototype; opening a real site route remains NOT RUN (§14.5). |
| M5 — scale and verify | **PARTIAL** | Harnesses live in the repository and run. Video and intermediate scroll frames were not captured, and all-site discovery is not integrated. |

"Partial" is used in the plan's sense: a resumable queue is published with it and
no label was upgraded to complete.

### 14.2 M1 — semantic foundation, honestly partial

The overloaded single state is gone. `analysis/semantic-ledger-summary.json`
(schema `2.0`) now carries separate blocks for extraction denominators,
`candidateMatch`, `semanticReading`, `decisions`, `candidateVerdicts` and
`publication`. A unit can be *matched* and still *unread*, which is the whole
point: matching is a lexical proposal, not reading.

The review machinery is `tools/review-workbench.mjs`, a read-and-validate tool
that never publishes:

| Command | What it answers |
|---|---|
| `coverage` | eligible / read / open counts by unmatched reason and by source family, plus the statement that these are queue counts, not publication |
| `queue --reason=… --family=… --limit=… --units=… [--write] [--json]` | the next batch, ordered reason priority → shortest unit text → unit ID, written to `semantic/batches/` and `semantic/sheets/` |
| `sheet --batch=<id>` | the human review sheet for a written batch |
| `check` | decision integrity: every quote is a verbatim substring, every concept and relation resolves, publication is still zero |

Decisions are hand-written against real context. Each one records the
`parentContext`, the `reading`, an `evidenceQuote`, the `candidateVerdict`, the
`concept`/`relation` mapping and an explicit `decision` — `accepted`, `revised`,
`held` or `unresolved-gap`.

This pass added **25** decisions across the two smallest unmatched-reason groups;
38 were read before it. All 25 are cases the matcher *missed*: 14 gained a mapping
after reading, 11 were held because the registry cannot represent what the unit
asserts.

| Group | Units | Read | Verdicts |
|---|---:|---:|---|
| `domain-not-modelled` | 9 | 9 | closed — every unit read |
| `navigation-index` | 16 | 16 | closed — every unit read |

| Reading state | Count |
|---|---:|
| Eligible units | 4,337 |
| Read | **63** (1.45% of eligible, 1.02% of the corpus) |
| Not read | 4,274 |
| Published | **0** |

Of the 63 readings: 10 accepted, 31 revised, 18 held, 4 unresolved gaps. The
ledger was rebuilt (`build-semantic-ledger.mjs`), so the summary, the JSONL
ledger and the markdown ledger agree with the decisions; `check` reports `ok`
with 0 errors and 0 warnings.

The open queue, by reason, with 20 units per batch:

| Unmatched reason | Total | Read | Open | Batches |
|---|---:|---:|---:|---:|
| `domain-not-modelled` | 9 | 9 | 0 | 0 |
| `navigation-index` | 16 | 16 | 0 | 0 |
| `thin-fragment` | 46 | 0 | 46 | 3 |
| `formula-fragment` | 79 | 1 | 78 | 4 |
| `template-boilerplate` | 74 | 0 | 74 | 4 |
| `procedural-step` | 148 | 2 | 146 | 8 |
| `no-lexical-signal` | 170 | 2 | 168 | 9 |
| `question-paraphrase` | 186 | 3 | 183 | 10 |
| **Total open** | | | **695** | **35** |

**M1 exit condition is not met.** The plan asks for explicit semantic decisions
across the full accessible eligible corpus, and 98.5% of it is still unread. What
exists instead is a resumable queue with a written order and a validated decision
format, which is what makes the remaining work re-enterable rather than a restart.

One defect in the new tool was found while writing this section and fixed:
`coverage --json` wrote the report object itself to stdout and died with
`ERR_INVALID_ARG_TYPE` instead of printing JSON. Both behaviours are now
exercised by hand; the tool has no unit test of its own, which is stated rather
than implied.

### 14.3 M2 — one pure query layer

`lib/query.mjs` (435 lines, no I/O, no DOM, no dependency) is the single
implementation every caller uses. It fails closed: a candidate edge is never
treated as published.

| Export | Behaviour |
|---|---|
| `createIndex(graph, mappings, projection)` | integrity-checked index; throws on duplicate concept IDs, duplicate edge IDs, dangling endpoints, unknown `reviewState`, a mapping to an unknown concept or a non-local href, or a projection built for a different graph |
| `neighborhood(index, conceptId, options)` | one hop in both directions, relation filter, `includeIncoming`, hidden count for expansion |
| `searchConcepts(index, query, options)` | alias and diacritic aware, deterministic ordering, limit honoured |
| `resourcesForConcept(index, conceptId, options)` | deduplicated by href, best role first (`explains` → `references`), role and language filters |
| `recommendNext(index, conceptId, options)` | intent-specific relation directions; each item carries the relation phrase, the stored claim as its reason, evidence count, `reviewState` and `eligible` |
| `routeFor(index, goalId, options)` | delegates to `planGoal` so ordering cannot drift from the app; reports cycles instead of throwing, trims from a start concept without reordering |
| `publicPayload(index)` | releases only what the projection names; today it publishes nothing and says so |

`INTENT_RELATIONS` fixes which relations each intent may surface: `understand`
uses prerequisites and mechanism edges, `compare` uses contrast, trade-off and
complement edges in both directions, `apply` uses `enables`, `reach` uses
incoming prerequisites. A mode with no matching stored edge returns an empty list
rather than a suggestion — the honest-unavailable state the plan asks for.

`tests/query.test.mjs` covers this with **27 tests**: six construction refusals,
five neighbourhood cases, four search cases, two resource cases, four
recommendation cases, four route cases (including the three real goals matching
`planGoal` exactly and a cycle being reported), and two public-payload cases.
The whole Atlas suite is **118/118**.

What M2 did *not* do: it added no app adapter, no search index and no chunk
validation beyond the existing Deck contracts. Those are integration work.

### 14.4 M3 — the specification before the pixels

`design/VISUAL_SPEC_V3.md` (12 sections, 372 lines) is the executable spec. The
representation comparison uses the repository rubric weights and is scored
against actual content and topology:

| Criterion (weight) | A. List + stepper | B. Stable 2D task field | C. Immersive spatial scene | D. Table only |
|---|---:|---:|---:|---:|
| Correctness (30%) | 5 | 5 | 3 | 5 |
| Teaching clarity (25%) | 4 | 5 | 3 | 4 |
| Essential interaction (15%) | 2 | 4 | 5 | 1 |
| Performance / mobile (15%) | 5 | 4 | 2 | 5 |
| Accessibility / reduced motion (10%) | 5 | 4 | 2 | 5 |
| Maintenance / reuse (5%) | 5 | 3 | 2 | 5 |
| **Weighted** | **4.30** | **4.50** | **3.00** | **4.15** |

B is the direction; A is not the loser but the mandatory equivalence view at
every width and under reduced motion; D is the in-place fallback when a concept
has no eligible neighbour or local resource. C was rejected on three hard
blockers, not on taste: camera motion that explains nothing, evidence two
interactions deep, and no defensible focus order for a screen reader.

The spec also fixes the four intent modes, the three-column / two-column /
single-column compositions, an eleven-row motion table (nothing over 320ms, two
animated properties maximum per element), the reduced-motion variant of each
transition, an accessibility contract and a performance budget.

Contrast was measured from the real tokens, not asserted:

| Pair | Ratio | Target | Result |
|---|---:|---:|---|
| Light body on background | 19.18:1 | 4.5 | PASS |
| Light muted on background | 5.86:1 | 4.5 | PASS |
| Light `--chart-1` / `--chart-2` mark | 5.05 / 3.33 | 3 | PASS |
| Light `--chart-3` mark | **2.20** | 3 | **FAIL** |
| Light `--chart-4` mark | **2.98** | 3 | **FAIL** |
| Light `--chart-5` mark | 3.77 | 3 | PASS |
| Dark body / muted / primary / button | 16.31 / 6.82 / 7.97 / 8.59 | 4.5 | PASS |
| Dark `--chart-1..5` marks | 7.91–10.94 | 3 | PASS |

The two light-mode failures are not papered over: without a fix, an amber or pink
edge may never be the only carrier of meaning, so those relations keep a 1.5px
stroke plus a text label and a distinct dash pattern. The token change itself is
an owner decision (§14.10).

Five owner questions are recorded with the evidence behind them: the two failing
tokens, edition cadence across fifteen days, review-badge prominence, whether the
timeline takes the integrated Home's first viewport, and whether the mobile field
drops edge lines below 768px.

Seven keyframes are captured from the running prototype at 1440×900 (light and
dark Timeline, light and dark Dealer, light and dark Knowledge Stage) and at
390×844: `design/keyframes/k1…k7*.png`. They are review evidence, not approval.

### 14.5 M4 and M5 — the journey harness

`tools/verify-prototype-journey.mjs` drives the real prototype in Microsoft Edge
through `playwright-core` and writes `design/qa-journey-report.json`.

| Result | Count |
|---|---:|
| PASS | **21** |
| FAIL | **0** |
| NOT RUN | **1** — owner visual acceptance |
| Console errors | 0 |

What the 21 prove: the review clock renders fifteen days; only 24, 25 and 26
October have editions and the quiet days say so; today is honestly empty and
never borrows an older card; the empty hand offers the latest real edition;
`ArrowRight` moves selection and `Enter` opens the edition; the Dealer shows the
real card fields with a review badge and no publication claim; `Escape` closes it
and returns focus and scroll to the opening date; locating in knowledge keeps the
card's concept as the anchor; rendered neighbours equal the stored edges and stay
labelled candidate; all four intent modes render distinct real content; compare
names a real documented pair (OneLake shortcut ↔ Copy job); a saved concept
survives reload and records no mastery; `P` opens the pocket and `Escape` returns
focus to the toggle; the URL restores scene, concept and intent; the review
payload is not reachable from the app; dark mode applies the dark token set;
reduced motion neutralises transitions; 390px has no horizontal overflow and 44px
targets; and the seven keyframes are written.

Harness decisions worth recording, because each one exists to stop a false
verdict:

- every check starts from a fresh `goto`, so no result depends on the focus or
  scroll left by the previous one;
- pointer activation is dispatched as an element `.click()` through
  `page.evaluate`, because the transformed timeline card never satisfies
  Playwright's actionability check — the element's own handler and accessible
  name still run;
- keyboard paths use real `keyboard.press` events (`ArrowRight`, `Enter`,
  `Escape`, `P`, `u/c/a/g`);
- `settle()` waits for finite CSS animations and `settleScroll()` waits for the
  smooth scene scroll to stop, so a capture cannot catch a 240ms fade and report
  a translucent dialog as a visual defect. One earlier "translucent Dealer" was
  exactly that artefact.

Two real prototype defects were found this way and fixed:

1. `.card-select { padding: 0 }` cancelled `.card`'s 14px inset, so Dealer card
   text sat flush against the border and the kind dot was clipped. The reset was
   removed.
2. The neighbourhood meta line rendered "60 MORES IN FABRIC" because
   `plural(count, "more")` appended an `s`. It now uses
   `plural(count, "more concept", "more concepts")`.

Three visual notes are recorded for the owner rather than silently restyled: the
timeline draws two long blue "cables" that cross the deck in an X, the selected
card overlaps the large ghost numeral, and a small dotted arc sits at the
top-left card corner.

Lighthouse on the knowledge view: accessibility 1.0, best-practices 1.0, SEO 1.0,
with one notable `label-content-name-mismatch` left unrepaired and recorded. No
performance benchmark was run, so this report makes no performance claim.

**M4's navigation rule is respected, not bent.** The plan allows an isolated
prototype to resolve real routes against a configured local preview origin and
requires that destination to be labelled a preview rather than PASS. The harness
therefore proves in-app transitions, focus return and URL restoration, and it
does **not** claim that clicking a resource reaches a deployed `/lab/…` page.

### 14.6 What is not done

| Item | State | Why |
|---|---|---|
| 4,274 eligible units unread | OPEN | resumable in 35 batches; see §14.2 |
| 695 unmatched units open | OPEN | queue ordered, not consumed |
| 628 media references | NOT REVIEWED | caption reading is not figure review; inaccessible media is tracked separately |
| Language and content-form coverage | NOT PRODUCED | `coverage` breaks down by unmatched reason and source family only |
| Route execution to a real destination | NOT RUN | labelled preview, per M4 |
| Video and intermediate scroll frames | NOT CAPTURED | seven state keyframes exist; no scroll sequence |
| Performance against baseline | NOT MEASURED | no timing claim is made anywhere in this section |
| All-site adapters, search index, resource discovery | NOT IMPLEMENTED | M5 integration work that depends on M6 |
| npm wiring for the new tests | DELIBERATELY OMITTED | see §14.8 |

### 14.7 Gates

| Gate | Result |
|---|---|
| `node --test "intelligent-atlas/tests/*.test.mjs" "intelligent-atlas/contracts/*.test.mjs"` | PASS — 118/118 |
| `node intelligent-atlas/tools/verify-prototype-journey.mjs` | 21 PASS, 0 FAIL, 1 NOT RUN, 0 console errors |
| `node intelligent-atlas/tools/review-workbench.mjs check` | ok — 63 decisions, 0 errors, 0 warnings |
| `node scripts/verify-agent-reference.mjs` | PASS — 13 active hashes, 6 intake hashes |
| `node scripts/verify-knowledge-atlas.mjs` | PASS — 16 payload, 33 integration, 23 links, 90 relocations |
| `node scripts/verify-easyui-integration.mjs` | PASS — 41 owned, 1,169 prior-file contracts, 22 decisions |
| `node scripts/final-review-negative.mjs` | PASS — 17/17 cases rejected |
| `npm run lint` | PASS — 0 errors, 41 pre-existing warnings (unchanged from M0) |
| Visual, responsive, performance and domain QA by an owner | NOT RUN |

No expected hash was changed and no manifest was edited in this pass. The gates
were green before it and are green after it, with the same counts.

### 14.8 Costs and dependencies

- No dependency added or upgraded. `playwright-core` and Edge were already
  present; the harness uses no network except `127.0.0.1`.
- No paid service, no runtime LLM, no backend, no secrets, no new storage.
- No learner content, question ID, answer, route or saved-progress record was
  edited. The only prototype edits are the two layout/grammar fixes in §14.5.
- `package.json` is deliberately untouched. Adding `test:intelligent-atlas` and
  `qa:journey` would be cosmetic, but that file is pinned in nine receipt layers,
  so it is an owner decision rather than something to repin quietly for
  convenience. The commands are runnable as written in §14.7.

### 14.9 What this section does not claim

It does not claim publication (0 published), scientific approval (63 units read,
4,274 not), whole-corpus completion, M6/M7 integration, deployment, or visual
acceptance (NOT RUN). The review prototype is a review artifact; nothing in this
section changes what a learner sees on the live site.

### 14.10 Next atomic task

**Consume the next batch.** Run
`node intelligent-atlas/tools/review-workbench.mjs queue --reason=thin-fragment --limit=20 --write`,
read the written sheet with real parent context, and record decisions with
verbatim evidence. Three batches close `thin-fragment` (46 units), which leaves
`formula-fragment`, `template-boilerplate`, `procedural-step`,
`no-lexical-signal` and `question-paraphrase`.

**M6–M7 are a separate scope and need an explicit assignment.** They replace the
canonical Home (`components/knowledge/hansa-landing.tsx`, `insight-stage.tsx`)
and its `/prototype-c/` alias with the three-scene composition, migrate the
tested query layer into `lib/`, keep public payloads free of review artifacts,
and then run the integration QA and measure performance against the recorded
baseline. That work changes pinned app files, so it needs new receipt pins and a
fresh baseline, not an extension of this one.

Owner decisions blocking visual sign-off are listed in `design/VISUAL_SPEC_V3.md`
§12: the two light-mode relation tokens, edition cadence, badge prominence, the
timeline-first Home viewport, and the mobile field representation.

