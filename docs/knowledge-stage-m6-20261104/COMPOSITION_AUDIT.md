# M6 composition audit — canonical Home, three scenes

Status: **step 1, foundation only.** This document records what exists, what M6
must change and what must stay. The visible Home is unchanged; it still renders
the v3 gate stack. Nothing here is a claim that the swap has happened.

- Repository HEAD when this audit was written: `0b14507`
- Pre-integration baseline: `intelligent-atlas/baselines/2026-11-04-pre-m6/baseline.json`
  (32 pinned files, captured with `capture-baseline.mjs "2026-11-04-pre-m6"`)
- Audit date: 2026-11-04

## 1. What the canonical Home is today

One implementation, two addresses:

| Route | File | Role |
|---|---|---|
| `/` | `app/page.tsx` | metadata only; renders `HansaKnowledgeLanding` |
| `/prototype-c/` | `app/prototype-c/page.tsx` | alias; renders the same module |

`components/knowledge/hansa-landing.tsx` owns the stage: it reads
`content/knowledge/insights.json` through `eligibleInsights(feed.items, true)`,
reads the Atlas through `getAtlas()`, and passes plain data to
`InsightStage`. The review-preview flag is never switched on here, so a
technical-review edge cannot reach the page.

### Current gate flow (v3, 2026-10-30)

`components/knowledge/insight-stage.tsx` is one client boundary with five
stacked sections and a trailing archive:

| Order | Section | Component | Anchor / id |
|---|---|---|---|
| 0 | Today — date hero; CTA swaps it for the dealer takeover | `stage-today.tsx` | — |
| 1 | The day's insight — scene, concept instrument, editions rail | `insight-scene.tsx`, `knowledge-instrument.tsx`, `insight-rail.tsx` | `#today` (`ref=stageRef`) |
| 2 | Learn gate (full viewport) | `stage-learn-gate.tsx` | — |
| 3 | Certificate gate (full viewport) | `stage-cert-gate.tsx` | — |
| 4 | Context strips — About, Atlas peek, continue row | `stage-about.tsx`, `atlas-peek-stage.tsx` | — |
| — | Archive — every edition, filter + permalink | `insight-archive.tsx` | `#archive` |

State lives in one place: `selectedId`, scene disclosure per edition, dealer
zones per card, the concept experiment, status and live-region announcements.
The URL is canonical: `?insight=<id>` is read on mount and on `popstate`, and
written with `history.pushState` only when a reader chooses an edition.
Reduced motion is honoured through `useCalmMotion`; two gates paint
`--gate-rise` from `useScrollProgress`.

The public data path is exactly three inputs — eligible editions, the public
Atlas projection, and a notice string — so the stage cannot invent content.

## 2. What M6 changes

M6 replaces the competing full-screen Learn and Certify gates with three scenes
and a timeline-first entry, per §11 of `NEXT_PHASE_PLAN_EN.md`:

| Scene | Entry content | Boundary in `lib/knowledge/stage-model.ts` |
|---|---|---|
| Timeline | 15 consecutive days, newest first; an edition sits on its own date only | `timeline.days`, `timeline.editions`, `timeline.emptyNotice`, `timeline.withheldEditions` |
| Knowledge | graph state, published/withheld counts, honest destinations | `graph.state`, `graph.notice`, `graph.discovery` |
| Closing | four site-relative destinations, review status of what was shown | `closing.destinations`, `review.status`, `review.notice` |

The Learn and Certify material is **not deleted**. It becomes destinations
(`/learn`, `/practice/catalogue`, `/search`, the Atlas desk) plus the existing
lesson/practice routes that already exist outside the Home. The stage model
already returns those four hrefs, and the test asserts they are site-relative.

The first viewport is the timeline, not a full-viewport gate. The dealer keeps
its renderer; what changes is where it is mounted (inside the timeline scene,
keyed by the selected edition) and that its return contract is
`onSelect`/`onDeal`/`onCollect` without owning page state.

## 3. File-by-file migration map

Legend: **keep** unchanged, **reshape** edited, **new** added, **retire**
removed from the Home (file may remain for other routes).

| File | Today | M6 step 2 action | Why |
|---|---|---|---|
| `lib/knowledge/stage-model.ts` | new, unused by UI | **keep** (already the boundary) | audience, timeline, counts, destinations; pure |
| `tests/knowledge/stage-model.test.mjs` | new, 12 tests | **keep**, extend for the rendered shape | proves the boundary before the UI uses it |
| `components/knowledge/hansa-landing.tsx` | builds `items`/`atlas`/`notice` | **reshape**: call `buildStageModel`, pass the model and `today` | one audience decision, not three ad-hoc filters |
| `components/knowledge/insight-stage.tsx` | five gates + footer | **reshape**: three scenes; keep selection state and the `?insight=` effect | orchestration, not a second data path |
| `components/knowledge/stage-today.tsx` | date hero + dealer takeover | **replace** by the timeline scene | the date hero *is* the timeline's first row |
| `components/knowledge/insight-rail.tsx` | editions rail in gate 1 | **reuse** as the timeline's row track (or its accessible list fallback) | audited local Timeline capability; date identity already correct |
| `components/knowledge/knowledge-dealer.tsx` | dealer takeover | **reuse** renderer; mount in the timeline scene | source-backed cards, tested return contract |
| `components/knowledge/insight-scene.tsx` | reasoning disclosure + experiment | **keep**, moved under the knowledge scene | no copy change, no new claims |
| `components/knowledge/knowledge-instrument.tsx` | concept instrument | **keep**, mounted per selected edition | deterministic local state |
| `components/knowledge/insight-archive.tsx` | `#archive` archive | **keep** | deep links and per-edition permalinks |
| `components/knowledge/stage-learn-gate.tsx` | full-screen Learn gate | **retire** from Home; link to `/learn` | no competing gate |
| `components/knowledge/stage-cert-gate.tsx` | full-screen Certify gate | **retire** from Home; link to `/practice/catalogue` and `/lab/dp-600` | no competing gate |
| `components/knowledge/stage-about.tsx` | About strip | **keep**, closing scene | identity/context |
| `components/knowledge/atlas-peek-stage.tsx` | Atlas peek | **keep** (review audience) / hide when `graph.state === "empty"` publicly | zero-edge state must not show a broken canvas |
| `components/knowledge/observatory.css`, `stage-editorial.css` | gate canvas, rise, dealer | **reshape** for three scenes; keep token names and reduced-motion rules | styles are already theme-mapped |
| `components/site-header.tsx` | `isLanding ? LANDING_NAV : NAV` | **keep**; add the on-demand compact condition | navigation must not duplicate the timeline |
| `app/page.tsx`, `app/prototype-c/page.tsx` | metadata + alias | **keep** | one implementation, two addresses |

No file under `content/` is edited. No question, answer, progress key or route
is renamed.

## 4. Guards that must be re-baselined (not silently relaxed)

| Guard | Assertion that M6 breaks | Required change |
|---|---|---|
| `tests/knowledge/canonical-home.test.mjs` | the landing contains `Editions under editorial review`; today's insight markers; `#archive` heading text; "single landing" file checks | assert the three-scene markers (timeline, knowledge, closing) and keep the single-landing, alias and no-storage checks |
| `scripts/qa-canonical-home.mjs` | five markers: `knowledge stage`, `the learn gate`, `certificate preparation`, `questions per exam objective`, `the insight archive` | new marker set; keep DEALER, URL, ARCHIVE permalink, mobile, keyboard and console-error checks |
| `scripts/verify-canonical-home.mjs` | `/Think through a situation|Reveal the reasoning/` in `out/index.html` | assert the timeline's date identity and the honest public zero-edge sentence instead |
| `scripts/final-review-negative.mjs` | rejects an unaudited edit to `components/knowledge/insight-stage.tsx` | keep rejecting; the M6 layer records the authorized bytes |
| `scripts/seal-canonical-home.mjs` | seals the Home hashes | reseal only after the swap, in the M6 layer |
| `intelligent-atlas/tools/verify-prototype-journey.mjs` | 21 journey checks against the prototype, not the app | NOT RUN for the app; a new app journey harness is M7 work |

Rule for step 2: every changed file gets an entry in
`docs/knowledge-stage-m6-20261104/INTEGRATION_MANIFEST.json` with
`previousSha256` equal to the hash the older layer recorded. No expected hash is
edited to make a failure disappear; a stale assertion is either corrected with
its invariant restated or the change is reported as a failure.

## 5. Receipt-layer cost (measured, not estimated)

The M0 manifest cannot be edited. This audit's commit therefore adds the first
successor layer:

| Layer | File | Contents |
|---|---|---|
| M0 | `docs/knowledge-stage-m0-20261103/INTEGRATION_MANIFEST.json` | 425 changed pins, 233 additions, 7 removals — untouched |
| M6 | `docs/knowledge-stage-m6-20261104/INTEGRATION_MANIFEST.json` | 3 changed pins, 3 additions — this commit |

`scripts/knowledge-stage-receipt.mjs` now reads M6 above M0 and composes
`expected()` as `m6After(m0Expected(p, h))`, so every existing verifier that
depends on the chain sees the successor without being edited.
`scripts/final-review-negative.mjs` gained one import and one scratch copy of
the M6 manifest and its paths, because M6 is a successor of M0 and not reachable
from it.

Step 2 will need pins for roughly: `hansa-landing.tsx`, `insight-stage.tsx`,
`stage-today.tsx` (removed from Home), `stage-learn-gate.tsx`,
`stage-cert-gate.tsx` (retired from Home), two CSS files, the three guards in
§4, and every new scene component. Budget: one more commit, one more layer
append, and a reseal after the owner's visual approval. The exact count will be
taken from `git diff --name-only`, not predicted here.

## 6. Contracts that must survive the swap

| Contract | Evidence today | Step 2 requirement |
|---|---|---|
| `/` and `/prototype-c/` render one implementation | `canonical-home.test.mjs` | no forked JSX, data or state |
| `?insight=<id>` deep link and Back/Forward | `insight-stage.tsx` restore effect; QA URL01–03 | same parameter, same resolution, same unavailable-edition message |
| `#today` anchor | `id="today"` on gate 1 | keep the id on the timeline scene |
| `#archive` anchor and permalinks | `insight-archive.tsx`; QA ARCHIVE01–02 | unchanged |
| Header marks Today on `/` | `LANDING_NAV`, `activeHrefFor` | unchanged |
| Home writes no storage | `canonical-home.test.mjs` source scan | unchanged; the stage model reads nothing |
| Content byte identity | `tests/content/sql-vault.test.mjs` via the receipt chain | unchanged |
| Public payload has no candidates | `lib/atlas/model.ts` projection; `stage-model` test | `graph` carries counts, never claims or edges |
| Static export only | `npm run build` + `postbuild` aliases | no server-only API on the Home path |

Not covered by this audit and still open: owner visual acceptance (M3), the two
light-mode relation tokens that measure 2.20:1 (`--chart-3`) and 2.98:1
(`--chart-4`) against the 3:1 mark target, and any deployment (owner-only).

## 7. Ordered next step

1. Owner sign-off on the three-scene visual direction and the failing light-mode
   tokens (or an accepted exception). Without it, step 2 can be built but not
   accepted.
2. Build the three scenes against `buildStageModel`; keep the dealer and rail
   renderers.
3. Re-baseline the three guards in §4 and reseal the Home.
4. Run `npm run test:all`, lint, `tsc --noEmit`, `npm run build`, the four
   verifiers, and the app journey harness (new in M7).
5. Measure against `2026-11-04-pre-m6` — first load, timeline entry, edition
   switch, dealer return — and report the deltas without a performance claim.

Until step 2 lands, this Home is the v3 gate stack and every M6 statement above
describes the plan, not the current rendering.
