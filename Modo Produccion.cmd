@echo off
setlocal
for %%I in ("%~dp0.") do set "PROJECT_PATH=%%~fI"
set "CODEX_AUTO_SKILLS=1"
set "CODEX_GLOBAL_AGENTS=C:\dev\AGENTS.md"
set "CODEX_PROJECT_ROOT=%PROJECT_PATH%"
set "CODEX_PROJECT_AGENTS=%PROJECT_PATH%\AGENTS.md"
set "RUNNER_PATH=%~dp0..\TOOLS\open-project-workbench.ps1"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%RUNNER_PATH%" -ProjectPath "%PROJECT_PATH%" -OpenCursor -OpenVsCode -OpenLocalhost -OpenAiWatcher -RunQuickReview
endlocal
