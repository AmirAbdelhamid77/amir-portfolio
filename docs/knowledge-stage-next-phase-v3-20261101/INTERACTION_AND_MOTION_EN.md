# Knowledge Stage — interaction, composition and motion specification

Status: proposed behavior for the next implementation. Timing, opacity and distances below are prototype tuning baselines, not measurements of current performance.

V3.1 visual amendment: use [VISUAL_DIRECTION_BEUI_HANSA_EN.md](VISUAL_DIRECTION_BEUI_HANSA_EN.md) for the required blend of current Hansa design and beUI-inspired depth, vibrance and color. This document retains the interaction and timing contract; the amendment supplies material, lighting, typography and token-role detail.

## 1. Visual identity and representation choice

Use a readable, stable 2D knowledge field with spatial depth created through hierarchy, selective elevation, occlusion, contact shadows and restrained edge treatment. Preserve Hansa's actual type, theme roles and saved preferences, while adding the scoped saturated accents, material response and light defined in the V3.1 amendment. Refine the prototype's warm paper and slab treatment into one theme-aware system rather than keeping a second palette. Use circular concept anchors where appropriate, distinct resource surfaces and labelled relationship lines. Node size is not mastery or importance unless an explicitly defined metric is shown.

The selected concept is the main visual anchor. A small contextual action area answers what the visitor can do next. Evidence appears on request. Avoid turning the learner surface into a permanent review dashboard of counts, candidate statuses and source-management tools. Review mode retains truthful state labels and a separate inspector; public learning mode shows only relevant eligible content and material limitations.

Compare these representations before implementation:

| Representation | Strength | Decision |
|---|---|---|
| Search/list + explicit stepper | Clear, accessible and efficient on narrow screens | Required equivalent and useful default for dense labels |
| Stable 2D field with task-specific compositions | Reveals relationships while retaining orientation | Recommended signature for desktop/tablet |
| Immersive 3D or perpetually simulated field | Spatial spectacle; higher camera/label/input burden | Not the baseline; needs evidence of added learning value |

Score actual prototypes using the repository rubric. Use local beUI and Hansa first; compare DOM/SVG plus existing Motion against a justified specialist only if topology/layout requirements exceed them. Check official current APIs before choosing or installing anything. This plan does not mandate D3, React Flow, a graph database or another styling system.

## 2. Home scene A — Timeline as the entire first encounter

The first viewport is the Timeline composition, including its dates and necessary activation controls. Remove the competing marketing headline, explanatory paragraph, visible review toolbar, statistics and full site header from this scene. Keep a keyboard-visible skip link and an unobtrusive navigation access control; make essential destinations available without forcing scrolling or gestures.

Use the audited beUI Timeline behavior: controlled identity, readable date focus, geometry, ruler/cables if supported by the actual component, keyboard navigation and reduced motion. The standalone ledger is a reference, not proof that the requested component has been reused. Inspect local implementation and live free beUI capabilities before adapting it.

Date states: today, selected date, latest available edition, past edition, no edition. These are separate states. A live date must use the chosen visitor timezone policy consistently; do not present a fixed prototype date as today in production. SSR and first client render must agree, then update safely. The current 31 October clock remains a labelled test fixture only.

Selection and activation are separate. Drag, arrows or date navigation select; a click/tap or Enter on an actionable date opens its edition. Reselecting the selected date must still activate it. Prevent a drag release from accidentally opening a card.

If today has no edition, activation shows a concise inline message and offers the latest available edition with its actual date. Do not silently relabel an older insight as today's content. Do not require fabricated daily material to fill the rail.

## 3. Daily Dealer

Open intentionally from the date. Reuse the existing KnowledgeDealer renderer and source-backed card mapping when moving into React. Opening is a state transition, not an automatic scroll to another page.

An edition may contain one genuine idea or several. An idea may expose principle/caveat/evidence facets where the existing model supports them. Multiple facets do not become multiple invented daily ideas. Derive counts from resolved data and use consistent copy.

The visual composition has deck, hand and reader. The hand reveals a bounded, readable number of cards; the reader provides the actual explanation. Additional cards use explicit next/previous or pagination, not an unreadable fan. A one-card edition remains intentional and attractive. An empty result gives a helpful next action without an empty modal.

The reader can inspect evidence and preview a destination without nested dialogs. Escape steps back from evidence/destination to reader, then closes the Dealer. Closing restores focus after the opener is mounted; if it no longer exists, use the scene heading. Lock background scroll while modal, preserve its position, and prevent a layout jump when the scrollbar disappears.

Locate in Knowledge resolves an actual eligible resource/concept mapping. It opens the Knowledge Stage with the mapped item selected and a return reference. If no public semantic mapping exists, open the resource/topic discovery location with a truthful label. The card-to-concept motion must not imply an unverified relationship.

## 4. Home scene B — the Knowledge Stage

Without a selected concept, show a compact invitation, search and domain/resource entry choices. Domain regions are navigation groups, not semantic links. No mandatory onboarding form. Arriving from a card restores that card's context directly.

At a selected concept, show a short definition, an intent control and a bounded neighborhood, normally around 6–10 concepts on a wide screen after testing actual labels. More items remain reachable through counts, expansion, search and list. Never silently omit the rest.

Show no more than one dominant evidence/reading panel at a time. Advanced evidence filters and the review register belong behind an inspector control. The current Direct/Inferred/Cross-domain filters may remain as secondary tools; they do not replace Understand/Compare/Apply/Reach a goal.

### Understand

Question: what does this mean and what helps me understand it?

Anchor: selected concept. Surround it with eligible prerequisite/mechanism/complementary context according to the chosen relation filter. Use labelled typed edges and an accessible relationship list. Position alone must not imply prerequisite direction.

Click a neighbor to peek. The peek contains a short definition, why it is relevant, and explicit Explore/Open resource choices. The first click does not expand an entire network or immediately navigate away.

### Compare — Comparison Desk

Question: what changes between these choices in my context?

Pin two supported concepts/options. Recompose the field into two anchored sides, shared characteristics between them, and distinct criteria on their outer sides. Provide a readable comparison table as an equivalent. On mobile, stack the pair and align each criterion's values together.

Criteria and conditions come from reviewed comparison records, not a generic language model answer or label similarity. Selecting a condition highlights affected criteria and explains why. Missing criteria show unknown, not a fabricated tie or winner. Limit the initial comparison to two choices; do not build an arbitrary many-way decision engine in this phase.

Cancel restores the original concept and neighborhood. A comparison edge alone does not supply a complete criteria matrix; prepare that evidence explicitly.

### Apply

Question: where can I use this idea?

Keep the concept visible while mapped examples, cases, labs and eligible practice destinations form a small action sequence. Distinguish read, inspect, try and assess. A link to an existing practice engine does not mean the graph grades answers.

When only explanation is available, offer it honestly. A missing practice match is a visible gap, never a reason to attach an unrelated question. Held assessment content cannot appear as an active scored exercise.

### Reach a goal — Route Preview

Question: what supported steps can get me there?

Resolve a known goal and optional explicit starting-point declaration. Show numbered steps, reasons and gaps. Preview an alternative without replacing the current route; Apply route commits the choice. A self-declared known concept is labelled self-report and does not update mastery or assessment records.

Prerequisite conditions remain enforced or explicitly unresolved. Comparison and navigation history do not become required learning steps. Shortest graph distance is not a measure of learning quality.

Keep one selected step as the visual anchor. Offer Why this step, Preview resource, Next and Back. Do not autoplay a tour that withholds interaction until it finishes.

## 5. Signature interactions

| Interaction | State and meaning | Visual response | Recovery |
|---|---|---|---|
| Focus and reveal | Select concept, then explicitly expand chosen relation | Existing anchors stay stable; new neighbors enter reserved slots | Collapse returns to previous neighborhood |
| Why this? | Inspect one assertion/recommendation | Highlight its endpoints and line once; show explanation on an opaque surface | Escape closes explanation without resetting graph |
| Branch preview | Inspect possible next branch | Labelled preview marks proposed nodes; current path remains available | Cancel discards only preview state |
| Same concept, new context | Change resource/domain placement | Shared canonical anchor remains; examples/resources update | Back restores former placement |
| Learning Thread | Record deliberate user navigation | Small ordered trail, visually distinct from semantic edges | Selecting an earlier item restores its view; new branch remains explicit |
| Knowledge Pocket | Save an expressed interest | A small visual copy moves to the pocket; source stays still | Undo/remove changes collection only |
| Return to thread | Restore graph/deck context after reading | Recreate positions by identity; brief origin cue | Missing target uses a named valid ancestor/resource |

Learning Thread and Pocket are bounded session features in this phase: target caps of 30 trail entries and 12 saved references, documented and adjustable. Explain limits and provide removal/clear controls. Persistent named collections and cross-device sync are later work. Never store complete source bodies or assessment answers in these presentation records.

## 6. Choreography and vignettes

| Transition | Initial tuning | Meaning and constraint |
|---|---|---|
| Date press | 80–120ms, subtle scale around 0.98 | Immediate feedback; no delay before action |
| Dealer open | 220–280ms, restrained expansion from date context | Origin remains understandable; close available immediately |
| Deal cards | 450–500ms flight, 35–45ms stagger capped at 140ms | Show deck-to-hand order; play once per edition visit, not on every reader switch |
| Reader change | 180–240ms; exit 120–160ms | Preserve card identity; no large screen travel |
| Intent change | 120–180ms local emphasis; up to 280ms for composition | Unchanged nodes retain identity and orientation |
| Deliberate branch expansion | 220–280ms, 20–35ms stagger capped at 120ms | Selected anchor stays stable |
| Comparison composition | 240–320ms | Two anchors settle before criteria detail; no blocking delay |
| Evidence trace | 180–240ms once | Highlight meaning without implying causal flow |
| Pocket save | 220–280ms | Copy moves, original remains; label/count changes immediately |
| Return cue | 240–320ms once | Locate the restored origin without replaying graph entrance |
| Repeated keyboard/search actions | Immediate or <=100ms opacity | Frequent input must not repeatedly choreograph the whole field |

Use the existing `EASE_OUT` convention where appropriate; a starting cubic-bezier is `(0.16, 1, 0.3, 1)`. Animate explicit properties. Layout queries, scientific decisions and state commits must not wait for animation completion. Rapid input cancels/supersedes obsolete effects; the latest intent wins.

The Timeline-to-graph handoff is directly linked to native scroll progress, initially over roughly 0.35 viewport height after the first scene's hold. Graph-to-closing is initially 0.25–0.35 viewport. Tune against long content and small screens; never impose an exact cinematic scroll distance at the expense of readability.

At progress 0/0.25/0.5/0.75/1 inspect the full composition. Decorative outgoing layers can fade and blur from 0 to 4–6px; the active text/action surface remains crisp with adequate contrast. Use an opaque reading surface when overlapping content would reduce legibility. A large blurred outgoing paragraph must not remain the only way to read essential content.

Vignette starts around 6–10% strength in light mode and 14–22% in dark mode on the outer decorative field. It must not dim controls, evidence or text below contrast requirements. Avoid continuous animated blur, full-screen backdrop-filter stacking and a vignette that looks like missing content.

Only the current scene is interactive once a handoff settles. Before making an outgoing subtree inert, move focus if it remains inside it to an already-mounted destination heading with `preventScroll`. Do not steal focus on every scroll frame or announce every progress increment. Reverse scroll must work naturally. Open Dealer freezes background scene progress until close.

## 7. Responsive and accessible presentation

- At 320/390px: Timeline remains readable; graph uses a focused concept, relation choices and list/details. Comparison is paired criterion rows; routes are a vertical stepper. The selected meaning and return context stay identical to desktop.
- At 768px: use measured space for two panes only when labels and controls remain readable. Do not assume all tablets have precise pointers.
- At 1280px and wider: bounded graph plus contextual detail; the graph remains the primary stage rather than a tiny visualization under oversized headings.
- Body copy starts around 16–18px; meaningful labels around 13–14px. Do not make scientific relation labels microscopic to preserve a screenshot layout.
- Touch targets at least 44px where practical; no overlapping hit areas. Hover is supplementary. Provide visible focus, logical tab order and explicit zoom/fit/reset controls if free manipulation is offered.
- Vertical wheel/touch scroll moves the page. Graph pan/zoom requires deliberate engagement; offer escape/reset. Avoid nested scroll traps.
- Respect Arabic/English direction and use logical CSS properties; semantic arrows follow relation meaning, not blanket RTL mirroring.
- Reduced motion uses static stacked scenes, stable positions, no camera travel, no card flights, no animated blur; immediate changes or 0–100ms fades preserve all explanations.
- Check 200% zoom/reflow, light/dark, forced colors, keyboard and a real screen reader where available. Record unavailable checks.

Motion's documented reduced-motion settings and hooks support this approach; use the repository's installed import conventions rather than copying an unrelated version's imports. [Official Motion accessibility guide](https://motion.dev/docs/react-accessibility).

## 8. Scene C and sparse states

Closing: one concise statement about the site and at most a few useful destinations: Learn, Practice, and Resume only when supported by real saved state. Avoid another full-screen sales section, fabricated totals or completion badges. Preserve deeper information in existing destinations.

Public graph with no eligible edges: offer the resource catalogue/search and existing editorial sequences with accurate labels. No invisible candidate edges, invented bridges or dead screen. Review mode may show the richer candidate graph in a separate local artifact.

Other required states: no edition; missing concept; unsupported goal; incomplete comparison; source withdrawn; incompatible graph snapshot; loading/cancel; corrupt local view state; empty Pocket; full Pocket; high-degree node; no matching search result. Each keeps a clear next action and a way back.

## 9. Required storyboard and recordings

First deliver the V3.1 style comparison and six light/dark keyframes. Then carry the chosen blend into nine desktop frames plus mobile/reduced-motion counterparts where behavior changes:

1. Timeline-only entry, selected available edition and today's availability.
2. Dealer open, with real content and truthful card count.
3. Scroll handoff at midpoint, with readable active information.
4. Understand focus, small neighborhood and explicit branch preview.
5. Why connected, evidence and conditions.
6. Comparison Desk, changed condition and explanation.
7. Goal route preview, alternative/gap and Why this step.
8. Pocket/Thread plus restored context after a resource visit.
9. Concise closing and public sparse-state alternative.

Record: Timeline→Dealer→graph→resource→return; Understand→Compare→cancel; rapid interrupted expansion; keyboard modal escape; reduced-motion equivalent. Annotate which data are real candidates, publicly eligible or test-only fixtures. Do not claim source screenshots prove an unrecorded animation.

