# Daily Insight bank — 6 November 2026

## Delivered scope

- **400 candidate entries: 397 authored Arabic drafts and 3 preserved English editions.** Batch 4 adds exactly 174 entries to the previous 226; those 226 are preserved without field changes.
- Batch 4 distribution: SQL 74, Fabric 50, Visualization 29, Power BI 21. New IDs are `hansa-bank-224` through `hansa-bank-397`. These deepen local source passages rather than represent equal subject quotas.
- Batch 3 distribution: SQL 45, Statistics 40, Visualization 30, Fabric 20, Power BI 4, Python 4, Excel 4, Analytical foundations 3. New IDs are `hansa-bank-074` through `hansa-bank-223`.
- Eight subjects and all 55 current navigation topics now have at least one candidate. This is first-pass topic coverage, not complete conceptual depth or scientific review.
- 988 local source units and 1,861 source heading occurrences were indexed across 13 JSON files. Heading occurrences are not unique concepts.
- Relevant passages in 159 source units informed the drafts. Indexing the other units is **not** a claim of reading or scientifically reviewing all their content. The three inherited editions have not been reverified.
- All 355 additions from batches 2, 3 and 4 carry matched excerpts and precise JSON evidence pointers. The original batch retains source-unit pointers and fingerprints; passage-level excerpts for that batch remain a follow-up.
- All 400 entries have a local lesson/practice/resource destination whose page exists in the prior static export. Resource-pack and statistics destinations are deliberately broad, with source-navigation instructions; no unverified deep anchors were invented.
- No external retrieval or new factual source was used. Local product descriptions retain their snapshot limitations; current product behavior has not been checked online.

## Files

- [BATCH4_174_REVIEW.md](BATCH4_174_REVIEW.md): the 174 new additions alone, readable in Arabic with supporting excerpts.
- [BATCH4_174_INSIGHTS.json](BATCH4_174_INSIGHTS.json): structured fourth batch.
- [BATCH4_QA.json](BATCH4_QA.json): current verification results and boundaries.
- [PRE_BATCH4_ARCHIVE.json](PRE_BATCH4_ARCHIVE.json): immutable previous 226; tests compare every field by ID.
- `scripts/insight-bank-batch4.mjs`: authored fourth-batch claims and local evidence excerpts.
- [BANK_REVIEW.md](BANK_REVIEW.md): readable draft bank, with scenario, takeaway, caveat and exact local source pointer.
- [INSIGHT_BANK.json](INSIGHT_BANK.json): structured editorial staging; **not loaded by the website**.
- [BATCH3_150_REVIEW.md](BATCH3_150_REVIEW.md): the 150 additions alone, readable in Arabic.
- [BATCH3_150_INSIGHTS.json](BATCH3_150_INSIGHTS.json): the same 150 additions as structured data.
- [BATCH3_QA.json](BATCH3_QA.json): third-batch verification summary and boundaries.
- [TOPIC_LIST.md](TOPIC_LIST.md): subject → topic → source unit → source subheading outline.
- [SOURCE_INVENTORY.json](SOURCE_INVENTORY.json): source IDs, JSON pointers, SHA-256 fingerprints, provisional organizational placement and candidate coverage.
- `scripts/build-insight-bank.mjs`: reproducible local builder, including authored drafts. Do not edit generated files in place; edit the builder and regenerate.
- `scripts/insight-bank-batch2.mjs`: append-only second batch and source excerpts.
- `scripts/insight-bank-batch3.mjs`: exactly 150 append-only third-batch entries and source excerpts.
- `scripts/insight-source-evidence.mjs`: locates excerpts across inline markup, recording render-normalized matching rather than claiming contiguous source bytes.
- [BATCH1_ARCHIVE.json](BATCH1_ARCHIVE.json): immutable original 45-entry bank; preservation tests compare IDs, teaching text, provenance and review gates.
- [PRE_BATCH3_ARCHIVE.json](PRE_BATCH3_ARCHIVE.json): immutable 76-entry bank before batch 3; preservation tests compare every field by ID.
- `lib/knowledge/daily-bank.ts`: isolated daily selection function.
- `tests/knowledge/daily-bank.test.mjs`: scheduling and source-integrity tests.

## Editorial and source contract

Each new item teaches one distinction or decision, with a hypothetical prompt and a stated limitation. Sources are local lessons, notes, courseware descriptions or question explanations. Question explanations are explicitly marked as requiring independent domain review; their answer keys have not been promoted to authority or modified.

`sourceReviewed` records inspection of the relevant local passage, **not scientific approval or review of every paragraph in the source unit**. All entries have `scientificallyVerified: false` and `publicationApproved: false`. New entries remain `draft`; inherited entries retain `technical_review`. None is eligible for daily publication.

The inventory reuses the existing taxonomy/classification rules. Arabic titles and broad headings can land in fallback topics; organizational placement remains provisional. The authored item topic can be more specific than its containing source's topic, especially the SQL learning map. SQL and visualization routes now come from their existing local registries; academy routes use the existing accessor convention.

Not included in this first source pass: complete raw HTML exports, the external HansaDatabase corpus, standalone storytelling exports, link-only reference targets, the full Fabric question-bank layers and candidate/draft intakes. No claim of complete workspace source coverage is made. No archived or blocked answer was silently treated as approved.

## Daily selection contract

The preparation uses a deterministic shuffled deck, frozen bank version and start day. Everyone receives the same selected entry for the same Cairo civil day, including after reload. Every eligible entry is visited before repetition; the same shuffled order repeats on subsequent cycles, preventing repeats even across cycle boundaries. This is pseudorandom scheduling, not a live generator.

Only entries whose status is `published` and whose three review/approval flags are all true enter the deck. An empty or entirely unapproved bank returns no selection. Dates before the release start also return none. No fallback publishes a draft.

Freeze membership and version for a released bank. Adding, removing or revoking items requires a new release and an explicit transition decision: history across different bank releases is not persisted by this function. The function performs no storage writes or network requests. A future UI caller must update its day at Cairo midnight; this module alone does not implement a timer or archive.

## Integration boundary

No application route, component, learner progress, question ID/answer or existing feed was edited. Existing dirty UI/Atlas work was preserved. No dependency, paid service, backend or external student-data transfer was added. Library rationale: native JavaScript/TypeScript suffices for inventory and scheduling; no new UI library is relevant.

Current live `eligibleInsights` restricts sources to Microsoft Learn, while the existing interactive models recognize three shortcut scenarios. Simply injecting this broader bank would therefore be incorrect. General-source provenance, suitable lesson links and a safe text-first presentation must be handled when integrating reviewed entries. This task does not assert that the homepage now rotates these drafts.

## Validation

- PASS (batch 4): 400 total, exactly 174 additions; all previous 226 preserved field-for-field. All 11 focused tests pass, including review gates, provenance, matching excerpts and preservation.
- PASS (batch 4): 400 source fingerprints resolve, 355 excerpt pointers match, all 400 destination pages exist in the prior export; no duplicate IDs or identical takeaways.
- PASS (batch 4): title-plus-takeaway lexical screening at Jaccard > 0.24 found one distinct pair (0.27): HCL hue/chroma versus luminance. Retained because they describe distinct color dimensions. This is not proof of no conceptual overlap or independent scientific approval.
- PASS (batch 4): evidence normalization now strips recognized presentation tags without consuming SQL inequalities and subsequent prose; regression test covers the case. Existing 226 evidence records remain unchanged.
- NOT RUN (batch 4): full build, browser review, database/calculation engine execution, independent scientific approval or deployment. No UI or daily selector changes; no added service or cost. Source product behavior remains a local snapshot.
- PASS (batch 3): exactly 150 new IDs and 226 total; all 76 previous entries preserved field-for-field, with no duplicate ID or identical takeaway.
- PASS (batch 3): all source fingerprints and 181 passage excerpts verified locally; all 226 destination pages exist in the prior static export.
- PASS (batch 3): all 9 focused tests, including the full previous-bank preservation check and exclusion of drafts from daily publication.
- PASS (batch 3): lexical overlap screening of new-versus-existing and new-versus-new title/takeaway text. The only pair above the 0.24 Jaccard threshold was Type I versus Type II error (0.75); retained because they describe different reality/decision combinations. This heuristic and the author's distinction review are not proof of zero conceptual overlap or independent domain approval.
- PASS (batch 3): independent arithmetic checks for the three explicit calculated examples: 5.4 / 1.5 ≈ 3.6; 22.5 − 21 = 1.5 percentage points; 24 × 24 × 4 = 2304. Ranking example also checked against its stated values. No SQL, DAX, Pandas, Excel or Fabric engine execution is claimed.
- NOT RUN (batch 3): full build/browser regression; changes are editorial source generation, artifacts and tests only. Runtime selector and UI remain unchanged.
- PASS (batch 2): generator completed; 8 subjects, 55/55 topics with candidates, 988 indexed units, 76 unique candidate IDs.
- PASS (batch 2): all 76 source pointers resolve and fingerprints match; 31 new excerpt pointers match their local passages; no identical takeaway strings. Exact-text uniqueness is not a guarantee of zero conceptual overlap.
- PASS (batch 2): all 45 original IDs, teaching claims, source fingerprints and review gates preserved. Local route metadata was enriched intentionally.
- PASS (batch 2): 8 focused tests, including Cairo day boundaries, cycle boundaries, duplicate IDs, invalid dates, approval gates, source integrity and first-batch preservation.
- PASS (batch 2): all 76 destination pages exist in the previous static export. Browser navigation and deep-link behavior NOT RUN.
- PASS (prior batch, not rerun): all 118 knowledge tests, TypeScript check and active agent-reference verifier.
- PASS (prior batch, not rerun): production build and static export (`npm run build`, exit 0); 442 generated build entries and 435 segment payload aliases. These counts are build outputs, not unique learner-facing pages. This included the pre-existing dirty workspace and was not an independent audit of those changes. Batch 2 only changes editorial generation, artifacts and related tests; the runtime selector is unchanged.
- NOT RUN: independent scientific/editorial approval, live behavior verification, browser/mobile/accessibility review for this bank. No UI was integrated.
- NOT RUN: deployment.

## Next atomic task and rollback

Add precise supporting excerpts for the first batch, review the candidate claims independently and record per-item reviewer evidence before changing publication flags. Deepen topics where a single candidate is only an introduction; do not fill a numeric quota with repeated concepts. The technical selector is ready but the bank remains fully excluded from publication.

Batch-4 rollback uses PRE_BATCH4_ARCHIVE.json as the previous bank and removes the batch-4 builder integration and dedicated outputs, then regenerates the reports. Batch-3 rollback uses PRE_BATCH3_ARCHIVE.json as the previous bank and removes the batch-3 builder integration and its dedicated outputs. Batch-2 rollback uses BATCH1_ARCHIVE.json as the original bank, removes the batch-2 builder integration and regenerates the original reports. Full-task rollback removes the dated output directory and the new builder, supplemental batches, evidence helper, selector and test files. No existing feed or progress migration needs reversal. Other workspace modifications are unrelated and must be retained.
