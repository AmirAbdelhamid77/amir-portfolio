# Hansa DP-600 — Website Content Conversion Pack (v1)

This **is a source-preserving conversion**, not a published website and not a claim of scientific verification of every source statement. The original book remains authoritative for layout, diagrams, tables, and code typography.

## Quick stats
- Source PDF: **67 pages**, SHA-256 `4eddfd1c4ccf092bfb02c0581aaea11878e78bad8733abe73185f427a8d02b9c`
- **88** source-linked content segments (including intros/appendices and front matter)
- **2724** extracted lines mapped (0 unmapped)
- **22** named source labs, **20** source practice stems, **30** self-check stems
- **329** original link annotations; duplicates and internal destinations retained
- **14** *proposed* interactive activity formats — designs, not implemented widgets

## What goes where
```
source/
  DP-600-Study-Guide-EN.pdf     untouched source file
  pages/page-001.txt … 067.txt raw extracted page text
  layout/page-001.json … 067.json text positions / font info for re-authoring
content/
  sections/*.md              source-text Markdown files with metadata and unique IDs
  chapters/*.md              navigation shells; avoid duplicating lesson content
data/
  chapters.json              source-order chapter navigation
  learning_path.json         recommended learning sequence (separate from source-order)
  sections.json              stable section IDs, source pages, metadata
  source_content.json        full source section text in JSON for programmatic transformation
  source_line_map.json       every extracted source line => unique segment reference
  page_index.json            page hash, line count, drawing inventory
  source_links.json          original PDF link annotations with destination URLs
  practice_questions.json    short-answer book stems only, QA pending
  self_checks.json           book self-check stems, QA pending
  hands_on_labs.json         22 listed lab names, QA pending
activities/
  blueprints.json            proposed component patterns, not content asserted as book text
qa/
  previews/page-001.webp … page-067.webp visual proof and diagram references (do not ship all to production)
  scientific_review_queue.json issues to fix before promotion
examples/
  usage.ts                   importable typed model / integration contract
```

## Suggested use in Hansa Next.js (static-export compatible)
1. **Never overwrite current DP-600 question bank**. Inventory existing IDs and deduplicate before linking.
2. Import `data/chapters.json` and `data/sections.json` into the site's build as static data. Every section ID is stable.
3. Build only **one** lesson renderer (e.g. `/learn/dp600/[chapter]/[section]`), one activity host, and one progress/review system, not copies of the same content.
4. Initially show verified, edited lessons; unverified segments should remain drafts and have a link back to the original PDF page.
5. Render visual concepts via accessible native components (SVG/Recharts/React etc. as appropriate). `qa/previews` are visual references, not substitutes for interactive graphics.
6. For local/offline progress use local browser storage. For login and cross-device progress, add a proper authenticated backend; do not pretend a static Worker asset already supplies it.
7. During editing, keep derived explanatory material in new fields separate from `source_content.json`, cite source pages, mark `scientific_qa_status`, and maintain a changelog for fixes.

## Quality and provenance guarantees
* All 67 source pages are saved, and every text line emitted by PyMuPDF was assigned to exactly one segment.
* Embedded vectors/tables are **not** guaranteed to survive as editable native objects. The original PDF and every page preview are included to verify them.
* Source text extraction is **not** byte-level identity with the PDF's internal content streams; it is a searchable representation.
* The sections are raw normalized source blocks; code tables and diagrams must be individually redesigned/reviewed, never automatically assumed accurate.
* Do not include full copyrighted pages on a public website until you confirm redistribution rights and attribution requirements.

## Deploy-safe minimal data payload
Start with `data/sections.json`, `data/learning_path.json`, edited lessons, and independently tested components. Exclude `source/layout`, `source/pdf`, and `qa/previews` from the main JavaScript bundle. Host the PDF separately only if redistribution is permitted.

## Added integration-ready lesson block formats
- `content/lesson_blocks/*.json` provides **per-source-page JSON blocks** for every segment. These are editable sources for a content compiler, not finalized prose/table/code rendering.
- `examples/ingestion-pattern-interactive.json` is a **hand-curated sample** of reusable components with source page and QA flags.
- `examples/ingestion-pattern-interactive-demo.html` runs offline (open it in a browser) with a comparison and a small quiz. It is a prototype only.
