# Hansa Home and Intelligent Atlas — Agent Implementation Guide

Version 2.0 · 31 October 2026 · English handoff

**Preparation status: planning only. No application implementation or deployment is performed by preparing this guide.**

Repository: `D:/BeUI/amir-portfolio`.

Read this guide together with the mandatory [Intelligent Atlas specification](INTELLIGENT_ATLAS_SPEC_EN.md) and [future extension contracts](FUTURE_CONTRACTS_EN.md). These documents refine the earlier Arabic handoff and incorporate the owner's latest requirement: **the Atlas must become an Intelligent Interactive Knowledge Graph built from an analysis of the entire eligible website corpus. A visual catalogue alone does not satisfy the final Atlas requirement.** Preserve the earlier documents as historical evidence.

## 1. Mission and scope

Create a distinctive Hansa homepage with three main scenes:

**Full-viewport beUI Timeline → Intelligent Interactive Knowledge Graph → concise practical closing.**

Activating a date opens a full-screen KnowledgeDealer experience within the first scene. The graph is the primary entrance to the site's knowledge: it helps the learner understand where a concept sits, why it relates to other concepts, what can follow, and how to pursue an intended outcome.

The learner's job is: **discover an idea, understand its context, choose a next step, and recover the path that brought them there.** Time opens an idea; the idea opens its knowledge context; that context reveals meaningful choices. Motion should make these changes understandable.

When commissioned, begin with the preservation baseline and whole-corpus analysis, then produce a five-frame storyboard and an independently reviewable interactive prototype grounded in that analysis. The assigned scope determines the stopping point:

- **Visual-prototype scope:** deliver the required corpus analysis and graph design artifacts, the storyboard, and a bounded prototype using real content; report exactly what the prototype covers. Do not integrate it into the application unless requested.
- **Full local implementation scope:** complete corpus analysis, graph construction and review preparation, homepage integration, coverage, preservation and acceptance testing. A prototype or a small vertical slice is an intermediate deliverable.
- **Deployment:** a separate owner instruction is required. Neither of the scopes above authorizes deployment.

A prototype may display a carefully selected subset after the agent has accounted for the entire corpus. The subset is a rendering choice, not permission to analyze only familiar domains or a few example pages.

## 2. Product invariants and design freedom

| Required outcome | Design freedom |
|---|---|
| The first viewport contains only the Timeline and its necessary controls | Date composition, spacing, ruler details and depth |
| Use the actual beUI Timeline, with documented adaptation | Full-stage sizing and input behavior; do not merely enlarge the condensed local rail |
| An intentional date activation opens KnowledgeDealer | The date-to-table transition and card composition |
| Vertical scrolling hands focus from Timeline to Atlas to closing | Measured transition distance, vignette and visual depth |
| Atlas discovers all eligible public resources and represents reviewed conceptual relationships | Stable 2D composition, semantic zoom and contextual detail |
| Users can preview a destination and choose whether to explore it | Clear action labels, breadcrumbs and route explanations |
| Identity, provenance, review status, URLs and progress remain valid | Derived adapters and presentation models |
| Future content and Dealer contexts can be added without rebuilding Home | Small explicit extension contracts |

Use a rich 2D graph as the initial visual direction: stable anchors, readable conceptual neighborhoods, and progressive detail. Compare it with a precise text/list explorer and an immersive 3D alternative under the repository's weighted rubric. Keep the text/list explorer as a fully functional alternative. A rendering engine must not determine the meaning of the data.

All timing, distance and opacity values in this guide are **prototype starting points**, not measured production guarantees. Adjust them after visual and performance inspection and record the reason. The product invariants take precedence over a suggested number.

## 3. Required context and baseline

Read `AGENTS.md`, then `docs/agent-reference/START_HERE.md` and its required references. In particular, follow the preservation reference, adaptive visualization policy, reorganization guidance and `docs/knowledge-atlas/START_HERE.md`. Apply `.agents/skills/hansa-creative-intelligence/SKILL.md` and its art-direction, motion and quality references.

Inspect the actual checkout, `git status`, current diffs and file ownership before writing. Preserve concurrent work. Do not reset, clean, stash or replace unrelated changes to simplify implementation.

| Inspected context from the earlier handoff | Consequence to recheck before implementation |
|---|---|
| `/` and `/prototype-c/` share `components/knowledge/hansa-landing.tsx` | Keep one implementation, canonical identity and compatible query/hash behavior |
| `InsightRail` is a condensed beUI adaptation without the full-height/media/year/cable composition | Restore an appropriate full-stage Timeline from the actual source |
| `KnowledgeDealer` already accepts cards, reader content and callbacks | Reuse the presentation and improve its data/context boundary |
| `insightCards` creates principle, caveat and evidence cards | These are three explanatory cards for one idea, not three independent ideas |
| The inspected feed contained three `technical_review` editions | Show their actual dates and status; a new UI does not publish fresh daily content |
| The 30 October audit had zero public published Atlas concepts and edges | This is a dated baseline, not a reason to skip full semantic analysis, candidate construction or the review queue |
| Study records cover more than `sourceDocuments` or the current search index | Reconcile every eligible source family; search results are not the corpus boundary |
| `StudyRecord.status` is free text; some insight entries inherit a lesson's status | Resolve eligibility from the original source before preparing a Deck or assessment |
| Atlas currently restricts sources and links to a DP-600 scope | Extend contracts deliberately; do not disable validation to accept every source or URL |
| `stage-editorial.css` documents an earlier mid-scroll text-contrast failure | Inspect stopped transition states, not only animation endpoints |
| The checkout contains tracked and untracked changes | Capture ownership and preservation evidence before implementation |

`docs/project-context-20261030/README.md` is a useful historical inventory. Recalculate any displayed counts. Inventory coverage is not scientific validation of every claim.

## 4. Entire-site analysis is mandatory

Before finalizing the graph, recursively inspect all eligible source families and their nested units: lessons, notes, formula definitions, code examples, question banks, assessment explanations, experiments, case studies, references, curriculum sequences, Academy content, dated insights, resource mappings and public informational pages. Inspect rendered destinations and source exports when needed to resolve meaning or provenance. Record inaccessible or unavailable inputs as explicit gaps.

Use both source evidence and existing application behavior. A title/tag scrape is insufficient. A route inventory is insufficient. A sample of chapters is insufficient for claiming full-corpus analysis. Follow the extraction, entity resolution, relation review and coverage workflow in [INTELLIGENT_ATLAS_SPEC_EN.md](INTELLIGENT_ATLAS_SPEC_EN.md).

The resulting artifacts must account for every eligible unit, including items that produce no concept or no semantic relation. Retain original IDs, source locators, revision evidence, limitations and review states. Distinguish duplicates, alternate placements, translations, revisions and genuinely different concepts. Private intake and material not allowed for publication must not enter the public payload merely because it exists in the workspace.

Build a candidate graph and review queue from this analysis. Relationship proposals need source passages/locators, a typed claim, direction, conditions and an explanation. Similar wording or shared tags can generate a candidate for investigation; they cannot establish a prerequisite or causal claim.

The current lack of published edges does not make the semantic work optional. Prepare the complete evidence-backed candidate graph and a clearly marked local review experience. Publication remains governed by the existing review rules. If human publication review is unavailable, complete all independent analysis and implementation work, identify the exact remaining publication dependency, and report semantic release readiness honestly. Do not describe a catalogue-only fallback as the completed Intelligent Knowledge Graph.

## 5. Visual language and depth

Use Hansa's existing tokens, including `--background`, `--foreground`, `--primary`, `--muted-foreground`, `--border-strong` and `--card`. Respect saved light/dark and accent preferences; provide reachable appearance controls. Scope new styles to Home rather than changing lesson styling globally.

**Composition:** a broad neutral background, a focused interaction plane, and a readable foreground detail surface. The active date, selected concept or selected card is the primary focal point. Negative space supports orientation.

**Vignette:** a noninteractive gradient, transparent at its center with restrained edges. Initial tuning range: roughly 6–10% in light mode and 14–22% in dark mode, subject to contrast inspection. Place it behind text and controls. Its strength may change during a scene handoff; it should not chase every pointer movement. The active reading surface has no blur.

**Surfaces:** fine borders communicate structure, layered shadows communicate elevation, and a restrained highlight communicates selection. Size, glow and line weight must not imply unmeasured mastery, importance or evidence quality. Write review states explicitly rather than encoding them only with color.

**Typography:** reuse existing fonts. Make dates prominent without clipping. Start body reading text around 16–18px and functional labels around 13–14px; essential information must not depend on tiny microtype. Use tabular numerals. Allow wrapping and text enlargement, and avoid letter-spacing Arabic text as if it were an uppercase Latin label.

**Spacing and touch:** initial outer spacing of 24–48px on large screens and 16–20px on phones, respecting safe areas. Prefer touch targets of at least 44×44px. Enlarged hit areas must not overlap adjacent targets.

**States:** every applicable control needs idle, hover, focus, pressed, selected and disabled behavior. Data surfaces need loading, empty, unavailable/error and retry behavior. Use stable surfaces instead of continuous shimmer when content is already available. Focus indicators must remain visible over the vignette and in both themes.

## 6. Scene one: the full-viewport Timeline

The opening scene is usable immediately. Do not require an introductory animation to finish. Show no sliver of Atlas, second hero, traditional masthead or conventional header. Keyboard skip navigation remains available; the Timeline's controls are understandable and visible.

Center today with the available edition title and necessary status nearby. Partially visible neighboring dates communicate horizontal exploration. Retain appropriate beUI vocabulary such as the focus line and ruler. A small concept illustration may appear inside a date card only when grounded in the actual idea. Do not import demonstration metrics, likes or fabricated charts.

On desktop, the stage fills the screen while date geometry remains readable. On phones, keep one clear central date and partial neighbors. Do not shrink the desktop composition until labels become unreadable.

Input contract:

- Horizontal dragging and arrow controls select a date while vertical gestures continue to scroll the page.
- A real click, Enter or Space activates the selected date once. Tab only moves focus.
- Previous/next buttons provide an alternative to dragging. A completed drag must not produce an accidental activation click.
- Separate activation from `onValueChange`: the upstream component also changes its value during drag settling and keyboard selection.
- Do not nest interactive controls inside the date's button.

Distinguish visitor-local today, fixed edition publication date, and source-review date. Handle server rendering, hydration, day changes and tab reactivation. If no edition exists for today, keep today as the entry and state the latest available edition's real date before and after opening. Do not imply that empty dates contain published cards. Future editions must not leak before their release. If no content is eligible, provide a concise honest empty state and a route to Atlas.

## 7. Date to KnowledgeDealer

Keep the date as a visual reference as it becomes the table's quiet title. The card surface opens into the viewport and the hand emerges from a known deck location. Move the surface/frame rather than magnifying text glyphs through large scale changes.

Initial choreography: surface entrance in 220–280ms; card dealing begins roughly 80ms into that entrance rather than waiting for a sequence of animations. Use the existing Dealer arc as a reference: 450–500ms card flight, 35–45ms stagger, capped at a 140ms stagger window. The longer card flight explains a spatial move; controls and semantic state respond immediately.

Deal once per edition within the visit. Reopening restores the previous hand/card/reader instead of replaying the entrance celebration. Different editions retain separate states. An explicit collect/redeal action may remain available.

The reader exposes the idea, caveat and evidence, plus original links and an existing related experiment when available. Show actions such as Open lesson, Try practice and Locate in Atlas only when a valid destination exists. Keep meaningful source and review information near the content.

Treat the surface as a named dialog: fixed reachable close control, Escape handling, managed focus, inactive background, and focus return to the date after its trigger is mounted. Escape first closes the active inner reader where applicable, then the Dealer. Avoid unnecessary nested dialog stacks.

Preserve and restore the background scroll position, including mobile browser behavior. Long reader content can scroll within its reading surface. Closing during a card flight must work immediately, cancel obsolete animations and release all scroll locks and listeners.

## 8. Scene transitions: scroll, fade and blur

Scene progress follows scroll position directly and reversibly. Command transitions follow intentional state changes. Do not add a lagging spring that makes the page catch up with the user's finger. Verify APIs against the installed version. [Motion distinguishes scroll-linked from scroll-triggered animation](https://motion.dev/docs/react-scroll-animations).

For a compact initial composition, target approximately 3–3.6 viewport heights across the three main scenes. Count sticky runway and transition distance together. Avoid stacking long empty holds before every transition. The first scene fills the visible viewport, while text enlargement and short screens are allowed to produce natural content flow.

Give each handoff a local progress value `p` from 0 to 1, independent of graph data. Do not write frame-by-frame progress to URLs or storage. Initial distances: roughly 0.35 viewport height for Timeline → Atlas, and 0.25–0.35 for Atlas → closing.

| Progress | Visual state | Interactive owner |
|---|---|---|
| `p=0` | Timeline settled; Atlas absent | Timeline |
| `p≈0.25` | Temporal decoration retreats; Atlas background emerges | Timeline while its controls remain clearly visible |
| `p≈0.5` | Depth transfers between compositions; one readable information plane | One controlled handoff, never overlapping active control sets |
| `p≈0.75` | Atlas is clear; Timeline is a faint background trace | Atlas |
| `p=1` | Atlas settled, active blur 0, no perpetual animation | Atlas |

Prototype values: Timeline scale 1 → 0.985, Atlas surface 1.015 → 1, a limited 16–24px spatial shift, and optional outgoing decorative blur 0 → 6px. Do not blur the reader or shrink required text. Use the same vocabulary more quietly for the closing transition.

**Contrast while stopped:** separate decorative composition from active labels and controls. Decoration can fade and recede while the active information surface retains readable contrast. Hand off that surface through an opaque backing or a mask confined to empty space. The only readable copy must not become faint gray when scrolling stops midway. A decorative visual duplicate is permissible only if it is noninteractive and excluded from assistive technology; do not duplicate focusable controls or screen-reader content.

Reverse scrolling restores the previous composition without reloading data or resetting graph branches. Explicit scene navigation places focus on the destination heading. Ordinary scrolling does not announce every frame or repeatedly move focus.

Never make a subtree containing focus hidden or inert. If a focused control leaves the active scene, either avoid the conflict through the semantic layout or perform one deliberate focus handoff at the boundary. Mount and expose the destination heading first and use focus without automatic scrolling for a scroll-induced handoff. Test against jump loops. Visibility, pointer events and tab order must follow actual availability; `opacity:0` alone is insufficient.

Keep natural scrolling. Do not add global smooth-scroll interception, mandatory snapping, or wheel-based graph zoom that captures normal page navigation.

## 9. Atlas: an intelligent graph with progressive detail

The Atlas must provide both complete resource access and meaningful conceptual exploration. Its default visible neighborhood stays small enough to understand, while the underlying indexed knowledge and coverage extend across the entire eligible site.

Use a stable 2D composition with three visual scales:

1. **Overview:** domains and meaningful knowledge regions, a quiet search entry and an optional goal entry. Public professional/site information remains discoverable through a secondary entrance.
2. **Concept neighborhood:** a selected concept anchors the view; reviewed relationships, relevant resources and possible directions are progressively revealed. Keep the user's origin and previous scope visible.
3. **Evidence/detail:** selecting a concept, resource or edge reveals its definition, meaning, source, review state, actions and the reason it is shown.

Domain/topic containment is useful orientation, but it must not replace the semantic graph. Show cross-domain bridges only when evidenced and reviewed. Use semantic zoom to change the information presented at each scale, not merely enlarge identical circles. Keep stable IDs and predictable positions across transitions. Avoid a constantly running force simulation that rearranges the learner's mental map.

An initial desktop composition may reserve roughly two-thirds of the width for the graph and up to one-third for selected details. Reclaim space when details close. On phones, use a focused neighborhood with readable choices and a detail surface below or in a deliberate reading panel. Do not compress a desktop side panel into unreadable columns.

Initial visible choice budgets: roughly 6–10 on desktop and 3–5 during deeper phone exploration. Expose omitted choices through explicit counts, Show more, search and the complete list view. Never silently discard data to meet the visual budget.

Shape language can use an outer ring for a group, a clear selected core and spatial containment for collections. Semantic edges must be typed, directional where appropriate and explainable. Size, glow or position must not imply unmeasured mastery or evidence strength.

## 10. Required intelligent behavior

The graph's intelligence must be observable in decisions, not just in appearance:

- **Explainable next steps:** recommend a small relevant set and state why each appears, using eligible relationships, current selection, an explicit goal and available progress signals.
- **Goal routing:** help the learner inspect a proposed route to an intended outcome, with the route's assumptions, prerequisites, resource coverage and gaps visible. Explain alternatives rather than asserting a universally optimal path.
- **Cross-domain bridges:** reveal supported connections between domains when they help the current task, with the claim and evidence accessible.
- **Evidence inspection:** selecting an edge answers what the connection means, in which direction, under what conditions and from which sources.
- **Context continuity:** preserve the current concept, path, filters, originating edition and return destination across exploration and resource navigation.
- **Graceful uncertainty:** unsupported connections, unresolved ambiguity, conflicting sources and incomplete coverage remain explicit. Missing evidence is not filled with a confident-looking line.
- **Progress-aware orientation:** distinguish visited, started, completed, result and unknown using existing stores. Page visits do not establish mastery.

Use the ranking, relationship and path rules in [INTELLIGENT_ATLAS_SPEC_EN.md](INTELLIGENT_ATLAS_SPEC_EN.md). Intelligence can be deterministic and explainable at runtime; a paid or network-dependent LLM is not a default requirement. If an authoring-time model assists extraction, its suggestions remain candidates subject to evidence and review.

For graph traversal, interpret relation types explicitly. A prerequisite edge and a recommended learning direction can point in opposite traversal directions; label the view correctly without mutating the stored scientific assertion. Do not treat every relation type as a prerequisite or every shortest path as a valid curriculum.

## 11. Atlas interaction contract

| Action | Immediate result | Motion and recovery |
|---|---|---|
| Hover/focus | Restrained emphasis and an optional short summary | Equivalent information remains available through selection/touch |
| Select a gateway, concept or topic | Select and preview; do not automatically expand everything | Stable identity and visible context |
| Explore | Reveal the explicitly chosen collection/neighborhood | Anchor shifts in approximately 220–280ms; previous context stays in the breadcrumb |
| Select an edge | Explain its type, direction, conditions and evidence | Highlight only the relevant relation and endpoints |
| Select a resource | Show type, source, status and valid actions | Reader enters in 180–240ms and exits in 120–160ms |
| Open content | Navigate to the real destination | Preserve a valid bounded return context |
| Where next? | Present a small set with an explanation for each option | Distinguish semantic connection, editorial sequence and topic association |
| Choose a goal | Highlight an existing supported route and its gaps | Optional; canceling a goal does not erase progress |
| Search | Results include scope, type and status | No travel/stagger on each keystroke; clearing restores prior context |
| Back/breadcrumb | Restore scope, selection and expanded branches | Quicker than an initial reveal; no repeated celebratory flight |
| List view | Same indexed resources, selection and actions | Switch without losing state |

Opening a path means revealing available choices. Do not introduce new locks that force a test before browsing a destination. Published prerequisites may be explained with evidence; existing editorial ordering remains labeled as such.

The date-to-graph signature: Locate in Atlas closes the daily surface, resolves the correct resource/concept/topic destination and moves to Atlas. One arrival ring, around 240–320ms, acknowledges the destination and settles. Do not draw an invented semantic edge from a card to an unpublished concept. Returning restores the edition and card.

## 12. Interaction timing and accessibility

| Interaction | Starting value | Purpose |
|---|---|---|
| Button/gateway press | 80–120ms, scale around 0.97–0.98 | Acknowledge input; execute immediately |
| Selection/label change | 100–160ms local color/opacity | Clarify current state |
| Dealer surface opening | 220–280ms | Enter the space the learner requested |
| Card flight | 450–500ms, 35–45ms stagger capped at 140ms | Move from deck to hand once per edition per visit |
| Neighborhood expansion | 220–280ms, 20–35ms stagger capped at 120ms | Explain continuity and reveal nearby choices |
| Search, repeated return, keyboard commands | Immediate, or opacity no longer than 100ms with no travel | Keep repeated work responsive |
| Reduced motion | Immediate or 0–100ms opacity | Preserve the same state without spatial travel, rotation or animated blur |

Reuse existing motion tokens where appropriate, including `EASE_OUT = [0.16, 1, 0.3, 1]`. Do not add another easing library. Retarget interrupted motion from its current presentation rather than restarting from zero. State changes first; animation expresses it.

Optional pointer response is subtle and confined to a decorative desktop surface. Never move click targets away from the pointer. Disable it while dragging/pressing, for touch input and reduced motion. Avoid simultaneous tilt on every node or perpetual attention-seeking pulses.

Reduced motion applies to CSS, custom effects, blur, parallax and prolonged pinning as well as Motion components. The experience retains clear selection and meaningful information. [Motion accessibility guidance](https://motion.dev/docs/react-accessibility).

Keyboard requirements: semantic controls, visible focus, logical order, Enter/Space activation, usable Escape behavior and an equivalent list/explanation for every essential graph operation. Touch must not depend on hover. RTL layout may adapt, while relationship direction and numerical meaning remain unchanged.

## 13. The concise closing

After Atlas fades out, show one explanatory sentence, a primary practice action, a genuine resume action when a resumable session exists, and small About/source/contact/appearance links. Aim for half a viewport to one viewport depending on text length and enlargement.

Large Learn and Certificate homepage gates become destinations within the Atlas. Existing idea details, experiments and the archive remain accessible within their context or existing routes. Preserve `#today`, `#archive` and `?insight=...` with meaningful behavior and provide a direct Atlas entry. A new standalone `/atlas/` route is optional future scope; the same explorer should be reusable if requested.

Do not fill space with counters. Any number shown must come from a defined current measure and carry a meaningful unit.

## 14. Identity, coverage and publication contracts

Build the derived index from all eligible source families: Fabric/DP-600/Academy/RTI, Power BI, SQL, statistics, visualization, Python, Excel, analytical foundations, insights, practice, references and other intended public pages. Reviewed and unreviewed material must retain their distinct policies.

Preserve original IDs, routes, query parameters and anchors. One resource can have several placements without becoming several identities. R11 is an overlay on existing questions, not an additional question copy. LINK_ONLY material remains descriptive metadata and a link. Discovery, full-text display, assessment and semantic publication are separate capabilities.

Produce a coverage manifest mapping every eligible item to an Atlas placement, alias, documented exclusion or unresolved gap. **No unexplained eligible public orphan** is a completeness gate. State the denominator and avoid claiming full coverage if inaccessible inputs remain. Account separately for structural discovery, semantic analysis, evidence verification, publication and rendered visibility.

The initial page carries compact metadata; load branch/detail chunks as needed. Do not serialize all question bodies, answers and reference texts into the first viewport. Missing chunks need a meaningful error/retry/list fallback.

Only the public semantic projection can enter the public Home payload. Test accidental preview environment settings. Candidate concepts and relationships can be inspected in an explicitly marked local review environment, with publication controls preserved. Building that review graph and its evidence queue is required work, even while public publication is pending.

## 15. Architecture and future readiness

The mandatory [future extension contracts](FUTURE_CONTRACTS_EN.md) define the minimal seams. Implement the following ownership boundaries:

| Part | Owns | Must not take over |
|---|---|---|
| Home composition | Scene arrangement and public presentation inputs | Assessment correctness or raw source ownership |
| Scene motion | Scroll progress and visual transitions | Publication decisions or learning-progress writes |
| Timeline | Temporal selection and activation | Scientific eligibility decisions |
| Dealer session | Opening context, chosen cards, reader and return | Answer approval or generation of domain claims |
| KnowledgeDealer | Hand geometry, card presentation and input | Loading every source or governing publication |
| Resource index | Identity, placement, discovery and eligible links | Automatically declaring prerequisites |
| Semantic graph | Typed reviewed assertions and their evidence | Treating all catalogue membership as scientific relationships |
| Recommendation/path layer | Explainable eligible choices and route reasoning | Hidden mastery inference or unsupported claims of optimality |
| Progress adapters | Faithful read-only interpretation of existing stores | Rewriting existing results or turning a visit into mastery |

A new content type or Deck context should enter through a small explicit adapter without rewriting the Home shell or scene choreography. Avoid a speculative plugin marketplace, CMS, runtime code loader or universal state framework. Build boundaries justified by a present use or a specific extension scenario.

Keep one owner per state: URL for shareable selection, session state for temporary presentation, and original learning stores for their progress. Avoid competing `popstate` handlers or effects rewriting the same parameters. Return destinations must be bounded valid internal contexts; external source links do not become arbitrary return URLs.

## 16. Likely implementation areas

These are ownership areas to inspect, not instructions to create duplicate modules:

| Existing area | Expected responsibility |
|---|---|
| `components/knowledge/hansa-landing.tsx` | One composition entry for both homepage addresses |
| `components/knowledge/insight-stage.tsx` | Split scene/state responsibilities instead of growing one large component |
| `stage-today.tsx`, `insight-rail.tsx` | Full Timeline adaptation and separate activation |
| `knowledge-dealer.tsx`, `insight-scene.tsx`, `knowledge-instrument.tsx` | Reusable daily presentation, reader and existing experiment |
| `lib/knowledge/models.ts`, `insights.ts`, `motion.ts` | Original card preparation, eligibility and motion tokens |
| `lib/study/*`, `lib/search/*` | Corpus discovery, classifications, existing ordering and search inputs |
| `lib/atlas/*`, `components/atlas/*` | Graph schema, public projection, evidence, exploration and safe return behavior |
| `components/site-header.tsx`, `site-footer.tsx` | Home/alias-specific presentation while other routes remain usable |
| New narrowly scoped analysis/adapters if required | Extraction records, entity crosswalks, graph build artifacts and typed contracts |
| Scoped Home styles | Composition, layers, responsive behavior and reduced-motion states |

React should own semantic DOM and application state; SVG can handle a bounded neighborhood's connections; CSS provides composition; existing Motion provides interaction. Compare any additional layout/graph package against a specific missing capability, accessibility, static export and measured cost. Do not install technology merely because it is associated with knowledge graphs.

Inspect live beUI source, license and actual dependencies before copying; record provenance and adaptations. Do not copy preview content. Do not silently upgrade Next, React or Motion as part of this task.

## 17. Performance and lifecycle

Favor transform and opacity for movement; measure filters, clipping and masks on actual hardware. Blur is not a hardware-acceleration guarantee. Write CSS variables only to the layer needing them rather than a root containing hundreds of descendants. Avoid React state updates for each scroll pixel, layout read/write thrashing and unnecessary continuous simulations. Clean up observers, animation frames and listeners. [Motion performance guidance](https://motion.dev/docs/performance).

Keep viewport geometry stable through transitions and account for resize, orientation, safe areas and phone keyboards. Long details and short screens fall back to natural reading flow instead of clipping into `100vh`. Wheel zoom must not steal ordinary page scrolling.

Measure production initial payload, HTML/JS size and interaction responsiveness before setting final budgets. Report before/after with conditions. Required structural outcomes include compact initial data, bounded visible graph neighborhoods and no unnecessary offscreen animation. Do not claim frame-rate or Core Web Vitals success without measurement.

## 18. Storyboard and prototype

After whole-corpus analysis has established the model, create five frames from one coherent visual system and implement a reviewable journey:

| Frame | What it must prove |
|---|---|
| First entry | Timeline fills the viewport, centered date, depth and minimal controls |
| Open day | Dealer, readable cards/reader, close control and source/review state |
| Mid-transition | Understandable temporal-to-knowledge handoff with readable stopped-state contrast |
| Explored Atlas | Selected concept/resource, typed relationship and evidence, optional route/next step and recoverable context |
| Closing | Compact practical information and genuine practice/resume options |

Use real content. A local candidate-review prototype may display clearly labeled evidence-backed candidates; a public preview must respect publication eligibility. Explain the prototype's coverage limits in its delivery notes, not through intrusive implementation labels throughout the product UI. Every displayed control works for the sample or clearly communicates unavailability.

Include phone treatments for entry, Dealer and explored Atlas at minimum. Test zero/one/multiple editions, sparse/dense neighborhoods, no published relations, conflicting/unresolved candidates in review mode, missing resources and route gaps. Inspect the composition without animation; it should remain distinctive and understandable. Record at least two concrete observations from the first visual review and resulting revisions, then examine motion at 10% speed and normal speed.

## 19. Execution phases and outputs

| Phase | Deliverable | Completion gate |
|---|---|---|
| A — Baseline | Ownership, status/hashes, route/progress baseline and current test outcomes | Pre-existing failures and concurrent work are identified |
| B — Complete corpus analysis | Recursive source/coverage ledger, semantic extraction, canonical identities, evidenced candidates and review queue | Entire eligible corpus accounted for; sampling is not reported as complete analysis |
| C — Graph contracts and design | Typed graph/resource model, explainable routing/ranking rules, storyboard and separate prototype | The prototype demonstrates knowledge relationships and choices, not merely folder drill-down |
| D — Complete vertical journey | Date → cards → graph context → resource → return, including evidence inspection | Selection, activation, interruption, focus and history work |
| E — Coverage and application integration | All eligible sources, graph build pipeline, Home scenes, compatibility links and future seams | No unexplained orphan or duplicate identity; publication status remains accurate |
| F — QA and delivery | Preview, screenshots, motion recording, evaluation results and rollback instructions | Acceptance matrix and Atlas-specific tests have explicit outcomes |

For a full implementation commission, continue through F. Do not finish at D and claim the entire graph/site is integrated. Candidate extraction, review preparation and semantic intelligence are part of the present Atlas work; future optional features such as goal-specific Deck sessions remain governed by the extension appendix.

## 20. Acceptance matrix

| ID | Scenario | Required result |
|---|---|---|
| V01 | First opening at 320/390/768/1280/1440px | Timeline only, full viewport, no unwanted overflow or next-scene sliver |
| V02 | Light/dark and accent changes | Coherent identity and readable controls; existing preference honored |
| V03 | 200% text enlargement and short landscape | Readable and reachable content with natural-flow exceptions |
| T01 | Drag and release Timeline repeatedly | Selection changes without accidental Dealer opening |
| T02 | Click, Enter and Space | Exactly one correct activation |
| T03 | Missing today's edition, empty feed, old ID, day rollover | Honest available fallback without invented content |
| D01 | Open/close during card flight ten times | No stranded cards, duplicate handlers or retained scroll lock |
| D02 | Close inner reader then Dealer | Focus returns to card, then mounted date trigger |
| D03 | Reopen/switch/return between editions | Per-edition session restored without content leakage |
| M01 | Stop at p=0/0.25/0.5/0.75/1 for both scene transitions | Readable active content and no invisible active controls |
| M02 | Reverse or rapidly change scroll | Reversible composition without state reset or intentional lag |
| A00 | Select then Explore | Selection previews; Explore expands once; hover/Tab do not expand |
| A01 | Scope → concept/resource → destination → Back | Selection, branches, route and origin restored |
| A02 | Search, no result, clear and list view | Consistent results, full eligible coverage and context recovery |
| A03 | Zero published relations plus accidentally enabled review environment | Public catalogue remains usable; unpublished graph content does not leak |
| A04 | Coverage reconciliation | Every eligible public resource is mapped or explicitly accounted for |
| A05 | Multiple placements and R11 overlay | One original identity/progress with multiple valid placements |
| G01 | Complete corpus accounting | Structural and semantic analysis denominators, gaps and exclusions are explicit |
| G02 | Inspect an edge or recommendation | Type, direction, conditions, provenance and selection reason are available |
| G03 | Goal route with missing or conflicting evidence | Gaps/limits shown; no fabricated valid route or mastery claim |
| G04 | A supported cross-domain bridge | Correct canonical identities and evidence, not a keyword-similarity assertion |
| G05 | Semantic zoom and neighborhood expansion | Stable orientation, meaningful detail changes and access to omitted items |
| G06 | Candidate extraction and publication boundaries | Evidence queue is complete for candidates; review does not auto-publish |
| S01 | Existing query/hash/alias plus Back/Forward | Compatible behavior or explicit valid recovery |
| S02 | External, oversized, unknown or malformed return input | Safe internal fallback or rejection |
| P01 | Existing progress before/after Home exploration | Viewing does not alter assessment results or learning state |
| X01 | Keyboard and screen reader | Every essential action works with named controls and predictable focus |
| X02 | Touch, orientation and phone keyboard | Natural page scrolling and readable detail surfaces |
| X03 | Reduced motion at load and while running | Large motion/blur/long pinning removed with equivalent information |
| X04 | JavaScript disabled | Dated content fallback and meaningful archive/domain/practice links |
| F01 | Extension scenarios | A provider/type/entry context can be added through explicit seams without rebuilding Home |

Run build, lint, `test:all`, affected suites and relevant Academy tests; do not assume Academy is included in `test:all`. Run applicable reference, Atlas, EasyUI and canonical-home verifiers. Preserve publication and content-preservation tests. Automated accessibility checks do not replace screen-reader, touch and visual inspection. Apply the additional graph evaluation requirements in the Atlas specification.

## 21. Definition of done and delivery evidence

Deliver changed files/routes and rationale, source coverage, graph build and review artifacts, actual beUI provenance, technology/cost decisions, five scene screenshots, phone and theme variants, and a short recording of transitions, graph exploration, evidence inspection and return behavior.

Report PASS/FAIL/NOT RUN/BLOCKED separately for structural coverage, semantic extraction, evidence verification, publication readiness, graph reasoning, unit/build checks, browser behavior, visual review, accessibility and performance. A successful build is not proof of a correct or usable knowledge graph.

State material gaps plainly: unavailable sources, unresolved concepts, unsupported relations, pending publication, untested devices or pre-existing verifier failures. A complete candidate graph with pending human review and a public semantic release are different milestones; neither should be mislabeled.

Rollback applies only to files owned by this task and its recorded snapshots. Preserving URLs, original IDs, source content and progress is a separate gate from visual quality.

## 22. Preparation status and known baseline issue

This English version is an expanded planning handoff. It does not establish that whole-corpus semantic analysis, a new graph or the new interface has already been completed.

The earlier 31 October reference-verifier run failed at the pre-existing drift in `lib/atlas/field.ts`: actual `da571a671ce66a538f6050e6fe8d8ae3caf6b5e4a4befe6ea184e598a9d8af95`, expected `79f985b31e5010a8ad2c910c45bd934bc34841217881fdca9273e991790001ff`. An early failure does not validate the remainder of the verifier chain. Recheck this baseline, establish ownership and record a legitimate successor; do not merely replace an expected hash to silence the check.

The proposed UI, choreography and graph intelligence have not been runtime-validated in this planning task. Their application, browser, device, performance and scientific verification status is **NOT RUN**. No dependency, external runtime service or deployment is added by this guide.
