# Acceptance matrix and evidence contract

All rows below are future acceptance requirements, not PASS claims for this planning delivery. Use PASS, FAIL, NOT RUN or BLOCKED with an evidence path, date, exact scope and remaining limitation. Distinguish automated assertions from manual/owner/domain review.

## 1. Data and intelligence

| ID | Scenario | Acceptance |
|---|---|---|
| D01 | Current source registries versus extracted ledger | Every eligible family accounted for; changed/new/missing inputs named; revisions not double-counted as new questions |
| D02 | Matcher finds a term | Only candidate matching state changes; no automatic semantic-reading or human-review promotion |
| D03 | Formula, procedural lab, Arabic paraphrase, unmapped domain | Parent context read; semantic decision/evidence recorded or an explicit unresolved gap |
| D04 | Already-mapped corpus and unmatched corpus | Both receive contextual review; no sampled slice reported as full semantic reading |
| D05 | Diagram carries essential meaning | Actual media reviewed or unavailable status; alt text alone never reported as visual review |
| D06 | Same term in different contexts; synonyms across sources | Correct scoped identity decisions with merge/split crosswalk and evidence |
| D07 | Each retained assertion | Correct endpoints/direction, entailment rationale, conditions, locators and source revision; candidate remains candidate |
| D08 | Quality evaluation | Stratified reviewed sample plus full ledger; sample size, reviewer/method and observed errors disclosed |
| D09 | A requires B, A requires C, B requires C | C precedes B precedes A; valid topology under ID permutations |
| D10 | Diamond/multiple targets/disconnected goal/prerequisite cycle | Correct order/deduplication; incomplete/unsupported output where necessary |
| D11 | Comparison cycle or related-in-decision edge | Does not become mandatory prerequisite order |
| D12 | ALL/ANY/unknown condition/self-reported starting point | Explicit supported logic and unknown states; free-text conditions not executed |
| D13 | Repeated identical recommendation context | Same eligible choices/order/reasons; ranking is not confidence or mastery |
| D14 | Cross-domain connection | Shared canonical identity or supported semantic assertion; no keyword-only scientific bridge |
| D15 | Missing comparison criterion | Unknown preserved; no fabricated values, winner or unsupported score |

## 2. Projection, contracts and future readiness

| ID | Scenario | Acceptance |
|---|---|---|
| C01 | Candidate sentinel added to review fixture | Absent from every public artifact, request and serialized payload; absent even with preview env flag or tampered URL |
| C02 | Eligible and ineligible synthetic projection fixtures | Eligible subset admitted, ineligible withheld; test fixtures never enter real public content |
| C03 | Zero real published graph records | Useful resource discovery and truthful sparse state; no candidate edge leakage |
| C04 | Empty/one-card/multi-card DeckRequest | Correct discriminated result; counts match actual cards; original single-card sample still works |
| C05 | Unknown kind/origin, LINK_ONLY, held question | Useful permitted fallback with discover/readFull/assess/relate kept independent |
| C06 | Two real supported adapter contexts | Same resolver/renderer boundary; no hard-coded OneLake-only assumption or Home choreography edits |
| C07 | Old compatible schema request | Adapter preserves semantics or explicit unsupported result; no silent reinterpretation |
| C08 | Mixed graph/source-index chunks or stale async result | Rejected/re-resolved; no old evidence combined with new claims |
| C09 | Source/assertion withdrawn between open and return | Old recommendations/decks invalidated; valid fallback; original assessment attempts preserved |
| C10 | Corrupt/oversized/unsafe return and local state | Bounded validation, safe internal fallback, no external redirect or progress reset |

## 3. Experience and movement

| ID | Scenario | Acceptance |
|---|---|---|
| U01 | Fresh first viewport | Timeline is the sole dominant component; no competing headline, site statistics or review toolbar in learner mode |
| U02 | Today has no edition | Honest date/availability and explicit latest-edition choice; fixed test clock never impersonates production today |
| U03 | Drag/select/reselect/activate date | Selection separate from activation; no accidental open on drag; selected date opens on explicit activation |
| U04 | Dealer open/evidence/destination/Escape/close | Correct state nesting, background lock, focus trap and post-mount focus return |
| U05 | Understand → Compare → Apply → Reach a goal | Different useful compositions; same concept/context preserved; evidence filters remain separate |
| U06 | Select versus Explore versus Open | Preview, expansion and navigation are distinct, functioning actions |
| U07 | Why connected / Why this step | Exact basis, conditions, evidence and limitations visible without resetting the field |
| U08 | Preview alternative then cancel/apply | Original route preserved until commit; cancellation loses no prior context |
| U09 | Pocket and Thread | Observed/saved identities only; caps, remove/clear, stable return; no mastery inference |
| U10 | Card → graph → actual resource → Back | Correct concept/intent/branch/goal/card restore; preview-only link tests are labelled separately |
| U11 | Change context around shared concept | Anchor retained; resource examples update only where mappings support them |
| U12 | Scroll checkpoints 0/.25/.5/.75/1 in both directions | Readable active text; no hidden focused subtree, dual interactive scenes or mid-transition contrast loss |
| U13 | Rapid mode/branch changes; close during entrance | Last input wins; no stale panel, orphan focus, animation lock or duplicate navigation |
| U14 | 320/390/768/1280px, long labels, high-degree node | Readable bounded presentation; complete list/search access; no page overflow or inaccessible controls |
| U15 | Reduced motion, keyboard, forced colors, 200% zoom | Equivalent meaning/actions and safe reflow; no essential hover/drag-only behavior |
| U16 | Screen reader | Meaningful names/order/state announcements without per-frame noise; record NOT RUN if unavailable |
| U17 | Still frames and recordings | Authored depth survives paused motion; owner visual acceptance recorded separately from engineering checks |

## 4. Local integration only (M6–M7)

| ID | Scenario | Acceptance |
|---|---|---|
| I01 | Root and `/prototype-c/` | Shared implementation, correct canonical metadata and preserved query/hash; alias is not silently changed to redirect |
| I02 | Existing lesson/practice/archive/search links | Original destinations remain usable; no feature deleted merely to shorten Home |
| I03 | Existing saved progress before/after | Original IDs, answers and stored sessions preserved; new presentation state isolated |
| I04 | Public static build/export | Successful exit, public-only output, no server-only dependency or review files in deployable directory |
| I05 | Affected tests, lint, types and reference verifiers | Actual results recorded; inherited hash drift identified without weakening manifests |
| I06 | Loading and interaction measurements | Baseline versus changed payload/task time recorded on same environment; whole corpus not shipped in Home props |
| I07 | Real navigation and resize return | Browser Back/Forward and original route queries/anchors work; stale pixel coordinates not reused |

## 5. Evidence delivery

Commit runnable QA scripts with the implementation's owned files. Store logs, fixtures, screenshots/video, source coverage and reports in a documented evidence directory. A receipt from a temporary script is supporting history, not a reproducible test suite.

At each milestone record: task IDs, scope mode, source/build revisions, commands/checks actually executed, PASS/FAIL/NOT RUN/BLOCKED, environment, affected files/routes, measured limits, and next atomic task.

Use actual unit/relationship IDs in scientific checks. All synthetic fixtures are visibly test-only and excluded from public generation. Avoid tests that merely repeat implementation constants; include counterexamples, incorrect directions, withdrawn evidence and boundary cases.

M0–M5 completion requires D/C/U/V evidence for the implemented scope and truthful semantic coverage. M6–M7 additionally requires I evidence. Human publication and domain review may remain blocked while engineering work proceeds; public semantic coverage must reflect that limitation. Do not declare visual owner acceptance because automated tests pass.

No whole-application build is required for this documentation-only plan. During future implementation run checks appropriate to actual changed boundaries; once they pass, repeat only after relevant changes or new failures.

## 6. V3.1 blended visual direction

| ID | Scenario | Acceptance |
|---|---|---|
| V01 | Baseline, beUI-weighted and blended design study | Same real content compared; retained/adapted qualities explained; one coherent direction selected |
| V02 | Timeline, Dealer and Graph in light/dark | Six polished keyframes show shared color/material language with distinct scene composition |
| V03 | Token integration and saved presets | Existing semantic roles/presets preserved; scoped aliases documented; no second global theme engine |
| V04 | Static and paused-animation frames | Focal hierarchy and depth remain clear through scale, contact, tonal separation and edge treatment |
| V05 | Color, categories and status | Decorative vibrance never implies mastery/publication/confidence; categories and status retain independent meanings |
| V06 | Text, focus and composited backgrounds | Measured contrast for actual pairs and scroll checkpoints; active reading text stays crisp and opaque |
| V07 | First viewport and high-density graph | Timeline remains the sole dominant entry; graph labels remain readable; no new marketing/review clutter |
| V08 | Dealer one/many cards and comparison pair | Source-backed counts; tactile arrangement; equal comparison emphasis; no fabricated winning color or added ideas |
| V09 | Repeated input, touch and reduced motion | No keyboard animation delay, pointer-chasing targets or hover dependency; static equivalents retain hierarchy |
| V10 | Effect performance | Measure representative scenes; no continuous full-canvas blur/shadow animation or offscreen decorative work |
| V11 | Typography and optical polish | Long titles, Arabic/English, numeric changes, radii, icons, spacing and clipped shadows inspected and corrected |
| V12 | Owner visual review | Concrete boards/recordings support review; engineering PASS is not a claim that aesthetic acceptance was granted |

These 12 checks supplement the original 49 requirements. See [VISUAL_DIRECTION_BEUI_HANSA_EN.md](VISUAL_DIRECTION_BEUI_HANSA_EN.md) for the corresponding design choices and reference-evidence limits.

