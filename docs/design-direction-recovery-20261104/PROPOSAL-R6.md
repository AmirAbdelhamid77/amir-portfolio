# Proposal - R6 the polish layer

- Date: 2026-11-05
- Slice / surfaces: R6, the whole public stage (`#today`, `#edition`, `#closing`,
  archive) at 1280 / 1024 / 390 / 320
- Commit: uncommitted working tree on `3d94030`
- Flag: `HANSA_POLISH_REVIEW=1`, independent of the five accepted flags
- Status: **proposed 2026-11-05, awaiting owner visual acceptance.**

## Why this slice starts from measurement

R6 was released with a scope, not a design: apply a measured type scale, reduce
mono-label noise, fix the topbar overlap and sparse scenes, do a screen-reader
pass, state the motion budget, and compare performance. The topbar question was
settled by the first probe before anything was designed: the fixed header is
57px tall and the first scene starts at 152px (1280) and 190px (390), so there is
no overlap to fix. The other four items were measurable, and the numbers below
are the flag-off public build, entered at `/`, reduced motion, one local run.

`node docs/design-direction-recovery-20261104/r6-audit.mjs` ->
`evidence/r6-audit.json`, `r6-audit-1280-dark.png`, `r6-audit-390-light.png`.

| Measure | Before (1280) | Before (390) | After (1280) | After (390) |
| --- | --- | --- | --- | --- |
| Distinct type sizes | 16 | 16 | **9** | **9** |
| Mono labels (uppercase or tracked) | 46 / 139 (33.1%) | 46 / 139 | **26 / 140 (18.6%)** | **26 / 140** |
| Smallest target | 32px | 32px | **44px** | **44px** |
| Targets under 44px | 3 | 3 | **0** | **0** |
| Body measure | 58-63 chars/line | 44 chars/line | 58-63 | 44 |
| Section fill (today / edition / closing) | 71 / 89 / 68% | 80 / 91 / 86% | **73 / 89 / 72%** | 80 / 91 / 87% |
| Horizontal overflow | 0 | 0 | 0 | 0 |
| Animations under reduced motion | 0 | 0 | 0 | 0 |

After: `evidence/r6-report.json` (flag-on build, five other flags off).

## 1. One measured scale instead of sixteen sizes

The build set text at 64, 41, 38.4, 30.7, 18, 16, 15, 14, 13, 12.5, 12, 11.5,
11, 10, 9.5 and 9px. Four of those were display sizes resolved from four
different `clamp()` expressions, so the h1 (64) and the reading title (38.4)
were doing the same job at different volumes.

R6 names nine roles and points every rule at them. The values are unchanged where
the accepted composition depends on them (h1 64, scene title 41, body 14).

| Role | Value at 1280 | Replaces |
| --- | --- | --- |
| `--polish-display` | 64px | 64 |
| `--polish-title` | 41px | 41 |
| `--polish-heading` | 32px | 38.4, 30.7, 22 |
| `--polish-quote` | 26px | 26 (review close only) |
| `--polish-subhead` | 19px | 18, 17 |
| `--polish-lead` | 16px | 15, 16 |
| `--polish-body` | 14px | 14 |
| `--polish-meta` | 13px | 13, 12.5, 12, 11.5 |
| `--polish-label` | 11px | 11, 10.5, 10 |
| `--polish-tick` | 10px | 9.5, 9 |

The clock keeps its own step at 10px on purpose: at 11px "THU 05 NOV" wraps
inside a 76px tick, which was the first capture's regression and the reason the
tick is not simply the label size. Everything else is 11 or larger.

**No prose below 13px.** The reading card's reasoning caveat (11px), the
instrument caption (10px) and the decision-model rows (10px, uppercase) now read
at 13px. The remaining 10-11px text is labels and meta only, and
`r6-report.json` lists exactly six such strings.

## 2. Labels: capitals are for where you are, not for what you read

33% of the text was mono and either uppercase or widely tracked. That included
content values ("TWO TEAMS", "SOURCE OF TRUTH") and the reading's own meta rows.

The rule R6 applies: **uppercase and wide tracking belong to the kicker and the
clock tick** - the two places that tell the reader where they are. Inside a
scene, a mono meta row keeps the mono face and loses the capitals; content
values are sentence case at 13px with a colon joining key and value. The
masthead keeps its capitals because it is the identity strip, not scene copy.

Measured: 46 labels (33.1%) -> 26 (18.6%), and the six items still under 13px
are labels, not prose.

## 3. Heading outline: two corrections that are not review-only

Two defects were recorded as R6 candidates when R5 shipped. Neither changes
layout, colour or composition, so R6 ships them in the public build instead of
hiding them behind the visual flag:

1. `Choose a moment.Follow the thread.` - JSX dropped the newline before the
   second line, so the h1's accessible name ran the sentences together. The
   markup now carries an explicit space. Public HTML: `Choose a moment. <span ...>`.
2. The reading's h2 repeated the scene-1 peek title word for word. The reading
   heading now starts with an `sr-only` "The reading: ", so the outline reads
   *The reading: A reference is a design decision.* while sighted readers see
   the same line.

`evidence/r6-a11y-tree.json` records the Chromium accessibility tree: h1
`Choose a moment. Follow the thread.`, four distinct h2s, one h3, and the same
six live regions as before.

## 4. Targets and rhythm

- Three targets were under 44px: `Permalink` (32), the archive link (32) and the
  instrument's `Reset model` (36). All three now have a 44px row; the review
  close's saved buttons and disclosure follow the same rule. 0 remain under 44.
- Section fill was 71 / 89 / 68: the first and last scenes read as frames
  around air. One scene rhythm (48-72px block padding, closing 44-64px) and a
  tighter title-to-clock gap bring it to 73 / 89 / 72 without adding content,
  borders, gradients or decorative rules.
- The disclosure keeps its native marker: it grows through padding, not a
  display swap.

## 5. What R6 deliberately does not do

- No new type family, colour, card, radius, icon or illustration. The scale uses
  the faces the stage already loads.
- No motion is added. The reduced-motion inventory is 0 animations and 0
  transitions before and after. Full-motion behaviour is unchanged.
- No content, data, publication state or link changes. The archive, the fan, the
  dealer, the neighbourhood and the R5 close are untouched.
- The review close inherits the floor (it only renders with both flags on) but
  is not redesigned here.
- The public default does not change. With the flag off the stage renders the
  accepted M6 type and every R6 rule is inert.

## 6. Cost, measured

The polish layer is one attribute plus inert rules in the stage stylesheet -
the same trade R5 made for the review close.

| Build | DOM | Requests | JS | CSS | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| R5 public (flag off) | 780 | 43 | 827,336 B | 248,019 B | 756 ms | 0 |
| R6 public (flag off) | 781 | 43 | 827,466 B | 253,060 B | 776-1152 ms (3 runs) | 0 |
| R6 polish (flag on) | 781 | 43 | 827,466 B | 253,060 B | 716 ms | 0 |

- **+5,041 B CSS, 30 rules**, all scoped to `[data-stage-polish="true"]` and dead
  when the flag is off. Browser bodies are uncompressed locally, so the
  transferred cost is lower; the honest figure is the measured encoded body.
- **+1 DOM node** is the `sr-only` reading prefix, not the polish layer.
- **+130 B JS** is the corrected heading strings.
- LCP is unchanged in substance: 756 ms at R5, 776 / 792 / 1152 ms across three
  R6 public runs on the same machine. The spread is local-run noise, not a
  regression.
- The polish build itself costs nothing extra at runtime: same requests, same
  DOM, same script; only the attribute differs.

## 7. Accessibility evidence and its limits

- axe: 0 violations at 1280 dark/light, 1024, 390 and 320 (`r6-report.json`).
- 0 console errors at every viewport.
- 0 horizontal overflow at every viewport.
- Keyboard: the clock's roving tab stop, the disclosure, and the three raised
  targets were exercised by the capture script.
- **Manual screen-reader pass (NVDA/VoiceOver): NOT RUN.** The Chromium
  accessibility tree is recorded, but it is not an AT test. Non-Chromium
  browsers and touch hardware are also NOT RUN.
- Full-motion captures are not part of R6 because no motion changed; the
  reduced-motion inventory above is the claim.

## 8. Files and guards

Changed: `components/knowledge/hansa-landing.tsx` (sixth flag),
`components/knowledge/insight-stage.tsx` (attribute + prop),
`components/knowledge/stage-timeline.tsx` (h1 space),
`components/knowledge/insight-scene.tsx` (reading prefix),
`components/knowledge/stage-editorial.css` (the scoped layer).
Added: `tests/knowledge/polish.test.mjs` (8 guards: flag independence, every
selector scoped, nine roles, no hard-coded size, prose floor, 44px targets, h1
space, unique reading heading).

## 9. Reproduction

```
# before
npm run build                      # no HANSA_* variables
node scripts/serve-out.mjs 4395
NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r6-audit.mjs
NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r6-perf.mjs public

# after
$env:HANSA_POLISH_REVIEW="1"; npm run build
NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r6-capture.mjs
NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r6-a11y-tree.mjs
NODE_PATH=node_modules node docs/design-direction-recovery-20261104/r6-perf.mjs polish

# shipped state (rebuild last)
npm run build
```

## 10. Owner decision

Pending. Presented at the R6 visual checkpoint: `compare.html` section 12,
`evidence/r6-*.png`, this proposal, the acceptance record and the pin table.

Ask: accept R6 as the review layer (flag stays off in the shipped export), or
send specific changes back. No flag becomes the public default and nothing is
deployed in this slice.
