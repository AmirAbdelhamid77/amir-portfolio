# Knowledge graph prototype (isolated)

Obsidian-style 2D graph over the statistics curriculum. **Prototype only** — not
linked from the site, not part of the release build, not deployed.

- Report and evidence: [`REPORT.md`](REPORT.md), [`QA.md`](QA.md), [`qa-results.json`](qa-results.json)
- Screenshots: [`screens/`](screens/)

## View it

```powershell
cd D:\BeUI\amir-portfolio-graph-prototype
npm run build
node scripts/serve-rc.mjs 4400 out
```

Open <http://127.0.0.1:4400/prototype/graph/>.

Try: click **Foundations** → click a revealed note → **Open the note** → **Back**
→ search "p-value" → **List view** → **Reset**. Drag a node, drag the canvas,
scroll to zoom, press Tab then Enter and the arrow keys.

## Re-run QA

```powershell
node scripts/proto-graph-qa.mjs
```

Writes `docs/prototype-graph/QA.md`, `qa-results.json` and the six screenshots.
Needs Edge at its default Windows path and `node_modules` with `playwright-core`
and `axe-core` (the sandbox uses a full copy because Turbopack refuses a
junction outside its root).

## Files

| Path | Role |
| --- | --- |
| `lib/prototype/graph-data.ts` | build-time dataset from `JOURNEYS`/`SECTIONS`/`curriculum()`, with validation |
| `lib/prototype/graph-layout.ts` | deterministic anchors and `fitView()` |
| `components/prototype/knowledge-graph.tsx` | client graph island |
| `components/prototype/knowledge-graph.css` | global `kg-` stylesheet (CSS modules do not work with this repo's Turbopack CSS rule) |
| `app/prototype/graph/page.tsx` | static route, `noindex`, provenance and limits |
| `scripts/proto-graph-qa.mjs` | Playwright + axe checks and screenshots |

## Boundaries

- Reads `getAtlasPublic()` and prints its counts (currently 0 concepts / 0 links);
  never draws or invents an Atlas relation.
- Only `member` (sequence → note) and `dependency` (reviewed prerequisite) edges.
- Production `amir-portfolio/out/` is untouched: `out/index.html` still hashes to
  `73600BEF89EBAA14A4976DF61EA45049CC33578D6974BA1E31159A244106DFDD`.
- Rollback: delete this folder.
