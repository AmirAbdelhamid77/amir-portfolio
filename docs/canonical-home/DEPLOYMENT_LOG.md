# DEPLOYMENT LOG — authorized production deploy (2026-10-28)

This migration was sealed as `noDeployment: true`. That flag records the state of
the **migration layer** at sealing time and stays as sealed: the receipt binds
source bytes, and re-writing a sealed manifest to record a later deployment would
break the hash chain that makes the rollback copies trustworthy. The deployment is
therefore recorded here, separately, and the chain was re-verified afterwards.

## What ran

| Field | Value |
|---|---|
| Authorization | Explicit owner instruction: "deploy" |
| Command | `npm run deploy` → `next build && wrangler deploy` |
| Runner | Wrangler (project `wrangler.jsonc`, assets-only Worker, no Worker script) |
| Target | `hansa` → **https://hansa.amir-portfolio.workers.dev** |
| Version ID | `b63f1fd6-45aa-4eb8-bad5-19fce2c91966` |
| Assets | 496 files uploaded (450 already present), 41.71 s; Worker upload 0.31 KiB; trigger deploy 2.08 s |
| Result | exit 0, `✨ Success!` |
| Source state | Working tree at HEAD `2e09ee9` **plus the uncommitted migration** (see risk R8 below) |

Safe to deploy: `npx wrangler whoami` confirmed credentials with the needed scopes
before the build; the receipt chain, lint, typecheck, all 196 tests, the build, the
34 HTTP checks and the 45 browser checks had all passed on this exact tree first.

## Live smoke test (real origin, after deploy)

HTTP status, measured directly:

| Request | Status |
|---|---|
| `GET /` | **200** |
| `GET /prototype-c` | **307** → `/prototype-c/` (Cloudflare automatic trailing-slash redirect — temporary, so no permanent cache trap) |
| `GET /prototype-c/` | **200** |
| `GET /?insight=hansa-insight-shortcut-delete-v1` | **200** |
| `GET /intentionally-nonexistent-qa/` | **404** |

Content and metadata, read in a real browser on the live origin:

| Check | Result |
|---|---|
| Root title / canonical / OG / Twitter | `Hansa — interactive data learning and knowledge` · `https://hansa.amir-portfolio.workers.dev/` · same identity on both social tags |
| Root robots | no `noindex` on `/` |
| Stage markers in the served HTML | **5/5** on `/` |
| Legacy address | 200, **5/5** the same markers, `robots: noindex, nofollow`, `canonical: /` |
| Header `Today` | points at `/` on both addresses; **0** links to the legacy address anywhere on the page |
| Deep links | `?insight=…delete-v1` is server-rendered with the right edition; `?insight=…discovery-v1` likewise |
| Rail, live | "Older edition" moved the selection to "Name the object you are deleting." and wrote `/?insight=hansa-insight-shortcut-delete-v1` |
| Card dealer, live | "Deal three ideas" dealt 3 cards (principle / caveat / evidence), "Collect all" enabled |
| Atlas state | "Reviewed connections are not published yet" with `Open the Atlas`; no invented graph, no full-Atlas CTA |
| Learner storage | `localStorage` keys: **0** before and after dealing and rail navigation — the landing wrote nothing |
| Sitemap | 200, **117** `<loc>` entries, homepage present, **no `prototype-c`** |
| `robots.txt` | 200, points at the sitemap |
| Question-bank / progress / Atlas data | untouched by the deploy; assets-only Worker, no data bindings |

### Console

- **No errors from the site's own assets.** Every asset the page requested returned
  200 (fonts, three stylesheets, chunks, `/og.png`, `/icon.svg`, `/apple-icon.png`).
- Four `Failed to load resource: 404` entries were produced by **my own probe
  requests** (`/intentionally-nonexistent-qa/`, `/favicon.ico`, `/icon.png`,
  `/manifest.webmanifest`).
- One benign warning: Next.js preloads a stylesheet (`2b366eumstlg6.css`) that it
  then applies through the router; the file itself returns 200.
- **Pre-existing, not caused by this migration:** `public/` has no `favicon.ico`
  and no web manifest, so the browser's default `/favicon.ico` request 404s. The
  app does provide `/icon.svg` and `/apple-icon.png` (both 200). Left as found.

## Chain re-verification after the deploy

The deploy runs a build. The generated TypeScript cache is the one receipt entry
that a rebuild can move, so it was checked again:

```
node scripts/verify-prototype-c.mjs
→ { "status": "PASS", "ownedPaths": 17, "corruptionRejectionCases": 6 }
tsconfig.tsbuildinfo  sealed 12df90a92dcb · now 12df90a92dcb → MATCH
```

## Risk recorded by this deployment

**R8 — the deployed artifact is not traceable to a commit.** The build came from
the working tree, which contains the migration as uncommitted changes (plus two
staged deletions). Reproducing this exact deployment later therefore depends on the
tree, not on a commit hash. Committing the change set resolves it; a push was not
performed and was not requested.
