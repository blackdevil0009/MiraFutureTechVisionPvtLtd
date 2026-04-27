@echo off
REM Start Backend Server
cd "%~dp0backend"

if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install fastapi uvicorn python-multipart pydantic

echo.
echo ================================
echo Starting FastAPI Backend Server
echo ================================
echo.

python main.py
pause
