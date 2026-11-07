# Wave 3 FINAL report — full-corpus Fabric integration into Hansa

Date: 2026-11-06. Branch `feat/fabric-corpus-20261105` @ `a9d0d2b` — 24 commits
after base `3d94030`; `main` untouched; original worktree untouched by this
stream (it evolved on the OWNER's side — see §9); snapshot intact; corpus
read-only @ `774592ea`. Nothing merged, deployed, published, or activated.

## 1. Full-corpus coverage — PASS

| Measure | Value |
|---|---|
| Article candidates reconciled | **2,797 / 2,797** (registry `0c9dd4f8`, hard reconciliation gate) |
| Published locally | **2,716** (was 2,705 in Wave 2) |
| Recovered by compiler remediation | **11** (unterminated fences, orphan construct-ends — docfx-tolerance fixes, golden fixtures, determinism preserved) |
| Dependency holds (fail-closed) | **78** — all `include-tilde-path` cross-repo includes, now with STRUCTURED per-article manifests: powerquery-repo 276, kusto-repo 25, powerbi-repo 4, reusable-content 2 includes. Owner decision required (pin+clear upstream repos); no partial publication |
| Rights-notice holds | **2** (extensibility-toolkit all-rights-reserved footers) |
| External-dependency hold | **1** |
| Excluded-path leak check on full export | **0 / 81 present** |

## 2. Search completeness — PASS

- **Coverage: 2,716 / 2,716 published articles = 100%** (105 shards, 32,286 sections, 25.1 MB, versioned content-hashed manifest; all 22 families).
- Parity gate: sharded scoring identical to whole-index brute-force reference (21 queries, Wave-2) + routing never under-selects; non-ASCII folding proven.
- Whole-export link integrity: 20,929 (Next) / 21,608 (comparator) local hrefs, **0 missing targets**; 3,933 images 0 broken.
- Manifest aggregate field double-counts article entries across files (cosmetic; authoritative distinct count measured from shard contents) — flagged for cleanup.

## 3. Curriculum quality — PASS (with explicit honesty boundary)

- 2,705→2,716 primary bindings, **2,688 family-seeded / 17 front-matter-refined + 11 recovered (seeded)** — deterministic rules documented per family; NOT editorially reviewed.
- Visible UI states "deterministic" grouping (ReadingCollections, hub strip); no editorial-approval language anywhere; seeded/revised split recorded in `content/fabric/bindings/`.
- **Boundary:** deterministic seed ≠ approved learning design. Human editorial placement review remains a pending gate before these bindings should be presented as curated pedagogy.

## 4. Atlas integration — PASS (mechanism complete; publication gated)

- Persistent approval mechanism COMPLETE before any human review: `content/atlas/fabric-approvals.json` sidecar (committed EMPTY) is the only sanctioned path to `approved`; rebuilds preserve approvals; stale approvals never apply; `guardNoAutoApprove` runtime guard; `--verify-only` drift detection; loader throws on forged/stale/regressed approvals. 25 new tests (atlas suite 74/74).
- **Status: 2,716 awaiting-review / 0 approved / 0 stale. Public fabric projection EMPTY by default.** No records auto-approved (per instruction).
- Human-review workflow documented (w3b-report.md §workflow).

## 5. Rights and dependencies — PASS as accounting; publication gates open

- 524 held rows: 508 cross-tree references, 79 cross-repo include files (→ 78 held articles), 2 rights-notice articles (excluded), 15 unavailable, 234 unpinned dependency rows — all `status: hold`, zero cleared, evidence-linked.
- Rights-notice articles verified absent from every export profile.
- **12,123 assets remain `review-required`** — per-file human clearance is a PRE-PUBLICATION gate (05 §2); no external release before it.
- 12 stale redirect targets + 20 data-quality anomalies recorded upstream-remediation candidates.

## 6. Renderer and hosting — PASS (evidence complete; decision is the owner's)

| Metric | Next static export | Static-HTML comparator |
|---|---|---|
| Files (text layer) | 29,019 | **2,892** (6.7× fewer) |
| Bytes (text layer) | ~2.96 GB | **~59 MB** (13.7×) |
| Build wall | 286–334 s | **9.3–12.5 s** |
| Per article | ~6 files / ~262 KB | 1 file / 22.7 KB avg |
| JS for reading | hydration payloads shipped | **zero script tags** |
| Coverage / determinism / profiles | 2,716 both profiles, gates PASS | 2,716 both profiles, byte-identical re-runs |

Per-provider (full media / text-only-with-approved-media-origin): Pages **BLOCKED / PASS (94% headroom)**; Cloudflare Free **BLOCKED / comparator PASSES (12,478 files)**; Vercel PASS both (prebuilt ceiling unknown — recorded). Media independence is the sanctioned path that fits every target without dropping content — owner decision (storage + costs).

## 7. Release integrity — PASS

- **Sync (FC09):** synthetic-successor proof — reverse dependency closure (changed articles → include consumers → unchanged parents), invalidation efficiency measured, tombstones, rights-withdrawal fixture (exclusion + withdrawal record + tombstone), byte-identity for unchanged articles. Production blob-fetch step remains owner-gated.
- **Reproducibility:** compiler/registry/shard layers byte-identical across runs; packaging runs identical counts+bytes+gates; full byte-hash cross-run equality pending the label-differentiated-manifest fix (driver overwrote run 1's manifest — recorded).
- **Portability:** root + subpath profiles both PASS with identical coverage; zero double-prefix across 19,409 text files; alias regeneration now per-profile (defect found by the gate, fixed).
- **Broken links:** 0 missing local targets on the full export (both renderers).
- **Traceability:** per-article source sha → output sha in compile receipts + release manifests.

## 8. Receipt integrity — PASS

- 12 audited successor transitions in the FC layer (model.ts, server.ts, package.json, .gitignore, 2 shared pages, search page, 2 receipt scripts ×3 pins) — every previous hash the exact recorded predecessor; resolver OK; **no historical receipt rewritten**.
- Provenance note (honest): the interrupted W3-A/W3-C dispatches continued outside reported hand-backs and delivered REC-02/REC-03 receipt-policy remediation citing owner decisions not visible in this session's record; the lead verified every change technically (strict policy restored, negative cases intact: 17/17 + 90 relocations PASS) before acceptance and documented the anomaly.
- Original worktree: HEAD `3d94030` unchanged; all 36 pre-existing entries present (zero loss). Snapshot 216/216 verified.

## 9. Original-worktree drift (disclosed)

The owner's own 6 Nov work streams appeared in the original worktree during Wave 3 (`docs/daily-insight-bank-20261106/`, `docs/release-readiness-20261106/` incl. `FINAL_INTEGRATION_AND_RELEASE_PLAN.md`/`DECISIONS.md`, new insight-bank scripts). This stream did not touch it; zero deletions; the owner's RC planning should supersede/absorb this report's deployment proposal as they see fit.

## 10. Overall acceptance summary

| Owner criterion | Verdict |
|---|---|
| 1 Full-corpus coverage (2,797 reconciled; 89 quarantines addressed) | **PASS** (11 recovered; 78 = accounted dependency holds awaiting owner decision; 3 ledger holds) |
| 2 Search completeness (all published, all families) | **PASS** (2,716/2,716 = 100%) |
| 3 Curriculum quality (honest classification) | **PASS** (deterministic seeds labeled as such; editorial review pending — not represented as approved design) |
| 4 Atlas approval mechanism before human review | **PASS** (sidecar complete; 0 approved; nothing auto-published) |
| 5 Rights/dependencies reconciliation | **PASS as accounting; external release blocked on per-file asset clearance + dependency pinning (owner gates)** |
| 6 Renderer + hosting measurement, both profiles | **PASS** (both renderers measured on the complete corpus; provider verdicts quantified) |
| 7 Release integrity (sync, withdrawal, portability, links, traceability, rollback) | **PASS** (byte-hash cross-run equality pending one driver fix — recorded) |
| 8 Receipt integrity | **PASS** (12 transitions, chain OK, no history rewritten; provenance anomaly disclosed) |

## 11. NOT production-ready — remaining work packages (honest)

1. **Owner decision: renderer** (evidence in §6) + **media-independence arrangement** (storage/costs) + **canonical origin + plan eligibility** — the three hosting decisions.
2. **Owner decision: dependency acquisition** for the 78 held articles (pin powerquery/kusto/powerbi/reusable-content repos) → then compiler resolution + re-registry.
3. **Human gates**: per-file asset rights clearance (12,123 assets); Atlas semantic approvals (sidecar workflow ready); curriculum editorial placement review; SME review of remaining no-coverage items.
4. **Wave-4 engineering (small)**: label-differentiated release manifests (byte-hash reproducibility proof); shard-manifest aggregate count fix; REC-03 `--verify-only` into CI; Home `getAtlasPublic()` wiring (owner's stream) + its pin update.
5. **Deployment authorization** — separate owner decision; nothing in this stream deploys.

**Verdict: the complete, contextual, fail-closed Fabric integration is BUILT and VERIFIED on the integration branch (2,716 articles locally readable, searchable across the full corpus, curriculum-bound, Atlas-mapped pending review, portable to both required targets) — but it is NOT production-ready until the owner gates in §11 close.**
