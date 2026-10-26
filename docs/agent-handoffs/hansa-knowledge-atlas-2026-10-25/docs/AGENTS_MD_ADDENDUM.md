# Suggested AGENTS.md Addendum — copy only after reviewing existing AGENTS.md

This text is **not** an instruction to overwrite existing `AGENTS.md`. The implementer should merge the smallest relevant pointer under the repo's existing agent guidelines after conflict review.

```markdown
## Hansa Knowledge Atlas (when working on Atlas / books / related learning UX)

Read `docs/agent-handoffs/Hansa_Knowledge_Atlas_Handoff_2026-10-25/README_AR.md`
and `docs/MASTER_SPEC_EN.md` inside that handoff before Atlas work; follow its
`CONTENT_MODEL_AND_GOVERNANCE.md`, `UX_VISUAL_SYSTEM.md`, and
`QUALITY_GATES_AND_TESTS.md`. If paths differ, locate the installed handoff.

Hard invariants:
- Atlas canvas edges represent **evidence-reviewed SEMANTIC/KNOWLEDGE relations ONLY**;
  book/chapter/TOC/question-bank parent-child or membership relations are catalog
  metadata and are never displayed as semantic graph edges.
- Use Contextual Hybrid UX: in-content Atlas Peek, optional immersive Explorer,
  guided learning journey. Normal pages/navigation remain usable without Atlas.
- Preserve existing route behavior, progress and question IDs. No fabricated source
  evidence, no unreviewed graph relations, no mass content replacement.
- Components, visualizations and animations must be chosen based on educational
  meaning, accessibility and performance. Evaluate current beUI.dev components,
  but do not force any library or use licensed Pro source without rights.
- Target WCAG 2.2 AA and provide a full linear/text keyboard-mobile alternative.
- Phase 0: verify repo access, git status, instructions, actual original guide and
  existing DP-600 handoffs before changing code. Deployment needs explicit approval.

This is a project-specific product contract. Record deviations in a dated ADR rather
than silently changing confirmed decisions.
```
