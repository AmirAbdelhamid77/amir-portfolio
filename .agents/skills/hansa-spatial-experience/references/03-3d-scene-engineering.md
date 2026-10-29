# 03 — True 3D implementation engineering

## When world-space rendering is warranted
A 3D scene must add at least one: volumetric form; occlusion explaining layers; spatial manipulation/rotation; camera travel tied to navigation; interactive exploded model; physically meaningful adjacency; immersive contextual storytelling. A card tilt alone fails this test.

## Proposed React integration (adapt to actual repo)
1. Preserve a server-renderable heading, summary and accessible DOM controls/content.
2. Keep the scene in a distinct client component; lazy-load only on supported clients and only when visible/needed.
3. Use one shared state source for selected node, filters, detail panel and camera target. Never duplicate facts in React state and GPU objects.
4. Keep canonical graph data outside renderer. Render a DOM table/list fallback from the same source. All user actions must still work without Canvas.
5. Handle loading/error/graphics-unavailable/context-lost state; keep navigation functional.
6. Dispose GPU resources and subscriptions on unmount. Limit textures, geometry, draw calls, shader work, shadow maps and postprocessing.
7. The current Next version, renderer library versions and static-export constraints must be checked before implementing. Never assume sample imports compile unmodified.

## React Three Fiber / Three.js components
`Canvas` boundary; lights, cameras, controls, meshes, instancing, optional HTML overlays; use raycast/pointer interaction carefully; maintain camera orientation and focus target. Choose `frameloop="demand"` for mostly static scenes; moving models may need scheduled invalidation during animation. Verify that controls trigger invalidation. Do not demand-render a truly always-moving scene without coordinating frames.

## Geometry, scale and picking
- Units and bounding volumes consistent; different object sizes must convey real semantics or hierarchy, not random priority.
- For >100 similar objects consider InstancedMesh; record per-instance selection mapping and GPU picking strategy.
- Avoid excessive transparent layers and overlapping hit areas; provide accessible DOM equivalents.
- Make direct manipulation predictable. Drag threshold distinct from click; orbit must not steal scrolling or focus. Never tie essential controls exclusively to mouse movement.
- For graph layout, use deterministic seeds when comparing revisions and preserve mental map across selection changes; graph data is not automatically a tree.

## Scenes to consider
- Spatial knowledge graph: nodes in 3D space, semantic edge categories, controlled focus navigation, 2D list.
- Exploded conceptual mechanism: components spread apart to teach process and reassemble for overview.
- Data pipeline: 3D chamber or conveyor guiding flow, not misrepresenting throughput.
- Time-axis museum: chapters occupy rooms, with summaries/links in DOM.
- Model explorer: object rotation/slicing where three-dimensional geometry itself is the content.

## Shaders and effects
Custom shader only if geometric/material effect cannot be achieved adequately with simpler tools; develop reduced-motion/noise fallback, test devices. Avoid heavy bloom, depth-of-field and transparency overdraw simultaneously. Keep shader code documented and bounded, no remote runtime shader fetching.

## WebGPU caution
Newer Three.js supports a WebGPU-capable renderer with WebGL 2 fallback, but support/version differences matter. Make an explicit compatibility decision and test real targets; do not assume WebGPU availability or silently remove fallback. For ordinary portfolio content, a stable WebGL approach is acceptable.

## Example architecture contract
Data layer => semantic UI state => scene adapter (positions/materials/camera) and DOM adapter (labels/details/fallback). Scene events dispatch state actions; state updates both renderers. No GPU-only knowledge source.
