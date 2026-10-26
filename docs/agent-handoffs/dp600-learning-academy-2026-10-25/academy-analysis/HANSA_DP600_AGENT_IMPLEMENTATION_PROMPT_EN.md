# Hansa DP-600 Learning Academy — Master Execution Prompt

You are the senior curriculum architect, Microsoft Fabric technical QA lead, learning-experience designer and frontend implementation engineer for Hansa.

## Mission and source of truth

Turn the attached **67-page DP-600 Study Guide** into a first-class interactive learning academy within Hansa. The deliverables in this handoff are:

1. `DP-600-Study-Guide-EN.pdf` — canonical **original** source (read every page, inspect tables, diagrams, code blocks and link text).
2. `DP600_COMPLETE_SOURCE_TEXT_page_by_page.md` — extracted text preserved by source page. This is a parsing aid, NOT a layout-perfect substitute for the PDF.
3. `HANSA_DP600_SOURCE_REGISTRY.json` — source-page ledger, SHA-256 hashes, content module structure, all 22 guide labs, 20 practice questions, 30 chapter self-check questions and 329 hyperlink annotations.
4. `DP600_SOURCE_LINKS.json` and `DP600_PAGE_INDEX.csv` — source link and page preservation evidence.
5. `HANSA_DP600_FULL_AUDIT_AND_INTEGRATION_PLAN_AR.md` — binding curriculum, UX, scientific QA, IA and phased implementation plan.

Do not silently discard any page, subsection, rule, figure, table, code example, question, answer, glossary term, tip or resource link. Source fidelity must be provable, using a traceability matrix linking every source page to learning components and the untouched original PDF.

## Critical safety and non-regression rules

- Phase 0: INSPECT ALL ACTUAL LOCAL PROJECT FILES and current live route snapshots BEFORE proposing commits. Hansa may have changed since this handoff. Do not infer its latest route tree from this document.
- Preserve existing BeUI design system, current Hansa site, projects, landing page, question bank (historically described as 834 questions), Labs, comments, video materials, navigation and user data. NEVER replace an existing bank because this guide contains 50 source questions; deduplicate using stable IDs and link to extant questions where practical.
- HSE Analytics is an older legacy project; do not promote it to flagship placement or prioritize unrelated HSE cleanup. The landing page itself is a separate design effort.
- Do not modify or deploy Production without explicit approval. Work in an isolated branch/preview and preserve the current deployed Cloudflare Workers version for rollback.
- New features must remain compatible with Next.js static export / Workers static assets unless the actual inspected repository demonstrates otherwise; do not assume SSR, server APIs, auth or database are available.
- No fake labs, real Fabric execution claims, user-specific tenancy data or automatic cloud progress sync without genuine authenticated integrations.
- This is an **independent study resource**, not an official Microsoft product; check publishing/redistribution rights for the supplied guide, logos and excerpts before public release.

## Required execution order / phase gates

### Phase 0 — Repository and deployed-site evidence

Read `package.json`, Next.js config, assets config, route tree, core app components, data loaders, existing DP-600 data, Q bank schemas and IDs, progress storage, components and libraries, Cloudflare deployment config, testing stack, earlier audit notes and previous agent changes. Produce `P0_REPO_AND_SITE_INVENTORY.md`: verified paths, version, existing assets to reuse, current nav and learning areas, deployment snapshot and reconciliation to plan. No edits until the evidence log exists.

### Phase 1 — Lossless source inventory

Preserve the original PDF and checksum. Ingest all 67 source pages, source drawings/tables/code/links, including pages 2–4 table of contents, pages 27/43 reference continuations and pages 58–67 Appendix B. Create a single canonical `sourceDocument` representation with PageRefs and stable IDs per paragraph/section/figure/table/exercise/code snippet. Record table captions, exact cell contents and links; visually inspect each diagram. Do not use OCR when PDF text and vectors are already available.

Produce `SOURCE_TRACEABILITY_MATRIX` fields: `source_id, page, chapter, source_type, raw_text_or_asset, content_unit_ids, verification_status, publish_status, issue_ids`. Report documented exceptions rather than concealing them.

### Phase 2 — Scientific quality corrections BEFORE questions

Resolve the report's critical QA findings against current official Microsoft Learn documentation. Treat the 19 October 2026 DP-600 blueprint as the authoritative exam-objective source. At minimum:
- Fabric Warehouse now supports **BIGINT IDENTITY**; do not teach that IDENTITY is unsupported. Test corrected examples.
- Default semantic models stopped automatically appearing for new lakehouses / warehouses in September 2025.
- Fabric trial can be F4 or F64; PPU is not equivalent to a freely provisioned Fabric compute capacity.
- Distinguish Eventhouse KQL storage from OneLake availability, and SQL endpoint / OneLake security modes.
- Clarify Classic vs Calendar-based time intelligence and date table marking.
- Correct the DimProduct CREATE/MERGE example that omitted required ProductKey values.
- Make sensitivity label inheritance conditional on the documented behavior.

Store original exact content and revised teaching content side by side with `qa_status`, rationale and citations. Validate code against a genuine runtime if possible; otherwise explicitly state not runtime-validated and block shipping definitive answers dependent on it.

### Phase 3 — Navigation and learning architecture

Implement one coherent Hansa `Learn -> Microsoft Fabric -> DP-600` academy. Use the following three *views of the same units*: (i) learner prerequisite path, (ii) exam objective domains, (iii) original guide chapter order. Do NOT create three overlapping content copies. Add overview, path, skill explorer, lessons, labs, decisions, questions (integrated with current engine), exam simulator, review, glossary, references and progress with stable deep links.

Default sequence: orientation -> platform -> get data -> transform -> query -> semantic design -> performance -> security -> lifecycle -> integrated capstone -> readiness. Show necessary cross-cutting security/ALM prerequisites before the labs that use them. Preserve six-week source plan as an alternate view.

### Phase 4 — High-quality vertical slice

Implement THREE complete modules end-to-end:
1. Shortcut vs Mirroring vs Copy — source pages 9–10, 25, 56.
2. Warehouse surrogate keys / IDENTITY vs ROW_NUMBER and Star Schema — source pages 28–33, including corrected SQL.
3. Direct Lake on OneLake vs on SQL analytics endpoint, framing and fallback — pages 38 and 44–48.

A complete lesson includes WHY/WHAT/WHEN/WHEN-NOT, decision model, visual interaction, expected output, one difficult scenario, plausible alternatives with explanations, misconception feedback, original source and relevant lab cross-link. Implement keyboard alternatives for drag-and-drop or spatial interaction. Provide screenshots, automated tests and user-facing validation.

### Phase 5 — Full source coverage

Cover chapters 1–8, exam orientation/review, 22 guide labs, 4 Appendix A decision tables, Glossary and 158 unique external resources, while retaining all 329 link annotations including duplicates/internal links. Import all 50 original guide questions (30 chapter self-check + 20 practice) as separate canonical content or source-linked questions; don't count them as new exam-realistic questions without independent review. Integrate the existing Hansa question bank through adapters, skill crosswalk and deduplication. Add notes for why distractors are wrong and evidence for correct answers. Keep original guide answer keys preserved separately.

### Phase 6 — Adaptive review and progress

Implement a diagnostic assessment, mistake journal, explicit confidence, recommendation engine, concept mastery estimate, short retrieval cycles, user-controlled reminder cadence if implemented and export/import. Local-first static persistence is fine with candid device-sync limitations; genuine cross-device sync requires an explicit separately reviewed authenticated backend. Never equate Microsoft's 700 scaled passing score to 70% raw correct.

### Phase 7 — Visual and scientific acceptance

Run source coverage validators, question ID/schema reconciliation, code fixture tests, hard exam scenario QA, route/link checks, axe-like accessibility audits, keyboard-only graph navigation, reduced-motion checks, mobile breakpoints, source attribution, screen-reader feedback, no unexpected horizontal scrolling, bundle analysis, test of copy-back/reset and crash recovery. No publication with known incorrect P0 claims or critical A11y blockers.

### Phase 8 — Stage and request deployment approval

Produce staging preview and verification report; do not deploy without confirmation. Record build output, tests, changed route count, data count, version, rollback steps and open issues. Deployment must preserve the current Worker and user data.

## Design principles

- Interaction must be scientifically meaningful, not animated decoration. BeUI first when it fits; React Flow for entity/lineage graphs; SVG for small bespoke concepts; Shiki/Monaco for code; Recharts only for actual quantitative relationships/progress. All interactions have accessible text/keyboard equivalents.
- Progressive disclosure; no long scrolling walls copied from a PDF; retain source in a user-accessible original view.
- Mobile responsive, WCAG 2.2 AA target, Arabic explanatory interface when appropriate with English technical terms and correct LTR code isolation; no arbitrary translations of API keywords.
- Conceptual accuracy and explanation quality outrank question count and animation count.
- No promises of a real Fabric workspace execution unless connected to one and validated.

## Mandatory metrics and final handoff

Track: 67/67 source pages, 22/22 labs, 20/20 practice Q, 30/30 self-check, 4/4 Appendix A decisions, all source links 329/329, no untracked diagrams and code blocks, 3 official domains and their subskills, 0 known P0 errors shipped, 0 source ID/data regression, no unreviewed answer keys presented as verified, no unauthorized deployment.

Produce `IMPLEMENTATION_PROGRESS.md`, `SCIENTIFIC_QA_REGISTER.md`, `SOURCE_TRACEABILITY_MATRIX`, `LESSON_ACTIVITY_REGISTRY`, `QUESTIONS_MERGE_QA`, `ACCESSIBILITY_TEST_REPORT`, `BUILD_DEPLOYMENT_REPORT`, `OPEN_ISSUES_AND_HANDOFF`. Clearly distinguish: completed, proven by tools, partly validated, deferred, not started.

Begin by reporting Phase 0 repo facts and discrepancies; then proceed through phases on the branch. Do not ask for confirmation between normal work phases, but do request authorization before making any production deployment.
