# START HERE — Hansa Knowledge Atlas 1.0

This is a documentation/specification handoff. **No website files were changed or deployed.**

1. Read `README_AR.md` for owner-approved Arabic summary.
2. Read `docs/MASTER_SPEC_EN.md` and `docs/CONTENT_MODEL_AND_GOVERNANCE.md` for hard product/data invariants.
3. Read `docs/UX_VISUAL_SYSTEM.md`, `docs/IMPLEMENTATION_ROADMAP.md`, `docs/DECISIONS_AND_CREATIVE_BRIEF.md` and `docs/QUALITY_GATES_AND_TESTS.md` for interaction, phases and acceptance tests.
4. Inspect `schemas/atlas-content.schema.json` and `examples/atlas-candidate-fixture.json` (test-only, **not approved for public publishing**).
5. Run `python tools/verify_handoff.py` for self-consistency and `--schema` for JSON Schema validation when `jsonschema` is installed.
6. At implementation time copy `docs/AGENT_KICKOFF_PROMPT.md` into the coding agent. Consider adding the pointer in `docs/AGENTS_MD_ADDENDUM.md` to the repository's existing `AGENTS.md`, **never blindly replace it**.
7. Start Phase 0 against the *actual* repository: verify `git status` and all repo instructions, original guide(s), existing DP-600 handoffs, routes, content, question banks and progress. No deployment until separately approved.

Critical rule: **Draw only semantic/knowledge connections, never structural links.** Catalog hierarchy belongs in TOC, filters and breadcrumbs.
