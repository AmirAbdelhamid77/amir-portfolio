# V2 change proposal - R3 the desktop timeline fan (review build)

Status: **accepted 2026-11-05** (R1 and R2 accepted 2026-11-05).
This is the third review slice. It restores the prototype's desktop timeline as a
separate, build-time experience and keeps the accepted M6 strip for the public
build, mobile, and reduced-feature environments. Implementation and measurements
are recorded in `ACCEPTANCE/R3-2026-11-05.md`.

## Prototype reference

- `intelligent-atlas/prototype/index.html` (the timeline scene: ghost year,
  cables, playhead, focus label, track, ruler, peek, steppers, status).
- `intelligent-atlas/prototype/app.js` (`renderTimelineCards`, `renderCables`,
  `renderRuler`, `layoutTimeline`, `applyTimeline`, pointer drag with velocity,
  horizontal wheel, keyboard selection).
- `intelligent-atlas/prototype/timeline-model.js` (edition order, card view model).
- `.tl-*` rules in `intelligent-atlas/prototype/styles.css`.
- Evidence: `evidence/proto-timeline-dark-1280.png`,
  `proto-timeline-light-1280.png`, `proto-timeline-dark-390.png`.

## Intent

The first viewport should read as **a date you can enter**, not a row of equal
ticks. R3 restores the fan on desktop: the selected edition in the centre, its
neighbours stepped and scaled, cables to both stage edges, a ghost year, a
playhead, a five-tick ruler between the cards, the latest pin, the per-day title
and the status line. Selection inspects a date; opening the edition is still a
separate control, so the "selection is not activation" contract survives.

The shipped strip is deliberately kept: it is the accessible, compact and public
shape. This is a synthesis, not a revert.

## What changes when the flag is on

- **Desktop (>=1024 px)**: the fan replaces the strip in place, with 15 cards
  from the same stage model. Edition cards are buttons; quiet days are dashed,
  non-interactive cards. The selected edition is the only `aria-current="date"`.
- **Movement**: pointer drag with velocity settle, horizontal wheel/trackpad with
  a 140 ms settle, click, arrows/Home/End, Enter to open the edition. The fan
  always settles on the nearest **edition**, never on a quiet day.
- **Context**: ghost year, playhead, focus label (`Latest edition` or
  `Edition NN`), latest pill, cables (three groups at rest, the selected one
  accented), a 30-tick ruler with first/last date captions, a status line with
  editions, quiet days, days and published connections.
- **Follow-through**: selecting a card updates the peek, the URL (`?insight=`)
  and the edition scene exactly as the strip does. No new data, no new copy about
  candidate relations.
- **Below 1024 px**: the strip renders unchanged, including its own section copy
  (the fan copy is never shown next to a control that is not there).

## Corrections found while restoring

- The section note now has separate fan and strip texts, so a phone is not told
  to drag a fan it cannot see.
- The status line uses explicit `·` separators; screen readers and copied text no
  longer read `3 editions12 quiet days...`.
- A drag or wheel that follows keyboard use moves focus to the settled card, so
  the focus ring cannot be left on the card the reader moved away from.
- Drag/wheel QA starts from an end of the edition range and moves inward; the
  first measurement run dragged further out of range and could not change the
  selection.
- The fan's CSS moved out of `stage-editorial.css` into a fan-only stylesheet
  imported by the dynamic chunk, so the public build keeps the M6 bytes.

## Flags and boundary

- New flag: `HANSA_TIMELINE_REVIEW=1`, a build-time, local-only switch.
- With the flag off the timeline renders exactly the M6 strip: same DOM nodes,
  same 242,150 B stylesheet total, same 42 resources; the fan chunk and CSS exist
  in the export (like the R2 slice) but are never requested.
- The fan is `next/dynamic` with `ssr: true`, so the review build still renders
  the first viewport in the static HTML (no strip-to-fan flash, no CLS).
- `stage-model.ts` is unchanged. Day parts and edition ordinals are derived in the
  fan helper; the model still owns which edition is visible.
- No publication state changes: every edition and edge stays `technical_review`,
  and `0 published` is stated wherever counts appear.

## Pinned files

R3 changes three review-pinned application files and adds four fan artifacts.
Each changed file is recorded as a step-4 entry in
`docs/knowledge-stage-m6-20261104/INTEGRATION_MANIFEST.json`
(layer `design-recovery-r3/2026-11-05`, attribution `R3-timeline-fan`).

| File | Change | Flag-off behaviour |
| --- | --- | --- |
| `components/knowledge/stage-timeline.tsx` | strip extracted unchanged; optional dynamic fan | same DOM, no fan chunk |
| `components/knowledge/insight-stage.tsx` | forwards `timelineFan` | same DOM |
| `components/knowledge/hansa-landing.tsx` | `HANSA_TIMELINE_REVIEW=1` branch | no branch taken |
| `components/knowledge/timeline-fan.tsx` (new) | fan DOM, gesture and status | not rendered or requested |
| `components/knowledge/stage-fan.css` (new) | fan-only rules | not downloaded |
| `lib/knowledge/timeline-fan.ts` (new) | pure geometry and settle rules | not used |
| `tests/knowledge/timeline-fan.test.mjs` (new) | eight geometry guards | test-only |

`components/knowledge/stage-editorial.css` is **restored to its M6 pin**
(`e32523f9...`, 19,122 B), so it needs no new pin. Unchanged: `stage-model.ts`,
`stage-closing.tsx`, all seven prototype pins and the M0/M6 receipt chain.

## Removed

Nothing. The strip, its keyboard grammar and its mobile scroll behaviour remain.
The R1 route and the R2 neighbourhood are untouched.

## Gates for this slice

- Unit: 8 fan guards; knowledge suite 82; full suite to run.
- Build: `npm run test:all`; flag-on review export; flag-off public export.
- Browser: 1280 dark/light, 1024 light, 390/320 light, reduced motion plus one
  full-motion capture; click, keyboard, drag and wheel each change the selection;
  0 overlaps and 0 horizontal overflow.
- Accessibility: axe 0 violations on the timeline scene, 0 console errors, one
  `aria-current="date"`, focus stays in the fan after arrow navigation.
- Leak: flag-off Home has no fan markup, no fan link, no fan request; the only
  delta is the dynamic-import stub.
- Performance: public DOM 779, styles 242,150 B, resources 42, CLS 0; review fan
  adds 9.9 KB JS + 7.1 KB CSS, LCP 744 ms, CLS 0.
- Visual: owner side-by-side (compare.html section 09), accepted 2026-11-05.

## Owner decision

accepted 2026-11-05 - R3 is the restored desktop timeline fan. The public default
stays off until a later slice changes it on purpose, and the strip stays for phones
and the public build.
