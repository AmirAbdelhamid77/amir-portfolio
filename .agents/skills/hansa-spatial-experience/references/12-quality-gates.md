# 12 — Quality gates and scoring standards

## Hard blockers — any one = NO-GO for production
- Provenance/semantic error or invented edge, metric, approval status or answer.
- User task impossible without GPU/motion or inaccessible to keyboard/touch.
- Critical 3D component only works with mouse hover; no reset or escape route.
- Loss of existing route/content/progress/bank identifiers; conflicted concurrent agent edits.
- Browser crash, repeated GPU context-loss failure, no functional fallback.
- Hidden text or misleading quantitative comparison due to perspective/occlusion.
- Deploy or dependency installation without explicit authorization.

## Scorecard — 0-5 each, weighted
1. Data/source integrity (weight 16, hard gate).
2. Distinctive composition & visual signature (14).
3. True spatial craft / credible 2.5D (12).
4. Meaningful interaction (12).
5. Semantic motion & continuity (10).
6. Accessibility & equivalent paths (12, hard gate).
7. Responsive transformation (8).
8. Runtime performance & fallback (8, hard gate).
9. Contextual usefulness/learning outcome (5).
10. Maintainability/clean integration (3).
Total is a weighted 0..100 score after scaling scores /5. Recommend >=85 for flagship prototype refinement sign-off, >=80 for integration proposal review; these are skill targets, NOT automatic release authorization. Hard blockers override scores.

## Evidence bundles for truthful results
- At least two actual alternate compositions documented; for a flagship, four proposed and two prototyped when feasible.
- Screenshot at 320/390/768/1280px; only list widths actually tested.
- Interaction recording or event check: click, touch, focus, selected, filter, reset, camera limits, interrupted transitions.
- Reduced-motion, no-canvas fallback and high-contrast smoke test.
- Browser console errors and hydration/memory/performance traces; run tests or mark `NOT RUN`.
- Data-to-geometry traceable mapping and exact content source.
- Git diff summary and no-concurrent-edit attestation for any repo changes.

## Anti-generic sign-off questions
Would a screenshot look substantially different if all brand colors were removed? Is the silhouette memorable? Is it a real 3D experience (if claimed) or merely tilted cards? Is there a revealing interaction beyond hover scale? Does the scene adjust at mobile rather than shrink? Does movement encode anything useful? Can real, messy data fit?

## Rubric status
`IDEA` = unimplemented; `PROTOTYPE_UNVERIFIED` = prototype without browser QA; `PROTOTYPE_REVIEWED` = validated interactions and screenshot review; `INTEGRATION_READY` = clean diff + relevant tests + author approval to merge; `DEPLOYED_VERIFIED` = externally deployed and tested only if actually done. Never skip statuses.
