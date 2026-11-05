# FC05 report — Routes and rendering (Fabric corpus Wave 2)

Status: delivered on branch `feat/fabric-corpus-20261105`, worktree
`amir-portfolio-fabric`, HEAD 0762eb5. Corpus pinned at
`774592ea3f2d4558f763d6e5b74abf4785948fb5`. Nothing was committed and nothing
was deployed (per task; the lead commits after review).

## Deliverables PASS/FAIL

| # | Deliverable | Result |
|---|---|---|
| 1 | `tools/fabric-corpus/route-registry/build-registry.mjs` (deterministic, fail-closed, reconciling) | PASS |
| 2 | Compile ALL route-plan families into the build workspace | PASS (22 families + 1 include-source family) |
| 3 | `lib/fabric/articles/` server-only loaders (registry + article data, fail-closed) | PASS |
| 4 | `components/fabric/article/` renderer + provenance footer + decisions layer | PASS |
| 5 | `app/learn/fabric/docs` index + `[family]/[...article]` page (registry-driven static params) | PASS |
| 6 | Alias mechanism: `public/fabric-aliases/*.html` meta-refresh pages (170, Wave-2 families) | PASS |
| 7 | `tests/fabric-corpus/routes/` (registry, fail-closed, collisions, decisions, loaders) | PASS (39/39) |
| 8 | `npm run build` + `verify:curriculum` + collision gate + spot checks | PASS |
| 9 | This report | PASS |

## 1. Route registry

`node tools/fabric-corpus/route-registry/build-registry.mjs` reads the FC02
identity ledger + FC02 aliases ledger (in repo) and the FC03 compiler
manifests/nodes (build workspace), then writes
`D:\BeUI\fabric-corpus-build\route-registry\route-registry.json`
(`hansa.fabric-route-registry/1`).

- Deterministic: sorted, canonical JSON, no clock; `registryRevision` is the
  SHA-256 of the registry body. Two independent runs after a refactor of the
  script produced the identical revision `27c39e133e9e…`.
- Publication rule (fail-closed): `disposition === 'eligible-article'` AND
  family manifest lists the file AND not quarantined AND ledger sha256 ===
  compiler sha256 (blob integrity) AND rightsState not a hold
  (`unresolved-review`, `review-required`). Every non-published row is
  emitted into `excluded` with its reason; zero silent drops are enforced by
  a hard gate (script exits non-zero and writes nothing otherwise).
- Registry row shape: `{articleId, family, slug, articleSegments,
  sourcePath, sha256, title, description, logicalPath, nodeFile, rightsState,
  published:true}`. `logicalPath` is the ledger `plannedDestination`
  verbatim (the ledger is the route authority).

### Reconciliation (the table)

| Metric | Count |
|---|---|
| Identity ledger article rows (`kind: article-candidate`) | 2,797 |
| Ledger `eligible-article` | 2,794 |
| Ledger holds (2 `article-hold-rights-notice`, 1 `article-hold-external-dependency`) | 3 |
| **Published** | **2,705** |
| **Excluded** | **92** |
| — compiler quarantine | 89 |
| — article-hold-rights-notice | 2 |
| — article-hold-external-dependency | 1 |
| published + excluded (must equal ledger rows) | 2,705 + 92 = **2,797** ✓ |

Held/quarantined articles: 92/92 verified ABSENT from the export
(`out/learn/fabric/docs/...` contains no page for any excluded logicalPath),
and `dynamicParams = false` means no runtime path can render them.

### Aliases

| Metric | Count |
|---|---|
| Redirect ledger rows (aliases.json) | 1,014 |
| **Wired** (target resolves to a published local article, chains followed) | **941** |
| Suppressed with reason | 73 |
| — source-not-document (non-.md sources) | 23 |
| — target-not-published (target quarantined/held locally) | 20 |
| — target-not-article (upstream target is not a corpus article) | 14 |
| — target-other-docset | 9 |
| — target-external-url | 3 |
| — target-kind-other | 2 |
| — target-has-query | 1 |
| — source-outside-corpus | 1 |
| wired + suppressed (must equal 1,014) | **1,014** ✓ |

Chain following honours the ledger's chain data (397 chains, 0 cycles), with
depth cap 10 and self-redirect/cycle guards. Fragment-bearing targets are
preserved (7 wired aliases carry `#anchor`). The 12 stale upstream targets
from the FC02 ledger surface as `target-not-article`/`target-not-published`
with per-row reasons — nothing silently dropped.

## 2. Compilation of all families

`node tools/fabric-corpus/route-registry/compile-all-families.mjs` derives
the family list from the identity ledger (never hard-coded) and reuses the
frozen FC03 `compileFamily` entry point. Batch receipt:
`compiler-output/compile-batch.json`. The 22 route-plan families (verified
from the ledger — the task's provisional list contained `get-started` /
`reporter`, which are NOT corpus families; `apps`, `embed`, `known-issues`
ARE):

| Family | Files | Quarantined | Unsupported | Elapsed |
|---|---|---|---|---|
| admin | 80 | 0 | 0 | 5.2s |
| apps | 30 | 0 | 0 | 0.9s |
| cicd | 68 | 4 | 0 | 13.8s |
| data-engineering | 291 | 1 | 0 | 48.2s |
| data-factory | 718 | 68 | 1 | 49.8s |
| data-science | 172 | 0 | 0 | 29.6s |
| data-warehouse | 161 | 0 | 0 | 12.2s |
| database | 125 | 1 | 0 | 8.1s |
| embed | 4 | 0 | 0 | 0.2s |
| enterprise | 94 | 2 | 0 | 6.5s |
| extensibility-toolkit | 62 | 0 | 0 | 2.1s |
| fundamentals | 77 | 0 | 0 | 10.0s |
| governance | 54 | 0 | 0 | 4.3s |
| graph | 44 | 0 | 0 | 2.9s |
| iq | 312 | 0 | 0 | 158.6s |
| known-issues | 1 | 0 | 0 | 0.1s |
| mirroring | 100 | 2 | 0 | 4.9s |
| onelake | 82 | 0 | 0 | 5.3s |
| real-time-hub | 121 | 0 | 0 | 12.6s |
| real-time-intelligence | 508 | 14 | 3 | 58.2s |
| security | 72 | 0 | 0 | 8.1s |
| workload-development-kit | 34 | 0 | 0 | 2.7s |
| **Total (22 families)** | **3,210** | **92** | **4** | **~446s** |
| includes (include-source family, added by FC05 — no article rows, never routed) | 16 | 0 | 0 | 0.1s |

Quarantine handling: every quarantined ELIGIBLE article is excluded from the
registry with its quarantine reason (`compiler-quarantine:<reasons>` — e.g.
`include-tilde-path` in cicd). The 92 quarantined FILES include 3
non-article fragments; the 89 quarantined articles are the registry
exclusions. Blocked includes never reach a published page (verified: 0
published articles contain a blocked include marker).

## 3. Loaders — `lib/fabric/articles/`

- `registry.ts` — `getRouteRegistry()` (cached per build dir,
  fail-closed throws on missing/malformed registry),
  `getPublishedArticles()`, `findPublishedArticle()`,
  `makeSourcePathLookup()` (renderer link rewrites), `getFamilyAssets()`
  (asset manifest), `getDeliveryProfile()` + `publicUrl()`/`assetUrl()`
  delegating to FC11's `lib/fabric/paths.ts` (base path exactly once;
  profile derived from `NEXT_PUBLIC_BASE_PATH` exactly like
  `next.config.ts`).
- `article-data.ts` — `getArticleData(family, article)` reads the compiled
  node JSON addressed THROUGH the registry row (`nodeFile`), throws
  `MissingArticleError` for unpublished/missing data, re-checks quarantine,
  collects heading slugs and resolves `[!INCLUDE]` fragments recursively
  (depth-capped, sha-guarded) so published articles render their full
  content. SERVER-ONLY, build-time fs — never imported from client
  components.

## 4. Renderer — `components/fabric/article/`

- `decisions.ts` — pure decision layer (no React/fs): link rewrite classes,
  anchor validation, admonition mapping, image fallback, benign inline-HTML
  handling, upstream URL shape. Fixture-tested.
- `ArticleBody.tsx` — server component rendering the compiled typed nodes:
  headings (compiler slugs, h2–h4 hierarchy), paragraphs, lists, responsive
  tables (alignment-aware), fenced code with language label (exact content
  preserved), blockquotes, admonitions ([!NOTE]/[!TIP]/[!IMPORTANT]/
  [!WARNING]/[!CAUTION] as labelled `role="note"` callouts), zone/tab
  constructs as labelled sections with the pivot condition visible, images
  per the asset policy, includes inlined, thematic breaks. Links: local
  articles via `next/link` (raw logical path; Next applies the base path),
  upstream links `target="_blank" rel="noopener noreferrer"`, anchor-only
  validated against the heading set, unresolvable references rendered as
  plain text with an accessible note (fail-closed — never a dead local
  link).
- `ProvenanceFooter.tsx` — source path, pinned revision (`774592ea…`), blob
  sha256, upstream URL
  (`https://learn.microsoft.com/en-us/fabric/<path>` — verified Learn URL
  shape), CC BY 4.0 + "transformed for local rendering" change note, back
  link to `/learn/fabric/`.
- `DocsHeader.tsx` — breadcrumb header (Fabric hub → Docs → family), same
  visual language as the hub (`HubHeader` itself is bound to the DP-600
  academy trail so it was not reused verbatim; `Container` is reused).

LINK REWRITE RULES (implemented + tested): relative .md → registry lookup by
resolved source path (anchors preserved when compiler-validated;
compiler-proven-missing anchors → upstream; unpublished target → upstream
fallback — the recorded rule); anchor-only → same-page slug validation;
site-absolute `/fabric/...` → local when published, else upstream; other
docsets → upstream; external/mail preserved; unclassified → plain text.

## 5. Routes — `app/learn/fabric/docs/`

- `page.tsx` — docs library index: families with published/held counts and
  held reason categories (held items are never links). Renders from the
  registry only.
- `[family]/[...article]/page.tsx` — `generateStaticParams` from the
  registry (published rows only), `dynamicParams = false`, server component,
  no 'use client', `generateMetadata` (title, front-matter description,
  relative canonical). The catch-all preserves the ledger's planned
  destinations, which include intra-family subdirectories
  (`/learn/fabric/docs/data-science/ai-functions/pyspark/analyze-sentiment/`)
  — a flat `[family]/[article]` would collide 31 times (e.g. three
  `overview` articles in `iq`); the ledger already disambiguated via
  subpaths, and `plannedDestination` is unique across all 2,797 rows.
- Namespace contract honoured: trailing slashes via `next.config.ts`,
  unprefixed logical paths, `docs` reserved (collision gate enforces).

## 6. Assets (Wave 2 ASSET POLICY)

`node tools/fabric-corpus/route-registry/copy-assets.mjs` —
family-parameterized (`--copy=a,b|all`, FC13 can run it for all families);
scans the published articles' compiled nodes of every family (counts for
all 22), copies only the representative families' referenced images from the
read-only corpus into `public/fabric-docs-assets/<docset-relative-path>`,
with pixel dimensions extracted for PNG/GIF/JPEG.

| Family | Policy | Referenced assets | Copied | Bytes |
|---|---|---|---|---|
| admin | copied | 80 | 80 | 12.1 MB |
| data-factory | copied | 1,531 | 1,521 | 119.0 MB |
| fundamentals | copied | 289 | 289 | 32.7 MB |
| onelake | copied | 149 | 149 | 17.3 MB |
| real-time-intelligence | copied | 1,670 | 1,670 | 223.6 MB |
| **Total copied** | | | **3,709** | **404.7 MB** |

Non-copied families: 21 families scanned (4,819 referenced assets total
across the corpus) — all suppressed by policy, zero broken image requests.
Genuinely missing corpus assets (data-factory 10, database 4, security 2
references) are recorded per reference in
`asset-manifest.json#families[*].suppressed`. Cross-family references
(`../fundamentals/media/…`, `../includes/media/…`) resolve to the owning
docset directory and copy once (deduped by shared keys).

Renderer behaviour verified across the whole export: 3,933 `<img>` emitted,
0 broken; 13,833 accessible fallback blocks ("figure available in the
upstream source" + alt text + upstream link) for the 17 non-copied families.

## 7. Aliases (Wave 2)

`node tools/fabric-corpus/route-registry/write-alias-routes.mjs` writes
`public/fabric-aliases/<family>/<rest>.html` (mirroring the upstream
docset-relative source path, `.md` → `.html`) with `<meta http-equiv=refresh>`,
`<noscript>` visible link, `noindex`, and `safeRedirectTarget` semantics
(same-origin gate; 0 unsafe targets). Receipt:
`route-registry/alias-pages.json`. **170 pages** for the Wave-2 families
(admin 12, data-factory 78, fundamentals 12, onelake 26, real-time-
intelligence 42) — verified surviving `next build` verbatim in
`out/fabric-aliases/`. Full rollout is FC12/FC13.

`public/` HTML files survive the static export unchanged (verified above) —
this is the zero-route-file mechanism, preferred per the task brief.

## 8. Build measurement

| Metric | Baseline | After FC05 | Delta |
|---|---|---|---|
| `out/` files | 2,859 | 22,972 | **+20,113** |
| `out/` bytes | 156.1 MB | 1,250.1 MB | **+1,094.0 MB** |
| Pages added | — | 2,706 `index.html` in `out/learn/fabric/docs/` (2,705 articles + docs index) | |
| Build wall time | 38 s warm / 136 s cold | **209 s** (`npm run build` incl. postbuild; first build with the corpus namespace — closest analogue is cold) | +73 s vs cold baseline |

Delta breakdown: `out/learn/fabric/docs` 16,236 files / 708.8 MB (2,706
index.html = 266.6 MB + 13,530 Next RSC/txt payload & segment-cache files =
442.2 MB), `out/fabric-docs-assets` 3,707 files / 385.1 MB,
`out/fabric-aliases` 170 files / 0.1 MB.

Renderer-gate evidence (for the OPEN FC13 decision): the Next App Router
export amplifies to ~6 files and ~262 KB per article (RSC/txt payloads +
segment cache), while a same-origin static HTML compiler would emit 1 file
per article. Full-body HTML for the 2,705 articles is 266.6 MB — the media
(404.7 MB for just 5 of 22 families) dominates the byte budget either way.

Gates run after the build:
- `npm run verify:curriculum` — PASS: "883 internal links resolve in out/."
- Whole-export link check (new, FC05): 20,929 `/learn/fabric/docs/…` hrefs
  across 2,706 pages — **0 missing targets**.
- Whole-export image check: 3,933 imgs — **0 broken**.
- Collision gate (`tests/fabric-corpus/routes/collisions.test.mjs`, post-
  build): PASS — `docs` reserved, family slugs vs `app/learn` first-level
  names (static list `APP_LEARN_STATIC_NAMES` derived from the tree at
  0762eb5, with a drift guard), no duplicate logical routes, slug charset,
  export inventory (`out/learn/docs` absent).
- `npx tsc --noEmit` — clean. ESLint on all new files — clean.

## 9. Spot checks (6 articles, 5 families)

| Article (family) | Title/h1 | Provenance sha+rev | 'undefined' in visible markup | Images | '[!INCLUDE' leak | Local doc links resolve |
|---|---|---|---|---|---|---|
| fundamentals/analyze-train-data | ✓ | ✓ | 0 | 2/2 resolve (copied) | 0 | ✓ (whole-export check) |
| data-factory/slowly-changing-dimension-type-two | ✓ | ✓ | 0 | 17/17 resolve (copied) | 0 | ✓ |
| real-time-intelligence/eventhouse-as-endpoint | ✓ | ✓ | 0 | 14/14 resolve (copied) | 0 | ✓ |
| admin/service-admin-portal-copilot | ✓ | ✓ | 0 | 9/9 resolve (incl. cross-family fundamentals media) | 0 | ✓ |
| database/hub/overview (nested route, family NOT copied) | ✓ | ✓ | 0 | 0 imgs; 2 accessible fallback blocks | 0 | ✓ |
| iq/ontology/overview (nested route, family NOT copied) | ✓ | ✓ | 0 | 0 imgs; 4 accessible fallback blocks | 0 | ✓ |

Notes: the literal string "undefined" appears only inside Next's RSC flight
payloads (`$undefined` markers — the pre-existing pages show the same
framework artifact; 0 occurrences in visible markup). All internal article
links render as `/learn/fabric/docs/…` or upstream
`learn.microsoft.com` links; no raw `.md` hrefs, no `/docs/…` hrefs.

## Fail-closed proof

1. Registry reconciliation gate: script exits non-zero, writes nothing,
   unless published + excluded === ledger rows (asserted in-script and in
   tests).
2. `getRouteRegistry()`/`getArticleData()` throw on missing/malformed
   registry or node (tested with an empty temp build dir) — the build
   "fails closed if the registry or required article data is missing — never
   silently empties the namespace" (RELEASE_AND_STORAGE.md).
3. Holds (3), quarantined articles (89) and blob-hash mismatches never
   publish; 92/92 excluded logical paths verified absent from `out/`.
4. Quarantine re-check at load time (registry/node disagreement throws).
5. Images without copied bytes render accessible fallbacks — 0 broken image
   requests across the export.
6. `dynamicParams = false` — no unknown combination can render at runtime.

## Deviations (lead review items)

1. **`lib/fabric/paths.ts` one-line fix (FC11-owned file).** `next build`
   failed at HEAD with a PRE-EXISTING TS2367 in
   `assertProfileShape` (`candidate.trailingSlash !== false` against the
   literal-`true` profile type — the error exists in HEAD's FC11 file,
   independent of FC05 changes). Applied the minimal semantic-preserving fix
   (boolean typeof check; explicit false wins, undefined → true). FC11's
   23 path tests still pass. FLAGGED for FC11/lead review — no ownership
   amendment was available mid-task.
2. **`.gitignore` (shared file) — added `/public/fabric-docs-assets/` and
   `/public/fabric-aliases/`.** Required by RELEASE_AND_STORAGE.md ("Never
   in Git history: … generated HTML/indexes/media"): the copied media tree
   is 404.7 MB. Without the ignore lines a lead commit would sweep generated
   media into history.
3. **Registry row shape** carries `family` per article row (needed by the
   loaders/pages; the ownership contract gives FC05 the route-registry
   schema area).
4. **`includes` family compiled** as an include-source (non-routed) family
   so the 14 top-level `docs/includes/...` fragments referenced by published
   articles render with content instead of placeholders (zero silent drops;
   the ledger has no article rows for it, so it never enters the registry).
5. **Renderer choice**: implemented the Next App Router static-params route
   as the Wave-2 probe in a renderer-neutral shape (per the ownership
   contract the final App-Router-vs-static-HTML decision stays open until
   FC13's measurement; the amplification numbers in §8 are the FC05 input
   to that gate).

## NOT RUN / limitations

- Browser/screenshot QA and dark-mode pass (visual QA limit — static HTML
  verified programmatically; no browser automation run in this task).
- Subpath profile build (`NEXT_PUBLIC_BASE_PATH` set) not exercised here;
  the profile plumbing is unit-tested (loaders + FC11 paths tests).
- Search (FC07), bindings (FC06), Atlas (FC08) integration — out of scope.
- Full alias rollout (941 wired vs 170 Wave-2 pages) — FC12/FC13.
- Full asset copy (17 non-representative families) — FC13 via the same
  family-parameterized script.
- Reproducibility double-run of the full 22-family compile (determinism is
  enforced by the FC03 compiler contract and covered by its determinism
  tests; this task ran the batch twice — once for the families, once for
  the receipt — with stable manifests, but did not diff every node byte).

## Reproduction (order matters)

```
node tools/fabric-corpus/route-registry/compile-all-families.mjs
node tools/fabric-corpus/route-registry/build-registry.mjs
node tools/fabric-corpus/route-registry/copy-assets.mjs
node tools/fabric-corpus/route-registry/write-alias-routes.mjs
node --experimental-strip-types --test "tests/fabric-corpus/routes/*.test.mjs"
npm run build
node --experimental-strip-types scripts/verify-curriculum-routes.mjs
```
