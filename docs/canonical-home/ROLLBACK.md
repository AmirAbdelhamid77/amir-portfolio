# ROLLBACK — reversing this migration without data loss

Nothing here is destructive: no `git reset --hard`, no `git clean -fd`, no
stashing of another agent's work. The change set is reversible file by file, and
every file's pre-migration bytes are stored in the repository.

## What backs the rollback

| Artefact | What it gives you |
|---|---|
| `docs/canonical-home/before/<path>.snapshot` | The exact pre-migration bytes of all 14 touched files (`app/page.tsx`, `components/site-header.tsx`, `components/site-footer.tsx`, `app/prototype-c/page.tsx`, `content/knowledge/insights.json`, `lib/search/documents.ts`, `lib/site.ts`, `tsconfig.json`, and the 6 receipt/verifier scripts) |
| `docs/canonical-home/START_BASELINE.json` | SHA-256 of each before-snapshot, plus the HEAD commit (`2e09ee9…`) they were recovered from |
| `docs/canonical-home/INTEGRATION_MANIFEST.json` | before→after hash pair, basis and rollback path for every touched path, plus the two intentional removals |
| `docs/prototype-c/preservation/baseline.json` | The older, independent capture of 1401 files that predates this migration |

## Full revert of the landing migration

```bash
# 1. Restore every rewritten file from its recorded bytes (14 paths):
node -e '
const fs=require("fs"),{execSync}=require("child_process");
const m=JSON.parse(fs.readFileSync("docs/canonical-home/INTEGRATION_MANIFEST.json","utf8"));
for(const e of m.files){ if(e.generated) continue;
  fs.copyFileSync(e.rollbackPath, e.path); console.log("restored", e.path); }'

# 2. Bring the two retired modules back from git (they are staged deletions):
git restore --source=HEAD --staged --worktree \
  components/knowledge/prototype-c.tsx components/knowledge/knowledge-stage.tsx

# 3. Remove this migration's own new files (they are untracked):
rm -f components/knowledge/hansa-landing.tsx \
      tests/knowledge/canonical-home.test.mjs
```

After step 3 the tree is the pre-migration tree for everything this migration
owned. The other work streams' files (`content/drafts/`, `content/intake/`,
`app/*/drafts/`, `lib/drafts/`, `lib/intake/`, `intake/…`) are untouched by all
three steps.

## Partial / targeted reverts

| Want to undo | Do this | Side effects |
|---|---|---|
| Only the alias behaviour | Delete `app/prototype-c/page.tsx` and `git restore` the pre-migration version from `before/app/prototype-c/page.tsx.snapshot` | Old bookmarks work exactly as before; `/` stays canonical |
| Only the navigation labels | Restore `lib/site.ts` and `components/site-header.tsx` from their snapshots | The retired homepage body is gone, so the old nav would have fewer targets — check footer coverage |
| Only the metadata/SEO (title, OG, sitemap, robots) | Restore `app/page.tsx`'s `metadata` block… which means restoring the old homepage too | The old `metadata` belongs to the retired directory page; a partial SEO revert and the canonical landing are not compatible |
| Only the receipt/verifier scripts | Restore the 6 script snapshots and `tsconfig.json` | The chain verifier returns to its pre-migration expectation, which the deleted modules no longer satisfy — expect `verify-prototype-c` to fail until the modules are restored as well |

## Order that keeps the gates honest

If you revert code but keep the scripts, `verify-prototype-c.mjs` will fail
(its layer-3 manifest lists the two removals, and it asserts the removed files are
absent). Revert in the order above — files first, then the receipt layer — or
re-run `node scripts/seal-canonical-home.mjs` after choosing a new intended state.

## Independent redirect rule (none today)

There is deliberately **no** `_redirects` file and no Worker script, so there is
nothing host-level to undo. If a hosted 301 is ever added for `/prototype-c/`, it
can be removed on its own without touching the canonical landing — but do it with
the fragment caveat in [REDIRECT_DECISION.md](REDIRECT_DECISION.md) in hand.

## Data and content are out of the rollback's blast radius

- Learner progress lives in `localStorage` under `lib/fabric/storage.ts` namespaces.
  The landing never reads or writes them (source guard + browser check
  `H064/STATE`), so a rollback cannot lose progress and a rollback is not needed to
  protect it.
- Question banks, intake manifests and Atlas relations are untouched by this
  change set; they are not part of any revert step.
- `content/knowledge/insights.json` changed by **one line** (the notice wording).
  Its snapshot restores the exact previous editions.

## Deploy-side note (only if deployment is ever approved)

This migration did not deploy. If a future rollback follows a deployment, re-publish
a previously verified build (`npm run build && npx wrangler deploy`), then re-check
`/`, `/prototype-c/` (with and without the slash) and one `?insight=…#archive` link
for a redirect loop before declaring the rollback complete.
