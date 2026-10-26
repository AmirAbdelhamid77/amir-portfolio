# Hansa Prototype C — Hybrid Knowledge Stage
## Visual and motion direction for the implementing agent

Status: **proposed corrected design direction, not implemented or owner-approved artwork**. The detailed assistant mockups from the original conversation were not retrievable; do not claim pixel fidelity to those unseen mockups. This specification makes the owner's current requirement for depth and a distinctive interactive experience concrete.

## 1. Art direction: a knowledge observatory

The page should feel like a carefully composed instrument for examining an idea. Build one primary stage with a foreground object, supporting planes, a temporal rail and a contextual continuation. The dramatic moment comes from a card travelling into the learner's attention and a scenario opening into an explanation. It does not come from dozens of looping effects.

**Required qualities:** dimensional, tactile, editorial, focused, responsive to the hand. **Avoid:** dashboard grids, a column of equal outlined containers, casino styling, shiny generic glass everywhere, a stock SaaS hero, invented progress/status, and text that jumps between distant positions.

### Material and depth system
| Plane | Role | Proposed desktop treatment | Rules |
|---|---|---|---|
| P0: atmosphere | Establish the stage behind information | One broad radial light wash, subtle static texture; strongest behind the active idea | Decorative only, aria-hidden, no perpetual particle animation, no WebGL requirement |
| P1: rail and labels | Orient date and task | Crisp type, ticks and hairline track, little elevation | Chronology stays truthful; preview dates labelled honestly |
| P2: supporting cards | Show a hand waiting for inspection | Two to three distinct card edges, 4–8° rotation, shorter shadows | No overlapping readable paragraphs; full content opens on inspection |
| P3: selected object | Carry current scenario or selected card | Stable surface, 20–28px radius, soft ambient shadow plus short contact shadow, narrow highlight edge | Highest contrast and sharpness; never blur the reading plane |
| P4: evidence/inspection | Reveal detail without losing the selected object's origin | Selected card expands into a reader or scenario unfolds to show explanation | Preserve identity/heading anchor; focus behavior follows semantics |

Depth must remain visible with all animation paused. Use occlusion, scale hierarchy, directional shadow, solid surfaces and edge highlights. Background blur alone is insufficient. CSS perspective is optional and bounded; essential content never relies on perspective.

### Palette and typography
Reuse Hansa's existing semantic tokens and Geist/Geist Mono. Light theme: quiet near-paper canvas, ink typography, cool blue/cyan focus glow kept behind the reading surface. Dark theme: charcoal/obsidian canvas, luminous edge accents, solid elevated reading planes. Add local stage aliases only if needed; do not replace global tokens. Keep text AA contrast independently of atmosphere.

The headline is an invitation, not a second full-screen hero: “One idea. A different way to see it.” Supporting line: “Think through a situation. Reveal the reasoning. Follow the connection.” These are proposed copy, not mandated final slogans.

Desktop headline 56–64px/1.04, mobile 36–42px/1.08; section title 28–34px; reading text 16–18px/1.7; labels 12–13px. Metadata must not become microscopic. Display dates/counts in tabular numerals. Keep one dominant display phrase and one dominant reading object per viewport.

## 2. Spatial composition and wireframes

Use a 1200px maximum stage width inside 24–48px desktop gutters. Header height approximately 64px with an optional quiet translucent backing only when scrolled. Clear fixed-header overlap. Keep Today / Learn / Practice / Atlas / About and Search; no Work/Experience homepage section, menu item or promotional card. Their real pages remain available elsewhere.

### Desktop: 1440 × 1000 reference viewport
```text
┌────────────────────────────────────────────────────────────────────────┐
│ HANSA                 Today  Learn  Practice  Atlas  About     Search  │
│                                                                        │
│          One idea. A different way to see it.                            │
│          Quiet supporting line — no giant blank hero spacer              │
│                                                                        │
│   Archive ←   · 24   │ · 25   │  [26 OCT / TODAY*]  │ · 27 unavailable    │
│               condensed time rail + ticks + moving focus indicator       │
│                         │                                              │
│       ╭─────────────────┴────────────────╮         DEAL AN IDEA          │
│      ╱ support plane / narrow edge      ╱│           ┌─────┐             │
│     ╭──────────────────────────────────╮ │         ╱ │deck │             │
│     │ TODAY'S SITUATION                │ │           └─────┘             │
│     │ A reference or a retained result?│ │      ╭────╮ ╭────╮ ╭────╮     │
│     │                                  │ │       \ A  \/ B  \/ C  /     │
│     │ Short scenario                   │╱        \\____\/____\/____/      │
│     │ [Think it through] [Reveal →]    │       real fanned card hand       │
│     ╰──────────────────────────────────╯       [Deal] [Collect]         │
│               active reading object                                    │
│                                                                        │
│       ╲ reasoning unfolds under same title / source drawer ╱             │
│                                                                        │
│        ATLAS PEEK: one selected concept and a bounded neighbourhood      │
│          ● ── labelled published relationship ── ●     [Explore Atlas]   │
│         text equivalent + evidence; otherwise honest pending state       │
│                                                                        │
│          Continue learning     Practice this area     Browse archive     │
└────────────────────────────────────────────────────────────────────────┘
```

`*Today` is allowed only when a real reviewed edition is scheduled for the current editorial day. Otherwise display “Latest edition · <date>”. Never populate future editions or connections to decorate the rail. The unavailable date in this diagram denotes a disabled slot concept, not a requirement to render one.

Target vertical allocation: navigation 64px, intro 120–160px, rail 88–112px, scenario/deck composition 380–460px, Atlas continuation begins within roughly the first 850–1000px depending on text and browser chrome. These are composition targets, not fixed heights that clip content. At short desktop heights let the page scroll normally.

Main stage: approximately 7 columns for the scenario and 5 for the discovery deck, with a shared atmospheric backdrop rather than separate equal-strength boxes. At rest, the scenario plane is visually larger; the deck is an invitation. Reserve a stable stage envelope for movement. Absolute positioning is permitted for decorative/back cards, not the main reading layout.

### Tablet: 768–1023px
Keep the rail full width. Main scenario precedes deck in reading/DOM order. The deck can sit below in a 280–340px tray with a three-card fan if measured geometry permits. Do not squeeze paragraphs into a desktop two-column stage. The active selected card opens inline, spanning the content width. Navigation uses the existing accessible compact menu.

### Mobile: 390 × 844 reference viewport
```text
┌────────────────────────────────┐
│ HANSA             Search Menu  │
│ One idea.                      │
│ A different way to see it.     │
│                                │
│  ‹   25  [26 OCT · LATEST]  ›  │ compact kinetic rail
│              │                 │
│    ╭──────────────────────╮    │ visible back edge + contact shadow
│    │ Today's situation    │    │
│    │ Short scenario       │    │ reading plane stays flat and crisp
│    │ [Reveal reasoning →] │    │
│    ╰──────────────────────╯    │
│      explanation unfolds       │ no full-screen animation requirement
│                                │
│ Deal an idea         [Deal]    │
│    ╭────╮ ╭────╮ ╭────╮        │ compact fan of title/index cards
│     \ A  \/ B  \/ C  /         │
│    [Inspect selected card]     │ opens inline reader on mobile
│                                │
│ Atlas Peek                    │
│ ● labelled relation ●         │ 2–3 visible nodes at most, if eligible
│ [Why connected?] [Explore]    │
│                                │
│ Archive / search / topic      │ full-width field before other controls
└────────────────────────────────┘
```

At 320px, use a one-card active slot with a visible deck and one/two backing edges; preserve a real deal/collect transition. **Do not silently fall back to swapping text in a single static box.** Upstream fan choreography may simplify spatially while preserving object identity and the interaction. Always provide previous/next or select controls alongside any swipe/drag.

## 3. Motion principles and exact starting tokens

These are initial tuning values for implementation, not claims that motion has been tested. The implementing agent must adjust them against real text, device performance and interruption behavior.

| Token | Starting value | Usage |
|---|---|---|
| `feedback` | 100–140ms | button press, border/ink response |
| `labelSwap` | 140–180ms | rail label and metadata updates |
| `panelReveal` | 260–340ms | scenario-to-explanation transition |
| `inspect` | 320–420ms | card expands into its reader |
| `dealFlight` | spring, visual settling roughly 450–550ms | occasional deck-to-hand movement, never delay the data action |
| `dealStagger` | 45–60ms per card; total capped at 180ms for 3 cards | visibly distinct cards, no long decorative queue |
| `railRelease` | spring initial stiffness 120, damping 24, mass 1 | inspected upstream starting point; tune measured snap travel |
| `easeOut` | `(0.16, 1, 0.3, 1)` | reveal/content settling |
| `easeInOut` | `(0.77, 0, 0.175, 1)` | movement between established positions |
| `pressScale` | `0.96` | eligible pointer-operated buttons only; immediate static state also required |
| `backTilt` | 4–8° | static/dealt supporting-card orientation |
| `readingTilt` | 0° | reading surface; content must settle upright |
| `pointerTiltMax` | ±2° | optional fine-pointer enhancement on non-reading card previews only |

No animation starts the page invisible. Main scenario text and functional controls are rendered on first paint. Animate decoration/enhancement after measurement, not content availability. Do not hide the whole hero behind an entrance timeline. No perpetual float, pulse, scan, particle loop or camera movement at rest.

Keyboard activation performs state changes immediately; use spatial highlight/static placement rather than requiring a flight animation to complete. Reduced-motion removes travel, tilt, parallax, flips and stagger; use immediate state changes with a short optional opacity adjustment of at most 100ms. Accessibility does not require the ordinary visual mode to be flat.

## 4. Scene S0 — arrival and orientation

Initial frame: selected edition, complete scenario, visible deck and quiet Atlas position already exist. The date indicator, active scenario and rail share a vertical alignment. One static cable/stem can imply that the date owns the scene; this is UI association, **not an Atlas semantic edge**.

Optional first-arrival enhancement: settle the supporting card planes by 6–10px and 2–3° over 280–360ms, once. The headline stays readable. No autoplay dealing. The learner initiates the first substantial physical transition.

Acceptance screenshot with animation disabled must still show a distinct active plane, backing edges, foreground/background separation and an identifiable deck. A flat screenshot with equally weighted rectangles fails this design gate even if every button works.

## 5. Scene S1 — condensed kinetic Timeline

Use the actual inspected beUI `timeline` as a capability reference: controlled event identity, focused element, neighbouring scale, ruler ticks, optional cables and inertial release. Adapt to a **condensed rail** rather than installing its full-height media-card demo unchanged.

### Geometry and state
- Rest height 88–112px desktop, 64–80px mobile; one active date at scale 1, neighbours ~0.88–0.94. Avoid upstream 0.72 scaling if dates become unreadable at this size.
- Focus plate moves along the rail; ticks pass behind it. Use real chronological spacing or explicitly ordinal editions, never imply a time interval proportion that is not represented.
- Controlled `value` is the canonical insight ID; presentation geometry never creates a second identity system.
- Click/tap a date: ink/selection responds immediately; indicator travels over 180–260ms if appropriate. The existing scenario surface stays in place. Outgoing copy fades over ~100ms, incoming copy settles from 8–12px over ~180ms. Do not translate the whole stage horizontally offscreen.
- Drag: capture after a small threshold; respect vertical page scrolling and pointer cancellation. On release settle to one valid edition. Clamp at ends with modest resistance; avoid long inertial overshoot on only 3 items.
- Rapid date changes: latest selection wins. Cancel old transitions; do not display the date from edition C with explanation from edition B.
- Never auto-advance. Previous/next controls disabled at real ends; selected date and result are announced once after settling, not on every drag pixel.

### Equivalent controls
Tab reaches date links/buttons; arrow keys can be an enhancement with documented semantics, never an inaccessible custom ARIA widget. Preserve edition permalinks and browser Back/Forward. No-JS fallback is a chronological list with links to full archive text. Reduced-motion retains date choice and selected styling without the track glide.

## 6. Scene S2 — scenario → thought → insight

This is the page's main narrative transformation. It is not an accordion row surrounded by unrelated cards.

State model: `scenario → revealed → evidenceOpen`, with a reversible reset. A prediction can be mental (“Pause for a moment—what would you check first?”) or optional local ungraded selection. Do not add an exam score or save an answer automatically.

### Reveal choreography
1. At activation, button responds immediately. Preserve scenario title and a short scenario recap as anchors.
2. The thin backing plane separates by 8–12px as a static explanatory layer becomes visible; animate the outer shell geometry, never scale glyphs.
3. Over ~280–340ms, scenario reading block shifts only 12–20px upward while the answer area opens below. Main takeaway appears first; caveat follows with at most 60ms offset. Content must remain understandable if both appear immediately.
4. A restrained accent rule traces or grows beside the key distinction; it is emphasis, not a fake chart/data flow. Maintain contrast throughout.
5. An evidence tab becomes visible at the reading plane's edge. Activating it expands an attached inline source panel; retain source check date, subsection and truthful review status.
6. “Back to the situation” closes explanation and returns to the same spatial surface. Date changes reset explanation consistently. Focus stays on the initiating control unless opening a distinct interactive region requires a documented move.

Show source-backed claim, scenario assumptions and caveat distinctly. Do not turn the entire card 180° with a paragraph on each side; flipping long text makes it unreadable and breaks visual continuity. A short symbolic preview card may flip; the main reading object unfolds.

No-JS: native details or complete static scenario/explanation remains available. The regular visual experience is enhanced without duplicate focusable content or two versions simultaneously exposed to a screen reader.

## 7. Scene S3 — Card Dealer as a real discovery interaction

Inspect and adapt live beUI `card-dealer` source, not its playing-card demo. Inspected upstream contract: stable `id`, `zone: deck | hand | pile`, `label`, `cards`, `renderFace`, `renderBack`, `onCardSelect`; measured stage; Motion-based arc travel; hand-card keyboard overlays; reduced-motion path. This is a source reference, not a guarantee of in-repo API compatibility or accessibility.

### Knowledge-card grammar
Back: abstract Hansa mark + subject; no misleading score. Front: short title, one visual cue or 2-line claim preview, category, source/review indicator. Limit fan text to ~12–20 words; the full claim/caveat/source lives in the selected reader. Do not squeeze prose onto an 84×120px playing-card face.

Suggested desktop card size 136–156px × 176–204px, 3-card hand, 46–64px centre spacing, max visible fan rotation ±8°. Measured geometry overrides these values. Reserve ~400–460px of stage width for the tray. At mobile use 104–120px × 140–160px with tighter spacing, or the active-slot layout at 320px.

### Deal and inspect sequence
1. Rest: distinguish an actual stacked deck from its empty hand area. Text button “Deal three ideas” is always available; tapping the deck can be a duplicate pointer affordance.
2. Deal: stable IDs move deck → hand in order, along a shallow arc; cards turn face-up as preview faces, stagger 45–60ms. Shadows contract on landing so the cards feel placed. Reflect hand state immediately in accessible output; never announce decorative substeps.
3. Pointer hover/focus: selected preview lifts 8–14px and becomes upright; neighbours separate by 4–8px when room exists. Avoid large hover movement under the pointer. Touch selects on tap; it never requires hover.
4. Inspect: the selected card's title/identity remains visible while its surface expands into an **inline detail reader** in the tray. Keep the other cards recognisable as the remaining hand. If using a layout projection, animate the shell, not the reading typography.
5. Reader: takeaway, caveat, source, “Open lesson”, “Find in Atlas” only if the target is eligible. Explicit “Back to hand” collapses to the same card position. No invented question mapping.
6. Collect: all hand cards return to the deck with bounded reverse travel; state resets only this deck. Close the reader first if necessary with a deterministic transition. Do not clear practice or Atlas progress.
7. Exhaustion: real “All available ideas dealt” state; offer collect/reset. No infinite fake variety, random mastery claim or score.

Rapid deal/collect: define one reconciled target zone per card, cancel/rebase motion from current transforms and prevent duplicate identities. If cards are loading or absent, render a truthful empty state with a normal lesson destination. Never invent cards to fill a hand. State must remain valid through resize, pointer cancel, reduced-motion changes and route navigation.

Provide an accessible “List view” that exposes all current hand titles and Inspect buttons. It is an equivalent mode, not the default visual replacement for every user. At reduced motion, move cards directly into measured slots; preserve static depth and identity. Keyboard access must not require a spatial animation.

## 8. Scene S4 — Atlas Peek with real semantic depth

The Atlas preview should feel like the stage opening into connected context. It should not become a second massive canvas, and it must not fabricate edges for appearance.

Published data available: one selected concept at the near plane and at most 2–4 related concepts around it, with edge-type labels and an adjacent textual relationship list. Selection updates visual emphasis; pressing a relationship opens conditions/evidence. “Explore full Atlas” preserves canonical concept/edge IDs and the existing view/return contract.

Arrival on scroll may fade the **already-rendered** backdrop/edges once over 200–300ms. Do not force scroll progression, pin the reader, or animate a line that implies a real semantic assertion before its evidence gate passes. Node orbiting, constant pulsing and fake mastery halos are prohibited.

When no published relation exists—as in the currently observed public projection—display a deliberately quiet source/lesson bridge with “Reviewed connections are not published yet”. Do not promote draft edges, draw anonymous fake nodes or claim the learner has a position in a graph. The site's visual depth must come from the scenario/dealer; the empty Atlas must stay honest.

Future-public data and local-review data are separate build modes. A “local review” label is mandatory if review-only relationships are intentionally shown in a separately controlled review tool; homepage visual polish does not authorize enabling that mode.

## 9. Discovery, archive and navigation

Keep the first viewport focused. Archive expands from a quiet “Browse the insight archive” control below the rail/stage or scrolls to a lower section. Do not replace the whole landing experience with a filter toolbar.

Archive layout: full-width search field on narrow screens; topic/type filters beneath; edition count, keyboard-readable result list, empty state and clear action. A compact grid can be used for previews, with full explanations/source panels on inspection. Search broad site content via the existing `/search/`; keep unapproved daily content out of the public index.

IA remains Today / Learn / Practice / Atlas / About. Use a restrained active indicator aligned to the selected destination, not five oversized navigation pills. Main scenario CTA progresses to a real lesson; practice opens a real existing catalogue/session flow. Preserve existing URLs, anchors, `?view=legacy`, saved attempts and Atlas return URLs.

## 10. Accessibility and responsiveness are separate render contracts

Normal visual mode includes physical motion and depth. Reduced-motion uses immediate placements, static planes and focus/selection cues. Keyboard mode performs actions without waiting for choreography. No-JS mode provides readable source-backed content and destination links. These are deliberate equivalents with the same information and tasks.

Minimum touch target 44×44px, visible focus rings above shadows, correct landmark/heading order, one accessible name per card, no nested interactive elements inside an overlay card button. Full card detail links belong in the reader, not inside upstream's whole-card button. Reserve space or use normal document flow to prevent layout shifts. Text remains selectable and readable; overflow controls must be labelled and keyboard reachable.

Mobile fan/rail gestures use touch-action and gesture arbitration so vertical scroll remains possible. Test 320/390/768/1024/1440 widths, both themes, 200%/400% zoom, reduced motion, keyboard, touch and RTL when Arabic content is actually supplied. Explain all graph information textually. Do not certify accessibility from source inspection alone.

## 11. Visual acceptance — cannot be replaced by unit-test counts

| Gate | PASS evidence | FAIL examples |
|---|---|---|
| V1: still-frame depth | With motion paused, active reading plane, deck, hand and supporting layers are distinguishable in both themes | Equal flat cards separated only by borders |
| V2: coherent composition | Date rail, active scenario and card tray visibly belong to one staged scene | Three independently boxed widgets with no spatial relationship |
| V3: actual dealing | Recording shows same card ID move from deck to hand, inspect and return/collect | Text changes in one stationary box; fake back plate only |
| V4: meaningful reveal | Scenario heading/identity stays anchored while reasoning becomes a new reading plane | Plain dropdown used as the entire normal visual treatment; full-card paragraph flip |
| V5: graceful interruption | Rapid inputs/resize settle into final requested state with no duplicate/stuck card | Queued animations, wrong edition/explanation pairing, inaccessible intermediate state |
| V6: mobile character | 390px retains material depth and intentional deal interaction, with clear touch controls | Desktop fan clipped; all motion/depth removed for every mobile user |
| V7: honest Atlas | Only eligible published relations drawn; empty state is designed | Unreviewed connections used as decorative graph or fake learning position |
| V8: no motion debt | Page rests still; controls respond instantly; heavy layers stay off reading text | Ambient loops, hover instability, animation blocking navigation |
| V9: equivalent access | Same claims, caveats, sources and actions available in reduced-motion/list/no-JS modes | Accessibility used as a reason to give every user the flat fallback |
| V10: owner visual review | Desktop/mobile stills and short scene recordings presented for review | “Build passed” or a subjective score offered as visual approval |

Required evidence: desktop/light screenshot, desktop/dark screenshot, mobile screenshot, 3 short recordings (rail selection, reveal/evidence, deal/inspect/collect), reduced-motion equivalent, interruption test, and annotated visual comparison against these composition diagrams. Report tested/untested conditions. No numeric aesthetic score should claim the design was accepted by the owner.
