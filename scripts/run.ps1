# Windows helper for projects on FAT32/removable drives: syncs the project into a local runtime
# folder, installs dependencies there, runs Remotion, and copies finished videos back to douyin/.
param(
  [ValidateSet('preview','lint','render')][string]$Mode='render',
  [Parameter(ValueFromRemainingArguments=$true)][string[]]$ScriptArgs
)
$ErrorActionPreference='Stop'
$projectDir=Split-Path $PSScriptRoot -Parent
$runtimeDir=Join-Path $env:LOCALAPPDATA 'renwen-video-runtime'
New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
foreach ($name in @('src','explainers','public','scripts','package.json','package-lock.json','tsconfig.json','eslint.config.mjs','remotion.config.ts')) {
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
  if (-not (Test-Path -LiteralPath 'node_modules/.bin/remotion.cmd')) {
    npm install --registry=https://registry.npmjs.org --prefer-online --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
  }
  switch ($Mode) {
    'preview' { & './node_modules/.bin/remotion.cmd' studio src/index.ts }
    'lint' {
      node node_modules/eslint/bin/eslint.js src
      if ($LASTEXITCODE -ne 0) { throw 'ESLint failed.' }
      node node_modules/typescript/bin/tsc --noEmit
    }
    'render' { node scripts/render-explainer.mjs @ScriptArgs }
  }
  if ($LASTEXITCODE -ne 0) { throw "$Mode failed." }
  if ($Mode -eq 'render' -and (Test-Path -LiteralPath 'douyin')) {
    Copy-Item -Path 'douyin' -Destination $projectDir -Recurse -Force
    Write-Output "Outputs copied to $(Join-Path $projectDir 'douyin')"
  }
} finally { Pop-Location }
