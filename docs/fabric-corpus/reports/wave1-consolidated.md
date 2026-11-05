# Wave 1 consolidated report — Fabric full-corpus integration

Date: 2026-11-05. Branch: `feat/fabric-corpus-20261105` (7 commits on base `3d94030`).
Base isolation: original worktree `D:\BeUI\amir-portfolio` untouched (status-hash verified
before, during and after); recovery snapshot `D:\BeUI\review-work-snapshot-20261105`
(216/216 files hash-verified). Corpus: `D:\BeUI\fabric-docs-light` read-only @ `774592ea`.

## Work package completion

| Package | Status | Evidence |
|---|---|---|
| FC02 identity + rights | **PASS** (1 BLOCKED item recorded) | 15,496/15,496 rows 1:1; validator 26 pass / 0 fail / 3 skip; `registry/RECONCILIATION.md` |
| FC03 compiler | **PASS** | 52/52 tests; real batch `docs/fundamentals`: 77 files, 0 quarantines, 3,825 edges, byte-identical recompiles |
| FC04 Atlas safety | **PASS** | 33/33 suite; 1 real isolation fix (`safeReturn >= 2048`); typed-target proposal for FC08 |
| FC11 portability | **PASS** | 23/23 tests; schema v1; no-double-prefix + unsafe-redirect contracts |

## Integration verification (lead)

- Full test battery `npm run test:all`: **265/265 PASS** (data-viz 62, statistics 18,
  fabric 35, content 68, knowledge 49, atlas 33) + fabric-corpus **75/75**.
- Receipt chain: `knowledgeStageReceipt` extended with the FC layer; resolver OK; all
  M0/M6 pins reconcile through FC.
- Clean build: **PASS** — 2,859 files / 156.1 MB (warm build 38 s; cold baseline 136 s);
  434 alias files; curriculum verifier 883 links + 67 aliases resolve.
- Ownership: zero cross-area writes by any sub-agent (git-status audited).

## Key results

- **References reconciliation:** D1 (learn.microsoft.com + `/fabric/` content root) = **919 —
  matches the handover exactly**. D2=1,037 explained (118 `/en-us/rest/api/fabric/` API pages).
- **Coverage ledger:** 2,794 eligible articles + 1 external-dependency hold + 2 rights-notice
  holds; 59 structured-page candidates; 12,123 assets (review-required pending asset-level
  clearance); 234 unpinned cross-repo dependency rows (new finding, all hold).
- **Redirect ledger:** 1,014 rows, 0 cycles; 12 stale targets; **BLOCKER blk-0001** —
  `docs/database/mirrored-database/.openpublishing.redirection.database.json` referenced by
  the publish config but absent at the pinned revision (upstream investigation owner: FC02).
- **Compiler batch proof:** first family compiles fail-closed-clean; self-closing `:::image`
  docfx form required implementation (first-pass 147 quarantines → 0).

## Contract deviations (lead-approved, recorded)

1. `rightsState` field name in ledgers vs contract's `rights` — contract to be amended (clearer orthogonality).
2. Registry JSON schemas (S1 skip) deferred to Wave 2 — assigned to FC02's area in the ownership map amendment.
3. `data:image/*` (non-SVG) allowed by sanitizer — documented choice.
4. Asset URLs never gain trailing slash; non-empty assetOrigin replaces base — documented, unexercised until owner approves an asset origin.

## Risks and owner decision points for Wave 2

1. **Receipt protocol vs integration evolution** — resolved structurally: the fabric-corpus
   receipt wave now records every audited transition of pinned files (package.json,
   server.ts, model.ts). Wave-2 packages must add transitions there instead of tripping pins.
2. **Home isolation wiring** — `components/knowledge/hansa-landing.tsx` still calls
   env-driven `getAtlas()`; the correct `getAtlasPublic()` wiring exists in the owner's
   in-flight review stream and tripped the landing byte-pin when applied here. Deferred to
   the owner's stream landing (or a pin update decision at merge). Public builds are
   unaffected (flag unset by default; FC04 proves the projection itself is flag-immune).
3. **234 unpinned cross-repo dependencies** — must be pinned+cleared before any affected
   article promotes (FC02/FC09 work; owner approves dependency acquisition).
4. **Rights closure** — 524 held rows; per-file human review remains gate 2 (05).
5. **Renderer decision** — unchanged, open until FC13 full-corpus measurement.

## Commits

`6d34e88` server.ts transfer · `e777f30` FC01 contracts · `bbb001b` FC04 ·
`b46048a` FC11 · `1ded03b` FC03 · `e8483db` FC02 · `f4ee70e` receipt wave + reports.
`main` untouched at `3d94030`. Nothing deployed, published or activated.
