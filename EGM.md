# Hansa repository blueprint

## System Overview

Hansa is a static learning site and portfolio. Repository content flows through TypeScript models into Next.js routes. The export contains page assets and a static search index. Interactive components use those assets and browser state after loading. See the [README](./README.md) for setup and the [active reference map](./docs/agent-reference/START_HERE.md) for established project decisions.

## Local Interface & Invariants

- [next.config.ts](./next.config.ts) selects static export, trailing slashes and unoptimized images. `NEXT_PUBLIC_BASE_PATH` supplies both `basePath` and `assetPrefix` when set.
- [package.json](./package.json) declares Next.js 16.4.3, React 19.3.0 and the build and test commands. It also declares Motion, KaTeX, Zod and Sharp, with Tailwind CSS 4 in development dependencies.
- [wrangler.jsonc](./wrangler.jsonc) points to `out/` and configures trailing-slash and 404 handling using Workers Static Assets.

## Subdirectories & System Boundaries

- [app](./app/EGM.md) owns routes, metadata, layout and static response entry points.
- [components](./components/EGM.md) owns UI composition, client interactions and browser-side effects.
- [lib](./lib/EGM.md) owns domain interfaces, content assembly, search and Atlas projections. Checked-in inputs include [editorial Atlas data](./content/atlas/editorial.json) and the [insight feed](./content/knowledge/insights.json).
- [scripts](./scripts/EGM.md) owns offline maintenance and the postbuild compatibility step.

## Global Invariants

- The canonical Home and its legacy address render the same landing component. The compatibility decision is recorded in the [canonical-home documentation](./docs/canonical-home/REDIRECT_DECISION.md).
- Atlas publication is enforced at the projection boundary. Review flags affect distinct consumers in the inspected code. See the package contracts and the [Atlas integration guide](./docs/knowledge-atlas/START_HERE.md).

## Global Side Effects

- Build and postbuild write export assets. The deployment command uploads those assets through Wrangler.
- In the browser, search fetches the static index, and selected learning features and preferences store state locally. See the [component contract](./components/EGM.md) for examples.

## System Verification

- The [reference verifier](./scripts/verify-agent-reference.mjs) checks reference integrity. The [package manifest](./package.json) lists domain suites under `test:all`.
- This blueprint describes representative source boundaries in the inspected checkout. Deployment state, full feature coverage and browser behavior were outside this bootstrap.
