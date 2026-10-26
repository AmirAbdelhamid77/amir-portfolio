# Hansa architecture audit — before the Microsoft Fabric integration

**Date:** 2026-10-24
**Scope:** the real local repository at `D:\BeUI\amir-portfolio`, the deployed site at
`https://hansa.amir-portfolio.workers.dev/`, and the attached package
`Amirs_Fabric_Lab_Merged_834_Deployment_Package`.

Everything below was read from the files named, not inferred from an earlier description.

## 1. Verified stack

| Item | Verified value | Source |
|---|---|---|
| Framework | Next.js **16.4.3**, App Router, React **19.3.0** | `package.json` |
| Output mode | `output: "export"`, `trailingSlash: true`, `images.unoptimized` | `next.config.ts` |
| Hosting | Cloudflare Workers **Static Assets**, `name: "hansa"`, assets dir `./out`, no Worker script | `wrangler.jsonc` |
| Styling | Tailwind CSS v4 via `@tailwindcss/turbopack`, oklch design tokens, `.dark` class + `data-theme` accents | `app/globals.css`, `app/layout.tsx` |
| Motion | `motion` v14 (beUI components), reduced-motion aware | `components/motion/*` |
| Validation | `zod` v4 (existing exam banks) | `lib/exams.ts` |
| Tests | `node --test` + `--experimental-strip-types`; browser QA via `playwright-core` + system Edge + `axe-core` | `package.json`, `tests/` |
| Installed beUI (free/MIT) | `funnel-chart`, `treemap`, `number-ticker`, `tooltip`, `command-palette` | `docs/data-visualization/beui-install-log.json`, `components/` |

The previously reported architecture **is confirmed**: static export, Workers Static
Assets, free plan, no server runtime. `postbuild` additionally copies nested RSC
segment payloads to the flat names the client router requests
(`scripts/export-segment-aliases.mjs`); any new dynamic-free route inherits that.

## 2. Deployed vs local

`/` , `/lab/`, `/lab/sql/`, `/learn/`, `/learn/statistics/`, `/explore/` all resolve on
the live host and match the local uncommitted working tree (Data Visualization,
Statistics, chart labs, practice bank, 60-question Data Lab). `git status` shows the
site has been deployed from an uncommitted tree on `main` (HEAD `18ef2e0`). There is no
CI deployment workflow in `.github/` that this audit could find, so **release is a manual
`npm run deploy`** — that is the deployment story, and the reason Phase 13 cannot assume
"release is authorized".

## 3. Existing exam engine (what can be reused)

| Function | Implementation | Reusable for Fabric? |
|---|---|---|
| Exam discovery | `components/lab/exam-catalog.tsx` (topic chips + search) | Pattern yes, data shape no |
| Question rendering | `components/lab/exam-player.tsx` — one 960-line client component | **Reuse the visual language, not the component** |
| Practice mode | same component, `mode === "practice"`, immediate explanation | Yes conceptually |
| Mock mode | same component, countdown, flagging, navigator, auto-submit | Yes conceptually |
| Scoring | local `isCorrect()` in the player; single/boolean/multi(compare sorted index arrays)/numeric(tolerance) | **Extract and extend** — no sequence type, answers are option *indexes* |
| Explanations | single `explanation` string per question | Fabric data adds per-option `why`, case studies, refs |
| Review | `<details>` list + "retry incorrect" drill (explicitly not scored) | Pattern yes |
| Personal bests | `localStorage["amir-lab-v1"]` → `{ [slug]: { best, attempts, lastAt } }` | Keep untouched |
| Persistence of active session | **none** — a refresh silently destroys a running attempt | Must be built, in a separate namespace |

Consequences: the Fabric engine must add (a) named option IDs instead of indexes,
(b) ordered-sequence scoring, (c) per-option rationales, (d) case-study context,
(e) resumable sessions, (f) bookmarks/flags/per-question history. Those are additive;
the existing six `content/exams/*.json` banks and the player stay exactly as they are.

## 4. Content sources of truth

- General Data Lab: `content/exams/{sql,power-bi,excel,python,statistics,fundamentals}.json`
  → validated by `zod` in `lib/exams.ts` → 6 × 10 = **60 questions**.
- Data Visualization practice: `lib/data-viz/practice.ts` → **12 questions**, separate
  store (`lib/data-viz/practice.ts` component state, no persistence).
- Statistics reference: `content/statistics/source.json` + `lib/statistics/content.ts`.
- Data Visualization course: `content/data-viz/{curriculum,pages,datasets,editorial,manifest}.json`.

None of these are touched by this integration.

## 5. Constraints the integration must respect

1. `output: "export"` — every new route must be build-time enumerable; no API routes, no
   runtime dynamic params.
2. Initial payload discipline — the homepage currently ships 12.1 MB of HTML across 864
   files and 1.69 MB of JS. Adding 834 questions inline to a shared chunk would inflate
   every page. Packs must be **separately imported chunks**.
3. `localStorage` keys `amir-theme`, `amir-accent`, `amir-lab-v1` are live user data.
   The Fabric namespace must be new (`amir-fabric-v1`).
4. Accessibility baseline already in place: skip link, semantic landmarks, reduced-motion
   block in `globals.css`, `:focus-visible` ring, print styles, axe tests for statistics.
5. beUI must remain free/MIT (`docs/data-visualization/beui-install-log.json`); no Pro.

## 6. Baseline measurements (pre-change, this machine)

| Metric | Value |
|---|---|
| `npm run build` | PASS, exit 0 (2026-10-24) |
| `npm test` (data-viz) | PASS 36/36 |
| `npm run test:statistics` | PASS 18/18 |
| `out/` files | 864 |
| `out/` JS total | 1,692 KB |
| `out/` HTML total | 12,131 KB |
| Largest JS chunk | 224 KB |

## 7. Decisions taken before implementation

| Decision | Choice | Reason |
|---|---|---|
| Namespacing | internal id `fb-<source-id>` (`V01` → `fb-v01`) | cannot collide with `sql-01`, and is URL-safe |
| Content pipeline | build-time generator `scripts/import-fabric-bank.mjs` → `content/fabric/*.json` | keeps the original package untouched, makes counts testable, keeps raw values verbatim |
| Runtime cost | 18 lazy chunks (one per pack) + one small index chunk | hub and homepage never load 834 questions |
| Engine | new `components/fabric/*` engine sharing Hansa tokens | the existing player's index-based answer model cannot express option-ID keys or sequences |
| Persistence | new versioned namespace `amir-fabric-v1` | existing `amir-lab-v1` must not be rewritten |
| Blueprint | classify from `importMetadata.exam_objective`, exact official objective ids | no invented alignment |
| Charts | inline accessible HTML bars + data tables | no new chart dependency; honest denominators |

## 8. Risks carried into the work

- The package's own QA is offline and does **not** cover rendered browsers; all browser
  behaviour here is tested separately (`tests/fabric/e2e.mjs`).
- 343 questions carry case-study context, 31 of the 76 cases are shared by more than one
  question (max 24) — session builder must keep a scenario with its questions or avoid
  splitting them across a session.
- 8 foundation questions have `time: null` (no video timestamp). Treated as a valid
  nullable value, not an error.
- The bank is heavily "Prepare data"; semantic-model coverage is thin, so an
  authentic-blueprint mock cannot be offered honestly (see the coverage report).
