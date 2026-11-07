# FC12 report — release engineering (packaging, profiles, adapters)

Date: 2026-11-06. Status: COMPLETE (lead-completed after the interrupted
agent session delivered the driver + workflow; every run re-executed and
verified by the lead). Frozen content: registry `0c9dd4f8`, 2,716 published.

## Profile measurements (full corpus, dry-run only)

| Profile | Build (incl. postbuild) | out/ files | out/ bytes | Text scan | Coverage gate | Prefix gate |
|---|---|---|---|---|---|---|
| root | 286–334 s (2 runs) | 29,019 | 2,960.5 MB | 19,409 files | **2,716/2,716 rendered, 0/81 excluded present, 0 mismatches** | PASS (zero `/REPOSITORY_NAME/` leakage; 19,409 text files scanned) |
| subpath (`/REPOSITORY_NAME`) | 286 s | 29,019 | 2,968.4 MB | 19,409 files | **2,716/2,716 rendered, 0/81 excluded present, 0 mismatches** | **PASS** — double-prefix hits 0/19,409; 20-article sample: 0 unprefixed attrs, 125 prefixed docs hrefs, 712 prefixed asset evidences; shard manifest clean |

## Defect found and fixed by the dry run (the gate working as designed)

First subpath run FAILED the prefix gate: 10/10 sampled alias pages served
root-profile targets (unprefixed meta-refresh + hrefs). Cause: alias pages
are profile-dependent generated files, but the driver never regenerated them
per profile. Fix (lead): build-release.mjs now regenerates alias pages with
the profile's base path before every build (the generator already applied
NEXT_PUBLIC_BASE_PATH at its output boundary). Re-run: PASS.

## Reproducibility

- Compiler: byte-identical recompiles (W3-A). Registry: identical
  registryRevision across independent rebuilds (FC05). Shards: two-run
  byte-identity (FC07 tests).
- Packaging driver: two independent root runs produced identical file counts
  (29,019), identical byte totals (2,960.5 MB) and identical gate outcomes;
  run-log retained. FULL byte-hash cross-run equality remains open ONLY
  because run #1's manifest was overwritten at the same path (driver should
  write label-differentiated manifests — Wave-4 one-line fix; the
  outInventoryHash whitelist excluding `timing` is already implemented).
  Inventory-hash comparison against the earlier bench run correctly differs
  by the regenerated alias pages (+4 files), not nondeterminism.

## Adapter feasibility (details in packaging/adapters.md)

| Target | Text-only (~810 MB) | Full media (2.96 GB) |
|---|---|---|
| GitHub Pages (subpath, 1 GB published limit) | PASS | **BLOCKED** — media origin or plan change required; corpus truncation out of scope |
| Vercel (root) | PASS | PASS pending controlled prebuilt-upload validation (public ceiling unknown — recorded as unknown per 05) |
| Cloudflare Free (20,000 files) | PASS | **BLOCKED** on Free (29,019 > 20,000); PASS on Paid (100,000) |

The architecture-sanctioned path that fits every target without dropping
content: an approved immutable media origin for `fabric-docs-assets/`
(−2.15 GB) — explicit owner decision (storage + costs) before any activation.

## Workflow

`.github/workflows/fabric-corpus-release.yml` (328 lines, pinned actions):
workflow_dispatch ONLY; build+validate both profiles; dry-run packaging;
**no deploy jobs** (commented stubs mark where owner-approved deploy jobs
would go, behind environment protection). The pre-existing deploy.yml /
deploy-cloudflare.yml fire on push to main only — inert on this branch and
untouched.

## PASS/FAIL/NOT RUN

| Deliverable | Status |
|---|---|
| 1 build-release.mjs (fail-closed driver) | PASS (lead fixed 2 interrupted-session defects: undefined `profile` ref; missing per-profile alias regeneration) |
| 2 both-profile runs + coverage + prefix gates | PASS |
| 3 adapters.md (Pages/Vercel/Cloudflare) | PASS |
| 4 pinned dispatch-only workflow, no deploy jobs | PASS |
| 5 reproducibility evidence | PASS (measurement level; byte-hash cross-run check pending the label fix — recorded) |
| 6 fc12-report.md | PASS |
| — Deploy of any kind | NOT RUN (prohibited; requires owner authorization) |
