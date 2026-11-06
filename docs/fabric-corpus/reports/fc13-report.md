# FC13 report — renderer-gate capacity review (same-origin static HTML comparator)

Status: delivered on branch `feat/fabric-corpus-20261105`, worktree
`amir-portfolio-fabric`. Corpus pinned at
`774592ea3f2d4558f763d6e5b74abf4785948fb5`; route registry
`0c9dd4f84395947525c368b8c6c907417324fe5a8dd2c0aad39334b7a139f894`
(2,716 published / 81 excluded / 2,797 ledger rows; 947 wired aliases).
Nothing was committed and nothing was deployed. The Next renderer was NOT
re-built or re-measured (task constraint): the Next numbers below are the
measured FC12/FC05 figures used verbatim; every comparator number is measured
here from the new generator.

This report presents decision INPUTS for the open "Rendering and hosting
decision" (handover 03 §"Independent review dispositions"). It does not select
the renderer.

## 1. Deliverable

`tools/fabric-corpus/bench-comparator/render-static-html.mjs` — consumes the
route registry, the compiled typed nodes
(`compiler-output/<family>/nodes/**`) and the same asset manifest the Next
build uses, and renders ONE self-contained HTML file per published article
plus a docs index, 404, and the 174 alias pages, into
`fabric-corpus-build/comparator/<profile>/site/`. Link rules, admonition
mapping, zone/tab equivalents, image policy, include inlining and provenance
footer are byte-for-byte mirrors of
`components/fabric/article/ArticleBody.tsx` / `decisions.ts` /
`article-data.ts`; the base path is applied exactly once through
`lib/fabric/paths.ts` `buildPublicUrl`/`buildAssetUrl` (imported with an
explicit `.ts` extension under `--experimental-strip-types`). Hand-written
inline CSS (~150 lines, no framework), zero JavaScript. The shared trees are
referenced, never copied: image `src` points at `/fabric-docs-assets/…`
(resolved against the same copied asset tree the Next build ships) and search
shards stay at `/fabric-search/…`, so one asset tree and one shard set serve
both renderers.

Outputs (build workspace only): `comparator/<profile>/site/`,
`comparator/<profile>/site-manifest.json` (deterministic, clock-free),
`comparator/<profile>/render-report.json` (measurement + gates; the one place
timing is allowed, as bench evidence).

## 2. Renderer-gate comparison table (the decision table)

All 2,716 published articles render complete bodies in BOTH renderers
(Next: FC12 coverage gate "2,716/2,716"; comparator: gate below).

| Metric | Next App Router static export (FC12 measured) | Static HTML comparator (FC13 measured) |
|---|---|---|
| Output files, root | 29,019 | **2,892** (2,716 articles + docs index + 174 aliases + 404) |
| Output files, subpath | 29,019 | **2,892** |
| Output bytes, root | 2,960.5 MB | **58.85 MB** (61,707,693 B) |
| Output bytes, subpath | 2,968.4 MB | **59.42 MB** (62,305,053 B; +597,360 B prefix overhead) |
| Build/render wall time | 286–334 s (2 runs, incl. postbuild) | **9.3–12.5 s** (4 runs: 9,306 / 10,519 / 12,512 / 9,711 ms) |
| Files per article | ~6 (index.html + RSC/txt payloads + segment cache) | **1** |
| Bytes per article | ~262 KB avg (708.8 MB / 2,706 pages) | **22.7 KB avg / 19.6 KB median / 43.1 KB p95 / 246.3 KB max** |
| Assets + search shards | 9,586 files / 2.15 GB + 105 files / 25 MB — **identical, shared** | referenced, not copied — identical, shared |
| JS required for reading | None for body content (server-rendered HTML), but hydration/RSC payloads are shipped per article | **None; zero `<script>` tags in all 2,892 files** |
| Route coverage | 2,716 articles + docs index; dynamicParams=false | identical (registry-driven; 0/81 excluded paths present) |
| Alias strategy | `public/fabric-aliases/*.html` meta-refresh + noscript, regenerated per profile | same 174 pages, same mechanism, same per-profile prefix rule |
| 404 | Next 404 page | static `404.html` |
| Text-layer amplification vs comparator | 19,433 text files / ~806 MB → **6.7× files, 13.7× bytes** | 1× (baseline) |

Per-article largest pages (comparator, root): `fundamentals/whats-new`
246,296 B; `fundamentals/understand-best-practices-fabric-cicd` 240,158 B;
`data-factory/expression-language` 224,024 B. Largest asset is far below the
Cloudflare 25 MiB per-file limit (FC12 observation).

Note on the inline CSS: each page carries the shared ~7.2 KB stylesheet, i.e.
~16 MB of the 58.85 MB root total is repeated CSS. Extracting it to one file
would cut text bytes by roughly a quarter at the cost of a second request and
the single-file property — recorded as an option, not taken (self-containment
was the gate's premise).

## 3. No-JS proof

Gate over every emitted HTML file, both profiles (2,892 files × 2):

- `<script>` tags: **0**. `javascript:` hrefs: **0**. Event-handler
  attributes: **0**. `fetch(`/XMLHttpRequest/EventSource/WebSocket constructs
  outside inert code samples: **0**. (Code samples are escaped text; the scan
  excludes `<pre>`/`<code>` regions so documentation that teaches about
  `fetch()` cannot false-positive.)
- One gate defect found and fixed during the run: prose "under-fetch (make
  multiple calls)" matched a too-loose `fetch\s*\(` pattern; tightened to a
  call shape and re-run clean.
- Reading, deep links (trailing-slash directories + `index.html`), same-page
  anchors, alias pages (meta refresh + `<noscript>` link) and the 404 all
  work with JS disabled by construction.

## 4. Structural completeness (5 representative articles, FC05 §9 parity)

| Article | Headings node ↔ HTML | Tables/code/prose | Provenance | Images |
|---|---|---|---|---|
| fundamentals/analyze-train-data | 11 ↔ 11 ✓ | ✓ | ✓ (source path, rev `774592ea3f2d`, blob sha, CC BY 4.0, upstream URL) | 2 local, resolve |
| data-factory/slowly-changing-dimension-type-two | 13 ↔ 13 ✓ | ✓ | ✓ | 23 local, resolve |
| real-time-intelligence/eventhouse-as-endpoint | 20 ↔ 20 ✓ | ✓ | ✓ | 14 local, resolve |
| admin/service-admin-portal-copilot | 10 ↔ 10 ✓ | ✓ | ✓ | 9 local, resolve |
| database/hub/overview (nested route) | 27 ↔ 27 ✓ | ✓ | ✓ | 1 local, resolves |

Body headings map h2–h4 exactly as `ArticleBody` does; the page title is the
h1; the provenance footer's own h2 is excluded from the body count (an
initial gate counted it — fixed before measurement).

## 5. Whole-site integrity sweep (root profile; subpath identical)

- Local docs links: **21,608** across 2,892 pages → **0 missing targets**
  (every href resolves to an emitted `index.html`; parity with FC05's
  20,929-href check on the then-smaller corpus).
- Anchor-bearing local links: 2,742 → 20 point at anchors absent from the
  target page. Root cause: `decisions.ts` validates anchors for
  `relative-md` links but NOT for `site-absolute` links (e.g.
  `/fabric/admin/git-integration-admin-settings#users-can-synchronize-…-preview`
  from cicd include fragments). The comparator mirrors `ArticleBody`
  byte-for-byte, so the Next export ships the same 20 mismatches — an
  upstream-content artifact shared by both renderers, not a comparator
  deviation. Recorded for a future decisions-layer amendment.
- Same-page `#anchor` links: all resolve to an `id` on their page (validated
  per page, corpus-wide).
- Images: **9,945** `<img>` emitted, **9,945/9,945 asset references resolve**
  in the shared `public/fabric-docs-assets` tree (both profiles). 1,067
  accessible fallback blocks where the asset manifest has no copied bytes
  (same decisions as the Next renderer).
- Unresolved references rendered as inert plain-text notes (with accessible
  note): 378 — never a dead local link (decision-layer parity).
- Raw local `.md` hrefs: **0** (39 `.md`-bearing hrefs are upstream absolute
  URLs — learn.microsoft.com / GitHub — which the rules preserve verbatim).
- Only `/learn/fabric/**` is served locally; every other docset stays
  upstream.

## 6. Determinism evidence

- Two independent FULL renders per profile: site manifest SHA-256 identical
  within each profile — root `94db6e18af33cfcd…`, subpath
  `86e4ef4fa67beadd…` (manifest = sorted rel+bytes list; no clock anywhere in
  the site or manifest).
- Byte-level verification (per-file SHA-256 across runs): **2,892/2,892
  byte-identical, root; 2,892/2,892, subpath**; no missing/extra files.
- Test-suite determinism (bounded corpus, `--limit 80`): two renders per
  profile byte-identical; manifest hash reproducible from its own file list;
  no timestamp/renderMs fields in the manifest.

## 7. Per-provider verdicts (exact numbers; limits from handover 03, verified 2026-11-05)

| Target × renderer | Full media (with 9,586 assets in-tree) | Text-only / media on approved independent origin |
|---|---|---|
| GitHub Pages (subpath) — 1 GB published | Next: **BLOCKED** (2.96 GB) · Comparator: **BLOCKED** (58.85 MB + 2,154.3 MB = 2,213 MB) — media dominates either renderer | Next: PASS (~806 MB, 19,433 files) · Comparator: **PASS (58.85 MB, 2,892 files)** — headroom ~94% |
| Vercel (root) — no published-size ceiling documented; prebuilt-upload ceiling UNKNOWN | Next: PASS pending controlled prebuilt validation (FC12) · Comparator: 2,892 files / 58.85 MB — same unknown applies to the uploaded artifact; build limit (45 min) trivially met | PASS both, same unknown recorded (05 gate: undocumented ⇒ record, then controlled validation after approval) |
| Cloudflare Workers Static Assets Free — 20,000 files/version, 25 MiB/file | Next: **BLOCKED** (29,019 > 20,000) · **Comparator: PASS (2,892 + 9,586 = 12,478 files)** — the only full-media cell that fits Free; no aggregate byte ceiling documented; largest asset ≪ 25 MiB | Next: PASS by count, thin margin (19,433 vs 20,000, 2.8% headroom — answers FC12's open question) · Comparator: PASS (2,892 files) |
| Cloudflare Paid (100,000 files) | PASS both renderers | PASS both renderers |

Reading of the table (evidence, not a recommendation):

- The comparator removes the Next segment amplification: −26,127 files and
  −13.7× text bytes. It does NOT by itself lift the GitHub Pages full-media
  block — the 2.15 GB media tree dominates that ceiling under either
  renderer. The architecture-sanctioned media-independence arrangement
  (adapters.md §C, owner decision required) is what unblocks Pages, under
  either renderer.
- The comparator is the only measured configuration where the FULL corpus
  (all articles + all media) fits Cloudflare Free without the media-origin
  arrangement.
- Host-fit is necessary but not sufficient: CSP-friendliness, alias/404
  behaviour, and the packaging contract are identical-or-compatible for both
  renderers; the remaining differentiators are maintenance surface (Next app
  routes + RSC payloads vs one HTML template), build cost (§8), and the
  interactive features (search UI, Atlas returns) that are JS-time concerns
  regardless of renderer.

## 8. Cold/warm build costs and memory

- Comparator render: 9.3–12.5 s wall for the full corpus, single Node 22
  process (`--experimental-strip-types`), sequential per-article render.
  Four measured runs on a warm OS file cache; no cold-cache run was taken
  (the machine had just compiled the corpus; treat 12.5 s as the observed
  upper bound). Cold/warm delta was not separable — NOT RUN.
- Peak memory (comparator): RSS ~108 MB, heap peak ~35 MB, start heap ~22 MB
  (Node baseline included). Next peak RSS: not instrumented in this task —
  NOT RUN (bench/measure-export.mjs notes FC13 peak-RSS extension; the Next
  build itself was not run here).
- Scratch disk: comparator writes ~59 MB per profile (plus reports);
  re-runs overwrite in place. Next: 2.96 GB per profile (FC12).
- Next build cost remains 286–334 s (FC12, two runs). Rebuild-per-update
  economics: the comparator's full render costs ~4% of one Next build
  minute-for-minute; incremental equivalence for the comparator (rebuild only
  changed articles) is unimplemented and NOT RUN — full rebuild is the
  reproducibility fallback in both cases.

## 9. CSP consideration (recorded, no decision)

The comparator pages carry one inline `<style>` and no scripts: serving them
needs `style-src 'unsafe-inline'` (or per-page hashes/nonces generated at
packaging time — the set is deterministic, so a hash-based policy is
precomputable) and allows `script-src 'none'`, `connect-src 'none'`;
`img-src 'self'` covers the shared asset tree; `form-action`/`frame-src` are
unused. The Next export needs script-src for its hydration/runtime chunks
even though the article body itself is server-rendered. Neither profile was
served under a real CSP in this task — NOT RUN.

## 10. Coverage reconciliation (registry is the authority)

| Check | Result |
|---|---|
| Published rows (registry) | 2,716 |
| Comparator article HTML files | 2,716 (one per row, at `learn/fabric/docs/<family>/<segments>/index.html`) |
| Missing | 0 (both profiles) |
| Excluded rows (78 quarantine + 2 rights holds + 1 external-dependency hold) | 81 |
| Excluded logical paths present in the site | 0 (both profiles) |
| published + excluded | 2,797 = ledger article rows ✓ |
| Alias pages (receipt `hansa.fabric-alias-pages/1`) | 174 (admin 12, data-factory 82, fundamentals 12, onelake 26, real-time-intelligence 42), 0 unsafe targets |
| 404 + docs index | 1 + 1 |

## 11. Deviations (lead review items)

1. **Alias pages re-emitted, not copied verbatim.** The task said "copy the
   existing generated public/fabric-aliases tree"; that tree is root-profile
   (the FC12 dry run proved copied-as-is alias pages FAIL the subpath prefix
   gate). The comparator re-emits the same 174 pages from the
   `route-registry/alias-pages.json` receipt using the
   `write-alias-routes.mjs` template with the profile base path applied once
   — mirroring the packaging driver's per-profile alias regeneration. File
   set identical (174; receipt ↔ tree equality verified).
2. **Docs hub links point outside the comparator site.** Breadcrumb "Microsoft
   Fabric" and the provenance back link target `/learn/fabric/`, which the
   comparator does not emit (it measures the docs corpus). The URLs are
   profile-correct via `buildPublicUrl`; in a real deployment the hub comes
   from the same site. Recorded so the 0-missing-targets claim is read as
   "docs namespace only".
3. **Spot-check gate fix.** The heading-parity check initially counted the
   provenance footer's h2; corrected to body-region counting before the
   measured runs (no artifact impact).
4. **Bench helpers live in the build workspace** (`comparator/_determinism-check.mjs`,
   `comparator/_site-sweep.mjs`), not the repo — they are evidence tooling,
   not product code; the test suite re-implements the assertions it needs.

## 12. NOT RUN / limitations

- `npm run build` / any Next measurement (prohibited by task; FC12 numbers
  used verbatim — no independent re-verification in FC13).
- Deployment, provider uploads, CSP enforcement, live link checking (all
  prohibited / out of scope per 05).
- Browser/screenshot QA of comparator pages (visual QA limit — programmatic
  structural checks only). The comparator shell mirrors the hub's visual
  tokens but is not a pixel review.
- Search-shard FETCH behaviour (JS-time feature; shards referenced, not
  exercised — the no-JS site intentionally fetches nothing).
- sitemap/robots/social metadata (Next export scope; comparator emits none).
- Full alias rollout (947 wired vs 174 Wave-2 pages) — unchanged from
  FC05/FC12; the comparator ships parity with the current tree, not the
  rollout.
- Comparator incremental rebuild (per-article invalidation) — NOT RUN.
- Next peak-RSS capture — NOT RUN.

## 13. PASS/FAIL/NOT RUN

| # | Deliverable | Status |
|---|---|---|
| 1 | `tools/fabric-corpus/bench-comparator/render-static-html.mjs` (both profiles, deterministic, gated) | PASS |
| 2 | Measurements both profiles (files/bytes/time/per-article/largest) + coverage/exclusion/prefix/asset gates | PASS (root 2,892 files / 58.85 MB / 9.3–10.5 s; subpath 2,892 / 59.42 MB / 9.7–12.5 s; all gates green) |
| 3 | No-JS proof + 5-article structural completeness + CSP note | PASS (0 script tags / 0 fetch patterns in 5,784 files; 5/5 heading parity) |
| 4 | Renderer-gate comparison table + per-provider verdicts + media-independence math | PASS (§2, §7) |
| 5 | `tests/fabric-corpus/comparator/*.test.mjs` | PASS (23/23: determinism 2, gate re-assertions 14 (7 × 2 profiles), link-rule parity 7; full suite ~9 s) |
| 6 | `docs/fabric-corpus/reports/fc13-report.md` | PASS (this report) |
| — | Next renderer re-measurement / deployment of any kind | NOT RUN (prohibited) |

## 14. Reproduction (order matters)

```
node tools/fabric-corpus/route-registry/compile-all-families.mjs     # if nodes absent
node tools/fabric-corpus/route-registry/build-registry.mjs           # if registry stale
node tools/fabric-corpus/route-registry/copy-assets.mjs              # if public tree absent
node tools/fabric-corpus/route-registry/write-alias-routes.mjs       # if receipt absent
node --experimental-strip-types tools/fabric-corpus/bench-comparator/render-static-html.mjs --profile root
node --experimental-strip-types tools/fabric-corpus/bench-comparator/render-static-html.mjs --profile subpath
node --experimental-strip-types --test "tests/fabric-corpus/comparator/*.test.mjs"
```

Full-render receipts: `fabric-corpus-build/comparator/{root,subpath}/render-report.json`
and `site-manifest.json` (determinism hashes in §6). The determinism
re-runs live at `comparator/{root,subpath}-determinism/`.
