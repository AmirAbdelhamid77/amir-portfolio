# Content Recovery & Integration Report — 2026-11-09

Mission: recover, preserve, integrate and make discoverable all recoverable
project content under the owner's publication policy of 2026-11-09: completed
work is no longer hidden for want of an editorial gate; every item carries its
real status; restricted bytes stay in authorized storage.

Baseline: `main` @ `b59c008` (`release-1.0.0`). Branch: `feat/content-recovery`.

## 1. Recovery inventory and dispositions

| Collection | Original location | Recovered | Count | Duplicates | Publication destination | Status shown | Rights / privacy | Backlog |
|---|---|---|---|---|---|---|---|---|
| Daily-insight authoring bank | `docs/daily-insight-bank-20261106/INSIGHT_BANK.json` (already committed; master roll-up of batches 45+76+150+174 and their archives) | in repo | **400 unique** (397 Arabic drafts, 3 English technical-review; scientificallyVerified=false ×400) | archives overlap; master is the deduplicated set | `/insight-records/` | Draft — unverified / Technical review (verbatim) | none; author-owned | factual + Arabic language QA |
| Atlas resource records | `content/atlas/fabric-extension.json` (committed) | in repo | **1,057 awaiting-review** | — | `/atlas-records/` (links to the published articles) | mapping awaiting review; no semantic edges drawn | none | concept-mapping review |
| Held Fabric articles | `fabric-corpus-build/compiler-output/dependency-manifest.json` (outside the repo — **recovered** to `content/recovery/dependency-manifest.json`) | recovered | **79 dependency-held articles** (307 held includes: powerquery 276, kusto 25, powerbi 4, reusable-content 2) + 2 rights-notice + 1 external = **81 total** | — | `/held-articles/` (metadata + exact holds; bytes stay in the pinned corpus) | Source dependency missing | upstream Microsoft repos not pinned here | acquire + pin upstream repos, then recompile |
| DP-600 R18 learner bank | `Hansa_DP600_R18_…/LEARNER_CANDIDATE/R18_222_QUESTIONS_IMAGEFREE_UNGRADED.json` | **recovered** to `content/recovery/r18-learner-bank.json` | **222 questions** (image-free, ungraded) | PRIVATE_QA + before/after records deliberately NOT copied | `/practice/draft-banks/` | Draft — ungraded, no answers published | owner-authored; the package's NO_GO was its own packaging verifier, not the content | scientific review re-run |
| PL-300 V88 bank | `PL300_V88_…/DATA/WORKING_BANK_1285_V88_NONFINAL.json` | **index recovered** to `content/recovery/pl300-v88-index.json` (metadata only) | **1,285 records indexed** | V83/V87 preserved originals untouched in the package | `/practice/draft-banks/` (metadata index only) | **Restricted — rights review pending** | third-party-transcript-anchored (YouTube quotes); bytes retained in authorized local storage | rights decision, then optional sanitized integration |
| Creative patterns package | `Hansa_Notion_Creative_Patterns_…/LEARNING/{lessons,modules,paths}.json` | **recovered** to `content/recovery/patterns-*.json` | **20 lessons / 6 modules** | source sections deduplicated in the package itself | `/patterns/` | Draft — unverified; cited sources attributed, no public rights inferred (package's own licence report) | owner-derived explanations published; cited excerpts stay attributed; cited binaries excluded | factual review; public-rights decision |
| Data storytelling course | `D:/BeUI/storytelling/` (24 HTML + 24 SVG, 0.7 MB) | **recovered** to `public/storytelling/` | **24 documents** | — | `/work/storytelling/` catalogue → served verbatim | Published unverified | owner-authored Notion export | editorial pass |
| DP-600/PL-300 Study Hub | `D:/BeUI/DP-600___PL-300_Study_Hub.html` | **recovered** to `public/study-hub/` | 1 self-contained app (672 KB) | — | `/study-hub/dp600-pl300-study-hub.html` + link from `/practice/draft-banks/` | Published verbatim | owner-authored | none |
| Fabric RTI lab blueprints | `Hansa_Fabric_RTI_Authentic_Source_Milestone/LAB_BLUEPRINTS.json` | **recovered** to `content/recovery/rti-lab-blueprints.json` | **18 blueprints**; the 8 KG-referenced labs now have pages | — | `/lab/rti/[lab]/` (8 static pages) | Draft — not built or validated (validation_status verbatim) | owner-authored blueprint material | build + validate the environments |
| Reference library records | repo `content/intake/hansa-integration/reference_records.jsonl` — **all 3,131 lines already committed** (verified identical to `hansa-integration/data/catalogue/reference_records.jsonl`) | verified, no copy needed | **3,131 records** (46 experiment records alongside) | — | rendered subset only — **renderer gap tracked below** | per-record LINK_ONLY etc. | none | renderer backlog (below) |
| Hansa Spatial Experience v2 | `D:/BeUI/Hansa_Spatial_Experience_v2_2026-10-27` | preserved in place (agent-skill package, Arabic, with installer — not web content) | 27 refs / 80-pattern registry / 30 briefs | — | indexed only (unified index) | Preserved — not web content | installer + private staging excluded by the package itself | n/a |
| HansaDatabase corpus (4.2 GB) | `D:/BeUI/HansaDatabase` | source of the already-integrated corpus work; deep re-walk not performed (storage constraint; previously verified) | — | — | already integrated via earlier phases | — | — | — |
| Delivery/verification packages (R18 NO_GO receipt, RTI milestone receipt, Notion receipt, PL300 receipts) | root folders | preserved in place; cited as provenance | — | — | not web content | — | contain QA/answer material — must stay private | — |

## 2. Broken Knowledge Graph destinations — all 26 resolved

- **18 visualization destinations**: the chapter nodes pointed at
  `/explore/charts/<chapter-slug>/` routes that never existed (the
  `/explore/charts/` pages are chart-type sandboxes). Fixed at the source
  (`lib/knowledge-graph/build.ts`): a chapter now opens its first declared
  lesson's real route; a chapter with no lesson route states it honestly.
  Regenerated datasets contain **0** `/explore/charts/` references.
- **8 Fabric RTI destinations**: the eight units now land on their recovered
  blueprint pages (`/lab/rti/[lab]/`, honest draft state) instead of 404s.

## 3. Answers to the mission's seven questions

1. **Discovered**: 400 insight records; 1,057 Atlas resource rows; 79+3 held
   articles; 222 R18 questions; 1,285 PL-300 records; 20 patterns lessons;
   24 storytelling documents; 18 RTI blueprints; 1 Study Hub; 3,131 reference
   records (verified already committed).
2. **Already integrated**: the 2,716-article corpus, 9,572 media files, the
   3 published editions, the 1,264-question bank, the 74 Academy lessons, the
   3,131 reference records (data layer), all Learning/Practice/Atlas surfaces.
3. **Recovered from older locations**: the dependency manifest (outside the
   repo), the R18 bank, the PL-300 index, the patterns JSONs, the RTI
   blueprints, 48 storytelling assets, the Study Hub.
4. **Now accessible through the application**: every collection above via
   `/insight-records/`, `/atlas-records/`, `/held-articles/`, `/patterns/`,
   `/practice/draft-banks/`, `/work/storytelling/`, `/lab/rti/*`,
   `/study-hub/…`, `/content-index/`, plus the two KG destination repairs.
5. **Not publicly accessible, by policy**: the PL-300 question bytes
   (third-party transcript rights), the R18 PRIVATE_QA material, the two
   rights-notice held articles' rendered content (metadata published),
   private QA packages at D:/BeUI root, Hansa Spatial v2 bytes (agent-skill
   package; indexed only).
6. **Unrecoverable from available sources**: none. Every referenced artifact
   was either recovered or already present; the 81 held articles' missing
   *includes* remain unacquired by policy (upstream repos not pinned), which
   is a dependency, not a loss.
7. **Remaining for later factual verification**: see the backlog below.

## 4. Post-publication verification backlog (priority order)

1. **Arabic drafts (397 records)** — factual accuracy + language review; they
   are published as drafts and labelled as such.
2. **PL-300 rights decision** — determine whether transcript-anchored
   questions may be published without the quoted windows; if yes, prepare a
   sanitized integration.
3. **Concept-mapping review** — the 1,057 Atlas resource records (the
   approval sidecar remains the only sanctioned path to "mapped").
4. **Held-article dependencies** — decide whether to pin the four upstream
   Microsoft repos and recompile; the 78/79 held articles then compile.
5. **RTI labs** — build and validate the eight environments from their
   blueprints; validation_status values are published verbatim and none has
   been run.
6. **Patterns package** — factual review of the 20 lessons; public-rights
   decision for the attributed source excerpts.
7. **Storytelling editorial pass** — factual review of the 24 documents.
8. **R18 scientific review re-run** — the package's review predates this
   publication.
9. **Reference renderer** — surface the remaining reference records beyond
   the reviewed subset (data fully committed; renderer work only).
10. **Sitemap enumeration** — decide whether the 2,716 doc articles should
    appear in sitemap.xml (currently hub/search discovery only).

## 5. Honest-completeness statement

Every discovered relevant collection has an explicit disposition above. No
source was left unresolved; nothing was fabricated; no review status was
upgraded; restricted bytes were not exposed.

## 6. ROADMAP — outstanding product tasks (recorded 2026-11-09, explicitly NOT implemented)

Recorded at the owner's request during the pre-cleanup backup gate. None of these are started; each is scoped elsewhere in this report.

| # | Outstanding task | Prepared source | Precise gap |
|---|---|---|---|
| R1 | Reference records renderer | content/intake/hansa-integration/reference_records.jsonl (3,131 records, committed) | content/study/references.json renders 1,859; 1,272 prepared records have no rendered surface |
| R2 | Experiment records renderer | content/intake/hansa-integration/experiment_records.jsonl (46 records) | content/study/experiments.json exposes 29 labs; 17 records unrendered |
| R3 | Hansa integration Phases C–F | hansa-integration/INTEGRATION_PLAN.md + data/ | DP-700 question pack and later phases unbuilt; 38 candidate questions prepared in hansa-integration/data/questions/candidate_pool.jsonl |
| R4 | Fabric RTI lab environments | content/recovery/rti-lab-blueprints.json (18 blueprints; 8 draft pages live) | The hands-on environments are unbuilt; every page publishes the blueprint's verbatim validation_status |
| R5 | Post-publication verification backlog | RECOVERY_REPORT §4 (10 items) | Arabic drafts QA, PL-300 rights, Atlas mappings, held-article upstream pins, patterns/storytelling/R18 review, sitemap enumeration |
