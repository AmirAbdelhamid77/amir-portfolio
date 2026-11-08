# Cleanup follow-up: preservation reconciliation and integration preparation

## Outcome and limits

The committed deployment pause is now represented by an exact, content-checked successor receipt. Neither workflow was edited or activated. The four committed runtime transitions that previously blocked the historical verifiers are now represented by a second narrow successor receipt; each UI/config change reverses exactly to its preserved predecessor and the generated lockfile is pinned by exact bytes. **The two full preservation verifiers still do not pass**: after accepting those four transitions, their next assertion is the first unowned post-baseline runtime addition (`app/archive/page.tsx`), part of a wider pre-existing gap described below. This task does not certify the release or authorize publication/deployment.

Content recovery is now reachable through contextual collection shelves on Learn, Practice, Fabric and the DP-600 Atlas. Every destination is a real route with its review status and limitation beside it, and the shelf renders as ordinary links without client JavaScript. The source-parity audit checks 56/56 declared copies against their origins; the production export was rebuilt and browser-tested. This is integration and release preparation, not a publication approval: draft, restricted and held material keeps its status.

The [integration checklist](NEXT_INTEGRATION.md) separates genuinely unfinished work from deliberate curation, rights restrictions and duplicates. Workspace cleanup removed only the three `.next` caches (~3.40 GiB) and a stale 156 MiB `out-rc` export; original sources, draft banks, private QA, runtime media, snapshots and the served release export remain intact. See workspace `docs/CLEANUP_EXECUTION_2026-11-08.md` for exact execution/rollback evidence.

## Evidence

- Baseline main: `28e1f8fcf0a7a3f117d28a1a1549eb248fb7845f`; working tree clean before this follow-up.
- Commit `901eb2db9e4b93a2bc426649d72c9786acaae96b` changed only the two deployment workflows: removed the push/main trigger and inserted the explanatory pause comment; manual dispatch stayed enabled.
- `DEPLOYMENT_PAUSE_RECEIPT.json` names both exact historical before/after SHA-256 pairs. `scripts/deployment-pause-receipt.mjs` binds the predecessor hashes to both original preservation baselines and independently reverses only that exact textual change. It must recover the original hash; merely editing and rehashing another workflow change cannot pass.
- The existing `knowledgeStageReceipt` delegates its final hash lookup to this narrowly scoped receipt and exposes its evidence paths to disposable negative-test views. Unknown paths/hashes are not advanced. Historical manifests/baselines are unchanged.
- The next full-verifier failure after the deployment pause was the `/practice/` draft-bank card: expected `51a9de3824680487323e255f2cda387b06c584bffc370276f674e75bd5ab468d`, actual `e57c5c4f620d09344a473b9fa1f633cc9351615986e94ad80ad8452cfa3f6a15`. `git show a8e1d9b -- app/practice/page.tsx app/work/page.tsx` attributes that card and the Work storytelling link to committed content recovery. `RUNTIME_TRANSITIONS.json` now binds all four remaining transitions (`app/practice/page.tsx`, `app/work/page.tsx`, `next.config.ts`, `package-lock.json`) to their preserved predecessors, the commit that produced each successor, and an exact reverse proof; the lockfile is the only hash pin and it is restricted to generated lockfiles.
- After those four transitions are accepted, both verifiers reach a separate pre-existing gap: 171 non-generated runtime files (167 tracked, four from this task) are absent from both preservation baselines, including `app/archive/page.tsx`, the knowledge-graph implementation, content recovery and the Fabric corpus surfaces. A further 9,678 files under `public/fabric-docs-assets`, `public/fabric-aliases` and `public/fabric-search` are gitignored generated outputs, so they cannot be pinned in a committed receipt. This is not rehashed or waived here; it needs per-wave evidence or an explicit owner decision. The verifiers now fail at `app/archive/page.tsx`, not at a practice-page hash.
- Source parity: 56/56 comparisons pass in this workspace. The audit covers the R18 bank, RTI blueprints, pattern files, catalogue inputs, the Study Hub and all 48 storytelling files against their preserved sibling sources (`RECOVERY_SOURCE_PARITY.json`). A clean checkout without those siblings reports `BLOCKED_SOURCE_NOT_AVAILABLE`, not a pass; the report preserves that limit.
- Production build: 3,182 static pages and 3,175 segment aliases, build id `hansa-static-export`. No build errors.
- Export inventory: 29,061 files / 3,124,901,827 bytes after the fixes; no file exceeds 25 MiB. The docs section is 16,302 files for 2,717 articles. The measured free-tier prune removes 9,506 segment payloads and leaves 19,555 files / 2,693,970,374 bytes.
- Browser QA: 54 route/theme/width cases on the first post-build export found two UI defects. `/content-index/` overflowed 320px by 18px because of an unbreakable source path; the decorative `Oct` year mark on the home hero failed axe color-contrast at 320/390px. Both were fixed in code and retested, rather than excluded from QA. Interaction checks confirm Practice → Draft banks keeps client state, back/forward works, the skip link reaches `#main`, and the mobile primary navigation opens with real links.
- Removed stale `out-rc` (2,867 files / 156.3 MiB) after confirming it was superseded by the fresh export. Disk free is now about 10.0 GB on `D:`.

## Changes

| Path | Purpose |
| --- | --- |
| `lib/recovery/navigation.ts` | Eight reviewed collection destinations across four contexts; status and limitation travel with each link |
| `components/learn/collection-shelf.tsx` | Static, server-rendered shelf; no client JavaScript and no private QA or source bytes |
| `components/learn/curriculum-home.tsx` | Learn shelf, `#topics` anchor, corrected `/explore/` visualization-lab destination |
| `components/study/directory.tsx` | Practice shelf; corrected `/learn/visualization/` course destination |
| `app/learn/fabric/page.tsx` | Fabric shelf linking RTI lessons, documentation records and holds |
| `app/learn/dp-600/atlas/page.tsx` | Atlas shelf linking resource records and source holds without implying semantic edges |
| `app/content-index/page.tsx` | Backlog anchor, live curation counts, accurate hold wording and 320px overflow fix |
| `components/hansa/day-timeline.tsx` | Decorative year label rendered as an aria-hidden SVG so it is not read as low-contrast text |
| `scripts/audit-recovery-sources.mjs` | Read-only 56-comparison source-parity audit |
| `tests/content/recovery-navigation.test.mjs` | Shelf destinations, real routes, no-script rendering, anchors and curation arithmetic |
| `docs/cleanup-20261108/RECOVERY_SOURCE_PARITY.json` | 56/56 parity results and source locations |
| `docs/cleanup-20261108/EXPORT_INVENTORY.json` | Export measurement, per-type counts and free-prune arithmetic |
| `docs/cleanup-20261108/FRESH_EXPORT_QA.json` | Post-fix browser, interaction, keyboard and accessibility evidence |
| `docs/cleanup-20261108/TARGETED_QA_AFTER_FIX.json` | Targeted diagnostic for the two UI fixes |
| `scripts/knowledge-stage-receipt.mjs` | Connect exact deployment-pause evidence to existing chain |
| `scripts/deployment-pause-receipt.mjs` | Verify only the two committed pause transitions |
| `scripts/deployment-pause-negative.mjs` | Disposable-copy positive/negative tests; no live source mutation |
| `scripts/runtime-transition-receipt.mjs` | Strict loader for the four committed runtime transitions; proves baseline-bound predecessors and rejects duplicates, drifts, weak proofs and non-lockfile hash pins |
| `tests/content/runtime-transitions.test.mjs` | Positive receipt test plus eight negative families in disposable copies |
| `docs/preservation-history/2026-11-08/RUNTIME_TRANSITIONS.json` | Exact transition evidence and commit provenance |
| `docs/fabric-corpus-integration-20261105/INTEGRATION_MANIFEST.json` | Append-only pins advancing the two verifier scripts; no historical layer was edited |
| `docs/cleanup-20261108/DEPLOYMENT_PAUSE_RECEIPT.json` | Exact transition evidence and commit provenance |
| `docs/cleanup-20261108/NEXT_INTEGRATION.md` | Protected-source ledger, curation corrections, atomic work and release gates |
| `docs/cleanup-20261108/REPORT.md` | This handoff |

Question data, answer keys, media bytes, persistence contracts, hosting configuration and workflows are unchanged by the navigation pass. `next.config.ts` and `package-lock.json` remain covered by the exact runtime-transition receipt, not re-edited here. No specialist library was added; no new dependency, service, cost or third-party transfer. The two UI fixes are markup and CSS only. The existing `F:` bundle covers the committed baseline, **not these new uncommitted maintenance files**, and `F:` was not mounted at the end of this pass.

## Verification

| Check | Result |
| --- | --- |
| `node --test scripts/deployment-pause-negative.mjs` | PASS 7/7: exact transitions, unrelated drift, rehashed permissions, restored automatic triggers, forged predecessors, unknown paths and omitted-receipt no-waiver |
| `node scripts/verify-agent-reference.mjs` | PASS: 13 active hashes; paths/router/rubric; 6 available intake hashes |
| `node --test tests/content/runtime-transitions.test.mjs` | PASS 8/8: exact four-path coverage, outside-repository rejection, scope/baseline rejection, unrecorded predecessor, post-receipt drift, ambiguous/irreversible insert proof, lockfile-only hash pin, duplicate/no-op/commit rejection |
| `node scripts/verify-knowledge-atlas.mjs` | FAIL after the four transitions are accepted: next assertion is the first unowned post-baseline runtime addition (`app/archive/page.tsx`). Structural/publication fixture checks pass |
| `node scripts/verify-easyui-integration.mjs` | FAIL at the same pre-existing unowned runtime addition after the four transitions are accepted |
| `node scripts/verify-preservation-history.mjs` | PASS: 90 exact source relocations, 23 original registry captures, three source-path-only transitions, preserved original Atlas baseline, one precise Academy config expectation update; 6 corruption/waiver rejection cases |
| `node scripts/audit-recovery-sources.mjs` | PASS 56/56 source-parity comparisons; results in `RECOVERY_SOURCE_PARITY.json` |
| `npm run test:content` | PASS 87/87, including six navigation tests and eight runtime-transition tests |
| `npm run test:all` | PASS 652/652: data-viz 62, statistics 18, fabric 35, content 87, knowledge 139, atlas 74, fabric-corpus 237; 0 failed |
| `npm run build` | PASS: 3,182 static pages, 3,175 segment aliases, build id `hansa-static-export` |
| Export inventory | PASS: 29,061 files / 3,124,901,827 bytes; 0 files over 25 MiB; free prune leaves 19,555 files / 2,693,970,374 bytes |
| Working-tree diff | PASS: changed paths are the navigation shelf, its four integration points, two UI fixes, receipt/ledger/audit tests and cleanup evidence. No question bank, media, package/lockfile, hosting config or workflow is dirty |
| Browser QA (final export) | PASS 54/54: 9 routes × 3 widths × 2 themes, HTTP 200, correct theme class, one `h1`, `main` present, zero horizontal overflow and no page/console errors. 24 axe runs returned zero violations; 8 runs left color-contrast items `incomplete` (home and the docs article) because of composited backgrounds/animation. Manual visual and domain audit NOT RUN. Practice → Draft banks kept client state; back/forward returned to the expected routes; skip link focused and reached `#main`; mobile navigation expanded with real links |

## Coverage, next step and rollback

Coverage is limited to the two exact workflow deltas, the four exact runtime transitions, existing curation ledgers and referenced recovery documents. No fresh corpus-wide semantic/source audit or complete current-release receipt coverage is claimed. The two catalogue intake copies matched their workspace originals in the earlier cleanup review; preserving source copies is intentional.

Next atomic task: decide how the historical Atlas/EasyUI gates should treat the 171 post-baseline runtime files and the 9,678 gitignored generated outputs. The defensible options are (a) a per-wave addition ledger with commit provenance, built and reviewed wave by wave, or (b) re-scoping the historical gates to the payloads they were created to freeze while the newer preservation chain covers later work. Do not bulk-pin all 171 files in one generated receipt, do not add gitignored build outputs to Git, and do not deploy until the chosen option is reviewed.

Deployment capacity is a separate owner decision. Cloudflare Workers Free allows 20,000 static files per version; this export is 29,061. Workers Paid (currently $5/month) raises the limit to 100,000 and preserves every prefetch payload. The measured free prune leaves 19,555 files but makes `_full`/`__PAGE__` prefetch requests return 404 and leaves only 445 files of headroom. Moving the 9,572 corpus media files to R2, or splitting the 16,302-file docs section across a second Worker, are free alternatives but change the current assets-only architecture and need a custom-domain/routing review. Separately, the Fabric corpus contract requires `FABRIC_CORPUS_BUILD_DIR` and the gitignored `public/fabric-*` outputs; a clean GitHub checkout cannot reproduce this export without provisioning them. None of these options is chosen here.

Rollback: remove `components/learn/collection-shelf.tsx` and `lib/recovery/navigation.ts`, revert their four integration points, and revert the two UI fixes. The receipt, audit, ledger, tests and cleanup evidence can be removed independently. No historical baseline, question bank, media file or workflow was modified. These changes remain local and uncommitted; no push or deployment was performed.
