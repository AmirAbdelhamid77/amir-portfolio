# FC12 delivery-adapter recipes — dry-run documentation, nothing activated

Measured basis: full-corpus export at registry `0c9dd4f8` — **29,015–29,019
files / ~2.96 GB** per profile (9,586 media assets ≈ 2.15 GB, 105 search
shards ≈ 25 MB, 2,717 article pages + Next RSC payloads + 170 alias pages).

Rule (03): adapters own packaging and routing only. They never compile
different application logic and never select different articles.

## A. GitHub Pages (required, subpath profile)

- **Profile:** `subpath` — basePath `/<repository>`, origin
  `https://<owner>.github.io`.
- **Input:** `packaging/subpath/` verified out/ tree (coverage gate already
  inside build-release.mjs).
- **Packaging:** `actions/upload-pages-artifact@v3` tar of out/ →
  `actions/deploy-pages@v4`. Minimal permissions: `contents: read`,
  `pages: write`, `id-token: write`. Deployment timeout 10 min (documented
  limit); artifact upload duration scales with 2.96 GB — measured dry-run
  packaging tar time recorded in the FC12 report; a full deploy needs the
  owner-approved media-independence decision (see C/B note) or must accept
  long upload windows.
- **Ceiling check:** published-site limit 1 GB (Pages limits) vs **2.96 GB →
  BLOCKED for the full-media artifact.** Levers, in architecture order:
  (1) approved immutable media origin holding `fabric-docs-assets/`
  (−2.15 GB → ~810 MB, PASS), (2) plan change. **Truncating the corpus is
  out of scope.** Text-only fallback must NOT be published as the full site.
- **Routing:** directory indexes serve trailing-slash routes; alias pages
  are plain HTML (meta refresh) — no rewrites needed. Custom 404 supported.
- **Credentials:** `GITHUB_TOKEN` (workflow-internal). Never stored.
- **Rollback:** re-run deploy of the previous tagged artifact; Pages keeps
  the last deployment restorable in the UI.

## B. Vercel (required, root profile)

- **Profile:** `root` — basePath empty.
- **Packaging path 1 (preferred):** prebuilt — `vercel build` locally/CI
  produces the Build Output API static output from out/; upload with
  `vercel deploy --prebuilt`. The Vercel CLI SOURCE upload ceiling (100 MB
  Hobby / 1 GB Pro, 15,000 source files) applies to what is UPLOADED: for
  prebuilt deploys the artifact (not the repository) is uploaded — the exact
  prebuilt-upload ceiling is **UNKNOWN** in public docs and is recorded as
  requiring controlled validation after owner approval (05 gate).
- **Packaging path 2:** Git-integration build (`vercel build` on their
  runner, 45 min limit) — 287 s measured local build fits easily.
- **Ceiling check:** no published output-size ceiling found; 2,048
  configured-route ceiling (Hobby/Pro) does not apply — filesystem routing
  only, zero rewrites configured. Hobby noncommercial eligibility must be
  confirmed by the owner before any activation.
- **Credentials:** `VERCEL_TOKEN` + project scope (names only).
- **Rollback:** Vercel instant rollback to the previous deployment.

## C. Cloudflare Workers Static Assets (optional, root profile)

- **Profile:** `root`; `wrangler.jsonc` assets config already in the repo
  (`./out`, auto-trailing-slash, 404-page).
- **Ceiling check:** 20,000 files/version (Free) vs **29,019 → BLOCKED at
  current size on Free; PASS on Paid (100,000)**. 25 MiB per-file limit:
  largest asset measured well below it. Static redirect limit 2,000: our
  redirects are static FILES, not rules — not counted.
- **Credentials:** `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`
  (pre-existing repo workflow holds these names; our workflow adds NO deploy
  jobs).
- **Rollback:** previous version rollback in the dashboard/API.

## What every adapter must NOT do

No different compile step, no article selection, no profile-specific app
logic. The only per-profile input is the base path (applied once by the
packaging driver) and the generated alias pages regenerated per profile.

## Decision summary for FC13 / owner

| Target | Text-only (~810 MB) | Full media (2.96 GB) |
|---|---|---|
| GitHub Pages (subpath) | PASS (1 GB limit) | **BLOCKED** — needs media origin or plan change |
| Vercel (root) | PASS | PASS pending controlled prebuilt-upload validation |
| Cloudflare Free | PASS (≤20k files not met by text-only? see FC13 count) | **BLOCKED** on Free, PASS on Paid |

The media-independence arrangement (separate approved immutable origin for
`fabric-docs-assets/`) is the architecture-sanctioned path that fits every
target without dropping content — it requires explicit owner approval
(storage + costs) before any activation.
