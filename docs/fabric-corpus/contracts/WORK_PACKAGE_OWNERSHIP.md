# Work-package ownership and dependency boundaries — FROZEN (FC01)

Status: frozen by FC01 on 2026-11-05. Enforced for every sub-agent task.

## Rule

Each work package owns the write-exclusive areas below. Everything else is
read-only to that package. Shared contracts (identity registry, route
registry, shard manifest, release manifest, the contract documents in
`docs/fabric-corpus/contracts/`) have exactly one writer at a time; the
integration lead merges after each contract checkpoint. No two agents ever
write the same generated manifest, renderer, model or test fixture.

## Write ownership map (repo paths, relative to repo root)

| Package | Write-owned areas |
|---|---|
| FC01 / lead | `docs/fabric-corpus/contracts/**`, `tools/fabric-corpus/README.md`, `tools/fabric-corpus/profiles/` (until FC11 takes over), `tools/fabric-corpus/bench/**`, release manifests |
| FC02 | `tools/fabric-corpus/registry/**`, `docs/fabric-corpus/ledgers/**`; Wave 2 addition: registry JSON schemas under `tools/fabric-corpus/schemas/registry-*.schema.json` |
| FC03 | `tools/fabric-corpus/compiler/**`, `tools/fabric-corpus/schemas/**` (compiler artifacts), `tools/fabric-corpus/fixtures/**` |
| FC04 | `lib/atlas/model.ts`, `lib/atlas/server.ts`, `lib/atlas/field.ts`, `components/atlas/**`, `tests/atlas/**` |
| FC05 | `app/learn/fabric/**`, `lib/fabric/articles/**`, `components/fabric/article/**`, `tools/fabric-corpus/route-registry/**` |
| FC06 | `content/fabric/bindings/**`, `content/fabric/collections/**`, `lib/fabric/bindings.ts`, `components/fabric/reading/**`, binding-related `tests/content/**` |
| FC07 | `lib/search/**` (additive only), `app/search/**` updates, `tools/fabric-corpus/search/**`, `public/fabric-search/**` build outputs, `tests/` search fixtures |
| FC08 | `content/atlas/fabric-extension.json`, `lib/atlas/fabric-targets.ts`, `tools/fabric-corpus/atlas/**` (Wave 2 grant), fabric-Atlas tests |

`lib/fabric/` is shared at directory level with file-level ownership:
`paths.ts` = FC11, `bindings.ts` = FC06, `articles/**` = FC05. No package
creates any other file there without a lead-approved ownership amendment.
Wiring a package's component or data into an EXISTING shared page
(`app/learn/[subject]/[topic]/page.tsx`, `app/learn/fabric/page.tsx`,
`app/layout.tsx`) is a lead merge step, performed after the owning package's
tests pass — sub-agents deliver self-contained components/data and the
integration points, not edits to shared pages.
| FC09 | `tools/fabric-corpus/sync/**` |
| FC11 | `tools/fabric-corpus/profiles/**`, `lib/fabric/paths.ts`, base-path integration in `lib/site.ts` (reviewed change) |
| FC12 | `.github/workflows/**`, `tools/fabric-corpus/packaging/**` |

## Dependency order (handover 04, unchanged)

FC01 → {FC02, FC03, FC04, FC11-start} in parallel (disjoint areas) →
FC05 (needs frozen FC02/FC03 contracts) → {FC06, FC07, FC08} in parallel
(read-only against the frozen route registry) → FC09 → {FC12, FC13} → FC10.

Renderer selection (App Router static params vs same-origin static HTML
compiler) stays OPEN until FC13 measures both on the full corpus. No package
may assume either renderer before that gate; FC05 implements the route
contract in a renderer-neutral shape so either can land.

## Checkpoint discipline

- Every boundary between packages ships integration fixtures (sample
  registry, sample compiled node, sample route entry) in the owning package's
  fixture area.
- Batch receipts report: source revision, paths touched, PASS/FAIL/NOT RUN/
  BLOCKED checks, and the recovery point (commit hash or ledger snapshot).
- Escalation path: discrepancy → integration lead → owner. No package
  silently resolves conflicts with another package's area.
