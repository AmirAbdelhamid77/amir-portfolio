# UX Flows, Visual Semantics, Motion and Component Selection

## Primary journey map

**J1 — Guide discovery:** User opens existing DP-600 Academy -> sees normal reading/learning actions plus an optional Atlas entry -> opens scoped concept overview -> searches or selects one concept -> opens Inspector -> reads verified semantic relation and evidence -> opens existing lesson -> returns to preserved Atlas view.

**J2 — In-context Peek:** In lesson, Peek shows current concept and minimal reviewed neighborhood -> click *Why connected?* -> concise evidence explanation -> *Explore full Atlas* opens with same selected node -> back returns lesson scroll position where possible.

**J3 — Question review:** Student answers an existing question incorrectly -> practice UI suggests reviewed concept IDs -> *Explore why* opens focus neighborhood -> Inspector links to relevant explanation -> student returns to question review. Do not rewrite existing scoring or IDs. If mapping is unreviewed, do not invent one.

**J4 — Book versus topic:** From guide landing, selecting a chapter navigates source TOC and scopes the graph to concepts covered there; the graph shows *semantic edges among those concepts and their relevant reviewed neighbors*, not TOC parent-child links. The concept can be referenced by multiple books without duplication.

**J5 — Mobile discovery:** Search/list/drill-down default -> select concept -> Inspector bottom sheet -> open map if desired -> visible Zoom/Focus/Back controls -> return to list. A screen reader can execute full J1–J4 without loading graph spatially.

## Interaction and state priorities

1. Search concept or choose curated cluster.
2. Open context-aware Inspector on single click/tap; no surprise navigation.
3. Inspect and explain edges; relation info appears in both canvas and accessible linear list.
4. Focus neighborhood (default 1 hop; explicit expand to 2 hops); cap visible results with explainable count and continuation.
5. Filter by relationship type, canonical subject, source/book, evidence state; clearly show applied chips and reset.
6. Showcase selected slice without removing context; visually distinguish from filtering.
7. Share safe scoped link; persist camera and filter state when returning from content.
8. User can always reach conventional navigation and content without graph.

## Semantic nodes and edges (design tokens, not prescribed colors)

Node design vocabulary:

- Fundamental concept: concise labeled node with foundational icon/shape.
- Technology mechanism: differentiated affordance; optional compact mechanism hint in Inspector.
- Decision principle: comparator icon and clear conditional claim.
- Skill: action/ability label, verified objectives metadata.
- Architecture pattern: multi-part icon or perimeter, but no drawn catalog parent-child links.

Edge design vocabulary:

- `requires_understanding_of`: clearly directed with accessible textual inverse.
- `enables`: directed and explicitly conditional; don't imply perpetual data flow.
- `contrasts_with` / `tradeoff_with`: symmetric, not directional arrows by default.
- `complements`: symmetric cooperative relationship.
- `related_in_decision`: explicit decision-context legend.

Edge thickness/opacity must never imply measured certainty without a defensible scoring method. Categories are expressed through text/shape/legend in addition to color. Focus selection should be distinguishable at 200% zoom and in monochrome.

## Responsive defaults

- Desktop >= wide threshold determined by testing: Navigator + graph + Inspector.
- Medium desktop/tablet: hidden/foldable navigator, split graph and on-demand Inspector.
- Mobile: search/list/drill-down FIRST; optional full-screen graph + bottom sheet.
- All: breadcrumbs, safe close/back, typed link to selected concept, text alternative, scroll restoration.
- No UI viewport threshold selected without checking real navigation/content widths.

## Source & inspector content

Header: title, status, context. Tabs/sections: Overview, Connections (each type+conditions+evidence), Learn, Practice, Sources. Unverified attachments shown with clear unavailability states, not clickable dead links. Relation click shows a *relationship inspector*, distinguishing general concept explanation from evidence for that particular connection. If two authors disagree, show source versions rather than flattening conflict.

## Motion semantics

- Focus transition: move graph toward selected concept with continuity; user can interrupt.
- Expand: reveal nearby reviewed nodes with staged but minimal motion.
- Search select: pan to target, halo briefly, open Inspector; accessible announcement.
- Content state: Inspector slide/fade only if unobtrusive; reduced motion switches to instant.
- Simulation: animate truthful directional information flow ONLY when actual learning model warrants it; include textual process steps.
- Never use perpetual idle particles, heavy 3D physics or motion that delays reading. Follow `prefers-reduced-motion`, let the user disable decorative motion separately.

## Smart library-choice protocol

Agent surveys existing Hansa design system and installed dependencies first. Then, on a **per-learning-goal** basis, shortlist beUI.dev free components, current React Flow, accessible design-system primitives, D3/custom SVG, or suitable alternatives. Evaluate semantic fit, keyboard/a11y, CSS/React version, license, measured bundle, mobile behavior and fallback. Only install after confirmation of actual API/availability and source inspection.

Examples:

- Graph: React Flow/custom SVG + semantic edge Inspector, not a Sankey.
- Data ingestion mechanism: interactive architecture diagram, not a graph of arbitrary word relationships.
- Time-ordered learning journey: stepper/timeline if actual order meaningful.
- Weighted pipeline quantities: Sankey only with trustworthy weights/units.
- Data Visualization concept: interactive chart with values, baseline, scale and accessible table.
- Statistics lesson: distributions/confidence interval explorable if mathematical assumptions and calculations verified.
- Data Storytelling: annotation-before/after chart or step-by-step annotated story, if beneficial.

This is a *decision rubric*, not mandatory components. Creative use of additional libs is welcome with ADR and QA.

## Feedback loops and measurement

A quiet usability study should ask: Do people know the meaning of a drawn line? Can they return to their lesson? Can they distinguish unreviewed mapping from a scientific relation? Does the map help find the next useful action? Prefer task completion and concept understanding to raw interaction counts. Any tracking requires separate consent/privacy review.
