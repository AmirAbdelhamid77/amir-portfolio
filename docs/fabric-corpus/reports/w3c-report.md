# W3-C report — FC09 sync and release integrity (Fabric corpus Wave 3, agent W3-C)

Status: delivered on branch `feat/fabric-corpus-20261105`, worktree
`amir-portfolio-fabric`, HEAD `1deec21`. Corpus pinned at
`774592ea3f2d4558f763d6e5b74abf4785948fb5`. Nothing committed, nothing
deployed, no network, no npm install, no `next build`, no git commands.
`D:\BeUI\fabric-docs-light` was only ever READ (compiles read it; mutations
hit copies under the build workspace only).

The environment has exactly ONE upstream revision and no network, so FC09 is
proved the way the task specified: a **synthetic successor revision** of a
corpus subtree, driven through the existing frozen FC03 compiler + FC02/FC05
inputs, producing release-candidate evidence. All machinery outputs live in
the scratch workspace `D:\BeUI\fabric-corpus-build\sync\` (never committed).

## Deliverables PASS/FAIL

| # | Deliverable | Result |
|---|---|---|
| 1 | `tools/fabric-corpus/sync/simulate-upstream.mjs` (synthetic successor + mutation manifest) | PASS |
| 2 | `tools/fabric-corpus/sync/sync-diff.mjs` (diff classes + reverse dependency closure + sync-plan.json) | PASS |
| 3 | `tools/fabric-corpus/sync/release-candidate.mjs` (per-plan compile, rc-receipt.json, tombstones, reproducibility) | PASS |
| 4 | Withdrawal fixture (sidecar → plan → exclusion, withdrawal record, tombstone) | PASS |
| 5 | `tests/fabric-corpus/sync/*.test.mjs` | PASS (22/22, incl. real-artifact integration tier) |
| 6 | This report | PASS |
| — | ESLint on all new files | PASS (0 errors, 0 warnings) |

## 1. Machinery inventory (what was built)

All in the write-owned areas; `lib.mjs` holds shared deterministic helpers
(canonical JSON with recursively sorted keys, sha256, docs-root file walk,
the compiler-exact relative-path resolver `resolveRelativeDocPath`, CLI arg
parsing). No JSON imports anywhere (repo test constraint); no clocks, no
network, no absolute paths in emitted artifacts — every artifact is
byte-reproducible from its inputs.

| File | Role |
|---|---|
| `tools/fabric-corpus/sync/lib.mjs` | shared deterministic helpers |
| `tools/fabric-corpus/sync/simulate-upstream.mjs` | builds the successor copy + `mutation-manifest.json` |
| `tools/fabric-corpus/sync/sync-diff.mjs` | diff classes, reverse dependency closure, `sync-plan.json` |
| `tools/fabric-corpus/sync/release-candidate.mjs` | drives the frozen `compileFamily`/`writeOutputs` per plan, `rc-receipt.json`, `tombstones.json`, `withdrawals.json` |
| `tests/fabric-corpus/sync/helpers.mjs` + 4 test files | unit tier (mini corpus in temp dirs) + integration tier (real scratch artifacts) |

Component rationale: the RC **imports the frozen FC03 entry point**
(`compileFamily`/`writeOutputs` from `tools/fabric-corpus/compiler/compile.mjs`)
exactly like FC05's `compile-all-families.mjs` — no compiler logic was copied
or forked, so RC output is byte-compatible with the pinned batch. JSON is
read with `fs` per the repo constraint; artifacts reuse the canonical-JSON
convention of the compiler and the route registry (sorted keys, trailing
newline, `registryRevision`-style content hashes: the mutation manifest
carries `mutationRevision` = SHA-256 of its body).

## 2. Synthetic successor (`sim-wave3c`)

```
node tools/fabric-corpus/sync/simulate-upstream.mjs \
  --corpus D:/BeUI/fabric-docs-light/docs \
  --out D:/BeUI/fabric-corpus-build/sync/upstream-sim/sim-wave3c \
  --label sim-wave3c --families fundamentals,onelake \
  --receipts D:/BeUI/fabric-corpus-build/compiler-output
```

Copies **752 family files** (whole `docs/fundamentals` + `docs/onelake`
directories, every file kind so media/breadcrumb survive) plus a computed
**support set of 549 files**: every path the two family compile receipts
resolve (includes, links, images) grown TRANSITIVELY through include
fragments (including zone-nested markers extracted from the compiled node
ASTs — see §5). The support set is what makes the successor environment
faithful enough that unchanged articles recompile byte-identically; the RC
reproducibility gate proves it (§4).

Six deterministic mutations (fixed content, no clock), all recorded in
`mutation-manifest.json` with before/after sha256 verified against the actual
base/successor bytes:

| id | kind | path | evidence |
|---|---|---|---|
| m1 | add-article | `onelake/sync-probe-added-article.md` | before null; after `75b9396e…` |
| m2 | modify-article-body | `fundamentals/fabric-trial.md` | `f4d6fcfa…` → `00fc8fce…` (append-only paragraph, no heading, so inbound anchors stay stable) |
| m3 | modify-shared-include | `includes/product-name.md` | `d3c1cc3d…` → `437be1d1fa…` — the shared fragment that 6 fundamentals articles include directly and more reach transitively |
| m4 | rename-article | `fundamentals/building-reports.md` → `fundamentals/reports/building-reports.md` | identical blob `c40d73bb…` at the new path (rename, not remove+add) |
| m5 | remove-article | `fundamentals/canadian-time-zone-changes.md` | before `5e49880d…`; after null |
| m6 | flip-front-matter-title | `onelake/onelake-capacity-consumption.md` | title line rewritten; body untouched |

`mutationRevision = d75975e8bb75935ba77d5390d3768e2ac0676fc2ab1c1a4005929563bc2705df`
(sha256 of the canonical manifest body) — the synthetic successor's
revision identity, carried through the plan into the RC receipt.

## 3. Sync plan — diff classes and reverse dependency closure

```
node tools/fabric-corpus/sync/sync-diff.mjs --base <real docs> --successor <sim docs> \
  --label sim-wave3c --families fundamentals,onelake --receipts <compiler-output> \
  --withdrawals <sidecar> --mutation-manifest <path> --out <sync-plan.json>
```

Fail-closed inputs: every base receipt blob sha is re-verified against the
real corpus before planning (drift ⇒ exit 2, tested), and compiled node
integrity is cross-checked (`node.source.sha256` === receipt sha).

Diff (all classes detected; sha-based, rename = identical blob at a new
path, which keeps the old path OUT of `removed` and the new path OUT of
`added`):

| Class | Count | Content |
|---|---|---|
| added | 1 | sync-probe article |
| modified | 3 | fabric-trial (article), includes/product-name.md (fragment), onelake-capacity-consumption (article) |
| renamed | 1 | building-reports → reports/building-reports |
| removed | 1 | canadian-time-zone-changes |
| rights-changed | 1 | apply-sensitivity-labels (withdrawal sidecar) |

Reverse dependency closure — edges come from the base family receipts AND
the compiled node ASTs (union; see §5 for why), expanded transitively through
fragment includes with the compiler-exact resolution rules. Per-article
actions in `sync-plan.json`:

| Action | Count | Composition |
|---|---|---|
| recompile | 15 | 2 changed-directly (m2, m6) · 1 added · 1 renamed-in · **6 direct include parents of the mutated fragment** · **3 transitive parents** (2 via applies-to fragments, 1 via the zone-nested marker) · **2 link-closure referencers** (rename/removal flips their link `exists`) |
| keep | 142 | unchanged and outside the closure → base artifacts reused byte-identically |
| tombstone | 3 | removed-upstream · renamed-away · rights-withdrawn |

**Invalidation efficiency: recompile 15 of 160 articles in scope (158 base
ledger articles + 1 added + 1 renamed-in) — ratio 0.0938, keep 142.** A full
recompile would have been 160/160. (`sync-plan-run2.json` sits next to the
plan as the on-disk second run of the determinism evidence.)

Dependency edges used are recorded per row (`dependencyEdges[]` with
kind/href/resolved/changedTargets), so the plan is auditable: e.g.
`fundamentals/workspaces.md` lists its 13 include edges to
`includes/product-name.md`; `fundamentals/job-scheduler.md` lists the link
edge to the removed article; `fundamentals/direct-lake-power-bi-desktop.md`
lists both links to the renamed article.

## 4. Release candidate — per-plan compile, traceability, reproducibility

```
node tools/fabric-corpus/sync/release-candidate.mjs --base <real docs> \
  --successor <sim docs> --plan <sync-plan.json> \
  --base-output D:/BeUI/fabric-corpus-build/sync/base-output \
  --out D:/BeUI/fabric-corpus-build/sync/rc-output/sim-wave3c
```

- Base compiles of `fundamentals`, `onelake` and the `includes` fragment
  family run ONCE into `sync/base-output` at the pinned revision and are
  reused on later runs (manifest revision checked on reuse).
- The frozen compiler runs per plan family against the successor (fresh, in
  memory); emission is selective per the plan, producing a coherent candidate
  export: `rc-output/sim-wave3c/<family>/nodes/**`.
- Counts: **recompiled 15, kept/reused 142, tombstoned 3, withdrawn 1**;
  candidate = 157 article nodes (recompile + keep), tombstones emit no node.
- **Source→output traceability**: every recompiled row records
  `sourceSha256 → outputNodeSha256`, and the emitted node's own
  `source.sha256`/`source.path` are gated against the plan row (mismatch ⇒
  failure, receipt still written, exit 1).
- **Reproducibility check: PASS 145/142.** Every one of the 142 keep rows
  recompiles BYTE-IDENTICAL to the base compile. The 145 counts those 142
  plus 3 recompiled rows whose outputs are also byte-identical — the
  conservative transitive parents (2 copilot privacy articles via applies-to
  fragments, decision-guide via its zone-nested marker). This is the
  architecture requirement "(c) unchanged parents of changed fragments"
  honored and then PROVEN byte-neutral by the same gate: a wrong `keep` fails
  the run; a conservative `recompile` that turns out byte-neutral is measured,
  not hidden.
- Direct changes demonstrably alter bytes: 12 recompiled rows have
  `outputNodeSha256 != baseNodeSha256` (6 direct fragment parents, fabric-trial,
  title flip, renamed-in, added, 2 link referencers).
- **Fragment refresh**: the mutated shared fragment's own compiled node is
  refreshed from the successor (`includes/nodes/includes/product-name.json`,
  base `833102c9…` → fresh `a642aab6…`), recorded under
  `rc-receipt#fragmentRefresh`. The same machinery handles any changed
  fragment under a non-article family directory generically
  (`fragmentFamilies` is derived from `diffs.fragmentChanges`).
- Receipt determinism: two runs over the same inputs produce byte-identical
  `rc-receipt.json` (tested; no clocks anywhere).

## 5. Withdrawal fixture (rights accounting)

Sidecar `D:\BeUI\fabric-corpus-build\sync\withdrawals\sim-wave3c.json`
(schema `hansa.fabric-sync/withdrawal-sidecar/1`): marks
`fundamentals/apply-sensitivity-labels.md` with `rightsState: 'withdrawn'`
(reason + `effectiveRevision: sim:sim-wave3c` recorded; the article is
otherwise untouched upstream — no real withdrawal exists in the
single-revision environment).

The plan honors the sidecar before any candidate accounting:

1. **Excluded from the candidate registry** — the article is absent from
   `rc-receipt#articles`, and no node exists under
   `rc-output/sim-wave3c/fundamentals/nodes/` for it (asserted in-script,
   fail-closed; tested).
2. **Withdrawal record emitted** (`withdrawals.json` +
   `rc-receipt#withdrawals`): route
   `/learn/fabric/docs/fundamentals/apply-sensitivity-labels/`, last source
   sha `d46cf3a9…`, last node sha `5306afe2…`, last revision `774592ea…`,
   `action: purge-on-publish`.
3. **Tombstone** with `disposition: purge-on-publish` and the retention
   placeholder `placeholder-retain-until-approved-policy-v0`.

The withdrawal record's note states it explicitly: the actual purge of
published routes, assets, search shards and caches, and the disqualification
of affected snapshots from rollback, are **deployment-time actions of the
release publisher** — this offline fixture proves the accounting only (no
deploy exists here, per constraints).

## 6. Tests (22/22 PASS)

```
node --experimental-strip-types --test "tests/fabric-corpus/sync/*.test.mjs"
```

Two tiers. The **unit tier** runs the real tools end-to-end over a mini
corpus in temp dirs (12-article fixture carrying the same mutation targets,
synthetic receipts whose shas are computed from fixture bytes, a two-hop
include chain `decision-guide-mini → includes/prereq.md →
includes/product-name.md`): simulator determinism, all six mutation kinds
with sha integrity, every diff class, rename detection, transitive closure
membership (mutated-fragment parent recompiles; edge-free article stays
keep), withdrawal sidecar → tombstone, fail-closed planner gates
(out-of-scope withdrawal entry; receipt/base drift), RC reproducibility,
traceability, tombstone/withdrawal accounting, fragment refresh, RC receipt
determinism. The **integration tier** verifies the real `sim-wave3c`
artifacts in the build workspace (skips cleanly if absent, per repo
convention): manifest integrity against the read-only corpus, plan classes +
closure membership + efficiency (ratio 0.0938 asserted < 0.5), plan
determinism (recomputed plan === on-disk plan byte-for-byte), candidate
accounting, tombstone last-node shas cross-checked against the base compile
manifests, and coherence of the exported candidate (every keep node equals
the base compile bytes on disk).

Efficiency numbers printed by the tests:
`[efficiency/sim-wave3c] recompile 15 of 160 articles (ratio 0.0938, keep 142)`,
`[efficiency/mini] recompile 6 of 12 articles (ratio 0.5, keep 4)` — the mini
fixture invalidates proportionally more because 6 of its 12 articles ARE the
mutation targets; the corpus-scale ratio is the headline number.

## 7. Fail-closed proof

1. Planner: receipt blob shas re-verified against the base corpus; drift
   exits 2 before anything is written (tested).
2. Planner: withdrawal entries outside the diff scope or with a rightsState
   other than `withdrawn` are rejected (tested).
3. RC: node traceability gates (`source.sha256`/`source.path` vs plan);
   reproducibility mismatches on keep rows fail the run (receipt still
   written, exit 1); candidate/tombstone/withdrawal counts must reconcile
   with the plan; no tombstoned article may leak a node into the candidate
   export; withdrawn articles must not appear in the candidate set.
4. Simulator: every mutation step verifies its precondition against base
   bytes (M2 copy-vs-base equality, M4 blob identity) — an unexpected
   fixture shape aborts instead of mutating wrong content.
5. Wrong-keep protection: if any invalidated dependency were missed, the RC
   reproducibility gate fails loudly (byte-difference between the successor
   compile and the reused base artifact) — the environment can never ship a
   silently changed node under a `keep` label.

## 8. Deviations / findings for lead review

1. **Zone-nested includes are unaccounted by the FC03 receipt edge walk.**
   Includes inside `:::row:::/:::column:::` constructs appear in the compiled
   AST WITHOUT resolution annotations (e.g.
   `fundamentals/decision-guide-lakehouse-warehouse.md` line 75 includes
   `includes/product-name.md` inside a column, with no `resolved` field, and
   no receipt edge). The FC05 loader (`article-data.ts#resolveIncludes`)
   skips markers without `resolved`, so today they render as unresolved
   markers rather than content — meaning the rendered page does not depend on
   the fragment through that marker. FC09 chose the CONSERVATIVE reading: the
   closure also extracts edges from the compiled node ASTs and resolves the
   un-annotated targets with the compiler's own rules, so such parents
   recompile too; the reproducibility check then measures the overhead
   (3 byte-neutral recompiles of 15). FLAGGED for FC03/lead: either the
   compiler should resolve zone-nested includes (making them real content
   edges) or the accounting should state the gap explicitly. Escalated, not
   silently normalized.
2. **Rename handling stops at tombstone + derived route.** Production must
   run FC02 ledger/identity maintenance for the renamed path
   (`plannedDestination`, articleId) and prefer an ALIAS over a tombstone per
   the approved retention policy (alias wiring is FC05/FC12 machinery). The
   tombstone record carries `reason: renamed-to:<path>` so the alias step has
   exact provenance.
3. **`lib.mjs` is a new shared module in the sync area** (canonical JSON,
   hashing, walking, path resolution) rather than importing from
   `compiler/emit.mjs`, to keep the sync tools importable by tests without
   dragging the parser stack in; semantics mirror the compiler's conventions.
4. **Support-set copy instead of full-tree copy** (752 + 549 files vs
   15,472): the successor environment is scoped to the two sim families plus
   their resolved references; the RC reproducibility gate proves the scoping
   is sound for the keep set (all 142 byte-identical) and would fail closed
   on any missed reference.

## 9. NOT RUN / limitations

- **Real upstream sync**: impossible here — one pinned revision, no network.
  The production flow's pinned-blob fetch step (staging fetch, authorization)
  is NOT implemented and stays owner-gated; the pipeline consumes corpus
  roots as inputs and is fetch-agnostic by construction.
- **Full-corpus scale**: the sim covers 2 families (160 articles). The same
  plan/RC code paths are family-count agnostic, but a full 22-family /
  2,797-article run was NOT executed (compile wall time ~446s per batch in
  FC05's measurement; an owner decision whether scratch spends that).
- **Rights-changed detection** has one channel in this environment (the
  sidecar). Production compares upstream rights metadata / re-runs the FC02
  rights ledger — not exercisable without a second real revision.
- **Anchor-slug invalidation**: a keep article whose LINK TARGET's headings
  change (anchor `anchorExists` flips) is not detected by the closure (no
  mutation alters headings). The RC byte-identity gate catches any such case
  fail-closed; closing the gap at plan level is a documented extension point
  (slug comparison per anchored link edge).
- **Visual/domain QA**: not applicable (no pages rendered in this task; the
  artifacts are node JSON + receipts). No `next build`, no deploy.
- **Purge-on-publish execution**: accounting only, per §5.

## 10. Reproduction (order matters)

```
node tools/fabric-corpus/sync/simulate-upstream.mjs --corpus D:/BeUI/fabric-docs-light/docs --out D:/BeUI/fabric-corpus-build/sync/upstream-sim/sim-wave3c --label sim-wave3c --families fundamentals,onelake --receipts D:/BeUI/fabric-corpus-build/compiler-output
node tools/fabric-corpus/sync/sync-diff.mjs --base D:/BeUI/fabric-docs-light/docs --successor D:/BeUI/fabric-corpus-build/sync/upstream-sim/sim-wave3c/docs --label sim-wave3c --families fundamentals,onelake --receipts D:/BeUI/fabric-corpus-build/compiler-output --withdrawals D:/BeUI/fabric-corpus-build/sync/withdrawals/sim-wave3c.json --mutation-manifest D:/BeUI/fabric-corpus-build/sync/upstream-sim/sim-wave3c/mutation-manifest.json --out D:/BeUI/fabric-corpus-build/sync/plans/sim-wave3c/sync-plan.json
node tools/fabric-corpus/sync/release-candidate.mjs --base D:/BeUI/fabric-docs-light/docs --successor D:/BeUI/fabric-corpus-build/sync/upstream-sim/sim-wave3c/docs --plan D:/BeUI/fabric-corpus-build/sync/plans/sim-wave3c/sync-plan.json --base-output D:/BeUI/fabric-corpus-build/sync/base-output --out D:/BeUI/fabric-corpus-build/sync/rc-output/sim-wave3c
node --experimental-strip-types --test "tests/fabric-corpus/sync/*.test.mjs"
npx eslint "tools/fabric-corpus/sync/*.mjs" "tests/fabric-corpus/sync/*.mjs"
```

The withdrawal sidecar content (created once; deterministic JSON):

```json
{
  "schema": "hansa.fabric-sync/withdrawal-sidecar/1",
  "label": "sim-wave3c",
  "corpusRevision": "774592ea3f2d4558f763d6e5b74abf4785948fb5",
  "entries": [
    {
      "sourcePath": "fundamentals/apply-sensitivity-labels.md",
      "rightsState": "withdrawn",
      "effectiveRevision": "sim:sim-wave3c"
    }
  ]
}
```

(`reason`/`note` fields documented in the file itself; the plan validates
schema, scope and rightsState.)

## Next atomic task

Lead review of §8.1 (zone-nested include accounting — FC03 decision), then
either extend the sim to a third family for a cross-family fragment mutation
(exercising the generic `fragmentFamilies` refresh on `data-warehouse`), or
hand the sync tools to the production-fetch owner to wire the pinned-blob
staging step ahead of `simulate-upstream`.
