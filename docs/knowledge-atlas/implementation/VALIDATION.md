# Final Atlas validation — 26 October 2026

| Gate | Observed result |
|---|---|
| Standard unit tests | PASS — 129/129 |
| Academy + Atlas model tests | PASS — 18/18; total 147/147 unit tests |
| Model rejection cases | PASS — structural edges, missing evidence/conditions/endpoints, invalid direction, duplicates, aliases, unsafe resources, unauthorized publication |
| Historical contracts/reference/EasyUI | PASS; original snapshots retained with exact successor hashes |
| Source evidence | 4/4 official Markdown snapshots retrieved and hashed; source section locators retained |
| Source preservation | PASS; 1,243 unrelated starting files byte-identical; 13 authorized existing files recorded with before/after hashes |
| Browser | PASS — 14 grouped checks across 1440 light, 320 dark/reduced motion, 390 light/reduced motion |
| Interactions | Search/Arabic aliases, filter intersection, incoming direction, map node keyboard activation, pan/zoom/Fit, focus, exact lesson return, Back/Forward state, journey answer/reflection/reload/reset |
| Existing progress | Three legacy storage values unchanged after Atlas/journey/reset; original Fabric and lesson engines/storage/data byte-preserved |
| Corrupt/denied storage | PASS — corrupt journey preserved; denied storage retains in-memory interaction without claiming saved progress |
| Accessibility/reflow | Zero scoped axe WCAG-tag violations in tested Explorer states; no horizontal overflow at tested widths; complete no-JS linear definitions/conditions/evidence |
| Landing cleanup | PASS — no professional/project/experience links in rendered home or its server HTML; corresponding legacy routes still return 200 |
| Static builds | PASS — local review and normal public export, 123 generated entries, 117 segment aliases |
| Publication separation | PASS — normal public output has no unpublished relationship claims; separate loopback preview contains all 9 source-reviewed assertions |
| Packages/hosting | Unchanged package/lock, Next static export and assets-only Workers configuration; no new dependency/service |

Human screen reader, physical mobile/touch, native browser 200–400% zoom usability, field CWV, complete-book scientific review and deployment: NOT RUN. The 2,000-concept selector measurement is a synthetic Node test, not a browser-layout or learning-effectiveness benchmark.

## Focused interface review

React/Next with the existing Tailwind semantic light/dark tokens. Typography: inspected desktop/mobile screenshots, concept labels and source text. Surfaces: existing rounded panels and 44px controls. Animation: no custom motion; reduced-motion paths tested. Icons: existing shared icon family; graph meaning uses labels/direction, not color alone. Performance: bounded native SVG and local selectors; per-route asset sizes recorded in `qa/PAYLOAD.json`.

Confirmed fixes during testing: explicit names on source/relationship selects; directed arrowheads terminate outside node rectangles; mobile concept/edge selection scrolls to the Inspector; complete no-JS list includes all definitions/conditions/evidence; temporary negative-test fixtures moved outside the TypeScript source tree to keep static builds reproducible. Original generated fixture was removed only after verifying its exact owned contents and resolved path.

## Scope and remaining review

This is a working ingestion vertical slice: Peek, Explorer and Guided Journey. Eight concepts/nine assertions, not the full guide. Technical source review is genuine but not human approval. Candidate records remain excluded from normal public export. The populated local review artifact must not be deployed. Local navigation uses `http://localhost:4191` to preserve the user's existing origin/storage; the server listens only on 127.0.0.1.
