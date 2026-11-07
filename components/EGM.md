# Presentation components

## Overview

Components compose the shared site shell and feature interfaces for the [route layer](../app/EGM.md). Client components handle browser interactions while domain data and rules live in [lib](../lib/EGM.md).

## Interface

- [SiteHeader](./site-header.tsx) is a client component and exposes `activeHrefFor` for matching the current path to navigation.
- [HansaKnowledgeLanding](./knowledge/hansa-landing.tsx) assembles insight records, an Atlas projection and a stage model for [InsightStage](./knowledge/insight-stage.tsx). Both landing routes consume this entry point.
- [SearchClient](./search/search-client.tsx) accepts a total and featured records, loads the full static index and calls `searchSite` locally.
- [PracticeBank](./data-viz/practice-bank.tsx) reads `PRACTICE_QUESTIONS` and uses React state for the visualization practice interaction.

## Invariants

- The landing stage's main graph comes from `getAtlasPublic()`. In the inspected working tree, a separate neighbourhood prop receives `getAtlasReview()` only with `HANSA_NEIGHBOURHOOD_REVIEW=1`. `HANSA_TIMELINE_REVIEW` controls a separate timeline variant.
- The search client resolves `index.json` relative to the current page URL. The static route and trailing-slash configuration are part of that contract.

## Side Effects

- `SearchClient` fetches the static index from the current origin and aborts its request on cleanup. Query matching runs on the loaded records in the browser.
- [Theme controls](./theme-controls.tsx), the [Atlas journey](./atlas/journey.tsx) and the [Fabric unified bank](./fabric/unified-bank.tsx) use browser storage. These are separate from the visualization practice state described above.

## Verification

- [Package scripts](../package.json) expose `test:knowledge`, `test:atlas` and `qa:search` for related paths. Browser behavior and storage migration were outside this source review.
