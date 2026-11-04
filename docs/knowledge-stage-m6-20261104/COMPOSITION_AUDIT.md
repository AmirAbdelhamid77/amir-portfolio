# M6 composition audit — canonical Home, three scenes

Status: **step 2 landed — the visible swap.** The Home now renders three scenes
in plain document flow: a fifteen-day timeline (`#today`), the selected edition
unfolded (`#edition`), and a closing signpost (`#closing`), followed by the
archive. The v3 gate stack is no longer mounted. The gate components remain on
disk for reuse; nothing else imports them.

- Repository HEAD when step 2 was written: `6e69aef` (step 1: `bd65dc5`; the
  baseline was captured at `0b14507`)
- Pre-integration baseline: `intelligent-atlas/baselines/2026-11-04-pre-m6/baseline.json`
  (32 pinned files, captured with `capture-baseline.mjs "2026-11-04-pre-m6"`)
- Audit date: 2026-11-04; step 2 recorded in the same M6 layer
- Owner approval of the direction: given ("I approve it all, do it")
- Owner visual acceptance (M3): **still not recorded**. The build, tests and
  browser QA below are engineering evidence, not a visual sign-off.

## 1. What the canonical Home was before M6

One implementation, two addresses:

| Route | File | Role |
|---|---|---|
| `/` | `app/page.tsx` | metadata only; renders `HansaKnowledgeLanding` |
| `/prototype-c/` | `app/prototype-c/page.tsx` | alias; renders the same module |

`components/knowledge/hansa-landing.tsx` owned the stage: it read
`content/knowledge/insights.json` through `eligibleInsights(feed.items, true)`,
read the Atlas through `getAtlas()`, and passed plain data to `InsightStage`.
The review-preview flag was never switched on there, so a technical-review edge
could not reach the page.

### The retired gate flow (v3, 2026-10-30)

`insight-stage.tsx` was one client boundary with five stacked sections and a
trailing archive: a sticky date hero with a dealer takeover, the day's insight,
a full-viewport Learn gate, a full-viewport certificate gate, then About / Atlas
peek / continue strips. State lived in one place, and two gates painted
`--gate-rise` from `useScrollProgress`.

## 2. What M6 changed

M6 replaced the competing full-screen Learn and Certify gates with three scenes
and a timeline-first entry, per §11 of `NEXT_PHASE_PLAN_EN.md`:

| Scene | Anchor | Composition | Boundary used |
|---|---|---|---|
| Timeline | `#today` | `stage-timeline.tsx`: 15 consecutive days, newest first, one edition per date; peek; dealer disclosure | `timeline.days`, `timeline.editions`, `timeline.emptyNotice`, `timeline.withheldEditions` |
| Knowledge | `#edition` | `stage-knowledge.tsx`: `InsightScene`, `KnowledgeInstrument`, graph panel | `graph.state`, `graph.notice`, counts, `graph.discovery` |
| Closing | `#closing` | `stage-closing.tsx`: destinations, review status, About strip, live region | `closing.destinations`, `review.status`, `review.notice` |

The Learn and Certify material was **not deleted**. It became destinations
(`/learn`, `/practice/catalogue`, `/search`, the Atlas desk) plus the existing
lesson/practice routes outside the Home. `stage-learn-gate.tsx`,
`stage-cert-gate.tsx` and `stage-today.tsx` remain on disk for reuse; nothing
mounts them, and a guard asserts that the Home no longer does.

The audience decision is made exactly once, in `hansa-landing.tsx`, by
`buildStageModel({ audience: "review", today: new Date() })`. The review audience
is what lets the Home show the three `technical_review` editions it already
labelled as review; it never reaches the Atlas, which keeps its own fail-closed
public projection. Because the site is a static export, `today` is the build
date: the fifteen-day window is build-anchored and the archive stays the complete
list. The timeline copy says "newest first" rather than pretending to know the
visitor's clock.

### Timeline decisions

- **Selection is not activation.** A day button updates the peek and
  `?insight=`. `Enter` on the selected day, or the **Open the edition** button,
  opens the dealer; `Space` still only selects. The dealer is mounted inside the
  timeline scene behind that disclosure, so the first viewport stays a clock.
- **Quiet days are not buttons.** A day without an edition is a static cell with
  a hairline tick; an edition day is a button with a primary bar, a short
  `In review` / `Published` label and its title in the accessible name. The empty
  state never invents a grey placeholder card.
- **Keyboard.** One tab stop (roving `tabindex`); `←`/`→` walk the edition days,
  `Home`/`End` jump to the newest/oldest tick, focus follows the selection. If
  the selected edition is older than the fifteen-day window, the newest tick
  takes the stop so the strip is never unreachable.
- **Narrow screens.** The strip scrolls horizontally and centres the selected
  edition on load and on selection without moving the page's own scroll.

### Deviations from the visual spec, stated

| Spec suggested | Implemented | Why |
|---|---|---|
| Reuse `insight-rail.tsx` as the timeline row | A new calendar strip | The rail models *editions*; the scene models *days*. Empty days have no edition identity, so reusing the rail would have meant inventing events for them. The rail is untouched and still available. |
| Edition titles in the track | Ticks only; title in the access name and the peek | Fifteen titles at 80px columns is noise; the peek already carries the selected title. |
| Dealer as a full-screen takeover | Dealer as a disclosure under the peek | The brief forbids competing full-screen gates on the Home. |
| A live "today" after hydration | Build-anchored `today` | Static export: there is no request-time clock, and faking the visitor's date would make the model disagree with the HTML. |

### Knowledge and closing decisions

`StageAtlasPeek` is mounted only when `model.graph.state === "ready"`. Today the
public projection has zero published edges, so the Home shows `graph.notice`,
the withheld counts (review audience only) and the four discovery destinations —
never a decorative graph or a candidate edge. The closing scene repeats the
review status, hands over the selected edition's lesson/practice/archive links,
and prints the feed's own notice verbatim.

## 3. File-by-file migration map

Legend: **keep** unchanged, **reshape** edited, **new** added, **retire** removed
from the Home (file remains for reuse).

| File | Before | M6 step 2 result | Why |
|---|---|---|---|
| `lib/knowledge/stage-model.ts` | boundary, unused by UI | **reshape** (one branch) | review audience with zero withheld edges now reuses the projection's notice instead of counting `0 candidate connections`; the public branch is unchanged |
| `tests/knowledge/stage-model.test.mjs` | 12 tests | **reshape** (13 tests) | adds the zero-withheld fallback guard |
| `components/knowledge/hansa-landing.tsx` | built `items`/`atlas`/`notice` | **reshape** | builds the model once; passes `model`, `items`, `atlas` and the feed notice |
| `components/knowledge/insight-stage.tsx` | five gates + footer | **reshape** | three scenes; selection, `?insight=`, disclosures and dealer zones retained; gates, rail and scroll-progress removed |
| `components/knowledge/stage-timeline.tsx` | — | **new** | scene 1: calendar strip, peek, dealer disclosure, keyboard |
| `components/knowledge/stage-knowledge.tsx` | — | **new** | scene 2: edition unfolded, instrument, graph/discovery panel |
| `components/knowledge/stage-closing.tsx` | — | **new** | scene 3: destinations, review status, About, live region |
| `components/knowledge/stage-today.tsx` | date hero + dealer takeover | **retire** from Home | the timeline's date row replaces it |
| `components/knowledge/insight-rail.tsx` | editions rail in gate 1 | **retire** from Home | models editions, not days; untouched for reuse |
| `components/knowledge/knowledge-dealer.tsx` | dealer takeover | **keep**, mounted in the timeline scene | source-backed cards, tested return contract |
| `components/knowledge/insight-scene.tsx` | reasoning disclosure + experiment | **keep**, now under `#edition` | no copy change, no new claims |
| `components/knowledge/knowledge-instrument.tsx` | concept instrument | **keep**, per selected edition | deterministic local state |
| `components/knowledge/insight-archive.tsx` | `#archive` archive | **keep** | deep links and per-edition permalinks |
| `components/knowledge/stage-learn-gate.tsx` | full-screen Learn gate | **retire** from Home; `/learn` destination | no competing gate |
| `components/knowledge/stage-cert-gate.tsx` | full-screen Certify gate | **retire** from Home; `/practice/catalogue` destination | no competing gate |
| `components/knowledge/stage-about.tsx` | About strip | **keep**, compact in the closing scene | identity/context |
| `components/knowledge/atlas-peek-stage.tsx` | Atlas peek | **keep**, only when `graph.state === "ready"` | zero-edge state must not show a broken canvas |
| `components/knowledge/observatory.css`, `stage-editorial.css` | gate canvas, rise, dealer | **reshape**: scene vocabulary appended; gate rules retained | the Home no longer mounts the gates |
| `components/site-header.tsx` | `isLanding ? LANDING_NAV : NAV` | **keep** | navigation must not duplicate the timeline |
| `app/globals.css` | light relation tokens below 3:1 | **reshape**: `--chart-3` / `--chart-4` darkened in the same hue families | measured 2.19:1 / 2.97:1 → 3.30:1 / 4.11:1 on `#FCFCFC` |
| `app/page.tsx`, `app/prototype-c/page.tsx` | metadata + alias | **keep** | one implementation, two addresses |

No file under `content/` was edited. No question, answer, progress key or route
was renamed.

## 4. Guards that were re-baselined (not silently relaxed)

| Guard | What M6 broke | Actual change and result |
|---|---|---|
| `tests/knowledge/canonical-home.test.mjs` | gate markers, `#archive` in the stage, single-gate claims | asserts the three scenes in order, the retired gates *absent from the Home* while their files remain, one dealer behind a disclosure, one `buildStageModel` call, selection-is-not-activation, the archive hand-off, and every pre-existing single-landing/alias/no-storage invariant. 49/49 knowledge tests pass. |
| `scripts/qa-canonical-home.mjs` | five gate markers, the takeover CTA, the rail's `Older edition` control, `aria-current` on a rail button | new marker set and a real browser run of the three scenes: timeline entry in the first viewport, no dealer at load, dealer via "Open the edition", peek follows the day, keyboard walk, deep links, alias, mobile, reduced motion, no-JS, axe. 49/49 checks pass, axe 0 findings. |
| `scripts/verify-canonical-home.mjs` | Learn/Certificate markers | asserts "Choose a moment.", "The knowledge scene", "The way onward" and adds "The Learn Gate" / "Certificate preparation" to the retired markers. 34/34 checks pass. |
| `scripts/final-review-negative.mjs` | rejects an unaudited edit to `insight-stage.tsx` | still rejects; the M6 layer records the authorized bytes. 17/17 corruption cases rejected. |
| `scripts/seal-canonical-home.mjs` | — | **not run.** It writes the 28 Oct canonical-home layer; the M6 layer is the successor and `canonicalHomeReceipt` already reads through it. Re-running the sealer would rewrite a historical layer, which is the one thing the chain forbids. |
| `intelligent-atlas/tools/verify-prototype-journey.mjs` | 21 journey checks against the prototype, not the app | NOT RUN for the app; a new app journey harness is M7 work |

Rule applied: every changed pinned file got an entry in
`docs/knowledge-stage-m6-20261104/INTEGRATION_MANIFEST.json` with
`previousSha256` equal to the hash the older layer (or the earlier hop in this
layer) recorded. No expected hash was edited to make a failure disappear.

## 5. Receipt-layer cost (measured, not estimated)

The M0 manifest was not edited. The M6 layer is append-only and now has two
steps:

| Layer | File | Contents |
|---|---|---|
| M0 | `docs/knowledge-stage-m0-20261103/INTEGRATION_MANIFEST.json` | 425 changed pins, 233 additions, 7 removals — untouched |
| M6 step 1 | `docs/knowledge-stage-m6-20261104/INTEGRATION_MANIFEST.json` | 3 changed pins, 3 additions — boundary, baseline, two stale guards |
| M6 step 2 | same file | +7 changed pins, +3 additions — the visible swap, the scene components, the re-baselined guards, the two relation tokens |

`scripts/knowledge-stage-receipt.mjs` reads M6 above M0 and composes
`expected()` as `m6After(m0Expected(p, h))`. With two steps in one layer,
`m6After` now follows pins hop by hop (7 changed paths, three of them advancing
a record made in step 1),
verifies that every recorded predecessor was itself recorded, and only demands
disk equality from the terminal hop. `scripts/final-review-negative.mjs` already
copied the M6 manifest and its paths; no further change was needed there.

## 6. Contracts that survived the swap

| Contract | Evidence after the swap |
|---|---|
| `/` and `/prototype-c/` render one implementation | `canonical-home.test.mjs`; QA R3b on the alias |
| `?insight=<id>` deep link and Back/Forward | QA URL01–05, URL05b; the same restore effect |
| `#today` anchor | `id="today"` on the timeline scene |
| `#edition` / `#closing` anchors | scene ids; the timeline links to `#edition`, the closing scene to `#archive` |
| `#archive` anchor and permalinks | `insight-archive.tsx`; QA ARCHIVE01–02, H026 |
| Header marks Today on `/` | QA NAV01, NAV01c; `LANDING_NAV` unchanged |
| Home writes no storage | QA H064/STATE; source scan in `canonical-home.test.mjs` |
| Content byte identity | `sql-vault` test via the receipt chain: PASS |
| Public payload has no candidates | `stage-model` test: the model carries counts, never claims or edges |
| Static export only | build + postbuild; 435 exported routes answered 200 |

## 7. Evidence and what is still open

| Check | Result |
|---|---|
| `npm run test:all` | PASS — 257/257 (62/18/35/68/49/25) |
| `npm run lint` | PASS — 0 errors, 49 warnings (none in the new files) |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS — static export, 434 segment aliases |
| `node scripts/verify-agent-reference.mjs` | PASS — 13 active hashes |
| `node scripts/verify-knowledge-atlas.mjs` | PASS — 16 payload, 33 integration, 23 links |
| `node scripts/verify-easyui-integration.mjs` | PASS — 41 owned, 1,169 prior-file contracts |
| `node scripts/final-review-negative.mjs` | PASS — 17/17 corruption cases rejected |
| `node scripts/verify-canonical-home.mjs` | PASS — 34/34 |
| `node scripts/qa-canonical-home.mjs` | PASS — 49/49, axe 0 findings; screenshots in `docs/canonical-home/evidence/` |
| Owner visual acceptance (M3) | **NOT RUN / OPEN** — the owner approved the direction, not a pixel-level review |
| App journey harness against the real interactions, beyond the canonical-home QA | M7 work; NOT RUN |
| Performance measurement against `2026-11-04-pre-m6` | NOT RUN |
| Deployment | BLOCKED (owner-only) and not requested |

Engineering QA is not an accessibility audit: axe covers automated rules only,
and no screen-reader or human visual pass is recorded. The `--chart-3` /
`--chart-4` ratios are computed from token values, not sampled from a rendered
page.

## 8. Ordered next step

1. Owner visual acceptance of the three-scene Home (M3), including the light
   theme and the narrowed relation tokens. Nothing below replaces that.
2. Measure against `2026-11-04-pre-m6`: first load, timeline entry, edition
   switch, dealer open/close — report deltas without a performance claim.
3. M7: an app journey harness for the Home beyond `qa-canonical-home.mjs`.
4. Only then consider publishing editions (a content decision, not a UI one).
