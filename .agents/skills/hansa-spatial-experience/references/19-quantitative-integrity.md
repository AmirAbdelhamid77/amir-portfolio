# 19 — Quantitative integrity in spectacular visualization

## Why special rules are necessary
Three-dimensional columns, perspective and occlusion can distort perceived magnitude. Textures, area, volume, lighting and camera distance can bias visual reading even when underlying values are accurate. Never substitute 3D glamor for proper axis, baseline, scales or uncertainty notation.

## Rules
- For numeric comparison, use 2D chart/table as authoritative and visually prominent view; 3D may be an auxiliary explanatory experience.
- If using 3D for genuinely spatial data (x,y,z measured), label dimensions, units, origin, interpolation and controls. Preserve coordinate fidelity and equal axis meaning.
- Time travel and animated transitions require explicit date/period, denominator and comparable scale throughout.
- Avoid changing marker volume for linearly encoded magnitude without explaining nonlinear perception.
- Show missing/null/estimated data distinctly. Never animate unknown values as confirmed.
- LOD/occlusion must not make filtered totals appear to change silently; show count and filter state.
- Data mapping and rates should be automated/tested from canonical source; no random mock KPI treated as real.

## Examples
Revenue comparison: exact 2D bars/line, not 3D extruded bars whose tops hide. OneLake architecture: 3D dataflow concept model okay, but packet speed does NOT assert throughput. Distribution: 2D histogram for frequency and optional 3D view only if third dimension meaningful. Real spatial point clouds: true 3D warranted with camera and orientation helpers.

## QA
Check data reconciliation, units, denominators, sort order, labels at zoom/mobile, source citations, table equivalents, transitions of scales and statuses. Add test snapshots for fixed fixture values.
