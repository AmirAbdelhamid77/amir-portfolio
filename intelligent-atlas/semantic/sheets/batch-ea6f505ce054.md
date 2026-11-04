# Review sheet batch-ea6f505ce054

State: **not-read**. 9 units, selected by ["domain-not-modelled"] from 0 remaining in pool.

A unit in this sheet is still `not-read`. Reading it means writing a decision with a verbatim evidence quote into `intelligent-atlas/semantic/review-decisions.json` and rebuilding the ledger.

## 1. `fabric-note:video15/V15-OLS-033`

- family: `fabric-notes` | language: `en` | forms: note, timestamped-summary
- locator: `pack=video15; chapter=V15-OLS-033` | href: `/lab/dp-600/resources/?pack=video15#study-notes`
- unmatched reason: `domain-not-modelled` — Python/Spark/Excel/NoSQL or another execution domain that the five-domain registry does not model as a canonical concept.
- candidates: none (unmatched)
- title: Spark secured execution
- nearest heading: Spark secured execution (`fabric-note:video15/V15-OLS-032`)

**Text**

```text
Spark secured execution Distinguish supported secure reads from write workflows on protected targets.
```

**Before**
- `fabric-note:video15/V15-OLS-031`: Spark secured execution Meet OneLake Spark Catalog/runtime prerequisites rather than escalating reader privilege.
- `fabric-note:video15/V15-OLS-032`: Spark secured execution Separate secure source read from destination write permission and audit data propagation.

**After**
- `fabric-note:video15/V15-OLS-034`: Spark secured execution Engine authorization and integration determine filtering versus safe rejection.
- `fabric-note:video15/V15-OLS-035`: Spark secured execution Use a least-privilege, matching identity matrix across engines to avoid testing false equivalents.

**Decision to write**

```json
{
  "unitId": "fabric-note:video15/V15-OLS-033",
  "scope": "batch-review",
  "batchId": "batch-ea6f505ce054",
  "parentContext": "<what surrounds this unit in the source>",
  "reading": "<what the unit actually claims, in your words>",
  "essentialMeaning": "<prose|question|formula|procedure|derived-summary|figure|index|table>",
  "evidenceQuote": "<verbatim substring of the text above>",
  "candidateVerdict": "<confirmed|revised|missed|false-positive>",
  "concepts": [
    {
      "conceptId": "concept:<domain>:<slug>",
      "role": "primary|secondary"
    }
  ],
  "relationHints": [],
  "decision": "<accepted|revised|held|unresolved-gap>",
  "decisionCode": "<short-kebab-case-code>",
  "rationale": "<why this decision, traceable to the text>",
  "unresolved": []
}
```

## 2. `fabric-note:video15/V15-OLS-031`

- family: `fabric-notes` | language: `en` | forms: note, timestamped-summary
- locator: `pack=video15; chapter=V15-OLS-031` | href: `/lab/dp-600/resources/?pack=video15#study-notes`
- unmatched reason: `domain-not-modelled` — Python/Spark/Excel/NoSQL or another execution domain that the five-domain registry does not model as a canonical concept.
- candidates: none (unmatched)
- title: Spark secured execution
- nearest heading: Spark secured execution (`fabric-note:video15/V15-OLS-030`)

**Text**

```text
Spark secured execution Meet OneLake Spark Catalog/runtime prerequisites rather than escalating reader privilege.
```

**Before**
- `fabric-note:video15/V15-OLS-029`: Spark secured execution Check runtime, OneLake Spark catalog, table format, and effective identity before asserting a universal Spark limitation.
- `fabric-note:video15/V15-OLS-030`: Spark secured execution Prefer authorized table-name access; test with the correct Spark runtime/catalog and user.

**After**
- `fabric-note:video15/V15-OLS-032`: Spark secured execution Separate secure source read from destination write permission and audit data propagation.
- `fabric-note:video15/V15-OLS-033`: Spark secured execution Distinguish supported secure reads from write workflows on protected targets.

**Decision to write**

```json
{
  "unitId": "fabric-note:video15/V15-OLS-031",
  "scope": "batch-review",
  "batchId": "batch-ea6f505ce054",
  "parentContext": "<what surrounds this unit in the source>",
  "reading": "<what the unit actually claims, in your words>",
  "essentialMeaning": "<prose|question|formula|procedure|derived-summary|figure|index|table>",
  "evidenceQuote": "<verbatim substring of the text above>",
  "candidateVerdict": "<confirmed|revised|missed|false-positive>",
  "concepts": [
    {
      "conceptId": "concept:<domain>:<slug>",
      "role": "primary|secondary"
    }
  ],
  "relationHints": [],
  "decision": "<accepted|revised|held|unresolved-gap>",
  "decisionCode": "<short-kebab-case-code>",
  "rationale": "<why this decision, traceable to the text>",
  "unresolved": []
}
```

## 3. `fabric-note:video15/V15-OLS-030`

- family: `fabric-notes` | language: `en` | forms: note, timestamped-summary
- locator: `pack=video15; chapter=V15-OLS-030` | href: `/lab/dp-600/resources/?pack=video15#study-notes`
- unmatched reason: `domain-not-modelled` — Python/Spark/Excel/NoSQL or another execution domain that the five-domain registry does not model as a canonical concept.
- candidates: none (unmatched)
- title: Spark secured execution
- nearest heading: Spark secured execution (`fabric-note:video15/V15-OLS-029`)

**Text**

```text
Spark secured execution Prefer authorized table-name access; test with the correct Spark runtime/catalog and user.
```

**Before**
- `fabric-note:video15/V15-OLS-028`: SQL endpoint identity Correct the owner’s workspace role while keeping business readers least privileged.
- `fabric-note:video15/V15-OLS-029`: Spark secured execution Check runtime, OneLake Spark catalog, table format, and effective identity before asserting a universal Spark limitation.

**After**
- `fabric-note:video15/V15-OLS-031`: Spark secured execution Meet OneLake Spark Catalog/runtime prerequisites rather than escalating reader privilege.
- `fabric-note:video15/V15-OLS-032`: Spark secured execution Separate secure source read from destination write permission and audit data propagation.

**Decision to write**

```json
{
  "unitId": "fabric-note:video15/V15-OLS-030",
  "scope": "batch-review",
  "batchId": "batch-ea6f505ce054",
  "parentContext": "<what surrounds this unit in the source>",
  "reading": "<what the unit actually claims, in your words>",
  "essentialMeaning": "<prose|question|formula|procedure|derived-summary|figure|index|table>",
  "evidenceQuote": "<verbatim substring of the text above>",
  "candidateVerdict": "<confirmed|revised|missed|false-positive>",
  "concepts": [
    {
      "conceptId": "concept:<domain>:<slug>",
      "role": "primary|secondary"
    }
  ],
  "relationHints": [],
  "decision": "<accepted|revised|held|unresolved-gap>",
  "decisionCode": "<short-kebab-case-code>",
  "rationale": "<why this decision, traceable to the text>",
  "unresolved": []
}
```

## 4. `fabric-note:video15/V15-OLS-035`

- family: `fabric-notes` | language: `en` | forms: note, timestamped-summary
- locator: `pack=video15; chapter=V15-OLS-035` | href: `/lab/dp-600/resources/?pack=video15#study-notes`
- unmatched reason: `domain-not-modelled` — Python/Spark/Excel/NoSQL or another execution domain that the five-domain registry does not model as a canonical concept.
- candidates: none (unmatched)
- title: Spark secured execution
- nearest heading: Spark secured execution (`fabric-note:video15/V15-OLS-034`)

**Text**

```text
Spark secured execution Use a least-privilege, matching identity matrix across engines to avoid testing false equivalents.
```

**Before**
- `fabric-note:video15/V15-OLS-033`: Spark secured execution Distinguish supported secure reads from write workflows on protected targets.
- `fabric-note:video15/V15-OLS-034`: Spark secured execution Engine authorization and integration determine filtering versus safe rejection.

**After**
- `fabric-note:video15/V15-OLS-036`: Direct Lake and BI Design for OneLake data-plane enforcement and explicitly test the model security identity.
- `fabric-note:video15/V15-OLS-037`: Direct Lake and BI If security is authored in SQL only, choose an appropriate SQL-based model path or implement actual OneLake policies.

**Decision to write**

```json
{
  "unitId": "fabric-note:video15/V15-OLS-035",
  "scope": "batch-review",
  "batchId": "batch-ea6f505ce054",
  "parentContext": "<what surrounds this unit in the source>",
  "reading": "<what the unit actually claims, in your words>",
  "essentialMeaning": "<prose|question|formula|procedure|derived-summary|figure|index|table>",
  "evidenceQuote": "<verbatim substring of the text above>",
  "candidateVerdict": "<confirmed|revised|missed|false-positive>",
  "concepts": [
    {
      "conceptId": "concept:<domain>:<slug>",
      "role": "primary|secondary"
    }
  ],
  "relationHints": [],
  "decision": "<accepted|revised|held|unresolved-gap>",
  "decisionCode": "<short-kebab-case-code>",
  "rationale": "<why this decision, traceable to the text>",
  "unresolved": []
}
```

## 5. `fabric-note:video15/V15-OLS-010`

- family: `fabric-notes` | language: `en` | forms: note, timestamped-summary
- locator: `pack=video15; chapter=V15-OLS-010` | href: `/lab/dp-600/resources/?pack=video15#study-notes`
- unmatched reason: `domain-not-modelled` — Python/Spark/Excel/NoSQL or another execution domain that the five-domain registry does not model as a canonical concept.
- candidates: none (unmatched)
- title: Column and object security
- nearest heading: Column and object security (`fabric-note:video15/V15-OLS-009`)

**Text**

```text
Column and object security Use supported Spark catalog/runtime and table-name access; expect filtered data, not a blanket bypass.
```

**Before**
- `fabric-note:video15/V15-OLS-008`: Column and object security Create OLS table scope and a CLS allowlist of non-sensitive columns; test via each consumer engine.
- `fabric-note:video15/V15-OLS-009`: Column and object security Select an explicit allowed-column projection for SQL analytics endpoint consumers.

**After**
- `fabric-note:video15/V15-OLS-011`: Column and object security Separate data security enforcement from UI preview limitations and choose an appropriate read test.
- `fabric-note:video15/V15-OLS-012`: Column and object security Test positive and negative object access under the target principal; do not widen permissions simply for troubleshooting.

**Decision to write**

```json
{
  "unitId": "fabric-note:video15/V15-OLS-010",
  "scope": "batch-review",
  "batchId": "batch-ea6f505ce054",
  "parentContext": "<what surrounds this unit in the source>",
  "reading": "<what the unit actually claims, in your words>",
  "essentialMeaning": "<prose|question|formula|procedure|derived-summary|figure|index|table>",
  "evidenceQuote": "<verbatim substring of the text above>",
  "candidateVerdict": "<confirmed|revised|missed|false-positive>",
  "concepts": [
    {
      "conceptId": "concept:<domain>:<slug>",
      "role": "primary|secondary"
    }
  ],
  "relationHints": [],
  "decision": "<accepted|revised|held|unresolved-gap>",
  "decisionCode": "<short-kebab-case-code>",
  "rationale": "<why this decision, traceable to the text>",
  "unresolved": []
}
```

## 6. `fabric-note:video15/V15-OLS-056`

- family: `fabric-notes` | language: `en` | forms: note, timestamped-summary
- locator: `pack=video15; chapter=V15-OLS-056` | href: `/lab/dp-600/resources/?pack=video15#study-notes`
- unmatched reason: `domain-not-modelled` — Python/Spark/Excel/NoSQL or another execution domain that the five-domain registry does not model as a canonical concept.
- candidates: none (unmatched)
- title: Lifecycle and security QA
- nearest heading: Lifecycle and security QA (`fabric-note:video15/V15-OLS-055`)

**Text**

```text
Lifecycle and security QA Test group types and nested memberships explicitly across SQL, model and Spark; use supported identity groups.
```

**Before**
- `fabric-note:video15/V15-OLS-054`: Lifecycle and security QA Distinguish role-definition changes (~5 min) from group-membership propagation (approximately one hour, with engine caching possible).
- `fabric-note:video15/V15-OLS-055`: Lifecycle and security QA Test effective identity and both grant scopes across shortcut producer and consumer.

**After**
- `fabric-note:video16/V16-SQL-001`: Two-door architecture the automatically provisioned T-SQL surface reads the same Delta tables without a second data copy.
- `fabric-note:video16/V16-SQL-002`: Two-door architecture Fabric Warehouse supports T-SQL DML against Warehouse tables.

**Decision to write**

```json
{
  "unitId": "fabric-note:video15/V15-OLS-056",
  "scope": "batch-review",
  "batchId": "batch-ea6f505ce054",
  "parentContext": "<what surrounds this unit in the source>",
  "reading": "<what the unit actually claims, in your words>",
  "essentialMeaning": "<prose|question|formula|procedure|derived-summary|figure|index|table>",
  "evidenceQuote": "<verbatim substring of the text above>",
  "candidateVerdict": "<confirmed|revised|missed|false-positive>",
  "concepts": [
    {
      "conceptId": "concept:<domain>:<slug>",
      "role": "primary|secondary"
    }
  ],
  "relationHints": [],
  "decision": "<accepted|revised|held|unresolved-gap>",
  "decisionCode": "<short-kebab-case-code>",
  "rationale": "<why this decision, traceable to the text>",
  "unresolved": []
}
```

## 7. `fabric-case:e-manufacturing-spark-etl`

- family: `fabric-cases` | language: `en` | forms: scenario
- locator: `id=e-manufacturing-spark-etl` | href: `/lab/dp-600/cases/`
- unmatched reason: `domain-not-modelled` — Python/Spark/Excel/NoSQL or another execution domain that the five-domain registry does not model as a canonical concept.
- candidates: none (unmatched)
- title: E — Manufacturing Spark ETL
- nearest heading: Disappearing tables (`fabric-case:disappearing-tables`)

**Text**

```text
E — Manufacturing Spark ETL An engineering team reads secured production telemetry using Spark 3.5 and writes governed gold tables for analytics.
```

**Before**
- `fabric-case:delta-platform-modernization`: Delta platform modernization One of the team’s legacy Delta tables uses deprecated multi-part checkpoints. They want to move to the new sync architecture without modifying the Delta structure.
- `fabric-case:disappearing-tables`: Disappearing tables A user says a newly created table is missing from the endpoint. The table was created in Spark using a location under a custom lake folder rather than managed Tables. The endpoint refresh was tried twice.

**After**
- `fabric-case:enterprise-reference-architecture`: Enterprise reference architecture A fabric team has twenty lakehouses, three mirrored databases and one SQL database, all in the same tenant. Operations wants to know which ones require manual SQL analytics endpoint provisioning.
- `fabric-case:erp-modernization`: ERP modernization A SQL developer insists that because the Lakehouse endpoint shares the Warehouse engine, all SQL Server statements should work identically. The team must validate migration risk.

**Decision to write**

```json
{
  "unitId": "fabric-case:e-manufacturing-spark-etl",
  "scope": "batch-review",
  "batchId": "batch-ea6f505ce054",
  "parentContext": "<what surrounds this unit in the source>",
  "reading": "<what the unit actually claims, in your words>",
  "essentialMeaning": "<prose|question|formula|procedure|derived-summary|figure|index|table>",
  "evidenceQuote": "<verbatim substring of the text above>",
  "candidateVerdict": "<confirmed|revised|missed|false-positive>",
  "concepts": [
    {
      "conceptId": "concept:<domain>:<slug>",
      "role": "primary|secondary"
    }
  ],
  "relationHints": [],
  "decision": "<accepted|revised|held|unresolved-gap>",
  "decisionCode": "<short-kebab-case-code>",
  "rationale": "<why this decision, traceable to the text>",
  "unresolved": []
}
```

## 8. `fabric-note:video15/V15-OLS-029`

- family: `fabric-notes` | language: `en` | forms: note, timestamped-summary
- locator: `pack=video15; chapter=V15-OLS-029` | href: `/lab/dp-600/resources/?pack=video15#study-notes`
- unmatched reason: `domain-not-modelled` — Python/Spark/Excel/NoSQL or another execution domain that the five-domain registry does not model as a canonical concept.
- candidates: none (unmatched)
- title: Spark secured execution
- nearest heading: SQL endpoint identity (`fabric-note:video15/V15-OLS-028`)

**Text**

```text
Spark secured execution Check runtime, OneLake Spark catalog, table format, and effective identity before asserting a universal Spark limitation.
```

**Before**
- `fabric-note:video15/V15-OLS-027`: SQL endpoint identity Inspect owner identity and required workspace role; do not confuse API caller SPN support with ownership-sync support.
- `fabric-note:video15/V15-OLS-028`: SQL endpoint identity Correct the owner’s workspace role while keeping business readers least privileged.

**After**
- `fabric-note:video15/V15-OLS-030`: Spark secured execution Prefer authorized table-name access; test with the correct Spark runtime/catalog and user.
- `fabric-note:video15/V15-OLS-031`: Spark secured execution Meet OneLake Spark Catalog/runtime prerequisites rather than escalating reader privilege.

**Decision to write**

```json
{
  "unitId": "fabric-note:video15/V15-OLS-029",
  "scope": "batch-review",
  "batchId": "batch-ea6f505ce054",
  "parentContext": "<what surrounds this unit in the source>",
  "reading": "<what the unit actually claims, in your words>",
  "essentialMeaning": "<prose|question|formula|procedure|derived-summary|figure|index|table>",
  "evidenceQuote": "<verbatim substring of the text above>",
  "candidateVerdict": "<confirmed|revised|missed|false-positive>",
  "concepts": [
    {
      "conceptId": "concept:<domain>:<slug>",
      "role": "primary|secondary"
    }
  ],
  "relationHints": [],
  "decision": "<accepted|revised|held|unresolved-gap>",
  "decisionCode": "<short-kebab-case-code>",
  "rationale": "<why this decision, traceable to the text>",
  "unresolved": []
}
```

## 9. `fabric-case:disappearing-tables`

- family: `fabric-cases` | language: `en` | forms: scenario
- locator: `id=disappearing-tables` | href: `/lab/dp-600/cases/`
- unmatched reason: `domain-not-modelled` — Python/Spark/Excel/NoSQL or another execution domain that the five-domain registry does not model as a canonical concept.
- candidates: none (unmatched)
- title: Disappearing tables
- nearest heading: Delta platform modernization (`fabric-case:delta-platform-modernization`)

**Text**

```text
Disappearing tables A user says a newly created table is missing from the endpoint. The table was created in Spark using a location under a custom lake folder rather than managed Tables. The endpoint refresh was tried twice.
```

**Before**
- `fabric-case:delegated-sql-and-onelake`: Delegated SQL and OneLake OneLake security roles limit region visibility in Spark. On the same lakehouse, a SQL endpoint in delegated identity mode returns more rows to an analyst than Spark does.
- `fabric-case:delta-platform-modernization`: Delta platform modernization One of the team’s legacy Delta tables uses deprecated multi-part checkpoints. They want to move to the new sync architecture without modifying the Delta structure.

**After**
- `fabric-case:e-manufacturing-spark-etl`: E — Manufacturing Spark ETL An engineering team reads secured production telemetry using Spark 3.5 and writes governed gold tables for analytics.
- `fabric-case:enterprise-reference-architecture`: Enterprise reference architecture A fabric team has twenty lakehouses, three mirrored databases and one SQL database, all in the same tenant. Operations wants to know which ones require manual SQL analytics endpoint provisioning.

**Decision to write**

```json
{
  "unitId": "fabric-case:disappearing-tables",
  "scope": "batch-review",
  "batchId": "batch-ea6f505ce054",
  "parentContext": "<what surrounds this unit in the source>",
  "reading": "<what the unit actually claims, in your words>",
  "essentialMeaning": "<prose|question|formula|procedure|derived-summary|figure|index|table>",
  "evidenceQuote": "<verbatim substring of the text above>",
  "candidateVerdict": "<confirmed|revised|missed|false-positive>",
  "concepts": [
    {
      "conceptId": "concept:<domain>:<slug>",
      "role": "primary|secondary"
    }
  ],
  "relationHints": [],
  "decision": "<accepted|revised|held|unresolved-gap>",
  "decisionCode": "<short-kebab-case-code>",
  "rationale": "<why this decision, traceable to the text>",
  "unresolved": []
}
```

## After the batch

1. Append the decisions to `intelligent-atlas/semantic/review-decisions.json`.
2. Run `node intelligent-atlas/tools/review-workbench.mjs check`.
3. Run `node intelligent-atlas/tools/build-semantic-ledger.mjs`.
4. Run `node intelligent-atlas/tools/review-workbench.mjs coverage`.
