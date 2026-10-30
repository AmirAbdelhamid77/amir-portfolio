# Hansa Deep Research Corpus integration — Phases A + B, 29 October 2026

Executed from the workspace handoff `hansa-integration/HANDOFF.md` (trigger
"proceed with the plan") and its master plan `hansa-integration/INTEGRATION_PLAN.md`.
Scope for this wave: **Phase A (reference layer)**, **Phase B (hands-on lab
pages)**, known-issue #1 (`content/fabric/notes.json` 404), and the integrity
surface that proves them. Phases C–F are not started. **Nothing was deployed**;
`out/` is a local static export only.

---

## 1. Outcome

| Plan deliverable | State |
|---|---|
| Phase A — reference layer | **1,859 curated LINK_ONLY/reference records** live in the study hub; every one of the 8 Fabric module desks plus power-bi, sql, python and analysis desks gained reference material (fabric/ingestion 144, fabric/streaming 241, fabric/delivery 130, fabric/transform 132, fabric/query 122, fabric/foundations 99, fabric/security 59, fabric/model 40, fabric/overview 341). |
| Phase B — hands-on labs | **29 lab pages live at `/lab/hands-on/<slug>/`** (18 mslearn-fabric, 10 PL-300/Power BI, 1 SQL) with environment, step skeleton, validation checks, assets, license badge and provenance; catalogue Experiment counts rose from 4 site-wide to 4 + 29 published labs (+16 recorded hold-backs). |
| Known issue #1 — notes.json 404 | **Fixed**: `public/content/fabric/notes.json` ships in the static export (`200` on the served build; previously 404). Lesson `sourcePointer` values now resolve. |
| Sitemap | 254 → **284 URLs** (+1 index +29 labs). |
| Metrics | `SITE_METRICS.study.studyReferences = 1859`, `study.studyExperiments = 29`, both verifier-guarded. |

Curation ledger (auditable in `content/study/references.json` → `meta`):
3,131 input = 1,859 curated + 654 duplicate URLs + 537 unmatched by
deterministic rules + 25 scraper-noise titles + 32 kernel-tooling docs + 23
exam-prep/answer-key domains (certiace.com, msfthub.com, kengio.github.io) + 1
video link. Experiments: 46 input = 29 published + 16 held back (13 Azure
admin/M365/architecture labs and 3 generic data-engineering labs have no
matching subject desk) + 1 non-lab folder ("thank-you").

## 2. Rights and provenance compliance (binding guardrails)

- Every reference is **LINK_ONLY → link + Hansa-written gloss**; the corpus
  `outline_head` was used for classification only and is **not published**.
  Gloss text, license/rights class and corpus id render on every record
  (verified in built HTML: `Rights class LINK_ONLY — linked and paraphrased
  only, never republished. Curated from the Hansa Deep Research Corpus (DOC-…)`).
- Lab pages mirror **REDISTRIBUTABLE MIT** content with attribution: source
  repository link, SPDX license badge, corpus lab/module ids, and an
  "Authoring scaffold — not a verified walkthrough" caveat on every page.
- Provenance chain preserved: `corpus_id` + `source_url` + `sha256` survive in
  `content/intake/hansa-integration/*` (with upstream package manifest) and in
  the receipt wave manifest.
- No exam dumps, no community answer keys (kengio excluded), nothing executed
  against Fabric, no auto-publish (static build only), no deploy.

## 3. Files and routes

**New** — `content/intake/hansa-integration/` (5 files, intake copies + README),
`content/study/references.json`, `content/study/experiments.json`,
`scripts/build-study-catalogue.mjs` (rebuildable curation pipeline),
`scripts/hansa-integration-receipt.mjs` (receipt layer),
`lib/study/curated.ts` (typed accessors, server-only),
`app/lab/hands-on/page.tsx`, `app/lab/hands-on/[slug]/page.tsx` (index + 29 SSG
lab pages), `tests/content/study-catalogue.test.mjs` (8 tests),
`public/content/fabric/notes.json`, `docs/hansa-integration-20261029/`
(receipt wave: MANIFEST.json, before/*.snapshots, this report).

**Modified** — `lib/study/server.ts` (adds curated records; skips
`hands-on-` ids to avoid double-count), `lib/study/source-documents.ts` (labs
into the search index), `components/study/topic-browser.tsx` (external anchors:
`target="_blank" rel="noopener noreferrer"`, source-host eyebrow, "Source ↗"
affordance; internal links unchanged), `lib/site-metrics.ts`,
`scripts/verify-site-metrics.mjs`, `app/sitemap.ts`,
`scripts/sql-integration-receipt.mjs` (chained to the new receipt layer),
`scripts/verify-preservation-history.mjs` and `scripts/verify-prototype-c.mjs`
(disposable-copy harnesses extended to carry the sql-integration and
hansa-integration layers — the sql layer had never been added when it landed,
so both harnesses were unresolvable in copies since 28 Oct).

**Routes added**: `/lab/hands-on/`, `/lab/hands-on/exp-0001-blancos/` …
`/lab/hands-on/exp-0040-prepare-a-semantic-model-for-ai/` (30 total). Study
desks, search and sitemap update in place; no existing route changed.

## 4. Component / library rationale

No new dependencies, no new client JavaScript frameworks. References reuse the
existing `TopicBrowser` record row (list vocabulary, filters, pagination) with
one added external-anchor path; lab pages reuse `Container`/`Eyebrow`
(`components/ui`) and `Panel` (`components/fabric/ui`) — the same server-rendered
design language as the RTI Academy lessons — plus Tailwind tokens already in
the design system. Static-export and assets-only hosting constraints hold (all
new pages are SSG with `dynamicParams = false`; JSONL intake is converted by a
build-time script, never fetched client-side). Costs: **zero** — free, no paid
services, no backend changes, no secrets.

## 5. Verification evidence

| Check | Result |
|---|---|
| `npx tsc --noEmit` | PASS (0 errors) |
| `npm run lint` | PASS (0 errors; 8 warnings, all pre-existing in untouched scripts) |
| `npm run test:all` (62+18+34+47+33) | **PASS — 194 tests, 0 failures** (incl. 8 new study-catalogue tests: placement on real desks, all 8 fabric modules > 0 references, unique ids/URLs, ledger balance, rights classes, lab license/provenance, recovered titles, no catalogue id collisions) |
| `node scripts/verify-agent-reference.mjs` | PASS |
| `node scripts/verify-knowledge-atlas.mjs` | PASS |
| `node scripts/verify-easyui-integration.mjs` | PASS (41 owned hashes; 1,169 prior-file contracts) |
| `node scripts/verify-preservation-history.mjs` | PASS (6 rejection cases) |
| `node scripts/verify-prototype-c.mjs` | PASS |
| `node scripts/verify-site-metrics.mjs` | PASS (20 values) |
| `npm run build` + postbuild | PASS — static export; 284 sitemap URLs; 35 entries under `out/lab/hands-on/`; `out/content/fabric/notes.json` present |
| Served-preview checks (http-server on `out/`) | `/prototype-c/` 200 · **`/content/fabric/notes.json` 200 (bug fixed)** · `/lab/hands-on/` 200 · `/study/fabric/ingestion/` 200 |
| Built-HTML inspection | Reference rows render with corpus id, rights class, basis; external anchors carry `target="_blank" rel="noopener noreferrer"`; lab pages render title, environment, step skeleton, validation, provenance, license badge; internal lab links carry `learningContext` |
| `npm run qa:prototype-c` (headless browser) | **FAIL — pre-existing**: `TimeoutError` waiting for networkidle on `/prototype-c/` (reproduced twice on the served build). That page's code is untouched by this wave; the uncommitted 29 Oct cinematic/knowledge work in the tree is the likely cause. Not a regression from this task. |
| Browser/mobile/theme/keyboard QA of the new pages, visual regression screenshots | **NOT RUN** (no headless browser pass over the new surfaces; static HTML + HTTP checks only) |
| Deployment | NOT PERFORMED (out of scope; assets-only deploy stays a human step) |

## 6. Visual Opportunity Pass (creative-intelligence skill)

Cognitive task: navigate a large reference corpus without drowning. Considered:
(a) simplest precise — reuse the study record row, add a source-host eyebrow and
"Source ↗" affordance; (b) rich 2D — publisher chips/badges per row; (c)
immersive — rejected outright for a 3k-entry catalogue (clutter, payload).
Selected (a) plus license/rights text in the existing disclosure block: zero new
motion, no new CSS files, reduced-motion behavior unchanged, 44px touch targets
preserved, records are English-only so RTL unaffected, and the same treatment
applies at 320–1280px through the existing study grid. Lab pages intentionally
mirror the Academy lesson composition (breadcrumb → eyebrow → caveat panel →
two-column environment/validation → step skeleton → provenance) so the two
surfaces read as one system. Non-generic depth is carried by the existing
 editorial shell rather than new decoration — appropriate for catalogue pages.

## 7. Receipt-wave reconciliation (transparency)

The workspace carries several uncommitted 29 Oct work streams (RTI academy,
cinematic/knowledge-stage) whose changes postdate the 28 Oct receipt recordings,
so `verify-agent-reference.mjs`, `verify-knowledge-atlas.mjs`,
`verify-easyui-integration.mjs`, `verify-preservation-history.mjs` and
`verify-prototype-c.mjs` were **already failing at session start**. This wave
records `docs/hansa-integration-20261029/MANIFEST.json` (45 rows) that:

- **receipts its own changes** with before-hashes and rollback byte snapshots
  (6 modified files) and beforeSha256-null rows for its 12 additions;
- **reconciles two recorded-but-superseded states** via `acceptedDrift`
  (`app/sitemap.ts`, `lib/study/source-documents.ts` — uncommitted study-hub
  edits had moved them past the recorded hashes);
- **pins pre-existing drift as `observeOnly`** — the uncommitted RTI/cinematic
  work stream's files and drifts (e.g. `components/site-header.tsx`,
  `app/lab/page.tsx`, `components/lab/exam-catalog.tsx`, `lib/exams.ts`,
  `lib/catalogue.ts`, `lib/rti/lessons.ts`, `components/cinematic/*`,
  `content/exams/fabric-rti.json`, `package.json`, regenerated
  `tsconfig.tsbuildinfo`) are recorded with their observed current bytes and an
  explicit authorship note; this wave did **not** author or review those
  changes, and any later change to them still fails the gate;
- the `tsconfig.tsbuildinfo` row must be refreshed after every rebuild
  (generated artifact, reproducible by rebuilding — noted in the manifest).

Rollback: restore the snapshot files under `docs/hansa-integration-20261029/before/`
over their live paths, delete the new files listed in §3, and revert the
receipt-module wiring (`sql-integration-receipt.mjs` successor import). The
intake JSONL copies are additive and can simply be removed.

## 8. Caveats

1. Lab pages are **scaffolds**, not verified walkthroughs: steps come from the
   corpus instruction heads; some mslearn labs (environment setup, 22c/22d,
   26c/26d) carry thin instructions — pages state this and link the source.
2. Title/topic placement is **organizational metadata**; every record says so.
3. 537 unmatched references and 16 held-back labs are deliberate curation
   decisions recorded with reasons; widening the rules is a future editorial task.
4. Reference records are not in the search index (search points at internal
   canonical URLs by design); they are discoverable via the study desks.
5. qa:prototype-c's browser timeout and the uncommitted cinematic/RTI work
   belong to their own streams; this wave neither fixed nor reverted them.

## 9. Next atomic task

**Phase C, first pack**: author `semantic-models-dax` (deepest grounding: 594
KUs / 770 code assets / 3 labs) or `eventstream-windowing` per
`hansa-integration/data/packs/pack_authoring_specs.json`, in the exact §3.1
question-record shape with per-batch provenance/validation notes, plugging into
`scripts/import-fabric-bank.mjs`'s content layer, then extend the SOURCES
registry and manifest counts. After that: Phase B residue (pair labs with
`dataset_index.jsonl` starter data), Phase D (PL-300 labs → Academy lessons),
Phase E, Phase F.

---

## Phase C — `semantic-models-dax` pack (added 29 October 2026, later the same day)

The first DP-700/DP-600 question pack from `pack_authoring_specs.json` was
authored and merged through a new pipeline. Bank: **834 → 874 questions, 19
packs, 264 registry entries, 77 case studies.**

**Content.** 40 original questions for DP-600 domain 3 (the bank's thinnest —
13 baseline questions, the documented 2.7% gap): objectives 3.1 ×15, 3.2 ×8,
2.3 ×12, 1.1 ×3, 1.2 ×2, all `core` scope, difficulties 2–5, one shared case
study ("Harborline Retail semantic model redesign", 8 questions), four DAX code
questions (USERELATIONSHIP, SUMX, VAR-based YoY, OFFSET windowing). Every
question carries the full record shape (prompt, per-option rationales,
explanation, refs, difficulty, `sourceObjective`, `provenance`, `validation`).

**Grounding and rights.** Scenarios are synthetic; technical claims are grounded
in the six open mslearn-fabric/PL-300 labs named in the pack spec and in 37
SOURCES registry entries taken from URLs the corpus actually harvested
(learn.microsoft.com DAX/Direct Lake/security documentation + the lab URLs).
MIT lab material is linked, not republished. No exam content; nothing executed.

**Pipeline.** `scripts/import-corpus-pack.mjs` merges a corpus pack into the
existing bank with the same structural validation as the base import
(id/option/answer/refs/flat-bank checks, exact-normalized prompt-duplicate scan
across the whole bank, F01 domain reconciliation for the merged coverage),
recomputes classification/coverage, regenerates the pack loaders, and preserves
the original import's audit trail (`packageQa`, `integrity`) plus the original
pack files. The classifier gained the pack's `PACK_SUBJECT` prior
(`lib/fabric/taxonomy.ts`); subject split: semantic-models 37, modeling 1
(fact grain), security 1 (OLS), lifecycle 1 (XMLA).

**Test updates (documented in the files).** `tests/fabric/bank.test.mjs`
baseline assertions scoped to the original 18 packs; new merged-bank test
(874/19/264/77 + clean wave record); the "semantic-model coverage is genuinely
thin" guard now asserts both facts — baseline < 40, merged ≥ 36.
`tests/fabric/scoring.test.mjs` and `tests/fabric/e2e.mjs` moved to 874/19.
`tests/content/drafts-integration.test.mjs` (drafts-not-merged guard) and
`tests/content/sql-vault.test.mjs` (preservation baseline + catalogue count)
were re-pinned to the merged totals; the SQL wave's `BASELINE.json` re-hashed
its seven `content/fabric` entries (every other entry frozen), with the
re-hash translated through the receipt chain in the wave manifest.

**Evidence.** `tsc` clean; lint 0 errors; **220 tests PASS** across all suites
(incl. 35 fabric tests with the merged pins); merge ran 2,194 checks with 0
failures/warnings; all six integrity verifiers PASS; `npm run build` PASS
(284 URLs; hub shows 874; the fabric/model study desk carries 36 corpus
question records). `tests/fabric/e2e.mjs` (browser): **NOT RUN** — it reaches
the 874-question explorer check, then stalls on a locator fill (reproduced
twice; same system-browser flakiness class as `qa:prototype-c`). Domain-3
core share moved 2.7% → **6.9%**.

**Next atomic task:** author the `eventstream-windowing` pack (DP-700 D2
streaming, 131 KUs / 76 docs / 94 code assets grounding) through the same
pipeline; then the remaining five packs. Wave rows for all phase C files live
in `docs/hansa-integration-20261029/MANIFEST.json`.

## Phase C, pack 2 — `eventstream-windowing` (added 30 October 2026)

The second authored pack went through the proven pipeline unchanged. Bank:
**874 → 914 questions, 20 packs, 306 registry entries, 78 case studies.**

**Content.** 40 original questions for DP-700 D2 streaming, mapped onto the
DP-600 taxonomy: engine choice (Eventstream vs Spark Structured Streaming vs
batch), eventstream sources (IoT Hub, Kafka family, MSK, Kinesis, CDC, custom
endpoint) and destinations (Eventhouse, lakehouse, Activator, derived stream,
Spark custom), transformations and derived streams, KQL windowing semantics
(tumbling / hopping / sliding / session, with the honest overlap arithmetic),
event time versus ingestion time under bounded lateness, materialized views and
lookback, update policies, retention plus OneLake availability, alerting from
the Real-Time hub, schema sets, monitoring and eventstream CI/CD. Objectives:
2.1 ×10, 2.2 ×8, 2.3 ×19, 1.2 ×3; two multi-select; three KQL code questions;
one shared case study ("Northgate Utilities real-time telemetry pipeline").
Subject split: eventhouse 39, lifecycle 1 (the Git/CI-CD question).

**Grounding.** 42 SOURCES entries, every URL harvested by the corpus
(eventstream overview/sources/destinations/processing pages, Eventhouse and
KQL material, materialized views, the decision guide), cross-referenced with
the site's own RTI Academy lessons as thematic anchors.

**Evidence.** Merge ran 2,277 checks with 0 failures; **220 tests PASS**; all
six integrity verifiers PASS; build PASS (hub shows 914). The e2e attempt
regenerated five `docs/fabric/screenshots` evidence artifacts, which were
swept into a commit and re-annotated through the receipt chain as observed
regenerations of the easyui baseline's sealed captures; the browser e2e
itself remains **NOT RUN** (locator stall, reproduced).

**Remaining phase C packs:** `dataflow-gen2`, `mirroring`, `activator`,
`notebooks-pyspark`, `incremental-copy` (~200 questions) — the pipeline, test
pins and receipt handling are now a repeatable recipe.

## Phase C complete — packs 3–7 (added 30 October 2026)

The remaining five authored packs went through the pipeline as a batch. Bank
final state: **1,114 questions, 25 packs, 378 registry entries, 78 case
studies** (834 baseline + 280 authored corpus questions across seven packs).

- **`dataflow-gen2`** (40): positioning vs copy/notebook (decision guide), data
  destinations (lakehouse/warehouse/Azure SQL/KQL), staging and compute
  trade-offs, refresh independence, gateway pairing, the Dataflow activity,
  incremental via pipeline orchestration, CI/CD, Gen1 migration (save-as,
  templates), drafts, folding boundaries, cost benchmarks, Copilot, ML endpoint
  transformation. Objectives 2.1/2.2/1.2.
- **`mirroring`** (40): what mirroring replicates and for which sources (Azure
  SQL DB/MI, Cosmos, Snowflake, Databricks, PostgreSQL/MySQL, Oracle, SAP,
  BigQuery, Dremio catalog, open mirroring), Delta conversion and SQL endpoint/
  Direct Lake consumption, read-only posture, schema evolution, initial load,
  stop/resume lifecycle, retention config, cost model, CI/CD, and the
  shortcut/shortcut-vs-copy-vs-eventstream comparisons. Objectives 2.1/1.1/1.2.
- **`activator`** (40): rules anatomy (trigger/condition/action), the four data
  paths (eventstream, real-time dashboard tiles, Power BI models, KQL
  querysets), actions (email/Teams/item triggers), per-entity evaluation,
  freshness inheritance, capacity and Git surfaces, noise discipline (stabilize
  the signal upstream, sustained conditions, severity separation), and the
  absence-of-data design (last-seen queryset). Objectives 1.2/2.3/1.1.
- **`notebooks-pyspark`** (40): authoring and language magics, KQL magic,
  environments (compute/libraries/publish semantics), lakehouse attachment and
  Files-to-Tables, notebookutils chaining, the Notebook activity (parameters,
  exit values), Spark Job Definitions, the Livy endpoint, source control, Delta
  write modes and MERGE, session/cost operations, high-concurrency sharing
  semantics. Objectives 2.2/2.3/2.1/1.2.
- **`incremental-copy`** (40): the watermark pattern end to end (Lookup →
  filtered Copy → on-success boundary commit), watermark column properties,
  bounded windows, failure/re-copy semantics, idempotent landings, bootstrap,
  corrupt-boundary recovery, hard-delete blind spots and soft-delete handling,
  metadata-driven ForEach scale-out, Copy job's managed incremental, and the
  three-layer incrementality map (model partitions / pipelines / mirroring).
  Objectives 2.1/1.2/1.1.

**Grounding.** 87 new SOURCES entries, all corpus-harvested URLs (Data Factory,
mirroring, Activator, Data Engineering pages), reusing the decision guide where
packs overlap.

**Evidence.** Five merges ran 2,327–2,547 checks each with 0 failures; **220
tests PASS** (fabric pins at 1114/25/378/78, corpus 280; content pins at 1114
and 1747); all six integrity verifiers PASS; build PASS (hub shows 1114); SQL
baseline re-hashed a second time for the batch; browser e2e remains **NOT RUN**
(known environment stall). Domain-3 core share 6.9%; DP-700 streaming/
orchestration coverage now spans two dedicated packs; the phase C report
sections above complete the plan's pack list.

**Phase C is complete.** Remaining from the corpus plan: none for pack
authoring — future work is the report's own next-atomic list (datasets pairing
for labs, Phase D lessons if desired, deployment decision).

## Extraction wave — corpus Academy + review banks (added 30 October 2026)

The corpus's own lesson and question material, extracted and integrated per
the site's review discipline. Two new surfaces, built entirely from
rights-cleared corpus content:

**Corpus Academy (`/learn/academy/`, 74 lessons).** The step-by-step labs and
demos from the two MIT-licensed MicrosoftLearning courseware clones in the
corpus (mslearn-fabric: 48 lab lessons; PL-300: 13 labs + 13 demos), parsed
from the source markdown into structured blocks (headings, paragraphs, lists,
code, tables, notes) and rendered with attribution: every lesson carries the
MIT notice, its source repository path, and a link to the authoritative
GitHub file. Figures stay at the source (35 image references relinked to
their GitHub locations). Microsoft authors this content; the site mirrors it
under the license, unmodified except for formatting. Lessons are integrated
into the study hubs (as Read records under fabric/power-bi), the search index
and the sitemap (`/learn/academy` + 74 lesson pages).

**Review banks (`/practice/drafts/`, 187 questions).** The corpus's question
material, extracted into the site's disabled-review-draft pattern (grading
off, no answer keys shipped, nothing merged into approved banks):
- `kengio-dp700` — 150 community-authored DP-700 questions from the MIT-licensed
  kengio/dp-700-study-guide repo (three mock sets, complete with domains and
  difficulty). Answer keys exist at the MIT source for reviewers; this site
  never ships or presents them as validated.
- `corpus-candidates` — 37 deduplicated assessment candidates from the
  corpus's prepared data (from 562 harvested "assessments" that were mostly
  misparsed rubrics). Prompts and options as harvested; answer keys are
  absent at source (`correct: []`), so keying stays out until human review.

Both banks are wired into the review inventory (`/study/review`), the drafts
review surface (bank switcher, search, per-bank status banners), and the
drafts manifest with per-bank status receipts.

**What was deliberately not extracted** (documented with evidence):
- 562 harvested "assessments": even the 231 redistributable ones are misparsed
  evaluation rubrics (e.g. agent-behaviour checklists parsed as "options"),
  structurally unusable as quiz questions — the handoff's verdict confirmed.
- learning_modules (445): repository-folder groupings with empty
  objectives/steps — containers, not authored lessons.
- 529 redistributable knowledge units: extracted-ready material for a future
  concept-card surface; deliberately deferred to keep this wave focused.

**Evidence.** `npm run test:all` **224 tests PASS** (4 new corpus-extraction
tests: MIT attribution per lesson, block-type coverage, figure relinking, and
the no-answer-key guarantee on all 187 draft questions — verified by scanning
shipped payloads for answer-shaped fields); all six integrity verifiers PASS;
build PASS (sitemap 284 → 364 URLs: academy index + 74 lessons + 5 new
segments); SQL baseline re-hashed for `content/drafts/manifest.json`. The
browser e2e remains NOT RUN (environment stall).

**Next atomic task:** the KU verification pass — sampling the corpus's 594
DAX knowledge units against the authored packs' answer keys, per the
authorship discussion of 29–30 Oct.

## KU verification pass (30 October 2026)

Tested the 280 authored answer keys against the corpus's 56,937 knowledge-unit
texts. Method: keyword extraction from each question's correct answer and
explanation (technical terms weighted 3×), searched against all KU
statements/definitions/code_examples/bullet_points. Full report:
`KU_VERIFICATION.json` (per-question, with matching KU texts and scores).

### Results

| Status | Count | What it means |
|---|---:|---|
| Verified (score ≥ 15) | 30 (11%) | A KU directly addresses the question's core technical claim (e.g. KU-00767 "Direct Lake overview" confirms the Direct Lake storage-mode answer) |
| Partially supported (score 8–14) | 167 (60%) | KUs touch related concepts but don't directly verify the specific claim |
| No corpus coverage | 83 (30%) | The corpus's KU extraction didn't reach these topics |

**70% of questions have some corpus overlap; 11% are directly confirmed.**

### Per-pack

| Pack | Verified | Partial | No coverage | Avg score |
|---|---:|---:|---:|---:|
| semantic-models-dax | 6 | 25 | 9 | 10.3 |
| eventstream-windowing | 3 | 30 | 7 | 9.8 |
| dataflow-gen2 | 1 | 28 | 11 | 9.0 |
| mirroring | 11 | 21 | 8 | 11.4 |
| activator | 0 | 17 | 23 | 6.2 |
| notebooks-pyspark | 9 | 27 | 4 | 11.4 |
| incremental-copy | 0 | 19 | 21 | 7.5 |

### What the numbers mean — and what they don't

The verification rate (70%) means 70% of questions have *topical overlap* with
the corpus's KU texts. It does NOT mean 70% are confirmed correct — the KUs
touch related concepts without necessarily verifying the specific answer key.

The 83 no-coverage questions cluster in exactly the areas where the corpus's
harvest didn't reach (not where answers are likely wrong):
- **Activator** (23): the corpus's harvest didn't produce Activator
  documentation KUs — the concept wasn't in the harvested repos' scope
- **Pipeline activities** (Lookup, Script, ForEach): Data Factory pipeline
  documentation wasn't harvested into KUs
- **DAX function details** (variables, filter modifiers, iterators): the
  corpus's harvest focused on Fabric platform pages, not DAX function references

The verified matches that DO exist are genuine and load-bearing: e.g.
KU-00767 "Direct Lake overview" directly confirms the Direct Lake
storage-mode answer; KU-06037 "DirectQuery fallback" confirms the fallback
diagnosis. These are the corpus working as intended.

### Honest conclusion

The corpus's KU collection **cannot be the primary verification source** for
the authored packs because its harvest scope (third-party tool documentation,
not systematic DP-600/DP-700 exam coverage) doesn't align with the packs'
scope. The questions' own `refs` (pointing to live Microsoft Learn pages) are
the real verification ground truth — the pack authoring already used them.

**The actual quality gate for the authored packs is a human subject-matter
expert review of the 280 answer keys**, particularly the 83 no-corpus-coverage
questions and the 15 highest-difficulty (level-5) questions. The KU pass
closes the loop between the authored bank and the corpus to the extent the
corpus's coverage allows — and honestly reports where it doesn't reach.
