# 25 — Spatial technique cookbook: real-world craft decisions

Every entry is a possibility, not a default dependency. A *meaningful* 3D scene composes geometry, camera, light, material and state into a useful visual language. When below-listed techniques don't serve the task, omit them.

## Camera / projection / cinematography
1. **Orthographic inspection** — accurate process-layer diagrams without perspective distortion.
2. **Perspective establishing shot** — foreground scale makes a spatial mechanism legible.
3. **Dolly-to-target** — selected concept moves to visual focus while preserving orientation.
4. **Orbit-constrained exploration** — user rotates a mechanism but cannot lose context.
5. **Rail camera tour** — skippable learning story with destination markers and breadcrumbs.
6. **Focus+context camera** — selected object grows in importance without destroying adjacent links.
7. **Split synchronized cameras** — contrast two alternatives with consistent lens and stage.
8. **Exploded camera detail** — brief depth expansion reveals hidden substructure.
9. **Isometric stage** — pseudo-technical object view with low cognitive load.
10. **World-to-screen anchor** — accessible DOM tooltip follows scene object without becoming unreadable.
11. **Camera-relative lighting** — maintain legible silhouette at allowed orbit angles; test for flat spots.
12. **Adaptive framing** — responsive aspect ratio and content bounds determine framing, not fixed z-coordinate.

## Geometry / topology / visual structure
13. **Instanced glyphs** — many repeated shapes sharing geometry/material for lower draw calls.
14. **Extruded semantic path** — animated channel follows verified source-target direction.
15. **Curved ribbons** — directional relationships with boundary collision/overlap handling.
16. **Tube graphs** — volumetric edges with density/LOD selection.
17. **Procedural branching** — only when visual traversal does not imply a false hierarchy.
18. **Exploded assembly** — subcomponents separate based on validated process steps.
19. **Cutaway reveal** — cross-section shows hidden storage/architecture layers.
20. **Morph targets** — same entity changes state without identity loss.
21. **Spatial clustering** — typed semantic categories grouped by valid features, not aesthetic proximity assumed as fact.
22. **Voxel/pixel sculpture** — visually digital material that can transform without copying specific existing artwork.
23. **Surface displacement** — animate a grounded field or clearly decorative ambient surface.
24. **Diagrammatic sculpture** — geometry serves one conceptual explanation, not literally claimed infrastructure.

## Lighting, material and post-processing
25. **Key/fill/rim triangle** — readable form, independent object silhouette.
26. **Local emissive paths** — guide viewer's focus along verified link types.
27. **Fresnel edge cue** — reveal silhouette and interactivity without glow overload.
28. **Frosted shell** — selective translucency for layers, with depth ordering/overdraw budgets.
29. **Brushed metal / matte ceramic** — tactile technical mood through roughness values, not oversized bloom.
30. **Paper relief** — dimensionality with near-zero GPU expense in 2.5D form.
31. **Controlled shadows** — one important hero shadow, not many high-resolution moving lights.
32. **Environment map** — coherent material reflection with licensed HDR asset and compression.
33. **Filmic tone discipline** — preserve text/semantic color under rendering and postprocessing.
34. **Fog by depth** — emphasize distance only with nearby details still readable.
35. **Selective bloom** — single focal element, avoid washing labels or color-coding states.
36. **Screen-space outlines** — maintain selected object clarity on busy scenes.
37. **Particle filament trail** — trace user-triggered navigation or actual data lineage, not fake real-time throughput.
38. **Volumetric light shafts** — expensive; reserve for opt-in or small hero, always with fallback.
39. **Dither/noise** — smooth materials or procedural granularity, not visual clutter.
40. **Shader-driven state** — highlight selected/filtered/review-pending with legible DOM annotation.

## Motion physics and behavior
41. **Critically damped focus spring** — quick response without perpetual bouncing.
42. **Drag inertia** — user intent remains controllable and resettable.
43. **Magnetic snap** — align objects to meaningful stages/relationships.
44. **Collision-limited layout** — avoid unreadable node overlap.
45. **Deterministic growth** — seeded expansion for repeatability and visual comparison.
46. **Stagger by semantic distance** — prerequisites or graph reachability determine sequence.
47. **Scrubbable timeline** — the user, not autoplay, controls stage/time.
48. **Retargetable morph** — repeated clicks interrupt cleanly.
49. **State-preserving scene transition** — selected ID and scroll position survive visual restage.
50. **Rest-state rendering** — GPU idle when scene settles unless there is a justified ambient effect.

## Typography and interface integration
51. **DOM anchored labels** — sharp, selectable, accessible concept names.
52. **Kinetic headline sculpture** — dimensional typography with readable HTML mirror.
53. **World-space annotation** — hotspot pins link to prose, images and sources.
54. **Panel reveal** — selected 3D entity opens a stable inspector, never a floating unreadable tooltip alone.
55. **Semantic zoom** — at increased detail show more verified information, not just larger graphics.
56. **Accessible focus halo** — scene and focusable DOM list coordinate identity/selection.
57. **Mini-map/overview** — retain orientation in large spaces.
58. **Explicit camera reset** — deterministic home view on all devices.
59. **Scene alternative control** — list/text mode is one click and keyboard accessible.
60. **Mobile stage recut** — shot/scale/composition changes intentionally, never only CSS downscale.

## Engineering checks by technique
For each chosen technique document: semantic role; fallback; CPU/GPU cost; interactivity; keyboard equivalent; mobile alternative; animation stop conditions; source/licensing; runtime proof. A single expensive shader with no causal job is not a proof of excellence. Contrast, silhouette, texture and choreography together determine craft.
