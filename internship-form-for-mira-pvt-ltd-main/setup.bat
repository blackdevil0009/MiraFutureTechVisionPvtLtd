@echo off
REM Internship Application Form - Quick Start Script for Windows

echo ======================================
echo Mira Future Tech Pvt Ltd
echo Internship Application System Setup
echo ======================================
echo.

REM Check Python
echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python found
) else (
    echo [ERROR] Python not found. Please install Python 3.8+
    exit /b 1
)

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js found
) else (
    echo [ERROR] Node.js not found. Please install Node.js 14+
    exit /b 1
)

echo.
echo Setting up Backend...
cd backend

REM Create virtual environment
echo Creating Python virtual environment...
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

echo [OK] Backend setup complete
echo.

cd ..
echo Setting up Frontend...
cd frontend

REM Install Node dependencies
echo Installing Node dependencies...
call npm install

echo [OK] Frontend setup complete
echo.

echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo Next steps:
echo 1. Open two terminals
echo 2. Terminal 1 - Backend: cd backend && venv\Scripts\activate && python main.py
echo 3. Terminal 2 - Frontend: cd frontend && npm start
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause
