@echo off
REM Quick Start Script for ML Model Application (Windows)
REM This script starts both backend and frontend

echo ================================
echo ML Model Prediction Interface
echo ================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Python version:
python --version
echo.
echo Node.js version:
node --version
echo.

REM Activate root virtual environment and install dependencies
echo.
echo Installing backend dependencies...
call .venv\Scripts\activate.bat
pip install -q -r backend\requirements.txt

REM Start backend in a new window
echo Starting backend server...
cd backend
start "ML Backend" cmd /k "..\.venv\Scripts\activate && python main.py"
cd ..

REM Install frontend dependencies if needed
echo.
echo Installing frontend dependencies...
if not exist "frontend\node_modules" (
    cd frontend
    call npm install
    cd ..
)

REM Start frontend
echo Starting frontend server...
cd frontend
start "ML Frontend" cmd /k "npm start"
cd ..

echo.
echo ================================
echo Servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo ================================
echo.
pause
