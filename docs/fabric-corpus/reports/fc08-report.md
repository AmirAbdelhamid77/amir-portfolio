# FC08 report — Atlas integration (typed Fabric targets + mapping ledger)

Status: complete on branch `feat/fabric-corpus-20261105` (HEAD `e35724c`).
Scope: `lib/atlas/fabric-targets.ts` (new), `content/atlas/fabric-extension.json`
(new, generated), `tests/atlas/fabric-targets.test.mjs` (new),
`tools/fabric-corpus/atlas/build-fabric-extension.mjs` (new), this report.
The mechanism is PURELY ADDITIVE: `lib/atlas/model.ts`, `lib/atlas/server.ts`,
`lib/atlas/field.ts`, the three shipped `content/atlas/*.json` datasets,
`app/**` and `components/**` were not modified or read for mutation. No git
commands, no `npm install`, no `npm run build`. FC04's isolation tripwire
(`validResourceHref("/learn/fabric/docs/…") === false`) is untouched and still
passes.

## 1. Mechanism summary

Fabric article resources enter the Atlas through a **separate typed admission
mechanism** — never by widening `validResourceHref()` and never by merging into
the legacy `Dataset.catalog` (which `validateDataset` would reject anyway, since
a fabric record has no legacy `href`). All logic lives in
`lib/atlas/fabric-targets.ts`, a pure erasable-TS module whose only import is
`node:fs` (used solely by the build-time loaders):

1. **Targets are typed objects.** A fabric resource record carries
   `target: { kind: "fabric-article", routeTargetId }` where `routeTargetId` is
   a `rt:<logical path>[#anchor]` RouteTarget ID (IDENTITY_REGISTRY). The bare
   `<logical path>[#anchor]` spelling is also admitted as an exact-match
   convenience — both forms require exact string equality against a registry
   row; there is no normalization, decoding, regex or alias guessing.
   `href` is forbidden on fabric records (with or without a target: one
   admission mechanism per record).
2. **Approved-route-ID resolution only.** `resolveFabricTarget(routeTargetId,
   registry)` does exact-match lookup over `indexFabricRegistry()` (O(1) index,
   duplicate identity => throw). Unknown IDs, traversal (`..`), case variants,
   query strings, percent-encoding, backslashes and empty anchors all fail
   closed (`null`). No error is thrown for a plain non-match: it is a normal
   negative answer.
3. **Anchor set membership.** An anchor in the target must be a member of the
   article's compiled heading set (`compiledNodeIndex`: logical path -> anchor
   slugs, injected). Unknown anchors are rejected, never trimmed; a missing
   compiled node entry for an anchored record is an error.
4. **Concept confinement.** A record's `conceptIds` must be a subset of the
   `fabric-`-prefixed concept set the record itself declares
   (`declaredConceptIds`), and the extension-level validator further confines
   declarations to the extension's own `concepts` array. Wave 2 ships zero
   concepts, so all shipped records carry empty concept sets.
5. **Fail-closed public projection.** `projectFabricCatalog(records, registry,
   opts)` emits ONLY records with `mappingDisposition === "approved"`, only
   after their typed target resolves, with the five allowlisted fields
   `{ id, title, logicalPath, kind, conceptIds }` — `title`/`logicalPath` are
   sourced from the resolved registry row, never from the record's own fields.
   Approved records whose conceptIds cannot be verified against the supplied
   public concept set are dropped; an optional `requireRevision` guard throws
   when the projection would run against a stale registry. Rows are sorted by
   id. Because Wave 2 ships zero approved mappings, **the public projection of
   fabric resources is EMPTY by default**.
6. **Build-time loader.** `getFabricExtension(opts)` reads
   `content/atlas/fabric-extension.json` plus the compiler route registry
   (default `<repo>/../fabric-corpus-build/route-registry/route-registry.json`,
   override with `FABRIC_CORPUS_BUILD_DIR` or explicit paths) and runs
   `validateFabricExtension()` before returning. Missing files, unparsable
   JSON, revision mismatches, ledger incompleteness and any record error throw
   — the loader never returns a partial dataset. `import`ing the module has no
   side effects (loaders are explicit calls), so the legacy projection cannot
   be perturbed by its presence.

`validateFabricExtension()` additionally binds the dataset to its registry
(`corpusRevision`, `registryRevision`, `routeNamespace`), requires the mapping
ledger to be **exactly** the registry's published article set (no missing, no
extra, no duplicates; per-row `logicalPath`/`sourceSha256` agreement), caps
`candidateConceptHints` at 3 with the `fabric-` prefix, requires record/ledger
disposition agreement, and reconciles the `counts` block. A future approved
mapping must flip BOTH the ledger row and the record, or the build fails.

### Decision: resource ids derive from `articleId`, not `slug`

The registry's `slug` is only the LAST path segment and collides across nested
articles (the corpus has three distinct `real-time-intelligence/*/overview`
pages plus nested multi-segment articles). Resource ids are therefore
`content:fabric-docs:<articleId minus "art:" prefix>` — unique by
construction, consistent with the existing `content:<kind>:<name>` catalog id
convention. The builder's self-validation caught the slug collision on the
first build attempt, exactly as designed.

## 2. Ledger counts (content/atlas/fabric-extension.json)

| Count | Value |
|---|---|
| Schema | `hansa.atlas.fabric-extension/1` |
| Corpus revision bound | `774592ea3f2d4558f763d6e5b74abf4785948fb5` |
| Registry revision bound | `27c39e133e9e6d0174141733a62209ff097940f5919f4395b720761a814b27a0` |
| Mapping ledger rows | **2,705** (one per published article; 2,705 published, 92 excluded articles not represented) |
| Dispositions | 2,705 `awaiting-review`; **0 approved** |
| candidateConceptHints | 2,510 rows with 1 hint (`fabric-<family>`), 195 rows with 2 hints (family + `ms.subservice` derived, deduplicated, kebab-normalized); 0 rows exceed the cap of 3 |
| New concepts | **0** (`concepts: []`) |
| New semantic edges / approved assertions | **0** |
| Resource records (typed targets) | **1,052** — fundamentals 76, onelake 82, data-factory 434, real-time-intelligence 380, admin 80; all `kind: "fabric-docs"`, no anchors, `mappingDisposition: "awaiting-review"`, `conceptIds: []`, no `href` |
| File size | 1,768,713 bytes |

`awaiting-review` is the explicit editorial disposition of the ledger — a
recorded *candidate state*, never a published assertion. Rebuilding from the
same registry is byte-identical (verified twice against the shipped file); the
builder emits no timestamps and sorts every row deterministically (also
byte-identical when the registry's family order is reversed).

## 3. Integration points for the lead (described, not implemented)

The Atlas Explorer, catalog and TOC consumers can surface fabric resources
later WITHOUT widening publication, because the mechanism already separates
dataset, admission and projection:

1. **Review surfaces (now).** A review build can load
   `getFabricExtension()` (lib-side, no server.ts change needed) and pass
   `extension.resourceRecords` to review tooling. Nothing enters
   `projectAtlas`'s dataset, so the public projection, `getAtlasPublic()`,
   `getAtlasReview()` and `getAtlasReadingSources()` are unchanged — proven by
   test (projectAtlas byte-identical with and without the fabric module
   imported).
2. **Publication gate (Wave 3).** Approval = flipping BOTH the ledger row and
   the record to `"approved"` (plus registering `fabric-` concepts in
   `extension.concepts` and re-running the builder-independent edit by hand or
   a future editorial tool — the builder always emits `awaiting-review`, so
   approvals are NOT silently regressed by a rebuild; rebuilds must be run
   only on pre-approval datasets, or the builder needs a Wave-3 merge step
   that re-applies the approved set from a review-only sidecar. See Risks).
3. **Atlas Explorer / catalog surfacing.** `projectFabricCatalog(records,
   registryIndex, { publicConceptIds: <ids of published concepts>,
   requireRevision: extension.registryRevision })` yields the safe rows. The
   consumer should pass exactly the concept ids present in
   `projectAtlas(...).concepts` so no fabric row dangles; with Wave 2's empty
   published graph the call returns `[]` regardless. UI rendering of
   `rt:`-targets should resolve hrefs through the registry-driven generator at
   the output boundary (basePath applied once), not from the record's stored
   `logicalPath`.
4. **Question-bank dereference audit (FC04 §3.6, now actionable).** Any
   consumer dereferencing resources by id must resolve through
   `resolveFabricTarget`/`projectFabricCatalog` — the audit applies to
   `components/atlas/explorer.tsx` and peek/return consumers when fabric rows
   are first surfaced. Until then, fabric ids cannot reach those components at
   all, because they are absent from every projected output.
5. **FC12 fingerprint hooks.** The new tests establish the invariants FC12
   needs on exported artifacts: no `fabric-docs` / `fabric-article` /
   `rt:/learn/fabric` tokens in any serialized legacy projection; zero
   approved rows shipped; zero `fabric-` concepts; the `awaiting-review`
   counts block as a canary.

## 4. Deviations from the brief

1. **`routeTargetId` spelling.** The brief's deliverable 2(b) says
   `routeTargetId = logicalPath`; FC04's proposal and IDENTITY_REGISTRY define
   the ID as `rt:<logical path>[#anchor]`. Resolution accepts BOTH spellings
   as exact matches (canonical resolved output is always the registry
   logicalPath), so both readings are satisfied without weakening
   exact-match-only admission.
2. **Resource id scheme.** Ids use `content:fabric-docs:<articleId path>`
   rather than a slug-derived id, because registry `slug` is only the last
   segment and is not unique. Documented above with the concrete collision.
3. **`declaredConceptIds` field.** "The concept set it declares" is
   implemented as a per-record field (self-contained, auditable), further
   confined at dataset level to the extension's `concepts` array. Wave 2
   carries empty arrays on both.
4. **`tools/fabric-corpus/atlas/**`.** Granted by this work package's brief;
   not yet listed in the frozen WORK_PACKAGE_OWNERSHIP.md FC08 row
   (which names only the extension dataset, the lib module and the tests).
   The lead should record the ownership amendment at the next checkpoint.
5. **Builder runs under `--experimental-strip-types`.** The builder imports
   the pure lib functions (single source of truth for resolution and
   validation), so it needs type stripping like every other repo script that
   imports `.ts`.

## 5. Test evidence

Command (repo root): `npm run test:atlas`
(= `node --experimental-strip-types --test "tests/atlas/*.test.mjs"`)

Result: **49 tests, 49 pass, 0 fail, 0 skipped, 0 cancelled** — 33 pre-existing
(circle-layout 3, continuation 5, expansion 5, isolation 8, model 7,
peek-layout 5) plus **16 new** in `tests/atlas/fabric-targets.test.mjs`
(16/16 alone). The new file follows repo conventions (node:test,
assert/strict, no `@/` aliases, fs + JSON.parse instead of JSON imports,
explicit `.ts` import extensions) and never reads the real 2,705-row registry
or the real extension dataset's registry linkage — it uses a synthetic
12-article registry fixture (5 representative families + non-representative
cicd family, 3 colliding `overview` slugs, 2 excluded rows) with synthetic
compiled-node anchor sets, written to `os.tmpdir()`; the shipped-dataset guard
test reads only `content/atlas/fabric-extension.json` itself (no registry).

The end-to-end loader + validation against the REAL registry and the REAL
dataset was additionally verified in a one-off shell run (not part of the test
suite, to honor the no-real-registry-in-tests rule):
`getFabricExtension()` loaded, `validateFabricExtension` returned 0 errors,
and `projectFabricCatalog` returned `[]` over all 1,052 shipped records.

## 6. Status table

| Item | Status | Evidence |
|---|---|---|
| (1a) `resolveFabricTarget` exact-match resolution (both spellings, anchors carried) | PASS | fabric-targets.test.mjs tests 1–2 |
| (1a) Rejections: made-up ids, traversal, wrong family, case/query/encoding/backslash/empty anchors | PASS | test 2 |
| (1b) Record validation: typed target required, href forbidden (alone or with target) | PASS | tests 4 |
| (1b) Anchor membership via compiled node index; unknown anchor / missing node rejected | PASS | test 5 |
| (1b) conceptIds confined to the declared `fabric-` concept set | PASS | test 6 |
| (1c) Public projection empty by default (all awaiting-review); no fabric token in any legacy projection | PASS | test 7 |
| (1c) Synthetic approved record projects allowlisted fields only (registry-sourced values, sorted, dangling drops, revision guard) | PASS | tests 8–9 |
| (1d) Loader fail-closed on absence/invalid JSON/validation drift; loads valid pair | PASS | test 15 |
| (2) `fabric-extension.json` generated; ledger = 2,705/2,705 published; 1,052 records; 0 approved; 0 concepts | PASS | build output + shipped-dataset guard test 16 + one-off real-corpus validation |
| (2) Determinism: byte-identical rebuild (shipped file), input-order independence, CLI spawn twice identical, CLI === in-process build | PASS | tests 13–14 + `cmp` of shipped file after rebuild |
| (3e) Ledger completeness on 12-article fixture (published === ledger, excluded absent) | PASS | tests 11–12 |
| (3d) Legacy projection untouched (byte-identical before/after module import; public + review) | PASS | test 10 |
| Full `tests/atlas/*.test.mjs` suite after changes | PASS — 49/49 | §5 |
| `npm run build` | NOT RUN | prohibited for FC08; lead runs integration builds |
| Changes to `lib/atlas/model.ts`, `server.ts`, `field.ts`, shipped `content/atlas/*.json`, `app/**`, `components/**` | NOT RUN (none made — by design) | — |
| Atlas Explorer/catalog UI surfacing of fabric resources | NOT RUN | lead integration step (§3); no UI implemented by design |
| Suites outside `tests/atlas/` | NOT RUN | not affected: only new files added |

## 7. Findings and risks

- **Wave 3 approval workflow must not widen publication implicitly.** The
  mechanism admits `"approved"` as a legal disposition today (vocabulary,
  not content). Wave 3 needs: (a) an editorial step that flips ledger row AND
  record together (the validator enforces agreement, so half-flips fail the
  build); (b) `fabric-` concept definitions added to `extension.concepts`
  before any record declares them (validator enforces declaration ⊆
  extension concepts); (c) the public projection consumer to pass
  `publicConceptIds` = the ids in `projectAtlas(...).concepts`, so an approved
  fabric row can never reference an unpublished concept (drop, not degrade);
  and (d) a decision on whether approved rows also need
  `editorialState`-style review metadata on the record itself — the current
  record shape has no reviewer/checkedAt fields, which the existing
  `validateDataset` publication rules require for *edges*; if the owner wants
  the same human-approval evidence on fabric mappings, add `reviewedBy` /
  `reviewedAt` fields and extend `validateFabricResourceRecord` (additive,
  FC08-owned) before the first approval lands.
- **Builder/rebuild interplay with approvals.** The builder always emits
  `awaiting-review` for everything; re-running it after Wave 3 approvals would
  regress approved rows back to awaiting-review (fail-closed: the public
  projection empties again — it cannot leak, but it can silently unpublish).
  Recommended Wave 3 design: approvals live in a review-only sidecar that a
  build step re-applies post-build, or the builder gains an
  `--apply-approvals <sidecar>` mode. Flagged for the lead/owner decision; not
  implemented in Wave 2.
- **Registry drift.** The shipped dataset binds `registryRevision`
  `27c39e13…` / `corpusRevision` `774592ea…`. If FC02/FC03 revise the
  registry, the loader throws until the extension is rebuilt — intentional
  fail-closed staleness protection. The rebuild also refreshes
  `sourceSha256` provenance for every row.
- **Question-bank dereference safety (answered).** Fabric ids cannot reach any
  question-bank or Atlas consumer in Wave 2: they exist only in the extension
  dataset, which nothing in `lib/atlas/server.ts` or the components reads, and
  `projectFabricCatalog` output is empty by default. When consumers are wired,
  they must dereference through `resolveFabricTarget`/`projectFabricCatalog`
  (both registry-bound and concept-gated), never by trusting a record field —
  the projection even sources `title`/`logicalPath` from the registry, so a
  tampered or stale record cannot inject content.
- **Anchor coverage note.** All 1,052 Wave 2 records are anchor-free, so
  compiled-node anchor sets are exercised in tests but not required by the
  shipped dataset. Wave 3 anchored targets need the compiled node index wired
  at validation time (`getFabricExtension({ compiledNodeIndex })` or the
  loader gaining a compiler-output path option — additive change).
- **Test-infra note.** The CLI determinism test spawns Node with
  `--experimental-strip-types` (same flag the repo's test scripts already
  require); no new dependency.

## 8. Recovery point

No commit made (git commands prohibited). Worktree state =
`feat/fabric-corpus-20261105` @ `e35724c` + uncommitted FC08 paths:
`lib/atlas/fabric-targets.ts`, `content/atlas/fabric-extension.json`,
`tools/fabric-corpus/atlas/build-fabric-extension.mjs`,
`tests/atlas/fabric-targets.test.mjs`, this report. The lead should commit at
the next contract checkpoint.
