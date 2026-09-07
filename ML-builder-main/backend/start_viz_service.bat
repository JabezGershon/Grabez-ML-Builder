@echo off
echo 🎨 Starting Python Visualization Service...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Check if pip is available
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip is not available
    pause
    exit /b 1
)

echo ✅ Python found, installing dependencies...
pip install -r requirements.txt

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🚀 Starting visualization service on http://localhost:5000
echo 📊 Ready to generate charts and visualizations!
echo.
echo Press Ctrl+C to stop the service
echo.

python visualization_service.py
