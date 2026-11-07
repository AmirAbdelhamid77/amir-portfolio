# W4-A report — Wave 4 engineering closure

Date: 2026-11-06/07. Provenance: sub-agent W4-A delivered DEFECT-1/2/3 code
and both pre-fix repro builds, then its session timed out during
verification; the lead completed verification, diagnosed and fixed the REAL
nondeterminism the new gate caught, and re-proved reproducibility. Nothing
deployed; original worktree untouched.

## DEFECT-1 — label-differentiated manifests + byte-hash reproducibility

- `build-release.mjs`: `--label` now ALSO writes `release-manifest-<label>.json`;
  `run-log.json` is append-only JSONL; new `--compare-manifest <A> <B>`
  deep-compares two manifests ignoring exactly the `timing` object (the only
  sanctioned difference), printing per-field diffs.
- **Pre-fix proof the gate works**: two clean builds (w4-repro-a/b) differed
  in `outInventoryHash` + 4/5 checksummed artifacts with IDENTICAL counts and
  byte totals — real nondeterminism, correctly flagged.
- **Root cause (lead diagnosis)**: (1) `app/sitemap.ts` embedded `new Date()`
  into every `<lastmod>`; (2) Next embeds a per-build random buildId into
  every page's asset/prefetch URLs.
- **Fixes (lead, shared files)**: `app/sitemap.ts` honors the
  reproducible-builds `SOURCE_DATE_EPOCH` convention (CI pins it to the
  release commit; fallback = the corpus integration freeze date 2026-11-05);
  `next.config.ts` adds `generateBuildId` reading `FABRIC_BUILD_ID` with a
  constant fallback — safe for a static export (chunk filenames are already
  content-hashed; no server-side incremental cache). The owner's RC report
  independently recorded the same buildId effect ("not comparable across
  builds") — both streams benefit.
- **Post-fix proof**: two clean full-corpus builds (w4-fix-a/b, 2,716/2,716
  coverage each, prefix gate PASS each) → `--compare-manifest` verdict:
  **IDENTICAL outside `timing` (reproducibility contract satisfied)** —
  matching `outInventoryHash 47a8d02e…`.
- Post-fix spot checks: 30/30 published sample present, 30/30 excluded absent,
  18/18 sampled hrefs resolve, sitemap lastmod = deterministic freeze date.

## DEFECT-2 — shard-manifest aggregate count

- Root cause: the routing file (term→shard postings, not articles) counted
  `records.length` as `articleCount`, double-counting any per-file sum.
- Fix: routing file contributes 0; the manifest carries the authoritative
  `distinctArticles` aggregate. **Shards byte-identical 105/105** after
  regeneration (hash-verified) — indexed content unchanged; manifest version
  unchanged (correct: the version identifies index content). New manifest:
  `distinctArticles: 2716` === registry published count === distinct recount
  from shard contents.

## DEFECT-3 — `--verify-only` in CI

- One fail-closed step added to the build/validate job of
  `fabric-corpus-release.yml` (dispatch-only, deploy-free preserved): drift
  between the committed fabric-extension dataset and ledger+sidecar fails the
  job. Verified locally: exits 0 on the current tree.

## DEFECT-4 — Home/Atlas wiring

No code change (correct outcome): the owner's D1 stream owns the landing and
calls `getAtlasPublic`/`getAtlasReview` — both exported by this branch since
`6d34e88`. Compatibility verified at the export surface; documented in
wave4-reconciliation.md §3.

## DEFECT-5 — post-fix verification suite (all PASS)

| Check | Result |
|---|---|
| tests/atlas (74) | 74/74 |
| tests/fabric-corpus (237 incl. comparator) | 237/237 |
| tests/content (68) | 68/68 (after recording the sitemap.ts receipt transition) |
| verify-preservation-history | PASS (90 relocations, 6 rejection cases) |
| final-review-negative | PASS (17 rejection cases) |
| receipt chain (13 FC transitions) | resolver OK |
| Root profile coverage + prefix gate (×2) | 2,716/2,716, 0/81, PASS both |
| Subpath (Wave 3 evidence stands — no URL-affecting change since) | PASS |

## Receipt wave

One new audited transition: `app/sitemap.ts` (13 total in the FC layer).
No historical receipt rewritten.

## PASS/FAIL/NOT RUN

| Deliverable | Status |
|---|---|
| 1 label manifests + compare mode | PASS |
| 2 byte-hash reproducibility proof | **PASS** (IDENTICAL outside `timing`) |
| 3 shard aggregate fix | PASS (shards byte-identical) |
| 4 CI verify-only | PASS |
| 5 post-fix verification suite | PASS |
| 6 w4a-report.md | PASS |
| — subpath re-run post-fix | NOT RUN (no URL-affecting change since its Wave-3 PASS; noted for the next full pass) |

## Commits (this wave, this stream)

W4-A engineering closure (driver, shard fix, CI step) + lead determinism
fixes (sitemap, next.config) + receipt transition + w4a/w4b/wave4-reconciliation
reports — see `git log` on the branch.
