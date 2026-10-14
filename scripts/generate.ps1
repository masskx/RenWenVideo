param(
  [ValidateSet('images2','doubao')][string]$Provider = 'images2',
  [string]$PromptFile = 'prompts/solitude.jsonl',
  [string]$OutDir = 'public/images',
  [int]$Concurrency = 2,
  [switch]$Force,
  [switch]$DryRun,
  [string]$SkillScript = "$env:USERPROFILE/.codex/skills/.system/imagegen/scripts/image_gen.py"
)
$ErrorActionPreference = 'Stop'
$projectDir = Split-Path $PSScriptRoot -Parent
$envFile = Join-Path $projectDir '.env'
if (Test-Path -LiteralPath $envFile) {
  foreach ($line in Get-Content -LiteralPath $envFile -Encoding UTF8) {
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$') {
      $name = $Matches[1]
      if (-not [Environment]::GetEnvironmentVariable($name, 'Process')) {
        $value = $Matches[2].Trim()
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) { $value = $value.Substring(1, $value.Length - 2) }
        [Environment]::SetEnvironmentVariable($name, $value, 'Process')
      }
    }
  }
}
Push-Location $projectDir
try {
  if ($DryRun) {
    Write-Output "Provider: $Provider"
    Write-Output "Prompt file: $PromptFile"
    Write-Output "Output directory: $OutDir"
    if ($Provider -eq 'doubao') { node scripts/generate-image.mjs "--prompt-file=$PromptFile" "--out-dir=$OutDir" --dry-run }
    else { Write-Output "Images2 uses the existing ImageGen CLI; no API call made in dry-run mode." }
    return
  }
  if ($Provider -eq 'images2') {
    if (-not $env:OPENAI_API_KEY) { throw 'Images2 requires OPENAI_API_KEY in the shell or project .env.' }
    if (-not $env:OPENAI_BASE_URL) { $env:OPENAI_BASE_URL = 'https://token.stoahayaamhsothy.com/v1' }
    if (-not (Test-Path -LiteralPath $SkillScript)) { throw "Missing imagegen CLI: $SkillScript" }
    python $SkillScript generate-batch --input $PromptFile --out-dir $OutDir --concurrency $Concurrency --max-attempts 2
  } else {
    $nodeArgs = @('scripts/generate-image.mjs', "--prompt-file=$PromptFile", "--out-dir=$OutDir", "--concurrency=$Concurrency")
    if ($Force) { $nodeArgs += '--force' }
    node @nodeArgs
  }
  if ($LASTEXITCODE -ne 0) { throw "$Provider image generation failed; inspect errors before rendering." }
} finally { Pop-Location }
