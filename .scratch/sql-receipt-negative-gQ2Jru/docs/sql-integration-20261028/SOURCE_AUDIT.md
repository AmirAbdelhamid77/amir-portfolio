# SQL vault integration — 28 October 2026

## Inspected scope

Connected Notion vault: https://app.notion.com/p/4063906c5d6c814d9c38e19fc5418891

Canonical authority: https://app.notion.com/p/3d03906c5d6c81cc8a81dd9c8041e478 and its SQL Learning Path. The live root and path confirm a single 00–17 syllabus; the engineering tail is 14 Transactions, 15 Design, 16 Performance, 17 DWH/BI. Exported historical intermediate guides disagree with that numbering and cannot replace the current path.

Downloaded all ten attached JSON exports and four source figures. `SOURCE_COVERAGE.json` accounts for 85 exported entries representing 76 unique Notion IDs. Nine entries repeat IDs from the preliminary export. Raw exports remain immutable in `intake/sql-notion-2026-10-28/`; only normalized selected bodies are rendered.

53 source pages receive local destinations: 18 canonical modules, eight window chapters, nine PostgreSQL sources, eight deep companions, five interview/recipe sources and five supporting navigation/crosswalk sources. The remaining 23 unique pages are archives, duplicates, historical syllabuses, internals or audit administration. They remain preserved outside the teaching registry. Every exported entry has a destination or an explicit exclusion/supersession reason.

Source body, code fences, tables, figures and Arabic/English text were extracted. This is complete entry accounting and source preservation, **not a claim of complete independent scientific review**. Detailed review concentrated on canonical reasoning, source ownership, interview questions and detected errors. Supporting chapters were structurally inspected and selectively reviewed; every engine-specific example has not been executed. No MovieNow source database was supplied, so its reported numerical results cannot be reproduced here.

## Existing website inspected

Next.js 16.4.3 / React 19.3, static export with trailing slashes and assets-only hosting. Existing topic-led architecture is `Subject → topic → read / experiment / question / reference`. Eight subject identities remain. SQL already existed with an overview desk and a ten-question analyst exam. `lib/study/server.ts`, `source-documents.ts`, `learning-path.ts`, `topic-review.ts`, search projection, sitemap, original exam bank, lesson/topic rendering, local design tokens, source block renderers, package/configuration and relevant tests were inspected.

There was extensive pre-existing dirty work. Six integration files were captured before editing; the RTI page and preservation-receipt adapter were captured before their necessary later edits. `BASELINE.json` records all 55 original content JSON files. None was rewritten.

## Destination rules

| Material | Local home | Rule |
| --- | --- | --- |
| Canonical 00–17 | `/learn/sql/00/` through `/learn/sql/17/` | One canonical owner per module; exact source order |
| Supporting sources | `/learn/sql/reference/<notion-id>/` | Explicit role, not another syllabus |
| Open-response Q forms | `/practice/sql/#sql-source-...` | 16 source prompts and responses; unscored |
| Existing SQL bank | `/lab/sql/?question=sql-01` etc. | All ten IDs mapped to canonical concepts; answers/engine/progress preserved |
| Subject/topic discovery | `/study/sql/`, 21 SQL desks and `/study/sql/path/` | Existing subject expanded; no new top-level subject |
| Exam | `/lab/sql/` | Existing ten-question bank and mock retained; no invented scored source answers |
| Archives/internals | Source coverage ledger only | Preserved, excluded from teaching and search |

The 16 extracted questions use explicit `Q:` or numbered `Q0…Q6` source forms. Other interview exercises, coding scenarios and follow-up lists remain in their complete supporting reference pages; this receipt does not claim that every interrogative sentence became a standalone graded question.

## Qualifications surfaced in the UI

- PostgreSQL DATE minus DATE yields integer days, whereas TIMESTAMP minus TIMESTAMP yields an interval. Module 10 conflates the cases. Verified against PostgreSQL's current date/time operator documentation.
- The interview segment-average query never projects/derives `segment` in its first CTE. The original remains intact with a visible defect notice.
- Module 17's closing reference to Database Design as Module 16 is historical; current ownership is Module 15.
- A LEFT JOIN loses unmatched rows under a **null-rejecting** right-side WHERE predicate; a predicate such as `IS NULL` is a different case.
- Missing recorded periods require collection-completeness assumptions before interpreting them as zero activity.
- ROLLUP subtotal placeholders require `GROUPING()` to distinguish them from genuine NULLs.
- MovieNow's 333 rentals, 50 films and mean 7.9 are explicitly reported source results, not reproduced observations.

## Preservation boundaries

All old content, routes, exam IDs, keys, rationales and persistence namespaces remain. The new self-check page has temporary scratch text only. No learner data or code is sent to Notion or another service. No package, database, paid component, runtime API, analytics or backend was added. No deployment was performed.
