@echo off
chcp 65001 >nul
title Blood Donation Network - Startup

echo ============================================
echo   BLOOD DONATION NETWORK - STARTUP
echo ============================================
echo.

set "PROJECT_DIR=%~dp0"

echo Checking services...
netstat -ano | findstr :5000 | findstr LISTENING >nul && set BACKEND_RUNNING=1 || set BACKEND_RUNNING=0
netstat -ano | findstr :5174 | findstr LISTENING >nul && set FRONTEND_RUNNING=1 || set FRONTEND_RUNNING=0

if "%BACKEND_RUNNING%"=="1" (
    echo [OK] Backend already running on port 5000
) else (
    echo [STARTING] Backend API...
    start "Backend API" cmd /k "cd /d "%PROJECT_DIR%blood-donation-network\backend" && npm run dev"
    timeout /t 4 /nobreak >nul
)

if "%FRONTEND_RUNNING%"=="1" (
    echo [OK] Frontend already running on port 5174
) else (
    echo [STARTING] Frontend Web...
    start "Frontend Web" cmd /k "cd /d "%PROJECT_DIR%blood-donation-network\frontend" && npm run dev"
    timeout /t 4 /nobreak >nul
)

echo.
echo ============================================
echo   SERVICES STARTED
echo ============================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5174
echo.
echo Health:   http://localhost:5000/api/health
echo.

choice /C YN /M "Start Mobile Expo Server (for QR code)"
if errorlevel 2 goto skip_mobile
if errorlevel 1 goto start_mobile

:start_mobile
echo.
echo Starting Expo... Install 'Expo Go' on your phone first!
cd /d "%PROJECT_DIR%mobile"
npx expo start
pause
exit

:skip_mobile
echo.
echo You can start mobile later with: cd mobile ^&^& npx expo start
echo.
pause

