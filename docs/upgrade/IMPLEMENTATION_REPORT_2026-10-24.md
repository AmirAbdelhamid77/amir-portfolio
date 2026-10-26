# Hansa v2 upgrade — implementation report (2026-10-24)

**Repository:** `D:\BeUI\amir-portfolio` (branch `main`, baseline commit `18ef2e0`)
**Scope:** Phase 0 correctness gates, Phase 1 navigation/entry points, Phase 2
federated discovery, selected Phase 3 shells, Phase 4 accessibility remediation.
**Not done:** deployment, route canonicalization (Phase 5), optional infrastructure
(Phase 6). **No production change. No secrets, services or data left the machine.**

---

## 1. Mission and baseline

Task: implement the v2 reorganization rather than describe it, preserving all
content, question IDs, answer keys, anchors, query parameters and saved progress.

Authority used, in order: the owner request; `AGENTS.md` (workspace + repo);
`docs/agent-reference/START_HERE.md`; the v2 audit; the adaptive visualization
policy; the preserved master reference; the page-brief template and router v1.1.

Baseline captured **before** any edit and frozen under
`docs/upgrade/baseline-2026-10-24/`:

| Artifact | Value |
|---|---|
| Routes | 113 (112 pages + `404`) |
| Navigation | 8 top-level peers in `lib/site.ts` |
| Exams | 6 banks / 60 questions (`amir-lab-v1`) |
| Fabric | 18 packs / 834 questions / 227 source refs / 76 cases (`amir-fabric-v1`) |
| Data-viz course | 10 chapters · 25 source pages · 27 lessons (16 en + 11 ar) |
| Statistics | 43 sections · 9 journeys · 15 labs |
| Anchors | every heading and `<section id="sN">` in the export |
| Query params | explorer (`q/search, pack, subject, objective, scope, type, status, difficulty, question`), sessions (`session`), contact (`service`) |
| Tests | data-viz 36 · statistics 18 · fabric 28 — all passing |
| Build | static export, 112 pages, exit 0 |
| Reference verifier | PASS |

---

## 2. Phase 0 — correctness gates (details in `BATCH_00_PHASE0_BASELINE.md`)

**F02 HSE rates — resolved as a denominator-label error, not bad data.**
The shipped dashboard exposes two hour bases (200,000 OSHA / 1,000,000 regional).
TRIR 0.19 per 200,000 h is **0.95 per 1,000,000 h**, which is larger than
LTIFR 0.28 per 1,000,000 h — so lost-time cases sit inside recordables, as they must.
The page now states each base, the conversion and both formulas, and discloses that
no fact-level dataset ships. A second defect found during verification (copy said
863 days since LTI; the artifact reads **885** at 16 Dec 2025) is corrected.
Test: `tests/content/case-studies.test.mjs` recomputes the common-base comparison.

**F01 Fabric counts — resolved structurally.**
Two published numbers described the same 480 focused questions because 50 of 834
entries had a topic-derived sub-objective in a *different domain* from the one the
source declared (`"Prepare data"` + security subject → `1.1`). Domain shares read
297/170/13; sub-objective sums read 347/125/8. A derived sub-objective may now only
refine a declared domain from inside it; otherwise the question stays at domain level
and carries `objectiveBasis: "domain-only"`. Domain shares are computed **from the
objective rows the page already renders**, so the two views cannot diverge.
After: 297 = 297+0 · 170 = 125+45 · 13 = 8+5; totals unchanged (480/251/90/13).
Only `content/fabric/index.json` and `meta.json` changed; all 834 question records,
packs, sources, cases, notes and the id map are byte-identical.

F14 (`V-ACUUM` placeholder) was confirmed and corrected. F03/F04/F05/F07/F08 were
re-confirmed by inspection and addressed in Phases 1–3. F06 is *partly* addressed
(the journey shell already had an anchor index, progress and continue-nav; inline
exhibit weight remains). F12 was re-qualified: namespaces are separate by design and
the Fabric clock is already persisted.

---

## 3. What was implemented

### Phase 1 — navigation and entry points
- Five primary destinations (**Work · Learn · Practice · Services · About**) plus a
  Search icon and a “Discuss a project” CTA. `NAV_SECTIONS` makes a nav item own a
  *family* (`/learn/chapter/04/`, `/lab/dp-600/mock/`), not just a prefix.
- New `/learn/catalogue/` and `/practice/catalogue/` landings: Read/Experiment/Test
  modes, prerequisites, level, length, language, linked practice, one descriptively
  labelled action per card.
- Homepage rebuilt as a task-led gateway: Work / Learn / Practice doors, labelled
  learning routes (Course / Reference / Assessment), work split into “synthetic
  demonstration” vs “academic & certification”, duplicated metric strip removed.
- Real `#bi-dashboards`, `#analysis`, `#training` anchors on `/services/` (the old
  `/services#training` link from `/lab/` was dead).
- Existing routes, anchors and query parameters: **untouched**.

### Phase 2 — federated discovery
- `/search/`: 297 build-time documents (courses, lessons, sections, labs, tools,
  questions, case studies, formulas, glossary) + an **on-demand 834-question Fabric
  shard**. Type chips, language filter, result count, empty state, “show more”,
  shareable `?q=&kind=&lang=`, `Ctrl/⌘K` as an enhancement only.
- Orthographic normalisation folds Arabic diacritics/tatweel, alef/ya/ta-marbuta,
  case and punctuation. Answer keys are never indexed.
- `/sitemap.xml` gained the three new routes; `robots.txt` unchanged.

### Phase 3 — shells (selected)
- DP-600 modes grouped Study / Assess / Improve / Trust, with progress and sources as
  first-class modes; duplicate quick-card grid removed.
- Zero-question topics are no longer links: they state “no questions yet” and point at
  the closest covered ground.
- Coverage panel states the counting rule, the named/domain-only split per domain and
  the basis partition (declared/derived/domain-only/none) read from `META`.

### Phase 4 — accessibility and mobile
Measured, not assumed (axe-core + Edge via `playwright-core`, 20 routes × 3 viewports
× 2 themes):

| Finding | Before | After |
|---|---|---|
| Primary button/chip contrast | 3.68:1 | 6.1:1 (`--primary` #0285f7 → #0b62b5) |
| Focus ring | `oklch(15% 0 0 / .12)` — invisible | `var(--primary)` |
| Dark muted text on tinted cards | 4.45–4.48:1 | ≈4.9:1 (`oklch(66% 0 0)`) |
| Logo badge in dark mode | white on mid-blue | token foreground |
| `<dl>` misuse (`Stat` children) | 4 pages | grouped `div`s |
| 9–10 px reduced-opacity meta text | `/learn/`, `/work/hse-analytics/` | full-strength muted, 10 px min |
| Mobile menu mechanics | unverified | open/Escape/focus-return verified at 320 px |

Final: **0 axe violations** (WCAG 2.0/2.1/2.2 A+AA), 0 horizontal overflow, 0 console
errors, 0 failed requests, in both themes.

### Educational visual
`#rate-basis` on `/work/hse-analytics/`: a calculator + exact-value table that shows
the same counts under both hour bases, with a validity check (`LTIFR ≤ TRIR` on a
common base), reset, and text errors. No dependency added. Spec + rubric in
`VISUALIZATION_SPEC_hse_rate_basis.md`; brief in `CONTENT_BRIEF_hse-analytics.yaml`;
9 domain tests and 7 browser interaction checks.

---

## 4. Affected files and routes

**New routes (3):** `/learn/catalogue/`, `/practice/catalogue/`, `/search/`
**New anchors:** `/services/#bi-dashboards|#analysis|#training`,
`/practice/#<question-id>` (12), `/work/hse-analytics/#rate-basis`
**Removed routes:** none. **Renamed routes:** none.

New modules: `lib/site-metrics.ts`, `lib/catalogue.ts`, `lib/search/{query,documents}.ts`,
`lib/hse/rates.ts`, `components/{catalogue-card,breadcrumbs}.tsx`,
`components/search/search-client.tsx`, `components/hse/rate-basis-explainer.tsx`.
New tooling: `scripts/{inventory-routes,inventory-content,compare-inventory,verify-site-metrics,qa-browser,qa-search,qa-hse-explainer}.mjs`.
New tests: `tests/content/{case-studies,search,hse-rates}.test.mjs`.
Edited: `app/{page,learn/page,globals,sitemap,services/page,work/[slug]/page,lab/dp-600/page}.tsx`,
`lib/{site,case-studies}.ts`, `lib/fabric/{classify,types}.ts`,
`components/{site-header,site-footer,dashboard-gallery,data-viz/chapter-card,data-viz/practice-bank,fabric/explorer}.tsx`,
`scripts/import-fabric-bank.mjs`, `tests/fabric/bank.test.mjs`, `package.json`,
`content/fabric/{index,meta}.json`.

---

## 5. Dependencies, services and cost

| Item | Change |
|---|---|
| Runtime dependencies | **none added** (no Recharts/ECharts/Plot/Visx/Mafs) |
| Dev dependencies | **none added** (playwright-core, axe-core, node-html-parser already present) |
| External services | **none** — no analytics, no search service, no font/CDN at runtime |
| Hosting model | unchanged: static export → Workers Static Assets, assets-only |
| Cost | **£0 / $0 recurring**; no paid component or API |

---

## 6. Evidence

| Check | Result | Command / artifact |
|---|---|---|
| Reference integrity | PASS | `node scripts/verify-agent-reference.mjs` |
| TypeScript | PASS | `npx tsc --noEmit` |
| Lint | PASS | `npm run lint` (0 errors, 0 warnings) |
| Unit tests | PASS 103 | `npm run test:all` → 36 + 18 + 29 + 20 |
| Static export | PASS | `npm run build` → 119 prerendered pages |
| Route/anchor regression | PASS | `compare-inventory.mjs` vs frozen baseline: 0 missing, 0 lost anchors, 3 added |
| Content parity | PASS | `inventory-content.mjs --compare` (IDs + answer-key digests) |
| Published counts | PASS 15/15 | `verify-site-metrics.mjs` |
| axe light | PASS | `qa-browser.mjs` — 60 page loads, 0 violations |
| axe dark | PASS | `qa-browser.mjs --dark` — 60 page loads, 0 violations |
| Search interaction | PASS 11/11 | `qa-search.mjs` |
| HSE explainer interaction | PASS 7/7 | `qa-hse-explainer.mjs` |
| Mobile menu (320 px) | PASS | open, Escape, focus return, hidden panel |
| **Screen reader (NVDA/VoiceOver)** | **NOT RUN** | not available here |
| **200% / 400% zoom** | **NOT RUN** | viewport + reduced-motion only |
| **Touch-only device** | **NOT RUN** | emulated mobile viewport only |
| **Full content audit / WCAG certification** | **NOT CLAIMED** | sampled routes only |
| Deployment | NOT RUN | out of scope |

Visual/domain QA performed: screenshot review of home, catalogues, search, DP-600 hub
and the explainer at 320/390/1280; HSE dashboard artifact read at 1200 px to verify
the base selector and the 885-day value; no pixel-diff baseline exists, so “looks
right” means “inspected against the content and the audit”, not “diffed”.

---

## 7. Risks and caveats

1. **Route canonicalization is untouched (Phase 5).** `/learn/` is still the
   visualization course and `/practice/` still the 12 scenarios. The catalogues are
   additive landings by design (`v2` Phase 1 allows temporary `/learn/catalogue/`),
   because the static host cannot guarantee redirects. Moving those trees remains the
   highest-risk item and needs a redirect plan first.
2. **Darker `--primary` changes the visual accent.** Same hue, ~6% darker; verified by
   contrast measurement, not by a designer.
3. **Search is heuristic.** Deterministic field weighting; no stemming beyond Arabic
   orthographic folding; no click data to tune against.
4. **`lib/site-metrics.ts` holds literal counts** to keep payloads small; they are
   guarded by a script that must be run after content changes (it is in the batch
   gate, not in `test:all`).
5. **Fabric coverage cannot reach Microsoft’s blueprint weights** without inventing
   questions; the hub now states the gap precisely instead of implying balance.
6. **No owner confirmation** yet that the 16 Dec 2025 KPI snapshot is the intended
   public set.

---

## 8. Rollback

Everything is additive except three token values, the nav arrays, the homepage body,
the case-study copy and the DP-600 hub layout. To roll back:
`git checkout -- app/page.tsx app/globals.css app/sitemap.ts app/services/page.tsx
app/work/[slug]/page.tsx app/lab/dp-600/page.tsx lib/site.ts lib/case-studies.ts
components/site-header.tsx components/site-footer.tsx`, then delete `app/search/`,
`app/learn/catalogue/`, `app/practice/catalogue/`, `lib/{search,catalogue,site-metrics,hse}/`,
`components/{search,catalogue-card,breadcrumbs,hse}/`, the new scripts/tests and
`docs/upgrade/`. Restore `content/fabric/` from the pre-import copy at
`%TEMP%\fabric-content-before` if the classification change must be undone. No
localStorage key was renamed, migrated or deleted, so saved progress survives any of
the above.

---

## 9. Next atomic tasks (in order)

1. **Statistics exhibit weight (F06):** static preview + “Launch full lab” per
   embedded visual; needs a spec and a before/after payload measurement.
2. **Route canonicalization plan (Phase 5):** prove a redirect/alias mechanism on the
   static host, then move `/explore/` → `/learn/data-visualization/labs/` behind
   tested aliases; only then consider `/learn/` ⇄ catalogue swap.
3. **Screen-reader and zoom pass (Phase 4 remainder):** NVDA + Firefox on Home, the
   mobile menu, the DP-600 mock flow, a statistics journey and the new explainer.
4. **Owner fact review:** confirm the 2025/2026 timeline claims, the KPI snapshot and
   the CV/public-evidence items before any of them are published (V01/V02/V11).
