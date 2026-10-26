# Compatibility audit and conflict-resolution matrix

Actual branch: `feat/dp600-academy-ingestion-20261025`. Initial Git status contained extensive tracked and untracked work. [PRESERVATION_BASELINE.json](PRESERVATION_BASELINE.json) records status and 1,167 pre-existing file hashes, excluding dependencies/generated/Git directories. No reset/stash/branch switch/commit/deploy.

| Conflict / overlap | Decision and precedence | Repository evidence / impact |
|---|---|---|
| Package kickoff starts implementation; owner requests preparation | Current request controls; docs and validation only | No app/lib/components/content/dependency/hosting edits |
| Generic master allows hierarchy graphs; Atlas prohibits structural edges | Specialized Atlas invariant controls its canvas; TOC stays separate | Router hierarchy candidates remain valid elsewhere |
| Old entry inventory says eight nav items/no federated search | Current source supersedes dated inventory; retain history and add amendment | lib/site.ts, lib/catalogue.ts, lib/search/documents.ts, components/search |
| Proposed route migration | Preserve /learn/, /learn/catalogue/, /practice/, /practice/catalogue/ and all legacy links | Canonicalization is separate future scope |
| Statistics atlas vs new canonical graph | Reuse design/interaction lessons, not prerequisite assertions without review | components/statistics/concept-atlas.tsx embeds nodes/coordinates/prereqs without new evidence schema |
| Academy/Fabric IDs vs canonical concepts | Add reviewed crosswalk; never rewrite original/internal IDs or tags | lib/academy/ingestion.ts; lib/fabric/types.ts; content/fabric/id-map.json |
| Multiple books sharing concepts | Canonical identity plus aliases and multi-source evidence | Do not create one concept copy per book |
| Proposed module layout vs actual conventions | Future lib/atlas, content/atlas, components/atlas, scripts and tests/atlas | Match existing domain organization; no parallel CMS/framework |
| Prose sourceConceptId/targetConceptId/statement/explanation/evidence/reviewStatus vs schema | Starter canonical names: from/to/claim/rationale/evidenceRefs/editorialState | Translate at adapter boundary; no duplicate truth |
| Governance book: IDs vs schema content: pattern | Use content:book:<source>:<edition> resource IDs | A book is not automatically a semantic concept |
| QA wording approved vs governance published | Only published is public; approved is intermediate | Candidate fixture remains nonpublic |
| Fixture source marked verified vs no current scientific audit here | Preserve intake bytes; do not inherit that label as scientific review | Edge has zero evidence and cannot publish |
| Starter schema vs governance | Shape validation plus cross-record/publication gate; final schema extensions deferred | Starter alone allows missing evidence sources, empty concept support and TOC cycles |
| Missing buildVersion/mapping review/journey fields | Versioned production contract before real authoring | See ARCHITECTURE.md; no claim starter is production complete |
| Atlas progress overlay vs independent stores | Read-only overlay initially; separate future view preferences | Preserve amir-lab-v1, amir-fabric-v1, hansa-academy-ingestion-v1 and Statistics state |
| React Flow recommendation vs creative freedom | Renderer deferred pending prototype/measurement | No React Flow, D3, ELK, Dagre or chart-engine install |
| Original guide vs current technical correctness | Preserve original; derived teaching requires current primary evidence | instructions/SOURCE_GOVERNANCE_AND_UIUX_POLICY.md and Academy scientific register |
| Re-ingestion vs existing Academy extraction | Reuse registry, extracts and traceability; inspect gaps | Exact 67-page PDF exists; extraction is not full diagram/code/domain QA |
| Legacy HSE priority / landing | Latest owner preference and Atlas brief control | HSE remains legacy; no landing redesign or HSE cleanup |
| Static hosting vs dynamic editor/database | Static data builds and local QA only | next.config.ts export; wrangler.jsonc out assets/no runtime bindings |
| Extensibility vs global release | Design multi-source now; pilot DP-600 later | /learn/dp-600/atlas/ proposed only; /atlas/ and new subject tabs deferred |

Package/lock evidence: Next 16.4.3, React/DOM 19.3.0, Motion ^14.6.0, Tailwind 4, Zod ^4.6.7, lucide-react, KaTeX, clsx/tailwind-merge and Floating UI. This is not future renderer compatibility certification. No dependency/service costs added.

Historical Academy/upgrade reports remain evidence of earlier work, not fresh live verification. No Cloudflare account or deployed website verification performed here.
