# Redirect ledger (aliases)

- Corpus revision: `774592ea3f2d4558f763d6e5b74abf4785948fb5` (pinned MicrosoftDocs/fabric-docs).
- Generated: `2026-11-05T17:42:39.870Z` by `tools/fabric-corpus/registry/build-aliases.mjs`. Reviewer of record: FC02; final alias approval follows the reviewed-rename rule in IDENTITY_REGISTRY.md.
- Publish config: `.openpublishing.publish.config.json` at the repo root references **20** redirection files; **22** redirection files are present on disk and tracked; **1** config-referenced file is missing (BLOCKER below); **3** present files are NOT referenced by the config.
- Rows parsed: **1014** across 22 files (159 with `redirect_document_id: true`).

## File inventory

| Redirection file | Present | In publish config | Rows |
|---|---|---|---|
| `.openpublishing.redirection.json` | yes | NO | 0 |
| `docs/admin/.openpublishing.redirection.admin.json` | yes | yes | 14 |
| `docs/cicd/.openpublishing.redirection.cicd.json` | yes | yes | 4 |
| `docs/data-engineering/.openpublishing.redirection.data-engineering.json` | yes | yes | 10 |
| `docs/data-factory/.openpublishing.redirection.data-factory.json` | yes | yes | 102 |
| `docs/data-science/.openpublishing.redirection.data-science.json` | yes | yes | 32 |
| `docs/data-warehouse/.openpublishing.redirection.data-warehouse.json` | yes | yes | 22 |
| `docs/database/.openpublishing.redirection.database.json` | yes | yes | 64 |
| `docs/database/hub/.openpublishing.redirection.database-hub.json` | yes | yes | 2 |
| `docs/database/sql/.openpublishing.redirection.sql-database.json` | yes | yes | 3 |
| `docs/enterprise/.openpublishing.redirection.enterprise.json` | yes | yes | 10 |
| `docs/extensibility-toolkit/.openpublishing.redirection.extensibility-toolkit.json` | yes | yes | 1 |
| `docs/fundamentals/.openpublishing.redirection.fundamentals.json` | yes | yes | 405 |
| `docs/governance/.openpublishing.redirection.governance.json` | yes | NO | 7 |
| `docs/graph/.openpublishing.redirection.graph.json` | yes | yes | 1 |
| `docs/iq/.openpublishing.redirection.iq.json` | yes | yes | 31 |
| `docs/known-issues/.openpublishing.redirection.known-issues.json` | yes | yes | 87 |
| `docs/onelake/.openpublishing.redirection.onelake.json` | yes | yes | 27 |
| `docs/real-time-hub/.openpublishing.redirection.real-time-hub.json` | yes | NO | 3 |
| `docs/real-time-intelligence/.openpublishing.redirection.real-time-intelligence.json` | yes | yes | 156 |
| `docs/security/.openpublishing.redirection.security.json` | yes | yes | 9 |
| `docs/workload-development-kit/.openpublishing.redirection.workload-development-kit.json` | yes | yes | 24 |

Total rows: **1014**. The handover's "19 present files / 1,004 rows" counts only the config-referenced files that exist on disk; adding the unreferenced governance (7), real-time-hub (3) and root (0) files gives 1,014 — the claim reconciles under that definition.

## Target classification

- `absolute-url`: 2
- `docs-relative`: 1
- `fabric-site-relative`: 1000
- `other`: 2
- `other-docset-site-relative`: 9
- with query string: 1; with fragment: 13; `redirect_document_id: true`: 159; self-redirects: 1.
- /fabric/... targets resolving to a real path in the pinned corpus: **505**; targets that are themselves redirect sources (chain via the alias map): **483**; unresolvable in the pinned snapshot: **12** (stale upstream targets — sample in `aliases.json#unresolvableTargetsSample`).

## Chains and cycles

- Redirect targets that point at another redirect source (chains): **397** recorded in `aliases.json#chains`.
- Cycles (a redirect graph loop): **0**.

## Data-quality anomalies (recorded, not silently normalized)

- Rows using non-standard key `source_path` instead of `source_path_from_root`: 1 (docs/data-science/.openpublishing.redirection.data-science.json).
- Sources written with a trailing slash: 20.
- Sources written with trailing whitespace: 1.
- Sources missing the leading slash (normalized, anomaly recorded): 1.
- Rows with null source: 0.

## BLOCKER

- **blk-0001 — missing-redirection-file: `docs/database/mirrored-database/.openpublishing.redirection.database.json`** — Referenced by the publish config but neither present on disk nor tracked in the coverage manifest at revision 774592ea (directory docs/database/mirrored-database/ does not exist). Upstream publishing would fail or silently skip this alias map. Remediation owner: FC02 (ledger record) / upstream investigation. Evidence: fabric-docs-light@774592ea:path-absent; FULL_CORPUS_COVERAGE.json@774592ea:no-such-row.

## Consumed by

- `tools/fabric-corpus/registry/aliases.json` (machine ledger, 1:1 with this document).
- Identity registry rows with disposition `redirect-map` (22 files).

