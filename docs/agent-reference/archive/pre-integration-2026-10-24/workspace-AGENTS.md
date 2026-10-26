# AGENTS.md — Hansa coding-agent entry point

**READ FIRST:** `HANSA_MASTER_AGENT_REFERENCE_v1.0.md` and `CONTENT_BRIEF_TEMPLATE.yaml`. Full guide on initial onboarding; on focused follow-up tasks, use the pertinent guide sections as described in §42.

## Mission
Build Hansa as a content-faithful, accessible, educational data/analytics website: explanation → verified visualization → meaningful interaction → understanding/decision.

## Nonnegotiable order
1. Inspect real repo/config/source exports and baseline features.
2. Preserve and index all original content, including nested HTML pages, formulas, media, datasets, captions, code and references.
3. Record audience, prerequisites, misconception and a measurable learning objective per section.
4. Choose **representation before library**: text/table, comparison, chart, equation, process, graph, simulation, code trace, scrollytelling or assessment.
5. Prefer existing local components, then public/free beUI registry (`https://beui.dev/docs/ai-agents`), then a complementary library only when capability is genuinely different.
6. Prefer static and lightweight solutions. Verify Next.js static export & Cloudflare free-tier constraints before implementation.
7. Label illustrative data. Never invent measurements or misstate mathematical or Microsoft Fabric/SQL/DAX semantics. Never pretend simulated code runs on a real remote engine.
8. Include keyboard controls, reduced motion, text/data fallbacks, responsive/RTL behavior, and theme compatibility.
9. Implement atomically, run real build/tests, log what was and wasn't verified, hand off source coverage and risks.

## Source of truth
Owner's current request > actual inspected repo/content > this guide > official version-relevant docs > proposals. No hallucinated files/routes/services. Never delete or overwrite validated content without migration.

## Implementation record for every teaching visual
- Source ID; exact concept & learning objective.
- Why a visual/interaction helps more than plain text.
- Selected representation and library + overlap check.
- Data provenance and controls → derived results.
- Accessibility fallback, reset/error states and validation.

## Completion format
Provide: inventory and source coverage, affected files/routes, component/library rationale, package & service costs, test evidence (`PASS`/`FAIL`/`NOT RUN`/`BLOCKED`), visual/domain QA, caveats and next atomic task. **A successful build is not enough**.

## Constraints
- Free/open-source by default; no beUI Pro or new paid backend without approval.
- Do not add browser-only API calls in static prerender/server contexts.
- Do not expose secrets or send student data to third-party tools silently.
- Do not claim full audit of source exports unless all relevant files were actually checked.
- Avoid generic visual clutter, duplicate packages and nonfunctional demos.

## Task startup instruction
Use `CONTENT_BRIEF_TEMPLATE.yaml` for new or revised pages. For larger changes create a coverage ledger and representation decision record. Do not request avoidable approval checkpoints; proceed within verified constraints.
