# Circular Atlas release — live, 26 October 2026

Owner authorization: “Deploy the circular Atlas node update to the live Hansa
website, keeping the existing scientific approval and publication gates intact.”

Deployed to https://hansa.amir-portfolio.workers.dev/learn/dp-600/atlas/ using the
existing Cloudflare Worker `hansa`, static assets only, with no new bindings,
dependencies, paid services, backend or learner-data endpoint.

| Item | Confirmed value |
| --- | --- |
| Active version | `a132907f-f8a8-435d-9025-fea1430e939b`, 100% traffic |
| Deployment ID | `99f69a77-7004-44a8-a75e-808bebbb7d6d` |
| Cloudflare deployment timestamp | `2026-10-26T07:40:20.62512Z` |
| Previous live version / rollback | `937389a8-3e03-403d-a7a4-a75910c972c0` |
| Frozen release | `hansa-atlas-circles-63d7308aafd6` |
| Frozen artifact SHA-256 | `79d45cba48c9788ec91467734b11d9ef90de452463a919a5acdbdafea44923a8` |
| Physical files | 1,155; hashes in `RELEASE.json` |
| Existing files retained byte-for-byte | 1,040 |
| Overlay | 115 route/payload/chunk files; only 24 new/modified assets needed upload |

## Exact release scope

The live baseline was the previously frozen and deployed Academy release
`hansa-dp600-ingestion-d1eb29b03dd3`. The working tree contains substantial later
uncommitted work, so the production artifact was assembled by preserving that live
baseline and overlaying only the Atlas route subtree, the exact Academy hub and
ingestion entry routes/payloads, and their static asset dependency closure.

Published route changes:

- `/learn/dp-600/` — contextual Peek and Atlas/journey entry links.
- `/learn/dp-600/ingestion/` — existing lesson with contextual Atlas entry/return.
- `/learn/dp-600/atlas/` — circular-node renderer with the existing public projection.
- `/learn/dp-600/atlas/journey/` — existing Learn/Explore/Practice/Reflect experience.

The existing live homepage, question bank, Statistics pages and all other routes
retain their previous artifact bytes. No full deployment of the dirty working tree
was performed. No Git commit, push, reset, stash or clean occurred.

## Scientific/publication gates

**Zero concepts and zero semantic relations are published.** The 42 concepts and
49 relations remain in technical review. The live Explorer therefore shows
“Publication review is pending.” Its circular renderer is deployed and ready for
the published subset when the existing review workflow approves publication.

The release contains no review graph payload, no local-review notice and no
unpublished assertion strings. URL parameters such as `preview=1` and
`HANSA_ATLAS_REVIEW_PREVIEW=1` cannot enable the private graph. No editorial state,
reviewer identity, source record, relation ID or scientific approval gate was edited.
The ordinary journey content retains its existing behavior; it does not publish
the graph's review records.

## Executed verification

| Check | Result / evidence |
| --- | --- |
| Existing source/reference/Atlas/preservation checks | PASS before packaging; prior implementation evidence in `../qa/` |
| Previous frozen baseline hash verification | PASS for all 1,052 baseline files |
| Live baseline | PASS: 216 routes/referenced assets matched the previous artifact; `before-delivery.json` |
| Active version immediately before upload | PASS: exact rollback version at 100%; `cloudflare-before-verified.json` |
| Frozen release hashes immediately before upload | PASS: all 1,155 files; circular renderer present |
| Production asset scan | PASS: no unpublished graph claims/records; `RELEASE.json` records zero public concepts/relations |
| Wrangler dry run | PASS: no bindings; `dry-run.log` |
| Deploy | PASS, exit 0; `deploy.log`, `deploy-process.json` |
| Cloudflare active deployment | PASS, 100% on new version; `cloudflare-after.json` |
| Live delivery | PASS: 307 routes, referenced assets and new immutable chunks matched the frozen release; `after-delivery.json` |
| Local production-package browser | PASS: 1440 light and 390 dark; `local-browser.json` |
| Real HTTPS browser | PASS: 1440 light and 390 dark; `live-browser.json`, `live-1440.png`, `live-390.png` |
| Real HTTPS workflows | PASS: Academy Peek → Atlas pending gate → ingestion → journey → Atlas; existing bank and Statistics load; no horizontal overflow, page errors or missing `_next` assets |
| Public gate bypass attempt | PASS: URL preview parameters do not reveal concept nodes |
| Automated accessibility | PASS: zero Axe violations in the live Atlas main content at both exercised widths |

The earlier circular-node review build retains its separate 160-test, typecheck,
lint, true-circle/label geometry, keyboard, emulated touch, reduced-motion and
four-width browser evidence. Its review graph was not uploaded.

NOT RUN: human screen-reader and physical touch-device QA, full browser matrix,
Core Web Vitals, and new scientific/runtime validation in Fabric. No accessibility,
scientific completeness or performance certification is claimed.

## Recovery

The prior deployed version is retained as the rollback target. If recovery is
needed, first inspect the active deployment and check for later releases. The
installed Wrangler rollback syntax was checked without executing rollback:

```powershell
rtk proxy npx wrangler rollback 937389a8-3e03-403d-a7a4-a75910c972c0 --name hansa --message "Restore previous Academy release"
```

A rollback restores the previous deployed artifact; it does not reset local source
or browser progress. `RELEASE.json` preserves every file hash for redeploying the
exact new artifact. No rollback was necessary or executed.

Next atomic task: named human review of one bounded Atlas assertion plus endpoint
definitions and cited conditions, with approval/publication recorded through the
existing workflow. This deployment does not supply that approval.
