# Hansa Ingestion Lab — release review, 25 October 2026

> Current outcome: this release was approved, deployed and live-verified on 25 October 2026. See DEPLOYMENT_REPORT.md and qa/live/ for the final production evidence. The sections below retain the pre-deployment review/testing context.

The first DP-600 Academy experience is implemented and its local release candidate is prepared for owner review. No deployment, traffic change, commit or push has occurred.

## Exact candidate

| Item | Verified value |
|---|---|
| Release | hansa-dp600-ingestion-d1eb29b03dd3 |
| Scope | Academy entry + first Ingestion Decision Lab; not the full academy |
| New routes | /learn/dp-600/ and /learn/dp-600/ingestion/ |
| Worker/account | hansa / b84c4bfbf06e399ceb5f5267f87cb37e |
| Last-read active version | 2e8528b1-8fed-4be7-9ebd-728c17c7f5ce at 100% |
| Cloudflare baseline read | 2026-10-25T17:12:58.244Z; GET only |
| Candidate assets | build/releases/hansa-dp600-ingestion-d1eb29b03dd3/assets |
| Files/bytes | 1,052 actual files; 45,013,814 bytes |
| Artifact SHA-256 | d1eb29b03dd3e413433443270e2e0d8cd22b6327e42e6cc63c8bfbf4e1220935 |
| Manifest | Same release folder, RELEASE_MANIFEST.json; every file has its own hash |
| Product input snapshot | 345 source/config files checked against the build inputs/current working files |
| Added packages/services | None; no new paid resources or student-data endpoints |

The current Cloudflare version is newer than previously reported 9ead92a4. Refresh the active baseline immediately before any approved deployment; another agent/user could publish meanwhile. A recorded version is a rollback reference, not proof that rollback execution has been tested.

## What the learner gets

Explanation/comparison → worked decision → prediction → adjustable architecture constraints → reasoned fit/rejection → three original transfer cases → confidence/review journal → reflection and links to the existing bank. Feedback, hints, retry, reset, local progress and JSON import/export work. A manual JSON backup remains available if browser downloads are blocked. The final trusted-localhost Chrome test saved a real download and read it back successfully; earlier download cancellations are retained as historical test evidence.

Native controls, text reasoning, current Microsoft citations, light/dark tokens and responsive layouts reuse Hansa's current design system. No fake Fabric runtime, full-book redistribution or official-exam claim. No change to 834 existing Fabric questions/keys, 60 general questions, quiz engines or their progress namespaces. The three integration points are purely additive and have exact dirty-state rollback copies.

## Final evidence

| Validation | Result |
|---|---|
| Unit/content suites | PASS: 137/137 |
| Root TypeScript + feature lint | PASS |
| Source + reference integrity | PASS;67 pages and 2,724 lines structurally mapped; 13 active-reference hashes |
| Isolated static export | PASS;121 generated pages, 115 segment aliases |
| Lesson browser suite | PASS: 16/16; actual JS/CSS/HTML in Chrome |
| Existing Fabric regression | PASS: 4/4: hub/modes; guided answer/bookmark survive academy reset; mock answer/order/deadline survive refresh; no runtime errors |
| Accessibility automation | PASS: no axe WCAG-tag violations in lesson main at 320/390/1280, light/dark; no horizontal overflow |
| Visual review | Focused mobile controls and desktop dark backup screenshots inspected; full light/dark screenshots retained |
| Static route/asset checks | PASS; both new routes, links/anchors/assets, catalogue/sitemap;116 prior exported HTML paths retained |
| Raw guide exclusion | PASS; no guide PDF/page previews/raw extraction in candidate |
| Wrangler deployment dry run | PASS; assets-only, no bindings, explicit dry-run exit; no upload |
| Source/candidate fingerprint | PASS; source hashes current; frozen copy per-file parity checked |

Machine evidence: qa/release-validation.json, qa/browser-results.json, qa/legacy-browser-results.json, qa/export-results.json, qa/wrangler-dry-run.log, qa/build-source-manifest.json. Browser test transport serves the actual export through request interception because host loopback is restricted. It is real browser UI/runtime testing, not a Cloudflare delivery test. No runtime errors or external requests occurred in the lesson suite.

Wrangler logs “Read 1554 files”; independent filesystem enumeration finds1,052 files + 502 directories. The release manifest uses actual files and bytes rather than that CLI read count.

## Limits to review before approval

- Standard Turbopack npm build remains blocked by this sandbox's child-process behavior. The isolated build uses installed webpack/Tailwind, cached real fonts and a validation-process mkdir adapter. Product config and root out/ remain unchanged. This environment-specific build path is disclosed; no claim that ordinary production CI was fixed.
- Live website HTML/assets could not be retrieved through available network tools. Cloudflare account/version information is independently verified by API, but live before/after behavior is not. Post-deployment delivery verification is still required after approval.
- Human screen reader, physical Android/iOS/touch and CWV/Lighthouse measurement are NOT RUN. Automated checks and screenshot review do not establish full WCAG conformance or learning effectiveness.
- Only ingestion passages on guide pages 9/10/25/56 were reviewed for this pilot. Full-book scientific conversion,50 guide-question QA/merge, Warehouse/star-schema and Direct Lake pilots remain future work. No unreviewed book questions are promoted here.

## Approval boundary and subsequent execution

The original owner instruction requires explicit approval before production deployment/push. “Keep progress to deployment” was applied to local implementation, testing, packaging and read-only account checks; no production authorization was inferred.

If approved for this first Ingestion Lab candidate: recheck live version and artifact hashes, use the exact frozen assets directory with the existing hansa assets-only configuration, preserve the recorded active version, deploy once, then verify both new routes plus legacy paths/assets/404s and inspect browser errors. Do not switch worker/account, introduce bindings, deploy source archives, or run npm deploy against stale root out/. Any rollback is a production change and must remain within that approved release/recovery scope.

Local reconstruction commands, from repo root:

```powershell
node scripts/build-academy-preview.mjs
node scripts/validate-academy-release.mjs
node scripts/prepare-academy-release.mjs
```

These commands build, test and package only. None performs a real deployment. Regeneration can produce a different artifact hash; review the new manifest rather than reusing this candidate's approval blindly.
