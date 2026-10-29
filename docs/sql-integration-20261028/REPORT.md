# Hansa SQL integration — local implementation

The named Notion vault has been ingested into the current Hansa website checkout. No production deployment was performed.

## Result and hierarchy

- One canonical SQL learning path, modules **00–17**, at `/learn/sql/`.
- **53 local source pages**: 18 canonical modules and 35 supporting sources, including eight window chapters and nine PostgreSQL references.
- **16 open-response source self-checks** at `/practice/sql/`, with preserved source responses and explicit unscored behavior.
- All **10 existing SQL exam questions** mapped by stable ID to the appropriate canonical concepts. The existing `/lab/sql/` bank and mock retain their keys, grading and saved-progress behavior.
- The existing SQL subject now has **21 topic desks**. Subject/topic discovery, the learning sequence, site search, contextual orientation and sitemap share these destinations. No new top-level subject or competing syllabus was introduced.
- Archives, duplicates, historical syllabuses and administration remain preserved outside teaching/search navigation.

`SOURCE_COVERAGE.json` accounts for all **85 export entries / 76 unique Notion IDs**. Nine entries repeat preliminary-export IDs. Each entry has a mapped destination or a documented preservation/exclusion status. All ten raw exports and four original source figures are retained.

## Implementation

| Area | Affected files/routes |
| --- | --- |
| Content import | `scripts/import-sql-vault.mjs`, `intake/sql-notion-2026-10-28/`, `content/sql/{vault,index}.json` |
| SQL rendering | `components/sql/`, `lib/sql/`, `/learn/sql/`, `/learn/sql/00/`–`17/`, `/learn/sql/reference/<id>/`, `/practice/sql/` |
| Existing discovery | `lib/study/{taxonomy,topic-review,server,source-documents,learning-path}.ts`, `components/study/orientation.tsx`, `app/sitemap.ts` |
| Preservation | `scripts/sql-integration-receipt.mjs`, the additive adapter in `scripts/path-review-receipt.mjs`, this task's `MANIFEST.json` and starting snapshots |
| Verification | `tests/content/sql-vault.test.mjs`, `scripts/qa-sql-vault.mjs`, `scripts/verify-sql-integration.mjs` |
| Necessary compile correction | One structural type annotation on the existing RTI page's heterogeneous source-evidence records; no RTI content or behavior was changed |

The SQL renderer safely escapes imported content and preserves code, tables, bilingual text, source links and diagram notation. It reuses the site's tokens and study architecture, native disclosures/buttons, and Next Image. No package or specialist chart engine was installed. The JOIN grain lens uses the source's fixed illustrative fixture and deterministic local mathematics; independent SQL checks confirm its outputs. It does not impersonate a SQL execution engine.

`CONTENT_BRIEF.yaml` and `VISUAL_DECISIONS.md` record the learning objectives, misconceptions, source roles, alternatives, interaction contract and weighted representation choice. Editorial sequence rows and a row-grain table were preferred over another card catalogue or an unreviewed concept graph.

## Verification evidence

| Check | Status | Evidence / limit |
| --- | --- | --- |
| Original content preservation | PASS | All 55 pre-existing content JSON files retain their starting SHA-256 hashes; exam IDs and answers remain byte-identical |
| Source mapping and code/media preservation | PASS | SQL content tests and `SOURCE_COVERAGE.json`; every entry accounted for |
| Content tests | PASS | 39 tests; `content-tests.log` |
| Visualization/Fabric regression tests | PASS | 96 tests; `regression-tests.log` |
| TypeScript | PASS | `typecheck.log`; actual production build also runs TypeScript |
| Scoped runtime lint | PASS | `lint.log` |
| Configured production static export | PASS | `build-production.log`, Turbopack with the configured Tailwind loader; 264 generated pages |
| Static segment aliases | PASS | `segment-aliases.log`; the existing postbuild alias script is run after the native build |
| JOIN and corrected window math | PASS | Two independent SQLite fixture calculations in the SQL tests; this does not certify PostgreSQL-only syntax |
| Browser matrix | PASS | **352/352 checks**; 320/390/768/1280px, both themes, reduced motion, axe, keyboard/reveal/reset, progress sentinels, route and anchor checks. `qa/results.json`, `qa-final.log`, `QA_SUMMARY.json` |
| SQL preservation receipt | PASS | Exact current hashes, predecessor binding, rollback hashes and a negative mutation control; `node scripts/verify-sql-integration.mjs` |
| Global historical reference/Atlas/EasyUI verifiers | FAIL | After the SQL successor is bound, all three expose unrelated dirty-file drift in `components/knowledge/insight-stage.tsx`. Expected `cf171ee…`; actual `af35c5c…`. This task does not rewrite or whitelist that file |
| Full engine-by-engine SQL scientific review | NOT RUN | Source preservation and selected corrections are not independent execution of every imported example |
| Screen reader / physical-device audit | NOT RUN | Automated axe and emulated touch do not certify WCAG conformance |
| Full timed exam refresh/resume regression | NOT RUN | Original engines were not modified; browser storage sentinels were checked |
| Field performance / Core Web Vitals | NOT RUN | No field measurement or before/after performance claim |
| Production deployment | NOT RUN | Local implementation and static export only |

The restricted shell initially failed network/permission checks. A webpack fallback compiled but omitted the project's Turbopack-only utility-CSS processing and was rejected after visual inspection. The final accepted build uses the actual configured Turbopack pipeline through the native runtime. Earlier failed logs are retained; they are not the accepted artifact's evidence.

## Content qualifications

Visible source notices address the undefined `segment` column in an interview query, PostgreSQL date/date versus timestamp/timestamp subtraction, the wrongly bracketed window-frame image, historical module numbering, null-rejecting LEFT JOIN predicates, completeness assumptions for missing periods, and ROLLUP placeholders. The original snippets/figure remain preserved. MovieNow's reported totals are labelled unreproduced because its database was not supplied.

Complete entry accounting is not a claim of perfect scientific review. Detailed review focused on canonical reasoning, ownership, explicit question forms and discovered errors; supporting references were structurally inspected and selectively reviewed. Coding scenarios, interview follow-up lists and other question forms remain readable in their full source references; they were not automatically converted into invented scored answers.

## Costs, rollback and next task

Added packages: **none**. Added paid services or backends: **none**. Added learner-data transfers: **none**. Existing static hosting configuration is unchanged.

For rollback, inspect this task's `MANIFEST.json`, confirm each current after-hash, restore the matching `before/` snapshots and remove only newly introduced owned files. Preserve unrelated/later edits; do not reset the checkout. The manifest chains onto the immutable prior learning-path receipt. Rebuild normally after rollback.

Next atomic task: execute the PostgreSQL companion examples against explicit fixture schemas, starting with the known segment-average defect, and record corrected examples plus counterexamples. Separately reconcile the unrelated insight-stage historical receipt before any release that depends on the global preservation gates.
