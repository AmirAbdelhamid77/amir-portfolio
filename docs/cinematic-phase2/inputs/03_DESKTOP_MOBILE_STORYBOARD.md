# 03 — Interaction storyboard and exact desktop/mobile scene behavior

## Principles

Each scene state needs: triggering input; source data/state change; visual behavior; accessible equivalent; cancellation; and 'what user understands now'. The experience is not a scroll-only video. Navigation, Skip to Explanation and Search remain interactive immediately, including during opening animation.

## Desktop: 1440×900 starting composition

**Global:** fixed/normal nav according to repo, Hansa wordmark + `Today Learn Practice Atlas About` + search. Never put Work/Experience projects on homepage. About may link to Work/Experience elsewhere.

**Hero safe area:** max-width approximately 1280px, 12-column proportional layout with generous negative space. Left editorial 5–6 columns; right interactive stage 6–7, not three identical boxes. Headline and date are DOM/readable at initial paint. Atmospheric background uses restrained gradients/grain/scene within hero clipping; no particles over legible text.

**Insight stage:** active title, short scenario, prediction choices or direct manipulation, numerical view with exact accessible values, Reveal/Skip and source disclosure. Visual instrument floats beyond a flat rectangular card edge; contained, performance-bounded.

**Timeline:** dimensional chronological ribbon along lower/near foreground of the hero (or crossing scene at oblique angle), **not static date chips**. Active event visibly elevated, two previous events recede, date labels remain readable; archive accessible from same state. Do not loop real chronology falsely.

**Card Dealer:** next fold begins with physically fanned/stacked cards *overlapping*, not 3 equal tiles. User action lifts one along arc, flips to a readable DOM-backed inspector. One card at a time in reading focus; default deck labels: Principle, Try It, Misconception, Evidence, each only if meaningful.

**Atlas Peek:** current concept anchored, 3–5 public-approved typed relations at most; verified lines emerge or focus when graph is entered. Neighbor info and ordinary lesson/question links always available. No public edges? render source-backed related resource list with honest status, **not invented graph**.

**Closing fold:** two coherent 'Continue learning' and 'Test understanding' actions. No repeated course-card directory and no claims about the size of question bank unless derived from canonical current data.

## Mobile 390×844 (recomposition, not shrink)

Initial visible: wordmark, search/menu, date/insight title, one direct obvious interaction and a lightweight version of visual instrument. Insight explanation must not be below many decorative scenes. Condense atmospheric background. `Today` and Learn/Practice/Atlas reachable via menu.

Timeline: compact scroll/swipe **rail** preserving active focus, with tactile momentum and keyboard previous/next controls. No tiny 3D perspective text or unbounded drag capture, no accidentally captured page scroll.

Card Dealer: tactile stacked object with visible layered edges, one-card selection; selection opens an accessible bottom sheet/expansion containing rich text/chart. Provide `Close`, return focus, Escape and swipe/keyboard equivalent. Do not fan tiny cards across 320px.

Atlas Peek: primary readable list of up to 3–5 relationships; optional contained graph tap-to-focus, opening details with real link. Default list if low-power/reduced motion. No unreadable node labels.

Test exact widths: 320, 390, 768, 1280/1440, plus Arabic long title and 200% text zoom. Touch target >=44×44 CSS px where practical and WCAG 2.2 target-size requirements must be met. No essential hover actions.

## Finite state machine: `DailyInsightStage`

| State | Input | Data/action | Transition | Accessible behavior |
|---|---|---|---|---|
| READY | route load | load approved insight for Cairo publication date | no blocking intro; atmosphere settles | heading + full scenario available immediately |
| PREDICTING | user selects choice/changes input | update validated calculation | focus chart/instrument changes | input label, calculated output, `aria-live` concise only |
| REVEALED | Reveal or Skip | show canonical explanation | instrument highlights causality, paper panel unfolds | explanation inserted in DOM, reachable by focus |
| DEALER | choose deeper layer | set `activeCardId` for insight | spring travel/arc + flip, reader expands | readable panel, keyboard and Escape close |
| ATLAS | explore related concept | only approved edge selection | focus shift, connected lines brighten | synchronized list/definition, reset/return |
| CONTINUE | choose lesson/question | regular link navigation | optional light transition, no hijack | native navigation |

Selected date is orthogonal state `activeInsightId`; changing date atomically resets experiment, reveal, card and Atlas selection as appropriate. Date change during an animation **cancels/retargets** previous tween; do not let stale callback show an old insight. URL should encode stable insight slug where feasible.

## Motion choreography and tokens

| Interaction | Physics / duration starting hypothesis | User-visible effect | Reject when |
|---|---|---|---|
| Initial entrance | 0–800ms staggered, skippable | typography and instrument assemble; never blank critical content | forces a long wait/autoplay |
| Timeline drag | authentic spring/momentum; settle after release | events change focus and visual depth | ordinary button row, misordered chronology |
| Date change | ~250–550ms, retargetable | old concept recedes, new instrument/heading sync | text updates late or independently |
| Predict/adjust | ~100–300ms | data mark and exact numeric readout recompute | decorative visual only |
| Reveal | ~250–450ms | explanatory layer emerges from instrument | abrupt unrelated card popup |
| Card selection | ~350–700ms spring/path | lift → arc flight → flip → readable DOM surface | hover scale only; text trapped on card |
| Atlas focus | ~300–600ms | selected node/typed verified edge focuses; others recede | decorative random connections |
| Close/reset | ~150–400ms | reverses coherent state and restores focus | irrecoverable orientation |

Durations are candidates to tune against real recordings. No constant floating movement on actual text. Pause offscreen; honor `prefers-reduced-motion`, no uncontrolled parallax or wheel interception.

## Interaction acceptance sequences

**Desktop sequence A:** load today's Insight → change data input → verify derived readout changes → Reveal → select 'Principle' → observe arc/flip → close → select Atlas node → see cited relation → open underlying lesson → Back returns preserved context.

**Desktop sequence B:** drag Timeline quickly across multiple dates → release → correct selected content synchronizes → interrupt transition with another date → no stale card/explanation → reset.

**Mobile sequence C:** open at 390 → read without horizontal scrolling → choose insight → open stacked card sheet → keyboard/touch close → browse short timeline → Atlas list → navigate. At 320 body remains readable, no clipped controls.

**Alternative sequence D:** prefers-reduced-motion or no WebGL support → all text, dates, cards, graph links and exact numbers accessible; no substantive path missing.

## Art-director evidence frames

Capture **actual screenshots plus video**, not mockups only, at F0 first paint/settled; F1 mid-Timeline drag; F2 selected date; F3 predicted chart change; F4 revealed explanation; F5 card in flight; F6 flipped card reading surface; F7 Atlas node focus; F8 mobile card sheet; F9 reduced motion. Capture console/hydration warnings separately. Each frame includes viewport, browser, revision/commit and status.
