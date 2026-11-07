# Release and storage contract — FROZEN (FC01)

Status: frozen by FC01 on 2026-11-05. Implements handover 02 §Source and
artifact storage and 03 §Hosting-agnostic release contract.

## What lives where

**In Git (this repo, integration branch):** the reproducible compiler source,
JSON schemas, identity/rights ledgers, curated mappings, golden fixtures,
delivery profiles, benchmark harness, and these contracts. Small text fixtures
only — no corpus content, no generated article bodies.

**Outside Git (`D:\BeUI\fabric-corpus-build\`, `FABRIC_CORPUS_BUILD_DIR`):**
upstream blob fetches, compiled article HTML/JSON data, search shards, Atlas
projections, route registry runtime outputs, media processing output, private
build evidence, benchmark reports, sync staging copies. Nothing in this tree
is committed anywhere.

**Never in Git history:** upstream checkouts, raw private evidence, generated
HTML/indexes/media (handover deployment amendment).

## Build-dir contract

- Environment variable `FABRIC_CORPUS_BUILD_DIR` overrides the build
  workspace location. Default when unset: `<repo>/../fabric-corpus-build`
  (resolves to `D:\BeUI\fabric-corpus-build` for this worktree).
- All build-time consumers (route registry for `generateStaticParams`, article
  data for pages, search shard manifest) read from this directory via `fs` at
  build time. No generated corpus file is committed into the repo, so no
  gitignore churn and no stale committed artifacts.
- CI builds the same shape: fetch pinned blobs into build storage, run the
  compiler, then run the app build. The app build fails closed if the registry
  or required article data is missing — never silently empties the namespace.

## Delivery profiles (FC11 owns the schema; frozen field set)

Two mandatory profiles built from the same frozen content release:

| Field | `root` (Vercel, optional Cloudflare) | `subpath` (GitHub Pages project site) |
|---|---|---|
| `basePath` | `""` | `/<repository>` |
| `publicOrigin` | canonical origin (owner-approved) | `https://<owner>.github.io` (or approved mirror policy) |
| `canonicalOrigin` | the approved canonical host | same |
| `trailingSlash` | `true` (matches `next.config.ts`) | `true` |
| `assetOrigin` | optional immutable asset origin (requires owner approval) | `""` |
| `robotsPolicy` | canonical/mirror marking | same |

Profiles differ only in delivery settings and must have identical logical
article, search, curriculum and Atlas coverage. Route registries stay
unprefixed; one resolver adds the base path exactly once at the output
boundary (assets, links, redirects, shard URLs, result targets, Atlas returns,
sitemap, robots, social metadata). Next-internal URLs already carrying a base
path get the dedicated no-double-prefix contract (FC11 test fixture).

## Release manifest (FC10-owned shape, frozen by FC01)

One release = `{ appSha, corpusRevision, dependencyRevisions[], compilerLock,
rendererVersion, rightsRevision, editorialRevision, profile, coverage
reconciliation, checksums }`. Atomically publish one coherent export + asset
set + shard manifest. Reproducibility within each build profile; full rebuild
is the fallback. Deployment activation remains a separate owner gate —
nothing here deploys, publishes, or activates a provider.
