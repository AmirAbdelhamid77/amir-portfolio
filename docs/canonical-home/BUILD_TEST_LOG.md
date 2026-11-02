# BUILD TEST LOG — commands actually run

Environment: Node `v22.23.3`, npm `10.9.9`, Windows (Git Bash), working tree of
`feat/dp600-academy-ingestion-20261025` at HEAD `2e09ee9`. No deployment, no push.

Every result below is the real exit status of the command, captured with
`${PIPESTATUS[0]}` where output was piped. Nothing here is a projection.

## Results

| # | Command | Result | Evidence |
|---|---|---|---|
| 1 | `npm run lint` | **PASS** — exit 0, 0 errors, 0 warnings | The one warning this migration introduced (`'receipt' is assigned a value but never used` in `scripts/verify-prototype-c.mjs`) was fixed in the same file rather than suppressed. |
| 2 | `npx tsc --noEmit` | **PASS** — exit 0, no diagnostics | `tsconfig.json` now excludes the gitignored `build/` scratch tree, so the project is the real source tree. |
| 3 | `npm run test:all` | **PASS** — exit 0, **196 tests / 196 pass / 0 fail** | `62 data-viz · 18 statistics · 34 fabric · 32 content · 25 knowledge · 25 atlas` |
| 4 | `npm run build` | **PASS** — exit 0 | `postbuild` wrote 120 segment payload aliases |
| 5 | `node scripts/verify-canonical-home.mjs --port 4321` | **PASS** — exit 0, **34/34 checks** | `evidence/verify-canonical-home.json` (rewritten by this run) |
| 6 | `node scripts/qa-canonical-home.mjs` | **PASS** — exit 0, **45/45 checks** | `evidence/qa-canonical-home.json` + 6 screenshots |
| 7 | `node scripts/census-canonical-home.mjs` | **PASS** — exit 0 | `ROUTE_CENSUS.csv`, `evidence/route-census-summary.json` |
| 8 | `node scripts/seal-canonical-home.mjs --write` | **PASS** | `START_BASELINE.json`, `INTEGRATION_MANIFEST.json`, `before/*.snapshot` |
| 9 | `node scripts/verify-prototype-c.mjs` | **PASS** — exit 0 | `docs/prototype-c/qa/prototype-integrity.json`: 17 owned paths, 6 corruption rejection cases |

## Size measurement (item H068)

Measured on the built export, not estimated:

| Metric | Value |
|---|---|
| `out/` total | 47 MB across 947 files |
| HTML files | 123 = 120 user route pages + `404.html`, `404/index.html`, `_not-found/index.html` |
| Exported user routes answering 200 | **121** checked by the HTTP audit (it also requests the two framework error directories); **119** distinct user routes in the census |
| JavaScript | 9.4 MB across 112 files (all routes, all chunks, unminified-in-name only) |
| CSS | 183 KB across 3 files |
| `out/index.html` | 84 KB, referencing 19 assets totalling 1.1 MB |

**No before/after bundle delta is claimed**: the retired homepage was replaced
rather than refactored, no baseline bundle measurement of the old `/` exists in
this repository, and inventing one would be worse than reporting the after-state
alone.

## Pre-existing failures (NOT caused by this migration)

Run for the report, and each one fails for the same reason: `AGENTS.md`,
`package.json` and `.gitignore` carry edits from **other work streams** that were
already in the working tree when this session started.

| Gate | Result | Attribution |
|---|---|---|
| `node scripts/verify-preservation-history.mjs` | **FAIL** — "Current source differs from audited transition": expected `6561cd58…`, actual `18cf9597…` | Reads the combined audited hash of the dirty set |
| `node scripts/verify-easyui-integration.mjs` | **FAIL** — same assertion from the same loader | Same cause |
| `node scripts/verify-agent-reference.mjs` | **FAIL** — "Size drift: AGENTS.md", expected `5470`, actual `6582` | `AGENTS.md` gained the `HANSA_CREATIVE_INTELLIGENCE` block (+7 lines) |
| `node scripts/verify-knowledge-atlas.mjs` | **FAIL** — "Integration drift AGENTS.md" (+ its schema half prints PASS) | Same file |
| `node scripts/prototype-c-preservation.mjs` | **FAIL** — 7 `unexpectedChanges` out of 1401 pre-existing files | 3 are the other streams' dirty files (`AGENTS.md`, `package.json`, `.gitignore`); the other 4 (`lib/touch.ts`, `lib/hooks/use-hover-capable.ts`, `app/globals.css`, `eslint.config.mjs`) are byte-identical to `git HEAD` and differ only from the older preservation snapshot (line-ending normalisation at capture time) |

`git diff -- package.json AGENTS.md .gitignore` confirms the cause: `package.json`
adds `build:drafts` / `qa:drafts` / `build:intake`, `AGENTS.md` adds the Creative
Intelligence block, `.gitignore` adds `intake-private/`. None of those belong to
the canonical-home migration, and this session did not touch them.

## Checks that did NOT run

| Check | Why |
|---|---|
| Production smoke test | Requires deployment, which is not authorized. `/prototype-c` slash behaviour on the live host, and the live rendering of `/`, are therefore **NOT RUN**. |
| Recording of rail/dealer motion | No video was captured; motion is asserted only through interaction results. |
| Screen-reader session | axe + keyboard traversal only. |
| Baseline screenshots of the old `/` | Not captured before the change; the byte-level baseline serves restoration instead. |
| Draft-review routes (`/learn/drafts/`, `/practice/drafts/`) | Different work stream; counted in the census, not exercised. |

## Editorial re-stage — 2026-10-30

Environment: Node `v22.23.3`, Windows (Git Bash), working tree of
`45704b5` plus the uncommitted re-stage diff. No deployment, no push.

| # | Command | Result | Evidence |
|---|---|---|---|
| 1 | `npm run test:knowledge` | **PASS** — 33/33 (all canonical-home guards) | guard strings, single-landing ownership, permalinks intact |
| 2 | `npm run test:all` | **PASS** — 224/224 across 6 suites (62·18·35·51·33·25) | 3×: initial, after the header fix, after the ink-inheritance fix |
| 3 | `npx tsc --noEmit` | **PASS** — exit 0 | includes the new stage modules |
| 4 | `npm run lint` | **PASS** — 0 errors; 14 pre-existing warnings, none in touched files | touched files: `insight-stage.tsx`, `stage-*.tsx/css`, `site-header.tsx`, `layout.tsx`, `globals.css`, `verify/qa-canonical-home.mjs` |
| 5 | `npm run build` | **PASS** — 370 static pages + postbuild aliases (ran 3×: initial, header-clearance fix, ink-inheritance fix) | — |
| 6 | `node scripts/verify-canonical-home.mjs` | **PASS** — 34/34 (after marker list updated to the new editorial copy) | marker change recorded in the script |
| 7 | `node scripts/qa-canonical-home.mjs` | **PASS** — 45/45 (after marker list updated likewise) | `evidence/qa-canonical-home.json` + screenshots incl. light/dark/mobile |
| 8 | Visual QA of `evidence/*.png` | **PASS** | found and fixed 3 defects: header/masthead collision (104px clearance), light-theme transparent header unreadable on ink (`.stage-ink` on the landing header), light-theme body-text inheritance (scope now re-declares `color`/`background`); below-the-fold `#works`/`#archive` captured via `.scratch/capture-stage-sections.mjs` |
| 9 | `node scripts/seal-canonical-home.mjs` (dry run) | **NOT WRITTEN** — deliberately | the 2026-10-28 seal layer must not absorb this redesign's bytes as its predecessors; the re-stage needs its own receipt layer (see next atomic task) |

## Landing v3 — full-screen gate flow — 2026-10-30

Owner-corrected direction: keep the reference's full-viewport scroll structure,
drop the v2 black/amber palette entirely (the theme toggle must work), rebuild
the flow as Date hero → card-dealer takeover → insight → Learn Gate →
certificate gate. Same working tree as the v2 entry above, still uncommitted.

| # | Command | Result | Evidence |
|---|---|---|---|
| 1 | `npx tsc --noEmit` | **PASS** | one missing import caught and fixed on the way |
| 2 | `npm run test:knowledge` / `npm run test:all` | **PASS** — 33/33 and 224/224 (6 suites) | guard strings, single-landing ownership, permalinks |
| 3 | `npm run lint` | **PASS** — 0 errors in touched files; 15 pre-existing warnings elsewhere; one new error (sync setState in effect) fixed by deferring the live-date swap to a rAF | — |
| 4 | `npm run build` | **PASS** — 370 pages, ran 5× through the fix cycle | — |
| 5 | `node scripts/verify-canonical-home.mjs` | **PASS** — 34/34 | markers moved to the gate kickers (contiguous text; `<em>` splits titles) |
| 6 | `node scripts/qa-canonical-home.mjs` | **PASS** — 45/45 | three harness updates were required and are recorded in the script: (a) the DEALER steps now open the takeover first, (b) the run returns to scroll-top before clicking the pinned gate CTA, (c) axe waits out entrance reveals and reports node targets |
| 7 | axe contrast | **PASS** after two real fixes | (a) the v2-style opacity crossfade left gate text at 25–60% opacity as a *persistent* mid-scroll state — replaced with transform rise + soft top-edge mask (content opacity always 1); (b) dark `--muted-foreground` measured 4.43:1 on the plain dark background the gates expose — raised 66%→70% |
| 8 | `node scripts/seal-canonical-home.mjs` | **NOT WRITTEN** — deliberately | same reason as v2: the 2026-10-28 layer must not absorb the redesign; a new receipt layer is the next atomic task |
| 9 | Visual QA (`evidence/*.png`) | **PASS** | theme proof: light/dark landings visibly differ (toggle restored); defects found+fixed: header/masthead clearance (restored pt-104), gate-0 takeover bleeding through the transparent insight section (opaque bg added) |
| 10 | beUI bar-chart integration | **BLOCKED → local fallback** | `beui.dev/r/bar-chart` registry JSON carries no license field; under the free/local rules the 25 files cannot be copied. Gate 3 ships an honest proportional bar list of `coverage.byObjective` (label+count are real text; bars decorative; `META.generatedAt` caption) |
