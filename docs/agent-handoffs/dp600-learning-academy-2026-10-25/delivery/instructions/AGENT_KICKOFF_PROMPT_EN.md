# Hansa DP-600 Academy — Agent Kickoff (follow AGENTS.md)

You are the **Hansa coding agent** responsible for turning the DP-600 study guide into a genuinely effective and visually coherent learning experience. The owner has explicitly asked you to use the creativity, instructional UI/UX strategy, and context-awareness defined in `AGENTS.md`, not just to copy a book into webpage templates.

## STEP 0 — Agent rule chain (read BEFORE edits)

1. Inspect the **actual repository root's `AGENTS.md`**, plus any subdirectory-specific `AGENTS.md`. Respect the most specific applicable local instructions.
2. Inspect the repository versions of `HANSA_MASTER_AGENT_REFERENCE_v1.0.md`, `CONTENT_BRIEF_TEMPLATE.yaml`, and relevant local UI/UX design-system or visualization policies. If absent, use the included `reference_snapshots/` as explicit reference material **without overwriting existing repository files**.
3. Read this delivery's `START_HERE.md` and `instructions/SOURCE_GOVERNANCE_AND_UIUX_POLICY.md`.
4. Extract/open `inputs/HANSA_DP600_LEARNING_ACADEMY_ANALYSIS_HANDOFF_2026-10-25.zip`, and READ ALL documents, especially the full Arabic audit, source registry, and master prompt.
5. Extract/open `inputs/HANSA_DP600_WEB_CONTENT_PACK_v1.zip`. Read its README, section/page registries, scientific review queue, activity blueprints and original source page files. Open `inputs/ingestion-pattern-interactive-demo.html` in the browser, inspect its behavior, and treat it as an **illustrative prototype** rather than production-ready code.
6. Inspect actual local Hansa source code, file tree, routes, UI libraries, beUI integrations, content schemas, question bank, data assets, persistence and Cloudflare build/deploy configuration. Do not assume anything is installed or unchanged.
7. Preserve existing site state and work in a reversible branch/isolated feature slice. NO production deployment without direct approval.

## DESIGN DIRECTIVE — Think like a learning-experience architect

**Meaning -> learning outcome -> learner misconception -> representation -> interaction -> component/library -> implementation.**

For EVERY major book topic identify: source ID/page, prerequisites, exam objective, audience, target misconception, decision to be learned, best representation and why, exact user actions, correct feedback/recovery, accessible alternative, and testable outcome. **Creative thinking is mandatory, ornamental animation is not.**

Use an interactive form only when it helps the learner *predict, manipulate, compare, diagnose, decide, or transfer*. If clear prose and a good table work better, use those. Follow `AGENTS.md`'s source fidelity, beUI-first-but-not-beUI-only, accessibility, zero fabricated data, static export compatibility and representation selection policy.

Prioritize **three strong, complete pilots**, not 67 rushed PDF-like pages:
- **Ingestion Decision Lab:** Shortcut versus Mirroring versus Copy; real constraints such as freshness, duplication, source credentials, CDC support, latency and transformation requirements. Build from source pages and verify current official Microsoft docs.
- **Star Schema + Warehouse SQL Studio:** fact/dimension relationships, grain, surrogate keys, Fabric-supported `BIGINT IDENTITY`, and SQL correctness. No fake live SQL execution.
- **Direct Lake Investigation:** framing/transcoding/fallback decision flow, SQL endpoint versus OneLake security interactions, traceable trade-offs and appropriately scoped limitations.

Example lesson sequence: **Understand → Predict → Interact → Explain → Apply → Test → Reflect/Review**. Support first-time learners and advanced practice without maintaining redundant copies of lesson text. Break long content into clear, meaningful units. Label any simulation and synthetic data.

### Information architecture / navigation

Use ONE canonical lesson data model; expose views by (a) learner prerequisites, (b) official exam domains, (c) original guide chapter order. Create stable IDs, anchors and source-page links, visible completion state, easy back/forward/continue, mistake journal, accessible filters/search and cross-links to existing course labs and Fabric question bank.

**Avoid duplicate question collections**. The guide's source questions and existing Hansa Fabric question bank should remain distinguishable, with compatibility/deduplication records and original answer keys preserved. Preserve any existing Fabric courses, architecture, Hansa design language, overall navigation and progress. Do not elevate older HSE Analytics content in this unrelated initiative. A future landing page redesign is a separate project.

### Required rollout / artifacts

- P0 baseline: routes, components, content coverage, dependencies, build/deploy config, preservation risks.
- Source traceability: **all 67 pages**, all extracted lines, diagrams, tables, equations, hyperlinks and original book questions mapped, with unmapped/error counts and QA status.
- Scientific QA: original statement vs independently verified correction, official dated documentation, runtime-test status. **Do not silently replace text:** preserve original and derivative side by side.
- Proposed sitemap and active learner journey, explicit design decisions, reusable components, accessible interaction states.
- Three fully working pilot experiences, instrumented with correct answers, feedback, reset, keyboard alternative and responsive/mobile styles.
- Quality gates: no critical factual errors, no untracked source content, no question ID/data loss, no regressions, functional links/paths, keyboard + reduced motion + screen reader fallback, static build, error/empty/loading states, acceptable bundle impact.
- Final worklog: changed files, tests PASS/FAIL/NOT RUN, source coverage, issues, open risks, rollback strategy and next atomic step.

## Important boundaries

The PDF may include outdated technical claims. Read the audit's technical-corrections register but **independently verify** changes using relevant up-to-date Microsoft documentation. Historical study material is source content, not automatically true in the current product. Do not make up Fabric functionality or official exam questions.

The guide's redistribution/license rights are not verified; treat book source and PDF as internal editorial assets. Do not expose full copyrighted text or page preview images publicly until rights and attribution are reviewed. Do not claim any simulated lab executes in Microsoft Fabric without a real, authorized runtime.

Do not add paid services, accounts, Cloudflare bindings, server-side APIs or authentication as implicit requirements. When a feature needs a backend, offer a static/local-first version and identify the backend as optional. Reuse existing components, verify any beUI registry component actually exists, avoid duplicate visualization libraries, use only free/open dependencies unless approved.

## Start now

Produce `PHASE_0_BASELINE_AND_SOURCE_INVENTORY.md`, list the actual checked source paths and highest-impact problems, then implement the first clean vertical slice with tests on the working branch. Do not claim this agent received a direct upload unless these files physically exist in its accessible workspace.
