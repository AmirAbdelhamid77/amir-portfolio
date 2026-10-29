param(
    [Parameter(Mandatory=$true)][string]$ProjectRoot,
    [switch]$Apply,
    [switch]$UpdateAgents
)

$ErrorActionPreference = 'Stop'
$source = Join-Path $PSScriptRoot '.agents\skills\hansa-creative-intelligence'
$target = Join-Path $ProjectRoot '.agents\skills\hansa-creative-intelligence'
$agents = Join-Path $ProjectRoot 'AGENTS.md'
$addendum = Join-Path $PSScriptRoot 'AGENTS_ADDENDUM.md'
$marker = '<!-- HANSA_CREATIVE_INTELLIGENCE_START -->'

if (-not (Test-Path -Path $ProjectRoot -PathType Container)) { throw "Project root not found: $ProjectRoot" }
if (-not (Test-Path -Path $source -PathType Container)) { throw "Missing packaged skill: $source" }
if (-not (Test-Path -Path $agents -PathType Leaf)) { throw "AGENTS.md not found: $agents. Refusing to create/replace it." }
if (Test-Path -Path $target) { throw "Skill target already exists: $target. Compare manually; refusing to overwrite." }
$currentAgents = Get-Content -LiteralPath $agents -Raw -Encoding UTF8
$hasMarker = $currentAgents.Contains($marker)
Write-Host "Skill source: $source"
Write-Host "Skill destination (new only): $target"
if ($UpdateAgents) {
    Write-Host $(if ($hasMarker) { 'AGENTS.md already has marker; will skip append.' } else { 'AGENTS.md: append bounded creative skill section.' })
} else {
    Write-Host 'AGENTS.md: unchanged (pass -UpdateAgents to append invocation rule).'
}
if (-not $Apply) {
    Write-Host 'DRY RUN ONLY. Pass -Apply when ready.'
    exit 0
}

$parent = Split-Path $target -Parent
New-Item -ItemType Directory -Path $parent -Force | Out-Null
Copy-Item -LiteralPath $source -Destination $target -Recurse -ErrorAction Stop
if (-not (Test-Path (Join-Path $target 'SKILL.md'))) { throw 'Skill copy verification failed.' }
if ($UpdateAgents -and -not $hasMarker) {
    $insert = [System.IO.File]::ReadAllText($addendum, [System.Text.Encoding]::UTF8)
    # Preserve existing file content; append only, do not overwrite or reformat.
    [System.IO.File]::AppendAllText($agents, "`r`n`r`n" + $insert, [System.Text.UTF8Encoding]::new($false))
}
Write-Host 'INSTALLED. Verify git diff and skill discovery in your agent session.'
