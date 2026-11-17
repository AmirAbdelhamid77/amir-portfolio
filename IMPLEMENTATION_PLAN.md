# IMPLEMENTATION_PLAN.md — improvement work, ready for an implementing agent

Prepared 2026-11-17. It implements `PRODUCT.md` and the findings of the independent audit of 2026-11-17.
The audit lives outside this repo (`../docs/INDEPENDENT_AUDIT_2026-11-17.md`), so its findings are restated
here by ID with evidence paths. A repo-only checkout has everything it needs.

**Read first, in order:** `AGENTS.md` → `docs/agent-reference/START_HERE.md` → `PRODUCT.md` → this file.
Those govern *how* work is done (preservation, accessibility, no paid services). `PRODUCT.md` governs
*what* the product is. This file only says *in what order* and *how to know a task is done*.

---

## 1. Starting state (verify before you begin)

- **Branch:** `main` at `6a7e41c` "Record reviewed question insight release". It is **2 commits ahead of
  `origin/main` and not pushed.** A fresh clone or cloud session will not have it. Do not push or deploy
  unless the owner asks.
- **Tests:** `npm run test:all` passes: 0 failures across 7 suites. The "not ok … # SKIP" lines are tests
  that need generated comparator / sim-wave3c output; they are not failures. `npx tsc --noEmit` passes.
  `npm run lint:copy` passes.
- **ESLint fails:** about 45 errors and 5,000 warnings. Most come from the stale build folder `out-main/**`,
  which `eslint.config.mjs` does not ignore. About 13 are real source errors in `app/` and `components/`:
  - `react-hooks/set-state-in-effect`, `refs` and `immutability` in `dealer-cinematic`, `timeline-fan` and
    `neighbourhood/review`;
  - `no-html-link-for-pages` in `/work`, `/patterns` and `/lab/rti`.

  Another 11 are in `scripts/inventory/entry.ts`.
- **Not yet checked for the insight release:** mobile layout, dark mode, keyboard-only use and an axe pass.
- **Audit items that are now out of date:**
  - P0-2 ("72 of 75 cards are unverified drafts") describes the old bank. From 2026-11-18 the daily
    deck is the question-derived release. The *framing* problem (dated editions, a timeline as home) still stands.
  - P2-7 (day-card faces not rendering at mobile size) was never confirmed. Re-check it before you fix it.

## 2. Owner gate — what you may start now

Only items marked ✔ in `PRODUCT.md` are decided. ◇ items are proposals; ⏸ items are deliberately deferred.
**Implement neither as if approved.** If a task is blocked, stop at that task and report which section of
`PRODUCT.md` needs a decision. The owner's delivery rules are in `PRODUCT.md` §11a: ship the first slice,
test it with people, then start Phase 3.

| Status | Work |
|---|---|
| **Unblocked now** | Phase 0, Phase 1, and Phase 2: navigation §4, status policy §7, numbers §8 |
| **After the first slice has shipped and been tested** (§11a) | Phase 3: home items 4–5 and `/insights/` (§6, §6a), Fabric hub, subject tiers, case study |
| **Deferred (⏸)** | URL shape §5 (Phase 5) · Arabic mode §9 (T3.5) · visual identity §10 (T4.1) |
| **Still open (◇)** | Retiring dormant routes (§11, T4.2) · analytics (§11a) |

**Owner-only items. These are not agent tasks; list them in every report until they are resolved:**
1. **Wrong answer keys in the `patrick-dp600` pack.** 11 questions have keys their own explanations
   contradict: 016, 017, 018, 020, 021, 023, 024, 026, 027, 029 and 030. `fb-patrick-001` is also wrong:
   its key is Azure SQL, but its explanation describes OneLake. 25 more are suspected.
   - Source list: `content/knowledge/question-insights.report.json`.
   - Do not edit keys without the owner's ruling.
2. **Power BI content plan** (prepare → model → DAX → report → publish & govern).
3. **The CV PDF.**
4. **Accepting or rejecting the remaining ◇ items.**

## 3. The provenance receipt recipe (read before your first commit)

Many runtime files are pinned by SHA-256 in hash-chained receipts. Editing one makes `npm run test:content`
fail with **"M6 drift <path>"** or **"Runtime addition byte drift: <path>"**. That is expected. Record the
change; never edit an existing pin and never weaken a test.

1. **Commit the code change first**, as its own commit. Receipts must name that commit's SHA.
2. **For each changed file pinned in M0, M6 or FC**, append a hop to the `files` array of
   `docs/fabric-corpus-integration-20261105/INTEGRATION_MANIFEST.json`:
   `{path, previousSha256, sha256, bytes, layer, attribution, note}`.
   - `previousSha256` = the file's current terminal hash, i.e. the hash of the file at the previous commit.
   - Hash the committed bytes (`git show HEAD:<path> | sha256sum`), because of CRLF handling.

   The M0 and M6 manifests are read-only predecessors; the FC layer chains after them.
   (`scripts/knowledge-stage-receipt.mjs` follows the chain.)
3. **For runtime additions** (files listed in `docs/preservation-history/2026-11-08/RUNTIME_ADDITIONS.json`),
   edit `scripts/build-runtime-additions-receipt.mjs`:
   - new files → a `REVIEWED_WAVES` entry `{id, title, review, commits: [<code sha>]}`;
   - changed existing additions → a `REVIEWED_REVISIONS` entry `[<code sha>, [paths]]`.

   Then run, in order:
   ```bash
   node scripts/build-runtime-additions-receipt.mjs --update --review="<one sentence>"
   node scripts/build-runtime-additions-receipt.mjs --check
   npm run test:content
   ```
4. **Commit the receipts as a second commit**, titled "Record reviewed <change>".
   The worked example is commits `589e9eb` and `6a7e41c`.

**Pinned files that Phase B touches.** Each of these needs step 2:

| File | Receipt layers that pin it |
|---|---|
| `components/site-header.tsx` | M0 |
| `lib/site.ts` | M0 |
| `app/layout.tsx` | M0 |
| `lib/site-metrics.ts` | M0 |
| `app/globals.css` | M0, M6, FC |
| `app/sitemap.ts` | M0, FC |
| `components/hansa/island-nav.tsx` | runtime-additions (step 3) |
| `app/robots.ts` | not pinned |

## 4. Rules for every task

- **One task = one branch from `main`** (`hansa/<task>-<yyyymmdd>`) **= a code commit plus, if needed, a
  receipt commit.** Do not bundle tasks together.
- **Preserve:**
  - question IDs, answer keys and question wording;
  - deep links, including the old `/day/<date>/`, `/day/live/?date=` and `?question=` URLs;
  - anchors;
  - the storage keys `amir-lab-v1` and `amir-fabric-v1`;
  - CC BY 4.0 attribution on mirrored Microsoft content.
- **Done means all of these:**
  - `npx tsc --noEmit`
  - `npm run test:all`
  - `npm run lint:copy`
  - `npx eslint <changed files>`
  - `npm run build` (static export)
  - a browser check of every affected route at desktop and 375 px, in light and dark mode. Report what
    you could not check as NOT RUN.
- **Report:** PASS/FAIL/NOT RUN per command, the files changed, and the next task. Do not merge to
  `main` without the owner's yes.

---

## 5. Tasks, in order

### Phase 0 — clear the ground (unblocked)

**T0.1 Decide the three open branches.** Audit P2-3.

| Branch | Commits ahead of `main` |
|---|---|
| `hansa/product-improvements-20261112` | 2 |
| `hansa/hybrid-fabric-search-20261113` | 7 (it includes the 2 product-improvement commits) |
| `hansa/design-engineering-20261114` | 7 |

- All three edit `island-nav.tsx` and/or the receipt files, so each will conflict with `6a7e41c`.
- Read each branch's commits and diffs. `product-improvements` may already do part of T2.x (discovery
  and accessibility).
- Write a short recommendation per branch (merge, cherry-pick or close) for the owner.
- Merge only on the owner's yes. Then re-record the receipts on top of `main` (§3); do not hand-merge
  receipt JSON.

**T0.2 Get ESLint passing.**
- Add `out-main/**` to `globalIgnores` in `eslint.config.mjs`.
- Fix the ~13 real errors listed in §1, or justify a vendored-code ignore for each, the same way the
  config already does for `components/charts/**`.
- Done when `npm run lint` exits 0.

**T0.3 Fix the robots and canonical bugs.** Audit P2-6.
- `404` and `review/neighbourhood` emit a duplicate `<meta name="robots">`.
- Noindexed pages (RTI labs, `/day/live`) inherit the root canonical.
- Give each noindexed page its own canonical, or none.

### Phase 1 — already-decided (✔) changes

**T1.1 Lockup and titles** (`PRODUCT.md` §3 ✔).
- Show "Hansa" with the fixed sub-line "by Amir Abdelhamid" in the header and the island nav on every route.
- Remove the "AA" mark and any lockup that changes by route.
- Make page titles `<Page> — Hansa` through the `app/layout.tsx` title template.
- Keep the author in `authors` / JSON-LD.
- Receipts: `layout.tsx`, `site-header.tsx`, `island-nav.tsx`.

**T1.2 Noindex the docs mirror** (§5 ✔; audit P2-1).
- Mark every page under `/learn/fabric/docs/**` (2,728 articles) as `noindex, follow`.
- Keep those pages out of the sitemap, keep them in-site search, and keep the attribution.
- Done when a test asserts it over the `out/` HTML.

**T1.3 No CV button** (§2 ✔). The CV is promised on `app/experience/page.tsx:213` ("will be added").
- Remove that promise.
- Make sure no CV or résumé control renders anywhere until a PDF exists.

**T1.4 Power BI honesty note** (§5 ✔).
- The Power BI subject page should state plainly how many units are taught (about 4) and that a full
  course is planned.
- DP-600 Power BI material stays cross-linked from the Fabric track.
- Do not invent lessons.

### Phase 2 — navigation, copy and numbers (UNBLOCKED: §4, §7 and §8 accepted 2026-11-17)

The first release slice (`PRODUCT.md` §11a) is **T1.3 + T2.1 + T2.3 + T2.5**. Finish those before T2.2 and T2.4.

**T2.5 Top of the home page** (§6 items 1–3 ✔).
- Above the existing timeline, add: who and what in one line, *Start learning* and *See my work* buttons,
  a smaller *Practice* link, and the three doors (Learn, Practice, Work), each with one sentence and one action.
- Do not move or remove the timeline yet; that is T3.1.
- Preserve every `/day/...` URL and the insight data.

**T2.1 One primary nav everywhere** (§4; audit P0-3, P0-4).
- Use `Learn · Practice · Work · About` plus Search and Contact on every route, including home.
- Remove Atlas and Today from the primary nav.
- Show Work and Contact on desktop.
- Delete the `body[data-home-v2="true"] > header/footer` hiding rule (`app/globals.css:608`).
- Retire the island nav as a second primary nav.
- Files: `lib/site.ts` (`NAV`, `SECONDARY_NAV`), `components/site-header.tsx`,
  `components/hansa/island-nav.tsx` (`HANSA_ITEMS`), `app/globals.css`.

**T2.2 Subject tab bar** (§4; audit P1-5, P1-8).
- Give each subject one visible tab bar, `Overview · Learn · Practice · Labs · Reference`. Omit empty tabs.
- Move the DP-600 section nav (Mock exam, Mistakes, Progress) out of its closed `<details>`.
- Make breadcrumbs start at a primary nav item.
- Replace the URL-substring subject guess in `components/study/orientation.tsx` with the subject from
  `lib/curriculum/model.ts`.

**T2.3 Visitor copy cleanup** (§7; audit P0-5).
- Extend the `BANNED` list in `scripts/lint-copy.mjs` (it does not yet catch these) with:
  NOT_RUN, R-numbers such as "R18", "rights review", "Export SHA-256", "owner's Notion export",
  "PORTRAIT PENDING", "published verbatim", "app.notion.com" and Notion emoji prefixes.
- Then fix every hit:
  - leave one status, `Draft — not yet reviewed`;
  - move the rest into a per-page "Sources & review" disclosure and `/about/sources`.
- Strip Notion numbering and emoji from titles at import time, not by hand.

**T2.4 One metrics source** (§8; audit P1-2).
- Every count shown on the site comes from `lib/site-metrics.ts` and uses a fixed noun: *lessons*,
  *questions* or *articles*.
- Known clash: Fabric has 1,264 questions on one page and 1,729 on another.
- Extend `npm run verify:metrics` so a hard-coded count fails it.
- Make "Practice" the UI spelling everywhere.

### Phase 3 — rebuild key surfaces (starts after the first slice has shipped and been tested; T3.5 deferred ⏸)

**T3.1 New home** (§6).
- Order: who and what, Continue (from localStorage), three doors, today's insight, flagship case study.
- Move the timeline to `/insights/`.
- `/day/...` URLs keep resolving.
- The insight data is unchanged: `LIVE_DECKS` from `lib/knowledge/editorial-feed.ts`.

**T3.2 Fabric hub consolidation** (§5; audit P1-1). Fabric currently has 9+ entry points. Collapse them
into one hub (Learn · Practice · Labs · Reference) using links and aliases only, with no URL removals.

**T3.3 Subject tiers** (§5; audit P1-3).
- Show subjects as Courses, Certification track and Practice sets on `/learn`, driven by `lib/curriculum/model.ts`.

**T3.4 "Building Hansa" case study plus portfolio depth** (§2; audit P1-7). Present the platform itself
as a case study on `/work`. Write the copy from repo facts and have the owner review it.

**T3.5 EN/AR reading mode** (§9; audit P1-4).
- Give each course a toggle and separate lesson lists. English chapters list English lessons only.
- Visualization chapter 03 currently mixes 1 English and 7 Arabic lessons.

### Phase 4 — identity and retirement (T4.1 deferred ⏸ §10; T4.2 needs §11 decided)

**T4.1 Visual identity.** One accent: remove the 7 presets. Annotated mini-charts as section markers.
One radius scale. No stat-tile heroes (audit P2-5).

**T4.2 Retire the dormant stacks** after one release, on the owner's yes:
- `HOME_V2=0` path in `app/page.tsx`
- `/archive`, `/prototype`, `/prototype-c`
- `stage-editorial.css`, `neighbourhood.css`

Check receipts and tests that reference them before deleting (audit P2-2).

### Phase 5 — URL canonicalisation (HIGH RISK; last; §5 URL shape deferred ⏸)

**T5.1** Move to the target shape (`/learn/<subject>/<unit>/`, `/practice/<subject>/`, `/labs/…`,
`/reference/…`) in small tested batches. Every old URL gets an alias. IDs, anchors, query parameters and
storage keys stay unchanged.
- Fix the collision where `/learn/[subject]` actually holds visualization lesson slugs (audit P1-6).
- Make `/learn/drafts`, `/review/*`, `/held-articles`, `/insight-records`, `/atlas-records` and
  `/content-index` noindex and remove them from navigation.
- `npm run verify:curriculum` must pass after each batch.

---

## 6. Suggested first assignment for a fresh agent

Do **T0.1 → T0.2 → T0.3 → T1.1 → T1.2 → T1.3 → T1.4**, one branch each, then stop and report.
Next, with the owner's go-ahead, build the first slice: **T2.1 → T2.3 → T2.5**. T1.3 is already done in
the first assignment. After that, the owner tests the slice with people (`PRODUCT.md` §11a). Only then do
T2.2, T2.4 and Phase 3 begin.
