# Component reuse map — M0, 2026-11-03

Scope: milestone M0 of `docs/knowledge-stage-next-phase-v3-20261101/NEXT_PHASE_PLAN_EN.md`
§5, output "component reuse map". This is a decision record, not an implementation.
Nothing under `app/` changed during M0.

Baseline: `intelligent-atlas/baselines/2026-11-03-pre-m0/` at HEAD
`88158d689f39fe17cc8fea4acfbd675dcc732349` (32 preserved files, 3.8 MB).

## 1. What the review surface actually is

The Knowledge Stage review build is deliberately not a React surface:

| File | Bytes | Role |
|---|---:|---|
| `prototype/index.html` | 18,187 | single document, no framework runtime |
| `prototype/styles.css` | 101,100 | all presentation, including stage/floor layers |
| `prototype/app.js` | 121,280 | state, rendering, keyboard/touch, URL state |
| `prototype/timeline-model.js` | 4,500 | pure ordering/selection maths |
| `prototype/neighborhood-model.js` | 8,582 | pure neighborhood expansion |
| `prototype/data.js` | 2,753,179 | review payload, **not public** |
| `prototype/data-provenance.json` | 1,602 | source and projection provenance |

`prototype/public-data.js` is listed in the capture tool's owned set but does not
exist on disk at this HEAD; the baseline records only files that exist.

The integration target is `next@16.4.3`, `react@19.3.0`, `motion@14.6`,
`katex@0.16.47`, `lucide-react`, `zod`, Tailwind. 210 TypeScript component files
already exist under `components/` in 18 folders.

## 2. Reuse decisions

| Prototype unit | Decision | Target / mechanism | Reason |
|---|---|---|---|
| `timeline-model.js` | **Retain as pure module** | import unchanged under a typed wrapper; tests in `tests/atlas/` | already deterministic and Node-testable; rewriting it would invalidate the recovered QA |
| `neighborhood-model.js` | **Retain as pure module** | same | pure graph expansion, no DOM |
| `app.js` state machine | **Port, do not copy** | React state + URL search params, one reducer | the file mixes state, rendering and DOM events; a literal port would carry implicit globals |
| `styles.css` | **Split** | tokens and layout into Tailwind/CSS modules; stage visuals into a scoped sheet | 101 KB global sheet cannot be layered under the app's `globals.css` without collisions |
| `index.html` | **Replace** | `app/` route + server components | document-level markup |
| `data.js` | **Do not ship** | stays inside `intelligent-atlas/` | 2.75 MB candidate payload with unreviewed content |
| `data-provenance.json` | **Retain** | ships beside the projection builder | records which sources fed each payload |

## 3. Existing app components audited for reuse

Read, not modified. Verdicts are for the M3/M4 build, not M0.

| Component | Existing job | Verdict |
|---|---|---|
| `components/atlas/peek.tsx` | contextual peek over a node | **Reuse**; same interaction contract as the stage's focus panel |
| `components/atlas/explorer.tsx` | full graph exploration | **Reuse with adapter**; takes semantic edges, not stage order |
| `components/atlas/journey.tsx` | guided path | **Reuse**; maps to the intent journey mode |
| `components/atlas/circle-map.css` | circular node layout | **Evaluate**; the review build uses a linear timeline, so this is an alternative, not a base |
| `components/knowledge/insight-stage.tsx` | staged editorial reading | **Reuse** for chrome only; content model differs |
| `components/knowledge/atlas-peek-stage.tsx` | peek inside a stage | **Reuse** |
| `components/knowledge/knowledge-dealer.tsx` | daily card dealing | **Reuse**; matches the review build's dealer concept |
| `components/knowledge/insight-rail.tsx` | side rail | **Reuse** |
| `components/knowledge/insight-archive.tsx` | archive grid | **Reuse** |
| `components/learn/*` | curriculum home, subject home, stage bar | **Do not mix**; `/learn` is a separate product surface |
| `components/cinematic/use-calm-motion.ts` | reduced-motion gate | **Reuse** for every stage transition |
| `components/cinematic/use-scroll-progress.ts` | scroll driver | **Reuse only if** the stage scrolls; the review build is card-local |
| `components/cinematic/reveal.tsx` | reveal wrapper | **Reuse** |
| `components/search/search-client.tsx` | search UI over the index | **Reuse** in M2/M5 |

## 4. Library policy for the next phase

- No new dependency was added in M0, and none is required to start M1.
- Formulas: KaTeX is already installed; do not add MathJax.
- Motion: `motion` + `use-calm-motion`; no GSAP, Lottie or scroll-hijack library.
- Charts: none needed for M0. Any M3/M4 chart must follow
  `HANSA_ADAPTIVE_VISUALIZATION_AGENT_POLICY.md` with at least two options
  including a no-chart fallback, and must pass the weighted rubric.
- Graph rendering: reuse `explorer.tsx`/`peek.tsx` before considering a graph
  engine. No engine install is authorized by this record.

## 5. Explicit non-goals

- No React rewrite of the review prototype in M0.
- No move of `intelligent-atlas/` into `app/`.
- No change to `/learn`, `/study`, `/lab`, `/practice` routes or their IDs.
- No third-party student-data transfer; the projection stays local until M2.

## 6. Evidence used

- `intelligent-atlas/baselines/2026-11-03-pre-m0/baseline.json` (sizes, hashes, HEAD)
- `intelligent-atlas/analysis/source-reconciliation-v3.json` (corpus denominators)
- `package.json`, `components/**` read at HEAD `88158d6`
- `docs/knowledge-stage-next-phase-v3-20261101/NEXT_PHASE_PLAN_EN.md` §5–§10
- `docs/agent-reference/HANSA_ADAPTIVE_VISUALIZATION_AGENT_POLICY.md`

## 7. Status

| Check | Result |
|---|---|
| Prototype bytes preserved | PASS — 32 files, SHA-256 recorded |
| Reuse map covers every prototype file | PASS — 7/7 || Existing components inspected | PASS — 14 named above |
| New dependency added | PASS — none |
| Component-level visual QA | NOT RUN — no UI was built in M0 |
