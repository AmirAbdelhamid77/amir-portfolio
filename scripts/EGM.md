# Build and maintenance scripts

## Overview

The [package manifest](../package.json) is the entry point for build, import, test and deployment commands. This contract describes representative build and verification boundaries.

## Interface

- `npm run build` invokes Next.js and then the [postbuild alias script](./export-segment-aliases.mjs). The latter expects an existing `out/` tree under the working directory.
- `import:data-viz` points to [the visualization importer](./import-notion-data-viz.mjs) with an explicit source-export path. `import:fabric` invokes [the Fabric importer](./import-fabric-bank.mjs).
- [The reference verifier](./verify-agent-reference.mjs) checks reference hashes, paths and router settings. Its [receipt chain](./final-review-receipt.mjs) also checks sealed integration artifacts.

## Invariants

- The alias script selects files inside `__next.*` segment directories and creates flat, dot-separated aliases beneath the same export root. These aliases address exported segment payloads, a separate concern from public page URLs.
- Follow the [active reference map](../docs/agent-reference/START_HERE.md) for reference ownership and reconciliation.

## Side Effects

- The build writes exported site assets. The postbuild alias script creates directories as needed and copies payloads into `out/`.
- Import commands populate repository content. The declared deploy command builds and invokes Wrangler, which targets the configured static assets service.
- The inspected reference verifier reads files and asserts expected values.

## Verification

- From the repository root, run `node scripts/verify-agent-reference.mjs` for reference integrity. Consult the manifest and script before using other maintenance commands, since build, import and deployment commands have write effects.
