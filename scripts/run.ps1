param(
  [ValidateSet('preview','render','batch','check','lint')][string]$Mode='render',
  [Parameter(ValueFromRemainingArguments=$true)][string[]]$ScriptArgs
)
$ErrorActionPreference='Stop'
$projectDir=Split-Path $PSScriptRoot -Parent
$runtimeDir=Join-Path $env:LOCALAPPDATA 'zen-video-runtime-20260912'
New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
foreach ($name in @('src','episodes','explainers','public','scripts','config','package.json','tsconfig.json','eslint.config.mjs','remotion.config.ts')) {
  $sourceItem=Get-Item -LiteralPath (Join-Path $projectDir $name)
  $files=if ($sourceItem.PSIsContainer) {Get-ChildItem -LiteralPath $sourceItem.FullName -Recurse -File} else {@($sourceItem)}
  foreach ($file in $files) {
    $relative=$file.FullName.Substring($projectDir.Length).TrimStart('\')
    $target=Join-Path $runtimeDir $relative
    $existing=Get-Item -LiteralPath $target -ErrorAction SilentlyContinue
    if (-not $existing -or $existing.Length -ne $file.Length -or $existing.LastWriteTimeUtc -lt $file.LastWriteTimeUtc) {
      New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
      Copy-Item -LiteralPath $file.FullName -Destination $target -Force
    }
  }
}
Push-Location $runtimeDir
try {
  $env:ZEN_EPISODE_FILES=ConvertTo-Json -InputObject @((Get-ChildItem -LiteralPath (Join-Path $projectDir 'episodes') -Filter '*.json' -File).Name) -Compress
  if (-not (Test-Path -LiteralPath 'node_modules/.bin/remotion.cmd')) {
    npm install --registry=https://registry.npmjs.org --prefer-online --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
  }
  switch ($Mode) {
    'preview' { & './node_modules/.bin/remotion.cmd' studio }
    'lint' {
      node node_modules/eslint/bin/eslint.js src
      if ($LASTEXITCODE -ne 0) { throw 'ESLint failed.' }
      node node_modules/typescript/bin/tsc --noEmit
    }
    'check' { node scripts/render.mjs --all --check }
    'batch' { node scripts/render.mjs --all @ScriptArgs }
    'render' { node scripts/render.mjs @ScriptArgs }
  }
  if ($LASTEXITCODE -ne 0) { throw "$Mode failed." }
  if ($Mode -in @('render','batch')) {
    $outputDir=Join-Path $projectDir 'out'
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
    Get-ChildItem -LiteralPath (Join-Path $runtimeDir 'out') -File | Where-Object {$_.Name -notlike '*.partial.mp4'} | Copy-Item -Destination $outputDir -Force
    Write-Output "Outputs copied to $outputDir"
  }
} finally { Pop-Location }
