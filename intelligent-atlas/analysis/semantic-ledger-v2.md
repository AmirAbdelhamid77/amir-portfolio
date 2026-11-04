# Semantic ledger v2 — 2026-11-01

Reviewer: agent technical review (DeepSeek V4.1 Flash Free); human review pending

Each unit was opened with its parent context, read for its actual claim, and only then compared with the matcher's candidates. Evidence quotes are verbatim substrings of the extracted unit text and are verified by the ledger builder. A decision never promotes a unit to published state.

## Separate states

| State | Count |
|---|---:|
| Units extracted | 6201 |
| Eligible for semantic reading | 4337 |
| Metadata-only | 1859 |
| Non-learning | 5 |
| Candidate matched | 3609 |
| Candidate unmatched | 728 |
| **Semantically read** | **109** |
| Not read | 4228 |
| Published | 0 |

Semantic reading covers **2.51%** of eligible units. That is a documented subset, not full corpus reading. Candidate matching never advances the reading or decision state.

## Decisions

| Decision | Count |
|---|---:|
| Accepted | 10 |
| Revised | 64 |
| Held | 24 |
| Unresolved gap | 11 |
| Unreviewed | 4228 |
| Out of scope | 1864 |

## Family ledger

| Family | Units | Eligible | Matched | Unmatched | Read | Accepted | Revised | Held | Gap |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| curated-references | 1859 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| fabric-questions | 1264 | 1264 | 1170 | 94 | 4 | 0 | 3 | 1 | 0 |
| fabric-notes | 720 | 720 | 529 | 191 | 36 | 1 | 31 | 4 | 0 |
| academy | 593 | 593 | 457 | 136 | 5 | 0 | 1 | 3 | 1 |
| sql | 535 | 535 | 440 | 95 | 17 | 1 | 7 | 4 | 5 |
| fabric-additions | 532 | 532 | 480 | 52 | 1 | 0 | 1 | 0 | 0 |
| fabric-r11 | 222 | 222 | 210 | 12 | 1 | 0 | 0 | 1 | 0 |
| statistics | 145 | 145 | 65 | 80 | 8 | 2 | 3 | 0 | 3 |
| visualization | 138 | 138 | 117 | 21 | 27 | 3 | 15 | 8 | 1 |
| fabric-cases | 78 | 78 | 71 | 7 | 4 | 0 | 3 | 1 | 0 |
| exams | 70 | 70 | 47 | 23 | 2 | 0 | 0 | 2 | 0 |
| hands-on-labs | 29 | 29 | 13 | 16 | 1 | 0 | 0 | 0 | 1 |
| fabric-rti | 8 | 8 | 7 | 1 | 0 | 0 | 0 | 0 | 0 |
| professional-pages | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| daily-insights | 3 | 3 | 3 | 0 | 3 | 3 | 0 | 0 | 0 |

## Unit decisions

| Unit | Family | Decision | Candidate verdict | Concepts | Code |
|---|---|---|---|---|---|
| `fabric-note:delta/architecture` | fabric-notes | revised | revised | Lakehouse (primary); OneLake (primary); Delta table (secondary) | promoted-onelake-to-primary |
| `fabric-note:delta/shortcuts` | fabric-notes | accepted | confirmed | OneLake shortcut (primary); Delta table (secondary) | confirmed-primary |
| `sql:00#opening` | sql | revised | revised | Query output grain (primary); Query population (primary); Set operations (secondary) | demoted-branch-to-secondary |
| `stats:s11` | statistics | accepted | confirmed | Central limit theorem (primary); Sampling distribution (primary); Population and sample (secondary) | confirmed-primary |
| `stats:s13` | statistics | accepted | confirmed | Standard error (primary); Sampling distribution (primary); Measures of spread (secondary) | confirmed-primary |
| `stats:s14` | statistics | revised | revised | Confidence interval (primary); Standard error (primary); Probability (secondary) | removed-false-positive |
| `stats:s15` | statistics | revised | revised | Hypothesis test (primary); p-value (primary); Type I and Type II errors (secondary) | removed-false-positive |
| `dv:core-chart-types#6-scatter-plot` | visualization | revised | revised | Relationship plot (primary); Correlation (primary); Scale (secondary) | promoted-cross-domain-concept |
| `dv-lesson:en:accessibility-color-qa` | visualization | accepted | confirmed | Accessibility and contrast (primary); Color palette semantics (secondary) | confirmed-primary |
| `dv-lesson:en:chart-selection` | visualization | accepted | confirmed | Chart selection (primary); Analytical task (primary); Visual encoding (secondary) | confirmed-primary |
| `dv-lesson:en:quick-reference` | visualization | revised | revised | Visual integrity (primary); Distribution plot (secondary) | promoted-primary-held-secondary |
| `dv-lesson:ar:core-charts` | visualization | revised | revised | Variable type (primary); Chart selection (secondary) | promoted-index-principle |
| `dv-lesson:ar:tips` | visualization | accepted | confirmed | Chart selection (primary); Analytical task (secondary) | confirmed-primary |
| `dv:ar-comprehensive#operating-system` | visualization | revised | revised | Decision frame (primary); Analytical task (primary); Chart selection (secondary) | promoted-decision-frame |
| `insight:hansa-insight-shortcut-reference-v1` | daily-insights | accepted | confirmed | OneLake shortcut (primary); Delta table (secondary) | accepted-editorial-synthesis |
| `insight:hansa-insight-shortcut-delete-v1` | daily-insights | accepted | confirmed | OneLake shortcut (primary); Identity and permissions (secondary) | accepted-editorial-synthesis |
| `insight:hansa-insight-shortcut-discovery-v1` | daily-insights | accepted | confirmed | OneLake shortcut (primary); Lakehouse (secondary); Delta table (secondary) | accepted-editorial-synthesis |
| `fabric-q:fb-nb-025` | fabric-questions | held | false-positive | Git integration (secondary) | missing-concept-and-withheld-answer |
| `exam:sql:sql-09` | exams | held | false-positive | — | matcher-false-positive |
| `stats-formula:21` | statistics | unresolved-gap | missed | — | formula-without-parent-context |
| `dv-lesson:en:overview` | visualization | revised | false-positive | Decision frame (primary); Chart selection (secondary) | removed-cross-domain-false-positive |
| `exam:fundamentals:fun-06` | exams | held | false-positive | — | misconception-prompt-not-claim |
| `fabric-note:video14/V14-PIPE-068` | fabric-notes | revised | missed | Pipeline reliability (primary); Pipeline control flow (secondary) | added-missed-concept |
| `dv:statistical-traps#6-multiple-comparisons` | visualization | revised | revised | Visual integrity (primary); Type I and Type II errors (secondary) | added-cross-domain-concept |
| `sql:reference/3cd3906c5d6c81fca708ee9237596fb9#section-10` | sql | accepted | confirmed | Subquery and CTE (primary); Aggregation (secondary); GROUP BY (secondary) | confirmed-primary-with-extraction-defect |
| `fabric-r11:T1Q168` | fabric-r11 | held | revised | Deployment pipeline (primary); Pipeline parameter (primary); Semantic model (secondary) | revision-overlay-second-pass-missing |
| `academy:fabric-analytics:20a-work-with-graphql#section-4` | academy | revised | revised | Join (primary); Ordering and determinism (secondary); T-SQL query surface (secondary) | promoted-code-subject |
| `stats-formula:98` | statistics | unresolved-gap | confirmed | — | symbol-without-parent-context |
| `lab:hands-on-exp-0028-create-reusable-power-bi-assets` | hands-on-labs | unresolved-gap | missed | — | procedural-steps-not-extracted |
| `fabric-note:video10/V10-DEP-021` | fabric-notes | held | false-positive | — | templated-summary-not-source-claim |
| `dv:visual-atlas#i-dual-axis-vs-small-multiples` | visualization | held | confirmed | Visual integrity (secondary) | essential-meaning-in-unreviewed-media |
| `fabric-note:video10/V10-DEP-042` | fabric-notes | held | false-positive | — | templated-summary-not-source-claim |
| `fabric-q:fb-v11-choose-013` | fabric-questions | revised | missed | Lakehouse (primary) | recovered-unmatched-context |
| `academy:power-bi:labs-02-transform-data-power-bi#section-1` | academy | unresolved-gap | missed | — | heading-only-extraction |
| `fabric-q:fb-v8-gov-012` | fabric-questions | revised | missed | Identity and permissions (primary); Layered security model (secondary) | recovered-unmatched-context |
| `sql:reference/3cb3906c5d6c817fb197f233646cda62#section-14` | sql | revised | missed | Text and pattern matching (primary) | recovered-unmatched-context |
| `fabric-add:new-hub-dumps-21-r21` | fabric-additions | revised | missed | Pipeline control flow (primary); Data pipeline (secondary) | recovered-unmatched-context |
| `fabric-q:fb-v6-sec-047` | fabric-questions | revised | revised | Identity and permissions (primary); Delta table (secondary); Lakehouse (secondary) | promoted-security-subject |
| `fabric-note:video15/V15-OLS-010` | fabric-notes | revised | missed | Layered security model (primary); Object-level security (secondary); Column-level security (secondary) | recovered-security-claim-in-spark-context |
| `fabric-note:video15/V15-OLS-029` | fabric-notes | revised | missed | Identity and permissions (primary); OneLake (secondary) | recovered-unmatched-checklist-claim |
| `fabric-note:video15/V15-OLS-030` | fabric-notes | held | missed | — | checklist-step-without-claim |
| `fabric-note:video15/V15-OLS-031` | fabric-notes | revised | missed | Identity and permissions (primary); OneLake (secondary) | recovered-least-privilege-claim |
| `fabric-note:video15/V15-OLS-033` | fabric-notes | revised | missed | Identity and permissions (primary); Layered security model (secondary) | recovered-read-write-authorisation-claim |
| `fabric-note:video15/V15-OLS-035` | fabric-notes | revised | missed | Identity and permissions (primary); Layered security model (secondary) | recovered-methodological-claim |
| `fabric-note:video15/V15-OLS-056` | fabric-notes | revised | missed | Identity and permissions (primary); Row-level security (secondary) | recovered-nested-membership-claim |
| `fabric-case:disappearing-tables` | fabric-cases | revised | missed | SQL endpoint metadata sync (primary); Delta table (secondary); SQL analytics endpoint (secondary) | recovered-metadata-sync-case |
| `fabric-case:e-manufacturing-spark-etl` | fabric-cases | held | missed | — | case-scenario-without-resolution |
| `dv:ar-comprehensive#how-to-use` | visualization | held | missed | — | hub-selection-instruction |
| `dv:power-bi-playbook#opening` | visualization | held | missed | — | page-purpose-statement |
| `dv:interview-bank#opening` | visualization | held | missed | — | practice-intent-statement |
| `dv:statistical-traps#opening` | visualization | revised | missed | Visual integrity (primary); Evidence strength (secondary) | recovered-inference-versus-drawing-claim |
| `sql:reference/3d13906c5d6c81a4829ed7f4e6db9f8b#opening` | sql | held | missed | — | supporting-source-disclaimer |
| `dv:visual-atlas#how-to-use-this-atlas` | visualization | revised | missed | Visual integrity (primary); Chart selection (secondary) | recovered-gallery-usage-claim |
| `dv:foundations#opening` | visualization | revised | missed | Variable type (primary); Chart selection (secondary) | recovered-framework-order-claim |
| `sql:reference/3cd3906c5d6c8196a02ad41449f06ba8#opening` | sql | held | missed | — | ownership-boundary-statement |
| `sql:reference/3cb3906c5d6c81f981e3cff58e8ce989#opening` | sql | revised | missed | Text and pattern matching (primary) | recovered-function-surface-claim |
| `dv:ar-comprehensive#opening` | visualization | held | missed | — | role-split-not-modelled |
| `sql:01#section-25` | sql | revised | missed | Logical query processing order (primary); Relational query mental model (secondary) | recovered-logical-versus-physical-claim |
| `dv:visual-atlas#opening` | visualization | revised | missed | Visual integrity (primary); Evidence strength (secondary) | recovered-synthetic-figure-claim |
| `academy:fabric-analytics:28-build-data-agent-ontology#section-11` | academy | held | missed | — | lesson-recap-unmodelled-domain |
| `sql:02#opening` | sql | revised | missed | Keys and relationships (primary); NULL semantics (secondary) | recovered-schema-before-query-claim |
| `academy:fabric-analytics:22d-copilot-fabric-data-agents#section-11` | academy | held | missed | — | lesson-closing-marketing-claim |
| `academy:fabric-analytics:27-visualize-ontology#section-8` | academy | held | missed | — | lesson-recap-unmodelled-domain |
| `dv:quick-reference#21-high-value-comparison-table` | visualization | unresolved-gap | missed | Chart selection (primary) | table-body-not-extracted |
| `fabric-note:video20/V20-DELTA-024` | fabric-notes | revised | missed | OPTIMIZE compaction (primary); Deletion vectors (secondary) | retention-preserves-active-files |
| `fabric-note:video21/V21-CAT-022` | fabric-notes | revised | missed | OneLake shortcut (primary); OneLake (secondary) | path-consumers-are-separate-dependencies |
| `stats:s42` | statistics | unresolved-gap | missed | — | cheat-sheet-body-not-extracted |
| `fabric-note:video20/V20-DELTA-021` | fabric-notes | revised | missed | OPTIMIZE compaction (primary) | dry-run-previews-without-cleanup |
| `fabric-note:video21/V21-CAT-019` | fabric-notes | revised | missed | SQL endpoint metadata sync (primary) | catalog-storage-consistency |
| `dv:ar-reading-paths#beginner-advanced` | visualization | held | missed | — | curriculum-path-index |
| `dv:ar-references#curated-references` | visualization | revised | missed | Visual integrity (primary); Color palette semantics (secondary) | curated-reference-list |
| `fabric-note:video20/V20-DELTA-014` | fabric-notes | revised | missed | Partitioning and pruning (primary) | small-table-fragmentation-tradeoff |
| `fabric-note:video14/V14-PIPE-065` | fabric-notes | revised | missed | Pipeline control flow (primary) | lookup-first-row-shape |
| `fabric-note:video21/V21-CAT-021` | fabric-notes | revised | missed | Identity and permissions (primary) | allowlist-needs-applicability-and-instructions |
| `fabric-note:video20/V20-DELTA-012` | fabric-notes | revised | missed | Delta history and time travel (primary) | version-identifies-snapshot |
| `fabric-note:video14/V14-PIPE-066` | fabric-notes | revised | missed | Pipeline control flow (primary) | multirow-lookup-array |
| `fabric-note:video16/V16-SQL-037` | fabric-notes | revised | missed | Delta history and time travel (primary); T-SQL query surface (secondary) | statement-level-time-travel |
| `fabric-note:video14/V14-PIPE-070` | fabric-notes | revised | missed | Pipeline control flow (primary) | lookup-drives-downstream |
| `fabric-note:video21/V21-CAT-020` | fabric-notes | revised | missed | Data quality (primary) | identity-and-content-catch-wrong-table |
| `fabric-note:video21/V21-CAT-023` | fabric-notes | held | missed | — | session-context-not-modelled |
| `fabric-note:video14/V14-PIPE-090` | fabric-notes | revised | missed | Pipeline reliability (primary) | timeout-is-not-diagnosis |
| `fabric-note:video21/V21-CAT-006` | fabric-notes | revised | missed | Layered security model (primary); Evidence strength (secondary) | positive-and-negative-access-tests |
| `fabric-note:video15/V15-OLS-051` | fabric-notes | revised | missed | OneLake security role (primary); Lakehouse (secondary) | overwrite-needs-opt-in-and-reconciliation |
| `fabric-note:video16/V16-SQL-039` | fabric-notes | revised | missed | Delta history and time travel (primary); T-SQL query surface (secondary) | time-travel-window-starts-at-creation |
| `sql:15#section-15` | sql | unresolved-gap | missed | — | section-list-not-extracted |
| `fabric-note:video20/V20-DELTA-034` | fabric-notes | revised | missed | Confounding (primary); Evidence strength (secondary) | benchmark-controls-confounding |
| `fabric-note:video15/V15-OLS-004` | fabric-notes | revised | missed | OneLake security role (primary); Identity and permissions (secondary) | audit-broad-grants-first |
| `dv-lesson:ar:references` | visualization | revised | missed | Evidence strength (primary); Visual integrity (secondary) | references-explain-limitations |
| `sql:15#section-14` | sql | unresolved-gap | missed | — | section-list-not-extracted |
| `fabric-note:video15/V15-OLS-013` | fabric-notes | revised | missed | Layered security model (primary); Column-level security (secondary) | no-universal-deny-overrides |
| `dv-lesson:ar:reading-paths` | visualization | held | missed | — | curriculum-path-advice |
| `fabric-case:f-central-platform-api-automation` | fabric-cases | revised | missed | OneLake security role (primary); Identity and permissions (secondary) | api-role-lifecycle-at-scale |
| `fabric-note:video15/V15-OLS-050` | fabric-notes | revised | missed | OneLake security role (primary); Deployment pipeline (secondary) | version-diff-and-dar-tracking |
| `sql:04#section-12` | sql | unresolved-gap | missed | — | section-list-not-extracted |
| `fabric-note:video15/V15-OLS-054` | fabric-notes | revised | missed | OneLake security role (primary); Identity and permissions (secondary) | propagation-latency-differs |
| `fabric-note:video21/V21-CAT-016` | fabric-notes | revised | missed | Evidence strength (primary); Layered security model (secondary) | claims-need-runtime-and-tests |
| `sql:02#section-22` | sql | unresolved-gap | missed | — | section-list-not-extracted |
| `fabric-case:unified-sales-report` | fabric-cases | revised | missed | Delta history and time travel (primary); T-SQL query surface (secondary) | as-of-join-both-sources |
| `sql:12#section-2` | sql | unresolved-gap | missed | — | section-list-not-extracted |
| `dv:interview-bank#5-senior-answer-structure` | visualization | revised | missed | Chart selection (primary); Visual integrity (secondary) | senior-answer-structure |
| `dv:ar-references#section-3` | visualization | revised | missed | Color palette semantics (primary); Accessibility and contrast (secondary) | colour-perception-references |
| `dv:ar-references#section-6` | visualization | held | missed | — | reference-list-meta-note |
| `sql:15#section-1` | sql | revised | missed | Keys and relationships (primary); Query output grain (secondary) | database-design-page-scope |
| `sql:15#section-16` | sql | held | missed | — | module-ownership-boundary |
| `sql:12#section-3` | sql | held | missed | — | canonical-module-cross-reference |
| `fabric-note:eventhouse/syntax` | fabric-notes | revised | missed | Materialized lake view (primary); Monitoring (secondary) | async-view-readiness |
| `sql:12#section-6` | sql | revised | missed | Evidence strength (primary); HAVING filter (secondary) | sample-size-guard-in-kpi |
| `dv:ar-references#foundational` | visualization | revised | missed | Visual encoding (primary); Visual integrity (secondary) | foundational-references-encoding |
| `stats:s29` | statistics | revised | missed | Experiment design (primary); Variable type (secondary) | independent-dependent-variable-definitions |

## Recorded gaps

| Unit | Gap |
|---|---|
| `fabric-note:delta/shortcuts` | Caching retention (1-28 days) and the 1 GB exclusion must be re-verified against current Microsoft documentation before publication. |
| `sql:00#opening` | The decision flowchart lost its edge labels during extraction; only the branch targets survived, so the exact routing between questions cannot be reconstructed from the ledger alone. |
| `stats:s11` | The extracted text references the mean-equality formula but the formula body is not present in the ledger. |
| `stats:s13` | The sigma/sqrt(n) and s/sqrt(n) formulas are referenced but absent from the extracted text. |
| `stats:s14` | The general and standard interval formulas are referenced but not extracted. |
| `stats:s15` | Only 15.1 and 15.2 are present in the extracted slice; the p-value and decision-rule subsections are outside the captured text. |
| `dv:core-chart-types#6-scatter-plot` | The page references figure content that was not visually reviewed. |
| `dv:core-chart-types#6-scatter-plot` | Emphasis markers were stripped during extraction and adjacent words were joined (a linear association became alinearassociation), so exact quoting requires care. |
| `dv-lesson:en:quick-reference` | The checklist items themselves are summarized rather than extracted, so the individual checks cannot be cited one by one. |
| `dv-lesson:ar:core-charts` | Index page: individual chart claims live in the linked lessons, not here. |
| `dv:ar-comprehensive#operating-system` | The ten-stage pipeline is an editorial workflow, not a scientific prerequisite chain, so it must not be converted into requires_understanding_of edges. |
| `insight:hansa-insight-shortcut-reference-v1` | No human publication review has been completed for this edition. |
| `insight:hansa-insight-shortcut-delete-v1` | No human publication review has been completed for this edition. |
| `insight:hansa-insight-shortcut-discovery-v1` | No human publication review has been completed for this edition. |
| `fabric-q:fb-nb-025` | The registry has no Spark Job Definition concept. |
| `fabric-q:fb-nb-025` | The answer and options are withheld, so the tested distinction cannot be confirmed from the ledger. |
| `exam:sql:sql-09` | No registry concept covers SQL reviewability or readability conventions. |
| `exam:sql:sql-09` | Answer withheld. |
| `stats-formula:21` | The parent section 9 prose is not present in the unit text. |
| `stats-formula:21` | The extraction also retained a mangled plain-text form (mupm2sigma) alongside the LaTeX. |
| `exam:fundamentals:fun-06` | The correct answer is withheld, so the intended judgement cannot be confirmed from the ledger. |
| `fabric-note:video14/V14-PIPE-068` | The note is a condensed summary rather than a verbatim transcript, so the 5,000-row figure needs source verification before publication. |
| `dv:statistical-traps#6-multiple-comparisons` | The registry has no multiple-comparisons concept; error-types is the nearest supported idea. |
| `sql:reference/3cd3906c5d6c81fca708ee9237596fb9#section-10` | Code extraction dropped asterisks: COUNT( ) should be COUNT(*). The same loss affects other code samples in this family. |
| `fabric-r11:T1Q168` | R11 second-pass review not performed; the retained R10 finding is a lead, not verification. |
| `fabric-r11:T1Q168` | Answers withheld. |
| `academy:fabric-analytics:20a-work-with-graphql#section-4` | The lesson's GraphQL claims are outside this section and were not read here. |
| `stats-formula:98` | Parent section 39 prose is absent from the unit text. |
| `lab:hands-on-exp-0028-create-reusable-power-bi-assets` | Lab steps, expected outputs and validation checks are missing from the ledger. |
| `lab:hands-on-exp-0028-create-reusable-power-bi-assets` | The workspace prerequisite is marked inferred by the extractor itself. |
| `fabric-note:video10/V10-DEP-021` | The note body is a generated study template; the underlying video segment text is not in the ledger. |
| `fabric-note:video10/V10-DEP-021` | This pattern should be audited across the fabric-notes family before any of its notes are used as evidence. |
| `dv:visual-atlas#i-dual-axis-vs-small-multiples` | Figure pixels not independently reviewed; the media ledger records 628 references as not-inspected. |
| `fabric-note:video10/V10-DEP-042` | Underlying video segment text absent. |
| `fabric-note:video10/V10-DEP-042` | Template duplication across distinct titles must be resolved before the notes family is used as evidence. |
| `fabric-q:fb-v11-choose-013` | Answer withheld, so the intended option cannot be confirmed. |
| `academy:power-bi:labs-02-transform-data-power-bi#section-1` | Section body missing; only the heading was extracted. |
| `academy:power-bi:labs-02-transform-data-power-bi#section-1` | Needs a re-extraction pass over academy lab sections before the family can be assessed. |
| `fabric-q:fb-v8-gov-012` | No registry concept covers metadata discoverability or a governed catalog layer. |
| `fabric-q:fb-v8-gov-012` | Answers withheld. |
| `sql:reference/3cb3906c5d6c817fb197f233646cda62#section-14` | No registry concept covers PostgreSQL extension management. |
| `sql:reference/3cb3906c5d6c817fb197f233646cda62#section-14` | The section mixes two unrelated topics, so a single unit-level concept assignment is a lossy summary. |
| `fabric-add:new-hub-dumps-21-r21` | Answers withheld; the specific technical requirements are in the case body, not in this unit. |
| `fabric-q:fb-v6-sec-047` | Answers withheld. |
| `fabric-note:video15/V15-OLS-010` | The note does not say which of OLS or CLS produced the filtering, so the concept split is inferred from the chapter heading. |
| `fabric-note:video15/V15-OLS-029` | The four checks are listed without their failure symptoms, so no relation between them can be asserted. |
| `fabric-note:video15/V15-OLS-030` | The claim this step supports is recorded on V15-OLS-029, so this unit must not become an independent assertion. |
| `fabric-note:video15/V15-OLS-035` | The note does not enumerate the engines in the matrix; SQL, semantic model and Spark are named only in the following chapter. |
| `fabric-note:video15/V15-OLS-056` | The note does not state which engines expand nested groups and which flatten them; that difference is the actual claim and it is missing. |
| `fabric-case:disappearing-tables` | The case text stops before the resolution, so the recommended fix is not part of the unit. |
| `fabric-case:e-manufacturing-spark-etl` | The question, expected answer and any discussion were not extracted with the scenario. |
| `dv:interview-bank#opening` | No registry concept covers explaining trade-offs in interview answers; candidate gap, not a mapping. |
| `sql:reference/3d13906c5d6c81a4829ed7f4e6db9f8b#opening` | The recipes themselves were not read in this batch; they remain eligible for a later pass. |
| `dv:foundations#opening` | The master framework itself is described but not defined in this opening; its steps are not extractable from this unit. |
| `sql:reference/3cb3906c5d6c81f981e3cff58e8ce989#opening` | The page lists use cases but not the dialect or collation behaviour that makes them differ; the text-matching concept is mapped on the function family, not on a verified behaviour. |
| `dv:ar-comprehensive#opening` | No registry concept owns the visualization-as-evidence versus storytelling-as-communication distinction; candidate concept for a later registry revision. |
| `sql:01#section-25` | The section mixes an ownership rule with a content claim; only the content claim is mapped. |
| `dv:visual-atlas#opening` | The extraction kept the typo "aspattern"; the quote is verbatim and must not be corrected in the ledger. |
| `academy:fabric-analytics:28-build-data-agent-ontology#section-11` | Ontology and data-agent concepts are outside the current five-domain registry. |
| `academy:fabric-analytics:22d-copilot-fabric-data-agents#section-11` | The summary's takeaway and next-step lists were not retained as separate units. |
| `academy:fabric-analytics:27-visualize-ontology#section-8` | Ontology-driven exploration is outside the current five-domain registry. |
| `dv:quick-reference#21-high-value-comparison-table` | Table cell text is not extracted: the source block holds six question/plot/why rows, the unit holds only the heading. 60 table blocks in 5 content files are affected. |
| `stats:s42` | The one-page cheat sheet body is absent from the corpus; only its heading survives. |
| `stats:s42` | The following formula unit is a bare fragment (mu \mu s1), so formula extraction is suspect in this source too. |
| `dv:ar-reading-paths#beginner-advanced` | Reading paths are curriculum structure. The registry has no navigation target, so the page stays discoverable through its route without a semantic mapping. |
| `fabric-note:video21/V21-CAT-023` | Session-scoped capability defaults have no concept in the current registry. |
| `sql:15#section-15` | The six-item Interview Traps list under section 11 is present in content/sql/vault.json (page 15, block 39) but not in units-analyzed.jsonl. |
| `sql:15#section-14` | The six-item Common Design Failures list under section 10 is present in content/sql/vault.json (page 15, block 37) but not in units-analyzed.jsonl. |
| `dv-lesson:ar:reading-paths` | Reading-path guidance is navigation, not a knowledge claim; the registry has no navigation target. |
| `sql:04#section-12` | The six-item Interview Traps list under section 11 is present in content/sql/vault.json (page 04, block 35) but not in units-analyzed.jsonl. |
| `sql:02#section-22` | The mistakes list under section 6 is present in content/sql/vault.json (page 02, block 55) but not in units-analyzed.jsonl. |
| `sql:12#section-2` | The MovieNow schema list under section 2 is present in content/sql/vault.json (page 12, block 7) but not in units-analyzed.jsonl. |
| `sql:12#section-2` | Every later example on this page depends on that schema, so the gap affects more than one unit. |
| `dv:ar-references#section-6` | A page-level organizational note has no concept target in the registry. |
| `sql:15#section-16` | Module ownership is editorial structure; the concept registry models ideas, not page boundaries. |
| `sql:12#section-3` | A cross-reference is navigation; no registered concept owns module boundaries or reading order. |
| `sql:12#section-6` | The 30-rating threshold is presented as an example and is not justified in the text. |
| `dv:ar-references#foundational` | The grammar of graphics has no registry concept, so that reference is recorded here but not mapped. |
| `stats:s29` | The registry has no concept dedicated to independent and dependent variable roles. |

## Limits

- Agent technical review is not human publication, scientific or rights review.
- Candidate matching remains lexical; false positives are documented rather than silently repaired.
- Media, figures and rendered pages were not visually reviewed.
- Extraction defects found during review are recorded as unresolved gaps, not repaired by inference.
