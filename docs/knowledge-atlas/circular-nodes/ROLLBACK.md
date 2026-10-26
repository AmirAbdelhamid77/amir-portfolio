# Selective rollback

Do not reset/stash/clean the working tree. This update sits on substantial earlier
uncommitted work.

1. Compare each current file to its `sha256` in this directory's manifest. If a file
   differs, stop and reconcile later edits before restoring it.
2. Restore only these files from the matching paths under `before/`:
   `components/atlas/explorer.tsx`, `scripts/dp600-continuation-receipt.mjs`,
   `scripts/verify-preservation-history.mjs`. Their hashes must match
   `beforeSha256`. The TypeScript build cache may be regenerated; it holds no learner
   state and does not require restoration for functional rollback.
3. Remove only the new `lib/atlas/circle-layout.ts`,
   `components/atlas/circle-map.css`, `scripts/atlas-circle-receipt.mjs`,
   `tests/atlas/circle-layout.test.mjs` and `tests/atlas/circles-e2e.mjs` after
   confirming no later feature uses them. Preserve this directory as an archived
   record, or move it out of the active `circular-nodes/` path after archiving.
4. Rebuild with `node scripts/build-atlas-preview.mjs`. Run the existing reference,
   Atlas, implementation and preservation-history checks; the regenerated
   `tsconfig.tsbuildinfo` may require a new generated-artifact receipt because the
   preceding continuation layer pinned that cache's historical bytes.
5. No question IDs, concept IDs, relation IDs, routes, publication records, saved
   attempts, reflections or progress keys need migration or reset.

If retaining circles, use `INTEGRATION_MANIFEST.json` as the next layer's predecessor
and preserve its immutable before/after chain. The receipt deliberately fails if
sealed source or backup bytes drift. Never re-seal unrelated changes as this work.
