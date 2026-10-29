# Rollback

The code is **uncommitted working-tree state** on
`feat/dp600-academy-ingestion-20261025` — nothing was committed or pushed. The
build *was* deployed at the owner's request, so there are two separate rollbacks:
the live site, and the source.

## Roll back the live site (fastest)

```powershell
npx wrangler deployments list          # find the previous version id
npx wrangler rollback <version-id>     # re-point the Worker at it
```

Live now: `https://hansa.amir-portfolio.workers.dev`, version
`684da0e9-d5a5-4478-b6d5-7e361d257135` (deployed 2026-10-29). Rolling back the
Worker restores the previous uploaded asset set immediately; it does not touch
the working tree.

## Roll back the source

Reverting the source is a separate decision from reverting the live site; after
reverting, `npm run build && npx wrangler deploy` publishes the older tree.

```powershell
# files that existed before Phase 2 and were edited
git checkout -- `
  app/page.tsx `
  app/layout.tsx `
  components/knowledge/insight-stage.tsx `
  components/knowledge/knowledge-dealer.tsx `
  components/knowledge/atlas-peek-stage.tsx

# files Phase 2 added (safe to delete once nothing imports them)
Remove-Item -Recurse -Force components/cinematic
Remove-Item -Force lib/atlas/field.ts
Remove-Item -Force lib/motion/cinematic.ts
Remove-Item -Force tests/knowledge/cinematic-field.test.mjs
Remove-Item -Recurse -Force docs/cinematic-spatial
Remove-Item -Force scripts/phase2-capture-spatial.mjs, scripts/phase2-spatial-qa.mjs, scripts/phase2-spatial-perf.mjs, scripts/qa-production-smoke.mjs
```

Then `npm run build` and `node scripts/qa-canonical-home.mjs`.

**Scope caveat:** the deployment uploaded the whole `out/` build of the working
tree, so it also published the other uncommitted work present at that moment
(`app/lab/*`, `components/atlas/*`, catalogue and exam changes by other agents).
There is no per-feature deployment: rolling the Worker back reverts all of it
together, and redeploying publishes whatever the tree contains at that time.

`app/page.tsx` is the single switch: it renders `InsightStage`. Restoring the
pre-Phase-2 `app/page.tsx` returns `/` to the earlier landing while leaving the
new files unimported.

## Partial reverts

| Symptom | Revert only |
| --- | --- |
| Scroll-linked motion feels stepped or slow | `components/cinematic/use-scroll-progress.ts` together with the `--hero-p` / `--handoff-*` / `--field-p` block in `components/cinematic/cinematic.css` (see ARCHITECTURE §2 for the write-target rule) |
| Atlas renders once but never repaints | `components/cinematic/spacetime-atlas.tsx` — the `dirtyRef` handling in the draw loop |
| Field vertices look wrong | `lib/atlas/field.ts`; `tests/knowledge/cinematic-field.test.mjs` describes the intended ring, height and scale factors and fails loudly |
| Mono labels reflow after load | `app/layout.tsx` `geistMono.preload` — reverting it restores the old font behaviour *and* the 0.29 CLS |

## What must not be reverted even if the acts change

* the publication gate (`projectAtlas(data, false)`, `data-pending="true"`,
  "semantic relations · awaiting human publication review");
* the real-record-only field (no placeholder vertices, no invented edges);
* the accessible equivalents: canvas `aria-label`, focusable group, keyboard
  orbit, `#atlas-node-list`, `.atlas-inspector` live region;
* `prefers-reduced-motion` staying an alternative branch rather than a removal
  of content;
* the string markers asserted by `scripts/qa-canonical-home.mjs`.
