# Knowledge graph prototype — report

Status: **prototype only, awaiting owner visual/UX acceptance**. Not merged, not
deployed, and not part of the release-candidate build. Nothing was added to
navigation, the sitemap or the search index.

Sandbox: `D:\BeUI\amir-portfolio-graph-prototype` (byte copy of the repository,
excluding `node_modules`, `.next`, `out`, `out-rc`, `.git`, `docs`). Production
`amir-portfolio/out/index.html` was re-hashed after the work and still matches the
promoted release build:

```
73600BEF89EBAA14A4976DF61EA45049CC33578D6974BA1E31159A244106DFDD
```

## What it is

An Obsidian-style local graph over the statistics curriculum, rendered as plain
SVG:

- nine **sequence** nodes at rest; expanding one reveals its **notes**;
- two labelled edge kinds only: sequence **membership** and reviewed curriculum
  **dependencies**;
- clicking a note opens an inspector with objectives, the common misconception,
  recorded dependencies, and a real link to `/learn/statistics/journey/<slug>/#sN`;
- pan, wheel/pinch zoom, node drag, search, focus, back, fit, reset;
- an equivalent accessible **list view** of the same corpus;
- mobile layout with sequence chips; reduced-motion honoured.

Screenshots: `docs/prototype-graph/screens/` (desktop initial, expanded, note
selected, focus mode, list view, mobile expanded).

## Data provenance

The dataset is derived at build time, never typed by hand
(`lib/prototype/graph-data.ts`):

| Source | What is taken |
| --- | --- |
| `lib/statistics/content.ts` — `JOURNEYS[].sections` | sequence membership and declared order |
| `lib/statistics/content.ts` — `SECTIONS` | note title, objectives, misconception, coverage, source note |
| `lib/curriculum/model.ts` — `curriculum()` | reviewed prerequisites (`prerequisites`), positions |
| `content/statistics/source.json` | the original Notion sections behind each note |

Build-time assertions (the build fails instead of drawing a plausible edge):
a journey names an unknown section; a section is declared under a different
journey; a note appears in two sequences; the curriculum has no unit for a
section; a prerequisite points outside this corpus.

Measured corpus: **9 sequences, 43 notes, 43 membership links, 61 recorded
dependencies** (27 of them cross-sequence).

## Edge contracts, and what is deliberately absent

| Edge | Meaning | Status |
| --- | --- | --- |
| `member` (sequence → note) | the note is listed in that sequence's own order | navigational, not a knowledge claim |
| `dependency` (note → note) | the reviewed curriculum prerequisite used to order teaching | editorial teaching order, **not** source-declared, **not** an Atlas assertion |

The prototype reads **`getAtlasPublic()` only** (the published projection), and
never `getAtlasReview()`. That projection currently contains **0 concepts and 0
connections** (42 concepts / 49 edges sit in `technical_review` and stay
unpublished). The page prints those counts, and the canvas draws no Atlas node or
edge. No relation, prerequisite or sequence order was invented, and Atlas
publication isolation and source rights are untouched.

## Existing renderer audit and library decision

- Dependencies are `motion` and `lucide-react`; **no d3, no react-force-graph, no
  graph engine** is installed.
- The existing Atlas surface (`components/atlas/explorer.tsx` with
  `lib/atlas/circle-layout.ts` and `neighborhood()`) is an SVG circle map of
  **published concepts**, one or two hops, publication-gated. Its public dataset is
  empty, and its model is concept/relation, not sequence membership over notes, so
  it cannot be reused as the note graph without inventing concepts or widening the
  publication gate. It was not modified.
- `react-force-graph-2d` was evaluated and **not adopted**: it is not installed; it
  bundles `force-graph`/`d3-force` plus a canvas renderer (order of 100 KB+ before
  data, unmeasured here because it was not installed); a force simulation
  re-solves every node whenever a sequence expands, which is precisely the layout
  disruption the brief forbids; and canvas pixels carry no DOM nodes, so keyboard
  navigation and the accessible list would still have to be built separately.
- Chosen instead: hand-rolled SVG with a deterministic layout. Prototype cost:
  one client chunk **19,439 B raw / 6,434 B gzip**, page HTML **95,877 B raw /
  21,114 B gzip** (the HTML carries the serialized dataset for static export). No
  new dependency, no network, no CDN.

## Architecture

- `lib/prototype/graph-data.ts` — validated dataset (above), server-side.
- `lib/prototype/graph-layout.ts` — deterministic layout: fixed sequence anchors on
  an ellipse, notes on an arc facing the canvas centre, `fitView()`. No simulation,
  so expanding one sequence cannot move another node (asserted in QA).
- `components/prototype/knowledge-graph.tsx` — client island: view transform,
  expansion, selection, search, focus, history stack, pointer/pinch handling,
  keyboard navigation, list view.
- `components/prototype/knowledge-graph.css` — plain global sheet with `kg-`
  prefixes. CSS modules are not used here: this repository routes every `*.css`
  through the Tailwind Turbopack loader, so module exports come back empty (found
  during the build and worked around without touching the shared config).
- `app/prototype/graph/page.tsx` — static route, `robots: noindex`, provenance,
  edge legend, Atlas counts and limitations.

Everything is static-export compatible (`output: "export"`); the page is
prerendered and the dataset is embedded at build time.

## Interaction and keyboard

| Input | Behaviour |
| --- | --- |
| click sequence dot / chip | expand or collapse; notes appear around the anchor, nothing else moves |
| click note dot | select; inspector shows title, objectives, misconception, dependencies, real link |
| drag node | reposition that node only |
| drag canvas | pan |
| wheel / pinch | zoom about the pointer (0.34–2.6×) |
| `+` / `−` buttons | zoom about the canvas centre |
| Back | restores the previous expansion/selection/focus snapshot (≤40) |
| Fit | fits the currently visible nodes |
| List view | equivalent corpus as ordered links and named dependencies |
| Reset | collapses everything, clears moves/history and refits |
| Tab / Shift+Tab | move through dots, chips and controls |
| Enter / Space | toggle a sequence or select a note |
| Arrow keys | move focus to the nearest node in that direction |
| Escape (in search) | clear the query |
| double-click note | focus mode (note + direct links only) |

Sequence order is never implied by geometry: the inspector prints the declared
order with numbers, and the list view keeps the same `<ol>`.

## Accessibility evidence

- axe-core (WCAG 2.0/2.1 A+AA tags) reports **no violations** in graph view and in
  list view (`docs/prototype-graph/QA.md`).
- Every node is a focusable `role="button"` with an accessible name that includes
  its full title and state; visible labels show the full title (two lines), so the
  label-in-name check passes.
- Live region announces selection, expansion, focus, back and reset.
- Focus rings, 36px+ control targets, `prefers-reduced-motion` disables node/link
  animation and transitions, touch pinch zoom, 390px layout with no horizontal
  overflow.
- **NOT RUN:** NVDA and VoiceOver. A Chromium accessibility tree is not a
  screen-reader pass, so the accessibility gate is not met by this prototype.

## Verification

`node scripts/proto-graph-qa.mjs` (Playwright + Edge + axe) — **40/40 checks
passed**, including:

- 9 sequences / 0 notes at rest; expansion reveals exactly the declared membership;
- **no sequence anchor moves when another sequence expands**;
- the note link resolves on the static host (`/learn/statistics/journey/foundations/#s1`);
- back restores state; reset restores positions; drag, pan, wheel and Fit change
  the transform as expected;
- Enter/arrow-key navigation; search selects and expands;
- 9 list groups / 43 list links / named dependencies;
- Atlas counts shown as 0/0 and the canvas draws none;
- mobile 390px, reduced motion, clean console and no runtime errors.

Build and static checks in the sandbox: `next build` clean, `tsc --noEmit` clean,
`eslint` clean for the prototype paths.

## Limitations

- **One corpus**: statistics only. Other subjects use different registries
  (visualization lessons, SQL modules, Fabric notes) and would need their own
  source-backed adapters.
- **No persistence and no deep links**: view, expansion, selection and drag
  positions reset on reload; the URL does not encode graph state.
- **Progressive paging is latent**: the code pages at 20 notes per sequence, but no
  journey has more than eight, so the large-sequence path is unexercised.
- **Label density**: at the fitted zoom note labels appear only on hover,
  selection, search or zoom ≥1.15. On screens under 560px sequence labels appear
  only for the selected/hovered/expanded sequence; names remain in the chips and
  the list.
- **No AT pass** and no high-contrast/forced-colors review beyond axe's checks.
- **Not localized**: English only, no RTL variant (the statistics registry is
  English-first; `titleAr` exists but is not shown).
- **Scope of the corpus review**: the prototype consumes existing reviewed
  metadata; it does not re-verify the 43 notes against their source sections.

## Run it

```powershell
cd D:\BeUI\amir-portfolio-graph-prototype
npm run build
node scripts/serve-rc.mjs 4400 out     # http://127.0.0.1:4400/prototype/graph/
node scripts/proto-graph-qa.mjs        # 40 checks + screenshots + docs/prototype-graph/QA.md
```

`docs/` is excluded from the sandbox copy, so these paths are the only copies of
this report, `QA.md`, `qa-results.json` and the screenshots.

## Isolation and rollback

- Production baseline untouched (hash above), no deploy, no commit, no push.
- The prototype route is unlinked and `noindex`; it exists only in the sandbox.
- Rollback: delete `D:\BeUI\amir-portfolio-graph-prototype`. Nothing in the
  release candidate depends on it.

## Next atomic task (needs owner decision)

Owner reviews the six screenshots and the live page. If accepted, the integration
proposal is: move `lib/prototype/*` and `components/prototype/*` into the
repository, choose the real route (Home section, `/learn/statistics/graph/`, or a
replacement for the current Home instrument), add adapters for the other curricula,
persist state in the URL, then run a real NVDA/VoiceOver pass before any release
gate is claimed.
