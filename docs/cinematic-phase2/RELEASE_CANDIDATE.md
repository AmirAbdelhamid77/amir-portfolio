# Hansa Phase 2 — local release candidate, 28 October 2026

Implemented in `D:\BeUI\amir-portfolio` on the existing canonical `/`. No deployment, installation, reset, stash, clean, commit or new prototype. `/prototype-c/` still renders the same canonical component.

## Result

Editorial Observatory: asymmetrical typographic stage, layered SVG source/assumption instrument linked to the real decision model, dimensional drag/momentum date rail, genuine beUI arc/flip deck with readable inspectors, phone-specific single-card slot, exact model table/reset, and honest review-pending Atlas context. These are 2.5D DOM/SVG surfaces; no world-space WebGL claim.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Build / static export | PASS | checks/build.log; 126 generated build entries, 121 HTML routes |
| Typecheck / lint | PASS | checks/typecheck.log; checks/lint.log |
| Unit/domain/regression | PASS, 196/196 | checks/test-all.log (62 + 18 + 34 + 32 + 25 + 25) |
| New browser matrix | PASS, 126/126 | evidence/qa/results.json |
| Canonical compatibility browser | PASS, 45/45 | evidence/regression/qa-canonical-home.json |
| Existing static canonical verifier | PASS | checks/canonical-integrity.log; 121 routes HTTP 200; 117 sitemap routes |
| Search EN/AR + Fabric shard | PASS, 11 checks | checks/search.log |
| Automated A/AA axe | PASS in sampled states | 10 viewport/theme runs plus expanded state: zero violations |
| New bound receipt / negative tests | PASS | checks/cinematic-integrity.log; checks/receipt-negative.log; 6 corruption cases rejected |
| Unrelated starting bytes | PASS, 6,067 file hashes preserved | preservation-check.json; zero unexpected changes |
| Spatial visual self-review | TESTED_LOCAL; owner approval PENDING | before/after at 320/390/768/1280/1440, light/dark; actual video |
| Provisional throttled LCP target | FAIL against 2.5s target | Median 3.144s at 390px / 2.716s at 1440px; measurement harness completion does not mean budget PASS |
| Atlas approved relation focus | BLOCKED_PUBLICATION | No approved public graph was fabricated or enabled |
| Whole-project historical reference verifiers | FAIL — preexisting drift | checks/references.log (AGENTS size), checks/atlas-integrity.log (AGENTS), checks/preservation-chain.log (package.json) |
| Real device / human screen reader / field CWV | NOT RUN | Automation and local metrics do not certify these |

The historical failures are not hidden or baselines regenerated: the exact current AGENTS SHA-256 `c88fb70317e087fca71b79ea759fd28cca585d71c3160858abed9886c78acda3` and package SHA-256 `18cf9597ff8d574df1c64a020efa525ab6a599e2ee65139dca2104932b5b9832` already appear in this task's initial dirty baseline and are unchanged. They require a separate evidence-based reconciliation. This candidate is locally reviewable, not an unconditional production GO.

## Measured performance

Three cold browser contexts per width, Edge 156.0.4314.42, 4x CPU slowdown, 200,000 bytes/sec download and 75ms network latency, local static server transferring uncompressed resources. These are viewport profiles, not physical handsets. Measurements: `{"390": {"medianLCP": 3144, "maxLCP": 3152, "maxCLS": 0, "worstP95FrameMs": 200.10000000000036}, "1440": {"medianLCP": 2716, "maxLCP": 2796, "maxCLS": 0.008679158997503001, "worstP95FrameMs": 100.10000000000036}}`. The provisional 2.5s LCP target is **not met**. LCP/CLS are synthetic local observations, not field certification. Event Timing is recorded as a diagnostic and is **not claimed as field INP**. rAF p95 and >34ms gaps include scripted scrolling/host load/throttle and are not GPU-only drop counts. See evidence/performance/lab.json for raw samples and limitations. Initial before/after unthrottled values are also in each capture.json; they are single samples, not a controlled performance improvement claim. Whole-page performance optimization remains a follow-up before an unconditional production GO; no crash or missing essential interaction occurred.

## Visual findings and corrections

- First upgraded hero pushed the rail too low: constrained instrument to 500px so the entire temporal rail is visible at desktop opening.
- The new solid model surface exposed preexisting `text-muted-foreground/70` labels at 3.36:1 in dark: removed the extra opacity; final axe results are clean across all tested widths/themes.
- At 390px the three-card hand crowded labels: widened the single-card responsive breakpoint to tray <420px, preserving backing edges and explicit previous/next controls. Actual mobile reader screenshot verifies readable expansion.
- A test initially counted Lucide navigation arrows as Atlas edges: corrected the test to count non-icon graph SVG paths; no graph source/publication rule was weakened.
- Rollback source files initially used .tsx extensions and entered the existing compiler's broad include: renamed preserved byte copies to .snapshot; no compiler exclusion or original source was weakened.

## Recordings / scope limits

Before evidence consists of original first-frame screenshots plus actual deck/rail interaction PNG sequences at desktop/mobile; these are not a continuous real-time before movie. After MP4s are actual CDP compositor screencasts encoded with their original timestamps. The recordings show entry, shared model input/reset, rail drag/settle, reveal, deal/flip/inspect/close/collect and the pending Atlas. Screenshot sequences have capture overhead and cannot measure FPS.

The supplied canonical ZIP and nested previous visual blueprint were recovered from Downloads. Spatial skill installation compared 38/38 source files byte-for-byte identical to the supplied nested archive: NOOP. Both skill verifiers passed. 117-route historical CSV informs preservation/taxonomy only; current source/static HTTP verification independently reports 121 exported HTML routes. No question bank, answer, source record, canonical route, learner store, global token, deployment config or skill file was changed.

## Deliverables and rollback

ART_DIRECTION.md, COMPONENT_CONTRACTS.md and ROLLBACK_AND_REPRODUCTION.md document composition/state/props/source/API/license/budgets and exact review steps. INTEGRATION_MANIFEST.json records before/after hashes and original bytes; PHASE2_ONLY.patch contains only this task's source changes, not the entire dirty Git diff. STATIC_EXPORT_SHA256.json freezes 948 output files. The generated canonical verifier evidence JSON is the one older generated evidence artifact refreshed by an existing test; it is explicitly named in preservation-check.json. Full source/content audit of unrelated courses and human scientific approval are not claimed.

For rollback compare each current file with its recorded after-hash and restore only its bound .snapshot; if later edits differ, inverse-merge. Rebuild generated TypeScript cache. Preserve all unrelated dirty work. Owner reviews composition and recordings next; deployment still needs fresh explicit approval.
