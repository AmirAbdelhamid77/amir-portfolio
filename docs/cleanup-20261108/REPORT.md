# Release preparation: split Workers, deterministic corpus and preservation closure

## Outcome and limits

The release candidate is now internally consistent and fits the Cloudflare Workers **Free** plan without a paid backend: the static export is split into two assets-only Workers and every public URL stays the same. `hansa` keeps the public hostname and serves everything outside the docs subtree; `hansa-docs` serves `/learn/fabric/**` and is reached through a `DOCS` service binding. Both versions are under the 20,000-file Free limit (16,370 and 12,867 files). Deployment configuration is prepared but not executed: no push, no deploy and no DNS change happened, and GO/NO-GO remains an owner decision.

Both historical preservation verifiers now pass. The 173 post-baseline runtime files are pinned in `RUNTIME_ADDITIONS.json` as seven reviewed waves with exact bytes and introducing commits, and the four earlier runtime transitions keep their exact reverse proofs. No historical baseline, question bank, media file or workflow was rewritten.

The Fabric corpus is no longer served stale. The previous search corpus predated the compiler's upstream `[!INCLUDE]` resolution; a deterministic regeneration from pinned upstream changed only section text in 115 of 2,716 articles and restored the 174 alias pages that the earlier export was missing. The search page's first-keystroke loss is fixed and verified on the final export.

**Not claimed:** manual visual/domain review, Atlas renderer domain/a11y review, live production smoke test. `npm run qa:search` still fails by design of the frozen script (it expects the pre-FC07 label and a pre-query live region); it was replaced with a targeted interaction check, not edited. See [Verification](#verification).

## Evidence

- Baseline `main`: `28e1f8fcf0a7a3f117d28a1a1549eb248fb7845f`. Split-Worker implementation commit: `ba329c4` (C1, 21 files). Release follow-up commit: `6cb21b2c79bb914aa58ecd81b2985873a03b9183` (C2, 18 files); this handoff is committed on top. No push, no deploy.
- `wrangler.jsonc` remains byte-identical to `2fe33f6` (`ee60e9418b9bc043c284dc79dadbcc01ae2103865e9950ec58fdf8e3b6f3d380`). The split config lives in `wrangler.gateway.jsonc` and `wrangler.docs.jsonc`.
- `.github/workflows/deploy-cloudflare.yml` is byte-identical to its paused historical state and stays covered by `DEPLOYMENT_PAUSE_RECEIPT.json`. The new `.github/workflows/deploy-split-workers.yml` is `workflow_dispatch` only, requires the operator to type `DEPLOY`, and has no push or schedule trigger.
- **Full export:** 29,235 files / 3,124,948,414 bytes (2,980.18 MiB). Docs section: 16,302 files / 745,979,238 bytes. No file exceeds 25 MiB; the largest is `fabric-docs-assets/data-science/media/data-agent-ontology-as-context/export-ontology-context.gif` at 25,470,479 bytes. Segment aliases: 19,056 files (3,177 `index.html`, 3,176 `index.txt`/`_full`/`_tree`, 3,175 nested `__PAGE__.txt`, 3,176 flat aliases).
- **Split:** docs 16,370 files / 782,318,189 bytes; main 12,867 files / 2,342,677,600 bytes; shared `404.html` + `_headers`; source 29,235. `prepare-split-workers` enforces the 20,000 limit and fails closed.
- **Corpus pins:** 22 families, 2,797 ledger rows, 2,716 published articles, 81 excluded articles, 947 wired aliases, 67 suppressed, 9,586 asset rows / 9,572 asset files (a shared asset appears once per family in the manifest), 106 search files, 174 alias pages. Upstream `774592ea3f2d4558f763d6e5b74abf4785948fb5`.
- **Determinism:** two clean provisioning runs produced byte-identical `fabric-docs-assets` and `fabric-search` trees; the live search tree is `ve75f9ad7202e54d4` and the 9,572 assets total 2,151,889,080 bytes byte-identical to the verified run. The 174 alias pages (admin 12, data-factory 82, fundamentals 12, onelake 26, real-time-intelligence 42) are byte-identical to the old verified worktree copy.
- **Stale-corpus why:** the previous runtime built the corpus before the compiler resolved upstream includes inside prose and link labels. Regeneration changed only `sections` in 115 of 2,716 articles; article routing, registry and counts are unchanged. Delta histogram `{10:8,13:60,17:19,20:6,27:2,33:2,34:3,40:1,50:1,51:8,66:3,80:1,217:1}`; changed families: database 59, data-warehouse 22, data-factory 16, real-time-intelligence 13, fundamentals 3, workload-development-kit 1, data-science 1. Evidence: `CORPUS_REGEN_DIFF.json`.
- **Include resolution:** `/learn/fabric/docs/data-factory/create-first-pipeline-with-sample-data/` renders the link text “How to monitor pipeline runs in Microsoft Fabric” at 320px and 1280px with no `[!INCLUDE` residue, one `main`, no overflow and no console errors.
- **Alias redirect:** `/fabric-aliases/admin/admin-center.html` resolves to `/learn/fabric/docs/admin/admin-overview/` with HTTP 200 and the expected title.
- **Search fix:** two independent defects in the FC07 merge band. (1) `SearchWithFabric` returned `<SearchClient>` alone when the band was hidden and as the first fragment child when visible, so the first keystroke replaced the subtree and reset the controlled field; it now always returns the same fragment shape. (2) The band's query seam listened to `input` in the **capture** phase; its synchronous re-render reset the controlled input before React's `onChange`, so the first character was lost; the listener now runs in the bubble phase. Final export: value survives the band switch, URL becomes `?q=p-value`, 9 metadata results and the Fabric band render, the Lab filter leaves two lab links, Clear restores `/search/` and “Start here”, zero console errors.
- **Browser QA:** light PASS 72/72 and dark PASS 72/72 (24 routes × 3 viewports), with 0 non-200, 0 horizontal overflow, 0 axe violations, 0 console errors and 0 failed requests in both themes.
- **Search index QA:** 52/52 checks, 448 destinations, index revision `24d2faff`, 223 KB.
- **Test suite:** `npm run test:all` PASS 667/667 — data-viz 62, statistics 18, fabric 35, content 102, knowledge 139, atlas 74, fabric-corpus 237; 0 failed.
- **Preservation:** `verify-knowledge-atlas` and `verify-easyui-integration` PASS (5 hashed successor changes, 4 reversible transitions, 173 reviewed additions in 7 waves). `verify-preservation-history` PASS (90 exact relocations, 23 original registry captures, 3 source-path-only transitions). Deployment-pause negative suite PASS 7/7.
- **Live Cloudflare validation:** `wrangler whoami` now succeeds (OAuth, account `b84c4bfbf06e399ceb5f5267f87cb37e`, matching the workflow comment). Config dry-runs are recorded below.

## Changes

| Path | Purpose |
| --- | --- |
| `app/search/search-with-fabric.tsx` | Stable fragment shape for the Fabric band; bubble-phase query seam so the controlled input keeps the first keystroke |
| `scripts/provision-fabric-corpus.mjs` | Writes and asserts the 174 alias pages; `--clean` clears the alias root; `--compare` checks assets, aliases and search |
| `tools/fabric-corpus/route-registry/write-alias-routes.mjs` | Honors `FABRIC_PUBLIC_ROOT` so provisioning is root-relative instead of worktree-relative |
| `scripts/build-runtime-additions-receipt.mjs` | Seventh reviewed wave for the split-Worker tests and receipt loader |
| `scripts/knowledge-stage-receipt.mjs` | Resolve the terminal hop's bytes for a path pinned more than once, so the audited README chain passes the size check without touching historical pins |
| `tests/content/runtime-additions.test.mjs` | Sandbox mutators edit the receipt in place without returning a new object |
| `docs/preservation-history/2026-11-08/RUNTIME_ADDITIONS.json` | 173 reviewed post-baseline runtime files in 7 waves, exact bytes and introducing commits |
| `docs/fabric-corpus-integration-20261105/INTEGRATION_MANIFEST.json` | Append-only README pin advance `60029eac…` → `6655303c…`; no historical layer edited |
| `README.md` | Alias provisioning, final split counts, build-before-split rule, rollback configs and the manual split workflow |
| `.github/workflows/deploy-split-workers.yml` | Header counts corrected to 29,235; still manual-only with the `DEPLOY` gate |
| `docs/cleanup-20261108/RELEASE_INVENTORY.json` | Final export measurement and per-type counts |
| `docs/cleanup-20261108/CORPUS_REGEN_DIFF.json` | Old → new corpus diff (115 articles, sections only) |
| `docs/cleanup-20261108/qa/` | Light/dark browser reports and targeted search/article/alias evidence |
| `docs/cleanup-20261108/REPORT.md` | This handoff |
| `docs/cleanup-20261108/NEXT_INTEGRATION.md` | Preservation closure, release preparation and deploy gates |

Generated outputs (`out/`, `out-main/`, `out-docs/`, `public/fabric-*`, `.wrangler-split-report.json`) stay gitignored and uncommitted. No dependency, question bank, media byte, localStorage key or historical baseline changed.

## Verification

| Check | Result |
| --- | --- |
| `npm run test:all` | PASS 667/667 (7 suites, 0 failed) |
| `node scripts/verify-knowledge-atlas.mjs` | PASS: 16 upstream payload hashes, 33 integration hashes, 23 links, 90 relocations; 5 successor changes, 4 transitions, 173 additions |
| `node scripts/verify-easyui-integration.mjs` | PASS: 41 owned hashes, 1,169 prior-file contracts, 173 reviewed additions, protected contracts |
| `node scripts/verify-preservation-history.mjs` | PASS: 90 exact relocations, 23 registry captures, 6 corruption/waiver rejection cases |
| `node scripts/verify-agent-reference.mjs` | PASS: 13 active hashes, entry paths, router v1.1, rubric weights, 6 available intake hashes. Terminal-hop size resolution accepts the audited README chain without editing the historical package pin |
| `node --test scripts/deployment-pause-negative.mjs` | PASS 7/7 |
| `node scripts/build-runtime-additions-receipt.mjs --check` | PASS: receipt matches disk and Git provenance |
| `npm run test:fabric-corpus` | PASS 237/237 |
| `npm run qa:search-index` | PASS 52/52; 448 destinations, `24d2faff`, 223 KB |
| `node scripts/qa-browser.mjs` | PASS 72/72 light: 0 failures in every category |
| `node scripts/qa-browser.mjs --dark` | PASS 72/72 dark: 0 failures in every category |
| Targeted search interaction | PASS: value persists, `?q=p-value`, 9 results, Fabric band, Lab filter, Clear restores start state, 0 console errors |
| Targeted article + alias QA | PASS: include resolved at 320/1280, no overflow, alias 200 → `/learn/fabric/docs/admin/admin-overview/` |
| `npm run build` | PASS: 3,182 static pages, 3,175 segment aliases |
| `node scripts/prepare-split-workers.mjs` | PASS: docs 16,370 / main 12,867 / shared 2 / source 29,235, limit 20,000 |
| `npm run qa:search` | FAIL (expected): frozen script asks for “Search courses, lessons” and a pre-query live region. Current label is “Search the curriculum” and the live region appears with the query. Not edited without a transition; targeted check used instead |
| `node scripts/audit-recovery-sources.mjs` | PASS 56/56 (previous pass; sources unchanged) |
| Manual visual/domain audit | NOT RUN |
| Atlas renderer/domain/manual a11y | NOT RUN (preparation-only payload) |
| Cloudflare live validation | `wrangler whoami` PASS (account `b84c4bfb…`); 1,000-file subset `deploy --dry-run` PASS with the docs worker and bindings. The full 16,370-file dry-run read 32,797 entries, wrote the bundle, then made no progress for 4 minutes with no network sockets and no CPU use; it is a wrangler Free/asset-manifest scale limit in this environment, not a config error. The first dispatched deploy must be watched |

## Capacity, backup and rollback

- Workers Free allows 20,000 static files per version. The split leaves 3,630 files of headroom on docs and 7,133 on main. No paid plan, R2 bucket, custom domain or new backend is required.
- The `F:` drive is mounted (25,180,360,704 bytes used, 5,847,998,464 free). Its pre-release bundle covers `28e1f8f`; the release commits `ba329c4` + `6cb21b2` are bundled separately before push, with the path recorded in the backup receipt on that drive.
- Roll back either Worker independently: `npx wrangler rollback --config wrangler.docs.jsonc` or `npx wrangler rollback --config wrangler.gateway.jsonc`. The historical single-Worker workflow must not be dispatched for this release.
- To rebuild from source: provision the corpus from the pinned revision (`npm run corpus:provision`), run `npm run build`, then `npm run build:workers`. Delete `out-main/` and `out-docs/` before a rebuild because Next typechecks the generated worker chunks.

## Coverage and next step

Coverage is limited to the files, routes, corpus trees and receipts listed above. The corpus diff is a structural/text comparison of the generated search sections, not a fresh semantic audit of every article. The 174 alias pages are redirects, not republished content. The source-parity audit remains the earlier 56/56 check.

Next atomic task: owner review of this release candidate and a GO/NO-GO for the split deployment, including confirmation of the Cloudflare account, the two Worker names, the `DOCS` binding and the `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` secrets. After approval: refresh the `F:` bundle, push the reviewed commits, dispatch `deploy-split-workers.yml` with `DEPLOY`, then smoke-test the public hostname and both rollback paths. No push or deployment is authorized by this document.
