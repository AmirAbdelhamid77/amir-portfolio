# VISUAL REGRESSION — before/after, honestly scoped

## What "before" means here

There is **no pixel-level "before" capture of the old `/`** in this package. The
pre-migration homepage was a portfolio-framed directory (`app/page.tsx`, 317
lines) whose purpose was replaced, not restyled — a diff of the two would document
an intentional replacement, not a regression. What exists instead:

- `docs/canonical-home/before/*.snapshot` — the exact bytes of every touched file
  before the migration, hash-verified in `START_BASELINE.json`. That is the
  byte-level baseline; it can be restored to reproduce the old page exactly.
- The Chrome screenshots in `evidence/` are all **after** the migration.

So this file reports: (a) the after-state captures and what they show, (b) the
before/after *structural* comparison, and (c) what is therefore NOT proven.

## After-state captures (real Chromium, local static export)

| File | Viewport / state | What it is for | Checked visually |
|---|---|---|---|
| `evidence/root-desktop-1280-dark.png` | 1280 × dark | Canonical landing, full stage | Stage sections present, no overflow, no empty panels, no prototype framing |
| `evidence/root-desktop-1280-light.png` | 1280 × light | Same, light theme | Text contrast and borders hold in light theme |
| `evidence/root-dealer-1280-dark.png` | 1280 × dark, after dealing | Card dealer with a hand of three | Cards fan into the tray, deck counter decrements, no clipped cards |
| `evidence/alias-1280-dark.png` | 1280 × dark | `/prototype-c/` renders the same landing | Same sections as root; nothing route-specific |
| `evidence/root-mobile-390.png` | 390 × dark | Mobile layout | No horizontal overflow, tap targets readable |
| `evidence/root-nojs-1280.png` | 1280, JavaScript disabled | Server-rendered fallback | Archive and reasoning readable without JS |

Measured rather than eyeballed (from `qa-canonical-home.json`):

- Horizontal overflow at 320, 390 and 768 px: **0 px** (`MOBILE01` ×3).
- Console errors on `/`, on the alias, and after each deep link: **none**
  (`ROOT02`, `ROOT02b`, `ROUTE01d`, `URL0-deep-*`).
- axe non-serious findings: **0** (`ACCESS01`).
- Reduced motion: every control still works (`REDUCED01`).

## Structural before → after

| Element | Before | After |
|---|---|---|
| Homepage identity | Portfolio hero ("Data that makes…") + three doorways | Hansa knowledge stage |
| Daily insight | Present only on the prototype route | First section of `/` |
| Editions rail | Only on `/prototype-c/` | On `/`, drag/wheel/keyboard unchanged |
| Card dealer | Only on `/prototype-c/` | On `/` |
| Atlas peek | Only on `/prototype-c/` | On `/`, pending state, public projection |
| Archive | Only on `/prototype-c/` | On `/` with `#archive` and `?insight=` |
| Author identity | Hero of `/` | Credits on `/about`, `/work`, layout metadata, footer (`R9` asserts it is still credited) |
| Legacy URL | The only address of the stage | Alias of the same implementation |

## No false motion claims

Stills cannot prove motion. The drag/flick/spring behaviour of the editions rail
and the dealer's flight are asserted only where a browser *interaction* demanded a
result — `TIMELINE01/02` (rail advances by pointer and by ArrowRight, focus
retained), `DEALER01/02/03` (deal, open panel, close with no leftover overlay),
`SCENARIO02/02b/02c` (reveal toggles and collapses). **No video was recorded**, and
no claim is made about easing curves, spring feel or 60 fps smoothness from a
still frame. If the owner wants that evidence, `scripts/qa-canonical-home.mjs` is
the place to add a recording pass.

## Not covered

- The two new draft-review routes and their pages (other work stream).
- Any page outside the landing family at 320 px.
- Screen-reader narration (axe + keyboard only).
- The live deployment's rendering (not run).
