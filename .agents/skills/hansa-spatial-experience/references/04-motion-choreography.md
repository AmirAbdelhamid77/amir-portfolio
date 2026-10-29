# 04 — Motion choreography as information design

## Motion grammar
`orientation → anticipation → reveal → manipulation → continuity → settle → exit/reset`. A sequence is valid only if users can interrupt/reverse it and still see accurate final state. Do not create mandatory long intros before content.

### Motion jobs
- **Causal reveal:** reveal what follows from a choice/step.
- **Identity continuity:** same concept remains identifiable through a re-layout.
- **Progress mapping:** lesson completion, source validation or QA status moves only when state really changes.
- **Attention steering:** guide to the next user action; avoid competing animations.
- **Error correction:** mistaken choice receives feedback that explains next step rather than visually shaming.
- **Depth cue:** occlusion, parallax, focus shift or camera move helps understand layers.

## Timeline design
Define timings in semantic phases, not arbitrary CSS delays. Stagger only related objects. Use spring physics for direct manipulation, easing curves for authored scene cuts, deterministic animation for grading/status. No autoplay infinite movement on critical reading surfaces.

## Cancellation and interruption
Use one interaction state machine; pointer/touch/keyboard produce same actions. On new action: cancel/retarget prior tween, avoid race conditions, preserve selection. Pause when hidden/offscreen where possible. Respect device/battery constraints. Avoid scroll hijacking and uncontrolled wheel capture.

## Motion tokens (starting hypotheses, validate in browser)
- Micro-feedback: 80–180ms.
- Panel/open close: 180–360ms.
- Graph focus/re-layout: 300–700ms depending on distance and context.
- Guided cinematic transition: 450–1100ms only if skippable and useful.
- Ambient movement: at most subtly and with user ability to pause; reduced motion disables it.
Numbers above are design candidates, NOT a measured standard and NOT a permission for delay-heavy UI.

## Motion design by information type
- Hierarchy: branching growth along known parent-child relationships.
- Graph: coordinated morph, highlight only verified edges, retain anchors.
- Sequence: stepwise travel with replay/scrub.
- Comparison: synchronized transitions under consistent common scale.
- Distribution: morph between equivalent honest statistical representations.
- Progress: fill/growth only from persisted and checked progress events.
- Uncertainty: use explicit bounds/confidence labels, not vague particle haze.

## Reduced-motion contract
Use `prefers-reduced-motion` and an in-UI option for intense scenes when needed. Replace camera flight and large positional movement with instant state changes, short opacity transitions or static frames. Do not hide content or remove meaning. Ensure pause/stop/hide for persistent moving effects where relevant.

## QA
Record start, mid, end, interrupted, reversed, keyboard, touch, reduced motion and reload cases. Capture actual behavior not promises. Check for timing conflicts, focus loss, content shifts and scroll motion surprises.
