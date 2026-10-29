---
name: hansa-creative-intelligence
description: 'Use automatically when implementing or reviewing Hansa frontend pages, learning experiences, chart/data visualization, dashboard, Atlas graph, motion, hover/click effects, educational interactions, or responsive UI. Inspect content, propose an original context-aware visual direction, use existing beUI/Hansa components or D3/Motion only when justified, implement accessible animated interactions and critique visual depth. Do not use for backend-only or scientific QA-only tasks with no UI.'
license: MIT
compatibility: 'Codex, OpenCode, and compatible Agent Skills loaders; Hansa React/Next.js static-export project'
metadata:
  version: '1.0.0'
  project: 'Hansa'
---

# Hansa Creative Intelligence — context-aware visual & motion design

## Activation — do not wait for the owner to say "make it animated"

For **any Hansa work that changes an end-user-visible page, component, chart, lesson, dashboard, landing experience, or interaction**, run a *Visual Opportunity Pass* before coding, even if the user only asked to add content or refactor a page. Invoke this skill automatically in those tasks. For purely backend, metadata, data validation, or scientific QA work with no rendered experience, do not force this skill.

The owner's standing intent: Hansa must feel **original, layered, spatial, responsive, editorial, cinematic where appropriate, and genuinely interactive**; avoid the repeated flat-rectangle/dashboard-template result. Visual design must still teach, preserve correctness, and run reliably.

This skill is an **augmentation**, not a replacement for the repo's current `AGENTS.md`, existing Hansa design system, canonical content, validated components, or the governing `HANSA_MASTER_AGENT_REFERENCE_v1.0.md` when present. Current user constraints and inspected repo/source outrank this guidance.

## Mission and design tension

**Read the concept → recognize what can be revealed visually → invent a distinct visual metaphor → choose a suitable representation → animate meaningful state changes → test → critique → refine.**

Do not interpret "creative" as blanket particle fields, parallax, neon glows, D3 on every page, a 3D chart, or a predetermined look. The quality standard is a memorable interaction **that helps understanding or exploration**. Good readable text and tables remain valid where they are better.

## Required operating loop

1. **Inspect before change.** Read current root `AGENTS.md`, route/component sources, tokens, chart libraries, existing beUI components, dependencies, motion conventions, canonical content/source and app/Next configuration. Check `git status`; do not overwrite another agent's uncommitted changes. Treat reported version/paths as context, not live inspection. Do not deploy without an explicit request.
2. **Classify the material.** Write one sentence defining the user's cognitive task (compare, trace, explore, diagnose, understand mechanism, practice, discover, tell a story). Identify available *verified* data and its semantics, content density, learner level and interaction constraints.
3. **Visual Opportunity Pass (mandatory).** Consider at least THREE materially different representations **internally**: (a) simplest precise, (b) rich 2D interactive, (c) immersive or narrative. Reject variants that misrepresent data, clutter learning or cost too much. Select the strongest context-driven option, not the most familiar template. On substantial UI changes, document selected and rejected options briefly.
4. **Define visual signature.** Specify composition, depth/foreground-midground-background, focus path, interactive affordance, typography scale, responsive behavior, meaningful animation phases, and what makes this distinct from adjacent Hansa pages. Follow existing tokens; do not invent a new global design system.
5. **Choose the tool by capability.** Use existing Hansa and beUI first; then SVG/CSS/Motion; use D3 for custom scale/layout/zoom/graph/geometry/control when it genuinely improves the result. Other existing chart engines or React Flow may be better. Never install a visualization library merely because this skill mentions it. Read `references/03-technical-playbook.md`.
6. **Model interaction as real state.** Define inputs, derived state, transitions, direct manipulation (hover, focus, click, touch, key), reset, and factual/visible feedback. Motion expresses causality, relationships and orientation; no dead or deceptive controls.
7. **Implement in the actual architecture.** Keep server-renderable/static content outside client-only islands where practical; honor Next static export and Cloudflare deployment. Reuse project architecture, navigation, progress stores, source IDs and question-status gates. Make interactive enhancements progressive, not replacement for semantic content.
8. **Review like an art director AND teacher.** Test whether the effect is imaginative, semantically correct, genuinely engaging and visually deep. If the output is indistinguishable from a default card grid or motion preset, revise BEFORE calling it done. Check all defined QA gates; state what is not verified.
9. **Report briefly.** Summarize the learner goal, distinctive visual concept, why the chosen technology was appropriate, behavior on mouse/touch/keyboard, reduced-motion alternative, evidence/test status, modified files and why other options were not chosen.

## Design defaults (not a fixed template)

- Prioritize **meaningful spatial depth** via layers, contrast, lighting restraint, negative space, material response, chart staging and typography; not a wall of round-corner cards.
- Explore **responsive circles/orbits/clusters** for concept nodes **when the content is relational**; use stable IDs, grounded connections, pointer/focus highlighting, zoom and detail. Circles are **not** mandatory for tables, forms or every module.
- Animation vocabulary: *reveal → guide attention → respond to action → morph/transition between states → settle*. Prefer interrupted/reversible responsive physics to gratuitous loops. Every state is understandable without motion.
- Use chart motion to explain changing quantities, filters, uncertainty and causal steps. Axis changes, denominators and data transformation are explicit; do not use transition as a substitute for evidence.
- For significant visual tasks, explore one **unexpected but defensible** direction before using familiar Hansa patterns. Preserve site coherence without repeating the same composition everywhere.
- Preserve responsive design at ~320/390/768/1280px as relevant; keyboard, focus, touch, text/data equivalents, theme contrast, and reduced motion are mandatory. No autoplay-heavy effects, scrolling hijack, or inaccessible hover-only behavior.

## Authority / boundaries

- Owner's current request > inspected repo + canonical source > root `AGENTS.md` and authoritative Hansa reference > this skill > library suggestions.
- Never invent real data, numerical observations, business results, Fabric semantics, graph edges or exam answers. Label synthetic mathematical demonstrations clearly. Never visually promote an unapproved DP-600/PL-300 answer into a verified one.
- Never silently rewrite routes, source coverage, concept IDs, progress state, QA grades, existing behavior, or deployment setup. Work in small non-destructive diffs; avoid touching concurrent agent tasks.
- No paid components or external network/CDN dependence without permission; no routine "npm install" before repository audit; no unreviewed code copied from demos.
- Render/source fidelity and accessibility take priority over visual polish. But **do not use these requirements as an excuse for default flatness**: find the best permissible level of original craft.

## Read targeted references

- For visual ideation, depth and a cinematic but legible art direction → `references/01-art-direction.md`.
- For chart/representation choices and no-fake-data constraints → `references/02-decision-engine.md`.
- For Next/React/D3/Motion/chart integration → `references/03-technical-playbook.md`.
- For motion grammar, interactions and responsive visual architecture → `references/04-interaction-motion.md`.
- For tests, acceptance, visual review and QA status labels → `references/05-quality-gates.md`.
- For Hansa-specific patterns/examples → `references/06-hansa-scenarios.md`.
- For anti-patterns and practical design critique → `references/07-anti-patterns.md`.
- For a lightweight decision log, when needed → `references/08-output-contract.md`.

## Completion gate

Do not claim success solely because `npm run build` passed. A substantial Hansa visual change must include: **correct concept and data, an identifiable non-generic visual idea, working stateful interaction, graceful touch/keyboard and reduced-motion behavior, responsive layouts, theme handling, regression checks, and a truthful validation report**. If full browser QA is unavailable, label it `NOT RUN` and identify what is still unverified.
