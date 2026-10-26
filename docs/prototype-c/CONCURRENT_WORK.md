# Concurrent work boundary

During this task, three pre-existing files changed outside Prototype C's edits:

- `app/lab/dp-600/explore/page.tsx`
- `components/fabric/unified-bank.tsx`
- `lib/search/documents.ts`

The newly observed `docs/dp600-r11-integration/` source audit and before-copies identify an independent R11 question-enrichment operation. Prototype C does not own these changes and does not undo, republish, approve or weaken their review gates. `qa/concurrent-work.json` compares their observed before/current hashes and the external before-copies. Later current bytes may change again while that task runs.

The global preservation command intentionally continues to report unexpected changes until a bound successor from the R11 work reconciles them. This FAIL must not be described as lost data caused by Prototype C, a pre-existing static failure, or a successful whole-repository preservation result. Prototype-owned hashes/rollback bytes are verified separately, with corruption rejection tests. No wildcard waiver for concurrent work is introduced.

The integrity chain's `scripts/atlas-circle-receipt.mjs` and `scripts/verify-preservation-history.mjs` are shared integration touchpoints. This task added the explicit Prototype C successor there. A later R11 successor must compose it, preserving exact Prototype C after-hashes and the earlier circular-node/continuation/expansion receipts. Do not overwrite one task's copy of these files with another's stale before-copy. Record each new before/after transition and rerun the full chain.

`tsconfig.tsbuildinfo` is an ignored generated TypeScript cache sealed by an older receipt. Normal builds regenerate it. The Prototype C successor records that exact generated transition separately, bound to the prior circular-node receipt. It is not a question/source change and is regenerated on rollback. Do not treat generated cache bytes as user-authored content or silently waive a change to a source file under the same rule.

Release remains blocked until the concurrent work settles and the exact preservation chain passes in the final combined checkout. Local Prototype C behavior can be reviewed independently at `/prototype-c/`.
