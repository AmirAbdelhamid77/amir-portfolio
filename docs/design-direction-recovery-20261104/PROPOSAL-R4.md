# V2 change proposal - R4 the cinematic dealer (review build)

Status: **accepted 2026-11-05** (R1, R2 and R3 accepted 2026-11-05).
This is the fourth review slice. It restores the prototype's dealer as a reading
room - edition rail, the whole hand, a reader beside it - behind its own
build-time flag. The accepted inline card table stays the flag-off default.
Implementation and measurements are recorded in `ACCEPTANCE/R4-2026-11-05.md`.

## Prototype reference

- `intelligent-atlas/prototype/index.html` (the dealer backdrop and dialog:
  head, day rail, hand, reader, foot).
- `intelligent-atlas/prototype/app.js` (`renderDealer`, `renderDealerHead`,
  `renderDealerRail`, `renderHand`, `renderReader`, `openDealer`, `closeDealer`,
  `selectDealerCard`, `dealerLocate`, `saveActiveCard`).
- `.dealer*`, `.card*`, `.reader*` in
  `intelligent-atlas/prototype/styles.css`.
- Evidence: `evidence/proto-dealer-dark-1280.png`, and the shipped M6 inline
  dealer in `evidence/shipped-dealer-dark-1280.png`.

## Intent

The prototype's dealer is **a hand you read**, not a sequence of reveals. R4
restores that: a modal with the fifteen-day rail, every card of the edition
visible at once with its capability tags, and a reader that changes as you select
a card. Saving keeps a card in this browser and lists it inside the dealer;
`Locate in the edition` closes the dialog and puts you on the edition scene with
focus on its heading.

Selection still inspects; nothing opens a public claim. Every card, capability
and reader field is a restatement of the edition's own reviewed fields, and the
hand is always labelled as under review while the edition is.

## What changes when the flag is on

- **Open**: `Open the edition` in the timeline opens a modal dialog. The trigger
  becomes a close control (`aria-haspopup="dialog"`, `aria-controls`), the URL
  gains `?dealer=<edition>` next to `?insight=`, and the page behind the dialog
  is scroll-locked and `inert`.
- **Rail**: fifteen days, newest first, centred when they fit, scrollable when
  they do not. Edition days are buttons with `aria-current="date"`; quiet days
  are non-interactive placeholders. Switching an edition keeps the dialog open
  and re-deals that edition's hand.
- **Hand**: all three cards (principle, caveat, evidence) at once, each with its
  kind, review state and the four capability tags (`discover`, `read`, `assess`,
  `relate`). Selecting a card updates the reader in place; the cards land with a
  short staggered deal once per edition.
- **Reader**: kind, review state, card position, title, lede, labelled fields
  (scenario / prediction / takeaway / caveat as the edition states them), a
  verbatim evidence quote for the source card, `Why this card` with source,
  locator, reviewer and checked date, then `Save for later`, `Next card` and the
  card's own destination.
- **Saved**: a browser-local bookmark list (`hansa.dealer.saved.v1`), capped,
  de-duplicated and fail-closed. The dealer lists saved cards in a footer
  popover; choosing one opens its edition at that card.
- **Deep links**: `?dealer=<edition id>` and the prototype's
  `?dealer=daily:YYYY-MM-DD` both resolve against the editions the stage may
  show. An unknown, withheld or malformed value opens nothing.
- **Leave**: `Escape`, the close button, the scrim and `Back to the timeline` all
  close the dialog, remove `?dealer=`, restore focus to the trigger and un-inert
  the page. `Locate in the edition` additionally scrolls to and focuses
  `stage-edition-title`.

## Deliberate synthesis, not a copy

- The dealer is **not** the shipped inline reveal. The inline table is the
  accepted public shape; the modal is the review slice. With the flag off the
  inline dealer, its two booleans and its DOM are byte-identical to R3.
- The site-wide pocket and the learning thread remain **deferred** to a later
  slice. R4's save is an in-dealer bookmark list, not the prototype's pocket.
- The evidence card links to the Microsoft Learn source directly; the prototype's
  "Preview resource" button is not reproduced because the stage has no resource
  preview surface and a direct, safe external link is the honest destination.
- Motion is CSS only (dialog rise, scrim fade, staggered deal, deck edges that
  fade out). It is disabled under `prefers-reduced-motion`, where every card is
  opaque and untransitioned from the first frame.
- Below 900 px the hand and reader stack inside one scroller; tapping a card
  brings the reader into view instead of changing an off-screen border. At
  640 px and below the dialog is a full-screen sheet with a scrollable rail.

## Corrections found while restoring

- The dialog is a **portal** into `document.body`. Rendering it inside the stage
  tree would have made the `inert` background contain the dialog itself.
- Focus returns to the trigger **after** the background stops being inert;
  focusing an inert element is a silent no-op, which the first implementation did.
- The screen-reader announcement is scoped to the dialog; an unscoped
  `[role="status"]` query read the stage's own live region while the modal was
  open.
- The rail centres when it fits (`justify-content: safe center`) and fades its
  cut edges on phones, so a half-visible day reads as "more days this way".
- A saved-card open announces the saved card, not the deal that preceded it.
- An axe pass and a focus-trap walk found no violations, but a manual
  screen-reader run is still outstanding.

## Flags and boundary

- New flag: `HANSA_DEALER_REVIEW=1`, a build-time, local-only switch, independent
  of the Atlas, neighbourhood and timeline flags.
- With the flag off: no `dc-` markup, no `DealerCinematic`, no `?dealer=`
  parsing, no dealer request; the emitted dealer chunk and stylesheet exist on
  disk but are never fetched. DOM 779 nodes, 42 resources, CSS 242,150 B - the
  same as the M6/R3 public export.
- The dealer chunk is `next/dynamic` with `ssr: false`, so it is fetched only when
  an edition is opened. With the flag on, the review build's initial page does
  not request it.
- `stage-model.ts` is unchanged. The hand, rail, saved list and deal plan are
  derived in a pure module from the edition and the model's day list.
- No publication state changes: all three editions stay `technical_review`, and
  `0 published` is stated in the dealer footer wherever counts appear.

## Pinned files

R4 changes four review-pinned application/test files and adds four artifacts.
Each changed file is recorded as a step-5 entry in
`docs/knowledge-stage-m6-20261104/INTEGRATION_MANIFEST.json`
(layer `design-recovery-r4/2026-11-05`, attribution `R4-cinematic-dealer`).

| File | Change | Flag-off behaviour |
| --- | --- | --- |
| `components/knowledge/stage-timeline.tsx` | optional `dealerMode="modal"` trigger branch | trigger and inline table unchanged |
| `components/knowledge/insight-stage.tsx` | modal state, `?dealer=` handlers, lazy mount, locate | no handler reachable, no chunk |
| `components/knowledge/hansa-landing.tsx` | `HANSA_DEALER_REVIEW=1` branch | no branch taken |
| `tests/knowledge/canonical-home.test.mjs` | dual-dealer guard (one inline default, one modal) | test-only |
| `components/knowledge/dealer-cinematic.tsx` (new) | modal dialog, rail, hand, reader, saved | not rendered or requested |
| `components/knowledge/dealer-cinematic.css` (new) | dealer-only rules | not downloaded |
| `lib/knowledge/dealer-hand.ts` (new) | pure hand/rail/URL/saved/deal model | not used |
| `tests/knowledge/dealer-hand.test.mjs` (new) | twelve hand guards | test-only |

Unchanged: `stage-model.ts`, `stage-closing.tsx`, `stage-editorial.css`, the
inline `knowledge-dealer.tsx`, all seven prototype pins and the M0/M6 chain.

## Removed

Nothing. The inline card table, its deal animation, the strip and the fan, the R1
route and the R2 neighbourhood are untouched. No pocket, thread, closing or
publication code is removed because none of it is in this slice.

## Gates for this slice

- Unit: 12 dealer guards; knowledge 94; full suite 302.
- Build: `npm run test:all`; flag-on review export (four flags); flag-off public
  export last.
- Browser: 1280 dark/light, 1024 light, 390/320 light; open, card select, rail
  switch, save, saved list, saved open, next card, focus trap forward/backward,
  Escape, locate, deep link, mid-deal full motion; 0 horizontal overflow.
- Accessibility: axe 0 violations on `#dealer-cinematic`, 0 console errors, one
  `aria-modal` dialog, 11/12 body children inert while open, focus returns to the
  trigger after the background is restored.
- Leak: flag-off Home has no dealer markup, class, link or request; the only
  delta is the dynamic-import stub (+12,321 B over the M6 baseline, +5,538 B over
  R3).
- Performance: public DOM 779, resources 42, CSS 242,150 B, CLS 0; review dealer
  fetches 11.2 KB JS + 12.4 KB CSS only on open, LCP unchanged at 844 ms, CLS 0.
- Visual: owner side-by-side (compare.html section 10), **pending**.

## Owner decision

Accepted 2026-11-05 at the R4 visual checkpoint. R5 (the closing scene) starts
next; the dealer stays review-only.
