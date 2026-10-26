# Hansa Knowledge Atlas — Master Product, Design & Engineering Specification

**Document ID:** HKA-MASTER-001  
**Version:** 1.0 · 25 October 2026  
**Status:** Approved product direction; implementation not authorized by this document alone  
**Primary audience:** Codex, Claude Code, other implementation agents, designers, QA reviewers and Hansa maintainers  
**First deployment target:** Existing Hansa portfolio, with an initial *DP-600 Guide Knowledge Atlas*  
**Source of authority:** This specification for Atlas product intent; the live repository's `AGENTS.md` and current code for actual architecture, conventions and commands. Resolve contradictions explicitly, not silently.

> **One-sentence brief:** Build an accessible, credible, Kumu-inspired, context-sensitive *semantic knowledge exploration layer* for Hansa: a compact Atlas Peek inside content; a rich, optional full-screen Explorer; and a guided learning journey, backed by a reusable, source-traceable content graph that can grow to multiple books, learning tabs, question banks, labs and projects.

---

## 0. Mandatory invariants and scope

### Hard requirements, never trade away

1. **Knowledge connections, NOT structural connections.** Every drawn edge in the Atlas canvas must represent an explainable **semantic/knowledge relationship**. Examples: concept A is a prerequisite for understanding B, concept A contrasts with B, A enables B in specified conditions, A and B form a meaningful decision trade-off. Prohibited as drawn edges: `contains`, `chapter_of`, `book_has_section`, `section_has_topic`, `question_belongs_to_bank`, or arbitrary co-occurrence. Book hierarchy lives in metadata, table of contents, breadcrumbs and search filters; it is **not** an Atlas edge. See `CONTENT_MODEL_AND_GOVERNANCE.md`.
2. **Contextual Hybrid** is the chosen interaction strategy. Reading/learning pages stay first-class. Atlas is a *contextual Peek* with an optional full Explorer; a Guided Journey helps users follow and apply the knowledge. No graph-first gate to reach content.
3. **One canonical knowledge model, many lenses.** Views filter/highlight/arrange knowledge; no independent graph copies per tab or book.
4. **DP-600 Guide first, Hansa-wide Atlas later.** Do not rebuild the overall landing page now or force an all-site global graph into the initial release.
5. **Growth is part of the contract.** Allow more books, learning tabs (Data Visualization, Data Storytelling, Statistics and future subjects), question banks, questions, labs and projects without wholesale rewriting.
6. **Scientifically defensible semantic links.** Every published semantic edge must have a human-readable, scoped explanation and verifiable provenance. Automatically suggested edges remain quarantined until reviewed; correlation or proximity is not causation.
7. **Preserve the existing site.** No destructive reorganization, data loss, altered canonical question IDs, lost user progress, broken links, unreviewed content substitutions, credential leaks or surprise deployment.
8. **Creativity with purpose.** The implementation agent is encouraged to use superb components, charts, diagrams, immersive transitions and new libraries **when they improve comprehension, orientation or decisions**. No decorative chart, forced animation or expensive dependency without justification.
9. **Accessible and performant as designed.** Provide a usable *non-canvas alternative*, keyboard/screen reader equivalence, mobile-specific interaction and reduced-motion support; target WCAG 2.2 AA.
10. **Declare evidence honestly.** Never imply the entire book has been ingested, validated or published if only a portion has. Never imply that a learning relationship is an official Microsoft exam dependency without a source.

### Explicitly deferred

- Full redesign of Hansa's general landing page, including any global site Atlas.
- Public graph authoring / editing, multi-user accounts, synchronization between devices, analytics tracking beyond a transparent privacy plan, LLM chat directly in the live site, server graph database, paid component acquisitions.
- Fully automated semantic relationship publication; unverified AI-generated graph edges.
- Replacement of article pages, lesson pages, practice workflows or existing site navigation.

### Repository reality check required at execution time

The historical working directory is `D:\BeUI\amir-portfolio`, using Next.js App Router static export and Cloudflare Workers static assets. This is **context, not proof of current repository access**. Before implementation, verify actual path, `git status`, `AGENTS.md`, package/lock files, build/export settings, current routes, deployed behavior, and existing handoffs (including the DP-600 Academy documents in `docs/agent-handoffs/` and `HANSA_DP600_WORK_STARTER_2026-10-25/` if present). Do not assume any file exists without checking. Inventory existing Atlas-like / React Flow / beUI features and avoid duplication.

## 1. Product vision, audience and job-to-be-done

**Positioning:** Hansa becomes an expandable **knowledge ecosystem**, with the Atlas as a navigational/learning intelligence layer, not a replacement CMS or static screenshot.

Primary user jobs:

- **Discover:** "Show the important concepts in this guide and how they are actually connected."
- **Understand:** "Why is a OneLake Shortcut related to Direct Lake, and under what conditions?"
- **Orient:** "Where am I in the original guide?" — answered via TOC/breadcrumb metadata, *not a semantic graph edge*.
- **Act:** "Open the lesson, experiment, lab, verified question, or authoritative source that helps me learn this concept."
- **Recover:** "I failed this exam-style scenario. Which concepts or decision boundaries should I revisit?"
- **Compare:** "Show how two concepts differ, the limits and trade-offs, and where the evidence came from."
- **Grow:** "Add a new book without breaking the Atlas or duplicating canonical concepts."

### Success criteria beyond aesthetics

A first-time user can find a named concept, understand the meaning of at least one connected relationship, open a relevant content page and return to the same Atlas context without losing place. A keyboard-only user can do this without canvas dragging. Adding a second book reuses canonical concepts and adds provenance, rather than creating a second disconnected island of duplicates.

Recommended validation tasks (time/quality observed during usability testing, not invented baseline): locate a concept, explain an edge, access a lesson, resume an Atlas view, distinguish an unreviewed connection, find a subject tab from the normal navigation.

## 2. Information architecture and growth model

Site information architecture remains distinct from Atlas representation.

- **Learn:** DP-600 Academy; future **Data Visualization**, **Data Storytelling**, **Statistics**, and further learning tabs.
- **Library:** books, guides, curated references, editions and source documents.
- **Practice:** question banks, topical practice, challenges, labs, mock exams, review and progress.
- **Projects:** case studies, skills, artifacts and evidence; do not artificially elevate legacy HSE Analytics in the landing experience.
- **Atlas:** contextual insight layer available from eligible entities; later a global site-wide Atlas may aggregate them.

Each content entity may belong to one or more subject domains and may reference canonical concept IDs. Subject is a classification, **not** a graph edge. A new book gains (a) a Book landing and TOC, (b) a *Book Lens* for semantically related concepts evidenced by that book, (c) links to applicable lessons/questions/labs. A subject gains a Subject Lens; a question bank gains concept alignment. Cross-source semantic links are possible only after evidence review.

### Proposed routes (adapt to existing route conventions; never break existing paths)

- `/learn/dp-600/` — continue as normal Academy hub; add a prominent but optional **Explore Atlas** entry.
- `/learn/dp-600/atlas/` — optional standalone Explorer, route subject to repository review.
- existing guide/chapter/lesson routes — embed the **Atlas Peek**, contextual to the current concept(s).
- future `/learn/data-visualization/`, `/learn/data-storytelling/`, `/learn/statistics/` as navigation destinations when content is actually available.
- A future global `/atlas/` is an architectural possibility, **not** part of the initial release.

Avoid misleading published routes, broken empty tabs and invented content. Prefer honest `Coming later` states when needed; do not present unbuilt experiences as live.

## 3. Experience system: three surfaces, one graph

### A. Atlas Peek (contextual inline)

- Optional, compact panel adjacent to article/lesson/question explanation or beneath content on narrow viewports.
- Shows the selected concept, 3–6 relevant nearby concepts by default, and **meaningful, labeled semantic edges**; do not imply all connections are known.
- Actions: **Explore in Atlas**, **Why related?**, **Open concept**, **See relevant learning/practice**.
- Collapsible and non-disruptive. Readable at 200% zoom, no forced animations. No autoplay graph movement.
- Peek loads a small precomputed neighborhood; full engine need not load until requested.

### B. Atlas Explorer (immersive, optional)

Desktop reference layout:

```text
+--------------------------------------------------------------------------+
| Atlas / Scope selector   [Search concepts...] [Lenses] [Filters] [Help]   |
+-----------------+------------------------------------+-------------------+
| Navigator       | Semantic graph canvas              | Inspector         |
| Book TOC        | Focus / Search / Zoom / Fit         | Selected concept  |
| Subject filters | Nodes + EVIDENCED semantic edges   | Why connected?    |
| Saved contexts  | Optional minimap and legend       | Learn / Practice  |
|                 |                                    | Sources & status  |
+-----------------+------------------------------------+-------------------+
| Context: scope, active lens, edge visibility, evidence limitations        |
+--------------------------------------------------------------------------+
```

The Navigator may show **book hierarchy** as a tree (TOC) and breadcrumbs. **Do not draw those TOC parent/child relations as Atlas canvas edges**. Clicking a chapter changes scope to its validated concepts; the canvas still draws semantic links only.

Default entry: scoped book/subject overview with semantically coherent **clusters** or a searchable concept shortlist, **not** all nodes rendered at once. Select concept → highlight semantic neighbors and open Inspector; click edge → show relation explanation and evidence; double-click / explicit Focus button → focused neighborhood. Controls always include **Back, Reset, Fit, Zoom in/out, Focus +/−, View Help**, with explanatory state labels.

### C. Guided Learning Journey

- Stepwise **Learn → Explore → Practice → Reflect**, based on actual available content rather than fabricated completion.
- Journey ordering is a learning recommendation/sequence **stored separately**; it must not turn lessons or chapters into bogus semantic graph edges.
- On an incorrect question, *Review related concepts* opens the confirmed concept neighborhood and relevant explanations. Respect the existing bank's IDs, rationales, QA statuses and progress logic.
- If no verified alignment exists, show "Concept mapping pending review," rather than silently attaching a wrong topic.

## 4. Lenses, filters and views (Kumu-inspired, not copied)

Distinguish **scope**, **lens**, **filter**, **focus** and **highlight**:

- **Scope:** which catalog (DP-600 guide, subject, canonical cross-subject Atlas).
- **Lens:** which contextual information matters (Concept, Book Sources, Exam Objectives, Practice Links, Progress); the underlying published semantic edges do not change meaning.
- **Filter:** include/exclude nodes and **published semantic edges** by subject/source/review status/relationship type. Filter semantics must be visible; default to AND within independent filters unless UI explicitly says otherwise.
- **Focus:** selected node plus 1-hop, then 2-hop neighborhood, with total visible-node cap and expansion notice. Edge direction must be respected by traversal logic.
- **Highlight/Showcase:** accent matched concepts; dim non-matches while retaining spatial context. Must be distinguishable from filtering/removal.
- **Saved view:** persists lens, focus, scope, filters and camera in a shareable, version-tolerant URL or safe local setting; never serialize personal question results to the URL.

Recommended initial lenses:

1. **Concept relationships** — main semantic graph.
2. **Book evidence** — the *same* semantic graph restricted to concepts supported/referenced by the chosen book. The book's physical order appears in separate TOC, not connecting lines.
3. **Learn & practice** — same semantic graph with associated lesson, question and lab **Inspector affordances**; questions are content references, not semantic edges by default.
4. **My learning** — same semantic graph overlaid with separately stored progress, with no claim that progress defines importance or conceptual relation.

Optional later: conflict/trade-off view, source-version comparison, evidence confidence, learning recommendation, global ecosystem view.

## 5. Semantic relationship contract (critical)

**Node:** a canonical concept, skill, decision, technical principle or architecture pattern that has standalone knowledge meaning. Books, chapters, lesson pages, question banks and questions are **content entities**, not automatic semantic nodes. A deliberate exception requires documented semantic reasoning and approval; never produce graph lines just to fill space.

**Edge:** `sourceConceptId`, `targetConceptId`, `relationType`, `direction`, scoped `statement`, `conditions`, `explanation`, `evidence[]`, `reviewStatus`, `reviewer`, `validatedAt`, `contentVersion`.

Suggested relationship vocabulary, versioned and reviewable:

- `requires_understanding_of` — directional prerequisite for comprehension; strong evidence required, not a claim of official curriculum sequencing.
- `enables` — directional capability/dependency, with precisely specified conditions.
- `contrasts_with` — symmetric conceptual comparison; highlight meaningful differences.
- `tradeoff_with` — symmetric alternatives under explicit decision constraints.
- `complements` — symmetric capabilities that work together under described conditions.
- `related_in_decision` — semantic connection in an actual scenario, with a concise rationale.
- `part_of_mechanism` — **only** for genuinely semantic technical mechanism composition; cannot be used as a loophole for book/course hierarchy.

**Never infer a semantic edge merely because two terms occur in the same chapter, question, video or paragraph.** Missing edges are safer than false edges. An explicit source does not automatically prove a blanket unconditional relationship. Store source snippets/anchors and version where permitted, along with conditions/limitations. Directions and inverse labels matter.

**Publishing workflow:** Extract → Normalize → Candidate → Evidence Review → Domain Validation → Approved → Published. Rejected and withdrawn edges remain in audit log; not rendered as trusted facts. Candidates may appear in an editor-only QA console, never public Atlas by default. Add confidence labels for *evidence completeness* and review state, not hallucinated mathematical probabilities.

**Structural metadata:** `bookId`, `sectionId`, `chapterId`, `parentId`, `order`, `pageRange`, `tocPath` and content IDs power TOC, breadcrumbs, search and source panels. These fields do **not** become graph links. Crosswalk `contentEntityId -> conceptIds` is a content index, not a displayed graph edge.

See sample schema and fixtures in `/schemas` and `/examples`.

## 6. Source provenance, canonicalization, scientific QA

For DP-600:

- Verify the exact uploaded DP-600 Guide artifact and edition in the repository/handoffs; record hash, page/chapter counts, parsing status, missing content and source ownership. Do **not** treat an inspiring NotebookLM screenshot as the canonical table of contents.
- Build a **Coverage Matrix**: source artifact → sections/pages → extracted text anchor → canonical concept IDs → lesson/page available? → exercise? → QA state → publication state. Every unprocessed part is visibly tracked, never silently omitted.
- Extract exact hierarchy for TOC independently from semantic concepts. Use curated normalization for synonyms and aliases (e.g. terminology versions); never merge two concepts solely on a shared word.
- Separate statements from **the book**, Microsoft Learn, editorial interpretation, and agent-generated proposals. Store timestamp/edition for time-sensitive technical claims. Claims with unresolved conflicts remain blocked or labeled disputed with citations.
- Microsoft DP-600 official skills can change. As of 19 Oct 2026, the official guide lists Maintain a data analytics solution 25–30%, Prepare data 45–50%, Implement/manage semantic models 25–30%. Use the **then-current official** skills guide at implementation time; domain mappings are a separate metadata facet, not automatic graph edges.
- Map existing question-bank IDs and QA states safely. Do not rewrite a bank item simply to fit an Atlas relationship; submit a separate QA issue instead.
- Evidence in the Inspector must be legible: source name, section/page or docs URL, version/date where applicable, why it supports *that particular* edge. Avoid long copyrighted excerpts.

## 7. Interaction specification and state model

| Trigger | Required behavior | A11y / safety contract |
|---|---|---|
| Open Peek | Render a small, stable verified neighborhood | Link to text alternative; no forced canvas |
| Click/tap node | Select; open/update Inspector; preserve graph context | Enter/Space equivalent; visible focus |
| Click/tap edge | Explain relation direction, conditions and evidence | Relation also readable in connections list |
| Focus 1/2 hops | Traverse published edges, enforce caps; update URL/context | +/− UI buttons as alternatives to gestures |
| Expand from focused concept | Incrementally reveal curated neighbors | Announce count of new nodes; non-blocking |
| Search | Suggestions and results list; select → pan/focus + Inspector | Search usable by keyboard/screen reader |
| Filter | Update visible records with clear chips + reset | Never make content vanish without explanation |
| Showcase | Dim nonselected elements and preserve layout | Reduced contrast never hides critical labels |
| Book TOC selection | Filter concept context by book/chapter evidence | Never draw TOC edges in semantic canvas |
| Open learning/practice | Navigate via existing verified deep link | Preserve safe return URL/context |
| Back/Reset | Back: prior context; Reset: sensible default lens/viewport | Never reset actual learning progress |
| Missing/draft edge | Not visible publicly; show 'mapping pending' where relevant | No fabricated certainty |
| Browser history | Back/Forward restore meaningful selection | Avoid navigation traps |
| Direct URL | Restore scoped selected node, lens, filtered state | Gracefully recover renamed/deleted IDs |

Do not rely on undisclosed double-click, hover or drag. Hover is decorative preview at most. Prioritize node selection on single click/tap and an explicit **Focus** control; optional double-click shortcut is secondary. The canvas is browse-only; freely dragging nodes is disabled unless in a future authoring mode. Panning/zooming remain usable but have control equivalents.

### Inspector contract

- Title, precise definition, status (verified/needs review), subject and optional learning level.
- **What it means**, **why it matters**, **how related**, **limits/conditions**.
- Connection list with relationship labels, direction and evidence access.
- Content attachments: source chapters/pages, existing lesson, lab/case, question IDs mapped with audit status, project application.
- Actions: Read, Explore example, Practice, Open official source, Compare concepts, Copy/share concept link.
- Empty states: source unavailable; lesson not published; question mapping pending; all shown truthfully.

## 8. Responsive, accessible navigation

Desktop wide: navigator/TOC + semantic canvas + inspector. Laptop: foldable navigator, inspector collapses/docks. Tablet: canvas + inspector overlay. Mobile: **accessible searchable concept list or drill-down as default**, with optional immersive map; inspector in bottom sheet with fixed header/close and sensible focus restoration. At small viewport / high zoom, never require horizontal scrolling of lesson text to use Atlas.

Target WCAG 2.2 AA. Provide:

- Logical headings, landmarks, focus order, skip links, labeled controls and predictable panel opening/closing.
- A full text-based **Concept & Connections** list with names, semantic relation types, evidence and destinations; no knowledge unique to spatial layout.
- Keyboard selection and navigation for nodes and edges. A screen-reader explanation of map purpose and how to access the linear view. Test Escape, arrows, Tab, Enter/Space; avoid conflicting keybindings in search inputs.
- Pointer alternatives to drag/pinch; visible zoom, fit, directional or concept search controls; no gesture-only functionality.
- Adequate contrast, not relying solely on color/size/animated particles to signal category/status. Focus indicator, touch targets, RTL considerations if Arabic UI becomes available.
- Support `prefers-reduced-motion`, instant movement fallback, pause/disable nonessential animation. Treat W3C 2.3.3 (Animation from Interactions) AAA as an aspirational quality bar where feasible, not a substitute for AA compliance.
- Test 320px-equivalent content width, zoom to 200%/400%, switch controls, VoiceOver/NVDA, keyboard-only and mobile touch.

## 9. Visual design system — functional expressiveness

### Character

**Kumu-inspired systems thinking, hybrid with a calm editorial/learning interface.** Not a random force-graph screensaver; not a rigid course-flow chart. Offer spatial discovery *and* clear destination/action labels.

- Honor repository design tokens, accessibility, typography, dark/light themes; add Atlas tokens only when existing system cannot express them.
- Distinguish node **concept type** using shape/label/icon, not color alone. Proposed concepts: foundation, method, decision, technology/mechanism, advanced applied concept. Avoid making arbitrary node size falsely indicate difficulty, importance or mastery.
- Relationship semantics use direction, optional lightweight line style and **always accessible textual labels**. `requires_understanding_of` should not look the same as `contrasts_with` without a legend.
- Curated clusters, visual hierarchy, progressive disclosure, spatial memory and whitespace; do not render the whole corpus on first load.
- Microinteraction timing should follow actual UI states; never make a user wait for animation to finish to continue reading. Offer an intentional full-screen immersive mode without forcing it on all users.

### Context-aware visual component selection (must implement a decision process, not a fixed library quota)

| Information / teaching intent | Consider | Avoid |
|---|---|---|
| Semantic relationships and focus | React Flow / custom graph / Kumu-like lens; semantic edge inspector | Treemap or Sankey misrepresenting semantic links |
| Book chapter order / navigation | TOC, breadcrumbs, structured outline, expandable tree | Drawing TOC parent-child as Atlas graph edges |
| Quantitative comparison | Bar, line, dot, slope or area chart as appropriate to scale/time | Decorative charts without real numeric data |
| True weighted flow | Sankey only when stage-to-stage *measured volumes* exist | Sankey for abstract concept associations |
| Ordered course or lifecycle | Timeline, stepper, interactive checklist | Animated timelines with no sequence evidence |
| Trade-off / decision alternatives | Decision matrix, cards, scenario simulator, comparison table | Pie chart where no part-to-whole exists |
| Architecture mechanism | Animated data-flow diagram with honest technical semantics | Decorative motion implying false replication/data paths |
| Spatial exploration | Progressive concept-map clusters, focus, minimap | Entire network at once with tiny unreadable text |
| Source/document evidence | Provenance panel, annotated excerpts, links and status | Pretty node cards with untraceable claims |

**beUI.dev** is a preferred optional animation/component source and should be evaluated from its *current live registry/documentation* before installation. Its public collection is open-source and includes Motion-based UI, timelines, and visualization components such as Sankey. It is **not** the graph data model and should not be forcibly used for every graph primitive. Other libraries may be used when clearly better for purpose, accessibility, performance and licensing. As documented at `https://beui.dev/docs/ai-agents`, agents can discover its live skill/MCP/registry. Check actual code compatibility (React/Tailwind/Motion versions) against the repo first, pin versions, inspect source, and respect free vs Pro licenses. Never assume paid Pro access.

Recommended graph renderer candidate: `@xyflow/react` (React Flow), with Dagre/ELK or tailored layout as warranted, and data selection/capping independent of renderer. Confirm current license and package versions; do not copy licensed Pro examples/source. For truly large graphs, evaluate canvas/WebGL renderer alternatives against accessibility needs; any replacement must keep keyboard/text parity.

### Motion design rules

- Animate **semantic change**: focus transition, controlled neighborhood reveal, search-target location, highlighting an examined relation, opening Inspector, stepping through actual data processing phases.
- Motion intensity: tiny for Peek; restrained for default Explorer; opt-in immersive enhanced state; none under reduced-motion preference.
- Camera easing should preserve user orientation; avoid sudden auto-spinning, perpetual particles, random drift, aggressive zoom or distracting 3D motion.
- The selected focus and graph labels remain legible during motion; user can interrupt/skip.
- Progressive enhancement: all information and actions work if motion/Canvas is disabled or unsupported.

## 10. Proposed engineering architecture (adapt after repo inspection)

Prefer **static-first** to preserve current Hansa deployment path. A build-time content pipeline generates vetted, versioned JSON indexes and small chunked semantic neighborhoods. Client UI selectively loads chunks and does local state transitions. No API/database/auth required for the pilot.

```text
Source books, curated docs, question mapping, handoffs
                 |
     Extraction & coverage inventory
                 |
   Editorial curation / evidence QA
                 |
    Canonical Concepts + Semantic Edges
                 |
      Schema Validation & Versioning
                 |
       Static Build-Time Graph Export
          /          |           \
     TOC index    Search index   Graph shards
          \          |           /
          Atlas domain adapter (no UI binding)
                   |
          Lens / focus / filter selectors
                   |
    Peek / Explorer / Linear Alternative / Inspector
                   |
       Deep links to existing Hansa content
```

Recommended modules/interfaces (names illustrative; fit actual repo):

- `atlas/domain/` concepts, relationships, evidence, canonical IDs and discriminated statuses.
- `atlas/content/` source adapters for books, question banks, lessons, labs and projects.
- `atlas/build/` extract, normalize, lint, validate, shard and generate indexes.
- `atlas/selectors/` scope, lens, focus, edge direction, filters, presentation caps, search.
- `atlas/ui/` Peek, Explorer, Inspector, Navigator, LinearConnections, MobileSheet, Legend, accessible controls.
- `atlas/state/` URL-safe view context, return-to-explorer restoration, local preferences/progress adapters.
- `atlas/tests/` contracts, graph invariants, accessibility checks and golden-fixture assertions.

**No duplicate truth:** a concept ID is stable across multiple books; content entities reference it; each source's version and anchor stay in provenance. A single semantic assertion may cite multiple sources. UI may derive visual edges from *approved* assertions only. Keep user progress keyed to stable IDs with an explicit migration/remapping mechanism if taxonomy changes.

**Static search:** generate an index at build time (or reuse site's existing search) including aliases and content references; rank exact title, alias and validated keyphrase match before full text. Clearly separate matching a word from asserting a semantic relationship.

**URL/share state:** encode scope, lens, focused concept, filters and possibly viewport in a size-limited, versioned query string. No private profile/test results in URL. Handle invalid/old params safely.

**No early infrastructure migration:** do not switch Next.js framework or Cloudflare deployment mode just to build Atlas. Document any genuine future server requirement separately.

## 11. Performance and resilience targets

- Load Peek incrementally and avoid pulling full Atlas engine into every content page; dynamic import Explorer.
- Graph reveal progressively; virtualize/lazily load data and cap visible nodes/edges; searchable list for huge maps.
- Memoize nodes, edges, selectors and layout; constrain layout work to data changes; offload heavyweight transforms if warranted by measurement.
- Avoid long-running main-thread work, expensive shadow/filter animations and forced layout thrash; use reduced-motion where appropriate.
- Record target lab budgets and actual results on mobile/desktop; aim for healthy Core Web Vitals (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at p75 where field data exists), but do not claim unmeasured success.
- Test representative content sizes: pilot, ~500 concepts, ~2,000 concepts and many-to-many content links. The test fixture size is not a claim about the current guide.
- Verify no build-time or hydration errors, offline/static asset behavior, invalid JSON route recovery, slow-device loading, 404/deep-link behavior and old-book-version migration.
- Include a no-JavaScript/textual fallback wherever practical for discoverability and critical navigation.

## 12. Information security, privacy, licensing

No secrets in source, logs, prompts or static bundle. Source/book usage must respect copyright and provenance; render short verified descriptions rather than reproducing unlicensed complete passages. Track license and attribution per third-party component. Keep personal learning/progress data local by default, with explicit user-facing explanation and existing site behavior preserved. Avoid cross-device-sync claims without server support. Sanitize any Markdown/HTML metadata before rendering; treat imported source content and agent-generated notes as untrusted. For analytics or recommendation later, prepare privacy review before activating tracking.

## 13. Incremental delivery / non-destructive release gates

**P0 — Baseline & source authority:** prove repo access; read `AGENTS.md` and handoff; audit routes, component dependencies, build, existing progress and content registry; inspect guide artifact, record hashes and coverage; create baseline screenshots/tests. No changes before initial verification.

**P1 — Content foundations:** canonical schema, evidence taxonomy, book TOC metadata, source-to-concept crosswalk, editor-only candidate review, deterministic validation, tiny verified DP-600 fixture; build index and version strategy.

**P2 — Interaction vertical slice:** user can open an Atlas Peek on an existing DP-600 page, enter Explorer, focus verified nodes, click an evidence-backed edge, read Inspector and open/return from a real lesson or question. Keyboard and mobile text alternative from day one.

**P3 — Atlas visual polish & responsive:** Kumu-style scope/lens/focus/showcase/search; refined visual system, meaningful beUI components, modest transitions, responsive mobile sheet, reduced motion, real performance evidence.

**P4 — DP-600 content expansion:** map whole guide **structure** in TOC and a defensible subset of **semantic** edges; publish only reviewed content, connect available Academy lessons, question bank and case studies; coverage dashboard tracks gaps.

**P5 — Reusable multi-source engine:** demonstrate adding a second source/book or a subject tab with zero changes to core renderer/domain schema; add future global Atlas adapter **only when separately approved**.

**Do not conflate successful build with scientific publication readiness.** Each phase includes a content QA gate and a usability/a11y gate. No production deployment without explicit authorization and verified rollback plan.

## 14. Required implementation deliverables and acceptance

Every implementing agent should deliver:

1. Inventory / verified baseline: actual repo status, relevant source files, existing features and constraints.
2. Architectural Decision Record(s) showing why the graph engine and selected components fit the repo.
3. Versioned schemas, linter/validator, curated fixtures, provenance and coverage matrix.
4. Working Peek, Explorer, Inspector, linear alternative, scoped views and safe routes (for the approved phase).
5. Unit/integration/e2e/visual/accessibility/performance QA results with commands and observed outcomes.
6. Change log, new/modified file list, retained IDs/routes/progress proof, known gaps and rollback information.
7. Exactly which guide sections, concepts, links, questions and labs were integrated — evidence-based counts, not guessed totals.
8. Follow-up queue and acceptance decisions for unreviewed relationships or content.

**Critical acceptance tests:** (a) never render `contains` edges; (b) each visible semantic edge has an evidence record and readable rationale; (c) Book TOC uses metadata without turning into graph connections; (d) content link IDs resolve to actual pages; (e) progress is unchanged; (f) mobile non-canvas access; (g) keyboard users can complete representative learning journey; (h) missing/unreviewed mappings are honest; (i) adding a book reuses canonical concepts; (j) normal reading paths work without opening the Atlas.

The executable checklist lives in `QUALITY_GATES_AND_TESTS.md`.

## 15. Creative latitude — protected constraints vs design freedoms

**Agent MUST preserve:** semantic-only graph edges, provenance and evidence gates, ordinary content UX, future extensibility, WCAG 2.2 AA, budget/performance, existing IDs/data, no surprise deployment.

**Agent MAY innovate:** exact grid/inspector arrangement, responsive transitions, graph layout, custom nodes/edges, beUI components or third-party chart/design libraries, tasteful immersive theme, interactive concept explanations, micro-simulations, navigation shortcuts, visual storytelling devices, search experience, clustering algorithm, animation curves and progressive disclosures — provided a clear user-learning benefit is documented and tested.

**Agent SHOULD propose alternatives** when appropriate: show 2–3 competing visual directions for review with trade-offs, select by real context rather than fashion, prototype risky interactions, and record what was rejected and why. Design should feel original to Hansa, not a Kumu clone, NotebookLM clone or shadcn showcase.

**Decision checklist before using any component/chart/animation:**

1. What question does it help the user answer?
2. Is this relationship, structure, chronology, spatial relation or quantitative measure?
3. Does it preserve the truth of the source and edge semantics?
4. Can a nonvisual user obtain the same information/action?
5. Does the existing design system / beUI already solve this cleanly?
6. Is license, bundle weight, React compatibility and motion safety acceptable?
7. Would a simpler article, table, card or list be clearer?

If the answer to #7 is yes, choose the simpler representation.

## 16. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Visual hairball / giant graph | Initial scope, focus 1-hop, caps, curated clusters, search-first reveal |
| False relationships produced from co-occurrence | Typed semantic edges, evidence + QA before publication |
| TOC and graph confusion | Structural metadata/navigation only; **no structural graph edges** |
| Conflicting books, outdated Fabric information | Edition/date/provenance, official source check, review states |
| Confusing Kumu-inspired effects | Clear controls, educational defaults, restrained motion |
| Mobile unusability | Linear/drill-down first, optional canvas, bottom-sheet inspector |
| UI kit dependency sprawl | Live beUI registry inspection, repo compatibility and licensed source review |
| Performance degradation | Lazy-load graph, shards, memoization, caps and measured budgets |
| Broken existing bank/progress | Contract tests, ID snapshots, migrations, non-destructive adapters |
| Premature landing-page scope creep | DP-600 pilot boundary and separately approved global roadmap |
| Licensing/copyright violation | License ledger, source rights check, minimal attributed excerpts |

## 17. Research / normative source links

- Kumu views and architecture: https://docs.kumu.io/overview/kumus-architecture
- Kumu Focus: https://docs.kumu.io/guides/focus
- Kumu controls: https://docs.kumu.io/guides/controls
- Kumu Filter and Showcase: https://docs.kumu.io/guides/controls/filter-control and https://docs.kumu.io/guides/controls/showcase-control
- beUI home: https://beui.dev/ ; agent docs: https://beui.dev/docs/ai-agents
- React Flow accessibility: https://reactflow.dev/learn/advanced-use/accessibility ; viewport: https://reactflow.dev/learn/concepts/the-viewport
- React Flow layouts: https://reactflow.dev/examples (note some advanced samples are licensed Pro)
- WCAG 2.2: https://www.w3.org/TR/WCAG22/ ; animation guidance: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions
- Next.js static export: https://nextjs.org/docs/app/getting-started/deploying ; Cloudflare static assets: https://developers.cloudflare.com/workers/static-assets/
- DP-600 latest source at preparation: https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-600

**Sources inform patterns and standards; they do not authorize copying protected layouts, paid samples, copyrighted books or unverified scientific facts.**

---

**Change protocol:** Any future agent must preserve these approved product decisions and add a dated design decision / amendment rather than silently rewriting them. If the owner later approves a different approach, record the rationale, version and impact on schema, users and rollout.
