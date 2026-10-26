# Batch 04 — Practice shell grouping, empty-topic honesty, educational visual

**Date:** 2026-10-24 · **Scope:** DP-600 hub structure (F07, F08), the coverage
reconciliation UI, and one substantial teaching visual on the HSE case study.
No question, answer key or saved-session schema was touched.

---

## 1. Inventory and source coverage

| Inspected | Why |
|---|---|
| `app/lab/dp-600/page.tsx` | nine equal-weight modes; topic grid with a zero-count card |
| `components/fabric/ui.tsx`, `components/fabric/hub-panels.tsx` | `ModeCard`, `Panel`, status panel |
| `lib/fabric/taxonomy.ts`, `lib/fabric/data.ts`, `content/fabric/meta.json` | subject/objective labels and the reconciled coverage |
| `components/fabric/explorer.tsx` | the `?subject=` deep link that the empty card pointed at |
| `app/work/[slug]/page.tsx`, `components/dashboard-gallery.tsx`, `public/images/hse/*` | where a KPI explainer belongs; what the artifact actually shows |
| `lib/case-studies.ts` | the published metric notes |
| `docs/agent-reference/HANSA_ADAPTIVE_VISUALIZATION_AGENT_POLICY.md` | spec + rubric + interaction contract |

---

## 2. What changed

| File | Change | Route impact |
|---|---|---|
| `app/lab/dp-600/page.tsx` | modes grouped into **Study / Assess / Improve / Trust the material** with one line of purpose each; `Progress & backup` and `Sources & coverage` are now first-class modes; the duplicate four-card grid at the foot of the page is gone; the coverage panel states the counting rule and the named/domain-only split; subject cards with **0 questions** are no longer links | `/lab/dp-600/` only |
| `components/fabric/explorer.tsx` | placeholder `V-ACUUM` → `VACUUM` (F14: the old token also normalised to `v acuum`, so it could never match) | explorer |
| `lib/hse/rates.ts` *(new)* | pure rate model: TRIR/LTIFR per base, conversion, validation, illustrative counts, formatting | — |
| `components/hse/rate-basis-explainer.tsx` *(new)* | client calculator + exact-value table + interpretation + reset + text errors | embedded on `/work/hse-analytics/` |
| `app/work/[slug]/page.tsx` | renders the explainer inside the “Safety performance” section for the HSE case only | `/work/hse-analytics/` gains the `#rate-basis` anchor |
| `tests/content/hse-rates.test.mjs` *(new)* | 9 domain tests | — |
| `scripts/qa-hse-explainer.mjs` *(new)* | 7 interaction checks + element screenshot | — |
| `package.json` | `qa:*`, `verify:metrics`, `inventory:*` scripts | — |

---

## 3. Component / library rationale

- **Grouping, not a new shell.** The hub already had `ModeCard` and `Panel`; the
  fix was information architecture, so no component was added. Grouping is rendered
  as `<section aria-labelledby>` per group, so screen-reader users get the same
  four-way structure a sighted reader gets.
- **Empty topic** renders a non-interactive `<div>` with a dashed border, the text
  “no questions yet”, and one link to the closest covered subject. It is no longer a
  link that produces an empty result set with no way out.
- **The visual adds no dependency.** Chosen over a chart on correctness grounds (see
  `VISUALIZATION_SPEC_hse_rate_basis.md`): a bar chart of the two rates would put two
  different denominators in one visual comparison, which is the misconception being
  taught. The weighted rubric scored calculator + table **86**, static-only **76**,
  bar chart **52**.

---

## 4. Verification

| Check | Result | Evidence |
|---|---|---|
| `tsc --noEmit` | PASS | no output |
| `npm run lint` | PASS | 0 errors, 0 warnings |
| `npm run build` | PASS | 119 pages |
| Route/anchor regression | PASS | 116 routes, 0 missing, 0 lost; 3 routes gained anchors (`/services/` ids, `/practice/` question ids, `#rate-basis`) |
| Content parity | PASS | question IDs + answer-key digests unchanged |
| Unit tests | PASS | content 20 (9 new HSE + 7 search + 4 case studies), data-viz 36, statistics 18, fabric 29 |
| axe light, 20 routes × 3 viewports | PASS | 0 violations, 0 overflow, 0 console errors |
| axe dark, same matrix | PASS | 0 violations |
| Explainer interaction | PASS | 7/7 (`docs/upgrade/qa/hse-rate-basis-1280.png`) |
| Search interaction | PASS | 11/11 |
| Real screen reader, 200% zoom, touch-only | NOT RUN | not available in this environment |

Domain QA found and fixed one real inconsistency during the build of this batch:
the explainer’s first test run indexed the wrong table column and “failed”, which
turned out to be the *test* reading the 1,000,000-hour column. The component was
correct; the check now selects by column position and asserts both bases.

---

## 5. What is still weak (honest gaps)

- **F06 (long statistics journeys) is only partly addressed.** The journey shell
  already has a sticky anchor index, reading progress and previous/next navigation;
  the remaining issue is that heavy interactive exhibits are still embedded inline
  in very long pages. Progressive disclosure of those exhibits is *not* implemented
  — deliberately, because it changes the teaching flow and needs its own spec.
- **The DP-600 coverage gap cannot be fixed with navigation.** 13 of 480 focused
  questions cover semantic models (2.7% vs an official 25–30%). The page now says
  so precisely (8 named + 5 domain-only) instead of implying balance.
- **No fact-level HSE data exists in the repository.** The explainer teaches the
  arithmetic with clearly labelled illustrative counts; it does not recompute the
  dashboard from records, and says so on the page.

---

## 6. Rollback

Revert `app/lab/dp-600/page.tsx`, `components/fabric/explorer.tsx`,
`app/work/[slug]/page.tsx`; delete `lib/hse/`, `components/hse/`,
`tests/content/hse-rates.test.mjs`, `scripts/qa-hse-explainer.mjs`, and the three
docs in this folder that describe them. No stored data or question record depends on
any of it, so rollback is lossless.

**Next atomic task:** progressive disclosure for statistics exhibits (a static
preview plus “Launch full lab” per embedded visual), with a spec and a measured
payload comparison against the current inline rendering.
