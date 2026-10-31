@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo           POSEIDON AI - Startup Script
echo ===================================================
echo.

:: Resolve absolute root directory
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: 1. Check Python installation
set "PYTHON_EXE=python"
if exist "%ROOT_DIR%.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%ROOT_DIR%.venv\Scripts\python.exe"
    echo [OK] Using virtual environment Python: !PYTHON_EXE!
) else if exist "%ROOT_DIR%venv\Scripts\python.exe" (
    set "PYTHON_EXE=%ROOT_DIR%venv\Scripts\python.exe"
    echo [OK] Using virtual environment Python: !PYTHON_EXE!
) else (
    where python >nul 2>&1
    if !ERRORLEVEL! neq 0 (
        echo [ERROR] Python was not found in PATH. Please install Python 3.11+.
        pause
        exit /b 1
    )
    echo [OK] Using system Python.
)

:: 2. Check Node.js / npm installation
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm was not found in PATH. Please install Node.js 18+.
    pause
    exit /b 1
)
echo [OK] Node.js and npm found.

:: 3. Identify frontend directory
set "FRONTEND_DIR="
if exist "%ROOT_DIR%frontend\package.json" (
    set "FRONTEND_DIR=%ROOT_DIR%frontend"
) else if exist "%ROOT_DIR%frontend_temp\package.json" (
    set "FRONTEND_DIR=%ROOT_DIR%frontend_temp"
) else if exist "%ROOT_DIR%ui\package.json" (
    set "FRONTEND_DIR=%ROOT_DIR%ui"
)

if "%FRONTEND_DIR%"=="" (
    echo [ERROR] Frontend directory not found.
    pause
    exit /b 1
)
echo [OK] Using frontend directory: %FRONTEND_DIR%

:: 4. Stop any existing instances to avoid port conflicts
echo.
echo Checking for previous instances on ports 8000, 3000, and 3001...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "8000, 3000, 3001 | ForEach-Object { Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 } | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }" >nul 2>&1

:: 5. Launch Backend (FastAPI on Port 8000)
echo.
echo [1/2] Launching POSEIDON Backend on http://localhost:8000 ...
start "POSEIDON-Backend" /D "%ROOT_DIR%" cmd /k "!PYTHON_EXE! -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

:: 6. Launch Frontend (React Vite on Port 3000)
echo [2/2] Launching POSEIDON Frontend on http://localhost:3000 ...
start "POSEIDON-Frontend" /D "%FRONTEND_DIR%" cmd /k "npm run dev"

:: 7. Summary
echo.
echo ===================================================
echo     POSEIDON AI Services Started Successfully!
echo ===================================================
echo.
echo   - Web Command Center (Dev):    http://localhost:3000
echo   - Integrated Server (Prod UI): http://localhost:8000
echo   - Backend REST API:            http://localhost:8000/api/v1
echo   - Interactive API Docs:        http://localhost:8000/docs
echo   - Real-time WebSocket:         ws://localhost:8000/api/v1/ws/updates
echo.
echo   To stop all services cleanly, run: stop.bat
echo ===================================================
echo.
