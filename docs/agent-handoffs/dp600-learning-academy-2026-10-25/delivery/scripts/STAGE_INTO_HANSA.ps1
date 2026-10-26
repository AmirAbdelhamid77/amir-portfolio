# Run from an extracted delivery folder, NOT the project itself.
# Safe import only: never modifies root AGENTS.md, site code, Git, or deployments.
param(
  [Parameter(Mandatory=$true)][string]$RepoRoot,
  [switch]$DryRun
)
$ErrorActionPreference='Stop'
$repo = (Resolve-Path -LiteralPath $RepoRoot).Path
if (!(Test-Path -LiteralPath (Join-Path $repo 'package.json'))) {
  throw "Not a verified Node/Next repository (package.json missing): $repo"
}
$source = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$dest = Join-Path $repo 'docs\agent-handoffs\dp600-learning-academy-2026-10-25'
$srcTrim = $source.TrimEnd([char[]]@('\','/')) + [IO.Path]::DirectorySeparatorChar
$destFull = [IO.Path]::GetFullPath($dest)
if ($destFull.StartsWith($srcTrim, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Cannot copy a folder into itself. Extract this delivery OUTSIDE target docs/agent-handoffs."
}
if (Test-Path -LiteralPath $dest) {
  throw "Destination already exists. To preserve your prior handoff, move/rename it manually first: $dest"
}
$repoAgent = Join-Path $repo 'AGENTS.md'
Write-Host "Repository: $repo"
Write-Host "Canonical AGENTS.md exists: $(Test-Path -LiteralPath $repoAgent)"
Write-Host "New handoff destination: $dest"
if ($DryRun) { Write-Host 'DRY RUN: no files have been changed.'; exit 0 }
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Copy-Item -Path (Join-Path $source '*') -Destination $dest -Recurse -Force
$expanded = Join-Path $dest 'expanded'
New-Item -ItemType Directory -Force -Path $expanded | Out-Null
Expand-Archive -LiteralPath (Join-Path $dest 'inputs\HANSA_DP600_LEARNING_ACADEMY_ANALYSIS_HANDOFF_2026-10-25.zip') -DestinationPath (Join-Path $expanded 'academy-analysis')
Expand-Archive -LiteralPath (Join-Path $dest 'inputs\HANSA_DP600_WEB_CONTENT_PACK_v1.zip') -DestinationPath (Join-Path $expanded 'web-content-pack')
Write-Host "STAGED! Handoff: $dest"
Write-Host 'Open the coding agent from repository root, READ AGENTS.md and use instructions/AGENT_KICKOFF_PROMPT_EN.md.'
if (!(Test-Path -LiteralPath $repoAgent)) { Write-Warning 'Root AGENTS.md missing. Do NOT automatically replace/create it. See reference_snapshots/AGENTS.md and report this to the owner.' }
