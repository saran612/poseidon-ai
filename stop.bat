@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo           POSEIDON AI - Shutdown Script
echo ===================================================
echo.

:: 1. Terminate windows by window title
echo [1/3] Terminating POSEIDON console windows...
taskkill /FI "WINDOWTITLE eq POSEIDON-Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq POSEIDON-Frontend*" /T /F >nul 2>&1

:: 2. Terminate any lingering process on port 8000 (Backend)
echo [2/3] Checking for processes listening on port 8000...
set "FOUND_8000=0"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    set "FOUND_8000=1"
    echo   Stopping backend process on port 8000 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)
if "!FOUND_8000!"=="0" (
    echo   No active process on port 8000.
)

:: 3. Terminate any lingering process on port 3000 (Frontend)
echo [3/3] Checking for processes listening on port 3000...
set "FOUND_3000=0"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    set "FOUND_3000=1"
    echo   Stopping frontend process on port 3000 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)
if "!FOUND_3000!"=="0" (
    echo   No active process on port 3000.
)

echo.
echo ===================================================
echo     All POSEIDON AI services have been stopped.
echo ===================================================
echo.
