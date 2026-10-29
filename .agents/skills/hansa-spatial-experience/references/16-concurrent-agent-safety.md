# 16 — Multi-agent safety, repo integrity and no-collision policy

## Situation
Hansa may already have an agent working locally on `D:\BeUI\amir-portfolio`. Installing a new Skill must not mutate active code nor replace the existing `hansa-creative-intelligence` directory. Treat prior context as background; inspect repo before modifications.

## Installation contract
- Existing skill path `.agents/skills/hansa-creative-intelligence/` is preserved untouched.
- New directory `.agents/skills/hansa-spatial-experience/` only; copy fails if destination exists.
- Root `AGENTS.md` modification is **opt-in** and additive with distinct start/end markers, previewed and only if file exists and has no uncommitted changes. Manual review of addendum preferred while local agent actively edits repo.
- Running a skills installer is not equivalent to invoking the skill in an agent. Restart agent or open new session if discovery is not refreshed.
- Installation must not run npm, modify lockfiles, deploy, edit routes or alter configuration.

## Worktrees vs directory copies
Before deciding, inspect git status, current branch and active worktree list. Isolated clone/worktree is recommended for prototypes, but creating a worktree inside existing repo without approval can still conflict with tracked data. Agree working path and branch before code editing. Only share final reviewed diffs, not unreviewed generated files.

## Conflicts
If skill name exists, stop and show diff; never overwrite. If `AGENTS.md` dirty, do not auto-append. If two agents own same file, mark BLOCKED and produce handoff documentation. No git reset, clean, checkout or deletion to 'fix' other's changes.

## Release behavior
Zero deploy by default. Build and smoke tests only after explicit scope approval; no claim that generated skill means production site updated. Report actual files copied and checks run.
