# Batch 00 — Phase 0 baseline and correctness gates

**Date:** 2026-10-24 · **Repository:** `amir-portfolio` (branch `main`, HEAD `18ef2e0`)
**Scope:** verification only, plus the two P0 content-integrity corrections the audit asked for.
**No deployment. No route was moved. No question content was edited.**

Reference integrity: `node scripts/verify-agent-reference.mjs` → **PASS**
(13 active hashes, entry paths, router v1.1, rubric weights, 6 intake hashes).

---

## 1. Frozen baseline (machine-readable)

| Artifact | Command | Result |
|---|---|---|
| Route/anchor inventory | `node scripts/inventory-routes.mjs docs/upgrade/baseline-2026-10-24/route-inventory.json` | 113 routes |
| Content/question inventory | `node scripts/inventory-content.mjs docs/upgrade/baseline-2026-10-24/content-inventory.json` | 6 banks, 60 + 834 questions, 227 sources, 43 sections |
| Route regression check | `node scripts/compare-inventory.mjs <baseline> <current>` | PASS (self-compare) |
| Content parity check | `node scripts/inventory-content.mjs --compare <baseline>` | PASS (self-compare) |
| Static export | `npm run build` | PASS, exit 0, 112 prerendered pages |
| Tests | `npm run test:all` | PASS: 36 data-viz + 18 statistics + 28 fabric = 82 |

Route inventory records, per route: title, H1, metadata presence, canonical, every
section/heading anchor, heading count and text, internal links and a content hash.
`compare-inventory.mjs` fails the build-level check if a baseline route or anchor
disappears. This is the "zero broken public deep links" evidence for later batches.

### Route families at baseline (`out/`)

| Prefix | Routes | Notes |
|---|---|---|
| `/` | 1 | portfolio home |
| `/work` | 4 | index + 3 case studies |
| `/experience`, `/about`, `/services`, `/contact` | 4 | professional pages |
| `/lab` | 16 | `/lab/`, 6 topic exams via `/lab/[slug]/`, `/lab/dp-600/` + 8 modes |
| `/learn` | 72 | visualization course (10 chapters, 25 pages, 11 Arabic), statistics hub (9 journeys, 15 labs, 6 reference pages) |
| `/explore` | 12 | chart labs (6), choose, integrity, dashboards, specialty |
| `/practice` | 1 | 12 visualization scenarios |
| `/404`, `/_not-found` | 3 | framework routes |

### Navigation and entry points at baseline

`lib/site.ts` → `NAV` has **eight peers**: Work, Experience, Services, Data Lab,
Learn, Statistics, Labs, About. `/learn/` is the visualization course (not a
catalogue); `/learn/statistics` is presented at top level; `/explore/` is labelled
"Labs"; `/lab/` is labelled "Data Lab"; `/practice/` is visualization-only.
This is finding F03/F04, **re-verified as still true**.

### Query parameters and deep-link contract

| Route(s) | Parameters | Behaviour |
|---|---|---|
| `/lab/dp-600/explore/` | `q`, `search` (alias), `pack`, `subject`, `objective`, `scope`, `type`, `status`, `difficulty`, `question` | read once from `window.location.search`, then mirrored with `history.replaceState` |
| `/lab/dp-600/{study,practice,mock,cases,review}/` | `session` | resumes a stored session id |
| `/contact/` | `service` | preselects a service in the message composer |
| statistics journeys | fragment `#s19`, `#s19-title`, `#s19-19-1` | section and heading anchors, linked from atlas, cheatsheet, glossary, decision tool, tool navigator, exhibits |
| `/services` | `#training` | anchor from `/lab/` |

No route uses a server-side query handler; all reads happen post-hydration.

### Browser persistence (recorded, not modified)

| Key | Shape | Written by |
|---|---|---|
| `amir-lab-v1` | `{ [examSlug]: { best, attempts, lastAt } }` | `lib/lab-storage.ts` |
| `amir-fabric-v1` | `{ version: 1, updatedAt, bookmarks[], flags[], questions{…}, sessions{…}, history[], settings }` | `lib/fabric/storage.ts` |
| `amir-fabric-v1-v{n}` / `-unreadable-{ts}` / `-cleared-{ts}` | defensive copies before a migration/reset | `lib/fabric/storage.ts` |
| `amir-theme`, `amir-accent` | UI preferences | `components/theme-controls.tsx`, pre-hydration script in `app/layout.tsx` |

Fabric session record: `id, mode, status, createdAt, updatedAt, manifest, answers,
flags, revealed, index, deadlineAt, remainingSeconds, elapsedSeconds, result`.
The timed clock is **persisted** (`deadlineAt` in epoch ms), not an in-memory
`setInterval` counter, so a refresh does not reset a mock. Caps: 3 active
sessions, 30 completed sessions, 60 history rows.

### Question IDs and answer keys

| Bank | IDs | Answer keys |
|---|---|---|
| `content/exams/*.json` (6) | 60, namespaced per topic (`sql-…`) | `answer` (+`tolerance`), no collision with Fabric ids |
| `content/fabric/questions/*.json` (18 packs) | 834, `fb-<slug>` | `correct` option ids, option-level rationale per option |

The content inventory stores only a digest of each answer key, so the artifact is
committable while still detecting any changed correct answer. Source references:
227 registry entries in `content/fabric/sources.json`, all cited by at least one
question and all `https:`.

---

## 2. Finding F02 — HSE TRIR/LTIFR (P0) · resolved

**Verified against the shipped artifact, not the audit text.** The executive
overview screenshot (`public/images/hse/executive-overview-1200.webp`) shows
LTIFR 0.28, TRIR 0.19, days since LTI **885**, and a filter control offering
**1,000,000 hours (Regional)** and **200,000 hours (OSHA Standard)**.

| Question | Evidence | Conclusion |
|---|---|---|
| Are the two rates on the same base? | Copy said "per 1M hours" for both; the dashboard exposes two bases | No — TRIR is quoted on the OSHA **200,000**-hour base, LTIFR on the **1,000,000**-hour base |
| Is LTIFR > TRIR therefore impossible? | 0.19/200k h = **0.95**/1M h ≥ 0.28/1M h | Consistent once bases are aligned; lost-time cases are a subset of recordables |
| Can the rates be recomputed from fact data? | No HSE fact table ships in the repo (only rendered screenshots) | Documented as "snapshot the dashboard renders", not recomputed observations |
| Second discrepancy found during verification | Copy said **863** days since LTI; the shipped dashboard reads **885** at 16 Dec 2025 | Copy was stale; corrected to the artifact value and date |

**Change:** `lib/case-studies.ts` — metric notes now state each base (TRIR 0.19
per 200,000 h = 0.95 per 1M; LTIFR 0.28 per 1M), the day count is 885 with the
snapshot date, the safety section states both formulas and the base switch, and
`limitations` discloses that no fact-level dataset ships with the page.

**New test:** `tests/content/case-studies.test.mjs` converts both rates to a
common denominator and asserts recordables ≥ lost-time, and asserts the note
quotes the converted figure — so the impossible relationship cannot come back.

---

## 3. Finding F01 — Fabric count aggregation (P0) · resolved

**Reproduced exactly.** Two published numbers described the same 480 focused
questions:

| View | Before | Source of the number |
|---|---|---|
| Domain shares | 297 / 170 / 13 (61.9 / 35.4 / 2.7 %) | `entry.domain` |
| Sub-objective buckets | 347 / 125 / 8 | `entry.objectiveId` |

**Root cause (measured, not inferred):** 50 of 834 index entries had
`objectiveId` in one domain and `domain` in another. `classify()` accepted a
topic-derived sub-objective even when the source declared a different domain:

```
video06 pack, exam_objective = "Prepare data" (domain 2)
subject rule → security → SUBJECT_OBJECTIVE.security = "1.1" (domain 1)
→ objectiveId "1.1", domain "2"
```

45 entries were `1.1|2`, 5 were `1.1|3`. `buildCoverage()` then aggregated domain
shares from `entry.domain` and buckets from `entry.objectiveId`, so both sums
were arithmetically right and mutually inconsistent. No multi-mapping exists:
every question has exactly one scope, one subject, one objective bucket.

**Fix (structural, not cosmetic):** a topic-derived sub-objective may only
refine a declared domain *inside* that domain. When it cannot, the question is
kept at domain level and labelled `objectiveBasis: "domain-only"` instead of
being re-labelled into another domain. `buildCoverage()` now derives domain
shares **from the objective rows it already renders**, so the two views cannot
diverge again. `objectiveBasis` (`declared` / `derived` / `domain-only` / `none`)
is shipped in the index and in `meta.coverage.byBasis`.

**After:**

| Domain | Focused | Sub-objective named | Domain-only | Sub-objective buckets |
|---|---|---|---|---|
| 1 Maintain | 297 (61.9 %) | 297 | 0 | 1.1: 157, 1.2: 140 |
| 2 Prepare | 170 (35.4 %) | 125 | 45 | 2.1: 72, 2.2: 28, 2.3: 25 |
| 3 Semantic models | 13 (2.7 %) | 8 | 5 | 3.1: 2, 3.2: 6 |
| **Total** | **480** | **430** | **50** | **480** |

Basis split of all 834: declared 425 (385 focused), derived 242 (45 focused),
domain-only 154 (50 focused), none 13 (0). Scope totals unchanged:
480 focused / 251 supporting / 90 DP-700-primary / 13 unmapped.

**Preservation evidence:** re-running the importer changed exactly two files —
`content/fabric/index.json` and `content/fabric/meta.json` (derived fields).
All 18 `questions/*.json`, `packs.json`, `sources.json`, `cases.json`,
`notes.json` and `id-map.json` are byte-identical; the answer-key digests in
`inventory-content.mjs --compare` are unchanged.

**Tests added:** "domain shares reconcile with the sub-objective table under one
rule" (per-domain bucket sums, basis partition, objective-domain agreement) and
the deterministic-classification test now also checks `domain` and
`objectiveBasis`; the importer fails on `objective-domain-mismatch`,
`domain-share-reconciliation` and `basis-reconciliation`.

**UI:** the DP-600 hub now states the rule (a question is counted once, in its
own bucket), shows the named/domain-only split per domain, replaces the
hard-coded 480/251/90/13 sentence with values read from `META`, and corrects the
semantic-model callout (8 named + 5 domain-only = 13).

---

## 4. Dated audit findings re-checked (evidence, not assumption)

| ID | Status after inspection |
|---|---|
| F01 | **Confirmed, fixed** (see §3) |
| F02 | **Confirmed as a denominator-label error, fixed** (see §2) |
| F03, F04 | **Confirmed** — `NAV` still has 8 peers; `/practice/` still visualization-only. Addressed in Batch 01. |
| F05 | **Confirmed** — no site-wide search; the only palette is the statistics concept search. Addressed in Batch 03. |
| F06 | **Confirmed by measurement** — `/learn/statistics/journey/synthesis/` renders 521 KB HTML with 25 anchors; `hypothesis` 513 KB / 24 anchors |
| F08 | **Confirmed** — `onenake`/"OneLake & storage foundation" renders 0 questions and is still a link |
| F10 | **Partly confirmed** — the explorer loads the index client-side and reads URL params after hydration; question stems are not in the prerendered HTML |
| F12 | **Qualified** — separate namespaces are intentional; Fabric already has export/import and a persisted clock |
| F14 | **Confirmed** — the explorer placeholder read "V-ACUUM", which also tokenises to `v acuum` and so cannot match real `VACUUM` questions. Corrected to "VACUUM". |
| V05, V11 | Deferred to Batch 02 (home gateway) and Batch 03 (metadata/search) |

---

## 5. Batch gate

| Check | Result | Evidence |
|---|---|---|
| Reference verifier | PASS | `verify-agent-reference.mjs` |
| Static export | PASS | `npm run build`, exit 0, 112 pages |
| Fabric tests | PASS | 29/29 after fix (was 14 in this file) |
| Content/domain tests | PASS | 4/4 |
| Route + anchor regression | PASS | self-compare of frozen baseline |
| Question/answer parity | PASS | digest compare; only `index.json` + `meta.json` changed |
| Manual visual QA of HSE dashboard | PASS (screenshot read) | base selector and 885 confirmed on the artifact |
| Real-browser QA (320 px, keyboard, axe) | NOT RUN | scheduled for Batch 04 |
| Deploy | NOT RUN | out of scope |

**Rollback:** revert `lib/fabric/classify.ts`, `lib/fabric/types.ts`,
`scripts/import-fabric-bank.mjs`, `app/lab/dp-600/page.tsx`,
`lib/case-studies.ts`, `tests/fabric/bank.test.mjs`, `tests/content/`,
`package.json`, and restore `content/fabric/` (pre-import copy retained at
`%TEMP%\fabric-content-before`).

**Next atomic task:** Batch 01 — additive `/learn/catalogue/` and
`/practice/catalogue/` entry points, five-item primary navigation, grouped
footer, without moving or deleting any existing route.
