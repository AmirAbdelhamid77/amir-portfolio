# 06 — Actual visual acceptance gates (not a build-only checklist)

## Visual approval criteria

Creative QA and engineering QA are independent. A successful `npm run build`, 0 axe automated findings, or 100/100 self-rating cannot prove cinematic execution. Owner review is the last creative gate.

### Hard blockers: any one = NO-GO

- Recycled existing centered Hero + two buttons + three cards merely repainted/glowed/tilted.
- Timeline behaves as static date chips rather than authentic drag/momentum/focus.
- Dealer is ordinary tiles/accordion without its physical lift/arc/flip and accessible readable inspector.
- Atlas shows invented/unapproved edges or hides publication-pending status.
- Changes in date do not atomically synchronize insight/experiment/cards/Atlas.
- No perceptible depth signature from actual screenshot; fake 3D claim; or no unique interactive payoff.
- Data story is decorative and not recalculated from meaningful input.
- Broken keyboard/touch paths, no readable no-GPU/reduced-motion equivalent.
- Critical performance crash, pointer-only hover action, text occlusion, 3D chart that distorts quantities.
- Lost old routes/question IDs/saved learner progress; overwrite/concurrent editing conflict.
- Unapproved dependency installation/production deploy.

### Skill's weighted 100-point reviewer rubric

| Category | Weight | Minimum evidence |
|---|---:|---|
| Data/source integrity | 16 | canonical insight+source IDs, scientific status, math independent check |
| Originality/composition | 14 | first-frame screenshot side-by-side vs flat production; unique silhouette |
| Spatial depth craft | 12 | layered screenshot plus movement/occlusion/camera proof where claimed |
| Meaningful interaction | 12 | user changes model, controls reveal causal outcome |
| Semantic motion | 10 | Timeline/card/graph choreography, interrupt+reset verified |
| Accessibility/equivalent | 12 | keyboard/touch/reduced-motion/no-GPU plus semantics |
| Mobile transformation | 8 | intentionally recut at 320/390/768; not shrunk desktop |
| Performance & fallback | 8 | measured vitals/frame pacing, alternate tier functional |
| Learning usefulness | 5 | reveals a real concept, not spectacle only |
| Maintainability | 3 | bounded integration, reusable typed states, clean rollback |

Review each category 0..5. Score via spatial skill `scripts/score_proposal.py`, using a complete JSON with selected concept, rationale, source inventory and evidence. **85+** is design review target, but hard blockers override; owner approval still required.

### Site-wide nonvisual metrics

Provisional targets from attached Skill (must use measured conditions): LCP <2.5s, INP <200ms, CLS <0.1; measure in lab and later field separately. Don't fabricate percentile numbers. Smooth motion at representative devices; report frame time, dropped frames, long tasks, GPU/canvas fallback, main thread and memory after navigation. Lower tiers must prioritize reliability over fixed 60fps promise.

### Page interaction test matrix (each PASS / FAIL / NOT RUN / BLOCKED)

| ID | Steps | Pass criterion | Screenshot/video evidence |
|---|---|---|---|
| UI-01 | Open 1280+ desktop | Content instantly legible, 3 layers, distinct silhouette, not old flat hero | F0 |
| UI-02 | Drag Timeline, release | active day settles with momentum; URL/content/cards synchronize | F1,F2 & video |
| UI-03 | Interrupt mid-date animation | latest requested insight wins, no stale animation/state | screencast + event log |
| UI-04 | Change experiment input | numeric value, exact chart and explanation model synchronized | F3 + test |
| UI-05 | Reveal/Skip | real insight and source accessible without mandatory long intro | F4 |
| UI-06 | Select Card Dealer card | visible lift + curved flight + flip + expanded text | F5,F6 + video |
| UI-07 | Escape/close card | card closes, focus returns, selection can repeat | video/keyboard |
| UI-08 | Select approved Atlas relation | graph highlights typed, cited relation, list matches | F7 + source trace |
| UI-09 | Atlas publication pending | honest source-backed fallback; no fabricated public graph | page screenshot |
| UI-10 | 390 touch & 320 narrow | no overflow, readable deck sheet and controls | F8, touch video |
| UI-11 | Reduced motion / no GPU | same content/actions without spatial movement or canvas | F9 + test |
| UI-12 | 200% zoom / RTL | text not clipped, focus order follows reading direction | screenshots |
| UI-13 | Date rollover Cairo | correct insight/fallback, no hydration mismatch | deterministic clock test |
| UI-14 | Legacy route smoke | old deep links/query/hash/progress unaffected | regression log |
| UI-15 | Real browser load | no hydration/console/resource failures, responsive perf tracked | browser trace |
| UI-16 | Search/navigation | Learn/Practice/Atlas/About reachable; Work/Experience remain elsewhere | route evidence |
| UI-17 | Visual critique | creative reviewer explicitly confirms non-generic spatial structure | signed review note |

### Evidence naming

- `F0_first_frame_desktop_1280.png`
- `F1_timeline_drag_desktop.mp4`
- `F2_selected_date_desktop.png`
- `F3_experiment_data_change.png`
- `F4_reveal_explanation.png`
- `F5_dealer_arc_motion.mp4`
- `F6_card_reading_surface.png`
- `F7_atlas_relation_focus.mp4`
- `F8_mobile_390_and_320.mp4`
- `F9_reduced_motion.png`
- `console_hydration_log.txt`, `test_results.md`, `performance_trace.md`

Names are examples: don't create dummy files or label nonexisting screenshots. If video unavailable, mark the corresponding evidence/acceptance `NOT RUN` rather than substituting written assertions.

## Anti-flat comparison checklist

Compare the new frame with the previously observed current hero:

- Does the hero still look like a centered tagline + CTA strip?
- Can the viewer see one crafted spatial centerpiece rather than a uniform card collection?
- Is there material/light/perspective structure even with all hover stopped?
- Do interactions transform the layout, not just change color?
- Are motion transitions visually continuous across stages?
- Is the experience recognizable when desaturated?
- Does mobile have equivalent tactile but less expensive interaction?
- Is the rich scene a truthful representation of actual concept/source?

Any "No" on fundamental composition/interaction is **REWORK_REQUIRED**, not a low-priority polish task.
