# Network tree — QA evidence

Route: `/prototype/network/`
Run: 2026-11-07 19:35 UTC · build `443` static pages · graph `knowledge-graph-2026-11-06.2`
Machine report: `docs/prototype-graph/qa-browser.json` · Screenshots: `docs/prototype-graph/screens/tree/`

## Result

| Gate | Result | Evidence |
|---|---|---|
| Browser QA | **PASS** | 104/104 checks, 0 console errors, 0 failed requests |
| Unit tests (tree) | **PASS** | 16/16 in `tests/knowledge/tree-map.test.mjs` |
| Unit tests (all knowledge) | **PASS with known failures** | 133/137; the 4 failures are pre-existing missing files in `daily-bank.test.mjs` |
| TypeScript | **PASS** | `npx tsc --noEmit` |
| Production build | **PASS** | `npm run build`, 443 static pages |
| Lint (changed files) | **PASS** | `npx eslint` on the tree, generator, QA and test files |
| Accessibility (automated) | **PASS** | axe WCAG 2 A/AA: 0 violations at 1440×1000 light, 1440×1000 dark and 390×844 |
| Keyboard focus | **PASS** | One map tab stop at 8, 12 and 1,167 nodes; Tab moves to the zoom control; leaf Enter focuses the card title; Escape returns focus on both map and list |
| Reduced motion | **PASS** | Pan transition 0 s, node animation `none` |
| Tablet legibility | **PASS** | 768×1024: 8/8 labels, 12.18 px on screen, no overlaps, no overflow |
| Laptop with side card | **PASS** | 1024×900: 12 nodes, focus + all 4 leaves labelled, 10.92 px minimum |
| Dark theme | **PASS** | 8/8 labels at 17.75 px, no overlaps, axe 0, screenshot captured |
| Manual screen-reader walkthrough | **NOT RUN** | Beyond automated axe; the List tab is the labelled linear equivalent |
| Real touch device | **NOT RUN** | Playwright touch emulation only |
| Repo-wide lint | **FAIL (pre-existing)** | Unrelated existing errors outside the changed files; not introduced here |

## Commands

```bash
npm run graph:build
node --experimental-strip-types --test tests/knowledge/tree-map.test.mjs
npm run test:knowledge
npx tsc --noEmit
npm run build
npm run qa:network
```

`npm run qa:network` serves `out/` on a random localhost port, drives the installed Microsoft Edge through `playwright-core`, and rewrites `qa-browser.json` and the fifteen screenshots. It uses no network and mutates nothing.

## What the 104 browser checks cover

- **Default subject view** — exactly 8 roots, 8 visible nodes, all 8 titles labelled and non-overlapping, `8 SHOWN`, no focus in the URL, By subject selected, no side card, no cross-reference paths, no `dataset.json` request.
- **Expansion** — opening Power BI adds its 4 leaves (12 nodes), focuses the branch, reports `aria-expanded`, keeps 12 labels overlap-free.
- **Leaf behaviour** — selecting a leaf opens the side card, does not navigate, offers one external Open link to the real source URL, opens in a new tab, announces selection on the node.
- **Programme lens** — three named chips; DP-600 at one root; RTI at 10 nodes with declared lesson names on the card; Academy at 3 nodes, paging 12 modules plus a "+N more" control.
- **Sources and cross-references** — source search selects the URL group (35 in card), the bucket is a declared containment branch, a selected note draws exactly its 3 declared dashed references, and the card names its source.
- **Deep search** — a depth-3 note opens 66 visible nodes with its ancestors, pages into view, writes `focus` and `open` to the URL; reload restores 65 shown, the same URL and the same layout (max drift 0.20 px).
- **Keyboard** — one roving tab stop at 8, 12 and 1,167 nodes; Tab leaves the map for the zoom control; node focus, Right expands then enters the first child, Left returns to the parent, Up/Down move between siblings, Enter collapses a branch; Enter on a leaf focuses the card title; Escape closes the card and returns focus to the leaf; the close button returns focus to the leaf too.
- **List** — same 8 roots, 12 children plus a more row, reports the open branch, no cap notice below 150, paging adds 12 more; keyboard Enter on a leaf focuses the card title and Escape returns to the row.
- **Overview** — explicit `all=1`, 1,167 nodes, 0 labels, labels-off notice, a way back, and 8 labels restored on return.
- **Zoom without focus** — all 8 roots stay labelled and non-overlapping.
- **Mobile** — List is the default at 390 px, 8 rows, no horizontal overflow, the Map is one tap away, the map draws 8 roots as a labels-off overview with a note pointing to the card and List.
- **Tablet** — 768 px keeps the Map as the default, all 8 roots stay labelled at 12.18 px with no overlap or overflow.
- **Laptop with card** — 1024 px opening Power BI keeps the 12-node view readable; the focus and all four leaves stay labelled at 10.92 px or more.
- **Dark theme** — `html.dark` resolves to a dark page; 8 root labels at 17.75 px, no overlaps, axe 0.
- **Motion** — reduced motion removes the pan transition and node animations.

## Keyboard and focus

The map is a composite widget: exactly one visible node is in the tab order (the last focused node, or the first root). Arrow keys move within the tree and update that stop; Tab leaves the map for the zoom controls. The List tab keeps a conventional linear tab order.

Keyboard activation separates expanding from inspecting. Enter/Space on a branch expands or collapses it and keeps focus on the branch, so Right can enter the first child. Enter/Space on a leaf — and on any node in “Show everything”, where nothing expands — opens the card and moves focus to its heading. Escape inside the card closes it and returns focus to the originating node or list row; Escape on a node closes the card without moving focus, and the card's close button returns focus the same way. The card is named by its heading (`aria-labelledby`); the previous broad `aria-live` wrapper was removed so the heading is not read twice.

Measured tab stops:

| State | Visible nodes | Nodes in the tab order |
|---|---:|---:|
| Default subject view | 8 | 1 |
| Power BI expanded | 12 | 1 |
| Show everything | 1,167 | 1 |
| List, Fabric paged | 29 rows | 29 row buttons, plus an Open link only where a page exists |

## Label scaling

Labels are drawn in the 1200-unit canvas, so a fit-to-width map would shrink 14 px text to 7–9 px on a tablet or with the side card open. A `ResizeObserver` measures the map frame and counter-scales the label layer up to 1.5×; the collision pass receives the same factor, so bigger labels are skipped rather than overlapped. At 1440 px the scale is 1 (no change). Measured results:

| State | Map width | Scale | Smallest label on screen | Labels |
|---|---:|---:|---:|---:|
| 1440×1000 | 1392 | 1.000 | 17.75 px | 8 |
| 1024×900 | 976 | 1.000 | 12.37 px | 8 |
| 820×900 | 772 | 1.250 | 12.17 px | 8 |
| 768×1024 | 720 | 1.343 | 12.18 px | 8 |
| 1280×900 + card | 898 | 1.071 | 11.00 px | 12 |
| 1024×900 + card | 642 | 1.500 | 10.92 px | 11 |

## Visual review

| Screenshot | Verdict |
|---|---|
| `01-default-map-crop.png` | Strong. Eight roots on a 320 px ring use the canvas; every label sits outside the ring with no collisions; the small `+` marks expandable nodes as controls. |
| `02-powerbi-expanded.png` | Strong. Twelve nodes, four leaf labels truncated at 24 characters, full titles on hover; the focus ring and side card read clearly. |
| `03-leaf-card.png` | Card first, Open explicit; no accidental navigation. |
| `04-academy-lens.png` | Two tracks, 12 modules fanned around the open track; the card reports 46 branches / 48 items. |
| `05-source-group.png` | 35 grouped sources in the card; raw URL preserved. |
| `06-declared-crossrefs.png` | Exactly 3 dashed declared paths on the selected note. |
| `07-deep-search.png` | 66 shown after a depth-3 search; ancestors open and the target is in view. |
| `08-list-mirror.png` | Same tree, linear and readable. |
| `09-show-everything.png` | 1,167 nodes, labels off. Deliberately an overview, not a learning view. |
| `10-mobile-list.png` | The default mobile experience; strong. |
| `11-mobile-map.png` | Compact spatial overview. Labels are off by design at 390 px (see caveat). |
| `12-tablet-map.png` | 768 px default: eight roots, all labels readable, composition holds. |
| `13-tablet-card.png` | 1024 px with the card: readable labels, focus and four leaves labelled; one context root yields its label to avoid overlap. |
| `14-dark-map.png` | Dark theme: white labels, coloured rings and the radial wash all hold; the white selected chips invert correctly. |

## Caveats

1. **Mobile map has no labels.** The 1200-unit canvas scales to ~0.3 at 390 px, which would draw 14 px labels at ~4 px. Rather than ship illegible marks, the map shows the eight roots, the zoom control and the note “Overview only. Tap a ring to open its card; the List tab has the full outline.” List remains the mobile default.
2. **Labels counter-scale, with one depth exception.** The scale is tuned to the 14 px label role; depth-3 labels use 13 px, so on the narrowest map (768 px) they render at about 10.2 px. They remain legible and every label keeps its full title on hover and in the card.
3. **One context root can yield at 1024 px with the card.** The map column is 642 px; the focus and all four leaves keep labels, but “Microsoft Fabric” is skipped rather than overlapped. This is the intended “roots give way first” rule, not a missing node — it is still on the map, in the List and in the URL.
4. **The 25 visualization source pages stay one bucket.** Their Notion URLs are opaque page IDs, so no area grouping is factual.
5. **No semantic edges are drawn.** Only containment and the declared "see also" layer. Candidate, derived, co-citation and Atlas-review edges remain out by design.
6. **Automated axe is not a manual audit.** The roving tab stop, card focus and focus return are covered by browser checks, but a screen-reader walkthrough is still NOT RUN. In particular, whether heading focus announces the card well enough without the removed broad live region needs a real screen-reader pass.
7. **Four unrelated unit failures.** `npm run test:knowledge` fails only because `docs/daily-insight-bank-20261106/{INSIGHT_BANK,BATCH1_ARCHIVE,SOURCE_INVENTORY,PRE_BATCH3_ARCHIVE}.json` are absent. This predates the tree work.

## Superseded artifacts

- `scripts/qa-network-graph.mjs` — marked **SUPERSEDED** in its header. It targets the retired `.kng` component and must not be run as current QA. Current QA is `scripts/qa-network-tree.mjs`.
- `prototype-archive/global-hairball/` — the old component, styles, QA script and evidence, kept for rollback.
