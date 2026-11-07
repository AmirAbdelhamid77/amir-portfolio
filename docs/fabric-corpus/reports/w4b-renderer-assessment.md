# W4-B report — renderer architecture assessment (decision INPUT, not a decision)

Status: delivered on branch `feat/fabric-corpus-20261105`, worktree
`amir-portfolio-fabric`, HEAD `371fe0f`. Analysis-and-writing task only: no
builds, no code changes, no deployments. Corpus pinned at `774592ea3f2d…`,
registry `0c9dd4f8…` (2,716 published / 81 excluded / 947 wired aliases),
2,716 articles + 9,586 assets (2,154.3 MB) + 105 search shards (25.1 MB).

This document supports the open owner decision "which renderer for the
full-corpus Fabric site" (handover 03, §Independent review dispositions:
"Rendering and hosting decision open"). It consolidates the measured evidence
from FC05/FC07/FC12/FC13 and Wave-3, corrects two ratio claims in Wave-3 §6,
states the hybrid option as an explicitly labelled hypothesis, and frames the
recommendation by priority. It does not select the renderer.

**Tagging convention.** Every factual claim is tagged:
**[M]** = measured (source report cited), **[H]** = hypothesis (basis stated).
Numbers without tags inside tables inherit the row tag.

---

## 1. Corrected measurement table

Wave-3 §6 pairs total-layer figures with text-layer ratios in two rows
("Files (text layer) 29,019 | 2,892 (6.7× fewer)" and "Bytes (text layer)
~2.96 GB | ~59 MB (13.7×)"). Both ratio claims are internally inconsistent
with their own row values: 29,019 / 2,892 = **10.0×**, not 6.7× (6.7× is the
text-layer file ratio 19,433 / 2,892), and 2.96 GB / 59 MB = **50.3×**, not
13.7× (13.7× is the text-layer byte ratio ~806 MB / 58.85 MB; 2.96 GB is not
a text-layer figure — it includes the 2,154.3 MB media tree). The corrected
rows below keep every figure traceable to its report.

### 1.1 Renderer comparison (full corpus, both profiles)

| Metric | Next App Router static export | Static HTML comparator | Exact multiple | Tag / source |
|---|---|---|---|---|
| Output files, total | 29,019 | 2,892 (2,716 articles + docs index + 174 aliases + 404) | **10.0×** (29,019/2,892) — but the Next total includes the 9,586 shared media files the comparator table omits | [M] FC12 §profiles; FC13 §2 |
| Output files, text layer | 19,433 (29,019 − 9,586 media) | 2,892 | **6.7×** (19,433/2,892 = 6.72) | [M] FC13 §2 |
| Output bytes, total | 2,960.5 MB (root) / 2,968.4 MB (subpath) | 58.85 MB root / 59.42 MB subpath (raw comparator dirs carry no media or shards) | 50.3× — **not a like-for-like ratio** | [M] FC12; FC13 §2 |
| Output bytes, text layer | ~806 MB (19,433 files incl. 25.1 MB shards) | 58.85 MB (61,707,693 B) | **13.7×** (806/58.85 = 13.70) | [M] FC13 §2 |
| **Honest full-site bytes (media shared, identical)** | **2,960.5 MB** (measured) | **≈ 2,238 MB** = 58.85 text + 2,154.3 media + 25.1 shards; the media+text framing gives ≈ 2,213 MB | **≈ 1.32–1.34×** (2,960.5/2,238 = 1.32; 2,960.5/2,213 = 1.34) | [M] parts, [H] arithmetic only — see §1.2 |
| **Honest full-site files (both sides + shared trees)** | 29,019 | 2,892 + 9,586 + 105 = 12,583 (FC13's per-provider cell cites 12,478, excluding shards) | **2.3×** (29,019/12,583 = 2.31) | [M] parts, [H] arithmetic only |
| Build/render wall time | 286–334 s (2 runs, incl. postbuild) | 9.3–12.5 s (4 runs: 9,306 / 10,519 / 12,512 / 9,711 ms) | **22.9×–35.9×** (286/12.5 = 22.9; 334/9.3 = 35.9; ≈ 28× midpoint-to-midpoint 310/10.9) | [M] FC12; FC13 §2, §8 |
| Files per article | ~6 (index.html + RSC/txt payloads + segment cache) | 1 | 6× | [M] FC13 §2 (Next per-page from FC05 §8) |
| Bytes per article | ~262 KB avg (708.8 MB / 2,706 pages) | 22.7 KB avg / 19.6 KB median / 43.1 KB p95 / 246.3 KB max | ~11.5× avg | [M] FC13 §2; Next avg from FC05 §8 |
| JS required for reading | None for body content (server-rendered HTML), but hydration/RSC payloads ship per article | None; zero `<script>` tags in all 2,892 files (both profiles) | — | [M] FC13 §2, §3 |
| Coverage | 2,716/2,716 rendered, 0/81 excluded present, 0 mismatches, both profiles | 2,716/2,716; 0 excluded paths present; 174 aliases receipt-verified; both profiles | — | [M] FC12 coverage gate; FC13 §10 |
| Determinism | Two independent runs: identical file counts (29,019), identical byte totals (2,960.5 MB), identical gate outcomes; full byte-hash cross-run equality pending the label-differentiated-manifest fix (driver overwrote run 1's manifest — recorded) | Byte-identical SHA-256 across independent full renders: 2,892/2,892 per profile; site-manifest SHA stable per profile (root `94db6e18…`, subpath `86e4ef4f…`); clock-free | — | [M] FC12 §Reproducibility; FC13 §6 |
| Link integrity | 20,929 `/learn/fabric/docs/…` hrefs, 0 missing targets (Wave-2 corpus, 2,706 pages) | 21,608 local hrefs across 2,892 pages, 0 missing targets (full corpus) | — | [M] FC05 §8; FC13 §5 (FC13 notes the parity caveat: the Next figure is the then-smaller corpus) |
| Images | 3,933 imgs, 0 broken (Wave-2, 5 families copied); full corpus: 9,945 emitted, 9,945/9,945 resolve + 1,067 accessible fallbacks (comparator run; decisions-layer parity) | 9,945/9,945 resolve; 1,067 fallback blocks; 378 unresolved refs as inert notes — never a dead link | — | [M] FC05 §6; FC13 §5 |
| Assets + shards | 9,586 files / 2,154.3 MB assets + 105 files / 25.1 MB shards — identical, shared | referenced, not copied — identical, shared | 1× | [M] FC13 §2, §7; wave3 §2 |
| Peak memory | NOT RUN (not instrumented) | RSS ~108 MB, heap peak ~35 MB | — | [M] comparator FC13 §8; Next NOT RUN (FC13 §8) |
| Cold-cache build delta | 38 s warm / 136 s cold at pre-corpus baseline; full-corpus cold/warm not separable | not separable (warm OS file cache; 12.5 s observed upper bound) | — | [M] FC05 §8 (baseline row); NOT RUN FC13 §8 |

### 1.2 The honest size arithmetic (why 13.7× is text-only truth)

The two renderer output trees are not comparable directly: the Next `out/`
contains the 2,154.3 MB media tree; the comparator references it. The
defensible statements are [M + arithmetic]:

1. **Text layer only:** ~806 MB vs 58.85 MB = **13.7×**, 19,433 vs 2,892
   files = **6.7×**. This is the segment-amplification cost of the Next
   renderer (RSC/txt payloads + segment cache): at Wave-2, FC05 §8 measured
   the docs tree as 2,706 index.html = 266.6 MB plus 13,530 payload/segment
   files = 442.2 MB — the payloads alone are ~1.7× the article HTML.
2. **Whole site, media in-tree (identical bytes either way):** 2,960.5 MB vs
   ≈ 2,213–2,238 MB ≈ **1.3×**. Once the same 2.15 GB of media sits in both
   trees, the renderer choice changes the total site budget by ~750 MB, not
   by 13.7×. The 13.7× headline is real but is a **text-layer** property.

---

## 2. The three options, defined precisely

- **Option A — Next.js static export (incumbent, fully measured).** The
  production renderer as integrated: `app/learn/fabric/docs/[family]/[...article]/page.tsx`
  with registry-driven `generateStaticParams`, `dynamicParams = false`,
  server-rendered `ArticleBody` + `ProvenanceFooter` + `DocsHeader`, plus the
  whole pre-existing Hansa app (Home, lessons, practice, search, Atlas).
  Everything is built, gated, receipt-pinned. [M] FC05/FC12.
- **Option B — pure static HTML (the FC13 comparator, measured).** One
  self-contained HTML file per article, ~150 lines of inline CSS, zero
  JavaScript, from `tools/fabric-corpus/bench-comparator/render-static-html.mjs`.
  **Measured scope caveat:** the comparator emits the docs corpus only
  (2,892 files). It is not a whole-site renderer — it was never measured
  against Home, lessons, practice, question banks, Atlas or the search UI.
  [M] FC13 §1, §12.
- **Option C — hybrid (hypOTHESIS; nothing built, nothing measured).**
  Comparator-generated article pages + the existing Next-built interactive
  surfaces kept at their existing routes as separate static bundles.
  Described in §3 purely as an architectural hypothesis.

**A framing observation that sharpens the decision [H, from M premises]:**
the measured Option B and Option C are not fully distinct proposals. The
moment you keep the Next app for anything interactive (search UI, Atlas
Explorer, knowledge-stage Home), you have invented C. Conversely, "pure B"
applied to the whole site would discard those surfaces entirely — which
contradicts the architecture spec's own feature list ("Learners enter through
existing Fabric topics, lessons, search or Atlas", handover 03 §Feature
specification, all of which are Next surfaces today). So the practical choice
is **A (Next for everything) vs C (split)**, with "pure B" = C minus the
interactive surfaces = a product decision to drop them, not a renderer
measurement. Handover 03's gate wording ("a same-origin static HTML compiler
that uses shared Hansa styling, navigation, return context and search") makes
this explicit: as measured, the comparator satisfies the gate's
"complete article bodies without JavaScript" but ships **no** shared
navigation beyond a breadcrumb, **no** search UI and **no** return context —
FC13 itself records that "the remaining differentiators are maintenance
surface, build cost, and the interactive features (search UI, Atlas returns)
that are JS-time concerns regardless of renderer" [M] FC13 §7. A pure-B that
met the gate in full would need new engineering that is unmeasured.

---

## 3. Option C — hybrid assembly (architectural hypothesis)

**Nothing hybrid has been built, measured, or gated. Everything in this
section is [H] unless it restates a [M] component figure.**

### 3.1 Plausible assembly

1. **Article layer:** the FC13 comparator output (2,716 self-contained
   article pages + docs index + 174 alias pages + 404, zero script tags) at
   `/learn/fabric/docs/**`.
2. **Interactive shells:** the existing Next build, with the corpus docs
   namespace removed from `generateStaticParams`, shipping its other routes
   unchanged at their existing URLs: `/` (HansaKnowledgeLanding knowledge
   stage), `/search` (SearchWithFabric band), `/learn/dp-600/atlas/` and
   `/learn/dp-600/atlas/journey/` (Atlas Explorer, journey), `/learn/statistics/atlas/`,
   lessons, practice, question banks, About/Work. [M] for the routes'
   existence and client-component nature (code: `components/atlas/explorer.tsx`
   is `"use client"`; `app/search/page.tsx` mounts `SearchWithFabric`;
   `app/page.tsx` mounts the knowledge landing); [H] for the docs-namespace
   removal being clean.
3. **Shared trees:** one asset tree (`/fabric-docs-assets/`, 9,586 files /
   2,154.3 MB) and one shard set (`/fabric-search/`, 105 files / 25.1 MB)
   referenced by both layers — this sharing is already how the comparator
   works. [M] FC13 §1.
4. **Links:** comparator articles link into the interactive routes
   (`/search`, `/learn/dp-600/atlas/`, `/learn/fabric/` hub — links the
   comparator already emits as profile-correct URLs; FC13 deviation §11.2
   records that they currently point outside the comparator site, and the
   Next shell would resolve them). The Atlas Explorer already emits article
   links carrying `atlasReturn` state (`resourceReturnHref`, lib/atlas/model.ts
   [M]). Return links back from a static article are structurally impossible
   without JS on that page (the return link is a client component reading
   `location.search` — `components/atlas/return-link.tsx` [M]); no corpus
   article consumer is wired today (`components/fabric/article/**` and the
   docs route contain no atlasReturn consumer [M]), so no measured loss
   exists — but any future return-context wiring on comparator articles
   conflicts with the zero-JS premise, and handover 03's gate explicitly
   requires "return context" in the static-HTML option. [H] implication.

### 3.2 What it would likely measure (extrapolation, all [H] from [M] parts)

The non-article portion of the Next build, derived from measured data
(FC05 §8 breakdown scaled to the full corpus; FC12 totals):

| Component | Files | Bytes | Basis |
|---|---|---|---|
| Comparator articles + index + aliases + 404 | 2,892 | 58.85 MB | [M] FC13 |
| Next-specific non-article remainder (framework JS chunks, RSC/segment payloads for the interactive routes: Home, search, Atlas, lessons, practice) | ~2,852 | ~69 MB | [H] = 29,019 − docs-tree files (16,236 × 2,717/2,706 ≈ 16,302) − 9,586 assets − 105 shards − 174 aliases = 2,852; 2,960.5 MB − ~711.6 MB docs tree − 2,154.3 − 25.1 − 0.1 ≈ 69 MB. Cross-check via text layer: 19,433 − 16,302 − 279 = 2,852 files; ~806 − ~737 ≈ 69 MB ✓ |
| Shared media | 9,586 | 2,154.3 MB | [M] FC13 §7 |
| Shared shards | 105 | 25.1 MB | [M] wave3 §2 |
| **Hybrid site total** | **~15,435** | **~2,308 MB** | [H] sum of the above |

- vs Next full: ~47% fewer files, ~22% fewer bytes [H arithmetic].
- vs comparator full: ~23% more files, ~3% more bytes [H arithmetic].
- Provider fit [H arithmetic from the derived totals]: Cloudflare Free
  (20,000 files/version) **PASS** with ~23% headroom (15,435 < 20,000);
  GitHub Pages 1 GB **BLOCKED** (≈ 2.31 GB — media dominates, same as every
  full-media option); Cloudflare Paid PASS; Vercel PASS pending the same
  prebuilt-ceiling unknown recorded for all options.
- Build time [H]: comparator 9.3–12.5 s + a Next build without the 2,717-page
  docs namespace. FC05 measured the pre-corpus baseline at 38 s warm /
  136 s cold; plausibly ~50–150 s combined — faster than the full 286–334 s
  build, ~5–10× slower than comparator-only. Unmeasured; the Next build's
  sensitivity to removing the docs namespace is the dominant unknown.
- Text-per-article experience: unchanged from the comparator (22.7 KB avg
  article pages, no JS for reading) with JS payloads fetched only on the
  interactive routes [H, follows from the assembly].

### 3.3 What Option C costs (the honest list)

1. **Two build systems, two deploy artifacts.** The release contract requires
   "atomically publish one coherent export, asset set and shard manifest"
   (handover 03 §Sync and release). C splits that into two artifacts that
   must be assembled, versioned and checksummed as one release; the
   fail-closed driver (build-release.mjs) currently drives ONE build. [M]
   contract; [H] the assembly work.
2. **Permanent double implementation of the decisions layer.** The
   comparator mirrors `ArticleBody.tsx` / `decisions.ts` / `article-data.ts`
   byte-for-byte [M] FC13 §1 — link rewrites, admonition mapping, zone/tab
   equivalents, image policy, include inlining. Every future rule change
   lands twice, with a parity gate to keep them honest (FC13 ships 7
   link-rule-parity tests as the seed of that surface [M]). Under A there is
   one implementation; under B (drop interactive) there is also one — the
   duplication is specifically C's tax.
3. **Link-contract maintenance across the seam.** Comparator → interactive
   links (search, atlas, hub) and interactive → article links must stay
   mutually resolving as either side evolves; base path must be applied
   exactly once by EACH system and then verified across the assembled site
   (the existing double-prefix gate would need a cross-artifact variant —
   new gate, unmeasured). [H] from [M] gate behavior (FC12 prefix gate).
4. **Search integration surface.** The fabric band's link shape
   (`next/link` + unprefixed `logicalPath`) and its `buildAssetUrl` shard
   fetches already work against any same-origin host [M] FC07 + code — but
   under C the band lives in the Next shell while its targets are
   comparator-generated; regression coverage across that seam does not exist
   today [H].
5. **Visual/theme drift.** The comparator's ~150-line CSS "mirrors the hub's
   visual tokens but is not a pixel review", carries no dark-mode support,
   and inlines ~7.2 KB per page (~16 MB of the 58.85 MB total; extraction
   recorded as an untaken option) [M] FC13 §2, §12 + generator source. Next
   pages carry the full theme system (colorScheme light dark, localStorage
   accent, theme script — app/layout.tsx [M]). Under C, a learner moving
   from a themed Next page into a comparator article crosses two CSS
   systems, one of them unreviewed visually.
6. **Metadata inconsistency.** Comparator articles are metadata-thin (§4
   criterion 4); Next pages are metadata-full. Under C the corpus — 2,716 of
   the site's most content-heavy pages — would be the site's
   second-class SEO surface, while the thin interactive shell is
   first-class. [H] consequence from [M] head inventories.

---

## 4. Seven-criteria evaluation

| # | Criterion | Option A — Next static export | Option B — pure static HTML (comparator) | Option C — hybrid | Tag |
|---|---|---|---|---|---|
| 1 | Build time / output size / deployment limits | 286–334 s build; 29,019 files / 2,960.5 MB; text layer 19,433 files / ~806 MB | 9.3–12.5 s render (23–36× faster); 2,892 files / 58.85 MB text | ~50–150 s combined [H]; ~15,435 files / ~2,308 MB [H] | [M] A/B; [H] C |
| 2 | Search functionality + performance | Shards+worker architecture (105 shards / 25.1 MB / 32,286 sections) works identically against any static host: `fabric-shards.ts` fetches manifest/routing/shards via `buildAssetUrl` (base path once), pure shard-independent scorer, worker bundled by Next; parity gate proven against whole-index reference. The `/search` page hydrates its shell (metadata index + fabric band, two-band merge contract, partial-status behavior all measured and tested) | Shards identical [M]; but the search UI does not exist — zero script tags means no query box, no worker, no band; a standalone static search bundle would be a rebuild (unmeasured engineering estimate) | Search UI stays as the Next `/search` page; shards shared; band links into static articles (same link shape); cross-artifact regression coverage new [H] | [M] FC07 + wave3 §2 + code; [H] B-rebuild, C-seam |
| 3 | Interactive Knowledge Graph requirements | Atlas Explorer is a `"use client"` component (motion/react, view state, history.pushState, ResizeObserver) mounted at `/learn/dp-600/atlas/` over the static `getAtlas()` projection — works today, receipt-pinned; approval-gated (2,716 awaiting-review, 0 approved) | Would need a rebuild as a standalone bundle to exist at all — engineering estimate, unmeasured; the pending-desk fallback is server-renderable but the explorer is not | Explorer ships as its Next route unchanged; static articles link into it; outbound `atlasReturn` links exist [M]; inbound return links on static articles structurally impossible without JS [M code / H implication] | [M] code + wave3 §4; [H] B-rebuild |
| 4 | Navigation / accessibility / SEO / mobile | Full metadata per article (title, description, relative canonical via `generateMetadata`), OG on shell pages, sitemap/robots in export scope, full theme system (light/dark + accent persistence), no-JS-readable bodies | `lang="en"`, viewport, `<title>`, description meta **only when front-matter description exists**, aliases `noindex`; **no canonical, no og:/twitter:, no sitemap/robots, no dark mode** (no prefers-color-scheme in the generator); a11y proven structurally (heading parity 5/5, sr-only figure notes, role="note" callouts, zero-JS reading/deep links/anchors/404 by construction) but no browser/screenshot QA ran | Corpus pages inherit B's thin metadata; interactive shell keeps A's full metadata → mixed surface; same visual-QA limit applies to both non-A options | [M] FC13 §2/§5/§12 + generator source + page.tsx/layout.tsx; [H] C-consequence |
| 5 | Maintenance complexity + incremental rebuilds | One renderer, one decisions layer, TypeScript fail-closed loaders, registry reconciliation gates, 39 route tests + suite infrastructure, FC09 sync invalidation (reverse dependency closure, tombstones, byte-identity for unchanged articles — measured) with full rebuild as the reproducibility fallback; page-level rebuild is all-or-nothing today (286–334 s per release) | One generator + ~150-line CSS; full re-render 9.3–12.5 s makes "incremental" moot in practice, but per-article invalidation is unimplemented (NOT RUN); the generator is a byte-for-byte mirror of the Next decisions layer — a standing parity obligation as long as both exist; comparator cost ≈ 4% of one Next build minute-for-minute | Everything in B's mirror obligation PLUS the Next app PLUS seam gates — strictly the largest maintenance surface of the three | [M] wave3 §7, FC13 §8, FC05; [H] C-surface (structural) |
| 6 | Media hosting independence | Identical — the asset tree is referenced by URL, never copied; A/B/C need the same 9,586-file / 2,154.3 MB tree in-tree or on an approved immutable origin. The media-origin decision is renderer-independent (owner call on storage + costs) | identical | identical | [M] FC13 §1, §7; adapters.md |
| 7 | Costs / free-tier fit | Full media: Pages **BLOCKED** (2.96 GB > 1 GB), Cloudflare Free **BLOCKED** (29,019 > 20,000), Cloudflare Paid PASS, Vercel PASS (prebuilt ceiling unknown — recorded). Text-only: Pages PASS (~806 MB, ~19% headroom), CF Free PASS by count with **2.8% headroom** (19,433 vs 20,000 — answers FC12's open question, thin), CF Paid PASS | Full media: Pages **BLOCKED** (58.85 MB + 2,154.3 MB = 2,213 MB > 1 GB — media dominates either renderer); **Cloudflare Free PASS — the only measured full-media configuration that fits** (2,892 + 9,586 = 12,478 files, ~38% headroom; 12,583 with shards); text-only PASS with ~94% headroom | Full media: CF Free PASS ~23% headroom [H derived]; Pages BLOCKED [H]; Paid/Vercel PASS [H] | [M] A/B cells FC13 §7, adapters.md; [H] C row |

CSP note (cross-criterion): comparator pages need `style-src 'unsafe-inline'`
(or a precomputable per-page hash policy — the set is deterministic) and
allow `script-src 'none'`; Next needs `script-src` for hydration chunks even
though bodies are server-rendered. Neither profile was served under a real
CSP — NOT RUN. [M] FC13 §9.

---

## 5. What each option loses

**Option B loses (all currently working and receipt-pinned):**
1. The Atlas Explorer route (`/learn/dp-600/atlas/` + journey) — an
   interactive client component; rebuild cost unmeasured. [M] existence /
   [H] rebuild.
2. The knowledge-stage Home (`app/page.tsx` → HansaKnowledgeLanding and its
   client stage components) — the canonical landing itself. [M].
3. The search UI shell (`/search`, SearchWithFabric band, worker bundle,
   metadata index) — under zero-JS articles search does not degrade, it
   disappears. [M] FC13 §3.
4. Metadata/canonical infrastructure: per-article canonicals, OG cards,
   sitemap/robots, themeColor/colorScheme, dark-mode + accent theme system
   with persistence. [M] FC13 §12 + layout/page sources.
5. The dev/type system: TypeScript fail-closed loaders, registry-driven
   `generateStaticParams`, `tsc --noEmit` cleanliness, the route/collision
   test suites, React component reuse (Container, DocsHeader, HubHeader). [M] FC05.
6. Curriculum surfaces that render the bindings (ReadingCollections, hub
   strip) as interactive UI. [M] wave3 §3.
7. The `atlasReturn` pattern's future on article pages: structurally
   impossible on zero-JS pages, and the handover gate names return context
   as a requirement of the static option. [M] code + gate text.
8. Beyond the corpus: B as a whole-site renderer is unmeasured — the
   comparator never rendered lessons, practice, or question banks. [M] scope
   (FC13 §1); the "loss" is the unpriced rebuild of everything else. [H].

**Option A keeps everything and pays:** 13.7× text-layer bytes, ~10× output
files (6.7× text-layer files), 23–36× build time, and two full-media
provider blocks (Pages, Cloudflare Free) that only the approved media-origin
arrangement lifts. [M].

**Option C pays two systems to keep both:** the double decisions-layer
implementation, two artifacts with an atomic-release obligation, seam gates,
metadata/theme inconsistency between layers, and the largest total
maintenance surface — in exchange for comparator-class article payloads and
Cloudflare-Free full-media fit. [H] structure, [M] components.

---

## 6. Recommendation framing (NOT a decision)

The measured evidence favors different options under different binding
constraints:

- **If the binding constraint is Cloudflare Free with full media and no
  approved media-origin arrangement:** the comparator (B) is the only
  measured full-corpus configuration that fits (12,478 files vs 20,000);
  the hybrid (C) is the plausible fit by derived arithmetic (~15,435 files,
  ~23% headroom) while keeping the interactive surfaces. Next (A) is
  measured BLOCKED there. [M] for B; [H] for C's derived fit.
- **If the binding constraint is integration continuity — the owner's
  existing verified surfaces, receipt chain, type system and tests:** Next
  (A) is the only option that preserves all of them today. Its costs are
  bytes and build time, not capability. [M].
- **If media independence is approved** (the architecture-sanctioned
  arrangement — adapters.md §C, owner decision on storage + costs): the size
  argument weakens sharply for everyone. Text-only numbers: Next 19,433
  files / ~806 MB → Pages PASS (~19% headroom), Cloudflare Free PASS but at
  **2.8% headroom** (thin; any corpus growth re-opens it), Cloudflare Paid
  comfortable; comparator 2,892 files / 58.85 MB → ~94% headroom everywhere.
  With media off-tree the renderer decision stops being a hosting decision
  and becomes purely an engineering trade (build time + payload weight vs
  interactive continuity). [M] counts; [H] "weakens sharply" reading.

**The blunt caveat.** Replacing the production renderer solely on the
comparator benchmark would discard verified interactive surfaces — Atlas
Explorer, knowledge-stage Home, search UI, metadata/theme infrastructure —
whose rebuild cost is unmeasured, in exchange for savings (13.7× text bytes,
23–36× build time) that mostly matter at the hosting margin and mostly
evaporate (to ~1.3× total bytes) once the shared media is accounted for or
moved to an approved origin. The comparator is a **capacity escape hatch**,
not a like-for-like replacement: FC13's own reading is that host-fit is
necessary but not sufficient, and that the remaining differentiators are
maintenance surface, build cost, and the JS-time interactive features. This
matches handover 03's instruction that the decision requires measured
evidence and remains the owner's; the gate's measurement is now complete for
the article-body question (both render full bodies without JS, both preserve
base path and aliases, both pass coverage), while the static side's
"shared navigation, return context and search" clause remains unmet as
measured. [M] FC13 §7, §12; handover 03.

**Priority-conditional summary:** constrained host → B or C; continuity → A;
media origin approved → A's thin Cloudflare-Free margin is the only residual
hosting argument against it, and C buys nothing there that A does not
already buy except Cloudflare-Free headroom.

---

## 7. Measured-vs-hypothesis ledger

| Claim | Tag | Source / basis |
|---|---|---|
| Next build 286–334 s (2 runs, incl. postbuild); 29,019 files / 2,960.5 MB root, 2,968.4 MB subpath; 19,409 text files scanned | [M] | FC12 profile table |
| Next text layer 19,433 files / ~806 MB; 6.7× files, 13.7× bytes vs comparator | [M] | FC13 §2 |
| Comparator 9.3–12.5 s (4 runs); 2,892 files / 58.85 MB root / 59.42 MB subpath; 1 file per article; 22.7 KB avg / 19.6 KB median / 43.1 KB p95 / 246.3 KB max | [M] | FC13 §2 |
| Corrected ratios: total files 10.0×; full-site bytes ≈ 1.32–1.34×; full-site files ≈ 2.3×; build time 22.9×–35.9× | [M] figures, [H] division arithmetic | §1 derivations from FC12/FC13 |
| Wave-3 §6 rows "6.7× fewer" on 29,019 and "13.7×" on 2.96 GB are ratio/row mismatches | [M] | arithmetic on wave3 §6 + FC13 §2 |
| Media 9,586 files / 2,154.3 MB and shards 105 files / 25.1 MB, shared identical | [M] | FC13 §2/§7; wave3 §2 |
| Next determinism: identical counts/bytes/gates across runs; byte-hash cross-run equality pending the manifest-label fix | [M] | FC12 §Reproducibility |
| Comparator determinism: 2,892/2,892 byte-identical per profile; stable manifest SHAs; clock-free | [M] | FC13 §6 |
| Coverage 2,716/2,716 both renderers, both profiles; 0/81 excluded present | [M] | FC12 gate; FC13 §10 |
| Link integrity 0 missing targets (Next 20,929 hrefs @ Wave-2 corpus; comparator 21,608 @ full corpus); images 9,945/9,945 resolve + 1,067 fallbacks; 20 shared site-absolute anchor mismatches are upstream-content artifacts in BOTH renderers | [M] | FC05 §8; FC13 §5 |
| No-JS: 0 script tags / 0 javascript: / 0 handlers / 0 live-fetch constructs in 5,784 comparator files; Next bodies server-rendered but hydration payloads ship per article | [M] | FC13 §3, §2 |
| Search shards + worker are host-agnostic (relative/logical URLs via `buildAssetUrl`, pure scorer, parity + partial-status + drift gates tested) | [M] | FC07 + code; wave3 §2 |
| Atlas Explorer / journey / search UI / knowledge-stage Home are client components at existing Next routes | [M] | code: components/atlas/explorer.tsx ("use client"), app/learn/dp-600/atlas/page.tsx, app/search/page.tsx, app/page.tsx |
| Comparator head inventory: lang, viewport, title, conditional description, alias noindex; NO canonical / og / twitter / sitemap / robots / dark-mode CSS | [M] | generator source (pageShell, alias template); FC13 §12 |
| Comparator CSS: ~150 lines inline, ~7.2 KB/page ≈ 16 MB of the 58.85 MB; no prefers-color-scheme; not pixel-reviewed | [M] | FC13 §2, §12 + generator source |
| Next theme/metadata system: per-article canonical (alternates.canonical = logicalPath), colorScheme light dark, localStorage accent script | [M] | app/learn/fabric/docs/[family]/[...article]/page.tsx; app/layout.tsx |
| atlasReturn: producer in Explorer links (resourceReturnHref); consumers = return-link/peek/journey/unified-bank; NO consumer wired on corpus article routes today; return link is a client component reading location.search | [M] | code grep across app/lib/components |
| Option C non-article remainder ≈ 2,853 files / ~69 MB | [H] | derived: FC12 total − FC05 docs-tree (16,236 f / 708.8 MB scaled ×2,717/2,706) − shared trees; cross-checked against the 806 MB text layer (§3.2) |
| Option C totals ≈ 15,435 files / ~2,308 MB; CF Free PASS ~23% headroom; Pages BLOCKED; build ~50–150 s | [H] | sum of §3.2 components; CF/Pages limits from FC13 §7 / adapters.md |
| Option C costs (two systems, atomic two-artifact release, double decisions layer, seam gates, metadata/theme inconsistency) | [H] | structural; contract text handover 03 §Sync and release is [M] |
| Pure-B whole-site rebuild (lessons/practice/question banks as static HTML) unmeasured | [H] | FC13 §1 scope: comparator emits docs corpus only |
| Pure-B vs gate: comparator meets "complete bodies without JS" but not the "shared navigation, return context and search" clause as measured | [M] scope facts / [H] gap reading | FC13 §7 quote + §12 NOT RUN list; handover 03 gate text |
| B-rebuild engineering estimates (standalone search bundle, standalone Atlas bundle) | [H] | no measurement exists; labeled engineering estimate per task |
| CSP behavior under a real policy | NOT RUN | FC13 §9 |
| Cold-cache deltas; Next peak RSS; comparator incremental rebuild; any deployment | NOT RUN | FC13 §8, §12; FC12 |
| Media-origin arrangement (storage + costs) | owner decision open | adapters.md; wave3 §11 |

---

## 8. PASS/FAIL/NOT RUN — this task's single deliverable

| Deliverable | Status |
|---|---|
| `docs/fabric-corpus/reports/w4b-renderer-assessment.md` (this document: corrected measurement table, Option C hypothesis, seven-criteria evaluation, losses, recommendation framing, [M]/[H] ledger) | **PASS** |
| No other deliverables in this task. No builds, measurements, or deployments were re-run (analysis-only constraint) | NOT RUN by design |

---

## 9. Sources

- `docs/fabric-corpus/reports/fc13-report.md` — comparator measurements, no-JS proof, per-provider verdicts, determinism, CSP note, NOT RUN list
- `docs/fabric-corpus/reports/fc12-report.md` — Next both-profile builds, reproducibility, adapter feasibility
- `docs/fabric-corpus/reports/fc05-report.md` — Next renderer detail: docs-tree byte breakdown (§8), per-page amplification, link/image gates, baseline build
- `docs/fabric-corpus/reports/fc07-report.md` — search shard architecture, parity/merge/partial contracts, worker
- `docs/fabric-corpus/reports/wave3-final-report.md` — §6 renderer table (corrected here), §7 sync/reproducibility, §11 gates
- `D:\BeUI\fabric-integration-handoff\03_INTEGRATION_ARCHITECTURE.md` — renderer gate text, hosting-agnostic release contract, provider limits (verified 2026-11-05)
- `tools/fabric-corpus/packaging/adapters.md` — per-adapter recipes and decision summary
- Code facts: `app/learn/fabric/docs/[family]/[...article]/page.tsx`, `app/search/page.tsx`, `app/page.tsx`, `app/layout.tsx`, `components/fabric/article/**`, `components/atlas/explorer.tsx`, `components/atlas/return-link.tsx`, `lib/atlas/model.ts`, `lib/atlas/fabric-targets.ts`, `lib/search/fabric-shards.ts`, `lib/search/fabric-worker.ts`, `tools/fabric-corpus/bench-comparator/render-static-html.mjs`
