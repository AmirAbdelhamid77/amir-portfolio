# Testing evidence

Everything below was run on 2026-10-24 against this working tree, and the browser
suite was run twice: once against the local static export and once against the live
deployment.

Environment: Windows, Node 22.23.3, Next.js 16.4.3, Microsoft Edge (system install)
driven by `playwright-core`, `axe-core` 4.14.

## 1. Automated suites

| Suite | Command | Result |
|---|---|---|
| Data Visualization (pre-existing) | `npm test` | **PASS 36 / 36** |
| Statistics (pre-existing) | `npm run test:statistics` | **PASS 18 / 18** |
| Fabric import + scoring | `npm run test:fabric` | **PASS 28 / 28** |
| Fabric browser QA, local export | `npm run test:e2e:fabric` | **PASS 22 / 22** |
| Fabric browser QA, live site | `BASE_URL=https://hansa.amir-portfolio.workers.dev npm run test:e2e:fabric` | **PASS 22 / 22** |
| Production build | `npm run build` | **PASS** (exit 0) |

### What `tests/fabric/bank.test.mjs` proves

- 834 questions, 18 packs, 227 registry entries, 76 case studies, 11 code snippets.
- 658 single / 168 multi-select / 8 ordered-sequence, 52 with five options, 343 with
  case context — all matching the package's declared baseline.
- Unique namespaced ids, no collision with the 60 Data Lab question ids.
- Every option has text and a rationale; every answer key resolves to option ids;
  cardinality is correct per type; sequence keys are full permutations.
- Every reference resolves; no broken links.
- Case studies keep their text and every linked question back-references them
  (largest shared scenario: 24 questions).
- The index is a faithful projection of the raw records, and classification is
  reproducible from the raw record.
- The shipped coverage report equals a fresh aggregation, and every question lands in
  exactly one scope, objective bucket and primary subject.
- Difficulty only ever 4 or 5 where supplied; 192 records carry none (documented).
- The 8 questions without a timestamp are exactly the foundation set.
- No silent repair: `meta.integrity.failures` is empty and all 24,776 importer checks
  are recorded.

### What `tests/fabric/scoring.test.mjs` proves

- **All 834 questions score their own recorded key as correct.**
- **All 834 reject a deliberately broken key** (wrong single option, one option removed
  from a multi-select, two positions swapped in a sequence).
- An empty response is never correct, for every question.
- Multi-select is exact: missing a correct option, adding a wrong one, or answering
  partially is incorrect; selecting the same set in another order is correct.
- Sequence grading reports the exact positions that differ.
- Shuffled option order cannot change a verdict (grading uses option ids, not positions).
- Session grading aggregates by objective, subject and type with correct denominators.
- Selection is deterministic per seed, honouring pack/subject/objective/scope/type/
  difficulty/status/case filters, clamped to the available inventory rather than padded.
- Option order is deterministic, a permutation, and **never shuffles a sequence**.
- Manifest identity and clock helpers behave at boundaries (expired deadline → 0, not
  negative; 3725 s → `1:02:05`).

## 2. Browser QA — 22 checks

Each check is an independent assertion; all 22 pass both locally and live.

1. Hub renders the real counts (834 / 480 / 18 packs / 227 references) and the explicit
   "cannot be blueprint-balanced" disclosure, with no serious/critical axe findings.
2. Hub links all nine routes and the existing Data Lab still lists its six exams.
3. Guided study: select an option, check it, see the verdict, the explanation and the
   option-by-option rationale with source links.
4. **Refresh during practice** keeps the session and the checked answer; the resume
   banner restores it after reload.
5. Bookmark persists into the Fabric namespace, and `amir-lab-v1` stays absent.
6. Sequence question: reorder with the move buttons, check, see the required order.
7. Explorer search narrows 834 → a smaller set; topic filter narrows further; clear
   restores 834/834.
8. Timed simulation hides feedback while running, shows a live timer, submits, and lands
   on a scored result with the "not a blueprint-weighted replica" statement.
9. Results review opens a question with its rationale.
10. **Timer expiry** after refresh auto-submits and labels the result "Time expired".
11. Progress page reports attempts and exports a versioned `hansa-fabric` file.
12. Re-importing the same file reports 0 new attempts and skips duplicates.
13. Review mode starts from the questions last answered wrong.
14. Resources page: study notes load on demand; registry present.
15. Dark mode: `html.dark`, same structure, axe clean.
16. Reduced motion: `prefers-reduced-motion: reduce` respected, content present.
17. Mobile 390×844: no horizontal overflow on the hub or on a question; axe clean.
18. Keyboard: skip link is first, Tab reaches a radio input, Space selects, Enter checks.
19. The six original Data Lab exams still run and never write the Fabric namespace.
20. Data Visualization, Statistics and chart labs still render.
21. Unknown routes still return the site's 404 page.
22. No unexpected console errors across the Fabric routes (the deliberate 404 probe is
    excluded and asserted by status code instead).

Screenshots: `docs/fabric/screenshots/` (`desktop-hub.png`, `desktop-hub-dark.png`,
`mobile-hub.png`, `mobile-question.png`, `desktop-results.png`).

### Accessibility scans

`axe-core` with the WCAG 2.0/2.1/2.2 A and AA tag set, filtered to `serious` and
`critical`:

| Page | Before fixes | After fixes |
|---|---|---|
| Hub (light) | 14 contrast nodes, 1 name mismatch | 0 |
| Results | 2 contrast nodes | 0 |
| Resources | 7 target-size nodes | 0 |
| Hub (dark) | 14 contrast nodes | 0 |
| Hub (mobile) | 14 contrast nodes | 0 |

Findings fixed rather than suppressed:

- White on `#0285f7` measures **3.68:1**, below AA for normal-size text. The new
  text-bearing primary actions use the site's existing ink button
  (`bg-foreground text-background`) instead.
- Reduced-opacity muted text (`/80`, `/70`, `/60`) was replaced with the base token.
- The shared header and footer "AA" tiles were darkened with
  `color-mix(in oklch, var(--primary) 78%, black)` so the white logotype passes; this
  is the only change to shared chrome besides the header link's accessible name.
- The header home link had an `aria-label` that did not contain its own visible text
  (the gaps are CSS, so the text content runs together). The label was removed and an
  `sr-only` "— home" added.
- Small reference links were given a 24 px minimum target height.

## 3. Performance

Measured with a real browser against the static export (decoded JavaScript bytes
downloaded before `networkidle`, after which no further chunks are requested):

| Route | JS requests | JS decoded | HTML raw | HTML gzip | DOM nodes |
|---|---|---|---|---|---|
| `/` (homepage) | 13 | 720 KB | 149 KB | 22 KB | 701 |
| `/lab/` | 14 | 873 KB | 82 KB | ~12 KB | 468 |
| `/lab/dp-600/` | 21 | 1003 KB | 172 KB | 26 KB | 803 |
| `/lab/dp-600/explore/` | 21 | 1549 KB | 117 KB | ~17 KB | 1038 |
| `/lab/dp-600/study/` | 18 | 1440 KB | 64 KB | ~10 KB | 389 |
| `/lab/dp-600/progress/` | 17 | 1406 KB | 77 KB | ~11 KB | 576 |
| `/lab/dp-600/resources/` | 15 | 848 KB | 422 KB | 40 KB | 1477 |

**The homepage ships zero Fabric bytes.** Its eight script tags were scanned for any
Fabric content marker (`fb-v0`, `fabric/index`, question counts): 0 hits, 604 KB of
script total — the same framework chunks as before this work.

The hub adds ~126 KB of static metadata over the homepage. Explorer, study, practice,
mock, review and progress fetch the 527 KB question index (≈90 KB gzip) once, then only
the pack chunks a session draws from (49–182 KB each). Resources fetches the 304 KB
study-note file only when the reader asks for it.

Export totals: **957 files, 38.8 MB** (baseline 864 files; +93 files, +2.6 MB, almost
all of it the deliberately separated question data). Cloudflare compressed and served
521 changed assets in the deployment.

### Limits, stated plainly

- No Lighthouse run was performed; the numbers above are measured transfer sizes, not
  Core Web Vitals.
- The explorer renders 40 rows at a time. Filtering 834 entries is instant on this
  machine; it was not profiled on a low-end phone.
- The results screen prints only the question currently in view.

## 4. Content and domain QA

- Coverage matrix: 834 rows in `docs/fabric/coverage-matrix.csv` (+ JSON).
- Objective coverage: `docs/fabric/03-coverage-report.md`.
- Classification confidence and the 13 "needs review" records:
  `docs/fabric/classification-confidence.json`.
- DP-700 adjacency (90 records, each with the source's own wording):
  `docs/fabric/dp700-adjacency.json`.
- Broken source references: 0 (importer assertion + unit test).
- Missing answers: 0.
- Duplicate prompts: 0 exact-normalised groups; 1 lexical candidate retained by the
  package author as a genuinely different scenario (`V16-SQL-010` / `V16-SQL-033`).

### Independent checks on the source material

- The importer cross-checks the catalog against `QUESTION_BANK.merged.json` record by
  record (prompt and answer key), so the two files cannot silently diverge.
- It also cross-checks the package's own declared counts (834 total, 192 + 642, 18
  packs, 52 five-option questions) and aborts on any mismatch.
- Objective weights were read from Microsoft's study guide on 2026-10-24 and matched
  the task brief exactly (25–30% / 45–50% / 25–30%, effective 19 October 2026).

### What was **not** verified

- No question was executed against a live Microsoft Fabric tenant. The source's own
  validation notes say the same, and both the UI and this document say it.
- No Microsoft documentation review of all 834 answers was repeated; the package's
  per-question validation wording is preserved verbatim instead of being upgraded into
  a claim it does not make.
- The 13 "needs review" classifications were not individually adjudicated; they are
  labelled, excluded from focused sessions, and listed in the JSON artifact.
- Screen-reader testing was automated (axe + keyboard), not manual with JAWS/NVDA.
- No real user-progress export existed in the package; import/export was tested with
  files this build produced.
