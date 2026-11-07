# V1 change proposal - R1 Knowledge Neighbourhood (review surface)

Status: **accepted 2026-11-05** (behind the review flag; nothing in the public Home
changes until V5). Acceptance record:
`ACCEPTANCE/R1-2026-11-05.md`.

## Prototype reference

- `intelligent-atlas/prototype/index.html` + `app.js` (neighbourhood renderer,
  preview, panel, fallback), `neighborhood-model.js` (selection rules),
  `styles.css` `.nb-*` block.
- Evidence: `evidence/proto-entrances-dark-1280.png`,
  `proto-knowledge-dark-1280.png`, `proto-knowledge-expanded-dark-1280.png`,
  `proto-knowledge-light-390.png`.

## Intent

Restore the missing core: a concept, its labelled neighbourhood, and a reading panel,
driven by the real candidate Atlas. R1 is a dedicated, gated review route so the
neighbourhood can be judged at 1280 and 390, light and dark, before it is wired into
the Home (R2) or the timeline/dealer are touched (R3/R4).

## Improves on the prototype

1. **Composition uses the whole field.** The prototype places every group on a fixed
   radius with one-sided clusters and a large empty field for low-degree concepts. R1
   distributes the active groups evenly around the centre and sizes the field to its
   content (no fixed 520 px void).
2. **Fair branch budget.** The prototype slices the first N entries globally, so a
   concept with many `requires` hides its contrasts entirely. R1 guarantees one entry
   per occupied group before filling the remaining slots, and states the hidden count.
3. **Measured type and contrast.** Labels move from 9 px to 10.5/11 px, the centre card
   gets a real heading level, and every text token is checked in both themes.
4. **Truthful single-subject entrance.** The Atlas has 42 Fabric concepts and no
   relations for the other four prototype domains. R1 shows the real Fabric entrance
   plus a quiet, explicit "no candidate relations recorded yet" ledger with real
   destinations, instead of four invented concept columns.
5. **Direction is stated in words.** Stored direction is rendered as "Requires first"
   / "Unlocks" / "Contrasts" / specific relation label, with a sentence per entry.
6. **Keyboard and touch parity.** Branch buttons are real buttons; arrow keys move
   within a group; mouse hover and keyboard focus share one preview; a table fallback
   is server-rendered and works with JS off.

## Removed

None from the shipped product. R1 adds a route; the Home is untouched.

## Changed (new files only)

- `lib/knowledge/neighbourhood.ts` - typed, pure model over `Atlas`.
- `tests/knowledge/neighbourhood.test.mjs` - model guards.
- `components/knowledge/neighbourhood/*` - field, entrances, search, panel, fallback.
- `app/review/neighbourhood/page.tsx` - gated route, `noindex`.
- `components/knowledge/neighbourhood/neighbourhood.css` - scoped styles.

## Preserved

- The M6 Home, its pinned files and receipts (nothing pinned is edited).
- `stage-model.ts` audience boundary, `getAtlas()` fail-closed projection.
- All 257 tests; the new suite is additive.
- Static export, aliases, verifiers, no new dependency.

## Explicitly deferred

- Save/pocket on the concept panel (R4 - a save control without a pocket would be dead).
- Compare/Apply/Route intents (R3 in the plan's original numbering: R2 atlas, R3
  timeline; intents land with R2 continuity), edition -> neighbourhood wiring (R2).
- Cinematic transitions (R6).

## Risks / rollback

- Risk: a review route leaks candidate content into the public export. Guard: route is
  `notFound()` unless `HANSA_ATLAS_REVIEW_PREVIEW=1`, `robots: noindex`, and the
  default concept id is chosen on the server so no candidate identifier ships in the
  client bundle. Verified: flag-off `out/` has 0 candidate concept ids, and the route
  path is the 404 page with no candidate title.
- Risk: card collisions for 3+ entries. Guard: the model asserts real card boxes
  (168x66 at 1280, 146x66 at 1024) for all 42 concepts, default and expanded; the fan
  only renders at >=1024, below that the field is a list.
- Rollback: delete the route/component/model/test files; no other surface changed.

## What the first QA pass changed

The first capture ran against `127.0.0.1`, where Next dev blocks its client chunks, so
the page rendered but never hydrated and every interaction looked dead. The capture
now uses `localhost`, and the script proves hydration in the production export too.
Fixes made after looking at the captures:

1. **Card collisions** - Import mode / Incremental refresh overlapped 41x11 px. The
   layout now uses a wider ellipse (40/38), a wider per-group arc (30 + 20 per extra
   entry, capped 30 degrees short of the next group) and 146-170 px cards. All 168
   concept/state/viewport cases are now collision-free and tested.
2. **Accessible names** - the branch `aria-label` omitted the visible tag (axe
   `label-content-name-mismatch`). Replaced with a visually hidden direction sentence,
   so the visible text is part of the name.
3. **Empty legend** - a 0.45 opacity dot failed AA. Empty groups now use the muted
   colour and a hollow dot, in both the legend and the panel counts.
4. **Mobile header** - the fixed 57 px site header clipped the kicker. The review
   surface now owns its top clearance; measured gap 51 px at 1280, 31 px at 390.
5. **Breakpoint** - the fan now needs >=1024 px. Below that the labelled list is the
   honest layout at AA type sizes, and the panel reflows to two columns at 1023 and one
   at 639.
6. **Entrances header** - the kicker, heading and copy were three grid children, which
   pushed the heading into the right column. Wrapped, so the composition reads left to
   right.
7. **Heading outline** - the panel no longer repeats the concept as a second `<h2>`; it
   is a paragraph inside a section named by it, so the outline is h1 -> h2 (concept) ->
   h3 (Connections / Same kind / Evidence / Reading).

Axe on the field and on the expanded field: 0 violations. Console: 0 errors.

## Rubric (self, to be re-scored by the owner)

| # | Dimension | Self score | Measured support |
| --- | --- | --- | --- |
| 1 | Composition and hierarchy | 4 | one first read; field centre is the heading; 20 captures at 1280/1024/390/320 |
| 2 | Visual identity | 4 | paper/ink tokens, four accents, serif/sans/mono split, no card grid |
| 3 | Reading density and fidelity | 4 | model reads `content/atlas` only; candidate + `0 published` at every count |
| 4 | Interaction parity | 4 | search, entrances, 4 groups, preview, expand, membership, table fallback |
| 5 | Continuity | 3 | Atlas desk and reading resolve; edition wiring is R2 |
| 6 | Truth and publication posture | 4 | flag-off export clean; 404 + noindex verified |
| 7 | Responsive and input parity | 4 | list below 1024, no overflow at 320, keyboard arrows within groups |
| 8 | Accessibility and motion | 3 | axe clean; manual screen reader NOT RUN |
| 9 | Performance | 4 | route JS 8.4 KB gzip, CSS 4.6 KB gzip, CLS 0, 69 ms long task |
| 10 | Engineering integrity | 4 | 271 tests, pin hashes unchanged, rollback = delete files |

## Owner decision

accepted 2026-11-05 - R1 is the restored Knowledge Neighbourhood. R2 may start with
the same flag discipline and a side-by-side review before any public default changes.
