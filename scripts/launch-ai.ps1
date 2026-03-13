param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$sanitizedProjectRoot = [string]$ProjectRoot
if ([string]::IsNullOrWhiteSpace($sanitizedProjectRoot)) {
  throw "ProjectRoot is empty."
}

$sanitizedProjectRoot = $sanitizedProjectRoot.Trim().Trim('"').TrimEnd('\', '/')
if ([string]::IsNullOrWhiteSpace($sanitizedProjectRoot)) {
  throw "ProjectRoot could not be normalized."
}

$resolvedProjectRoot = [System.IO.Path]::GetFullPath($sanitizedProjectRoot)

if (-not (Test-Path -LiteralPath $resolvedProjectRoot)) {
  throw "Project root not found: $resolvedProjectRoot"
}

$contentDir = Join-Path $resolvedProjectRoot "content"
$rawPath = Join-Path $contentDir "raw.txt"
$logPath = Join-Path $contentDir "watch-ai.log"
$watcherPath = Join-Path $resolvedProjectRoot "scripts\watch-raw.ps1"

if (-not (Test-Path -LiteralPath $contentDir)) {
  New-Item -ItemType Directory -Path $contentDir -Force | Out-Null
}

if (-not (Test-Path -LiteralPath $rawPath)) {
  Set-Content -LiteralPath $rawPath -Value "" -Encoding UTF8
}

if (-not (Test-Path -LiteralPath $logPath)) {
  Set-Content -LiteralPath $logPath -Value "" -Encoding UTF8
}

if (-not (Test-Path -LiteralPath $watcherPath)) {
  throw "Watcher not found: $watcherPath"
}

Start-Process -FilePath "notepad.exe" -ArgumentList @($rawPath) | Out-Null

$watcherArgs = @(
  "-NoExit",
  "-NoProfile",
  "-ExecutionPolicy",
  "Bypass",
  "-File",
  $watcherPath,
  "-ProjectRoot",
  $resolvedProjectRoot
)

Start-Process -FilePath "powershell.exe" -ArgumentList $watcherArgs -WorkingDirectory $resolvedProjectRoot | Out-Null
