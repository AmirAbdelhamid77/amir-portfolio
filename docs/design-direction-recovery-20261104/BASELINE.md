# R0 - Baseline and harness (no UI change)

Recorded 2026-11-04/05. This file freezes the starting point before R1. No product
surface changed in R0: the only additions are this documentation folder, the capture
and baseline scripts, and their evidence.

## What is frozen

The design reference is `intelligent-atlas/prototype/`. It is not built, imported or
served by the product; it is the visual and interaction reference for the restoration.
Its SHA-256 hashes are recorded in `baseline.json` under `reference.prototype`:

| File | SHA-256 |
| --- | --- |
| `index.html` | `e773f9a44e5a517f1f0c9df549582bee4142cdae2e68c3132ae1c81533af48b9` |
| `app.js` | `4c62d9bf8c00c40674f6e53088e28bff98ed9340811e1204168caad3bbedd04b` |
| `styles.css` | `3f7c7a919bab218b7f3d81a1ebaad639c3b2fface98f1412a7ec8657f13428bf` |
| `neighborhood-model.js` | `526697d98b48583f88a19470fd2911e4c981f76e817f5d1a6097ba69a99e9fe4` |
| `timeline-model.js` | `4fa4bd6abfb3c079b65bb3fcc58cae465a19b99b2bf76c7a8ca2f4ba9230b823` |
| `data.js` | `b5d92307dde3232fa3c00055b76bac8a688d734ae806e96f718c2225750ebfb0` |
| `data-provenance.json` | `9d1bf3f533ccf3e10eb92877475e8c66ac1c0c3ad9a9ddfc0a97d073746fa6ed` |

The shipped starting point is recorded under `reference.app` (nine files: the three M6
scene components, `insight-stage.tsx`, `hansa-landing.tsx`, `stage-editorial.css`,
`stage-model.ts`, `lib/atlas/model.ts`, `components/atlas/explorer.tsx`). Re-run
`baseline.mjs` to verify that nothing drifted before an R-slice starts.

## Evidence set

`evidence/` holds 19 screenshots captured by `capture.mjs` from both surfaces at
1280x900 and 390x844, light and dark, reduced motion, plus the R0 test log:

- `proto-*`: the frozen prototype (timeline, entrances, neighbourhood, expanded
  neighbourhood, preview, dealer, compare, closing, mobile light).
- `shipped-*`: the M6 Home and Atlas as they are today.
- `preview-*`: the review-preview Atlas explorer with candidate data.
- `test-all-r0.txt`: the full gate run.

`compare.html` pairs the images side by side for the owner.

## Performance baseline (shipped Home)

Method: local static build served by `node scripts/serve-out.mjs 4380`, Edge headless,
1280x900, dark, `prefers-reduced-motion: reduce`, one run, 1.5 s settle. These are
comparison numbers, not field data.

| Metric | Value |
| --- | --- |
| DOM nodes | 779 |
| DCL | 86 ms |
| load | 526 ms |
| LCP | 660 ms |
| CLS | 0 |
| Long tasks | 2 (325 ms total, 254 ms max) |
| Resources | 42 |
| Encoded transfer | 1,193,413 B |
| Script bytes | 804,059 B |
| Style bytes | 242,150 B |

The R1 budget is: no new dependency, keep the route's own JS under ~30 kB gzip, no
layout shift from the field before fonts settle, and no more than one additional long
task attributable to the review route. R6 re-measures against this table.

## Gates at R0

`npm run test:all` passed on the untouched tree:

| Suite | Tests |
| --- | --- |
| `test` (data-viz) | 62 |
| `test:statistics` | 18 |
| `test:fabric` | 35 |
| `test:content` | 68 |
| `test:knowledge` | 49 |
| `test:atlas` | 25 |
| **Total** | **257 passing, 0 failing** |

Full TAP output: `evidence/test-all-r0.txt`. Recorded hashes: `baseline.json`.

## Facts the restoration must respect

Real Atlas projection (candidate data, review-preview only):

- 42 concepts, 49 semantic edges, all `technical_review`, 0 published.
- Relation counts: `enables` 13, `contrasts_with` 10, `related_in_decision` 9,
  `complements` 8, `part_of_mechanism` 6, `requires_understanding_of` 3.
- Kinds: `technology_mechanism` 36, `method` 3, `decision_principle` 2,
  `fundamental_concept` 1.
- Highest degree: Direct Lake 8, Database Mirroring 6, Row-level security 5; four
  concepts at 4.
- One subject (Microsoft Fabric / DP-600). The prototype's five domains are not all
  present in the semantic Atlas; R1 must not invent concepts for the other four.
- `getAtlas()` returns an empty projection unless `HANSA_ATLAS_REVIEW_PREVIEW=1`.
- `buildGraph` in `stage-model.ts` only marks the graph ready on published edges.

## Reproduce

```powershell
npm run build
node scripts/serve-out.mjs 4380          # terminal 1
$env:NODE_PATH="$PWD\node_modules"
node docs/design-direction-recovery-20261104/baseline.mjs
```

`baseline.mjs` is read-only except for rewriting `baseline.json`. The R0 test log is
produced with `npm run test:all 2>&1 | Tee-Object evidence/test-all-r0.txt`.
