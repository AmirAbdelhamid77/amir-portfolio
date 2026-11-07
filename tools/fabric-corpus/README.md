# tools/fabric-corpus — offline compiler workspace

The reproducible offline compiler for the pinned Microsoft Fabric corpus
(`D:\BeUI\fabric-docs-light`, revision `774592ea…`, see
`docs/fabric-corpus/contracts/`). This directory is versioned in Git; all
generated output lives outside Git in `FABRIC_CORPUS_BUILD_DIR` (default
`<repo>/../fabric-corpus-build`).

## Layout (ownership per docs/fabric-corpus/contracts/WORK_PACKAGE_OWNERSHIP.md)

```
tools/fabric-corpus/
  README.md            this file (FC01/lead)
  bench/               export benchmark harness (FC01/lead; FC13 consumes)
  profiles/            delivery profile seeds (FC11 owns after Wave 1)
  registry/            identity/rights ledgers (FC02; populated in Wave 1)
  compiler/            parser, AST, dependency resolver, transforms (FC03)
  schemas/             JSON schemas for all emitted artifacts (FC03)
  fixtures/            golden fixtures at package boundaries (FC03)
  route-registry/      route registry schema (FC05; runtime output in build dir)
  search/              shard manifest schema + indexer (FC07)
  sync/                upstream sync + invalidation (FC09)
  packaging/           CI packaging recipes (FC12)
```

## Compiler invariants (handover 03, binding on FC03)

- Compile from pinned blobs at the pinned revision; deterministic output:
  canonical sort, normalized text, no clock or live I/O in the compiler.
- Parse front matter, TOC, redirects, Markdown into typed nodes with source
  spans; build the full dependency graph (includes, code, images, links,
  anchors, locale/applicability refs). Quarantine on recursion, traversal,
  unknown directives, missing content — accounting continues, promotion fails
  if any eligible article stays blocked.
- Sanitize HTML and URL schemes; preserve heading anchors, tables, formulas,
  code; expand Learn notes/tabs/zones into accessible equivalents; log every
  removed or transformed block.
- No unresolved dependency or rights hold may enter a published projection.
- Emit: route registry, article data per route, learning bindings, search
  shards, Atlas projections — all checksummed, all read from the build dir at
  app build time.

## Benchmark harness

`node tools/fabric-corpus/bench/measure-export.mjs [--no-build] [--label name]`

Measures: clean-build wall time, postbuild alias-script time, output file
count by type, total bytes, largest assets, top-level distribution. Writes a
JSON report to `FABRIC_CORPUS_BUILD_DIR/bench/<label>.json`. Peak-RSS capture
is platform-dependent and is finalized by FC13 (Linux CI: `/usr/bin/time -v`;
local Windows: PowerShell `Get-Process` sampling). The harness never deploys
or publishes anything.

## Conventions

Node ≥22 ESM. Tests under `tests/fabric-corpus/` use the repo's
`node --experimental-strip-types --test` runner style with no `@/` aliases and
no JSON imports in test-imported modules (repo constraint). The compiler never
requires network access at compile time.
