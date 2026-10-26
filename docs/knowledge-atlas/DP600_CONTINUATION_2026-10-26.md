# DP-600 Atlas continuation - 26 October 2026

Second, additive Atlas/content layer. It extends the 2026-10-26 DP-600 expansion; it
does not replace it, does not rewrite any earlier manifest or baseline, and adds no
dependency, backend or deployment.

Preserved starting work: branch `feat/dp600-academy-ingestion-20261025`, HEAD `18ef2e0`,
100 dirty entries, no commit, reset, stash, clean or discarded file.

## What this layer adds

| Item | Count | Where |
| --- | --- | --- |
| Review concepts | 14 | `content/atlas/dp600-continuation.json` |
| Semantic relations | 18 | same |
| Official sources | 15 | same (all `learn.microsoft.com`, checked 2026-10-26) |
| Catalogue associations | 11 (8 questions, 3 lesson-note packs) | same `catalog` array |
| Objective-coverage rows | 10 plus 5 explicit open items | same `coverage` |

Atlas totals in the local review build move from 28 concepts / 31 relations to
**42 concepts / 49 relations**. Review-weight counts in `scripts/build-atlas-preview.mjs`
and `tests/atlas/expansion-e2e.mjs` were updated to the new numbers, not relaxed to a
range or removed.

New concepts: T-SQL query surface, KQL query, calculation group, dynamic format string,
field parameter, composite model, incremental refresh, XMLA endpoint, large semantic model
storage format, object-level security, warehouse column-level security, warehouse
row-level security, workspace role, lineage and impact analysis.

Coverage rows map the official DP-600 skills list (skills measured 19 October 2026,
`https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-600`)
to those concepts: SQL and KQL selection/filter/aggregation, calculation groups and
dynamic formats and field parameters, composite models, large semantic models,
incremental refresh, XMLA deployment and management, workspace/item access, layered
row/column/object security, and impact analysis.

## Review state (unchanged policy)

- Every new concept, relation and association is `editorialState: "technical_review"`.
- Reviewer string is `Agent documentation review 2026-10-26; not human approval`.
- The public projection stays fail-closed: `projectAtlas(data)` returns zero concepts,
  zero relations and zero catalogue entries, so nothing new is published to `out/`.
- Associations are catalogue metadata only. `tests/atlas/continuation.test.mjs` asserts
  no association id, `from` or `to` appears among semantic edges.
- Imported answers are not adjudicated. Associations cite question text/context and a
  primary-document locator; they are not answer validation.

## Blocked content kept blocked

- The 98 imported questions that reference absent exhibits remain labelled
  `Images required later` with scoring disabled. No exhibit was invented or reconstructed.
- Blocked questions are excluded as association targets; the test asserts every cited
  question id has no `blockers`.
- No conflicting source answer was resolved; the 101 matching-stem groups stay separate
  records with their original assertions.

## Files owned by this layer

New:

- `content/atlas/dp600-continuation.json` - the layer itself.
- `scripts/dp600-continuation-receipt.mjs` - third receipt link.
- `scripts/verify-dp600-continuation.mjs` - read-only gate for this layer.
- `tests/atlas/continuation.test.mjs` - 5 unit tests (projection, connectivity, sources,
  association integrity, coverage).
- `tests/atlas/continuation-e2e.mjs` - browser harness (1440 light, 390 dark).
- `docs/knowledge-atlas/DP600_CONTINUATION_2026-10-26.md` - this handover.
- `docs/knowledge-atlas/dp600-continuation/` - manifest plus `qa/` artifacts.

Modified:

- `lib/atlas/server.ts` - merges the third layer; `buildVersion` `atlas-dp600-2026-10-26.2`.
- `components/atlas/explorer.tsx` - inspector copy no longer claims all question mappings
  are pending; it now states that question/lesson/note links are documentation-reviewed
  catalogue associations, not answer validation, and that publication still needs human
  review. This was stale text that contradicted the visible "Learn and apply" links.
- `scripts/dp600-expansion-receipt.mjs` - consults the continuation receipt so the existing
  guards resolve current hashes instead of reporting drift.
- `scripts/build-atlas-preview.mjs` - review counts 42/49.
- `scripts/verify-preservation-history.mjs` - the disposable-copy check now also copies the
  continuation manifest and the files it binds, so the chained receipt can resolve in the
  scratch directory. No assertion was relaxed; the required set only grew.
- `tests/atlas/expansion-e2e.mjs` - review counts 42/49 (file edited, not re-run; it
  overwrites expansion-manifest-hashed screenshots).

Untouched on purpose: `content/atlas/editorial.json`, `content/atlas/dp600-extension.json`,
the expansion manifest, its `START_BASELINE.json`, `docs/knowledge-atlas/START_HERE.md`
(hashed) and every saved-session key or format.

`docs/knowledge-atlas/NEXT_AGENT_START_HERE.md` is hashed by
`docs/knowledge-atlas/INTEGRATION_MANIFEST.json`, so it stays byte-identical
(`075d3602253f4f4a7fa4d2390864b010c5ec5e7b3d4a74ddff5fd030dffc4ea5`). A pointer line was
added, caught by `verify-knowledge-atlas.mjs` as integration drift, and reverted rather
than rewriting the documentation manifest. This layer is found through
`docs/knowledge-atlas/dp600-continuation/INTEGRATION_MANIFEST.json` and `git status`.

## Verification

Run from `D:\BeUI\amir-portfolio`. Logs are in
`docs/knowledge-atlas/dp600-continuation/qa/`.

| Command | Result |
| --- | --- |
| `node scripts/build-atlas-preview.mjs` | PASS - review build written, normal export restored with unpublished relations excluded (`qa/build.log`) |
| `node --experimental-strip-types scripts/verify-dp600-continuation.mjs` | PASS - 42 review concepts, 49 review relations, 1 review notice, public projection empty, 18 continuation claims only in `build/atlas-preview/out` (`qa/continuation.log`) |
| `node tests/atlas/continuation-e2e.mjs` | PASS - 42-concept count, search narrowing to 1 of 42, calculation-group inspector with official source, incremental-refresh focus, question deep link with `atlasReturn`, notes return path, no horizontal overflow; no page errors (`qa/BROWSER.json`, `qa/browser.log`, screenshots) |
| `node --experimental-strip-types scripts/verify-knowledge-atlas.mjs` | PASS (`qa/references.log`) |
| `node scripts/verify-agent-reference.mjs` | PASS - 13 active hashes, router v1.1, rubric weights, 6 intake hashes (`qa/references.log`) |
| `node scripts/verify-easyui-integration.mjs` | PASS (`qa/easyui.log`) |
| `node --experimental-strip-types scripts/verify-atlas-implementation.mjs` | PASS (`qa/implementation.log`) |
| `node --experimental-strip-types scripts/verify-preservation-history.mjs` | PASS (`qa/history.log`) |
| `node --experimental-strip-types --test tests/{data-viz,statistics,fabric,content,atlas,academy}/*.test.mjs` | PASS - 157 tests, 0 fail (`qa/unit-all.log`) |
| `npx tsc --noEmit` | PASS (`qa/tsc.log`) |
| `npm run lint` | PASS (`qa/lint.log`) |

Not run or not provable here:

- Human editorial approval and publication of any `technical_review` record: BLOCKED on a
  named reviewer. The Atlas public projection is still empty by design.
- Screen-reader, real touch-device and Core Web Vitals checks: NOT RUN. The browser harness
  covers two viewports, reduced motion, dark/light colour scheme, keyboard-reachable map
  nodes and no horizontal overflow only.
- Domain validation of the new DAX/KQL/SQL claims beyond official-documentation reading:
  NOT RUN. No executed Fabric or Power BI workspace was used, and no query result is
  presented as executed.
- The timed exam engine still serves the original validated bank; imported additions are
  available in the unified bank only. This layer does not change that.
- `tests/atlas/expansion-e2e.mjs` was edited, not executed, to avoid overwriting historical
  screenshots named in the previous manifest.

## Catalogue context (unchanged by this layer)

1,366 catalogue records total: 1,286 DP-600 (834 base bank + 452 imported) and 80 adjacent
PL-300. 101 matching-stem groups, 98 questions with missing exhibits. These figures are
asserted by `tests/fabric/bank.test.mjs` (834/18/227/76) plus the additions manifest
(532 = 452 + 80, 98 blocked, 101 groups).

## Rollback

No archive is required; every owned file is bound by hash in
`docs/knowledge-atlas/dp600-continuation/INTEGRATION_MANIFEST.json`.

1. Delete the new files listed above and `docs/knowledge-atlas/dp600-continuation/`.
2. Restore modified files to their recorded `beforeSha256`:
   `lib/atlas/server.ts` -> `905a0d3a0f9bceb0a2fbafd377eea665a84533c966d52b8edf87216bf21bcc51`,
   `components/atlas/explorer.tsx` -> `25717f9845f802429de63d9081e168f3814170307ed1e3af7f5320d2d044fad0`,
   `scripts/dp600-expansion-receipt.mjs` -> `741c7655deab5f309e2069a6f9d4bbceeea21783e1d36b3a0b085f0413ea4be3`,
   `scripts/build-atlas-preview.mjs` -> `588ea6820d5d662831d7f3ef2bca9d95803f6e259650a8c74537d1369999cf94`,
   `scripts/verify-preservation-history.mjs` -> `63e962c565a5a70b5f9599837929eea854859ecbb93b2ecb480d8f6280baa57b`,
   `tests/atlas/expansion-e2e.mjs` -> `c58a9bb96a6ab6585250b1e3683d76012b5785b8e794bb4f75cafbfc44c8c2ca`.
3. Rebuild the preview so `build/atlas-preview/out` and `out/` return to the 28/31 review
   state. Deleting only the JSON layer without step 2 leaves the import and the receipt in
   place and the guards will fail.
4. Saved sessions and question progress keys need no action; none were rewritten.

`tsconfig.tsbuildinfo` is an ignored TypeScript build artifact, not source. Regenerating it
is unavoidable when `tsc` runs, so the continuation manifest records its post-build hash
against the `PRESERVATION_BASELINE.json` record (`chainBasis`). Rollback does not need to
restore it; the next typecheck rewrites it.

## Next atomic task

Add the next uncovered DP-600 objective block as its own layer: DAX iterator, windowing and
information functions, then item-level permission variants and sensitivity labels, then
denormalization/aggregation patterns - each with a source locator, a condition, a
misconception, and an association only where a real catalogue record exists. Keep the same
fail-closed publication rule until a named human reviewer approves the `technical_review`
queue.

## Known limitations of this handover

- The review build is served from disk on port 4191; the harness assumes that server and
  the Edge binary path recorded in `tests/atlas/continuation-e2e.mjs`.
- Counts in this document come from the JSON layer and the assertion suite; they are not a
  statement that the certification blueprint is fully covered. Open items are listed in
  `coverage.remaining` inside the layer.
- No deployment, no hosting or dependency change, no paid service was used.
- `tsconfig.tsbuildinfo` changes whenever `tsc` or `next build` runs. Run the final
  typecheck before sealing a receipt layer; otherwise the recorded hash goes stale and the
  guards report baseline drift.
