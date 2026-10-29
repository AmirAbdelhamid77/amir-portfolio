# 23 — Reproducible browser QA and capability verification

## What must be executed for an actual production-ready claim
1. Inspect root project instructions, git status, dependency versions, runtime and authoritative data.
2. Validate source-to-visual semantic mappings using stable test fixtures and official/canonical content.
3. Run lint/typecheck/build with exact commands from repository (do not assume scripts exist).
4. Render local prototype/browser at width 320, 390, 768 and 1280; capture screenshots and inspect at least opening, hover/focus, selected, filtered, error/fallback and mobile states.
5. Verify pointer/keyboard/touch parity and focus order, zoom/pan/reset, reduced motion, color/contrast and DOM details.
6. Examine console for hydration errors and WebGL warnings; test context failure fallback or note NOT RUN.
7. Check actual performance metrics with representative device profiles and document target/observed metrics separately.
8. Run regression on unrelated routes/QA-critical educational data. Inspect git diff; do not inadvertently change bank keys or progress state.
9. Report test table with `PASSED/FAILED/NOT RUN` and evidence artifacts; verify deployed state only when explicit deploy occurred.

## Sample test entries
- `source_integrity`: exact IDs and edge types unchanged.
- `render_static_export`: build and asset paths valid.
- `interaction_focus`: DOM focus and selected GPU object remain synchronized.
- `control_reset`: restores overview and previous valid state.
- `gpu_unsupported`: content and browsing available without scene.
- `reduced_motion`: no camera flight or large positional motion; same information shown.
- `mobile_320`: no clipped critical controls or tiny unreadable labels.
- `performance`: measured frame time and interaction latency, methodology documented.
- `contrast`: text overlays readable under brightness/theme.

## Review protocol
Visual art director checks silhouette, material craft and originality; teacher checks learning correctness; engineer checks reliability and runtime. Cross-review must include at least one skeptical critique cycle. If true 3D is claimed, capture camera/rotation/depth or object manipulation proving it is not pseudo-3D.

## Failure categorization
`BLOCKED_SOURCE`, `BLOCKED_CONFLICT`, `FAIL_SEMANTICS`, `FAIL_A11Y`, `FAIL_PERFORMANCE`, `FAIL_INTERACTION`, `FAIL_VISUAL_GENERIC`, `NOT_TESTED`. Each failure gets reproduction steps, severity, affected routes and corrective action. Never silently downgrade tests to 'pass'.
