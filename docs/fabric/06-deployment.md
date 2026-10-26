# Deployment report

## Target

| Item | Value |
|---|---|
| Host | Cloudflare Workers **Static Assets** (Free plan) |
| Worker name | `hansa` |
| Account | Amirabdelhamid227@gmail.com's Account (`b84c4bfbf06e399ceb5f5267f87cb37e`) |
| Config | `wrangler.jsonc` → `assets.directory: ./out`, `html_handling: auto-trailing-slash`, `not_found_handling: 404-page` |
| Build | `next build` with `output: "export"` writes `out/`; `postbuild` aliases RSC segment payloads |
| Command | `npm run deploy` → `npm run build && wrangler deploy` |
| No server runtime | There is no Worker script, no API route, no database, no secret |

## Deployment performed

**Yes — published and verified.**

| Item | Value |
|---|---|
| Deployed at | 2026-10-24, ~04:45 Africa/Cairo |
| Version ID | `749cd188-fe92-4a62-8ad2-299c358aa500` |
| Previous version on the same Worker | `c250b123-9aed-4347-bd5d-e3208edf6279` (rollback target) |
| Assets uploaded | 478 files (all already present from the previous upload), 957 files in the export |
| Live URL | https://hansa.amir-portfolio.workers.dev |
| Fabric hub | https://hansa.amir-portfolio.workers.dev/lab/dp-600/ |

### Verification against the live host

| Check | Result |
|---|---|
| `/lab/dp-600/` | 200, contains the hub copy |
| `/lab/dp-600/explore/` | 200 |
| `/lab/dp-600/study/` | 200, contains the guided-study shell |
| `/lab/dp-600/mock/` | 200 |
| `/lab/dp-600/resources/` | 200, contains the reference registry |
| `/lab/` | 200, still lists the six original exams and the Fabric card |
| `/` | 200, Data Lab card present, no regression |
| Full browser suite against production | **22 / 22 PASS** |

The same 22-check suite that runs against the local export was re-run with
`BASE_URL=https://hansa.amir-portfolio.workers.dev`, covering guided study, refresh
survival, mock submission, timer expiry, bookmarks, export/import, sequence ordering,
mobile layout, dark mode, reduced motion, keyboard operation, the six original exams,
Data Visualization, Statistics and the 404 page.

## What is *not* claimed

- No CDN propagation delay was observed, but DNS edge caching can vary by region.
- No Lighthouse/Core Web Vitals field data exists for the new routes; only measured
  transfer sizes (see the testing evidence).
- The deployment did not change Cloudflare settings, routes, bindings or plan.

## Rollback

Three independent rollbacks, fastest first.

### 1. Cloudflare version rollback (seconds, no rebuild)

```bash
cd amir-portfolio
npx wrangler deployments list          # find the version before c250b123
npx wrangler rollback --message "Revert Fabric hub"
```

`wrangler rollback` re-points the Worker at the previous version's assets. User data in
`localStorage` is untouched, because storage is browser-side.

### 2. Re-deploy the previous commit

```bash
git log --oneline -3                   # 18ef2e0 is the last commit before this work
git stash push -u                      # keep the Fabric work, if it is not committed yet
git checkout 18ef2e0
npm ci && npm run deploy
git checkout main && git stash pop     # restore the work
```

### 3. Remove the hub from the navigation only

If the content is the problem but the build is fine, remove the links and redeploy:

- `lib/site.ts` → drop the `{ href: "/lab/dp-600", … }` footer entry.
- `app/lab/page.tsx` and `app/page.tsx` → remove the Fabric cards.
- `app/sitemap.ts` → remove the nine `/lab/dp-600*` entries.

The routes stay deployed but undiscoverable. This is the smallest reversible change
that satisfies "the new section should not be live".

### Data rollback

Nothing server-side to roll back. Users who want to undo their own progress use
**Progress → Clear Fabric progress only**, which first copies the current record to a
timestamped recovery key. The Data Lab's `amir-lab-v1` is never touched by any of the
Fabric code paths (asserted in the browser suite).

## Operational notes

- The deployment is static; there is no cold start, no invocation cost per question.
- `wrangler deploy` uploads only changed assets (435 of 521 were already present), so
  future question-bank updates upload just the changed pack chunks.
- The build must run on a machine with the source package available only for
  `npm run import:fabric`. The generated `content/fabric/` is committed, so builds and
  deploys do not need the ZIP.
