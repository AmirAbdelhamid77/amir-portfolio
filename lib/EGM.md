# Domain models and data assembly

## Overview

This layer supplies typed content, projections and query logic to [routes](../app/EGM.md) and [components](../components/EGM.md). Some modules assemble data from repository content during static rendering. Others, such as the search matcher, also run in the browser.

## Interface

- [studyRecords](./study/server.ts) assembles study records from SQL, Fabric, Academy, insight and curated inputs. [curriculum and subjectHome](./curriculum/model.ts) expose curriculum and subject views.
- [buildSearchIndexPayload](./search/build-index.ts) builds a versioned payload from `buildSiteSearchIndex`. [searchSite](./search/query.ts) accepts documents, query text and filters.
- [PRACTICE_QUESTIONS](./data-viz/practice.ts) provides typed visualization practice questions to `PracticeBank`.
- [Atlas loaders](./atlas/server.ts) combine checked-in editorial and DP-600 data. `getAtlasPublic()` and `getAtlasReview()` select explicit projections. Legacy `getAtlas()` selects preview using `HANSA_ATLAS_REVIEW_PREVIEW`. `getAtlasReadingSources()` returns selected bibliographic fields for public Microsoft Learn links separately from the graph.

## Invariants

- [projectAtlas](./atlas/model.ts) admits only published records to the public projection. The preview projection additionally admits technical-review records. `validateDataset` requires published endpoints and a reviewer with the `Human:` prefix for published edges.
- Keep the graph, catalogue and TOC distinct, as described in the [Atlas architecture](../docs/knowledge-atlas/ARCHITECTURE.md).

## Side Effects

- The cited assembly and projection entry points operate on repository imports and return data to callers. Atlas's legacy projection also reads a build environment flag. Route and component callers determine which projection is serialized.

## Verification

- The [manifest](../package.json) lists `test:content`, `test:atlas`, `verify:curriculum` and `qa:search-index`. This contract covers representative interfaces. It does not assess the scientific accuracy of learning material.
