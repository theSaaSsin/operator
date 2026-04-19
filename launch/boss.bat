@echo off
setlocal
title B.O.S.S — Business Optimization System Service

REM Resolve project root (parent of this /launch folder)
pushd "%~dp0\.."
set "PROJECT_ROOT=%CD%"

echo.
echo  ============================================
echo   B.O.S.S — Business Optimization System Service
echo   root: %PROJECT_ROOT%
echo  ============================================
echo.

REM Find node.exe
where node >nul 2>nul
if errorlevel 1 (
  echo [!] node not found in PATH. Install Node.js or update launch\boss.vbs with a hard path.
  pause
  exit /b 1
)

echo [*] Starting server on http://localhost:4000 ...
start "" http://localhost:4000
node server.js

popd
endlocal
