param(
  [int]$Concurrency = 2,
  [switch]$Force,
  [switch]$DryRun
)
$ErrorActionPreference = 'Stop'
$projectDir = Split-Path $PSScriptRoot -Parent
$episodeIds = @('listen-rain', 'morning-tea', 'walk-inward', 'leave-space', 'self-kindness')

foreach ($episodeId in $episodeIds) {
  $promptFile = Join-Path $projectDir "prompts\$episodeId.jsonl"
  $outDir = Join-Path $projectDir "public\images\series\$episodeId"
  Write-Output "Generating Images2 assets for $episodeId..."
  if ($DryRun) {
    & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $projectDir 'scripts/generate.ps1') -Provider images2 -PromptFile $promptFile -OutDir $outDir -Concurrency $Concurrency -DryRun
  } else {
    & node (Join-Path $projectDir 'scripts/generate-missing-images.mjs') "--prompt-file=$promptFile" "--out-dir=$outDir" "--concurrency=$Concurrency"
  }
  if ($LASTEXITCODE -ne 0) { throw "Images2 generation failed for $episodeId." }
}
