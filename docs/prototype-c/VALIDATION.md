# Actual validation — 26 October 2026

**Outcome: working local Prototype C; no deployment. Public release is not approved.**

## Verified results
| Check | Result | Evidence / scope |
|---|---|---|
| Repository access, branch, dirty status, instructions | PASS | `preservation/baseline.json`; baseline records 1,401 paths including the task's bootstrap preservation script, i.e. 1,400 other checkout paths |
| Optimized build + TypeScript + static export | PASS | `npm run build` completed twice; final run exported 124 pages, including `/prototype-c/`; postbuild wrote 118 segment aliases |
| ESLint | PASS | full run and focused new-source check; initial unused import warning removed, final full log in `qa/lint.log` |
| Four configured suites | PASS | `npm run test:all`; 134 tests (62 visualization + 18 statistics + 34 Fabric + 20 content), zero failures; final rerun in `qa/configured-suites.log` |
| Insight + Atlas model/circle tests | PASS | 15 tests, zero failures; includes 5 new insight checks, existing public projection and canonical identity/state safety checks |
| Browser interactions | PASS | `qa/browser-results.json`: 17 acceptance cases at 1440px/light, 390px/dark/reduced-motion and 320px/light/reduced-motion, plus no-JS and old-route checks |
| Automated accessibility | PASS for tested DOM | zero applicable axe violations in each of three reports; no screen-reader certification claimed |
| Runtime/browser errors | PASS | zero page errors in the final browser run |
| No-JS | PASS | complete archive and native scenario explanation remain readable |
| Storage isolation | PASS for stage | sentinel values in four test namespaces unchanged after reveal/deal/reset; isolated test contexts, no real profile cleared |
| Existing old destinations | PASS for HTTP availability | `/work/`, `/experience/`, catalogues, lesson, Atlas, explorer, legacy explorer query, progress and search return 200 locally; not full exam-session E2E |
| Live deployed state read-only | PASS | six public URLs returned 200; `qa/live-snapshot.json`; stage absent; deployment/commit ID unavailable from HTTP |
| Prototype-owned integrity and corruption detection | PASS | 17 owned runtime/script paths; `qa/prototype-integrity.json`; 6 corruption-rejection cases, including baseline/original/cache/owned-content tampering and manifest errors |
| Active agent-reference integrity | PASS | `qa/agent-reference.log` |
| Whole-checkout preservation | FAIL, concurrent work unresolved | three non-owned paths changed during this task; see `preservation/verification.json`, `qa/concurrent-work.json`, `CONCURRENT_WORK.md` |
| Historical Atlas / EasyUI / history chain | FAIL, concurrent work unresolved | after binding the Prototype C and generated-cache changes, the remaining first rejection is `DP600 expansion drift: app/lab/dp-600/explore/page.tsx`; exact hashes below |
| Human editorial publication approval | NOT RUN | all 3 new records stay `technical_review`, normal public insight projection is empty |
| Human screen reader, physical touch, full zoom/forced-color/accent matrix | NOT RUN | required before release; no broad WCAG claim |
| Field CWV, full transitive route transfer and learner effectiveness study | NOT RUN | payload counts below are static file measurements only |
| Root opt-in flag browser run | NOT RUN | isolated `/prototype-c/` is the tested surface; root switch compiles, default `/` remains legacy learning home |
| Sitewide five-item IA rollout | NOT RUN / future scope | demonstrated in prototype shell; other pages retain existing navigation |

## Failures discovered and addressed
- The first archive browser check used an exact implicit-label locator that did not match the select's computed label. The test now selects the native combobox by role; explicit label/control IDs were also added. Final search/topic/empty/reset cases pass in all viewports.
- Visual inspection of the mobile screenshot found the archive search field squeezed beside controls. It now occupies a full row below 640px. The final build and browser rerun include that correction.
- Initial historical checks correctly rejected the authorized homepage/header/footer changes. An exact successor receipt now binds their before/after bytes without rewriting old manifests or test assertions. Normal build regeneration of the historically sealed TypeScript cache is recorded separately as generated state.
- The initial finalizer lint warning was an unused import; removed and rechecked.

## Concurrent work remains explicit
These files changed after the baseline without a Prototype C write:
`app/lab/dp-600/explore/page.tsx`, `components/fabric/unified-bank.tsx`, `lib/search/documents.ts`.

The R11 directory appeared with its own source audit/backup copies. Those backup copies **do not byte-match this task's starting hashes**, so they cannot be accepted as a verified transition from this baseline without further reconciliation. No status or hash was silently waived.

The first historical rejection is:
```text
path: app/lab/dp-600/explore/page.tsx
expected: cf5171ee584501b2c6fd3057724abd5d6ed8e38c95ce385e4e4a395fb1438575
observed: 7cf5cfb3894007d868af46ac99f285fc5aa5fb730d2c4e404633edbd9491f638
```

This is a current integration blocker, not a claim that R11 content is incorrect or that Prototype C destroyed it. Preserve both tasks' work and compose exact successor receipts after the concurrent task finishes. Do not overwrite the three files or rewrite the original baseline to obtain a green badge.

## Payload measurement
Same final static build, `qa/payload-comparison.json`:

| Route | HTML raw / gzip | Explicit JS+CSS references raw / gzip |
|---|---:|---:|
| Baseline-style `/` | 82,668 / 14,147 bytes | 813,802 / 227,878 bytes |
| `/prototype-c/` | 59,396 / 11,990 bytes | 813,802 / 227,878 bytes |

Both documents reference 12 JS/CSS files. This includes shared assets and preload references and is not a network/CWV benchmark or a claim that the stage adds zero transitive bytes. No new package is installed. The root switch statically imports the component; a future promotion should compare route chunks without assuming tree-shaking removes all optional code. No performance win beyond the measured document difference is asserted.

## Visual review
Desktop light and mobile dark screenshots were inspected. Hierarchy, reading order, card text, Atlas pending state, footer scope and responsive stacking are visible. The final screenshots include the mobile search layout fix. Motion-specific slow replay is not applicable to new stage choreography because no new choreographed motion is implemented; inherited shell/theme animation is not fully audited.

## Completion boundary and next action
The requested local prototype and agent-ready design/implementation pack are delivered. Keep publication disabled. Next: reconcile the independently changed R11 files and shared receipts, rerun whole-checkout gates, then human-review the three new insight records and the design. No old bank answers, IDs, progress or review status were changed **by Prototype C**. Other concurrent work is separately recorded rather than claimed preserved byte-for-byte by this task.
