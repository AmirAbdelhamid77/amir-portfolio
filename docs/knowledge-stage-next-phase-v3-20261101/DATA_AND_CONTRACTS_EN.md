# Semantic foundation, intelligence and extension contracts

These are proposed successor contracts. Adapt them to actual local types; do not introduce a parallel truth store or a universal plugin platform.

## 1. Required layers

| Layer | Stores | Does not imply |
|---|---|---|
| Resource discovery | Existing route, source ID, title, language, permitted metadata | Scientific relationship or permission to republish |
| Canonical concepts | Identity, definition, scope, aliases, placements, revisions | One concept per page or keyword |
| Semantic assertions | Typed claim, direction, evidence, conditions, review/publication | Category membership or arbitrary navigation |
| Learning design | Explicit goal mappings, editorial sequences, reviewed prerequisites | Every shortest path is a curriculum |
| Personal context | Observed visits, explicit saves, self-report, original progress references | Mastery inferred from clicks |

A cross-domain bridge requires a genuinely shared concept or a supported typed assertion. A shared term is only a candidate. SKOS supplies useful concepts, preferred/alternative labels and scheme distinctions; adopting an RDF runtime is unnecessary. [W3C SKOS Reference](https://www.w3.org/TR/skos-reference/).

Preserve the seven current semantic relation keys: `requires_understanding_of`, `enables`, `contrasts_with`, `tradeoff_with`, `complements`, `related_in_decision`, `part_of_mechanism`. New relations require definitions, traversal policy, evidence rules, rendering and tests. Structural grouping, browsing trails and resource mappings remain separate records.

## 2. Replace automatic completion claims with an auditable ledger

Keep extraction and matching results, but give each unit separate dimensions:

- `unitId`, source family, original resource/question ID, source fingerprint, precise locator, canonical href, language and content form.
- `extractionState`: available, partial, unavailable; method and limitations.
- `candidateMatchState`: processed/unprocessed and matching method/version; optional candidate scores explicitly labelled retrieval heuristics.
- `semanticReadingState`: unread, in-review, read, needs-context, unavailable, excluded-with-reason.
- `semanticDecision`: substantive summary, scope, learning purpose, concepts considered, supported/unsupported mappings, relevant evidence span and rationale.
- `reviewActor`, `reviewMethod`, `reviewedAt`, source revision and unresolved issues. Agent reading is identified as agent reading; never label it human review.
- Independent mapping/assertion/scientific/publication states under the owning policies.

A regex can mark candidate matching complete. It cannot set semantic reading to read solely because a threshold was crossed. Read the actual unit and its needed parent context. The unit decision must demonstrate that content was understood, including why a non-mapping is appropriate.

### Coverage repair procedure

1. Reconcile source registries, original exports and all current website content families. Separate source files, extracted units, unique resources, revision overlays and discoverable routes; their counts are not interchangeable.
2. Inspect late additions since the old corpus build. Missing eligible material is a gap even if all old extracted units have dispositions.
3. Batch review by coherent topic/source context. Record actual unit IDs and fingerprints in each checkpoint; resume deterministically after interruption.
4. Prioritize the 728 unmatched units while also reviewing already-matched units. Formula fragments need nearby definitions/assumptions; procedural labs can contain conceptual constraints. No blanket exclusion by content shape or missing registry domain.
5. Inspect substantive figures, diagrams, code, formulas and media. Record pages/frames reviewed. If source media are absent or inaccessible, retain the gap and qualify completion.
6. Resolve aliases and homonyms in English/Arabic; split concepts with different scope and retain merge/split crosswalks. Similar titles or embeddings do not prove equivalent meaning.
7. Keep held answers out of evidence and assessment delivery. Review approved explanatory material according to its own policy; do not indiscriminately exclude all answers regardless of status. Question stems alone may support a practice mapping, never an unsupported answer claim.
8. Preserve LINK_ONLY material as permitted discovery metadata. Distinguish a lawful metadata-only exclusion from an unavailable source that the analysis needed; do not relabel missing inputs as exclusions to reach completion.

Each eligible unit may finish as mapped or legitimately unmapped after contextual reading. Unmapped does not automatically mean incomplete, but the current matcher-derived reason alone is insufficient. All discovery-eligible resources remain reachable independently of semantic mapping.

### Quality and reporting

Use a full unit ledger plus a separately reviewed quality sample stratified by domain, language, content form, matched/unmatched status, high-risk prerequisite and cross-domain claims. Publish sample size, selection method, errors, corrections and evaluator identity; self-checks must not be represented as independent review. Any external/domain reviewer availability is reported honestly.

Do not reuse 83.2% matcher coverage as semantic accuracy. Report extraction coverage, semantic reading coverage, mapping review coverage, assertion review and public coverage separately with denominators.

Completion labels:

- Extraction/matching complete: all enumerated units processed by those steps.
- Available-corpus semantic pass complete: every accessible eligible unit contextually read and adjudicated; unavailable inputs explicitly listed.
- Whole-corpus semantic pass complete: all eligible inputs available and read, with justified exclusions; no hidden unread remainder.
- Scientifically reviewed/publicly eligible: only the corresponding actual review process can grant this status.

## 3. Assertion and comparison evidence

For every retained assertion preserve stable ID, endpoint revisions, exact relation key/direction, claim, rationale, conditions, evidence locators and source fingerprints. Mark direct support versus agent inference. Inspect whether the passage supports that specific relationship, not just whether it mentions both terms. Multi-hop paths do not create new direct claims.

Contradictions are scoped by domain, version, assumptions and source context. Keep unresolved disputes visible in review; do not silently choose whichever source makes a path complete. Retire or revise stale claims through an explicit change record without reusing an ID for a different meaning.

Comparison needs its own typed record:

`comparisonId, revision, optionRefs, question, criteria[], applicableContexts, evidenceRefs, reviewState`.

Each criterion includes label, source-backed values per option, conditions, unknown/unsupported state and explanation. A `contrasts_with` edge permits suggesting a comparison; it does not magically provide criteria or an overall winner. Only allow structured condition inputs that the data model actually supports. No free-text code execution or unsupported scoring.

## 4. Correct route planning

Observed implementation risk: `planRoute()` in the current corpus analyzer records shortest distance from targets and sorts by descending distance. That is not a general prerequisite ordering algorithm.

Required regression fixture, explicitly test-only:

```text
A requires B
A requires C
B requires C

From A, shortest depths are B=1 and C=1.
ID tie-breaking can put B before C even though B requires C.
Required order: C, B, A.
```

Build the relevant eligible prerequisite subgraph, evaluate supported conditions, detect cycles, and use a stable topological ordering in the prerequisite-before-dependent direction. Preserve the stored scientific direction A→B meaning A requires B; the traversal/order graph may reverse it internally and must name that conversion explicitly.

Support multiple targets, disconnected targets, missing resources, diamond dependencies, duplicate prerequisites and stable ties. Cycles in comparisons are valid; prerequisite cycles invalidate a complete prerequisite route. Unsupported conditions or a missing prerequisite yield incomplete/unsupported output with a useful explanation, not a confident complete route.

Represent ALL/ANY prerequisite groups explicitly where supported by reviewed content. Never infer OR from multiple incoming edges. Free-text conditions remain explanatory; executable rules use a small versioned allowlist. An unknown user starting point remains unknown. Self-report can customize an optional route but is labelled and reversible, not written into assessment progress.

Return `complete | incomplete | unsupported` separately from `basis: published-semantic | editorial-sequence | candidate-review`. Having a resource at every step does not establish scientific validity. If published prerequisites are unavailable, show a genuine existing editorial sequence with its basis or an honest gap.

## 5. Explainable recommendations and query boundary

Implement deterministic, local queries against an eligible snapshot:

- `getNeighborhood(context, relationFilter, limit)` with hidden counts and stable IDs.
- `explainConnection(assertionRef)` with actual evidence and conditions.
- `getNextActions(context)` with action eligibility and reasons.
- `previewBranch(context, targetRef)` without mutating the committed view.
- `resolveComparison(pair, conditions)` with unknown criteria preserved.
- `planGoal(goalRef, explicitStartingPoint)` with dependency/capability limitations.
- `resolveDeck(request)` without renderer or viewport logic.

Choose names consistent with existing modules. Results carry `graphBuildId`, `sourceIndexBuildId`, referenced revisions, targets, `reasonCode`, readable explanation, evidence/basis, limitations and permitted actions. Keep underlying retrieval scores internal and documented; never show them as truth confidence or exam readiness.

Filter by capability first, then rank by explicit goal/intent fit, current context, documented editorial ordering, availability and user-selected format. Use stable ID tie-breaking. Unknown progress is not zero ability. Explain each displayed recommendation; a source/resource relevance match is not a prerequisite.

Use a single manifest binding graph/source index/schema version/projection mode/chunk fingerprints. Reject mixed cached snapshots, stale asynchronous results and withdrawn evidence. Re-resolve context safely and report changed availability. Invalidation is dependency-based: changed source → affected mappings/assertions → recommendations/routes/decks. Old approvals do not silently transfer to changed claims.

## 6. Public output separation

Keep the editorial artifact local and separate. A public build must not import, embed, copy or serve candidate graphs, review notes, held answers or private evidence bodies. Audit HTML, serialized props, JS chunks, lazy data files, search indexes, source maps, service-worker caches if any, and the full static output directory. Review artifacts must not enter a deployable directory accidentally.

Public and review modes can share renderer code and schemas, but each receives its own prefiltered data. A query parameter, hidden button or runtime toggle must not unlock review records on a public route. The presence of `HANSA_ATLAS_REVIEW_PREVIEW` must not alter Home's public projection.

Test actual projection behavior with isolated synthetic eligible/ineligible fixtures clearly labelled test-only and never copied into live data. The current real public graph can remain empty. A test fixture of eligible data is necessary to prove the projector also admits legitimate records; a schema that permits only empty arrays proves little.

Preserve four independent capabilities: discover, readFull, assess, relate. Apply original source policies before serialization. `StudyRecord.status` is not a universal machine-readable authority; resolve the original insight/question/reference rules.

## 7. Generalize Dealer without inventing content

Version the successor schema and retain a compatibility adapter for the existing one-card prototype. Keep fixture constraints in fixture tests, not universal schema restrictions.

Suggested boundaries:

| Contract | Required meaning |
|---|---|
| `DeckOrigin` | Daily edition, concept/topic, goal or saved-selection reference; only registered implemented variants resolve |
| `DeckRequest` | Origin, intent/context, compatible revision references, safe return context |
| `DeckResolution` | Ready, empty, unavailable, unsupported or error; user-facing explanation and safe next action |
| `DeckDescriptor` | Stable identity/revision, title, provenance, reason for selection, cards, capability summary |
| `CardDescriptor` | Stable card ID, original ContentRef, permitted kind, evidence, reader payload/reference, allowed actions |
| `ReturnContext` | Version, scene, date/edition, selected concept/resource, intent, comparison pair, goal, bounded expansion and origin focus identity |

Zero cards is an explicit empty resolution. A ready deck has one or more real cards with a documented operational cap; do not make unlimited DOM rendering the fallback. `cardCount` is derived from actual cards, with equality validation. Support counts 0/1/many in the correct result shapes. Publishable collections are not constrained to zero; actual eligibility determines records.

Reuse the source-backed principle/caveat/evidence model without inflating idea counts. New card kinds require explicit renderer, semantic contract, text equivalent, source and tests. Unknown kinds return a permitted summary/link or unsupported state. Cards do not carry arbitrary executable code, unrestricted HTML or unchecked URLs.

Prove an additional provider with two supported contexts, not only a hard-coded OneLake name. A resource-backed concept adapter can work independently of Daily Insight editions. Show that a new source/provider needs no new branch in Home choreography and does not alter Dealer geometry. Full Topic/Goal Dealer UI is later; the resolver proof is required now.

## 8. Identity, persistence and safe return

Preserve original question IDs, revision overlays, assessment attempts and source routes including query/hash. Do not deduplicate solely by pathname. Reconcile reused Atlas IDs through an explicit crosswalk rather than duplicating concepts under new names.

Shareable URLs contain bounded public view identity only. Private progress, saved collections and full graph state stay out of URLs. Session view state stores IDs and revisions rather than pixel coordinates or complete source bodies. Validate local state, enforce caps and handle corruption.

Learning Thread records actual deliberate navigation and branches, separately from semantic assertions. Pocket records explicit saves. Neither updates completion. Do not merge existing progress stores or rename their keys. New presentation state uses its own versioned boundary.

On return, resolve current eligibility and compatible revisions before restoring. Removed concepts fall back to a valid resource/ancestor with explanation. Resize reflows geometry while retaining meaning. Reject external return hosts, unsafe protocols and arbitrary serialized state; preserve supported internal route/query/hash semantics through the owning router.

## 9. Required successor artifacts

Deliver a source reconciliation, revised semantic ledger, concept identity crosswalk, reviewed candidate mappings/assertions, comparison records, goal/condition model, gap/contradiction queue, projection build manifest, separate public/review outputs, query/contract tests, source-change delta report and runnable QA harnesses.

Do not require new permanent infrastructure for these artifacts. JSON/TypeScript and existing validators are sufficient when they enforce the needed semantics. Schema shape validity, factual correctness, review eligibility and visual quality remain separate claims.

