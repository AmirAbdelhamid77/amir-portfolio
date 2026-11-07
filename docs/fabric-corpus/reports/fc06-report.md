# FC06 report — curriculum bindings, collections and reading UI

Status: complete. Agent FC06, 2026-11-05. Worktree `amir-portfolio-fabric`,
branch `feat/fabric-corpus-20261105`, HEAD `e35724c`. Route registry frozen by
FC05 (registry revision `27c39e13…`, corpus revision `774592ea…`).

## Scope delivered

- `content/fabric/bindings/build-bindings.mjs` — deterministic generator
  (registry + compiled front matter → binding artifacts; no clock in output).
- `content/fabric/bindings/primary.json` — 2,705 primary LearningBindings
  (`lb:<articleId>@<subject>.<topic>`, IDENTITY_REGISTRY §ID scheme).
- `content/fabric/bindings/secondary.json` — 284 cross-subject placements,
  each with its rule id, ≤2 per article.
- `content/fabric/collections/collections.json` — 160 per-topic reading
  collections (docs subdirectory × document class).
- `lib/fabric/bindings.ts` — server-safe fail-closed loaders (fs + JSON.parse
  inside lazy per-dir cached readers; no JSON imports at module level;
  erasable-only syntax so `node --experimental-strip-types` imports it).
- `components/fabric/reading/ReadingCollections.tsx` — self-contained RSC
  (no client JS) rendering a topic's collections; wired by the LEAD, not by
  FC06.
- `tests/fabric-corpus/bindings/*.test.mjs` — 30 tests covering deliverables
  (a)–(f).

## Family → topic map (deterministic, one-line rationale)

| Family | Topic (fabric.*) | Rule id | Rationale |
|---|---|---|---|
| admin | security | F-ADMIN | Tenant/admin-center governance of estate access and settings. |
| apps | delivery | F-APPS | Fabric Apps authoring, publishing, authentication and monitoring lifecycle. |
| cicd | delivery | F-CICD | Git integration and deployment pipelines are the lifecycle & operations topic. |
| data-engineering | transform | F-DATA-ENGINEERING | Spark, notebook and Delta transformation work. |
| data-factory | ingestion | F-DATA-FACTORY | Pipelines, copy jobs and orchestration move data into the estate. |
| data-science | transform | F-DATA-SCIENCE | Notebook/Spark experimentation; analytical cross-placement attached as a secondary. |
| data-warehouse | query | F-DATA-WAREHOUSE | Warehouse content centres on T-SQL analytical querying. |
| database | query | F-DATABASE | SQL database content is T-SQL relational querying (deviation from the seed-map example, see Deviations). |
| embed | streaming | F-EMBED | All embed-family articles embed Real-Time Dashboard items. |
| enterprise | delivery | F-ENTERPRISE | Capacity, billing, licensing and capacity planning are estate operations. |
| extensibility-toolkit | foundations | F-EXTENSIBILITY | Documents the platform extension architecture (workloads, items, auth). |
| fundamentals | foundations | F-FUNDAMENTALS | Platform fundamentals and architecture introductions. |
| governance | security | F-GOVERNANCE | Governance is half of the security & governance topic. |
| graph | query | F-GRAPH | GQL graph querying and its language reference. |
| iq | model | F-IQ | Fabric IQ ontologies and planning cubes/formulas model meaning over platform data. |
| known-issues | overview | F-KNOWN-ISSUES | Cross-topic issue index. |
| mirroring | ingestion | F-MIRRORING | Mirroring replicates external databases into OneLake. |
| onelake | foundations | F-ONELAKE | OneLake is the storage architecture. |
| real-time-hub | streaming | F-REAL-TIME-HUB | The real-time hub feeds Real-Time Intelligence. |
| real-time-intelligence | streaming | F-REAL-TIME-INTELLIGENCE | Eventhouse, KQL, eventstreams and activator are the streaming workload. |
| security | security | F-SECURITY | Direct match with the security & governance topic. |
| workload-development-kit | foundations | F-WORKLOAD-DEVELOPMENT-KIT | Workload development documents the platform architecture for extension authors. |

Front-matter refinements (first match wins; confidence `front-matter-refined`):

- `FM-SEMANTIC-MODEL` — family default for enterprise/fundamentals AND compiled
  front-matter title matches `/semantic model/i` → `fabric.model` (15 hits).
- `FM-PBI-TRANSFORM-MODEL` — `ms.subservice === 'pbi-transform-model'` and
  family default is not model → `fabric.model` (2 hits).

## Counts

Primary bindings: 2,705 (= published articles; zero missing, zero extra, zero
duplicates). Seeded 2,688 / front-matter-refined 17.

| fabric topic | Primary | Held (excluded, unbound) | Collections |
|---|---|---|---|
| ingestion | 523 | 68 | 8 |
| streaming | 492 | 14 | 26 |
| transform | 451 | 1 | 19 |
| model | 321 | 0 | 48 |
| query | 302 | 1 | 12 |
| security | 201 | 0 | 8 |
| delivery | 167 | 6 | 20 |
| foundations | 247 | 2 | 18 |
| overview | 1 | 0 | 1 |
| **Total** | **2,705** | **92** | **160** |

Collections by class: concepts 60, procedures 72, reference 28. Collection
unit = (source directory under `docs/`, document class), where class is
derived from `ms.topic` (procedures: how-to/quickstart/troubleshooting/faq/
limits/get-started/install; reference: reference/glossary/release-notes/
whats-new/product-comparison; concepts: everything else incl. tutorial). Each
topic's collections partition its bound articles exactly.

Secondaries: 284 rows across 284 distinct articles (no article exceeded the
cap of 2).

| Rule | Fires | Target | Evidence |
|---|---|---|---|
| S-SQL-DIALECT | 80 | sql.* | database family; ordered title+description pattern list, first match wins. Spread: foundations 70, performance 7, text 2, aggregation 1; 31 database articles matched nothing and get no secondary. |
| S-POWERBI-FRONTMATTER | 42 | power-bi.* | `ms.subservice` starting `powerbi-`/`pbi-`: govern 40 (admin/premium/eim/security), model 2 (pbi-transform-model). |
| S-DATA-SCIENCE-ANALYSIS | 162 | analysis.overview | every data-science-family article (cross-subject analytical practice). |

S-SEMLINK-ANALYSIS (semantic link/sempy title hits outside data-science →
analysis.overview) is implemented but fired 0 times in this corpus revision.
Priority when more rules than the cap fire: S-SQL-DIALECT →
S-POWERBI-FRONTMATTER → S-DATA-SCIENCE-ANALYSIS → S-SEMLINK-ANALYSIS.

## Test evidence

`node --experimental-strip-types --test "tests/fabric-corpus/bindings/*.test.mjs"`:
30 pass, 0 fail, 0 skipped (registry present).

| Check | Result |
|---|---|
| (a) every published article exactly one primary binding; 92 exclusions absent; denormalization (title/logicalPath/sourcePath/family/slug) faithful to the registry | PASS |
| (b) all primary and secondary targets are valid subject.topic pairs per the live taxonomy module; per-topic and per-rule counts match rows | PASS |
| (c) ≤2 secondaries/article, every row carries a documented S- rule id, targets rule-consistent, cross-subject only, never duplicating the primary | PASS |
| (d) collections cover every bound topic, partition each topic's articles, ids resolve to same-topic bindings, counts/order/id-scheme consistent | PASS |
| (e) loaders: unknown articleId → explicit null; unknown subject/topic throws; missing/malformed/schema-drift/duplicate/mismatch fixtures all fail closed | PASS |
| (f) determinism: full rebuild into a temp dir is byte-identical for all three artifacts | PASS |

`tsc -p tsconfig.json --noEmit`: no errors in FC06 files. (One pre-existing
error in `lib/atlas/fabric-targets.ts` — FC08's area, untouched.)

Neighbour check: `tests/fabric-corpus/routes/*.test.mjs` (FC05) — 39 pass.

## Deviations

1. **database → query, not model.** The task's example map suggested
   `database→model`. The fabric `model` topic is "Semantic models & DAX"; the
   database family (SQL database in Fabric) has no DAX/semantic-model surface
   — it is T-SQL, so `query` ("SQL & analytical queries") is the defensible
   home. SQL cross-placements carry the sql.* secondaries instead.
2. **Title-based refinement signal.** The brief named `ms.topic`/`ms.subservice`
   as refinement signals. `ms.topic` never changes subject placement and
   `ms.subservice` is populated on only 231 articles with no cross-topic
   fabric signal except `pbi-transform-model`. The strongest deterministic
   front-matter signal that remains is the front-matter **title**
   (`FM-SEMANTIC-MODEL`), scoped to exactly two families where the
   semantic-model surface genuinely competes with the family default.
3. **iq → model** was not in the example map; the family's dominant subtrees
   (ontology, planning cubes/formulas/time-intelligence) are semantic-modeling
   surfaces. Editorial review may revisit; the map row is one line to change
   and rebuild.
4. **collection `class` field name** uses `class` (reserved-ish word in JS but
   a legal property name; loaders/tests consume it as `collection.class`).

## Caveats and limits

- Bindings are SEEDED, not editorially reviewed. Placement quality is
  bounded by the family map; ambiguous families (iq, apps, enterprise,
  extensibility-toolkit, workload-development-kit) are whole-family
  assignments by design. Re-tuning a row is a one-line map change plus a
  rebuild; all downstream artifacts and tests follow.
- 70 of 80 S-SQL-DIALECT rows land on `sql.foundations` (the broadest
  pattern). This is honest but coarse; the pattern list can be tightened at
  the editorial gate.
- Held counts per topic come from the registry's 92 excluded rows via the
  family map only (held articles have no compiled node, so no front-matter
  refinement applies to them).
- The `overview` topic carries exactly 1 article (known-issues). That is a
  faithful consequence of the deterministic map, not a curated set.
- Build inputs are the frozen build workspace at
  `$FABRIC_CORPUS_BUILD_DIR` (default `../fabric-corpus-build`); the artifacts
  embed both revisions. If the registry is ever refrozen, rebuild and commit
  — the determinism test guards accidental regeneration drift.

## Integration points for the lead (described, not edited)

- `app/learn/[subject]/[topic]/page.tsx` (topic desk): render
  `<ReadingCollections subject={subject} topic={topic} />` below the desk's
  teaching content. The component self-guards: non-fabric subjects and
  unbound topics render `null`, so it can sit unconditionally. Static params
  already enumerate all fabric topics; no page changes beyond the one import
  + one JSX line. Reading data is fs-loaded at build time (static export).
- `app/learn/fabric/page.tsx` (subject hub): for an at-a-glance panel, render
  the same component for a single topic (e.g. `topic="foundations"`), or use
  `getFabricTopicReadingOverview()` from `lib/fabric/bindings.ts` to build a
  small per-topic counts strip (primary/held/collections). Both exports are
  server-safe; nothing imports client modules.
- Optional: `getPrimaryBinding`/`getSecondaryBindings` are available to search
  (FC07) and Atlas (FC08) consumers; bindings never inject into
  `sourceDocuments` (handover review disposition: consume explicit typed
  bindings only).

## Deliverable status

| Deliverable | Status |
|---|---|
| 1. primary.json + secondary.json + build-bindings.mjs (deterministic, documented) | PASS |
| 2. collections.json (deterministic sub-grouping, procedures/reference distinct) | PASS |
| 3. lib/fabric/bindings.ts (server-safe fail-closed loaders + counts) | PASS |
| 4. components/fabric/reading/ReadingCollections.tsx (RSC, visual language, held note) | PASS (typechecked; not visually QA'd — build/export owned by lead) |
| 5. tests (a)–(f) | PASS (30/30) |
| 6. this report | PASS |
