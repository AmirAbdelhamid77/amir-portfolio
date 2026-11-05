# Identity registry contract — FROZEN (FC01)

Status: frozen by FC01 on 2026-11-05. Owner: FC02 (sole writer);
integration lead merges at contract checkpoints.

## Principles

- Every pinned Git path in `FULL_CORPUS_COVERAGE.json` has exactly one
  terminal role and one outcome in the registry. Zero missing or duplicate
  rows (acceptance gate, 05 §Coverage reconciliation).
- IDs are minted once and never reused for different content. A content hash
  detects change; a reviewed rename or redirect preserves identity; neither
  proves equivalence.
- The registry is versioned in Git. Generated outputs carry the registry
  revision they were built from.

## ID scheme

| Kind | ID format | Key | Notes |
|---|---|---|---|
| SourceFile | `sf:<posix path>` | path within the pinned corpus tree | Content tracked by `sha256` column, not in the ID. |
| Fragment | `fg:<posix path>` | path | Includes, TOC pieces, shared snippets. |
| Asset | `as:<posix path>` | path | Images and media; storage dedup never merges identities. |
| Article | `art:<family>/<slug>` | family + ledger-assigned slug | 1:1 with its RouteTarget path. Structured-doc candidates that graduate to pages join this table. |
| RouteTarget | `rt:<logical path>[#anchor]` | unprefixed logical path, optional anchor | e.g. `rt:/learn/fabric/docs/onelake/create-lakehouse/`. |
| LearningBinding | `lb:<article id>@<subject>.<topic>` | article × subject.topic | One primary binding per eligible article; secondaries recorded with `role: secondary`. |
| ExternalDep | `dep:<repo>/<path>` | dependency repo + path | Cross-repo includes; requires pinned immutable revision before compile. |

Paths are POSIX-style, forward slashes, relative to the corpus root, never
containing `..`. The registry rejects any path escaping allowed roots.

## Registry files (FC02-owned, in `tools/fabric-corpus/registry/`)

- `identity.json` — the master table: one row per pinned path with
  `{ id, path, sha256, bytes, kind, disposition, plannedDestination, rights }`.
- `rights.json` — per-asset/per-article rights decisions: permission source,
  scope, attribution requirements, required notices, changes marker, reviewer,
  disposition, evidence pointer.
- `aliases.json` — reviewed renames/redirects: `from → to` with reviewer and
  evidence. Identity follows the reviewed canonical target.
- `schemata`: field-level JSON schemas live in `tools/fabric-corpus/schemas/`
  (FC03-owned) and are consumed by FC02 validation.

Ledger validation (run by FC02 after every write): unique IDs, unique paths,
path safety, disposition vocabulary match, every `art:` row resolving to an
`rt:` row, and reconciliation against the coverage manifest counts.

## Atlas concept and assertion IDs

New Fabric concepts introduced by FC08 follow the existing Atlas content ID
conventions in `content/atlas/*.json` (underscore/dash style used by
editorial records); corpus-originated concepts use a `fabric-` prefix to keep
provenance legible. Concept mappings and assertions stay subject to the
existing human semantic-publication gate (05 §4) — the registry records
`awaiting-review` mappings explicitly; it never manufactures graph assertions.

## Reference reconciliation

`content/study/references.json` (1,859 records; 1,037 rows with `/fabric/`
URLs) is reconciled by FC02: exact Fabric Learn URL subset counted against the
handover's "919" figure, each matched to an `sf:` row or recorded as a
no-local-destination exception with disposition.
