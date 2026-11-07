# Learn Graph — audit, gaps, and acceptance (2026-11-08)

Branch `feat/learn-graph-map` (based on `release/v1` @ `release-candidate-1`, commit `3d32a51`).
The RC and the owner worktree were not modified; no deployment or hosting changes.

## 1. Feature audit (BEFORE implementation)

Audited against the actual code (`tree-explorer.tsx`, `tree-model.ts`, `tree-layout.ts`,
`tree-labels.ts`, datasets) and live browser behavior — not filenames.

| Requirement | Status | Evidence |
|---|---|---|
| Root-only initial state | IMPLEMENTED | `emptyState` open=∅; `visibleNodes` BFS from `tree.roots`; live: "8 SHOWN", 8 `[data-node]` |
| One-level expansion | IMPLEMENTED | children of open nodes only; live 8→17→23 |
| Collapse | IMPLEMENTED | `toggleNode` removes subtree from open; live 23→21 |
| Sibling accordion (default) | IMPLEMENTED | `toggleNode` closes open siblings unless `keepBranches`; live: opening `journey:sampling` closed `journey:experiments` (URL `open=…,journey:sampling` only) |
| Keep branches open | IMPLEMENTED | checkbox + `keep=1` in URL; live: both journeys open, 27 nodes |
| Child pagination ≤12 + "+N more" | IMPLEMENTED | `PAGE_SIZE = 12`; live: 50-child pack → 12 + "+38 more"; next page +12 |
| Radial layout + light d3-force | IMPLEMENTED | wedge layout + seeded 170-tick force pass (collide 0.9, link 0.055, radial 0.24), ring-clamped ±30 |
| Deterministic positioning | IMPLEMENTED | pure function of the visible set; `.stop()` + fixed ticks; unit test "the force pass is deterministic" |
| Camera movement | SATISFIED BY DESIGN | fixed 1200×920 world always fits the visible tree; pan (drag) + zoom (0.62–2.2×, 180 ms ease) provided; no dynamic camera required — report, not a defect |
| Labels: priority, truncation, collision | IMPLEMENTED | `placeLabels` priority 0–3 (focus → children → ancestors → roots demoted), 24-char truncation, greedy skip on box/node/edge collision, zoom threshold hides roots, counter-scale on narrow maps; live: 14 of 17 candidates placed, no overlaps seen in any tested state |
| Leaf side cards + explicit Open | IMPLEMENTED | card with kind/title/breadcrumb/facts/Open; nothing navigates on selection |
| Search-to-focus | IMPLEMENTED | `revealNode` opens ancestors + pages the target into view + focus; live: "Security across Fabric…" revealed inside Fabric and selected |
| Keyboard | IMPLEMENTED | →/←/↑/↓/Enter/Esc, roving tabindex, List alternative; live: ArrowRight expanded Fabric 17→30 |
| URL state | IMPLEMENTED | `?lens&focus&open&keep&all`; live reload restored 26 nodes + open card |
| Reduced motion | IMPLEMENTED | `useReducedMotion` → duration-0 springs, transitions off |
| Learn → Graph navigation | **MISSING → implemented** | zero links in the exported HTML |
| Honest release label | **MISSING → implemented** | page labelled "Prototype B — not in the release" |
| Overview isolation | IMPLEMENTED | explicit "Show everything" toggle, labels off, force skipped |
| Edge honesty | IMPLEMENTED | structural edges only; dashed cross-refs only for the selected node, only when targets are visible, ≤24 |

## 2. Hierarchy integrity (all four lenses)

- **Subject**: 1,167 nodes, 8 declared roots (analysis 1, excel 1, fabric 927, power-bi 4,
  python 1, sql 18, statistics 43, visualization 52 below), depth 3, max branching 50
  (`pack:video06`).
- **DP-600**: 1,011 nodes, 1 root (`programme:dp-600`, 919 below), depth 3.
- **Fabric RTI**: 10 nodes, 1 root, depth 2.
- **Corpus Academy**: 143 nodes, 1 root, depth 3, max branching 46.
- **Orphan parents: 0 · cycles: 0 · undeclared parentless nodes: 0** in every lens.
- **Missing internal destinations (pre-existing data, reported not patched):** 18 visualization
  units point at `/explore/charts/<lesson-slug>/` routes that do not exist in the export (the
  actual chart pages use chart-type slugs), and 8 RTI units point at `/lab/rti/*` pages that were
  never built. Affected nodes render and open their cards; only their Open action 404s.

## 3. Changes made (commits on this branch)

1. `43a0d8c` — Learn hub hero gains one ghost action **"Knowledge map"** → `/prototype/network/`;
   page eyebrow/metadata/footer updated to honest release wording ("Knowledge map · declared
   containment only"); robots stays `noindex`, sitemap exclusion unchanged. No interaction,
   layout, label, or data changes.
2. `2005381` — receipt: `components/learn/curriculum-home.tsx` is pinned by an M0 addition
   record; the transition is recorded in the FC manifest (`84c11b7a… → fbdccafb…`).

## 4. Acceptance (AFTER implementation)

Full suite **633 tests / 0 failures** (data-viz 62, statistics 18, fabric 35, content 68,
knowledge 139, atlas 74, fabric-corpus 237) — identical to the RC baseline. Production build
exit 0. Browser (live export at :4173): initial 8 labelled roots; 1-level and 2-level expansion;
accordion; keep-open; paging (+38 more → +12); search-to-focus; URL reload restore; keyboard
expand; mobile 390 px → List view; Learn → Graph → Learn verified in both directions
(`/learn/` button → map; map leaf Open → `/learn/excel/` and, live-owner-verified,
`/lab/dp-600/resources/?pack=video06#note-…`).

## 5. Rollback

`git switch release/v1` (+ rebuild) restores the tagged RC exactly; the branch adds exactly two
commits on top of `3d32a51`.
