# 01 — Skills adoption protocol: both skills, scoped and verified

## Mandatory skills

**A — Existing creative thinking:** `.agents/skills/hansa-creative-intelligence/SKILL.md` — primary creative exploration and quality discipline. Confirm the file actually exists in the current repo and read it; do not infer its contents from a previous conversation.

**B — Attached spatial companion:** `.agents/skills/hansa-spatial-experience/SKILL.md` — spatial art direction, 2.5D/3D technology routing, choreography, semantic interactions, visual critique and multi-agent safety. Source: `skills/Hansa_Spatial_Experience_v2_original.zip` inside this handoff. Its own `verify_package.py` and SHA manifest must pass.

Both must be loaded **at the start** of the agent's new working session; log which instructions were actually read. If agent syntax supports explicit skill activation, invoke `$hansa-creative-intelligence` and `$hansa-spatial-experience`; otherwise read the two `SKILL.md` files verbatim. Merely having their directories does not prove discovery/activation.

## State-safe installation policy

The user's prior Windows command output showed the new target already existed and was byte-identical to that earlier package, followed by a successful `-Apply` invocation. **Recheck** current files/versions; never assume the state today is unchanged.

1. `git status --short`, `git worktree list`, `git branch --show-current` and inspect `AGENTS.md` / active agent file ownership.
2. Read attached `README_AR.md`, `AGENT_KICKOFF_PROMPT.md`, `AGENTS_ADDENDUM.md`, `MANIFEST_SHA256.txt`, installer, and `SKILL.md`.
3. Unpack outside `D:\BeUI\amir-portfolio`, then `python verify_package.py`.
4. Compare folder hashes with existing `.agents/skills/hansa-spatial-experience/`. If identical: **NOOP**, no installation. If different: emit diff and stop for review, do not overwrite.
5. If missing: preview the PowerShell installer **without `-Apply`**, then request installation authorization if not previously granted for this version. Run `-Apply` **without `-UpdateAgents`** only with approval and no ownership conflict.
6. Keep `.agents/skills/hansa-creative-intelligence/` untouched. `AGENTS.md` addendum is opt-in, and prohibited while dirty/owned by another agent.
7. Run the installed skill's `scripts/verify_skill.py`. Re-open a fresh agent session for discovery if needed.

**Do not install npm dependencies, run deploy, edit app components, or change AGENTS.md as part of skill-only verification.**

## Which reference in which phase?

| Phase | Required skill references | Why |
|---|---|---|
| Read-only diagnosis | `01-creative-director`, `13-anti-flat-playbook`, `16-concurrent-agent-safety`, `27-skill-evaluation-battery` | Resist generic repeats; avoid collisions |
| Art direction | `02-spatial-art-direction`, `21-style-recipes`, `26-composition-systems`, `24-reference-translation` | Art-directed composition and reference interpretation |
| Stage & storyboard | `04-motion-choreography`, `18-narrative-scrollytelling`, `05-interaction-patterns` | Continuous cinematic state transitions |
| Rendering ADR | `09-technology-router`, `03-3d-scene-engineering`, `25-3d-technique-cookbook`, `14-architecture-integration` | Right tool; true 3D only if meaningful |
| Content/Atlas | `06-semantic-data-binding`, `08-hansa-use-cases`, `19-quantitative-integrity` | Source fidelity, atlas edge truth, exact charts |
| Device safety | `10-performance-budget`, `11-accessibility-mobile`, `17-assets-licensing-security` | GPU, touch, rights, accessibility |
| QA & delivery | `12-quality-gates`, `15-prototyping-experiments`, `20-delivery-contract`, `23-validation-playbook` | Browser evidence, gate status, handoff |

## Specific assets/scripts to use

- `assets/decision-record.template.json` — a written design decision per spatial hero/Timeline/Card Dealer/Atlas. No empty design justification.
- `assets/pattern-registry.json` — 80 candidate patterns. Select only 1–3 complementary ones; **do not load all patterns into production**.
- `assets/scenario-briefs.json` — 30 candidate learning scenarios; real scientific sources always outrank example labels.
- `assets/visual-review.template.md` — the visual critic's sign-off.
- `scripts/score_proposal.py` — human assessment normalized to 100. Score >=85 suggested by Skill for flagship proposal **only with evidence and no hard blockers**. It does not execute browser/QA tests.
- `scripts/verify_visual_lab.py` — structural demo validation only.
- `references/22-worked-examples.md`, Case 4 — Hansa Cinematic Landing Prototype C directly applicable; Case 1 applies to Atlas.
- `examples/spatial_visual_lab.html` — inspect modes for principles (organic, constellation, architecture), **never present as production Hansa or true 3D**.

## Conflict resolution

**Priority:** current user direction (Prototype C and documentation-first) > actual repo/AGENTS safety > verified scientific source/publishing gates > skills' optional ideas > aesthetics. The spatial skill asks for 4 divergent ideas for flagship work: comply with **four visual compositions inside the locked Prototype C journey**, not A/B/C product-level re-selection. Do not begin implementation merely because a skill advocates prototype building. The user controls authorization.

## Activation evidence

The agent's first report must explicitly quote the discovered paths, their versions if present, references loaded, whether any skills were missing, and whether any file actually changed. `INSTALLED` is not `INVOKED`; `STRUCTURAL_PASS` is not `BROWSER_TESTED`.
