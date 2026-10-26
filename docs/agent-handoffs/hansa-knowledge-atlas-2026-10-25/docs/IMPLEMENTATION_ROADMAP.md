# Execution Roadmap, Work Packages and Definition of Done

This roadmap is intentionally staged to preserve Hansa. It is not a command to execute, deploy or modify production without explicit user authorization.

| Phase | Deliverables | Exit gate | Non-goal |
|---|---|---|---|
| 0. Repository & source audit | Verified `git status` / AGENTS, existing design system & routes, guide source inventory, canonical ID snapshot, current UX QA baseline | Baseline/source authority documented | Feature coding |
| 1. Knowledge model | Schema, source coverage register, TOC metadata, canonical concepts, semantic-edge approval validator, draft example | All exported published edges defensible; hierarchy never graphed | Full guide scientific approval |
| 2. Vertical slice | Peek, Explorer, Inspector, linear alternative, one scoped DP-600 concept cluster, working deep links | UAT-01/02/04/05 pass with real reviewed records | Whole-site Atlas |
| 3. Visual/interaction quality | Kumu-like focus, showcase, filters, scoped lenses, stable camera, accessible motion and mobile UX | Usability + a11y + responsiveness evidence | Decorative 3D universe |
| 4. DP-600 guide coverage | Complete source TOC/coverage matrix, more reviewed semantic edges, lesson + question mappings | Source-by-source coverage / QA transparency | Pretend all content ready |
| 5. Reusable ecosystem | Add second guide or subject slice, common adapters, collision handling, version migrations | New source integrated without core renderer rewrite | New landing page or global map |
| Later by separate approval | Global Hansa Atlas, personalized recommendations, cloud sync, editorial workbench | New review gate | Default pilot features |

## Dependency and risk order

1. Actual source and existing site inventory **before** schema claims.
2. Stable canonical IDs and taxonomy **before** drawing.
3. Evidence review **before** publishing relationships.
4. Keyboard/text flows **alongside** graph implementation, not after visual polish.
5. True resource links **before** claiming learning integration.
6. Measured mobile performance **before** expanding visual density.
7. Second-content-source import **before** declaring engine reusable.

## Recommended P1 graph fixture size

A small technically reviewed slice (for example 8–20 concepts and 8–25 semantic assertions) is an *engineering suggestion*, not a claim about the guide. Prioritize varied relation types and specific source-backed reasoning. Explicitly distinguish fixture from full content inventory.

## Agent progress / handoff discipline

At each phase, write `decision`, `modified files`, `test commands + results`, `source coverage changes`, `unresolved questions`, `rollback status`, and `next recommended phase`. Do not silently proceed through deployment, mass data transformation or new paid dependency. If build failures/contradictions arise, provide a grounded blocker and preserve original state.

## Decision records to preserve

- ADR-001: Semantic graph relationships only; TOC/catalog structurally separate.
- ADR-002: Contextual Hybrid UX; Atlas optional for normal reading.
- ADR-003: Canonical model; multi-source, multi-lens adapters.
- ADR-004: Static-first preservation of current Cloudflare route.
- ADR-005: Context-led visualization/component selection; beUI preferred candidate, not forced.
- ADR-006: Accessibility/mobile linear fallback as a core feature.
- ADR-007: Evidence-reviewed publication, independent of exam objective mapping.

Future ADRs should include alternatives and tradeoffs, implementation implications, accepted/rejected status and user approval if changing requirements.
