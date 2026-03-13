param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
  [int]$PollIntervalMs = 1200,
  [switch]$SkipInitialRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$resolvedProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$rawPath = Join-Path $resolvedProjectRoot "content\raw.txt"
$briefPath = Join-Path $resolvedProjectRoot "content\brief.yaml"
$logPath = Join-Path $resolvedProjectRoot "content\watch-ai.log"
$clientProfilePath = Join-Path $resolvedProjectRoot "config\client-profile.json"
$applyBriefScriptPath = Join-Path $resolvedProjectRoot "scripts\apply-brief-to-config.mjs"
$promptPath = Join-Path $resolvedProjectRoot "ai\prompt-web-generator.md"
$agentsPath = Join-Path $resolvedProjectRoot "AGENTS.md"
$cursorRulesPath = Join-Path $resolvedProjectRoot ".cursorrules"

function Assert-RequiredPath {
  param(
    [string]$Path,
    [string]$Label
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "$Label not found: $Path"
  }
}

function Get-RawFingerprint {
  if (-not (Test-Path -LiteralPath $rawPath)) {
    return ""
  }

  return (Get-FileHash -LiteralPath $rawPath -Algorithm SHA256).Hash
}

function Get-BriefFingerprint {
  if (-not (Test-Path -LiteralPath $briefPath)) {
    return ""
  }

  return (Get-FileHash -LiteralPath $briefPath -Algorithm SHA256).Hash
}

function Test-RawHasContent {
  if (-not (Test-Path -LiteralPath $rawPath)) {
    return $false
  }

  $rawContent = Get-Content -LiteralPath $rawPath -Raw
  return -not [string]::IsNullOrWhiteSpace($rawContent)
}

function Get-ClientProfile {
  if (-not (Test-Path -LiteralPath $clientProfilePath)) {
    return $null
  }

  try {
    return (Get-Content -LiteralPath $clientProfilePath -Raw | ConvertFrom-Json)
  }
  catch {
    Write-WarningSection "No se pudo leer config/client-profile.json. Se usara routing AI por fallback."
    return $null
  }
}

function New-AiRoutingDefaults {
  param([object]$Profile)

  $projectType = if ($null -ne $Profile) { [string]$Profile.projectType } else { "" }
  $referenceEnabled = ($null -ne $Profile -and $null -ne $Profile.reference -and [bool]$Profile.reference.enabled)
  $referenceWebsite = if ($null -ne $Profile -and $null -ne $Profile.reference) { [string]$Profile.reference.website } else { "" }
  $modules = if ($null -ne $Profile) { $Profile.modules } else { $null }
  $hasBackendSurface = $false
  $hasWorkflowSurface = $false
  $hasDashboardSurface = $false
  $isMarketingSurface = ($projectType -eq "Landing Page") -or $referenceEnabled

  if ($null -ne $modules) {
    $hasBackendSurface = [bool]$modules.auth -or [bool]$modules.cart -or [bool]$modules.payments -or [bool]$modules.multiTenant
    $hasWorkflowSurface = [bool]$modules.leadForm -or [bool]$modules.booking
    $hasDashboardSurface = [bool]$modules.auth -or [bool]$modules.multiTenant -or [bool]$modules.payments
  }

  if ($hasBackendSurface -or $hasWorkflowSurface) {
    return [ordered]@{
      primarySkill = "master-fullstack"
      frontendSkill = "master-frontend"
      backendSkill = "master-backend"
      escalationSkill = "master-fullstack"
      brandSkill = "brand-system"
      copySkill = "copy-positioning"
      marketingSkill = if ($isMarketingSurface) { "landing-page-director" } else { "" }
      shellSkill = "app-shell-architect"
      dashboardSkill = if ($hasDashboardSurface) { "dashboard-director" } else { "" }
      designSystemSkill = "design-system-builder"
      criticSkill = "design-critic"
      conversionSkill = if ($isMarketingSurface) { "conversion-critic" } else { "" }
      routeReason = "El proyecto tiene modulos o flujos que pueden requerir UI y backend."
      frontendOnlyWhen = "Usar master-frontend solo para layout o polish visual sin tocar logica."
      backendOnlyWhen = "Usar master-backend solo para server/data puro sin cambios UI."
      referenceMode = $referenceEnabled
      referenceWebsite = $referenceWebsite
      referenceRule = if ($referenceEnabled -and -not [string]::IsNullOrWhiteSpace($referenceWebsite)) { "Usar la referencia solo para layout, widgets, estructura y ritmo visual sin copiar marca ni contenido." } else { "Sin web de referencia activa." }
      recommendedSequence = @(
        "brand-system",
        "copy-positioning"
      ) + @($(if ($isMarketingSurface) { "landing-page-director" })) + @(
        "app-shell-architect"
      ) + @($(if ($hasDashboardSurface) { "dashboard-director" })) + @(
        "design-system-builder",
        "master-fullstack"
      ) + @($(if ($isMarketingSurface) { "conversion-critic" })) + @(
        "design-critic"
      )
      qualityBar = "premium-saleable-mobile-first"
    }
  }

  return [ordered]@{
    primarySkill = "master-frontend"
    frontendSkill = "master-frontend"
    backendSkill = "master-backend"
    escalationSkill = "master-fullstack"
    brandSkill = "brand-system"
    copySkill = "copy-positioning"
    marketingSkill = "landing-page-director"
    shellSkill = ""
    dashboardSkill = ""
    designSystemSkill = "design-system-builder"
    criticSkill = "design-critic"
    conversionSkill = "conversion-critic"
    routeReason = "El flujo principal es generar o refinar una web comercial y responsive."
    frontendOnlyWhen = "Mantener master-frontend mientras el trabajo siga siendo visual."
    backendOnlyWhen = "Usar master-backend solo para endpoints, integraciones o persistencia pura."
    referenceMode = $referenceEnabled
    referenceWebsite = $referenceWebsite
    referenceRule = if ($referenceEnabled -and -not [string]::IsNullOrWhiteSpace($referenceWebsite)) { "Usar la referencia solo para layout, widgets, estructura y ritmo visual sin copiar marca ni contenido." } else { "Sin web de referencia activa." }
    recommendedSequence = @("brand-system", "copy-positioning", "landing-page-director", "design-system-builder", "master-frontend", "conversion-critic", "design-critic")
    qualityBar = "premium-saleable-mobile-first"
  }
}

function Get-AiRoutingConfig {
  $profile = Get-ClientProfile
  $defaults = [pscustomobject](New-AiRoutingDefaults -Profile $profile)

  if ($null -eq $profile -or $null -eq $profile.automation -or $null -eq $profile.automation.aiRouting) {
    return $defaults
  }

  $merged = [ordered]@{}
  foreach ($property in $defaults.PSObject.Properties) {
    $name = $property.Name
    $defaultValue = $property.Value
    $existingValue = $profile.automation.aiRouting.PSObject.Properties[$name]

    if ($null -eq $existingValue -or $null -eq $existingValue.Value) {
      $merged[$name] = $defaultValue
      continue
    }

    if ($existingValue.Value -is [string] -and [string]::IsNullOrWhiteSpace([string]$existingValue.Value)) {
      $merged[$name] = $defaultValue
      continue
    }

    if ($existingValue.Value -is [System.Collections.IEnumerable] -and -not ($existingValue.Value -is [string])) {
      $items = @($existingValue.Value)
      if ($items.Count -eq 0) {
        $merged[$name] = $defaultValue
        continue
      }
    }

    $merged[$name] = $existingValue.Value
  }

  return [pscustomobject]$merged
}

function New-SkillRoutingInstructions {
  $routing = Get-AiRoutingConfig

  $lines = @(
    "Automatic skill routing for this run:",
    "- Primary skill: $" + [string]$routing.primarySkill,
    "- Frontend-only skill: $" + [string]$routing.frontendSkill,
    "- Backend-only skill: $" + [string]$routing.backendSkill,
    "- Escalate to: $" + [string]$routing.escalationSkill,
    "- Brand skill: $" + [string]$routing.brandSkill,
    "- Copy skill: $" + [string]$routing.copySkill,
    "- Marketing skill: $" + [string]$routing.marketingSkill,
    "- Shell skill: $" + [string]$routing.shellSkill,
    "- Dashboard skill: $" + [string]$routing.dashboardSkill,
    "- Design system skill: $" + [string]$routing.designSystemSkill,
    "- Critic skill: $" + [string]$routing.criticSkill,
    "- Conversion skill: $" + [string]$routing.conversionSkill,
    "- Reason: " + [string]$routing.routeReason,
    "- Frontend-only rule: " + [string]$routing.frontendOnlyWhen,
    "- Backend-only rule: " + [string]$routing.backendOnlyWhen,
    "- Recommended sequence: " + [string]::Join(" -> ", @($routing.recommendedSequence)),
    "- Quality bar: " + [string]$routing.qualityBar
  )

  if ([bool]$routing.referenceMode -and -not [string]::IsNullOrWhiteSpace([string]$routing.referenceWebsite)) {
    $lines += "- Reference website: " + [string]$routing.referenceWebsite
    $lines += "- Reference rule: " + [string]$routing.referenceRule
  }

  return ($lines -join "`n")
}

function Ensure-RawFile {
  $contentDir = Split-Path -Parent $rawPath
  if (-not (Test-Path -LiteralPath $contentDir)) {
    New-Item -ItemType Directory -Path $contentDir -Force | Out-Null
  }

  if (-not (Test-Path -LiteralPath $rawPath)) {
    Set-Content -LiteralPath $rawPath -Value "" -Encoding UTF8
  }

  if (-not (Test-Path -LiteralPath $logPath)) {
    Set-Content -LiteralPath $logPath -Value "" -Encoding UTF8
  }
}

function Write-LogLine {
  param([string]$Message)

  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Add-Content -LiteralPath $logPath -Value "[$timestamp] $Message" -Encoding UTF8
}

function Get-CursorAgentCommand {
  if (-not [string]::IsNullOrWhiteSpace($env:CURSOR_AGENT_COMMAND)) {
    $resolvedCommand = Get-Command $env:CURSOR_AGENT_COMMAND -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -ne $resolvedCommand) {
      return @{
        Command = $resolvedCommand.Source
        PrefixArgs = @()
      }
    }

    if (Test-Path -LiteralPath $env:CURSOR_AGENT_COMMAND) {
      return @{
        Command = (Resolve-Path -LiteralPath $env:CURSOR_AGENT_COMMAND).Path
        PrefixArgs = @()
      }
    }

    return @{
      Command = $env:CURSOR_AGENT_COMMAND
      PrefixArgs = @()
    }
  }

  $command = Get-Command "cursor-agent" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($null -ne $command) {
    return @{
      Command = $command.Source
      PrefixArgs = @()
    }
  }

  $cursorCli = Get-Command "cursor.cmd" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($null -eq $cursorCli) {
    $cursorCli = Get-Command "cursor" -ErrorAction SilentlyContinue | Select-Object -First 1
  }

  if ($null -ne $cursorCli) {
    return @{
      Command = $cursorCli.Source
      PrefixArgs = @("agent")
    }
  }

  return $null
}

function Get-CodexCommand {
  if (-not [string]::IsNullOrWhiteSpace($env:CODEX_COMMAND)) {
    $resolvedCommand = Get-Command $env:CODEX_COMMAND -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -ne $resolvedCommand) {
      return $resolvedCommand.Source
    }

    if (Test-Path -LiteralPath $env:CODEX_COMMAND) {
      return (Resolve-Path -LiteralPath $env:CODEX_COMMAND).Path
    }

    return $env:CODEX_COMMAND
  }

  $codex = Get-Command "codex.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($null -ne $codex) {
    return $codex.Source
  }

  $codex = Get-Command "codex" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($null -ne $codex) {
    return $codex.Source
  }

  return $null
}

function Get-NpmCommand {
  $npm = Get-Command "npm.cmd" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($null -ne $npm) {
    return $npm.Source
  }

  $npm = Get-Command "npm" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($null -ne $npm) {
    return $npm.Source
  }

  throw "npm was not found in PATH."
}

function Get-NodeCommand {
  $node = Get-Command "node.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($null -ne $node) {
    return $node.Source
  }

  $node = Get-Command "node" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($null -ne $node) {
    return $node.Source
  }

  throw "node was not found in PATH."
}

function Write-Section {
  param([string]$Message)

  Write-Host ""
  Write-Host "[watch-raw] $Message"
  Write-LogLine -Message $Message
}

function Write-WarningSection {
  param([string]$Message)

  Write-Host ""
  Write-Host "[watch-raw] WARNING: $Message" -ForegroundColor Yellow
  Write-LogLine -Message "WARNING: $Message"
}

function Invoke-NativeCommand {
  param(
    [string]$Command,
    [string[]]$Arguments,
    [string]$WorkingDirectory
  )

  $stdoutPath = [System.IO.Path]::GetTempFileName()
  $stderrPath = [System.IO.Path]::GetTempFileName()

  try {
    $process = Start-Process -FilePath $Command -ArgumentList $Arguments -WorkingDirectory $WorkingDirectory -Wait -PassThru -NoNewWindow -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath
    $stdoutLines = @()
    $stderrLines = @()

    if (Test-Path -LiteralPath $stdoutPath) {
      $stdoutLines = @(Get-Content -LiteralPath $stdoutPath)
    }

    if (Test-Path -LiteralPath $stderrPath) {
      $stderrLines = @(Get-Content -LiteralPath $stderrPath)
    }

    return @{
      ExitCode = $process.ExitCode
      StdOut = $stdoutLines
      StdErr = $stderrLines
    }
  }
  finally {
    Remove-Item -LiteralPath $stdoutPath, $stderrPath -ErrorAction SilentlyContinue
  }
}

function New-AgentPrompt {
  $workflowPrompt = Get-Content -LiteralPath $promptPath -Raw
  $skillRouting = New-SkillRoutingInstructions
  $instructions = @(
    "Watcher task:",
    "- Project root: $resolvedProjectRoot",
    "- Business input: content/raw.txt",
    "- Structured output: content/brief.yaml",
    "- First refresh content/brief.yaml from content/raw.txt, then refine the generated website content safely.",
    "- Preserve the current Next.js App Router structure, engines, layout, and reusable components.",
    "- Do not redesign the site, delete components, or break responsive behavior.",
    "- Reuse the existing project structure and components when generating or refreshing content.",
    "- Prefer updating content/brief.yaml as the main output. Only touch other files if the existing architecture truly requires it.",
    "- Do not break layout, spacing, headline balance, or section flow.",
    "- Maintain responsive layout on mobile and desktop.",
    "",
    "Read and follow these files before editing:",
    "- AGENTS.md"
  )

  if (Test-Path -LiteralPath $cursorRulesPath) {
    $instructions += "- .cursorrules"
  }

  $instructions += @(
    "- config/client-profile.json",
    "- ai/prompt-web-generator.md",
    "- content/raw.txt",
    "- content/brief.yaml",
    "",
    $skillRouting,
    "",
    "- Even when content/brief.yaml already matches the raw facts, sharpen the copy so it feels more premium, specific, and conversion-aware.",
    "- Keep the facts aligned with content/raw.txt while improving wording and section framing.",
    "",
    "Workflow prompt:",
    $workflowPrompt
  )

  return ($instructions -join "`n")
}

function New-CodexPrompt {
  $workflowPrompt = Get-Content -LiteralPath $promptPath -Raw
  $skillRouting = New-SkillRoutingInstructions
  $instructions = @(
    "Update only content/brief.yaml for this project.",
    "Project root: $resolvedProjectRoot",
    "",
    "Read and follow:",
    "- AGENTS.md"
  )

  if (Test-Path -LiteralPath $cursorRulesPath) {
    $instructions += "- .cursorrules"
  }

  $instructions += @(
    "- config/client-profile.json",
    "- ai/prompt-web-generator.md",
    "- content/raw.txt",
    "- content/brief.yaml",
    "",
    $skillRouting,
    "",
    "Requirements:",
    "- Keep the current visual style, theme, colors, layout, and architecture unchanged.",
    "- Improve hero headline and subtitle so they feel more original, premium, and commercially sharp.",
    "- Improve services, CTA, FAQ, and testimonials with stronger professional marketing copy.",
    "- Make FAQ answers concise, credible, and objection-driven.",
    "- Make testimonials feel specific and believable, not generic filler.",
    "- Keep titles balanced and concise.",
    "- Do not modify any file other than content/brief.yaml.",
    "",
    "Workflow prompt:",
    $workflowPrompt
  )

  return ($instructions -join "`n")
}

function Invoke-CursorAgentRefinement {
  $cursorAgentInvocation = Get-CursorAgentCommand
  if ($null -eq $cursorAgentInvocation) {
    Write-WarningSection "Cursor Agent CLI no esta disponible. Se omite el refinado y se conserva la salida de npm."
    return
  }

  $prompt = New-AgentPrompt
  $beforeFingerprint = Get-BriefFingerprint

  Write-Section "Running Cursor Agent."
  $commandArgs = @($cursorAgentInvocation.PrefixArgs) + @("-p", "--force", "--output-format", "text", $prompt)
  $result = Invoke-NativeCommand -Command $cursorAgentInvocation.Command -Arguments $commandArgs -WorkingDirectory $resolvedProjectRoot
  $afterFingerprint = Get-BriefFingerprint

  foreach ($line in @($result.StdOut) + @($result.StdErr)) {
    Write-Host $line
    Write-LogLine -Message $line
  }

  if ($result.ExitCode -ne 0) {
    Write-WarningSection "Cursor Agent termino con codigo $($result.ExitCode). El watcher seguira activo."
    return
  }

  if ($beforeFingerprint -ne $afterFingerprint -and -not [string]::IsNullOrWhiteSpace($afterFingerprint)) {
    Write-Section "Cursor Agent actualizo content/brief.yaml."
  }
  else {
    Write-WarningSection "Cursor Agent termino sin cambios reales en content/brief.yaml."
  }
}

function Invoke-CodexRefinement {
  $codexCommand = Get-CodexCommand
  if ($null -eq $codexCommand) {
    Write-WarningSection "Codex CLI no esta disponible. Se omite el refinado con OpenAI Codex."
    return
  }

  $prompt = New-CodexPrompt
  $beforeFingerprint = Get-BriefFingerprint

  Write-Section "Running OpenAI Codex."
  $commandArgs = @(
    "exec",
    "--skip-git-repo-check",
    "--dangerously-bypass-approvals-and-sandbox",
    "-C",
    $resolvedProjectRoot,
    $prompt
  )
  $result = Invoke-NativeCommand -Command $codexCommand -Arguments $commandArgs -WorkingDirectory $resolvedProjectRoot
  $afterFingerprint = Get-BriefFingerprint

  foreach ($line in @($result.StdOut) + @($result.StdErr)) {
    Write-Host $line
    Write-LogLine -Message $line
  }

  if ($result.ExitCode -ne 0) {
    Write-WarningSection "Codex termino con codigo $($result.ExitCode). El watcher seguira activo."
    return
  }

  if ($beforeFingerprint -ne $afterFingerprint -and -not [string]::IsNullOrWhiteSpace($afterFingerprint)) {
    Write-Section "OpenAI Codex actualizo content/brief.yaml."
  }
  else {
    Write-WarningSection "OpenAI Codex termino sin cambios reales en content/brief.yaml."
  }
}

function Invoke-BaseGenerationPass {
  $npmCommand = Get-NpmCommand

  Write-Section "Refreshing content/brief.yaml with npm run generate:website."
  $result = Invoke-NativeCommand -Command $npmCommand -Arguments @("run", "generate:website") -WorkingDirectory $resolvedProjectRoot

  foreach ($line in @($result.StdOut) + @($result.StdErr)) {
    Write-Host $line
    Write-LogLine -Message $line
  }

  if ($result.ExitCode -ne 0) {
    throw "npm run generate:website exited with code $($result.ExitCode)."
  }
}

function Invoke-ApplyBriefPass {
  if (-not (Test-Path -LiteralPath $applyBriefScriptPath)) {
    Write-WarningSection "No existe scripts/apply-brief-to-config.mjs. Se actualizo el brief pero no la pagina real."
    return
  }

  $nodeCommand = Get-NodeCommand

  Write-Section "Applying brief to config/site-content.json."
  $result = Invoke-NativeCommand -Command $nodeCommand -Arguments @($applyBriefScriptPath) -WorkingDirectory $resolvedProjectRoot

  foreach ($line in @($result.StdOut) + @($result.StdErr)) {
    Write-Host $line
    Write-LogLine -Message $line
  }

  if ($result.ExitCode -ne 0) {
    throw "apply-brief-to-config.mjs exited with code $($result.ExitCode)."
  }
}

function Invoke-GenerationPass {
  param([string]$Reason)

  Write-Section "Detected change ($Reason)."

  Push-Location $resolvedProjectRoot
  try {
    Invoke-BaseGenerationPass
    Invoke-CursorAgentRefinement
    Invoke-CodexRefinement
    Invoke-ApplyBriefPass
  }
  finally {
    Pop-Location
  }

  if (Test-Path -LiteralPath $briefPath) {
    Write-Host "[watch-raw] Brief ready at content/brief.yaml"
    Write-LogLine -Message "Brief ready at content/brief.yaml"
  }
}

Ensure-RawFile
Assert-RequiredPath -Path $promptPath -Label "AI workflow prompt"
Assert-RequiredPath -Path $agentsPath -Label "AGENTS.md"

$lastFingerprint = Get-RawFingerprint

Write-Host "[watch-raw] Project root: $resolvedProjectRoot"
Write-Host "[watch-raw] Watching content/raw.txt"
Write-LogLine -Message "Watcher started for $resolvedProjectRoot"
Write-LogLine -Message "Watching content/raw.txt"

if (-not $SkipInitialRun) {
  if (Test-RawHasContent) {
    try {
      Invoke-GenerationPass -Reason "startup"
    }
    catch {
      Write-LogLine -Message "ERROR: $($_.Exception.Message)"
      Write-Error $_
    }
  }
  else {
    Write-Host "[watch-raw] content/raw.txt esta vacio. Escribe el texto del negocio, guarda el archivo y el watcher correra automaticamente."
    Write-LogLine -Message "content/raw.txt esta vacio. Escribe el texto del negocio y guarda el archivo."
  }

  $lastFingerprint = Get-RawFingerprint
}

while ($true) {
  Start-Sleep -Milliseconds $PollIntervalMs
  $currentFingerprint = Get-RawFingerprint

  if ($currentFingerprint -eq $lastFingerprint) {
    continue
  }

  $lastFingerprint = $currentFingerprint

  if (-not (Test-RawHasContent)) {
    Write-Host "[watch-raw] content/raw.txt sigue vacio. Esperando contenido para regenerar."
    Write-LogLine -Message "content/raw.txt sigue vacio. Esperando contenido para regenerar."
    continue
  }

  try {
    Invoke-GenerationPass -Reason "raw.txt updated"
  }
  catch {
    Write-LogLine -Message "ERROR: $($_.Exception.Message)"
    Write-Error $_
  }
}
