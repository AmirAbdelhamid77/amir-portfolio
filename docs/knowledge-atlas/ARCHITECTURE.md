# Proposed implementation architecture — HKA-LOCAL-001

Accepted preparation decisions: static-first, renderer-independent adapters, canonical identities, separate structure/semantics/progress and fail-closed publication. Exact renderer/layout and production schema extensions remain proposals.

## Existing reuse points

| Path | Reuse boundary |
|---|---|
| lib/academy/ingestion.ts; components/academy/ingestion-lab.tsx | Lesson/source/assessment IDs; future contextual Peek without grading/state changes |
| content/fabric/index.json; lib/fabric/data.ts; pack-loaders.generated.ts | Lazy index and per-pack bodies; do not load all questions for Peek |
| lib/fabric/types.ts; engine.ts; storage.ts | Keep internal id, original sourceId, pack, QA/provenance, scoring, manifests/deadlines |
| components/fabric/explorer.tsx | Actual /lab/dp-600/explore/?question=<internal-id> contract |
| lib/search/documents.ts; query.ts; components/search | Reuse search UI/ranking; future published-concept shard, no candidate claims/answer keys |
| lib/catalogue.ts; lib/site.ts; app/sitemap.ts | Discovery points; add only implemented routes later |
| lib/statistics/content.ts; components/statistics/concept-atlas.tsx; visual-registry.tsx | Retain section/journey links; prerequisite edges require fresh evidence review |
| lib/data-viz/content.ts; content/data-viz | Existing EN/AR lessons, chapter hierarchy and sources |
| components/ui.tsx; components/fabric/ui.tsx; components/breadcrumbs.tsx | Container, panels, tables, callouts and location conventions |
| components/motion/command-palette.tsx; lib/command-search.ts; lib/hooks | Reuse search/overlay capabilities after focus audit |
| app/globals.css; lib/ease.ts; lib/presence-gate.tsx | Shared semantic light/dark tokens and motion |

## Domain and static delivery

1. Immutable sources stay in handoffs/source trees outside public/. Reuse Academy page extraction/traceability; original and corrected teaching remain separate.
2. Future content/atlas editorial inputs: sources, catalog/TOC, canonical concepts, semantic assertions, reviewed content-concept mappings, coverage, journeys and redirects. These are logical stores, not mandatory separate databases/files. Start with one versioned JSON document and split when measured size justifies it.
3. Future lib/atlas/types.ts, validate.ts, selectors.ts and adapters/: pure domain independent of React/renderer. Adapters read existing metadata, never rewrite banks or progress. Split/merge/alias decisions are reviewed and migration-versioned.
4. Future scripts/build-atlas.mjs: validate, project only published concepts/edges/reviewed attachments, generate deterministic small search/scoped neighborhood shards. Never copy editorial input wholesale into public output. Check source excerpt rights and visibility.
5. Future components/atlas: Peek, Explorer, concept/relationship Inspector, Navigator/TOC, complete LinearConnections, controls and URL state. No heavy renderer imported by site layout. Peek may use HTML/SVG; Explorer is lazy at explicit client boundary. ssr:false belongs inside a Client Component. Preserve static/no-JS explanatory navigation.

Proposed /learn/dp-600/atlas/ is a static page, with client query state: v=1, scope, concept, lens, hops and relation allowlist. Proposed max encoded state 2 KB; reject unknown parameters/IDs/version with useful recovery. Validate same-origin allowlisted return targets. No answers/scores/journals/private paths in URLs. Keep basePath/trailing slash, Back/Forward, selection, focus and scroll. View Reset never clears progress.

## Production V1.1 contract work before real authoring

Preserve starter schema as immutable evidence; author one versioned production schema later.

| Gap | Required addition/rule |
|---|---|
| No build identity/source revision pin | buildVersion, source edition/hash and assertion revision, timestamp/freshness rules |
| Mapping vs resource publication conflated | Separate reviewed crosswalk: existing ID/bank/version, concept IDs, mapping evidence/status |
| Journey/objective sequence vs semantic prerequisite | Separate ordered steps/objective metadata; never convert order/tags into graph edges |
| Conditions/support optional | Nonempty conditions for enables/tradeoff/decision/mechanism; support-kind/limitations |
| Weak publication gate | Published endpoint definitions, verified sources, non-pending/non-disputed evidence, reviewer/date; human domain review still essential |
| Hierarchy cycles/multiple sources | Parent existence, acyclicity, source/edition ownership/order; attachment multi-source refs |
| Duplicate symmetric assertions | Normalize symmetric pairs; inverse labels; scoped claim key distinguishes legitimate claims |
| Aliases and source overlap | Collision-checked alias/redirect table; no duplicate concept solely for another resource |
| Public/private boundary | Explicit allowlist projection, rights checks, no private candidate/QA/progress records; build-version cache invalidation |

Preparation validator checks starter shape and core reference/publication invariants. It is not a production exporter or complete scientific workflow. No sample assertion is publication-approved.

requires_understanding_of(A,B) points from the learned concept to its prerequisite. Default focus follows stored direction; incoming dependants require explicit labeled mode. Symmetric edges traverse both ways. Filters: AND across independent facets, OR within a multiselect facet; visible active chips/caps/hidden counts. TOC scopes concepts through reviewed crosswalks without generating edges. Co-occurrence and search matching never establish semantic relationships.

Learning overlay reads existing stores only after hydration; no score/journal duplication. Wrong answers do not alone prove failed mastery. Missing mapping says “mapping pending review.” Proposed hansa-atlas-views-v1 would hold safe contexts only after schema/size/error review; no key created here. Existing Statistics state remains untouched.

## Contextual Hybrid and creative framework

Preserve compact Peek → optional Kumu-inspired Full Explorer → Guided Learn/Explore/Practice/Reflect, with actual available attachments only. Mobile defaults to searchable list/drill-down with optional map and Inspector sheet. Keyboard/screen reader path covers concept selection, exact edge conditions/evidence, content and return. Desktop may dock TOC/Inspector; shapes, clusters, palette, breakpoints and transitions remain open to design exploration. Motion preserves orientation, is interruptible and becomes instant under reduced motion; canvas browse-only, with buttons instead of mandatory dragging/pinch.

Compare native HTML/SVG with existing controls against React Flow; consider D3/canvas/layout engines only if measured need justifies them. Apply existing 30/25/15/15/10/5 rubric and hard semantic/static/a11y blockers. Do not fabricate benchmark scores. SVG reduces pilot dependency cost but needs custom controls; React Flow may reduce interaction engineering while adding package/CSS/a11y work. None is mandatory or permanently banned.

Live beUI investigation, 25 October: MCP search found adaptive-stepper (numeric, unsuitable as a journey sequence control). Other MCP searches became unavailable; official docs/registry and bottom-sheet/command-palette item sources were retrieved through web fallback. Bottom-sheet uses Motion and shared helpers, but future adoption needs focus containment/restoration and non-drag tests. Command palette overlaps existing local implementation; reuse local first. Collapsible item retrieval was unavailable. Registry/source inspection is not license/a11y certification; verify those and resolved versions at adoption.

Official references: [agent guide](https://beui.dev/docs/ai-agents), [registry](https://beui.dev/registry.json), [bottom-sheet source](https://beui.dev/r/bottom-sheet.json), [command-palette source](https://beui.dev/r/command-palette.json). No code copied or installed.

Future proposed budgets: Peek 3–6 neighbors; Explorer 1-hop default, 40 nodes/80 edges cap with honest expansion notices. Test pilot/500/2,000 concepts, actual JS/layout time/long tasks/mobile and CWV where measurable; revise budgets with usability evidence. No current performance claim.

Zero new dependency, paid component, backend, telemetry or runtime bundle change.
