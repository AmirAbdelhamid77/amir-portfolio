# Release record: split Workers, deterministic corpus and preservation closure

## Outcome and limits

The split release is **live** on Cloudflare Workers **Free**, with no paid backend and no custom domain. `hansa` keeps the public hostname and serves everything outside the docs subtree; `hansa-docs` serves `/learn/fabric/**` and is reached through the `DOCS` service binding. All public URLs are unchanged.

| Worker | Version | URL | Files |
| --- | --- | --- | --- |
| `hansa-docs` | `24cc0da9-7a9b-47b1-a1cf-61687c4a0a55` | <https://hansa-docs.amir-portfolio.workers.dev> | 13,642 |
| `hansa` | `2b96e415-141b-4bc8-b52e-00f6391acd02` | <https://hansa.amir-portfolio.workers.dev> | 12,420 |

The deployment was performed locally with the owner's existing Wrangler OAuth session (account `b84c4bfbf06e399ceb5f5267f87cb37e`, Wrangler 4.152.0) because the repository has **zero Actions secrets**. The manual-only workflow remains the intended CI path and still needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

Both historical preservation verifiers pass. The 173 post-baseline runtime files are pinned in `RUNTIME_ADDITIONS.json` as seven reviewed waves with exact bytes and introducing commits; this record adds one regression test as an eighth reviewed wave. No historical baseline, question bank, media file or workflow was rewritten.

The Fabric corpus is deterministic and current. The previous search corpus predated the compiler's upstream `[!INCLUDE]` resolution; regeneration from the pinned upstream changed only section text in 115 of 2,716 articles and restored the 174 alias pages the earlier export was missing. The search page's first-keystroke loss is fixed and verified locally and live.

**Not claimed:** manual visual/domain review, Atlas renderer domain/a11y review, or a fully green CI deployment. `npm run qa:search` still fails by design because the frozen script expects the pre-FC07 label and a pre-query live region; it was replaced with targeted local and live interaction checks, not edited. `hansa-docs` is also reachable at its `workers.dev` URL because `workers_dev` was not disabled.

## Evidence

- Baseline `main`: `28e1f8fcf0a7a3f117d28a1a1549eb248fb7845f`. Split-Worker implementation: `ba329c407764b1fb7d843509723b3ac13872af54` (C1). Release follow-up: `6cb21b2c79bb914aa58ecd81b2985873a03b9183` (C2). Handoff: `3b1eb76cea89fb726f17a6d377f30d0a31c88a9e` (C3). CI checkout fix: `ac4a23b1f391cc14dc061ad521e79d6cb197f43c` (C4). This deployment record is C5.
- `wrangler.jsonc` remains byte-identical to `2fe33f6` (`ee60e9418b9bc043c284dc79dadbcc01ae2103865e9950ec58fdf8e3b6f3d380`). The split config lives in `wrangler.gateway.jsonc` and `wrangler.docs.jsonc`.
- `.github/workflows/deploy-cloudflare.yml` is byte-identical to its paused historical state and stays covered by `DEPLOYMENT_PAUSE_RECEIPT.json`. The new `.github/workflows/deploy-split-workers.yml` is `workflow_dispatch` only, requires the operator to type `DEPLOY`, and has no push or schedule trigger.
- **Raw Next export:** 29,235 files / 3,124,948,414 bytes (2,980.18 MiB). **Postbuild export:** 26,060 files / 2,982,830,901 bytes (2,844.65 MiB). The postbuild step wrote 3,175 flat RSC payload aliases and pruned 3,175 nested `__next.*` originals (142,117,513 bytes / 135.53 MiB) that nothing requests. Keeping both trees stalled the Workers asset manifest and doubled the docs payload paths; the pruned build is now the reproducible source for the split.
- **Split:** docs 13,642 files / 662,902,351 bytes; main 12,420 files / 2,319,975,925 bytes; shared `404.html` + `_headers`; source 26,060. `prepare-split-workers` enforces the 20,000 limit and fails closed. The generated trees were compared path-by-path and SHA-256-by-SHA-256 with a build produced from the pruned export: all 26,062 files matched.
- **Corpus pins:** 22 families, 2,797 ledger rows, 2,716 published articles, 81 excluded articles, 947 wired aliases, 67 suppressed, 9,586 asset rows / 9,572 asset files, 106 search files, 174 alias pages. Upstream `774592ea3f2d4558f763d6e5b74abf4785948fb5`.
- **Determinism:** two clean provisioning runs produced byte-identical `fabric-docs-assets` and `fabric-search` trees; the live search tree is `ve75f9ad7202e54d4` and the 9,572 assets total 2,151,889,080 bytes byte-identical to the verified run. The 174 alias pages (admin 12, data-factory 82, fundamentals 12, onelake 26, real-time-intelligence 42) are byte-identical to the old verified worktree copy.
- **Stale-corpus why:** the previous runtime built the corpus before the compiler resolved upstream includes inside prose and link labels. Regeneration changed only `sections` in 115 of 2,716 articles; article routing, registry and counts are unchanged. Delta histogram `{10:8,13:60,17:19,20:6,27:2,33:2,34:3,40:1,50:1,51:8,66:3,80:1,217:1}`; changed families: database 59, data-warehouse 22, data-factory 16, real-time-intelligence 13, fundamentals 3, workload-development-kit 1, data-science 1. Evidence: `CORPUS_REGEN_DIFF.json`.
- **Include resolution:** `/learn/fabric/docs/data-factory/create-first-pipeline-with-sample-data/` renders the link text “How to monitor pipeline runs in Microsoft Fabric” at 320px and 1280px with no `[!INCLUDE` residue, one `main`, no overflow and no console errors.
- **Alias redirect:** `/fabric-aliases/admin/admin-center.html` returns 307 to `/fabric-aliases/admin/admin-center` (no trailing slash), whose meta refresh reaches `/learn/fabric/docs/admin/admin-overview/` with HTTP 200 and the expected title.
- **Search fix:** two independent defects in the FC07 merge band. (1) `SearchWithFabric` returned `<SearchClient>` alone when the band was hidden and as the first fragment child when visible, so the first keystroke replaced the subtree and reset the controlled field; it now always returns the same fragment shape. (2) The band's query seam listened to `input` in the **capture** phase; its synchronous re-render reset the controlled input before React's `onChange`, so the first character was lost; the listener now runs in the bubble phase. Local export: value survives the band switch, URL becomes `?q=p-value`, 9 metadata results and the Fabric band render, the Lab filter leaves two lab links, Clear restores `/search/` and “Start here”, zero console errors.
- **Live split QA:** `node scripts/qa-live-split.mjs` PASS 10/10 against the public hostname. Direct article 200 with the expected title/H1; flat RSC alias 200 (36,665 decoded characters); docs-internal client navigation kept the in-page marker and changed the article; a docs→home navigation crossed the `DOCS` binding and kept the marker; 0 HTTP≥400 responses and 0 failed requests during both navigations; live search kept `p-value`, wrote `?q=p-value`, returned 9 results and the statistics destination; alias redirect ended at the canonical article; 390px article and search overflow 0px; 0 console/page errors. Evidence: `qa/live-split-qa.json`.
- **Browser QA (local):** light PASS 72/72 and dark PASS 72/72 (24 routes × 3 viewports), with 0 non-200, 0 horizontal overflow, 0 axe violations, 0 console errors and 0 failed requests in both themes.
- **Search index QA:** 52/52 checks, 448 destinations, index revision `24d2faff`, 223 KB.
- **Test suite:** `npm run test:all` PASS 668/668 — data-viz 62, statistics 18, fabric 35, content 103, knowledge 139, atlas 74, fabric-corpus 237; 0 failed. The new content test covers alias copy + nested prune + idempotent rerun.
- **Preservation:** `verify-knowledge-atlas` and `verify-easyui-integration` PASS (5 hashed successor changes, 4 reversible transitions, 174 reviewed additions in 8 waves). `verify-preservation-history` PASS (90 exact relocations, 23 original registry captures, 3 source-path-only transitions). Deployment-pause negative suite PASS 7/7.
- **Deployment:** `hansa-docs` uploaded 10,913 files (2,728 already present) in 627s; `hansa` uploaded 11,597 files (822 already present) in 2,564s. Both workers report startup time ≤2 ms. Bindings on `hansa`: `DOCS (hansa-docs)` and `ASSETS`.
- **Live smoke:** `/` 200; `/learn/fabric/docs/admin/admin-overview/` 200; `/search/?q=p-value` 200; `/learn/fabric` 308; unknown path 404; alias 307 → meta refresh → 200.
- **CI:** dispatch `42658023133` failed during corpus provisioning with `Family count changed 6 !== 22` because Linux checked out LF while the FC02 ledger pins CRLF worktree hashes. C4 adds `git config core.autocrlf true` before checkout, but no full CI run has validated it. The failed run stopped before any credential read; no CI deployment occurred.
- **Actions secrets:** `gh api .../actions/secrets` returned `total_count=0`; the workflow cannot deploy until the owner adds the two secrets above.

## Changes

| Path | Purpose |
| --- | --- |
| `app/search/search-with-fabric.tsx` | Stable fragment shape for the Fabric band; bubble-phase query seam so the controlled input keeps the first keystroke |
| `scripts/export-segment-aliases.mjs` | Writes flat RSC aliases, then prunes the nested `__next.*` originals after every alias exists; returns counts and is idempotent |
| `tests/content/export-segment-aliases.test.mjs` | Regression test for alias copy, nested prune and rerun |
| `scripts/qa-live-split.mjs` | Live QA harness for the split release, including cross-Worker client navigation and search |
| `scripts/provision-fabric-corpus.mjs` | Writes and asserts the 174 alias pages; `--clean` clears the alias root; `--compare` checks assets, aliases and search |
| `tools/fabric-corpus/route-registry/write-alias-routes.mjs` | Honors `FABRIC_PUBLIC_ROOT` so provisioning is root-relative instead of worktree-relative |
| `scripts/build-runtime-additions-receipt.mjs` | Eighth reviewed wave for the alias-prune regression test |
| `scripts/knowledge-stage-receipt.mjs` | Resolve the terminal hop's bytes for a path pinned more than once, so the audited README chain passes the size check without touching historical pins |
| `tests/content/runtime-additions.test.mjs` | Sandbox mutators edit the receipt in place without returning a new object |
| `docs/preservation-history/2026-11-08/RUNTIME_ADDITIONS.json` | 174 reviewed post-baseline runtime files in 8 waves, exact bytes and introducing commits |
| `docs/fabric-corpus-integration-20261105/INTEGRATION_MANIFEST.json` | Append-only README pin advance `60029eac…` → `6655303c…`; no historical layer edited |
| `README.md` | Alias provisioning, final split counts, build-before-split rule, live version IDs, CI secret gap and rollback configs |
| `.github/workflows/deploy-split-workers.yml` | Header counts updated to 13,642 / 26,060; still manual-only with the `DEPLOY` gate |
| `docs/cleanup-20261108/RELEASE_INVENTORY.json` | Postbuild export, split and pruned-nested measurements |
| `docs/cleanup-20261108/CORPUS_REGEN_DIFF.json` | Old → new corpus diff (115 articles, sections only) |
| `docs/cleanup-20261108/qa/` | Light/dark browser reports, targeted search/article/alias evidence, live split report |
| `docs/cleanup-20261108/REPORT.md` | This release record |
| `docs/cleanup-20261108/NEXT_INTEGRATION.md` | Preservation closure, release preparation and deploy gates |

Generated outputs (`out/`, `out-main/`, `out-docs/`, `public/fabric-*`, `.wrangler-split-report.json`) stay gitignored and uncommitted. No dependency, question bank, media byte, localStorage key or historical baseline changed.

## Verification

| Check | Result |
| --- | --- |
| `npm run test:all` | PASS 668/668 (7 suites, 0 failed) |
| `node scripts/verify-knowledge-atlas.mjs` | PASS: 16 upstream payload hashes, 33 integration hashes, 23 links, 90 relocations; 5 successor changes, 4 transitions, 174 additions in 8 waves |
| `node scripts/verify-easyui-integration.mjs` | PASS: 41 owned hashes, 1,169 prior-file contracts, 174 reviewed additions, protected contracts |
| `node scripts/verify-preservation-history.mjs` | PASS: 90 exact relocations, 23 registry captures, 6 corruption/waiver rejection cases |
| `node scripts/verify-agent-reference.mjs` | PASS: 13 active hashes, entry paths, router v1.1, rubric weights, 6 available intake hashes. Terminal-hop size resolution accepts the audited README chain without editing the historical package pin |
| `node --test scripts/deployment-pause-negative.mjs` | PASS 7/7 |
| `node scripts/build-runtime-additions-receipt.mjs --check` | PASS: receipt matches disk and Git provenance |
| `npm run test:fabric-corpus` | PASS 237/237 |
| `npm run qa:search-index` | PASS 52/52; 448 destinations, `24d2faff`, 223 KB |
| `node scripts/qa-browser.mjs` | PASS 72/72 light: 0 failures in every category |
| `node scripts/qa-browser.mjs --dark` | PASS 72/72 dark: 0 failures in every category |
| `node scripts/qa-live-split.mjs` | PASS 10/10 live split checks; 0 console errors, 0 failed resources |
| `npm run build` | PASS: 3,182 static pages, 3,175 segment aliases |
| `node scripts/export-segment-aliases.mjs` | PASS: wrote 3,175 aliases, pruned 3,175 nested directories / 3,175 files |
| `node scripts/prepare-split-workers.mjs` | PASS: docs 13,642 / main 12,420 / shared 2 / source 26,060, limit 20,000 |
| Live Cloudflare deployment | PASS: docs version `24cc0da9-7a9b-47b1-a1cf-61687c4a0a55`; gateway version `2b96e415-141b-4bc8-b52e-00f6391acd02` |
| `npm run qa:search` | FAIL (expected): frozen script asks for “Search courses, lessons” and a pre-query live region. Current label is “Search the curriculum” and the live region appears with the query. Not edited without a transition; targeted checks used instead |
| `node scripts/audit-recovery-sources.mjs` | PASS 56/56 (previous pass; sources unchanged) |
| CI workflow `deploy-split-workers.yml` | NOT RUN green: dispatch `42658023133` failed in provisioning on LF/CRLF before credentials; C4 fix is unvalidated |
| Manual visual/domain audit | NOT RUN |
| Atlas renderer/domain/manual a11y | NOT RUN (preparation-only payload) |

## Capacity, backup and rollback

- Workers Free allows 20,000 static files per version. The split leaves 6,358 files of headroom on docs and 7,580 on main. No paid plan, R2 bucket, custom domain or new backend is required.
- The last verified bundle is `C:\Users\amira\Downloads\hansa-main-3b1eb76.bundle` (348,808,516 bytes, SHA-256 `d7d5cb57c4844211183aca32453506d9d1bb6457c6513230259ab0f1901a2120`); it covers C3 only. `F:` is still unavailable, so this run uses the owner-approved Downloads fallback. A refreshed bundle covering C4–C6 is produced after the record/receipt commits and recorded in `C:\Users\amira\Downloads\hansa-backup-receipt.txt`.
- Roll back either Worker independently: `npx wrangler rollback --config wrangler.docs.jsonc` or `npx wrangler rollback --config wrangler.gateway.jsonc`. The historical single-Worker workflow must not be dispatched for this release.
- To rebuild from source: provision the corpus from the pinned revision (`npm run corpus:provision`), run `npm run build` (which writes aliases and prunes nested payloads), then `npm run build:workers`. Delete `out-main/` and `out-docs/` before a rebuild because Next typechecks the generated worker chunks.

## Coverage and next step

Coverage is limited to the files, routes, corpus trees and receipts listed above. The corpus diff is a structural/text comparison of the generated search sections, not a fresh semantic audit of every article. The 174 alias pages are redirects, not republished content. The source-parity audit remains the earlier 56/56 check.

Next atomic tasks: (1) add the two Cloudflare Actions secrets and run `deploy-split-workers.yml` once with `DEPLOY` to validate C4's CRLF fix and the full CI path; (2) decide whether to disable `workers_dev` on `hansa-docs` now that the binding works; (3) refresh and verify the bundle after C5/C6; (4) continue the deferred content work in `NEXT_INTEGRATION.md`. No further push or deployment is authorized by this document.
