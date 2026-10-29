---
name: hansa-spatial-experience
description: 'Activate for Hansa creative frontend work: immersive 3D/WebGL, 2.5D depth, animated visuals, Knowledge Atlas, landing pages, interactive learning, dashboards, data storytelling, transitions, visual redesign, and motion-rich components. Explore authentic 3D when useful, create distinct visual signatures instead of flat templates, map effects to verified content, build accessible performant alternatives, and critique visual richness. Complements hansa-creative-intelligence; never alters ongoing agent work or deploys without permission.'
license: MIT
compatibility: 'Codex/OpenCode Agent Skills; React/Next.js static-export Hansa. Optional Three.js/R3F/Drei/GSAP/Motion/D3 after repository audit.'
metadata:
  version: '2.0.0'
  family: 'hansa-creative-intelligence'
  scope: 'spatial-visual-design'
---

# Hansa Spatial Experience — cinematic, semantic, three-dimensional UI engineering

## Why this exists

Hansa should not look like generic cards with decorative effects. Make content spatially legible, memorable, interactive and visually rich. Explore **true 3D as a first-class visual medium**, 2.5D composition, cinematic transitions, procedural graphics, motion systems, and data-driven interactive experiences. A 3D-first *creative consideration* is not a mandate for GPU rendering everywhere. Use the richest **appropriate** expression of the underlying idea; avoid simplistic output despite sophisticated tools.

This skill is an **independent companion** to existing `hansa-creative-intelligence`, not a replacement or upgrade installed over its directory. Respect user instructions, the live repo, `AGENTS.md`, authoritatively sourced content, and existing design-system rules; do not assume either agent is free to edit the same files.

## Auto-activation and scope

**Activate** whenever a Hansa task includes rendered UI or UX: home, Atlas, content discoverability, learning, lessons, progress, animations, 3D, illustrations with interaction, dashboards, visualizations, storytelling, charts, comparisons, portfolio projects, navigation, hover/focus, motion, mobile experience, or redesign/review. For substantial interfaces, work alongside `hansa-creative-intelligence` when available: it performs cognitive/content analysis; this skill extends spatial design, 3D, motion, variation and validation.

**Do not activate** for backend-only fixes, scientific grading, pure parsing, nonvisual file organization or research extraction unless a rendered learning experience is explicitly in scope. Do not claim a UI needs rich animation without explaining why it helps its users.

## Non-negotiable authority and safety

- Current explicit user instruction > inspected actual source and canonical content > project `AGENTS.md` and approved constraints > existing `hansa-creative-intelligence` policy > this companion. If incompatible, report conflict instead of silently overriding.
- Inspect `git status`, current worktrees, changed files, routes, installed dependencies, design tokens, canonical content, and governing project instructions. Never overwrite another agent's work. Until specifically authorized, produce **isolated prototype / documentation only**, not production code. No deployment, package installation, route rewrites, or AGENTS replacement by default.
- Distinguish **verified observations, real content, derived values, design hypotheses and purely synthetic demos**. No invented learning facts, exam answers, quantitative relationships or user progress; no unapproved scientific content gaining authority through attractive presentation.
- Respect Hansa's static-export/Cloudflare deployment model, beUI and existing UI infrastructure. Choose libraries by capability; do not change technical architecture on faith.
- All spatial visuals must be inspectable without motion, navigable by keyboard, touch and screen readers where applicable, and usable with reduced-motion or absent GPU support. Never make Canvas the sole carrier of critical content.

## Core operating sequence (execute every meaningful creative UI task)

### Phase 0 — READ BEFORE DESIGN
1. Read `AGENTS.md`, existing `hansa-creative-intelligence/SKILL.md` if present, design policies, route components, tokens, data schemas, relevant skill references, `package.json`, build/static export configuration; inspect git changes.
2. Define audience, actual user task, genuine data, source of truth, content grain, valid relationships, scientific status and constraints. State what cannot be inferred.
3. Inventory surrounding visual compositions: note overused patterns and recent page signatures to avoid repeating the same look.

### Phase 1 — FIND THE VISUAL OPPORTUNITY
4. Map goals to interactions (explore, trace, compare, practice, explain mechanics, navigate, reveal, diagnose, progress). Identify why a spatial dimension would improve the outcome.
5. Produce **at least FOUR divergent concepts** for a flagship experience: (A) editorial/architectural 2.5D, (B) true 3D spatial, (C) organic/procedural, (D) unconventional narrative or data-expressive layout. For smaller components explore at least two. These must differ in metaphor, composition, interaction, and motion behavior—not just palette/glow.
6. Choose a semantic metaphor based on data, not vice versa. Specify links between data state and geometry, timing, depth, materials, lighting, camera, controls and alternate text representation.
7. Run a **richness audit**: identify composition, spatial hierarchy, visual focal point, transitions, direct manipulation, progressive detail, material distinctiveness, typographic voice, mobile transformation and landmark moment. Reject flat grids disguised by tilt/hover.

### Phase 2 — DECIDE REAL 3D VS 2.5D VS 2D
8. Use the router `references/09-technology-router.md`: true 3D when camera, occlusion, volumetric geometry or spatial interaction adds meaning; 2.5D when layers and depth cues are enough; 2D for precise values, forms, dense text, tables and semantic controls.
9. If true 3D: define scene graph, world units, camera projection and controls, object bounds and scale, lights/shadows/material, environment, interactions, animation ownership, GPU budget and lifecycle. Follow `references/03-3d-scene-engineering.md`.
10. If chart: keep quantitative comparisons perceptually honest; 3D chart depth must not distort values. Use a parallel 2D/data view. Read `references/19-quantitative-integrity.md`.
11. Select existing libraries first; consider R3F/Three.js/Drei, GSAP, Motion, D3, Canvas, shaders only after inspecting versions/support and articulating benefits. Never run install commands without permission.

### Phase 3 — PROTOTYPE + CRITIQUE
12. Build in a physically separate prototype directory/worktree unless owner explicitly authorizes in-repo implementation. Keep source files and release state untouched; separate demo data from production data.
13. Implement interactive state, real hit targets, camera limits, zoom/pan, focus, reset, hover, focus-visible, click/tap, keyboard equivalence, pointer and touch parity, reduced-motion behavior, context-loss fallback and loading/empty/error states.
14. Add art-direction craft: staging, rhythm, composition, light/shadow hierarchy, material behavior, depth layering, subtle atmosphere, coherent typography, contrasting density. Do **not** use every effect; choose a purposeful signature.
15. Compare multiple versions side-by-side and visually inspect at 320, 390, 768, 1280px, light/dark where relevant. Capture screenshots; evaluate in a browser; do not mark unchecked tests PASSED.

### Phase 4 — QUALITY, HANDOFF, CONDITIONAL INTEGRATION
16. Produce a design-decision record using `assets/decision-record.template.json` and a scored review using `scripts/score_proposal.py` or `references/12-quality-gates.md`. Address all hard blockers.
17. For approved changes only, integrate in bounded diffs, preserve semantics and UI continuity, run automated/manual tests, verify the actual production build and report conflicts. Deployment requires explicit approval.
18. Deliver: source-aware concept, minimum 3 distinct concept directions if flagship, technical design, live behavior, accessibility/performance budgets, screenshots, tests PASSED/FAILED/NOT RUN, modified files, rollback path and next decision. Never present a concept sketch as finished implementation.

## Mandatory output properties — flagship interactive visual experiences

- **Recognizable visual signature:** at least one striking, contextual spatial centerpiece rather than a familiar card/dashboard arrangement.
- **Depth hierarchy:** planned foreground/midground/background, lens or projection strategy, coherent light and material; perspective must not hide critical text.
- **Meaningful motion grammar:** entry, orient, manipulate, morph, settle, exit; interruption/reversal and state persistence considered.
- **Nontrivial interaction:** real state change and discoverable controls; not merely hover scale/tilt/glow.
- **Responsive redesign:** change composition on mobile; don't just shrink an unreadable scene.
- **Visual variety:** no repeated identical scene/staging across adjacent modules; record signatures and diversify metaphor, composition, rendering technique and interaction mode.
- **Semantic integrity:** true labels/edges/questions/data; fallback list/text/table; explicit source and scientific approval status where relevant.
- **Performance:** disable or simplify on lower capability devices; test actual frame pacing, memory, Core Web Vitals and loading, not just FPS guesses.

## Reference loading — pick relevant guides; never load everything needlessly

- `references/01-creative-director.md` — idea generation, anti-generic methods, creative critique.
- `references/02-spatial-art-direction.md` — composition, camera, lighting, materials, typography, mood.
- `references/03-3d-scene-engineering.md` — scene architecture, R3F/Three, scene graph, picking, lifecycle.
- `references/04-motion-choreography.md` — motion grammar, physics, orchestration, timelines, reduced motion.
- `references/05-interaction-patterns.md` — pointer, touch, keyboard, zoom, navigation, selection, focus, reset.
- `references/06-semantic-data-binding.md` — true data → geometry, relations, learning steps, status, state machines.
- `references/07-pattern-encyclopedia.md` — creative pattern library, dozens of non-generic options.
- `references/08-hansa-use-cases.md` — domain-specific uses in Academy, Atlas, data viz, stories, portfolio.
- `references/09-technology-router.md` — choose 2D/2.5D/3D and libraries by evidence.
- `references/10-performance-budget.md` — GPU budget, demand rendering, LOD, observability, fallbacks.
- `references/11-accessibility-mobile.md` — WCAG, reduced motion, touch, assistive equivalents.
- `references/12-quality-gates.md` — acceptance tests, visual scoring, hard blockers.
- `references/13-anti-flat-playbook.md` — how to avoid repetitive polished-but-generic output.
- `references/14-architecture-integration.md` — Next static export, isolated client islands, safe integration.
- `references/15-prototyping-experiments.md` — independent visual lab, divergent treatments, iteration.
- `references/16-concurrent-agent-safety.md` — worktree isolation, ownership, no overwrites or deploy.
- `references/17-assets-licensing-security.md` — textures/models licensing, asset pipeline, input safety.
- `references/18-narrative-scrollytelling.md` — cinematic learning stories, camera choreography.
- `references/19-quantitative-integrity.md` — 3D data-viz hazards and correction.
- `references/20-delivery-contract.md` — documentation and agent handoff requirements.
- `references/21-style-recipes.md` — diverse art-direction recipes, lighting palettes and craft.
- `references/22-worked-examples.md` — full practical architecture for flagship experiences.
- `references/23-validation-playbook.md` — browser/device/testing checklist.
- `references/24-reference-translation.md` — extract principles from inspirational visuals without cloning.
- `references/25-3d-technique-cookbook.md` — 60 detailed camera/geometry/material/animation techniques.
- `references/26-composition-systems.md` — 30 composition archetypes for real visual richness.
- `references/27-skill-evaluation-battery.md` — 15 adversarial skill behavior challenges and non-generic regression checks.

## Special safeguards

**Avoid fake 3D:** A CSS rotateX(3deg) on a flat card grid is not a three-dimensional experience. For a 'true 3D' claim, demonstrate world-space objects, perspective/orthographic camera, meaningful depth/occlusion, 3D interaction or camera control, and sensible fallback. 2.5D is legitimate when named correctly.

**Avoid spectacle-only:** Every major effect must have at least one job: encode relationship, focus attention, preserve orientation, communicate progress/state, provide feedback or establish narrative identity. The *restraint* is in number of effects, not in the richness of authored composition.

**Never false-claim verification:** Structural script validation != browser visual QA != deployed production verification. Report status separately.
