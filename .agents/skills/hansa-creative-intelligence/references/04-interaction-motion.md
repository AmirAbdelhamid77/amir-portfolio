# Interaction design & motion choreography

## Write state first

For each interaction record: **trigger → state change → mathematical/semantic change → visual feedback → alternate input → reset**.

Example for a source-backed relationship graph:
- Trigger: click / focus+Enter on a concept node.
- State: `selectedConceptId` updates (URL/search params only if existing app convention supports it).
- Semantic change: compute verified neighbors from a canonical edge list, keep stable IDs.
- Visual change: selected circle grows subtly; connecting curves brighten; unconnected nodes de-emphasize; panel reveals source-backed description and links.
- Alternate input: search/list/tree view selects same ID; +/– buttons and focusable controls instead of gesture-only zoom.
- Reset: "Clear selection" restores overview; Escape works if appropriate. Reduced-motion shows instantaneous state change without spatial travel.

## Choreography vocabulary

- **Orient (entrance):** 0 → stable overview with no information hidden for assistive tech.
- **Invite (affordance):** noticeable but restrained cue that graph/data can be manipulated; no autoplay competition with reading.
- **React (direct manipulation):** pointer, focus, touch and keyboard all get deliberate feedback; actual data/relationship changes are visible.
- **Explain (state transition):** preserve object constancy, guide attention through a transition in clear stages rather than teleporting the entire view unexpectedly.
- **Settle:** end in a readable stable arrangement; avoid perpetual motion or jitter.

Timing is context-dependent, not a global preset. Small feedback can be quick; an educational process may need deliberate user-controlled stepping. Never enforce an animation delay that prevents accessing content.

## Meaningful microinteractions

1. **Node hover/focus** reveals relevant dependencies / neighbors and a contextual caption.
2. **Selection** changes the spatial relationship hierarchy; zoom may anchor to the selected region without trapping the viewport.
3. **Chart brushing** updates selected range and summary together; keyboard-accessible date/select alternative required.
4. **Temporal playback** pauses/steps/rewinds across validated states; no pretend real-time Fabric feed.
5. **Before/after** preserves the same underlying data and changes one explanatory parameter, not unrelated chart styles.
6. **Story transitions** use annotations and stable axis references to show what changed between scenes.
7. **Card Dealer** interactions convey meaningful content selection and support accessible next/previous instead of endless passive hover animations.

## Accessibility invariants

- All actions possible with keyboard/touch; logical focus order, visible focus ring, accessible names; text alternatives to icons.
- Avoid hover-only disclosure, inaccessible canvas-only text, direct-manipulation-only graph controls, and page-level scroll hijack.
- Honor `prefers-reduced-motion` and pause/stop controls for extended automatic motion where needed.
- Reduced-motion is not "remove the concept": retain clear selection, before/after and state feedback with non-motion alternatives.
- Ensure static content is understandable with JavaScript disabled **where the surrounding architecture reasonably permits**; interactive state must have a semantic fallback even when JS is required.
- RTL and LTR semantics: inspect current language expectations; do not reverse numeric axes or data flow meaning solely because copy is Arabic.

## Mobile strategy

Large graph on desktop → focused subgraph/scrolling list and a details region on mobile. Wide chart → responsive panel plus precise table. Scrollytelling → explicit chapter controls. Tooltip → anchored details and select control. Visual density is **reinterpreted**, not merely scaled until labels become unreadable.
