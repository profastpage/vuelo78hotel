@echo off
setlocal
for %%I in ("%~dp0.") do set "PROJECT_ROOT=%%~fI"
set "CODEX_AUTO_SKILLS=1"
set "CODEX_GLOBAL_AGENTS=C:\dev\AGENTS.md"
set "CODEX_PROJECT_ROOT=%PROJECT_ROOT%"
set "CODEX_PROJECT_AGENTS=%PROJECT_ROOT%\AGENTS.md"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { & '%PROJECT_ROOT%\scripts\launch-ai.ps1' -ProjectRoot '%PROJECT_ROOT%'; exit 0 } catch { Write-Host ''; Write-Host '[run-ai] ERROR:' $_.Exception.Message -ForegroundColor Red; Write-Host ''; Read-Host 'Presiona Enter para cerrar'; exit 1 }"
endlocal
