# The three-act landing — Phase 2 spatial narrative

The canonical home (`/`) is one continuous cinematic narrative in three acts:

| Act | Section | What the reader sees | Source |
| --- | --- | --- | --- |
| I | `.cine-hero` | The daily insight as a **card dealer**: the principle card already on the table, its caveat and evidence still in the deck. | `components/knowledge/insight-stage.tsx`, `components/knowledge/knowledge-dealer.tsx` |
| — | `.cine-handoff` | The dealt card **becomes the field seed**: it grows, squares up, dissolves into the same centre the Atlas camera is already orbiting. | `components/knowledge/insight-stage.tsx` |
| II | `.cine-atlas` | **Spacetime Knowledge Atlas**: a real perspective camera travels through the published vertices of the knowledge graph. | `components/cinematic/spacetime-atlas.tsx`, `lib/atlas/field.ts` |
| III | `.cine-content` | The idea unfolds into the existing scenario, instrument, date rail and archive, each entering with its own choreography. | `insight-scene`, `knowledge-instrument`, `insight-rail`, `insight-archive` |

There is **no prototype route and no alternate page**. `/` renders this stage; the
`/prototype-c/` compatibility alias still serves the same page.

## Read in this order

1. [ARCHITECTURE.md](./ARCHITECTURE.md) — component tree, the scroll bus, the
   camera, the canvas renderer, accessibility and fallbacks.
2. [CONTENT.md](./CONTENT.md) — how the next edition, card, lesson or source
   joins the motion system, and what must never be invented.
3. [MEASUREMENTS.md](./MEASUREMENTS.md) — build, tests, browser QA, lab
   performance, and the limits of each measurement.
4. [ROLLBACK.md](./ROLLBACK.md) — the exact files and rules to revert.

## Reproduce the evidence

```powershell
npm run build                                   # static export to out/
node scripts/qa-canonical-home.mjs              # 45/45 canonical landing checks
node scripts/phase2-spatial-qa.mjs              # 43/43 spatial-layer checks
node scripts/phase2-capture-spatial.mjs         # screenshots + runtime probes
node scripts/phase2-spatial-perf.mjs            # lab LCP/CLS/pacing
node scripts/qa-production-smoke.mjs            # live deployment checks
npm run test:knowledge                          # 33/33 node tests
npx tsc --noEmit
npx eslint components/cinematic components/knowledge/insight-stage.tsx
```

Screenshots, `qa.json`, `capture.json`, `performance.json` and the axe reports
live in [`evidence/`](./evidence/). Nothing in this folder is a deploy artefact.

## Deployment

The owner asked for this build to be published. It is live at
**https://hansa.amir-portfolio.workers.dev** (Worker `hansa`, version
`684da0e9-d5a5-4478-b6d5-7e361d257135`, uploaded 2026-10-29). Static assets only
— no Worker script, no new service, no paid plan. `wrangler.jsonc` serves
`./out` with `auto-trailing-slash` and the exported `404.html`.

`scripts/qa-production-smoke.mjs` re-checks the live origin rather than `out/`:
status, compression, hero text, painted canvas, the pending review label, wheel
scrolling over the field, list selection writing the URL, the archive, mobile
reflow, `/prototype-c/`, the 404 document and console errors. See
[MEASUREMENTS.md](./MEASUREMENTS.md) §6 for the recorded result.

`docs/cinematic-phase2/` holds an earlier Phase 2 record written before this
spatial pass (release candidate, art direction, component contracts). It is kept
as history; where the two disagree, this folder and the running code win.

## Honest state of the semantic layer

The Atlas renders **only public records**: three editions, the concept each
edition states, one shared lesson, one practice and one source — seven vertices
and twelve links, all derived from `content/atlas/*.json`. The semantic relation
layer is still unpublished, so the field says so in place
(`data-pending="true"`, "semantic relations · awaiting human publication
review") instead of drawing invented edges. This is BLOCKED by publication
governance, not by the implementation.
