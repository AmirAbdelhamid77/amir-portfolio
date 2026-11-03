# Hansa Knowledge Stage V3.1 — nine-frame storyboard

Captured 2026-11-01 from the isolated review prototype at
`intelligent-atlas/prototype/index.html` and the public projection at
`intelligent-atlas/public/index.html`, using headless Microsoft Edge
156.0.4314.58 through the repo-stored harness
`intelligent-atlas/tools/capture-storyboard.mjs` at 1440 × 960.

This is a **technical review artifact**. Every frame except
`frame-09b-public-sparse.png` renders *candidate* semantics that have not passed
human publication review. Nothing here is a published claim, and a screenshot is
not an accessibility or scientific audit.

- Receipt: `intelligent-atlas/evidence/v31/storyboard-capture-v31.json` (22/22 PASS)
- Frame metadata: `intelligent-atlas/storyboard/v31/frames.json`
- Contact sheet: [`index.html`](index.html)

## Data classes

| Class | Meaning in these frames |
| --- | --- |
| Candidate review | Unpublished candidate concepts, assertions, readings and decks. Visible only in the review prototype. |
| Local browser state | Pocket, thread and self-report values stored in this browser profile only. Not synced, not published. |
| Public projection | The fail-closed public artifact. Zero published records; structure and gate conditions only. |

## The nine frames

### 1. Timeline entry — `frame-01-timeline.png`

Full-viewport editorial entry. The latest recorded edition (26 Oct 2026) is
selected; today (1 Nov 2026) is present and visibly marked as having no edition,
so the zero-card path is reachable from the first screen. The rail shows 3
editions and 12 quiet days out of 15 days.

Proves: date-led entry, honest quiet-day state, edition count from resolved data.
Does not prove: that the edition is *good*, or that a learner will choose it.

### 2. Dealer open — `frame-02-dealer.png`

The 26 Oct deck opens with **one** resolved card, not a facet estimate. The hand
count, the rail highlight and the reader all agree. The card states its kind,
capabilities and review state.

Proves: the Dealer contract renders resolved decks; a one-card deck is a valid
deck; review state is visible on the card itself.
Does not prove: deck quality or pedagogical sequencing.

### 3. Scroll handoff at midpoint — `frame-03-handoff.png`

The scroll-linked handoff at 50%: the edition token is shrinking and moving into
the field while the left copy keeps the active information readable. Token
opacity is 0.7 at this point, so the date and review state remain legible.

Proves: the handoff is driven by scroll progress, not a timed animation.
Does not prove: the interpolation between 0%, 50% and 100% — see
`evidence/v31/motion/handoff-000.png`, `handoff-050.png`, `handoff-100.png` and
the reduced-motion equivalent.

### 4. Understand focus — `frame-04-understand.png`

Confidence interval selected. The field dims to the concept and its recorded
neighbourhood, and the inspector lists explicit prior/next branches with the
claim behind each one. The inspector is the authored object; the field is
context, not a competing canvas.

Proves: intent-led inspection, honest neighbourhood, branch claims visible
before navigation.
Does not prove: that every edge in the field is scientifically correct.

### 5. Why connected — `frame-05-why-connected.png`

Scrolled to the evidence block: parent context, the reading, a verbatim quote in
its original direction (`dir="auto"`, so the Arabic source reads correctly), the
unit id, the decision and the essential meaning.

Proves: a connection can be traced to a unit and a quote.
Does not prove: that the quote supports the claim — that is human review.

### 6. Comparison Desk — `frame-06-comparison.png`

OneLake shortcut ↔ Copy job. The board shows the changed condition, the shared
prerequisites and the reason the contrast is claimed, with a selector for the
other board that includes the selected concept.

Proves: comparison is a first-class intent with its own surface and conditions.
Does not prove: completeness — only 27 of 132 concepts have a board.

### 7. Goal route — `frame-07-goal-route.png`

"Decide whether an observed difference is real or sampling noise": five steps in
dependency order, each with a reason, a domain badge, conditions where recorded,
and a local self-report toggle. Three alternative goals are listed, and the gap
count is shown rather than hidden.

Proves: topological ordering, per-step reasons, visible alternatives and gaps.
Does not prove: that the route is the shortest possible — it is not meant to be.

### 8. Pocket and thread — `frame-08-pocket-thread.png`

A saved concept in the Pocket drawer, the visited-concept thread underneath, and
the live inspector still readable behind the drawer.

Proves: local capture and a visible learning thread.
Does not prove: persistence across devices — this is browser-local only.

### 8b. Return from a resource route — `frame-08b-resource-return.png`

The prototype reports the application route and its source locator instead of
faking navigation, then restores the selected concept.

Proves: no simulated navigation, context restored after a resource attempt.
Does not prove: that the application route resolves in the real app.

### 9. Closing ledger — `frame-09-closing.png`

One remembered idea, an eight-row coverage ledger and a concrete way back to the
edition.

Proves: the stage ends with a decision and a return path, not an endless graph.
Does not prove: retention.

### 9b. Public sparse-state alternative — `frame-09b-public-sparse.png`

The separate public artifact: same editorial language, zero published concepts,
assertions and insights, four unmet gate conditions, no review payload loaded.

Proves: physical public/review separation with an honest empty semantic layer.
Does not prove: public usefulness — there is nothing published to use yet.

## Six keyframes (light / dark)

| # | Scene | Light | Dark |
| --- | --- | --- | --- |
| 01 | Timeline | `evidence/v31/keyframe-01-timeline-light.png` | `evidence/v31/keyframe-04-timeline-dark.png` |
| 02 | Dealer | `evidence/v31/keyframe-02-dealer-light.png` | `evidence/v31/keyframe-05-dealer-dark.png` |
| 03 | Knowledge field | `evidence/v31/keyframe-03-field-light.png` | `evidence/v31/keyframe-06-field-dark.png` |

Both presets use the same token set; there is no second theme system. The empty
hand, About and closing states are captured as details:
`state-empty-hand-light.png`, `state-empty-hand-dark.png`, `detail-about-dark.png`,
`detail-closing-light.png`, `detail-closing-dark.png`, `detail-public-light.png`,
`detail-public-dark.png`.

## Motion evidence

All sequences are in `evidence/v31/motion/`.

| Motion | Kind | Frames | What it shows |
| --- | --- | --- | --- |
| Handoff scrub | frame sequence | `handoff-000`, `handoff-050`, `handoff-100` | Scroll progress 0 / 0.5 / 1 with computed token transform and text opacity 1 / 0.7 / 0 |
| Reduced motion | static equivalent | `reduced-motion-handoff` | No sticky scrub, no orbit, token text immediately visible, handoff height 540 < viewport |
| Timeline → Dealer → graph → resource → return | frame sequence | `seq-01` … `seq-05` | Locate opens the field; a resource route reports itself; the timeline stays one scroll away |
| Understand → Compare → cancel | frame sequence | `seq-06` … `seq-08` | Compare is reversible without losing the selected concept |
| Rapid interrupted expansion | frame sequence | `seq-09`, `seq-10` | Three selections settle on the last request; no stale panel or console error |
| Keyboard modal escape | frame sequence | `seq-11`, `seq-12` | Escape closes the Dealer, releases scroll lock, returns focus to the opener |

The handoff stills are three sampled points, not proof of smooth interpolation.
The reduced-motion capture is the honest static alternative required by the
motion policy.

## What is deliberately absent

- No production build, bundler, framework or paid dependency.
- No `/` or `/prototype-c/` integration; scope stayed at M0–M5.
- No deployment, publication, learner data or third-party transfer.
- No second global theme system: light and dark are presets over one token set.

## Reproduce

```powershell
node intelligent-atlas/tools/capture-storyboard.mjs
node intelligent-atlas/tools/qa-stage.mjs --capture
node intelligent-atlas/tools/qa-responsive.mjs
node intelligent-atlas/tools/verify-public-isolation.mjs
```

Each command rewrites its receipt under `intelligent-atlas/analysis/` or
`intelligent-atlas/evidence/v31/`.
