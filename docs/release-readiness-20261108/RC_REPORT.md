# Release 1 candidate — unified V3 + Fabric corpus + Knowledge Graph (full media)

Date: 2026-11-08 · Branch: `release/v1` · Worktree: `D:/BeUI/amir-portfolio-release-v1`
Status: **built and verified locally, NOT deployed.** Deployment (public or private), production
changes and any merge into `main` remain blocked pending explicit owner authorization.

## 1. Build identity

| Commit | Meaning |
|---|---|
| `3d94030` | committed V3 baseline (= origin/main) |
| `a775483` | freeze: the owner's Active V3 working state (297 files, byte-exact vs seal) |
| `ae8153e` | merge: fabric corpus integration `feat/fabric-corpus-20261105` @ `1e27db7` (zero conflicts) |
| `2efa23c` | merge: knowledge graph radial tree `prototype/network-tree` @ `37f8c0a` |
| `7e11a23` | receipt: release/v1 chain transitions (see §4) |

Preservation: seal manifests + `v3-status-uall.txt` (298 entries) and all dirty-file SHA-256
manifests live in `D:/BeUI/release-v1-20261108/`; a verified private bundle
(`amir-portfolio-all-refs-20261108.bundle`, 345 MB, complete history) is the Git backup. The
owner worktree `D:/BeUI/amir-portfolio` was never touched.

## 2. Verification results

| Gate | Result |
|---|---|
| Freeze integrity | 297/297 files sha256-verified byte-exact against the seal; 0 phantom diffs post-commit |
| `test:knowledge` (pre-merge, receipt pins + canonical-home guard) | 123/123 PASS |
| Full `test:all` (post-merge, 7 areas) | **633 tests, 0 failures** (62 data-viz, 18 statistics, 35 fabric, 68 content, 139 knowledge, 74 atlas, 237 fabric-corpus) |
| Unified build (`npm run build`) | exit 0; postbuild wrote 3,153 segment aliases |
| Export measurements | **28,875 files / 2,963.2 MB**; 2,717 fabric article dirs (2,716 published + docs index) |
| Media reference integrity | **9,576 distinct `/fabric-docs-assets/` references in exported HTML — 0 missing** |
| Graph route export | `/prototype/network/index.html` + all 7 dataset JSONs present |
| Search shards | `out/fabric-search/` manifest + versioned shard dir present |
| KG datasets vs unified model (`npm run graph:build`) | content-identical; only `generatedAt` differs → committed datasets accurate (prebuild hook deliberately not carried) |
| Byte-reproducibility re-proof | see §6 (run after this report was drafted) |
| Homepage (promoted default) | sha256 `49775e095d817e23b256334cf09dd0a46e2596c3ec251ce5aab390d54d0e11a8` (112,827 B). Differs from the V3-only RC (`73600bef…`, 113,129 B) because merged code changes content-hashed chunk URLs; visual content unchanged |

## 3. Media integration (full-media requirement)

- Source: `MicrosoftDocs/fabric-docs` pinned `774592ea`; 9,572 media files (9,125 png, 306 jpg,
  78 gif, 56 svg, 7 jpeg), 2.03 GB, copied byte-preserved from the fabric worktree into
  `public/fabric-docs-assets/` and exported unchanged (no recompression, no duplication).
- Largest files: 3 GIFs at 20.3 / 20.6 / 24.3 MiB — all under the 25 MiB per-object limit of
  Workers/R2-style hosts.
- Text rights: **CC BY 4.0** (`LICENSE`, plus separate `LICENSE-CODE`); per-article attribution via
  the provenance footer — re-verify presentation at the deploy gate.
- Media rights: the project ledger (`tools/fabric-corpus/registry/rights.json`) keeps 524 held
  exception rows, **none cleared**; the owner has acknowledged responsibility for the usage-rights
  review. Nothing here represents unclear rights as cleared.
- Observation (non-blocking): the fabric docs articles are not enumerated in `sitemap.xml`
  (357 curated entries; as-built behavior of the fabric branch). Discovery runs through hub
  pages, collections and search. Owner may request sitemap enumeration later.

## 4. Receipt-chain reconciliation (pre-flight #3)

The merge put fabric's stricter FC-chain verifier next to the owner's advanced M6 state. All
drifts were resolved by recorded chain transitions in
`docs/fabric-corpus-integration-20261105/INTEGRATION_MANIFEST.json` (commit `7e11a23`):

1. FC predecessor re-pin: the M6 manifest advanced by the owner's R3–R6 promotion
   (`6507ab5b…` → `41e94509…`) — the layer's own rule sanctions re-pinning a predecessor whose
   hash no longer matches disk.
2. `lib/atlas/model.ts` pin: the merged union of the owner's parseView `return` acceptance and
   fabric's `>= 2048` boundary fix.
3. `package.json` pin + audited dependency additions (`d3-force`, `@types/d3-force`).
4. `tsconfig.json` pin (`prototype-archive` exclude).
5. `tests/knowledge/daily-bank.test.mjs` pin: the owner's post-RC edit (this drift also exists in
   the owner's own working tree — their last green run predates the edit).
6. `scripts/final-review-receipt.mjs`: successor-audit allowlist gains `qa:network` and
   `graph:build`; its own bytes pinned.

`hansa-landing.tsx` needed no reconciliation — its pin chain already terminates on the owner's
promoted bytes (verified by the 123/123 pre-merge knowledge suite and the full run).

## 5. Fail-closed inventory (unchanged by this integration)

- 81 held articles: never generated (`generateStaticParams` is published-only, `dynamicParams=false`);
  2,717 dirs = published only; they 404 cleanly.
- Atlas public projection: **empty (0 approved)** — the committed approval sidecar is the only
  sanctioned path to `approved`; D2 (6-record seed) remains the owner's decision.
- R1/R2 review neighbourhood: closed pending D5. Home R3–R6: promoted by env-switch design
  (`HANSA_* !== "0"`); rollback = one variable + rebuild.

## 6. Byte-reproducibility re-proof

Full SHA-256 manifest of the export (28,875 files) → clean rebuild → second manifest → diff.
Result: **PASS — 0 diff lines; every exported file byte-identical across two independent builds**
(manifests + diff preserved in `D:/BeUI/release-v1-20261108/out-manifest-1.sha256`,
`out-manifest-2.sha256`, `out-repro.diff`).

## 7. Deployment evaluation (private-use-first, per owner instruction)

Measured facts: full unified export = 28,875 files / 2,963.2 MB. Without the media tree:
≈ 9,300 files / ≈ 800 MB (text + shards + app). Media alone: 9,572 files / 2.03 GB.

| Option | Fit | Auth story | Notes |
|---|---|---|---|
| Cloudflare Workers **Free** (current `wrangler.jsonc`) | **BLOCKED** for full media — 20,000 files/version < 28,875 | — | Current live site (`hansa.amir-portfolio.workers.dev`, old preview build) runs here |
| Cloudflare Workers **Paid** | PASS (w4b) | Cloudflare Access (Zero Trust, free ≤50 users) in front of a custom domain | Single-host, simplest move from current config; ~$5/mo |
| **Split: Workers Free (app+text ≈9.3k files) + R2 (media 9,572 files, 2.03 GB; 10 GB free tier)** | PASS both, near-zero cost | Access on the app host; media behind the same Access if served via a Worker route, or public-read bucket if acceptable | Requires a small routing change for `/fabric-docs-assets/*` → R2; keeps original paths/URLs |
| **Vercel (full site)** | PASS both profiles (w4b) | Vercel Deployment Protection (login/SSO) — first-class private deployments | Easiest authenticated full-site option; new project wiring |
| GitHub Pages | BLOCKED (1 GB soft limit vs 2.96 GB) | — | Also currently not enabled (API 404, per owner record) |

Existing live deployment mechanism: GitHub Actions `deploy-cloudflare.yml` (needs
`CLOUDFLARE_API_TOKEN` secret; account id documented in-file) or local `wrangler deploy`.
Rollback path before any replacement: capture the current deployment version
(`wrangler versions list` / `wrangler rollback`), keep `out-rc/`-style hash pins, and use the
`HANSA_*` env switches for content-slice rollback. Nothing was deployed in this RC cycle.

## 8. Accessibility gate

Automated: axe-based suites inside `test:all` + `qa:browser` / `qa:browser:dark` available.
**Manual NVDA/VoiceOver pass (D3): NOT RUN — explicit pre-deployment gate**, to be scheduled by
the owner. No waiver issued.

## 9. Limits

- Single-OS verification (Windows); browsers exercised via the automated suites only.
- The 2.1 GB media tree exists as gitignored working bytes in two places (fabric worktree,
  release worktree) + re-derivable from the pinned upstream; the asset manifest in the repo
  pins their hashes.
- Owner decisions still open: D1 final sign-off, D2, D3, D5, deploy target/auth choice, media
  rights review, held-article dependency acquisition.
