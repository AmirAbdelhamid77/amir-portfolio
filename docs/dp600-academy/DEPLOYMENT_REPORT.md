# Hansa Ingestion Lab — deployment verified, 25 October 2026

The owner-approved first Ingestion Lab release is live at https://hansa.amir-portfolio.workers.dev/learn/dp-600/ingestion/ . Academy entry: https://hansa.amir-portfolio.workers.dev/learn/dp-600/ . No Git commit or push was performed.

| Item | Verified value |
|---|---|
| Worker / account | hansa / b84c4bfbf06e399ceb5f5267f87cb37e |
| Active version | 937389a8-3e03-403d-a7a4-a75910c972c0, 100% traffic |
| Deployment ID | f91e0a62-802c-4ad3-9aac-93bfdde57c89 |
| Deployment time | 25 October 2026, 20:31 Cairo (17:31 UTC) |
| API confirmation | 2026-10-25T17:35:37.301Z |
| Previous version / rollback reference | 2e8528b1-8fed-4be7-9ebd-728c17c7f5ce |
| Release | hansa-dp600-ingestion-d1eb29b03dd3 |
| Artifact SHA-256 | d1eb29b03dd3e413433443270e2e0d8cd22b6327e42e6cc63c8bfbf4e1220935 |
| Frozen assets | 1,052 files; 45,013,814 bytes; all local hashes rechecked after deployment |
| Asset upload | 630 changed assets uploaded, 421 reused; full filesystem count is recorded separately |
| Bindings / new services | None; existing static-assets architecture retained |

## What was published

Only the reviewed full-site snapshot containing the additive academy entry, first Ingestion Decision Lab, catalogue/nav links and sitemap additions. Explanation, prediction, constraint exploration, all-option feedback, three original transfer cases, hints/retry, local progress, JSON download/import/manual backup and review journal are included. The 834-question Fabric bank, answer keys, legacy engines and source content retain their verified working-file hashes. No guide PDF, raw page extraction, previews or unreviewed guide questions were published.

Before publishing, the 345 source/config fingerprints and all 1,052 frozen asset hashes matched the approved candidate. The active Cloudflare version was refreshed and still matched the recorded rollback reference. The user explicitly approved this release with “I approve”.

The first sandbox CLI attempt failed before upload because its expired token could not be refreshed over the restricted network. The alternate supported local runtime reached Cloudflare, refreshed the existing session internally, and completed Wrangler with exit code 0. No credentials were requested in chat, printed or added to project files. Public deployment/version state was independently confirmed through the connected Cloudflare API. No second deployment or rollback was needed.

## Live verification

| Check | Result | Evidence |
|---|---|---|
| Active version / 100% traffic / no bindings | PASS | Connected Cloudflare deployments + settings GET |
| 115 reader-facing HTML routes | PASS: exact approved-artifact hashes | qa/live/delivery-verification.json |
| HTML plus referenced scripts/styles/fonts | PASS: 209/209 exact matches, no failed checks | Same report |
| Custom missing-page behavior | PASS: HTTP 404 and exact approved custom 404 body | Same report |
| Lesson canonical URL | PASS: HTTP 307 to /learn/dp-600/ingestion/ | Same report |
| Lesson browser workflow | PASS: 16/16 against real HTTPS, interception disabled | qa/live/browser-results.json |
| Legacy Fabric regression | PASS: 4/4 against real HTTPS | qa/live/legacy-browser-results.json |
| Keyboard/refresh/import/export/recovery | PASS within lesson suite | Actual Chrome interaction; isolated QA browser storage |
| Light/dark 320/390/1280, axe and overflow | PASS in all six exercised states | qa/live/axe-*.json; qa/live/ingestion-*.png |
| Legacy guided answer/bookmark and timed mock | PASS: state, order and deadline survive navigation/reset/refresh | Live legacy suite |
| Runtime errors / external lesson requests | PASS: none observed | Live lesson report |
| Raw source exclusion | PASS: PDF, input ZIP and internal source Markdown URLs return 404 | qa/live/source-exclusion.json |
| Local source/bank preservation | PASS; no prior working-file regression | Phase 0 hashes,137 unit/content tests, approved-source parity |

The 209 matches cover all 115 reader HTML routes and 94 referenced assets. They do not claim that every one of the 1,052 files was separately fetched from the live host. Every frozen local file was checked, and genuine browser tests also exercised lazy-loaded Fabric content. QA used fresh browser contexts, so real visitor browser histories were not reset or modified.

## Costs, scope and limits

No package, paid resource, binding, backend, analytics service or student-data endpoint was added. Existing amir-fabric-v1 and amir-lab-v1 history contracts remain intact; lesson state is browser-local under hansa-academy-ingestion-v1.

This is the first experience, not a complete academy. All 67 source pages / 2,724 extracted lines are structurally preserved and mapped, but scientific/visual review is limited to relevant ingestion passages and previews on pages 9/10/25/56. The other two pilots and full guide conversion remain future work; redistribution rights are not assumed. Component rationale and source verification remain in the content brief/scientific register.

Human screen reader, physical-device touch and CWV/Lighthouse are NOT RUN. Axe/viewport/keyboard tests are not WCAG certification. The standard local Turbopack build remains affected by this host's child-process issue; the approved isolated webpack/cached-font build was deployed unchanged and is now independently verified on the live host. No production runtime workaround was introduced.

## Recovery and next atomic task

The previous version 2e8528b1-8fed-4be7-9ebd-728c17c7f5ce remains the rollback reference. No rollback was executed. If recovery is needed, first recheck active version/account and target that version under the approved release recovery scope; do not rebuild a different candidate or reset local work. ROLLBACK_INTEGRATION_FILES.json preserves exact pre-feature dirty text for the three additive integration points, guarded by hashes.

Next atomic implementation task: a separately verified Warehouse/star-schema pilot, beginning with the current IDENTITY/MERGE source corrections and an inspectable learning brief. Preserve this successful release; no additional production scope is inferred from this approval.
