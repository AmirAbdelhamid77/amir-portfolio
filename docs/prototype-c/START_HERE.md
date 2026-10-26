# Hansa Prototype C — Hybrid Knowledge Stage

Owner request: 26 October 2026. Scope: implement a local, reviewable prototype and an actionable agent handoff. **No deployment authorization.**

## Read order
1. Repository `AGENTS.md`, then the active `docs/agent-reference/START_HERE.md` hierarchy.
2. [Source audit and reality check](SOURCE_AUDIT.md).
3. [Complete interaction, visual and wireframe specification](IMPLEMENTATION_SPEC.md).
4. [Canonical content and editorial gates](CONTENT_GOVERNANCE.md).
5. [Acceptance, testing, release and rollback](QA_RELEASE_ROLLBACK.md).
6. [Actual validation results](VALIDATION.md), `qa/browser-results.json`, `qa/live-snapshot.json`, and `preservation/verification.json`.

## Run the current implementation
From `D:/BeUI/amir-portfolio`, use existing dependencies; no install is required.

```powershell
rtk proxy npm run build
rtk proxy node scripts/serve-out.mjs 4197
```

Open `http://localhost:4197/prototype-c/`. The ordinary `/` retains the existing learning-first landing page by default. The isolated prototype has noindex/nofollow metadata. Its editorial samples are not public-approved content; **noindex is not an access-control boundary**. Do not upload this preview export to production.

Optional **local root-page preview**, after preserving any existing environment value:

```powershell
$env:NEXT_PUBLIC_HANSA_PROTOTYPE_C = '1'
rtk proxy npm run build
rtk proxy node scripts/serve-out.mjs 4198
```

The build-time flag selects the same component at `/`. Clearing it and rebuilding restores the prior landing page. Do not clear a pre-existing owner value blindly; restore the value recorded before changing it. No runtime backend or deployment command is needed. The `/prototype-c/` route always previews the editorial samples in this local branch; production packaging must remove/gate that route before publication.

## What is implemented
- Responsive Knowledge Stage with a condensed three-edition Timeline.
- Original scenario → prediction cue → native explanation/caveat/source reveal.
- Card Dealer interaction adapted to a readable, ordered one-card deck, with next/reset.
- Canonical existing Atlas Peek, retaining the existing public projection gate.
- Scoped Today / Learn / Practice / Atlas / About navigation on the prototype.
- Searchable/filterable archive, empty state, reset, edition permalinks, browser Back/reload.
- Existing global search, lessons, practice and About remain ordinary existing links.
- No new persistence, question-bank merge, mastery scoring, account, API, package or hosting service.

## Deliberate boundaries
- The original conversation contains user direction but opaque assistant reference markers. Its detailed A/C mockups are unavailable here. This pack defines a concrete interpretation; it does not claim to reconstruct unseen design files.
- Global navigation on other pages remains the current site navigation. The five-item IA is demonstrated in the prototype and specified for later sitewide adoption; URL migrations are out of scope.
- Three editorial sample insights are in `technical_review`. The public insight projection is empty. Human approval/publication is still required. Historical bank/Atlas review states were not changed.
- No complete raw-export, entire-bank scientific audit, field CWV study or human screen-reader certification is claimed.

## Agent execution contract
Do not reset, clean, stash, commit or revert the dirty repository wholesale. Compare current hashes with the baseline and successor manifest. Continue incrementally. For later refinements, preserve existing edition IDs, source references, legacy links and progress keys. Write a new successor receipt instead of rewriting historical manifests.

Next atomic task after owner design review: resolve any remaining items in `VALIDATION.md`, then obtain human editorial review of the three new scenarios. A future public landing page must use the public content projection, remove preview-only labels/route exposure as appropriate, and pass all release gates before requesting deployment approval.
