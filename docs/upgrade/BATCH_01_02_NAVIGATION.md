# Batch 01–02 — Navigation, catalogue entry points, task-led home

**Date:** 2026-10-24 · **Scope:** additive IA only. No existing route was moved,
renamed or deleted; no question or lesson content was edited.

---

## 1. Inventory and source coverage

| Inspected | Why |
|---|---|
| `lib/site.ts`, `components/site-header.tsx`, `components/site-footer.tsx` | the eight-peer navigation and its active-state logic |
| `app/page.tsx` | hero, duplicated metric strip, two overlapping learning sections |
| `app/learn/page.tsx`, `app/practice/page.tsx`, `app/lab/page.tsx`, `lib/exams.ts` | what each "Learn / Practice / Labs / Data Lab" label actually opens |
| `lib/data-viz/content.ts`, `lib/data-viz/labs.ts`, `lib/data-viz/practice.ts`, `lib/statistics/content.ts` | canonical counts for the catalogue cards |
| `content/data-viz/curriculum.json`, `content/data-viz/pages.json`, `content/exams/*.json`, `content/fabric/meta.json` | cheap sources for the same counts |
| `app/services/page.tsx`, `lib/services.ts` | whether `#training` / `#analysis` anchors exist (they did not) |
| `app/globals.css` | tokens, focus ring, reduced-motion rules |

Source coverage is the v2 audit's IA sections (§1, §4, §5, §7) plus the repository
files above. No content module was re-imported in this batch.

---

## 2. What changed

| File | Change | Route impact |
|---|---|---|
| `lib/site.ts` | `NAV` reduced from 8 peers to 5 (`Work · Learn · Practice · Services · About`); new `NAV_SECTIONS` family map; `SECONDARY_NAV` (Experience, Contact); footer regrouped into Work / Learn / Practice | header + footer only |
| `components/site-header.tsx` | family-aware `aria-current` (`/learn/chapter/04/` lights Learn, `/lab/dp-600/mock/` lights Practice); mobile menu lists each item with a one-line description plus a secondary group; CTA is "Discuss a project" | header |
| `components/site-footer.tsx` | three role groups, 4-column grid | footer |
| `components/catalogue-card.tsx` *(new)* | single-action card with kind badge, Read/Experiment/Test modes, and a descriptive link label | — |
| `components/breadcrumbs.tsx` *(new)* | one breadcrumb implementation (`nav aria-label`, `<ol>`, `aria-current="page"`) | — |
| `lib/catalogue.ts` *(new)* | typed catalogue entries; counts from `lib/site-metrics.ts` | — |
| `lib/site-metrics.ts` *(new)* | 15 published counts as literals, each with its source in a comment | — |
| `scripts/verify-site-metrics.mjs` *(new)* | recomputes all 15 from content files and fails on drift | — |
| `app/learn/catalogue/page.tsx` *(new)* | learning catalogue: 3 modes, 6 "I want to…" tasks, courses, references, experiments | **+1 route** |
| `app/practice/catalogue/page.tsx` *(new)* | practice catalogue: 3 banks, before-you-start panel, progress/backup entry | **+1 route** |
| `app/page.tsx` | task-led hero (Work / Learn / Practice), three-door gateway, labelled learning routes (Course / Reference / Assessment), work split into "synthetic demonstration" vs "academic & certification", duplicated metric strip removed, service cards linked to real anchors | home only |
| `app/learn/page.tsx`, `components/data-viz/chapter-card.tsx`, `components/dashboard-gallery.tsx` | contrast fixes (see §4) | no |
| `app/services/page.tsx` | real `id` anchors per service (fixes the broken `/services#training` link from `/lab/`) | anchors added, none removed |
| `app/sitemap.ts` | two catalogue URLs added | — |
| `app/globals.css` | contrast + focus-ring token fixes | global |

**New routes:** `/learn/catalogue/`, `/practice/catalogue/`.
**Nothing else moved.** `/learn/`, `/learn/*`, `/explore/*`, `/practice/`, `/lab/*`,
`/learn/statistics/*` keep their exact URLs, anchors and query parameters.

---

## 3. Component and library rationale

- No dependency was added. The catalogues use the existing `Container`, `Eyebrow`,
  `SectionHeading`, `Stat`, `ButtonLink` primitives and plain semantic HTML
  (`nav`, `ol`, `article`, `dl`/`dt`/`dd` inside the card).
- `components/catalogue-card.tsx` exists instead of reusing `CaseStudyCard`
  because a case-study card is one big anchor with a screenshot; a catalogue card
  needs one *descriptively named* action and no nested links. Reusing the
  case-study card would have produced eight links named "Start".
- The collapsed mobile menu reuses the existing `hidden` + `aria-expanded` pattern
  rather than a new dialog primitive: it is a dropdown, and the audit's
  requirement (keyboard open/close, Escape, focus return) is met without a modal.
- `--primary` was darkened rather than adding a second brand token: one value
  fixes every `bg-primary`/`text-primary` pair at once, including the colour presets
  that already pass.

---

## 4. Accessibility fixes found by testing, not assumed

The QA harness (`scripts/qa-browser.mjs`) drives the installed Edge through
`playwright-core` against the built `out/`, at 320 / 390 / 1280 px, in **light and
dark**, with `reducedMotion: "reduce"`, and runs **axe-core** (WCAG 2.0/2.1/2.2 A+AA).

| Finding | Evidence | Fix |
|---|---|---|
| `bg-primary` + white text was **3.68:1** (`#0285f7`) | axe `color-contrast`, every page with a primary button | `--primary: #0b62b5` (6.1:1 with white); `text-primary` on light surfaces now also passes |
| Focus ring was `oklch(15% 0 0 / 0.12)` — effectively invisible | manual read of `--ring` | `--ring: var(--primary)` (2.4.7 / 1.4.11) |
| Dark mode `--muted-foreground` measured **4.48:1** / **4.45:1** on tinted cards | axe dark pass, 6 nodes | `oklch(66% 0 0)` (≈4.9:1) |
| Logo badge used `text-white` on the mixed primary | axe dark pass | `text-primary-foreground` |
| `<dl>` wrapped `Stat` cards (no `dt`/`dd` children) | axe `definition-list` on `/`, both catalogues, `/learn/` | plain grouped `div`s |
| `text-muted-foreground/70` at 9 px, `text-foreground/50` at 10 px | axe on `/learn/`, `/work/hse-analytics/` | full-strength muted colour, 10 px minimum |

These were **pre-existing** on routes this batch did not redesign (`/learn/`,
`/work/hse-analytics/`, `/login`-free site-wide tokens); they are fixed here because
the audit classes Phase 4 accessibility as a release blocker.

---

## 5. Verification

| Check | Result | Evidence |
|---|---|---|
| `npx tsc --noEmit` | PASS | no output |
| `npm run lint` | PASS | eslint clean |
| `npm run build` (static export) | PASS | 118 prerendered pages, exit 0 |
| Route/anchor regression vs frozen baseline | PASS | 115 routes; **0 missing**, 0 lost anchors; 2 added |
| Content parity (question IDs + answer-key digests) | PASS | `inventory-content.mjs --compare` |
| Published counts | PASS | `verify-site-metrics.mjs`: 15/15 match content |
| axe-core, light, 19 routes × 3 viewports | PASS | 0 violations, 0 overflow, 0 console errors, 0 failed requests |
| axe-core, dark, same 57 page loads | PASS | 0 violations |
| Mobile menu at 320 px | PASS | opens (`aria-expanded=true`), Escape closes, focus returns to trigger, closed menu `hidden` |
| One `<h1>` per page, `lang`, image alt, empty links | PASS | recorded per page in `docs/upgrade/qa/report.json` |
| List-item nav labels | PASS | `Primary`, `Mobile`, `Work`, `Learn`, `Practice` (footer groups) |
| Real screen-reader pass (NVDA/VoiceOver) | NOT RUN | no such runtime in this environment |
| 200%/400% zoom, touch-only | NOT RUN | viewport and reduced-motion only |
| Deploy | NOT RUN | out of scope |

Task findability against the v2 acceptance target (≤3 purposeful selections):
`Home → Work → HSE case` (2), `Home → Learn → Start course → foundations` (3),
`Home → Practice → Fabric hub → Start studying` (3),
`Home → Learn → Statistics → p-value lab` (3).

---

## 6. Risks, rollback and next

**Risks**
- `/learn/catalogue/` and `/practice/catalogue/` are *temporary* landings by design
  (v2 Phase 1). When the final IA lands, `/learn/` becomes the catalogue and the
  course moves to `/learn/data-visualization/`; that migration needs redirects the
  static host cannot guarantee yet, so it stays last (Phase 5).
- The darker `--primary` changes the site's visual accent. It is the same hue,
  ~6% darker; light/dark tokens were re-verified by axe but not by a designer.
- The homepage no longer links directly to `/lab/sql`, `/lab/power-bi`,
  `/lab/statistics`. They remain reachable in one more step via `/lab`, and the
  routes are untouched.

**Rollback:** revert the files in §2; delete the two new route folders and the
three new modules (`lib/catalogue.ts`, `lib/site-metrics.ts`,
`components/catalogue-card.tsx`, `components/breadcrumbs.tsx`). No data, storage
key or question record was modified, so rollback cannot lose saved progress.

**Next atomic task:** Batch 03 — build-time search index plus `/search/` with
type/topic/language filters, deep links and a lazy question-metadata shard.
