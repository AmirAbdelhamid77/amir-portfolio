# Content Model, Knowledge Edge Governance & Ingestion Contract

**Companion to `MASTER_SPEC_EN.md`. In all conflicts, the semantic-only connection rule is mandatory.**

## 1. Separate three stores by purpose

| Store | What it answers | Contents | Visually drawn as semantic graph edges? |
|---|---|---|---|
| Content catalog | Where is the resource? | Books, editions, chapters, lessons, labs, question banks, question IDs, project links, hierarchy, pages, order | **No** |
| Knowledge graph | What do these ideas mean together? | Canonical concepts, typed reviewed relationships, scope, conditions and evidence | **Yes, only published semantic edges** |
| User learning overlay | What has this user done? | Completion, attempted questions, weak concepts, bookmarks, view preferences | **No** |

There can be cross-index associations such as `ContentEntity.conceptIds` and `Concept.sourceRefs`. They connect data records but must not be drawn as claims of semantic relationships in the Atlas canvas.

## 2. Stable identifiers and names

Canonical concept IDs: `concept:<namespace>:<slug>`; example `concept:fabric:direct-lake`. Book IDs: `book:<source-slug>:<edition>`. Content IDs: `content:<kind>:<stable-id>`. Semantic edge IDs: hash or stable key derived from `sourceConceptId + relationType + targetConceptId + scoped claim key`. All ID generation should be collision-checked and normalized. Do not derive IDs from mutable display labels only. An alias table handles renames, synonyms and legacy mappings.

Namespaces avoid accidental conflation, but one canonical shared concept may legitimately belong to many subjects/books. Explicitly document concept split/merge decisions, redirects and implications for user progress, old bookmarks and question mapping.

## 3. Node taxonomy

- `fundamental_concept`: core term/idea with independently explainable meaning.
- `technology_mechanism`: architecture/runtime/storage mechanism.
- `method`: a technical technique with identifiable inputs/outputs.
- `decision_principle`: a decision criterion or meaningful trade-off.
- `skill`: a learnable capability (only when meaningful as a concept).
- `architecture_pattern`: reusable arrangement with constraints.

Avoid arbitrary labels with no standalone educational value, generic containers such as `Chapter 2`, and question IDs as canonical concept nodes. Use optional `maturity`, `difficulty`, `courseObjectives`, and labels only when supported by review; avoid treating them as empirically measured importance.

## 4. Semantic edge taxonomy

Each edge has a narrowly scoped `claim`, optional `conditions` and `counterexamples`, direction/symmetry, plain-language `rationale`, structured `evidence`, and editorial statuses.

| Relationship type | Direction | Semantics | Required guardrail |
|---|---|---|---|
| `requires_understanding_of` | A → B means A's study benefits from understanding B | Pedagogical prerequisite | NOT an official order unless evidenced |
| `enables` | A → B | A supports/enables B under specific circumstances | Conditions required |
| `contrasts_with` | symmetric | Critical differences between A and B | Comparable subject/dimension required |
| `tradeoff_with` | symmetric | Alternative choices given same decision frame | Trade-off axis and constraints required |
| `complements` | symmetric | Uses together in same workflow | Describe composition and limits |
| `related_in_decision` | directional or symmetric as documented | A & B jointly matter in a scenario decision | Explicit decision question |
| `part_of_mechanism` | directional | A technical part participates in functioning of B | Not chapter/section parenthood |

Label inverses clearly. Directed edges must not be traversed as proof of the inverse. `contrasts_with` isn't an assertion that one choice is universally preferable. `enables` doesn't assert exclusive dependency. Unreviewed links remain unpublished.

### Forbidden knowledge graph edge types

`contains`, `has_chapter`, `section_of`, `belongs_to_book`, `links_to_content`, `question_in_bank`, `teaches_in_course`, `tagged_as`, `co_occurs_with`, `mentioned_with`, `same_source_as`, `next_page`, `follows_in_toc`, and other administrative/catalog relations. If these are necessary, place in catalog/crosswalk metadata, **never as Atlas lines**.

## 5. Traceability and evidence levels

- **Source identity:** source/edition/version/date/URL or source file ID, chapter/page/section anchor, source kind (uploaded guide, official documentation, authored explanation, reviewed transcript, question item).
- **Support level:** direct source support; reasoned inference explicitly labeled; conflicting/partial evidence; no evidence.
- **Editorial state:** candidate → researched → technical_review → approved → published. Also rejected/superseded/withdrawn.
- **Access/rights:** public link vs private licensed document; do not expose source full text unless authorized.
- **Claim history:** what changed, why, when, reviewer role and previous edge version.

Strong links require readable answer to: "Why does this semantic relationship hold? In which conditions? Where can I verify it?" A source reference alone is insufficient without rationale. Never use fake reviewer identities, false timestamps or simulated approval. Every fixture is clearly marked sample/test data.

## 6. DP-600 content extraction pipeline

1. Verify and register exact original guide(s), hash and metadata; read original files rather than only the NotebookLM map PNG.
2. Extract document hierarchy and page/section positions to content catalog + TOC; audit against actual source pages and manual sampling.
3. Create page/heading coverage matrix with flags: extracted, parsed with ambiguity, mapped, scientifically reviewed, published.
4. Extract candidate concepts and aliases. Cross-check existing Hansa Fabric concept list and existing question mappings. Do not fork canonical concept IDs without rationale.
5. Suggest candidate semantic relations (agent may help) with condition-specific claims and evidence anchors. **Do not auto-publish**.
6. Review by appropriate technically competent reviewer against current Microsoft Learn and supplied guide. Classify accepted, rejected, disputed and needs runtime validation.
7. Export only published subset to static graph JSON; preserve candidate edges in QA records outside the public render/index.
8. Link content attachments (chapters, lessons, labs, questions) to approved concept IDs; record unresolved IDs and missing route states.
9. Validate that book TOC and graph relationship counts are separate. E.g., 80 sections do not imply 79 semantic connections.
10. On revision, diff sources, semantic claims, content references and route changes; re-review affected edges.

## 7. Learning content & question bank adapters

Questions remain where they are. `questionId`, `bankId`, `version`, `source`, `status`, `conceptIds`, `objectiveIds` and route link are catalog metadata. For each mapping record, know whether it was reviewed and whether an exam objective association is verified. Do not infer that every DP-600 question belongs to every related concept. A mapping to a question does not qualify as a knowledge graph edge; show questions in Inspector/Practice panel as resources attached to the concept.

Labs and case studies attach via catalog entries, may have topic-specific requirements, and are visible only when actually implemented. User progress stores attempt/completion data separately from source graph.

## 8. Versioned delivery contract

Build inputs: `catalog.json`, `concepts.json`, `semanticEdges.json`, `contentConceptIndex.json`, `evidenceIndex.json`, `taxonomy.json`, `sourceCoverage.json`. These can be split/sharded in production. `schemaVersion` and `buildVersion` required.

Validation before export:

- Every concept ID unique; no orphan semantic edge.
- Every edge endpoints exist, every `relationType` defined, every `published` edge has evidence, rationale, source-specific conditions where relevant.
- No self-relations except explicitly approved, conceptually defensible cases (default reject).
- No content-hierarchy relation among exported semantic edges; denylist validated.
- All content deep links resolve against route inventory or marked unavailable.
- No unreviewed edge in publicly shipped graph or search relationship index.
- No sensitive private source text or personally identifying learning analytics exported.
- Directed/symmetric relation and inverse labels consistent; duplicate asserted edges reconciled.
- Schema, data and coverage matrix cross-validate; no fabricated source/page/verified status.

## 9. Example semantic model

**Illustrative only; validate technical wording before publishing.**

- Node A: `concept:fabric:onelake-shortcut`.
- Node B: `concept:fabric:database-mirroring`.
- Edge: `tradeoff_with` under the decision frame "Provide analytic access to external operational data". Rationale must compare supported source types, physical data movement, freshness, permissions and operational constraints. Not universally substitutable.
- A and B could both be mapped to content in a Data Ingestion chapter; their common chapter **is not** the justification for the edge.
- A question that asks when to choose A references its `conceptIds`; it is a **resource link** in Inspector, **not** a drawn node/edge in knowledge canvas.

## 10. Cross-subject expansion contract

Adding a Statistics book or a Data Storytelling guide should require: registering the source, extracting its structural TOC, mapping to canonical concept IDs, proposing reviewed semantic relations, indexing linked content and generating a scope filter. No manual rewrite of the renderer. Graph browsing may choose a subject-scoped view; a future global view combines reviewed published edges only. Record license and attribution.

## 11. Maintenance & editorial UI (future, not required in v1)

An editor-only relation review workbench may visualize proposed edges in a quarantine workspace, allow evidence comparison, controlled approval and audit. It must be visibly separate from public Atlas with clear unreviewed labels and correct auth. Avoid deploying it as an unrestricted public route on a static site.
