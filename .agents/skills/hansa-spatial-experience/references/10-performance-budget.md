# 10 — Runtime performance and resilience

## Goals are measured, not asserted
Set page-specific targets after baseline measurement. Initial **provisional** targets for prototyping (not guarantees): prioritize INP under 200ms on representative real devices, LCP under 2.5s, CLS under 0.1 in target field/lab context; aim for smooth frame pacing near display refresh in active interaction. On low-end mobile, stable usability and responsive controls matter more than 60fps ambition. Baseline and test in Lighthouse/DevTools/browser traces; record hardware/device and conditions.

## GPU scene budgets
- Prefer one Canvas per coherent view, not one per card.
- Use demand rendering where mostly still; invalidate properly when objects/controls change.
- Use object reuse, instances, limited geometry/material variants; avoid thousands of React mesh components.
- Control DPR (often <=1.5 or adaptive), pixel footprint, shadow resolution, texture dimensions, particle counts and fragment shader cost according to measurements.
- Prefer compressed assets after tooling compatibility checks; lazy load offscreen scenes; avoid GPU work on initial route unless the hero requires it.
- Profile draw calls, shader compile, texture memory, GPU/CPU main-thread work, time-to-interactive and thermal behavior.
- Dispose geometries, materials, render targets, textures and event listeners. Handle WebGL context lost/restored and low memory conditions.

## Performance tiers
Tier A: fully supported, optimized 3D interaction.
Tier B: simplified geometry/shadows/postprocessing, reduced particles, lower DPR, same meaning.
Tier C: 2.5D SVG/CSS interactive equivalent with DOM controls.
Tier D: semantic text/list/static image + links for no-canvas, no-motion, no-JS partial cases.
Select tier via observed runtime capability and user preference, never assume desktop = high-tier. All tiers must preserve the ability to complete core user task.

## Feature gating
Never automatically run intense continuous animation in background tabs. Pause offscreen scenes. Users must be able to pause/reduce elaborate movement. Lazy scene hydrate is appropriate if content still readable. Verify memory after repeated route changes and toggles.

## Mobile smoke sequence
320px low-end emulation, 390px phone, 768px tablet, 1280px desktop; pointer coarse/fine, touch navigation, orientation change, reduced-motion, graphics fallback and battery-saving conditions if available. Record actual tested profiles and failures, not invented FPS.
