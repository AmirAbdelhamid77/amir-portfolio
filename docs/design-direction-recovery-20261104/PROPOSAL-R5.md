# V2 change proposal - R5 the closing scene (review build)

Status: **accepted 2026-11-05** (R1, R2, R3 and R4 accepted 2026-11-05).
This is the fifth review slice. It restores the prototype's closing scene - one
idea, one action, the kept cards, the coverage ledger and the limits of the
reading - behind its own build-time flag. The accepted M6 close stays the
flag-off default. Implementation and measurements are recorded in
`ACCEPTANCE/R5-2026-11-05.md`.

## Prototype reference

- `intelligent-atlas/prototype/index.html` (`#scene-closing`: kicker, title,
  `closing-idea`, `closing-actions`, `closing-note`, `closing-ledger`,
  `closing-about`).
- `intelligent-atlas/prototype/app.js` (`renderClosing`, the event handler that
  reopens `daily:${date}` and the Escape order dealer → about → pocket).
- `.stage-closing`, `.closing-*`, `.ledger*` in
  `intelligent-atlas/prototype/styles.css`.
- Evidence: `evidence/proto-closing-dark-1280.png`; the shipped M6 close in
  `evidence/shipped-closing-dark-1280.png`.

## Intent

The shipped close is a signpost: four destinations, a review notice and the
identity strip. It is honest but it does not close the argument the stage opened.
R5 restores the prototype's shape - **leave with one idea and one honest action** -
without turning the stage into a sales page:

1. **One idea.** The selected edition's reviewed `takeaway`, quoted verbatim, with
   its card title, topic, day and source id, and the edition's own caveat printed
   as *the condition*. When nothing is selected, the scene says so and points at
   the timeline instead of inventing a quote.
2. **One action.** `Reopen the 26 Oct edition` - the selected edition, or the
   newest one, named by day. It opens the cinematic dealer when this build has it
   and returns to the timeline with focus on its heading when it does not. With no
   edition at all it reads `Browse the timeline`.
3. **Kept cards.** The cards saved in the dealer, read from
   `hansa.dealer.saved.v1`, listed with kind and day. Choosing one reopens its
   edition at that card. Empty state explains that these are bookmarks, not
   mastery records. A save made in the dealer updates this list in the same tab
   through a `hansa:dealer-saved` event.
4. **Coverage ledger.** Seven rows: editions on the clock, published editions,
   published concepts, published connections, `109 / 4,337` candidate units read
   in context (2.51%), `4,228` still unreviewed, `4,925` unique canonical
   resources. Below it, the sentence that makes the numbers usable, and a native
   `<details>` with the denominators, the six review decisions and the ledger's
   four limits.
5. **What this does not claim.** Four statements, not a paragraph: nothing is
   published; semantic reading covers 2.51% of eligible units; media, figures and
   rendered pages were not visually reviewed; agent technical review is not human
   scientific, rights or assessment review.
6. **Destinations, secondary.** The four working destinations stay, below the
   argument and under `Still open today`, so the scene ends in the practice rather
   than in a claim.

## Deliberate synthesis, not a copy

- The ledger is **pinned to the repository's own semantic ledger**
  (`intelligent-atlas/analysis/semantic-ledger-summary.json`, generated
  2026-11-01, fingerprint `20809d68…2740d`). `tests/knowledge/closing.test.mjs`
  re-reads that file and fails if any pinned number drifts, so the scene cannot
  keep an old count while the ledger moves.
- Stage rows come from `StageModel`, not from constants: a review build and a
  public build cannot report the same edition and concept counts. Zero published
  stays zero in both.
- The prototype's site-wide **pocket** and its About modal are not reproduced.
  R5 lists the dealer's own saved cards and links to the Atlas desk for the
  coverage argument. A site-wide pocket remains a separate slice; inventing one
  inside the closing scene would duplicate the dealer's storage.
- The prototype's `Reopen` both selected the date and opened the dealer. R5 keeps
  that intent but degrades honestly: without the dealer flag it selects the
  edition and moves focus to the timeline heading rather than pretending a dialog
  exists.
- Motion: the closing scene has **no entrance animation**. It is the one scene
  where the reader has finished reading; the only transitions are the native
  `<details>` disclosure and hover/focus states, all of which are already
  reduced-motion safe.

## Corrections found while restoring

- The heading and the quote were the one place where the prototype's two-line
  title concatenated into `one ideaand one honest action` for assistive
  technology; the review close carries an explicit space between the two lines.
  The accepted timeline heading has the same defect and is recorded as an R6
  candidate rather than changed silently in this slice.
- The prototype's ledger rows were plain text. R5 uses `<dl>` rows, so the label
  and the number are associated instead of merely adjacent.
- The claims were a bulleted list in the prototype; the site preflight removes
  markers, so the review close sets its own quiet dash instead of inheriting an
  unordered list with no bullets.
- The saved list is a sibling of the dealer dialog and could not see its state;
  the dealer now dispatches a same-tab event after every persist, so a card saved
  in the dialog appears in the close without a reload or a shared store.
- The Atlas desk link points at `/learn/dp-600/atlas/`, the surface that can show
  the sources behind the ledger; the prototype's About modal stays deferred.

## Flags and boundary

- New flag: `HANSA_CLOSING_REVIEW=1`, a build-time, local-only switch, independent
  of the Atlas, neighbourhood, timeline and dealer flags. Five flags exist; the
  shipped export must carry none of them.
- With the flag off the accepted M6 close renders exactly as it shipped: same
  kicker, title, note, notice, continue links, four destinations, identity strip
  and live region. No `.stage-close-*` node renders and no saved-card listener is
  attached.
- `stage-model.ts` is unchanged. Every closing value is derived in
  `lib/knowledge/closing.ts` from the selected insight, the stage model and the
  pinned ledger.
- No publication state changes: three editions stay `technical_review`, the
  published counts stay `0`, and the scene says so in its own words.
- The closing rules are added to `components/knowledge/stage-editorial.css`, the
  one stylesheet the stage already ships, so the public build carries them as
  dead bytes. That weight is measured in `r5-perf.mjs` rather than hidden.

## Pinned files

R5 changes seven review-pinned application/test files and adds two pinned
artifacts, plus the two evidence scripts (`r5-capture.mjs`, `r5-perf.mjs`) that
are not receipt pins.
Each changed file is recorded as a step-6 entry in
`docs/knowledge-stage-m6-20261104/INTEGRATION_MANIFEST.json`
(layer `design-recovery-r5/2026-11-05`, attribution `R5-closing-scene`).

| File | Change | Flag-off behaviour |
| --- | --- | --- |
| `components/knowledge/stage-closing.tsx` | flag-gated review close; saved-card reader | public close unchanged |
| `components/knowledge/insight-stage.tsx` | `closingReview` prop, reopen/saved handlers | no handler reachable |
| `components/knowledge/hansa-landing.tsx` | `HANSA_CLOSING_REVIEW=1` branch | no branch taken |
| `components/knowledge/dealer-cinematic.tsx` | same-tab saved event | dealer unchanged, one extra dispatch |
| `lib/knowledge/dealer-hand.ts` | `SAVED_CARDS_EVENT` export | unused by the public close |
| `components/knowledge/stage-editorial.css` | `.stage-close-*` rules | selectors unused |
| `tests/knowledge/canonical-home.test.mjs` | one-closing guard and flag guard | test-only |
| `lib/knowledge/closing.ts` (new) | idea, action, ledger, coverage note, claims | not imported by the public close* |
| `tests/knowledge/closing.test.mjs` (new) | ten closing guards, ledger drift check | test-only |

\* `stage-closing.tsx` imports the module unconditionally, so the pure helpers
are in the shared chunk; only the review branch calls them.

Unchanged: `stage-model.ts`, the inline dealer, the fan, the R1 route, the R2
neighbourhood, all seven prototype pins and the M0/M6 chain.

## Removed

Nothing. The accepted close, its live region, the destination cards and the
identity strip are all still there; the review branch is a second rendering of
the same scene behind a flag. No pocket, thread, publication or Atlas code is
removed because none of it is in this slice.

## Gates for this slice

- Unit: 10 closing guards (including the ledger drift check and the stage-row
  test); knowledge 104; full suite 312 - **PASS**.
- Build: `npm run test:all`; five-flag review export; flag-off public export last.
- Browser: 1280 dark/light, 1024 light, 390/320 light; coverage note open/closed,
  reopen action, saved list sync, saved card open, Escape focus return, 0
  horizontal overflow - **PASS** (`evidence/r5-report.json`).
- Accessibility: axe 0 violations on `#closing`, 0 console errors, native
  `<details>`, `<dl>` ledger, labelled sections, one live region, 44 px targets
  for the saved list and the Atlas link - **PASS** (manual screen-reader pass NOT
  RUN).
- Leak: flag-off Home renders no `.stage-close-*` node, attaches no saved-card
  listener, and requests no review-close chunk; the only delta is dead CSS in the
  shared stage stylesheet (measured) and one extra script chunk for the closing
  module - **PASS with a documented cost**.
- Performance: public 780 DOM nodes, 43 resources, 827,336 B script, 248,019 B
  CSS, LCP 756 ms, CLS 0; review build 1,339 nodes, 47 resources, LCP
  1,264-1,332 ms, CLS 0 (`evidence/r5-perf.json`, `evidence/r5-review-perf.json`).
- Visual: owner side-by-side (compare.html section 11), **pending**.

## Measured cost in the public build

R5 adds no markup to the public close, but the closing module still joins the
stage's client graph: +1 script tag, +10,956 B encoded JS, and +5,869 B of CSS,
of which 5,599 B is the review close's 50 rules sitting dead in the one
stylesheet the stage already ships. The alternative - a second stylesheet or a
lazy client-only scene - would cost a request or lose server-rendered content,
so the dead bytes are documented instead of hidden.

## Owner decision

Accepted 2026-11-05 at the R5 visual checkpoint. R6 (polish, accessibility,
performance) starts next; the closing scene stays review-only and all five flags
stay off in the shipped export.
