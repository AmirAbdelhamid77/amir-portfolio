# Batch 03 — Federated client-side search

**Date:** 2026-10-24 · **Scope:** a new `/search/` route plus the plumbing it needs.
No existing route, anchor or stored value changed.

---

## 1. Why this shape

The audit (F05) found three local search boxes and no site-wide entry. The options
considered:

| Option | Verdict |
|---|---|
| Hosted search service (Algolia etc.) | Rejected: new paid/external service, student queries leave the browser, violates the free/static boundary |
| Crawl the built HTML at runtime | Rejected: needs a network fetch per query and duplicates content |
| **Build-time typed index + browser-side matching** | **Chosen**: no backend, no third-party call, one source of truth (the content modules), deterministic |
| Combobox/dialog palette only | Rejected as the sole entry: `Ctrl+K` is an enhancement, not the only way in; the page has a visible labelled field |

---

## 2. What changed

| File | Change |
|---|---|
| `lib/search/query.ts` *(new)* | `SearchDocument` type, Arabic/ASCII normalisation, scoring, filtering. Pure — no React, no `@/` imports, so `node --test` can run it directly |
| `lib/search/documents.ts` *(new)* | builds the index from case studies, services, chapters, lessons, statistics journeys/sections/labs/formulas/glossary, chart labs, tools, analyst questions and visualization scenarios |
| `app/search/page.tsx` *(new route)* | server page: builds the index, prints per-kind counts, explains what is and is not indexed |
| `components/search/search-client.tsx` *(new)* | labelled field, type chips (`aria-pressed`), language filter, result list of plain links, live result count, empty state, "show more", URL sync, lazy Fabric shard |
| `components/site-header.tsx` | search icon link (`aria-label="Search the site"`) |
| `lib/site.ts` | footer link "Search the site" |
| `app/sitemap.ts` | `/search/` added |
| `components/data-viz/practice-bank.tsx` | each scenario now has a real `id` anchor, so search can deep-link to it |
| `tests/content/search.test.mjs` *(new)* | 7 tests: normalisation, benchmark queries, narrowing, ranking, filters, empty query, determinism |
| `scripts/qa-search.mjs` *(new)* | browser interaction test for the route |

**New route:** `/search/`.

---

## 3. Index contents (measured, not estimated)

| Kind | Documents | Source |
|---|---|---|
| Course | 12 | 10 chapters + 2 journeys |
| Lesson | 27 | 16 English + 11 Arabic |
| Section | 43 | statistics reference sections |
| Lab | 22 | 15 statistics labs + 6 chart labs + lab index |
| Tool | 21 | chart picker, integrity, dashboards, specialty, formula workbench, glossary, atlas, decision navigator, catalogues, contact, search, services |
| Question | 73 | 6 analyst sets + 60 analyst questions + 12 scenarios (**stems only**) |
| Case study | 3 | HSE, IBM capstone, ADAS |
| Formula / glossary | 99 | from the statistics index builder |
| **Static total** | **297** | rendered on the page |
| Fabric shard | **834** | loaded only when the visitor ticks "Include 834 Fabric questions" |

No answer key, rationale or saved-session value is in any index. A Fabric question
result links to `/lab/dp-600/explore/?question=<id>`, which is the existing
explorer deep link; the explanation stays behind the answer flow.

---

## 4. Verification

| Check | Result | Evidence |
|---|---|---|
| `tsc --noEmit` | PASS | no output |
| `npm run lint` | PASS | 0 errors, 0 warnings |
| `npm run build` | PASS | 119 pages, `/search` prerendered |
| Route regression | PASS | 116 routes, 0 missing, 0 lost anchors, +3 added |
| Content parity | PASS | question IDs + answer-key digests unchanged |
| Published counts | PASS | 15/15 |
| Unit tests | PASS | data-viz 36, statistics 18, fabric 29, content 11 |
| Browser interaction (`qa-search.mjs`) | PASS | 11/11 checks — see below |
| axe light + dark, 20 routes × 3 viewports | PASS | 0 violations, 0 overflow, 0 console errors |
| Screen reader / 200% zoom | NOT RUN | not available here |

Interaction evidence (`node scripts/qa-search.mjs`):

```
PASS search page renders a result count — 297 results
PASS typing filters the list — 84 results for “p-value” first=/learn/statistics/formulas/#p-value
PASS the p-value query reaches a statistics destination
PASS the URL is shareable — /search/?q=p-value
PASS the kind filter narrows to labs — 3 link(s)
PASS clear resets the query — 297 results
PASS the Fabric shard loads without a page error
PASS a Fabric query deep-links into the explorer — /lab/dp-600/explore/?question=fb-v7-ddm-019
PASS the empty state offers a way out
PASS an Arabic query reaches the Arabic lane — /learn/ar/histogram/
PASS no console errors during the run
```

The five benchmark queries from the v2 acceptance criteria (`p-value`, `Direct Lake`,
`DAX`, `box plot`, `المدرج التكراري`) are asserted in the unit test against a
corpus shaped like the index, and exercised against the real index in the browser.

---

## 5. Limits and risks

- Ranking is a transparent field-weight heuristic, not a relevance model. It is
  deterministic and testable; it is not tuned against click data (there is none).
- The Fabric shard is 540 KB of JSON loaded on demand. It is excluded from every
  other route and only fetched when a visitor asks for it; the toggle says so.
- Arabic folding is orthographic only (diacritics, tatweel, alef/ya/ta-marbuta).
  It does not stem or lemmatise, so a query using a different root form may miss.
- Question documents use the stem as their title. That makes the question findable
  but also means a determined crawler could read stems; answer keys are never in
  the payload.
- Search does not index `README_AR.md` or agent documentation, by design.

**Rollback:** delete `app/search/`, `lib/search/`, `components/search/`,
`scripts/qa-search.mjs`, `tests/content/search.test.mjs`; revert the three small
edits (header icon, footer link, sitemap entry, practice-bank `id`).

**Next atomic task:** Batch 04 — DP-600 mode grouping into Study / Assess /
Improve / Trust, an honest empty-topic state, and a statistics journey outline with
an anchor index.
