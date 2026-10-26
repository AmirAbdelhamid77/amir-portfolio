# Native ingestion comparison — implementation brief and VisualizationSpec

Page/source: existing `/learn/dp-600/ingestion/`, lesson `dp600-ingestion-decisions`, guide inspiration pages 9/10/25/56. All canonical teaching text remains in `lib/academy/ingestion.ts`; no original guide text is republished.

Audience: introductory/intermediate Fabric learners. Objective: compare reference, replication and retained-batch requirements without choosing a universal winner. Misconceptions: near real time is zero lag; every data access creates an ingestion copy; Copy alone performs arbitrary cleansing; permissions become automatic.

Representation: decision table, source-backed qualitative information, no quantities/units or chart. Search changes visible criteria, not their meanings or the three alternatives. Difference filter removes shared access prerequisite only; explanation says hidden prerequisites still apply. Reset restores all four criteria. Empty search result is explicit. No storage or scoring contract changes.

Design-time rubric (0–5 judgment, **not performance/learning measurements**; adaptive weights 30/25/15/15/10/5):

| Option | Correctness | Teaching | Interaction | Mobile/performance | A11y | Maintenance | Weighted /100 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Existing three static cards | 5 | 4 | 2 | 5 | 5 | 5 | 86 |
| Native table/mobile criteria + optional filters | 5 | 5 | 4 | 5 | 5 | 4 | 96 |

Both retain unchanged canonical definitions. Native comparison aligns each criterion across alternatives and lets the learner isolate freshness/limits while preserving all options. Static cards remain a viable simpler alternative. Upstream Smart Comparison requires substantial replacement of pricing/div semantics, dark tokens, filter pressed state and mobile controls; beUI virtualized Table adds unnecessary complexity for four rows. No additional library justified.

Mobile: criterion → three labeled pattern definitions; no horizontal table scroll. Desktop: table caption, column/row headers, wrapping text. Keyboard: native search/checkbox/reset/details/links, visible focus and 44px label/button targets. No custom motion; reduced-motion behavior is static. Themes: existing Tailwind semantic tokens. Relevant RTL: use text-start and no directional icons; this English route does not claim Arabic translation/RTL QA. No-JS: all text remains in HTML with explanatory notice. Print: complete table regardless of filter state.

Validation: unchanged source strings and reference IDs; filter edge cases; no source mutation; search/difference/reset/empty state; keyboard toggle; existing lesson prediction; unchanged three localStorage namespaces; static/no-JS/print; emulated 320/390/1280 and dark/light; scoped axe; screenshots; static build and initial-script byte/gzip delta. Human screen reader, physical mobile/touch and CWV remain separate checks.
