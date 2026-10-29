# 02 — Spatial art direction: make depth intentional

## Space as information
Treat z-depth as an information channel, not a blur effect. Assign back/mid/front according to user task: background sets context, midground carries relationships, foreground hosts selection and readable details. Use spatial grouping, occlusion, scale, parallax, lighting and controlled shadows only when hierarchy remains legible.

### A full scene sheet
- **Scene bounds & coordinate system:** define object extents, world units, origin, safe text zones and camera clipping planes.
- **Camera:** perspective for embodied navigation; orthographic for precision and low-distortion diagrams; camera orbit only with clear purpose; cap polar angles/distance; animate transitions predictably.
- **Lighting:** principal key for form, fill for readable shadows, rim/accent for silhouette, optional environment reflections. Lighting must preserve contrast in theme variants; avoid expensive shadow maps by default.
- **Material:** e.g. brushed metal, translucent resin, paper relief, volumetric filaments, frosted glass, matte ceramic, emissive channels, wireframe. Use a coherent material family and meaningful interaction response, not random glossy assets.
- **Color:** choose dominant field, accent, neutral structures and semantic colors. Never encode correctness/status solely by color.
- **Typography:** readable DOM labels with stable typographic hierarchy; camera never makes critical labels illegible. Canvas text may supplement, not replace accessible text.
- **Atmosphere:** fog, gradients, dust or post effects only when they clarify distance/mood and fit performance budget.
- **Compositing:** overlap intentionally; use focal hierarchy, contrast gradient and cinematic negative space. Multiple scales of detail create richness without clutter.

## 3D vs 2.5D craft
3D requires actual world-space depth, camera, volume/occlusion and meaningful motion or manipulation. 2.5D uses CSS transforms/SVG layers/parallax/lighting for plausible depth while remaining fundamentally plane-based. Both can be premium; be explicit about which is selected. Don't use 3D for a dense searchable table; enrich the surrounding story instead.

## Cinematic shot grammar for the web
- Establishing shot: structure and scope, typically calm.
- Approach shot: user attention converges on a cluster/concept.
- Reveal: focus transition makes dependent knowledge visible.
- Exploded view: mechanism unfolds into parts.
- Recomposition: filtered/selected objects reorder, preserving landmarks.
- Return shot: clear reset and reorientation; user's place is retained.

## Material + meaning examples
- Transparent layered shell → systems architecture layers, but opacity must not imply unverified importance.
- Metallic hinge/exploded mechanism → SQL execution pipeline steps.
- Organic soft network → interconnected learning concepts without implying hierarchy.
- Embossed paper strata → chronological storytelling.
- Light tracks → verified data pipelines or dependencies, with explicit direction.

## Handheld/mobile art direction
Use a different camera angle, lower scene complexity and closer focus; collapse decorative distance but preserve semantic edges; allow a DOM list and panel to be primary when scene has too many tiny targets. Avoid relying on accelerometer or device motion. Check finger hit areas and text overlap at 320/390 widths.

## No default visual monoculture
Do not turn every Hansa module into a glowing black environment. Vary light/dark, solids/outline, intimate/wide, calm/energetic, dense/sparse, geometric/organic, cinematic/editorial. Preserve global design tokens where authoritative.
