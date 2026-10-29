# 06 — Semantic source-to-scene binding

## Five levels of information integrity
1. Authoritative content: source IDs, keys, relation types, lesson status, verified texts.
2. Normalized graph/state model: stable node/edge IDs; no invented relationships; validation of references.
3. Presentation semantics: explicitly documented mapping from verified property to position/size/material/motion.
4. Rendering: scene adapter and equivalent DOM data view from the same model.
5. Verification: test that user interactions do not mutate or misrepresent authoritative facts.

## Graph edge mapping example
`contains` -> bounded cluster (only for real hierarchy); `depends_on` -> directional pathway; `contrasts_with` -> paired comparison plane; `related_to` -> nondirectional subtle link; `derived_from` -> provenance link; `precedes` -> sequence. Always show legend; never infer semantic link type from visual distance alone.

## Important graph constraint
Hansa Knowledge Atlas is a typed semantic graph, NOT a pure tree. Cycles and multiple inbound edges may exist. A branching animation can visualize a selected traversal, but it must not imply that the underlying model has a unique parent. Distinguish visual spanning-tree expansion from full real graph, and offer all edges in the details panel.

## Learning integrity
- DP-600/PL-300 question approval governs grading eligibility independently from visual presentation. Do not claim AI-proposed answers are scientifically approved.
- Practice progress updates only from real completion events; local visual demos use clearly labeled mock data in isolation.
- Technology comparisons (Shortcut, Mirroring, etc.) must preserve actual differences in storage/refresh/operations; no decorative animation that implies false data flow.
- Windows/SQL code learning: execution trace must match syntax semantics and sample dataset exactly.
- Performance dashboards: axes, units, baselines, rates and denominator remain visible through transitions.

## Geometry contracts
Node radius: neutral unless source field formally encodes magnitude. Edge thickness: not relatedness strength unless source has verified relationship weight. Physical location: convenience layout unless actual geography/spatial info. Color: categorical/semantic meaning with explicit legend. Motion speed: communication only unless mapping documented and substantiated.

## Non-determinism
Use seeded/random-stable layout to avoid a different mental map on every render. No animation-generated pseudo-metrics. Preserve exact original IDs, source coverage, and canonical relationship counts.

## Template semantic manifest
```
entity: OneLake
source_id: <canonical ID>
visual_role: primary node
size_encoding: none (constant)
position: layout convenience (not data attribute)
edges: render approved typed relations only
on_select: setSelectedEntity(source_id)
fallback: semantic list/detail section
```
