# 05 — Interaction engineering for spatial UI

## Interaction surfaces
Support hover, focus-visible, click, tap, keyboard select, arrows (where appropriate), pinch/drag or accessible zoom controls, search, filter, focus return, breadcrumbs and explicit Reset View. Never make hover the only path to information.

## State model template
```
status: idle | inspecting | selected | transitioning | error
selectedId: stable ID | null
focusId: stable ID | null
visibleGroupIds: stable ID[]
filters: typed key/value
a11yMode: normal | reduced-motion | fallback
camera: controlled target and zoom, not source of truth
```
Transitions: SELECT(id) -> update semantic panel and visual focus; CLEAR -> restore previous overview; FILTER -> preserve selection if valid else announce change; CAMERA_MOVE -> visual only, not semantic grade.

## Pointer + keyboard parity
- Pointer hover highlights an object only after hit test; pointer out clears ephemeral highlight but not selected state.
- Keyboard tab focuses real accessible DOM controls; Enter/Space selects; arrows only if implementing proper composite-widget semantics.
- Touch tap selects; double tap/pinch cannot be the only zoom; visible buttons alternative.
- When a scene morphs, DOM focus stays on activated control or moves predictably to logical heading.
- Screen readers get role, labels, relationship names, counts and change announcements (not vague 'node 14').

## Navigational patterns
Orbit camera, corridor, zoomable topology, spatial tabs, radial menu, stage-based chapters, object inspector, split visual-and-details panel, semantic minimap. Choose at most one primary navigation model per view; combine only where discoverable.

## Discovery and affordance
Show motion hint on first relevant interaction, not long automatic tutorials. Visible controls with icons and text; clearly mark draggable, expandable and selected objects. Provide reset, close, undo and explicit view labels. Cursor changes are supplemental.

## Dense graphs
Search-first, local neighborhood reveal, semantic edge grouping, progressive disclosure, disambiguating paths, focus+context techniques. Don't position hundreds of labels in a 3D scene without occlusion/legibility strategy.

## Reliability states
Loading with essential content available; empty with explanation; invalid data with validation badge/text; GPU fallback; animation interruption; context restored after route navigation; connection loss does not destroy previously loaded verified source.
