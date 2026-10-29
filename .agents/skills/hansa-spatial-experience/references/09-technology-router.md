# 09 — Decision router: technology serves the experience

## Step 1: content and interaction
- Fine labels, dense tables, exact statistics, accessibility critical → HTML/SVG + Motion; optional surrounding 2.5D stage.
- General scalable graph layout, zoom, force topology → D3 for geometry/scales, SVG/Canvas for rendering.
- Complex timed DOM/SVG sequences → GSAP or Motion (inspect existing package/dependencies first).
- True volumetric object, occlusion, camera traversal and spatial picking → Three.js; React integration generally R3F with Drei helpers.
- Thousands of similar particles/marks → Canvas2D, WebGL instancing/shader with reasonable fallback.
- Editorial scroll choreography → DOM/SVG GSAP or browser scroll APIs; do not override normal scrolling.

## Capability ladder
Level 0: semantic DOM + static diagram.
Level 1: reactive DOM/SVG + transitions.
Level 2: 2.5D layers and staged camera-like transitions without full scene.
Level 3: contained true 3D interactive hero or explanatory model.
Level 4: mixed 3D spaces with advanced shaders, multiple scenes, heavy postprocessing (exception requiring measured benefit).
Choose the **smallest level that delivers the approved vision**, not the lowest effort. A flagship may deserve Level 3; dense lessons may deserve Level 1 with a Level 3 demonstration.

## Build / deployment fit
Hansa uses Next App Router static export and Cloudflare Worker static assets. Browser-only renderers must stay within isolated client components, lazy loading and fallbacks. Inspect current framework/module versions and build scripts first. Browser APIs are not available in server component render context. External runtime APIs or a server backend cannot be assumed in static export.

## R3F vs raw Three.js
R3F when React state and scene are strongly intertwined; inspect installed versions. Raw Three.js when a standalone scene subsystem, optimized GPU loop or custom renderer is necessary, and integration boundary is stable. Both require lifecycle and accessibility planning.

## Why not 3D data charts by default
Camera perspective, occlusion and depth illusions impair comparisons. Use exact 2D chart for numerical reading; 3D may contextualize a process or truly spatial geometry with clear axes/controls and a table fallback. No invented z-axis.

## Escalation proof
Before any new dependency: record exact existing alternatives; target feature impossible/expensive without it; expected bundle/capability cost; license; static export/browser compatibility; rollback. Installation needs explicit permission and must not clash with another agent's dependency work.
