# Final report — Prototype C V2

**Implemented. Tested locally. Not owner-reviewed. Not deployed.**
Baseline `496fddf998fd3c221a213d0d9b81070847c2c122`, branch
`feat/dp600-academy-ingestion-20261025`.

## 1. What was built

The rejected flat `/prototype-c/` has been replaced by a staged Hybrid Knowledge Stage
that keeps the earlier renderer reachable through `?mode=legacy`:

- **Condensed kinetic rail** adapted from the inspected beUI Timeline: measured geometry,
  one moving focus plate, neighbour scale/veil, gap ticks, drag with threshold and rubber
  band, flick projection, arrow-key selection, canonical `?insight=` identity with
  Back/Forward, no auto-advance.
- **Scenario plane** with a derivation, not decoration: the "try the decision" model is
  computed from the edition's own scenario/takeaway/caveat, then a controlled reveal
  opens the reasoning and an attached evidence panel under a title that never moves.
- **Card dealer** adapted from the inspected beUI Card Dealer: real deck → hand → reader
  → hand → deck movement, stable card ids, arc flight, stagger, flip, hover/focus lift,
  neighbour push, Escape, reduced-motion placement, and a single-slot 320px variant with
  explicit previous/next card controls.
- **Contextual Atlas peek** bound to the canonical published projection with a designed
  empty state; no invented edges, no fake learner position.
- **Archive** with search, topic filter, native `<details>` reasoning/source, permalinks
  and an explicit local-preview boundary line.

No package was added. No question bank, answer key, saved attempt, Atlas review record,
preservation snapshot or professional page was modified.

## 2. Evidence

`VALIDATION.md` holds the command results and the 38 browser checks; `qa-browser.json`
holds the machine report (38/38 pass, axe clean in four contexts, zero console errors).
Stills and three recordings live in `evidence/`.

## 3. Deliberate deviations from the design spec

| Spec | Implementation | Why |
|---|---|---|
| "Transient movement in animation values" | Cards and the rail animate with `motion` values inside their own frames | Same principle, simpler ownership; the stage still resolves truth from state, never from animation completion |
| Fan preview text on every card face | Preview hidden below a 128px card width; the face reserves the covered strip on wider cards | A three-card fan at 390px cannot show a paragraph without slicing words |
| "At 320px one-card active slot" | Implemented as one upright card + two non-focusable backing edges + a "Card n of m" stepper | The spec asks for visible deck and backing edges *and* select controls; the stepper is those controls |
| Rail at the ends | The third chip peeks in from the right, cut by the rail's edge next to the "Older edition" arrow | Accepts a partial chip as the rail's affordance that more editions exist; disclosed rather than hidden |
| Scene state durability | Scene, experiment and hand state are per-edition and memory-only | Nothing in the stage may write progress; a reload returns to the closed, undealt frame |

## 4. Tested and passing

- `npx tsc --noEmit`, `npm run lint` (whole project, exit 0 after excluding the
  verbatim `.scratch/` BeUI reference copies from lint — the same documented case as the
  other vendored registry sources), `npm run test:all` (171/171 across six suites,
  including `test:knowledge` 12/12 and `test:atlas` 25/25), `npm run build` (static
  export, `/prototype-c` prerendered).
- 38 browser checks: composition, dealing, reader focus, Escape, collect, resize during a
  deal, reveal/evidence/reset, rail pairing, keyboard arrow, Back, rapid selection,
  Atlas empty-state honesty, 390/320/768/1440 overflow, reduced motion, and axe in four
  contexts with zero violations.
- No-JS render verified by probe and screenshot (`21-no-js-1440.png`): scenario, rail,
  deck and destination links are present without JavaScript. This probe caught and fixed
  two content elements that had been painted at opacity 0 before hydration.

## 5. Not verified

- Screen readers, real touch hardware, Firefox, Safari.
- 200 % / 400 % zoom, high-contrast mode, RTL with Arabic content.
- Performance under throttling; only static-export correctness was measured.
- The Atlas with published relations — no public relation exists for this concept, so the
  populated neighbourhood is unexercised.

## 6. Blocked

- **V10 owner visual review.** Only the owner can accept the direction.
- **Publication.** Requires human review of the three editions plus an explicit deployment
  instruction; neither exists.

## 7. Known caveats

- The rail's outermost chip is partially clipped at 1440 (see deviations). It is a
  design choice, not an overflow bug; the page itself has no horizontal overflow.
- The narrow 320 hand relies on the stepper for selection; if a future card count grows
  past three, the stepper still works but the "Card n of m" label should be re-checked.
- `docs/prototype-c/v2/evidence/` still contains the V1 before-stills (`00-*`) for
  comparison. They are historical, not current output.

## 8. Next atomic task

Owner review of the three recordings and the desktop/mobile stills, then a decision on
the rail's edge behaviour (accept the peek or fit three chips). Content publication
review is a separate task and must not be inferred from a passing build.
