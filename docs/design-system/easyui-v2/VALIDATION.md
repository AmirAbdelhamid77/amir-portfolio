# Validation — 25 October 2026

Local export only. Build: PASS (121 generated entries; 115 segment aliases). Lint: PASS, zero warnings. Standard test:all: PASS, 129/129 (62 Data Visualization, 18 Statistics, 29 Fabric, 20 Content). Academy explicit test run: 10 PASS, 1 FAIL; seven existing domain tests and three new comparison tests pass. The historical preservation snapshot test fails on package.json, already different from its old snapshot before this task; current package hash equals this task's preflight hash. No test baseline was silently updated. Total unit tests: 139 PASS, 1 pre-existing FAIL.

Browser: PASS — 1280 light, 320 light/reduced motion, 390 dark/reduced motion; keyboard search/checkbox/reset, filtering and empty state, existing prediction, unchanged three storage values, no document overflow, no page errors, zero scoped axe violations. No-JS retains all definitions at 320px; print restores all four rows regardless of filters. Screenshots inspected at all three widths/themes. Search minimum width was added as a regression assertion after visual review exposed excessive shrinking at 390px.

Human screen-reader, physical mobile/touch, full-site WCAG audit, CWV/Lighthouse, upstream component runtime matrix, real Fabric execution and live Cloudflare delivery: NOT RUN. Headless Edge touch/viewports are emulation. No custom motion was introduced, so slow-motion playback is not applicable.

## Focused interface review (quick)

Scope: new comparison only, React/Next with existing Tailwind semantic tokens.

| Category | Inspected evidence | Result |
|---|---|---|
| Typography | 320/390/1280 screenshots, table and mobile definitions | Readable wrapping; source labels retained |
| Surfaces | Search/input/reset/checkbox, borders and focus | Narrow search fixed and retested |
| Animations | New source and reduced-motion browser contexts | Static; no animation dependency |
| Icons | New source | No icons introduced |
| Performance | Export script asset byte/gzip comparison | See measured result below; no CWV claim |

| Severity | Location | Before | After | Why |
|---|---|---|---|---|
| MEDIUM, resolved | PatternComparison search controls, 390px | Flex row could shrink search to about 45px | Full-width mobile search row; browser asserts >=220px | Readable input and adequate touch surface |

Considered/rejected: upstream pricing shell (incorrect teaching metadata and div-only comparison); virtualized beUI table (four criteria do not justify virtualization); Product Tour (no demonstrated onboarding gap).

Component verdict: local functional/visual checks PASS within stated scope. Overall repository gate remains qualified by the pre-existing Academy snapshot failure and NOT RUN human/device checks; no deployment approved or performed.

## Bundle measurement

Initial lesson scripts: 643,853 → 650,111 raw bytes; 198,682 → 200,334 gzip bytes. Delta **+6,258 raw / +1,652 gzip bytes**. HTML delta +4,849 bytes. Method includes shared script assets; local gzip size is not a network/CWV measurement. No dependency added.

## Integrity

Run `node scripts/verify-agent-reference.mjs`, `node scripts/verify-knowledge-atlas.mjs`, and `node scripts/verify-easyui-integration.mjs`. The Atlas successor exception is path-and-hash bound, preserves old baseline bytes, and does not approve any semantic edge or a graph renderer. Check logs provide exact final command results. Rollback payload restores only five task-owned modified existing files after matching after-hashes.

Observed final results: agent-reference PASS; EasyUI successor PASS (41 owned hashes and 1,169 unrelated starting hashes). Atlas semantic tests PASS (16 rejection cases and second-book canonical reuse). Its old baseline had 90 paths absent at their recorded locations before this task; 67 now resolve to byte-identical relocated copies through explicit SHA-bound aliases, without changing baseline bytes. The remaining 23 historical tmp-registry snapshots remain unavailable. The full Atlas verifier now stops at its pre-existing package.json hash discrepancy, also exposed by the Academy snapshot test. No package/source baseline was waived; reconcile old snapshots before claiming full historical integrity.
