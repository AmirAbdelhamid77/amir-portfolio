# Source audit — verified facts and coverage limits

## Repository access and preservation
Actual Windows access to `D:/BeUI/amir-portfolio` succeeded. The current branch and HEAD, full initial short status and **1,401 pre-existing file hashes** are recorded in `preservation/baseline.json`. The checkout was already heavily dirty: tracked edits to the homepage/layout/header/footer/configuration, and untracked Academy, Atlas, question-bank, search, design and handoff work. None was reset, staged or committed by this task. Exact originals of changed files are retained in `preservation/originals/`.

Applicable instructions: `C:/Users/amira/.codex/RTK.md`, `D:/BeUI/AGENTS.md`, repository `AGENTS.md`, active agent-reference documents. Recursive discovery under app/components/docs found no scoped active child instructions; the nested `AGENTS.md` in the Academy handoff is an archived reference snapshot. The parent's earlier “reference maintenance only” language describes its earlier task; the current owner's explicit Prototype C request authorizes this scoped implementation, never deployment.

## Verified architecture
| Concern | Inspected source | Current behavior / implication |
|---|---|---|
| Framework | `package.json`, lockfile, build | Next 16.4.3, React/DOM 19.3.0; existing Motion, Tailwind, lucide, Playwright and axe |
| Export/host | `next.config.ts`, `wrangler.jsonc` | `output: export`, trailing slash routes, unoptimized images, assets-only `out/`; keep this model |
| Shared shell | `app/layout.tsx`, header/footer, `app/globals.css` | Geist/Geist Mono, theme/accent tokens, skip link, responsive dropdown, existing focus styles |
| Prior homepage | `preservation/originals/app/page.tsx` | Already learning-first; Atlas/Learn/Practice gateways; no Work/Experience sections |
| Navigation | `lib/site.ts`, header, catalogues | Prior global Work/Learn/Practice/Services/About; homepage had a smaller Atlas/Learn/Practice list |
| Search | `app/search`, `components/search`, `lib/search`, `lib/command-search.ts` | Existing site search retained; prototype archive search is bounded to new insight records |
| Academy | `app/learn/dp-600/ingestion`, `lib/academy/ingestion.ts`, comparison pilot; `docs/dp600-academy/RELEASE_REVIEW.md` | Existing source-backed lesson is the learning destination; no second teaching engine |
| Practice | `lib/fabric/{storage,engine,data,additions}.ts`, unified-bank source and handover | Original assessed bank and imported untimed sources retain separate contracts |
| Atlas | `lib/atlas/{server,model}.ts`, `components/atlas/{peek,explorer,journey}.tsx`, editorial/extension/continuation content | Reuse canonical projection; published-only normal output; review flag remains a separate local-review feature |
| Deep links | Atlas model, practice explorer | `?view=legacy`, saved sessions, Atlas URL state/return paths stay intact |

## Prior audits and handoffs actually consulted
- `docs/agent-reference/Hansa_Master_Audit_Reorganization_Plan_v2_2026-10-24.md`: task-led IA, old-route preservation, source-first acceptance. Its Work/Services homepage recommendation is superseded by the owner's latest homepage direction.
- `HANSA_MASTER_AGENT_REFERENCE_v1.0.md`, `HANSA_ADAPTIVE_VISUALIZATION_AGENT_POLICY.md`, `CONTENT_BRIEF_TEMPLATE.yaml`, `CAPABILITY_ROUTER.yaml`: accuracy, lightweight semantic rendering, selection rubric, responsive/a11y and evidence contracts.
- `docs/knowledge-atlas/START_HERE.md`, `DP600_EXPANSION_HANDOVER.md`, implementation report and projection source: Peek → Explorer → Guided Journey; no hierarchy/membership edges masquerading as semantic assertions.
- `docs/design-system/easyui-v2/INTEGRATION_REPORT.md`: upstream packs are recommendations; the native ingestion comparison is actual source. No mockup was copied as application code.
- `docs/dp600-academy/RELEASE_REVIEW.md`: source/release limitations remain; a local implementation is not scientific certification or publication.

## Primary evidence and current component discovery
On 26 October 2026, the official Microsoft Learn [OneLake shortcuts article](https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts) was read for the three narrow claims: reference objects, deletion semantics, and Files/Table discovery. Exact subsection locators are in each canonical insight record. Original scenarios are authored teaching examples, not copied bank questions. The reviewer field denotes an agent source check, **not human publication approval**.

Live beUI MCP search and source retrieval succeeded for `timeline` and `card-dealer`. The Timeline is a draggable focused event card; Card Dealer uses deck/hand/pile, Motion arcs, measured geometry and overlay hand buttons. Both were inspected as candidate source. Neither is already installed locally. This implementation uses original semantic Hansa code inspired by the patterns, not copied upstream component code; no Pro source or license-dependent vendor code is added. Source metadata is in `COMPONENT_DECISIONS.json`.

## Deployed state — freshly checked, not inferred from memory
The web retrieval tool could not access the origin, but direct bounded HTTPS requests from the workspace succeeded. `qa/live-snapshot.json` records HTTP status, title/H1, response size and body hash for `/`, both catalogues, Fabric Atlas, `/work/`, `/experience/`. All six returned 200. The deployed home still used “Data that makes decisions visible”; the new stage was absent. Public HTTP cannot establish the deployed commit/deployment ID or account configuration, which remain unverified. No production mutation occurred.

## Source coverage ledger
| ID | Source unit | Mapped output | Coverage / uncertainty |
|---|---|---|---|
| CHAT-C | Referenced conversation `6adf136c-4d04-83e9-ae19-863313d120db` | requirements in this pack | User messages retrieved; assistant design details unavailable, no artwork/code inspected |
| MS-SHORTCUTS-REF | Learn: What are shortcuts? / internal shortcuts / caching | reference scenario + card | Narrow claims checked; not full Fabric feature certification |
| MS-SHORTCUTS-DELETE | Learn: How do shortcuts handle deletions? | deletion scenario + card | Both object and through-target operations distinguished |
| MS-SHORTCUTS-LOCATION | Learn: Lakehouse section | discovery scenario + card | Files discovery caveat retained; no claim all folders are Delta |
| HANSA-INGESTION | Canonical existing lesson route and source | learning CTA | Linked and route checked, content bytes preserved |
| HANSA-PRACTICE | Existing explorer/catalogue | practice CTA | No specific question association asserted; IDs arrays intentionally empty |
| HANSA-ATLAS | Canonical projected Atlas | existing Peek | Public projection reused; no sample graph or fabricated edges |

Coverage: **3/3 new scenario claims mapped to primary-source subsections; 3/3 new scenario records checked against those claims.** This is not 100% coverage of all historical source exports, exam objectives, question answer keys or all Atlas assertions. The raw Notion/PDF archives were not exhaustively reread. Existing answers and review statuses remain historical evidence, not newly verified facts.

## Risks carried forward
Missing imported question exhibits remain marked for later and excluded from scoring by existing code; this task does not repair them. Fine-grained Atlas mappings and human reviews remain governed by their own handoffs. No “mastered”, “complete”, “official exam”, fake streak, fake daily history or fabricated learner-position marker is introduced.
