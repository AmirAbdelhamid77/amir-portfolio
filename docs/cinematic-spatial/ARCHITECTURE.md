# Architecture — one camera, three acts

## 1. Composition

```
app/page.tsx
└─ InsightStage                       components/knowledge/insight-stage.tsx
   ├─ KnowledgeAtmosphere
   ├─ .cine-environment               drifting wash / aurora / thread
   ├─ section.cine-hero               ACT I
   │  ├─ eyebrow bar                  "Hansa / Knowledge stage" · review status
   │  ├─ h1.cine-headline             "One idea. / A different way to see it."
   │  ├─ a.cine-edition-link          edition 01 · date · title
   │  ├─ p.cine-hero-status           topic · N preview editions · atlas state
   │  └─ KnowledgeDealer density=hero the card dealer
   ├─ section.cine-handoff            the seed (sticky 120vh band)
   │  └─ .cine-seed-wrap → .cine-seed + 2 orbit rings + caption
   ├─ section.cine-atlas              ACT II (sticky, 100svh + 240vh travel)
   │  ├─ .cine-atlas-head             "02 / Knowledge Atlas"
   │  ├─ SpacetimeAtlas               canvas + side controls + node list
   │  └─ AtlasDolly                   "dolly N%" + progress track
   ├─ div.cine-atlas-coda             StageAtlasPeek (semantic layer, review status)
   └─ div.cine-content                ACT III
      ├─ .cine-seam                   line · node · line
      └─ Reveal → scenario / instrument / rail / archive
```

State that moves every act: `selectedId` (edition), `scenes` (scenario open),
`experiments` (instrument state), `zones` (dealer hand), `activeCardId`. All of
them are ordinary React state changed by a person, never by scrolling.

## 2. The scroll bus

Three passive readings, one writer, zero React renders per frame:

```
useScrollProgress(ref, mode) ──► ScrollReading { current, subscribe }
      hero  (leave)   ──► --hero-p        on .cine-edition-link
   handoff  (pinned)  ──► --handoff-p     on .cine-seed-wrap
                         --handoff-ease   (smoothstep, pre-computed)
                         --handoff-fade   (late fade, pre-computed)
     atlas  (pinned)  ──► --field-p       on .cine-environment
                              └─ --cine-drift: calc(var(--field-p) * -90)
```

* `useScrollProgress` is a closure, not a ref and not `useState`: `current` is
  readable inside a rAF loop, and `subscribe` delivers a plain callback in the
  same frame the value changes.
* Values are quantised to 1/2000 with a 0.0005 dead-band, so a resting page
  writes nothing.
* `pinned` only engages when the section is taller than `1.35 ×` the viewport;
  shorter sections (stacked mobile, very tall windows) fall back to `enter`, so
  progress can never divide by a negative travel distance.
* **Each property is written on the element that consumes it.** Writing an
  inherited custom property on the stage root invalidates style for ~800 nodes
  per write; that measured at ≈100 ms per frame on a 4× throttled CPU. On the
  leaf elements it is free.
* Native scrolling is untouched: no scroll controller, no `preventDefault`, no
  scroll hijacking, no `scroll-behavior` override. Anchors, restoration, the
  wheel and touch scrolling all behave exactly as before.

Reduced motion removes the writer entirely; CSS then rests at `--field-p: 1`
with the other three at `0` (the designed static frame).

## 3. The Atlas

`lib/atlas/field.ts` is pure and unit-tested (`tests/knowledge/cinematic-field.test.mjs`):

| Export | Role |
| --- | --- |
| `buildField(graph, editions, published)` | Turns public records into vertices and links. Editions sit on a ring of radius 32 with a ±12 vertical spread; their concept, lesson, practice and source satellites sit at radius 52; the semantic ring is at 68; the concept hub sits at `0.34 ×` its authored position so the camera focuses the neighbourhood rather than empty space. |
| `cameraFor(progress, orbit, focus)` | One camera for the whole act: dolly `76 → 124`, yaw `-0.32 → 0.5`, pitch `0.12 → 0.36`, target eased from the focused node to the field centre, `fov 42`. |
| `project` / `lens` | World-space perspective projection and the lensing used for depth cues. |
| `renderField` | Depth-sorted draw: dust, edges, glyphs, labels, fog. Fog is relative to camera distance (`near = d·0.58`, `far = d·1.72`) so contrast survives the dolly. |
| `pickNode` | Hit-testing in screen space for pointer selection. |
| `dust(seed)` | Deterministic background field, so no two visits differ. |

`components/cinematic/spacetime-atlas.tsx` owns the DOM:

* **2D canvas, world-space maths.** No WebGL, no new dependency: the camera,
  perspective divide, depth sort and fog are computed in `field.ts` and drawn
  with the 2D context. It is described as such in the UI, never as "3D".
* **Colour.** Site tokens are `oklch()`, which canvas cannot parse. The palette
  is read once by painting one pixel per token on a 1×1 scratch canvas and
  reading it back as `rgb()`, then re-read when the theme attribute changes.
* **Glyphs by kind:** edition = card with the real date, concept = ringed core,
  source = diamond, destination = dot. Labels use a greedy collision pass and
  flip to the left of a node when they would clip; nodes outside the canvas are
  not labelled.
* **Cost control:** device-pixel-ratio cap, `IntersectionObserver` pausing the
  loop off-screen, `visibilitychange` pausing in background tabs, and under
  reduced motion the loop only redraws when something changed (measured: 0
  canvas clears per second when idle).
* **Interaction:** drag to orbit, arrow keys to orbit, ±/reset controls, pointer
  picking, `Escape` to clear, and a visible node list that mirrors every vertex.

## 4. Accessibility and fallbacks

| Concern | Behaviour |
| --- | --- |
| Canvas semantics | `<canvas role="img" aria-label="Spatial field of 7 knowledge vertices and 12 connections…">`; the group around it is focusable and described by `#atlas-field-help`. |
| Keyboard | Arrow keys orbit; `+`/`-` zoom; `0` resets; `Escape` clears the selection. The node list is a plain set of buttons. |
| Equivalent content | `#atlas-node-list` repeats every vertex as a real control with its meta and link. Selecting there updates the URL (`?insight=…`), the inspector and Act III. |
| Announcements | `.atlas-inspector` is `aria-live="polite"`; the dealer announces deals, opens and collections. |
| Wheel / touch | The wheel is never captured; `touch-action: pan-y` keeps vertical panning native. |
| No canvas | If `getContext("2d")` returns null the field shows an honest fallback message and the list stays fully operable. |
| Reduced motion | Static field at the end of the travel, no drift, no seed travel, no entry animations; Act III stays readable. |
| Forced colours | The seed, instrument and canvas get a `CanvasText` border. |
| No JavaScript | The archive at the end of the page carries every edition with its reasoning. |

## 5. Motion language

`lib/motion/cinematic.ts` is the single source of timing and feel:

* travel: `handoff 120vh`, `atlas 260vh`
* durations: `entry 0.72`, `entrySlow 1.05`, `settle 0.42`, `feedback 0.14`,
  `mask 0.86`, `morph 0.64`
* stagger: `tight 0.055`, `base 0.085`, `wide 0.13`, `editorial 0.16`
* depth: `near 1`, `mid 0.82`, `far 0.62`, `perspective 1400`
* easing: `out cubic-bezier(.16,1,.3,1)`, `inOut .65,0,.35,1`,
  `settle .22,1,.36,1`, `spring .34,1.56,.64,1`
* springs: `light 210/26/0.7`, `card 150/20/0.9`, `camera 60/22/1.1`
* pointer limits: `tilt 7°`, `magnetic 12px`

Motion is the default branch. `prefers-reduced-motion` is an accessibility
alternative derived from the same tokens — it removes travel, not meaning.

## 6. Why no new dependency

The visual work needed a spatial field, not a chart. `lib/atlas/field.ts` is
~500 lines of pure vector maths that the test suite can check directly; adding a
graph or 3D engine would have brought a renderer, a scene graph and a WebGL
requirement for seven vertices, and would have made the honesty tests harder to
write. Motion 14 (already a dependency) covers the entry/exit choreography;
everything scroll-linked is CSS custom properties plus one rAF writer.
