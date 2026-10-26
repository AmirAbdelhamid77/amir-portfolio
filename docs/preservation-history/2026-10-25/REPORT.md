# Historical preservation checks — source-backed reconciliation, 25 October 2026

Owner scope: repair the historical Academy failure and Atlas paths/hashes from original evidence, preserve current work, do not hide failures by changing tests, and rerun checks without deployment.

## Cause and original evidence

The original Academy and Atlas snapshots predate a source-export directory migration. The current package command changed only `scripts.import:data-viz` from `Data Visualization` to `intake/source-exports/data-visualization`. The two importer scripts changed only matching default paths/comments and formatting of that same declaration. No dependency, parser, transform, answer key or application behavior was changed by this repair.

Exact originals were recovered from `D:\BeUI\intake\hansa-academy-preview-2026-10-25\`: package.json SHA-256 `1532b86c3f2207928ae4d22bcaafb86c48d8ae4b02713ef9207251347a16a493`, Data Visualization importer `42c3181a0dcc36c8053ba5036674b46a350349822256fd43c1e271742719b56f`, Statistics importer `1f86db40a4ea2aabd15169786e0ccc5f27946bc63acedc8d21260e6412eafabf`. Each matches the recorded historical hash. Original bytes are retained under `originals/`, with origin paths in [RECONCILIATION.json](RECONCILIATION.json).

The 23 registry captures previously reported unavailable were found at `build/registry-cache/`; **all 23 match their original historical SHA-256 values**. They are preserved durably at `intake/registry-snapshots/beui-2026-10-25/` with the existing beUI MIT notice. No fresh remote version was substituted for a historical capture. The other 67 old source/handoff paths already have byte-identical canonical copies in the repository. All 90 mappings are now checked directly, including actual raw export locations used by the current importer defaults.

## What was repaired, without weakening existing tests

- Every existing file under `tests/` is byte-identical to the start of this repair. Academy still executes its original existence and byte-hash assertions; none was skipped, renamed, filtered out or rewritten.
- The complete original Academy baseline is archived byte-for-byte. Its **active** baseline changes precisely one value: the expected package.json hash follows the independently proved one-field source-path migration. No other file entry, config entry, status record or allowed integration point changes. The new verifier compares the complete active object with that exact transformation of the original.
- The original Atlas baseline remains byte-for-byte unchanged at its existing path. The Atlas verifier resolves 90 exact old-to-current paths and recognizes three explicitly proved source-path-only transitions plus the independently constrained Academy metadata reconciliation. Its semantic/publication/negative tests remain unchanged, and its unrelated-file assertions still fail on unrecorded drift.
- The existing EasyUI integrity verifier now validates a narrowly scoped repair receipt rather than treating authorized verification-metadata evolution as application drift. It verifies both original before-hashes and fixed after-hashes for the six permitted metadata/verifier files. It does not waive application/configuration/content changes.
- Existing owner manifests were refreshed only for their intentionally changed entries. [REPAIR_MANIFEST.json](REPAIR_MANIFEST.json) binds all new repair evidence/code and changed metadata. [START_BASELINE.json](START_BASELINE.json) records the dirty starting tree. [ROLLBACK_METADATA.json](ROLLBACK_METADATA.json) preserves the exact before-bytes of changed existing files.

This is not a blanket “take today's hashes” refresh: current package and importer bytes must match both pinned audited after-hashes **and independently checked restricted transformations of the exact archived originals**. Changing an unrelated package field or importer statement fails even if someone edits the proposed after-hash.

## Proof and verification

`node scripts/verify-preservation-history.mjs` runs positive verification and six rejection checks inside disposable `build/preservation-negative-*` copies. It rejects a dependency addition even with a forged after-hash; a code change even with a forged after-hash; corrupted relocated source bytes; a deleted baseline entry; a changed test even with a forged test hash; and a dropped relocation. Real source/tests are not mutated to run these cases.

Final commands and logs are in [CHECK_RESULTS.json](CHECK_RESULTS.json) and `checks/`. Scope includes unchanged Academy tests, all standard unit tests, Atlas/reference/EasyUI/history verification, lint and static build. Prior UI behavior is unchanged; this task does not constitute fresh human screen-reader/device, scientific publication or live-hosting QA.

## Preservation and rollback

Only six existing verification/metadata/report files are modified. No app/, components/, lib/, content/, public/, tests/, package.json, package-lock.json, importer script, Next config, Wrangler config, AGENTS.md or README.md bytes are changed. Every other starting source/document hash is rechecked. No checkout/reset/stash/clean/commit/staging/deployment operation was performed.

Rollback is metadata-only: require current after-hash equality before restoring recorded original bytes. If subsequent edits exist, inverse-merge only this repair; never replace later user work. New snapshots and reports are explicitly owned in the repair manifest. Keep the historical originals as evidence.

## Final observed result

All eight check groups PASS: historical-source verification (six rejection cases), Atlas (16 rejection cases plus original payload hashes and all 90 path relocations), reference hashes, EasyUI integrity, unchanged Academy tests 11/11, standard tests 129/129, lint and static build. Total existing unit tests: **140/140 PASS**. Build exports 121 entries and 115 segment aliases. Only six existing verification/metadata/report files changed; all **1,205 other starting file hashes remain identical**. Existing tests, app, content, package/lock, importer code, progress schemas, hosting configuration and HEAD remain unchanged. No deployment.
