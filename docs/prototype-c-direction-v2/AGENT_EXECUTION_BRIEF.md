# Implementing-agent brief — Hansa Prototype C V2

## Your assignment
Implement the visual and motion direction in `DESIGN_AND_MOTION_SPEC.md` after receiving this handoff. The documentation-producing task has **not** implemented V2. The owner rejected the earlier flat `/prototype-c/` as a design result. Treat that version as a functional proof and preservation reference, never the target to polish by adding a gradient and shadows.

Do not deploy. Do not rewrite historical question banks, IDs, answers, learner state, Atlas review state, professional pages or unrelated dirty work. Do not use exploratory drawings as ready application source. Do not infer unavailable artwork from the old conversation's opaque references.

## Relevant actual source and evidence
| Need | Existing source / inspection target |
|---|---|
| Current functional exploration | `components/knowledge/knowledge-stage.tsx`, `prototype-c.tsx`, `app/prototype-c/page.tsx` |
| New insight authority | `content/knowledge/insights.json`, `lib/knowledge/insights.ts`; three technical-review examples, no human publication approval |
| Existing themed tokens/fonts | `app/globals.css`, `app/layout.tsx`, shared UI primitives and `lib/ease.ts` |
| Current shell | `components/site-header.tsx`, `site-footer.tsx`, `lib/site.ts` |
| Atlas truth/projection | `lib/atlas/model.ts`, `server.ts`, `components/atlas/peek.tsx`; reuse identity/projection, rework view only as authorized |
| Question/progress boundaries | `lib/fabric/storage.ts`, `engine.ts`, `additions.ts`; do not modify for this design |
| Existing preservation snapshot | `docs/prototype-c/preservation/`, `INTEGRATION_MANIFEST.json`; historical snapshots stay immutable |
| Concurrent R11 work | `docs/prototype-c/CONCURRENT_WORK.md`, `docs/dp600-r11-integration/`; establish fresh current status and do not overwrite shared receipts |
| Component references | Live beUI MCP slugs `timeline` and `card-dealer`; source retrieved in the documentation session, recheck current upstream payload before adoption |

Upstream Timeline supports controlled value/events, measured item width/height, optional ruler/years/cables, date/year formatters. Upstream Card Dealer supports stable card IDs, zone transitions and custom faces/backs; its demo playing cards are not Hansa content. Source inspection is not compatibility, runtime or accessibility proof. Preserve licence notices if copying free upstream code; inspect all imports. Existing package declares `motion`, not a blanket permission to add another animation package.

## Execution order and reviewable slices

### Slice 0 — freeze reality
Prove actual repo access; read current parent/root/nested AGENTS; capture status/HEAD and hash all existing sources before editing. Record new owner/concurrent changes since the old baseline. Inspect current build, local/deployed state and existing component source. Do not reset/stash/clean the checkout. Keep the earlier functional prototype available until the successor is usable.

Deliver before coding: proposed changed-file list; canonical data/ID contract; motion state diagram; measured target geometry; upstream/source/licence audit; status of historical gates. Any unresolved inherited drift remains explicit, never hidden in a new global hash allowlist.

### Slice 1 — build the still composition
Implement the V2 visual stage with static placeholder **objects**, using the actual canonical sample text rather than fabricated facts. Establish 1440 and 390 compositions, surfaces, plane hierarchy, rail geometry, tray and full card reader before adding animation. “Placeholder object” means a clearly labelled design frame, not made-up learning content.

Review stills against V1/V2/V6: the interface must have depth with animations disabled. A nested border around the old flat grid does not satisfy this slice. Check readable text/contrast and 320px reflow. Do not spend this slice decorating Work/Experience, adding a new graph engine or rebuilding every global page.

### Slice 2 — implement kinetic date selection and reveal
Adapt the Timeline's actual mechanics to the condensed rail. Use controlled insight identity; URL and Back/Forward remain canonical. Build the scenario/revealed/evidenceOpen state transitions with interruption, reduced-motion and keyboard behavior from the spec. Keep the reading title anchored. Render initial content statically, enhance after measured layout.

Deliver a recording of date selection followed by reveal/evidence/reset and a rapid-selection test. Functional tests must confirm state pairing, focus and URL recovery; visual review confirms the intended motion.

### Slice 3 — implement actual Card Dealer
Implement stable `deck → hand → reader → hand → deck` transitions. Prefer audited local adaptation of actual beUI source; document deviations where knowledge-card dimensions and accessibility require changes. Use at most 3 cards in the initial hand. Implement full content in the selected reader, not nested interactive controls inside a whole-card overlay button.

Deliver a normal-motion recording, a keyboard/list equivalent, reduced-motion view, collect/redeal and resize-while-moving evidence. A “next” button changing text inside one box is an explicit failure.

### Slice 4 — contextual Atlas and discovery
Retain canonical publication gates. If public relationships remain empty, keep an honest quiet bridge and do not add graph illustration. If eligible published data exists, render the small semantic neighbourhood with evidence labels and text equivalent. Complete archive/search/topic/reset/permalink flow, avoiding header/toolbar clutter above the stage. Reuse existing global search and legacy destinations.

### Slice 5 — integrated QA and handoff
Run build, lint/type checks, configured suites, content/publication gates, scoped browser interactions, axe, touch/keyboard/reduced-motion, all specified responsive sizes and screenshot/recording review. Verify all old source IDs/answers/progress contracts unchanged by this design. Reconcile shared successor receipts safely after concurrent work settles.

Report visual gates V1–V10 separately from functional tests. Present a local review URL, screenshots and short recordings. Keep source-checked versus human-approved versus published distinct. Deployment requires a later explicit owner instruction; no build flag, passing test, local review or this brief authorizes publication.

## State responsibilities
| Module | Owns | Must not own |
|---|---|---|
| `InsightRail` proposed | selected edition + geometry/gesture state | content publication, artificial dates |
| `InsightScene` proposed | scenario/reveal/evidence view | exam grading, persistent mastery |
| `KnowledgeDealer` proposed | card zones, selected card, interruption/placement | second factual content bank or progress migration |
| `InsightReader` proposed | focused card's readable details/actions | nested card-overlay interactions |
| `ContextAtlasPeek` proposed | bounded view of canonical projected data | draft-to-public transitions or invented edges |
| `InsightArchive` proposed | local query/topic/result display | separate public search authority |

These are proposed module names for responsibility clarity, not claims that files already exist or a mandate to create one giant universal renderer. Match actual repo conventions and reuse suitable primitives.

## Technical constraints
- Next static export, assets-only hosting. No server runtime, account, analytics, paid services or remote LLM generation.
- No package installation until inspected source establishes a distinct need. Motion and geometry do not require WebGL or a new graph engine by default.
- No browser APIs at module evaluation/prerender. ResizeObserver/pointer handling behind client effects; clean up animations/listeners and pointer capture.
- Store durable meaning in IDs/state, transient movement in animation values. Never let motion completion determine truth or progress.
- Avoid `transition: all`, blur on body text, repeated layout measurements per pointer frame, giant global client boundaries, or rebuilding the entire page on every drag tick.
- Use static/no-JS content and equivalent list/reduced-motion modes; do not replace the normal rich experience with the fallback for everyone.
- The earlier subjective score table is superseded for V2. Reassess alternatives against the owner's actual visual objective; disclose trade-offs without declaring a flat option “97/100” by assumption.

## Deliverables from the implementing agent
1. Fresh source/preservation inventory and scoped before/after manifest.
2. Working local V2 with five-item IA and preserved old routes/pages.
3. Desktop/mobile light/dark screenshots and scene recordings.
4. Motion-state/interruptibility, accessibility and responsive test evidence.
5. Source/publication gate evidence and an honest empty-state demonstration.
6. Exact rollback bytes and controlled inverse-merge guidance for the current dirty checkout.
7. A final report that clearly separates implemented, visually accepted, tested, untested and blocked items.

No automatic rollback of the old functional work is requested by this documentation brief. The owner may decide what to retain after reviewing a V2 implementation. Until then preserve it and its historical reports, clearly marked as rejected visual direction.
