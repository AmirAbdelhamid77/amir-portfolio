# Validation — Prototype C V2

Run on 2026-10-27 against the static export served from `out/` on `http://127.0.0.1:4210`.
The command table in §1 was re-run after the final document pass: types, whole-project
lint, all six test suites and the production build all pass on the files as they now
stand on disk.
Browser: locally installed Microsoft Edge via `playwright-core` (headless). Node 22.
Machine-readable results: `qa-browser.json` (regenerated 2026-10-27T19:38Z against the
final static export, i.e. after every source edit in this change set — 38/38 again).
The three recordings were captured from the same final build: `rec-01` and `rec-02`
after the last component edit, `rec-03` re-recorded because the earlier take predated
the final dealer fixes.

## 1. Commands and results

| Check | Command | Result |
|---|---|---|
| Types | `npx tsc --noEmit` | **PASS** (no output) |
| Lint (changed surface) | `npx eslint components/knowledge lib/knowledge lib/atlas/peek-layout.ts lib/touch.ts lib/hooks/use-hover-capable.ts app/prototype-c` | **PASS** |
| Lint (whole project) | `npm run lint` | **PASS** — after adding `.scratch/**` to the existing `globalIgnores` in `eslint.config.mjs`. `.scratch/` holds verbatim BeUI registry reference copies (timeline, card-dealer); the React Compiler rules flag upstream ref handling there, the same case already documented in that config for `components/charts/**`, `components/motion/**` and `components/agents/**`. No project source is excluded by it. |
| Tests (all suites) | `npm run test:all` | **PASS** 171/171 (62 + 18 + 34 + 20 + 12 + 25) |
| Knowledge models | `npm run test:knowledge` | **PASS** 12/12 |
| Atlas (incl. peek layout) | `npm run test:atlas` | **PASS** 25/25 |
| Production build | `npm run build` | **PASS** static export + 118 segment aliases |
| Browser QA | `node scripts/qa-prototype-c-v2.mjs --base http://127.0.0.1:4210` (static `out/` served by `node scripts/serve-out.mjs 4210`) | **PASS 38/38**, re-run 19:38Z on the final build |

The two new test files added by this change set are `tests/knowledge/models.test.mjs`
(verdict derivation, card derivation, truncation, focus-safe labels) and
`tests/atlas/peek-layout.test.mjs` (deterministic placement, bounds, edge control point).

## 2. Browser checks (38)

Frame and composition: `still-frame-no-overflow`, `still-frame-single-h1`,
`desktop-no-horizontal-overflow`, `tablet-no-overflow`, `mobile-390-no-overflow`,
`mobile-320-no-overflow`.

Dealer: `deal-three`, `hand-has-three-cards`, `inspect-card-0/1/2`,
`reader-receives-focus`, `escape-returns-to-hand`, `collect-resets-hand`,
`resize-during-deal-reconciles` (deal at 1440, resize to 1024 mid-flight, 3 cards inside
the recomputed tray, no overflow), `reduced-motion-places-immediately`.

Scene: `reveal-opens-reasoning`, `evidence-opens-source`, `reveal-reversible`.

Rail and routing: `rail-selects-and-pairs-scene` (edition id, scenario title, closed
explanation and experiment question all match the selected edition),
`rail-keyboard-arrow`, `back-restores-edition`, `rapid-selection-latest-wins`.

Atlas honesty: `atlas-empty-state-is-honest` — the peek region contains the
"Reviewed connections are not published yet" notice, zero wide edge paths, zero graph
buttons, zero `aria-pressed` nodes.

Responsive: `mobile-390-tray-in-viewport`, `mobile-390-cards-in-tray` (3 cards inside the
tray), `mobile-320-tray-in-viewport`, `mobile-320-single-slot` (one upright card, others
non-focusable edges), `mobile-320-card-stepper` ("Next card" changes the front card).

Accessibility: axe (WCAG 2.0/2.1 A+AA, 2.2 AA) run in four contexts — `desktop-axe`,
`light-axe`, `mobile-390-axe`, `mobile-320-axe` — **0 violations each**.
`desktop-no-console-errors`, `light-no-console-errors`, `mobile-390-no-console-errors`,
`mobile-320-no-console-errors`: **0 errors each**.

Reduced motion: `reduced-motion-keeps-static-depth` — the two supporting planes are still
offset behind the reading surface with motion reduced.

## 3. Screenshots (`evidence/`)

| File | Shows |
|---|---|
| `10-desktop-still-dark.png` | 1440 dark still frame: rail, reading plane, supporting planes, deck, empty hand area |
| `11-desktop-hand-dealt.png` | three cards fanned, distinct faces, deck empty |
| `12-desktop-reader-open.png` | reader open below the hand, other cards still recognisable |
| `13-desktop-reveal-evidence.png` | reasoning plane + attached evidence panel |
| `14-desktop-edition-two.png` | second edition selected and paired with its own scene |
| `15-desktop-light.png` | light theme, same stage |
| `16-reduced-motion-still.png` | reduced motion, hand dealt, no travel |
| `17-mobile-390.png`, `18-mobile-390-hand.png` | 390 still and dealt hand |
| `17-mobile-320.png`, `18-mobile-320-hand.png` | 320 still and the single-slot hand with stepper |
| `19-tablet-768.png` | 768 composition |
| `21-no-js-1440.png` | JavaScript disabled: scenario, rail, deck and destinations render |
| `22-atlas-empty-1440.png` | honest Atlas bridge |
| `00-before-*` | the rejected V1 renderer, kept for comparison |

## 4. Recordings

| File | Sequence |
|---|---|
| `rec-01-rail-selection.webm` | 26 OCT → 25 OCT → 24 OCT by pointer; stage stays in place, scene re-pairs |
| `rec-02-reveal-evidence.webm` | Reveal reasoning → Evidence → Back to the situation |
| `rec-03-deal-inspect-collect.webm` | Deal three → open the caveat card → back to hand → collect all |

## 5. Visual gates (spec §11)

| Gate | Status | Evidence |
|---|---|---|
| V1 still-frame depth | **PASS (self-assessed)** | `10`, `15`, `16`: active plane, two supporting planes, deck object and hand edges are distinguishable with no motion |
| V2 coherent composition | **PASS (self-assessed)** | Rail, reading plane and tray share the stage and the atmosphere; not three independent boxes |
| V3 actual dealing | **PASS** | `rec-03` plus `deal-three` / `inspect-card-*` / `collect-resets-hand`; card ids persist through deck → hand → reader |
| V4 meaningful reveal | **PASS** | `rec-02`, `13`: title anchored, explanation opens as a second plane, evidence attached |
| V5 graceful interruption | **PASS** | `rapid-selection-latest-wins`, `back-restores-edition`, `resize-during-deal-reconciles` |
| V6 mobile character | **PASS** | 390 keeps fan + depth (`18-mobile-390-hand`); 320 uses the specified single slot with a stepper (`18-mobile-320-hand`) |
| V7 honest Atlas | **PASS** | `atlas-empty-state-is-honest`, `22-atlas-empty-1440` |
| V8 no motion debt | **PASS** | No ambient loop in code; stills captured after idle; controls respond on press |
| V9 equivalent access | **PARTIAL** | Reduced motion, keyboard, list/archive and no-JS verified; screen-reader and 200%/400% zoom **NOT RUN** |
| V10 owner visual review | **BLOCKED** | Requires the owner. Nothing here counts as acceptance |

## 6. Not run / not verified

- Screen readers (NVDA, JAWS, VoiceOver) and a real touch device.
- Firefox and Safari.
- 200 % and 400 % browser zoom; Windows high-contrast mode.
- RTL layout with real Arabic content.
- Load/perf budget under throttling; only static-export correctness was checked.
- The rejection of the earlier flat score table: no numeric aesthetic score is offered,
  and no claim of owner approval is made.
