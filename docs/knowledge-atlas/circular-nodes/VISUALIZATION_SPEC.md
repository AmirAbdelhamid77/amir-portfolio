# Circular concept nodes — 26 October 2026

Scope: the existing DP-600 Explorer graph only. Source: the three existing
content/atlas JSON layers, projected through unchanged publication rules.
Objective: select a canonical concept, distinguish its explicit prerequisites and
related concepts, then read conditions/evidence or navigate to a real resource.
Audience: DP-600 learners. Representation: sourced semantic diagram; position and
circle size encode no importance, confidence, mastery or prerequisite order.

Reuse the native SVG renderer, HTML inspectors and connection list. No installation,
backend, service cost or graph-engine change. Alternatives scored 0–5 under the
30/25/15/15/10/5 policy weights:

| Option | Correctness | Teaching | Interaction | Mobile | A11y | Maintenance | Weighted |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Existing SVG with responsive circles + linear fallback | 5 | 5 | 4 | 4 | 4 | 5 | 4.60 |
| Linear list alone | 5 | 4 | 3 | 5 | 5 | 5 | 4.45 |

Choose SVG plus the retained list because the owner requests a graph and spatial
connections supplement the evidence list. Existing rectangular controls/cards stay
unchanged. No beUI component is selected or installed; the local renderer already
provides the required capability.

Controls: select via pointer, Enter or Space; inspectors retain evidence and resource
links. Existing URL filters, pan, zoom, Fit and Reset remain. Responsive columns reserve
space for the maximum label-derived radius and focus/hover rings. Mobile remains
list-first, with an optional vertically scrollable map; no drag-only actions. Label
wrapping and circle sizes depend on text, never selection, so selection does not
resize nodes. Full titles remain in accessible names, SVG titles and the inspector.

Motion: short interruptible position/edge transitions maintain context; hover/press
feedback remains subtle, with static state labels and rings. Reduced motion removes
transitions and scaling. Prerequisite means only an explicit outgoing
requires_understanding_of relation from the selected concept. Other visible adjacent
nodes are related; two-hop context is neutral. Filters do not erase prerequisites.

Validation: geometry/unit checks, publication/state regression tests, typecheck,
lint, static build; browser circle/label geometry, keyboard/inspector, mobile/touch,
dark/light, reduced motion, history/reset, no overflow, Axe where possible.
No scientific re-review or source reimport is part of this presentation change.
