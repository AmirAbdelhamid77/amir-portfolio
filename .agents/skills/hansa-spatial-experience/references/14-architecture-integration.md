# 14 — Architecture and integration for Hansa

## Architectural principles
Read actual installed Next/React, directory, dependencies and deployment scripts. Hansa context: App Router static export, Cloudflare Workers static assets. Browser-only WebGL/Canvas must be isolated client-side, not imported eagerly into components assumed server-renderable. Avoid global JS bundles for interactions below fold.

## Component interface
```
KnowledgeExperience
  data: validated canonical nodes/edges or learning steps
  defaultSelection: stable ID
  onSelect: (id) => dispatch semantic action
  mode: auto | spatial | accessible
  options: budgets, reduced motion, controls
```
DOM title, textual overview, selected detail, search and accessible list remain separately available. Scene adapter maps stable IDs to render objects and positions; controls dispatch state actions; semantic data remains immutable. Render side-effects never decide scientific truth.

## Lazy loading
Use a client component boundary; load 3D engine only after user interaction or near viewport when appropriate. Check chosen dynamic import API and `ssr` support in actual Next version; do not copy an outdated blog snippet blindly. A static export remains possible when browser-only runtime work is on client and build doesn't require server APIs.

## State sync and hydration
Initial render must not depend on random coordinates/window size without deterministic defaults. Seed layout; measure container after mount; do not accidentally create hydration mismatch. Preserve URL/query state for navigable selection if routing supports it. Provide stable SVG/DOM placeholder.

## Repo coordination
Do not touch `AGENTS.md`, lockfiles, packages, deployment configs or shared tokens without permission and a reviewed diff. For a running local agent, isolate by separate directory/worktree. Do not silently delete generated assets. Test bundling, static route rendering and browser hydration before integration acceptance.

## Suggested boundaries
`visual-experiences/<feature>/` optional module containing `model.ts` `semantic-state.ts` `scene.client.tsx` `accessible-controls.tsx` `fallback.tsx` `styles.module.css` `tests/`. This is a proposal; inspect real repo before creating.

## Component reuse
Use existing Hansa/beUI buttons, focus styles, typography and panels when practical. Custom 3D is the *content stage*, not an excuse to throw away reliable design primitives for forms/controls.
