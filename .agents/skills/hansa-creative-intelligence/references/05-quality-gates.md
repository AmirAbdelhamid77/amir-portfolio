# Quality gates and evidence rubric

## Required review: four independent dimensions

**Scientific/data:** data provenance, transformations, chart scales/baselines, edge integrity, nonfabricated numbers, precise SQL/DAX/Fabric reasoning; preserve assessment statuses.

**Visual/creative:** visible depth/purposeful layering, authored composition, strong focal hierarchy, novelty fit, text clarity, contrast to generic template, visual coherence across selected states. A flat default UI is an actionable design defect on a task asking for an expressive experience even if tests pass.

**Interaction:** hover/focus/click/touch/keyboard, reset, selected/unselected and empty/error/loading states, data-driven transitions, sensible motion, control feedback, orientation during zoom.

**Technical/accessibility:** lint, typecheck, unit tests, build, hydration/static export, accessibility, mobile/desktop, reduced motion, performance, regression, no unrelated change.

## Minimum test matrix — when visual changes warrant it

| Scenario | What to inspect |
|---|---|
| Desktop (e.g. 1280/1440) | hierarchy, readable detail, signature interaction, no clipping |
| Small phone (~320/390) | alternative graph/chart mode, readable controls, touch target, no overflow |
| Tablet (~768) | mid-state layout and controls |
| Keyboard | Tab/Shift+Tab/Enter/Escape, focus indication, no trap, accessible zoom/list actions |
| Touch | selected information remains accessible without hover |
| Reduced motion | animations stop/adapt; content and feedback remain intact |
| Light/dark | contrast and meaning retained without relying only on color |
| Data states | empty, small, dense, missing/invalid, updates, stable object identity |
| Automated checks | actual project's lint, typecheck, tests, build if available |
| Regression | canonical content, routes, user progress, storage, neighboring components, concurrent files unchanged |

## Design QA checkpoints

A. **Before code:** one measurable learner/user goal; source identification; shortlist of ≥3 substantially different presentation directions (for major visual tasks); selected signature and reason.

B. **After first render:** inspect real screenshots/DOM in browser when tools allow; identify at least two concrete observations (e.g., poor depth, weak node emphasis, awkward mobile relation view) and refine the actual implementation. Don't mark this done from source inspection alone.

C. **After interactions:** test actual user state and data changes, not just CSS hover. Confirm focus/tap equivalence and reduced-motion fallback.

D. **Final:** prove each modified route works and content is preserved; publish truthful status: `PASS`, `FAIL`, `NOT RUN`, or `BLOCKED` separately for automated, browser, visual, a11y, performance and scientific content checks.

## Acceptance rubric (qualitative)

- **0 — decorative / broken:** looks polished but has no semantic purpose or invalid controls.
- **1 — generic:** correct but interchangeable grid/preset; no distinctive visual story.
- **2 — functional:** clear representation with real interaction but limited compositional authorship.
- **3 — expressive:** original, contextual and layered; educational transitions and keyboard/touch parity; refined mobile state.
- **4 — exceptional:** surprising yet precise, high craft, meaningful explorability and strong validated UX/performance.

Target **3+ on flagship or explicitly creative visual tasks** without compromising scientific correctness. Other pages may intentionally prioritize efficient reference/readability. Don't self-award an unobserved visual score: reviewer/browser evidence needed.

## Final task report template

- Intent and source evidence:
- Affected route/files / existing features preserved:
- Visual signature and rejected alternatives:
- Data semantics, verified/synthetic labels:
- User interactions and reduced-motion/accessibility equivalents:
- Library choice, actual dependencies and tradeoffs:
- Tested (command / environment / results):
- Visual review observations + revisions:
- `PASS` / `FAIL` / `NOT RUN` / `BLOCKED` for each gate:
- Remaining risks / next focused task:

Never claim browser screenshots, audits, device testing or scientific approval when not actually run.
