# BASELINE — Hansa canonical home migration (2026-10-28)

Everything here was recorded **before** the migration changed code, except where a
line says "after". Every claim is a command result, a read file or a recorded
hash in this repository.

## Repository

| Item | Value | Evidence |
|---|---|---|
| Path | `D:\BeUI\amir-portfolio` | working directory |
| HEAD | `2e09ee9` — "Finish Prototype C V2 knowledge stage with re-verified QA and documents" | `git log --oneline` |
| Branch | `feat/dp600-academy-ingestion-20261025` | `git branch --show-current` |
| Worktrees | one (`D:/BeUI/amir-portfolio 2e09ee9`) | `git worktree list` |
| Published origin | `https://hansa.amir-portfolio.workers.dev/` (Cloudflare Workers Static Assets) | `lib/site.ts`, `wrangler.jsonc` |

### Dirty state at session start (not created by this migration)

`git status --short` before any edit:

- Modified: `.gitignore`, `AGENTS.md`, `package.json`.
- Untracked: `.agents/`, `AGENTS.md.backup-20261027-231630`, `AGENTS_ADDENDUM.md`,
  `AGENT_INSTALL_PROMPT.md`, `INSTALL_README_AR.md`, `MANIFEST_SHA256.txt`,
  `app/learn/drafts/`, `app/practice/drafts/`, `components/learn/`,
  `components/practice/`, `content/drafts/`, `content/intake/`,
  `docs/intake-merge/`, `graphify-out/`, `install_hansa_skill.ps1`,
  `intake/dp600-r18-2026-10-27/`, `intake/pl300-v88-2026-10-27/`, `lib/drafts/`,
  `lib/intake/`, `scripts/build-draft-banks.mjs`, `scripts/build-intake-content.mjs`,
  `scripts/qa-drafts.mjs`, `tests/content/drafts-integration.test.mjs`.

Those belong to two other work streams (a question-bank/media intake merge and a
creative-patterns intake). Nothing in the set was stashed, reset or committed.

## Configuration (read, not assumed)

- `next.config.ts`: `output: "export"`, `trailingSlash: true`,
  `images.unoptimized: true`, optional `basePath`/`assetPrefix` from
  `NEXT_PUBLIC_BASE_PATH`, `postbuild` runs `scripts/export-segment-aliases.mjs`.
- `wrangler.jsonc`: `name: "hansa"`, `assets.directory: "./out"`,
  `html_handling: "auto-trailing-slash"`, `not_found_handling: "404-page"`.
  **No `public/_redirects` and no Worker script** — assets only.
- `public/_headers`: HSTS, `X-Frame-Options`, `Permissions-Policy`,
  `Cross-Origin-Opener-Policy`, and long-lived caching for `/_next/static/*`.
- Versions: Next `16.4.3`, React `19.3.0`, `motion ^14.6.0`, TypeScript `^5`,
  Tailwind `^4`, `playwright-core ^1.64.1`, `axe-core ^4.14.0`, `wrangler ^4.152.0`.
- `tsconfig.json` included `**/*.ts(x)` with only `node_modules` excluded, so the
  gitignored `build/` scratch tree was part of the typecheck project. The
  migration narrows that (see `FILE_OWNERSHIP.md`).

## What lived where before the migration

Pre-migration bytes of every file this migration touched are stored under
`docs/canonical-home/before/*.snapshot` and hashed in `START_BASELINE.json`.

| URL | Source at baseline | Role |
|---|---|---|
| `/` | `app/page.tsx` (**317 lines**) | Portfolio-framed learning directory: hero, three doorways, learning routes, quick links, CTA, stats — with a dormant `NEXT_PUBLIC_HANSA_PROTOTYPE_C === "1"` early return |
| `/prototype-c/` | `app/prototype-c/page.tsx` (9 lines) → `components/knowledge/prototype-c.tsx` → `insight-stage.tsx` | The owner-selected knowledge stage, `noindex` |
| — | `components/knowledge/knowledge-stage.tsx` | A second landing implementation, reachable only through that flag path |

Landing content at baseline: three `technical_review` editions dated
2026-10-24/25/26, all with `conceptId: concept:fabric:shortcut`, empty
`questionIds`, `?insight=` deep links, `#archive` anchor, Atlas pending state.

## Known drift at baseline (verified, not inferred)

| Fact | Evidence |
|---|---|
| `components/knowledge/prototype-c.tsx` had already drifted from what the layer-1 receipt expected | `INTEGRATION_MANIFEST.json` → `removed[0]`: layer-1 `expectedSha256 df5cb79d…` vs committed bytes `c9c4b579…` |
| The chain receipt could therefore not pass before the migration | `scripts/verify-prototype-c.mjs` failed on that path |
| Agent-reference and knowledge-atlas verifiers fail on `AGENTS.md` size/integration | `AGENTS.md` was already modified in the working tree at session start; the reference ledger records the committed size |

The remaining verifier failures (`verify-preservation-history`,
`verify-easyui-integration`) stem from the same pre-existing `package.json` and
`AGENTS.md` edits, which belong to the other work streams. They are reported as
**pre-existing, not caused by this migration** in `BUILD_TEST_LOG.md`, with their
exact output.

## What the baseline could not establish

- No browser was pointed at the live deployment, so **no claim is made that the
  published site matches HEAD**. Every browser artefact in this package is
  against a local static export of the working tree.
- The owner audit's 117 internal URLs are a discovery list. `ROUTE_CENSUS.csv`
  reconciles them against source and export; it does not prove each page's
  content is correct.
- Scientific status of question banks and Atlas relations was not re-audited —
  the migration touches neither.
- Unicode/typographic rendering and screen-reader behaviour were smoke-tested
  (axe + keyboard), not certified.
