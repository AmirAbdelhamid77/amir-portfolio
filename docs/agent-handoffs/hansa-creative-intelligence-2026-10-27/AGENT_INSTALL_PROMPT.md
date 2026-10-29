# Agent kickoff prompt — install once, then treat as standing project practice

You are operating in the **existing** Hansa repository at `D:\BeUI\amir-portfolio`, not starting a redesign or rebuild.

I am providing `Hansa_Creative_Intelligence_Skill_v1_2026-10-27.zip`. Install the reusable skill from `.agents/skills/hansa-creative-intelligence/` and integrate the bounded `AGENTS_ADDENDUM.md` into the root `AGENTS.md` **without replacing the root file**.

Before modifying files:
1. Inspect `git status`, repo `AGENTS.md`, any current design skills/policies, target directory and present concurrent agent changes. Do not overwrite or reformat existing files.
2. Preview the planned install diff; if the Skill already exists, compare versions and do not overwrite it automatically. If the AGENTS marker exists, avoid duplication.
3. Install docs only, with the smallest reversible changes. Do **not** modify application routes/components/dependencies and do **not** deploy.
4. Run the included Python structural verifier and available repository-local checks appropriate to a docs-only change; report which ran.
5. Confirm that both Codex and OpenCode can discover `.agents/skills/hansa-creative-intelligence/SKILL.md` per the installed agent's actual behavior. If you cannot test discovery in current environment, report it as NOT RUN.
6. Leave the working tree otherwise unchanged; show paths and diff summary.

Going forward, use the skill **automatically for every visual/UI/learning experience implementation**, including tasks that don't explicitly ask for D3, charts, animation, creativity or effects. This is a strong context-aware design expectation, **not** a requirement to animate every page or to invent data. Follow existing canonical content, original source, Hansa design tokens and the full project `AGENTS.md`. Prioritize site reliability, accessibility, correctness and distinctly authored interactive visual experiences over generic flat templates.
