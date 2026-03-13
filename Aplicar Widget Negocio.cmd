@echo off
setlocal
for %%I in ("%~dp0.") do set "PROJECT_PATH=%%~fI"
set "CODEX_AUTO_SKILLS=1"
set "CODEX_GLOBAL_AGENTS=C:\dev\AGENTS.md"
set "CODEX_PROJECT_ROOT=%PROJECT_PATH%"
set "CODEX_PROJECT_AGENTS=%PROJECT_PATH%\AGENTS.md"
set "GUI_PATH=%~dp0..\TOOLS\select-business-widget-preset-gui.ps1"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%GUI_PATH%" -ProjectPath "%PROJECT_PATH%"
endlocal
