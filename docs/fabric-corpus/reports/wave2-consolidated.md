# Wave 2 consolidated report — Fabric full-corpus integration

Date: 2026-11-05. Branch: `feat/fabric-corpus-20261105`, HEAD `eee3e23`
(14 commits after base `3d94030`). Original worktree untouched; snapshot
216/216 verified; corpus read-only @ `774592ea`; `main` untouched.

## Pre-checks performed (owner requirement)

- Commit/HEAD reconciled: HEAD `bd6af4c` at Wave-2 start = exactly 8 commits
  after base (the report header's "7" counted pre-report-commit state).
- Receipt successor layer verified: `FC.previousSha256 === hash(M6 manifest)`,
  M6→M0 link proven, full-chain resolver OK, 3 transitions provenance-valid.
  Wave 2 added 4 more audited transitions (.gitignore, app/search/page.tsx,
  topic desk page, fabric hub page) — 7 total, every previous hash the exact
  recorded predecessor; no historical receipt edited.

## Work package completion

| Package | Status | Evidence |
|---|---|---|
| FC05 routes + renderer | **PASS** | 2,705 published + 92 fail-closed = 2,797 reconciled; 39/39 tests; whole-export 20,929 hrefs/0 missing; build measured |
| FC06 curriculum bindings | **PASS** | 2,705 primary (2,688 seeded/17 refined), 284 secondaries/3 rules, 160 collections; 30/30 tests |
| FC07 search | **PASS** | 39 shards/1,052 articles/11,062 sections; parity gate PASS (21 queries intersection-identical); merge regression fixture byte-identical; 30/30 + 13/13 existing |
| FC08 Atlas | **PASS** | typed-target mechanism additive; 2,705 awaiting-review ledger (0 approved); 1,052 representative resources; 16/16 new (49/49 atlas) |

## Integration verification (lead)

- **455/455 tests** across all seven suites (data-viz 62, statistics 18,
  fabric 35, content 68, knowledge 49, atlas 49, fabric-corpus 174).
- Clean build: **23,019 files / 1,275.6 MB, 287 s** (FC13 measurement input;
  cold baseline 136 s → FC05 209 s → Wave-2 287 s; alias script 3,140 files).
- Verifier: 883 links + 67 aliases resolve on the full export.
- Spot checks: shards shipped to out/fabric-search (versioned manifest, 5
  families) · reading collections render on topic desks · hub docs-library
  strip with counts · fabric search band on the search page · 3/3 excluded +
  rights-notice holds ABSENT from export · provenance (blob sha + CC BY 4.0 +
  upstream link) present on article pages · zero review-marker leakage in
  hub/desk/search HTML.

## Contextual integration delivered (requirement 3)

- **Curriculum**: every Fabric topic desk now lists deterministic reading
  collections linking to local articles; the Fabric hub shows the library
  strip; bindings never inject into LearningUnits/sourceDocuments.
- **Search**: real full-text section search over published Fabric articles,
  worker-scored, merged under untouched legacy results, visible partial
  status, fail-closed exclusions.
- **Atlas**: mechanism complete and fail-closed (public fabric projection
  empty until human approval); mapping ledger covers all 2,705 articles as
  awaiting-review.

## Coverage and exception ledgers (updated)

- Published 2,705 / excluded 92 (89 compiler-quarantine, 2 rights-notice,
  1 external-dependency) — every excluded logical path verified absent from
  the export; registry reconciliation is a hard gate.
- Aliases: 941 resolved (170 shipped), 73 suppressed with reasons, 12 stale
  surfaced.
- Rights: 524 held rows unchanged; asset clearance per-file remains gate 2.
- Receipt wave: 7 audited transitions total.

## Remaining blockers and risks

1. **89 compiler-quarantine exclusions** — Wave 3 expands the compiler
   (zone pivots, div/VIDEO, nested constructs) to recover them; each returns
   through the same fail-closed gate.
2. **FC08 approval workflow** — rebuild resets approvals to awaiting-review;
   `--apply-approvals` sidecar needed BEFORE the first human approval.
3. **Capacity** — 1.28 GB / 23k files at 5-family assets + 5-family shards;
   FC12/FC13 measure full rollout (assets ~1.9 GB projected for all families;
   Next export ≈ 6 files/~262 KB per article vs 1 for static-HTML — the
   renderer comparison now has real numbers).
4. **Home wiring** (tracked deferral from Wave 1) — unchanged; owner's review
   stream carries it.
5. **Binding seeds** — deterministic seeds are not editorial review; the
   human placement review is pending.

## Wave 3 readiness — READY

Scope: FC09 sync · FC11 final profile integration fixtures · FC12 packaging
(GitHub Actions, Pages+Vercel adapters) · FC13 capacity measurement (full
assets + all-family shards, both renderer alternatives, root+subpath) ·
FC10 release reconciliation. Nothing deployed or activated; external costs,
hosting and publication remain separate owner gates.

## Commits this wave

`0762eb5` ownership amendment · `e35724c` FC05 · `65a92aa` FC06 ·
`fa802ab` FC07 · `eee3e23` FC07 page swap · `528ac20` FC08 · `102127c` lead
wiring + receipt wave.
