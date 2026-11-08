# Deferred integration — preparation checklist

Scope: preserve, prepare and integrate the first reviewed batch; **not a publication, push or deployment**. Application baseline: `28e1f8f`. This pass implemented only the contextual collection shelves, the corrected lab/course destinations and two UI fixes; every work package below remains deferred. This is a cleanup handoff/correction to dated inventories, not a replacement product roadmap. Read the [recovery report](../content-recovery-20261109/RECOVERY_REPORT.md), [publication manifest](../content-recovery-20261109/PUBLICATION_MANIFEST.md), and workspace `../hansa-integration/INTEGRATION_PLAN.md` (relative to the repository root) for the existing workstreams.

## Protected inputs and precise dispositions

| Work package | Preserved input | Current disposition | Next atomic task / acceptance |
| --- | --- | --- | --- |
| REF — reference curation | `content/intake/hansa-integration/reference_records.jsonl`; workspace `hansa-integration/data/catalogue/reference_records.jsonl` | 3,131 input = 1,859 curated + 654 duplicate URLs + 537 no-placement-rule + 81 other exclusions. The two input copies were byte-identical in the cleanup review. | Classify the 537 unmatched rows by stable corpus ID and proposed subject; distinguish useful unmapped material from out-of-scope material. Preserve all rows and existing curated IDs. Do not republish the 654 duplicates or rights/exam-source exclusions merely to reach 3,131 displayed rows. |
| EXP — experiment expansion | `content/intake/hansa-integration/experiment_records.jsonl`; workspace matching original | 46 input = 29 curated labs + 1 non-lab/meta folder + 3 generic-tooling records without a matching desk + 13 outside current subject scope. | Review the 16 potential scope-expansion records against actual desk requirements; keep the non-lab exclusion. A rendered outline is not evidence that a lab was executed. |
| PACK — Phases C–F | Workspace `hansa-integration/INTEGRATION_PLAN.md`, `data/packs/pack_authoring_specs.json`, `data/questions/candidate_pool.jsonl`, code/dataset indexes | 38 candidate questions are prepared, not a validated DP-700 bank. Existing plan contains eight authoring specs. Code Lab and later assessment/Academy expansion remain deferred. | Inventory per-spec source IDs/rights/objectives; choose one small pack for authoring and independent answer review. Do not advertise the plan's proposed question totals as implemented facts. Preserve source questions, rationale and IDs. |
| RTI — executable environments | `content/recovery/rti-lab-blueprints.json`; workspace full RTI milestone package | 18 blueprints recovered; eight referenced draft pages exist. Hands-on environments are unbuilt/unvalidated. | Select one blueprint; document prerequisites, local/free feasibility, expected outputs, cleanup and numeric/domain checks. Obtain separate approval for any tenant provisioning or chargeable resources. |
| R18 — scientific review | `content/recovery/r18-learner-bank.json`; workspace original R18 package and PRIVATE_QA | 222 learner questions recovered as ungraded. Private QA/answer records intentionally not copied publicly. | Re-review a bounded batch against original evidence. Never infer grading validity from import success or metadata publication. Keep private QA private. |
| PL300 — restricted source | `content/recovery/pl300-v88-index.json`; workspace full PL-300 package | 1,285 metadata records indexed; question/transcript bytes restricted. | Owner rights decision, followed by a scoped sanitization plan if permitted. An index is not complete source integration and does not justify deleting the package. |
| EDIT — draft quality | Daily-insight authoring bank; recovered patterns/storytelling/Atlas records | Existing report records 397 Arabic drafts, 1,057 pending concept mappings, 20 pattern lessons, 24 storytelling documents. Inventory/discoverability is not factual verification. | Review one coherent collection; preserve draft states and source attribution. Atlas mappings do not become public semantic edges without the existing review/publication gate. |
| HELD — upstream includes | `content/recovery/dependency-manifest.json`; workspace `fabric-corpus-build/` and pinned source tree | 81 held article metadata records; missing upstream dependencies and rights notices remain explicit. | Reconcile each hold by stable article/dependency ID. Pin approved missing repositories before recompiling; do not silently fetch or publish restricted content. |

Counts above are structural evidence from inspected data/curation ledgers and the recovery report, not a new full semantic audit. Original source exports, formulas, assets, private QA, question keys and saved-progress contracts remain protected. No corpus-wide duplicate deletion is authorized by this checklist.

## Verification maintenance before implementation

1. Reconcile only independently proven historical changes. The deployment-pause receipt in this directory covers exactly two workflow files and reconstructs the original baseline bytes; it cannot authorize arbitrary runtime drift.
2. Run both historical preservation verifiers after that narrow repair. The four committed runtime transitions are now accepted through `RUNTIME_TRANSITIONS.json` and its strict loader; record the **next actual assertion**, not an assumed all-green status. That assertion is the first of 171 post-baseline runtime files absent from the frozen baselines. Additional missing transitions require their own source/commit evidence, not bulk rehashing.
3. Keep original baselines and historical manifests immutable. Avoid creating repeated full-tree baseline copies; use exact transitions and existing evidence. Do not add the gitignored `public/fabric-docs-assets`, `public/fabric-aliases` or `public/fabric-search` outputs to Git to satisfy a file-count or inventory check.
4. Preserve the manual-dispatch-only deployment settings. Publication approval, implementation approval and deployment approval are separate.

## Integration acceptance for each chosen batch

- Source ledger: source ID/path/hash → target route/anchor/status; every omitted row has a reason.
- Rights/privacy: public metadata, redistributable content, link-only content and private material remain distinct.
- Existing behavior: no lost URLs/anchors, question IDs/options/answers, localStorage keys or saved sessions.
- Validate independently: source parity, answer/domain correctness, schema/route/search tests; if visible UI changes, invoke the repository creative-intelligence workflow and complete applicable accessibility/responsive QA.
- Build once in the selected release worktree after a reviewed batch, not in every worktree. Generated outputs remain disposable; retain reproducibility inputs and the current release evidence.

## Push/deploy gates — later, not executed here

- Review the complete diff and confirm the chosen branch/commit; refresh the verified backup after new source changes are accepted. The existing F: bundle covers `28e1f8f`, not subsequent uncommitted maintenance.
- Run reference/preservation gates, relevant tests and a fresh static export. The current full-suite baseline is 652 passed, 0 failed (no skipped tests); the build produced 3,182 pages and the export measured 29,061 files. This is **not** a deployment certification, and the historical Atlas/EasyUI verifiers still stop at the 171-file baseline gap.
- Verify the external corpus build-directory contract, media availability/rights, alias generation, search shards, canonical/base-path settings and actual target hosting capacity. Do not assume ignored media exists in CI/GitHub.
- Confirm intended hosting target, secrets configured privately, costs and rollback artifact; no automatic workflow trigger activation as part of cleanup.
- Only then perform the separately authorized push/deployment, preserving the last verified export until replacement validation succeeds.

## Cleanup remainder

The three `.next` caches have been removed (~3.40 GiB). Stale exports, graphify output, recovery snapshots, source clones, archives and media duplication remain intact: external-volume archival was too slow, and several trees contain evidence or future inputs. Do not turn this remainder into a broad delete command. Retiring one requires a file-level disposition or a verified, practically restorable archive.
