# 05 — File-level execution plan and gates for the coding agent

The current user request is **to produce a plan**. The following is future agent work to be started only when the user sends `AGENT_MASTER_PROMPT.md` with the desired implementation scope. No automatic execution or Cloudflare deployment is authorized by possession of this file.

## M0 — Read-only baseline / repo safety

**Inputs:** Hansa repo, current AGENTS, old creative Skill, new spatial Skill, existing deployments, existing docs.

**Tasks:**
1. Verify exact repo and branch, `git status --porcelain=v1`, `git worktree list`, recent commits, existing owner changes and active agents.
2. Read both skill SKILL.md files, project AGENTS.md, scoped rules, styling/tokens, `package.json`, framework/static export + Cloudflare config, app route tree, existing analytics content registries.
3. Map current homepage source files and imported component wrappers (do not guess filenames); inspect dependencies beUI/Motion/D3/3D already installed.
4. Record static browser screenshot + 10-second interaction audit of actual current homepage at 1280/390, plus nav and Atlas pending state. Differentiate observed/inferred.
5. Inventory live business-critical routes, storage keys, QA gates, worktrees. Locate 27 October deployed baseline or latest verified version.

**Deliverables:** `M0_REPO_BASELINE.md`, `CURRENT_HOMEPAGE_GAP.md`, `SKILLS_ACTIVATION_LOG.md`, `FILE_OWNERSHIP.md`. **Exit:** read-only evidence, source references, no destructive commands. If conflict, `BLOCKED_CONFLICT` and no source edit.

## M1 — Four art compositions INSIDE locked Prototype C (documentation only)

**Tasks:** using both Skills, derive 4 distinct visual compositions from docs/02 (not four product directions), illustrate first-frame silhouette/eye-flow/material/camera, define one signature motion and fallback for each. Query pattern registry but select complementary 1–3 patterns, not 80 random decorations. Art-director + learning subject reviewer compare C1-C4 on *same valid demo scenario*.

**Deliverables:** four concept boards, `VISUAL_SIGNATURE_DECISION.json`, one storyboard of 9+ frames, typography/color/material/lighting token sheets, desktop/mobile composition mockups, explicit rejected alternative reasons. **Exit:** owner picks a composition (default C1 is recommendation, not unreviewed authorization to code). No landing changes.

## M2 — Isolated Visual Proof (requires new explicit approval)

**Workspace:** a safe external directory or approved separate worktree, never edits active main worktree. Mark demo as isolated and synthetic. No npm dependency install without separate permission.

**Scope:** one **fully functional** insight and miniature path: stage + real original beUI Timeline + stateful scenario + real beUI Card Dealer + a genuine source-gated Atlas Peek or honest verified list fallback. Compare robust 2.5D with 3D only when the visualization's semantics justify 3D.

**Tasks:**
1. Build the first-frame composition before polishing CSS.
2. Implement state machine and one exact synthetic dataset with tests.
3. Bind Timeline event + content+cards+Atlas context atomically and interruptibly.
4. Record card lift/arc/flip and graph focus behavior in browser.
5. Recompose 320/390/mobile and no GPU/reduced motion equivalents.
6. Capture evidence frames F0..F9 and a real 20–40-second interaction video with no cut hiding behavior.
7. Perform independent skeptical visual critique against original flat homepage; fail on generic composition.

**Deliverables:** isolated prototype folder, run commands, videos/screenshots, `M2_INTERACTION_TESTS.md`, `VISUAL_SCORE.json`, actual errors/perf baseline, approved/rejected concept rationale. **Exit:** human review and explicit approval; **NO PRODUCTION MERGE**.

## M3 — Data/content and architecture preparation (may overlap M2 only in nonconflicting docs)

**Tasks:** adapt Insight schema to canonical data IDs; build a tiny set of approved items or clearly isolated demo; vet publication flags; source map and relation type; route inventory and IA ADR; exact motion/render stack ADR; bundle/rights cost analysis; no new backend by default.

**Deliverables:** `INSIGHT_REGISTRY_ADAPTER.md`, `RELATION_PUBLICATION_CONTRACT.md`, `IA_ROUTE_CROSSWALK.md`, `RENDERING_ADR.md`, independent math fixtures and tests. **Exit:** zero fabricated edges, answer keys or publication claims. Atlas pending => list fallback instead of fake graph.

## M4 — Controlled integration (separate approval to merge)

**Tasks:** allocate exclusive file ownership, merge minimal component changes, design tokens scoped to new landing, client island boundaries for static export, preserve old routes/data/storage, ensure marketing header/metadata aligned with Hansa. Keep heavy renderer demand-loaded; avoid static export browser API calls in SSR paths. Integrate stages one at a time with diff review.

**Probable component boundaries (not assumed existing paths):** `KnowledgeLanding`, `InsightStage`, `InsightTimeline`, `InsightExperiment`, `KnowledgeCardDealer`, `KnowledgeCardReader`, `AtlasPeek`, `InsightContentAdapter`, `KnowledgeStageAtmosphere`, `KnowledgeNav`.

**Deliverables:** source diff/file map, unit integration tests, `M4_BUILD_AND_STATIC_EXPORT.md`, rollback commit plan. **Exit:** stable regression + non-flat visual gate. No deploy.

## M5 — Full test/acceptance campaign

**Test at 320, 390, 768, 1280, 1440** (desktop/tablet/mobile), physical keyboard, touch/drag, no scroll hijack, reduced-motion, no canvas/WebGL, low end device emulation, RTL/multi-line content, pause/resume, date rollover, source validity, broken routes, single active card inspector, performance and memory.

**Separate evidence:** static build, screenshot comparison, interaction recording, axe/Lighthouse where available, manual WCAG keyboard and screen-reader where available (mark NOT RUN if absent), content/science QA, stress fixture, page routes and storage. **Exit:** no blocker, weighted visual score >=85 per actual evidence, owner visually approves.

## M6 — Production release readiness (NOT deployment)

Produce `RELEASE_CANDIDATE.md` containing branch, exact changed files, tests PASS/FAIL/NOT RUN, static export artifacts, known risk, rollback instructions, demo link if provided locally, screenshots/videos, explicit request for approval to merge/deploy. **No push, commit, or deploy unless specifically approved and within owner rules.**

## M7 — Optional publish and post-release validation (new owner approval)

If and only if separately approved: deploy using repo's verified commands; re-verify live actual route, Atlas truth, date boundary, interactive motion and mobile, console and asset availability, preserve rollback. Never call production verified merely because Wrangler completed.

## Suggested ownership split (if agent orchestrates subagents)

- **Creative Director**: composition and critique, docs only, never modifies source data.
- **Motion/Front-end engineer**: isolated stage/Timeline/Card Dealer; owns scoped components.
- **Content & scientific reviewer**: insight/edge source authority, maps source IDs, no Visual QA claims.
- **A11y/performance reviewer**: independent device and fallback evidence, no art direction rewrites without request.
- **Integrator**: only owner of production file merges, keeps diff and branch status.

Do not allow two agents to simultaneously edit `AGENTS.md`, page entrypoint, dependency files, content registry or deployment config. Keep task-level file ownership ledger.

## Dependency/technology choice (ADR required)

- Default 2.5D: semantic DOM + CSS/SVG + Motion + original beUI behavior; D3 only for derived graph geometry, never data authority.
- True 3D: R3F/Three/Drei only after semantic proof, versions/license/bundle/SSR compatibility, fallback and GPU performance pilot; don't convert ordinary statistics charts to perspective 3D.
- Charts: exact SVG/2D/HTML table, chart engine as already present in repo; no fake depth distorting numeric values.
- Renderer tiers: A optimized 3D, B simplified 3D, C 2.5D, D static DOM; same core content available in all.

The Attached Skill's `r3f-spatial-scene.example.tsx` is a **template**, not pre-tested production code. Integration must pass real Next build before claims.
