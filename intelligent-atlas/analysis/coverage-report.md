# Intelligent Atlas — corpus analysis coverage

Generated 2026-10-31 from ledger `bed4e12d09866bcf…` with registry `2026-10-31.1`.

## What this report proves — and what it does not

It proves that **every extracted unit has an explicit analysis disposition**, that the eligible units were run through the concept matcher, and that every candidate assertion resolves to a verbatim corpus passage. It does **not** prove scientific correctness, human approval, or that a rendered figure was visually reviewed. Media remains caption/alt-only.

## Unit dispositions

| Disposition | Units | Share |
|---|---:|---:|
| Semantically analyzed and mapped | 3609 | 58.2% |
| Excluded: LINK_ONLY metadata | 1859 | 30.0% |
| Semantically analyzed, unmapped (reason-coded) | 728 | 11.7% |
| Excluded: non-learning public page | 5 | 0.1% |
| **Total extracted** | **6201** | **100.0%** |

Eligible learning units: **4337**. Pending eligible units: **0**. Excluded with reason: **1864** (LINK_ONLY references and professional/utility pages).

Of the **4337** eligible learning units, **3609** (83.2%) reached at least one concept above threshold and **728** (16.8%) are explicitly unmapped with a reason code. Unmapped is not a pending state.

## Per-family coverage

| Family | Total | Mapped | Unmapped | Excluded |
|---|---:|---:|---:|---:|
| curated-references | 1859 | 0 | 0 | 1859 |
| fabric-questions | 1264 | 1170 | 94 | 0 |
| fabric-notes | 720 | 529 | 191 | 0 |
| academy | 593 | 457 | 136 | 0 |
| sql | 535 | 440 | 95 | 0 |
| fabric-additions | 532 | 480 | 52 | 0 |
| fabric-r11 | 222 | 210 | 12 | 0 |
| statistics | 145 | 65 | 80 | 0 |
| visualization | 138 | 117 | 21 | 0 |
| fabric-cases | 78 | 71 | 7 | 0 |
| exams | 70 | 47 | 23 | 0 |
| hands-on-labs | 29 | 13 | 16 | 0 |
| fabric-rti | 8 | 7 | 1 | 0 |
| professional-pages | 5 | 0 | 0 | 5 |
| daily-insights | 3 | 3 | 0 | 0 |

## Why units stayed unmapped

Unmapped is an explicit disposition, not a silent drop. Each unit carries one reason code in `units-analyzed.jsonl`.

| Reason | Units | Share of unmapped | Main families |
|---|---:|---:|---|
| `question-paraphrase` | 186 | 25.5% | fabric-questions (94), fabric-additions (52), exams (23), fabric-r11 (12) |
| `no-lexical-signal` | 170 | 23.4% | fabric-notes (86), sql (76), visualization (4), fabric-cases (3) |
| `procedural-step` | 148 | 20.3% | academy (132), hands-on-labs (16) |
| `formula-fragment` | 79 | 10.9% | statistics (78), academy (1) |
| `template-boilerplate` | 74 | 10.2% | fabric-notes (74) |
| `thin-fragment` | 46 | 6.3% | fabric-notes (24), sql (9), visualization (9), fabric-cases (2) |
| `navigation-index` | 16 | 2.2% | visualization (8), sql (5), academy (3) |
| `domain-not-modelled` | 9 | 1.2% | fabric-notes (7), fabric-cases (2) |

Paraphrased question stems are the largest single reason. They are intentionally not forced onto a concept from a held answer; the answer and option text remain excluded. Domain-not-modelled units are mostly Python/Spark/Excel material outside the five canonical domains, and formula fragments are notation rather than propositions.

## Concept registry

- Canonical concepts: **132** across 5 domains.
- Concepts with at least one corpus mapping: **130**.
- Registry-only concepts (no unit reached threshold): **2**.
- Candidate mappings: **7309** across **2665** distinct resources.
- Reused existing Atlas identities: **26**. New identities are scoped and do not replace existing ones.

Registry-only concepts are listed in `analysis-summary.json`; they remain candidates for review, not silent deletions.

## Assertions

| Relation | Count |
|---|---:|
| `requires_understanding_of` | 37 |
| `enables` | 7 |
| `contrasts_with` | 7 |
| `tradeoff_with` | 4 |
| `complements` | 4 |
| `related_in_decision` | 17 |
| `part_of_mechanism` | 10 |
| **Total** | **86** |

- Direct support: **69**.
- Inferred support: **17** — explicitly labelled, not presented as direct quotation.
- Cross-domain assertions: **12**.
- Evidence passages resolved: **224**. Every passage is a verbatim slice of a ledger unit.

## Graph integrity

- Prerequisite cycles (`requires_understanding_of`): **0**.
- Enabling cycles (`enables`): **0**.
- Comparison/trade-off cycles: **0** — allowed by policy; not treated as prerequisite failure.
- Dangling assertion endpoints: **0**.
- Assertions crosswalked to an existing Atlas edge: **1**.

## Review and publication state

| State | Concepts | Assertions |
|---|---:|---:|
| candidate | 132 | 86 |
| technical_review | 0 (reused existing identities keep their own state) | 0 |
| approved | 0 | 0 |
| published | 0 | 0 |

The public projection contains **zero published concepts and zero published assertions**. Withheld candidates: 132 concepts, 7309 mappings, 86 assertions. This is the truthful public semantic coverage, not an error to hide.

## Goals and routes

- **Read existing OneLake data without building another copy** — route supported by candidate prerequisites; 2 steps; gaps: none. Prerequisite conditions are explanatory unless a versioned executable rule is present.
- **Choose a chart that survives an integrity and accessibility review** — route supported by candidate prerequisites; 7 steps; gaps: none. Prerequisite conditions are explanatory unless a versioned executable rule is present.
- **Decide whether an observed difference is real or sampling noise** — route supported by candidate prerequisites; 5 steps; gaps: none. Prerequisite conditions are explanatory unless a versioned executable rule is present.

Routes are proposals over **candidate** prerequisites. They are not published curricula and do not imply exam readiness.

## Known limits

- 628 media references were not independently visually reviewed; captions and alt text only.
- LINK_ONLY references are metadata-only and were not semantically analyzed.
- Held answers, options and explanations remain excluded; question stems are mapped as `practices`, and no answer was used as evidence.
- Contradiction classification is a first-pass editorial register; 1 item(s) remain open for editorial review.
- The concept matcher is deterministic lexical matching with a confidence threshold. It is reproducible and inspectable, not a semantic embedding model; ambiguous units are retained in the ambiguity register rather than forced.
- No rendered-page accessibility, performance or visual QA is claimed by this report.
