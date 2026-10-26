# Active Hansa references - integration 2026-10-24

This integration updates agent instructions only. The master v1.0 and page brief
are preserved byte-for-byte; the router is v1.1 and the adaptive policy is mandatory
for visual work. See REFERENCE_INTEGRATION_REPORT_2026-10-24.md for evidence/limits.

## Active references

| Need | File in this directory | Role |
|---|---|---|
| Structure, navigation, search, UX/accessibility | Hansa_Master_Audit_Reorganization_Plan_v2_2026-10-24.md | Staged priorities and acceptance |
| Charts, simulations, visual interaction, motion | HANSA_ADAPTIVE_VISUALIZATION_AGENT_POLICY.md | Specialized selection/validation |
| Preservation, pedagogy, global safeguards | HANSA_MASTER_AGENT_REFERENCE_v1.0.md | Preserved master |
| New/revised page | CONTENT_BRIEF_TEMPLATE.yaml | Fill one per coherent module |
| Candidate tools | CAPABILITY_ROUTER.yaml | v1.1 hints, not assignments |
| Provenance/drift checks | PACKAGE_MANIFEST.json | Active hashes and intake paths |

Router paths are repository-root relative. Bare-filename references in the preserved
master resolve through this table. README_AR.md is supplied background, not another
authority. Some supplied Arabic/symbols appear damaged; check originals before
reusing public copy.

## Scope and conflict resolution

The current owner request is to inspect the project and update what the agent reads.
It does not activate every audit implementation phase. Future authorized structural
work uses v2 instead of older structure proposals or the candidate ZIP's overloaded
Learn menu. Current inspected evidence is the reality check for dated audit findings.

Global preservation, accessibility, privacy and free/static safeguards remain binding.
Within them the adaptive policy supersedes old visual/library examples: ECharts is
not compulsory, Recharts is not excluded and SVG is not obsolete. Compare correctness,
teaching, interaction, mobile/performance, accessibility and maintenance using the
policy's 30/25/15/15/10/5 weights. Historical REJECT entries in
docs/data-visualization/beui-chart-mapping.md explain prior requirements, not permanent
bans. Master section 36's generic 'do not redesign the whole site' protects unrelated
tasks, but does not veto a later explicit reorganization request. Keep the upstream
master intact rather than silently rewriting it.

## Inspected local context

- App is amir-portfolio/ from workspace root. Package declares Next 16.4.3,
  React/React DOM 19.3.0, Motion ^14.6.0 and KaTeX ^0.16.47. These are declarations,
  not a fresh compatibility/lockfile audit. No Recharts/ECharts/Plot/Visx/Mafs declared.
- next.config.ts: static export, trailing slashes, unoptimized images.
  wrangler.jsonc: hansa, out/, assets-only. This is local config evidence, not
  current Cloudflare account/deployment/pricing verification.
- lib/site.ts: eight main nav entries. /learn/ and /practice/ are currently
  visualization-specific. Proposed global catalogues are not implemented here.
- components/statistics/chart-kit.tsx provides SVG; lib/statistics/math.ts supplies
  math. components/statistics/visual-registry.tsx already maps labs/exhibits.
  Inspect loading behavior before creating another registry.
- components/data-viz/ contains chooser, chart shells, integrity and specialty views;
  components/charts/ has beUI funnel and treemap source. Reuse after semantic/a11y checks.
- components/motion/ includes command palette, number ticker and tooltip primitives.
  lib/command-search.ts alone is not evidence of federated sitewide search.
- Existing persistence keys include amir-lab-v1 and amir-fabric-v1; preserve both.
- Source roots include Data Visualization/, Comprehensive Statistics Reference/,
  sibling ../storytelling/ and the sibling merged Fabric package. Repository-only
  agents need external inputs supplied for a complete source reimport. Preserve
  generated content if raw exports are absent.

WORKSPACE_INVENTORY_2026-10-24.json enumerates relevant paths/hashes. Enumeration
does not establish full semantic source coverage or answer correctness.

## Next authorized implementation workflow

1. Recheck dirty work, source/route mappings, state schemas and baseline tests.
   Do not reset unrelated modifications.
2. Apply audit Phase 0: investigate HSE KPI definitions and Fabric count reconciliation
   before IA migration. Audit numbers remain dated until checked against current sources.
3. Add catalogues/navigation before moving URLs. Preserve query parameters, anchors,
   Arabic content, question IDs/answers and local progress.
4. Fill a page brief and VisualizationSpec for revised visuals. Compare two viable
   options including a simple/no-chart solution. Validate derived results, meaningful
   motion, reset/errors, keyboard/touch, reduced motion and text/table fallback.
5. Check current free beUI and official versioned APIs when selecting/installing
   actual components. Historical catalogues are not live registries.
6. Validate source parity, domain math, mobile/themes/accessibility, tests and static
   build. Report untested items honestly. Do not deploy during reference maintenance.

## Maintenance

Canonical working references live here for repository-only consumption. Intake
originals stay in workspace new design guide/ and the root audit. The preserved
UPSTREAM_PACKAGE_MANIFEST_v1.1.json describes upstream bytes, including its original
AGENTS.md, not our adapted one. Active PACKAGE_MANIFEST.json describes this integration.
Previous entry points/router/manifest live under archive/pre-integration-2026-10-24/
as historical evidence, never active instructions.

For newer owner inputs compare hashes/content, explicitly reconcile local decisions,
refresh active files/manifest and run node scripts/verify-agent-reference.mjs. Do not
blindly sync old intake over subsequent validated decisions.

## Current amendment — Knowledge Atlas, 2026-10-25
Read docs/knowledge-atlas/START_HERE.md (repository-root relative) for the authoritative Atlas product spec, compatibility decisions, source coverage and next-agent entry. The earlier inspected-context and next-workflow sections above are historical 24 October snapshots: current code now includes task navigation, catalogues, federated search and the DP-600 Ingestion lesson. Latest owner direction keeps HSE legacy; do not re-open resolved historical P0s as prerequisites to Atlas documentation work. Semantic-only Atlas edges specialize generic hierarchy/graph advice; TOC remains separate. No Atlas runtime implementation or deployment is authorized by this amendment. Existing DP-600 Academy handoffs and scientific QA remain applicable.
