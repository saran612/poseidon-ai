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
echo [2/3] Stopping backend process on port 8000...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$conns = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 }; if ($conns) { $conns | ForEach-Object { Write-Host '  Stopping backend PID:' $_.OwningProcess; Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } } else { Write-Host '  No active process on port 8000.' }"

:: 3. Terminate any lingering processes on frontend ports (3000, 3001)
echo [3/3] Stopping frontend processes on ports 3000 and 3001...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$conns = 3000, 3001 | ForEach-Object { Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue } | Where-Object { $_.OwningProcess -gt 0 }; if ($conns) { $conns | ForEach-Object { Write-Host '  Stopping frontend PID:' $_.OwningProcess; Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } } else { Write-Host '  No active processes on ports 3000/3001.' }"

:: Fallback taskkill on netstat PIDs (if any remain)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000 :3000 :3001" ^| findstr "LISTENING"') do (
    if %%a gtr 0 taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ===================================================
echo     All POSEIDON AI services have been stopped.
echo ===================================================
echo.
