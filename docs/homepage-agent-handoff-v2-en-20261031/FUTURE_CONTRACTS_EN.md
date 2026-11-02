# Hansa — Future Readiness and Extension Contracts

Version 2.0 · 31 October 2026 · Planning specification; no application changes are made by this document.

This is a required companion to [the agent guide](AGENT_GUIDE_EN.md) and [the Intelligent Interactive Knowledge Graph specification](INTELLIGENT_ATLAS_SPEC_EN.md). The latest owner requirement makes a data-derived, intelligent, interactive graph part of the next **full local implementation**. This is not an optional future replacement for a catalogue. The catalogue remains a complete discovery layer and accessible alternative within that product.

Names and example types below describe responsibilities. Reuse equivalent existing abstractions where they fit. Preserve the earlier Arabic documents as historical design records.

Whole-corpus semantic analysis and the associated graph/review artifacts are also mandatory in visual-review mode. Only the prototype's rendered subset and application integration boundary differ. Full local implementation additionally integrates and validates the complete experience; see START_PROMPT_EN.md for the selected assignment.

## 1. The experience that must survive later additions

The home experience supports three durable actions: **choose a moment, explore knowledge, take a learning step**. New content types, sources, and entry points should use the same selection, inspection, expansion, reading, and return behaviour.

`KnowledgeDealer` already exists in `components/knowledge/knowledge-dealer.tsx`. It accepts cards, a reader, and callbacks. `lib/knowledge/models.ts` prepares the current insight cards and reader content. The natural extension point is the boundary between content preparation and presentation. Reuse this component; do not create a different dealer for each screen.

A future topic or goal can open the same hand, with consistent source attribution, review status, focus, animation, and return context. The user can begin in the Timeline or Atlas and return to the exact context that opened the hand.

The graph must contribute meaning to this interaction: which concept or goal is involved, why a resource is relevant, which evidence supports that relationship, and what the user can choose next. Animation presents those decisions; it does not make them.

## 2. Required delivery, prepared boundary, later feature

| Capability | Required in the next full local delivery | Prepare now | Later feature when requested |
|---|---|---|---|
| Intelligent Interactive Knowledge Graph | Full eligible-corpus analysis; canonical concepts; typed, evidenced relationship extraction and review artefacts; explainable exploration, recommendation and goal-path behaviour under publication gates | Versioned graph and evidence contracts independent of Home layout | Additional intelligence capabilities beyond the agreed specification |
| Cross-domain understanding | Analyse all eligible domains; identify supported cross-domain concepts and bridge candidates; document source-policy changes needed for multi-domain validation | Domain-specific source adapters and explicit source authority; retain existing review/publication rules | Additional sources or domains outside the analysed website scope |
| Daily Dealer | Open the selected edition, inspect its cards, and locate its content in Atlas | Separate source preparation, session state, and graph context from presentation | Additional eligible editions through an editorial publishing workflow |
| Topic Dealer | No new public topic-deck feature is required in the initial home delivery | A small development-only adapter using real eligible content and the shared return contract | Editorially assembled topic decks and a public “Open this collection” action |
| Goal Dealer | Goal-oriented navigation and supported path explanation are already required in Atlas | Carry goal and graph context independently of card geometry | A full card-based goal session after its content and behaviour are specified |
| Comparison or experiment cards | Reuse an existing, eligible insight experiment where available | An explicit renderer boundary and an equivalent text presentation | New scientific comparisons or experiments after their content is validated |
| Saved decks | Restore the current visit's dealer state | Stable deck identity, content revisions, and a distinct session boundary | Persistence across visits, collection management, and migrations |
| Standalone Atlas | Use the shared explorer within Home | Navigation state and graph model independent of Home scroll coordinates | A standalone route using the same model and explorer |
| New content provider | Complete coverage of the current eligible website corpus | Provider adapters, stable identities, and a layout that tolerates changing counts | Onboarding additional external or newly authored material |
| Wider personal continuation | Read existing progress with its original meaning; explain unknown state | Read-only adapters with declared capabilities | New personal storage; accounts or cross-device synchronisation require a separate scope |

**Important scope distinction:** graph intelligence, full-site semantic analysis, and the associated review queue belong to the next full implementation. They must not be deferred by calling them “future readiness.” Topic/goal **Dealer interfaces**, permanent deck saving, and additional content types are later product features; their connection points are prepared now.

The current public graph having no published concepts or edges is a baseline constraint, not permission to skip analysis or deliver only a folder navigator. Complete extraction, identity reconciliation, evidence capture, validation, and review artefacts. Continue to respect publication gates: candidate extraction does not itself authorise public semantic assertions. Report missing publication decisions separately from completed engineering work.

Readiness is demonstrated by working boundaries and limited development fixtures. Do not add public “Coming soon” controls, empty tabs, or load unused future renderers into the first page.

## 3. Responsibility boundaries

| Boundary | Owns | Must not own |
|---|---|---|
| Home composition | Scene order, opening a surface, explicit scene navigation, focus handoff | Domain-specific truth, grading, relationship publication |
| Library index | Original resource identity, placements, canonical links, discovery metadata | A second editable copy of source content |
| Knowledge graph service/model | Canonical concepts, typed relationships, provenance, validated projections, graph queries | Unreviewed facts promoted through layout or similarity scores |
| Recommendation/path resolver | Context-sensitive eligible results, explicit reasons, evidence references, supported route choices | Invented prerequisites, silent mastery inference, guarantees of complete learning |
| Deck resolver | Interpret origin, resolve original sources, evaluate eligibility, prepare permitted cards | Rendering geometry or treating a recommendation as publication approval |
| Dealer presentation/session | Deck/hand/reader state, selection, focus, interruption and return | Answer validation, editorial-state mutation, source ingestion |
| Existing learning engines | Assessment rules, sessions, attempts, results, progress | Home's scroll or decorative state |

Prefer typed props, callbacks, pure queries and a local reducer when needed. Avoid a universal event bus, runtime plugin loader, executable JSON, or a speculative platform. Keep domain truth in its owning sources and rules.

The user-facing explorer, recommendation resolver and Dealer may share graph references without becoming a single large component. A new provider should not require a new `if (subject === ...)` branch in Home choreography.

## 4. Identity, revisions and provenance

Every card and recommendation must reference real content. A presentation ID never replaces an existing question, lesson or source ID.

```ts
// Illustrative contract sketch, not code to copy without checking local types.
type ContentRef = {
  sourceKind: string;       // Resolve only through an explicitly registered source family.
  originalId: string;       // Preserve the source's existing identifier.
  revision?: string;        // Use an actual source revision when one exists.
};

type GraphContext = {
  graphBuildId: string;
  conceptId?: string;
  goalId?: string;
  selectedEdgeId?: string;
  recommendationId?: string;
};

type ReturnContext = {
  version: 1;
  scene: 'timeline' | 'atlas';
  editionId?: string;
  subjectId?: string;
  topicId?: string;
  selectedResource?: ContentRef;
  graph?: GraphContext;
  ancestorIds?: string[];  // Bounded and validated; do not serialize the entire graph.
};
```

In implementation, narrow `sourceKind` to known variants or an explicit registry. It must never select an arbitrary import path or package. If source revisions are absent, a documented build-time content fingerprint can detect byte changes. Such a fingerprint is not evidence of scientific review.

Keep the following identities distinct:

- Resource identity and source revision.
- Canonical concept identity and concept revision.
- Relationship identity, assertion revision, and editorial state.
- Evidence identity, precise locator, source revision and review timestamp.
- Graph build ID and source-index build ID.
- Deck identity, deck content revision and presentation session ID.

A graph build ID identifies a consistent snapshot; it does not replace individual evidence or content revisions. A stable concept ID can collect several resources, aliases and languages. Resource-to-concept mappings are explicit records with provenance and review state, not proof obtained from similar titles.

Bind graphBuildId, sourceIndexBuildId, schemaVersion, projection mode and chunk fingerprints in one build manifest. A deck or recommendation must resolve against compatible snapshots; reject and recover from mixed cached chunks rather than combining old source evidence with new assertions. Preserve valid context during recovery and distinguish this check from ignoring stale asynchronous responses.

Preserve query parameters and anchors in resource links. Multiple placements point to one original resource. Do not deduplicate solely by pathname or duplicate a question because a revision overlay presents it elsewhere. A changed revision does not erase a past attempt or redefine the user's saved answer.

Resource mappings may exist before a semantic concept is published. Keep the resource discoverable according to its own policy; do not display its unapproved concept as a published graph node.

## 5. Graph recommendations are inspectable results

Recommendations and goal paths must produce a small, explicit result envelope rather than opaque text or an arbitrary UI payload. Use a result shape consistent with the main graph specification, containing at least:

| Field | Purpose |
|---|---|
| `id`, `graphBuildId`, `sourceIndexBuildId` | Reproducible identity and the snapshots used |
| `context` | Selected concept/resource/goal and relevant user-selected filters |
| `target` | A validated concept, resource or path reference |
| `reasonCode`, `explanation` | Why this suggestion is useful in this context, in readable language |
| `relationshipRefs` | IDs and revisions of the assertions used, where applicable |
| `evidenceRefs` | Precise references supporting the explanation |
| `basis` | Published semantic relation, explicit editorial sequence, source mapping or labelled discovery relevance |
| `limitations` | Missing mappings, incomplete route support, unknown progress or other material uncertainty |
| `allowedActions` | Only currently supported and eligible actions |

Recommendation relevance is different from scientific confidence. A ranking score, when useful internally, must be documented and must not be shown as a probability of truth or mastery. Similarity may retrieve candidates; it cannot by itself justify a “requires” edge. “Why this?” must expose the actual reason and evidence, including when a result is simply relevant reading rather than a prerequisite.

A recommendation can offer a choice to expand, inspect evidence, open a resource, follow a supported path or return. It must never silently unlock/lock learning, change a review state, or write an assessment result.

When a graph build changes, re-resolve the target and supporting relationship/evidence references. If they have been withdrawn, revised or made ineligible, invalidate the previous explanation. Offer a valid parent/resource fallback and explain the change. A cached result is not authority to retain an old assertion.

## 6. Requesting a deck from a context

```ts
// Future origin variants describe extension boundaries, not launched features.
type DeckOrigin =
  | { kind: 'daily'; editionId: string }
  | { kind: 'topic'; subjectId: string; topicId: string }
  | { kind: 'goal'; goalId: string };

type DeckRequest = {
  origin: DeckOrigin;
  graphContext?: GraphContext;
  expectedContentRevision?: string;
  returnContext: ReturnContext;
};
```

The initial public dealer origin is `daily`. A development-only topic adapter may prove extensibility using eligible material without shipping the full Topic Dealer. Goal navigation within Atlas is core; a Goal Dealer session remains a later interface feature. Implement only supported variants, or handle unsupported variants explicitly.

Graph context helps explain relevance and restore focus. It grants no extra content rights. A goal ID or recommendation ID must be resolved against the relevant snapshot and current eligibility. The request does not contain secret answers, `ignoreReview` switches, raw claims, or an arbitrary return URL.

The resolver returns a discriminated result such as `ready`, `empty`, `unavailable`, `unsupported` or `error`, with a useful next action. Unsupported or unavailable requests must not leave an empty modal.

Open/close behaviour never waits for animation completion. When a static chunk must load, show a meaningful title and context, with an immediate close action. Cancelled or superseded requests cannot populate a later session with stale results.

## 7. Deck and card descriptors

`DeckDescriptor` contains a stable group ID, content revision when available, title, reason for presentation, origin, source references, optional graph context and card descriptors. When a recommendation motivated the deck, retain a validated reference to that recommendation and its explanation/evidence rather than copying an uncontrolled payload into the deck.

Descriptors are serializable data. Do not put React nodes, executable callbacks or unchecked HTML into content data. A known renderer builds the reader from the permitted card kind and its validated fields.

`CardDescriptor` contains a stable card ID, a specific kind, `ContentRef`, title/summary, a limited permitted reader payload or detail reference, editorial label, permitted actions and a text equivalent. An adapter around the existing card model is preferable to replacing it with a generic framework.

The current `principle`, `caveat` and `evidence` kinds keep their precise meaning. A later `comparison` or `experiment` needs a typed contract, explicit renderer, scientific source, accessible text equivalent, interaction rules and meaningful validation. Unknown kinds receive a useful permitted summary/link or an explicit unsupported state; never silently disappear.

Action types may include opening a known internal resource, opening an external source, locating an item in Atlas, inspecting relationship evidence, or entering an existing assessment engine. Validate destinations and make their meaning visible. A “Test yourself” card does not become a new grading engine implicitly.

Deck/hand/reader state is presentation state. Moving a card into the hand is not reading completion. Collecting cards is not deleting progress. Closing a reader is not answering a question.

## 8. Four independent content capabilities

| Capability | Authority | Example |
|---|---|---|
| `discover` | Source visibility policy and public resource index | A title and permitted link can be discoverable |
| `readFull` | Source rights and text publication policy | `LINK_ONLY` permits a description/link, not republishing the full source |
| `assess` | Original assessment engine and question review policy | A `HOLD` question remains unscored even when visible in a review library |
| `relate` | Validated, published semantic graph projection | Catalogue membership does not publish a concept or scientific assertion |

Do not infer these capabilities from `StudyRecord.status`, an existing href, or a recommendation score. In the current code, some insight records in `study/server.ts` inherit a lesson's `base.status`; their resolver must consult the original `insight.reviewStatus` and insight eligibility policy.

Apply eligibility while preparing data before serialization. Hiding a button does not undo leaking an ineligible payload into the page. Keep R11 assessment holds, insight preview labels and reference rights intact.

Home requires an explicitly public graph projection. Test with `HANSA_ATLAS_REVIEW_PREVIEW` accidentally enabled to ensure candidate concepts, mappings, assertions and evidence do not enter public client props. Development review surfaces must remain explicit and isolated.

The new all-site graph will need a reviewed source policy beyond the current Microsoft-only validation scope. Analyse and propose those adapters and rules as part of core graph work, using domain-appropriate sources and precise evidence. Preserve the older DP-600 contracts; do not broaden them with a permissive “accept any URL” expression.

## 9. State ownership, storage and return

| State | Owner | Rule |
|---|---|---|
| Shareable edition, scope, concept/resource selection and goal | One URL serializer | Push deliberate navigation; replace corrections; do not write every hover/scroll frame |
| Dealer hand and reader within a visit | Dealer session | Key by origin and group identity; separate editions and sources |
| Expanded neighbourhood, filters and return context | Atlas/session state | Restore by identity; recompute geometry after resize |
| Recommendation/path snapshot | Graph resolver with bounded cache | Validate build and dependency revisions before reuse |
| Assessment attempts and results | Existing learning engine | Home does not overwrite these stores |
| Permanent saved collections | A later independent feature | Versioned schema/key, size bounds, corruption handling and explicit migration |

Do not merge `amir-lab-v1`, `amir-fabric-v1`, additions/R11/Academy and Atlas journey stores into a new universal store. Read-only progress adapters preserve original meanings such as started, completed, result, or unknown. No recorded progress is not zero mastery. Do not aggregate unlike measures into a global mastery percentage.

The existing `atlasReturn` contract is DP-600-specific. Preserve its meaning. Add a separate Home return contract or a compatible extension only after inspecting all callers. Allow known internal routes/IDs, bounded data and recognised parameters; reject unsafe protocols, external hosts and arbitrary serialized state. Invalid input restores a valid parent or overview with an explanation.

Save the selected resource/concept, semantic mode and essential ancestors/filters; avoid serializing the entire expanded graph or private learning data into a shareable URL. Goal or progress context that is personal remains local unless explicitly shared. On a different viewport, restore the same meaning rather than stale screen coordinates.

When persistent deck saving is implemented later, resolve current content again on resume, compare revisions, restore eligible cards and explain withdrawn or changed material. Do not use saved payloads to bypass current review policy or erase historical assessment attempts. Do not build speculative storage migrations now.

## 10. Invalidation and incremental growth

Maintain explicit dependencies from source fragments to mappings/concepts/assertions and from those to recommendations, paths and decks. This can be a deterministic build manifest; a new database is not required.

When a source fragment changes:

1. Identify affected derived records through provenance references and fingerprints.
2. Mark their review or freshness state according to policy; do not silently carry old approval onto a changed assertion.
3. Re-extract/reconcile affected candidates while preserving stable IDs when the underlying identity still exists.
4. Rebuild the appropriate public projection and invalidate dependent recommendations and deck resolutions.
5. Produce a human-readable change report: added, revised, merged, split, withdrawn, unmapped and unchanged records.
6. Preserve older references through explicit aliases/redirect mappings where appropriate; never silently repurpose an ID to a different concept.

Whole-site analysis is required for the initial graph. Incremental rebuilding is for later changes, after the baseline and coverage ledger exist. A faster incremental build must not become an excuse to skip a source family.

## 11. Visual and motion extensibility

The same motion vocabulary serves additions: selection clarifies, expansion reveals containment or a chosen relation, movement preserves the reference, and return restores context. Deck providers and graph queries contain no viewport measurements or animation durations. Presentation reads semantic state; motion does not decide eligibility or graph membership.

Semantic zoom and adaptive neighbourhoods use the graph model and user context defined in the main graph specification. Meaning is preserved as detail changes. A resource, concept, grouping and evidence item retain distinguishable roles. A visual cluster is not automatically a scientific relationship.

The vignette, domain overview and focus layout must tolerate changing domain counts. Eight is a description of the current taxonomy, not a permanent layout requirement. Use clustering, paging, list/search and progressive detail for density, with complete discoverability. Do not hardcode coordinates for every lesson in Home.

Card kinds can constrain their own reader presentation while sharing close, focus and return behaviour. Complex interactions belong in an appropriately sized reader or original learning destination. Use statically analyzable imports and load specialised renderers only when needed.

Mobile, list view and reduced motion are presentations of the same content and state. They must not create different progress stores or independent graph truth. A new capability must retain a non-gesture and text/list equivalent.

## 12. Acceptance tests for readiness

| ID | Small, meaningful test | Evidence of readiness |
|---|---|---|
| E01 | Resolve a development-only Topic Deck using real eligible content through an additional adapter | A new entry context does not change Home scene order or Dealer geometry |
| E02 | Open that deck from an Atlas topic, open a resource, return, then resize | Topic, concept/resource, branch and card restore by identity |
| E03 | Change a fixture resource's eligibility between resolve and reopen | Current policy is applied, the change is explained and existing learning progress is untouched |
| E04 | Exercise an unknown kind, `LINK_ONLY`, a `HOLD` question and an unpublished concept | A clear permitted fallback; no cross-capability privilege escalation |
| E05 | Add a labelled test-only resource/domain to the provider fixtures | Index, graph ingestion, coverage, search and layout do not depend on the number eight or hand-coded per-lesson branches |
| E06 | Switch the same selection to list view and reduced motion | Identical content, state and return behaviour without storage migration |
| E07 | Revise/withdraw a relationship used by a recommendation | Cached reasons and paths are invalidated; current evidence is resolved before reuse |
| E08 | Supply a stale graph build, missing concept or unsupported goal in a DeckRequest | Bounded re-resolution or a useful fallback; no arbitrary payload or stale assertion is rendered |
| E09 | Trace a recommended card to its original resource, graph relation and evidence locator | The explanation is inspectable and does not substitute ranking for proof |

E01–E09 exercise actual boundaries with the smallest useful fixtures. They do not require publicly launching future Dealer interfaces or adding permanent collection storage. Saved-collection migration tests become necessary when saving itself is requested. The larger graph acceptance matrix remains mandatory in [the graph specification](INTELLIGENT_ATLAS_SPEC_EN.md).

## 13. Features that are not automatically authorised

Accounts, cloud synchronisation, paid backends, a runtime LLM card generator, spaced-repetition scheduling, readiness scores, a CMS, predictive personalisation and a 3D renderer are not prerequisites for this delivery. If later requested, each needs its own source, privacy, cost and validation decisions. Do not make the core graph depend on them.

The agent may use its reasoning during corpus analysis to propose candidates with traceable evidence. Runtime intelligence must follow the implementation scope and publication rules in the main graph specification. Automatic extraction and a sophisticated UI do not grant scientific approval.

## 14. Repository evidence to recheck

- `components/knowledge/knowledge-dealer.tsx`: the existing cards/reader/callback presentation boundary.
- `lib/knowledge/models.ts`: current CardKind, insightCards and cardBody preparation.
- `lib/knowledge/insights.ts`: edition eligibility and explicit preview rules.
- `lib/study/taxonomy.ts`: StudyRecord and its free-text status field.
- `lib/study/server.ts`: source aggregation and insight insertion.
- `lib/study/learning-path.ts`: existing editorial sequence and learning mappings, distinct from published Atlas assertions.
- `lib/atlas/model.ts`: semantic types, publication gates, link restrictions and DP-600 return handling.
- `lib/atlas/server.ts`: the review-preview environment flag.
- `lib/site.ts`: canonical/alias/navigation contracts.

Completion criterion: the agent can identify and demonstrate where a new provider, card kind, graph-supported entry context, domain or resource is added, while preserving identity, evidence, eligibility, focus, return and progress. The required intelligent graph itself must be delivered and evaluated under its full specification rather than represented only by these extension boundaries.
