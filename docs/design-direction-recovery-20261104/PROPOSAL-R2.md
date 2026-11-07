# V2 change proposal - R2 the edition's neighbourhood (review build)

Status: **accepted 2026-11-05** (R1 accepted 2026-11-05).
This is the first slice that touches the Home, so it is gated by a separate
build-time flag and ships a side-by-side review before any public default changes.
Implementation and measurements are recorded in `ACCEPTANCE/R2-2026-11-05.md`.

## Prototype reference

- `intelligent-atlas/prototype/index.html` + `app.js` (knowledge scene, preview,
  panel, "Open content" / "Explore connections"), `neighborhood-model.js`.
- Evidence: `evidence/proto-knowledge-dark-1280.png`,
  `proto-knowledge-expanded-dark-1280.png`, `proto-knowledge-light-390.png`.
- R1 surface: `evidence/r1-*.png`, accepted in `ACCEPTANCE/R1-2026-11-05.md`.

## Intent

Connect the three surfaces the prototype treated as one place:

`Edition -> its concept -> the neighbourhood -> the Atlas desk -> back to the edition`

R2 wires the accepted R1 neighbourhood into the Home's knowledge scene for the
selected edition, adds the breadcrumb and the Atlas desk hand-off, and keeps the
public export exactly as it is today. The public Home never receives candidate
concepts, claims or edges.

## What changes when the flag is on

- **Home knowledge scene**: below the edition's instrument, the selected edition's
  concept opens its candidate neighbourhood (field, preview, panel, table fallback,
  search). The centre can be explored without leaving the edition.
- **Breadcrumb**: `Edition -> Concept -> Neighbourhood -> Atlas desk`. The concept
  step follows the centre; the Atlas step carries the edition id back.
- **Concept home**: the panel states definition, aliases, corpus coverage, same-kind
  membership, evidence, reading, and the edition's lesson/practice links. It no
  longer only lives on a review route.
- **Atlas hand-off**: the field preview and the panel link to the Atlas desk with
  `?concept=<id>&return=<edition id>`. With `HANSA_ATLAS_REVIEW_PREVIEW=1` the desk
  opens the candidate explorer; the explorer shows `Back to the edition` and returns
  to `/?insight=<id>#edition`.
- **Public graph block**: on the review build, the neighbourhood replaces the empty
  "Where this idea leads" block. With the flag off the block is byte-for-byte the
  current one, including `model.graph.discovery`.

## Corrections found while embedding

Two defects in the accepted R1 field/panel only showed up once the field sat under a
small edition neighbourhood, so R2 fixes them in the shared components:

- a `related_in_decision` branch no longer prints its group label twice
  ("Related · Related in a decision");
- `Place all N` / `Show fewer` appear only when something is actually hidden, so an
  edition with four relations no longer offers an expansion that changes nothing.

The R1 route keeps its route, model and interactions; only those two control states
change on both surfaces.

## Flags and boundary

- New flag: `HANSA_NEIGHBOURHOOD_REVIEW=1`. It is a build-time, local-only switch.
  It must be set together with `HANSA_ATLAS_REVIEW_PREVIEW=1` for the Atlas desk
  hand-off to have concepts.
- `HANSA_ATLAS_REVIEW_PREVIEW` alone must not alter the Home. The landing now asks
  for an explicit public projection (`getAtlasPublic()`) for the stage model, so an
  accidentally enabled Atlas preview cannot put a candidate into Home props.
- `getAtlasReview()` is called only inside the `HANSA_NEIGHBOURHOOD_REVIEW` branch.
- The neighbourhood module is lazy-loaded (`next/dynamic`, client-only), so the
  public Home does not download its CSS or JS. Flag-off `out/` remains free of
  candidate ids.
- No publication state changes: every edge stays `technical_review`; `0 published`
  is stated wherever counts appear.

## Pinned files

R2 deliberately edits five of the nine app files pinned in `baseline.json`, because
the Home, the shared Atlas view model and the shared explorer are the surfaces being
wired. It also edits `lib/atlas/server.ts`, which is pinned by the knowledge-stage
receipt (M0) rather than by `baseline.json`, so six receipt-pinned files change in
total. Each change is recorded as a step-3 entry in
`docs/knowledge-stage-m6-20261104/INTEGRATION_MANIFEST.json`
(layer `design-recovery-r2/2026-11-05`, attribution `R2-home-embed`).

| File | Change | Flag-off behaviour |
| --- | --- | --- |
| `components/knowledge/hansa-landing.tsx` | explicit public projection; optional review neighbourhood prop | same model, same DOM |
| `components/knowledge/insight-stage.tsx` | forward an optional `neighbourhood` prop | same DOM |
| `components/knowledge/stage-knowledge.tsx` | render the embed when the prop exists, else the current block | same DOM |
| `lib/atlas/model.ts` | accept the `return` view key | same model, no warning on the desk |
| `components/atlas/explorer.tsx` | validated "Back to the edition" control | absent without a return id |
| `lib/atlas/server.ts` | split `getAtlasPublic()` / `getAtlasReview()`, keep `getAtlas()` | Home calls the public projection |

Unchanged baseline app pins: `stage-timeline.tsx`, `stage-closing.tsx`,
`stage-editorial.css`, `stage-model.ts`. The receipt pins for
`stage-editorial.css`, `stage-model.ts` and `app/globals.css` still match. All seven
prototype pins still match. `baseline.json` keeps the R0 hashes as historical
evidence; the acceptance record lists which pins moved and why.

## Removed

Nothing. The public Home's pending graph block, destinations and no-JS note remain.
No prototype interaction is deleted; the review route from R1 stays as it is.

## Gates for this slice

- Unit: edition/atlas link validation, return-param validation, unknown ids ignored,
  no open redirects; existing 271 + new guards.
- Build: `npm run test:all`; flag-off static export; flag-on review build.
- Browser: Home at 1280/390, light/dark, reduced motion - select an edition, open
  the neighbourhood, preview a branch, follow the Atlas desk, return to the edition.
- Accessibility: axe on the Home embed, keyboard path, live preview, table fallback.
- Leak: flag-off `out/` contains no candidate concept/edge id, no candidate title;
  the neighbourhood chunk is not requested by the public Home.
- Performance: flag-off Home DOM and resource count unchanged; the only byte delta
  is the +5,680 B lazy-import stub. The review build adds one 21.5 KB JS chunk and
  26.1 KB CSS, fetched only after hydration.
- Visual: owner side-by-side (compare.html section 08), not auto-approved.

## Owner decision

accepted 2026-11-05 - R2 is the edition's neighbourhood in the Home review build.
The public default stays off until a later slice changes it on purpose.
