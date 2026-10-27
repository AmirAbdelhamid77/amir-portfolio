# QA, reuse and rollback

## 1. Re-running the checks

```bash
npm run build                      # static export into out/
npm run preview                    # serves out/ on 127.0.0.1:4210
npm run qa:prototype-c -- --base http://127.0.0.1:4210
```

The QA script drives the locally installed Edge through `playwright-core`, writes
`docs/prototype-c/v2/qa-browser.json` and refreshes the stage screenshots in
`docs/prototype-c/v2/evidence/`. It needs no network access, no account and no deployed
environment, and it exits non-zero on any failed check.

Unit-level checks:

```bash
npx tsc --noEmit
npx eslint components/knowledge lib/knowledge lib/atlas/peek-layout.ts lib/touch.ts lib/hooks/use-hover-capable.ts app/prototype-c
npm run test:knowledge
npm run test:atlas
```

Recordings are not produced by the script; they are captured from the running preview
(`evidence/rec-01..03`) so that a reviewer sees the real motion, not a test harness.

## 2. Files this change set owns

New:

```
components/knowledge/prototype-c.tsx
components/knowledge/knowledge-atmosphere.tsx
components/knowledge/insight-rail.tsx
components/knowledge/insight-scene.tsx
components/knowledge/insight-experiment.tsx
components/knowledge/knowledge-dealer.tsx
components/knowledge/atlas-peek-stage.tsx
components/knowledge/insight-archive.tsx
components/knowledge/insight-stage.tsx
lib/knowledge/models.ts
lib/knowledge/motion.ts
lib/atlas/peek-layout.ts
lib/touch.ts
lib/hooks/use-hover-capable.ts
tests/knowledge/models.test.mjs
tests/atlas/peek-layout.test.mjs
scripts/qa-prototype-c-v2.mjs
docs/prototype-c/v2/*            (this documentation set and its evidence)
```

Touched:

```
app/prototype-c/page.tsx         (now renders PrototypeC; ?mode=legacy preserved)
app/globals.css                  (appended "Knowledge stage" block: --stage-wash,
                                  --stage-wash-warm, --stage-dot, --stage-floor, two rules)
package.json                     (test:knowledge, test:atlas, qa:prototype-c, test:all)
```

Untouched: `components/knowledge/knowledge-stage.tsx` (the rejected V1 layout),
question banks, answer keys, saved progress, Atlas review data,
`docs/prototype-c/preservation/`, professional pages, shared shell.

## 3. Rollback

The change is additive. To return `/prototype-c/` to the V1 layout without discarding
anything:

1. Point the route back at the old stage:
   `app/prototype-c/page.tsx` → render `KnowledgeStage` instead of `PrototypeC`, or keep
   the new page and simply link to `/prototype-c/?mode=legacy` (already supported).
2. Leave the new components in place; nothing else imports them, so they become dead
   code rather than a broken surface.
3. Revert the `package.json` scripts if the QA entry point should disappear.
4. Remove the appended `globals.css` block only if the new components are deleted too;
   the aliases are scoped to `.knowledge-stage` and do not affect other pages.

Files can also be restored from the baseline commit
`496fddf998fd3c221a213d0d9b81070847c2c122` for anything that existed there
(`app/prototype-c/page.tsx`, `app/globals.css`, `package.json`). Use a path-scoped
checkout, never a whole-tree reset: the working tree carries unrelated concurrent work.

## 4. Deployment boundary

Not authorised and not performed. A passing build, a green QA run, a local preview, this
document or the design brief are not publication approval. Before any deployment:

- human publication review recorded for the three editions, or the stage unpublished;
- owner visual review of `evidence/` (gate V10);
- a fresh Atlas gate check if reviewers expect connections;
- an explicit instruction naming the environment.

## 5. Concurrent work

The checkout is shared. At the time of writing, `git status` also contains unrelated
edits outside `components/knowledge`, `lib/knowledge`, `docs/prototype-c/v2` and
`app/prototype-c`. This change set did not stage, commit, reset, stash or clean anything;
review it as a path-scoped diff. If the shared receipts under `docs/prototype-c/` are
updated by another task, append a successor note rather than overwriting the historical
records.
