# W3-B report — FC08 succession: persistent approval mechanism (approvals sidecar)

Status: complete on branch `feat/fabric-corpus-20261105` (worktree started at HEAD `1deec21`; no git commands run, no commit made).
Scope: `lib/atlas/fabric-approvals.ts` (new), `content/atlas/fabric-approvals.json` (new, committed
EMPTY sidecar), `tools/fabric-corpus/atlas/build-fabric-extension.mjs` (extended),
`tests/atlas/fabric-approvals.test.mjs` (new), `lib/atlas/fabric-targets.ts` (ONE minimal reviewed
integration edit, documented in §3), this report. `content/atlas/fabric-extension.json` was NOT
modified on disk: the extended builder's rebuild from the real corpus is **byte-identical** to the
committed file (proven by `cmp`), as required by the empty sidecar.

No `npm install`, no `next build`, no git commands. `lib/atlas/model.ts`, `lib/atlas/server.ts`,
`lib/atlas/field.ts` and the shipped legacy `content/atlas/*.json` datasets were not touched. The
compiler/sync/route-registry areas of concurrent W3 agents were not entered.

## 1. Mechanism summary (what problem this solves)

`content/atlas/fabric-extension.json` is GENERATED and its 2,705 mapping rows all start at
disposition `awaiting-review` (fc08-report.md §2). FC08 §7 flagged the regression risk: a human
approving rows by editing the generated file would lose the approvals on the next corpus-sync
rebuild — fail-closed for publication (nothing can leak) but a **silent unpublish**. W3-B closes
that hole by moving the human decision into a committed, generated-independent sidecar and making
it the ONLY sanctioned source of `approved` rows anywhere in the pipeline.

**Sidecar** — `content/atlas/fabric-approvals.json`, schema `hansa.fabric-approvals/1`:

```json
{
  "schema": "hansa.fabric-approvals/1",
  "approvals": {},          // articleId -> approval record (the live decisions)
  "approvalsHistory": []    // append-only log of superseded past decisions
}
```

An approval record is `{ approvedAt (ISO-8601), reviewedBy (non-empty), evidence (non-empty),
disposition: "approved" (exactly — the sidecar only ever records approvals), registryRevision (the
registry the review was made against), conceptIds (the approved mapping; unique `fabric-`-prefixed
strings, may be empty) }`. The sidecar ships **EMPTY (0 approvals, 0 history)** — the human gate is
closed by default.

**Pure module** — `lib/atlas/fabric-approvals.ts` (runtime imports: `node:fs` only; the
fabric-targets dependency is type-only, so the runtime edge is one-directional
`fabric-targets → fabric-approvals` and there is no import cycle):

| Export | Role |
|---|---|
| `validateFabricApprovals(value, registry?)` / `parseFabricApprovals` / `loadFabricApprovals(path)` | Fail-closed sidecar validation (aggregated error lists): every approval requires `reviewedBy` + `evidence` + `registryRevision` (+ `approvedAt`, disposition exactly `"approved"`, unique `fabric-` conceptIds); every `articleId` must exist in the registry; history entries validated with the same strictness. Missing/unparsable/malformed files never load. |
| `applyApprovals(ledger, approvals, { registry, records? })` | The ONLY code path that stamps `disposition: "approved"`. Merges the sidecar into the freshly generated ledger (+ resource records): current-revision approvals are stamped with the sidecar's reviewed fields **plus an `approvalSource: "hansa.fabric-approvals/1"` provenance stamp**; rows keep input order, result lists sorted, no clock. Returns `{ ledger, applied, stale, withoutRecord, approvalsCount }` (`.ledger` is the merged ledger — see Deviation D1). |
| `detectConflicts(approvals, currentRegistry)` | Every approval whose `registryRevision` differs from the current registry revision, as `{ articleId, approvalRegistryRevision, currentRegistryRevision }`, sorted. **Stale approvals MUST NOT and DO NOT silently apply** — `applyApprovals` leaves their rows `awaiting-review` and returns them in `.stale`; the human re-review rule (§4) is the only way to renew them. |
| `guardNoAutoApprove(rows, approvals, { dispositionField? })` | The strict **NO-AUTO-APPROVE guard**: any row carrying `approved` (ledger `disposition` or record `mappingDisposition`) that is not backed by an IDENTICAL sidecar record (or lacks the `approvalSource` stamp) is a runtime error. Runs inside `applyApprovals` (self-check — it can never emit an unbacked approved row), in the builder post-merge, and in the loader gate. At the type level the sanctioned producer is `applyApprovals` alone (`FabricApprovedLedgerRow` / `FabricApprovedResourceRecord` carry the brand). |
| `enforceFabricApprovalGate(extension, registry, { approvalsSidecar?, approvalsPath? })` | The loader gate wired into `getFabricExtension` (§3): approved rows require a resolvable sidecar; a resolvable sidecar must validate; forged/unbacked approved rows throw; approved rows backed by a STALE record throw; and a **current-revision sidecar approval not reflected in the dataset throws** (the silent-unpublish rebuild regression is caught at load time). With an absent sidecar file and zero approved rows the gate is a no-op, so pre-approval fixture datasets load exactly as before W3-B. |
| `emptyFabricApprovals()` / `serializeFabricApprovals()` / `toApprovalRegistryIndex()` | The canonical empty sidecar, stable serialization (2-space + newline), and a minimal local registry index (raw registry or prebuilt index accepted; agreement with `indexFabricRegistry` proven by a sync test — see Deviation D4). |

**Extended builder** — `tools/fabric-corpus/atlas/build-fabric-extension.mjs`:

- **Always** loads the committed sidecar (default `<repo>/content/atlas/fabric-approvals.json`,
  override with `--approvals <path>`; a missing sidecar fails the build — it is part of the
  committed contract), then re-applies it through `applyApprovals` after generating the ledger and
  records. **Rebuilds preserve approved decisions.**
- Emits a deterministic **reconciliation** section: CLI output (`applied N / stale N /
  without-record M`, applied articleIds, stale conflicts with both revisions, re-review warning)
  and — when the sidecar carries at least one approval — a `reconciliation` provenance block inside
  the generated dataset (`applied`, `appliedCount`, `stale`, `staleCount`, `withoutRecord`,
  `recordsApproved`, `noAutoApproveGuard: "verified"`). Never silently drops (unknown-article
  approvals fail the build) and never silently approves (the builder has no approval authority of
  its own; the no-auto-approve guard runs on the exact objects that get serialized).
- **`--verify-only` mode**: rebuilds the expected dataset in memory (registry + compiler output +
  sidecar) and compares it **bytes-inclusive** against the committed file. Match → exit 0 with
  `--verify-only OK`; any drift → a structural drift summary (`diffFabricExtension`, exported:
  top-level revisions, counts, per-articleId ledger drift, per-id record drift) on stderr and a
  failure (exit 1). This catches a regressed approval, tampered evidence, and a sidecar/dataset
  mismatch in either direction. Never writes.

## 2. The exact human-review workflow (what a reviewer does)

Run everything from the repository root with type stripping
(`node --experimental-strip-types …`). The corpus build inputs live at
`<repo>/../fabric-corpus-build` (override with `FABRIC_CORPUS_BUILD_DIR` / `--registry` /
`--compiler-output`).

1. **Review.** Inspect the ledger rows in `content/atlas/fabric-extension.json`
   (`articleId`, `logicalPath`, `candidateConceptHints`) via the review surface
   (`FAB.getFabricExtension()` — no server change needed) or the file itself.
2. **Edit the sidecar** `content/atlas/fabric-approvals.json` — this edit IS the human gate:

   ```json
   "approvals": {
     "art:onelake/access-onelake-shortcuts": {
       "approvedAt": "2026-11-06T10:00:00Z",
       "reviewedBy": "<reviewer identity>",
       "evidence": "<what was checked, against which registry row / hints>",
       "disposition": "approved",
       "registryRevision": "27c39e133e9e6d0174141733a62209ff097940f5919f4395b720761a814b27a0",
       "conceptIds": []
     }
   }
   ```

   Use the CURRENT registry revision (printed by every build). Keep `conceptIds: []` until
   `fabric-` concepts are actually published in `extension.concepts` — approving a mapping to a
   not-yet-published concept fails the build loudly (§5, D6). When replacing an older decision,
   append the old record to `approvalsHistory` (append-only; never rewrite history).
3. **Rebuild** (applies the sidecar; preserves approvals):

   ```
   node --experimental-strip-types tools/fabric-corpus/atlas/build-fabric-extension.mjs
   ```

   Read the reconciliation section in the output: `applied N / stale M / without-record K`, the
   applied articleIds, and any stale warnings. Commit **both** the sidecar and the regenerated
   `content/atlas/fabric-extension.json` together.
4. **Verify** (drift detection — CI-able):

   ```
   node --experimental-strip-types tools/fabric-corpus/atlas/build-fabric-extension.mjs --verify-only
   ```

   Exit 0 = the committed dataset is exactly the ledger+sidecar state, byte-for-byte. Exit 1 with a
   drift summary = someone/something changed the dataset or sidecar behind the builder's back
   (including a regressed approval): rebuild or fix, never hand-edit the generated file.
5. **Projection.** Consumers project the public Fabric catalog exactly as FC08 specified — now fed
   by the approval-preserving dataset:

   ```js
   const { extension, registryIndex } = FAB.getFabricExtension(); // loader gate re-verifies sidecar backing
   const rows = FAB.projectFabricCatalog(
     extension.resourceRecords, registryIndex,
     { publicConceptIds: <ids published in projectAtlas().concepts>, requireRevision: extension.registryRevision },
   ); // exactly the approved rows, allowlisted fields { id, title, logicalPath, kind, conceptIds },
      // title/logicalPath sourced from the registry, sorted by id
   ```

   `getFabricExtension` independently re-verifies at load: forged approvals, stale backing, and
   sidecar/dataset drift all throw (fail closed) before any projection can happen.

## 3. The one minimal reviewed integration edit to `lib/atlas/fabric-targets.ts`

Granted by the brief ("you may make ONE minimal reviewed integration edit … if getFabricExtension()
must consume the approvals sidecar"). Rationale: without it, a hand-edited or stale-generated
dataset carrying `approved` rows would load unchecked — the loader is the last enforcement boundary
for "the human gate is the ONLY path to approved", so consuming the sidecar there is REQUIRED, not
optional. The edit is purely additive, in three touch points:

1. One import: `import { enforceFabricApprovalGate } from "./fabric-approvals.ts";` (commented;
   the reverse dependency in fabric-approvals.ts is type-only, so no import cycle).
2. `GetFabricExtensionOptions` gains `approvalsPath?: string` (default
   `<cwd>/content/atlas/fabric-approvals.json`) and `approvalsSidecar?: unknown` (injected parsed
   sidecar, for tests) — both documented.
3. In `getFabricExtension`, after `validateFabricExtension` succeeds and the index is built, one
   call: `enforceFabricApprovalGate(extension, typedRegistry, { approvalsPath: …, approvalsSidecar:
   opts.approvalsSidecar })`.
4. One doc-comment line corrected ("imports only `node:fs`" → also names the approval gate import).

FC08 compatibility is preserved: fixture datasets with zero approved rows and no sidecar file load
exactly as before (all 16 FC08 tests still pass unchanged), and the FC08 CLI-determinism contract
holds because an empty sidecar produces byte-identical output (D5).

## 4. The stale-approval re-review rule

An approval whose `registryRevision` ≠ the current registry revision is **stale**:

- it is **never applied** by `applyApprovals` (the row/record stays `awaiting-review`),
- it is **never projected** (nothing exists to project),
- it is **surfaced**, never silently dropped: `detectConflicts()` lists it
  (`{ articleId, approvalRegistryRevision, currentRegistryRevision }`), the builder's
  reconciliation reports the count with articleIds and prints
  `STALE APPROVALS NOT APPLIED, RE-REVIEW REQUIRED`, and the reconciliation block inside the
  generated dataset carries the same facts,
- if a stale approval somehow ends up baked into an approved row (hand edit), the loader gate
  throws (`STALE sidecar record … re-review required`).

**Re-review procedure**: edit the sidecar entry — set `registryRevision` to the CURRENT revision,
write fresh `evidence` describing the re-review, refresh `approvedAt`/`reviewedBy`, and move the
superseded record into `approvalsHistory` — then rebuild and `--verify-only`. A rebuild alone can
never renew a stale approval: the sidecar edit is mandatory, keeping the human gate the only path
to `approved`.

## 5. Deviations from the brief

- **D1 — `applyApprovals` returns a result object** (`{ ledger, applied, stale, withoutRecord,
  approvalsCount }`), not a bare merged-ledger array. `.ledger` IS the merged ledger; the extra
  fields are required by the same brief's reconciliation duty ("applied count, stale count with
  articleIds, never silently drop").
- **D2 — `applyApprovals` requires a third `{ registry }` options argument** (and an optional
  `records` array so ledger and records stay disposition-agreed by construction). The brief's
  two-argument form cannot judge articleId existence or staleness; refusing to apply approvals that
  cannot be staleness-checked is the fail-closed design. `detectConflicts` keeps the brief's
  `(approvals, currentRegistry)` shape.
- **D3 — the allowed integration edit was used** (§3): `getFabricExtension` now consumes the
  sidecar, because the runtime loader is the enforcement boundary that makes the sidecar the ONLY
  path to `approved`.
- **D4 — local minimal registry index** (`toApprovalRegistryIndex`) inside fabric-approvals.ts
  instead of importing `indexFabricRegistry`, to keep the runtime dependency one-directional
  (fabric-targets → fabric-approvals) with zero import cycles under erasable TS. Drift risk is
  neutralized by a sync test (fixture existence + duplicate-identity rejection agree with the
  reference implementation).
- **D5 — reconciliation block is serialized INTO the generated dataset only when the sidecar
  carries ≥ 1 approval.** With the empty sidecar the output is byte-identical to the pre-W3-B
  builder (proven on the real corpus by `cmp` and by the FC08 test suite), which preserves FC08's
  CLI-determinism contract unchanged.
- **D6 — approved records take `conceptIds`/`declaredConceptIds` from the approval record.** A
  non-empty set requires the `fabric-` concepts to be published in `extension.concepts`
  (`validateFabricExtension` enforces declaration ⊆ extension concepts), so until concept
  publication ships, reviewers must approve with `conceptIds: []`; a non-empty set fails the build
  loudly instead of publishing a dangling concept reference.
- **D7 — the builder always loads the sidecar (fail closed)** rather than treating it as optional:
  it is a committed contract file, and "rebuild preserves approvals" must not depend on a flag.

## 6. Mapping/approval status (from the REAL registry, not fixtures)

| Count | Value |
|---|---|
| Registry revision bound | `27c39e133e9e6d0174141733a62209ff097940f5919f4395b720761a814b27a0` |
| Corpus revision bound | `774592ea3f2d4558f763d6e5b74abf4785948fb5` |
| Mapping ledger rows | **2,705** (one per published article) |
| Dispositions | **2,705 `awaiting-review` / 0 `approved` / 0 `stale`** |
| Sidecar `content/atlas/fabric-approvals.json` | schema `hansa.fabric-approvals/1`, **0 approvals, 0 history entries** (committed empty; the human gate is closed) |
| Resource records | 1,052, all `awaiting-review`, no anchors, empty concept sets |
| Stale approvals | **0** (vacuously — the sidecar is empty; the stale path is proven on fixtures AND on the real corpus via a throwaway sidecar) |
| `content/atlas/fabric-extension.json` | **unchanged on disk** — extended-builder rebuild is byte-identical (`cmp` clean); no reconciliation block (empty sidecar, per D5) |

## 7. Test evidence

Command (repo root): `node --experimental-strip-types --test "tests/atlas/*.test.mjs"`

Result: **74 tests, 74 pass, 0 fail, 0 skipped** — 49 pre-existing (circle-layout 3, continuation 5,
expansion 5, isolation 8, model 7, peek-layout 5, fabric-targets 16) plus **25 new** in
`tests/atlas/fabric-approvals.test.mjs` (25/25). The new file follows repo conventions (node:test,
assert/strict, no `@/` aliases, fs + JSON.parse, explicit `.ts` extensions, synthetic 5-article
fixture registry — the real 2,705-row registry is never read by tests). Coverage: sidecar
validation (all required fields, disposition exactness, concept prefixes, unknown articleIds,
history shapes, loader fail-closed), apply/preserve semantics (stamping, base-field preservation,
idempotency, ledger-only approvals, stale never applied, unknown/unpublished articles throw,
forged approved input rows throw), the no-auto-approve guard (orphan, tampered-evidence,
missing-stamp, record form), builder integration (empty-sidecar byte-identity, approval
preservation with counts + reconciliation + clean self-validation, determinism incl. reversed
family order, CLI determinism with a populated sidecar, `--verify-only` pass/regressed-approval/
tampered-evidence/missing-sidecar), the loader gate (zero-approved fixtures load unchanged;
approved datasets require a matching sidecar; regressed rebuilds, forged approvals and stale
backing throw), end-to-end projection (empty sidecar → empty projection; current approval →
allowlisted registry-sourced row; stale approval → not projected, surfaced as stale), shipped
artifacts (committed sidecar is exactly the empty sidecar; shipped dataset 2,705 rows / 0 approved
/ no reconciliation block), registry-index sync, and legacy isolation (`projectAtlas` byte-identical
before/after the new modules load).

**One-off REAL-corpus end-to-end verification** (kept out of the test suite per the no-real-registry
rule; script + artifacts under `../fabric-corpus-build/w3b-e2e/`, committed files untouched):
approve a real article (`art:onelake/access-onelake-shortcuts`) against the real revision →
builder applies it (`applied 1 / stale 0`), ledger row + record carry the sidecar evidence and
`approvalSource`, dataset self-validates, `projectFabricCatalog` returns exactly that one
allowlisted row (2,704 rows still withheld); `--verify-only` passes on the fresh build and fails
with a ledger-disposition drift report on a deliberately regressed copy; a throwaway stale sidecar
(`registryRevision: "stale-registry-revision-000"`) is not applied, is surfaced
(`applied 0 / stale 1`, `RE-REVIEW REQUIRED`, `detectConflicts` conflict) and is not projected; the
loader gate accepts the approved dataset WITH its sidecar, accepts the committed empty state, and
throws on the committed dataset + not-yet-reflected sidecar (regressed-rebuild state). An earlier
attempt with an invented articleId (`art:onelake/overview`, which does not exist) was rejected by
the fail-closed unknown-article rule — the gate works.

## 8. Status table

| Item | Status | Evidence |
|---|---|---|
| (1) `content/atlas/fabric-approvals.json` committed EMPTY sidecar (schema `hansa.fabric-approvals/1`, 0 approvals, 0 history) | PASS | shipped-artifact tests 22–23; serializer round-trip equality |
| (2) `lib/atlas/fabric-approvals.ts`: validation (reviewedBy/evidence/registryRevision required; articleId in registry), apply/preserve, `detectConflicts`, no-auto-approve guard | PASS | tests 1–9, 24; real-corpus one-off §7 |
| (2) NO-AUTO-APPROVE guard: approved without sidecar record → runtime error; `applyApprovals` is the only sanctioned producer (`approvalSource` stamp) | PASS | tests 10, 8, 18–19; self-guard inside `applyApprovals` |
| (3) Builder: rebuilds PRESERVE approvals; reconciliation (applied/stale/without-record with articleIds); never silently drops (unknown articles fail) or approves | PASS | tests 11–15; real-corpus one-off §7 |
| (3) `--verify-only` drift detection (fresh OK; regressed approval and tampered evidence fail; missing sidecar fails) | PASS | test 14; real-corpus one-off §7 |
| (4) Projection contract end-to-end: empty sidecar → empty projection; synthetic approval → allowlisted registry-sourced row; stale approval → NOT projected, surfaced | PASS | tests 20–21; real-corpus one-off §7 |
| (4) Loader gate (`getFabricExtension` consumes the sidecar; forged/stale/regressed states throw; pre-approval datasets load unchanged) | PASS | tests 16–19; FC08 suite still 49/49 |
| (5) Sidecar validation rejections (missing reviewedBy/evidence/revision/approvedAt/disposition/concepts; unknown articleId; malformed history) | PASS | tests 3–5 |
| (5) Determinism of the extended builder on fixtures (in-process ×2, reversed families, CLI ×2 = in-process; no clock) | PASS | tests 13–14 |
| Full `tests/atlas/*.test.mjs` after changes | PASS — 74/74 | §7 |
| `npm run build` / `next build` | NOT RUN | prohibited by brief; lead runs integration builds |
| Changes to `lib/atlas/model.ts`, `server.ts`, `field.ts`, shipped legacy datasets, other agents' areas | NOT RUN (none made — by design) | — |
| `content/atlas/fabric-extension.json` regeneration | NOT NEEDED (byte-identical rebuild proven; file untouched on disk) | `cmp` of rebuild vs committed; test 23 |
| Suites outside `tests/atlas/` (incl. `tests/fabric/`) | NOT RUN | not affected: only new atlas files + the two documented atlas edits |
| UI/consumer wiring of `projectFabricCatalog` | NOT RUN | lead integration step (FC08 §3); unchanged by W3-B |

## 9. Findings and risks

- **Silent unpublish is now caught at two boundaries.** The builder re-applies the sidecar on every
  rebuild (preservation), and the loader gate throws when a current-revision sidecar approval is not
  reflected in the dataset (regressed rebuild detected at load). `--verify-only` adds a
  bytes-inclusive CI-able check. The residual gap: a sidecar approval added but never rebuilt +
  never loaded/verified — visible only to `--verify-only`/`detectConflicts`; wiring `--verify-only`
  into CI (or the corpus-sync pipeline) is the recommended lead action.
- **Approved-row evidence relies on the registry contract** that every corpus/source change bumps
  `registryRevision` (FC03). Under that contract, a same-revision `sourceSha256` change cannot
  happen; the builder stamps approvals onto freshly generated rows (new sha, current revision), so
  provenance stays coherent. If FC03 ever changed content without bumping the revision, staleness
  detection would not fire — FC12 fingerprinting should watch `registryRevision` movement.
- **Unknown/unpublished-article approvals fail the build** (sidecar out of sync) rather than being
  skipped: loud by design, but it means corpus sync blocks until a human removes/updates the stale
  sidecar entry after an article is unpublished. Accepted trade-off (never silently drop);
  `approvalsHistory` exists so removals keep their audit trail.
- **Approving with non-empty `conceptIds` before concept publication fails the build loudly** (D6).
  The reviewer-facing rule is: `conceptIds: []` until `fabric-` concepts ship in
  `extension.concepts` + the public concept set.
- **Loader gate is lazy about the sidecar file**: a missing sidecar file with zero approved rows
  loads (FC08 fixture compatibility); the committed sidecar makes this a non-issue in the repo, and
  the builder always requires the file.
- **Guard diagnostics short-circuit**: an approved row with no backing entry reports only the
  primary violation; the `approvalSource`-stamp clause is exercised via a backed-but-unstamped row
  (both tested).
- **Concurrent W3 agents**: this package did not touch `compiler/`, `sync/` or `route-registry/`;
  the only shared-surface change is the documented `fabric-targets.ts` gate (§3), which is backward
  compatible (proven by the unchanged FC08 suite).

## 10. Recovery point

No git commands run; nothing committed. Worktree state = `feat/fabric-corpus-20261105` @ `1deec21`
+ uncommitted W3-B paths: `lib/atlas/fabric-approvals.ts`,
`content/atlas/fabric-approvals.json`, `tools/fabric-corpus/atlas/build-fabric-extension.mjs`,
`tests/atlas/fabric-approvals.test.mjs`, `lib/atlas/fabric-targets.ts` (the §3 edit),
`docs/fabric-corpus/reports/w3b-report.md` (this file), plus a throwaway verification workspace at
`../fabric-corpus-build/w3b-e2e/` (outside the repository, safe to delete). The lead should commit
at the next contract checkpoint.
