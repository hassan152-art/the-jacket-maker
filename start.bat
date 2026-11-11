@echo off
title The Jacket Maker - Dev Server
echo.
echo =====================================================
echo   THE JACKET MAKER - Starting Dev Environment
echo =====================================================
echo.

cd /d "%~dp0"

echo [1/2] Releasing ports 5000 and 5173...
powershell -Command "Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" >nul 2>&1
powershell -Command "Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo [2/2] Starting full-stack dev server...
echo.
echo   Backend  -^> http://localhost:5000
echo   Frontend -^> http://localhost:5173
echo.

node dev.js

pause
