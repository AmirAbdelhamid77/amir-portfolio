# Hansa DP-600 Agent Delivery — 25 October 2026

## Purpose
This is a **ready-to-ingest, non-destructive handoff** for a coding agent working on the local Hansa repository. **It has not been pushed to GitHub, copied onto the user's Windows computer, sent into a live agent session, or deployed.**

## Contents and precedence

1. `inputs/HANSA_DP600_LEARNING_ACADEMY_ANALYSIS_HANDOFF_2026-10-25.zip` — PDF plus full source audit, integration plan, source registry and prior execution prompt.
2. `inputs/HANSA_DP600_WEB_CONTENT_PACK_v1.zip` — structured page/section data, original content, source traceability, visual previews, proposed activities and offline HTML demo.
3. `inputs/ingestion-pattern-interactive-demo.html` — separate, explicitly supplied example; it is also inside the second ZIP.
4. `reference_snapshots/AGENTS.md` — **snapshot for inspection/reference only**. The actual repository's AGENTS.md is canonical where present. NEVER replace it automatically.
5. `reference_snapshots/HANSA_MASTER_AGENT_REFERENCE_v1.0.md` and `CONTENT_BRIEF_TEMPLATE.yaml` — helpful supporting guides, subject to actual repository's version.
6. `instructions/AGENT_KICKOFF_PROMPT_EN.md` — exact instruction to pass to coding agent.
7. `instructions/SOURCE_GOVERNANCE_AND_UIUX_POLICY.md` — how to preserve evidence and build creative educational UX.
8. `scripts/STAGE_INTO_HANSA.ps1` — safe Windows installer (requires explicit local execution).
9. `SHA256_MANIFEST.txt` — SHA-256 for delivered input/snapshot files.

## If you work with a Windows local coding agent

A. Extract **this outer ZIP** into an ordinary working directory such as Downloads, OUTSIDE the target handoff folder.

B. Open PowerShell in the extracted delivery folder. Run:

```powershell
.\scripts\STAGE_INTO_HANSA.ps1 -RepoRoot 'D:\BeUI\amir-portfolio' -DryRun
.\scripts\STAGE_INTO_HANSA.ps1 -RepoRoot 'D:\BeUI\amir-portfolio'
```

C. Open the coding agent from the repo root and paste `instructions/AGENT_KICKOFF_PROMPT_EN.md`. Tell it the exact handoff location after staging:

`docs/agent-handoffs/dp600-learning-academy-2026-10-25/`

### Local repository safety

- The script checks `package.json`, creates a **new** handoff folder, and refuses to overwrite an existing one.
- It DOES NOT modify `/AGENTS.md`, application source, components, environment variables, Git branches or Cloudflare deployments.
- It expands BOTH input ZIPs under the new handoff folder for immediate agent reading.
- The agent must **read the repository's actual AGENTS.md first**; if missing, consult the snapshot and report it as a gap.

## Scope and approval

The agent may audit, branch and implement locally, run tests and create a preview. It must obtain explicit authorization before production deployment or publishing copyrighted source text. The handoff is a design/implementation starter, not a claim that the current Hansa repo has been audited or modified.
