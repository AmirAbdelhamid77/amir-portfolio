# 08 — Production-target wireframes and composition constraints

These are layout instructions, **not complete visual mocks or coded HTML**. The agent must create actual visual frames and prove depth/motion in its independently reviewed prototype.

## Desktop first viewport — C1 Editorial Observatory (proposed)

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│ [HANSA symbol]   Today    Learn    Practice    Atlas    About      [Search]     │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   [DATE  / TODAY'S DISCOVERY]        ╭─────────────────────────────────────╮   │
│                                     │ Atmospheric scientific instrument    │   │
│   QUESTION / THOUGHT                 │      3D-like focal form in space     │   │
│   Big, bold, intentionally           │  DYNAMIC 2D DATA TRUTH INSIDE         │   │
│   asymmetric type                    │  edge light / measured marks          │   │
│                                     │       [input control & output]        │   │
│   Scenario 2–3 lines                 ╰─────────────────────────────────────╯   │
│   [Try it] [Reveal / Skip]                                                     │
│                                                                                │
│             ━━━◌───── ◉ TODAY ─────◌─────◌─────   [Archive]                  │
│                  DIMENSIONAL, DRAGGABLE DATE RIBBON                            │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘

NEXT STAGE: overlapping fanned knowledge objects  ┌──┐
                                          ┌──┐    │  └──┐ [Open/Flip/Inspect]
                                    ┌──┐  │  └──┐ │     │
                                    └──┘  └─────┘ └─────┘

NEXT STAGE: 3–5 verified connected Atlas concepts (contextual preview)
            Selected concept + typed relation + evidence + accessible list

FINAL: [Continue in Learn]   [Test in Practice]  ... modest footer to About/Work
```

**The drawing's simple outline does not authorize flat design.** The physical perception must come from meaningful surface overlap, changing depth and material response, a selected Timeline event rising toward the viewer and a card flying from the deck. The data comparison itself remains exact 2D.

### Default density at desktop

- H1 roughly 2–4 lines at the available 5–6 column width (no text smaller than usable legibility).
- One clear scenario and one obvious action, not 6 cards before user understands the headline.
- Data instrument contains one significant exact interactive model; abstract environmental lines are subordinate.
- Timeline shows active day and enough neighbors to signal chronology, but user can access full archive.
- The first 3 seconds are explainable even if JavaScript is delayed.

## Mobile 390×844 — dedicated staged composition

```text
┌───────────────────────────────┐
│ [H.]           [Search] [Menu]│
├───────────────────────────────┤
│ TODAY / 28 OCT                 │
│ One surprising question       │
│ explained clearly in a       │
│ readable editorial block.    │
│                               │
│ ┌───────────────────────────┐ │
│ │ Interactive data view     │ │
│ │ exact values, control     │ │
│ └───────────────────────────┘ │
│ [Try it / Reveal]             │
│                               │
│  ← yesterday [TODAY] archive →│
├───────────────────────────────┤
│ LAYERED PHYSICAL CARD STACK   │
│ [Why] [Experiment] [Evidence] │
│ ↳ opened card: reading sheet  │
├───────────────────────────────┤
│ Related concept: ...          │
│ [Verified typed relations]    │
│ [Open Atlas]                  │
├───────────────────────────────┤
│ [Learn]              [Practice]│
└───────────────────────────────┘
```

Do not force a full 3D graph on a phone or let decorations defer the first educational action. Card sheets become wider than original card; manage focus and scrolling. Scene can downshift from A/B to C/D renderer tiers with no loss of meaning.

## Midpoints and other states

**768 tablet:** two-column layout only if chart labels and card width remain readable; otherwise stage vertically, retain Timeline center focus. Prevent horizontal doc scroll.

**320 mobile:** headlines with dynamic wrapping, no persistent oversized header, accessible discrete timeline controls, visible card corners but enlarged reading modal, list-first Atlas.

**Dark / Light:** Hero may be dark in both themes as branded feature if text contrast is assured; surrounding site follows system/user preference and offers content-reading contrast. No forced dark-only site rewrite.

**RTL Arabic:** Keep dates/numerals scoped by direction; reverse reading hierarchy where needed, but preserve chronological semantics and logical keyboard order; don't mirror illustrative chart axes incorrectly.

## Section boundaries are experiences, not card stacks

- Hero > Dealer via anchored visual motif or object continuity, not arbitrary fade-in on scroll.
- Dealer > Atlas via the highlighted concept from selected card; this transition is contextual and interruptible.
- Atlas > Learn/Practice via one explicit next action and standard navigation.
- Every section has a distinct composition/material/pacing, avoiding dark glowing graph repetition.

## Story states to show before approval

Make six screenshots for both desktop and mobile: settled hero, timeline selected, scenario after input, revealed insight, opened card, Atlas focus/fallback. Then add mid-transition video captures, because screenshots alone cannot validate physics.
