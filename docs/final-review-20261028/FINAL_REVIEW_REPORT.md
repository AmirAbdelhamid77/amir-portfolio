# Hansa — final local visual review candidate, 28 October 2026

The existing canonical homepage and content remain intact. This follow-up improves loading, reconciles historical verification drift through explicit evidence, and extends Atlas. No Cloudflare deployment, package installation, dependency change, Git reset/stash/commit, route duplication or scientific-status promotion occurred.

## Verified outcome

- Performance: scope KaTeX styling to real math consumers; limit Tailwind detection to live app/components/lib/content; stop preloading the small mono labels ahead of editorial text; memoize the real timeline/instrument and graph neighborhood/layout/search; avoid per-pointer bounding-box reads. Static SVG/CSS/Motion composition remains; no WebGL dependency.
- Atlas public experience: searchable 32-record Microsoft Learn bibliography, selected source/section/provenance folio, ?reading permalink and Back/reset, official links and real local lesson/practice continuations, full no-JavaScript source links. Source dates are explicitly inherited. Bibliographic position asserts no semantic relationship.
- Atlas local review: preserve circular nodes, candidate IDs and typed relations; visible selected relationship label and endpoint rings; Escape restores origin focus; out-of-focus URL edges do not populate an unrelated inspector; memoized camera behavior; bounded navigator list and map height on small screens.
- Historical integrity: seven exact, recovered before/current transitions. Current AGENTS/package/private intake rules and content retained. Token/AST/JSON policies validate the narrow evolution; frozen original and Phase 2 manifests stay unchanged. Old touch exports restored additively for compatibility. Resealing arbitrary dependency changes still fails the explicit policy.

## Test matrix

| Gate | Status | Evidence |
|---|---|---|
| Build/static export | PASS | checks/build.log |
| Type check | PASS | checks/typecheck.log |
| Lint | PASS, zero errors; one inherited unused-import warning in old phase2-capture.mjs | checks/lint.log |
| Unit/domain tests | PASS 196/196 | checks/tests.log |
| Academy oracle/preservation | PASS 8/8, including 72 decision states | checks/academy.log |
| home | PASS 126/126 | evidence/home/results.json |
| canonical | PASS 45/45 | evidence/regression/qa-canonical-home.json |
| atlas | PASS 245/245 | evidence/atlas/results.json |
| routes | PASS 137/137 | evidence/routes/results.json |
| English/Arabic search and lazy Fabric index | PASS 11 checks | checks/search.log |
| Out-of-focus relation URL and selected endpoints | PASS 8/8 | evidence/atlas/focused-results.json |
| Reference/package verifier | PASS | checks/references.log |
| Original preservation chain | PASS, 6 negative cases | checks/history.log |
| Knowledge/Atlas integrity/publication | PASS, 16 rejection cases | checks/knowledge-integrity.log |
| Existing integration contracts | PASS, 1169 prior-file contracts | checks/integration.log |
| New successor corruption/policy rejection | PASS, 17 cases | checks/final-negative.log |
| Gallery/image controls, six video decodes and delivery links | PASS 22/22 | checks/delivery-gallery.json |
| Unrelated starting files | PASS, 2103 unchanged hashes; zero unexpected changes | PRESERVATION.json |
| Human visual acceptance | PENDING | Review gallery and actual recordings |
| Scientific publication of connected graph | BLOCKED_APPROVAL | Default public concepts/edges remain 0/0; local review 42/49 |
| 2.5s throttled LCP target | FAIL_MOBILE | performance/after.json |
| Guaranteed 60fps / physical devices / human screen reader / field INP | NOT CERTIFIED / NOT RUN | See limits below |

Browser checks cover 320/390/768/1280/1440, light/dark, touch emulation, keyboard, focus return, reduced motion, model/deal/collect/flip/reader, canonical/legacy query/hash, archive, search and progress. Thirty viewport/theme axe runs across home/public Atlas/local-review Atlas plus expanded home states reported zero automated A/AA violations. This is not a full manual WCAG 2.2 AA certification.

## Performance: measured result and limits

Same uncompressed loopback server, Edge, 4x CPU, 200000 B/s download and 75ms latency. Follow-up baseline is one actual preflight sample per width; final results are three samples per width. They are not statistically equivalent populations and host scheduling adds variation.

| Viewport | Preflight LCP, 1 sample | Final LCP median, 3 samples | Final range | Maximum CLS |
|---|---|---|---|---|
| 390 touch emulation | 3.288s | 2.704s | 2.596–3.140s | 0.0000 |
| 1440 desktop | 2.664s | 2.332s | 2.312–2.800s | 0.0334 |

Root utility stylesheet approximately 153kB → 145.6kB uncompressed, plus removal of ~28kB KaTeX styling from the cold homepage. Math rendering, KaTeX fonts and accessible MathML passed a separate real-page check. The initial JS remains ~761kB in the raw server profile; this patch does not claim a large JS reduction. Retaining the genuine motion primitives and source-backed content was prioritized.

The provisional 2500ms mobile target remains unmet; desktop has variability too. The separate original pacing harness (non-touch viewport profiles, scripted scrolling+instrument+deal, 4x CPU) shows p95 rAF gaps 50.1–133.4ms at 390 and 83.4–166.7ms at 1440. These include scroll/host/throttle work and are not a GPU-only frame-drop count. No universal smoothness/60fps PASS is claimed. Capture/video runs and the main three-sample LCP run were separate; the pacing run overlapped short video encoding near its beginning, so it is diagnostic, not a controlled comparative motion benchmark. Event Timing durations are diagnostics, not field INP. No real handset, thermal, field CWV or human assistive-technology session was run.

## Historical reconciliation and preservation

Original snapshots were recovered from matching prior local build captures and Git HEAD and bound by their original SHA-256. AGENTS has only the installed creative-skill append; package only adds the enumerated existing test/intake scripts; .gitignore only adds private intake protection; old globals only appended scoped stage rules; ESLint only ignores archived registry scratch copies; the hover hook differs only in formatting/comments; touch retained export bodies match the originals. The two earlier touch exports are now restored additively. The preexisting runtime additions missing from the oldest baseline are individually inventoried with preserved bytes. They do not acquire scientific approval.

Exact transition hashes, recovery paths and captured bytes: HISTORICAL_RECONCILIATION.json and history/. Current changes: INTEGRATION_MANIFEST.json and FINAL_REVIEW_ONLY.patch. Original Phase 2 manifest, root package, AGENTS, lockfile, all content files, answer keys, IDs, progress schemas and publication states are preserved. The new manifest is a reviewed successor rather than a replacement historical baseline. All current verifier commands now pass; prior reports in docs/cinematic-phase2 remain immutable historical evidence and correctly describe their earlier failures.

The legacy canonical verifier refreshed its fixed older evidence path. Its original JSON was restored byte-for-byte against the preflight SHA-256 using the recorded prior port/timestamp; the new current-run report is retained separately at checks/canonical-static-current.json. GENERATED_EVIDENCE_RECOVERY.json records the recovery. The older generated report is included in the unchanged-file count; no preservation exception was introduced. Gallery serving was hardened for missing favicons and HEAD requests; all final gallery/video/link checks passed afterward.

## Component/state contract

| Component | Inputs/state | Behavior |
|---|---|---|
| AtlasPendingDesk | sources: id/title/url/locator/checkedAt; notice | Local search; selected ID synced to ?reading and popstate; reset removes only reading; no learning-storage writes |
| getAtlasReadingSources | existing bibliography only | Public-link + exact learn.microsoft.com host; strips graph claims/edges/catalogue; 32 inherited records |
| AtlasExplorer | existing Atlas projection; existing View | Memo neighborhood excludes camera/edge; selectedEdge must be inside slice; focus origin restored on Escape; existing list/filter/source/URL contract retained |
| InsightStage/rail/instrument | existing real editions/model; stable callbacks | Memoized rail events and derived view; existing date/query/drag/spring/card state contract retained |
| MathBlock | unchanged TeX/alt/display contract | Same build-time KaTeX/MathML; stylesheet loaded with real consumers |

Reading desk states: initial → query → filtered list/empty; choose → selected folio + URL; Back/Forward → URL selection; reset → default folio and empty search. Review graph states: concept focus → visible edge → inspector with conditions/evidence + endpoint rings → Escape → origin focus/concept; filters always clear edge; camera only changes existing zoom/pan. No URL can enable candidate projection in a normal build.

## Reproduce / compatibility / rollback

Normal site: http://127.0.0.1:4318/ ; public Atlas /learn/dp-600/atlas/. Explicit isolated local review: http://127.0.0.1:4320/learn/dp-600/atlas/. REVIEW_ARTIFACT.json records its separate directory and proof that normal out/ stayed byte-identical during its build. The normal candidate contains only the public projection. Do not deploy the review artifact.

Commands from the repository, prefixed with rtk as required: `rtk npm run build`; `rtk npm run test:all`; `rtk proxy node scripts/verify-agent-reference.mjs`; `rtk proxy node scripts/verify-preservation-history.mjs`; `rtk proxy node scripts/verify-knowledge-atlas.mjs`; `rtk proxy node scripts/verify-easyui-integration.mjs`; `rtk proxy node scripts/final-review-negative.mjs`. Browser runners are final-review-home-qa, final-review-canonical-qa, final-review-atlas-qa, final-review-route-qa, all .mjs under scripts; run against the corresponding loopback servers. Atlas review is built by final-review-build-atlas.mjs in a separate directory; it never replaces normal out/.

To undo only this follow-up, compare each current owned hash with INTEGRATION_MANIFEST first, restore the corresponding before/*.snapshot only for owned existing files, remove only newly introduced owned files, and rebuild normally. Keep the old Phase 2 package and all preexisting dirty work. Do not reset/stash the repository or revert AGENTS/package to an obsolete historical snapshot. If any owned file changed after this manifest, merge manually rather than overwriting it.

## Owner visual acceptance

Open the gallery at all five widths and both themes. Check the editorial depth, paused 3D instrument, physical timeline settling, real model response, card flight/flip/read/collect, mobile reading sheet, Atlas source folio and real review graph. Confirm text/edge labels/focus remain readable and motion feels deliberate. Artistic acceptance is yours; this candidate is ready for that review and is not an unconditional production GO. Graph publication still requires its separate scientific approval. No Cloudflare operation has been executed.

Evidence is current captured output. Prior Phase 2 screenshots serve as the homepage visual baseline; the new follow-up preflight source/hash baseline is exact. An Atlas-specific before video was not recorded before this follow-up and is NOT claimed; its exact old renderer/page bytes are retained in before/ for reliable reconstruction in a separate checkout.
