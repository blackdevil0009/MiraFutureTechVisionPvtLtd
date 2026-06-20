@echo off
REM Start Frontend Server
cd "%~dp0frontend"

echo Installing Node dependencies...
call npm install --legacy-peer-deps

echo.
echo ================================
echo Starting React Development Server
echo ================================
echo.

call npm start
pause
