# Circular Knowledge Atlas nodes — 26 October 2026

Implemented locally in `D:\BeUI\amir-portfolio`, on the existing
`feat/dp600-academy-ingestion-20261025` branch. No commit, deployment, reset,
stash, dependency installation, content publication or student-data transfer.
The initial worktree was extensively dirty; prior work is retained.

## Scope and inspected evidence

The affected route is `/learn/dp-600/atlas/`. Read the workspace/repository AGENTS,
Atlas V1 master and governance/UX/quality companions, repository integration and
implementation reports, expansion and continuation handovers, graph model/server,
Explorer, local motion components, styles/configuration and relevant tests/receipts.
The referenced ChatGPT chat returned placeholders for its assistant messages, so its
detailed audit was unavailable. Current repository evidence governs this change.

Presentation coverage is all three Atlas JSON layers: **42 concepts, 49 semantic
relations, 32 source records and 36 catalogue associations**. Their definitions,
IDs, claims, provenance, editorial states, routes and schemas were not edited.
The normal public projection remains empty. No original guide, scientific claim,
source export, exam answer or Statistics lesson was re-audited or reimported here.
This is a graph presentation update, not complete scientific/source coverage.

## Changes and rationale

Reuse the existing native SVG renderer, Motion dependency, theme tokens, inspectors,
HTML navigator and complete connection list. No graph-engine replacement or global
design-system modification. See `VISUALIZATION_SPEC.md` for the weighted comparison
with a list-only solution and representation semantics.

| File | Change |
| --- | --- |
| `components/atlas/explorer.tsx` | True SVG circle nodes, responsive measured layout, animated positions and perimeter-to-perimeter edges; static state labels, keyboard selection and existing contextual actions |
| `lib/atlas/circle-layout.ts` | Pure, independently tested label wrapping, text-derived radius, deterministic spacing, circular endpoint geometry and explicit prerequisite classification |
| `components/atlas/circle-map.css` | Scoped themed surfaces, selected/related/prerequisite states, circular focus rings, hover/press feedback, reduced-motion/forced-colour rules, reserved-height scrolling viewport |
| `tests/atlas/circle-layout.test.mjs` | All 42 labels, six widths, source immutability, non-overlap, perimeter geometry and prerequisite direction |
| `tests/atlas/circles-e2e.mjs` | Isolated browser QA with fresh storage contexts and new artifact paths |
| `scripts/atlas-circle-receipt.mjs` | Exact successor receipt, prior-manifest binding and rollback-byte validation |
| `scripts/dp600-continuation-receipt.mjs` | Resolves the new successor without rewriting the sealed continuation manifest |
| `scripts/verify-preservation-history.mjs` | Includes this successor in disposable-copy negative checks; no previous assertion removed |

Circle sizes fit existing labels; they encode no importance, confidence or mastery.
Selection never changes radius. A filled circle plus “Selected”, solid “Related”
outline, dashed “Prerequisite” outline and neutral “Context” label distinguish state
without colour alone. Prerequisites come only from explicit outgoing
`requires_understanding_of` assertions, including when a lens hides that assertion.
No chapter, TOC or catalogue association becomes a semantic line.

Node activation still updates safe URL state and opens the existing inspector with
definitions, evidence and actual resource links. The full title is retained in the
accessible name and SVG title. Edge types remain in accessible edge names, tooltip
claims, inspectors and the labeled connection list; inline edge text is omitted
from the map to keep circle labels clear. Existing zoom/pan/Fit/Reset controls remain.
Mobile stays list-first with an optional scrollable graph and contextual inspector.

The existing Tailwind/Turbopack CSS rule did not produce usable CSS-module class
exports in the first prototype. The final implementation uses scoped plain CSS,
matching the repository pipeline, without changing that pipeline or global tokens.
Visual inspection caught that prototype defect; its screenshots were replaced.
A React SVG title hydration issue was also corrected by supplying a single string.

## Validation evidence

Run commands from the repository root. Evidence is in `qa/`.

| Check | Final result and limits |
| --- | --- |
| `node scripts/build-atlas-preview.mjs` | PASS: local review build plus restored normal static export, 123 generated pages; `qa/build.log` |
| `npx tsc --noEmit` | PASS; `qa/typecheck.log` |
| `npm run lint` | PASS; `qa/lint.log` |
| `node --experimental-strip-types --test tests/{data-viz,statistics,fabric,content,atlas,academy}/*.test.mjs` (explicit directory globs on Windows) | PASS: 160 tests, zero failures; `qa/unit.log` |
| `node tests/atlas/circles-e2e.mjs` | PASS: 320 light, 390 dark, 1440 light reduced-motion; 1920 light normal motion; `qa/BROWSER.json`, `qa/browser.log`, screenshots |
| Browser geometry/accessibility | True circle bounds, measured label bounds in the tested focus, prerequisites, Enter/Space, circular focus ring, inspector and edge evidence, Reset, state retention, no page overflow, emulated tap/history, hover/reduced-motion and stable viewport; zero page errors and zero Axe violations in the Explorer |
| Reference/Atlas/EasyUI/implementation/history/public-projection verifiers | PASS; `qa/gates.log` |
| Human scientific approval/publication | BLOCKED on named human review; deliberately unchanged |
| Screen-reader and physical touch-device QA | NOT RUN; emulated keyboard/touch and Axe do not replace these |
| 200–400% browser zoom, forced-colour visual inspection, slow-motion replay at 10%, broad browser/device coverage | NOT RUN |
| Core Web Vitals, bundle delta, large-graph stress benchmarks, learner comprehension study | NOT RUN; no performance/comprehension improvement claimed |
| Live Fabric/SQL/KQL/DAX execution, full guide scientific audit, production checks | NOT RUN; no deployment |

Early iterations failed label sizing, accessible-label matching, CSS rendering and
hydration checks. Those defects were corrected before the final passing runs.
The preservation test initially failed while the new successor receipt was unsealed;
the final receipt binds the authorized modifications, and the original checks pass.

Interface review: full review of graph nodes only (React/Next, existing CSS/tokens).
Typography: all 42 labels checked geometrically, representative browser labels
measured. Surfaces: true circles and theme/state/focus screenshots checked. Motion:
hover/reduced-motion tested; 10% replay not performed. Icons: no new icons. Performance:
bounded local layout retained; no measured performance verdict. Local implementation
is accepted within the executed checks; the manual checks above remain unverified.

Primary implementation references consulted: [Motion reduced-motion guidance](https://motion.dev/docs/react-accessibility),
[SVG circle](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/circle)
and [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).
No library version or framework configuration was changed.

## Current Atlas gaps and prioritized continuation

1. **Publication gate:** all 42/49 review records still need named human review.
   Approval and publication remain separate; the normal graph stays empty until
   the existing gates are satisfied. Next atomic content task: review one bounded
   ingestion assertion with its endpoint definitions, conditions and exact evidence;
   record the decision without publishing automatically.
2. **Manual interaction acceptance:** run NVDA and a real touch device against
   concept → relationship → evidence → resource → return, including zoom and dark mode.
3. **Content coverage:** the latest continuation explicitly leaves DAX iterator,
   windowing/information functions; permission variants/sensitivity labels/asset
   management; denormalization/aggregation/null/duplicate handling uncovered. Some
   older expansion “remaining” items were subsequently implemented; do not treat
   that older list as the current queue.
4. **Question QA:** per-question scientific answer/mapping review remains partial;
   98 missing-exhibit questions and earlier conflicting-answer groups stay unresolved.
   No answer or missing exhibit was invented. The timed exam still uses its existing
   validated bank; this change does not expand exam eligibility.
5. **Graph scale and cross-source integration:** fixed-grid edges can cross or pass
   behind other nodes in dense two-hop views. Node circles do not overlap in settled
   layouts. Animated moves may cross paths; no collision-aware engine was introduced.
   The pre-existing 40-node/80-edge cap remains. Statistics continues through its
   separate route; a shared second-source adapter and measured large-graph budgets
   are future work, not established by this design update.

## Reversible handoff

`INTEGRATION_MANIFEST.json` records exact successor hashes and binds the immutable
continuation manifest. `START_BASELINE.json` plus `before/` retain exact pre-change
bytes for the three modified source/scripts and the generated TypeScript cache.
All earlier manifests remain untouched. See `ROLLBACK.md` for selective rollback;
never use a worktree-wide reset against this dirty repository.

Local review only: run `node scripts/preview-atlas.mjs 4193`, then open
`http://127.0.0.1:4193/learn/dp-600/atlas/`. Its server binds to loopback. The default
`out/` deliberately excludes unpublished records. No paid component, service,
new dependency, backend, secret or telemetry was added. Deployment requires the
owner's explicit approval and remains outside this delivery.
