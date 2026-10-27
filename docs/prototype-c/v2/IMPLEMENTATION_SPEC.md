# Implementation spec — Hybrid Knowledge Stage

Everything here describes code that exists at `components/knowledge/*`,
`lib/knowledge/*`, `lib/atlas/peek-layout.ts`, `lib/touch.ts`,
`lib/hooks/use-hover-capable.ts`, `app/prototype-c/page.tsx` and the stage block at
`app/globals.css` §"Knowledge stage". Values are the shipped ones, not proposals.

## 1. Component tree

```
app/prototype-c/page.tsx           (server component; static export)
└─ PrototypeC                      (mode switch: stage | legacy)
   └─ InsightStage                 (client; owns selection, scene state, deck state)
      ├─ KnowledgeAtmosphere       (P0 decorative wash + dot grid, aria-hidden)
      ├─ InsightRail               (controlled edition rail)
      ├─ InsightScene              (P3 reading plane + reveal + evidence)
      │  └─ InsightExperiment      (derived "try the decision" model)
      ├─ KnowledgeDealer           (deck / hand / reader / collect)
      ├─ AtlasPeekStage            (P4 contextual continuation)
      └─ InsightArchive            (discovery: search, topic, disclosure, permalinks)
```

`app/prototype-c/page.tsx` reads the canonical data on the server
(`insights.json` + the Atlas projection) and passes plain objects down. No browser API
runs at module scope; every observer, pointer handler and animation starts inside a
client effect.

## 2. State ownership

| State | Owner | Persistence | Must not become |
|---|---|---|---|
| Selected edition | `InsightStage.selectedId` + `?insight=<id>` | URL, Back/Forward | A second identity system |
| Scene `{revealed, evidenceOpen}` | `InsightStage.scenes[editionId]` | memory, reset on edition change | Progress or a score |
| Experiment answer | `InsightStage.experiments[editionId]` | memory, ungraded | Exam answer or saved attempt |
| Card zones | `InsightStage.zones[cardId]` | memory | A second content bank |
| Open reader | `InsightStage.activeCardId` | memory | Nested links inside the card button |
| Rail geometry, drag, glide | `InsightRail` | transient motion values | Truth (it only proposes an id) |
| Hand geometry, hover, front card | `KnowledgeDealer` | transient | Card identity |
| Archive query/topic | `InsightArchive` | memory | Public search authority |

Rules enforced in code:

- Selecting an edition resets that edition's scene to closed (`choose()` deletes its
  entry), so explanation C can never appear beside scenario B.
- The rail only calls `onValueChange(id)` after its own glide settles; rapid input keeps
  the latest id because `glideTo` stops the previous animation first.
- Deal/collect write zones immediately; movement never determines truth. A card whose
  zone changed while the tray was resized lands in the recomputed slot.
- Nothing in the stage writes to `localStorage` — reading the page mutates no progress.

## 3. URL contract

- `?insight=<canonical id>` selects an edition; unknown ids fall back to the latest
  edition and announce "That edition is unavailable."
- `choose()` writes the new id with `history.pushState`, so Back restores the previous
  edition, including from the archive's "Open this edition".
- `?mode=legacy` renders the rejected V1 layout from `knowledge-stage.tsx`. The page and
  the archive permalinks keep this escape hatch intact.
- No other query key is added by the stage.

## 4. Motion tokens (`lib/knowledge/motion.ts`)

| Token | Value | Use |
|---|---|---|
| `STAGE_FEEDBACK` | 120 ms, `EASE_OUT` | press / border response |
| `STAGE_LABEL` | 180 ms, `EASE_OUT` | label and metadata swaps |
| `STAGE_REVEAL` | 320 ms, `EASE_OUT` | scenario → explanation shell |
| `STAGE_INSPECT` | 380 ms, `EASE_OUT` | card surface → reader |
| `STAGE_FLIGHT` | spring, visualDuration 0.50, bounce 0.16 | deck ↔ hand arc |
| `STAGE_HOP` | spring, visualDuration 0.34, bounce 0.18 | slot changes inside the hand |
| `STAGE_RAIL_GLIDE` | stiffness 120, damping 24, mass 1 | rail release, from the upstream timeline |
| `REDUCED_TRANSITION` | 100 ms opacity | reduced-motion state change |

`lib/ease.ts` is unchanged and still supplies the shared curves. No `transition: all`,
no ambient loop, no perpetual pulse; at rest the stage is still.

## 5. Geometry

**Rail** (`InsightRail`, `itemWidth` 208, `height` 104):
`cardWidth = min(208, stageWidth × 0.32)` (0.58 below 640, 0.74 below 480);
`gap = clamp(cardWidth × 0.26, 22, 54)`; `step = cardWidth × 0.92 + gap`;
neighbour scale 0.92 with a 50 % veil; 3 gap ticks; drag threshold 4 px, rubber band
0.3, flick momentum 0.3 capped at two pointer samples.

**Dealer** (`KnowledgeDealer`, measured tray):
`cardWidth = clamp(min(trayWidth, 420) × 0.36, 100, 150)` in fan mode and
`clamp(min(trayWidth, 420) × 0.62, 120, 168)` in the narrow slot;
`cardHeight = cardWidth × 1.32`; `EDGE` 12; hover lift 16; neighbour push 12;
`step = min(cardWidth × 0.78, room / (count − 1))`; fan tilt ≤ 9°, drop ≤ 16 px.
The face reserves `cardWidth − step + 8` on its trailing edge (`faceInset`), so a
neighbouring card never cuts a word. Tray height 236 px mobile / 300 px from `sm`.

**Atlas peek** (`lib/atlas/peek-layout.ts`, unit-tested): 640 × 300 viewBox, centre
(320, 142), ellipse radii 236 × 96, at most four slots starting at the top and going
clockwise, edge control points bowed 26 px away from the core.

**Narrow hand** (tray < 300 px, i.e. 320 px viewport): one upright card at the tray
centre with two backing edges at ±10 px and ±3.2°, moved by explicit
"Previous card / Next card" controls and a "Card n of m" label. The edges are not
focusable; one accessible name per card still holds, and the card in front carries it.

## 6. Scene choreography (S2)

`scenario → revealed → evidenceOpen`, reversible. On reveal: the button responds
immediately, the scenario title and recap stay anchored, the answer plane opens beneath
with the takeaway first and the caveat 40 ms later, an accent rule marks the key
distinction, and an evidence tab appears at the plane's edge. "Back to the situation"
closes the explanation and leaves focus on the initiating control. Evidence opens an
attached inline panel that keeps the source id, locator, check date and truthful review
status ("technical review · human review pending").

`InsightExperiment` is a real derivation, not decoration: the selected radio changes the
verdict, the object rows and the figure state, computed in `lib/knowledge/models.ts`
from the option values. Initial state renders on first paint; no answer is graded,
stored or scored.

## 7. Access contracts

- One `<h1>` per page; section headings are `h2`/`h3` in document order.
- Hand cards are buttons with an accessible name (`"Principle card: …"`), `aria-expanded`
  for the open reader, and no nested interactive content; the reader holds the links.
- Reader is a focusable `region[aria-label="Selected card"]`; opening moves focus into
  it, closing returns focus to the card. Escape closes from inside the region.
- The rail exposes a `group[aria-label="Insight editions"]`, one tab stop, arrow-key
  movement, and one live announcement after settling.
- Status text uses `role="status" aria-live="polite"`; decorative ticks, veils, cables and
  the atmosphere are `aria-hidden`.
- Minimum 44 px touch targets on every control; `TOUCH_GESTURE_CLASS` + pointer capture
  keep vertical page scroll available during a rail drag.
- Focus rings are drawn above shadows (`focus-visible` outline/ring, offset).
- Reduced motion: `useReducedMotion()` switches flight/hop scale/rotation to immediate
  placement (100 ms opacity at most); static tilt and depth remain.
- No-JS: the static export contains the scenario, the edition list with permalinks, the
  archive with native `<details>` reasoning/source and all destination links.

## 8. Responsive contract

| Width | Composition |
|---|---|
| ≥ 1024 | 7/5 stage split, rail with static arrows either side, 3-card fan, trailer plane behind the reading surface |
| 768–1023 | rail full width; scenario above; dealer in a 3-card tray below; reader inline full width |
| 390–767 | single column; compact rail with overlaid arrows; 3-card fan at 390 (titles readable, preview hidden below 128 px card width) |
| ≤ 320 | one upright card in the tray + backing edges + card stepper; deck, collect and reader unchanged |

No horizontal overflow at 320/390/768/1024/1440 (measured in QA). Short desktop heights
scroll normally; no fixed viewport trap.

## 9. What the module must never do

- `InsightRail`: publish content, invent dates, write progress.
- `InsightScene`: grade, score, or persist an answer.
- `KnowledgeDealer`: read a second content bank, migrate progress, nest links in cards.
- `AtlasPeekStage`: create an edge, promote a draft relation, imply a learner position.
- `InsightArchive`: claim publication, or re-implement site search instead of linking to
  `/search/`.
