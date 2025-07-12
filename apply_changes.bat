@echo off
echo ========================================
echo    Website Changes Application Tool
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Check if changes file exists
if not exist "website_changes.json" (
    echo ERROR: website_changes.json not found!
    echo Please download the changes file from the admin panel first.
    pause
    exit /b 1
)

echo Starting application of changes...
echo.

REM Run the Python script
python apply_changes.py

echo.
echo ========================================
echo Process completed!
echo ========================================
pause 