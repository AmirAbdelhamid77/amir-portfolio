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
| **Semantically read** | **38** |
| Not read | 4299 |
| Published | 0 |

Semantic reading covers **0.88%** of eligible units. That is a documented subset, not full corpus reading. Candidate matching never advances the reading or decision state.

## Decisions

| Decision | Count |
|---|---:|
| Accepted | 10 |
| Revised | 17 |
| Held | 7 |
| Unresolved gap | 4 |
| Unreviewed | 4299 |
| Out of scope | 1864 |

## Family ledger

| Family | Units | Eligible | Matched | Unmatched | Read | Accepted | Revised | Held | Gap |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| curated-references | 1859 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| fabric-questions | 1264 | 1264 | 1170 | 94 | 4 | 0 | 3 | 1 | 0 |
| fabric-notes | 720 | 720 | 529 | 191 | 5 | 1 | 2 | 2 | 0 |
| academy | 593 | 593 | 457 | 136 | 2 | 0 | 1 | 0 | 1 |
| sql | 535 | 535 | 440 | 95 | 3 | 1 | 2 | 0 | 0 |
| fabric-additions | 532 | 532 | 480 | 52 | 1 | 0 | 1 | 0 | 0 |
| fabric-r11 | 222 | 222 | 210 | 12 | 1 | 0 | 0 | 1 | 0 |
| statistics | 145 | 145 | 65 | 80 | 6 | 2 | 2 | 0 | 2 |
| visualization | 138 | 138 | 117 | 21 | 10 | 3 | 6 | 1 | 0 |
| fabric-cases | 78 | 78 | 71 | 7 | 0 | 0 | 0 | 0 | 0 |
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

## Limits

- Agent technical review is not human publication, scientific or rights review.
- Candidate matching remains lexical; false positives are documented rather than silently repaired.
- Media, figures and rendered pages were not visually reviewed.
- Extraction defects found during review are recorded as unresolved gaps, not repaired by inference.
