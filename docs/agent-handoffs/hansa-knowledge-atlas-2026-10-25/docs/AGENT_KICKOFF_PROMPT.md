# Copy/Paste Agent Kickoff — Hansa Knowledge Atlas

You are taking ownership of the **Hansa Knowledge Atlas** initiative, starting with the existing DP-600 Guide inside my Hansa website. This is an evidence-governed, context-aware **semantic knowledge graph and learning navigation system**, not a static mind map or a new landing-page project.

## Mandatory first steps

1. Verify actual access to `D:\BeUI\amir-portfolio` (or the current repository location), identify the branch and run `git status` **before changing anything**.
2. Read all relevant `AGENTS.md` files and inspect the current design system, pages, Atlas-like components, question banks/progress paths, package versions, export configuration and deployment setup.
3. Read every file in this handoff, starting with `README_AR.md`, `docs/MASTER_SPEC_EN.md`, `docs/CONTENT_MODEL_AND_GOVERNANCE.md`, `docs/UX_VISUAL_SYSTEM.md`, `docs/QUALITY_GATES_AND_TESTS.md`, `docs/IMPLEMENTATION_ROADMAP.md`; validate `/schemas` and `/examples`.
4. Locate and read the previously staged DP-600 handoffs under `docs/agent-handoffs/` and `HANSA_DP600_WORK_STARTER_2026-10-25/` if present. Find the **original DP-600 Guide** (not just its NotebookLM mind map image). Establish source authority and a coverage inventory. Do not assume all guide content has been extracted, verified or published.
5. Verify current official Microsoft Fabric/DP-600 information when an accuracy-sensitive technical decision or claim is involved. Treat older course and website text as material to audit, not automatic scientific authority.

## Approved product decisions — preserve these

- Use the **Contextual Hybrid** pattern: embedded **Atlas Peek**, optional **Kumu-inspired Full Explorer**, and a **Guided Learning Journey**. Keep normal lesson, reading, book and practice routes first-class.
- **Draw ONLY knowledge/semantic relationships between meaningful canonical concepts. Never draw TOC, chapter-book, container, question-bank membership or other structural/catalog edges in the Atlas canvas.** Book hierarchy may be presented as metadata, breadcrumbs and a separate TOC navigator.
- All published relationships must have typed meaning, direction when relevant, conditions, explanation and real source-backed evidence. Candidate/AI-inferred links are withheld pending review.
- One canonical graph/data layer, multiple contextual lenses and book/subject scopes. Prepare for many future books, data visualization, storytelling, statistics, labs and questions without rewriting Atlas.
- Preserve all existing routes, identifiers, learning progress, question banks, content and Hansa site's normal navigation. Do not prioritize legacy HSE content merely because it was historically prominent.
- Be creative, visually exceptional and context-driven. Explore current **beUI.dev**, React Flow and other components/charts/animations. Choose them by educational value, accuracy, accessibility, license, integration effort and performance. Do **not** use charts or motion simply to decorate; no dependence on paid Pro assets by default.
- Mobile-first accessible fallback; meet WCAG 2.2 AA, honor reduced motion, provide keyboard/screen-reader path and controls independent of dragging/pinching.
- Start static-first if the repository still exports to Cloudflare Workers static assets; no infrastructure rewrite without clear justification.

## Working sequence

**Phase 0:** Produce a verified architecture/source/content inventory, findings, source coverage table, initial route/design constraints, and safe implementation plan based on actual repo state. Do not invent existing files, counts, claims or current deployment conditions.

**Phase 1:** Build/validate canonical content model and scientifically reviewed subset, including structural TOC metadata separate from semantic edge records, validators, provenance and deterministic generation.

**Phase 2:** Deliver a small vertical slice: existing DP-600 hub → contextual Peek → optional Explorer → concept/relationship Inspector → actual lesson/practice link → back with preserved context. Include a complete text-based alternative and keyboard/mobile use.

**Phase 3:** Develop polished responsive Kumu-Hybrid exploratory UI with meaningful filters, showcase, one/two-hop focus, search, related source/practice, smart visuals and accessible motion. Expand only scientifically verified graph edges.

**Phase 4:** Expand coverage of DP-600 Guide systematically and, after evidence/quality gates pass, demonstrate reusable integration with another source or future learning tab. Defer overall Hansa landing page redesign and site-wide Atlas until separately authorized.

## Agent creativity mandate

You have latitude to choose exact typography, tasteful visual treatments, responsive layouts, graph layout algorithm, node/edge visuals, animations, diagrams, simulation styles, accessible panels and libraries (including beUI.dev and other vetted free options). First analyze the concept being taught, source truth, the task and expected interaction. Consider 2–3 high-quality alternative design patterns where the choice matters, then pick and document the best one. Never compromise semantic correctness, evidence traceability, accessibility or content usability to achieve an impressive screenshot.

## Accountability and release requirements

Run tests at each gate. Report confirmed results vs assumptions vs blockers, changed files, unresolved QA, observed UX/accessibility/performance evidence, scope of reviewed content and exact paths/routes. Do not silently modify unrelated pages. Do **not** deploy to Cloudflare or perform destructive data changes unless the user explicitly authorizes that step. Preserve a rollback path and a cumulative checkpoint. On every phase transition, leave a usable, self-contained project state and progress report.

**Start by reading the handoff and conducting Phase 0 against the real repository.**
