# FC07 report — Fabric full-text search shards and /search integration

Status: delivered for lead review, 2026-11-05. Worktree
`D:\BeUI\amir-portfolio-fabric` (branch `feat/fabric-corpus-20261105`). Scope:
handover 03 §Search for the Wave-2 families (fundamentals, onelake,
data-factory, real-time-intelligence, admin), plus the builder/routing pieces
FC13 needs for `--families=all`.

## What shipped

| Layer | File | Kind |
|---|---|---|
| Shard builder | `tools/fabric-corpus/search/build-shards.mjs` | new |
| Public-tree copier | `tools/fabric-corpus/search/copy-shards.mjs` | new |
| Fixture loader hooks (fixture generation only) | `tools/fabric-corpus/search/lib/fixture-loader-hooks.mjs` | new |
| Metadata regression fixture generator | `tools/fabric-corpus/search/generate-merge-fixture.mjs` | new |
| Pure scoring | `lib/search/fabric-scorer.ts` | new |
| Client shard layer (manifest, routing, LRU, partial, version guard) | `lib/search/fabric-shards.ts` | new |
| Worker entry | `lib/search/fabric-worker.ts` | new |
| Worker bridge (main thread) | `lib/search/fabric-worker-client.ts` | new |
| Fabric results band | `app/search/search-with-fabric.tsx` | new |
| **Existing file edited** | `app/search/page.tsx` | minimal edit: `SearchClient` → `SearchWithFabric` wrapper + one sentence in the "How matching works" copy |
| **Existing file edited** | — none in `lib/search/query.ts`, `documents.ts`, `build-index.ts`, `aliases.ts`, `components/**` | zero edits — deliberate, see "Merge contract" |
| Tests | `tests/fabric-corpus/search/{parity,exclusions,determinism,scorer,merge,partial,no-review-data}.test.mjs` + `helpers.mjs` | new |
| Test fixture | `tests/fabric-corpus/search/fixtures/metadata-top10-fixture.json` (272 KB) | generated pre-merge, committed |
| Generated output | `public/fabric-search/manifest.json` + `public/fabric-search/vd6e361ad05b84069/{shard-*.json, routing-*.json}` | generated — **lead: add to .gitignore** (shared file, FC07 does not edit it); copy-shards.mjs prints the same reminder |

Existing files edited: exactly one — `app/search/page.tsx` (import swap, one
comment, one copy sentence). Everything else is additive. `lib/search/query.ts`
and the whole metadata pipeline are byte-identical.

## Shard / manifest stats (Wave-2 run, version `vd6e361ad05b84069`)

Registry `hansa.fabric-route-registry/1`, corpusRevision `774592ea3f2d…`,
registryRevision `27c39e133e9e…`. 2,705 published articles in the registry; the
Wave-2 families carry 1,052 of them; 80 of the 92 excluded articles live in
these families and none of them can appear (hard-tested).

| Metric | Value |
|---|---|
| Articles indexed | 1,052 (all published Wave-2 registry articles; build fails closed on any missing compiled node) |
| Section records | 11,062 (`kind`: `intro` carries the front-matter description; `section` = one heading + following blocks) |
| Shards | 39 files, articles grouped by (family, slug), one-article granularity |
| Shard size | min 122 KB / median 241 KB / max 245,519 B — grouping budget 250,000 B with a 4 KB envelope margin, never exceeded |
| Total payload | 9.27 MB (shards 8.97 MB + routing 0.30 MB + manifest 6.3 KB) |
| Doc-level `terms` | present on 1,052/1,052 articles (title + description + slug words + all headings; the alias signal) |
| Routing vocabulary | 11,471 exact token keys + 1,055 wildcard tokens (present in ≥70% of shards → client loads all shards for them; over-approximation, recall-safe) |
| Determinism | two runs over the same inputs are byte-identical (verified for fundamentals+admin; the Wave-2 run reproduced `vd6e361ad05b84069` across rebuilds); no clock fields — version = sha256-16 over {corpusRevision, registryRevision, families, sorted shard ids} |
| Filenames | `shard-<sha8>.json` / `routing-<sha8>.json`; sha8 = sha256 prefix over the version-independent payload (articles array / routing object without the version key); manifest lists sha256 + bytes of the final bytes of every file |
| Includes | inline `include` blocks resolved against `compiler-output/includes/nodes/**` and inlined into their section (cached per build); 41 unresolved/blocked includes skipped and counted, 0 missing fragment files |
| Extraction | typed compiler blocks only: text/inlineCode values, softbreak→space, emphasis/link/link-text children, list items + nested children, table cells, code values, learnConstruct children and image alt-text; `inlineHtml`, `unsupported` snippets, comments, hrefs never enter the text; numeric + common named entities decoded; whitespace collapsed |

## Bounded routing

`routing-<sha8>.json` maps every normalised token to the shard indexes
(ordinal positions among `manifest.files` with `role:"shard"`) whose articles
contain it. Tokens present in ≥70% of shards (1,055 here) become
`wildcardTokens`: the client loads every shard for them instead of carrying
giant postings lists. Client routing is therefore over-approximating only:

- token in `tokens` → its shards;
- token in `wildcardTokens` → all shards;
- token in neither → no shard (correct: no article contains it).

Multi-token (AND) queries intersect the per-token candidate sets, so a query
never under-selects. This is the "bounded routing verified against whole-corpus
recall" requirement — proven mechanically by the parity gate below.

## Parity gate (handover 03 §Search; review disposition "Search parity accepted")

Scoring is **shard-independent** (per-article tf saturation and field weights
only; no shard-local df, no corpus statistics), so the same article scores
identically in one shard, in the loaded subset, or in a whole-index reference.
The gate proves it on the deployed public tree, through the real pipeline
(manifest → routing → `routeQuery` → candidate shards only → `scoreShards`),
with a stub fetch serving the real files (no network):

- **Intersection (AND) parity** — 21 queries derived deterministically from the
  corpus (10 exact title tokens, 3 two-token pairs, 6 body-only tokens, 2
  heading-only tokens: `achievable`, `adlsgen2forbiddenerror`): sharded results
  (ids, scores, order) equal the whole-index brute-force reference, article by
  article.
- **Union parity** — per-token OR merges over routed shards equal whole-index
  unions for all multi-token queries.
- **Routing completeness** — every article the reference ranks lives inside the
  shards the router selected (over-approximation only; verified for all 21).
- **Multilingual** — the Wave-2 corpus contains zero non-ASCII token types
  (measured), so non-ASCII parity is proven on a synthetic Turkish fixture
  shard: `veritabanı oluşturma` folds to `["veritabanı","olusturma"]` (marks
  stripped, standalone U+0131 kept — the same fold applies to content and
  query, so matching is symmetric) and scores identically through the shard and
  whole-index paths.

## Merge contract

Two bands, fixed order, **no interleaving** — documented in
`app/search/search-with-fabric.tsx` and proven in `merge.test.mjs`:

1. **Band 1** = the existing metadata results. Rendered by the untouched
   `components/search/search-client.tsx` over the untouched metadata index.
   The regression fixture (generated BEFORE any fabric change) freezes the
   full 448-document index snapshot and the top-10 for five fixture queries
   (`star schema`, `p-value`, `direct lake`, `box plot`, `medallion`);
   `merge.test.mjs` re-scores the frozen snapshot and asserts the top-10 ids,
   scores and `searchSite` shown-order are byte-identical. The existing
   `tests/content/search.test.mjs` suite (13 tests) still passes.
2. **Band 2** = `fabric-docs` rows ranked only by `lib/search/fabric-scorer.ts`
   (score desc, `logicalPath` asc tie-break), capped at `FABRIC_RESULT_LIMIT = 8`,
   rendered below band 1 with the same link shape (`next/link` + unprefixed
   `logicalPath[#anchor]` — Next applies the base path to Link hrefs itself,
   matching FC05's `ArticleLink` pattern).

Rationale for not interleaving: the two scorers use incommensurate scales
(metadata whole-field hit weights with kind priority vs fabric tf saturation);
a deterministic cross-band order would need a proven shared scale. Bands are
the stable contract; interleaving can be revisited later only with a shared
scale and new fixtures.

Scorer weights (exported constants, asserted in tests): title 5 > terms 1.5 >
headings 3 > body 1 for the field bands (doc-level title+terms score
separately from the best single section's headings+body band); exact-phrase
boosts title +10, heading +6, body +4 (at most one per section, heading takes
precedence); term frequency saturates `tf/(tf+2)`; every query token must match
somewhere in title ∪ terms ∪ headings ∪ body; ties break by `logicalPath`;
scores rounded to 4 decimals for cross-engine stability.

Failure behavior (all visible, none silent):

- failed candidate shard → remaining shards still score, `partial: true` +
  failed shard names, band shows "Partial results — N of M index shards did not
  load; matches below come from the rest." (`role="status" aria-live="polite"`);
- manifest absent (HTTP 404) → band hidden — this build ships no fabric corpus,
  identical to pre-fabric builds;
- manifest unreachable (non-404) → visible "could not load" message, metadata
  band unaffected;
- version drift (shard/routing version ≠ manifest version) → ONE guarded
  manifest refetch, then either a clean retry or a visible "index is updating"
  status; never a loop (`refetchedAfterDrift` flag, asserted in tests);
- superseded fetches abort through the caller's `AbortController` (query change
  cancels in-flight shard loads; stale job results are dropped by id).

## Memory and fetch caps

- Shard LRU: default **8 MiB byte cap / 48 entries**, whole-shard granularity,
  LRU eviction, byte estimate = serialized JSON length (conservative upper
  bound for this ASCII-heavy corpus). Asserted by test (3 × ~30 KB shards under
  a 65 KB cap evict to 2 entries).
- First query cost: manifest (~6 KB) + routing (~301 KB) once per page mount,
  then only candidate shards. Typical exact-term query: 1–3 shards
  (~0.25–0.75 MB). Wildcard-token queries load up to all 39 (~9 MB) —
  acceptable for Wave-2; FC13 should consider varint/delta postings or a split
  routing file when the full corpus multiplies shard count.
- Scoring runs in a Web Worker (`new Worker(new URL("./fabric-worker.ts",
  import.meta.url))` — webpack 5 + Turbopack pattern). If Worker construction
  throws, the identical pure function runs on the main thread (fallback gated
  to construction failure only, observable via `usesWorker`, measured later).

## Integration points for the lead

1. **.gitignore** — add `public/fabric-search/` (generated; FC07 must not edit
   the shared file). CI order: build-shards → copy-shards → `next build`.
2. **`app/search/page.tsx`** — the only existing-file edit (import swap to
   `SearchWithFabric` + one copy sentence). Review and keep or fold into a
   lead-owned merge.
3. **Query seam** — `SearchClient` (components/**, not FC07's area) owns the
   query state; the fabric band tracks it via native `input` events on the
   page's `type="search"` input plus the `q=` URL param (mount + popstate). A
   small approved `SearchClient` refactor (e.g. an `onQueryChange` prop) should
   replace this listener; flagged in the component header.
4. **Cache headers** — `public/fabric-search/manifest.json` should be served
   no-cache (it is the version pointer); `public/fabric-search/<version>/**`
   are immutable and cache-forever-safe (content-hashed names).
5. **Build gate** — `next build` unverified by FC07 (lead owns builds). Risks:
   Turbopack/webpack bundling of the worker entry via
   `new Worker(new URL(..., import.meta.url))`; `public/**` → `out/**` verbatim
   copy (Next `output: "export"` documented behavior — the existing
   `public/fabric-docs-assets/**` tree already relies on it, and
   `components/fabric/article/ArticleBody.tsx` references those URLs).
6. **Typecheck** — `tsc --noEmit` passes for all FC07 files. The repo-wide run
   reports one PRE-EXISTING error in `lib/atlas/fabric-targets.ts` (FC08's
   area, untouched here).
7. **FC13** — run `build-shards.mjs --families=all`, then `copy-shards.mjs`;
   the exclusion, determinism and parity tests read the deployed tree and adapt
   automatically. Reconsider routing-file size (see above) at full-corpus shard
   counts.

## Deviations (deliberate, documented)

1. **Zero edits to `lib/search/query.ts` / `documents.ts` / `build-index.ts` /
   `aliases.ts` / `components/**`.** The `fabric-docs` kind lives on
   `FabricHit` (fabric-scorer.ts), not in the metadata `SearchKind` union —
   adding it there would surface a dead kind chip inside the untouched
   `SearchClient` (the chips filter band 1 only). Merge contract documented
   accordingly; the deliverable's "kind 'fabric-docs' rows" is satisfied by the
   rows' own `kind` field and the visible "Fabric docs" chip in the band.
2. **No-review marker set.** The brief asked to grep for 'candidate' /
   'technical_review'. Bare words cannot be markers: 'candidate' is ordinary
   prose in six published articles ("candidate service", "candidate key"),
   'reviewer' in four (pull-request approvals), and in the routing JSON even
   the key-form `"candidate":` is what a legitimate token key looks like. The
   test greps the review-system markers (`technical_review`,
   `"reviewState"`, `"reviewStatus"`, `"pending-review"`, `"reviewFlag"`,
   `"reviewerId"`, `"quarantineReason"`), the JSON-key forms
   (`"candidate":`, `"reviewer":`) on shards/manifest, and the token-impossible
   subset on routing. All absent; `technical_review` zero occurrences in the
   corpus.
3. **Exclusion matching is JSON-quoted.** Raw substring matching false-positives
   (a published id `…connector-access-database-overview` contains the excluded
   id `…connector-access-database` as a prefix). The test asserts the quoted
   exact forms; slugs are deliberately not string-matched (ordinary prose can
   contain them).
4. **Snippet location is display-only** (case-insensitive indexOf with a
   proportional folded-text fallback); the parity gate covers ranking, not
   snippet offsets. Snippets carry matched terms verbatim, and the grounding
   test asserts each snippet is built from the article's own published
   sections.
5. **Clock-field check** parses JSON keys rather than raw substrings (a raw
   scan matches ordinary content words like "timestamp" inside article text).
6. **LRU bytes** estimated via `JSON.stringify().length` (UTF-16 count); a
   slight overestimate, i.e. conservative eviction. Exact byte accounting can
   switch to `manifest.files[].bytes` later.

## PASS / FAIL / NOT RUN / BLOCKED

| Check | Result | Evidence |
|---|---|---|
| Shard build (Wave-2, 5 families) deterministic, ≤250 KB/shard, content-hashed | PASS | builder run ×3 identical version `vd6e361ad05b84069`; determinism.test.mjs byte-compare + sha verification |
| Parity gate: token union + intersection vs whole-index reference, ≥20 queries | PASS | 21 queries (exact/pairs/body-only/heading-only), 3 subtests green (`parity.test.mjs`) |
| Non-ASCII (Turkish) token parity | PASS | synthetic fixture shard; fold symmetry asserted |
| Exclusion gate: 92 excluded articles absent from shards/manifest/routing | PASS | quoted articleId + logicalPath absence ×92 ×40 files; inverse registry-membership check (`exclusions.test.mjs`) |
| Metadata regression: top-10 unchanged for 5 fixture queries | PASS | fixture generated pre-merge; `merge.test.mjs` + existing `tests/content/search.test.mjs` (13/13) |
| Merge contract: two bands, no interleaving, fabric-docs rows via same link shape | PASS | `merge.test.mjs` |
| Scorer stability: weights, phrase boost, tf saturation, logicalPath tie-break | PASS | `scorer.test.mjs` |
| Partial status on failed shard; version drift refetch-once + fail-visible; missing corpus hidden; abort; LRU caps | PASS | `partial.test.mjs` (8 tests) |
| No review/private data in shards, manifest, routing | PASS | marker grep split by file kind (`no-review-data.test.mjs`) + published-only source contract |
| Worker scoring end-to-end in a real browser | NOT RUN | needs a lead-owned `next build` + manual QA; the pure scoring path (identical function) is fully tested |
| `next build` / static export of the new band | NOT RUN | lead owns builds (constraint) |
| Base-path (`NEXT_PUBLIC_BASE_PATH`) runtime behavior | NOT RUN (unit-tested) | `fabricAssetUrl` derives the profile like `next.config.ts`/`registry.ts` and applies it once via FC11's `buildAssetUrl`; needs a subpath build to observe |
| Repo-wide typecheck | PASS (FC07 files) | one pre-existing FC08 error in `lib/atlas/fabric-targets.ts`, untouched |

## Caveats and limits

- Wave-2 only: shards cover the five families; the remaining 17 families are
  one command away for FC13 but their routing/shard stats will differ (expect
  ~4× the article count and a proportionally larger routing file).
- Search quality is unmeasured (no relevance tuning yet): the fixture queries
  are retrieval-correctness gates, not editorial relevance judgments. A recall
  sweep against sample learner queries is the natural next task.
- The fabric band does not participate in metadata kind chips or the language
  filter (its own band, own contract); URLs with `kind=` filters still get the
  band — documented in the component header.

## Next atomic task

Lead checkpoint: review `app/search/page.tsx`, add `public/fabric-search/` to
`.gitignore`, run `next build` once to verify the worker entry bundles and the
band renders, then hand FC13 the `--families=all` run.
