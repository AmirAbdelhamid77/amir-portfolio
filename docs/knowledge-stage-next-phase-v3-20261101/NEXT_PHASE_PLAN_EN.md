# Next phase: from review prototype to an intelligent knowledge experience

Version V3.1, updated 1 November 2026. The [Hansa + beUI visual direction](VISUAL_DIRECTION_BEUI_HANSA_EN.md) is required alongside this plan. It defines the owner-approved direction to pursue, not a claim that a finished visual implementation has been accepted.

## 1. Product outcome

Build a coherent learning entrance where a visitor can start from today's available idea, select a concept, understand its relationships, compare supported alternatives, preview a path toward a goal, open a useful resource, and return without losing context.

The learner-facing label can be **Explore Knowledge**. The internal product specification is **Intent-driven Interactive Knowledge Graph**. Renaming existing `atlas` modules is unnecessary unless a compatibility benefit is demonstrated.

The signature: **one selected concept remains a recognizable anchor while the surrounding composition changes to answer the learner's question**. Understand, Compare, Apply and Reach a goal are distinct tasks with distinct presentations over one source-backed knowledge model. The visual language combines Hansa's editorial clarity and existing themes with beUI-inspired tactile objects, selective saturated accents, layered surfaces and deliberate motion. Carry that blend consistently across all three Home scenes.

The Home sequence remains:

1. Timeline occupies the first viewport; selecting a date with an available edition opens the Daily Dealer.
2. Native vertical scrolling transfers emphasis to the Knowledge Stage, which settles into a stable interactive surface.
3. A short closing offers actual learning/practice/resume destinations and brief site context.

The graph provides access to the whole site's eligible content through concepts, resources, structural discovery and search. It does not place every question or paragraph on the canvas simultaneously. Existing lessons, practice engines, routes and progress stores remain authoritative.

## 2. Evidence baseline and what remains unproven

The following is a 1 November inspection snapshot. Reconcile it with the next agent's checkout before implementation.

| Area | Observed baseline | Consequence |
|---|---|---|
| Isolated deliverable | `intelligent-atlas/` has extraction tools, graph data, a standalone HTML prototype, storyboard, contracts and QA receipts | Preserve and evolve useful work; do not discard the corpus or rewrite everything |
| Actual Home | `components/knowledge/insight-stage.tsx` still composes Today, Insight, Learn, Certify and footer Atlas context | The requested three-scene Home is not integrated |
| Corpus report | 6,201 extracted units; 4,337 eligible; 3,609 matched; 728 unmatched; 628 media references caption/alt-only | Counts are reported outputs, not proof of complete semantic reading or current source parity |
| Candidate graph | Reported 132 concepts, 7,309 mappings, 86 assertions; 0 published concepts/assertions | Review preparation can progress while public semantic coverage remains zero |
| Prototype subset | Reported 59 concepts, 46 edges, 166 resources, 3 editions, 3 goals | A visual sample must not be called all-site integration |
| Current lenses | All, Direct, Inferred, Cross-domain | Useful evidence filters, but not learner intent modes |
| Dealer schema | One card per edition is enforced by generic schema and tests | Preserve this fixture; remove the universal limit in a versioned successor |
| Public simulation | Review and public JavaScript payloads are both loaded by the HTML | UI hiding is not public artifact isolation |
| Route construction | `planRoute` sorts shortest prerequisite depths, then IDs | Replace with dependency-correct ordering before claiming valid prerequisite routes |
| QA | Previous review independently reran 7 adapter tests successfully; agent receipts report 44 core and 21 interaction checks | Rerun changed behaviors; receipts are not fresh visual/domain verification |

Evidence pointers: [delivery report](../../intelligent-atlas/DELIVERY_REPORT.md), [coverage](../../intelligent-atlas/analysis/coverage-report.md), [matcher/routing](../../intelligent-atlas/tools/analyze-corpus.mjs), [prototype HTML](../../intelligent-atlas/prototype/index.html), [contracts](../../intelligent-atlas/contracts/contracts.schema.json), [current Home](../../components/knowledge/insight-stage.tsx).

There is substantial dirty work predating this plan. No reset, clean, stash, overwrite of concurrent work, bulk migration, install or deployment is implied by this document. The known `lib/atlas/field.ts` reference-hash drift must be rechecked and attributed; never change expected hashes merely to obtain a green result.

## 3. Scope and non-negotiable behavior

### Default next phase: M0–M5, isolated review delivery

Correct the analysis claims and data gaps, generalize contracts, isolate public output, implement the intent-led experience in a reviewable successor, and demonstrate complete journeys with evidence. Whole-corpus semantic review remains required, even when the visible pilot uses a bounded subset. Work in resumable batches; the pilot is not a substitute for that work.

### Full local assignment: M0–M7

Additionally integrate the verified experience into the shared canonical Home and its `/prototype-c/` compatibility alias, using production-safe eligible data. Preserve URL/query/hash and original resource behavior. The alias remains shared rendering, not a redirect or independent homepage fork.

### In every scope

- Keep scientific review, rights, assessment eligibility and publication decisions independent. An implementation agent cannot manufacture human approval.
- Keep the original `principle`, `caveat`, `evidence` card meanings; do not invent ideas to create a fan of cards.
- Make actions explicit: selecting previews; Explore expands; Open resource navigates.
- Make the same reasoning available through mobile, keyboard, list and reduced-motion views.
- Keep public source data free of review-only material, including serialized props, chunks, search indexes and source maps.
- Use existing static export and free/local capabilities. No runtime LLM, graph database, paid service, external student-data transmission, account system or global mastery score is required.
- No deployment. No unrequested source/question rewrites or saved-progress migrations.

## 4. Feature priorities

| Priority | Required behavior | Minimum meaningful proof |
|---|---|---|
| P0 | Honest corpus coverage and explicit semantic review states | Reconciled source ledger and evidence-backed unit decisions, not automatic matcher status |
| P0 | Public/review artifact separation | Candidate sentinel absent from the complete public output and network payloads |
| P0 | Correct prerequisite routes | Dependency-order tests, condition handling, gaps and cycle behavior |
| P0 | Extensible Dealer contracts | Empty, one-card and multi-card cases; real-topic adapter; independent gates |
| P1 | Timeline-only first scene and intentional Dealer | Date activation, honest edition availability, focus/return and keyboard proof |
| P1 | Blended Hansa/beUI art direction | Light/dark keyframes, token-role crosswalk, refined depth and visual-craft review; no second global theme system |
| P1 | Understand / Compare / Apply / Reach a goal | One real, evidence-bearing example per mode, shared selection and state |
| P1 | Why this, branch preview, contextual next steps | Traceable reason and explicit expand/open choices |
| P1 | Context continuity | Card → graph → resource → Back restores semantic context |
| P1 | Session Learning Thread and Knowledge Pocket | Actual visited/saved identities; no inferred mastery; session-only initially |
| P2 | Cross-domain context switching | A reviewed shared concept or typed bridge; otherwise an honest review gap |
| Later | Goal/topic Dealer product launch; persistent collections; misconception recovery | Built on contracts proved now; separate feature acceptance later |

P2 means follow the complete first journey, not optional omission from the final full-scope evaluation. A missing scientific bridge limits the data, not the obligation to implement and test honest unavailable behavior.

## 5. Milestone M0 — preserve and reconcile

Inputs: active AGENTS, V2/V3 plans, dirty status, prototype reports, original source registries and publication rules.

Tasks:

1. Record HEAD, dirty status, scope mode, owned paths and file fingerprints. Preserve the current prototype and screenshots as a dated baseline before changing them.
2. Read actual source adapters, content types, original eligibility rules, route contracts, components and theme/motion tokens.
3. Reconcile reported corpus counts against current sources, including later-added banks and source exports. Identify unavailable external originals explicitly.
4. Run targeted existing tests and integrity verifiers once; separate inherited failures from new failures.
5. Record a decision log for approved scope, actual data availability and retained versus replaced modules.

Outputs: baseline manifest, issue register, source-family reconciliation, component reuse map, initial risk list.

Exit: affected paths and preserved state are known. An inherited drift does not block unrelated preparation, but its impact must be understood before editing the affected module.

## 6. Milestone M1 — repair the semantic foundation

Follow [DATA_AND_CONTRACTS_EN.md](DATA_AND_CONTRACTS_EN.md). This is a full-corpus workstream, not a seven-node demo exercise.

1. Replace overloaded `semanticAnalysisState` claims with separate extraction, candidate matching, semantic reading, mapping review and publication states.
2. Review the 728 unmatched units and mapped units in resumable batches. Restore context around formulas, procedures and fragments before classifying them. Add justified domain adapters instead of excluding teachable content because the registry lacks it.
3. Resolve aliases, scope and duplicate identities; preserve original IDs and distinguish R11 revisions from extra question entities.
4. Review every retained assertion's meaning, direction, conditions and supporting passages. A quote match is a provenance check, not entailment.
5. Review educational diagrams and media where their meaning is needed. Track inaccessible media separately; do not count caption reading as figure review.
6. Produce a contradiction/ambiguity queue, coverage by source/domain/language/content form, and a separate scientific/publication review queue.

Outputs: successor unit ledger, registry/crosswalks, mappings, assertions, evidence locators, gap ledger, coverage and review reports.

Exit: full accessible eligible corpus has explicit semantic decisions and remaining unavailable inputs are named. Publication may remain blocked. No unqualified whole-corpus-complete label while eligible units remain unread or unavailable.

## 7. Milestone M2 — implement shared query and contract behavior

Depends on M0 and versioned model decisions from M1. Development may start with a reviewed slice while M1 batches continue; M5 cannot claim all-corpus completion early.

Deliver:

- Explicit public projection builder and separate local review artifact.
- Versioned graph/source-index manifest and compatible chunk validation.
- Neighborhood query, semantic relation filters, resource lookup and search.
- Contextual recommendation results with reasons, evidence, eligibility and limitations.
- Dependency-correct route resolver and branch preview.
- Comparison records with sourced criteria and conditions.
- Versioned DeckRequest/DeckDescriptor/ReturnContext and capability adapters.

Use small pure modules and existing domain conventions. The renderer must not decide scientific eligibility, route correctness or scoring. Keep the existing DP-600 source-policy restrictions intact; introduce reviewed all-site adapters instead of weakening URL validation globally.

Exit: data/query/contract tests in the acceptance matrix pass, including negative cases. No new database or paid capability.

## 8. Milestone M3 — design the Knowledge Stage before broad UI work

Produce a content-led VisualizationSpec and three representation sketches: precise list/stepper, stable 2D task-led field, immersive spatial scene. Evaluate using the repository correctness/learning/interaction/performance/accessibility/maintenance rubric. The recommended direction is stable 2D with list equivalence; the comparison is still recorded against actual labels and topology.

Create the storyboard in [INTERACTION_AND_MOTION_EN.md](INTERACTION_AND_MOTION_EN.md), including empty/sparse and reduced-motion states. Use actual selected content with candidate labels only in review mode. Preserve real typography length, Arabic/English direction and evidence text.

Apply [VISUAL_DIRECTION_BEUI_HANSA_EN.md](VISUAL_DIRECTION_BEUI_HANSA_EN.md): compare the same real content in the current editorial treatment, a beUI-weighted exploration and the recommended blend. Deliver six polished light/dark keyframes for Timeline, Dealer and Knowledge Stage, with comparison details and a 390px view. Prepare an existing-token-to-role crosswalk, material/elevation rules and per-state color/contrast checks. These comparison boards select one coherent design; they do not introduce three production themes. Keep saturated light and expressive material response focused around meaningful objects, while body copy and evidence remain calm and readable.

Design outputs must include interaction/state transitions, motion timings, depth, vignettes, interruption behavior, mobile reinterpretation and focus ownership. A static attractive screenshot cannot prove motion or navigation quality.

Exit: executable visual specification and inspectable storyboard; substantive visual acceptance remains an owner judgment and cannot be self-certified by test success. Continue authorized local work without inventing extra approval checkpoints; keep the preview reviewable before broad integration.

## 9. Milestone M4 — build one complete journey, then the other intent modes

First vertical slice:

**Available edition → Daily Dealer → Locate concept → Understand → Why connected → preview branch → open actual resource → Back → original card/context.**

Use the 26 October OneLake material only after checking the current sources; review mode may use clearly labelled candidates. If there is no edition today, the interface explicitly offers the latest available edition.

Then complete:

1. Compare: one documented pair and meaningful criteria; condition change visibly updates the explanation.
2. Apply: eligible example/lab and original practice destination, with missing-practice fallback.
3. Reach a goal: a supported route, a preview alternative and incomplete-route behavior.
4. Session Learning Thread and Pocket: save actual choices and restore them without altering learning progress.
5. Cross-domain context switch with a supported bridge, or explicit editorial review gap.

Open real routes in integration mode. An isolated prototype may resolve them against an explicitly configured local preview origin; if unavailable, label the destination as a preview and do not mark navigation/return execution PASS.

Exit: one full journey works by mouse, keyboard and mobile controls; all four intent modes have real data or an explicit supported empty state. No fake recommendations, no unlabelled fixture claims.

## 10. Milestone M5 — scale the review experience and verify

- Reconcile M1 completion and all-site discovery access; the visible region may remain bounded.
- Add the remaining eligible source families through adapters, search and resource discovery. A resource without a semantic mapping remains discoverable according to its policy.
- Run data, route, contract, responsive, focus, performance and visual checks; store runnable QA harnesses inside the repository rather than only in temporary directories.
- Capture video and intermediate scroll frames, compare layouts with motion disabled, and record owner-review questions against concrete screenshots.
- Publish a local delivery report separating corpus processing, semantic reading, scientific review, public coverage, visual acceptance and integration status.

Default scope ends here with a working successor review prototype and an integration-ready package. M6–M7 are the next local implementation scope when assigned. An incomplete semantic pass must be reported as partial with a resumable queue, never renamed complete to finish the milestone.

## 11. Milestone M6 — integrate the shared canonical Home

Only in a full-local assignment. Inspect current route/layout composition before changing it.

| Boundary | Existing sources to inspect | Intended change |
|---|---|---|
| Canonical landing | `components/knowledge/hansa-landing.tsx`, route callers | Explicit eligible/public data boundary; shared root/alias implementation |
| Scene orchestration | `insight-stage.tsx`, `stage-today.tsx`, stage CSS | Three scenes; timeline-first entry; no competing Learn/Certify full-screen gates |
| Timeline | Existing local beUI Timeline and `insight-rail.tsx` | Use audited Timeline capability; separate selection from activation; preserve date identity |
| Dealer | `knowledge-dealer.tsx`, `lib/knowledge/models.ts` | Reuse renderer, source-backed adapters and generalized return contract |
| Knowledge model/query | `lib/atlas/`, `lib/study/`, source adapters | Versioned all-site graph/query extension without duplicating truth |
| Presentation | Existing `components/atlas/` and knowledge components | Intent stage, comparison, route preview, evidence and accessible list |
| Layout/header | Actual root layout and navigation callers | Timeline-only first viewport; accessible compact navigation appears on demand/later scenes |
| Build/public artifacts | Existing export/build scripts | Public-only serializable data and lazy chunks; review artifact excluded |

Retain previous deep links, anchors, alias behavior and source pages. Condensing a Home gate does not delete its underlying lesson/practice features. Avoid copying the vanilla prototype into one giant client component; migrate tested model/query behavior and rebuild presentation using established project components.

Public zero-edge state must offer honest resource discovery, actual learning/practice links and search. It must not be an unusable blank canvas or expose candidate edges. Review-only richness is demonstrated separately.

## 12. Milestone M7 — validate integration and hand off

Run the affected test suites, lint, TypeScript checks and static build/export; inspect root and alias in a browser. Verify deep-link navigation, headers, mobile, reduced motion, public payload absence, saved progress and unchanged content identities.

Measure loading/interaction against the recorded baseline, not a made-up performance claim. Capture first load, graph entry, lens switch, high-degree expansion and Dealer return. Do not embed the complete corpus or all answer bodies into Home.

Deliver changed-file/route manifest, source coverage, tests, screenshots/video, retained caveats, measured performance, dependency/cost rationale and rollback limited to the agent's own changes. Do not restore the entire checkout to an earlier state.

Engineering acceptance, visual owner acceptance, scientific/publication readiness and deployment are separate statuses. A successful local build is not publication authorization. The visual review must also demonstrate the Hansa/beUI blend: functionality alone does not satisfy the requested depth, color language and craftsmanship.

## 13. Future vision prepared now

| Future addition | Boundary to prepare now | Deliberately later |
|---|---|---|
| Topic/Goal KnowledgeDealer | Origin providers, context and evidence refs, empty/multi-card contracts, two-source proof | Full topic/goal session product UI |
| Knowledge Pocket collections | Stable saved references, session cap, eligibility re-resolution | Permanent storage, migration, cloud sync |
| Learning Thread | Bounded observed navigation sequence and branch/return IDs | Multiple durable named journeys |
| Misconception recovery | Reviewed question-to-concept mapping type and reason envelope | Diagnosis UI; only after valid assessment/misconception evidence |
| More domains/languages | Canonical IDs, multilingual aliases, typed adapters and responsive layouts | Unreviewed claims or automatic new relation semantics |
| Richer cards | Explicit kind registry and accessible renderer boundary | New grading engines, unsourced generated cards |
| Semantic updates | Fingerprints, dependency invalidation, merge/split crosswalk | Global learner-progress migration |

A wrong answer is an event, not a diagnosis. A visited lesson is not mastery. A saved concept is an expressed interest, not inferred competence.

## 14. Definition of the next phase being complete

The isolated next phase is complete when M0–M5 evidence satisfies the acceptance matrix, the full accessible semantic analysis is truthfully reported, and the learner can perform the signature journey with working intent modes and context restoration. Publication can remain pending with a useful public fallback and isolated review evidence.

The full-local phase additionally requires M6–M7. Neither completion label substitutes for owner visual acceptance or scientific approval. Report remaining gaps by affected content/feature and next atomic action rather than using an unsupported overall percentage.

