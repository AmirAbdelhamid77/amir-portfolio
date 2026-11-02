# Intelligent Atlas — delivery report

Date: 2026-10-31 (prototype fixed clock); final verification 2026-11-01  
Status: **delivered as an isolated review prototype**. No live-app integration,
no deployment, no new dependency, no paid service.

Repository root for all paths: `D:/BeUI/amir-portfolio`. Work is contained in
`intelligent-atlas/`; the existing dirty application tree was preserved.

## 1. Outcome

The deliverable has four parts:

1. a full-corpus semantic analysis of the eligible repository corpus, with a
   unit-level ledger, canonical concepts, mappings, evidence-backed candidate
   assertions, ambiguity/contradiction registers and coverage evidence;
2. a five-frame visual storyboard and a standalone interactive prototype that
   follows date → card → graph context → supported action → return;
3. a fail-closed public projection that truthfully publishes nothing while the
   candidate graph remains in editorial review;
4. reuse/extension contracts for the KnowledgeDealer and a development-only topic
   adapter proof.

The prototype is intentionally **not** wired into `app/`. It runs from
`file:///D:/BeUI/amir-portfolio/intelligent-atlas/prototype/index.html` with no
fetch, bundler or server.

## 2. Deliverables

| Area | Key files |
| --- | --- |
| Corpus extraction | `tools/build-corpus.mjs`, `analysis/units.jsonl`, `analysis/corpus-manifest.json` |
| Semantic analysis | `tools/semantic-model.mjs`, `tools/analyze-corpus.mjs`, `analysis/units-analyzed.jsonl`, `analysis/mappings.json` |
| Graph | `analysis/graph-build.json`, `analysis/assertions.json`, `analysis/concepts.json` |
| Coverage | `analysis/coverage-report.md`, `analysis/analysis-summary.json` |
| Review registers | `analysis/ambiguities.json`, `analysis/contradictions.json`, `analysis/review-queue.json` |
| Public projection | `analysis/public-projection.json`, `prototype/public-data.js` |
| Prototype | `prototype/index.html`, `prototype/styles.css`, `prototype/app.js`, `prototype/data.js` |
| Storyboard | `storyboard/storyboard.html`, `storyboard/storyboard.md`, 5 frames + 16 appendix images |
| Contracts | `contracts/contracts.schema.json`, `contracts/knowledge-dealer.md` |
| Adapter proof | `contracts/adapter-proof.mjs`, `contracts/adapter-proof.test.mjs`, `contracts/adapter-proof.md` |
| QA evidence | `evidence/browser-qa.md`, `evidence/browser-qa-core.json`, `evidence/browser-qa-interactions.json`, forced-colors JSON/PNG |
| Preservation | `evidence/baseline-preservation.json`, `evidence/baseline-verification.json` |

## 3. Full-corpus analysis

### 3.1 Source coverage

| Measure | Value |
| --- | ---: |
| Sources | 22 |
| Extracted units | 6,201 |
| Media references | 628 |
| Routes discovered | 73 |
| Eligible learning units | 4,337 |
| Mapped | 3,609 (83.2% of eligible) |
| Unmapped, reason-coded | 728 (16.8% of eligible) |
| Metadata-only excluded | 1,859 |
| Non-learning public pages excluded | 5 |
| Pending eligible units | 0 |

Every extracted unit has an explicit disposition. Unmapped is a recorded state,
not a silent drop or a pending queue.

### 3.2 Unmapped reasons

| Reason | Units |
| --- | ---: |
| `question-paraphrase` | 186 |
| `no-lexical-signal` | 170 |
| `procedural-step` | 148 |
| `formula-fragment` | 79 |
| `template-boilerplate` | 74 |
| `thin-fragment` | 46 |
| `navigation-index` | 16 |
| `domain-not-modelled` | 9 |

Held answers, options and explanations remain excluded. Question stems are mapped
with role `practices`; no answer is used as evidence.

### 3.3 Concept registry and assertions

| Measure | Value |
| --- | ---: |
| Canonical concepts | 132 |
| Concepts with corpus support | 130 |
| Registry-only concepts (retained and flagged) | 2 |
| Candidate mappings | 7,309 |
| Distinct mapped resources | 2,665 |
| Typed candidate assertions | 86 |
| Direct support | 69 |
| Inferred support (explicitly labelled) | 17 |
| Cross-domain assertions | 12 |
| Evidence passages resolved | 224 |
| Published concepts / assertions | 0 / 0 |

Registry-only concepts: `concept:analysis:evidence-strength`,
`concept:fabric:z-order`.

Assertion types: `requires_understanding_of` 37, `enables` 7,
`contrasts_with` 7, `tradeoff_with` 4, `complements` 4,
`related_in_decision` 17, `part_of_mechanism` 10.

Integrity: 0 prerequisite cycles, 0 enabling cycles, 0 dangling endpoints.
Comparison/trade-off cycles are allowed and are not treated as prerequisite
failures. One assertion crosswalks to an existing Atlas edge
(`assert:ia:fabric-shortcut-mirroring` ↔ `edge:fabric:reference-replica`).

### 3.4 Goals

All three candidate routes are supported by recorded resources and have no gaps:

| Goal | Steps | Gaps |
| --- | ---: | --- |
| Read existing OneLake data without building another copy | 2 | none |
| Choose a chart that survives an integrity and accessibility review | 7 | none |
| Decide whether an observed difference is real or sampling noise | 5 | none |

Routes are proposals over candidate prerequisites, not published curricula and
not mastery estimates.

### 3.5 Analysis status

**PASS** for the stated scope: every unit has a disposition, every candidate
assertion resolves to a verbatim corpus passage, and the graph has no dangling
endpoints or prerequisite cycles.

**LIMITS**: the matcher is deterministic lexical matching with a confidence
threshold, not an embedding model. 628 media references were analysed through
captions/alt text only. The contradiction register is a first-pass editorial
classification; 1 item remains open.

## 4. Graph construction

- `graphBuildId`: `ia-graph-bed4e12d0986`
- Ledger fingerprint: `bed4e12d09866bcf1cb7d997b31a6d21a22c79065f7f9166a905e57fabd1aced`
- Nodes: 132 candidate concepts
- Edges: 86 candidate assertions
- Goals: 3
- Mode: `editorial-review`
- `publicEligible`: `false`
- Published: 0 concepts, 0 assertions

The graph is candidate-only. A node is not a published concept; an edge is not a
published semantic relation. The public projection is built separately and
excludes every candidate record.

## 5. Editorial readiness

The three real OneLake insight editions (24, 25, 26 October) are
`technical_review`. They are source-checked, not human-approved.

| Gate | State | Meaning |
| --- | --- | --- |
| Human publication review | `blocked` | No human approval |
| Scientific review | `pending` | Domain accuracy not independently reviewed |
| Rights review | `pending` | Media/text reuse not cleared |
| Assessment review | `not-applicable` | No assessment item published |

Review queue: 132 concepts, 86 assertions, 7,309 mappings, 11 ambiguities,
4 contradictions.

**BLOCKED**: publication. **PENDING**: scientific and rights review. No human
publication, scientific, rights or assessment review was completed. The
prototype does not change that state.

## 6. Public coverage

`analysis/public-projection.json` and `prototype/public-data.js` contain:

- 0 published concepts;
- 0 published mappings;
- 0 published assertions;
- withheld: 132 concepts, 7,309 mappings, 86 assertions;
- structural counts (22 sources, 6,201 units, 73 routes) explicitly marked as
  discovery counts, not semantic coverage.

Public mode:

- renders an empty graph plate with a “nothing published” notice;
- hides candidate concepts, edges, legend, expand control and goals;
- withholds candidate concepts and assertions in the Dealer;
- keeps editorial insight cards only as clearly labelled previews;
- never renders a candidate edge as a published relation.

**PASS** for fail-closed behavior (verified by the interaction suite).

## 7. Prototype and visual review

### 7.1 What was built

A standalone journey with three scenes and a Dealer overlay:

1. **Timeline** — 14 dates, 18–31 October; 3 real editions (24/25/26); 11 honest
   “No edition” dates; fixed clock 31 October 2026.
2. **Dealer** — edition rail, one-card hand, card reader, evidence view,
   destination preview, return context; single-card editions enforced.
3. **Atlas** — three islands (OneLake, visualization, inference), focused island
   plus aggregate cards, search, lens filters, list alternative, goal routes,
   concept/edge/resource detail, review register, About/coverage note.
4. **Closing** — real practice route preview, return to the edition, coverage
   note; no completion badge or fabricated result.

Bounded real subset: 59 concepts, 46 edges, 166 resources, 3 insights, 3 goals,
11 ambiguities, 4 contradictions.

### 7.2 Representation and library rationale

| Decision | Why |
| --- | --- |
| Timeline as a ledger, not a carousel | Makes missing editions and the fixed clock visible; avoids implying future content |
| “Semantic archipelago”, not a full graph | Only real connected components are islands; no invented bridges |
| Focused island + aggregate cards | Keeps a bounded region readable; “show all” reveals the full region |
| List view as a complete alternative | The graph is never the only path to a concept |
| Single-card Dealer, `maxItems: 1` | The real corpus has one card per edition; multi-card would require invented content |
| Evidence/destination as reader states | Avoids nested dialogs and duplicate focus traps |
| Vanilla HTML/CSS/JS, no new library | Static `file://` delivery, no bundler, no dependency or paid service |
| Deterministic local force layout | Reproducible positions, no runtime LLM or remote layout service |

No new component library, chart library or backend was added.

### 7.3 Accessibility and responsive behavior

- Keyboard: Home/End/arrows/Enter, Tab/Shift+Tab focus trap, Escape backs out one
  level, focus returns to the opener.
- Mobile: 320/390/768 have no horizontal overflow; Dealer body scrolls as one
  surface at 320/390; 768 keeps two columns with an internally scrolling reader.
- 1280 × 900: card actions visible without inner scroll.
- Reduced motion: static stacked layout; deal animation removed.
- Themes: light, dark, forced-colors; dark persists.
- Public mode: fail-closed; candidate data withheld.
- List view: complete accessible alternative (24 rows, 1 group in the test).

### 7.4 Verification

| Check | Result | Evidence |
| --- | --- | --- |
| Core keyboard/modal/history/restore/responsive | **44 / 44 PASS** | `evidence/browser-qa-core.json` |
| Interaction/public/search/goals/return | **21 / 21 PASS** | `evidence/browser-qa-interactions.json` |
| Forced colors | **PASS** (14 cards, 0 overflow, Dealer + register open, 0 errors) | `evidence/browser-qa-forced-colors.json` |
| Console/page errors | **0** | QA JSON files |
| Storyboard page | 21 images load, 0 horizontal overflow at 1280 and 390 | local Playwright check |

Screenshots: 5 desktop frames and 16 appendix images in `storyboard/`. The
storyboard document annotates each frame and links the QA/contracts/report.

## 8. Contracts and extension

- `contracts.schema.json` — JSON Schema 2020-12 for `DeckRequest`, single-card
  `Edition`, `EditionCard`, `EvidenceRecord`, `ReturnContext`, `DealerState`,
  `DealerEvent`, `PublicationGates`, `PublicProjection`.
- `knowledge-dealer.md` — reuse/extension contract, state machine, accessibility,
  publication gates, adapter rules, versioning.
- `adapter-proof.mjs` — loads `data.js` through Node `vm`, resolves the three
  OneLake editions, builds and validates a `DeckRequest`, simulates 10 Dealer
  states, rejects 6 invalid requests, verifies zero published data.
- `adapter-proof.test.mjs` — 7/7 tests pass.
- `adapter-proof.md` — run instructions, result, event sequence, limits.

Contract enforcement includes `Edition.cards` `maxItems: 1`, `cardCount` const
`1`, `publicEligible: false` for the current corpus, and a development-only
adapter identity. The adapter proof is not a production service.

## 9. Verification summary

| Command | Result |
| --- | --- |
| `node --check intelligent-atlas/prototype/app.js` | **PASS** |
| `node --check intelligent-atlas/contracts/adapter-proof.mjs` | **PASS** |
| `node --check intelligent-atlas/contracts/adapter-proof.test.mjs` | **PASS** |
| PostCSS parse of `prototype/styles.css` | **PASS** (77,087 chars) |
| ESLint `no-undef` on `app.js` | **PASS** (0 errors, 0 warnings after cleanup) |
| `node intelligent-atlas/contracts/adapter-proof.mjs` | **PASS** (26 checks) |
| `node --test intelligent-atlas/contracts/adapter-proof.test.mjs` | **7 / 7 PASS** |
| Core browser QA | **44 / 44 PASS** |
| Interaction browser QA | **21 / 21 PASS** |
| Forced colors | **PASS** |
| Baseline preservation (99 recorded paths, byte-for-byte) | **99 / 99 unchanged** (`evidence/baseline-verification.json`) |
| `node scripts/verify-agent-reference.mjs` | **FAIL** — pre-existing `lib/atlas/field.ts` drift |
| `node scripts/verify-knowledge-atlas.mjs` | **FAIL** — same pre-existing drift |

The baseline verifier failure is not caused by this work:

- actual `lib/atlas/field.ts`:
  `da571a671ce66a538f6050e6fe8d8ae3caf6b5e4a4befe6ea184e598a9d8af95`
- expected:
  `79f985b31e5010a8ad2c910c45bd934bc34841217881fdca9273e991790001ff`

The expected hash was not changed and the file was not edited by this task.

**NOT RUN**: live application build, live-route QA, deployment, real
screen-reader testing, Firefox/Safari, physical mobile devices, formal WCAG/axe
audit, visual review of the underlying media.

## 10. Costs and dependencies

- New paid services: **none**.
- New dependencies: **none**.
- New backend: **none**.
- Deployment: **none**.
- Browser QA uses the already-installed Microsoft Edge and `playwright-core`
  from the repository's existing `node_modules`.
- The prototype is static and can be opened directly from disk.

## 11. Affected files and routes

- Added: `intelligent-atlas/` (65 files, including generated analysis, prototype,
  storyboard, contracts and QA evidence).
- Modified by this task: **no application files**.
- Routes changed: **none**. The prototype references existing routes such as
  `/learn/dp-600/ingestion/` and `/lab/dp-600/explore/` as preview strings; it
  does not execute or alter them.
- Pre-existing dirty tree: 99 paths recorded at HEAD
  `45704b586237ae26a4c55be944d27147e84f491b` in
  `evidence/baseline-preservation.json`. A byte-for-byte recheck found **0
  changes** across those 99 paths (`evidence/baseline-verification.json`).

`git status` confirms `intelligent-atlas/` is the only new directory from this
work; the existing application edits remain as they were.

## 12. Caveats

- Candidate data is not published data. The public projection is empty by design.
- The analysis matcher is lexical and reproducible, not a semantic embedding
  model; 728 eligible units remain explicitly unmapped.
- Media was not independently visually reviewed; captions/alt text only.
- The review register is corpus-level and pattern-based; it is not a set of
  approved semantic assertions.
- The prototype uses a bounded 59-concept subset, not the 132-concept graph and
  not the full 6,201-unit corpus.
- Screenshots show one state per viewport; interaction claims rest on the
  automated suites, not on the images.
- No human publication, scientific, rights or assessment review has been
  completed.
- The baseline verifier failure is a pre-existing repository drift and must be
  resolved by the owner of `lib/atlas/field.ts`, not by changing expected hashes.

## 13. Rollback

Delete `intelligent-atlas/`. No application file, route, database, environment
variable or deployment was changed. The pre-existing dirty tree is untouched;
do not reset, clean or stash it.

## 14. Next atomic task

**Human-review the 26 October OneLake shortcut card against its recorded source
locator and record the publication decision for that single card.** Do not
publish it and do not change the public projection. This is the smallest unit
that can move a gate; the remaining cards, assertions and rights review follow
only after that decision is recorded.

## 15. Completion-contract checklist

| Requirement | Evidence |
| --- | --- |
| Inventory / source coverage | `analysis/corpus-manifest.json`, `analysis/coverage-report.md` |
| Unit-level ledger and dispositions | `analysis/units.jsonl`, `analysis/units-analyzed.jsonl` |
| Canonical concepts and mappings | `analysis/concepts.json`, `analysis/mappings.json` |
| Evidence-backed typed relations | `analysis/assertions.json`, `analysis/graph-build.json` |
| Ambiguity / contradiction reports | `analysis/ambiguities.json`, `analysis/contradictions.json` |
| Coverage evidence | `analysis/coverage-report.md`, `analysis/analysis-summary.json` |
| Prototype journey | `prototype/index.html`, `app.js`, `styles.css` |
| Real subset and provenance | `prototype/data.js`, `prototype/data-provenance.json` |
| Public fail-closed projection | `analysis/public-projection.json`, `prototype/public-data.js` |
| Storyboard and visual evidence | `storyboard/storyboard.html`, 21 PNGs |
| Keyboard/mobile/motion/back-restore QA | `evidence/browser-qa.md`, 3 QA JSON files |
| Reuse/extension contracts | `contracts/contracts.schema.json`, `contracts/knowledge-dealer.md` |
| Development-only adapter proof | `contracts/adapter-proof.mjs`, `adapter-proof.test.mjs` |
| Costs / no paid service | section 10 |
| Caveats / rollback / next task | sections 12–14 |
