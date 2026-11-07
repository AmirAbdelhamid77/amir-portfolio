# Application routes

## Overview

The Next.js App Router owns public entry points and metadata. Routes compose the [presentation layer](../components/EGM.md) and call [domain modules](../lib/EGM.md) to assemble data for static rendering.

## Interface

- [RootLayout](./layout.tsx) supplies the shared header, footer and study orientation.
- [HomePage](./page.tsx) and [LegacyLandingPage](./prototype-c/page.tsx) both render `HansaKnowledgeLanding`. The alias keeps its own entry point and declares `/` as canonical. See the [compatibility decision](../docs/canonical-home/REDIRECT_DECISION.md).
- [Learn](./learn/page.tsx) renders `CurriculumHome`. [Practice](./practice/page.tsx) mounts the visualization `PracticeBank` within a route that also links to other practice experiences.
- [SearchPage](./search/page.tsx) passes counts and featured entries to `SearchClient`. [GET](./search/index.json/route.ts) serializes the index payload through a `force-static` route handler.

## Invariants

- The two landing routes share one implementation. Route metadata belongs to each entry point.
- [NeighbourhoodReviewPage](./review/neighbourhood/page.tsx) calls `notFound()` unless `HANSA_ATLAS_REVIEW_PREVIEW=1` and the projection has concepts. Its metadata requests `noindex, nofollow`. The flag is a build-time gate in the static application.

## Side Effects

- The search route handler supplies a JSON asset at export time.
- The layout's inline theme script reads `amir-theme` and `amir-accent` in the browser and applies document styling before hydration.

## Verification

- The [curriculum route verifier](../scripts/verify-curriculum-routes.mjs) is registered as `npm run verify:curriculum` in the [manifest](../package.json).
- This contract covers representative routes. Full route and exported-asset parity are outside this bootstrap.
