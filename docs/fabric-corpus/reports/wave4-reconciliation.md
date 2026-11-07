# Wave 4 reconciliation — fabric-corpus stream vs owner's release-readiness plan

Date: 2026-11-06. Branch `feat/fabric-corpus-20261105` (25 commits after base
`3d94030` at reconciliation time). Inputs: `wave3-final-report.md` (this
stream), the owner's `docs/release-readiness-20261106/` (`FINAL_INTEGRATION_AND_RELEASE_PLAN.md`,
`DECISIONS.md`, `RC_REPORT.md` — read read-only from the original worktree),
FC12/FC13 reports. Nothing merged, deployed, or rewritten.

## 1. Commit-state reconciliation (Phase 1.3)

The Wave-3 final report header states "24 commits after base" because it was
written before its own commit; `docs:` recording the report is commit 25.
**Authoritative state at reconciliation: HEAD `371fe0f` = 25 commits after
`3d94030`** (verified: `git rev-list --count 3d94030..HEAD`). No commits were
lost; the discrepancy was the report's own commit. Post-W4 the count grows by
the Wave-4 closure commits recorded in §5.

## 2. Two release candidates — the central structural finding

The owner's plan and this stream produce **two different release candidates
that must not be conflated**:

| | Owner's RC (release-readiness-20261106) | Fabric-corpus RC (this branch) |
|---|---|---|
| Content | The integrated interactive Home (M6 + R3–R6 promoted by D1) | 2,716 local Fabric articles + curriculum bindings + full-corpus search + Atlas mapping ledger |
| Baseline | Original worktree review stream (uncommitted), pins in their M6 manifest | `feat/fabric-corpus-20261105` (committed), pins in the FC receipt wave |
| Build evidence | 436/436 routes, 86/86 E2E, 329 tests, `tsc` clean | 237 fabric-corpus + 74 atlas + full battery; both packaging profiles PASS |
| Deployment ceiling | Fits Cloudflare Workers Free today | **BLOCKED on Cloudflare Free (29,019 > 20,000 files) and Pages (2.96 GB > 1 GB) at full media** — needs renderer/media-origin decisions |
| Publication gate | D2 Atlas seed (6 records), D5 R1/R2 | Per-file asset clearance (12,123), 78 dependency-held articles, Atlas corpus approvals (0 approved) |

**Consequence for the owner's D4:** deploying the owner's RC to Cloudflare is
unaffected by this stream's capacity findings — their `out/` is the pre-fabric
site. The full-corpus site is a separate, later activation with its own gates.
The two RCs can land independently and in either order.

## 3. Overlap and compatibility analysis

1. **Home/Atlas wiring — RESOLVED BY THE OWNER'S STREAM; no action here.**
   The owner's D1 landing calls `getAtlasPublic()`/`getAtlasReview()`, both of
   which exist on this branch since `6d34e88` (the Wave-1 reviewed transfer).
   This branch's `components/knowledge/hansa-landing.tsx` intentionally stays
   at the M6 state (landing evolution belongs to the owner's stream; touching
   it trips protected byte-pins). **Merge compatibility: verified at the
   export surface.** Merge-order note: the owner's landing imports
   `lib/knowledge/*` modules that are untracked in their worktree — their
   stream must land (or be committed) before/with any merge of this branch's
   Home-adjacent state; the fabric packages themselves have no Home
   dependencies.
2. **Atlas human-gate pattern — aligned, two ledgers.** The owner's D2 seed
   (6 editorial records in `content/atlas/*.json`, `technical_review →
   published`) and this stream's corpus mapping ledger (2,716 rows,
   `awaiting-review → approved` via the committed sidecar) are independent
   datasets sharing one principle: nothing publishes without a recorded human
   approval. No conflict; both stay fail-closed.
3. **Build-id nondeterminism — both streams hit it.** The owner's RC report
   notes "the build id changes `index.html` bytes between runs"; this stream's
   `--compare-manifest` gate flagged the same defect plus the sitemap clock.
   Wave-4 fixes both (`generateBuildId` + `SOURCE_DATE_EPOCH`) for every
   stream sharing this next.config.
4. **Receipt layers — parallel, non-overlapping.** The owner's pins live in
   their worktree's M6 manifest state (uncommitted); this branch's 13 FC-wave
   transitions are committed and chain-verified. No file is pinned by both
   layers except `components/knowledge/hansa-landing.tsx` (M6 pin; untouched
   here). Merge reconciliation is a future lead task when the owner's stream
   commits.
5. **Superseded/contradicted decisions — none found.** The owner's D1-D5 and
   this stream's gates are complementary; the owner's plan explicitly defers
   deployment and publication exactly as this stream's blockers require.

## 4. Requirement-by-requirement reconciliation (Wave-4 task list)

| Task | Finding |
|---|---|
| Separate manifests + byte-hash reproducibility | Implemented (label manifests, JSONL run log, `--compare-manifest`); the gate then caught REAL nondeterminism — sitemap clock + buildId — fixed this wave; repro pair verdict recorded in w4a-report.md |
| Shard-manifest aggregate count | Fixed (routing file contributes 0; authoritative `distinctArticles: 2716`); shards byte-identical 105/105; index content unchanged |
| `--verify-only` into CI | Added as a fail-closed step in the build/validate job (dispatch-only, deploy-free preserved); passes on the current tree |
| Home/Atlas wiring | Resolved by owner's D1 stream; this branch provides the exact exports it calls; no duplicate implementation created |
| Portability/link/exclusion/receipt re-runs | Root+subpath profile gates re-run post-fix (w4a-report); exclusion leak check 0/81; link integrity from Wave 3 stands (no URL-affecting changes since); receipt chain OK with 13 transitions |

## 5. Wave-4 closure commits (this stream)

Recorded in `w4a-report.md` (engineering closure) and
`w4b-renderer-assessment.md` (renderer decision matrix).

## 6. What this reconciliation does NOT do

No merge to main, no deployment, no publication, no owner decision invented,
no rights hold cleared, no historical receipt rewritten, no change to the
original worktree (owner streams preserved byte-for-byte; their worktree
evolution on 6 Nov is theirs).
